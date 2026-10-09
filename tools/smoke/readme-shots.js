#!/usr/bin/env node
/**
 * Takes the README screenshots of every view of the game.
 *
 *   node tools/smoke/readme-shots.js [--only cem-hero,iso] [--port 8100] [--software]
 *                                    [--out docs/screenshots]
 *
 * Starts a static server on www/ and drives headless Chrome (GPU through
 * Metal; --software for SwiftShader) through five sessions, each of which
 * writes its own shots:
 *
 *   hero     cem-hero.png          landscape 1280x720: the cemetery at night,
 *                                  rain, puddles and a lightning strike held
 *                                  at its brightest
 *   cem      cem-01..08            phone: gate, lanes and a crypt, the storm,
 *                                  quiz, sentence, matching, Reaper, victory
 *   iso      iso-01..03            phone: the isometric dungeon
 *   fp       3d-01..03             phone: the 3D view, third-person camera
 *   classic  classic-01..02        phone: launch screen and a classic room
 *
 * Phone shots are 412x915 at device scale 2 (touch), then resampled to
 * 540 px wide with sips. `--only` takes session names or shot names (a shot
 * name runs its session and keeps only that file). Encounters are chosen
 * with the monster's own `encounterType` (cemetery) or `?enc=` (dungeons),
 * answered correctly, so the run never falls back to the gate.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8100));
const OUT = path.resolve(ROOT, opt('--out', 'docs/screenshots'));
const SOFTWARE = args.indexOf('--software') !== -1;
const ONLY = (opt('--only', '') || '').split(',').filter(Boolean);
const PHONE = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const HERO = { width: 1280, height: 720, deviceScaleFactor: 1 };
const LAUNCH = { width: 1200, height: 440, deviceScaleFactor: 1 };
const PHONE_WIDTH = 540;
const BASE = 'http://localhost:' + PORT;
const Q = '&music=none&name=Owl';

const SESSIONS = {
  hero: ['cem-hero'],
  launch: ['halloween-start'],
  cem: ['cem-01-gate', 'cem-02-explore', 'cem-03-storm', 'cem-04-quiz', 'cem-05-sentence', 'cem-06-matching', 'cem-07-reaper', 'cem-08-victory'],
  iso: ['iso-01-dungeon', 'iso-02-chamber', 'iso-03-quiz'],
  fp: ['3d-01-corridor', '3d-02-monster', '3d-03-quiz'],
  classic: ['classic-01-launch', 'classic-02-room']
};

const wait = ms => new Promise(r => setTimeout(r, ms));
const log = (...m) => console.log(...m);
const written = [];

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

function wanted(name) {
  if (!ONLY.length) return true;
  return ONLY.indexOf(name) !== -1 || Object.keys(SESSIONS).some(s => ONLY.indexOf(s) !== -1 && SESSIONS[s].indexOf(name) !== -1);
}
function sessionWanted(s) { return SESSIONS[s].some(wanted); }

/** Screenshot to docs/screenshots; phone shots are resampled to PHONE_WIDTH */
async function shot(page, name, phone) {
  if (!wanted(name)) return;
  const file = path.join(OUT, name + '.png');
  await page.screenshot({ path: file });
  if (phone) spawnSync('sips', ['--resampleWidth', String(PHONE_WIDTH), file], { stdio: 'ignore' });
  written.push(name);
  log('  shot ' + path.relative(ROOT, file) + ' (' + Math.round(fs.statSync(file).size / 1024) + ' KB)');
}

async function newPage(browser, viewport, label) {
  // a fresh profile per session: no progress, saves or view choice carried over
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(viewport);
  page.on('pageerror', e => log('  [' + label + '] page error: ' + e));
  page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) log('  [' + label + '] console error: ' + m.text().slice(0, 160)); });
  return page;
}

const visible = id => `(function(){ var el = document.getElementById('${id}'); return !!el && !el.classList.contains('hidden'); })()`;

/** The result card unlocks its Continue button after a few seconds */
async function pressContinue(page) {
  await page.waitForFunction(() => { const b = document.getElementById('continue-btn'); return b && !b.disabled; }, { timeout: 20000 });
  await page.evaluate(() => document.getElementById('continue-btn').click());
}

/** Wait until a quiz question is fully painted and clickable */
async function quizReady(page) {
  await page.waitForFunction(() => {
    const q = Combat.getCurrentQuestion();
    const btns = document.querySelectorAll('#quiz-modal .answer-btn');
    return !!q && btns.length === q.options.length &&
      Array.from(btns).every((b, j) => !b.disabled && b.textContent.trim() === q.options[j]);
  }, { timeout: 20000 });
}

async function answerQuizRight(page) {
  await quizReady(page);
  await page.evaluate(() => {
    const q = Combat.getCurrentQuestion();
    document.querySelectorAll('#quiz-modal .answer-btn')[q.correctIndex].click();
  });
}

