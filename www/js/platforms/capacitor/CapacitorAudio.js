/**
 * CapacitorAudio
 * Native TTS implementation using @capacitor-community/text-to-speech plugin
 *
 * Concurrency note: the native plugin flushes its queue on every speak() call
 * and drops the callbacks of any utterance still in progress, so a second
 * speak() issued while the first is playing leaves the first promise hanging
 * forever. To avoid that, speak() is serialized here: while a request is in
 * flight, further requests are ignored and return false.
 */

const CapacitorAudio = (function() {
  // Reference to TextToSpeech plugin
  let TextToSpeech = null;

  // Default language
  let defaultLanguage = 'pl-PL';

  // Speaking state (true from speak() start until native resolves/rejects/times out)
  let currentlySpeaking = false;

  // Incremented on every speak()/stopSpeaking(); lets a stale request detect
  // that it was superseded and skip its timeout/fallback side effects.
  let generation = 0;

  // Track consecutive native TTS failures for fallback logic
  let consecutiveFailures = 0;
  const MAX_FAILURES_BEFORE_FALLBACK = 2;

  // After MAX_FAILURES_BEFORE_FALLBACK, skip native TTS for this long, then retry it.
  // Never abandon native permanently: Web Speech API is often non-functional in Android WebView.
  const FALLBACK_COOLDOWN_MS = 30000;
  let fallbackUntil = 0;

  // Timeout for native TTS (ms) - AVSpeechSynthesizer on iOS can hang.
  // Scaled by text length so long sentences are not misreported as hangs.
  const SPEAK_TIMEOUT_BASE_MS = 8000;
  const SPEAK_TIMEOUT_PER_CHAR_MS = 100;
  const SPEAK_TIMEOUT_MAX_MS = 20000;

  /**
   * Compute timeout for a given text
   * @param {string} text - Text to speak
   * @returns {number} Timeout in ms
   */
  function timeoutForText(text) {
    var ms = SPEAK_TIMEOUT_BASE_MS + text.length * SPEAK_TIMEOUT_PER_CHAR_MS;
    return Math.min(ms, SPEAK_TIMEOUT_MAX_MS);
  }

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
   * Inject a plugin implementation (used by tests and for manual wiring).
   * Passing null clears the reference so initPlugin() re-detects on next use.
   * @param {Object|null} plugin - Object with speak/stop/getSupportedLanguages/getSupportedVoices
   */
  function setPlugin(plugin) {
    TextToSpeech = plugin || null;
    generation++;
    currentlySpeaking = false;
    consecutiveFailures = 0;
    fallbackUntil = 0;
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
   * Record a native failure; enter fallback cooldown after repeated failures
   */
  function recordFailure() {
    consecutiveFailures++;
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK) {
      fallbackUntil = Date.now() + FALLBACK_COOLDOWN_MS;
      consecutiveFailures = 0;
      console.warn('CapacitorAudio: Native TTS failing, using Web Speech fallback for ' +
        (FALLBACK_COOLDOWN_MS / 1000) + 's');
    }
  }

  /**
   * Whether native TTS is currently in fallback cooldown
   * @returns {boolean}
   */
  function inFallbackCooldown() {
    return fallbackUntil > Date.now();
  }

  /**
   * Speak text using native TTS with timeout protection.
   * Ignored (returns false) while a previous request is still in flight.
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

    // Serialize: a second request during playback would orphan the first one's promise
    if (currentlySpeaking) {
      return false;
    }

    // If native TTS has failed repeatedly, use Web Speech API for a while
    if (inFallbackCooldown()) {
      speakWithFallback(text, options);
      return true;
    }

    if (!initPlugin()) {
      speakWithFallback(text, options);
      return false;
    }

    var timeoutId = null;
    var myGeneration = ++generation;
    currentlySpeaking = true;

    try {
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
        timeoutId = setTimeout(function() { resolve('timeout'); }, timeoutForText(text));
      });

      var result = await Promise.race([speakPromise, timeoutPromise]);

      if (myGeneration !== generation) {
        // Superseded by stopSpeaking(); the plugin dropped this utterance
        return false;
      }

      if (result === 'timeout') {
        console.warn('CapacitorAudio: Native TTS timed out, trying fallback');
        // Stop the hung native speech
        try { TextToSpeech.stop(); } catch (e) { /* ignore */ }
        currentlySpeaking = false;
        recordFailure();
        speakWithFallback(text, options);
        return true;
      }

      // Native TTS succeeded, reset failure count
      currentlySpeaking = false;
      consecutiveFailures = 0;
      return true;
    } catch (e) {
      if (myGeneration !== generation) {
        return false;
      }
      console.error('CapacitorAudio: Failed to speak:', e);
      currentlySpeaking = false;
      recordFailure();
      // Try fallback on error
      speakWithFallback(text, options);
      return false;
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (myGeneration === generation) {
        currentlySpeaking = false;
      }
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
    } catch (e) {
      console.error('CapacitorAudio: Failed to stop speaking:', e);
    }
    // The in-flight speak() promise (if any) may never settle after a native
    // stop, because the plugin drops its callback. Bump the generation so its
    // eventual timeout is ignored, and release the busy flag now.
    generation++;
    currentlySpeaking = false;
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
   * Synchronous busy check (a speak() request is in flight)
   * @returns {boolean}
   */
  function isBusy() {
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
    isBusy,
    getLanguage,
    isPolishSupported,
    setPlugin,
    inFallbackCooldown,
    timeoutForText
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapacitorAudio;
}
