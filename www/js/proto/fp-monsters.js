/**
 * FpMonsters
 * 3D monster models for the first-person view. Each model was generated from
 * the monster's cutout with Microsoft TRELLIS (image-to-3D, MIT) and prepared
 * in Blender by tools/monsters3d/prepare.py: base on the floor, centred,
 * ~9k triangles, 512 px texture. Monsters without a model keep the billboard.
 *
 * The models are static meshes; life comes from procedural motion here:
 * a breathing idle (with a hover for flyers and a squash for the slime),
 * a flinch when Mr Owl answers correctly and a lunge when he is wrong.
 *
 * Pure part (no three.js): model config, idle/flinch/lunge transforms.
 * three.js part: load() and instance().
 */

var FpMonsters = (function() {
  var DIR = 'assets/proto/fp/monsters/';

  // height in world units (Mr Owl is 1.35), motion style, lift off the floor,
  // yaw (degrees) turning a side-on model's face toward the player
  var MODELS = {
    goblin: { height: 1.9, motion: 'breathe' },
    giant_rat: { height: 1.6, motion: 'breathe' },
    slime: { height: 1.5, motion: 'squash' },
    bat_swarm: { height: 1.4, motion: 'hover', lift: 0.6 },
    zombie: { height: 2.4, motion: 'sway' },
    mimic: { height: 1.5, motion: 'breathe' },
    wolf: { height: 1.5, motion: 'breathe', yaw: -45 },
    giant_snake: { height: 2.4, motion: 'sway', yaw: -30 },
    vampire_bunny: { height: 1.6, motion: 'hover', lift: 0.15, yaw: -60 }
  };

  var FLINCH_MS = 450;
  var LUNGE_MS = 650;

  function has(id) { return Object.prototype.hasOwnProperty.call(MODELS, id); }

  function config(id) { return has(id) ? MODELS[id] : null; }

  function url(id) { return DIR + id + '.glb'; }

  /**
   * Transform offsets for a monster at time t (seconds)
   * @param {string} motion - 'breathe' | 'squash' | 'hover' | 'sway'
   * @param {number} t - clock seconds
   * @param {number} phase - per-instance offset so neighbours are not in sync
   * @param {Object} ev - { flinch: 0..1 progress or -1, lunge: 0..1 progress or -1 }
   * @returns {Object} { y, sx, sy, sz, rotZ, rotX, forward } (forward: toward the player)
   */
  function pose(motion, t, phase, ev) {
    var p = t * 2 * Math.PI / 2.4 + (phase || 0);
    var s = Math.sin(p);
    var out = { y: 0, sx: 1, sy: 1, sz: 1, rotZ: 0, rotX: 0, forward: 0 };
    switch (motion) {
      case 'squash':
        out.sy = 1 + 0.07 * s;
        out.sx = out.sz = 1 - 0.035 * s;
        break;
      case 'hover':
        out.y = 0.12 * (1 + Math.sin(p * 1.6));
        out.rotZ = 0.05 * Math.sin(p * 0.8);
        break;
      case 'sway':
        out.rotZ = 0.06 * s;
        out.sy = 1 + 0.015 * Math.sin(p * 2);
        break;
      default:
        out.sy = 1 + 0.025 * s;
        out.sx = out.sz = 1 - 0.01 * s;
    }
    ev = ev || {};
    if (ev.flinch >= 0 && ev.flinch <= 1) {
      // recoil back and shiver
      var f = Math.sin(ev.flinch * Math.PI);
      out.forward -= 0.35 * f;
      out.rotX -= 0.18 * f;
      out.rotZ += 0.08 * Math.sin(ev.flinch * Math.PI * 6) * (1 - ev.flinch);
    }
    if (ev.lunge >= 0 && ev.lunge <= 1) {
      // wind up, then snap forward and settle
      var l = ev.lunge;
      var fwd = l < 0.25 ? -0.25 * (l / 0.25) : (l < 0.5 ? -0.25 + 1.45 * ((l - 0.25) / 0.25) : 1.2 * (1 - (l - 0.5) / 0.5));
      out.forward += fwd;
      out.rotX += 0.15 * Math.max(0, fwd);
      out.sy *= 1 + 0.08 * Math.max(0, fwd);
    }
    return out;
  }

  /** Progress of a timed reaction (0..1) or -1 when not running */
  function progress(startMs, nowMs, durMs) {
    if (!startMs) return -1;
    var t = (nowMs - startMs) / durMs;
    return t >= 0 && t <= 1 ? t : -1;
  }

  // ---------------------------------------------------------------------------
  // three.js
  // ---------------------------------------------------------------------------

  var cache = {};

  /**
   * Load a monster model once
   * @returns {Promise} resolves with the GLTF or null (no model / load error)
   */
  function load(id) {
    if (!has(id)) return Promise.resolve(null);
    if (cache[id]) return cache[id];
    cache[id] = new Promise(function(resolve) {
      if (typeof THREE === 'undefined' || !THREE.GLTFLoader) { resolve(null); return; }
      new THREE.GLTFLoader().load(url(id), resolve, undefined, function(err) {
        console.warn('FpMonsters: ' + id + ' unavailable', err && err.message ? err.message : err);
        resolve(null);
      });
    });
    return cache[id];
  }

  /**
   * A placeable copy of a loaded model, scaled to the configured height.
   * Materials are cloned so the instance can fade on its own.
   * @returns {Object} { root, pivot, materials, height, footprint }
   */
  function instance(id, gltf, opts) {
    opts = opts || {};
    var cfg = config(id);
    var root = new THREE.Group();
    var pivot = new THREE.Group();      // animated: bob, squash, lunge
    root.add(pivot);
    var model = gltf.scene.clone(true);
    var box = new THREE.Box3().setFromObject(model);
    var size = box.getSize(new THREE.Vector3());
    var scale = cfg.height / Math.max(0.001, size.y);
    model.scale.setScalar(scale);
    model.position.set(-(box.min.x + box.max.x) / 2 * scale, -box.min.y * scale, -(box.min.z + box.max.z) / 2 * scale);
    var turn = new THREE.Group();
    turn.rotation.y = (cfg.yaw || 0) * Math.PI / 180;
    turn.add(model);
    pivot.add(turn);
    var materials = [];
    model.traverse(function(o) {
      if (!o.isMesh) return;
      o.castShadow = !!opts.castShadow;
      o.receiveShadow = false;
      var m = o.material.clone();
      if (m.isMeshStandardMaterial) { m.metalness = 0; m.roughness = 0.75; }
      o.material = m;
      materials.push(m);
    });
    if (cfg.lift) root.position.y = cfg.lift;
    return { root: root, pivot: pivot, materials: materials, height: cfg.height, footprint: Math.max(size.x, size.z) * scale };
  }

  return {
    DIR: DIR,
    MODELS: MODELS,
    FLINCH_MS: FLINCH_MS,
    LUNGE_MS: LUNGE_MS,
    has: has,
    config: config,
    url: url,
    pose: pose,
    progress: progress,
    load: load,
    instance: instance
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FpMonsters;
}
