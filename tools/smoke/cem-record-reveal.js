#!/usr/bin/env node
/**
 * Records a short clip of the cemetery's night reveal: Mr Owl walking the
 * lanes toward graves, a crypt and a wandering monster, which come out of the
 * dark a little more with every step he takes toward them, with a pause or
 * two so the eye can settle on the edge of what he can see.
 *
 *   node tools/smoke/cem-record-reveal.js [--out docs/videos/cemetery-reveal.mp4]
 *                                         [--port 8095] [--width 1000] [--height 700]
 *                                         [--seconds 40]
 *
 * Same capture as cem-record.js: headless Chrome rendering on the GPU through
 * Metal (pass --software to fall back), DevTools screencast frames with their
 * own timestamps, encoded by ffmpeg in real time. Encounters are switched off
 * for the walk (the model's grace timer), so nothing interrupts it and the
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
const SECONDS = Number(opt('--seconds', 40));
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/cemetery-reveal.mp4'));
const KEEP = args.indexOf('--keep-frames') !== -1;
const SOFTWARE = args.indexOf('--software') !== -1;
const CRF = opt('--crf', '31');

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
 * Tap Mr Owl along the lanes toward a target for up to maxMs, stopping when
 * he is `within` tiles of it. The target is looked up afresh on every tap,
 * so a wandering monster can be followed. A tap needs a lit tile on the way
 * (that is the rule of the game), so when nothing on the route is lit yet he
 * is steered toward the next step instead.
 * @param {Object} spec - { tomb: id } or { monster: uid } or { tile: {gx, gy} }
 */
async function walkToward(page, spec, within, maxMs) {
  const deadline = Date.now() + maxMs;
  let last = null;
  while (Date.now() < deadline) {
    const r = await page.evaluate((spec, within) => {
      const L = ProtoCem.getLevel();
      const o = CemModel.owlPos(L);
      const from = CemModel.owlTile(L);
      let target = null;
      if (spec.tomb) { const t = L.tombs.find(t => t.id === spec.tomb); target = t && t.porch; }
      else if (spec.monster) { const m = L.monstersByUid[spec.monster]; target = m && { gx: m.gx, gy: m.gy }; }
      else target = spec.tile;
      if (!target) return { lost: true };
      const dist = Math.sqrt((target.gx - o.x) * (target.gx - o.x) + (target.gy - o.y) * (target.gy - o.y));
      if (dist <= within) { CemModel.setPath(L, []); ProtoCem.setSteer(0, 0); return { done: true, dist: dist }; }
      const full = CemModel.pathTo(L, from, target);
      if (!full.length) return { none: 'no path', ahead: { x: target.gx - from.gx, y: target.gy - from.gy } };
      let pick = null;
      for (const s of full) {
        const dt = Math.sqrt((s.gx - target.gx) * (s.gx - target.gx) + (s.gy - target.gy) * (s.gy - target.gy));
        if (CemModel.visibilityAt(L, s.gx, s.gy) > 0 && dt >= within - 0.6) pick = s;
      }
      if (!pick) {
        const n = full[0];
        return { none: 'nothing lit on the way', ahead: { x: n.gx - from.gx, y: n.gy - from.gy } };
      }
      ProtoCem.onTileTap(pick.gx, pick.gy);
      return { pick: pick, dist: dist };
    }, spec, within);
    if (r.lost) return 'lost';
    if (r.done) { ProtoCem_stop(page); return 'arrived'; }
    if (r.none) {
      const a = r.ahead, len = Math.sqrt(a.x * a.x + a.y * a.y) || 1;
      await page.evaluate(v => ProtoCem.setSteer(v[0], v[1]), [a.x / len, a.y / len]);
      await wait(500);
      await page.evaluate(() => ProtoCem.setSteer(0, 0));
      continue;
    }
    // walk this leg until he gets there, then tap again
    const legEnd = Date.now() + 8000;
    while (Date.now() < legEnd && Date.now() < deadline) {
      await wait(200);
      const s = await page.evaluate((p, spec, within) => {
        const L = ProtoCem.getLevel();
        const o = CemModel.owlPos(L);
        let target = null;
        if (spec.tomb) { const t = L.tombs.find(t => t.id === spec.tomb); target = t && t.porch; }
        else if (spec.monster) { const m = L.monstersByUid[spec.monster]; target = m && { gx: m.gx, gy: m.gy }; }
        else target = spec.tile;
        const dist = target ? Math.sqrt((target.gx - o.x) * (target.gx - o.x) + (target.gy - o.y) * (target.gy - o.y)) : 99;
        if (dist <= within) { CemModel.setPath(L, []); return { close: true }; }
        return { there: L.owl.gx === p.gx && L.owl.gy === p.gy, walking: !!(L.owl.path && L.owl.path.length) };
      }, r.pick, spec, within);
      if (s.close) return 'arrived';
      if (s.there || !s.walking) break;
    }
    last = r.pick;
  }
  void last;
  return 'timeout';
}

function ProtoCem_stop(page) {
  return page.evaluate(() => { const L = ProtoCem.getLevel(); CemModel.setPath(L, []); ProtoCem.setSteer(0, 0); });
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
      return { tombs: small.map(t => t.id) };
    });

    // 1. the nearest crypt: graves and lanterns on the way, the crypt itself last
    if (plan.tombs.length) {
      log('  toward tomb ' + plan.tombs[0]);
      await walkToward(page, { tomb: plan.tombs[0] }, 0.6, Math.min(14000, left() - 20000));
      await wait(2200);                                    // let it settle, fully lit
    }

    // 2. the nearest wanderer: stop while it is still half in the dark, then step in
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
      const how = await walkToward(page, { monster: monster.uid }, 4.6, Math.min(12000, left() - 12000));
      log('    ' + how + ', pausing at the edge of the dark');
      await wait(2400);
      await walkToward(page, { monster: monster.uid }, 2.4, Math.min(5000, left() - 8000));
      await wait(1800);
    }

    // 3. on toward the next crypt through ground he has not seen
    if (plan.tombs.length > 1 && left() > 5000) {
      log('  toward tomb ' + plan.tombs[1]);
      await walkToward(page, { tomb: plan.tombs[1] }, 0.6, Math.max(2000, left() - 2500));
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
