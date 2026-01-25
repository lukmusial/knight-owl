/**
 * Descriptions Module
 * Generates room and monster descriptions for the game
 * All descriptions are bilingual: English and Polish
 * Classic fantasy style, age-appropriate for children
 */

const Descriptions = (function() {
  // Room description templates by type - bilingual
  const ROOM_TEMPLATES = {
    entrance: [
      {
        descriptionEN: 'You stand at the entrance of a great stone dungeon. Ancient torches flicker on the walls, casting dancing shadows. Mr Owl adjusts his shining armor and grips his sword tightly. The adventure begins!',
        descriptionPL: 'Stoisz przy wejściu do wielkiego kamiennego lochu. Starożytne pochodnie migoczą na ścianach, rzucając tańczące cienie. Pan Sowa poprawia swoją lśniącą zbroję i mocno chwyta miecz. Przygoda się zaczyna!',
        imagePrompt: 'A grand stone dungeon entrance with an owl knight in shining armor standing ready, ancient torches on walls, medieval fantasy style, child-friendly, classic fantasy art'
      }
    ],
    corridor: [
      {
        descriptionEN: 'A long stone corridor stretches before you. Water drips from the ceiling, and your footsteps echo in the darkness. Old tapestries hang on the walls, telling stories of ancient heroes.',
        descriptionPL: 'Długi kamienny korytarz rozciąga się przed tobą. Woda kapie z sufitu, a twoje kroki odbijają się echem w ciemności. Na ścianach wiszą stare gobeliny opowiadające historie starożytnych bohaterów.',
        imagePrompt: 'A medieval stone dungeon corridor with dripping water, old tapestries on walls, torch lighting, mysterious atmosphere, classic fantasy art, suitable for children'
      },
      {
        descriptionEN: 'The passage narrows here, with carved pillars holding up the ceiling. Strange runes glow faintly on the floor, marking the path of adventurers who came before.',
        descriptionPL: 'Przejście zwęża się tutaj, a rzeźbione filary podtrzymują sufit. Dziwne runy słabo świecą na podłodze, wyznaczając ścieżkę poszukiwaczy przygód, którzy przeszli tędy wcześniej.',
        imagePrompt: 'A narrow dungeon passage with carved stone pillars, glowing runes on floor, mystical atmosphere, medieval fantasy, classic art style, child-friendly'
      },
      {
        descriptionEN: 'You enter a small chamber with three archways. Moss grows between the stones, and a gentle breeze carries the scent of underground rivers.',
        descriptionPL: 'Wchodzisz do małej komnaty z trzema łukami. Mech rośnie między kamieniami, a delikatna bryza niesie zapach podziemnych rzek.',
        imagePrompt: 'A small dungeon chamber with three stone archways, moss on walls, underground river visible, torchlight, medieval fantasy art, suitable for children'
      },
      {
        descriptionEN: 'This hallway is lined with suits of old armor, standing guard like silent sentinels. Their empty helmets seem to watch you pass.',
        descriptionPL: 'Ten korytarz jest wyłożony starymi zbrojami, stojącymi na warcie jak cisi strażnicy. Ich puste hełmy zdają się obserwować, jak przechodzisz.',
        imagePrompt: 'A dungeon hallway lined with suits of medieval armor, torches between them, stone walls, atmospheric lighting, classic fantasy style, not scary, child-friendly'
      }
    ],
    monster: [
      {
        descriptionEN: 'You enter a chamber lit by glowing crystals embedded in the walls. The blue light reflects off puddles on the stone floor, creating an eerie but beautiful glow.',
        descriptionPL: 'Wchodzisz do komnaty oświetlonej świecącymi kryształami osadzonymi w ścianach. Niebieskie światło odbija się od kałuż na kamiennej podłodze, tworząc niesamowitą, ale piękną poświatę.',
        imagePrompt: 'A dungeon chamber with glowing blue crystals, shadows on walls, dramatic lighting, medieval fantasy setting, mysterious atmosphere, suitable for children'
      },
      {
        descriptionEN: 'This room has seen many battles. Scratches mark the stone floor, and broken weapons lie scattered about. Faded banners hang from the walls.',
        descriptionPL: 'Ta komnata widziała wiele bitew. Rysy znaczą kamienną podłogę, a połamana broń leży rozrzucona dookoła. Wyblakłe sztandary zwisają ze ścian.',
        imagePrompt: 'A battle-scarred dungeon room with scratched stone floor, broken weapons scattered, torch lighting, medieval fantasy, atmospheric but not scary, child-friendly'
      },
      {
        descriptionEN: 'You push open a heavy wooden door and enter a large chamber. Old bones and shiny treasures are piled in the corners. The air smells musty.',
        descriptionPL: 'Otwierasz ciężkie drewniane drzwi i wchodzisz do dużej komnaty. W rogach piętrą się stare kości i błyszczące skarby. Powietrze pachnie stęchlizną.',
        imagePrompt: 'A monster lair in a dungeon with wooden door, treasure pile in corner, torchlight, medieval fantasy style, adventurous atmosphere, suitable for children'
      },
      {
        descriptionEN: 'The air grows cold as you enter this chamber. Spider webs hang from the ceiling like curtains, and mist swirls around your feet.',
        descriptionPL: 'Powietrze staje się zimne, gdy wchodzisz do tej komnaty. Pajęczyny zwisają z sufitu niczym zasłony, a mgła wiruje wokół twoich stóp.',
        imagePrompt: 'A cold dungeon chamber with spider webs on ceiling, mist on floor, blue-tinted lighting, medieval fantasy, spooky but child-friendly atmosphere'
      }
    ],
    treasure: [
      {
        descriptionEN: 'You discover a hidden treasure room! Golden coins glitter in the torchlight, and chests overflow with precious gems and ancient artifacts.',
        descriptionPL: 'Odkrywasz ukrytą komnatę skarbów! Złote monety błyszczą w świetle pochodni, a skrzynie przepełnione są cennymi klejnotami i starożytnymi artefaktami.',
        imagePrompt: 'A dungeon treasure room with golden coins, open treasure chests, gems sparkling, warm torchlight, medieval fantasy style, magical atmosphere, child-friendly'
      },
      {
        descriptionEN: 'Behind a secret door lies a small vault. Dusty shelves hold potions in colorful bottles, and a single chest sits in the center, waiting to be opened.',
        descriptionPL: 'Za sekretnnymi drzwiami kryje się mały skarbiec. Na zakurzonych półkach stoją mikstury w kolorowych butelkach, a pojedyncza skrzynia czeka pośrodku, gotowa do otwarcia.',
        imagePrompt: 'A small dungeon vault with shelves of colorful potion bottles, wooden chest in center, mysterious lighting, medieval fantasy, whimsical atmosphere, suitable for children'
      }
    ],
    boss: [
      {
        descriptionEN: 'You enter an enormous cavern, the heart of the dungeon! Mountains of gold and jewels surround a massive dragon with scales that shimmer like the sun. This is the final challenge!',
        descriptionPL: 'Wchodzisz do ogromnej jaskini, serca lochu! Góry złota i klejnotów otaczają potężnego smoka o łuskach lśniących jak słońce. To ostateczne wyzwanie!',
        imagePrompt: 'A vast underground cavern with a majestic golden dragon sitting on treasure hoard, dramatic lighting, epic scale, medieval fantasy art, awe-inspiring but not terrifying, suitable for children'
      }
    ]
  };

  // Navigation directions - bilingual (cardinal directions)
  const DIRECTIONS = [
    { en: 'North', pl: 'Północ' },
    { en: 'East', pl: 'Wschód' },
    { en: 'South', pl: 'Południe' },
    { en: 'West', pl: 'Zachód' }
  ];

  // Navigation labels - bilingual
  const NAV_LABELS = {
    go: { en: 'Go', pl: 'Idź na' },
    boss: { en: "Dragon's Lair", pl: 'Legowisko Smoka' },
    bossMarker: { en: '(BOSS)', pl: '(BOSS)' },
    explored: { en: '(explored)', pl: '(zbadane)' },
    monster: { en: '(monster ahead!)', pl: '(potwór!)' },
    treasure: { en: '(treasure!)', pl: '(skarb!)' }
  };

  /**
   * Generate description for a room
   * @param {Object} room - Room object with type and depth
   * @returns {Object} Description (EN & PL) and image prompt
   */
  function generateRoomDescription(room) {
    const templates = ROOM_TEMPLATES[room.type] || ROOM_TEMPLATES.corridor;
    const template = templates[Math.floor(Math.random() * templates.length)];

    let descriptionEN = template.descriptionEN;
    let descriptionPL = template.descriptionPL;
    let imagePrompt = template.imagePrompt;

    // Add depth-based atmosphere hints
    if (room.depth > 15) {
      descriptionEN = descriptionEN.replace('torches', 'ancient torches burning with blue flame');
      descriptionPL = descriptionPL.replace('pochodnie', 'starożytne pochodnie płonące niebieskim płomieniem');
      imagePrompt = imagePrompt.replace('torch', 'blue flame torch');
    } else if (room.depth > 10) {
      descriptionEN = descriptionEN.replace('shadows', 'deep shadows');
      descriptionPL = descriptionPL.replace('cienie', 'głębokie cienie');
    }

    return {
      description: descriptionEN, // For backwards compatibility
      descriptionEN,
      descriptionPL,
      imagePrompt
    };
  }

  /**
   * Generate introduction text for a monster (bilingual)
   * @param {Object} monster - Monster object
   * @returns {Object} Monster introduction text {en, pl}
   */
  function generateMonsterIntro(monster) {
    if (!monster) return { en: '', pl: '' };

    const nameEN = monster.name || 'Monster';
    const namePL = monster.namePL || monster.name || 'Potwór';
    const descEN = monster.description || '';
    const descPL = monster.descriptionPL || monster.description || '';

    const introsEN = [
      `A ${nameEN} appears! ${descEN}`,
      `Before you stands a ${nameEN}! ${descEN}`,
      `Out of the shadows emerges a ${nameEN}! ${descEN}`
    ];

    const introsPL = [
      `${namePL} pojawia się! ${descPL}`,
      `Przed tobą stoi ${namePL}! ${descPL}`,
      `Z cieni wyłania się ${namePL}! ${descPL}`
    ];

    const index = Math.floor(Math.random() * introsEN.length);
    return {
      en: introsEN[index],
      pl: introsPL[index]
    };
  }

  /**
   * Generate victory message for defeating a monster (bilingual)
   * @param {Object} monster - Monster object
   * @returns {Object} Victory message {en, pl}
   */
  function generateVictoryMessage(monster) {
    if (!monster) return { en: 'Victory!', pl: 'Zwycięstwo!' };

    if (monster.defeatMessage && monster.defeatMessagePL) {
      return {
        en: monster.defeatMessage,
        pl: monster.defeatMessagePL
      };
    }

    const nameEN = monster.name || 'monster';
    const namePL = monster.namePL || 'potwór';

    const messagesEN = [
      `The ${nameEN} is defeated! Mr Owl claims the treasure!`,
      `With wisdom and courage, Mr Owl defeats the ${nameEN}!`,
      `The ${nameEN} falls! The path is clear!`
    ];

    const messagesPL = [
      `${namePL} został pokonany! Pan Sowa zdobywa skarb!`,
      `Z mądrością i odwagą Pan Sowa pokonuje ${namePL}!`,
      `${namePL} upada! Droga jest wolna!`
    ];

    const index = Math.floor(Math.random() * messagesEN.length);
    return {
      en: messagesEN[index],
      pl: messagesPL[index]
    };
  }

  /**
   * Generate defeat/retreat message (bilingual)
   * @param {Object} monster - Monster object
   * @returns {Object} Defeat message {en, pl}
   */
  function generateDefeatMessage(monster) {
    const messagesEN = [
      'The answer was wrong! Mr Owl must retreat to gather his thoughts.',
      "That wasn't quite right. Mr Owl steps back to try again.",
      "Hmm, that answer didn't work. Time to think more carefully!"
    ];

    const messagesPL = [
      'Odpowiedź była błędna! Pan Sowa musi się wycofać i zebrać myśli.',
      'To nie było całkiem poprawne. Pan Sowa cofa się, by spróbować ponownie.',
      'Hmm, ta odpowiedź nie zadziałała. Czas pomyśleć uważniej!'
    ];

    const index = Math.floor(Math.random() * messagesEN.length);
    return {
      en: messagesEN[index],
      pl: messagesPL[index]
    };
  }

  /**
   * Generate dragon encounter text (bilingual)
   * @param {number} streak - Current correct answer streak
   * @returns {Object} Dragon encounter text {en, pl}
   */
  function generateDragonText(streak) {
    if (streak === 0) {
      return {
        en: 'The mighty dragon speaks in a booming voice: "Brave owl knight! Answer THREE of my riddles correctly, and you may claim my treasure and glory!"',
        pl: 'Potężny smok przemawia gromkim głosem: "Dzielny rycerzu sowo! Odpowiedz poprawnie na TRZY moje zagadki, a zdobędziesz mój skarb i chwałę!"'
      };
    } else if (streak === 1) {
      return {
        en: 'The dragon nods approvingly: "One answer correct! Two more to go, little knight!"',
        pl: 'Smok kiwa głową z aprobatą: "Jedna poprawna odpowiedź! Jeszcze dwie, mały rycerzu!"'
      };
    } else if (streak === 2) {
      return {
        en: "The dragon's eyes widen: \"Impressive! Just one more correct answer, and victory is yours!\"",
        pl: 'Oczy smoka rozszerzają się: "Imponujące! Jeszcze tylko jedna poprawna odpowiedź i zwycięstwo będzie twoje!"'
      };
    }
    return {
      en: 'The dragon roars its challenge!',
      pl: 'Smok ryczy, rzucając wyzwanie!'
    };
  }

  /**
   * Generate victory celebration text (bilingual)
   * @param {Object} player - Player object with stats
   * @returns {Object} Victory text {en, pl}
   */
  function generateVictoryText(player) {
    const monstersEN = player.monstersDefeated || 'many';
    const monstersPL = player.monstersDefeated || 'wiele';
    const questionsEN = player.questionsCorrect || 'numerous';
    const questionsPL = player.questionsCorrect || 'liczne';

    return {
      en: `
        VICTORY! The Ancient Dragon bows before Mr Owl!

        "You have proven yourself worthy, brave knight!" the dragon proclaims.
        "Your wisdom in the Polish language is truly remarkable!"

        Mr Owl has completed his quest through the dungeon,
        defeating ${monstersEN} monsters and answering
        ${questionsEN} questions correctly!

        The treasure is yours, noble owl!
      `,
      pl: `
        ZWYCIĘSTWO! Starożytny Smok kłania się przed Panem Sową!

        "Udowodniłeś swoją wartość, dzielny rycerzu!" obwieszcza smok.
        "Twoja mądrość w języku polskim jest naprawdę niezwykła!"

        Pan Sowa ukończył swoją misję przez loch,
        pokonując ${monstersPL} potworów i odpowiadając
        poprawnie na ${questionsPL} pytań!

        Skarb jest twój, szlachetna sowo!
      `
    };
  }

  /**
   * Get direction based on relative position
   * @param {number} dx - X difference (positive = east)
   * @param {number} dy - Y difference (positive = south, since Y increases downward)
   * @returns {Object} Direction name {en, pl}
   */
  function getDirectionFromDelta(dx, dy) {
    // Determine primary direction based on which axis has larger magnitude
    if (Math.abs(dx) >= Math.abs(dy)) {
      // Primarily horizontal
      if (dx > 0) {
        return DIRECTIONS[1]; // East
      } else {
        return DIRECTIONS[3]; // West
      }
    } else {
      // Primarily vertical (remember: positive Y is down/south in our coordinate system)
      if (dy > 0) {
        return DIRECTIONS[2]; // South
      } else {
        return DIRECTIONS[0]; // North
      }
    }
  }

  /**
   * Get navigation direction name based on map positions
   * @param {string} fromRoomId - Current room ID
   * @param {string} toRoomId - Target room ID
   * @param {number} fallbackIndex - Fallback index if positions unavailable
   * @returns {Object} Direction name {en, pl}
   */
  function getDirectionName(fromRoomId, toRoomId, fallbackIndex) {
    // Try to get actual positions from the map
    if (typeof DungeonMap !== 'undefined' && DungeonMap.getRoomPosition) {
      const fromPos = DungeonMap.getRoomPosition(fromRoomId);
      const toPos = DungeonMap.getRoomPosition(toRoomId);

      if (fromPos && toPos) {
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        return getDirectionFromDelta(dx, dy);
      }
    }

    // Fallback to index-based direction
    const dir = DIRECTIONS[fallbackIndex % DIRECTIONS.length];
    return { en: dir.en, pl: dir.pl };
  }

  /**
   * Generate room exploration options text (bilingual)
   * @param {Array} connections - Connected rooms
   * @param {string} currentRoomId - Current room ID (optional, for direction calculation)
   * @returns {Array} Array of option objects with bilingual labels
   */
  function generateNavigationOptions(connections, currentRoomId) {
    return connections.map((room, index) => {
      const direction = getDirectionName(currentRoomId, room.id, index);
      let labelEN, labelPL;

      // Check if room was actually visited (not just cleared)
      const wasVisited = typeof DungeonMap !== 'undefined' && DungeonMap.isExplored
        ? DungeonMap.isExplored(room.id)
        : false;

      if (room.type === 'boss') {
        // Boss room: "North - Dragon's Lair (BOSS)" / "Północ - Legowisko Smoka (BOSS)"
        labelEN = `${direction.en} - ${NAV_LABELS.boss.en} ${NAV_LABELS.bossMarker.en}`;
        labelPL = `${direction.pl} - ${NAV_LABELS.boss.pl} ${NAV_LABELS.bossMarker.pl}`;
      } else {
        // Regular room: "Go North" / "Idź na Północ"
        labelEN = `${NAV_LABELS.go.en} ${direction.en}`;
        labelPL = `${NAV_LABELS.go.pl} ${direction.pl}`;

        // Only show room content hints for rooms we've already visited
        // Unexplored rooms should remain mysterious
        if (wasVisited) {
          labelEN += ' ' + NAV_LABELS.explored.en;
          labelPL += ' ' + NAV_LABELS.explored.pl;
        }
        // Don't reveal what's in unexplored rooms - keep it mysterious!
      }

      return {
        roomId: room.id,
        label: labelEN, // Backwards compatibility
        labelEN: labelEN,
        labelPL: labelPL,
        type: room.type,
        cleared: room.cleared,
        explored: wasVisited,
        direction: direction // Include direction for reference
      };
    });
  }

  /**
   * Get Mr Owl introduction text (bilingual)
   * @returns {Object} Introduction text {en, pl}
   */
  function getMrOwlIntro() {
    return {
      en: `
        Greetings, brave adventurer!

        I am Mr Owl, the wisest knight in all the land!
        Together, we shall explore this mysterious dungeon,
        defeat monsters, and find the dragon's treasure!

        But beware! Each monster guards a riddle in Polish.
        Answer correctly, and we shall claim victory!
        Answer wrong, and we must retreat to try again.

        Are you ready? Let's begin our adventure!
      `,
      pl: `
        Witaj, dzielny poszukiwaczu przygód!

        Jestem Pan Sowa, najmądrzejszy rycerz w całej krainie!
        Razem zbadamy ten tajemniczy loch,
        pokonamy potwory i znajdziemy skarb smoka!

        Ale uważaj! Każdy potwór strzeże zagadki po polsku.
        Odpowiedz poprawnie, a odniesiemy zwycięstwo!
        Odpowiedz źle, a będziemy musieli się wycofać i spróbować ponownie.

        Czy jesteś gotowy? Rozpocznijmy przygodę!
      `
    };
  }

  /**
   * Get room title (bilingual)
   * @param {Object} room - Room data
   * @returns {Object} Room title {en, pl}
   */
  function getRoomTitle(room) {
    const titles = {
      entrance: { en: 'Dungeon Entrance', pl: 'Wejście do Lochu' },
      corridor: { en: 'Stone Corridor', pl: 'Kamienny Korytarz' },
      monster: {
        en: room.cleared ? 'Cleared Chamber' : 'Monster Chamber',
        pl: room.cleared ? 'Oczyszczona Komnata' : 'Komnata Potwora'
      },
      treasure: { en: 'Treasure Room', pl: 'Komnata Skarbów' },
      boss: { en: "The Dragon's Lair", pl: 'Legowisko Smoka' }
    };

    return titles[room.type] || { en: 'Dungeon Room', pl: 'Komnata Lochu' };
  }

  /**
   * Get action labels (bilingual)
   * @returns {Object} Common UI labels
   */
  function getUILabels() {
    return {
      whereToGo: { en: 'Where to go?', pl: 'Dokąd iść?' },
      continue: { en: 'Continue', pl: 'Kontynuuj' },
      correct: { en: 'Correct!', pl: 'Poprawnie!' },
      notQuiteRight: { en: 'Not quite...', pl: 'Nie całkiem...' },
      victory: { en: 'VICTORY!', pl: 'ZWYCIĘSTWO!' },
      lootObtained: { en: 'Loot obtained:', pl: 'Zdobyte łupy:' },
      monstersDefeated: { en: 'Monsters Defeated:', pl: 'Pokonane Potwory:' },
      questions: { en: 'Questions:', pl: 'Pytania:' },
      treasure: { en: 'Treasure:', pl: 'Skarb:' },
      recentLoot: { en: 'Recent Loot', pl: 'Ostatnie Łupy' },
      noItems: { en: 'No items yet', pl: 'Brak przedmiotów' },
      saveGame: { en: 'Save Game', pl: 'Zapisz Grę' },
      playAgain: { en: 'Play Again', pl: 'Zagraj Ponownie' },
      dragonChallenge: { en: 'Dragon Challenge:', pl: 'Wyzwanie Smoka:' },
      correctAnswer: { en: 'The correct answer was:', pl: 'Poprawna odpowiedź to:' }
    };
  }

  // Public API
  return {
    generateRoomDescription,
    generateMonsterIntro,
    generateVictoryMessage,
    generateDefeatMessage,
    generateDragonText,
    generateVictoryText,
    generateNavigationOptions,
    getMrOwlIntro,
    getDirectionName,
    getRoomTitle,
    getUILabels
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Descriptions;
}
