#!/usr/bin/env node
/**
 * Headless smoke test of the Halloween cemetery level (isometric view).
 *
 *   node tools/smoke/cemetery.js [--shots docs/screenshots/cem] [--port 8089]
 *
 * Starts a static server on www/, drives the page with puppeteer-core in
 * headless Chrome (no window, no tab throttling) and walks the whole loop:
 * boot, walk into a monster and lose (back to the gate), beat a tomb
 * guardian (key part), open the great tomb with four parts, beat the Grim
 * Reaper (three in a row), victory screen, then continue the save. Exits
 * non-zero on the first failed check. Writes screenshots when --shots is set.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8089));
const SHOTS = opt('--shots', null);
const CHROME = opt('--chrome', findChrome());

function findChrome() {
  const cands = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
  ];
  const cache = path.join(process.env.HOME || '', '.cache', 'puppeteer', 'chrome');
  if (fs.existsSync(cache)) {
    for (const v of fs.readdirSync(cache)) {
      const p = path.join(cache, v, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
      const p2 = path.join(cache, v, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
      cands.unshift(p, p2);
    }
  }
  return cands.find(fs.existsSync);
}

let failures = 0;
function check(cond, msg) {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg);
  if (!cond) failures++;
}

async function shot(page, name) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
}

const wait = ms => new Promise(r => setTimeout(r, ms));
let errorSink = null;

/** The result card unlocks its Continue button after a few seconds */
async function pressContinue(page) {
  await waitFor(page, () => { const b = document.getElementById('continue-btn'); return b && !b.disabled; }, 'the continue button');
  await page.evaluate(() => document.getElementById('continue-btn').click());
}

/** waitForFunction that dumps the game state when it times out */
async function waitFor(page, fn, what, arg) {
  try {
    await page.waitForFunction(fn, { timeout: 20000 }, arg);
  } catch (e) {
    const state = await page.evaluate(() => {
      const L = window.ProtoCem && ProtoCem.getLevel();
      const hid = id => { const el = document.getElementById(id); return el ? el.classList.contains('hidden') : 'none'; };
      return { owl: L && L.owl, enc: L && L.encounterUid, busy: window.ProtoCem && ProtoCem.isBusy(), moving: L && ProtoCem.getScene() && ProtoCem.getScene().moving,
        quizHidden: hid('quiz-modal'), resultHidden: hid('result-modal'), matchingHidden: hid('matching-modal'), victoryHidden: hid('victory-screen'),
        combat: typeof Combat !== 'undefined' && Combat.hasActiveEncounter(), stats: typeof Player !== 'undefined' && Player.getQuestionStats() };
    });
    console.log('   timed out waiting for ' + what + '; state: ' + JSON.stringify(state));
    if (typeof errorSink === 'function') {
      var errs = errorSink();
      if (errs.length) console.log('   page errors: ' + errs.slice(0, 3).join(' | '));
    }
    throw e;
  }
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1200,860', '--autoplay-policy=no-user-gesture-required']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 860 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    errorSink = () => errors;
    page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
    const base = 'http://localhost:' + PORT + '/proto/isometric.html';

    console.log('boot');
    await page.goto(base + '?name=Smoke&action=new&level=cemetery', { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });
    const boot = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      return { seed: L.seed, valid: CemModel.validate(L).ok, monsters: L.monsters.length, level: ProtoSession.currentRunLevel(), keys: CemModel.keyPartCount(L), title: document.getElementById('room-description').innerText };
    });
    check(boot.valid, 'level valid (seed ' + boot.seed + ')');
    // quiz encounters only: the matching board is covered by its own tests
    await page.evaluate(() => { ProtoCem.getLevel().monsters.forEach(m => { m.encounterType = 'quiz'; m.matchingCategory = null; }); });
    check(boot.level === 'cemetery', 'session level is cemetery');
    check(/Cemetery Gate/.test(boot.title), 'ribbon shows the gate');
    const veil = await page.evaluate(() => (document.querySelector('#iso-loading .bi-en') || {}).textContent || '');
    check(/haunted cemetery/i.test(veil), 'the loading veil spoke of the cemetery, not the dungeon');
    await shot(page, '01-gate');

    console.log('steering');
    const steered = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
