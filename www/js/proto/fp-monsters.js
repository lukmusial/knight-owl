/**
 * FpMonsters
 * 3D monster models for the first-person view. Each model was generated from
 * the monster's cutout with Microsoft TRELLIS (image-to-3D, MIT) and prepared
 * in Blender by tools/monsters3d/prepare.py: base on the floor, centred,
 * ~9k triangles, 512 px texture. Monsters without a model keep the billboard.
 *
 * The models are static meshes; life comes from procedural motion here:
 * a breathing idle (with a hover for flyers and a squash for the slime) and
 * the encounter actions: appear (rise in), taunt (short lunge before the
 * quiz), hurt (recoil from Mr Owl's sword), attack (wind-up and lunge) and
 * exit (run away, fly off or vanish once defeated).
 *
 * Pure part (no three.js): model config, idle/flinch/lunge transforms.
 * three.js part: load() and instance().
 */

var FpMonsters = (function() {
  var DIR = 'assets/proto/fp/monsters/';

  // height in world units (Mr Owl is 1.35), motion style, lift off the floor,
  // yaw (degrees) turning a side-on model's face toward the player
  // exit: how a defeated monster leaves ('runaway' | 'flyaway' | 'vanish')
  var MODELS = {
    goblin: { height: 1.9, motion: 'breathe', exit: 'runaway' },
    giant_rat: { height: 1.6, motion: 'breathe', exit: 'runaway' },
    slime: { height: 1.5, motion: 'squash', exit: 'vanish' },
    bat_swarm: { height: 1.4, motion: 'hover', lift: 0.6, exit: 'flyaway' },
    zombie: { height: 2.4, motion: 'sway', exit: 'vanish' },
    mimic: { height: 1.5, motion: 'breathe', exit: 'vanish' },
    wolf: { height: 1.5, motion: 'breathe', yaw: -45, exit: 'runaway' },
    giant_snake: { height: 2.4, motion: 'sway', yaw: -30, exit: 'runaway' },
    vampire_bunny: { height: 1.6, motion: 'hover', lift: 0.15, yaw: -60, exit: 'flyaway' }
  };

  // action durations (ms)
  var ACTIONS = { appear: 900, taunt: 700, hurt: 550, attack: 900, exit: 1200 };
  var FLINCH_MS = ACTIONS.hurt;
  var LUNGE_MS = ACTIONS.attack;

  function has(id) { return Object.prototype.hasOwnProperty.call(MODELS, id); }

  function config(id) { return has(id) ? MODELS[id] : null; }

  function url(id) { return DIR + id + '.glb'; }

  /**
   * Transform offsets for a monster at time t (seconds)
   * @param {string} motion - 'breathe' | 'squash' | 'hover' | 'sway'
   * @param {number} t - clock seconds
   * @param {number} phase - per-instance offset so neighbours are not in sync
   * @param {Object} ev - progress 0..1 (or -1 when not running) of each action:
   *   { appear, taunt, flinch (hurt), lunge (attack), exit } plus exitStyle
   * @returns {Object} { y, sx, sy, sz, rotX, rotY, rotZ, forward, fade }
   *   (forward: toward the player; fade: opacity multiplier)
   */
  function pose(motion, t, phase, ev) {
    var p = t * 2 * Math.PI / 2.4 + (phase || 0);
    var s = Math.sin(p);
    var out = { y: 0, sx: 1, sy: 1, sz: 1, rotX: 0, rotY: 0, rotZ: 0, forward: 0, fade: 1 };
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
    if (ev.appear >= 0 && ev.appear <= 1) {
      // rise out of the floor with a small overshoot
      var a = ev.appear;
      var grow = a < 0.7 ? Math.max(0.001, easeOutBack(a / 0.7)) : 1;
      out.sx *= grow; out.sy *= grow; out.sz *= grow;
      out.y -= 0.4 * (1 - Math.min(1, a / 0.6));
      out.fade *= Math.min(1, a / 0.35);
    }
    if (ev.taunt >= 0 && ev.taunt <= 1) {
      // quick hop toward the player: "come on then"
      var h = Math.sin(ev.taunt * Math.PI);
      out.forward += 0.45 * h;
      out.y += 0.25 * Math.sin(ev.taunt * Math.PI * 2) * (ev.taunt < 0.5 ? 1 : 0);
      out.sy *= 1 + 0.06 * h;
    }
    if (ev.exit >= 0 && ev.exit <= 1) {
      var x = ev.exit;
      if (ev.exitStyle === 'vanish') {
        // spin, shrink and fade in a puff
        var v = x * x;
        out.rotY += v * Math.PI * 4;
        var k = Math.max(0.001, 1 - v);
        out.sx *= k; out.sy *= k; out.sz *= k;
        out.y += 0.3 * x;
        out.fade *= 1 - Math.max(0, (x - 0.5) / 0.5);
      } else {
        // turn round, then leave away from the player (flyers also climb)
        var turnT = Math.min(1, x / 0.3);
        out.rotY += Math.PI * turnT;
        var go = Math.max(0, (x - 0.25) / 0.75);
        out.forward -= 4.5 * go * go;
        if (ev.exitStyle === 'flyaway') out.y += 2.2 * go * go;
        else out.y += 0.12 * Math.abs(Math.sin(go * Math.PI * 5)) * (1 - go);
        out.fade *= 1 - Math.max(0, (x - 0.6) / 0.4);
      }
    }
    return out;
  }

  function easeOutBack(t) {
    var c = 1.7;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
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
    ACTIONS: ACTIONS,
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
