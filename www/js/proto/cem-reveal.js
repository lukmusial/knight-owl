/**
 * CemReveal
 * How far out of the night each cemetery tile has come, tied to where Mr Owl
 * stands right now rather than to the tile he is on.
 *
 * Every tile within `OUTER` tiles of his float position has a reveal factor
 * f in [0, 1] (a smoothstep from 0 at OUTER to 1 at INNER), so walking toward
 * something brings it out of the dark a little more every frame, and nothing
 * is ever shown at the outer edge that was not shown a moment before. Two
 * things are read off f:
 *
 *  - the *live* factor, which drives what he can see now: the warmth of a
 *    prop's tint (remembered blue -> lantern light), how solid a monster is,
 *    the lights on a tile;
 *  - the *peak* factor a tile has ever reached, which is monotonic and drives
 *    what he remembers: a prop's alpha and the alpha its ground is drawn
 *    with. Ground he only half approached stays half remembered.
 *
 * Lantern-lit tiles (within VIS_LANTERN of a lamp post) are at 1 from the
 * start, as are tiles a save says he has seen. For things that move between
 * tiles (the monsters) `pointFactor` gives the same curve from a float
 * position, with the lantern light falling off continuously past its disc.
 *
 * `update` only looks at a (2 * half + 1)^2 window around him plus the tiles
 * that were lit last frame, never the whole grid. Pure: no Phaser, no DOM,
 * node-tested.
 */

