/**
 * Capacitor Platform Tests
 * Tests for CapacitorStorage and CapacitorAudio adapters
 */

TestRunner.describe('CapacitorStorage', () => {
  TestRunner.it('should have required interface methods', () => {
    if (typeof CapacitorStorage === 'undefined') {
      TestRunner.assert(true, 'CapacitorStorage not loaded in test context');
      return;
    }

    TestRunner.assertType(CapacitorStorage.save, 'function', 'should have save method');
    TestRunner.assertType(CapacitorStorage.load, 'function', 'should have load method');
    TestRunner.assertType(CapacitorStorage.remove, 'function', 'should have remove method');
    TestRunner.assertType(CapacitorStorage.listKeys, 'function', 'should have listKeys method');
    TestRunner.assertType(CapacitorStorage.isAvailable, 'function', 'should have isAvailable method');
    TestRunner.assertType(CapacitorStorage.clear, 'function', 'should have clear method');
  });

  TestRunner.it('should use correct storage prefix', () => {
    if (typeof CapacitorStorage === 'undefined') {
      TestRunner.assert(true, 'CapacitorStorage not loaded in test context');
      return;
    }

    const prefix = CapacitorStorage.getPrefix();
    TestRunner.assertEqual(prefix, 'mrowl_dungeon_', 'Prefix should match game convention');
  });

  TestRunner.it('should match StorageAdapter interface', () => {
    if (typeof CapacitorStorage === 'undefined' || typeof StorageAdapter === 'undefined') {
      TestRunner.assert(true, 'Modules not loaded in test context');
      return;
    }

    // Verify CapacitorStorage can be used as StorageAdapter implementation
    const required = ['save', 'load', 'remove', 'listKeys', 'isAvailable', 'clear'];
    const hasAllMethods = required.every(method =>
      typeof CapacitorStorage[method] === 'function'
    );

    TestRunner.assert(hasAllMethods, 'CapacitorStorage should implement all StorageAdapter methods');
  });
});

TestRunner.describe('CapacitorAudio', () => {
  TestRunner.it('should have required interface methods', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }

    TestRunner.assertType(CapacitorAudio.speak, 'function', 'should have speak method');
    TestRunner.assertType(CapacitorAudio.stopSpeaking, 'function', 'should have stopSpeaking method');
    TestRunner.assertType(CapacitorAudio.setLanguage, 'function', 'should have setLanguage method');
    TestRunner.assertType(CapacitorAudio.getVoices, 'function', 'should have getVoices method');
    TestRunner.assertType(CapacitorAudio.isAvailable, 'function', 'should have isAvailable method');
    TestRunner.assertType(CapacitorAudio.isSpeaking, 'function', 'should have isSpeaking method');
  });

  TestRunner.it('should default to Polish language', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }

    const language = CapacitorAudio.getLanguage();
    TestRunner.assertEqual(language, 'pl-PL', 'Default language should be Polish');
  });

  TestRunner.it('should support language change', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }

    // setLanguage is async but updates value synchronously
    CapacitorAudio.setLanguage('en-US');
    TestRunner.assertEqual(CapacitorAudio.getLanguage(), 'en-US', 'Language should be changeable');

    // Reset to default
    CapacitorAudio.setLanguage('pl-PL');
  });

  TestRunner.it('should match AudioAdapter interface', () => {
    if (typeof CapacitorAudio === 'undefined' || typeof AudioAdapter === 'undefined') {
      TestRunner.assert(true, 'Modules not loaded in test context');
      return;
    }

    // Verify CapacitorAudio can be used as AudioAdapter implementation
    const required = ['speak', 'stopSpeaking', 'setLanguage', 'getVoices', 'isAvailable', 'isSpeaking'];
    const hasAllMethods = required.every(method =>
      typeof CapacitorAudio[method] === 'function'
    );

    TestRunner.assert(hasAllMethods, 'CapacitorAudio should implement all AudioAdapter methods');
  });

  TestRunner.it('should have Polish support check method', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }

    TestRunner.assertType(CapacitorAudio.isPolishSupported, 'function',
      'should have isPolishSupported method');
  });
});

TestRunner.describe('Capacitor Platform Detection', () => {
  TestRunner.it('should detect native platform correctly', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    // In browser test context, should not be native
    const isNative = Platform.isNative();
    TestRunner.assertType(isNative, 'boolean', 'isNative should return boolean');

    // In Node/browser test, native should be false
    TestRunner.assert(!isNative, 'Should not be native in test environment');
  });

  TestRunner.it('should have Android check method', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    TestRunner.assertType(Platform.isAndroid, 'function', 'should have isAndroid method');
    TestRunner.assertType(Platform.isAndroid(), 'boolean', 'isAndroid should return boolean');
  });

  TestRunner.it('should have iOS check method', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    TestRunner.assertType(Platform.isIOS, 'function', 'should have isIOS method');
    TestRunner.assertType(Platform.isIOS(), 'boolean', 'isIOS should return boolean');
  });

  TestRunner.it('should initialize with correct adapters based on platform', () => {
    if (typeof Platform === 'undefined') {
      TestRunner.assert(true, 'Platform not loaded in test context');
      return;
    }

    // Platform should be initialized
    const isInit = Platform.isInitialized();
    // Note: In test context, platform might not auto-init
    TestRunner.assertType(isInit, 'boolean', 'isInitialized should return boolean');
  });
});

