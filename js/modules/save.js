/**
 * Save Module
 * Handles game persistence using localStorage
 */

const Save = (function() {
  const STORAGE_PREFIX = 'mrowl_dungeon_';
  const SAVE_LIST_KEY = 'mrowl_dungeon_saves';

  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage works
   */
  function isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate storage key for a player
   * @param {string} playerName - Player's name
   * @returns {string} Storage key
   */
  function getKey(playerName) {
    // Normalize the name for key consistency
    return STORAGE_PREFIX + playerName.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Save game state
   * @param {Object} playerState - Player state from Player module
   * @param {Object} dungeonState - Dungeon state from Dungeon module
   * @param {Array} usedQuestionIds - Used question IDs from Questions module
   * @param {Object} mapState - Map state from DungeonMap module
   * @returns {boolean} Whether save succeeded
   */
  function saveGame(playerState, dungeonState, usedQuestionIds, mapState) {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return false;
    }

    const playerName = playerState.name;
    if (!playerName) {
      console.error('Player name is required for saving');
      return false;
    }

    const saveData = {
      version: 2, // Updated for map support
      savedAt: Date.now(),
      player: playerState,
      dungeon: dungeonState,
      usedQuestions: usedQuestionIds,
      mapState: mapState
    };

    try {
      const key = getKey(playerName);
      localStorage.setItem(key, JSON.stringify(saveData));

      // Update save list
      updateSaveList(playerName);

      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  /**
   * Load game state
   * @param {string} playerName - Player's name
   * @returns {Object|null} Saved game data or null if not found
   */
  function loadGame(playerName) {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return null;
    }

    try {
      const key = getKey(playerName);
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      const saveData = JSON.parse(data);

      // Validate save data structure
      if (!saveData.player || !saveData.dungeon) {
        console.error('Invalid save data structure');
        return null;
      }

      return saveData;
    } catch (e) {
      console.error('Failed to load game:', e);
      return null;
    }
  }

  /**
   * Check if a save exists for a player
   * @param {string} playerName - Player's name
   * @returns {boolean} Whether save exists
   */
  function hasSave(playerName) {
    if (!isStorageAvailable()) return false;

    const key = getKey(playerName);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Delete a saved game
   * @param {string} playerName - Player's name
   * @returns {boolean} Whether deletion succeeded
   */
  function deleteSave(playerName) {
    if (!isStorageAvailable()) return false;

    try {
      const key = getKey(playerName);
      localStorage.removeItem(key);

      // Update save list
      removeSaveFromList(playerName);

      return true;
    } catch (e) {
      console.error('Failed to delete save:', e);
      return false;
    }
  }

  /**
   * Get list of all saved games
   * @returns {Array} Array of save info objects
   */
  function listSaves() {
    if (!isStorageAvailable()) return [];

    try {
      const listData = localStorage.getItem(SAVE_LIST_KEY);
      if (!listData) return [];

      const saveNames = JSON.parse(listData);

      // Get details for each save
      return saveNames.map(name => {
        const saveData = loadGame(name);
        if (!saveData) return null;

        return {
          name: saveData.player.name,
          savedAt: saveData.savedAt,
          monstersDefeated: saveData.player.monstersDefeated,
          playTime: saveData.player.gameStartTime
            ? formatPlayTime(saveData.savedAt - saveData.player.gameStartTime)
            : 'Unknown'
        };
      }).filter(s => s !== null);
    } catch (e) {
      console.error('Failed to list saves:', e);
      return [];
    }
  }

  /**
   * Update the save list
   * @param {string} playerName - Player name to add
   */
  function updateSaveList(playerName) {
    try {
      const listData = localStorage.getItem(SAVE_LIST_KEY);
      let saves = listData ? JSON.parse(listData) : [];

      // Add name if not already in list
      const normalizedName = playerName.toLowerCase();
      if (!saves.includes(normalizedName)) {
        saves.push(normalizedName);
        localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(saves));
      }
    } catch (e) {
      console.error('Failed to update save list:', e);
    }
  }

  /**
   * Remove a name from the save list
   * @param {string} playerName - Player name to remove
   */
  function removeSaveFromList(playerName) {
    try {
      const listData = localStorage.getItem(SAVE_LIST_KEY);
      if (!listData) return;

      let saves = JSON.parse(listData);
      const normalizedName = playerName.toLowerCase();
      saves = saves.filter(n => n !== normalizedName);

      localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(saves));
    } catch (e) {
      console.error('Failed to remove from save list:', e);
    }
  }

  /**
   * Format play time from milliseconds
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time
   */
  function formatPlayTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Clear all saves (for testing/reset)
   */
  function clearAllSaves() {
    if (!isStorageAvailable()) return;

    try {
      const saves = listSaves();
      saves.forEach(save => deleteSave(save.name));
      localStorage.removeItem(SAVE_LIST_KEY);
    } catch (e) {
      console.error('Failed to clear saves:', e);
    }
  }

  /**
   * Export all game data (for backup)
   * @returns {string} JSON string of all saves
   */
  function exportAllData() {
    const saves = listSaves();
    const allData = {};

    saves.forEach(save => {
      const data = loadGame(save.name);
      if (data) {
        allData[save.name] = data;
      }
    });

    return JSON.stringify(allData, null, 2);
  }

  /**
   * Import game data (from backup)
   * @param {string} jsonData - JSON string of saves
   * @returns {boolean} Whether import succeeded
   */
  function importData(jsonData) {
    try {
      const allData = JSON.parse(jsonData);

      Object.keys(allData).forEach(name => {
        const data = allData[name];
        if (data.player && data.dungeon) {
          const key = getKey(name);
          localStorage.setItem(key, JSON.stringify(data));
          updateSaveList(name);
        }
      });

      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }

  // Public API
  return {
    saveGame,
    loadGame,
    hasSave,
    deleteSave,
    listSaves,
    clearAllSaves,
    exportAllData,
    importData,
    isStorageAvailable
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Save;
}
