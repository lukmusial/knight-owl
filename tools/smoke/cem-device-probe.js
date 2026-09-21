#!/usr/bin/env node
/**
 * Probe the cemetery running in the app's WebView on an Android phone over
 * the DevTools protocol, and print the state of its rain and storm.
 *
 *   adb forward tcp:9223 localabstract:webview_devtools_remote_<pid>
 *   node tools/smoke/cem-device-probe.js [--url http://localhost:9223] [--goto <page url>] [--seconds 30] [--eval "<js>"]
 *
 * With --goto the page is navigated first (for example to the cemetery with
 * `?level=cemetery&perf=1`). Then, every second for --seconds, prints the
 * scene's rain and storm stats so a shower or a strike can be watched for.
 * With --eval, evaluates that expression once and prints its result.
 */
const puppeteer = require('puppeteer-core');

const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const URL = opt('--url', 'http://localhost:9223');
const GOTO = opt('--goto', null);
const SECONDS = Number(opt('--seconds', 0));
const EVAL = opt('--eval', null);
const wait = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.connect({ browserURL: URL, defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[0];
  page.on('pageerror', e => console.log('  pageerror: ' + e));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' || /Cem|Rain|Storm|SFX|Lifecycle/.test(m.text())) console.log('  console.' + m.type() + ': ' + m.text().slice(0, 300)); });
  console.log('page: ' + page.url());
  if (GOTO) {
    await page.goto(GOTO, { waitUntil: 'load' });
    console.log('now: ' + page.url());
  }
  if (EVAL) {
    const r = await page.evaluate(EVAL);
    console.log(JSON.stringify(r, null, 1));
  }
  if (SECONDS > 0) {
    const end = Date.now() + SECONDS * 1000;
    while (Date.now() < end) {
      const r = await page.evaluate(() => {
        if (typeof ProtoCem === 'undefined' || !ProtoCem.getScene()) return { noScene: true, href: location.href, vis: document.visibilityState };
        const S = ProtoCem.getScene();
        return {
          vis: document.visibilityState,
          rainT0: S.rainT0, now: Math.round(S.time.now), elapsed: Math.round(S.rainElapsed()),
          rain: S.rainStats(), storm: S.stormStats(),
          emitter: S.rainEmitter ? { visible: S.rainEmitter.visible, emitting: S.rainEmitter.emitting, freq: S.rainEmitter.frequency, alive: S.rainEmitter.getAliveParticleCount() } : null,
          paused: !!ProtoCem.getLevel().paused, busy: ProtoCem.isBusy(), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
          fps: Math.round(S.game.loop.actualFps), loopRunning: S.game.loop.running, sceneActive: S.scene.isActive(), scenePaused: S.scene.isPaused(),
          rainCalls: S.__rainCalls || 0, stormCalls: S.__stormCalls || 0
        };
      });
      console.log(new Date().toISOString().slice(11, 19) + ' ' + JSON.stringify(r));
      await wait(1000);
    }
  }
  browser.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