/** Solve the matching board pair by pair */
async function solveMatching(page) {
  const pairs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#matching-modal .matching-item[data-side="left"]:not(.matched)')).map(b => Number(b.dataset.pairIndex)));
  for (const k of pairs) {
    await page.evaluate(i => {
      const l = document.querySelector('#matching-modal .matching-item[data-side="left"][data-pair-index="' + i + '"]');
      if (l && !l.disabled) l.click();
      const r = document.querySelector('#matching-modal .matching-item[data-side="right"][data-pair-index="' + i + '"]');
      if (r && !r.disabled) r.click();
    }, k);
    await wait(250);
  }
}

/** Tap the next `n` words of the canonical answer into the sentence strip */
async function placeWords(page, n) {
  const words = await page.evaluate(() => Sentences.getCurrent().answers[0]);
  const upto = n == null ? words.length : Math.min(n, words.length);
  for (let i = 0; i < upto; i++) {
    await page.evaluate(w => {
      const b = Array.from(document.querySelectorAll('#sentence-pool button.sentence-tile'))
        .find(e => e.textContent.trim() === w && !e.disabled);
      if (b) b.click();
    }, words[i]);
    await wait(250);
  }
  return words;
}

/** Wait for the monster card's stage: the backdrop and the figure loaded and faded in */
async function stageSettled(page, modal) {
  await page.waitForFunction(m => {
    const el = document.getElementById(m);
    if (!el || el.classList.contains('hidden')) return false;
    const imgs = Array.from(el.querySelectorAll('img')).filter(i => i.offsetParent !== null);
    return imgs.every(i => i.complete && i.naturalWidth > 0);
  }, { timeout: 20000 }, modal).catch(() => log('  (stage images still loading in ' + modal + ')'));
  await wait(2200);
}

/* ---------------------------------------------------------------- cemetery */

async function bootCemetery(page) {
  await page.goto(BASE + '/isometric.html?action=new&level=cemetery' + Q, { waitUntil: 'load' });
  await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 60000 });
  await page.waitForFunction(() => { const v = document.getElementById('iso-loading'); return !v || v.classList.contains('hidden'); }, { timeout: 30000 });
  await page.evaluate(() => { ProtoCem.getLevel().graceMs = 1e9; });   // no fights while posing
  await wait(3000);                                                   // the ground bakes, the veil fades
}

/** Park the weather: no rain and no strikes until wound again */
async function parkWeather(page) {
  await page.evaluate(() => {
    const S = ProtoCem.getScene(), L = ProtoCem.getLevel();
    S.rainSchedule = CemRain.schedule(L.seed || 1, { FIRST_GAP_MIN_MS: 1e9, FIRST_GAP_MAX_MS: 1e9, GAP_MIN_MS: 1e9, GAP_MAX_MS: 1e9 });
    S.rainT0 = S.time.now;
    S.planStorm();
    if (S.stormStrike) S.endStrike();
  });
}

/** Rain already falling at full strength with the puddles full, the storm quiet */
async function windRain(page) {
  await page.evaluate(() => {
    const S = ProtoCem.getScene(), L = ProtoCem.getLevel();
    CemRain.CFG.RING_RATE = 8;
    S.rainSchedule = CemRain.schedule(L.seed || 1, {
      FIRST_GAP_MIN_MS: 1000, FIRST_GAP_MAX_MS: 1000, EPISODE_MIN_MS: 600000, EPISODE_MAX_MS: 600000,
      RAIN_RAMP_MS: 1000, RAIN_FADE_MS: 1000, PUDDLE_FILL_MS: 1500, PUDDLE_STAGGER_MS: 500, PUDDLE_DRY_MS: 9000,
      GAP_MIN_MS: 600000, GAP_MAX_MS: 600000
    });
    S.rainT0 = S.time.now - 20000;                                    // well into the episode
    S.planStorm({ announceMinMs: 1e9, announceMaxMs: 1e9, minGapMs: 1e9, maxGapMs: 1e9 });
    if (S.stormStrike) S.endStrike();
    S.stormNext = { at: 1e12, until: 1e12, kind: 'rain', episode: S.rainSchedule.episodes[0] };
  });
}

/**
 * Strike at a tile (or wherever the storm would aim) and freeze the game on
 * the strike's brightest moment, as cem-storm.js does. Resolves with the
 * strike, or null. Call `thaw` to let the game run again.
 */
