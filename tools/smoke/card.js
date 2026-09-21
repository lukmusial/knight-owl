#!/usr/bin/env node
/**
 * Headless check of the encounter card (MonsterStage driven through UI).
 *
 *   node tools/smoke/card.js [--port 8098]
 *
 * The card's image loading, its animation loop and its frame clipping all
 * live in the browser, where the unit suite cannot see them. This opens the
 * classic page and checks, on the real modals:
 *   - a dropped backdrop request is retried and the room still comes up
 *   - with no backdrop at all the illustration is shown and the separate
 *     character stays hidden (no monster drawn twice)
 *   - putting the card away stops its animation loop
 *   - a monster met in the dungeon does not bring its room to the cemetery
 *   - only the lunge is let out of the frame, on the quiz and matching cards
 * Exits non-zero on any failure.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8098));
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

// how many backdrop requests to fail next (Infinity: all of them)
let dropBackdrops = 0;

async function openQuiz(page, id) {
  await page.evaluate(id => {
    const q = { id: 'card_q', category: 'vocabulary', difficulty: 1, prompt: 'What does "kot" mean?', hint: '',
      options: ['cat', 'dog', 'fish', 'bird'], correctIndex: 0 };
    UI.showQuizModal({ monster: MONSTERS.find(m => m.id === id), question: q, isDragon: false, dragonStreak: 0 }, function() {});
  }, id);
}

function cardState(page, imgId) {
  return page.evaluate(imgId => {
    const img = document.getElementById(imgId);
    const actor = MonsterStage.actorFor(img);
    return {
      src: img.getAttribute('src') || '',
      actorShown: !!actor && actor.style.display !== 'none' && getComputedStyle(actor).display !== 'none',
      overflow: getComputedStyle(img.parentNode).overflow
    };
  }, imgId);
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
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 800 });
    page.on('pageerror', e => check(false, 'page error: ' + e.message));
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (/\/backdrops\//.test(req.url()) && dropBackdrops > 0) {
        dropBackdrops--;
        req.abort('connectionreset');
        return;
      }
      req.continue();
    });
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    // the modules are top-level consts, not window properties
    await page.waitForFunction(() => typeof UI !== 'undefined' && typeof MonsterStage !== 'undefined' && typeof MONSTERS !== 'undefined', { timeout: 20000 });
    await wait(500);

    console.log('a dropped backdrop request');
    dropBackdrops = 1;
    await openQuiz(page, 'skeleton');
    await wait(2500);
    let s = await cardState(page, 'monster-image');
    check(/\/backdrops\//.test(s.src), 'the room came up after a retry (' + s.src + ')');
    check(s.actorShown, 'the monster stands in it');
    await page.evaluate(() => UI.hideQuizModal());

    console.log('no backdrop at all');
    await page.evaluate(() => MonsterStage.forgetBackdrop());
    dropBackdrops = Infinity;
    await openQuiz(page, 'troll');
    await wait(3000);
    s = await cardState(page, 'monster-image');
    check(/assets\/troll\.jpg$/.test(s.src), 'the illustration is shown instead (' + s.src + ')');
    check(!s.actorShown, 'and the character is not drawn over it a second time');
    await page.evaluate(() => UI.hideQuizModal());
    dropBackdrops = 0;

    console.log('putting the card away');
    await openQuiz(page, 'zombie');
    await wait(2000);
    const loop = await page.evaluate(() => new Promise(res => {
      const actor = MonsterStage.actorFor(document.getElementById('monster-image'));
      UI.hideQuizModal();
      const seen = {};
      const t0 = performance.now();
      (function sample() {
        seen[actor.style.backgroundPosition] = true;
        if (performance.now() - t0 < 1500) setTimeout(sample, 50); else res(Object.keys(seen).length);
      })();
    }));
    check(loop === 1, 'the monster stops moving once the card is closed (' + loop + ' frame(s) in 1.5 s)');

    console.log('levels keep their own rooms');
    await page.evaluate(() => { MonsterStage.setTheme('dungeon'); });
    await openQuiz(page, 'zombie');
    await wait(800);
    const dungeonRoom = (await cardState(page, 'monster-image')).src;
    await page.evaluate(() => { MonsterStage.setTheme('cemetery'); });
    await openQuiz(page, 'zombie');
    await wait(800);
    const cemeteryRoom = (await cardState(page, 'monster-image')).src;
    check(/dungeon_/.test(dungeonRoom) && /cemetery_/.test(cemeteryRoom),
      'the zombie fights in a dungeon room, then in a cemetery one (' + path.basename(dungeonRoom) + ', ' + path.basename(cemeteryRoom) + ')');
    await page.evaluate(() => { UI.hideQuizModal(); MonsterStage.setTheme('dungeon'); });

    console.log('only the lunge leaves the frame');
    await openQuiz(page, 'orc');
    await wait(1500);
    s = await cardState(page, 'monster-image');
    check(s.overflow === 'hidden', 'the quiz card clips its monster at rest');
    await page.evaluate(() => MonsterStage.allowLunge(document.getElementById('monster-image'), 800));
    s = await cardState(page, 'monster-image');
    check(s.overflow === 'visible', 'and lets the lunge out');
    await wait(1100);
    s = await cardState(page, 'monster-image');
    check(s.overflow === 'hidden', 'then clips again');
    await page.evaluate(() => UI.hideQuizModal());

    // a wrong pair on the matching card is the matching card's lunge
    await page.evaluate(() => {
      const set = { category: 'matching', pairs: [
        { left: 'kot', right: 'cat' }, { left: 'pies', right: 'dog' }, { left: 'ryba', right: 'fish' }] };
      UI.showMatchingModal({ monster: MONSTERS.find(m => m.id === 'ghost'), set: set }, function() {});
    });
    await wait(1500);
    const lunged = await page.evaluate(() => new Promise(res => {
      const left = document.querySelector('#matching-left .matching-item[data-pair-index="0"]');
      const wrong = document.querySelector('#matching-right .matching-item:not([data-pair-index="0"])');
      if (!left || !wrong) { res('no pairs on the card'); return; }
      left.click();
      wrong.click();
      setTimeout(() => res(getComputedStyle(document.getElementById('matching-monster-image').parentNode).overflow), 150);
    }));
    check(lunged === 'visible', 'the matching card lets its lunge out too (' + lunged + ')');
    await page.evaluate(() => UI.hideMatchingModal());

    // On a phone the card's stage and image are sized by different style
    // sheets (styles.css for the classic page, proto-hud.css for the game
    // views); if the stage ends up shorter than the image it clips the bottom
    // of every monster
    for (const url of ['/index.html', '/proto/isometric.html']) {
      const phone = await browser.newPage();
      await phone.setViewport({ width: 412, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await phone.goto('http://localhost:' + PORT + url, { waitUntil: 'load' });
      await phone.waitForFunction(() => typeof UI !== 'undefined' && typeof MonsterStage !== 'undefined' &&
        typeof MONSTERS !== 'undefined' && document.getElementById('monster-image'), { timeout: 30000 });
      await wait(800);
      await openQuiz(phone, 'ghost');
      await wait(2500);
      const fit = await phone.evaluate(() => {
        const img = document.getElementById('monster-image');
        return { img: Math.round(img.getBoundingClientRect().height), stage: Math.round(img.parentNode.getBoundingClientRect().height) };
      });
      check(fit.img > 0 && fit.stage >= fit.img, 'on a phone (' + url + ') the whole card shows (image ' + fit.img + 'px, stage ' + fit.stage + 'px)');
      await phone.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
