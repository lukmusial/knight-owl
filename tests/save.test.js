/**
 * Save Module Tests
 */

TestRunner.suite('Save Module', () => {
  // Clean up before tests
  Save.clearAllSaves();

  TestRunner.test('isStorageAvailable should return true in browser', () => {
    TestRunner.assert(Save.isStorageAvailable(), 'localStorage should be available');
  });

  TestRunner.test('saveGame should store game data', () => {
    const playerState = {
      name: 'TestSavePlayer',
      currentRoom: 'room_1',
      inventory: [],
      monstersDefeated: 5
    };

    const dungeonState = {
      rooms: { entrance: { id: 'entrance' } },
      entranceId: 'entrance',
      bossId: 'boss'
    };

    const success = Save.saveGame(playerState, dungeonState, ['q1', 'q2']);
    TestRunner.assert(success, 'Save should succeed');
  });

  TestRunner.test('hasSave should detect existing saves', () => {
    TestRunner.assert(Save.hasSave('TestSavePlayer'), 'Should find existing save');
    TestRunner.assert(!Save.hasSave('NonExistentPlayer'), 'Should not find non-existent save');
  });

  TestRunner.test('loadGame should retrieve saved data', () => {
    const data = Save.loadGame('TestSavePlayer');

    TestRunner.assertTruthy(data, 'Should return data');
    TestRunner.assertEqual(data.player.name, 'TestSavePlayer', 'Player name should match');
    TestRunner.assertEqual(data.player.monstersDefeated, 5, 'Monsters defeated should match');
    TestRunner.assertArray(data.usedQuestions, 'Should have used questions array');
    TestRunner.assertEqual(data.usedQuestions.length, 2, 'Should have 2 used questions');
  });

  TestRunner.test('listSaves should return all saves', () => {
    // Add another save
    Save.saveGame(
      { name: 'AnotherPlayer', currentRoom: 'room_2', inventory: [], monstersDefeated: 3 },
      { rooms: {}, entranceId: 'entrance', bossId: 'boss' },
      []
    );

    const saves = Save.listSaves();
    TestRunner.assertArray(saves, 'Should return array');
    TestRunner.assert(saves.length >= 2, 'Should have at least 2 saves');

    const names = saves.map(s => s.name.toLowerCase());
    TestRunner.assert(names.includes('testsaveplayer'), 'Should include TestSavePlayer');
    TestRunner.assert(names.includes('anotherplayer'), 'Should include AnotherPlayer');
  });

  TestRunner.test('deleteSave should remove save', () => {
    TestRunner.assert(Save.hasSave('AnotherPlayer'), 'Save should exist before delete');

    Save.deleteSave('AnotherPlayer');

    TestRunner.assert(!Save.hasSave('AnotherPlayer'), 'Save should not exist after delete');
  });

  TestRunner.test('loadGame should return null for non-existent save', () => {
    const data = Save.loadGame('NonExistentPlayer123');
    TestRunner.assert(data === null, 'Should return null');
  });

  TestRunner.test('exportAllData should return JSON string', () => {
    const json = Save.exportAllData();
    TestRunner.assertTruthy(json, 'Should return string');

    // Should be valid JSON
    const parsed = JSON.parse(json);
    TestRunner.assertTruthy(parsed, 'Should be valid JSON');
  });

  TestRunner.test('importData should restore saves', () => {
    // Export current saves
    const exported = Save.exportAllData();

    // Clear all
    Save.clearAllSaves();
    TestRunner.assertEqual(Save.listSaves().length, 0, 'Should have no saves after clear');

    // Import back
    Save.importData(exported);

    // Check if restored
    TestRunner.assert(Save.listSaves().length > 0, 'Should have saves after import');
  });

  // Clean up after tests
  Save.clearAllSaves();
});
