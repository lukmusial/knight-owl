#!/usr/bin/env node
/**
 * Records a playthrough of the 3D (first-person) view as a video.
 *
 *   node tools/smoke/fp-record.js --mode explore --seconds 60 --out docs/videos/3d-explore.mp4
 *   node tools/smoke/fp-record.js --mode dragon --out docs/videos/3d-dragon.mp4
 *
 * It plays with the same controls a player has: ProtoFp.runCommand to turn
 * and step, and the quiz and matching cards answered on screen. "explore"
 * wanders the dungeon for a while; "dragon" walks the shortest way to the
 * boss chamber, fighting whatever is in the way, and beats the dragon.
 *
 * Frames come over the DevTools screencast carrying their own timestamps,
 * so the encode keeps real time. Chrome stays headless and renders on the
 * GPU through Metal; pass --software where that is unavailable. No sound.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8096));
const WIDTH = Number(opt('--width', 1000));
const HEIGHT = Number(opt('--height', 700));
const MODE = opt('--mode', 'explore');
const SECONDS = Number(opt('--seconds', 60));
const CRF = opt('--crf', '31');
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/3d-' + MODE + '.mp4'));
const SOFTWARE = args.indexOf('--software') !== -1;
const KEEP = args.indexOf('--keep-frames') !== -1;

const wait = ms => new Promise(r => setTimeout(r, ms));
const log = (...m) => console.log(...m);

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
  return page.evaluate(() => {
    const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
    const st = (typeof FpWorld !== 'undefined') ? FpWorld.getState() : null;
    return {
      quiz: vis('quiz-modal'), matching: vis('matching-modal'), result: vis('result-modal'),
      treasure: vis('treasure-modal'), victory: vis('victory-screen'),
      room: st ? st.roomId : null, facing: st ? st.facing : null,
      busy: (typeof ProtoFp !== 'undefined') ? ProtoFp.getDebugState().busy : true
    };
  });
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

/** Wait for the game to accept controls again */
async function settle(page, ms) {
  const deadline = Date.now() + (ms || 20000);
  while (Date.now() < deadline) {
    const s = await state(page);
    if (anyCard(s) || s.victory) return s;
    if (!s.busy) {
      const free = await page.evaluate(() => !ProtoFp.getDebugState().busy && !FpRenderer.isBusy());
      if (free) return s;
    }
    await wait(180);
  }
  return state(page);
}

/** One command, the way the on-screen pad sends it */
async function command(page, cmd) {
  await page.evaluate(c => ProtoFp.runCommand(c), cmd);
  await wait(120);
  await settle(page, 12000);
}

/** Shortest route between two chambers, as a list of room ids */
async function route(page, toId) {
  return page.evaluate(target => {
    const w = FpWorld.getWorld();
    const from = FpWorld.getState().roomId;
    if (from === target) return [];
    const prev = {}, seen = {};
    seen[from] = true;
    let queue = [from];
    while (queue.length) {
      const next = [];
      for (const id of queue) {
        const cell = w.cells[id];
        for (const d of FpWorld.DIRS) {
          const to = cell.exits[d];
          if (!to || seen[to]) continue;
          seen[to] = true;
          prev[to] = id;
          if (to === target) {
            const out = [to];
            let at = to;
            while (prev[at]) { at = prev[at]; if (at !== from) out.unshift(at); }
            return out;
          }
          next.push(to);
        }
      }
      queue = next;
    }
    return null;
  }, toId);
}

/** Turn to face a neighbour and step into it, fighting whatever appears */
async function stepTo(page, roomId) {
  for (let guard = 0; guard < 6; guard++) {
    const turn = await page.evaluate(target => {
      const w = FpWorld.getWorld();
      const st = FpWorld.getState();
      const cell = w.cells[st.roomId];
      let want = null;
      for (const d of FpWorld.DIRS) if (cell.exits[d] === target) want = d;
      if (!want) return { done: true };
      if (want === st.facing) return { go: true };
      const order = FpWorld.DIRS;
      const from = order.indexOf(st.facing), to = order.indexOf(want);
      const right = (to - from + 4) % 4;
      return { cmd: right <= 2 ? 'turnRight' : 'turnLeft' };
    }, roomId);
    if (turn.done) return 'no-exit';
    if (turn.go) break;
    await command(page, turn.cmd);
    const s = await state(page);
    if (anyCard(s)) return 'card';
  }
  await command(page, 'forward');
  const s = await state(page);
  if (anyCard(s)) return 'card';
  return 'moved';
}

/* ------------------------------------------------------------------- video */

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fp-frames-'));
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
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    page.on('pageerror', e => log('page error: ' + e));
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) log('console error: ' + m.text().slice(0, 160)); });
    await page.goto('http://localhost:' + PORT + '/proto/first-person.html?name=Owl&action=new',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoFp && ProtoFp.getDebugState().gameInProgress && document.querySelector('canvas'),
      { timeout: 40000 });
    await wait(2500);

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

    log('recording (' + MODE + ')');
    await wait(2500);                                  // a moment at the entrance

    if (MODE === 'dragon') {
      const bossId = await page.evaluate(() => Dungeon.getBossId());
      log('  the dragon waits in ' + bossId);
      let arrived = false;
      for (let leg = 0; leg < 60 && !arrived; leg++) {
        const s = await state(page);
        if (anyCard(s)) { log('  a monster blocks the way'); await playCard(page); continue; }
        const path2 = await route(page, bossId);
        if (!path2) { log('  no route to the dragon'); break; }
        if (!path2.length) { arrived = true; break; }
        const how = await stepTo(page, path2[0]);
        if (how === 'card') { log('  a monster blocks the way'); await playCard(page); }
        if (how === 'no-exit') break;
        const now = await page.evaluate(() => FpWorld.getState().roomId);
        if (now === bossId) arrived = true;
      }
      if (!arrived) throw new Error('never reached the dragon');
      log('  the dragon rises');
      await wait(1200);
      const end = await playCard(page, 300000);
      log('  ' + end);
      await page.waitForFunction(() => {
        const v = document.getElementById('victory-screen');
        return v && !v.classList.contains('hidden');
      }, { timeout: 60000 }).catch(() => log('  no victory screen'));
      await wait(6000);
    } else {
      // wander: step on, turning when the way ahead is blocked, and fight
      // whatever comes out of the dark
      const until = Date.now() + SECONDS * 1000;
      let since = 0;
      while (Date.now() < until) {
        const s = await state(page);
        if (anyCard(s)) { await playCard(page); continue; }
        const can = await page.evaluate(() => FpWorld.canStepForward());
        if (!can || since > 3) {
          await command(page, Math.random() < 0.5 ? 'turnLeft' : 'turnRight');
          since = 0;
          continue;
        }
        await command(page, 'forward');
        since++;
      }
    }

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
    (frames[frames.length - 1].ts - frames[0].ts).toFixed(1) + ' s');

  const listFile = path.join(frameDir, 'list.txt');
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const dur = i + 1 < frames.length ? Math.min(2, Math.max(0.01, frames[i + 1].ts - frames[i].ts)) : 0.1;
    list += "file '" + frames[i].file + "'\nduration " + dur.toFixed(3) + '\n';
  }
  list += "file '" + frames[frames.length - 1].file + "'\n";
  fs.writeFileSync(listFile, list);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const enc = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
    '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  if (enc.status !== 0) process.exit(enc.status || 1);
  if (!KEEP) fs.rmSync(frameDir, { recursive: true, force: true });
  log('wrote ' + path.relative(ROOT, OUT) + ' (' + (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB)');
}

main().catch(e => { console.error(e); process.exit(2); });
