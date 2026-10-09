#!/usr/bin/env node
/**
 * Checks the GitHub Pages build as an installed, offline game.
 *
 *   node tools/pages/offline-check.js [--site dist/pages] [--port 8097]
 *
 * Serves the build from a subpath (as GitHub serves /knight-owl/), opens the
 * start page in headless Chrome and checks that Chrome finds the site
 * installable, that the service worker saves every file and the page says
 * so, then cuts the network and starts a cemetery run: the page, the level
 * and every file of the site must come from the saved copy. Part of
 * `npm run test:pages`.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const SITE = path.resolve(ROOT, opt('--site', 'dist/pages'));
const PORT = Number(opt('--port', 8097));
const ORIGIN = 'http://localhost:' + PORT + '/' + path.basename(SITE);
const wait = ms => new Promise(r => setTimeout(r, ms));

function findChrome() {
  return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(fs.existsSync);
}

let failures = 0;
function check(cond, msg) {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg);
  if (!cond) failures++;
}

async function main() {
  const sw = fs.readFileSync(path.join(SITE, 'sw.js'), 'utf8');
  const list = JSON.parse(sw.match(/var PRECACHE = (\[.*?\]);/)[1]).map(p => p.url);
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.dirname(SITE)], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({ executablePath: opt('--chrome', findChrome()), headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    console.log('first visit');
    await page.goto(ORIGIN + '/', { waitUntil: 'load' });
    const client = await page.createCDPSession();
    const manifest = await client.send('Page.getAppManifest');
    check(!!manifest.data && /Halloween/.test(manifest.data) && (!manifest.errors || !manifest.errors.length), 'the manifest is read without errors');
    await page.waitForSelector('#offline-note[data-ready]', { timeout: 180000 });
    const note = await page.$eval('#offline-note', el => el.textContent);
    check(/offline/i.test(note), 'the start page says the game is saved for offline play (' + note + ')');
    const inst = await client.send('Page.getInstallabilityErrors');
    const errs = (inst.installabilityErrors || []).map(e => e.errorId);
    check(errs.length === 0, 'Chrome finds the site installable' + (errs.length ? ': ' + errs.join(', ') : ''));
    const saved = await page.evaluate(async () => {
      const keys = (await caches.keys()).filter(k => k.indexOf('mrowl-cem-') === 0);
      const c = await caches.open(keys[0]);
      return { caches: keys.length, entries: (await c.keys()).length };
    });
    check(saved.caches === 1 && saved.entries === list.length + 1, 'one cache holding all ' + list.length + ' files (' + saved.entries + ' entries)');

    console.log('offline');
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: 'load' });
    check(await page.$('#new-game-btn') !== null, 'the start page opens without the network');
    await page.tap('#hw-veil');
    await page.$eval('#player-name', el => { el.value = ''; });
    await page.type('#player-name', 'Offline');
    await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.tap('#new-game-btn')]);
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 60000 });
    check(await page.evaluate(() => ProtoSession.currentRunLevel()) === 'cemetery', 'a new cemetery run starts offline');
    const missing = await page.evaluate(async urls => {
      const bad = [];
      for (const u of urls) {
        try { const r = await fetch(u); if (!r.ok) bad.push(u + ' ' + r.status); } catch (e) { bad.push(u + ' ' + e.message); }
      }
      return bad;
    }, list);
    check(missing.length === 0, 'every file of the site loads offline' + (missing.length ? ': ' + missing.slice(0, 5).join(', ') : ''));
    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
