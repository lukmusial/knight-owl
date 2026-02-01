/**
 * StorageAdapter
 * Abstract interface for persistent storage operations
 * Implementations: BrowserStorage, CapacitorStorage
 */

const StorageAdapter = (function() {
  // Current storage implementation
  let implementation = null;

  /**
   * Storage interface definition
   * All implementations must provide these methods
   */
  const INTERFACE = {
    /**
     * Save data to storage
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {Promise<boolean>} Success status
     */
    save: async function(key, value) {
      throw new Error('StorageAdapter.save() must be implemented');
    },

    /**
     * Load data from storage
     * @param {string} key - Storage key
     * @returns {Promise<*>} Stored value or null if not found
     */
    load: async function(key) {
      throw new Error('StorageAdapter.load() must be implemented');
    },

    /**
     * Remove data from storage
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} Success status
     */
    remove: async function(key) {
      throw new Error('StorageAdapter.remove() must be implemented');
    },

    /**
     * List all storage keys matching a prefix
     * @param {string} [prefix] - Optional key prefix filter
     * @returns {Promise<string[]>} Array of matching keys
     */
    listKeys: async function(prefix) {
      throw new Error('StorageAdapter.listKeys() must be implemented');
    },

    /**
     * Check if storage is available
     * @returns {Promise<boolean>} Availability status
     */
    isAvailable: async function() {
      throw new Error('StorageAdapter.isAvailable() must be implemented');
    },

    /**
     * Clear all storage (use with caution)
     * @returns {Promise<boolean>} Success status
     */
    clear: async function() {
      throw new Error('StorageAdapter.clear() must be implemented');
    }
  };

  /**
   * Set the storage implementation
   * @param {Object} impl - Implementation object with required methods
   */
  function setImplementation(impl) {
    // Validate implementation has all required methods
    const required = ['save', 'load', 'remove', 'listKeys', 'isAvailable', 'clear'];
    const missing = required.filter(method => typeof impl[method] !== 'function');

    if (missing.length > 0) {
      throw new Error(`StorageAdapter implementation missing methods: ${missing.join(', ')}`);
    }

    implementation = impl;
  }

  /**
   * Get current implementation
   * @returns {Object|null} Current implementation
   */
  function getImplementation() {
    return implementation;
  }

  /**
   * Check if an implementation is set
   * @returns {boolean} Whether implementation exists
   */
  function hasImplementation() {
    return implementation !== null;
  }

  // Proxy methods to current implementation
  async function save(key, value) {
    if (!implementation) {
      console.warn('StorageAdapter: No implementation set, using fallback');
      return false;
    }
    return implementation.save(key, value);
  }

  async function load(key) {
    if (!implementation) {
      console.warn('StorageAdapter: No implementation set, using fallback');
      return null;
    }
    return implementation.load(key);
  }

  async function remove(key) {
    if (!implementation) {
      console.warn('StorageAdapter: No implementation set');
      return false;
    }
    return implementation.remove(key);
  }

  async function listKeys(prefix) {
    if (!implementation) {
      console.warn('StorageAdapter: No implementation set');
      return [];
    }
    return implementation.listKeys(prefix);
  }

  async function isAvailable() {
    if (!implementation) {
      return false;
    }
    return implementation.isAvailable();
  }

  async function clear() {
    if (!implementation) {
      console.warn('StorageAdapter: No implementation set');
      return false;
    }
    return implementation.clear();
  }

  // Public API
  return {
    setImplementation,
    getImplementation,
    hasImplementation,
    save,
    load,
    remove,
    listKeys,
    isAvailable,
    clear,
    INTERFACE
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageAdapter;
}
