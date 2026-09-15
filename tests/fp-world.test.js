/**
 * FpWorld Tests
 * Grid/facing model of the first-person prototype.
 */

TestRunner.suite('FpWorld', () => {
  // 3x2 fixture: a path 0,0 - 1,0 - 2,0 - 2,1 - 1,1 - 0,1 ; boss hangs off 2,1 (border host)
  function room(id, x, y, type, connections) {
    return { id: id, x: x, y: y, type: type, connections: connections };
  }
  function borderFixture() {
    return {
      room_0_0: room('room_0_0', 0, 0, 'entrance', ['room_1_0']),
      room_1_0: room('room_1_0', 1, 0, 'corridor', ['room_0_0', 'room_2_0']),
      room_2_0: room('room_2_0', 2, 0, 'monster', ['room_1_0', 'room_2_1']),
      room_2_1: room('room_2_1', 2, 1, 'corridor', ['room_2_0', 'room_1_1', 'boss_room']),
      room_1_1: room('room_1_1', 1, 1, 'treasure', ['room_2_1', 'room_0_1']),
      room_0_1: room('room_0_1', 0, 1, 'corridor', ['room_1_1']),
      boss_room: { id: 'boss_room', type: 'boss', connections: ['room_2_1'] }
    };
  }
  // 3x3 fixture where the boss host is the centre cell (all solid walls point inside the grid)
  function interiorFixture() {
    return {
      room_0_0: room('room_0_0', 0, 0, 'entrance', ['room_1_0']),
      room_1_0: room('room_1_0', 1, 0, 'corridor', ['room_0_0', 'room_1_1']),
      room_1_1: room('room_1_1', 1, 1, 'corridor', ['room_1_0', 'boss_room']),
      room_2_2: room('room_2_2', 2, 2, 'corridor', []),
      boss_room: { id: 'boss_room', type: 'boss', connections: ['room_1_1'] }
    };
  }

  TestRunner.test('build creates a cell per room including the boss and a grid index', () => {
    var w = FpWorld.build(borderFixture());
    TestRunner.assertEqual(Object.keys(w.cells).length, 7, 'seven cells');
    TestRunner.assertEqual(w.grid['1,0'], 'room_1_0', 'grid lookup');
    TestRunner.assertEqual(w.entranceId, 'room_0_0', 'entrance id');
    TestRunner.assertEqual(w.bossId, 'boss_room', 'boss id');
    TestRunner.assertEqual(w.bounds.maxX, 2, 'maxX'); TestRunner.assertEqual(w.bounds.maxY, 1, 'maxY');
  });

  TestRunner.test('walls and exits are symmetric across connections', () => {
    var w = FpWorld.build(borderFixture());
    TestRunner.assertEqual(w.cells.room_0_0.walls.E, false, '0,0 open east');
    TestRunner.assertEqual(w.cells.room_1_0.walls.W, false, '1,0 open west');
    TestRunner.assertEqual(w.cells.room_0_0.walls.S, true, '0,0 solid south (not connected to 0,1)');
    TestRunner.assertEqual(w.cells.room_0_1.walls.N, true, '0,1 solid north');
    TestRunner.assertEqual(w.cells.room_0_0.exits.E, 'room_1_0', 'exit id east');
    TestRunner.assertEqual(w.cells.room_2_0.exits.S, 'room_2_1', 'exit id south');
    TestRunner.assertEqual(w.cells.room_2_0.exits.N, null, 'no exit north');
  });

  TestRunner.test('boss on a border host sits in the adjacent outside cell (no teleport)', () => {
    var w = FpWorld.build(borderFixture());
    var host = w.cells.room_2_1;
    var boss = w.cells.boss_room;
    TestRunner.assertEqual(host.portal.dir, 'E', 'portal east (outside grid)');
    TestRunner.assertEqual(host.portal.teleport, false, 'walkable portal');
    TestRunner.assertEqual(boss.x, 3, 'boss x'); TestRunner.assertEqual(boss.y, 1, 'boss y');
    TestRunner.assertEqual(host.exits.E, 'boss_room', 'host exit to boss');
    TestRunner.assertEqual(host.walls.E, false, 'host wall opened');
  });

  TestRunner.test('boss on an interior host goes to an island and teleports', () => {
    var w = FpWorld.build(interiorFixture());
    var host = w.cells.room_1_1;
    var boss = w.cells.boss_room;
    TestRunner.assertEqual(host.portal.teleport, true, 'teleport portal');
    TestRunner.assertEqual(host.portal.dir, 'E', 'first solid wall in priority');
    TestRunner.assertEqual(boss.x, w.bounds.maxX + 2, 'island x');
    TestRunner.assertEqual(boss.y, host.y, 'island y');
    TestRunner.assertEqual(boss.portal.to, 'room_1_1', 'boss portal back to host');
  });

  TestRunner.test('boss cell has exactly one opening, facing the host', () => {
    var w = FpWorld.build(borderFixture());
    var boss = w.cells.boss_room;
    var openings = FpWorld.DIRS.filter(function(d) { return !boss.walls[d]; });
    TestRunner.assertEqual(openings.length, 1, 'one opening');
    TestRunner.assertEqual(openings[0], 'W', 'opposite of portal dir');
    TestRunner.assertEqual(boss.exits.W, 'room_2_1', 'leads to host');
  });

  TestRunner.test('turns cycle through the compass', () => {
    var w = FpWorld.build(borderFixture());
    FpWorld.init(w, 'room_0_0', 'N');
    TestRunner.assertEqual(FpWorld.turnRight(), 'E', 'N right -> E');
    TestRunner.assertEqual(FpWorld.turnRight(), 'S', 'E right -> S');
    TestRunner.assertEqual(FpWorld.turnRight(), 'W', 'S right -> W');
    TestRunner.assertEqual(FpWorld.turnRight(), 'N', 'W right -> N');
    TestRunner.assertEqual(FpWorld.turnLeft(), 'W', 'N left -> W');
    TestRunner.assertEqual(FpWorld.turnAround(), 'E', 'W around -> E');
  });

  TestRunner.test('stepForward moves only through an opening', () => {
    var w = FpWorld.build(borderFixture());
    FpWorld.init(w, 'room_0_0', 'N');
    TestRunner.assertEqual(FpWorld.canStepForward(), false, 'wall north');
    TestRunner.assertEqual(FpWorld.stepForward(), null, 'null at wall');
    TestRunner.assertEqual(FpWorld.getState().roomId, 'room_0_0', 'did not move');
    FpWorld.turnRight();
    TestRunner.assertEqual(FpWorld.canStepForward(), true, 'open east');
    TestRunner.assertEqual(FpWorld.stepForward(), 'room_1_0', 'moved east');
    TestRunner.assertEqual(FpWorld.getState().roomId, 'room_1_0', 'state updated');
  });

  TestRunner.test('stepBackward keeps facing', () => {
    var w = FpWorld.build(borderFixture());
    FpWorld.init(w, 'room_1_0', 'E');
    TestRunner.assertEqual(FpWorld.canStepBackward(), true, 'open behind');
    TestRunner.assertEqual(FpWorld.stepBackward(), 'room_0_0', 'moved west');
    TestRunner.assertEqual(FpWorld.getFacing(), 'E', 'still facing east');
    TestRunner.assertEqual(FpWorld.stepBackward(), null, 'wall behind now');
  });

  TestRunner.test('getVisibleCells follows the facing ray until a wall or depth', () => {
    var w = FpWorld.build(borderFixture());
    FpWorld.init(w, 'room_0_0', 'E');
    var vis = FpWorld.getVisibleCells(3);
    TestRunner.assertEqual(vis.length, 3, '0,0 1,0 2,0');
    TestRunner.assertEqual(vis[2].roomId, 'room_2_0', 'stops at wall east of 2,0');
    TestRunner.assertEqual(vis[2].dist, 2, 'distance');
    TestRunner.assertEqual(FpWorld.getVisibleCells(1).length, 2, 'depth limit');
    FpWorld.setPosition('room_0_0', 'N');
    TestRunner.assertEqual(FpWorld.getVisibleCells(3).length, 1, 'only self facing a wall');
  });

  TestRunner.test('facingBetween works for neighbours, portals and returns null otherwise', () => {
    var w = FpWorld.build(borderFixture());
    FpWorld.init(w, 'room_0_0', 'N');
    TestRunner.assertEqual(FpWorld.facingBetween('room_0_0', 'room_1_0'), 'E', 'east neighbour');
    TestRunner.assertEqual(FpWorld.facingBetween('room_2_1', 'room_2_0'), 'N', 'north neighbour');
    TestRunner.assertEqual(FpWorld.facingBetween('room_2_1', 'boss_room'), 'E', 'through portal');
    TestRunner.assertEqual(FpWorld.facingBetween('boss_room', 'room_2_1'), 'W', 'back through portal');
    TestRunner.assertEqual(FpWorld.facingBetween('room_0_0', 'room_2_0'), null, 'not adjacent');
  });

  TestRunner.test('wall quads match the number of solid edges', () => {
    var w = FpWorld.build(borderFixture());
    var solid = 0;
    Object.keys(w.cells).forEach(function(id) {
      FpWorld.DIRS.forEach(function(d) { if (w.cells[id].walls[d]) solid++; });
    });
    var quads = FpWorld.getWallQuads();
    TestRunner.assertEqual(quads.length, solid, 'one quad per solid edge');
    var openQuad = quads.filter(function(q) { return q.roomId === 'room_0_0' && q.dir === 'E'; });
    TestRunner.assertEqual(openQuad.length, 0, 'no quad on an opening');
    var portals = FpWorld.getPortalQuads();
    TestRunner.assertEqual(portals.length, 1, 'one portal quad (host side only, walkable)');
    TestRunner.assertEqual(portals[0].to, 'boss_room', 'portal target');
  });

  TestRunner.test('DELTA and YAW are consistent with turning', () => {
    FpWorld.DIRS.forEach(function(d) {
      FpWorld.init(FpWorld.build(borderFixture()), 'room_0_0', d);
      var right = FpWorld.turnRight();
      var a = FpWorld.DELTA[d], b = FpWorld.DELTA[right];
      // Right-hand perpendicular on a y-down grid: (x, y) -> (-y, x)
      TestRunner.assertEqual(b[0], -a[1], d + ' right dx'); TestRunner.assertEqual(b[1], a[0], d + ' right dy');
      TestRunner.assertEqual(((FpWorld.YAW[d] - FpWorld.YAW[right]) % 360 + 360) % 360, 90, d + ' yaw decreases by 90 on right turn');
    });
  });

  TestRunner.test('integration: every Dungeon connection is walkable', () => {
    DungeonMap.init();
    Dungeon.generate();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());
    var w = FpWorld.fromDungeon();
    var rooms = Dungeon.getState().rooms;
    TestRunner.assertEqual(Object.keys(w.cells).length, Object.keys(rooms).length, 'cell per room (43)');
    var checked = 0;
    Object.keys(rooms).forEach(function(id) {
      rooms[id].connections.forEach(function(conn) {
        var f = FpWorld.facingBetween(id, conn);
        TestRunner.assertTruthy(f, id + ' -> ' + conn + ' has a facing');
        FpWorld.setPosition(id, f);
        TestRunner.assertEqual(FpWorld.stepForward(), conn, id + ' steps to ' + conn);
        checked++;
      });
    });
    TestRunner.assert(checked > 40, 'checked many connections');
    var boss = w.cells[w.bossId];
    TestRunner.assertTruthy(boss, 'boss cell exists');
    TestRunner.assertEqual(FpWorld.DIRS.filter(function(d) { return !boss.walls[d]; }).length, 1, 'boss has one exit');
  });
});
