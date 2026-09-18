/**
 * IsoTextures
 * Procedural dungeon art for the isometric prototype, painted on canvases at
 * boot: mossy flagstone floors, stone walls with vines and cracks, arched
 * doorways, torches with animated flames, lava, pillars, bones, gold, crystals,
 * banners, stairs, chests, and chamber decor (water/lava pools, mushrooms,
 * ferns, owl statues, cave-ins, broken floors). Colours are sampled from the original illustrations
 * (assets/directions/*.png) so the tiles match the painted scenes.
 * Real art from assets/proto/iso/ replaces any key that already exists.
 * Also builds the owl walk cycle and standing monster sprites from the
 * extracted cutouts in assets/proto/monsters/.
 */

var IsoTextures = (function() {
  var TILE_W = 128;
  var TILE_H = 64;
  var WALL_H = 64;

  var FALLBACK_PALETTE = {
    floor: '#5a5b66',
    floorDark: '#454650',
    floorLight: '#6b6c78',
    wall: '#6f6b78',
    wallDark: '#514d5a',
    edge: '#26262f',
    moss: '#5f7d3c',
    mossDark: '#3f5a29'
  };

  // Stone colours for procedural decor drawn next to the (tinted) Kenney sandstone
  var KENNEY_STONE_PALETTE = {
    floor: '#b3aa9c',
    floorDark: '#877f73',
    floorLight: '#cfc6b6',
    wall: '#a79e90',
    wallDark: '#766e63',
    edge: '#3e3830',
    moss: '#6f8f45',
    mossDark: '#4a6630'
  };

  // Optional real art files (key -> filename under assets/proto/iso/)
  var OPTIONAL_FILES = {
    floor_0: 'floor_0.png', floor_1: 'floor_1.png', floor_2: 'floor_2.png',
    corridor: 'corridor.png',
    wall_n_0: 'wall_n.png', wall_w_0: 'wall_w.png',
    arch_n: 'arch_n.png', arch_w: 'arch_w.png',
    rim_s: 'rim_s.png', rim_e: 'rim_e.png',
    entrance: 'entrance.png', portal: 'portal.png',
    marker_unknown: 'marker_unknown.png',
    treasure_chest: 'treasure_chest.png', treasure_open: 'treasure_open.png',
    highlight_ring: 'highlight_ring.png', reach_ring: 'reach_ring.png',
    pillar: 'pillar.png', banner: 'banner.png', crystal: 'crystal.png',
    gold_pile: 'gold_pile.png', bones: 'bones.png', rubble: 'rubble.png'
  };

  /**
   * Kenney "Isometric Miniature Dungeon" (CC0) tiles under assets/proto/iso/kenney/.
   * Every image is a 256x512 canvas (stored here at 128x256) whose floor
   * diamond is centred at (128, 427) -> origin (0.5, 0.834). Kenney names wall
   * pieces by the direction they face, so our n/w/s/e edges map to _S/_E/_N/_W.
   */
  var KENNEY_DIR = 'assets/proto/iso/kenney/';
  var KENNEY_ORIGIN = { x: 0.5, y: 427 / 512 };
  var KENNEY_FILES = {
    k_floor_0: 'stone_E', k_floor_1: 'stoneTile_E', k_floor_2: 'stoneUneven_E', k_floor_3: 'stoneMissingTiles_E',
    k_corridor: 'dirt_E', k_corridor_1: 'dirtTiles_E',
    k_wall_n_0: 'stoneWall_S', k_wall_n_1: 'stoneWallAged_S', k_wall_n_2: 'stoneWallBroken_S',
    k_wall_w_0: 'stoneWall_E', k_wall_w_1: 'stoneWallAged_E', k_wall_w_2: 'stoneWallBroken_E',
    k_arch_n: 'stoneWallArchway_S', k_arch_w: 'stoneWallArchway_E',
    k_gate_n: 'stoneWallGate_S',
    k_rim_n: 'stoneWallHalf_S', k_rim_w: 'stoneWallHalf_E', k_rim_s: 'stoneWallHalf_N', k_rim_e: 'stoneWallHalf_W',
    k_stairs: 'stairs_S', k_chest: 'chestClosed_E', k_chest_open: 'chestOpen_E',
    k_barrel: 'barrel_E', k_barrels: 'barrels_E', k_crate: 'woodenCrate_E', k_crates: 'woodenCrates_E',
    k_column: 'stoneColumn_E',
    // chamber decor (optional; procedural stand-ins are used when missing)
    k_supports: 'woodenSupportsBeam_E',
    k_table_broken: 'tableChairsBroken_E', k_barrels_stacked: 'barrelsStacked_E',
    k_wall_hole_n: 'stoneWallHole_S', k_wall_hole_w: 'stoneWallHole_E'
  };
  // Keys that must all be present for the scene to switch to the Kenney set
  var KENNEY_REQUIRED = ['k_floor_0', 'k_floor_1', 'k_floor_2', 'k_corridor', 'k_wall_n_0', 'k_wall_w_0',
    'k_arch_n', 'k_arch_w', 'k_rim_n', 'k_rim_w', 'k_rim_s', 'k_rim_e', 'k_stairs', 'k_chest', 'k_chest_open'];

  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
  function rgb(r, g, b) { return 'rgb(' + clamp(r) + ',' + clamp(g) + ',' + clamp(b) + ')'; }
  function rgba(r, g, b, a) { return 'rgba(' + clamp(r) + ',' + clamp(g) + ',' + clamp(b) + ',' + a + ')'; }

  // Deterministic pseudo random for repeatable texture variants
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /**
   * Average colours of horizontal bands of an illustration (wall band, floor band).
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
      var wall = avg(3, 10);
      var floor = avg(12, 16);
      return {
        floor: rgb(floor[0] * 1.05, floor[1] * 1.05, floor[2] * 1.05),
        floorDark: rgb(floor[0] * 0.78, floor[1] * 0.78, floor[2] * 0.8),
        floorLight: rgb(floor[0] * 1.22 + 10, floor[1] * 1.22 + 10, floor[2] * 1.22 + 10),
        wall: rgb(wall[0] * 1.1, wall[1] * 1.1, wall[2] * 1.15),
        wallDark: rgb(wall[0] * 0.72, wall[1] * 0.72, wall[2] * 0.78),
        edge: rgb(floor[0] * 0.4, floor[1] * 0.4, floor[2] * 0.45),
        moss: FALLBACK_PALETTE.moss,
        mossDark: FALLBACK_PALETTE.mossDark
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

  // ---------------------------------------------------------------------------
  // Floors
  // ---------------------------------------------------------------------------

  function drawFlagstones(ctx, palette, seed) {
    var r = rng(seed);
    // irregular slabs: split the diamond with a few jittered lines
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.55;
    for (var i = 0; i < 3; i++) {
      var t = 0.25 + i * 0.25 + (r() - 0.5) * 0.12;
      ctx.beginPath();
      ctx.moveTo(64 - 64 * t, 32 - 32 * t + 64 * t * 0.5 - 16 * (r() - 0.5));
      ctx.lineTo(64 + 64 * (1 - t), 32 + 32 * (1 - t) - 64 * (1 - t) * 0.5 + 10 * (r() - 0.5));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(64 + 64 * t, 32 - 32 * t + 64 * t * 0.5);
      ctx.lineTo(64 - 64 * (1 - t), 32 + 32 * (1 - t) - 64 * (1 - t) * 0.5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawMossPatch(ctx, palette, x, y, w, h, alpha) {
    var g = ctx.createRadialGradient(x, y, 1, x, y, Math.max(w, h));
    g.addColorStop(0, palette.moss);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawFloor(ctx, palette, variant) {
    var base = variant === 1 ? palette.floorLight : palette.floor;
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.fillStyle = base;
    ctx.fill();
    ctx.save();
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.clip();
    // subtle top-left light
    var lg = ctx.createLinearGradient(20, 0, 110, 64);
    lg.addColorStop(0, 'rgba(255,255,255,0.09)');
    lg.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, 128, 64);
    drawFlagstones(ctx, palette, 11 + variant * 31);
    var r = rng(77 + variant);
    if (variant === 0) {
      drawMossPatch(ctx, palette, 30 + r() * 20, 30 + r() * 10, 16, 8, 0.55);
    } else if (variant === 2) {
      // puddle
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#5b7f99';
      ctx.beginPath(); ctx.ellipse(74, 36, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.ellipse(70, 34, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      drawMossPatch(ctx, palette, 40, 22, 10, 5, 0.4);
    } else {
      // crack
      ctx.strokeStyle = palette.edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 40); ctx.lineTo(58, 30); ctx.lineTo(66, 34); ctx.lineTo(84, 22);
      ctx.stroke();
      drawMossPatch(ctx, palette, 96, 34, 12, 6, 0.45);
    }
    // pebbles
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (var i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(24 + r() * 80, 12 + r() * 40, 1 + r() * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawCorridor(ctx, palette) {
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.fillStyle = palette.floorDark;
    ctx.fill();
    ctx.save();
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.clip();
    var r = rng(5);
    // cobbles
    for (var i = 0; i < 26; i++) {
      var x = 10 + r() * 108, y = 6 + r() * 52;
      ctx.fillStyle = (i % 3 === 0) ? palette.floor : palette.floorDark;
      ctx.strokeStyle = palette.edge;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, 7 + r() * 4, 4 + r() * 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    var lg = ctx.createLinearGradient(0, 0, 0, 64);
    lg.addColorStop(0, 'rgba(0,0,0,0.35)');
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, 128, 64);
    ctx.restore();
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawLava(ctx, frame) {
    diamondPath(ctx, 64, 32, 63, 31);
    var g = ctx.createRadialGradient(64, 32, 4, 64, 32, 64);
    g.addColorStop(0, '#ffb347');
    g.addColorStop(0.5, '#ff6a1a');
    g.addColorStop(1, '#8a1a05');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    diamondPath(ctx, 64, 32, 63, 31);
    ctx.clip();
    // dark crust islands drifting per frame
    var r = rng(900 + frame);
    ctx.fillStyle = 'rgba(60,10,0,0.75)';
    for (var i = 0; i < 6; i++) {
      var x = 16 + r() * 96 + frame * 6, y = 8 + r() * 48;
      ctx.beginPath(); ctx.ellipse(x, y, 9 + r() * 8, 4 + r() * 4, r(), 0, Math.PI * 2); ctx.fill();
    }
    // bright veins
    ctx.strokeStyle = 'rgba(255,240,150,0.85)';
    ctx.lineWidth = 2;
    for (var v = 0; v < 3; v++) {
      ctx.beginPath();
      var sx = 10 + v * 36 + frame * 5;
      ctx.moveTo(sx, 10);
      ctx.quadraticCurveTo(sx + 20, 32 + (frame - 1) * 6, sx + 6, 56);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Sunken pool on a floor tile: stone lip around water or lava (128x64)
   */
  function drawPool(ctx, palette, liquid, frame) {
    // lip
    diamondPath(ctx, 64, 34, 54, 27);
    ctx.fillStyle = palette.wallDark;
    ctx.fill();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    diamondPath(ctx, 64, 32, 50, 25);
    ctx.fillStyle = palette.wall;
    ctx.fill();
    // liquid surface, lower than the lip
    diamondPath(ctx, 64, 34, 42, 21);
    var g = ctx.createRadialGradient(58, 30, 3, 64, 34, 48);
    if (liquid === 'lava') {
      g.addColorStop(0, '#ffc15a'); g.addColorStop(0.55, '#ff6a1a'); g.addColorStop(1, '#7a1604');
    } else {
      g.addColorStop(0, '#5fb4c9'); g.addColorStop(0.6, '#23677f'); g.addColorStop(1, '#0c2b3d');
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    diamondPath(ctx, 64, 34, 42, 21);
    ctx.clip();
    var r = rng((liquid === 'lava' ? 700 : 500) + frame);
    if (liquid === 'lava') {
      ctx.fillStyle = 'rgba(60,10,0,0.7)';
      for (var i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.ellipse(34 + r() * 60 + frame * 4, 22 + r() * 24, 7 + r() * 5, 3 + r() * 2, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,240,150,0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(36 + frame * 4, 24); ctx.quadraticCurveTo(64, 36 + (frame - 1) * 4, 92 - frame * 3, 40); ctx.stroke();
    } else {
      // concentric ripples drifting outwards per frame
      ctx.strokeStyle = 'rgba(200,240,255,0.45)';
      ctx.lineWidth = 1.2;
      [[52, 30], [76, 38]].forEach(function(c, k) {
        var rad = 6 + ((frame + k) % 3) * 6;
        ctx.globalAlpha = 1 - ((frame + k) % 3) * 0.3;
        ctx.beginPath(); ctx.ellipse(c[0], c[1], rad, rad / 2, 0, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (var j = 0; j < 3; j++) {
        ctx.beginPath(); ctx.ellipse(40 + r() * 48, 26 + r() * 16, 4, 1, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
    // inner shadow along the back edges
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(22, 34); ctx.lineTo(64, 13); ctx.lineTo(106, 34); ctx.stroke();
  }

  /**
   * Broken floor: dark pit with cracked slabs around it (128x64)
   */
  function drawPit(ctx, palette) {
    var r = rng(77);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(64, 34, 40, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#07070b';
    ctx.beginPath();
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2, rad = 0.7 + r() * 0.3;
      var x = 64 + Math.cos(a) * 30 * rad, y = 34 + Math.sin(a) * 14 * rad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = palette.edge; ctx.lineWidth = 1.2;
    for (var k = 0; k < 5; k++) {
      var a2 = r() * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(64 + Math.cos(a2) * 28, 34 + Math.sin(a2) * 13);
      ctx.lineTo(64 + Math.cos(a2) * 50, 34 + Math.sin(a2) * 24); ctx.stroke();
    }
    // tilted slab falling in
    ctx.fillStyle = palette.floorDark;
    ctx.beginPath(); ctx.moveTo(50, 30); ctx.lineTo(70, 26); ctx.lineTo(76, 36); ctx.lineTo(54, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  /**
   * Glowing mushroom cluster; big=true for the tall back-corner version
   */
  function drawMushrooms(ctx, big) {
    var W = big ? 84 : 64, H = big ? 100 : 52;
    var base = H - 6;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(W / 2, base + 1, W / 2 - 4, 6, 0, 0, Math.PI * 2); ctx.fill();
    var caps = big
      ? [[26, 56, 12, 18, '#7e57c2', '#d1c4e9'], [52, 70, 16, 22, '#26a69a', '#b2dfdb'], [40, 34, 8, 13, '#7e57c2', '#e1bee7'], [70, 30, 6, 10, '#26a69a', '#b2ebf2'], [14, 26, 6, 9, '#ef6c00', '#ffe0b2']]
      : [[20, 26, 7, 12, '#26a69a', '#b2ebf2'], [38, 36, 9, 16, '#7e57c2', '#e1bee7'], [52, 18, 5, 9, '#ef6c00', '#ffe0b2'], [12, 14, 4, 7, '#7e57c2', '#d1c4e9']];
    caps.forEach(function(c) {
      var x = c[0], h = c[1], stemW = c[2] * 0.45, capR = c[3];
      var top = base - h;
      // stem
      var sg = ctx.createLinearGradient(x - stemW, 0, x + stemW, 0);
      sg.addColorStop(0, '#b9ae98'); sg.addColorStop(0.5, '#f1ead8'); sg.addColorStop(1, '#a89c84');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(x - stemW, base); ctx.quadraticCurveTo(x - stemW * 0.6, top + h * 0.5, x - stemW * 0.7, top + 2);
      ctx.lineTo(x + stemW * 0.7, top + 2); ctx.quadraticCurveTo(x + stemW * 0.6, top + h * 0.5, x + stemW, base);
      ctx.closePath(); ctx.fill();
      // glow halo
      var gg = ctx.createRadialGradient(x, top, 1, x, top, capR * 1.8);
      gg.addColorStop(0, 'rgba(255,255,255,0.28)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, top, capR * 1.8, 0, Math.PI * 2); ctx.fill();
      // cap
      var cg = ctx.createRadialGradient(x - capR * 0.3, top - capR * 0.4, 1, x, top, capR * 1.2);
      cg.addColorStop(0, c[5]); cg.addColorStop(0.5, c[4]); cg.addColorStop(1, 'rgba(20,10,30,1)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(x - capR, top + 3);
      ctx.bezierCurveTo(x - capR, top - capR * 0.9, x + capR, top - capR * 0.9, x + capR, top + 3);
      ctx.quadraticCurveTo(x, top + capR * 0.3, x - capR, top + 3);
      ctx.closePath(); ctx.fill();
      // spots
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(x - capR * 0.35, top - capR * 0.3, Math.max(1.2, capR * 0.12), 0, Math.PI * 2);
      ctx.arc(x + capR * 0.3, top - capR * 0.45, Math.max(1, capR * 0.09), 0, Math.PI * 2); ctx.fill();
    });
  }

  /**
   * Ferns, grass tufts and pale roots growing between the slabs (72x56)
   */
  function drawPlants(ctx, palette) {
    var r = rng(55);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(36, 50, 30, 6, 0, 0, Math.PI * 2); ctx.fill();
    drawMossPatch(ctx, palette, 36, 48, 30, 8, 0.8);
    function frond(x, y, len, angle, color) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
      var ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
      var cx = x + Math.cos(angle + 0.35) * len * 0.6, cy = y + Math.sin(angle + 0.35) * len * 0.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
      for (var i = 1; i < 7; i++) {
        var t = i / 7;
        var px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * ex;
        var py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ey;
        var leaf = (1 - t) * 7 + 2;
        [-1, 1].forEach(function(sgn) {
          ctx.beginPath();
          ctx.ellipse(px + Math.cos(angle + sgn * 1.3) * leaf * 0.6, py + Math.sin(angle + sgn * 1.3) * leaf * 0.6, leaf * 0.6, 1.6, angle + sgn * 1.1, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
    frond(36, 48, 34, -1.9, palette.mossDark);
    frond(36, 48, 30, -1.2, palette.moss);
    frond(34, 48, 26, -2.6, palette.moss);
    frond(38, 48, 24, -0.6, palette.mossDark);
    // grass blades
    ctx.strokeStyle = '#8bab52'; ctx.lineWidth = 1.2;
    for (var b = 0; b < 14; b++) {
      var bx = 8 + r() * 56, bh = 6 + r() * 12;
      ctx.beginPath(); ctx.moveTo(bx, 50); ctx.quadraticCurveTo(bx + (r() - 0.5) * 6, 50 - bh * 0.6, bx + (r() - 0.5) * 8, 50 - bh); ctx.stroke();
    }
    // tiny pale flowers
    ctx.fillStyle = '#f3e9b0';
    for (var f = 0; f < 4; f++) {
      ctx.beginPath(); ctx.arc(14 + r() * 44, 34 + r() * 12, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  /**
   * Weathered owl statue on a stone plinth (64x132)
   */
  function drawStatue(ctx, palette) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(32, 124, 28, 7, 0, 0, Math.PI * 2); ctx.fill();
    // plinth: iso block
    ctx.strokeStyle = palette.edge; ctx.lineWidth = 1;
    ctx.fillStyle = palette.floorLight;
    ctx.beginPath(); ctx.moveTo(32, 78); ctx.lineTo(56, 90); ctx.lineTo(32, 102); ctx.lineTo(8, 90); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = palette.wall;
    ctx.beginPath(); ctx.moveTo(8, 90); ctx.lineTo(32, 102); ctx.lineTo(32, 126); ctx.lineTo(8, 114); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = palette.wallDark;
    ctx.beginPath(); ctx.moveTo(56, 90); ctx.lineTo(32, 102); ctx.lineTo(32, 126); ctx.lineTo(56, 114); ctx.closePath(); ctx.fill(); ctx.stroke();
    // owl body
    var g = ctx.createLinearGradient(12, 0, 52, 0);
    g.addColorStop(0, '#9b98a6'); g.addColorStop(0.45, '#c9c6d2'); g.addColorStop(1, '#6e6b7a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(18, 92);
    ctx.bezierCurveTo(8, 70, 12, 38, 20, 22);   // left side up to ear
    ctx.lineTo(16, 8); ctx.lineTo(27, 18);       // left ear tuft
    ctx.quadraticCurveTo(32, 16, 37, 18);
    ctx.lineTo(48, 8); ctx.lineTo(44, 22);       // right ear tuft
    ctx.bezierCurveTo(52, 38, 56, 70, 46, 92);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // wings
    ctx.fillStyle = 'rgba(60,58,72,0.35)';
    ctx.beginPath(); ctx.moveTo(14, 50); ctx.quadraticCurveTo(10, 76, 22, 90); ctx.quadraticCurveTo(22, 66, 14, 50); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 50); ctx.quadraticCurveTo(54, 76, 42, 90); ctx.quadraticCurveTo(42, 66, 50, 50); ctx.fill();
    // face disc and eyes
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(25, 34, 8, 9, 0, 0, Math.PI * 2); ctx.ellipse(39, 34, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3846';
    ctx.beginPath(); ctx.arc(25, 34, 3.5, 0, Math.PI * 2); ctx.arc(39, 34, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a8796';
    ctx.beginPath(); ctx.moveTo(32, 38); ctx.lineTo(29, 44); ctx.lineTo(32, 49); ctx.lineTo(35, 44); ctx.closePath(); ctx.fill();
    // carved chest feathers
    ctx.strokeStyle = 'rgba(40,38,50,0.45)'; ctx.lineWidth = 1;
    for (var row = 0; row < 4; row++) {
      for (var c = 0; c < 3; c++) {
        var fx0 = 24 + c * 8 - (row % 2) * 4, fy0 = 58 + row * 8;
        ctx.beginPath(); ctx.arc(fx0, fy0, 3.5, 0.2, Math.PI - 0.2); ctx.stroke();
      }
    }
    // crack and moss
    ctx.strokeStyle = 'rgba(30,28,38,0.7)';
    ctx.beginPath(); ctx.moveTo(44, 24); ctx.lineTo(40, 40); ctx.lineTo(46, 52); ctx.stroke();
    ctx.fillStyle = palette.moss;
    ctx.globalAlpha = 0.75;
    ctx.beginPath(); ctx.ellipse(20, 90, 8, 4, 0, 0, Math.PI * 2); ctx.ellipse(12, 110, 5, 7, 0, 0, Math.PI * 2); ctx.ellipse(40, 16, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Cave-in: heap of fallen blocks and a snapped beam (120x84)
   */
  function drawCaveIn(ctx, palette) {
    var r = rng(88);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(60, 74, 54, 10, 0, 0, Math.PI * 2); ctx.fill();
    // dust mound
    var mg = ctx.createLinearGradient(0, 30, 0, 80);
    mg.addColorStop(0, palette.floorLight); mg.addColorStop(1, palette.floorDark);
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.moveTo(8, 76); ctx.quadraticCurveTo(40, 26, 70, 34); ctx.quadraticCurveTo(100, 40, 114, 76); ctx.closePath(); ctx.fill();
    // snapped beam
    ctx.save();
    ctx.translate(58, 44); ctx.rotate(-0.42);
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-46, -5, 60, 10);
    ctx.fillStyle = '#8a6238'; ctx.fillRect(-46, -5, 60, 3);
    ctx.fillStyle = '#6b4a2b';
    ctx.beginPath(); ctx.moveTo(14, -5); ctx.lineTo(20, -2); ctx.lineTo(16, 1); ctx.lineTo(22, 5); ctx.lineTo(14, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
    // blocks
    for (var i = 0; i < 16; i++) {
      var x = 14 + r() * 92, y = 40 + r() * 34, sz = 5 + r() * 10;
      if (y < 76 - (1 - Math.abs(x - 60) / 60) * 40) y += 14;
      ctx.fillStyle = [palette.wall, palette.wallDark, palette.floorLight][i % 3];
      ctx.strokeStyle = palette.edge; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - sz, y + sz * 0.4); ctx.lineTo(x - sz * 0.4, y - sz * 0.6); ctx.lineTo(x + sz * 0.7, y - sz * 0.5);
      ctx.lineTo(x + sz, y + sz * 0.3); ctx.lineTo(x + sz * 0.2, y + sz * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // dust specks
    ctx.fillStyle = 'rgba(220,210,190,0.35)';
    for (var d = 0; d < 10; d++) { ctx.beginPath(); ctx.arc(10 + r() * 100, 60 + r() * 16, 1.3, 0, Math.PI * 2); ctx.fill(); }
  }

  // ---------------------------------------------------------------------------
  // Walls, arches, rims
  // ---------------------------------------------------------------------------

  function wallPath(ctx, side) {
    // Canvas 128x96: floor edge at the bottom third, face rises 64px
    var pts = side === 'n'
      ? [[64, 64], [128, 96], [128, 32], [64, 0]]
      : [[64, 64], [0, 96], [0, 32], [64, 0]];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  function drawBlocks(ctx, palette, side, seed) {
    // stone block joints following the wall slope
    var r = rng(seed);
    ctx.strokeStyle = palette.edge;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 1;
    for (var row = 1; row < 4; row++) {
      var y = row * 16 + (r() - 0.5) * 2;
      ctx.beginPath();
      if (side === 'n') { ctx.moveTo(64, y); ctx.lineTo(128, y + 32); }
      else { ctx.moveTo(64, y); ctx.lineTo(0, y + 32); }
      ctx.stroke();
      var off = (row % 2) * 14 + r() * 6;
      for (var b = 0; b < 3; b++) {
        var x = side === 'n' ? 64 + off + b * 22 : 64 - off - b * 22;
        if (x < 2 || x > 126) continue;
        var slope = side === 'n' ? (x - 64) / 2 : (64 - x) / 2;
        ctx.beginPath();
        ctx.moveTo(x, y + slope);
        ctx.lineTo(x, y + slope + 16);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // shading: darker toward the floor
    var lg = ctx.createLinearGradient(0, 0, 0, 96);
    lg.addColorStop(0, 'rgba(255,255,255,0.08)');
    lg.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, 128, 96);
  }

  function drawVines(ctx, palette, side, seed) {
    var r = rng(seed);
    ctx.strokeStyle = palette.mossDark;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    var n = 3;
    for (var i = 0; i < n; i++) {
      var x0 = side === 'n' ? 74 + i * 16 + r() * 8 : 54 - i * 16 - r() * 8;
      var topY = side === 'n' ? (x0 - 64) / 2 : (64 - x0) / 2;
      var len = 20 + r() * 30;
      ctx.beginPath();
      ctx.moveTo(x0, topY + 2);
      ctx.bezierCurveTo(x0 + (r() - 0.5) * 10, topY + len * 0.4, x0 + (r() - 0.5) * 12, topY + len * 0.7, x0 + (r() - 0.5) * 8, topY + len);
      ctx.stroke();
      // leaves
      ctx.fillStyle = palette.moss;
      for (var l = 0; l < 3; l++) {
        ctx.beginPath();
        ctx.ellipse(x0 + (r() - 0.5) * 8, topY + 6 + l * len / 3, 3, 1.8, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawMossTop(ctx, palette, side) {
    // moss creeping along the top edge of the wall
    ctx.strokeStyle = palette.moss;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    if (side === 'n') { ctx.moveTo(66, 3); ctx.lineTo(126, 33); } else { ctx.moveTo(62, 3); ctx.lineTo(2, 33); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawWall(ctx, palette, side, variant) {
    wallPath(ctx, side);
    ctx.fillStyle = side === 'n' ? palette.wallDark : palette.wall;
    ctx.fill();
    ctx.save();
    wallPath(ctx, side);
    ctx.clip();
    drawBlocks(ctx, palette, side, 40 + variant);
    if (variant === 1) drawVines(ctx, palette, side, 7 + variant);
    if (variant === 2) {
      ctx.strokeStyle = palette.edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      var cx = side === 'n' ? 96 : 32;
      ctx.moveTo(cx, 20); ctx.lineTo(cx - 4, 34); ctx.lineTo(cx + 3, 46); ctx.lineTo(cx - 2, 60);
      ctx.stroke();
      drawMossPatch(ctx, palette, cx + 6, 70, 10, 6, 0.5);
    }
    drawMossTop(ctx, palette, side);
    ctx.restore();
    wallPath(ctx, side);
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawArch(ctx, palette, side) {
    // Wall face with an arched opening (doorway to a corridor).
    // The opening is drawn in wall-local coordinates (u along the wall, v up)
    // and sheared onto the isometric face, so verticals stay vertical and the
    // arch top follows the wall's 2:1 slope instead of sitting flat on screen.
    drawWall(ctx, palette, side, 0);
    ctx.save();
    wallPath(ctx, side);
    ctx.clip();
    // Face runs from the tile's back corner (64,64) outwards: x = 64 +/- u, y = 64 + u/2 + v
    if (side === 'n') ctx.setTransform(1, 0.5, 0, 1, 64, 64);
    else ctx.setTransform(-1, 0.5, 0, 1, 64, 64);

    var cu = 32;          // centre of the face along the wall
    var w = 19, h = 46;   // half-width and total height of the opening (face is 64 tall)
    ctx.beginPath();
    ctx.moveTo(cu - w, 0);
    ctx.lineTo(cu - w, -(h - w));
    ctx.arc(cu, -(h - w), w, Math.PI, 0);
    ctx.lineTo(cu + w, 0);
    ctx.closePath();
    // The opening is a real hole: whatever stands beyond the doorway (the
    // corridor floor, the owl walking through) shows through it.
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
    // faint shade inside the passage for depth
    var g = ctx.createLinearGradient(0, -h, 0, 0);
    g.addColorStop(0, 'rgba(5,5,12,0.55)');
    g.addColorStop(1, 'rgba(5,5,12,0.15)');
    ctx.fillStyle = g;
    ctx.fill();
    // stone frame around the opening
    ctx.strokeStyle = palette.wall;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // voussoir joints on the arch ring
    ctx.strokeStyle = palette.edge;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    for (var a = Math.PI * 1.15; a < Math.PI * 1.9; a += Math.PI * 0.18) {
      ctx.beginPath();
      ctx.moveTo(cu + Math.cos(a) * (w + 1), -(h - w) + Math.sin(a) * (w + 1));
      ctx.lineTo(cu + Math.cos(a) * (w + 5), -(h - w) + Math.sin(a) * (w + 5));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // keystone
    ctx.fillStyle = palette.floorLight;
    ctx.fillRect(cu - 4, -h - 4, 8, 8);
    ctx.strokeStyle = palette.edge;
    ctx.strokeRect(cu - 4.5, -h - 4.5, 9, 9);
    ctx.restore();
  }

  function drawRim(ctx, palette, side) {
    // Canvas 128x44; floor edge from (0,8)->(64,40) for 's', (64,40)->(128,8) for 'e'
    var pts = side === 's'
      ? [[0, 8], [64, 40], [64, 30], [0, -2]]
      : [[64, 40], [128, 8], [128, -2], [64, 30]];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = side === 's' ? palette.wall : palette.wallDark;
    ctx.fill();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = palette.moss;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (side === 's') { ctx.moveTo(2, 1); ctx.lineTo(62, 31); } else { ctx.moveTo(66, 31); ctx.lineTo(126, 1); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawRimBack(ctx, palette, side) {
    // Canvas 128x44 placed at (p.y - 14): low parapet along a back edge of the
    // diamond. 'n' runs top corner (64,4) -> right corner (128,36); 'w' mirrors it.
    var top = side === 'n'
      ? [[64, 4], [128, 36], [128, 27], [64, -5]]
      : [[64, 4], [0, 36], [0, 27], [64, -5]];
    var face = side === 'n'
      ? [[64, 4], [128, 36], [128, 44], [64, 12]]
      : [[64, 4], [0, 36], [0, 44], [64, 12]];
    function poly(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    }
    poly(face);
    ctx.fillStyle = side === 'n' ? palette.wallDark : palette.wall;
    ctx.fill();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.stroke();
    poly(top);
    ctx.fillStyle = palette.floorLight;
    ctx.fill();
    ctx.stroke();
  }

  function drawPost(ctx, palette) {
    // small doorway post 16x44
    ctx.fillStyle = palette.wall;
    ctx.fillRect(3, 6, 10, 34);
    ctx.fillStyle = palette.wallDark;
    ctx.fillRect(9, 6, 4, 34);
    ctx.fillStyle = palette.floorLight;
    ctx.fillRect(1, 2, 14, 6);
    ctx.fillRect(1, 38, 14, 5);
    ctx.strokeStyle = palette.edge;
    ctx.strokeRect(1.5, 2.5, 13, 40);
  }

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  function drawTorchBracket(ctx) {
    // 16x30 iron bracket with a wooden handle
    ctx.fillStyle = '#3b2a1a';
    ctx.fillRect(6, 8, 4, 20);
    ctx.fillStyle = '#5a3d22';
    ctx.fillRect(5, 6, 6, 8);
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(3, 24, 10, 4);
  }

  var FLAME_FRAMES = 8;

  /**
   * 40x64 flame, one of FLAME_FRAMES in a seamless loop: an outer orange
   * body, a yellow middle and a white-hot core, each a tongue whose tip and
   * sides sway with phase-shifted sines, plus a spark drifting up
   */
  function drawFlame(ctx, frame) {
    var cx = 20, base = 60;
    var ph = frame / FLAME_FRAMES * Math.PI * 2;
    function tongue(w, h, sway, colors, alpha) {
      var tipX = cx + Math.sin(ph + sway) * w * 0.45;
      var tipY = base - h * (0.92 + 0.08 * Math.sin(ph * 2 + sway));
      var lw = w * (1 + 0.08 * Math.sin(ph + sway + 1.3));
      var rw = w * (1 + 0.08 * Math.sin(ph + sway + 2.6));
      var g = ctx.createLinearGradient(0, base, 0, tipY);
      g.addColorStop(0, colors[0]);
      g.addColorStop(0.55, colors[1]);
      g.addColorStop(1, colors[2]);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx - lw * 0.7, base);
      ctx.bezierCurveTo(cx - lw * 1.15, base - h * 0.35, cx - lw * 0.55 + (tipX - cx) * 0.4, base - h * 0.7, tipX, tipY);
      ctx.bezierCurveTo(cx + rw * 0.55 + (tipX - cx) * 0.4, base - h * 0.7, cx + rw * 1.15, base - h * 0.35, cx + rw * 0.7, base);
      ctx.quadraticCurveTo(cx, base + 4, cx - lw * 0.7, base);
      ctx.fill();
    }
    tongue(15, 50, 0, ['rgba(200,60,10,0.9)', 'rgba(255,110,20,0.85)', 'rgba(255,90,10,0)'], 0.95);
    tongue(11, 40, 1.7, ['rgba(255,150,30,1)', 'rgba(255,190,60,0.95)', 'rgba(255,170,40,0)'], 1);
    tongue(6, 24, 3.1, ['rgba(255,250,220,1)', 'rgba(255,240,170,1)', 'rgba(255,230,140,0)'], 1);
    // spark rising and fading over the loop
    var t = frame / FLAME_FRAMES;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.arc(cx + 6 * Math.sin(ph * 0.5 + 1), base - 30 - t * 28, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Warm pool of torchlight on the floor (256x128 ellipse, additive)
   */
  function drawLightPool(ctx) {
    var g = ctx.createRadialGradient(128, 64, 4, 128, 64, 128);
    g.addColorStop(0, 'rgba(255,190,110,0.55)');
    g.addColorStop(0.5, 'rgba(255,150,70,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.scale(1, 0.5);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Soft cast shadow (128x48): dense near the feet, feathering toward the tip.
   * Drawn with its origin at (0.12, 0.5) so it starts just behind the caster.
   */
  function drawCastShadow(ctx) {
    ctx.save();
    ctx.translate(16, 24);
    for (var i = 0; i < 6; i++) {
      var k = i / 5;
      ctx.globalAlpha = 0.3 * (1 - k * 0.7);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(38 + k * 30, 0, 36 + k * 40 - k * 20, 13 - k * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawGlow(ctx, size, color) {
    var g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  function drawPillar(ctx, palette) {
    // 40x110 round column with base and capital
    var g = ctx.createLinearGradient(6, 0, 34, 0);
    g.addColorStop(0, palette.wallDark);
    g.addColorStop(0.45, palette.wall);
    g.addColorStop(1, palette.wallDark);
    ctx.fillStyle = g;
    ctx.fillRect(10, 12, 20, 84);
    ctx.fillStyle = palette.floorLight;
    ctx.fillRect(6, 6, 28, 8);
    ctx.fillRect(4, 94, 32, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(20, 104, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 12.5, 19, 83);
    ctx.strokeStyle = palette.moss;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(12, 30); ctx.quadraticCurveTo(20, 45, 14, 62); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawBones(ctx) {
    // 60x34 bone pile with a skull
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(30, 28, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e8e0c8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    [[8, 26, 30, 18], [20, 30, 46, 22], [34, 30, 52, 16]].forEach(function(b) {
      ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[2], b[3]); ctx.stroke();
    });
    ctx.fillStyle = '#efe7d0';
    ctx.beginPath(); ctx.arc(18, 14, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2020';
    ctx.beginPath(); ctx.arc(15, 13, 2, 0, Math.PI * 2); ctx.arc(21, 13, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(14, 19, 8, 3);
  }

  function drawRubble(ctx, palette) {
    // 60x34 broken stones
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(30, 28, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
    var r = rng(21);
    for (var i = 0; i < 7; i++) {
      var x = 8 + r() * 44, y = 12 + r() * 14, s = 5 + r() * 7;
      ctx.fillStyle = i % 2 ? palette.wall : palette.wallDark;
      ctx.strokeStyle = palette.edge;
      ctx.beginPath();
      ctx.moveTo(x - s, y + s * 0.5); ctx.lineTo(x - s * 0.3, y - s * 0.7); ctx.lineTo(x + s * 0.8, y - s * 0.4); ctx.lineTo(x + s, y + s * 0.5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  function drawGoldPile(ctx) {
    // 80x44 mound of coins with glints
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(40, 38, 36, 6, 0, 0, Math.PI * 2); ctx.fill();
    var g = ctx.createRadialGradient(36, 22, 4, 40, 28, 40);
    g.addColorStop(0, '#ffe680');
    g.addColorStop(0.6, '#e0a82a');
    g.addColorStop(1, '#8a5a10');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(40, 30, 36, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(38, 22, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    var r = rng(33);
    for (var i = 0; i < 18; i++) {
      var x = 10 + r() * 60, y = 16 + r() * 20;
      ctx.fillStyle = '#ffd24a';
      ctx.beginPath(); ctx.ellipse(x, y, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a06a10'; ctx.lineWidth = 0.6; ctx.stroke();
    }
    // gems
    [['#e040fb', 28, 20], ['#40c4ff', 52, 24], ['#ff5252', 44, 14]].forEach(function(gem) {
      ctx.fillStyle = gem[0];
      ctx.beginPath(); ctx.moveTo(gem[1], gem[2] - 5); ctx.lineTo(gem[1] + 4, gem[2]); ctx.lineTo(gem[1], gem[2] + 4); ctx.lineTo(gem[1] - 4, gem[2]); ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(30, 14, 1.6, 0, Math.PI * 2); ctx.arc(58, 20, 1.3, 0, Math.PI * 2); ctx.fill();
  }

  function drawCrystal(ctx) {
    // 44x70 crystal cluster (cave lair)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(22, 64, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    function shard(x, h, w, tilt, c1, c2) {
      var g = ctx.createLinearGradient(x - w, 0, x + w, 0);
      g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.moveTo(x - w, 62); ctx.lineTo(x - w * 0.6 + tilt, 62 - h * 0.8); ctx.lineTo(x + tilt * 1.2, 62 - h);
      ctx.lineTo(x + w * 0.6 + tilt, 62 - h * 0.85); ctx.lineTo(x + w, 62); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - w * 0.3, 60); ctx.lineTo(x + tilt * 0.9, 62 - h * 0.9); ctx.stroke();
    }
    shard(12, 34, 7, -3, '#6a1b9a', '#ce93d8');
    shard(30, 40, 7, 4, '#00838f', '#80deea');
    shard(21, 56, 9, 0, '#7b1fa2', '#e1bee7');
  }

  function drawBanner(ctx) {
    // 36x80 hanging cloth banner with owl emblem
    ctx.fillStyle = '#3b2a1a';
    ctx.fillRect(2, 4, 32, 5);
    var g = ctx.createLinearGradient(0, 0, 36, 0);
    g.addColorStop(0, '#7a1a1a'); g.addColorStop(0.5, '#b32a2a'); g.addColorStop(1, '#6a1414');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(32, 8); ctx.lineTo(32, 66); ctx.lineTo(18, 78); ctx.lineTo(4, 66); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8b64a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#e8b64a';
    ctx.beginPath(); ctx.arc(18, 34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a1a1a';
    ctx.beginPath(); ctx.arc(14, 32, 2.5, 0, Math.PI * 2); ctx.arc(22, 32, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(18, 35); ctx.lineTo(16, 39); ctx.lineTo(20, 39); ctx.closePath(); ctx.fill();
  }

  function drawStairs(ctx, palette) {
    // 128x110 isometric stairway: treads run parallel to the north wall and
    // climb toward it (up-right on screen), risers face the viewer.
    // Local axes: u along the wall edge (screen (1, .5)), v toward the wall
    // (screen (1, -.5)), z straight up.
    var cx = 52, cy = 84;
    function loc(u, v, z) { return [cx + u + v, cy + 0.5 * u - 0.5 * v - z]; }
    function poly(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    }
    // floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    poly([loc(-34, -6, 0), loc(34, -6, 0), loc(34, 50, 0), loc(-34, 50, 0)]);
    ctx.fill();

    var steps = 5, depth = 9, rise = 7, halfW = 26;
    for (var i = 0; i < steps; i++) {
      var v0 = i * depth, v1 = v0 + depth, z = (i + 1) * rise;
      // riser (faces down-left, toward the viewer)
      poly([loc(-halfW, v0, z), loc(halfW, v0, z), loc(halfW, v0, z - rise), loc(-halfW, v0, z - rise)]);
      ctx.fillStyle = palette.wallDark;
      ctx.fill();
      ctx.strokeStyle = palette.edge; ctx.lineWidth = 1; ctx.stroke();
      // side face (faces down-right)
      poly([loc(halfW, v0, z), loc(halfW, v1, z), loc(halfW, v1, z - rise), loc(halfW, v0, z - rise)]);
      ctx.fillStyle = palette.wall;
      ctx.fill();
      ctx.stroke();
      // tread
      poly([loc(-halfW, v0, z), loc(halfW, v0, z), loc(halfW, v1, z), loc(-halfW, v1, z)]);
      ctx.fillStyle = i % 2 ? palette.floorLight : palette.floor;
      ctx.fill();
      ctx.stroke();
    }

    // dark arched opening in the wall at the top of the stairs, sheared like
    // the wall face it sits in (north wall: slope +0.5)
    var top = loc(0, steps * depth, steps * rise);
    ctx.save();
    ctx.setTransform(1, 0.5, 0, 1, top[0], top[1]);
    var w = 15, h = 36;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(-w, -(h - w));
    ctx.arc(0, -(h - w), w, Math.PI, 0);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fillStyle = '#0a0a12';
    ctx.fill();
    ctx.strokeStyle = palette.wall; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = palette.edge; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }

  function drawChest(ctx, open) {
    // 64x56 wooden chest with gold trim
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(32, 50, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(10, 26, 44, 22);
    ctx.fillStyle = '#5c3a18';
    for (var i = 0; i < 4; i++) ctx.fillRect(12 + i * 11, 28, 2, 18);
    ctx.fillStyle = '#e8b64a';
    ctx.fillRect(8, 26, 48, 3); ctx.fillRect(8, 45, 48, 3); ctx.fillRect(28, 26, 8, 22);
    if (open) {
      ctx.fillStyle = '#7a4a1c';
      ctx.beginPath(); ctx.moveTo(10, 26); ctx.lineTo(54, 26); ctx.lineTo(50, 8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e8b64a'; ctx.lineWidth = 2; ctx.stroke();
      var g = ctx.createRadialGradient(32, 26, 2, 32, 26, 22);
      g.addColorStop(0, 'rgba(255,240,150,0.95)'); g.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = g; ctx.fillRect(6, 4, 52, 30);
    } else {
      ctx.fillStyle = '#9a6a35';
      ctx.beginPath(); ctx.moveTo(10, 26); ctx.lineTo(10, 18); ctx.quadraticCurveTo(32, 6, 54, 18); ctx.lineTo(54, 26); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e8b64a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.fillRect(29, 30, 6, 7);
    }
  }

  function drawRing(ctx, color, dashed) {
    diamondPath(ctx, 64, 32, 58, 29);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    if (dashed) ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawUnknownMarker(ctx, palette) {
    // 56x64 weathered stone slab with a glowing '?'
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(28, 58, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette.wallDark;
    ctx.beginPath(); ctx.moveTo(8, 56); ctx.lineTo(10, 10); ctx.quadraticCurveTo(28, 0, 46, 10); ctx.lineTo(48, 56); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = palette.edge; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#b0c4d8';
    ctx.shadowColor = '#b0e0ff'; ctx.shadowBlur = 8;
    ctx.font = 'bold 30px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 28, 34);
    ctx.shadowBlur = 0;
  }

  function drawPortal(ctx) {
    var g = ctx.createRadialGradient(48, 48, 6, 48, 48, 44);
    g.addColorStop(0, 'rgba(206,147,216,0.95)');
    g.addColorStop(0.6, 'rgba(156,39,176,0.6)');
    g.addColorStop(1, 'rgba(156,39,176,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(48, 48, 44, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e1bee7'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(48, 48, 30, 17, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f3e5f5';
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      ctx.fillRect(48 + Math.cos(a) * 36 - 1.5, 48 + Math.sin(a) * 21 - 1.5, 3, 3);
    }
  }

  /**
   * Generate every fallback texture that no real file provided
   */
  function generateFallbacks(scene, palette, decorPalette) {
    palette = palette || FALLBACK_PALETTE;
    var dp = decorPalette || palette;
    [0, 1, 2].forEach(function(v) {
      canvasTexture(scene, 'floor_' + v, TILE_W, TILE_H, function(ctx) { drawFloor(ctx, palette, v); });
      canvasTexture(scene, 'lava_' + v, TILE_W, TILE_H, function(ctx) { drawLava(ctx, v); });
      canvasTexture(scene, 'wall_n_' + v, TILE_W, 96, function(ctx) { drawWall(ctx, palette, 'n', v); });
      canvasTexture(scene, 'wall_w_' + v, TILE_W, 96, function(ctx) { drawWall(ctx, palette, 'w', v); });
      canvasTexture(scene, 'pool_water_' + v, TILE_W, TILE_H, function(ctx) { drawPool(ctx, dp, 'water', v); });
      canvasTexture(scene, 'pool_lava_' + v, TILE_W, TILE_H, function(ctx) { drawPool(ctx, dp, 'lava', v); });
    });
    canvasTexture(scene, 'decor_pit', TILE_W, TILE_H, function(ctx) { drawPit(ctx, dp); });
    canvasTexture(scene, 'decor_mushrooms', 64, 52, function(ctx) { drawMushrooms(ctx, false); });
    canvasTexture(scene, 'decor_mushrooms_big', 84, 100, function(ctx) { drawMushrooms(ctx, true); });
    canvasTexture(scene, 'decor_plants', 72, 56, function(ctx) { drawPlants(ctx, dp); });
    canvasTexture(scene, 'decor_statue', 64, 132, function(ctx) { drawStatue(ctx, dp); });
    canvasTexture(scene, 'decor_cavein', 120, 84, function(ctx) { drawCaveIn(ctx, dp); });
    canvasTexture(scene, 'glow_cyan', 160, 160, function(ctx) { drawGlow(ctx, 160, 'rgba(120,230,255,0.45)'); });
    canvasTexture(scene, 'glow_violet', 160, 160, function(ctx) { drawGlow(ctx, 160, 'rgba(170,120,255,0.45)'); });
    canvasTexture(scene, 'corridor', TILE_W, TILE_H, function(ctx) { drawCorridor(ctx, palette); });
    canvasTexture(scene, 'arch_n', TILE_W, 96, function(ctx) { drawArch(ctx, palette, 'n'); });
    canvasTexture(scene, 'arch_w', TILE_W, 96, function(ctx) { drawArch(ctx, palette, 'w'); });
    canvasTexture(scene, 'rim_s', TILE_W, 44, function(ctx) { drawRim(ctx, palette, 's'); });
    canvasTexture(scene, 'rim_e', TILE_W, 44, function(ctx) { drawRim(ctx, palette, 'e'); });
    canvasTexture(scene, 'post', 16, 44, function(ctx) { drawPost(ctx, palette); });
    canvasTexture(scene, 'rim_n', TILE_W, 44, function(ctx) { drawRimBack(ctx, palette, 'n'); });
    canvasTexture(scene, 'rim_w', TILE_W, 44, function(ctx) { drawRimBack(ctx, palette, 'w'); });
    canvasTexture(scene, 'torch_bracket', 16, 30, function(ctx) { drawTorchBracket(ctx); });
    canvasTexture(scene, 'glow_warm', 160, 160, function(ctx) { drawGlow(ctx, 160, 'rgba(255,170,60,0.55)'); });
    canvasTexture(scene, 'glow_lava', 200, 200, function(ctx) { drawGlow(ctx, 200, 'rgba(255,90,20,0.45)'); });
    canvasTexture(scene, 'glow_gold', 160, 160, function(ctx) { drawGlow(ctx, 160, 'rgba(255,220,100,0.5)'); });
    canvasTexture(scene, 'glow_purple', 160, 160, function(ctx) { drawGlow(ctx, 160, 'rgba(200,120,255,0.5)'); });
    canvasTexture(scene, 'pillar', 40, 110, function(ctx) { drawPillar(ctx, palette); });
    canvasTexture(scene, 'bones', 60, 34, function(ctx) { drawBones(ctx); });
    canvasTexture(scene, 'rubble', 60, 34, function(ctx) { drawRubble(ctx, palette); });
    canvasTexture(scene, 'gold_pile', 80, 44, function(ctx) { drawGoldPile(ctx); });
    canvasTexture(scene, 'crystal', 44, 70, function(ctx) { drawCrystal(ctx); });
    // banner hangs on a north wall: shear it along the wall's 2:1 slope
    canvasTexture(scene, 'banner', 36, 98, function(ctx) { ctx.setTransform(1, 0.5, 0, 1, 0, 0); drawBanner(ctx); ctx.setTransform(1, 0, 0, 1, 0, 0); });
    canvasTexture(scene, 'entrance', 128, 110, function(ctx) { drawStairs(ctx, palette); });
    canvasTexture(scene, 'treasure_chest', 64, 56, function(ctx) { drawChest(ctx, false); });
    canvasTexture(scene, 'treasure_open', 64, 56, function(ctx) { drawChest(ctx, true); });
    canvasTexture(scene, 'highlight_ring', TILE_W, TILE_H, function(ctx) { drawRing(ctx, '#ffd97a', false); });
    canvasTexture(scene, 'reach_ring', TILE_W, TILE_H, function(ctx) { drawRing(ctx, 'rgba(255,217,122,0.55)', true); });
    canvasTexture(scene, 'marker_unknown', 56, 64, function(ctx) { drawUnknownMarker(ctx, palette); });
    canvasTexture(scene, 'portal', 96, 96, function(ctx) { drawPortal(ctx); });

    for (var fi = 0; fi < FLAME_FRAMES; fi++) {
      (function(v) { canvasTexture(scene, 'flame_' + v, 40, 64, function(ctx) { drawFlame(ctx, v); }); })(fi);
    }
    canvasTexture(scene, 'light_pool', 256, 128, function(ctx) { drawLightPool(ctx); });
    canvasTexture(scene, 'cast_shadow', 128, 48, function(ctx) { drawCastShadow(ctx); });
    if (!scene.anims.exists('flame')) {
      scene.anims.create({
        key: 'flame',
        frames: [0, 1, 2, 3, 4, 5, 6, 7].map(function(v) { return { key: 'flame_' + v }; }),
        frameRate: 12,
        repeat: -1
      });
    }
    ['water', 'lava'].forEach(function(liquid) {
      if (scene.anims.exists('pool_' + liquid)) return;
      scene.anims.create({
        key: 'pool_' + liquid,
        frames: [{ key: 'pool_' + liquid + '_0' }, { key: 'pool_' + liquid + '_1' }, { key: 'pool_' + liquid + '_2' }],
        frameRate: liquid === 'water' ? 4 : 3,
        repeat: -1
      });
    });
    if (!scene.anims.exists('lava')) {
      scene.anims.create({
        key: 'lava',
        frames: [{ key: 'lava_0' }, { key: 'lava_1' }, { key: 'lava_2' }, { key: 'lava_1' }],
        frameRate: 3,
        repeat: -1
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Character sprites from the extracted cutouts
  // ---------------------------------------------------------------------------

  /**
   * Register a standing sprite from a cutout image, scaled to targetH pixels
   * @returns {boolean} Whether the texture was created
   */
  function makeStanding(scene, key, img, targetH) {
    if (scene.textures.exists(key)) return true;
    if (!img || !img.width) return false;
    try {
      var scale = Math.min(1, targetH / img.height);
      var w = Math.max(1, Math.round(img.width * scale));
      var h = Math.max(1, Math.round(img.height * scale));
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      scene.textures.addCanvas(key, c);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Build a simple 4-frame walk cycle + idle frame from the owl cutout.
   * Frames: idle, step-left, mid, step-right (lean, squash/stretch, bob, leg shift).
   * Registers texture `key` with frames 'idle', 'w0'..'w3' and animation `key + '_walk'`.
   */
  function makeWalkCycle(scene, key, img, targetH) {
    if (scene.textures.exists(key)) return true;
    if (!img || !img.width) return false;
    try {
      var scale = Math.min(1, targetH / img.height);
      var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      var pad = Math.round(w * 0.2);
      var fw = w + pad * 2, fh = h + 12;
      var frames = [
        { lean: 0, sx: 1, sy: 1, bob: 0, leg: 0 },
        { lean: -6, sx: 1.04, sy: 0.96, bob: 3, leg: -5 },
        { lean: 0, sx: 0.98, sy: 1.03, bob: -1, leg: 0 },
        { lean: 6, sx: 1.04, sy: 0.96, bob: 3, leg: 5 },
        { lean: 0, sx: 0.98, sy: 1.03, bob: -1, leg: 0 }
      ];
      var c = document.createElement('canvas');
      c.width = fw * frames.length; c.height = fh;
      var ctx = c.getContext('2d');
      frames.forEach(function(f, i) {
        var ox = i * fw;
        ctx.save();
        ctx.translate(ox + fw / 2, fh - 4 + f.bob);
        ctx.rotate(f.lean * Math.PI / 180);
        ctx.scale(f.sx, f.sy);
        // upper two thirds
        var split = Math.round(h * 0.66);
        ctx.drawImage(img, 0, 0, img.width, img.height * 0.66, -w / 2, -h, w, split);
        // lower third shifted sideways = stepping legs
        ctx.drawImage(img, 0, img.height * 0.66, img.width, img.height * 0.34, -w / 2 + f.leg, -h + split, w, h - split);
        ctx.restore();
      });
      var tex = scene.textures.addCanvas(key, c);
      tex.add('idle', 0, 0, 0, fw, fh);
      for (var i = 1; i < frames.length; i++) tex.add('w' + (i - 1), 0, i * fw, 0, fw, fh);
      scene.anims.create({
        key: key + '_walk',
        frames: [{ key: key, frame: 'w0' }, { key: key, frame: 'w1' }, { key: key, frame: 'w2' }, { key: key, frame: 'w3' }],
        frameRate: 8,
        repeat: -1
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Fallback lettered token when a cutout is unavailable
   */
  function makeFallbackToken(scene, key, letter, fill, ringColor, size) {
    if (scene.textures.exists(key)) return;
    canvasTexture(scene, key, size, size, function(ctx) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = ringColor;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold ' + Math.round(size * 0.5) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, size / 2, size / 2 + 2);
    });
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
    KENNEY_STONE_PALETTE: KENNEY_STONE_PALETTE,
    OPTIONAL_FILES: OPTIONAL_FILES,
    KENNEY_DIR: KENNEY_DIR,
    KENNEY_FILES: KENNEY_FILES,
    KENNEY_ORIGIN: KENNEY_ORIGIN,
    KENNEY_REQUIRED: KENNEY_REQUIRED,
    samplePalette: samplePalette,
    generateFallbacks: generateFallbacks,
    // drawing helpers shared with the cemetery textures
    rng: rng,
    canvasTexture: canvasTexture,
    diamondPath: diamondPath,
    drawGlow: drawGlow,
    drawFlame: drawFlame,
    drawStatue: drawStatue,
    FLAME_FRAMES: FLAME_FRAMES,
    makeStanding: makeStanding,
    makeWalkCycle: makeWalkCycle,
    makeFallbackToken: makeFallbackToken,
    loadImage: loadImage
  };
})();
