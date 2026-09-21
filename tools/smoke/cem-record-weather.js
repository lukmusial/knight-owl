#!/usr/bin/env node
/**
 * Records one clip of the cemetery's weather together: the night reveal
 * while Mr Owl walks, the storm announcing the rain from afar, the rain
 * arriving with the puddles filling and the drops hitting them, and
 * lightning over the wet ground.
 *
 *   node tools/smoke/cem-record-weather.js [--out docs/videos/cemetery-weather.mp4]
 *                                          [--port 8098] [--width 1000] [--height 700]
 *                                          [--seconds 40] [--pace 0.4]
 *
 * Boots the cemetery in headless Chrome (GPU through Metal, like
 * cem-record.js; pass --software for the rasteriser) and winds the weather
 * for the camera the way cem-record-storm.js does: one 24 s rain episode
 * 11 s in, announced by the storm 6 s before it, with the storm's own strikes
 * every 5-9 s while it rains and one more fired by hand over a full puddle.
 * Mr Owl is steered with the stick at `--pace` of full speed the whole time,
 * as in cem-record-reveal.js, so the ground and the graves come out of the
 * dark ahead of him while the weather turns; he heads for the nearest crypt,
 * then for a puddle, so he splashes through it. Encounters are held off.
 * Frames come over the DevTools screencast and are encoded with ffmpeg. No
 * sound: the screencast carries neither the thunder nor the rain.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8098));
const WIDTH = Number(opt('--width', 1000));
const HEIGHT = Number(opt('--height', 700));
const SECONDS = Number(opt('--seconds', 40));
const PACE = Number(opt('--pace', 0.4));
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/cemetery-weather.mp4'));
const KEEP = args.indexOf('--keep-frames') !== -1;
const SOFTWARE = args.indexOf('--software') !== -1;
const CRF = opt('--crf', '30');
const DEBUG = args.indexOf('--debug') !== -1;

// the take, in ms from the first frame
const RAIN_AT = 11000;          // the rain starts
const EPISODE_MS = 24000;       // and lasts this long (its fade included)
const ANNOUNCE_MS = 6000;       // the storm's first strike comes this long before the rain
const WET_STRIKE_AT = 22000;    // a strike by hand over a full puddle

const wait = ms => new Promise(r => setTimeout(r, ms));
const log = (...m) => console.log(...m);

function findChrome() {
  const cands = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
  ];
  const cache = path.join(process.env.HOME || '', '.cache', 'puppeteer', 'chrome');
  if (fs.existsSync(cache)) {
    for (const v of fs.readdirSync(cache)) {
      cands.unshift(
        path.join(cache, v, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        path.join(cache, v, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'));
    }
  }
  return cands.find(fs.existsSync);
}

/* ------------------------------------------------------------- the walk */

/**
 * Steer Mr Owl slowly along the lanes toward a target for up to maxMs,
 * stopping when he is `within` tiles of it (cem-record-reveal.js). The route
 * is A* on the lanes, re-planned every few hundred ms, and he is pushed
 * toward its next tile with the stick at PACE.
 * @param {Object} spec - { tomb: id } or { tile: {gx, gy} }
 */
async function walkToward(page, spec, within, maxMs) {
  const deadline = Date.now() + maxMs;
  let result = 'timeout';
  while (Date.now() < deadline) {
    const r = await page.evaluate((spec, within, pace) => {
      const L = ProtoCem.getLevel();
      const o = CemModel.owlPos(L);
      const from = CemModel.owlTile(L);
      let target = null;
      if (spec.tomb) { const t = L.tombs.find(t => t.id === spec.tomb); target = t && t.porch; }
      else target = spec.tile;
      if (!target) { ProtoCem.setSteer(0, 0); return { lost: true }; }
      const dist = Math.sqrt((target.gx - o.x) * (target.gx - o.x) + (target.gy - o.y) * (target.gy - o.y));
      if (dist <= within) { ProtoCem.setSteer(0, 0); return { done: true }; }
      const full = CemModel.pathTo(L, from, target);
      if (full.length && full[0].gx === from.gx && full[0].gy === from.gy) full.shift();
      const next = full.length ? full[0] : target;
      const dx = next.gx - o.x, dy = next.gy - o.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      ProtoCem.setSteer(dx / len * pace, dy / len * pace);
      return { dist: dist, steps: full.length, owl: o.x.toFixed(2) + ',' + o.y.toFixed(2), next: next.gx + ',' + next.gy };
    }, spec, within, PACE);
    if (DEBUG) log('    ' + JSON.stringify(r));
    if (r.lost) { result = 'lost'; break; }
    if (r.done) { result = 'arrived'; break; }
    await wait(120);
  }
  await page.evaluate(() => ProtoCem.setSteer(0, 0));
  return result;
}

