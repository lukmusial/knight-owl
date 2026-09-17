/**
 * ProtoFp
 * Bootstrap for the first-person prototype page. Mirrors the encounter flow
 * of js/main.js (enterRoom, combat, matching, treasure, dragon) but drives
 * the three.js chamber view and the shared ProtoHud chrome instead of the
 * classic page layout. No save/profile calls.
 */

var ProtoFp = (function() {
  var busy = false;
  var gameInProgress = false;
  var world = null;
  var textures = null;
  var STEP_MS = 520;
  var TURN_MS = 240;
  var REVEAL_MS = 900;

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
  function init() {
    if (typeof SFX !== 'undefined') SFX.init();
    ProtoSharedDom.inject(document.getElementById('fp-modals'));

    ProtoHud.mount({
      view: 'fp',
      compass: true,
      name: 'Mr Owl',
      controlsHtml:
        '<div class="hud-dpad">' +
        '<button type="button" class="hud-btn rpg-arrow hud-btn-forward" data-cmd="forward" aria-label="Forward">&#x25B2;</button>' +
        '<button type="button" class="hud-btn rpg-arrow hud-btn-left" data-cmd="turnLeft" aria-label="Turn left">&#x21B6;</button>' +
        '<button type="button" class="hud-btn rpg-arrow hud-btn-back" data-cmd="back" aria-label="Back">&#x25BC;</button>' +
        '<button type="button" class="hud-btn rpg-arrow hud-btn-right" data-cmd="turnRight" aria-label="Turn right">&#x21B7;</button>' +
        '</div>',
      note: { en: 'Swipe or use the pad. Tap ▲ to walk.', pl: 'Przesuń palcem lub użyj przycisków.' }
    });
    var side = document.querySelector('#hud-root .hud-dock-side');
    if (side) {
      var ng = document.createElement('button');
      ng.type = 'button';
      ng.id = 'fp-new-game';
      ng.className = 'hud-btn';
      ng.title = 'New game. Nowa gra.';
      ng.innerHTML = '&#x27F3;';
      var row = document.createElement('div');
      row.className = 'fp-dock-buttons';
      row.appendChild(ng);
      side.appendChild(row);
      ng.addEventListener('click', function() { newGame(true); });
    }

    Questions.init();
    if (typeof Matching !== 'undefined') Matching.init();

    var ok = FpRenderer.init({ mount: document.getElementById('fp-view'), reducedMotion: reducedMotion(), quality: queryParam('quality') });
    if (!ok) {
      document.getElementById('fp-nogl').classList.remove('hidden');
    }
    FpRenderer.onTorchIgnite(function(e) {
      if (e.distance < 9) fx('torch-ignite', { volume: e.focus ? 0.55 : 0.25 });
    });
    if (ok && typeof FpAmbience !== 'undefined') FpAmbience.start(FpRenderer.getSoundscape);
    FpRenderer.onRebuild(function() {
      if (!world) return;
      FpRenderer.setPose(FpWorld.getState().roomId, FpWorld.getFacing());
      refreshVisibility();
      restoreEntities();
    });
    if (side && ok) {
      var qb = document.createElement('button');
      qb.type = 'button';
      qb.id = 'fp-quality';
      qb.className = 'hud-btn';
      qb.title = 'Graphics quality. Jakość grafiki.';
      (document.querySelector('#hud-root .fp-dock-buttons') || side).appendChild(qb);
      var label = function() {
        var t = FpRenderer.getQuality() || 'medium';
        qb.textContent = t === 'high' ? 'HQ' : (t === 'low' ? 'LQ' : 'MQ');
      };
      label();
      qb.addEventListener('click', function() {
        if (busy || FpRenderer.isBusy()) return;
        var tiers = FpQuality.TIERS;
        var next = tiers[(tiers.indexOf(FpRenderer.getQuality()) + 1) % tiers.length];
        FpRenderer.setQuality(next);
        label();
      });
    }

    // First-person eyes or the over-the-shoulder camera behind Mr Owl
    if (side && ok) {
      var vb = document.createElement('button');
      vb.type = 'button';
      vb.id = 'fp-view-mode';
      vb.className = 'hud-btn';
      vb.title = 'Camera: first / third person. Kamera: pierwsza / trzecia osoba.';
      (document.querySelector('#hud-root .fp-dock-buttons') || side).appendChild(vb);
      var viewLabel = function() {
        var third = FpRenderer.getViewMode() === 'third';
        vb.textContent = third ? '3P' : '1P';
        vb.setAttribute('aria-pressed', third ? 'true' : 'false');
        vb.setAttribute('aria-label', third ? 'Third-person camera' : 'First-person camera');
      };
      viewLabel();
      vb.addEventListener('click', function() {
        if (busy || FpRenderer.isBusy()) return;
        FpRenderer.setViewMode(FpOwl.nextMode(FpRenderer.getViewMode()));
        viewLabel();
      });
    }

    // Idle in the background: stop the render loop until the app returns
    if (ok && typeof AppLifecycle !== 'undefined') {
      AppLifecycle.on({
        pause: function() { FpRenderer.stop(); if (typeof FpAmbience !== 'undefined') FpAmbience.stop(); },
        resume: function() {
          if (gameInProgress) FpRenderer.resume();
          if (typeof FpAmbience !== 'undefined') FpAmbience.start(FpRenderer.getSoundscape);
        }
      });
    }

    bindControls();
    if (typeof InputAdapter !== 'undefined') {
      InputAdapter.on('navigate', function(data) { onNavigate(data.direction, data.source); });
    }

    ProtoHud.loadSprites().then(function() {
      ProtoHud.useSpritesInModals();
      newGame(false);
      var veil = document.getElementById('fp-loading');
      if (veil) veil.classList.add('hidden');
    });
  }

  function queryParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search || '');
    return m ? decodeURIComponent(m[1]) : null;
  }

  function bindControls() {
    var buttons = document.querySelectorAll('#hud-root [data-cmd]');
    for (var i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() { runCommand(btn.dataset.cmd); });
      })(buttons[i]);
    }
  }

  /**
   * Keyboard arrows turn the way they point. Swipes drag the view instead:
   * swiping left pulls the scene left, i.e. you turn right (and vice versa).
   */
  function onNavigate(direction, source) {
    var map = { North: 'forward', South: 'back', West: 'turnLeft', East: 'turnRight' };
    if (source === 'touch' || source === 'swipe') {
      map.West = 'turnRight';
      map.East = 'turnLeft';
    }
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
  /**
   * Start or restore a run. First boot honours the launch parameters
   * (?name=&action=new|continue); the restart button starts over for the
   * same player.
   * @param {boolean} restart - Force a fresh dungeon for the current player
   */
  function newGame(restart) {
    var victory = document.getElementById('victory-screen');
    if (victory) victory.classList.add('hidden');

    var session = restart
      ? ProtoSession.startNew(Player.getName() || 'Mr Owl')
      : ProtoSession.begin('Mr Owl');
    ProtoHud.setName(session.name);

    world = FpWorld.fromDungeon();
    var entrance = session.loaded ? Player.getCurrentRoom() : Dungeon.getEntranceId();
    var facing = null;
    if (session.loaded && Player.getPreviousRoom() && Player.getPreviousRoom() !== entrance) {
      facing = FpWorld.facingBetween(Player.getPreviousRoom(), entrance);
    }
    if (!facing) {
      var cell = world.cells[entrance];
      facing = 'S';
      for (var i = 0; i < FpWorld.DIRS.length; i++) {
        if (cell && cell.exits[FpWorld.DIRS[i]]) { facing = FpWorld.DIRS[i]; break; }
      }
    }
    FpWorld.init(world, entrance, facing);
    if (!session.loaded) Player.moveTo(entrance);

    if (!textures) textures = FpTextures.procedural();
    FpRenderer.buildScene(world, textures);
    FpTextures.load().then(function(loaded) {
      textures = loaded;
      FpRenderer.buildScene(world, loaded);
      FpRenderer.setPose(FpWorld.getState().roomId, FpWorld.getFacing());
      refreshVisibility();
      restoreEntities();
      console.log('FpTextures: using ' + loaded.source + ' textures');
    });

    FpRenderer.setPose(entrance, facing);
    FpRenderer.resume();
    gameInProgress = true;
    busy = false;
    resolveRoom(entrance);
  }

  /**
   * Re-create billboards for discovered, uncleared chambers (after a rebuild)
   */
  function restoreEntities() {
    var rooms = Dungeon.getState().rooms;
    Object.keys(rooms).forEach(function(id) {
      var room = rooms[id];
      if (!DungeonMap.isExplored(id) || room.cleared) return;
      if (room.type === 'monster' && room.monster) {
        FpRenderer.setEntity(id, { kind: 'monster', imageId: room.monster.id, fromDir: entryDir(id) });
      } else if (room.type === 'boss') {
        FpRenderer.setEntity(id, { kind: 'dragon', imageId: 'dragon', fromDir: entryDir(id) });
      } else if (room.type === 'treasure') {
        FpRenderer.setEntity(id, { kind: 'treasure', imageId: 'treasure', fromDir: entryDir(id) });
      }
    });
  }

  var entryDirs = {};
  function entryDir(roomId) { return entryDirs[roomId] || FpWorld.getFacing(); }

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
    entryDirs[to] = backwards ? FpWorld.OPPOSITE[facing] : facing;
    var portal = FpWorld.portalBetween(from, to);
    if (portal) FpRenderer.openGate();
    if (portal && portal.teleport) {
      fx('door');
      FpRenderer.animateTeleport(to, facing, function() { resolveRoom(to); });
      return;
    }
    if (portal) fx('door'); else fx('step');
    if (!portal && FpRenderer.isDoorClosed(from, to)) fx('door-creak');
    fx('step', { delay: 0.25, volume: 0.7 });
    FpRenderer.animateStep(to, facing, STEP_MS, function() { resolveRoom(to); });
  }

  function turn(facing) {
    busy = true;
    fx('turn');
    FpRenderer.animateTurn(facing, TURN_MS, function() {
      busy = false;
      ProtoHud.setCompass(FpWorld.getFacing());
    });
  }

  /**
   * Fog of war: explored chambers lit, neighbours of explored chambers dim
   */
  function refreshVisibility() {
    var rooms = Dungeon.getState().rooms;
    var explored = [], seen = [];
    Object.keys(rooms).forEach(function(id) {
      if (DungeonMap.isExplored(id)) { explored.push(id); return; }
      var room = rooms[id];
      for (var i = 0; i < room.connections.length; i++) {
        if (DungeonMap.isExplored(room.connections[i])) { seen.push(id); return; }
      }
    });
    FpRenderer.setVisibility(explored, seen);
  }

  // ---------------------------------------------------------------------------
  // Room resolution (main.js enterRoom, after the camera arrived)
  // ---------------------------------------------------------------------------
  function resolveRoom(roomId) {
    var room = Dungeon.getRoom(roomId);
    if (!room) { busy = false; return; }

    var firstVisit = !DungeonMap.isExplored(roomId);
    DungeonMap.exploreRoom(roomId);
    refreshVisibility();
    updateHud();
    ProtoHud.setCompass(FpWorld.getFacing());

    if (Dungeon.hasMonsterEncounter(roomId)) {
      var kind = room.type === 'boss' ? 'dragon' : 'monster';
      var imageId = room.type === 'boss' ? 'dragon' : room.monster.id;
      if (!FpRenderer.hasEntity(roomId)) {
        FpRenderer.setEntity(roomId, { kind: kind, imageId: imageId, fromDir: entryDir(roomId), fadeMs: 700 });
      }
      if (kind === 'dragon') fx('dragon-roar', { delay: 0.3 }); else fx('reveal');
      var delay = (firstVisit && !reducedMotion()) ? REVEAL_MS : 250;
      setTimeout(function() {
        FpRenderer.pause();
        if (room.encounterType === 'matching' && typeof Matching !== 'undefined') {
          startMatchingEncounter(room.monster, room.depth, room.matchingCategory);
        } else {
          startCombat(room.monster, room.depth);
        }
      }, delay);
    } else if (room.type === 'treasure' && !room.cleared) {
      if (!FpRenderer.hasEntity(roomId)) {
        FpRenderer.setEntity(roomId, { kind: 'treasure', imageId: 'treasure', fromDir: entryDir(roomId), fadeMs: 500 });
      }
      fx('reveal');
      setTimeout(function() {
        FpRenderer.pause();
        startTreasureEncounter(roomId);
      }, reducedMotion() ? 100 : 650);
    } else {
      busy = false;
    }
  }

  function updateHud() {
    var stats = Player.getQuestionStats();
    ProtoHud.updateStats({
      monstersDefeated: Player.getMonstersDefeated(),
      questionsCorrect: stats.correct,
      questionsTotal: stats.total,
      totalLoot: Player.getTotalLootValue()
    });
    ProtoHud.setLoot(Player.getInventory());
    ProtoHud.setMinimap(DungeonMap.renderSVG(Player.getCurrentRoom()));
    ProtoHud.setRoom(Dungeon.getRoom(Player.getCurrentRoom()));
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
    // Mr Owl swings his sword at the monster on a correct answer (third-person camera)
    if (result.success) FpRenderer.playOwl('attack');
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
      updateHud();
      ProtoSession.autoSave();
      FpRenderer.resume();
      busy = false;
    });
  }

  function handleResultContinue(result) {
    updateHud();
    FpRenderer.resume();

    if (result.pushedBack) {
      // Player.pushBack() already moved us; slide the camera back facing the monster
      var cur = Player.getCurrentRoom();
      var monsterRoom = Player.getPreviousRoom();
      var facing = FpWorld.facingBetween(cur, monsterRoom) || FpWorld.getFacing();
      FpWorld.setPosition(cur, facing);
      fx('knockback');
      FpRenderer.animateKnockback(cur, facing, 520, function() {
        DungeonMap.exploreRoom(cur);
        refreshVisibility();
        updateHud();
        ProtoHud.setCompass(FpWorld.getFacing());
        ProtoSession.autoSave();
        busy = false;
      });
      return;
    }
    ProtoSession.autoSave();

    FpRenderer.removeEntity(Player.getCurrentRoom());
    busy = false;
  }

  function showVictory() {
    FpRenderer.stop();
    ProtoSession.finishRun();
    UI.showVictoryScreen(Player.getGameSummary(), function() { window.location.href = ProtoSession.launcherUrl(Player.getName()); });
  }

  /**
   * Debug helper (screenshots/tests): jump straight into a chamber
   */
  function debugJump(roomId, facing) {
    if (!world || !world.cells[roomId]) return false;
    facing = facing || FpWorld.getFacing();
    Player.moveTo(roomId);
    FpWorld.setPosition(roomId, facing);
    entryDirs[roomId] = facing;
    FpRenderer.setPose(roomId, facing);
    busy = true;
    resolveRoom(roomId);
    return true;
  }

  function getDebugState() {
    return {
      busy: busy,
      gameInProgress: gameInProgress,
      world: FpWorld.getState(),
      pose: FpRenderer.getPose(),
      player: Player.getCurrentRoom(),
      calls: FpRenderer.getRenderInfo() ? FpRenderer.getRenderInfo().calls : null,
      triangles: FpRenderer.getRenderInfo() ? FpRenderer.getRenderInfo().triangles : null,
      quality: FpRenderer.getQuality(),
      lights: FpRenderer.getLightInfo()
    };
  }

  return {
    init: init,
    newGame: newGame,
    runCommand: runCommand,
    debugJump: debugJump,
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
