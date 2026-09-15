/**
 * FpTextures
 * Builds three.js textures for the first-person prototype without shipping
 * new art: real files from assets/proto/ are used when present, otherwise
 * regions of the existing corridor illustration are cropped and tiled, and
 * as a last resort stone patterns are drawn procedurally. Also generates
 * the animated lava, torch flame atlas and hanging-vine decals, and turns
 * the extracted monster cutouts (assets/proto/monsters) into billboards.
 */

var FpTextures = (function() {
  var SIZE = 256;
  var SEED_IMAGE = 'assets/directions/n_s.png';
  // Crop regions of the 800x427 seed illustration (wall face right of the arch, floor band)
  var WALL_CROP = { x: 470, y: 120, w: 300, h: 210 };
  var FLOOR_CROP = { x: 250, y: 370, w: 300, h: 60 };

  var billboardCache = {};

  function loadImage(url) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() { resolve(img); };
      img.onerror = function() { resolve(null); };
      img.src = url;
    });
  }

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  /**
   * True when pixels can be read back (false for tainted canvases on file://)
   */
  function canvasUsable(canvas) {
    try {
      canvas.getContext('2d').getImageData(0, 0, 1, 1);
      return true;
    } catch (e) {
      return false;
    }
  }

  function tileTexture(canvas) {
    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  function clampTexture(canvas) {
    var tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ---------------------------------------------------------------------------
  // Procedural fallbacks
  // ---------------------------------------------------------------------------
  function seededRandom(seed) {
    var s = seed;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function drawStoneBlocks(ctx, w, h, base, mortar, rows, seed, mossy) {
    var rnd = seededRandom(seed);
    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, w, h);
    var rowH = h / rows;
    for (var r = 0; r < rows; r++) {
      var cols = 3;
      var colW = w / cols;
      var offset = (r % 2) * colW / 2;
      for (var c = -1; c <= cols; c++) {
        var x = c * colW + offset + 2;
        var y = r * rowH + 2;
        var shade = Math.round((rnd() - 0.5) * 30);
        ctx.fillStyle = 'rgb(' + (base[0] + shade) + ',' + (base[1] + shade) + ',' + (base[2] + shade) + ')';
        ctx.fillRect(x, y, colW - 4, rowH - 4);
        if (mossy && rnd() < 0.3) {
          ctx.fillStyle = 'rgba(70, 110, 60, 0.45)';
          ctx.fillRect(x + colW * 0.2, y + rowH * 0.5, colW * 0.5, rowH * 0.4);
        }
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var i = 0; i < 300; i++) {
      ctx.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 2, 2);
    }
  }

  function proceduralWall() {
    var c = makeCanvas(SIZE, SIZE);
    drawStoneBlocks(c.getContext('2d'), SIZE, SIZE, [96, 100, 118], '#2a2c38', 6, 7, false);
    return c;
  }

  function proceduralFloor() {
    var c = makeCanvas(SIZE, SIZE);
    drawStoneBlocks(c.getContext('2d'), SIZE, SIZE, [70, 72, 86], '#1f2029', 4, 13, false);
    return c;
  }

  function proceduralCeiling() {
    var c = makeCanvas(SIZE, SIZE);
    drawStoneBlocks(c.getContext('2d'), SIZE, SIZE, [50, 52, 64], '#161720', 5, 3, false);
    return c;
  }

  /**
   * Green moss patches and drips over a wall canvas
   */
  function mossify(src, seed) {
    var c = makeCanvas(SIZE, SIZE);
    var ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0, SIZE, SIZE);
    var rnd = seededRandom(seed || 21);
    for (var i = 0; i < 26; i++) {
      var x = rnd() * SIZE, y = rnd() * SIZE, r = 10 + rnd() * 30;
      var g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, 'rgba(74, 118, 58, 0.55)');
      g.addColorStop(1, 'rgba(50, 90, 40, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (i = 0; i < 12; i++) {
      var dx = rnd() * SIZE;
      ctx.strokeStyle = 'rgba(40, 70, 35, 0.5)';
      ctx.lineWidth = 2 + rnd() * 3;
      ctx.beginPath();
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx + (rnd() - 0.5) * 20, 40 + rnd() * 120);
      ctx.stroke();
    }
    return c;
  }

  /**
   * Smooth value noise (2 octaves) used by the lava texture
   */
  function valueNoise(w, h, seed, scale) {
    var rnd = seededRandom(seed);
    var gw = Math.ceil(w / scale) + 2, gh = Math.ceil(h / scale) + 2;
    var grid = [];
    for (var i = 0; i < gw * gh; i++) grid.push(rnd());
    function smooth(t) { return t * t * (3 - 2 * t); }
    return function(x, y) {
      var gx = x / scale, gy = y / scale;
      var x0 = Math.floor(gx), y0 = Math.floor(gy);
      var tx = smooth(gx - x0), ty = smooth(gy - y0);
      var a = grid[(y0 % gh) * gw + (x0 % gw)];
      var b = grid[(y0 % gh) * gw + ((x0 + 1) % gw)];
      var c = grid[((y0 + 1) % gh) * gw + (x0 % gw)];
      var d = grid[((y0 + 1) % gh) * gw + ((x0 + 1) % gw)];
      return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
    };
  }

  /**
   * Tileable molten-rock texture: dark crust with bright cracks
   */
  function lavaCanvas() {
    var c = makeCanvas(SIZE, SIZE);
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(SIZE, SIZE);
    var n1 = valueNoise(SIZE, SIZE, 5, 32), n2 = valueNoise(SIZE, SIZE, 9, 12);
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        // wrap-friendly blend
        var v = 0.65 * n1(x, y) + 0.35 * n2(x, y);
        var crack = Math.pow(Math.max(0, 1 - Math.abs(v - 0.5) * 5), 2);
        var glow = Math.max(0, v - 0.55) * 2.2;
        var heat = Math.min(1, crack + glow);
        var r = 60 + 195 * heat;
        var g = 12 + 120 * heat * heat;
        var b = 4 + 30 * Math.pow(heat, 4);
        var i = (y * SIZE + x) * 4;
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  /**
   * 4-frame flame atlas (256x64), each frame a wobbling teardrop
   */
  function flameAtlas() {
    var c = makeCanvas(256, 64);
    var ctx = c.getContext('2d');
    for (var f = 0; f < 4; f++) {
      var ox = f * 64 + 32;
      var wob = (f % 2 ? 1 : -1) * 3;
      var g = ctx.createRadialGradient(ox, 40, 2, ox, 36, 22);
      g.addColorStop(0, 'rgba(255, 250, 200, 1)');
      g.addColorStop(0.3, 'rgba(255, 200, 60, 0.95)');
      g.addColorStop(0.65, 'rgba(255, 110, 20, 0.6)');
      g.addColorStop(1, 'rgba(200, 40, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ox, 6 + (f === 2 ? 4 : 0));
      ctx.quadraticCurveTo(ox + 18 + wob, 30, ox, 60);
      ctx.quadraticCurveTo(ox - 18 - wob, 30, ox, 6 + (f === 2 ? 4 : 0));
      ctx.fill();
    }
    return c;
  }

  /**
   * Hanging roots/vines on a transparent 128x256 canvas
   */
  function vineCanvas(seed) {
    var c = makeCanvas(128, 256);
    var ctx = c.getContext('2d');
    var rnd = seededRandom(seed || 3);
    for (var s = 0; s < 6; s++) {
      var x = 10 + rnd() * 108;
      var len = 70 + rnd() * 170;
      ctx.strokeStyle = 'rgba(' + (34 + Math.round(rnd() * 24)) + ',' + (58 + Math.round(rnd() * 34)) + ',30,0.85)';
      ctx.lineWidth = 1.2 + rnd() * 1.8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      var cx = x + (rnd() - 0.5) * 60;
      ctx.quadraticCurveTo(cx, len * 0.5, x + (rnd() - 0.5) * 40, len);
      ctx.stroke();
      for (var l = 0; l < 3; l++) {
        var ly = rnd() * len;
        ctx.fillStyle = 'rgba(52, 104, 44, 0.8)';
        ctx.beginPath();
        ctx.ellipse(x + (rnd() - 0.5) * 12, ly, 3.5, 2, rnd() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return c;
  }

  /**
   * Purple rune glow for the dragon gate
   */
  function runeCanvas() {
    var c = makeCanvas(128, 128);
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    g.addColorStop(0, 'rgba(240, 190, 255, 1)');
    g.addColorStop(0.35, 'rgba(180, 80, 220, 0.85)');
    g.addColorStop(1, 'rgba(120, 30, 170, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(255, 230, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 64, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(64, 40); ctx.lineTo(84, 76); ctx.lineTo(44, 76); ctx.closePath();
    ctx.stroke();
    return c;
  }

  // ---------------------------------------------------------------------------
  // Crops of the existing corridor art
  // ---------------------------------------------------------------------------
  function cropTiled(img, crop, darken) {
    var c = makeCanvas(SIZE, SIZE);
    var ctx = c.getContext('2d');
    var half = SIZE / 2;
    for (var ty = 0; ty < 2; ty++) {
      for (var tx = 0; tx < 2; tx++) {
        ctx.save();
        ctx.translate(tx * half + (tx ? half : 0), ty * half + (ty ? half : 0));
        ctx.scale(tx ? -1 : 1, ty ? -1 : 1);
        ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, half, half);
        ctx.restore();
      }
    }
    if (darken) {
      ctx.fillStyle = 'rgba(0,0,0,' + darken + ')';
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
    return canvasUsable(c) ? c : null;
  }

  function fileOrNull(url) {
    return loadImage(url).then(function(img) {
      if (!img) return null;
      var c = makeCanvas(SIZE, SIZE);
      c.getContext('2d').drawImage(img, 0, 0, SIZE, SIZE);
      return canvasUsable(c) ? c : null;
    });
  }

  function assemble(wallC, floorC, ceilC, source) {
    var lava = tileTexture(lavaCanvas());
    return {
      wall: tileTexture(wallC),
      wallMoss: tileTexture(mossify(wallC, 21)),
      floor: tileTexture(floorC),
      ceiling: tileTexture(ceilC),
      lava: lava,
      flame: clampTexture(flameAtlas()),
      vine: clampTexture(vineCanvas(3)),
      rune: clampTexture(runeCanvas()),
      source: source
    };
  }

  /**
   * Resolve all textures (real files > seed crops > procedural)
   * @returns {Promise<Object>}
   */
  function load() {
    return Promise.all([
      fileOrNull('assets/proto/wall.png'),
      fileOrNull('assets/proto/floor.png'),
      fileOrNull('assets/proto/ceiling.png'),
      loadImage(SEED_IMAGE)
    ]).then(function(res) {
      var seed = res[3];
      var wallFromSeed = seed ? cropTiled(seed, WALL_CROP, 0) : null;
      var floorFromSeed = seed ? cropTiled(seed, FLOOR_CROP, 0.15) : null;
      var ceilFromSeed = seed ? cropTiled(seed, WALL_CROP, 0.5) : null;
      var wallC = res[0] || wallFromSeed || proceduralWall();
      var floorC = res[1] || floorFromSeed || proceduralFloor();
      var ceilC = res[2] || ceilFromSeed || proceduralCeiling();
      return assemble(wallC, floorC, ceilC, res[0] ? 'file' : (wallFromSeed ? 'seed' : 'procedural'));
    });
  }

  /**
   * Procedural textures only (synchronous), used until load() resolves
   */
  function procedural() {
    return assemble(proceduralWall(), proceduralFloor(), proceduralCeiling(), 'procedural');
  }

  // ---------------------------------------------------------------------------
  // Billboards (monsters, treasure)
  // ---------------------------------------------------------------------------
  function placeholderBillboard(label) {
    var c = makeCanvas(256, 256);
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    g.addColorStop(0, 'rgba(120, 60, 160, 0.9)');
    g.addColorStop(1, 'rgba(120, 60, 160, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((label || '?').charAt(0).toUpperCase(), 128, 128);
    return c;
  }

  /**
   * Draw an image into a canvas no larger than 512 on the long edge.
   * Cutouts keep their alpha; full illustrations get a soft elliptical mask.
   */
  function billboardCanvas(img, cutout) {
    var scale = Math.min(1, 512 / Math.max(img.width, img.height));
    var w = Math.max(2, Math.round(img.width * scale));
    var h = Math.max(2, Math.round(img.height * scale));
    var c = makeCanvas(w, h);
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    if (!cutout) {
      var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.5);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    return canvasUsable(c) ? c : null;
  }

  /**
   * Billboard for a monster/treasure id
   * @returns {Promise<{texture: THREE.Texture, aspect: number}>} aspect = width / height
   */
  function billboard(imageId) {
    if (billboardCache[imageId]) return billboardCache[imageId];
    var cutoutUrl = (typeof ProtoHud !== 'undefined' && ProtoHud.spriteUrl && ProtoHud.spriteUrl(imageId))
      || ('assets/proto/monsters/' + imageId + '.png');
    billboardCache[imageId] = loadImage(cutoutUrl).then(function(cut) {
      if (cut) {
        var cc = billboardCanvas(cut, true);
        if (cc) return cc;
      }
      return loadImage('assets/' + imageId + '.png').then(function(img) {
        var c = img ? billboardCanvas(img, false) : null;
        return c || placeholderBillboard(imageId);
      });
    }).then(function(canvas) {
      return { texture: clampTexture(canvas), aspect: canvas.width / canvas.height };
    });
    return billboardCache[imageId];
  }

  function disposeBillboard(imageId) {
    var p = billboardCache[imageId];
    if (!p) return;
    delete billboardCache[imageId];
    p.then(function(b) { b.texture.dispose(); });
  }

  return {
    load: load,
    procedural: procedural,
    billboard: billboard,
    disposeBillboard: disposeBillboard,
    SIZE: SIZE
  };
})();
