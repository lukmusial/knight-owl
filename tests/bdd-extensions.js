/**
 * BDD Test Extensions
 * Extends TestRunner with BDD-style syntax and additional assertions
 */

(function(TestRunner) {
  /**
   * BDD-style describe block (alias for suite)
   * @param {string} description - Feature or component description
   * @param {Function} specDefinitions - Function containing it() blocks
   */
  TestRunner.describe = function(description, specDefinitions) {
    this.suite(description, specDefinitions);
  };

  /**
   * BDD-style it block (alias for test)
   * @param {string} description - Test specification
   * @param {Function} testFn - Test function
   */
  TestRunner.it = function(description, testFn) {
    this.test(description, testFn);
  };

  /**
   * E2E scenario helper
   * Groups related steps into a named scenario
   * @param {string} name - Scenario name
   * @param {Function} steps - Function containing test steps
   */
  TestRunner.scenario = function(name, steps) {
    this.test(`Scenario: ${name}`, steps);
  };

  /**
   * Deep equality comparison for objects and arrays
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertDeepEqual = function(actual, expected, message) {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);

    if (actualStr !== expectedStr) {
      throw new Error(message || `Deep equality failed.\nExpected: ${expectedStr}\nActual: ${actualStr}`);
    }
  };

  /**
   * Assert that a function throws an error
   * @param {Function} fn - Function that should throw
   * @param {string|RegExp} [expectedError] - Optional expected error message or pattern
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertThrows = function(fn, expectedError, message) {
    let threw = false;
    let error = null;

    try {
      fn();
    } catch (e) {
      threw = true;
      error = e;
    }

    if (!threw) {
      throw new Error(message || 'Expected function to throw, but it did not');
    }

    if (expectedError) {
      const errorMessage = error.message || String(error);
      if (expectedError instanceof RegExp) {
        if (!expectedError.test(errorMessage)) {
          throw new Error(message || `Expected error matching ${expectedError}, got: ${errorMessage}`);
        }
      } else if (typeof expectedError === 'string') {
        if (!errorMessage.includes(expectedError)) {
          throw new Error(message || `Expected error containing "${expectedError}", got: "${errorMessage}"`);
        }
      }
    }
  };

  /**
   * Assert value is null
   * @param {*} value - Value to check
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertNull = function(value, message) {
    if (value !== null) {
      throw new Error(message || `Expected null, got ${value}`);
    }
  };

  /**
   * Assert value is not null
   * @param {*} value - Value to check
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertNotNull = function(value, message) {
    if (value === null) {
      throw new Error(message || 'Expected non-null value, got null');
    }
  };

  /**
   * Assert value is undefined
   * @param {*} value - Value to check
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertUndefined = function(value, message) {
    if (value !== undefined) {
      throw new Error(message || `Expected undefined, got ${value}`);
    }
  };

  /**
   * Assert value is defined (not undefined)
   * @param {*} value - Value to check
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertDefined = function(value, message) {
    if (value === undefined) {
      throw new Error(message || 'Expected defined value, got undefined');
    }
  };

  /**
   * Assert value is of specific type
   * @param {*} value - Value to check
   * @param {string} expectedType - Expected type string
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertType = function(value, expectedType, message) {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(message || `Expected type ${expectedType}, got ${actualType}`);
    }
  };

  /**
   * Assert value is an instance of a class
   * @param {*} value - Value to check
   * @param {Function} constructor - Constructor function
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertInstanceOf = function(value, constructor, message) {
    if (!(value instanceof constructor)) {
      throw new Error(message || `Expected instance of ${constructor.name}`);
    }
  };

  /**
   * Assert array contains value
   * @param {Array} array - Array to check
   * @param {*} value - Value to find
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertContains = function(array, value, message) {
    if (!Array.isArray(array)) {
      throw new Error('assertContains requires an array');
    }
    if (!array.includes(value)) {
      throw new Error(message || `Array does not contain ${value}`);
    }
  };

  /**
   * Assert array has specific length
   * @param {Array} array - Array to check
   * @param {number} length - Expected length
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertLength = function(array, length, message) {
    if (!Array.isArray(array)) {
      throw new Error('assertLength requires an array');
    }
    if (array.length !== length) {
      throw new Error(message || `Expected array length ${length}, got ${array.length}`);
    }
  };

  /**
   * Assert two numbers are approximately equal
   * @param {number} actual - Actual value
   * @param {number} expected - Expected value
   * @param {number} [tolerance=0.001] - Allowed difference
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertApproxEqual = function(actual, expected, tolerance, message) {
    tolerance = tolerance || 0.001;
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(message || `Expected ${expected} (±${tolerance}), got ${actual}`);
    }
  };

  /**
   * Assert value is greater than threshold
   * @param {number} actual - Actual value
   * @param {number} threshold - Threshold value
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertGreaterThan = function(actual, threshold, message) {
    if (actual <= threshold) {
      throw new Error(message || `Expected ${actual} to be greater than ${threshold}`);
    }
  };

  /**
   * Assert value is less than threshold
   * @param {number} actual - Actual value
   * @param {number} threshold - Threshold value
   * @param {string} [message] - Optional error message
   */
  TestRunner.assertLessThan = function(actual, threshold, message) {
    if (actual >= threshold) {
      throw new Error(message || `Expected ${actual} to be less than ${threshold}`);
    }
  };

})(typeof TestRunner !== 'undefined' ? TestRunner : module.exports);
