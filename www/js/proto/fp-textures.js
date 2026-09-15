/**
 * FpTextures
 * Builds three.js textures for the first-person prototype without shipping
 * any new art: real files from assets/proto/ are used when present, otherwise
 * regions of the existing corridor illustrations are cropped and tiled, and
 * as a last resort simple stone patterns are drawn procedurally.
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
    // Speckle
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var i = 0; i < 300; i++) {
      ctx.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 2, 2);
    }
  }

  function proceduralWall() {
    var c = makeCanvas(SIZE, SIZE);
    drawStoneBlocks(c.getContext('2d'), SIZE, SIZE, [96, 100, 118], '#2a2c38', 6, 7, true);
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

  function proceduralGate(wallCanvas) {
    var c = makeCanvas(SIZE, SIZE);
    var ctx = c.getContext('2d');
    ctx.drawImage(wallCanvas, 0, 0, SIZE, SIZE);
    // Dark archway with a glowing purple rim (boss colour)
    ctx.fillStyle = '#07060c';
    ctx.beginPath();
    ctx.moveTo(48, SIZE);
    ctx.lineTo(48, 110);
    ctx.arc(SIZE / 2, 110, 80, Math.PI, 0);
    ctx.lineTo(SIZE - 48, SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#9c27b0';
    ctx.shadowColor = '#c46bd9';
    ctx.shadowBlur = 18;
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
    // Mirror-tile 2x2 so the repeat has no visible seam
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

  /**
   * Resolve wall/floor/ceiling/gate textures
   * @returns {Promise<Object>} { wall, floor, ceiling, gate } as THREE.CanvasTexture
   */
  function load() {
    var wallC = proceduralWall();
    var floorC = proceduralFloor();
    var ceilC = proceduralCeiling();

    return Promise.all([
      fileOrNull('assets/proto/wall.png'),
      fileOrNull('assets/proto/floor.png'),
      fileOrNull('assets/proto/ceiling.png'),
      fileOrNull('assets/proto/gate_dragon.png'),
      loadImage(SEED_IMAGE)
    ]).then(function(res) {
      var seed = res[4];
      var wallFromSeed = seed ? cropTiled(seed, WALL_CROP, 0) : null;
      var floorFromSeed = seed ? cropTiled(seed, FLOOR_CROP, 0.15) : null;
      var ceilFromSeed = seed ? cropTiled(seed, WALL_CROP, 0.45) : null;

      wallC = res[0] || wallFromSeed || wallC;
      floorC = res[1] || floorFromSeed || floorC;
      ceilC = res[2] || ceilFromSeed || ceilC;
      var gateC = res[3] || proceduralGate(wallC);

      return {
        wall: tileTexture(wallC),
        floor: tileTexture(floorC),
        ceiling: tileTexture(ceilC),
        gate: tileTexture(gateC),
        source: res[0] ? 'file' : (wallFromSeed ? 'seed' : 'procedural')
      };
    });
  }

  /**
   * Procedural textures only (synchronous), used until load() resolves
   */
  function procedural() {
    var wallC = proceduralWall();
    return {
      wall: tileTexture(wallC),
      floor: tileTexture(proceduralFloor()),
      ceiling: tileTexture(proceduralCeiling()),
      gate: tileTexture(proceduralGate(wallC)),
      source: 'procedural'
    };
  }

  // ---------------------------------------------------------------------------
  // Billboards (monsters, treasure) from the existing 800x436 illustrations
  // ---------------------------------------------------------------------------
  function placeholderBillboard(label) {
    var c = makeCanvas(512, 256);
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(256, 128, 20, 256, 128, 200);
    g.addColorStop(0, 'rgba(120, 60, 160, 0.9)');
    g.addColorStop(1, 'rgba(120, 60, 160, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((label || '?').charAt(0).toUpperCase(), 256, 128);
    return c;
  }

  function maskedBillboard(img, cutout) {
    var c = makeCanvas(512, 256);
    var ctx = c.getContext('2d');
    var w = 512;
    var h = Math.round(512 * img.height / img.width);
    ctx.drawImage(img, 0, Math.round((256 - h) / 2), w, h);
    if (!cutout) {
      // Soft elliptical mask hides the rectangular illustration edges
      var g = ctx.createRadialGradient(256, 128, 40, 256, 128, 250);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.62, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 256);
      ctx.globalCompositeOperation = 'source-over';
    }
    return canvasUsable(c) ? c : null;
  }

  function spriteTexture(canvas) {
    var tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Billboard texture for a monster/treasure id
   * @param {string} imageId - e.g. 'goblin', 'dragon', 'treasure'
   * @returns {Promise<THREE.Texture>}
   */
  function billboard(imageId) {
    if (billboardCache[imageId]) return billboardCache[imageId];
    billboardCache[imageId] = loadImage('assets/proto/monsters/' + imageId + '.png').then(function(cut) {
      if (cut) {
        var cc = maskedBillboard(cut, true);
        if (cc) return cc;
      }
      return loadImage('assets/' + imageId + '.png').then(function(img) {
        var c = img ? maskedBillboard(img, false) : null;
        return c || placeholderBillboard(imageId);
      });
    }).then(function(canvas) {
      return spriteTexture(canvas);
    });
    return billboardCache[imageId];
  }

  function disposeBillboard(imageId) {
    var p = billboardCache[imageId];
    if (!p) return;
    delete billboardCache[imageId];
    p.then(function(tex) { tex.dispose(); });
  }

  return {
    load: load,
    procedural: procedural,
    billboard: billboard,
    disposeBillboard: disposeBillboard,
    SIZE: SIZE
  };
})();
