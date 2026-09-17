/**
 * FpOwl tests (pure placement and clip rules; the three.js part needs WebGL)
 */

TestRunner.suite('FpOwl', () => {
  function dist2(a, b) { return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.z - b.z) * (a.z - b.z)); }

  TestRunner.test('third person is the default camera', () => {
    TestRunner.assertEqual(FpOwl.DEFAULT_MODE, 'third', 'default mode');
    TestRunner.assertEqual(FpOwl.storedMode(), 'third', 'nothing stored (no localStorage in node) gives third person');
  });

  TestRunner.test('view modes cycle first -> third -> first', () => {
    TestRunner.assertEqual(FpOwl.nextMode('first'), 'third', 'first to third');
    TestRunner.assertEqual(FpOwl.nextMode('third'), 'first', 'third to first');
    TestRunner.assert(FpOwl.isMode('third') && !FpOwl.isMode('side'), 'mode validation');
  });

  TestRunner.test('owl stands behind the chamber centre, facing the view direction', () => {
    [0, 90, 180, 270].forEach(function(yaw) {
      var r = FpOwl.thirdPerson({ x: 10, z: -20, yaw: yaw }, 0, { fov: 92, aspect: 0.5 });
      var y = yaw * Math.PI / 180, fx = -Math.sin(y), fz = -Math.cos(y);
      TestRunner.assert(Math.abs(dist2(r.owl, { x: 10, z: -20 }) - FpOwl.RIG.owlBack) < 1e-9, 'owl offset at yaw ' + yaw);
      // centre is ahead of the owl
      var ahead = (10 - r.owl.x) * fx + (-20 - r.owl.z) * fz;
      TestRunner.assert(ahead > 0, 'centre in front of the owl at yaw ' + yaw);
      TestRunner.assertEqual(r.owl.yaw, yaw, 'owl faces the view');
    });
  });

  TestRunner.test('camera is behind, above and to the right of the owl, looking past him', () => {
    [0, 90, 180, 270].forEach(function(yaw) {
      var r = FpOwl.thirdPerson({ x: 0, z: 0, yaw: yaw }, 0, { fov: 92, aspect: 0.5 });
      var y = yaw * Math.PI / 180;
      var fx = -Math.sin(y), fz = -Math.cos(y), rx = Math.cos(y), rz = -Math.sin(y);
      var dx = r.camera.x - r.owl.x, dz = r.camera.z - r.owl.z;
      TestRunner.assert(dx * fx + dz * fz < -2, 'camera behind at yaw ' + yaw);
      TestRunner.assert(dx * rx + dz * rz > 0.3, 'camera over the right shoulder at yaw ' + yaw);
      TestRunner.assert(r.camera.y > FpOwl.RIG.height, 'camera above the owl');
      var tx = r.target.x - r.owl.x, tz = r.target.z - r.owl.z;
      TestRunner.assert(tx * fx + tz * fz > 1, 'target in front of the owl at yaw ' + yaw);
      TestRunner.assert(r.target.y < r.camera.y, 'looks down a little');
    });
  });

  TestRunner.test('pitch frames the owl above the bottom HUD for the field of view', () => {
    var portrait = FpOwl.thirdPerson({ x: 0, z: 0, yaw: 0 }, 0, { fov: 92, aspect: 0.45 });
    var landscape = FpOwl.thirdPerson({ x: 0, z: 0, yaw: 0 }, 0, { fov: 68, aspect: 2.2 });
    TestRunner.assert(portrait.pitch > 5 && portrait.pitch < 30, 'portrait pitch ' + portrait.pitch);
    TestRunner.assert(landscape.pitch > portrait.pitch, 'narrower landscape FOV pitches further down');
    // the torso projects below the screen centre by the configured share
    var R = FpOwl.RIG;
    var toTorso = Math.atan2(R.camHeight - R.torsoHeight, R.camBack);
    var below = Math.tan(toTorso - portrait.pitch * Math.PI / 180) / Math.tan(46 * Math.PI / 180);
    TestRunner.assert(Math.abs(below - R.screenBelow.portrait) < 1e-6, 'torso at the portrait framing line');
  });

  TestRunner.test('walk bob lifts the camera', () => {
    var still = FpOwl.thirdPerson({ x: 0, z: 0, yaw: 0 }, 0, { fov: 92, aspect: 0.5 });
    var bob = FpOwl.thirdPerson({ x: 0, z: 0, yaw: 0 }, 0.07, { fov: 92, aspect: 0.5 });
    TestRunner.assert(bob.camera.y > still.camera.y, 'camera rises with the bob');
  });

  TestRunner.test('movements map to clips', () => {
    TestRunner.assertEqual(FpOwl.clipFor('step').clip, 'Walk', 'steps walk');
    TestRunner.assertEqual(FpOwl.clipFor('step').once, false, 'walk loops');
    TestRunner.assertEqual(FpOwl.clipFor('turn').clip, 'Walk', 'turns shuffle');
    TestRunner.assertEqual(FpOwl.clipFor('knockback').clip, 'Flap', 'knockback flaps');
    TestRunner.assertEqual(FpOwl.clipFor('bump').once, true, 'bump is one-shot');
    TestRunner.assertEqual(FpOwl.clipFor('attack').clip, 'Attack', 'correct answer attacks');
    TestRunner.assertEqual(FpOwl.clipFor('anything').clip, 'Idle', 'default idle');
  });

  TestRunner.test('load resolves null without three.js', () => {
    return FpOwl.load().then(function(g) {
      TestRunner.assertEqual(g, null, 'no THREE in node');
    });
  });
});
