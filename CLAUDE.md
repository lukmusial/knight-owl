# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mr Owl's Dungeon Adventure - A browser-based Polish language learning game where players explore a dungeon, answering Polish vocabulary and grammar questions to defeat monsters. Target audience: children learning Polish.

## Development Commands

**Run the game**: `npm start` or open `index.html` in a browser

**Run tests**:
- Command line: `npm test` or `node tests/run-tests.js`
- Browser: Open `tests/test-runner.html`

**Build maze library** (only needed if modifying dungeon generation):
```bash
npm run build
```

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

### Module Responsibilities

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

**Dungeon Generation** (dungeon.js):
- MAZE_WIDTH: 7, MAZE_HEIGHT: 6 (creates 42-cell grid)
- MIN_MONSTER_ROOMS: 20
- Difficulty scaling: depths 1-7 (easy), 8-14 (medium), 15+ (hard)

**Dragon Boss**: 3 consecutive correct answers required; wrong answer resets streak and pushes player back

**Save Format** (version 2): `{ player, dungeon, usedQuestions, mapState }`

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

Custom HTML test runner with `TestRunner.suite()` and `TestRunner.test()`. Test files mirror module structure in `tests/` directory.

### Testing Requirements

**IMPORTANT**: Follow these testing practices for all changes:

1. **Write tests for new functionality**: Every new feature or bug fix must include corresponding tests in the appropriate `tests/*.test.js` file. Create a new test file if adding a new module.

2. **Run full test suite after changes**: After making any code changes, open `tests/test-runner.html` in a browser to verify all tests pass. Do not consider work complete until tests are green.

3. **Test file naming**: `{module}.test.js` (e.g., `map.test.js`, `combat.test.js`)

### Test Structure
```javascript
TestRunner.suite('Module Name', () => {
  function setup() {
    // Reset state before tests
  }

  TestRunner.test('should do something', () => {
    setup();
    // Arrange, Act, Assert
    TestRunner.assertEqual(actual, expected, 'message');
  });
});
```

### Available Assertions
- `TestRunner.assert(condition, message)` - truthy check
- `TestRunner.assertEqual(actual, expected, message)` - strict equality
- `TestRunner.assertTruthy(value, message)` - truthy value
- `TestRunner.assertArray(value, message)` - array type check
