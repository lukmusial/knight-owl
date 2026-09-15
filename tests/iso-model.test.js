/**
 * IsoModel Tests
 */

TestRunner.suite('IsoModel', () => {
  var model;
  function setup() {
    DungeonMap.init();
    Dungeon.generate();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());
    model = IsoModel.build();
  }

  TestRunner.test('gridToIso maps grid to 2:1 diamonds', () => {
    var a = IsoModel.gridToIso(0, 0), b = IsoModel.gridToIso(1, 0), c = IsoModel.gridToIso(0, 1);
    TestRunner.assertEqual(a.x + ',' + a.y, '0,0', 'origin');
    TestRunner.assertEqual(b.x + ',' + b.y, '64,32', 'one step in gx');
    TestRunner.assertEqual(c.x + ',' + c.y, '-64,32', 'one step in gy');
  });

  TestRunner.test('isoToGrid round-trips and picks off-centre points', () => {
    for (var gx = 0; gx <= 30; gx++) {
      for (var gy = 0; gy <= 24; gy++) {
        var p = IsoModel.gridToIso(gx, gy);
        var g = IsoModel.isoToGrid(p.x, p.y);
        TestRunner.assert(g.gx === gx && g.gy === gy, 'round trip ' + gx + ',' + gy);
        var g2 = IsoModel.isoToGrid(p.x + 20, p.y + 5);
        TestRunner.assert(g2.gx === gx && g2.gy === gy, 'off-centre pick ' + gx + ',' + gy);
      }
    }
  });

  TestRunner.test('every room has 9 floor tiles, entrance at the origin block', () => {
    setup();
    var rooms = Dungeon.getState().rooms;
    Object.keys(rooms).forEach(function(id) {
      var count = model.tiles.filter(function(t) { return t.kind === 'floor' && t.roomId === id; }).length;
      TestRunner.assertEqual(count, 9, id + ' should have 9 floor tiles');
    });
    var entrance = model.rooms[Dungeon.getEntranceId()];
    TestRunner.assertEqual(entrance.gx0 + ',' + entrance.gy0, '0,0', 'entrance block origin');
  });

  TestRunner.test('roomAt distinguishes block tiles from gap tiles', () => {
    setup();
    var e = Dungeon.getEntranceId();
    TestRunner.assertEqual(IsoModel.roomAt(1, 1), e, 'centre of entrance');
    TestRunner.assertEqual(IsoModel.roomAt(2, 0), e, 'corner of entrance');
    TestRunner.assertEqual(IsoModel.roomAt(3, 1), null, 'gap column');
    TestRunner.assertEqual(IsoModel.roomAt(1, 3), null, 'gap row');
    TestRunner.assertEqual(IsoModel.roomAt(-1, 0), null, 'outside');
    var c = IsoModel.getRoomCenter(e);
    TestRunner.assertEqual(c.gx + ',' + c.gy, '1,1', 'entrance centre');
  });

  TestRunner.test('adjacent connections yield exactly one corridor tile, no duplicates', () => {
    setup();
    var rooms = Dungeon.getState().rooms;
    var total = 0;
    Object.keys(rooms).forEach(function(id) { total += rooms[id].connections.length; });
    TestRunner.assertEqual(model.links.length, total / 2, 'one link per undirected connection');
    model.links.forEach(function(link) {
      if (link.type === 'corridor') {
        TestRunner.assertTruthy(link.tile, link.id + ' has a tile');
        TestRunner.assertEqual(IsoModel.linkAt(link.tile.gx, link.tile.gy), link.id, 'linkAt finds it');
        TestRunner.assertEqual(IsoModel.roomAt(link.tile.gx, link.tile.gy), null, 'corridor is not in a room');
      }
    });
    var corridorTiles = model.tiles.filter(function(t) { return t.kind === 'corridor'; }).length;
    var corridorLinks = model.links.filter(function(l) { return l.type === 'corridor'; }).length;
    TestRunner.assertEqual(corridorTiles, corridorLinks, 'one tile per corridor link');
  });

  TestRunner.test('boss link is a portal unless grid-adjacent; pathBetween lengths', () => {
    setup();
    var boss = Dungeon.getBossId();
    var host = Dungeon.getRoom(boss).connections[0];
    var link = IsoModel.findLink(boss, host);
    TestRunner.assertTruthy(link, 'boss link exists');
    var pa = model.rooms[boss], pb = model.rooms[host];
    var adjacent = Math.abs(pa.rx - pb.rx) + Math.abs(pa.ry - pb.ry) === 1;
    TestRunner.assertEqual(link.type, adjacent ? 'corridor' : 'portal', 'link type follows adjacency');
    TestRunner.assertEqual(IsoModel.pathBetween(host, boss).length, adjacent ? 3 : 2, 'path length');
    var e = Dungeon.getEntranceId();
    var n = Dungeon.getRoom(e).connections[0];
    TestRunner.assertEqual(IsoModel.pathBetween(e, n).length, 3, 'entrance to neighbour via corridor');
  });

  TestRunner.test('walls appear only on sides without a neighbouring tile', () => {
    setup();
    var e = Dungeon.getEntranceId();
    var corner = model.tileMap['0,0'];
    TestRunner.assert(corner.walls.indexOf('n') !== -1 && corner.walls.indexOf('w') !== -1, 'entrance corner has n and w walls');
    var n = Dungeon.getRoom(e).connections[0];
    var link = IsoModel.findLink(e, n);
    var t = link.tile;
    // The room tile next to the corridor has no wall towards it
    var neighbours = [[t.gx, t.gy - 1, 's'], [t.gx, t.gy + 1, 'n'], [t.gx - 1, t.gy, 'e'], [t.gx + 1, t.gy, 'w']];
    var open = 0;
    neighbours.forEach(function(nb) {
      var tile = model.tileMap[nb[0] + ',' + nb[1]];
      if (tile) {
        open++;
        TestRunner.assert(tile.walls.indexOf(nb[2]) === -1, 'no wall between room tile and corridor');
      }
    });
    TestRunner.assertEqual(open, 2, 'corridor tile touches two room tiles');
  });

  TestRunner.test('fog transitions follow DungeonMap exploration', () => {
    setup();
    var e = Dungeon.getEntranceId();
    var n = Dungeon.getRoom(e).connections[0];
    TestRunner.assertEqual(IsoModel.getRoomVisibility(e), 'hidden', 'all hidden before exploring');
    DungeonMap.exploreRoom(e);
    TestRunner.assertEqual(IsoModel.getRoomVisibility(e), 'visible', 'entrance visible');
    TestRunner.assertEqual(IsoModel.getRoomVisibility(n), 'fogged', 'neighbour fogged');
    var rooms = Dungeon.getState().rooms;
    var deep = Object.keys(rooms).filter(function(id) { return rooms[id].depth >= 3; })[0];
    TestRunner.assertEqual(IsoModel.getRoomVisibility(deep), 'hidden', 'deep room hidden');
    var link = IsoModel.findLink(e, n);
    TestRunner.assertEqual(IsoModel.getLinkVisibility(link), 'fogged', 'corridor fogged with one end explored');
    DungeonMap.exploreRoom(n);
    TestRunner.assertEqual(IsoModel.getLinkVisibility(link), 'visible', 'corridor visible with both ends explored');
    TestRunner.assertEqual(IsoModel.getRoomVisibility(n), 'visible', 'neighbour now visible');
  });

  TestRunner.test('token rules: unknown when fogged, monster when explored, none when cleared', () => {
    setup();
    var rooms = Dungeon.getState().rooms;
    var monsterId = Object.keys(rooms).filter(function(id) { return rooms[id].type === 'monster'; })[0];
    var corridorId = Object.keys(rooms).filter(function(id) { return rooms[id].type === 'corridor'; })[0];
    TestRunner.assertEqual(IsoModel.getTokenFor(monsterId), null, 'hidden room shows nothing');
    var neighbour = rooms[monsterId].connections[0];
    DungeonMap.exploreRoom(neighbour);
    TestRunner.assertEqual(IsoModel.getTokenFor(monsterId).kind, 'unknown', 'fogged monster is a ? marker');
    DungeonMap.exploreRoom(monsterId);
    var tok = IsoModel.getTokenFor(monsterId);
    TestRunner.assertEqual(tok.kind, 'monster', 'explored monster token');
    TestRunner.assertEqual(tok.id, rooms[monsterId].monster.id, 'token carries monster id');
    Dungeon.clearRoom(monsterId);
    TestRunner.assertEqual(IsoModel.getTokenFor(monsterId), null, 'cleared monster has no token');
    DungeonMap.exploreRoom(corridorId);
    TestRunner.assertEqual(IsoModel.getTokenFor(corridorId), null, 'corridor has no token');
    DungeonMap.exploreRoom(Dungeon.getBossId());
    var boss = IsoModel.getTokenFor(Dungeon.getBossId());
    TestRunner.assertEqual(boss.kind + ':' + boss.size, 'boss:160', 'boss token is large');
    DungeonMap.exploreRoom(Dungeon.getEntranceId());
    TestRunner.assertEqual(IsoModel.getTokenFor(Dungeon.getEntranceId()).kind, 'entrance', 'entrance marker');
  });

  TestRunner.test('depthKey orders layers within a tile and tiles down-right', () => {
    TestRunner.assert(IsoModel.depthKey(3, 3, 2) > IsoModel.depthKey(3, 3, 0), 'token above floor');
    TestRunner.assert(IsoModel.depthKey(4, 3, 0) > IsoModel.depthKey(3, 3, 3), 'next tile above previous fx layer');
    TestRunner.assert(IsoModel.depthKey(3, 4, 0) > IsoModel.depthKey(3, 3, 3), 'next row above previous fx layer');
  });

  TestRunner.test('bounds contain every tile', () => {
    setup();
    var b = IsoModel.getBounds();
    model.tiles.forEach(function(t) {
      var p = IsoModel.gridToIso(t.gx, t.gy);
      TestRunner.assert(p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height, 'tile inside bounds');
    });
    TestRunner.assert(b.width > 0 && b.height > 0, 'non-empty bounds');
  });
});