var CemReveal = (function() {
  var CONFIG = {
    INNER: 3.5,          // tiles from Mr Owl within which a tile is fully revealed
    OUTER: 6.5,          // and beyond which it is still dark (VIS_OWL + SEEN_EXTRA of the model)
    ALPHA_FULL_AT: 0.6,  // the factor at which a prop is fully opaque; the tint keeps warming past it
    LIT_FROM: 0.25,      // the factor from which a prop's tint warms from the remembered blue to lantern light
    LAMP_FADE: 2,        // tiles past VIS_LANTERN over which a lantern's light fades for things that move through it
    EPS: 1 / 128         // a change of the live factor smaller than this is not applied to sprites
  };

  function clamp01(v) {
    return v <= 0 ? 0 : (v >= 1 ? 1 : v);
  }

  function smoothstep(t) {
    t = clamp01(t);
    return t * t * (3 - 2 * t);
  }

  /** Reveal factor of a tile `dist` tiles from Mr Owl: 1 inside INNER, 0 beyond OUTER */
  function factorAt(dist, cfg) {
    cfg = cfg || CONFIG;
    var span = cfg.OUTER - cfg.INNER;
    if (span <= 0) return dist <= cfg.OUTER ? 1 : 0;
    return smoothstep((cfg.OUTER - dist) / span);
  }

  /** A lantern's light `dist` tiles from the post: 1 inside its disc, fading to 0 over LAMP_FADE */
  function lampFactor(dist, lampRadius, cfg) {
    cfg = cfg || CONFIG;
    return smoothstep((lampRadius + cfg.LAMP_FADE - dist) / cfg.LAMP_FADE);
  }

  /** How solid a prop is at a (peak) factor: opaque from ALPHA_FULL_AT on, 0 in the dark */
  function alphaOf(f, cfg, instant) {
    cfg = cfg || CONFIG;
    if (instant) return f > 0 ? 1 : 0;
    return clamp01(f / cfg.ALPHA_FULL_AT);
  }

  /** How far a prop's tint has warmed from the remembered blue to lantern light at a (live) factor */
  function litOf(f, cfg, instant) {
    cfg = cfg || CONFIG;
    if (instant) return f >= 1 ? 1 : 0;
    return clamp01((f - cfg.LIT_FROM) / (1 - cfg.LIT_FROM));
  }

  /**
   * Per-level reveal state.
   * @param {Object} level - CemModel level (W, H, lights, seen, cfg.VIS_LANTERN)
   * @param {Object} opts - { instant: true to step instead of ramp (reduced motion), cfg }
   */
  function create(level, opts) {
    opts = opts || {};
    var cfg = opts.cfg || CONFIG;
    var W = level.W, H = level.H, n = W * H;
    var st = {
      W: W, H: H, n: n, cfg: cfg, instant: !!opts.instant,
      lampRadius: (level.cfg && level.cfg.VIS_LANTERN) || 0,
      half: Math.ceil(cfg.OUTER) + 1,         // window half-size: one tile past OUTER, so a tile reaches 0 before it leaves
      lamp: new Uint8Array(n),                // 1 where a lantern keeps the tile lit
      f: new Float32Array(n),                 // live factor from Mr Owl (0 outside the window)
      peak: new Float32Array(n),              // the highest factor a tile has reached (1 where lit or remembered from a save)
      stamp: new Int32Array(n),               // frame a tile was last inside the window
      active: [],                             // tiles with a live factor last frame
      frame: 0
    };
    var lr = st.lampRadius;
    var cr = Math.ceil(lr);
    var lights = level.lights || [];
    for (var li = 0; li < lights.length; li++) {
      var L = lights[li];
      for (var dy = -cr; dy <= cr; dy++) {
        for (var dx = -cr; dx <= cr; dx++) {
          if (dx * dx + dy * dy > lr * lr) continue;
          var gx = L.gx + dx, gy = L.gy + dy;
          if (gx < 0 || gy < 0 || gx >= W || gy >= H) continue;
          st.lamp[gy * W + gx] = 1;
        }
      }
    }
    var seen = level.seen || [];
    for (var i = 0; i < n; i++) {
      if (st.lamp[i] || seen[i]) st.peak[i] = 1;
    }
    return st;
  }

  /** Quantise a live factor in instant mode: dark, remembered, lit */
  function stepOf(f) {
    return f >= 1 ? 1 : (f > 0 ? 0.5 : 0);
  }

  /**
   * Recompute the window around Mr Owl's float position.
   * @param {Object} st - from create
   * @param {number} ox - Mr Owl, in tiles
   * @param {number} oy
   * @param {Object} out - { changed: [] } filled in place with the tiles whose
   *   live factor moved by at least EPS (or to 0 or 1); a tile whose peak
   *   rose is always among them
   * @returns {Object} out
   */
  function update(st, ox, oy, out) {
    var changed = out.changed;
    changed.length = 0;
    var cfg = st.cfg, W = st.W, H = st.H;
    var frame = ++st.frame;
    var cx = Math.round(ox), cy = Math.round(oy);
    var half = st.half;
    var next = [];
    var x0 = Math.max(0, cx - half), x1 = Math.min(W - 1, cx + half);
    var y0 = Math.max(0, cy - half), y1 = Math.min(H - 1, cy + half);
    for (var gy = y0; gy <= y1; gy++) {
      var dy = gy - oy;
      for (var gx = x0; gx <= x1; gx++) {
        var dx = gx - ox;
        var idx = gy * W + gx;
        st.stamp[idx] = frame;
        var f = factorAt(Math.sqrt(dx * dx + dy * dy), cfg);
        if (st.instant) f = stepOf(f);
        if (f > 0) next.push(idx);
        var old = st.f[idx];
        if (f === old) continue;
        if (f !== 0 && f !== 1 && Math.abs(f - old) < cfg.EPS) continue;
        st.f[idx] = f;
        changed.push(idx);
        if (f > st.peak[idx]) st.peak[idx] = f;
      }
    }
    // tiles that were lit last frame and are outside the window now (a teleport): dark again
    var prev = st.active;
    for (var i = 0; i < prev.length; i++) {
      var p = prev[i];
      if (st.stamp[p] === frame || st.f[p] === 0) continue;
      st.f[p] = 0;
      changed.push(p);
    }
    st.active = next;
    return out;
  }

  /** Live factor of a tile: 1 under a lantern, else Mr Owl's */
  function factor(st, idx) {
    return st.lamp[idx] ? 1 : st.f[idx];
  }

  /** How solid a tile's props are (from the peak) */
  function alphaAt(st, idx) {
    return alphaOf(st.peak[idx], st.cfg, st.instant);
  }

  /** How warm a tile's props are (from the live factor) */
  function litAt(st, idx) {
    return litOf(factor(st, idx), st.cfg, st.instant);
  }

  /**
   * The live factor at a float position (a monster's feet): Mr Owl's curve
   * from his float position, or the nearest lantern's light, whichever is
   * more. Continuous in both positions, so a monster walking through the
   * edge of a lantern's light, or toward Mr Owl, never jumps.
   * @param {Array} lights - lanterns to consider ({gx, gy}), the near ones
   */
  function pointFactor(st, ox, oy, x, y, lights) {
    var dx = x - ox, dy = y - oy;
    var f = factorAt(Math.sqrt(dx * dx + dy * dy), st.cfg);
    if (st.instant) f = f >= 1 ? 1 : 0;
    if (lights) {
      for (var i = 0; i < lights.length; i++) {
        var lx = x - lights[i].gx, ly = y - lights[i].gy;
        var lf = lampFactor(Math.sqrt(lx * lx + ly * ly), st.lampRadius, st.cfg);
        if (st.instant) lf = lf >= 1 ? 1 : 0;
        if (lf > f) f = lf;
      }
    }
    return f;
  }

  /**
   * Move a shown value toward its target by at most `rate` per second, so a
   * thing that changes tile (or is first placed) still fades rather than
   * jumps. Instant mode snaps.
   */
  function approach(current, target, rate, dtMs, instant) {
    if (instant) return target;
    var step = rate * (dtMs / 1000);
    if (target > current) return Math.min(target, current + step);
    return Math.max(target, current - step);
  }

  return {
    CONFIG: CONFIG,
    factorAt: factorAt,
    lampFactor: lampFactor,
    alphaOf: alphaOf,
    litOf: litOf,
    create: create,
    update: update,
    factor: factor,
    alphaAt: alphaAt,
    litAt: litAt,
    pointFactor: pointFactor,
    approach: approach
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemReveal;
}
