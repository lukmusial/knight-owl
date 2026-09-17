/**
 * FpLayout
 * Pure chamber geometry and lighting layout for the first-person prototype.
 * Produces plain number arrays (no DOM, no three.js) so it runs in the node
 * test runner:
 *  - chamber shell: a rounded-rectangle plan swept along a vertical profile
 *    (floor cove, slightly uneven wall, elliptical cloister vault) with
 *    arched openings cut into the sides that have exits
 *  - passage cross-section (coved floor edges, barrel vault)
 *  - torch spots per chamber, lava river axis, corner props
 *  - torch light assignment (nearest torches, shadow slots for the focus chamber)
 *
 * Coordinates: chamber-local x (east), y (up), z (south); a side's "out"
 * axis points from the chamber centre through that wall and "s" runs along
 * the wall to the right when facing out (same convention as FpRenderer).
 */

var FpLayout = (function() {
  var DIRS = ['N', 'E', 'S', 'W'];
  var DELTA = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

  var DIMS = {
    CELL: 10,        // distance between chamber centres
    CH: 3.5,         // chamber half-width (wall plane)
    R: 1.35,         // plan corner radius
    COVE: 0.55,      // floor-to-wall cove radius
    WALL_TOP: 3.8,   // where the vault springs
    CEIL_MAX: 5.6,   // vault apex
    VAULT_MIN: 0.3,  // plan scale of the flat vault cap
    PR: 1.2,         // passage half-width / arch radius
    PH: 2.0,         // passage straight wall height (arch springs here)
    SPLAY: 0.28,     // rounded/splayed reveal depth around openings
    PCOVE: 0.26,     // passage cove radius
    ROUGH: 0.07,     // max wall unevenness (inward displacement)
    TORCH_Y: 2.45,   // torch mount height
    TORCH_SPREAD: 1.3, // torch offset from the wall centre
    EYE: 1.6
  };

  function axes(dir) {
    var d = DELTA[dir];
    return { dx: d[0], dz: d[1], rx: -d[1], rz: d[0] };
  }

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }

  // ---------------------------------------------------------------------------
  // Deterministic noise
  // ---------------------------------------------------------------------------
  function hash3(x, y, z) {
    var h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    h = h ^ (h >>> 16);
    return ((h >>> 0) % 100000) / 100000;
  }

  function hashCell(x, y, salt) {
    return hash3(x * 7 + 3, y * 13 + 5, (salt || 0) * 31 + 11);
  }

  /** Smooth 3D value noise in [0, 1] */
  function noise3(x, y, z) {
    var x0 = Math.floor(x), y0 = Math.floor(y), z0 = Math.floor(z);
    var tx = smooth(x - x0), ty = smooth(y - y0), tz = smooth(z - z0);
    function lerp(a, b, t) { return a + (b - a) * t; }
    var c000 = hash3(x0, y0, z0), c100 = hash3(x0 + 1, y0, z0);
    var c010 = hash3(x0, y0 + 1, z0), c110 = hash3(x0 + 1, y0 + 1, z0);
    var c001 = hash3(x0, y0, z0 + 1), c101 = hash3(x0 + 1, y0, z0 + 1);
    var c011 = hash3(x0, y0 + 1, z0 + 1), c111 = hash3(x0 + 1, y0 + 1, z0 + 1);
    return lerp(
      lerp(lerp(c000, c100, tx), lerp(c010, c110, tx), ty),
      lerp(lerp(c001, c101, tx), lerp(c011, c111, tx), ty),
      tz);
  }

  /** Two octaves, roughly [0, 1] */
  function wallNoise(x, y, z) {
    return 0.65 * noise3(x * 0.9, y * 0.9, z * 0.9) + 0.35 * noise3(x * 2.3 + 17, y * 2.3, z * 2.3 + 5);
  }

  // ---------------------------------------------------------------------------
  // Plan and profiles
  // ---------------------------------------------------------------------------
  function doorHalf(d) { return d.PR + d.SPLAY; }

  /** Height of an arch outline of half-width `half` at offset s (straight jambs below PH) */
  function archHeight(s, half, d) {
    var a = Math.abs(s);
    if (a >= half) return d.PH;
    return d.PH + Math.sqrt(half * half - a * a);
  }

  /**
   * Columns along one side, s from -L to +L. With a door the jambs at +-J
   * are duplicated: a full-height wall column and a door column that starts
   * on the arch.
   */
  function sideColumns(hasDoor, d, step, archSeg) {
    var L = d.CH - d.R;
    var cols = [];
    var i, n;
    if (!hasDoor) {
      n = Math.max(2, Math.ceil(2 * L / step));
      for (i = 0; i <= n; i++) cols.push({ s: -L + 2 * L * i / n, door: false });
      return cols;
    }
    var J = doorHalf(d);
    n = Math.max(1, Math.ceil((L - J) / step));
    for (i = 0; i <= n; i++) cols.push({ s: -L + (L - J) * i / n, door: false });
    for (i = 0; i <= archSeg; i++) {
      var th = Math.PI - Math.PI * i / archSeg;
      var s = J * Math.cos(th);
      if (i === 0) s = -J;
      if (i === archSeg) s = J;
      cols.push({ s: s, door: true });
    }
    for (i = 0; i <= n; i++) cols.push({ s: J + (L - J) * i / n, door: false });
    return cols;
  }

  /**
   * Closed loop of plan columns around a chamber (N side, NE corner, E side, ...)
   * @param {Object} walls - { N: solid?, E, S, W }
   * @returns {Array} [{ x, z, nx, nz, u, side, s, door }]
   */
  function planColumns(walls, d, opts) {
    d = d || DIMS;
    opts = opts || {};
    var step = opts.step || 0.6;
    var archSeg = opts.archSeg || 10;
    var cornerSeg = opts.cornerSeg || 5;
    var L = d.CH - d.R;
    var out = [];
    var u = 0;
    for (var i = 0; i < 4; i++) {
      var dir = DIRS[i];
      var ax = axes(dir);
      var cols = sideColumns(!walls[dir], d, step, archSeg);
      var prevS = -L;
      for (var c = 0; c < cols.length; c++) {
        u += cols[c].s - prevS;
        prevS = cols[c].s;
        out.push({
          x: ax.dx * d.CH + ax.rx * cols[c].s,
          z: ax.dz * d.CH + ax.rz * cols[c].s,
          nx: ax.dx, nz: ax.dz, u: u, side: dir, s: cols[c].s, door: cols[c].door
        });
      }
      u += L - prevS;
      // corner towards the next side (interior points only)
      for (var k = 1; k < cornerSeg; k++) {
        var phi = (Math.PI / 2) * k / cornerSeg;
        var nx = Math.cos(phi) * ax.dx + Math.sin(phi) * ax.rx;
        var nz = Math.cos(phi) * ax.dz + Math.sin(phi) * ax.rz;
        out.push({
          x: ax.dx * L + ax.rx * L + d.R * nx,
          z: ax.dz * L + ax.rz * L + d.R * nz,
          nx: nx, nz: nz, u: u + d.R * phi, side: null, s: 0, door: false
        });
      }
      u += d.R * Math.PI / 2;
    }
    return out;
  }

  /** Lower profile of a solid column: cove then wall, [{ inset, y, v }] */
  function wallProfile(d, coveSeg, wallRows) {
    var rows = [];
    var arc = 0, prev = null;
    for (var i = 0; i <= coveSeg; i++) {
      var phi = (Math.PI / 2) * (1 - i / coveSeg);
      var p = { inset: d.COVE - d.COVE * Math.cos(phi), y: d.COVE - d.COVE * Math.sin(phi) };
      if (prev) arc += Math.sqrt((p.inset - prev.inset) * (p.inset - prev.inset) + (p.y - prev.y) * (p.y - prev.y));
      p.v = arc;
      rows.push(p);
      prev = p;
    }
    for (i = 1; i <= wallRows; i++) {
      var y = d.COVE + (d.WALL_TOP - d.COVE) * i / wallRows;
      rows.push({ inset: 0, y: y, v: arc + (y - d.COVE) });
    }
    return rows;
  }

  /** Vault rings from the wall top to the cap, [{ f, y }] (first ring = wall top) */
  function vaultRings(d, n) {
    var rings = [];
    for (var i = 0; i <= n; i++) {
      var th = (Math.PI / 2) * i / n;
      rings.push({ f: 1 - (1 - d.VAULT_MIN) * (1 - Math.cos(th)), y: d.WALL_TOP + (d.CEIL_MAX - d.WALL_TOP) * Math.sin(th) });
    }
    return rings;
  }

  /**
   * Chamber shell grid (walls + vault), chamber-local coordinates.
   * @param {Object} walls - { N: solid?, ... }
   * @param {Object} opts - { step, archSeg, cornerSeg, coveSeg, wallRows, vaultRows, rough, ox, oz (world offset for noise) }
   * @returns {Object} { points: [row][col] -> [x,y,z], uvs: [row][col] -> [u,v], rows, cols, wallRows (rows below the vault spring, inclusive), columns, cap: [[x,y,z]], capY, perimeter (u length of the loop) }
   */
  function chamberShell(walls, d, opts) {
    d = d || DIMS;
    opts = opts || {};
    var coveSeg = opts.coveSeg || 3;
    var wallRows = opts.wallRows || 6;
    var vaultRows = opts.vaultRows || 6;
    var rough = typeof opts.rough === 'number' ? opts.rough : d.ROUGH;
    var ox = opts.ox || 0, oz = opts.oz || 0;
    var cols = planColumns(walls, d, opts);
    var lower = wallProfile(d, coveSeg, wallRows);
    var rings = vaultRings(d, vaultRows);
    var J = doorHalf(d);
    var K = lower.length;
    var wallArc = lower[K - 1].v;
    var points = [], uvs = [];
    var r, c;
    var rowCount = K + rings.length - 1;
    for (r = 0; r < rowCount; r++) { points.push([]); uvs.push([]); }

    for (c = 0; c < cols.length; c++) {
      var col = cols[c];
      // displacement weight: none on door columns, fading in away from jambs
      var wDoor = 1;
      if (col.side && !walls[col.side]) {
        wDoor = col.door ? 0 : smooth((Math.abs(col.s) - J) / 0.6);
      }
      var x, y, z, v, w;
      for (r = 0; r < rowCount; r++) {
        if (r < K) {
          var inset = 0;
          if (col.door) {
            var y0 = archHeight(col.s, J, d);
            y = y0 + (d.WALL_TOP - y0) * r / (K - 1);
            v = wallArc - (d.WALL_TOP - y);
          } else {
            inset = lower[r].inset;
            y = lower[r].y;
            v = lower[r].v;
          }
          x = col.x - col.nx * inset;
          z = col.z - col.nz * inset;
          w = wDoor * smooth(y / 0.9);
        } else {
          var ring = rings[r - K + 1];
          var px = x, py = y, pz = z;
          x = col.x * ring.f;
          z = col.z * ring.f;
          y = ring.y;
          // v continues as arc length up the vault (previous undisplaced point is close enough)
          v += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py) + (z - pz) * (z - pz));
          w = wDoor * (1 - smooth((r - K + 1) / (rings.length - 1)));
        }
        var fx = x, fz = z;
        if (w > 0 && rough > 0) {
          var n = wallNoise((ox + x) * 0.8, y * 0.8, (oz + z) * 0.8);
          fx = x - col.nx * n * rough * w;
          fz = z - col.nz * n * rough * w;
        }
        points[r][c] = [fx, y, fz];
        uvs[r][c] = [col.u / 3, v / 3];
      }
    }
    var capRing = rings[rings.length - 1];
    var cap = cols.map(function(cl) { return [cl.x * capRing.f, capRing.y, cl.z * capRing.f]; });
    var L = d.CH - d.R;
    var perimeter = 4 * (2 * L + d.R * Math.PI / 2);
    return { points: points, uvs: uvs, rows: rowCount, cols: cols.length, wallRows: K, columns: cols, cap: cap, capY: capRing.y, perimeter: perimeter };
  }

  /** Floor outline (cove foot) as a closed ring, chamber-local [[x, 0, z]] */
  function floorRing(walls, d, opts) {
    d = d || DIMS;
    var cols = planColumns(walls, d, opts);
    var J = doorHalf(d);
    var ring = [];
    for (var i = 0; i < cols.length; i++) {
      var col = cols[i];
      if (col.door) continue;
      var inset = d.COVE;
      ring.push([col.x - col.nx * inset, 0, col.z - col.nz * inset]);
      // after the left jamb, run the floor out to the opening
      if (col.side && !walls[col.side] && Math.abs(col.s + J) < 1e-6) {
        var ax = axes(col.side);
        ring.push([ax.dx * d.CH + ax.rx * -J, 0, ax.dz * d.CH + ax.rz * -J]);
        ring.push([ax.dx * (d.CH + d.SPLAY) + ax.rx * -d.PR, 0, ax.dz * (d.CH + d.SPLAY) + ax.rz * -d.PR]);
        ring.push([ax.dx * (d.CH + d.SPLAY) + ax.rx * d.PR, 0, ax.dz * (d.CH + d.SPLAY) + ax.rz * d.PR]);
        ring.push([ax.dx * d.CH + ax.rx * J, 0, ax.dz * d.CH + ax.rz * J]);
      }
    }
    return ring;
  }

  /**
   * Passage cross-section from left to right as [{ s, y }]: cove, jamb,
   * semicircular vault, jamb, cove. Floor lies between the two ends.
   */
  function passageProfile(d, seg) {
    d = d || DIMS;
    seg = seg || 10;
    var pts = [];
    var i, phi;
    var rc = d.PCOVE;
    for (i = 0; i <= 3; i++) {
      phi = (Math.PI / 2) * i / 3;
      pts.push({ s: -d.PR + rc - rc * Math.sin(phi), y: rc - rc * Math.cos(phi) });
    }
    pts.push({ s: -d.PR, y: d.PH });
    for (i = 1; i < seg; i++) {
      var th = Math.PI - Math.PI * i / seg;
      pts.push({ s: d.PR * Math.cos(th), y: d.PH + d.PR * Math.sin(th) });
    }
    pts.push({ s: d.PR, y: d.PH });
    for (i = 3; i >= 0; i--) {
      phi = (Math.PI / 2) * i / 3;
      pts.push({ s: d.PR - rc + rc * Math.sin(phi), y: rc - rc * Math.cos(phi) });
    }
    return pts;
  }

  // ---------------------------------------------------------------------------
  // Dressing
  // ---------------------------------------------------------------------------
  /**
   * Two torches per chamber on the same side, so light rakes across the
   * other walls instead of flattening them: flanking a solid wall, or
   * failing that, both sides of a doorway. The side is picked per cell.
   * @returns {Array} [{ dir, s }]
   */
  function torchSpots(cell, d) {
    d = d || DIMS;
    var start = Math.floor(hashCell(cell.x, cell.y, 1) * 4) % 4;
    var i, dir;
    for (i = 0; i < 4; i++) {
      dir = DIRS[(start + i) % 4];
      if (cell.walls[dir]) return [{ dir: dir, s: -d.TORCH_SPREAD }, { dir: dir, s: d.TORCH_SPREAD }];
    }
    var beside = (doorHalf(d) + (d.CH - d.R)) / 2;
    dir = DIRS[start];
    return [{ dir: dir, s: -beside }, { dir: dir, s: beside }];
  }

  /**
   * Lava river axis: a line whose both ends hit solid walls ('EW' or 'NS'),
   * or null when the chamber is not a lava chamber / no such axis exists.
   */
  function lavaAxis(cell) {
    var wants = cell.type === 'boss' || ((cell.x * 7 + cell.y * 11 + 3) % 4 === 0 && cell.type !== 'entrance');
    if (!wants) return null;
    var ew = cell.walls.E && cell.walls.W;
    var ns = cell.walls.N && cell.walls.S;
    if (ew && ns) return (cell.x + cell.y) % 2 === 0 ? 'EW' : 'NS';
    if (ew) return 'EW';
    if (ns) return 'NS';
    return null;
  }

  /**
   * Corner props (0 NE, 1 SE, 2 SW, 3 NW) avoiding lava chambers and the boss
   * @returns {Array} [{ corner, kind: 'barrel'|'crate'|'rubble', x, z, rot }]
   */
  function propSpots(cell, d) {
    d = d || DIMS;
    if (cell.type === 'boss' || lavaAxis(cell)) return [];
    var kinds = ['barrel', 'crate', 'rubble'];
    var out = [];
    var off = d.CH - d.R + d.R * 0.18;
    var CORNERS = [[1, -1], [1, 1], [-1, 1], [-1, -1]];
    for (var k = 0; k < 4; k++) {
      var h = hashCell(cell.x, cell.y, 10 + k);
      if (h > 0.34) continue;
      var kind = kinds[Math.floor(hashCell(cell.x, cell.y, 20 + k) * kinds.length) % kinds.length];
      out.push({ corner: k, kind: kind, x: CORNERS[k][0] * off, z: CORNERS[k][1] * off, rot: hashCell(cell.x, cell.y, 30 + k) * Math.PI * 2 });
      if (out.length >= 2) break;
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Lights
  // ---------------------------------------------------------------------------
  /**
   * Choose which torches get the pooled point lights.
   * @param {Array} torches - [{ cellId, x, z }]
   * @param {Object} opts - { focusId, px, pz, count, shadowCount, isLit(cellId) -> bool }
   * @returns {Array} torch indices; the first min(shadowCount, n) are the shadow casters
   */
  function assignLights(torches, opts) {
    var count = opts.count || 0;
    var shadowCount = Math.min(opts.shadowCount || 0, count);
    var isLit = opts.isLit || function() { return true; };
    var cand = [];
    for (var i = 0; i < torches.length; i++) {
      var t = torches[i];
      if (!isLit(t.cellId)) continue;
      var dx = t.x - opts.px, dz = t.z - opts.pz;
      cand.push({ i: i, d: dx * dx + dz * dz, focus: t.cellId === opts.focusId });
    }
    cand.sort(function(a, b) {
      if (a.focus !== b.focus) return a.focus ? -1 : 1;
      return a.d - b.d || a.i - b.i;
    });
    var chosen = [];
    // shadow slots: focus chamber torches first, then nearest
    for (i = 0; i < cand.length && chosen.length < shadowCount; i++) chosen.push(cand[i].i);
    var rest = cand.slice(chosen.length).sort(function(a, b) { return a.d - b.d || a.i - b.i; });
    for (i = 0; i < rest.length && chosen.length < count; i++) chosen.push(rest[i].i);
    return chosen;
  }

  /** Torch flicker multiplier (~0.8..1.1), smooth in time, distinct per phase */
  function flicker(t, phase) {
    return 0.93 + 0.08 * Math.sin(t * 7.3 + phase * 11.0) + 0.05 * Math.sin(t * 13.1 + phase * 23.0) + 0.03 * Math.sin(t * 29.7 + phase * 5.0);
  }

  return {
    DIRS: DIRS,
    DIMS: DIMS,
    axes: axes,
    noise3: noise3,
    wallNoise: wallNoise,
    hashCell: hashCell,
    doorHalf: doorHalf,
    archHeight: archHeight,
    planColumns: planColumns,
    wallProfile: wallProfile,
    vaultRings: vaultRings,
    chamberShell: chamberShell,
    floorRing: floorRing,
    passageProfile: passageProfile,
    torchSpots: torchSpots,
    lavaAxis: lavaAxis,
    propSpots: propSpots,
    assignLights: assignLights,
    flicker: flicker
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FpLayout;
}
