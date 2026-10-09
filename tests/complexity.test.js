/**
 * Complexity Module Tests
 */

TestRunner.suite('Complexity Module', () => {
  function setup(level) {
    Questions.init();
    Matching.init();
    Sentences.init();
    Complexity.set(level);
  }

  function draw(n, fn) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(fn());
    return out;
  }

  TestRunner.test('defaults to regular and ignores unknown levels', () => {
    TestRunner.assertEqual(Complexity.DEFAULT, 'regular', 'default is regular');
    TestRunner.assertEqual(Complexity.set('nightmare'), false, 'unknown level refused');
    TestRunner.assert(['easy', 'medium', 'regular'].indexOf(Complexity.get()) !== -1, 'a known level');
  });

  TestRunner.test('easy asks only difficulty 1 questions, never grammar, bosses included', () => {
    setup('easy');
    const qs = draw(150, () => Complexity.question(3, false)).concat(draw(30, () => Complexity.question(3, true)));
    TestRunner.assert(qs.every(q => q && q.difficulty === 1), 'all difficulty 1');
    TestRunner.assert(qs.every(q => q.category !== 'grammar'), 'no grammar');
    Complexity.set('regular');
  });

  TestRunner.test('easy stays at difficulty 1 once the level 1 pool is used up', () => {
    setup('easy');
    const qs = draw(600, () => Complexity.question(2, false));
    TestRunner.assert(qs.every(q => q && q.difficulty === 1), 'repeats rather than harder questions');
    Complexity.set('regular');
  });

  TestRunner.test('medium keeps the grading but drops grammar', () => {
    setup('medium');
    const hard = draw(100, () => Complexity.question(3, false));
    TestRunner.assert(hard.every(q => q.category !== 'grammar'), 'no grammar');
    TestRunner.assert(hard.some(q => q.difficulty === 3), 'hard questions still asked');
    const boss = draw(20, () => Complexity.question(1, true));
    TestRunner.assert(boss.every(q => q.difficulty === 3 && q.category !== 'grammar'), 'boss asks hard vocabulary');
  });

  TestRunner.test('regular keeps grammar questions', () => {
    setup('regular');
    const qs = draw(300, () => Complexity.question(2, false));
    TestRunner.assert(qs.some(q => q.category === 'grammar'), 'grammar asked');
    Complexity.set('regular');
  });

  TestRunner.test('pronoun matching is dropped below regular', () => {
    setup('medium');
    TestRunner.assertEqual(Complexity.matchingSet(2, 'pronoun_matching').category, 'matching', 'medium: word matching');
    setup('easy');
    const sets = draw(100, () => Complexity.matchingSet(3, 'pronoun_matching'));
    TestRunner.assert(sets.every(s => s.category === 'matching' && s.difficulty === 1), 'easy: level 1 word matching');
    setup('regular');
    TestRunner.assertEqual(Complexity.matchingSet(2, 'pronoun_matching').category, 'pronoun_matching', 'regular keeps it');
    Complexity.set('regular');
  });

  TestRunner.test('easy sentences are level 1 only', () => {
    setup('easy');
    const items = draw(120, () => Complexity.sentence(3));
    TestRunner.assert(items.every(s => s.difficulty === 1), 'level 1 sentences');
    setup('medium');
    TestRunner.assertEqual(Complexity.sentence(3).difficulty, 3, 'medium keeps the grade');
  });

  TestRunner.test('combat draws through the complexity', () => {
    setup('easy');
    Player.create('ComplexityTester');
    Combat.clearEncounter();
    const enc = Combat.startEncounter({ id: 'dragon', name: 'Dragon', boss: true, loot: [] }, 3);
    TestRunner.assertEqual(enc.question.difficulty, 1, 'easy boss question');
    TestRunner.assert(enc.question.category !== 'grammar', 'no grammar');
    Combat.clearEncounter();
    Complexity.set('regular');
  });
});
