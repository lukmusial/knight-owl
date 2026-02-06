# Architecture

This document describes the technical architecture of Mr Owl's Dungeon Adventure.

## Overview

The game is a single-page application built with vanilla JavaScript (no framework, no build step). It runs in the browser and on Android/iOS via [Capacitor](https://capacitorjs.com/). All game code lives under `www/` and loads as plain `<script>` tags.

## Module System

Every module uses the **IIFE (Immediately Invoked Function Expression)** pattern for encapsulation:

```javascript
const ModuleName = (function() {
  // private state and helpers
  let state = {};
  function helper() {}

  // public API
  return { publicMethod };
})();
```

Modules also export via `module.exports` when running under Node.js, enabling the test suite to `require()` them directly.

## Module Map

```
Game (main.js) ── orchestrator
│
├── Dungeon ──────── procedural maze generation, room graph
├── Player ───────── character state, inventory, movement
├── Combat ───────── quiz encounters, answer validation
├── Questions ────── question pool, selection, difficulty
├── UI ───────────── DOM rendering, modals, bilingual display
├── DungeonMap ───── SVG map visualization, fog-of-war
├── Descriptions ─── bilingual room/monster text generation
└── Save ─────────── localStorage / native persistence
```

### Module Responsibilities

| Module | File | Role |
|--------|------|------|
| **Game** | `js/main.js` | Top-level controller. Wires modules together, handles game lifecycle (new game, load, navigation, combat, victory). |
| **Dungeon** | `js/modules/dungeon.js` | Generates a 7x6 procedural maze (42 rooms). Manages the room graph, monster placement, depth-based difficulty, and room clearing. |
| **Player** | `js/modules/player.js` | Holds all player state: current room, previous room, inventory, combat stats, dragon streak counter. Supports push-back mechanic. |
| **Combat** | `js/modules/combat.js` | Runs quiz-based encounters. Regular monsters require 1 correct answer. The dragon boss requires 3 consecutive correct answers; a wrong answer resets the streak and pushes the player back. |
| **Questions** | `js/modules/questions.js` | Loads vocabulary and grammar questions from data files. Selects questions by difficulty, shuffles options (Fisher-Yates), and tracks used questions to avoid repeats. |
| **UI** | `js/modules/ui.js` | All DOM manipulation. Renders screens (start, game, victory), modals (quiz, result, treasure), stats, inventory, and the dungeon map. Handles bilingual label display. |
| **DungeonMap** | `js/modules/map.js` | Renders an SVG dungeon map with fog-of-war. Explored rooms are color-coded by type. Unexplored rooms adjacent to explored ones appear as dark nodes. Current room pulses. |
| **Descriptions** | `js/modules/descriptions.js` | Generates bilingual (English/Polish) narrative text for rooms, monsters, navigation directions, and combat outcomes. Multiple variants per room type. |
| **Save** | `js/modules/save.js` | Serializes game state to storage. Supports multiple save slots keyed by player name. Uses StorageAdapter for cross-platform persistence. |

### Dependencies

```
Combat ────→ Questions, Player, Dungeon, Descriptions
Game ──────→ all modules (orchestrator)
UI ────────→ Descriptions, AudioAdapter, DungeonMap
DungeonMap → Dungeon
Dungeon ───→ Descriptions
Save ──────→ Player, Dungeon, Questions, DungeonMap (reads state)
Player ────→ (independent)
Questions ─→ (independent, loaded from data files)
```

## Platform Abstraction Layer

The game runs on three platforms from one codebase using an **adapter pattern**:

```
                ┌─────────────────────────┐
                │       Game Modules       │
                │  (Dungeon, Combat, UI…)  │
                └────────────┬────────────┘
                             │
                ┌────────────┴────────────┐
                │     Abstract Adapters    │
                │  Storage · Audio · Input │
                └────────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴───┐  ┌──────┴─────┐  ┌─────┴──────┐
     │  Browser   │  │  Android   │  │    iOS     │
     │ localStorage│  │ Capacitor  │  │ Capacitor  │
     │ Web Speech │  │ Preferences│  │ Preferences│
     │ Keyboard   │  │ Native TTS │  │ Native TTS │
     │ Touch/Swipe│  │ Haptics    │  │ Haptics    │
     └────────────┘  └────────────┘  └────────────┘
```

### Adapters (`js/adapters/`)

| Adapter | Interface Methods |
|---------|-------------------|
| **StorageAdapter** | `save(key, value)`, `load(key)`, `remove(key)`, `listKeys(prefix)` |
| **AudioAdapter** | `speak(text, options)`, `stopSpeaking()`, `setLanguage(lang)`, `getVoices()` |
| **InputAdapter** | `on(event, callback)`, `emit(event, data)` — event-based navigation |

### Platform Implementations

| Platform | Storage | Audio | Input | Extra |
|----------|---------|-------|-------|-------|
| **Browser** | `localStorage` | Web Speech API (Polish TTS) | Keyboard + touch/swipe | — |
| **Capacitor** | Native Preferences plugin | Native TTS plugin | Keyboard + touch/swipe | Haptic feedback |

### Platform Detection (`js/platform-init.js`)

On `DOMContentLoaded`, the initializer checks for Capacitor's native bridge:
1. `Capacitor.isNativePlatform()` is true → use Capacitor adapters (with Browser fallbacks)
2. Otherwise → use Browser adapters

## Game Flow

```
┌──────────────┐
│ Start Screen │  Enter name → New Adventure / Continue Adventure
└──────┬───────┘
       │
┌──────▼───────┐
│  enterRoom() │◄─────────────────────────────┐
│              │                               │
│  Move player │                               │
│  Explore map │                               │
│  Render room │                               │
└──────┬───────┘                               │
       │                                       │
       ├── Monster? ──► startCombat()          │
       │                    │                  │
       │               Show question           │
       │                    │                  │
       │               ┌────┴────┐             │
       │            Correct    Wrong           │
       │               │         │             │
       │          Clear room   Push back       │
       │          Award loot   to prev room    │
       │               │         │             │
       │               └────┬────┘             │
       │                    │                  │
       ├── Treasure? ──► Show loot modal ──────┤
       │                                       │
       └── Empty? ──► Show navigation ─────────┘
                          │
                     Dragon defeated?
                          │
                   ┌──────▼──────┐
                   │   Victory   │
                   │   Screen    │
                   └─────────────┘
```

### Dragon Boss Fight

The dragon is a special encounter requiring 3 consecutive correct answers:
- Each correct answer increments the streak counter
- Streak reaches 3 → dragon defeated, game won
- Any wrong answer resets the streak to 0 and pushes the player back

## Dungeon Generation

1. **Maze creation**: The `generate-maze` library produces a 7x6 grid with carved passages
2. **Room assignment**: Each cell becomes a room; connections follow carved walls
3. **Entrance**: Top-left corner (0,0)
4. **Boss placement**: BFS finds the room at maximum depth from entrance; the dragon goes there
5. **Depth calculation**: BFS from entrance assigns depth to every room
6. **Monster placement**: Up to 20 rooms get monsters, avoiding entrance and boss room
7. **Treasure rooms**: Dead-end corridors become treasure rooms
8. **Difficulty scaling**: Depth 1-7 → easy, 8-14 → medium, 15+ → hard questions

## Data Model

### Room
```javascript
{ id, x, y, type, monster, connections[], cleared, depth, description }
```
Types: `entrance`, `corridor`, `monster`, `treasure`, `boss`

### Question
```javascript
{ id, difficulty, category, prompt, hint, options[], correctIndex, explanation }
```
- `prompt`: Polish text (the question)
- `hint`: English translation/context
- `options[]`: shuffled before display, `correctIndex` recalculated

### Monster
```javascript
{ name, namePL, description, descriptionPL, image, loot[] }
```

### Save Format (v2)
```javascript
{
  version: 2,
  player: { name, currentRoom, inventory, stats... },
  dungeon: { rooms, connections, entranceId, bossId },
  usedQuestions: ["id1", "id2", ...],
  mapState: { explored: ["room1", "room2", ...], positions },
  timestamp: Date.now()
}
```

## Bilingual Content

All user-facing text is displayed in both English and Polish:

- **Object properties**: `name` / `namePL`, `description` / `descriptionPL`
- **Structured labels**: `{ en: "English text", pl: "Polski tekst" }`
- **CSS classes**: `.label-en` / `.label-pl`, `.desc-en` / `.desc-pl`
- **TTS**: Polish pronunciation via AudioAdapter (Web Speech API or native)

## File Structure

```
www/
├── index.html                    Single-page app shell
├── css/styles.css                All styles (responsive, dark medieval theme)
├── assets/                       Character + monster artwork (PNG)
│   └── directions/               Direction arrow icons
├── js/
│   ├── main.js                   Game controller
│   ├── platform-init.js          Platform detection
│   ├── adapters/                 Abstract interfaces
│   │   ├── StorageAdapter.js
│   │   ├── AudioAdapter.js
│   │   └── InputAdapter.js
│   ├── platforms/
│   │   ├── browser/              Browser implementations
│   │   └── capacitor/            Native implementations
│   ├── modules/                  Core game logic
│   │   ├── dungeon.js
│   │   ├── player.js
│   │   ├── combat.js
│   │   ├── questions.js
│   │   ├── ui.js
│   │   ├── map.js
│   │   ├── descriptions.js
│   │   └── save.js
│   ├── data/                     Content databases
│   │   ├── vocabulary.js
│   │   ├── vocabulary-reverse.js
│   │   ├── grammar.js
│   │   └── monsters.js
│   └── lib/
│       └── maze.js               Bundled maze generator
├── android/                      Capacitor Android project
├── ios/                          Capacitor iOS project
└── tests/                        Unit + E2E tests
```

## Testing

- **Unit tests**: 170+ tests using a custom `TestRunner` (runs in browser and Node.js)
- **E2E tests**: Maestro YAML flows for mobile automation
- **WebView compatibility**: No ES2020+ syntax (`?.`, `??`) to support Android API 28
