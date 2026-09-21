/**
 * CemModel
 * Pure model of the Halloween cemetery level for the isometric prototype
 * (no Phaser, no DOM). Generates a fenced cemetery on a tile grid from a seed:
 * organic paths between graves, four small tombs with key-part guardians, a
 * large tomb with the Grim Reaper, trees, lanterns, benches, statues,
 * pumpkins and spider webs. Also owns the tile-by-tile movement of Mr Owl,
 * the wandering monsters, proximity encounters, the skeleton-key gating,
 * night visibility and the save state.
 *
 * Reuses IsoModel for the isometric maths (gridToIso, depthKey, castShadow,
 * lightLevel, positionHash) and MONSTERS for the roster.
 */

var CemModel = (function() {
  var CONFIG = {
    W: 60,
    H: 52,
    MARGIN: 4,
    WAYPOINT_MIN_DIST: 7,
    MAX_WAYPOINTS: 40,
    EXTRA_LOOPS: 8,
    LOOP_MAX_DIST: 14,
    LANE_WIDE_SHARE: 0.25,      // share of lanes carved three tiles wide
    SMALL_TOMBS: 4,
    WANDERERS: 16,
    LEASH: 9,
    HOME_SPACING: 5,
    STEP_MS: 900,
    GATE_SAFE_RADIUS: 3,
    GRACE_MS: 1500,
    VIS_OWL: 4,                 // Euclidean tile radius revealed around Mr Owl
    SEEN_EXTRA: 2.5,            // tiles beyond VIS_OWL that become remembered (dim) before they are lit
    VIS_LANTERN: 3,
    OWL_SPEED: 3.2,             // tiles per second
    OWL_RADIUS: 0.3,            // collision circle in tiles
    PROX_R: 1.2,                // a monster this close starts an encounter
    ARRIVE_EPS: 0.08,
    REVEAL_RADIUS: 4,          // tiles from the great tomb's door at which the Reaper rises
    LOCKED_TOAST_MS: 1500,
    MATCHING_SHARE: 0.3,
    // share of middle- and far-ring wanderers that are strays from a nearer ring
    STRAY_SHARE: 0.2,
    MAX_ATTEMPTS: 20,
    MAX_GRAVES: 220,
    TREES: 90,
    ROCKS: 16,
    MAX_LANTERNS: 56,
    LANTERN_EVERY: 8,
    LANTERN_HEIGHT: 1.1
  };

  var KIND = {
    grass: 'grass', path: 'path', fence: 'fence', gate: 'gate', grave: 'grave',
    tomb_small: 'tomb_small', tomb_large: 'tomb_large', tomb_door: 'tomb_door',
    tree: 'tree', statue: 'statue', bench: 'bench', pumpkin: 'pumpkin',
    lantern: 'lantern', web: 'web', rock: 'rock'
  };
  var WALKABLE = { path: 1, gate: 1, tomb_door: 1 };

  // Grid directions: north is gy-1 (up-right on screen), east is gx+1 (down-right)
  var DIRS = [
    { id: 'n', dx: 0, dy: -1 },
    { id: 'e', dx: 1, dy: 0 },
    { id: 's', dx: 0, dy: 1 },
    { id: 'w', dx: -1, dy: 0 }
  ];

  /**
   * The eight a roaming monster may take. The first four are DIRS, so a
   * saved direction index from the four-way days still means the same
   * thing; the diagonals follow, and each needs both of its neighbouring
   * straight steps to be clear so nothing cuts a corner through a grave.
   */
  var DIRS8 = DIRS.concat([
    { id: 'ne', dx: 1, dy: -1 },
    { id: 'se', dx: 1, dy: 1 },
    { id: 'sw', dx: -1, dy: 1 },
    { id: 'nw', dx: -1, dy: -1 }
  ]);
  // opposite index, for the "do not turn straight back" weighting
  var OPPOSITE8 = [2, 3, 0, 1, 6, 7, 4, 5];

  // Who roams which ring of the cemetery. Every band needs several kinds, or
  // the ring fills with one monster: band 3 was the banshee alone, so every
  // far corner held a banshee, and the six of band 2 were more than the few
  // monsters that ring holds, so the will-o'-the-wisp never came out at all.
  var WANDERER_BANDS = {
    1: ['giant_rat', 'bat_swarm', 'spider', 'zombie'],
    2: ['skeleton', 'pumpkin_man', 'ghost', 'will_o_wisp'],
    3: ['banshee', 'lost_soul', 'will_o_wisp', 'ghost']
  };
  // One guardian per small tomb, in tomb order (always asked hard questions)
  var GUARDIANS = ['banshee', 'pumpkin_man', 'clown', 'ghost'];
  var BOSS_ID = 'grim_reaper';
  var KEY_PART_ITEM = { id: 'skeleton_key_part', name: 'Skeleton Key Part', namePL: 'Część Szkieletowego Klucza', value: 25 };

  // Tiny stand-in roster so the module works without monsters.js (tests, tools)
  var STUB_MONSTERS = [
    { id: 'zombie', name: 'Zombie', namePL: 'Zombie', difficulty: 1, loot: [] },
    { id: 'ghost', name: 'Ghost', namePL: 'Duch', difficulty: 2, loot: [] },
    { id: 'witch', name: 'Witch', namePL: 'Wiedźma', difficulty: 3, loot: [] },
    { id: BOSS_ID, name: 'Grim Reaper', namePL: 'Ponury Żniwiarz', difficulty: 4, boss: true, loot: [] }
  ];

  // ---------------------------------------------------------------------------
  // Seeded random numbers (mulberry32)
  // ---------------------------------------------------------------------------

  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    function next() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    next.getState = function() { return a; };
    next.setState = function(s) { a = s >>> 0; };
    next.int = function(n) { return Math.floor(next() * n); };
    next.pick = function(arr) { return arr[Math.floor(next() * arr.length)]; };
    return next;
  }

  /** FNV-1a hash of a string to a uint32 seed */
  function seedFromString(str) {
    var h = 0x811c9dc5;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function mixSeed(seed, attempt) {
    var h = (seed ^ Math.imul(attempt + 1, 0x9E3779B9)) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85EBCA6B) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  // ---------------------------------------------------------------------------
  // Grid helpers
  // ---------------------------------------------------------------------------

  function index(level, gx, gy) {
    return gy * level.W + gx;
  }

  function inside(level, gx, gy) {
    return gx >= 0 && gy >= 0 && gx < level.W && gy < level.H;
  }

  function tileAt(level, gx, gy) {
    if (!inside(level, gx, gy)) return null;
    return level.tiles[gy * level.W + gx];
  }

  function isWalkable(level, gx, gy) {
    var t = tileAt(level, gx, gy);
    return !!(t && t.walk);
  }

  function manhattan(a, b) {
    return Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy);
  }

  function chebyshev(a, b) {
    return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy));
  }

  function euclid(a, b) {
    var dx = a.gx - b.gx, dy = a.gy - b.gy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function samePos(a, b) {
    return a.gx === b.gx && a.gy === b.gy;
  }

  function isBorder(level, gx, gy) {
    return gx === 0 || gy === 0 || gx === level.W - 1 || gy === level.H - 1;
  }

  function positionNoise(gx, gy, salt) {
    if (typeof IsoModel !== 'undefined' && IsoModel.positionHash) {
      return IsoModel.positionHash(gx + salt, gy + (salt >> 3));
    }
    var h = ((gx + salt) * 374761393 + (gy + (salt >> 3)) * 668265263) >>> 0;
    h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) % 10000 / 10000;
  }

  /**
   * Smooth value noise on a lattice of `cell` tiles: low frequency, so a path
   * following cheap ground curves in long arcs instead of zig-zagging.
   */
  function valueNoise(gx, gy, cell, salt) {
    var fx = gx / cell, fy = gy / cell;
    var ix = Math.floor(fx), iy = Math.floor(fy);
    var tx = fx - ix, ty = fy - iy;
    tx = tx * tx * (3 - 2 * tx);
    ty = ty * ty * (3 - 2 * ty);
    var a = positionNoise(ix, iy, salt), b = positionNoise(ix + 1, iy, salt);
    var c = positionNoise(ix, iy + 1, salt), d = positionNoise(ix + 1, iy + 1, salt);
    return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  }

  // ---------------------------------------------------------------------------
  // Binary heap for the path searches
  // ---------------------------------------------------------------------------

  function Heap() {
    this.items = [];
  }
  Heap.prototype.push = function(item) {
    var a = this.items;
    a.push(item);
    var i = a.length - 1;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      var tmp = a[p]; a[p] = a[i]; a[i] = tmp;
      i = p;
    }
  };
  Heap.prototype.pop = function() {
    var a = this.items;
    var top = a[0];
    var last = a.pop();
    if (a.length) {
      a[0] = last;
      var i = 0;
      for (;;) {
        var l = 2 * i + 1, r = l + 1, m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        var tmp = a[m]; a[m] = a[i]; a[i] = tmp;
        i = m;
      }
    }
    return top;
  };
  Heap.prototype.size = function() { return this.items.length; };

  /**
   * Weighted shortest path over 4-neighbours. costFn(tile, level, gx, gy)
   * returns the cost of stepping onto a tile (Infinity = impassable). Returns
   * the tile list from `from` to `to` inclusive, or [] when unreachable.
   */
  /**
   * @param {Object} level
   * @param {Object} from - {gx, gy}
   * @param {Object} to - {gx, gy}
   * @param {Function} costFn - (tile, level, gx, gy), Infinity to block
   * @param {boolean} [diag] - allow diagonal steps (walking, not carving)
   */
  function astar(level, from, to, costFn, diag) {
    if (!inside(level, from.gx, from.gy) || !inside(level, to.gx, to.gy)) return [];
    var n = level.W * level.H;
    // one scratch buffer per level: a generation runs A* dozens of times
    var sc = level._scratch;
    if (!sc || sc.dist.length !== n) {
      sc = level._scratch = { dist: new Float64Array(n), prev: new Int32Array(n), closed: new Uint8Array(n) };
    }
    var dist = sc.dist, prev = sc.prev, closed = sc.closed;
    dist.fill(Infinity); prev.fill(-1); closed.fill(0);
    var start = index(level, from.gx, from.gy), goal = index(level, to.gx, to.gy);
    dist[start] = 0;
    var heap = new Heap();
    heap.push({ f: 0, i: start });
    // Costs can be below 1 (existing lanes), so scale the heuristic to the
    // cheapest possible step to keep it admissible
    var hScale = 0.25;
    while (heap.size()) {
      var cur = heap.pop();
      var ci = cur.i;
      if (closed[ci]) continue;
      closed[ci] = 1;
      if (ci === goal) break;
      var cx = ci % level.W, cy = (ci - cx) / level.W;
      var dirs = diag ? DIRS8 : DIRS;
      for (var d = 0; d < dirs.length; d++) {
        var nx = cx + dirs[d].dx, ny = cy + dirs[d].dy;
        if (!inside(level, nx, ny)) continue;
        var ni = ny * level.W + nx;
        if (closed[ni]) continue;
        var tile = level.tiles[ni];
        var c = costFn(tile, level, nx, ny);
        if (!(c < Infinity)) continue;
        if (dirs[d].dx && dirs[d].dy) {
          // no squeezing diagonally past the corner of a grave
          if (!(costFn(level.tiles[cy * level.W + nx], level, nx, cy) < Infinity)) continue;
          if (!(costFn(level.tiles[ny * level.W + cx], level, cx, ny) < Infinity)) continue;
          c *= 1.4142;
        }
        var nd = dist[ci] + c;
        if (nd < dist[ni]) {
          dist[ni] = nd;
          prev[ni] = ci;
          var h = (Math.abs(nx - to.gx) + Math.abs(ny - to.gy)) * hScale;
          heap.push({ f: nd + h, i: ni });
        }
      }
    }
    if (dist[goal] === Infinity) return [];
    var out = [];
    for (var k = goal; k !== -1; k = prev[k]) {
      var kx = k % level.W;
      out.push({ gx: kx, gy: (k - kx) / level.W });
    }
    out.reverse();
    return out;
  }

  /** BFS distances over walkable tiles from a start tile; blocked = map of indices */
  function bfsDistances(level, from, blocked) {
    var n = level.W * level.H;
    var dist = new Array(n);
    for (var i = 0; i < n; i++) dist[i] = -1;
    var s = index(level, from.gx, from.gy);
    dist[s] = 0;
    var queue = [s], head = 0;
    while (head < queue.length) {
      var ci = queue[head++];
      var cx = ci % level.W, cy = (ci - cx) / level.W;
      for (var d = 0; d < 4; d++) {
        var nx = cx + DIRS[d].dx, ny = cy + DIRS[d].dy;
        if (!inside(level, nx, ny)) continue;
        var ni = ny * level.W + nx;
        if (dist[ni] !== -1) continue;
        if (!level.tiles[ni].walk) continue;
        if (blocked && blocked[ni]) continue;
        dist[ni] = dist[ci] + 1;
        queue.push(ni);
      }
    }
    return dist;
  }

  /** Chebyshev distance of every tile to the nearest path tile (8-neighbour BFS) */
  function distanceToPaths(level) {
    var n = level.W * level.H;
    var dist = new Array(n);
    var queue = [], head = 0;
    for (var i = 0; i < n; i++) {
      if (level.tiles[i].kind === KIND.path) { dist[i] = 0; queue.push(i); } else dist[i] = -1;
    }
    while (head < queue.length) {
      var ci = queue[head++];
      var cx = ci % level.W, cy = (ci - cx) / level.W;
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          var nx = cx + dx, ny = cy + dy;
          if (!inside(level, nx, ny)) continue;
          var ni = ny * level.W + nx;
          if (dist[ni] !== -1) continue;
          dist[ni] = dist[ci] + 1;
          queue.push(ni);
        }
      }
    }
    return dist;
  }

  // ---------------------------------------------------------------------------
  // Generation
  // ---------------------------------------------------------------------------

  function makeLevel(cfg, seed, attempt) {
    var level = {
      seed: seed >>> 0,
      attempt: attempt,
      W: cfg.W,
      H: cfg.H,
      cfg: cfg,
      tiles: [],
      gate: null,
      start: null,
      waypoints: [],
      edges: [],
      routes: [],
      tombs: [],
      lights: [],
      monsters: [],
      monstersByUid: {},
      owl: null,
      keyParts: [false, false, false, false],
      defeated: {},
      seen: [],
      vis: [],
      seenVersion: 0,
      newlySeen: [],
      visChanged: [],             // tiles whose visibility value changed in the last update (drained by the renderer)
      clockMs: 0,
      lockedToastAt: 0,
      lightMap: null,
      nearLights: null,
      paused: false,
      encounterUid: null,
      graceMs: 0,
      completed: false,
      degraded: false,
      maxDist: 0,
      bands: { t1: 0, t2: 0 },
      aiRng: makeRng((seed ^ 0x9E3779B9) >>> 0),
      bounds: null
    };
    for (var gy = 0; gy < cfg.H; gy++) {
      for (var gx = 0; gx < cfg.W; gx++) {
        level.tiles.push({ gx: gx, gy: gy, kind: KIND.grass, variant: 0, walk: false, tombId: null, dist: -1, plaza: false });
        level.seen.push(0);
        level.vis.push(0);
      }
    }
    return level;
  }

  function rosterOf(opts) {
    if (opts && opts.monsters) return opts.monsters;
    if (typeof MONSTERS !== 'undefined' && MONSTERS && MONSTERS.length) return MONSTERS;
    return STUB_MONSTERS;
  }

  function findInRoster(roster, id) {
    for (var i = 0; i < roster.length; i++) if (roster[i].id === id) return roster[i];
    return null;
  }

  /**
   * Themed monster ids of a difficulty that exist in the roster; falls back to
   * any roster monster of that difficulty, then to anything non-boss.
   */
  function poolFor(roster, difficulty) {
    var ids = WANDERER_BANDS[difficulty] || [];
    var out = [];
    for (var i = 0; i < ids.length; i++) if (findInRoster(roster, ids[i])) out.push(ids[i]);
    if (!out.length) {
      for (var j = 0; j < roster.length; j++) if (roster[j].difficulty === difficulty) out.push(roster[j].id);
    }
    if (!out.length) {
      for (var k = 0; k < roster.length; k++) if (!roster[k].boss && roster[k].difficulty !== 4) out.push(roster[k].id);
    }
    return out;
  }

  /** Cycling picker: no repeats until the pool is exhausted */
  function makeCycler(rng, pool) {
    var used = {};
    var usedCount = 0;
    return function() {
      if (!pool.length) return null;
      if (usedCount >= pool.length) { used = {}; usedCount = 0; }
      var free = [];
      for (var i = 0; i < pool.length; i++) if (!used[pool[i]]) free.push(pool[i]);
      var id = rng.pick(free);
      used[id] = true;
      usedCount++;
      return id;
    };
  }

  function tryGenerate(seed, attempt, opts) {
    var cfg = {};
    for (var k in CONFIG) if (CONFIG.hasOwnProperty(k)) cfg[k] = CONFIG[k];
    if (opts) for (var o in opts) if (opts.hasOwnProperty(o) && CONFIG.hasOwnProperty(o)) cfg[o] = opts[o];
    var rng = makeRng(mixSeed(seed, attempt));
    var level = makeLevel(cfg, seed, attempt);
    var W = level.W, H = level.H;
    var n = W * H;
    var noiseSalt = rng.int(100000);

    // scratch flags
    var reserved = new Array(n), reservedDoor = new Array(n), reservedPorch = new Array(n);
    for (var i = 0; i < n; i++) { reserved[i] = false; reservedDoor[i] = false; reservedPorch[i] = false; }

    // 1. fence ring and gate
    for (var gy = 0; gy < H; gy++) {
      for (var gx = 0; gx < W; gx++) {
        if (isBorder(level, gx, gy)) {
          var t = level.tiles[index(level, gx, gy)];
          t.kind = KIND.fence;
          t.variant = ((gx === 0 || gx === W - 1) && (gy === 0 || gy === H - 1)) ? 1 : 0;
        }
      }
    }
    var gateX = Math.floor(W / 2) + rng.int(9) - 4;
    level.gate = { gx: gateX, gy: H - 1 };
    level.start = { gx: gateX, gy: H - 2 };
    var gateTile = tileAt(level, gateX, H - 1);
    gateTile.kind = KIND.gate;
    gateTile.variant = 0;

    function reserveRect(x0, y0, w, h, tombId) {
      for (var yy = y0; yy < y0 + h; yy++) {
        for (var xx = x0; xx < x0 + w; xx++) {
          var idx = index(level, xx, yy);
          reserved[idx] = true;
          level.tiles[idx].tombId = tombId;
        }
      }
    }
    function nearReserved(gx, gy, radius) {
      for (var yy = gy - radius; yy <= gy + radius; yy++) {
        for (var xx = gx - radius; xx <= gx + radius; xx++) {
          if (!inside(level, xx, yy)) return true;
          var idx = index(level, xx, yy);
          if (reserved[idx] || reservedDoor[idx] || reservedPorch[idx]) return true;
          if (isBorder(level, xx, yy)) return true;
        }
      }
      return false;
    }
    function inGateZone(gx, gy) {
      return gy >= H - 8 && Math.abs(gx - gateX) <= 7;
    }

    // 2. tombs: the large one far from the gate, four small ones per quadrant
    var lx0 = Math.floor(W / 2) - 10 + rng.int(20);
    var ly0 = cfg.MARGIN + rng.int(4);
    var large = { id: 'large', size: 'large', x0: lx0, y0: ly0, w: 3, h: 3, side: 's',
      door: { gx: lx0 + 1, gy: ly0 + 3 }, porch: { gx: lx0 + 1, gy: ly0 + 4 }, guardianUid: 'boss', keyPart: null };
    reserveRect(lx0, ly0, 3, 3, 'large');
    reservedDoor[index(level, large.door.gx, large.door.gy)] = true;
    reservedPorch[index(level, large.porch.gx, large.porch.gy)] = true;
    level.tombs.push(large);

    var midX = Math.floor(W / 2), midY = Math.floor(H / 2);
    var quads = [
      { x0: cfg.MARGIN, x1: midX - 3, y0: cfg.MARGIN, y1: midY - 3 },
      { x0: midX + 1, x1: W - 1 - cfg.MARGIN - 1, y0: cfg.MARGIN, y1: midY - 3 },
      { x0: cfg.MARGIN, x1: midX - 3, y0: midY, y1: H - 10 },
      { x0: midX + 1, x1: W - 1 - cfg.MARGIN - 1, y0: midY, y1: H - 10 }
    ];
    for (var q = 0; q < cfg.SMALL_TOMBS; q++) {
      var quad = quads[q % quads.length];
      var placed = null;
      for (var tries = 0; tries < 40 && !placed; tries++) {
        var tx = quad.x0 + rng.int(Math.max(1, quad.x1 - quad.x0));
        var ty = quad.y0 + rng.int(Math.max(1, quad.y1 - quad.y0));
        if (inGateZone(tx, ty + 3)) continue;
        var ok = true;
        for (var yy = ty - 2; yy <= ty + 4 && ok; yy++) {
          for (var xx = tx - 2; xx <= tx + 3 && ok; xx++) {
            if (!inside(level, xx, yy) || isBorder(level, xx, yy)) { ok = false; break; }
            var ri = index(level, xx, yy);
            if (reserved[ri] || reservedDoor[ri] || reservedPorch[ri]) ok = false;
          }
        }
        if (!ok) continue;
        placed = { id: 't' + (q + 1), size: 'small', x0: tx, y0: ty, w: 2, h: 2, side: 's',
          door: { gx: tx, gy: ty + 2 }, porch: { gx: tx, gy: ty + 3 }, guardianUid: 'g' + (q + 1), keyPart: q + 1 };
      }
      if (!placed) return null;
      reserveRect(placed.x0, placed.y0, 2, 2, placed.id);
      reservedDoor[index(level, placed.door.gx, placed.door.gy)] = true;
      reservedPorch[index(level, placed.porch.gx, placed.porch.gy)] = true;
      level.tombs.push(placed);
    }

    // 3. waypoints: start, porches, then a Poisson-ish scatter
    var wps = [{ gx: level.start.gx, gy: level.start.gy, kind: 'gate' }];
    for (var ti = 0; ti < level.tombs.length; ti++) {
      wps.push({ gx: level.tombs[ti].porch.gx, gy: level.tombs[ti].porch.gy, kind: 'porch', tombId: level.tombs[ti].id });
    }
    for (var cand = 0; cand < 400 && wps.length < cfg.MAX_WAYPOINTS; cand++) {
      var wx = cfg.MARGIN + rng.int(W - 2 * cfg.MARGIN);
      var wy = cfg.MARGIN + rng.int(H - 2 * cfg.MARGIN);
      if (nearReserved(wx, wy, 1)) continue;
      var far = true;
      for (var wi = 0; wi < wps.length; wi++) {
        if (euclid(wps[wi], { gx: wx, gy: wy }) < cfg.WAYPOINT_MIN_DIST) { far = false; break; }
      }
      if (!far) continue;
      wps.push({ gx: wx, gy: wy, kind: 'node' });
    }
    level.waypoints = wps;

    // 4. graph: Prim MST from the start plus a few short loops
    var inTree = [true];
    for (var a = 1; a < wps.length; a++) inTree.push(false);
    var edges = [];
    for (var step = 1; step < wps.length; step++) {
      var best = null, bestD = Infinity;
      for (var u = 0; u < wps.length; u++) {
        if (!inTree[u]) continue;
        for (var v = 0; v < wps.length; v++) {
          if (inTree[v]) continue;
          var dd = euclid(wps[u], wps[v]);
          if (dd < bestD) { bestD = dd; best = [u, v]; }
        }
      }
      if (!best) break;
      inTree[best[1]] = true;
      edges.push(best);
    }
    function hasEdge(u, v) {
      for (var e = 0; e < edges.length; e++) {
        if ((edges[e][0] === u && edges[e][1] === v) || (edges[e][0] === v && edges[e][1] === u)) return true;
      }
      return false;
    }
    var loopCands = [];
    for (var u2 = 0; u2 < wps.length; u2++) {
      for (var v2 = u2 + 1; v2 < wps.length; v2++) {
        if (hasEdge(u2, v2)) continue;
        // porches keep a single approach so tomb steps stay quiet
        if (wps[u2].kind === 'porch' || wps[v2].kind === 'porch') continue;
        var ld = euclid(wps[u2], wps[v2]);
        if (ld < cfg.LOOP_MAX_DIST) loopCands.push({ u: u2, v: v2, d: ld });
      }
    }
    loopCands.sort(function(p, q2) { return p.d - q2.d; });
    var loops = 0;
    for (var lc = 0; lc < loopCands.length && loops < cfg.EXTRA_LOOPS; lc++) {
      if (rng() < 0.6) { edges.push([loopCands[lc].u, loopCands[lc].v]); loops++; }
    }
    level.edges = edges;

    // 5. carve each edge over a noisy cost field
    function carveCost(tile, lv, gx2, gy2) {
      var idx = index(lv, gx2, gy2);
      if (tile.kind === KIND.fence || tile.kind === KIND.gate) return Infinity;
      if (reserved[idx] || reservedDoor[idx]) return Infinity;
      if (tile.kind === KIND.path) return 0.25;
      // low-frequency valleys make a route curve in long arcs; the fine grain
      // keeps neighbouring routes from sharing exactly the same line
      var c = 1 + 2.5 * (0.35 * positionNoise(gx2, gy2, noiseSalt) + 0.65 * valueNoise(gx2, gy2, 4, noiseSalt + 31));
      if (gx2 <= 2 || gy2 <= 2 || gx2 >= W - 3 || gy2 >= H - 3) c += 1.5;
      return c;
    }
    /** May this tile become part of a lane? (tombs, doors and the fence stay clear) */
    function carvable(gx2, gy2) {
      if (!inside(level, gx2, gy2) || isBorder(level, gx2, gy2)) return false;
      var idx = index(level, gx2, gy2);
      if (reserved[idx] || reservedDoor[idx]) return false;
      var t2 = level.tiles[idx];
      return t2.kind === KIND.grass || t2.kind === KIND.path;
    }
    function layPath(gx2, gy2) {
      if (!carvable(gx2, gy2)) return;
      level.tiles[index(level, gx2, gy2)].kind = KIND.path;
    }
    for (var ei = 0; ei < edges.length; ei++) {
      var route = astar(level, wps[edges[ei][0]], wps[edges[ei][1]], carveCost);
      if (!route.length) return null;
      // a lane is a ribbon: the carved line plus one or two tiles to the side,
      // so Mr Owl can walk past a monster instead of bumping into it
      var fromGate = edges[ei][0] === 0 || edges[ei][1] === 0;
      var both = fromGate || rng() < cfg.LANE_WIDE_SHARE;
      var side = both ? 0 : (rng() < 0.5 ? 1 : -1);
      for (var ri2 = 0; ri2 < route.length; ri2++) {
        var step = route[ri2];
        layPath(step.gx, step.gy);
        var prev = route[ri2 > 0 ? ri2 - 1 : 0], next = route[ri2 < route.length - 1 ? ri2 + 1 : ri2];
        var dx = next.gx - prev.gx, dy = next.gy - prev.gy;
        var px = -dy, py = dx;                     // perpendicular to the lane
        if (px === 0 && py === 0) { px = 1; py = 0; }
        px = px > 0 ? 1 : (px < 0 ? -1 : 0);
        py = py > 0 ? 1 : (py < 0 ? -1 : 0);
        if (both) {
          layPath(step.gx + px, step.gy + py);
          layPath(step.gx - px, step.gy - py);
        } else {
          layPath(step.gx + side * px, step.gy + side * py);
        }
      }
      level.routes.push(route);
    }
    // smooth the bends: grass hemmed in by lanes becomes lane too
    for (var pass = 0; pass < 2; pass++) {
      var fill = [];
      for (var fi = 0; fi < n; fi++) {
        var ft = level.tiles[fi];
        if (ft.kind !== KIND.grass || !carvable(ft.gx, ft.gy)) continue;
        var around = 0;
        for (var fd = 0; fd < 4; fd++) {
          var fn = tileAt(level, ft.gx + DIRS[fd].dx, ft.gy + DIRS[fd].dy);
          if (fn && fn.kind === KIND.path) around++;
        }
        if (around >= 3) fill.push(fi);
      }
      for (var fj = 0; fj < fill.length; fj++) level.tiles[fill[fj]].kind = KIND.path;
    }
    for (var tj = 0; tj < level.tombs.length; tj++) {
      var tb = level.tombs[tj];
      tileAt(level, tb.porch.gx, tb.porch.gy).kind = KIND.path;
      var dt = tileAt(level, tb.door.gx, tb.door.gy);
      dt.kind = KIND.tomb_door;
      dt.tombId = tb.id;
    }

    // 6. plazas at busy junctions and inside the gate
    var degree = [];
    for (var di = 0; di < wps.length; di++) degree.push(0);
    for (var ej = 0; ej < edges.length; ej++) { degree[edges[ej][0]]++; degree[edges[ej][1]]++; }
    function stampPlaza(x0, y0, w, h) {
      for (var yy = y0; yy < y0 + h; yy++) {
        for (var xx = x0; xx < x0 + w; xx++) {
          if (!inside(level, xx, yy) || isBorder(level, xx, yy)) continue;
          var idx = index(level, xx, yy);
          if (reserved[idx] || reservedDoor[idx]) continue;
          var pt = level.tiles[idx];
          if (pt.kind === KIND.grass || pt.kind === KIND.path) { pt.kind = KIND.path; pt.plaza = true; }
        }
      }
    }
    for (var pi = 1; pi < wps.length; pi++) {
      if (wps[pi].kind !== 'node') continue;
      if (degree[pi] >= 3 || rng() < 0.25) stampPlaza(wps[pi].gx - 1, wps[pi].gy - 1, 3, 3);
    }
    stampPlaza(gateX - 2, H - 4, 5, 3);

    // path variants
    for (var vi = 0; vi < n; vi++) {
      var vt = level.tiles[vi];
      if (vt.kind === KIND.path) vt.variant = vt.plaza ? 1 : (positionNoise(vt.gx, vt.gy, noiseSalt + 7) < 0.5 ? 0 : 2);
      if (vt.kind === KIND.grass) vt.variant = Math.floor(positionNoise(vt.gx, vt.gy, noiseSalt + 13) * 4);
    }

    // helpers for decor placement
    function pathNeighbours(gx2, gy2) {
      var c = 0;
      for (var d = 0; d < 4; d++) {
        var nt = tileAt(level, gx2 + DIRS[d].dx, gy2 + DIRS[d].dy);
        if (nt && nt.kind === KIND.path) c++;
      }
      return c;
    }
    function nearKind(gx2, gy2, kind, radius) {
      for (var yy = gy2 - radius; yy <= gy2 + radius; yy++) {
        for (var xx = gx2 - radius; xx <= gx2 + radius; xx++) {
          var nt = tileAt(level, xx, yy);
          if (nt && nt.kind === kind) return true;
        }
      }
      return false;
    }
    function nearDoorOrPorch(gx2, gy2, radius) {
      for (var t2 = 0; t2 < level.tombs.length; t2++) {
        if (chebyshev(level.tombs[t2].door, { gx: gx2, gy: gy2 }) <= radius) return true;
        if (chebyshev(level.tombs[t2].porch, { gx: gx2, gy: gy2 }) <= radius) return true;
      }
      return false;
    }
    function nearTomb(gx2, gy2, radius) {
      for (var yy = gy2 - radius; yy <= gy2 + radius; yy++) {
        for (var xx = gx2 - radius; xx <= gx2 + radius; xx++) {
          var nt = tileAt(level, xx, yy);
          if (nt && nt.tombId && nt.kind !== KIND.tomb_door) return true;
        }
      }
      return false;
    }
    function freeGrass(gx2, gy2) {
      var gt = tileAt(level, gx2, gy2);
      return !!(gt && gt.kind === KIND.grass && !gt.tombId && !isBorder(level, gx2, gy2));
    }

    // 7. graves in rows beside the lanes
    var graves = 0;
    for (var gi = 0; gi < n && graves < cfg.MAX_GRAVES; gi++) {
      var gt2 = level.tiles[gi];
      if (gt2.kind !== KIND.grass || gt2.tombId || isBorder(level, gt2.gx, gt2.gy)) continue;
      if (pathNeighbours(gt2.gx, gt2.gy) !== 1) continue;
      if (nearDoorOrPorch(gt2.gx, gt2.gy, 1) || nearTomb(gt2.gx, gt2.gy, 1)) continue;
      if (manhattan(gt2, level.gate) <= cfg.GATE_SAFE_RADIUS + 1) continue;
      if ((gt2.gx + gt2.gy) % 2 !== 0) continue;
      if (rng() < 0.85) {
        gt2.kind = KIND.grave;
        gt2.variant = rng.int(6);
        graves++;
      }
    }

    // 8. trees away from the lanes
    var toPath = distanceToPaths(level);
    var treeCands = [];
    for (var tc = 0; tc < n; tc++) {
      var tt = level.tiles[tc];
      if (tt.kind !== KIND.grass || tt.tombId || isBorder(level, tt.gx, tt.gy)) continue;
      if (toPath[tc] < 2) continue;
      if (nearTomb(tt.gx, tt.gy, 1)) continue;
      treeCands.push(tt);
    }
    var trees = [];
    for (var tt2 = 0; tt2 < 900 && trees.length < cfg.TREES && treeCands.length; tt2++) {
      var pickT = rng.pick(treeCands);
      if (pickT.kind !== KIND.grass) continue;
      var okT = true;
      for (var tk = 0; tk < trees.length; tk++) if (chebyshev(trees[tk], pickT) < 2) { okT = false; break; }
      if (!okT) continue;
      pickT.kind = KIND.tree;
      pickT.variant = rng.int(4);
      trees.push(pickT);
    }
    // a few rocks in the remaining open grass
    var rocks = 0;
    for (var rk = 0; rk < 200 && rocks < cfg.ROCKS && treeCands.length; rk++) {
      var pickR = rng.pick(treeCands);
      if (pickR.kind !== KIND.grass || nearKind(pickR.gx, pickR.gy, KIND.tree, 1)) continue;
      pickR.kind = KIND.rock;
      pickR.variant = rng.int(2);
      rocks++;
    }

    // 9. lanterns along the lanes, at the gate and by every tomb porch
    var lanternOrder = [3, 0, 1, 2]; // prefer w, then n, e, s (poles stay off the lane in iso)
    function placeLanternNear(gx2, gy2) {
      if (level.lights.length >= cfg.MAX_LANTERNS) return false;
      // lanes are two or three tiles wide, so step outward until the verge is reached
      for (var reach = 1; reach <= 3; reach++) {
        for (var o = 0; o < lanternOrder.length; o++) {
          var d = DIRS[lanternOrder[o]];
          var lx = gx2 + d.dx * reach, ly = gy2 + d.dy * reach;
          if (!freeGrass(lx, ly)) continue;
          if (nearKind(lx, ly, KIND.lantern, 3)) continue;
          if (nearTomb(lx, ly, 1)) continue;
          var lt = tileAt(level, lx, ly);
          lt.kind = KIND.lantern;
          lt.variant = 0;
          level.lights.push({ gx: lx, gy: ly, height: cfg.LANTERN_HEIGHT });
          return true;
        }
      }
      return false;
    }
    placeLanternNear(gateX, H - 2);
    for (var side = -1; side <= 1; side += 2) {
      if (freeGrass(gateX + side * 2, H - 2) && level.lights.length < cfg.MAX_LANTERNS) {
        var glt = tileAt(level, gateX + side * 2, H - 2);
        if (!nearKind(glt.gx, glt.gy, KIND.lantern, 1)) {
          glt.kind = KIND.lantern;
          level.lights.push({ gx: glt.gx, gy: glt.gy, height: cfg.LANTERN_HEIGHT });
        }
      }
    }
    for (var tl = 0; tl < level.tombs.length; tl++) placeLanternNear(level.tombs[tl].porch.gx, level.tombs[tl].porch.gy);
    for (var rr = 0; rr < level.routes.length; rr++) {
      var rte = level.routes[rr];
      for (var rs = 3; rs < rte.length; rs += cfg.LANTERN_EVERY) placeLanternNear(rte[rs].gx, rte[rs].gy);
    }

    // 10. statues by plazas, benches facing lanes, pumpkins, spider webs
    function pickFrom(list, filter) {
      for (var attempts = 0; attempts < 40 && list.length; attempts++) {
        var c = rng.pick(list);
        if (c.kind === KIND.grass && (!filter || filter(c))) return c;
      }
      return null;
    }
    var statueCands = [], benchCands = [], pumpkinCands = [], webCands = [];
    for (var ci2 = 0; ci2 < n; ci2++) {
      var ct = level.tiles[ci2];
      if (ct.kind !== KIND.grass || ct.tombId || isBorder(level, ct.gx, ct.gy)) continue;
      if (nearDoorOrPorch(ct.gx, ct.gy, 1)) continue;
      var pn = pathNeighbours(ct.gx, ct.gy);
      var plazaNear = false;
      for (var d2 = 0; d2 < 4; d2++) {
        var pt2 = tileAt(level, ct.gx + DIRS[d2].dx, ct.gy + DIRS[d2].dy);
        if (pt2 && pt2.plaza) plazaNear = true;
      }
      if (plazaNear) statueCands.push(ct);
      if (pn >= 1) {
        for (var d3 = 0; d3 < 4; d3++) {
          var nb = tileAt(level, ct.gx + DIRS[d3].dx, ct.gy + DIRS[d3].dy);
          var opp = tileAt(level, ct.gx - DIRS[d3].dx, ct.gy - DIRS[d3].dy);
          if (nb && nb.kind === KIND.path && opp && opp.kind === KIND.grass) { benchCands.push({ tile: ct, facing: d3 }); break; }
        }
      }
      if (pn >= 1 || nearKind(ct.gx, ct.gy, KIND.grave, 1)) pumpkinCands.push(ct);
      var corner = (ct.gx === 1 || ct.gx === W - 2) && (ct.gy === 1 || ct.gy === H - 2);
      if (corner || nearKind(ct.gx, ct.gy, KIND.tree, 1)) webCands.push(ct);
    }
    var statues = 5 + rng.int(4);
    for (var si = 0; si < statues; si++) {
      var st = pickFrom(statueCands, function(c) { return !nearKind(c.gx, c.gy, KIND.statue, 2); });
      if (st) { st.kind = KIND.statue; st.variant = rng.int(3); }
    }
    var benches = 8 + rng.int(4);
    for (var bi = 0; bi < benches && benchCands.length; bi++) {
      var bc = null;
      for (var battempt = 0; battempt < 40 && !bc; battempt++) {
        var bcand = rng.pick(benchCands);
        if (bcand.tile.kind === KIND.grass && !nearKind(bcand.tile.gx, bcand.tile.gy, KIND.bench, 3)) bc = bcand;
      }
      if (bc) { bc.tile.kind = KIND.bench; bc.tile.variant = bc.facing; }
    }
    var pumpkins = 14 + rng.int(8);
    for (var pk = 0; pk < pumpkins; pk++) {
      var pt3 = pickFrom(pumpkinCands, function(c) { return !nearKind(c.gx, c.gy, KIND.pumpkin, 1); });
      if (pt3) { pt3.kind = KIND.pumpkin; pt3.variant = rng.int(3); }
    }
    var webs = 10 + rng.int(6);
    for (var wb = 0; wb < webs; wb++) {
      var wt = pickFrom(webCands, function(c) { return !nearKind(c.gx, c.gy, KIND.web, 2); });
      if (wt) { wt.kind = KIND.web; wt.variant = rng.int(2); }
    }

    // 11. walkability, distances from the gate, difficulty bands
    for (var wk = 0; wk < n; wk++) level.tiles[wk].walk = !!WALKABLE[level.tiles[wk].kind];
    var blocked = {};
    blocked[index(level, large.door.gx, large.door.gy)] = true;
    var dists = bfsDistances(level, level.start, blocked);
    var pathDists = [];
    for (var pd = 0; pd < n; pd++) {
      level.tiles[pd].dist = dists[pd];
      if (level.tiles[pd].kind === KIND.path && dists[pd] >= 0) pathDists.push(dists[pd]);
    }
    pathDists.sort(function(x, y) { return x - y; });
    level.maxDist = pathDists.length ? pathDists[pathDists.length - 1] : 0;
    level.bands = {
      t1: pathDists.length ? pathDists[Math.floor(pathDists.length / 3)] : 0,
      t2: pathDists.length ? pathDists[Math.floor(pathDists.length * 2 / 3)] : 0
    };

    // 12. monsters
    var roster = rosterOf(opts);
    var cyclers = { 1: makeCycler(rng, poolFor(roster, 1)), 2: makeCycler(rng, poolFor(roster, 2)), 3: makeCycler(rng, poolFor(roster, 3)) };
    function encounterTypeFor() {
      if (rng() < cfg.MATCHING_SHARE) {
        return { encounterType: 'matching', matchingCategory: rng() < 0.5 ? 'matching' : 'pronoun_matching' };
      }
      return { encounterType: 'quiz', matchingCategory: null };
    }
    var homeCands = [];
    for (var hc = 0; hc < n; hc++) {
      var ht = level.tiles[hc];
      if (ht.kind !== KIND.path || ht.dist < 6) continue;
      if (manhattan(ht, level.gate) <= cfg.GATE_SAFE_RADIUS + 2) continue;
      if (nearDoorOrPorch(ht.gx, ht.gy, 1)) continue;
      homeCands.push(ht);
    }
    var homes = [];
    for (var hd = 0; hd < 900 && homes.length < cfg.WANDERERS && homeCands.length; hd++) {
      var hpick = rng.pick(homeCands);
      var okH = true;
      for (var hh = 0; hh < homes.length; hh++) if (chebyshev(homes[hh], hpick) < cfg.HOME_SPACING) { okH = false; break; }
      if (okH) homes.push(hpick);
    }
    // Strays: now and then a middle- or far-ring wanderer is one of the
    // nearer kinds that has wandered out (a zombie among the spectres). It
    // keeps its ring's difficulty. Drawn from a stream of its own, so the
    // rest of the level comes out the same for a given seed.
    var strayRng = makeRng(mixSeed(seed, attempt) + 7919);
    function drawBand(band) {
      if (band < 2 || strayRng() >= cfg.STRAY_SHARE) return band;
      return band === 3 && strayRng() < 0.35 ? 1 : band - 1;
    }
    for (var mi = 0; mi < homes.length; mi++) {
      var home = homes[mi];
      var band = bandOfDist(level, home.dist);
      var mid = cyclers[drawBand(band)]();
      if (!mid) continue;
      var et = encounterTypeFor();
      var m = {
        uid: 'w' + (mi + 1), id: mid, difficulty: band, role: 'wander',
        encounterType: et.encounterType, matchingCategory: et.matchingCategory,
        home: { gx: home.gx, gy: home.gy }, gx: home.gx, gy: home.gy,
        dir: rng.int(8), stepMs: Math.round(cfg.STEP_MS * (0.8 + 0.4 * rng())), acc: 0,
        keyPart: null, defeated: false
      };
      m.acc = rng.int(m.stepMs);
      level.monsters.push(m);
    }
    var guardPool = poolFor(roster, 3);
    var guardCycler = makeCycler(rng, guardPool);
    var guardIndex = 0;
    for (var gq = 0; gq < level.tombs.length; gq++) {
      var tomb = level.tombs[gq];
      if (tomb.size !== 'small') continue;
      // a named guardian per tomb; fall back to the pool for a tiny roster
      var wanted = GUARDIANS[guardIndex++];
      var gid = findInRoster(roster, wanted) ? wanted : guardCycler();
      var get = encounterTypeFor();
      level.monsters.push({
        uid: tomb.guardianUid, id: gid, difficulty: 3, role: 'guard',
        encounterType: get.encounterType, matchingCategory: get.matchingCategory,
        home: { gx: tomb.door.gx, gy: tomb.door.gy }, gx: tomb.door.gx, gy: tomb.door.gy,
        dir: 2, stepMs: cfg.STEP_MS, acc: 0, keyPart: tomb.keyPart, defeated: false
      });
    }
    level.monsters.push({
      uid: 'boss', id: BOSS_ID, difficulty: 4, role: 'boss',
      encounterType: 'quiz', matchingCategory: null,
      home: { gx: large.x0 + 1, gy: large.y0 + 1 }, gx: large.x0 + 1, gy: large.y0 + 1,
      dir: 2, stepMs: cfg.STEP_MS, acc: 0, keyPart: null, defeated: false
    });
    for (var mb = 0; mb < level.monsters.length; mb++) level.monstersByUid[level.monsters[mb].uid] = level.monsters[mb];

    // 13. bounds, light map, owl, visibility
    level.bounds = computeBounds(level);
    computeLightMap(level);
    level.owl = { gx: level.start.gx, gy: level.start.gy, x: level.start.gx, y: level.start.gy, path: [] };
    for (var fs = 0; fs < n; fs++) {
      if (level.tiles[fs].kind === KIND.fence || level.tiles[fs].kind === KIND.gate) level.seen[fs] = 1;
    }
    updateVisibility(level);
    return level;
  }

  function bandOfDist(level, dist) {
    if (dist <= level.bands.t1) return 1;
    if (dist <= level.bands.t2) return 2;
    return 3;
  }

  function computeBounds(level) {
    var g2i = IsoModel.gridToIso;
    var tw = IsoModel.CONFIG.TILE_W, th = IsoModel.CONFIG.TILE_H;
    var left = g2i(0, level.H - 1).x - tw / 2;
    var right = g2i(level.W - 1, 0).x + tw / 2;
    var top = g2i(0, 0).y - th / 2 - 160;
    var bottom = g2i(level.W - 1, level.H - 1).y + th / 2;
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  /**
   * Check the invariants of a generated level. Returns { ok, reason }.
   */
  function validate(level) {
    if (!level) return { ok: false, reason: 'no level' };
    var W = level.W, H = level.H;
    var cfg = level.cfg || CONFIG;
    var gates = 0;
    for (var gy = 0; gy < H; gy++) {
      for (var gx = 0; gx < W; gx++) {
        var t = level.tiles[gy * W + gx];
        if (isBorder(level, gx, gy)) {
          if (t.kind === KIND.gate) { gates++; if (gy !== H - 1) return { ok: false, reason: 'gate not on the south fence' }; }
          else if (t.kind !== KIND.fence) return { ok: false, reason: 'border tile is not fence' };
        } else if (t.kind === KIND.fence || t.kind === KIND.gate) {
          return { ok: false, reason: 'fence inside the grounds' };
        }
      }
    }
    if (gates !== 1) return { ok: false, reason: 'gate count ' + gates };
    if (level.tombs.length !== cfg.SMALL_TOMBS + 1) return { ok: false, reason: 'tomb count' };
    var largeDoor = null;
    for (var ti = 0; ti < level.tombs.length; ti++) {
      var tb = level.tombs[ti];
      for (var yy = tb.y0; yy < tb.y0 + tb.h; yy++) {
        for (var xx = tb.x0; xx < tb.x0 + tb.w; xx++) {
          var ft = tileAt(level, xx, yy);
          if (!ft || ft.tombId !== tb.id || ft.kind === KIND.path || ft.walk) return { ok: false, reason: 'tomb footprint damaged ' + tb.id };
        }
      }
      var door = tileAt(level, tb.door.gx, tb.door.gy);
      if (!door || door.kind !== KIND.tomb_door) return { ok: false, reason: 'door missing ' + tb.id };
      var adj = false;
      for (var d = 0; d < 4; d++) {
        var nt = tileAt(level, tb.door.gx + DIRS[d].dx, tb.door.gy + DIRS[d].dy);
        if (nt && nt.tombId === tb.id && nt.kind !== KIND.tomb_door) adj = true;
      }
      if (!adj) return { ok: false, reason: 'door not on the tomb ' + tb.id };
      var porch = tileAt(level, tb.porch.gx, tb.porch.gy);
      if (!porch || porch.kind !== KIND.path || porch.dist < 0) return { ok: false, reason: 'porch unreachable ' + tb.id };
      if (tb.size === 'large') largeDoor = tb;
    }
    if (!largeDoor) return { ok: false, reason: 'no large tomb' };
    var largePorchDist = tileAt(level, largeDoor.porch.gx, largeDoor.porch.gy).dist;
    if (largePorchDist < 0.55 * level.maxDist) return { ok: false, reason: 'large tomb too close to the gate' };
    var smalls = [];
    for (var sj = 0; sj < level.tombs.length; sj++) {
      var st = level.tombs[sj];
      if (st.size !== 'small') continue;
      // small tombs may sit deep in the grounds, but never clearly beyond the great tomb
      if (tileAt(level, st.porch.gx, st.porch.gy).dist > largePorchDist * 1.2) return { ok: false, reason: 'small tomb farther than the large one' };
      smalls.push(st);
    }
    for (var a = 0; a < smalls.length; a++) {
      for (var b = a + 1; b < smalls.length; b++) {
        if (chebyshev(smalls[a].porch, smalls[b].porch) < 10) return { ok: false, reason: 'small tombs too close' };
      }
    }
    for (var i = 0; i < level.tiles.length; i++) {
      var wt = level.tiles[i];
      if (wt.kind === KIND.tomb_door && wt.tombId === 'large') continue;
      if (wt.walk && wt.dist < 0) return { ok: false, reason: 'unreachable walkable tile ' + wt.gx + ',' + wt.gy };
    }
    var wanderers = 0, guards = 0, bosses = 0;
    for (var mi = 0; mi < level.monsters.length; mi++) {
      var m = level.monsters[mi];
      if (m.role === 'wander') wanderers++;
      if (m.role === 'guard') guards++;
      if (m.role === 'boss') bosses++;
    }
    if (wanderers < Math.floor(0.75 * cfg.WANDERERS)) return { ok: false, reason: 'too few wanderers ' + wanderers };
    if (guards !== smalls.length || bosses !== 1) return { ok: false, reason: 'guardian count' };
    return { ok: true };
  }

  function scoreLevel(level) {
    if (!level) return -1;
    var reachable = 0;
    for (var i = 0; i < level.tombs.length; i++) {
      var p = tileAt(level, level.tombs[i].porch.gx, level.tombs[i].porch.gy);
      if (p && p.dist >= 0) reachable++;
    }
    return reachable * 1000 + level.maxDist;
  }

  /**
   * Generate a level for a seed. Retries with derived seeds until the
   * invariants hold; after MAX_ATTEMPTS returns the best attempt flagged
   * `degraded`. Same seed and options always give the same level.
   */
  function generate(seed, opts) {
    seed = seed >>> 0;
    var best = null, bestScore = -1;
    var maxAttempts = (opts && opts.MAX_ATTEMPTS) || CONFIG.MAX_ATTEMPTS;
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      var level = tryGenerate(seed, attempt, opts);
      if (level && validate(level).ok) return level;
      var s = scoreLevel(level);
      if (s > bestScore) { bestScore = s; best = level; }
    }
    if (best) best.degraded = true;
    return best;
  }

  // ---------------------------------------------------------------------------
  // Mr Owl
  // ---------------------------------------------------------------------------

  function tombOfDoor(level, tile) {
    if (!tile || tile.kind !== KIND.tomb_door) return null;
    for (var i = 0; i < level.tombs.length; i++) if (level.tombs[i].id === tile.tombId) return level.tombs[i];
    return null;
  }

  function hasAllKeyParts(level) {
    for (var i = 0; i < level.keyParts.length; i++) if (!level.keyParts[i]) return false;
    return true;
  }

  function keyPartCount(level) {
    var c = 0;
    for (var i = 0; i < level.keyParts.length; i++) if (level.keyParts[i]) c++;
    return c;
  }

  function isGuardianDefeated(level, tomb) {
    var g = level.monstersByUid[tomb.guardianUid];
    return !g || g.defeated;
  }

  /**
   * Whether Mr Owl may step onto a tile: walkable, the large tomb door only
   * with the complete skeleton key, a small tomb door once its guardian fell.
   */
  function canEnter(level, gx, gy) {
    var tile = tileAt(level, gx, gy);
    if (!tile || !tile.walk) return false;
    if (tile.kind === KIND.tomb_door) {
      var tomb = tombOfDoor(level, tile);
      if (!tomb) return false;
      if (tomb.size === 'large') return hasAllKeyParts(level);
      return isGuardianDefeated(level, tomb);
    }
    return true;
  }

  function walkCost(tile, level, gx, gy) {
    return canEnter(level, gx, gy) ? 1 : Infinity;
  }

  /**
   * Route for Mr Owl over enterable tiles, [] when none. Eight directions,
   * so a tapped tile is walked to the way he would walk there himself
   * rather than in stair steps.
   */
  /**
   * The Grim Reaper comes out to meet Mr Owl: once, when he first comes
   * within REVEAL_RADIUS tiles of the great tomb's door holding the whole
   * key. Returns the event, or null.
   */
  function bossRises(level) {
    if (level.bossRevealed || level.encounterUid || level.completed) return null;
    var boss = level.monstersByUid.boss;
    if (!boss || boss.defeated || !hasAllKeyParts(level)) return null;
    var large = null;
    for (var i = 0; i < level.tombs.length; i++) if (level.tombs[i].size === 'large') large = level.tombs[i];
    if (!large || chebyshev(owlTile(level), large.door) > level.cfg.REVEAL_RADIUS) return null;
    level.bossRevealed = true;
    return { type: 'boss_rises', tomb: large.id };
  }

  function pathTo(level, from, to) {
    if (!canEnter(level, to.gx, to.gy)) return [];
    return astar(level, from, to, walkCost, true);
  }

  function inGateSafeZone(level, pos) {
    var px = typeof pos.x === 'number' ? pos.x : pos.gx;
    var py = typeof pos.y === 'number' ? pos.y : pos.gy;
    return Math.abs(px - level.start.gx) + Math.abs(py - level.start.gy) <= level.cfg.GATE_SAFE_RADIUS;
  }

  // ---------------------------------------------------------------------------
  // Continuous movement
  //
  // Mr Owl has a float position `{x, y}` in tile units and walks freely along
  // the lanes; `{gx, gy}` is the tile he stands on (rounded) and is what every
  // other part of the game reads. A tile is the square centred on its integer
  // coordinates, so tile (3,4) spans x in [2.5, 3.5).
  // ---------------------------------------------------------------------------

  /** Float position, filled in from the tile when a caller only set gx/gy */
  function owlPos(level) {
    var o = level.owl;
    if (typeof o.x !== 'number' || typeof o.y !== 'number') { o.x = o.gx; o.y = o.gy; }
    return o;
  }

  function owlTile(level) {
    var o = owlPos(level);
    return { gx: o.gx, gy: o.gy };
  }

  /** Put Mr Owl on a tile centre (respawn, teleport, restored save) */
  function setOwlTile(level, gx, gy) {
    level.owl = { gx: gx, gy: gy, x: gx, y: gy, path: [] };
    updateVisibility(level);
    return level.owl;
  }

  /** Would a circle of radius r centred on (x, y) stay on enterable ground? */
  function fitsCircle(level, x, y, r) {
    var x0 = Math.round(x - r), x1 = Math.round(x + r);
    var y0 = Math.round(y - r), y1 = Math.round(y + r);
    for (var gy = y0; gy <= y1; gy++) {
      for (var gx = x0; gx <= x1; gx++) {
        if (!canEnter(level, gx, gy)) return false;
      }
    }
    return true;
  }

  /**
   * Slide Mr Owl by a velocity for dtMs, one axis at a time so he grazes
   * along a wall instead of sticking to it.
   * @returns {Object} { moved, tileChanged, blockedBy (tile or null) }
   */
  function moveBy(level, vx, vy, dtMs) {
    var o = owlPos(level);
    var r = level.cfg.OWL_RADIUS;
    var dt = dtMs / 1000;
    var blockedBy = null;
    var startGx = o.gx, startGy = o.gy;

    var nx = o.x + vx * dt;
    if (vx !== 0) {
      if (fitsCircle(level, nx, o.y, r)) {
        o.x = nx;
      } else {
        var wallX = Math.round(nx + (vx > 0 ? r : -r));
        blockedBy = tileAt(level, wallX, Math.round(o.y));
        o.x = wallX + (vx > 0 ? -0.5 : 0.5) + (vx > 0 ? -1 : 1) * (r + 1e-3);
        if (!fitsCircle(level, o.x, o.y, r)) o.x = startGx;
      }
    }
    var ny = o.y + vy * dt;
    if (vy !== 0) {
      if (fitsCircle(level, o.x, ny, r)) {
        o.y = ny;
      } else {
        var wallY = Math.round(ny + (vy > 0 ? r : -r));
        if (!blockedBy) blockedBy = tileAt(level, Math.round(o.x), wallY);
        o.y = wallY + (vy > 0 ? -0.5 : 0.5) + (vy > 0 ? -1 : 1) * (r + 1e-3);
        if (!fitsCircle(level, o.x, o.y, r)) o.y = startGy;
      }
    }
    o.gx = Math.round(o.x);
    o.gy = Math.round(o.y);
    return {
      moved: o.gx !== startGx || o.gy !== startGy || Math.abs(o.x - startGx) > 1e-6 || Math.abs(o.y - startGy) > 1e-6,
      tileChanged: o.gx !== startGx || o.gy !== startGy,
      blockedBy: blockedBy
    };
  }

  /** Events raised by standing on a tile: the gate, the great tomb, a monster */
  function enterTile(level) {
    var events = [];
    var tile = tileAt(level, level.owl.gx, level.owl.gy);
    updateVisibility(level);
    if (tile && tile.kind === KIND.tomb_door) {
      var t2 = tombOfDoor(level, tile);
      if (t2 && t2.size === 'large' && !level.monstersByUid.boss.defeated) events.push({ type: 'enter_large_tomb' });
    }
    if (tile && tile.kind === KIND.gate) events.push({ type: 'gate' });
    var prox = checkProximity(level);
    for (var i = 0; i < prox.length; i++) events.push(prox[i]);
    return events;
  }

  /** A locked door reports itself at most once every LOCKED_TOAST_MS */
  function lockedEvent(level, tile) {
    if (!tile || tile.kind !== KIND.tomb_door) return null;
    var tomb = tombOfDoor(level, tile);
    if (!tomb || tomb.size !== 'large' || hasAllKeyParts(level)) return null;
    var now = level.clockMs || 0;
    if (level.lockedToastAt && now - level.lockedToastAt < level.cfg.LOCKED_TOAST_MS) return null;
    level.lockedToastAt = now;
    return { type: 'tomb_locked', tombId: 'large', missing: 4 - keyPartCount(level) };
  }

  /** Give Mr Owl a route to follow (from pathTo); steering cancels it */
  function setPath(level, path) {
    var o = owlPos(level);
    o.path = [];
    if (!path || !path.length) return o.path;
    for (var i = 0; i < path.length; i++) {
      if (i === 0 && path[i].gx === o.gx && path[i].gy === o.gy) continue;
      o.path.push({ gx: path[i].gx, gy: path[i].gy });
    }
    return o.path;
  }

  /**
   * Advance Mr Owl for one frame. `steer` is a grid-space direction from the
   * thumb-stick, drag or keys (magnitude 0..1); when it is zero he follows the
   * route set by setPath.
   * @returns {Object} { moved, tileChanged, arrived, vx, vy, events }
   */
  function tickOwl(level, steer, dtMs) {
    var out = { moved: false, tileChanged: false, arrived: false, vx: 0, vy: 0, events: [] };
    if (level.paused || level.encounterUid || level.completed) return out;
    level.clockMs = (level.clockMs || 0) + dtMs;
    var o = owlPos(level);
    var cfg = level.cfg;
    var sx = steer ? steer.x || 0 : 0, sy = steer ? steer.y || 0 : 0;
    var mag = Math.sqrt(sx * sx + sy * sy);
    var vx = 0, vy = 0;

    if (mag > 0.01) {
      o.path = [];
      var speed = cfg.OWL_SPEED * Math.min(1, mag);
      vx = sx / mag * speed;
      vy = sy / mag * speed;
    } else if (o.path && o.path.length) {
      var step = o.path[0];
      if (!canEnter(level, step.gx, step.gy)) {
        var ev = lockedEvent(level, tileAt(level, step.gx, step.gy));
        if (ev) out.events.push(ev);
        o.path = [];
        return out;
      }
      var dx = step.gx - o.x, dy = step.gy - o.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d <= cfg.ARRIVE_EPS) {
        o.x = step.gx; o.y = step.gy; o.gx = step.gx; o.gy = step.gy;
        o.path.shift();
        if (!o.path.length) out.arrived = true;
      } else {
        // full speed toward the next tile, slowing on the last step so he lands on it
        var speedTo = Math.min(cfg.OWL_SPEED, d / (dtMs / 1000));
        vx = dx / d * speedTo;
        vy = dy / d * speedTo;
      }
    }

    if (vx !== 0 || vy !== 0) {
      var r = moveBy(level, vx, vy, dtMs);
      out.moved = r.moved;
      out.tileChanged = r.tileChanged;
      out.vx = vx; out.vy = vy;
      if (r.blockedBy) {
        var lev = lockedEvent(level, r.blockedBy);
        if (lev) out.events.push(lev);
      }
      if (r.tileChanged) {
        var rise = bossRises(level);
        if (rise) out.events.push(rise);
        var evs = enterTile(level);
        for (var i = 0; i < evs.length; i++) out.events.push(evs[i]);
      }
    }
    return out;
  }

  /**
   * Step Mr Owl onto an adjacent tile (keyboard nudge, tests).
   * Returns { ok, reason?, events }.
   */
  function moveOwl(level, gx, gy) {
    var target = { gx: gx, gy: gy };
    if (manhattan(owlTile(level), target) !== 1) return { ok: false, reason: 'far', events: [] };
    var tile = tileAt(level, gx, gy);
    if (!tile || !tile.walk) return { ok: false, reason: 'blocked', events: [] };
    if (!canEnter(level, gx, gy)) {
      var tomb = tombOfDoor(level, tile);
      if (tomb && tomb.size === 'large') {
        return { ok: false, reason: 'locked', events: [{ type: 'tomb_locked', tombId: 'large', missing: 4 - keyPartCount(level) }] };
      }
      return { ok: false, reason: 'blocked', events: [] };
    }
    var o = owlPos(level);
    o.gx = gx; o.gy = gy; o.x = gx; o.y = gy;
    return { ok: true, events: enterTile(level) };
  }

  function stepDir(level, dirId) {
    var t = owlTile(level);
    for (var i = 0; i < DIRS.length; i++) {
      if (DIRS[i].id === dirId) return moveOwl(level, t.gx + DIRS[i].dx, t.gy + DIRS[i].dy);
    }
    return { ok: false, reason: 'blocked', events: [] };
  }

  function respawnAtGate(level) {
    setOwlTile(level, level.start.gx, level.start.gy);
    level.encounterUid = null;
    level.graceMs = level.cfg.GRACE_MS;
    return level.owl;
  }

  // ---------------------------------------------------------------------------
  // Monsters
  // ---------------------------------------------------------------------------

  function occupiedMap(level) {
    var occ = {};
    for (var i = 0; i < level.monsters.length; i++) {
      var m = level.monsters[i];
      if (!m.defeated) occ[m.gx + ',' + m.gy] = m.uid;
    }
    return occ;
  }

  /** A diagonal step is only allowed when both straight neighbours are open */
  function openCorner(level, gx, gy, dir) {
    var a = tileAt(level, gx + dir.dx, gy);
    var b = tileAt(level, gx, gy + dir.dy);
    return !!a && !!b && a.walk && b.walk;
  }

  function stepWanderer(level, m, occ) {
    var cfg = level.cfg;
    var cands = [];
    var weights = [];
    var stretched = chebyshev(m, m.home) >= cfg.LEASH - 1;
    for (var d = 0; d < DIRS8.length; d++) {
      var nx = m.gx + DIRS8[d].dx, ny = m.gy + DIRS8[d].dy;
      var t = tileAt(level, nx, ny);
      if (!t || !t.walk || t.kind === KIND.tomb_door || t.kind === KIND.gate) continue;
      if (DIRS8[d].dx && DIRS8[d].dy && !openCorner(level, m.gx, m.gy, DIRS8[d])) continue;
      var pos = { gx: nx, gy: ny };
      if (inGateSafeZone(level, pos)) continue;
      if (chebyshev(pos, m.home) > cfg.LEASH) continue;
      if (occ[nx + ',' + ny]) continue;
      if (samePos(pos, level.owl)) continue;
      var w = DIRS8[d].dx && DIRS8[d].dy ? 0.9 : 1;
      if (d === m.dir) w *= 3;
      else if (OPPOSITE8[d] === m.dir) w *= 0.25;
      if (stretched && chebyshev(pos, m.home) < chebyshev(m, m.home)) w *= 2;
      cands.push(d);
      weights.push(w);
    }
    if (!cands.length) return null;
    var total = 0;
    for (var i = 0; i < weights.length; i++) total += weights[i];
    var r = level.aiRng() * total;
    var pick = cands[cands.length - 1];
    for (var j = 0; j < cands.length; j++) {
      r -= weights[j];
      if (r <= 0) { pick = cands[j]; break; }
    }
    var from = { gx: m.gx, gy: m.gy };
    delete occ[m.gx + ',' + m.gy];
    m.gx += DIRS8[pick].dx;
    m.gy += DIRS8[pick].dy;
    m.dir = pick;
    occ[m.gx + ',' + m.gy] = m.uid;
    return { type: 'moved', uid: m.uid, from: from, to: { gx: m.gx, gy: m.gy } };
  }

  /**
   * Advance the monsters by dtMs. Returns events: moved {uid, from, to} and
   * encounter {uid}. Nothing moves while paused or during an encounter.
   */
  function advance(level, dtMs) {
    var events = [];
    if (level.paused || level.encounterUid || level.completed) return events;
    level.graceMs = Math.max(0, level.graceMs - dtMs);
    var occ = occupiedMap(level);
    for (var i = 0; i < level.monsters.length; i++) {
      var m = level.monsters[i];
      if (m.defeated || m.role !== 'wander') continue;
      m.acc += dtMs;
      var steps = 0;
      while (m.acc >= m.stepMs && steps < 3) {
        m.acc -= m.stepMs;
        steps++;
        var ev = stepWanderer(level, m, occ);
        if (ev) events.push(ev);
      }
      if (m.acc >= m.stepMs) m.acc = m.stepMs - 1;
    }
    var prox = checkProximity(level);
    for (var p = 0; p < prox.length; p++) events.push(prox[p]);
    return events;
  }

  /**
   * A monster next to (or on) Mr Owl starts an encounter, unless he is
   * still in the grace period after a respawn or inside the gate safe zone.
   */
  function checkProximity(level) {
    if (level.encounterUid || level.graceMs > 0 || level.completed) return [];
    if (inGateSafeZone(level, owlPos(level))) return [];
    var best = null, bestD = Infinity;
    var o = owlPos(level);
    var R = level.cfg.PROX_R;
    for (var i = 0; i < level.monsters.length; i++) {
      var m = level.monsters[i];
      if (m.defeated || m.role === 'boss') continue;
      var mdx = m.gx - o.x, mdy = m.gy - o.y;
      var d = Math.sqrt(mdx * mdx + mdy * mdy);
      if (d <= R && d < bestD) { bestD = d; best = m; }
    }
    if (!best) return [];
    level.encounterUid = best.uid;
    return [{ type: 'encounter', uid: best.uid }];
  }

  /** The boss encounter is started by the flow when Mr Owl enters the large tomb */
  function startBossEncounter(level) {
    level.encounterUid = 'boss';
    return level.monstersByUid.boss;
  }

  function endEncounter(level) {
    level.encounterUid = null;
  }

  /**
   * Mark a monster defeated; guardians hand over their key part, the boss
   * completes the level.
   */
  function defeatMonster(level, uid) {
    var m = level.monstersByUid[uid];
    if (!m) return { keyPart: null, allKeys: hasAllKeyParts(level), bossDefeated: false };
    m.defeated = true;
    level.defeated[uid] = true;
    if (level.encounterUid === uid) level.encounterUid = null;
    if (m.keyPart) level.keyParts[m.keyPart - 1] = true;
    if (m.role === 'boss') level.completed = true;
    return { keyPart: m.keyPart || null, allKeys: hasAllKeyParts(level), bossDefeated: m.role === 'boss' };
  }

  /**
   * Roster monster for an encounter, copied so the key part can be added to
   * its loot (Combat deposits loot into the inventory on a win).
   */
  function encounterMonsterFor(level, uid, opts) {
    var m = level.monstersByUid[uid];
    if (!m) return null;
    var roster = rosterOf(opts);
    var def = findInRoster(roster, m.id) || { id: m.id, name: m.id, namePL: m.id, difficulty: m.difficulty, loot: [] };
    var copy = {};
    for (var k in def) if (def.hasOwnProperty(k)) copy[k] = def[k];
    copy.loot = (def.loot || []).slice();
    if (m.keyPart) {
      copy.loot.push({
        id: KEY_PART_ITEM.id, part: m.keyPart,
        name: KEY_PART_ITEM.name + ' ' + m.keyPart + '/4',
        namePL: KEY_PART_ITEM.namePL + ' ' + m.keyPart + '/4',
        value: KEY_PART_ITEM.value
      });
    }
    copy.uid = m.uid;
    copy.difficulty = m.role === 'boss' ? 4 : m.difficulty;
    copy.encounterType = m.encounterType;
    copy.matchingCategory = m.matchingCategory;
    return copy;
  }

  function monstersVisible(level) {
    var out = [];
    for (var i = 0; i < level.monsters.length; i++) {
      var m = level.monsters[i];
      if (m.defeated) continue;
      if (level.vis[index(level, m.gx, m.gy)] === 2) out.push(m);
    }
    return out;
  }

  function difficultyAt(level, gx, gy) {
    var t = tileAt(level, gx, gy);
    if (!t || t.dist < 0) return 1;
    return bandOfDist(level, t.dist);
  }

  // ---------------------------------------------------------------------------
  // Night visibility
  // ---------------------------------------------------------------------------

  /**
   * Recompute `vis` for every tile. The new values are built in a scratch
   * array and compared with the old ones, so `visChanged` lists only the
   * tiles that actually changed: the renderer touches those instead of
   * walking the whole grid on every step.
   */
  function updateVisibility(level) {
    var cfg = level.cfg;
    var n = level.W * level.H;
    var vis = level.vis;
    var next = level._visNext;
    if (!next || next.length !== n) next = level._visNext = new Array(n);
    for (var i = 0; i < n; i++) next[i] = level.seen[i] ? 1 : 0;
    function light(gx, gy) {
      var idx = index(level, gx, gy);
      next[idx] = 2;
      if (!level.seen[idx]) {
        level.seen[idx] = 1;
        level.seenVersion++;
        level.newlySeen.push(idx);   // the renderer drains this to reveal ground and props
      }
    }
    function remember(gx, gy) {
      var idx = index(level, gx, gy);
      if (level.seen[idx]) return;
      level.seen[idx] = 1;
      next[idx] = Math.max(next[idx], 1);
      level.seenVersion++;
      level.newlySeen.push(idx);
    }
    var o = owlPos(level);
    var r = cfg.VIS_OWL;
    var rs = r + (cfg.SEEN_EXTRA || 0);      // remembered, not yet lit
    var cr = Math.ceil(rs);
    for (var dy = -cr; dy <= cr; dy++) {
      for (var dx = -cr; dx <= cr; dx++) {
        var gx = Math.round(o.x) + dx, gy = Math.round(o.y) + dy;
        if (!inside(level, gx, gy)) continue;
        var ox = gx - o.x, oy = gy - o.y;
        var d2 = ox * ox + oy * oy;
        if (d2 <= r * r) light(gx, gy);
        else if (d2 <= rs * rs) remember(gx, gy);
      }
    }
    var lr = cfg.VIS_LANTERN;
    var cr = Math.ceil(lr);
    for (var li = 0; li < level.lights.length; li++) {
      var L = level.lights[li];
      for (var ly = -cr; ly <= cr; ly++) {
        for (var lx = -cr; lx <= cr; lx++) {
          if (lx * lx + ly * ly > lr * lr) continue;
          var ggx = L.gx + lx, ggy = L.gy + ly;
          if (inside(level, ggx, ggy)) light(ggx, ggy);
        }
      }
    }
    var changed = level.visChanged;
    for (var c = 0; c < n; c++) {
      if (next[c] !== vis[c]) { vis[c] = next[c]; changed.push(c); }
    }
  }

  /**
   * Per-tile lantern light (0 dark .. 1 lit) and the two nearest lanterns,
   * computed once so the renderer never scans every lantern per frame.
   */
  function computeLightMap(level) {
    var n = level.W * level.H;
    level.lightMap = new Float32Array(n);
    level.nearLights = new Array(n);
    var range = IsoModel.LIGHT.range;
    for (var i = 0; i < n; i++) {
      var t = level.tiles[i];
      level.lightMap[i] = IsoModel.lightLevel(t.gx, t.gy, level.lights);
      var best = [], bestD = [];
      for (var li = 0; li < level.lights.length; li++) {
        var dx = t.gx - level.lights[li].gx, dy = t.gy - level.lights[li].gy;
        var d = dx * dx + dy * dy;
        if (d > range * range) continue;
        if (best.length < 2) { best.push(li); bestD.push(d); }
        else if (d < bestD[0] || d < bestD[1]) {
          var worst = bestD[0] > bestD[1] ? 0 : 1;
          best[worst] = li; bestD[worst] = d;
        }
      }
      level.nearLights[i] = best;
    }
    return level.lightMap;
  }

  function visibilityAt(level, gx, gy) {
    if (!inside(level, gx, gy)) return 0;
    return level.vis[index(level, gx, gy)];
  }

  // ---------------------------------------------------------------------------
  // Save state
  // ---------------------------------------------------------------------------

  function exportState(level) {
    var defeated = [];
    for (var uid in level.defeated) if (level.defeated.hasOwnProperty(uid)) defeated.push(uid);
    var monsters = [];
    for (var i = 0; i < level.monsters.length; i++) {
      var m = level.monsters[i];
      monsters.push({ uid: m.uid, gx: m.gx, gy: m.gy, dir: m.dir, acc: m.acc });
    }
    var o = owlPos(level);
    return {
      seed: level.seed,
      attempt: level.attempt,
      owl: { gx: o.gx, gy: o.gy, x: o.x, y: o.y },
      keyParts: level.keyParts.slice(),
      defeated: defeated,
      monsters: monsters,
      aiRng: level.aiRng.getState(),
      graceMs: level.graceMs,
      seen: level.seen.join(''),
      completed: !!level.completed
    };
  }

  function loadState(state, opts) {
    var level = generate(state.seed, opts);
    if (!level) return null;
    if (state.owl && inside(level, state.owl.gx, state.owl.gy)) {
      // saves from the first cut only carry the tile
      var sx = typeof state.owl.x === 'number' ? state.owl.x : state.owl.gx;
      var sy = typeof state.owl.y === 'number' ? state.owl.y : state.owl.gy;
      level.owl = { gx: state.owl.gx, gy: state.owl.gy, x: sx, y: sy, path: [] };
    }
    if (state.keyParts) for (var k = 0; k < level.keyParts.length; k++) level.keyParts[k] = !!state.keyParts[k];
    if (state.defeated) {
      for (var d = 0; d < state.defeated.length; d++) {
        var dm = level.monstersByUid[state.defeated[d]];
        if (dm) { dm.defeated = true; level.defeated[dm.uid] = true; }
      }
    }
    if (state.monsters) {
      for (var i = 0; i < state.monsters.length; i++) {
        var sm = state.monsters[i];
        var lm = level.monstersByUid[sm.uid];
        if (!lm || !inside(level, sm.gx, sm.gy)) continue;
        lm.gx = sm.gx; lm.gy = sm.gy; lm.dir = sm.dir || 0; lm.acc = sm.acc || 0;
      }
    }
    if (typeof state.aiRng === 'number') level.aiRng.setState(state.aiRng);
    level.graceMs = state.graceMs || 0;
    if (state.seen && state.seen.length === level.seen.length) {
      for (var s = 0; s < level.seen.length; s++) level.seen[s] = state.seen.charAt(s) === '1' ? 1 : 0;
    }
    level.completed = !!state.completed;
    updateVisibility(level);
    return level;
  }

  // ---------------------------------------------------------------------------
  // Renderer helpers
  // ---------------------------------------------------------------------------

  function depthKey(gx, gy, layer) {
    return IsoModel.depthKey(gx, gy, layer);
  }

  /** Tombs sort by their front-most footprint tile so the porch draws in front */
  function tombDepth(tomb, layer) {
    return depthKey(tomb.x0 + tomb.w - 1, tomb.y0 + tomb.h - 1, layer === undefined ? 2 : layer);
  }

  function getBounds(level) {
    return level.bounds;
  }

  /**
   * Draw list of everything that is at least remembered, sorted by depth.
   * Tombs appear once (on their anchor), monsters only when fully visible.
   */
  function drawOrder(level) {
    var out = [];
    var L = IsoModel.CONFIG.LAYERS;
    var tombAnchored = {};
    for (var i = 0; i < level.tiles.length; i++) {
      var t = level.tiles[i];
      var v = level.vis[i];
      if (!v) continue;
      out.push({ kind: 'tile', gx: t.gx, gy: t.gy, ref: t, depth: depthKey(t.gx, t.gy, L.floor) });
      if (t.tombId && t.kind !== KIND.tomb_door) {
        if (!tombAnchored[t.tombId]) {
          tombAnchored[t.tombId] = true;
          var tomb = null;
          for (var tj = 0; tj < level.tombs.length; tj++) if (level.tombs[tj].id === t.tombId) tomb = level.tombs[tj];
          if (tomb) out.push({ kind: 'tomb', gx: tomb.x0, gy: tomb.y0, ref: tomb, depth: tombDepth(tomb, L.token) });
        }
      } else if (t.kind !== KIND.grass && t.kind !== KIND.path) {
        out.push({ kind: 'prop', gx: t.gx, gy: t.gy, ref: t, depth: depthKey(t.gx, t.gy, L.token) });
      }
    }
    var mons = monstersVisible(level);
    for (var m = 0; m < mons.length; m++) {
      out.push({ kind: 'monster', gx: mons[m].gx, gy: mons[m].gy, ref: mons[m], depth: depthKey(mons[m].gx, mons[m].gy, L.token) + 1 });
    }
    out.push({ kind: 'owl', gx: level.owl.gx, gy: level.owl.gy, ref: level.owl, depth: depthKey(level.owl.gx, level.owl.gy, L.token) + 1 });
    out.sort(function(a, b) { return a.depth - b.depth; });
    return out;
  }

  /**
   * Map a screen-space push (dx right, dy down) to the nearest grid direction
   * so the four HUD arrows point along the diamond axes.
   */
  function dirFromScreen(dx, dy) {
    var g = IsoModel.isoToGridExact(dx, dy);
    if (Math.abs(g.gx) >= Math.abs(g.gy)) return g.gx >= 0 ? 'e' : 'w';
    return g.gy >= 0 ? 's' : 'n';
  }

  return {
    CONFIG: CONFIG,
    KIND: KIND,
    DIRS: DIRS,
    DIRS8: DIRS8,
    WANDERER_BANDS: WANDERER_BANDS,
    GUARDIANS: GUARDIANS,
    BOSS_ID: BOSS_ID,
    KEY_PART_ITEM: KEY_PART_ITEM,
    makeRng: makeRng,
    seedFromString: seedFromString,
    generate: generate,
    validate: validate,
    index: index,
    tileAt: tileAt,
    isWalkable: isWalkable,
    astar: astar,
    pathTo: pathTo,
    canEnter: canEnter,
    owlPos: owlPos,
    owlTile: owlTile,
    setOwlTile: setOwlTile,
    fitsCircle: fitsCircle,
    moveBy: moveBy,
    setPath: setPath,
    tickOwl: tickOwl,
    moveOwl: moveOwl,
    stepDir: stepDir,
    respawnAtGate: respawnAtGate,
    advance: advance,
    checkProximity: checkProximity,
    startBossEncounter: startBossEncounter,
    bossRises: bossRises,
    endEncounter: endEncounter,
    defeatMonster: defeatMonster,
    encounterMonsterFor: encounterMonsterFor,
    monstersVisible: monstersVisible,
    difficultyAt: difficultyAt,
    hasAllKeyParts: hasAllKeyParts,
    keyPartCount: keyPartCount,
    isGuardianDefeated: isGuardianDefeated,
    tombOfDoor: tombOfDoor,
    updateVisibility: updateVisibility,
    visibilityAt: visibilityAt,
    computeLightMap: computeLightMap,
    exportState: exportState,
    loadState: loadState,
    drawOrder: drawOrder,
    tombDepth: tombDepth,
    depthKey: depthKey,
    getBounds: getBounds,
    dirFromScreen: dirFromScreen
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemModel;
}
