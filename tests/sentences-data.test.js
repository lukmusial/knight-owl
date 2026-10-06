/**
 * Sentence Builder Data Validation Tests
 * Shape of every item, word counts and the distractor mix per difficulty:
 * level 1 random words only, level 2 random plus wrong forms, level 3
 * mostly wrong forms with a look-alike now and then.
 */

TestRunner.suite('Sentence Data', () => {
  var WORD = /^[a-ząćęłńóśźż]+$/;
  var WORDS = { 1: [2, 4], 2: [3, 5], 3: [3, 4] };

  function byDifficulty(d) {
    return SENTENCE_QUESTIONS.filter(function(q) { return q.difficulty === d; });
  }

  TestRunner.test('every item has the fields the module needs', () => {
    SENTENCE_QUESTIONS.forEach(function(q) {
      TestRunner.assertTruthy(q.id && q.prompt && q.explanation, q.id + ' missing text fields');
      TestRunner.assertEqual(q.category, 'sentence', q.id + ' category');
      TestRunner.assert([1, 2, 3].indexOf(q.difficulty) !== -1, q.id + ' difficulty');
      TestRunner.assert(Array.isArray(q.answers) && q.answers.length > 0, q.id + ' answers');
      TestRunner.assert(/\.$/.test(q.prompt), q.id + ' prompt should end with a full stop');
    });
  });

  TestRunner.test('ids are unique', () => {
    var seen = {};
    SENTENCE_QUESTIONS.forEach(function(q) {
      TestRunner.assert(!seen[q.id], 'duplicate id ' + q.id);
      seen[q.id] = true;
    });
  });

  TestRunner.test('tiles are single lowercase words', () => {
    SENTENCE_QUESTIONS.forEach(function(q) {
      Sentences.poolWords(q).forEach(function(w) {
        TestRunner.assert(WORD.test(w), q.id + ' bad tile "' + w + '"');
      });
    });
  });

  TestRunner.test('answers fit their level and repeat no word', () => {
    SENTENCE_QUESTIONS.forEach(function(q) {
      var range = WORDS[q.difficulty];
      q.answers.forEach(function(ans) {
        TestRunner.assert(ans.length >= range[0] && ans.length <= range[1],
          q.id + ' has ' + ans.length + ' words, level ' + q.difficulty + ' wants ' + range.join('-'));
        var seen = {};
        ans.forEach(function(w) {
          TestRunner.assert(!seen[w], q.id + ' repeats "' + w + '"');
          seen[w] = true;
        });
      });
    });
  });

  TestRunner.test('no distractor is a word of any accepted answer, none repeats', () => {
    SENTENCE_QUESTIONS.forEach(function(q) {
      var inAnswer = {};
      q.answers.forEach(function(ans) { ans.forEach(function(w) { inAnswer[w] = true; }); });
      var seen = {};
      Sentences.distractorsOf(q).forEach(function(w) {
        TestRunner.assert(!inAnswer[w], q.id + ' distractor "' + w + '" is in an answer');
        TestRunner.assert(!seen[w], q.id + ' distractor "' + w + '" twice');
        seen[w] = true;
      });
    });
  });

  TestRunner.test('distractor mix grows trickier with difficulty', () => {
    SENTENCE_QUESTIONS.forEach(function(q) {
      var d = q.distractors;
      var r = d.random.length, f = d.form.length, l = d.lookalike.length;
      if (q.difficulty === 1) {
        TestRunner.assert(r === 2 && f === 0 && l === 0, q.id + ' level 1 takes two random words only');
      } else if (q.difficulty === 2) {
        TestRunner.assert(r === 2 && f === 2 && l === 0, q.id + ' level 2 takes two random and two wrong forms');
      } else {
        TestRunner.assert(r === 1 && f >= 3 && l <= 1 && r + f + l === 5,
          q.id + ' level 3 takes one random word and four traps');
      }
    });
    var withLookalike = byDifficulty(3).filter(function(q) { return q.distractors.lookalike.length > 0; }).length;
    TestRunner.assert(withLookalike > 0 && withLookalike < byDifficulty(3).length,
      'some but not all level 3 sentences have a look-alike');
  });

  TestRunner.test('every accepted answer is judged correct against its own item', () => {
    SENTENCE_QUESTIONS.forEach(function(q) {
      q.answers.forEach(function(ans) {
        TestRunner.assertEqual(Sentences.evaluate(q, ans).verdict, 'correct', q.id + ' ' + ans.join(' '));
      });
    });
  });

  TestRunner.test('the pool is as large as the grammar pool and covers every level', () => {
    TestRunner.assert(SENTENCE_QUESTIONS.length >= GRAMMAR_QUESTIONS.length,
      SENTENCE_QUESTIONS.length + ' sentences, ' + GRAMMAR_QUESTIONS.length + ' grammar questions');
    [1, 2, 3].forEach(function(d) {
      TestRunner.assert(byDifficulty(d).length >= 60, 'level ' + d + ' has ' + byDifficulty(d).length);
    });
  });
});
