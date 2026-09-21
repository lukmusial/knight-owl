/**
 * CemScenes
 * Phaser 3 scenes for the Halloween cemetery level of the isometric
 * prototype: BootScene (procedural art, kit sprites, cutouts) and
 * CemeteryScene (night ground, picket fence, graves, tombs, lantern light and
 * shadows, wandering monsters with procedural motion, walking owl, camera,
 * input). Game logic lives in cem-main.js; the scene renders and reports taps.
 */

var CemScenes = (function() {
  // how fast a monster swings its heading around (radians per second)
  var TURN_RATE = Math.PI * 1.6;
  var FOG_DARK = 0.62;         // how dark the night is away from any light
  var MONSTER_REVEAL_RATE = 2.5;   // a monster's alpha moves toward its reveal at most this much per second
  var GROUND_SPRITE_DEPTH = -250000;   // ground drawn as tile sprites while it is still coming up, under the tomb spills
  var GROUND_SPRITE_GAP = 0.03;        // a tile sprite bridges the ground only when its peak is this far past the chunk's bake
  var FOG_ENABLED = false;     // the moving night is off for now; the remembered-tile tint still applies
  // what the light in a tomb doorway means: waiting, taken, sealed
  var DOOR_LIGHT = { gold: 0xffd08a, blue: 0x7fd8ff, red: 0xff5a46 };
  // how strongly a doorway burns: the light is additive, so these go close to 1
  var DOOR_ALPHA = { waiting: 0.95, taken: 0.75, large: 0.9 };
  var REDUCED_MOTION = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var TILE_W = 128, TILE_H = 64;
  var LAYERS = { floor: 0, wall: 1, token: 2, fx: 3 };
  var SPRITE_DIR = 'assets/proto/monsters/';
  // what the cemetery takes from the dungeon's procedural set (a prefix ending in '_' takes every frame)
  var SHARED_TEXTURES = ['flame_', 'light_pool', 'cast_shadow', 'highlight_ring', 'reach_ring', 'glow_warm', 'glow_cyan', 'glow_purple'];
  var OWL_H = 104;
  var OWL3D_H = 118;
  // monster heights live in CemMonsters (MAP_H, MAP_SCALE, BOSS_H): the sheet
  // shrink tool and the tests read them there; the Reaper's BOSS_H is OWL3D_H * 2

  // how far above the ground a flier hangs, in px: the shadow stays on the floor
  var HOVER_PX = { bat_swarm: 44, will_o_wisp: 30, ghost: 10, lost_soul: 12, banshee: 6 };

  function hoverOf(id) {
    return Object.prototype.hasOwnProperty.call(HOVER_PX, id) ? HOVER_PX[id] : 0;
  }

  function monsterHeight(id, role) {
    return CemMonsters.mapHeight(id, role);
  }
  var FLOOR_BAND = -300000;
  var POOL_BAND = -200000;     // the ground light of a lightning strike; the lantern pools that shared it are baked into the chunks now
  var SHADOW_BAND = -100000;
  var SEEN_TINT = 0x4b5578;    // remembered but unlit tiles
  var STORM_LIT_TINT = 0xf2f6ff;   // props in the light of a lightning strike
  var DARK = { r: 0x9e, g: 0xaa, b: 0xd4 };   // night sky light, no lantern
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

  /** Deterministic 0..1 for a tile; CemRain owns it so the puddles agree with the scene */
  function hash(a, b, c) {
    return CemRain.hash(a, b, c);
  }

  function lerpTint(k) {
    var r = Math.round(DARK.r + (LIT.r - DARK.r) * k);
    var g = Math.round(DARK.g + (LIT.g - DARK.g) * k);
    var b = Math.round(DARK.b + (LIT.b - DARK.b) * k);
    return (r << 16) | (g << 8) | b;
  }

  /** Blend two packed tints: k = 0 gives a, 1 gives b */
  function mixTint(a, b, k) {
    if (k <= 0) return a;
    if (k >= 1) return b;
    var r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * k);
    var g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * k);
    var bb = Math.round((a & 255) + ((b & 255) - (a & 255)) * k);
    return (r << 16) | (g << 8) | bb;
  }

  /** A prop's tint at a tile: remembered blue warming to the lantern light as the reveal factor rises */
  function propTint(level, idx, lit) {
    return mixTint(SEEN_TINT, lerpTint(level.lightMap[idx]), lit);
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
      this.load.atlas('owl3d', 'assets/proto/iso/owl3d.png', 'assets/proto/iso/owl3d.json');
      CemTextures.loadKit(this);
      this.load.json('cem_anim_index', 'assets/proto/iso/monsters/index.json');
      // the cutouts are queued in create, and only for a monster without a rendered sheet
    },

    create: function() {
      var self = this;
      var palette = IsoTextures.DUNGEON_PALETTE;
      // flame frames, glows, light pool, cast shadow and rings come from the shared set; the rest of it is the dungeon's
      IsoTextures.generateFallbacks(this, palette, null, SHARED_TEXTURES);
      CemTextures.generate(this, { fog: FOG_ENABLED });

      var wanted = monsterIds(this);
      var animIndex = this.cache.json.exists('cem_anim_index') ? this.cache.json.get('cem_anim_index') : null;
      var animIds = (animIndex && animIndex.monsters) || [];
      var sheetIds = [], cutIds = [];
      for (var wi = 0; wi < wanted.length; wi++) {
        (animIds.indexOf(wanted[wi]) === -1 ? cutIds : sheetIds).push(wanted[wi]);
      }
      // Rendered sprite sheets for the monsters the index lists; the painted
      // cutout only for the others (it was 2 MB of downloads nobody saw)
      for (var si = 0; si < sheetIds.length; si++) {
        this.load.atlas('anim_' + sheetIds[si], 'assets/proto/iso/monsters/' + sheetIds[si] + '.png',
          'assets/proto/iso/monsters/' + sheetIds[si] + '.json');
      }
      var owlSheet = this.textures.exists('owl3d');
      var cutouts = owlSheet ? cutIds : cutIds.concat(['knight_owl']);
      for (var ci = 0; ci < cutouts.length; ci++) {
        this.load.image('cut_' + cutouts[ci], SPRITE_DIR + cutouts[ci] + '.png');
      }
      // Rendered Kenney kit sprites (optional): queue them from the manifest
      var queued = CemTextures.queueKitImages(this) + sheetIds.length + cutouts.length;
      var loaded = new Promise(function(resolve) {
        if (!queued) { resolve(); return; }
        self.load.once('complete', function() { resolve(); });
        self.load.start();
      });

      function cutout(id) {
        return self.textures.exists('cut_' + id) ? self.textures.get('cut_' + id).getSourceImage() : null;
      }

      loaded.then(function() {
        var jobs = [];
        cutIds.forEach(function(id) {
          var targetH = monsterHeight(id, id === CemModel.BOSS_ID ? 'boss' : 'wander');
          var img = cutout(id);
          if (img && IsoTextures.makeStanding(self, 'mon_' + id, img, targetH)) return;
          jobs.push(IsoTextures.loadImage('assets/' + id + '.jpg').then(function(full) {
            if (!full || !IsoTextures.makeStanding(self, 'mon_' + id, full, targetH)) {
              IsoTextures.makeFallbackToken(self, 'mon_' + id, id.charAt(0).toUpperCase(), '#4a148c', '#b388ff', 96);
            }
          }));
        });

        if (owlSheet) {
          var owlMeta = self.textures.get('owl3d').customData.meta || {};
          var owlClips = owlMeta.clips || { walk: 8, idle: 6 };
          (owlMeta.facings || ['front', 'back']).forEach(function(facing) {
            if (self.anims.exists('owl3d_walk_' + facing)) return;
            self.anims.create({ key: 'owl3d_walk_' + facing, frameRate: 12, repeat: -1,
              frames: self.anims.generateFrameNames('owl3d', { prefix: facing + '_walk_', start: 0, end: (owlClips.walk || 8) - 1 }) });
            self.anims.create({ key: 'owl3d_idle_' + facing, frameRate: 3, repeat: -1,
              frames: self.anims.generateFrameNames('owl3d', { prefix: facing + '_idle_', start: 0, end: (owlClips.idle || 6) - 1 }) });
          });
        } else {
          var owl = cutout('knight_owl');
          if (!owl || !IsoTextures.makeWalkCycle(self, 'owl', owl, OWL_H)) {
            jobs.push(IsoTextures.loadImage('assets/knight_owl.jpg').then(function(full) {
              if (!full || !IsoTextures.makeWalkCycle(self, 'owl', full, OWL_H)) {
                IsoTextures.makeFallbackToken(self, 'owl', 'O', '#006064', '#00bcd4', 96);
              }
            }));
          }
        }
        return Promise.all(jobs);
      }).then(function() {
        // one animation set per monster that has a rendered sheet
        var made = [];
        for (var i = 0; i < wanted.length; i++) {
          var id = wanted[i];
          if (!self.textures.exists('anim_' + id)) continue;
          var meta = self.textures.get('anim_' + id).customData.meta || {};
          var clips = meta.clips || {};
          var facings = meta.facings || ['front', 'back'];
          for (var f = 0; f < facings.length; f++) {
            for (var clip in clips) {
              if (!clips.hasOwnProperty(clip)) continue;
              var key = 'anim_' + id + '_' + clip + '_' + facings[f];
              if (self.anims.exists(key)) continue;
              self.anims.create({
                key: key,
                frames: self.anims.generateFrameNames('anim_' + id, { prefix: facings[f] + '_' + clip + '_', start: 0, end: clips[clip] - 1 }),
                frameRate: clip === 'walk' ? 10 : (clip === 'idle' ? 4 : 12),
                repeat: (clip === 'walk' || clip === 'idle') ? -1 : 0
              });
            }
          }
          made.push(id);
        }
        console.log('CemTextures: ' + (CemTextures.hasKit() ? 'Kenney graveyard kit' : 'procedural stand-ins') +
          (made.length ? ', animated: ' + made.join(', ') : ', still monster art'));
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
      this.monsters = {};       // uid -> state
      this.inputEnabled = true;
      this.bossRevealed = false;
      this.cullAt = 0;
      for (var i = 0; i < this.level.tiles.length; i++) {
        this.tileObjs.push([]); this.tileProps.push([]); this.tileLights.push([]);
      }
      this.world = CemWorld.attach(this, this.level);
      this.world.setBakeFn(this.bakeChunk.bind(this));
      // how far out of the night each tile has come (see CemReveal); the
      // ground bake and every prop, light, tomb and monster read it
      this.reveal = CemReveal.create(this.level, { instant: REDUCED_MOTION });
      this.revealOut = { changed: [] };
      // ground: a chunk is baked with the alpha each tile had at the time
      // (groundBaked); a tile that has come up since is drawn as a tile
      // sprite on top until the chunk is repainted, so the ground never steps
      this.groundBaked = new Float32Array(this.level.tiles.length);
      this.groundPending = {};      // tile index -> true while its sprite may be needed
      this.groundSprites = {};      // tile index -> image
      this.groundFree = [];
      this.buildFence();
      this.buildProps();
      this.buildTombs();
      this.buildLanterns();
      this.buildShadows();
      this.buildFog();
      this.buildAtmosphere();
      this.buildStorm();
      this.createPlayer();
      this.buildRain();
      this.planStorm();                     // the storm follows the rain schedule
      this.spawnMonsters();
      this.setupCamera();
      this.setupInput();
      this.followOffset = this.hudOffset();
      this.walking = false;
      if (this.input.keyboard) {
        var kb = this.input.keyboard;
        this.keys = {
          up: kb.addKey('UP'), down: kb.addKey('DOWN'), left: kb.addKey('LEFT'), right: kb.addKey('RIGHT'),
          w: kb.addKey('W'), a: kb.addKey('A'), s: kb.addKey('S'), d: kb.addKey('D')
        };
      }
      this.placeOwl(this.level.owl, true);
      this.refreshVisibility();
      // repaint the ground twice after boot: the first bakes on a slow
      // device can land before its textures are uploaded and come out blank
      var self2 = this;
      this.time.delayedCall(500, function() { if (self2.world) { self2.world.rebakeAll(); self2.world.update(true); } });
      this.time.delayedCall(2000, function() { if (self2.world) { self2.world.rebakeAll(); self2.world.update(true); } });
      this.perf = (typeof CemPerf !== 'undefined') ? CemPerf.attach(this) : null;
      this.rainT0 = this.time.now;          // the rain clock starts when the scene is ready
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

    /**
     * Paint one 8x8-tile chunk: the ground Mr Owl has seen, tinted by the
     * lanterns, with the prop shadows and warm pools baked on top. Runs when
     * the camera reaches a chunk and again when new ground is revealed.
     */
    bakeChunk: function(rt, chunk, rect) {
      var L = this.level;
      var R = this.reveal;
      var tiles = this.world.chunkTiles(chunk);
      var i, t, idx, ga;
      var baked = this.groundBaked;
      rt.beginDraw();
      for (i = 0; i < tiles.length; i++) {
        idx = tiles[i];
        ga = CemReveal.alphaAt(R, idx);         // the most this tile has ever been revealed
        baked[idx] = ga;
        if (ga <= 0) continue;
        t = L.tiles[idx];
        var frame = (t.kind === 'path' || t.kind === 'tomb_door' || t.kind === 'gate') ? 'path_' + (t.variant % 3) : 'grass_' + (t.variant % 4);
        if (t.tombId && t.kind !== 'tomb_door') frame = 'path_2';
        var p = IsoModel.gridToIso(t.gx, t.gy);
        rt.batchDrawFrame('cem_ground', frame, p.x - rect.left - TILE_W / 2, p.y - rect.top - TILE_H / 2, ga, lerpTint(L.lightMap[idx]));
      }
      // shadows and light pools of everything standing in or near this
      // chunk, stamped in the same batch: one pass per bake, however many
      var stamp = this.bakeStamp;
      var pad = this.world.SHADOW_PAD;
      var r0 = { x0: (chunk % Math.ceil(L.W / this.world.CHUNK)) * this.world.CHUNK, y0: Math.floor(chunk / Math.ceil(L.W / this.world.CHUNK)) * this.world.CHUNK };
      for (var gy = r0.y0 - pad; gy < r0.y0 + this.world.CHUNK + pad; gy++) {
        for (var gx = r0.x0 - pad; gx < r0.x0 + this.world.CHUNK + pad; gx++) {
          var tile = CemModel.tileAt(L, gx, gy);
          if (!tile) continue;
          idx = CemModel.index(L, gx, gy);
          ga = CemReveal.alphaAt(R, idx);
          if (ga <= 0) continue;
          if (tile.kind === 'lantern') {
            var lp = IsoModel.gridToIso(gx, gy);
            stamp.setTexture('light_pool').setOrigin(0.5, 0.5).setScale(1.25).setAngle(0)
              .setAlpha(0.5).setTint(0xffd9a0).setBlendMode(Phaser.BlendModes.ADD);
            rt.batchDraw(stamp, lp.x - rect.left, lp.y - rect.top);
            stamp.setBlendMode(Phaser.BlendModes.NORMAL).clearTint();
          }
          var caster = this.casterFor(tile);
          if (!caster) continue;
          var near = L.nearLights[idx] || [];
          for (var li = 0; li < near.length; li++) {
            var sh = IsoModel.castShadow({ gx: gx, gy: gy, height: caster.h, radius: caster.r }, L.lights[near[li]]);
            if (!sh) continue;
            var sp = IsoModel.gridToIso(gx, gy);
            stamp.setTexture('cast_shadow').setOrigin(0.12, 0.5).setRotation(sh.angle)
              .setScale(sh.length / 100, sh.width / 26).setAlpha(Math.min(1, sh.alpha / 0.6) * ga);
            rt.batchDraw(stamp, sp.x - rect.left, sp.y - rect.top);
          }
        }
      }
      rt.endDraw();
      stamp.setRotation(0).setAlpha(1).setScale(1);
    },

    casterFor: function(tile) {
      switch (tile.kind) {
        case 'grave': return CASTERS.grave;
        case 'tree': return CASTERS.tree;
        case 'statue': return CASTERS.statue;
        case 'bench': return CASTERS.bench;
        case 'pumpkin': return CASTERS.pumpkin;
        case 'rock': return CASTERS.rock;
        case 'lantern': return null;
        default: return tile.tombId && tile.kind !== 'tomb_door' ? null : null;
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
        if (img) { this.tileObjs[i].push(img); this.tileProps[i].push(img); this.world.addProp(img, t.gx, t.gy); }
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
          web.cemBase = 0.7;
          if (hash(t.gx, t.gy) < 0.5) { web.setFlipX(true); web.setOrigin(1, 0); }
          this.tileObjs[i].push(web); this.tileProps[i].push(web);
          this.world.addProp(web, t.gx, t.gy);
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
        this.world.addProp(img, t.gx, t.gy);
        if (t.kind === 'pumpkin' && t.variant > 0) {
          var pp = IsoModel.gridToIso(t.gx, t.gy);
          var glow = this.add.image(pp.x, pp.y - 10, 'glow_warm').setScale(0.45).setAlpha(0.5)
            .setBlendMode(Phaser.BlendModes.ADD).setDepth(IsoModel.depthKey(t.gx, t.gy, LAYERS.token) + 0.2);
          glow.cemBase = 0.5;      // its alpha follows the reveal, so the candle breathes by size instead
          this.tileObjs[i].push(glow); this.tileLights[i].push(glow);
          this.world.addProp(glow, t.gx, t.gy, { light: true });
          if (!REDUCED_MOTION) glow.cemTween = this.tweens.add({ targets: glow, scale: 0.58, duration: 900 + hash(t.gy, t.gx) * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
      }
    },

    buildTombs: function() {
      var L = this.level;
      for (var i = 0; i < L.tombs.length; i++) {
        var tomb = L.tombs[i];
        var entry = CemTextures.sprite(this, tomb.size === 'large' ? 'tomb_large' : 'tomb_small');
        var rec = { tomb: tomb, sprite: null, door: null, lock: null, glow: null, objs: [], lit: [],
          breath: { k: 1 }, glowAlpha: 0 };   // the door light breathes through `breath`; its alpha is set each frame from the reveal
        if (entry) {
          rec.sprite = this.placeSprite(entry, tomb.x0, tomb.y0);
          rec.sprite.castSpec = tomb.size === 'large' ? CASTERS.tomb_large : CASTERS.tomb_small;
          rec.objs.push(rec.sprite);
          this.world.addProp(rec.sprite, tomb.x0 + tomb.w - 1, tomb.y0 + tomb.h - 1);
        }
        // The crypt art has its own arch; the manifest's `portal` says where
        // its sill sits and how big it is. The light is fitted into that arch
        // and the spill on the ground starts on the sill, so both follow the
        // sprite pixel for pixel. Only a crypt with no painted arch gets one
        // drawn on the tile in front.
        var dp = IsoModel.gridToIso(tomb.door.gx, tomb.door.gy);
        var depth = CemModel.tombDepth(tomb, LAYERS.token) + 0.5;
        var spillDepth = SHADOW_BAND + IsoModel.depthKey(tomb.door.gx, tomb.door.gy, 0) + 0.3;
        var portal = entry && entry.portal && rec.sprite ? entry.portal : null;
        rec.door = null;
        if (portal) {
          var sc = rec.sprite.scaleX || 1;
          var sill = {
            x: rec.sprite.x + (portal.x - entry.anchor.x) * entry.w * sc,
            y: rec.sprite.y + (portal.y - entry.anchor.y) * entry.h * sc
          };
          var aw = portal.w * entry.w, ah = portal.h * entry.h;
          var lights = CemTextures.makeDoorLights(this, entry.name || tomb.size, aw, ah);
          rec.glow = this.add.image(sill.x, sill.y, lights.glow.key).setOrigin(lights.glow.ox, lights.glow.oy)
            .setScale(sc).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth + 0.05);
          rec.spill = this.add.image(sill.x, sill.y, lights.spill.key).setOrigin(lights.spill.ox, lights.spill.oy)
            .setScale(sc).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(spillDepth);
          rec.arch = { x: sill.x, y: sill.y - ah * sc * 0.5 };
        } else {
          var wall = { x: dp.x, y: dp.y - 6 };
          var doorH = tomb.size === 'large' ? 86 : 66;
          var doorScale = doorH / 76;
          rec.door = this.add.image(wall.x, wall.y, 'cem_door_dark').setOrigin(0.5, 1)
            .setScale(doorScale).setDepth(depth);
          var fallbackLights = CemTextures.makeDoorLights(this, 'drawn_' + tomb.size, 56 * doorScale, 76 * doorScale);
          rec.glow = this.add.image(wall.x, wall.y, fallbackLights.glow.key).setOrigin(fallbackLights.glow.ox, fallbackLights.glow.oy)
            .setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth + 0.05);
          rec.spill = this.add.image(wall.x, wall.y, fallbackLights.spill.key).setOrigin(fallbackLights.spill.ox, fallbackLights.spill.oy)
            .setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(spillDepth);
          rec.arch = { x: wall.x, y: wall.y - doorH * 0.5 };
          rec.lit.push(rec.door);
          this.world.addProp(rec.door, tomb.door.gx, tomb.door.gy, { light: true });
        }
        rec.lit.push(rec.glow, rec.spill);
        this.world.addProp(rec.glow, tomb.door.gx, tomb.door.gy, { light: true });
        this.world.addProp(rec.spill, tomb.door.gx, tomb.door.gy, { ground: true });   // on the floor, under whoever stands in it
        if (tomb.size === 'large') {
          rec.lock = this.add.image(rec.arch.x, rec.arch.y, 'cem_lock').setDepth(depth + 0.1);
          rec.lit.push(rec.lock);
          this.world.addProp(rec.lock, tomb.door.gx, tomb.door.gy, { light: true });
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
        var beaten = !guardian || guardian.defeated;
        var opened = tomb.size === 'large' ? (L.monstersByUid.boss.defeated || this.bossRevealed || this.bossBeaten) : beaten;
        rec.doorOpen = opened;
        // the opening is part of the wall, so it is always there; what the
        // light does tells you whether you may go in
        if (rec.door) rec.door.visible = rec.door.cemShown !== false;
        // the doorway tells you what is left to do: a small tomb burns yellow
        // while its key part is still inside and blue once you have it; the
        // great tomb glows red until the key is whole, then yellow
        var tint, alpha;
        if (tomb.size === 'large') {
          tint = CemModel.hasAllKeyParts(L) ? DOOR_LIGHT.gold : DOOR_LIGHT.red;
          alpha = DOOR_ALPHA.large;
        } else {
          tint = beaten ? DOOR_LIGHT.blue : DOOR_LIGHT.gold;
          alpha = beaten ? DOOR_ALPHA.taken : DOOR_ALPHA.waiting;
        }
        if (tomb.size === 'large' && this.bossRevealed && !this.bossBeaten) alpha *= 0.4;   // he must read against it
        if (rec.glowTint !== tint) {
          rec.glow.setTint(tint);
          rec.spill.setTint(tint);
          rec.glowTint = tint;
          if (!REDUCED_MOTION) {
            // the light breathes, and the spill on the ground breathes with
            // it; applyTomb multiplies the breath into the alpha each frame
            if (rec.glowTween) rec.glowTween.stop();
            rec.breath.k = 1;
            rec.glowTween = this.tweens.add({
              targets: rec.breath, k: { from: 0.72, to: 1 },
              duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
          }
        }
        rec.glowAlpha = alpha;
        if (rec.lock) { rec.lockOn = !CemModel.hasAllKeyParts(L); rec.lock.visible = rec.lockOn && rec.lock.cemShown !== false; }
        this.applyTomb(rec);
      }
    },

    /**
     * A tomb comes out of the night with the most revealed of its tiles: the
     * crypt and its door light solid as far as he has ever come, the tint
     * warming while he is near.
     */
    applyTomb: function(rec) {
      var L = this.level, R = this.reveal;
      var tomb = rec.tomb;
      var peak = 0, live = 0, idx;
      for (var yy = tomb.y0; yy < tomb.y0 + tomb.h; yy++) {
        for (var xx = tomb.x0; xx < tomb.x0 + tomb.w; xx++) {
          idx = this.idx(xx, yy);
          if (R.peak[idx] > peak) peak = R.peak[idx];
          var f = CemReveal.factor(R, idx);
          if (f > live) live = f;
        }
      }
      var doorIdx = this.idx(tomb.door.gx, tomb.door.gy);
      if (R.peak[doorIdx] > peak) peak = R.peak[doorIdx];
      var fd = CemReveal.factor(R, doorIdx);
      if (fd > live) live = fd;
      var alpha = CemReveal.alphaOf(peak, R.cfg, R.instant);
      var lit = CemReveal.litOf(live, R.cfg, R.instant);
      var shown = alpha > 0;
      var k;
      for (k = 0; k < rec.objs.length; k++) this.world.setPropShown(rec.objs[k], shown);
      for (k = 0; k < rec.lit.length; k++) this.world.setPropShown(rec.lit[k], shown);
      if (rec.lock) rec.lock.visible = !!rec.lockOn && shown && rec.lock.cemShown !== false;
      if (!shown) return;
      if (rec.sprite) rec.sprite.setAlpha(alpha).setTint(propTint(L, doorIdx, lit));
      var breath = REDUCED_MOTION ? 1 : rec.breath.k;
      rec.glow.setAlpha(rec.glowAlpha * breath * alpha);
      rec.spill.setAlpha(rec.glowAlpha * breath * alpha * (REDUCED_MOTION ? 0.8 : 1));
      if (rec.door) rec.door.setAlpha(alpha);
      if (rec.lock) rec.lock.setAlpha(alpha);
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
          this.world.addProp(img, t.gx, t.gy);
          if (entry.light) {
            var sc = img.scaleX || 1;
            flameX = img.x + (entry.light.x - entry.anchor.x) * entry.w * sc;
            flameY = img.y + (entry.light.y - entry.anchor.y) * entry.h * sc;
          }
        }
        var depth = IsoModel.depthKey(t.gx, t.gy, LAYERS.token);
        var glow = this.add.image(flameX, flameY - 6, 'glow_warm').setDepth(depth + 0.1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7).setScale(0.8);
        glow.cemTweened = true;    // a lantern tile is lit from the start; the flicker tween owns this alpha
        var flame = this.add.sprite(flameX, flameY + 6, 'flame_0').setOrigin(0.5, 0.92).setScale(0.42).setDepth(depth + 0.2);
        // the warm floor pool is baked into the ground chunk (bakeChunk), so there is no pool object here
        if (!REDUCED_MOTION) {
          flame.play({ key: 'flame', startFrame: Math.floor(hash(t.gx, t.gy) * 8) });
          var dur = 380 + hash(t.gy, t.gx) * 240;
          glow.cemTween = this.tweens.add({ targets: glow, alpha: 0.95, scale: 0.95, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        this.tileObjs[i].push(glow, flame);
        this.tileLights[i].push(glow, flame);
        this.world.addProp(glow, t.gx, t.gy, { light: true });
        this.world.addProp(flame, t.gx, t.gy, { light: true });
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

    /** Prop and tomb shadows are baked into the ground chunks (see bakeChunk) */
    buildShadows: function() {
      // one reusable sprite is stamped into the chunk textures
      this.bakeStamp = this.make.image({ key: 'cast_shadow', add: false });
    },

    /**
     * Night that follows Mr Owl: a dark sheet over the world with soft holes
     * punched where he and the lanterns are. Ground he has never seen is not
     * drawn at all (the chunk bake skips it), so this only softens the edge
     * between what he remembers and what he can see right now.
     */
    /**
     * The night without any render-to-texture: a big dark square with a soft
     * hole in it rides on Mr Owl (his reveal), and the lanterns and the
     * Reaper add their own light on top as additive glows. Bitmap masks,
     * dynamic-texture erasing and even non-batched erase all failed on an
     * Android WebView; plain sprites with blend modes work everywhere.
     */
    buildFog: function() {
      this.softFog = FOG_ENABLED && this.textures.exists('cem_dark_ring') && this.textures.exists('cem_soft_light');
      if (!this.softFog) return;
      this.fogRing = this.add.image(0, 0, 'cem_dark_ring').setOrigin(0.5, 0.5).setDepth(900000).setAlpha(FOG_DARK);
      this.fogGlows = [];        // additive lights over the dark: lanterns, the Reaper
    },

    /** A pooled additive glow at a world point */
    fogGlow: function(i, wx, wy, tiles, alpha, tint) {
      var g = this.fogGlows[i];
      if (!g) {
        g = this.add.image(0, 0, 'cem_soft_light').setBlendMode(Phaser.BlendModes.ADD).setDepth(900001);
        this.fogGlows[i] = g;
      }
      var rx = (tiles + 0.5) * TILE_W / 2;
      g.setVisible(true).setPosition(wx, wy).setScale(rx * 2 / 256, rx / 128).setAlpha(alpha).setTint(tint);
    },

    /** Move the night with Mr Owl and light the lanterns through it */
    updateFog: function() {
      if (!this.softFog) return;
      var cam = this.cameras.main;
      var view = cam.worldView;
      var L = this.level;
      var o = CemModel.owlPos(L);
      var op = IsoModel.gridToIso(o.x, o.y);
      // the hole is 160 px wide in a 1024 texture; scale it to his sight
      var holeR = (L.cfg.VIS_OWL + 3) * TILE_W / 2;
      var sc = holeR / 160;
      this.fogRing.setPosition(op.x, op.y + 12).setScale(sc);
      var n = 0;
      for (var i = 0; i < L.lights.length; i++) {
        var lp = IsoModel.gridToIso(L.lights[i].gx, L.lights[i].gy);
        if (lp.x < view.x - 400 || lp.x > view.right + 400 || lp.y < view.y - 400 || lp.y > view.bottom + 400) continue;
        this.fogGlow(n++, lp.x, lp.y - 20, L.cfg.VIS_LANTERN + 0.5, 0.42, 0xffd9a8);
      }
      var bossSt = this.monsters.boss;
      if (bossSt && bossSt.shown && !bossSt.removed) {
        this.fogGlow(n++, bossSt.bx, bossSt.by - 30, 2.6, 0.5, 0xc9b8ff);
      }
      for (var j = n; j < this.fogGlows.length; j++) this.fogGlows[j].setVisible(false);
    },

    buildAtmosphere: function() {
      var cam = this.cameras.main;
      // no moon in the sky: it read as a stray disc behind the grounds
      // the fog sheet already frames the view, so the vignette only deepens the corners
      this.vignette = this.add.image(0, 0, 'cem_vignette').setScrollFactor(0).setDepth(1e6).setAlpha(0.3);
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
      if (!this.vignette) return;
      var s = Math.max(w, h) * 2.4 / 512;
      this.vignette.setScale(s);
      this.vignette.setPosition(w / 2, h / 2);
      if (this.stormFlash) {
        // overscaled like the vignette, so the flash still fills the view zoomed out to 0.4
        var side = Math.max(w, h) * 2.6;
        this.stormFlash.setDisplaySize(side, side).setPosition(w / 2, h / 2);
      }
    },

    // --- Thunder and lightning ---------------------------------------------------------

    /**
     * The storm: a seeded schedule (CemStorm) and the objects a strike lights
     * up, made once and hidden between strikes so a strike allocates nothing
     * but its polyline. The timer is a scene TimerEvent, which only counts
     * frames the game loop runs: pausing the game pauses the storm.
     */
    buildStorm: function() {
      var seed = ((this.level.seed || 1) * 2654435761 + 97) >>> 0;
      this.stormSeed = seed;
      this.stormRng = CemModel.makeRng(seed);
      this.storm = null;                  // planned once the rain schedule exists (planStorm)
      this.stormNext = null;
      this.stormStrike = null;
      // the view flash: additive and pale blue-white, so it brightens the scene instead of greying it
      this.stormFlash = this.add.image(0, 0, 'cem_flash').setScrollFactor(0).setDepth(1e6 + 1)
        .setBlendMode(Phaser.BlendModes.ADD).setTint(0xb8ccff).setAlpha(0).setVisible(false);
      // the bolt: a wide, soft additive glow under a thin white core
      this.boltGlow = this.add.graphics().setDepth(1e5 + 40).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
      this.boltCore = this.add.graphics().setDepth(1e5 + 41).setVisible(false);
      // the ground at the foot of the bolt: a pool lying on the floor and a burst of light standing over it
      this.boltGround = this.add.image(0, 0, 'cem_soft_light').setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xcfe0ff).setScale(1.7).setVisible(false);
      this.boltBurst = this.add.image(0, 0, 'glow_cyan').setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xe4eeff).setScale(2.4, 1.6).setDepth(1e5 + 39).setVisible(false);
      this.litProps = [];                 // tile indexes whose props hold a strike's white
      this.stormLit = {};                 // the same as a set, read by applyTile
      this.layoutAtmosphere(this.cameras.main.width, this.cameras.main.height);
    },

    /**
     * Tie the storm to the rain: strikes come from the rain schedule
     * (CemStorm.plan: one announcing strike before each episode, random
     * ones while it rains, none in a dry spell). Called once the rain
     * schedule exists, and again by a harness that has wound the clock.
     * @param {Object} [opts] - overrides of CemStorm.DEFAULTS
     */
    planStorm: function(opts) {
      if (!this.rainSchedule) return;
      this.storm = CemStorm.plan(this.rainSchedule, this.stormSeed, opts);
      this.stormNext = null;
    },

    /** ms on the rain clock, which the storm shares */
    rainElapsed: function() {
      return this.time.now - (this.rainT0 || this.time.now);
    },

    /** No strikes while a card is up, the game is paused or the scene is not taking input */
    stormBlocked: function() {
      if (typeof ProtoCem !== 'undefined' && ProtoCem.isBusy && ProtoCem.isBusy()) return true;
      if (!this.inputEnabled) return true;
      if (this.level && this.level.paused) return true;
      return !!this.stormStrike;
    },

    /**
     * Per frame: when the planned strike is due, fire it, or, blocked, try
     * again in retryMs while its window lasts. One comparison a frame
     * otherwise.
     */
    tickStormSchedule: function() {
      if (!this.storm) return;
      var t = this.rainElapsed();
      if (!this.stormNext) this.stormNext = CemStorm.nextStrike(this.storm, t);
      var next = this.stormNext;
      if (!next || t < next.at) return;
      if (this.stormBlocked()) { this.stormNext = CemStorm.afterBlocked(this.storm, next, t); return; }
      // an announcing strike is far off when anything far off is in view, else wherever it can land
      var struck = (next.kind === 'announce' ? this.strikeLightning({ range: { minDist: 5 } }) : null) || this.strikeLightning();
      if (struck) { this.storm.fired++; struck.kind = next.kind; }
      this.stormNext = CemStorm.nextStrike(this.storm, t);
    },

    /** For the perf overlay */
    stormStats: function() {
      return {
        fired: this.storm ? this.storm.fired : 0,
        striking: !!this.stormStrike,
        schedule: this.storm ? CemStorm.describe(this.storm, this.stormNext, this.rainElapsed()) : 'no rain schedule'
      };
    },

    /**
     * Lightning strikes a lit tile at least two tiles from Mr Owl: the bolt
     * comes down from above the top of the view with a flash on the ground
     * and plays out as a sequence (CemStorm.sequence: a dim leader, the main
     * return stroke, two to four weaker re-strikes down the same channel,
     * 0.8-1.5 s in all) whose brightness flutters on a seeded noise; the
     * whole view lightens with it, nearby props catch the light, the camera
     * shakes on the main stroke and thunder follows it, later the farther
     * away it struck. Under reduced motion there is no flash, no shake and
     * no flicker, only a dim bolt and the sound. Returns the strike record,
     * or null when nothing in sight could be hit.
     * @param {Object} [opts] - { target: {gx, gy}, seed } to replay a strike (harnesses);
     *   { range: { minDist, maxDist } } to pick from a different reach (an announcing strike is far off)
     */
    strikeLightning: function(opts) {
      opts = opts || {};
      if (this.stormStrike) return null;
      var cfg = this.storm ? this.storm.cfg : CemStorm.DEFAULTS;
      var L = this.level;
      var rng = typeof opts.seed === 'number' ? CemModel.makeRng(opts.seed) : this.stormRng;
      var pickCfg = opts.range ? CemStorm.config(opts.range) : cfg;
      var cam = this.cameras.main;
      var view = cam.worldView;
      // no tiles in the top third of the view: the bolt would have no room to fall
      var clear = function(gx, gy) { return IsoModel.gridToIso(gx, gy).y >= view.y + view.height * 0.33; };
      var target = opts.target ? this.stormTargetAt(opts.target) : CemStorm.pickTarget(L, rng, pickCfg, clear);
      if (!target) return null;
      var p = IsoModel.gridToIso(target.gx, target.gy);
      var from = CemStorm.origin(rng, p, view.y, 120);
      var bolt = CemStorm.bolt(rng, from, p, cfg);
      var seq = CemStorm.sequence(rng, cfg);
      var depth = 1e5 + 40;

      this.boltGlow.clear();
      this.drawBolt(this.boltGlow, bolt, 30, 0x5f8cff, 0.35);
      this.drawBolt(this.boltGlow, bolt, 12, 0x9fc4ff, 0.8);
      this.boltCore.clear();
      this.drawBolt(this.boltCore, bolt, 3.5, 0xffffff, 1);
      this.boltGround.setPosition(p.x, p.y).setDepth(POOL_BAND + IsoModel.depthKey(target.gx, target.gy, 0));
      this.boltBurst.setPosition(p.x, p.y - 18).setDepth(depth - 1);

      var strike = { target: target, dist: target.dist, t: 0, from: from, bolt: bolt, seq: seq,
        endMs: seq.endMs, thunderAt: seq.mainAt + CemStorm.thunderDelay(target.dist, cfg) };
      this.stormStrike = strike;
      this.applyStorm(0);
      var self = this;
      if (!REDUCED_MOTION) {
        this.brightenProps(target, cfg.brightenRadius);
        this.time.delayedCall(seq.mainAt, function() {
          if (self.stormStrike === strike) cam.shake(cfg.shakeMs, cfg.shakeStrength);
        });
      }
      this.time.delayedCall(strike.thunderAt, function() {
        fx('thunder', { volume: CemStorm.thunderVolume(target.dist, cfg) });
      });
      return strike;
    },

    /** A strike aimed by the harness: any tile of the level, with its distance from Mr Owl */
    stormTargetAt: function(t) {
      var o = CemModel.owlPos(this.level);
      var gx = Math.max(0, Math.min(this.level.W - 1, t.gx)), gy = Math.max(0, Math.min(this.level.H - 1, t.gy));
      return { gx: gx, gy: gy, dist: Math.sqrt((gx - o.x) * (gx - o.x) + (gy - o.y) * (gy - o.y)) };
    },

    drawBolt: function(g, bolt, width, color, alpha) {
      g.lineStyle(width, color, alpha);
      this.strokePolyline(g, bolt.main);
      g.lineStyle(width * 0.6, color, alpha);
      for (var b = 0; b < bolt.branches.length; b++) this.strokePolyline(g, bolt.branches[b]);
    },

    strokePolyline: function(g, pts) {
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
      g.strokePath();
    },

    /** The bolt at a core brightness and a glow brightness (the glow outlasts the core) */
    setBoltAlpha: function(core, glow) {
      if (glow === undefined) glow = core;
      this.boltCore.setAlpha(core).setVisible(core > 0);
      this.boltGlow.setAlpha(glow).setVisible(glow > 0);
      this.boltGround.setAlpha(glow * 0.9).setVisible(glow > 0);
      this.boltBurst.setAlpha(core).setVisible(core > 0);
    },

    /**
     * Props near the strike take a cold white tint until the bolt is gone:
     * those on tiles the reveal shows at all (a strike lights up what he
     * remembers as much as what he sees). The tile goes in stormLit so the
     * reveal, moving with him during the strike, leaves the white alone.
     */
    brightenProps: function(target, radius) {
      var tiles = CemStorm.litTiles(this.level, target, radius);
      for (var i = 0; i < tiles.length; i++) {
        var idx = tiles[i];
        if (CemReveal.alphaAt(this.reveal, idx) <= 0) continue;
        var props = this.tileProps[idx];
        if (!props.length) continue;
        for (var p = 0; p < props.length; p++) props[p].setTint(STORM_LIT_TINT);
        this.litProps.push(idx);
        this.stormLit[idx] = true;
      }
    },

    /** Put the reveal's tint back on the props a strike lit */
    restoreProps: function() {
      for (var i = 0; i < this.litProps.length; i++) {
        var idx = this.litProps[i];
        delete this.stormLit[idx];
        this.applyTile(idx);
      }
      this.litProps.length = 0;
    },

    /** Per frame while a strike is in progress: advance its clock, show that moment, tidy up at the end */
    tickStorm: function(delta) {
      var s = this.stormStrike;
      s.t += delta;
      if (s.t >= s.endMs) { this.endStrike(); return; }
      this.applyStorm(s.t);
    },

    /** Show the strike as it is `t` ms in: the fluttering core, the lingering glow and the view flash */
    applyStorm: function(t) {
      var s = this.stormStrike;
      var cfg = this.storm ? this.storm.cfg : CemStorm.DEFAULTS;
      if (REDUCED_MOTION) { this.setBoltAlpha(t < s.seq.totalMs ? 0.35 : 0); return; }
      this.setBoltAlpha(CemStorm.coreAlpha(s.seq, t, cfg), CemStorm.glowAlpha(s.seq, t, cfg));
      var f = CemStorm.flashAlpha(s.seq, t, cfg);
      this.stormFlash.setAlpha(f).setVisible(f > 0);
    },

    endStrike: function() {
      this.setBoltAlpha(0);
      this.stormFlash.setAlpha(0).setVisible(false);
      this.restoreProps();
      this.stormStrike = null;
    },

    // --- Rain and puddles ------------------------------------------------------------
    //
    // CemRain (cem-rain.js) decides when it rains (a seeded schedule of
    // episodes), which lane tiles collect a puddle and how wet each one is.
    // Here: a screen-space particle emitter of slanted streaks (one texture,
    // one draw), puddle images on the floor layer (under whoever stands in
    // them, culled with their cell, hidden with the fog), each with its own
    // small canvas texture into which the mirror image of whatever stands
    // near it is composited on the CPU (props once, Mr Owl and the monsters
    // at a reduced rate while they move), a pool of droplet rings, and
    // splash rings and drops when Mr Owl steps through one.

    buildRain: function() {
      var L = this.level;
      var cfg = CemRain.CFG;
      this.puddles = [];                          // { spec, img, tex, refl, statics, alpha, lit, wet, revealAt, depth, x, y, liveKey, wobbleUntil, reflOffset, hasRefl }
      this.puddleByTile = new Array(L.tiles.length);
      this.puddleTexN = 0;
      this.rings = [];                            // live rings: { img, t0, dur, from, to, alpha }
      this.ringPool = [];
      this.drops = [];                            // live splash droplets
      this.dropPool = [];
      this.rainSchedule = CemRain.schedule(L.seed || 1);
      this.rainStrength = 0;
      this.rainStarted = false;
      this.splashAt = -1e9;
      this.liveAt = 0;
      this.rainZoom = 0;
      this.rainEmitter = null;
      this.owlPuddle = null;                      // the puddle Mr Owl stands in, if any
      this.reflStats = { bakes: 0, bakeMs: 0, composes: 0 };
      if (!REDUCED_MOTION) {
        var v = CemRain.rainVelocity();
        this.rainZone = new Phaser.Geom.Rectangle(0, -40, 100, 1);
        this.rainEmitter = this.add.particles(0, 0, 'cem_rain_streak', {
          speedX: v.vx, speedY: v.vy, rotate: v.rotation * 180 / Math.PI,
          lifespan: cfg.RAIN_LIFE_MS, frequency: 1000, quantity: 1,
          alpha: { min: 0.3, max: 0.65 }, scaleY: { min: 0.7, max: 1.3 }, scaleX: 1,
          maxAliveParticles: Math.round(cfg.RAIN_ALIVE * 1.25),
          emitZone: { type: 'random', source: this.rainZone },
          emitting: false
        }).setScrollFactor(0).setDepth(950000);
        this.layoutRain();
      }
      this.owlTileIdx = -1;
      this.layPuddlesAround(CemModel.owlPos(L));
    },

    /**
     * The streaks spawn along a line above the top of the screen and fall
     * for as long as the screen is tall. Screen-space objects still zoom
     * with the camera, so the line and the fall stretch by 1/zoom.
     */
    layoutRain: function() {
      if (!this.rainEmitter) return;
      var cam = this.cameras.main;
      var z = cam.zoom || 1;
      this.rainZoom = z;
      var w = cam.width / z, h = cam.height / z;
      var v = CemRain.rainVelocity();
      var lifeMs = (h + 120) / v.vy * 1000;
      var drift = v.vx * lifeMs / 1000;
      var left = cam.width / 2 - w / 2 - drift, top = cam.height / 2 - h / 2 - 60;
      this.rainZone.setTo(left, top, w + drift, 1);
      this.rainEmitter.lifespan = lifeMs;
      this.rainLife = lifeMs;
      this.setRainStrength(this.rainStrength, true);
    },

    /** How hard it rains: the emitter's spawn rate follows, and it stops in a gap */
    setRainStrength: function(k, force) {
      if (k === this.rainStrength && !force) return;
      this.rainStrength = k;
      if (!this.rainEmitter) return;
      if (k <= 0.001) {
        if (this.rainStarted) { this.rainEmitter.stop(); this.rainStarted = false; }
        return;
      }
      var perSec = CemRain.rainRate(k, { RAIN_ALIVE: CemRain.CFG.RAIN_ALIVE, RAIN_LIFE_MS: this.rainLife || CemRain.CFG.RAIN_LIFE_MS });
      this.rainEmitter.frequency = 1000 / Math.max(0.5, perSec);
      if (!this.rainStarted) { this.rainEmitter.start(); this.rainStarted = true; }
    },

    /**
     * Puddles on the seen lane tiles around Mr Owl (PUDDLE_REACH), each on
     * the floor layer of its tile. Runs when he changes tile, so the ground
     * he walks is the ground that gets wet. The lanterns reveal their
     * surroundings from the start, so laying puddles on every seen tile
     * would spend the cap far from him. Once the cap is reached, the puddle
     * farthest away (and off screen) is moved to the new tile.
     */
    layPuddlesAround: function(o) {
      if (!this.puddles) return;
      var L = this.level;
      var cfg = CemRain.CFG;
      var around = CemRain.tilesAround(L, o.gx, o.gy, cfg.PUDDLE_REACH);
      var fresh = [];
      for (var i = 0; i < around.length; i++) if (!this.puddleByTile[around[i]]) fresh.push(around[i]);
      var specs = CemRain.planPuddles(L, fresh, 0);
      var view = this.cameras.main.worldView;
      for (var s = 0; s < specs.length; s++) {
        var spec = specs[s];
        var pd;
        if (this.puddles.length < cfg.MAX_PUDDLES) {
          var parts = CemTextures.puddleParts(0);
          var tex = this.textures.createCanvas('cem_puddle_tex_' + (this.puddleTexN++), parts.w, parts.h);
          var refl = document.createElement('canvas');
          refl.width = parts.w; refl.height = parts.h;
          var img = this.add.image(0, 0, tex.key).setAlpha(0);
          pd = { spec: null, img: img, tex: tex, refl: refl, statics: [], alpha: 0, lit: 0, wet: 0, revealAt: 0, depth: 0, x: 0, y: 0,
            liveKey: '', wobbleUntil: 0, reflOffset: 0, hasRefl: false };
          this.puddles.push(pd);
          this.placePuddle(pd, spec, true);
        } else {
          var k = CemRain.farthestPuddle(this.puddles, o.gx, o.gy, cfg.RECYCLE_DIST);
          if (k === -1) break;
          pd = this.puddles[k];
          if (pd.x > view.x - 80 && pd.x < view.right + 80 && pd.y > view.y - 60 && pd.y < view.bottom + 60) break;   // never while it is on screen
          this.puddleByTile[pd.spec.index] = undefined;
          this.placePuddle(pd, spec, false);
        }
        pd.revealAt = this.time.now;
        this.showPuddle(pd, CemReveal.alphaAt(this.reveal, spec.index), CemReveal.litAt(this.reveal, spec.index));
      }
    },

    /** Put a puddle record on its tile: size, position, depth, cull cell, and the mirror of what stands around it */
    placePuddle: function(pd, spec, isNew) {
      var p = IsoModel.gridToIso(spec.gx, spec.gy);
      var depth = SHADOW_BAND + IsoModel.depthKey(spec.gx, spec.gy, 0) - 1000;   // under the door spills
      pd.img.setPosition(p.x + spec.dx, p.y + spec.dy).setScale(spec.scale).setFlipX(spec.flip).setAlpha(0).setDepth(depth);
      if (isNew) this.world.addProp(pd.img, spec.gx, spec.gy, { ground: true });
      else this.world.moveProp(pd.img, spec.gx, spec.gy);
      pd.spec = spec; pd.depth = depth; pd.x = pd.img.x; pd.y = pd.img.y; pd.wet = 0;
      pd.liveKey = ''; pd.wobbleUntil = 0; pd.reflOffset = 0;
      this.puddleByTile[spec.index] = pd;
      pd.statics = this.reflectStatics(pd);
      this.bakeReflection(pd, null);
    },

    /**
     * The reveal of one puddle: `alpha` is how far its tile has ever come out
     * of the night (0 hides it), `lit` how warm its tint is now (remembered
     * blue -> lantern light). updateRain multiplies its water by both.
     */
    showPuddle: function(pd, alpha, lit) {
      pd.alpha = alpha;
      pd.lit = lit;
      this.world.setPropShown(pd.img, alpha > 0);
      if (alpha > 0) pd.img.setTint(propTint(this.level, pd.spec.index, lit));
    },

    // --- Reflections ------------------------------------------------------------------
    //
    // Every puddle owns a small canvas texture (the size of the puddle
    // picture). Its mirror image is built with Canvas 2D compositing, which
    // works on every WebView: whatever stands near enough that its picture,
    // flipped about the line it stands on, reaches the water is drawn
    // upside down into a reflection canvas, clipped to the water's shape
    // (destination-in), darkened and blued (source-atop); lantern glows go
    // on top of that as light. The puddle texture is then the base water,
    // the reflection and the sheen, in that order. Props and tombs are
    // gathered once when the puddle is laid; Mr Owl and the monsters are
    // added whenever they move near it, at LIVE_MS.

    /** The line a thing stands on, for the mirror: props keep their floor anchor, figures were placed 12 px below their tile */
    groundOf: function(o) {
      return typeof o.cemGroundY === 'number' ? o.cemGroundY : o.y;
    },

    reflectHits: function(o, ground, pd) {
      if (!o.frame || !o.frame.source) return false;
      var r = CemRain.mirrorRect(o, ground);
      return CemRain.rectHitsPuddle(r, pd.x, pd.y, pd.spec.scale, CemTextures.PUDDLE_W, CemTextures.PUDDLE_H);
    },

    /** Props, fence, lanterns (with their glow) and tombs whose mirror image reaches this puddle */
    reflectStatics: function(pd) {
      var L = this.level;
      var out = [];
      var gx = pd.spec.gx, gy = pd.spec.gy;
      // a picture hung below its feet reaches puddles further down the
      // screen: tiles up to 7 diagonal rows behind and 2 columns aside
      for (var dy = -6; dy <= 2; dy++) {
        for (var dx = -6; dx <= 2; dx++) {
          if (dx + dy < -7 || dx + dy > 1 || Math.abs(dx - dy) > 3) continue;
          var t = CemModel.tileAt(L, gx + dx, gy + dy);
          if (!t) continue;
          var i = CemModel.index(L, gx + dx, gy + dy);
          var props = this.tileProps[i], lights = this.tileLights[i];
          for (var a = 0; a < props.length; a++) {
            if (this.reflectHits(props[a], props[a].y, pd)) out.push({ o: props[a], ground: props[a].y, light: false });
          }
          for (var b = 0; b < lights.length; b++) {
            var g = lights[b];
            if (g.texture && g.texture.key === 'glow_warm' && this.reflectHits(g, g.y + 40, pd)) out.push({ o: g, ground: g.y + 40, light: true });
          }
        }
      }
      for (var id in this.tombObjs) {
        if (!this.tombObjs.hasOwnProperty(id)) continue;
        var sp = this.tombObjs[id].sprite;
        if (sp && this.reflectHits(sp, sp.y, pd)) out.push({ o: sp, ground: sp.y, light: false });
      }
      return out;
    },

    /**
     * Draw a Phaser image's current frame upside down about its ground line,
     * in the puddle's own picture space (the context is already transformed
     * into it). Trimmed atlas frames keep their offset; flipX is honoured.
     */
    drawMirrored: function(ctx, o, ground) {
      var f = o.frame;
      var src = f.source.image;
      if (!src) return;
      var sx = o.scaleX, sy = o.scaleY;
      var rw = f.realWidth, rh = f.realHeight;
      var left = o.x - rw * sx * o.originX;
      var top = o.y - rh * sy * o.originY;
      ctx.save();
      ctx.translate(left + (o.flipX ? rw * sx : 0), 2 * ground - top);
      ctx.scale(o.flipX ? -sx : sx, -sy);
      ctx.drawImage(src, f.cutX, f.cutY, f.cutWidth, f.cutHeight, f.x, f.y, f.cutWidth, f.cutHeight);
      ctx.restore();
    },

    /** The context of a puddle's reflection canvas, transformed into its picture space (world -> puddle local) */
    enterPuddleSpace: function(ctx, pd) {
      var s = pd.spec.scale;
      ctx.save();
      ctx.translate(CemTextures.PUDDLE_W / 2, CemTextures.PUDDLE_H / 2);
      ctx.scale(pd.spec.flip ? -1 / s : 1 / s, 1 / s);
      ctx.translate(-pd.x, -pd.y);
    },

    /**
     * Rebuild a puddle's mirror image from its statics plus `movers`
     * ([{ o, ground }] or null), then recompose its texture.
     */
    bakeReflection: function(pd, movers) {
      var t0 = this.perf ? performance.now() : 0;
      var cfg = CemRain.CFG;
      var parts = CemTextures.puddleParts(pd.spec.variant);
      var ctx = pd.refl.getContext('2d');
      var W = parts.w, H = parts.h;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      var drew = false, lights = false, i;
      this.enterPuddleSpace(ctx, pd);
      for (i = 0; i < pd.statics.length; i++) {
        var st = pd.statics[i];
        if (st.light) { lights = true; continue; }
        if (st.o.visible === false && st.o.cemShown === false) continue;   // still in the dark
        this.drawMirrored(ctx, st.o, st.ground);
        drew = true;
      }
      if (movers) {
        for (i = 0; i < movers.length; i++) { this.drawMirrored(ctx, movers[i].o, movers[i].ground); drew = true; }
      }
      ctx.restore();
      if (drew) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(parts.mask, 0, 0);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = cfg.REFLECTION_TINT;
        ctx.fillRect(0, 0, W, H);
      }
      if (lights) {
        // lantern light lies on the water as light, not as a darkened picture
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.55;
        this.enterPuddleSpace(ctx, pd);
        for (i = 0; i < pd.statics.length; i++) {
          if (pd.statics[i].light && pd.statics[i].o.cemShown !== false) this.drawMirrored(ctx, pd.statics[i].o, pd.statics[i].ground);
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(parts.mask, 0, 0);
        drew = true;
      }
      ctx.globalCompositeOperation = 'source-over';
      pd.hasRefl = drew;
      this.composePuddle(pd);
      this.reflStats.bakes++;
      if (this.perf) this.reflStats.bakeMs += performance.now() - t0;
    },

    /** The puddle's texture: base water, the mirror image (swaying by reflOffset), the sheen on top */
    composePuddle: function(pd) {
      var parts = CemTextures.puddleParts(pd.spec.variant);
      var ctx = pd.tex.getContext();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, parts.w, parts.h);
      ctx.drawImage(parts.base, 0, 0);
      if (pd.hasRefl) {
        ctx.globalAlpha = CemRain.CFG.REFLECTION_ALPHA;
        ctx.drawImage(pd.refl, 0, pd.reflOffset);
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(parts.sheen, 0, 0);
      pd.tex.refresh();
      this.reflStats.composes++;
    },

    /**
     * Mr Owl and the monsters in the water: every LIVE_MS, each puddle in
     * view is given the movers whose mirror image reaches it, and is redrawn
     * only when that set, their frames or their places have changed since
     * its last bake, or while a ring makes it sway.
     */
    updateLiveReflections: function(now) {
      var movers = [];
      if (this.player && this.player.visible) movers.push({ o: this.player, ground: this.player.y - 12 });
      for (var uid in this.monsters) {
        if (!this.monsters.hasOwnProperty(uid)) continue;
        var st = this.monsters[uid];
        if (st.removed || !st.shown) continue;
        movers.push({ o: st.sprite, ground: st.by - 12 });
      }
      var view = this.cameras.main.worldView;
      var wob = CemRain.CFG.WOBBLE_PX;
      var budget = CemRain.CFG.BAKES_PER_TICK;
      var n = this.puddles.length;
      // start where the last tick left off, so a puddle that had to wait goes first
      var first = this.liveCursor || 0;
      for (var step = 0; step < n; step++) {
        var i = (first + step) % n;
        var pd = this.puddles[i];
        if (!pd.img.visible || pd.wet <= 0.02) continue;
        if (pd.x < view.x - 80 || pd.x > view.right + 80 || pd.y < view.y - 60 || pd.y > view.bottom + 60) continue;
        var hits = null, key = '';
        for (var m = 0; m < movers.length; m++) {
          var mv = movers[m];
          var o = mv.o;
          if (Math.abs(o.x - pd.x) > 220 || pd.y - mv.ground < -40 || pd.y - mv.ground > 260) continue;
          if (!this.reflectHits(o, mv.ground, pd)) continue;
          (hits || (hits = [])).push(mv);
          key += (o.x | 0) + ',' + (o.y | 0) + ',' + o.frame.name + ',' + (o.flipX ? 1 : 0) + ',' + (o.scaleX * 100 | 0) + ';';
        }
        var recompose = false;
        if (pd.wobbleUntil > now) { pd.reflOffset = Math.sin(now / 45) * wob; recompose = true; }
        else if (pd.reflOffset !== 0) { pd.reflOffset = 0; recompose = true; }
        if (key !== pd.liveKey) {
          if (budget <= 0) { this.liveCursor = i; return; }   // its turn comes next tick
          budget--;
          pd.liveKey = key;
          this.bakeReflection(pd, hits);
        } else if (recompose && pd.hasRefl) this.composePuddle(pd);
      }
      this.liveCursor = 0;
    },

    /** How full the puddle under Mr Owl is; 0 when he is not in one */
    owlPuddleFill: function() {
      return this.owlPuddle && this.owlPuddle.alpha > 0 ? this.owlPuddle.wet : 0;
    },

    /** A pooled ring or droplet image */
    poolTake: function(pool, key) {
      var img = pool.pop();
      if (!img) {
        img = this.add.image(0, 0, key).setVisible(false);
        img.cemPooled = true;
      }
      return img;
    },

    /**
     * A ring spreading on the water at a world point; `size` is its full
     * scale (the picture is 64 px wide), `dur` its life. Rings lie on the
     * floor layer with the puddles, just above the puddle's own texture and
     * under everything that stands.
     */
    spawnRing: function(x, y, size, dur, alpha, depth, key) {
      if (this.rings.length >= CemRain.CFG.RING_CAP) return null;
      var img = this.poolTake(this.ringPool, 'cem_drop_ring');
      if (!img.cemInFloor) { this.world.floorLayer.add(img); img.cemInFloor = true; }
      img.setTexture(key || 'cem_drop_ring').setPosition(x, y).setScale(size * 0.15).setAlpha(alpha).setDepth(depth).setVisible(true);
      var ring = { img: img, t0: this.time.now, dur: dur, from: size * 0.15, to: size, alpha: alpha };
      this.rings.push(ring);
      this.ringsSpawned = (this.ringsSpawned || 0) + 1;
      return ring;
    },

    /** The bright dot where a drop hit: pops and is gone in PLIP_MS, as bright as the water it hit (a dim puddle on remembered ground gets a dim plip) */
    spawnPlip: function(x, y, depth, alpha) {
      if (this.rings.length >= CemRain.CFG.RING_CAP) return null;
      if (alpha === undefined) alpha = 1;
      var img = this.poolTake(this.ringPool, 'cem_droplet');
      if (!img.cemInFloor) { this.world.floorLayer.add(img); img.cemInFloor = true; }
      img.setTexture('cem_droplet').setPosition(x, y - 1).setScale(0.25).setAlpha(alpha).setDepth(depth + 0.01).setVisible(true);
      var plip = { img: img, t0: this.time.now, dur: CemRain.CFG.PLIP_MS, from: 0.25, to: 0.5, alpha: alpha };
      this.rings.push(plip);
      return plip;
    },

    /**
     * Drops hitting one puddle: `n` impacts, each a plip and a ring at a
     * point inside the water, and the mirror image sways.
     */
    puddleImpacts: function(pd, n, now) {
      var cfg = CemRain.CFG;
      var sc = pd.spec.scale;
      for (var k = 0; k < n; k++) {
        var a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random());
        var x = pd.x + Math.cos(a) * rr * 36 * sc, y = pd.y + Math.sin(a) * rr * 16 * sc;
        // the small native ring (16 px wide) grows to 12-19 px
        this.spawnRing(x, y, (0.75 + Math.random() * 0.45), cfg.RING_MS, 0.85 * pd.img.alpha, pd.depth + 0.5, 'cem_plip_ring');
        this.spawnPlip(x, y, pd.depth + 0.5, pd.img.alpha);
      }
      pd.wobbleUntil = now + cfg.RING_MS;
    },

    /** Water flung up from a step: it rises, falls back and is gone */
    spawnDrop: function(x, y, o) {
      if (this.drops.length >= 24) return;
      var img = this.poolTake(this.dropPool, 'cem_droplet');
      this.world.placeDynamic(img, o.gx, o.gy);
      img.setPosition(x, y).setScale(0.6 + Math.random() * 0.6).setAlpha(0.9).setDepth(this.player.depth + 1).setVisible(true);
      this.drops.push({ img: img, x: x, y: y, vx: (Math.random() - 0.5) * 170, vy: -120 - Math.random() * 140, t0: this.time.now, dur: 380 + Math.random() * 160, floor: y });
    },

    /**
     * Mr Owl's foot comes down in a puddle: bigger rings, a few drops and a
     * wet step. Called from the step beat of syncOwl; returns true when it
     * played, so the dry footstep stays quiet.
     */
    splashStep: function(o) {
      var fill = this.owlPuddleFill();
      if (fill < 0.2) return false;
      if (!CemRain.splashDue(this.time.now, this.splashAt)) return true;
      this.splashAt = this.time.now;
      fx('splash', { volume: 0.35 + 0.35 * fill });
      if (REDUCED_MOTION) return true;
      var x = this.player.x, y = this.player.y;
      var depth = this.owlPuddle.depth + 0.5;
      this.owlPuddle.wobbleUntil = this.time.now + 700;
      this.spawnRing(x, y, 1.1, 620, 0.75 * fill, depth);
      this.spawnRing(x + (Math.random() - 0.5) * 16, y + (Math.random() - 0.5) * 6, 0.7, 500, 0.6 * fill, depth);
      var n = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) this.spawnDrop(x + (Math.random() - 0.5) * 20, y - 2, o);
      return true;
    },

    /** Everything wet, once a frame: the schedule, the puddles filling and drying, reflections, rings and drops */
    updateRain: function(time, delta) {
      if (!this.puddles) return;
      var cfg = CemRain.CFG;
      var now = this.time.now;
      var elapsed = now - (this.rainT0 || now);
      var dt = Math.min(delta || 16, 100);
      var L = this.level;
      var cam = this.cameras.main;
      var i, pd;

      // the rain itself follows the schedule
      if (this.rainEmitter && cam.zoom !== this.rainZoom) this.layoutRain();
      this.setRainStrength(CemRain.strengthAt(this.rainSchedule, elapsed), false);

      // the puddles fill while it rains and dry out after
      var visiblePuddles = 0;
      var view = cam.worldView;
      for (i = 0; i < this.puddles.length; i++) {
        pd = this.puddles[i];
        if (pd.alpha <= 0) continue;
        var wet = CemRain.wetnessAt(this.rainSchedule, pd.spec, elapsed);
        var reveal = pd.revealAt ? Math.min(1, (now - pd.revealAt) / 900) : 1;
        pd.wet = wet;
        pd.img.setAlpha(wet * reveal * pd.alpha * (0.6 + 0.4 * pd.lit));
        if (pd.lit > 0.5 && wet > 0.02 && pd.x > view.x - 80 && pd.x < view.right + 80 && pd.y > view.y - 60 && pd.y < view.bottom + 60) visiblePuddles++;
      }

      // which puddle Mr Owl stands in; a new tile gets its surroundings wet
      var o = CemModel.owlPos(L);
      var oi = CemModel.index(L, o.gx, o.gy);
      if (oi !== this.owlTileIdx) { this.owlTileIdx = oi; this.layPuddlesAround(o); }
      this.owlPuddle = this.puddleByTile[oi] || null;

      // the mirror images of whatever moves
      if (now >= this.liveAt) { this.liveAt = now + cfg.LIVE_MS; this.updateLiveReflections(now); }
      if (REDUCED_MOTION) return;

      // the rain hits the water: every wet puddle in view takes RING_RATE
      // drops a second at full strength, each a plip and a ring
      if (this.rainStrength > 0.02) {
        for (i = 0; i < this.puddles.length; i++) {
          pd = this.puddles[i];
          if (!pd.img.visible || pd.img.alpha < 0.2) continue;
          if (pd.x < view.x || pd.x > view.right || pd.y < view.y || pd.y > view.bottom) continue;
          var hits = CemRain.impactsDue(Math.random(), dt, this.rainStrength);
          if (hits) this.puddleImpacts(pd, hits, now);
        }
      }

      // rings spread and fade
      for (i = this.rings.length - 1; i >= 0; i--) {
        var ring = this.rings[i];
        var k = (now - ring.t0) / ring.dur;
        if (k >= 1) {
          ring.img.setVisible(false);
          this.ringPool.push(ring.img);
          this.rings[i] = this.rings[this.rings.length - 1];
          this.rings.pop();
          continue;
        }
        var e = 1 - (1 - k) * (1 - k);
        ring.img.setScale(ring.from + (ring.to - ring.from) * e).setAlpha(ring.alpha * (1 - k * k));
      }

      // drops fly up and fall back
      for (i = this.drops.length - 1; i >= 0; i--) {
        var d = this.drops[i];
        var kd = (now - d.t0) / d.dur;
        if (kd >= 1) {
          d.img.setVisible(false);
          this.world.removeDynamic(d.img);
          this.dropPool.push(d.img);
          this.drops[i] = this.drops[this.drops.length - 1];
          this.drops.pop();
          continue;
        }
        var s = dt / 1000;
        d.vy += 700 * s;
        d.x += d.vx * s; d.y += d.vy * s;
        if (d.y > d.floor) d.y = d.floor;
        d.img.setPosition(d.x, d.y).setAlpha(0.9 * (1 - kd * kd));
      }
    },

    /** For the perf overlay and the harnesses */
    rainStats: function() {
      var elapsed = this.time.now - (this.rainT0 || this.time.now);
      var rs = this.reflStats || { bakes: 0, bakeMs: 0, composes: 0 };
      return {
        streaks: this.rainEmitter ? this.rainEmitter.getAliveParticleCount() : 0,
        puddles: this.puddles ? this.puddles.length : 0,
        rings: this.rings ? this.rings.length : 0,
        ringsSpawned: this.ringsSpawned || 0,
        drops: this.drops ? this.drops.length : 0,
        strength: this.rainStrength,
        bakes: rs.bakes, bakeMs: rs.bakeMs, composes: rs.composes,
        schedule: this.rainSchedule ? CemRain.describe(this.rainSchedule, elapsed) : ''
      };
    },

    // --- Owl ---------------------------------------------------------------------

    createPlayer: function() {
      this.highlight = this.add.image(0, 0, 'highlight_ring').setDepth(0).setVisible(false);
      this.tapRing = this.add.image(0, 0, 'reach_ring').setDepth(0).setVisible(false);
      var owlSheet = this.textures.exists('owl3d') ? (this.textures.get('owl3d').customData.meta || {}) : null;
      this.owlFacings = (owlSheet && owlSheet.facings) || ['front', 'back'];
      this.owl3d = !!owlSheet && this.anims.exists('owl3d_walk_' + this.owlFacings[0]);
      this.owlFacing = this.owlFacings[0];
      if (this.owl3d) {
        var meta = owlSheet;
        var pivot = meta.pivot || { x: 0.52, y: 0.91 };
        this.owlScale = OWL3D_H / (meta.figureHeight || 160);
        this.player = this.add.sprite(0, 0, 'owl3d', this.owlFacing + '_idle_0').setOrigin(pivot.x, pivot.y).setScale(this.owlScale).setVisible(false);
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
      // Mr Owl carries his own light: a warm pool that travels with him, so the
      // ground he walks on is lit and not merely uncovered
      this.owlPool = this.add.image(0, 0, 'light_pool').setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.42).setScale(1.5).setTint(0xffd9a0).setDepth(-99000).setVisible(false);
      this.owlLamp = this.add.image(0, 0, 'glow_warm').setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.35).setScale(0.8).setTint(0xffe2b0).setDepth(-98999).setVisible(false);
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: this.owlPool, alpha: 0.5, scale: 1.62, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
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
     * Point Mr Owl along a grid direction. Eight screen directions come out
     * of the five rendered facings, three of them mirrored.
     */
    faceOwl: function(gx, gy) {
      var f = CemMonsters.facingFor(gx, gy, this.owlFacings);
      this.owlFacing = f.facing;
      this.player.setFlipX(f.flip);
    },

    updatePlayerDepth: function() {
      var feetY = this.player.y - 12;
      this.player.setDepth((feetY / (TILE_H / 2)) * 4 + LAYERS.token + 1);
      if (this.world) {
        var o = CemModel.owlPos(this.level);
        this.world.placeDynamic(this.player, o.gx, o.gy);
        this.world.placeDynamic(this.owlContact, o.gx, o.gy);
        for (var i = 0; i < this.owlShadows.length; i++) this.world.placeDynamic(this.owlShadows[i], o.gx, o.gy);
      }
    },

    /** Snap the owl sprite onto a tile (respawn, teleport, boot) */
    placeOwl: function(g, instant) {
      var p = IsoModel.gridToIso(g.gx, g.gy);
      this.player.setPosition(p.x, p.y + 12).setVisible(true);
      this.updatePlayerDepth();
      this.highlight.setVisible(false);
      this.focusOn(p.x, p.y, instant);
    },

    /**
     * Put the sprite where the model says Mr Owl is, every frame. Walking
     * animation and facing come from his velocity.
     */
    syncOwl: function(vx, vy) {
      var o = CemModel.owlPos(this.level);
      var p = IsoModel.gridToIso(o.x, o.y);
      this.player.setPosition(p.x, p.y + 12);
      this.updatePlayerDepth();
      var moving = (vx * vx + vy * vy) > 0.0025;
      if (moving) {
        this.faceOwl(vx, vy);
        if (this.owl3d) this.player.play('owl3d_walk_' + this.owlFacing, true);
        else if (this.playerHasWalk && !this.walking) this.player.play('owl_walk');
        if (!this.walking) { this.stopIdle(); this.walking = true; }
        this.stepAt = this.stepAt || 0;
        if (this.time.now > this.stepAt) {
          if (!this.splashStep(o)) fx('step', { volume: 0.5 });
          this.stepAt = this.time.now + 330;
        }
      } else if (this.walking) {
        this.walking = false;
        if (!this.owl3d && this.playerHasWalk) { this.player.stop(); this.player.setFrame('idle'); }
        this.startIdle();
      }
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
        if (this.owlPool) this.owlPool.setVisible(false);
        if (this.owlLamp) this.owlLamp.setVisible(false);
        return;
      }
      var feet = IsoModel.isoToGridExact(this.player.x, this.player.y - 12);
      var L = this.level;
      var lights = L.lights;
      // the two nearest lanterns come from the cached map, no per-frame scan
      var tileIdx = CemModel.index(L, Math.max(0, Math.min(L.W - 1, Math.round(feet.gx))), Math.max(0, Math.min(L.H - 1, Math.round(feet.gy))));
      var nearIdx = (L.nearLights && L.nearLights[tileIdx]) || [];
      var near = [];
      for (var ni = 0; ni < nearIdx.length && ni < shadows.length; ni++) near.push({ t: lights[nearIdx[ni]] });
      for (var i = 0; i < shadows.length; i++) {
        var sh = near[i] ? IsoModel.castShadow({ gx: feet.gx, gy: feet.gy, height: CASTERS.owl.h, radius: CASTERS.owl.r }, near[i].t) : null;
        if (!sh) { shadows[i].setVisible(false); continue; }
        this.placeShadow(shadows[i], feet.gx, feet.gy, sh, 12).setVisible(true);
      }
      var fp = IsoModel.gridToIso(feet.gx, feet.gy);
      this.owlContact.setPosition(fp.x, fp.y + 12).setDepth(SHADOW_BAND + (feet.gx + feet.gy) * 4 + 0.2).setVisible(true);
      this.owlPool.setPosition(fp.x, fp.y + 10).setVisible(true);
      this.owlLamp.setPosition(fp.x, fp.y - 26).setVisible(true);
      var lvl = (L.lightMap && L.lightMap[tileIdx] !== undefined) ? L.lightMap[tileIdx] : IsoModel.lightLevel(feet.gx, feet.gy, lights);
      var k = 0.55 + 0.45 * lvl;
      var tint = (Math.round(255 * k) << 16) | (Math.round(240 * k) << 8) | Math.round(230 * k);
      if (tint !== this.owlTint) { this.player.setTint(tint); this.owlTint = tint; }
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
      var cam = this.cameras.main;
      cam.fadeOut(REDUCED_MOTION ? 0 : 260, 5, 6, 10);
      cam.once('camerafadeoutcomplete', function() {
        self.placeOwl(CemModel.owlTile(L), true);
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
      var animated = this.textures.exists('anim_' + m.id);
      var key = animated ? 'anim_' + m.id : (this.textures.exists('mon_' + m.id) ? 'mon_' + m.id : 'mon_' + CemModel.BOSS_ID);
      var p = IsoModel.gridToIso(m.gx, m.gy);
      var sprite;
      var animScale = 1;
      var sheetFacings = null;
      if (animated) {
        var meta = this.textures.get(key).customData.meta || {};
        var pivot = meta.pivot || { x: 0.5, y: 0.95 };
        animScale = monsterHeight(m.id, m.role) / (meta.figureHeight || 120);
        sheetFacings = meta.facings || ['front', 'back'];
        sprite = this.add.sprite(p.x, p.y + 12, key, sheetFacings[0] + '_idle_0').setOrigin(pivot.x, pivot.y).setScale(animScale).setVisible(false);
      } else {
        sprite = this.add.sprite(p.x, p.y + 12, key).setOrigin(0.5, 1).setVisible(false);
      }
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
        // grid heading: where it is pointing now, and where it wants to point
        gdir: { x: 1, y: 1 }, gdirTo: { x: 1, y: 1 }, facings: sheetFacings,
        actions: { lunge: 0, flinch: 0, appear: 0, exit: 0 }, exitStyle: CemMonsters.exitOf(m.id),
        shown: false, removed: false, tween: null, reveal: 0, revealTarget: 0,
        anim: animated, animScale: animScale, lastClip: null, lastFacing: null
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
      if (this.world) {
        this.world.placeDynamic(st.sprite, st.gx, st.gy);
        this.world.placeDynamic(st.contact, st.gx, st.gy);
        if (st.glow) this.world.placeDynamic(st.glow, st.gx, st.gy);
      }
    },

    /**
     * How far a monster has come out of the dark: the reveal factor of the
     * tile it stands on, so it fades up as Mr Owl approaches instead of
     * popping in at a fixed distance. The Reaper once risen, and anything on
     * its way out, stays fully shown.
     */
    monsterReveal: function(st) {
      if (st.keepShown || st.actions.exit) return 1;
      if (st.m.defeated) return 0;
      var L = this.level, R = this.reveal;
      // from where the figure is drawn, not the tile it is walking to, and
      // from Mr Owl's float position: continuous in both
      var g = IsoModel.isoToGridExact(st.bx, st.by - 12);
      var o = CemModel.owlPos(L);
      var tx = Math.max(0, Math.min(L.W - 1, Math.round(g.gx)));
      var ty = Math.max(0, Math.min(L.H - 1, Math.round(g.gy)));
      var nearIdx = (L.nearLights && L.nearLights[this.idx(tx, ty)]) || [];
      var near = st.nearLights || (st.nearLights = []);
      near.length = 0;
      for (var i = 0; i < nearIdx.length; i++) near.push(L.lights[nearIdx[i]]);
      return CemReveal.pointFactor(R, o.x, o.y, g.gx, g.gy, near);
    },

    /** Show the monsters that are at least a little revealed, hide the rest */
    refreshMonsters: function(dtMs) {
      for (var uid in this.monsters) {
        if (!this.monsters.hasOwnProperty(uid)) continue;
        var st = this.monsters[uid];
        if (st.removed) continue;
        this.showMonster(st, this.monsterReveal(st), dtMs);
      }
    },

    /**
     * Ease a monster's shown alpha toward its reveal: the target is already
     * continuous in space, the rate keeps a spawn, a respawn or a snapped
     * step from ever jumping.
     */
    showMonster: function(st, target, dtMs) {
      st.revealTarget = target;
      var snap = REDUCED_MOTION || st.keepShown || st.actions.exit || st.reveal === undefined;
      st.reveal = snap ? target : CemReveal.approach(st.reveal, target, MONSTER_REVEAL_RATE, dtMs || 16, false);
      var reveal = st.reveal;
      var lit = reveal > 0;
      if (lit !== st.shown) {
        st.shown = lit;
        this.world.setActive(st.sprite, lit);    // also pauses its animation while the dark hides it; back on before it fades in
        st.contact.setVisible(lit);
        if (st.glow) st.glow.setVisible(lit);
      }
    },

    /**
     * Walk a monster to its new tile (the model already moved it). The slide
     * lasts as long as the monster's own step, so it never stands still
     * between tiles, and the heading is a target the figure turns toward
     * rather than a jump.
     */
    moveMonster: function(uid, to, stepMs) {
      var st = this.monsters[uid];
      if (!st || st.removed) return;
      var self = this;
      var q = IsoModel.gridToIso(to.gx, to.gy);
      var dx = q.x - st.bx, dy = q.y + 12 - st.by;
      var gdx = to.gx - st.gx, gdy = to.gy - st.gy;
      st.gx = to.gx; st.gy = to.gy;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      st.dir = { x: dx / len, y: dy / len };
      var glen = Math.sqrt(gdx * gdx + gdy * gdy);
      if (glen > 0) st.gdirTo = { x: gdx / glen, y: gdy / glen };
      if (!st.anim && Math.abs(dx) > 1) st.flip = CemMonsters.facing(dx);
      st.walking = true;
      if (st.tween) st.tween.stop();
      if (REDUCED_MOTION) {
        st.bx = q.x; st.by = q.y + 12; st.walking = false;
        st.gdir = { x: st.gdirTo.x, y: st.gdirTo.y };
        this.setMonsterDepth(st);
        this.refreshMonsters();
        return;
      }
      var cross = Math.max(CemMonsters.walkMs(st.motion), Math.min(stepMs || 0, 1600));
      st.tween = this.tweens.add({
        targets: st, bx: q.x, by: q.y + 12, duration: cross, ease: 'Linear',
        onUpdate: function() { self.setMonsterDepth(st); },
        onComplete: function() { st.walking = false; st.tween = null; }
      });
      this.refreshMonsters();
    },

    /** Turn a monster's heading toward where it is going, a little each frame */
    turnMonster: function(st, deltaMs) {
      var want = st.gdirTo || st.gdir;
      var a = Math.atan2(st.gdir.y, st.gdir.x);
      var b = Math.atan2(want.y, want.x);
      var diff = b - a;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      var step = TURN_RATE * (deltaMs / 1000);
      if (Math.abs(diff) <= step) a = b;
      else a += diff > 0 ? step : -step;
      st.gdir = { x: Math.cos(a), y: Math.sin(a) };
    },

    dirToOwl: function(st) {
      var dx = this.player.x - st.bx, dy = this.player.y - st.by;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: dx / len, y: dy / len };
    },

    /** The same direction in grid units, for picking the facing */
    gridDirToOwl: function(st) {
      var o = CemModel.owlPos(this.level);
      var dx = o.x - st.gx, dy = o.y - st.gy;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: dx / len, y: dy / len };
    },

    /** The monster lunges at Mr Owl, then the callback opens the quiz */
    playAttack: function(uid, onDone) {
      var st = this.monsters[uid];
      if (!st || st.removed) { if (onDone) onDone(); return; }
      var self = this;
      st.dir = this.dirToOwl(st);
      st.gdirTo = this.gridDirToOwl(st);
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
      st.gdirTo = this.gridDirToOwl(st);
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
      if (this.world) {
        this.world.removeDynamic(st.sprite);
        this.world.removeDynamic(st.contact);
        if (st.glow) this.world.removeDynamic(st.glow);
      }
      st.sprite.destroy(); st.contact.destroy();
      if (st.glow) st.glow.destroy();
      delete this.monsters[uid];
    },

    /**
     * The great tomb opens: doorway darkens, purple light spills out and the
     * reaper rises on the door tile.
     */
    /**
     * The Grim Reaper appears in the great tomb's doorway. With `smoke` he
     * comes out in a burst of puffs; called again once he stands there, it
     * only turns the camera to him.
     */
    revealBoss: function(onDone, smoke) {
      var L = this.level;
      var standing = this.bossRevealed && this.monsters.boss && !this.monsters.boss.removed;
      if (standing) {
        var stb = this.monsters.boss;
        this.focusOn(stb.bx, stb.by - 40, false);
        this.time.delayedCall(REDUCED_MOTION ? 0 : 400, function() { if (onDone) onDone(); });
        return;
      }
      this.bossRevealed = true;
      this.refreshTombs();
      fx('creak');
      var boss = L.monstersByUid.boss;
      var st = this.monsters.boss || this.spawnMonster(boss);
      var large = null;
      for (var i = 0; i < L.tombs.length; i++) if (L.tombs[i].size === 'large') large = L.tombs[i];
      // on the door tile, a little out of the doorway, so he sorts in front of the crypt
      var dp = IsoModel.gridToIso(large.door.gx, large.door.gy + 0.35);
      st.bx = dp.x; st.by = dp.y + 12;
      st.gx = large.door.gx; st.gy = large.door.gy;
      st.gdir = { x: 0, y: 1 }; st.gdirTo = { x: 0, y: 1 };     // facing out of the door
      st.keepShown = true;                                       // seen from afar, dark or not
      this.setMonsterDepth(st);
      st.sprite.setDepth(Math.max(st.sprite.depth, CemModel.tombDepth(large, LAYERS.token) + 0.8));
      st.shown = true; st.sprite.setVisible(true); st.contact.setVisible(true);
      st.actions.appear = this.time.now;
      if (smoke && !REDUCED_MOTION) this.smokeBurst(dp.x, dp.y - 30, 11);
      this.focusOn(dp.x, dp.y - 40, false);
      this.time.delayedCall(REDUCED_MOTION ? 0 : CemMonsters.ACTIONS.appear + 200, function() { if (onDone) onDone(); });
    },

    /** A burst of smoke puffs that swell, drift up and thin out */
    smokeBurst: function(x, y, count) {
      var self = this;
      for (var i = 0; i < count; i++) {
        var a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        var r = 14 + Math.random() * 40;
        // plain alpha, not additive: a cloud of smoke, not a flash of light
        var puff = this.add.image(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5 + 10, 'cem_puff')
          .setScale(0.5 + Math.random() * 0.4).setAlpha(0.85).setDepth(1e5)
          .setTint(0x8f80b0);
        this.tweens.add({
          targets: puff,
          scale: 1.6 + Math.random() * 0.9, alpha: 0,
          x: puff.x + (Math.random() - 0.5) * 50, y: puff.y - 30 - Math.random() * 40,
          duration: 900 + Math.random() * 600, delay: Math.random() * 180, ease: 'Sine.easeOut',
          onComplete: (function(p) { return function() { p.destroy(); }; })(puff)
        });
      }
      void self;
    },

    /**
     * The Grim Reaper falls: three flashes as the last riddle lands, he rears
     * up in a purple blaze, the scythe-light drains, he collapses into a ring
     * of light and his stolen souls drift up as wisps; the great tomb's glow
     * turns gold. Calls back when the moment has passed.
     */
    playBossDefeat: function(onDone) {
      var self = this;
      var st = this.monsters.boss;
      if (!st || st.removed || REDUCED_MOTION) {
        if (st) this.removeMonster('boss');
        this.bossBeaten = true;
        this.refreshTombs();
        if (onDone) this.time.delayedCall(REDUCED_MOTION ? 300 : 0, onDone);
        return;
      }
      var x = st.bx, y = st.by;
      var depth = st.sprite.depth;
      st.actions.flinch = 0; st.actions.lunge = 0; st.walking = false;
      this.setInputEnabled(false);
      this.focusOn(x, y - 60, false);
      var glow = this.add.image(x, y - 70, 'glow_purple').setScale(0.9).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth - 0.1);
      var ring = this.add.image(x, y, 'highlight_ring').setTint(0xb388ff).setScale(0.4).setAlpha(0).setDepth(SHADOW_BAND + 1);
      var t = this.tweens;
      // 1. three hits: white flash, shake, a little bigger each time
      var hits = 0;
      function hit() {
        hits++;
        st.sprite.setTintFill(0xffffff);
        fx('hit');
        self.cameras.main.shake(120, 0.003);
        t.add({ targets: st, bx: x + (hits % 2 ? -8 : 8), duration: 60, yoyo: true, repeat: 1,
          onComplete: function() { st.bx = x; st.sprite.clearTint(); if (hits < 3) self.time.delayedCall(160, hit); else rear(); } });
      }
      // 2. rear up: rise and swell in a purple blaze
      function rear() {
        fx('dragon-roar');
        t.add({ targets: glow, alpha: 1, scale: 2.4, duration: 900, ease: 'Quad.easeOut' });
        t.add({ targets: st, by: y - 30, duration: 900, ease: 'Sine.easeOut' });
        var base = st.animScale || 1;
        st.pulse = t.add({ targets: st.sprite, scaleX: 1.15 * base, scaleY: 1.18 * base, duration: 450, yoyo: true, repeat: 1, ease: 'Sine.easeInOut',
          onUpdate: function() { st.lockScale = { x: st.sprite.scaleX / base, y: st.sprite.scaleY / base }; } });
        self.time.delayedCall(1000, drain);
      }
      // 3. drain: the blaze snaps out, he shudders and collapses into the ring
      function drain() {
        t.add({ targets: glow, alpha: 0, scale: 0.3, duration: 350, ease: 'Quad.easeIn' });
        t.add({ targets: st.sprite, rotation: 0.12, duration: 70, yoyo: true, repeat: 5 });
        self.time.delayedCall(420, function() {
          fx('pushback');
          self.cameras.main.shake(260, 0.006);
          ring.setAlpha(1);
          t.add({ targets: ring, scaleX: 3.2, scaleY: 3.2, alpha: 0, duration: 900, ease: 'Quad.easeOut' });
          st.collapse = { sx: 1, sy: 1, dy: 0, alpha: 1 };
          t.add({ targets: st.collapse, sx: 1.4, sy: 0.05, dy: 30, alpha: 0, duration: 520, ease: 'Quad.easeIn', onComplete: souls });
        });
      }
      // 4. the souls he kept drift up and away; the tomb light turns gold
      function souls() {
        self.removeMonster('boss');
        self.burst(x, y - 30);
        for (var i = 0; i < 7; i++) {
          var wisp = self.add.image(x + (hash(i, 1) - 0.5) * 60, y - 20, 'cem_wisp_glow').setScale(0.5 + hash(i, 2) * 0.5).setAlpha(0.9)
            .setBlendMode(Phaser.BlendModes.ADD).setDepth(depth + 1);
          t.add({ targets: wisp, y: y - 160 - hash(i, 3) * 120, x: wisp.x + (hash(i, 4) - 0.5) * 120, alpha: 0, scale: 0.2,
            duration: 1400 + hash(i, 5) * 900, delay: i * 90, ease: 'Sine.easeOut',
            onComplete: (function(w) { return function() { w.destroy(); }; })(wisp) });
        }
        fx('coins', { volume: 0.5 });
        self.bossBeaten = true;
        self.refreshTombs();
        for (var id in self.tombObjs) {
          if (!self.tombObjs.hasOwnProperty(id) || self.tombObjs[id].tomb.size !== 'large') continue;
          var rec = self.tombObjs[id];
          if (rec.glowTween) { rec.glowTween.stop(); rec.glowTween = null; }
          rec.glow.setTint(DOOR_LIGHT.gold);
          rec.spill.setTint(DOOR_LIGHT.gold);
          rec.glowTint = DOOR_LIGHT.gold;
          rec.breath.k = 1;
          t.add({ targets: rec, glowAlpha: 0.95, duration: 1200, ease: 'Sine.easeOut' });
        }
        self.time.delayedCall(1500, function() { glow.destroy(); ring.destroy(); if (onDone) onDone(); });
      }
      hit();
    },

    /** Procedural motion of every shown monster */
    updateMonsters: function(time) {
      var t = time / 1000;
      for (var uid in this.monsters) {
        if (!this.monsters.hasOwnProperty(uid)) continue;
        var st = this.monsters[uid];
        if (st.removed) continue;
        this.showMonster(st, this.monsterReveal(st), this.game.loop.delta || 16);
        if (!st.shown) continue;
        var A = CemMonsters.ACTIONS;
        var ev = {
          walking: st.walking, dir: st.dir, exitStyle: st.exitStyle,
          lunge: CemMonsters.progress(st.actions.lunge, time, A.lunge),
          flinch: CemMonsters.progress(st.actions.flinch, time, A.flinch),
          appear: CemMonsters.progress(st.actions.appear, time, A.appear),
          exit: CemMonsters.progress(st.actions.exit, time, A.exit)
        };
        ev.gdir = st.gdir;
        if (st.anim) ev.animated = true;
        var o = REDUCED_MOTION ? { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, alpha: 1 } : CemMonsters.pose(st.motion, t, st.phase, ev);
        this.turnMonster(st, this.game.loop.delta || 16);
        ev.gdir = st.gdir;
        if (st.anim && !REDUCED_MOTION) {
          var c = CemMonsters.clipFor(ev, st.facings);
          if (c.clip !== st.lastClip || c.facing !== st.lastFacing) {
            var key = 'anim_' + st.m.id + '_' + c.clip + '_' + c.facing;
            if (this.anims.exists(key)) st.sprite.play(key, true);
            st.lastClip = c.clip; st.lastFacing = c.facing;
          }
          st.flip = c.flip;
        }
        // the gait is a multiplier on the figure's own size: without this the
        // per-frame scale would throw away the size the sheet was spawned at,
        // and a spider would stand as tall as a zombie
        o.sx *= st.animScale || 1;
        o.sy *= st.animScale || 1;
        if (st.lockScale) { o.sx *= st.lockScale.x; o.sy *= st.lockScale.y; }
        if (st.collapse) { o.sx *= st.collapse.sx; o.sy *= st.collapse.sy; o.dy += st.collapse.dy; o.alpha *= st.collapse.alpha; }
        o.alpha *= st.reveal;      // out of the dark as Mr Owl comes near
        st.sprite.setPosition(st.bx + o.dx, st.by + o.dy - hoverOf(st.m.id)).setScale(o.sx, o.sy).setAlpha(o.alpha).setFlipX(st.flip);
        if (!st.pulse || !st.pulse.isPlaying()) st.sprite.setRotation(o.rot);
        st.contact.setPosition(st.bx, st.by).setAlpha(0.5 * o.alpha);
        if (st.glow) st.glow.setPosition(st.bx + o.dx, st.by + o.dy - 40 - hoverOf(st.m.id)).setAlpha(0.6 * o.alpha);
      }
    },

    // --- Visibility, light and culling -------------------------------------------------

    /**
     * Put a tile's sprites where its reveal says: props as solid as the tile
     * has ever been revealed (so what he has walked past stays), their tint
     * warming from the remembered blue to lantern light while he is near,
     * and the lights on the tile only while he is near. A puddle on the tile
     * (in the floor layer) follows the same reveal, so none shows on dark
     * ground. Props a lightning strike has lit keep its white until the
     * strike ends (restoreProps brings them back here).
     */
    applyTile: function(i) {
      var L = this.level, R = this.reveal;
      var alpha = CemReveal.alphaAt(R, i);
      var lit = CemReveal.litAt(R, i);
      if (this.puddleByTile && this.puddleByTile[i]) this.showPuddle(this.puddleByTile[i], alpha, lit);
      var objs = this.tileObjs[i];
      if (!objs.length) return;
      var shown = alpha > 0;
      var live = CemReveal.factor(R, i);
      var lights = this.tileLights[i], props = this.tileProps[i];
      var o;
      for (o = 0; o < props.length; o++) this.world.setPropShown(props[o], shown);
      for (o = 0; o < lights.length; o++) this.world.setPropShown(lights[o], shown && live > 0);
      if (!shown) return;
      var tint = this.stormLit && this.stormLit[i] ? STORM_LIT_TINT : propTint(L, i, lit);
      for (o = 0; o < props.length; o++) {
        var p = props[o];
        p.setTint(tint);
        p.setAlpha(p.cemBase === undefined ? alpha : p.cemBase * alpha);
      }
      if (live > 0) {
        for (o = 0; o < lights.length; o++) {
          var l = lights[o];
          if (l.cemTweened) continue;
          l.setAlpha((l.cemBase === undefined ? 1 : l.cemBase) * live);
        }
      }
    },

    /**
     * Every frame: move the reveal window with Mr Owl and touch only the
     * tiles whose factor moved, the tombs, and the chunks whose ground
     * brightened a step.
     */
    updateReveal: function() {
      var t0 = this.perf ? performance.now() : 0;
      var o = CemModel.owlPos(this.level);
      var out = CemReveal.update(this.reveal, o.x, o.y, this.revealOut);
      for (var i = 0; i < out.changed.length; i++) {
        var idx = out.changed[i];
        this.applyTile(idx);
        this.groundPending[idx] = true;     // its peak may have risen past what its chunk holds
      }
      for (var id in this.tombObjs) {
        if (this.tombObjs.hasOwnProperty(id)) this.applyTomb(this.tombObjs[id]);
      }
      if (this.perf) { this.perf.lastReveal = performance.now() - t0; this.perf.markReveal(this.perf.lastReveal); }
    },

    /**
     * Ground that has come up since its chunk was baked is drawn as a tile
     * sprite over the chunk, at the alpha that composites to what the tile
     * should show now (both are the same picture, so coverage
     * 1 - (1 - baked)(1 - sprite) = peak). The chunk is marked for a repaint
     * and, once it holds the new value, the sprite goes. Runs after the
     * world has baked this frame, so the two never disagree on a frame.
     */
    updateGround: function() {
      var L = this.level, R = this.reveal, W = this.world;
      var baked = this.groundBaked;
      var pending = this.groundPending;
      var dirty = null;
      for (var key in pending) {
        if (!pending.hasOwnProperty(key)) continue;
        var idx = +key;
        var t = L.tiles[idx];
        var target = CemReveal.alphaAt(R, idx);
        var have = W.isLive(W.chunkIndexOf(t.gx, t.gy)) ? baked[idx] : target;   // an unpainted chunk bakes the current value when it comes
        if (target <= have + 1e-4) {
          delete pending[key];
          this.releaseGround(idx);
          continue;
        }
        (dirty || (dirty = [])).push(idx);
        // a bake a few frames behind is a step too small to see; a sprite
        // only bridges a gap that would show
        if (target - have < GROUND_SPRITE_GAP && !this.groundSprites[idx]) continue;
        var img = this.groundSprites[idx] || this.acquireGround(idx, t);
        img.setAlpha(have >= 1 ? 0 : 1 - (1 - target) / (1 - have));
      }
      if (dirty) W.markSeen(dirty);
    },

    acquireGround: function(idx, t) {
      var img = this.groundFree.pop();
      var frame = (t.kind === 'path' || t.kind === 'tomb_door' || t.kind === 'gate') ? 'path_' + (t.variant % 3) : 'grass_' + (t.variant % 4);
      if (t.tombId && t.kind !== 'tomb_door') frame = 'path_2';
      var p = IsoModel.gridToIso(t.gx, t.gy);
      if (!img) {
        img = this.add.image(p.x, p.y, 'cem_ground', frame).setOrigin(0.5, 0.5);
        this.world.floorLayer.add(img);
      } else {
        img.setTexture('cem_ground', frame).setPosition(p.x, p.y).setVisible(true);
      }
      img.setDepth(GROUND_SPRITE_DEPTH + IsoModel.depthKey(t.gx, t.gy, 0)).setTint(lerpTint(this.level.lightMap[idx]));
      this.groundSprites[idx] = img;
      return img;
    },

    releaseGround: function(idx) {
      var img = this.groundSprites[idx];
      if (!img) return;
      delete this.groundSprites[idx];
      img.setVisible(false);
      this.groundFree.push(img);
    },

    /**
     * Apply the reveal to every sprite in the level: boot, and the moments
     * the flow wants everything settled (a monster gone, a respawn).
     */
    refreshVisibility: function() {
      var L = this.level;
      this.updateReveal();
      for (var i = 0; i < L.tiles.length; i++) this.applyTile(i);
      this.refreshTombs();
      this.refreshMonsters(1e6);            // settle the monsters where they are
      this.world.update(true);
      this.updateGround();
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
        self.layoutRain();
        self.followOffset = self.hudOffset();
        if (self.player && self.player.visible) self.focusOn(self.player.x, self.player.y - 12, true);
        self.world.update(true);
      });
    },

    setInputEnabled: function(enabled) {
      this.inputEnabled = !!enabled;
    },

    /**
     * Mr Owl crossed onto another tile (or was put on one): bring the reveal
     * up to date now rather than at the next frame. The model's lists of
     * tiles it just remembered and tiles whose `vis` changed (`newlySeen`
     * and `visChanged`, drained by the flow after this call) are not needed:
     * the reveal window brightens the ground on its own as he approaches.
     */
    onTilesRevealed: function() {
      this.updateReveal();
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

      // One finger on the map steers Mr Owl (drag away from where you pressed);
      // a tap without dragging walks him there. The camera always follows him.
      var STEER_MAX = 70;
      this.input.on('pointerdown', function(pointer) {
        if (!self.inputEnabled) return;
        drag = { x: pointer.x, y: pointer.y, moved: 0, steering: false };
      });
      this.input.on('pointermove', function(pointer) {
        if (!drag || !pointer.isDown || pinch) return;
        var dx = pointer.x - drag.x, dy = pointer.y - drag.y;
        drag.moved = Math.sqrt(dx * dx + dy * dy);
        if (drag.moved < 12) return;
        drag.steering = true;
        var d = Math.min(STEER_MAX, drag.moved);
        var cb = callbacks(self);
        if (cb.onSteer) cb.onSteer(dx / drag.moved * d / STEER_MAX, dy / drag.moved * d / STEER_MAX);
      });
      this.input.on('pointerup', function(pointer) {
        if (!drag) return;
        var wasPinch = !!pinch;
        var steering = drag.steering;
        var moved = drag.moved;
        drag = null;
        var cb = callbacks(self);
        if (steering && cb.onSteer) cb.onSteer(0, 0);
        if (self.input.pointer1.isDown || self.input.pointer2.isDown) return;
        pinch = null;
        if (wasPinch || steering || moved > 8 || !self.inputEnabled) return;
        var world = cam.getWorldPoint(pointer.x, pointer.y);
        var g = IsoModel.isoToGrid(world.x, world.y);
        if (cb.onTileTap) cb.onTileTap(g.gx, g.gy);
      });
      this.input.on('wheel', function(pointer, objects, dx, dy) {
        cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), 0.4, 2));
        self.world.update(true);
      });
      this.pinchState = function() { return pinch; };
      this.setPinch = function(v) { pinch = v; };
    },

    /** Arrow keys and WASD steer like the stick */
    readKeys: function() {
      if (!this.keys) return null;
      var k = this.keys;
      var x = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
      var y = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
      if (!x && !y) return this.keyVec ? (this.keyVec = null, { x: 0, y: 0 }) : null;
      var len = Math.sqrt(x * x + y * y);
      this.keyVec = { x: x / len, y: y / len };
      return this.keyVec;
    },

    update: function(time, delta) {
      var p1 = this.input.pointer1, p2 = this.input.pointer2;
      var cam = this.cameras.main;
      var cb = callbacks(this);
      var keys = this.readKeys();
      if (keys && cb.onSteer) cb.onSteer(keys.x, keys.y);
      var t0 = this.perf ? performance.now() : 0;
      var step = cb.onFrame ? cb.onFrame(Math.min(delta || 16, 50)) : null;
      if (this.perf) this.perf.mark(performance.now() - t0);
      this.syncOwl(step ? step.vx : 0, step ? step.vy : 0);
      this.updateReveal();
      this.updateOwlLighting();
      this.updateMonsters(time);
      this.updateFog();
      this.tickStormSchedule();
      if (this.stormStrike) this.tickStorm(Math.min(delta || 16, 100));
      var r0 = this.perf ? performance.now() : 0;
      this.updateRain(time, delta);
      if (this.perf) this.perf.markRain(performance.now() - r0);
      if (this.player && this.player.visible) {
        var tx = this.player.x + this.followOffset.x / cam.zoom;
        var ty = this.player.y + this.followOffset.y / cam.zoom;
        var k2 = 1 - Math.pow(0.002, Math.min(delta || 16, 100) / 1000);
        var mx = cam.midPoint.x, my = cam.midPoint.y;
        cam.centerOn(mx + (tx - mx) * k2, my + (ty - my) * k2);
      }
      if (p1 && p2 && p1.isDown && p2.isDown) {
        var d = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        var pinch = this.pinchState();
        if (!pinch) this.setPinch({ dist: d, zoom: cam.zoom });
        else cam.setZoom(Phaser.Math.Clamp(pinch.zoom * (d / pinch.dist), 0.4, 2));
      }
      this.world.update(false);
      var t1 = this.perf ? performance.now() : 0;
      this.updateGround();
      if (this.perf) this.perf.markReveal(this.perf.lastReveal + performance.now() - t1);
      if (this.perf) this.perf.frame();
    }
  });

  return {
    BootScene: BootScene,
    CemeteryScene: CemeteryScene,
    REDUCED_MOTION: REDUCED_MOTION
  };
})();