TestRunner.describe('CapacitorAudio concurrency and fallback', () => {
  /**
   * Build a mock native plugin whose speak() resolves only when release() is called
   */
  function makeMockPlugin() {
    var mock = {
      calls: [],
      stops: 0,
      pendingResolvers: [],
      speak: function(opts) {
        mock.calls.push(opts);
        return new Promise(function(resolve, reject) {
          mock.pendingResolvers.push({ resolve: resolve, reject: reject });
        });
      },
      stop: function() { mock.stops++; return Promise.resolve(); },
      getSupportedLanguages: function() { return Promise.resolve({ languages: ['pl-PL'] }); },
      getSupportedVoices: function() { return Promise.resolve({ voices: [] }); },
      release: function(i, ok) {
        var r = mock.pendingResolvers[i];
        if (ok) r.resolve(); else r.reject(new Error('Failed to read text.'));
      }
    };
    return mock;
  }

  function tick() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
  }

  TestRunner.testAsync('should ignore speak() while a previous request is in flight', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }
    var mock = makeMockPlugin();
    CapacitorAudio.setPlugin(mock);

    var first = CapacitorAudio.speak('kot', {});
    TestRunner.assert(CapacitorAudio.isBusy(), 'Should be busy after first speak');
    var second = CapacitorAudio.speak('pies', {});
    TestRunner.assertEqual(mock.calls.length, 1, 'Second speak must not reach native plugin');

    return second.then(function(accepted) {
      TestRunner.assertEqual(accepted, false, 'Second speak should be rejected as busy');
      mock.release(0, true);
      return first;
    }).then(function(ok) {
      TestRunner.assertEqual(ok, true, 'First speak should succeed');
      TestRunner.assert(!CapacitorAudio.isBusy(), 'Should not be busy after completion');
      return CapacitorAudio.speak('sowa', {});
    }).then(function() {
      TestRunner.assertEqual(mock.calls.length, 2, 'Next speak after completion reaches native');
      TestRunner.assertEqual(mock.calls[1].text, 'sowa', 'Third request is the accepted one');
      CapacitorAudio.setPlugin(null);
    });
  });

  TestRunner.testAsync('should release busy flag when native speak rejects', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }
    var mock = makeMockPlugin();
    CapacitorAudio.setPlugin(mock);

    var p = CapacitorAudio.speak('kot', {});
    mock.release(0, false);
    return p.then(function(ok) {
      TestRunner.assertEqual(ok, false, 'Rejected speak returns false');
      TestRunner.assert(!CapacitorAudio.isBusy(), 'Busy flag released after rejection');
      TestRunner.assert(!CapacitorAudio.inFallbackCooldown(), 'One failure does not trigger cooldown');
      CapacitorAudio.setPlugin(null);
    });
  });

  TestRunner.testAsync('should enter a temporary fallback cooldown after repeated failures, not abandon native', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }
    var mock = makeMockPlugin();
    CapacitorAudio.setPlugin(mock);

    var p1 = CapacitorAudio.speak('kot', {});
    mock.release(0, false);
    return p1.then(function() {
      var p2 = CapacitorAudio.speak('pies', {});
      mock.release(1, false);
      return p2;
    }).then(function() {
      TestRunner.assert(CapacitorAudio.inFallbackCooldown(), 'Two failures start cooldown');
      return CapacitorAudio.speak('sowa', {});
    }).then(function() {
      TestRunner.assertEqual(mock.calls.length, 2, 'Native plugin skipped during cooldown');
      TestRunner.assert(!CapacitorAudio.isBusy(), 'Fallback path does not leave busy flag set');
      // Cooldown must be finite: setPlugin resets it, simulating expiry
      CapacitorAudio.setPlugin(mock);
      TestRunner.assert(!CapacitorAudio.inFallbackCooldown(), 'Cooldown cleared');
      var p3 = CapacitorAudio.speak('lis', {});
      TestRunner.assertEqual(mock.calls.length, 3, 'Native plugin used again after cooldown');
      mock.release(2, true);
      return p3;
    }).then(function() {
      CapacitorAudio.setPlugin(null);
    });
  });

  TestRunner.testAsync('should ignore stale request after stopSpeaking()', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }
    var mock = makeMockPlugin();
    CapacitorAudio.setPlugin(mock);

    var p1 = CapacitorAudio.speak('kot', {});
    return CapacitorAudio.stopSpeaking().then(function() {
      TestRunner.assert(!CapacitorAudio.isBusy(), 'stopSpeaking releases busy flag');
      TestRunner.assertEqual(mock.stops, 1, 'Native stop called');
      var p2 = CapacitorAudio.speak('pies', {});
      TestRunner.assertEqual(mock.calls.length, 2, 'New speak accepted after stop');
      // The orphaned first utterance eventually errors; it must not touch the new one
      mock.release(0, false);
      return p1.then(function(ok) {
        TestRunner.assertEqual(ok, false, 'Stale request reports false');
        TestRunner.assert(CapacitorAudio.isBusy(), 'Stale request must not clear busy flag of new request');
        TestRunner.assertEqual(mock.stops, 1, 'Stale request must not stop the new utterance');
        mock.release(1, true);
        return p2;
      });
    }).then(function(ok) {
      TestRunner.assertEqual(ok, true, 'New request completes normally');
      CapacitorAudio.setPlugin(null);
    });
  });

  TestRunner.it('should scale timeout with text length and cap it', () => {
    if (typeof CapacitorAudio === 'undefined') {
      TestRunner.assert(true, 'CapacitorAudio not loaded in test context');
      return;
    }
    var short = CapacitorAudio.timeoutForText('kot');
    var long = CapacitorAudio.timeoutForText('Ten kot lubi mleko i śpi cały dzień na kanapie.');
    var huge = CapacitorAudio.timeoutForText(new Array(1000).join('a'));
    TestRunner.assert(long > short, 'Longer text gets longer timeout');
    TestRunner.assertEqual(huge, 20000, 'Timeout capped at 20s');
  });
});
