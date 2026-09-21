#!/usr/bin/env node
/**
 * Records a playthrough of the dungeon in the classic page or the isometric
 * view as a video: from the entrance by the shortest way to the dragon,
 * fighting whatever is in the way, and beating the dragon.
 *
 *   node tools/smoke/dungeon-record.js --view classic [--out docs/videos/classic-dragon.mp4]
 *   node tools/smoke/dungeon-record.js --view iso     [--out docs/videos/iso-dragon.mp4]
 *
 * It plays with the controls a player has: the classic page's direction
 * buttons, the isometric view's room taps, and the quiz, matching and
 * treasure cards answered on screen. Frames come over the DevTools
 * screencast with their own timestamps, so the encode keeps real time.
 * Chrome stays headless and renders on the GPU through Metal; pass
 * --software where that is unavailable. No sound.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const VIEW = opt('--view', 'classic');
const PORT = Number(opt('--port', VIEW === 'iso' ? 8092 : 8091));
const WIDTH = Number(opt('--width', 1000));
const HEIGHT = Number(opt('--height', VIEW === 'iso' ? 700 : 900));
const CRF = opt('--crf', '31');
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/' + VIEW + '-dragon.mp4'));
const SOFTWARE = args.indexOf('--software') !== -1;
const KEEP = args.indexOf('--keep-frames') !== -1;

const wait = ms => new Promise(r => setTimeout(r, ms));
const log = (...m) => console.log(...m);

if (['classic', 'iso'].indexOf(VIEW) === -1) { console.error('--view classic|iso'); process.exit(1); }

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

/* ------------------------------------------------------------- driver side */

async function state(page) {
  return page.evaluate(view => {
    const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
    let busy;
    if (view === 'iso') busy = typeof ProtoIso === 'undefined' || ProtoIso.isBusy();
    else {
      // the classic page is ready to move when its direction bar offers a way
      const bar = document.getElementById('direction-bar');
      busy = !bar || bar.classList.contains('hidden') || !bar.querySelector('.dir-btn:not([disabled])');
    }
    return {
      quiz: vis('quiz-modal'), matching: vis('matching-modal'), result: vis('result-modal'),
      treasure: vis('treasure-modal'), victory: vis('victory-screen'),
      room: typeof Player !== 'undefined' ? Player.getCurrentRoom() : null,
      busy: busy
    };
  }, VIEW);
}

function anyCard(s) { return s.quiz || s.matching || s.result || s.treasure; }

/** True once a quiz question is fully painted and clickable */
async function quizReady(page) {
  return page.evaluate(() => {
    const q = (typeof Combat !== 'undefined') && Combat.getCurrentQuestion();
    const btns = document.querySelectorAll('#quiz-modal .answer-btn');
    return !!q && btns.length === q.options.length &&
      Array.from(btns).every((b, j) => !b.disabled && b.textContent.trim() === q.options[j]);
  });
}

/**
 * Play out whatever card is on screen - a quiz, a matching board, treasure,
 * or the dragon's three in a row - at a pace that can be watched.
 */
async function playCard(page, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 180000);
  let answered = 0, stuck = 0;
  while (Date.now() < deadline) {
    const s = await state(page);
    if (s.victory) return 'victory';
    if (s.matching) {
      const pairs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#matching-modal .matching-item[data-side="left"]:not(.matched)'))
          .map(b => Number(b.dataset.pairIndex)));
      if (!pairs.length) { await wait(400); continue; }
      for (const k of pairs) {
        await page.evaluate(i => {
          const b = document.querySelector('#matching-modal .matching-item[data-side="left"][data-pair-index="' + i + '"]');
          if (b && !b.disabled) b.click();
        }, k);
        await wait(420);
        await page.evaluate(i => {
          const b = document.querySelector('#matching-modal .matching-item[data-side="right"][data-pair-index="' + i + '"]');
          if (b && !b.disabled) b.click();
        }, k);
        await wait(620);
      }
      answered++;
      continue;
    }
    if (s.quiz) {
      if (!(await quizReady(page))) {
        if (++stuck > 80) { log('  the quiz will not take an answer'); return 'stuck'; }
        await wait(300);
        continue;
      }
      stuck = 0;
      await wait(answered === 0 ? 2000 : 1500);       // long enough to read
      await page.evaluate(() => {
        const q = Combat.getCurrentQuestion();
        document.querySelectorAll('#quiz-modal .answer-btn')[q.correctIndex].click();
      });
      answered++;
      await wait(900);
      continue;
    }
    if (s.treasure) {
      await wait(1600);
      await page.evaluate(() => {
        const b = document.querySelector('#treasure-modal button');
        if (b) b.click();
      });
      await wait(700);
      continue;
    }
    if (s.result) {
      await wait(2200);                                // read the result card
      const pressed = await page.evaluate(() => {
        const b = document.getElementById('continue-btn');
        if (b && !b.disabled) { b.click(); return true; }
        return false;
      });
      if (!pressed) { await wait(400); continue; }
      await wait(700);
      continue;
    }
    if (!s.busy) {
      await wait(400);
      const s2 = await state(page);
      if (s2.victory) return 'victory';
      if (!s2.busy && !anyCard(s2)) return answered ? 'done' : 'none';
    }
    await wait(350);
  }
  return 'timeout';
}

