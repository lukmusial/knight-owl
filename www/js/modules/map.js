/**
 * Map Module
 * Renders a visual map of the dungeon as it's explored
 */

const DungeonMap = (function() {
  // Map configuration
  const CONFIG = {
    nodeSize: 40,
    nodeSpacing: 80,
    padding: 50,
    colors: {
      entrance: '#4caf50',    // Green
      corridor: '#607d8b',    // Gray-blue
      monster: '#f44336',     // Red
      monsterCleared: '#ff9800', // Orange
      treasure: '#ffd700',    // Gold
      boss: '#9c27b0',        // Purple
      current: '#00bcd4',     // Cyan highlight
      connection: '#455a64',  // Dark gray
      unexplored: '#37474f',  // Darker gray
      text: '#ffffff'
    },
    icons: {
      entrance: 'E',
      corridor: '·',
      monster: '!',
      monsterCleared: '✓',
      treasure: '$',
      boss: 'D',
      current: '☆'
    }
  };

  // Track explored rooms and their positions
  let exploredRooms = new Set();
  let roomPositions = {};
  let mapBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  /**
   * Initialize the map
   */
  function init() {
    exploredRooms.clear();
    roomPositions = {};
    mapBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  /**
   * Calculate positions for all rooms using maze grid coordinates
   * @param {string} startRoomId - Starting room for layout
   */
  function calculateLayout(startRoomId) {
    if (!startRoomId) return;

    roomPositions = {};
    mapBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    // First pass: collect all rooms and their grid positions (excluding boss)
    const visited = new Set();
    const queue = [startRoomId];
    const pendingBossRoom = [];

    while (queue.length > 0) {
      const roomId = queue.shift();

      if (visited.has(roomId)) continue;
      visited.add(roomId);

      const room = Dungeon.getRoom(roomId);
      if (!room) continue;

      // Defer boss room to second pass
      if (roomId === 'boss_room') {
        pendingBossRoom.push(roomId);
        continue;
      }

      // Use the room's x,y coordinates if available (from maze grid)
      let x, y;
      if (typeof room.x === 'number' && typeof room.y === 'number') {
        x = room.x;
        y = room.y;
      } else if (roomId.startsWith('room_')) {
        // Parse coordinates from room ID (e.g., "room_3_2")
        const parts = roomId.split('_');
        x = parseInt(parts[1], 10) || 0;
        y = parseInt(parts[2], 10) || 0;
      } else {
        x = 0;
        y = 0;
      }

      roomPositions[roomId] = { x, y };

      // Update bounds
      mapBounds.minX = Math.min(mapBounds.minX, x);
      mapBounds.maxX = Math.max(mapBounds.maxX, x);
      mapBounds.minY = Math.min(mapBounds.minY, y);
      mapBounds.maxY = Math.max(mapBounds.maxY, y);

      // Queue connected rooms
      room.connections.forEach(connId => {
        if (!visited.has(connId)) {
          queue.push(connId);
        }
      });
    }

    // Second pass: position boss room beyond the maze grid
    pendingBossRoom.forEach(roomId => {
      const room = Dungeon.getRoom(roomId);
      if (!room) return;

      const connectedRoom = room.connections[0];
      const connPos = roomPositions[connectedRoom];

      let x, y;
      if (connPos) {
        // Place boss room one step to the right of the maze
        x = mapBounds.maxX + 1;
        y = connPos.y;
      } else {
        x = mapBounds.maxX + 1;
        y = Math.floor(mapBounds.maxY / 2);
      }

      roomPositions[roomId] = { x, y };

      // Update bounds
      mapBounds.maxX = Math.max(mapBounds.maxX, x);
    });
  }

  /**
   * Mark a room as explored
   * @param {string} roomId - Room ID to mark as explored
   */
  function exploreRoom(roomId) {
    exploredRooms.add(roomId);

    // Also mark connected rooms as "seen" (but not explored)
    const room = Dungeon.getRoom(roomId);
    if (room) {
      room.connections.forEach(connId => {
        // Just ensure they have positions calculated
        if (!roomPositions[connId]) {
          calculateLayout(Dungeon.getEntranceId());
        }
      });
    }
  }

  /**
   * Check if a room has been explored
   * @param {string} roomId - Room ID to check
   * @returns {boolean}
   */
  function isExplored(roomId) {
    return exploredRooms.has(roomId);
  }

  /**
   * Get room display info
   * @param {string} roomId - Room ID
   * @param {boolean} isCurrent - Is this the current room
   * @returns {Object} Display properties
   */
  function getRoomDisplay(roomId, isCurrent) {
    const room = Dungeon.getRoom(roomId);
    if (!room) return null;

    const explored = exploredRooms.has(roomId);
    let color, icon;

    if (!explored) {
      color = CONFIG.colors.unexplored;
      icon = '?';
    } else {
      switch (room.type) {
        case 'entrance':
          color = CONFIG.colors.entrance;
          icon = CONFIG.icons.entrance;
          break;
        case 'corridor':
          color = CONFIG.colors.corridor;
          icon = CONFIG.icons.corridor;
          break;
        case 'monster':
          color = room.cleared ? CONFIG.colors.monsterCleared : CONFIG.colors.monster;
          icon = room.cleared ? CONFIG.icons.monsterCleared : CONFIG.icons.monster;
          break;
        case 'treasure':
          color = CONFIG.colors.treasure;
          icon = CONFIG.icons.treasure;
          break;
        case 'boss':
          color = CONFIG.colors.boss;
          icon = CONFIG.icons.boss;
          break;
        default:
          color = CONFIG.colors.corridor;
          icon = '·';
      }
    }

    return {
      color,
      icon,
      explored,
      isCurrent,
      type: room.type,
      cleared: room.cleared
    };
  }

  /**
   * Check if a room should be visible on the map
   * A room is visible if it's explored OR adjacent to an explored room
   * @param {string} roomId - Room ID to check
   * @returns {boolean}
   */
  function isRoomVisible(roomId) {
    // Explored rooms are always visible
    if (exploredRooms.has(roomId)) return true;

    // Check if adjacent to any explored room
    const room = Dungeon.getRoom(roomId);
    if (!room) return false;

    for (const connId of room.connections) {
      if (exploredRooms.has(connId)) return true;
    }

    return false;
  }

  /**
   * Render the map to an SVG element
   * @param {string} currentRoomId - Current player room
   * @returns {string} SVG markup
   */
  function renderSVG(currentRoomId) {
    // Ensure layout is calculated
    if (Object.keys(roomPositions).length === 0) {
      calculateLayout(Dungeon.getEntranceId());
    }

    const spacing = CONFIG.nodeSpacing;
    const nodeSize = CONFIG.nodeSize;
    const padding = CONFIG.padding;

    // Determine which rooms are visible (explored or adjacent to explored)
    const visibleRooms = new Set();
    Object.keys(roomPositions).forEach(roomId => {
      if (isRoomVisible(roomId)) {
        visibleRooms.add(roomId);
      }
    });

    // Calculate bounds based on visible rooms only
    let visibleBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    visibleRooms.forEach(roomId => {
      const pos = roomPositions[roomId];
      if (pos) {
        visibleBounds.minX = Math.min(visibleBounds.minX, pos.x);
        visibleBounds.maxX = Math.max(visibleBounds.maxX, pos.x);
        visibleBounds.minY = Math.min(visibleBounds.minY, pos.y);
        visibleBounds.maxY = Math.max(visibleBounds.maxY, pos.y);
      }
    });

    // Handle edge case of no visible rooms
    if (visibleBounds.minX === Infinity) {
      visibleBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    // Calculate SVG dimensions based on visible bounds
    // Use minimum dimensions to ensure legend fits properly in corner
    const minWidth = 350;
    const minHeight = 250;
    const width = Math.max(minWidth, (visibleBounds.maxX - visibleBounds.minX + 1) * spacing + padding * 2);
    const height = Math.max(minHeight, (visibleBounds.maxY - visibleBounds.minY + 1) * spacing + padding * 2);

    // Offset to center the map
    const offsetX = -visibleBounds.minX * spacing + padding;
    const offsetY = -visibleBounds.minY * spacing + padding;

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="dungeon-map-svg">`;

    // Draw connections first (so they're behind nodes)
    svg += '<g class="map-connections">';
    visibleRooms.forEach(roomId => {
      const room = Dungeon.getRoom(roomId);
      if (!room) return;

      const pos = roomPositions[roomId];
      const x1 = pos.x * spacing + offsetX;
      const y1 = pos.y * spacing + offsetY;

      room.connections.forEach(connId => {
        const connPos = roomPositions[connId];
        // Only draw connection if both rooms are visible and to avoid duplicates
        if (connPos && visibleRooms.has(connId) && roomId < connId) {
          const x2 = connPos.x * spacing + offsetX;
          const y2 = connPos.y * spacing + offsetY;

          svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                   stroke="${CONFIG.colors.connection}" stroke-width="3"/>`;
        }
      });
    });
    svg += '</g>';

    // Draw room nodes
    svg += '<g class="map-nodes">';
    visibleRooms.forEach(roomId => {
      const pos = roomPositions[roomId];
      const x = pos.x * spacing + offsetX;
      const y = pos.y * spacing + offsetY;
      const isCurrent = roomId === currentRoomId;
      const display = getRoomDisplay(roomId, isCurrent);

      if (!display) return;

      // Current room - outer glow ring
      if (isCurrent) {
        // Outer pulsing glow
        svg += `<circle cx="${x}" cy="${y}" r="${nodeSize / 2 + 12}"
                 fill="none" stroke="${CONFIG.colors.current}" stroke-width="2"
                 opacity="0.3" class="current-glow">
                  <animate attributeName="r" values="${nodeSize / 2 + 10};${nodeSize / 2 + 15};${nodeSize / 2 + 10}"
                   dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.3;0.6;0.3"
                   dur="2s" repeatCount="indefinite"/>
                </circle>`;
        // Inner highlight ring
        svg += `<circle cx="${x}" cy="${y}" r="${nodeSize / 2 + 6}"
                 fill="none" stroke="${CONFIG.colors.current}" stroke-width="4"
                 class="current-highlight">
                  <animate attributeName="stroke-width" values="3;5;3"
                   dur="1s" repeatCount="indefinite"/>
                </circle>`;
      }

      // Room node - larger for current room
      const nodeOpacity = display.explored ? 1 : 0.4;
      const currentNodeSize = isCurrent ? nodeSize / 2 + 4 : nodeSize / 2;
      svg += `<circle cx="${x}" cy="${y}" r="${currentNodeSize}"
               fill="${display.color}" opacity="${nodeOpacity}"
               stroke="${isCurrent ? CONFIG.colors.current : '#000'}"
               stroke-width="${isCurrent ? 3 : 1}"
               class="map-node ${display.type} ${display.explored ? 'explored' : 'unexplored'} ${isCurrent ? 'current-room' : ''}"
               data-room-id="${roomId}"/>`;

      // Room icon/text - larger for current room
      const fontSize = isCurrent ? 20 : 16;
      svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
               fill="${CONFIG.colors.text}" font-size="${fontSize}" font-weight="bold"
               class="map-icon">${isCurrent ? '★' : display.icon}</text>`;
    });
    svg += '</g>';

    svg += '</svg>';
    return svg;
  }

  /**
   * Render map legend as HTML (doesn't scale with map)
   * @returns {string} HTML markup for legend
   */
  function renderLegendHTML() {
    const legendItems = [
      { color: CONFIG.colors.entrance, icon: 'E', label: 'Entrance' },
      { color: CONFIG.colors.monster, icon: '!', label: 'Monster' },
      { color: CONFIG.colors.monsterCleared, icon: '✓', label: 'Cleared' },
      { color: CONFIG.colors.treasure, icon: '$', label: 'Treasure' },
      { color: CONFIG.colors.boss, icon: 'D', label: 'Dragon' },
      { color: CONFIG.colors.current, icon: '★', label: 'You' }
    ];

    let html = '<div class="map-legend-html">';
    legendItems.forEach(item => {
      html += `<div class="legend-item">
        <span class="legend-icon" style="background-color: ${item.color}">${item.icon}</span>
        <span class="legend-label">${item.label}</span>
      </div>`;
    });
    html += '</div>';

    return html;
  }

  /**
   * Get map state for saving
   * @returns {Object} Map state
   */
  function getState() {
    return {
      exploredRooms: Array.from(exploredRooms),
      roomPositions: { ...roomPositions },
      mapBounds: { ...mapBounds }
    };
  }

  /**
   * Load map state
   * @param {Object} state - Saved state
   */
  function loadState(state) {
    if (state) {
      exploredRooms = new Set(state.exploredRooms || []);
      roomPositions = state.roomPositions || {};
      mapBounds = state.mapBounds || { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
  }

  /**
   * Get explored rooms count
   * @returns {number}
   */
  function getExploredCount() {
    return exploredRooms.size;
  }

  /**
   * Render mini-map for display in sidebar
   * @param {string} currentRoomId - Current room
   * @returns {string} SVG markup
   */
  function renderMiniMap(currentRoomId) {
    return renderSVG(currentRoomId);
  }

  /**
   * Get the position of a room on the map
   * @param {string} roomId - Room ID
   * @returns {Object|null} Position {x, y} or null if not found
   */
  function getRoomPosition(roomId) {
    return roomPositions[roomId] || null;
  }

  /**
   * Check if a room has a position calculated
   * @param {string} roomId - Room ID
   * @returns {boolean}
   */
  function hasRoomPosition(roomId) {
    return roomId in roomPositions;
  }

  /**
   * Get all room positions (for testing)
   * @returns {Object} Map of roomId to position
   */
  function getAllPositions() {
    return { ...roomPositions };
  }

  // Public API
  return {
    init,
    calculateLayout,
    exploreRoom,
    isExplored,
    renderSVG,
    renderLegendHTML,
    renderMiniMap,
    getState,
    loadState,
    getExploredCount,
    getRoomPosition,
    hasRoomPosition,
    getAllPositions,
    CONFIG
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DungeonMap;
}
