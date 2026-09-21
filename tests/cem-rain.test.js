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
      TestRunner.assert(s.delayMs >= 0 && s.delayMs <= CFG.PUDDLE_STAGGER_MS, 'staggered within the window');
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

  TestRunner.test('the rain waits, ramps in and stays', () => {
    TestRunner.assertEqual(CemRain.rainStrength(0), 0, 'dry at the start');
    TestRunner.assertEqual(CemRain.rainStrength(CFG.RAIN_DELAY_MS - 1), 0, 'dry until the delay');
    var mid = CemRain.rainStrength(CFG.RAIN_DELAY_MS + CFG.RAIN_RAMP_MS / 2);
    TestRunner.assert(mid > 0.4 && mid < 0.6, 'half way through the ramp');
    TestRunner.assertEqual(CemRain.rainStrength(CFG.RAIN_DELAY_MS + CFG.RAIN_RAMP_MS), 1, 'full after the ramp');
    TestRunner.assertEqual(CemRain.rainStrength(1e7), 1, 'and stays full');
    var last = -1;
    for (var t = 0; t < CFG.RAIN_DELAY_MS + CFG.RAIN_RAMP_MS; t += 250) {
      var v = CemRain.rainStrength(t);
      TestRunner.assert(v >= last, 'never eases off while ramping');
      last = v;
    }
  });

  TestRunner.test('a puddle fills after its own delay, over PUDDLE_FILL_MS, and puddles differ', () => {
    var spec = CemRain.puddleSpec(20, 20);
    var start = CFG.RAIN_DELAY_MS + spec.delayMs;
    TestRunner.assertEqual(CemRain.puddleFill(spec, start - 1), 0, 'dry before its start');
    TestRunner.assertEqual(CemRain.puddleFill(spec, start + CFG.PUDDLE_FILL_MS), 1, 'full a fill later');
    var half = CemRain.puddleFill(spec, start + CFG.PUDDLE_FILL_MS / 2);
    TestRunner.assert(half > 0.4 && half < 0.6, 'half full half way');
    var last = -1;
    for (var t = 0; t <= start + CFG.PUDDLE_FILL_MS; t += 1000) {
      var v = CemRain.puddleFill(spec, t);
      TestRunner.assert(v >= last, 'only ever fills');
      last = v;
    }
    var delays = {};
    for (var i = 0; i < 30; i++) delays[Math.round(CemRain.puddleSpec(i, 3).delayMs / 1000)] = true;
    TestRunner.assert(Object.keys(delays).length > 10, 'starts are spread out');
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
