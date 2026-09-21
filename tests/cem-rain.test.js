/**
 * CemRain tests: when it rains, which tiles get puddles, how they fill, how the streaks fall
 */

TestRunner.suite('CemRain', () => {
  var CFG = CemRain.CFG;

  function gen(seed) { return CemModel.generate(seed || 7); }
  function pathIndices(level) {
    var out = [];
    for (var i = 0; i < level.tiles.length; i++) if (level.tiles[i].kind === 'path') out.push(i);
    return out;
  }

  TestRunner.test('hash is deterministic, in [0,1) and changes with each argument', () => {
    TestRunner.assertEqual(CemRain.hash(3, 4, 41), CemRain.hash(3, 4, 41), 'same in, same out');
    for (var i = 0; i < 200; i++) {
      var h = CemRain.hash(i, i * 7, 41);
      TestRunner.assert(h >= 0 && h < 1, 'in range');
    }
    TestRunner.assert(CemRain.hash(3, 4, 41) !== CemRain.hash(4, 3, 41), 'x and y are not interchangeable');
    TestRunner.assert(CemRain.hash(3, 4, 41) !== CemRain.hash(3, 4, 43), 'the salt matters');
  });

  TestRunner.test('water gathers on lanes and plazas, never on grass, fences or doorways', () => {
    TestRunner.assert(CemRain.isPuddleTile({ kind: 'path', gx: 1, gy: 1 }), 'a lane');
    TestRunner.assert(CemRain.isPuddleTile({ kind: 'grass', plaza: true, gx: 1, gy: 1 }), 'a plaza');
    TestRunner.assert(!CemRain.isPuddleTile({ kind: 'grass', gx: 1, gy: 1 }), 'grass');
    TestRunner.assert(!CemRain.isPuddleTile({ kind: 'tomb_door', gx: 1, gy: 1 }), 'a doorway');
    TestRunner.assert(!CemRain.isPuddleTile({ kind: 'gate', gx: 1, gy: 1 }), 'the gate');
    TestRunner.assert(!CemRain.isPuddleTile({ kind: 'fence', gx: 1, gy: 1 }), 'the fence');
    TestRunner.assert(!CemRain.isPuddleTile(null), 'nothing');
  });

  TestRunner.test('about PUDDLE_CHANCE of the lane tiles want a puddle, the same ones every time', () => {
    var L = gen(11);
    var idx = pathIndices(L);
    TestRunner.assert(idx.length > 200, 'a level has a few hundred lane tiles');
    var n = 0;
    for (var i = 0; i < idx.length; i++) if (CemRain.wantsPuddle(L.tiles[idx[i]])) n++;
    var share = n / idx.length;
    TestRunner.assert(share > CFG.PUDDLE_CHANCE * 0.6 && share < CFG.PUDDLE_CHANCE * 1.5, 'share ' + share.toFixed(2) + ' near ' + CFG.PUDDLE_CHANCE);
    var again = 0;
    var L2 = gen(11);
    for (var j = 0; j < idx.length; j++) if (CemRain.wantsPuddle(L2.tiles[idx[j]])) again++;
    TestRunner.assertEqual(again, n, 'deterministic per tile');
    TestRunner.assert(!CemRain.wantsPuddle({ kind: 'grass', gx: 5, gy: 5 }), 'grass never wants one');
  });

  TestRunner.test('a puddle spec is deterministic and fits inside its tile', () => {
    var a = CemRain.puddleSpec(12, 30), b = CemRain.puddleSpec(12, 30);
    TestRunner.assertEqual(JSON.stringify(a), JSON.stringify(b), 'same spec twice');
    for (var i = 0; i < 100; i++) {
      var s = CemRain.puddleSpec(i, 60 - i);
      TestRunner.assert(s.variant >= 0 && s.variant < 4 && s.variant === Math.floor(s.variant), 'one of four shapes');
      TestRunner.assert(s.scale >= 0.7 && s.scale <= 1.1, 'scale 0.7..1.1');
      TestRunner.assert(Math.abs(s.dx) <= 10 && Math.abs(s.dy) <= 5, 'stays near the tile centre');
      TestRunner.assert(typeof s.flip === 'boolean', 'mirrored or not');
    }
  });

  TestRunner.test('planPuddles keeps to the tiles offered, skips grass and honours the cap', () => {
    var L = gen(5);
    var all = [];
    for (var i = 0; i < L.tiles.length; i++) all.push(i);
    var specs = CemRain.planPuddles(L, all, 0);
    TestRunner.assert(specs.length > 0, 'some puddles');
    TestRunner.assert(specs.length <= CFG.MAX_PUDDLES, 'never over the cap');
    for (var k = 0; k < specs.length; k++) {
      var t = L.tiles[specs[k].index];
      TestRunner.assert(CemRain.isPuddleTile(t), 'only on lanes');
      TestRunner.assertEqual(specs[k].gx, t.gx, 'gx matches the tile');
      TestRunner.assertEqual(specs[k].gy, t.gy, 'gy matches the tile');
    }
    var few = CemRain.planPuddles(L, all, CFG.MAX_PUDDLES - 3);
    TestRunner.assertEqual(few.length, 3, 'room for three more');
    TestRunner.assertEqual(CemRain.planPuddles(L, all, CFG.MAX_PUDDLES).length, 0, 'none when full');
    TestRunner.assertEqual(CemRain.planPuddles(L, [], 0).length, 0, 'none for no tiles');
    var grass = [];
    for (var g = 0; g < L.tiles.length; g++) if (L.tiles[g].kind === 'grass' && !L.tiles[g].plaza) grass.push(g);
    TestRunner.assertEqual(CemRain.planPuddles(L, grass, 0).length, 0, 'grass gives nothing');
  });

  TestRunner.test('tilesAround gives the seen tiles within reach, inside the grid', () => {
    var L = gen(3);
    for (var i = 0; i < L.seen.length; i++) L.seen[i] = 0;
    TestRunner.assertEqual(CemRain.tilesAround(L, 10, 10, 2).length, 0, 'nothing seen, nothing around');
    for (var j = 0; j < L.seen.length; j++) L.seen[j] = 1;
    var mid = CemRain.tilesAround(L, 10, 10, 2);
    TestRunner.assertEqual(mid.length, 25, 'a 5x5 square in the open');
    for (var k = 0; k < mid.length; k++) {
      var t = L.tiles[mid[k]];
      TestRunner.assert(Math.abs(t.gx - 10) <= 2 && Math.abs(t.gy - 10) <= 2, 'within reach');
    }
    TestRunner.assertEqual(CemRain.tilesAround(L, 0, 0, 2).length, 9, 'clipped at the corner');
    TestRunner.assertEqual(CemRain.tilesAround(L, L.W - 1, L.H - 1, 3).length, 16, 'clipped at the far corner');
    L.seen[CemModel.index(L, 11, 10)] = 0;
    TestRunner.assertEqual(CemRain.tilesAround(L, 10, 10, 2).length, 24, 'an unseen tile is left out');
  });

  TestRunner.test('farthestPuddle picks the one to move, only when it is far enough', () => {
    var puddles = [{ spec: { gx: 5, gy: 5 } }, { spec: { gx: 30, gy: 5 } }, { spec: { gx: 8, gy: 20 } }];
    TestRunner.assertEqual(CemRain.farthestPuddle(puddles, 5, 5, 10), 1, 'the far one');
    TestRunner.assertEqual(CemRain.farthestPuddle(puddles, 30, 6, 10), 0, 'from the other side');
    TestRunner.assertEqual(CemRain.farthestPuddle(puddles, 5, 5, 26), -1, 'none far enough');
    TestRunner.assertEqual(CemRain.farthestPuddle([], 5, 5, 0), -1, 'none at all');
    TestRunner.assertEqual(CemRain.farthestPuddle(puddles, 5, 5, 0), 1, 'any distance will do');
  });

  TestRunner.test('the schedule is seeded: the same seed rains at the same moments', () => {
    var a = CemRain.schedule(42), b = CemRain.schedule(42), c = CemRain.schedule(43);
    for (var t = 0; t < 1200000; t += 5000) {
      TestRunner.assertEqual(CemRain.strengthAt(a, t), CemRain.strengthAt(b, t), 'same at ' + t);
    }
    var differs = false;
    for (var u = 0; u < 1200000 && !differs; u += 5000) if (CemRain.strengthAt(a, u) !== CemRain.strengthAt(c, u)) differs = true;
    TestRunner.assert(differs, 'another seed rains at other times');
    TestRunner.assertEqual(a.episodes.length, b.episodes.length, 'the same episodes were drawn');
  });

  TestRunner.test('episodes last 30-60 s, the first comes soon, and gaps never pass two minutes', () => {
    for (var seed = 1; seed <= 20; seed++) {
      var sched = CemRain.schedule(seed);
      CemRain.episodeAt(sched, 3600000);      // an hour of weather
      var eps = sched.episodes;
      TestRunner.assert(eps.length >= 20, 'plenty of episodes in an hour (' + eps.length + ')');
      TestRunner.assert(eps[0].start >= CFG.FIRST_GAP_MIN_MS && eps[0].start <= CFG.FIRST_GAP_MAX_MS, 'the first shower comes soon');
      for (var i = 0; i < eps.length; i++) {
        var len = eps[i].end - eps[i].start;
        TestRunner.assert(len >= CFG.EPISODE_MIN_MS && len <= CFG.EPISODE_MAX_MS, 'episode ' + i + ' lasts ' + len);
        if (i > 0) {
          var gap = eps[i].start - eps[i - 1].end;
          TestRunner.assert(gap >= CFG.GAP_MIN_MS && gap <= CFG.GAP_MAX_MS, 'gap ' + i + ' is ' + gap);
          TestRunner.assert(gap <= 120000, 'never more than two minutes dry');
        }
      }
    }
  });

  TestRunner.test('an episode ramps in, holds, fades out, and the gaps are dry', () => {
    var sched = CemRain.schedule(7);
    var e = sched.episodes[0];
    TestRunner.assertEqual(CemRain.strengthAt(sched, 0), 0, 'dry at the gate');
    TestRunner.assertEqual(CemRain.strengthAt(sched, e.start - 1), 0, 'dry until it starts');
    var mid = CemRain.strengthAt(sched, e.start + CFG.RAIN_RAMP_MS / 2);
    TestRunner.assert(mid > 0.4 && mid < 0.6, 'half way up the ramp');
    TestRunner.assertEqual(CemRain.strengthAt(sched, e.start + CFG.RAIN_RAMP_MS), 1, 'full after the ramp');
    TestRunner.assertEqual(CemRain.strengthAt(sched, (e.start + e.end) / 2), 1, 'full in the middle');
    var fading = CemRain.strengthAt(sched, e.end - CFG.RAIN_FADE_MS / 2);
    TestRunner.assert(fading > 0.4 && fading < 0.6, 'half way down the fade');
    TestRunner.assertEqual(CemRain.strengthAt(sched, e.end), 0, 'over at the end');
    var at = CemRain.episodeAt(sched, e.end + 1000);
    TestRunner.assert(!at.raining && at.previous === e && at.next === sched.episodes[1], 'in the gap: previous and next are known');
    TestRunner.assert(/^dry, next in \d+s$/.test(CemRain.describe(sched, e.end + 1000)), 'described as dry');
    TestRunner.assert(/^ep 1 1\.00, \d+s left$/.test(CemRain.describe(sched, (e.start + e.end) / 2)), 'described as raining');
    var last = 0;
    for (var t = e.start; t <= e.start + CFG.RAIN_RAMP_MS; t += 100) {
      var v = CemRain.strengthAt(sched, t);
      TestRunner.assert(v >= last, 'never eases off while ramping');
      last = v;
    }
  });

  TestRunner.test('a puddle fills while it rains and dries out slowly after', () => {
    var sched = CemRain.schedule(11, { EPISODE_MIN_MS: 60000, EPISODE_MAX_MS: 60000, GAP_MIN_MS: 600000, GAP_MAX_MS: 600000 });
    var e = sched.episodes[0];
    var spec = CemRain.puddleSpec(20, 20);
    TestRunner.assertEqual(CemRain.wetnessAt(sched, spec, 0), 0, 'dry before the first shower');
    TestRunner.assertEqual(CemRain.wetnessAt(sched, spec, e.start), 0, 'dry as it starts');
    var quarter = CemRain.wetnessAt(sched, spec, e.start + 15000);
    var half = CemRain.wetnessAt(sched, spec, e.start + 30000);
    TestRunner.assert(half > quarter && quarter >= 0, 'wetter as the rain goes on');
    var full = CemRain.wetnessAt(sched, spec, e.end - 1);
    TestRunner.assert(full > 0.95, 'full by the end of a long episode (' + full.toFixed(2) + ')');
    var later = CemRain.wetnessAt(sched, spec, e.end + 30000);
    TestRunner.assert(later < full && later > 0, 'drying after the rain stops');
    var gone = CemRain.wetnessAt(sched, spec, e.end + CFG.PUDDLE_DRY_MS * 1.3);
    TestRunner.assertEqual(gone, 0, 'dry again a couple of minutes later');
    var last = 0;
    for (var t = e.start; t < e.end; t += 1000) {
      var w = CemRain.wetnessAt(sched, spec, t);
      TestRunner.assert(w >= last, 'only fills while raining');
      last = w;
    }
    // every puddle has its own pace
    var seen = {};
    for (var i = 0; i < 30; i++) seen[CemRain.wetnessAt(sched, CemRain.puddleSpec(i, 3), e.start + 12000).toFixed(2)] = true;
    TestRunner.assert(Object.keys(seen).length > 8, 'puddles fill at different rates');
  });

  TestRunner.test('the recorder can wind the schedule through cfg overrides', () => {
    var fast = CemRain.schedule(5, { FIRST_GAP_MIN_MS: 1000, FIRST_GAP_MAX_MS: 1000, EPISODE_MIN_MS: 5000, EPISODE_MAX_MS: 5000,
      RAIN_RAMP_MS: 1000, RAIN_FADE_MS: 1000, PUDDLE_FILL_MS: 2000, PUDDLE_STAGGER_MS: 0, PUDDLE_DRY_MS: 2000 });
    TestRunner.assertEqual(fast.episodes[0].start, 1000, 'starts at one second');
    TestRunner.assertEqual(fast.episodes[0].end, 6000, 'five seconds long');
    TestRunner.assertEqual(CemRain.strengthAt(fast, 2000), 1, 'full after a one-second ramp');
    TestRunner.assert(CemRain.wetnessAt(fast, CemRain.puddleSpec(3, 3), 5999) > 0.95, 'puddles full within the episode');
    TestRunner.assertEqual(CemRain.wetnessAt(fast, CemRain.puddleSpec(3, 3), 10000), 0, 'dry again soon after');
    TestRunner.assertEqual(CemRain.CFG.EPISODE_MIN_MS, 30000, 'the defaults are untouched');
  });

  TestRunner.test('a mirror image hangs below the ground line, flipped, and reaches only nearby puddles', () => {
    // a grave 64 wide and 84 tall, anchored at its floor (origin y 0.9), standing at (100, 200)
    var grave = { x: 100, y: 200, displayWidth: 64, displayHeight: 84, originX: 0.5, originY: 0.9 };
    var r = CemRain.mirrorRect(grave);
    TestRunner.assertEqual(r.left, 68, 'same left edge');
    TestRunner.assertEqual(r.w, 64, 'same width');
    TestRunner.assertEqual(r.h, 84, 'same height');
    // upright it spans [124.4, 208.4]; mirrored about y=200 that is [191.6, 275.6]
    TestRunner.assert(Math.abs(r.top - 191.6) < 1e-9, 'top of the mirror image is just above the ground line');
    var r2 = CemRain.mirrorRect(grave, 190);
    TestRunner.assert(Math.abs(r2.top - 171.6) < 1e-9, 'a different ground line moves it');
    var W = 112, H = 56;
    TestRunner.assert(CemRain.rectHitsPuddle(r, 100, 240, 1, W, H), 'a puddle just below the grave sees it');
    TestRunner.assert(CemRain.rectHitsPuddle(r, 100, 290, 1, W, H), 'and one a little further down');
    TestRunner.assert(!CemRain.rectHitsPuddle(r, 100, 320, 1, W, H), 'but not one below its reach');
    TestRunner.assert(!CemRain.rectHitsPuddle(r, 100, 150, 1, W, H), 'nor one behind it');
    TestRunner.assert(!CemRain.rectHitsPuddle(r, 200, 240, 1, W, H), 'nor one off to the side');
    TestRunner.assert(CemRain.rectHitsPuddle(r, 100, 320, 2, W, H), 'a bigger puddle reaches further');
  });

  TestRunner.test('streaks fall down and to the right, and their picture leans the same way', () => {
    var v = CemRain.rainVelocity();
    TestRunner.assert(v.vy > 0 && v.vx > 0, 'down and right');
    TestRunner.assert(v.vy > v.vx * 3, 'mostly down');
    TestRunner.assert(Math.abs(Math.sqrt(v.vx * v.vx + v.vy * v.vy) - CFG.RAIN_SPEED) < 1e-6, 'at RAIN_SPEED');
    // a vertical streak (0,1) turned by `rotation` points along the velocity
    var dx = -Math.sin(v.rotation), dy = Math.cos(v.rotation);
    TestRunner.assert(Math.abs(dx * v.vy - dy * v.vx) < 1e-6, 'lined up with the fall');
    var straight = CemRain.rainVelocity({ RAIN_SLANT_DEG: 0, RAIN_SPEED: 100 });
    TestRunner.assertEqual(straight.vx, 0, 'no slant, no drift');
  });

  TestRunner.test('the spawn rate keeps RAIN_ALIVE streaks in the air and scales with strength', () => {
    var full = CemRain.rainRate(1);
    TestRunner.assert(Math.abs(full * CFG.RAIN_LIFE_MS / 1000 - CFG.RAIN_ALIVE) < 1e-6, 'rate times life is the count');
    TestRunner.assert(Math.abs(CemRain.rainRate(0.5) - full / 2) < 1e-6, 'half strength, half the rate');
    TestRunner.assertEqual(CemRain.rainRate(0), 0, 'no rain, no streaks');
  });

  TestRunner.test('droplet rings land RING_RATE a second while a puddle is in view', () => {
    TestRunner.assert(!CemRain.ringDue(0, 16, 0), 'never without a puddle');
    TestRunner.assert(CemRain.ringDue(0, 16, 3), 'a lucky roll lands one');
    TestRunner.assert(!CemRain.ringDue(0.99, 16, 3), 'an unlucky one does not');
    var p = CFG.RING_RATE * 16 / 1000;
    TestRunner.assert(CemRain.ringDue(p - 1e-6, 16, 1) && !CemRain.ringDue(p + 1e-6, 16, 1), 'the threshold is rate times frame time');
    TestRunner.assert(CemRain.ringDue(0.999, 5000, 1), 'a very long frame always lands one');
  });

  TestRunner.test('a splash is not repeated within SPLASH_MS', () => {
    TestRunner.assert(CemRain.splashDue(1000, undefined), 'the first one always plays');
    TestRunner.assert(!CemRain.splashDue(1000 + CFG.SPLASH_MS - 1, 1000), 'too soon');
    TestRunner.assert(CemRain.splashDue(1000 + CFG.SPLASH_MS, 1000), 'a step later');
  });
});
