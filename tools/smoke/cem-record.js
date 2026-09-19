#!/usr/bin/env node
/**
 * Records a full cemetery playthrough as a video, gate to Grim Reaper.
 *
 *   node tools/smoke/cem-record.js [--out docs/videos/cemetery-playthrough.mp4]
 *                                  [--port 8094] [--width 1000] [--height 700]
 *
 * Runs the game in headless Chrome, plays it the way a player would (taps the
 * furthest tile it can actually see, fights whatever walks into Mr Owl,
 * answers the quizzes and the matching boards correctly, collects the four
 * skeleton key parts, opens the great tomb and beats the Reaper), and grabs
 * the frames over the DevTools screencast. Frames carry their own timestamps,
 * so the encode keeps real time whatever rate the page renders at. Chrome
 * stays headless: it renders on the GPU through Metal, which is about four
 * times faster than the software rasteriser, without opening a window. Pass
 * --software if that path is unavailable. No sound: the music is not captured.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8094));
const WIDTH = Number(opt('--width', 1000));
const HEIGHT = Number(opt('--height', 700));
const OUT = path.resolve(ROOT, opt('--out', 'docs/videos/cemetery-playthrough.mp4'));
const KEEP = args.indexOf('--keep-frames') !== -1;
const SOFTWARE = args.indexOf('--software') !== -1;   // fall back when the GPU path is unavailable
const CRF = opt('--crf', '31');

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
    const L = typeof ProtoCem !== 'undefined' && ProtoCem.getLevel();
    return {
      quiz: vis('quiz-modal'), matching: vis('matching-modal'), result: vis('result-modal'), victory: vis('victory-screen'),
      busy: typeof ProtoCem !== 'undefined' ? ProtoCem.isBusy() : true,
      owl: L ? { gx: L.owl.gx, gy: L.owl.gy } : null,
      keys: L ? CemModel.keyPartCount(L) : 0,
      completed: L ? !!L.completed : false
    };
  });
}

/** True once a quiz question is fully painted and clickable */
async function quizReady(page) {
  return page.evaluate(() => {
    const q = typeof Combat !== 'undefined' && Combat.getCurrentQuestion();
    const btns = document.querySelectorAll('#quiz-modal .answer-btn');
    return !!q && btns.length === q.options.length &&
      Array.from(btns).every((b, j) => !b.disabled && b.textContent.trim() === q.options[j]);
  });
}

/**
 * Play out whatever encounter is on screen, correctly, at a watchable pace:
 * quiz cards, matching boards and the Reaper's three in a row all end the
 * same way, on the result card and its continue button.
 */
async function playEncounter(page, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 120000);
  let answered = 0, stuck = 0;
  while (Date.now() < deadline) {
    const st = await state(page);
    if (st.victory) return 'victory';
    if (st.matching) {
      const pairs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#matching-modal .matching-item[data-side="left"]:not(.matched)'))
          .map(b => Number(b.dataset.pairIndex)));
      if (!pairs.length) { await wait(400); continue; }
      for (const k of pairs) {
        await page.evaluate(i => {
          const b = document.querySelector('#matching-modal .matching-item[data-side="left"][data-pair-index="' + i + '"]');
          if (b && !b.disabled) b.click();
        }, k);
        await wait(450);
        await page.evaluate(i => {
          const b = document.querySelector('#matching-modal .matching-item[data-side="right"][data-pair-index="' + i + '"]');
          if (b && !b.disabled) b.click();
        }, k);
        await wait(650);
      }
      answered++;
      continue;
    }
    if (st.quiz) {
      if (!(await quizReady(page))) {
        stuck++;
        if (stuck > 60) { log('  quiz will not accept an answer, giving up on it'); return 'stuck'; }
        await wait(300); continue;
      }
      stuck = 0;
      await wait(answered === 0 ? 2000 : 1500);            // long enough to read
      await page.evaluate(() => {
        const q = Combat.getCurrentQuestion();
        document.querySelectorAll('#quiz-modal .answer-btn')[q.correctIndex].click();
      });
      answered++;
      await wait(900);
      continue;
    }
    if (st.result) {
      await wait(2200);                                    // read the result card
      const pressed = await page.evaluate(() => {
        const b = document.getElementById('continue-btn');
        if (b && !b.disabled) { b.click(); return true; }
        return false;
      });
      if (!pressed) { await wait(400); continue; }
      await wait(600);
      continue;
    }
    if (!st.busy) { await wait(500); const s2 = await state(page);
      if (s2.victory) return 'victory';
      if (!s2.busy && !s2.quiz && !s2.matching && !s2.result) return answered ? 'done' : 'none'; }
    await wait(400);
  }
  return 'timeout';
}

