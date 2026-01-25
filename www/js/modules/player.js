/**
 * Player Module
 * Manages player state, inventory, and progress
 */

const Player = (function() {
  // Default player state
  const defaultState = {
    name: '',
    currentRoom: 'entrance',
    previousRoom: null,
    inventory: [],
    monstersDefeated: 0,
    questionsCorrect: 0,
    questionsTotal: 0,
    dragonStreak: 0,
    totalLootValue: 0,
    gameStartTime: null,
    lastSaveTime: null
  };

  // Current player state
  let state = { ...defaultState, inventory: [] };

  /**
   * Create a new player
   * @param {string} name - Player's name
   * @returns {Object} The player state
   */
  function create(name) {
    state = {
      ...defaultState,
      inventory: [], // Fresh array to avoid mutating defaultState
      name: name.trim(),
      gameStartTime: Date.now()
    };
    return getState();
  }

  /**
   * Get current player state (copy)
   * @returns {Object} Current state
   */
  function getState() {
    return { ...state, inventory: [...state.inventory] };
  }

  /**
   * Get player name
   * @returns {string} Player name
   */
  function getName() {
    return state.name;
  }

  /**
   * Move to a new room
   * @param {string} roomId - The room to move to
   */
  function moveTo(roomId) {
    state.previousRoom = state.currentRoom;
    state.currentRoom = roomId;
  }

  /**
   * Push player back to previous room (failed quiz)
   */
  function pushBack() {
    if (state.previousRoom) {
      const temp = state.currentRoom;
      state.currentRoom = state.previousRoom;
      state.previousRoom = temp;
    }
  }

  /**
   * Get current room ID
   * @returns {string} Current room ID
   */
  function getCurrentRoom() {
    return state.currentRoom;
  }

  /**
   * Get previous room ID
   * @returns {string|null} Previous room ID
   */
  function getPreviousRoom() {
    return state.previousRoom;
  }

  /**
   * Add loot to inventory
   * @param {Array} loot - Array of loot items
   */
  function addLoot(loot) {
    if (!Array.isArray(loot)) {
      loot = [loot];
    }

    loot.forEach(item => {
      state.inventory.push({
        ...item,
        obtainedAt: Date.now()
      });
      state.totalLootValue += item.value || 0;
    });
  }

  /**
   * Get inventory
   * @returns {Array} Copy of inventory
   */
  function getInventory() {
    return [...state.inventory];
  }

  /**
   * Get total inventory value
   * @returns {number} Total loot value
   */
  function getTotalLootValue() {
    return state.totalLootValue;
  }

  /**
   * Record a monster defeat
   */
  function defeatMonster() {
    state.monstersDefeated++;
  }

  /**
   * Get number of defeated monsters
   * @returns {number} Monsters defeated count
   */
  function getMonstersDefeated() {
    return state.monstersDefeated;
  }

  /**
   * Record a question attempt
   * @param {boolean} correct - Whether the answer was correct
   */
  function recordQuestion(correct) {
    state.questionsTotal++;
    if (correct) {
      state.questionsCorrect++;
    }
  }

  /**
   * Get question statistics
   * @returns {Object} Questions stats
   */
  function getQuestionStats() {
    return {
      correct: state.questionsCorrect,
      total: state.questionsTotal,
      percentage: state.questionsTotal > 0
        ? Math.round((state.questionsCorrect / state.questionsTotal) * 100)
        : 0
    };
  }

  /**
   * Increment dragon question streak
   * @returns {number} Current streak
   */
  function incrementDragonStreak() {
    state.dragonStreak++;
    return state.dragonStreak;
  }

  /**
   * Reset dragon question streak
   */
  function resetDragonStreak() {
    state.dragonStreak = 0;
  }

  /**
   * Get dragon question streak
   * @returns {number} Current streak
   */
  function getDragonStreak() {
    return state.dragonStreak;
  }

  /**
   * Check if dragon is defeated (3 correct answers)
   * @returns {boolean} Whether dragon is defeated
   */
  function isDragonDefeated() {
    return state.dragonStreak >= 3;
  }

  /**
   * Get play time in seconds
   * @returns {number} Play time
   */
  function getPlayTime() {
    if (!state.gameStartTime) return 0;
    return Math.floor((Date.now() - state.gameStartTime) / 1000);
  }

  /**
   * Get formatted play time
   * @returns {string} Formatted time (MM:SS)
   */
  function getFormattedPlayTime() {
    const seconds = getPlayTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Load player state (from save)
   * @param {Object} savedState - Saved state to load
   */
  function loadState(savedState) {
    state = {
      ...defaultState,
      ...savedState,
      inventory: savedState.inventory ? [...savedState.inventory] : []
    };
  }

  /**
   * Export state for saving
   * @returns {Object} Serializable state
   */
  function exportState() {
    return {
      ...state,
      inventory: [...state.inventory], // Copy array to avoid reference issues
      lastSaveTime: Date.now()
    };
  }

  /**
   * Get game summary for end screen
   * @returns {Object} Game summary
   */
  function getGameSummary() {
    const stats = getQuestionStats();
    return {
      name: state.name,
      monstersDefeated: state.monstersDefeated,
      questionsCorrect: stats.correct,
      questionsTotal: stats.total,
      accuracy: stats.percentage,
      totalLoot: state.totalLootValue,
      itemsCollected: state.inventory.length,
      playTime: getFormattedPlayTime()
    };
  }

  /**
   * Reset player state
   */
  function reset() {
    state = { ...defaultState, inventory: [] };
  }

  // Public API
  return {
    create,
    getState,
    getName,
    moveTo,
    pushBack,
    getCurrentRoom,
    getPreviousRoom,
    addLoot,
    getInventory,
    getTotalLootValue,
    defeatMonster,
    getMonstersDefeated,
    recordQuestion,
    getQuestionStats,
    incrementDragonStreak,
    resetDragonStreak,
    getDragonStreak,
    isDragonDefeated,
    getPlayTime,
    getFormattedPlayTime,
    loadState,
    exportState,
    getGameSummary,
    reset
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}
