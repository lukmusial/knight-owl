/**
 * IsoScenes
 * Phaser 3 scenes for the isometric prototype: BootScene (procedural art,
 * cutout sprites) and DungeonScene (decorated chambers, arches, torches,
 * fog of war, standing monsters, walking owl, camera, input).
 * Game logic lives in iso-main.js; the scene only renders and reports taps.
 */

var IsoScenes = (function() {
  var REDUCED_MOTION = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var TILE_W = 128, TILE_H = 64, WALL_H = 64;
  var LAYERS = { floor: 0, wall: 1, token: 2, fx: 3 };
  var FOG_ALPHA = { hidden: 1, fogged: 0.72, visible: 0 };
  var KENNEY_TINT = 0xb6bdd2;      // cool grey-blue multiply tint for the Kenney tiles
  var KENNEY_WALL_H = 96;          // their wall pieces are taller than the procedural 64px faces
  var SPRITE_DIR = 'assets/proto/monsters/';
  var OWL_H = 104;          // player sprite height in px (~1.1 tile widths tall on a 96px basis)
  var OWL3D_H = 118;        // on-screen height of the rendered 3D owl
  var MONSTER_H = 116;      // regular monster sprite height
  var DRAGON_H = 200;
  var WALK_SPEED = 0.26;    // px per ms
  // Depth bands: every floor tile draws first, then the warm light pools, then
  // cast shadows, and only then walls, props, tokens and the owl (which keep
  // the interleaved IsoModel.depthKey order). A shadow can then stretch over
  // the neighbouring floor tiles without being covered by them.
  var FLOOR_BAND = -300000;
  var POOL_BAND = -200000;
  var SHADOW_BAND = -100000;
  var TORCH_SCALE = 0.56;   // 200px torch render -> ~60px on a 96px Kenney wall
  // cast-shadow heights and radii (grid units; Mr Owl is ~0.9 tall)
  var CASTERS = {
    owl: { h: 0.9, r: 0.22 },
    monster: { h: 0.9, r: 0.32 },
    boss: { h: 1.5, r: 0.6 },
    chest: { h: 0.45, r: 0.34 },
    barrels: { h: 0.7, r: 0.36 },
    gold: { h: 0.22, r: 0.34 },
    crystal: { h: 0.7, r: 0.22 },
    mushrooms: { h: 0.35, r: 0.22 },
    mushrooms_big: { h: 0.9, r: 0.3 },
    plants: { h: 0.3, r: 0.25 },
    statue: { h: 1.3, r: 0.24 },
    cavein: { h: 0.6, r: 0.45 },
    barrels_stacked: { h: 0.9, r: 0.4 },
    furniture: { h: 0.5, r: 0.4 }
  };

  function fx(name, opts) {
    if (typeof FX !== 'undefined' && FX.play) FX.play(name, opts);
  }

  function connectedIds(roomId) {
    var room = Dungeon.getRoom(roomId);
    return room && room.connections ? room.connections : [];
  }

  function callbacks(scene) {
    return scene.registry.get('isoCallbacks') || {};
  }

  function hash(a, b, c) {
    var h = (a * 73856093) ^ (b * 19349663) ^ ((c || 0) * 83492791);
    h = h >>> 0;
    return (h % 1000) / 1000;
  }

  /**
   * Monster ids present in the current dungeon (plus the dragon)
   */
  function monsterIds() {
    var rooms = Dungeon.getState().rooms;
    var ids = {};
    Object.keys(rooms).forEach(function(id) {
      var m = rooms[id].monster;
      if (m && m.id) ids[m.id] = true;
    });
    ids.dragon = true;
    return Object.keys(ids);
  }

  // ---------------------------------------------------------------------------
  // BootScene
  // ---------------------------------------------------------------------------
  var BootScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function BootScene() {
      Phaser.Scene.call(this, { key: 'Boot' });
    },

    preload: function() {
      var self = this;
      this.missing = {};
      this.load.on('loaderror', function(file) {
        // Optional art and cutouts are allowed to be missing
        self.missing[file.key] = true;
      });
      this.load.image('palette_src', 'assets/directions/n_s_e.png');
      Object.keys(IsoTextures.OPTIONAL_FILES).forEach(function(key) {
        self.load.image(key, 'assets/proto/iso/' + IsoTextures.OPTIONAL_FILES[key]);
      });
      // Kenney Isometric Miniature Dungeon tiles (optional; scene falls back to procedural art)
      Object.keys(IsoTextures.KENNEY_FILES).forEach(function(key) {
        self.load.image(key, IsoTextures.KENNEY_DIR + IsoTextures.KENNEY_FILES[key] + '.png');
      });
      // Mr Owl pre-rendered from the rigged 3D model (tools/owl3d/render_iso.py)
      this.load.atlas('owl3d', 'assets/proto/iso/owl3d.png', 'assets/proto/iso/owl3d.json');
      // wall torch modelled in Blender (tools/iso/render_torch.py)
      this.load.image('torch3d', 'assets/proto/iso/torch.png');
      this.load.json('torch3d_meta', 'assets/proto/iso/torch.json');
      // Extracted cutouts for the monsters in this dungeon + the owl
      monsterIds().concat(['knight_owl']).forEach(function(id) {
        self.load.image('cut_' + id, SPRITE_DIR + id + '.png');
      });
    },

    create: function() {
      var self = this;
      var palette = IsoTextures.FALLBACK_PALETTE;
      if (this.textures.exists('palette_src')) {
        palette = IsoTextures.samplePalette(this.textures.get('palette_src').getSourceImage());
      }
      var kenney = IsoTextures.KENNEY_REQUIRED.every(function(k) { return self.textures.exists(k); });
      IsoTextures.generateFallbacks(this, palette, kenney ? IsoTextures.KENNEY_STONE_PALETTE : null);
      this.registry.set('kenneyTiles', kenney);
      console.log('IsoTextures: ' + (kenney ? 'Kenney dungeon tiles' : 'procedural tiles'));

      function cutout(id) {
        return self.textures.exists('cut_' + id) ? self.textures.get('cut_' + id).getSourceImage() : null;
      }

      // Standing monster sprites; fall back to the original illustration crop
      var jobs = [];
      monsterIds().forEach(function(id) {
        var targetH = id === 'dragon' ? DRAGON_H : MONSTER_H;
        var img = cutout(id);
        if (img && IsoTextures.makeStanding(self, 'mon_' + id, img, targetH)) return;
        jobs.push(IsoTextures.loadImage('assets/' + id + '.png').then(function(full) {
          if (!full || !IsoTextures.makeStanding(self, 'mon_' + id, full, targetH)) {
            IsoTextures.makeFallbackToken(self, 'mon_' + id, '!', '#b71c1c', '#f44336', 96);
          }
        }));
      });

      // Owl: 3D renders (walk/idle, toward and away from the viewer); the
      // cutout walk cycle stays as the fallback when the atlas is missing
      if (this.textures.exists('owl3d')) {
        ['front', 'back'].forEach(function(facing) {
          self.anims.create({ key: 'owl3d_walk_' + facing, frameRate: 12, repeat: -1,
            frames: self.anims.generateFrameNames('owl3d', { prefix: facing + '_walk_', start: 0, end: 7 }) });
          self.anims.create({ key: 'owl3d_idle_' + facing, frameRate: 3, repeat: -1,
            frames: self.anims.generateFrameNames('owl3d', { prefix: facing + '_idle_', start: 0, end: 5 }) });
        });
      }
      var owl = cutout('knight_owl');
      if (this.textures.exists('owl3d')) {
        // nothing to build
      } else if (!owl || !IsoTextures.makeWalkCycle(this, 'owl', owl, OWL_H)) {
        jobs.push(IsoTextures.loadImage('assets/knight_owl.png').then(function(full) {
          if (!full || !IsoTextures.makeWalkCycle(self, 'owl', full, OWL_H)) {
            IsoTextures.makeFallbackToken(self, 'owl', 'O', '#006064', '#00bcd4', 96);
          }
        }));
      }

      Promise.all(jobs).then(function() {
        self.scene.start('Dungeon');
      });
    }
  });

  // ---------------------------------------------------------------------------
  // DungeonScene
  // ---------------------------------------------------------------------------
  var DungeonScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function DungeonScene() {
      Phaser.Scene.call(this, { key: 'Dungeon' });
    },

    create: function() {
      var self = this;
      this.model = IsoModel.build();
      this.roomSprites = {};   // roomId -> [gameObjects] (fog controlled)
      this.roomLights = {};    // roomId -> [gameObjects] (only in explored rooms)
      this.roomContents = {};  // roomId -> [gameObjects] tied to the room type (only in explored rooms)
      this.roomTorches = {};   // roomId -> [{ gx, gy, height }] torch floor points (shadow lights)
      this.allTorches = [];
      this.decorByTile = {};   // 'gx,gy' -> decor kind (see IsoModel.getRoomDecor)
      this.linkSprites = {};   // linkId -> [gameObjects]
      this.fogOverlays = {};   // roomId|linkId -> Graphics
      this.kenney = !!this.registry.get('kenneyTiles');
      this.archByTile = {};    // 'gx,gy' of the room tile -> arch image (ghosted while the owl is behind it)
      this.lastVis = {};
      this.tokens = {};        // roomId -> sprite
      this.reachRings = [];
      this.currentRoomId = null;
      this.moving = false;
      this.inputEnabled = true;

      Object.keys(this.model.rooms).forEach(function(rid) {
        IsoModel.getRoomDecor(rid).forEach(function(d) { self.decorByTile[d.gx + ',' + d.gy] = d.kind; });
      });
      this.buildTiles();
      this.buildProps();
      this.buildDecor();
      this.buildFog();
      this.createPlayer();
      this.setupCamera();
      this.setupInput();
      this.refreshFog(true);

      var cb = callbacks(this);
      if (cb.onReady) cb.onReady(this);
    },

    // --- Helpers ---------------------------------------------------------------

    bucketFor: function(t) {
      var owner = t.roomId || t.linkId;
      var bucket = t.roomId ? this.roomSprites : this.linkSprites;
      if (!bucket[owner]) bucket[owner] = [];
      return bucket[owner];
    },

    contentsFor: function(roomId) {
      if (!this.roomContents[roomId]) this.roomContents[roomId] = [];
      return this.roomContents[roomId];
    },

    lightsFor: function(roomId) {
      if (!this.roomLights[roomId]) this.roomLights[roomId] = [];
      return this.roomLights[roomId];
    },

    tileAt: function(gx, gy) {
      return this.model.tileMap[gx + ',' + gy] || null;
    },

    /**
     * Does this floor tile open onto a corridor on the given side?
     */
    opensTo: function(t, side) {
      var n = side === 'n' ? this.tileAt(t.gx, t.gy - 1)
        : side === 'w' ? this.tileAt(t.gx - 1, t.gy)
        : side === 's' ? this.tileAt(t.gx, t.gy + 1)
        : this.tileAt(t.gx + 1, t.gy);
      return !!(n && n.kind === 'corridor');
    },

    /**
     * Pixel point on a wall face: side 'n' or 'w', u along the edge (0..1), v up the wall (px)
     */
    wallPoint: function(t, side, u, v) {
      var p = IsoModel.gridToIso(t.gx, t.gy);
      if (side === 'n') {
        // edge from tile top (p.x, p.y-32) to tile right (p.x+64, p.y)
        return { x: p.x + 64 * u, y: p.y - 32 + 32 * u - v };
      }
      // 'w': edge from tile top (p.x, p.y-32) to tile left (p.x-64, p.y)
      return { x: p.x - 64 * u, y: p.y - 32 + 32 * u - v };
    },

    addTorch: function(roomId, t, side) {
      var pt = this.wallPoint(t, side, 0.5, this.kenney ? 46 : 30);
      var depth = IsoModel.depthKey(t.gx, t.gy, LAYERS.wall) + 0.5;
      var meta = this.cache.json.get('torch3d_meta');
      var flameX = pt.x, flameY = pt.y - 10, flameScale = 0.7;
      if (this.textures.exists('torch3d') && meta) {
        // the render hangs on an 'n' wall; mirrored for 'w' walls
        var flip = side === 'w';
        var sc = this.kenney ? TORCH_SCALE : TORCH_SCALE * 0.75;
        var mx = flip ? 1 - meta.mount.x : meta.mount.x;
        var torch = this.add.image(pt.x, pt.y, 'torch3d').setOrigin(mx, meta.mount.y).setScale(sc).setFlipX(flip).setDepth(depth);
        this.bucketFor(t).push(torch);
        var fx0 = (meta.flame.x - meta.mount.x) * meta.size * sc;
        flameX = pt.x + (flip ? -fx0 : fx0);
        flameY = pt.y + (meta.flame.y - meta.mount.y) * meta.size * sc + 4;
        flameScale = 0.62;
      } else {
        this.bucketFor(t).push(this.add.image(pt.x, pt.y + 14, 'torch_bracket').setDepth(depth));
      }
      var glow = this.add.image(flameX, flameY - 14, 'glow_warm').setDepth(depth + 0.1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7).setScale(0.9);
      var flame = this.add.sprite(flameX, flameY, 'flame_0').setOrigin(0.5, 0.92).setScale(flameScale).setDepth(depth + 0.2);
      // warm pool of light on the floor below
      var fp = IsoModel.torchFloorPoint(t, side);
      var inward = side === 'n' ? { gx: fp.gx, gy: fp.gy + 0.45 } : { gx: fp.gx + 0.45, gy: fp.gy };
      var pp = IsoModel.gridToIso(inward.gx, inward.gy);
      var pool = this.add.image(pp.x, pp.y, 'light_pool').setDepth(POOL_BAND + IsoModel.depthKey(t.gx, t.gy, 0))
        .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55).setScale(1.1);
      if (!REDUCED_MOTION) {
        flame.play({ key: 'flame', startFrame: Math.floor(hash(t.gx, t.gy) * 8) });
        var dur = 380 + hash(t.gy, t.gx) * 240;
        this.tweens.add({ targets: glow, alpha: 0.95, scale: 1.1, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: pool, alpha: 0.7, duration: dur * 1.3, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      this.lightsFor(roomId).push(glow, flame, pool);
      var light = { roomId: roomId, gx: fp.gx, gy: fp.gy, height: IsoModel.LIGHT.torchHeight };
      (this.roomTorches[roomId] = this.roomTorches[roomId] || []).push(light);
      this.allTorches.push(light);
    },

    addProp: function(roomId, gx, gy, key, opts) {
      opts = opts || {};
      var p = IsoModel.gridToIso(gx, gy);
      var img = this.add.image(p.x + (opts.dx || 0), p.y + (opts.dy || 0), key)
        .setOrigin(opts.ox !== undefined ? opts.ox : 0.5, opts.oy !== undefined ? opts.oy : 1)
        .setDepth((opts.layer === LAYERS.floor ? FLOOR_BAND : 0) + IsoModel.depthKey(gx, gy, opts.layer !== undefined ? opts.layer : LAYERS.token) + (opts.dz || 0));
      if (opts.scale) img.setScale(opts.scale);
      if (opts.flip) img.setFlipX(true);
      if (opts.alpha !== undefined) img.setAlpha(opts.alpha);
      if (opts.blend) img.setBlendMode(opts.blend);
      var group = opts.light ? this.lightsFor(roomId)
        : opts.contents ? this.contentsFor(roomId)
        : (this.roomSprites[roomId] = this.roomSprites[roomId] || []);
      group.push(img);
      if (opts.cast) this.addShadows(roomId, gx, gy, opts.cast);
      return img;
    },

    // --- Torchlight and shadows ----------------------------------------------------

    /**
     * One soft shadow on the floor from a torch (IsoModel.castShadow in screen terms)
     */
    placeShadow: function(img, gx, gy, sh, offY) {
      var p = IsoModel.gridToIso(gx, gy);
      p.y += offY || 0;
      // cast_shadow texture: the body runs ~100px from the origin, ~26px across
      img.setPosition(p.x, p.y).setRotation(sh.angle)
        .setScale(sh.length / 100, sh.width / 26)
        .setAlpha(Math.min(1, sh.alpha / 0.6))
        .setDepth(SHADOW_BAND + (gx + gy) * 4 + 0.1);
      return img;
    },

    /**
     * Static shadows of a prop/token from the torches of its chamber. Without
     * a target group they join the chamber's light group (shown once explored).
     * @returns {Array} the shadow images
     */
    addShadows: function(roomId, gx, gy, caster, group) {
      var self = this;
      var out = [];
      (this.roomTorches[roomId] || []).forEach(function(torch) {
        var sh = IsoModel.castShadow({ gx: gx, gy: gy, height: caster.h, radius: caster.r }, torch);
        if (!sh) return;
        out.push(self.placeShadow(self.add.image(0, 0, 'cast_shadow').setOrigin(0.12, 0.5), gx, gy, sh));
      });
      if (group) {
        out.forEach(function(img) { group.push(img); });
      } else {
        var lights = this.lightsFor(roomId);
        var lit = this.lastVis[roomId] === 'visible';
        out.forEach(function(img) { img.setVisible(lit); lights.push(img); });
      }
      return out;
    },

    /**
     * Mr Owl's shadows from the two nearest lit torches and his brightness,
     * every frame (he also walks through the corridors between chambers)
     */
    updateOwlLighting: function() {
      if (!this.player || !this.owlShadows) return;
      var shadows = this.owlShadows;
      if (!this.player.visible) {
        shadows.forEach(function(sh) { sh.setVisible(false); });
        this.owlContact.setVisible(false);
        return;
      }
      var feet = IsoModel.isoToGridExact(this.player.x, this.player.y - 12);
      var self = this;
      var lights = this.allTorches.filter(function(t) { return self.lastVis[t.roomId] === 'visible'; });
      var near = lights.map(function(t) {
        var dx = feet.gx - t.gx, dy = feet.gy - t.gy;
        return { t: t, d: dx * dx + dy * dy };
      }).sort(function(a, b) { return a.d - b.d; }).slice(0, shadows.length);
      for (var i = 0; i < shadows.length; i++) {
        var sh = near[i] ? IsoModel.castShadow({ gx: feet.gx, gy: feet.gy, height: CASTERS.owl.h, radius: CASTERS.owl.r }, near[i].t) : null;
        if (!sh) { shadows[i].setVisible(false); continue; }
        // the owl sprite stands 12px below the grid point it walks on
        this.placeShadow(shadows[i], feet.gx, feet.gy, sh, 12).setVisible(true);
      }
      var fp = IsoModel.gridToIso(feet.gx, feet.gy);
      this.owlContact.setPosition(fp.x, fp.y + 12).setDepth(SHADOW_BAND + (feet.gx + feet.gy) * 4 + 0.2).setVisible(true);
      // darker between torches, warm and full next to one
      var level = IsoModel.lightLevel(feet.gx, feet.gy, lights);
      var k = 0.62 + 0.38 * level;
      var tint = (Math.round(255 * k) << 16) | (Math.round(244 * k) << 8) | Math.round(228 * k);
      if (tint !== this.owlTint) { this.player.setTint(tint); this.owlTint = tint; }
    },

    // --- Build -----------------------------------------------------------------

    /**
     * Place a Kenney tile: 128x256 image whose floor diamond centre must sit at p
     */
    kTile: function(key, p, depth, dy) {
      var o = IsoTextures.KENNEY_ORIGIN;
      // Kenney's sandstone is tinted toward the game's cool grey-blue dungeon palette
      return this.add.image(p.x, p.y + (dy || 0), key).setOrigin(o.x, o.y).setDepth(depth).setTint(KENNEY_TINT);
    },

    buildTiles: function() {
      var self = this;
      var model = this.model;
      var rooms = Dungeon.getState().rooms;
      if (this.kenney) return this.buildTilesKenney();

      model.tiles.forEach(function(t) {
        var p = IsoModel.gridToIso(t.gx, t.gy);
        var bucket = self.bucketFor(t);
        var room = t.roomId ? rooms[t.roomId] : null;
        var rm = t.roomId ? model.rooms[t.roomId] : null;
        var dx = rm ? t.gx - rm.gx0 : 0, dy = rm ? t.gy - rm.gy0 : 0;

        var floorKey = 'floor_' + t.variant;
        bucket.push(self.add.image(p.x, p.y, floorKey).setDepth(FLOOR_BAND + IsoModel.depthKey(t.gx, t.gy, LAYERS.floor)));
        if (room && room.type === 'boss' && self.isContentSlot(dx, dy)) self.addBossLava(t, p, dx + dy);

        var v = Math.floor(hash(t.gx, t.gy, 3) * 3);
        var wallDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.wall);

        if (t.kind === 'corridor') {
          // Passage between chambers: low parapets on both flanks, no tall walls
          t.walls.forEach(function(side) {
            if (side === 'n' || side === 'w') {
              bucket.push(self.add.image(p.x, p.y - 14, 'rim_' + side).setDepth(wallDepth));
            } else {
              bucket.push(self.add.image(p.x, p.y + 14, 'rim_' + side).setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.fx) - 0.5));
            }
          });
          return;
        }

        // Back walls (n / w): arch when the neighbour is a corridor, wall otherwise
        if (t.walls.indexOf('n') !== -1) {
          bucket.push(self.add.image(p.x, p.y, 'wall_n_' + v).setOrigin(0.5, 1).setDepth(wallDepth));
        } else if (t.kind === 'floor' && self.opensTo(t, 'n')) {
          var archN = self.add.image(p.x, p.y, 'arch_n').setOrigin(0.5, 1).setDepth(wallDepth);
          bucket.push(archN);
          self.archByTile[t.gx + ',' + t.gy + ':n'] = archN;
        }
        if (t.walls.indexOf('w') !== -1) {
          bucket.push(self.add.image(p.x, p.y, 'wall_w_' + v).setOrigin(0.5, 1).setDepth(wallDepth));
        } else if (t.kind === 'floor' && self.opensTo(t, 'w')) {
          var archW = self.add.image(p.x, p.y, 'arch_w').setOrigin(0.5, 1).setDepth(wallDepth);
          bucket.push(archW);
          self.archByTile[t.gx + ',' + t.gy + ':w'] = archW;
        }

        // Front rims (s / e): low parapet; openings toward a corridor stay clear
        var frontDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.fx) - 0.5;
        if (t.walls.indexOf('s') !== -1) {
          bucket.push(self.add.image(p.x, p.y + 14, 'rim_s').setDepth(frontDepth));
        }
        if (t.walls.indexOf('e') !== -1) {
          bucket.push(self.add.image(p.x, p.y + 14, 'rim_e').setDepth(frontDepth));
        }
      });

      this.buildPortals();
    },

    /**
     * Tile pass with the Kenney set: block floors, wall pieces per edge, arches
     * at corridor openings, half walls as parapets. Torches, banners, fog and
     * tokens are added by the other passes unchanged.
     */
    buildTilesKenney: function() {
      var self = this;
      var model = this.model;
      var rooms = Dungeon.getState().rooms;

      model.tiles.forEach(function(t) {
        var p = IsoModel.gridToIso(t.gx, t.gy);
        var bucket = self.bucketFor(t);
        var room = t.roomId ? rooms[t.roomId] : null;
        var rm = t.roomId ? model.rooms[t.roomId] : null;
        var dx = rm ? t.gx - rm.gx0 : 0, dy = rm ? t.gy - rm.gy0 : 0;
        var floorDepth = FLOOR_BAND + IsoModel.depthKey(t.gx, t.gy, LAYERS.floor);
        var wallDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.wall);
        var frontDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.fx) - 0.5;
        var v = Math.floor(hash(t.gx, t.gy, 3) * 3);

        if (t.kind === 'corridor') {
          bucket.push(self.kTile(self.textures.exists('k_corridor_1') && v === 2 ? 'k_corridor_1' : 'k_corridor', p, floorDepth));
        } else {
          var fk = 'k_floor_' + (self.textures.exists('k_floor_3') ? Math.floor(hash(t.gx, t.gy, 5) * 4) : t.variant);
          if (!self.textures.exists(fk)) fk = 'k_floor_0';
          bucket.push(self.kTile(fk, p, floorDepth));
          if (room && room.type === 'boss' && self.isContentSlot(dx, dy)) self.addBossLava(t, p, dx + dy);
        }

        function wallKey(side) {
          // a cave-in breaks through the wall behind it
          if (self.decorByTile[t.gx + ',' + t.gy] === 'cavein' && self.textures.exists('k_wall_hole_' + side)) return 'k_wall_hole_' + side;
          var k = 'k_wall_' + side + '_' + (v === 2 && hash(t.gx, t.gy, 7) > 0.5 ? 2 : (v === 1 ? 1 : 0));
          return self.textures.exists(k) ? k : 'k_wall_' + side + '_0';
        }

        if (t.kind === 'corridor') {
          t.walls.forEach(function(side) {
            var back = side === 'n' || side === 'w';
            bucket.push(self.kTile('k_rim_' + side, p, back ? wallDepth : frontDepth));
          });
          return;
        }

        if (t.walls.indexOf('n') !== -1) {
          bucket.push(self.kTile(wallKey('n'), p, wallDepth));
        } else if (t.kind === 'floor' && self.opensTo(t, 'n')) {
          var archN = self.kTile('k_arch_n', p, wallDepth);
          bucket.push(archN);
          self.archByTile[t.gx + ',' + t.gy + ':n'] = archN;
        }
        if (t.walls.indexOf('w') !== -1) {
          bucket.push(self.kTile(wallKey('w'), p, wallDepth));
        } else if (t.kind === 'floor' && self.opensTo(t, 'w')) {
          var archW = self.kTile('k_arch_w', p, wallDepth);
          bucket.push(archW);
          self.archByTile[t.gx + ',' + t.gy + ':w'] = archW;
        }
        if (t.walls.indexOf('s') !== -1) bucket.push(self.kTile('k_rim_s', p, frontDepth));
        if (t.walls.indexOf('e') !== -1) bucket.push(self.kTile('k_rim_e', p, frontDepth));
      });

      this.buildPortals();
    },

    isContentSlot: function(dx, dy) {
      return IsoModel.CONTENT_SLOTS.some(function(c) { return c.dx === dx && c.dy === dy; });
    },

    /**
     * Lava floor of the dragon's lair; part of the contents, so a fogged lair
     * looks like any other chamber
     */
    addBossLava: function(t, p, frame) {
      var lava = this.add.sprite(p.x, p.y, 'lava_0').setDepth(FLOOR_BAND + IsoModel.depthKey(t.gx, t.gy, LAYERS.floor) + 0.1);
      if (!REDUCED_MOTION) lava.play({ key: 'lava', startFrame: frame % 3 });
      this.contentsFor(t.roomId).push(lava);
    },

    buildPortals: function() {
      var self = this;
      var model = this.model;
      // Portal links: rune circles on both rooms and a faint line between them
      model.links.forEach(function(link) {
        if (link.type !== 'portal') return;
        var a = IsoModel.getRoomCenterPx(link.a), b = IsoModel.getRoomCenterPx(link.b);
        if (!a || !b) return;
        var arr = self.linkSprites[link.id] = [];
        var line = self.add.graphics().setDepth(1);
        line.lineStyle(3, 0x9c27b0, 0.45);
        line.beginPath(); line.moveTo(a.x, a.y); line.lineTo(b.x, b.y); line.strokePath();
        arr.push(line);
        [link.a, link.b].forEach(function(rid) {
          var c = IsoModel.getRoomCenter(rid), p = IsoModel.getRoomCenterPx(rid);
          var ring = self.add.image(p.x, p.y + 4, 'portal').setDepth(FLOOR_BAND + IsoModel.depthKey(c.gx, c.gy, LAYERS.floor) + 0.5).setAlpha(0.85);
          arr.push(ring);
          if (!REDUCED_MOTION) self.tweens.add({ targets: ring, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
        });
      });
    },

    /**
     * Torches, pillars, bones, gold, crystals, banners, stairs per room type
     */
    buildProps: function() {
      var self = this;
      var model = this.model;
      var rooms = Dungeon.getState().rooms;

      Object.keys(model.rooms).forEach(function(rid) {
        var rm = model.rooms[rid];
        var room = rooms[rid];
        var g = rm.gx0, h = rm.gy0;
        var type = room ? room.type : 'corridor';
        var seed = hash(g, h, 11);

        // Torches on back walls (middle tile if solid, else the corner tile)
        var nTile = self.tileAt(g + 1, h), nCorner = self.tileAt(g + 2, h);
        var wTile = self.tileAt(g, h + 1), wCorner = self.tileAt(g, h + 2);
        // The entrance stairs occupy the middle north tile, so its torch goes to a corner
        var nFirst = type === 'entrance' ? nCorner : nTile;
        var nSecond = type === 'entrance' ? self.tileAt(g, h) : nCorner;
        if (nFirst && nFirst.walls.indexOf('n') !== -1) self.addTorch(rid, nFirst, 'n');
        else if (nSecond && nSecond.walls.indexOf('n') !== -1) self.addTorch(rid, nSecond, 'n');
        if (wTile && wTile.walls.indexOf('w') !== -1) self.addTorch(rid, wTile, 'w');
        else if (wCorner && wCorner.walls.indexOf('w') !== -1) self.addTorch(rid, wCorner, 'w');

        if (type === 'entrance') {
          if (self.kenney) {
            var sp = IsoModel.gridToIso(g + 1, h);
            self.roomSprites[rid].push(self.kTile('k_stairs', sp, IsoModel.depthKey(g + 1, h, LAYERS.token) + 0.6));
          } else {
            self.addProp(rid, g + 1, h, 'entrance', { dy: 20, dz: 0.6 });
          }
          var bt = self.tileAt(g, h);
          if (bt && bt.walls.indexOf('n') !== -1) {
            var bp = self.wallPoint(bt, 'n', 0.5, 62);
            self.roomSprites[rid].push(self.add.image(bp.x, bp.y, 'banner').setOrigin(0.5, 0).setDepth(IsoModel.depthKey(bt.gx, bt.gy, LAYERS.wall) + 0.5));
          }
          // (the corner tile g+2 carries the torch; a second banner would sit on top of it)
          return;
        }

        // Everything below reveals the chamber type, so it lives in the contents
        // group (shown only once explored) and on the content slots only
        var slotA = IsoModel.CONTENT_SLOTS[seed > 0.5 ? 0 : 1];
        var slotB = IsoModel.CONTENT_SLOTS[seed > 0.5 ? 1 : 0];
        if (type === 'monster') {
          self.addProp(rid, g + slotA.dx, h + slotA.dy, seed > 0.33 ? 'bones' : 'rubble', { dy: 8, dz: -0.5, contents: true });
          if (self.kenney && self.textures.exists('k_barrels')) {
            var bp0 = IsoModel.gridToIso(g + slotB.dx, h + slotB.dy);
            self.contentsFor(rid).push(self.kTile(seed > 0.75 ? 'k_crates' : 'k_barrels', bp0, IsoModel.depthKey(g + slotB.dx, h + slotB.dy, LAYERS.token) + 0.2));
            self.addShadows(rid, g + slotB.dx, h + slotB.dy, CASTERS.barrels);
          } else if (seed > 0.6) {
            self.addProp(rid, g + slotB.dx, h + slotB.dy, 'rubble', { dy: 8, dz: -0.5, scale: 0.8, contents: true });
          }
        } else if (type === 'treasure') {
          self.addProp(rid, g + 1, h + 1, 'glow_gold', { oy: 0.5, dy: 4, layer: LAYERS.floor, dz: 0.5, blend: Phaser.BlendModes.ADD, alpha: 0.7, light: true });
          self.addProp(rid, g + 2, h, 'gold_pile', { dy: 12, contents: true, cast: CASTERS.gold });
          self.addProp(rid, g, h + 2, 'gold_pile', { dy: 12, scale: 0.8, contents: true, cast: CASTERS.gold });
        } else if (type === 'boss') {
          self.addProp(rid, g + 1, h + 1, 'glow_lava', { oy: 0.5, dy: 6, layer: LAYERS.floor, dz: 0.5, blend: Phaser.BlendModes.ADD, alpha: 0.8, light: true });
          self.addProp(rid, g + 2, h, 'crystal', { dy: 10, dz: 0.3, contents: true, cast: CASTERS.crystal });
          self.addProp(rid, g, h + 2, 'crystal', { dy: 10, dz: 0.3, scale: 0.85, flip: true, contents: true, cast: CASTERS.crystal });
          // (back edge tiles may carry decor, so the hoard sits on the front edges)
          self.addProp(rid, g + 2, h + 1, 'gold_pile', { dy: 12, scale: 0.9, contents: true, cast: CASTERS.gold });
          self.addProp(rid, g + 1, h + 2, 'gold_pile', { dy: 12, scale: 0.85, contents: true, cast: CASTERS.gold });
          self.addProp(rid, g + 1, h + 1, 'glow_purple', { oy: 0.5, dy: -30, layer: LAYERS.fx, dz: 0.2, blend: Phaser.BlendModes.ADD, alpha: 0.35, light: true });
        } else {
          // empty chamber: a little set dressing now and then
          if (seed > 0.72) self.addProp(rid, g + slotA.dx, h + slotA.dy, 'rubble', { dy: 8, dz: -0.5, contents: true });
          else if (seed < 0.18) self.addProp(rid, g + slotB.dx, h + slotB.dy, 'bones', { dy: 8, dz: -0.5, contents: true });
        }
      });
    },

    /**
     * Position-based chamber decor (IsoModel.getRoomDecor): visible through the
     * fog, independent of what the chamber holds. Glows only light up once explored.
     */
    buildDecor: function() {
      var self = this;
      Object.keys(this.model.rooms).forEach(function(rid) {
        IsoModel.getRoomDecor(rid).forEach(function(d) {
          var p = IsoModel.gridToIso(d.gx, d.gy);
          var floorDepth = FLOOR_BAND + IsoModel.depthKey(d.gx, d.gy, LAYERS.floor) + 0.3;
          var tokenDepth = IsoModel.depthKey(d.gx, d.gy, LAYERS.token);
          var sprites = self.roomSprites[rid] = self.roomSprites[rid] || [];
          var glow = function(key, dy, scale, alpha) {
            self.addProp(rid, d.gx, d.gy, key, { oy: 0.5, dy: dy, layer: LAYERS.floor, dz: 0.6, blend: Phaser.BlendModes.ADD, alpha: alpha, scale: scale, light: true });
          };
          var kOr = function(kKey, fallback, fallbackOpts, depth) {
            if (self.kenney && self.textures.exists(kKey)) {
              sprites.push(self.kTile(kKey, p, depth === undefined ? tokenDepth : depth));
            } else if (fallback) {
              self.addProp(rid, d.gx, d.gy, fallback, fallbackOpts || { dy: 10 });
            }
          };
          switch (d.kind) {
            case 'pool':
            case 'lava_vent':
              var liquid = d.kind === 'pool' ? 'water' : 'lava';
              var pool = self.add.sprite(p.x, p.y, 'pool_' + liquid + '_0').setDepth(floorDepth);
              if (!REDUCED_MOTION) pool.play({ key: 'pool_' + liquid, startFrame: Math.floor(hash(d.gx, d.gy) * 3) });
              sprites.push(pool);
              if (liquid === 'lava') glow('glow_lava', 2, 0.55, 0.6);
              else glow('glow_cyan', 2, 0.5, 0.25);
              break;
            case 'broken_floor':
              sprites.push(self.add.image(p.x, p.y, 'decor_pit').setDepth(floorDepth));
              break;
            case 'mushrooms':
              self.addProp(rid, d.gx, d.gy, 'decor_mushrooms', { dy: 12, dz: -0.2, cast: CASTERS.mushrooms });
              glow('glow_cyan', -8, 0.45, 0.45);
              break;
            case 'mushrooms_big':
              self.addProp(rid, d.gx, d.gy, 'decor_mushrooms_big', { dy: 10, cast: CASTERS.mushrooms_big });
              glow('glow_violet', -30, 0.7, 0.5);
              break;
            case 'plants':
              self.addProp(rid, d.gx, d.gy, 'decor_plants', { dy: 12, dz: -0.2, cast: CASTERS.plants });
              break;
            case 'statue':
              self.addProp(rid, d.gx, d.gy, 'decor_statue', { dy: 16, cast: CASTERS.statue });
              break;
            case 'cavein':
              kOr('k_supports', null, null, tokenDepth - 0.2);
              self.addProp(rid, d.gx, d.gy, 'decor_cavein', { dy: 18, cast: CASTERS.cavein });
              break;
            case 'barrels_stacked':
              kOr('k_barrels_stacked', 'rubble', { dy: 8 });
              self.addShadows(rid, d.gx, d.gy, CASTERS.barrels_stacked);
              break;
            case 'furniture':
              kOr('k_table_broken', 'bones', { dy: 8 });
              self.addShadows(rid, d.gx, d.gy, CASTERS.furniture);
              break;
          }
        });
      });
    },

    /**
     * Silhouette of a tile block: floor diamond hull plus the back walls
     * (n/w faces rise by `up`). Corridor tiles have no walls, so they pass 0.
     */
    fogPolygon: function(gx0, gy0, gx1, gy1, up, margin) {
      // gridToIso gives tile centres; the diamond corners lie 0.5 tile out, so
      // the margin must exceed 0.5 to cover the block's outer edges
      var m = margin === undefined ? 0.68 : margin;
      var n = IsoModel.gridToIso(gx0 - m, gy0 - m);
      var e = IsoModel.gridToIso(gx1 + m, gy0 - m);
      var s = IsoModel.gridToIso(gx1 + m, gy1 + m);
      var w = IsoModel.gridToIso(gx0 - m, gy1 + m);
      if (up === undefined) up = WALL_H + 16;
      return [
        new Phaser.Geom.Point(n.x, n.y - up),
        new Phaser.Geom.Point(e.x, e.y - up),
        new Phaser.Geom.Point(e.x, e.y + 22),
        new Phaser.Geom.Point(s.x, s.y + 40),
        new Phaser.Geom.Point(w.x, w.y + 22),
        new Phaser.Geom.Point(w.x, w.y - up)
      ];
    },

    buildFog: function() {
      var self = this;
      var model = this.model;
      Object.keys(model.rooms).forEach(function(rid) {
        var r = model.rooms[rid];
        var g = self.add.graphics().setDepth(IsoModel.depthKey(r.gx0 + 2, r.gy0 + 2, LAYERS.fx) + 1);
        g.fillStyle(0x05060a, 1);
        g.fillPoints(self.fogPolygon(r.gx0, r.gy0, r.gx0 + 2, r.gy0 + 2), true);
        self.fogOverlays[rid] = g;
      });
      model.links.forEach(function(link) {
        if (link.type !== 'corridor' || !link.tile) return;
        var t = link.tile;
        var g = self.add.graphics().setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.fx) + 1);
        g.fillStyle(0x05060a, 1);
        g.fillPoints(self.fogPolygon(t.gx, t.gy, t.gx, t.gy, 6, 0.58), true);
        self.fogOverlays[link.id] = g;
      });
    },

    createPlayer: function() {
      this.highlight = this.add.image(0, 0, 'highlight_ring').setDepth(0).setVisible(false);
      this.owl3d = this.textures.exists('owl3d') && this.anims.exists('owl3d_walk_front');
      this.owlFacing = 'front';
      if (this.owl3d) {
        var meta = this.textures.get('owl3d').customData.meta || {};
        var pivot = meta.pivot || { x: 0.52, y: 0.91 };
        this.owlScale = OWL3D_H / (meta.figureHeight || 160);
        this.player = this.add.sprite(0, 0, 'owl3d', 'front_idle_0').setOrigin(pivot.x, pivot.y)
          .setScale(this.owlScale).setVisible(false);
        this.playerHasWalk = true;
      } else {
        var hasFrames = this.textures.exists('owl') && this.textures.get('owl').has('idle');
        this.player = this.add.sprite(0, 0, 'owl', hasFrames ? 'idle' : undefined).setOrigin(0.5, 0.96).setVisible(false);
        this.playerHasWalk = hasFrames && this.anims.exists('owl_walk');
      }
      this.playerBob = null;
      this.owlShadows = [0, 1].map(function() {
        return this.add.image(0, 0, 'cast_shadow').setOrigin(0.12, 0.5).setVisible(false);
      }, this);
      this.owlTint = null;
      // small contact shadow that grounds him wherever he stands
      this.owlContact = this.add.image(0, 0, 'glow_warm').setTint(0x000000).setScale(0.42, 0.2).setAlpha(0.55).setVisible(false);
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: this.highlight, scaleX: 1.08, scaleY: 1.08, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.startIdle();
      }
    },

    startIdle: function() {
      if (this.owl3d) {
        if (!REDUCED_MOTION) this.player.play('owl3d_idle_' + this.owlFacing, true);
        return;
      }
      if (REDUCED_MOTION || this.playerBob) return;
      this.playerBob = this.tweens.add({ targets: this.player, scaleY: 1.03, scaleX: 0.985, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    },

    stopIdle: function() {
      if (this.playerBob) { this.playerBob.stop(); this.playerBob = null; }
      if (!this.owl3d) this.player.setScale(1, 1);
    },

    /**
     * 3D owl facing for a screen-space move: the renders face down-left
     * ('front') and up-right ('back'); the other two directions are mirrored
     */
    faceOwl: function(dx, dy) {
      this.owlFacing = dy >= 0 ? 'front' : 'back';
      this.player.setFlipX(this.owlFacing === 'front' ? dx > 0 : dx < 0);
    },

    // --- Fog / tokens ------------------------------------------------------------

    setGroupVisible: function(arr, visible) {
      if (!arr) return;
      for (var i = 0; i < arr.length; i++) arr[i].setVisible(visible);
    },

    applyFog: function(id, vis, sprites, immediate, wasHidden) {
      var overlay = this.fogOverlays[id];
      // Hidden areas draw nothing at all (no silhouette that would leak the layout)
      var target = vis === 'hidden' ? 0 : FOG_ALPHA[vis];
      this.setGroupVisible(sprites, vis !== 'hidden');
      if (this.roomLights[id]) this.setGroupVisible(this.roomLights[id], vis === 'visible');
      if (this.roomContents[id]) this.setGroupVisible(this.roomContents[id], vis === 'visible');
      if (!overlay) return;
      if (immediate || REDUCED_MOTION) {
        overlay.setAlpha(target);
        return;
      }
      if (wasHidden) overlay.setAlpha(1); // reveal fades in from darkness
      this.tweens.add({ targets: overlay, alpha: target, duration: 450, ease: 'Quad.easeOut' });
    },

    /**
     * Sync every room/corridor with DungeonMap exploration state
     */
    refreshFog: function(immediate) {
      var self = this;
      var model = this.model;
      Object.keys(model.rooms).forEach(function(rid) {
        var vis = IsoModel.getRoomVisibility(rid);
        if (self.lastVis[rid] !== vis) {
          var wasHidden = self.lastVis[rid] === 'hidden';
          self.lastVis[rid] = vis;
          self.applyFog(rid, vis, self.roomSprites[rid], immediate, wasHidden);
        }
      });
      model.links.forEach(function(link) {
        var vis = IsoModel.getLinkVisibility(link);
        if (self.lastVis[link.id] !== vis) {
          var linkWasHidden = self.lastVis[link.id] === 'hidden';
          self.lastVis[link.id] = vis;
          self.applyFog(link.id, vis, self.linkSprites[link.id], immediate, linkWasHidden);
        }
      });
      this.refreshTokens();
    },

    tokenKey: function(tok) {
      switch (tok.kind) {
        case 'unknown': return 'marker_unknown';
        case 'entrance': return null; // stairs are part of the chamber dressing
        case 'treasure': return this.kenney ? 'k_chest' : 'treasure_chest';
        case 'treasure_open': return this.kenney ? 'k_chest_open' : 'treasure_open';
        case 'boss': return this.textures.exists('mon_dragon') ? 'mon_dragon' : 'marker_unknown';
        case 'monster':
          return this.textures.exists('mon_' + tok.id) ? 'mon_' + tok.id : 'marker_unknown';
        default: return null;
      }
    },

    refreshTokens: function() {
      var self = this;
      Object.keys(this.model.rooms).forEach(function(rid) {
        var tok = IsoModel.getTokenFor(rid);
        var key = tok ? self.tokenKey(tok) : null;
        var existing = self.tokens[rid];
        if (existing && existing.tokenKey === key) return;
        if (existing) {
          if (existing.bobTween) existing.bobTween.stop();
          (existing.shadows || []).forEach(function(sh) { sh.destroy(); });
          existing.destroy();
          delete self.tokens[rid];
        }
        if (!key) return;
        var c = IsoModel.getRoomCenter(rid), p = IsoModel.getRoomCenterPx(rid);
        var img = key.indexOf('k_') === 0
          ? self.kTile(key, p, IsoModel.depthKey(c.gx, c.gy, LAYERS.token))   // Kenney tile: diamond-centre origin
          : self.add.image(p.x, p.y + 12, key).setOrigin(0.5, 1).setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.token));
        img.tokenKey = key;
        if ((tok.kind === 'monster' || tok.kind === 'boss') && !REDUCED_MOTION) {
          img.bobTween = self.tweens.add({ targets: img, y: p.y + 8, scaleX: 0.98, duration: 1100 + hash(c.gx, c.gy) * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        var caster = tok.kind === 'boss' ? CASTERS.boss : (tok.kind === 'monster' ? CASTERS.monster
          : (tok.kind === 'treasure' || tok.kind === 'treasure_open' ? CASTERS.chest : null));
        if (caster) img.shadows = self.addShadows(rid, c.gx, c.gy, caster, []);
        self.tokens[rid] = img;
      });
    },

    /**
     * The dragon yields: three hits as the last riddle lands, it rears up
     * roaring in a gold blaze, then bows its head, the lava glow cools to
     * gold, its hoard bursts into sparkles and it fades into the light.
     * Calls back when the moment has passed.
     */
    playDragonDefeat: function(onDone) {
      var self = this;
      var rid = Dungeon.getBossId();
      var img = this.tokens[rid];
      if (!img || REDUCED_MOTION) {
        if (onDone) this.time.delayedCall(REDUCED_MOTION ? 300 : 0, onDone);
        return;
      }
      if (img.bobTween) img.bobTween.stop();
      var c = IsoModel.getRoomCenter(rid), p = IsoModel.getRoomCenterPx(rid);
      var x = p.x, y = p.y + 12;
      img.setPosition(x, y).setScale(1, 1);
      this.setInputEnabled(false);
      this.focusOn(p.x, p.y - 40, false);
      var t = this.tweens;
      var blaze = this.add.image(x, y - 90, 'glow_gold').setScale(1).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(img.depth - 0.1);
      var lights = (this.roomLights[rid] || []).filter(function(o) { return o.texture && (o.texture.key === 'glow_lava' || o.texture.key === 'glow_purple'); });
      var hits = 0;
      function hit() {
        hits++;
        img.setTintFill(0xffffff);
        fx('hit');
        self.cameras.main.shake(120, 0.003);
        t.add({ targets: img, x: x + (hits % 2 ? -10 : 10), duration: 60, yoyo: true, repeat: 1,
          onComplete: function() { img.x = x; img.clearTint(); if (hits < 3) self.time.delayedCall(160, hit); else rear(); } });
      }
      function rear() {
        fx('dragon-roar');
        t.add({ targets: blaze, alpha: 0.9, scale: 3, duration: 900, ease: 'Quad.easeOut' });
        t.add({ targets: img, y: y - 34, scaleX: 1.18, scaleY: 1.22, rotation: -0.08, duration: 700, ease: 'Sine.easeOut', onComplete: bow });
        lights.forEach(function(l) { t.add({ targets: l, alpha: 0.05, duration: 1400 }); });
      }
      function bow() {
        // head down: lean forward and sink, the blaze settles behind it
        self.time.delayedCall(350, function() {
          fx('pushback');
          self.cameras.main.shake(220, 0.005);
          t.add({ targets: img, y: y + 6, scaleX: 1.08, scaleY: 0.92, rotation: 0.16, duration: 520, ease: 'Bounce.easeOut', onComplete: hoard });
          t.add({ targets: blaze, scale: 2.2, alpha: 0.6, duration: 600 });
        });
      }
      function hoard() {
        // the hoard is yours: gold bursts from the piles, the dragon fades into the light
        fx('coins');
        var contents = self.roomContents[rid] || [];
        contents.forEach(function(o, i) {
          if (!o.texture || o.texture.key !== 'gold_pile') return;
          for (var k = 0; k < 8; k++) {
            var a = (k / 8) * Math.PI * 2 + i;
            var sp = self.add.image(o.x, o.y - 10, 'glow_gold').setScale(0.12).setBlendMode(Phaser.BlendModes.ADD).setDepth(o.depth + 1);
            t.add({ targets: sp, x: o.x + Math.cos(a) * (40 + hash(i, k) * 40), y: o.y - 30 - Math.abs(Math.sin(a)) * 60 - hash(k, i) * 40,
              alpha: 0, scale: 0.02, duration: 900 + hash(i, k, 3) * 500, ease: 'Quad.easeOut',
              onComplete: (function(s2) { return function() { s2.destroy(); }; })(sp) });
          }
        });
        self.time.delayedCall(500, function() {
          fx('door', { volume: 0.4 });
          t.add({ targets: img, alpha: 0, y: y - 60, scaleX: 0.9, scaleY: 0.9, duration: 1100, ease: 'Sine.easeIn' });
          t.add({ targets: blaze, alpha: 0, scale: 0.4, duration: 1300, ease: 'Sine.easeIn', onComplete: function() {
            blaze.destroy();
            if (onDone) onDone();
          } });
        });
      }
      hit();
    },

    // --- Player / camera -----------------------------------------------------------

    /**
     * Screen-space offset so the room is centred between the HUD top bar and dock
     */
    hudOffsetY: function() {
      return this.hudOffset().y;
    },

    /**
     * Screen-space offset {x, y} that centres the room in the part of the
     * screen the HUD leaves free: below the top bar and above a bottom dock
     * (portrait), or left of a right-hand dock column (landscape)
     */
    hudOffset: function() {
      var top = document.querySelector('.hud-top');
      var dock = document.querySelector('.hud-dock');
      var vw = window.innerWidth, vh = window.innerHeight;
      var t = top ? top.getBoundingClientRect().bottom : 0;
      var free = { left: 0, right: vw, top: Math.max(0, t), bottom: vh };
      if (dock) {
        var r = dock.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          var sideColumn = r.left > vw / 2 && r.height > vh / 2;
          if (sideColumn) free.right = Math.min(free.right, r.left);
          else free.bottom = Math.min(free.bottom, r.top);
        }
      }
      return {
        x: vw / 2 - (free.left + free.right) / 2,
        y: vh / 2 - (free.top + free.bottom) / 2
      };
    },

    focusOn: function(x, y, instant) {
      var cam = this.cameras.main;
      var off = this.hudOffset();
      var tx = x + off.x / cam.zoom;
      var ty = y + off.y / cam.zoom;
      if (instant || REDUCED_MOTION) cam.centerOn(tx, ty);
      else cam.pan(tx, ty, 550, 'Sine.easeInOut', true); // force: replace a pan still in flight
    },

    setCurrentRoom: function(roomId, snapPlayer) {
      var self = this;
      var firstRoom = this.currentRoomId === null;
      this.currentRoomId = roomId;
      var c = IsoModel.getRoomCenter(roomId), p = IsoModel.getRoomCenterPx(roomId);
      if (!c) return;
      this.highlight.setPosition(p.x, p.y).setDepth(SHADOW_BAND + IsoModel.depthKey(c.gx, c.gy, LAYERS.floor) + 0.6).setVisible(true);
      if (snapPlayer || !this.player.visible) {
        this.player.setPosition(p.x, p.y + 12).setVisible(true);
      }
      this.updatePlayerDepth();

      this.reachRings.forEach(function(r) { r.destroy(); });
      this.reachRings = [];
      connectedIds(roomId).forEach(function(rid) {
        var rc = IsoModel.getRoomCenter(rid), rp = IsoModel.getRoomCenterPx(rid);
        if (!rc) return;
        self.reachRings.push(self.add.image(rp.x, rp.y, 'reach_ring').setDepth(SHADOW_BAND + IsoModel.depthKey(rc.gx, rc.gy, LAYERS.floor) + 0.6));
      });

      this.focusOn(p.x, p.y, firstRoom);
    },

    /**
     * Depth from the owl's feet: on the floor plane gx + gy == y / TILE_H*2,
     * so sorting by the continuous position keeps the sprite above the tile
     * it is actually standing on while it walks (tile-snapped depth put it
     * under the origin tile when heading up-left).
     */
    updatePlayerDepth: function() {
      var feetY = this.player.y - 12;
      this.player.setDepth((feetY / (TILE_H / 2)) * 4 + LAYERS.token + 1);
    },

    /**
     * While the owl stands on a corridor tile it is behind the doorway wall of
     * the room ahead (n/w faces are back walls); ghost that wall so the owl
     * reads through the arch. Pass null to restore every arch.
     */
    ghostArchesFor: function(points) {
      var self = this;
      Object.keys(this.archByTile).forEach(function(k) { self.archByTile[k].setAlpha(1); });
      if (!points) return;
      points.forEach(function(g) {
        var t = self.tileAt(g.gx, g.gy);
        if (!t || t.kind !== 'corridor') return;
        var east = self.archByTile[(g.gx + 1) + ',' + g.gy + ':w'];
        var south = self.archByTile[g.gx + ',' + (g.gy + 1) + ':n'];
        if (east) east.setAlpha(0.45);
        if (south) south.setAlpha(0.45);
      });
    },

    /**
     * Walk the owl along the corridor to another room, then callback
     */
    movePlayer: function(toId, onArrive) {
      var self = this;
      var fromId = this.currentRoomId;
      var path = IsoModel.pathBetween(fromId, toId);
      if (path.length < 2) path = [IsoModel.getRoomCenter(toId)];

      if (REDUCED_MOTION) {
        var end = IsoModel.getRoomCenterPx(toId);
        this.player.setPosition(end.x, end.y + 12);
        this.time.delayedCall(0, function() { if (onArrive) onArrive(); });
        return;
      }

      this.moving = true;
      this.followOffset = this.hudOffset();
      this.cameras.main.panEffect.reset();  // the camera follows the owl while walking
      this.stopIdle();
      if (this.playerHasWalk && !this.owl3d) this.player.play('owl_walk');
      var segments = path.slice(1).map(function(g) { var q = IsoModel.gridToIso(g.gx, g.gy); return { x: q.x, y: q.y + 12 }; });
      var idx = 0;

      function segment() {
        if (idx >= segments.length) {
          self.moving = false;
          self.ghostArchesFor(null);
          if (self.playerHasWalk && !self.owl3d) { self.player.stop(); self.player.setFrame('idle'); }
          self.startIdle();
          if (onArrive) onArrive();
          return;
        }
        var from = { x: self.player.x, y: self.player.y };
        var to = segments[idx++];
        var g = IsoModel.isoToGrid(to.x, to.y - 12);
        self.ghostArchesFor([IsoModel.isoToGrid(from.x, from.y - 12), g]);
        if (self.owl3d) {
          self.faceOwl(to.x - from.x, to.y - from.y);
          self.player.play('owl3d_walk_' + self.owlFacing, true);
        } else if (Math.abs(to.x - from.x) > 2) {
          self.player.setFlipX(to.x < from.x);
        }
        var dist = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
        var dur = Math.max(180, dist / WALK_SPEED);
        // one door sound per crossing: as the owl steps into the next chamber
        if (idx === segments.length) fx('door');
        fx('step');
        self.time.delayedCall(dur / 2, function() { fx('step', { volume: 0.7 }); });
        self.tweens.add({
          targets: self.player, x: to.x, y: to.y, duration: dur, ease: 'Linear',
          onUpdate: function() { self.updatePlayerDepth(); },
          onComplete: segment
        });
      }
      segment();
    },

    setupCamera: function() {
      var self = this;
      var b = IsoModel.getBounds();
      var cam = this.cameras.main;
      cam.setBounds(b.x - 400, b.y - 400, b.width + 800, b.height + 800);
      var w = this.scale.width || 800;
      cam.setZoom(w < 600 ? 0.75 : Math.max(0.6, Math.min(1, w / 1000)));
      this.scale.on('resize', function(size) {
        cam.setSize(size.width, size.height);
        if (self.currentRoomId) {
          var p = IsoModel.getRoomCenterPx(self.currentRoomId);
          if (p) self.focusOn(p.x, p.y, true);
        }
      });
    },

    setInputEnabled: function(enabled) {
      this.inputEnabled = !!enabled;
    },

    setupInput: function() {
      var self = this;
      var cam = this.cameras.main;
      var drag = null;
      var pinch = null;

      this.input.on('pointerdown', function(pointer) {
        if (!self.inputEnabled) return;
        drag = { x: pointer.x, y: pointer.y, lastX: pointer.x, lastY: pointer.y, moved: 0 };
      });

      this.input.on('pointermove', function(pointer) {
        if (!drag || !pointer.isDown || pinch) return;
        var dx = pointer.x - drag.lastX, dy = pointer.y - drag.lastY;
        drag.lastX = pointer.x; drag.lastY = pointer.y;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        cam.scrollX -= dx / cam.zoom;
        cam.scrollY -= dy / cam.zoom;
      });

      this.input.on('pointerup', function(pointer) {
        if (!drag) return;
        var wasPinch = !!pinch;
        var moved = drag.moved;
        drag = null;
        if (self.input.pointer1.isDown || self.input.pointer2.isDown) return;
        pinch = null;
        if (wasPinch || moved > 8 || !self.inputEnabled || self.moving) return;
        var world = cam.getWorldPoint(pointer.x, pointer.y);
        var g = IsoModel.isoToGrid(world.x, world.y);
        var rid = IsoModel.roomAt(g.gx, g.gy);
        if (!rid || rid === self.currentRoomId) return;
        var cb = callbacks(self);
        if (connectedIds(self.currentRoomId).indexOf(rid) === -1) {
          if (cb.onFarTap) cb.onFarTap(rid);
          return;
        }
        if (cb.onRoomTap) cb.onRoomTap(rid);
      });

      this.input.on('wheel', function(pointer, objects, dx, dy) {
        var z = cam.zoom * (dy > 0 ? 0.9 : 1.1);
        cam.setZoom(Phaser.Math.Clamp(z, 0.4, 2));
      });

      // Pinch zoom handled in update()
      this.pinchState = function() { return pinch; };
      this.setPinch = function(v) { pinch = v; };
    },

    update: function(time, delta) {
      var p1 = this.input.pointer1, p2 = this.input.pointer2;
      var cam = this.cameras.main;

      this.updateOwlLighting();

      // Follow the owl while it walks between rooms (smoothed)
      if (this.moving && this.player) {
        var tx = this.player.x + this.followOffset.x / cam.zoom;
        var ty = this.player.y + this.followOffset.y / cam.zoom;
        var k = 1 - Math.pow(0.002, Math.min(delta || 16, 100) / 1000);
        var mx = cam.midPoint.x, my = cam.midPoint.y;
        cam.centerOn(mx + (tx - mx) * k, my + (ty - my) * k);
      }
      if (p1 && p2 && p1.isDown && p2.isDown) {
        var d = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        var pinch = this.pinchState();
        if (!pinch) {
          this.setPinch({ dist: d, zoom: cam.zoom });
        } else {
          cam.setZoom(Phaser.Math.Clamp(pinch.zoom * (d / pinch.dist), 0.4, 2));
        }
      }
    }
  });

  return {
    BootScene: BootScene,
    DungeonScene: DungeonScene,
    REDUCED_MOTION: REDUCED_MOTION
  };
})();
