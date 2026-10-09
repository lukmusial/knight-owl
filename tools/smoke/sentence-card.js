#!/usr/bin/env node
/**
 * Headless check of the sentence-builder card on the real modal.
 *
 *   node tools/smoke/sentence-card.js [--port 8099] [--shots DIR]
 *
 * Opens the classic page (desktop, mouse) and the isometric page (phone,
 * touch) and, on each, builds a sentence from the word tiles:
 *   - tapping a pool tile appends it, tapping a placed tile sends it back
 *   - dragging a placed tile moves it, dragging a pool tile inserts it
 *   - a near miss marks the wrong tile and leaves the card open for a fix
 *   - fixing it and confirming again wins, the card reports success
 *   - a far-off sentence fails at once
 * Screenshots of the near miss go to --shots (default docs/screenshots).
 * Exits non-zero on any failure.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8099));
const SHOTS = path.resolve(ROOT, opt('--shots', 'docs/screenshots'));
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

const QUESTION = {
  id: 'smoke_sent', difficulty: 3, category: 'sentence', prompt: 'I must give the key to my brother.',
  answers: [['muszę', 'dać', 'bratu', 'klucz'], ['muszę', 'dać', 'klucz', 'bratu']],
  distractors: { random: ['kubek'], form: ['brata', 'klucza', 'dam'], lookalike: ['klocek'] },
  explanation: 'Muszę dać bratu klucz.'
};

async function open(page, monsterId) {
  await page.evaluate((q, id) => {
    // the isometric page opens on its level picker, which sits above every modal
    const picker = document.getElementById('iso-level-picker');
    if (picker) picker.remove();
    window.__sentenceDone = null;
    UI.showSentenceModal({ monster: MONSTERS.find(m => m.id === id), question: q }, function(success) {
      window.__sentenceDone = { success: success };
    });
  }, QUESTION, monsterId);
  // the game pages boot behind a loading veil; tap only once the card is on top
  await page.waitForFunction(() => {
    const el = document.querySelector('#sentence-pool button.sentence-tile');
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return top === el;
  }, { timeout: 30000 });
  await wait(300);
}

function strip(page) {
  return page.$$eval('#sentence-slots button.sentence-tile', els => els.map(e => e.textContent.trim()).join(' '));
}

/** Centre of a tile carrying a word, in the strip or the pool */
async function tileAt(page, where, word) {
  const box = await page.evaluate((where, word) => {
    const sel = (where === 'strip' ? '#sentence-slots' : '#sentence-pool') + ' button.sentence-tile';
    const el = Array.from(document.querySelectorAll(sel)).find(e => e.textContent.trim() === word);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, where, word);
  if (!box) throw new Error('no ' + where + ' tile "' + word + '"');
  return box;
}

async function tap(page, touch, where, word) {
  const b = await tileAt(page, where, word);
  if (touch) await page.touchscreen.tap(b.x, b.y);
  else await page.mouse.click(b.x, b.y);
  await wait(120);
}

async function drag(page, touch, from, to) {
  const steps = 8;
  if (touch) {
    await page.touchscreen.touchStart(from.x, from.y);
    for (let i = 1; i <= steps; i++) {
      await page.touchscreen.touchMove(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps);
      await wait(16);
    }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps);
      await wait(16);
    }
    await page.mouse.up();
  }
  await wait(200);
}

