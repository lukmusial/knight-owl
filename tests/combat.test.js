/**
 * Combat Module Tests
 */

TestRunner.suite('Combat Module', () => {
  // Setup before each test group
  function setup() {
    Questions.init();
    Questions.resetUsed();
    Player.create('CombatTester');
    Dungeon.generate();
    Combat.clearEncounter();
  }

  TestRunner.test('startEncounter should create encounter with question', () => {
    setup();

    const monster = { id: 'goblin', name: 'Goblin', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);

    TestRunner.assertTruthy(encounter, 'Should return encounter data');
    TestRunner.assertTruthy(encounter.monster, 'Should have monster');
    TestRunner.assertTruthy(encounter.question, 'Should have question');
    TestRunner.assertEqual(encounter.monster.id, 'goblin', 'Monster should match');
  });

  TestRunner.test('hasActiveEncounter should track encounter state', () => {
    setup();

    TestRunner.assert(!Combat.hasActiveEncounter(), 'Should not have active encounter initially');

    Combat.startEncounter({ id: 'test', name: 'Test', loot: [] }, 1);

    TestRunner.assert(Combat.hasActiveEncounter(), 'Should have active encounter after start');
  });

  TestRunner.test('getCurrentEncounter should return encounter data', () => {
    setup();

    Combat.startEncounter({ id: 'test', name: 'Test Monster', loot: [] }, 1);
    const current = Combat.getCurrentEncounter();

    TestRunner.assertTruthy(current, 'Should return current encounter');
    TestRunner.assertEqual(current.monster.name, 'Test Monster', 'Should have correct monster');
    TestRunner.assertTruthy(current.question, 'Should have question');
  });

  TestRunner.test('submitAnswer with correct answer should defeat monster', () => {
    setup();

    const monster = { id: 'goblin', name: 'Goblin', loot: [{ name: 'Gold', value: 10 }] };
    const encounter = Combat.startEncounter(monster, 1);

    // Submit correct answer
    const correctIndex = encounter.question.correctIndex;
    const result = Combat.submitAnswer(correctIndex);

    TestRunner.assert(result.success, 'Result should be success');
    TestRunner.assert(result.defeated, 'Monster should be defeated');
    TestRunner.assertTruthy(result.loot, 'Should have loot');
    TestRunner.assertTruthy(result.message, 'Should have victory message');
  });

  TestRunner.test('submitAnswer with wrong answer should push back', () => {
    setup();
    Player.moveTo('room_1'); // Move away from entrance

    const monster = { id: 'goblin', name: 'Goblin', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);

    // Submit wrong answer
    const wrongIndex = (encounter.question.correctIndex + 1) % 4;
    const result = Combat.submitAnswer(wrongIndex);

    TestRunner.assert(!result.success, 'Result should not be success');
    TestRunner.assert(result.pushedBack, 'Should be pushed back');
    TestRunner.assertTruthy(result.correctAnswer, 'Should show correct answer');
    TestRunner.assertTruthy(result.explanation, 'Should have explanation');
  });

  TestRunner.test('dragon encounter should require 3 correct answers', () => {
    setup();

    const dragon = { id: 'dragon', name: 'Dragon', loot: [{ name: 'Gold', value: 100 }] };
    const encounter = Combat.startEncounter(dragon, 3);

    TestRunner.assert(Combat.isDragonFight(), 'Should be dragon fight');
    TestRunner.assertEqual(encounter.dragonStreak, 0, 'Should start at 0 streak');

    // First correct answer
    const result1 = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assert(result1.success, 'First answer should succeed');
    TestRunner.assert(!result1.dragonDefeated, 'Dragon should not be defeated yet');
    TestRunner.assertEqual(result1.streak, 1, 'Streak should be 1');
    TestRunner.assertTruthy(result1.nextQuestion, 'Should have next question');

    // Second correct answer
    const result2 = Combat.submitAnswer(result1.nextQuestion.correctIndex);
    TestRunner.assert(result2.success, 'Second answer should succeed');
    TestRunner.assert(!result2.dragonDefeated, 'Dragon should not be defeated yet');
    TestRunner.assertEqual(result2.streak, 2, 'Streak should be 2');

    // Third correct answer
    const result3 = Combat.submitAnswer(result2.nextQuestion.correctIndex);
    TestRunner.assert(result3.success, 'Third answer should succeed');
    TestRunner.assert(result3.dragonDefeated, 'Dragon should be defeated');
    TestRunner.assertEqual(result3.streak, 3, 'Streak should be 3');
    TestRunner.assertTruthy(result3.loot, 'Should have dragon loot');
  });

  TestRunner.test('dragon wrong answer should reset streak', () => {
    setup();
    Player.moveTo('boss_room');

    const dragon = { id: 'dragon', name: 'Dragon', loot: [] };
    const encounter = Combat.startEncounter(dragon, 3);

    // Get one right
    Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assertEqual(Player.getDragonStreak(), 1, 'Streak should be 1');

    // Start new encounter (simulating re-entry)
    const encounter2 = Combat.startEncounter(dragon, 3);

    // Get one wrong
    const wrongIndex = (encounter2.question.correctIndex + 1) % 4;
    const result = Combat.submitAnswer(wrongIndex);

    TestRunner.assert(!result.success, 'Should fail');
    TestRunner.assertEqual(result.streak, 0, 'Streak should reset to 0');
    TestRunner.assert(result.pushedBack, 'Should be pushed back');
  });

  TestRunner.test('correct answer should record question correctly', () => {
    setup();

    const monster = { id: 'test', name: 'Test', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);

    Combat.submitAnswer(encounter.question.correctIndex);

    const stats = Player.getQuestionStats();
    TestRunner.assertEqual(stats.correct, 1, 'Should record correct answer');
    TestRunner.assertEqual(stats.total, 1, 'Should record total');
  });

  TestRunner.test('wrong answer should record question correctly', () => {
    setup();
    Player.moveTo('room_1');

    const monster = { id: 'test', name: 'Test', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);

    const wrongIndex = (encounter.question.correctIndex + 1) % 4;
    Combat.submitAnswer(wrongIndex);

    const stats = Player.getQuestionStats();
    TestRunner.assertEqual(stats.correct, 0, 'Should not record as correct');
    TestRunner.assertEqual(stats.total, 1, 'Should record total');
  });

  TestRunner.test('defeating monster should add loot to player', () => {
    setup();

    const monster = {
      id: 'rich_goblin',
      name: 'Rich Goblin',
      loot: [
        { name: 'Gold Coin', value: 50 },
        { name: 'Ruby', value: 100 }
      ]
    };

    const encounter = Combat.startEncounter(monster, 1);
    Combat.submitAnswer(encounter.question.correctIndex);

    const inventory = Player.getInventory();
    TestRunner.assertEqual(inventory.length, 2, 'Should have 2 loot items');
    TestRunner.assertEqual(Player.getTotalLootValue(), 150, 'Total loot should be 150');
  });

  TestRunner.test('getCombatStats should return summary', () => {
    setup();

    // Do some combat
    const monster = { id: 'test', name: 'Test', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);
    Combat.submitAnswer(encounter.question.correctIndex);

    const stats = Combat.getCombatStats();

    TestRunner.assertEqual(stats.monstersDefeated, 1, 'Should have 1 monster defeated');
    TestRunner.assertTruthy(stats.questionStats, 'Should have question stats');
    TestRunner.assertEqual(stats.questionStats.correct, 1, 'Should have 1 correct');
  });

  TestRunner.test('cancelEncounter should clear current encounter', () => {
    setup();

    Combat.startEncounter({ id: 'test', name: 'Test', loot: [] }, 1);
    TestRunner.assert(Combat.hasActiveEncounter(), 'Should have encounter');

    Combat.cancelEncounter();
    TestRunner.assert(!Combat.hasActiveEncounter(), 'Should not have encounter after cancel');
  });

  TestRunner.test('all monsters should have valid IDs for image paths', () => {
    // MONSTERS array should have IDs that can be used as image filenames
    TestRunner.assert(MONSTERS.length > 0, 'Should have monsters defined');

    MONSTERS.forEach(monster => {
      TestRunner.assertTruthy(monster.id, `Monster ${monster.name} should have an id`);
      TestRunner.assert(
        /^[a-z_]+$/.test(monster.id),
        `Monster id "${monster.id}" should be lowercase with underscores only`
      );
    });
  });
});
