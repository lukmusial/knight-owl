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
  TestRunner.test('clipFor picks the reaction over the gait', () => {
    const south = { gdir: { x: 1, y: 1 } };
    var hit = CemMonsters.clipFor({ walking: true, lunge: 0.5, flinch: 0.5, gdir: south.gdir });
    TestRunner.assertEqual(hit.clip, 'hit', 'being hit beats everything');
    TestRunner.assertEqual(CemMonsters.clipFor({ walking: true, lunge: 0.5, gdir: south.gdir }).clip, 'attack', 'attacking beats walking');
    TestRunner.assertEqual(CemMonsters.clipFor({ walking: true, gdir: south.gdir }).clip, 'walk', 'walking');
    TestRunner.assertEqual(CemMonsters.clipFor(south).clip, 'idle', 'idle by default');
    TestRunner.assertEqual(CemMonsters.clipFor({ exit: 0.4, gdir: south.gdir }).clip, 'hit', 'leaving keeps the hurt pose');
  });

  TestRunner.test('facingFor covers all eight directions from five rendered ones', () => {
    const sheet = ['down', 'down_right', 'right', 'up_right', 'up'];
    const cases = [
      [1, 1, 'down', false], [1, 0, 'down_right', false], [1, -1, 'right', false],
      [0, -1, 'up_right', false], [-1, -1, 'up', false],
      [-1, 0, 'up_right', true], [-1, 1, 'right', true], [0, 1, 'down_right', true]
    ];
    const seen = {};
    cases.forEach(function(c) {
      const f = CemMonsters.facingFor(c[0], c[1], sheet);
      TestRunner.assertEqual(f.facing, c[2], 'grid ' + c[0] + ',' + c[1] + ' uses the ' + c[2] + ' sheet');
      TestRunner.assertEqual(f.flip, c[3], 'grid ' + c[0] + ',' + c[1] + ' flip');
      seen[f.name] = true;
    });
    TestRunner.assertEqual(Object.keys(seen).length, 8, 'eight distinct directions');
    // near-diagonals snap to the closest of the eight
    TestRunner.assertEqual(CemMonsters.facingFor(1, 0.2, sheet).name, 'down_right', 'a small drift keeps the facing');
    TestRunner.assertEqual(CemMonsters.facingFor(0, 0, sheet).name, 'down_left', 'standing still faces the viewer');
  });

  TestRunner.test('facingFor falls back to an old two-facing sheet', () => {
    const old = ['front', 'back'];
    TestRunner.assertEqual(CemMonsters.facingFor(1, 1, old).facing, 'front', 'coming toward the viewer');
    TestRunner.assertEqual(CemMonsters.facingFor(1, -1, old).facing, 'back', 'walking away');
    TestRunner.assertEqual(CemMonsters.facingFor(-1, 1, old).flip, true, 'front sheet mirrors going left');
    TestRunner.assertEqual(CemMonsters.facingFor(1, 1, old).flip, false, 'front sheet as rendered going right');
    TestRunner.assertEqual(CemMonsters.clipFor({ gdir: { x: 1, y: -1 } }, old).facing, 'back', 'clipFor passes the sheet through');
  });

  TestRunner.test('a rendered walk cycle damps the procedural gait but not the reactions', () => {
    var plain = CemMonsters.pose('shamble', 0.4, 0, { walking: true });
    var anim = CemMonsters.pose('shamble', 0.4, 0, { walking: true, animated: true });
    TestRunner.assert(Math.abs(anim.rot) < Math.abs(plain.rot), 'less roll when the sheet strides');
    TestRunner.assert(Math.abs(anim.dy) <= Math.abs(plain.dy), 'less bob when the sheet strides');
    var dir = { x: 0, y: 1 };
    var lungePlain = CemMonsters.pose('shamble', 0, 0, { lunge: 0.5, dir: dir });
    var lungeAnim = CemMonsters.pose('shamble', 0, 0, { lunge: 0.5, dir: dir, animated: true });
    TestRunner.assert(Math.abs(lungeAnim.dy - lungePlain.dy) < 1e-6, 'the lunge still reaches Mr Owl');
  });

  TestRunner.test('map heights: small kinds stand shorter than a zombie, the Reaper tallest', () => {
    TestRunner.assert(CemMonsters.mapHeight('spider') < CemMonsters.mapHeight('zombie'), 'spider shorter than zombie');
    TestRunner.assert(CemMonsters.mapHeight('giant_rat') < CemMonsters.mapHeight('ghost'), 'rat shorter than ghost');
    TestRunner.assertEqual(CemMonsters.mapHeight('zombie'), CemMonsters.MAP_H * CemMonsters.MAP_SCALE.zombie, 'MAP_H times MAP_SCALE');
    TestRunner.assertEqual(CemMonsters.mapHeight('unknown_kind'), CemMonsters.MAP_H, 'an unknown kind stands MAP_H');
    TestRunner.assertEqual(CemMonsters.mapHeight('grim_reaper'), CemMonsters.BOSS_H, 'the Reaper by id');
    TestRunner.assertEqual(CemMonsters.mapHeight('anything', 'boss'), CemMonsters.BOSS_H, 'the Reaper by role');
  });

  TestRunner.test('map sprite sheets are sized for the map, not the card', () => {
    if (typeof require === 'undefined') return;   // node only: reads the sheets on disk
    var fs = require('fs'), path = require('path');
    var dir = path.join(__dirname, '..', 'www', 'assets', 'proto', 'iso', 'monsters');
    var index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).monsters;
    TestRunner.assert(index.length > 0, 'index lists sheets');
    var HEADROOM = 1.5;   // shrink_iso_sheets.py: sharp up to zoom 1.5
    var decoded = 0;
    index.forEach(function(id) {
      var sheet = JSON.parse(fs.readFileSync(path.join(dir, id + '.json'), 'utf8'));
      var meta = sheet.meta;
      var want = CemMonsters.mapHeight(id) * HEADROOM;
      // a sheet may be smaller than the map wants (the render is what it is) but never bigger
      TestRunner.assert(meta.figureHeight <= want + 1, id + ' figure ' + meta.figureHeight + ' px for a map height of ' + (want / HEADROOM));
      var png = fs.readFileSync(path.join(dir, id + '.png'));
      var w = png.readUInt32BE(16), h = png.readUInt32BE(20);
      TestRunner.assertEqual(w + 'x' + h, meta.size.w + 'x' + meta.size.h, id + ' json size matches the png');
      Object.keys(sheet.frames).forEach(function(name) {
        var f = sheet.frames[name].frame;
        TestRunner.assert(f.x + f.w <= w && f.y + f.h <= h, id + ' frame ' + name + ' inside the sheet');
      });
      decoded += w * h * 4;
    });
    TestRunner.assert(decoded < 70 * 1048576, 'all map sheets decode to under 70 MB (' + Math.round(decoded / 1048576) + ' MB)');
  });
});
