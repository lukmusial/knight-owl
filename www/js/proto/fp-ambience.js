/**
 * FpAmbience
 * Positional-ish ambient soundscape for the first-person prototype, synthesized
 * with Web Audio through the SFX master bus (so mute, TTS ducking and the
 * background suspend apply):
 *  - lava: a low brown-noise rumble plus random bubbling pops
 *  - water: a filtered, wobbling trickle plus random drips
 * Loudness follows the nearest explored source (FpLayout.ambienceLevel).
 */

var FpAmbience = (function() {
  var nodes = null;
  var timer = null;
  var source = null;
  var TICK_MS = 200;

  function noiseBuffer(ctx, brown) {
    var len = ctx.sampleRate * 2;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    return buf;
  }

  function loop(ctx, buffer) {
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.start();
    return src;
  }

  function build(out) {
    var ctx = out.context;
    var lavaGain = ctx.createGain();
    lavaGain.gain.value = 0;
    var lavaFilter = ctx.createBiquadFilter();
    lavaFilter.type = 'lowpass';
    lavaFilter.frequency.value = 170;
    loop(ctx, noiseBuffer(ctx, true)).connect(lavaFilter);
    lavaFilter.connect(lavaGain);
    lavaGain.connect(out.destination);

    var waterGain = ctx.createGain();
    waterGain.gain.value = 0;
    var waterFilter = ctx.createBiquadFilter();
    waterFilter.type = 'bandpass';
    waterFilter.frequency.value = 2300;
    waterFilter.Q.value = 1.4;
    var wobble = ctx.createGain();
    wobble.gain.value = 0.6;
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5;
    var lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.35;
    lfo.connect(lfoDepth);
    lfoDepth.connect(wobble.gain);
    lfo.start();
    loop(ctx, noiseBuffer(ctx, false)).connect(waterFilter);
    waterFilter.connect(wobble);
    wobble.connect(waterGain);
    waterGain.connect(out.destination);

    return { ctx: ctx, destination: out.destination, lava: lavaGain, water: waterGain };
  }

  function setGain(g, value) {
    try {
      g.gain.setTargetAtTime(value, nodes.ctx.currentTime, 0.35);
    } catch (e) {
      g.gain.value = value;
    }
  }

  function tick() {
    if (!source) return;
    var out = (typeof SFX !== 'undefined' && SFX.getAudioOutput) ? SFX.getAudioOutput() : null;
    if (!out) {
      if (nodes) { setGain(nodes.lava, 0); setGain(nodes.water, 0); }
      return;
    }
    if (!nodes || nodes.ctx !== out.context) nodes = build(out);
    var scape = source();
    if (!scape) return;
    var lava = FpLayout.ambienceLevel(scape.x, scape.z, scape.lava);
    var water = FpLayout.ambienceLevel(scape.x, scape.z, scape.water);
    setGain(nodes.lava, 0.9 * lava);
    setGain(nodes.water, 0.09 * water);
    var dt = TICK_MS / 1000;
    if (lava > 0.05 && Math.random() < 1.6 * dt) {
      SFX.play('lava-bubble', { volume: lava * (0.35 + Math.random() * 0.65), delay: Math.random() * dt });
    }
    if (water > 0.05 && Math.random() < 1.1 * dt) {
      SFX.play('drip', { volume: water * (0.3 + Math.random() * 0.5), delay: Math.random() * dt });
    }
  }

  /**
   * Start polling a soundscape provider: fn() -> { x, z, lava: [{x,z}], water: [{x,z}] }
   */
  function start(fn) {
    source = fn;
    if (!timer) timer = setInterval(tick, TICK_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (nodes) { setGain(nodes.lava, 0); setGain(nodes.water, 0); }
  }

  return { start: start, stop: stop };
})();