async function run(browser, url, viewport, touch, label) {
  console.log(label + ' (' + url + ')');
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.on('pageerror', e => check(false, 'page error: ' + e.message));
  await page.goto('http://localhost:' + PORT + url, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof UI !== 'undefined' && typeof Sentences !== 'undefined' &&
    typeof MONSTERS !== 'undefined' && document.getElementById('sentence-modal'), { timeout: 30000 });
  await wait(800);

  await open(page, 'skeleton');
  check(await page.$eval('#sentence-modal', e => !e.classList.contains('hidden')), 'the card opens');
  check(await page.$$eval('#sentence-pool button.sentence-tile', els => els.length) === 9, 'nine word tiles are dealt');
  check(await page.$eval('#sentence-confirm-btn', e => e.disabled), 'confirm waits for a word');

  // tap to build, tap to take back
  for (const w of ['dać', 'muszę', 'klucz', 'kubek']) await tap(page, touch, 'pool', w);
  check(await strip(page) === 'dać muszę klucz kubek', 'tapping appends: ' + await strip(page));
  await tap(page, touch, 'strip', 'kubek');
  check(await strip(page) === 'dać muszę klucz', 'tapping a placed word sends it back');
  check(await page.$$eval('#sentence-pool button.sentence-tile', els => els.some(e => e.textContent.trim() === 'kubek')),
    'it is back in the pool');

  // drag "muszę" in front of "dać"
  const musze = await tileAt(page, 'strip', 'muszę');
  const dac = await tileAt(page, 'strip', 'dać');
  await drag(page, touch, musze, { x: dac.x - dac.w / 2 - 2, y: dac.y });
  check(await strip(page) === 'muszę dać klucz', 'dragging moves a placed word: ' + await strip(page));

  // drag "brata" from the pool between "dać" and "klucz" (a wrong form: near miss)
  const brata = await tileAt(page, 'pool', 'brata');
  const klucz = await tileAt(page, 'strip', 'klucz');
  await drag(page, touch, brata, { x: klucz.x - klucz.w / 2 - 2, y: klucz.y });
  check(await strip(page) === 'muszę dać brata klucz', 'dragging a pool word inserts it: ' + await strip(page));

  await page.click('#sentence-confirm-btn');
  await wait(500);
  const marked = await page.$$eval('#sentence-slots .mark-wrong', els => els.map(e => e.textContent.trim()));
  check(marked.join() === 'brata', 'the near miss marks the wrong form (' + marked.join() + ')');
  check(await page.$eval('#sentence-feedback', e => e.classList.contains('near')), 'and says it is almost right');
  check(await page.evaluate(() => window.__sentenceDone === null), 'the card stays open for a fix');
  fs.mkdirSync(SHOTS, { recursive: true });
  const shot = path.join(SHOTS, 'sentence-card-' + label.replace(/\W+/g, '-') + '.png');
  await page.screenshot({ path: shot });
  console.log('  shot ' + path.relative(ROOT, shot));

  // fix it and win
  await tap(page, touch, 'strip', 'brata');
  check(await page.$$eval('#sentence-slots .mark-wrong', els => els.length) === 0, 'taking the word out clears its mark');
  const k2 = await tileAt(page, 'strip', 'klucz');
  const bratu = await tileAt(page, 'pool', 'bratu');
  await drag(page, touch, bratu, { x: k2.x - k2.w / 2 - 2, y: k2.y });
  check(await strip(page) === 'muszę dać bratu klucz', 'the fixed sentence: ' + await strip(page));
  await page.click('#sentence-confirm-btn');
  await page.waitForFunction(() => window.__sentenceDone !== null, { timeout: 8000 }).catch(() => {});
  const won = await page.evaluate(() => window.__sentenceDone);
  check(won && won.success === true, 'the fixed sentence wins');
  await page.evaluate(() => UI.hideSentenceModal());

  // a far miss fails at once
  await open(page, 'skeleton');
  for (const w of ['kubek', 'klocek', 'dam']) await tap(page, touch, 'pool', w);
  await page.click('#sentence-confirm-btn');
  await page.waitForFunction(() => window.__sentenceDone !== null, { timeout: 8000 }).catch(() => {});
  const lost = await page.evaluate(() => window.__sentenceDone);
  check(lost && lost.success === false, 'a far-off sentence fails without a second try');
  await page.evaluate(() => UI.hideSentenceModal());
  check(await page.$eval('#sentence-modal', e => e.classList.contains('hidden')), 'the card closes');
  check(await page.$$eval('.sentence-ghost', els => els.length) === 0, 'no drag ghost is left behind');
  await page.close();
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(1000);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: 'shell',
    args: ['--mute-audio', '--no-sandbox']
  });
  try {
    await run(browser, '/index.html', { width: 1000, height: 800 }, false, 'desktop');
    await run(browser, '/isometric.html', { width: 412, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true, 'phone');
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
