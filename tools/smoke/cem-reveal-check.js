#!/usr/bin/env node
/**
 * Proves the cemetery's night reveal is gradual.
 *
 *   node tools/smoke/cem-reveal-check.js [--port 8096] [--seconds 40] [--shot out.png]
 *
 * Boots the cemetery in headless Chrome, switches encounters off, puts Mr
 * Owl on a dark lane in the middle of the grounds (a teleport, instant by
 * design, before any sampling) and walks him along the lanes with the stick
 * at half. Headless Chrome caps the game's step at 50 ms a frame, so that is
 * 0.08 tiles a frame: the same per-frame motion as full speed at 60 fps on a
 * device, which is what the three-frame rule below is about. After every
 * scene update it records, for every prop, tomb piece, ground tile and
 * monster within 8 tiles of him that is on screen (the camera culls what is
 * a screen's width past the edge, and that is not the reveal), whether it is
 * visible and at what alpha, together with the reveal of its tile. It fails
 * when:
 *
 *  - anything goes from invisible (or alpha < 0.05) to alpha > 0.3 within 3
 *    frames: a pop, not a reveal;
 *  - a prop or ground tile shows at alpha > 0.05 while the peak reveal of
 *    its tile is below 0.02 (the curve starts from 0, so a tile at the very
 *    edge is drawn at a hundredth or two: that is the point), or a monster
 *    shows for more than 600 ms while the reveal at its feet is below 0.02
 *    (it may still be fading out);
 *  - a ground tile's composite (the chunk's baked alpha under the transition
 *    sprite) differs from what its peak says by more than 0.02.
 *
 * The chunk repaint throttle is raised to 600 ms for the walk, so the
 * transition sprites carry the ground for many frames between bakes and the
 * handoff is exercised hard. The lantern flames' flicker tween is left out of
 * the numbers: it is on tiles that are lit from the start.
 *
 * It also prints the largest single-frame change seen, so a regression that
 * stays under the thresholds is still visible in the numbers.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8096));
const SECONDS = Number(opt('--seconds', 40));
const SHOT = opt('--shot', null);
const FROM_GATE = args.indexOf('--from-gate') !== -1;   // skip the teleport: start at the gate like a player

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

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', path.join(ROOT, 'www')], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--window-size=1200,860', '--autoplay-policy=no-user-gesture-required']
  });
  let failed = false;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 860 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Reveal&action=new&level=cemetery&perf=1&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });

    const out = await page.evaluate(async (seconds, fromGate) => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene(), R = S.reveal;
      L.graceMs = 1e9;                                     // no encounters while measuring
      S.world.bakeMinMs = 600;                             // long gaps between bakes: the tile sprites must carry the ground
      // start on a lane in the middle that no lantern lights and he has not seen
      let start = null;
      for (const t of L.tiles) {
        if (t.kind !== 'path' || t.gx < 14 || t.gy < 14 || t.gx > L.W - 14 || t.gy > L.H - 14) continue;
        if (R.peak[t.gy * L.W + t.gx] > 0) continue;
        if (R.lamp[t.gy * L.W + t.gx]) continue;
        start = t; break;
      }
      if (fromGate) start = null;
      if (start) { ProtoCem.teleport(start.gx, start.gy); await wait(300); }
      const RANGE = 8;
      const track = {};                                    // id -> { kind, hist: [{t, vis, alpha, f}] , darkSince }
      let nextId = 1;
      const idOf = o => o.__revealId || (o.__revealId = nextId++);
      const failures = [];
      let frames = 0, biggest = { d: 0 }, samples = 0;
      const fail = (msg) => { if (failures.length < 25) failures.push(msg); };

      function sample(kind, key, vis, alpha, f, extra, ob) {
        samples++;
        let rec = track[key];
        if (!rec) rec = track[key] = { kind: kind, hist: [] };
        const eff = vis ? alpha : 0;
        const o = CemModel.owlPos(L);
        const state = { vis: vis, alpha: +alpha.toFixed(3), f: +f.toFixed(3), owl: o.x.toFixed(2) + ',' + o.y.toFixed(2),
          cell: ob && ob.cemCell ? ob.cemCell.shown : null, shown: ob ? ob.cemShown : null };
        rec.hist.push({ t: frames, eff: eff, f: f, state: state });
        if (rec.hist.length > 4) rec.hist.shift();
        // a pop: dark (or hidden) three frames ago or less, well lit now
        for (let k = 0; k < rec.hist.length - 1; k++) {
          const h = rec.hist[k];
          if (frames - h.t <= 3 && h.eff < 0.05 && eff > 0.3) {
            fail(kind + ' ' + key + ' popped: alpha ' + h.eff.toFixed(2) + ' -> ' + eff.toFixed(2) + ' in ' + (frames - h.t) + ' frame(s)' + (extra ? ' ' + extra : '') +
              '\n      before ' + JSON.stringify(h.state) + '\n      after  ' + JSON.stringify(state));
            break;
          }
        }
        const prev = rec.hist.length > 1 ? rec.hist[rec.hist.length - 2] : null;
        if (prev && prev.t === frames - 1) {
          const d = Math.abs(eff - prev.eff);
          if (d > biggest.d) biggest = { d: d, what: kind + ' ' + key, from: prev.eff, to: eff, frame: frames };
        }
        if (kind === 'monster') {
          if (eff > 0.05 && f < 0.02) {
            if (rec.darkSince === undefined) rec.darkSince = performance.now();
            else if (performance.now() - rec.darkSince > 600) fail('monster ' + key + ' shown in the dark for over 600 ms (alpha ' + eff.toFixed(2) + ', reveal ' + f.toFixed(3) + ')');
          } else rec.darkSince = undefined;
        } else if (eff > 0.05 && f < 0.02) {
          fail(kind + ' ' + key + ' shown while its tile is dark (alpha ' + eff.toFixed(2) + ', peak ' + f.toFixed(3) + ')');
        }
      }

      function onFrame() {
        frames++;
        const o = CemModel.owlPos(L);
        const cx = Math.round(o.x), cy = Math.round(o.y);
        const view = S.cameras.main.worldView;
        const onScreen = (x, y) => x >= view.x && x <= view.right && y >= view.y && y <= view.bottom;
        for (let gy = cy - RANGE; gy <= cy + RANGE; gy++) {
          for (let gx = cx - RANGE; gx <= cx + RANGE; gx++) {
            if (gx < 0 || gy < 0 || gx >= L.W || gy >= L.H) continue;
            const idx = gy * L.W + gx;
            const peak = R.peak[idx];
            const objs = S.tileObjs[idx];
            for (let i = 0; i < objs.length; i++) {
              const ob = objs[i];
              if (ob.cemTweened) continue;                 // the lantern flame's flicker
              if (!onScreen(ob.x, ob.y)) continue;
              sample('prop', 'p' + idOf(ob) + '@' + gx + ',' + gy, ob.visible, ob.alpha, peak, L.tiles[idx].kind, ob);
            }
            // the ground: what the eye gets from the baked chunk plus the transition sprite
            const t = L.tiles[idx];
            const tp = IsoModel.gridToIso(t.gx, t.gy);
            const live = S.world.isLive(S.world.chunkIndexOf(t.gx, t.gy));
            if (live && onScreen(tp.x, tp.y)) {
              const baked = S.groundBaked[idx];
              const sp = S.groundSprites[idx];
              const comp = sp && sp.visible ? 1 - (1 - baked) * (1 - sp.alpha) : baked;
              const want = CemReveal.alphaAt(R, idx);
              if (Math.abs(comp - want) > 0.02) fail('ground ' + gx + ',' + gy + ' composite ' + comp.toFixed(3) + ' but peak says ' + want.toFixed(3));
              sample('ground', 'g' + idx, comp > 0, comp, peak, t.kind);
            }
          }
        }
        for (const id in S.tombObjs) {
          const rec = S.tombObjs[id];
          const tomb = rec.tomb;
          const dd = Math.max(Math.abs(tomb.door.gx - o.x), Math.abs(tomb.door.gy - o.y));
          if (dd > RANGE + 2) continue;
          let peak = 0;
          for (let yy = tomb.y0; yy < tomb.y0 + tomb.h; yy++) for (let xx = tomb.x0; xx < tomb.x0 + tomb.w; xx++) peak = Math.max(peak, R.peak[yy * L.W + xx]);
          peak = Math.max(peak, R.peak[tomb.door.gy * L.W + tomb.door.gx]);
          rec.objs.concat(rec.lit).forEach((ob, i) => { if (onScreen(ob.x, ob.y)) sample('tomb', id + '#' + i, ob.visible, ob.alpha, peak, null, ob); });
        }
        for (const uid in S.monsters) {
          const st = S.monsters[uid];
          if (st.removed) continue;
          const g = IsoModel.isoToGridExact(st.bx, st.by - 12);
          if (Math.max(Math.abs(g.gx - o.x), Math.abs(g.gy - o.y)) > RANGE || !onScreen(st.bx, st.by)) continue;
          sample('monster', uid + ':' + st.m.id, st.sprite.visible, st.sprite.alpha, st.revealTarget || 0);
        }
      }
      S.events.on('postupdate', onFrame);

      // the walk: the stick at half along A* routes to lane tiles 10-24 steps
      // away, one after another, so he keeps moving through new ground
      const t0 = performance.now();
      const from = { x: CemModel.owlPos(L).x, y: CemModel.owlPos(L).y };
      let walked = 0, lastX = from.x, lastY = from.y;
      let target = null, rng = 7;
      const lanes = L.tiles.filter(t => t.walk && t.kind !== 'gate');
      while (performance.now() - t0 < seconds * 1000) {
        const o = CemModel.owlPos(L);
        const here = CemModel.owlTile(L);
        if (!target || (Math.abs(target.gx - o.x) < 0.6 && Math.abs(target.gy - o.y) < 0.6)) {
          target = null;
          for (let tries = 0; tries < 200 && !target; tries++) {
            rng = (rng * 16807) % 2147483647;
            const c = lanes[rng % lanes.length];
            const n = CemModel.pathTo(L, here, c).length;
            if (n >= 10 && n <= 24) target = c;
          }
          if (!target) break;
        }
        const route = CemModel.pathTo(L, here, target);
        if (route.length && route[0].gx === here.gx && route[0].gy === here.gy) route.shift();   // the route starts on his own tile
        const next = route.length ? route[0] : target;
        const dx = next.gx - o.x, dy = next.gy - o.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        ProtoCem.setSteer(dx / len * 0.5, dy / len * 0.5);
        await wait(100);
        const o2 = CemModel.owlPos(L);
        walked += Math.sqrt((o2.x - lastX) * (o2.x - lastX) + (o2.y - lastY) * (o2.y - lastY));
        lastX = o2.x; lastY = o2.y;
      }
      ProtoCem.setSteer(0, 0);
      await wait(800);
      S.events.off('postupdate', onFrame);
      const secs = (performance.now() - t0) / 1000;
      let seen = 0;
      for (let i = 0; i < L.seen.length; i++) if (L.seen[i]) seen++;
      const overlay = S.children.list.find(o => o.type === 'Text' && o.depth === 1e7);
      const bakes = S.world.stats().bakes;
      return {
        bakes: bakes, walked: Number(walked.toFixed(1)), start: start ? start.gx + ',' + start.gy : 'the gate',
        frames: frames, fps: Number((frames / secs).toFixed(1)), samples: samples, tracked: Object.keys(track).length,
        biggestFrameChange: biggest, failures: failures, tilesSeen: seen,
        groundSpritesLive: Object.keys(S.groundSprites).length, groundSpritePool: S.groundFree.length + Object.keys(S.groundSprites).length,
        overlay: overlay ? overlay.text : ''
      };
    }, SECONDS, FROM_GATE);

    console.log('frames ' + out.frames + ' (' + out.fps + ' fps), walked ' + out.walked + ' tiles from ' + out.start + ', samples ' + out.samples + ', objects tracked ' + out.tracked + ', tiles seen ' + out.tilesSeen);
    console.log('ground tile sprites: ' + out.groundSpritesLive + ' live at the end, pool ' + out.groundSpritePool + ', chunk bakes ' + out.bakes);
    const b = out.biggestFrameChange;
    console.log('largest single-frame change: ' + b.d.toFixed(3) + (b.what ? ' (' + b.what + ' ' + b.from.toFixed(2) + ' -> ' + b.to.toFixed(2) + ' at frame ' + b.frame + ')' : ''));
    console.log(out.overlay.split('\n').map(l => '  ' + l).join('\n'));
    if (out.failures.length) {
      failed = true;
      console.log('\nFAIL: ' + out.failures.length + ' problem(s)');
      out.failures.forEach(f => console.log('  ' + f));
    } else {
      console.log('\nok: nothing popped, nothing shown in the dark, the ground composite matches its peak');
    }
    if (SHOT) { await page.screenshot({ path: SHOT }); console.log('screenshot: ' + SHOT); }
    if (errors.length) { failed = true; console.log('page errors: ' + errors.slice(0, 3).join(' | ')); }
  } finally {
    await browser.close();
    server.kill();
  }
  process.exitCode = failed ? 1 : 0;
}

main().catch(e => { console.error(e); process.exit(2); });
