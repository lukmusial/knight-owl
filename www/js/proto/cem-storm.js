/**
 * CemStorm
 * The pure side of the thunderstorm over the Halloween cemetery: when the
 * next strike is due, which lit tile it hits, the jagged bolt polyline with
 * its branches (seeded, so a strike can be replayed), the flicker of the bolt
 * and the flash of the whole view over time, and how long the thunder lags
 * behind a strike that far away. CemeteryScene (cem-scenes.js) draws it.
 * No Phaser, no DOM: node-tested in tests/cem-storm.test.js.
 */

var CemStorm = (function() {
  var DEFAULTS = {
    announceMinMs: 4000,    // the first strike of an episode comes this long before its rain starts
    announceMaxMs: 10000,
    announceFloorMs: 1000,  // but never before the scene is a second old (the first rain can come sooner than the lead)
    minGapMs: 25000,        // gaps between strikes while it rains, in a long episode; shorter ones
    maxGapMs: 60000,        // scale the gaps down so even a 30 s episode gets at least two
    retryMs: 4000,          // a strike skipped (card up, input off) is tried again this soon
    minDist: 2,             // tiles between Mr Owl and the struck tile, at least
    maxDist: 8,             // and at most: his own sight plus a lantern's, so the strike is on screen; the thunder lags longest at this range
    totalMinMs: 800,        // a strike, leader to last re-strike, lasts this long
    totalMaxMs: 1500,
    leaderMs: [80, 140],    // the dim leader flicker before the return stroke
    leaderPeak: 0.4,
    mainMs: [110, 160],     // the main return stroke, at full brightness
    restrikes: [2, 4],      // re-strikes down the same channel after it
    restrikeShare: [0.3, 0.5],  // how much of a re-strike's slot is lit, the rest is a dark gap
    restrikePeak: [0.8, 0.35],  // first to last re-strike
    glowLingerMs: 160,      // the glow stays this long after a stroke's core has gone
    noiseStepMs: 14,        // one flutter sample every so many ms
    flutterFloor: 0.5,      // the flutter never dims a stroke below this share
    flashPeak: 0.45,        // alpha of the additive view flash at full brightness
    thunderMinMs: 300,      // thunder lag for a strike at minDist, counted from the main stroke
    thunderMaxMs: 1200,     // and at maxDist
    shakeMs: 180,
    shakeStrength: 0.004,
    brightenRadius: 3,      // props this many tiles from the strike catch its light
    boltDetail: 5,          // midpoint-displacement passes: 2^detail segments
    boltSway: 0.12,         // first displacement, as a share of the bolt's length
    branches: [2, 3]        // how many side branches a bolt grows (min, max)
  };

  function config(opts) {
    var cfg = {};
    for (var k in DEFAULTS) if (DEFAULTS.hasOwnProperty(k)) cfg[k] = DEFAULTS[k];
    if (opts) for (var o in opts) if (opts.hasOwnProperty(o) && opts[o] !== undefined) cfg[o] = opts[o];
    return cfg;
  }

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  // ---------------------------------------------------------------------------
  // Scheduling
  // ---------------------------------------------------------------------------

  /**
   * The storm is tied to the rain: every rain episode gets one strike
   * 4-10 s before its rain starts (the storm announces the rain), then
   * strikes at random gaps while it rains, none once the rain has begun to
   * fade out, none in a dry spell. `plan` wraps a CemRain schedule; the
   * strikes of an episode are drawn from a generator seeded by the storm
   * seed and the episode's start, so they are the same however the
   * schedule is queried, and cached per episode.
   * @param {Object} rain - a CemRain schedule ({ episodes, cfg, ... })
   * @param {number} seed
   * @param {Object} [opts] - overrides of DEFAULTS
   */
  function plan(rain, seed, opts) {
    return { rain: rain, seed: (seed >>> 0) || 1, cfg: config(opts), cache: {}, fired: 0 };
  }

  /** mulberry32, the generator CemModel uses, so the plan needs nothing loaded before it */
  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    return function() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** How much the gaps shrink for an episode: 1 for a long one, down to a share that fits two strikes in it */
  function gapScale(activeMs, cfg) {
    return Math.min(1, activeMs / (2 * cfg.maxGapMs)) * 0.98;
  }

  /**
   * The strikes of one rain episode, in order: { at, until, kind, episode }.
   * `at` is when it is due (ms on the rain clock), `until` how long a
   * blocked strike may still wait before it is dropped: the announcing
   * strike until the rain starts, a rain strike until the rain starts
   * fading. Gaps while it rains are minGapMs-maxGapMs scaled to the
   * episode, so the strikes never run past the fade and a 30 s episode
   * still gets two.
   */
  function strikesFor(pl, episode) {
    var key = String(Math.round(episode.start));
    if (pl.cache[key]) return pl.cache[key];
    var cfg = pl.cfg;
    var rng = makeRng((pl.seed ^ Math.round(episode.start) * 2654435761) >>> 0);
    var out = [];
    var announceAt = episode.start - (cfg.announceMinMs + rng() * (cfg.announceMaxMs - cfg.announceMinMs));
    // rain that starts within moments of the gate is announced as soon as the scene is up
    if (announceAt < cfg.announceFloorMs) announceAt = Math.min(cfg.announceFloorMs, episode.start);
    out.push({ at: Math.round(announceAt), until: episode.start, kind: 'announce', episode: episode });
    var fadeMs = (pl.rain && pl.rain.cfg && pl.rain.cfg.RAIN_FADE_MS) || 0;
    var fadeAt = episode.end - fadeMs;
    var k = gapScale(fadeAt - episode.start, cfg);
    var t = episode.start;
    for (;;) {
      t += (cfg.minGapMs + rng() * (cfg.maxGapMs - cfg.minGapMs)) * k;
      if (t >= fadeAt) break;
      out.push({ at: Math.round(t), until: fadeAt, kind: 'rain', episode: episode });
    }
    pl.cache[key] = out;
    return out;
  }

  /**
   * The first strike due after `t` (ms on the rain clock), reaching into
   * the rain schedule for more episodes as needed (through CemRain.episodeAt,
   * which extends it). Null only if the rain schedule cannot be extended.
   */
  function nextStrike(pl, t) {
    var rain = pl.rain;
    for (var round = 0; round < 12; round++) {
      var eps = rain.episodes;
      for (var i = 0; i < eps.length; i++) {
        var strikes = strikesFor(pl, eps[i]);
        for (var s = 0; s < strikes.length; s++) if (strikes[s].at > t) return strikes[s];
      }
      var last = eps[eps.length - 1], had = eps.length;
      // CemRain.episodeAt draws more episodes from the rain's seed as far as it is asked
      if (typeof CemRain === 'undefined' || !CemRain.episodeAt) return null;
      CemRain.episodeAt(rain, last.end + 1);
      if (rain.episodes.length === had) return null;
    }
    return null;
  }

  /**
   * A strike was due at `next.at` but could not go (a card is up, input is
   * off): try it again in retryMs while its window is still open, or
   * drop it and take the next one. Returns the strike to wait for.
   */
  function afterBlocked(pl, next, t) {
    var again = t + pl.cfg.retryMs;
    if (again < next.until) return { at: again, until: next.until, kind: next.kind, episode: next.episode, retried: (next.retried || 0) + 1 };
    return nextStrike(pl, next.until);
  }

  /** The overlay's one-liner: what comes next and how many have struck */
  function describe(pl, next, t) {
    var sec = function(ms) { return Math.max(0, Math.round(ms / 1000)) + 's'; };
    if (!next) return 'no strike planned, ' + pl.fired + ' struck';
    var n = pl.rain && pl.rain.episodes ? pl.rain.episodes.indexOf(next.episode) + 1 : 0;
    return (next.kind === 'announce' ? 'announces ep ' + n : 'in ep ' + n) + ' in ' + sec(next.at - t) +
      (next.retried ? ' (retry ' + next.retried + ')' : '') + ', ' + pl.fired + ' struck';
  }

  // ---------------------------------------------------------------------------
  // Target
  // ---------------------------------------------------------------------------

  /**
   * A lit tile (vis === 2) between `minDist` and `maxDist` tiles from Mr Owl,
   * drawn at random from every such tile; null when nothing in sight
   * qualifies. Lantern light marks tiles lit all over the grounds, so the
   * range cap is what keeps the strike in view. `accept(gx, gy)`, when
   * given, can turn a tile down (the scene keeps the bolt clear of the top
   * of the view so it is never short).
   * @returns {{gx:number, gy:number, dist:number}|null}
   */
  function pickTarget(level, rng, cfg, accept) {
    cfg = cfg || DEFAULTS;
    var o = level.owl;
    var ox = typeof o.x === 'number' ? o.x : o.gx;
    var oy = typeof o.y === 'number' ? o.y : o.gy;
    var minD2 = cfg.minDist * cfg.minDist, maxD2 = cfg.maxDist * cfg.maxDist;
    var picks = [];
    for (var i = 0; i < level.vis.length; i++) {
      if (level.vis[i] !== 2) continue;
      var gx = i % level.W, gy = (i - gx) / level.W;
      var dx = gx - ox, dy = gy - oy;
      var d2 = dx * dx + dy * dy;
      if (d2 < minD2 || d2 > maxD2) continue;
      if (accept && !accept(gx, gy)) continue;
      picks.push(i);
    }
    if (!picks.length) return null;
    var idx = picks[Math.min(picks.length - 1, Math.floor(rng() * picks.length))];
    var tx = idx % level.W, ty = (idx - tx) / level.W;
    return { gx: tx, gy: ty, dist: Math.sqrt((tx - ox) * (tx - ox) + (ty - oy) * (ty - oy)) };
  }

  // ---------------------------------------------------------------------------
  // The bolt
  // ---------------------------------------------------------------------------

  /**
   * Where the bolt starts: above the top of the view, leaning a little to one
   * side so it does not fall straight down onto the tile.
   * @param {number} viewTop - world y of the top edge of the camera
   */
  function origin(rng, target, viewTop, margin) {
    var height = target.y - viewTop + (margin || 120);
    return { x: target.x + (rng() - 0.5) * 0.35 * height, y: target.y - height };
  }

  /** Midpoint displacement along a fixed normal: a jagged line from a to b */
  function jag(rng, a, b, sway, detail) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var pts = [{ x: a.x, y: a.y, o: 0 }, { x: b.x, y: b.y, o: 0 }];
    var amp = len * sway;
    for (var pass = 0; pass < detail; pass++) {
      var out = [pts[0]];
      for (var i = 1; i < pts.length; i++) {
        var p = pts[i - 1], q = pts[i];
        var off = (rng() * 2 - 1) * amp;
        out.push({ x: (p.x + q.x) / 2 + nx * off, y: (p.y + q.y) / 2 + ny * off, o: (p.o + q.o) / 2 + off });
        out.push(q);
      }
      pts = out;
      amp *= 0.5;
    }
    return pts;
  }

  /**
   * A lightning bolt from `from` to `to`: the main jagged polyline plus a
   * few shorter branches that fork off it part of the way down. Every point
   * is {x, y}. Deterministic for a given rng.
   */
  function bolt(rng, from, to, cfg) {
    cfg = cfg || DEFAULTS;
    var main = jag(rng, from, to, cfg.boltSway, cfg.boltDetail);
    var n = cfg.branches[0] + Math.floor(rng() * (cfg.branches[1] - cfg.branches[0] + 1));
    var dx = to.x - from.x, dy = to.y - from.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    var branches = [];
    for (var b = 0; b < n; b++) {
      // fork somewhere between a third and three quarters of the way down
      var at = Math.floor((0.3 + rng() * 0.45) * (main.length - 1));
      var start = main[at];
      var side = rng() < 0.5 ? -1 : 1;
      var ang = side * (0.35 + rng() * 0.45);     // 20-46 degrees off the main direction
      var c = Math.cos(ang), s = Math.sin(ang);
      var bl = len * (0.18 + rng() * 0.2) * (1 - at / main.length);
      var end = { x: start.x + (ux * c - uy * s) * bl, y: start.y + (ux * s + uy * c) * bl };
      branches.push(jag(rng, start, end, cfg.boltSway * 1.2, Math.max(2, cfg.boltDetail - 2)));
    }
    return { main: main, branches: branches };
  }

  // ---------------------------------------------------------------------------
  // Timing curves
  // ---------------------------------------------------------------------------

  /**
   * The strokes of one strike, in ms from its start: a dim leader flicker,
   * the main return stroke at full brightness, then two to four re-strikes
   * down the same channel, each weaker than the last, the whole thing lasting
   * `totalMs` in [totalMinMs, totalMaxMs] before the glow lingers out. The
   * seeded noise samples (`noise`, one per `noiseStepMs`) are what make the
   * brightness flutter, shared by the bolt and the view flash.
   * @returns {{ strokes: Array<{at:number, ms:number, peak:number, kind:string}>,
   *             leaderMs:number, mainAt:number, totalMs:number, endMs:number, noise:number[] }}
   */
  function sequence(rng, cfg) {
    cfg = cfg || DEFAULTS;
    var totalMs = Math.round(cfg.totalMinMs + rng() * (cfg.totalMaxMs - cfg.totalMinMs));
    var leaderMs = Math.round(cfg.leaderMs[0] + rng() * (cfg.leaderMs[1] - cfg.leaderMs[0]));
    var mainMs = Math.round(cfg.mainMs[0] + rng() * (cfg.mainMs[1] - cfg.mainMs[0]));
    var n = cfg.restrikes[0] + Math.floor(rng() * (cfg.restrikes[1] - cfg.restrikes[0] + 1));
    var strokes = [{ at: 0, ms: leaderMs, peak: cfg.leaderPeak, kind: 'leader' },
                   { at: leaderMs, ms: mainMs, peak: 1, kind: 'main' }];
    // the re-strikes share what is left of the time, each in its own slot
    // after a dark gap, so the total always lands in range
    var start = leaderMs + mainMs;
    var left = totalMs - start;
    for (var i = 0; i < n; i++) {
      var slotEnd = start + Math.round((i + 1) * left / n);     // the last slot ends exactly at totalMs
      var slotLen = slotEnd - (start + Math.round(i * left / n));
      var ms = Math.round(slotLen * (cfg.restrikeShare[0] + rng() * (cfg.restrikeShare[1] - cfg.restrikeShare[0])));
      var k = n === 1 ? 1 : i / (n - 1);
      var peak = cfg.restrikePeak[0] + (cfg.restrikePeak[1] - cfg.restrikePeak[0]) * k;
      strokes.push({ at: slotEnd - ms, ms: ms, peak: peak, kind: 'restrike' });
    }
    var noise = [];
    var samples = Math.ceil((totalMs + cfg.glowLingerMs) / cfg.noiseStepMs) + 2;
    for (var s = 0; s < samples; s++) noise.push(rng());
    // the return stroke opens at full: the flutter does not get to dim that instant
    var m = Math.floor(leaderMs / cfg.noiseStepMs);
    noise[m] = 1; noise[m + 1] = 1;
    return { strokes: strokes, leaderMs: leaderMs, mainAt: leaderMs, totalMs: totalMs, endMs: totalMs + cfg.glowLingerMs, noise: noise };
  }

  /**
   * The flutter at `t`: the seeded noise read between samples, so brightness
   * jitters every few frames and never fades smoothly. In [flutterFloor, 1].
   */
  function flutter(seq, t, cfg) {
    cfg = cfg || DEFAULTS;
    var u = t / cfg.noiseStepMs;
    var i = Math.floor(u);
    var n = seq.noise;
    if (i < 0) i = 0;
    if (i >= n.length - 1) i = n.length - 2;
    var f = u - i;
    var v = n[i] * (1 - f) + n[i + 1] * f;
    return cfg.flutterFloor + (1 - cfg.flutterFloor) * v;
  }

  /** One stroke's own shape: full for the first part, then falling away to a tail */
  function strokeShape(u) {
    if (u < 0 || u >= 1) return 0;
    if (u < 0.3) return 1;
    return 1 - 0.85 * (u - 0.3) / 0.7;
  }

  /** Brightness of the bolt's core `t` ms into the strike: the strokes, fluttering. 0..1 */
  function coreAlpha(seq, t, cfg) {
    cfg = cfg || DEFAULTS;
    if (t < 0 || t >= seq.totalMs) return 0;
    var best = 0;
    for (var i = 0; i < seq.strokes.length; i++) {
      var s = seq.strokes[i];
      var a = s.peak * strokeShape((t - s.at) / s.ms);
      if (a > best) best = a;
    }
    return best * flutter(seq, t, cfg);
  }

  /**
   * Brightness of the glow around the bolt: the core's, but each stroke's
   * light lingers `glowLingerMs` after the stroke, so the channel is still
   * faintly there when the core has gone. 0..1
   */
  function glowAlpha(seq, t, cfg) {
    cfg = cfg || DEFAULTS;
    if (t < 0 || t >= seq.endMs) return 0;
    var best = 0;
    for (var i = 0; i < seq.strokes.length; i++) {
      var s = seq.strokes[i];
      var u = (t - s.at) / s.ms;
      var a = s.peak * strokeShape(u);
      if (u >= 1) {
        var after = t - (s.at + s.ms);
        if (after < cfg.glowLingerMs) a = s.peak * 0.4 * (1 - after / cfg.glowLingerMs);
      }
      if (a > best) best = a;
    }
    return best * (0.7 + 0.3 * flutter(seq, t, cfg));
  }

  /** Alpha of the whole-view flash: the core's flutter scaled to `flashPeak` */
  function flashAlpha(seq, t, cfg) {
    cfg = cfg || DEFAULTS;
    return cfg.flashPeak * coreAlpha(seq, t, cfg);
  }

  /** The brightest moment of the strike, for a screenshot: { t, alpha } */
  function brightest(seq, cfg) {
    cfg = cfg || DEFAULTS;
    var best = { t: 0, alpha: 0 };
    for (var t = 0; t < seq.totalMs; t += 2) {
      var a = coreAlpha(seq, t, cfg);
      if (a > best.alpha) best = { t: t, alpha: a };
    }
    return best;
  }

  /** How far along the strike range a strike `dist` tiles away is, 0 (nearest) .. 1 (farthest) */
  function range(dist, cfg) {
    return clamp01((dist - cfg.minDist) / Math.max(1e-6, cfg.maxDist - cfg.minDist));
  }

  /** How long the thunder trails a strike `dist` tiles away, in ms */
  function thunderDelay(dist, cfg) {
    cfg = cfg || DEFAULTS;
    return Math.round(cfg.thunderMinMs + range(dist, cfg) * (cfg.thunderMaxMs - cfg.thunderMinMs));
  }

  /** Thunder is a little quieter the farther away it struck */
  function thunderVolume(dist, cfg) {
    cfg = cfg || DEFAULTS;
    return 1 - 0.35 * range(dist, cfg);
  }

  /** Tile indices within `radius` (Euclidean) of the strike, for the props that catch its light */
  function litTiles(level, target, radius) {
    var out = [];
    var r = Math.ceil(radius);
    for (var dy = -r; dy <= r; dy++) {
      for (var dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        var gx = target.gx + dx, gy = target.gy + dy;
        if (gx < 0 || gy < 0 || gx >= level.W || gy >= level.H) continue;
        out.push(gy * level.W + gx);
      }
    }
    return out;
  }

  return {
    DEFAULTS: DEFAULTS,
    config: config,
    plan: plan,
    gapScale: gapScale,
    strikesFor: strikesFor,
    nextStrike: nextStrike,
    afterBlocked: afterBlocked,
    describe: describe,
    pickTarget: pickTarget,
    origin: origin,
    bolt: bolt,
    sequence: sequence,
    flutter: flutter,
    coreAlpha: coreAlpha,
    glowAlpha: glowAlpha,
    flashAlpha: flashAlpha,
    brightest: brightest,
    thunderDelay: thunderDelay,
    thunderVolume: thunderVolume,
    litTiles: litTiles
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemStorm;
}
