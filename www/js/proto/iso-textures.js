/**
 * IsoTextures
 * Procedural fallback textures for the isometric prototype, plus round tokens
 * derived from the existing monster PNGs. Real art from assets/proto/iso/ is
 * used whenever a texture key already exists in the Phaser texture manager.
 */

var IsoTextures = (function() {
  var TILE_W = 128;
  var TILE_H = 64;
  var WALL_H = 64;

  var FALLBACK_PALETTE = {
    floor: '#4b4f63',
    floorDark: '#3a3d4f',
    floorLight: '#5a5f76',
    wall: '#6d6a7a',
    wallDark: '#4e4b59',
    edge: '#2a2c3a'
  };

  // Optional real art files (key -> filename under assets/proto/iso/)
  var OPTIONAL_FILES = {
    floor_0: 'floor_0.png', floor_1: 'floor_1.png', floor_2: 'floor_2.png',
    corridor: 'corridor.png',
    wall_n: 'wall_n.png', wall_w: 'wall_w.png',
    rim_s: 'rim_s.png', rim_e: 'rim_e.png',
    entrance: 'entrance.png', portal: 'portal.png',
    marker_unknown: 'marker_unknown.png',
    treasure_chest: 'treasure_chest.png', treasure_open: 'treasure_open.png',
    highlight_ring: 'highlight_ring.png', reach_ring: 'reach_ring.png',
    tok_knight_owl: 'tok_knight_owl.png', tok_dragon: 'tok_dragon.png'
  };

  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
  function rgb(r, g, b) { return 'rgb(' + clamp(r) + ',' + clamp(g) + ',' + clamp(b) + ')'; }

  /**
   * Average colours of horizontal bands of an image (wall band, floor band).
   * Throws on tainted canvases (file://), caller falls back.
   */
  function samplePalette(img) {
    try {
      if (!img || !img.width) return FALLBACK_PALETTE;
      var c = document.createElement('canvas');
      c.width = 16; c.height = 16;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 16, 16);
      var data = ctx.getImageData(0, 0, 16, 16).data;
      function avg(y0, y1) {
        var r = 0, g = 0, b = 0, n = 0;
        for (var y = y0; y < y1; y++) {
          for (var x = 0; x < 16; x++) {
            var i = (y * 16 + x) * 4;
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
        }
        return [r / n, g / n, b / n];
      }
      var wall = avg(4, 10);
      var floor = avg(11, 16);
      return {
        floor: rgb(floor[0], floor[1], floor[2]),
        floorDark: rgb(floor[0] * 0.8, floor[1] * 0.8, floor[2] * 0.8),
        floorLight: rgb(floor[0] * 1.15 + 8, floor[1] * 1.15 + 8, floor[2] * 1.15 + 8),
        wall: rgb(wall[0] * 1.05, wall[1] * 1.05, wall[2] * 1.1),
        wallDark: rgb(wall[0] * 0.7, wall[1] * 0.7, wall[2] * 0.75),
        edge: rgb(floor[0] * 0.45, floor[1] * 0.45, floor[2] * 0.5)
      };
    } catch (e) {
      return FALLBACK_PALETTE;
    }
  }

  function diamondPath(ctx, cx, cy, hw, hh) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
  }

  function canvasTexture(scene, key, w, h, draw) {
    if (scene.textures.exists(key)) return;
    var tex = scene.textures.createCanvas(key, w, h);
    var ctx = tex.getContext();
    draw(ctx, w, h);
    tex.refresh();
  }

  function drawFloor(ctx, palette, variant, dark) {
    var base = dark ? palette.floorDark : (variant === 1 ? palette.floorLight : palette.floor);
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.fillStyle = base;
    ctx.fill();
    // flagstone cracks
    ctx.save();
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.clip();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    var seed = variant * 17 + (dark ? 5 : 0);
    for (var i = 0; i < 4; i++) {
      var t = ((seed + i * 37) % 100) / 100;
      ctx.beginPath();
      ctx.moveTo(64 + (t - 0.5) * 100, 0 + t * 20);
      ctx.lineTo(64 + (t - 0.5) * 60, 64 - t * 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10 + t * 40, 32 + (t - 0.5) * 30);
      ctx.lineTo(118 - t * 40, 32 + (0.5 - t) * 30);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawWall(ctx, palette, side) {
    // Canvas 128x96, floor edge at the bottom third. side 'n' = top->right edge, 'w' = top->left edge
    var pts = side === 'n'
      ? [[64, 64], [128, 96], [128, 32], [64, 0]]
      : [[64, 64], [0, 96], [0, 32], [64, 0]];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = side === 'n' ? palette.wallDark : palette.wall;
    ctx.fill();
    // brick lines
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = palette.edge;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    for (var row = 1; row < 4; row++) {
      var y = row * 16;
      ctx.beginPath();
      if (side === 'n') { ctx.moveTo(64, y); ctx.lineTo(128, y + 32); }
      else { ctx.moveTo(64, y); ctx.lineTo(0, y + 32); }
      ctx.stroke();
      var off = (row % 2) * 16;
      for (var b = 0; b < 3; b++) {
        var x = side === 'n' ? 64 + off + b * 22 : 64 - off - b * 22;
        var slope = side === 'n' ? (x - 64) / 2 : (64 - x) / 2;
        ctx.beginPath();
        ctx.moveTo(x, y + slope);
        ctx.lineTo(x, y + slope + 16);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawRim(ctx, palette, side) {
    // Canvas 128x44; floor edge from (0,8)->(64,40) for 's', (64,40)->(128,8) for 'e'
    var pts = side === 's'
      ? [[0, 8], [64, 40], [64, 32], [0, 0]]
      : [[64, 40], [128, 8], [128, 0], [64, 32]];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = side === 's' ? palette.wall : palette.wallDark;
    ctx.fill();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawRing(ctx, color, dashed) {
    diamondPath(ctx, 64, 32, 58, 29);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    if (dashed) ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawMarker(ctx, text, fill, ring, size) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = ring;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + Math.round(size * 0.5) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2 + 2);
  }

  /**
   * Generate every fallback texture that no real file provided
   */
  function generateFallbacks(scene, palette) {
    palette = palette || FALLBACK_PALETTE;
    [0, 1, 2].forEach(function(v) {
      canvasTexture(scene, 'floor_' + v, TILE_W, TILE_H, function(ctx) { drawFloor(ctx, palette, v, false); });
    });
    canvasTexture(scene, 'corridor', TILE_W, TILE_H, function(ctx) { drawFloor(ctx, palette, 2, true); });
    canvasTexture(scene, 'wall_n', TILE_W, 96, function(ctx) { drawWall(ctx, palette, 'n'); });
    canvasTexture(scene, 'wall_w', TILE_W, 96, function(ctx) { drawWall(ctx, palette, 'w'); });
    canvasTexture(scene, 'rim_s', TILE_W, 44, function(ctx) { drawRim(ctx, palette, 's'); });
    canvasTexture(scene, 'rim_e', TILE_W, 44, function(ctx) { drawRim(ctx, palette, 'e'); });
    canvasTexture(scene, 'highlight_ring', TILE_W, TILE_H, function(ctx) { drawRing(ctx, '#00bcd4', false); });
    canvasTexture(scene, 'reach_ring', TILE_W, TILE_H, function(ctx) { drawRing(ctx, 'rgba(0,188,212,0.55)', true); });
    canvasTexture(scene, 'marker_unknown', 64, 64, function(ctx) { drawMarker(ctx, '?', '#263238', '#90a4ae', 64); });
    canvasTexture(scene, 'entrance', 96, 96, function(ctx) {
      // stairway glyph
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(48, 72, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
      for (var i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#7c8a97' : '#5f6b78';
        ctx.fillRect(28 + i * 4, 64 - i * 12, 40, 12);
      }
      ctx.fillStyle = '#4caf50';
      ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('E', 48, 30);
    });
    canvasTexture(scene, 'portal', 96, 96, function(ctx) {
      var g = ctx.createRadialGradient(48, 48, 6, 48, 48, 44);
      g.addColorStop(0, 'rgba(206,147,216,0.95)');
      g.addColorStop(0.6, 'rgba(156,39,176,0.6)');
      g.addColorStop(1, 'rgba(156,39,176,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(48, 48, 44, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e1bee7'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(48, 48, 30, 0, Math.PI * 2); ctx.stroke();
    });
    canvasTexture(scene, 'treasure_chest', 96, 96, function(ctx) { drawMarker(ctx, '$', '#8d6e63', '#ffd700', 96); });
    canvasTexture(scene, 'treasure_open', 96, 96, function(ctx) { drawMarker(ctx, '✓', '#5d4037', '#a1887f', 96); });
  }

  /**
   * Build a round token texture from a monster/scene PNG (centre crop)
   * @returns {boolean} Whether the texture was created from the image
   */
  function makeToken(scene, key, img, size, ringColor) {
    if (scene.textures.exists(key)) return true;
    try {
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      var ctx = c.getContext('2d');
      var r = size / 2 - 3;
      ctx.save();
      ctx.beginPath(); ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2); ctx.clip();
      var side = Math.min(img.width, img.height);
      var sx = (img.width - side) / 2, sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      ctx.restore();
      ctx.beginPath(); ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.lineWidth = 3; ctx.strokeStyle = ringColor || '#ffd700'; ctx.stroke();
      scene.textures.addCanvas(key, c);
      return true;
    } catch (e) {
      return false;
    }
  }

  function makeFallbackToken(scene, key, letter, fill, ringColor, size) {
    if (scene.textures.exists(key)) return;
    canvasTexture(scene, key, size, size, function(ctx) { drawMarker(ctx, letter, fill, ringColor, size); });
  }

  /**
   * Load an image element (resolves with null on error)
   */
  function loadImage(src) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() { resolve(img); };
      img.onerror = function() { resolve(null); };
      img.src = src;
    });
  }

  return {
    TILE_W: TILE_W,
    TILE_H: TILE_H,
    WALL_H: WALL_H,
    FALLBACK_PALETTE: FALLBACK_PALETTE,
    OPTIONAL_FILES: OPTIONAL_FILES,
    samplePalette: samplePalette,
    generateFallbacks: generateFallbacks,
    makeToken: makeToken,
    makeFallbackToken: makeFallbackToken,
    loadImage: loadImage
  };
})();
