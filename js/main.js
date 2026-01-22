/**
 * Main Game Controller
 * Entry point that ties all modules together
 */

const Game = (function() {
  // Game state
  let initialized = false;
  let gameInProgress = false;

  /**
   * Initialize the game
   */
  function init() {
    if (initialized) return;

    // Initialize UI
    UI.init();

    // Initialize Questions with data
    Questions.init();

    // Bind UI event handlers
    UI.bindHandlers({
      onNewGame: handleNewGame,
      onLoadGame: handleLoadGame,
      onDeleteSave: handleDeleteSave,
      onSelectSave: handleSelectSave
    });

    // Show start screen with saved games
    refreshStartScreen();

    initialized = true;
    console.log('Mr Owl\'s Dungeon Adventure initialized!');
  }

  /**
   * Refresh the start screen
   */
  function refreshStartScreen() {
    const savedGames = Save.listSaves();
    UI.renderStartScreen(savedGames);
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

    loadGame(playerName);
  }

  /**
   * Auto-save game silently
   */
  function autoSave() {
    if (!gameInProgress) return;

    Save.saveGame(
      Player.exportState(),
      Dungeon.getState(),
      Questions.getUsedIds(),
      DungeonMap.getState()
    );
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
    Player.create(playerName);
    DungeonMap.init();

    // Generate new dungeon
    Dungeon.generate();

    // Calculate initial map layout
    DungeonMap.calculateLayout(Dungeon.getEntranceId());

    // Start game
    gameInProgress = true;

    // Show game screen and render entrance
    UI.showScreen('game');
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

    // Restore state
    Player.loadState(saveData.player);
    Dungeon.loadState(saveData.dungeon);
    if (saveData.usedQuestions) {
      Questions.setUsedIds(saveData.usedQuestions);
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

    // Show game screen and render current room
    UI.showScreen('game');
    enterRoom(Player.getCurrentRoom());

    UI.showToast(`Welcome back, ${playerName}!`, 'success');
  }

  /**
   * Enter a room and handle what's there
   * @param {string} roomId - Room to enter
   */
  function enterRoom(roomId) {
    // Update player location
    if (roomId !== Player.getCurrentRoom()) {
      Player.moveTo(roomId);
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
      startCombat(room.monster, room.depth);
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

    UI.renderStats({
      monstersDefeated: Player.getMonstersDefeated(),
      questionsCorrect: questionStats.correct,
      questionsTotal: questionStats.total,
      accuracy: questionStats.percentage,
      totalLoot: Player.getTotalLootValue()
    });

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

    UI.renderNavigation(options, handleNavigation);
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

    // Hide quiz modal
    UI.hideQuizModal();

    // Check for dragon victory
    if (result.dragonDefeated) {
      handleDragonVictory();
      return;
    }

    // Check if dragon fight continues
    if (result.success && !result.defeated && result.nextQuestion) {
      // Dragon fight continues - show next question
      setTimeout(() => {
        UI.showQuizModal({
          monster: Combat.getCurrentEncounter().monster,
          question: result.nextQuestion,
          isDragon: true,
          dragonStreak: result.streak
        }, handleAnswer);
      }, 500);
      return;
    }

    // Show result modal
    UI.showResultModal(result, handleResultContinue);
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
  function handleDragonVictory() {
    gameInProgress = false;

    // Clear room
    Dungeon.clearRoom(Dungeon.getBossId());

    // Delete save (game completed)
    Save.deleteSave(Player.getName());

    // Show victory screen
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
    gameInProgress = false;

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
