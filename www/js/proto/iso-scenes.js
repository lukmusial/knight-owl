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
  var MONSTER_H = 116;      // regular monster sprite height
  var DRAGON_H = 200;
  var WALK_SPEED = 0.26;    // px per ms

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
      IsoTextures.generateFallbacks(this, palette);
      var kenney = IsoTextures.KENNEY_REQUIRED.every(function(k) { return self.textures.exists(k); });
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

      // Owl walk cycle
      var owl = cutout('knight_owl');
      if (!owl || !IsoTextures.makeWalkCycle(this, 'owl', owl, OWL_H)) {
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

      this.buildTiles();
      this.buildProps();
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
      var self = this;
      var pt = this.wallPoint(t, side, 0.5, this.kenney ? 46 : 30);
      var depth = IsoModel.depthKey(t.gx, t.gy, LAYERS.wall) + 0.5;
      var bracket = this.add.image(pt.x, pt.y + 14, 'torch_bracket').setDepth(depth);
      this.bucketFor(t).push(bracket);
      var glow = this.add.image(pt.x, pt.y - 6, 'glow_warm').setDepth(depth + 0.1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7).setScale(0.8);
      var flame = this.add.sprite(pt.x, pt.y - 10, 'flame_0').setOrigin(0.5, 1).setDepth(depth + 0.2);
      if (!REDUCED_MOTION) {
        flame.play({ key: 'flame', startFrame: Math.floor(hash(t.gx, t.gy) * 3) });
        this.tweens.add({ targets: glow, alpha: 0.95, scale: 1.12, duration: 380 + hash(t.gy, t.gx) * 240, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      this.lightsFor(roomId).push(glow, flame);
    },

    addProp: function(roomId, gx, gy, key, opts) {
      opts = opts || {};
      var p = IsoModel.gridToIso(gx, gy);
      var img = this.add.image(p.x + (opts.dx || 0), p.y + (opts.dy || 0), key)
        .setOrigin(opts.ox !== undefined ? opts.ox : 0.5, opts.oy !== undefined ? opts.oy : 1)
        .setDepth(IsoModel.depthKey(gx, gy, opts.layer !== undefined ? opts.layer : LAYERS.token) + (opts.dz || 0));
      if (opts.scale) img.setScale(opts.scale);
      if (opts.flip) img.setFlipX(true);
      if (opts.alpha !== undefined) img.setAlpha(opts.alpha);
      if (opts.blend) img.setBlendMode(opts.blend);
      (opts.light ? this.lightsFor(roomId) : this.roomSprites[roomId]).push(img);
      return img;
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

        // Floor: lava in the corners of the dragon's lair
        var isLava = room && room.type === 'boss' && ((dx === 0 || dx === 2) && (dy === 0 || dy === 2));
        if (isLava) {
          var lava = self.add.sprite(p.x, p.y, 'lava_0').setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.floor));
          if (!REDUCED_MOTION) lava.play({ key: 'lava', startFrame: (dx + dy) % 3 });
          bucket.push(lava);
        } else {
          var floorKey = 'floor_' + t.variant;
          bucket.push(self.add.image(p.x, p.y, floorKey).setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.floor)));
        }

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
        var floorDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.floor);
        var wallDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.wall);
        var frontDepth = IsoModel.depthKey(t.gx, t.gy, LAYERS.fx) - 0.5;
        var v = Math.floor(hash(t.gx, t.gy, 3) * 3);

        var isLava = room && room.type === 'boss' && ((dx === 0 || dx === 2) && (dy === 0 || dy === 2));
        if (isLava) {
          var lava = self.add.sprite(p.x, p.y, 'lava_0').setDepth(floorDepth);
          if (!REDUCED_MOTION) lava.play({ key: 'lava', startFrame: (dx + dy) % 3 });
          bucket.push(lava);
        } else if (t.kind === 'corridor') {
          bucket.push(self.kTile(self.textures.exists('k_corridor_1') && v === 2 ? 'k_corridor_1' : 'k_corridor', p, floorDepth));
        } else {
          var fk = 'k_floor_' + (self.textures.exists('k_floor_3') ? Math.floor(hash(t.gx, t.gy, 5) * 4) : t.variant);
          if (!self.textures.exists(fk)) fk = 'k_floor_0';
          bucket.push(self.kTile(fk, p, floorDepth));
        }

        function wallKey(side) {
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
          var ring = self.add.image(p.x, p.y + 4, 'portal').setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.floor) + 0.5).setAlpha(0.85);
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
        } else if (type === 'monster') {
          // bones or rubble near the front, a second pile now and then
          self.addProp(rid, seed > 0.5 ? g + 2 : g, h + 2, seed > 0.33 ? 'bones' : 'rubble', { dy: 8, dz: -0.5 });
          if (self.kenney && self.textures.exists('k_barrels')) {
            var bp0 = IsoModel.gridToIso(seed > 0.5 ? g : g + 2, h);
            self.roomSprites[rid].push(self.kTile(seed > 0.75 ? 'k_crates' : 'k_barrels', bp0, IsoModel.depthKey(seed > 0.5 ? g : g + 2, h, LAYERS.token) + 0.2));
          } else if (seed > 0.6) {
            self.addProp(rid, g + 2, h, 'rubble', { dy: 8, dz: -0.5, scale: 0.8 });
          }
        } else if (type === 'treasure') {
          self.addProp(rid, g + 1, h + 1, 'glow_gold', { oy: 0.5, dy: 4, layer: LAYERS.floor, dz: 0.5, blend: Phaser.BlendModes.ADD, alpha: 0.7, light: true });
          self.addProp(rid, g + 2, h, 'gold_pile', { dy: 12 });
          self.addProp(rid, g, h + 2, 'gold_pile', { dy: 12, scale: 0.8 });
        } else if (type === 'boss') {
          self.addProp(rid, g + 1, h + 1, 'glow_lava', { oy: 0.5, dy: 6, layer: LAYERS.floor, dz: 0.5, blend: Phaser.BlendModes.ADD, alpha: 0.8, light: true });
          self.addProp(rid, g + 2, h, 'crystal', { dy: 10, dz: 0.3 });
          self.addProp(rid, g, h + 2, 'crystal', { dy: 10, dz: 0.3, scale: 0.85, flip: true });
          self.addProp(rid, g + 1, h, 'gold_pile', { dy: 12 });
          self.addProp(rid, g, h + 1, 'gold_pile', { dy: 12, scale: 0.85 });
          self.addProp(rid, g + 2, h + 1, 'gold_pile', { dy: 12, scale: 0.9 });
          self.addProp(rid, g + 1, h + 1, 'glow_purple', { oy: 0.5, dy: -30, layer: LAYERS.fx, dz: 0.2, blend: Phaser.BlendModes.ADD, alpha: 0.35, light: true });
        } else {
          // plain chamber: a little set dressing now and then
          if (seed > 0.72) self.addProp(rid, g + 2, h + 2, 'rubble', { dy: 8, dz: -0.5 });
          else if (seed < 0.18) self.addProp(rid, g, h + 2, 'bones', { dy: 8, dz: -0.5 });
        }
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
      var hasFrames = this.textures.exists('owl') && this.textures.get('owl').has('idle');
      this.player = this.add.sprite(0, 0, 'owl', hasFrames ? 'idle' : undefined).setOrigin(0.5, 0.96).setVisible(false);
      this.playerHasWalk = hasFrames && this.anims.exists('owl_walk');
      this.playerBob = null;
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: this.highlight, scaleX: 1.08, scaleY: 1.08, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.startIdle();
      }
    },

    startIdle: function() {
      if (REDUCED_MOTION || this.playerBob) return;
      this.playerBob = this.tweens.add({ targets: this.player, scaleY: 1.03, scaleX: 0.985, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    },

    stopIdle: function() {
      if (this.playerBob) { this.playerBob.stop(); this.playerBob = null; }
      this.player.setScale(1, 1);
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
      var revealed = false;
      Object.keys(model.rooms).forEach(function(rid) {
        var vis = IsoModel.getRoomVisibility(rid);
        if (self.lastVis[rid] !== vis) {
          var wasHidden = self.lastVis[rid] === 'hidden';
          if (self.lastVis[rid] !== undefined) revealed = true;
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
      if (revealed && !immediate) fx('reveal');
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
        self.tokens[rid] = img;
      });
    },

    // --- Player / camera -----------------------------------------------------------

    /**
     * Screen-space offset so the room is centred between the HUD top bar and dock
     */
    hudOffsetY: function() {
      var top = document.querySelector('.hud-top');
      var dock = document.querySelector('.hud-dock');
      var t = top ? top.offsetHeight : 0;
      var d = dock ? dock.offsetHeight : 0;
      return (d - t) / 2;
    },

    focusOn: function(x, y, instant) {
      var cam = this.cameras.main;
      var ty = y + this.hudOffsetY() / cam.zoom;
      if (instant || REDUCED_MOTION) cam.centerOn(x, ty);
      else cam.pan(x, ty, 550, 'Sine.easeInOut', true); // force: replace a pan still in flight
    },

    setCurrentRoom: function(roomId, snapPlayer) {
      var self = this;
      var firstRoom = this.currentRoomId === null;
      this.currentRoomId = roomId;
      var c = IsoModel.getRoomCenter(roomId), p = IsoModel.getRoomCenterPx(roomId);
      if (!c) return;
      this.highlight.setPosition(p.x, p.y).setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.floor) + 0.6).setVisible(true);
      if (snapPlayer || !this.player.visible) {
        this.player.setPosition(p.x, p.y + 12).setVisible(true);
      }
      this.updatePlayerDepth();

      this.reachRings.forEach(function(r) { r.destroy(); });
      this.reachRings = [];
      connectedIds(roomId).forEach(function(rid) {
        var rc = IsoModel.getRoomCenter(rid), rp = IsoModel.getRoomCenterPx(rid);
        if (!rc) return;
        self.reachRings.push(self.add.image(rp.x, rp.y, 'reach_ring').setDepth(IsoModel.depthKey(rc.gx, rc.gy, LAYERS.floor) + 0.6));
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
      this.followOffsetY = this.hudOffsetY();
      this.cameras.main.panEffect.reset();  // the camera follows the owl while walking
      this.stopIdle();
      if (this.playerHasWalk) this.player.play('owl_walk');
      var segments = path.slice(1).map(function(g) { var q = IsoModel.gridToIso(g.gx, g.gy); return { x: q.x, y: q.y + 12 }; });
      var idx = 0;

      function segment() {
        if (idx >= segments.length) {
          self.moving = false;
          self.ghostArchesFor(null);
          if (self.playerHasWalk) { self.player.stop(); self.player.setFrame('idle'); }
          self.startIdle();
          if (onArrive) onArrive();
          return;
        }
        var from = { x: self.player.x, y: self.player.y };
        var to = segments[idx++];
        var g = IsoModel.isoToGrid(to.x, to.y - 12);
        self.ghostArchesFor([IsoModel.isoToGrid(from.x, from.y - 12), g]);
        if (Math.abs(to.x - from.x) > 2) self.player.setFlipX(to.x < from.x);
        var dist = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
        var dur = Math.max(180, dist / WALK_SPEED);
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

      // Follow the owl while it walks between rooms (smoothed)
      if (this.moving && this.player) {
        var tx = this.player.x;
        var ty = this.player.y + this.followOffsetY / cam.zoom;
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
