/**
 * Map Module Tests
 * Tests for dungeon map rendering and location tracking
 */

TestRunner.suite('Map Module', () => {
  // Setup before each test
  function setup() {
    DungeonMap.init();
    Dungeon.generate();
    Player.create('MapTester');
  }

  TestRunner.test('init should reset map state', () => {
    setup();

    // Explore some rooms first
    DungeonMap.exploreRoom(Dungeon.getEntranceId());

    // Re-init should reset
    DungeonMap.init();

    TestRunner.assertEqual(DungeonMap.getExploredCount(), 0, 'Explored count should be 0 after init');
  });

  TestRunner.test('calculateLayout should position all dungeon rooms', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const positions = DungeonMap.getAllPositions();
    const dungeonStats = Dungeon.getStats();

    TestRunner.assert(Object.keys(positions).length > 0, 'Should have room positions');
    TestRunner.assert(
      Object.keys(positions).length >= dungeonStats.totalRooms,
      `Should position all rooms (${Object.keys(positions).length} >= ${dungeonStats.totalRooms})`
    );
  });

  TestRunner.test('entrance should be at position (0,0)', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const entrancePos = DungeonMap.getRoomPosition(Dungeon.getEntranceId());

    TestRunner.assertTruthy(entrancePos, 'Entrance should have a position');
    TestRunner.assertEqual(entrancePos.x, 0, 'Entrance x should be 0');
    TestRunner.assertEqual(entrancePos.y, 0, 'Entrance y should be 0');
  });

  TestRunner.test('exploreRoom should mark room as explored', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const entranceId = Dungeon.getEntranceId();

    TestRunner.assert(!DungeonMap.isExplored(entranceId), 'Room should not be explored initially');

    DungeonMap.exploreRoom(entranceId);

    TestRunner.assert(DungeonMap.isExplored(entranceId), 'Room should be explored after exploreRoom');
    TestRunner.assertEqual(DungeonMap.getExploredCount(), 1, 'Explored count should be 1');
  });

  TestRunner.test('connected rooms should have positions after exploring', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const entranceId = Dungeon.getEntranceId();
    DungeonMap.exploreRoom(entranceId);

    const entrance = Dungeon.getRoom(entranceId);
    entrance.connections.forEach(connId => {
      TestRunner.assert(
        DungeonMap.hasRoomPosition(connId),
        `Connected room ${connId} should have a position`
      );
    });
  });

  TestRunner.test('renderSVG should include current room marker', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());
    DungeonMap.exploreRoom(Dungeon.getEntranceId());

    const svg = DungeonMap.renderSVG(Dungeon.getEntranceId());

    TestRunner.assert(svg.includes('current-highlight'), 'SVG should have current-highlight class');
    TestRunner.assert(svg.includes('current-room'), 'SVG should have current-room class');
    TestRunner.assert(svg.includes('★'), 'Current room should show star icon');
  });

  TestRunner.test('renderSVG should mark correct room as current', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const entranceId = Dungeon.getEntranceId();
    DungeonMap.exploreRoom(entranceId);

    // Get a connected room
    const entrance = Dungeon.getRoom(entranceId);
    const nextRoomId = entrance.connections[0];
    DungeonMap.exploreRoom(nextRoomId);

    // Render with entrance as current
    const svg1 = DungeonMap.renderSVG(entranceId);
    TestRunner.assert(
      svg1.includes(`data-room-id="${entranceId}"`),
      'SVG should include entrance room'
    );

    // Render with next room as current
    const svg2 = DungeonMap.renderSVG(nextRoomId);
    // The current room indicator should move
    TestRunner.assert(svg2.includes('current-room'), 'SVG should have current room');
  });

  TestRunner.test('map should track player movement correctly', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const entranceId = Dungeon.getEntranceId();
    Player.moveTo(entranceId);
    DungeonMap.exploreRoom(entranceId);

    // Move to connected room
    const entrance = Dungeon.getRoom(entranceId);
    const nextRoomId = entrance.connections[0];
    Player.moveTo(nextRoomId);
    DungeonMap.exploreRoom(nextRoomId);

    // Verify both rooms are explored
    TestRunner.assert(DungeonMap.isExplored(entranceId), 'Entrance should be explored');
    TestRunner.assert(DungeonMap.isExplored(nextRoomId), 'Next room should be explored');
    TestRunner.assertEqual(DungeonMap.getExploredCount(), 2, 'Should have 2 explored rooms');

    // Verify player is in correct room
    TestRunner.assertEqual(Player.getCurrentRoom(), nextRoomId, 'Player should be in next room');
  });

  TestRunner.test('map state should be saveable and loadable', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const entranceId = Dungeon.getEntranceId();
    DungeonMap.exploreRoom(entranceId);

    const entrance = Dungeon.getRoom(entranceId);
    const nextRoomId = entrance.connections[0];
    DungeonMap.exploreRoom(nextRoomId);

    // Save state
    const state = DungeonMap.getState();

    TestRunner.assertTruthy(state.exploredRooms, 'State should have exploredRooms');
    TestRunner.assertTruthy(state.roomPositions, 'State should have roomPositions');
    TestRunner.assertEqual(state.exploredRooms.length, 2, 'Should have 2 explored rooms in state');

    // Reset and reload
    DungeonMap.init();
    TestRunner.assertEqual(DungeonMap.getExploredCount(), 0, 'Should be reset');

    DungeonMap.loadState(state);
    TestRunner.assertEqual(DungeonMap.getExploredCount(), 2, 'Should restore explored count');
    TestRunner.assert(DungeonMap.isExplored(entranceId), 'Entrance should be restored as explored');
    TestRunner.assert(DungeonMap.isExplored(nextRoomId), 'Next room should be restored as explored');
  });

  TestRunner.test('each room should have unique position', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const positions = DungeonMap.getAllPositions();
    const positionStrings = new Set();

    Object.entries(positions).forEach(([roomId, pos]) => {
      const posStr = `${pos.x},${pos.y}`;
      TestRunner.assert(
        !positionStrings.has(posStr),
        `Room ${roomId} has duplicate position ${posStr}`
      );
      positionStrings.add(posStr);
    });
  });

  TestRunner.test('boss room should have a position', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    const bossId = Dungeon.getBossId();
    const bossPos = DungeonMap.getRoomPosition(bossId);

    TestRunner.assertTruthy(bossPos, 'Boss room should have a position');
    TestRunner.assert(typeof bossPos.x === 'number', 'Boss x should be a number');
    TestRunner.assert(typeof bossPos.y === 'number', 'Boss y should be a number');
  });

  TestRunner.test('unexplored adjacent rooms should show ? icon', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    // Explore entrance - adjacent unexplored rooms should now be visible with ?
    DungeonMap.exploreRoom(Dungeon.getEntranceId());

    // Render with entrance as current (shows star), adjacent rooms should show ?
    const svg = DungeonMap.renderSVG(Dungeon.getEntranceId());

    // Should contain ? for unexplored adjacent rooms
    TestRunner.assert(svg.includes('>?<'), 'SVG should show ? for unexplored adjacent rooms');
  });

  TestRunner.test('rooms far from explored areas should not be visible', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    // Only explore entrance
    DungeonMap.exploreRoom(Dungeon.getEntranceId());

    const svg = DungeonMap.renderSVG(Dungeon.getEntranceId());

    // Boss room should not be visible (it's far from entrance)
    const bossId = Dungeon.getBossId();
    TestRunner.assert(
      !svg.includes(`data-room-id="${bossId}"`),
      'Boss room should not be visible when far from explored areas'
    );
  });

  TestRunner.test('explored entrance should show E icon', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());
    DungeonMap.exploreRoom(Dungeon.getEntranceId());

    // Render with a different room as current so entrance shows its type icon
    const entrance = Dungeon.getRoom(Dungeon.getEntranceId());
    const nextRoomId = entrance.connections[0];
    DungeonMap.exploreRoom(nextRoomId);

    const svg = DungeonMap.renderSVG(nextRoomId);

    // Entrance should show E (not star since it's not current)
    TestRunner.assert(svg.includes('>E<'), 'Explored entrance should show E icon');
  });

  TestRunner.test('current room position matches player position', () => {
    setup();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    // Simulate game flow: move through several rooms
    let currentRoom = Dungeon.getEntranceId();
    Player.moveTo(currentRoom);
    DungeonMap.exploreRoom(currentRoom);

    for (let i = 0; i < 3; i++) {
      const room = Dungeon.getRoom(currentRoom);
      if (room.connections.length > 0) {
        const nextRoom = room.connections[0];
        Player.moveTo(nextRoom);
        DungeonMap.exploreRoom(nextRoom);
        currentRoom = nextRoom;
      }
    }

    // Verify map position exists for current room
    const playerRoom = Player.getCurrentRoom();
    const mapPos = DungeonMap.getRoomPosition(playerRoom);

    TestRunner.assertTruthy(mapPos, 'Current player room should have map position');
    TestRunner.assert(DungeonMap.isExplored(playerRoom), 'Current room should be explored');

    // Verify SVG shows current room correctly
    const svg = DungeonMap.renderSVG(playerRoom);
    TestRunner.assert(
      svg.includes(`data-room-id="${playerRoom}"`),
      'SVG should include current room'
    );
    TestRunner.assert(svg.includes('current-room'), 'Current room should be marked');
  });
});
