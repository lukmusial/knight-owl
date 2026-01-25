/**
 * Combat Module
 * Handles monster encounters and quiz-based combat
 */

const Combat = (function() {
  // Current combat state
  let currentEncounter = null;
  let currentQuestion = null;
  let dragonPhase = false;

  /**
   * Start a monster encounter
   * @param {Object} monster - Monster object from room
   * @param {number} difficulty - Difficulty level based on depth
   * @returns {Object} Encounter data
   */
  function startEncounter(monster, difficulty) {
    dragonPhase = monster.id === 'dragon';

    currentEncounter = {
      monster: monster,
      difficulty: difficulty,
      started: Date.now(),
      attempts: 0
    };

    // Get a question for this encounter
    currentQuestion = dragonPhase
      ? Questions.getDragonQuestion()
      : Questions.getQuestion(difficulty);

    return {
      monster: monster,
      question: currentQuestion,
      isDragon: dragonPhase,
      dragonStreak: dragonPhase ? Player.getDragonStreak() : 0
    };
  }

  /**
   * Submit an answer to the current question
   * @param {number} answerIndex - Index of selected answer
   * @returns {Object} Result of the answer
   */
  function submitAnswer(answerIndex) {
    if (!currentQuestion || !currentEncounter) {
      return { error: 'No active encounter' };
    }

    currentEncounter.attempts++;

    const isCorrect = Questions.checkAnswer(currentQuestion, answerIndex);

    // Record question attempt
    Player.recordQuestion(isCorrect);

    if (isCorrect) {
      return handleCorrectAnswer();
    } else {
      return handleWrongAnswer();
    }
  }

  /**
   * Handle a correct answer
   * @returns {Object} Success result
   */
  function handleCorrectAnswer() {
    const monster = currentEncounter.monster;

    if (dragonPhase) {
      // Dragon encounter - need 3 correct in a row
      const streak = Player.incrementDragonStreak();

      if (streak >= 3) {
        // Dragon defeated!
        const loot = monster.loot || [];
        Player.addLoot(loot);
        Player.defeatMonster();

        const result = {
          success: true,
          dragonDefeated: true,
          streak: streak,
          loot: loot,
          message: Descriptions.generateVictoryMessage(monster),
          explanation: currentQuestion.explanation
        };

        clearEncounter();
        return result;
      } else {
        // Need more correct answers
        // Get next dragon question
        currentQuestion = Questions.getDragonQuestion();

        return {
          success: true,
          dragonDefeated: false,
          streak: streak,
          message: Descriptions.generateDragonText(streak),
          explanation: currentQuestion ? '' : 'Well done!',
          nextQuestion: currentQuestion
        };
      }
    } else {
      // Regular monster - one correct answer defeats it
      const loot = monster.loot || [];
      Player.addLoot(loot);
      Player.defeatMonster();

      // Mark room as cleared
      const currentRoom = Player.getCurrentRoom();
      Dungeon.clearRoom(currentRoom);

      const result = {
        success: true,
        defeated: true,
        loot: loot,
        message: Descriptions.generateVictoryMessage(monster),
        explanation: currentQuestion.explanation
      };

      clearEncounter();
      return result;
    }
  }

  /**
   * Handle a wrong answer
   * @returns {Object} Failure result
   */
  function handleWrongAnswer() {
    if (dragonPhase) {
      // Reset dragon streak
      Player.resetDragonStreak();

      // Push player back
      Player.pushBack();

      const result = {
        success: false,
        dragonDefeated: false,
        streak: 0,
        pushedBack: true,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        message: 'The dragon shakes its head. "Wrong answer, brave knight! You must retreat and try again!"',
        explanation: currentQuestion.explanation
      };

      clearEncounter();
      return result;
    } else {
      // Regular monster - push player back
      Player.pushBack();

      const result = {
        success: false,
        defeated: false,
        pushedBack: true,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        message: Descriptions.generateDefeatMessage(currentEncounter.monster),
        explanation: currentQuestion.explanation
      };

      clearEncounter();
      return result;
    }
  }

  /**
   * Clear the current encounter
   */
  function clearEncounter() {
    currentEncounter = null;
    currentQuestion = null;
    dragonPhase = false;
  }

  /**
   * Check if there's an active encounter
   * @returns {boolean} Whether encounter is active
   */
  function hasActiveEncounter() {
    return currentEncounter !== null;
  }

  /**
   * Get current encounter info
   * @returns {Object|null} Current encounter data
   */
  function getCurrentEncounter() {
    if (!currentEncounter) return null;

    return {
      monster: currentEncounter.monster,
      question: currentQuestion,
      isDragon: dragonPhase,
      dragonStreak: Player.getDragonStreak(),
      attempts: currentEncounter.attempts
    };
  }

  /**
   * Get current question
   * @returns {Object|null} Current question
   */
  function getCurrentQuestion() {
    return currentQuestion ? { ...currentQuestion } : null;
  }

  /**
   * Check if we're in dragon phase
   * @returns {boolean} Whether fighting dragon
   */
  function isDragonFight() {
    return dragonPhase;
  }

  /**
   * Cancel current encounter (for testing/debug)
   */
  function cancelEncounter() {
    clearEncounter();
  }

  /**
   * Get combat summary
   * @returns {Object} Combat statistics
   */
  function getCombatStats() {
    return {
      monstersDefeated: Player.getMonstersDefeated(),
      questionStats: Player.getQuestionStats(),
      dragonStreak: Player.getDragonStreak(),
      dragonDefeated: Player.isDragonDefeated()
    };
  }

  // Public API
  return {
    startEncounter,
    submitAnswer,
    hasActiveEncounter,
    getCurrentEncounter,
    getCurrentQuestion,
    isDragonFight,
    cancelEncounter,
    getCombatStats,
    clearEncounter
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Combat;
}
