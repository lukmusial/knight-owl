/**
 * FpMonsters tests (config and procedural motion; loading needs WebGL)
 */

TestRunner.suite('FpMonsters', () => {
  var LEVEL1 = ['goblin', 'giant_rat', 'slime', 'bat_swarm', 'zombie', 'mimic', 'wolf', 'giant_snake', 'vampire_bunny'];

  TestRunner.test('every level-1 monster has a model config', () => {
    var level1 = MONSTERS.filter(function(m) { return m.difficulty === 1; }).map(function(m) { return m.id; }).sort();
    TestRunner.assertEqual(level1.join(','), LEVEL1.slice().sort().join(','), 'level-1 roster matches the model list');
    level1.forEach(function(id) {
      var c = FpMonsters.config(id);
      TestRunner.assertTruthy(c, id + ' configured');
      TestRunner.assert(c.height > 1 && c.height < 3, id + ' height in range');
      TestRunner.assertEqual(FpMonsters.url(id), 'assets/proto/fp/monsters/' + id + '.glb', id + ' url');
    });
    TestRunner.assertTruthy(FpMonsters.config('dragon'), 'the dragon is a model too');
    var tallest = Math.max.apply(null, Object.keys(FpMonsters.MODELS).map(function(id) { return FpMonsters.MODELS[id].height; }));
    TestRunner.assert(tallest <= 3.5, 'nothing reaches through the chamber vault');
  });

  TestRunner.test('idle motion stays subtle and loops', () => {
    ['breathe', 'squash', 'hover', 'sway'].forEach(function(motion) {
      for (var t = 0; t < 5; t += 0.37) {
        var o = FpMonsters.pose(motion, t, 1, {});
        TestRunner.assert(Math.abs(o.sy - 1) < 0.1 && Math.abs(o.sx - 1) < 0.1, motion + ' scale subtle');
        TestRunner.assert(o.y >= 0 && o.y < 0.3, motion + ' bob small');
        TestRunner.assertEqual(o.forward, 0, motion + ' stays in place without a reaction');
      }
      var a = FpMonsters.pose(motion, 0.5, 0, {}), b = FpMonsters.pose(motion, 0.5 + 2.4 * 5, 0, {});
      TestRunner.assert(Math.abs(a.sy - b.sy) < 1e-9 && Math.abs(a.y - b.y) < 1e-9, motion + ' periodic');
    });
  });

  TestRunner.test('lunge moves toward the player and returns, flinch recoils', () => {
    var peak = FpMonsters.pose('breathe', 0, 0, { lunge: 0.5 });
    var windup = FpMonsters.pose('breathe', 0, 0, { lunge: 0.2 });
    var end = FpMonsters.pose('breathe', 0, 0, { lunge: 1 });
    TestRunner.assert(peak.forward > 1, 'lunge reaches forward');
    TestRunner.assert(windup.forward < 0, 'lunge winds up backwards first');
    TestRunner.assert(Math.abs(end.forward) < 1e-9, 'lunge settles back');
    var flinch = FpMonsters.pose('breathe', 0, 0, { flinch: 0.5 });
    TestRunner.assert(flinch.forward < -0.2, 'flinch recoils away from the player');
  });

  TestRunner.test('reaction progress is bounded', () => {
    TestRunner.assertEqual(FpMonsters.progress(0, 500, 400), -1, 'never started');
    TestRunner.assertEqual(FpMonsters.progress(1000, 1200, 400), 0.5, 'halfway');
    TestRunner.assertEqual(FpMonsters.progress(1000, 1500, 400), -1, 'finished');
  });

  TestRunner.test('load resolves null without three.js or a model', () => {
    return Promise.all([FpMonsters.load('goblin'), FpMonsters.load('dragon')]).then(function(r) {
      TestRunner.assertEqual(r[0], null, 'no THREE in node');
      TestRunner.assertEqual(r[1], null, 'no model for the dragon');
    });
  });
  TestRunner.test('every model has an exit style', () => {
    Object.keys(FpMonsters.MODELS).forEach(function(id) {
      TestRunner.assert(['runaway', 'flyaway', 'vanish'].indexOf(FpMonsters.config(id).exit) !== -1, id + ' exit style');
    });
    ['appear', 'taunt', 'hurt', 'attack', 'exit'].forEach(function(k) {
      TestRunner.assert(FpMonsters.ACTIONS[k] >= 400 && FpMonsters.ACTIONS[k] <= 1500, k + ' duration readable but short');
    });
  });

  TestRunner.test('appear rises in from nothing and settles at full size', () => {
    var start = FpMonsters.pose('breathe', 0, 0, { appear: 0 });
    var end = FpMonsters.pose('breathe', 0, 0, { appear: 1 });
    TestRunner.assert(start.sy > 0 && start.sy < 0.01 && start.fade === 0, 'starts invisible');
    TestRunner.assert(start.y < 0, 'starts below the floor');
    TestRunner.assert(Math.abs(end.sy - 1) < 0.03 && end.fade === 1 && end.y === 0, 'ends in place');
  });

  TestRunner.test('taunt hops toward the player and back', () => {
    TestRunner.assert(FpMonsters.pose('breathe', 0, 0, { taunt: 0.5 }).forward > 0.3, 'hops forward');
    TestRunner.assert(Math.abs(FpMonsters.pose('breathe', 0, 0, { taunt: 1 }).forward) < 1e-9, 'lands back');
  });

  TestRunner.test('exits: run away turns and leaves, fly away climbs, vanish shrinks; all fade out', () => {
    var run = FpMonsters.pose('breathe', 0, 0, { exit: 1, exitStyle: 'runaway' });
    var fly = FpMonsters.pose('hover', 0, 0, { exit: 1, exitStyle: 'flyaway' });
    var gone = FpMonsters.pose('squash', 0, 0, { exit: 1, exitStyle: 'vanish' });
    TestRunner.assert(Math.abs(run.rotY - Math.PI) < 1e-9 && run.forward < -3, 'turns round and runs off');
    TestRunner.assert(fly.y > 1.5 && fly.forward < -3, 'flies up and away');
    TestRunner.assert(gone.sy < 0.01, 'vanish shrinks to nothing');
    [run, fly, gone].forEach(function(o) { TestRunner.assertEqual(o.fade, 0, 'fully faded'); });
    var midRun = FpMonsters.pose('breathe', 0, 0, { exit: 0.3, exitStyle: 'runaway' });
    TestRunner.assertEqual(midRun.fade, 1, 'still visible while turning');
  });
  TestRunner.test('every monster in the game has a 3D model, and so does the treasure', () => {
    var ids = (typeof MONSTERS !== 'undefined' ? MONSTERS : []).map(function(m) { return m.id; });
    TestRunner.assert(ids.length > 30, 'the roster was loaded');
    ids.forEach(function(id) {
      TestRunner.assert(FpMonsters.has(id), id + ' has a model');
      var cfg = FpMonsters.config(id);
      TestRunner.assert(cfg.height > 0.5 && cfg.height < 6, id + ' is a believable height');
      TestRunner.assert(['runaway', 'flyaway', 'vanish'].indexOf(cfg.exit) !== -1, id + ' leaves in a known way');
    });
    TestRunner.assert(FpMonsters.has('treasure'), 'the treasure hoard is a model too');
    TestRunner.assertEqual(FpMonsters.config('treasure').motion, 'still', 'gold does not breathe');
  });

  TestRunner.test('a still model holds its pose', () => {
    var a = FpMonsters.pose('still', 0, 0, {});
    var b = FpMonsters.pose('still', 1.3, 2, {});
    ['y', 'sx', 'sy', 'sz', 'rotZ'].forEach(function(k) {
      TestRunner.assertEqual(a[k], b[k], k + ' does not drift');
    });
    TestRunner.assertEqual(b.sy, 1, 'no breathing');
  });
});
