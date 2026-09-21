#!/usr/bin/env node
/**
 * Proves a beaten cemetery monster leaves the grounds for good.
 *
 *   node tools/smoke/cem-defeat-check.js [--port 8097] [--trace]
 *
 * Boots the cemetery in headless Chrome, stands Mr Owl next to a wanderer of
 * each exit style (fade, sink, vanish, runaway) and beats it through the
 * scene's own playDefeat, then does the same to the Grim Reaper through
 * playBossDefeat. After every scene update it records the sprite's alpha
 * and visible flag until the sprite is destroyed. It fails when a sprite
 * that has faded out (effective alpha under 0.05) is drawn again at more
 * than 0.05 before it is removed: that is the flicker a player sees as the
 * monster blinking back for a frame after it has gone. `--trace` prints
 * every frame.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8097));
const TRACE = args.indexOf('--trace') !== -1;

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

/**
 * Runs in the page: records the sprite of `uid` every scene update while
 * `go` plays, until the sprite is destroyed or `limitMs` has passed.
 */
async function traceDefeat(page, uid, boss) {
  return page.evaluate(async (uid, boss) => {
    const S = ProtoCem.getScene();
    const st = S.monsters[uid];
    if (!st) return { error: 'no monster ' + uid };
    const sprite = st.sprite;
    const frames = [];
    const t0 = S.time.now;
    function onPost() {
      const gone = !sprite.scene || st.removed;
      const exit = st.actions ? CemMonsters.progress(st.actions.exit, S.time.now, CemMonsters.ACTIONS.exit, true) : -1;
      frames.push({ t: Math.round(S.time.now - t0), vis: gone ? false : sprite.visible, alpha: gone ? 0 : +sprite.alpha.toFixed(3),
        exit: +exit.toFixed(3), gone: gone, clip: st.lastClip || null });
    }
    S.events.on('postupdate', onPost);
    let done = false;
    if (boss) S.playBossDefeat(() => { done = true; });
    else S.playDefeat(uid, () => { done = true; });
    const limit = performance.now() + 30000;              // the timers run on Phaser's capped clock: slow in headless
    while (!done && performance.now() < limit) await new Promise(r => setTimeout(r, 30));
    S.events.off('postupdate', onPost);
    return { id: st.m.id, style: st.exitStyle, frames: frames, done: done };
  }, uid, boss);
}

/**
 * The flicker: effective alpha back above 0.05 after it had fallen under
 * it. A beaten monster only ever fades, so any rise at all from one frame
 * to the next is reported too (a dip during the flinch that comes back is
 * the same blink, just brighter).
 */
function judge(rec, label) {
  const eff = f => (f.gone || !f.vis) ? 0 : f.alpha;
  let faded = -1, rose = null, peak = 0, rise = { d: 0 };
  for (let i = 0; i < rec.frames.length; i++) {
    const a = eff(rec.frames[i]);
    if (i > 0) {
      const d = a - eff(rec.frames[i - 1]);
      if (d > rise.d) rise = { d: d, at: rec.frames[i].t, from: eff(rec.frames[i - 1]), to: a };
    }
    if (faded === -1) { if (a < 0.05 && i > 0) faded = i; continue; }
    if (a > peak) peak = a;
    if (a > 0.05 && !rose) rose = rec.frames[i];
  }
  const last = rec.frames[rec.frames.length - 1];
  const tail = rec.frames.slice(-8).map(f => f.t + ':' + (f.gone ? 'gone' : (f.vis ? '' : 'hidden ') + f.alpha)).join(' ');
  check(rec.done, label + ': the defeat called back');
  check(last && last.gone, label + ': the sprite was destroyed (' + rec.frames.length + ' frames)');
  check(faded !== -1, label + ': the sprite faded out');
  check(!rose, label + ': alpha never rose again after fading out' + (rose ? ' (rose to ' + peak.toFixed(2) + ' at ' + rose.t + ' ms, exit ' + rose.exit + ', clip ' + rose.clip + ')' : ''));
  check(rise.d < 0.02, label + ': alpha never rose between frames' + (rise.d >= 0.02 ? ' (' + rise.from.toFixed(2) + ' -> ' + rise.to.toFixed(2) + ' at ' + rise.at + ' ms)' : ''));
  console.log('        last frames: ' + tail);
  if (TRACE) console.log(rec.frames.map(f => '        ' + f.t + ' ms  vis=' + f.vis + ' alpha=' + f.alpha + ' exit=' + f.exit + ' clip=' + f.clip + (f.gone ? ' gone' : '')).join('\n'));
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--window-size=1200,860', '--autoplay-policy=no-user-gesture-required']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 860 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Defeat&action=new&level=cemetery&music=none', { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });
    await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      L.graceMs = 1e9;                                       // no encounters of their own
      L.monsters.forEach(m => { if (m.role === 'wander') m.stepMs = 1e9; });   // and nobody wanders off
    });

    console.log('wanderers, one of each exit style');
    const picks = await page.evaluate(() => {
      const L = ProtoCem.getLevel();
      const byStyle = {};
      L.monsters.forEach(m => {
        if (m.role !== 'wander' || m.defeated) return;
        const style = CemMonsters.exitOf(m.id);
        if (!byStyle[style]) byStyle[style] = m.uid;
      });
      return byStyle;
    });
    for (const style of Object.keys(picks)) {
      const uid = picks[style];
      await page.evaluate(async (uid) => {
        const L = ProtoCem.getLevel();
        const m = L.monstersByUid[uid];
        const near = L.tiles.find(t => t.walk && Math.abs(t.gx - m.gx) + Math.abs(t.gy - m.gy) === 1);
        ProtoCem.teleport(near.gx, near.gy);
        await new Promise(r => setTimeout(r, 400));          // let the reveal settle on him
        CemModel.defeatMonster(L, uid);
      }, uid);
      const rec = await traceDefeat(page, uid, false);
      if (rec.error) { check(false, rec.error); continue; }
      judge(rec, rec.id + ' (' + rec.style + ')');
    }

    console.log('the Grim Reaper');
    await page.evaluate(async () => {
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      ['g1', 'g2', 'g3', 'g4'].forEach(uid => { CemModel.defeatMonster(L, uid); S.removeMonster(uid); });
      const big = L.tombs.find(t => t.size === 'large');
      ProtoCem.teleport(big.porch.gx, big.porch.gy);
      await new Promise(r => setTimeout(r, 300));
      await new Promise(r => S.revealBoss(r, true));
      CemModel.defeatMonster(L, 'boss');
    });
    const boss = await traceDefeat(page, 'boss', true);
    if (boss.error) check(false, boss.error); else judge(boss, 'grim_reaper (boss)');

    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
