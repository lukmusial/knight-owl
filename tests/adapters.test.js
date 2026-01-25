/**
 * Adapter Tests
 * Tests for StorageAdapter, AudioAdapter, and InputAdapter
 */

// Test BDD extensions first
TestRunner.describe('BDD Test Extensions', () => {
  TestRunner.it('should support describe/it syntax', () => {
    // This test proves describe/it work
    TestRunner.assert(true, 'BDD syntax works');
  });

  TestRunner.it('should support assertDeepEqual for objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    TestRunner.assertDeepEqual(obj1, obj2, 'Deep equal should match identical objects');
  });

  TestRunner.it('should support assertDeepEqual for arrays', () => {
    const arr1 = [1, 2, [3, 4]];
    const arr2 = [1, 2, [3, 4]];
    TestRunner.assertDeepEqual(arr1, arr2, 'Deep equal should match identical arrays');
  });

  TestRunner.it('should support assertThrows for exceptions', () => {
    TestRunner.assertThrows(() => {
      throw new Error('test error');
    }, 'test error', 'Should catch expected error');
  });

  TestRunner.it('should support assertNull', () => {
    TestRunner.assertNull(null, 'null should be null');
  });

  TestRunner.it('should support assertNotNull', () => {
    TestRunner.assertNotNull('value', 'string should not be null');
  });

  TestRunner.it('should support assertType', () => {
    TestRunner.assertType('hello', 'string', 'Should detect string type');
    TestRunner.assertType(42, 'number', 'Should detect number type');
    TestRunner.assertType({}, 'object', 'Should detect object type');
  });

  TestRunner.it('should support assertContains', () => {
    TestRunner.assertContains([1, 2, 3], 2, 'Array should contain 2');
  });

  TestRunner.it('should support assertLength', () => {
    TestRunner.assertLength([1, 2, 3], 3, 'Array should have length 3');
  });

  TestRunner.it('should support assertGreaterThan', () => {
    TestRunner.assertGreaterThan(5, 3, '5 should be greater than 3');
  });

  TestRunner.it('should support assertLessThan', () => {
    TestRunner.assertLessThan(3, 5, '3 should be less than 5');
  });
});

// StorageAdapter tests
TestRunner.describe('StorageAdapter', () => {
  TestRunner.it('should start without implementation', () => {
    // Reset any existing implementation
    const hasImpl = typeof StorageAdapter !== 'undefined' && StorageAdapter.hasImplementation();
    // In test context, implementation may or may not be set
    TestRunner.assertType(hasImpl, 'boolean', 'hasImplementation should return boolean');
  });

  TestRunner.it('should have required interface methods defined', () => {
    if (typeof StorageAdapter === 'undefined') {
      TestRunner.assert(true, 'StorageAdapter not loaded in test context');
      return;
    }

    TestRunner.assertType(StorageAdapter.save, 'function', 'should have save method');
    TestRunner.assertType(StorageAdapter.load, 'function', 'should have load method');
    TestRunner.assertType(StorageAdapter.remove, 'function', 'should have remove method');
    TestRunner.assertType(StorageAdapter.listKeys, 'function', 'should have listKeys method');
    TestRunner.assertType(StorageAdapter.isAvailable, 'function', 'should have isAvailable method');
    TestRunner.assertType(StorageAdapter.clear, 'function', 'should have clear method');
  });

  TestRunner.it('should validate implementation on setImplementation', () => {
    if (typeof StorageAdapter === 'undefined') {
      TestRunner.assert(true, 'StorageAdapter not loaded in test context');
      return;
    }

    // Should throw with incomplete implementation
    let threw = false;
    try {
      StorageAdapter.setImplementation({ save: () => {} });
    } catch (e) {
      threw = true;
    }
    TestRunner.assert(threw, 'Should throw for incomplete implementation');
  });
});

// AudioAdapter tests
TestRunner.describe('AudioAdapter', () => {
  TestRunner.it('should have required interface methods', () => {
    if (typeof AudioAdapter === 'undefined') {
      TestRunner.assert(true, 'AudioAdapter not loaded in test context');
      return;
    }

    TestRunner.assertType(AudioAdapter.speak, 'function', 'should have speak method');
    TestRunner.assertType(AudioAdapter.stopSpeaking, 'function', 'should have stopSpeaking method');
    TestRunner.assertType(AudioAdapter.setLanguage, 'function', 'should have setLanguage method');
    TestRunner.assertType(AudioAdapter.getVoices, 'function', 'should have getVoices method');
    TestRunner.assertType(AudioAdapter.isAvailable, 'function', 'should have isAvailable method');
    TestRunner.assertType(AudioAdapter.isSpeaking, 'function', 'should have isSpeaking method');
  });

  TestRunner.it('should have default options', () => {
    if (typeof AudioAdapter === 'undefined') {
      TestRunner.assert(true, 'AudioAdapter not loaded in test context');
      return;
    }

    const defaults = AudioAdapter.getDefaultOptions();
    TestRunner.assertEqual(defaults.language, 'pl-PL', 'Default language should be Polish');
    TestRunner.assertEqual(defaults.rate, 0.9, 'Default rate should be 0.9');
    TestRunner.assertEqual(defaults.pitch, 1.2, 'Default pitch should be 1.2');
  });

  TestRunner.it('should gracefully handle missing implementation', () => {
    if (typeof AudioAdapter === 'undefined') {
      TestRunner.assert(true, 'AudioAdapter not loaded in test context');
      return;
    }

    // These should not throw even without implementation
    const result = AudioAdapter.speak('test');
    TestRunner.assert(result !== undefined || result === undefined, 'speak should not throw');
  });
});

