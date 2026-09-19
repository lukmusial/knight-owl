/**
 * CemWorld
 * Rendering scaffolding for the cemetery: the grounds are four times bigger
 * than a dungeon, so nothing is drawn per tile any more.
 *
 *  - Ground, baked shadows and lantern pools are painted into 8x8-tile
 *    chunks (pooled render textures) that are created as the camera reaches
 *    them and recycled when it leaves.
 *  - Props live in depth bands (one Phaser Layer per diagonal strip), so
 *    moving Mr Owl or a monster re-sorts one band instead of the whole scene.
 *  - Culling works on cells (a band crossed with a column), not on tiles.
 *
 * The scene owns the sprites; this module owns where they are drawn.
 */

var CemWorld = (function() {
  var TILE_W = 128, TILE_H = 64;
  var CHUNK = 8;                  // tiles per chunk side
  var CHUNK_POOL = 18;            // render textures kept alive at once
  var BAND_TILES = 4;             // tiles per depth band (gx + gy)
  var CELL_COLS = 8;              // tiles per cull column (gx - gy)
  var PAD = 320;                  // world px of camera padding before culling
  var GROUND_DEPTH = -100000;
  var CULL_MS = 200;

  function bandOf(gx, gy) {
    return Math.floor((gx + gy) / BAND_TILES);
  }

  function cellKey(gx, gy) {
    return bandOf(gx, gy) + ':' + Math.floor((gx - gy + 1024) / CELL_COLS);
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {Object} level - CemModel level
   * @returns {Object} the world API used by the scene
   */
  function attach(scene, level) {
    var W = level.W, H = level.H;
    var cols = Math.ceil(W / CHUNK), rows = Math.ceil(H / CHUNK);
    var maxBand = bandOf(W - 1, H - 1) + 1;

    // --- layers ------------------------------------------------------------
    var groundLayer = scene.add.layer().setDepth(GROUND_DEPTH);
    var bands = [];
    for (var b = 0; b <= maxBand; b++) {
      bands.push(scene.add.layer().setDepth(b));
    }
    var lightsLayer = scene.add.layer().setDepth(maxBand + 10);

    // --- chunks ------------------------------------------------------------
    var chunkRect = [];            // chunk index -> { left, top, w, h, cx, cy }
    for (var cy = 0; cy < rows; cy++) {
      for (var cx = 0; cx < cols; cx++) {
        var x0 = cx * CHUNK, y0 = cy * CHUNK;
        var left = IsoModel.gridToIso(x0, y0 + CHUNK - 1).x - TILE_W / 2;
        var top = IsoModel.gridToIso(x0, y0).y - TILE_H / 2 - 160;      // headroom for shadows
        var right = IsoModel.gridToIso(x0 + CHUNK - 1, y0).x + TILE_W / 2;
        var bottom = IsoModel.gridToIso(x0 + CHUNK - 1, y0 + CHUNK - 1).y + TILE_H / 2 + 24;
        chunkRect.push({ left: left, top: top, w: right - left, h: bottom - top, cx: cx, cy: cy });
      }
    }
    var pool = [];                 // { rt, chunk (index or -1), used (frame counter) }
    var byChunk = {};              // chunk index -> pool slot
    var dirty = {};                // chunk index -> true
    var frameCounter = 0;
    var bakes = 0;
    var bakeFn = null;             // set by the scene: bakeFn(rt, chunkIndex, rect)

    function chunkIndexOf(gx, gy) {
      return Math.floor(gy / CHUNK) * cols + Math.floor(gx / CHUNK);
    }

    function bake(slot) {
      if (!bakeFn) return;
      var r = chunkRect[slot.chunk];
      slot.rt.clear();
      bakeFn(slot.rt, slot.chunk, r);
      bakes++;
      delete dirty[slot.chunk];
    }

    function acquire(chunk) {
      if (byChunk[chunk] !== undefined) return pool[byChunk[chunk]];
      var slot = -1;
      for (var i = 0; i < pool.length; i++) {
        if (pool[i].chunk === -1) { slot = i; break; }
      }
      if (slot === -1 && pool.length < CHUNK_POOL) {
        var rect0 = chunkRect[chunk];
        var rt = scene.add.renderTexture(0, 0, Math.ceil(rect0.w), Math.ceil(rect0.h)).setOrigin(0, 0);
        groundLayer.add(rt);
        pool.push({ rt: rt, chunk: -1, used: 0 });
        slot = pool.length - 1;
      }
      if (slot === -1) {
        // recycle the chunk the camera has ignored the longest
        var oldest = 0;
        for (var j = 1; j < pool.length; j++) if (pool[j].used < pool[oldest].used) oldest = j;
        slot = oldest;
        delete byChunk[pool[slot].chunk];
      }
      var s = pool[slot];
      s.chunk = chunk;
      byChunk[chunk] = slot;
      var r = chunkRect[chunk];
      s.rt.setPosition(r.left, r.top).setVisible(true);
      bake(s);
      return s;
    }

    /** Ground tiles a chunk covers, for the scene's bake callback */
    function chunkTiles(chunk) {
      var r = chunkRect[chunk];
      var out = [];
      for (var gy = r.cy * CHUNK; gy < Math.min(H, (r.cy + 1) * CHUNK); gy++) {
        for (var gx = r.cx * CHUNK; gx < Math.min(W, (r.cx + 1) * CHUNK); gx++) {
          out.push(CemModel.index(level, gx, gy));
        }
      }
      return out;
    }

    /**
     * Tiles just revealed: repaint the chunk they sit in, plus the ones above
     * and to the left, where a tall prop's shadow reaches in.
     */
    function markSeen(indices) {
      for (var i = 0; i < indices.length; i++) {
        var t = level.tiles[indices[i]];
        dirty[chunkIndexOf(t.gx, t.gy)] = true;
        if (t.gx >= CHUNK) dirty[chunkIndexOf(t.gx - CHUNK, t.gy)] = true;
        if (t.gy >= CHUNK) dirty[chunkIndexOf(t.gx, t.gy - CHUNK)] = true;
      }
    }

    // --- cells -------------------------------------------------------------
    var cells = {};                // key -> { objs, minX, maxX, minY, maxY, shown }

    function cellFor(gx, gy) {
      var key = cellKey(gx, gy);
      var c = cells[key];
      if (!c) {
        c = cells[key] = { objs: [], minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, shown: true };
      }
      return c;
    }

    /**
     * Register a static sprite: it joins its depth band and its cull cell.
     * @param {Object} obj - Phaser game object, already positioned
     * @param {number} gx - tile it stands on
     * @param {number} gy
     * @param {Object} opts - { light: true to put it in the lights layer }
     */
    function addProp(obj, gx, gy, opts) {
      opts = opts || {};
      if (opts.light) lightsLayer.add(obj);
      else bands[Math.min(bands.length - 1, Math.max(0, bandOf(gx, gy)))].add(obj);
      var c = cellFor(gx, gy);
      c.objs.push(obj);
      var hw = (obj.displayWidth || TILE_W) / 2 + 32;
      var hh = (obj.displayHeight || TILE_H) + 32;
      c.minX = Math.min(c.minX, obj.x - hw);
      c.maxX = Math.max(c.maxX, obj.x + hw);
      c.minY = Math.min(c.minY, obj.y - hh);
      c.maxY = Math.max(c.maxY, obj.y + 32);
      obj.cemCell = c;
      return obj;
    }

    /** Owl and monsters hop between bands as they walk */
    function placeDynamic(obj, gx, gy) {
      var b = Math.min(bands.length - 1, Math.max(0, bandOf(gx, gy)));
      if (obj.cemBand === b) return;
      if (obj.cemBand !== undefined && bands[obj.cemBand]) bands[obj.cemBand].remove(obj);
      bands[b].add(obj);
      obj.cemBand = b;
    }

    function removeDynamic(obj) {
      if (obj.cemBand !== undefined && bands[obj.cemBand]) bands[obj.cemBand].remove(obj);
      obj.cemBand = undefined;
    }

    // --- per-frame ---------------------------------------------------------
    var cullAt = 0;
    var visibleCells = 0;

    function update(force) {
      frameCounter++;
      var budget = force ? 99 : 2;   // chunks repainted per frame, so walking never stutters
      var cam = scene.cameras.main;
      var view = cam.worldView;
      var left = view.x - PAD, right = view.right + PAD, top = view.y - PAD, bottom = view.bottom + PAD;

      // chunks: acquire what the camera can see, release what it left behind
      for (var ci = 0; ci < chunkRect.length; ci++) {
        var r = chunkRect[ci];
        var near = r.left < right && r.left + r.w > left && r.top < bottom && r.top + r.h > top;
        var slot = byChunk[ci] !== undefined ? pool[byChunk[ci]] : null;
        if (near) {
          if (!slot) {
            if (budget <= 0) continue;
            slot = acquire(ci);
            budget--;
          }
          slot.used = frameCounter;
          if (dirty[ci] && budget > 0) { bake(slot); budget--; }
        } else if (slot && frameCounter - slot.used > 600) {
          slot.rt.setVisible(false);
          slot.chunk = -1;
          delete byChunk[ci];
        }
      }

      if (!force && scene.time.now < cullAt) return;
      cullAt = scene.time.now + CULL_MS;
      visibleCells = 0;
      for (var key in cells) {
        if (!cells.hasOwnProperty(key)) continue;
        var c = cells[key];
        var show = c.maxX > left && c.minX < right && c.maxY > top && c.minY < bottom;
        if (show) visibleCells++;
        if (show === c.shown) continue;
        c.shown = show;
        for (var i = 0; i < c.objs.length; i++) {
          var o = c.objs[i];
          o.visible = show && o.cemShown !== false;
        }
      }
    }

    /** A prop's own visibility (fog) without fighting the culler */
    function setPropShown(obj, shown) {
      obj.cemShown = shown;
      obj.visible = shown && (!obj.cemCell || obj.cemCell.shown);
    }

    function stats() {
      var live = 0;
      for (var i = 0; i < pool.length; i++) if (pool[i].chunk !== -1) live++;
      return { chunks: live, pool: pool.length, bakes: bakes, cells: Object.keys(cells).length, visibleCells: visibleCells, bands: bands.length };
    }

    return {
      CHUNK: CHUNK,
      groundLayer: groundLayer,
      lightsLayer: lightsLayer,
      bands: bands,
      bandOf: bandOf,
      setBakeFn: function(fn) { bakeFn = fn; },
      chunkTiles: chunkTiles,
      chunkIndexOf: chunkIndexOf,
      addProp: addProp,
      placeDynamic: placeDynamic,
      removeDynamic: removeDynamic,
      setPropShown: setPropShown,
      markSeen: markSeen,
      update: update,
      stats: stats
    };
  }

  return { attach: attach, bandOf: bandOf, cellKey: cellKey, CHUNK: CHUNK };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemWorld;
}
