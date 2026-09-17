/**
 * FpTextures
 * Texture sets for the first-person prototype. Stylised CC0 PBR textures
 * (colour + normal maps, assets/proto/fp/, see LICENSE.md there) are used
 * when they load and can be uploaded to WebGL; otherwise stone patterns
 * are drawn procedurally. Also generates the fallback lava, hanging-vine
 * decals and the dragon-gate rune, and turns the extracted monster cutouts
 * (assets/proto/monsters) into billboards.
 */

var FpTextures = (function() {
  var SIZE = 256;
  var DIR = 'assets/proto/fp/';
  // surface -> file stem (colour: <stem>_color.jpg, normal: <stem>_normal.jpg)
  var FILES = {
    wall: 'stone_wall',
    moss: 'mossy_bricks',
    floor: 'flagstone_floor',
    wood: 'wood_planks'
  };

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

  /**
   * Soot plume above a torch: black, alpha fading up and out (128x256)
   */
  function sootCanvas() {
    var c = makeCanvas(128, 256);
    var ctx = c.getContext('2d');
    var rnd = seededRandom(29);
    for (var i = 0; i < 26; i++) {
      var t = i / 25;
      var y = 250 - t * 220;
      var x = 64 + (rnd() - 0.5) * 18 * t;
      var r = 14 + t * 42;
      var g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, 'rgba(8,6,4,' + (0.34 * (1 - t * 0.6)) + ')');
      g.addColorStop(1, 'rgba(8,6,4,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 256);
    }
    return c;
  }

  /**
   * Glowing rune inscriptions: 4 rows of 1024x64 glyph strips (white glyphs
   * with a soft halo on transparent), sampled with per-decal colour tints
   */
  function runeAtlas() {
    var W = 1024, H = 256, ROW = 64;
    var c = makeCanvas(W, H);
    var ctx = c.getContext('2d');
    var rnd = seededRandom(41);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    function glyph(x, y, h) {
      var w = h * (0.45 + rnd() * 0.3);
      ctx.beginPath();
      var kind = Math.floor(rnd() * 6);
      // stave
      if (kind !== 4) { ctx.moveTo(x, y - h / 2); ctx.lineTo(x, y + h / 2); }
      if (kind === 0) { ctx.moveTo(x, y - h / 2); ctx.lineTo(x + w, y - h / 6); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h / 3); }
      if (kind === 1) { ctx.moveTo(x - w / 2, y - h / 3); ctx.lineTo(x + w / 2, y + h / 3); ctx.moveTo(x + w / 2, y - h / 3); ctx.lineTo(x - w / 2, y + h / 3); }
      if (kind === 2) { ctx.moveTo(x, y - h / 2); ctx.lineTo(x + w / 2, y - h / 5); ctx.lineTo(x, y + h / 10); }
      if (kind === 3) { ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x, y - h / 5); ctx.lineTo(x + w / 2, y - h / 2); }
      if (kind === 4) { ctx.moveTo(x + w / 2, y); ctx.arc(x, y, w / 2, 0, Math.PI * 2); ctx.moveTo(x, y - h / 2); ctx.lineTo(x, y + h / 2); }
      if (kind === 5) { ctx.moveTo(x - w / 2, y + h / 2); ctx.lineTo(x, y - h / 2); ctx.lineTo(x + w / 2, y + h / 2); ctx.moveTo(x - w / 4, y + h / 8); ctx.lineTo(x + w / 4, y + h / 8); }
      ctx.stroke();
      if (rnd() < 0.3) { ctx.beginPath(); ctx.arc(x + w * 0.7, y + h / 2 - 3, 2.2, 0, Math.PI * 2); ctx.fill(); }
      return w;
    }
    for (var row = 0; row < 4; row++) {
      var cy = row * ROW + ROW / 2;
      for (var pass = 0; pass < 2; pass++) {
        rnd = seededRandom(41 + row * 7);
        ctx.strokeStyle = pass ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = pass ? 3.2 : 9;
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = pass ? 6 : 14;
        var x = 26;
        while (x < W - 40) {
          x += glyph(x, cy, 40) + 18 + rnd() * 12;
          if (rnd() < 0.12) x += 22;
        }
      }
    }
    ctx.shadowBlur = 0;
    return c;
  }

  /**
   * Wall crack with a wet stain (256x512): transparent, dark jagged lines
   * branching down, damp darkening below
   */
  function crackCanvas() {
    var c = makeCanvas(256, 512);
    var ctx = c.getContext('2d');
    var rnd = seededRandom(53);
    var g = ctx.createLinearGradient(0, 120, 0, 512);
    g.addColorStop(0, 'rgba(10,14,18,0)');
    g.addColorStop(0.25, 'rgba(10,14,18,0.35)');
    g.addColorStop(1, 'rgba(10,14,18,0.5)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(128, 330, 70, 190, 0, 0, Math.PI * 2);
    ctx.fill();
    function crack(x, y, len, w, depth) {
      ctx.lineWidth = w;
      ctx.strokeStyle = 'rgba(12,8,6,0.95)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (var i = 0; i < len; i++) {
        x += (rnd() - 0.5) * 22;
        y += 10 + rnd() * 8;
        ctx.lineTo(x, y);
        if (depth < 2 && rnd() < 0.18) {
          ctx.stroke();
          crack(x, y, Math.floor(len / 3), w * 0.55, depth + 1);
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
      }
      ctx.stroke();
    }
    crack(128, 30, 16, 10, 0);
    crack(116, 24, 6, 6, 1);
    return c;
  }

  /** Tileable ripple normal map (256x256) for puddles */
  function rippleNormalCanvas() {
    var S = 256;
    var c = makeCanvas(S, S);
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(S, S);
    var TAU = Math.PI * 2;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var u = x / S, v = y / S;
        var dx = 0.5 * Math.cos(TAU * (3 * u + 2 * v)) * 3 + 0.4 * Math.cos(TAU * (-2 * u + 5 * v)) * -2 + 0.3 * Math.cos(TAU * (7 * u - v)) * 7;
        var dy = 0.5 * Math.cos(TAU * (3 * u + 2 * v)) * 2 + 0.4 * Math.cos(TAU * (-2 * u + 5 * v)) * 5 + 0.3 * Math.cos(TAU * (7 * u - v)) * -1;
        var nx = -dx * 0.03, ny = -dy * 0.03, nz = 1;
        var l = Math.sqrt(nx * nx + ny * ny + nz * nz);
        var i = (y * S + x) * 4;
        img.data[i] = (nx / l * 0.5 + 0.5) * 255;
        img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255;
        img.data[i + 2] = (nz / l * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  /** Dim equirectangular reflection of a torch-lit vault (256x128) */
  function envCanvas() {
    var c = makeCanvas(256, 128);
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, '#2a2018');
    g.addColorStop(0.5, '#4a3524');
    g.addColorStop(1, '#0c0908');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    for (var i = 0; i < 4; i++) {
      var x = 32 + i * 64, y = 50;
      var r = ctx.createRadialGradient(x, y, 1, x, y, 22);
      r.addColorStop(0, 'rgba(255,220,150,1)');
      r.addColorStop(0.3, 'rgba(255,150,60,0.6)');
      r.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = r;
      ctx.fillRect(x - 22, y - 22, 44, 44);
    }
    return c;
  }

  /** Horizontal glow falloff (u = 0 hot edge, u = 1 transparent) for lava banks */
  function glowCanvas() {
    var c = makeCanvas(64, 4);
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, 'rgba(255,150,40,1)');
    g.addColorStop(0.35, 'rgba(230,80,15,0.55)');
    g.addColorStop(1, 'rgba(120,20,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 4);
    return c;
  }

  var decalCache = null;

  function decalTextures() {
    if (decalCache) return decalCache;
    var ripple = new THREE.CanvasTexture(rippleNormalCanvas());
    ripple.wrapS = ripple.wrapT = THREE.RepeatWrapping;
    var env = new THREE.CanvasTexture(envCanvas());
    env.mapping = THREE.EquirectangularReflectionMapping;
    env.colorSpace = THREE.SRGBColorSpace;
    var runes = clampTexture(runeAtlas());
    runes.generateMipmaps = true;
    runes.minFilter = THREE.LinearMipmapLinearFilter;
    decalCache = {
      soot: clampTexture(sootCanvas()),
      runes: runes,
      crack: clampTexture(crackCanvas()),
      ripple: ripple,
      env: env,
      glow: clampTexture(glowCanvas())
    };
    return decalCache;
  }

  function proceduralWood() {
    var c = makeCanvas(SIZE, SIZE);
    var ctx = c.getContext('2d');
    var rnd = seededRandom(17);
    ctx.fillStyle = '#6b4424';
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (var i = 0; i < 60; i++) {
      ctx.strokeStyle = 'rgba(' + (40 + Math.round(rnd() * 40)) + ',' + (24 + Math.round(rnd() * 20)) + ',10,0.5)';
      ctx.lineWidth = 1 + rnd() * 3;
      var y = rnd() * SIZE;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(SIZE * 0.3, y + (rnd() - 0.5) * 12, SIZE * 0.6, y + (rnd() - 0.5) * 12, SIZE, y);
      ctx.stroke();
    }
    return c;
  }

  // ---------------------------------------------------------------------------
  // Files
  // ---------------------------------------------------------------------------
  function repeatTexture(tex, color) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * Image as a repeating texture, or null when missing or not uploadable
   * (tainted on file://)
   */
  function fileTexture(url, color) {
    return loadImage(url).then(function(img) {
      if (!img) return null;
      var probe = makeCanvas(1, 1);
      probe.getContext('2d').drawImage(img, 0, 0, 1, 1);
      if (!canvasUsable(probe)) return null;
      return repeatTexture(new THREE.Texture(img), color);
    });
  }

  function surface(map, normalMap) {
    return { map: map, normalMap: normalMap || null };
  }

  function proceduralSet() {
    var wallC = proceduralWall();
    return {
      wall: surface(tileTexture(wallC)),
      moss: surface(tileTexture(mossify(wallC, 21))),
      floor: surface(tileTexture(proceduralFloor())),
      ceiling: surface(tileTexture(proceduralCeiling())),
      wood: surface(tileTexture(proceduralWood())),
      lava: tileTexture(lavaCanvas()),
      vine: clampTexture(vineCanvas(3)),
      rune: clampTexture(runeCanvas()),
      decals: decalTextures(),
      source: 'procedural'
    };
  }

  /**
   * Resolve all textures: CC0 files per surface, procedural where a file fails
   * @returns {Promise<Object>} { wall, moss, floor, ceiling, wood: {map, normalMap}, lava, vine, rune, source }
   */
  function load() {
    var keys = Object.keys(FILES);
    var jobs = [];
    keys.forEach(function(k) {
      jobs.push(fileTexture(DIR + FILES[k] + '_color.jpg', true));
      jobs.push(fileTexture(DIR + FILES[k] + '_normal.jpg', false));
    });
    jobs.push(fileTexture(DIR + 'lava_color.jpg', true));
    return Promise.all(jobs).then(function(res) {
      var set = proceduralSet();
      var files = 0;
      keys.forEach(function(k, i) {
        var map = res[i * 2], normal = res[i * 2 + 1];
        if (map) {
          set[k] = surface(map, normal);
          files++;
        }
      });
      // the vault reuses the plain stone wall set (tinted darker by the material)
      if (res[0]) set.ceiling = surface(res[0], res[1]);
      var lava = res[keys.length * 2];
      if (lava) { set.lava = lava; files++; }
      set.source = files === keys.length + 1 ? 'file' : (files ? 'mixed' : 'procedural');
      return set;
    });
  }

  /**
   * Procedural textures only (synchronous), used until load() resolves
   */
  function procedural() {
    return proceduralSet();
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
