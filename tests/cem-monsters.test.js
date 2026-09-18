/**
 * CemMonsters tests (procedural pose model for the cemetery monster sprites)
 */

TestRunner.suite('CemMonsters', () => {
  TestRunner.test('every motion and exit style is known, unknown ids fall back', () => {
    Object.keys(CemMonsters.MOTION).forEach(function(id) {
      TestRunner.assert(CemMonsters.MOTIONS.indexOf(CemMonsters.MOTION[id]) !== -1, id + ' motion valid');
    });
    ['fade', 'sink', 'vanish', 'runaway'].forEach(function() {});
    Object.keys(CemMonsters.EXIT).forEach(function(id) {
      TestRunner.assert(['fade', 'sink', 'vanish', 'runaway'].indexOf(CemMonsters.EXIT[id]) !== -1, id + ' exit valid');
    });
    TestRunner.assertEqual(CemMonsters.motionOf('nobody'), 'shamble', 'default motion');
    TestRunner.assertEqual(CemMonsters.exitOf('nobody'), 'runaway', 'default exit');
    TestRunner.assertEqual(CemMonsters.motionOf('grim_reaper'), 'glide', 'reaper glides');
    TestRunner.assertEqual(CemMonsters.motionOf('will_o_wisp'), 'hover', 'wisp hovers');
    CemMonsters.MOTIONS.forEach(function(m) { TestRunner.assert(CemMonsters.walkMs(m) > 200, m + ' walk duration'); });
    ['appear', 'lunge', 'flinch', 'exit'].forEach(function(k) { TestRunner.assert(CemMonsters.ACTIONS[k] > 0, k + ' duration'); });
  });

  TestRunner.test('idle and walking motion stay subtle and loop', () => {
    CemMonsters.MOTIONS.forEach(function(motion) {
      [false, true].forEach(function(walking) {
        for (var t = 0; t < 6; t += 0.31) {
          var o = CemMonsters.pose(motion, t, 0.7, { walking: walking });
          TestRunner.assert(Math.abs(o.sx - 1) < 0.15 && Math.abs(o.sy - 1) < 0.15, motion + ' scale subtle');
          TestRunner.assert(Math.abs(o.dx) < 8 && o.dy <= 0.01 && o.dy > -30, motion + ' offsets small');
          TestRunner.assert(Math.abs(o.rot) < 0.2, motion + ' rotation subtle');
          TestRunner.assertEqual(o.alpha, 1, motion + ' opaque');
        }
      });
      var a = CemMonsters.pose(motion, 0.5, 0, {}), b = CemMonsters.pose(motion, 0.5 + 2.4 * 5, 0, {});
      TestRunner.assert(Math.abs(a.dy - b.dy) < 1e-6 && Math.abs(a.sy - b.sy) < 1e-6, motion + ' periodic');
    });
  });

  TestRunner.test('lunge snaps toward the target and settles, flinch recoils', () => {
    var dir = { x: 0.6, y: 0.8 };
    var windup = CemMonsters.pose('shamble', 0, 0, { lunge: 0.2, dir: dir });
    var peak = CemMonsters.pose('shamble', 0, 0, { lunge: 0.5, dir: dir });
    var end = CemMonsters.pose('shamble', 0, 0, { lunge: 1, dir: dir });
    TestRunner.assert(peak.dx > 20 && peak.dy > 25, 'lunge reaches toward the target');
    TestRunner.assert(windup.dx < 0 && windup.dy < 0, 'lunge winds up backwards');
    TestRunner.assert(Math.abs(end.dx) < 1e-6 && Math.abs(end.dy - CemMonsters.pose('shamble', 0, 0, {}).dy) < 1e-6, 'lunge settles');
    var flinch = CemMonsters.pose('shamble', 0, 0, { flinch: 0.5, dir: dir });
    TestRunner.assert(flinch.dx < 0 && flinch.dy < 0, 'flinch recoils away from the target');
  });

  TestRunner.test('appear grows in and every exit style ends invisible', () => {
    var start = CemMonsters.pose('hover', 0, 0, { appear: 0.02 });
    TestRunner.assert(start.sx < 0.2 && start.alpha < 0.1, 'appear starts small and faint');
    var done = CemMonsters.pose('hover', 0, 0, { appear: 1 });
    TestRunner.assert(Math.abs(done.sx - CemMonsters.pose('hover', 0, 0, {}).sx) < 1e-6 && done.alpha === 1, 'appear ends at rest');
    ['fade', 'sink', 'vanish', 'runaway'].forEach(function(style) {
      var mid = CemMonsters.pose('shamble', 0, 0, { exit: 0.3, exitStyle: style, dir: { x: 1, y: 0 } });
      var fin = CemMonsters.pose('shamble', 0, 0, { exit: 1, exitStyle: style, dir: { x: 1, y: 0 } });
      TestRunner.assert(mid.alpha > 0.2, style + ' still visible early');
      TestRunner.assert(fin.alpha < 0.01, style + ' invisible at the end');
    });
    var run = CemMonsters.pose('shamble', 0, 0, { exit: 0.9, exitStyle: 'runaway', dir: { x: 1, y: 0 } });
    TestRunner.assert(run.dx < -60, 'runaway moves away from the target');
    var sink = CemMonsters.pose('shamble', 0, 0, { exit: 0.8, exitStyle: 'sink' });
    TestRunner.assert(sink.dy > 10 && sink.sy < 0.6, 'sink goes into the ground');
  });

  TestRunner.test('progress and facing helpers', () => {
    TestRunner.assertEqual(CemMonsters.progress(0, 100, 500), -1, 'not started');
    TestRunner.assertEqual(CemMonsters.progress(1000, 1250, 500), 0.5, 'half way');
    TestRunner.assertEqual(CemMonsters.progress(1000, 1600, 500), -1, 'finished');
    TestRunner.assertEqual(CemMonsters.facing(-3), true, 'moving left flips');
    TestRunner.assertEqual(CemMonsters.facing(3), false, 'moving right does not flip');
  });
});