async function strikeAndHold(page, target, seed) {
  return page.evaluate((target, seed) => new Promise(resolve => {
    const S = ProtoCem.getScene();
    const g = S.sys.game;
    if (S.stormStrike) S.endStrike();
    const o = {};
    if (target) o.target = target;
    if (seed != null) o.seed = seed;
    const s = S.strikeLightning(o);
    if (!s) { resolve(null); return; }
    const bright = CemStorm.brightest(s.seq);
    const tick = S.tickStorm;
    S.tickStorm = function() { S.applyStorm(bright.t); };
    let frames = 0;
    const hold = () => {
      if (++frames < 3) { g.events.once('postrender', hold); return; }
      g.pause();
      S.tickStorm = tick;
      s.t = bright.t;
      resolve({ gx: s.target.gx, gy: s.target.gy, dist: s.target.dist, flash: S.stormFlash.alpha });
    };
    g.events.once('postrender', hold);
  }), target, seed);
}

/**
 * A lit tile for the bolt that reads well: 3-6 tiles from Mr Owl, in the
 * lower part of the view so the bolt has room to fall, off to one side of
 * him (`side` 1 right, -1 left) and not on a tile with a prop in front.
 */
async function boltTarget(page, side) {
  return page.evaluate(side => {
    const S = ProtoCem.getScene(), L = ProtoCem.getLevel();
    const o = CemModel.owlPos(L);
    const v = S.cameras.main.worldView;
    const op = IsoModel.gridToIso(o.x, o.y);
    let best = null;
    for (let gy = Math.floor(o.y - 7); gy <= o.y + 7; gy++) {
      for (let gx = Math.floor(o.x - 7); gx <= o.x + 7; gx++) {
        const t = CemModel.tileAt(L, gx, gy);
        if (!t || !t.walk) continue;
        if (L.vis[gy * L.W + gx] !== 2) continue;
        const d = Math.sqrt((gx - o.x) * (gx - o.x) + (gy - o.y) * (gy - o.y));
        if (d < 3 || d > 6) continue;
        const p = IsoModel.gridToIso(gx, gy);
        const fx = (p.x - v.x) / v.width, fy = (p.y - v.y) / v.height;
        if (fy < 0.45 || fy > 0.8 || fx < 0.12 || fx > 0.88) continue;
        if ((p.x - op.x) * side < 60) continue;
        const score = -Math.abs(fy - 0.6) - Math.abs(Math.abs(fx - 0.5) - 0.25);
        if (!best || score > best.score) best = { gx, gy, score };
      }
    }
    return best;
  }, side || 1);
}

async function thaw(page) {
  await page.evaluate(() => { ProtoCem.getScene().sys.game.resume(); });
}

/** Wander monsters out of the way, keep (and freeze) only those we pose */
async function clearWanderers(page, keepUids) {
  await page.evaluate(keep => {
    const L = ProtoCem.getLevel();
    L.monsters.forEach(m => {
      if (m.role !== 'wander' || keep.indexOf(m.uid) !== -1) return;
      m.gx = 1; m.gy = 1; m.home = { gx: 1, gy: 1 }; m.stepMs = 1e9;
    });
  }, keepUids || []);
}

/**
 * Where to stand Mr Owl so a crypt sits where the shot wants it: `tomb` is
 * the porch's wanted offset from him in screen px ({ dx, dy }, zoom 1), and
 * `monster` the wanted offset of a lane tile to stand a wanderer on.
 * Searches every lane tile; returns { gx, gy, tomb, monster: { gx, gy } }.
 */
async function poseNearTomb(page, opts) {
  return page.evaluate(opts => {
    const L = ProtoCem.getLevel();
    const lane = (gx, gy) => { const t = CemModel.tileAt(L, gx, gy); return t && t.walk && (t.kind === 'path' || t.kind === 'plaza'); };
    const off = (a, b) => { const p = IsoModel.gridToIso(b.gx - a.gx, b.gy - a.gy); return p; };
    const miss = (p, want) => Math.sqrt((p.x - want.dx) * (p.x - want.dx) + (p.y - want.dy) * (p.y - want.dy));
    const tombs = L.tombs.filter(t => (opts.large ? t.size === 'large' : t.size !== 'large'));
    const lanes = L.tiles.filter(t => lane(t.gx, t.gy));
    let best = null;
    for (const tb of tombs) {
      for (const t of lanes) {
        const m = miss(off(t, tb.porch), opts.tomb);
        if (m > 200) continue;
        let spot = null;
        if (opts.monster) {
          for (const u of lanes) {
            const d = Math.abs(u.gx - t.gx) + Math.abs(u.gy - t.gy);
            if (d < 2 || d > 5) continue;
            const mm = miss(off(t, u), opts.monster);
            if (!spot || mm < spot.miss) spot = { gx: u.gx, gy: u.gy, miss: mm };
          }
        }
        const score = m + (spot ? spot.miss : 0);
        if (!best || score < best.score) best = { score, tomb: tb.id, gx: t.gx, gy: t.gy, monster: spot };
      }
    }
    return best;
  }, opts);
}

