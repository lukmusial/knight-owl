/**
 * FX Module
 * Visual effects for encounters: answer feedback, monster hit/attack/defeat,
 * loot reveal, victory celebration. CSS-driven (see css/fx.css); this module
 * only toggles classes and resolves Promises when animations end.
 *
 * Every function returns a Promise that resolves immediately when the element
 * is missing, there is no DOM, or the user prefers reduced motion.
 * Also proxies sounds (SFX) and haptics (CapacitorHaptics) with typeof guards.
 */

var FX = (function() {
  var hasDom = typeof document !== 'undefined';
  var reducedMotionCached = null;

  /**
   * Whether the user prefers reduced motion (cached, follows changes)
   * @returns {boolean}
   */
  function reducedMotion() {
    if (reducedMotionCached !== null) return reducedMotionCached;
    reducedMotionCached = false;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionCached = !!mq.matches;
        var onChange = function(e) { reducedMotionCached = !!e.matches; };
        if (typeof mq.addEventListener === 'function') {
          mq.addEventListener('change', onChange);
        } else if (typeof mq.addListener === 'function') {
          mq.addListener(onChange);
        }
      } catch (e) { /* ignore */ }
    }
    return reducedMotionCached;
  }

  function skip() {
    return Promise.resolve();
  }

  function wait(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  /**
   * Add a CSS class and resolve when its animation ends (or after maxMs)
   * @param {Element} el - Target element
   * @param {string} className - Class that triggers the animation
   * @param {number} maxMs - Safety timeout
   * @param {boolean} [keepClass] - Leave the class on (for 'forwards' animations)
   * @returns {Promise}
   */
  function animate(el, className, maxMs, keepClass) {
    if (!hasDom || !el || reducedMotion()) return skip();

    return new Promise(function(resolve) {
      var done = false;
      var timer = null;

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        el.removeEventListener('animationend', onEnd);
        if (!keepClass) el.classList.remove(className);
        resolve();
      }

      function onEnd(e) {
        // the panel's own entrance animation ending is not the effect ending
        if (e.target === el && e.animationName !== 'fx-modal-in') finish();
      }

      el.addEventListener('animationend', onEnd);
      // Restart the animation if the class is already present
      el.classList.remove(className);
      void el.offsetWidth;
      el.classList.add(className);
      timer = setTimeout(finish, maxMs);
    });
  }

  /**
   * Spawn a burst of particle spans around the centre of a parent
   */
  function burst(parent, count, className) {
    if (!hasDom || !parent || reducedMotion()) return;
    var spans = [];
    for (var i = 0; i < count; i++) {
      var span = document.createElement('span');
      span.className = className;
      var angle = (i / count) * Math.PI * 2 + random(-0.3, 0.3);
      var radius = random(40, 110);
      span.style.setProperty('--dx', Math.round(Math.cos(angle) * radius) + 'px');
      span.style.setProperty('--dy', Math.round(Math.sin(angle) * radius) + 'px');
      span.style.setProperty('--h', Math.round(random(0, 360)));
      parent.appendChild(span);
      spans.push(span);
    }
    setTimeout(function() {
      for (var j = 0; j < spans.length; j++) {
        if (spans[j].parentNode) spans[j].parentNode.removeChild(spans[j]);
      }
    }, 800);
  }

  // ---------------------------------------------------------------------------
  // Encounter effects
  // ---------------------------------------------------------------------------

  /**
   * Flash the tapped answer green/red; on a wrong answer also highlight the right one
   * @param {Element} btn - Tapped answer button
   * @param {boolean} correct - Whether the answer was correct
   * @param {Element} [correctBtn] - The correct answer button (wrong case)
   * @returns {Promise}
   */
  function answerFeedback(btn, correct, correctBtn) {
    if (!hasDom || !btn || reducedMotion()) return skip();
    if (correct) {
      return animate(btn, 'fx-correct', 550, true);
    }
    var p = animate(btn, 'fx-wrong', 600, true);
    if (correctBtn && correctBtn !== btn) {
      correctBtn.classList.add('fx-reveal-correct');
    }
    return p.then(function() { return wait(700); });
  }

  function monsterHit(img) {
    return animate(img, 'fx-hit', 600);
  }

  function monsterAttack(img, container) {
    return Promise.all([
      animate(img, 'fx-lunge', 700),
      animate(container, 'fx-screen-shake', 600)
    ]);
  }

  function monsterDefeat(img) {
    if (!hasDom || !img || reducedMotion()) return skip();
    burst(img.parentNode, 12, 'fx-particle');
    return animate(img, 'fx-defeat', 900, true);
  }

  function streakPulse(dot) {
    return animate(dot, 'fx-streak-pop', 700);
  }

  /**
   * Stagger-in every list item inside a loot container
   */
  function lootReveal(container) {
    if (!hasDom || !container || reducedMotion()) return skip();
    var items = container.querySelectorAll('li');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--i', i);
      items[i].classList.add('fx-loot-item');
    }
    return wait(350 + items.length * 120 + 200);
  }

  /**
   * Banner pop, staggered stat tiles and a confetti shower
   */
  function victoryCelebration(root) {
    if (!hasDom || !root || reducedMotion()) return skip();

    var tiles = root.querySelectorAll('.final-stat');
    for (var i = 0; i < tiles.length; i++) {
      tiles[i].style.setProperty('--i', i);
      tiles[i].classList.add('fx-stagger-in');
    }

    var layer = document.createElement('div');
    layer.className = 'fx-confetti-layer';
    for (var j = 0; j < 40; j++) {
      var piece = document.createElement('span');
      piece.className = 'fx-confetti';
      piece.style.setProperty('--x', random(0, 100).toFixed(1) + 'vw');
      piece.style.setProperty('--h', Math.round(random(0, 360)));
      piece.style.setProperty('--delay', random(0, 1.5).toFixed(2) + 's');
      piece.style.setProperty('--d', random(2.5, 4).toFixed(2) + 's');
      layer.appendChild(piece);
    }
    root.appendChild(layer);
    setTimeout(function() {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 5000);

    var banner = root.querySelector('.victory-banner');
    return animate(banner, 'fx-banner-in', 800);
  }

  function defeatShake(el) {
    return Promise.all([
      animate(el, 'fx-shake-x', 600),
      animate(el, 'fx-flash-red', 600)
    ]);
  }

  /**
   * Strip effect classes and inline styles left by a previous encounter
   */
  function resetMonster(img) {
    if (!hasDom || !img) return;
    var classes = ['fx-hit', 'fx-lunge', 'fx-defeat', 'fx-shake-x', 'fx-flash-red'];
    for (var i = 0; i < classes.length; i++) img.classList.remove(classes[i]);
    img.style.transform = '';
    img.style.filter = '';
    img.style.opacity = '';
    if (img.parentNode) {
      var leftovers = img.parentNode.querySelectorAll('.fx-particle');
      for (var j = 0; j < leftovers.length; j++) leftovers[j].parentNode.removeChild(leftovers[j]);
    }
  }

  // ---------------------------------------------------------------------------
  // Proxies
  // ---------------------------------------------------------------------------

  /**
   * Trigger a haptic pattern if the Capacitor plugin is available
   * @param {string} name - CapacitorHaptics method name (e.g. 'onCorrectAnswer')
   */
  function haptic(name) {
    try {
      if (typeof CapacitorHaptics === 'undefined') return false;
      if (typeof CapacitorHaptics.isAvailable === 'function' && !CapacitorHaptics.isAvailable()) return false;
      if (typeof CapacitorHaptics[name] !== 'function') return false;
      var p = CapacitorHaptics[name]();
      if (p && typeof p.then === 'function') p.then(null, function() {});
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Play a sound effect if SFX is loaded
   */
  function play(name, opts) {
    if (typeof SFX === 'undefined' || typeof SFX.play !== 'function') return false;
    return SFX.play(name, opts);
  }

  return {
    reducedMotion: reducedMotion,
    animate: animate,
    answerFeedback: answerFeedback,
    monsterHit: monsterHit,
    monsterAttack: monsterAttack,
    monsterDefeat: monsterDefeat,
    streakPulse: streakPulse,
    lootReveal: lootReveal,
    victoryCelebration: victoryCelebration,
    defeatShake: defeatShake,
    resetMonster: resetMonster,
    haptic: haptic,
    play: play
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FX;
}
