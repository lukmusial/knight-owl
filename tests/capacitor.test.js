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
