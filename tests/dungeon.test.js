/**
 * Dungeon Module Tests
 */

TestRunner.suite('Dungeon Module', () => {
  TestRunner.test('generate should create a dungeon', () => {
    const state = Dungeon.generate();

    TestRunner.assertTruthy(state, 'Should return dungeon state');
    TestRunner.assertTruthy(state.rooms, 'Should have rooms');
    TestRunner.assertTruthy(state.entranceId, 'Should have entrance ID');
    TestRunner.assertTruthy(state.bossId, 'Should have boss ID');
  });

  TestRunner.test('should have entrance room', () => {
    Dungeon.generate();
    const entrance = Dungeon.getRoom(Dungeon.getEntranceId());

    TestRunner.assertTruthy(entrance, 'Should have entrance room');
    TestRunner.assertEqual(entrance.type, 'entrance', 'Entrance should be entrance type');
    TestRunner.assert(entrance.cleared, 'Entrance should be cleared');
    TestRunner.assertEqual(entrance.depth, 0, 'Entrance should be depth 0');
  });

  TestRunner.test('should have boss room', () => {
    Dungeon.generate();
    const boss = Dungeon.getRoom(Dungeon.getBossId());

    TestRunner.assertTruthy(boss, 'Should have boss room');
    TestRunner.assertEqual(boss.type, 'boss', 'Boss room should be boss type');
    TestRunner.assertTruthy(boss.monster, 'Boss room should have monster');
    TestRunner.assert(!boss.cleared, 'Boss room should not be cleared initially');
  });

  TestRunner.test('should have at least 20 monster rooms', () => {
    Dungeon.generate();
    const count = Dungeon.countMonsterRoomsOnPath();

    TestRunner.assert(count >= 20, `Should have at least 20 monster rooms, got ${count}`);
  });

  TestRunner.test('should have valid path from entrance to boss', () => {
    Dungeon.generate();
    const hasPath = Dungeon.hasPathToBoss();

    TestRunner.assert(hasPath, 'Should have valid path to boss');
  });

  TestRunner.test('getRoom should return room data', () => {
    Dungeon.generate();
    const entranceId = Dungeon.getEntranceId();
    const entrance = Dungeon.getRoom(entranceId);

    TestRunner.assertTruthy(entrance.id, 'Room should have id');
    TestRunner.assertTruthy(entrance.type, 'Room should have type');
    TestRunner.assertArray(entrance.connections, 'Room should have connections array');
    TestRunner.assertTruthy(entrance.description, 'Room should have description');
  });

  TestRunner.test('getConnectedRooms should return adjacent rooms', () => {
    Dungeon.generate();
    const entranceId = Dungeon.getEntranceId();
    const connected = Dungeon.getConnectedRooms(entranceId);

    TestRunner.assertArray(connected, 'Should return array');
    TestRunner.assert(connected.length > 0, 'Entrance should have connections');

    connected.forEach(room => {
      TestRunner.assertTruthy(room.id, 'Connected room should have id');
    });
  });

  TestRunner.test('clearRoom should mark room as cleared', () => {
    Dungeon.generate();
    const entranceId = Dungeon.getEntranceId();

    // Find a monster room
    const connected = Dungeon.getConnectedRooms(entranceId);
    const monsterRoom = connected.find(r => r.type === 'monster');

    if (monsterRoom) {
      TestRunner.assert(!Dungeon.isRoomCleared(monsterRoom.id), 'Monster room should not be cleared initially');

      Dungeon.clearRoom(monsterRoom.id);

      TestRunner.assert(Dungeon.isRoomCleared(monsterRoom.id), 'Monster room should be cleared after clearRoom');
    }
  });

  TestRunner.test('isBossRoom should identify boss room', () => {
    Dungeon.generate();
    const entranceId = Dungeon.getEntranceId();

    TestRunner.assert(Dungeon.isBossRoom(Dungeon.getBossId()), 'Boss ID should be boss room');
    TestRunner.assert(!Dungeon.isBossRoom(entranceId), 'Entrance should not be boss room');
  });

  TestRunner.test('hasMonsterEncounter should detect uncleared monster rooms', () => {
    Dungeon.generate();
    const entranceId = Dungeon.getEntranceId();
    const connected = Dungeon.getConnectedRooms(entranceId);
    const monsterRoom = connected.find(r => r.type === 'monster');

    if (monsterRoom) {
      TestRunner.assert(
        Dungeon.hasMonsterEncounter(monsterRoom.id),
        'Uncleared monster room should have encounter'
      );

      Dungeon.clearRoom(monsterRoom.id);

      TestRunner.assert(
        !Dungeon.hasMonsterEncounter(monsterRoom.id),
        'Cleared monster room should not have encounter'
      );
    }
  });

  TestRunner.test('getStats should return dungeon statistics', () => {
    Dungeon.generate();
    const stats = Dungeon.getStats();

    TestRunner.assert(stats.totalRooms > 20, 'Should have many rooms');
    TestRunner.assert(stats.monsterRooms >= 20, 'Should have at least 20 monster rooms');
    TestRunner.assert(stats.maxDepth > 10, 'Should have significant depth');
  });

  TestRunner.test('getDepthDifficulty should scale correctly', () => {
    TestRunner.assertEqual(Dungeon.getDepthDifficulty(1), 1, 'Shallow = easy');
    TestRunner.assertEqual(Dungeon.getDepthDifficulty(6), 2, 'Medium depth = medium');
    TestRunner.assertEqual(Dungeon.getDepthDifficulty(12), 3, 'Deep = hard');
  });

  TestRunner.test('getState and loadState should preserve dungeon', () => {
    Dungeon.generate();
    const originalStats = Dungeon.getStats();
    const originalEntrance = Dungeon.getEntranceId();
    const originalBoss = Dungeon.getBossId();

    // Clear a room
    const connected = Dungeon.getConnectedRooms(originalEntrance);
    if (connected[0]) {
      Dungeon.clearRoom(connected[0].id);
    }

    const state = Dungeon.getState();

    // Generate new dungeon
    Dungeon.generate();

    // Restore
    Dungeon.loadState(state);

    TestRunner.assertEqual(Dungeon.getEntranceId(), originalEntrance, 'Entrance ID should be preserved');
    TestRunner.assertEqual(Dungeon.getBossId(), originalBoss, 'Boss ID should be preserved');
    TestRunner.assertEqual(Dungeon.getStats().totalRooms, originalStats.totalRooms, 'Total rooms should be preserved');

    // Check if cleared state was preserved
    if (connected[0]) {
      TestRunner.assert(Dungeon.isRoomCleared(connected[0].id), 'Cleared status should be preserved');
    }
  });

  TestRunner.test('rooms should have descriptions and image prompts', () => {
    Dungeon.generate();
    const entranceId = Dungeon.getEntranceId();
    const entrance = Dungeon.getRoom(entranceId);
    const boss = Dungeon.getRoom(Dungeon.getBossId());

    TestRunner.assertTruthy(entrance.description, 'Entrance should have description');
    TestRunner.assertTruthy(entrance.imagePrompt, 'Entrance should have image prompt');
    TestRunner.assertTruthy(boss.description, 'Boss room should have description');
    TestRunner.assertTruthy(boss.imagePrompt, 'Boss room should have image prompt');
  });
});
