/**
 * IsoScenes
 * Phaser 3 scenes for the isometric prototype: BootScene (textures/tokens)
 * and DungeonScene (tiles, walls, fog of war, tokens, player, camera, input).
 * Game logic lives in iso-main.js; the scene only renders and reports taps.
 */

var IsoScenes = (function() {
  var REDUCED_MOTION = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var TILE_W = 128, TILE_H = 64, WALL_H = 64;
  var LAYERS = { floor: 0, wall: 1, token: 2, fx: 3 };
  var FOG_ALPHA = { hidden: 1, fogged: 0.6, visible: 0 };

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
      this.load.on('loaderror', function(file) {
        // Optional art is allowed to be missing; fallbacks are generated in create()
        self.missing = self.missing || [];
        self.missing.push(file.key);
      });
      this.load.image('palette_src', 'assets/directions/e_w.png');
      Object.keys(IsoTextures.OPTIONAL_FILES).forEach(function(key) {
        self.load.image(key, 'assets/proto/iso/' + IsoTextures.OPTIONAL_FILES[key]);
      });
    },

    create: function() {
      var self = this;
      var palette = IsoTextures.FALLBACK_PALETTE;
      if (this.textures.exists('palette_src')) {
        palette = IsoTextures.samplePalette(this.textures.get('palette_src').getSourceImage());
      }
      IsoTextures.generateFallbacks(this, palette);

      // Tokens for the monsters that actually appear in this dungeon
      var rooms = Dungeon.getState().rooms;
      var ids = {};
      Object.keys(rooms).forEach(function(id) {
        var m = rooms[id].monster;
        if (m && m.id) ids[m.id] = true;
      });
      var jobs = [];
      Object.keys(ids).forEach(function(id) {
        if (id === 'dragon') return;
        jobs.push(IsoTextures.loadImage('assets/' + id + '.png').then(function(img) {
          if (!img || !IsoTextures.makeToken(self, 'tok_' + id, img, 128, '#f44336')) {
            IsoTextures.makeFallbackToken(self, 'tok_' + id, '!', '#b71c1c', '#f44336', 128);
          }
        }));
      });
      jobs.push(IsoTextures.loadImage('assets/dragon.png').then(function(img) {
        if (!img || !IsoTextures.makeToken(self, 'tok_dragon', img, 256, '#9c27b0')) {
          IsoTextures.makeFallbackToken(self, 'tok_dragon', 'D', '#4a148c', '#9c27b0', 256);
        }
      }));
      jobs.push(IsoTextures.loadImage('assets/knight_owl.png').then(function(img) {
        if (!img || !IsoTextures.makeToken(self, 'tok_knight_owl', img, 128, '#00bcd4')) {
          IsoTextures.makeFallbackToken(self, 'tok_knight_owl', 'O', '#006064', '#00bcd4', 128);
        }
      }));

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
      this.roomSprites = {};   // roomId -> [gameObjects]
      this.linkSprites = {};   // linkId -> [gameObjects]
      this.fogOverlays = {};   // roomId|linkId -> Graphics
      this.lastVis = {};
      this.tokens = {};        // roomId -> Image
      this.reachRings = [];
      this.currentRoomId = null;
      this.moving = false;
      this.inputEnabled = true;

      this.buildTiles();
      this.buildFog();
      this.createPlayer();
      this.setupCamera();
      this.setupInput();
      this.refreshFog(true);

      var cb = callbacks(this);
      if (cb.onReady) cb.onReady(this);
    },

    // --- Build ---------------------------------------------------------------

    buildTiles: function() {
      var self = this;
      var model = this.model;

      model.tiles.forEach(function(t) {
        var p = IsoModel.gridToIso(t.gx, t.gy);
        var owner = t.roomId || t.linkId;
        var bucket = t.roomId ? self.roomSprites : self.linkSprites;
        if (!bucket[owner]) bucket[owner] = [];

        var floorKey = t.kind === 'corridor' ? 'corridor' : 'floor_' + t.variant;
        var floor = self.add.image(p.x, p.y, floorKey).setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.floor));
        bucket[owner].push(floor);

        if (t.walls.indexOf('n') !== -1) {
          bucket[owner].push(self.add.image(p.x, p.y, 'wall_n').setOrigin(0.5, 1)
            .setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.wall)));
        }
        if (t.walls.indexOf('w') !== -1) {
          bucket[owner].push(self.add.image(p.x, p.y, 'wall_w').setOrigin(0.5, 1)
            .setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.wall)));
        }
        if (t.walls.indexOf('s') !== -1) {
          bucket[owner].push(self.add.image(p.x, p.y + 14, 'rim_s')
            .setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.wall)));
        }
        if (t.walls.indexOf('e') !== -1) {
          bucket[owner].push(self.add.image(p.x, p.y + 14, 'rim_e')
            .setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.wall)));
        }
      });

      // Portal links: glowing markers on both rooms and a dashed line between them
      model.links.forEach(function(link) {
        if (link.type !== 'portal') return;
        var a = IsoModel.getRoomCenterPx(link.a), b = IsoModel.getRoomCenterPx(link.b);
        if (!a || !b) return;
        var arr = self.linkSprites[link.id] = [];
        var line = self.add.graphics().setDepth(1);
        line.lineStyle(3, 0x9c27b0, 0.6);
        line.beginPath(); line.moveTo(a.x, a.y); line.lineTo(b.x, b.y); line.strokePath();
        arr.push(line);
        [link.a, link.b].forEach(function(rid) {
          var c = IsoModel.getRoomCenter(rid), p = IsoModel.getRoomCenterPx(rid);
          arr.push(self.add.image(p.x, p.y, 'portal').setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.wall)).setAlpha(0.8));
        });
      });
    },

    fogPolygon: function(gx0, gy0, gx1, gy1) {
      var m = 0.35;
      var n = IsoModel.gridToIso(gx0 - m, gy0 - m);
      var e = IsoModel.gridToIso(gx1 + m, gy0 - m);
      var s = IsoModel.gridToIso(gx1 + m, gy1 + m);
      var w = IsoModel.gridToIso(gx0 - m, gy1 + m);
      var up = WALL_H + 8;
      return [
        new Phaser.Geom.Point(n.x, n.y - up),
        new Phaser.Geom.Point(e.x, e.y - up),
        new Phaser.Geom.Point(e.x, e.y),
        new Phaser.Geom.Point(s.x, s.y),
        new Phaser.Geom.Point(w.x, w.y),
        new Phaser.Geom.Point(w.x, w.y - up)
      ];
    },

    buildFog: function() {
      var self = this;
      var model = this.model;
      Object.keys(model.rooms).forEach(function(rid) {
        var r = model.rooms[rid];
        var g = self.add.graphics().setDepth(IsoModel.depthKey(r.gx0 + 2, r.gy0 + 2, LAYERS.fx));
        g.fillStyle(0x000000, 1);
        g.fillPoints(self.fogPolygon(r.gx0, r.gy0, r.gx0 + 2, r.gy0 + 2), true);
        self.fogOverlays[rid] = g;
      });
      model.links.forEach(function(link) {
        if (link.type !== 'corridor' || !link.tile) return;
        var t = link.tile;
        var g = self.add.graphics().setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.fx));
        g.fillStyle(0x000000, 1);
        g.fillPoints(self.fogPolygon(t.gx, t.gy, t.gx, t.gy), true);
        self.fogOverlays[link.id] = g;
      });
    },

    createPlayer: function() {
      this.highlight = this.add.image(0, 0, 'highlight_ring').setDepth(0).setVisible(false);
      this.player = this.add.image(0, 0, 'tok_knight_owl').setDisplaySize(96, 96).setOrigin(0.5, 0.75).setVisible(false);
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: this.highlight, scaleX: 1.08, scaleY: 1.08, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    },

    // --- Fog / tokens --------------------------------------------------------

    setGroupVisible: function(arr, visible) {
      if (!arr) return;
      for (var i = 0; i < arr.length; i++) arr[i].setVisible(visible);
    },

    applyFog: function(id, vis, sprites, immediate, wasHidden) {
      var overlay = this.fogOverlays[id];
      // Hidden areas draw nothing at all (no silhouette that would leak the layout)
      var target = vis === 'hidden' ? 0 : FOG_ALPHA[vis];
      this.setGroupVisible(sprites, vis !== 'hidden');
      if (!overlay) return;
      if (immediate || REDUCED_MOTION) {
        overlay.setAlpha(target);
        return;
      }
      if (wasHidden) overlay.setAlpha(1); // reveal fades in from darkness
      this.tweens.add({ targets: overlay, alpha: target, duration: 400, ease: 'Quad.easeOut' });
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
        case 'entrance': return 'entrance';
        case 'treasure': return 'treasure_chest';
        case 'treasure_open': return 'treasure_open';
        case 'boss': return 'tok_dragon';
        case 'monster':
          return this.textures.exists('tok_' + tok.id) ? 'tok_' + tok.id : 'marker_unknown';
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
        if (existing) { existing.destroy(); delete self.tokens[rid]; }
        if (!key) return;
        var c = IsoModel.getRoomCenter(rid), p = IsoModel.getRoomCenterPx(rid);
        var img = self.add.image(p.x, p.y, key).setDisplaySize(tok.size, tok.size).setOrigin(0.5, 0.7)
          .setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.token));
        img.tokenKey = key;
        self.tokens[rid] = img;
      });
    },

    // --- Player / camera -----------------------------------------------------

    setCurrentRoom: function(roomId, snapPlayer) {
      var self = this;
      this.currentRoomId = roomId;
      var c = IsoModel.getRoomCenter(roomId), p = IsoModel.getRoomCenterPx(roomId);
      if (!c) return;
      this.highlight.setPosition(p.x, p.y).setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.wall)).setVisible(true);
      if (snapPlayer || !this.player.visible) {
        this.player.setPosition(p.x, p.y).setVisible(true);
      }
      this.player.setDepth(IsoModel.depthKey(c.gx, c.gy, LAYERS.token) + 1);

      this.reachRings.forEach(function(r) { r.destroy(); });
      this.reachRings = [];
      connectedIds(roomId).forEach(function(rid) {
        var rc = IsoModel.getRoomCenter(rid), rp = IsoModel.getRoomCenterPx(rid);
        if (!rc) return;
        self.reachRings.push(self.add.image(rp.x, rp.y, 'reach_ring').setDepth(IsoModel.depthKey(rc.gx, rc.gy, LAYERS.wall)));
      });

      if (REDUCED_MOTION) {
        this.cameras.main.centerOn(p.x, p.y);
      } else {
        this.cameras.main.pan(p.x, p.y, 500, 'Sine.easeInOut');
      }
    },

    /**
     * Hop the player token along the corridor to another room, then callback
     */
    movePlayer: function(toId, onArrive) {
      var self = this;
      var fromId = this.currentRoomId;
      var path = IsoModel.pathBetween(fromId, toId);
      if (path.length < 2) path = [IsoModel.getRoomCenter(toId)];

      if (REDUCED_MOTION) {
        var end = IsoModel.getRoomCenterPx(toId);
        this.player.setPosition(end.x, end.y);
        this.time.delayedCall(0, function() { if (onArrive) onArrive(); });
        return;
      }

      this.moving = true;
      var segments = path.slice(1).map(function(g) { return IsoModel.gridToIso(g.gx, g.gy); });
      var idx = 0;

      function hop() {
        if (idx >= segments.length) {
          self.moving = false;
          if (onArrive) onArrive();
          return;
        }
        var from = { x: self.player.x, y: self.player.y };
        var to = segments[idx++];
        var g = IsoModel.isoToGrid(to.x, to.y);
        self.player.setDepth(IsoModel.depthKey(g.gx, g.gy, LAYERS.token) + 1);
        var state = { t: 0 };
        fx('step');
        self.tweens.add({
          targets: state, t: 1, duration: 220, ease: 'Sine.easeInOut',
          onUpdate: function() {
            var t = state.t;
            self.player.x = from.x + (to.x - from.x) * t;
            self.player.y = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 14;
          },
          onComplete: hop
        });
      }
      hop();
    },

    setupCamera: function() {
      var b = IsoModel.getBounds();
      var cam = this.cameras.main;
      cam.setBounds(b.x - 300, b.y - 300, b.width + 600, b.height + 600);
      var w = this.scale.width || 800;
      cam.setZoom(Math.max(0.55, Math.min(1, w / 900)));
      this.scale.on('resize', function(size) {
        cam.setSize(size.width, size.height);
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
        cam.setZoom(Phaser.Math.Clamp(z, 0.45, 2));
      });

      // Pinch zoom handled in update()
      this.pinchState = function() { return pinch; };
      this.setPinch = function(v) { pinch = v; };
    },

    update: function() {
      var p1 = this.input.pointer1, p2 = this.input.pointer2;
      var cam = this.cameras.main;
      if (p1 && p2 && p1.isDown && p2.isDown) {
        var d = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        var pinch = this.pinchState();
        if (!pinch) {
          this.setPinch({ dist: d, zoom: cam.zoom });
        } else {
          cam.setZoom(Phaser.Math.Clamp(pinch.zoom * (d / pinch.dist), 0.45, 2));
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
