/**
 * Questions Module Tests
 */

TestRunner.suite('Questions Module', () => {
  // Initialize questions for tests
  Questions.init();

  TestRunner.test('should initialize with questions from data files', () => {
    const stats = Questions.getQuestionStats();
    TestRunner.assert(stats.total > 0, 'Should have questions loaded');
  });

  TestRunner.test('should have vocabulary questions', () => {
    const stats = Questions.getQuestionStats();
    TestRunner.assert(stats.vocabulary > 0, 'Should have vocabulary questions');
  });

  TestRunner.test('should have grammar questions', () => {
    const stats = Questions.getQuestionStats();
    TestRunner.assert(stats.grammar > 0, 'Should have grammar questions');
  });

  TestRunner.test('should have questions at all difficulty levels', () => {
    const stats = Questions.getQuestionStats();
    TestRunner.assert(stats.easy > 0, 'Should have easy questions');
    TestRunner.assert(stats.medium > 0, 'Should have medium questions');
    TestRunner.assert(stats.hard > 0, 'Should have hard questions');
  });

  TestRunner.test('getQuestion should return a question object', () => {
    Questions.resetUsed();
    const question = Questions.getQuestion(1);
    TestRunner.assertTruthy(question, 'Should return a question');
    TestRunner.assertTruthy(question.id, 'Question should have id');
    TestRunner.assertTruthy(question.prompt, 'Question should have prompt');
    TestRunner.assertArray(question.options, 'Question should have options array');
    TestRunner.assert(typeof question.correctIndex === 'number', 'Question should have correctIndex');
  });

  TestRunner.test('getQuestion should respect difficulty parameter', () => {
    Questions.resetUsed();
    const easyQ = Questions.getQuestion(1);
    TestRunner.assert(easyQ.difficulty <= 2, 'Easy question should be difficulty 1 or 2');

    const hardQ = Questions.getQuestion(3);
    TestRunner.assert(hardQ.difficulty >= 2, 'Hard question should be difficulty 2 or 3');
  });

  TestRunner.test('getQuestion should respect category parameter', () => {
    Questions.resetUsed();
    const vocabQ = Questions.getQuestion(1, 'vocabulary');
    TestRunner.assertEqual(vocabQ.category, 'vocabulary', 'Should return vocabulary question');

    const grammarQ = Questions.getQuestion(1, 'grammar');
    TestRunner.assertEqual(grammarQ.category, 'grammar', 'Should return grammar question');
  });

  TestRunner.test('checkAnswer should validate correct answer', () => {
    const question = { correctIndex: 2, options: ['a', 'b', 'c', 'd'] };
    TestRunner.assert(Questions.checkAnswer(question, 2), 'Should return true for correct answer');
    TestRunner.assert(!Questions.checkAnswer(question, 0), 'Should return false for wrong answer');
  });

  TestRunner.test('getCategories should return available categories', () => {
    const categories = Questions.getCategories();
    TestRunner.assertArray(categories, 'Should return array');
    TestRunner.assert(categories.includes('vocabulary'), 'Should include vocabulary');
    TestRunner.assert(categories.includes('grammar'), 'Should include grammar');
  });

  TestRunner.test('getDragonQuestion should return a hard question', () => {
    const question = Questions.getDragonQuestion();
    TestRunner.assertTruthy(question, 'Should return a question');
    TestRunner.assertEqual(question.difficulty, 3, 'Dragon question should be difficulty 3');
  });

  TestRunner.test('getDifficultyForDepth should scale correctly', () => {
    TestRunner.assertEqual(Questions.getDifficultyForDepth(1), 1, 'Depth 1 = difficulty 1');
    TestRunner.assertEqual(Questions.getDifficultyForDepth(7), 1, 'Depth 7 = difficulty 1');
    TestRunner.assertEqual(Questions.getDifficultyForDepth(8), 2, 'Depth 8 = difficulty 2');
    TestRunner.assertEqual(Questions.getDifficultyForDepth(14), 2, 'Depth 14 = difficulty 2');
    TestRunner.assertEqual(Questions.getDifficultyForDepth(15), 3, 'Depth 15 = difficulty 3');
    TestRunner.assertEqual(Questions.getDifficultyForDepth(20), 3, 'Depth 20 = difficulty 3');
  });

  TestRunner.test('used question tracking should work', () => {
    Questions.resetUsed();
    const statsBefore = Questions.getQuestionStats();
    TestRunner.assertEqual(statsBefore.used, 0, 'Should start with 0 used');

    Questions.getQuestion(1);
    const statsAfter = Questions.getQuestionStats();
    TestRunner.assertEqual(statsAfter.used, 1, 'Should have 1 used after getting question');
  });

  TestRunner.test('addQuestions should extend question database', () => {
    const statsBefore = Questions.getQuestionStats();
    const newQuestion = {
      id: 'test_new_001',
      difficulty: 1,
      category: 'vocabulary',
      prompt: 'Test question?',
      options: ['a', 'b', 'c', 'd'],
      correctIndex: 0
    };

    Questions.addQuestions([newQuestion]);
    const statsAfter = Questions.getQuestionStats();
    TestRunner.assertEqual(statsAfter.total, statsBefore.total + 1, 'Should have one more question');
  });

  TestRunner.test('vocabulary questions should have English prompts', () => {
    Questions.resetUsed();
    const question = Questions.getQuestion(1, 'vocabulary');
    TestRunner.assertTruthy(question.prompt, 'Should have prompt');
    // English prompts start with "What" not Polish "Co" or "Jaki"
    TestRunner.assert(
      question.prompt.startsWith('What'),
      'Vocabulary prompt should be in English (start with "What")'
    );
  });

  TestRunner.test('grammar questions should have sentence field', () => {
    Questions.resetUsed();
    const question = Questions.getQuestion(1, 'grammar');
    TestRunner.assertTruthy(question.prompt, 'Should have prompt');
    TestRunner.assertTruthy(question.sentence, 'Grammar question should have sentence field');
    // Sentence should contain the blank marker
    TestRunner.assert(
      question.sentence.includes('___'),
      'Grammar sentence should contain blank (___)'
    );
  });

  TestRunner.test('questions should have explanations', () => {
    Questions.resetUsed();
    const vocabQ = Questions.getQuestion(1, 'vocabulary');
    TestRunner.assertTruthy(vocabQ.explanation, 'Vocabulary question should have explanation');

    const grammarQ = Questions.getQuestion(1, 'grammar');
    TestRunner.assertTruthy(grammarQ.explanation, 'Grammar question should have explanation');
  });

  TestRunner.test('getQuestion should shuffle options and update correctIndex', () => {
    Questions.resetUsed();

    // Get multiple questions and check that correctIndex always points to correct answer
    for (let i = 0; i < 10; i++) {
      const question = Questions.getQuestion(1);
      const correctAnswer = question.options[question.correctIndex];

      // The correct answer should be a valid option
      TestRunner.assertTruthy(correctAnswer, 'Correct answer should exist at correctIndex');
      TestRunner.assert(
        question.options.includes(correctAnswer),
        'Correct answer should be in options array'
      );
    }
  });

  TestRunner.test('getQuestion should randomize option order', () => {
    // Reset and get the same question multiple times by re-initializing
    // to check if options are shuffled differently
    const positions = [];

    for (let i = 0; i < 20; i++) {
      Questions.init();
      Questions.resetUsed();
      const question = Questions.getQuestion(1, 'vocabulary');
      positions.push(question.correctIndex);
    }

    // Check that not all positions are the same (would be extremely unlikely if shuffled)
    const uniquePositions = new Set(positions);
    TestRunner.assert(
      uniquePositions.size > 1,
      'Correct answer should appear in different positions across multiple calls'
    );
  });
});
