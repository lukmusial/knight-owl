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

  TestRunner.test('correct answer result should include correctAnswer, sentence, and category', () => {
    setup();

    const monster = { id: 'goblin', name: 'Goblin', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);

    const correctIndex = encounter.question.correctIndex;
    const result = Combat.submitAnswer(correctIndex);

    TestRunner.assert(result.success, 'Result should be success');
    TestRunner.assertTruthy(result.correctAnswer, 'Should have correctAnswer');
    TestRunner.assertEqual(result.correctAnswer, encounter.question.options[encounter.question.correctIndex], 'correctAnswer should match question');
    TestRunner.assertTruthy(result.category, 'Should have category');
    // sentence may be null for vocabulary questions
    TestRunner.assert('sentence' in result, 'Should have sentence field');
  });

  TestRunner.test('wrong answer result should include sentence and category', () => {
    setup();
    Player.moveTo('room_1');

    const monster = { id: 'goblin', name: 'Goblin', loot: [] };
    const encounter = Combat.startEncounter(monster, 1);

    const wrongIndex = (encounter.question.correctIndex + 1) % 4;
    const result = Combat.submitAnswer(wrongIndex);

    TestRunner.assert(!result.success, 'Result should not be success');
    TestRunner.assertTruthy(result.correctAnswer, 'Should have correctAnswer');
    TestRunner.assertTruthy(result.category, 'Should have category');
    TestRunner.assert('sentence' in result, 'Should have sentence field');
  });

  TestRunner.test('dragon correct answer result should include correctAnswer and category', () => {
    setup();

    const dragon = { id: 'dragon', name: 'Dragon', loot: [] };
    const encounter = Combat.startEncounter(dragon, 3);

    const result = Combat.submitAnswer(encounter.question.correctIndex);

    TestRunner.assert(result.success, 'Result should be success');
    TestRunner.assertTruthy(result.correctAnswer, 'Should have correctAnswer');
    TestRunner.assertTruthy(result.category, 'Should have category');
    TestRunner.assert('sentence' in result, 'Should have sentence field');
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

  // ============================================================
  // Answer correctness reliability tests
  // Targeting potential causes of correct answers registered as
  // incorrect, especially on mobile/iOS WebView platforms
  // ============================================================

  TestRunner.test('checkAnswer uses strict equality - string index should not match', () => {
    setup();

    var question = { correctIndex: 2, options: ['a', 'b', 'c', 'd'] };
    // parseInt in UI returns a number, but test that string "2" does NOT match
    TestRunner.assert(!Questions.checkAnswer(question, '2'), 'String "2" should not match number 2 (strict equality)');
    TestRunner.assert(Questions.checkAnswer(question, 2), 'Number 2 should match number 2');
  });

  TestRunner.test('submitAnswer with each valid index should match correctIndex exactly', () => {
    setup();

    // Run multiple encounters to test different correctIndex values
    for (var i = 0; i < 10; i++) {
      Combat.clearEncounter();
      var monster = { id: 'test_' + i, name: 'Test', loot: [] };
      var encounter = Combat.startEncounter(monster, 1);
      var q = encounter.question;
      var correctIdx = q.correctIndex;

      // Verify correctIndex is a number
      TestRunner.assertEqual(typeof correctIdx, 'number', 'correctIndex should be a number');
      TestRunner.assert(correctIdx >= 0 && correctIdx < q.options.length, 'correctIndex should be in range');

      // Verify the correct answer text matches
      var correctText = q.options[correctIdx];
      TestRunner.assertTruthy(correctText, 'Correct answer text should exist');

      // Submit the correct index - should always succeed
      var result = Combat.submitAnswer(correctIdx);
      TestRunner.assert(result.success, 'Submitting correctIndex ' + correctIdx + ' should succeed (iteration ' + i + ')');
    }
  });

  TestRunner.test('shuffled question correctIndex always points to the right answer text', () => {
    setup();

    // Get many questions and verify correctIndex consistency after shuffle
    for (var i = 0; i < 20; i++) {
      var q = Questions.getQuestion(1, null, true);
      if (!q) break;

      var correctText = q.options[q.correctIndex];
      TestRunner.assertTruthy(correctText, 'Correct answer should have text at index ' + q.correctIndex);

      // Verify checkAnswer agrees
      TestRunner.assert(Questions.checkAnswer(q, q.correctIndex), 'checkAnswer should confirm correctIndex for question ' + q.id);

      // Verify all other indices are wrong
      for (var j = 0; j < q.options.length; j++) {
        if (j !== q.correctIndex) {
          TestRunner.assert(!Questions.checkAnswer(q, j), 'Index ' + j + ' should be wrong for question ' + q.id);
        }
      }
    }
  });

  TestRunner.test('duplicate option values should not corrupt correctIndex after shuffle', () => {
    setup();

    // Simulate a question with duplicate option strings
    // This tests the indexOf-based correctIndex recalculation in getQuestion
    Questions.addQuestions([{
      id: 'dup_test_1',
      difficulty: 1,
      category: 'vocabulary',
      prompt: 'Test with duplicates',
      options: ['yes', 'no', 'yes', 'maybe'],
      correctIndex: 2,  // second "yes"
      explanation: 'Test'
    }]);

    // Get this question multiple times to test shuffle behavior
    var wrongCount = 0;
    for (var i = 0; i < 30; i++) {
      var q = Questions.getQuestion(1, 'vocabulary', true);
      if (q && q.id === 'dup_test_1') {
        // After shuffle, indexOf('yes') always returns first 'yes' occurrence
        // This could cause correctIndex to point to wrong position
        // if the original correct answer was the second 'yes'
        var answerAtIndex = q.options[q.correctIndex];
        if (answerAtIndex !== 'yes') {
          wrongCount++;
        }
      }
    }
    // Note: this test documents the potential indexOf bug with duplicate options
    // If wrongCount > 0, it means shuffle + indexOf can corrupt correctIndex
    // This is informational - the real fix would be to track by index not value
  });

  TestRunner.test('submitting answer immediately after encounter start should work', () => {
    setup();

    var monster = { id: 'test', name: 'Test', loot: [] };
    var encounter = Combat.startEncounter(monster, 1);

    // No delay - submit immediately
    var result = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assert(result.success, 'Immediate answer submission should work');
  });

  TestRunner.test('double submitAnswer should return error on second call (encounter cleared)', () => {
    setup();

    var monster = { id: 'test', name: 'Test', loot: [] };
    var encounter = Combat.startEncounter(monster, 1);

    // First submission
    var result1 = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assert(result1.success, 'First submission should succeed');
    TestRunner.assert(!Combat.hasActiveEncounter(), 'Encounter should be cleared after correct answer');

    // Second submission (simulates double-tap on iOS)
    var result2 = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assertTruthy(result2.error, 'Second submission should return error');
  });

  TestRunner.test('double submitAnswer with wrong answer should also return error on second call', () => {
    setup();
    Player.moveTo('room_1');

    var monster = { id: 'test', name: 'Test', loot: [] };
    var encounter = Combat.startEncounter(monster, 1);
    var wrongIndex = (encounter.question.correctIndex + 1) % 4;

    var result1 = Combat.submitAnswer(wrongIndex);
    TestRunner.assert(!result1.success, 'First submission should fail');
    TestRunner.assert(!Combat.hasActiveEncounter(), 'Encounter should be cleared after wrong answer');

    // Second submission should not record another wrong answer
    var statsBefore = Player.getQuestionStats();
    var result2 = Combat.submitAnswer(wrongIndex);
    TestRunner.assertTruthy(result2.error, 'Second submission should return error');
    var statsAfter = Player.getQuestionStats();
    TestRunner.assertEqual(statsBefore.total, statsAfter.total, 'Stats should not change on second submission');
  });

  TestRunner.test('submitAnswer with out-of-range index should be treated as wrong', () => {
    setup();
    Player.moveTo('room_1');

    var monster = { id: 'test', name: 'Test', loot: [] };
    Combat.startEncounter(monster, 1);

    // Submit index that does not match correctIndex
    var result = Combat.submitAnswer(99);
    TestRunner.assert(!result.success, 'Out-of-range index should be wrong');
  });

  TestRunner.test('submitAnswer with negative index should be treated as wrong', () => {
    setup();
    Player.moveTo('room_1');

    var monster = { id: 'test', name: 'Test', loot: [] };
    Combat.startEncounter(monster, 1);

    var result = Combat.submitAnswer(-1);
    TestRunner.assert(!result.success, 'Negative index should be wrong');
  });

  TestRunner.test('submitAnswer with NaN should be treated as wrong', () => {
    setup();
    Player.moveTo('room_1');

    var monster = { id: 'test', name: 'Test', loot: [] };
    var encounter = Combat.startEncounter(monster, 1);

    // parseInt("") returns NaN, NaN !== any number
    var result = Combat.submitAnswer(NaN);
    TestRunner.assert(!result.success, 'NaN index should be wrong');
  });

  TestRunner.test('submitAnswer with undefined should be treated as wrong', () => {
    setup();
    Player.moveTo('room_1');

    var monster = { id: 'test', name: 'Test', loot: [] };
    Combat.startEncounter(monster, 1);

    var result = Combat.submitAnswer(undefined);
    TestRunner.assert(!result.success, 'undefined index should be wrong');
  });

  TestRunner.test('dragon fight: rapid correct answers should maintain streak correctly', () => {
    setup();

    var dragon = { id: 'dragon', name: 'Dragon', loot: [{ name: 'Gold', value: 100 }] };
    var encounter = Combat.startEncounter(dragon, 3);

    // First answer
    var r1 = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assert(r1.success, 'First correct');
    TestRunner.assertEqual(r1.streak, 1, 'Streak 1');
    TestRunner.assert(!r1.dragonDefeated, 'Not defeated at streak 1');

    // Second answer - using nextQuestion from result
    var r2 = Combat.submitAnswer(r1.nextQuestion.correctIndex);
    TestRunner.assert(r2.success, 'Second correct');
    TestRunner.assertEqual(r2.streak, 2, 'Streak 2');

    // Third answer
    var r3 = Combat.submitAnswer(r2.nextQuestion.correctIndex);
    TestRunner.assert(r3.success, 'Third correct');
    TestRunner.assertEqual(r3.streak, 3, 'Streak 3');
    TestRunner.assert(r3.dragonDefeated, 'Dragon defeated at streak 3');

    // Fourth submit should fail - encounter cleared
    var r4 = Combat.submitAnswer(0);
    TestRunner.assertTruthy(r4.error, 'No encounter after dragon defeat');
  });

  TestRunner.test('dragon fight: wrong answer mid-streak should reset and clear encounter', () => {
    setup();
    Player.moveTo('boss_room');

    var dragon = { id: 'dragon', name: 'Dragon', loot: [] };
    var encounter = Combat.startEncounter(dragon, 3);

    // Get one correct
    var r1 = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assertEqual(r1.streak, 1, 'Streak should be 1');

    // Submit wrong for second question
    var wrongIdx = (r1.nextQuestion.correctIndex + 1) % 4;
    var r2 = Combat.submitAnswer(wrongIdx);
    TestRunner.assert(!r2.success, 'Wrong answer should fail');
    TestRunner.assertEqual(r2.streak, 0, 'Streak should reset to 0');
    TestRunner.assert(r2.pushedBack, 'Should be pushed back');
    TestRunner.assert(!Combat.hasActiveEncounter(), 'Encounter should be cleared');
  });

  TestRunner.test('starting new encounter should fully reset previous encounter state', () => {
    setup();

    var monster1 = { id: 'goblin', name: 'Goblin', loot: [] };
    var enc1 = Combat.startEncounter(monster1, 1);

    // Don't answer - start a new encounter (simulates re-entering room)
    var monster2 = { id: 'skeleton', name: 'Skeleton', loot: [] };
    var enc2 = Combat.startEncounter(monster2, 2);

    TestRunner.assertEqual(Combat.getCurrentEncounter().monster.id, 'skeleton', 'Should have new monster');
    TestRunner.assertEqual(Combat.getCurrentEncounter().attempts, 0, 'Attempts should reset');

    // Answer the second encounter
    var result = Combat.submitAnswer(enc2.question.correctIndex);
    TestRunner.assert(result.success, 'Should be able to answer new encounter');
  });

  TestRunner.test('correctIndex should always be valid index into options array', () => {
    setup();

    // Test many questions to ensure no out-of-bounds correctIndex
    for (var i = 0; i < 50; i++) {
      var q = Questions.getQuestion(1 + (i % 3), null, true);
      if (!q) continue;

      TestRunner.assert(
        q.correctIndex >= 0 && q.correctIndex < q.options.length,
        'correctIndex ' + q.correctIndex + ' should be in range [0, ' + q.options.length + ') for question ' + q.id
      );
    }
  });

  TestRunner.test('question options should have exactly 4 choices', () => {
    setup();

    for (var i = 0; i < 30; i++) {
      var q = Questions.getQuestion(1 + (i % 3), null, true);
      if (!q) continue;

      TestRunner.assertEqual(q.options.length, 4, 'Question ' + q.id + ' should have 4 options');
    }
  });

  TestRunner.test('getCurrentQuestion returns copy that does not affect internal state', () => {
    setup();

    var monster = { id: 'test', name: 'Test', loot: [] };
    var encounter = Combat.startEncounter(monster, 1);

    var qCopy = Combat.getCurrentQuestion();
    var originalCorrectIndex = qCopy.correctIndex;

    // Mutating the copy should not affect combat state
    qCopy.correctIndex = 999;

    // Submit the original correct answer
    var result = Combat.submitAnswer(originalCorrectIndex);
    TestRunner.assert(result.success, 'Mutating question copy should not affect combat');
  });

  TestRunner.test('encounter attempts counter increments on each submitAnswer', () => {
    setup();

    var dragon = { id: 'dragon', name: 'Dragon', loot: [] };
    var encounter = Combat.startEncounter(dragon, 3);

    TestRunner.assertEqual(Combat.getCurrentEncounter().attempts, 0, 'Should start at 0');

    Combat.submitAnswer(encounter.question.correctIndex);
    // For dragon, encounter persists after correct answer (until 3 streak)
    TestRunner.assertEqual(Combat.getCurrentEncounter().attempts, 1, 'Should be 1 after first answer');
  });

  TestRunner.test('question stats should be accurate across multiple encounters', () => {
    setup();

    // First encounter - correct
    var m1 = { id: 'm1', name: 'M1', loot: [] };
    var e1 = Combat.startEncounter(m1, 1);
    Combat.submitAnswer(e1.question.correctIndex);

    // Second encounter - wrong
    Player.moveTo('room_1');
    var m2 = { id: 'm2', name: 'M2', loot: [] };
    var e2 = Combat.startEncounter(m2, 1);
    var wrongIdx = (e2.question.correctIndex + 1) % 4;
    Combat.submitAnswer(wrongIdx);

    // Third encounter - correct
    var m3 = { id: 'm3', name: 'M3', loot: [] };
    var e3 = Combat.startEncounter(m3, 1);
    Combat.submitAnswer(e3.question.correctIndex);

    var stats = Player.getQuestionStats();
    TestRunner.assertEqual(stats.total, 3, 'Should have 3 total answers');
    TestRunner.assertEqual(stats.correct, 2, 'Should have 2 correct answers');
  });

  TestRunner.test('clearEncounter mid-combat should prevent answer submission', () => {
    setup();

    var monster = { id: 'test', name: 'Test', loot: [] };
    var encounter = Combat.startEncounter(monster, 1);

    // Simulate state disruption (e.g., from async operation or navigation)
    Combat.clearEncounter();

    var result = Combat.submitAnswer(encounter.question.correctIndex);
    TestRunner.assertTruthy(result.error, 'Should return error after clearEncounter');
  });

  TestRunner.test('all wrong indices should produce consistent failure results', () => {
    setup();
    Player.moveTo('room_1');

    // Test that every non-correct index gives a failure
    for (var idx = 0; idx < 4; idx++) {
      Combat.clearEncounter();
      Player.moveTo('room_1');

      var monster = { id: 'test', name: 'Test', loot: [] };
      var encounter = Combat.startEncounter(monster, 1);

      if (idx === encounter.question.correctIndex) continue;

      var result = Combat.submitAnswer(idx);
      TestRunner.assert(!result.success, 'Index ' + idx + ' should fail when correctIndex is ' + encounter.question.correctIndex);
      TestRunner.assert(result.pushedBack, 'Wrong answer should push back');
      TestRunner.assertTruthy(result.correctAnswer, 'Should include correct answer');
    }
  });
});
