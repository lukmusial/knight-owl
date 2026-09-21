/**
 * CemReveal
 * How far out of the night each cemetery tile has come, tied to where Mr Owl
 * stands right now rather than to the tile he is on.
 *
 * Every tile within `OUTER` tiles of his float position has a reveal factor
 * f in [0, 1] (a smoothstep that reaches 1 at `INNER`), so walking toward
 * something brings it out of the dark a little more every frame. Two things
 * are read off f:
 *
 *  - the *live* factor, which drives what he can see now: the warmth of a
 *    prop's tint (remembered blue -> lantern light), whether a monster
 *    shows and how solid it is, the lights on a tile;
 *  - the *peak* factor a tile has ever reached, which is monotonic and drives
 *    what he remembers: a prop's alpha and the alpha the ground is baked
 *    with (quantised to `LEVELS` steps so the bake only reruns when a step
 *    is crossed). Ground he only half approached stays half remembered.
 *
 * Lantern-lit tiles (within VIS_LANTERN of a lamp post) are at 1 from the
 * start, as are tiles a save says he has seen.
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
    LEVELS: 8,           // alpha steps the ground is baked in
    EPS: 1 / 64          // a change of the live factor smaller than this is not applied to sprites
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

  /** How solid a prop is at a (peak) factor: opaque from ALPHA_FULL_AT on */
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

  /** The ground alpha step (0..LEVELS) a peak factor bakes at */
  function levelOf(f, cfg, instant) {
    cfg = cfg || CONFIG;
    return Math.round(alphaOf(f, cfg, instant) * cfg.LEVELS);
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
      half: Math.ceil(cfg.OUTER) + 1,         // window half-size: one tile past OUTER, so a tile reaches 0 before it leaves
      lamp: new Uint8Array(n),                // 1 where a lantern keeps the tile lit
      f: new Float32Array(n),                 // live factor from Mr Owl (0 outside the window)
      peak: new Float32Array(n),              // the highest factor a tile has reached (1 where lit or remembered from a save)
      level: new Uint8Array(n),               // the ground alpha step baked, from peak
      stamp: new Int32Array(n),               // frame a tile was last inside the window
      active: [],                             // tiles with a live factor last frame
      frame: 0
    };
    var lr = (level.cfg && level.cfg.VIS_LANTERN) || 0;
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
      if (st.lamp[i] || seen[i]) { st.peak[i] = 1; st.level[i] = cfg.LEVELS; }
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
   * @param {Object} out - { changed: [], risen: [] } filled in place:
   *   `changed` tiles whose live factor moved by at least EPS (or to 0 or 1),
   *   `risen` tiles whose baked ground level went up (the chunk needs repainting)
   * @returns {Object} out
   */
  function update(st, ox, oy, out) {
    var changed = out.changed, risen = out.risen;
    changed.length = 0; risen.length = 0;
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
        if (f > st.peak[idx]) {
          st.peak[idx] = f;
          var lv = levelOf(f, cfg, st.instant);
          if (lv > st.level[idx]) { st.level[idx] = lv; risen.push(idx); }
        }
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
  function factorAt_(st, idx) {
    return st.lamp[idx] ? 1 : st.f[idx];
  }

  /** How solid a tile's props are (from the peak) */
  function alphaAt(st, idx) {
    return alphaOf(st.peak[idx], st.cfg, st.instant);
  }

  /** How warm a tile's props are (from the live factor) */
  function litAt(st, idx) {
    return litOf(factorAt_(st, idx), st.cfg, st.instant);
  }

  /** The alpha the ground of a tile is baked with */
  function groundAlpha(st, idx) {
    return st.level[idx] / st.cfg.LEVELS;
  }

  return {
    CONFIG: CONFIG,
    factorAt: factorAt,
    alphaOf: alphaOf,
    litOf: litOf,
    levelOf: levelOf,
    create: create,
    update: update,
    factor: factorAt_,
    alphaAt: alphaAt,
    litAt: litAt,
    groundAlpha: groundAlpha
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemReveal;
}