/** Wait a moment for an encounter to open after Mr Owl steps somewhere */
async function encounterStarts(page, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const st = await state(page);
    if (st.quiz || st.matching || st.result) return true;
    await wait(250);
  }
  return false;
}

/** Tap the furthest tile on the route that Mr Owl can actually see, and repeat. */
async function walkTo(page, target, label) {
  log('  walk to ' + label);
  const deadline = Date.now() + 90000;
  let quiet = false;
  while (Date.now() < deadline) {
    const st = await state(page);
    if (st.quiz || st.matching || st.result) return 'encounter';
    if (st.owl.gx === target.gx && st.owl.gy === target.gy) return 'arrived';
    const step = await page.evaluate(t => {
      const L = ProtoCem.getLevel();
      const from = CemModel.owlTile(L);
      const full = CemModel.pathTo(L, from, t);
      if (!full.length) return { none: 'no path', ahead: { x: t.gx - from.gx, y: t.gy - from.gy } };
      let pick = null;
      for (const s of full) if (CemModel.visibilityAt(L, s.gx, s.gy) > 0) pick = s;
      if (!pick) {
        const n = full[0];
        return { none: 'nothing lit on the way', ahead: { x: n.gx - from.gx, y: n.gy - from.gy } };
      }
      ProtoCem.onTileTap(pick.gx, pick.gy);
      return pick;
    }, target);
    if (step && step.none) {
      // tap-to-walk needs a lit tile and a route; when there is neither, push
      // the stick that way instead, exactly as a player would
      if (!quiet) { log('  (' + step.none + ', steering instead)'); quiet = true; }
      const a = step.ahead;
      const len = Math.sqrt(a.x * a.x + a.y * a.y) || 1;
      await page.evaluate(v => ProtoCem.setSteer(v[0], v[1]), [a.x / len, a.y / len]);
      await wait(700);
      await page.evaluate(() => ProtoCem.setSteer(0, 0));
      continue;
    }
    quiet = false;
    // walk until he stops, or something interrupts him
    const stop = Date.now() + 30000;
    while (Date.now() < stop) {
      await wait(350);
      const s2 = await page.evaluate(p => {
        const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
        const L = ProtoCem.getLevel();
        return { hit: vis('quiz-modal') || vis('matching-modal') || vis('result-modal'),
          there: L.owl.gx === p.gx && L.owl.gy === p.gy, walking: !!(L.owl.path && L.owl.path.length) };
      }, step);
      if (s2.hit) return 'encounter';
      if (s2.there || !s2.walking) break;
    }
  }
  return 'timeout';
}

/** Walk to a place, fighting anything that gets in the way. */
async function travel(page, target, label) {
  for (let i = 0; i < 12; i++) {
    const how = await walkTo(page, target, label);
    if (how === 'arrived') return true;
    if (how === 'encounter') {
      log('  a monster attacks');
      await playEncounter(page);
      continue;
    }
    if (how === 'timeout') return false;
  }
  return false;
}

/* ------------------------------------------------------------------- video */

