/**
 * SFX Module
 * Synthesized sound effects via the Web Audio API. No audio files needed.
 *
 * Every sound is a "recipe": a list of steps (tones or noise bursts) with
 * frequencies, envelopes and filters. Audio is unlocked on the first user
 * gesture (required by iOS/Android WebViews) and can be muted persistently.
 * Safe to load without a window (unit tests): every method becomes a no-op.
 */

var SFX = (function() {
  var AC = (typeof window !== 'undefined')
    ? (window.AudioContext || window.webkitAudioContext)
    : null;

  var STORAGE_KEY = 'mrowl_dungeon_sfx_muted';
  var MASTER_GAIN = 0.5;
  var DUCK_GAIN = 0.12;

  var ctx = null;
  var master = null;
  // Optional recorded clips: name -> [urls]; decoded buffers: name -> [AudioBuffer]
  var clipUrls = {};
  var clipBuffers = {};
  var clipsLoading = false;
  var noiseBuffer = null;
  var muted = false;
  var ducked = false;
  var initialized = false;
  var unlockListenersArmed = false;
  var backgrounded = false;

  var UNLOCK_EVENTS = ['pointerdown', 'touchend', 'keydown', 'click'];

  // ---------------------------------------------------------------------------
  // Recipes
  // step: { kind:'tone'|'noise', at, d, g, type, f, fEnd, filter, filterFreq, filterEnd }
  // ---------------------------------------------------------------------------
  function tone(at, d, g, type, f, fEnd, filter, filterFreq) {
    return { kind: 'tone', at: at, d: d, g: g, type: type, f: f, fEnd: fEnd || null,
      filter: filter || null, filterFreq: filterFreq || null };
  }
  function noise(at, d, g, filter, filterFreq, filterEnd) {
    return { kind: 'noise', at: at, d: d, g: g, filter: filter || 'lowpass',
      filterFreq: filterFreq || 1000, filterEnd: filterEnd || null };
  }

  var RECIPES = {
    'tap': { dur: 0.06, steps: [tone(0, 0.05, 0.12, 'square', 880, 660)] },
    'hit': { dur: 0.20, steps: [
      noise(0, 0.12, 0.5, 'lowpass', 900),
      tone(0, 0.16, 0.4, 'sine', 180, 60)
    ] },
    'wrong': { dur: 0.55, steps: [
      tone(0, 0.25, 0.25, 'sawtooth', 160, null, 'lowpass', 800),
      tone(0.22, 0.30, 0.25, 'sawtooth', 120, null, 'lowpass', 800)
    ] },
    'correct': { dur: 0.40, steps: [
      tone(0, 0.14, 0.3, 'triangle', 659.25),
      tone(0.10, 0.28, 0.3, 'triangle', 987.77)
    ] },
    'streak': { dur: 0.28, steps: [
      tone(0, 0.08, 0.25, 'sine', 880),
      tone(0.08, 0.18, 0.25, 'sine', 1108.7)
    ] },
    'defeat-monster': { dur: 0.75, steps: [
      noise(0, 0.30, 0.4, 'bandpass', 1200),
      tone(0, 0.35, 0.3, 'sine', 400, 80),
      tone(0.30, 0.15, 0.25, 'triangle', 523.25),
      tone(0.42, 0.25, 0.25, 'triangle', 783.99)
    ] },
    'coin': { dur: 0.14, steps: [tone(0, 0.12, 0.2, 'triangle', 1567.98, 2093)] },
    'coins': { dur: 0.50, steps: [
      tone(0, 0.14, 0.18, 'triangle', 1318.5),
      tone(0.09, 0.14, 0.18, 'triangle', 1567.98),
      tone(0.18, 0.14, 0.18, 'triangle', 2093),
      tone(0.27, 0.14, 0.18, 'triangle', 2637)
    ] },
    'attack': { dur: 0.50, steps: [
      noise(0, 0.25, 0.4, 'bandpass', 2000, 400),
      tone(0.25, 0.22, 0.5, 'sine', 100, 40),
      noise(0.25, 0.10, 0.4, 'lowpass', 500)
    ] },
    'dragon-roar': { dur: 0.95, steps: [
      tone(0, 0.85, 0.45, 'sawtooth', 90, 55, 'lowpass', 300),
      tone(0, 0.85, 0.3, 'sawtooth', 135, 80, 'lowpass', 300),
      noise(0, 0.85, 0.35, 'lowpass', 400)
    ] },
    'victory': { dur: 1.70, steps: [
      tone(0, 0.15, 0.25, 'triangle', 523.25), tone(0, 0.15, 0.08, 'square', 523.25),
      tone(0.15, 0.15, 0.25, 'triangle', 659.25), tone(0.15, 0.15, 0.08, 'square', 659.25),
      tone(0.30, 0.15, 0.25, 'triangle', 783.99), tone(0.30, 0.15, 0.08, 'square', 783.99),
      tone(0.45, 0.35, 0.25, 'triangle', 1046.5), tone(0.45, 0.35, 0.08, 'square', 1046.5),
      tone(0.85, 0.12, 0.25, 'triangle', 783.99), tone(0.85, 0.12, 0.08, 'square', 783.99),
      tone(1.00, 0.65, 0.25, 'triangle', 1046.5), tone(1.00, 0.65, 0.08, 'square', 1046.5)
    ] },
    'defeat-sting': { dur: 1.00, steps: [
      tone(0, 0.25, 0.3, 'triangle', 392, null, 'lowpass', 1200),
      tone(0.25, 0.22, 0.3, 'triangle', 349.23, null, 'lowpass', 1200),
      tone(0.47, 0.50, 0.3, 'triangle', 293.66, null, 'lowpass', 1200)
    ] },
    'step': { dur: 0.10, steps: [
      noise(0, 0.08, 0.35, 'lowpass', 250),
      tone(0, 0.06, 0.3, 'sine', 70)
    ] },
    'turn': { dur: 0.15, steps: [noise(0, 0.12, 0.2, 'highpass', 1500)] },
    'reveal': { dur: 0.45, steps: [
      noise(0, 0.40, 0.25, 'bandpass', 600),
      tone(0, 0.30, 0.15, 'triangle', 220, 330)
    ] },
    'bump': { dur: 0.12, steps: [tone(0, 0.10, 0.3, 'sine', 120, 60)] },
    // first-person dungeon: torch catching fire, heavy door, water drip, lava bubble
    'torch-ignite': { dur: 0.55, steps: [
      noise(0, 0.5, 0.3, 'bandpass', 350, 2600),
      tone(0, 0.18, 0.25, 'sine', 95, 55)
    ] },
    'door-creak': { dur: 0.75, steps: [
      tone(0, 0.45, 0.12, 'sawtooth', 210, 150, 'bandpass', 900),
      tone(0.12, 0.35, 0.06, 'square', 320, 230, 'bandpass', 1500),
      noise(0.55, 0.18, 0.3, 'lowpass', 280)
    ] },
    'drip': { dur: 0.08, steps: [tone(0, 0.07, 0.2, 'sine', 1300, 2600)] },
    'lava-bubble': { dur: 0.2, steps: [
      tone(0, 0.16, 0.35, 'sine', 65, 170, 'lowpass', 500),
      noise(0.02, 0.12, 0.12, 'lowpass', 220)
    ] },
    'knockback': { dur: 0.40, steps: [
      noise(0, 0.30, 0.35, 'lowpass', 600),
      tone(0, 0.35, 0.35, 'sine', 200, 60)
    ] },
    // cemetery thunder: a crack, then a rumble that rolls away for two seconds
    // (two lowpass noises with falling filters, one after the other, over a sub-bass sine)
    'thunder': { dur: 2.60, steps: [
      noise(0, 0.09, 0.6, 'highpass', 1500, 4000),
      tone(0, 0.07, 0.35, 'square', 420, 90),
      noise(0.04, 2.3, 0.55, 'lowpass', 900, 70),
      noise(0.35, 2.1, 0.4, 'lowpass', 500, 50),
      tone(0.05, 1.8, 0.3, 'sine', 62, 28)
    ] },
    // a foot landing in a shallow puddle: a soft wet slap and a short patter
    'splash': { dur: 0.26, steps: [
      noise(0, 0.10, 0.28, 'bandpass', 1900, 700),
      tone(0, 0.08, 0.12, 'sine', 480, 220),
      noise(0.05, 0.20, 0.16, 'lowpass', 1100, 500)
    ] }
  };
  RECIPES['door'] = RECIPES['reveal'];
  RECIPES['pushback'] = RECIPES['knockback'];

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------
  function loadMuted() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY) === '1';
      }
    } catch (e) { /* storage blocked */ }
    return false;
  }

  function storeMuted(value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
      }
    } catch (e) { /* storage blocked */ }
  }

  // ---------------------------------------------------------------------------
  // Context management
  // ---------------------------------------------------------------------------
  function ensureContext() {
    if (!AC) return null;
    if (ctx) return ctx;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = ducked ? DUCK_GAIN : MASTER_GAIN;
      master.connect(ctx.destination);

      var length = ctx.sampleRate;
      noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } catch (e) {
      console.warn('SFX: AudioContext unavailable:', e);
      ctx = null;
    }
    return ctx;
  }

  function isRunning() {
    return !!ctx && ctx.state === 'running';
  }

  /**
   * Build the AudioContext and the noise buffer now (some 300 ms on a phone)
   * instead of inside the frame that plays the first sound. Call it while a
   * loading screen is up. The context may come up suspended until the first
   * gesture; the unlock listeners resume it as before.
   */
  function warm() {
    return !!ensureContext();
  }

  function onUnlocked() {
    if (!unlockListenersArmed || typeof document === 'undefined') return;
    for (var i = 0; i < UNLOCK_EVENTS.length; i++) {
      document.removeEventListener(UNLOCK_EVENTS[i], unlock, true);
    }
    unlockListenersArmed = false;
    console.log('SFX: unlocked');
    loadClips();
  }

  /**
   * Register recorded clips for sound names. Each name maps to one url or a
   * list of urls (one is picked at random per play, e.g. footstep variants).
   * Clips are decoded after the audio unlock; until then, and for names
   * without a clip, the synthesized recipe plays.
   */
  function registerFiles(map) {
    Object.keys(map || {}).forEach(function(name) {
      var v = map[name];
      clipUrls[name] = Array.isArray(v) ? v.slice() : [v];
    });
    if (isRunning()) loadClips();
  }

  function loadClips() {
    if (clipsLoading || !ctx || typeof fetch !== 'function') return;
    clipsLoading = true;
    Object.keys(clipUrls).forEach(function(name) {
      if (clipBuffers[name]) return;
      clipUrls[name].forEach(function(url) {
        fetch(url).then(function(r) {
          if (!r.ok) throw new Error(r.status);
          return r.arrayBuffer();
        }).then(function(data) {
          return new Promise(function(resolve, reject) {
            // callback form: older WebViews lack the promise variant
            ctx.decodeAudioData(data, resolve, reject);
          });
        }).then(function(buffer) {
          (clipBuffers[name] = clipBuffers[name] || []).push(buffer);
        }).catch(function(e) {
          console.warn('SFX: clip not available ' + url + ':', e && e.message ? e.message : e);
        });
      });
    });
  }

  function playClip(c, name, volume, delay) {
    var list = clipBuffers[name];
    if (!list || !list.length) return false;
    var buffer = list[Math.floor(Math.random() * list.length)];
    var src = c.createBufferSource();
    src.buffer = buffer;
    var gain = c.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(master);
    src.start(c.currentTime + delay);
    return true;
  }

  /**
   * Create/resume the AudioContext. Must be called from a user gesture
   * on iOS; harmless elsewhere.
   */
  function unlock() {
    var c = ensureContext();
    if (!c) return;

    if (c.state === 'suspended' && typeof c.resume === 'function') {
      try {
        c.resume().then(function() {
          if (isRunning()) onUnlocked();
        }, function() { /* try again on next gesture */ });
      } catch (e) { /* ignore */ }
    }

    // iOS WebKit quirk: play a silent buffer inside the gesture
    try {
      var buf = c.createBuffer(1, 1, c.sampleRate);
      var src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      src.start(0);
    } catch (e) { /* ignore */ }

    if (isRunning()) onUnlocked();
  }

  function armUnlockListeners() {
    if (unlockListenersArmed || typeof document === 'undefined') return;
    for (var i = 0; i < UNLOCK_EVENTS.length; i++) {
      document.addEventListener(UNLOCK_EVENTS[i], unlock, { capture: true, passive: true });
    }
    unlockListenersArmed = true;
  }

  /**
   * Initialize: read mute flag and arm unlock listeners. Idempotent.
   * Does not create an AudioContext (that happens on the first gesture).
   */
  function init() {
    muted = loadMuted();
    if (initialized) return;
    initialized = true;

    if (!AC || typeof document === 'undefined') return;

    armUnlockListeners();

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && ctx && ctx.state !== 'running') {
        armUnlockListeners();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Synthesis primitives
  // ---------------------------------------------------------------------------
  function envelope(c, t0, dur, peak) {
    var gain = c.createGain();
    var attack = 0.005;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    gain.connect(master);
    return gain;
  }

  function playTone(c, step, t0, volume) {
    var osc = c.createOscillator();
    osc.type = step.type || 'sine';
    osc.frequency.setValueAtTime(step.f, t0);
    if (step.fEnd) {
      osc.frequency.exponentialRampToValueAtTime(step.fEnd, t0 + step.d);
    }

    var gain = envelope(c, t0, step.d, step.g * volume);
    var node = osc;
    if (step.filter) {
      var filter = c.createBiquadFilter();
      filter.type = step.filter;
      filter.frequency.setValueAtTime(step.filterFreq || 1000, t0);
      node.connect(filter);
      node = filter;
    }
    node.connect(gain);
    osc.start(t0);
    osc.stop(t0 + step.d + 0.02);
  }

  function playNoise(c, step, t0, volume) {
    var src = c.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    var filter = c.createBiquadFilter();
    filter.type = step.filter || 'lowpass';
    filter.frequency.setValueAtTime(step.filterFreq || 1000, t0);
    if (step.filterEnd) {
      filter.frequency.exponentialRampToValueAtTime(step.filterEnd, t0 + step.d);
    }

    var gain = envelope(c, t0, step.d, step.g * volume);
    src.connect(filter);
    filter.connect(gain);
    src.start(t0);
    src.stop(t0 + step.d + 0.02);
  }

  /**
   * Play a named sound
   * @param {string} name - Recipe name
   * @param {Object} [opts] - { volume: 0..1, delay: seconds }
   * @returns {boolean} Whether the sound was scheduled
   */
  function play(name, opts) {
    var recipe = RECIPES[name];
    if (!recipe && !clipUrls[name]) return false;
    if (muted || backgrounded) return false;

    var c = ensureContext();
    if (!c || c.state !== 'running') return false;

    opts = opts || {};
    var volume = (typeof opts.volume === 'number') ? opts.volume : 1;
    var delay = opts.delay || 0;
    var t0 = c.currentTime + delay;

    // A recorded clip wins over the synthesized recipe when one is decoded
    try {
      if (playClip(c, name, volume, delay)) return true;
    } catch (e) { /* fall through to synth */ }
    if (!recipe) return false;

    try {
      for (var i = 0; i < recipe.steps.length; i++) {
        var step = recipe.steps[i];
        if (step.kind === 'noise') {
          playNoise(c, step, t0 + step.at, volume);
        } else {
          playTone(c, step, t0 + step.at, volume);
        }
      }
    } catch (e) {
      console.warn('SFX: failed to play ' + name + ':', e);
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Mute / duck
  // ---------------------------------------------------------------------------
  function setMuted(value) {
    muted = !!value;
    storeMuted(muted);
  }

  function isMuted() {
    return muted;
  }

  function toggleMuted() {
    setMuted(!muted);
    return muted;
  }

  /**
   * Lower the master gain while speech (TTS) is playing
   * @param {boolean} on - Whether to duck
   */
  function duck(on) {
    ducked = !!on;
    if (!ctx || !master) return;
    var target = ducked ? DUCK_GAIN : MASTER_GAIN;
    try {
      master.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
    } catch (e) {
      master.gain.value = target;
    }
  }

  /**
   * App went to the background: silence everything (AppLifecycle)
   */
  function suspend() {
    backgrounded = true;
    if (ctx && ctx.state === 'running' && typeof ctx.suspend === 'function') {
      try {
        var p = ctx.suspend();
        if (p && typeof p.catch === 'function') p.catch(function() {});
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * Back in the foreground: resume the context, or wait for the next gesture
   */
  function resumeFromBackground() {
    backgrounded = false;
    if (!ctx || ctx.state === 'running' || typeof ctx.resume !== 'function') return;
    try {
      ctx.resume().then(function() {
        if (!isRunning()) armUnlockListeners();
      }, function() { armUnlockListeners(); });
    } catch (e) {
      armUnlockListeners();
    }
  }

  function isSuspended() {
    return backgrounded;
  }

  function isAvailable() {
    return isRunning();
  }

  /**
   * Test helper: drop the context and re-read persisted state
   */
  function reset() {
    if (ctx && typeof ctx.close === 'function') {
      try { ctx.close(); } catch (e) { /* ignore */ }
    }
    ctx = null;
    master = null;
    noiseBuffer = null;
    ducked = false;
    backgrounded = false;
    clipBuffers = {};
    clipsLoading = false;
    muted = loadMuted();
  }

  /**
   * Audio graph for callers that run their own long-lived sources (ambient
   * loops): the running context and the master gain (so mute-by-duck and
   * background suspend apply). Null while locked, muted or backgrounded.
   * @returns {Object|null} { context, destination }
   */
  function getAudioOutput() {
    if (muted || backgrounded || !isRunning() || !master) return null;
    return { context: ctx, destination: master };
  }

  function hasClip(name) {
    return !!(clipBuffers[name] && clipBuffers[name].length);
  }

  return {
    init: init,
    warm: warm,
    play: play,
    unlock: unlock,
    setMuted: setMuted,
    isMuted: isMuted,
    toggleMuted: toggleMuted,
    duck: duck,
    suspend: suspend,
    resumeFromBackground: resumeFromBackground,
    isSuspended: isSuspended,
    isAvailable: isAvailable,
    reset: reset,
    registerFiles: registerFiles,
    hasClip: hasClip,
    getAudioOutput: getAudioOutput,
    RECIPES: RECIPES,
    STORAGE_KEY: STORAGE_KEY
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SFX;
}
