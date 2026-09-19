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
- 3D view render-loop check (headless Chrome, walks 20 steps, fails if the view starts running more than one animation loop): `npm run test:fp:perf`
- 3D view playthrough videos (headless Chrome on the GPU): `npm run record:fp` (a minute of exploring) and `npm run record:fp:dragon` (walks to the boss chamber and beats the dragon)
- Cemetery playthrough video (headless Chrome on the GPU, plays gate to Grim Reaper and encodes it with ffmpeg): `npm run record:cem`
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
| FpMonsters | `js/proto/fp-monsters.js` | 3D models of the level-1 monsters (`assets/proto/fp/monsters/`, pipeline in `tools/monsters3d/`), procedural idle/flinch/lunge |
| FpOwl | `js/proto/fp-owl.js` | Rigged 3D Mr Owl (`assets/proto/fp/mr_owl.glb`, pipeline in `tools/owl3d/`) and the third-person camera placement |
| IsoModel / scenes | `js/proto/iso-*.js` | Isometric fog-of-war prototype (pure tile model + Phaser scenes + bootstrap; `iso-main.js` also holds the dungeon/cemetery level picker) |
| CemModel | `js/proto/cem-model.js` | Halloween cemetery level: seeded organic generator (fence, gate, lanes, graves, tombs, lanterns, decor), A* walking, wandering monsters with proximity attacks, skeleton-key gating, night visibility, save state (pure, node-tested) |
| CemMonsters / CemMinimap | `js/proto/cem-monsters.js`, `cem-minimap.js` | Procedural gaits and reactions of the 2D monster cutouts; SVG minimap of the cemetery (pure) |
| CemWorld / CemStick / CemPerf | `js/proto/cem-world.js`, `cem-stick.js`, `cem-perf.js` | Chunked ground and depth bands; dock thumb-stick; `?perf=1` overlay |
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

**Dungeon Generation** (dungeon.js):
- MAZE_WIDTH: 7, MAZE_HEIGHT: 6 (creates 42-cell grid)
- MIN_MONSTER_ROOMS: 20
- Difficulty scaling: depths 1-7 (easy), 8-14 (medium), 15+ (hard)

**Bosses** (`Combat.isBoss`: `boss: true` or difficulty 4): the dragon in the dungeon and the Grim Reaper in the cemetery need 3 consecutive correct answers; a wrong answer resets the streak and pushes the player back (cemetery: back to the gate)

**Cemetery level** (cem-model.js): 60x52 tile grid with a 1-tile fence ring and 2-3 tile wide winding lanes, 4 small tombs (2x2, named guardians banshee/pumpkin_man/skeleton/ghost with key parts 1..4) + 1 large tomb (3x3, Grim Reaper), ~16 wandering monsters banded by lane distance (`WANDERER_BANDS`), sight radius 4 around Mr Owl plus 3 around each lamp post. Mr Owl moves continuously (`tickOwl`, `moveBy`, `OWL_SPEED` tiles/s, circle radius `OWL_RADIUS`) steered by the dock thumb-stick (`cem-stick.js`), drag or keys; tap-to-walk still uses A* (`pathTo` + `setPath`)

**Cemetery rendering** (cem-world.js): ground, prop shadows and lantern pools are baked into pooled 8x8-tile render textures; props live in depth-band Layers with cell culling; the night is a masked overlay that follows Mr Owl (`buildFog`). `?perf=1` shows frame rate, logic time, draw calls and the chunk pool

**Night reveal**: tiles within `VIS_OWL` of Mr Owl are lit; tiles out to `VIS_OWL + SEEN_EXTRA` become remembered (dim) first, so ground surfaces under the dark edge of the fog and brightens as he nears rather than popping; props of newly seen tiles fade in (`fadeIn`). The fog overlay is 0.8 dark with the owl's light reaching `VIS_OWL + 2.5`

**Fliers**: `HOVER_PX` in cem-scenes.js lifts bats, wisps and spectres above their ground shadow

**Tomb doorways**: the crypt art has its own arch; the kit manifest's `portal` (sill centre and arch size as sprite fractions, measured off `tomb_small.png`/`tomb_large.png`, kept in `tools/iso/cemetery_models.json`) says where. `CemTextures.makeDoorLights` builds the arch light and the ground spill at that pixel size, `buildTombs` hangs them on the sill, `refreshTombs` tints them (gold waiting, blue taken, red sealed). The spill lies in the ground layer (`addProp` with `ground: true`), under whoever stands in it, and is built from overlapping soft pools so it has no edge. A crypt without a portal gets a drawn opening instead

**The Reaper's entrance**: `CemModel.bossRises` fires a `boss_rises` event the first time Mr Owl comes within `REVEAL_RADIUS` tiles of the great tomb's door holding all four parts; the flow calls `revealBoss(null, true)`, which stands him on the door tile in a `smokeBurst` and keeps him shown from afar (`keepShown`). Entering the door then starts the fight without a second reveal

**Eight-way facing**: both Mr Owl and the cemetery monsters are rendered in five facings (`down`, `down_right`, `right`, `up_right`, `up`); `CemMonsters.facingFor(gx, gy, facings)` maps a grid direction onto one of eight screen directions, mirroring three of them. Sheets that still carry the old `front`/`back` pair keep working. Monsters hold a heading that turns toward where they are going (`turnMonster`, `TURN_RATE`) and roam on eight directions (`CemModel.DIRS8`, diagonals need both straight neighbours clear)

**Cemetery monsters**: rendered sprite sheets (`assets/proto/iso/monsters/<id>.png|json`, built by `tools/monsters3d/render_monster_iso.py` + `render_all.sh`, packed with `tools/owl3d/pack_sprites.py --quant 128`; `render_all.sh` records a per-model yaw where a model's front is off-axis, the ghost at -45 and the lost soul at 90) with walk/idle/attack/hit clips in five facings; `CemMonsters.clipFor` picks the clip, `pose` adds the reactions. Missing sheets fall back to the still cutout

**Cemetery music**: `ProtoCem` plays `assets/music/cemetery-<name>.mp3` (`?music=gothic|quirky|ominous|carousel|shanty|lullaby|none`, remembered in `mrowl_cem_music`); loops are made by `tools/music/generate_loop.py` (ACE-Step)

**Victory screen**: styled by `rpggui.css` like every other panel (wooden board, parchment stats, wooden bar button); the cemetery's loading veil says "Entering a haunted cemetery" via `setLoadingText` in cem-main.js

**Encounter card**: `MonsterStage` (js/modules/monster-stage.js) lifts the character off the painted scene onto its own layer over an inpainted backdrop (`assets/proto/monsters/<id>_bg.jpg`), plays sheet frames when they exist and reacts to answers (hit, lunge, exit styles in css/fx.css). `CARD_SCALE` sizes each species about its feet (spider small, Reaper towering; node-tested in tests/monster-stage.test.js). With a sheet it uses the model's facings: it opens with its back turned and spins round to meet the player, squares up before a reaction, and turns away to walk off when beaten. Backdrops are painted by `tools/extract-sprites.py --bg-only`, which inpaints the character out and blends the patch back with a distance feather

**Save Format** (version 4): `{ player, dungeon, usedQuestions, mapState, usedMatchingQuestions, level: 'dungeon'|'cemetery', cemetery? }` (older versions load as dungeon saves; the cemetery state stores the owl's float position, saves from the first cut still load)

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
