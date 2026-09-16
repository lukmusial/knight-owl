/**
 * ProtoIso
 * Bootstrap and game flow for the isometric prototype page. Mirrors the
 * encounter flow of js/main.js (enterRoom, combat, matching, treasure,
 * dragon victory) without save/profile persistence.
 */

var ProtoIso = (function() {
  var session = null;
  var game = null;
  var scene = null;
  var busy = false;
  var currentNavOptions = [];
  var gameInProgress = false;

  function fx(name, opts) {
    if (typeof FX !== 'undefined' && FX.play) FX.play(name, opts);
  }

  function connectedIds(roomId) {
    var room = Dungeon.getRoom(roomId);
    return room && room.connections ? room.connections : [];
  }

  function setModalOpen(open) {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('modal-open', !!open);
    }
    if (scene) scene.setInputEnabled(!open);
  }

  function showLoading(show) {
    var el = document.getElementById('iso-loading');
    if (el) el.classList.toggle('hidden', !show);
  }

  var CONTROLS_HTML =
    '<div id="direction-bar" class="hud-cross">' +
      '<button type="button" class="hud-btn rpg-arrow dir-btn dir-north" data-direction="North" disabled aria-label="North">&#x2191;</button>' +
      '<button type="button" class="hud-btn rpg-arrow dir-btn dir-west" data-direction="West" disabled aria-label="West">&#x2190;</button>' +
      '<button type="button" class="hud-btn rpg-arrow dir-btn dir-east" data-direction="East" disabled aria-label="East">&#x2192;</button>' +
      '<button type="button" class="hud-btn rpg-arrow dir-btn dir-south" data-direction="South" disabled aria-label="South">&#x2193;</button>' +
    '</div>';

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  function boot() {
    // HUD first (creates #direction-bar, #dungeon-map, #room-description), then the
    // shared modals + UI.init() so ui.js caches every element
    ProtoHud.mount({
      root: document.body,
      view: 'iso',
      controlsHtml: CONTROLS_HTML,
      compass: false,
      note: { en: 'Tap a lit chamber or use the compass.', pl: 'Dotknij komnaty lub użyj kompasu.' }
    });
    ProtoSharedDom.inject(document.getElementById('iso-modals'));
    if (typeof SFX !== 'undefined') {
      SFX.init();
      // Kenney RPG Audio (CC0) clips for the isometric view; synth stays for the rest
      var K = 'assets/audio/kenney/';
      SFX.registerFiles({
        'step': [K + 'footstep00.mp3', K + 'footstep01.mp3', K + 'footstep02.mp3', K + 'footstep03.mp3', K + 'footstep04.mp3'],
        'tap': K + 'metalClick.mp3',
        'reveal': [K + 'doorOpen_1.mp3', K + 'doorOpen_2.mp3'],
        'door': K + 'doorOpen_2.mp3',
        'coin': K + 'handleCoins.mp3',
        'coins': K + 'handleCoins2.mp3',
        'hit': [K + 'knifeSlice.mp3', K + 'knifeSlice2.mp3'],
        'attack': K + 'chop.mp3',
        'pushback': K + 'dropLeather.mp3',
        'knockback': K + 'dropLeather.mp3',
        'chest': K + 'metalLatch.mp3',
        'creak': K + 'creak1.mp3'
      });
    }
    if (typeof UI.setSfxToggleState === 'function') UI.setSfxToggleState();

    // Move the shared sound toggle and add a restart button into the top bar
    var iconBtns = document.querySelector('.hud-iconbtns');
    var sfxBtn = document.getElementById('sfx-toggle');
    if (iconBtns && sfxBtn) iconBtns.insertBefore(sfxBtn, iconBtns.lastElementChild);
    if (iconBtns) {
      var restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'hud-btn';
      restart.id = 'iso-new-game';
      restart.setAttribute('aria-label', 'New game / Nowa gra');
      restart.innerHTML = '&#x21bb;';
      iconBtns.insertBefore(restart, iconBtns.lastElementChild);
    }
    ProtoHud.loadSprites().then(function() { ProtoHud.useSpritesInModals(); });

    // New run or restored save from the launch parameters (?name=&action=)
    Questions.init();
    session = ProtoSession.begin('Explorer');
    ProtoHud.setName(session.name);

    // Canvas drag must not be interpreted as a swipe by the document-level input
    if (typeof InputAdapter !== 'undefined') {
      try { InputAdapter.setInputEnabled('touch', false); } catch (e) { /* ignore */ }
      InputAdapter.on('navigate', function(data) {
        if (data && data.direction) handleDirectionNavigation(data.direction);
      });
    }

    var restartBtn = document.getElementById('iso-new-game');
    if (restartBtn) {
      restartBtn.addEventListener('click', function() {
        location.href = location.pathname + '?name=' + encodeURIComponent(Player.getName() || 'Explorer') + '&action=new';
      });
    }

    showLoading(true);

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'iso-canvas',
      backgroundColor: '#05060a',
      banner: false,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      render: { antialias: true, pixelArt: false, roundPixels: true },
      input: { activePointers: 3 },
      scene: [IsoScenes.BootScene, IsoScenes.DungeonScene]
    });

    game.registry.set('isoCallbacks', {
      onReady: function(s) {
        scene = s;
        showLoading(false);
        gameInProgress = true;
        console.log('ProtoIso: renderer ' + (game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'));
        enterRoom(session.loaded ? Player.getCurrentRoom() : Dungeon.getEntranceId());
      },
      onRoomTap: tapRoom,
      onFarTap: function() {
        UI.showToast('Too far away / Za daleko', 'info');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  function updateHud() {
    var stats = Player.getQuestionStats();
    ProtoHud.updateStats({
      monstersDefeated: Player.getMonstersDefeated(),
      questionsCorrect: stats.correct,
      questionsTotal: stats.total,
      totalLoot: Player.getTotalLootValue()
    });
    ProtoHud.setLoot(Player.getInventory());
    var current = Player.getCurrentRoom();
    ProtoHud.setMinimap(DungeonMap.renderSVG(current));
    var room = Dungeon.getRoom(current);
    if (room) ProtoHud.setRoom(room);
  }

  function showNavigation() {
    ProtoSession.autoSave();
    var current = Player.getCurrentRoom();
    var connections = Dungeon.getConnectedRooms(current);
    currentNavOptions = Descriptions.generateNavigationOptions(connections, current);
    UI.renderDirectionBar(currentNavOptions, tapRoom);
    setModalOpen(false);
    busy = false;
  }

  function handleDirectionNavigation(direction) {
    if (!gameInProgress || busy) return;
    for (var i = 0; i < currentNavOptions.length; i++) {
      var opt = currentNavOptions[i];
      if (opt.direction && opt.direction.en === direction) {
        tapRoom(opt.roomId);
        return;
      }
    }
  }

  /**
   * Player tapped/keyed a connected room: animate there, then enter it
   */
  function tapRoom(roomId) {
    if (busy || !scene || !gameInProgress) return;
    if (connectedIds(Player.getCurrentRoom()).indexOf(roomId) === -1) return;
    busy = true;
    UI.hideDirectionBar();
    if (typeof FX !== 'undefined') FX.haptic('onNavigation');
    scene.movePlayer(roomId, function() {
      enterRoom(roomId);
    });
  }

  function enterRoom(roomId) {
    busy = true;
    currentNavOptions = [];

    if (roomId !== Player.getCurrentRoom()) {
      Player.moveTo(roomId);
    }

    var room = Dungeon.getRoom(roomId);
    if (!room) {
      console.error('ProtoIso: invalid room', roomId);
      busy = false;
      return;
    }

    DungeonMap.exploreRoom(roomId);
    scene.refreshFog(false);
    scene.setCurrentRoom(roomId, true);
    updateHud();

    if (Dungeon.hasMonsterEncounter(roomId)) {
      if (room.encounterType === 'matching' && typeof Matching !== 'undefined') {
        startMatchingEncounter(room.monster, room.depth, room.matchingCategory);
      } else {
        startCombat(room.monster, room.depth);
      }
    } else if (room.type === 'treasure' && !room.cleared) {
      startTreasureEncounter(roomId);
    } else {
      showNavigation();
    }
  }

  // ---------------------------------------------------------------------------
  // Encounters (mirrors js/main.js)
  // ---------------------------------------------------------------------------

  function startTreasureEncounter(roomId) {
    var loot = typeof getRandomTreasure !== 'undefined'
      ? getRandomTreasure()
      : [{ name: 'Gold Coins', namePL: 'Złote Monety', value: 10 }];
    setModalOpen(true);
    UI.showTreasureModal(loot, function(items) {
      items.forEach(function(item) { Player.addLoot(item); });
      Dungeon.clearRoom(roomId);
      scene.refreshTokens();
      updateHud();
      showNavigation();
    });
  }

  function startCombat(monster, depth) {
    var difficulty = Dungeon.getDepthDifficulty(depth);
    var encounter = Combat.startEncounter(monster, difficulty);
    setModalOpen(true);
    UI.showQuizModal(encounter, handleAnswer);
  }

  function handleAnswer(answerIndex) {
    var result = Combat.submitAnswer(answerIndex);
    if (result.error) {
      console.error(result.error);
      return;
    }
    var fxDone = (typeof UI.playAnswerFx === 'function')
      ? UI.playAnswerFx(answerIndex, result)
      : Promise.resolve();

    fxDone.then(function() {
      if (result.dragonDefeated) {
        finalizeDragonVictory();
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
    if (!set) {
      startCombat(monster, depth);
      return;
    }
    setModalOpen(true);
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
        success: true,
        defeated: true,
        loot: loot,
        message: Descriptions.generateVictoryMessage(monster),
        explanation: set.explanation || ''
      };
    } else {
      Player.pushBack();
      Player.recordQuestion(false);
      result = {
        success: false,
        defeated: false,
        pushedBack: true,
        message: Descriptions.generateDefeatMessage(monster),
        explanation: set.explanation || ''
      };
    }
    UI.showResultModal(result, handleResultContinue);
  }

  function handleResultContinue(result) {
    updateHud();
    if (result.pushedBack) {
      // Player state already points at the previous room; animate the retreat
      var target = Player.getCurrentRoom();
      fx('pushback');
      scene.movePlayer(target, function() {
        scene.refreshFog(false);
        scene.setCurrentRoom(target, true);
        updateHud();
        showNavigation();
      });
      return;
    }
    scene.refreshTokens();
    showNavigation();
  }

  function finalizeDragonVictory() {
    gameInProgress = false;
    Dungeon.clearRoom(Dungeon.getBossId());
    scene.refreshTokens();
  }

  function showVictory() {
    ProtoSession.finishRun();
    UI.showVictoryScreen(Player.getGameSummary(), function() { location.href = 'index.html'; });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  function start() {
    var ready = (typeof Platform !== 'undefined' && !Platform.isInitialized())
      ? Platform.init()
      : Promise.resolve();
    Promise.resolve(ready).then(boot, boot);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  return {
    tapRoom: tapRoom,
    enterRoom: enterRoom,
    getScene: function() { return scene; },
    getGame: function() { return game; },
    isBusy: function() { return busy; }
  };
})();
