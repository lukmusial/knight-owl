#!/usr/bin/env node
/**
 * Headless check of the cemetery rain: boots the level with `?perf=1`, gives
 * it a schedule that rains at once and for good, so the puddles are full,
 * walks Mr Owl through the lanes, screenshots the wet grounds and prints
 * what the rain and the reflections cost.
 *
 *   node tools/smoke/cem-rain.js [--port 8094] [--shot docs/screenshots/cem-rain.png] [--seconds 8] [--reduced]
 *
 * Exits non-zero on a page error, when no puddle was laid, when nothing is
 * falling, or when the caps are broken (more than MAX_PUDDLES puddles, more
 * than RING_CAP rings alive). With --reduced the page runs under
 * prefers-reduced-motion: the puddles must lie there full and still, with no
 * streaks and no rings.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8094));
const SHOT = opt('--shot', path.join(ROOT, 'docs', 'screenshots', 'cem-rain.png'));
const SECONDS = Number(opt('--seconds', 8));
const REDUCED = args.indexOf('--reduced') !== -1;

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

let failures = 0;
function check(cond, msg) {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg);
  if (!cond) failures++;
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
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
    if (REDUCED) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Rain&action=new&level=cemetery&perf=1&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });

    const out = await page.evaluate(async (seconds) => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      L.graceMs = 1e9;                        // no encounters while measuring
      L.cfg.OWL_SPEED *= 3;                   // headless Chrome renders a few frames a second: cover ground anyway
      const before = S.rainStats();
      await wait(300);
      const reducedFull = 0;
      // rain at once and for good, puddles full in a blink
      S.rainSchedule = CemRain.schedule(1, { FIRST_GAP_MIN_MS: 0, FIRST_GAP_MAX_MS: 0, EPISODE_MIN_MS: 3600000, EPISODE_MAX_MS: 3600000,
        RAIN_RAMP_MS: 200, PUDDLE_FILL_MS: 200, PUDDLE_STAGGER_MS: 0 });
      S.rainT0 = S.time.now - 1000;
      await wait(300);
      let rainMs = 0, frames = 0, maxRings = 0, maxPuddles = 0, splashes = 0, inViewWetSum = 0, dtSum = 0;
      const ringsBefore = S.ringsSpawned || 0;
      const upd = S.updateRain;
      S.updateRain = function(t, d) {
        const t0 = performance.now();
        upd.call(S, t, d);
        rainMs += performance.now() - t0; frames++;
        dtSum += Math.min(d || 16, 100);          // the simulated time the rain integrated (headless Phaser hands slow frames a 16.7 ms delta)
        maxRings = Math.max(maxRings, S.rings.length);
        maxPuddles = Math.max(maxPuddles, S.puddles.length);
        const v = S.cameras.main.worldView;
        inViewWetSum += S.puddles.filter(p => p.img.visible && p.img.alpha >= 0.2 && p.x > v.x && p.x < v.right && p.y > v.y && p.y < v.bottom).length;
      };
      let emitMs = 0, emitFrames = 0;
      if (S.rainEmitter) {
        const pre = S.rainEmitter.preUpdate;
        S.rainEmitter.preUpdate = function(t, d) {
          const t0 = performance.now();
          pre.call(S.rainEmitter, t, d);
          emitMs += performance.now() - t0; emitFrames++;
        };
      }
      const sp = S.splashStep;
      S.splashStep = function(o) { const r = sp.call(S, o); if (r) splashes++; return r; };
      // walk through the nearest puddles (tap-to-walk, so it works at any
      // frame rate), then steer up the lane so new ground gets wet
      let inPuddle = 0;
      const deadline = Date.now() + seconds * 1000;
      const visited = {};
      while (Date.now() < deadline) {
        const from = CemModel.owlTile(L);
        const next = S.puddles.map(p => p.spec)
          .filter(sp => !visited[sp.gx + ',' + sp.gy])
          .map(sp => ({ gx: sp.gx, gy: sp.gy, d: CemModel.pathTo(L, from, sp).length }))
          .filter(p => p.d > 0).sort((a, b) => a.d - b.d)[0];
        if (!next) break;
        visited[next.gx + ',' + next.gy] = true;
        ProtoCem.onTileTap(next.gx, next.gy);
        const stop = Date.now() + 6000;
        while (Date.now() < stop && Date.now() < deadline) {
          await wait(100);
          if (S.owlPuddle) inPuddle++;
          if (L.owl.gx === next.gx && L.owl.gy === next.gy) break;
          if (!(L.owl.path && L.owl.path.length)) break;
        }
      }
      ProtoCem.setSteer(0, -1);
      const legEnd = Date.now() + 3000;
      while (Date.now() < legEnd) { await wait(100); if (S.owlPuddle) inPuddle++; }
      ProtoCem.setSteer(0, 0);
      await wait(800);
      const walkSec = dtSum / 1000;
      const ringsSpawned = (S.ringsSpawned || 0) - ringsBefore;
      const ringsPerPuddleSec = ringsSpawned / Math.max(0.1, walkSec) / Math.max(1, inViewWetSum / Math.max(1, frames));
      const overlay = S.children.list.find(o => o.type === 'Text' && o.depth === 1e7);
      const shown = S.puddles.filter(p => p.img.visible).length;
      const full = S.puddles.filter(p => p.wet >= 0.99).length;
      const mirrored = S.puddles.filter(p => p.hasRefl).length;
      const owlMirrored = S.puddles.filter(p => /owl3d|owl/.test(p.liveKey) || (p.liveKey && p.liveKey.length > 0)).length;
      return {
        overlay: overlay ? overlay.text : '(overlay missing)',
        before, after: S.rainStats(), shownPuddles: shown, fullPuddles: full, reducedFull, mirrored, owlMirrored,
        rainMsPerFrame: Number((rainMs / Math.max(1, frames)).toFixed(3)),
        emitterMsPerFrame: Number((emitMs / Math.max(1, emitFrames)).toFixed(3)),
        frames, maxRings, maxPuddles, splashes, inPuddleSamples: inPuddle,
        ringsSpawned, ringsPerPuddleSec: Number(ringsPerPuddleSec.toFixed(2)), avgWetInView: Number((inViewWetSum / Math.max(1, frames)).toFixed(1)),
        emitterAlive: S.rainEmitter ? S.rainEmitter.getAliveParticleCount() : -1,
        cfg: CemRain.CFG
      };
    }, SECONDS);

    console.log(out.overlay);
    console.log('');
    console.log(JSON.stringify({
      before: out.before, after: out.after, shownPuddles: out.shownPuddles, fullPuddles: out.fullPuddles,
      rainMsPerFrame: out.rainMsPerFrame, emitterMsPerFrame: out.emitterMsPerFrame, frames: out.frames,
      mirrored: out.mirrored, liveMirrored: out.owlMirrored, bakes: out.after.bakes, msPerBake: Number((out.after.bakeMs / Math.max(1, out.after.bakes)).toFixed(3)),
      composes: out.after.composes, schedule: out.after.schedule, maxRings: out.maxRings, maxPuddles: out.maxPuddles,
      splashes: out.splashes, inPuddleSamples: out.inPuddleSamples, emitterAlive: out.emitterAlive,
      ringsSpawned: out.ringsSpawned, ringsPerPuddleSec: out.ringsPerPuddleSec, avgWetInView: out.avgWetInView
    }, null, 2));
    check(out.after.puddles > 0, 'puddles were laid (' + out.after.puddles + ')');
    check(out.maxPuddles <= out.cfg.MAX_PUDDLES, 'never more than MAX_PUDDLES');
    check(out.maxRings <= out.cfg.RING_CAP, 'never more than RING_CAP rings alive');
    check(out.fullPuddles === out.after.puddles, 'every puddle filled under the endless shower');
    check(out.mirrored > 0, 'puddles mirror what stands around them (' + out.mirrored + ' of ' + out.after.puddles + ')');
    check(out.owlMirrored > 0, 'a puddle mirrored Mr Owl or a monster as they passed (' + out.owlMirrored + ')');
    check(out.after.bakes > 0 && out.after.bakeMs / out.after.bakes < 5, 'a mirror bake is cheap (' + (out.after.bakeMs / Math.max(1, out.after.bakes)).toFixed(2) + ' ms)');
    check(out.splashes > 0, 'Mr Owl splashed through a puddle (' + out.splashes + ')');
    check(out.after.puddles > out.before.puddles, 'new ground got wet as he walked (' + out.before.puddles + ' -> ' + out.after.puddles + ')');
    if (REDUCED) {
      check(out.emitterAlive === -1, 'reduced motion: no streaks');
      check(out.maxRings === 0, 'reduced motion: no rings');
    } else {
      check(out.emitterAlive > 0, 'streaks are falling (' + out.emitterAlive + ')');
      check(out.after.strength === 1, 'the rain reached full strength');
      check(out.ringsPerPuddleSec >= out.cfg.RING_RATE * 0.6, 'drops hit every wet puddle in view (' + out.ringsPerPuddleSec + ' rings a second each, ' + out.avgWetInView + ' puddles in view)');
    }
    if (SHOT) {
      fs.mkdirSync(path.dirname(SHOT), { recursive: true });
      await page.screenshot({ path: SHOT });
      console.log('screenshot: ' + SHOT);
    }
    if (errors.length) { console.log('\npage errors: ' + errors.slice(0, 3).join(' | ')); failures++; }
  } finally {
    await browser.close();
    server.kill();
  }
  if (failures) { console.log('\n' + failures + ' check(s) failed'); process.exit(1); }
  console.log('\nrain ok');
}

main().catch(e => { console.error(e); process.exit(1); });
