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
 * visible sprites, the chunk pool and the top-level object count. It fails
 * when the frame changes blend mode more than 12 times (additive glows
 * scattered among the props held a Mac at 14 fps) or when a crypt's door
 * light is drawn over Mr Owl standing at its door, or when, with the chunk
 * pool cut to 6, any chunk on screen is left without its texture (black).
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
    page.on('console', m => { if (/^door check/.test(m.text())) console.log(m.text()); });
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
      // the night reveal (CemeteryScene.updateReveal): per-frame cost while walking
      let reveal = 0, revealMax = 0, revealFrames = 0;
      const upd = S.updateReveal;
      S.updateReveal = function() {
        const t0 = performance.now();
        upd.call(S);
        const ms = performance.now() - t0;
        reveal += ms; revealFrames++; if (ms > revealMax) revealMax = ms;
      };
      // blend-mode switches a frame: each one flushes the batch, and in Chrome
      // on a Mac (WebGL through Metal) changes the pipeline; two dozen of
      // them, glows scattered among the props, once held the cemetery at 14 fps
      const R = S.sys.game.renderer;
      let blendSwitches = 0, renders = 0;
      const setBlend = R.setBlendMode;
      R.setBlendMode = function(mode, force) {
        const before = this.currentBlendMode;
        const r = setBlend.call(this, mode, force);
        if (this.currentBlendMode !== before) blendSwitches++;
        return r;
      };
      const onRender = () => { renders++; };
      S.sys.game.events.on('postrender', onRender);
      const bakesBefore = S.world.stats().bakes;
      const legs = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 0]];
      for (const d of legs) { ProtoCem.setSteer(d[0], d[1]); await wait(legMs); }
      ProtoCem.setSteer(0, 0);
      R.setBlendMode = setBlend;
      S.sys.game.events.off('postrender', onRender);
      CemModel.tickOwl = tick;
      S.updateReveal = upd;
      await wait(600);
      const bakesWalk = S.world.stats().bakes - bakesBefore;

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
      // more chunks in view than the pool holds: shrink the pool and walk.
      // A chunk on screen must never be left without its texture (it draws
      // black, and the tile sprites over it are dropped too): the pool once
      // handed on-screen chunks' textures to each other every frame, black
      // patches flickering round Mr Owl on a 1920x1080 window
      const Wd = S.world;
      const cols = Math.ceil(L.W / Wd.CHUNK), rowsN = Math.ceil(L.H / Wd.CHUNK);
      let blackFrames = 0, starvedFrames = 0;
      const countBlack = () => {
        starvedFrames++;
        const v = Wd.viewRect(0);
        for (let cy = 0; cy < rowsN; cy++) for (let cx = 0; cx < cols; cx++) {
          const gx = Math.min(L.W - 1, cx * Wd.CHUNK + 4), gy = Math.min(L.H - 1, cy * Wd.CHUNK + 4);
          const p = IsoModel.gridToIso(gx, gy);
          if (p.x < v.left || p.x > v.right || p.y < v.top || p.y > v.bottom) continue;
          if (L.seen[CemModel.index(L, gx, gy)] && !Wd.isLive(Wd.chunkIndexOf(gx, gy))) { blackFrames++; return; }
        }
      };
      const poolMax = Wd.poolMax;
      Wd.poolMax = 6;
      S.events.on('postupdate', countBlack);
      for (const d of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { ProtoCem.setSteer(d[0], d[1]); await wait(700); }
      ProtoCem.setSteer(0, 0);
      S.events.off('postupdate', countBlack);
      Wd.poolMax = poolMax;

      // a crypt's door light belongs to the crypt: it is drawn right after
      // the crypt, so Mr Owl standing at the door (drawn after the crypt) is
      // drawn after the light too, and is not washed over by it
      let doorLightUnder = null;
      const rec = Object.values(S.tombObjs).find(r => r.arch && r.sprite && r.tomb.size === 'small');
      if (rec) {
        const g = IsoModel.isoToGridExact(rec.arch.x, rec.arch.y + 70);
        ProtoCem.teleport(rec.tomb.door.gx, rec.tomb.door.gy);
        L.owl.x = g.gx; L.owl.y = g.gy;
        await wait(400);
        const drawnAfter = (a, b) => {   // is b drawn after a
          const la = a.displayList, lb = b.displayList;
          return la === lb ? la.getIndex(a) < lb.getIndex(b) : (la.depth || 0) < (lb.depth || 0);
        };
        const afterCrypt = drawnAfter(rec.sprite, S.player), afterLight = drawnAfter(rec.glow, S.player);
        doorLightUnder = afterCrypt && afterLight;
        if (!afterCrypt) console.log('door check: Mr Owl did not end up in front of the crypt');
      }
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
        tilesSeen: seen,
        textureMB: Number((texMB / 1048576).toFixed(1)),
        tweens: tweens,
        animsPlaying: animsPlaying,
        animsPlayingHidden: animsHidden,
        blendSwitchesPerFrame: Number((blendSwitches / Math.max(1, renders)).toFixed(1)),
        doorLightUnder: doorLightUnder,
        starvedPoolBlackFrames: blackFrames + '/' + starvedFrames
      };
    }, LEG_MS);

    console.log(out.overlay);
    console.log('');
    console.log(JSON.stringify({
      topLevelObjects: out.topLevelObjects, propsInBands: out.propsInBands,
      tickMsPerFrame: out.tickMsPerFrame, revealMsPerFrame: out.revealMsPerFrame, revealMsMax: out.revealMsMax,
      bakesDuringWalk: out.bakesDuringWalk, world: out.world,
      grid: out.grid, generationMs: out.generationMs, monsters: out.monsters, tilesSeen: out.tilesSeen,
      textureMB: out.textureMB, tweens: out.tweens, animsPlaying: out.animsPlaying, animsPlayingHidden: out.animsPlayingHidden,
      blendSwitchesPerFrame: out.blendSwitchesPerFrame, doorLightUnder: out.doorLightUnder, starvedPoolBlackFrames: out.starvedPoolBlackFrames,
      bootMB: Number((bootBytes / 1048576).toFixed(2)), bootRequests: bootRequests
    }, null, 2));
    const shot = opt('--shot', null);
    if (shot) { await page.screenshot({ path: shot }); console.log('\nscreenshot: ' + shot); }
    // guards: hidden sprites must not keep animating, and the GPU must not hold a card's worth of map sheets
    if (out.animsPlayingHidden > 4) { console.log('\nFAIL: ' + out.animsPlayingHidden + ' sprites animate while hidden'); process.exitCode = 1; }
    if (out.blendSwitchesPerFrame > 12) { console.log('\nFAIL: ' + out.blendSwitchesPerFrame + ' blend-mode switches a frame (additive glows among the props?)'); process.exitCode = 1; }
    if (!/^0\//.test(out.starvedPoolBlackFrames)) { console.log('\nFAIL: with the chunk pool short, on-screen ground went black in ' + out.starvedPoolBlackFrames + ' frames'); process.exitCode = 1; }
    if (out.doorLightUnder === false) { console.log('\nFAIL: a crypt\'s door light is drawn over Mr Owl standing at its door'); process.exitCode = 1; }
    if (out.textureMB > 100) { console.log('\nFAIL: ' + out.textureMB + ' MB of textures'); process.exitCode = 1; }
    if (errors.length) { console.log('\npage errors: ' + errors.slice(0, 3).join(' | ')); process.exitCode = 1; }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
