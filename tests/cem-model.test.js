/**
 * CemModel tests (cemetery generation, movement, monsters, keys, visibility, save)
 */

TestRunner.suite('CemModel', () => {
  var K = CemModel.KIND;

  function gen(seed, opts) { return CemModel.generate(seed || 7, opts); }
  function kinds(level) { return level.tiles.map(function(t) { return t.kind; }).join(''); }
  function count(level, kind) { return level.tiles.filter(function(t) { return t.kind === kind; }).length; }
  function smallTombs(level) { return level.tombs.filter(function(t) { return t.size === 'small'; }); }
  function largeTomb(level) { return level.tombs.filter(function(t) { return t.size === 'large'; })[0]; }
  function isBorder(level, t) { return t.gx === 0 || t.gy === 0 || t.gx === level.W - 1 || t.gy === level.H - 1; }
  function cheb(a, b) { return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy)); }
  function manh(a, b) { return Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy); }

  TestRunner.test('makeRng is deterministic, in [0,1) and round-trips its state', () => {
    var a = CemModel.makeRng(42), b = CemModel.makeRng(42);
    for (var i = 0; i < 50; i++) {
      var x = a();
      TestRunner.assert(x >= 0 && x < 1, 'in range');
      TestRunner.assertEqual(x, b(), 'same sequence');
    }
    var state = a.getState();
    var next = a();
    var c = CemModel.makeRng(1);
    c.setState(state);
    TestRunner.assertEqual(c(), next, 'state restored');
    TestRunner.assert(CemModel.makeRng(1)() !== CemModel.makeRng(2)(), 'seeds differ');
    TestRunner.assertEqual(CemModel.seedFromString('Mr Owl'), CemModel.seedFromString('Mr Owl'), 'string seed stable');
  });

  TestRunner.test('same seed gives the same level, different seeds differ', () => {
    var a = gen(11), b = gen(11), c = gen(12);
    TestRunner.assertEqual(kinds(a), kinds(b), 'tiles identical');
    TestRunner.assertEqual(JSON.stringify(CemModel.exportState(a)), JSON.stringify(CemModel.exportState(b)), 'state identical');
    TestRunner.assert(kinds(a) !== kinds(c), 'other seed differs');
  });

  TestRunner.test('validate passes for many seeds without degrading', () => {
    for (var s = 1; s <= 40; s++) {
      var L = gen(s);
      var v = CemModel.validate(L);
      TestRunner.assert(v.ok, 'seed ' + s + ' valid: ' + v.reason);
      TestRunner.assert(!L.degraded, 'seed ' + s + ' not degraded');
      TestRunner.assert(L.attempt < CemModel.CONFIG.MAX_ATTEMPTS, 'seed ' + s + ' attempts');
    }
  });

  TestRunner.test('fence ring with exactly one gate on the south side', () => {
    var L = gen(3);
    var gates = 0;
    L.tiles.forEach(function(t) {
      if (isBorder(L, t)) {
        if (t.kind === K.gate) { gates++; TestRunner.assertEqual(t.gy, L.H - 1, 'gate on the south row'); }
        else TestRunner.assertEqual(t.kind, K.fence, 'border is fence at ' + t.gx + ',' + t.gy);
      } else {
        TestRunner.assert(t.kind !== K.fence && t.kind !== K.gate, 'no fence inside');
      }
    });
    TestRunner.assertEqual(gates, 1, 'one gate');
    TestRunner.assertEqual(L.start.gy, L.H - 2, 'start just inside the gate');
    TestRunner.assert(CemModel.isWalkable(L, L.start.gx, L.start.gy), 'start walkable');
  });

  TestRunner.test('every walkable tile is reachable from the gate (large door excepted)', () => {
    [4, 5, 6].forEach(function(seed) {
      var L = gen(seed);
      L.tiles.forEach(function(t) {
        if (t.kind === K.tomb_door && t.tombId === 'large') return;
        TestRunner.assertEqual(t.walk, t.dist >= 0, 'walkable iff reachable ' + t.gx + ',' + t.gy + ' seed ' + seed);
      });
      var lonely = L.tiles.filter(function(t) {
        if (t.kind !== K.path) return false;
        var n = 0;
        CemModel.DIRS.forEach(function(d) { var nt = CemModel.tileAt(L, t.gx + d.dx, t.gy + d.dy); if (nt && nt.walk) n++; });
        return n === 0;
      });
      TestRunner.assertEqual(lonely.length, 0, 'no isolated path tile');
    });
  });

  TestRunner.test('four small tombs and one large tomb with doors on porches', () => {
    var L = gen(8);
    TestRunner.assertEqual(smallTombs(L).length, 4, 'four small tombs');
    var big = largeTomb(L);
    TestRunner.assertTruthy(big, 'large tomb');
    TestRunner.assert(big.w === 3 && big.h === 3, 'large is 3x3');
    L.tombs.forEach(function(tomb) {
      var cells = 0;
      L.tiles.forEach(function(t) { if (t.tombId === tomb.id && t.kind !== K.tomb_door) cells++; });
      TestRunner.assertEqual(cells, tomb.w * tomb.h, tomb.id + ' footprint intact');
      var door = CemModel.tileAt(L, tomb.door.gx, tomb.door.gy);
      TestRunner.assertEqual(door.kind, K.tomb_door, tomb.id + ' door');
      TestRunner.assert(door.gy === tomb.y0 + tomb.h, 'door directly below the footprint');
      var porch = CemModel.tileAt(L, tomb.porch.gx, tomb.porch.gy);
      TestRunner.assertEqual(porch.kind, K.path, tomb.id + ' porch is a path');
      TestRunner.assertEqual(manh(tomb.door, tomb.porch), 1, 'porch adjacent to the door');
    });
    var quadrants = {};
    smallTombs(L).forEach(function(t) {
      var q = (t.x0 < L.W / 2 ? 'W' : 'E') + (t.y0 < L.H / 2 ? 'N' : 'S');
      quadrants[q] = true;
    });
    TestRunner.assertEqual(Object.keys(quadrants).length, 4, 'one small tomb per quadrant');
  });

  TestRunner.test('the large tomb is deep in the grounds and small tombs are spread', () => {
    [9, 10, 21].forEach(function(seed) {
      var L = gen(seed);
      var big = largeTomb(L);
      var bigDist = CemModel.tileAt(L, big.porch.gx, big.porch.gy).dist;
      TestRunner.assert(bigDist >= 0.55 * L.maxDist, 'large porch far from the gate (' + bigDist + '/' + L.maxDist + ')');
      var smalls = smallTombs(L);
      for (var a = 0; a < smalls.length; a++) {
        for (var b = a + 1; b < smalls.length; b++) {
          TestRunner.assert(cheb(smalls[a].porch, smalls[b].porch) >= 10, 'small tombs apart');
        }
      }
    });
  });

  TestRunner.test('decor counts are sensible and never sit on walkable tiles', () => {
    var L = gen(13);
    var graves = count(L, K.grave), trees = count(L, K.tree), lanterns = count(L, K.lantern);
    TestRunner.assert(graves >= 80 && graves <= CemModel.CONFIG.MAX_GRAVES, 'graves ' + graves);
    TestRunner.assert(trees >= 45, 'trees ' + trees);
    TestRunner.assert(lanterns >= 20 && lanterns <= CemModel.CONFIG.MAX_LANTERNS, 'lanterns ' + lanterns);
    TestRunner.assertEqual(L.lights.length, lanterns, 'one light per lantern');
    TestRunner.assert(count(L, K.pumpkin) >= 8, 'pumpkins');
    TestRunner.assert(count(L, K.web) >= 6, 'webs');
    TestRunner.assert(count(L, K.statue) >= 4, 'statues');
    TestRunner.assert(count(L, K.bench) >= 5, 'benches');
    L.tiles.forEach(function(t) {
      if (t.kind !== K.path && t.kind !== K.gate && t.kind !== K.tomb_door) TestRunner.assert(!t.walk, 'decor is not walkable');
    });
    TestRunner.assert(count(L, K.path) > 500, 'enough path');
  });

  TestRunner.test('pathTo walks over enterable tiles only', () => {
    var L = gen(14);
    var porch = smallTombs(L)[0].porch;
    var p = CemModel.pathTo(L, L.start, porch);
    TestRunner.assert(p.length > 1, 'path found');
    TestRunner.assert(p[0].gx === L.start.gx && p[0].gy === L.start.gy, 'starts at from');
    TestRunner.assert(p[p.length - 1].gx === porch.gx && p[p.length - 1].gy === porch.gy, 'ends at to');
    var diagonals = 0;
    for (var i = 1; i < p.length; i++) {
      var step = Math.max(Math.abs(p[i].gx - p[i - 1].gx), Math.abs(p[i].gy - p[i - 1].gy));
      TestRunner.assertEqual(step, 1, '8-connected');
      if (manh(p[i - 1], p[i]) === 2) {
        diagonals++;
        // a diagonal may not cut the corner of anything he cannot walk on
        TestRunner.assert(CemModel.canEnter(L, p[i].gx, p[i - 1].gy) &&
          CemModel.canEnter(L, p[i - 1].gx, p[i].gy), 'diagonal keeps both corners open');
      }
      TestRunner.assert(CemModel.isWalkable(L, p[i].gx, p[i].gy), 'walkable tile');
    }
    TestRunner.assert(diagonals > 0, 'he cuts corners diagonally instead of walking stair steps');
    var grass = L.tiles.filter(function(t) { return t.kind === K.grass; })[0];
    TestRunner.assertEqual(CemModel.pathTo(L, L.start, grass).length, 0, 'no path onto grass');
  });

  TestRunner.test('the great tomb opens only with all four key parts', () => {
    var L = gen(15);
    var big = largeTomb(L);
    TestRunner.assert(!CemModel.canEnter(L, big.door.gx, big.door.gy), 'locked at start');
    TestRunner.assertEqual(CemModel.pathTo(L, L.start, big.door).length, 0, 'no path through the locked door');
    CemModel.setOwlTile(L, big.porch.gx, big.porch.gy);
    var locked = CemModel.moveOwl(L, big.door.gx, big.door.gy);
    TestRunner.assert(!locked.ok && locked.reason === 'locked', 'move refused');
    TestRunner.assertEqual(locked.events[0].type, 'tomb_locked', 'locked event');
    TestRunner.assertEqual(locked.events[0].missing, 4, 'four parts missing');
    ['g1', 'g2', 'g3'].forEach(function(uid) { CemModel.defeatMonster(L, uid); });
    TestRunner.assertEqual(CemModel.keyPartCount(L), 3, 'three parts');
    TestRunner.assert(!CemModel.hasAllKeyParts(L), 'still locked');
    var r4 = CemModel.defeatMonster(L, 'g4');
    TestRunner.assert(r4.allKeys && r4.keyPart === 4, 'last guardian completes the key');
    TestRunner.assert(CemModel.canEnter(L, big.door.gx, big.door.gy), 'unlocked');
    TestRunner.assert(CemModel.pathTo(L, L.start, big.door).length > 0, 'path to the door now');
    L.graceMs = 0;
    var entered = CemModel.moveOwl(L, big.door.gx, big.door.gy);
    TestRunner.assert(entered.ok, 'entered');
    TestRunner.assertEqual(entered.events[0].type, 'enter_large_tomb', 'enter event');
  });

  TestRunner.test('encounter monsters carry their key part in the loot', () => {
    var L = gen(16);
    var g2 = CemModel.encounterMonsterFor(L, 'g2');
    var parts = g2.loot.filter(function(i) { return i.id === CemModel.KEY_PART_ITEM.id; });
    TestRunner.assertEqual(parts.length, 1, 'one key part');
    TestRunner.assertEqual(parts[0].part, 2, 'part number');
    TestRunner.assertEqual(g2.difficulty, 3, 'guardian difficulty');
    var w = CemModel.encounterMonsterFor(L, 'w1');
    TestRunner.assertEqual(w.loot.filter(function(i) { return i.id === CemModel.KEY_PART_ITEM.id; }).length, 0, 'wanderer has no key part');
    var boss = CemModel.encounterMonsterFor(L, 'boss');
    TestRunner.assertEqual(boss.id, CemModel.BOSS_ID, 'boss id');
    TestRunner.assertEqual(boss.difficulty, 4, 'boss difficulty');
    TestRunner.assertEqual(CemModel.encounterMonsterFor(L, 'nobody'), null, 'unknown uid');
  });

  TestRunner.test('monsters are placed on paths, guardians on doors, difficulty rises with distance', () => {
    var matching = 0, total = 0;
    [17, 18, 19, 20, 22].forEach(function(seed) {
      var L = gen(seed);
      var seen = {};
      L.monsters.forEach(function(m) {
        var key = m.gx + ',' + m.gy;
        TestRunner.assert(!seen[key], 'no shared tile');
        seen[key] = true;
        var t = CemModel.tileAt(L, m.gx, m.gy);
        if (m.role === 'wander') {
          TestRunner.assertEqual(t.kind, K.path, 'wanderer on a path');
          TestRunner.assert(manh(m, L.start) > CemModel.CONFIG.GATE_SAFE_RADIUS, 'outside the safe zone');
          TestRunner.assertEqual(m.difficulty, CemModel.difficultyAt(L, m.gx, m.gy), 'band matches distance');
          var home = [];
          for (var b = 1; b <= m.difficulty; b++) home = home.concat(CemModel.WANDERER_BANDS[b]);
          TestRunner.assert(home.indexOf(m.id) !== -1, 'roaming id ' + m.id + ' belongs to its ring or a nearer one');
          total++;
          if (m.encounterType === 'matching') matching++;
        } else if (m.role === 'guard') {
          TestRunner.assertEqual(t.kind, K.tomb_door, 'guardian on a door');
          TestRunner.assertEqual(m.difficulty, 3, 'guardian is difficulty 3');
          TestRunner.assert(m.keyPart >= 1 && m.keyPart <= 4, 'guardian holds a key part');
        } else {
          TestRunner.assertEqual(t.tombId, 'large', 'boss inside the great tomb');
        }
      });
      TestRunner.assertEqual(L.monsters.filter(function(m) { return m.role === 'guard'; }).length, 4, 'four guardians');
      var guards = L.monsters.filter(function(m) { return m.role === 'guard'; });
      var parts = guards.map(function(m) { return m.keyPart; }).sort().join('');
      TestRunner.assertEqual(parts, '1234', 'key parts 1..4');
      TestRunner.assertEqual(guards.map(function(m) { return m.id; }).join(','), CemModel.GUARDIANS.join(','), 'one named guardian per tomb');
    });
    var share = matching / total;
    TestRunner.assert(share >= 0.1 && share <= 0.5, 'matching share ' + share.toFixed(2));
  });

  TestRunner.test('advance keeps wanderers on paths within their leash and is deterministic', () => {
    var A = gen(23), B = gen(23);
    var moves = 0;
    for (var tick = 0; tick < 200; tick++) {
      var ev = CemModel.advance(A, 300);
      CemModel.advance(B, 300);
      ev.forEach(function(e) { if (e.type === 'moved') moves++; });
      var occ = {};
      A.monsters.forEach(function(m) {
        if (m.role !== 'wander') {
          TestRunner.assert(m.gx === m.home.gx && m.gy === m.home.gy, 'static monsters stay');
          return;
        }
        var t = CemModel.tileAt(A, m.gx, m.gy);
        TestRunner.assert(t.walk && t.kind !== K.tomb_door && t.kind !== K.gate, 'wanderer on a lane');
        TestRunner.assert(cheb(m, m.home) <= CemModel.CONFIG.LEASH, 'within leash');
        TestRunner.assert(manh(m, A.start) > CemModel.CONFIG.GATE_SAFE_RADIUS, 'never in the safe zone');
        var key = m.gx + ',' + m.gy;
        TestRunner.assert(!occ[key], 'no two on one tile');
        occ[key] = true;
      });
    }
    TestRunner.assert(moves > 50, 'wanderers move (' + moves + ')');
    TestRunner.assertEqual(JSON.stringify(CemModel.exportState(A).monsters), JSON.stringify(CemModel.exportState(B).monsters), 'deterministic');
    var before = JSON.stringify(CemModel.exportState(A).monsters);
    A.paused = true;
    CemModel.advance(A, 5000);
    TestRunner.assertEqual(JSON.stringify(CemModel.exportState(A).monsters), before, 'paused: nothing moves');
  });

  TestRunner.test('proximity starts an encounter, grace and the safe zone suppress it', () => {
    var L = gen(24);
    var w = L.monsters.filter(function(m) { return m.role === 'wander'; })[0];
    CemModel.setOwlTile(L, w.gx, w.gy - 1);
    if (!CemModel.tileAt(L, L.owl.gx, L.owl.gy).walk) CemModel.setOwlTile(L, w.gx + 1, w.gy);
    L.graceMs = 0;
    var ev = CemModel.checkProximity(L);
    TestRunner.assertEqual(ev.length, 1, 'encounter fires');
    TestRunner.assertEqual(ev[0].uid, w.uid, 'with that monster');
    TestRunner.assertEqual(L.encounterUid, w.uid, 'encounter recorded');
    TestRunner.assertEqual(CemModel.advance(L, 1000).length, 0, 'no movement during an encounter');
    CemModel.respawnAtGate(L);
    TestRunner.assert(L.owl.gx === L.start.gx && L.owl.gy === L.start.gy, 'back at the gate');
    TestRunner.assertEqual(L.encounterUid, null, 'encounter cleared');
    TestRunner.assert(L.graceMs > 0, 'grace running');
    CemModel.setOwlTile(L, w.gx, w.gy);
    TestRunner.assertEqual(CemModel.checkProximity(L).length, 0, 'grace suppresses proximity');
    CemModel.advance(L, CemModel.CONFIG.GRACE_MS + 1);
    TestRunner.assertEqual(L.graceMs, 0, 'grace ran out');
    // the monsters wandered during those seconds and one of them may have
    // walked into Mr Owl the moment grace ran out; clear that and put the
    // monster under test back within reach
    L.encounterUid = null;
    w.gx = L.owl.gx; w.gy = L.owl.gy;
    TestRunner.assertEqual(CemModel.checkProximity(L).length, 1, 'fires again after grace');
    TestRunner.assertEqual(L.encounterUid, w.uid, 'with that monster');
    L.encounterUid = null;
    CemModel.setOwlTile(L, L.start.gx, L.start.gy);
    var sneaky = L.monsters.filter(function(m) { return m.role === 'wander'; })[1];
    sneaky.gx = L.start.gx; sneaky.gy = L.start.gy - 1;
    TestRunner.assertEqual(CemModel.checkProximity(L).length, 0, 'safe zone suppresses proximity');
  });

  TestRunner.test('stepDir and moveOwl refuse grass, fences and far tiles', () => {
    var L = gen(25);
    L.graceMs = 0;
    var south = CemModel.stepDir(L, 's');
    TestRunner.assert(south.ok && south.events[0] && south.events[0].type === 'gate', 'stepping onto the gate');
    CemModel.stepDir(L, 'n');
    var far = CemModel.moveOwl(L, L.owl.gx + 3, L.owl.gy);
    TestRunner.assertEqual(far.reason, 'far', 'non-adjacent refused');
    var blockedDir = null;
    CemModel.DIRS.forEach(function(d) {
      var t = CemModel.tileAt(L, L.owl.gx + d.dx, L.owl.gy + d.dy);
      if (t && !t.walk && !blockedDir) blockedDir = d.id;
    });
    if (blockedDir) TestRunner.assertEqual(CemModel.stepDir(L, blockedDir).reason, 'blocked', 'grass refused');
    var walkDir = null;
    CemModel.DIRS.forEach(function(d) {
      var t = CemModel.tileAt(L, L.owl.gx + d.dx, L.owl.gy + d.dy);
      if (t && t.kind === K.path && !walkDir) walkDir = d;
    });
    var before = { gx: L.owl.gx, gy: L.owl.gy };
    var r = CemModel.stepDir(L, walkDir.id);
    TestRunner.assert(r.ok, 'walk onto a path');
    TestRunner.assert(L.owl.gx === before.gx + walkDir.dx && L.owl.gy === before.gy + walkDir.dy, 'owl moved');
  });

  TestRunner.test('night visibility around the owl and lanterns, remembered afterwards', () => {
    var L = gen(26);
    var R = CemModel.CONFIG.VIS_OWL;
    for (var dy = -R; dy <= R; dy++) {
      for (var dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy > R * R) continue;
        var gx = L.owl.gx + dx, gy = L.owl.gy + dy;
        if (CemModel.tileAt(L, gx, gy)) TestRunner.assertEqual(CemModel.visibilityAt(L, gx, gy), 2, 'lit around the owl');
      }
    }
    var farLight = null;
    L.lights.forEach(function(l) { if (cheb(l, L.owl) > R + 4 && !farLight) farLight = l; });
    TestRunner.assertTruthy(farLight, 'a far lantern');
    TestRunner.assertEqual(CemModel.visibilityAt(L, farLight.gx, farLight.gy), 2, 'lantern lights its tile');
    var dark = L.tiles.filter(function(t) {
      if (t.kind !== K.grass || cheb(t, L.owl) <= R + 1) return false;
      return L.lights.every(function(l) { return Math.sqrt((l.gx - t.gx) * (l.gx - t.gx) + (l.gy - t.gy) * (l.gy - t.gy)) > CemModel.CONFIG.VIS_LANTERN + 0.01; });
    })[0];
    TestRunner.assertEqual(CemModel.visibilityAt(L, dark.gx, dark.gy), 0, 'far grass hidden');
    TestRunner.assert(CemModel.visibilityAt(L, 0, 0) >= 1, 'fence ring pre-seen');
    var oldOwl = { gx: L.owl.gx, gy: L.owl.gy };
    var porch = largeTomb(L).porch;
    CemModel.setOwlTile(L, porch.gx, porch.gy);
    var wasLit = CemModel.tileAt(L, oldOwl.gx, oldOwl.gy - R);
    if (wasLit && cheb(wasLit, L.owl) > R) {
      var v = CemModel.visibilityAt(L, wasLit.gx, wasLit.gy);
      TestRunner.assert(v >= 1, 'old tiles remembered');
    }
    var vis = CemModel.monstersVisible(L);
    vis.forEach(function(m) { TestRunner.assertEqual(CemModel.visibilityAt(L, m.gx, m.gy), 2, 'visible monsters on lit tiles'); });
  });

  TestRunner.test('save state round-trips through exportState/loadState', () => {
    var L = gen(27);
    L.graceMs = 0;
    for (var i = 0; i < 50; i++) CemModel.advance(L, 300);
    CemModel.defeatMonster(L, 'g1');
    CemModel.defeatMonster(L, 'w2');
    var porch = smallTombs(L)[1].porch;
    CemModel.setOwlTile(L, porch.gx, porch.gy);
    L.encounterUid = null;
    var state = CemModel.exportState(L);
    state.monsters.push({ uid: 'ghost_of_old_version', gx: 1, gy: 1 });
    state.defeated.push('nobody');
    var M = CemModel.loadState(JSON.parse(JSON.stringify(state)));
    TestRunner.assertTruthy(M, 'restored');
    TestRunner.assertEqual(kinds(M), kinds(L), 'same tiles');
    TestRunner.assertEqual(M.owl.gx + ',' + M.owl.gy, L.owl.gx + ',' + L.owl.gy, 'owl tile');
    TestRunner.assertEqual(M.owl.x + ',' + M.owl.y, L.owl.x + ',' + L.owl.y, 'owl position');
    TestRunner.assertEqual(JSON.stringify(M.keyParts), JSON.stringify(L.keyParts), 'key parts');
    TestRunner.assert(M.monstersByUid.g1.defeated && M.monstersByUid.w2.defeated, 'defeated restored');
    TestRunner.assertEqual(M.seen.join(''), L.seen.join(''), 'seen tiles');
    var a = CemModel.exportState(L), b = CemModel.exportState(M);
    a.monsters = a.monsters.filter(function(m) { return m.uid !== 'ghost_of_old_version'; });
    TestRunner.assertEqual(JSON.stringify(a), JSON.stringify(b), 'states equal after load');
    for (var j = 0; j < 20; j++) { CemModel.advance(L, 300); CemModel.advance(M, 300); }
    TestRunner.assertEqual(JSON.stringify(CemModel.exportState(L).monsters), JSON.stringify(CemModel.exportState(M).monsters), 'same future');
  });

  TestRunner.test('drawOrder is depth sorted, lists tombs once and hides unseen tiles', () => {
    var L = gen(28);
    var big = largeTomb(L);
    CemModel.setOwlTile(L, big.porch.gx, big.porch.gy);
    var order = CemModel.drawOrder(L);
    var tombs = 0, owlDepth = null, bigDepth = null;
    for (var i = 1; i < order.length; i++) TestRunner.assert(order[i].depth >= order[i - 1].depth, 'sorted');
    order.forEach(function(o) {
      if (o.kind === 'tomb') { tombs++; if (o.ref.id === 'large') bigDepth = o.depth; }
      if (o.kind === 'owl') owlDepth = o.depth;
      if (o.kind === 'tile') TestRunner.assert(CemModel.visibilityAt(L, o.gx, o.gy) > 0, 'no hidden tiles');
    });
    TestRunner.assert(tombs >= 1 && tombs <= 5, 'each visible tomb once (' + tombs + ')');
    TestRunner.assert(owlDepth > bigDepth, 'owl on the porch draws in front of the great tomb');
    TestRunner.assertEqual(CemModel.dirFromScreen(64, 32), 'e', 'screen down-right is east');
    TestRunner.assertEqual(CemModel.dirFromScreen(-64, -32), 'w', 'screen up-left is west');
    TestRunner.assertEqual(CemModel.dirFromScreen(64, -32), 'n', 'screen up-right is north');
    TestRunner.assertEqual(CemModel.dirFromScreen(-64, 32), 's', 'screen down-left is south');
    TestRunner.assertTruthy(CemModel.getBounds(L).width > 0, 'bounds');
  });

  TestRunner.test('generates with an injected tiny roster', () => {
    var roster = [
      { id: 'a', name: 'A', namePL: 'A', difficulty: 1, loot: [] },
      { id: 'b', name: 'B', namePL: 'B', difficulty: 2, loot: [] },
      { id: 'c', name: 'C', namePL: 'C', difficulty: 3, loot: [] },
      { id: 'grim_reaper', name: 'R', namePL: 'R', difficulty: 4, boss: true, loot: [] }
    ];
    var L = gen(29, { monsters: roster });
    TestRunner.assert(CemModel.validate(L).ok, 'valid');
    L.monsters.forEach(function(m) {
      TestRunner.assert(['a', 'b', 'c', 'grim_reaper'].indexOf(m.id) !== -1, 'roster id ' + m.id);
    });
    var g = CemModel.encounterMonsterFor(L, 'g1', { monsters: roster });
    TestRunner.assertEqual(g.id, 'c', 'guardian from the injected roster');
  });
  TestRunner.test('lanes are wide and wind through the grounds', () => {
    [41, 42, 43].forEach(function(seed) {
      var L = gen(seed);
      var path = 0, wide = 0;
      L.tiles.forEach(function(t) {
        if (t.kind !== K.path) return;
        path++;
        for (var dx = -1; dx <= 0 && true; dx++) {
          for (var dy = -1; dy <= 0; dy++) {
            var ok = true;
            for (var a = 0; a < 2; a++) {
              for (var b = 0; b < 2; b++) {
                var q = CemModel.tileAt(L, t.gx + dx + a, t.gy + dy + b);
                if (!q || q.kind !== K.path) ok = false;
              }
            }
            if (ok) { wide++; return; }
          }
        }
      });
      TestRunner.assert(wide / path >= 0.85, 'seed ' + seed + ': ' + Math.round(100 * wide / path) + '% of lanes are at least two wide');
      var turns = 0, steps = 0;
      L.routes.forEach(function(r) {
        for (var i = 2; i < r.length; i++) {
          var d1 = (r[i - 1].gx - r[i - 2].gx) + ',' + (r[i - 1].gy - r[i - 2].gy);
          var d2 = (r[i].gx - r[i - 1].gx) + ',' + (r[i].gy - r[i - 1].gy);
          if (d1 !== d2) turns++;
          steps++;
        }
      });
      TestRunner.assert(turns / L.routes.length >= 2, 'lanes bend (' + (turns / L.routes.length).toFixed(1) + ' turns per lane)');
    });
  });

  TestRunner.test('generation stays fast and rarely retries', () => {
    var t0 = Date.now(), attempts = 0;
    for (var s = 60; s < 80; s++) {
      var L = gen(s);
      attempts += L.attempt;
      TestRunner.assert(L.attempt <= 6, 'seed ' + s + ' attempts ' + L.attempt);
      TestRunner.assert(!L.degraded, 'seed ' + s + ' not degraded');
    }
    var per = (Date.now() - t0) / 20;
    TestRunner.assert(per < 500, 'generation ' + per.toFixed(0) + ' ms per level');
    TestRunner.assert(attempts / 20 <= 2, 'mean attempts ' + (attempts / 20).toFixed(2));
  });

  TestRunner.test('steering slides along the lanes and never leaves them', () => {
    var L = gen(44);
    var rng = CemModel.makeRng(5);
    var r = CemModel.CONFIG.OWL_RADIUS;
    for (var i = 0; i < 3000; i++) {
      if (i % 40 === 0) var steer = { x: rng() * 2 - 1, y: rng() * 2 - 1 };
      CemModel.tickOwl(L, steer, 16);
      if (L.encounterUid) { L.encounterUid = null; L.graceMs = 4000; }
      var o = CemModel.owlPos(L);
      TestRunner.assert(CemModel.fitsCircle(L, o.x, o.y, r), 'frame ' + i + ': owl at ' + o.x.toFixed(2) + ',' + o.y.toFixed(2) + ' is off the lane');
      TestRunner.assert(o.gx === Math.round(o.x) && o.gy === Math.round(o.y), 'tile follows the position');
    }
  });

  TestRunner.test('tickOwl walks a path to a tomb porch and reports arrival', () => {
    var L = gen(45);
    var porch = smallTombs(L)[0].porch;
    var path = CemModel.pathTo(L, CemModel.owlTile(L), porch);
    TestRunner.assert(path.length > 5, 'a path exists');
    CemModel.setPath(L, path);
    var ticks = 0, arrived = false;
    while (ticks < 4000 && !arrived) {
      var r = CemModel.tickOwl(L, { x: 0, y: 0 }, 16.7);
      ticks++;
      if (r.arrived) arrived = true;
      if (L.encounterUid) { L.encounterUid = null; L.graceMs = 4000; }
    }
    TestRunner.assert(arrived, 'arrived at the porch');
    TestRunner.assertEqual(L.owl.gx + ',' + L.owl.gy, porch.gx + ',' + porch.gy, 'standing on the porch');
    var ideal = path.length / CemModel.CONFIG.OWL_SPEED * 60;
    TestRunner.assert(ticks <= ideal * 1.3, 'took ' + ticks + ' frames, ideal ' + Math.round(ideal));
  });

  TestRunner.test('the sealed great tomb stops the walk and reports itself once', () => {
    var L = gen(46);
    var big = largeTomb(L);
    CemModel.setOwlTile(L, big.porch.gx, big.porch.gy);
    L.graceMs = 0;
    L.clockMs = 99999;
    var locked = 0;
    for (var i = 0; i < 60; i++) {
      var r = CemModel.tickOwl(L, { x: 0, y: -1 }, 16.7);
      r.events.forEach(function(e) { if (e.type === 'tomb_locked') locked++; });
    }
    TestRunner.assertEqual(locked, 1, 'one toast per second, not one per frame');
    var o = CemModel.owlPos(L);
    TestRunner.assert(o.y > big.door.gy + 0.5, 'clamped in front of the door');
    TestRunner.assert(CemModel.fitsCircle(L, o.x, o.y, CemModel.CONFIG.OWL_RADIUS), 'still on the lane');
  });

  TestRunner.test('the Reaper rises once, when Mr Owl nears the great tomb with the whole key', () => {
    var L = gen(24);
    var large = L.tombs.filter(function(t) { return t.size === 'large'; })[0];
    L.graceMs = 0;
    CemModel.setOwlTile(L, large.porch.gx, large.porch.gy);
    TestRunner.assertEqual(CemModel.bossRises(L), null, 'nothing without the key');
    ['g1', 'g2', 'g3', 'g4'].forEach(function(uid) { CemModel.defeatMonster(L, uid); });
    CemModel.setOwlTile(L, L.start.gx, L.start.gy);
    TestRunner.assertEqual(CemModel.bossRises(L), null, 'nothing from the gate, it is far away');
    // walk the last few tiles of the route to the porch; the event comes with a tile change
    var route = CemModel.pathTo(L, CemModel.owlTile(L), large.porch);
    TestRunner.assert(route.length > 6, 'there is a route to the great tomb');
    var far = route[route.length - 7];
    CemModel.setOwlTile(L, far.gx, far.gy);
    L.bossRevealed = false;                 // in case that spot was already close enough
    CemModel.setPath(L, route.slice(route.length - 6));
    var rose = 0;
    for (var f = 0; f < 600 && L.owl.path.length; f++) {
      var r = CemModel.tickOwl(L, { x: 0, y: 0 }, 16);
      for (var i = 0; i < r.events.length; i++) if (r.events[i].type === 'boss_rises') rose++;
      if (r.arrived) break;
    }
    TestRunner.assertEqual(rose, 1, 'the Reaper rose exactly once on the way in');
    TestRunner.assert(L.bossRevealed, 'and the level remembers it');
    TestRunner.assertEqual(CemModel.bossRises(L), null, 'he does not rise twice');
  });

  TestRunner.test('proximity is a circle around the owl, not a tile test', () => {
    var L = gen(47);
    L.monsters.forEach(function(m) { if (m.role === 'wander') { m.gx = 1; m.gy = 1; } });
    var w = L.monsters.filter(function(m) { return m.role === 'wander'; })[0];
    var o = CemModel.owlPos(L);
    var lane = L.tiles.filter(function(t) { return t.kind === K.path && t.dist > 8; })[0];
    CemModel.setOwlTile(L, lane.gx, lane.gy);
    L.graceMs = 0;
    w.gx = lane.gx + 2; w.gy = lane.gy;
    TestRunner.assertEqual(CemModel.checkProximity(L).length, 0, 'two tiles away is out of reach');
    w.gx = lane.gx + 1;
    TestRunner.assertEqual(CemModel.checkProximity(L).length, 1, 'one tile away triggers');
  });

  TestRunner.test('light map matches IsoModel and reveals are logged', () => {
    var L = gen(48);
    TestRunner.assertEqual(L.lightMap.length, L.W * L.H, 'one entry per tile');
    for (var i = 0; i < 50; i++) {
      var t = L.tiles[(i * 61) % L.tiles.length];
      var expected = IsoModel.lightLevel(t.gx, t.gy, L.lights);
      TestRunner.assert(Math.abs(L.lightMap[CemModel.index(L, t.gx, t.gy)] - expected) < 1e-6, 'light at ' + t.gx + ',' + t.gy);
      TestRunner.assert(L.nearLights[CemModel.index(L, t.gx, t.gy)].length <= 2, 'at most two near lanterns');
    }
    var before = L.seenVersion;
    L.newlySeen.length = 0;
    var far = L.tiles.filter(function(t) { return t.kind === K.path && !L.seen[CemModel.index(L, t.gx, t.gy)]; })[0];
    CemModel.setOwlTile(L, far.gx, far.gy);
    TestRunner.assert(L.seenVersion > before, 'seenVersion advanced');
    TestRunner.assert(L.newlySeen.length > 0, 'newly seen tiles are logged for the renderer');
  });

  TestRunner.test('visChanged lists exactly the tiles whose visibility changed', () => {
    var L = gen(50);
    L.visChanged.length = 0;
    var before = L.vis.slice();
    var far = L.tiles.filter(function(t) { return t.kind === K.path && !L.seen[CemModel.index(L, t.gx, t.gy)]; })[0];
    CemModel.setOwlTile(L, far.gx, far.gy);
    var expected = [];
    for (var i = 0; i < L.vis.length; i++) if (L.vis[i] !== before[i]) expected.push(i);
    TestRunner.assert(expected.length > 0, 'moving far away changes some tiles');
    TestRunner.assertEqual(L.visChanged.slice().sort(function(a, b) { return a - b; }).join(','), expected.join(','), 'the list is the diff, nothing more');
    L.visChanged.length = 0;
    CemModel.updateVisibility(L);
    TestRunner.assertEqual(L.visChanged.length, 0, 'a repeated update changes nothing');
    var lit = 0;
    for (var j = 0; j < L.vis.length; j++) if (L.vis[j] === 2) lit++;
    TestRunner.assert(lit > 0, 'the owl still lights tiles after the diffing rewrite');
  });

  TestRunner.test('a save from the first cut (tile only) still loads', () => {
    var L = gen(49);
    var state = CemModel.exportState(L);
    delete state.owl.x;
    delete state.owl.y;
    var M = CemModel.loadState(state);
    TestRunner.assertTruthy(M, 'restored');
    TestRunner.assertEqual(M.owl.x, M.owl.gx, 'position falls back to the tile centre');
    TestRunner.assertEqual(M.owl.y, M.owl.gy, 'position falls back to the tile centre');
  });

  TestRunner.test('the will-o-the-wisp roams the cemetery', () => {
    TestRunner.assert(CemModel.WANDERER_BANDS[2].indexOf('will_o_wisp') !== -1, 'in the middle band with the other spectres');
  });

  TestRunner.test('the clown guards a tomb, and no cemetery monster wanders the dungeon', () => {
    TestRunner.assert(CemModel.GUARDIANS.indexOf('clown') !== -1, 'the clown is a tomb guardian');
    TestRunner.assertEqual(CemModel.GUARDIANS.length, 4, 'still one guardian per small tomb');
    const clown = MONSTERS.find(function(m) { return m.id === 'clown'; });
    TestRunner.assertEqual(clown.theme, 'cemetery', 'and belongs to the cemetery, not the dungeon');
  });

  TestRunner.test('the roaming crowd is mixed, no ring left to one kind', () => {
    const counts = {};
    let wanderers = 0;
    [17, 18, 19, 20, 22, 31, 42].forEach(function(seed) {
      const L = gen(seed);
      const perBand = { 1: {}, 2: {}, 3: {} };
      L.monsters.filter(function(m) { return m.role === 'wander'; }).forEach(function(m) {
        counts[m.id] = (counts[m.id] || 0) + 1;
        perBand[m.difficulty][m.id] = true;
        wanderers++;
      });
      [1, 2, 3].forEach(function(band) {
        TestRunner.assert(CemModel.WANDERER_BANDS[band].length >= 3,
          'band ' + band + ' has several kinds to draw from');
      });
    });
    ['will_o_wisp', 'lost_soul', 'spider', 'ghost'].forEach(function(id) {
      TestRunner.assert(counts[id] > 0, id + ' turns up among the wanderers');
    });
    Object.keys(counts).forEach(function(id) {
      TestRunner.assert(counts[id] / wanderers < 0.35, id + ' is not half the cemetery (' + counts[id] + '/' + wanderers + ')');
    });
  });

  TestRunner.test('the outer rings have the odd stray from nearer in, but only the odd one', () => {
    let outer = 0, strays = 0;
    [17, 18, 19, 20, 22, 31, 42, 57, 63, 77].forEach(function(seed) {
      gen(seed).monsters.filter(function(m) { return m.role === 'wander' && m.difficulty > 1; }).forEach(function(m) {
        outer++;
        if (CemModel.WANDERER_BANDS[m.difficulty].indexOf(m.id) === -1) strays++;
      });
    });
    TestRunner.assert(strays > 0, 'some strays turn up (' + strays + '/' + outer + ')');
    TestRunner.assert(strays / outer < 0.35, 'but the rings keep their own character (' + strays + '/' + outer + ')');
  });

  TestRunner.test('strays change only who roams, never where or how', () => {
    [17, 18, 19, 20, 22, 31, 42, 57, 63, 77].forEach(function(seed) {
      const none = gen(seed, { STRAY_SHARE: 0 });
      const some = gen(seed);
      TestRunner.assertEqual(kinds(some), kinds(none), 'same ground for seed ' + seed);
      TestRunner.assertEqual(some.monsters.length, none.monsters.length, 'same number of monsters');
      some.monsters.forEach(function(m, i) {
        const o = none.monsters[i];
        TestRunner.assert(m.uid === o.uid && m.gx === o.gx && m.gy === o.gy && m.stepMs === o.stepMs &&
          m.encounterType === o.encounterType && m.difficulty === o.difficulty,
          'seed ' + seed + ' ' + m.uid + ' stands and moves the same with or without strays');
      });
    });
  });

  TestRunner.test('the far ring can hold a stray from right by the gate', () => {
    let fromGate = 0;
    [17, 18, 19, 20, 22, 31, 42, 57, 63, 77].forEach(function(seed) {
      gen(seed).monsters.forEach(function(m) {
        if (m.role === 'wander' && m.difficulty === 3 && CemModel.WANDERER_BANDS[3].indexOf(m.id) === -1 &&
            CemModel.WANDERER_BANDS[1].indexOf(m.id) !== -1) fromGate++;
      });
    });
    TestRunner.assert(fromGate > 0, 'a gate-ring kind turns up in the far ring (' + fromGate + ')');
  });
});
