/**
 * CapacitorStorage
 * Native storage implementation using @capacitor/preferences plugin
 */

const CapacitorStorage = (function() {
  const STORAGE_PREFIX = 'mrowl_dungeon_';

  // Reference to Capacitor Preferences plugin
  let Preferences = null;

  /**
   * Initialize the Preferences plugin reference
   * @returns {boolean} Whether plugin is available
   */
  function initPlugin() {
    if (Preferences) return true;

    // Check for Capacitor Preferences plugin
    if (typeof Capacitor !== 'undefined' &&
        Capacitor.Plugins &&
        Capacitor.Plugins.Preferences) {
      Preferences = Capacitor.Plugins.Preferences;
      return true;
    }

    // Try direct import (for newer Capacitor versions)
    try {
      if (typeof CapacitorPreferences !== 'undefined') {
        Preferences = CapacitorPreferences;
        return true;
      }
    } catch (e) {
      // Plugin not available
    }

    console.warn('CapacitorStorage: Preferences plugin not available');
    return false;
  }

  /**
   * Add prefix to key
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  function prefixKey(key) {
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
   * Save data to native storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<boolean>} Success status
   */
  async function save(key, value) {
    if (!initPlugin()) {
      console.error('CapacitorStorage: Plugin not available');
      return false;
    }

    try {
      const prefixedKey = prefixKey(key);
      const serialized = JSON.stringify(value);

      await Preferences.set({
        key: prefixedKey,
        value: serialized
      });

      return true;
    } catch (e) {
      console.error('CapacitorStorage: Failed to save:', e);
      return false;
    }
  }

  /**
   * Load data from native storage
   * @param {string} key - Storage key
   * @returns {Promise<*>} Stored value or null
   */
  async function load(key) {
    if (!initPlugin()) {
      console.error('CapacitorStorage: Plugin not available');
      return null;
    }

    try {
      const prefixedKey = prefixKey(key);
      const result = await Preferences.get({ key: prefixedKey });

      if (result.value === null || result.value === undefined) {
        return null;
      }

      return JSON.parse(result.value);
    } catch (e) {
      console.error('CapacitorStorage: Failed to load:', e);
      return null;
    }
  }

  /**
   * Remove data from native storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  async function remove(key) {
    if (!initPlugin()) {
      return false;
    }

    try {
      const prefixedKey = prefixKey(key);
      await Preferences.remove({ key: prefixedKey });
      return true;
    } catch (e) {
      console.error('CapacitorStorage: Failed to remove:', e);
      return false;
    }
  }

  /**
   * List all keys matching prefix
   * @param {string} [prefix] - Optional additional prefix filter
   * @returns {Promise<string[]>} Array of keys
   */
  async function listKeys(prefix = '') {
    if (!initPlugin()) {
      return [];
    }

    try {
      const result = await Preferences.keys();
      const fullPrefix = STORAGE_PREFIX + prefix;

      const matchingKeys = result.keys
        .filter(key => key.startsWith(fullPrefix))
        .map(key => unprefixKey(key));

      return matchingKeys;
    } catch (e) {
      console.error('CapacitorStorage: Failed to list keys:', e);
      return [];
    }
  }

  /**
   * Check if native storage is available
   * @returns {Promise<boolean>} Availability status
   */
  async function isAvailable() {
    return initPlugin();
  }

  /**
   * Clear all prefixed storage
   * @returns {Promise<boolean>} Success status
   */
  async function clear() {
    if (!initPlugin()) {
      return false;
    }

    try {
      const keys = await listKeys();
      for (const key of keys) {
        await remove(key);
      }
      return true;
    } catch (e) {
      console.error('CapacitorStorage: Failed to clear:', e);
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
  module.exports = CapacitorStorage;
}
