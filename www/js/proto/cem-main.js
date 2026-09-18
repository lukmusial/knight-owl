/**
 * ProtoCem
 * Game flow of the Halloween cemetery level on the isometric page: tile
 * walking, wandering monsters and their attacks, quiz and matching
 * encounters, the four skeleton-key parts, the great tomb and the Grim
 * Reaper, victory, HUD and autosave. iso-main.js hands over to start().
 */

var ProtoCem = (function() {
  var level = null;
  var session = null;
  var game = null;
  var scene = null;
  var busy = false;
  var gameInProgress = false;
  var currentUid = null;
  var lastTick = 0;
  var tickEvent = null;

  var DIR_LABELS = {
    n: { en: 'North', pl: 'Północ' },
    e: { en: 'East', pl: 'Wschód' },
    s: { en: 'South', pl: 'Południe' },
    w: { en: 'West', pl: 'Zachód' }
  };
  // Background loops (www/assets/music/): pick with ?music=gothic|quirky|ominous,
  // remembered in localStorage; 'none' switches the music off
  var MUSIC_TRACKS = { gothic: 'cemetery-gothic', quirky: 'cemetery-quirky', ominous: 'cemetery-ominous' };
  var MUSIC_DEFAULT = 'ominous';
  var MUSIC_KEY = 'mrowl_cem_music';
  var VICTORY_MESSAGE = {
    en: 'Mr Owl banished the Grim Reaper and the cemetery may rest!',
    pl: 'Pan Sowa przegonił Ponurego Żniwiarza i cmentarz może odpocząć!'
  };

  function fx(name, opts) {
    if (typeof FX !== 'undefined' && FX.play) FX.play(name, opts);
  }

  function toast(en, pl, type) {
    UI.showToast(en + ' ' + pl, type || 'info');
  }

  function setModalOpen(open) {
    if (typeof document !== 'undefined') document.body.classList.toggle('modal-open', !!open);
    if (scene) scene.setInputEnabled(!open);
    level.paused = !!open;
  }

  function showLoading(show) {
    var el = document.getElementById('iso-loading');
    if (el) el.classList.toggle('hidden', !show);
  }

  /** Which cemetery loop to play: URL parameter, then the remembered choice, then the default */
  function musicChoice() {
    var choice = null;
    try {
      var m = /[?&]music=([a-z]+)/.exec(typeof location !== 'undefined' ? location.search : '');
      if (m) choice = m[1];
      if (choice && typeof localStorage !== 'undefined') localStorage.setItem(MUSIC_KEY, choice);
      if (!choice && typeof localStorage !== 'undefined') choice = localStorage.getItem(MUSIC_KEY);
    } catch (e) { /* storage blocked */ }
    if (choice === 'none') return null;
    return MUSIC_TRACKS[choice] || MUSIC_TRACKS[MUSIC_DEFAULT];
  }

  function startMusic() {
    if (typeof Music === 'undefined') return;
    var track = musicChoice();
    if (!track) return;
    Music.init();
    Music.play('assets/music/' + track + '.mp3');
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  /**
   * Called by iso-main.js once the shared HUD and modals are mounted
   * @param {Object} sess - ProtoSession result with `cemetery` (CemModel level)
   * @param {Object} opts - { onGame(game) } lets the caller keep the Phaser game
   */
  function start(sess, opts) {
    opts = opts || {};
    session = sess;
    level = sess.cemetery;
    ProtoHud.setName(sess.name);
    ProtoHud.setNote({ en: 'Tap a lit path to walk. Find the 4 parts of the skeleton key.', pl: 'Dotknij oświetlonej ścieżki. Znajdź 4 części szkieletowego klucza.' });
    ProtoHud.setKeyParts(CemModel.keyPartCount(level), 4);
    showLoading(true);
    startMusic();

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'iso-canvas',
      backgroundColor: '#05060a',
      banner: false,
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
      render: { antialias: true, pixelArt: false, roundPixels: true },
      input: { activePointers: 3 },
      audio: { noAudio: true },
      scene: [CemScenes.BootScene, CemScenes.CemeteryScene]
    });
    game.registry.set('cemLevel', level);
    game.registry.set('cemCallbacks', {
      onReady: onReady,
      onTileTap: onTileTap
    });
    if (opts.onGame) opts.onGame(game);
    return game;
  }

  function onReady(s) {
    scene = s;
    showLoading(false);
    gameInProgress = true;
    console.log('ProtoCem: renderer ' + (game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas') + ', seed ' + level.seed);
    lastTick = Date.now();
    tickEvent = scene.time.addEvent({ delay: 250, loop: true, callback: tick });
    updateHud();
    if (level.completed) {
      showVictory();
      return;
    }
    showNavigation();
  }

  // ---------------------------------------------------------------------------
  // Monsters on the move
  // ---------------------------------------------------------------------------

  function tick() {
    var now = Date.now();
    var dt = Math.min(1500, now - lastTick);
    lastTick = now;
    if (!gameInProgress || !scene) return;
    var events = CemModel.advance(level, dt);
    var encounter = null;
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      if (e.type === 'moved') scene.moveMonster(e.uid, e.to);
      if (e.type === 'encounter') encounter = e;
    }
    if (events.length) {
      scene.refreshMonsters();
      ProtoHud.setMinimap(CemMinimap.render(level));
    }
    if (encounter) {
      // Mid-walk: stop at the next tile; arrive() then opens the encounter.
      // Otherwise (idle at a tile) start it right away.
      if (scene.moving) scene.cancelWalk();
      else if (!busy) beginEncounter(encounter.uid);
    }
  }

  // ---------------------------------------------------------------------------
  // Walking
  // ---------------------------------------------------------------------------

  function onTileTap(gx, gy) {
    if (busy || !scene || !gameInProgress) return;
    var t = CemModel.tileAt(level, gx, gy);
    if (!t) return;
    if (t.gx === level.owl.gx && t.gy === level.owl.gy) return;
    if (CemModel.visibilityAt(level, gx, gy) === 0) {
      toast('Too dark to see there.', 'Za ciemno, nic tam nie widać.');
      return;
    }
    if (!t.walk) return;
    var path = CemModel.pathTo(level, level.owl, { gx: gx, gy: gy });
    if (!path.length) {
      var tomb = CemModel.tombOfDoor(level, t);
      if (tomb && tomb.size === 'large') sealedToast();
      else if (tomb) toast('The guardian blocks the way.', 'Strażnik zagradza drogę.');
      else toast('No path leads there.', 'Nie ma tam ścieżki.');
      return;
    }
    scene.showTap(gx, gy);
    walkPath(path);
  }

  function sealedToast() {
    var missing = 4 - CemModel.keyPartCount(level);
    toast('The great tomb is sealed. Find all 4 key parts (' + missing + ' missing).',
      'Wielki grobowiec jest zapieczętowany. Znajdź 4 części klucza (brakuje ' + missing + ').', 'error');
    fx('creak', { volume: 0.5 });
  }

  function walkPath(path) {
    busy = true;
    UI.hideDirectionBar();
    if (typeof FX !== 'undefined') FX.haptic('onNavigation');
    scene.walkTo(path, afterStep, arrive);
  }

  /** Called by the scene each time Mr Owl reaches a tile; false stops the walk */
  function afterStep(tile) {
    var r = CemModel.moveOwl(level, tile.gx, tile.gy);
    if (!r.ok) {
      // the tile closed while walking (a locked door): stop here
      scene.refreshVisibility();
      return false;
    }
    scene.refreshVisibility();
    updateHud();
    return handleEvents(r.events);
  }

  /** @returns {boolean} false when the walk must stop */
  function handleEvents(events) {
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      if (e.type === 'encounter') {
        // the walk stops at this tile; arrive() starts the encounter
        return false;
      }
      if (e.type === 'enter_large_tomb') {
        scene.time.delayedCall(0, startBossEncounter);
        return false;
      }
      if (e.type === 'tomb_locked') sealedToast();
    }
    return true;
  }

  function arrive() {
    // a monster reached Mr Owl while he walked (or he walked into one)
    if (level.encounterUid && !currentUid) { beginEncounter(level.encounterUid); return; }
    if (level.encounterUid) return;
    busy = false;
    showNavigation();
  }

  function handleDirection(direction) {
    if (busy || !scene || !gameInProgress) return;
    var dirId = null;
    for (var k in DIR_LABELS) if (DIR_LABELS.hasOwnProperty(k) && DIR_LABELS[k].en === direction) dirId = k;
    if (!dirId) dirId = direction;
    var d = null;
    for (var i = 0; i < CemModel.DIRS.length; i++) if (CemModel.DIRS[i].id === dirId) d = CemModel.DIRS[i];
    if (!d) return;
    var gx = level.owl.gx + d.dx, gy = level.owl.gy + d.dy;
    var t = CemModel.tileAt(level, gx, gy);
    if (!t || !t.walk) return;
    if (!CemModel.canEnter(level, gx, gy)) {
      var tomb = CemModel.tombOfDoor(level, t);
      if (tomb && tomb.size === 'large') sealedToast();
      return;
    }
    walkPath([{ gx: level.owl.gx, gy: level.owl.gy }, { gx: gx, gy: gy }]);
  }

  function showNavigation() {
    if (level.encounterUid && !currentUid) { beginEncounter(level.encounterUid); return; }
    ProtoSession.autoSave();
    var options = [];
    for (var i = 0; i < CemModel.DIRS.length; i++) {
      var d = CemModel.DIRS[i];
      var gx = level.owl.gx + d.dx, gy = level.owl.gy + d.dy;
      var t = CemModel.tileAt(level, gx, gy);
      if (!t || !t.walk) continue;
      var tomb = CemModel.tombOfDoor(level, t);
      options.push({
        roomId: d.id,
        direction: DIR_LABELS[d.id],
        explored: CemModel.visibilityAt(level, gx, gy) > 0 && !tomb,
        type: tomb ? (tomb.size === 'large' ? 'boss' : 'monster') : 'path'
      });
    }
    UI.renderDirectionBar(options, function(dirId) { handleDirection(dirId); });
    setModalOpen(false);
    busy = false;
  }

  // ---------------------------------------------------------------------------
  // Encounters
  // ---------------------------------------------------------------------------

  function beginEncounter(uid) {
    if (!gameInProgress) return;
    busy = true;
    currentUid = uid;
    level.encounterUid = uid;
    UI.hideDirectionBar();
    scene.setInputEnabled(false);
    var m = CemModel.encounterMonsterFor(level, uid);
    if (!m) { level.encounterUid = null; busy = false; showNavigation(); return; }
    if (typeof FX !== 'undefined') FX.haptic('onEncounter');
    scene.playAttack(uid, function() {
      if (m.encounterType === 'matching' && typeof Matching !== 'undefined') startMatchingEncounter(m);
      else startCombat(m);
    });
  }

  function startCombat(m) {
    var encounter = Combat.startEncounter(m, Math.min(3, m.difficulty || 1));
    setModalOpen(true);
    UI.showQuizModal(encounter, handleAnswer);
  }

  function handleAnswer(answerIndex) {
    var result = Combat.submitAnswer(answerIndex);
    if (result.error) {
      console.error(result.error);
      return;
    }
    var fxDone = (typeof UI.playAnswerFx === 'function') ? UI.playAnswerFx(answerIndex, result) : Promise.resolve();
    fxDone.then(function() {
      if (result.dragonDefeated) {
        // the reaper falls on the map first, then the result card and the victory screen
        UI.hideQuizModal();
        document.body.classList.remove('modal-open');
        scene.setInputEnabled(false);
        scene.playBossDefeat(function() {
          finalizeReaperVictory();
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

  function startMatchingEncounter(m) {
    var set = Matching.getMatchingSet(Math.min(3, m.difficulty || 1), m.matchingCategory);
    if (!set) { startCombat(m); return; }
    setModalOpen(true);
    UI.showMatchingModal({ monster: m, set: set }, function(success) {
      UI.hideMatchingModal();
      var result;
      if (success) {
        Player.addLoot(m.loot || []);
        Player.defeatMonster();
        Player.recordQuestion(true);
        result = { success: true, defeated: true, loot: m.loot || [], message: Descriptions.generateVictoryMessage(m), explanation: set.explanation || '' };
      } else {
        Player.recordQuestion(false);
        result = { success: false, defeated: false, pushedBack: true, message: Descriptions.generateDefeatMessage(m), explanation: set.explanation || '' };
      }
      UI.showResultModal(result, handleResultContinue);
    });
  }

  function handleResultContinue(result) {
    updateHud();
    var uid = currentUid;
    currentUid = null;
    if (result.pushedBack) {
      // lost: back to the gate; the monster stays where it was
      CemModel.respawnAtGate(level);
      document.body.classList.remove('modal-open');
      scene.setInputEnabled(false);
      scene.owlFlinch(function() {
        scene.retreatToGate(function() {
          scene.refreshVisibility();
          updateHud();
          toast('Mr Owl wakes up at the cemetery gate.', 'Pan Sowa budzi się przy bramie cmentarza.');
          showNavigation();
        });
      });
      return;
    }
    var r = CemModel.defeatMonster(level, uid);
    document.body.classList.remove('modal-open');
    scene.setInputEnabled(false);
    scene.playDefeat(uid, function() {
      scene.refreshTombs();
      scene.refreshVisibility();
      if (r.keyPart) {
        ProtoHud.setKeyParts(CemModel.keyPartCount(level), 4);
        fx('chest');
        if (r.allKeys) {
          toast('The skeleton key is complete! The great tomb can be opened.', 'Szkieletowy klucz jest kompletny! Wielki grobowiec można otworzyć.', 'success');
        } else {
          toast('Skeleton key part ' + CemModel.keyPartCount(level) + '/4!', 'Część szkieletowego klucza ' + CemModel.keyPartCount(level) + '/4!', 'success');
        }
      }
      updateHud();
      showNavigation();
    });
  }

  function startBossEncounter() {
    if (!gameInProgress || level.monstersByUid.boss.defeated) return;
    busy = true;
    UI.hideDirectionBar();
    scene.setInputEnabled(false);
    CemModel.startBossEncounter(level);
    currentUid = 'boss';
    if (typeof FX !== 'undefined') FX.haptic('onEncounter');
    scene.revealBoss(function() {
      startCombat(CemModel.encounterMonsterFor(level, 'boss'));
    });
  }

  function finalizeReaperVictory() {
    gameInProgress = false;
    CemModel.defeatMonster(level, 'boss');
    if (scene) { scene.removeMonster('boss'); scene.refreshTombs(); }
    ProtoSession.autoSave();
  }

  function showVictory() {
    gameInProgress = false;
    if (typeof Music !== 'undefined') Music.stop(1500);
    ProtoSession.finishRun();
    var summary = Player.getGameSummary();
    summary.victoryMessage = VICTORY_MESSAGE;
    UI.showVictoryScreen(summary, function() { location.href = ProtoSession.launcherUrl(Player.getName()); });
  }

  // ---------------------------------------------------------------------------
  // HUD
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
    ProtoHud.setMinimap(CemMinimap.render(level));
    ProtoHud.setKeyParts(CemModel.keyPartCount(level), 4);
    var t = CemModel.tileAt(level, level.owl.gx, level.owl.gy);
    var kind = 'path';
    var opts = {};
    if (t) {
      if (t.kind === 'gate' || (t.gx === level.start.gx && t.gy === level.start.gy)) kind = 'gate';
      else if (t.kind === 'tomb_door') {
        kind = 'tomb_door';
        var tomb = CemModel.tombOfDoor(level, t);
        opts = { tombId: tomb ? tomb.id : null, guardianDefeated: true };
      } else if (t.plaza) kind = 'plaza';
      else {
        for (var i = 0; i < level.tombs.length; i++) {
          if (level.tombs[i].porch.gx === t.gx && level.tombs[i].porch.gy === t.gy) kind = 'porch';
        }
      }
    }
    ProtoHud.setRibbon(Descriptions.getCemeteryTitle(kind, opts));
  }

  return {
    start: start,
    handleDirection: handleDirection,
    onTileTap: onTileTap,
    getLevel: function() { return level; },
    getScene: function() { return scene; },
    isBusy: function() { return busy; }
  };
})();
