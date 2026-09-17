/**
 * FpLayout Tests
 * Chamber shell geometry, dressing and torch light assignment of the
 * first-person prototype.
 */

TestRunner.suite('FpLayout', () => {
  var D = FpLayout.DIMS;

  function walls(n, e, s, w) { return { N: n, E: e, S: s, W: w }; }
  function cell(x, y, type, ws) { return { id: 'room_' + x + '_' + y, x: x, y: y, type: type || 'corridor', walls: ws }; }
  function near(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-6); }

  TestRunner.test('plan columns form a closed rounded loop within the chamber footprint', () => {
    var cols = FpLayout.planColumns(walls(true, true, true, true), D, {});
    TestRunner.assert(cols.length > 20, 'enough columns');
    var ok = cols.every(function(c) {
      return Math.abs(c.x) <= D.CH + 1e-6 && Math.abs(c.z) <= D.CH + 1e-6 && near(c.nx * c.nx + c.nz * c.nz, 1, 1e-6);
    });
    TestRunner.assert(ok, 'columns lie inside the chamber with unit normals');
    // corners are rounded: no column sits at a square corner
    var sharp = cols.some(function(c) { return Math.abs(c.x) > D.CH - D.R + 0.01 && Math.abs(c.z) > D.CH - D.R + 0.01 && near(Math.abs(c.x), D.CH) && near(Math.abs(c.z), D.CH); });
    TestRunner.assert(!sharp, 'no square corner point');
    for (var i = 1; i < cols.length; i++) {
      if (cols[i].u < cols[i - 1].u - 1e-9) throw new Error('u must not decrease at column ' + i);
    }
  });

  TestRunner.test('solid chambers have no door columns, open sides have one arch run each', () => {
    var closed = FpLayout.planColumns(walls(true, true, true, true), D, { archSeg: 8 });
    TestRunner.assertEqual(closed.filter(function(c) { return c.door; }).length, 0, 'no door columns');
    var open = FpLayout.planColumns(walls(false, true, false, true), D, { archSeg: 8 });
    var doors = open.filter(function(c) { return c.door; });
    TestRunner.assertEqual(doors.length, 18, 'two arches of 9 columns');
    TestRunner.assert(doors.every(function(c) { return c.side === 'N' || c.side === 'S'; }), 'arches on the open sides');
    var J = FpLayout.doorHalf(D);
    TestRunner.assert(doors.every(function(c) { return Math.abs(c.s) <= J + 1e-9; }), 'door columns within the opening');
  });

  TestRunner.test('archHeight follows the semicircle and clamps to the jamb height', () => {
    TestRunner.assert(near(FpLayout.archHeight(0, 1.5, D), D.PH + 1.5), 'crown');
    TestRunner.assert(near(FpLayout.archHeight(1.5, 1.5, D), D.PH), 'spring');
    TestRunner.assert(near(FpLayout.archHeight(3, 1.5, D), D.PH), 'outside');
  });

  TestRunner.test('wall profile starts with a cove on the floor and reaches the vault spring', () => {
    var rows = FpLayout.wallProfile(D, 3, 5);
    TestRunner.assert(near(rows[0].y, 0) && near(rows[0].inset, D.COVE), 'cove foot on the floor, inset by the radius');
    TestRunner.assert(near(rows[3].y, D.COVE) && near(rows[3].inset, 0), 'cove meets the wall plane');
    TestRunner.assert(near(rows[rows.length - 1].y, D.WALL_TOP), 'top row at the spring');
    for (var i = 1; i < rows.length; i++) {
      if (!(rows[i].y > rows[i - 1].y)) throw new Error('rows must rise');
    }
  });

  TestRunner.test('vault rings rise to the apex while shrinking to the cap scale', () => {
    var rings = FpLayout.vaultRings(D, 5);
    TestRunner.assert(near(rings[0].f, 1) && near(rings[0].y, D.WALL_TOP), 'starts at the wall');
    TestRunner.assert(near(rings[5].f, D.VAULT_MIN) && near(rings[5].y, D.CEIL_MAX), 'ends at the cap');
  });

  TestRunner.test('chamber shell is a rectangular grid; door columns start on the arch, solid ones on the floor', () => {
    var sh = FpLayout.chamberShell(walls(true, false, true, true), D, { wallRows: 5, vaultRows: 4, coveSeg: 3 });
    TestRunner.assertEqual(sh.points.length, sh.rows, 'row count');
    TestRunner.assert(sh.points.every(function(r) { return r.length === sh.cols; }), 'every row has every column');
    TestRunner.assertEqual(sh.wallRows, 4 + 5, 'cove + wall rows');
    TestRunner.assertEqual(sh.rows, sh.wallRows + 4, 'plus vault rings');
    var J = FpLayout.doorHalf(D);
    for (var c = 0; c < sh.cols; c++) {
      var col = sh.columns[c];
      var y0 = sh.points[0][c][1];
      if (col.door) {
        if (!near(y0, FpLayout.archHeight(col.s, J, D))) throw new Error('door column ' + c + ' should start on the arch');
      } else if (!near(y0, 0)) {
        throw new Error('solid column ' + c + ' should start on the floor');
      }
      if (!near(sh.points[sh.rows - 1][c][1], D.CEIL_MAX)) throw new Error('column ' + c + ' should end at the apex');
    }
    TestRunner.assertEqual(sh.cap.length, sh.cols, 'cap ring matches the columns');
  });

  TestRunner.test('wall unevenness stays within ROUGH and never moves door columns', () => {
    var flat = FpLayout.chamberShell(walls(false, true, true, true), D, { rough: 0 });
    var rough = FpLayout.chamberShell(walls(false, true, true, true), D, { ox: 30, oz: 20 });
    var maxOff = 0, doorOff = 0;
    for (var r = 0; r < flat.rows; r++) {
      for (var c = 0; c < flat.cols; c++) {
        var a = flat.points[r][c], b = rough.points[r][c];
        var d = Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[2] - b[2]) * (a[2] - b[2]));
        maxOff = Math.max(maxOff, d);
        if (flat.columns[c].door) doorOff = Math.max(doorOff, d);
      }
    }
    TestRunner.assert(maxOff > 0.005, 'walls are displaced');
    TestRunner.assert(maxOff <= D.ROUGH + 1e-6, 'displacement bounded');
    TestRunner.assertEqual(doorOff, 0, 'door columns untouched');
  });

  TestRunner.test('floor ring reaches out to the passage under each opening', () => {
    var ring = FpLayout.floorRing(walls(false, true, true, true), D, {});
    var farthest = ring.reduce(function(m, p) { return Math.min(m, p[2]); }, 0);
    TestRunner.assert(near(farthest, -(D.CH + D.SPLAY)), 'north opening floor reaches the reveal depth');
    TestRunner.assert(ring.every(function(p) { return p[1] === 0; }), 'flat');
    var closed = FpLayout.floorRing(walls(true, true, true, true), D, {});
    TestRunner.assert(closed.every(function(p) { return Math.abs(p[0]) <= D.CH - D.COVE + 1e-6 && Math.abs(p[2]) <= D.CH - D.COVE + 1e-6; }), 'closed floor stops at the cove foot');
  });

  TestRunner.test('passage profile is symmetric, coved and topped by the arch', () => {
    var prof = FpLayout.passageProfile(D, 8);
    var first = prof[0], last = prof[prof.length - 1];
    TestRunner.assert(near(first.y, 0) && near(last.y, 0), 'ends on the floor');
    TestRunner.assert(near(first.s, -last.s), 'symmetric ends');
    TestRunner.assert(near(first.s, -(D.PR - D.PCOVE)), 'cove narrows the floor');
    var top = prof.reduce(function(m, p) { return Math.max(m, p.y); }, 0);
    TestRunner.assert(near(top, D.PH + D.PR, 0.01), 'arch crown');
  });

  TestRunner.test('torchSpots puts both torches on one solid wall, else flanking a doorway', () => {
    var seenDirs = {};
    for (var x = 0; x < 7; x++) {
      for (var y = 0; y < 6; y++) {
        var ws = walls(true, false, true, false);
        var t = FpLayout.torchSpots(cell(x, y, 'corridor', ws), D);
        TestRunner.assertEqual(t.length, 2, 'two torches');
        TestRunner.assertEqual(t[0].dir, t[1].dir, 'same side');
        TestRunner.assert(ws[t[0].dir], 'on a solid wall');
        TestRunner.assert(Math.abs(t[0].s + t[1].s) < 1e-9 && Math.abs(t[0].s) > 0.5, 'symmetric about the wall centre');
        TestRunner.assert(Math.abs(t[0].s) < D.CH - D.R, 'on the flat part of the wall');
        seenDirs[t[0].dir] = true;
      }
    }
    TestRunner.assert(seenDirs.N && seenDirs.S, 'side varies between chambers');

    var c = FpLayout.torchSpots(cell(2, 3, 'corridor', walls(false, false, false, false)), D);
    TestRunner.assertEqual(c.length, 2, 'crossroads still gets two torches');
    var J = FpLayout.doorHalf(D), L = D.CH - D.R;
    TestRunner.assert(c.every(function(t) { return Math.abs(t.s) > J && Math.abs(t.s) < L; }), 'between the reveal and the corner');
    TestRunner.assertEqual(c[0].dir, c[1].dir, 'flanking the same doorway');
  });

  TestRunner.test('lavaAxis only runs rivers between solid walls', () => {
    var boss = cell(4, 1, 'boss', walls(true, true, true, false));
    TestRunner.assertEqual(FpLayout.lavaAxis(boss), 'NS', 'boss river avoids the open west side');
    var entrance = cell(3, 0, 'entrance', walls(true, true, true, true));
    TestRunner.assertEqual(FpLayout.lavaAxis(entrance), null, 'no lava at the entrance');
    var cross = cell(4, 1, 'boss', walls(false, false, false, false));
    TestRunner.assertEqual(FpLayout.lavaAxis(cross), null, 'no axis without solid ends');
  });

  function allCells(fn) {
    for (var x = 0; x < 7; x++) {
      for (var y = 0; y < 6; y++) {
        var ws = walls((x + y) % 2 === 0, x % 3 !== 0, true, y % 2 === 1);
        fn(cell(x, y, 'corridor', ws));
      }
    }
  }

  TestRunner.test('floorFeatures is deterministic, bounded, varied and stays off the lava river', () => {
    var kinds = {};
    allCells(function(c) {
      var f1 = FpLayout.floorFeatures(c, D), f2 = FpLayout.floorFeatures(c, D);
      TestRunner.assertEqual(JSON.stringify(f1), JSON.stringify(f2), 'deterministic');
      TestRunner.assert(f1.length <= 4, 'at most four items');
      var lava = FpLayout.lavaAxis(c);
      f1.forEach(function(f) {
        kinds[f.kind] = true;
        TestRunner.assert(Math.abs(f.x) < D.CH - 0.5 && Math.abs(f.z) < D.CH - 0.5, 'inside the chamber');
        if (lava === 'EW') TestRunner.assert(Math.abs(f.z) >= 1.75, 'clear of an east-west river');
        if (lava === 'NS') TestRunner.assert(Math.abs(f.x) >= 1.75, 'clear of a north-south river');
        if (f.kind === 'statue' || f.kind === 'column') TestRunner.assertEqual(f.slot, 'wall', f.kind + ' stands by a wall');
        if (f.slot === 'wall') TestRunner.assert(c.walls[f.dir], 'wall items only in front of solid walls');
      });
      var unique = f1.filter(function(f) { return f.kind !== 'rubble'; }).map(function(f) { return f.kind; });
      TestRunner.assertEqual(unique.length, unique.filter(function(k, i) { return unique.indexOf(k) === i; }).length, 'no repeated special items');
    });
    ['rubble', 'skeleton', 'armour', 'statue'].forEach(function(k) { TestRunner.assert(kinds[k], 'some ' + k + ' in the dungeon'); });
    TestRunner.assertEqual(FpLayout.floorFeatures(cell(1, 1, 'boss', walls(true, true, true, false)), D).length, 0, 'boss chamber bare');
  });

  TestRunner.test('doorwayStyle and hasDoor are deterministic; doors are symmetric and never on portals', () => {
    var styles = {}, doors = 0, edges = 0;
    allCells(function(c) {
      FpLayout.DIRS.forEach(function(d) { styles[FpLayout.doorwayStyle(c, d)] = true; });
      var n = cell(c.x + 1, c.y, 'corridor', walls(true, true, true, true));
      edges++;
      if (FpLayout.hasDoor(c, n)) doors++;
      TestRunner.assertEqual(FpLayout.hasDoor(c, n), FpLayout.hasDoor(n, c), 'symmetric');
    });
    ['plain', 'voussoir', 'timber', 'pillars'].forEach(function(k) { TestRunner.assert(styles[k], 'style ' + k + ' used'); });
    TestRunner.assert(doors > 0 && doors < edges / 2, 'some doors but not most (' + doors + '/' + edges + ')');
    var host = cell(0, 0, 'corridor', walls(true, false, true, true));
    var boss = { id: 'boss_room', x: 1, y: 0, type: 'boss', walls: walls(true, true, true, false) };
    host.portal = { dir: 'E', to: 'boss_room' };
    TestRunner.assertEqual(FpLayout.hasDoor(host, boss), false, 'no door on the portal edge');
  });

  TestRunner.test('wallFeatures: inscriptions and cracks on solid walls, dry lava chambers, puddle under each crack', () => {
    var ins = 0, cracks = 0;
    allCells(function(c) {
      var w = FpLayout.wallFeatures(c, D);
      w.inscriptions.forEach(function(i) {
        ins++;
        TestRunner.assert(c.walls[i.dir], 'inscription on a solid wall');
        TestRunner.assert(i.y > 1 && i.y < D.WALL_TOP, 'inscription at wall height');
      });
      if (w.crack) {
        cracks++;
        TestRunner.assert(c.walls[w.crack.dir], 'crack on a solid wall');
        TestRunner.assert(Math.abs(w.crack.s) < D.CH - D.R, 'crack on the flat part');
        TestRunner.assert(w.puddles.length >= 1, 'water pools under the crack');
        var torches = FpLayout.torchSpots(c, D);
        TestRunner.assert(torches[0].dir !== w.crack.dir || torches[0].s !== 0, 'crack not behind the torches');
      }
      if (FpLayout.lavaAxis(c)) {
        TestRunner.assertEqual(w.crack, null, 'no water in lava chambers');
        TestRunner.assertEqual(w.puddles.length, 0, 'no puddles in lava chambers');
      }
    });
    TestRunner.assert(ins > 0 && cracks > 0, 'dungeon has inscriptions (' + ins + ') and cracks (' + cracks + ')');
  });

  TestRunner.test('blobOutline wobbles within bounds', () => {
    var pts = FpLayout.blobOutline(1, 24, 0.37);
    TestRunner.assertEqual(pts.length, 24, 'segment count');
    var radii = pts.map(function(p) { return Math.sqrt(p[0] * p[0] + p[1] * p[1]); });
    TestRunner.assert(Math.max.apply(null, radii) <= 1.25 && Math.min.apply(null, radii) >= 0.3, 'radius bounded');
    TestRunner.assert(Math.max.apply(null, radii) - Math.min.apply(null, radii) > 0.1, 'not a circle');
  });

  TestRunner.test('riverBanks meander with irregular, ordered banks', () => {
    var rows = FpLayout.riverBanks(4, 0.8, 16, 0.42);
    TestRunner.assertEqual(rows.length, 17, 'rows');
    TestRunner.assert(rows[0].t === -4 && rows[16].t === 4, 'spans the length');
    var widths = rows.map(function(r) { return r.right - r.left; });
    rows.forEach(function(r) {
      TestRunner.assert(r.left < r.right, 'left bank left of right bank');
      TestRunner.assert(r.right - r.left >= 0.8 * 1.4 && r.right - r.left <= 0.8 * 2.6, 'width bounded');
      TestRunner.assert(r.crust > 0 && r.glow > 0, 'crust and glow widths');
    });
    TestRunner.assert(Math.max.apply(null, widths) - Math.min.apply(null, widths) > 0.05, 'width varies');
  });

  TestRunner.test('stableSlots keeps lights that stay chosen in their slots', () => {
    TestRunner.assertEqual(FpLayout.stableSlots([3, 4, 7, 8], [4, 5, 7, 9], 2).join(','), '5,4,7,9', 'kept 4 and 7, filled the freed slots');
    TestRunner.assertEqual(FpLayout.stableSlots([-1, -1, -1], [2, 1], 1).join(','), '2,1,-1', 'fills empty slots in order');
    TestRunner.assertEqual(FpLayout.stableSlots([1, 2], [2, 1], 1).join(','), '2,1', 'shadow slot follows the new shadow caster');
    TestRunner.assertEqual(FpLayout.stableSlots([5, 6], [], 1).join(','), '-1,-1', 'clears when nothing is chosen');
  });

  TestRunner.test('approach and ambienceGain', () => {
    TestRunner.assertEqual(FpLayout.approach(0, 1, 2, 0.25), 0.5, 'steps toward the target');
    TestRunner.assertEqual(FpLayout.approach(0.9, 1, 2, 0.25), 1, 'snaps when close');
    TestRunner.assertEqual(FpLayout.approach(1, 0, 4, 0.1), 0.6, 'steps down');
    TestRunner.assertEqual(FpLayout.ambienceGain(1, D), 1, 'full in the chamber');
    TestRunner.assertEqual(FpLayout.ambienceGain(D.CELL * 2, D), 0, 'silent two chambers away');
    var mid = FpLayout.ambienceGain(D.CELL, D);
    TestRunner.assert(mid > 0 && mid < 0.5, 'quiet next door');
    TestRunner.assertEqual(FpLayout.ambienceLevel(0, 0, [], D), 0, 'silence without sources');
    TestRunner.assertEqual(FpLayout.ambienceLevel(0, 0, [{ x: 30, z: 0 }, { x: 1, z: 1 }], D), 1, 'loudest source wins');
  });

  TestRunner.test('assignLights gives shadow slots to the focus chamber and fills the rest by distance', () => {
    var torches = [
      { cellId: 'a', x: 0, z: -3 }, { cellId: 'a', x: 0, z: 3 },
      { cellId: 'b', x: 10, z: -3 }, { cellId: 'b', x: 10, z: 3 },
      { cellId: 'c', x: 20, z: 0 }, { cellId: 'dark', x: 1, z: 0 }
    ];
    var lit = function(id) { return id !== 'dark'; };
    var slots = FpLayout.assignLights(torches, { focusId: 'b', px: 10, pz: 0, count: 4, shadowCount: 2, isLit: lit });
    TestRunner.assertEqual(slots.length, 4, 'fills the pool');
    TestRunner.assertEqual(slots.slice(0, 2).sort().join(','), '2,3', 'focus chamber torches take the shadow slots');
    TestRunner.assert(slots.indexOf(5) === -1, 'unlit chamber torches are skipped');
    TestRunner.assertEqual(slots[2], 4, 'then the nearest remaining torch');
    TestRunner.assert(slots[3] === 0 || slots[3] === 1, 'and the next nearest');

    var few = FpLayout.assignLights(torches, { focusId: 'b', px: 10, pz: 0, count: 10, shadowCount: 0, isLit: lit });
    TestRunner.assertEqual(few.length, 5, 'never more than the lit torches');
    TestRunner.assertEqual(FpLayout.assignLights(torches, { focusId: 'b', px: 0, pz: 0, count: 0 }).length, 0, 'empty pool');
  });

  TestRunner.test('flicker stays in a gentle range', () => {
    var lo = 10, hi = 0;
    for (var t = 0; t < 20; t += 0.013) {
      var f = FpLayout.flicker(t, 0.37);
      lo = Math.min(lo, f); hi = Math.max(hi, f);
    }
    TestRunner.assert(lo > 0.7 && hi < 1.2, 'between 0.7 and 1.2 (' + lo.toFixed(2) + '..' + hi.toFixed(2) + ')');
    TestRunner.assert(hi - lo > 0.1, 'visibly flickers');
  });

  TestRunner.test('noise is deterministic and bounded', () => {
    var a = FpLayout.wallNoise(1.3, 2.7, -4.1), b = FpLayout.wallNoise(1.3, 2.7, -4.1);
    TestRunner.assertEqual(a, b, 'same input same output');
    for (var i = 0; i < 200; i++) {
      var v = FpLayout.noise3(i * 0.37, i * 0.11, -i * 0.23);
      if (v < 0 || v > 1) throw new Error('noise out of range: ' + v);
    }
  });
});

