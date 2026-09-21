#!/usr/bin/env node
/**
 * Headless performance capture for the Halloween cemetery.
 *
 *   node tools/smoke/cem-perf.js [--port 8093] [--seconds 7] [--shot out.png]
 *
 * Boots the isometric page on the cemetery with `?perf=1`, walks Mr Owl a
 * long winding route so chunks are baked and released along the way, then
 * prints what the overlay shows plus the display-list shape behind it.
 * `--shot` saves a screenshot at the end of the walk (the night reveal
 * around Mr Owl, half-lit ground and props at its edge).
 *
 * Note on frame rate: headless Chrome renders through SwiftShader and
 * throttles the loop, so the `fps` line says nothing about a real device.
 * The numbers worth tracking here are logic time per frame, draw calls,
 * visible sprites, the chunk pool and the top-level object count.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8093));
const LEG_MS = Math.round((Number(opt('--seconds', 7)) * 1000) / 6);

const wait = ms => new Promise(r => setTimeout(r, ms));

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

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--window-size=1200,860', '--autoplay-policy=no-user-gesture-required']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 860 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Perf&action=new&level=cemetery&perf=1&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });

    const out = await page.evaluate(async (legMs) => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      L.graceMs = 1e9;                        // no encounters while measuring
      let logic = 0, frames = 0;
      const tick = CemModel.tickOwl;
      CemModel.tickOwl = function(lv, st, dt) {
        const t0 = performance.now();
        const r = tick(lv, st, dt);
        logic += performance.now() - t0; frames++;
        return r;
      };
      // the night reveal (CemeteryScene.updateReveal): per-frame cost while walking
      let reveal = 0, revealMax = 0, revealFrames = 0;
      const upd = S.updateReveal;
      S.updateReveal = function() {
        const t0 = performance.now();
        upd.call(S);
        const ms = performance.now() - t0;
        reveal += ms; revealFrames++; if (ms > revealMax) revealMax = ms;
      };
      const bakesBefore = S.world.stats().bakes;
      const legs = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 0]];
      for (const d of legs) { ProtoCem.setSteer(d[0], d[1]); await wait(legMs); }
      ProtoCem.setSteer(0, 0);
      CemModel.tickOwl = tick;
      S.updateReveal = upd;
      await wait(600);
      const bakesWalk = S.world.stats().bakes - bakesBefore;

      const overlay = S.children.list.find(o => o.type === 'Text' && o.depth === 1e7);
      let inBands = 0;
      S.world.bands.forEach(b => { inBands += b.list.length; });
      let seen = 0;
      for (let i = 0; i < L.seen.length; i++) if (L.seen[i]) seen++;
      return {
        overlay: overlay ? overlay.text : '(overlay missing: is ?perf=1 set?)',
        world: S.world.stats(),
        topLevelObjects: S.children.list.length,
        propsInBands: inBands,
        tickMsPerFrame: Number((logic / Math.max(1, frames)).toFixed(3)),
        revealMsPerFrame: Number((reveal / Math.max(1, revealFrames)).toFixed(3)),
        revealMsMax: Number(revealMax.toFixed(3)),
        bakesDuringWalk: bakesWalk,
        grid: L.W + 'x' + L.H,
        generationMs: L.genMs,
        monsters: L.monsters.length,
        tilesSeen: seen
      };
    }, LEG_MS);

    console.log(out.overlay);
    console.log('');
    console.log(JSON.stringify({
      topLevelObjects: out.topLevelObjects, propsInBands: out.propsInBands,
      tickMsPerFrame: out.tickMsPerFrame, revealMsPerFrame: out.revealMsPerFrame, revealMsMax: out.revealMsMax,
      bakesDuringWalk: out.bakesDuringWalk, world: out.world,
      grid: out.grid, generationMs: out.generationMs, monsters: out.monsters, tilesSeen: out.tilesSeen
    }, null, 2));
    const shot = opt('--shot', null);
    if (shot) { await page.screenshot({ path: shot }); console.log('\nscreenshot: ' + shot); }
    if (errors.length) { console.log('\npage errors: ' + errors.slice(0, 3).join(' | ')); process.exitCode = 1; }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
