/**
 * Matching Module Tests
 */

TestRunner.suite('Matching Module', () => {
  function setup() {
    Matching.init();
    Matching.resetUsed();
  }

  TestRunner.test('should initialize with matching data', () => {
    setup();
    var stats = Matching.getStats();
    TestRunner.assert(stats.total > 0, 'Should have matching sets loaded');
    TestRunner.assert(stats.matching > 0, 'Should have word matching sets');
    TestRunner.assert(stats.pronoun_matching > 0, 'Should have pronoun matching sets');
  });

  TestRunner.test('should get a matching set by difficulty', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    TestRunner.assertTruthy(set, 'Should return a set');
    TestRunner.assertTruthy(set.id, 'Set should have id');
    TestRunner.assertArray(set.pairs, 'Set should have pairs array');
    TestRunner.assertEqual(set.pairs.length, 4, 'Set should have 4 pairs');
  });

  TestRunner.test('should get matching set by category', () => {
    setup();
    var wordSet = Matching.getMatchingSet(1, 'matching');
    TestRunner.assertEqual(wordSet.category, 'matching', 'Should return word matching set');

    var pronounSet = Matching.getMatchingSet(1, 'pronoun_matching');
    TestRunner.assertEqual(pronounSet.category, 'pronoun_matching', 'Should return pronoun matching set');
  });

  TestRunner.test('pairs should have left and right fields', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    set.pairs.forEach(function(pair, i) {
      TestRunner.assertTruthy(pair.left, 'Pair ' + i + ' should have left');
      TestRunner.assertTruthy(pair.right, 'Pair ' + i + ' should have right');
    });
  });

  TestRunner.test('should track used set IDs', () => {
    setup();
    var set1 = Matching.getMatchingSet(1);
    var usedIds = Matching.getUsedIds();
    TestRunner.assert(usedIds.indexOf(set1.id) !== -1, 'Used IDs should include selected set');
  });

  TestRunner.test('should start a matching session', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);
    TestRunner.assert(!Matching.isComplete(), 'Should not be complete at start');
    TestRunner.assert(!Matching.hasFailed(), 'Should not have failed at start');
  });

  TestRunner.test('should get display items with stable positions', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);
    var display1 = Matching.getDisplayItems();
    var display2 = Matching.getDisplayItems();
    TestRunner.assertEqual(display1.leftItems.length, 4, 'Should have 4 left items');
    TestRunner.assertEqual(display1.rightItems.length, 4, 'Should have 4 right items');
    // Positions should be stable across calls
    TestRunner.assertEqual(display1.leftItems[0].text, display2.leftItems[0].text, 'Left items should be in same order on repeated calls');
    TestRunner.assertEqual(display1.rightItems[0].text, display2.rightItems[0].text, 'Right items should be in same order on repeated calls');
  });

  TestRunner.test('display items should show matched status after match', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);

    // Match pair 0
    Matching.selectItem('left', 0);
    Matching.selectItem('right', 0);

    var display = Matching.getDisplayItems();
    // All 4 items should still be present
    TestRunner.assertEqual(display.leftItems.length, 4, 'Should still have 4 left items');
    TestRunner.assertEqual(display.rightItems.length, 4, 'Should still have 4 right items');

    // Find items with pairIndex 0 and check they are matched
    var matchedLeft = display.leftItems.filter(function(item) { return item.pairIndex === 0; });
    var matchedRight = display.rightItems.filter(function(item) { return item.pairIndex === 0; });
    TestRunner.assert(matchedLeft.length > 0 && matchedLeft[0].matched, 'Left item of matched pair should have matched=true');
    TestRunner.assert(matchedRight.length > 0 && matchedRight[0].matched, 'Right item of matched pair should have matched=true');

    // Unmatched items should not be matched
    var unmatchedLeft = display.leftItems.filter(function(item) { return item.pairIndex !== 0; });
    TestRunner.assert(unmatchedLeft.every(function(item) { return !item.matched; }), 'Unmatched items should have matched=false');
  });

  TestRunner.test('should handle correct match selection', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);

    // Select first pair (index 0) from both sides
    var result1 = Matching.selectItem('left', 0);
    TestRunner.assertEqual(result1.type, 'selected', 'First click should select');

    var result2 = Matching.selectItem('right', 0);
    TestRunner.assertEqual(result2.type, 'match', 'Matching pair should return match');
  });

  TestRunner.test('should handle wrong match selection', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);

    // Select mismatched pair indices
    Matching.selectItem('left', 0);
    var result = Matching.selectItem('right', 1);
    TestRunner.assertEqual(result.type, 'mismatch', 'Wrong pair should return mismatch');
    TestRunner.assert(Matching.hasFailed(), 'Should be failed after mismatch');
  });

  TestRunner.test('should complete when all pairs matched', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);

    // Match all 4 pairs correctly
    for (var i = 0; i < 4; i++) {
      Matching.selectItem('left', i);
      var result = Matching.selectItem('right', i);
      if (i < 3) {
        TestRunner.assertEqual(result.type, 'match', 'Should match pair ' + i);
      } else {
        TestRunner.assertEqual(result.type, 'complete', 'Last match should return complete');
      }
    }

    TestRunner.assert(Matching.isComplete(), 'Should be complete after all pairs matched');
  });

  TestRunner.test('should switch selection on same side click', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    Matching.startMatching(set);

    Matching.selectItem('left', 0);
    var result = Matching.selectItem('left', 1);
    TestRunner.assertEqual(result.type, 'selected', 'Same side click should switch selection');
  });

  TestRunner.test('should reset used IDs', () => {
    setup();
    Matching.getMatchingSet(1);
    TestRunner.assert(Matching.getUsedIds().length > 0, 'Should have used IDs');
    Matching.resetUsed();
    TestRunner.assertEqual(Matching.getUsedIds().length, 0, 'Should have no used IDs after reset');
  });

  TestRunner.test('should save and restore used IDs', () => {
    setup();
    var set = Matching.getMatchingSet(1);
    var ids = Matching.getUsedIds();
    Matching.resetUsed();
    Matching.setUsedIds(ids);
    var restored = Matching.getUsedIds();
    TestRunner.assertEqual(restored.length, ids.length, 'Restored IDs should match saved IDs');
    TestRunner.assertEqual(restored[0], ids[0], 'First ID should match');
  });

  TestRunner.test('shuffle should return array of same length', () => {
    var arr = [1, 2, 3, 4, 5];
    var shuffled = Matching.shuffle(arr);
    TestRunner.assertEqual(shuffled.length, arr.length, 'Shuffled array should have same length');
    // Original should not be modified
    TestRunner.assertEqual(arr[0], 1, 'Original array should not be modified');
  });

  TestRunner.test('should allow repeats when all sets used', () => {
    setup();
    // Get many sets to exhaust available ones for a specific category
    var count = 0;
    while (count < 200) {
      var set = Matching.getMatchingSet(1, 'matching');
      if (!set) break;
      count++;
    }
    TestRunner.assert(count > 0, 'Should be able to get sets even after many requests');
  });
});
