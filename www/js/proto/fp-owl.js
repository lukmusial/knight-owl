/**
 * FpOwl
 * Mr Owl as a rigged 3D figure for the first-person view and the
 * third-person ("over the shoulder") camera.
 *
 * The model (assets/proto/fp/mr_owl.glb) was generated from the Mr Owl
 * illustration with Microsoft TRELLIS (image-to-3D, MIT) and rigged and
 * animated in Blender by tools/owl3d/rig.py: skeleton root/hips/spine/head,
 * legs + feet, wings (arm + hand, the sword and shield ride rigidly on the
 * hands) and tail; clips Idle, Walk, Flap and Attack.
 *
 * Pure part (no three.js): view modes, the third-person placement of the
 * owl and camera for a pose, and which clip a movement plays.
 * three.js part: load(), then create() a controller the renderer drives with
 * setPlacement(), play() and update(dt).
 */

var FpOwl = (function() {
  var MODEL_URL = 'assets/proto/fp/mr_owl.glb';
  var MODES = ['first', 'third'];
  var STORAGE_KEY = 'fpViewMode';

  // Third-person rig (world units; a chamber is 7 wide, eye height 1.6)
  var RIG = {
    height: 1.35,        // owl figure height
    owlBack: 0.6,        // owl stands this far behind the chamber centre
    camBack: 2.6,        // camera distance behind the owl
    camSide: 0.65,       // camera offset to the owl's right (over the shoulder)
    camHeight: 2.2,
    torsoHeight: 0.75,   // point of the owl that is framed
    // where the torso sits on screen, in half-heights below the centre: the
    // bottom of the screen carries the room ribbon and the control dock
    screenBelow: { portrait: 0.3, landscape: 0.22 },
    lookSide: 0.2        // aim a little right of the owl so he stands left of centre
  };

  // Blender export: feet at y=-0.49, body centred at x=0.05 on a 1-unit tall model
  var MODEL = { height: 0.99, footY: -0.49, centerX: 0.05 };

  function isMode(m) { return MODES.indexOf(m) !== -1; }

  function nextMode(m) {
    var i = MODES.indexOf(m);
    return MODES[(i + 1) % MODES.length];
  }

  /**
   * Owl and camera placement for a first-person pose
   * @param {Object} pose - { x, z, yaw (degrees; 0 looks toward -z) }
   * @param {number} bob - vertical walk bob of the eye
   * @param {Object} view - { fov (vertical degrees), aspect }; the camera
   *   pitches so the owl's torso lands above the bottom HUD
   * @returns {Object} { owl: {x, z, yaw}, camera: {x, y, z}, target: {x, y, z}, pitch }
   */
  function thirdPerson(pose, bob, view) {
    view = view || {};
    var y = pose.yaw * Math.PI / 180;
    var fx = -Math.sin(y), fz = -Math.cos(y);   // forward
    var rx = Math.cos(y), rz = -Math.sin(y);    // right
    var ox = pose.x - fx * RIG.owlBack, oz = pose.z - fz * RIG.owlBack;
    var b = bob || 0;
    var cam = {
      x: ox - fx * RIG.camBack + rx * RIG.camSide,
      y: RIG.camHeight + b * 0.5,
      z: oz - fz * RIG.camBack + rz * RIG.camSide
    };
    var fov = (view.fov || 70) * Math.PI / 180;
    var below = (view.aspect && view.aspect > 1) ? RIG.screenBelow.landscape : RIG.screenBelow.portrait;
    // angle down to the torso, minus the angle that puts it `below` on screen
    var toTorso = Math.atan2(RIG.camHeight - RIG.torsoHeight, RIG.camBack);
    var pitch = toTorso - Math.atan(below * Math.tan(fov / 2));
    var reach = 6;
    var horiz = Math.cos(pitch) * reach;
    return {
      owl: { x: ox, z: oz, yaw: pose.yaw },
      camera: cam,
      target: {
        x: cam.x + fx * horiz + rx * (RIG.lookSide - RIG.camSide),
        y: cam.y - Math.sin(pitch) * reach,
        z: cam.z + fz * horiz + rz * (RIG.lookSide - RIG.camSide)
      },
      pitch: pitch * 180 / Math.PI
    };
  }

  /**
   * Clip for a renderer movement
   * @param {string} kind - 'step' | 'turn' | 'knockback' | 'bump' | 'teleport' | 'idle' | 'attack'
   * @returns {Object} { clip, once, speed }
   */
  function clipFor(kind) {
    switch (kind) {
      case 'step': return { clip: 'Walk', once: false, speed: 1.5 };
      case 'turn': return { clip: 'Walk', once: false, speed: 1.2 };
      case 'knockback': return { clip: 'Flap', once: true, speed: 1.1 };
      case 'bump': return { clip: 'Flap', once: true, speed: 1.6 };
      case 'teleport': return { clip: 'Flap', once: true, speed: 1 };
      case 'attack': return { clip: 'Attack', once: true, speed: 1 };
      default: return { clip: 'Idle', once: false, speed: 1 };
    }
  }

  var DEFAULT_MODE = 'third';

  /** Saved camera choice, or the default over-the-shoulder view */
  function storedMode() {
    try {
      var m = window.localStorage.getItem(STORAGE_KEY);
      return isMode(m) ? m : DEFAULT_MODE;
    } catch (e) { return DEFAULT_MODE; }
  }

  function storeMode(m) {
    try { window.localStorage.setItem(STORAGE_KEY, m); } catch (e) { /* private mode */ }
  }

  // ---------------------------------------------------------------------------
  // three.js
  // ---------------------------------------------------------------------------

  var loading = null;

  /**
   * Load the model once
   * @returns {Promise} resolves with the GLTF ({ scene, animations }) or null
   */
  function load(url) {
    if (loading) return loading;
    loading = new Promise(function(resolve) {
      if (typeof THREE === 'undefined' || !THREE.GLTFLoader) { resolve(null); return; }
      new THREE.GLTFLoader().load(url || MODEL_URL, resolve, undefined, function(err) {
        console.warn('FpOwl: model unavailable', err && err.message ? err.message : err);
        resolve(null);
      });
    });
    return loading;
  }

  /**
   * Build the owl controller from a loaded GLTF
   * @param {Object} gltf - result of load()
   * @param {Object} opts - { castShadow }
   */
  function create(gltf, opts) {
    opts = opts || {};
    var root = new THREE.Group();
    root.name = 'MrOwl';
    var model = gltf.scene;
    var s = RIG.height / MODEL.height;
    model.scale.setScalar(s);
    model.position.set(-MODEL.centerX * s, -MODEL.footY * s, 0);
    // turn the model's +z front to face along the view direction (-z at yaw 0)
    model.rotation.y = Math.PI;
    root.add(model);
    model.traverse(function(o) {
      if (!o.isMesh) return;
      o.castShadow = !!opts.castShadow;
      o.receiveShadow = false;
      o.frustumCulled = false;   // skinned bounds do not follow the animation
      var m = o.material;
      if (m && m.isMeshStandardMaterial) {
        // the export carries no metal/rough factors (glTF defaults to full metal)
        m.metalness = 0.25;
        m.roughness = 0.6;
        m.needsUpdate = true;
      }
    });

    var mixer = new THREE.AnimationMixer(model);
    var actions = {};
    (gltf.animations || []).forEach(function(clip) {
      actions[clip.name] = mixer.clipAction(clip);
    });
    var current = null;
    var baseKind = 'idle';

    function start(kind, fade) {
      var spec = clipFor(kind);
      var action = actions[spec.clip];
      if (!action) return;
      if (current === action && !spec.once) { action.timeScale = spec.speed; return; }
      action.reset();
      action.setLoop(spec.once ? THREE.LoopOnce : THREE.LoopRepeat, spec.once ? 1 : Infinity);
      action.clampWhenFinished = spec.once;
      action.timeScale = spec.speed;
      action.enabled = true;
      action.setEffectiveWeight(1);
      if (current && current !== action) action.crossFadeFrom(current, fade === undefined ? 0.18 : fade, false);
      action.play();
      current = action;
    }

    mixer.addEventListener('finished', function(e) {
      if (e.action === current) start(baseKind, 0.25);
    });

    start('idle', 0);

    return {
      object: root,
      /** Loop clip while a movement lasts ('step', 'turn') or 'idle' */
      setBase: function(kind) {
        baseKind = kind;
        var once = current && current.loop === THREE.LoopOnce && current.isRunning();
        if (!once) start(kind);
      },
      /** One-shot clip ('knockback', 'bump', 'attack'); returns to the base loop */
      play: function(kind) { start(kind); },
      setPlacement: function(p) {
        root.position.set(p.x, 0, p.z);
        root.rotation.y = p.yaw * Math.PI / 180;
      },
      setVisible: function(v) { root.visible = !!v; },
      setCastShadow: function(v) {
        model.traverse(function(o) { if (o.isMesh) o.castShadow = !!v; });
      },
      update: function(dt) { mixer.update(dt); },
      currentClip: function() { return current ? current.getClip().name : null; },
      clips: function() { return Object.keys(actions); }
    };
  }

  return {
    MODEL_URL: MODEL_URL,
    MODES: MODES,
    DEFAULT_MODE: DEFAULT_MODE,
    RIG: RIG,
    isMode: isMode,
    nextMode: nextMode,
    thirdPerson: thirdPerson,
    clipFor: clipFor,
    storedMode: storedMode,
    storeMode: storeMode,
    load: load,
    create: create
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FpOwl;
}
