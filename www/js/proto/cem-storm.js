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
    firstDelayMs: 15000,    // first strike after the scene is ready
    minGapMs: 25000,        // then one every 25-60 s
    maxGapMs: 60000,
    retryMs: 4000,          // a strike skipped (card up, input off) is tried again this soon
    minDist: 2,             // tiles between Mr Owl and the struck tile, at least
    maxDist: 8,             // and at most: his own sight plus a lantern's, so the strike is on screen; the thunder lags longest at this range
    boltMs: 150,            // how long the bolt shows
    flashMs: 350,           // how long the whole view stays lit
    flashPeak: 0.7,         // alpha of the flash overlay at the moment of the strike
    thunderMinMs: 300,      // thunder lag for a strike at minDist
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

  function fallbackRng() {
    return function() { return Math.random(); };
  }

  // ---------------------------------------------------------------------------
  // Scheduling
  // ---------------------------------------------------------------------------

  /**
   * A storm: `next()` says how long to wait before the coming strike (the
   * first one comes sooner), `retry()` how long to wait when a strike had to
   * be skipped. `count` is how many strikes have been scheduled.
   * @param {Object} [opts] - overrides of DEFAULTS, plus `rng` (a () => [0,1) function)
   */
  function create(opts) {
    opts = opts || {};
    var cfg = config(opts);
    var rng = typeof opts.rng === 'function' ? opts.rng : fallbackRng();
    var state = { cfg: cfg, rng: rng, count: 0 };
    state.next = function() {
      var ms = state.count === 0 ? cfg.firstDelayMs : gap(rng, cfg);
      state.count++;
      return ms;
    };
    state.retry = function() { return cfg.retryMs; };
    return state;
  }

  /** A random pause between strikes, in [minGapMs, maxGapMs] */
  function gap(rng, cfg) {
    cfg = cfg || DEFAULTS;
    return Math.round(cfg.minGapMs + rng() * (cfg.maxGapMs - cfg.minGapMs));
  }

  // ---------------------------------------------------------------------------
  // Target
  // ---------------------------------------------------------------------------

  /**
   * A lit tile (vis === 2) between `minDist` and `maxDist` tiles from Mr Owl,
   * drawn at random from every such tile; null when nothing in sight
   * qualifies. Lantern light marks tiles lit all over the grounds, so the
   * range cap is what keeps the strike in view.
   * @returns {{gx:number, gy:number, dist:number}|null}
   */
  function pickTarget(level, rng, cfg) {
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
   * Brightness of the bolt `t` ms into the strike: three pulses, then it is
   * gone. 0 before the strike and from `boltMs` on.
   */
  function boltAlpha(t, boltMs) {
    boltMs = boltMs || DEFAULTS.boltMs;
    if (t < 0 || t >= boltMs) return 0;
    var u = t / boltMs;
    if (u < 0.22) return 1;
    if (u < 0.34) return 0.3;
    if (u < 0.56) return 0.9;
    if (u < 0.68) return 0.35;
    return 0.75 * (1 - (u - 0.68) / 0.32);
  }

  /**
   * Alpha of the whole-view flash `t` ms into the strike: `peak` at once,
   * falling away over `flashMs` with a second, weaker pulse part way through.
   */
  function flashAlpha(t, flashMs, peak) {
    flashMs = flashMs || DEFAULTS.flashMs;
    peak = typeof peak === 'number' ? peak : DEFAULTS.flashPeak;
    if (t < 0 || t >= flashMs) return 0;
    var u = t / flashMs;
    var first = peak * Math.exp(-u * 7);
    var d = (u - 0.42) / 0.09;
    var second = 0.45 * peak * Math.exp(-d * d);
    var tail = 1 - u;                          // both pulses reach zero at flashMs
    return Math.min(peak, (first + second) * Math.min(1, tail * 4));
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
    create: create,
    gap: gap,
    pickTarget: pickTarget,
    origin: origin,
    bolt: bolt,
    boltAlpha: boltAlpha,
    flashAlpha: flashAlpha,
    thunderDelay: thunderDelay,
    thunderVolume: thunderVolume,
    litTiles: litTiles
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemStorm;
}
