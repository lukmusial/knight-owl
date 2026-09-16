/**
 * Main Game Controller
 * Entry point that ties all modules together
 */

const Game = (function() {
  // Game state
  let initialized = false;
  let gameInProgress = false;
  let navigating = false;

  // Current navigation options (for swipe/keyboard direction mapping)
  let currentNavOptions = [];

  /**
   * Initialize the game
   */
  function init() {
    if (initialized) return;

    // Arm sound effects (unlocked by the first tap, e.g. the splash prompt)
    if (typeof SFX !== 'undefined') SFX.init();

    // On native platforms, show splash video before anything else
    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
      showSplashVideo(function() {
        initGame();
      });
    } else {
      initGame();
    }
  }

  /**
   * Show splash video (iOS only), then call callback when done
   * @param {Function} callback - Called when video ends or is skipped
   */
  function showSplashVideo(callback) {
    var splashScreen = document.getElementById('splash-screen');
    var video = document.getElementById('splash-video');
    var skipBtn = document.getElementById('splash-skip-btn');
    var tapPrompt = document.getElementById('splash-tap-prompt');
    var gameContainer = document.getElementById('game-container');
    var ended = false;

    if (!splashScreen || !video) {
      callback();
      return;
    }

    // Hide game container, show splash with tap prompt
    gameContainer.style.display = 'none';
    splashScreen.classList.remove('hidden');

    function endSplash() {
      if (ended) return;
      ended = true;
      splashScreen.classList.add('hidden');
      gameContainer.style.display = '';
      video.pause();
      callback();
    }

    // Wait for user tap to play with audio (iOS requires user gesture)
    function startVideo() {
      tapPrompt.style.display = 'none';
      video.play().catch(function(err) {
        console.warn('Splash video play failed:', err);
        endSplash();
      });
    }

    tapPrompt.addEventListener('click', startVideo);
    splashScreen.addEventListener('click', function(e) {
      if (e.target === skipBtn) return;
      if (tapPrompt.style.display === 'none') return;
      startVideo();
    });

    video.addEventListener('ended', endSplash);
    skipBtn.addEventListener('click', endSplash);
  }

  /**
   * Core game initialization (called after splash video)
   */
  function initGame() {
    if (initialized) return;

    // Initialize UI
    UI.init();

    // Initialize Questions and Matching with data
    Questions.init();
    if (typeof Matching !== 'undefined') {
      Matching.init();
    }

    // Bind UI event handlers
    UI.bindHandlers({
      onNewGame: handleNewGame,
      onLoadGame: handleLoadGame,
      onDeleteSave: handleDeleteSave,
      onSelectSave: handleSelectSave
    });

    // Set up InputAdapter for swipe/keyboard navigation
    setupInputAdapter();

    // Show start screen with saved games
    refreshStartScreen();
    initViewSelector();
    initTopBar();

    initialized = true;
    console.log('Mr Owl\'s Dungeon Adventure initialized!');
  }

  /**
   * Refresh the start screen
   */
  function refreshStartScreen() {
    const savedGames = Save.listSaves();
    UI.renderStartScreen(savedGames);
    if (typeof Music !== 'undefined') {
      Music.init();
      Music.play();
    }
  }

  /**
   * Top bar of the classic game screen (same layout as the isometric/3D HUD):
   * map toggle, sound toggle and an X that saves and returns to the launch screen.
   */
  function initTopBar() {
    const quit = document.getElementById('classic-quit-btn');
    if (quit) {
      quit.addEventListener('click', function() {
        if (typeof FX !== 'undefined') FX.play('tap');
        quitToLaunchScreen();
      });
    }
    const mapBtn = document.getElementById('classic-map-btn');
    const mapPanel = document.getElementById('map-panel');
    if (mapBtn && mapPanel) {
      mapBtn.addEventListener('click', function() {
        mapPanel.classList.toggle('collapsed');
        if (!mapPanel.classList.contains('collapsed') && mapPanel.scrollIntoView) {
          mapPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  /**
   * Put the shared sound toggle into the classic top bar while playing and back
   * in the corner on the launch screen
   */
  function placeSoundToggle(inGame) {
    const toggle = document.getElementById('sfx-toggle');
    const bar = document.getElementById('classic-iconbtns');
    const container = document.getElementById('game-container');
    if (!toggle || !bar || !container) return;
    if (inGame) {
      bar.insertBefore(toggle, bar.lastElementChild);
    } else if (toggle.parentNode !== container) {
      container.insertBefore(toggle, container.firstChild);
    }
  }

  function updateTopBar(stats) {
    const set = function(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('classic-name', Player.getName() || 'Mr Owl');
    set('classic-stat-monsters', stats.monstersDefeated || 0);
    set('classic-stat-questions', (stats.questionsCorrect || 0) + '/' + (stats.questionsTotal || 0));
    set('classic-stat-gold', stats.totalLoot || 0);
  }

  /**
   * End the current run for now: save it and go back to the launch screen
   */
  function quitToLaunchScreen() {
    if (gameInProgress) autoSave();
    gameInProgress = false;
    if (typeof Combat !== 'undefined' && Combat.hasActiveEncounter && Combat.hasActiveEncounter()) {
      Combat.cancelEncounter();
    }
    UI.hideQuizModal();
    UI.hideResultModal();
    if (typeof UI.hideMatchingModal === 'function') UI.hideMatchingModal();
    if (typeof UI.hideTreasureModal === 'function') UI.hideTreasureModal();
    UI.hideDirectionBar();
    placeSoundToggle(false);
    refreshStartScreen();
    const nameInput = document.getElementById('player-name');
    if (nameInput && Player.getName()) nameInput.value = Player.getName();
  }

  /**
   * View selector on the start screen (classic / isometric / 3D).
   * Picking a card only remembers the choice; the game starts from the buttons.
   */
  function initViewSelector() {
    if (typeof ProtoSession === 'undefined') return;
    const cards = document.querySelectorAll('#view-cards .view-card');
    if (!cards.length) return;
    function reflect() {
      const current = ProtoSession.getView();
      cards.forEach(function(card) {
        card.classList.toggle('selected', card.dataset.view === current);
      });
    }
    cards.forEach(function(card) {
      card.addEventListener('click', function() {
        ProtoSession.setView(card.dataset.view);
        if (typeof FX !== 'undefined') FX.play('tap');
        reflect();
      });
    });
    reflect();
  }

  /**
   * When a non-classic view is selected, hand the run over to that page
   * @param {string} playerName - Player name
   * @param {string} action - 'new' | 'continue'
   * @returns {boolean} True when navigation was triggered
   */
  function launchSelectedView(playerName, action) {
    if (typeof ProtoSession === 'undefined') return false;
    const view = ProtoSession.getView();
    if (view === 'classic') return false;
    if (typeof Music !== 'undefined') Music.stop(300);
    window.location.href = ProtoSession.launchUrl(view, playerName, action);
    return true;
  }

  /**
   * Handle new game button click
   */
  function handleNewGame() {
    const playerName = UI.getPlayerName();

    if (!playerName) {
      UI.showToast('Please enter your name!', 'error');
      return;
    }

    // Check if save exists
    if (Save.hasSave(playerName)) {
      if (!confirm(`A save for "${playerName}" exists. Start new game and overwrite?`)) {
        return;
      }
    }

    if (launchSelectedView(playerName, 'new')) return;
    startNewGame(playerName);
  }

  /**
   * Handle load game button click
   */
  function handleLoadGame() {
    const playerName = UI.getPlayerName();

    if (!playerName) {
      UI.showToast('Please enter your name or select a saved game!', 'error');
      return;
    }

    if (!Save.hasSave(playerName)) {
      UI.showToast('No saved game found for this name!', 'error');
      return;
    }

    if (launchSelectedView(playerName, 'continue')) return;
    loadGame(playerName);
  }

  /**
   * Auto-save game silently
   */
  function autoSave() {
    if (!gameInProgress) return;

    var matchingUsedIds = (typeof Matching !== 'undefined') ? Matching.getUsedIds() : [];
    Save.saveGame(
      Player.exportState(),
      Dungeon.getState(),
      Questions.getUsedIds(),
      DungeonMap.getState(),
      matchingUsedIds
    );

    // Also save profile progress
    if (typeof UserProfile !== 'undefined') {
      UserProfile.save();
    }
  }

  /**
   * Handle delete save button click
   * @param {string} name - Player name to delete
   */
  function handleDeleteSave(name) {
    if (confirm(`Delete save for "${name}"?`)) {
      Save.deleteSave(name);
      refreshStartScreen();
      UI.showToast('Save deleted!', 'info');
    }
  }

  /**
   * Handle selecting a saved game
   * @param {string} name - Selected player name
   */
  function handleSelectSave(name) {
    // Just fills in the name, user can click Load Game
    UI.showToast(`Selected: ${name}. Click "Load Game" to continue.`, 'info');
  }

  /**
   * Start a new game
   * @param {string} playerName - Player's name
   */
  function startNewGame(playerName) {
    // Reset modules
    Questions.resetUsed();
    if (typeof Matching !== 'undefined') {
      Matching.init();
      Matching.resetUsed();
    }
    Player.create(playerName);
    DungeonMap.init();

    // Load user profile for spaced repetition
    if (typeof UserProfile !== 'undefined') {
      UserProfile.load(playerName);
      Questions.setWeightFunction(function(qId) {
        return UserProfile.getQuestionWeight(qId);
      });
    }

    // Generate new dungeon
    Dungeon.generate();

    // Calculate initial map layout
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    // Start game
    gameInProgress = true;
    if (typeof Music !== 'undefined') Music.stop();

    // Show game screen and render entrance
    UI.showScreen('game');
    placeSoundToggle(true);
    enterRoom(Dungeon.getEntranceId());

    // Auto-save
    autoSave();

    UI.showToast(`Welcome, ${playerName}! Your adventure begins!`, 'success');
  }

  /**
   * Load a saved game
   * @param {string} playerName - Player's name
   */
  function loadGame(playerName) {
    const saveData = Save.loadGame(playerName);

    if (!saveData) {
      UI.showToast('Failed to load save!', 'error');
      return;
    }

    // Load user profile for spaced repetition
    if (typeof UserProfile !== 'undefined') {
      UserProfile.load(playerName);
      Questions.setWeightFunction(function(qId) {
        return UserProfile.getQuestionWeight(qId);
      });
    }

    // Restore state
    Player.loadState(saveData.player);
    Dungeon.loadState(saveData.dungeon);
    if (saveData.usedQuestions) {
      Questions.setUsedIds(saveData.usedQuestions);
    }
    if (typeof Matching !== 'undefined') {
      Matching.init();
      if (saveData.usedMatchingQuestions) {
        Matching.setUsedIds(saveData.usedMatchingQuestions);
      }
    }
    if (saveData.mapState) {
      DungeonMap.loadState(saveData.mapState);
    } else {
      // Legacy save without map - recalculate
      DungeonMap.init();
      DungeonMap.calculateLayout(Dungeon.getEntranceId());
    }

    // Start game
    gameInProgress = true;
    if (typeof Music !== 'undefined') Music.stop();

    // Show game screen and render current room
    UI.showScreen('game');
    placeSoundToggle(true);
    enterRoom(Player.getCurrentRoom());

    UI.showToast(`Welcome back, ${playerName}!`, 'success');
  }

  /**
   * Enter a room and handle what's there
   * @param {string} roomId - Room to enter
   */
  function enterRoom(roomId) {
    // Lock navigation while processing room entry
    navigating = true;
    currentNavOptions = [];

    // Update player location
    if (roomId !== Player.getCurrentRoom()) {
      Player.moveTo(roomId);
      if (typeof FX !== 'undefined') {
        FX.play('step');
        FX.haptic('onNavigation');
      }
    }

    const room = Dungeon.getRoom(roomId);

    if (!room) {
      console.error('Invalid room:', roomId);
      return;
    }

    // Mark room as explored on the map
    DungeonMap.exploreRoom(roomId);

    // Render room
    UI.renderRoom(room);

    // Update stats and inventory
    updateUI();

    // Check for monster encounter
    if (Dungeon.hasMonsterEncounter(roomId)) {
      if (room.encounterType === 'matching' && typeof Matching !== 'undefined') {
        startMatchingEncounter(room.monster, room.depth, room.matchingCategory);
      } else {
        startCombat(room.monster, room.depth);
      }
    } else if (room.type === 'treasure' && !room.cleared) {
      // Treasure room encounter
      startTreasureEncounter(roomId);
    } else {
      // Show navigation options
      showNavigation();
    }
  }

  /**
   * Start treasure encounter
   * @param {string} roomId - Room ID
   */
  function startTreasureEncounter(roomId) {
    // Get random treasure items (with fallback)
    const treasureLoot = typeof getRandomTreasure !== 'undefined'
      ? getRandomTreasure()
      : [{ name: 'Gold Coins', namePL: 'Złote Monety', value: 10 }];

    // Show treasure modal
    UI.showTreasureModal(treasureLoot, (loot) => {
      // Add treasure to player inventory
      loot.forEach(item => Player.addLoot(item));

      // Mark room as cleared
      Dungeon.clearRoom(roomId);

      // Update UI
      updateUI();

      // Auto-save
      autoSave();

      // Show navigation
      showNavigation();
    });
  }

  /**
   * Update UI elements
   */
  function updateUI() {
    const questionStats = Player.getQuestionStats();

    const stats = {
      monstersDefeated: Player.getMonstersDefeated(),
      questionsCorrect: questionStats.correct,
      questionsTotal: questionStats.total,
      accuracy: questionStats.percentage,
      totalLoot: Player.getTotalLootValue()
    };
    UI.renderStats(stats);
    updateTopBar(stats);

    UI.renderInventory(Player.getInventory());

    // Render dungeon map
    const currentRoom = Player.getCurrentRoom();
    UI.renderMap(DungeonMap.renderSVG(currentRoom));
  }

  /**
   * Show navigation options
   */
  function showNavigation() {
    const currentRoom = Player.getCurrentRoom();
    const connections = Dungeon.getConnectedRooms(currentRoom);
    const options = Descriptions.generateNavigationOptions(connections, currentRoom);

    // Store current options for swipe/keyboard direction mapping
    currentNavOptions = options;

    // Unlock navigation now that options are ready
    navigating = false;

    UI.renderNavigation(options, handleNavigation);
  }

  /**
   * Handle direction-based navigation (from swipe or arrow keys via InputAdapter)
   * @param {string} direction - Direction to navigate (North, South, East, West)
   */
  function handleDirectionNavigation(direction) {
    // Don't navigate if game is not in progress, in combat, or already navigating
    if (!gameInProgress || navigating) return;

    // Find navigation option matching this direction
    const option = currentNavOptions.find(opt =>
      opt.direction && opt.direction.en === direction
    );

    if (option) {
      handleNavigation(option.roomId);
    }
  }

  /**
   * Set up InputAdapter event listeners for swipe/keyboard navigation
   */
  function setupInputAdapter() {
    if (typeof InputAdapter === 'undefined') return;

    // Listen for navigate events (from swipes and arrow keys)
    InputAdapter.on('navigate', (data) => {
      if (data.direction) {
        handleDirectionNavigation(data.direction);
      }
    });
  }

  /**
   * Handle navigation selection
   * @param {string} roomId - Selected room ID
   */
  function handleNavigation(roomId) {
    enterRoom(roomId);
  }

  /**
   * Start combat with a monster
   * @param {Object} monster - Monster object
   * @param {number} depth - Room depth for difficulty
   */
  function startCombat(monster, depth) {
    const difficulty = Dungeon.getDepthDifficulty(depth);
    const encounter = Combat.startEncounter(monster, difficulty);

    UI.showQuizModal(encounter, handleAnswer);
  }

  /**
   * Handle answer submission
   * @param {number} answerIndex - Selected answer index
   */
  function handleAnswer(answerIndex) {
    const result = Combat.submitAnswer(answerIndex);

    if (result.error) {
      console.error(result.error);
      return;
    }

    // Let the answer feedback (button flash, monster reaction, sounds) play first
    var fxDone = (typeof UI.playAnswerFx === 'function')
      ? UI.playAnswerFx(answerIndex, result)
      : Promise.resolve();

    fxDone.then(function() {
      // Dragon defeated: commit state now, celebrate, then victory screen
      if (result.dragonDefeated) {
        finalizeDragonVictory();
        UI.hideQuizModal();
        UI.showResultModal(result, showVictory);
        return;
      }

      // Dragon fight continues - swap the question in place
      if (result.success && !result.defeated && result.nextQuestion) {
        UI.updateQuizQuestion(result.nextQuestion, result.streak, handleAnswer);
        return;
      }

      UI.hideQuizModal();
      UI.showResultModal(result, handleResultContinue);
    });
  }

  /**
   * Start a matching encounter with a monster
   * @param {Object} monster - Monster object
   * @param {number} depth - Room depth for difficulty
   * @param {string} category - 'matching' or 'pronoun_matching'
   */
  function startMatchingEncounter(monster, depth, category) {
    var difficulty = Dungeon.getDepthDifficulty(depth);
    var set = Matching.getMatchingSet(difficulty, category);

    if (!set) {
      // Fallback to regular quiz if no matching sets available
      startCombat(monster, depth);
      return;
    }

    UI.showMatchingModal({ monster: monster, set: set }, function(success) {
      handleMatchingComplete(success, monster, set);
    });
  }

  /**
   * Handle matching encounter result
   * @param {boolean} success - Whether all pairs were matched
   * @param {Object} monster - Monster object
   * @param {Object} set - The matching set used
   */
  function handleMatchingComplete(success, monster, set) {
    UI.hideMatchingModal();

    // Record to profile
    if (typeof UserProfile !== 'undefined' && UserProfile.recordAttempt) {
      UserProfile.recordAttempt(set.id, success);
    }

    if (success) {
      // Defeat monster, collect loot
      var loot = monster.loot || [];
      Player.addLoot(loot);
      Player.defeatMonster();
      Player.recordQuestion(true);

      var currentRoom = Player.getCurrentRoom();
      Dungeon.clearRoom(currentRoom);

      var result = {
        success: true,
        defeated: true,
        loot: loot,
        message: typeof Descriptions !== 'undefined'
          ? Descriptions.generateVictoryMessage(monster)
          : { en: 'You matched all pairs and defeated the monster!', pl: 'Dopasowałeś wszystkie pary i pokonałeś potwora!' },
        explanation: set.explanation || ''
      };

      UI.showResultModal(result, handleResultContinue);
    } else {
      // Failed - push player back
      Player.pushBack();
      Player.recordQuestion(false);

      var result = {
        success: false,
        defeated: false,
        pushedBack: true,
        message: typeof Descriptions !== 'undefined'
          ? Descriptions.generateDefeatMessage(monster)
          : { en: 'Wrong match! The monster pushes you back!', pl: 'Złe dopasowanie! Potwór odpycha cię!' },
        explanation: set.explanation || ''
      };

      UI.showResultModal(result, handleResultContinue);
    }
  }

  /**
   * Handle continuing after result modal
   * @param {Object} result - The combat result
   */
  function handleResultContinue(result) {
    updateUI();

    if (result.pushedBack) {
      // Re-render current room (we're now in previous room)
      const room = Dungeon.getRoom(Player.getCurrentRoom());
      UI.renderRoom(room);
    }

    // Show navigation options
    showNavigation();

    // Auto-save
    autoSave();
  }

  /**
   * Handle dragon defeat (game victory)
   */
  function finalizeDragonVictory() {
    gameInProgress = false;

    // Clear room
    Dungeon.clearRoom(Dungeon.getBossId());

    // Update and save user profile before deleting game save
    if (typeof UserProfile !== 'undefined') {
      UserProfile.completeRun();
      UserProfile.save();
    }

    // Delete save (game completed)
    Save.deleteSave(Player.getName());
  }

  /**
   * Show the victory screen (after the dragon result modal)
   */
  function showVictory() {
    const summary = Player.getGameSummary();
    UI.showVictoryScreen(summary, handlePlayAgain);
  }

  /**
   * Handle play again button
   */
  function handlePlayAgain() {
    // Reset and return to start screen
    Player.reset();
    Questions.resetUsed();
    Questions.setWeightFunction(null);
    if (typeof Matching !== 'undefined') {
      Matching.resetUsed();
    }
    if (typeof UserProfile !== 'undefined') {
      UserProfile.reset();
    }
    gameInProgress = false;

    placeSoundToggle(false);
    refreshStartScreen();
  }

  /**
   * Get current game state (for debugging)
   * @returns {Object} Current state
   */
  function getDebugState() {
    return {
      gameInProgress,
      player: Player.getState(),
      dungeon: Dungeon.getStats(),
      questions: Questions.getQuestionStats(),
      combat: Combat.getCombatStats()
    };
  }

  // Public API
  return {
    init,
    getDebugState
  };
})();

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});

// Expose for debugging
if (typeof window !== 'undefined') {
  window.Game = Game;
}
