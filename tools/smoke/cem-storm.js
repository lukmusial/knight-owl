#!/usr/bin/env node
/**
 * Headless check of the cemetery thunderstorm.
 *
 *   node tools/smoke/cem-storm.js [--port 8097] [--shot docs/screenshots/cem-05-lightning.png]
 *
 * Boots the isometric page on the cemetery with `?perf=1`, fires a strike
 * through `scene.strikeLightning()`, screenshots it mid-bolt, measures what
 * the strike costs per frame against the idle scene (update time, draw
 * calls), checks the objects are put away when it ends, that the storm skips
 * a strike while a card is up, and that pausing the game pauses the timer.
 * Exits non-zero on a failed check.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8097));
const SHOT = opt('--shot', path.join('docs', 'screenshots', 'cem-05-lightning.png'));

const wait = ms => new Promise(r => setTimeout(r, ms));
let failures = 0;
function check(cond, msg) {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg);
  if (!cond) failures++;
}

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
 * Runs in the page: average scene.update time, render time and draw calls
 * per frame over `nFrames` game frames, with strikes chained back to back
 * or the scene idle. Counted in frames, not wall time: under SwiftShader a
 * frame can take a quarter of a second while Phaser still hands the scene a
 * 16.7 ms delta, so a 350 ms strike lasts twenty-odd frames here.
 */
