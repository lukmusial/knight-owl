/**
 * InputAdapter
 * Abstract interface for user input handling (keyboard, touch, gestures)
 * Implementations: BrowserInput, CapacitorInput
 */

const InputAdapter = (function() {
  // Current input implementation
  let implementation = null;

  // Event listeners by type
  const listeners = {
    navigate: [],
    select: [],
    swipe: [],
    back: []
  };

  /**
   * Input event types
   */
  const EVENT_TYPES = {
    NAVIGATE: 'navigate',  // Directional navigation (arrow keys, swipes)
    SELECT: 'select',      // Selection/confirm (Enter, tap)
    SWIPE: 'swipe',        // Swipe gestures
    BACK: 'back'           // Back/cancel (Escape, back button)
  };

  /**
   * Navigation directions
   */
  const DIRECTIONS = {
    NORTH: 'North',
    SOUTH: 'South',
    EAST: 'East',
    WEST: 'West'
  };

  /**
   * Input interface definition
   * All implementations must provide these methods
   */
  const INTERFACE = {
    /**
     * Initialize input handling
     * @returns {Promise<void>}
     */
    init: async function() {
      throw new Error('InputAdapter.init() must be implemented');
    },

    /**
     * Clean up input handling
     * @returns {Promise<void>}
     */
    destroy: async function() {
      throw new Error('InputAdapter.destroy() must be implemented');
    },

    /**
     * Check if input type is available
     * @param {string} type - Input type ('keyboard', 'touch', 'gamepad')
     * @returns {Promise<boolean>} Availability status
     */
    isInputAvailable: async function(type) {
      throw new Error('InputAdapter.isInputAvailable() must be implemented');
    },

    /**
     * Enable or disable specific input type
     * @param {string} type - Input type
     * @param {boolean} enabled - Whether to enable
     * @returns {Promise<void>}
     */
    setInputEnabled: async function(type, enabled) {
      throw new Error('InputAdapter.setInputEnabled() must be implemented');
    }
  };

  /**
   * Set the input implementation
   * @param {Object} impl - Implementation object with required methods
   */
  function setImplementation(impl) {
    // Validate implementation has required methods
    const required = ['init', 'destroy', 'isInputAvailable', 'setInputEnabled'];
    const missing = required.filter(method => typeof impl[method] !== 'function');

    if (missing.length > 0) {
      throw new Error(`InputAdapter implementation missing methods: ${missing.join(', ')}`);
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

  /**
   * Register event listener
   * @param {string} eventType - Event type from EVENT_TYPES
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  function on(eventType, callback) {
    if (!listeners[eventType]) {
      console.warn(`InputAdapter: Unknown event type "${eventType}"`);
      return () => {};
    }

    listeners[eventType].push(callback);

    // Return unsubscribe function
    return function unsubscribe() {
      const index = listeners[eventType].indexOf(callback);
      if (index > -1) {
        listeners[eventType].splice(index, 1);
      }
    };
  }

  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback to remove
   */
  function off(eventType, callback) {
    if (!listeners[eventType]) return;

    const index = listeners[eventType].indexOf(callback);
    if (index > -1) {
      listeners[eventType].splice(index, 1);
    }
  }

  /**
   * Emit an event to all listeners
   * Called by implementations when input is detected
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  function emit(eventType, data) {
    if (!listeners[eventType]) return;

    listeners[eventType].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`InputAdapter: Error in ${eventType} listener:`, e);
      }
    });
  }

  /**
   * Remove all listeners for an event type
   * @param {string} [eventType] - Event type, or all if not specified
   */
  function removeAllListeners(eventType) {
    if (eventType) {
      if (listeners[eventType]) {
        listeners[eventType] = [];
      }
    } else {
      Object.keys(listeners).forEach(type => {
        listeners[type] = [];
      });
    }
  }

  // Proxy methods to current implementation
  async function init() {
    if (!implementation) {
      console.warn('InputAdapter: No implementation set');
      return;
    }
    return implementation.init();
  }

  async function destroy() {
    removeAllListeners();
    if (!implementation) {
      return;
    }
    return implementation.destroy();
  }

  async function isInputAvailable(type) {
    if (!implementation) {
      return false;
    }
    return implementation.isInputAvailable(type);
  }

  async function setInputEnabled(type, enabled) {
    if (!implementation) {
      return;
    }
    return implementation.setInputEnabled(type, enabled);
  }

  // Public API
  return {
    setImplementation,
    getImplementation,
    hasImplementation,
    on,
    off,
    emit,
    removeAllListeners,
    init,
    destroy,
    isInputAvailable,
    setInputEnabled,
    EVENT_TYPES,
    DIRECTIONS,
    INTERFACE
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputAdapter;
}
