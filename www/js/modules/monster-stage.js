/**
 * MonsterStage
 * Brings the monster in the encounter card to life: a painted room is the
 * backdrop and the character stands on it as a separate layer that breathes,
 * lunges, flinches and leaves.
 *
 * The backdrop is one of the painted rooms in assets/proto/backdrops/, picked
 * for the level theme (dungeon, cemetery) and for the kind of monster - the
 * dragon sits on a hoard of gold, the dark knight in a throne hall - with a
 * couple of variants of each so the same fight is not always in the same room.
 * The illustrations themselves are no longer used as plates: painting the
 * character out of its own picture left a scar where it had stood.
 *
 * With a rendered sprite sheet (assets/proto/card/<id>.json, or the map sheet
 * in assets/proto/iso/monsters/) the layer plays real frames; otherwise it
 * shows the cutout and CSS moves it. The figure is placed - and kept - inside
 * the frame; only the lunge is allowed to come out of it, at the player.
 * Works for every monster, in the classic page and both prototypes.
 */

var MonsterStage = (function() {
  var SPRITE_DIR = 'assets/proto/monsters/';
  var ANIM_DIR = 'assets/proto/card/';
  var MAP_ANIM_DIR = 'assets/proto/iso/monsters/';
  var BACKDROP_DIR = 'assets/proto/backdrops/';
  var IDLE_FPS = 4;
  var CLIP_MS = { attack: 700, hit: 500 };
  // how a defeated monster leaves: CemMonsters.EXIT plus the dungeon's own
  // (the dragon never walks the cemetery)
  var EXIT = {
    ghost: 'fade', lost_soul: 'fade', banshee: 'fade', will_o_wisp: 'fade', spirit_of_the_mine: 'fade', demilich: 'fade',
    zombie: 'sink', skeleton: 'sink', skeleton_king: 'sink', skeleton_queen: 'sink', frankenstein: 'sink', lich: 'sink',
    grim_reaper: 'vanish', vampire_lord: 'vanish', witch: 'vanish', dragon: 'vanish'
  };

  // --- the painted rooms ----------------------------------------------------
  // two variants of every scene (tools/art/generate_backdrops.py)
  var BACKDROP_VARIANTS = 2;
  // the rooms a monster can turn up in when nothing more fitting is named
  var THEME_SCENES = {
    dungeon: ['dungeon_hall', 'dungeon_crypt', 'dungeon_cave', 'dungeon_library'],
    cemetery: ['cemetery_graves', 'cemetery_crypt', 'cemetery_gate', 'cemetery_chapel']
  };
  // the room that suits a particular monster, per theme
  var SCENE_FOR = {
    dungeon: {
      dragon: 'dungeon_hoard', treasure: 'dungeon_hoard', mimic: 'dungeon_hoard', goblin: 'dungeon_hoard',
      dark_knight: 'dungeon_throne', skeleton_king: 'dungeon_throne', skeleton_queen: 'dungeon_throne',
      vampire_lord: 'dungeon_throne', orc: 'dungeon_throne',
      lich: 'dungeon_crypt', demilich: 'dungeon_crypt', zombie: 'dungeon_crypt', skeleton: 'dungeon_crypt',
      ghost: 'dungeon_crypt', banshee: 'dungeon_crypt', lost_soul: 'dungeon_crypt', vampire_bunny: 'dungeon_crypt',
      gog: 'dungeon_lava', golem: 'dungeon_lava', minotaur: 'dungeon_lava', troll: 'dungeon_lava',
      dwarf: 'dungeon_mine', spirit_of_the_mine: 'dungeon_mine', giant_rat: 'dungeon_mine', hobgoblin: 'dungeon_mine',
      spider: 'dungeon_cave', bat_swarm: 'dungeon_cave', slime: 'dungeon_cave', giant_snake: 'dungeon_cave',
      wolf: 'dungeon_cave', will_o_wisp: 'dungeon_cave',
      witch: 'dungeon_library', beholder: 'dungeon_library', frankenstein: 'dungeon_library'
    },
    cemetery: {
      grim_reaper: 'cemetery_chapel', clown: 'cemetery_chapel',
      pumpkin_man: 'cemetery_pumpkins', will_o_wisp: 'cemetery_pumpkins',
      banshee: 'cemetery_crypt', ghost: 'cemetery_crypt', lost_soul: 'cemetery_crypt', spider: 'cemetery_crypt',
      skeleton: 'cemetery_graves', zombie: 'cemetery_graves', bat_swarm: 'cemetery_gate', giant_rat: 'cemetery_gate'
    }
  };
  var theme = 'dungeon';

  /** Which level the cards are being shown for ('dungeon' | 'cemetery') */
  function setTheme(name) {
    theme = Object.prototype.hasOwnProperty.call(THEME_SCENES, name) ? name : 'dungeon';
  }

  /**
   * The backdrop a monster stands on.
   * @param {string} id - monster id
   * @param {string} [which] - theme override; the level theme by default
   * @param {number} [rnd] - 0..1, which variant (random by default)
   * @returns {string} file name inside BACKDROP_DIR
   */
  function backdropFor(id, which, rnd) {
    var t = Object.prototype.hasOwnProperty.call(THEME_SCENES, which) ? which : theme;
    var named = SCENE_FOR[t];
    var r = typeof rnd === 'number' ? rnd : Math.random();
    var scene, v = r;
    if (named && Object.prototype.hasOwnProperty.call(named, id)) scene = named[id];
    else {
      // the whole part of r picks the room, the fraction left over the
      // variant, so every room/variant pair can come up
      var pool = THEME_SCENES[t];
      var x = r * pool.length;
      scene = pool[Math.min(pool.length - 1, Math.floor(x))];
      v = x - Math.floor(x);
    }
    return scene + '_' + (Math.min(BACKDROP_VARIANTS - 1, Math.floor(v * BACKDROP_VARIANTS)) + 1) + '.jpg';
  }

  /**
   * How big each creature stands on the card, as a multiple of the height an
   * ordinary monster fills (BASE_HEIGHT of the frame): a spider is small, the
   * Reaper towers. This is the card's counterpart of the map's species height.
   */
  var CARD_SCALE = {
    spider: 0.5, clown: 1.2, giant_rat: 0.7, bat_swarm: 0.75, ghost: 0.85, lost_soul: 0.85, will_o_wisp: 0.6,
    slime: 0.7, treasure: 0.6, vampire_bunny: 0.7, goblin: 0.85,
    troll: 1.2, golem: 1.2, minotaur: 1.15, frankenstein: 1.1,
    grim_reaper: 1.35, dragon: 1.0
  };

  // where the feet stand and how tall an ordinary monster is, as fractions of
  // the card; the figure is then kept inside the frame (see confine)
  var GROUND = 0.9;
  var BASE_HEIGHT = 0.62;
  var MARGIN = 0.02;
  // a wide creature (the dragon on its hoard, a swarm) keeps this much of the
  // picture clear on either side, so it stands in the room instead of being
  // pressed against the frame
  var SIDE = 0.07;

  function cardScale(id) {
    return Object.prototype.hasOwnProperty.call(CARD_SCALE, id) ? CARD_SCALE[id] : 1;
  }

  var atlases = {};          // id -> atlas json or false
  var backdrops = {};        // 'theme:id' -> the room this monster is being fought in
  var cutSizes = {};         // id -> { aspect } of the cutout png
  var stages = [];           // active { img, actor, id, atlas, raf }

  function reduced() {
    return typeof FX !== 'undefined' && FX.reducedMotion ? FX.reducedMotion() : false;
  }

  /**
   * The sprite sheet for the card: the card-sized render when one exists,
   * otherwise the smaller sheet the isometric map uses.
   * @returns {Promise} atlas json (with `dir`) or false
   */
  function loadAtlas(id) {
    if (atlases[id] !== undefined) return Promise.resolve(atlases[id]);
    if (typeof fetch !== 'function') { atlases[id] = false; return Promise.resolve(false); }
    function tryDir(dir, next) {
      return fetch(dir + id + '.json').then(function(r) { return r.ok ? r.json() : null; })
        .then(function(j) {
          if (j) { j.dir = dir; atlases[id] = j; return j; }
          return next ? next() : false;
        })
        .catch(function() { return next ? next() : false; });
    }
    return tryDir(ANIM_DIR, function() { return tryDir(MAP_ANIM_DIR, null); })
      .then(function(j) { atlases[id] = j || false; return atlases[id]; });
  }

  /** Aspect (w/h) of a monster cutout, measured once */
  function cutAspect(id) {
    if (cutSizes[id] !== undefined) return Promise.resolve(cutSizes[id]);
    if (typeof Image !== 'function') { cutSizes[id] = 1; return Promise.resolve(1); }
    return new Promise(function(resolve) {
      var probe = new Image();
      probe.onload = function() {
        cutSizes[id] = probe.naturalHeight ? probe.naturalWidth / probe.naturalHeight : 1;
        resolve(cutSizes[id]);
      };
      probe.onerror = function() { cutSizes[id] = 1; resolve(1); };
      probe.src = SPRITE_DIR + id + '.png';
    });
  }

  /**
   * Where the character stands on the backdrop, as percentages of the frame:
   * centred, feet on the ground line, as tall as its species should be, and
   * never sticking out of the picture.
   * @param {string} id - monster id
   * @param {Object} meta - { pivot, figureHeight, frameW, frameH } of a sheet,
   *   or { aspect } of a cutout, or null
   * @param {number} cardAspect - width / height of the card image
   * @returns {Object} { ax, ay, aw, ah } in percent
   */
  function stand(id, meta, cardAspect) {
    var ratio = cardAspect || 4 / 3;
    var figure = BASE_HEIGHT * cardScale(id);       // figure height, fraction of the card
    var foot = GROUND * 100;
    var ah, aw, pivotY;
    if (meta && meta.pivot && meta.figureHeight && meta.frameW && meta.frameH) {
      // the sheet frame is taller than the figure inside it: scale the frame
      // so that the figure itself comes out the right height
      pivotY = meta.pivot.y;
      ah = figure * 100 / Math.max(0.05, meta.figureHeight / meta.frameH);
      aw = ah * (meta.frameW / meta.frameH) / ratio;
    } else {
      pivotY = 1;
      ah = figure * 100;
      aw = ah * ((meta && meta.aspect) || 1) / ratio;
    }
    return confine({ ah: ah, aw: aw }, pivotY, foot);
  }

  /**
   * Keep a figure inside the picture: shrink it about its feet until the top
   * of the frame and both sides fit. Combat used to walk the character out of
   * the card; the only thing allowed past the edge now is the lunge, which
   * comes at the player (see allowLunge).
   */
  function confine(box, pivotY, foot) {
    var ratio = box.aw / Math.max(0.001, box.ah);
    var top = Math.max(0.05, pivotY);
    var max = Math.min(
      (foot - MARGIN * 100) / top,            // head stays under the top edge
      (100 - SIDE * 100 * 2) / ratio,         // shoulders stay inside the sides
      (100 - foot) / Math.max(0.001, 1 - top) // feet and shadow stay on the floor
    );
    var ah = Math.min(box.ah, max);
    var aw = ah * ratio;
    return { ax: 50 - aw / 2, ay: foot - ah * top, aw: aw, ah: ah };
  }

  /** CSS background values that show one frame of a sheet */
  function frameStyle(frame, actorW, sheetW, sheetH) {
    var k = actorW / frame.w;
    return {
      size: (sheetW * k).toFixed(1) + 'px ' + (sheetH * k).toFixed(1) + 'px',
      pos: (-frame.x * k).toFixed(1) + 'px ' + (-frame.y * k).toFixed(1) + 'px'
    };
  }

  /** Wrap a plain <img> in a stage so an actor can sit on top of it */
  function ensure(img) {
    if (!img) return null;
    var parent = img.parentNode;
    if (parent && parent.classList && parent.classList.contains('monster-stage')) return parent;
    if (!parent) return null;
    var stage = document.createElement('div');
    stage.className = 'monster-stage';
    parent.insertBefore(stage, img);
    stage.appendChild(img);
    img.classList.add('monster-scene');
    var actor = document.createElement('div');
    actor.className = 'monster-actor';
    actor.setAttribute('aria-hidden', 'true');
    stage.appendChild(actor);
    return stage;
  }

  function actorFor(img) {
    var stage = img && img.parentNode;
    return stage && stage.querySelector ? stage.querySelector('.monster-actor') : null;
  }

  function stageFor(img) {
    for (var i = 0; i < stages.length; i++) if (stages[i].img === img) return stages[i];
    return null;
  }

  /**
   * The room this monster is being fought in: rolled once and kept until the
   * card is put away, so the backdrop does not change from question to
   * question inside one fight.
   * @returns {string} file name inside BACKDROP_DIR
   */
  function roomFor(id, which, rnd) {
    // kept per level as well as per monster: a zombie met in the dungeon
    // must not bring its crypt along to the cemetery
    var t = Object.prototype.hasOwnProperty.call(THEME_SCENES, which) ? which : theme;
    var key = t + ':' + id;
    if (typeof rnd !== 'number' && Object.prototype.hasOwnProperty.call(backdrops, key)) return backdrops[key];
    backdrops[key] = backdropFor(id, t, rnd);
    return backdrops[key];
  }

  /** Forget which room a monster was fought in, so the next fight re-rolls */
  function forgetBackdrop(id) {
    if (!id) { backdrops = {}; return; }
    for (var t in THEME_SCENES) {
      if (Object.prototype.hasOwnProperty.call(THEME_SCENES, t)) delete backdrops[t + ':' + id];
    }
  }

  function stop(img) {
    var st = stageFor(img);
    if (!st) return;
    if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
    if (st.turnTimer) { clearTimeout(st.turnTimer); st.turnTimer = 0; }
    stages.splice(stages.indexOf(st), 1);
  }

  /**
   * The card is put away: stop its animation (the idle loop would otherwise
   * keep repainting a hidden card until the next fight) and let the next
   * fight with this monster roll a new room.
   * @param {HTMLImageElement} img - the card image
   */
  function release(img) {
    var st = stageFor(img);
    if (st) forgetBackdrop(st.id);
    stop(img);
  }

  function facingList(st) {
    return (st.atlas && st.atlas.meta && st.atlas.meta.facings) || ['front'];
  }

  /** The nearest facing this sheet actually has */
  function pickFacing(st, want) {
    var list = facingList(st);
    if (list.indexOf(want) !== -1) return want;
    if (list.indexOf('down') !== -1) return 'down';
    if (list.indexOf('front') !== -1) return 'front';
    return list[0];
  }

  function frames(atlas, clip, facing) {
    var out = [];
    if (!atlas || !atlas.frames) return out;
    var n = (atlas.meta && atlas.meta.clips && atlas.meta.clips[clip]) || 0;
    for (var i = 0; i < n; i++) {
      var key = (facing || 'front') + '_' + clip + '_' + i;
      if (atlas.frames[key]) out.push(atlas.frames[key].frame);
    }
    return out;
  }

  function showFrame(st, frame) {
    if (!frame) return;
    var w = st.actor.clientWidth || 1;
    var s = frameStyle(frame, w, st.atlas.meta.size ? st.atlas.meta.size.w : st.sheetW, st.atlas.meta.size ? st.atlas.meta.size.h : st.sheetH);
    st.actor.style.backgroundSize = s.size;
    st.actor.style.backgroundPosition = s.pos;
  }

  function run(st, clip, ms, then) {
    if (!st.atlas) { if (then) then(); return; }
    var list = frames(st.atlas, clip, st.facing || pickFacing(st, 'down'));
    if (!list.length) { if (then) then(); return; }
    if (st.raf) cancelAnimationFrame(st.raf);
    if (reduced()) { showFrame(st, list[0]); if (then) then(); return; }
    var start = null;
    var shown = -1;
    var dur = ms || (list.length / IDLE_FPS) * 1000;
    function step(t) {
      if (start === null) start = t;
      var p = (t - start) / dur;
      if (clip === 'idle') p = p % 1;
      var i = Math.min(list.length - 1, Math.floor(p * list.length));
      // the idle clip changes frame four times a second: only touch the
      // style when it does, not on every animation frame
      if (i !== shown) { showFrame(st, list[i]); shown = i; }
      if (clip !== 'idle' && p >= 1) { st.raf = 0; if (then) then(); return; }
      st.raf = requestAnimationFrame(step);
    }
    st.raf = requestAnimationFrame(step);
  }

  // the five facings are rendered a quarter turn apart, so stepping along
  // this list spins the figure on the spot
  var TURN = ['down', 'down_right', 'right', 'up_right', 'up'];

  function turnIndex(st) {
    var i = TURN.indexOf(st.facing);
    return i === -1 ? 0 : i;
  }

  /**
   * Turn the figure to a facing, one rendered step at a time, playing the
   * idle frames as it goes. This is what makes the card feel like a model
   * standing in the scene rather than a picture of one.
   */
  function turn(st, want, msPerStep, then) {
    var list = facingList(st);
    if (!st.atlas || list.indexOf(want) === -1 || reduced()) {
      if (list.indexOf(want) !== -1) { st.facing = want; run(st, 'idle'); }
      if (then) then();
      return;
    }
    var from = turnIndex(st), to = TURN.indexOf(want);
    var dir = to > from ? 1 : -1;
    var at = from;
    function step() {
      if (at === to) { run(st, 'idle'); if (then) then(); return; }
      at += dir;
      st.facing = TURN[at];
      var f = frames(st.atlas, 'idle', st.facing);
      if (f.length) showFrame(st, f[0]);
      st.turnTimer = setTimeout(step, msPerStep);
    }
    if (st.turnTimer) clearTimeout(st.turnTimer);
    step();
  }

  /**
   * Put a monster on the card: a painted room behind, the character on top.
   * @param {HTMLImageElement} img - the modal's monster image
   * @param {string} id - monster id
   */
  function show(img, id, opts) {
    if (!img || !id) return;
    stop(img);
    var stage = ensure(img);
    if (!stage) return;
    opts = opts || {};
    var actor = actorFor(img);
    var st = { img: img, actor: actor, id: id, atlas: null, raf: 0, sheetW: 0, sheetH: 0, facing: null, turnTimer: 0 };
    stages.push(st);
    actor.className = 'monster-actor';
    actor.style.cssText = '';
    actor.style.display = 'none';
    stage.classList.remove('lunging');

    // A painted room for this kind of monster, not its own illustration. The
    // card is shown again for every question of a fight, so the room is kept
    // for as long as the same monster stands in it: a new one each question
    // would flicker, and re-assigning src would abort the load in flight.
    var file = BACKDROP_DIR + roomFor(id, opts.theme, opts.variant);
    if (img.getAttribute('src') !== file) {
      var tries = 0;
      var asked = file;            // the exact url of the load in flight
      img.onerror = function() {
        // the load that failed may be one this very call replaced: a browser
        // fires error on an aborted request, and following it would put the
        // illustration (character and all) back on the card
        if (img.getAttribute('src') !== asked) return;
        if (tries++ < 2) {
          // one dropped request is not a missing backdrop: the card opens
          // while the level is still streaming its own art, and a connection
          // lost in that crowd would otherwise cost the room for the fight
          asked = file + '?retry=' + tries;
          setTimeout(function() { img.src = asked; }, 250 * tries);
          return;
        }
        // no room to stand in: show the illustration, which has the
        // character painted in, and keep the actor off it for good
        st.failed = true;
        img.onerror = null;
        img.onload = null;
        img.src = 'assets/' + id + '.jpg';
        actor.style.display = 'none';
        if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
        if (st.turnTimer) { clearTimeout(st.turnTimer); st.turnTimer = 0; }
      };
      img.src = asked;
    }

    // The cutout is only measured when there is no sheet to play: fetching it
    // for its shape alone cost a 100-250 KB download per new kind of monster.
    loadAtlas(id).then(function(atlas) {
      var first = atlas && atlas.meta && atlas.frames ?
        atlas.frames[(atlas.meta.facings ? atlas.meta.facings[0] : 'front') + '_idle_0'] : null;
      if (first) {
        st.atlas = atlas;
        st.sheetW = atlas.meta.size ? atlas.meta.size.w : 0;
        st.sheetH = atlas.meta.size ? atlas.meta.size.h : 0;
        return { pivot: atlas.meta.pivot, figureHeight: atlas.meta.figureHeight, frameW: first.frame.w, frameH: first.frame.h };
      }
      return cutAspect(id).then(function(aspect) { return { aspect: aspect }; });
    }).then(function(meta) {
      if (st.failed || stageFor(img) !== st) return;
      function place() {
        if (st.failed || stageFor(img) !== st) return;
        var w = img.naturalWidth || 800, h = img.naturalHeight || 600;
        var box = stand(id, meta, w / h);
        actor.style.left = box.ax.toFixed(2) + '%';
        actor.style.top = box.ay.toFixed(2) + '%';
        actor.style.width = box.aw.toFixed(2) + '%';
        actor.style.height = box.ah.toFixed(2) + '%';
        actor.style.display = '';
        if (st.atlas) {
          actor.style.backgroundImage = 'url(' + st.atlas.dir + id + '.png)';
          // it has its back to you and turns round as the card opens
          var facings = facingList(st);
          if (!reduced() && facings.indexOf('up') !== -1 && facings.indexOf('down') !== -1) {
            st.facing = 'up';
            var f0 = frames(st.atlas, 'idle', 'up');
            if (f0.length) showFrame(st, f0[0]);
            st.turnTimer = setTimeout(function() { turn(st, 'down', 110); }, 260);
          } else {
            st.facing = pickFacing(st, 'down');
            run(st, 'idle');
          }
        } else {
          actor.style.backgroundImage = 'url(' + SPRITE_DIR + id + '.png)';
          actor.style.backgroundSize = 'contain';
          actor.style.backgroundPosition = 'center bottom';
          actor.style.backgroundRepeat = 'no-repeat';
          if (!reduced()) actor.classList.add('fx-actor-idle');
        }
      }
      if (img.complete && img.naturalWidth) place();
      else img.onload = function() { img.onload = null; place(); };
    });
  }

  /**
   * Let the figure out of the frame for a moment, for the lunge at the player.
   * Everything else the character does stays inside the picture.
   * @param {HTMLImageElement} img - the card image
   * @param {number} ms - how long the lunge lasts
   */
  function allowLunge(img, ms) {
    var stage = img && img.parentNode;
    if (!stage || !stage.classList || !stage.classList.contains('monster-stage')) return;
    stage.classList.add('lunging');
    if (stage.lungeTimer) clearTimeout(stage.lungeTimer);
    stage.lungeTimer = setTimeout(function() {
      stage.lungeTimer = 0;
      stage.classList.remove('lunging');
    }, ms || 900);
  }

  /**
   * Play a reaction. Falls back to CSS classes when there is no sheet.
   * @returns {Promise} resolves when the clip is done
   */
  function play(img, clip, opts) {
    var st = stageFor(img);
    if (!st || !st.actor) return Promise.resolve();
    opts = opts || {};
    return new Promise(function(resolve) {
      if (!st.atlas) { resolve(); return; }
      if (clip === 'attack' || clip === 'hit') {
        // square up to the player first, then play the reaction
        if (st.turnTimer) { clearTimeout(st.turnTimer); st.turnTimer = 0; }
        st.facing = pickFacing(st, 'down');
        run(st, clip, CLIP_MS[clip], function() { run(st, 'idle'); resolve(); });
        return;
      }
      if (clip === 'leave') {
        // beaten: it turns its back on you and walks off into the scene
        turn(st, 'up', 90, function() {
          run(st, 'walk', 900);
          resolve();
        });
        return;
      }
      if (clip === 'turn') {
        turn(st, opts.facing || 'down', opts.step || 110, function() { resolve(); });
        return;
      }
      resolve();
    });
  }

  function exitStyleFor(id) {
    return Object.prototype.hasOwnProperty.call(EXIT, id) ? EXIT[id] : 'runaway';
  }

  return {
    SPRITE_DIR: SPRITE_DIR,
    ANIM_DIR: ANIM_DIR,
    BACKDROP_DIR: BACKDROP_DIR,
    BACKDROP_VARIANTS: BACKDROP_VARIANTS,
    EXIT: EXIT,
    THEME_SCENES: THEME_SCENES,
    SCENE_FOR: SCENE_FOR,
    setTheme: setTheme,
    backdropFor: backdropFor,
    roomFor: roomFor,
    forgetBackdrop: forgetBackdrop,
    stand: stand,
    allowLunge: allowLunge,
    GROUND: GROUND,
    SIDE: SIDE,
    cardScale: cardScale,
    CARD_SCALE: CARD_SCALE,
    frameStyle: frameStyle,
    ensure: ensure,
    actorFor: actorFor,
    show: show,
    play: play,
    turnList: TURN,
    /** Which way the figure is facing right now (null when there is no sheet) */
    facingOf: function(img) { var st = stageFor(img); return st ? st.facing : null; },
    stop: stop,
    release: release,
    exitStyleFor: exitStyleFor
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonsterStage;
}
