/**
 * CemMonsters
 * Procedural motion for the 2D monster cutouts of the cemetery level (pure,
 * no Phaser). Mirrors FpMonsters.pose for the isometric view: every monster
 * gets an idle/walk motion by kind, a lunge toward Mr Owl, a flinch and an
 * exit when defeated. Offsets are in screen pixels (dy negative = up).
 */

var CemMonsters = (function() {
  // idle/walk motion by monster id; anything else shambles
  var MOTION = {
    zombie: 'shamble', skeleton: 'shamble', skeleton_king: 'shamble', skeleton_queen: 'shamble', frankenstein: 'shamble',
    ghost: 'hover', lost_soul: 'hover', banshee: 'hover', will_o_wisp: 'hover', bat_swarm: 'hover', witch: 'hover', demilich: 'hover',
    pumpkin_man: 'waddle', vampire_bunny: 'bounce', clown: 'bounce',
    spider: 'skitter',
    grim_reaper: 'glide', vampire_lord: 'glide', lich: 'glide', spirit_of_the_mine: 'glide'
  };
  // how a defeated monster leaves
  var EXIT = {
    ghost: 'fade', lost_soul: 'fade', banshee: 'fade', will_o_wisp: 'fade', spirit_of_the_mine: 'fade', demilich: 'fade',
    zombie: 'sink', skeleton: 'sink', skeleton_king: 'sink', skeleton_queen: 'sink', frankenstein: 'sink', lich: 'sink',
    grim_reaper: 'vanish', vampire_lord: 'vanish', witch: 'vanish'
  };
  var MOTIONS = ['shamble', 'hover', 'waddle', 'bounce', 'skitter', 'glide'];
  // action durations (ms)
  var ACTIONS = { appear: 900, lunge: 700, flinch: 500, exit: 1100 };
  // How tall the map draws a monster at zoom 1: MAP_H px times its MAP_SCALE
  // (a spider or a rat is not as big as a zombie); the Reaper stands BOSS_H.
  // tools/monsters3d/shrink_iso_sheets.py reads these to size the sheets.
  var MAP_H = 110;
  var BOSS_H = 236;
  var MAP_SCALE = {
    spider: 0.36, giant_rat: 0.34, bat_swarm: 0.42,
    ghost: 0.5, lost_soul: 0.52, will_o_wisp: 0.45,
    pumpkin_man: 0.85, banshee: 0.9, skeleton: 0.95, zombie: 0.95, clown: 1.14
  };

  /** Height in px a monster stands on the map at zoom 1 */
  function mapHeight(id, role) {
    if (role === 'boss' || id === 'grim_reaper') return BOSS_H;
    var k = Object.prototype.hasOwnProperty.call(MAP_SCALE, id) ? MAP_SCALE[id] : 1;
    return MAP_H * k;
  }
  // tile-to-tile walk duration by motion (ms)
  var WALK_MS = { shamble: 720, hover: 460, waddle: 660, bounce: 560, skitter: 400, glide: 600 };
  var LUNGE_PX = 42;

  function motionOf(id) {
    return Object.prototype.hasOwnProperty.call(MOTION, id) ? MOTION[id] : 'shamble';
  }

  function exitOf(id) {
    return Object.prototype.hasOwnProperty.call(EXIT, id) ? EXIT[id] : 'runaway';
  }

  function walkMs(motion) {
    return WALK_MS[motion] || WALK_MS.shamble;
  }

  /** Sprite faces left when it moves left on screen */
  function facing(dx) {
    return dx < 0;
  }

  function easeOutBack(t) {
    var c = 1.7;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }

  /**
   * Screen-space offsets for a monster at time t (seconds)
   * @param {string} motion - one of MOTIONS
   * @param {number} t - clock seconds
   * @param {number} phase - per-instance offset so neighbours are not in sync
   * @param {Object} ev - { walking, dir: {x, y} (screen unit vector toward the
   *   target), lunge, flinch, appear, exit (progress 0..1 or -1), exitStyle }
   * @returns {Object} { dx, dy, sx, sy, rot, alpha }
   */
  function pose(motion, t, phase, ev) {
    ev = ev || {};
    var walking = !!ev.walking;
    var gait = ev.animated ? 0.35 : 1;   // a rendered walk cycle already strides
    var rate = walking ? 1.9 : 1;
    var p = t * 2 * Math.PI / 2.4 * rate + (phase || 0);
    var s = Math.sin(p);
    var out = { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, alpha: 1 };
    switch (motion) {
      case 'hover':
        out.dy = -(walking ? 9 : 6) - (walking ? 7 : 5) * (1 + Math.sin(p * 1.6)) / 2 * 2;
        out.rot = (walking ? 0.07 : 0.04) * Math.sin(p * 0.8);
        break;
      case 'waddle':
        out.rot = (walking ? 0.13 : 0.05) * s;
        out.sy = 1 - (walking ? 0.05 : 0.02) * Math.abs(s);
        out.sx = 1 + (walking ? 0.04 : 0.015) * Math.abs(s);
        break;
      case 'bounce':
        var hop = Math.abs(Math.sin(p));
        out.dy = -(walking ? 12 : 4) * hop;
        out.sy = 1 + (walking ? 0.08 : 0.03) * hop;
        out.sx = 1 - (walking ? 0.05 : 0.02) * hop;
        break;
      case 'skitter':
        var fast = Math.sin(p * 3.2);
        out.dx = (walking ? 3 : 1.2) * fast;
        out.dy = -(walking ? 2 : 0.8) * Math.abs(Math.sin(p * 4.4));
        out.rot = (walking ? 0.05 : 0.02) * Math.sin(p * 2.2);
        break;
      case 'glide':
        out.dy = -3 - 3 * (1 + Math.sin(p * 0.8)) / 2;
        out.sx = 1 + 0.02 * Math.sin(p * 0.6);
        out.rot = (walking ? 0.03 : 0.015) * Math.sin(p * 0.4);
        break;
      default: // shamble
        out.rot = (walking ? 0.08 : 0.03) * s;
        out.sy = 1 + (walking ? 0.03 : 0.02) * Math.sin(p * 2);
        out.dy = walking ? -3 * Math.abs(Math.sin(p)) : 0;
    }
    if (gait !== 1) {
      out.dx *= gait; out.dy *= gait; out.rot *= gait;
      out.sx = 1 + (out.sx - 1) * gait;
      out.sy = 1 + (out.sy - 1) * gait;
    }
    var dir = ev.dir || { x: 0, y: 1 };
    if (ev.flinch >= 0 && ev.flinch <= 1) {
      // recoil away from Mr Owl and shiver
      var f = Math.sin(ev.flinch * Math.PI);
      out.dx -= dir.x * 14 * f;
      out.dy -= dir.y * 14 * f;
      out.rot += 0.12 * Math.sin(ev.flinch * Math.PI * 6) * (1 - ev.flinch);
      out.sy *= 1 - 0.08 * f;
    }
    if (ev.lunge >= 0 && ev.lunge <= 1) {
      // wind up, snap toward Mr Owl, settle back
      var l = ev.lunge;
      var fwd = l < 0.25 ? -0.25 * (l / 0.25) : (l < 0.5 ? -0.25 + 1.25 * ((l - 0.25) / 0.25) : 1 * (1 - (l - 0.5) / 0.5));
      out.dx += dir.x * LUNGE_PX * fwd;
      out.dy += dir.y * LUNGE_PX * fwd;
      out.sy *= 1 + 0.1 * Math.max(0, fwd);
      out.sx *= 1 - 0.04 * Math.max(0, fwd);
    }
    if (ev.appear >= 0 && ev.appear <= 1) {
      var a = ev.appear;
      var grow = a < 0.7 ? Math.max(0.001, easeOutBack(a / 0.7)) : 1;
      out.sx *= grow; out.sy *= grow;
      out.dy += 24 * (1 - Math.min(1, a / 0.6));
      out.alpha *= Math.min(1, a / 0.35);
    }
    if (ev.exit >= 0 && ev.exit <= 1) {
      var x = ev.exit;
      var style = ev.exitStyle || 'runaway';
      if (style === 'fade') {
        out.dy -= 30 * x;
        out.alpha *= 1 - x;
        out.sx *= 1 + 0.15 * x; out.sy *= 1 + 0.15 * x;
      } else if (style === 'sink') {
        out.dy += 46 * x * x;
        out.sy *= Math.max(0.05, 1 - 0.7 * x);
        out.alpha *= 1 - Math.max(0, (x - 0.55) / 0.45);
      } else if (style === 'vanish') {
        var v = x * x;
        var k = Math.max(0.001, 1 - v);
        out.sx *= k * (1 + 0.6 * Math.sin(x * Math.PI * 5) * (1 - x));
        out.sy *= k;
        out.dy -= 18 * x;
        out.alpha *= 1 - Math.max(0, (x - 0.5) / 0.5);
      } else {
        // run away from Mr Owl, bobbing, then fade
        var go = Math.max(0, (x - 0.15) / 0.85);
        out.dx -= dir.x * 170 * go * go;
        out.dy -= dir.y * 170 * go * go;
        out.dy -= 8 * Math.abs(Math.sin(go * Math.PI * 5)) * (1 - go);
        out.alpha *= 1 - Math.max(0, (x - 0.6) / 0.4);
      }
    }
    return out;
  }

  /**
   * Which clip of a rendered sprite sheet to play, and which way to face.
   * Reactions win over walking: a monster being hit shows that, not its gait.
   * @param {Object} ev - { walking, dir:{x,y}, lunge, flinch, exit }
   * @returns {Object} { clip, facing, flip }
   */
  /**
   * The eight screen directions a figure can face, in grid-angle order:
   * index i is the direction at i * 45 degrees from grid +x. Grid +x runs
   * down-right on screen and grid +y down-left, so 'down' is grid (1, 1).
   */
  var FACING_ORDER = ['down_right', 'down', 'down_left', 'left', 'up_left', 'up', 'up_right', 'right'];
  // three of the eight are the mirror image of another, so they are not rendered
  var MIRRORED = { down_left: 'down_right', left: 'right', up_left: 'up_right' };

  function hasFacing(list, name) {
    return !!list && list.indexOf(name) !== -1;
  }

  /**
   * Which rendered facing to draw for a movement direction, and whether to
   * flip it. Takes the direction in grid units (gx to the down-right, gy to
   * the down-left) so it matches the angles the sprites were rendered at.
   *
   * Sheets that only carry the old front/back pair still work: the eight
   * directions collapse back onto those two with a horizontal flip.
   *
   * @param {number} vx - grid x component (any length)
   * @param {number} vy - grid y component
   * @param {Array} [facings] - facing names the sheet actually has
   * @returns {Object} { facing, flip, name } - name is the true direction
   */
  function facingFor(vx, vy, facings) {
    if (!vx && !vy) vy = 1;
    var step = Math.round(Math.atan2(vy, vx) / (Math.PI / 4));
    var name = FACING_ORDER[((step % 8) + 8) % 8];
    if (hasFacing(facings, name)) return { facing: name, flip: false, name: name };
    var mirror = Object.prototype.hasOwnProperty.call(MIRRORED, name) ? MIRRORED[name] : null;
    if (mirror && hasFacing(facings, mirror)) return { facing: mirror, flip: true, name: name };
    // old two-facing sheets (and the no-sheet case): toward the viewer or away
    var front = name === 'down' || name === 'down_left' || name === 'down_right' || name === 'left';
    var toRight = name.indexOf('right') !== -1 || name === 'down';
    return { facing: front ? 'front' : 'back', flip: front ? !toRight : toRight, name: name };
  }

  /**
   * Which clip and facing a monster should be showing.
   * @param {Object} ev - as for pose(), plus gdir {x, y} in grid units
   * @param {Array} [facings] - facing names the sheet has
   */
  function clipFor(ev, facings) {
    ev = ev || {};
    var g = ev.gdir || { x: 1, y: 1 };
    var clip = 'idle';
    if ((ev.flinch >= 0 && ev.flinch <= 1) || (ev.exit >= 0 && ev.exit <= 1)) clip = 'hit';
    else if (ev.lunge >= 0 && ev.lunge <= 1) clip = 'attack';
    else if (ev.walking) clip = 'walk';
    var f = facingFor(g.x, g.y, facings);
    return { clip: clip, facing: f.facing, flip: f.flip, direction: f.name };
  }

  /**
   * Progress of a timed action (0..1) or -1 when not running. With `hold`
   * a finished action stays at 1 instead of dropping back to -1: the exit
   * is drawn from it, and a monster that has gone must not be posed as if
   * it were standing there again while the removal timer is still to fire.
   */
  function progress(startMs, nowMs, durMs, hold) {
    if (!startMs) return -1;
    var t = (nowMs - startMs) / durMs;
    if (t > 1 && hold) return 1;
    return t >= 0 && t <= 1 ? t : -1;
  }

  return {
    MOTION: MOTION,
    MOTIONS: MOTIONS,
    EXIT: EXIT,
    ACTIONS: ACTIONS,
    WALK_MS: WALK_MS,
    LUNGE_PX: LUNGE_PX,
    MAP_H: MAP_H,
    BOSS_H: BOSS_H,
    MAP_SCALE: MAP_SCALE,
    mapHeight: mapHeight,
    FACING_ORDER: FACING_ORDER,
    MIRRORED: MIRRORED,
    facingFor: facingFor,
    motionOf: motionOf,
    exitOf: exitOf,
    walkMs: walkMs,
    facing: facing,
    clipFor: clipFor,
    pose: pose,
    progress: progress
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemMonsters;
}
