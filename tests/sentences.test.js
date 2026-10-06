/**
 * Sentences Module Tests (sentence-builder encounters)
 */

TestRunner.suite('Sentences Module', () => {
  var CAT = {
    id: 'fx_cat', difficulty: 1, category: 'sentence', prompt: 'The cat drinks milk.',
    answers: [['kot', 'pije', 'mleko']],
    distractors: { random: ['okno', 'zielony'], form: [], lookalike: [] },
    explanation: ''
  };
  var KEY = {
    id: 'fx_key', difficulty: 3, category: 'sentence', prompt: 'I must give the key to my brother.',
    answers: [['muszę', 'dać', 'bratu', 'klucz'], ['muszę', 'dać', 'klucz', 'bratu']],
    distractors: { random: ['kubek'], form: ['brata', 'klucza', 'dam'], lookalike: ['klocek'] },
    explanation: ''
  };
  var DOG = {
    id: 'fx_dog', difficulty: 1, category: 'sentence', prompt: 'I have a dog.',
    answers: [['mam', 'psa'], ['ja', 'mam', 'psa']],
    distractors: { random: ['but', 'szybko'], form: [], lookalike: [] },
    explanation: ''
  };

  function setup() {
    Sentences.init();
    Sentences.resetUsed();
  }

  /** Tile id carrying a word (the first one not yet placed) */
  function tileFor(word) {
    var st = Sentences.getState();
    for (var i = 0; i < st.tiles.length; i++) {
      if (st.tiles[i].word === word && !st.tiles[i].placed) return st.tiles[i].id;
    }
    return null;
  }

  /** Tile id of a word already in the sentence */
  function placedTile(word) {
    var st = Sentences.getState();
    for (var i = 0; i < st.tiles.length; i++) {
      if (st.tiles[i].word === word && st.tiles[i].placed) return st.tiles[i].id;
    }
    return null;
  }

  function build(words) {
    words.forEach(function(w) { Sentences.append(tileFor(w)); });
  }

  function placedWords() {
    var st = Sentences.getState();
    var byId = {};
    st.tiles.forEach(function(t) { byId[t.id] = t.word; });
    return st.placed.map(function(id) { return byId[id]; });
  }

  TestRunner.test('loads the sentence data', () => {
    setup();
    var stats = Sentences.getStats();
    TestRunner.assert(stats.total > 0, 'should have sentences loaded');
    TestRunner.assert(stats.byDifficulty[1] > 0 && stats.byDifficulty[2] > 0 && stats.byDifficulty[3] > 0,
      'should have sentences at every difficulty');
  });

  TestRunner.test('getSentence prefers the exact difficulty and records it as used', () => {
    setup();
    [1, 2, 3].forEach(function(d) {
      var q = Sentences.getSentence(d);
      TestRunner.assertEqual(q.difficulty, d, 'difficulty ' + d);
      TestRunner.assert(Sentences.getUsedIds().indexOf(q.id) !== -1, 'used ids should include ' + q.id);
    });
  });

  TestRunner.test('getSentence does not repeat until the difficulty runs out', () => {
    setup();
    var n = Sentences.getStats().byDifficulty[1];
    var seen = {};
    for (var i = 0; i < n; i++) {
      var q = Sentences.getSentence(1);
      TestRunner.assert(!seen[q.id], 'repeated ' + q.id + ' after ' + i + ' picks');
      seen[q.id] = true;
    }
    TestRunner.assertTruthy(Sentences.getSentence(1), 'should fall back to repeats once all are used');
  });

  TestRunner.test('setUsedIds restores what a save remembered', () => {
    setup();
    Sentences.setUsedIds(['a', 'b']);
    TestRunner.assertEqual(Sentences.getUsedIds().length, 2, 'two ids restored');
    Sentences.resetUsed();
    TestRunner.assertEqual(Sentences.getUsedIds().length, 0, 'reset clears them');
  });

  TestRunner.test('start deals every answer word once plus the distractors', () => {
    setup();
    Sentences.start(DOG);
    var words = Sentences.getState().tiles.map(function(t) { return t.word; }).sort();
    TestRunner.assertEqual(words.join(','), ['but', 'ja', 'mam', 'psa', 'szybko'].sort().join(','),
      'the optional "ja" is a tile, shared words are not doubled');
  });

  TestRunner.test('append, place, move and remove keep strip and pool complete and disjoint', () => {
    setup();
    Sentences.start(KEY);
    var total = Sentences.getState().tiles.length;
    build(['dać', 'muszę', 'klucz']);
    TestRunner.assertEqual(placedWords().join(' '), 'dać muszę klucz', 'append adds at the end');
    Sentences.move(placedTile('muszę'), 0);
    TestRunner.assertEqual(placedWords().join(' '), 'muszę dać klucz', 'move puts a tile at an index');
    Sentences.place(tileFor('bratu'), 2);
    TestRunner.assertEqual(placedWords().join(' '), 'muszę dać bratu klucz', 'place inserts from the pool');
    Sentences.remove(placedTile('muszę'));
    TestRunner.assertEqual(placedWords().join(' '), 'dać bratu klucz', 'remove sends a tile back');
    var st = Sentences.getState();
    TestRunner.assertEqual(st.placed.length + st.pool.length, total, 'every tile is in exactly one place');
    st.placed.forEach(function(id) {
      TestRunner.assert(st.pool.indexOf(id) === -1, id + ' is both placed and in the pool');
    });
    TestRunner.assert(!Sentences.append(st.placed[0]), 'appending a placed tile does nothing');
    TestRunner.assert(!Sentences.move(st.pool[0], 0), 'moving a pool tile does nothing');
  });

  TestRunner.test('move counts the other tiles; clear empties the strip', () => {
    setup();
    Sentences.start(CAT);
    build(['kot', 'pije', 'mleko']);
    Sentences.move(placedTile('kot'), 2);
    TestRunner.assertEqual(placedWords().join(' '), 'pije mleko kot', 'index 2 of the other two is the end');
    Sentences.move(placedTile('kot'), 1);
    TestRunner.assertEqual(placedWords().join(' '), 'pije kot mleko', 'between the others');
    Sentences.clear();
    TestRunner.assertEqual(Sentences.getState().placed.length, 0, 'clear empties the strip');
  });

  TestRunner.test('evaluate: exact and alternative orders are correct, case does not matter', () => {
    TestRunner.assertEqual(Sentences.evaluate(CAT, ['kot', 'pije', 'mleko']).verdict, 'correct', 'canonical');
    TestRunner.assertEqual(Sentences.evaluate(CAT, ['Kot', 'pije', 'mleko.']).verdict, 'correct', 'capital and stop');
    TestRunner.assertEqual(Sentences.evaluate(KEY, ['muszę', 'dać', 'klucz', 'bratu']).verdict, 'correct', 'other order');
    TestRunner.assertEqual(Sentences.evaluate(DOG, ['ja', 'mam', 'psa']).verdict, 'correct', 'optional pronoun');
    TestRunner.assertEqual(Sentences.evaluate(DOG, ['mam', 'psa']).verdict, 'correct', 'without pronoun');
  });

  TestRunner.test('evaluate: one wrong form is near and marks that word', () => {
    var r = Sentences.evaluate(CAT, ['kot', 'pije', 'okno']);
    TestRunner.assertEqual(r.verdict, 'near', 'substitution');
    TestRunner.assertEqual(r.status.join(','), 'ok,ok,wrong', 'only the wrong word is marked');
    TestRunner.assertEqual(r.gaps.length, 0, 'a substitution leaves no gap');
  });

  TestRunner.test('evaluate: one missing word is near with a gap where it belongs', () => {
    var r = Sentences.evaluate(CAT, ['kot', 'mleko']);
    TestRunner.assertEqual(r.verdict, 'near', 'missing word');
    TestRunner.assertEqual(r.status.join(','), 'ok,ok', 'nothing placed is wrong');
    TestRunner.assertEqual(r.gaps.join(','), '1', 'gap before mleko');
    var first = Sentences.evaluate(CAT, ['pije', 'mleko']);
    TestRunner.assertEqual(first.gaps.join(','), '0', 'gap at the start');
    var last = Sentences.evaluate(CAT, ['kot', 'pije']);
    TestRunner.assertEqual(last.gaps.join(','), '2', 'gap at the end');
  });

  TestRunner.test('evaluate: one extra word is near and marked wrong', () => {
    var r = Sentences.evaluate(CAT, ['kot', 'zielony', 'pije', 'mleko']);
    TestRunner.assertEqual(r.verdict, 'near', 'extra word');
    TestRunner.assertEqual(r.status.join(','), 'ok,wrong,ok,ok', 'the extra word is marked');
  });

  TestRunner.test('evaluate: one word out of place is near and marked misplaced', () => {
    var r = Sentences.evaluate(CAT, ['pije', 'kot', 'mleko']);
    TestRunner.assertEqual(r.verdict, 'near', 'swapped pair');
    TestRunner.assertEqual(r.status.filter(function(s) { return s === 'misplaced'; }).length, 1, 'one tile misplaced');
    TestRunner.assertEqual(r.status.filter(function(s) { return s === 'wrong'; }).length, 0, 'nothing wrong');
    var key = Sentences.evaluate(KEY, ['muszę', 'klucz', 'dać', 'bratu']);
    TestRunner.assertEqual(key.verdict, 'near', 'moved word against the closest answer');
  });

  TestRunner.test('evaluate: two or more faults are wrong, an empty strip is wrong', () => {
    TestRunner.assertEqual(Sentences.evaluate(CAT, ['kot', 'okno', 'zielony']).verdict, 'wrong', 'two faults');
    TestRunner.assertEqual(Sentences.evaluate(KEY, ['dam', 'klucza', 'bratu', 'muszę']).verdict, 'wrong', 'three faults');
    TestRunner.assertEqual(Sentences.evaluate(CAT, []).verdict, 'wrong', 'nothing placed');
  });

  TestRunner.test('confirm: a near miss marks tiles once, the second confirm is final', () => {
    setup();
    Sentences.start(CAT);
    build(['kot', 'pije', 'okno']);
    var first = Sentences.confirm();
    TestRunner.assertEqual(first.verdict, 'near', 'first try is near');
    TestRunner.assert(!first.final, 'not final yet');
    var wrongId = placedTile('okno');
    TestRunner.assertEqual(Sentences.getState().marks[wrongId], 'wrong', 'the wrong tile is marked');

    Sentences.remove(wrongId);
    TestRunner.assertEqual(Sentences.getState().marks[wrongId], undefined, 'editing a tile clears its mark');
    Sentences.append(tileFor('zielony'));
    var second = Sentences.confirm();
    TestRunner.assertEqual(second.verdict, 'wrong', 'a second near miss is a failure');
    TestRunner.assert(second.final, 'final');
    TestRunner.assert(!Sentences.append(tileFor('mleko')), 'no edits after the verdict');
  });

  TestRunner.test('confirm: fixing the marked word after a near miss wins', () => {
    setup();
    Sentences.start(CAT);
    build(['kot', 'pije', 'okno']);
    Sentences.confirm();
    Sentences.remove(placedTile('okno'));
    Sentences.append(tileFor('mleko'));
    var r = Sentences.confirm();
    TestRunner.assertEqual(r.verdict, 'correct', 'fixed sentence is correct');
    TestRunner.assertEqual(r.sentence, 'Kot pije mleko.', 'canonical sentence is written out');
  });

  TestRunner.test('confirm: a far-off sentence fails at once', () => {
    setup();
    Sentences.start(CAT);
    build(['okno', 'zielony']);
    var r = Sentences.confirm();
    TestRunner.assertEqual(r.verdict, 'wrong', 'wrong');
    TestRunner.assert(r.final, 'no fix-up for a far miss');
  });
});
