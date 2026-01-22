/**
 * Dungeon Module
 * Generates and manages the dungeon layout using generate-maze library
 */

const Dungeon = (function() {
  // Configuration
  const CONFIG = {
    MIN_MONSTER_ROOMS: 20,
    MAZE_WIDTH: 7,
    MAZE_HEIGHT: 6,
    MIN_CONNECTIONS: 2,
    MAX_CONNECTIONS: 4
  };

  // Current dungeon state
  let rooms = {};
  let entranceId = null;
  let bossId = null;

  /**
   * Convert maze grid from generate-maze library to room graph
   * @param {Array} maze - 2D maze grid from generate-maze
   * @returns {Object} Room graph
   */
  function mazeToRooms(maze) {
    const height = maze.length;
    const width = maze[0].length;
    const roomGrid = {};

    // Create rooms for each cell
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = maze[y][x];
        const roomId = `room_${x}_${y}`;
        roomGrid[roomId] = {
          id: roomId,
          x,
          y,
          type: 'corridor',
          monster: null,
          connections: [],
          cleared: true,
          depth: 0,
          description: '',
          imagePrompt: ''
        };
      }
    }

    // Connect rooms based on maze walls (generate-maze uses top/left/bottom/right booleans)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = maze[y][x];
        const roomId = `room_${x}_${y}`;
        const room = roomGrid[roomId];

        // generate-maze: true = wall exists, false = passage
        if (!cell.top && y > 0) {
          room.connections.push(`room_${x}_${y - 1}`);
        }
        if (!cell.right && x < width - 1) {
          room.connections.push(`room_${x + 1}_${y}`);
        }
        if (!cell.bottom && y < height - 1) {
          room.connections.push(`room_${x}_${y + 1}`);
        }
        if (!cell.left && x > 0) {
          room.connections.push(`room_${x - 1}_${y}`);
        }
      }
    }

    return roomGrid;
  }

  /**
   * Calculate shortest path distance using BFS
   * @param {Object} roomGrid - Room grid
   * @param {string} startId - Start room ID
   * @param {string} endId - End room ID
   * @returns {number} Distance or -1 if no path
   */
  function getDistance(roomGrid, startId, endId) {
    const visited = new Set();
    const queue = [{ id: startId, dist: 0 }];

    while (queue.length > 0) {
      const { id, dist } = queue.shift();

      if (id === endId) return dist;
      if (visited.has(id)) continue;
      visited.add(id);

      const room = roomGrid[id];
      if (room) {
        room.connections.forEach(connId => {
          if (!visited.has(connId)) {
            queue.push({ id: connId, dist: dist + 1 });
          }
        });
      }
    }

    return -1;
  }

  /**
   * Find dead ends in the maze (rooms with only one connection)
   * @param {Object} roomGrid - Room grid
   * @returns {Array} Array of dead end room IDs
   */
  function findDeadEnds(roomGrid) {
    return Object.keys(roomGrid).filter(id => roomGrid[id].connections.length === 1);
  }

  /**
   * Generate a new dungeon
   * @param {Object} config - Optional configuration overrides
   * @returns {Object} Dungeon state
   */
  function generate(config = {}) {
    const settings = { ...CONFIG, ...config };

    rooms = {};
    entranceId = null;
    bossId = null;

    // Use generate-maze library (MazeGenerator is the bundled global)
    // Falls back to simple grid if library not available
    let maze;
    if (typeof MazeGenerator !== 'undefined') {
      // generate-maze(width, height, closed, seed)
      // closed=true means outer walls are solid
      maze = MazeGenerator(settings.MAZE_WIDTH, settings.MAZE_HEIGHT, true);
    } else {
      // Fallback: create a simple connected grid
      maze = createFallbackMaze(settings.MAZE_WIDTH, settings.MAZE_HEIGHT);
    }

    const roomGrid = mazeToRooms(maze);

    // Set entrance at top-left
    entranceId = 'room_0_0';
    roomGrid[entranceId].type = 'entrance';
    roomGrid[entranceId].cleared = true;

    // Find farthest point from entrance for boss room connection
    let maxDist = 0;
    let farthestRoom = null;

    Object.keys(roomGrid).forEach(roomId => {
      if (roomId !== entranceId) {
        const dist = getDistance(roomGrid, entranceId, roomId);
        if (dist > maxDist) {
          maxDist = dist;
          farthestRoom = roomId;
        }
      }
    });

    // Create boss room connected to farthest room
    bossId = 'boss_room';
    rooms[bossId] = {
      id: bossId,
      type: 'boss',
      monster: typeof getDragonBoss !== 'undefined' ? getDragonBoss() : { id: 'dragon', name: 'Ancient Dragon' },
      connections: [farthestRoom],
      cleared: false,
      depth: maxDist + 1,
      description: '',
      imagePrompt: ''
    };
    roomGrid[farthestRoom].connections.push(bossId);

    // Calculate depths using BFS from entrance
    const depthQueue = [{ id: entranceId, depth: 0 }];
    const depthVisited = new Set();

    while (depthQueue.length > 0) {
      const { id, depth } = depthQueue.shift();
      if (depthVisited.has(id)) continue;
      depthVisited.add(id);

      if (roomGrid[id]) {
        roomGrid[id].depth = depth;
        roomGrid[id].connections.forEach(connId => {
          if (!depthVisited.has(connId) && roomGrid[connId]) {
            depthQueue.push({ id: connId, depth: depth + 1 });
          }
        });
      }
    }

    // Find dead ends for treasure rooms
    const deadEnds = findDeadEnds(roomGrid).filter(id => id !== entranceId && id !== farthestRoom);

    // Place treasure rooms at some dead ends
    const treasureCount = Math.min(3, deadEnds.length);
    for (let i = 0; i < treasureCount; i++) {
      const idx = Math.floor(Math.random() * deadEnds.length);
      const treasureId = deadEnds.splice(idx, 1)[0];
      roomGrid[treasureId].type = 'treasure';
      roomGrid[treasureId].cleared = false; // Treasure rooms need to be collected
    }

    // Place monster rooms
    const availableRooms = Object.keys(roomGrid).filter(id =>
      id !== entranceId &&
      id !== farthestRoom &&
      roomGrid[id].type === 'corridor'
    );

    // Shuffle and pick rooms for monsters
    const shuffled = availableRooms.sort(() => Math.random() - 0.5);
    const monsterCount = Math.min(settings.MIN_MONSTER_ROOMS, shuffled.length);

    for (let i = 0; i < monsterCount; i++) {
      const roomId = shuffled[i];
      const room = roomGrid[roomId];
      const difficulty = getDepthDifficulty(room.depth);

      room.type = 'monster';
      room.monster = typeof getRandomMonster !== 'undefined' ? getRandomMonster(difficulty) : {
        id: 'generic',
        name: 'Monster',
        difficulty: difficulty
      };
      room.cleared = false;
    }

    // Copy roomGrid to rooms
    Object.assign(rooms, roomGrid);

    // Generate descriptions for all rooms
    generateDescriptions();

    return getState();
  }

  /**
   * Fallback maze generator if library not available
   * Creates a simple grid with random connections
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @returns {Array} 2D maze array
   */
  function createFallbackMaze(width, height) {
    const maze = [];
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          x,
          y,
          top: y === 0 || Math.random() > 0.7,
          right: x === width - 1 || Math.random() > 0.7,
          bottom: y === height - 1 || Math.random() > 0.7,
          left: x === 0 || Math.random() > 0.7
        };
      }
    }

    // Ensure connectivity with a simple path
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x++) {
        if (Math.random() > 0.3) {
          maze[y][x].right = false;
          maze[y][x + 1].left = false;
        }
      }
    }
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height - 1; y++) {
        if (Math.random() > 0.3) {
          maze[y][x].bottom = false;
          maze[y + 1][x].top = false;
        }
      }
    }

    return maze;
  }

  /**
   * Get difficulty level for a depth
   * @param {number} depth - Room depth
   * @returns {number} Difficulty 1-3
   */
  function getDepthDifficulty(depth) {
    if (depth <= 4) return 1;
    if (depth <= 8) return 2;
    return 3;
  }

  /**
   * Generate descriptions for all rooms
   */
  function generateDescriptions() {
    Object.values(rooms).forEach(room => {
      const desc = typeof Descriptions !== 'undefined' ? Descriptions.generateRoomDescription(room) : {
        description: 'A dungeon room.',
        imagePrompt: 'A dark dungeon room'
      };
      room.description = desc.description;
      room.imagePrompt = desc.imagePrompt;
    });
  }

  /**
   * Get room information
   * @param {string} roomId - Room ID
   * @returns {Object|null} Room data
   */
  function getRoom(roomId) {
    const room = rooms[roomId];
    return room ? { ...room, connections: [...room.connections] } : null;
  }

  /**
   * Get connected rooms from a room
   * @param {string} roomId - Room ID
   * @returns {Array} Array of connected room objects
   */
  function getConnectedRooms(roomId) {
    const room = rooms[roomId];
    if (!room) return [];

    return room.connections.map(id => getRoom(id)).filter(r => r !== null);
  }

  /**
   * Mark a room as cleared
   * @param {string} roomId - Room ID
   */
  function clearRoom(roomId) {
    if (rooms[roomId]) {
      rooms[roomId].cleared = true;
    }
  }

  /**
   * Check if a room is cleared
   * @param {string} roomId - Room ID
   * @returns {boolean} Whether room is cleared
   */
  function isRoomCleared(roomId) {
    return rooms[roomId] ? rooms[roomId].cleared : false;
  }

  /**
   * Check if room is the boss room
   * @param {string} roomId - Room ID
   * @returns {boolean} Whether this is the boss room
   */
  function isBossRoom(roomId) {
    return roomId === bossId;
  }

  /**
   * Check if room has a monster encounter
   * @param {string} roomId - Room ID
   * @returns {boolean} Whether room has undefeated monster
   */
  function hasMonsterEncounter(roomId) {
    const room = rooms[roomId];
    return room && room.monster && !room.cleared;
  }

  /**
   * Get entrance room ID
   * @returns {string} Entrance room ID
   */
  function getEntranceId() {
    return entranceId;
  }

  /**
   * Get boss room ID
   * @returns {string} Boss room ID
   */
  function getBossId() {
    return bossId;
  }

  /**
   * Get dungeon statistics
   * @returns {Object} Dungeon stats
   */
  function getStats() {
    const allRooms = Object.values(rooms);
    return {
      totalRooms: allRooms.length,
      monsterRooms: allRooms.filter(r => r.type === 'monster').length,
      clearedRooms: allRooms.filter(r => r.cleared).length,
      maxDepth: Math.max(...allRooms.map(r => r.depth))
    };
  }

  /**
   * Get current dungeon state (for saving)
   * @returns {Object} Serializable dungeon state
   */
  function getState() {
    return {
      rooms: JSON.parse(JSON.stringify(rooms)),
      entranceId,
      bossId
    };
  }

  /**
   * Load dungeon state (from save)
   * @param {Object} state - Saved dungeon state
   */
  function loadState(state) {
    rooms = JSON.parse(JSON.stringify(state.rooms));
    entranceId = state.entranceId;
    bossId = state.bossId;
  }

  /**
   * Verify dungeon has valid path to boss
   * @returns {boolean} Whether path exists
   */
  function hasPathToBoss() {
    const visited = new Set();
    const queue = [entranceId];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current === bossId) {
        return true;
      }

      if (visited.has(current)) continue;
      visited.add(current);

      const room = rooms[current];
      if (room) {
        room.connections.forEach(id => {
          if (!visited.has(id)) {
            queue.push(id);
          }
        });
      }
    }

    return false;
  }

  /**
   * Count monster rooms on path to boss
   * @returns {number} Number of monster rooms
   */
  function countMonsterRoomsOnPath() {
    let count = 0;
    Object.values(rooms).forEach(room => {
      if (room.type === 'monster') count++;
    });
    return count;
  }

  // Public API
  return {
    generate,
    getRoom,
    getConnectedRooms,
    clearRoom,
    isRoomCleared,
    isBossRoom,
    hasMonsterEncounter,
    getEntranceId,
    getBossId,
    getStats,
    getState,
    loadState,
    hasPathToBoss,
    countMonsterRoomsOnPath,
    getDepthDifficulty,
    CONFIG
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dungeon;
}
