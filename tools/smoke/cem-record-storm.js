#!/usr/bin/env node
/**
 * Records a short video of the cemetery thunderstorm, rain and all.
 *
 *   node tools/smoke/cem-record-storm.js [--out docs/videos/cemetery-storm.mp4]
 *                                        [--port 8096] [--width 1000] [--height 700]
 *
 * Boots the cemetery in headless Chrome (GPU through Metal, like
 * cem-record.js; pass --software for the rasteriser) and winds the weather
 * for the camera the way cem-record-rain.js does: one 22 s rain episode 13 s
 * in, announced by the storm 6 s before it. The take: a dry night at the
 * gate, the announcing strike far off, a closer one fired by hand, the rain
 * arriving and ramping while Mr Owl walks to a puddle, the storm's own
 * strikes during the rain lighting the wet ground, then the rain fading with
 * no more strikes. Everything the storm does on its own comes from its plan
 * over the rain schedule (CemStorm.plan); only the second strike is called
 * directly. Encounters are held off. Frames come over the DevTools
 * screencast and are encoded with ffmpeg. No sound: the screencast carries
 * neither the thunder nor the rain.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8096));
const WIDTH = Number(opt('--width', 1000));
const HEIGHT = Number(opt('--height', 700));
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/cemetery-storm.mp4'));
const KEEP = args.indexOf('--keep-frames') !== -1;
const SOFTWARE = args.indexOf('--software') !== -1;
const CRF = opt('--crf', '30');

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

/** Tap the furthest lit tile of the route and wait until Mr Owl stops there, or `ms` pass */
async function walkStep(page, target, ms) {
  const step = await page.evaluate(t => {
    const L = ProtoCem.getLevel();
    const from = CemModel.owlTile(L);
    if (from.gx === t.gx && from.gy === t.gy) return { there: true };
    const full = CemModel.pathTo(L, from, t);
    let pick = null;
    for (const s of full) if (CemModel.visibilityAt(L, s.gx, s.gy) > 0) pick = s;
    if (!pick) return { none: true };
    ProtoCem.onTileTap(pick.gx, pick.gy);
    return pick;
  }, target);
  if (step.there) return 'arrived';
  if (step.none) return 'blocked';
  const stop = Date.now() + ms;
  while (Date.now() < stop) {
    await wait(250);
    const s2 = await page.evaluate(p => {
      const L = ProtoCem.getLevel();
      return { there: L.owl.gx === p.gx && L.owl.gy === p.gy, walking: !!(L.owl.path && L.owl.path.length) };
    }, step);
    if (s2.there || !s2.walking) break;
  }
  return 'stepped';
}

/** A strike fired by hand on a lit tile within a range of Mr Owl, clear of the top of the view like the storm's own */
async function strikeByHand(page, range, label) {
  const hit = await page.evaluate(rg => {
    const S = ProtoCem.getScene();
    const L = ProtoCem.getLevel();
    const view = S.cameras.main.worldView;
    const cfg = CemStorm.config(rg);
    const clear = (gx, gy) => IsoModel.gridToIso(gx, gy).y >= view.y + view.height * 0.33;
    const t = CemStorm.pickTarget(L, S.stormRng, cfg, clear);
    const s = t ? S.strikeLightning({ target: t }) : null;
    return s ? { gx: s.target.gx, gy: s.target.gy, dist: Number(s.target.dist.toFixed(1)), strokes: s.seq.strokes.length, totalMs: s.seq.totalMs } : null;
  }, range);
  log('  strike by hand, ' + label + ': ' + (hit ? 'tile ' + hit.gx + ',' + hit.gy + ' at ' + hit.dist + ' tiles, ' + hit.strokes + ' strokes over ' + hit.totalMs + ' ms' : 'nothing to hit'));
  return hit;
}

/** Log what the storm and the rain are doing, once a second, while `ms` pass */
async function watch(page, ms, t0) {
  const stop = Date.now() + ms;
  let last = '';
  while (Date.now() < stop) {
    const st = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      const ss = S.stormStats();
      return { fired: ss.fired, striking: ss.striking, next: ss.schedule, rain: S.rainStrength.toFixed(2), t: Math.round(S.rainElapsed() / 1000) };
    });
    const line = 'fired ' + st.fired + ', rain ' + st.rain + ', ' + st.next;
    if (line !== last) { log('  t+' + ((Date.now() - t0) / 1000).toFixed(1) + 's  ' + line); last = line; }
    await wait(500);
  }
}

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-storm-frames-'));
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

    // the weather, wound for the camera: one 22 s episode 13 s in, ramping
    // over 4 s and fading over 4 s, puddles full within about 10 s; the storm
    // announces it 6 s before, then strikes every 4-9 s while it rains
    const plan = await page.evaluate(() => {
      const S = ProtoCem.getScene(), L = ProtoCem.getLevel();
      L.graceMs = 1e9;
      CemRain.CFG.RING_RATE = 10;
      S.rainSchedule = CemRain.schedule(L.seed || 1, {
        FIRST_GAP_MIN_MS: 13000, FIRST_GAP_MAX_MS: 13000, EPISODE_MIN_MS: 22000, EPISODE_MAX_MS: 22000,
        RAIN_RAMP_MS: 4000, RAIN_FADE_MS: 4000, PUDDLE_FILL_MS: 6000, PUDDLE_STAGGER_MS: 4000, PUDDLE_DRY_MS: 9000,
        GAP_MIN_MS: 600000, GAP_MAX_MS: 600000
      });
      S.rainT0 = S.time.now;
      S.planStorm({ announceMinMs: 6000, announceMaxMs: 6000 });
      S.tickStormSchedule();
      const ep = S.rainSchedule.episodes[0];
      const st = CemStorm.strikesFor(S.storm, ep).map(s => s.kind + ' at ' + (s.at / 1000).toFixed(1) + 's');
      return { rain: (ep.start / 1000).toFixed(1) + 's to ' + (ep.end / 1000).toFixed(1) + 's', strikes: st.join(', ') };
    });
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

    log('recording: a dry night at the gate; the storm announces the rain from afar');
    await watch(page, 9500, t0);                                          // the announcing strike at ~7 s
    await strikeByHand(page, { minDist: 2, maxDist: 3.5 }, 'close by');
    await watch(page, 3500, t0);                                          // the rain arrives at 13 s

    log('the rain ramps up; Mr Owl walks to a puddle');
    const stop = await page.evaluate(() => {
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      const from = CemModel.owlTile(L);
      const all = (S.puddles || []).map(p => ({ gx: p.spec.gx, gy: p.spec.gy, d: CemModel.pathTo(L, from, p.spec).length }))
        .filter(p => p.d > 2).sort((a, b) => a.d - b.d);
      return all[0] || null;
    });
    if (stop) {
      const deadline = Date.now() + 12000;
      while (Date.now() < deadline) {
        const how = await walkStep(page, stop, 5000);
        if (how === 'arrived') { log('  standing in the puddle at ' + stop.gx + ',' + stop.gy); break; }
        if (how === 'blocked') await wait(400);
      }
    }
    log('the storm strikes while it rains');
    await watch(page, 30000 - (Date.now() - t0) + 12000, t0);            // through the episode and its fade (ends at 35 s)
    log('the rain has gone; no more strikes');
    await watch(page, 5000, t0);

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
