/**
 * FpRenderer
 * three.js scene for the first-person prototype. Every dungeon room is a
 * softened stone chamber (FpLayout): rounded corners, a cove where the floor
 * meets the slightly uneven walls, an elliptical cloister vault, and arched
 * doorways with rounded reveals leading into coved, barrel-vaulted passages.
 *
 * Lighting: wall torches (iron bracket, wooden handle, pitch wrap and an
 * animated shader flame) are the real light sources. A pool of point lights
 * follows the torches nearest the player; the first slots (the torches of
 * the chamber the player is in) cast shadows. Shadow maps are static and
 * refreshed only when the light slots, visible chambers or monsters change,
 * so flicker costs nothing but a uniform update. Materials are
 * MeshStandardMaterial with stylised colour + normal maps (FpTextures).
 * Quality tiers (FpQuality) bound the number of lights, shadow casters,
 * shadow map size and pixel ratio, and step down automatically when frames
 * are slow.
 *
 * Fog of war: every vertex carries a colour attribute that is black for
 * unexplored chambers, dim for chambers seen through a doorway and white
 * once entered; brightness eases in over ~500 ms. Monsters are billboard
 * sprites (with an invisible shadow-casting cutout) created only when their
 * chamber is entered.
 *
 * Renders on demand: while a tween, fade or brightness change runs, or when
 * something marked the scene dirty; flames/lights/lava animate continuously
 * only while `animated` is true (set by the bootstrap while the view is visible).
 */

