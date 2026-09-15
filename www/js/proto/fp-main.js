/**
 * ProtoFp
 * Bootstrap for the first-person prototype page. Mirrors the encounter flow
 * of js/main.js (enterRoom, combat, matching, treasure, dragon) but drives a
 * three.js view instead of the room illustration. No save/profile calls.
 */

var ProtoFp = (function() {
  var busy = false;
  var gameInProgress = false;
  var world = null;
  var textures = null;
  var STEP_MS = 250;
  var TURN_MS = 200;

  function fx(name, opts) {
    if (typeof FX !== 'undefined' && FX.play) FX.play(name, opts);
  }

  function haptic(name) {
    if (typeof FX !== 'undefined' && FX.haptic) FX.haptic(name);
  }

  function modalOpen() {
    return !!document.querySelector('.modal:not(.hidden)');
  }

  function reducedMotion() {
    return typeof FX !== 'undefined' && FX.reducedMotion ? FX.reducedMotion() : false;
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function whenPlatformReady() {
    return new Promise(function(resolve) {
      var tries = 0;
      (function check() {
        if (typeof Platform === 'undefined' || Platform.isInitialized() || tries > 40) return resolve();
        tries++;
        setTimeout(check, 50);
      })();
    });
  }

  function init() {
    if (typeof SFX !== 'undefined') SFX.init();
    ProtoSharedDom.inject(document.getElementById('fp-modals'));

    Questions.init();
    if (typeof Matching !== 'undefined') Matching.init();

    var ok = FpRenderer.init({ mount: document.getElementById('fp-view'), reducedMotion: reducedMotion() });
    if (!ok) {
      document.getElementById('fp-nogl').classList.remove('hidden');
    }

    bindControls();
    if (typeof InputAdapter !== 'undefined') {
      InputAdapter.on('navigate', function(data) { onNavigate(data.direction); });
    }

    var newGameBtn = document.getElementById('fp-new-game');
    if (newGameBtn) newGameBtn.addEventListener('click', newGame);

    newGame();
  }

  function bindControls() {
    var buttons = document.querySelectorAll('#fp-controls [data-cmd]');
    for (var i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() { runCommand(btn.dataset.cmd); });
      })(buttons[i]);
    }
  }

  function onNavigate(direction) {
    var map = { North: 'forward', South: 'back', West: 'turnLeft', East: 'turnRight' };
    if (map[direction]) runCommand(map[direction]);
  }

  function runCommand(cmd) {
    if (!gameInProgress || busy || modalOpen() || FpRenderer.isBusy()) return;
    switch (cmd) {
      case 'forward': forward(); break;
      case 'back': back(); break;
      case 'turnLeft': turn(FpWorld.turnLeft()); break;
      case 'turnRight': turn(FpWorld.turnRight()); break;
    }
  }

  // ---------------------------------------------------------------------------
  // Game setup
  // ---------------------------------------------------------------------------
  function newGame() {
    var victory = document.getElementById('victory-screen');
    if (victory) victory.classList.add('hidden');

    Questions.resetUsed();
    if (typeof Matching !== 'undefined') Matching.resetUsed();
    Player.reset();
    Player.create('Explorer');
    DungeonMap.init();
    Dungeon.generate();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    world = FpWorld.fromDungeon();
    var entrance = Dungeon.getEntranceId();
    var entranceCell = world.cells[entrance];
    var facing = 'S';
    for (var i = 0; i < FpWorld.DIRS.length; i++) {
      if (entranceCell.exits[FpWorld.DIRS[i]]) { facing = FpWorld.DIRS[i]; break; }
    }
    FpWorld.init(world, entrance, facing);
    Player.moveTo(entrance);

    if (!textures) textures = FpTextures.procedural();
    FpRenderer.buildScene(world, textures);
    FpTextures.load().then(function(loaded) {
      textures = loaded;
      FpRenderer.setTextures(loaded);
      console.log('FpTextures: using ' + loaded.source + ' textures');
    });

    placeEntities();
    FpRenderer.setPose(entrance, facing);
    FpRenderer.resume();
    gameInProgress = true;
    busy = false;
    resolveRoom(entrance);
  }

  function placeEntities() {
    var rooms = Dungeon.getState().rooms;
    Object.keys(rooms).forEach(function(id) {
      var room = rooms[id];
      if (room.type === 'monster' && !room.cleared && room.monster) {
        FpRenderer.setEntity(id, { kind: 'monster', imageId: room.monster.id });
      } else if (room.type === 'boss' && !room.cleared) {
        FpRenderer.setEntity(id, { kind: 'dragon', imageId: 'dragon' });
      } else if (room.type === 'treasure' && !room.cleared) {
        FpRenderer.setEntity(id, { kind: 'treasure', imageId: 'treasure' });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Movement
  // ---------------------------------------------------------------------------
  function forward() {
    if (!FpWorld.canStepForward()) {
      fx('bump');
      busy = true;
      FpRenderer.animateBump(function() { busy = false; });
      return;
    }
    var from = FpWorld.getState().roomId;
    var to = FpWorld.stepForward();
    moveTo(from, to, FpWorld.getFacing(), false);
  }

  function back() {
    if (!FpWorld.canStepBackward()) {
      turn(FpWorld.turnAround());
      return;
    }
    var from = FpWorld.getState().roomId;
    var to = FpWorld.stepBackward();
    moveTo(from, to, FpWorld.getFacing(), true);
  }

  function moveTo(from, to, facing, backwards) {
    busy = true;
    Player.moveTo(to);
    haptic('onNavigation');
    var portal = FpWorld.portalBetween(from, to);
    if (portal && portal.teleport) {
      fx('door');
      FpRenderer.animateTeleport(to, facing, function() { resolveRoom(to); });
      return;
    }
    if (portal) fx('door'); else fx('step');
    FpRenderer.animateStep(to, facing, STEP_MS, function() { resolveRoom(to); });
  }

  function turn(facing) {
    busy = true;
    fx('turn');
    FpRenderer.animateTurn(facing, TURN_MS, function() {
      busy = false;
      updateCompass();
      refreshVisibleEntities();
    });
  }

  function updateCompass() {
    var el = document.getElementById('fp-compass');
    if (el) el.textContent = FpWorld.getFacing();
  }

  /**
   * Fog-of-war predicate: explored, or adjacent to an explored room
   * (same rule DungeonMap uses internally for the SVG map)
   */
  function isRoomSeen(roomId) {
    if (DungeonMap.isExplored(roomId)) return true;
    var room = Dungeon.getRoom(roomId);
    if (!room) return false;
    for (var i = 0; i < room.connections.length; i++) {
      if (DungeonMap.isExplored(room.connections[i])) return true;
    }
    return false;
  }

  /**
   * Only rooms the player has seen (explored or adjacent) show their occupant
   */
  function refreshVisibleEntities() {
    var rooms = Dungeon.getState().rooms;
    Object.keys(rooms).forEach(function(id) {
      if (!FpRenderer.hasEntity(id)) return;
      var seen = isRoomSeen(id);
      var here = id === Player.getCurrentRoom();
      FpRenderer.hideEntity(id, !seen || here);
    });
  }

  // ---------------------------------------------------------------------------
  // Room resolution (main.js enterRoom, after the camera arrived)
  // ---------------------------------------------------------------------------
  function resolveRoom(roomId) {
    var room = Dungeon.getRoom(roomId);
    if (!room) { busy = false; return; }

    DungeonMap.exploreRoom(roomId);
    updateUI();
    updateCompass();
    refreshVisibleEntities();

    if (Dungeon.hasMonsterEncounter(roomId)) {
      FpRenderer.pause();
      if (room.encounterType === 'matching' && typeof Matching !== 'undefined') {
        startMatchingEncounter(room.monster, room.depth, room.matchingCategory);
      } else {
        startCombat(room.monster, room.depth);
      }
    } else if (room.type === 'treasure' && !room.cleared) {
      FpRenderer.pause();
      startTreasureEncounter(roomId);
    } else {
      busy = false;
    }
  }

  function updateUI() {
    var stats = Player.getQuestionStats();
    UI.renderStats({
      monstersDefeated: Player.getMonstersDefeated(),
      questionsCorrect: stats.correct,
      questionsTotal: stats.total,
      accuracy: stats.percentage,
      totalLoot: Player.getTotalLootValue()
    });
    UI.renderInventory(Player.getInventory());
    UI.renderMap(DungeonMap.renderSVG(Player.getCurrentRoom()));
    UI.renderRoom(Dungeon.getRoom(Player.getCurrentRoom()));
  }

  // ---------------------------------------------------------------------------
  // Encounters (mirror of main.js)
  // ---------------------------------------------------------------------------
  function startCombat(monster, depth) {
    var difficulty = Dungeon.getDepthDifficulty(depth);
    var encounter = Combat.startEncounter(monster, difficulty);
    UI.showQuizModal(encounter, handleAnswer);
  }

  function handleAnswer(answerIndex) {
    var result = Combat.submitAnswer(answerIndex);
    if (result.error) { console.error(result.error); return; }

    var fxDone = (typeof UI.playAnswerFx === 'function') ? UI.playAnswerFx(answerIndex, result) : Promise.resolve();
    fxDone.then(function() {
      if (result.dragonDefeated) {
        gameInProgress = false;
        Dungeon.clearRoom(Dungeon.getBossId());
        UI.hideQuizModal();
        UI.showResultModal(result, showVictory);
        return;
      }
      if (result.success && !result.defeated && result.nextQuestion) {
        UI.updateQuizQuestion(result.nextQuestion, result.streak, handleAnswer);
        return;
      }
      UI.hideQuizModal();
      UI.showResultModal(result, handleResultContinue);
    });
  }

  function startMatchingEncounter(monster, depth, category) {
    var difficulty = Dungeon.getDepthDifficulty(depth);
    var set = Matching.getMatchingSet(difficulty, category);
    if (!set) { startCombat(monster, depth); return; }
    UI.showMatchingModal({ monster: monster, set: set }, function(success) {
      handleMatchingComplete(success, monster, set);
    });
  }

  function handleMatchingComplete(success, monster, set) {
    UI.hideMatchingModal();
    var result;
    if (success) {
      var loot = monster.loot || [];
      Player.addLoot(loot);
      Player.defeatMonster();
      Player.recordQuestion(true);
      Dungeon.clearRoom(Player.getCurrentRoom());
      result = {
        success: true, defeated: true, loot: loot,
        message: Descriptions.generateVictoryMessage(monster),
        explanation: set.explanation || ''
      };
    } else {
      Player.pushBack();
      Player.recordQuestion(false);
      result = {
        success: false, defeated: false, pushedBack: true,
        message: Descriptions.generateDefeatMessage(monster),
        explanation: set.explanation || ''
      };
    }
    UI.showResultModal(result, handleResultContinue);
  }

  function startTreasureEncounter(roomId) {
    var loot = (typeof getRandomTreasure !== 'undefined') ? getRandomTreasure()
      : [{ name: 'Gold Coins', namePL: 'Złote Monety', value: 10 }];
    UI.showTreasureModal(loot, function(items) {
      items.forEach(function(item) { Player.addLoot(item); });
      Dungeon.clearRoom(roomId);
      FpRenderer.removeEntity(roomId);
      updateUI();
      FpRenderer.resume();
      busy = false;
    });
  }

  function handleResultContinue(result) {
    updateUI();
    FpRenderer.resume();

    if (result.pushedBack) {
      // Player.pushBack() already moved us; slide the camera back facing the monster
      var cur = Player.getCurrentRoom();
      var monsterRoom = Player.getPreviousRoom();
      var facing = FpWorld.facingBetween(cur, monsterRoom) || FpWorld.getFacing();
      FpWorld.setPosition(cur, facing);
      fx('knockback');
      FpRenderer.animateKnockback(cur, facing, 350, function() {
        DungeonMap.exploreRoom(cur);
        updateUI();
        updateCompass();
        refreshVisibleEntities();
        busy = false;
      });
      return;
    }

    FpRenderer.removeEntity(Player.getCurrentRoom());
    refreshVisibleEntities();
    busy = false;
  }

  function showVictory() {
    FpRenderer.pause();
    UI.showVictoryScreen(Player.getGameSummary(), newGame);
  }

  function getDebugState() {
    return {
      busy: busy,
      gameInProgress: gameInProgress,
      world: FpWorld.getState(),
      pose: FpRenderer.getPose(),
      player: Player.getCurrentRoom()
    };
  }

  return {
    init: init,
    newGame: newGame,
    runCommand: runCommand,
    getDebugState: getDebugState
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  (function waitPlatform(tries) {
    if (typeof Platform === 'undefined' || Platform.isInitialized() || tries > 40) {
      ProtoFp.init();
      return;
    }
    setTimeout(function() { waitPlatform(tries + 1); }, 50);
  })(0);
});
