/**
 * Player Module Tests
 */

TestRunner.suite('Player Module', () => {
  TestRunner.test('create should initialize player with name', () => {
    const state = Player.create('TestPlayer');
    TestRunner.assertEqual(state.name, 'TestPlayer', 'Name should match');
    TestRunner.assertEqual(state.currentRoom, 'entrance', 'Should start at entrance');
    TestRunner.assertEqual(state.monstersDefeated, 0, 'Should start with 0 monsters defeated');
  });

  TestRunner.test('getName should return player name', () => {
    Player.create('John');
    TestRunner.assertEqual(Player.getName(), 'John', 'Should return correct name');
  });

  TestRunner.test('moveTo should update current and previous room', () => {
    Player.create('Test');
    Player.moveTo('room_1');
    TestRunner.assertEqual(Player.getCurrentRoom(), 'room_1', 'Current room should update');
    TestRunner.assertEqual(Player.getPreviousRoom(), 'entrance', 'Previous room should be entrance');

    Player.moveTo('room_2');
    TestRunner.assertEqual(Player.getCurrentRoom(), 'room_2', 'Current room should update again');
    TestRunner.assertEqual(Player.getPreviousRoom(), 'room_1', 'Previous room should update');
  });

  TestRunner.test('pushBack should swap current and previous room', () => {
    Player.create('Test');
    Player.moveTo('room_1');
    Player.pushBack();
    TestRunner.assertEqual(Player.getCurrentRoom(), 'entrance', 'Should be back at entrance');
    TestRunner.assertEqual(Player.getPreviousRoom(), 'room_1', 'Previous should be room_1');
  });

  TestRunner.test('addLoot should add items to inventory', () => {
    Player.create('Test');
    const loot = [
      { name: 'Gold Coin', value: 10 },
      { name: 'Ruby', value: 50 }
    ];
    Player.addLoot(loot);

    const inventory = Player.getInventory();
    TestRunner.assertEqual(inventory.length, 2, 'Should have 2 items');
    TestRunner.assertEqual(Player.getTotalLootValue(), 60, 'Total value should be 60');
  });

  TestRunner.test('defeatMonster should increment counter', () => {
    Player.create('Test');
    TestRunner.assertEqual(Player.getMonstersDefeated(), 0, 'Should start at 0');

    Player.defeatMonster();
    TestRunner.assertEqual(Player.getMonstersDefeated(), 1, 'Should be 1');

    Player.defeatMonster();
    TestRunner.assertEqual(Player.getMonstersDefeated(), 2, 'Should be 2');
  });

  TestRunner.test('recordQuestion should track correct and total', () => {
    Player.create('Test');

    Player.recordQuestion(true);
    Player.recordQuestion(true);
    Player.recordQuestion(false);

    const stats = Player.getQuestionStats();
    TestRunner.assertEqual(stats.correct, 2, 'Should have 2 correct');
    TestRunner.assertEqual(stats.total, 3, 'Should have 3 total');
    TestRunner.assertEqual(stats.percentage, 67, 'Should be 67%');
  });

  TestRunner.test('dragon streak should track consecutive correct answers', () => {
    Player.create('Test');

    TestRunner.assertEqual(Player.getDragonStreak(), 0, 'Should start at 0');

    Player.incrementDragonStreak();
    TestRunner.assertEqual(Player.getDragonStreak(), 1, 'Should be 1');

    Player.incrementDragonStreak();
    TestRunner.assertEqual(Player.getDragonStreak(), 2, 'Should be 2');

    Player.resetDragonStreak();
    TestRunner.assertEqual(Player.getDragonStreak(), 0, 'Should reset to 0');
  });

  TestRunner.test('isDragonDefeated should be true after 3 correct', () => {
    Player.create('Test');

    TestRunner.assert(!Player.isDragonDefeated(), 'Should not be defeated at start');

    Player.incrementDragonStreak();
    Player.incrementDragonStreak();
    TestRunner.assert(!Player.isDragonDefeated(), 'Should not be defeated at 2');

    Player.incrementDragonStreak();
    TestRunner.assert(Player.isDragonDefeated(), 'Should be defeated at 3');
  });

  TestRunner.test('exportState and loadState should preserve data', () => {
    Player.create('TestSave');
    Player.moveTo('room_5');
    Player.addLoot([{ name: 'Test Item', value: 100 }]);
    Player.defeatMonster();
    Player.recordQuestion(true);

    const exported = Player.exportState();

    // Reset and reload
    Player.reset();
    Player.loadState(exported);

    TestRunner.assertEqual(Player.getName(), 'TestSave', 'Name should be preserved');
    TestRunner.assertEqual(Player.getCurrentRoom(), 'room_5', 'Room should be preserved');
    TestRunner.assertEqual(Player.getInventory().length, 1, 'Inventory should be preserved');
    TestRunner.assertEqual(Player.getMonstersDefeated(), 1, 'Monsters defeated should be preserved');
  });

  TestRunner.test('getGameSummary should return complete stats', () => {
    Player.create('Summary Test');
    Player.defeatMonster();
    Player.defeatMonster();
    Player.recordQuestion(true);
    Player.recordQuestion(true);
    Player.recordQuestion(false);
    Player.addLoot([{ name: 'Gold', value: 50 }]);

    const summary = Player.getGameSummary();

    TestRunner.assertEqual(summary.name, 'Summary Test', 'Should have name');
    TestRunner.assertEqual(summary.monstersDefeated, 2, 'Should have monsters count');
    TestRunner.assertEqual(summary.questionsCorrect, 2, 'Should have correct count');
    TestRunner.assertEqual(summary.questionsTotal, 3, 'Should have total count');
    TestRunner.assertEqual(summary.accuracy, 67, 'Should have accuracy');
    TestRunner.assertEqual(summary.totalLoot, 50, 'Should have loot total');
  });
});