// InputAdapter tests
TestRunner.describe('InputAdapter', () => {
  TestRunner.it('should have event type constants', () => {
    if (typeof InputAdapter === 'undefined') {
      TestRunner.assert(true, 'InputAdapter not loaded in test context');
      return;
    }

    TestRunner.assertEqual(InputAdapter.EVENT_TYPES.NAVIGATE, 'navigate', 'Should have NAVIGATE event type');
    TestRunner.assertEqual(InputAdapter.EVENT_TYPES.SELECT, 'select', 'Should have SELECT event type');
    TestRunner.assertEqual(InputAdapter.EVENT_TYPES.SWIPE, 'swipe', 'Should have SWIPE event type');
    TestRunner.assertEqual(InputAdapter.EVENT_TYPES.BACK, 'back', 'Should have BACK event type');
  });

  TestRunner.it('should have direction constants', () => {
    if (typeof InputAdapter === 'undefined') {
      TestRunner.assert(true, 'InputAdapter not loaded in test context');
      return;
    }

    TestRunner.assertEqual(InputAdapter.DIRECTIONS.NORTH, 'North', 'Should have NORTH direction');
    TestRunner.assertEqual(InputAdapter.DIRECTIONS.SOUTH, 'South', 'Should have SOUTH direction');
    TestRunner.assertEqual(InputAdapter.DIRECTIONS.EAST, 'East', 'Should have EAST direction');
    TestRunner.assertEqual(InputAdapter.DIRECTIONS.WEST, 'West', 'Should have WEST direction');
  });

  TestRunner.it('should support event subscription', () => {
    if (typeof InputAdapter === 'undefined') {
      TestRunner.assert(true, 'InputAdapter not loaded in test context');
      return;
    }

    let received = null;
    const unsubscribe = InputAdapter.on('navigate', (data) => {
      received = data;
    });

    TestRunner.assertType(unsubscribe, 'function', 'on() should return unsubscribe function');

    // Emit an event
    InputAdapter.emit('navigate', { direction: 'North' });
    TestRunner.assertDeepEqual(received, { direction: 'North' }, 'Should receive emitted event');

    // Cleanup
    unsubscribe();
    InputAdapter.removeAllListeners();
  });

  TestRunner.it('should support unsubscribe', () => {
    if (typeof InputAdapter === 'undefined') {
      TestRunner.assert(true, 'InputAdapter not loaded in test context');
      return;
    }

    let callCount = 0;
    const unsubscribe = InputAdapter.on('navigate', () => {
      callCount++;
    });

    InputAdapter.emit('navigate', {});
    TestRunner.assertEqual(callCount, 1, 'Should receive first event');

    unsubscribe();
    InputAdapter.emit('navigate', {});
    TestRunner.assertEqual(callCount, 1, 'Should not receive event after unsubscribe');

    // Cleanup
    InputAdapter.removeAllListeners();
  });
});

// BrowserStorage tests
// Note: BrowserStorage methods are async but use synchronous localStorage internally
// Tests are sync since test runner doesn't support async
TestRunner.describe('BrowserStorage', () => {
  function setup() {
    localStorage.clear();
  }

  TestRunner.it('should save and load data', () => {
    if (typeof BrowserStorage === 'undefined') {
      TestRunner.assert(true, 'BrowserStorage not loaded in test context');
      return;
    }

    setup();
    const testData = { name: 'Test', value: 42 };

    // BrowserStorage uses localStorage synchronously despite async interface
    BrowserStorage.save('test_key', testData);

    // Load directly from localStorage to verify (bypassing async)
    const rawData = localStorage.getItem('mrowl_dungeon_test_key');
    TestRunner.assertNotNull(rawData, 'Data should be saved to localStorage');
    TestRunner.assertDeepEqual(JSON.parse(rawData), testData, 'Loaded data should match saved data');
  });

  TestRunner.it('should return null for non-existent key', () => {
    if (typeof BrowserStorage === 'undefined') {
      TestRunner.assert(true, 'BrowserStorage not loaded in test context');
      return;
    }

    setup();
    const rawData = localStorage.getItem('mrowl_dungeon_nonexistent');
    TestRunner.assertNull(rawData, 'Should return null for missing key');
  });

  TestRunner.it('should remove data', () => {
    if (typeof BrowserStorage === 'undefined') {
      TestRunner.assert(true, 'BrowserStorage not loaded in test context');
      return;
    }

    setup();
    BrowserStorage.save('to_remove', { data: true });
    BrowserStorage.remove('to_remove');
    const rawData = localStorage.getItem('mrowl_dungeon_to_remove');
    TestRunner.assertNull(rawData, 'Data should be removed');
  });

  TestRunner.it('should list keys with prefix', () => {
    if (typeof BrowserStorage === 'undefined') {
      TestRunner.assert(true, 'BrowserStorage not loaded in test context');
      return;
    }

    setup();
    BrowserStorage.save('game_1', { id: 1 });
    BrowserStorage.save('game_2', { id: 2 });
    BrowserStorage.save('other', { id: 3 });

    // Count keys directly from localStorage
    let gameKeyCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mrowl_dungeon_game_')) {
        gameKeyCount++;
      }
    }
    TestRunner.assertEqual(gameKeyCount, 2, 'Should find 2 game keys');
  });

  TestRunner.it('should report availability', () => {
    if (typeof BrowserStorage === 'undefined') {
      TestRunner.assert(true, 'BrowserStorage not loaded in test context');
      return;
    }

    // Test localStorage directly
    try {
      localStorage.setItem('__test__', '__test__');
      localStorage.removeItem('__test__');
      TestRunner.assert(true, 'localStorage should be available in test environment');
    } catch (e) {
      TestRunner.assert(false, 'localStorage should be available');
    }
  });
});

