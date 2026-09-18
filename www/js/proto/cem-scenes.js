/**
 * CemScenes
 * Phaser 3 scenes for the Halloween cemetery level of the isometric
 * prototype: BootScene (procedural art, kit sprites, cutouts) and
 * CemeteryScene (night ground, picket fence, graves, tombs, lantern light and
 * shadows, wandering monsters with procedural motion, walking owl, camera,
 * input). Game logic lives in cem-main.js; the scene renders and reports taps.
 */

var CemScenes = (function() {
  var REDUCED_MOTION = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var TILE_W = 128, TILE_H = 64;
  var LAYERS = { floor: 0, wall: 1, token: 2, fx: 3 };
  var SPRITE_DIR = 'assets/proto/monsters/';
  var OWL_H = 104;
  var OWL3D_H = 118;
  var MONSTER_H = 110;
  var REAPER_H = 170;
  var WALK_SPEED = 0.26;       // px per ms
  var FLOOR_BAND = -300000;
  var POOL_BAND = -200000;
  var SHADOW_BAND = -100000;
  var SEEN_TINT = 0x3d4560;    // remembered but unlit tiles
  var DARK = { r: 0x8c, g: 0x98, b: 0xc2 };   // moonlit, no lantern
  var LIT = { r: 0xff, g: 0xe6, b: 0xc4 };    // next to a lantern
  var CASTERS = {
    owl: { h: 0.9, r: 0.22 },
    monster: { h: 0.9, r: 0.32 },
    boss: { h: 1.5, r: 0.5 },
    grave: { h: 0.55, r: 0.22 },
    tree: { h: 1.6, r: 0.2 },
    statue: { h: 1.3, r: 0.24 },
    bench: { h: 0.35, r: 0.4 },
    pumpkin: { h: 0.25, r: 0.2 },
    rock: { h: 0.3, r: 0.3 },
    tomb_small: { h: 1.4, r: 0.9 },
    tomb_large: { h: 2.2, r: 1.3 }
  };
  var CULL_MS = 200;

  function fx(name, opts) {
    if (typeof FX !== 'undefined' && FX.play) FX.play(name, opts);
  }

  function levelOf(scene) {
    return scene.registry.get('cemLevel');
  }

  function callbacks(scene) {
    return scene.registry.get('cemCallbacks') || {};
  }

  function hash(a, b, c) {
    var h = (a * 73856093) ^ (b * 19349663) ^ ((c || 0) * 83492791);
    h = h >>> 0;
    return (h % 1000) / 1000;
  }

  function lerpTint(k) {
    var r = Math.round(DARK.r + (LIT.r - DARK.r) * k);
    var g = Math.round(DARK.g + (LIT.g - DARK.g) * k);
    var b = Math.round(DARK.b + (LIT.b - DARK.b) * k);
    return (r << 16) | (g << 8) | b;
  }

  /** Ids of the monsters in this level (plus the reaper) */
  function monsterIds(scene) {
    var level = levelOf(scene);
    var ids = {};
    if (level) level.monsters.forEach(function(m) { ids[m.id] = true; });
    ids[CemModel.BOSS_ID] = true;
    return Object.keys(ids);
  }

  // ---------------------------------------------------------------------------
  // BootScene
  // ---------------------------------------------------------------------------
  var BootScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function CemBootScene() {
      Phaser.Scene.call(this, { key: 'CemBoot' });
    },

    preload: function() {
      var self = this;
      this.missing = {};
      this.load.on('loaderror', function(file) { self.missing[file.key] = true; });
      this.load.image('palette_src', 'assets/directions/n_s_e.png');
      this.load.atlas('owl3d', 'assets/proto/iso/owl3d.png', 'assets/proto/iso/owl3d.json');
      CemTextures.loadKit(this);
      monsterIds(this).concat(['knight_owl']).forEach(function(id) {
        self.load.image('cut_' + id, SPRITE_DIR + id + '.png');
      });
    },

    create: function() {
      var self = this;
      var palette = IsoTextures.FALLBACK_PALETTE;
      if (this.textures.exists('palette_src')) {
        palette = IsoTextures.samplePalette(this.textures.get('palette_src').getSourceImage());
      }
      // flame frames, glows, light pool, cast shadow, rings and the dungeon decor come from the shared set
      IsoTextures.generateFallbacks(this, palette, null);
      CemTextures.generate(this);

      function cutout(id) {
        return self.textures.exists('cut_' + id) ? self.textures.get('cut_' + id).getSourceImage() : null;
      }

      var jobs = [];
      monsterIds(this).forEach(function(id) {
        var targetH = id === CemModel.BOSS_ID ? REAPER_H : MONSTER_H;
        var img = cutout(id);
        if (img && IsoTextures.makeStanding(self, 'mon_' + id, img, targetH)) return;
        jobs.push(IsoTextures.loadImage('assets/' + id + '.png').then(function(full) {
          if (!full || !IsoTextures.makeStanding(self, 'mon_' + id, full, targetH)) {
            IsoTextures.makeFallbackToken(self, 'mon_' + id, id.charAt(0).toUpperCase(), '#4a148c', '#b388ff', 96);
          }
        }));
      });

      if (this.textures.exists('owl3d')) {
        ['front', 'back'].forEach(function(facing) {
          if (self.anims.exists('owl3d_walk_' + facing)) return;
          self.anims.create({ key: 'owl3d_walk_' + facing, frameRate: 12, repeat: -1,
            frames: self.anims.generateFrameNames('owl3d', { prefix: facing + '_walk_', start: 0, end: 7 }) });
          self.anims.create({ key: 'owl3d_idle_' + facing, frameRate: 3, repeat: -1,
            frames: self.anims.generateFrameNames('owl3d', { prefix: facing + '_idle_', start: 0, end: 5 }) });
        });
      } else {
        var owl = cutout('knight_owl');
        if (!owl || !IsoTextures.makeWalkCycle(this, 'owl', owl, OWL_H)) {
          jobs.push(IsoTextures.loadImage('assets/knight_owl.png').then(function(full) {
            if (!full || !IsoTextures.makeWalkCycle(self, 'owl', full, OWL_H)) {
              IsoTextures.makeFallbackToken(self, 'owl', 'O', '#006064', '#00bcd4', 96);
            }
          }));
        }
      }

      // Rendered Kenney kit sprites (optional): queue them from the manifest
      var queued = CemTextures.queueKitImages(this);
      var kitDone = new Promise(function(resolve) {
        if (!queued) { resolve(); return; }
        self.load.once('complete', function() { resolve(); });
        self.load.start();
      });
      jobs.push(kitDone);

      Promise.all(jobs).then(function() {
        console.log('CemTextures: ' + (CemTextures.hasKit() ? 'Kenney graveyard kit' : 'procedural stand-ins'));
        self.scene.start('Cemetery');
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CemeteryScene
  // ---------------------------------------------------------------------------
  var CemeteryScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function CemeteryScene() {
      Phaser.Scene.call(this, { key: 'Cemetery' });
    },

    create: function() {
      this.level = levelOf(this);
      this.tileObjs = [];       // tile index -> [game objects] shown when the tile is at least remembered
      this.tileGround = [];     // tile index -> ground image (tinted by light)
      this.tileProps = [];      // tile index -> [prop images] (tinted by light)
      this.tileLights = [];     // tile index -> [game objects] only when fully visible (flames, pools, shadows)
      this.tombObjs = {};       // tomb id -> { sprite, door, lock, glow, objs: [] }
      this.lastVis = [];
      this.monsters = {};       // uid -> state
      this.moving = false;
      this.cancelRequested = false;
      this.inputEnabled = true;
      this.bossRevealed = false;
      this.cullAt = 0;
      for (var i = 0; i < this.level.tiles.length; i++) {
        this.tileObjs.push([]); this.tileProps.push([]); this.tileLights.push([]); this.lastVis.push(-1);
      }
      this.buildGround();
      this.buildFence();
      this.buildProps();
      this.buildTombs();
      this.buildLanterns();
      this.buildShadows();
      this.buildAtmosphere();
      this.createPlayer();
      this.spawnMonsters();
      this.setupCamera();
      this.setupInput();
      this.placeOwl(this.level.owl, true);
      this.refreshVisibility(true);
      var cb = callbacks(this);
      if (cb.onReady) cb.onReady(this);
    },

    // --- Build -----------------------------------------------------------------

    idx: function(gx, gy) {
      return gy * this.level.W + gx;
    },

    /** Position a prop by its floor anchor on a footprint centre */
    placeSprite: function(entry, gx, gy, opts) {
      opts = opts || {};
      var fw = entry.footprint ? entry.footprint.w : 1, fh = entry.footprint ? entry.footprint.h : 1;
      var p = IsoModel.gridToIso(gx + (fw - 1) / 2, gy + (fh - 1) / 2);
      var img = this.add.image(p.x + (opts.dx || 0), p.y + (opts.dy || 0), entry.key)
        .setOrigin(entry.anchor.x, entry.anchor.y);
      var depthTile = { gx: gx + fw - 1, gy: gy + fh - 1 };
      img.setDepth((opts.band || 0) + IsoModel.depthKey(depthTile.gx, depthTile.gy, opts.layer !== undefined ? opts.layer : LAYERS.token) + (opts.dz || 0));
      if (opts.scale) img.setScale(opts.scale);
      if (opts.flip) img.setFlipX(true);
      if (opts.alpha !== undefined) img.setAlpha(opts.alpha);
      return img;
    },

    buildGround: function() {
      var L = this.level;
      for (var i = 0; i < L.tiles.length; i++) {
        var t = L.tiles[i];
        var frame = (t.kind === 'path' || t.kind === 'tomb_door' || t.kind === 'gate') ? 'path_' + (t.variant % 3) : 'grass_' + (t.variant % 4);
        if (t.tombId && t.kind !== 'tomb_door') frame = 'path_2';
        var p = IsoModel.gridToIso(t.gx, t.gy);
        var img = this.add.image(p.x, p.y, 'cem_ground', frame).setOrigin(0.5, 0.5)
          .setDepth(FLOOR_BAND + IsoModel.depthKey(t.gx, t.gy, LAYERS.floor));
        this.tileGround[i] = img;
        this.tileObjs[i].push(img);
      }
    },

    buildFence: function() {
      var L = this.level;
      var seg = CemTextures.sprite(this, 'fence_n');
      var segW = CemTextures.sprite(this, 'fence_w');
      var gate = CemTextures.sprite(this, 'gate_n');
      var post = CemTextures.sprite(this, 'fence_post');
      for (var i = 0; i < L.tiles.length; i++) {
        var t = L.tiles[i];
        if (t.kind !== 'fence' && t.kind !== 'gate') continue;
        var corner = (t.gx === 0 || t.gx === L.W - 1) && (t.gy === 0 || t.gy === L.H - 1);
        var img = null;
        if (corner) {
          if (post) img = this.placeSprite(post, t.gx, t.gy, { layer: LAYERS.wall });
        } else if (t.gy === 0) {
          if (seg) img = this.placeSprite(seg, t.gx, t.gy, { layer: LAYERS.wall });
        } else if (t.gy === L.H - 1) {
          // south fence: the piece sits on the near edge of the border tile (one tile further down)
          var e = t.kind === 'gate' ? gate : seg;
          if (e) img = this.placeSprite(e, t.gx, t.gy + 1, { layer: LAYERS.wall });
        } else if (t.gx === 0) {
          if (segW) img = this.placeSprite(segW, t.gx, t.gy, { layer: LAYERS.wall });
        } else {
          if (segW) img = this.placeSprite(segW, t.gx + 1, t.gy, { layer: LAYERS.wall });
        }
        if (img) { this.tileObjs[i].push(img); this.tileProps[i].push(img); }
      }
    },

    propFor: function(t) {
      switch (t.kind) {
        case 'grave': return { name: 'grave_' + (t.variant % 6), cast: CASTERS.grave };
        case 'tree': return { name: 'tree_' + (t.variant % 4), cast: CASTERS.tree };
        case 'statue': return { name: 'statue_' + (t.variant % 3), cast: CASTERS.statue };
        case 'bench': return { name: 'bench', cast: CASTERS.bench, flip: t.variant === 1 || t.variant === 2 };
        case 'pumpkin': return { name: 'pumpkin_' + (t.variant % 3), cast: CASTERS.pumpkin };
        case 'rock': return { name: 'rock_' + (t.variant % 2), cast: CASTERS.rock };
        default: return null;
      }
    },

    buildProps: function() {
      var L = this.level;
      for (var i = 0; i < L.tiles.length; i++) {
        var t = L.tiles[i];
        if (t.kind === 'web') {
          // a web hangs in the back corner of its tile (on a tree or the fence)
          var p = IsoModel.gridToIso(t.gx, t.gy);
          var web = this.add.image(p.x, p.y - 64, t.variant ? 'cem_web_small' : 'cem_web').setOrigin(0, 0)
            .setAlpha(0.7).setScale(0.75).setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.token) + 0.5);
          if (hash(t.gx, t.gy) < 0.5) { web.setFlipX(true); web.setOrigin(1, 0); }
          this.tileObjs[i].push(web); this.tileProps[i].push(web);
          continue;
        }
        var spec = this.propFor(t);
        if (!spec) continue;
        var entry = CemTextures.sprite(this, spec.name);
        if (!entry) continue;
        var img = this.placeSprite(entry, t.gx, t.gy, { flip: spec.flip });
        img.castSpec = spec.cast;
        this.tileObjs[i].push(img);
        this.tileProps[i].push(img);
        if (t.kind === 'pumpkin' && t.variant > 0) {
          var pp = IsoModel.gridToIso(t.gx, t.gy);
          var glow = this.add.image(pp.x, pp.y - 10, 'glow_warm').setScale(0.45).setAlpha(0.5)
            .setBlendMode(Phaser.BlendModes.ADD).setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.token) + 0.2);
          this.tileObjs[i].push(glow); this.tileLights[i].push(glow);
          if (!REDUCED_MOTION) this.tweens.add({ targets: glow, alpha: 0.75, duration: 900 + hash(t.gy, t.gx) * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
      }
    },

    buildTombs: function() {
      var L = this.level;
      for (var i = 0; i < L.tombs.length; i++) {
        var tomb = L.tombs[i];
        var entry = CemTextures.sprite(this, tomb.size === 'large' ? 'tomb_large' : 'tomb_small');
        var rec = { tomb: tomb, sprite: null, door: null, lock: null, glow: null, objs: [], lit: [] };
        if (entry) {
          rec.sprite = this.placeSprite(entry, tomb.x0, tomb.y0);
          rec.sprite.castSpec = tomb.size === 'large' ? CASTERS.tomb_large : CASTERS.tomb_small;
          rec.objs.push(rec.sprite);
        }
        // door overlay on the door tile: dark opening once opened, chained lock while sealed
        var dp = IsoModel.gridToIso(tomb.door.gx, tomb.door.gy);
        var depth = CemModel.tombDepth(tomb, LAYERS.token) + 0.5;
        rec.door = this.add.image(dp.x, dp.y - 6, 'cem_door_dark').setOrigin(0.5, 1).setScale(0.8).setDepth(depth).setVisible(false);
        rec.glow = this.add.image(dp.x, dp.y - 30, 'glow_purple').setScale(0.7).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth - 0.1);
        rec.lit.push(rec.door, rec.glow);
        if (tomb.size === 'large') {
          rec.lock = this.add.image(dp.x, dp.y - 34, 'cem_lock').setDepth(depth + 0.1);
          rec.lit.push(rec.lock);
        }
        this.tombObjs[tomb.id] = rec;
      }
      this.refreshTombs();
    },

    /** Door state: opened small tombs show the dark doorway, the great tomb loses its lock with the full key */
    refreshTombs: function() {
      var L = this.level;
      for (var id in this.tombObjs) {
        if (!this.tombObjs.hasOwnProperty(id)) continue;
        var rec = this.tombObjs[id];
        var tomb = rec.tomb;
        var guardian = L.monstersByUid[tomb.guardianUid];
        var opened = tomb.size === 'large' ? (L.monstersByUid.boss.defeated || this.bossRevealed) : (!guardian || guardian.defeated);
        rec.doorOpen = opened;
        rec.door.visible = opened && rec.door.cemShown !== false;
        rec.glow.setAlpha(opened ? 0.55 : 0);
        if (rec.lock) { rec.lockOn = !CemModel.hasAllKeyParts(L); rec.lock.visible = rec.lockOn && rec.lock.cemShown !== false; }
      }
    },

    buildLanterns: function() {
      var L = this.level;
      var entry = CemTextures.sprite(this, 'lantern_post');
      for (var i = 0; i < L.tiles.length; i++) {
        var t = L.tiles[i];
        if (t.kind !== 'lantern') continue;
        var p = IsoModel.gridToIso(t.gx, t.gy);
        var flameX = p.x, flameY = p.y - 80;
        if (entry) {
          var img = this.placeSprite(entry, t.gx, t.gy);
          this.tileObjs[i].push(img); this.tileProps[i].push(img);
          if (entry.light) {
            var sc = img.scaleX || 1;
            flameX = img.x + (entry.light.x - entry.anchor.x) * entry.w * sc;
            flameY = img.y + (entry.light.y - entry.anchor.y) * entry.h * sc;
          }
        }
        var depth = IsoModel.depthKey(t.gx, t.gy, LAYERS.token);
        var glow = this.add.image(flameX, flameY - 6, 'glow_warm').setDepth(depth + 0.1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7).setScale(0.8);
        var flame = this.add.sprite(flameX, flameY + 6, 'flame_0').setOrigin(0.5, 0.92).setScale(0.42).setDepth(depth + 0.2);
        var pool = this.add.image(p.x, p.y, 'light_pool').setDepth(POOL_BAND + IsoModel.depthKey(t.gx, t.gy, 0))
          .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5).setScale(1.25).setTint(0xffd9a0);
        if (!REDUCED_MOTION) {
          flame.play({ key: 'flame', startFrame: Math.floor(hash(t.gx, t.gy) * 8) });
          var dur = 380 + hash(t.gy, t.gx) * 240;
          this.tweens.add({ targets: glow, alpha: 0.95, scale: 0.95, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          this.tweens.add({ targets: pool, alpha: 0.65, duration: dur * 1.3, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        this.tileObjs[i].push(glow, flame, pool);
        this.tileLights[i].push(glow, flame, pool);
      }
    },

    placeShadow: function(img, gx, gy, sh, offY) {
      var p = IsoModel.gridToIso(gx, gy);
      p.y += offY || 0;
      img.setPosition(p.x, p.y).setRotation(sh.angle)
        .setScale(sh.length / 100, sh.width / 26)
        .setAlpha(Math.min(1, sh.alpha / 0.6))
        .setDepth(SHADOW_BAND + (gx + gy) * 4 + 0.1);
      return img;
    },

    /** Static lantern shadows of every prop and tomb (shown with the prop's tile) */
    buildShadows: function() {
      var L = this.level;
      var self = this;
      function shadowsFor(gx, gy, caster, sink) {
        for (var li = 0; li < L.lights.length; li++) {
          var sh = IsoModel.castShadow({ gx: gx, gy: gy, height: caster.h, radius: caster.r }, L.lights[li]);
          if (!sh) continue;
          sink.push(self.placeShadow(self.add.image(0, 0, 'cast_shadow').setOrigin(0.12, 0.5), gx, gy, sh));
        }
      }
      for (var i = 0; i < L.tiles.length; i++) {
        var props = this.tileProps[i];
        for (var p = 0; p < props.length; p++) {
          if (!props[p].castSpec) continue;
          var t = L.tiles[i];
          var out = [];
          shadowsFor(t.gx, t.gy, props[p].castSpec, out);
          for (var o = 0; o < out.length; o++) { this.tileObjs[i].push(out[o]); this.tileLights[i].push(out[o]); }
        }
      }
      for (var id in this.tombObjs) {
        if (!this.tombObjs.hasOwnProperty(id) || !this.tombObjs[id].sprite) continue;
        var rec = this.tombObjs[id];
        var out2 = [];
        shadowsFor(rec.tomb.x0 + (rec.tomb.w - 1) / 2, rec.tomb.y0 + (rec.tomb.h - 1) / 2, rec.sprite.castSpec, out2);
        for (var o2 = 0; o2 < out2.length; o2++) rec.lit.push(out2[o2]);
      }
    },

    buildAtmosphere: function() {
      var cam = this.cameras.main;
      this.moonGlow = this.add.image(0, 0, 'cem_moon_glow').setScrollFactor(0).setDepth(-1e6 + 1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8);
      this.moon = this.add.image(0, 0, 'cem_moon').setScrollFactor(0).setDepth(-1e6 + 2).setScale(0.8);
      this.vignette = this.add.image(0, 0, 'cem_vignette').setScrollFactor(0).setDepth(1e6).setAlpha(0.9);
      this.mist = [];
      if (!REDUCED_MOTION) {
        var b = this.level.bounds;
        for (var i = 0; i < 6; i++) {
          var mx = b.x + hash(i, 3) * b.width, my = b.y + 200 + hash(i, 5) * (b.height - 200);
          var m = this.add.image(mx, my, 'cem_mist').setAlpha(0.35 + hash(i, 7) * 0.2).setScale(1.5 + hash(i, 9)).setDepth(SHADOW_BAND + 50000);
          this.tweens.add({ targets: m, x: mx + 220 + hash(i, 11) * 200, duration: 14000 + hash(i, 13) * 8000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          this.mist.push(m);
        }
      }
      this.layoutAtmosphere(cam.width, cam.height);
    },

    layoutAtmosphere: function(w, h) {
      if (!this.moon) return;
      this.moon.setPosition(w - 70, 90);
      this.moonGlow.setPosition(w - 70, 90);
      var s = Math.max(w, h) * 2.4 / 512;
      this.vignette.setScale(s);
      this.vignette.setPosition(w / 2, h / 2);
    },

    // --- Owl ---------------------------------------------------------------------

    createPlayer: function() {
      this.highlight = this.add.image(0, 0, 'highlight_ring').setDepth(0).setVisible(false);
      this.tapRing = this.add.image(0, 0, 'reach_ring').setDepth(0).setVisible(false);
      this.owl3d = this.textures.exists('owl3d') && this.anims.exists('owl3d_walk_front');
      this.owlFacing = 'front';
      if (this.owl3d) {
        var meta = this.textures.get('owl3d').customData.meta || {};
        var pivot = meta.pivot || { x: 0.52, y: 0.91 };
        this.owlScale = OWL3D_H / (meta.figureHeight || 160);
        this.player = this.add.sprite(0, 0, 'owl3d', 'front_idle_0').setOrigin(pivot.x, pivot.y).setScale(this.owlScale).setVisible(false);
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

    faceOwl: function(dx, dy) {
      this.owlFacing = dy >= 0 ? 'front' : 'back';
      this.player.setFlipX(this.owlFacing === 'front' ? dx > 0 : dx < 0);
    },

    updatePlayerDepth: function() {
      var feetY = this.player.y - 12;
      this.player.setDepth((feetY / (TILE_H / 2)) * 4 + LAYERS.token + 1);
    },

    /** Snap the owl sprite onto a tile */
    placeOwl: function(g, instant) {
      var p = IsoModel.gridToIso(g.gx, g.gy);
      this.player.setPosition(p.x, p.y + 12).setVisible(true);
      this.updatePlayerDepth();
      this.highlight.setPosition(p.x, p.y).setDepth(SHADOW_BAND + IsoModel.depthKey(g.gx, g.gy, LAYERS.floor) + 0.6).setVisible(true);
      this.focusOn(p.x, p.y, instant);
    },

    /**
     * Mr Owl's shadows from the two nearest lanterns and his brightness
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
      var lights = this.level.lights;
      var near = lights.map(function(t) {
        var dx = feet.gx - t.gx, dy = feet.gy - t.gy;
        return { t: t, d: dx * dx + dy * dy };
      }).sort(function(a, b) { return a.d - b.d; }).slice(0, shadows.length);
      for (var i = 0; i < shadows.length; i++) {
        var sh = near[i] ? IsoModel.castShadow({ gx: feet.gx, gy: feet.gy, height: CASTERS.owl.h, radius: CASTERS.owl.r }, near[i].t) : null;
        if (!sh) { shadows[i].setVisible(false); continue; }
        this.placeShadow(shadows[i], feet.gx, feet.gy, sh, 12).setVisible(true);
      }
      var fp = IsoModel.gridToIso(feet.gx, feet.gy);
      this.owlContact.setPosition(fp.x, fp.y + 12).setDepth(SHADOW_BAND + (feet.gx + feet.gy) * 4 + 0.2).setVisible(true);
      var lvl = IsoModel.lightLevel(feet.gx, feet.gy, lights);
      var k = 0.55 + 0.45 * lvl;
      var tint = (Math.round(255 * k) << 16) | (Math.round(240 * k) << 8) | Math.round(230 * k);
      if (tint !== this.owlTint) { this.player.setTint(tint); this.owlTint = tint; }
    },

    /**
     * Walk the owl along a tile path. onStep(tile) runs when each tile is
     * reached and may return false to stop; onArrive runs at the end.
     */
    walkTo: function(path, onStep, onArrive) {
      var self = this;
      if (!path || path.length < 2) { if (onArrive) onArrive(); return; }
      var segments = path.slice(1).map(function(g) { var q = IsoModel.gridToIso(g.gx, g.gy); return { x: q.x, y: q.y + 12, g: g }; });
      var idx = 0;
      this.moving = true;
      this.cancelRequested = false;
      this.followOffset = this.hudOffset();
      this.cameras.main.panEffect.reset();
      this.stopIdle();
      if (this.playerHasWalk && !this.owl3d) this.player.play('owl_walk');
      this.tapRing.setVisible(false);

      function finish() {
        self.moving = false;
        if (self.playerHasWalk && !self.owl3d) { self.player.stop(); self.player.setFrame('idle'); }
        self.startIdle();
        var g = IsoModel.isoToGrid(self.player.x, self.player.y - 12);
        var hp = IsoModel.gridToIso(g.gx, g.gy);
        self.highlight.setPosition(hp.x, hp.y).setDepth(SHADOW_BAND + IsoModel.depthKey(g.gx, g.gy, LAYERS.floor) + 0.6);
        if (onArrive) onArrive();
      }

      function segment() {
        if (idx >= segments.length || self.cancelRequested) { finish(); return; }
        var from = { x: self.player.x, y: self.player.y };
        var to = segments[idx++];
        if (self.owl3d) {
          self.faceOwl(to.x - from.x, to.y - from.y);
          self.player.play('owl3d_walk_' + self.owlFacing, true);
        } else if (Math.abs(to.x - from.x) > 2) {
          self.player.setFlipX(to.x < from.x);
        }
        if (REDUCED_MOTION) {
          self.player.setPosition(to.x, to.y);
          self.updatePlayerDepth();
          var goOn = onStep ? onStep(to.g) : true;
          if (goOn === false) { finish(); return; }
          self.time.delayedCall(60, segment);
          return;
        }
        var dist = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
        var dur = Math.max(160, dist / self.walkSpeed());
        fx('step', { volume: 0.6 });
        self.tweens.add({
          targets: self.player, x: to.x, y: to.y, duration: dur, ease: 'Linear',
          onUpdate: function() { self.updatePlayerDepth(); },
          onComplete: function() {
            var goOn = onStep ? onStep(to.g) : true;
            if (goOn === false) { finish(); return; }
            segment();
          }
        });
      }
      segment();
    },

    walkSpeed: function() {
      return WALK_SPEED * (this.speedBoost || 1);
    },

    cancelWalk: function() {
      this.cancelRequested = true;
    },

    /** Knock-back flash when Mr Owl loses a fight */
    owlFlinch: function(onDone) {
      var self = this;
      fx('pushback');
      if (REDUCED_MOTION) { if (onDone) onDone(); return; }
      this.player.setTintFill(0xff6b6b);
      this.tweens.add({
        targets: this.player, x: this.player.x - 10, duration: 90, yoyo: true, repeat: 2,
        onComplete: function() { self.owlTint = null; self.player.clearTint(); if (onDone) onDone(); }
      });
    },

    /**
     * Back to the gate after a loss: a short run for a nearby gate, otherwise
     * the night swallows him and he wakes up at the gate.
     */
    retreatToGate: function(onDone) {
      var self = this;
      var L = this.level;
      var here = IsoModel.isoToGrid(this.player.x, this.player.y - 12);
      var path = CemModel.astar(L, here, L.start, function(tile) { return tile.walk ? 1 : Infinity; });
      if (path.length > 1 && path.length <= 8 && !REDUCED_MOTION) {
        this.speedBoost = 2;
        this.walkTo(path, null, function() { self.speedBoost = 1; self.placeOwl(L.start, false); if (onDone) onDone(); });
        return;
      }
      var cam = this.cameras.main;
      cam.fadeOut(REDUCED_MOTION ? 0 : 260, 5, 6, 10);
      cam.once('camerafadeoutcomplete', function() {
        self.placeOwl(L.start, true);
        cam.fadeIn(REDUCED_MOTION ? 0 : 320, 5, 6, 10);
        if (onDone) onDone();
      });
    },

    // --- Monsters ------------------------------------------------------------------

    spawnMonsters: function() {
      var L = this.level;
      for (var i = 0; i < L.monsters.length; i++) {
        var m = L.monsters[i];
        if (m.defeated) continue;
        if (m.role === 'boss') continue;   // revealed when the great tomb opens
        this.spawnMonster(m);
      }
    },

    spawnMonster: function(m) {
      var key = this.textures.exists('mon_' + m.id) ? 'mon_' + m.id : 'mon_' + CemModel.BOSS_ID;
      var p = IsoModel.gridToIso(m.gx, m.gy);
      var sprite = this.add.sprite(p.x, p.y + 12, key).setOrigin(0.5, 1).setVisible(false);
      var contact = this.add.image(p.x, p.y + 12, 'glow_warm').setTint(0x000000).setScale(0.4, 0.19).setAlpha(0.5).setVisible(false);
      var glow = null;
      if (m.id === 'will_o_wisp' || m.id === 'lost_soul' || m.id === 'ghost' || m.id === 'banshee') {
        glow = this.add.image(p.x, p.y - 40, m.id === 'will_o_wisp' ? 'cem_wisp_glow' : 'glow_cyan').setScale(m.id === 'will_o_wisp' ? 1.6 : 0.7)
          .setAlpha(0.6).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
      }
      var state = {
        m: m, sprite: sprite, contact: contact, glow: glow,
        bx: p.x, by: p.y + 12, gx: m.gx, gy: m.gy,
        motion: CemMonsters.motionOf(m.id), phase: hash(m.gx, m.gy, 17) * Math.PI * 2,
        walking: false, dir: { x: 0, y: 1 }, flip: false,
        actions: { lunge: 0, flinch: 0, appear: 0, exit: 0 }, exitStyle: CemMonsters.exitOf(m.id),
        shown: false, removed: false, tween: null
      };
      this.monsters[m.uid] = state;
      this.setMonsterDepth(state);
      return state;
    },

    setMonsterDepth: function(st) {
      var feetY = st.by - 12;
      st.sprite.setDepth((feetY / (TILE_H / 2)) * 4 + LAYERS.token + 1);
      st.contact.setDepth(SHADOW_BAND + (feetY / (TILE_H / 2)) * 4 + 0.2);
      if (st.glow) st.glow.setDepth(st.sprite.depth - 0.1);
    },

    /** Show monsters standing on lit tiles only */
    refreshMonsters: function() {
      var L = this.level;
      for (var uid in this.monsters) {
        if (!this.monsters.hasOwnProperty(uid)) continue;
        var st = this.monsters[uid];
        if (st.removed) continue;
        var lit = L.vis[this.idx(st.gx, st.gy)] === 2 && !st.m.defeated;
        if (st.actions.exit) lit = true;
        if (lit !== st.shown) {
          st.shown = lit;
          st.sprite.setVisible(lit);
          st.contact.setVisible(lit);
          if (st.glow) st.glow.setVisible(lit);
        }
      }
    },

    /** Slide a monster to its new tile (model already moved it) */
    moveMonster: function(uid, to) {
      var st = this.monsters[uid];
      if (!st || st.removed) return;
      var self = this;
      var q = IsoModel.gridToIso(to.gx, to.gy);
      var dx = q.x - st.bx;
      st.gx = to.gx; st.gy = to.gy;
      if (Math.abs(dx) > 1) st.flip = CemMonsters.facing(dx);
      st.walking = true;
      if (st.tween) st.tween.stop();
      if (REDUCED_MOTION) {
        st.bx = q.x; st.by = q.y + 12; st.walking = false;
        this.setMonsterDepth(st);
        this.refreshMonsters();
        return;
      }
      st.tween = this.tweens.add({
        targets: st, bx: q.x, by: q.y + 12, duration: CemMonsters.walkMs(st.motion), ease: 'Linear',
        onUpdate: function() { self.setMonsterDepth(st); },
        onComplete: function() { st.walking = false; st.tween = null; }
      });
      this.refreshMonsters();
    },

    dirToOwl: function(st) {
      var dx = this.player.x - st.bx, dy = this.player.y - st.by;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: dx / len, y: dy / len };
    },

    /** The monster lunges at Mr Owl, then the callback opens the quiz */
    playAttack: function(uid, onDone) {
      var st = this.monsters[uid];
      if (!st || st.removed) { if (onDone) onDone(); return; }
      var self = this;
      st.dir = this.dirToOwl(st);
      if (st.dir.x < -0.1) st.flip = true; else if (st.dir.x > 0.1) st.flip = false;
      st.shown = true; st.sprite.setVisible(true); st.contact.setVisible(true); if (st.glow) st.glow.setVisible(true);
      if (REDUCED_MOTION) { if (onDone) onDone(); return; }
      st.actions.lunge = this.time.now;
      fx('attack');
      this.time.delayedCall(CemMonsters.ACTIONS.lunge * 0.5, function() { self.cameras.main.shake(140, 0.004); fx('hit', { volume: 0.7 }); });
      this.time.delayedCall(CemMonsters.ACTIONS.lunge + 80, function() { if (onDone) onDone(); });
    },

    /** Flinch, then leave in the monster's own style; sparkles for the loot */
    playDefeat: function(uid, onDone) {
      var st = this.monsters[uid];
      if (!st || st.removed) { if (onDone) onDone(); return; }
      var self = this;
      st.dir = this.dirToOwl(st);
      if (REDUCED_MOTION) { this.removeMonster(uid); if (onDone) onDone(); return; }
      st.actions.flinch = this.time.now;
      fx('hit');
      this.time.delayedCall(CemMonsters.ACTIONS.flinch, function() {
        st.actions.exit = self.time.now;
        if (st.exitStyle === 'vanish' || st.exitStyle === 'fade') fx('creak', { volume: 0.4 });
        self.burst(st.bx, st.by - 40);
        self.time.delayedCall(CemMonsters.ACTIONS.exit + 40, function() {
          self.removeMonster(uid);
          if (onDone) onDone();
        });
      });
    },

    burst: function(x, y) {
      var puff = this.add.image(x, y, 'cem_puff').setScale(0.6).setAlpha(0.8).setDepth(1e5);
      this.tweens.add({ targets: puff, scale: 1.8, alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: function() { puff.destroy(); } });
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2;
        var s = this.add.image(x, y, 'cem_sparkle').setScale(0.6).setDepth(1e5 + 1);
        this.tweens.add({ targets: s, x: x + Math.cos(a) * 46, y: y + Math.sin(a) * 30 - 20, alpha: 0, scale: 0.2, duration: 650 + i * 40, ease: 'Quad.easeOut',
          onComplete: (function(sp) { return function() { sp.destroy(); }; })(s) });
      }
      fx('coins', { volume: 0.6 });
    },

    removeMonster: function(uid) {
      var st = this.monsters[uid];
      if (!st || st.removed) return;
      st.removed = true;
      if (st.tween) st.tween.stop();
      st.sprite.destroy(); st.contact.destroy();
      if (st.glow) st.glow.destroy();
      delete this.monsters[uid];
    },

    /**
     * The great tomb opens: doorway darkens, purple light spills out and the
     * reaper rises on the door tile.
     */
    revealBoss: function(onDone) {
      var L = this.level;
      this.bossRevealed = true;
      this.refreshTombs();
      fx('creak');
      var boss = L.monstersByUid.boss;
      var st = this.monsters.boss || this.spawnMonster(boss);
      var large = null;
      for (var i = 0; i < L.tombs.length; i++) if (L.tombs[i].size === 'large') large = L.tombs[i];
      var dp = IsoModel.gridToIso(large.door.gx, large.door.gy - 0.6);
      st.bx = dp.x; st.by = dp.y + 12;
      st.gx = large.door.gx; st.gy = large.door.gy;
      this.setMonsterDepth(st);
      st.shown = true; st.sprite.setVisible(true); st.contact.setVisible(true);
      st.actions.appear = this.time.now;
      this.focusOn(dp.x, dp.y - 40, false);
      this.time.delayedCall(REDUCED_MOTION ? 0 : CemMonsters.ACTIONS.appear + 200, function() { if (onDone) onDone(); });
    },

    /** Procedural motion of every shown monster */
    updateMonsters: function(time) {
      var t = time / 1000;
      for (var uid in this.monsters) {
        if (!this.monsters.hasOwnProperty(uid)) continue;
        var st = this.monsters[uid];
        if (st.removed || !st.shown) continue;
        var A = CemMonsters.ACTIONS;
        var ev = {
          walking: st.walking, dir: st.dir, exitStyle: st.exitStyle,
          lunge: CemMonsters.progress(st.actions.lunge, time, A.lunge),
          flinch: CemMonsters.progress(st.actions.flinch, time, A.flinch),
          appear: CemMonsters.progress(st.actions.appear, time, A.appear),
          exit: CemMonsters.progress(st.actions.exit, time, A.exit)
        };
        var o = REDUCED_MOTION ? { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, alpha: 1 } : CemMonsters.pose(st.motion, t, st.phase, ev);
        st.sprite.setPosition(st.bx + o.dx, st.by + o.dy).setScale(o.sx, o.sy).setRotation(o.rot).setAlpha(o.alpha).setFlipX(st.flip);
        st.contact.setPosition(st.bx, st.by).setAlpha(0.5 * o.alpha);
        if (st.glow) st.glow.setPosition(st.bx + o.dx, st.by + o.dy - 40).setAlpha(0.6 * o.alpha);
      }
    },

    // --- Visibility, light and culling -------------------------------------------------

    /**
     * Apply the model's visibility to the sprites: hidden tiles draw nothing,
     * remembered tiles are dim and blue, lit tiles take the lantern light.
     */
    refreshVisibility: function() {
      var L = this.level;
      for (var i = 0; i < L.tiles.length; i++) {
        var v = L.vis[i];
        if (v === this.lastVis[i]) continue;
        var t = L.tiles[i];
        var objs = this.tileObjs[i], lights = this.tileLights[i], props = this.tileProps[i];
        var shown = v > 0;
        for (var o = 0; o < objs.length; o++) { objs[o].visible = shown; objs[o].cemShown = shown; }
        if (shown) {
          for (var l = 0; l < lights.length; l++) { lights[l].visible = v === 2; lights[l].cemShown = v === 2; }
          var tint = v === 2 ? lerpTint(IsoModel.lightLevel(t.gx, t.gy, L.lights)) : SEEN_TINT;
          if (this.tileGround[i]) this.tileGround[i].setTint(tint);
          for (var p = 0; p < props.length; p++) props[p].setTint(tint);
        }
        this.lastVis[i] = v;
      }
      for (var id in this.tombObjs) {
        if (!this.tombObjs.hasOwnProperty(id)) continue;
        var rec = this.tombObjs[id];
        var best = 0;
        for (var yy = rec.tomb.y0; yy < rec.tomb.y0 + rec.tomb.h; yy++) {
          for (var xx = rec.tomb.x0; xx < rec.tomb.x0 + rec.tomb.w; xx++) best = Math.max(best, L.vis[this.idx(xx, yy)]);
        }
        best = Math.max(best, L.vis[this.idx(rec.tomb.door.gx, rec.tomb.door.gy)]);
        for (var k = 0; k < rec.objs.length; k++) { rec.objs[k].cemShown = best > 0; rec.objs[k].visible = best > 0; }
        for (var k2 = 0; k2 < rec.lit.length; k2++) { rec.lit[k2].cemShown = best === 2; rec.lit[k2].visible = best === 2; }
        if (rec.sprite) rec.sprite.setTint(best === 2 ? lerpTint(IsoModel.lightLevel(rec.tomb.door.gx, rec.tomb.door.gy, L.lights)) : SEEN_TINT);
      }
      this.refreshTombs();
      this.refreshMonsters();
      this.cull(true);
    },

    /** Hide everything outside the camera (Phaser does not cull images itself) */
    cull: function(force) {
      var now = this.time.now;
      if (!force && now < this.cullAt) return;
      this.cullAt = now + CULL_MS;
      var cam = this.cameras.main;
      var view = cam.worldView;
      var pad = 300;
      var left = view.x - pad, right = view.right + pad, top = view.y - pad, bottom = view.bottom + pad;
      var L = this.level;
      for (var i = 0; i < L.tiles.length; i++) {
        var objs = this.tileObjs[i];
        if (!objs.length) continue;
        var g = this.tileGround[i];
        var inView = g.x > left && g.x < right && g.y > top - 200 && g.y < bottom + 60;
        for (var o = 0; o < objs.length; o++) {
          var obj = objs[o];
          var want = obj.cemShown !== false && inView;
          if (obj.visible !== want) obj.visible = want;
        }
      }
    },

    // --- Camera and input ----------------------------------------------------------

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
      return { x: vw / 2 - (free.left + free.right) / 2, y: vh / 2 - (free.top + free.bottom) / 2 };
    },

    focusOn: function(x, y, instant) {
      var cam = this.cameras.main;
      var off = this.hudOffset();
      var tx = x + off.x / cam.zoom;
      var ty = y + off.y / cam.zoom;
      if (instant || REDUCED_MOTION) cam.centerOn(tx, ty);
      else cam.pan(tx, ty, 550, 'Sine.easeInOut', true);
    },

    setupCamera: function() {
      var self = this;
      var b = this.level.bounds;
      var cam = this.cameras.main;
      cam.setBounds(b.x - 400, b.y - 400, b.width + 800, b.height + 800);
      var w = this.scale.width || 800;
      cam.setZoom(w < 600 ? 0.8 : Math.max(0.65, Math.min(1, w / 1000)));
      this.scale.on('resize', function(size) {
        cam.setSize(size.width, size.height);
        self.layoutAtmosphere(size.width, size.height);
        if (self.player && self.player.visible) self.focusOn(self.player.x, self.player.y - 12, true);
        self.cull(true);
      });
    },

    setInputEnabled: function(enabled) {
      this.inputEnabled = !!enabled;
    },

    /** Brief ring on a tapped tile */
    showTap: function(gx, gy) {
      var p = IsoModel.gridToIso(gx, gy);
      this.tapRing.setPosition(p.x, p.y).setDepth(SHADOW_BAND + IsoModel.depthKey(gx, gy, LAYERS.floor) + 0.7).setAlpha(1).setVisible(true);
      if (this.tapTween) this.tapTween.stop();
      var self = this;
      this.tapTween = this.tweens.add({ targets: this.tapRing, alpha: 0, duration: 900, onComplete: function() { self.tapRing.setVisible(false); } });
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
        self.cull(false);
      });
      this.input.on('pointerup', function(pointer) {
        if (!drag) return;
        var wasPinch = !!pinch;
        var moved = drag.moved;
        drag = null;
        if (self.input.pointer1.isDown || self.input.pointer2.isDown) return;
        pinch = null;
        if (wasPinch || moved > 8 || !self.inputEnabled) return;
        var world = cam.getWorldPoint(pointer.x, pointer.y);
        var g = IsoModel.isoToGrid(world.x, world.y);
        var cb = callbacks(self);
        if (cb.onTileTap) cb.onTileTap(g.gx, g.gy);
      });
      this.input.on('wheel', function(pointer, objects, dx, dy) {
        cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), 0.4, 2));
        self.cull(true);
      });
      this.pinchState = function() { return pinch; };
      this.setPinch = function(v) { pinch = v; };
    },

    update: function(time, delta) {
      var p1 = this.input.pointer1, p2 = this.input.pointer2;
      var cam = this.cameras.main;
      this.updateOwlLighting();
      this.updateMonsters(time);
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
        if (!pinch) this.setPinch({ dist: d, zoom: cam.zoom });
        else cam.setZoom(Phaser.Math.Clamp(pinch.zoom * (d / pinch.dist), 0.4, 2));
      }
      this.cull(false);
    }
  });

  return {
    BootScene: BootScene,
    CemeteryScene: CemeteryScene,
    REDUCED_MOTION: REDUCED_MOTION
  };
})();
