#!/usr/bin/env node
/**
 * Headless check that the 3D view still runs one render loop.
 *
 *   node tools/smoke/fp-perf.js [--steps 20] [--port 8097]
 *
 * The first-person renderer drives itself with requestAnimationFrame and
 * stops the loop when nothing is moving. If anything called during a frame
 * restarts the loop, a second self-sustaining chain is created and never
 * collected: the view then renders the scene twice per frame, then three
 * times, and so on, which is why it used to grind to a halt after exploring
 * for a while. One walked step used to cost one extra chain.
 *
 * This wraps requestAnimationFrame to count callbacks, runs a free-running
 * ticker of its own as the clock, and reports callbacks per tick: 1 means a
 * single loop, 2 means the bug is back. Exits non-zero past the threshold.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8097));
const STEPS = Number(opt('--steps', 20));
const LIMIT = Number(opt('--limit', 1.6));
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
  await wait(1000);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: 'shell',
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio', '--no-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 480, height: 360 });
    // count every animation-frame callback, and keep a ticker of our own as
    // the clock: one loop means one callback per tick
    await page.evaluateOnNewDocument(() => {
      window.__rafCalls = 0;
      const orig = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = function(cb) {
        return orig(function(t) { window.__rafCalls++; return cb(t); });
      };
      window.__ticks = 0;
      (function tick() { window.__ticks++; orig(tick); })();
    });
    await page.goto('http://localhost:' + PORT + '/proto/first-person.html?name=Perf&action=new',
      { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.ProtoFp && ProtoFp.getDebugState().gameInProgress, { timeout: 40000 });
    await wait(2500);
    await page.evaluate(() => {
      document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
      FpRenderer.resume();
    });

    async function chains() {
      const a = await page.evaluate(() => ({ r: window.__rafCalls, t: window.__ticks }));
      await wait(3000);
      const b = await page.evaluate(() => ({ r: window.__rafCalls, t: window.__ticks }));
      return (b.r - a.r) / Math.max(1, b.t - a.t);
    }

    const before = await chains();
    check(before < LIMIT, 'one render loop at rest (' + before.toFixed(2) + ' callbacks per frame)');

    // walk back and forth: every arrival reassigns lights and refreshes
    // visibility, which is what used to fork a second loop
    await page.evaluate(n => {
      return new Promise(res => {
        let left = n;
        function hop() {
          if (left-- <= 0) return res();
          const st = FpWorld.getState();
          const nb = FpWorld.canStepForward() ? FpWorld.stepForward() : null;
          if (!nb) { FpWorld.turnRight(); FpRenderer.setPose(st.roomId, FpWorld.getFacing()); return hop(); }
          FpRenderer.animateStep(nb, FpWorld.getFacing(), 200, hop);
        }
        hop();
      });
    }, STEPS).catch(() => {});
    await wait(500);

    const after = await chains();
    check(after < LIMIT, 'still one render loop after ' + STEPS + ' steps (' + after.toFixed(2) + ')');
    check(after < before + 0.5, 'walking does not add loops (' + before.toFixed(2) + ' then ' + after.toFixed(2) + ')');
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