/** Stand a wandering monster on a tile and keep it there, turned toward Mr Owl */
async function standMonster(page, uid, at) {
  await page.evaluate((uid, at) => {
    const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
    const m = L.monstersByUid[uid];
    m.gx = at.gx; m.gy = at.gy; m.home = { gx: at.gx, gy: at.gy }; m.stepMs = 1e9;
    const st = S.monsters[uid];
    if (!st) return;
    if (st.tween) { st.tween.stop(); st.tween = null; }
    const q = IsoModel.gridToIso(at.gx, at.gy);
    st.gx = at.gx; st.gy = at.gy; st.bx = q.x; st.by = q.y + 12; st.walking = false;
    const o = CemModel.owlPos(L);
    const dx = o.x - at.gx, dy = o.y - at.gy, len = Math.sqrt(dx * dx + dy * dy) || 1;
    st.gdirTo = { x: dx / len, y: dy / len };
    st.gdir = { x: dx / len, y: dy / len };
    S.setMonsterDepth(st);
    S.refreshMonsters();
  }, uid, at);
}

/** A wandering monster, preferring one of the given kinds */
async function pickWanderer(page, prefer, avoid) {
  return page.evaluate((prefer, avoid) => {
    const L = ProtoCem.getLevel();
    const ws = L.monsters.filter(m => m.role === 'wander' && !m.defeated && avoid.indexOf(m.uid) === -1);
    for (const id of prefer) { const m = ws.find(w => w.id === id); if (m) return m.uid; }
    return ws.length ? ws[0].uid : null;
  }, prefer || [], avoid || []);
}

/**
 * Stand a wanderer on a lane near Mr Owl, give it a kind of card, put him a
 * tile away from it and walk him into it.
 */
async function fightWanderer(page, uid, kind) {
  const spot = await page.evaluate(() => {
    const L = ProtoCem.getLevel();
    const lane = (gx, gy) => { const t = CemModel.tileAt(L, gx, gy); return t && t.walk && t.kind === 'path'; };
    const man = (a, b) => Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy);
    const o = CemModel.owlTile(L);
    const busy = L.monsters.filter(m => !m.defeated && !(m.gx === 1 && m.gy === 1));
    const cands = L.tiles.filter(t => lane(t.gx, t.gy) && t.dist > 6 && busy.every(m => man(m, t) > 4))
      .sort((a, b) => man(a, o) - man(b, o));
    for (const w of cands) {
      for (const t of L.tiles.filter(t => lane(t.gx, t.gy) && man(t, w) === 1)) {
        const near = L.tiles.find(n => lane(n.gx, n.gy) && man(n, t) === 1 && man(n, w) === 2);
        if (near) return { w: { gx: w.gx, gy: w.gy }, t: { gx: t.gx, gy: t.gy }, near: { gx: near.gx, gy: near.gy } };
      }
    }
    return null;
  });
  await page.evaluate((uid, kind, spot) => {
    const L = ProtoCem.getLevel();
    const w = L.monstersByUid[uid];
    w.encounterType = kind; if (kind !== 'matching') w.matchingCategory = null;
    ProtoCem.teleport(spot.near.gx, spot.near.gy);
  }, uid, kind, spot);
  await standMonster(page, uid, spot.w);
  await wait(400);
  await page.evaluate(spot => {
    const L = ProtoCem.getLevel();
    L.graceMs = 0;
    ProtoCem.onTileTap(spot.t.gx, spot.t.gy);
  }, spot);
}

/** After a won card: Continue, then wait until the grounds are free again */
async function finishWin(page) {
  await page.waitForFunction(visible('result-modal'), { timeout: 30000 });
  await pressContinue(page);
  await page.waitForFunction(() => !ProtoCem.isBusy(), { timeout: 30000 });
  await page.evaluate(() => { ProtoCem.getLevel().graceMs = 1e9; });
  await wait(800);
}

/**
 * The picture on the Halloween start page (www/halloween.html): the same
 * night as the hero, dry and without lightning so it looks the way the game
 * does most of the time, with the HUD hidden. Written as a JPEG into www/.
 */
