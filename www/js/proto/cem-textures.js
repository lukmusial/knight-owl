/**
 * CemTextures
 * Procedural canvas art for the cemetery level (night grass and dirt
 * diamonds, spider webs, moon, fog vignette, mist, sparkles, tomb door and
 * lock overlays) plus stand-in sprites for every prop so the level plays
 * before the Kenney kit renders exist. Also loads the rendered kit manifest
 * (assets/proto/iso/cemetery/cemetery.json) and resolves a prop name to the
 * best available texture with its anchor and footprint.
 *
 * Sprite convention (kit and stand-ins alike): the anchor is the floor point
 * of the footprint centre as a fraction of the image; `light` is where a
 * lantern flame sits; `door` is the floor point in front of a tomb door.
 */

var CemTextures = (function() {
  var TILE_W = 128, TILE_H = 64;
  var KIT_DIR = 'assets/proto/iso/cemetery/';
  var KIT_JSON = 'cem_kit';
  var PUDDLE_W = 112, PUDDLE_H = 56;   // a puddle texture, inside one tile diamond
  var kit = null;          // manifest { ppt, sprites: { name: {...} } }
  var fallbacks = {};      // name -> { key, w, h, anchor, footprint, light?, door? }

  var T = function() { return IsoTextures; };

  function canvasTexture(scene, key, w, h, draw) {
    T().canvasTexture(scene, key, w, h, draw);
  }

  function rng(seed) { return T().rng(seed); }

  // ---------------------------------------------------------------------------
  // Ground diamonds
  // ---------------------------------------------------------------------------

  function drawGrass(ctx, variant) {
    var r = rng(101 + variant * 17);
    var cx = TILE_W / 2, cy = TILE_H / 2;
    T().diamondPath(ctx, cx, cy, TILE_W / 2, TILE_H / 2);
    var g = ctx.createLinearGradient(0, 0, 0, TILE_H);
    g.addColorStop(0, variant === 3 ? '#243634' : '#1f2f30');
    g.addColorStop(1, '#182527');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    // blotches
    for (var b = 0; b < 7; b++) {
      ctx.fillStyle = r() < 0.5 ? 'rgba(45,70,60,0.35)' : 'rgba(20,30,34,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx + (r() - 0.5) * 100, cy + (r() - 0.5) * 44, 10 + r() * 16, 5 + r() * 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // tufts
    var tufts = 9 + Math.floor(r() * 6);
    ctx.lineWidth = 1.3;
    for (var t = 0; t < tufts; t++) {
      var tx = cx + (r() - 0.5) * 104, ty = cy + (r() - 0.5) * 46;
      ctx.strokeStyle = r() < 0.6 ? '#3b5245' : '#47624f';
      for (var s = -1; s <= 1; s++) {
        ctx.beginPath();
        ctx.moveTo(tx, ty + 2);
        ctx.quadraticCurveTo(tx + s * 2, ty - 3, tx + s * 4, ty - 7 - r() * 3);
        ctx.stroke();
      }
    }
    if (variant === 3) {
      // fallen leaves
      for (var l = 0; l < 5; l++) {
        ctx.fillStyle = r() < 0.5 ? 'rgba(150,90,40,0.6)' : 'rgba(120,70,30,0.6)';
        ctx.beginPath();
        ctx.ellipse(cx + (r() - 0.5) * 96, cy + (r() - 0.5) * 40, 4, 2.2, r() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawPath(ctx, variant) {
    var r = rng(211 + variant * 31);
    var cx = TILE_W / 2, cy = TILE_H / 2;
    T().diamondPath(ctx, cx, cy, TILE_W / 2, TILE_H / 2);
    var g = ctx.createLinearGradient(0, 0, 0, TILE_H);
    g.addColorStop(0, variant === 1 ? '#4d3f35' : '#43352c');
    g.addColorStop(1, variant === 1 ? '#3c3028' : '#33281f');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    for (var b = 0; b < 6; b++) {
      ctx.fillStyle = r() < 0.5 ? 'rgba(90,72,58,0.35)' : 'rgba(30,22,16,0.35)';
      ctx.beginPath();
      ctx.ellipse(cx + (r() - 0.5) * 100, cy + (r() - 0.5) * 44, 8 + r() * 18, 4 + r() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // pebbles
    for (var p = 0; p < 8; p++) {
      ctx.fillStyle = r() < 0.5 ? '#5d5148' : '#2b221c';
      ctx.beginPath();
      ctx.ellipse(cx + (r() - 0.5) * 100, cy + (r() - 0.5) * 44, 1.5 + r() * 2, 1 + r(), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (variant === 1) {
      // flagstones of a plaza
      ctx.strokeStyle = 'rgba(20,14,10,0.5)';
      ctx.lineWidth = 1;
      for (var k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.moveTo(cx + k * 24 - 40, cy - 20 + k * 0); ctx.lineTo(cx + k * 24 + 40, cy + 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + k * 24 + 40, cy - 20); ctx.lineTo(cx + k * 24 - 40, cy + 20); ctx.stroke();
      }
    }
    // soft grass edge
    ctx.strokeStyle = 'rgba(40,60,50,0.55)';
    ctx.lineWidth = 6;
    T().diamondPath(ctx, cx, cy, TILE_W / 2, TILE_H / 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Atmosphere
  // ---------------------------------------------------------------------------

  function drawWeb(ctx, size, small) {
    var cx = 0, cy = 0;
    var R = size * 0.95;
    ctx.strokeStyle = 'rgba(235,240,255,0.55)';
    ctx.lineWidth = small ? 0.8 : 1;
    var spokes = 7;
    for (var i = 0; i <= spokes; i++) {
      var a = (i / spokes) * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    }
    for (var ring = 1; ring <= 6; ring++) {
      var rr = R * ring / 6.5;
      ctx.beginPath();
      for (var j = 0; j <= spokes; j++) {
        var a2 = (j / spokes) * Math.PI / 2;
        var sag = 1 - 0.06 * Math.sin((j / spokes) * Math.PI * spokes);
        var x = cx + Math.cos(a2) * rr * sag, y = cy + Math.sin(a2) * rr * sag;
        if (j === 0) ctx.moveTo(x, y); else ctx.quadraticCurveTo(cx + Math.cos(a2 - Math.PI / spokes / 2) * rr * 0.93, cy + Math.sin(a2 - Math.PI / spokes / 2) * rr * 0.93, x, y);
      }
      ctx.stroke();
    }
    // a tear
    ctx.clearRect(size * 0.55, size * 0.55, size * 0.2, size * 0.16);
  }

  function drawMoon(ctx) {
    var g = ctx.createRadialGradient(40, 40, 6, 48, 48, 46);
    g.addColorStop(0, '#fff8dc');
    g.addColorStop(0.7, '#ece2b8');
    g.addColorStop(1, '#cfc49a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(48, 48, 44, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(160,150,120,0.35)';
    [[30, 36, 8], [58, 30, 5], [62, 60, 10], [36, 64, 6]].forEach(function(c) {
      ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.fill();
    });
  }

  /**
   * Soft elliptical light used to cut holes in the night: an iso-shaped
   * falloff so the reveal around Mr Owl reads as a circle on the ground.
   */
  function drawSoftLight(ctx, w, h) {
    var cx = w / 2, cy = h / 2;
    var img = ctx.createImageData(w, h);
    var d = img.data;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var nx = (x - cx) / (w / 2), ny = (y - cy) / (h / 2);
        var r = Math.sqrt(nx * nx + ny * ny);
        var a = r >= 1 ? 0 : Math.pow(1 - r, 1.6);
        var i = (y * w + x) * 4;
        d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
        d[i + 3] = Math.round(255 * a);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /**
   * The night itself: a dark square with a soft elliptical hole in the
   * middle, carried by Mr Owl. Drawn once on a canvas (destination-out is
   * plain 2D work), so the fog needs no render texture, mask or erase blend
   * at runtime: some Android WebViews get all three wrong.
   * @param {number} size - square texture size
   * @param {number} rx - hole radius in px; the hole is a 2:1 ellipse
   */
  function drawDarkRing(ctx, size, rx) {
    ctx.fillStyle = '#090c1a';
    ctx.fillRect(0, 0, size, size);
    var cx = size / 2, cy = size / 2;
    var img = ctx.getImageData(0, 0, size, size);
    var d = img.data;
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var nx = (x - cx) / rx, ny = (y - cy) / (rx / 2);
        var r = Math.sqrt(nx * nx + ny * ny);
        var light = r >= 1 ? 0 : Math.pow(1 - r, 1.6);
        d[(y * size + x) * 4 + 3] = Math.round(255 * (1 - light));
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function drawVignette(ctx, size) {
    var g = ctx.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size * 0.55);
    g.addColorStop(0, 'rgba(5,6,12,0)');
    g.addColorStop(0.6, 'rgba(5,6,12,0.35)');
    g.addColorStop(1, 'rgba(5,6,12,0.92)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  function drawMist(ctx, w, h) {
    var r = rng(77);
    for (var i = 0; i < 9; i++) {
      var x = w * 0.15 + r() * w * 0.7, y = h * 0.3 + r() * h * 0.4;
      var g = ctx.createRadialGradient(x, y, 2, x, y, 40 + r() * 40);
      g.addColorStop(0, 'rgba(180,200,220,0.18)');
      g.addColorStop(1, 'rgba(180,200,220,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawSparkle(ctx, size) {
    ctx.fillStyle = '#fff4c2';
    ctx.beginPath();
    var c = size / 2;
    ctx.moveTo(c, 0); ctx.quadraticCurveTo(c, c, size, c); ctx.quadraticCurveTo(c, c, c, size); ctx.quadraticCurveTo(c, c, 0, c); ctx.quadraticCurveTo(c, c, c, 0);
    ctx.fill();
  }

  function drawPuff(ctx, size) {
    var r = rng(5);
    for (var i = 0; i < 6; i++) {
      var x = size / 2 + (r() - 0.5) * size * 0.5, y = size / 2 + (r() - 0.5) * size * 0.5;
      var g = ctx.createRadialGradient(x, y, 1, x, y, size * 0.3);
      g.addColorStop(0, 'rgba(200,190,220,0.6)');
      g.addColorStop(1, 'rgba(200,190,220,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
  }

  // ---------------------------------------------------------------------------
  // Rain and puddles
  // ---------------------------------------------------------------------------

  /** An irregular blob inside an ellipse of rx by ry, as a path; `wobble` is how uneven */
  function blobPath(ctx, cx, cy, rx, ry, r, wobble) {
    var n = 14;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      var k = 1 - wobble * r();
      pts.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k });
    }
    ctx.beginPath();
    for (var j = 0; j < n; j++) {
      var p = pts[j], q = pts[(j + 1) % n];
      var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      if (j === 0) ctx.moveTo((pts[n - 1].x + p.x) / 2, (pts[n - 1].y + p.y) / 2);
      ctx.quadraticCurveTo(p.x, p.y, mx, my);
    }
    ctx.closePath();
  }

  /** The water's outline of one puddle shape, at a fraction `k` of its full size */
  function puddleBlob(ctx, w, h, variant, k) {
    blobPath(ctx, w / 2, h / 2, w * 0.42 * k, h * 0.4 * k, rng(701 + variant * 37), 0.22 + variant * 0.06);
  }

  /**
   * A puddle in an iso tile comes in three parts, because the reflection of
   * what stands around it is composited between them on the CPU
   * (cem-scenes.js `bakeReflection`): the base is the wet dark halo and the
   * water, laid down three times for a soft edge; the mask is the water's
   * shape, which the reflection is clipped to; the sheen is the
   * sky-coloured gradient, the gleam and the bright far rim that lie on top
   * of the reflection so the water still reads as a mirror of the night sky.
   */
  function drawPuddleBase(ctx, w, h, variant) {
    puddleBlob(ctx, w, h, variant, 1.18);
    ctx.fillStyle = 'rgba(12,16,26,0.32)';
    ctx.fill();
    var shades = ['rgba(24,32,56,0.45)', 'rgba(28,38,66,0.55)', 'rgba(32,44,76,0.65)'];
    for (var pass = 0; pass < 3; pass++) {
      puddleBlob(ctx, w, h, variant, 1 - pass * 0.07);
      ctx.fillStyle = shades[pass];
      ctx.fill();
    }
  }

  function drawPuddleMask(ctx, w, h, variant) {
    // a graded edge: the outer band is half transparent, the middle solid
    puddleBlob(ctx, w, h, variant, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fill();
    puddleBlob(ctx, w, h, variant, 0.93);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
  }

  function drawPuddleSheen(ctx, w, h, variant) {
    var cx = w / 2, cy = h / 2;
    var rx = w * 0.42, ry = h * 0.4;
    ctx.save();
    puddleBlob(ctx, w, h, variant, 1);
    ctx.clip();
    var sheen = ctx.createLinearGradient(cx - rx * 0.6, cy - ry, cx + rx * 0.3, cy + ry * 0.6);
    sheen.addColorStop(0, 'rgba(176,198,236,0.3)');
    sheen.addColorStop(0.45, 'rgba(150,176,222,0.12)');
    sheen.addColorStop(1, 'rgba(120,150,200,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);
    var gx = cx - rx * 0.3, gy = cy - ry * 0.35;
    var gleam = ctx.createRadialGradient(gx, gy, 0, gx, gy, rx * 0.4);
    gleam.addColorStop(0, 'rgba(220,232,255,0.38)');
    gleam.addColorStop(1, 'rgba(220,232,255,0)');
    ctx.fillStyle = gleam;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.save();
    puddleBlob(ctx, w, h, variant, 0.97);
    ctx.strokeStyle = 'rgba(190,210,245,0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  var puddleCache = {};

  function offscreen(w, h, draw) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'));
    return c;
  }

  /**
   * The three canvases of one puddle shape (0..3), drawn once and shared:
   * { base, mask, sheen, w, h }. Plain canvases, not textures: the scene
   * composites them with the reflection into each puddle's own texture.
   */
  function puddleParts(variant) {
    var v = variant % 4;
    if (!puddleCache[v]) {
      puddleCache[v] = {
        w: PUDDLE_W, h: PUDDLE_H,
        base: offscreen(PUDDLE_W, PUDDLE_H, function(ctx) { drawPuddleBase(ctx, PUDDLE_W, PUDDLE_H, v); }),
        mask: offscreen(PUDDLE_W, PUDDLE_H, function(ctx) { drawPuddleMask(ctx, PUDDLE_W, PUDDLE_H, v); }),
        sheen: offscreen(PUDDLE_W, PUDDLE_H, function(ctx) { drawPuddleSheen(ctx, PUDDLE_W, PUDDLE_H, v); })
      };
    }
    return puddleCache[v];
  }

  /**
   * An elliptical ring, the trace of a drop landing in water: a bright thin
   * rim with a faint dark line inside it, so it reads against the water at
   * map scale even when only a dozen pixels wide.
   */
  function drawDropRing(ctx, w, h) {
    var cx = w / 2, cy = h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, h / w);
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.4 - 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(10,16,40,0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(232,242,255,0.98)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * The ring of a raindrop hitting a puddle, drawn at the size it is seen
   * (a dozen pixels), so its rim stays a crisp pixel and a half wide: white
   * outside, a dark line inside for contrast on lit water.
   */
  function drawPlipRing(ctx, w, h) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(1, h / w);
    ctx.beginPath();
    ctx.arc(0, 0, w / 2 - 2.6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(8,12,34,0.6)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, w / 2 - 1.2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(240,248,255,1)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  /** One raindrop as a slanted-later streak: a thin line, bright at the head */
  function drawRainStreak(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(200,220,255,0)');
    g.addColorStop(0.7, 'rgba(210,226,255,0.55)');
    g.addColorStop(1, 'rgba(235,242,255,0.9)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 0.6, 0);
    ctx.lineTo(w / 2 + 0.6, 0);
    ctx.lineTo(w / 2 + 1.1, h);
    ctx.lineTo(w / 2 - 1.1, h);
    ctx.closePath();
    ctx.fill();
  }

  /** A splash droplet */
  function drawDroplet(ctx, size) {
    var c = size / 2;
    var g = ctx.createRadialGradient(c - 1, c - 1, 0, c, c, c);
    g.addColorStop(0, 'rgba(235,245,255,0.95)');
    g.addColorStop(0.6, 'rgba(180,205,245,0.7)');
    g.addColorStop(1, 'rgba(180,205,245,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  /**
   * The crypt art has its own doorway, an arch on the wall that faces the
   * camera's lower left; the kit manifest says where (`portal`: the sill
   * centre and the arch's size, as fractions of the sprite). The jambs are
   * upright and the sill runs down to the right along the wall, one pixel
   * for every two, so the light is drawn in that shape and the spill on the
   * ground starts on that same sloped line. Only a crypt without a portal
   * gets an opening drawn for it.
   */
  var DOOR_SLOPE = 0.5;
  var SPILL_REACH = 3.8;        // how far the light reaches out, in door widths

  /** Arch outline: jambs at x=0 and x=w, sloped sill, round top; (0,0) is the top-left */
  function archPath(ctx, w, hL) {
    var r = w / 2;
    ctx.beginPath();
    ctx.moveTo(0, hL);
    ctx.lineTo(0, r);
    for (var a = Math.PI; a <= Math.PI * 2 + 0.001; a += Math.PI / 20) {
      ctx.lineTo(r + Math.cos(a) * r, r + Math.sin(a) * r * 0.85);
    }
    ctx.lineTo(w, hL + w * DOOR_SLOPE);
    ctx.closePath();
  }

  /** A drawn opening for crypts whose art has none */
  function drawDoorDark(ctx, w, h) {
    var hL = h - w * DOOR_SLOPE;
    archPath(ctx, w, hL);
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05040a');
    g.addColorStop(1, '#171029');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(26,22,34,0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /** White light filling the arch, brightest at the threshold; tinted by the scene */
  function drawDoorGlow(ctx, w, h) {
    var hL = h - w * DOOR_SLOPE;
    archPath(ctx, w, hL);
    ctx.save();
    ctx.clip();
    var g = ctx.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /**
   * The wedge of light the door throws across the ground. The sill is a
   * sloped segment of width w whose centre sits at (cx, cy); the light
   * leaves it down-left, the way the tile's +y axis points on screen, and
   * spreads as it goes, so it meets the doorway with no seam.
   */
  function drawDoorSpill(ctx, w, cx, cy) {
    // Soft pools of light laid along the tile's +y axis, growing and fading
    // as they go: overlapping radial gradients have no edge to see, where a
    // filled wedge would. The first sits on the sill so the light starts in
    // the doorway with no seam.
    var dx = -0.894, dy = 0.447;
    var reach = w * SPILL_REACH;
    var steps = 7;
    for (var i = 0; i < steps; i++) {
      var t = i / (steps - 1);
      var px = cx + dx * reach * t, py = cy + dy * reach * t;
      var r = w * (0.55 + 1.3 * t);
      var a = 0.85 * (1 - t) * (1 - t) + 0.08;
      var g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')');
      g.addColorStop(0.55, 'rgba(255,255,255,' + (a * 0.45).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, 0.5);                     // the floor is a 2:1 diamond
      ctx.translate(-px, -py);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(px, py, r, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Build the door light textures for one crypt at the size its arch is
   * painted, and say where their origins sit.
   * @param {Phaser.Scene} scene
   * @param {string} name - sprite name, used in the texture keys
   * @param {number} w - arch width in sprite px
   * @param {number} h - arch height in sprite px (left jamb, top to sill)
   * @returns {Object} { glow: {key, ox, oy}, spill: {key, ox, oy} } origins as fractions
   */
  function makeDoorLights(scene, name, w, h) {
    w = Math.max(8, Math.round(w));
    h = Math.max(12, Math.round(h));
    var gh = Math.ceil(h + w * DOOR_SLOPE / 2);            // room for the sloped sill's right end
    var glowKey = 'cem_door_glow_' + name;
    if (!scene.textures.exists(glowKey)) {
      canvasTexture(scene, glowKey, w, gh, function(ctx) { drawDoorGlow(ctx, w, gh); });
    }
    var reach = w * SPILL_REACH;
    var cw = Math.ceil(w + reach * 0.894 * 2 + w * 2);
    var ch = Math.ceil(w * DOOR_SLOPE + reach * 0.447 + w * 1.2 + 4);
    var cx = cw / 2, cy = w * DOOR_SLOPE / 2 + 2;
    var spillKey = 'cem_door_spill_' + name;
    if (!scene.textures.exists(spillKey)) {
      canvasTexture(scene, spillKey, cw, ch, function(ctx) { drawDoorSpill(ctx, w, cx, cy); });
    }
    return {
      // the glow's origin is the sill centre: the left jamb's foot is w/4 above it, the right's w/4 below
      glow: { key: glowKey, ox: 0.5, oy: (h + w * DOOR_SLOPE / 4) / gh },
      spill: { key: spillKey, ox: 0.5, oy: cy / ch }
    };
  }

  function drawLock(ctx, size) {
    ctx.strokeStyle = '#8f8a80'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(size / 2, size * 0.36, size * 0.2, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#c9a24a';
    ctx.fillRect(size * 0.22, size * 0.42, size * 0.56, size * 0.42);
    ctx.fillStyle = '#4a3a10';
    ctx.beginPath(); ctx.arc(size / 2, size * 0.6, size * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(size / 2 - size * 0.03, size * 0.6, size * 0.06, size * 0.14);
    // chain links
    ctx.strokeStyle = '#7a756c'; ctx.lineWidth = 3;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.ellipse(size / 2 + i * size * 0.22, size * 0.9, size * 0.08, size * 0.05, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // ---------------------------------------------------------------------------
  // Stand-in props (used until the rendered Kenney kit is present)
  // ---------------------------------------------------------------------------

  function shadowBlob(ctx, x, y, rx, ry) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawGrave(ctx, variant) {
    // canvas 64x84, base point (32, 76)
    var bx = 32, by = 76;
    shadowBlob(ctx, bx, by, 18, 6);
    var stone = ctx.createLinearGradient(14, 0, 50, 0);
    stone.addColorStop(0, '#5c6270'); stone.addColorStop(0.5, '#8a909c'); stone.addColorStop(1, '#4a4f5a');
    ctx.fillStyle = stone;
    ctx.strokeStyle = '#2a2d36'; ctx.lineWidth = 1;
    ctx.beginPath();
    switch (variant % 6) {
      case 0: // rounded headstone
        ctx.moveTo(18, by); ctx.lineTo(18, 34); ctx.arc(32, 34, 14, Math.PI, 0); ctx.lineTo(46, by); break;
      case 1: // cross
        ctx.rect(28, 22, 8, by - 22); ctx.rect(16, 34, 32, 8); break;
      case 2: // flat slab (lying)
        ctx.moveTo(8, by - 10); ctx.lineTo(40, by - 26); ctx.lineTo(58, by - 18); ctx.lineTo(26, by - 2); ctx.closePath(); break;
      case 3: // obelisk
        ctx.moveTo(22, by); ctx.lineTo(26, 20); ctx.lineTo(32, 10); ctx.lineTo(38, 20); ctx.lineTo(42, by); break;
      case 4: // wide bevelled stone
        ctx.moveTo(14, by); ctx.lineTo(14, 40); ctx.lineTo(20, 32); ctx.lineTo(44, 32); ctx.lineTo(50, 40); ctx.lineTo(50, by); break;
      default: // broken stone
        ctx.moveTo(18, by); ctx.lineTo(18, 40); ctx.lineTo(28, 30); ctx.lineTo(40, 44); ctx.lineTo(46, 38); ctx.lineTo(46, by);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // mossy base and an inscription hint
    ctx.fillStyle = 'rgba(60,90,70,0.6)';
    ctx.beginPath(); ctx.ellipse(bx, by - 2, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    if (variant % 6 !== 2 && variant % 6 !== 1) {
      ctx.strokeStyle = 'rgba(30,32,40,0.6)';
      for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(25, 46 + i * 6); ctx.lineTo(39, 46 + i * 6); ctx.stroke(); }
    }
  }

  function drawTree(ctx, variant) {
    // canvas 128x180, base (64, 168): a dead tree
    var r = rng(300 + variant);
    shadowBlob(ctx, 64, 168, 26, 8);
    ctx.strokeStyle = '#2a211c'; ctx.fillStyle = '#3a2d25'; ctx.lineCap = 'round';
    function branch(x, y, len, angle, width, depth) {
      var ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
      ctx.lineWidth = width; ctx.strokeStyle = depth > 2 ? '#2a211c' : '#3a2d25';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (r() - 0.5) * 12, (y + ey) / 2, ex, ey); ctx.stroke();
      if (depth >= 5 || len < 8) return;
      var n = 2 + Math.floor(r() * 2);
      for (var i = 0; i < n; i++) branch(ex, ey, len * (0.55 + r() * 0.25), angle + (r() - 0.5) * 1.5, width * 0.6, depth + 1);
    }
    branch(64, 166, 54 + variant * 4, -Math.PI / 2 + (r() - 0.5) * 0.3, 11, 0);
    if (variant === 3) {
      // a pine keeps some dark needles
      ctx.fillStyle = 'rgba(30,55,45,0.85)';
      for (var t = 0; t < 4; t++) {
        var y = 120 - t * 26, w = 60 - t * 12;
        ctx.beginPath(); ctx.moveTo(64 - w / 2, y); ctx.lineTo(64, y - 34); ctx.lineTo(64 + w / 2, y); ctx.closePath(); ctx.fill();
      }
    }
  }

  function drawFenceSegment(ctx, side, gate) {
    // canvas 128x76, the picket fence runs along the back-right ('n') or back-left ('w') edge of a diamond
    // base point (64, 60) = diamond centre; the edge runs from (0,28) to (64,-4)... drawn relative to the tile
    var x0 = side === 'n' ? 64 : 0, y0 = side === 'n' ? 28 : 28; // start on the diamond's back edge
    var x1 = side === 'n' ? 128 : 64, y1 = side === 'n' ? 60 : -4;
    // edge midpoint runs between the top corner (64,-4)... we draw pickets along the line from A to B
    var ax = side === 'n' ? 64 : 0, ay = side === 'n' ? 28 : 60;
    var bx = side === 'n' ? 128 : 64, by = side === 'n' ? 60 : 28;
    var count = gate ? 0 : 6;
    var wood = '#7d6a55', woodDark = '#4e4034';
    // rails
    ctx.strokeStyle = woodDark; ctx.lineWidth = 3;
    [22, 40].forEach(function(up) {
      ctx.beginPath(); ctx.moveTo(ax, ay - up); ctx.lineTo(bx, by - up); ctx.stroke();
    });
    ctx.strokeStyle = wood; ctx.lineWidth = 2;
    [22, 40].forEach(function(up) {
      ctx.beginPath(); ctx.moveTo(ax, ay - up - 1); ctx.lineTo(bx, by - up - 1); ctx.stroke();
    });
    for (var i = 0; i <= count; i++) {
      var t = i / count;
      var px = ax + (bx - ax) * t, py = ay + (by - ay) * t;
      var h = 46 + (i % 2) * 4;
      ctx.fillStyle = i % 3 === 0 ? woodDark : wood;
      ctx.beginPath();
      ctx.moveTo(px - 4, py); ctx.lineTo(px - 4, py - h + 5); ctx.lineTo(px, py - h); ctx.lineTo(px + 4, py - h + 5); ctx.lineTo(px + 4, py);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2b2119'; ctx.lineWidth = 1; ctx.stroke();
    }
    if (gate) {
      // open gate: two leaning halves
      ctx.strokeStyle = '#5a4b3c'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(ax, ay - 46); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by - 46); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = '#8a7a66'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax + 2, ay - 40); ctx.lineTo(ax + 26, ay - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 2, by - 40); ctx.lineTo(bx - 26, by - 20); ctx.stroke();
    }
    void x0; void y0; void x1; void y1;
  }

  function drawFencePost(ctx) {
    // canvas 32x80, base (16, 72): a stone corner post
    shadowBlob(ctx, 16, 72, 12, 4);
    var g = ctx.createLinearGradient(4, 0, 28, 0);
    g.addColorStop(0, '#5a5f6b'); g.addColorStop(0.5, '#868c99'); g.addColorStop(1, '#474b55');
    ctx.fillStyle = g;
    ctx.fillRect(8, 16, 16, 56);
    ctx.fillStyle = '#9aa0ad';
    ctx.beginPath(); ctx.moveTo(4, 16); ctx.lineTo(16, 6); ctx.lineTo(28, 16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a2d36'; ctx.lineWidth = 1; ctx.strokeRect(8, 16, 16, 56);
  }

  function drawLanternPost(ctx) {
    // canvas 48x120, base (24, 112), light at (24, 34): the centre of the
    // glass box (y 27..42) this lamp carries on top of its post
    shadowBlob(ctx, 24, 112, 12, 4);
    ctx.fillStyle = '#2b2b30';
    ctx.fillRect(21, 40, 6, 72);
    ctx.fillRect(14, 106, 20, 6);
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(16, 26, 16, 4);
    ctx.beginPath(); ctx.moveTo(14, 44); ctx.lineTo(34, 44); ctx.lineTo(30, 24); ctx.lineTo(18, 24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,214,140,0.5)';
    ctx.beginPath(); ctx.moveTo(17, 42); ctx.lineTo(31, 42); ctx.lineTo(28, 27); ctx.lineTo(20, 27); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a3a42';
    ctx.beginPath(); ctx.moveTo(12, 24); ctx.lineTo(24, 14); ctx.lineTo(36, 24); ctx.closePath(); ctx.fill();
  }

  function drawPumpkin(ctx, variant) {
    // canvas 48x40, base (24, 36)
    shadowBlob(ctx, 24, 36, 16, 5);
    var g = ctx.createRadialGradient(18, 18, 2, 24, 22, 20);
    g.addColorStop(0, '#ffa54a'); g.addColorStop(0.7, '#e4741c'); g.addColorStop(1, '#8a3f0a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(24, 24, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,50,10,0.5)'; ctx.lineWidth = 1.5;
    [-8, 0, 8].forEach(function(x) { ctx.beginPath(); ctx.ellipse(24 + x, 24, 6, 14, 0, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = '#4c7a2a';
    ctx.fillRect(22, 6, 5, 8);
    if (variant > 0) {
      // carved face glowing
      ctx.fillStyle = '#ffe28a';
      ctx.beginPath(); ctx.moveTo(15, 20); ctx.lineTo(21, 17); ctx.lineTo(20, 23); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(33, 20); ctx.lineTo(27, 17); ctx.lineTo(28, 23); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(14, 28); ctx.lineTo(19, 31); ctx.lineTo(24, 28); ctx.lineTo(29, 31); ctx.lineTo(34, 28); ctx.lineTo(24, 34); ctx.closePath(); ctx.fill();
    }
  }

  function drawBench(ctx) {
    // canvas 96x64, base (48, 56)
    shadowBlob(ctx, 48, 56, 34, 7);
    ctx.fillStyle = '#5a4736'; ctx.strokeStyle = '#2b2119'; ctx.lineWidth = 1;
    // iso plank: parallelogram along the n edge
    ctx.beginPath(); ctx.moveTo(14, 36); ctx.lineTo(70, 8); ctx.lineTo(84, 15); ctx.lineTo(28, 43); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4a3a2c';
    ctx.beginPath(); ctx.moveTo(14, 36); ctx.lineTo(28, 43); ctx.lineTo(28, 50); ctx.lineTo(14, 43); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a3a42';
    [[20, 40], [66, 17]].forEach(function(p) { ctx.fillRect(p[0], p[1], 4, 14); ctx.fillRect(p[0] + 8, p[1] + 4, 4, 14); });
    // backrest
    ctx.fillStyle = '#6a5644';
    ctx.beginPath(); ctx.moveTo(18, 22); ctx.lineTo(74, -6 + 8); ctx.lineTo(74, 8); ctx.lineTo(18, 36); ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  function drawRock(ctx, variant) {
    // canvas 64x44, base (32, 40)
    shadowBlob(ctx, 32, 40, 22, 6);
    var g = ctx.createLinearGradient(10, 0, 54, 0);
    g.addColorStop(0, '#4a4f5a'); g.addColorStop(0.5, '#7b8290'); g.addColorStop(1, '#3a3e47');
    ctx.fillStyle = g; ctx.strokeStyle = '#22252c'; ctx.lineWidth = 1;
    ctx.beginPath();
    if (variant === 0) { ctx.moveTo(10, 36); ctx.lineTo(16, 18); ctx.lineTo(34, 10); ctx.lineTo(52, 20); ctx.lineTo(54, 36); }
    else { ctx.moveTo(8, 38); ctx.lineTo(20, 24); ctx.lineTo(40, 22); ctx.lineTo(56, 34); ctx.lineTo(50, 40); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(60,90,70,0.5)';
    ctx.beginPath(); ctx.ellipse(22, 34, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawStatueProp(ctx, variant) {
    // canvas 64x132: reuse the owl statue of the dungeon; variants tint
    T().drawStatue(ctx, T().FALLBACK_PALETTE);
    if (variant === 1) { ctx.fillStyle = 'rgba(120,90,160,0.18)'; ctx.fillRect(0, 0, 64, 132); }
    if (variant === 2) { ctx.fillStyle = 'rgba(70,110,90,0.2)'; ctx.fillRect(0, 0, 64, 132); }
  }

  function drawTomb(ctx, large) {
    // small: canvas 256x200, footprint 2x2, base (128, 200-64); large: 384x290, footprint 3x3, base (192, 290-96)
    var w = large ? 384 : 256, h = large ? 290 : 200;
    var hw = large ? 192 : 128, hh = large ? 96 : 64;   // half diamond of the footprint
    var cx = w / 2, cy = h - hh;                          // footprint centre on the floor
    var wallH = large ? 110 : 70;
    var top = { x: cx, y: cy - hh }, right = { x: cx + hw, y: cy }, bottom = { x: cx, y: cy + hh }, left = { x: cx - hw, y: cy };
    // inset the building a little inside its footprint
    var k = 0.86;
    function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
    var c = { x: cx, y: cy };
    top = lerp(c, top, k); right = lerp(c, right, k); bottom = lerp(c, bottom, k); left = lerp(c, left, k);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.moveTo(cx, cy - hh); ctx.lineTo(cx + hw, cy); ctx.lineTo(cx, cy + hh); ctx.lineTo(cx - hw, cy); ctx.closePath(); ctx.fill();
    var stoneL = ctx.createLinearGradient(left.x, 0, bottom.x, 0);
    stoneL.addColorStop(0, '#5d6373'); stoneL.addColorStop(1, '#7b8294');
    var stoneR = ctx.createLinearGradient(bottom.x, 0, right.x, 0);
    stoneR.addColorStop(0, '#4a4f5c'); stoneR.addColorStop(1, '#3a3e49');
    ctx.strokeStyle = '#1f222a'; ctx.lineWidth = 1.5;
    // left (front-left) wall
    ctx.fillStyle = stoneL;
    ctx.beginPath(); ctx.moveTo(left.x, left.y); ctx.lineTo(bottom.x, bottom.y); ctx.lineTo(bottom.x, bottom.y - wallH); ctx.lineTo(left.x, left.y - wallH); ctx.closePath(); ctx.fill(); ctx.stroke();
    // right (front-right) wall
    ctx.fillStyle = stoneR;
    ctx.beginPath(); ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(right.x, right.y); ctx.lineTo(right.x, right.y - wallH); ctx.lineTo(bottom.x, bottom.y - wallH); ctx.closePath(); ctx.fill(); ctx.stroke();
    // roof: gabled slab
    var roofH = large ? 40 : 26;
    ctx.fillStyle = '#8d93a3';
    ctx.beginPath(); ctx.moveTo(top.x, top.y - wallH); ctx.lineTo(right.x, right.y - wallH); ctx.lineTo(bottom.x, bottom.y - wallH); ctx.lineTo(left.x, left.y - wallH); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a3a9b8';
    ctx.beginPath(); ctx.moveTo(lerp(left, top, 0.5).x, lerp(left, top, 0.5).y - wallH); ctx.lineTo(lerp(right, bottom, 0.5).x, lerp(right, bottom, 0.5).y - wallH); ctx.lineTo(lerp(right, bottom, 0.5).x, lerp(right, bottom, 0.5).y - wallH - roofH); ctx.lineTo(lerp(left, top, 0.5).x, lerp(left, top, 0.5).y - wallH - roofH); ctx.closePath(); ctx.fill(); ctx.stroke();
    // door on the front-left wall (the south side faces down-left)
    var dm = lerp(left, bottom, 0.5);
    var dw = large ? 26 : 18, dh = large ? 56 : 38;
    ctx.fillStyle = '#0c0a14';
    ctx.beginPath();
    ctx.moveTo(dm.x - dw, dm.y - dw / 2); ctx.lineTo(dm.x - dw, dm.y - dw / 2 - dh); ctx.quadraticCurveTo(dm.x, dm.y - dh - dw, dm.x + dw, dm.y + dw / 2 - dh); ctx.lineTo(dm.x + dw, dm.y + dw / 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = large ? '#b48cf0' : '#6e7385'; ctx.lineWidth = 2; ctx.stroke();
    // ornaments
    ctx.fillStyle = '#c9cdd8';
    if (large) {
      // cross on the roof and two urns
      ctx.fillRect(cx - 3, cy - hh * k - wallH - roofH - 34, 6, 30);
      ctx.fillRect(cx - 11, cy - hh * k - wallH - roofH - 26, 22, 6);
      [left, right].forEach(function(p) { ctx.beginPath(); ctx.ellipse(p.x, p.y - wallH - 6, 8, 10, 0, 0, Math.PI * 2); ctx.fill(); });
    } else {
      ctx.fillRect(cx - 2, cy - hh * k - wallH - roofH - 22, 4, 20);
      ctx.fillRect(cx - 7, cy - hh * k - wallH - roofH - 16, 14, 4);
    }
    // ivy
    ctx.fillStyle = 'rgba(50,90,60,0.55)';
    ctx.beginPath(); ctx.ellipse(right.x - 10, right.y - 20, 12, 22, 0.3, 0, Math.PI * 2); ctx.fill();
  }

  function drawBones(ctx) {
    ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(10, 24); ctx.lineTo(40, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, 10); ctx.lineTo(48, 26); ctx.stroke();
    ctx.fillStyle = '#e8e2d0';
    ctx.beginPath(); ctx.arc(52, 16, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2b30';
    ctx.beginPath(); ctx.arc(50, 15, 2, 0, Math.PI * 2); ctx.arc(55, 15, 2, 0, Math.PI * 2); ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------

  /**
   * Register a procedural stand-in for a kit sprite. `draw` paints it, but
   * only when `sprite()` first asks for it and the kit image is not there:
   * with the kit loaded none of the thirty stand-ins is ever painted.
   */
  function fallback(name, key, w, h, baseX, baseY, footprint, extra, draw) {
    var entry = { key: key, w: w, h: h, anchor: { x: baseX / w, y: baseY / h }, footprint: footprint || { w: 1, h: 1 }, procedural: true };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) entry[k] = extra[k];
    entry.make = function(scene) { canvasTexture(scene, key, w, h, draw); };
    fallbacks[name] = entry;
    return entry;
  }

  /**
   * Paint every procedural texture and register the stand-in sprites (idempotent)
   * @param {Object} [opts] - { fog: true } also paints the night sheet and its soft light
   */
  function generate(scene, opts) {
    opts = opts || {};
    // ground on one canvas atlas so the 780 floor tiles batch together
    if (!scene.textures.exists('cem_ground')) {
      var cols = 7;
      var c = document.createElement('canvas');
      c.width = TILE_W * cols; c.height = TILE_H;
      var ctx = c.getContext('2d');
      var names = [];
      for (var g = 0; g < 4; g++) {
        ctx.save(); ctx.translate(g * TILE_W, 0); drawGrass(ctx, g); ctx.restore();
        names.push('grass_' + g);
      }
      for (var p = 0; p < 3; p++) {
        ctx.save(); ctx.translate((4 + p) * TILE_W, 0); drawPath(ctx, p); ctx.restore();
        names.push('path_' + p);
      }
      var tex = scene.textures.addCanvas('cem_ground', c);
      names.forEach(function(n, i) { tex.add(n, 0, i * TILE_W, 0, TILE_W, TILE_H); });
    }
    canvasTexture(scene, 'cem_web', 96, 96, function(ctx) { drawWeb(ctx, 96, false); });
    canvasTexture(scene, 'cem_web_small', 48, 48, function(ctx) { drawWeb(ctx, 48, true); });
    // no moon (it read as a stray disc), so `drawMoon` is not painted
    canvasTexture(scene, 'cem_wisp_glow', 64, 64, function(ctx) { T().drawGlow(ctx, 64, 'rgba(157,245,208,0.7)'); });
    canvasTexture(scene, 'cem_vignette', 512, 512, function(ctx) { drawVignette(ctx, 512); });
    canvasTexture(scene, 'cem_mist', 256, 96, function(ctx) { drawMist(ctx, 256, 96); });
    canvasTexture(scene, 'cem_sparkle', 32, 32, function(ctx) { drawSparkle(ctx, 32); });
    canvasTexture(scene, 'cem_puff', 64, 64, function(ctx) { drawPuff(ctx, 64); });
    canvasTexture(scene, 'cem_door_dark', 56, 76, function(ctx) { drawDoorDark(ctx, 56, 76); });
    canvasTexture(scene, 'cem_lock', 40, 40, function(ctx) { drawLock(ctx, 40); });
    canvasTexture(scene, 'cem_glow_green', 160, 160, function(ctx) { T().drawGlow(ctx, 160, 'rgba(120,255,170,0.4)'); });
    canvasTexture(scene, 'cem_glow_red', 160, 160, function(ctx) { T().drawGlow(ctx, 160, 'rgba(255,70,50,0.55)'); });
    if (opts.fog) {
      // 4 MB of texture that only the moving night uses
      canvasTexture(scene, 'cem_soft_light', 256, 128, function(ctx) { drawSoftLight(ctx, 256, 128); });
      canvasTexture(scene, 'cem_dark_ring', 1024, 1024, function(ctx) { drawDarkRing(ctx, 1024, 160); });
    }
    // the lightning flash over the whole view: a white square, tinted and stretched by the scene
    canvasTexture(scene, 'cem_flash', 8, 8, function(ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 8, 8); });
    // rain: a droplet ring, a streak and a splash drop (the puddles are composited per puddle, see puddleParts)
    canvasTexture(scene, 'cem_drop_ring', 64, 32, function(ctx) { drawDropRing(ctx, 64, 32); });
    canvasTexture(scene, 'cem_plip_ring', 16, 8, function(ctx) { drawPlipRing(ctx, 16, 8); });
    canvasTexture(scene, 'cem_rain_streak', 4, 30, function(ctx) { drawRainStreak(ctx, 4, 30); });
    canvasTexture(scene, 'cem_droplet', 10, 10, function(ctx) { drawDroplet(ctx, 10); });

    // stand-in props: registered here, painted on first use (see `fallback`)
    for (var gv = 0; gv < 6; gv++) {
      (function(v) {
        fallback('grave_' + v, 'cem_fb_grave_' + v, 64, 84, 32, 76, null, null, function(ctx) { drawGrave(ctx, v); });
      })(gv);
    }
    for (var tv = 0; tv < 4; tv++) {
      (function(v) {
        fallback('tree_' + v, 'cem_fb_tree_' + v, 128, 180, 64, 168, null, null, function(ctx) { drawTree(ctx, v); });
      })(tv);
    }
    // fence pieces are anchored on the diamond centre (64, 60)
    fallback('fence_n', 'cem_fb_fence_n', 128, 76, 64, 60, null, null, function(ctx) { drawFenceSegment(ctx, 'n', false); });
    fallback('fence_w', 'cem_fb_fence_w', 128, 76, 64, 60, null, null, function(ctx) { drawFenceSegment(ctx, 'w', false); });
    fallback('gate_n', 'cem_fb_gate_n', 128, 76, 64, 60, null, null, function(ctx) { drawFenceSegment(ctx, 'n', true); });
    fallback('fence_post', 'cem_fb_post', 32, 80, 16, 72, null, null, function(ctx) { drawFencePost(ctx); });
    fallback('lantern_post', 'cem_fb_lantern', 48, 120, 24, 112, null, { light: { x: 0.5, y: 34 / 120 } }, function(ctx) { drawLanternPost(ctx); });
    for (var pv = 0; pv < 3; pv++) {
      (function(v) {
        fallback('pumpkin_' + v, 'cem_fb_pumpkin_' + v, 48, 40, 24, 36, null, null, function(ctx) { drawPumpkin(ctx, v); });
      })(pv);
    }
    fallback('bench', 'cem_fb_bench', 96, 64, 48, 56, null, null, function(ctx) { drawBench(ctx); });
    for (var rv = 0; rv < 2; rv++) {
      (function(v) {
        fallback('rock_' + v, 'cem_fb_rock_' + v, 64, 44, 32, 40, null, null, function(ctx) { drawRock(ctx, v); });
      })(rv);
    }
    for (var sv = 0; sv < 3; sv++) {
      (function(v) {
        fallback('statue_' + v, 'cem_fb_statue_' + v, 64, 132, 32, 124, null, null, function(ctx) { drawStatueProp(ctx, v); });
      })(sv);
    }
    fallback('tomb_small', 'cem_fb_tomb_small', 256, 200, 128, 200 - 64, { w: 2, h: 2 }, { door: { x: 0.5 - 0.43 * 0.5, y: (200 - 64 + 64 * 0.43 * 0.5) / 200 } }, function(ctx) { drawTomb(ctx, false); });
    fallback('tomb_large', 'cem_fb_tomb_large', 384, 290, 192, 290 - 96, { w: 3, h: 3 }, { door: { x: 0.5 - 0.43 * 0.5, y: (290 - 96 + 96 * 0.43 * 0.5) / 290 } }, function(ctx) { drawTomb(ctx, true); });
    fallback('bones', 'cem_fb_bones', 64, 32, 32, 28, null, null, function(ctx) { drawBones(ctx); });
  }

  // ---------------------------------------------------------------------------
  // Kit manifest
  // ---------------------------------------------------------------------------

  /** BootScene preload: queue the manifest (missing file is fine) */
  function loadKit(scene) {
    scene.load.json(KIT_JSON, KIT_DIR + 'cemetery.json');
  }

  /**
   * BootScene create: queue every kit image named in the manifest.
   * @returns {number} Number of images queued
   */
  function queueKitImages(scene) {
    kit = scene.cache.json.exists(KIT_JSON) ? scene.cache.json.get(KIT_JSON) : null;
    if (!kit || !kit.sprites) { kit = null; return 0; }
    var n = 0;
    for (var name in kit.sprites) {
      if (!kit.sprites.hasOwnProperty(name)) continue;
      var s = kit.sprites[name];
      if (!s.file) continue;
      scene.load.image('kit_' + name, KIT_DIR + s.file);
      n++;
    }
    return n;
  }

  /**
   * Best texture for a prop name: the rendered kit sprite when present,
   * otherwise the procedural stand-in. Returns null when neither exists.
   * @returns {Object|null} { key, anchor:{x,y}, footprint:{w,h}, light?, door?, procedural }
   */
  function sprite(scene, name) {
    if (kit && kit.sprites[name] && scene.textures.exists('kit_' + name)) {
      var s = kit.sprites[name];
      return { key: 'kit_' + name, w: s.w, h: s.h, anchor: s.anchor, footprint: s.footprint || { w: 1, h: 1 }, light: s.light || null, door: s.door || null,
        portal: s.portal || null, procedural: false, name: name };
    }
    var fb = fallbacks[name];
    if (fb) {
      if (!scene.textures.exists(fb.key) && fb.make) fb.make(scene);
      if (scene.textures.exists(fb.key)) return fb;
    }
    return null;
  }

  function hasKit() { return !!kit; }

  return {
    makeDoorLights: makeDoorLights,
    TILE_W: TILE_W,
    PUDDLE_W: PUDDLE_W,
    PUDDLE_H: PUDDLE_H,
    puddleParts: puddleParts,
    TILE_H: TILE_H,
    KIT_DIR: KIT_DIR,
    generate: generate,
    loadKit: loadKit,
    queueKitImages: queueKitImages,
    sprite: sprite,
    hasKit: hasKit
  };
})();
