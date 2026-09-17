/**
 * FX / SFX Module Tests
 * Pure parts only: recipe table integrity, no-op behaviour without an
 * AudioContext/DOM, mute persistence, promise contracts.
 */

TestRunner.suite('SFX Module', () => {
  var REQUIRED = ['tap', 'hit', 'wrong', 'correct', 'streak', 'defeat-monster', 'coin', 'coins',
    'attack', 'dragon-roar', 'victory', 'defeat-sting', 'step', 'turn', 'door', 'reveal',
    'bump', 'knockback', 'pushback', 'torch-ignite', 'door-creak', 'drip', 'lava-bubble'];

  TestRunner.test('all required recipes exist', () => {
    REQUIRED.forEach(function(name) {
      TestRunner.assertTruthy(SFX.RECIPES[name], 'missing recipe ' + name);
    });
  });

  TestRunner.test('recipes are well formed and short', () => {
    Object.keys(SFX.RECIPES).forEach(function(name) {
      var r = SFX.RECIPES[name];
      TestRunner.assert(r.dur > 0 && r.dur <= 3, name + ' duration out of range: ' + r.dur);
      TestRunner.assertArray(r.steps, name + ' steps should be array');
      TestRunner.assert(r.steps.length > 0, name + ' has no steps');
      r.steps.forEach(function(step, i) {
        TestRunner.assert(step.at >= 0, name + '[' + i + '] negative offset');
        TestRunner.assert(step.d > 0, name + '[' + i + '] non-positive duration');
        TestRunner.assert(step.at + step.d <= r.dur + 0.05, name + '[' + i + '] exceeds recipe duration');
        TestRunner.assert(step.g > 0 && step.g <= 1, name + '[' + i + '] gain out of range');
        if (step.kind === 'tone') {
          TestRunner.assert(step.f > 0, name + '[' + i + '] tone needs frequency');
        }
      });
    });
  });

  TestRunner.test('is a safe no-op without AudioContext', () => {
    SFX.init();
    SFX.unlock();
    TestRunner.assertEqual(SFX.isAvailable(), false, 'not available in node');
    TestRunner.assertEqual(SFX.play('correct'), false, 'play returns false without context');
    TestRunner.assertEqual(SFX.play('no-such-sound'), false, 'unknown sound returns false');
    SFX.duck(true);
    SFX.duck(false);
    TestRunner.assertEqual(SFX.getAudioOutput(), null, 'no audio output without a running context');
  });

  TestRunner.test('mute state persists in localStorage', () => {
    SFX.setMuted(true);
    TestRunner.assertEqual(localStorage.getItem(SFX.STORAGE_KEY), '1', 'muted stored as 1');
    SFX.reset();
    TestRunner.assertEqual(SFX.isMuted(), true, 'mute survives reset');
    SFX.setMuted(false);
    TestRunner.assertEqual(localStorage.getItem(SFX.STORAGE_KEY), '0', 'unmuted stored as 0');
    TestRunner.assertEqual(SFX.toggleMuted(), true, 'toggle flips to muted');
    TestRunner.assertEqual(SFX.toggleMuted(), false, 'toggle flips back');
  });
});

TestRunner.suite('FX Module', () => {
  TestRunner.test('reducedMotion returns a boolean without matchMedia', () => {
    TestRunner.assertEqual(typeof FX.reducedMotion(), 'boolean', 'boolean expected');
  });

  TestRunner.test('proxies degrade gracefully', () => {
    TestRunner.assertEqual(FX.play('step'), false, 'no audio context in node');
    var threw = false;
    try { FX.haptic('onNavigation'); } catch (e) { threw = true; }
    TestRunner.assert(!threw, 'haptic must never throw');
    FX.resetMonster(null);
  });

  TestRunner.testAsync('effects resolve immediately when elements are missing', () => {
    return Promise.all([
      FX.animate(null, 'fx-hit', 100),
      FX.answerFeedback(null, true),
      FX.answerFeedback(null, false, null),
      FX.monsterHit(undefined),
      FX.monsterAttack(null, null),
      FX.monsterDefeat(null),
      FX.streakPulse(null),
      FX.lootReveal(null),
      FX.victoryCelebration(null),
      FX.defeatShake(null)
    ]).then(function(results) {
      TestRunner.assertEqual(results.length, 10, 'all effects resolved');
    });
  });
});
