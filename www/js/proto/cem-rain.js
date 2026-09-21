/**
 * CemRain
 * The weather of the cemetery, without any rendering: a seeded schedule of
 * rain episodes that come and go, how each ramps in and out, which lane
 * tiles collect a puddle and how wet each one is at any moment (filling
 * while it rains, drying slowly after), how the streaks fall, the chance of
 * a droplet ring, and the geometry of what a puddle reflects. The scene
 * (cem-scenes.js, `buildRain`/`updateRain`) draws what this decides.
 * Everything here is deterministic per seed and per tile, and pure so it
 * runs under node.
 */

var CemRain = (function() {
  var CFG = {
    // the schedule: a first shower soon after the gate, then episodes of
    // 30-60 s separated by gaps of at most two minutes
    FIRST_GAP_MIN_MS: 4000,
    FIRST_GAP_MAX_MS: 25000,
    GAP_MIN_MS: 20000,
    GAP_MAX_MS: 120000,
    EPISODE_MIN_MS: 30000,
    EPISODE_MAX_MS: 60000,
    RAIN_RAMP_MS: 7000,         // an episode takes this long to reach full strength
    RAIN_FADE_MS: 6000,         // and this long to die away at its end
    RAIN_SPEED: 820,            // px per second a streak falls
    RAIN_SLANT_DEG: 13,         // how far from vertical it leans (to the right)
    RAIN_ALIVE: 220,            // streaks on screen at full strength
    RAIN_LIFE_MS: 1500,         // how long a streak lives (it is spawned off the top)
    PUDDLE_CHANCE: 0.24,        // share of path tiles that collect a puddle
    MAX_PUDDLES: 80,            // and never more than this many at once
    PUDDLE_REACH: 6,            // puddles are laid this many tiles around Mr Owl as he walks
    RECYCLE_DIST: 14,           // once the cap is reached, a puddle at least this far away is moved
    PUDDLE_FILL_MS: 25000,      // a puddle fills in about this long of rain (each a little different)
    PUDDLE_STAGGER_MS: 12000,   // spread the starts so they do not all fill together
    PUDDLE_DRY_MS: 90000,       // and dries out over about this long once the rain has stopped
    RING_CAP: 48,               // droplet rings and plips alive at once
    RING_RATE: 3,               // drops hitting each puddle in view a second, at full rain
    RING_MS: 600,               // how long a droplet ring lasts
    PLIP_MS: 150,               // and the bright dot where the drop hit
    SPLASH_MS: 360,             // no second splash sooner than this (about one step)
    LIVE_MS: 80,                // how often a puddle near something moving redraws its reflection (12.5 Hz)
    BAKES_PER_TICK: 2,          // and how many puddles may redraw in one such tick (the rest wait for the next)
    REFLECTION_ALPHA: 0.88,     // how strongly the water mirrors what stands around it
    REFLECTION_TINT: 'rgba(14,22,60,0.48)',   // the mirror image is darkened and blued by this
    WOBBLE_PX: 1.4              // how far the reflection sways while a ring crosses it
  };

  /** Deterministic 0..1 for a tile (the same helper the scene uses) */
  function hash(a, b, c) {
    var h = (a * 73856093) ^ (b * 19349663) ^ ((c || 0) * 83492791);
    h = h >>> 0;
    return (h % 1000) / 1000;
  }

  function clamp01(v) {
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }

  function smooth(k) {
    k = clamp01(k);
    return k * k * (3 - 2 * k);
  }

  function merged(cfg) {
    if (!cfg) return CFG;
    var out = {};
    for (var k in CFG) if (CFG.hasOwnProperty(k)) out[k] = cfg.hasOwnProperty(k) ? cfg[k] : CFG[k];
    return out;
  }

  /** Park-Miller, the same generator the textures use */
  function lcg(seed) {
    var s = Math.floor(Math.abs(seed || 1)) % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // ---------------------------------------------------------------------------
  // The schedule
  // ---------------------------------------------------------------------------

  /**
   * A seeded schedule of rain episodes. Episodes are drawn from the seed in
   * order as time asks for them, so the same seed always rains at the same
   * moments however often it is queried. Times are ms since the scene was
   * ready.
   * @param {number} seed
   * @param {Object} [cfg] - overrides of CFG (the recorder winds the timings)
   */
  function schedule(seed, cfg) {
    var c = merged(cfg);
    var rnd = lcg(seed);
    var start = c.FIRST_GAP_MIN_MS + rnd() * (c.FIRST_GAP_MAX_MS - c.FIRST_GAP_MIN_MS);
    var len = c.EPISODE_MIN_MS + rnd() * (c.EPISODE_MAX_MS - c.EPISODE_MIN_MS);
    return { seed: seed, cfg: c, rnd: rnd, episodes: [{ start: start, end: start + len }] };
  }

  /** Make sure the episodes reach past `t` */
  function extend(sched, t) {
    var eps = sched.episodes, c = sched.cfg;
    while (eps[eps.length - 1].end <= t) {
      var last = eps[eps.length - 1];
      var start = last.end + c.GAP_MIN_MS + sched.rnd() * (c.GAP_MAX_MS - c.GAP_MIN_MS);
      var len = c.EPISODE_MIN_MS + sched.rnd() * (c.EPISODE_MAX_MS - c.EPISODE_MIN_MS);
      eps.push({ start: start, end: start + len });
    }
  }

  /**
   * Where `t` falls in the schedule: { raining, current, previous, next }.
   * `current` is the episode `t` is inside (or null), `previous` the last
   * one that has ended, `next` the first one still to come.
   */
  function episodeAt(sched, t) {
    extend(sched, t);
    var eps = sched.episodes;
    var out = { raining: false, current: null, previous: null, next: null };
    for (var i = 0; i < eps.length; i++) {
      var e = eps[i];
      if (t >= e.start && t < e.end) { out.raining = true; out.current = e; }
      else if (e.end <= t) out.previous = e;
      else if (e.start > t && !out.next) out.next = e;
    }
    return out;
  }

  /** How hard it rains at `t`: 0 in a gap, ramping up at the start of an episode and down at its end */
  function strengthAt(sched, t) {
    var at = episodeAt(sched, t);
    if (!at.current) return 0;
    var c = sched.cfg, e = at.current;
    var up = smooth((t - e.start) / c.RAIN_RAMP_MS);
    var down = 1 - smooth((t - (e.end - c.RAIN_FADE_MS)) / c.RAIN_FADE_MS);
    return Math.min(up, down);
  }

  /** The overlay's one-liner */
  function describe(sched, t) {
    var at = episodeAt(sched, t);
    var sec = function(ms) { return Math.max(0, Math.round(ms / 1000)) + 's'; };
    if (at.current) {
      var n = sched.episodes.indexOf(at.current) + 1;
      return 'ep ' + n + ' ' + strengthAt(sched, t).toFixed(2) + ', ' + sec(at.current.end - t) + ' left';
    }
    return 'dry, next in ' + (at.next ? sec(at.next.start - t) : '?');
  }

  // ---------------------------------------------------------------------------
  // Puddles
  // ---------------------------------------------------------------------------

  /** Water gathers on trodden ground: lanes and plazas, never grass or a doorway */
  function isPuddleTile(tile) {
    if (!tile) return false;
    return tile.kind === 'path' || !!tile.plaza;
  }

  /** Does this tile collect a puddle at all */
  function wantsPuddle(tile, cfg) {
    cfg = cfg || CFG;
    return isPuddleTile(tile) && hash(tile.gx, tile.gy, 41) < cfg.PUDDLE_CHANCE;
  }

  /**
   * Everything the scene needs to lay one puddle: which of the four shapes,
   * how big, mirrored or not, and where in the tile. How fast it fills and
   * dries comes from the same hashes (see wetnessAt).
   */
  function puddleSpec(gx, gy) {
    return {
      gx: gx, gy: gy,
      variant: Math.floor(hash(gx, gy, 43) * 4) % 4,
      scale: 0.7 + hash(gx, gy, 47) * 0.4,
      flip: hash(gx, gy, 53) < 0.5,
      dx: (hash(gx, gy, 59) - 0.5) * 20,
      dy: (hash(gx, gy, 61) - 0.5) * 10
    };
  }

  /**
   * Puddles for the tiles offered, up to the cap.
   * @param {Object} level - CemModel level
   * @param {number[]} indices - tile indices to consider
   * @param {number} taken - puddles already laid
   * @param {Object} [cfg]
   * @returns {Object[]} specs (with `index`) for the tiles that get one
   */
  function planPuddles(level, indices, taken, cfg) {
    cfg = cfg || CFG;
    var out = [];
    var room = cfg.MAX_PUDDLES - (taken || 0);
    for (var i = 0; i < indices.length && out.length < room; i++) {
      var t = level.tiles[indices[i]];
      if (!wantsPuddle(t, cfg)) continue;
      var spec = puddleSpec(t.gx, t.gy);
      spec.index = indices[i];
      out.push(spec);
    }
    return out;
  }

  /** Seen tiles within `reach` (Chebyshev) of a tile, inside the grid */
  function tilesAround(level, gx, gy, reach) {
    var out = [];
    for (var y = gy - reach; y <= gy + reach; y++) {
      if (y < 0 || y >= level.H) continue;
      for (var x = gx - reach; x <= gx + reach; x++) {
        if (x < 0 || x >= level.W) continue;
        var i = y * level.W + x;
        if (level.seen[i]) out.push(i);
      }
    }
    return out;
  }

  /**
   * The puddle farthest from a tile, as an index into `puddles` (each with a
   * `spec` {gx, gy}), if it is at least `minDist` tiles away; -1 otherwise.
   * That is the one to move when the cap is reached.
   */
  function farthestPuddle(puddles, gx, gy, minDist) {
    var best = -1, bestD = -1;
    for (var i = 0; i < puddles.length; i++) {
      var sp = puddles[i].spec;
      var d = Math.max(Math.abs(sp.gx - gx), Math.abs(sp.gy - gy));
      if (d > bestD) { bestD = d; best = i; }
    }
    return bestD >= minDist ? best : -1;
  }

  /**
   * How wet a puddle is at `t` (0 dry .. 1 full). It fills through the
   * latest episode that has begun, after its own stagger and at its own
   * pace, and dries at its own pace once that episode has ended. A puddle
   * laid mid-episode gets the same answer as one that was there all along.
   */
  function wetnessAt(sched, spec, t) {
    var at = episodeAt(sched, t);
    var e = at.current || at.previous;
    if (!e) return 0;
    var c = sched.cfg;
    var delay = hash(spec.gx, spec.gy, 67) * c.PUDDLE_STAGGER_MS;
    var fillMs = c.PUDDLE_FILL_MS * (0.8 + hash(spec.gx, spec.gy, 71) * 0.4);
    var dryMs = c.PUDDLE_DRY_MS * (0.7 + hash(spec.gx, spec.gy, 73) * 0.6);
    var filledUntil = Math.min(t, e.end);
    var full = smooth((filledUntil - e.start - delay) / fillMs);
    if (t < e.end) return full;
    return full * (1 - smooth((t - e.end) / dryMs));
  }

  // ---------------------------------------------------------------------------
  // Rain, rings, splashes
  // ---------------------------------------------------------------------------

  /** Velocity of a streak and the rotation that lines its picture up with it */
  function rainVelocity(cfg) {
    cfg = cfg || CFG;
    var a = cfg.RAIN_SLANT_DEG * Math.PI / 180;
    return { vx: Math.sin(a) * cfg.RAIN_SPEED, vy: Math.cos(a) * cfg.RAIN_SPEED, rotation: -a };
  }

  /** Streaks to spawn per second so RAIN_ALIVE are on screen at once */
  function rainRate(strength, cfg) {
    cfg = cfg || CFG;
    return strength * cfg.RAIN_ALIVE / (cfg.RAIN_LIFE_MS / 1000);
  }

  /**
   * How many drops hit one puddle this frame: RING_RATE a second at full
   * rain, in proportion to the strength, the fraction settled by the roll.
   */
  function impactsDue(rnd, dtMs, strength, cfg) {
    cfg = cfg || CFG;
    if (strength <= 0) return 0;
    var x = cfg.RING_RATE * strength * dtMs / 1000;
    var n = Math.floor(x);
    return n + (rnd < x - n ? 1 : 0);
  }

  function splashDue(now, lastAt, cfg) {
    cfg = cfg || CFG;
    return now - (lastAt || -1e9) >= cfg.SPLASH_MS;
  }

  // ---------------------------------------------------------------------------
  // Reflections
  // ---------------------------------------------------------------------------

  /**
   * Where the mirror image of a standing thing lies: its picture flipped
   * about its ground line and hung below it. `o` is anything with x, y,
   * displayWidth, displayHeight, originX, originY (a Phaser image);
   * `groundY` is the line it stands on (its y unless told otherwise).
   * @returns {Object} { left, top, w, h } in world px
   */
  function mirrorRect(o, groundY) {
    var g = (typeof groundY === 'number') ? groundY : o.y;
    var w = o.displayWidth, h = o.displayHeight;
    var left = o.x - w * o.originX;
    var top = o.y - h * o.originY;
    return { left: left, top: 2 * g - (top + h), w: w, h: h };
  }

  /** Does a mirror image reach a puddle of scale `s` centred on (px, py) with a w by h picture */
  function rectHitsPuddle(r, px, py, s, w, h) {
    var hw = w * 0.42 * s, hh = h * 0.4 * s;
    return r.left < px + hw && r.left + r.w > px - hw && r.top < py + hh && r.top + r.h > py - hh;
  }

  return {
    CFG: CFG,
    hash: hash,
    schedule: schedule,
    episodeAt: episodeAt,
    strengthAt: strengthAt,
    describe: describe,
    isPuddleTile: isPuddleTile,
    wantsPuddle: wantsPuddle,
    puddleSpec: puddleSpec,
    planPuddles: planPuddles,
    tilesAround: tilesAround,
    farthestPuddle: farthestPuddle,
    wetnessAt: wetnessAt,
    rainVelocity: rainVelocity,
    rainRate: rainRate,
    impactsDue: impactsDue,
    splashDue: splashDue,
    mirrorRect: mirrorRect,
    rectHitsPuddle: rectHitsPuddle
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemRain;
}
