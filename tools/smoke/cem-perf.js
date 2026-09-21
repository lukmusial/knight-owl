#!/usr/bin/env node
/**
 * Headless performance capture for the Halloween cemetery.
 *
 *   node tools/smoke/cem-perf.js [--port 8093] [--seconds 7]
 *
 * Boots the isometric page on the cemetery with `?perf=1`, walks Mr Owl a
 * long winding route so chunks are baked and released along the way, then
 * prints what the overlay shows plus the display-list shape behind it.
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
    // what the boot downloads (Phaser re-reads images through blob: URLs, not counted)
    let bootBytes = 0, bootRequests = 0, booting = true;
    page.on('requestfinished', async req => {
      if (!booting || req.url().startsWith('blob:')) return;
      bootRequests++;
      try { const r = req.response(); const h = r && r.headers()['content-length']; bootBytes += h ? Number(h) : (r ? (await r.buffer()).length : 0); } catch (e) { /* body gone */ }
    });
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Perf&action=new&level=cemetery&perf=1&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });
    await wait(500);
    booting = false;

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
      const legs = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 0]];
      for (const d of legs) { ProtoCem.setSteer(d[0], d[1]); await wait(legMs); }
      ProtoCem.setSteer(0, 0);
      CemModel.tickOwl = tick;
      await wait(600);

      const overlay = S.children.list.find(o => o.type === 'Text' && o.depth === 1e7);
      let inBands = 0;
      S.world.bands.forEach(b => { inBands += b.list.length; });
      let seen = 0;
      for (let i = 0; i < L.seen.length; i++) if (L.seen[i]) seen++;
      // what the GPU holds (decoded RGBA of every texture source) and what keeps running unseen
      let texMB = 0;
      const tl = S.sys.game.textures.list;
      for (const key in tl) { const t = tl[key]; if (!t.source) continue; for (const src of t.source) texMB += (src.width || 0) * (src.height || 0) * 4; }
      let animsPlaying = 0, animsHidden = 0;
      (function walk(list) { for (const o of list) { if (o.type === 'Layer') { walk(o.list); continue; } if (o.anims && o.anims.isPlaying) { animsPlaying++; if (!o.visible) animsHidden++; } } })(S.children.list);
      const tweens = S.tweens.getTweens().length;
      return {
        overlay: overlay ? overlay.text : '(overlay missing: is ?perf=1 set?)',
        world: S.world.stats(),
        topLevelObjects: S.children.list.length,
        propsInBands: inBands,
        tickMsPerFrame: Number((logic / Math.max(1, frames)).toFixed(3)),
        grid: L.W + 'x' + L.H,
        generationMs: L.genMs,
        monsters: L.monsters.length,
        tilesSeen: seen,
        textureMB: Number((texMB / 1048576).toFixed(1)),
        tweens: tweens,
        animsPlaying: animsPlaying,
        animsPlayingHidden: animsHidden
      };
    }, LEG_MS);

    console.log(out.overlay);
    console.log('');
    console.log(JSON.stringify({
      topLevelObjects: out.topLevelObjects, propsInBands: out.propsInBands,
      tickMsPerFrame: out.tickMsPerFrame, world: out.world,
      grid: out.grid, generationMs: out.generationMs, monsters: out.monsters, tilesSeen: out.tilesSeen,
      textureMB: out.textureMB, tweens: out.tweens, animsPlaying: out.animsPlaying, animsPlayingHidden: out.animsPlayingHidden,
      bootMB: Number((bootBytes / 1048576).toFixed(2)), bootRequests: bootRequests
    }, null, 2));
    // guards: hidden sprites must not keep animating, and the GPU must not hold a card's worth of map sheets
    if (out.animsPlayingHidden > 4) { console.log('\nFAIL: ' + out.animsPlayingHidden + ' sprites animate while hidden'); process.exitCode = 1; }
    if (out.textureMB > 100) { console.log('\nFAIL: ' + out.textureMB + ' MB of textures'); process.exitCode = 1; }
    if (errors.length) { console.log('\npage errors: ' + errors.slice(0, 3).join(' | ')); process.exitCode = 1; }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
