# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mr Owl's Dungeon Adventure - A cross-platform Polish language learning game where players explore a dungeon, answering Polish vocabulary and grammar questions to defeat monsters. Target audience: children learning Polish. Runs on browser, Android, and iOS via Capacitor.

## Development Commands

**Run the game**: `npm start` or open `index.html` in a browser

**Run tests**:
- Unit tests: `npm test` or `node tests/run-tests.js`
- Browser test runner: Open `tests/test-runner.html`
- Cemetery smoke test (headless Chrome, plays the whole level): `npm run test:cem`
- Cemetery performance readout (headless Chrome, walks a long route, prints the `?perf=1` numbers): `npm run test:cem:perf`
- Cemetery thunderstorm check (headless Chrome, fires a strike through `scene.strikeLightning()`, screenshots it, measures its per-frame cost, checks it is skipped while a card is up and that the timer pauses with the game): `npm run test:cem:storm`; a short storm video: `npm run record:cem:storm`
- Cemetery rain check (headless Chrome, winds the rain clock on, walks through the puddles, screenshots `docs/screenshots/cem-rain.png`, prints the rain's per-frame cost; `--reduced` runs it under prefers-reduced-motion): `npm run test:cem:rain`
- 3D view render-loop check (headless Chrome, walks 20 steps and opens and closes an encounter card, fails if the view starts running more than one animation loop; also checks the dragon and the treasure stand as 3D models): `npm run test:fp:perf`
- Encounter card check (headless Chrome, classic page: dropped and missing backdrops, the loop stopping when the card closes, rooms kept per level, only the lunge leaving the frame): `npm run test:card`
- Performance baseline and how to re-measure it: `docs/performance-baseline.md`
- 3D view playthrough videos (headless Chrome on the GPU): `npm run record:fp` (a minute of exploring) and `npm run record:fp:dragon` (walks to the boss chamber and beats the dragon)
- Cemetery playthrough video (headless Chrome on the GPU, plays gate to Grim Reaper and encodes it with ffmpeg): `npm run record:cem`
- Cemetery night-reveal check (headless Chrome; walks Mr Owl with a tap-to-walk leg and a pinch, and fails if anything on screen pops from dark to lit within 3 frames, shows in the dark, or if a ground tile's baked-plus-sprite composite drifts from its peak; `--zoom 0.8` / `--zoom 0.5` for the phone and pinched views): `npm run test:cem:reveal`
- Cemetery night-reveal clip (a 45 s slow walk toward a crypt, a lantern and a wanderer, encounters off): `npm run record:cem:reveal`
- Cemetery rain video (the rain coming in, puddles forming, Mr Owl splashing through them; the tunables are wound up for the camera): `npm run record:cem:rain`
- Cemetery weather video, all of it in one 40 s take (the night reveal while Mr Owl walks, the storm announcing the rain, the rain arriving with puddles filling and drops hitting them, lightning over the wet ground): `npm run record:cem:weather`
- Dungeon playthrough videos in the classic page and the isometric view (shortest way to the dragon, fighting on the way, beating it): `npm run record:classic`, `npm run record:iso`
- E2E tests: `npm run test:e2e` (requires Maestro and running emulator)

**Mobile builds**:
```bash
# Android (requires JAVA_HOME set to Java 17+)
export JAVA_HOME=/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
npm run android:run

# iOS (macOS only)
npm run ios:run
```

**Build maze library** (only needed if modifying dungeon generation): `npm run build`

**Prototype views**: `npm run proto` serves `www/` on http://localhost:8080; open `/proto/first-person.html` (three.js) or `/proto/isometric.html` (Phaser 3). Rebuild the vendored engine bundles with `npm run vendor` after upgrading `three` or `phaser` in devDependencies.

No build system for game code - vanilla JavaScript with direct browser execution.

## Architecture

### Module Pattern (IIFE)
All modules use the Immediately Invoked Function Expression pattern:
```javascript
const ModuleName = (function() {
  let privateState = {};
  function privateMethod() {}
  return { publicMethod };
})();
```

### Core Modules

| Module | File | Purpose |
|--------|------|---------|
| Game | `js/main.js` | Game controller, orchestrates all modules |
| Player | `js/modules/player.js` | Player state, inventory, stats, movement |
| Dungeon | `js/modules/dungeon.js` | Procedural dungeon generation, room graph |
| Combat | `js/modules/combat.js` | Quiz-based encounters, answer checking |
| Questions | `js/modules/questions.js` | Question database, selection, tracking |
| UI | `js/modules/ui.js` | DOM manipulation, screen/modal rendering |
| Save | `js/modules/save.js` | localStorage persistence |
| DungeonMap | `js/modules/map.js` | SVG dungeon visualization |
| Descriptions | `js/modules/descriptions.js` | Bilingual room/monster text |
| SFX | `js/modules/sfx.js` | Synthesized Web Audio sound effects, mute, TTS ducking |
| FX | `js/modules/fx.js` | Promise-based encounter animations (`css/fx.css`), haptic/sound proxies |
| AppLifecycle | `js/modules/lifecycle.js` | Idles the game in the background (suspends music/SFX, stops TTS and render loops); Android sends `app-pause`/`app-resume` from `MainActivity` |
| ProtoSharedDom | `js/proto/shared-dom.js` | Shared modal markup for the standalone prototype pages |
| FpWorld / FpRenderer | `js/proto/fp-*.js` | First-person prototype (pure grid model + three.js renderer + bootstrap) |
| FpLayout | `js/proto/fp-layout.js` | Pure chamber geometry, torch and lava layout, and the gothic wall dressing (`wallFeatures`: bricked-up lancet windows, a blind arcade, a niche) |
| FpMonsters | `js/proto/fp-monsters.js` | 3D models of every monster and of the treasure hoard (`assets/proto/fp/monsters/`, pipeline in `tools/monsters3d/`), procedural idle/flinch/lunge |
| FpOwl | `js/proto/fp-owl.js` | Rigged 3D Mr Owl (`assets/proto/fp/mr_owl.glb`, pipeline in `tools/owl3d/`) and the third-person camera placement |
| IsoModel / scenes | `js/proto/iso-*.js` | Isometric fog-of-war prototype (pure tile model + Phaser scenes + bootstrap; `iso-main.js` also holds the dungeon/cemetery level picker) |
| CemModel | `js/proto/cem-model.js` | Halloween cemetery level: seeded organic generator (fence, gate, lanes, graves, tombs, lanterns, decor), A* walking, wandering monsters with proximity attacks, skeleton-key gating, night visibility, save state (pure, node-tested) |
| CemMonsters / CemMinimap | `js/proto/cem-monsters.js`, `cem-minimap.js` | Procedural gaits and reactions of the 2D monster cutouts; SVG minimap of the cemetery (pure) |
| CemStorm | `js/proto/cem-storm.js` | Thunderstorm over the cemetery: strike schedule, target tile, seeded bolt polyline with branches, flicker and flash curves, thunder lag (pure, node-tested); drawn by `CemeteryScene.strikeLightning` |
| CemWorld / CemStick / CemPerf | `js/proto/cem-world.js`, `cem-stick.js`, `cem-perf.js` | Chunked ground and depth bands; dock thumb-stick; `?perf=1` overlay |
| CemReveal | `js/proto/cem-reveal.js` | Per-tile night reveal (pure, node-tested): a distance factor from Mr Owl's float position over a window around him, a monotonic peak, a point factor for things that move |
| CemRain | `js/proto/cem-rain.js` | The cemetery weather, pure and node-tested: when the rain starts and ramps, which lane tiles collect a puddle and how each fills, the streaks' slant, the droplet-ring and splash schedules (`CemRain.CFG` holds the tunables) |
| MonsterStage | `js/modules/monster-stage.js` | Animated monster layer over the painted encounter scene (all views) |
| CemTextures / CemScenes / ProtoCem | `js/proto/cem-textures.js`, `cem-scenes.js`, `cem-main.js` | Procedural night art + Kenney kit sprite manifest (`assets/proto/iso/cemetery/`, rendered by `tools/iso/render_kit.py`), Phaser scene, and the cemetery game flow (encounters, key parts, Grim Reaper, victory) |

### Platform Abstraction Layer

The game uses adapters to support multiple platforms:

**Adapters** (`js/adapters/`):
- `StorageAdapter.js` - Abstract storage interface
- `AudioAdapter.js` - Abstract TTS interface
- `InputAdapter.js` - Abstract input handling

**Browser Implementations** (`js/platforms/browser/`):
- `BrowserStorage.js` - localStorage wrapper
- `BrowserAudio.js` - Web Speech API for Polish TTS
- `BrowserInput.js` - Keyboard + touch/swipe gestures

**Capacitor Implementations** (`js/platforms/capacitor/`):
- `CapacitorStorage.js` - Native Preferences plugin
- `CapacitorAudio.js` - Native TextToSpeech plugin
- `CapacitorHaptics.js` - Haptic feedback for iOS/Android

Platform detection happens in `js/platform-init.js`.

### Data Files
- `js/data/vocabulary.js` - Polish vocabulary questions (difficulty 1-3)
- `js/data/grammar.js` - Polish grammar questions (difficulty 1-3)
- `js/data/monsters.js` - Monster definitions with bilingual descriptions and loot

### Game Flow
```
Game.init() → startNewGame()/loadGame() → enterRoom()
    → hasMonsterEncounter? → startCombat() → handleAnswer()
    → success: clear room, loot | failure: push back
    → Dragon: requires 3 consecutive correct answers
```

## Key Configurations

**3D view lighting** (fp-renderer.js): Mr Owl carries his own light, a point lantern plus a soft forward beam (`LANTERN_INTENSITY`, `BEAM_INTENSITY`, both flickering), so whatever he faces is modelled from the front instead of being a silhouette against the torches. Lava throws a churning light and a heat haze standing over the river, and the crust beside it stays warm. A wall torch is 50 for scale

**3D view render loop** (fp-renderer.js): `frame()` holds `inFrame` for its whole run, because anything it calls that wants the loop going (`assignLights`, `setVisibility`, a nested tween) would otherwise pass `startLoop`'s guard and fork a second, permanent animation-frame chain. That cost one extra chain per walked step and is what made the view grind to a halt while exploring. `npm run test:fp:perf` guards it. Encounter entities hang off `cells[id].group` (see `entityHost`) so the chamber culling covers them

**3D monsters and loot** (fp-monsters.js, fp-renderer.js): every monster in `monsters.js` has a model in `assets/proto/fp/monsters/<id>.glb`, and so does the treasure hoard; `setEntity` stands a model wherever `FpMonsters.has(imageId)` - monster, dragon or treasure - and keeps the billboard only for what has none. `FpMonsters.MODELS` holds each one's height (Mr Owl is 1.35), motion (`breathe`, `squash`, `hover`, `sway`, or `still` for the gold) and how it leaves. Flat line-art characters (the orc, the vampire lord, the wisp, the mine spirit) come out of TRELLIS as picture cards, so they go through `tools/monsters3d/restyle_3d.py` first; `tools/monsters3d/prepare_all.sh` prepares every mesh the generator has produced

**Dungeon Generation** (dungeon.js):
- MAZE_WIDTH: 7, MAZE_HEIGHT: 6 (creates 42-cell grid)
- MIN_MONSTER_ROOMS: 20
- Difficulty scaling: depths 1-7 (easy), 8-14 (medium), 15+ (hard)

**Boss challenges**: each of the three questions re-renders the card through `UI.updateQuizQuestion`, which re-points the Listen button at the word now on screen (`wireSpeakWord`); the cemetery smoke test guards it

**Bosses** (`Combat.isBoss`: `boss: true` or difficulty 4): the dragon in the dungeon and the Grim Reaper in the cemetery need 3 consecutive correct answers; a wrong answer resets the streak and pushes the player back (cemetery: back to the gate)

**Cemetery level** (cem-model.js): 60x52 tile grid with a 1-tile fence ring and 2-3 tile wide winding lanes, 4 small tombs (2x2, named guardians banshee/pumpkin_man/clown/ghost with key parts 1..4) + 1 large tomb (3x3, Grim Reaper), ~16 wandering monsters banded by lane distance (`WANDERER_BANDS`, four kinds per ring, the will-o'-the-wisp among them; `STRAY_SHARE` of the middle and far wanderers are strays from a nearer ring, drawn from their own RNG stream so the rest of a seed's level is unchanged), sight radius 4 around Mr Owl plus 3 around each lamp post. Mr Owl moves continuously (`tickOwl`, `moveBy`, `OWL_SPEED` tiles/s, circle radius `OWL_RADIUS`) steered by the dock thumb-stick (`cem-stick.js`), drag or keys; tap-to-walk still uses A* (`pathTo` + `setPath`)

**Cemetery rendering** (cem-world.js): ground, prop shadows and lantern pools are baked into pooled 8x8-tile render textures (1024x696 each, pool capped at `CHUNK_POOL_MAX`; each tile at the alpha its peak reveal had at the time, kept in `groundBaked`, the prop shadows stamped in the same batch; the camera reaches up to `ACQUIRE_BUDGET` new chunks a frame from a view rectangle computed from its scroll and zoom, `viewRect`, so a chunk is live before its tiles are in view; a chunk whose ground keeps brightening is repainted at most every `bakeMinMs` (250) and `REBAKE_BUDGET` a frame, the tile sprites bridging the gap; a brightened tile only dirties the chunk above or to the left when it is within `SHADOW_PAD` of that edge); props live in depth-band Layers with cell culling, and `setActive` pauses the animation and the `cemTween` of whatever is culled or hidden by the reveal, since Phaser advances both for invisible objects (the reveal makes a sprite active again before it fades in). The model keeps `visChanged` (tiles whose `vis` value changed) next to `newlySeen`; the flow hands both to `onTilesRevealed`, which runs `updateReveal` (the per-frame reveal does the rest, and the full `refreshVisibility` pass with forced bakes happens once, at create). `?perf=1` shows frame rate, logic time, the reveal's time, draw calls and the chunk pool. Boot: `IsoTextures.generateFallbacks` takes an `only` list (the cemetery needs a dozen of the dungeon's sixty textures), `CemTextures.generate` registers the stand-in props and paints one only when `sprite()` finds no kit image, the night sheet is painted only with `{ fog: true }`, and `SFX.warm()` builds the AudioContext behind the loading veil (built in-frame on the first footstep it froze the game 300 ms)

**Night reveal** (cem-reveal.js, applied in cem-scenes.js): every tile within `OUTER` (6.5) tiles of Mr Owl's float position has a reveal factor f, a smoothstep reaching 1 at `INNER` (3.5), recomputed every frame for a 15x15 window around him only (`CemReveal.update`, about 0.1 ms). What he sees now follows the *live* factor: a prop's tint warms from `SEEN_TINT` to the lantern light from `LIT_FROM` on (`propTint`), a monster's alpha is the same curve from where its feet are drawn and Mr Owl's float position, with a lantern's light fading over `LAMP_FADE` past its disc (`CemReveal.pointFactor` in `monsterReveal`), eased at `MONSTER_REVEAL_RATE` per second so a spawn or a snapped step never jumps; the lights on a tile (pumpkin candles) fade with it. What he remembers follows the *peak* factor, which never falls: a prop's alpha (opaque from `ALPHA_FULL_AT`) and the alpha its ground shows at; ground he only half approached stays half remembered. The camera plays no part: a pan or a pinch out shows nothing he has not walked near, and ground beyond `OUTER` that he has never approached stays dark. The ground is never stepped: a tile whose peak has risen more than `GROUND_SPRITE_GAP` past what its chunk holds is drawn as a pooled `cem_ground` tile sprite in the floor layer at the alpha that composites to the peak (`updateGround`, after the world has baked that frame), the chunk is marked for a repaint, and the sprite goes once the bake holds the value. Lantern-lit tiles and tiles a save marks seen start at 1. Tombs take the most revealed of their tiles (`applyTomb`, every frame, five of them); their door light breathes through `rec.breath` because its alpha is now set from the reveal. `refreshVisibility` (all tiles) is only for boot, respawn and after a defeat; `onTilesRevealed` just runs `updateReveal`. Reduced motion steps the factor to 0 / 0.5 / 1 instead of ramping. `npm run test:cem:reveal` proves nothing on screen pops. The model's `vis`/`seen` are unchanged and still drive taps and the minimap. The moving night is switched off (`FOG_ENABLED` false in cem-scenes.js); when on it is a plain sprite: `cem_dark_ring`, a dark square with a soft hole, carried by Mr Owl at `FOG_DARK` (0.62) alpha, with additive `cem_soft_light` glows at the lanterns and the Reaper (`fogGlow`). No render texture, mask or erase blend: an Android WebView got all three wrong. There is no moon

**Fliers**: `HOVER_PX` in cem-scenes.js lifts bats, wisps and spectres above their ground shadow

**Thunder and lightning** (cem-storm.js, `buildStorm`/`planStorm`/`strikeLightning` in cem-scenes.js): the storm follows the rain schedule and nothing else - `CemStorm.plan(rainSchedule, seed)` gives every rain episode one announcing strike `announceMinMs`-`announceMaxMs` (4-10 s) before its rain starts (picked far off, `range: { minDist: 5 }`), then strikes while it rains at gaps of `minGapMs`-`maxGapMs` (25-60 s) scaled by `gapScale` so a 30 s episode still gets two, none once the rain starts fading (`RAIN_FADE_MS`) and none in a dry spell; an episode's strikes are drawn from a generator seeded by the storm seed and the episode start, so they replay however the schedule is queried. `tickStormSchedule` (one comparison a frame, on the rain clock `rainElapsed`) fires a due strike, or when blocked retries it in `retryMs` while its window lasts (`afterBlocked`), else drops it; the `?perf=1` overlay's `storm` line (`stormStats`) says what comes next. A harness that winds `rainT0` calls `planStorm()` again. Lightning hits a lit tile (`vis === 2`) 2-8 tiles from Mr Owl - lantern light marks tiles lit all over the grounds, so `maxDist` is what keeps the strike on screen. The bolt is a seeded midpoint-displacement polyline with 2-3 branches from above the top of the view (targets in the top third of the view are turned down, so it always has room to fall), stroked once per strike into two Graphics (an additive glow and a white core), with an additive pool and burst at its foot. A strike is a sequence (`CemStorm.sequence`): a dim leader flicker, the main return stroke at full, then 2-4 re-strikes down the same channel, each weaker, `totalMinMs`-`totalMaxMs` (0.8-1.5 s) in all, with the glow lingering `glowLingerMs` after the last core; brightness comes from `coreAlpha`/`glowAlpha`, each stroke's shape times a seeded noise `flutter` (one sample per `noiseStepMs`, never below `flutterFloor`), so it flutters rather than fades; `applyStorm(t)` shows a moment, `tickStorm` advances it. The whole view lightens with the same envelope under a scrollFactor-0 additive pale-blue `cem_flash` image (`flashAlpha` = `flashPeak` 0.45 x core), props within `brightenRadius` tiles that the reveal shows at all take a cold tint (`STORM_LIT_TINT`, held in `stormLit` so `applyTile` leaves it alone while Mr Owl walks) until the strike is over (`restoreProps` runs `applyTile` on them, which puts back the reveal's tint), the camera shakes on the main stroke, and the `thunder` SFX recipe follows the main stroke by `thunderDelay` (300-1200 ms, farther is later and quieter). Pausing the game stops the per-frame check, so nothing strikes while paused (the rain clock itself is `time.now`, which runs on through a pause); a strike is held back (and retried) while `ProtoCem.isBusy()`, input is off or the level is paused. Between strikes the only per-frame cost is one `stormStrike` check; `tickStorm` runs only during a strike (a strike adds about five draw calls and well under a millisecond a frame). Reduced motion: no flash, shake or flicker, a dim bolt for the sequence and the sound. The harnesses aim a strike with `strikeLightning({ target, seed })` and hold one on its brightest moment with `CemStorm.brightest(seq)` + `applyStorm(t)`
**Rain and puddles** (cem-rain.js decides, cem-scenes.js `buildRain`/`updateRain` draws): the weather is a seeded schedule (`CemRain.schedule(level.seed)`): a first shower 4-25 s after the gate, then episodes of `EPISODE_MIN_MS`-`EPISODE_MAX_MS` (30-60 s) with gaps of `GAP_MIN_MS`-`GAP_MAX_MS` (20-120 s), each ramping in over `RAIN_RAMP_MS` and out over `RAIN_FADE_MS` (`strengthAt`, `describe` for the overlay). The streaks are one screen-space particle emitter (scrollFactor 0, one 4x30 texture, `RAIN_ALIVE` alive, slanted `RAIN_SLANT_DEG`, relaid on zoom and resize by `layoutRain`) whose spawn rate follows the strength. Puddles lie on the floor layer (`addProp` with `ground: true`, culled with their cell, under whoever stands in them) on lane and plaza tiles chosen by `hash(gx, gy, 41) < PUDDLE_CHANCE`; they are laid around Mr Owl (`PUDDLE_REACH` tiles) each time he changes tile, not on every seen tile (the lanterns reveal their surroundings from the start and would spend the cap, `MAX_PUDDLES`); past the cap the farthest puddle at least `RECYCLE_DIST` away and off screen is moved (`world.moveProp`). A puddle's wetness is `wetnessAt`: it fills through the latest episode after its own stagger and pace (`PUDDLE_FILL_MS`, `PUDDLE_STAGGER_MS`) and dries over `PUDDLE_DRY_MS` after it ends; the sprite's alpha is that times the tile's reveal (`showPuddle` is fed by `applyTile` with the peak alpha and the lit factor, so a puddle on dark ground does not show and one on remembered ground is dim and blue). **Reflections**: every puddle owns a small canvas texture (`CemTextures.PUDDLE_W` x `PUDDLE_H`, `textures.createCanvas`) composited on the CPU with Canvas 2D, which every WebView gets right where masks and erase blends did not: whatever stands near enough that its picture, flipped about the line it stands on (`mirrorRect`), reaches the water (`rectHitsPuddle`) is drawn upside down into a reflection canvas (`drawMirrored`, honouring frame trim and flipX), clipped to the water's shape with `destination-in` (`puddleParts(variant).mask`), darkened and blued with a `source-atop` fill (`REFLECTION_TINT`), lantern glows added on top as light; the texture is then base water + reflection (`REFLECTION_ALPHA`) + sheen (`composePuddle`). Props, fence, lanterns and tombs are gathered once when the puddle is laid (`reflectStatics`); Mr Owl and the monsters are added every `LIVE_MS` for puddles in view whose mirror they reach, redrawn only when their place or frame changed (`liveKey`), at most `BAKES_PER_TICK` puddles per tick, and the reflection sways by `WOBBLE_PX` while a ring crosses (`reflOffset`, recomposed only). While it rains every wet puddle in view takes `RING_RATE` drops a second at full strength (`impactsDue`, scaled by the strength): each a plip (a bright dot popping for `PLIP_MS`) and a crisp 16 px native ring (`cem_plip_ring`) growing to 12-19 px over `RING_MS`, pooled together under `RING_CAP`, and each makes the mirror sway; a step in a puddle (`splashStep`, throttled by `SPLASH_MS`) spawns two bigger rings, a few drops and the `splash` recipe in sfx.js instead of the dry footstep. Under `REDUCED_MOTION` there are no streaks, rings or drops; puddles still fill, dry and mirror. The `?perf=1` overlay prints the rain's per-frame time, streaks, puddles, rings, mirror bakes with their cost, and where the schedule stands; `npm run test:cem:rain` checks the caps, the mirrors and the splash; `npm run record:cem:rain` winds the schedule for the camera