async function runLaunch(browser) {
  log('launch: the start page picture, a dry night without the HUD (1200x440)');
  const page = await newPage(browser, LAUNCH, 'launch');
  await bootCemetery(page);
  await page.addStyleTag({ content: '#hud-root, .hud-loading { display: none !important; }' });
  await page.evaluate(() => {                                         // no shower, so no storm either
    const S = ProtoCem.getScene();
    S.rainSchedule = CemRain.schedule(ProtoCem.getLevel().seed || 1, { FIRST_GAP_MIN_MS: 1e9, FIRST_GAP_MAX_MS: 1e9 });
    S.planStorm();
  });
  const pose = await poseNearTomb(page, { tomb: { dx: -260, dy: -20 }, monster: { dx: 150, dy: 40 } });
  const uid = await pickWanderer(page, ['pumpkin_man', 'skeleton', 'ghost', 'zombie', 'spider']);
  await clearWanderers(page, [uid]);
  await page.evaluate(p => ProtoCem.teleport(p.gx, p.gy), pose);
  if (pose.monster) await standMonster(page, uid, pose.monster);
  await wait(6000);                                                   // the reveal ramps up and the ground bakes
  if (wanted('halloween-start')) {
    const file = path.join(ROOT, 'www', 'assets', 'proto', 'iso', 'halloween-start.jpg');
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
    written.push('halloween-start');
    log('  shot ' + path.relative(ROOT, file) + ' (' + Math.round(fs.statSync(file).size / 1024) + ' KB)');
  }
  await page.browserContext().close();
}

async function runHero(browser) {
  log('hero: the cemetery at night, rain and lightning (1280x720)');
  const page = await newPage(browser, HERO, 'hero');
  await bootCemetery(page);
  const pose = await poseNearTomb(page, { tomb: { dx: -300, dy: -10 }, monster: { dx: -130, dy: 70 } });
  const uid = await pickWanderer(page, ['pumpkin_man', 'skeleton', 'ghost', 'zombie', 'spider']);
  log('  near tomb ' + pose.tomb + ' at ' + pose.gx + ',' + pose.gy + ', wanderer ' + uid);
  await clearWanderers(page, [uid]);
  await page.evaluate(p => ProtoCem.teleport(p.gx, p.gy), pose);
  if (pose.monster) await standMonster(page, uid, pose.monster);
  // a short walk lets the reveal ramp around him rather than snap
  await wait(1500);
  await windRain(page);
  await wait(5000);                                                   // streaks fall, puddles fill, ground bakes
  const target = await boltTarget(page, 1) || await boltTarget(page, -1);
  const hit = await strikeAndHold(page, target, 7);
  log('  strike ' + (hit ? 'at ' + hit.gx + ',' + hit.gy + ' (' + hit.dist.toFixed(1) + ' tiles), flash ' + hit.flash.toFixed(2) : 'found nothing'));
  await shot(page, 'cem-hero', false);
  await thaw(page);
  await page.browserContext().close();
}