async function sample(nFrames, strike) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const S = ProtoCem.getScene();
  const renderer = S.sys.game.renderer;
  const pipe = renderer.pipelines.get('MultiPipeline');
  let draws = 0, frames = 0, upd = 0, rend = 0;
  const origFlush = pipe.flush.bind(pipe);
  pipe.flush = function(p) { draws++; return origFlush(p); };
  // Phaser bound the scene's update at boot, so hook the bound slot, not the method
  const origUpdate = S.sys.sceneUpdate;
  S.sys.sceneUpdate = function(t, d) { const t0 = performance.now(); origUpdate.call(S, t, d); upd += performance.now() - t0; frames++; };
  const origRender = renderer.render;
  renderer.render = function(a, b, c) { const t0 = performance.now(); origRender.call(renderer, a, b, c); rend += performance.now() - t0; };
  let strikes = 0;
  const t0 = Date.now();
  while (frames < nFrames && Date.now() - t0 < 60000) {
    if (strike && !S.stormStrike) { if (S.strikeLightning()) strikes++; }
    await wait(10);
  }
  S.sys.sceneUpdate = origUpdate; pipe.flush = origFlush; renderer.render = origRender;
  return { frames, updateMs: upd / Math.max(1, frames), renderMs: rend / Math.max(1, frames),
    draws: draws / Math.max(1, frames), strikes };
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
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Storm&action=new&level=cemetery&music=none&perf=1',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });
    await page.evaluate(() => { ProtoCem.getLevel().graceMs = 1e9; });   // no encounters while measuring
    await wait(2500);                                                     // let the ground bake settle

    // 1. the schedule is armed and the first strike is due in about 15 s
    const armed = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      return { has: !!S.stormTimer, delay: S.stormTimer && S.stormTimer.delay, count: S.storm.count };
    });
    check(armed.has && armed.delay === CemStormDefault('firstDelayMs') && armed.count === 1, 'first strike scheduled ' + armed.delay + ' ms after boot');

    // 2. a strike: bolt drawn, flash up, props brightened; the game is held on
    // the first frame of the strike for the screenshot, then let go
    const strike = await page.evaluate(() => new Promise(resolve => {
      const S = ProtoCem.getScene();
      const g = S.sys.game;
      const s = S.strikeLightning();
      if (!s) { resolve(null); return; }
      // read at the moment of the strike, before the first tick starts the decay
      const flash = S.stormFlash.visible && S.stormFlash.alpha, bolt = S.boltCore.visible && S.boltCore.alpha;
      g.events.once('postrender', () => {
        g.pause();
        resolve({
          target: s.target, thunderAt: s.thunderAt, points: s.bolt.main.length, branches: s.bolt.branches.length,
          fromAboveView: s.from.y < S.cameras.main.worldView.y, flash, bolt,
          lit: S.litProps.length, shaking: S.cameras.main.shakeEffect.isRunning
        });
      });
    }));
    check(!!strike, 'a strike found a lit tile to hit');
    if (strike) {
      check(strike.target.dist >= 2, 'the tile is ' + strike.target.dist.toFixed(2) + ' tiles from Mr Owl');
      check(strike.fromAboveView, 'the bolt starts above the top of the view');
      check(strike.points === 33 && strike.branches >= 2, 'the bolt has ' + strike.points + ' points and ' + strike.branches + ' branches');
      check(strike.flash === 0.7 && strike.bolt === 1, 'flash at 0.7 and the bolt at full at the moment of the strike');
      check(strike.lit > 0, strike.lit + ' props near the strike caught its light');
      check(strike.shaking, 'the camera shakes');
      check(strike.thunderAt >= 300 && strike.thunderAt <= 1200, 'thunder follows in ' + strike.thunderAt + ' ms');
    }
    fs.mkdirSync(path.dirname(path.resolve(ROOT, SHOT)), { recursive: true });
    await page.screenshot({ path: path.resolve(ROOT, SHOT) });
    const mid = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      const r = { t: S.stormStrike ? S.stormStrike.t : -1, bolt: S.boltCore.alpha, flash: S.stormFlash.alpha };
      S.sys.game.resume();
      return r;
    });
    console.log('  shot ' + SHOT + ' at ' + Math.round(mid.t) + ' ms into the strike (bolt ' + mid.bolt.toFixed(2) + ', flash ' + mid.flash.toFixed(2) + ')');

    // 3. it is all put away when the strike ends (the strike clock is the game's
    // capped frame delta, so under SwiftShader's slow frames it outlasts 350 ms of wall time)
    await page.waitForFunction(() => !ProtoCem.getScene().stormStrike, { timeout: 8000 });
    const after = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      const L = ProtoCem.getLevel();
      // the props got their lantern tint back: compare with what refreshVisibility gives
      S.lastVis.fill(-1); const before = S.tileProps.flat().map(p => p.tintTopLeft);
      S.refreshVisibility(); const fresh = S.tileProps.flat().map(p => p.tintTopLeft);
      let mismatched = 0; for (let i = 0; i < before.length; i++) if (before[i] !== fresh[i]) mismatched++;
      return { strike: !!S.stormStrike, bolt: S.boltCore.visible, flash: S.stormFlash.visible, ground: S.boltGround.visible,
        lit: S.litProps.length, mismatched, vis: L.vis.length };
    });
    check(!after.strike && !after.bolt && !after.flash && !after.ground && after.lit === 0, 'bolt, flash and ground light hidden after the strike');
    check(after.mismatched === 0, 'every prop has its own tint back (' + after.mismatched + ' differ)');

    // 4. cost: frames with strikes running back to back against idle frames
    // right after them (the boot rebakes and the perf overlay's own redraws
    // make the first seconds after load a poor idle baseline)
    const busy = await page.evaluate(sample, 60, true);
    await page.waitForFunction(() => !ProtoCem.getScene().stormStrike, { timeout: 8000 });
    const idle = await page.evaluate(sample, 60, false);
    const line = r => 'update ' + r.updateMs.toFixed(2) + ' ms, render ' + r.renderMs.toFixed(2) + ' ms, draws ' + r.draws.toFixed(1) + ' per frame (' + r.frames + ' frames';
    console.log('  idle   ' + line(idle) + ')');
    console.log('  strike ' + line(busy) + ', ' + busy.strikes + ' strikes)');
    check(busy.strikes >= 2, 'strikes chained back to back');
    // draw calls, like for like: the same frame with the strike's objects shown and hidden
    const drawsDelta = await page.evaluate(async () => {
      const S = ProtoCem.getScene();
      const g = S.sys.game;
      const pipe = g.renderer.pipelines.get('MultiPipeline');
      let draws = 0;
      const origFlush = pipe.flush.bind(pipe);
      pipe.flush = function(p) { draws++; return origFlush(p); };
      const frame = () => new Promise(r => g.events.once('postrender', () => r()));
      const count = async () => { let sum = 0; for (let i = 0; i < 8; i++) { draws = 0; await frame(); sum += draws; } return sum / 8; };
      const tick = S.tickStorm;
      S.tickStorm = function() {};                       // hold the strike on its first frame
      S.strikeLightning();
      S.cameras.main.shakeEffect.reset();                 // and the camera still
      await frame();
      const shown = await count();
      S.tickStorm = tick;
      S.endStrike();
      await frame();
      const hidden = await count();
      pipe.flush = origFlush;
      return { shown, hidden };
    });
    console.log('  draws per frame: ' + drawsDelta.hidden.toFixed(1) + ' without the strike, ' + drawsDelta.shown.toFixed(1) + ' with it');
    check(drawsDelta.shown - drawsDelta.hidden < 12, 'a strike adds ' + (drawsDelta.shown - drawsDelta.hidden).toFixed(1) + ' draw calls per frame');

    // 5. skipped while a card is up: the timer re-arms with the retry delay
    const skipped = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      const origBusy = ProtoCem.isBusy;
      ProtoCem.isBusy = () => true;
      const countBefore = S.storm.count;
      S.stormTimer.remove(false);
      S.onStormDue();
      const r = { struck: !!S.stormStrike, delay: S.stormTimer.delay, count: S.storm.count - countBefore };
      ProtoCem.isBusy = origBusy;
      S.setInputEnabled(false);
      S.stormTimer.remove(false);
      S.onStormDue();
      r.struckWithoutInput = !!S.stormStrike; r.delay2 = S.stormTimer.delay;
      S.setInputEnabled(true);
      return r;
    });
    check(!skipped.struck && skipped.delay === CemStormDefault('retryMs') && skipped.count === 0,
      'no strike while a card is up; retried in ' + skipped.delay + ' ms (struck ' + skipped.struck + ', scheduled ' + skipped.count + ')');
    check(!skipped.struckWithoutInput && skipped.delay2 === CemStormDefault('retryMs'),
      'no strike while input is off; retried in ' + skipped.delay2 + ' ms (struck ' + skipped.struckWithoutInput + ')');

    // 6. pausing the game (what AppLifecycle does) freezes the storm timer
    const paused = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const S = ProtoCem.getScene();
      const g = S.sys.game;
      const e0 = S.stormTimer.getElapsed();
      await wait(800);
      const e1 = S.stormTimer.getElapsed();
      g.pause();
      await wait(800);
      const e2 = S.stormTimer.getElapsed();
      g.resume();
      await wait(800);
      const e3 = S.stormTimer.getElapsed();
      return { ran: e1 - e0, frozen: e2 - e1, resumed: e3 - e2 };
    });
    // the timer counts the game's frame delta, which SwiftShader keeps well under wall time
    check(paused.ran > 0, 'the timer runs while the game runs (+' + Math.round(paused.ran) + ' ms in 800)');
    check(paused.frozen === 0, 'the timer stops while the game is paused (+' + Math.round(paused.frozen) + ' ms in 800)');
    check(paused.resumed > 0, 'and runs again after resume (+' + Math.round(paused.resumed) + ' ms in 800)');

    if (errors.length) { check(false, 'page errors: ' + errors.slice(0, 3).join(' | ')); }
  } finally {
    await browser.close();
    server.kill();
  }
  if (failures) { console.log('\n' + failures + ' check(s) failed'); process.exit(1); }
  console.log('\nall storm checks passed');
}

// the defaults the page uses, read from the module source so the harness cannot drift
function CemStormDefault(name) {
  const src = fs.readFileSync(path.join(ROOT, 'www', 'js', 'proto', 'cem-storm.js'), 'utf8');
  const m = src.match(new RegExp(name + ':\\s*(\\d+)'));
  return m ? Number(m[1]) : NaN;
}

main().catch(e => { console.error(e); process.exit(1); });