**Tomb doorways**: the crypt art has its own arch; the kit manifest's `portal` (sill centre and arch size as sprite fractions, measured off `tomb_small.png`/`tomb_large.png`, kept in `tools/iso/cemetery_models.json`) says where. `CemTextures.makeDoorLights` builds the arch light and the ground spill at that pixel size, `buildTombs` hangs them on the sill, `refreshTombs` tints them (gold waiting, blue taken, red sealed). The spill lies in the ground layer (`addProp` with `ground: true`), under whoever stands in it, and is built from overlapping soft pools so it has no edge. A crypt without a portal gets a drawn opening instead

**The Reaper's entrance**: `CemModel.bossRises` fires a `boss_rises` event the first time Mr Owl comes within `REVEAL_RADIUS` tiles of the great tomb's door holding all four parts; the flow calls `revealBoss(null, true)`, which stands him on the door tile in a `smokeBurst` and keeps him shown from afar (`keepShown`). Entering the door then starts the fight without a second reveal

**Eight-way facing**: both Mr Owl and the cemetery monsters are rendered in five facings (`down`, `down_right`, `right`, `up_right`, `up`); `CemMonsters.facingFor(gx, gy, facings)` maps a grid direction onto one of eight screen directions, mirroring three of them. Sheets that still carry the old `front`/`back` pair keep working. Monsters hold a heading that turns toward where they are going (`turnMonster`, `TURN_RATE`) and roam on eight directions (`CemModel.DIRS8`, diagonals need both straight neighbours clear)

