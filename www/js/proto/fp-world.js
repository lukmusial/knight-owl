/**
 * FpWorld
 * Pure grid model for the first-person prototype: turns the Dungeon room
 * graph (undirected connection lists) into cells with per-side walls/exits,
 * tracks the player's facing direction and answers movement queries.
 *
 * Grid x maps to world X, grid y to world Z (+y = South = +Z).
 * No DOM or Three.js references: loaded by the node test runner.
 */

var FpWorld = (function() {
  var DIRS = ['N', 'E', 'S', 'W'];
  var DELTA = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  var OPPOSITE = { N: 'S', E: 'W', S: 'N', W: 'E' };
  // Camera yaw in degrees (three.js default looks toward -Z, which is North)
  var YAW = { N: 0, E: -90, S: 180, W: 90 };
  var PORTAL_PRIORITY = ['E', 'S', 'N', 'W'];

  var world = null;
  var state = { roomId: null, facing: 'N' };

  function parseId(id) {
    var m = /^room_(\d+)_(\d+)$/.exec(id);
    return m ? { x: parseInt(m[1], 10), y: parseInt(m[2], 10) } : null;
  }

  function coordsOf(room) {
    if (room && typeof room.x === 'number' && typeof room.y === 'number') {
      return { x: room.x, y: room.y };
    }
    return room ? parseId(room.id) : null;
  }

  function makeCell(id, x, y, type) {
    return {
      id: id, x: x, y: y, type: type || 'corridor',
      walls: { N: true, E: true, S: true, W: true },
      exits: { N: null, E: null, S: null, W: null },
      portal: null
    };
  }

  function dirBetweenCoords(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    for (var i = 0; i < DIRS.length; i++) {
      var d = DELTA[DIRS[i]];
      if (d[0] === dx && d[1] === dy) return DIRS[i];
    }
    return null;
  }

  /**
   * Build the cell map from a rooms-by-id object (Dungeon.getState().rooms)
   * @param {Object} roomsById - Room objects keyed by id
   * @returns {Object} world { cells, grid, bounds, entranceId, bossId }
   */
  function build(roomsById) {
    var cells = {};
    var grid = {};
    var bounds = { maxX: 0, maxY: 0 };
    var entranceId = null;
    var bossRoom = null;
    var ids = Object.keys(roomsById);
    var i, j;

    // Grid cells
    for (i = 0; i < ids.length; i++) {
      var room = roomsById[ids[i]];
      if (room.type === 'boss') { bossRoom = room; continue; }
      var c = coordsOf(room);
      if (!c) continue;
      var cell = makeCell(room.id, c.x, c.y, room.type);
      cells[room.id] = cell;
      grid[c.x + ',' + c.y] = room.id;
      if (c.x > bounds.maxX) bounds.maxX = c.x;
      if (c.y > bounds.maxY) bounds.maxY = c.y;
      if (room.type === 'entrance') entranceId = room.id;
    }

    // Exits from connections (grid neighbours only)
    for (i = 0; i < ids.length; i++) {
      var r = roomsById[ids[i]];
      if (!cells[r.id]) continue;
      var conns = r.connections || [];
      for (j = 0; j < conns.length; j++) {
        var other = cells[conns[j]];
        if (!other) continue;
        var dir = dirBetweenCoords(cells[r.id], other);
        if (dir) {
          cells[r.id].exits[dir] = other.id;
          cells[r.id].walls[dir] = false;
        }
      }
    }

    // Boss room: attach through a portal on its host cell
    var bossId = null;
    if (bossRoom) {
      bossId = bossRoom.id;
      var hostId = (bossRoom.connections || [])[0];
      var host = cells[hostId];
      if (host) {
        var portalDir = null;
        var teleport = false;
        // Prefer a solid wall pointing outside the grid (boss cell can sit right there)
        for (i = 0; i < PORTAL_PRIORITY.length; i++) {
          var pd = PORTAL_PRIORITY[i];
          if (!host.walls[pd]) continue;
          var nx = host.x + DELTA[pd][0];
          var ny = host.y + DELTA[pd][1];
          if (nx < 0 || ny < 0 || nx > bounds.maxX || ny > bounds.maxY) { portalDir = pd; break; }
        }
        if (!portalDir) {
          for (i = 0; i < PORTAL_PRIORITY.length; i++) {
            if (host.walls[PORTAL_PRIORITY[i]]) { portalDir = PORTAL_PRIORITY[i]; break; }
          }
          teleport = true;
        }
        if (!portalDir) {
          // Host has four exits (cannot happen in a perfect maze); force east, teleport
          portalDir = 'E';
          teleport = true;
          console.warn('FpWorld: boss host has no solid wall, portal overrides east exit');
        }

        var bx, by;
        if (teleport) {
          bx = bounds.maxX + 2;
          by = host.y;
        } else {
          bx = host.x + DELTA[portalDir][0];
          by = host.y + DELTA[portalDir][1];
        }
        var boss = makeCell(bossId, bx, by, 'boss');
        var back = OPPOSITE[portalDir];
        boss.walls[back] = false;
        boss.exits[back] = host.id;
        if (teleport) boss.portal = { dir: back, to: host.id, teleport: true };
        cells[bossId] = boss;
        grid[bx + ',' + by] = bossId;

        host.walls[portalDir] = false;
        host.exits[portalDir] = bossId;
        host.portal = { dir: portalDir, to: bossId, teleport: teleport };
      }
    }

    world = { cells: cells, grid: grid, bounds: bounds, entranceId: entranceId, bossId: bossId };
    return world;
  }

  /**
   * Build from the live Dungeon module
   */
  function fromDungeon() {
    return build(Dungeon.getState().rooms);
  }

  function init(w, roomId, facing) {
    world = w || world;
    state.roomId = roomId;
    state.facing = facing || 'N';
  }

  function getWorld() { return world; }
  function getState() { return { roomId: state.roomId, facing: state.facing }; }
  function setPosition(roomId, facing) {
    state.roomId = roomId;
    if (facing) state.facing = facing;
  }
  function getFacing() { return state.facing; }
  function getCell(roomId) { return world && world.cells[roomId] || null; }
  function currentCell() { return getCell(state.roomId); }

  function turnLeft() {
    state.facing = DIRS[(DIRS.indexOf(state.facing) + 3) % 4];
    return state.facing;
  }
  function turnRight() {
    state.facing = DIRS[(DIRS.indexOf(state.facing) + 1) % 4];
    return state.facing;
  }
  function turnAround() {
    state.facing = OPPOSITE[state.facing];
    return state.facing;
  }

  function exitAhead() {
    var cell = currentCell();
    return cell ? cell.exits[state.facing] : null;
  }
  function exitBehind() {
    var cell = currentCell();
    return cell ? cell.exits[OPPOSITE[state.facing]] : null;
  }

  function canStepForward() { return !!exitAhead(); }
  function stepForward() {
    var next = exitAhead();
    if (!next) return null;
    state.roomId = next;
    return next;
  }
  function canStepBackward() { return !!exitBehind(); }
  function stepBackward() {
    var next = exitBehind();
    if (!next) return null;
    state.roomId = next;
    return next;
  }

  /**
   * Direction to face in cell `fromId` to look at adjacent cell `toId`
   */
  function facingBetween(fromId, toId) {
    var cell = getCell(fromId);
    if (!cell) return null;
    for (var i = 0; i < DIRS.length; i++) {
      if (cell.exits[DIRS[i]] === toId) return DIRS[i];
    }
    return null;
  }

  /**
   * Cells along the facing ray, up to `depth` steps or the first wall
   * @returns {Array} [{ roomId, dist }]
   */
  function getVisibleCells(depth) {
    depth = typeof depth === 'number' ? depth : 3;
    var out = [];
    var cell = currentCell();
    var dist = 0;
    while (cell && dist <= depth) {
      out.push({ roomId: cell.id, dist: dist });
      var next = cell.exits[state.facing];
      if (!next) break;
      // Teleport portals block the line of sight
      if (cell.portal && cell.portal.dir === state.facing && cell.portal.teleport) break;
      cell = getCell(next);
      dist++;
    }
    return out;
  }

  /**
   * One quad per solid edge per cell
   * @returns {Array} [{ roomId, x, y, dir }]
   */
  function getWallQuads() {
    var quads = [];
    if (!world) return quads;
    var ids = Object.keys(world.cells);
    for (var i = 0; i < ids.length; i++) {
      var cell = world.cells[ids[i]];
      for (var d = 0; d < DIRS.length; d++) {
        if (cell.walls[DIRS[d]]) {
          quads.push({ roomId: cell.id, x: cell.x, y: cell.y, dir: DIRS[d] });
        }
      }
    }
    return quads;
  }

  /**
   * Portal openings (drawn as gates)
   * @returns {Array} [{ roomId, x, y, dir, to, teleport }]
   */
  function getPortalQuads() {
    var quads = [];
    if (!world) return quads;
    var ids = Object.keys(world.cells);
    for (var i = 0; i < ids.length; i++) {
      var cell = world.cells[ids[i]];
      if (cell.portal) {
        quads.push({ roomId: cell.id, x: cell.x, y: cell.y, dir: cell.portal.dir,
          to: cell.portal.to, teleport: cell.portal.teleport });
      }
    }
    return quads;
  }

  function getCellPosition(roomId) {
    var cell = getCell(roomId);
    return cell ? { x: cell.x, y: cell.y } : null;
  }

  /**
   * Portal info when moving from `fromId` to `toId`, or null
   */
  function portalBetween(fromId, toId) {
    var cell = getCell(fromId);
    if (!cell || !cell.portal || cell.portal.to !== toId) return null;
    return cell.portal;
  }

  return {
    DIRS: DIRS,
    DELTA: DELTA,
    OPPOSITE: OPPOSITE,
    YAW: YAW,
    build: build,
    fromDungeon: fromDungeon,
    init: init,
    getWorld: getWorld,
    getState: getState,
    setPosition: setPosition,
    getFacing: getFacing,
    getCell: getCell,
    turnLeft: turnLeft,
    turnRight: turnRight,
    turnAround: turnAround,
    canStepForward: canStepForward,
    stepForward: stepForward,
    canStepBackward: canStepBackward,
    stepBackward: stepBackward,
    facingBetween: facingBetween,
    getVisibleCells: getVisibleCells,
    getWallQuads: getWallQuads,
    getPortalQuads: getPortalQuads,
    getCellPosition: getCellPosition,
    portalBetween: portalBetween
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FpWorld;
}