let errorSink = null;
      const L = ProtoCem.getLevel();
      // stand on a wide lane far from monsters, then push the stick
      window.__saved = L.monsters.map(m => ({ uid: m.uid, gx: m.gx, gy: m.gy, home: m.home, stepMs: m.stepMs }));
      L.monsters.forEach(m => { if (m.role === 'wander') { m.gx = 1; m.gy = 1; m.home = { gx: 1, gy: 1 }; m.stepMs = 1e9; } });
      const lane = L.tiles.find(t => t.kind === 'path' && t.dist > 10 && CemModel.tileAt(L, t.gx, t.gy - 1).kind === 'path' && CemModel.tileAt(L, t.gx, t.gy - 2).kind === 'path');
      ProtoCem.teleport(lane.gx, lane.gy);
      L.graceMs = 0;
      const before = { x: L.owl.x, y: L.owl.y };
      // headless throttles the render loop, so measure against the frame time
      // the model actually received rather than against the wall clock
      let frameMs = 0;
      const tick = CemModel.tickOwl;
      CemModel.tickOwl = function(lv, st, dt) { frameMs += dt; return tick(lv, st, dt); };
      ProtoCem.setSteer(0, -1);
      await wait(700);
      ProtoCem.setSteer(0, 0);
      CemModel.tickOwl = tick;
      const after = { x: L.owl.x, y: L.owl.y };
      await wait(150);
      const stopped = Math.abs(L.owl.y - after.y) < 0.05;
      const fps = ProtoCem.getScene().sys.game.loop.actualFps;
      window.__saved.forEach(sv => { const m = L.monstersByUid[sv.uid]; m.gx = sv.gx; m.gy = sv.gy; m.home = sv.home; m.stepMs = sv.stepMs; });
      return { moved: before.y - after.y, drift: Math.abs(after.x - before.x), stopped, fps, frameMs,
        expected: CemModel.CONFIG.OWL_SPEED * frameMs / 1000,
        onLane: CemModel.fitsCircle(L, L.owl.x, L.owl.y, CemModel.CONFIG.OWL_RADIUS) };
    });
    check(steered.moved > 0.1 && Math.abs(steered.moved - steered.expected) < 0.15,
      'steering walks Mr Owl north at full speed (' + steered.moved.toFixed(2) + ' of ' + steered.expected.toFixed(2) + ' tiles over ' + Math.round(steered.frameMs) + ' ms of frames, ' + Math.round(steered.fps) + ' fps)');
    check(steered.drift < 0.3, 'he keeps his line (' + steered.drift.toFixed(2) + ' tiles sideways)');
    check(steered.stopped, 'he stops when the stick is released');
    check(steered.onLane, 'he stays on the lane');

    console.log('facing and the tomb doorway');
    const look = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      const grace = L.graceMs;
      L.graceMs = 1e9;
      const seen = [];
      const dirs = [[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];
      for (const d of dirs) {
        S.faceOwl(d[0], d[1]);
        seen.push(S.owlFacing + (S.player.flipX ? ':flip' : ''));
      }
      L.graceMs = grace;
      const tomb = L.tombs.find(t => t.size !== 'large');
      const rec = S.tombObjs[tomb.id];
      let animated = null;
      for (const uid in S.monsters) {
        const st = S.monsters[uid];
        if (st.anim) { animated = { facings: st.facings, gdir: st.gdir }; break; }
      }
      return {
        owlFacings: S.owlFacings,
        distinct: seen.filter((v, i) => seen.indexOf(v) === i).length,
        door: !!rec.door, glow: !!rec.glow, spill: !!rec.spill, tint: rec.glowTint,
        animated: animated
      };
    });
    check(look.owlFacings.length === 5 && look.owlFacings.indexOf('down_right') !== -1,
      'Mr Owl has five rendered facings (' + look.owlFacings.join(', ') + ')');
    check(look.distinct === 8, 'he faces eight different ways as he walks (' + look.distinct + ')');
    check(look.glow && look.spill, 'the tomb doorway has its light and a spill on the ground');
    check(look.tint === 0xffd08a, 'a tomb still holding its key part burns gold');
    check(!!look.animated && look.animated.facings.length === 5,
      'monsters carry the same five facings' + (look.animated ? ' (' + look.animated.facings.join(', ') + ')' : ''));

    console.log('lose a fight');
    await page.evaluate(() => {
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      const walk = (gx, gy) => { const t = CemModel.tileAt(L, gx, gy); return t && t.walk && t.kind === 'path'; };
      const man = (a, b) => Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy);
      let pick = null;
      for (const w of L.monsters.filter(m => m.role === 'wander')) {
        // a path tile next to the monster, and a path tile next to that one but not next to the monster
        for (const t of L.tiles.filter(t => walk(t.gx, t.gy) && man(t, w) === 1)) {
          const near = L.tiles.find(n => walk(n.gx, n.gy) && man(n, t) === 1 && man(n, w) === 2 && man(n, L.start) > 3);
          if (near) { pick = { w, t, near }; break; }
        }
        if (pick) break;
      }
      const { w, t, near } = pick;
      L.monsters.forEach(m => { if (m.role === 'wander' && m !== w) { m.home = { gx: 1, gy: 1 }; m.gx = 1; m.gy = 1; m.stepMs = 1e9; } });
      w.stepMs = 1e9; w.home = { gx: w.gx, gy: w.gy };
      ProtoCem.teleport(near.gx, near.gy); L.graceMs = 0;
      window.__target = w.uid;
      ProtoCem.onTileTap(t.gx, t.gy);
    });
    await waitFor(page, () => !document.getElementById('quiz-modal').classList.contains('hidden'), 'the quiz');
    const enc1 = await page.evaluate(() => ({ enc: ProtoCem.getLevel().encounterUid, target: window.__target, quiz: !document.getElementById('quiz-modal').classList.contains('hidden') }));
    check(enc1.enc === enc1.target, 'encounter with the monster next to the owl (' + enc1.enc + ')');
    await shot(page, '02-attack-quiz');
    if (enc1.quiz) {
      await page.evaluate(() => {
        const q = Combat.getCurrentQuestion();
        const btns = Array.from(document.querySelectorAll('#quiz-modal .answer-btn'));
        btns[(q.correctIndex + 1) % btns.length].click();
      });
    } else {
      await page.evaluate(() => { const b = document.querySelector('#matching-modal button'); if (b) b.click(); });
      await page.evaluate(() => UI.hideMatchingModal());
    }
    await waitFor(page, () => !document.getElementById('result-modal').classList.contains('hidden'), 'the result card');
    await shot(page, '03-wrong-answer');
    await pressContinue(page);
    await waitFor(page, () => !ProtoCem.isBusy(), 'the flow to settle');
    const afterLose = await page.evaluate(() => { const L = ProtoCem.getLevel(); return { owl: L.owl, start: L.start, enc: L.encounterUid, grace: L.graceMs }; });
    check(afterLose.owl.gx === afterLose.start.gx && afterLose.owl.gy === afterLose.start.gy, 'after a loss Mr Owl is back at the gate');
    check(afterLose.enc === null, 'encounter cleared');
    await shot(page, '04-back-at-gate');

    console.log('beat a tomb guardian');
    await page.evaluate(() => {
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      const t1 = L.tombs.find(t => t.id === 't1');
      const near = L.tiles.find(t => t.walk && t.kind === 'path' && Math.abs(t.gx - t1.porch.gx) + Math.abs(t.gy - t1.porch.gy) === 1 && !(t.gx === t1.door.gx && t.gy === t1.door.gy));
      ProtoCem.teleport(near.gx, near.gy); L.graceMs = 0;
      ProtoCem.onTileTap(t1.porch.gx, t1.porch.gy);
    });
    await waitFor(page, () => !document.getElementById('quiz-modal').classList.contains('hidden'), 'the guardian quiz');
    const enc2 = await page.evaluate(() => ({ enc: ProtoCem.getLevel().encounterUid, quiz: !document.getElementById('quiz-modal').classList.contains('hidden') }));
    check(enc2.enc === 'g1', 'the guardian of tomb 1 attacks');
    await shot(page, '05-guardian-quiz');
    if (enc2.quiz) {
      await page.evaluate(() => {
        const q = Combat.getCurrentQuestion();
        document.querySelectorAll('#quiz-modal .answer-btn')[q.correctIndex].click();
      });
      await waitFor(page, () => !document.getElementById('result-modal').classList.contains('hidden'), 'the result card');
      await pressContinue(page);
    } else {
      // matching: resolve through the model to keep the smoke test short
      await page.evaluate(() => { UI.hideMatchingModal(); });
      await page.evaluate(() => {
        const L = ProtoCem.getLevel();
        CemModel.defeatMonster(L, 'g1');
      });
    }
    await waitFor(page, () => !ProtoCem.isBusy(), 'the flow to settle');
    const afterGuard = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      return { defeated: L.monstersByUid.g1.defeated, keys: CemModel.keyPartCount(L), have: document.querySelectorAll('.hud-key.have').length,
        inv: Player.getInventory().filter(i => i.id === 'skeleton_key_part').length };
    });
    check(afterGuard.defeated, 'guardian defeated');
    check(afterGuard.keys === 1, 'one key part held');
    check(afterGuard.have === 1, 'key dock shows one part');
    await shot(page, '06-key-part');

    console.log('the great tomb and the reaper');
    await page.evaluate(() => {
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      ['g2', 'g3', 'g4'].forEach(uid => { CemModel.defeatMonster(L, uid); S.removeMonster(uid); });
      S.refreshTombs();
      ProtoHud.setKeyParts(CemModel.keyPartCount(L), 4);
      const big = L.tombs.find(t => t.size === 'large');
      L.monsters.forEach(m => { if (m.role === 'wander') { m.home = { gx: 0, gy: 0 }; m.stepMs = 1e9; if (Math.abs(m.gx - big.porch.gx) + Math.abs(m.gy - big.porch.gy) < 4) { m.gx = 1; m.gy = 1; } } });
      ProtoCem.teleport(big.porch.gx, big.porch.gy); L.graceMs = 0;
      window.__unlocked = CemModel.canEnter(L, big.door.gx, big.door.gy);
      ProtoCem.onTileTap(big.door.gx, big.door.gy);
    });
    check(await page.evaluate(() => window.__unlocked), 'great tomb unlocked with four parts');
    await waitFor(page, () => !document.getElementById('quiz-modal').classList.contains('hidden'), 'the reaper quiz');
    const boss = await page.evaluate(() => ({ enc: ProtoCem.getLevel().encounterUid, dots: document.querySelectorAll('#quiz-modal .streak-dot').length, label: (document.querySelector('#quiz-modal .streak-label') || {}).innerText,
      rose: ProtoCem.getLevel().bossRevealed, standing: !!(ProtoCem.getScene().monsters.boss && ProtoCem.getScene().monsters.boss.shown) }));
    check(boss.enc === 'boss', 'reaper encounter');
    check(boss.rose && boss.standing, 'the Reaper rose from the tomb as Mr Owl came near');
    check(boss.dots === 3, 'three streak dots');
    check(/Reaper/.test(boss.label || ''), 'reaper challenge label');
    await shot(page, '07-reaper');
    for (let i = 0; i < 3; i++) {
      // the card re-renders after the answer effects: wait for the current question to be on screen
      await waitFor(page, () => { const q = Combat.getCurrentQuestion(); const btns = document.querySelectorAll('#quiz-modal .answer-btn');
        return q && btns.length === q.options.length && Array.from(btns).every((b, j) => !b.disabled && b.textContent.trim() === q.options[j]); }, 'question ' + (i + 1) + ' on screen');
      await page.evaluate(() => {
        const q = Combat.getCurrentQuestion();
        document.querySelectorAll('#quiz-modal .answer-btn')[q.correctIndex].click();
      });
      if (i < 2) await waitFor(page, n => Player.getDragonStreak() === n, 'streak ' + (i + 1), i + 1);
    }
    await waitFor(page, () => !document.getElementById('result-modal').classList.contains('hidden'), 'the result card');
    await shot(page, '08-reaper-beaten');
    await pressContinue(page);
    await waitFor(page, () => { const v = document.getElementById('victory-screen'); return v && !v.classList.contains('hidden'); }, 'the victory screen');
    const victory = await page.evaluate(() => ({ text: document.getElementById('victory-screen').innerText.slice(0, 300), completed: ProtoCem.getLevel().completed, save: Save.hasSave('Smoke') }));
    check(/Reaper|Żniwiarz/.test(victory.text), 'victory screen names the reaper');
    check(victory.completed, 'level completed');
    check(!victory.save, 'save removed after the win');
    await shot(page, '09-victory');

    console.log('continue a cemetery save');
    await page.goto(base + '?name=Smoke2&action=new&level=cemetery', { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });
    const seed = await page.evaluate(() => { const L = ProtoCem.getLevel(); CemModel.defeatMonster(L, 'g2'); ProtoSession.autoSave(); return L.seed; });
    await page.goto(base + '?name=Smoke2&action=continue', { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });
    const restored = await page.evaluate(() => { const L = ProtoCem.getLevel(); return { seed: L.seed, keys: CemModel.keyPartCount(L), level: ProtoSession.currentRunLevel(), picker: !!document.getElementById('iso-level-picker') }; });
    check(restored.seed === seed && restored.keys === 1 && restored.level === 'cemetery', 'continue restores the same cemetery and its key part');
    check(!restored.picker, 'no level picker on continue');

    console.log('level picker on a fresh run');
    await page.goto(base + '?name=Smoke3&action=new', { waitUntil: 'load' });
    await page.waitForSelector('#iso-level-picker', { timeout: 15000 });
    await shot(page, '10-level-picker');
    await page.click('.iso-level-card[data-level="dungeon"]');
    await page.waitForFunction(() => window.ProtoIso && ProtoIso.getScene(), { timeout: 30000 });
    const dungeon = await page.evaluate(() => ({ level: ProtoIso.getLevel(), room: Player.getCurrentRoom() }));
    check(dungeon.level === 'dungeon' && !!dungeon.room, 'dungeon still starts from the picker');

    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
