/**
 * MonsterStage
 * Brings the monster in the encounter card to life: the painted scene stays
 * as a backdrop (with the character inpainted out) and the character itself
 * is a separate layer on top that breathes, lunges, flinches and leaves.
 *
 * With a rendered sprite sheet (assets/proto/iso/monsters/<id>.json) the
 * layer plays real frames; otherwise it shows the cutout and CSS moves it.
 * Works for every monster, in the classic page and both prototypes.
 */

var MonsterStage = (function() {
  var SPRITE_DIR = 'assets/proto/monsters/';
  var ANIM_DIR = 'assets/proto/iso/monsters/';
  var IDLE_FPS = 4;
  var CLIP_MS = { attack: 700, hit: 500 };
  // how a defeated monster leaves; mirrors CemMonsters.EXIT
  var EXIT = {
    ghost: 'fade', lost_soul: 'fade', banshee: 'fade', will_o_wisp: 'fade', spirit_of_the_mine: 'fade', demilich: 'fade',
    zombie: 'sink', skeleton: 'sink', skeleton_king: 'sink', skeleton_queen: 'sink', frankenstein: 'sink', lich: 'sink',
    grim_reaper: 'vanish', vampire_lord: 'vanish', witch: 'vanish', dragon: 'vanish'
  };

  var index = null;          // sprite index.json (bbox per monster)
  var indexPromise = null;
  var atlases = {};          // id -> atlas json or false
  var stages = [];           // active { img, actor, id, atlas, raf }

  function reduced() {
    return typeof FX !== 'undefined' && FX.reducedMotion ? FX.reducedMotion() : false;
  }

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = new Promise(function(resolve) {
      if (typeof fetch !== 'function') { index = {}; resolve(index); return; }
      fetch(SPRITE_DIR + 'index.json').then(function(r) { return r.ok ? r.json() : {}; })
        .then(function(j) { index = j || {}; resolve(index); })
        .catch(function() { index = {}; resolve(index); });
    });
    return indexPromise;
  }

  function loadAtlas(id) {
    if (atlases[id] !== undefined) return Promise.resolve(atlases[id]);
    if (typeof fetch !== 'function') { atlases[id] = false; return Promise.resolve(false); }
    return fetch(ANIM_DIR + id + '.json').then(function(r) { return r.ok ? r.json() : null; })
      .then(function(j) { atlases[id] = j || false; return atlases[id]; })
      .catch(function() { atlases[id] = false; return false; });
  }

  /**
   * Where the character sits inside the picture, as percentages of the frame.
   * @param {Object} entry - index.json record { bbox, w, h }
   * @param {number} imgW - natural width of the illustration
   * @param {number} imgH - natural height
   * @param {Object} meta - atlas meta (optional)
   * @returns {Object} { ax, ay, aw, ah } in percent
   */
  function layout(entry, imgW, imgH, meta) {
    var b = entry && entry.bbox ? entry.bbox : [0, 0, imgW, imgH];
    var x0 = b[0], y0 = b[1], w = b[2] - b[0], h = b[3] - b[1];
    if (meta && meta.pivot && meta.figureHeight && meta.frameW && meta.frameH) {
      // the sheet's feet pivot lands on the bottom of the painted character
      var ah = h / Math.max(0.2, meta.pivot.y);
      var aw = ah * (meta.frameW / meta.frameH) * (imgH / imgW) * (imgW / imgH);
      aw = ah * (meta.frameW / meta.frameH);
      return {
        ax: (x0 + w / 2 - aw / 2) / imgW * 100,
        ay: (y0 + h - ah * meta.pivot.y) / imgH * 100,
        aw: aw / imgW * 100,
        ah: ah / imgH * 100
      };
    }
    return { ax: x0 / imgW * 100, ay: y0 / imgH * 100, aw: w / imgW * 100, ah: h / imgH * 100 };
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

  function stop(img) {
    var st = stageFor(img);
    if (!st) return;
    if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
    stages.splice(stages.indexOf(st), 1);
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
    var list = frames(st.atlas, clip, 'front');
    if (!list.length) { if (then) then(); return; }
    if (st.raf) cancelAnimationFrame(st.raf);
    if (reduced()) { showFrame(st, list[0]); if (then) then(); return; }
    var start = null;
    var dur = ms || (list.length / IDLE_FPS) * 1000;
    function step(t) {
      if (start === null) start = t;
      var p = (t - start) / dur;
      if (clip === 'idle') p = p % 1;
      var i = Math.min(list.length - 1, Math.floor(p * list.length));
      showFrame(st, list[i]);
      if (clip !== 'idle' && p >= 1) { st.raf = 0; if (then) then(); return; }
      st.raf = requestAnimationFrame(step);
    }
    st.raf = requestAnimationFrame(step);
  }

  /**
   * Put a monster on the card: painted plate behind, character on top.
   * @param {HTMLImageElement} img - the modal's monster image
   * @param {string} id - monster id
   */
  function show(img, id) {
    if (!img || !id) return;
    stop(img);
    var stage = ensure(img);
    if (!stage) return;
    var actor = actorFor(img);
    var st = { img: img, actor: actor, id: id, atlas: null, raf: 0, sheetW: 0, sheetH: 0 };
    stages.push(st);
    actor.className = 'monster-actor';
    actor.style.cssText = '';
    actor.style.display = 'none';

    loadIndex().then(function(idx) {
      var entry = idx[id];
      if (!entry) { img.src = 'assets/' + id + '.png'; return null; }
      if (!entry.bg) {
        // no painted-out plate for this monster: keep the illustration as it
        // is, or the character would appear twice
        img.src = 'assets/' + id + '.png';
        actor.style.display = 'none';
        return null;
      }
      // the plate is the painting with the character removed
      img.onerror = function() { img.onerror = null; img.src = 'assets/' + id + '.png'; actor.style.display = 'none'; };
      img.src = SPRITE_DIR + id + '_bg.jpg';
      return loadAtlas(id).then(function(atlas) {
        var meta = null;
        if (atlas && atlas.meta && atlas.frames) {
          var first = atlas.frames[(atlas.meta.facings ? atlas.meta.facings[0] : 'front') + '_idle_0'];
          if (first) {
            meta = { pivot: atlas.meta.pivot, figureHeight: atlas.meta.figureHeight, frameW: first.frame.w, frameH: first.frame.h };
            st.atlas = atlas;
            st.sheetW = atlas.meta.size ? atlas.meta.size.w : 0;
            st.sheetH = atlas.meta.size ? atlas.meta.size.h : 0;
          }
        }
        var natW = img.naturalWidth || 800, natH = img.naturalHeight || 600;
        function place() {
          var box = layout(entry, img.naturalWidth || natW, img.naturalHeight || natH, meta);
          actor.style.left = box.ax.toFixed(2) + '%';
          actor.style.top = box.ay.toFixed(2) + '%';
          actor.style.width = box.aw.toFixed(2) + '%';
          actor.style.height = box.ah.toFixed(2) + '%';
          actor.style.display = '';
          if (st.atlas) {
            actor.style.backgroundImage = 'url(' + ANIM_DIR + id + '.png)';
            run(st, 'idle');
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
        return atlas;
      });
    });
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
      if (st.atlas && (clip === 'attack' || clip === 'hit')) {
        run(st, clip, CLIP_MS[clip], function() { run(st, 'idle'); resolve(); });
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
    EXIT: EXIT,
    layout: layout,
    frameStyle: frameStyle,
    ensure: ensure,
    actorFor: actorFor,
    show: show,
    play: play,
    stop: stop,
    exitStyleFor: exitStyleFor
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonsterStage;
}
