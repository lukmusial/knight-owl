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
   * Boss monsters need three correct answers in a row (the dragon, the
   * grim reaper). A boss is marked by `boss: true` or difficulty 4; the
   * dragon id is kept for older fixtures without either field.
   * @param {Object} monster - Monster object
   * @returns {boolean} Whether this is a boss fight
   */
  function isBoss(monster) {
    if (!monster) return false;
    return monster.boss === true || monster.difficulty === 4 || monster.id === 'dragon';
  }

  /**
   * Start a monster encounter
   * @param {Object} monster - Monster object from room
   * @param {number} difficulty - Difficulty level based on depth
   * @returns {Object} Encounter data
   */
  function startEncounter(monster, difficulty) {
    dragonPhase = isBoss(monster);

    currentEncounter = {
      monster: monster,
      difficulty: difficulty,
      started: Date.now(),
      attempts: 0
    };

    // Get a question for this encounter
    currentQuestion = Complexity.question(difficulty, dragonPhase);

    return {
      monster: monster,
      question: currentQuestion,
      isDragon: dragonPhase,
      isBoss: dragonPhase,
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

    // Record to user profile for spaced repetition
    if (typeof UserProfile !== 'undefined' && UserProfile.recordAttempt) {
      UserProfile.recordAttempt(currentQuestion.id, isCorrect);
    }

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
          bossDefeated: true,
          streak: streak,
          loot: loot,
          message: Descriptions.generateVictoryMessage(monster),
          explanation: currentQuestion.explanation,
          correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
          sentence: currentQuestion.sentence || null,
          category: currentQuestion.category
        };

        clearEncounter();
        return result;
      } else {
        // Need more correct answers
        var prevQuestion = currentQuestion;
        // Get next dragon question
        currentQuestion = Complexity.question(3, true);

        return {
          success: true,
          dragonDefeated: false,
          streak: streak,
          message: Descriptions.generateBossText(streak, monster),
          explanation: prevQuestion ? '' : 'Well done!',
          correctAnswer: prevQuestion.options[prevQuestion.correctIndex],
          sentence: prevQuestion.sentence || null,
          category: prevQuestion.category,
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
        explanation: currentQuestion.explanation,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        sentence: currentQuestion.sentence || null,
        category: currentQuestion.category
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
        sentence: currentQuestion.sentence || null,
        category: currentQuestion.category,
        message: Descriptions.generateBossRetreatMessage(currentEncounter.monster),
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
        sentence: currentQuestion.sentence || null,
        category: currentQuestion.category,
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

  /**
   * Settle a one-shot challenge that is not a quiz question (the sentence
   * builder): loot and a defeat on success, a push back on failure.
   * @param {Object} monster - Monster object
   * @param {boolean} success - Whether the challenge was passed
   * @param {Object} meta - { questionId, explanation, correctAnswer, category,
   *   dungeon: true to clear the room / push back in the dungeon graph }
   * @returns {Object} Result in the shape submitAnswer returns
   */
  function resolveChallenge(monster, success, meta) {
    meta = meta || {};
    Player.recordQuestion(success);
    if (meta.questionId && typeof UserProfile !== 'undefined' && UserProfile.recordAttempt) {
      UserProfile.recordAttempt(meta.questionId, success);
    }
    const common = {
      correctAnswer: meta.correctAnswer || null,
      // a whole-sentence answer reads through the result card's "___" template
      sentence: meta.correctAnswer ? '___' : null,
      category: meta.category || null,
      explanation: meta.explanation || ''
    };
    if (success) {
      const loot = monster.loot || [];
      Player.addLoot(loot);
      Player.defeatMonster();
      if (meta.dungeon) Dungeon.clearRoom(Player.getCurrentRoom());
      return Object.assign({
        success: true,
        defeated: true,
        loot: loot,
        message: Descriptions.generateVictoryMessage(monster)
      }, common);
    }
    if (meta.dungeon) Player.pushBack();
    return Object.assign({
      success: false,
      defeated: false,
      pushedBack: true,
      message: Descriptions.generateDefeatMessage(monster)
    }, common);
  }

  /**
   * The kind of challenge an encounter opens: the room's or monster's own
   * type, unless the page asks for one with ?enc=quiz|matching|sentence
   * (for trying a card out). Bosses always take the quiz.
   * @param {string} type - encounterType from the dungeon or cemetery model
   * @param {Object} [monster] - the monster, to keep bosses on the quiz
   * @returns {string} 'quiz' | 'matching' | 'sentence'
   */
  function encounterKind(type, monster) {
    if (isBoss(monster)) return 'quiz';
    var forced = null;
    try {
      if (typeof window !== 'undefined' && window.location && typeof URLSearchParams !== 'undefined') {
        forced = new URLSearchParams(window.location.search).get('enc');
      }
    } catch (e) { forced = null; }
    if (forced === 'quiz' || forced === 'matching' || forced === 'sentence') return forced;
    return type || 'quiz';
  }

  // Public API
  return {
    isBoss,
    resolveChallenge,
    encounterKind,
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
