/**
 * FpRenderer
 * three.js scene for the first-person prototype. Every dungeon room is a
 * vaulted octagonal stone chamber with corner pillars; open sides become
 * arched doorways leading into short barrel-vaulted passages. Chambers are
 * lit by torches (flickering point-sprite flames + pooled point lights),
 * some carry a glowing lava river, and the boss host wears an iron gate.
 *
 * Fog of war: every vertex carries a colour attribute that is black for
 * unexplored chambers, dim for chambers seen through a doorway and white
 * once entered; brightness eases in over ~500 ms. Monsters are billboard
 * sprites created only when their chamber is entered.
 *
 * Renders on demand: while a tween, fade or brightness change runs, or when
 * something marked the scene dirty; torches/lava animate continuously only
 * while `animated` is true (set by the bootstrap while the view is visible).
 */

var FpRenderer = (function() {
  var CELL = 10;          // distance between chamber centres
  var CH = 3.5;           // chamber half-width
  var CF = 1.1;           // corner chamfer
  var WALL_TOP = 4.0;     // where the vault starts
  var CEIL_MAX = 6.0;     // vault apex
  var PW = 2.4;           // passage / arch width
  var PH = 2.0;           // arch straight height
  var PR = PW / 2;        // arch radius (top at PH + PR)
  var EYE = 1.6;
  var NEAR = 0.1;
  var FAR = 70;
  var SEEN_LEVEL = 0.28;
  var UVS = 3;            // world units per texture repeat
  var LIGHT_POOL = 6;
  var LAVA_POOL = 2;

  var renderer = null, scene = null, camera = null, mount = null;
  var world = null;
  var materials = {};
  var meshes = [];
  var entities = {};
  var cellRanges = {};      // cellId -> [{ buf: QuadBuffer, mesh, start, count }]
  var pillarInstances = {}; // cellId -> [instance index]
  var brightness = {};      // cellId -> { cur, target }
  var lavaCells = {};       // cellId -> true
  var torchList = [];       // { cellId, x, y, z, phase }
  var torchGeom = null, torchPoints = null, torchMaterial = null;
  var lights = [], lavaLights = [], gateLight = null, headTorch = null;
  var gateBars = null, gateRune = null, gateHost = null;
  var pillars = null;
  var fades = [];

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

  /** Unit vector and its right-hand perpendicular for a compass direction */
  function axes(dir) {
    var d = FpWorld.DELTA[dir];
    return { dx: d[0], dz: d[1], rx: -d[1], rz: d[0] };
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function init(opts) {
    mount = opts.mount;
    reducedMotion = !!opts.reducedMotion;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('FpRenderer: WebGL unavailable', e);
      renderer = null;
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.addEventListener('webglcontextlost', function(e) { e.preventDefault(); console.warn('FpRenderer: context lost'); });
    renderer.domElement.addEventListener('webglcontextrestored', function() {
      console.warn('FpRenderer: context restored, rebuilding');
      if (world) buildScene(world, materials.textures);
      dirty = true;
    });
    mount.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    scene.fog = new THREE.FogExp2(0x05060a, 0.042);

    camera = new THREE.PerspectiveCamera(70, 4 / 3, NEAR, FAR);
    scene.add(camera);
    scene.add(new THREE.AmbientLight(0x3c3c4a));

    headTorch = new THREE.PointLight(0xffc27a, 7, 9, 2);
    headTorch.position.set(0, 0.1, 0);
    camera.add(headTorch);

    for (var i = 0; i < LIGHT_POOL; i++) {
      var l = new THREE.PointLight(0xffb464, 0, CELL * 1.6, 2);
      l.visible = false;
      scene.add(l);
      lights.push(l);
    }
    for (i = 0; i < LAVA_POOL; i++) {
      var ll = new THREE.PointLight(0xff5a1a, 0, CELL * 1.2, 2);
      ll.visible = false;
      scene.add(ll);
      lavaLights.push(ll);
    }
    gateLight = new THREE.PointLight(0xb14ad6, 0, CELL, 2);
    gateLight.visible = false;
    scene.add(gateLight);

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function() { setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) stopLoop(); else if (running) startLoop();
    });
    console.log('FpRenderer: WebGL2=' + !!(renderer.capabilities && renderer.capabilities.isWebGL2));
    return true;
  }

  function resize() {
    if (!renderer || !mount) return;
    var w = mount.clientWidth || window.innerWidth || 640;
    var h = mount.clientHeight || window.innerHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = h > w ? 92 : 68;
    camera.updateProjectionMatrix();
    if (torchMaterial) torchMaterial.uniforms.scale.value = h * (renderer.getPixelRatio ? renderer.getPixelRatio() : 1) * 0.5;
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Geometry buffer with per-cell colour ranges
  // ---------------------------------------------------------------------------
  function QuadBuffer() {
    this.pos = []; this.norm = []; this.uv = []; this.col = []; this.idx = [];
    this.cell = null; this.rangeStart = 0; this.ranges = [];
  }

  QuadBuffer.prototype.begin = function(cellId) {
    this.cell = cellId;
    this.rangeStart = this.pos.length / 3;
  };

  QuadBuffer.prototype.end = function() {
    var count = this.pos.length / 3 - this.rangeStart;
    if (count > 0) this.ranges.push({ cell: this.cell, start: this.rangeStart, count: count });
    this.cell = null;
  };

  /**
   * Push a quad (corners in order) whose normal must face `inside`
   */
  QuadBuffer.prototype.push = function(corners, uvs, inside) {
    var a = corners[0], b = corners[1], c = corners[2];
    var ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    var ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    var n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    var toIn = [inside[0] - a[0], inside[1] - a[1], inside[2] - a[2]];
    var order = corners, uvOrder = uvs;
    if (n[0] * toIn[0] + n[1] * toIn[1] + n[2] * toIn[2] < 0) {
      order = [corners[0], corners[3], corners[2], corners[1]];
      uvOrder = [uvs[0], uvs[3], uvs[2], uvs[1]];
      n = [-n[0], -n[1], -n[2]];
    }
    var len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
    var base = this.pos.length / 3;
    for (var i = 0; i < 4; i++) {
      this.pos.push(order[i][0], order[i][1], order[i][2]);
      this.norm.push(n[0] / len, n[1] / len, n[2] / len);
      this.uv.push(uvOrder[i][0], uvOrder[i][1]);
      this.col.push(0, 0, 0);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  QuadBuffer.prototype.toGeometry = function() {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.norm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    return g;
  };

  // ---------------------------------------------------------------------------
  // Chamber construction
  // ---------------------------------------------------------------------------

  /** Point on the wall plane of side `dir`: s along the wall (right = +), y up, out = toward the wall (+) */
  function wallPoint(c, ax, s, y, out) {
    return [c.x + ax.dx * out + ax.rx * s, y, c.z + ax.dz * out + ax.rz * s];
  }

  /** Octagon vertices in clockwise order (N side A,B; E side A,B; ...) scaled about the centre */
  function octagon(c, f, y) {
    var pts = [];
    for (var i = 0; i < 4; i++) {
      var ax = axes(FpWorld.DIRS[i]);
      pts.push(wallPoint(c, ax, -(CH - CF) * f, y, CH * f));
      pts.push(wallPoint(c, ax, (CH - CF) * f, y, CH * f));
    }
    return pts;
  }

  function pushFan(buf, pts, uvOf, inside) {
    // 8-gon as three quads
    var q = [[0, 1, 2, 3], [0, 3, 4, 5], [0, 5, 6, 7]];
    for (var i = 0; i < q.length; i++) {
      var corners = [pts[q[i][0]], pts[q[i][1]], pts[q[i][2]], pts[q[i][3]]];
      buf.push(corners, corners.map(uvOf), inside);
    }
  }

  function floorUv(p) { return [p[0] / (UVS * 1.3), p[2] / (UVS * 1.3)]; }

  /** Solid wall panel (full side between the chamfers) */
  function pushSolidWall(buf, c, ax, inside) {
    var s0 = -(CH - CF), s1 = CH - CF;
    buf.push([wallPoint(c, ax, s0, 0, CH), wallPoint(c, ax, s1, 0, CH), wallPoint(c, ax, s1, WALL_TOP, CH), wallPoint(c, ax, s0, WALL_TOP, CH)],
      [[s0 / UVS, 0], [s1 / UVS, 0], [s1 / UVS, WALL_TOP / UVS], [s0 / UVS, WALL_TOP / UVS]], inside);
  }

  /** Wall panel with an arched opening in the middle */
  function pushArchWall(buf, c, ax, inside) {
    var s0 = -(CH - CF), s1 = CH - CF;
    // piers
    buf.push([wallPoint(c, ax, s0, 0, CH), wallPoint(c, ax, -PR, 0, CH), wallPoint(c, ax, -PR, WALL_TOP, CH), wallPoint(c, ax, s0, WALL_TOP, CH)],
      [[s0 / UVS, 0], [-PR / UVS, 0], [-PR / UVS, WALL_TOP / UVS], [s0 / UVS, WALL_TOP / UVS]], inside);
    buf.push([wallPoint(c, ax, PR, 0, CH), wallPoint(c, ax, s1, 0, CH), wallPoint(c, ax, s1, WALL_TOP, CH), wallPoint(c, ax, PR, WALL_TOP, CH)],
      [[PR / UVS, 0], [s1 / UVS, 0], [s1 / UVS, WALL_TOP / UVS], [PR / UVS, WALL_TOP / UVS]], inside);
    // arch head: segments between the arc and the wall top
    var SEG = 8;
    for (var i = 0; i < SEG; i++) {
      var t0 = Math.PI - (i / SEG) * Math.PI, t1 = Math.PI - ((i + 1) / SEG) * Math.PI;
      var sa = PR * Math.cos(t0), ya = PH + PR * Math.sin(t0);
      var sb = PR * Math.cos(t1), yb = PH + PR * Math.sin(t1);
      buf.push([wallPoint(c, ax, sa, ya, CH), wallPoint(c, ax, sb, yb, CH), wallPoint(c, ax, sb, WALL_TOP, CH), wallPoint(c, ax, sa, WALL_TOP, CH)],
        [[sa / UVS, ya / UVS], [sb / UVS, yb / UVS], [sb / UVS, WALL_TOP / UVS], [sa / UVS, WALL_TOP / UVS]], inside);
    }
  }

  /** Short passage from the chamber wall to the cell boundary: floor, side walls, barrel vault */
  function pushPassage(bufs, c, ax, cellId) {
    var o0 = CH, o1 = CELL / 2 + 0.01;
    var mid = wallPoint(c, ax, 0, 1.2, (o0 + o1) / 2);
    // floor
    bufs.floor.push([wallPoint(c, ax, -PR, 0, o0), wallPoint(c, ax, PR, 0, o0), wallPoint(c, ax, PR, 0, o1), wallPoint(c, ax, -PR, 0, o1)],
      [floorUv(wallPoint(c, ax, -PR, 0, o0)), floorUv(wallPoint(c, ax, PR, 0, o0)), floorUv(wallPoint(c, ax, PR, 0, o1)), floorUv(wallPoint(c, ax, -PR, 0, o1))], mid);
    // side walls
    var wb = bufs.wall;
    wb.push([wallPoint(c, ax, -PR, 0, o0), wallPoint(c, ax, -PR, 0, o1), wallPoint(c, ax, -PR, PH, o1), wallPoint(c, ax, -PR, PH, o0)],
      [[o0 / UVS, 0], [o1 / UVS, 0], [o1 / UVS, PH / UVS], [o0 / UVS, PH / UVS]], mid);
    wb.push([wallPoint(c, ax, PR, 0, o0), wallPoint(c, ax, PR, 0, o1), wallPoint(c, ax, PR, PH, o1), wallPoint(c, ax, PR, PH, o0)],
      [[o0 / UVS, 0], [o1 / UVS, 0], [o1 / UVS, PH / UVS], [o0 / UVS, PH / UVS]], mid);
    // vault
    var SEG = 6;
    for (var i = 0; i < SEG; i++) {
      var t0 = Math.PI - (i / SEG) * Math.PI, t1 = Math.PI - ((i + 1) / SEG) * Math.PI;
      var sa = PR * Math.cos(t0), ya = PH + PR * Math.sin(t0);
      var sb = PR * Math.cos(t1), yb = PH + PR * Math.sin(t1);
      bufs.ceiling.push([wallPoint(c, ax, sa, ya, o0), wallPoint(c, ax, sb, yb, o0), wallPoint(c, ax, sb, yb, o1), wallPoint(c, ax, sa, ya, o1)],
        [[t0 * PR / UVS, o0 / UVS], [t1 * PR / UVS, o0 / UVS], [t1 * PR / UVS, o1 / UVS], [t0 * PR / UVS, o1 / UVS]], mid);
    }
  }

  /** Cloister vault: rings of octagons rising to a flat cap */
  function pushVault(buf, c) {
    var rings = [[1.0, WALL_TOP], [0.72, 5.15], [0.42, 5.75], [0.18, CEIL_MAX]];
    var inside = [c.x, EYE, c.z];
    for (var r = 0; r + 1 < rings.length; r++) {
      var a = octagon(c, rings[r][0], rings[r][1]);
      var b = octagon(c, rings[r + 1][0], rings[r + 1][1]);
      for (var i = 0; i < 8; i++) {
        var j = (i + 1) % 8;
        var corners = [a[i], a[j], b[j], b[i]];
        buf.push(corners, corners.map(function(p) { return [p[0] / UVS, (p[2] + p[1] * 0.7) / UVS]; }), inside);
      }
    }
    var cap = octagon(c, rings[rings.length - 1][0], rings[rings.length - 1][1]);
    pushFan(buf, cap, function(p) { return [p[0] / UVS, p[2] / UVS]; }, inside);
  }

  function pushLava(bufs, c, cell) {
    var alongX = (cell.x + cell.y) % 2 === 0;
    var ax = axes(alongX ? 'E' : 'S');
    var half = 0.8, len = CH + 0.3;
    var y = 0.04;
    var inside = [c.x, EYE, c.z];
    var corners = [wallPoint(c, ax, -half, y, -len), wallPoint(c, ax, half, y, -len), wallPoint(c, ax, half, y, len), wallPoint(c, ax, -half, y, len)];
    bufs.lava.push(corners, [[0, 0], [0.5, 0], [0.5, len * 2 / 4], [0, len * 2 / 4]], inside);
    // stone bridge slab over the river at the chamber centre
    var bw = 1.4, bl = half + 0.25;
    var bx = axes(alongX ? 'S' : 'E');
    var slab = [wallPoint(c, bx, -bl, 0.12, -bw), wallPoint(c, bx, bl, 0.12, -bw), wallPoint(c, bx, bl, 0.12, bw), wallPoint(c, bx, -bl, 0.12, bw)];
    bufs.floor.push(slab, slab.map(floorUv), inside);
    // glowing rim strips beside the river
    for (var side = -1; side <= 1; side += 2) {
      var s0 = half * side, s1 = (half + 0.18) * side;
      var rim = [wallPoint(c, ax, s0, 0.05, -len), wallPoint(c, ax, s1, 0.05, -len), wallPoint(c, ax, s1, 0.05, len), wallPoint(c, ax, s0, 0.05, len)];
      bufs.lava.push(rim, [[0.9, 0], [1, 0], [1, len / 2], [0.9, len / 2]], inside);
    }
  }

  function pushBars(buf, c, ax, inside) {
    var top = PH + PR;
    for (var i = -2; i <= 2; i++) {
      var s = i * 0.45;
      buf.push([wallPoint(c, ax, s - 0.05, 0, CH - 0.05), wallPoint(c, ax, s + 0.05, 0, CH - 0.05), wallPoint(c, ax, s + 0.05, top, CH - 0.05), wallPoint(c, ax, s - 0.05, top, CH - 0.05)],
        [[0, 0], [1, 0], [1, 1], [0, 1]], inside);
    }
    for (var y = 0.9; y < top; y += 1.1) {
      buf.push([wallPoint(c, ax, -PR, y - 0.05, CH - 0.06), wallPoint(c, ax, PR, y - 0.05, CH - 0.06), wallPoint(c, ax, PR, y + 0.05, CH - 0.06), wallPoint(c, ax, -PR, y + 0.05, CH - 0.06)],
        [[0, 0], [1, 0], [1, 1], [0, 1]], inside);
    }
  }

  function pushVines(buf, c, ax, inside) {
    var n = 1 + (rnd() < 0.5 ? 1 : 0);
    for (var i = 0; i < n; i++) {
      var s = (rnd() - 0.5) * 2.2;
      var w = 0.9 + rnd() * 0.7, h = 1.1 + rnd() * 0.9;
      var top = PH + PR + 0.45 + rnd() * 0.3;
      var out = CH - 0.15;
      buf.push([wallPoint(c, ax, s - w / 2, top - h, out), wallPoint(c, ax, s + w / 2, top - h, out), wallPoint(c, ax, s + w / 2, top, out), wallPoint(c, ax, s - w / 2, top, out)],
        [[0, 0], [1, 0], [1, 1], [0, 1]], inside);
    }
  }

  function pushTorchBracket(buf, p, ax, inside) {
    // small wooden stub sticking out of the wall
    var y0 = p[1] - 0.45, y1 = p[1] - 0.05;
    buf.push([[p[0] - ax.rx * 0.06, y0, p[2] - ax.rz * 0.06], [p[0] + ax.rx * 0.06, y0, p[2] + ax.rz * 0.06], [p[0] + ax.rx * 0.06, y1, p[2] + ax.rz * 0.06], [p[0] - ax.rx * 0.06, y1, p[2] - ax.rz * 0.06]],
      [[0, 0], [1, 0], [1, 1], [0, 1]], inside);
  }

  function disposeScene() {
    for (var i = 0; i < meshes.length; i++) {
      scene.remove(meshes[i]);
      if (meshes[i].geometry) meshes[i].geometry.dispose();
    }
    meshes = [];
    Object.keys(entities).forEach(removeEntity);
    if (torchPoints) { scene.remove(torchPoints); torchGeom.dispose(); torchPoints = null; }
    if (gateRune) { scene.remove(gateRune); gateRune = null; }
    cellRanges = {}; pillarInstances = {}; brightness = {}; lavaCells = {}; torchList = [];
    gateBars = null; gateHost = null; pillars = null;
  }

  function makeMaterials(textures) {
    materials.textures = textures;
    materials.wall = new THREE.MeshLambertMaterial({ map: textures.wall, vertexColors: true });
    materials.wallMoss = new THREE.MeshLambertMaterial({ map: textures.wallMoss, vertexColors: true });
    materials.floor = new THREE.MeshLambertMaterial({ map: textures.floor, vertexColors: true });
    materials.ceiling = new THREE.MeshLambertMaterial({ map: textures.ceiling, vertexColors: true });
    materials.lava = new THREE.MeshBasicMaterial({ map: textures.lava, vertexColors: true, fog: true });
    materials.iron = new THREE.MeshLambertMaterial({ color: 0x2b2b33, vertexColors: true });
    materials.wood = new THREE.MeshLambertMaterial({ color: 0x5a3a18, vertexColors: true });
    materials.vine = new THREE.MeshLambertMaterial({ map: textures.vine, vertexColors: true, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: false });
    materials.pillar = new THREE.MeshLambertMaterial({ map: textures.wall });
  }

  /**
   * Build all static geometry for a world
   */
  function buildScene(w, textures) {
    world = w;
    if (!renderer) return;
    disposeScene();
    seedRnd = 7;
    if (textures) makeMaterials(textures);

    var bufs = {
      wall: new QuadBuffer(), wallMoss: new QuadBuffer(), floor: new QuadBuffer(), ceiling: new QuadBuffer(),
      lava: new QuadBuffer(), iron: new QuadBuffer(), wood: new QuadBuffer(), vine: new QuadBuffer()
    };
    var pillarPos = [];
    var ids = Object.keys(w.cells);
    var bossHost = null;

    for (var n = 0; n < ids.length; n++) {
      var cell = w.cells[ids[n]];
      var c = cellCenter(cell);
      var inside = [c.x, EYE, c.z];
      var mossy = ((cell.x * 3 + cell.y * 5) % 3) === 0;
      var wallBuf = mossy ? bufs.wallMoss : bufs.wall;
      var isLava = cell.type === 'boss' || ((cell.x * 7 + cell.y * 11 + 3) % 4 === 0 && cell.type !== 'entrance');
      Object.keys(bufs).forEach(function(k) { bufs[k].begin(cell.id); });

      // floor + vault
      pushFan(bufs.floor, octagon(c, 1.02, 0), floorUv, inside);
      pushVault(bufs.ceiling, c);
      if (isLava) { lavaCells[cell.id] = true; pushLava(bufs, c, cell); }

      // sides
      for (var d = 0; d < 4; d++) {
        var dir = FpWorld.DIRS[d];
        var ax = axes(dir);
        if (cell.walls[dir]) {
          pushSolidWall(wallBuf, c, ax, inside);
        } else {
          pushArchWall(wallBuf, c, ax, inside);
          pushPassage({ floor: bufs.floor, wall: wallBuf, ceiling: bufs.ceiling }, c, ax, cell.id);
          pushVines(bufs.vine, c, ax, inside);
          // torches beside the doorway
          for (var side = -1; side <= 1; side += 2) {
            var tp = wallPoint(c, ax, side * (PR + 0.75), 2.7, CH - 0.28);
            torchList.push({ cellId: cell.id, x: tp[0], y: tp[1], z: tp[2], phase: rnd() });
            pushTorchBracket(bufs.wood, tp, ax, inside);
          }
          if (cell.portal && cell.portal.dir === dir && cell.type !== 'boss') {
            bossHost = { cell: cell, ax: ax, c: c };
          }
        }
        // chamfer between this side's B and next side's A
        var nax = axes(FpWorld.DIRS[(d + 1) % 4]);
        var B = wallPoint(c, ax, CH - CF, 0, CH), A = wallPoint(c, nax, -(CH - CF), 0, CH);
        wallBuf.push([B, A, [A[0], WALL_TOP, A[2]], [B[0], WALL_TOP, B[2]]],
          [[0, 0], [CF * 1.4 / UVS, 0], [CF * 1.4 / UVS, WALL_TOP / UVS], [0, WALL_TOP / UVS]], inside);
        // pillar at the chamfer, pulled slightly into the room
        var px = (A[0] + B[0]) / 2, pz = (A[2] + B[2]) / 2;
        var tx = c.x - px, tz = c.z - pz, tl = Math.sqrt(tx * tx + tz * tz);
        pillarPos.push({ cell: cell.id, x: px + tx / tl * 0.25, z: pz + tz / tl * 0.25 });
      }
      Object.keys(bufs).forEach(function(k) { bufs[k].end(); });
      brightness[cell.id] = { cur: 0, target: 0 };
    }

    // dragon gate bars on the boss host chamber
    if (bossHost) {
      bufs.iron.begin(bossHost.cell.id);
      pushBars(bufs.iron, bossHost.c, bossHost.ax, [bossHost.c.x, EYE, bossHost.c.z]);
      bufs.iron.end();
      gateHost = bossHost;
    }

    var list = [['wall', 'wall'], ['wallMoss', 'wallMoss'], ['floor', 'floor'], ['ceiling', 'ceiling'], ['lava', 'lava'], ['iron', 'iron'], ['wood', 'wood'], ['vine', 'vine']];
    for (var i = 0; i < list.length; i++) {
      var buf = bufs[list[i][0]];
      if (buf.idx.length === 0) continue;
      var mesh = new THREE.Mesh(buf.toGeometry(), materials[list[i][1]]);
      mesh.frustumCulled = false;
      scene.add(mesh);
      meshes.push(mesh);
      if (list[i][0] === 'iron') gateBars = mesh;
      for (var r = 0; r < buf.ranges.length; r++) {
        var rg = buf.ranges[r];
        if (!cellRanges[rg.cell]) cellRanges[rg.cell] = [];
        cellRanges[rg.cell].push({ mesh: mesh, start: rg.start, count: rg.count });
      }
    }

    // pillars (instanced cylinders)
    var pg = new THREE.CylinderGeometry(0.42, 0.5, WALL_TOP + 0.6, 10, 1, false);
    pg.translate(0, (WALL_TOP + 0.6) / 2, 0);
    pillars = new THREE.InstancedMesh(pg, materials.pillar, pillarPos.length);
    var m = new THREE.Matrix4();
    var black = new THREE.Color(0, 0, 0);
    for (i = 0; i < pillarPos.length; i++) {
      m.makeTranslation(pillarPos[i].x, 0, pillarPos[i].z);
      pillars.setMatrixAt(i, m);
      pillars.setColorAt(i, black);
      if (!pillarInstances[pillarPos[i].cell]) pillarInstances[pillarPos[i].cell] = [];
      pillarInstances[pillarPos[i].cell].push(i);
    }
    pillars.instanceMatrix.needsUpdate = true;
    pillars.frustumCulled = false;
    scene.add(pillars);
    meshes.push(pillars);

    buildTorches();

    // rune glow above the gate
    if (gateHost && materials.textures.rune) {
      var rm = new THREE.SpriteMaterial({ map: materials.textures.rune, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
      gateRune = new THREE.Sprite(rm);
      var gp = wallPoint(gateHost.c, gateHost.ax, 0, PH + PR + 0.55, CH - 0.12);
      gateRune.position.set(gp[0], gp[1], gp[2]);
      gateRune.scale.set(1.3, 1.3, 1);
      scene.add(gateRune);
      var gl = wallPoint(gateHost.c, gateHost.ax, 0, 2.2, CH - 1.2);
      gateLight.position.set(gl[0], gl[1], gl[2]);
    }

    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Torches (one Points draw call, flicker in the shader)
  // ---------------------------------------------------------------------------
  var FLAME_VERT = [
    'attribute float phase;',
    'attribute float lit;',
    'uniform float time;',
    'uniform float scale;',
    'varying float vPhase;',
    'varying float vLit;',
    'void main() {',
    '  vPhase = phase; vLit = lit;',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  float flick = 1.0 + 0.16 * sin(time * 11.0 + phase * 40.0) + 0.09 * sin(time * 23.0 + phase * 17.0);',
    '  gl_PointSize = 1.6 * flick * scale / max(0.3, -mv.z);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');
  var FLAME_FRAG = [
    'uniform sampler2D map;',
    'uniform float time;',
    'varying float vPhase;',
    'varying float vLit;',
    'void main() {',
    '  float f = floor(mod(time * 9.0 + vPhase * 4.0, 4.0));',
    '  vec2 uv = vec2((gl_PointCoord.x + f) / 4.0, 1.0 - gl_PointCoord.y);',
    '  vec4 c = texture2D(map, uv);',
    '  c.a *= vLit;',
    '  if (c.a < 0.04) discard;',
    '  gl_FragColor = c;',
    '}'
  ].join('\n');

  function buildTorches() {
    if (!torchList.length) return;
    var pos = [], phase = [], lit = [];
    for (var i = 0; i < torchList.length; i++) {
      pos.push(torchList[i].x, torchList[i].y, torchList[i].z);
      phase.push(torchList[i].phase);
      lit.push(0);
    }
    torchGeom = new THREE.BufferGeometry();
    torchGeom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    torchGeom.setAttribute('phase', new THREE.Float32BufferAttribute(phase, 1));
    torchGeom.setAttribute('lit', new THREE.Float32BufferAttribute(lit, 1));
    if (!torchMaterial) {
      torchMaterial = new THREE.ShaderMaterial({
        uniforms: { map: { value: materials.textures.flame }, time: { value: 0 }, scale: { value: 400 } },
        vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
    } else {
      torchMaterial.uniforms.map.value = materials.textures.flame;
    }
    torchPoints = new THREE.Points(torchGeom, torchMaterial);
    torchPoints.frustumCulled = false;
    scene.add(torchPoints);
    resize();
  }

  function updateTorchLit() {
    if (!torchGeom) return;
    var attr = torchGeom.getAttribute('lit');
    for (var i = 0; i < torchList.length; i++) {
      var b = brightness[torchList[i].cellId];
      attr.array[i] = b ? b.cur : 0;
    }
    attr.needsUpdate = true;
  }

  // ---------------------------------------------------------------------------
  // Fog of war (per-cell brightness)
  // ---------------------------------------------------------------------------
  function applyBrightness(cellId, v) {
    var ranges = cellRanges[cellId] || [];
    for (var i = 0; i < ranges.length; i++) {
      var attr = ranges[i].mesh.geometry.getAttribute('color');
      var arr = attr.array;
      for (var k = ranges[i].start * 3; k < (ranges[i].start + ranges[i].count) * 3; k++) arr[k] = v;
      attr.needsUpdate = true;
    }
    var inst = pillarInstances[cellId] || [];
    if (pillars && inst.length) {
      var col = new THREE.Color(v, v, v);
      for (i = 0; i < inst.length; i++) pillars.setColorAt(inst[i], col);
      pillars.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Set brightness targets: explored chambers full, chambers seen through a
   * doorway dim, everything else black
   */
  function setVisibility(exploredIds, seenIds) {
    var explored = {}, seen = {};
    for (var i = 0; i < exploredIds.length; i++) explored[exploredIds[i]] = true;
    for (i = 0; i < seenIds.length; i++) seen[seenIds[i]] = true;
    Object.keys(brightness).forEach(function(id) {
      var t = explored[id] ? 1 : (seen[id] ? SEEN_LEVEL : 0);
      if (brightness[id].target !== t) {
        brightness[id].target = t;
        brightening = true;
      }
      if (reducedMotion && brightness[id].cur !== t) {
        brightness[id].cur = t;
        applyBrightness(id, t);
      }
    });
    if (gateHost) {
      var g = brightness[gateHost.cell.id];
      gateLight.visible = !!(g && g.target > 0);
    }
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
      if (Math.abs(d) <= step) b.cur = b.target; else b.cur += Math.sign(d) * step;
      applyBrightness(ids[i], b.cur);
      if (b.cur !== b.target) still = true;
    }
    brightening = still;
    updateTorchLit();
    if (gateRune) gateRune.material.opacity = brightness[gateHost.cell.id].cur;
    dirty = true;
  }

  function cellBrightness(id) { return brightness[id] ? brightness[id].cur : 0; }
  function hasLava(id) { return !!lavaCells[id]; }
  function gateRoomId() { return gateHost ? gateHost.cell.id : null; }

  // ---------------------------------------------------------------------------
  // Lights: pool assigned to the brightest chambers nearest the camera
  // ---------------------------------------------------------------------------
  function updateLights(t) {
    if (!world) return;
    var cand = [], lava = [];
    var ids = Object.keys(brightness);
    for (var i = 0; i < ids.length; i++) {
      var b = brightness[ids[i]].cur;
      if (b <= 0.01) continue;
      var c = cellCenter(world.cells[ids[i]]);
      var dx = c.x - pose.x, dz = c.z - pose.z;
      var entry = { id: ids[i], x: c.x, z: c.z, b: b, d: dx * dx + dz * dz };
      cand.push(entry);
      if (lavaCells[ids[i]]) lava.push(entry);
    }
    cand.sort(function(a, b) { return a.d - b.d; });
    lava.sort(function(a, b) { return a.d - b.d; });
    for (i = 0; i < lights.length; i++) {
      var L = lights[i], e = cand[i];
      if (!e) { L.visible = false; continue; }
      L.visible = true;
      L.position.set(e.x, 3.1, e.z);
      var flick = 0.9 + 0.1 * Math.sin(t * 9 + i * 2.1) + 0.05 * Math.sin(t * 17 + i);
      L.intensity = 60 * e.b * flick;
    }
    for (i = 0; i < lavaLights.length; i++) {
      var LL = lavaLights[i], le = lava[i];
      if (!le) { LL.visible = false; continue; }
      LL.visible = true;
      LL.position.set(le.x, 0.6, le.z);
      LL.intensity = 34 * le.b * (0.85 + 0.15 * Math.sin(t * 3 + i));
    }
    if (gateLight.visible) gateLight.intensity = 28 * cellBrightness(gateHost.cell.id) * (0.85 + 0.15 * Math.sin(t * 2.3));
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

  function setPose(roomId, facing) {
    var cell = world && world.cells[roomId];
    if (!cell) return;
    var c = cellCenter(cell);
    pose.x = c.x; pose.z = c.z; pose.yaw = FpWorld.YAW[facing];
    tween = null; bob = 0;
    applyPose();
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
    startTween({ x: c.x, z: c.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 520, easeInOut, done, true);
  }

  function animateTurn(facing, ms, done) {
    startTween({ x: pose.x, z: pose.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 240, easeInOut, done);
  }

  function animateKnockback(toId, facing, ms, done) {
    var c = cellCenter(world.cells[toId]);
    pose.yaw = FpWorld.YAW[facing];
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
    if (gateBars) { gateBars.visible = false; dirty = true; }
  }

  // ---------------------------------------------------------------------------
  // Entities (billboards)
  // ---------------------------------------------------------------------------
  var HEIGHTS = { monster: 3.0, dragon: 5.4, treasure: 1.6 };

  /**
   * Place a billboard in a chamber, at the far side seen from `fromDir`
   * (the direction the player is facing when entering); fades in over `fadeMs`.
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
    sprite.position.set(c.x + ax.dx * dist, h / 2 + 0.02, c.z + ax.dz * dist);
    scene.add(sprite);
    var entry = { sprite: sprite, imageId: info.imageId, ready: false };
    entities[roomId] = entry;
    FpTextures.billboard(info.imageId).then(function(b) {
      if (entities[roomId] !== entry) return;
      mat.map = b.texture;
      mat.needsUpdate = true;
      sprite.scale.set(h * b.aspect, h, 1);
      sprite.position.y = h / 2 + 0.02;
      entry.ready = true;
      sprite.visible = true;
      if (info.fadeMs && !reducedMotion) {
        fades.push({ mat: mat, from: 0, to: 1, start: performance.now(), ms: info.fadeMs });
        startLoop();
      } else {
        mat.opacity = 1;
      }
      dirty = true;
    });
  }

  function removeEntity(roomId) {
    var e = entities[roomId];
    if (!e) return;
    scene.remove(e.sprite);
    e.sprite.material.dispose();
    delete entities[roomId];
    dirty = true;
  }

  function hideEntity(roomId, hidden) {
    var e = entities[roomId];
    if (!e) return;
    e.sprite.visible = e.ready && !hidden;
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
    renderer.render(scene, camera);
    dirty = false;
  }

  function frame(now) {
    rafId = null;
    if (!running) return;
    var dt = lastNow ? Math.min(0.5, (now - lastNow) / 1000) : 0.016;
    lastNow = now;
    clock += dt;
    if (tween) stepTween(now);
    if (fades.length) stepFades(now);
    if (brightening) stepBrightness(dt);
    if (animated || tween || fades.length || brightening) {
      if (torchMaterial) torchMaterial.uniforms.time.value = clock;
      if (materials.lava && materials.lava.map) { materials.lava.map.offset.y = (clock * 0.06) % 1; materials.lava.map.offset.x = Math.sin(clock * 0.4) * 0.02; }
      updateLights(clock);
      dirty = true;
    }
    if (dirty) render();
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

  function resume() { if (!renderer) return; running = true; animated = !reducedMotion; dirty = true; startLoop(); }
  function pause() { animated = false; }
  function stop() { running = false; animated = false; stopLoop(); }

  function getPose() { return { x: pose.x, z: pose.z, yaw: pose.yaw, camX: camera ? camera.position.x : pose.x, camZ: camera ? camera.position.z : pose.z }; }
  function getRenderInfo() { return renderer ? renderer.info.render : null; }
  function markDirty() { dirty = true; startLoop(); }

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
    getPose: getPose,
    getRenderInfo: getRenderInfo
  };
})();
