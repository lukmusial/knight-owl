#!/usr/bin/env node
/**
 * Records a short clip of the cemetery's night reveal: Mr Owl walking slowly
 * along the lanes toward a crypt, then a lantern, then a wandering monster,
 * each of which comes out of the dark a little more with every step he takes
 * toward it, with a pause before each so the eye can settle on the edge of
 * what he can see.
 *
 *   node tools/smoke/cem-record-reveal.js [--out docs/videos/cemetery-reveal.mp4]
 *                                         [--port 8095] [--width 1000] [--height 700]
 *                                         [--seconds 45] [--pace 0.4]
 *
 * He is steered with the stick at `--pace` of full speed (the model scales
 * his speed with the stick), so the reveal has time to read. Same capture as
 * cem-record.js: headless Chrome rendering on the GPU through Metal (pass
 * --software to fall back), DevTools screencast frames with their own
 * timestamps, encoded by ffmpeg in real time. Encounters are switched off for
 * the walk (the model's grace timer), so nothing interrupts it and the
 * monsters are only ever seen emerging. No sound.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8095));
const WIDTH = Number(opt('--width', 1000));
const HEIGHT = Number(opt('--height', 700));
const SECONDS = Number(opt('--seconds', 45));
const PACE = Number(opt('--pace', 0.4));
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/cemetery-reveal.mp4'));
const KEEP = args.indexOf('--keep-frames') !== -1;
const SOFTWARE = args.indexOf('--software') !== -1;
const CRF = opt('--crf', '31');
const DEBUG = args.indexOf('--debug') !== -1;

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
 * stopping when he is `within` tiles of it. The route is A* on the lanes,
 * re-planned every few hundred ms (a wandering monster moves), and he is
 * pushed toward the next tile of it with the stick at PACE, so he walks at
 * a fraction of his speed and the reveal has time to read.
 * @param {Object} spec - { tomb: id } or { monster: uid } or { tile: {gx, gy} }
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
      else if (spec.monster) { const m = L.monstersByUid[spec.monster]; target = m && { gx: m.gx, gy: m.gy }; }
      else target = spec.tile;
      if (!target) { ProtoCem.setSteer(0, 0); return { lost: true }; }
      const dist = Math.sqrt((target.gx - o.x) * (target.gx - o.x) + (target.gy - o.y) * (target.gy - o.y));
      if (dist <= within) { ProtoCem.setSteer(0, 0); return { done: true }; }
      const full = CemModel.pathTo(L, from, target);
      if (full.length && full[0].gx === from.gx && full[0].gy === from.gy) full.shift();   // the route starts on his own tile
      const next = full.length ? full[0] : target;
      const dx = next.gx - o.x, dy = next.gy - o.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      ProtoCem.setSteer(dx / len * pace, dy / len * pace);
      return { dist: dist, steps: full.length, owl: o.x.toFixed(2) + ',' + o.y.toFixed(2), next: next.gx + ',' + next.gy, busy: ProtoCem.isBusy() };
    }, spec, within, PACE);
    if (DEBUG) log('    ' + JSON.stringify(r));
    if (r.lost) { result = 'lost'; break; }
    if (r.done) { result = 'arrived'; break; }
    await wait(120);
  }
  await page.evaluate(() => ProtoCem.setSteer(0, 0));
  return result;
}

/* ------------------------------------------------------------------- video */

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-reveal-frames-'));
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox'].concat(SOFTWARE
      ? ['--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--enable-gpu', '--use-angle=metal'])
      .concat(['--window-size=' + WIDTH + ',' + HEIGHT, '--autoplay-policy=no-user-gesture-required',
               '--hide-scrollbars'])
  });
  const frames = [];
  const started = Date.now();
  const left = () => SECONDS * 1000 - (Date.now() - started);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    page.on('pageerror', e => log('page error: ' + e));
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) log('console error: ' + m.text().slice(0, 160)); });
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Owl&action=new&level=cemetery&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 40000 });

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

    log('recording');
    await wait(2000);                                      // at the gate

    const plan = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      L.graceMs = 1e9;                                     // no fights: the monsters are only ever approached
      const from = CemModel.owlTile(L);
      const small = L.tombs.filter(t => t.size !== 'large')
        .map(t => ({ id: t.id, steps: CemModel.pathTo(L, from, t.porch).length }))
        .filter(t => t.steps > 0).sort((a, b) => a.steps - b.steps);
      // the nearest crypt that is not already in sight of the gate
      const pick = small.find(t => t.steps >= 10) || small[small.length - 1];
      return { tomb: pick ? pick.id : null, steps: pick ? pick.steps : 0 };
    });

    // 1. the nearest crypt, slowly: it stands up out of the dark ahead of him
    if (plan.tomb) {
      log('  toward tomb ' + plan.tomb + ' (' + plan.steps + ' steps)');
      await walkToward(page, { tomb: plan.tomb }, 4.8, Math.min(22000, left() - 20000));
      await wait(1500);                                    // a pause: the crypt half out of the dark
      await walkToward(page, { tomb: plan.tomb }, 0.8, Math.min(7000, left() - 17000));
      await wait(1500);
    }

    // 2. a lantern he has not been near: its lit disc is there from the start,
    //    the dark ground and graves between him and it come up as he walks
    const lantern = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      const o = CemModel.owlPos(L);
      const from = CemModel.owlTile(L);
      let best = null;
      for (const l of L.lights) {
        const d = Math.sqrt((l.gx - o.x) * (l.gx - o.x) + (l.gy - o.y) * (l.gy - o.y));
        if (d < 10 || d > 20) continue;
        // the lane tile nearest the post
        let tile = null, td = 99;
        for (const t of L.tiles) {
          if (!t.walk) continue;
          const dd = Math.abs(t.gx - l.gx) + Math.abs(t.gy - l.gy);
          if (dd < td) { td = dd; tile = t; }
        }
        if (!tile) continue;
        const steps = CemModel.pathTo(L, from, { gx: tile.gx, gy: tile.gy }).length;
        if (steps > 0 && steps < 22 && (!best || steps < best.steps)) best = { tile: { gx: tile.gx, gy: tile.gy }, steps: steps };
      }
      return best;
    });
    if (lantern) {
      log('  toward a lantern (' + lantern.steps + ' steps)');
      await walkToward(page, { tile: lantern.tile }, 1.2, Math.min(9000, left() - 11000));
      await wait(1200);
    }

    // 3. the nearest wanderer: stop while it is still half in the dark, then step in
    const monster = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      const from = CemModel.owlTile(L);
      let best = null;
      for (const m of L.monsters) {
        if (m.defeated || m.role !== 'wander') continue;      // not a tomb guardian: those stand in a lit doorway
        const steps = CemModel.pathTo(L, from, { gx: m.gx, gy: m.gy }).length;
        if (steps > 0 && (!best || steps < best.steps)) best = { uid: m.uid, id: m.id, steps: steps };
      }
      return best;
    });
    if (monster) {
      log('  toward the ' + monster.id + ' (' + monster.steps + ' steps)');
      const how = await walkToward(page, { monster: monster.uid }, 5.2, Math.max(3000, left() - 5500));
      log('    ' + how + ', pausing at the edge of the dark');
      await wait(1500);
      await walkToward(page, { monster: monster.uid }, 2.4, Math.max(2500, left() - 1500));
    }
    await wait(Math.max(800, Math.min(2200, left())));

    await client.send('Page.stopScreencast');
    await wait(400);
  } catch (e) {
    log('recording stopped early: ' + e.message);
  } finally {
    await browser.close();
    server.kill();
  }

  if (frames.length < 10) { console.error('only ' + frames.length + ' frames captured'); process.exit(1); }
  log('captured ' + frames.length + ' frames over ' +
    (frames[frames.length - 1].ts - frames[0].ts).toFixed(1) + ' s');

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