async function runCemetery(browser) {
  log('cemetery (phone)');
  const page = await newPage(browser, PHONE, 'cem');
  await bootCemetery(page);
  await parkWeather(page);
  await wait(500);
  await shot(page, 'cem-01-gate', true);

  // out on the lanes near a crypt, a wanderer in view
  const pose = await poseNearTomb(page, { tomb: { dx: 20, dy: -170 }, monster: { dx: 100, dy: 50 } });
  const walker = await pickWanderer(page, ['pumpkin_man', 'skeleton', 'ghost', 'zombie', 'spider']);
  await clearWanderers(page, [walker]);
  await page.evaluate(p => ProtoCem.teleport(p.gx, p.gy), pose);
  if (pose.monster) await standMonster(page, walker, pose.monster);
  await wait(3500);
  await shot(page, 'cem-02-explore', true);

  // the storm: rain, puddles, a strike held at its brightest
  await windRain(page);
  await wait(5000);
  const target = await boltTarget(page, -1) || await boltTarget(page, 1);
  const hit = await strikeAndHold(page, target, 11);
  log('  strike ' + (hit ? 'at ' + hit.gx + ',' + hit.gy + ', flash ' + hit.flash.toFixed(2) : 'found nothing'));
  await shot(page, 'cem-03-storm', true);
  await thaw(page);
  await wait(1500);
  await parkWeather(page);

  // a quiz card
  await fightWanderer(page, walker, 'quiz');
  await page.waitForFunction(visible('quiz-modal'), { timeout: 30000 });
  await quizReady(page);
  await stageSettled(page, 'quiz-modal');
  await shot(page, 'cem-04-quiz', true);
  await answerQuizRight(page);
  await finishWin(page);

  // a sentence card, a few tiles placed
  const sUid = await pickWanderer(page, ['ghost', 'banshee', 'lost_soul', 'zombie', 'spider'], [walker]);
  await fightWanderer(page, sUid, 'sentence');
  await page.waitForFunction(visible('sentence-modal'), { timeout: 30000 });
  await stageSettled(page, 'sentence-modal');
  const words = await page.evaluate(() => Sentences.getCurrent().answers[0].length);
  await placeWords(page, Math.max(1, Math.min(3, words - 1)));
  await wait(600);
  await shot(page, 'cem-05-sentence', true);
  await placeWords(page, null);
  await page.evaluate(() => document.getElementById('sentence-confirm-btn').click());
  await finishWin(page);

  // a matching board
  const mUid = await pickWanderer(page, ['spider', 'giant_rat', 'bat_swarm', 'skeleton'], [walker, sUid]);
  await fightWanderer(page, mUid, 'matching');
  await page.waitForFunction(visible('matching-modal'), { timeout: 30000 });
  await stageSettled(page, 'matching-modal');
  // one pair matched already, so the board shows both states
  await page.evaluate(() => {
    const l = document.querySelector('#matching-modal .matching-item[data-side="left"]');
    const i = l.dataset.pairIndex;
    l.click();
    document.querySelector('#matching-modal .matching-item[data-side="right"][data-pair-index="' + i + '"]').click();
  });
  await wait(900);
  await shot(page, 'cem-06-matching', true);
  await solveMatching(page);
  await finishWin(page);

  // the Grim Reaper: four key parts, the great tomb, three questions
  await page.evaluate(() => {
    const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
    ['g1', 'g2', 'g3', 'g4'].forEach(uid => { if (!L.monstersByUid[uid].defeated) { CemModel.defeatMonster(L, uid); S.removeMonster(uid); } });
    S.refreshTombs();
    ProtoHud.setKeyParts(CemModel.keyPartCount(L), 4);
    const big = L.tombs.find(t => t.size === 'large');
    L.monsters.forEach(m => { if (m.role === 'wander') { m.home = { gx: 1, gy: 1 }; m.gx = 1; m.gy = 1; m.stepMs = 1e9; } });
    ProtoCem.teleport(big.porch.gx, big.porch.gy); L.graceMs = 0;
    ProtoCem.onTileTap(big.door.gx, big.door.gy);
  });
  await page.waitForFunction(visible('quiz-modal'), { timeout: 30000 });
  await answerQuizRight(page);                                        // one in, the streak shows
  await page.waitForFunction(() => Player.getDragonStreak() === 1, { timeout: 20000 });
  await quizReady(page);
  await stageSettled(page, 'quiz-modal');
  await shot(page, 'cem-07-reaper', true);
  await answerQuizRight(page);
  await page.waitForFunction(() => Player.getDragonStreak() === 2, { timeout: 20000 });
  await answerQuizRight(page);
  await page.waitForFunction(visible('result-modal'), { timeout: 30000 });
  await pressContinue(page);
  await page.waitForFunction(visible('victory-screen'), { timeout: 30000 });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('#victory-screen img')).every(i => !i.src || (i.complete && i.naturalWidth > 0)), { timeout: 20000 }).catch(() => {});
  // the confetti is gone after 5 s and leaves the board readable
  await page.waitForFunction(() => !document.querySelector('.fx-confetti-layer'), { timeout: 15000 }).catch(() => {});
  await wait(800);
  await shot(page, 'cem-08-victory', true);
  await page.browserContext().close();
}

/* ------------------------------------------------------- isometric dungeon */

/** A neighbouring room, preferring one with (or without) a monster */
async function neighbour(page, withMonster) {
  return page.evaluate(withMonster => {
    const here = Dungeon.getRoom(Player.getCurrentRoom());
    const ids = here.connections || [];
    const pick = ids.find(id => !!Dungeon.hasMonsterEncounter(id) === withMonster);
    return pick || null;
  }, withMonster);
}

async function isoSettle(page) {
  await page.waitForFunction(() => !ProtoIso.isBusy() || !document.getElementById('quiz-modal').classList.contains('hidden'), { timeout: 30000 });
  await wait(1200);
}

async function runIso(browser) {
  log('isometric dungeon (phone)');
  const page = await newPage(browser, PHONE, 'iso');
  await page.goto(BASE + '/isometric.html?action=new&level=dungeon&enc=quiz' + Q, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof ProtoIso !== 'undefined' && ProtoIso.getScene() && !ProtoIso.isBusy(), { timeout: 60000 });
  await page.waitForFunction(() => { const v = document.getElementById('iso-loading'); return !v || v.classList.contains('hidden'); }, { timeout: 30000 });
  await wait(3000);
  await shot(page, 'iso-01-dungeon', true);

  // walk through empty rooms until a monster room is next door, then step in
  let fought = false, monsterRoom = null;
  for (let i = 0; i < 12 && !fought; i++) {
    const m = await neighbour(page, true);
    if (m) {
      monsterRoom = m;
      // the chamber with its monster: the iso view shows a room's occupant
      // only once Mr Owl is in, so the shot is taken as the card opens
      await page.evaluate(id => ProtoIso.tapRoom(id), m);
      await page.waitForFunction(visible('quiz-modal'), { timeout: 30000 });
      fought = true;
      break;
    }
    const e = await neighbour(page, false);
    if (!e) break;
    await page.evaluate(id => ProtoIso.tapRoom(id), e);
    await isoSettle(page);
  }
  if (!fought) { log('  no monster found'); await page.browserContext().close(); return; }
  await quizReady(page);
  await stageSettled(page, 'quiz-modal');
  await shot(page, 'iso-03-quiz', true);
  // a wrong answer: Mr Owl is pushed back, and the chamber he fled keeps its
  // monster standing in view (a chamber shows what it holds once entered)
  await quizReady(page);
  await page.evaluate(() => {
    const q = Combat.getCurrentQuestion();
    const btns = document.querySelectorAll('#quiz-modal .answer-btn');
    btns[(q.correctIndex + 1) % btns.length].click();
  });
  await page.waitForFunction(visible('result-modal'), { timeout: 30000 });
  await pressContinue(page);
  await page.waitForFunction(() => !ProtoIso.isBusy(), { timeout: 30000 });
  await wait(1500);
  // frame both chambers: the camera centres between Mr Owl and the monster
  await page.evaluate(id => {
    const a = IsoModel.getRoomCenterPx(Player.getCurrentRoom()), b = IsoModel.getRoomCenterPx(id);
    ProtoIso.getScene().focusOn((a.x + b.x) / 2, (a.y + b.y) / 2, false);
  }, monsterRoom);
  await wait(2000);
  await shot(page, 'iso-02-chamber', true);
  await page.browserContext().close();
}

