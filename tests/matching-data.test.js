/**
 * Matching Data Validation Tests
 * Guards against ambiguous pairings (one right-column item fitting two
 * left-column items) and wrong gender/number agreement in matching sets.
 */

TestRunner.suite('Matching Data - English/Polish sets', () => {
  TestRunner.test('every set has 4 pairs with non-empty sides', () => {
    MATCHING_QUESTIONS.forEach(function(set) {
      TestRunner.assertEqual(set.pairs.length, 4, set.id + ' should have 4 pairs');
      set.pairs.forEach(function(p) {
        TestRunner.assertTruthy(p.left && p.right, set.id + ' has empty pair');
      });
    });
  });

  TestRunner.test('no duplicate left or right values within a set', () => {
    MATCHING_QUESTIONS.forEach(function(set) {
      var lefts = {}, rights = {};
      set.pairs.forEach(function(p) {
        TestRunner.assert(!lefts[p.left], set.id + ' duplicate left: ' + p.left);
        TestRunner.assert(!rights[p.right], set.id + ' duplicate right: ' + p.right);
        lefts[p.left] = true;
        rights[p.right] = true;
      });
    });
  });

  TestRunner.test('explanation mentions every pair', () => {
    MATCHING_QUESTIONS.forEach(function(set) {
      set.pairs.forEach(function(p) {
        TestRunner.assert(set.explanation.indexOf(p.left + ' = ' + p.right) !== -1,
          set.id + ' explanation missing "' + p.left + ' = ' + p.right + '"');
      });
    });
  });

  TestRunner.test('set IDs are unique', () => {
    var seen = {};
    MATCHING_QUESTIONS.forEach(function(set) {
      TestRunner.assert(!seen[set.id], 'duplicate id ' + set.id);
      seen[set.id] = true;
    });
  });
});

