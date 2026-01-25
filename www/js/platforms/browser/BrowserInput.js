/**
 * BrowserInput
 * Browser implementation of InputAdapter for keyboard and touch/swipe handling
 */

const BrowserInput = (function() {
  // Input enabled states
  const inputEnabled = {
    keyboard: true,
    touch: true
  };

  // Bound event handlers (for cleanup)
  let keydownHandler = null;
  let touchStartHandler = null;
  let touchMoveHandler = null;
  let touchEndHandler = null;

  // Touch tracking
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  const SWIPE_THRESHOLD = 50;      // Minimum swipe distance in pixels
  const SWIPE_TIME_LIMIT = 500;    // Maximum swipe duration in ms

  // Map arrow keys to directions
  const KEY_TO_DIRECTION = {
    'ArrowUp': 'North',
    'ArrowDown': 'South',
    'ArrowLeft': 'West',
    'ArrowRight': 'East',
    'w': 'North',
    's': 'South',
    'a': 'West',
    'd': 'East',
    'W': 'North',
    'S': 'South',
    'A': 'West',
    'D': 'East'
  };

  /**
   * Check if running in browser environment
   * @returns {boolean} Whether in browser
   */
  function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Emit event through InputAdapter
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  function emit(eventType, data) {
    if (typeof InputAdapter !== 'undefined' && InputAdapter.emit) {
      InputAdapter.emit(eventType, data);
    }
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeydown(event) {
    if (!inputEnabled.keyboard) return;

    // Don't handle if input element is focused
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    // Check for navigation keys
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault();
      emit('navigate', {
        direction: direction,
        source: 'keyboard',
        key: event.key
      });
      return;
    }

    // Check for select/confirm
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      emit('select', {
        source: 'keyboard',
        key: event.key
      });
      return;
    }

    // Check for back/cancel
    if (event.key === 'Escape') {
      event.preventDefault();
      emit('back', {
        source: 'keyboard',
        key: event.key
      });
    }
  }

  /**
   * Handle touch start
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchStart(event) {
    if (!inputEnabled.touch) return;

    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  }

  /**
   * Handle touch move (for scroll prevention during swipe)
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchMove(event) {
    // Prevent default to avoid scrolling during swipe detection
    // Only if we've started tracking a swipe
    if (!inputEnabled.touch || touchStartTime === 0) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // If movement is significant and primarily horizontal/vertical, prevent scroll
    if (deltaX > 10 || deltaY > 10) {
      // Don't prevent if user is scrolling within a scrollable area
      const target = event.target;
      if (target && target.closest && target.closest('.scrollable')) {
        return;
      }
    }
  }

  /**
   * Handle touch end
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchEnd(event) {
    if (!inputEnabled.touch || touchStartTime === 0) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const deltaTime = Date.now() - touchStartTime;

    // Reset touch tracking
    touchStartTime = 0;

    // Check if within time limit
    if (deltaTime > SWIPE_TIME_LIMIT) {
      return;
    }

    // Calculate swipe distance
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Check if swipe threshold met
    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
      // This was a tap, not a swipe
      return;
    }

    // Determine swipe direction
    let direction;
    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'East' : 'West';
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'South' : 'North';
    }

    // Emit swipe event
    emit('swipe', {
      direction: direction,
      deltaX: deltaX,
      deltaY: deltaY,
      source: 'touch'
    });

    // Also emit as navigation event
    emit('navigate', {
      direction: direction,
      source: 'swipe'
    });
  }

  /**
   * Initialize input handling
   * @returns {Promise<void>}
   */
  async function init() {
    if (!isBrowser()) {
      console.warn('BrowserInput: Not in browser environment');
      return;
    }

    // Create bound handlers
    keydownHandler = handleKeydown.bind(this);
    touchStartHandler = handleTouchStart.bind(this);
    touchMoveHandler = handleTouchMove.bind(this);
    touchEndHandler = handleTouchEnd.bind(this);

    // Add event listeners
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('touchstart', touchStartHandler, { passive: true });
    document.addEventListener('touchmove', touchMoveHandler, { passive: true });
    document.addEventListener('touchend', touchEndHandler, { passive: true });
  }

  /**
   * Clean up input handling
   * @returns {Promise<void>}
   */
  async function destroy() {
    if (!isBrowser()) return;

    // Remove event listeners
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    if (touchStartHandler) {
      document.removeEventListener('touchstart', touchStartHandler);
      touchStartHandler = null;
    }
    if (touchMoveHandler) {
      document.removeEventListener('touchmove', touchMoveHandler);
      touchMoveHandler = null;
    }
    if (touchEndHandler) {
      document.removeEventListener('touchend', touchEndHandler);
      touchEndHandler = null;
    }
  }

  /**
   * Check if input type is available
   * @param {string} type - Input type ('keyboard', 'touch')
   * @returns {Promise<boolean>} Availability status
   */
  async function isInputAvailable(type) {
    if (!isBrowser()) return false;

    switch (type) {
      case 'keyboard':
        return true;
      case 'touch':
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      case 'gamepad':
        return 'getGamepads' in navigator;
      default:
        return false;
    }
  }

  /**
   * Enable or disable input type
   * @param {string} type - Input type
   * @param {boolean} enabled - Whether to enable
   * @returns {Promise<void>}
   */
  async function setInputEnabled(type, enabled) {
    if (inputEnabled.hasOwnProperty(type)) {
      inputEnabled[type] = enabled;
    }
  }

  /**
   * Get swipe threshold
   * @returns {number} Threshold in pixels
   */
  function getSwipeThreshold() {
    return SWIPE_THRESHOLD;
  }

  /**
   * Check if input type is enabled
   * @param {string} type - Input type
   * @returns {boolean} Enabled status
   */
  function isEnabled(type) {
    return inputEnabled[type] || false;
  }

  // Public API - matches InputAdapter interface
  return {
    init,
    destroy,
    isInputAvailable,
    setInputEnabled,
    getSwipeThreshold,
    isEnabled
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserInput;
}
