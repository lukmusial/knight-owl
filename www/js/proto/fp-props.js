/**
 * FpProps
 * Procedural low-poly dressing for the first-person chambers, built from
 * three.js primitives in a chunky cartoon style and appended into the
 * renderer's per-chamber geometry builders (one draw call per material):
 *  - rubble piles, barrels, crates, fallen columns
 *  - half-broken statues (owl, gargoyle) on plinths
 *  - skeletons lying on the floor, dropped armour (helmet, shield, sword, breastplate)
 *  - doorway treatments (voussoir arch stones, timber frame, flanking pillars)
 *
 * Builders are keyed by material: 'stone' (statues, dressed stone),
 * 'rubble' (the chamber's wall stone), 'wood', 'iron', 'armour', 'bone', 'dark'.
 * Every function takes (b, base Matrix4, seed) where base places the prop's
 * local frame (+Z faces into the room, Y up) in world space; frames must be
 * right-handed so triangle winding survives.
 */

var FpProps = (function() {
  var G = null;

  function geo() {
    if (G) return G;
    G = {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(1, 12, 9),
      sphereLo: new THREE.SphereGeometry(1, 8, 6),
      dome: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
      cylLo: new THREE.CylinderGeometry(1, 1, 1, 7),
      cone: new THREE.ConeGeometry(1, 1, 7),
      rock: new THREE.IcosahedronGeometry(1, 0),
      rock2: new THREE.DodecahedronGeometry(1, 0),
      halfShell: new THREE.CylinderGeometry(1, 0.85, 1, 12, 1, true, -Math.PI / 2, Math.PI),
      rib: new THREE.TorusGeometry(1, 0.11, 4, 10, Math.PI),
      ring: new THREE.TorusGeometry(1, 0.09, 5, 16),
      barrel: (function() {
        var prof = [];
        for (var i = 0; i <= 8; i++) {
          var t = i / 8;
          prof.push(new THREE.Vector2(0.3 + 0.05 * Math.sin(t * Math.PI), t * 0.82));
        }
        return new THREE.LatheGeometry(prof, 14);
      })(),
      disc: new THREE.CircleGeometry(1, 14)
    };
    return G;
  }

  function seeded(seed) {
    var s = Math.floor((seed || 0.5) * 233280) % 233280;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  var _q = null, _e = null, _p = null, _s = null;
  /** Local transform: position, euler rotation, scale */
  function M(px, py, pz, rx, ry, rz, sx, sy, sz) {
    if (!_q) { _q = new THREE.Quaternion(); _e = new THREE.Euler(); _p = new THREE.Vector3(); _s = new THREE.Vector3(); }
    _e.set(rx || 0, ry || 0, rz || 0);
    _q.setFromEuler(_e);
    _p.set(px, py, pz);
    _s.set(sx, sy, sz);
    return new THREE.Matrix4().compose(_p, _q, _s);
  }

  function put(b, key, geom, base, local, uv, swap) {
    if (!b[key]) return;
    b[key].geometry(geom, new THREE.Matrix4().multiplyMatrices(base, local), uv, swap);
  }

  /** World matrix for a prop at (x, z) rotated `rot` about Y */
  function baseAt(x, z, rot) {
    return new THREE.Matrix4().makeRotationY(rot || 0).setPosition(x, 0, z);
  }

  // ---------------------------------------------------------------------------
  // Simple props
  // ---------------------------------------------------------------------------
  function rubble(b, base, seed) {
    var g = geo();
    var r = seeded(seed);
    var n = 9 + Math.floor(r() * 6);
    for (var i = 0; i < n; i++) {
      var a = r() * Math.PI * 2;
      var dist = i < 3 ? r() * 0.2 : 0.2 + r() * 0.55;
      var size = i < 3 ? 0.22 + r() * 0.14 : 0.07 + r() * 0.13;
      put(b, 'rubble', r() < 0.5 ? g.rock : g.rock2, base,
        M(Math.cos(a) * dist, size * 0.55 + (i < 3 ? 0.04 : 0), Math.sin(a) * dist, r() * 3, r() * 3, r() * 3, size * (1 + r() * 0.5), size * 0.8, size), 0.35);
    }
    // a broken dressed block leaning in the pile
    put(b, 'stone', g.box, base, M(0.15 - r() * 0.3, 0.2, 0.1, 0.3 + r() * 0.4, r() * 2, 0.25, 0.55, 0.3, 0.34), 0.4);
  }

  function barrel(b, base, seed) {
    var g = geo();
    put(b, 'wood', g.barrel, base, M(0, 0, 0, 0, seed * 6, 0, 1, 1, 1), 1.2);
    put(b, 'wood', g.disc, base, M(0, 0.82, 0, -Math.PI / 2, 0, 0, 0.3, 0.3, 0.3), 0.6);
    for (var h = 0; h < 2; h++) put(b, 'iron', g.ring, base, M(0, 0.16 + h * 0.5, 0, Math.PI / 2, 0, 0, 0.34, 0.34, 0.2));
  }

  function crate(b, base, seed) {
    var g = geo();
    put(b, 'wood', g.box, base, M(0, 0.36, 0, 0, seed * 3, 0, 0.72, 0.72, 0.72), 0.55, true);
    if (seed > 0.5) put(b, 'wood', g.box, base, M(0.05, 0.95, -0.04, 0, seed * 5, 0, 0.46, 0.46, 0.46), 0.36, true);
  }

  /** Broken column: stump on its base, fallen drums and a capital along the wall */
  function column(b, base, seed) {
    var g = geo();
    var r = seeded(seed);
    put(b, 'stone', g.box, base, M(-0.6, 0.1, 0, 0, 0, 0, 0.66, 0.2, 0.66), 0.5);
    put(b, 'stone', g.cyl, base, M(-0.6, 0.55, 0, 0.08, 0, -0.05, 0.25, 0.7, 0.25), 0.5);
    put(b, 'stone', g.cylLo, base, M(-0.62, 0.95, 0.02, 0.5, 0.3, 0.3, 0.22, 0.12, 0.2), 0.5);
    put(b, 'stone', g.cyl, base, M(0.25, 0.24, 0.25, 0, 0.3 + r() * 0.3, Math.PI / 2, 0.23, 0.75, 0.23), 0.5);
    put(b, 'stone', g.cyl, base, M(0.95, 0.23, 0.55, 0.2, -0.4, Math.PI / 2 + 0.1, 0.22, 0.45, 0.22), 0.5);
    put(b, 'stone', g.box, base, M(0.75, 0.13, -0.15, 0.2, 0.7, 0.35, 0.48, 0.2, 0.48), 0.5);
    for (var i = 0; i < 5; i++) {
      var s = 0.05 + r() * 0.08;
      put(b, 'rubble', g.rock, base, M(-0.2 + r() * 1.2, s * 0.6, 0.35 + r() * 0.4, r() * 3, r() * 3, 0, s, s * 0.8, s), 0.3);
    }
  }

  // ---------------------------------------------------------------------------
  // Statues
  // ---------------------------------------------------------------------------
  function plinth(b, base) {
    var g = geo();
    put(b, 'stone', g.box, base, M(0, 0.3, 0, 0, 0, 0, 0.8, 0.6, 0.8), 0.45);
    put(b, 'stone', g.box, base, M(0, 0.65, 0, 0, 0, 0, 0.94, 0.1, 0.94), 0.45);
    put(b, 'stone', g.box, base, M(0, 0.05, 0, 0, 0, 0, 0.92, 0.1, 0.92), 0.45);
  }

  function owlHead(b, head, earLost) {
    var g = geo();
    put(b, 'stone', g.sphere, head, M(0, 0, 0, 0, 0, 0, 0.34, 0.29, 0.3), 0.4);
    for (var side = -1; side <= 1; side += 2) {
      if (!(earLost && side > 0)) put(b, 'stone', g.cone, head, M(side * 0.2, 0.3, -0.02, 0, 0, -side * 0.45, 0.09, 0.28, 0.07), 0.3);
      // big flat eye discs with deep pupils, the owl's trademark
      put(b, 'stone', g.cyl, head, M(side * 0.14, 0.03, 0.24, Math.PI / 2, 0, 0, 0.12, 0.08, 0.12), 0.3);
      put(b, 'dark', g.sphereLo, head, M(side * 0.14, 0.03, 0.29, 0, 0, 0, 0.05, 0.05, 0.03));
    }
    put(b, 'stone', g.cone, head, M(0, -0.1, 0.3, 1.9, 0, 0, 0.055, 0.14, 0.055), 0.3);
  }

  function owlStatue(b, base, seed) {
    var g = geo();
    var r = seeded(seed);
    plinth(b, base);
    put(b, 'stone', g.sphere, base, M(0, 1.1, 0, 0, 0, 0, 0.36, 0.44, 0.33), 0.4);
    for (var side = -1; side <= 1; side += 2) {
      put(b, 'stone', g.sphere, base, M(side * 0.32, 1.08, -0.03, 0, 0, side * 0.12, 0.13, 0.36, 0.26), 0.4);
      put(b, 'stone', g.box, base, M(side * 0.12, 0.74, 0.18, 0, 0, 0, 0.14, 0.06, 0.16), 0.3);
    }
    if (seed < 0.5) {
      // intact head
      owlHead(b, new THREE.Matrix4().multiplyMatrices(base, M(0, 1.6, 0.02, 0, 0, 0, 1, 1, 1)), seed < 0.2);
    } else {
      // head knocked off: jagged neck and the head lying beside the plinth
      put(b, 'stone', g.cylLo, base, M(0, 1.46, 0, 0.25, 0, 0.2, 0.19, 0.12, 0.17), 0.3);
      owlHead(b, new THREE.Matrix4().multiplyMatrices(base, M(0.62, 0.27, 0.45, 0.4, r() * 2, 1.9, 1, 1, 1)), true);
      put(b, 'stone', g.cone, base, M(-0.5, 0.06, 0.55, 1.5, 0.4, 0, 0.08, 0.24, 0.08), 0.3);
    }
  }

  function gargoyleStatue(b, base, seed) {
    var g = geo();
    plinth(b, base);
    put(b, 'stone', g.cylLo, base, M(0, 0.98, 0, 0, 0.3, 0, 0.32, 0.56, 0.3), 0.4);
    var head = new THREE.Matrix4().multiplyMatrices(base, M(0, 1.5, 0.05, -0.1, 0, 0, 1, 1, 1));
    put(b, 'stone', g.sphere, head, M(0, 0, 0, 0, 0, 0, 0.3, 0.27, 0.32), 0.4);
    put(b, 'stone', g.box, head, M(0, -0.08, 0.3, 0.1, 0, 0, 0.3, 0.17, 0.26), 0.3);
    for (var side = -1; side <= 1; side += 2) {
      var broken = seed > 0.5 && side > 0;
      if (!broken) put(b, 'stone', g.cone, head, M(side * 0.2, 0.26, -0.08, -0.5, 0, -side * 0.55, 0.065, 0.36, 0.065), 0.3);
      put(b, 'dark', g.sphereLo, head, M(side * 0.12, 0.05, 0.26, 0, 0, 0, 0.05, 0.035, 0.03));
      put(b, 'stone', g.cone, head, M(side * 0.08, -0.2, 0.39, Math.PI, 0, 0, 0.03, 0.08, 0.03), 0.3);
      // stubby broken wings
      put(b, 'stone', g.box, base, M(side * 0.36, 1.12, -0.18, 0.3, side * 0.5, side * 0.4, 0.06, 0.5, 0.42), 0.4);
    }
    if (seed > 0.5) put(b, 'stone', g.cone, base, M(0.55, 0.07, 0.5, 1.45, 0.6, 0, 0.065, 0.36, 0.065), 0.3);
    put(b, 'rubble', g.rock, base, M(-0.45, 0.07, 0.52, 1, 2, 0, 0.1, 0.07, 0.09), 0.3);
  }

  function scaled(base, k) {
    return new THREE.Matrix4().multiplyMatrices(base, new THREE.Matrix4().makeScale(k, k, k));
  }

  function statue(b, base, seed) {
    base = scaled(base, 1.25);
    if (seed < 0.55) owlStatue(b, base, seed / 0.55); else gargoyleStatue(b, base, (seed - 0.55) / 0.45);
  }

  // ---------------------------------------------------------------------------
  // Skeletons and armour
  // ---------------------------------------------------------------------------
  function bone(b, base, x, z, ang, len, rad) {
    var g = geo();
    var cx = Math.sin(ang) * len / 2, cz = Math.cos(ang) * len / 2;
    put(b, 'bone', g.cylLo, base, M(x + cx, rad, z + cz, Math.PI / 2, 0, -ang, rad, len, rad));
    put(b, 'bone', g.sphereLo, base, M(x, rad * 1.2, z, 0, 0, 0, rad * 1.7, rad * 1.4, rad * 1.7));
    put(b, 'bone', g.sphereLo, base, M(x + cx * 2, rad * 1.2, z + cz * 2, 0, 0, 0, rad * 1.7, rad * 1.4, rad * 1.7));
  }

  function skeleton(b, base, seed) {
    base = scaled(base, 1.3);
    var g = geo();
    var r = seeded(seed);
    // skull, turned a little
    var skull = new THREE.Matrix4().multiplyMatrices(base, M(0.05, 0.13, 0.78, 0.2, (r() - 0.5) * 1.2, 0.3, 1, 1, 1));
    put(b, 'bone', g.sphere, skull, M(0, 0, 0, 0, 0, 0, 0.14, 0.13, 0.16));
    put(b, 'bone', g.box, skull, M(0, -0.09, 0.08, 0.2, 0, 0, 0.13, 0.05, 0.12));
    for (var side = -1; side <= 1; side += 2) {
      put(b, 'dark', g.sphereLo, skull, M(side * 0.055, 0.01, 0.13, 0, 0, 0, 0.04, 0.045, 0.03));
    }
    put(b, 'dark', g.sphereLo, skull, M(0, -0.04, 0.15, 0, 0, 0, 0.02, 0.025, 0.02));
    // spine and ribs
    for (var i = 0; i < 7; i++) {
      put(b, 'bone', g.box, base, M(0, 0.04, 0.58 - i * 0.085, 0, (r() - 0.5) * 0.3, 0, 0.05, 0.05, 0.06));
    }
    for (i = 0; i < 5; i++) {
      var rr = 0.17 - i * 0.012;
      put(b, 'bone', g.rib, base, M(0, 0.02, 0.5 - i * 0.075, 0, 0, 0, rr, rr * 0.55, 0.2));
    }
    put(b, 'bone', g.rib, base, M(0, 0.03, -0.06, -0.3, 0, 0, 0.14, 0.1, 0.35));
    // limbs, slightly scattered
    bone(b, base, 0.2, 0.52, Math.PI + 0.5 + r() * 0.5, 0.3, 0.022);
    bone(b, base, -0.2, 0.52, Math.PI - 0.4 - r() * 0.8, 0.3, 0.022);
    bone(b, base, 0.42, 0.25, Math.PI + 0.2 + r() * 1.5, 0.26, 0.018);
    bone(b, base, -0.12, -0.12, Math.PI + 0.1, 0.42, 0.028);
    bone(b, base, 0.12, -0.12, Math.PI - 0.25 - r() * 0.4, 0.42, 0.028);
    bone(b, base, -0.18, -0.55, Math.PI - 0.1, 0.38, 0.024);
    bone(b, base, 0.5 + r() * 0.2, -0.3, r() * 3, 0.36, 0.024);
  }

  function armour(b, base, seed) {
    var g = geo();
    var r = seeded(seed);
    // helmet on its side
    var helm = new THREE.Matrix4().multiplyMatrices(base, M(-0.25, 0.19, 0.2, 0.2, r() * 3, 1.25, 1, 1, 1));
    put(b, 'armour', g.dome, helm, M(0, 0, 0, 0, 0, 0, 0.2, 0.24, 0.21));
    put(b, 'armour', g.ring, helm, M(0, 0, 0, Math.PI / 2, 0, 0, 0.205, 0.215, 0.25));
    put(b, 'armour', g.box, helm, M(0, 0.02, 0.21, 0, 0, 0, 0.035, 0.2, 0.03));
    put(b, 'armour', g.cone, helm, M(0, 0.28, 0, 0, 0, 0, 0.03, 0.12, 0.03));
    // round shield leaning back, painted wood with an iron rim and boss
    var shield = new THREE.Matrix4().multiplyMatrices(base, M(0.35, 0.36, -0.25, -1.05, 0.3, 0.1, 1, 1, 1));
    put(b, 'wood', g.cyl, shield, M(0, 0, 0, 0, 0, 0, 0.42, 0.05, 0.42), 0.5);
    put(b, 'armour', g.ring, shield, M(0, 0, 0, Math.PI / 2, 0, 0, 0.42, 0.42, 0.35));
    put(b, 'armour', g.sphereLo, shield, M(0, 0.03, 0, 0, 0, 0, 0.1, 0.07, 0.1));
    // sword on the floor
    var sword = new THREE.Matrix4().multiplyMatrices(base, M(0.05, 0.02, 0.45, 0, 1.2 + r(), 0, 1, 1, 1));
    put(b, 'armour', g.box, sword, M(0, 0, 0.35, 0, 0, 0, 0.07, 0.018, 0.85));
    put(b, 'armour', g.box, sword, M(0, 0.01, -0.1, 0, 0, 0, 0.3, 0.035, 0.045));
    put(b, 'wood', g.cylLo, sword, M(0, 0.02, -0.2, Math.PI / 2, 0, 0, 0.022, 0.18, 0.022), 0.2);
    put(b, 'armour', g.sphereLo, sword, M(0, 0.02, -0.31, 0, 0, 0, 0.035, 0.035, 0.035));
    // dented breastplate lying on its back
    if (seed > 0.4) put(b, 'armour', g.halfShell, base, M(-0.45, 0.2, -0.3, Math.PI / 2, 0, 0.3, 0.23, 0.46, 0.2));
  }

  // ---------------------------------------------------------------------------
  // Doorway treatments (frame: X along the wall, Y up, Z into the room; z = 0 at the wall face)
  // ---------------------------------------------------------------------------
  function voussoirs(b, frame, J, PH, seed) {
    var g = geo();
    var n = 9, depth = 0.36, gap = 0.035;
    for (var i = 0; i < n; i++) {
      var a0 = Math.PI * i / n, a1 = Math.PI * (i + 1) / n;
      var am = (a0 + a1) / 2;
      var rMid = J + depth / 2;
      var width = rMid * (a1 - a0) - gap;
      var key = i === Math.floor(n / 2);
      var ext = key ? 0.14 : 0;
      put(b, 'stone', g.box, frame, M(Math.cos(am) * (rMid + ext / 2), PH + Math.sin(am) * (rMid + ext / 2), 0.06, 0, 0, am - Math.PI / 2,
        width + (key ? 0.04 : 0), depth + ext, 0.16 + (key ? 0.04 : 0)), 0.3);
    }
    // quoins up the jambs, alternating long and short
    for (var side = -1; side <= 1; side += 2) {
      for (var k = 0; k < 4; k++) {
        var long = (k % 2) === 0;
        var w = long ? 0.42 : 0.28;
        put(b, 'stone', g.box, frame, M(side * (J + w / 2 - 0.02), 0.26 + k * 0.5, 0.05, 0, 0, 0, w, 0.46, 0.14), 0.3);
      }
    }
  }

  function timberFrame(b, frame, J, top, seed) {
    var g = geo();
    for (var side = -1; side <= 1; side += 2) {
      put(b, 'wood', g.box, frame, M(side * (J + 0.12), top / 2, 0.12, 0, 0, side * 0.015, 0.22, top, 0.22), 0.5, true);
      // diagonal brace
      put(b, 'wood', g.box, frame, M(side * (J - 0.12), top - 0.35, 0.14, 0, 0, side * 0.75, 0.12, 0.7, 0.12), 0.4, true);
    }
    put(b, 'wood', g.box, frame, M(0, top + 0.1, 0.13, 0, 0, 0, 2 * J + 0.8, 0.24, 0.26), 0.5);
    put(b, 'iron', g.box, frame, M(-J * 0.6, top + 0.1, 0.27, 0, 0, 0, 0.08, 0.26, 0.02));
    put(b, 'iron', g.box, frame, M(J * 0.6, top + 0.1, 0.27, 0, 0, 0, 0.08, 0.26, 0.02));
  }

  function pillars(b, frame, J, top, seed) {
    var g = geo();
    for (var side = -1; side <= 1; side += 2) {
      var x = side * (J + 0.42);
      var broken = seed > 0.7 && side < 0;
      var h = broken ? top * 0.55 : top - 0.34;
      put(b, 'stone', g.box, frame, M(x, 0.09, 0.3, 0, 0, 0, 0.54, 0.18, 0.54), 0.4);
      put(b, 'stone', g.cyl, frame, M(x, 0.18 + h / 2, 0.3, 0, 0, 0, 0.18, h, 0.18), 0.5);
      if (broken) {
        put(b, 'stone', g.cylLo, frame, M(x, 0.2 + h, 0.3, 0.3, 0, 0.2, 0.17, 0.1, 0.16), 0.4);
        put(b, 'stone', g.cyl, frame, M(x - side * 0.1, 0.18, 0.95, 0, 0.4, Math.PI / 2, 0.17, top * 0.35, 0.17), 0.4);
        put(b, 'rubble', g.rock, frame, M(x + 0.2, 0.08, 0.7, 1, 1, 0, 0.12, 0.08, 0.1), 0.3);
      } else {
        put(b, 'stone', g.cyl, frame, M(x, 0.18 + h + 0.04, 0.3, 0, 0, 0, 0.23, 0.08, 0.23), 0.4);
        put(b, 'stone', g.box, frame, M(x, 0.18 + h + 0.14, 0.3, 0, 0, 0, 0.5, 0.14, 0.5), 0.4);
      }
    }
  }

  var BUILDERS = {
    rubble: rubble,
    barrel: barrel,
    crate: crate,
    column: column,
    statue: statue,
    skeleton: skeleton,
    armour: armour
  };

  /**
   * Floor feature from FpLayout.floorFeatures, at chamber centre (cx, cz)
   */
  function floorFeature(b, cx, cz, f) {
    var fn = BUILDERS[f.kind];
    if (!fn) return;
    fn(b, baseAt(cx + f.x, cz + f.z, f.rot), f.seed);
  }

  return {
    floorFeature: floorFeature,
    voussoirs: voussoirs,
    timberFrame: timberFrame,
    pillars: pillars,
    baseAt: baseAt,
    KINDS: Object.keys(BUILDERS)
  };
})();