/** The nearest puddle at least `minSteps` lane steps from Mr Owl, as a tile */
async function nearestPuddle(page, minSteps) {
  return page.evaluate(min => {
    const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
    const from = CemModel.owlTile(L);
    const all = (S.puddles || []).map(p => ({ gx: p.spec.gx, gy: p.spec.gy, d: CemModel.pathTo(L, from, p.spec).length }))
      .filter(p => p.d >= min).sort((a, b) => a.d - b.d);
    return all[0] || null;
  }, minSteps);
}

/** A strike fired by hand at the wettest puddle in view 2-6 tiles from Mr Owl, or wherever the storm would aim */
async function strikeOverWater(page) {
  const hit = await page.evaluate(() => {
    const S = ProtoCem.getScene();
    const L = ProtoCem.getLevel();
    const o = CemModel.owlPos(L);
    const view = S.cameras.main.worldView;
    const clear = (gx, gy) => IsoModel.gridToIso(gx, gy).y >= view.y + view.height * 0.33;
    let best = null;
    for (const p of S.puddles || []) {
      if (p.alpha <= 0 || p.wet < 0.5) continue;
      if (p.x < view.x + 60 || p.x > view.right - 60 || p.y < view.y || p.y > view.bottom - 40) continue;
      const d = Math.sqrt((p.spec.gx - o.x) * (p.spec.gx - o.x) + (p.spec.gy - o.y) * (p.spec.gy - o.y));
      if (d < 2 || d > 6 || !clear(p.spec.gx, p.spec.gy)) continue;
      if (!best || p.wet > best.wet) best = { gx: p.spec.gx, gy: p.spec.gy, wet: p.wet };
    }
    const s = best ? S.strikeLightning({ target: best }) : S.strikeLightning();
    return s ? { gx: s.target.gx, gy: s.target.gy, dist: Number(s.target.dist.toFixed(1)), wet: best ? best.wet.toFixed(2) : 'none', strokes: s.seq.strokes.length } : null;
  });
  log('  strike by hand over the water: ' + (hit ? 'tile ' + hit.gx + ',' + hit.gy + ' at ' + hit.dist + ' tiles (puddle ' + hit.wet + ' full), ' + hit.strokes + ' strokes' : 'nothing to hit'));
  return hit;
}

/** Log what the storm and the rain are doing, once a second, while walking `ms` toward `spec` */
async function walkAndWatch(page, spec, within, ms, t0) {
  const stop = Date.now() + ms;
  let last = '';
  const walker = spec ? walkToward(page, spec, within, ms) : wait(ms);
  while (Date.now() < stop) {
    const st = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      const ss = S.stormStats();
      const wet = (S.puddles || []).filter(p => p.alpha > 0 && p.wet > 0.5).length;
      return { fired: ss.fired, next: ss.schedule, rain: S.rainStrength.toFixed(2), wet: wet };
    });
    const line = 'fired ' + st.fired + ', rain ' + st.rain + ', ' + st.wet + ' puddles full, ' + st.next;
    if (line !== last) { log('  t+' + ((Date.now() - t0) / 1000).toFixed(1) + 's  ' + line); last = line; }
    await wait(500);
  }
  return walker;
}