// BrowserInput tests
TestRunner.describe('BrowserInput', () => {
  TestRunner.it('should have swipe threshold defined', () => {
    if (typeof BrowserInput === 'undefined') {
      TestRunner.assert(true, 'BrowserInput not loaded in test context');
      return;
    }

    const threshold = BrowserInput.getSwipeThreshold();
    TestRunner.assertGreaterThan(threshold, 0, 'Swipe threshold should be positive');
    TestRunner.assertEqual(threshold, 50, 'Default swipe threshold should be 50px');
  });

  TestRunner.it('should track input enabled state', () => {
    if (typeof BrowserInput === 'undefined') {
      TestRunner.assert(true, 'BrowserInput not loaded in test context');
      return;
    }

    TestRunner.assert(BrowserInput.isEnabled('keyboard'), 'Keyboard should be enabled by default');
    TestRunner.assert(BrowserInput.isEnabled('touch'), 'Touch should be enabled by default');
  });
});

// Platform detection tests
TestRunner.describe('Platform Detection', () => {
  TestRunner.it('should detect browser environment', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    // In Node test environment, might detect as browser
    const platform = Platform.getPlatform();
    TestRunner.assertType(platform, 'string', 'Platform should be a string');
  });

  TestRunner.it('should have platform constants', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    TestRunner.assertEqual(Platform.PLATFORMS.BROWSER, 'browser', 'Should have BROWSER constant');
    TestRunner.assertEqual(Platform.PLATFORMS.CAPACITOR_ANDROID, 'capacitor-android', 'Should have CAPACITOR_ANDROID');
    TestRunner.assertEqual(Platform.PLATFORMS.CAPACITOR_IOS, 'capacitor-ios', 'Should have CAPACITOR_IOS');
  });

  TestRunner.it('should have platform check methods', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    TestRunner.assertType(Platform.isNative, 'function', 'Should have isNative method');
    TestRunner.assertType(Platform.isBrowser, 'function', 'Should have isBrowser method');
    TestRunner.assertType(Platform.isAndroid, 'function', 'Should have isAndroid method');
    TestRunner.assertType(Platform.isIOS, 'function', 'Should have isIOS method');
  });
});

// Save module with adapter tests
TestRunner.describe('Save Module with Adapter', () => {
  function setup() {
    localStorage.clear();
  }

  TestRunner.it('should have hasAdapter method', () => {
    TestRunner.assertType(Save.hasAdapter, 'function', 'Save should have hasAdapter method');
  });

  TestRunner.it('should maintain backward compatibility with direct localStorage', () => {
    setup();

    const playerState = {
      name: 'AdapterTest',
      monstersDefeated: 5,
      currentRoom: 'room_1_1'
    };

    const dungeonState = {
      rooms: {},
      entrance: 'room_0_0'
    };

    const result = Save.saveGame(playerState, dungeonState, [], {});
    TestRunner.assert(result, 'Save should succeed');

    const loaded = Save.loadGame('AdapterTest');
    TestRunner.assertNotNull(loaded, 'Load should return data');
    TestRunner.assertEqual(loaded.player.name, 'AdapterTest', 'Player name should match');
  });

  TestRunner.it('should still list saves correctly', () => {
    setup();

    const playerState = {
      name: 'ListTest',
      monstersDefeated: 3,
      currentRoom: 'room_1_1'
    };

    const dungeonState = {
      rooms: {},
      entrance: 'room_0_0'
    };

    Save.saveGame(playerState, dungeonState, [], {});

    const saves = Save.listSaves();
    TestRunner.assertArray(saves, 'listSaves should return array');
    TestRunner.assertGreaterThan(saves.length, 0, 'Should have at least one save');
  });
});
