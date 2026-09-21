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
  var steer = { x: 0, y: 0 };
  var stick = null;
  var saveDirty = false;
  var lastSave = 0;
  var lastIdle = 0;

  var DIR_LABELS = {
    n: { en: 'North', pl: 'Północ' },
    e: { en: 'East', pl: 'Wschód' },
    s: { en: 'South', pl: 'Południe' },
    w: { en: 'West', pl: 'Zachód' }
  };
  // Background loops (www/assets/music/): pick with ?music=gothic|quirky|ominous,
  // remembered in localStorage; 'none' switches the music off
  var MUSIC_TRACKS = {
    shanty: 'cemetery-shanty', gothic: 'cemetery-gothic', quirky: 'cemetery-quirky', ominous: 'cemetery-ominous',
    carousel: 'cemetery-carousel', lullaby: 'cemetery-lullaby',
    // quieter, for wandering: a Tristram-like guitar and a Solveig-like song
    tristram: 'cemetery-tristram', solveig: 'cemetery-solveig'
  };
  var MUSIC_DEFAULT = 'solveig';
  var BOSS_TRACK = 'cemetery-quirky';        // the Reaper fights to the dark carnival tune
  var MUSIC_KEY = 'mrowl_cem_music';
  var VICTORY_MESSAGE = {
    en: 'Mr Owl banished the Grim Reaper and the cemetery may rest!',
    pl: 'Pan Sowa przegonił Ponurego Żniwiarza i cmentarz może odpocząć!'
  };

  function fx(name, opts) {
    if (typeof FX !== 'undefined' && FX.play) FX.play(name, opts);
  }

  /**
   * Scene animations call back when they finish; if the render loop stalls
   * (a backgrounded tab, a very slow frame) this makes sure the game still
   * moves on after `ms`.
   */
  function once(ms, fn) {
    var done = false;
    function run() {
      if (done) return;
      done = true;
      fn();
    }
    setTimeout(run, ms);
    return run;
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

  /** The veil's line: the page's default speaks of the dungeon */
  function setLoadingText(en, pl) {
    var el = document.getElementById('iso-loading');
    if (!el) return;
    var e = el.querySelector('.bi-en'), p = el.querySelector('.bi-pl');
    if (e) e.textContent = en;
    if (p) p.textContent = pl;
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

  var roamTrack = null;

  /** Fade over to a track (the boss tune, or back to the roaming one) */
  function switchMusic(track) {
    if (typeof Music === 'undefined' || !track) return;
    if (musicChoice() === null) return;       // music is off
    roamTrack = track;
    Music.play('assets/music/' + track + '.mp3');
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
    // the encounter cards are played in cemetery rooms, not dungeon ones
    if (typeof MonsterStage !== 'undefined') MonsterStage.setTheme('cemetery');
    ProtoHud.setName(sess.name);
    ProtoHud.setNote({ en: 'Tap a lit path to walk. Find the 4 parts of the skeleton key.', pl: 'Dotknij oświetlonej ścieżki. Znajdź 4 części szkieletowego klucza.' });
    ProtoHud.setKeyParts(CemModel.keyPartCount(level), 4);
    setLoadingText('Entering a haunted cemetery\u2026', 'Wchodzisz na nawiedzony cmentarz\u2026');
    showLoading(true);
    startMusic();
    // the first footstep used to build the AudioContext inside its frame: a 300 ms hitch
    if (typeof SFX !== 'undefined' && SFX.warm) SFX.warm();

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
      onTileTap: onTileTap,
      onSteer: onSteerScreen,
      onFrame: onFrame
    });
    mountStick();
    ProtoHud.onMinimapTap(openMap);
    if (opts.onGame) opts.onGame(game);
    return game;
  }

  /** The dock thumb-stick (and drag-steering) both feed setSteer */
  function mountStick() {
    var el = document.getElementById('cem-stick');
    if (!el || typeof CemStick === 'undefined') return;
    el.hidden = false;
    stick = CemStick.mount(el, {
      onChange: function(x, y) { onSteerScreen(x, y); }
    });
  }

  /** Screen-space push from the stick, a drag or the keys */
  function onSteerScreen(x, y) {
    var g = CemStick.toGrid(x, y);
    setSteer(g.x, g.y);
  }

  function setSteer(gx, gy) {
    steer.x = gx || 0;
    steer.y = gy || 0;
  }

  /**
   * One frame of the model: walk Mr Owl, act on what he walks into.
   * @returns {Object} { vx, vy } for the scene's animation
   */
  function onFrame(dt) {
    if (!level || !gameInProgress || busy) return null;
    var r = CemModel.tickOwl(level, steer, dt);
    if (r.tileChanged) {
      if (level.newlySeen.length || level.visChanged.length) {
        if (scene) scene.onTilesRevealed(level.newlySeen, level.visChanged);
        level.newlySeen.length = 0;
        level.visChanged.length = 0;
      }
      updateRibbon();
      saveDirty = true;
      lastIdle = Date.now();
    }
    if (r.arrived) lastIdle = Date.now();
    if (r.events.length) handleEvents(r.events);
    return r;
  }

  function onReady(s) {
    scene = s;
    showLoading(false);
    gameInProgress = true;
    console.log('ProtoCem: renderer ' + (game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas') + ', seed ' + level.seed);
    // so a device log shows when to expect the weather
    if (typeof CemRain !== 'undefined' && s.rainSchedule) {
      console.log('ProtoCem: weather: ' + CemRain.summary(s.rainSchedule) +
        (s.storm && typeof CemStorm !== 'undefined' ? '; lightning ' + CemStorm.describe(s.storm, CemStorm.nextStrike(s.storm, 0), 0) : ''));
    }
    lastTick = Date.now();
    lastSave = lastTick;
    tickEvent = scene.time.addEvent({ delay: 250, loop: true, callback: tick });
    UI.hideDirectionBar();
    updateHud();
    if (level.completed) {
      showVictory();
      return;
    }
    idle();
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
      if (e.type === 'moved') {
        var mv = level.monstersByUid[e.uid];
        scene.moveMonster(e.uid, e.to, mv ? mv.stepMs : 0);
      }
      if (e.type === 'encounter') encounter = e;
    }
    if (events.length) scene.refreshMonsters();
    drawMinimap();
    if (encounter && !busy) beginEncounter(encounter.uid);

    // autosave once he has settled, and at most every five seconds
    if (saveDirty && !busy && gameInProgress) {
      var quiet = lastIdle === 0 || now - lastIdle > 800;
      if (quiet && now - lastSave > 5000) {
        ProtoSession.autoSave();
        lastSave = now;
        saveDirty = false;
      }
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
    var path = CemModel.pathTo(level, CemModel.owlTile(level), { gx: gx, gy: gy });
    if (!path.length) {
      var tomb = CemModel.tombOfDoor(level, t);
      if (tomb && tomb.size === 'large') sealedToast();
      else if (tomb) toast('The guardian blocks the way.', 'Strażnik zagradza drogę.');
      else toast('No path leads there.', 'Nie ma tam ścieżki.');
      return;
    }
    scene.showTap(gx, gy);
    setSteer(0, 0);
    if (stick) stick.reset();
    CemModel.setPath(level, path);
  }

  function sealedToast() {
    var missing = 4 - CemModel.keyPartCount(level);
    toast('The great tomb is sealed. Find all 4 key parts (' + missing + ' missing).',
      'Wielki grobowiec jest zapieczętowany. Znajdź 4 części klucza (brakuje ' + missing + ').', 'error');
    fx('creak', { volume: 0.5 });
  }

  /** Act on what Mr Owl walked into this frame */
  function handleEvents(events) {
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      if (e.type === 'encounter') { beginEncounter(e.uid); return false; }
      if (e.type === 'boss_rises') { bossRises(); continue; }
      if (e.type === 'enter_large_tomb') { startBossEncounter(); return false; }
      if (e.type === 'tomb_locked') sealedToast();
    }
    return true;
  }

  /** A swipe or arrow key nudges him one tile (the stick is the main control) */
  function handleDirection(direction) {
    if (busy || !scene || !gameInProgress) return;
    var dirId = null;
    for (var k in DIR_LABELS) if (DIR_LABELS.hasOwnProperty(k) && DIR_LABELS[k].en === direction) dirId = k;
    if (!dirId) dirId = direction;
    var d = null;
    for (var i = 0; i < CemModel.DIRS.length; i++) if (CemModel.DIRS[i].id === dirId) d = CemModel.DIRS[i];
    if (!d) return;
    var t0 = CemModel.owlTile(level);
    var gx = t0.gx + d.dx, gy = t0.gy + d.dy;
    var t = CemModel.tileAt(level, gx, gy);
    if (!t || !t.walk) return;
    if (!CemModel.canEnter(level, gx, gy)) {
      var tomb = CemModel.tombOfDoor(level, t);
      if (tomb && tomb.size === 'large') sealedToast();
      return;
    }
    CemModel.setPath(level, [{ gx: gx, gy: gy }]);
  }

  /** Back to free roaming after an encounter or a respawn */
  function idle() {
    if (level.encounterUid && !currentUid) { beginEncounter(level.encounterUid); return; }
    setModalOpen(false);
    if (stick) stick.setEnabled(true);
    setSteer(0, 0);
    busy = false;
    saveDirty = true;
    lastIdle = 0;   // save at the next tick
  }

  /** Teleport for tests and debugging */
  function teleport(gx, gy) {
    CemModel.setOwlTile(level, gx, gy);
    setSteer(0, 0);
    if (scene) {
      scene.placeOwl(CemModel.owlTile(level), true);
      scene.onTilesRevealed();
      updateHud();
    }
  }

  // ---------------------------------------------------------------------------
  // Encounters
  // ---------------------------------------------------------------------------

  function beginEncounter(uid) {
    if (!gameInProgress || busy) return;
    busy = true;
    currentUid = uid;
    level.encounterUid = uid;
    setSteer(0, 0);
    level.owl.path = [];
    if (stick) stick.setEnabled(false);
    UI.hideDirectionBar();
    scene.setInputEnabled(false);
    var m = CemModel.encounterMonsterFor(level, uid);
    if (!m) { level.encounterUid = null; busy = false; idle(); return; }
    if (typeof FX !== 'undefined') FX.haptic('onEncounter');
    // the lunge plays first; if the render loop stalls (a backgrounded tab, a
    // slow frame) the quiz still opens on a plain timer
    var open = once(CemMonsters.ACTIONS.lunge + 400, function() {
      if (!gameInProgress) return;
      if (m.encounterType === 'matching' && typeof Matching !== 'undefined') startMatchingEncounter(m);
      else startCombat(m);
    });
    scene.playAttack(uid, open);
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
        var afterBoss = once(5200, function() {
          finalizeReaperVictory();
          document.body.classList.add('modal-open');
          UI.showResultModal(result, showVictory);
        });
        scene.playBossDefeat(afterBoss);
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
      if (uid === 'boss') switchMusic(roamTrack);
      CemModel.respawnAtGate(level);
      document.body.classList.remove('modal-open');
      scene.setInputEnabled(false);
      var backAtGate = once(2200, function() {
        scene.placeOwl(CemModel.owlTile(level), true);
        scene.onTilesRevealed();
        updateHud();
        toast('Mr Owl wakes up at the cemetery gate.', 'Pan Sowa budzi się przy bramie cmentarza.');
        idle();
      });
      scene.owlFlinch(function() { scene.retreatToGate(backAtGate); });
      return;
    }
    var r = CemModel.defeatMonster(level, uid);
    document.body.classList.remove('modal-open');
    scene.setInputEnabled(false);
    var afterDefeat = once(CemMonsters.ACTIONS.flinch + CemMonsters.ACTIONS.exit + 600, function() {
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
      idle();
    });
    scene.playDefeat(uid, afterDefeat);
  }

  /** The Reaper steps out of the great tomb in a puff of smoke as Mr Owl nears it */
  function bossRises() {
    if (!scene || level.monstersByUid.boss.defeated) return;
    scene.revealBoss(null, true);
    fx('creak');
    if (typeof FX !== 'undefined') FX.haptic('onEncounter');
    toast('The Grim Reaper rises from the great tomb!', 'Ponury \u017bniwiarz powstaje z wielkiego grobowca!', 'error');
  }

  function startBossEncounter() {
    if (!gameInProgress || busy || level.monstersByUid.boss.defeated) return;
    busy = true;
    setSteer(0, 0);
    level.owl.path = [];
    if (stick) stick.setEnabled(false);
    UI.hideDirectionBar();
    scene.setInputEnabled(false);
    CemModel.startBossEncounter(level);
    currentUid = 'boss';
    switchMusic(BOSS_TRACK);
    if (typeof FX !== 'undefined') FX.haptic('onEncounter');
    var open = once(CemMonsters.ACTIONS.appear + 600, function() {
      if (!gameInProgress) return;
      startCombat(CemModel.encounterMonsterFor(level, 'boss'));
    });
    scene.revealBoss(open);
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

  var mapKey = null;
  var mapAt = 0;

  /** Redraw the little map at most once a second, and only when it changed */
  function drawMinimap(force) {
    var now = Date.now();
    if (!force && now - mapAt < 1000) return;
    var key = CemMinimap.stateKey(level);
    if (!force && key === mapKey) return;
    var canvas = ProtoHud.minimapCanvas(360, 200);
    if (!canvas) return;
    CemMinimap.draw(level, canvas.getContext('2d'));
    mapKey = key;
    mapAt = now;
  }

  // ---------------------------------------------------------------------------
  // The big map: tap the little one to open it. Zoom with the buttons, drag
  // to pan, tap a remembered lane to walk there.
  // ---------------------------------------------------------------------------

  var mapModal = null;
  var mapZoom = 1;
  var mapFit = null;

  function openMap() {
    if (!level || !gameInProgress || busy || mapModal) return;
    setModalOpen(true);
    var m = document.createElement('div');
    m.id = 'cem-map-modal';
    m.className = 'modal cem-map';
    m.innerHTML =
      '<div class="modal-content cem-map-panel">' +
        '<div class="cem-map-head">' +
          '<span class="cem-map-title"><span class="label-en">Cemetery map</span><span class="label-pl">Mapa cmentarza</span></span>' +
          '<span class="cem-map-tools">' +
            '<button type="button" class="hud-btn cem-map-zoom" data-zoom="-1" aria-label="Zoom out">&minus;</button>' +
            '<button type="button" class="hud-btn cem-map-zoom" data-zoom="1" aria-label="Zoom in">+</button>' +
            '<button type="button" class="hud-btn cem-map-close" aria-label="Close">&#x2715;</button>' +
          '</span>' +
        '</div>' +
        '<div class="cem-map-view"><canvas class="cem-map-canvas" width="1400" height="800"></canvas></div>' +
        '<div class="cem-map-legend">' +
          '<span><i class="cem-map-dot you"></i><span class="label-en">Mr Owl</span><span class="label-pl">Pan Sowa</span></span>' +
          '<span><i class="cem-map-dot tomb"></i><span class="label-en">tomb still to visit</span><span class="label-pl">grobowiec do odwiedzenia</span></span>' +
          '<span><i class="cem-map-dot visited"></i><span class="label-en">tomb visited</span><span class="label-pl">odwiedzony grobowiec</span></span>' +
          '<span><i class="cem-map-dot great"></i><span class="label-en">the great tomb</span><span class="label-pl">wielki grobowiec</span></span>' +
          '<span><i class="cem-map-dot monster"></i><span class="label-en">monster in sight</span><span class="label-pl">potw\u00f3r w zasi\u0119gu wzroku</span></span>' +
          '<span class="cem-map-hint"><span class="label-en">Tap a lane to walk there.</span><span class="label-pl">Dotknij \u015bcie\u017cki, by tam p\u00f3j\u015b\u0107.</span></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    mapModal = m;
    var canvas = m.querySelector('.cem-map-canvas');
    var view = m.querySelector('.cem-map-view');
    mapFit = CemMinimap.draw(level, canvas.getContext('2d'), { markerScale: 2.4 });
    mapZoom = 1;
    applyMapZoom(canvas, view, true);
    m.querySelector('.cem-map-close').addEventListener('click', closeMap);
    m.addEventListener('click', function(e) { if (e.target === m) closeMap(); });
    Array.prototype.forEach.call(m.querySelectorAll('.cem-map-zoom'), function(b) {
      b.addEventListener('click', function() {
        mapZoom = Math.max(1, Math.min(3, mapZoom + Number(b.getAttribute('data-zoom')) * 0.5));
        applyMapZoom(canvas, view, false);
        fx('tap');
      });
    });
    // drag to pan (mouse or finger); a short tap walks
    var drag = null;
    view.addEventListener('pointerdown', function(e) { drag = { x: e.clientX, y: e.clientY, sl: view.scrollLeft, st: view.scrollTop, moved: false }; });
    view.addEventListener('pointermove', function(e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      view.scrollLeft = drag.sl - dx; view.scrollTop = drag.st - dy;
    });
    function endDrag(e) {
      if (!drag) return;
      var wasTap = !drag.moved;
      drag = null;
      if (!wasTap || e.target !== canvas) return;
      var r = canvas.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * canvas.width, y = (e.clientY - r.top) / r.height * canvas.height;
      var g = CemMinimap.gridAt(mapFit, x, y);
      var t = CemModel.tileAt(level, g.gx, g.gy);
      if (!t || !t.walk || !level.seen[CemModel.index(level, g.gx, g.gy)]) { fx('creak', { volume: 0.3 }); return; }
      closeMap();
      onTileTap(g.gx, g.gy);
    }
    view.addEventListener('pointerup', endDrag);
    view.addEventListener('pointercancel', function() { drag = null; });
    fx('reveal');
  }

  /** Scale the canvas on screen and keep Mr Owl in the middle of the view */
  function applyMapZoom(canvas, view, centre) {
    var base = Math.min(view.clientWidth || 800, (view.clientHeight || 460) * canvas.width / canvas.height);
    var w = base * mapZoom;
    canvas.style.width = w + 'px';
    canvas.style.height = (w * canvas.height / canvas.width) + 'px';
    var op = CemMinimap.project(level.owl.gx, level.owl.gy);
    var sx = ((op.x - mapFit.left) * mapFit.scale + mapFit.ox) / canvas.width * w;
    var sy = ((op.y - mapFit.top) * mapFit.scale + mapFit.oy) / canvas.height * (w * canvas.height / canvas.width);
    if (centre || mapZoom > 1) {
      view.scrollLeft = sx - view.clientWidth / 2;
      view.scrollTop = sy - view.clientHeight / 2;
    }
  }

  function closeMap() {
    if (!mapModal) return;
    if (mapModal.parentNode) mapModal.parentNode.removeChild(mapModal);
    mapModal = null;
    setModalOpen(false);
  }

  /** Just the parchment ribbon: called on every tile change */
  function updateRibbon() {
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
    if (kind === lastRibbon) return;
    lastRibbon = kind;
    ProtoHud.setRibbon(Descriptions.getCemeteryTitle(kind, opts));
  }
  var lastRibbon = null;

  function updateHud() {
    var stats = Player.getQuestionStats();
    ProtoHud.updateStats({
      monstersDefeated: Player.getMonstersDefeated(),
      questionsCorrect: stats.correct,
      questionsTotal: stats.total,
      totalLoot: Player.getTotalLootValue()
    });
    ProtoHud.setLoot(Player.getInventory());
    drawMinimap(true);
    ProtoHud.setKeyParts(CemModel.keyPartCount(level), 4);
    lastRibbon = null;
    updateRibbon();
  }

  return {
    start: start,
    handleDirection: handleDirection,
    onTileTap: onTileTap,
    setSteer: setSteer,
    teleport: teleport,
    openMap: openMap,
    closeMap: closeMap,
    getLevel: function() { return level; },
    getScene: function() { return scene; },
    isBusy: function() { return busy; }
  };
})();
