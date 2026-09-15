/**
 * Music Module
 * Background music via a single looping HTMLAudioElement. Starts on the
 * first user gesture when autoplay is blocked, fades in/out, and follows the
 * sound-effects mute flag (SFX.isMuted). Safe to load without a DOM.
 */

var Music = (function() {
  var THEME_URL = 'assets/music/start-theme.mp3';
  var VOLUME = 0.55;

  var audio = null;
  var currentUrl = null;
  var wanted = false;         // play requested (may be waiting for a gesture)
  var muted = false;
  var fadeTimer = null;
  var gestureArmed = false;
  var GESTURE_EVENTS = ['pointerdown', 'touchend', 'keydown', 'click'];

  function hasAudio() {
    return typeof window !== 'undefined' && typeof window.Audio === 'function';
  }

  function ensureElement(url) {
    if (!hasAudio()) return null;
    if (audio && currentUrl === url) return audio;
    if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } }
    audio = new window.Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    currentUrl = url;
    return audio;
  }

  function clearFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  }

  function fadeTo(target, ms, done) {
    if (!audio) return;
    clearFade();
    var start = audio.volume;
    var steps = Math.max(1, Math.round(ms / 50));
    var i = 0;
    fadeTimer = setInterval(function() {
      i++;
      var v = start + (target - start) * (i / steps);
      try { audio.volume = Math.max(0, Math.min(1, v)); } catch (e) { /* ignore */ }
      if (i >= steps) {
        clearFade();
        if (done) done();
      }
    }, 50);
  }

  function onGesture() {
    disarmGesture();
    if (wanted) tryPlay();
  }

  function armGesture() {
    if (gestureArmed || typeof document === 'undefined') return;
    for (var i = 0; i < GESTURE_EVENTS.length; i++) {
      document.addEventListener(GESTURE_EVENTS[i], onGesture, { capture: true, passive: true });
    }
    gestureArmed = true;
  }

  function disarmGesture() {
    if (!gestureArmed || typeof document === 'undefined') return;
    for (var i = 0; i < GESTURE_EVENTS.length; i++) {
      document.removeEventListener(GESTURE_EVENTS[i], onGesture, true);
    }
    gestureArmed = false;
  }

  function tryPlay() {
    if (!audio || !wanted || muted) return;
    var p;
    try { p = audio.play(); } catch (e) { armGesture(); return; }
    if (p && typeof p.then === 'function') {
      p.then(function() {
        fadeTo(VOLUME, 1200);
      }, function() {
        // Autoplay blocked: wait for the first tap/key
        armGesture();
      });
    } else {
      fadeTo(VOLUME, 1200);
    }
  }

  /**
   * Play a looping track (default: the start-screen theme)
   */
  function play(url) {
    if (!hasAudio()) return false;
    wanted = true;
    var el = ensureElement(url || THEME_URL);
    if (!el) return false;
    if (muted) return true;
    tryPlay();
    return true;
  }

  /**
   * Stop with a fade-out
   */
  function stop(fadeMs) {
    wanted = false;
    disarmGesture();
    if (!audio) return;
    var el = audio;
    fadeTo(0, fadeMs === undefined ? 700 : fadeMs, function() {
      try { el.pause(); } catch (e) { /* ignore */ }
    });
  }

  function setMuted(value) {
    muted = !!value;
    if (muted) {
      clearFade();
      if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } audio.volume = 0; }
    } else if (wanted) {
      tryPlay();
    }
  }

  function isMuted() {
    return muted;
  }

  function isPlaying() {
    return !!audio && !audio.paused;
  }

  /**
   * Read the shared mute flag and keep it in sync
   */
  function init() {
    if (typeof SFX !== 'undefined' && SFX.isMuted) muted = SFX.isMuted();
  }

  return {
    init: init,
    play: play,
    stop: stop,
    setMuted: setMuted,
    isMuted: isMuted,
    isPlaying: isPlaying,
    THEME_URL: THEME_URL
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Music;
}