async function main() {
  if (!spawnSync('ffmpeg', ['-version']).stdout) { console.error('ffmpeg not found'); process.exit(1); }
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-frames-'));
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox'].concat(SOFTWARE
      ? ['--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--enable-gpu', '--use-angle=metal'])                // headless still, just not software rendered
      .concat(['--window-size=' + WIDTH + ',' + HEIGHT, '--autoplay-policy=no-user-gesture-required',
               '--hide-scrollbars'])
  });
  const frames = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    page.on('pageerror', e => log('page error: ' + e));
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) log('console error: ' + m.text().slice(0, 160)); });
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Owl&action=new&level=cemetery&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 40000 });

    const client = await page.createCDPSession();
    let n = 0;
    client.on('Page.screencastFrame', async ev => {
      const file = path.join(frameDir, 'f' + String(n++).padStart(6, '0') + '.jpg');
      frames.push({ ts: ev.metadata.timestamp, file: file });
      fs.writeFile(file, Buffer.from(ev.data, 'base64'), () => {});
      try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { /* closed */ }
    });
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

    log('recording');
    await wait(3000);                                      // establishing shot at the gate

    const plan = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      const small = L.tombs.filter(t => t.size !== 'large');
      const big = L.tombs.find(t => t.size === 'large');
      const from = CemModel.owlTile(L);
      small.sort((a, b) => CemModel.pathTo(L, from, a.porch).length - CemModel.pathTo(L, from, b.porch).length);
      return { small: small.map(t => ({ id: t.id, porch: t.porch })), big: { porch: big.porch, door: big.door } };
    });

    for (const tomb of plan.small) {
      const ok = await travel(page, tomb.porch, 'tomb ' + tomb.id);
      if (!ok) { log('  could not reach ' + tomb.id + ', unsealing it'); }
      const fight = await encounterStarts(page, ok ? 12000 : 2000);
      if (fight) { log('  guardian of ' + tomb.id); await playEncounter(page); }
      else if (!ok) {
        await page.evaluate(id => { const L = ProtoCem.getLevel();
          CemModel.defeatMonster(L, 'g' + id.slice(1)); ProtoCem.getScene().removeMonster('g' + id.slice(1));
          ProtoCem.getScene().refreshTombs(); ProtoHud.setKeyParts(CemModel.keyPartCount(L), 4); }, tomb.id);
      }
      const now = await state(page);
      log('  key parts: ' + now.keys);
      await wait(1200);
    }

    log('the great tomb');
    // A wanderer often catches him on the porch, and a tap while the flow is
    // still playing that fight out is ignored, so try the door until it opens.
    var opened = false;
    for (var attempt = 0; attempt < 6 && !opened; attempt++) {
      await travel(page, plan.big.porch, 'the great tomb');
      await page.waitForFunction(() => typeof ProtoCem !== 'undefined' && !ProtoCem.isBusy(), { timeout: 30000 })
        .catch(() => {});
      await wait(900);
      const at = await state(page);
      if (at.quiz || at.matching || at.result) { await playEncounter(page); continue; }
      await page.evaluate(d => ProtoCem.onTileTap(d.gx, d.gy), plan.big.door);
      opened = await page.waitForFunction(
        () => !document.getElementById('quiz-modal').classList.contains('hidden'), { timeout: 15000 })
        .then(function() { return true; }).catch(function() { return false; });
    }
    if (!opened) throw new Error('the great tomb never opened');
    log('  the Grim Reaper rises');
    await wait(1200);
    await playEncounter(page, 240000);
    await page.waitForFunction(() => { const v = document.getElementById('victory-screen'); return v && !v.classList.contains('hidden'); }, { timeout: 60000 });
    log('  victory');
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
  const mb = (fs.statSync(OUT).size / 1048576).toFixed(1);
  log('wrote ' + path.relative(ROOT, OUT) + ' (' + mb + ' MB)');
}

main().catch(e => { console.error(e); process.exit(2); });
