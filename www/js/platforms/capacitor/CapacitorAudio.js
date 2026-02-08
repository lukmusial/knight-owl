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

  // Track consecutive native TTS failures for fallback logic
  let consecutiveFailures = 0;
  let MAX_FAILURES_BEFORE_FALLBACK = 2;

  // Timeout for native TTS (ms) - iOS AVSpeechSynthesizer can hang
  let SPEAK_TIMEOUT_MS = 8000;

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
   * Check if Web Speech API is available as fallback
   * @returns {boolean} Whether fallback is available
   */
  function hasSpeechSynthesisFallback() {
    return typeof window !== 'undefined' &&
           'speechSynthesis' in window &&
           typeof SpeechSynthesisUtterance !== 'undefined';
  }

  /**
   * Speak using Web Speech API as fallback when native TTS fails
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   */
  function speakWithFallback(text, options) {
    if (!hasSpeechSynthesisFallback()) return;

    try {
      window.speechSynthesis.cancel();

      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || defaultLanguage;
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.2;
      utterance.volume = options.volume || 1.0;

      var voices = window.speechSynthesis.getVoices();
      var langPrefix = (options.language || defaultLanguage).split('-')[0];
      var matchingVoices = voices.filter(function(v) {
        return v.lang.startsWith(langPrefix);
      });
      if (matchingVoices.length > 0) {
        utterance.voice = matchingVoices[0];
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('CapacitorAudio: Fallback speech also failed:', e);
    }
  }

  /**
   * Speak text using native TTS with timeout protection
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise<boolean>} Success status
   */
  async function speak(text, options) {
    if (!text) {
      return false;
    }
    if (!options) {
      options = {};
    }

    // If native TTS has failed repeatedly, use Web Speech API directly
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK) {
      speakWithFallback(text, options);
      return true;
    }

    if (!initPlugin()) {
      speakWithFallback(text, options);
      return false;
    }

    try {
      currentlySpeaking = true;

      // Race the native speak against a timeout.
      // The native plugin handles queue flushing internally (queueStrategy=FLUSH),
      // so we don't need to call stop() separately before speaking.
      var speakPromise = TextToSpeech.speak({
        text: text,
        lang: options.language || defaultLanguage,
        rate: options.rate || 0.9,
        pitch: options.pitch || 1.2,
        volume: options.volume || 1.0,
        category: 'playback'
      });

      var timeoutPromise = new Promise(function(resolve) {
        setTimeout(function() { resolve('timeout'); }, SPEAK_TIMEOUT_MS);
      });

      var result = await Promise.race([speakPromise, timeoutPromise]);

      currentlySpeaking = false;

      if (result === 'timeout') {
        console.warn('CapacitorAudio: Native TTS timed out, trying fallback');
        consecutiveFailures++;
        // Stop the hung native speech
        try { TextToSpeech.stop(); } catch (e) { /* ignore */ }
        speakWithFallback(text, options);
        return true;
      }

      // Native TTS succeeded, reset failure count
      consecutiveFailures = 0;
      return true;
    } catch (e) {
      console.error('CapacitorAudio: Failed to speak:', e);
      currentlySpeaking = false;
      consecutiveFailures++;
      // Try fallback on error
      speakWithFallback(text, options);
      return false;
    }
  }

  /**
   * Stop any ongoing speech
   * @returns {Promise<void>}
   */
  async function stopSpeaking() {
    // Also cancel Web Speech API in case fallback is active
    if (hasSpeechSynthesisFallback()) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }

    if (!initPlugin()) {
      currentlySpeaking = false;
      return;
    }

    try {
      await TextToSpeech.stop();
      currentlySpeaking = false;
    } catch (e) {
      console.error('CapacitorAudio: Failed to stop speaking:', e);
      currentlySpeaking = false;
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
