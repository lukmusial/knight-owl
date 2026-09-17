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
    TestRunner.assertEqual(FpMonsters.has('dragon'), false, 'dragon keeps its billboard');
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
});
