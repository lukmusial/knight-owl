/**
 * Platform Detection and Initialization
 * Detects the current platform and initializes appropriate adapters
 */

const Platform = (function() {
  // Detected platform
  let currentPlatform = 'unknown';

  // Initialization status
  let initialized = false;

  /**
   * Platform types
   */
  const PLATFORMS = {
    BROWSER: 'browser',
    CAPACITOR_ANDROID: 'capacitor-android',
    CAPACITOR_IOS: 'capacitor-ios',
    UNKNOWN: 'unknown'
  };

  /**
   * Detect current platform
   * @returns {string} Platform identifier
   */
  function detectPlatform() {
    // Check for Capacitor
    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'android') {
        return PLATFORMS.CAPACITOR_ANDROID;
      } else if (platform === 'ios') {
        return PLATFORMS.CAPACITOR_IOS;
      }
    }

    // Check for browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return PLATFORMS.BROWSER;
    }

    return PLATFORMS.UNKNOWN;
  }

  /**
   * Initialize browser adapters
   * @returns {Promise<void>}
   */
  async function initBrowserAdapters() {
    console.log('Platform: Initializing browser adapters');

    // Initialize storage adapter
    if (typeof StorageAdapter !== 'undefined' && typeof BrowserStorage !== 'undefined') {
      StorageAdapter.setImplementation(BrowserStorage);
      console.log('Platform: StorageAdapter initialized with BrowserStorage');
    }

    // Initialize audio adapter
    if (typeof AudioAdapter !== 'undefined' && typeof BrowserAudio !== 'undefined') {
      AudioAdapter.setImplementation(BrowserAudio);
      console.log('Platform: AudioAdapter initialized with BrowserAudio');
    }

    // Initialize input adapter
    if (typeof InputAdapter !== 'undefined' && typeof BrowserInput !== 'undefined') {
      InputAdapter.setImplementation(BrowserInput);
      await InputAdapter.init();
      console.log('Platform: InputAdapter initialized with BrowserInput');
    }
  }

  /**
   * Initialize Capacitor adapters
   * @param {string} platform - Specific Capacitor platform
   * @returns {Promise<void>}
   */
  async function initCapacitorAdapters(platform) {
    console.log(`Platform: Initializing Capacitor adapters for ${platform}`);

    // Initialize storage adapter
    if (typeof StorageAdapter !== 'undefined' && typeof CapacitorStorage !== 'undefined') {
      StorageAdapter.setImplementation(CapacitorStorage);
      console.log('Platform: StorageAdapter initialized with CapacitorStorage');
    } else if (typeof StorageAdapter !== 'undefined' && typeof BrowserStorage !== 'undefined') {
      // Fallback to browser storage
      StorageAdapter.setImplementation(BrowserStorage);
      console.log('Platform: StorageAdapter fallback to BrowserStorage');
    }

    // Initialize audio adapter
    if (typeof AudioAdapter !== 'undefined' && typeof CapacitorAudio !== 'undefined') {
      AudioAdapter.setImplementation(CapacitorAudio);
      console.log('Platform: AudioAdapter initialized with CapacitorAudio');
    } else if (typeof AudioAdapter !== 'undefined' && typeof BrowserAudio !== 'undefined') {
      // Fallback to browser audio
      AudioAdapter.setImplementation(BrowserAudio);
      console.log('Platform: AudioAdapter fallback to BrowserAudio');
    }

    // Initialize input adapter (browser input works in Capacitor too)
    if (typeof InputAdapter !== 'undefined' && typeof BrowserInput !== 'undefined') {
      InputAdapter.setImplementation(BrowserInput);
      await InputAdapter.init();
      console.log('Platform: InputAdapter initialized with BrowserInput');
    }

    // Initialize haptics (available on both iOS and Android)
    if (typeof CapacitorHaptics !== 'undefined') {
      await CapacitorHaptics.init();
      console.log('Platform: CapacitorHaptics initialized');
    }
  }

  /**
   * Initialize platform
   * Detects platform and sets up appropriate adapters
   * @returns {Promise<void>}
   */
  async function init() {
    if (initialized) {
      console.warn('Platform: Already initialized');
      return;
    }

    // Detect platform
    currentPlatform = detectPlatform();
    console.log(`Platform: Detected platform: ${currentPlatform}`);

    // Initialize appropriate adapters
    switch (currentPlatform) {
      case PLATFORMS.BROWSER:
        await initBrowserAdapters();
        break;

      case PLATFORMS.CAPACITOR_ANDROID:
      case PLATFORMS.CAPACITOR_IOS:
        await initCapacitorAdapters(currentPlatform);
        break;

      default:
        console.warn('Platform: Unknown platform, attempting browser initialization');
        await initBrowserAdapters();
    }

    initialized = true;
    console.log('Platform: Initialization complete');
  }

  /**
   * Get current platform
   * @returns {string} Platform identifier
   */
  function getPlatform() {
    return currentPlatform;
  }

  /**
   * Check if running on native platform (Capacitor)
   * @returns {boolean} Whether native
   */
  function isNative() {
    return currentPlatform === PLATFORMS.CAPACITOR_ANDROID ||
           currentPlatform === PLATFORMS.CAPACITOR_IOS;
  }

  /**
   * Check if running on browser
   * @returns {boolean} Whether browser
   */
  function isBrowser() {
    return currentPlatform === PLATFORMS.BROWSER;
  }

  /**
   * Check if running on Android
   * @returns {boolean} Whether Android
   */
  function isAndroid() {
    return currentPlatform === PLATFORMS.CAPACITOR_ANDROID;
  }

  /**
   * Check if running on iOS
   * @returns {boolean} Whether iOS
   */
  function isIOS() {
    return currentPlatform === PLATFORMS.CAPACITOR_IOS;
  }

  /**
   * Check if initialized
   * @returns {boolean} Initialization status
   */
  function isInitialized() {
    return initialized;
  }

  /**
   * Reset for testing
   */
  function reset() {
    initialized = false;
    currentPlatform = 'unknown';
  }

  // Public API
  return {
    init,
    getPlatform,
    isNative,
    isBrowser,
    isAndroid,
    isIOS,
    isInitialized,
    reset,
    PLATFORMS
  };
})();

// Auto-initialize when DOM is ready (browser only)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Platform.init());
  } else {
    // DOM already loaded
    Platform.init();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Platform;
}