/* ----------------------------------------------------------------- 3D view */

async function fpFree(page) {
  await page.waitForFunction(() => {
    const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
    return vis('quiz-modal') || vis('matching-modal') || vis('sentence-modal') ||
      (!ProtoFp.getDebugState().busy && !FpRenderer.isBusy());
  }, { timeout: 30000 });
}

async function runFp(browser) {
  log('3D view (phone)');
  const page = await newPage(browser, PHONE, 'fp');
  await page.goto(BASE + '/first-person.html?action=new&enc=quiz' + Q, { waitUntil: 'load' });
  await page.waitForFunction(() => window.ProtoFp && ProtoFp.getDebugState().gameInProgress && document.querySelector('canvas'), { timeout: 60000 });
  await page.evaluate(() => { if (FpRenderer.getViewMode() !== 'third') FpRenderer.setViewMode('third'); });
  await wait(4000);
  // face down a corridor: turn until the way ahead is open
  for (let i = 0; i < 4; i++) {
    if (await page.evaluate(() => FpWorld.canStepForward())) break;
    await page.evaluate(() => ProtoFp.runCommand('turnRight'));
    await wait(200); await fpFree(page);
  }
  await wait(1500);
  await shot(page, '3d-01-corridor', true);

  // find a monster in a neighbouring chamber and look at it from the doorway
  const plan = await page.evaluate(() => {
    const w = FpWorld.getWorld();
    const from = FpWorld.getState().roomId;
    // breadth first over the chambers without monsters, to a chamber next to a monster
    const prev = {}; const seen = {}; seen[from] = true;
    let queue = [from];
    while (queue.length) {
      const next = [];
      for (const id of queue) {
        const cell = w.cells[id];
        for (const d of FpWorld.DIRS) {
          const to = cell.exits[d];
          if (!to || seen[to]) continue;
          seen[to] = true;
          if (Dungeon.hasMonsterEncounter(to)) {
            const pathIds = [];
            let at = id;
            while (at && at !== from) { pathIds.unshift(at); at = prev[at]; }
            return { path: pathIds, monster: to, dir: d };
          }
          prev[to] = id;
          next.push(to);
        }
      }
      queue = next;
    }
    return null;
  });
  if (!plan) { log('  no monster reachable'); await page.browserContext().close(); return; }
  log('  monster in ' + plan.monster + ', ' + plan.path.length + ' chambers away');
  const face = async dir => {
    for (let g = 0; g < 4; g++) {
      const st = await page.evaluate(() => FpWorld.getState().facing);
      if (st === dir) return;
      await page.evaluate(() => ProtoFp.runCommand('turnRight'));
      await wait(150); await fpFree(page);
    }
  };
  for (const id of plan.path) {
    const dir = await page.evaluate(id => {
      const cell = FpWorld.getWorld().cells[FpWorld.getState().roomId];
      return FpWorld.DIRS.find(d => cell.exits[d] === id);
    }, id);
    await face(dir);
    await page.evaluate(() => ProtoFp.runCommand('forward'));
    await wait(200); await fpFree(page);
  }
  await face(plan.dir);
  await wait(800);
  // step in and hold the quiz back until the monster has risen and taunted
  await page.evaluate(() => {
    const real = FpRenderer.entityAction;
    window.__held = null;
    FpRenderer.entityAction = function(roomId, kind, done) {
      if (kind !== 'taunt') return real.apply(this, arguments);
      return real.call(this, roomId, kind, function() { window.__held = done; });
    };
    window.__unpatch = function() { FpRenderer.entityAction = real; };
  });
  await page.evaluate(() => ProtoFp.runCommand('forward'));
  await page.waitForFunction(() => !!window.__held, { timeout: 30000 });
  await wait(1200);
  await shot(page, '3d-02-monster', true);
  await page.evaluate(() => { window.__unpatch(); window.__held(); });
  await page.waitForFunction(visible('quiz-modal'), { timeout: 30000 });
  await quizReady(page);
  await stageSettled(page, 'quiz-modal');
  await shot(page, '3d-03-quiz', true);
  await page.browserContext().close();
}

