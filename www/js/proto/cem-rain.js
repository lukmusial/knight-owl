/**
 * CemRain
 * The weather of the cemetery, without any rendering: when the rain starts
 * and how it ramps in, which path tiles collect a puddle and how fast each
 * one fills, how the streaks fall, and the chance of a droplet ring. The
 * scene (cem-scenes.js, `buildRain`/`updateRain`) draws what this decides.
 * Everything here is deterministic per tile so a level looks the same on
 * every visit, and pure so it runs under node.
 */

var CemRain = (function() {
  var CFG = {
    RAIN_DELAY_MS: 4000,        // the scene is ready for this long before the first drop
    RAIN_RAMP_MS: 7000,         // and the rain takes this long to reach full strength
    RAIN_SPEED: 820,            // px per second a streak falls
    RAIN_SLANT_DEG: 13,         // how far from vertical it leans (to the right)
    RAIN_ALIVE: 220,            // streaks on screen at full strength
    RAIN_LIFE_MS: 1500,         // how long a streak lives (it is spawned off the top)
    PUDDLE_CHANCE: 0.24,        // share of path tiles that collect a puddle
    MAX_PUDDLES: 80,            // and never more than this many at once
    PUDDLE_REACH: 6,            // puddles are laid this many tiles around Mr Owl as he walks
    RECYCLE_DIST: 14,           // once the cap is reached, a puddle at least this far away is moved
    PUDDLE_FILL_MS: 60000,      // a puddle takes about a minute to fill
    PUDDLE_STAGGER_MS: 50000,   // spread the starts so they do not all fill together
    RING_CAP: 20,               // droplet rings alive at once
    RING_RATE: 7,               // droplet rings a second, over all visible puddles
    RING_MS: 750,               // how long a droplet ring lasts
    SPLASH_MS: 360,             // no second splash sooner than this (about one step)
    REFLECTION_ALPHA: 0.3       // Mr Owl's mirror image in a full puddle
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
   * how big, mirrored or not, where in the tile, and when it starts to fill.
   */
  function puddleSpec(gx, gy, cfg) {
    cfg = cfg || CFG;
    return {
      gx: gx, gy: gy,
      variant: Math.floor(hash(gx, gy, 43) * 4) % 4,
      scale: 0.7 + hash(gx, gy, 47) * 0.4,
      flip: hash(gx, gy, 53) < 0.5,
      dx: (hash(gx, gy, 59) - 0.5) * 20,
      dy: (hash(gx, gy, 61) - 0.5) * 10,
      delayMs: hash(gx, gy, 67) * cfg.PUDDLE_STAGGER_MS
    };
  }

  /**
   * Puddles for tiles just revealed, up to the cap.
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
      var spec = puddleSpec(t.gx, t.gy, cfg);
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

  /** 0 before the rain starts, 1 once it has ramped in */
  function rainStrength(elapsedMs, cfg) {
    cfg = cfg || CFG;
    return smooth((elapsedMs - cfg.RAIN_DELAY_MS) / cfg.RAIN_RAMP_MS);
  }

  /** How full a puddle is (0..1) this long after the scene became ready */
  function puddleFill(spec, elapsedMs, cfg) {
    cfg = cfg || CFG;
    var start = cfg.RAIN_DELAY_MS + spec.delayMs;
    return smooth((elapsedMs - start) / cfg.PUDDLE_FILL_MS);
  }

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
   * Whether a droplet ring lands this frame: RING_RATE a second over all the
   * puddles in view, none when there are none.
   */
  function ringDue(rnd, dtMs, visiblePuddles, cfg) {
    cfg = cfg || CFG;
    if (!visiblePuddles) return false;
    return rnd < Math.min(1, cfg.RING_RATE * dtMs / 1000);
  }

  function splashDue(now, lastAt, cfg) {
    cfg = cfg || CFG;
    return now - (lastAt || -1e9) >= cfg.SPLASH_MS;
  }

  return {
    CFG: CFG,
    hash: hash,
    isPuddleTile: isPuddleTile,
    wantsPuddle: wantsPuddle,
    puddleSpec: puddleSpec,
    planPuddles: planPuddles,
    tilesAround: tilesAround,
    farthestPuddle: farthestPuddle,
    rainStrength: rainStrength,
    puddleFill: puddleFill,
    rainVelocity: rainVelocity,
    rainRate: rainRate,
    ringDue: ringDue,
    splashDue: splashDue
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemRain;
}
