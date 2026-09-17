/**
 * FpRenderer
 * three.js scene for the first-person prototype. Every dungeon room is a
 * softened stone chamber (FpLayout): rounded corners, a cove where the floor
 * meets the slightly uneven walls, an elliptical cloister vault, and arched
 * doorways with rounded reveals leading into coved, barrel-vaulted passages.
 *
 * Dressing: organic lava rivers (crust + heat glow), water trickling from wall
 * cracks into reflective puddles, glowing rune inscriptions, doorway frames
 * (arch stones, timber, pillars), wooden doors that swing open, and floor
 * props from FpProps (rubble, statues, skeletons, armour, columns, barrels).
 *
 * Lighting: wall torches (iron bracket, wooden handle, pitch wrap, soot plume
 * and an animated shader flame) are the real light sources. They stay dark
 * until their chamber is entered, then catch one after another; the light
 * pool slots fade out/in when they move so nothing pops. A pool of point lights
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
  var TORCH_INTENSITY = 50;
  var TORCH_RANGE = 14;
  var CULL_DIST = 36;
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
  // Camera: 'first' (eyes) or 'third' (over Mr Owl's shoulder, FpOwl)
  var viewMode = 'first';
  var owl = null;            // FpOwl controller once the model has loaded
  var owlShadowClock = 0;    // throttles shadow-map refreshes while the owl animates
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
  function storeTier(t) {
    try { window.localStorage.setItem(QUALITY_KEY, t); } catch (e) { /* private mode */ }
  }

  function chooseQuality(override) {
    // Always high quality (no in-game switch, no automatic step-down);
    // ?quality=low|medium remains for debugging
    var tier = FpQuality.TIERS.indexOf(override) !== -1 ? override : 'high';
    qualityLocked = true;
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
    renderer.toneMappingExposure = 1.15;
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

    viewMode = FpOwl.isMode(opts.viewMode) ? opts.viewMode : FpOwl.storedMode();
    FpOwl.load().then(function(gltf) {
      if (!gltf || !scene) return;
      owl = FpOwl.create(gltf, { castShadow: quality.shadowLights > 0 });
      scene.add(owl.object);
      owl.setVisible(viewMode === 'third');
      applyPose();
      shadowDirty = true;
      startLoop();
    });

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
    if (mirror) { mirror.target.dispose(); mirror = null; }
    var mirrorScale = quality.tier === 'high' ? 0.5 : (quality.tier === 'medium' ? 0.33 : 0);
    if (mirrorScale) {
      mirror = {
        target: new THREE.WebGLRenderTarget(256, 256, { generateMipmaps: false }),
        camera: new THREE.PerspectiveCamera(),
        textureMatrix: new THREE.Matrix4(),
        scale: mirrorScale
      };
      resizeMirror();
    }
    for (i = 0; i < lavaLights.length; i++) { scene.remove(lavaLights[i]); lavaLights[i].dispose(); }
    lavaLights = [];
    for (i = 0; i < quality.lavaLights; i++) {
      var ll = new THREE.PointLight(0xff5a1a, 0, CELL * 1.1, 2);
      scene.add(ll);
      lavaLights.push(ll);
    }
    if (quality.headLight && !headLight.parent) camera.add(headLight);
    if (!quality.headLight && headLight.parent) camera.remove(headLight);
    hemi.intensity = quality.headLight ? 0.32 : 0.42;
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
      lightSlots.push({ torch: -1, pending: -1, fade: 0 });
    }
    renderer.shadowMap.enabled = quality.shadowLights > 0;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
    if (owl) owl.setCastShadow(quality.shadowLights > 0);
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
    if (viewMode === 'third') applyPose();
    resizeMirror();
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Geometry builder (positions, normals, uvs, per-vertex fog-of-war colour)
  // ---------------------------------------------------------------------------
  function Builder() {
    this.pos = []; this.norm = []; this.uv = []; this.idx = []; this.uv1 = [];
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
    if (this.uv1.length) g.setAttribute('uv1', new THREE.Float32BufferAttribute(this.uv1, 2));
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

  /** Rounded reveal around an opening, jamb caps over the cove, passage to the cell edge, optional frame */
  function pushDoorway(b, c, ax, wallKey, style, seed) {
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

    // doorway treatment in a right-handed frame: X along the wall, Y up, Z into the room
    if (style && style !== 'plain') {
      var frame = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(ax.rx, 0, ax.rz), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-ax.dx, 0, -ax.dz));
      var fo = wallPoint(c, ax, 0, 0, CH - D.ROUGH);
      frame.setPosition(fo[0], fo[1], fo[2]);
      if (style === 'voussoir') FpProps.voussoirs(b, frame, J, D.PH, seed);
      else if (style === 'timber') FpProps.timberFrame(b, frame, J, D.PH + J + 0.08, seed);
      else if (style === 'pillars') FpProps.pillars(b, frame, J, D.WALL_TOP - 0.02, seed);
    }
  }

  /**
   * Lava river with meandering, irregular banks: molten core, a raised dark
   * crust along each bank and an additive heat glow spilling onto the floor
   */
  function pushLava(b, c, axis, seed) {
    var ax = axes(axis === 'EW' ? 'E' : 'S');
    var len = CH + 0.3, SEG = 22;
    var Y = 0.03;
    var rows = FpLayout.riverBanks(len, 0.8, SEG, seed);
    var up = [c.x, 5, c.z];
    var i, k;
    for (i = 0; i < SEG; i++) {
      var r0 = rows[i], r1 = rows[i + 1];
      var q = [wallPoint(c, ax, r0.left, Y, r0.t), wallPoint(c, ax, r0.right, Y, r0.t), wallPoint(c, ax, r1.right, Y, r1.t), wallPoint(c, ax, r1.left, Y, r1.t)];
      b.lava.poly(q, [[r0.left / 2.2, r0.t / 4], [r0.right / 2.2, r0.t / 4], [r1.right / 2.2, r1.t / 4], [r1.left / 2.2, r1.t / 4]], up);
    }
    for (var side = -1; side <= 1; side += 2) {
      // crust: inner lip at the lava, rounded top, outer foot on the floor
      var PROFILE = [[0, Y], [0.3, 0.075], [0.65, 0.085], [1, 0.012]];
      var pts = [], uvs = [];
      for (i = 0; i <= SEG; i++) {
        var row = [], urow = [];
        var bank = side < 0 ? rows[i].left : rows[i].right;
        for (k = 0; k < PROFILE.length; k++) {
          var off = bank + side * PROFILE[k][0] * rows[i].crust;
          row.push(wallPoint(c, ax, off, PROFILE[k][1], rows[i].t));
          urow.push([off / 1.5, rows[i].t / 1.5]);
        }
        pts.push(row);
        uvs.push(urow);
      }
      b.crust.grid(pts, uvs, up, false);
      for (i = 0; i < SEG; i++) {
        var a0 = side < 0 ? rows[i].left : rows[i].right, a1 = side < 0 ? rows[i + 1].left : rows[i + 1].right;
        var g0 = a0 + side * rows[i].glow, g1 = a1 + side * rows[i + 1].glow;
        var gq = [wallPoint(c, ax, a0, 0.1, rows[i].t), wallPoint(c, ax, g0, 0.1, rows[i].t), wallPoint(c, ax, g1, 0.1, rows[i + 1].t), wallPoint(c, ax, a1, 0.1, rows[i + 1].t)];
        b.glow.poly(gq, [[0, 0.5], [1, 0.5], [1, 0.5], [0, 0.5]], up);
      }
    }
    // stone bridge slab over the river at the chamber centre
    var m = new THREE.Matrix4();
    var slab = new THREE.BoxGeometry(3.6, 0.18, 2.0);
    if (axis === 'EW') m.makeRotationY(Math.PI / 2);
    m.setPosition(c.x, 0.1, c.z);
    b.floor.geometry(slab, m, 0.5);
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
    // soot plume on the wall above the flame
    var so = CH - D.ROUGH - 0.02;
    var sq = [wallPoint(c, ax, s - 0.45, D.TORCH_Y - 0.05, so), wallPoint(c, ax, s + 0.45, D.TORCH_Y - 0.05, so),
      wallPoint(c, ax, s + 0.55, D.TORCH_Y + 1.3, so), wallPoint(c, ax, s - 0.55, D.TORCH_Y + 1.3, so)];
    b.soot.poly(sq, [[0, 0], [1, 0], [1, 1], [0, 1]], wallPoint(c, ax, s, D.TORCH_Y, CH - 2));
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
    '  float grow = kind > 0.5 ? lit : (0.3 + 0.7 * lit);',
    '  vec3 p = position + (right * offset.x + vec3(0.0, offset.y, 0.0)) * grow;',
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
    '    gl_FragColor = vec4(vec3(1.0, 0.5, 0.16) * g * 0.32 * vLit * vFog, 0.0);',
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
      var v = torchList[i].glow;
      for (var k = 0; k < 8; k++) attr.array[i * 8 + k] = v;
    }
    attr.needsUpdate = true;
  }

  // ---------------------------------------------------------------------------
  // Water (cracks, trickles, puddles) and rune inscriptions
  // ---------------------------------------------------------------------------
  var waterList = [];      // { cellId, pts: [[x,y,z]], right: [rx, rz], w0, w1, phase }
  var runeList = [];       // { cellId, corners: [[x,y,z] x4], uv: [u0, v0, u1, v1], color: [r,g,b], phase }
  var waterMesh = null, waterMaterial = null, runeMesh = null, runeMaterial = null;
  var puddleList = [];     // { cellId, cx, cz, r, seed, ring: [[x, z]], drip: [x, z] | null }
  var puddleMesh = null, puddleMaterial = null;
  // planar mirror for the floor plane shared by all puddles
  var mirror = null;       // { target, camera, textureMatrix, scale }
  var envDirty = false;
  var PUDDLE_Y = 0.016;
  var RUNE_COLORS = { cyan: [0.35, 0.95, 1.0], violet: [0.8, 0.45, 1.0], green: [0.45, 1.0, 0.55] };

  function pushWallFeatures(b, cell, c, feats) {
    var i;
    for (i = 0; i < feats.inscriptions.length; i++) {
      var ins = feats.inscriptions[i];
      var ax = axes(ins.dir);
      var h = 0.5, w = ins.w;
      var out = CH - D.ROUGH - 0.015;
      var row = Math.floor(ins.seed * 4) % 4;
      var span = Math.min(1, (w / h) / 16);
      var u0 = (1 - span) * ((ins.seed * 7.3) % 1);
      runeList.push({
        cellId: cell.id,
        corners: [wallPoint(c, ax, -w / 2 + ins.s, ins.y - h / 2, out), wallPoint(c, ax, w / 2 + ins.s, ins.y - h / 2, out),
          wallPoint(c, ax, w / 2 + ins.s, ins.y + h / 2, out), wallPoint(c, ax, -w / 2 + ins.s, ins.y + h / 2, out)],
        uv: [u0, 1 - (row + 1) / 4, u0 + span, 1 - row / 4],
        color: RUNE_COLORS[ins.hue] || RUNE_COLORS.cyan,
        phase: ins.seed
      });
    }
    if (feats.crack) {
      var cax = axes(feats.crack.dir);
      var cs = feats.crack.s;
      var co = CH - D.ROUGH - 0.012;
      var cq = [wallPoint(c, cax, cs - 0.8, 0.5, co), wallPoint(c, cax, cs + 0.8, 0.5, co), wallPoint(c, cax, cs + 0.8, 3.7, co), wallPoint(c, cax, cs - 0.8, 3.7, co)];
      b.decal.poly(cq, [[0, 0], [1, 0], [1, 1], [0, 1]], wallPoint(c, cax, cs, 1.5, CH - 2));
      // trickle: down the wall, over the cove, out onto the floor
      var pts = [];
      var yTop = 2.75;
      for (var y = yTop; y > D.COVE; y -= 0.35) {
        pts.push(wallPoint(c, cax, cs + Math.sin(y * 3.1) * 0.03, y, CH - D.ROUGH - 0.02));
      }
      for (var k = 0; k <= 4; k++) {
        var ph = (Math.PI / 2) * k / 4;
        var inset = D.COVE - D.COVE * Math.cos(ph);
        pts.push(wallPoint(c, cax, cs, D.COVE - D.COVE * Math.sin(ph) + 0.015, CH - inset - 0.02));
      }
      pts.push(wallPoint(c, cax, cs, 0.014, CH - D.COVE - 0.35));
      waterList.push({ cellId: cell.id, pts: pts, right: [cax.rx, cax.rz], w0: 0.07, w1: 0.3, phase: rnd() });
    }
    for (i = 0; i < feats.puddles.length; i++) {
      var pd = feats.puddles[i];
      var drip = null;
      if (feats.crack && i === 0) {
        var last = waterList[waterList.length - 1].pts;
        drip = [last[last.length - 1][0], last[last.length - 1][2]];
      }
      puddleList.push({ cellId: cell.id, cx: c.x + pd.x, cz: c.z + pd.z, r: pd.r, seed: pd.seed, ring: FpLayout.blobOutline(pd.r, 24, pd.seed), drip: drip });
    }
  }

  var WATER_VERT = [
    'attribute float lit;',
    'attribute float phase;',
    'uniform float fogDensity;',
    'varying vec2 vUv;',
    'varying float vLit;',
    'varying float vPhase;',
    'varying float vFog;',
    'void main() {',
    '  vUv = uv; vLit = lit; vPhase = phase;',
    '  vec4 mv = viewMatrix * vec4(position, 1.0);',
    '  float fd = fogDensity * mv.z;',
    '  vFog = exp(-fd * fd);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var NOISE_GLSL = [
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}'
  ].join('\n');

  var WATER_FRAG = [
    'uniform float time;',
    'varying vec2 vUv;',
    'varying float vLit;',
    'varying float vPhase;',
    'varying float vFog;',
    NOISE_GLSL,
    'void main() {',
    '  if (vLit < 0.01) discard;',
    '  float across = 1.0 - abs(vUv.x * 2.0 - 1.0);',
    '  float body = smoothstep(0.0, 0.55, across);',
    // uv.y is the distance travelled down the stream: subtracting time moves the pattern downhill
    '  float streak = vnoise(vec2(vUv.x * 5.0 + vPhase * 11.0, vUv.y * 4.0 - time * 3.2));',
    '  float glint = pow(vnoise(vec2(vUv.x * 9.0, vUv.y * 9.0 - time * 4.5)), 6.0);',
    '  float a = body * (0.1 + 0.32 * streak) * vLit * vFog;',
    '  vec3 col = mix(vec3(0.12, 0.18, 0.22), vec3(0.5, 0.62, 0.7), streak) + vec3(1.0, 0.8, 0.55) * glint * 2.5;',
    '  gl_FragColor = vec4(col * a + vec3(1.0, 0.8, 0.55) * glint * vLit * vFog * 0.35, a * 0.8);',
    '}'
  ].join('\n');

  var RUNE_VERT = [
    'attribute float lit;',
    'attribute float phase;',
    'attribute vec3 tint;',
    'uniform float fogDensity;',
    'varying vec2 vUv;',
    'varying float vLit;',
    'varying float vPhase;',
    'varying vec3 vTint;',
    'varying float vFog;',
    'void main() {',
    '  vUv = uv; vLit = lit; vPhase = phase; vTint = tint;',
    '  vec4 mv = viewMatrix * vec4(position, 1.0);',
    '  float fd = fogDensity * mv.z;',
    '  vFog = exp(-fd * fd);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var RUNE_FRAG = [
    'uniform float time;',
    'uniform sampler2D map;',
    'varying vec2 vUv;',
    'varying float vLit;',
    'varying float vPhase;',
    'varying vec3 vTint;',
    'varying float vFog;',
    'void main() {',
    '  if (vLit < 0.01) discard;',
    '  vec4 tx = texture2D(map, vUv);',
    '  float pulse = 0.62 + 0.38 * sin(time * 1.7 + vPhase * 6.283);',
    '  float wave = 0.75 + 0.25 * sin(vUv.x * 90.0 - time * 2.4 + vPhase * 20.0);',
    '  float a = tx.a * vLit * vFog * pulse * wave;',
    '  vec3 col = mix(vTint, vec3(1.0), smoothstep(0.6, 1.0, tx.a) * 0.45) * 3.0;',
    '  gl_FragColor = vec4(col * a, 0.0);',
    '}'
  ].join('\n');

  /**
   * Puddles: a mirror-like water surface. All puddles lie in one floor plane,
   * so one planar reflection (the scene rendered from the camera mirrored
   * below the floor, at reduced resolution) serves them all. The reflection
   * is distorted by rings spreading from drops that fall at random spots
   * and, under a crack, from the trickle's landing point; a Fresnel term
   * mixes it with dark water.
   */
  var PUDDLE_VERT = [
    'attribute float edge;',
    'attribute float lit;',
    'attribute vec4 info;',   // centre x, centre z, radius, seed
    'attribute vec3 drip;',   // drip x, drip z, has drip
    'uniform float fogDensity;',
    'varying vec3 vWorld;',
    'varying float vEdge;',
    'varying float vLit;',
    'varying vec4 vInfo;',
    'varying vec3 vDrip;',
    'varying float vFog;',
    'uniform mat4 mirrorMatrix;',
    'varying vec4 vMirror;',
    'void main() {',
    '  vEdge = edge; vLit = lit; vInfo = info; vDrip = drip;',
    '  vec4 w = modelMatrix * vec4(position, 1.0);',
    '  vWorld = w.xyz;',
    '  vMirror = mirrorMatrix * w;',
    '  vec4 mv = viewMatrix * w;',
    '  float fd = fogDensity * mv.z;',
    '  vFog = exp(-fd * fd);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var PUDDLE_FRAG = [
    'uniform float time;',
    'uniform sampler2D mirrorMap;',
    'uniform float hasEnv;',
    'uniform float debugMode;',
    'uniform vec3 lightA;',
    'uniform vec3 lightB;',
    'uniform float lightGain;',
    'varying vec4 vMirror;',
    'varying vec3 vWorld;',
    'varying float vEdge;',
    'varying float vLit;',
    'varying vec4 vInfo;',
    'varying vec3 vDrip;',
    'varying float vFog;',
    'float h1(float n) { return fract(sin(n) * 43758.5453); }',
    // expanding ring: slope of a damped wave packet around the front
    'vec2 ringSlope(vec2 p, vec2 c, float age, float amp) {',
    '  vec2 d = p - c;',
    '  float dist = length(d) + 1e-4;',
    '  float x = dist - age * 0.42;',
    '  float packet = exp(-x * x * 90.0);',
    '  float fade = exp(-age * 2.2) * smoothstep(0.0, 0.05, age);',
    '  float slope = cos(x * 60.0) * 60.0 * packet * fade * amp;',
    '  return d / dist * slope;',
    '}',
    'void main() {',
    '  if (vLit < 0.01) discard;',
    '  vec2 p = vWorld.xz;',
    '  vec2 g = vec2(0.0);',
    // random drops falling into the puddle
    '  for (int i = 0; i < 3; i++) {',
    '    float fi = float(i);',
    '    float period = 1.9 + fi * 0.7;',
    '    float t = time / period + vInfo.w * 13.0 + fi * 0.37;',
    '    float n = floor(t);',
    '    float age = fract(t) * period;',
    '    float ang = h1(n * 12.9 + vInfo.w * 78.2 + fi) * 6.2832;',
    '    float rad = sqrt(h1(n * 3.7 + fi * 5.1 + vInfo.w)) * vInfo.z * 0.55;',
    '    vec2 c = vInfo.xy + vec2(cos(ang), sin(ang)) * rad;',
    '    g += ringSlope(p, c, age, 0.0022);',
    '  }',
    // steady drips from the crack above
    '  if (vDrip.z > 0.5) {',
    '    for (int j = 0; j < 2; j++) {',
    '      float per = 0.62;',
    '      float tt = time / per + float(j) * 0.5;',
    '      float age2 = fract(tt) * per;',
    '      g += ringSlope(p, vDrip.xy, age2, 0.003);',
    '    }',
    '  }',
    // faint breeze ripple so the surface is never perfectly still
    '  g += vec2(sin(p.x * 9.0 + time * 1.3), cos(p.y * 11.0 - time * 1.1)) * 0.004;',
    '  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));',
    '  vec3 V = normalize(vWorld - cameraPosition);',
    '  vec3 R = reflect(V, n);',
    '  vec3 env;',
    '  if (hasEnv > 0.5) {',
    '    vec2 muv = vMirror.xy / vMirror.w + g * 3.5;',
    '    env = texture2D(mirrorMap, muv).rgb;',
    '  } else {',
    '    env = mix(vec3(0.04, 0.035, 0.03), vec3(0.45, 0.3, 0.18), clamp(R.y, 0.0, 1.0));',
    '  }',
    '  float cosT = clamp(dot(-V, n), 0.0, 1.0);',
    '  float fresnel = 0.02 + 0.98 * pow(1.0 - cosT, 5.0);',
    '  vec3 deep = vec3(0.006, 0.012, 0.016);',
    // stylised: a still puddle reads as a dark mirror, so reflect strongly at every angle
    '  vec3 refl = env * vec3(0.95, 1.02, 1.1);',
    '  vec3 col = mix(deep, refl, clamp(0.82 + 0.18 * fresnel, 0.0, 1.0));',
    // a bright crest on the ring fronts catches the torchlight
    '  col += vec3(1.0, 0.8, 0.55) * clamp(length(g) * 22.0 - 0.08, 0.0, 1.0) * 0.22;',
    // torch glints on the rippled surface
    '  vec3 toEye = -V;',
    '  vec3 la = normalize(lightA - vWorld), lb = normalize(lightB - vWorld);',
    '  float spec = pow(max(dot(n, normalize(la + toEye)), 0.0), 220.0) + pow(max(dot(n, normalize(lb + toEye)), 0.0), 220.0);',
    '  col += vec3(1.0, 0.78, 0.45) * spec * 2.5 * lightGain;',
    // wet dark stone around the rim
    '  float rim = smoothstep(0.42, 0.8, vEdge);',
    '  col = mix(col, vec3(0.01, 0.011, 0.012), rim * 0.6);',
    '  col *= vLit * vFog;',
    '  float a = mix(0.97, 0.5, rim) * (1.0 - smoothstep(0.82, 1.0, vEdge));',
    '  if (debugMode > 0.5) { col = debugMode > 1.5 ? vec3(fract(vMirror.xy / vMirror.w * 4.0), 0.0) : env * 2.0; a = 1.0; }',
    '  gl_FragColor = vec4(col, a);',
    '  #include <tonemapping_fragment>',
    '  #include <colorspace_fragment>',
    '}'
  ].join('\n');

  function buildPuddles() {
    if (!puddleList.length) return;
    var pos = [], edge = [], lit = [], info = [], drip = [], idx = [];
    var Y = PUDDLE_Y;
    for (var i = 0; i < puddleList.length; i++) {
      var pd = puddleList[i];
      var base = pos.length / 3;
      var dr = pd.drip ? [pd.drip[0], pd.drip[1], 1] : [0, 0, 0];
      var push = function(x, z, e) {
        pos.push(x, Y, z);
        edge.push(e);
        lit.push(0);
        info.push(pd.cx, pd.cz, pd.r, pd.seed);
        drip.push(dr[0], dr[1], dr[2]);
      };
      push(pd.cx, pd.cz, 0);
      var n = pd.ring.length, k;
      for (k = 0; k < n; k++) push(pd.cx + pd.ring[k][0] * 0.6, pd.cz + pd.ring[k][1] * 0.6, 0.6);
      for (k = 0; k < n; k++) push(pd.cx + pd.ring[k][0], pd.cz + pd.ring[k][1], 1);
      for (k = 0; k < n; k++) {
        var j = (k + 1) % n;
        idx.push(base, base + 1 + j, base + 1 + k);
        idx.push(base + 1 + k, base + 1 + j, base + 1 + n + j);
        idx.push(base + 1 + k, base + 1 + n + j, base + 1 + n + k);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('edge', new THREE.Float32BufferAttribute(edge, 1));
    geo.setAttribute('lit', new THREE.Float32BufferAttribute(lit, 1));
    geo.setAttribute('info', new THREE.Float32BufferAttribute(info, 4));
    geo.setAttribute('drip', new THREE.Float32BufferAttribute(drip, 3));
    geo.setIndex(idx);
    if (!puddleMaterial) {
      puddleMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, fogDensity: { value: FOG_DENSITY }, mirrorMap: { value: null }, mirrorMatrix: { value: new THREE.Matrix4() }, hasEnv: { value: 0 }, debugMode: { value: 0 },
          lightA: { value: new THREE.Vector3(0, -50, 0) }, lightB: { value: new THREE.Vector3(0, -50, 0) }, lightGain: { value: 0 } },
        vertexShader: PUDDLE_VERT, fragmentShader: PUDDLE_FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
      });
    }
    puddleMaterial.uniforms.mirrorMap.value = mirror ? mirror.target.texture : null;
    puddleMaterial.uniforms.hasEnv.value = 0;
    puddleMesh = new THREE.Mesh(geo, puddleMaterial);
    puddleMesh.frustumCulled = false;
    puddleMesh.renderOrder = 2;
    scene.add(puddleMesh);
    envDirty = true;
  }

  var _mv = null;

  /** True when a lit puddle is close enough to the camera to be worth reflecting */
  function puddleNearby() {
    var cx = camera.position.x, cz = camera.position.z;
    for (var i = 0; i < puddleList.length; i++) {
      var dx = puddleList[i].cx - cx, dz = puddleList[i].cz - cz;
      if (dx * dx + dz * dz < 196 && cellBrightness(puddleList[i].cellId) > 0.05) return true;
    }
    return false;
  }

  /**
   * Render the mirrored scene for the floor plane (after three.js' Reflector:
   * reflected camera, oblique near plane at the floor, projective texture matrix)
   */
  function updateReflections() {
    if (!mirror || !puddleMesh || !puddleNearby()) {
      if (puddleMaterial) puddleMaterial.uniforms.hasEnv.value = 0;
      return;
    }
    if (!_mv) {
      _mv = { normal: new THREE.Vector3(0, 1, 0), pos: new THREE.Vector3(0, PUDDLE_Y, 0), cam: new THREE.Vector3(), rot: new THREE.Matrix4(),
        look: new THREE.Vector3(), view: new THREE.Vector3(), target: new THREE.Vector3(), plane: new THREE.Plane(),
        clip: new THREE.Vector4(), q: new THREE.Vector4() };
    }
    var v = _mv;
    camera.updateMatrixWorld();
    v.cam.setFromMatrixPosition(camera.matrixWorld);
    v.view.subVectors(v.pos, v.cam);
    if (v.view.dot(v.normal) > 0) return;
    v.view.reflect(v.normal).negate().add(v.pos);
    v.rot.extractRotation(camera.matrixWorld);
    v.look.set(0, 0, -1).applyMatrix4(v.rot).add(v.cam);
    v.target.subVectors(v.pos, v.look).reflect(v.normal).negate().add(v.pos);
    var vc = mirror.camera;
    vc.position.copy(v.view);
    vc.up.set(0, 1, 0).applyMatrix4(v.rot).reflect(v.normal);
    vc.lookAt(v.target);
    vc.far = camera.far;
    vc.updateMatrixWorld();
    vc.projectionMatrix.copy(camera.projectionMatrix);
    var tm = mirror.textureMatrix;
    tm.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    tm.multiply(vc.projectionMatrix).multiply(vc.matrixWorldInverse);
    // oblique near plane so nothing below the floor is drawn
    v.plane.setFromNormalAndCoplanarPoint(v.normal, v.pos).applyMatrix4(vc.matrixWorldInverse);
    v.clip.set(v.plane.normal.x, v.plane.normal.y, v.plane.normal.z, v.plane.constant);
    var e = vc.projectionMatrix.elements;
    v.q.x = (Math.sign(v.clip.x) + e[8]) / e[0];
    v.q.y = (Math.sign(v.clip.y) + e[9]) / e[5];
    v.q.z = -1.0;
    v.q.w = (1.0 + e[10]) / e[14];
    v.clip.multiplyScalar(2.0 / v.clip.dot(v.q));
    e[2] = v.clip.x;
    e[6] = v.clip.y;
    e[10] = v.clip.z + 1.0 - 0.003;
    e[14] = v.clip.w;

    puddleMesh.visible = false;
    var head = headLight.parent;
    renderer.setRenderTarget(mirror.target);
    renderer.clear();
    renderer.render(scene, vc);
    renderer.setRenderTarget(null);
    puddleMesh.visible = true;
    void head;
    puddleMaterial.uniforms.mirrorMatrix.value.copy(tm);
    puddleMaterial.uniforms.mirrorMap.value = mirror.target.texture;
    puddleMaterial.uniforms.hasEnv.value = 1;
  }

  /** Size the mirror target to a fraction of the canvas */
  function resizeMirror() {
    if (!mirror || !renderer) return;
    var size = new THREE.Vector2();
    renderer.getDrawingBufferSize(size);
    mirror.target.setSize(Math.max(64, Math.floor(size.x * mirror.scale)), Math.max(64, Math.floor(size.y * mirror.scale)));
  }

  function buildWater() {
    if (!waterList.length) return;
    var pos = [], uv = [], lit = [], phase = [], idx = [];
    for (var i = 0; i < waterList.length; i++) {
      var wl = waterList[i];
      var base = pos.length / 3;
      var along = 0;
      for (var k = 0; k < wl.pts.length; k++) {
        var p = wl.pts[k];
        if (k > 0) {
          var q = wl.pts[k - 1];
          along += Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) + (p[2] - q[2]) * (p[2] - q[2]));
        }
        var t = k / (wl.pts.length - 1);
        var hw = (wl.w0 + (wl.w1 - wl.w0) * t * t) / 2;
        pos.push(p[0] - wl.right[0] * hw, p[1], p[2] - wl.right[1] * hw);
        pos.push(p[0] + wl.right[0] * hw, p[1], p[2] + wl.right[1] * hw);
        uv.push(0, along, 1, along);
        lit.push(0, 0);
        phase.push(wl.phase, wl.phase);
        if (k > 0) {
          var a = base + (k - 1) * 2;
          idx.push(a, a + 1, a + 3, a, a + 3, a + 2);
        }
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('lit', new THREE.Float32BufferAttribute(lit, 1));
    g.setAttribute('phase', new THREE.Float32BufferAttribute(phase, 1));
    g.setIndex(idx);
    if (!waterMaterial) {
      waterMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, fogDensity: { value: FOG_DENSITY } },
        vertexShader: WATER_VERT, fragmentShader: WATER_FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
      });
    }
    waterMesh = new THREE.Mesh(g, waterMaterial);
    waterMesh.frustumCulled = false;
    waterMesh.renderOrder = 3;
    scene.add(waterMesh);
  }

  function buildRunes() {
    if (!runeList.length || !textures.decals) return;
    var pos = [], uv = [], lit = [], phase = [], tint = [], idx = [];
    for (var i = 0; i < runeList.length; i++) {
      var r = runeList[i];
      var base = pos.length / 3;
      var U = [[r.uv[0], r.uv[1]], [r.uv[2], r.uv[1]], [r.uv[2], r.uv[3]], [r.uv[0], r.uv[3]]];
      for (var k = 0; k < 4; k++) {
        pos.push(r.corners[k][0], r.corners[k][1], r.corners[k][2]);
        uv.push(U[k][0], U[k][1]);
        lit.push(0);
        phase.push(r.phase);
        tint.push(r.color[0], r.color[1], r.color[2]);
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('lit', new THREE.Float32BufferAttribute(lit, 1));
    g.setAttribute('phase', new THREE.Float32BufferAttribute(phase, 1));
    g.setAttribute('tint', new THREE.Float32BufferAttribute(tint, 3));
    g.setIndex(idx);
    if (!runeMaterial) {
      runeMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, fogDensity: { value: FOG_DENSITY }, map: { value: textures.decals.runes } },
        vertexShader: RUNE_VERT, fragmentShader: RUNE_FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor
      });
    } else {
      runeMaterial.uniforms.map.value = textures.decals.runes;
    }
    runeMesh = new THREE.Mesh(g, runeMaterial);
    runeMesh.frustumCulled = false;
    runeMesh.renderOrder = 4;
    scene.add(runeMesh);
  }

  /** Per-item brightness for the shared rune / water meshes */
  function updateDecalLit() {
    var i, k, v;
    if (runeMesh) {
      var ra = runeMesh.geometry.getAttribute('lit');
      for (i = 0; i < runeList.length; i++) {
        v = cellBrightness(runeList[i].cellId);
        for (k = 0; k < 4; k++) ra.array[i * 4 + k] = v;
      }
      ra.needsUpdate = true;
    }
    if (puddleMesh) {
      var pa = puddleMesh.geometry.getAttribute('lit');
      var po = 0;
      for (i = 0; i < puddleList.length; i++) {
        v = cellBrightness(puddleList[i].cellId);
        for (k = 0; k < 1 + puddleList[i].ring.length * 2; k++) pa.array[po++] = v;
      }
      pa.needsUpdate = true;
    }
    if (waterMesh) {
      var wa = waterMesh.geometry.getAttribute('lit');
      var o = 0;
      for (i = 0; i < waterList.length; i++) {
        v = cellBrightness(waterList[i].cellId);
        for (k = 0; k < waterList[i].pts.length * 2; k++) wa.array[o++] = v;
      }
      wa.needsUpdate = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Doors (on some passages, shared by both chambers, swing open when crossed)
  // ---------------------------------------------------------------------------
  var doors = {};          // edge key -> { group, pivot, meshes, a, b, angle, target, lo }

  function edgeKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }

  function buildDoor(cell, dir, other) {
    var c = cellCenter(cell);
    var ax = axes(dir);
    var hw = D.PR * 0.965;
    var prof = FpLayout.passageProfile(D, 14);
    var shape = new THREE.Shape();
    for (var i = 0; i < prof.length; i++) {
      var x = prof[i].s * 0.965 + hw, y = prof[i].y * 0.985;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    var slab = new THREE.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: false, curveSegments: 1 });
    slab.translate(0, 0, -0.045);
    var id = new THREE.Matrix4();
    var wood = new Builder(), iron = new Builder();
    wood.geometry(slab, id, 0.42, true);
    var strap = new THREE.BoxGeometry(1, 1, 1);
    var m = new THREE.Matrix4();
    for (var k = 0; k < 2; k++) {
      m.makeScale(hw * 1.85, 0.08, 0.12).setPosition(hw * 0.95, 0.55 + k * 1.35, 0);
      iron.geometry(strap, m);
    }
    var ringG = new THREE.TorusGeometry(0.09, 0.018, 5, 12);
    m.makeTranslation(hw * 1.7, 1.15, 0.08);
    iron.geometry(ringG, m);
    m.makeTranslation(hw * 1.7, 1.15, -0.08);
    iron.geometry(ringG, m);
    slab.dispose(); strap.dispose(); ringG.dispose();

    var group = new THREE.Group();
    var basis = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(ax.rx, 0, ax.rz), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-ax.dx, 0, -ax.dz));
    group.quaternion.setFromRotationMatrix(basis);
    var hinge = wallPoint(c, ax, -hw, 0, CELL / 2);
    group.position.set(hinge[0], hinge[1], hinge[2]);
    var pivot = new THREE.Object3D();
    group.add(pivot);
    var meshes = [];
    [[wood, materials.wood], [iron, materials.iron]].forEach(function(pair) {
      var mesh = new THREE.Mesh(pair[0].toGeometry(), pair[1]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      pivot.add(mesh);
      meshes.push(mesh);
    });
    group.visible = false;
    scene.add(group);
    doors[edgeKey(cell.id, other.id)] = { group: group, pivot: pivot, meshes: meshes, a: cell.id, b: other.id, angle: 0, target: 0 };
  }

  function doorBrightness(dr) {
    return Math.max(cellBrightness(dr.a), cellBrightness(dr.b));
  }

  function updateDoorsFor(cellId) {
    Object.keys(doors).forEach(function(k) {
      var dr = doors[k];
      if (cellId && dr.a !== cellId && dr.b !== cellId) return;
      var v = doorBrightness(dr);
      for (var i = 0; i < dr.meshes.length; i++) {
        var attr = dr.meshes[i].geometry.getAttribute('color');
        attr.array.fill(v);
        attr.needsUpdate = true;
      }
    });
  }

  /** True when a closed door stands between two neighbouring chambers */
  function isDoorClosed(a, b) {
    var dr = doors[edgeKey(a, b)];
    return !!(dr && dr.target === 0);
  }

  /** Swing the door between a and b away from `from` */
  function openDoor(from, to) {
    var dr = doors[edgeKey(from, to)];
    if (!dr || dr.target !== 0) return false;
    // the door frame's +Z points into chamber a; swing toward the destination
    dr.target = from === dr.a ? 1.62 : -1.62;
    if (reducedMotion) { dr.angle = dr.target; dr.pivot.rotation.y = dr.angle; shadowDirty = true; }
    doorsMoving = !reducedMotion;
    startLoop();
    return true;
  }

  var doorsMoving = false;

  function stepDoors(dt) {
    if (!doorsMoving) return;
    var still = false;
    Object.keys(doors).forEach(function(k) {
      var dr = doors[k];
      if (dr.angle === dr.target) return;
      dr.angle = FpLayout.approach(dr.angle, dr.target, 6.5, dt);
      dr.pivot.rotation.y = dr.angle;
      if (dr.angle !== dr.target) still = true; else shadowDirty = true;
    });
    doorsMoving = still;
    if (!still) envDirty = true;
    dirty = true;
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
    materials.iron = new THREE.MeshStandardMaterial({ color: 0x5c5a60, roughness: 0.42, metalness: 0.5, vertexColors: true, side: THREE.DoubleSide });
    materials.pitch = new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 1, emissive: 0x3a1204, vertexColors: true });
    materials.lava = new THREE.MeshBasicMaterial({ map: tex.lava, vertexColors: true, fog: true });
    materials.vine = new THREE.MeshStandardMaterial({ map: tex.vine, vertexColors: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 });
    materials.stone = std(tex.wall, { roughness: 0.88, normal: 0.6, color: 0xd6cec4 });
    materials.crust = std(tex.wall, { roughness: 1, normal: 0.8, color: 0x3a2a24 });
    materials.bone = new THREE.MeshStandardMaterial({ color: 0xe6dcc2, roughness: 0.65, vertexColors: true });
    var dec = tex.decals || {};
    materials.glow = new THREE.MeshBasicMaterial({ map: dec.glow || null, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
    materials.soot = new THREE.MeshBasicMaterial({ map: dec.soot || null, color: 0x000000, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    materials.decal = new THREE.MeshBasicMaterial({ map: dec.crack || null, color: 0xffffff, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    if (dec.env) {
      materials.iron.envMap = dec.env;
      materials.iron.envMapIntensity = 0.45;
    }
  }

  // torch parts do not cast: the light sits right in front of them
  var CAST = { wall: true, moss: true, floor: true, ceiling: true, wood: true, iron: true, stone: true, rubble: true, bone: true, armour: true, crust: true };
  var RECEIVE = { lava: false, glow: false, soot: false, decal: false, dark: false };

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
    if (waterMesh) { scene.remove(waterMesh); waterMesh.geometry.dispose(); waterMesh = null; }
    if (runeMesh) { scene.remove(runeMesh); runeMesh.geometry.dispose(); runeMesh = null; }
    if (puddleMesh) { scene.remove(puddleMesh); puddleMesh.geometry.dispose(); puddleMesh = null; }
    puddleList = [];
    Object.keys(doors).forEach(function(k) {
      scene.remove(doors[k].group);
      doors[k].meshes.forEach(function(m) { m.geometry.dispose(); });
    });
    doors = {}; doorsMoving = false;
    waterList = []; runeList = [];
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
    var keys = ['wall', 'moss', 'floor', 'ceiling', 'lava', 'crust', 'glow', 'iron', 'wood', 'torchIron', 'torchWood', 'pitch', 'vine',
      'stone', 'bone', 'soot', 'decal'];
    var MAT = { torchIron: 'iron', torchWood: 'wood' };

    for (var n = 0; n < ids.length; n++) {
      var cell = w.cells[ids[n]];
      var c = cellCenter(cell);
      var inside = [c.x, EYE, c.z];
      var b = {};
      keys.forEach(function(k) { b[k] = new Builder(); });
      var wallKey = (FpLayout.hashCell(cell.x, cell.y, 3) < 0.4) ? 'moss' : 'wall';
      // aliases that share a draw call: rubble and the string course use the chamber stone,
      // armour and dark details use iron
      b.rubble = b[wallKey];
      b.trim = b[wallKey];
      b.armour = b.iron;
      b.dark = b.iron;

      pushShell(b, cell, c, wallKey);
      var lava = FpLayout.lavaAxis(cell);
      if (lava) { lavaCells[cell.id] = true; pushLava(b, c, lava, FpLayout.hashCell(cell.x, cell.y, 50)); }

      for (var d = 0; d < 4; d++) {
        var dir = FpLayout.DIRS[d];
        if (cell.walls[dir]) continue;
        var ax = axes(dir);
        pushDoorway(b, c, ax, wallKey, quality.props ? FpLayout.doorwayStyle(cell, dir) : 'plain', FpLayout.hashCell(cell.x, cell.y, 120 + d));
        if (rnd() < 0.6) pushVines(b, c, ax, inside);
        if (cell.portal && cell.portal.dir === dir && cell.type !== 'boss') {
          bossHost = { cell: cell, ax: ax, c: c };
        }
      }

      var spots = FpLayout.torchSpots(cell, D);
      for (var t = 0; t < spots.length; t++) {
        var tp = pushTorch(b, c, spots[t].dir, spots[t].s);
        var lit0 = prevBright[cell.id] && prevBright[cell.id].target === 1 ? 1 : 0;
        torchList.push({ cellId: cell.id, x: tp.light[0], y: tp.light[1], z: tp.light[2], fx: tp.flame[0], fy: tp.flame[1], fz: tp.flame[2], phase: rnd(),
          rank: t, glow: lit0, target: lit0, delay: 0 });
      }

      if (quality.props) {
        var feats = FpLayout.floorFeatures(cell, D);
        for (var p = 0; p < feats.length; p++) FpProps.floorFeature(b, c.x, c.z, feats[p]);
      }
      pushWallFeatures(b, cell, c, FpLayout.wallFeatures(cell, D));

      var group = new THREE.Group();
      var cd = { group: group, meshes: [], x: c.x, z: c.z };
      keys.forEach(function(k) {
        if (b[k].empty()) return;
        var mesh = new THREE.Mesh(b[k].toGeometry(), materials[MAT[k] || k]);
        mesh.userData.key = k;
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

    // doors on some passages (each edge once)
    for (n = 0; n < ids.length; n++) {
      var dc = w.cells[ids[n]];
      ['E', 'S'].forEach(function(dd) {
        var other = dc.exits[dd] ? w.cells[dc.exits[dd]] : null;
        if (other && !(dc.portal && dc.portal.dir === dd) && FpLayout.hasDoor(dc, other)) {
          buildDoor(dc, dd, other);
        }
      });
    }
    updateDoorsFor(null);

    buildFlames();
    updateFlameLit();
    buildWater();
    buildPuddles();
    buildRunes();
    updateDecalLit();

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
    updateDoorsFor(cellId);
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
    Object.keys(doors).forEach(function(k) {
      var dr = doors[k];
      var v = !!((cells[dr.a] && cells[dr.a].group.visible) || (cells[dr.b] && cells[dr.b].group.visible));
      if (dr.group.visible !== v) { dr.group.visible = v; shadowDirty = true; }
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
    if (reducedMotion) { updateFlameLit(); updateDecalLit(); refreshGroups(false); }
    if (gateHost) {
      var g = brightness[gateHost.cell.id];
      gateLight.visible = !!(g && g.target > 0);
    }
    updateTorchTargets();
    if (changed) assignLights();
    dirty = true;
    startLoop();
  }

  // ---------------------------------------------------------------------------
  // Torch ignition: torches stay dark until their chamber is entered, then
  // catch one after another and their lights ramp up
  // ---------------------------------------------------------------------------
  var torchesChanging = false, igniteHook = null;

  function updateTorchTargets() {
    for (var i = 0; i < torchList.length; i++) {
      var t = torchList[i];
      var b = brightness[t.cellId];
      var target = b && b.target === 1 ? 1 : 0;
      if (target === t.target) continue;
      t.target = target;
      var near = true;
      if (focusId && world && world.cells[focusId]) {
        var fc = cellCenter(world.cells[focusId]);
        near = Math.abs(t.x - fc.x) + Math.abs(t.z - fc.z) < CELL * 1.2;
      }
      if (reducedMotion || !near) {
        t.glow = target;
        t.delay = 0;
      } else {
        t.delay = target ? 0.35 + t.rank * 0.45 : 0;
        t.pendingIgnite = target === 1;
        torchesChanging = true;
      }
    }
    if (reducedMotion) updateFlameLit();
  }

  function stepTorches(dt) {
    if (!torchesChanging) return;
    var still = false;
    for (var i = 0; i < torchList.length; i++) {
      var t = torchList[i];
      if (t.glow === t.target && t.delay <= 0) continue;
      if (t.delay > 0) {
        t.delay -= dt;
        still = true;
        continue;
      }
      if (t.pendingIgnite) {
        t.pendingIgnite = false;
        if (igniteHook) {
          var dx = t.x - camera.position.x, dz = t.z - camera.position.z;
          igniteHook({ cellId: t.cellId, distance: Math.sqrt(dx * dx + dz * dz), focus: t.cellId === focusId });
        }
      }
      t.glow = FpLayout.approach(t.glow, t.target, 1.5, dt);
      if (t.glow !== t.target) still = true;
    }
    torchesChanging = still;
    if (!still) envDirty = true;
    updateFlameLit();
    dirty = true;
  }

  function onTorchIgnite(fn) { igniteHook = fn; }

  function stepBrightness(dt) {
    if (!brightening) return;
    var still = false;
    var ids = Object.keys(brightness);
    for (var i = 0; i < ids.length; i++) {
      var b = brightness[ids[i]];
      if (b.cur === b.target) continue;
      var d = b.target - b.cur;
      var step = dt / 0.8;
      if (Math.abs(d) <= step) b.cur = b.target; else b.cur += (d > 0 ? 1 : -1) * step;
      applyBrightness(ids[i], b.cur);
      if (b.cur !== b.target) still = true;
    }
    brightening = still;
    updateFlameLit();
    updateDecalLit();
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
  /**
   * Point the light pool at the torches around the focus chamber. Slots keep
   * their torch when it stays chosen; a slot that changes fades its light
   * out, moves, and fades back in (see updateLights).
   */
  function assignLights() {
    if (!world || !torchLights.length) return;
    var focus = focusId && world.cells[focusId] ? cellCenter(world.cells[focusId]) : { x: pose.x, z: pose.z };
    var chosen = FpLayout.assignLights(torchList, {
      focusId: focusId, px: focus.x, pz: focus.z,
      count: torchLights.length, shadowCount: quality.shadowLights,
      isLit: function(id) { return !!(brightness[id] && brightness[id].target === 1); }
    });
    var prev = lightSlots.map(function(sl) { return sl.pending; });
    var next = FpLayout.stableSlots(prev, chosen, quality.shadowLights);
    for (var i = 0; i < torchLights.length; i++) {
      if (lightSlots[i].pending !== next[i]) {
        lightSlots[i].pending = next[i];
        lightsFading = true;
      }
    }
    startLoop();
    dirty = true;
  }

  var lightsFading = false;

  function updateLights(t, dt) {
    if (!world) return;
    dt = dt || 0;
    var fading = false;
    for (var i = 0; i < torchLights.length; i++) {
      var sl = lightSlots[i];
      var L = torchLights[i];
      if (sl.torch !== sl.pending) {
        sl.fade = reducedMotion ? 0 : FpLayout.approach(sl.fade, 0, 5, dt);
        if (sl.fade === 0) {
          sl.torch = sl.pending;
          if (sl.torch >= 0) L.position.set(torchList[sl.torch].x, torchList[sl.torch].y, torchList[sl.torch].z);
          else L.position.set(0, -50, 0);
          if (L.castShadow) shadowDirty = true;
        }
        fading = true;
      } else if (sl.fade < 1) {
        sl.fade = reducedMotion ? 1 : FpLayout.approach(sl.fade, 1, 2.5, dt);
        fading = true;
      }
      if (sl.torch < 0) { L.intensity = 0; continue; }
      var torch = torchList[sl.torch];
      L.intensity = TORCH_INTENSITY * torch.glow * sl.fade * FpLayout.flicker(t, torch.phase);
    }
    lightsFading = fading;
    if (puddleMaterial) {
      var ft = [];
      for (i = 0; i < torchList.length && ft.length < 2; i++) if (torchList[i].cellId === focusId) ft.push(torchList[i]);
      if (ft.length) {
        puddleMaterial.uniforms.lightA.value.set(ft[0].fx, ft[0].fy + 0.2, ft[0].fz);
        var fb2 = ft[1] || ft[0];
        puddleMaterial.uniforms.lightB.value.set(fb2.fx, fb2.fy + 0.2, fb2.fz);
        puddleMaterial.uniforms.lightGain.value = ft[0].glow * FpLayout.flicker(t, ft[0].phase);
      } else {
        puddleMaterial.uniforms.lightGain.value = 0;
      }
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
    if (viewMode === 'third' && owl) {
      var rig = FpOwl.thirdPerson(pose, bob, { fov: camera.fov, aspect: camera.aspect });
      owl.setPlacement(rig.owl);
      camera.position.set(rig.camera.x, rig.camera.y, rig.camera.z);
      camera.lookAt(rig.target.x, rig.target.y, rig.target.z);
      dirty = true;
      return;
    }
    var y = rad(pose.yaw);
    var fx = -Math.sin(y), fz = -Math.cos(y);
    camera.position.set(pose.x - fx * BACK, EYE + bob, pose.z - fz * BACK);
    camera.rotation.set(0, y, 0);
    dirty = true;
  }

  function thirdPersonActive() {
    return viewMode === 'third' && !!owl;
  }

  /**
   * Switch between the first-person eyes and the over-the-shoulder camera
   * @param {string} mode - 'first' | 'third' (persisted)
   */
  function setViewMode(mode) {
    if (!FpOwl.isMode(mode)) return;
    viewMode = mode;
    FpOwl.storeMode(mode);
    if (owl) owl.setVisible(mode === 'third');
    applyPose();
    if (camera) refreshGroups(true);
    shadowDirty = true;
    startLoop();
  }

  function getViewMode() { return viewMode; }

  /** One-shot Mr Owl clip ('attack', 'knockback', 'bump', 'teleport') */
  function playOwl(kind) {
    if (!owl) return;
    owl.play(kind);
    startLoop();
  }

  function setFocus(roomId) {
    if (focusId === roomId) return;
    focusId = roomId;
    envDirty = true;
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
    if (owl) owl.setBase(bobbing ? 'step' : (Math.abs(to.yaw - from.yaw) > 1 ? 'turn' : 'idle'));
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
      if (owl) owl.setBase('idle');
      if (cb) cb();
    }
  }

  /**
   * Start lighting a chamber as the player walks in (the bootstrap confirms
   * it as explored on arrival), so light grows during the step instead of
   * popping afterwards
   */
  function enterCell(toId) {
    var b = brightness[toId];
    if (!b || b.target === 1) return;
    b.target = 1;
    brightening = true;
    updateTorchTargets();
    assignLights();
    startLoop();
  }

  function animateStep(toId, facing, ms, done) {
    var c = cellCenter(world.cells[toId]);
    if (focusId) openDoor(focusId, toId);
    enterCell(toId);
    setFocus(toId);
    startTween({ x: c.x, z: c.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 520, easeInOut, done, true);
  }

  function animateTurn(facing, ms, done) {
    startTween({ x: pose.x, z: pose.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 240, easeInOut, done);
  }

  function animateKnockback(toId, facing, ms, done) {
    var c = cellCenter(world.cells[toId]);
    if (focusId) openDoor(focusId, toId);
    pose.yaw = FpWorld.YAW[facing];
    setFocus(toId);
    if (owl) owl.play('knockback');
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
    enterCell(toId);
    if (owl) owl.play('teleport');
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
    if (owl) owl.play('bump');
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
      envDirty = true;

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
    updateReflections();
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
    if (doorsMoving) stepDoors(dt);
    if (torchesChanging) stepTorches(dt);
    if (tween) refreshGroups(false);
    if (thirdPersonActive() && (animated || tween)) {
      owl.update(dt);
      // the owl's shadow moves with it: refresh the static shadow maps at a few Hz
      owlShadowClock += dt;
      if (quality.shadowLights > 0 && owlShadowClock > (tween ? 0.1 : 0.25)) { shadowDirty = true; owlShadowClock = 0; }
      dirty = true;
    }
    if (animated || tween || fades.length || brightening) {
      if (flameMaterial) flameMaterial.uniforms.time.value = clock;
      if (waterMaterial) waterMaterial.uniforms.time.value = clock;
      if (runeMaterial) runeMaterial.uniforms.time.value = clock;
      if (puddleMaterial) puddleMaterial.uniforms.time.value = clock;
      if (materials.lava && materials.lava.map) { materials.lava.map.offset.y = (clock * 0.05) % 1; materials.lava.map.offset.x = Math.sin(clock * 0.4) * 0.02; }
      updateLights(clock, dt);
      dirty = true;
    } else if (lightsFading || torchesChanging) {
      updateLights(clock, dt);
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
    if (running && (animated || tween || fades.length || brightening || doorsMoving || torchesChanging || lightsFading)) rafId = requestAnimationFrame(frame);
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

  function getOwlInfo() {
    return { loaded: !!owl, mode: viewMode, clip: owl ? owl.currentClip() : null, clips: owl ? owl.clips() : [],
      visible: !!(owl && owl.object.visible), position: owl ? owl.object.position.toArray().map(function(v) { return +v.toFixed(2); }) : null };
  }

  function getPose() { return { x: pose.x, z: pose.z, yaw: pose.yaw, camX: camera ? camera.position.x : pose.x, camZ: camera ? camera.position.z : pose.z }; }
  function getRenderInfo() { return renderer ? renderer.info.render : null; }
  function getQuality() { return quality ? quality.tier : null; }
  function getLightInfo() {
    return {
      torches: torchList.length,
      slots: lightSlots.map(function(sl) { return sl.torch; }),
      focusTorches: torchList.filter(function(t) { return t.cellId === focusId; }).map(function(t) { return { glow: +t.glow.toFixed(2), target: t.target, delay: +t.delay.toFixed(2), y: +t.fy.toFixed(2) }; }),
      shadowCasters: quality ? quality.shadowLights : 0,
      focus: focusId
    };
  }
  function markDirty() { dirty = true; startLoop(); }

  /** Debug: meshes of a chamber by builder key */
  function debugCell(id) {
    var cd = cells[id];
    if (!cd) return null;
    return cd.meshes.map(function(m) {
      var mat = m.material;
      return { key: m.userData.key, verts: m.geometry.getAttribute('position').count, visible: m.visible && cd.group.visible,
        map: !!(mat.map && mat.map.image), mapSize: mat.map && mat.map.image ? mat.map.image.width + 'x' + mat.map.image.height : null,
        transparent: mat.transparent, bbox: (m.geometry.computeBoundingBox(), m.geometry.boundingBox.min.toArray().map(function(v) { return +v.toFixed(2); }).concat(m.geometry.boundingBox.max.toArray().map(function(v) { return +v.toFixed(2); }))) };
    });
  }

  /**
   * Ambient sound sources around the listener: lava chambers and water
   * trickles/puddles in explored chambers
   * @returns {Object} { x, z, lava: [{ x, z }], water: [{ x, z }] }
   */
  function getSoundscape() {
    var out = { x: camera ? camera.position.x : pose.x, z: camera ? camera.position.z : pose.z, lava: [], water: [] };
    if (!world) return out;
    Object.keys(lavaCells).forEach(function(id) {
      if (cellBrightness(id) < 0.99) return;
      var c = cellCenter(world.cells[id]);
      out.lava.push({ x: c.x, z: c.z });
    });
    for (var i = 0; i < waterList.length; i++) {
      if (cellBrightness(waterList[i].cellId) < 0.99) continue;
      var p = waterList[i].pts[waterList[i].pts.length - 1];
      out.water.push({ x: p[0], z: p[2] });
    }
    return out;
  }

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
    if (typeof o.puddleEnv === 'number' && puddleMaterial) puddleMaterial.uniforms.hasEnv.value = o.puddleEnv;
    if (typeof o.puddleDebug === 'number' && puddleMaterial) puddleMaterial.uniforms.debugMode.value = o.puddleDebug;
    if (o.mirrorDump && mirror) {
      var w = mirror.target.width, h = mirror.target.height;
      var buf = new Uint8Array(w * h * 4);
      renderer.readRenderTargetPixels(mirror.target, 0, 0, w, h, buf);
      var cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      var id = cv.getContext('2d').createImageData(w, h);
      for (var yy = 0; yy < h; yy++) {
        for (var xx = 0; xx < w; xx++) {
          var si = ((h - 1 - yy) * w + xx) * 4, di = (yy * w + xx) * 4;
          id.data[di] = Math.min(255, buf[si] * 3); id.data[di + 1] = Math.min(255, buf[si + 1] * 3); id.data[di + 2] = Math.min(255, buf[si + 2] * 3); id.data[di + 3] = 255;
        }
      }
      cv.getContext('2d').putImageData(id, 0, 0);
      window.__mirror = cv.toDataURL('image/png');
    }
    if (o.debugWater) {
      window.__water = {
        puddles: puddleList.length,
        hasEnv: puddleMaterial ? puddleMaterial.uniforms.hasEnv.value : null,
        mirror: mirror ? [mirror.target.width, mirror.target.height] : null,
        visible: puddleMesh ? puddleMesh.visible : null,
        lit: puddleMesh ? Array.prototype.slice.call(puddleMesh.geometry.getAttribute('lit').array, 0, 5) : null
      };
    }
    var tones = { agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping };
    if (o.tone && tones[o.tone] !== undefined) {
      renderer.toneMapping = tones[o.tone];
      Object.keys(materials).forEach(function(k) { if (materials[k]) materials[k].needsUpdate = true; });
    }
    updateLights(clock, 0);
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
    setViewMode: setViewMode,
    getViewMode: getViewMode,
    playOwl: playOwl,
    getOwlInfo: getOwlInfo,
    stop: stop,
    markDirty: markDirty,
    tune: tune,
    debugCell: debugCell,
    isDoorClosed: isDoorClosed,
    onTorchIgnite: onTorchIgnite,
    getSoundscape: getSoundscape,
    setQuality: setQuality,
    onRebuild: onRebuild,
    getQuality: getQuality,
    getLightInfo: getLightInfo,
    getPose: getPose,
    getRenderInfo: getRenderInfo
  };
})();