/* ------------------------------------------------------------------- video */

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-weather-frames-'));
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox'].concat(SOFTWARE
      ? ['--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--enable-gpu', '--use-angle=metal'])
      .concat(['--window-size=' + WIDTH + ',' + HEIGHT, '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'])
  });
  const frames = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    page.on('pageerror', e => log('page error: ' + e));
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) log('console error: ' + m.text().slice(0, 160)); });
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Owl&action=new&level=cemetery&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 40000 });
    await wait(2500);                                                     // the ground finishes baking

    // the weather, wound for the camera: one episode RAIN_AT in, ramping
    // over 4 s and fading over 4 s, puddles full within about 8 s; the storm
    // announces it ANNOUNCE_MS before, then strikes every 5-9 s while it rains
    const plan = await page.evaluate((rainAt, episodeMs, announceMs) => {
      const S = ProtoCem.getScene(), L = ProtoCem.getLevel();
      L.graceMs = 1e9;                                                    // no fights
      CemRain.CFG.RING_RATE = 10;
      S.rainSchedule = CemRain.schedule(L.seed || 1, {
        FIRST_GAP_MIN_MS: rainAt, FIRST_GAP_MAX_MS: rainAt, EPISODE_MIN_MS: episodeMs, EPISODE_MAX_MS: episodeMs,
        RAIN_RAMP_MS: 4000, RAIN_FADE_MS: 4000, PUDDLE_FILL_MS: 5000, PUDDLE_STAGGER_MS: 3000, PUDDLE_DRY_MS: 9000,
        GAP_MIN_MS: 600000, GAP_MAX_MS: 600000
      });
      S.rainT0 = S.time.now;
      S.planStorm({ announceMinMs: announceMs, announceMaxMs: announceMs, minGapMs: 5000, maxGapMs: 9000 });
      S.tickStormSchedule();
      const from = CemModel.owlTile(L);
      const small = L.tombs.filter(t => t.size !== 'large')
        .map(t => ({ id: t.id, steps: CemModel.pathTo(L, from, t.porch).length }))
        .filter(t => t.steps > 0).sort((a, b) => a.steps - b.steps);
      const pick = small.find(t => t.steps >= 10) || small[small.length - 1];   // a crypt not already in sight of the gate
      const ep = S.rainSchedule.episodes[0];
      const st = CemStorm.strikesFor(S.storm, ep).map(s => s.kind + ' at ' + (s.at / 1000).toFixed(1) + 's');
      return { rain: (ep.start / 1000).toFixed(1) + 's to ' + (ep.end / 1000).toFixed(1) + 's', strikes: st.join(', '),
        tomb: pick ? pick.id : null, steps: pick ? pick.steps : 0 };
    }, RAIN_AT, EPISODE_MS, ANNOUNCE_MS);
    log('rain ' + plan.rain + '; strikes planned: ' + plan.strikes);

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });
    const t0 = Date.now();
    const until = at => Math.max(0, at - (Date.now() - t0));

    // 1. a dry night: he walks slowly toward the crypt and it comes up out of
    //    the dark ahead of him; the storm announces the rain from afar
    log('recording: the night reveal on the way to tomb ' + plan.tomb + ' (' + plan.steps + ' steps); the storm announces the rain');
    await walkAndWatch(page, plan.tomb ? { tomb: plan.tomb } : null, 3.5, until(RAIN_AT), t0);

    // 2. the rain arrives and the puddles fill; he walks to the nearest one
    //    and splashes through it while the drops hit the water
    log('the rain arrives; Mr Owl heads for a puddle');
    let puddle = await nearestPuddle(page, 3);
    if (puddle) log('  toward the puddle at ' + puddle.gx + ',' + puddle.gy + ' (' + puddle.d + ' steps)');
    await walkAndWatch(page, puddle ? { tile: puddle } : null, 0.6, until(WET_STRIKE_AT), t0);

    // 3. lightning over the wet ground: one by hand at a full puddle in view,
    //    the rest from the storm's own plan while it rains, and he walks on
    log('lightning over the wet ground');
    await strikeOverWater(page);
    puddle = await nearestPuddle(page, 4);
    if (puddle) log('  on toward the puddle at ' + puddle.gx + ',' + puddle.gy + ' (' + puddle.d + ' steps)');
    await walkAndWatch(page, puddle ? { tile: puddle } : null, 0.6, until(RAIN_AT + EPISODE_MS - 2000), t0);

    // 4. the rain dies away
    log('the rain fades');
    await walkAndWatch(page, null, 0, until(SECONDS * 1000), t0);

    await client.send('Page.stopScreencast');
    await wait(400);
  } catch (e) {
    log('recording stopped early: ' + e.message);
  } finally {
    await browser.close();
    server.kill();
  }

  if (frames.length < 10) { console.error('only ' + frames.length + ' frames captured'); process.exit(1); }
  log('captured ' + frames.length + ' frames over ' + (frames[frames.length - 1].ts - frames[0].ts).toFixed(1) + ' s');

  const listFile = path.join(frameDir, 'list.txt');
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const dur = i + 1 < frames.length ? Math.min(2, Math.max(0.01, frames[i + 1].ts - frames[i].ts)) : 0.1;
    list += "file '" + frames[i].file + "'\nduration " + dur.toFixed(3) + '\n';
  }
  list += "file '" + frames[frames.length - 1].file + "'\n";
  fs.writeFileSync(listFile, list);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const enc = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
    '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  if (enc.status !== 0) process.exit(enc.status || 1);
  if (!KEEP) fs.rmSync(frameDir, { recursive: true, force: true });
  const mb = (fs.statSync(OUT).size / 1048576).toFixed(1);
  log('wrote ' + path.relative(ROOT, OUT) + ' (' + mb + ' MB)');
}

main().catch(e => { console.error(e); process.exit(2); });
