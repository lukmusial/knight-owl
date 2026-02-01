/**
 * CapacitorAudio
 * Native TTS implementation using @capacitor-community/text-to-speech plugin
 */

const CapacitorAudio = (function() {
  // Reference to TextToSpeech plugin
  let TextToSpeech = null;

  // Default language
  let defaultLanguage = 'pl-PL';

  // Speaking state
  let currentlySpeaking = false;

  /**
   * Initialize the TextToSpeech plugin reference
   * @returns {boolean} Whether plugin is available
   */
  function initPlugin() {
    if (TextToSpeech) return true;

    // Check for Capacitor TextToSpeech plugin
    if (typeof Capacitor !== 'undefined' &&
        Capacitor.Plugins &&
        Capacitor.Plugins.TextToSpeech) {
      TextToSpeech = Capacitor.Plugins.TextToSpeech;
      return true;
    }

    // Try community plugin namespace
    try {
      if (typeof CapacitorCommunityTextToSpeech !== 'undefined') {
        TextToSpeech = CapacitorCommunityTextToSpeech;
        return true;
      }
    } catch (e) {
      // Plugin not available
    }

    console.warn('CapacitorAudio: TextToSpeech plugin not available');
    return false;
  }

  /**
   * Speak text using native TTS
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise<boolean>} Success status
   */
  async function speak(text, options = {}) {
    if (!initPlugin() || !text) {
      return false;
    }

    try {
      // Stop any ongoing speech
      await stopSpeaking();

      currentlySpeaking = true;

      await TextToSpeech.speak({
        text: text,
        lang: options.language || defaultLanguage,
        rate: options.rate || 0.9,
        pitch: options.pitch || 1.2,
        volume: options.volume || 1.0,
        category: 'playback' // For iOS
      });

      currentlySpeaking = false;
      return true;
    } catch (e) {
      console.error('CapacitorAudio: Failed to speak:', e);
      currentlySpeaking = false;
      return false;
    }
  }

  /**
   * Stop any ongoing speech
   * @returns {Promise<void>}
   */
  async function stopSpeaking() {
    if (!initPlugin()) {
      return;
    }

    try {
      await TextToSpeech.stop();
      currentlySpeaking = false;
    } catch (e) {
      console.error('CapacitorAudio: Failed to stop speaking:', e);
    }
  }

  /**
   * Set default language
   * @param {string} language - Language code
   * @returns {Promise<boolean>} Success status
   */
  async function setLanguage(language) {
    defaultLanguage = language;
    return true;
  }

  /**
   * Get available voices/languages
   * @returns {Promise<Object[]>} Array of voice info objects
   */
  async function getVoices() {
    if (!initPlugin()) {
      return [];
    }

    try {
      const result = await TextToSpeech.getSupportedVoices();

      if (!result.voices) {
        return [];
      }

      return result.voices.map(v => ({
        id: v.voiceURI || v.name,
        name: v.name,
        language: v.lang,
        local: v.localService !== false,
        default: v.default === true
      }));
    } catch (e) {
      console.error('CapacitorAudio: Failed to get voices:', e);
      return [];
    }
  }

  /**
   * Check if TTS is available
   * @returns {Promise<boolean>} Availability status
   */
  async function isAvailable() {
    if (!initPlugin()) {
      return false;
    }

    try {
      // Check if we can get supported languages
      const result = await TextToSpeech.getSupportedLanguages();
      return result.languages && result.languages.length > 0;
    } catch (e) {
      console.error('CapacitorAudio: Availability check failed:', e);
      return false;
    }
  }

  /**
   * Check if currently speaking
   * @returns {Promise<boolean>} Speaking status
   */
  async function isSpeaking() {
    return currentlySpeaking;
  }

  /**
   * Get current default language
   * @returns {string} Language code
   */
  function getLanguage() {
    return defaultLanguage;
  }

  /**
   * Check if Polish language is supported
   * @returns {Promise<boolean>} Whether Polish is available
   */
  async function isPolishSupported() {
    if (!initPlugin()) {
      return false;
    }

    try {
      const result = await TextToSpeech.getSupportedLanguages();
      return result.languages.some(lang =>
        lang.startsWith('pl') || lang === 'pl-PL'
      );
    } catch (e) {
      return false;
    }
  }

  // Public API - matches AudioAdapter interface
  return {
    speak,
    stopSpeaking,
    setLanguage,
    getVoices,
    isAvailable,
    isSpeaking,
    getLanguage,
    isPolishSupported
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapacitorAudio;
}
