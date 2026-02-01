/**
 * CapacitorHaptics
 * Haptic feedback implementation using Capacitor Haptics plugin
 * Provides tactile feedback for game events on iOS devices
 */

const CapacitorHaptics = (function() {
  let Haptics = null;
  let initialized = false;

  /**
   * Initialize the Haptics plugin
   * @returns {Promise<boolean>} Whether initialization succeeded
   */
  async function init() {
    if (initialized) return true;

    try {
      // Check if Capacitor is available
      if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
        console.log('CapacitorHaptics: Not running on native platform');
        return false;
      }

      // Import the Haptics plugin
      const { Haptics: HapticsPlugin } = await import('@capacitor/haptics');
      Haptics = HapticsPlugin;
      initialized = true;
      console.log('CapacitorHaptics: Initialized successfully');
      return true;
    } catch (e) {
      console.log('CapacitorHaptics: Haptics plugin not available:', e.message);
      return false;
    }
  }

  /**
   * Check if haptics are available
   * @returns {boolean} Whether haptics are available
   */
  function isAvailable() {
    return initialized && Haptics !== null;
  }

  /**
   * Trigger haptic feedback for correct answer
   * Uses success notification type
   */
  async function onCorrectAnswer() {
    if (!isAvailable()) return;

    try {
      await Haptics.notification({ type: 'success' });
    } catch (e) {
      console.log('CapacitorHaptics: onCorrectAnswer failed:', e.message);
    }
  }

  /**
   * Trigger haptic feedback for wrong answer
   * Uses error notification type
   */
  async function onWrongAnswer() {
    if (!isAvailable()) return;

    try {
      await Haptics.notification({ type: 'error' });
    } catch (e) {
      console.log('CapacitorHaptics: onWrongAnswer failed:', e.message);
    }
  }

  /**
   * Trigger haptic feedback for navigation
   * Uses light impact type
   */
  async function onNavigation() {
    if (!isAvailable()) return;

    try {
      await Haptics.impact({ style: 'light' });
    } catch (e) {
      console.log('CapacitorHaptics: onNavigation failed:', e.message);
    }
  }

  /**
   * Trigger haptic feedback for monster defeat
   * Uses medium impact type
   */
  async function onMonsterDefeated() {
    if (!isAvailable()) return;

    try {
      await Haptics.impact({ style: 'medium' });
    } catch (e) {
      console.log('CapacitorHaptics: onMonsterDefeated failed:', e.message);
    }
  }

  /**
   * Trigger haptic feedback for dragon defeat (victory)
   * Uses heavy impact type for dramatic effect
   */
  async function onDragonDefeated() {
    if (!isAvailable()) return;

    try {
      // Multiple impacts for dramatic effect
      await Haptics.impact({ style: 'heavy' });
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impact({ style: 'heavy' });
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.notification({ type: 'success' });
    } catch (e) {
      console.log('CapacitorHaptics: onDragonDefeated failed:', e.message);
    }
  }

  /**
   * Trigger selection feedback
   * Uses selection changed type for UI selections
   */
  async function onSelection() {
    if (!isAvailable()) return;

    try {
      await Haptics.selectionChanged();
    } catch (e) {
      console.log('CapacitorHaptics: onSelection failed:', e.message);
    }
  }

  /**
   * Trigger custom vibration pattern
   * @param {number} duration - Duration in milliseconds
   */
  async function vibrate(duration = 100) {
    if (!isAvailable()) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (e) {
      console.log('CapacitorHaptics: vibrate failed:', e.message);
    }
  }

  // Public API
  return {
    init,
    isAvailable,
    onCorrectAnswer,
    onWrongAnswer,
    onNavigation,
    onMonsterDefeated,
    onDragonDefeated,
    onSelection,
    vibrate
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapacitorHaptics;
}
