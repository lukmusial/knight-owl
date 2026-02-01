/**
 * UI Module
 * Handles all DOM manipulation and rendering
 * Displays bilingual content (English and Polish)
 */

const UI = (function() {
  // DOM element references
  let elements = {};

  // Current navigation state for keyboard control
  let currentNavOptions = [];
  let currentNavCallback = null;

  // Get UI labels
  function getLabels() {
    return Descriptions ? Descriptions.getUILabels() : {};
  }

  /**
   * Safely get a label value for a specific language
   * Avoids optional chaining for older WebView compatibility
   * @param {Object} labels - Labels object from getLabels()
   * @param {string} key - Label key (e.g., 'whereToGo')
   * @param {string} lang - Language code ('en' or 'pl')
   * @param {string} fallback - Fallback value if not found
   * @returns {string} Label value or fallback
   */
  function getLabel(labels, key, lang, fallback) {
    if (labels && labels[key] && labels[key][lang]) {
      return labels[key][lang];
    }
    return fallback;
  }

  /**
   * Extract Polish word from vocabulary question prompt
   * @param {string} prompt - Question prompt like 'What does the Polish word "kot" mean?'
   * @returns {string|null} Polish word or null if not found
   */
  function extractPolishWord(prompt) {
    // Match word in quotes: "kot", "czerwony", etc.
    const match = prompt.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }

  /**
   * Check if AudioAdapter is available
   * @returns {boolean} Whether adapter is configured
   */
  function hasAudioAdapter() {
    return typeof AudioAdapter !== 'undefined' && AudioAdapter.hasImplementation();
  }

  /**
   * Speak a Polish word using AudioAdapter (with Web Speech API fallback)
   * @param {string} word - Polish word to speak
   */
  function speakPolishWord(word) {
    if (!word) return;

    // Use AudioAdapter if available
    if (hasAudioAdapter()) {
      AudioAdapter.speak(word, {
        language: 'pl-PL',
        rate: 0.9,
        pitch: 1.2,
        volume: 1.0
      });
      return;
    }

    // Fallback to direct Web Speech API
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.9;   // Slightly slower for learning
    utterance.pitch = 1.2;  // Higher pitch sounds more cheerful/positive
    utterance.volume = 1.0;

    // Try to find a Polish voice (prefer female voices which often sound friendlier)
    const voices = window.speechSynthesis.getVoices();
    const polishVoices = voices.filter(v => v.lang.startsWith('pl'));

    if (polishVoices.length > 0) {
      // Prefer voices with names suggesting female (often sound more positive for kids)
      const preferredVoice = polishVoices.find(v =>
        /zosia|paulina|ewa|anna|female/i.test(v.name)
      ) || polishVoices[0];
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Handle keyboard navigation with arrow keys
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyboardNavigation(event) {
    // Only handle if we have navigation options and callback
    if (!currentNavOptions.length || !currentNavCallback) return;

    // Don't handle if a modal is open or input is focused
    if (elements.quizModal && !elements.quizModal.classList.contains('hidden')) return;
    if (elements.resultModal && !elements.resultModal.classList.contains('hidden')) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    // Map arrow keys to directions
    const keyToDirection = {
      'ArrowUp': 'North',
      'ArrowDown': 'South',
      'ArrowLeft': 'West',
      'ArrowRight': 'East'
    };

    const direction = keyToDirection[event.key];
    if (!direction) return;

    // Find navigation option matching this direction
    const option = currentNavOptions.find(opt =>
      opt.direction && opt.direction.en === direction
    );

    if (option) {
      event.preventDefault();
      currentNavCallback(option.roomId);
    }
  }

  /**
   * Initialize UI elements
   */
  function init() {
    elements = {
      // Screens
      startScreen: document.getElementById('start-screen'),
      gameScreen: document.getElementById('game-screen'),
      victoryScreen: document.getElementById('victory-screen'),

      // Start screen elements
      playerNameInput: document.getElementById('player-name'),
      newGameBtn: document.getElementById('new-game-btn'),
      loadGameBtn: document.getElementById('load-game-btn'),
      savedGamesList: document.getElementById('saved-games-list'),

      // Game screen elements
      roomImage: document.getElementById('room-image'),
      roomDescription: document.getElementById('room-description'),
      navigationPanel: document.getElementById('navigation-panel'),
      statsPanel: document.getElementById('stats-panel'),
      inventoryPanel: document.getElementById('inventory-panel'),
      dungeonMap: document.getElementById('dungeon-map'),

      // Quiz modal elements
      quizModal: document.getElementById('quiz-modal'),
      monsterName: document.getElementById('monster-name'),
      monsterDescription: document.getElementById('monster-description'),
      monsterImage: document.getElementById('monster-image'),
      questionText: document.getElementById('question-text'),
      speakWordBtn: document.getElementById('speak-word-btn'),
      sentenceText: document.getElementById('sentence-text'),
      hintText: document.getElementById('hint-text'),
      answersContainer: document.getElementById('answers-container'),
      dragonProgress: document.getElementById('dragon-progress'),

      // Result modal elements
      resultModal: document.getElementById('result-modal'),
      resultTitle: document.getElementById('result-title'),
      resultMessage: document.getElementById('result-message'),
      resultExplanation: document.getElementById('result-explanation'),
      lootContainer: document.getElementById('loot-container'),
      continueBtn: document.getElementById('continue-btn'),

      // Treasure modal elements
      treasureModal: document.getElementById('treasure-modal'),
      treasureLootContainer: document.getElementById('treasure-loot-container'),
      treasureContinueBtn: document.getElementById('treasure-continue-btn'),

      // Victory screen elements
      victoryStats: document.getElementById('victory-stats'),
      playAgainBtn: document.getElementById('play-again-btn')
    };

    // Add keyboard navigation listener
    document.addEventListener('keydown', handleKeyboardNavigation);
  }

  /**
   * Show a specific screen
   * @param {string} screenName - 'start', 'game', or 'victory'
   */
  function showScreen(screenName) {
    if (elements.startScreen) elements.startScreen.classList.add('hidden');
    if (elements.gameScreen) elements.gameScreen.classList.add('hidden');
    if (elements.victoryScreen) elements.victoryScreen.classList.add('hidden');

    switch (screenName) {
      case 'start':
        if (elements.startScreen) elements.startScreen.classList.remove('hidden');
        break;
      case 'game':
        if (elements.gameScreen) elements.gameScreen.classList.remove('hidden');
        break;
      case 'victory':
        if (elements.victoryScreen) elements.victoryScreen.classList.remove('hidden');
        break;
    }
  }

  /**
   * Render the start screen
   * @param {Array} savedGames - List of saved games
   */
  function renderStartScreen(savedGames) {
    showScreen('start');

    if (elements.savedGamesList) {
      if (savedGames && savedGames.length > 0) {
        elements.savedGamesList.innerHTML = savedGames.map(save => `
          <div class="saved-game-item" data-name="${save.name}">
            <span class="save-name">${save.name}</span>
            <span class="save-info">${save.monstersDefeated} monsters / potworów</span>
            <button class="delete-save-btn" data-name="${save.name}">Delete / Usuń</button>
          </div>
        `).join('');
      } else {
        elements.savedGamesList.innerHTML = '<p class="no-saves">No saved games / Brak zapisanych gier</p>';
      }
    }
  }

  /**
   * Get entered player name
   * @returns {string} Player name
   */
  function getPlayerName() {
    return elements.playerNameInput ? elements.playerNameInput.value.trim() : '';
  }

  /**
   * Get direction image path based on room exits
   * @param {Object} room - Room data with x, y, and connections
   * @returns {string} Image path
   */
  function getDirectionImage(room) {
    // Only for regular rooms with coordinates
    if (typeof room.x !== 'number' || typeof room.y !== 'number') {
      return 'assets/knight_owl.png';
    }

    const directions = [];

    // Check each connection to determine direction
    room.connections.forEach(connId => {
      // Parse connection room coordinates from ID (e.g., "room_3_2")
      const match = connId.match(/room_(\d+)_(\d+)/);
      if (match) {
        const connX = parseInt(match[1], 10);
        const connY = parseInt(match[2], 10);

        if (connY < room.y) directions.push('n');      // North (up)
        else if (connY > room.y) directions.push('s'); // South (down)
        else if (connX > room.x) directions.push('e'); // East (right)
        else if (connX < room.x) directions.push('w'); // West (left)
      }
    });

    // Sort directions in compass order (n, s, e, w) to match file naming
    const compassOrder = { n: 0, s: 1, e: 2, w: 3 };
    directions.sort((a, b) => compassOrder[a] - compassOrder[b]);
    const key = directions.join('_');

    // Available direction images
    const availableImages = ['e_w', 'n_e', 'n_e_w', 'n_s', 'n_s_e', 'n_s_w', 'n_w', 's_e', 's_e_w', 's_w'];

    if (key && availableImages.includes(key)) {
      return `assets/directions/${key}.png`;
    }

    return 'assets/knight_owl.png';
  }

  /**
   * Render the current room with bilingual descriptions
   * @param {Object} room - Room data
   */
  function renderRoom(room) {
    if (elements.roomImage) {
      elements.roomImage.src = getDirectionImage(room);
      elements.roomImage.alt = room.imagePrompt || 'Dungeon room';
      elements.roomImage.dataset.prompt = room.imagePrompt || '';
    }

    if (elements.roomDescription) {
      const title = Descriptions ? Descriptions.getRoomTitle(room) : { en: 'Room', pl: 'Komnata' };
      const descEN = room.descriptionEN || room.description || 'A mysterious dungeon room.';

      elements.roomDescription.innerHTML = `
        <h2 class="room-title">
          <span class="title-en">${title.en}</span>
          <span class="title-pl">${title.pl}</span>
        </h2>
        <p class="room-desc">${descEN}</p>
      `;
    }
  }

  /**
   * Render navigation options with bilingual labels
   * @param {Array} options - Navigation options
   * @param {Function} onNavigate - Callback when navigation selected
   */
  function renderNavigation(options, onNavigate) {
    if (!elements.navigationPanel) return;

    // Store for keyboard navigation
    currentNavOptions = options;
    currentNavCallback = onNavigate;

    const labels = getLabels();

    elements.navigationPanel.innerHTML = `
      <h3 class="nav-header">
        <span class="label-en">${getLabel(labels, 'whereToGo', 'en', 'Where to go?')}</span>
        <span class="label-pl">${getLabel(labels, 'whereToGo', 'pl', 'Dokąd iść?')}</span>
      </h3>
      <div class="nav-options">
        ${options.map((opt, i) => `
          <button class="nav-btn ${opt.explored ? 'explored' : 'unexplored'} ${opt.type === 'boss' ? 'boss-btn' : ''}"
                  data-room="${opt.roomId}">
            <span class="nav-en">${opt.labelEN || opt.label}</span>
            <span class="nav-pl">${opt.labelPL || opt.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    elements.navigationPanel.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = btn.dataset.room;
        if (onNavigate) onNavigate(roomId);
      });
    });
  }

  /**
   * Render player stats with bilingual labels
   * @param {Object} stats - Player statistics
   */
  function renderStats(stats) {
    if (!elements.statsPanel) return;

    const labels = getLabels();

    elements.statsPanel.innerHTML = `
      <div class="stat">
        <span class="stat-label">
          <span class="label-en">${getLabel(labels, 'monstersDefeated', 'en', 'Monsters Defeated:')}</span>
          <span class="label-pl">${getLabel(labels, 'monstersDefeated', 'pl', 'Pokonane Potwory:')}</span>
        </span>
        <span class="stat-value">${stats.monstersDefeated}</span>
      </div>
      <div class="stat">
        <span class="stat-label">
          <span class="label-en">${getLabel(labels, 'questions', 'en', 'Questions:')}</span>
          <span class="label-pl">${getLabel(labels, 'questions', 'pl', 'Pytania:')}</span>
        </span>
        <span class="stat-value">${stats.questionsCorrect}/${stats.questionsTotal} (${stats.accuracy}%)</span>
      </div>
      <div class="stat">
        <span class="stat-label">
          <span class="label-en">${getLabel(labels, 'treasure', 'en', 'Treasure:')}</span>
          <span class="label-pl">${getLabel(labels, 'treasure', 'pl', 'Skarb:')}</span>
        </span>
        <span class="stat-value">${stats.totalLoot} gold / złota</span>
      </div>
    `;
  }

  /**
   * Render inventory with bilingual labels
   * @param {Array} inventory - Player's items
   */
  function renderInventory(inventory) {
    if (!elements.inventoryPanel) return;

    const labels = getLabels();

    if (inventory.length === 0) {
      elements.inventoryPanel.innerHTML = `
        <h3 class="inventory-header">
          <span class="label-en">${getLabel(labels, 'recentLoot', 'en', 'Recent Loot')}</span>
          <span class="label-pl">${getLabel(labels, 'recentLoot', 'pl', 'Ostatnie Łupy')}</span>
        </h3>
        <p class="empty-inventory">
          <span class="label-en">${getLabel(labels, 'noItems', 'en', 'No items yet')}</span>
          <span class="label-pl">${getLabel(labels, 'noItems', 'pl', 'Brak przedmiotów')}</span>
        </p>
      `;
      return;
    }

    const recentItems = inventory.slice(-5).reverse();
    elements.inventoryPanel.innerHTML = `
      <h3 class="inventory-header">
        <span class="label-en">${getLabel(labels, 'recentLoot', 'en', 'Recent Loot')}</span>
        <span class="label-pl">${getLabel(labels, 'recentLoot', 'pl', 'Ostatnie Łupy')}</span>
      </h3>
      <ul class="inventory-list">
        ${recentItems.map(item => `
          <li class="inventory-item">
            <span class="item-name">
              <span class="name-en">${item.name}</span>
              <span class="name-pl">${item.namePL || item.name}</span>
            </span>
            <span class="item-value">${item.value}g</span>
          </li>
        `).join('')}
      </ul>
      ${inventory.length > 5 ? `
        <p class="more-items">
          <span class="label-en">...and ${inventory.length - 5} more items</span>
          <span class="label-pl">...i jeszcze ${inventory.length - 5} przedmiotów</span>
        </p>
      ` : ''}
    `;
  }

  /**
   * Render the dungeon map
   * @param {string} svgMarkup - SVG markup from DungeonMap.renderSVG()
   */
  function renderMap(svgMarkup) {
    if (!elements.dungeonMap) return;
    const legendHTML = DungeonMap.renderLegendHTML();
    elements.dungeonMap.innerHTML = svgMarkup + legendHTML;
  }

  /**
   * Show quiz modal for monster encounter
   * @param {Object} encounter - Encounter data
   * @param {Function} onAnswer - Callback when answer selected
   */
  function showQuizModal(encounter, onAnswer) {
    if (!elements.quizModal) return;

    const { monster, question, isDragon, dragonStreak } = encounter;
    const labels = getLabels();

    if (elements.monsterName) {
      elements.monsterName.innerHTML = `
        <span class="monster-name-en">${monster.name}</span>
        <span class="monster-name-pl">${monster.namePL || monster.name}</span>
      `;
    }

    if (elements.monsterImage) {
      // Use monster-specific image, fallback to placeholder
      elements.monsterImage.src = `assets/${monster.id}.png`;
      elements.monsterImage.alt = monster.name;
      elements.monsterImage.onerror = function() {
        this.src = 'assets/placeholder.svg';
        this.onerror = null;
      };
    }

    if (elements.monsterDescription) {
      const descEN = monster.description || '';
      const descPL = monster.descriptionPL || '';
      elements.monsterDescription.innerHTML = `
        <span class="desc-en">${descEN}</span>
        <span class="desc-pl">${descPL}</span>
      `;
    }

    if (elements.questionText) {
      elements.questionText.textContent = question.prompt;
    }

    // Show speak button for vocabulary questions
    if (elements.speakWordBtn) {
      const polishWord = question.category === 'vocabulary' ? extractPolishWord(question.prompt) : null;
      if (polishWord) {
        elements.speakWordBtn.classList.remove('hidden');
        elements.speakWordBtn.onclick = () => speakPolishWord(polishWord);
      } else {
        elements.speakWordBtn.classList.add('hidden');
        elements.speakWordBtn.onclick = null;
      }
    }

    // Show sentence for grammar questions (has separate sentence field)
    if (elements.sentenceText) {
      if (question.sentence) {
        elements.sentenceText.textContent = question.sentence;
        elements.sentenceText.classList.remove('hidden');
      } else {
        elements.sentenceText.textContent = '';
        elements.sentenceText.classList.add('hidden');
      }
    }

    if (elements.hintText) {
      elements.hintText.textContent = question.hint || '';
    }

    if (elements.dragonProgress) {
      if (isDragon) {
        elements.dragonProgress.classList.remove('hidden');
        elements.dragonProgress.innerHTML = `
          <div class="dragon-streak">
            <span class="streak-label">
              <span class="label-en">${getLabel(labels, 'dragonChallenge', 'en', 'Dragon Challenge:')}</span>
              <span class="label-pl">${getLabel(labels, 'dragonChallenge', 'pl', 'Wyzwanie Smoka:')}</span>
            </span>
            ${[0, 1, 2].map(i => `
              <span class="streak-dot ${i < dragonStreak ? 'filled' : ''}"></span>
            `).join('')}
          </div>
        `;
      } else {
        elements.dragonProgress.classList.add('hidden');
      }
    }

    if (elements.answersContainer) {
      elements.answersContainer.innerHTML = question.options.map((opt, i) => `
        <div class="answer-row">
          <button class="answer-btn" data-index="${i}">${opt}</button>
          ${question.category === 'grammar' ? '<button class="btn-speak-answer" data-word="' + opt + '" title="Listen">&#x1f50a;</button>' : ''}
        </div>
      `).join('');

      elements.answersContainer.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          if (onAnswer) onAnswer(index);
        });
      });

      elements.answersContainer.querySelectorAll('.btn-speak-answer').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          speakPolishWord(btn.dataset.word);
        });
      });
    }

    elements.quizModal.classList.remove('hidden');
  }

  /**
   * Hide quiz modal
   */
  function hideQuizModal() {
    if (elements.quizModal) {
      elements.quizModal.classList.add('hidden');
    }
  }

  /**
   * Update quiz modal with new question (for dragon)
   * @param {Object} question - New question
   * @param {number} streak - Current streak
   * @param {Function} onAnswer - Callback
   */
  function updateQuizQuestion(question, streak, onAnswer) {
    const labels = getLabels();

    if (elements.questionText) {
      elements.questionText.textContent = question.prompt;
    }

    // Show sentence for grammar questions (has separate sentence field)
    if (elements.sentenceText) {
      if (question.sentence) {
        elements.sentenceText.textContent = question.sentence;
        elements.sentenceText.classList.remove('hidden');
      } else {
        elements.sentenceText.textContent = '';
        elements.sentenceText.classList.add('hidden');
      }
    }

    if (elements.hintText) {
      elements.hintText.textContent = question.hint || '';
    }

    if (elements.dragonProgress) {
      elements.dragonProgress.innerHTML = `
        <div class="dragon-streak">
          <span class="streak-label">
            <span class="label-en">${getLabel(labels, 'dragonChallenge', 'en', 'Dragon Challenge:')}</span>
            <span class="label-pl">${getLabel(labels, 'dragonChallenge', 'pl', 'Wyzwanie Smoka:')}</span>
          </span>
          ${[0, 1, 2].map(i => `
            <span class="streak-dot ${i < streak ? 'filled' : ''}"></span>
          `).join('')}
        </div>
      `;
    }

    if (elements.answersContainer) {
      elements.answersContainer.innerHTML = question.options.map((opt, i) => `
        <div class="answer-row">
          <button class="answer-btn" data-index="${i}">${opt}</button>
          ${question.category === 'grammar' ? '<button class="btn-speak-answer" data-word="' + opt + '" title="Listen">&#x1f50a;</button>' : ''}
        </div>
      `).join('');

      elements.answersContainer.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          if (onAnswer) onAnswer(index);
        });
      });

      elements.answersContainer.querySelectorAll('.btn-speak-answer').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          speakPolishWord(btn.dataset.word);
        });
      });
    }
  }

  /**
   * Show result modal after answering with bilingual content
   * @param {Object} result - Result data
   * @param {Function} onContinue - Callback when continue clicked
   */
  function showResultModal(result, onContinue) {
    if (!elements.resultModal) return;

    const labels = getLabels();

    if (elements.resultTitle) {
      if (result.dragonDefeated) {
        elements.resultTitle.innerHTML = `
          <span class="title-en">${getLabel(labels, 'victory', 'en', 'VICTORY!')}</span>
          <span class="title-pl">${getLabel(labels, 'victory', 'pl', 'ZWYCIĘSTWO!')}</span>
        `;
        elements.resultTitle.className = 'result-title victory';
      } else if (result.success) {
        elements.resultTitle.innerHTML = `
          <span class="title-en">${getLabel(labels, 'correct', 'en', 'Correct!')}</span>
          <span class="title-pl">${getLabel(labels, 'correct', 'pl', 'Poprawnie!')}</span>
        `;
        elements.resultTitle.className = 'result-title success';
      } else {
        elements.resultTitle.innerHTML = `
          <span class="title-en">${getLabel(labels, 'notQuiteRight', 'en', 'Not quite...')}</span>
          <span class="title-pl">${getLabel(labels, 'notQuiteRight', 'pl', 'Nie całkiem...')}</span>
        `;
        elements.resultTitle.className = 'result-title failure';
      }
    }

    if (elements.resultMessage) {
      const msgEN = (result.message && result.message.en) || result.message || '';
      const msgPL = (result.message && result.message.pl) || result.message || '';

      elements.resultMessage.innerHTML = `
        <span class="msg-en">${msgEN}</span>
        <span class="msg-pl">${msgPL}</span>
      `;
    }

    if (elements.resultExplanation) {
      let explanationHTML = result.explanation || '';

      if (!result.success && result.correctAnswer) {
        const correctLabelEN = getLabel(labels, 'correctAnswer', 'en', 'The correct answer was:');
        const correctLabelPL = getLabel(labels, 'correctAnswer', 'pl', 'Poprawna odpowiedź to:');
        explanationHTML = `
          <span class="explanation-text">${result.explanation || ''}</span>
          <span class="correct-answer">
            <span class="label-en">${correctLabelEN} ${result.correctAnswer}</span>
            <span class="label-pl">${correctLabelPL} ${result.correctAnswer}</span>
          </span>
        `;
      }

      // Add sentence listen button for grammar questions on success
      if (result.success && result.sentence && result.correctAnswer) {
        var fullSentence = result.sentence.replace('___', result.correctAnswer);
        explanationHTML += `
          <div class="sentence-listen">
            <span class="full-sentence">${fullSentence}</span>
            <button class="btn-speak-sentence" title="Listen">&#x1f50a;</button>
          </div>
        `;
      }

      elements.resultExplanation.innerHTML = explanationHTML;

      // Attach sentence speak handler
      var speakSentenceBtn = elements.resultExplanation.querySelector('.btn-speak-sentence');
      if (speakSentenceBtn) {
        speakSentenceBtn.addEventListener('click', function() {
          var sentence = speakSentenceBtn.closest('.sentence-listen').querySelector('.full-sentence').textContent;
          speakPolishWord(sentence);
        });
      }
    }

    // Hide loot initially - will show when continue button is enabled
    if (elements.lootContainer) {
      elements.lootContainer.classList.add('hidden');
    }

    if (elements.continueBtn) {
      elements.continueBtn.innerHTML = `
        <span class="btn-en">${getLabel(labels, 'continue', 'en', 'Continue')}</span>
        <span class="btn-pl">${getLabel(labels, 'continue', 'pl', 'Kontynuuj')}</span>
      `;

      // Reset button state and restart animation
      elements.continueBtn.classList.remove('btn-progress', 'ready');
      elements.continueBtn.disabled = true;
      elements.continueBtn.onclick = null;

      // Force reflow to restart CSS animation
      void elements.continueBtn.offsetWidth;

      // Start progress animation
      elements.continueBtn.classList.add('btn-progress');

      // Enable button after 8 seconds and show loot
      setTimeout(() => {
        elements.continueBtn.classList.add('ready');
        elements.continueBtn.disabled = false;
        elements.continueBtn.onclick = () => {
          hideResultModal();
          if (onContinue) onContinue(result);
        };

        // Show loot when button becomes enabled
        if (elements.lootContainer && result.loot && result.loot.length > 0) {
          elements.lootContainer.innerHTML = `
            <h4>
              <span class="label-en">${getLabel(labels, 'lootObtained', 'en', 'Loot obtained:')}</span>
              <span class="label-pl">${getLabel(labels, 'lootObtained', 'pl', 'Zdobyte łupy:')}</span>
            </h4>
            <ul class="loot-list">
              ${result.loot.map(item => `
                <li>
                  <span class="loot-pl loot-primary">${item.namePL || item.name}</span>
                  <span class="loot-en loot-secondary">${item.name}</span>
                  <span class="loot-value">(${item.value}g)</span>
                </li>
              `).join('')}
            </ul>
          `;
          elements.lootContainer.classList.remove('hidden');
        }
      }, 8000);
    }

    elements.resultModal.classList.remove('hidden');
  }

  /**
   * Hide result modal
   */
  function hideResultModal() {
    if (elements.resultModal) {
      elements.resultModal.classList.add('hidden');
    }
  }

  /**
   * Show treasure modal when entering a treasure room
   * @param {Array} loot - Array of treasure items
   * @param {Function} onCollect - Callback when treasure is collected
   */
  function showTreasureModal(loot, onCollect) {
    if (!elements.treasureModal) return;

    const labels = getLabels();

    // Render the treasure items
    if (elements.treasureLootContainer) {
      elements.treasureLootContainer.innerHTML = `
        <h4>
          <span class="label-en">${getLabel(labels, 'treasure', 'en', 'Treasure:')}</span>
          <span class="label-pl">${getLabel(labels, 'treasure', 'pl', 'Skarb:')}</span>
        </h4>
        <ul class="loot-list">
          ${loot.map(item => `
            <li>
              <span class="loot-pl loot-primary">${item.namePL || item.name}</span>
              <span class="loot-en loot-secondary">${item.name}</span>
              <span class="loot-value">(${item.value}g)</span>
            </li>
          `).join('')}
        </ul>
      `;
    }

    // Bind continue button
    if (elements.treasureContinueBtn) {
      elements.treasureContinueBtn.onclick = () => {
        hideTreasureModal();
        if (onCollect) onCollect(loot);
      };
    }

    elements.treasureModal.classList.remove('hidden');
  }

  /**
   * Hide treasure modal
   */
  function hideTreasureModal() {
    if (elements.treasureModal) {
      elements.treasureModal.classList.add('hidden');
    }
  }

  /**
   * Show victory screen with bilingual content
   * @param {Object} summary - Game summary
   * @param {Function} onPlayAgain - Callback for play again
   */
  function showVictoryScreen(summary, onPlayAgain) {
    showScreen('victory');

    const labels = getLabels();

    if (elements.victoryStats) {
      elements.victoryStats.innerHTML = `
        <h2 class="congrats-header">
          <span class="header-en">Congratulations, ${summary.name}!</span>
          <span class="header-pl">Gratulacje, ${summary.name}!</span>
        </h2>
        <p class="victory-message">
          <span class="msg-en">Mr Owl has defeated the dragon and saved the dungeon!</span>
          <span class="msg-pl">Pan Sowa pokonał smoka i uratował loch!</span>
        </p>

        <div class="final-stats">
          <div class="final-stat">
            <span class="final-stat-label">
              <span class="label-en">Monsters Defeated</span>
              <span class="label-pl">Pokonane Potwory</span>
            </span>
            <span class="final-stat-value">${summary.monstersDefeated}</span>
          </div>
          <div class="final-stat">
            <span class="final-stat-label">
              <span class="label-en">Questions Answered</span>
              <span class="label-pl">Udzielone Odpowiedzi</span>
            </span>
            <span class="final-stat-value">${summary.questionsCorrect} / ${summary.questionsTotal}</span>
          </div>
          <div class="final-stat">
            <span class="final-stat-label">
              <span class="label-en">Accuracy</span>
              <span class="label-pl">Dokładność</span>
            </span>
            <span class="final-stat-value">${summary.accuracy}%</span>
          </div>
          <div class="final-stat">
            <span class="final-stat-label">
              <span class="label-en">Total Treasure</span>
              <span class="label-pl">Całkowity Skarb</span>
            </span>
            <span class="final-stat-value">${summary.totalLoot} gold / złota</span>
          </div>
          <div class="final-stat">
            <span class="final-stat-label">
              <span class="label-en">Items Collected</span>
              <span class="label-pl">Zebrane Przedmioty</span>
            </span>
            <span class="final-stat-value">${summary.itemsCollected}</span>
          </div>
          <div class="final-stat">
            <span class="final-stat-label">
              <span class="label-en">Play Time</span>
              <span class="label-pl">Czas Gry</span>
            </span>
            <span class="final-stat-value">${summary.playTime}</span>
          </div>
        </div>
      `;
    }

    if (elements.playAgainBtn) {
      elements.playAgainBtn.innerHTML = `
        <span class="btn-en">${getLabel(labels, 'playAgain', 'en', 'Play Again')}</span>
        <span class="btn-pl">${getLabel(labels, 'playAgain', 'pl', 'Zagraj Ponownie')}</span>
      `;
      elements.playAgainBtn.onclick = onPlayAgain;
    }
  }

  /**
   * Show a message toast
   * @param {string} message - Message to show
   * @param {string} type - 'info', 'success', or 'error'
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Bind event handlers
   * @param {Object} handlers - Object with handler functions
   */
  function bindHandlers(handlers) {
    if (elements.newGameBtn && handlers.onNewGame) {
      // Use both click and touchend for better mobile WebView compatibility
      elements.newGameBtn.addEventListener('click', handlers.onNewGame);
      elements.newGameBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        handlers.onNewGame();
      });
    }

    if (elements.loadGameBtn && handlers.onLoadGame) {
      // Use both click and touchend for better mobile WebView compatibility
      elements.loadGameBtn.addEventListener('click', handlers.onLoadGame);
      elements.loadGameBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        handlers.onLoadGame();
      });
    }

    if (elements.savedGamesList && handlers.onDeleteSave) {
      elements.savedGamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-save-btn')) {
          const name = e.target.dataset.name;
          handlers.onDeleteSave(name);
        }
      });
    }

    if (elements.savedGamesList && handlers.onSelectSave) {
      elements.savedGamesList.addEventListener('click', (e) => {
        const item = e.target.closest('.saved-game-item');
        if (item && !e.target.classList.contains('delete-save-btn')) {
          const name = item.dataset.name;
          if (elements.playerNameInput) {
            elements.playerNameInput.value = name;
          }
          handlers.onSelectSave(name);
        }
      });
    }
  }

  // Public API
  return {
    init,
    showScreen,
    renderStartScreen,
    getPlayerName,
    renderRoom,
    renderNavigation,
    renderStats,
    renderInventory,
    renderMap,
    showQuizModal,
    hideQuizModal,
    updateQuizQuestion,
    showResultModal,
    hideResultModal,
    showTreasureModal,
    hideTreasureModal,
    showVictoryScreen,
    showToast,
    bindHandlers
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}
