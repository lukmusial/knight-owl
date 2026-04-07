/**
 * Matching Module
 * Handles word-matching encounters where players pair items from two columns.
 * Two types: English-Polish word matching and pronoun/numeral-noun matching.
 */

var Matching = (function() {
  // All matching question sets
  var matchingSets = [];
  var usedSetIds = new Set();

  // Current matching session state
  var currentSet = null;
  var remainingPairs = [];
  var selectedItem = null; // { side: 'left'|'right', index: number }
  var failed = false;

  /**
   * Initialize with matching data from globals
   */
  function init() {
    matchingSets = [];
    usedSetIds = new Set();

    if (typeof MATCHING_QUESTIONS !== 'undefined') {
      matchingSets = matchingSets.concat(MATCHING_QUESTIONS);
    }
    if (typeof PRONOUN_MATCHING_QUESTIONS !== 'undefined') {
      matchingSets = matchingSets.concat(PRONOUN_MATCHING_QUESTIONS);
    }
  }

  /**
   * Get a matching set for given difficulty and category
   * @param {number} difficulty - 1, 2, or 3
   * @param {string} category - 'matching' or 'pronoun_matching' or null for any
   * @returns {Object|null} A matching set or null
   */
  function getMatchingSet(difficulty, category) {
    var available = matchingSets.filter(function(s) {
      var diffMatch = Math.abs(s.difficulty - difficulty) <= 1;
      var catMatch = !category || s.category === category;
      var notUsed = !usedSetIds.has(s.id);
      return diffMatch && catMatch && notUsed;
    });

    // If no unused, allow repeats
    if (available.length === 0) {
      available = matchingSets.filter(function(s) {
        var diffMatch = Math.abs(s.difficulty - difficulty) <= 1;
        var catMatch = !category || s.category === category;
        return diffMatch && catMatch;
      });
    }

    // Prefer exact difficulty match
    var exact = available.filter(function(s) { return s.difficulty === difficulty; });
    if (exact.length > 0) {
      available = exact;
    }

    if (available.length === 0) return null;

    var selected = available[Math.floor(Math.random() * available.length)];
    usedSetIds.add(selected.id);
    return selected;
  }

  /**
   * Start a matching session with a set
   * @param {Object} set - Matching question set with pairs array
   */
  function startMatching(set) {
    currentSet = set;
    failed = false;
    selectedItem = null;

    // Create remaining pairs with original indices for tracking
    remainingPairs = set.pairs.map(function(pair, i) {
      return { left: pair.left, right: pair.right, index: i, matched: false };
    });
  }

  /**
   * Shuffle an array (Fisher-Yates)
   * @param {Array} arr - Array to shuffle
   * @returns {Array} New shuffled array
   */
  function shuffle(arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  /**
   * Get shuffled left and right columns for display
   * @returns {Object} { leftItems, rightItems } with shuffled order
   */
  function getDisplayItems() {
    var active = remainingPairs.filter(function(p) { return !p.matched; });
    var leftItems = shuffle(active.map(function(p) { return { text: p.left, pairIndex: p.index }; }));
    var rightItems = shuffle(active.map(function(p) { return { text: p.right, pairIndex: p.index }; }));
    return { leftItems: leftItems, rightItems: rightItems };
  }

  /**
   * Select an item from a column
   * @param {string} side - 'left' or 'right'
   * @param {number} pairIndex - The pair index of the clicked item
   * @returns {Object} Result: { type: 'selected'|'match'|'mismatch'|'complete'|'fail', ... }
   */
  function selectItem(side, pairIndex) {
    if (failed) return { type: 'fail' };

    if (!selectedItem) {
      // First selection
      selectedItem = { side: side, pairIndex: pairIndex };
      return { type: 'selected', side: side, pairIndex: pairIndex };
    }

    // Second selection - must be opposite side
    if (selectedItem.side === side) {
      // Same side - switch selection
      selectedItem = { side: side, pairIndex: pairIndex };
      return { type: 'selected', side: side, pairIndex: pairIndex };
    }

    // Check if pair matches
    var leftIndex = side === 'left' ? pairIndex : selectedItem.pairIndex;
    var rightIndex = side === 'right' ? pairIndex : selectedItem.pairIndex;

    if (leftIndex === rightIndex) {
      // Correct match!
      for (var i = 0; i < remainingPairs.length; i++) {
        if (remainingPairs[i].index === leftIndex) {
          remainingPairs[i].matched = true;
          break;
        }
      }
      selectedItem = null;

      if (isComplete()) {
        return { type: 'complete' };
      }
      return { type: 'match', pairIndex: leftIndex };
    } else {
      // Wrong match - fail the encounter
      failed = true;
      selectedItem = null;
      return { type: 'mismatch', leftPairIndex: leftIndex, rightPairIndex: rightIndex };
    }
  }

  /**
   * Check if all pairs have been matched
   * @returns {boolean} Whether matching is complete
   */
  function isComplete() {
    return remainingPairs.every(function(p) { return p.matched; });
  }

  /**
   * Check if matching has failed
   * @returns {boolean} Whether a mismatch occurred
   */
  function hasFailed() {
    return failed;
  }

  /**
   * Get the current set
   * @returns {Object|null} Current matching set
   */
  function getCurrentSet() {
    return currentSet;
  }

  /**
   * Reset used set IDs (for new game)
   */
  function resetUsed() {
    usedSetIds = new Set();
  }

  /**
   * Get used set IDs (for save)
   * @returns {Array} Array of used set IDs
   */
  function getUsedIds() {
    return Array.from(usedSetIds);
  }

  /**
   * Set used set IDs (for load)
   * @param {Array} ids - Array of set IDs
   */
  function setUsedIds(ids) {
    usedSetIds = new Set(ids);
  }

  /**
   * Get stats about available matching sets
   * @returns {Object} Stats
   */
  function getStats() {
    return {
      total: matchingSets.length,
      matching: matchingSets.filter(function(s) { return s.category === 'matching'; }).length,
      pronoun_matching: matchingSets.filter(function(s) { return s.category === 'pronoun_matching'; }).length,
      used: usedSetIds.size
    };
  }

  return {
    init: init,
    getMatchingSet: getMatchingSet,
    startMatching: startMatching,
    getDisplayItems: getDisplayItems,
    selectItem: selectItem,
    isComplete: isComplete,
    hasFailed: hasFailed,
    getCurrentSet: getCurrentSet,
    resetUsed: resetUsed,
    getUsedIds: getUsedIds,
    setUsedIds: setUsedIds,
    getStats: getStats,
    shuffle: shuffle
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Matching;
}