TestRunner.suite('FpQuality', () => {
  TestRunner.test('pick honours an explicit override, then a stored tier', () => {
    TestRunner.assertEqual(FpQuality.pick({ override: 'low', stored: 'high', width: 1920, height: 1080 }), 'low', 'override wins');
    TestRunner.assertEqual(FpQuality.pick({ override: 'ultra', stored: 'high', width: 390, height: 844, touch: true }), 'high', 'invalid override ignored, stored used');
  });

  TestRunner.test('pick chooses by device class', () => {
    TestRunner.assertEqual(FpQuality.pick({ width: 1920, height: 1080, cores: 8, touch: false }), 'high', 'desktop');
    TestRunner.assertEqual(FpQuality.pick({ width: 1920, height: 1080, cores: 2, touch: false }), 'medium', 'weak desktop');
    TestRunner.assertEqual(FpQuality.pick({ width: 390, height: 844, cores: 8, memory: 6, touch: true }), 'medium', 'modern phone');
    TestRunner.assertEqual(FpQuality.pick({ width: 360, height: 740, cores: 4, memory: 2, touch: true }), 'low', 'budget phone');
    TestRunner.assertEqual(FpQuality.pick({}), 'high', 'unknown environment');
  });

  TestRunner.test('settings bound lights and shadows per tier', () => {
    var low = FpQuality.settings('low'), med = FpQuality.settings('medium'), high = FpQuality.settings('high');
    TestRunner.assertEqual(low.headLight, false, 'no head light on low');
    TestRunner.assert(low.lavaLights + low.lights < med.lavaLights + med.lights, 'fewer lights in the shader loop on low');
    TestRunner.assertEqual(low.shadowLights, 0, 'no shadows on low');
    TestRunner.assert(med.shadowLights > 0 && med.shadowLights <= med.lights, 'medium shadows within the pool');
    TestRunner.assert(high.shadowMapSize >= med.shadowMapSize && med.shadowMapSize <= 512, 'modest shadow maps');
    TestRunner.assert(low.maxDpr <= med.maxDpr && med.maxDpr <= high.maxDpr, 'pixel ratio grows with tier');
    TestRunner.assertEqual(FpQuality.settings('nope').tier, 'medium', 'unknown tier falls back to medium');
    low.lights = 99;
    TestRunner.assertEqual(FpQuality.settings('low').lights, 2, 'settings are copies');
  });

  TestRunner.test('lower steps down and stops at low', () => {
    TestRunner.assertEqual(FpQuality.lower('high'), 'medium', 'high -> medium');
    TestRunner.assertEqual(FpQuality.lower('medium'), 'low', 'medium -> low');
    TestRunner.assertEqual(FpQuality.lower('low'), null, 'bottom');
  });

  TestRunner.test('monitor flags a slow window and ignores hitches', () => {
    var m = FpQuality.createMonitor({ windowMs: 1000, slowMs: 40, ignoreMs: 250 });
    var flagged = false, i;
    for (i = 0; i < 70; i++) flagged = m.sample(16) || flagged;
    TestRunner.assert(!flagged, 'fast frames never flag');
    m.reset();
    for (i = 0; i < 10; i++) flagged = m.sample(1000) || flagged;
    TestRunner.assert(!flagged, 'long hitches are ignored');
    for (i = 0; i < 25 && !flagged; i++) flagged = m.sample(60);
    TestRunner.assert(flagged, 'slow frames flag once the window fills');
  });
});