/* ------------------------------------------------------------ classic page */

async function runClassic(browser) {
  log('classic page (phone)');
  const page = await newPage(browser, PHONE, 'classic');
  await page.goto(BASE + '/index.html?enc=quiz', { waitUntil: 'load' });
  await page.waitForSelector('#new-game-btn', { visible: true, timeout: 30000 });
  await wait(1000);
  await page.evaluate(() => { const c = document.querySelector('.view-card[data-view="classic"]'); if (c) c.click(); });
  await page.evaluate(() => { const n = document.getElementById('player-name'); n.value = 'Owl'; n.dispatchEvent(new Event('input', { bubbles: true })); });
  log('  view cards: ' + await page.evaluate(() => Array.from(document.querySelectorAll('.view-card')).map(c => c.dataset.view + (c.classList.contains('selected') ? '*' : '')).join(' ')));
  await page.waitForFunction(() => Array.from(document.images).filter(i => i.offsetParent !== null).every(i => i.complete), { timeout: 20000 }).catch(() => {});
  await wait(1500);
  await shot(page, 'classic-01-launch', true);
  await page.evaluate(() => document.getElementById('new-game-btn').click());
  await page.waitForFunction(() => { const g = document.getElementById('game-screen'); return g && !g.classList.contains('hidden'); }, { timeout: 30000 });
  await wait(1500);
  // a few rooms in, winning whatever stands in the way, so the map has something to show
  const seen = [await page.evaluate(() => Player.getCurrentRoom())];
  for (let step = 0; step < 3; step++) {
    const next = await page.evaluate(seen => {
      const here = Dungeon.getRoom(Player.getCurrentRoom());
      const ids = (here.connections || []).filter(r => seen.indexOf(r) === -1 && Dungeon.getRoom(r).type !== 'boss');
      const id = ids.find(r => !Dungeon.hasMonsterEncounter(r)) || ids[0];
      const btn = id && document.querySelector('#direction-bar .dir-btn[data-room="' + id + '"]:not([disabled])');
      if (btn) btn.click();
      return btn ? id : null;
    }, seen);
    if (!next) break;
    seen.push(next);
    await wait(1500);
    const card = await page.evaluate(() => {
      const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
      return vis('quiz-modal') ? 'quiz' : vis('treasure-modal') ? 'treasure' : null;
    });
    if (card === 'quiz') {
      await answerQuizRight(page);
      await page.waitForFunction(visible('result-modal'), { timeout: 30000 });
      await pressContinue(page);
    } else if (card === 'treasure') {
      await page.evaluate(() => { const b = document.querySelector('#treasure-modal button'); if (b) b.click(); });
    }
    await page.waitForFunction(() => { const bar = document.getElementById('direction-bar');
      return bar && !bar.classList.contains('hidden') && !!bar.querySelector('.dir-btn:not([disabled])'); }, { timeout: 30000 });
    await wait(800);
  }
  log('  walked through ' + (seen.length - 1) + ' rooms to ' + await page.evaluate(() => Player.getCurrentRoom()));
  await page.evaluate(() => {
    const panel = document.getElementById('map-panel');
    if (panel && panel.classList.contains('collapsed')) panel.querySelector('.map-toggle').click();
    window.scrollTo(0, 0);
  });
  // the welcome toast goes after a few seconds
  await wait(5000);
  await shot(page, 'classic-02-room', true);
  await page.browserContext().close();
}

/* -------------------------------------------------------------------- main */

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(800);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox', '--mute-audio', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'].concat(SOFTWARE
      ? ['--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--enable-gpu', '--use-angle=metal'])
  });
  let failed = 0;
  const run = async (name, fn) => {
    if (!sessionWanted(name)) return;
    try { await fn(browser); } catch (e) { failed++; log('  ' + name + ' stopped: ' + (e && e.message)); }
  };
  try {
    await run('hero', runHero);
    await run('launch', runLaunch);
    await run('cem', runCemetery);
    await run('iso', runIso);
    await run('fp', runFp);
    await run('classic', runClassic);
  } finally {
    await browser.close();
    server.kill();
  }
  log('wrote ' + written.length + ' shot(s)' + (failed ? ', ' + failed + ' session(s) stopped early' : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
