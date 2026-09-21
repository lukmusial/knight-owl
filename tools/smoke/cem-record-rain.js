#!/usr/bin/env node
/**
 * Records the cemetery rain as a short video: the rain starting and ramping
 * in over the gate plaza, puddles forming on the lane, droplet rings, and Mr
 * Owl walking through the puddles with splashes and ripples.
 *
 *   node tools/smoke/cem-record-rain.js [--out docs/videos/cemetery-rain.mp4]
 *                                       [--port 8095] [--width 1000] [--height 700]
 *
 * Same capture as cem-record.js (headless Chrome on the GPU through Metal,
 * DevTools screencast frames encoded with ffmpeg at real time), but the
 * walk is scripted for the weather, and the rain's tunables are wound up so
 * the puddles fill in seconds instead of a minute. Pass --software when the
 * GPU path is unavailable. No sound.
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
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/cemetery-rain.mp4'));
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

/**
 * Walk Mr Owl to a tile by tapping the furthest lit step of the route, and
 * wait until he is there or has stopped. Returns whether he arrived.
 */
async function walkTo(page, target, maxMs) {
  const deadline = Date.now() + (maxMs || 20000);
  while (Date.now() < deadline) {
    const r = await page.evaluate(t => {
      const L = ProtoCem.getLevel();
      const from = CemModel.owlTile(L);
      if (from.gx === t.gx && from.gy === t.gy) return { there: true };
      const full = CemModel.pathTo(L, from, t);
      if (!full.length) return { none: true };
      let pick = null;
      for (const s of full) if (CemModel.visibilityAt(L, s.gx, s.gy) > 0) pick = s;
      if (!pick) return { none: true };
      ProtoCem.onTileTap(pick.gx, pick.gy);
      return { step: pick };
    }, target);
    if (r.there) return true;
    if (r.none) return false;
    const stop = Date.now() + 15000;
    while (Date.now() < stop) {
      await wait(300);
      const s = await page.evaluate(p => {
        const L = ProtoCem.getLevel();
        return { there: L.owl.gx === p.gx && L.owl.gy === p.gy, walking: !!(L.owl.path && L.owl.path.length) };
      }, r.step);
      if (s.there || !s.walking) break;
    }
  }
  return false;
}

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-rain-frames-'));
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

    // the weather, wound up for the camera: rain in 3 s, full in 5 more,
    // puddles full within about 12 s; no monster interrupts the walk
    await page.evaluate(() => {
      const S = ProtoCem.getScene(), L = ProtoCem.getLevel();
      const C = CemRain.CFG;
      C.RAIN_DELAY_MS = 3000; C.RAIN_RAMP_MS = 5000;
      C.PUDDLE_FILL_MS = 7000; C.PUDDLE_STAGGER_MS = 5000;
      C.RING_RATE = 10;
      L.graceMs = 1e9;
      S.rainT0 = S.time.now;
      for (const p of S.puddles) { p.spec.delayMs = CemRain.hash(p.spec.gx, p.spec.gy, 67) * C.PUDDLE_STAGGER_MS; p.settled = false; }
    });

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

    log('recording: a dry moment at the gate, then the rain comes');
    await wait(14000);                                   // rain ramps in, the plaza puddles fill

    // a few short walks through the nearest puddles, then out along the lane
    log('walking through the puddles');
    const stops = await page.evaluate(() => {
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      const from = CemModel.owlTile(L);
      const near = S.puddles.map(p => p.spec)
        .map(sp => ({ gx: sp.gx, gy: sp.gy, d: CemModel.pathTo(L, from, sp).length }))
        .filter(p => p.d > 0).sort((a, b) => a.d - b.d);
      const out = [];
      if (near.length) out.push(near[0]);
      if (near.length > 2) out.push(near[Math.min(near.length - 1, 3)]);
      if (near.length > 5) out.push(near[Math.min(near.length - 1, 6)]);
      out.push(from);                                    // and back to the plaza
      return out;
    });
    for (const s of stops) {
      const ok = await walkTo(page, s, 12000);
      log('  ' + (ok ? 'reached' : 'stopped short of') + ' ' + s.gx + ',' + s.gy);
      await wait(1500);                                  // stand in it: the reflection and the rings
    }
    log('up the lane: fresh ground gets wet ahead of him');
    await page.evaluate(() => ProtoCem.setSteer(0, -1));
    await wait(6000);
    await page.evaluate(() => ProtoCem.setSteer(0, 0));
    await wait(2500);

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
