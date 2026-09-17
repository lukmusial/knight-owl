#!/usr/bin/env node

/**
 * Node.js Test Runner
 * Runs all tests from command line: node tests/run-tests.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// Test Framework (mirrors browser version)
const TestRunner = {
  results: [],
  pending: [],
  currentSuite: '',

  suite(name, tests) {
    this.currentSuite = name;
    console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`);
    tests();
  },

  test(description, fn) {
    const self = this;
    const suite = this.currentSuite;
    try {
      const result = fn();
      if (result && typeof result.then === 'function') {
        // Async test: record result when it settles, summary waits for it
        this.pending.push(result.then(
          () => self.pass(description, suite),
          (e) => self.fail(description, e && e.message ? e.message : String(e), suite)
        ));
      } else {
        this.pass(description);
      }
    } catch (e) {
      this.fail(description, e.message);
    }
  },

  /**
   * Async test: fn returns a promise. Async tests run one after another
   * (not interleaved), and the summary waits for all of them.
   */
  testAsync(description, fn) {
    const self = this;
    const suite = this.currentSuite;
    this.chain = (this.chain || Promise.resolve()).then(() => {
      return Promise.resolve().then(fn).then(
        () => self.pass(description, suite),
        (e) => self.fail(description, e && e.message ? e.message : String(e), suite)
      );
    });
    this.pending.push(this.chain);
  },

  pass(description, suite) {
    this.results.push({ suite: suite || this.currentSuite, description, passed: true });
    console.log(`  ${colors.green}✓${colors.reset} ${description}`);
  },

  fail(description, error, suite) {
    this.results.push({ suite: suite || this.currentSuite, description, passed: false, error });
    console.log(`  ${colors.red}✗${colors.reset} ${description}`);
    console.log(`    ${colors.dim}${error}${colors.reset}`);
  },

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  },

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },

  assertTruthy(value, message) {
    if (!value) {
      throw new Error(message || `Expected truthy value, got ${value}`);
    }
  },

  assertArray(value, message) {
    if (!Array.isArray(value)) {
      throw new Error(message || `Expected array, got ${typeof value}`);
    }
  },

  async showSummary() {
    await Promise.all(this.pending);
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(50));
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log('='.repeat(50));
    console.log(`Total:  ${total}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    if (failed > 0) {
      console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    } else {
      console.log(`Failed: ${failed}`);
    }
    console.log('='.repeat(50));

    if (failed === 0) {
      console.log(`\n${colors.green}All tests passed!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}Some tests failed!${colors.reset}\n`);
      process.exit(1);
    }
  }
};

// Create a context with globals
const context = {
  TestRunner,
  console,
  Math,
  Date,
  Array,
  Object,
  String,
  Number,
  JSON,
  Set,
  Map,
  Error,
  setTimeout,
  clearTimeout,
  Promise,
  RegExp,
  // localStorage mock
  localStorage: {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = String(value); },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; },
    get length() { return Object.keys(this.data).length; },
    key(index) { return Object.keys(this.data)[index] || null; }
  },
  // Module exports mock
  module: { exports: {} }
};

// Make context properties available as globals
vm.createContext(context);

// Helper to load a JS file into context
function loadScript(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  const code = fs.readFileSync(fullPath, 'utf8');

  try {
    vm.runInContext(code, context, { filename: filePath });
  } catch (e) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, e.message);
    process.exit(1);
  }
}

// Load files in correct order
console.log(`${colors.cyan}Loading modules...${colors.reset}`);

// Data files
loadScript('www/js/data/vocabulary.js');
loadScript('www/js/data/vocabulary-reverse.js');
loadScript('www/js/data/grammar.js');
loadScript('www/js/data/matching.js');
loadScript('www/js/data/pronoun-matching.js');
loadScript('www/js/data/monsters.js');

// Maze generator library
loadScript('www/js/lib/maze.js');

// Platform adapters
loadScript('www/js/adapters/StorageAdapter.js');
loadScript('www/js/adapters/AudioAdapter.js');
loadScript('www/js/adapters/InputAdapter.js');

// Browser platform implementations
loadScript('www/js/platforms/browser/BrowserStorage.js');
loadScript('www/js/platforms/browser/BrowserAudio.js');
loadScript('www/js/platforms/browser/BrowserInput.js');

// Capacitor platform implementations
loadScript('www/js/platforms/capacitor/CapacitorStorage.js');
loadScript('www/js/platforms/capacitor/CapacitorAudio.js');
loadScript('www/js/platforms/capacitor/CapacitorHaptics.js');

// Platform detection (don't auto-init in test context)
loadScript('www/js/platform-init.js');

// Core modules
loadScript('www/js/modules/profile.js');
loadScript('www/js/modules/questions.js');
loadScript('www/js/modules/matching.js');
loadScript('www/js/modules/player.js');
loadScript('www/js/modules/save.js');
loadScript('www/js/modules/descriptions.js');
loadScript('www/js/modules/dungeon.js');
loadScript('www/js/modules/combat.js');
loadScript('www/js/modules/map.js');
loadScript('www/js/modules/sfx.js');
loadScript('www/js/modules/fx.js');
loadScript('www/js/proto/shared-dom.js');
loadScript('www/js/proto/session.js');
loadScript('www/js/modules/music.js');
loadScript('www/js/modules/lifecycle.js');
loadScript('www/js/proto/fp-world.js');
loadScript('www/js/proto/fp-layout.js');
loadScript('www/js/proto/fp-quality.js');
loadScript('www/js/proto/fp-owl.js');
loadScript('www/js/proto/iso-model.js');

console.log(`${colors.green}Modules loaded successfully${colors.reset}`);
console.log(`\n${'='.repeat(50)}`);
console.log(`${colors.cyan}Running Tests${colors.reset}`);
console.log('='.repeat(50));

// Load BDD extensions first
loadScript('tests/bdd-extensions.js');

// Load original test files
loadScript('tests/profile.test.js');
loadScript('tests/matching.test.js');
loadScript('tests/matching-data.test.js');
loadScript('tests/questions.test.js');
loadScript('tests/player.test.js');
loadScript('tests/save.test.js');
loadScript('tests/descriptions.test.js');
loadScript('tests/dungeon.test.js');
loadScript('tests/combat.test.js');
loadScript('tests/map.test.js');
loadScript('tests/fx.test.js');
loadScript('tests/shared-dom.test.js');
loadScript('tests/session.test.js');
loadScript('tests/fp-world.test.js');
loadScript('tests/fp-layout.test.js');
loadScript('tests/fp-owl.test.js');
loadScript('tests/iso-model.test.js');
loadScript('tests/lifecycle.test.js');
loadScript('tests/integration.test.js');

// Load adapter and E2E tests
loadScript('tests/adapters.test.js');
loadScript('tests/capacitor.test.js');
loadScript('tests/mobile-layout.test.js');
loadScript('tests/e2e/portable-engine.e2e.js');
loadScript('tests/e2e/mobile-browser.e2e.js');
loadScript('tests/e2e/android.e2e.js');
loadScript('tests/e2e/ios.e2e.js');

// Show summary
TestRunner.showSummary();
