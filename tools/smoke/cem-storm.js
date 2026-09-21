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
const Phaser_ADD = 1;      // Phaser.BlendModes.ADD
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

    // 1. the storm follows the rain schedule: the first strike announces the first episode
    const armed = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      S.tickStormSchedule();
      const ep = S.rainSchedule.episodes[0];
      const n = CemStorm.strikesFor(S.storm, ep)[0];
      const r = { has: !!n, kind: n && n.kind, lead: n && ep.start - n.at, at: n && n.at, epStart: ep.start, t: S.rainElapsed(), line: S.stormStats().schedule };
      // park the schedule: the checks below fire their own strikes
      S.stormNext = { at: 1e12, until: 1e12, kind: 'rain', episode: ep };
      return r;
    });
    const leadOk = (armed.lead >= CemStormDefault('announceMinMs') && armed.lead <= CemStormDefault('announceMaxMs')) ||
      (armed.at === CemStormDefault('announceFloorMs') && armed.at < armed.epStart);
    check(armed.has && armed.kind === 'announce' && leadOk,
      'the first strike announces the rain ' + Math.round(armed.lead) + ' ms before episode 1 (rain at ' + Math.round(armed.epStart) + ' ms); overlay: ' + armed.line);

    // 2. a strike: bolt drawn, the leader lit, props brightened; the game is
    // held on the strike's brightest moment (the main stroke) for the
    // screenshot, then let go
    const strike = await page.evaluate(() => new Promise(resolve => {
      const S = ProtoCem.getScene();
      const g = S.sys.game;
      const s = S.strikeLightning();
      if (!s) { resolve(null); return; }
      // read at the moment of the strike, before the first tick moves it on
      const flash = S.stormFlash.visible && S.stormFlash.alpha, bolt = S.boltCore.visible && S.boltCore.alpha;
      const lit = S.litProps.length;
      const bright = CemStorm.brightest(s.seq);
      const tick = S.tickStorm;
      S.tickStorm = function() { S.applyStorm(bright.t); };
      g.events.once('postrender', () => {
        g.pause();
        S.tickStorm = tick;
        s.t = bright.t;
        resolve({
          target: s.target, thunderAt: s.thunderAt, mainAt: s.seq.mainAt, totalMs: s.seq.totalMs, endMs: s.seq.endMs,
          strokes: s.seq.strokes.length, points: s.bolt.main.length, branches: s.bolt.branches.length,
          fromAboveView: s.from.y < S.cameras.main.worldView.y,
          clearOfTop: IsoModel.gridToIso(s.target.gx, s.target.gy).y - S.cameras.main.worldView.y,
          flash, bolt, lit, bright,
          shownBolt: S.boltCore.alpha, shownFlash: S.stormFlash.alpha, flashBlend: S.stormFlash.blendMode
        });
      });
    }));
    check(!!strike, 'a strike found a lit tile to hit');
    if (strike) {
      check(strike.target.dist >= 2, 'the tile is ' + strike.target.dist.toFixed(2) + ' tiles from Mr Owl');
      check(strike.fromAboveView, 'the bolt starts above the top of the view');
      check(strike.clearOfTop > 150, 'the struck tile is ' + Math.round(strike.clearOfTop) + ' px below the top of the view');
      check(strike.points === 33 && strike.branches >= 2, 'the bolt has ' + strike.points + ' points and ' + strike.branches + ' branches');
      check(strike.strokes >= 4 && strike.strokes <= 6 && strike.totalMs >= 800 && strike.totalMs <= 1500,
        'a sequence of ' + strike.strokes + ' strokes over ' + strike.totalMs + ' ms, glow gone at ' + strike.endMs);
      check(strike.bolt > 0 && strike.bolt <= 0.4 && strike.flash > 0, 'the dim leader opens it (bolt ' + strike.bolt.toFixed(2) + ', flash ' + strike.flash.toFixed(2) + ')');
      check(strike.shownBolt > 0.8 && strike.shownFlash > 0.35 && strike.shownFlash <= 0.45,
        'the main stroke at ' + strike.bright.t + ' ms: bolt ' + strike.shownBolt.toFixed(2) + ', flash ' + strike.shownFlash.toFixed(2));
      check(strike.flashBlend === Phaser_ADD, 'the view flash is additive');
      check(strike.lit > 0, strike.lit + ' props near the strike caught its light');
      check(strike.thunderAt - strike.mainAt >= 300 && strike.thunderAt - strike.mainAt <= 1200,
        'thunder follows the main stroke (at ' + strike.mainAt + ' ms) by ' + (strike.thunderAt - strike.mainAt) + ' ms');
    }
    fs.mkdirSync(path.dirname(path.resolve(ROOT, SHOT)), { recursive: true });
    await page.screenshot({ path: path.resolve(ROOT, SHOT) });
    console.log('  shot ' + SHOT + ' at the main stroke');
    const shook = await page.evaluate(async () => {
      const S = ProtoCem.getScene();
      const g = S.sys.game;
      g.resume();
      const wait = ms => new Promise(r => setTimeout(r, ms));
      // the shake is set off by a timer at mainAt; the strike clock was moved past it, so wait a few frames
      for (let i = 0; i < 40 && !S.cameras.main.shakeEffect.isRunning; i++) await wait(50);
      return S.cameras.main.shakeEffect.isRunning;
    });
    check(shook, 'the camera shakes on the main stroke');

    // 3. it is all put away when the strike ends (the strike clock is the game's
    // frame delta, so under SwiftShader's slow frames it outlasts wall time)
    await page.waitForFunction(() => !ProtoCem.getScene().stormStrike, { timeout: 120000 });
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
    const busy = await page.evaluate(sample, 120, true);
    await page.waitForFunction(() => !ProtoCem.getScene().stormStrike, { timeout: 120000 });
    const idle = await page.evaluate(sample, 120, false);
    const line = r => 'update ' + r.updateMs.toFixed(2) + ' ms, render ' + r.renderMs.toFixed(2) + ' ms, draws ' + r.draws.toFixed(1) + ' per frame (' + r.frames + ' frames';
    console.log('  idle   ' + line(idle) + ')');
    console.log('  strike ' + line(busy) + ', ' + busy.strikes + ' strikes)');
    check(busy.strikes >= 1, 'strikes ran through the sample (' + busy.strikes + ')');
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
      const s = S.strikeLightning();
      const bright = CemStorm.brightest(s.seq);
      S.tickStorm = function() { S.applyStorm(bright.t); };   // hold the strike on its main stroke
      await frame();
      S.cameras.main.shakeEffect.reset();                     // and the camera still
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

    // 5. a due strike is held back while a card is up or input is off, and retried in retryMs
    const skipped = await page.evaluate(() => {
      const S = ProtoCem.getScene();
      const t = S.rainElapsed();
      const due = { at: t - 1, until: t + 60000, kind: 'rain', episode: S.rainSchedule.episodes[0] };
      const origBusy = ProtoCem.isBusy;
      ProtoCem.isBusy = () => true;
      S.stormNext = due;
      S.tickStormSchedule();
      const r = { struck: !!S.stormStrike, retryIn: S.stormNext.at - t, retried: S.stormNext.retried };
      ProtoCem.isBusy = origBusy;
      S.setInputEnabled(false);
      S.stormNext = due;
      S.tickStormSchedule();
      r.struckWithoutInput = !!S.stormStrike; r.retryIn2 = S.stormNext.at - t;
      S.setInputEnabled(true);
      // past its window the strike is dropped for the next planned one
      S.stormNext = { at: t - 1, until: t + 1000, kind: 'rain', episode: S.rainSchedule.episodes[0] };
      S.setInputEnabled(false); S.tickStormSchedule(); S.setInputEnabled(true);
      r.dropped = S.stormNext.at > t + 1000 && !S.stormNext.retried;
      S.stormNext = null;
      return r;
    });
    check(!skipped.struck && Math.round(skipped.retryIn) === CemStormDefault('retryMs') && skipped.retried === 1,
      'no strike while a card is up; retried in ' + Math.round(skipped.retryIn) + ' ms (struck ' + skipped.struck + ')');
    check(!skipped.struckWithoutInput && Math.round(skipped.retryIn2) === CemStormDefault('retryMs'),
      'no strike while input is off; retried in ' + Math.round(skipped.retryIn2) + ' ms');
    check(skipped.dropped, 'a strike blocked past its window is dropped for the next planned one');

    // 6. pausing the game (what AppLifecycle does) stops the storm: a due strike does not fire until resume
    const paused = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const S = ProtoCem.getScene();
      const g = S.sys.game;
      const fired0 = S.storm.fired;
      g.pause();
      const t = S.rainElapsed();
      S.stormNext = { at: t - 1, until: t + 600000, kind: 'rain', episode: S.rainSchedule.episodes[0] };
      await wait(800);
      const whilePaused = S.storm.fired - fired0;
      g.resume();
      for (let i = 0; i < 40 && S.storm.fired === fired0; i++) await wait(50);
      const afterResume = S.storm.fired - fired0;
      await new Promise(r => { const p = () => { if (!S.stormStrike) r(); else setTimeout(p, 100); }; p(); });
      return { whilePaused, afterResume };
    });
    check(paused.whilePaused === 0, 'no strike fires while the game is paused');
    check(paused.afterResume === 1, 'the due strike fires once the game resumes');

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
