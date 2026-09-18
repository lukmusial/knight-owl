/**
 * ProtoIso
 * Bootstrap and game flow for the isometric prototype page. Mirrors the
 * encounter flow of js/main.js (enterRoom, combat, matching, treasure,
 * dragon victory) with ProtoSession handling saves and profiles.
 * Two levels: the dungeon (this file) and the Halloween cemetery
 * (cem-main.js); a picker before the run chooses, a continued save keeps
 * its own level.
 */

var ProtoIso = (function() {
  var session = null;
  var game = null;
  var scene = null;
  var busy = false;
  var currentNavOptions = [];
  var gameInProgress = false;
  var currentLevel = 'dungeon';

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
        // 'reveal' opens the quiz, treasure and result cards: a page turn, not a door
        'reveal': K + 'bookFlip2.mp3',
        // 'door' plays once per crossing into another chamber (IsoScenes.movePlayer)
        'door': [K + 'doorOpen_1.mp3', K + 'doorOpen_2.mp3'],
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

    // Move the shared sound toggle into the top bar
    var iconBtns = document.querySelector('.hud-iconbtns');
    var sfxBtn = document.getElementById('sfx-toggle');
    if (iconBtns && sfxBtn) iconBtns.insertBefore(sfxBtn, iconBtns.lastElementChild);
    ProtoHud.loadSprites().then(function() { ProtoHud.useSpritesInModals(); });

    // Canvas drag must not be interpreted as a swipe by the document-level input
    if (typeof InputAdapter !== 'undefined') {
      try { InputAdapter.setInputEnabled('touch', false); } catch (e) { /* ignore */ }
      InputAdapter.on('navigate', function(data) {
        if (!data || !data.direction) return;
        if (currentLevel === 'cemetery') ProtoCem.handleDirection(data.direction);
        else handleDirectionNavigation(data.direction);
      });
    }

    Questions.init();
    chooseLevel(function(levelId) {
      currentLevel = levelId;
      if (levelId === 'cemetery' && typeof ProtoCem !== 'undefined' && typeof CemModel !== 'undefined') {
        session = ProtoSession.begin('Explorer', { level: 'cemetery', levels: ['dungeon', 'cemetery'] });
        if (session.level === 'cemetery') {
          document.body.classList.add('level-cemetery');
          game = ProtoCem.start(session, { onGame: function(g) { attachLifecycle(g); } });
          watchViewport();
          return;
        }
      } else {
        session = ProtoSession.begin('Explorer', { levels: ['dungeon'] });
      }
      currentLevel = 'dungeon';
      startDungeon();
    });
  }

  /**
   * Pick the level for this run: ?level= wins, a continued save keeps its
   * level, otherwise a picker card is shown (last choice preselected).
   */
  function chooseLevel(done) {
    var p = ProtoSession.parseParams();
    if (p.level) { done(p.level); return; }
    var name = p.name || 'Explorer';
    if (p.action === 'continue') {
      var saved = ProtoSession.savedLevel(name);
      if (saved) { done(saved); return; }
    }
    var picker = document.createElement('div');
    picker.id = 'iso-level-picker';
    picker.className = 'iso-level-picker';
    picker.innerHTML =
      '<div class="iso-level-panel hud-frame">' +
        '<div class="iso-level-title"><span class="label-en">Choose your adventure</span><span class="label-pl">Wybierz przygodę</span></div>' +
        '<div class="iso-level-cards">' +
          '<button type="button" class="iso-level-card" data-level="dungeon">' +
            '<span class="iso-level-art dungeon"></span>' +
            '<span class="iso-level-name">Dungeon<small>Loch</small></span>' +
            '<span class="iso-level-desc"><span class="label-en">Torch-lit chambers and the dragon.</span><span class="label-pl">Komnaty w blasku pochodni i smok.</span></span>' +
          '</button>' +
          '<button type="button" class="iso-level-card" data-level="cemetery">' +
            '<span class="iso-level-art cemetery"></span>' +
            '<span class="iso-level-name">Halloween Cemetery<small>Cmentarz na Halloween</small></span>' +
            '<span class="iso-level-desc"><span class="label-en">Moonlit paths, four tombs, the Grim Reaper.</span><span class="label-pl">Ścieżki w blasku księżyca, cztery grobowce, Ponury Żniwiarz.</span></span>' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(picker);
    var current = ProtoSession.getLevel();
    var cards = picker.querySelectorAll('.iso-level-card');
    Array.prototype.forEach.call(cards, function(card) {
      card.classList.toggle('selected', card.getAttribute('data-level') === current);
      card.addEventListener('click', function() {
        var levelId = card.getAttribute('data-level');
        ProtoSession.setLevel(levelId);
        fx('tap');
        picker.parentNode.removeChild(picker);
        done(levelId);
      });
    });
  }

  function attachLifecycle(g) {
    if (typeof AppLifecycle !== 'undefined') {
      AppLifecycle.on({
        pause: function() { if (g && typeof g.pause === 'function') g.pause(); },
        resume: function() { if (g && typeof g.resume === 'function') g.resume(); }
      });
    }
  }

  function startDungeon() {
    ProtoHud.setName(session.name);
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
      // Sounds go through SFX; Phaser's own AudioContext would stay open (and
      // keep an Android audio stream alive in the background) for nothing
      audio: { noAudio: true },
      scene: [IsoScenes.BootScene, IsoScenes.DungeonScene]
    });

    watchViewport();

    // Idle in the background: no rendering, tweens or walk timers until the app returns
    attachLifecycle(game);

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
        UI.showToast('Too far away. Za daleko.', 'info');
      }
    });
  }

  /**
   * Phaser's RESIZE mode can miss a rotation: the parent size is picked up
   * but the canvas keeps its old backing size, and the CSS (100% x 100%)
   * stretches the portrait canvas over the landscape screen. Refresh the
   * scale manager on every viewport change, again once Android WebViews have
   * settled on the final size.
   */
  function watchViewport() {
    if (typeof window === 'undefined') return;
    var timers = [];
    function refresh() {
      timers.forEach(clearTimeout);
      timers = [0, 150, 400].map(function(delay) {
        return setTimeout(function() {
          if (!game || !game.scale) return;
          var parent = document.getElementById('iso-canvas');
          if (!parent) return;
          var w = parent.clientWidth, h = parent.clientHeight;
          if (w > 0 && h > 0 && (game.scale.width !== w || game.scale.height !== h)) {
            game.scale.refresh();
          }
        }, delay);
      });
    }
    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refresh);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refresh);
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
        // the dragon yields on the map first, then the result card and the victory screen
        UI.hideQuizModal();
        document.body.classList.remove('modal-open');
        scene.setInputEnabled(false);
        scene.playDragonDefeat(function() {
          finalizeDragonVictory();
          document.body.classList.add('modal-open');
          UI.showResultModal(result, showVictory);
        });
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
    UI.showVictoryScreen(Player.getGameSummary(), function() { location.href = ProtoSession.launcherUrl(Player.getName()); });
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
    getLevel: function() { return currentLevel; },
    isBusy: function() { return busy; }
  };
})();
