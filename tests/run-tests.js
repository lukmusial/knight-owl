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
  currentSuite: '',

  suite(name, tests) {
    this.currentSuite = name;
    console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`);
    tests();
  },

  test(description, fn) {
    try {
      fn();
      this.pass(description);
    } catch (e) {
      this.fail(description, e.message);
    }
  },

  pass(description) {
    this.results.push({ suite: this.currentSuite, description, passed: true });
    console.log(`  ${colors.green}✓${colors.reset} ${description}`);
  },

  fail(description, error) {
    this.results.push({ suite: this.currentSuite, description, passed: false, error });
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

  showSummary() {
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
loadScript('js/data/vocabulary.js');
loadScript('js/data/grammar.js');
loadScript('js/data/monsters.js');

// Maze generator library
loadScript('js/lib/maze.js');

// Platform adapters
loadScript('js/adapters/StorageAdapter.js');
loadScript('js/adapters/AudioAdapter.js');
loadScript('js/adapters/InputAdapter.js');

// Browser platform implementations
loadScript('js/platforms/browser/BrowserStorage.js');
loadScript('js/platforms/browser/BrowserAudio.js');
loadScript('js/platforms/browser/BrowserInput.js');

// Capacitor platform implementations
loadScript('js/platforms/capacitor/CapacitorStorage.js');
loadScript('js/platforms/capacitor/CapacitorAudio.js');
loadScript('js/platforms/capacitor/CapacitorHaptics.js');

// Platform detection (don't auto-init in test context)
loadScript('js/platform-init.js');

// Core modules
loadScript('js/modules/questions.js');
loadScript('js/modules/player.js');
loadScript('js/modules/save.js');
loadScript('js/modules/descriptions.js');
loadScript('js/modules/dungeon.js');
loadScript('js/modules/combat.js');
loadScript('js/modules/map.js');

console.log(`${colors.green}Modules loaded successfully${colors.reset}`);
console.log(`\n${'='.repeat(50)}`);
console.log(`${colors.cyan}Running Tests${colors.reset}`);
console.log('='.repeat(50));

// Load BDD extensions first
loadScript('tests/bdd-extensions.js');

// Load original test files
loadScript('tests/questions.test.js');
loadScript('tests/player.test.js');
loadScript('tests/save.test.js');
loadScript('tests/descriptions.test.js');
loadScript('tests/dungeon.test.js');
loadScript('tests/combat.test.js');
loadScript('tests/map.test.js');
loadScript('tests/integration.test.js');

// Load adapter and E2E tests
loadScript('tests/adapters.test.js');
loadScript('tests/capacitor.test.js');
loadScript('tests/e2e/portable-engine.e2e.js');
loadScript('tests/e2e/mobile-browser.e2e.js');
loadScript('tests/e2e/android.e2e.js');
loadScript('tests/e2e/ios.e2e.js');

// Show summary
TestRunner.showSummary();