/** Wait until the game takes a move again, or a card opens */
async function settle(page, ms) {
  const deadline = Date.now() + (ms || 20000);
  while (Date.now() < deadline) {
    const s = await state(page);
    if (anyCard(s) || s.victory || !s.busy) return s;
    await wait(180);
  }
  return state(page);
}

/** The next room on the shortest way to a target, over the room graph */
async function nextHop(page, target) {
  return page.evaluate(target => {
    const from = Player.getCurrentRoom();
    if (from === target) return null;
    const prev = {}, seen = {};
    seen[from] = true;
    let queue = [from];
    while (queue.length) {
      const next = [];
      for (const id of queue) {
        const room = Dungeon.getRoom(id);
        for (const to of (room && room.connections) || []) {
          if (seen[to]) continue;
          seen[to] = true;
          prev[to] = id;
          if (to === target) {
            let at = to;
            while (prev[at] !== from) at = prev[at];
            return at;
          }
          next.push(to);
        }
      }
      queue = next;
    }
    return null;
  }, target);
}

/** Move into a neighbouring room the way a player would */
async function moveTo(page, roomId) {
  const ok = await page.evaluate((view, roomId) => {
    if (view === 'iso') { ProtoIso.tapRoom(roomId); return true; }
    const btn = document.querySelector('#direction-bar .dir-btn[data-room="' + roomId + '"]:not([disabled])');
    if (!btn) return false;
    btn.scrollIntoView({ block: 'center' });
    btn.click();
    return true;
  }, VIEW, roomId);
  await wait(ok ? 700 : 300);
  return settle(page, 15000);
}

async function start(page) {
  if (VIEW === 'iso') {
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Owl&action=new&level=dungeon&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => typeof ProtoIso !== 'undefined' && ProtoIso.getScene() && !ProtoIso.isBusy(),
      { timeout: 60000 });
    return;
  }
  await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
  await page.waitForSelector('#new-game-btn', { visible: true, timeout: 30000 });
  await page.evaluate(() => {
    const card = document.querySelector('.view-card[data-view="classic"]');
    if (card) card.click();
  });
  await page.type('#player-name', 'Owl', { delay: 60 });
  await wait(300);
  await page.click('#new-game-btn');
  await page.waitForFunction(() => {
    const g = document.getElementById('game-screen');
    return g && !g.classList.contains('hidden');
  }, { timeout: 30000 });
}

/* ------------------------------------------------------------------- video */

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), VIEW + '-frames-'));
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(800);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox'].concat(SOFTWARE
      ? ['--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--enable-gpu', '--use-angle=metal'])
      .concat(['--window-size=' + WIDTH + ',' + HEIGHT, '--autoplay-policy=no-user-gesture-required',
               '--hide-scrollbars'])
  });
  const frames = [];
  let won = false;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    page.on('pageerror', e => log('page error: ' + e));
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) log('console error: ' + m.text().slice(0, 160)); });

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

    log('recording (' + VIEW + ')');
    await start(page);
    await wait(2500);                                  // a moment at the entrance

    const bossId = await page.evaluate(() => Dungeon.getBossId());
    log('  the dragon waits in ' + bossId);
    let arrived = false;
    for (let leg = 0; leg < 80 && !arrived; leg++) {
      const s = await state(page);
      if (s.victory) { arrived = true; break; }
      if (anyCard(s)) { log('  a monster blocks the way'); await playCard(page); continue; }
      if (s.busy) { await settle(page, 15000); continue; }
      if (s.room === bossId) { arrived = true; break; }
      const hop = await nextHop(page, bossId);
      if (!hop) { log('  no way on from ' + s.room); break; }
      const after = await moveTo(page, hop);
      if (anyCard(after)) { log('  a monster blocks the way'); await playCard(page); }
      const now = await state(page);
      if (now.room === bossId) arrived = true;
    }
    if (!arrived) throw new Error('never reached the dragon');
    log('  the dragon rises');
    await wait(1200);
    const end = await playCard(page, 300000);
    log('  ' + end);
    won = await page.waitForFunction(() => {
      const v = document.getElementById('victory-screen');
      return v && !v.classList.contains('hidden');
    }, { timeout: 60000 }).then(() => true).catch(() => { log('  no victory screen'); return false; });
    await wait(6000);
    await client.send('Page.stopScreencast');
    await wait(400);
  } catch (e) {
    log('recording stopped early: ' + e.message);
  } finally {
    await browser.close();
    server.kill();
  }

  if (frames.length < 10) { console.error('only ' + frames.length + ' frames captured'); process.exit(1); }
  log('captured ' + frames.length + ' frames over ' +
    (frames[frames.length - 1].ts - frames[0].ts).toFixed(1) + ' s' + (won ? ', dragon beaten' : ''));

  const listFile = path.join(frameDir, 'list.txt');
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const dur = i + 1 < frames.length ? Math.min(2, Math.max(0.01, frames[i + 1].ts - frames[i].ts)) : 0.1;
    list += "file '" + frames[i].file + "'\nduration " + dur.toFixed(3) + '\n';
  }
  list += "file '" + frames[frames.length - 1].file + "'\n";
  fs.writeFileSync(listFile, list);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const enc = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
    '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  if (enc.status !== 0) process.exit(enc.status || 1);
  if (!KEEP) fs.rmSync(frameDir, { recursive: true, force: true });
  log('wrote ' + path.relative(ROOT, OUT) + ' (' + (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB)');
  if (!won) process.exit(3);
}

main().catch(e => { console.error(e); process.exit(2); });
