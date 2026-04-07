/**
 * UserProfile Module Tests
 */

TestRunner.suite('UserProfile Module', () => {
  function setup() {
    localStorage.clear();
    UserProfile.reset();
  }

  TestRunner.test('should load and create a new profile', () => {
    setup();
    const profile = UserProfile.load('TestPlayer');
    TestRunner.assertTruthy(profile, 'Should return a profile');
    TestRunner.assertEqual(profile.name, 'TestPlayer', 'Profile should have correct name');
    TestRunner.assertEqual(profile.runsCompleted, 0, 'New profile should have 0 runs');
    TestRunner.assertEqual(Object.keys(profile.questionHistory).length, 0, 'New profile should have empty history');
  });

  TestRunner.test('should save and reload profile', () => {
    setup();
    UserProfile.load('SaveTest');
    UserProfile.recordAttempt('vocab_001', true);
    UserProfile.save();

    // Reset and reload
    UserProfile.reset();
    var profile = UserProfile.load('SaveTest');
    TestRunner.assertTruthy(profile.questionHistory['vocab_001'], 'Should have question history after reload');
    TestRunner.assertEqual(profile.questionHistory['vocab_001'].correct, 1, 'Should have 1 correct');
  });

  TestRunner.test('should record correct attempt', () => {
    setup();
    UserProfile.load('AttemptTest');
    UserProfile.recordAttempt('vocab_001', true);

    var profile = UserProfile.getProfile();
    var entry = profile.questionHistory['vocab_001'];
    TestRunner.assertEqual(entry.seen, 1, 'Should have seen 1');
    TestRunner.assertEqual(entry.correct, 1, 'Should have 1 correct');
    TestRunner.assertEqual(entry.wrong, 0, 'Should have 0 wrong');
    TestRunner.assertEqual(entry.streak, 1, 'Should have streak of 1');
  });

  TestRunner.test('should record wrong attempt and reset streak', () => {
    setup();
    UserProfile.load('WrongTest');
    UserProfile.recordAttempt('vocab_001', true);
    UserProfile.recordAttempt('vocab_001', true);
    UserProfile.recordAttempt('vocab_001', false);

    var profile = UserProfile.getProfile();
    var entry = profile.questionHistory['vocab_001'];
    TestRunner.assertEqual(entry.seen, 3, 'Should have seen 3');
    TestRunner.assertEqual(entry.correct, 2, 'Should have 2 correct');
    TestRunner.assertEqual(entry.wrong, 1, 'Should have 1 wrong');
    TestRunner.assertEqual(entry.streak, 0, 'Streak should be 0 after wrong');
  });

  TestRunner.test('should track recent attempts up to limit', () => {
    setup();
    UserProfile.load('RecentTest');
    for (var i = 0; i < 8; i++) {
      UserProfile.recordAttempt('vocab_001', i % 2 === 0);
    }

    var profile = UserProfile.getProfile();
    var entry = profile.questionHistory['vocab_001'];
    TestRunner.assert(entry.recentAttempts.length <= 5, 'Should keep at most 5 recent attempts');
  });

  TestRunner.test('should return weight 1.0 for unseen questions', () => {
    setup();
    UserProfile.load('WeightTest');
    var weight = UserProfile.getQuestionWeight('never_seen');
    TestRunner.assertEqual(weight, 1.0, 'Unseen question should have weight 1.0');
  });

  TestRunner.test('should return low weight for mastered questions', () => {
    setup();
    UserProfile.load('MasteredTest');
    for (var i = 0; i < 6; i++) {
      UserProfile.recordAttempt('vocab_001', true);
    }
    var weight = UserProfile.getQuestionWeight('vocab_001');
    TestRunner.assert(weight < 0.5, 'Mastered question (streak 6) should have low weight, got ' + weight);
  });

  TestRunner.test('should return higher weight for struggled than mastered questions', () => {
    setup();
    UserProfile.load('StruggledTest');
    // Record wrong answers for struggled question
    UserProfile.recordAttempt('vocab_001', false);
    UserProfile.recordAttempt('vocab_001', false);
    var struggledWeight = UserProfile.getQuestionWeight('vocab_001');

    // Record correct answers for mastered question
    for (var i = 0; i < 6; i++) {
      UserProfile.recordAttempt('vocab_002', true);
    }
    var masteredWeight = UserProfile.getQuestionWeight('vocab_002');

    TestRunner.assert(struggledWeight > masteredWeight,
      'Struggled weight (' + struggledWeight + ') should be higher than mastered weight (' + masteredWeight + ')');
    TestRunner.assert(struggledWeight > 0.1, 'Struggled question should have weight > 0.1, got ' + struggledWeight);
  });

  TestRunner.test('should complete a run', () => {
    setup();
    UserProfile.load('RunTest');
    TestRunner.assertEqual(UserProfile.getMasteryStats().runsCompleted, 0, 'Should start with 0 runs');
    UserProfile.completeRun();
    TestRunner.assertEqual(UserProfile.getMasteryStats().runsCompleted, 1, 'Should have 1 run after completing');
  });

  TestRunner.test('should return mastery stats', () => {
    setup();
    UserProfile.load('StatsTest');
    UserProfile.recordAttempt('vocab_001', true);
    UserProfile.recordAttempt('vocab_001', true);
    UserProfile.recordAttempt('vocab_001', true);
    UserProfile.recordAttempt('vocab_002', false);

    var stats = UserProfile.getMasteryStats();
    TestRunner.assertEqual(stats.totalSeen, 2, 'Should have seen 2 unique questions');
    TestRunner.assertEqual(stats.mastered, 1, 'Should have mastered 1 question (streak >= 3)');
    TestRunner.assert(stats.accuracy > 0, 'Should have non-zero accuracy');
  });

  TestRunner.test('should check profile existence', () => {
    setup();
    TestRunner.assert(!UserProfile.hasProfile('nobody'), 'Should not find non-existent profile');
    UserProfile.load('ExistTest');
    UserProfile.save();
    TestRunner.assert(UserProfile.hasProfile('ExistTest'), 'Should find saved profile');
  });

  TestRunner.test('should export profile data as JSON', () => {
    setup();
    UserProfile.load('ExportTest');
    UserProfile.recordAttempt('vocab_001', true);
    var json = UserProfile.exportData();
    TestRunner.assertTruthy(json, 'Should return JSON string');
    var parsed = JSON.parse(json);
    TestRunner.assertEqual(parsed.name, 'ExportTest', 'Exported data should have name');
    TestRunner.assertTruthy(parsed.questionHistory['vocab_001'], 'Exported data should have history');
  });

  TestRunner.test('should return null profile after reset', () => {
    setup();
    UserProfile.load('ResetTest');
    UserProfile.reset();
    TestRunner.assertEqual(UserProfile.getProfile(), null, 'Should return null after reset');
  });
});
