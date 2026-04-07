/**
 * UserProfile Module
 * Tracks per-question learning progress across multiple dungeon runs.
 * Uses spaced repetition to prioritize questions the player struggles with.
 * Data stored in localStorage, keyed per player name.
 */

const UserProfile = (function() {
  var STORAGE_PREFIX = 'mrowl_dungeon_profile_';
  var PROFILES_LIST_KEY = 'mrowl_dungeon_profiles';
  var MAX_RECENT_ATTEMPTS = 5;

  // Current loaded profile
  var currentProfile = null;

  /**
   * Normalize player name for storage key
   * @param {string} name - Player name
   * @returns {string} Normalized key
   */
  function normalizeKey(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Create a fresh profile object
   * @param {string} name - Player name
   * @returns {Object} New profile
   */
  function createProfile(name) {
    return {
      version: 1,
      name: name,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      runsCompleted: 0,
      questionHistory: {}
    };
  }

  /**
   * Load profile for a player. Creates new if none exists.
   * @param {string} playerName - Player name
   * @returns {Object} The loaded or new profile
   */
  function load(playerName) {
    if (!playerName) {
      currentProfile = null;
      return null;
    }

    try {
      var key = STORAGE_PREFIX + normalizeKey(playerName);
      var data = localStorage.getItem(key);

      if (data) {
        currentProfile = JSON.parse(data);
        currentProfile.lastPlayedAt = Date.now();
      } else {
        currentProfile = createProfile(playerName);
      }

      return currentProfile;
    } catch (e) {
      console.error('UserProfile: Failed to load profile:', e);
      currentProfile = createProfile(playerName);
      return currentProfile;
    }
  }

  /**
   * Save current profile to localStorage
   * @returns {boolean} Success
   */
  function save() {
    if (!currentProfile) return false;

    try {
      var key = STORAGE_PREFIX + normalizeKey(currentProfile.name);
      currentProfile.lastPlayedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(currentProfile));
      updateProfilesList(currentProfile.name);
      return true;
    } catch (e) {
      console.error('UserProfile: Failed to save profile:', e);
      return false;
    }
  }

  /**
   * Record a question attempt in the profile
   * @param {string} questionId - Question ID
   * @param {boolean} wasCorrect - Whether answer was correct
   */
  function recordAttempt(questionId, wasCorrect) {
    if (!currentProfile) return;

    var history = currentProfile.questionHistory;
    var now = Date.now();

    if (!history[questionId]) {
      history[questionId] = {
        seen: 0,
        correct: 0,
        wrong: 0,
        streak: 0,
        lastSeen: null,
        lastCorrect: null,
        recentAttempts: []
      };
    }

    var entry = history[questionId];
    entry.seen++;
    entry.lastSeen = now;

    if (wasCorrect) {
      entry.correct++;
      entry.streak++;
      entry.lastCorrect = now;
    } else {
      entry.wrong++;
      entry.streak = 0;
    }

    // Keep only last N attempts
    entry.recentAttempts.push([now, wasCorrect]);
    if (entry.recentAttempts.length > MAX_RECENT_ATTEMPTS) {
      entry.recentAttempts.shift();
    }
  }

  /**
   * Mark a completed dungeon run
   */
  function completeRun() {
    if (!currentProfile) return;
    currentProfile.runsCompleted++;
    currentProfile.lastPlayedAt = Date.now();
  }

  /**
   * Calculate selection weight for a question (0.0–1.0).
   * Higher weight = more likely to appear.
   * @param {string} questionId - Question ID
   * @returns {number} Weight between 0.1 and 1.0
   */
  function getQuestionWeight(questionId) {
    if (!currentProfile) return 1.0;

    var history = currentProfile.questionHistory;
    var entry = history[questionId];

    // Never seen → maximum weight
    if (!entry) return 1.0;

    // Base weight from streak (consecutive correct answers)
    var baseWeight;
    if (entry.streak >= 5) {
      baseWeight = 0.1;
    } else if (entry.streak >= 3) {
      baseWeight = 0.3;
    } else if (entry.streak >= 1) {
      baseWeight = 0.5;
    } else {
      // streak === 0 means last answer was wrong
      baseWeight = 0.9;
    }

    // Time decay: weight increases as time passes since last seen
    var daysSinceLastSeen = 0;
    if (entry.lastSeen) {
      daysSinceLastSeen = (Date.now() - entry.lastSeen) / (1000 * 60 * 60 * 24);
    }
    var recencyFactor = Math.min(daysSinceLastSeen / 7, 1.0);

    // Difficulty factor: more wrong answers = higher weight
    var accuracy = entry.seen > 0 ? entry.correct / entry.seen : 0;
    var difficultyFactor = 1.0 - (accuracy * 0.5); // Range: 0.5 (always correct) to 1.0 (always wrong)

    // Combined weight, clamped to [0.1, 1.0]
    var weight = baseWeight * (0.5 + recencyFactor * 0.5) * difficultyFactor;
    return Math.max(0.1, Math.min(1.0, weight));
  }

  /**
   * Get mastery statistics for the current profile
   * @returns {Object} Mastery stats
   */
  function getMasteryStats() {
    if (!currentProfile) {
      return { totalSeen: 0, mastered: 0, struggling: 0, accuracy: 0, runsCompleted: 0 };
    }

    var history = currentProfile.questionHistory;
    var ids = Object.keys(history);
    var totalSeen = ids.length;
    var mastered = 0;
    var struggling = 0;
    var totalCorrect = 0;
    var totalAttempts = 0;

    for (var i = 0; i < ids.length; i++) {
      var entry = history[ids[i]];
      totalCorrect += entry.correct;
      totalAttempts += entry.seen;

      if (entry.streak >= 3 && entry.correct >= 3) {
        mastered++;
      }
      if (entry.seen >= 2 && (entry.wrong / entry.seen) > 0.5) {
        struggling++;
      }
    }

    return {
      totalSeen: totalSeen,
      mastered: mastered,
      struggling: struggling,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      runsCompleted: currentProfile.runsCompleted
    };
  }

  /**
   * Get current profile data (copy)
   * @returns {Object|null} Profile data
   */
  function getProfile() {
    if (!currentProfile) return null;
    return JSON.parse(JSON.stringify(currentProfile));
  }

  /**
   * Check if a profile exists for a player
   * @param {string} playerName - Player name
   * @returns {boolean} Whether profile exists
   */
  function hasProfile(playerName) {
    if (!playerName) return false;
    try {
      var key = STORAGE_PREFIX + normalizeKey(playerName);
      return localStorage.getItem(key) !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * List all profile names
   * @returns {Array} Array of player names
   */
  function listProfiles() {
    try {
      var data = localStorage.getItem(PROFILES_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Update the profiles list
   * @param {string} playerName - Player name to add
   */
  function updateProfilesList(playerName) {
    try {
      var data = localStorage.getItem(PROFILES_LIST_KEY);
      var profiles = data ? JSON.parse(data) : [];
      var normalized = normalizeKey(playerName);

      if (profiles.indexOf(normalized) === -1) {
        profiles.push(normalized);
        localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
      }
    } catch (e) {
      console.error('UserProfile: Failed to update profiles list:', e);
    }
  }

  /**
   * Export profile data as JSON string (for analysis)
   * @returns {string} JSON string
   */
  function exportData() {
    if (!currentProfile) return '{}';
    return JSON.stringify(currentProfile, null, 2);
  }

  /**
   * Reset current profile (unload)
   */
  function reset() {
    currentProfile = null;
  }

  // Public API
  return {
    load: load,
    save: save,
    recordAttempt: recordAttempt,
    completeRun: completeRun,
    getQuestionWeight: getQuestionWeight,
    getMasteryStats: getMasteryStats,
    getProfile: getProfile,
    hasProfile: hasProfile,
    listProfiles: listProfiles,
    exportData: exportData,
    reset: reset
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserProfile;
}
