/**
 * Sentences Module
 * Sentence-builder encounters: the player arranges shuffled Polish word tiles
 * into a sentence that means the English prompt. Extra tiles (random words,
 * wrong forms, look-alikes) are mixed in. Nothing is judged until confirm();
 * a near miss (one word wrong, missing, extra or out of place) marks the
 * faulty tiles and allows one fix-up, the second confirm is final.
 */

var Sentences = (function() {
  var sentenceSets = [];
  var usedIds = new Set();

  // Current session
  var current = null;   // the question
  var tiles = [];       // [{ id, word }] in pool order
  var placed = [];      // tile ids in sentence order
  var marks = {};       // tileId -> 'wrong' | 'misplaced'
  var gaps = [];        // indices in `placed` where a word is missing
  var attempt = 0;
  var finished = false;

  function init() {
    sentenceSets = typeof SENTENCE_QUESTIONS !== 'undefined' ? SENTENCE_QUESTIONS.slice() : [];
    usedIds = new Set();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** Every distractor of a question, whatever its kind */
  function distractorsOf(q) {
    var d = q.distractors || {};
    if (Array.isArray(d)) return d.slice();
    return [].concat(d.random || [], d.form || [], d.lookalike || []);
  }

  /** The words on the tiles: every word any accepted answer uses, then the distractors */
  function poolWords(q) {
    var words = [];
    var counts = {};
    q.answers.forEach(function(ans) {
      var need = {};
      ans.forEach(function(w) { need[w] = (need[w] || 0) + 1; });
      Object.keys(need).forEach(function(w) {
        while ((counts[w] || 0) < need[w]) {
          words.push(w);
          counts[w] = (counts[w] || 0) + 1;
        }
      });
    });
    return words.concat(distractorsOf(q));
  }

  /**
   * Pick a sentence near the given difficulty (exact preferred, unused first)
   * @param {number} difficulty - 1, 2 or 3
   * @returns {Object|null} question
   */
  function getSentence(difficulty) {
    var near = function(s) { return Math.abs(s.difficulty - difficulty) <= 1; };
    var available = sentenceSets.filter(function(s) { return near(s) && !usedIds.has(s.id); });
    if (available.length === 0) available = sentenceSets.filter(near);
    var exact = available.filter(function(s) { return s.difficulty === difficulty; });
    if (exact.length > 0) available = exact;
    if (available.length === 0) return null;
    var q = available[Math.floor(Math.random() * available.length)];
    usedIds.add(q.id);
    return q;
  }

  function start(q) {
    current = q;
    tiles = shuffle(poolWords(q)).map(function(word, i) { return { id: 't' + i, word: word }; });
    placed = [];
    marks = {};
    gaps = [];
    attempt = 0;
    finished = false;
  }

  function hasTile(id) {
    for (var i = 0; i < tiles.length; i++) if (tiles[i].id === id) return true;
    return false;
  }

  function wordOf(id) {
    for (var i = 0; i < tiles.length; i++) if (tiles[i].id === id) return tiles[i].word;
    return null;
  }

  /** Any edit forgets the mark on the tile it touches and the gap markers */
  function touched(id) {
    delete marks[id];
    gaps = [];
  }

  /**
   * Put a tile into the sentence at `index` (moving it if already placed);
   * the index counts the other tiles, the sentence as it is without this one
   * @returns {boolean} whether anything changed
   */
  function place(id, index) {
    if (finished || !hasTile(id)) return false;
    var from = placed.indexOf(id);
    if (from !== -1) placed.splice(from, 1);
    if (typeof index !== 'number' || index < 0 || index > placed.length) index = placed.length;
    placed.splice(index, 0, id);
    touched(id);
    return true;
  }

  function append(id) {
    if (placed.indexOf(id) !== -1) return false;
    return place(id, placed.length);
  }

  function move(id, index) {
    if (placed.indexOf(id) === -1) return false;
    return place(id, index);
  }

  function remove(id) {
    if (finished) return false;
    var at = placed.indexOf(id);
    if (at === -1) return false;
    placed.splice(at, 1);
    touched(id);
    return true;
  }

  function clear() {
    if (finished) return false;
    placed = [];
    marks = {};
    gaps = [];
    return true;
  }

  function getState() {
    var inSentence = {};
    placed.forEach(function(id) { inSentence[id] = true; });
    return {
      tiles: tiles.map(function(t) { return { id: t.id, word: t.word, placed: !!inSentence[t.id] }; }),
      placed: placed.slice(),
      pool: tiles.filter(function(t) { return !inSentence[t.id]; }).map(function(t) { return t.id; }),
      marks: Object.assign({}, marks),
      gaps: gaps.slice(),
      attempt: attempt,
      finished: finished
    };
  }

  function norm(w) {
    return String(w).toLowerCase().replace(/[.,!?;:"]/g, '').trim();
  }

  /** Longest common subsequence of two word lists, as [[i, j], ...] index pairs */
  function lcsPairs(a, b) {
    var n = a.length, m = b.length;
    var dp = [];
    var i, j;
    for (i = 0; i <= n; i++) { dp.push([]); for (j = 0; j <= m; j++) dp[i].push(0); }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var pairs = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return pairs;
  }

  /**
   * Compare the placed words against one accepted answer.
   * Words in the longest common subsequence are in place; a leftover placed
   * word the answer still needs is misplaced, any other leftover is wrong;
   * answer words nobody supplied are missing. A wrong word standing where a
   * missing one belongs is a substitution and costs one, not two.
   */
  function compare(words, answer) {
    var pairs = lcsPairs(words, answer);
    var inLcsP = {}, inLcsA = {};
    pairs.forEach(function(p) { inLcsP[p[0]] = true; inLcsA[p[1]] = true; });

    var needed = {};   // answer words outside the LCS: word -> [answer indices]
    answer.forEach(function(w, j) {
      if (!inLcsA[j]) (needed[w] = needed[w] || []).push(j);
    });

    var status = [];   // per placed index
    words.forEach(function(w, i) {
      if (inLcsP[i]) { status.push('ok'); return; }
      if (needed[w] && needed[w].length) { needed[w].shift(); status.push('misplaced'); return; }
      status.push('wrong');
    });

    // where each missing answer word belongs in the placed sentence
    var missing = [];
    Object.keys(needed).forEach(function(w) {
      needed[w].forEach(function(j) {
        var at = 0;
        pairs.forEach(function(p) { if (p[1] < j) at = p[0] + 1; });
        missing.push(at);
      });
    });
    missing.sort(function(x, y) { return x - y; });

    // a wrong word at the spot of a missing one is a substitution
    var gapsOut = [];
    var substituted = {};
    missing.forEach(function(at) {
      if (status[at] === 'wrong' && !substituted[at]) { substituted[at] = true; return; }
      gapsOut.push(at);
    });

    var wrong = status.filter(function(s) { return s === 'wrong'; }).length;
    var misplaced = status.filter(function(s) { return s === 'misplaced'; }).length;
    return { status: status, gaps: gapsOut, cost: misplaced + wrong + gapsOut.length };
  }

  /** How many faults still count as "almost": one, two for long sentences */
  function nearLimit(answer) {
    return answer.length >= 6 ? 2 : 1;
  }

  /**
   * Judge a list of words against a question's accepted answers
   * @param {Object} q - question
   * @param {Array<string>} words - the sentence as placed
   * @returns {{ verdict: 'correct'|'near'|'wrong', cost, status, gaps, answer }}
   */
  function evaluate(q, words) {
    var placedN = words.map(norm);
    var best = null;
    q.answers.forEach(function(ans) {
      var c = compare(placedN, ans.map(norm));
      c.answer = ans;
      if (!best || c.cost < best.cost) best = c;
    });
    var verdict = 'wrong';
    if (best.cost === 0) verdict = 'correct';
    else if (placedN.length > 0 && best.cost <= nearLimit(best.answer)) verdict = 'near';
    best.verdict = verdict;
    return best;
  }

  /** The canonical answer as a written sentence: capitalised, with a full stop */
  function canonical(q) {
    var s = q.answers[0].join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
  }

  /**
   * Judge the sentence as placed.
   * @returns {{ verdict: 'correct'|'near'|'wrong', final: boolean, marks, gaps, sentence }}
   */
  function confirm() {
    if (!current || finished) return null;
    var r = evaluate(current, placed.map(wordOf));
    marks = {};
    gaps = [];
    placed.forEach(function(id, i) { if (r.status[i] !== 'ok') marks[id] = r.status[i]; });
    if (r.verdict === 'near' && attempt === 0) {
      attempt = 1;
      gaps = r.gaps.slice();
      return { verdict: 'near', final: false, marks: Object.assign({}, marks), gaps: gaps.slice(), sentence: canonical(current) };
    }
    finished = true;
    return {
      verdict: r.verdict === 'correct' ? 'correct' : 'wrong',
      final: true,
      marks: Object.assign({}, marks),
      gaps: [],
      sentence: canonical(current)
    };
  }

  function getCurrent() { return current; }
  function resetUsed() { usedIds = new Set(); }
  function getUsedIds() { return Array.from(usedIds); }
  function setUsedIds(ids) { usedIds = new Set(ids || []); }

  function getStats() {
    var by = { 1: 0, 2: 0, 3: 0 };
    sentenceSets.forEach(function(s) { by[s.difficulty] = (by[s.difficulty] || 0) + 1; });
    return { total: sentenceSets.length, byDifficulty: by, used: usedIds.size };
  }

  return {
    init: init,
    getSentence: getSentence,
    start: start,
    place: place,
    append: append,
    move: move,
    remove: remove,
    clear: clear,
    getState: getState,
    evaluate: evaluate,
    confirm: confirm,
    canonical: canonical,
    poolWords: poolWords,
    distractorsOf: distractorsOf,
    getCurrent: getCurrent,
    resetUsed: resetUsed,
    getUsedIds: getUsedIds,
    setUsedIds: setUsedIds,
    getStats: getStats
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sentences;
}