TestRunner.suite('Matching Data - pronoun/numeral agreement', () => {
  // Nouns that look feminine (-a) but are masculine
  var MASC_A = ['mężczyzna', 'dentysta', 'kolega', 'artysta', 'kierowca', 'poeta',
    'kosmonauta', 'tata', 'hrabia', 'sędzia', 'woźnica', 'sprzedawca', 'wychowawca',
    'astronauta', 'pirat'];
  // Nouns that look neuter (-ę/-e) but are masculine
  var MASC_E = ['książę'];
  // Indeclinable neuter nouns
  var NEUTER_OTHER = ['menu'];
  // Feminine nouns ending in a consonant
  var FEM_CONSONANT = ['noc', 'sól', 'twarz', 'rzecz', 'podróż', 'marchew', 'kość',
    'pieśń', 'wieś', 'mysz', 'łódź', 'gałąź', 'kolej', 'gęś', 'myśl', 'krew', 'brew'];
  // Plurale tantum / plural forms that must never be used as a singular
  var PLURAL_ONLY = ['skrzypce', 'drzwi', 'spodnie', 'nożyczki', 'okulary', 'usta', 'plecy',
    'kopie'];
  // Nouns whose nominative plural equals genitive plural (fit both dwie and pięć)
  var NOM_EQ_GEN_PL = ['gęsi', 'myszy', 'kości', 'rzeczy', 'pieśni', 'myśli', 'dzieci'];

  function endsWith(word, suffix) {
    return word.length >= suffix.length && word.slice(-suffix.length) === suffix;
  }
  function endsWithAny(word, suffixes) {
    return suffixes.some(function(s) { return endsWith(word, s); });
  }

  /**
   * Heuristic gender of a singular noun: 'm', 'f', 'n' or null (not singular)
   */
  function singularGender(noun) {
    if (PLURAL_ONLY.indexOf(noun) !== -1) return null;
    if (MASC_A.indexOf(noun) !== -1 || MASC_E.indexOf(noun) !== -1) return 'm';
    if (FEM_CONSONANT.indexOf(noun) !== -1) return 'f';
    if (NEUTER_OTHER.indexOf(noun) !== -1) return 'n';
    if (endsWith(noun, 'a')) return 'f';
    if (endsWithAny(noun, ['o', 'e', 'ę', 'um'])) return 'n';
    return 'm';
  }

  // Collect masculine-personal plural nouns from the data itself ('ci' pairs) plus known ones
  var MASC_PERSONAL_PL = ['bracia', 'ludzie', 'rodzice', 'chłopcy'];
  PRONOUN_MATCHING_QUESTIONS.forEach(function(set) {
    set.pairs.forEach(function(p) {
      if (p.left === 'ci' && MASC_PERSONAL_PL.indexOf(p.right) === -1) {
        MASC_PERSONAL_PL.push(p.right);
      }
    });
  });

  function isMascPersonalPlural(noun) {
    return MASC_PERSONAL_PL.indexOf(noun) !== -1;
  }
  function looksPlural(noun) {
    return endsWithAny(noun, ['y', 'i', 'e', 'a']);
  }

  /**
   * Whether a form can be a genitive plural (what pięć requires):
   * bare stem (lamp, psów, lat), -y after a hushing/soft consonant
   * (kluczy, nocy), or -i after a soft consonant or vowel (koni, galerii).
   * Hard-stem nominative plurals like "lampy" or "kanapki" are excluded.
   */
  function looksGenitivePlural(noun) {
    if (endsWithAny(noun, ['a', 'o', 'e', 'ę'])) return false;
    if (endsWith(noun, 'y')) return endsWithAny(noun, ['czy', 'szy', 'rzy', 'ży', 'cy', 'dzy']);
    if (endsWith(noun, 'i')) return endsWithAny(noun, ['li', 'ni', 'si', 'ci', 'zi', 'ji', 'ai', 'ei', 'ii', 'oi']);
    return true;
  }

  var SINGULAR_LEFTS = ['ten', 'ta', 'to', 'jeden', 'jedna', 'jedno'];
  var PLURAL_LEFTS = ['te', 'ci', 'dwa', 'dwie', 'pięć'];

  /**
   * Whether a noun agrees with a left-column word.
   * Singular vs plural cannot be told from the ending alone (sowa/drzewa),
   * so number is taken from the left word and only gender/case is checked.
   */
  function agrees(left, noun) {
    var g = singularGender(noun);
    switch (left) {
      case 'ten': case 'jeden': return g === 'm';
      case 'ta': case 'jedna': return g === 'f';
      case 'to': case 'jedno': return g === 'n';
      case 'te': return looksPlural(noun) && !isMascPersonalPlural(noun);
      case 'ci': return isMascPersonalPlural(noun);
      case 'dwa':
        // masc/neuter nominative plural: exclude genitive-only forms like "kluczy"
        // (the nom=gen forms in NOM_EQ_GEN_PL are all feminine or take "dwoje")
        return looksPlural(noun) && !isMascPersonalPlural(noun) && !looksGenitivePlural(noun);
      case 'dwie':
        // feminine nominative plural; nom=gen forms like "gęsi" also qualify
        return looksPlural(noun) && !isMascPersonalPlural(noun) &&
          (!looksGenitivePlural(noun) || NOM_EQ_GEN_PL.indexOf(noun) !== -1);
      case 'pięć': return looksGenitivePlural(noun);
      default: throw new Error('Unknown left word: ' + left);
    }
  }

  /**
   * Left-column words of the same number class (singular/plural) as the
   * assigned one that the noun also fits.
   */
  function fittingLefts(noun, assignedLeft, leftsInSet) {
    var sameClass = SINGULAR_LEFTS.indexOf(assignedLeft) !== -1 ? SINGULAR_LEFTS : PLURAL_LEFTS;
    var fits = leftsInSet.filter(function(left) {
      return sameClass.indexOf(left) !== -1 && agrees(left, noun);
    });
    // Plural forms that are both nominative and genitive fit dwie/dwa and pięć
    if (NOM_EQ_GEN_PL.indexOf(noun) !== -1 && leftsInSet.indexOf('pięć') !== -1 &&
        (assignedLeft === 'dwa' || assignedLeft === 'dwie') && fits.indexOf('pięć') === -1) {
      fits.push('pięć');
    }
    return fits;
  }

  TestRunner.test('every set has 4 pairs and unique values', () => {
    PRONOUN_MATCHING_QUESTIONS.forEach(function(set) {
      TestRunner.assertEqual(set.pairs.length, 4, set.id + ' should have 4 pairs');
      var lefts = {}, rights = {};
      set.pairs.forEach(function(p) {
        TestRunner.assert(!lefts[p.left], set.id + ' duplicate left: ' + p.left);
        TestRunner.assert(!rights[p.right], set.id + ' duplicate right: ' + p.right);
        lefts[p.left] = true;
        rights[p.right] = true;
      });
    });
  });

  TestRunner.test('each noun agrees with its assigned pronoun/numeral', () => {
    PRONOUN_MATCHING_QUESTIONS.forEach(function(set) {
      var lefts = set.pairs.map(function(p) { return p.left; });
      set.pairs.forEach(function(p) {
        TestRunner.assert(agrees(p.left, p.right),
          set.id + ': "' + p.left + ' ' + p.right + '" does not agree');
      });
    });
  });

  TestRunner.test('no noun fits more than one left-column word in its set', () => {
    PRONOUN_MATCHING_QUESTIONS.forEach(function(set) {
      var lefts = set.pairs.map(function(p) { return p.left; });
      set.pairs.forEach(function(p) {
        var fits = fittingLefts(p.right, p.left, lefts);
        TestRunner.assert(fits.length === 1,
          set.id + ': "' + p.right + '" fits ' + fits.join('/'));
      });
    });
  });

  TestRunner.test('explanation mentions every pair', () => {
    PRONOUN_MATCHING_QUESTIONS.forEach(function(set) {
      set.pairs.forEach(function(p) {
        TestRunner.assert(set.explanation.indexOf(p.left + ' ' + p.right) !== -1,
          set.id + ' explanation missing "' + p.left + ' ' + p.right + '"');
      });
    });
  });

  TestRunner.test('regression: previously wrong pairs are fixed', () => {
    var byId = {};
    PRONOUN_MATCHING_QUESTIONS.forEach(function(s) { byId[s.id] = s; });
    function rightOf(id, left) {
      return byId[id].pairs.filter(function(p) { return p.left === left; })[0].right;
    }
    TestRunner.assert(rightOf('pronoun_117', 'jedno') !== 'kopie', 'kopie is not neuter singular');
    TestRunner.assert(rightOf('pronoun_125', 'jedno') !== 'skrzypce', 'skrzypce is plural only');
    TestRunner.assert(rightOf('pronoun_140', 'jedno') !== 'naszyjnik', 'naszyjnik is masculine');
    TestRunner.assert(rightOf('pronoun_169', 'dwa') !== 'bracia', 'bracia needs dwaj/dwóch');
    TestRunner.assert(rightOf('pronoun_165', 'dwie') !== 'gęsi', 'gęsi also fits pięć');
  });
});