**Cemetery monsters**: rendered sprite sheets (`assets/proto/iso/monsters/<id>.png|json`, built by `tools/monsters3d/render_monster_iso.py` + `render_all.sh`, packed with `tools/owl3d/pack_sprites.py --quant 128`; `render_all.sh` records a per-model yaw where a model's front is off-axis, the ghost at -45 and the lost soul at 90) with walk/idle/attack/hit clips in five facings; `CemMonsters.clipFor` picks the clip, `pose` adds the reactions. Missing sheets fall back to the still cutout, which the boot only downloads for a monster the index does not list. Map heights live in `CemMonsters` (`MAP_H` x `MAP_SCALE`, `BOSS_H`), and `render_all.sh` ends with `tools/monsters3d/shrink_iso_sheets.py`, which resizes a sheet down to 1.5x that height (a spider is drawn 40 px tall; its full-size sheet was 21 MB of GPU memory) - the unit suite checks the sheets against the table and `test:cem:perf` fails over 100 MB of textures

**Cemetery music**: `ProtoCem` plays `assets/music/cemetery-<name>.mp3` (`?music=solveig|shanty|gothic|quirky|ominous|carousel|lullaby|tristram|none`, default `solveig`, remembered in `mrowl_cem_music`); `BOSS_TRACK` (quirky) plays during the Reaper fight via `switchMusic`; `Music.VOLUME` is 0.25, half the SFX master gain; loops are made by `tools/music/generate_loop.py` (ACE-Step, `--seconds 120` for the two-minute ones)

**Victory screen**: styled by `rpggui.css` like every other panel (wooden board, parchment stats, wooden bar button); the cemetery's loading veil says "Entering a haunted cemetery" via `setLoadingText` in cem-main.js

**Level picker**: the isometric page's dungeon/cemetery cards show `assets/proto/iso/pick-dungeon.jpg` and `pick-cemetery.jpg`, cut from the docs screenshots

**Encounter card**: `MonsterStage` (js/modules/monster-stage.js) stands the character on a painted room (`assets/proto/backdrops/<scene>_<n>.jpg`, generated by `tools/art/generate_backdrops.py`), plays sheet frames when they exist and reacts to answers (hit, lunge, exit styles in css/fx.css). The room is picked for the level theme (`setTheme`, the cemetery flow sets it) and for the kind of monster - `SCENE_FOR` puts the dragon on a hoard of gold and the dark knight in a throne hall - with two variants of each, chosen at random per fight. The illustrations are no longer used as plates: painting the character out of its own picture left a scar where it had stood. `stand`/`confine` place the figure centred, feet on the ground line, as tall as `CARD_SCALE` says its species is, and shrink it about its feet until the whole of it is inside the picture; `.monster-stage` clips, so nothing walks out of the frame - only the lunge is let out, for the moment `allowLunge` lasts (ui.js opens it for both the quiz and the matching card). MonsterStage owns the card image: ui.js must not set its own `onerror` on it (that replaced the retry for a dropped backdrop), and `release(img)` is called when a card is put away, which stops the idle loop and forgets the room. Rooms are remembered per level and monster (`roomFor`), so a monster keeps its room for the whole fight but does not carry a dungeon room into the cemetery. A sheet is fetched first; the cutout is only measured when there is no sheet. With a sheet it uses the model's facings: it opens with its back turned and spins round to meet the player, squares up before a reaction, and turns away to walk off when beaten

**Card sprite sheets** (`assets/proto/card/<id>.png|json`, `tools/monsters3d/render_cards.sh`): the card shows a monster ten times the size the isometric map does, so it has its own sheets (about 340 KB each, 12 MB for all of them; a map sheet is about 200 KB) - 448 px frames seen almost head on (`--elev 12`), lit harder (`--exposure`, `--contrast`) and rendered from a 60k-triangle, 1024 px copy of the mesh instead of the 9k/512 px model the game downloads (rebuilt whenever the generator has produced a newer mesh, and with the same loose-piece gap the game model uses, or the swarm loses its bats and the clown his balloon). Only what the card plays is kept: the idle loop facing the player, one idle frame for each facing the turn-around passes through, attack and hit facing the player, and the walk away (`--clip-facings idle:*,attack:down,hit:down,walk:up`, then the unused idle frames are dropped before packing): 28 frames a sheet. A model wider than it is tall (the dragon on its hoard, a spider, a swarm) widens the camera and renders more pixels to match, instead of having its edges cut off by the frame. Monsters without a card sheet fall back to the map sheet in `assets/proto/iso/monsters/`, and then to the still cutout

**Save Format** (version 4): `{ player, dungeon, usedQuestions, mapState, usedMatchingQuestions, level: 'dungeon'|'cemetery', cemetery? }` (older versions load as dungeon saves; the cemetery state stores the owl's float position, saves from the first cut still load)

**Illustrations** (`assets/<id>.jpg`, plus `start`, `victory`, `treasure`, `knight_owl`): JPEG, not PNG - the paintings have no transparency, and as PNG the forty of them were 31 MB of the app (now 3.5 MB). `tools/art/generate_monster.py` writes them and `tools/extract-sprites.py` reads them. The treasure and victory pictures sit in hidden markup with `data-src` and are loaded when their screen opens (`UI.loadDeferredImages`)

**Isometric palette**: `IsoTextures.DUNGEON_PALETTE` holds the colours `samplePalette` used to read off `assets/directions/n_s_e.png` at boot; both isometric scenes use the constant instead of downloading the 682 KB painting

**Tests that read files**: `tests/run-tests.js` puts `require` and `__dirname` (the tests folder) in the sandbox; tests that check files on disk guard on `typeof require` so the browser runner skips them. Before this they skipped in node too

## Bilingual Content Pattern

All user-facing text uses English/Polish pairs:
- Object properties: `name`/`namePL`, `description`/`descriptionPL`
- CSS classes: `.label-en`/`.label-pl`, `.desc-en`/`.desc-pl`
- Return format: `{ en: 'English', pl: 'Polski' }`

## Adding Content

**New questions**: Add to `vocabulary.js` or `grammar.js` arrays with format:
```javascript
{ id: 'unique_id', difficulty: 1-3, category: 'vocabulary'|'grammar',
  prompt: 'Polish text', hint: 'English hint',
  options: ['a','b','c','d'], correctIndex: 0, explanation: '...' }
```

**New monsters**: Add to `monsters.js` MONSTERS array with bilingual fields and loot array

## Testing

270+ unit tests using custom HTML test runner with `TestRunner.suite()` and `TestRunner.test()`. Test files mirror module structure in `tests/` directory.

### Testing Requirements

1. **Write tests for new functionality**: Every new feature or bug fix must include corresponding tests in the appropriate `tests/*.test.js` file.

2. **Run full test suite after changes**: `npm test` must pass before considering work complete.

3. **Test file naming**: `{module}.test.js` (e.g., `map.test.js`, `combat.test.js`)

### Test Structure
```javascript
TestRunner.suite('Module Name', () => {
  function setup() {
    // Reset state before tests
  }

  TestRunner.test('should do something', () => {
    setup();
    TestRunner.assertEqual(actual, expected, 'message');
  });
});
```

### Available Assertions
- `TestRunner.assert(condition, message)` - truthy check
- `TestRunner.assertEqual(actual, expected, message)` - strict equality
- `TestRunner.assertTruthy(value, message)` - truthy value
- `TestRunner.assertArray(value, message)` - array type check

## WebView Compatibility

Avoid ES2020+ syntax (optional chaining `?.`, nullish coalescing `??`) in JavaScript to support older Android WebViews (API 28). Use helper functions for safe property access instead.

## E2E Testing

Maestro tests in `.maestro/flows/` verify mobile app behavior. Known limitation: Android API 28 emulators have WebView touch event issues. Use API 30+ or iOS Simulator for reliable E2E testing.
