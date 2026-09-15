/**
 * IsoModel
 * Pure isometric tile model for the isometric prototype (no Phaser, no DOM).
 * Turns the room graph (Dungeon) and the room positions (DungeonMap) into a
 * grid of diamond sub-tiles, corridor connectors, walls and fog-of-war state.
 *
 * Each room becomes a ROOM_SIZE x ROOM_SIZE block of floor tiles placed on a
 * PITCH grid, so the 1-tile gap between blocks holds the corridor connectors.
 * Fog of war reuses DungeonMap.isExplored / isRoomVisible.
 */

var IsoModel = (function() {
  var CONFIG = {
    TILE_W: 128,
    TILE_H: 64,
    ROOM_SIZE: 3,
    PITCH: 4,
    LAYERS: { floor: 0, wall: 1, token: 2, fx: 3 }
  };

  // Last built model (roomAt/linkAt/getRoomCenter operate on it)
  var model = null;

  // ---------------------------------------------------------------------------
  // Coordinate helpers
  // ---------------------------------------------------------------------------

  /**
   * Grid (sub-tile) coordinates to isometric screen pixels (tile centre)
   */
  function gridToIso(gx, gy) {
    return {
      x: (gx - gy) * (CONFIG.TILE_W / 2),
      y: (gx + gy) * (CONFIG.TILE_H / 2)
    };
  }

  /**
   * Isometric pixels to the nearest grid tile (exact for tile picking)
   */
  function isoToGrid(px, py) {
    var hw = CONFIG.TILE_W / 2;
    var hh = CONFIG.TILE_H / 2;
    return {
      gx: Math.round((px / hw + py / hh) / 2),
      gy: Math.round((py / hh - px / hw) / 2)
    };
  }

  /**
   * Depth sort key: further down-right on screen draws later
   */
  function depthKey(gx, gy, layer) {
    return (gx + gy) * 4 + (layer || 0);
  }

  function key(gx, gy) {
    return gx + ',' + gy;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  function ensurePositions() {
    var positions = DungeonMap.getAllPositions();
    if (Object.keys(positions).length === 0) {
      DungeonMap.calculateLayout(Dungeon.getEntranceId());
      positions = DungeonMap.getAllPositions();
    }
    return positions;
  }

  /**
   * Build the tile model from the current dungeon
   * @returns {Object} { tiles, tileMap, rooms, links, bounds }
   */
  function build() {
    var positions = ensurePositions();
    var roomsById = Dungeon.getState().rooms;
    var P = CONFIG.PITCH;
    var N = CONFIG.ROOM_SIZE;

    var tiles = [];
    var tileMap = {};
    var rooms = {};
    var posToRoom = {};
    var links = [];
    var linkMap = {};

    function addTile(gx, gy, kind, owner, variant) {
      var tile = { gx: gx, gy: gy, kind: kind, roomId: null, linkId: null,
        variant: variant || 0, walls: [] };
      if (kind === 'floor') tile.roomId = owner; else tile.linkId = owner;
      tiles.push(tile);
      tileMap[key(gx, gy)] = tile;
      return tile;
    }

    // Room blocks
    Object.keys(roomsById).forEach(function(roomId) {
      var pos = positions[roomId];
      if (!pos) return;
      var gx0 = pos.x * P;
      var gy0 = pos.y * P;
      rooms[roomId] = {
        id: roomId,
        rx: pos.x, ry: pos.y,
        gx0: gx0, gy0: gy0,
        center: { gx: gx0 + 1, gy: gy0 + 1 },
        type: roomsById[roomId].type
      };
      posToRoom[key(pos.x, pos.y)] = roomId;
      for (var dx = 0; dx < N; dx++) {
        for (var dy = 0; dy < N; dy++) {
          addTile(gx0 + dx, gy0 + dy, 'floor', roomId, (dx * 7 + dy * 13 + pos.x + pos.y) % 3);
        }
      }
    });

    // Links (undirected, deduped)
    Object.keys(roomsById).forEach(function(a) {
      var room = roomsById[a];
      (room.connections || []).forEach(function(b) {
        if (a > b) return; // dedupe
        if (!rooms[a] || !rooms[b]) return;
        var pa = rooms[a], pb = rooms[b];
        var dx = pb.rx - pa.rx, dy = pb.ry - pa.ry;
        var linkId = a + '|' + b;
        var link = { id: linkId, a: a, b: b, type: 'portal', tile: null };
        if (Math.abs(dx) + Math.abs(dy) === 1) {
          link.type = 'corridor';
          var gx, gy;
          if (dx !== 0) {
            gx = Math.min(pa.rx, pb.rx) * P + N;
            gy = pa.ry * P + 1;
          } else {
            gx = pa.rx * P + 1;
            gy = Math.min(pa.ry, pb.ry) * P + N;
          }
          link.tile = addTile(gx, gy, 'corridor', linkId, 0);
        }
        links.push(link);
        linkMap[linkId] = link;
      });
    });

    // Walls: sides with no neighbouring tile
    tiles.forEach(function(t) {
      if (!tileMap[key(t.gx, t.gy - 1)]) t.walls.push('n');
      if (!tileMap[key(t.gx - 1, t.gy)]) t.walls.push('w');
      if (!tileMap[key(t.gx, t.gy + 1)]) t.walls.push('s');
      if (!tileMap[key(t.gx + 1, t.gy)]) t.walls.push('e');
    });

    // Pixel bounds
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    tiles.forEach(function(t) {
      var p = gridToIso(t.gx, t.gy);
      minX = Math.min(minX, p.x - CONFIG.TILE_W / 2);
      maxX = Math.max(maxX, p.x + CONFIG.TILE_W / 2);
      minY = Math.min(minY, p.y - CONFIG.TILE_H / 2 - 96);
      maxY = Math.max(maxY, p.y + CONFIG.TILE_H / 2);
    });
    if (tiles.length === 0) { minX = minY = maxX = maxY = 0; }

    model = {
      tiles: tiles,
      tileMap: tileMap,
      rooms: rooms,
      posToRoom: posToRoom,
      links: links,
      linkMap: linkMap,
      bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    };
    return model;
  }

  function getModel() {
    return model;
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /**
   * Room id occupying a grid tile, or null (gap tiles, corridors, outside)
   */
  function roomAt(gx, gy) {
    if (!model) return null;
    var P = CONFIG.PITCH, N = CONFIG.ROOM_SIZE;
    if (gx < 0 || gy < 0) return null;
    if (gx % P >= N || gy % P >= N) return null;
    return model.posToRoom[key(Math.floor(gx / P), Math.floor(gy / P))] || null;
  }

  function linkAt(gx, gy) {
    if (!model) return null;
    var t = model.tileMap[key(gx, gy)];
    return (t && t.kind === 'corridor') ? t.linkId : null;
  }

  function getRoomCenter(roomId) {
    if (!model || !model.rooms[roomId]) return null;
    return model.rooms[roomId].center;
  }

  function getRoomCenterPx(roomId) {
    var c = getRoomCenter(roomId);
    return c ? gridToIso(c.gx, c.gy) : null;
  }

  function getBounds() {
    return model ? model.bounds : { x: 0, y: 0, width: 0, height: 0 };
  }

  function findLink(a, b) {
    if (!model) return null;
    return model.linkMap[a + '|' + b] || model.linkMap[b + '|' + a] || null;
  }

  /**
   * Grid waypoints from room a to room b: via the corridor tile when adjacent
   */
  function pathBetween(a, b) {
    var ca = getRoomCenter(a), cb = getRoomCenter(b);
    if (!ca || !cb) return [];
    var link = findLink(a, b);
    if (link && link.type === 'corridor' && link.tile) {
      return [ca, { gx: link.tile.gx, gy: link.tile.gy }, cb];
    }
    return [ca, cb];
  }

  // ---------------------------------------------------------------------------
  // Fog of war
  // ---------------------------------------------------------------------------

  /**
   * 'visible' (explored), 'fogged' (adjacent to explored) or 'hidden'
   */
  function getRoomVisibility(roomId) {
    if (DungeonMap.isExplored(roomId)) return 'visible';
    // Same rule as DungeonMap's private isRoomVisible: adjacent to an explored room
    var room = Dungeon.getRoom(roomId);
    if (room && room.connections) {
      for (var i = 0; i < room.connections.length; i++) {
        if (DungeonMap.isExplored(room.connections[i])) return 'fogged';
      }
    }
    return 'hidden';
  }

  function getLinkVisibility(link) {
    var ea = DungeonMap.isExplored(link.a);
    var eb = DungeonMap.isExplored(link.b);
    if (ea && eb) return 'visible';
    if (ea || eb) return 'fogged';
    return 'hidden';
  }

  /**
   * Which token (if any) a room shows in its current fog state
   * @returns {Object|null} { kind, id, size }
   */
  function getTokenFor(roomId) {
    var room = Dungeon.getRoom(roomId);
    if (!room) return null;
    var vis = getRoomVisibility(roomId);
    if (vis === 'hidden') return null;

    if (room.type === 'entrance') return { kind: 'entrance', id: null, size: 96 };

    if (vis === 'fogged') {
      if (room.type === 'monster' || room.type === 'treasure' || room.type === 'boss') {
        return { kind: 'unknown', id: null, size: 64 };
      }
      return null;
    }

    if (room.type === 'boss') {
      return room.cleared ? null : { kind: 'boss', id: 'dragon', size: 160 };
    }
    if (room.type === 'monster') {
      if (room.cleared) return null;
      return { kind: 'monster', id: room.monster ? room.monster.id : 'placeholder', size: 96 };
    }
    if (room.type === 'treasure') {
      return { kind: room.cleared ? 'treasure_open' : 'treasure', id: null, size: 96 };
    }
    return null;
  }

  return {
    CONFIG: CONFIG,
    gridToIso: gridToIso,
    isoToGrid: isoToGrid,
    depthKey: depthKey,
    build: build,
    getModel: getModel,
    roomAt: roomAt,
    linkAt: linkAt,
    getRoomCenter: getRoomCenter,
    getRoomCenterPx: getRoomCenterPx,
    getBounds: getBounds,
    findLink: findLink,
    pathBetween: pathBetween,
    getRoomVisibility: getRoomVisibility,
    getLinkVisibility: getLinkVisibility,
    getTokenFor: getTokenFor
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IsoModel;
}
