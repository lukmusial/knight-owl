/**
 * Complexity Module
 * The player's chosen complexity (picked on the launchers, kept in
 * localStorage) and how it shapes the questions every encounter draws:
 *  - easy: no grammar questions or pronoun matching, and only difficulty 1,
 *    whatever the monster's own difficulty (bosses included)
 *  - medium: no grammar questions or pronoun matching, difficulty
 *    graded by depth / monster as usual
 *  - regular (default): everything, graded as usual
 */

var Complexity = (function() {
  var KEY = 'mrowl_complexity';
  var DEFAULT = 'regular';
  var LEVELS = {
    easy: { label: 'Easy', labelPL: 'Łatwy' },
    medium: { label: 'Medium', labelPL: 'Średni' },
    regular: { label: 'Regular', labelPL: 'Normalny' }
  };
  // used when localStorage is unavailable (blocked, or node tests)
  var memory = null;

  function get() {
    try {
      var v = (typeof localStorage !== 'undefined') ? localStorage.getItem(KEY) : null;
      if (LEVELS[v]) return v;
    } catch (e) { /* storage blocked */ }
    return LEVELS[memory] ? memory : DEFAULT;
  }

  function set(level) {
    if (!LEVELS[level]) return false;
    memory = level;
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, level);
    } catch (e) { /* storage blocked */ }
    return true;
  }

  function isEasy() {
    return get() === 'easy';
  }

  function dropsGrammar() {
    return get() !== 'regular';
  }

  /** Difficulty an encounter asks for once the complexity is applied */
  function level(difficulty) {
    return isEasy() ? 1 : difficulty;
  }

  /** Matching category once the complexity is applied (pronoun matching is grammar) */
  function matchingCategory(category) {
    return dropsGrammar() ? 'matching' : category;
  }

  /** Quiz question for an encounter; a boss asks the hardest ones, with repeats */
  function question(difficulty, boss) {
    return Questions.getQuestion(level(boss ? 3 : difficulty), null, !!boss, {
      exclude: dropsGrammar() ? ['grammar'] : [],
      exact: isEasy()
    });
  }

  function matchingSet(difficulty, category) {
    return Matching.getMatchingSet(level(difficulty), matchingCategory(category), isEasy());
  }

  function sentence(difficulty) {
    return Sentences.getSentence(level(difficulty), isEasy());
  }

  /**
   * Wire a row of buttons carrying data-complexity: marks the current one
   * and remembers a click
   */
  function bindPicker(container) {
    if (!container) return;
    var buttons = container.querySelectorAll('[data-complexity]');
    function mark() {
      var cur = get();
      for (var i = 0; i < buttons.length; i++) {
        var on = buttons[i].getAttribute('data-complexity') === cur;
        buttons[i].classList.toggle('selected', on);
        buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
        set(e.currentTarget.getAttribute('data-complexity'));
        mark();
      });
    }
    mark();
  }

  return {
    LEVELS: LEVELS,
    DEFAULT: DEFAULT,
    get: get,
    set: set,
    level: level,
    matchingCategory: matchingCategory,
    question: question,
    matchingSet: matchingSet,
    sentence: sentence,
    bindPicker: bindPicker
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Complexity;
}
