/**
 * Music Module
 * Background music as a gapless loop. Plays through the Web Audio API
 * (AudioBufferSourceNode with loop points, sample-accurate) and falls back to
 * a looping HTMLAudioElement where Web Audio is missing. Starts on the first
 * user gesture when autoplay is blocked, fades in/out, and follows the
 * sound-effects mute flag (SFX.isMuted). Safe to load without a DOM.
 */

var Music = (function() {
  var THEME_URL = 'assets/music/start-theme.mp3';
  var VOLUME = 0.55;
  var SILENCE = 0.004;      // decoder padding below this amplitude is trimmed from the loop
  var AC = (typeof window !== 'undefined') ? (window.AudioContext || window.webkitAudioContext) : null;

  var ctx = null;
  var gain = null;
  var source = null;
  var buffers = {};         // url -> AudioBuffer
  var loading = {};         // url -> true while fetching
  var audio = null;         // HTMLAudio fallback
  var currentUrl = null;
  var wanted = false;
  var muted = false;
  var fadeTimer = null;
  var gestureArmed = false;
  var GESTURE_EVENTS = ['pointerdown', 'touchend', 'keydown', 'click'];

  function hasAudioElement() {
    return typeof window !== 'undefined' && typeof window.Audio === 'function';
  }

  // ---------------------------------------------------------------------------
  // Web Audio path
  // ---------------------------------------------------------------------------
  function ensureContext() {
    if (!AC) return null;
    if (ctx) return ctx;
    try {
      ctx = new AC();
      gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function running() {
    return !!ctx && ctx.state === 'running';
  }

  function loadBuffer(url) {
    if (buffers[url] || loading[url] || typeof fetch !== 'function') return;
    loading[url] = true;
    fetch(url).then(function(r) {
      if (!r.ok) throw new Error(r.status);
      return r.arrayBuffer();
    }).then(function(data) {
      return new Promise(function(resolve, reject) { ctx.decodeAudioData(data, resolve, reject); });
    }).then(function(buffer) {
      buffers[url] = buffer;
      delete loading[url];
      if (wanted && currentUrl === url) startSource();
    }).catch(function(e) {
      delete loading[url];
      console.warn('Music: cannot decode ' + url + ', using audio element:', e && e.message ? e.message : e);
      playElement(url);
    });
  }

  /**
   * Loop points that skip leading/trailing encoder silence
   */
  function loopPoints(buffer) {
    var data = buffer.getChannelData(0);
    var start = 0, end = data.length - 1;
    while (start < end && Math.abs(data[start]) < SILENCE) start++;
    while (end > start && Math.abs(data[end]) < SILENCE) end--;
    return { start: start / buffer.sampleRate, end: (end + 1) / buffer.sampleRate };
  }

  function startSource() {
    if (!ctx || !running() || !wanted || muted) return;
    var buffer = buffers[currentUrl];
    if (!buffer || source) return;
    var pts = loopPoints(buffer);
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = pts.start;
    source.loopEnd = pts.end;
    source.connect(gain);
    source.start(0, pts.start);
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 1.2);
  }

  function stopSource(fadeMs) {
    if (!source) return;
    var src = source;
    source = null;
    var t = ctx.currentTime;
    var secs = (fadeMs === undefined ? 700 : fadeMs) / 1000;
    try {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + secs);
      src.stop(t + secs + 0.05);
    } catch (e) {
      try { src.stop(); } catch (e2) { /* ignore */ }
    }
  }

  // ---------------------------------------------------------------------------
  // HTMLAudio fallback
  // ---------------------------------------------------------------------------
  function clearFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  }

  function fadeElementTo(target, ms, done) {
    if (!audio) return;
    clearFade();
    var start = audio.volume, steps = Math.max(1, Math.round(ms / 50)), i = 0;
    fadeTimer = setInterval(function() {
      i++;
      try { audio.volume = Math.max(0, Math.min(1, start + (target - start) * (i / steps))); } catch (e) { /* ignore */ }
      if (i >= steps) { clearFade(); if (done) done(); }
    }, 50);
  }

  function playElement(url) {
    if (!hasAudioElement() || !wanted || muted) return;
    if (!audio || audio.src.indexOf(url) === -1) {
      if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } }
      audio = new window.Audio(url);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
    }
    var p;
    try { p = audio.play(); } catch (e) { armGesture(); return; }
    if (p && typeof p.then === 'function') {
      p.then(function() { fadeElementTo(VOLUME, 1200); }, function() { armGesture(); });
    } else {
      fadeElementTo(VOLUME, 1200);
    }
  }

  function stopElement(fadeMs) {
    if (!audio) return;
    var el = audio;
    fadeElementTo(0, fadeMs === undefined ? 700 : fadeMs, function() { try { el.pause(); } catch (e) { /* ignore */ } });
  }

  // ---------------------------------------------------------------------------
  // Gesture unlock
  // ---------------------------------------------------------------------------
  function onGesture() {
    if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      ctx.resume().then(function() { if (running()) { disarmGesture(); resume(); } }, function() {});
    } else {
      disarmGesture();
      resume();
    }
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

  /**
   * (Re)start playback of the wanted track on whichever path is available
   */
  function resume() {
    if (!wanted || muted || !currentUrl) return;
    if (ensureContext()) {
      if (!running()) { armGesture(); return; }
      if (buffers[currentUrl]) startSource(); else loadBuffer(currentUrl);
      return;
    }
    playElement(currentUrl);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Play a looping track (default: the start-screen theme)
   */
  function play(url) {
    if (!AC && !hasAudioElement()) return false;
    url = url || THEME_URL;
    if (currentUrl !== url) {
      stopSource(300);
      stopElement(300);
      currentUrl = url;
    }
    wanted = true;
    if (muted) return true;
    resume();
    return true;
  }

  /**
   * Stop with a fade-out
   */
  function stop(fadeMs) {
    wanted = false;
    disarmGesture();
    stopSource(fadeMs);
    stopElement(fadeMs);
  }

  function setMuted(value) {
    muted = !!value;
    if (muted) {
      stopSource(150);
      clearFade();
      if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } audio.volume = 0; }
    } else if (wanted) {
      resume();
    }
  }

  function isMuted() {
    return muted;
  }

  function isPlaying() {
    return !!source || (!!audio && !audio.paused);
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