var FpRenderer = (function() {
  var D = FpLayout.DIMS;
  var CELL = D.CELL;
  var CH = D.CH;
  var EYE = D.EYE;
  var NEAR = 0.08;
  var FAR = 70;
  var SEEN_LEVEL = 0.28;
  var UVS = 3;             // world units per wall texture repeat
  var FLOOR_UVS = 4.2;     // world units per floor texture repeat
  var FOG_DENSITY = 0.045;
  var TORCH_INTENSITY = 42;
  var TORCH_RANGE = 14;
  var CULL_DIST = 46;
  var QUALITY_KEY = 'fpQualityAuto';

  var renderer = null, scene = null, camera = null, mount = null;
  var world = null;
  var textures = null;
  var materials = {};
  var cells = {};           // cellId -> { group, meshes: [], x, z }
  var entities = {};
  var brightness = {};      // cellId -> { cur, target }
  var lavaCells = {};
  var torchList = [];       // { cellId, x, y, z, phase }
  var flameMesh = null, flameMaterial = null;
  var torchLights = [], lightSlots = [], lavaLights = [], gateLight = null, headLight = null, hemi = null;
  var gateBars = null, gateRune = null, gateHost = null;
  var fades = [];
  var focusId = null;
  var shadowDirty = true;

  var quality = null, qualityLocked = false, monitor = null, rebuildHook = null;

  var running = false, animated = false, dirty = true, tween = null, rafId = null;
  var pose = { x: 0, z: 0, yaw: 0 };
  var bob = 0;
  var reducedMotion = false;
  var clock = 0, lastNow = 0;
  var brightening = false;
  var seedRnd = 1;

  function rad(deg) { return deg * Math.PI / 180; }
  function rnd() { seedRnd = (seedRnd * 9301 + 49297) % 233280; return seedRnd / 233280; }
  function cellCenter(cell) { return { x: cell.x * CELL, z: cell.y * CELL }; }
  var axes = FpLayout.axes;

  /** World point for chamber centre c, side axes ax: s along the wall, y up, out toward the wall */
  function wallPoint(c, ax, s, y, out) {
    return [c.x + ax.dx * out + ax.rx * s, y, c.z + ax.dz * out + ax.rz * s];
  }

  // ---------------------------------------------------------------------------
  // Quality
  // ---------------------------------------------------------------------------
  function storedTier() {
    try { return window.localStorage.getItem(QUALITY_KEY); } catch (e) { return null; }
  }

  function storeTier(t) {
    try { window.localStorage.setItem(QUALITY_KEY, t); } catch (e) { /* private mode */ }
  }

  function chooseQuality(override) {
    var nav = window.navigator || {};
    var tier = FpQuality.pick({
      override: override,
      stored: storedTier(),
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      cores: nav.hardwareConcurrency,
      memory: nav.deviceMemory,
      touch: ('ontouchstart' in window) || (nav.maxTouchPoints > 0)
    });
    qualityLocked = FpQuality.TIERS.indexOf(override) !== -1;
    quality = FpQuality.settings(tier);
    monitor = FpQuality.createMonitor({});
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function init(opts) {
    mount = opts.mount;
    reducedMotion = !!opts.reducedMotion;
    chooseQuality(opts.quality);
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('FpRenderer: WebGL unavailable', e);
      renderer = null;
      return false;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.addEventListener('webglcontextlost', function(e) { e.preventDefault(); console.warn('FpRenderer: context lost'); });
    renderer.domElement.addEventListener('webglcontextrestored', function() {
      console.warn('FpRenderer: context restored, rebuilding');
      rebuild();
    });
    mount.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040306);
    scene.fog = new THREE.FogExp2(0x040306, FOG_DENSITY);

    camera = new THREE.PerspectiveCamera(70, 4 / 3, NEAR, FAR);
    scene.add(camera);

    hemi = new THREE.HemisphereLight(0x7078a0, 0x3a2818, 0.16);
    scene.add(hemi);

    // faint warm fill carried by the player so billboards and near walls never go black
    headLight = new THREE.PointLight(0xffc890, 0.6, 8, 2);
    headLight.position.set(0, 0.2, 0.3);

    gateLight = new THREE.PointLight(0xb14ad6, 0, CELL, 2);
    scene.add(gateLight);

    setupLights();

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function() { setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) stopLoop(); else if (running) startLoop();
    });
    console.log('FpRenderer: WebGL2=' + !!(renderer.capabilities && renderer.capabilities.isWebGL2) + ' quality=' + quality.tier);
    return true;
  }

  /** (Re)create the torch and lava light pools for the current quality tier */
  function setupLights() {
    var i;
    for (i = 0; i < lavaLights.length; i++) { scene.remove(lavaLights[i]); lavaLights[i].dispose(); }
    lavaLights = [];
    for (i = 0; i < quality.lavaLights; i++) {
      var ll = new THREE.PointLight(0xff5a1a, 0, CELL * 1.1, 2);
      scene.add(ll);
      lavaLights.push(ll);
    }
    if (quality.headLight && !headLight.parent) camera.add(headLight);
    if (!quality.headLight && headLight.parent) camera.remove(headLight);
    hemi.intensity = quality.headLight ? 0.16 : 0.28;
    for (i = 0; i < torchLights.length; i++) {
      scene.remove(torchLights[i]);
      if (torchLights[i].shadow && torchLights[i].shadow.map) torchLights[i].shadow.map.dispose();
      torchLights[i].dispose();
    }
    torchLights = [];
    lightSlots = [];
    for (i = 0; i < quality.lights; i++) {
      var l = new THREE.PointLight(0xffac5c, 0, TORCH_RANGE, 2);
      if (i < quality.shadowLights) {
        l.castShadow = true;
        l.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
        l.shadow.camera.near = 0.05;
        l.shadow.camera.far = TORCH_RANGE;
        l.shadow.bias = -0.004;
        l.shadow.normalBias = 0.02;
      }
      l.position.set(0, -50, 0);
      scene.add(l);
      torchLights.push(l);
      lightSlots.push(-1);
    }
    renderer.shadowMap.enabled = quality.shadowLights > 0;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
    shadowDirty = true;
  }

  function resize() {
    if (!renderer || !mount) return;
    var w = mount.clientWidth || window.innerWidth || 640;
    var h = mount.clientHeight || window.innerHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = h > w ? 92 : 68;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Geometry builder (positions, normals, uvs, per-vertex fog-of-war colour)
  // ---------------------------------------------------------------------------
  function Builder() {
    this.pos = []; this.norm = []; this.uv = []; this.idx = [];
  }

  Builder.prototype.vertex = function(p, n, uv) {
    this.pos.push(p[0], p[1], p[2]);
    this.norm.push(n[0], n[1], n[2]);
    this.uv.push(uv[0], uv[1]);
    return this.pos.length / 3 - 1;
  };

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.sqrt(dot(a, a)) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

  /**
   * Polygon (flat normal) facing `inside`; fan from the first vertex
   */
  Builder.prototype.poly = function(pts, uvs, inside) {
    var n = [0, 0, 0];
    for (var i = 1; i + 1 < pts.length; i++) {
      var c = cross(sub(pts[i], pts[0]), sub(pts[i + 1], pts[0]));
      n = [n[0] + c[0], n[1] + c[1], n[2] + c[2]];
    }
    var flip = dot(n, sub(inside, pts[0])) < 0;
    n = norm(flip ? [-n[0], -n[1], -n[2]] : n);
    var base = this.pos.length / 3;
    for (i = 0; i < pts.length; i++) this.vertex(pts[i], n, uvs[i]);
    for (i = 1; i + 1 < pts.length; i++) {
      if (flip) this.idx.push(base, base + i + 1, base + i);
      else this.idx.push(base, base + i, base + i + 1);
    }
  };

  /**
   * Smooth-shaded grid of rows x cols; `wrap` closes the columns into a loop
   * (the closing column repeats column 0 with u shifted by `wrapU`).
   * Normals come from central differences over the full grid; rows r0..r1 are emitted.
   */
  Builder.prototype.grid = function(points, uvs, inside, wrap, r0, r1, wrapU) {
    var R = points.length, C = points[0].length;
    r0 = typeof r0 === 'number' ? r0 : 0;
    r1 = typeof r1 === 'number' ? r1 : R - 1;
    var normals = [];
    var r, c;
    for (r = 0; r < R; r++) {
      normals.push([]);
      for (c = 0; c < C; c++) {
        var cl = wrap ? (c + C - 1) % C : Math.max(0, c - 1);
        var cr = wrap ? (c + 1) % C : Math.min(C - 1, c + 1);
        var du = sub(points[r][cr], points[r][cl]);
        // skip over duplicated (jamb) columns
        if (dot(du, du) < 1e-8) {
          cl = wrap ? (c + C - 2) % C : Math.max(0, c - 2);
          cr = wrap ? (c + 2) % C : Math.min(C - 1, c + 2);
          du = sub(points[r][cr], points[r][cl]);
        }
        var dv = sub(points[Math.min(R - 1, r + 1)][c], points[Math.max(0, r - 1)][c]);
        normals[r].push(cross(du, dv));
      }
    }
    // orientation from a middle vertex
    var mr = Math.floor(R / 2), mc = Math.floor(C / 2);
    var flip = dot(normals[mr][mc], sub(inside, points[mr][mc])) < 0;
    var base = this.pos.length / 3;
    var rows = r1 - r0 + 1;
    var W = wrap ? C + 1 : C;
    for (r = r0; r <= r1; r++) {
      for (c = 0; c < W; c++) {
        var cc = c % C;
        var n = normals[r][cc];
        if (flip) n = [-n[0], -n[1], -n[2]];
        var uv = c < C ? uvs[r][cc] : [uvs[r][0][0] + (wrapU || 0), uvs[r][0][1]];
        this.vertex(points[r][cc], norm(n), uv);
      }
    }
    for (r = 0; r < rows - 1; r++) {
      for (c = 0; c < W - 1; c++) {
        var c2 = c + 1;
        var a = base + r * W + c, b = base + r * W + c2;
        var d = base + (r + 1) * W + c, e = base + (r + 1) * W + c2;
        if (flip) { this.idx.push(a, e, b, a, d, e); } else { this.idx.push(a, b, e, a, e, d); }
      }
    }
  };

  /** Append a three.js geometry transformed by a Matrix4; uvs scaled by uvScale (and swapped when swapUv) */
  Builder.prototype.geometry = function(geom, matrix, uvScale, swapUv) {
    var g = geom;
    var p = g.getAttribute('position'), n = g.getAttribute('normal'), t = g.getAttribute('uv');
    var nm = new THREE.Matrix3().getNormalMatrix(matrix);
    var v = new THREE.Vector3();
    var base = this.pos.length / 3;
    var sc = uvScale || 1;
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(matrix);
      this.pos.push(v.x, v.y, v.z);
      v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
      this.norm.push(v.x, v.y, v.z);
      if (!t) this.uv.push(0, 0);
      else if (swapUv) this.uv.push(t.getY(i) * sc, t.getX(i) * sc);
      else this.uv.push(t.getX(i) * sc, t.getY(i) * sc);
    }
    if (g.index) {
      for (i = 0; i < g.index.count; i++) this.idx.push(base + g.index.getX(i));
    } else {
      for (i = 0; i < p.count; i++) this.idx.push(base + i);
    }
  };

  Builder.prototype.empty = function() { return this.idx.length === 0; };

  Builder.prototype.toGeometry = function() {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.norm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(this.pos.length), 3));
    g.setIndex(this.idx);
    g.computeBoundingSphere();
    return g;
  };

  // ---------------------------------------------------------------------------
  // Chamber construction
  // ---------------------------------------------------------------------------
  function shiftGrid(points, c) {
    for (var r = 0; r < points.length; r++) {
      for (var k = 0; k < points[r].length; k++) {
        points[r][k] = [points[r][k][0] + c.x, points[r][k][1], points[r][k][2] + c.z];
      }
    }
    return points;
  }

  function floorUv(p) { return [p[0] / FLOOR_UVS, p[2] / FLOOR_UVS]; }

  function pushShell(b, cell, c, wallKey) {
    var shell = FpLayout.chamberShell(cell.walls, D, {
      step: quality.step, wallRows: quality.wallRows, vaultRows: quality.vaultRows, ox: c.x, oz: c.z
    });
    var pts = shiftGrid(shell.points, c);
    var inside = [c.x, EYE, c.z];
    var wrapU = shell.perimeter / 3;
    b[wallKey].grid(pts, shell.uvs, inside, true, 0, shell.wallRows - 1, wrapU);
    b.ceiling.grid(pts, shell.uvs, [c.x, 1.0, c.z], true, shell.wallRows - 1, shell.rows - 1, wrapU);
    // rounded string course along the vault spring
    var BAND = 0.2, BSEG = 6;
    var spring = pts[shell.wallRows - 1];
    var bandPts = [], bandUvs = [];
    for (var k = 0; k <= BSEG; k++) {
      var phi = Math.PI * k / BSEG - Math.PI / 2;
      var row = [], urow = [];
      for (var j = 0; j < shell.cols; j++) {
        var col = shell.columns[j];
        var push = BAND * Math.cos(phi);
        row.push([spring[j][0] - col.nx * push, spring[j][1] + BAND * Math.sin(phi), spring[j][2] - col.nz * push]);
        urow.push([col.u / UVS * 2, k / BSEG * 0.2]);
      }
      bandPts.push(row);
      bandUvs.push(urow);
    }
    b.trim.grid(bandPts, bandUvs, inside, true, 0, BSEG, wrapU * 2);
    // vault cap
    var cap = shell.cap.map(function(p) { return [p[0] + c.x, p[1], p[2] + c.z]; });
    var capPts = [[c.x, shell.capY, c.z]].concat(cap).concat([cap[0]]);
    b.ceiling.poly(capPts, capPts.map(function(p) { return [p[0] / UVS, p[2] / UVS]; }), [c.x, 0, c.z]);
    // floor
    var ring = FpLayout.floorRing(cell.walls, D, { step: quality.step }).map(function(p) { return [p[0] + c.x, 0, p[2] + c.z]; });
    var floorPts = [[c.x, 0, c.z]].concat(ring).concat([ring[0]]);
    b.floor.poly(floorPts, floorPts.map(floorUv), [c.x, 5, c.z]);
  }

  /** Rounded reveal around an opening, jamb caps over the cove, passage to the cell edge */
  function pushDoorway(b, c, ax, wallKey) {
    var J = FpLayout.doorHalf(D);
    var SEG = 10, BULL = 3;
    var points = [], uvs = [];
    for (var k = 0; k <= BULL; k++) {
      var phi = (Math.PI / 2) * k / BULL;
      var depth = D.SPLAY - D.SPLAY * Math.cos(phi);
      var e = D.SPLAY - D.SPLAY * Math.sin(phi);
      var r = D.PR + e;
      var row = [], urow = [];
      var outline = [[-r, 0], [-r, D.PH * 0.5], [-r, D.PH]];
      for (var i = 1; i < SEG; i++) {
        var th = Math.PI - Math.PI * i / SEG;
        outline.push([r * Math.cos(th), D.PH + r * Math.sin(th)]);
      }
      outline.push([r, D.PH], [r, D.PH * 0.5], [r, 0]);
      var arc = 0;
      for (i = 0; i < outline.length; i++) {
        if (i > 0) arc += Math.sqrt(Math.pow(outline[i][0] - outline[i - 1][0], 2) + Math.pow(outline[i][1] - outline[i - 1][1], 2));
        row.push(wallPoint(c, ax, outline[i][0], outline[i][1], CH + depth));
        urow.push([arc / UVS, D.SPLAY * phi / UVS]);
      }
      points.push(row);
      uvs.push(urow);
    }
    b[wallKey].grid(points, uvs, wallPoint(c, ax, 0, 1.2, CH - 2.5), false);

    // caps closing the floor cove at both jambs
    var capSeg = 3;
    for (var side = -1; side <= 1; side += 2) {
      var cap = [wallPoint(c, ax, side * J, 0, CH)];
      for (k = 0; k <= capSeg; k++) {
        var ph = (Math.PI / 2) * (1 - k / capSeg);
        var inset = D.COVE - D.COVE * Math.cos(ph);
        var y = D.COVE - D.COVE * Math.sin(ph);
        cap.push(wallPoint(c, ax, side * J, y, CH - inset));
      }
      b[wallKey].poly(cap, cap.map(function(p, n) { return [n * 0.05, p[1] / UVS]; }), wallPoint(c, ax, 0, 0.2, CH - 0.2));
    }

    // passage: coved barrel vault swept from the reveal to the cell boundary
    var prof = FpLayout.passageProfile(D, SEG);
    var o0 = CH + D.SPLAY, o1 = CELL / 2 + 0.01;
    var pRows = [], pUvs = [];
    var steps = 2;
    for (k = 0; k <= steps; k++) {
      var o = o0 + (o1 - o0) * k / steps;
      var prow = [], purow = [], parc = 0;
      for (i = 0; i < prof.length; i++) {
        if (i > 0) parc += Math.sqrt(Math.pow(prof[i].s - prof[i - 1].s, 2) + Math.pow(prof[i].y - prof[i - 1].y, 2));
        prow.push(wallPoint(c, ax, prof[i].s, prof[i].y, o));
        purow.push([parc / UVS, o / UVS]);
      }
      pRows.push(prow);
      pUvs.push(purow);
    }
    b[wallKey].grid(pRows, pUvs, wallPoint(c, ax, 0, 1.2, (o0 + o1) / 2), false);
    var fw = D.PR - D.PCOVE;
    var pf = [wallPoint(c, ax, -fw, 0, o0), wallPoint(c, ax, fw, 0, o0), wallPoint(c, ax, fw, 0, o1), wallPoint(c, ax, -fw, 0, o1)];
    b.floor.poly(pf, pf.map(floorUv), [c.x, 5, c.z]);
    // threshold between the reveal and the passage cove
    for (side = -1; side <= 1; side += 2) {
      var tri = [wallPoint(c, ax, side * D.PR, 0, o0)];
      for (k = 0; k <= 3; k++) {
        var pp = prof[side < 0 ? k : prof.length - 1 - k];
        tri.push(wallPoint(c, ax, pp.s, pp.y, o0));
      }
      b[wallKey].poly(tri, tri.map(function(p, n) { return [n * 0.05, p[1] / UVS]; }), wallPoint(c, ax, 0, 0.5, CH - 1));
    }
  }

  function pushLava(b, c, axis) {
    var ax = axes(axis === 'EW' ? 'E' : 'S');
    var half = 0.8, len = CH + 0.3;
    var y = 0.035;
    var inside = [c.x, EYE, c.z];
    var river = [wallPoint(c, ax, -half, y, -len), wallPoint(c, ax, half, y, -len), wallPoint(c, ax, half, y, len), wallPoint(c, ax, -half, y, len)];
    b.lava.poly(river, [[0, 0], [0.55, 0], [0.55, len * 2 / 4], [0, len * 2 / 4]], inside);
    // stone bridge slab over the river at the chamber centre
    var m = new THREE.Matrix4();
    var slab = new THREE.BoxGeometry(2.8, 0.16, 2 * half + 0.6);
    if (axis === 'EW') m.makeRotationY(Math.PI / 2);
    m.setPosition(c.x, 0.08, c.z);
    b.floor.geometry(slab, m, 0.5);
    // glowing rims beside the river
    for (var side = -1; side <= 1; side += 2) {
      var s0 = half * side, s1 = (half + 0.14) * side;
      var rim = [wallPoint(c, ax, s0, 0.045, -len), wallPoint(c, ax, s1, 0.045, -len), wallPoint(c, ax, s1, 0.045, len), wallPoint(c, ax, s0, 0.045, len)];
      b.lava.poly(rim, [[0.9, 0], [1, 0], [1, len / 2], [0.9, len / 2]], inside);
    }
  }

  function pushVines(b, c, ax, inside) {
    var n = 1 + (rnd() < 0.5 ? 1 : 0);
    var out = CH - D.ROUGH - 0.03;
    for (var i = 0; i < n; i++) {
      var s = (rnd() - 0.5) * 2.2;
      var w = 0.9 + rnd() * 0.7, h = 1.0 + rnd() * 0.9;
      var top = D.WALL_TOP - 0.1;
      var q = [wallPoint(c, ax, s - w / 2, top - h, out), wallPoint(c, ax, s + w / 2, top - h, out), wallPoint(c, ax, s + w / 2, top, out), wallPoint(c, ax, s - w / 2, top, out)];
      b.vine.poly(q, [[0, 0], [1, 0], [1, 1], [0, 1]], inside);
    }
  }

  // ---------------------------------------------------------------------------
  // Torches
  // ---------------------------------------------------------------------------
  var torchParts = null;

  function getTorchParts() {
    if (torchParts) return torchParts;
    torchParts = {
      plate: new THREE.BoxGeometry(0.16, 0.3, 0.1),
      arm: new THREE.BoxGeometry(0.06, 0.06, 0.24),
      ring: new THREE.CylinderGeometry(0.068, 0.068, 0.08, 10),
      handle: new THREE.CylinderGeometry(0.042, 0.028, 0.62, 8),
      wrap: new THREE.CylinderGeometry(0.068, 0.05, 0.17, 9),
      rivet: new THREE.SphereGeometry(0.022, 6, 4)
    };
    return torchParts;
  }

  /**
   * Torch on side `dir` at offset s. Local frame: X along the wall, Y up, Z into the room.
   * @returns {Object} flame base and light position in world space
   */
  function pushTorch(b, c, dir, s) {
    var ax = axes(dir);
    var P = getTorchParts();
    var basis = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(ax.rx, 0, ax.rz),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-ax.dx, 0, -ax.dz));
    var origin = wallPoint(c, ax, s, D.TORCH_Y, CH - D.ROUGH * 0.6);
    basis.setPosition(origin[0], origin[1], origin[2]);
    var tilt = 0.32;
    var local = new THREE.Matrix4();
    var tmp = new THREE.Matrix4();

    function place(geom, key, x, y, z, rotX, uvScale) {
      local.makeRotationX(rotX || 0);
      local.setPosition(x, y, z);
      tmp.multiplyMatrices(basis, local);
      b[key].geometry(geom, tmp, uvScale);
    }

    var ringY = -0.16, ringZ = 0.22;
    place(P.plate, 'torchIron', 0, -0.12, -0.02);
    place(P.rivet, 'torchIron', 0, -0.01, 0.04);
    place(P.rivet, 'torchIron', 0, -0.23, 0.04);
    place(P.arm, 'torchIron', 0, ringY, 0.1);
    place(P.ring, 'torchIron', 0, ringY, ringZ, tilt);
    // handle and wrap lean into the room around the ring
    function along(d) { return [0, ringY + d * Math.cos(tilt), ringZ + d * Math.sin(tilt)]; }
    var hc = along(0.1);
    place(P.handle, 'torchWood', hc[0], hc[1], hc[2], tilt, 0.25);
    var wc = along(0.36);
    place(P.wrap, 'pitch', wc[0], wc[1], wc[2], tilt);
    var fb = along(0.44);
    var v = new THREE.Vector3(fb[0], fb[1], fb[2]).applyMatrix4(basis);
    var lp = new THREE.Vector3(fb[0], fb[1] + 0.22, fb[2] + 0.18).applyMatrix4(basis);
    return { flame: [v.x, v.y, v.z], light: [lp.x, lp.y, lp.z] };
  }

  var FLAME_VERT = [
    'attribute vec2 corner;',
    'attribute vec2 offset;',
    'attribute float phase;',
    'attribute float lit;',
    'attribute float kind;',
    'uniform float fogDensity;',
    'varying vec2 vUv;',
    'varying float vPhase;',
    'varying float vLit;',
    'varying float vKind;',
    'varying float vFog;',
    'void main() {',
    '  vUv = corner; vPhase = phase; vLit = lit; vKind = kind;',
    '  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);',
    '  right = normalize(vec3(right.x, 0.0, right.z) + vec3(1e-5, 0.0, 0.0));',
    '  vec3 p = position + right * offset.x + vec3(0.0, offset.y, 0.0);',
    '  vec4 mv = viewMatrix * vec4(p, 1.0);',
    '  float fd = fogDensity * mv.z;',
    '  vFog = exp(-fd * fd);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var FLAME_FRAG = [
    'uniform float time;',
    'varying vec2 vUv;',
    'varying float vPhase;',
    'varying float vLit;',
    'varying float vKind;',
    'varying float vFog;',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}',
    '// teardrop mask: round base at y = 0.3, tapering to a tip at y = 1',
    'float drop(float x, float y, float edge) {',
    '  if (y <= 0.0 || y >= 1.0) return 0.0;',
    '  float b = 0.3;',
    '  float w = y < b ? sqrt(max(0.0, 1.0 - pow((b - y) / b, 2.0))) : pow(1.0 - (y - b) / (1.0 - b), 1.25);',
    '  float d = abs(x) / max(w, 0.001);',
    '  return 1.0 - smoothstep(1.0 - edge, 1.0, d);',
    '}',
    'void main() {',
    '  if (vLit < 0.01) discard;',
    '  float t = time + vPhase * 17.0;',
    '  if (vKind > 0.5) {',
    '    vec2 q = vUv * 2.0 - 1.0;',
    '    float g = pow(max(0.0, 1.0 - length(q)), 2.0) * (0.85 + 0.15 * sin(t * 9.0));',
    '    gl_FragColor = vec4(vec3(1.0, 0.5, 0.16) * g * 0.5 * vLit * vFog, 0.0);',
    '    return;',
    '  }',
    '  float y = vUv.y;',
    '  float n1 = vnoise(vec2(vUv.x * 3.0 + vPhase * 9.0, y * 3.0 - t * 3.4)) - 0.5;',
    '  float n2 = vnoise(vec2(vUv.x * 7.0 + 3.1, y * 6.0 - t * 5.7)) - 0.5;',
    '  float x = (vUv.x - 0.5) * 2.0;',
    '  x += (n1 * 0.7 + n2 * 0.3) * y * 1.1 + sin(t * 2.1 + y * 3.0) * 0.07 * y;',
    '  float yy = y * (1.0 + 0.12 * sin(t * 6.3) + 0.08 * n1);',
    '  float outer = drop(x / 0.92, yy, 0.14);',
    '  float mid = drop(x / 0.62, (yy + 0.02) / 0.74, 0.16);',
    '  float core = drop(x / 0.36, (yy + 0.03) / 0.45, 0.2);',
    '  vec3 col = mix(vec3(0.95, 0.28, 0.06), vec3(1.0, 0.62, 0.12), mid);',
    '  col = mix(col, vec3(1.0, 0.93, 0.62), core);',
    '  float a = outer * vLit * vFog;',
    '  if (a < 0.003) discard;',
    '  gl_FragColor = vec4(col * 1.35 * a, a);',
    '}'
  ].join('\n');

  function buildFlames() {
    if (!torchList.length) return;
    var pos = [], corner = [], offset = [], phase = [], lit = [], kind = [], idx = [];
    var QUAD = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (var i = 0; i < torchList.length; i++) {
      var t = torchList[i];
      // glow first (behind), then flame
      var layers = [
        { kind: 1, w: 1.5, h: 1.5, y0: -0.5 },
        { kind: 0, w: 0.3, h: 0.55, y0: -0.08 }
      ];
      for (var l = 0; l < layers.length; l++) {
        var L = layers[l];
        var base = pos.length / 3;
        for (var k = 0; k < 4; k++) {
          pos.push(t.fx, t.fy, t.fz);
          corner.push(QUAD[k][0], QUAD[k][1]);
          var oy = L.kind ? (QUAD[k][1] - 0.5) * L.h + 0.2 : L.y0 + QUAD[k][1] * L.h;
          offset.push((QUAD[k][0] - 0.5) * L.w, oy);
          phase.push(t.phase);
          lit.push(0);
          kind.push(L.kind);
        }
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('corner', new THREE.Float32BufferAttribute(corner, 2));
    g.setAttribute('offset', new THREE.Float32BufferAttribute(offset, 2));
    g.setAttribute('phase', new THREE.Float32BufferAttribute(phase, 1));
    g.setAttribute('lit', new THREE.Float32BufferAttribute(lit, 1));
    g.setAttribute('kind', new THREE.Float32BufferAttribute(kind, 1));
    g.setIndex(idx);
    if (!flameMaterial) {
      flameMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, fogDensity: { value: FOG_DENSITY } },
        vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG,
        transparent: true, depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor
      });
    }
    flameMesh = new THREE.Mesh(g, flameMaterial);
    flameMesh.frustumCulled = false;
    flameMesh.renderOrder = 5;
    scene.add(flameMesh);
  }

  function updateFlameLit() {
    if (!flameMesh) return;
    var attr = flameMesh.geometry.getAttribute('lit');
    for (var i = 0; i < torchList.length; i++) {
      var bb = brightness[torchList[i].cellId];
      var v = bb ? Math.min(1, bb.cur * 1.6) : 0;
      for (var k = 0; k < 8; k++) attr.array[i * 8 + k] = v;
    }
    attr.needsUpdate = true;
  }

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------
  var propParts = null;

  function getPropParts() {
    if (propParts) return propParts;
    var prof = [];
    for (var i = 0; i <= 8; i++) {
      var t = i / 8;
      prof.push(new THREE.Vector2(0.3 + 0.05 * Math.sin(t * Math.PI), t * 0.82));
    }
    propParts = {
      barrel: new THREE.LatheGeometry(prof, 14),
      lid: new THREE.CircleGeometry(0.3, 14),
      hoop: new THREE.TorusGeometry(0.34, 0.018, 4, 18),
      crate: new THREE.BoxGeometry(0.72, 0.72, 0.72),
      crateSmall: new THREE.BoxGeometry(0.46, 0.46, 0.46),
      rock: new THREE.IcosahedronGeometry(0.2, 0)
    };
    return propParts;
  }

  function pushProp(b, c, prop, wallKey) {
    var P = getPropParts();
    var m = new THREE.Matrix4();
    var r = new THREE.Matrix4();
    var s = new THREE.Matrix4();
    var x = c.x + prop.x, z = c.z + prop.z;
    if (prop.kind === 'barrel') {
      m.makeRotationY(prop.rot); m.setPosition(x, 0, z);
      b.wood.geometry(P.barrel, m, 1.2);
      r.makeRotationX(-Math.PI / 2); r.setPosition(x, 0.82, z);
      b.wood.geometry(P.lid, r, 1.2);
      for (var h = 0; h < 2; h++) {
        r.makeRotationX(Math.PI / 2); r.setPosition(x, 0.16 + h * 0.5, z);
        b.iron.geometry(P.hoop, r);
      }
    } else if (prop.kind === 'crate') {
      m.makeRotationY(prop.rot); m.setPosition(x, 0.36, z);
      b.wood.geometry(P.crate, m, 0.55, true);
      if (prop.rot > Math.PI) {
        m.makeRotationY(prop.rot * 1.7); m.setPosition(x + 0.05, 0.95, z - 0.04);
        b.wood.geometry(P.crateSmall, m, 0.36, true);
      }
    } else {
      for (var k = 0; k < 6; k++) {
        var a = prop.rot + k * 1.9;
        var rr = k === 0 ? 0 : 0.18 + 0.1 * (k % 3);
        var sc = k === 0 ? 1.6 : 0.7 + 0.25 * ((k * 7) % 3);
        r.makeRotationFromEuler(new THREE.Euler(a, a * 0.7, a * 1.3));
        s.makeScale(sc, sc * 0.75, sc);
        m.multiplyMatrices(r, s);
        m.setPosition(x + Math.cos(a) * rr, 0.1 * sc, z + Math.sin(a) * rr);
        b[wallKey].geometry(P.rock, m, 0.4);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Materials
  // ---------------------------------------------------------------------------
  function disposeMaterials() {
    Object.keys(materials).forEach(function(k) {
      if (materials[k] && materials[k].dispose) materials[k].dispose();
    });
    materials = {};
  }

  function std(surface, opts) {
    var m = new THREE.MeshStandardMaterial({
      map: surface.map,
      color: opts.color || 0xffffff,
      roughness: typeof opts.roughness === 'number' ? opts.roughness : 0.9,
      metalness: 0,
      vertexColors: true
    });
    if (quality.normalMaps && surface.normalMap) {
      m.normalMap = surface.normalMap;
      m.normalScale.set(opts.normal || 1, opts.normal || 1);
    }
    return m;
  }

  function makeMaterials(tex) {
    disposeMaterials();
    materials.wall = std(tex.wall, { roughness: 0.92, normal: 1.3 });
    materials.moss = std(tex.moss, { roughness: 0.9, normal: 1.2 });
    materials.floor = std(tex.floor, { roughness: 0.78, normal: 1.1 });
    materials.ceiling = std(tex.ceiling, { roughness: 0.95, normal: 1.0, color: 0xd8d2d8 });
    materials.wood = std(tex.wood, { roughness: 0.85, normal: 1.0, color: 0xa89484 });
    materials.iron = new THREE.MeshStandardMaterial({ color: 0x3c3a3e, roughness: 0.5, metalness: 0.55, vertexColors: true });
    materials.pitch = new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 1, emissive: 0x3a1204, vertexColors: true });
    materials.lava = new THREE.MeshBasicMaterial({ map: tex.lava, vertexColors: true, fog: true });
    materials.vine = new THREE.MeshStandardMaterial({ map: tex.vine, vertexColors: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 });
  }

  // torch parts do not cast: the light sits right in front of them
  var CAST = { wall: true, moss: true, floor: true, ceiling: true, wood: true, iron: true, torchIron: false, torchWood: false, trim: false, pitch: false, lava: false, vine: false };
  var RECEIVE = { lava: false };

  // ---------------------------------------------------------------------------
  // Scene
  // ---------------------------------------------------------------------------
  function disposeScene() {
    Object.keys(cells).forEach(function(id) {
      var cd = cells[id];
      scene.remove(cd.group);
      for (var i = 0; i < cd.meshes.length; i++) cd.meshes[i].geometry.dispose();
    });
    cells = {};
    Object.keys(entities).forEach(removeEntity);
    if (flameMesh) { scene.remove(flameMesh); flameMesh.geometry.dispose(); flameMesh = null; }
    if (gateRune) { scene.remove(gateRune); gateRune.material.dispose(); gateRune = null; }
    lavaCells = {}; torchList = [];
    gateBars = null; gateHost = null;
  }

  /**
   * Build all static geometry for a world
   */
  function buildScene(w, tex) {
    world = w;
    if (!renderer) return;
    var prevBright = brightness;
    disposeScene();
    brightness = {};
    seedRnd = 7;
    if (tex) textures = tex;
    if (!textures) return;
    makeMaterials(textures);

    var ids = Object.keys(w.cells);
    var bossHost = null;
    var keys = ['wall', 'moss', 'floor', 'ceiling', 'trim', 'lava', 'iron', 'wood', 'torchIron', 'torchWood', 'pitch', 'vine'];
    var MAT = { torchIron: 'iron', torchWood: 'wood', trim: 'wall' };

    for (var n = 0; n < ids.length; n++) {
      var cell = w.cells[ids[n]];
      var c = cellCenter(cell);
      var inside = [c.x, EYE, c.z];
      var b = {};
      keys.forEach(function(k) { b[k] = new Builder(); });
      var wallKey = (FpLayout.hashCell(cell.x, cell.y, 3) < 0.4) ? 'moss' : 'wall';

      pushShell(b, cell, c, wallKey);
      var lava = FpLayout.lavaAxis(cell);
      if (lava) { lavaCells[cell.id] = true; pushLava(b, c, lava); }

      for (var d = 0; d < 4; d++) {
        var dir = FpLayout.DIRS[d];
        if (cell.walls[dir]) continue;
        var ax = axes(dir);
        pushDoorway(b, c, ax, wallKey);
        if (rnd() < 0.6) pushVines(b, c, ax, inside);
        if (cell.portal && cell.portal.dir === dir && cell.type !== 'boss') {
          bossHost = { cell: cell, ax: ax, c: c };
        }
      }

      var spots = FpLayout.torchSpots(cell, D);
      for (var t = 0; t < spots.length; t++) {
        var tp = pushTorch(b, c, spots[t].dir, spots[t].s);
        torchList.push({ cellId: cell.id, x: tp.light[0], y: tp.light[1], z: tp.light[2], fx: tp.flame[0], fy: tp.flame[1], fz: tp.flame[2], phase: rnd() });
      }

      if (quality.props) {
        var props = FpLayout.propSpots(cell, D);
        for (var p = 0; p < props.length; p++) pushProp(b, c, props[p], wallKey);
      }

      var group = new THREE.Group();
      var cd = { group: group, meshes: [], x: c.x, z: c.z };
      keys.forEach(function(k) {
        if (b[k].empty()) return;
        var mesh = new THREE.Mesh(b[k].toGeometry(), materials[MAT[k] || k]);
        mesh.castShadow = !!CAST[k];
        mesh.receiveShadow = RECEIVE[k] !== false;
        group.add(mesh);
        cd.meshes.push(mesh);
      });
      group.visible = false;
      scene.add(group);
      cells[cell.id] = cd;
      var pb = prevBright[cell.id];
      brightness[cell.id] = pb ? { cur: pb.cur, target: pb.target } : { cur: 0, target: 0 };
      if (pb && pb.cur > 0) { applyBrightness(cell.id, pb.cur); }
      if (pb && pb.cur !== pb.target) brightening = true;
    }

    // dragon gate bars on the boss host chamber
    if (bossHost) {
      var gb = new Builder();
      var bar = new THREE.CylinderGeometry(0.045, 0.045, 1, 8);
      var m = new THREE.Matrix4(), sc = new THREE.Matrix4();
      var depth = CH + D.SPLAY + 0.06;
      for (var i = -2; i <= 2; i++) {
        var s = i * 0.46;
        var top = FpLayout.archHeight(s, D.PR, D) + 0.05;
        sc.makeScale(1, top, 1);
        var bp = wallPoint(bossHost.c, bossHost.ax, s, top / 2, depth);
        m.makeTranslation(bp[0], bp[1], bp[2]);
        m.multiply(sc);
        gb.geometry(bar, m);
      }
      for (var yb = 0.8; yb < D.PH + 0.2; yb += 1.05) {
        var hp = wallPoint(bossHost.c, bossHost.ax, 0, yb, depth + 0.05);
        var rot = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
        if (bossHost.ax.rz !== 0) rot = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        sc.makeScale(1, 2 * D.PR, 1);
        m.makeTranslation(hp[0], hp[1], hp[2]);
        m.multiply(rot).multiply(sc);
        gb.geometry(bar, m);
      }
      gateBars = new THREE.Mesh(gb.toGeometry(), materials.iron);
      gateBars.castShadow = true;
      gateBars.receiveShadow = true;
      var hostCd = cells[bossHost.cell.id];
      hostCd.group.add(gateBars);
      hostCd.meshes.push(gateBars);
      gateHost = bossHost;
      applyBrightness(bossHost.cell.id, brightness[bossHost.cell.id].cur);
    }

    buildFlames();
    updateFlameLit();

    // rune glow above the gate
    if (gateHost && textures.rune) {
      var rm = new THREE.SpriteMaterial({ map: textures.rune, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
      gateRune = new THREE.Sprite(rm);
      var gp = wallPoint(gateHost.c, gateHost.ax, 0, D.PH + D.PR + D.SPLAY + 0.2, CH - 0.12);
      gateRune.position.set(gp[0], gp[1], gp[2]);
      gateRune.scale.set(1.0, 1.0, 1);
      scene.add(gateRune);
      var gl = wallPoint(gateHost.c, gateHost.ax, 0, 2.2, CH - 1.2);
      gateLight.position.set(gl[0], gl[1], gl[2]);
    }

    refreshGroups(true);
    assignLights();
    startLoop();
    dirty = true;
  }

  /** Rebuild everything for the current quality tier and world */
  function rebuild() {
    if (!renderer || !world) return;
    setupLights();
    buildScene(world, textures);
    resize();
    if (rebuildHook) rebuildHook();
  }

  // ---------------------------------------------------------------------------
  // Fog of war (per-cell brightness)
  // ---------------------------------------------------------------------------
  function applyBrightness(cellId, v) {
    var cd = cells[cellId];
    if (!cd) return;
    for (var i = 0; i < cd.meshes.length; i++) {
      var attr = cd.meshes[i].geometry.getAttribute('color');
      if (!attr) continue;
      attr.array.fill(v);
      attr.needsUpdate = true;
    }
  }

  /** Show chambers that are lit and near enough; flag shadows when nearby visibility changes */
  function refreshGroups(force) {
    var cx = camera.position.x, cz = camera.position.z;
    Object.keys(cells).forEach(function(id) {
      var cd = cells[id];
      var b = brightness[id];
      var dx = cd.x - cx, dz = cd.z - cz;
      var dist = Math.sqrt(dx * dx + dz * dz);
      var vis = !!(b && b.cur > 0.001) && dist < CULL_DIST;
      if (cd.group.visible !== vis || force) {
        cd.group.visible = vis;
        if (dist < CELL * 2.2) shadowDirty = true;
      }
    });
  }

  /**
   * Set brightness targets: explored chambers full, chambers seen through a
   * doorway dim, everything else black
   */
  function setVisibility(exploredIds, seenIds) {
    var explored = {}, seen = {};
    for (var i = 0; i < exploredIds.length; i++) explored[exploredIds[i]] = true;
    for (i = 0; i < seenIds.length; i++) seen[seenIds[i]] = true;
    var changed = false;
    Object.keys(brightness).forEach(function(id) {
      var t = explored[id] ? 1 : (seen[id] ? SEEN_LEVEL : 0);
      if (brightness[id].target !== t) {
        brightness[id].target = t;
        brightening = true;
        changed = true;
      }
      if (reducedMotion && brightness[id].cur !== t) {
        brightness[id].cur = t;
        applyBrightness(id, t);
      }
    });
    if (reducedMotion) { updateFlameLit(); refreshGroups(false); }
    if (gateHost) {
      var g = brightness[gateHost.cell.id];
      gateLight.visible = !!(g && g.target > 0);
    }
    if (changed) assignLights();
    dirty = true;
    startLoop();
  }

  function stepBrightness(dt) {
    if (!brightening) return;
    var still = false;
    var ids = Object.keys(brightness);
    for (var i = 0; i < ids.length; i++) {
      var b = brightness[ids[i]];
      if (b.cur === b.target) continue;
      var d = b.target - b.cur;
      var step = dt / 0.55;
      if (Math.abs(d) <= step) b.cur = b.target; else b.cur += (d > 0 ? 1 : -1) * step;
      applyBrightness(ids[i], b.cur);
      if (b.cur !== b.target) still = true;
    }
    brightening = still;
    updateFlameLit();
    refreshGroups(false);
    if (gateRune) gateRune.material.opacity = brightness[gateHost.cell.id].cur;
    dirty = true;
  }

  function cellBrightness(id) { return brightness[id] ? brightness[id].cur : 0; }
  function hasLava(id) { return !!lavaCells[id]; }
  function gateRoomId() { return gateHost ? gateHost.cell.id : null; }

  // ---------------------------------------------------------------------------
  // Lights
  // ---------------------------------------------------------------------------
  /** Point the light pool at the torches around the focus chamber */
  function assignLights() {
    if (!world || !torchLights.length) return;
    var focus = focusId && world.cells[focusId] ? cellCenter(world.cells[focusId]) : { x: pose.x, z: pose.z };
    var chosen = FpLayout.assignLights(torchList, {
      focusId: focusId, px: focus.x, pz: focus.z,
      count: torchLights.length, shadowCount: quality.shadowLights,
      isLit: function(id) { return !!(brightness[id] && (brightness[id].target > 0 || brightness[id].cur > 0)); }
    });
    for (var i = 0; i < torchLights.length; i++) {
      var idx = typeof chosen[i] === 'number' ? chosen[i] : -1;
      if (lightSlots[i] === idx) continue;
      lightSlots[i] = idx;
      var L = torchLights[i];
      if (idx < 0) {
        L.position.set(0, -50, 0);
        L.intensity = 0;
      } else {
        L.position.set(torchList[idx].x, torchList[idx].y, torchList[idx].z);
      }
      if (L.castShadow) shadowDirty = true;
    }
    dirty = true;
  }

  function updateLights(t) {
    if (!world) return;
    for (var i = 0; i < torchLights.length; i++) {
      var idx = lightSlots[i];
      if (idx < 0) { torchLights[i].intensity = 0; continue; }
      var torch = torchList[idx];
      torchLights[i].intensity = TORCH_INTENSITY * cellBrightness(torch.cellId) * FpLayout.flicker(t, torch.phase);
    }
    var lava = [];
    Object.keys(lavaCells).forEach(function(id) {
      var b = cellBrightness(id);
      if (b <= 0.01) return;
      var c = cellCenter(world.cells[id]);
      var dx = c.x - pose.x, dz = c.z - pose.z;
      lava.push({ x: c.x, z: c.z, b: b, d: dx * dx + dz * dz });
    });
    lava.sort(function(a, b) { return a.d - b.d; });
    for (i = 0; i < lavaLights.length; i++) {
      var LL = lavaLights[i], le = lava[i];
      if (!le) { LL.intensity = 0; continue; }
      LL.position.set(le.x, 0.7, le.z);
      LL.intensity = 16 * le.b * (0.85 + 0.15 * Math.sin(t * 3 + i));
    }
    if (gateHost) gateLight.intensity = gateLight.visible ? 14 * cellBrightness(gateHost.cell.id) * (0.85 + 0.15 * Math.sin(t * 2.3)) : 0;
  }

  // ---------------------------------------------------------------------------
  // Camera pose and tweens
  // ---------------------------------------------------------------------------
  var BACK = 2.1; // camera stands this far behind the chamber centre, looking across it

  function applyPose() {
    if (!camera) return;
    var y = rad(pose.yaw);
    var fx = -Math.sin(y), fz = -Math.cos(y);
    camera.position.set(pose.x - fx * BACK, EYE + bob, pose.z - fz * BACK);
    camera.rotation.set(0, y, 0);
    dirty = true;
  }

  function setFocus(roomId) {
    if (focusId === roomId) return;
    focusId = roomId;
    assignLights();
  }

  function setPose(roomId, facing) {
    var cell = world && world.cells[roomId];
    if (!cell) return;
    var c = cellCenter(cell);
    pose.x = c.x; pose.z = c.z; pose.yaw = FpWorld.YAW[facing];
    tween = null; bob = 0;
    applyPose();
    setFocus(roomId);
    if (camera) refreshGroups(false);
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }

  function shortestYaw(from, to) {
    var d = ((to - from) % 360 + 540) % 360 - 180;
    return from + d;
  }

  function startTween(target, ms, ease, done, bobbing) {
    if (reducedMotion) ms = 0;
    var from = { x: pose.x, z: pose.z, yaw: pose.yaw };
    var to = { x: target.x, z: target.z, yaw: shortestYaw(pose.yaw, target.yaw) };
    if (ms === 0 || !renderer) {
      pose.x = to.x; pose.z = to.z; pose.yaw = target.yaw; bob = 0;
      applyPose();
      tween = null;
      setTimeout(done, 0);
      return;
    }
    tween = { from: from, to: to, start: performance.now(), ms: ms, ease: ease, done: done, finalYaw: target.yaw, bobbing: !!bobbing };
    startLoop();
  }

  function stepTween(now) {
    var t = Math.min(1, (now - tween.start) / tween.ms);
    var e = tween.ease(t);
    pose.x = tween.from.x + (tween.to.x - tween.from.x) * e;
    pose.z = tween.from.z + (tween.to.z - tween.from.z) * e;
    pose.yaw = tween.from.yaw + (tween.to.yaw - tween.from.yaw) * e;
    bob = tween.bobbing ? Math.sin(t * Math.PI * 2) * 0.07 : 0;
    applyPose();
    if (t >= 1) {
      pose.yaw = tween.finalYaw; bob = 0;
      applyPose();
      var cb = tween.done;
      tween = null;
      if (cb) cb();
    }
  }

  function animateStep(toId, facing, ms, done) {
    var c = cellCenter(world.cells[toId]);
    setFocus(toId);
    startTween({ x: c.x, z: c.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 520, easeInOut, done, true);
  }

  function animateTurn(facing, ms, done) {
    startTween({ x: pose.x, z: pose.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 240, easeInOut, done);
  }

  function animateKnockback(toId, facing, ms, done) {
    var c = cellCenter(world.cells[toId]);
    pose.yaw = FpWorld.YAW[facing];
    setFocus(toId);
    startTween({ x: c.x, z: c.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 520, easeOut, done, true);
  }

  function animateTeleport(toId, facing, done) {
    var fade = document.getElementById('fp-fade');
    if (!fade || reducedMotion || !renderer) {
      setPose(toId, facing);
      setTimeout(done, 0);
      return;
    }
    fade.classList.add('active');
    setTimeout(function() {
      setPose(toId, facing);
      render();
      fade.classList.remove('active');
      setTimeout(done, 200);
    }, 220);
  }

  function animateBump(done) {
    var f = FpWorld.getFacing();
    var d = FpWorld.DELTA[f];
    var origin = { x: pose.x, z: pose.z, yaw: pose.yaw };
    startTween({ x: pose.x + d[0] * 0.35, z: pose.z + d[1] * 0.35, yaw: pose.yaw }, 90, easeOut, function() {
      startTween(origin, 130, easeOut, done);
    });
  }

  function isBusy() { return !!tween; }

  /** Hide the gate bars once the player walks through */
  function openGate() {
    if (gateBars) { gateBars.visible = false; dirty = true; shadowDirty = true; }
  }

  // ---------------------------------------------------------------------------
  // Entities (billboards)
  // ---------------------------------------------------------------------------
  var HEIGHTS = { monster: 3.0, dragon: 5.4, treasure: 1.6 };
  var blobTexture = null;

  function getBlobTexture() {
    if (blobTexture) return blobTexture;
    var c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(0,0,0,0.75)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.4)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    blobTexture = new THREE.CanvasTexture(c);
    return blobTexture;
  }

  /**
   * Place a billboard in a chamber, at the far side seen from `fromDir`
   * (the direction the player is facing when entering); fades in over `fadeMs`.
   * An invisible cutout plane facing the player casts the torch shadow.
   */
  function setEntity(roomId, info) {
    if (!world || !world.cells[roomId] || !renderer) return;
    removeEntity(roomId);
    var kind = info.kind || 'monster';
    var h = HEIGHTS[kind] || HEIGHTS.monster;
    var c = cellCenter(world.cells[roomId]);
    var ax = axes(info.fromDir || 'N');
    var dist = kind === 'treasure' ? CH * 0.45 : CH * 0.5;
    var mat = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.05, fog: true, opacity: info.fadeMs ? 0 : 1 });
    var sprite = new THREE.Sprite(mat);
    sprite.visible = false;
    var px = c.x + ax.dx * dist, pz = c.z + ax.dz * dist;
    sprite.position.set(px, h / 2 + 0.02, pz);
    scene.add(sprite);
    var entry = { sprite: sprite, imageId: info.imageId, ready: false, extras: [] };
    entities[roomId] = entry;
    FpTextures.billboard(info.imageId).then(function(b) {
      if (entities[roomId] !== entry) return;
      mat.map = b.texture;
      mat.needsUpdate = true;
      var w = h * b.aspect;
      sprite.scale.set(w, h, 1);
      sprite.position.y = h / 2 + 0.02;
      entry.ready = true;
      sprite.visible = true;

      // contact shadow
      var blobMat = new THREE.MeshBasicMaterial({ map: getBlobTexture(), transparent: true, depthWrite: false, opacity: info.fadeMs ? 0 : 1, polygonOffset: true, polygonOffsetFactor: -2 });
      var blob = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, Math.min(2.4, w * 0.5)), blobMat);
      blob.rotation.x = -Math.PI / 2;
      blob.position.set(px, 0.03, pz);
      scene.add(blob);
      entry.extras.push(blob);

      // shadow caster: cutout plane facing back toward the entrance
      if (quality.shadowLights > 0) {
        // the shadow pass copies map + alphaTest from this material, so the cutout shape is kept
        var casterMat = new THREE.MeshBasicMaterial({ map: b.texture, alphaTest: 0.5, colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
        var caster = new THREE.Mesh(new THREE.PlaneGeometry(w, h), casterMat);
        caster.castShadow = true;
        caster.position.set(px, h / 2 + 0.02, pz);
        caster.rotation.y = Math.atan2(-ax.dx, -ax.dz);
        scene.add(caster);
        entry.extras.push(caster);
        shadowDirty = true;
      }

      if (info.fadeMs && !reducedMotion) {
        fades.push({ mat: mat, from: 0, to: 1, start: performance.now(), ms: info.fadeMs });
        fades.push({ mat: blobMat, from: 0, to: 1, start: performance.now(), ms: info.fadeMs });
        startLoop();
      } else {
        mat.opacity = 1;
        blobMat.opacity = 1;
      }
      dirty = true;
    });
  }

  function removeEntity(roomId) {
    var e = entities[roomId];
    if (!e) return;
    scene.remove(e.sprite);
    e.sprite.material.dispose();
    for (var i = 0; i < e.extras.length; i++) {
      scene.remove(e.extras[i]);
      e.extras[i].geometry.dispose();
      e.extras[i].material.dispose();
      if (e.extras[i].castShadow) shadowDirty = true;
    }
    delete entities[roomId];
    dirty = true;
  }

  function hideEntity(roomId, hidden) {
    var e = entities[roomId];
    if (!e) return;
    e.sprite.visible = e.ready && !hidden;
    for (var i = 0; i < e.extras.length; i++) e.extras[i].visible = e.ready && !hidden;
    shadowDirty = true;
    dirty = true;
  }

  function hasEntity(roomId) { return !!entities[roomId]; }

  function stepFades(now) {
    for (var i = fades.length - 1; i >= 0; i--) {
      var f = fades[i];
      var t = Math.min(1, (now - f.start) / f.ms);
      f.mat.opacity = f.from + (f.to - f.from) * easeOut(t);
      if (t >= 1) fades.splice(i, 1);
    }
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------------------
  function render() {
    if (!renderer) return;
    if (shadowDirty && renderer.shadowMap.enabled) {
      renderer.shadowMap.needsUpdate = true;
    }
    shadowDirty = false;
    renderer.render(scene, camera);
    dirty = false;
  }

  function frame(now) {
    rafId = null;
    if (!running) return;
    var dtMs = lastNow ? now - lastNow : 16;
    var dt = Math.min(0.5, dtMs / 1000);
    lastNow = now;
    clock += dt;
    if (tween) stepTween(now);
    if (fades.length) stepFades(now);
    if (brightening) stepBrightness(dt);
    if (tween) refreshGroups(false);
    if (animated || tween || fades.length || brightening) {
      if (flameMaterial) flameMaterial.uniforms.time.value = clock;
      if (materials.lava && materials.lava.map) { materials.lava.map.offset.y = (clock * 0.05) % 1; materials.lava.map.offset.x = Math.sin(clock * 0.4) * 0.02; }
      updateLights(clock);
      dirty = true;
    }
    var hadShadowWork = shadowDirty;
    if (dirty) render();
    if (animated && !hadShadowWork && monitor && !qualityLocked && monitor.sample(dtMs)) {
      var next = FpQuality.lower(quality.tier);
      if (next) {
        console.warn('FpRenderer: slow frames, quality ' + quality.tier + ' -> ' + next);
        storeTier(next);
        quality = FpQuality.settings(next);
        monitor.reset();
        rebuild();
      }
    }
    if (running && (animated || tween || fades.length || brightening)) rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (rafId !== null || !running) return;
    lastNow = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resume() { if (!renderer) return; running = true; animated = !reducedMotion; dirty = true; if (monitor) monitor.reset(); startLoop(); }
  function pause() { animated = false; }
  function stop() { running = false; animated = false; stopLoop(); }

  /**
   * Switch quality tier at runtime (persisted); rebuilds the scene
   */
  function setQuality(tier) {
    if (FpQuality.TIERS.indexOf(tier) === -1 || !renderer) return;
    storeTier(tier);
    qualityLocked = true;
    quality = FpQuality.settings(tier);
    rebuild();
  }

  function onRebuild(fn) { rebuildHook = fn; }

  function getPose() { return { x: pose.x, z: pose.z, yaw: pose.yaw, camX: camera ? camera.position.x : pose.x, camZ: camera ? camera.position.z : pose.z }; }
  function getRenderInfo() { return renderer ? renderer.info.render : null; }
  function getQuality() { return quality ? quality.tier : null; }
  function getLightInfo() {
    return {
      torches: torchList.length,
      slots: lightSlots.slice(),
      shadowCasters: quality ? quality.shadowLights : 0,
      focus: focusId
    };
  }
  function markDirty() { dirty = true; startLoop(); }

  /**
   * Debug/tuning helper (screenshots): override light levels at runtime
   * @param {Object} o - { exposure, hemi, head, torch, tone: 'agx'|'aces'|'neutral' }
   */
  function tune(o) {
    if (!renderer || !o) return;
    if (typeof o.exposure === 'number') renderer.toneMappingExposure = o.exposure;
    if (typeof o.hemi === 'number') hemi.intensity = o.hemi;
    if (typeof o.head === 'number') headLight.intensity = o.head;
    if (typeof o.torch === 'number') TORCH_INTENSITY = o.torch;
    var tones = { agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping };
    if (o.tone && tones[o.tone] !== undefined) {
      renderer.toneMapping = tones[o.tone];
      Object.keys(materials).forEach(function(k) { if (materials[k]) materials[k].needsUpdate = true; });
    }
    updateLights(clock);
    markDirty();
  }

  return {
    CELL: CELL,
    init: init,
    resize: resize,
    buildScene: buildScene,
    setVisibility: setVisibility,
    cellBrightness: cellBrightness,
    hasLava: hasLava,
    gateRoomId: gateRoomId,
    setPose: setPose,
    animateStep: animateStep,
    animateTurn: animateTurn,
    animateKnockback: animateKnockback,
    animateTeleport: animateTeleport,
    animateBump: animateBump,
    isBusy: isBusy,
    openGate: openGate,
    setEntity: setEntity,
    removeEntity: removeEntity,
    hideEntity: hideEntity,
    hasEntity: hasEntity,
    render: render,
    resume: resume,
    pause: pause,
    stop: stop,
    markDirty: markDirty,
    tune: tune,
    setQuality: setQuality,
    onRebuild: onRebuild,
    getQuality: getQuality,
    getLightInfo: getLightInfo,
    getPose: getPose,
    getRenderInfo: getRenderInfo
  };
})();
