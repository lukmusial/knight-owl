/**
 * BrowserStorage
 * Browser localStorage implementation of StorageAdapter
 */

const BrowserStorage = (function() {
  const STORAGE_PREFIX = 'mrowl_dungeon_';

  /**
   * Test if localStorage is available
   * @returns {boolean} Whether localStorage works
   */
  function testLocalStorage() {
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
   * Add prefix to key
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  function prefixKey(key) {
    // Only add prefix if not already present
    if (key.startsWith(STORAGE_PREFIX)) {
      return key;
    }
    return STORAGE_PREFIX + key;
  }

  /**
   * Remove prefix from key
   * @param {string} key - Prefixed key
   * @returns {string} Original key
   */
  function unprefixKey(key) {
    if (key.startsWith(STORAGE_PREFIX)) {
      return key.substring(STORAGE_PREFIX.length);
    }
    return key;
  }

  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<boolean>} Success status
   */
  async function save(key, value) {
    if (!testLocalStorage()) {
      console.error('BrowserStorage: localStorage not available');
      return false;
    }

    try {
      const prefixedKey = prefixKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serialized);
      return true;
    } catch (e) {
      console.error('BrowserStorage: Failed to save:', e);
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<*>} Stored value or null
   */
  async function load(key) {
    if (!testLocalStorage()) {
      console.error('BrowserStorage: localStorage not available');
      return null;
    }

    try {
      const prefixedKey = prefixKey(key);
      const data = localStorage.getItem(prefixedKey);

      if (data === null) {
        return null;
      }

      return JSON.parse(data);
    } catch (e) {
      console.error('BrowserStorage: Failed to load:', e);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  async function remove(key) {
    if (!testLocalStorage()) {
      return false;
    }

    try {
      const prefixedKey = prefixKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (e) {
      console.error('BrowserStorage: Failed to remove:', e);
      return false;
    }
  }

  /**
   * List all keys matching prefix
   * @param {string} [prefix] - Optional additional prefix filter
   * @returns {Promise<string[]>} Array of keys
   */
  async function listKeys(prefix = '') {
    if (!testLocalStorage()) {
      return [];
    }

    try {
      const keys = [];
      const fullPrefix = STORAGE_PREFIX + prefix;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          keys.push(unprefixKey(key));
        }
      }

      return keys;
    } catch (e) {
      console.error('BrowserStorage: Failed to list keys:', e);
      return [];
    }
  }

  /**
   * Check if localStorage is available
   * @returns {Promise<boolean>} Availability status
   */
  async function isAvailable() {
    return testLocalStorage();
  }

  /**
   * Clear all prefixed storage
   * @returns {Promise<boolean>} Success status
   */
  async function clear() {
    if (!testLocalStorage()) {
      return false;
    }

    try {
      const keys = await listKeys();
      for (const key of keys) {
        await remove(key);
      }
      return true;
    } catch (e) {
      console.error('BrowserStorage: Failed to clear:', e);
      return false;
    }
  }

  /**
   * Get the storage prefix
   * @returns {string} Storage prefix
   */
  function getPrefix() {
    return STORAGE_PREFIX;
  }

  // Public API - matches StorageAdapter interface
  return {
    save,
    load,
    remove,
    listKeys,
    isAvailable,
    clear,
    getPrefix
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserStorage;
}
