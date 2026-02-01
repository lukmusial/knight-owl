/**
 * Save Module
 * Handles game persistence using StorageAdapter (with localStorage fallback)
 */

const Save = (function() {
  const STORAGE_PREFIX = 'mrowl_dungeon_';
  const SAVE_LIST_KEY = 'saves';

  /**
   * Check if StorageAdapter is available
   * @returns {boolean} Whether adapter is configured
   */
  function hasAdapter() {
    return typeof StorageAdapter !== 'undefined' && StorageAdapter.hasImplementation();
  }

  /**
   * Check if localStorage is available (fallback)
   * @returns {boolean} Whether localStorage works
   */
  function isStorageAvailable() {
    // First check adapter
    if (hasAdapter()) {
      return true;
    }

    // Fallback to direct localStorage check
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
   * @returns {string} Storage key (without prefix for adapter, with prefix for direct)
   */
  function getKey(playerName) {
    // Normalize the name for key consistency
    return playerName.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Generate full storage key with prefix (for direct localStorage)
   * @param {string} playerName - Player's name
   * @returns {string} Full storage key
   */
  function getFullKey(playerName) {
    return STORAGE_PREFIX + getKey(playerName);
  }

  /**
   * Save data using adapter or direct localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to save
   * @returns {boolean} Success status
   */
  function saveData(key, value) {
    if (hasAdapter()) {
      // Use adapter (sync wrapper for now - adapter is async but we maintain sync API)
      StorageAdapter.save(key, value);
      return true;
    }

    // Direct localStorage fallback
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Save: Failed to save data:', e);
      return false;
    }
  }

  /**
   * Load data using adapter or direct localStorage
   * @param {string} key - Storage key
   * @returns {*} Loaded value or null
   */
  function loadData(key) {
    if (hasAdapter()) {
      // Adapter load is async, but we need sync API for backward compat
      // Use synchronous localStorage through the adapter's BrowserStorage
      const impl = StorageAdapter.getImplementation();
      if (impl && typeof impl.load === 'function') {
        // BrowserStorage.load returns a promise that resolves immediately
        // Since we can't await in sync code, use direct localStorage for now
      }
    }

    // Direct localStorage
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Save: Failed to load data:', e);
      return null;
    }
  }

  /**
   * Remove data using adapter or direct localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  function removeData(key) {
    if (hasAdapter()) {
      StorageAdapter.remove(key);
    }

    // Also do direct localStorage to ensure cleanup
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (e) {
      console.error('Save: Failed to remove data:', e);
      return false;
    }
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
      console.error('Storage is not available');
      return false;
    }

    const playerName = playerState.name;
    if (!playerName) {
      console.error('Player name is required for saving');
      return false;
    }

    const saveData = {
      version: 2,
      savedAt: Date.now(),
      player: playerState,
      dungeon: dungeonState,
      usedQuestions: usedQuestionIds,
      mapState: mapState
    };

    try {
      const key = getKey(playerName);

      if (hasAdapter()) {
        // Async save through adapter
        StorageAdapter.save(key, saveData);
      } else {
        // Direct localStorage
        localStorage.setItem(getFullKey(playerName), JSON.stringify(saveData));
      }

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
      console.error('Storage is not available');
      return null;
    }

    try {
      let data;

      if (hasAdapter()) {
        // For now, use direct localStorage since adapter is async
        // TODO: Convert to async API in future
        data = localStorage.getItem(getFullKey(playerName));
      } else {
        data = localStorage.getItem(getFullKey(playerName));
      }

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

    return localStorage.getItem(getFullKey(playerName)) !== null;
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

      if (hasAdapter()) {
        StorageAdapter.remove(key);
      }

      // Also remove from direct localStorage
      localStorage.removeItem(getFullKey(playerName));

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
      const listData = localStorage.getItem(STORAGE_PREFIX + SAVE_LIST_KEY);
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
      const listData = localStorage.getItem(STORAGE_PREFIX + SAVE_LIST_KEY);
      let saves = listData ? JSON.parse(listData) : [];

      // Add name if not already in list
      const normalizedName = playerName.toLowerCase();
      if (!saves.includes(normalizedName)) {
        saves.push(normalizedName);
        localStorage.setItem(STORAGE_PREFIX + SAVE_LIST_KEY, JSON.stringify(saves));

        // Also save through adapter if available
        if (hasAdapter()) {
          StorageAdapter.save(SAVE_LIST_KEY, saves);
        }
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
      const listData = localStorage.getItem(STORAGE_PREFIX + SAVE_LIST_KEY);
      if (!listData) return;

      let saves = JSON.parse(listData);
      const normalizedName = playerName.toLowerCase();
      saves = saves.filter(n => n !== normalizedName);

      localStorage.setItem(STORAGE_PREFIX + SAVE_LIST_KEY, JSON.stringify(saves));

      // Also update through adapter if available
      if (hasAdapter()) {
        StorageAdapter.save(SAVE_LIST_KEY, saves);
      }
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
      localStorage.removeItem(STORAGE_PREFIX + SAVE_LIST_KEY);

      if (hasAdapter()) {
        StorageAdapter.remove(SAVE_LIST_KEY);
      }
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
          localStorage.setItem(getFullKey(name), JSON.stringify(data));
          updateSaveList(name);

          // Also save through adapter if available
          if (hasAdapter()) {
            StorageAdapter.save(getKey(name), data);
          }
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
    isStorageAvailable,
    hasAdapter
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Save;
}
