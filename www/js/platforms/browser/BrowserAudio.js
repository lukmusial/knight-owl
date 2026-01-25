/**
 * BrowserAudio
 * Browser Web Speech API implementation of AudioAdapter
 */

const BrowserAudio = (function() {
  // Current speech utterance
  let currentUtterance = null;

  // Default language
  let defaultLanguage = 'pl-PL';

  // Cached voices
  let cachedVoices = null;

  /**
   * Check if Web Speech API is available
   * @returns {boolean} Whether TTS is supported
   */
  function hasSpeechSynthesis() {
    return typeof window !== 'undefined' &&
           'speechSynthesis' in window &&
           typeof SpeechSynthesisUtterance !== 'undefined';
  }

  /**
   * Get available voices, with caching
   * @returns {Promise<SpeechSynthesisVoice[]>} Available voices
   */
  async function loadVoices() {
    if (!hasSpeechSynthesis()) {
      return [];
    }

    // Return cached voices if available
    if (cachedVoices && cachedVoices.length > 0) {
      return cachedVoices;
    }

    // Try to get voices immediately
    let voices = window.speechSynthesis.getVoices();

    // If empty, wait for voiceschanged event
    if (voices.length === 0) {
      voices = await new Promise((resolve) => {
        const handler = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve(window.speechSynthesis.getVoices());
        };
        window.speechSynthesis.addEventListener('voiceschanged', handler);

        // Timeout fallback
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve(window.speechSynthesis.getVoices());
        }, 1000);
      });
    }

    cachedVoices = voices;
    return voices;
  }

  /**
   * Find best voice for language
   * @param {string} language - Language code
   * @returns {Promise<SpeechSynthesisVoice|null>} Best matching voice
   */
  async function findVoice(language) {
    const voices = await loadVoices();
    const langPrefix = language.split('-')[0];

    // Filter voices for this language
    const matchingVoices = voices.filter(v =>
      v.lang.startsWith(langPrefix)
    );

    if (matchingVoices.length === 0) {
      return null;
    }

    // Prefer voices with friendly-sounding names (for children)
    const preferredVoice = matchingVoices.find(v =>
      /zosia|paulina|ewa|anna|female/i.test(v.name)
    );

    return preferredVoice || matchingVoices[0];
  }

  /**
   * Speak text using Web Speech API
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise<boolean>} Success status
   */
  async function speak(text, options = {}) {
    if (!hasSpeechSynthesis() || !text) {
      return false;
    }

    try {
      // Cancel any ongoing speech
      await stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || defaultLanguage;
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.2;
      utterance.volume = options.volume || 1.0;

      // Try to find appropriate voice
      const voice = await findVoice(utterance.lang);
      if (voice) {
        utterance.voice = voice;
      }

      currentUtterance = utterance;

      return new Promise((resolve) => {
        utterance.onend = () => {
          currentUtterance = null;
          resolve(true);
        };

        utterance.onerror = (event) => {
          console.error('BrowserAudio: Speech error:', event.error);
          currentUtterance = null;
          resolve(false);
        };

        window.speechSynthesis.speak(utterance);
      });
    } catch (e) {
      console.error('BrowserAudio: Failed to speak:', e);
      return false;
    }
  }

  /**
   * Stop any ongoing speech
   * @returns {Promise<void>}
   */
  async function stopSpeaking() {
    if (!hasSpeechSynthesis()) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch (e) {
      console.error('BrowserAudio: Failed to stop speaking:', e);
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
   * Get available voices formatted for AudioAdapter
   * @returns {Promise<Object[]>} Array of voice info objects
   */
  async function getVoices() {
    const voices = await loadVoices();

    return voices.map(v => ({
      id: v.voiceURI,
      name: v.name,
      language: v.lang,
      local: v.localService,
      default: v.default
    }));
  }

  /**
   * Check if TTS is available
   * @returns {Promise<boolean>} Availability status
   */
  async function isAvailable() {
    if (!hasSpeechSynthesis()) {
      return false;
    }

    // Check if we have any voices
    const voices = await loadVoices();
    return voices.length > 0;
  }

  /**
   * Check if currently speaking
   * @returns {Promise<boolean>} Speaking status
   */
  async function isSpeaking() {
    if (!hasSpeechSynthesis()) {
      return false;
    }

    return window.speechSynthesis.speaking;
  }

  /**
   * Get current default language
   * @returns {string} Language code
   */
  function getLanguage() {
    return defaultLanguage;
  }

  // Public API - matches AudioAdapter interface
  return {
    speak,
    stopSpeaking,
    setLanguage,
    getVoices,
    isAvailable,
    isSpeaking,
    getLanguage
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserAudio;
}
