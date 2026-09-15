/**
 * FpRenderer
 * three.js scene for the first-person prototype: merged wall/floor/ceiling
 * geometry built from FpWorld, torch-lit with fog, camera tweens for
 * stepping/turning, billboard sprites for monsters and treasure.
 * Renders on demand (only while a tween runs or after a change).
 */

var FpRenderer = (function() {
  var CELL = 4;
  var WALL_H = 3;
  var EYE = 1.5;
  var NEAR = 0.1;
  var FAR = CELL * 6;

  var renderer = null;
  var scene = null;
  var camera = null;
  var mount = null;
  var torch = null;
  var meshes = [];
  var materials = {};
  var entities = {};
  var world = null;

  var running = false;
  var dirty = true;
  var tween = null;
  var rafId = null;
  var pose = { x: 0, z: 0, yaw: 0 };
  var reducedMotion = false;

  function rad(deg) { return deg * Math.PI / 180; }

  function cellCenter(cell) {
    return { x: cell.x * CELL, z: cell.y * CELL };
  }

  /**
   * Create the WebGL renderer inside `opts.mount`
   * @returns {boolean} false when WebGL is unavailable
   */
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
    renderer.domElement.addEventListener('webglcontextlost', function(e) {
      e.preventDefault();
      console.warn('FpRenderer: context lost');
    });
    renderer.domElement.addEventListener('webglcontextrestored', function() {
      console.warn('FpRenderer: context restored, rebuilding');
      if (world) buildScene(world, materials.textures);
      dirty = true;
    });
    mount.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    scene.fog = new THREE.Fog(0x05060a, CELL * 1.2, CELL * 4.5);

    camera = new THREE.PerspectiveCamera(70, 4 / 3, NEAR, FAR);
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0x3a3a4c));
    torch = new THREE.PointLight(0xffc27a, 1.4, CELL * 4, 1);
    torch.position.set(0, 0.2, 0);
    camera.add(torch);

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) stopLoop(); else if (running) startLoop();
    });
    console.log('FpRenderer: WebGL2=' + !!(renderer.capabilities && renderer.capabilities.isWebGL2));
    return true;
  }

  function resize() {
    if (!renderer || !mount) return;
    var w = mount.clientWidth || 640;
    var h = mount.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = h > w ? 80 : 70;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Geometry
  // ---------------------------------------------------------------------------
  function QuadBuffer() {
    this.pos = [];
    this.norm = [];
    this.uv = [];
    this.idx = [];
  }

  /**
   * Push a quad with corners a,b,c,d (in order) whose normal must point toward `inside`
   */
  QuadBuffer.prototype.push = function(corners, uvs, inside) {
    var a = corners[0], b = corners[1], c = corners[2];
    var ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    var ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    var n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    var toIn = [inside[0] - a[0], inside[1] - a[1], inside[2] - a[2]];
    var dot = n[0] * toIn[0] + n[1] * toIn[1] + n[2] * toIn[2];
    var order = corners.slice();
    var uvOrder = uvs.slice();
    if (dot < 0) {
      order = [corners[0], corners[3], corners[2], corners[1]];
      uvOrder = [uvs[0], uvs[3], uvs[2], uvs[1]];
      n = [-n[0], -n[1], -n[2]];
    }
    var len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
    n = [n[0] / len, n[1] / len, n[2] / len];
    var base = this.pos.length / 3;
    for (var i = 0; i < 4; i++) {
      this.pos.push(order[i][0], order[i][1], order[i][2]);
      this.norm.push(n[0], n[1], n[2]);
      this.uv.push(uvOrder[i][0], uvOrder[i][1]);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  QuadBuffer.prototype.toGeometry = function() {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.norm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.idx);
    return g;
  };

  function wallCorners(cell, dir) {
    var c = cellCenter(cell);
    var h = CELL / 2;
    var x0 = c.x - h, x1 = c.x + h, z0 = c.z - h, z1 = c.z + h;
    switch (dir) {
      case 'N': return [[x0, 0, z0], [x1, 0, z0], [x1, WALL_H, z0], [x0, WALL_H, z0]];
      case 'S': return [[x0, 0, z1], [x1, 0, z1], [x1, WALL_H, z1], [x0, WALL_H, z1]];
      case 'E': return [[x1, 0, z0], [x1, 0, z1], [x1, WALL_H, z1], [x1, WALL_H, z0]];
      default:  return [[x0, 0, z0], [x0, 0, z1], [x0, WALL_H, z1], [x0, WALL_H, z0]];
    }
  }

  var WALL_UV = [[0, 0], [1, 0], [1, 0.75], [0, 0.75]];

  function disposeScene() {
    for (var i = 0; i < meshes.length; i++) {
      scene.remove(meshes[i]);
      meshes[i].geometry.dispose();
    }
    meshes = [];
    Object.keys(entities).forEach(removeEntity);
  }

  /**
   * Build all static geometry for a world
   * @param {Object} w - FpWorld world
   * @param {Object} textures - { wall, floor, ceiling, gate }
   */
  function buildScene(w, textures) {
    world = w;
    if (!renderer) return;
    disposeScene();

    if (textures) {
      materials.textures = textures;
      materials.wall = new THREE.MeshLambertMaterial({ map: textures.wall });
      materials.floor = new THREE.MeshLambertMaterial({ map: textures.floor });
      materials.ceiling = new THREE.MeshLambertMaterial({ map: textures.ceiling });
      materials.gate = new THREE.MeshLambertMaterial({ map: textures.gate });
    }

    var walls = new QuadBuffer();
    var gates = new QuadBuffer();
    var floors = new QuadBuffer();
    var ceilings = new QuadBuffer();

    var quads = FpWorld.getWallQuads();
    for (var i = 0; i < quads.length; i++) {
      var cell = w.cells[quads[i].roomId];
      var center = cellCenter(cell);
      walls.push(wallCorners(cell, quads[i].dir), WALL_UV, [center.x, EYE, center.z]);
    }
    var portals = FpWorld.getPortalQuads();
    for (i = 0; i < portals.length; i++) {
      var pc = w.cells[portals[i].roomId];
      var pcenter = cellCenter(pc);
      gates.push(wallCorners(pc, portals[i].dir), [[0, 0], [1, 0], [1, 1], [0, 1]], [pcenter.x, EYE, pcenter.z]);
    }

    var ids = Object.keys(w.cells);
    for (i = 0; i < ids.length; i++) {
      var cc = cellCenter(w.cells[ids[i]]);
      var h = CELL / 2;
      var fuv = [[0, 0], [1, 0], [1, 1], [0, 1]];
      floors.push([[cc.x - h, 0, cc.z - h], [cc.x + h, 0, cc.z - h], [cc.x + h, 0, cc.z + h], [cc.x - h, 0, cc.z + h]], fuv, [cc.x, EYE, cc.z]);
      ceilings.push([[cc.x - h, WALL_H, cc.z - h], [cc.x + h, WALL_H, cc.z - h], [cc.x + h, WALL_H, cc.z + h], [cc.x - h, WALL_H, cc.z + h]], fuv, [cc.x, EYE, cc.z]);
    }

    var list = [[walls, materials.wall], [gates, materials.gate], [floors, materials.floor], [ceilings, materials.ceiling]];
    for (i = 0; i < list.length; i++) {
      if (list[i][0].idx.length === 0) continue;
      var mesh = new THREE.Mesh(list[i][0].toGeometry(), list[i][1]);
      scene.add(mesh);
      meshes.push(mesh);
    }
    dirty = true;
  }

  /**
   * Swap textures after better ones resolved
   */
  function setTextures(textures) {
    materials.textures = textures;
    if (materials.wall) { materials.wall.map = textures.wall; materials.wall.needsUpdate = true; }
    if (materials.floor) { materials.floor.map = textures.floor; materials.floor.needsUpdate = true; }
    if (materials.ceiling) { materials.ceiling.map = textures.ceiling; materials.ceiling.needsUpdate = true; }
    if (materials.gate) { materials.gate.map = textures.gate; materials.gate.needsUpdate = true; }
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Camera pose and tweens
  // ---------------------------------------------------------------------------
  function applyPose() {
    if (!camera) return;
    camera.position.set(pose.x, EYE, pose.z);
    camera.rotation.set(0, rad(pose.yaw), 0);
    dirty = true;
  }

  function setPose(roomId, facing) {
    var cell = world && world.cells[roomId];
    if (!cell) return;
    var c = cellCenter(cell);
    pose.x = c.x;
    pose.z = c.z;
    pose.yaw = FpWorld.YAW[facing];
    tween = null;
    applyPose();
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }

  function shortestYaw(from, to) {
    var d = ((to - from) % 360 + 540) % 360 - 180;
    return from + d;
  }

  function startTween(target, ms, ease, done) {
    if (reducedMotion) ms = 0;
    var from = { x: pose.x, z: pose.z, yaw: pose.yaw };
    var to = { x: target.x, z: target.z, yaw: shortestYaw(pose.yaw, target.yaw) };
    if (ms === 0 || !renderer) {
      pose.x = to.x; pose.z = to.z; pose.yaw = target.yaw;
      applyPose();
      tween = null;
      setTimeout(done, 0);
      return;
    }
    tween = { from: from, to: to, start: performance.now(), ms: ms, ease: ease, done: done, finalYaw: target.yaw };
    startLoop();
  }

  function stepTween(now) {
    var t = Math.min(1, (now - tween.start) / tween.ms);
    var e = tween.ease(t);
    pose.x = tween.from.x + (tween.to.x - tween.from.x) * e;
    pose.z = tween.from.z + (tween.to.z - tween.from.z) * e;
    pose.yaw = tween.from.yaw + (tween.to.yaw - tween.from.yaw) * e;
    applyPose();
    if (t >= 1) {
      pose.yaw = tween.finalYaw;
      applyPose();
      var cb = tween.done;
      tween = null;
      if (cb) cb();
    }
  }

  function animateStep(toId, facing, ms, done) {
    var cell = world.cells[toId];
    var c = cellCenter(cell);
    startTween({ x: c.x, z: c.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 250, easeInOut, done);
  }

  function animateTurn(facing, ms, done) {
    startTween({ x: pose.x, z: pose.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 200, easeInOut, done);
  }

  function animateKnockback(toId, facing, ms, done) {
    var cell = world.cells[toId];
    var c = cellCenter(cell);
    pose.yaw = FpWorld.YAW[facing];
    startTween({ x: c.x, z: c.z, yaw: FpWorld.YAW[facing] }, typeof ms === 'number' ? ms : 350, easeOut, done);
  }

  /**
   * Fade to black, jump, fade in (portal teleport)
   */
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
      setTimeout(done, 150);
    }, 150);
  }

  /**
   * Small forward/back nudge when bumping into a wall
   */
  function animateBump(done) {
    var f = FpWorld.getFacing();
    var d = FpWorld.DELTA[f];
    var origin = { x: pose.x, z: pose.z, yaw: pose.yaw };
    startTween({ x: pose.x + d[0] * 0.3, z: pose.z + d[1] * 0.3, yaw: pose.yaw }, 90, easeOut, function() {
      startTween(origin, 120, easeOut, done);
    });
  }

  function isBusy() { return !!tween; }

  // ---------------------------------------------------------------------------
  // Entities (billboards)
  // ---------------------------------------------------------------------------
  var SCALES = { monster: [2.6, 1.42], dragon: [3.8, 2.1], treasure: [1.6, 1.2] };

  function setEntity(roomId, info) {
    if (!world || !world.cells[roomId] || !renderer) return;
    removeEntity(roomId);
    var kind = info.kind || 'monster';
    var scale = SCALES[kind] || SCALES.monster;
    var c = cellCenter(world.cells[roomId]);
    var mat = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.05, fog: true, color: 0xffffff });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale[0], scale[1], 1);
    sprite.position.set(c.x, scale[1] / 2 + 0.05, c.z);
    sprite.visible = false;
    scene.add(sprite);
    var entry = { sprite: sprite, imageId: info.imageId, hidden: false, ready: false };
    entities[roomId] = entry;
    FpTextures.billboard(info.imageId).then(function(tex) {
      if (entities[roomId] !== entry) return;
      mat.map = tex;
      mat.needsUpdate = true;
      entry.ready = true;
      sprite.visible = !entry.hidden;
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
    e.hidden = !!hidden;
    e.sprite.visible = e.ready && !e.hidden;
    dirty = true;
  }

  function hasEntity(roomId) { return !!entities[roomId]; }

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
    if (tween) stepTween(now);
    if (dirty || tween) render();
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resume() { if (!renderer) return; running = true; dirty = true; startLoop(); }
  function pause() { running = false; stopLoop(); }

  function getPose() { return { x: pose.x, z: pose.z, yaw: pose.yaw }; }
  function getRenderInfo() { return renderer ? renderer.info.render : null; }

  return {
    CELL: CELL,
    init: init,
    resize: resize,
    buildScene: buildScene,
    setTextures: setTextures,
    setPose: setPose,
    animateStep: animateStep,
    animateTurn: animateTurn,
    animateKnockback: animateKnockback,
    animateTeleport: animateTeleport,
    animateBump: animateBump,
    isBusy: isBusy,
    setEntity: setEntity,
    removeEntity: removeEntity,
    hideEntity: hideEntity,
    hasEntity: hasEntity,
    render: render,
    resume: resume,
    pause: pause,
    getPose: getPose,
    getRenderInfo: getRenderInfo
  };
})();
