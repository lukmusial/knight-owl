#!/usr/bin/env node
/**
 * Records a short video of the cemetery thunderstorm.
 *
 *   node tools/smoke/cem-record-storm.js [--out docs/videos/cemetery-storm.mp4]
 *                                        [--port 8096] [--width 1000] [--height 700]
 *
 * Boots the cemetery in headless Chrome (GPU through Metal, like
 * cem-record.js; pass --software for the rasteriser), lets Mr Owl stand at
 * the gate, walks him up the lane past the lanterns to the nearest tomb, and
 * fires three strikes through `scene.strikeLightning()` on the way (one far
 * off from the gate, one close by as he walks, one on the tomb as he stands
 * before it) so the bolt, its re-strikes, the ground flash, the whole-view
 * flash and the shake are all on film without waiting for the storm's timer.
 * Encounters are held off for the take. Frames come over the DevTools
 * screencast with their own timestamps and are encoded with ffmpeg. No
 * sound: the screencast does not carry the thunder.
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

/**
 * Lightning on a given tile ({ target }), or on a lit tile within a range of
 * Mr Owl ({ minDist, maxDist }), kept clear of the top of the view like the
 * storm's own strikes; the storm's default range when nothing is given
 */
async function strike(page, spec, label) {
  const hit = await page.evaluate(sp => {
    const S = ProtoCem.getScene();
    const L = ProtoCem.getLevel();
    let s;
    if (sp.target) s = S.strikeLightning({ target: sp.target });
    else {
      const view = S.cameras.main.worldView;
      const cfg = CemStorm.config({ minDist: sp.minDist, maxDist: sp.maxDist });
      const clear = (gx, gy) => IsoModel.gridToIso(gx, gy).y >= view.y + view.height * 0.33;
      const t = CemStorm.pickTarget(L, S.storm.rng, cfg, clear);
      s = t ? S.strikeLightning({ target: t }) : null;
    }
    return s ? { gx: s.target.gx, gy: s.target.gy, dist: Number(s.target.dist.toFixed(1)), thunderAt: s.thunderAt,
      totalMs: s.seq.totalMs, strokes: s.seq.strokes.length } : null;
  }, spec || {});
  log('  strike ' + label + ': ' + (hit ? 'tile ' + hit.gx + ',' + hit.gy + ' at ' + hit.dist + ' tiles, ' + hit.strokes + ' strokes over ' + hit.totalMs + ' ms, thunder in ' + hit.thunderAt + ' ms' : 'nothing to hit'));
  return hit;
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
    await page.evaluate(() => { ProtoCem.getLevel().graceMs = 1e9; });   // a storm, not a fight
    await wait(2500);                                                     // the ground finishes baking

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

    log('recording');
    await wait(3500);                                      // Mr Owl at the gate
    await strike(page, { minDist: 6, maxDist: 8 }, 'one, far off');
    await wait(5000);

    const plan = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      const from = CemModel.owlTile(L);
      const small = L.tombs.filter(t => t.size !== 'large')
        .map(t => ({ id: t.id, porch: t.porch, len: CemModel.pathTo(L, from, t.porch).length }))
        .filter(t => t.len > 0).sort((a, b) => a.len - b.len);
      return small[0] || null;
    });
    if (!plan) throw new Error('no tomb within reach');
    log('  walk to tomb ' + plan.id);
    let struckOnTheWay = false;
    const deadline = Date.now() + 40000;
    while (Date.now() < deadline) {
      const how = await walkStep(page, plan.porch, 6000);
      if (how === 'arrived') break;
      if (how === 'blocked') { await wait(500); continue; }
      if (!struckOnTheWay) {
        await wait(1500);
        await strike(page, { minDist: 2, maxDist: 3.5 }, 'two, close by on the lane');
        struckOnTheWay = true;
      }
    }
    await wait(3000);                                      // he stands before the tomb
    // the third bolt hits the tomb itself, just above the porch he stands on
    await strike(page, { target: { gx: plan.porch.gx, gy: plan.porch.gy - 2 } }, 'three, on the tomb');
    await wait(6000);
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
