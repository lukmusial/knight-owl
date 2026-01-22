/**
 * Integration Tests
 * Verifies complete game flow from start to victory
 */

TestRunner.suite('Integration: Complete Game Flow', () => {

  /**
   * Find shortest path from entrance to boss using BFS
   * @returns {Array} Array of room IDs from entrance to boss
   */
  function findPathToBoss() {
    const visited = new Set();
    const queue = [[Dungeon.getEntranceId()]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === Dungeon.getBossId()) {
        return path;
      }

      if (visited.has(current)) continue;
      visited.add(current);

      const connections = Dungeon.getConnectedRooms(current);
      for (const nextRoom of connections) {
        if (!visited.has(nextRoom.id)) {
          queue.push([...path, nextRoom.id]);
        }
      }
    }

    return null;
  }

  /**
   * Simulate entering a room and defeating any monster
   * @param {string} roomId - Room to enter
   * @returns {Object} Result of room entry
   */
  function enterRoomAndDefeatMonster(roomId) {
    Player.moveTo(roomId);
    const room = Dungeon.getRoom(roomId);

    if (!Dungeon.hasMonsterEncounter(roomId)) {
      return { entered: true, hadMonster: false };
    }

    // Start combat and answer correctly
    const encounter = Combat.startEncounter(room.monster, Dungeon.getDepthDifficulty(room.depth));
    const result = Combat.submitAnswer(encounter.question.correctIndex);

    if (result.defeated) {
      Dungeon.clearRoom(roomId);
    }

    return {
      entered: true,
      hadMonster: true,
      defeated: result.defeated,
      loot: result.loot
    };
  }

  /**
   * Defeat the dragon boss with 3 correct answers
   * @returns {Object} Result of dragon fight
   */
  function defeatDragon() {
    const bossRoom = Dungeon.getRoom(Dungeon.getBossId());
    Player.moveTo(Dungeon.getBossId());

    // Start dragon encounter
    let encounter = Combat.startEncounter(bossRoom.monster, 3);

    // Answer 3 questions correctly
    for (let i = 0; i < 3; i++) {
      const result = Combat.submitAnswer(encounter.question.correctIndex);

      if (result.dragonDefeated) {
        Dungeon.clearRoom(Dungeon.getBossId());
        return {
          success: true,
          questionsAnswered: i + 1,
          loot: result.loot
        };
      }

      if (result.nextQuestion) {
        encounter = { question: result.nextQuestion };
      }
    }

    return { success: false };
  }

  // Setup fresh game state
  function setupGame() {
    Questions.init();
    Questions.resetUsed();
    Player.create('IntegrationTester');
    Dungeon.generate();
    Combat.clearEncounter();
  }

  TestRunner.test('Player can navigate from entrance to boss room', () => {
    setupGame();

    const path = findPathToBoss();

    TestRunner.assertTruthy(path, 'Path to boss should exist');
    TestRunner.assertEqual(path[0], Dungeon.getEntranceId(), 'Path should start at entrance');
    TestRunner.assertEqual(path[path.length - 1], Dungeon.getBossId(), 'Path should end at boss');
    TestRunner.assert(path.length >= 2, 'Path should have at least 2 rooms');
  });

  TestRunner.test('Player can defeat all monsters on path to boss', () => {
    setupGame();

    const path = findPathToBoss();
    let monstersDefeated = 0;

    // Navigate through each room (skip entrance, stop before boss)
    for (let i = 1; i < path.length - 1; i++) {
      const result = enterRoomAndDefeatMonster(path[i]);

      TestRunner.assert(result.entered, `Should enter room ${i}`);

      if (result.hadMonster) {
        TestRunner.assert(result.defeated, `Should defeat monster in room ${i}`);
        monstersDefeated++;
      }
    }

    TestRunner.assert(monstersDefeated >= 1, 'Should have defeated at least one monster');
  });

  TestRunner.test('Player can defeat the dragon boss with 3 correct answers', () => {
    setupGame();

    // Navigate to boss room first
    const path = findPathToBoss();
    for (let i = 1; i < path.length - 1; i++) {
      enterRoomAndDefeatMonster(path[i]);
    }

    // Fight dragon
    const dragonResult = defeatDragon();

    TestRunner.assert(dragonResult.success, 'Should defeat dragon');
    TestRunner.assertEqual(dragonResult.questionsAnswered, 3, 'Should answer exactly 3 questions');
    TestRunner.assertTruthy(dragonResult.loot, 'Should receive dragon loot');
  });

  TestRunner.test('Complete game: start to victory with stats tracking', () => {
    setupGame();

    const initialStats = Player.getQuestionStats();
    TestRunner.assertEqual(initialStats.total, 0, 'Should start with 0 questions');

    // Find path and clear all rooms
    const path = findPathToBoss();
    let totalMonstersDefeated = 0;
    let totalLootValue = 0;

    // Clear path to boss
    for (let i = 1; i < path.length - 1; i++) {
      const result = enterRoomAndDefeatMonster(path[i]);
      if (result.hadMonster && result.defeated) {
        totalMonstersDefeated++;
        if (result.loot) {
          result.loot.forEach(item => totalLootValue += item.value);
        }
      }
    }

    // Defeat dragon
    const dragonResult = defeatDragon();
    TestRunner.assert(dragonResult.success, 'Dragon should be defeated');
    totalMonstersDefeated++; // Dragon counts as a monster

    // Verify final stats
    const finalStats = Player.getQuestionStats();
    TestRunner.assert(finalStats.total >= totalMonstersDefeated,
      'Total questions should be at least equal to monsters defeated');
    TestRunner.assertEqual(finalStats.correct, finalStats.total,
      'All answers should be correct (we always picked correct)');
    TestRunner.assertEqual(finalStats.percentage, 100,
      'Accuracy should be 100%');

    // Verify boss room is cleared
    TestRunner.assert(Dungeon.isRoomCleared(Dungeon.getBossId()),
      'Boss room should be cleared');
  });

  TestRunner.test('Game generates dungeon with minimum 20 monster encounters', () => {
    setupGame();

    const stats = Dungeon.getStats();

    TestRunner.assert(stats.monsterRooms >= 20,
      `Should have at least 20 monster rooms, got ${stats.monsterRooms}`);
    TestRunner.assert(stats.totalRooms >= 22,
      `Should have at least 22 total rooms (20 monsters + entrance + boss), got ${stats.totalRooms}`);
  });

  TestRunner.test('Wrong answer pushes player back but game can still be completed', () => {
    setupGame();

    const path = findPathToBoss();

    // Enter first monster room
    let firstMonsterRoom = null;
    for (let i = 1; i < path.length - 1; i++) {
      if (Dungeon.hasMonsterEncounter(path[i])) {
        firstMonsterRoom = path[i];
        break;
      }
    }

    if (firstMonsterRoom) {
      // Move to monster room
      Player.moveTo(firstMonsterRoom);
      const previousRoom = Player.getPreviousRoom();

      // Start encounter and answer wrong
      const room = Dungeon.getRoom(firstMonsterRoom);
      const encounter = Combat.startEncounter(room.monster, 1);
      const wrongIndex = (encounter.question.correctIndex + 1) % 4;
      const wrongResult = Combat.submitAnswer(wrongIndex);

      TestRunner.assert(!wrongResult.success, 'Wrong answer should fail');
      TestRunner.assert(wrongResult.pushedBack, 'Should be pushed back');
      TestRunner.assertEqual(Player.getCurrentRoom(), previousRoom,
        'Should be back in previous room');

      // Re-enter and answer correctly this time
      Player.moveTo(firstMonsterRoom);
      const encounter2 = Combat.startEncounter(room.monster, 1);
      const correctResult = Combat.submitAnswer(encounter2.question.correctIndex);

      TestRunner.assert(correctResult.success, 'Correct answer should succeed');
      TestRunner.assert(correctResult.defeated, 'Monster should be defeated');
    }

    // Continue to complete game
    for (let i = 1; i < path.length - 1; i++) {
      if (Dungeon.hasMonsterEncounter(path[i])) {
        enterRoomAndDefeatMonster(path[i]);
      }
    }

    const dragonResult = defeatDragon();
    TestRunner.assert(dragonResult.success, 'Should still be able to defeat dragon');
  });

  TestRunner.test('Dragon streak resets on wrong answer but game continues', () => {
    setupGame();

    // Clear path to boss first
    const path = findPathToBoss();
    for (let i = 1; i < path.length - 1; i++) {
      enterRoomAndDefeatMonster(path[i]);
    }

    // Enter boss room
    Player.moveTo(Dungeon.getBossId());
    const bossRoom = Dungeon.getRoom(Dungeon.getBossId());

    // Get 2 correct answers
    let encounter = Combat.startEncounter(bossRoom.monster, 3);
    Combat.submitAnswer(encounter.question.correctIndex);

    const enc2Question = Combat.getCurrentEncounter().question;
    const result2 = Combat.submitAnswer(enc2Question.correctIndex);
    TestRunner.assertEqual(result2.streak, 2, 'Should have streak of 2');

    // Get wrong answer - streak resets
    const enc3Question = result2.nextQuestion;
    const wrongIndex = (enc3Question.correctIndex + 1) % 4;
    const wrongResult = Combat.submitAnswer(wrongIndex);

    TestRunner.assert(wrongResult.pushedBack, 'Should be pushed back');
    TestRunner.assertEqual(wrongResult.streak, 0, 'Streak should reset to 0');

    // Return and defeat dragon properly
    const dragonResult = defeatDragon();
    TestRunner.assert(dragonResult.success, 'Should be able to defeat dragon after retry');
  });

  TestRunner.test('Player accumulates loot throughout the game', () => {
    setupGame();

    TestRunner.assertEqual(Player.getTotalLootValue(), 0, 'Should start with no loot');
    TestRunner.assertEqual(Player.getInventory().length, 0, 'Inventory should be empty');

    const path = findPathToBoss();

    // Clear all monsters
    for (let i = 1; i < path.length - 1; i++) {
      enterRoomAndDefeatMonster(path[i]);
    }

    // Defeat dragon
    defeatDragon();

    // Should have accumulated loot
    const finalLoot = Player.getTotalLootValue();
    const inventory = Player.getInventory();

    TestRunner.assert(finalLoot > 0, `Should have accumulated loot, got ${finalLoot}`);
    TestRunner.assert(inventory.length > 0, 'Should have items in inventory');
  });

  TestRunner.test('Game can be saved and loaded mid-playthrough', () => {
    setupGame();

    const path = findPathToBoss();

    // Clear some rooms
    const midPoint = Math.floor((path.length - 1) / 2);
    for (let i = 1; i <= midPoint; i++) {
      enterRoomAndDefeatMonster(path[i]);
    }

    const currentRoom = Player.getCurrentRoom();
    const monstersBeforeSave = Player.getMonstersDefeated();
    const lootBeforeSave = Player.getTotalLootValue();

    // Save game
    const saveSuccess = Save.saveGame(
      Player.exportState(),
      Dungeon.getState(),
      Questions.getUsedIds()
    );
    TestRunner.assert(saveSuccess, 'Save should succeed');

    // Reset everything
    Questions.resetUsed();
    Player.create('DifferentPlayer');
    Dungeon.generate();

    // Load saved game
    const loadedData = Save.loadGame('IntegrationTester');
    TestRunner.assertTruthy(loadedData, 'Should load saved data');

    Player.loadState(loadedData.player);
    Dungeon.loadState(loadedData.dungeon);
    Questions.setUsedIds(loadedData.usedQuestions);

    // Verify state restored
    TestRunner.assertEqual(Player.getCurrentRoom(), currentRoom,
      'Current room should be restored');
    TestRunner.assertEqual(Player.getMonstersDefeated(), monstersBeforeSave,
      'Monsters defeated should be restored');
    TestRunner.assertEqual(Player.getTotalLootValue(), lootBeforeSave,
      'Loot value should be restored');

    // Continue and complete the game
    const newPath = findPathToBoss();
    for (let i = 1; i < newPath.length - 1; i++) {
      if (Dungeon.hasMonsterEncounter(newPath[i])) {
        enterRoomAndDefeatMonster(newPath[i]);
      }
    }

    const dragonResult = defeatDragon();
    TestRunner.assert(dragonResult.success, 'Should complete game after loading');

    // Cleanup
    Save.deleteSave('IntegrationTester');
  });
});
