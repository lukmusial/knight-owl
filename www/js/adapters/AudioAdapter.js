/**
 * AudioAdapter
 * Abstract interface for text-to-speech and audio operations
 * Implementations: BrowserAudio, CapacitorAudio
 */

const AudioAdapter = (function() {
  // Current audio implementation
  let implementation = null;

  /**
   * Audio interface definition
   * All implementations must provide these methods
   */
  const INTERFACE = {
    /**
     * Speak text using TTS
     * @param {string} text - Text to speak
     * @param {Object} [options] - Speech options
     * @param {string} [options.language='pl-PL'] - Language code
     * @param {number} [options.rate=0.9] - Speech rate (0.1-2.0)
     * @param {number} [options.pitch=1.2] - Speech pitch (0.0-2.0)
     * @param {number} [options.volume=1.0] - Volume (0.0-1.0)
     * @returns {Promise<boolean>} Success status
     */
    speak: async function(text, options) {
      throw new Error('AudioAdapter.speak() must be implemented');
    },

    /**
     * Stop any ongoing speech
     * @returns {Promise<void>}
     */
    stopSpeaking: async function() {
      throw new Error('AudioAdapter.stopSpeaking() must be implemented');
    },

    /**
     * Set default language for TTS
     * @param {string} language - Language code (e.g., 'pl-PL')
     * @returns {Promise<boolean>} Success status
     */
    setLanguage: async function(language) {
      throw new Error('AudioAdapter.setLanguage() must be implemented');
    },

    /**
     * Get available voices/languages
     * @returns {Promise<Object[]>} Array of voice objects
     */
    getVoices: async function() {
      throw new Error('AudioAdapter.getVoices() must be implemented');
    },

    /**
     * Check if TTS is available
     * @returns {Promise<boolean>} Availability status
     */
    isAvailable: async function() {
      throw new Error('AudioAdapter.isAvailable() must be implemented');
    },

    /**
     * Check if currently speaking
     * @returns {Promise<boolean>} Speaking status
     */
    isSpeaking: async function() {
      throw new Error('AudioAdapter.isSpeaking() must be implemented');
    }
  };

  // Default speech options
  const defaultOptions = {
    language: 'pl-PL',
    rate: 0.9,
    pitch: 1.2,
    volume: 1.0
  };

  /**
   * Set the audio implementation
   * @param {Object} impl - Implementation object with required methods
   */
  function setImplementation(impl) {
    // Validate implementation has required methods
    const required = ['speak', 'stopSpeaking', 'setLanguage', 'getVoices', 'isAvailable', 'isSpeaking'];
    const missing = required.filter(method => typeof impl[method] !== 'function');

    if (missing.length > 0) {
      throw new Error(`AudioAdapter implementation missing methods: ${missing.join(', ')}`);
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

  // Proxy methods to current implementation with graceful degradation
  async function speak(text, options = {}) {
    if (!implementation) {
      console.warn('AudioAdapter: No implementation set, TTS unavailable');
      return false;
    }

    const mergedOptions = { ...defaultOptions, ...options };
    return implementation.speak(text, mergedOptions);
  }

  async function stopSpeaking() {
    if (!implementation) {
      return;
    }
    return implementation.stopSpeaking();
  }

  async function setLanguage(language) {
    if (!implementation) {
      return false;
    }
    defaultOptions.language = language;
    return implementation.setLanguage(language);
  }

  async function getVoices() {
    if (!implementation) {
      return [];
    }
    return implementation.getVoices();
  }

  async function isAvailable() {
    if (!implementation) {
      return false;
    }
    return implementation.isAvailable();
  }

  async function isSpeaking() {
    if (!implementation) {
      return false;
    }
    return implementation.isSpeaking();
  }

  /**
   * Get default speech options
   * @returns {Object} Default options
   */
  function getDefaultOptions() {
    return { ...defaultOptions };
  }

  // Public API
  return {
    setImplementation,
    getImplementation,
    hasImplementation,
    speak,
    stopSpeaking,
    setLanguage,
    getVoices,
    isAvailable,
    isSpeaking,
    getDefaultOptions,
    INTERFACE
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioAdapter;
}
