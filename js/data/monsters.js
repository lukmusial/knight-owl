/**
 * Monster Definitions Database
 * All monsters have bilingual descriptions (English and Polish)
 * Extensible: Add new monsters to the MONSTERS array
 */

const MONSTERS = [
  // Difficulty 1 - Easy monsters (depths 1-7)
  {
    id: 'goblin',
    name: 'Goblin',
    namePL: 'Goblin',
    difficulty: 1,
    description: 'A small, green creature with pointy ears and a mischievous grin.',
    descriptionPL: 'Małe, zielone stworzenie z pointymi uszami i psotnym uśmiechem.',
    imagePrompt: 'A cute cartoon goblin with green skin, pointy ears, wearing tattered brown clothes, holding a small wooden club, standing in a stone dungeon corridor, fantasy art style, friendly looking, suitable for children',
    loot: [
      { name: 'Goblin Coin', namePL: 'Moneta Goblina', value: 5 },
      { name: 'Rusty Key', namePL: 'Zardzewiały Klucz', value: 3 }
    ],
    defeatMessage: 'The goblin squeaks and runs away, dropping its treasures!',
    defeatMessagePL: 'Goblin piszczy i ucieka, upuszczając swoje skarby!'
  },
  {
    id: 'giant_rat',
    name: 'Giant Rat',
    namePL: 'Wielki Szczur',
    difficulty: 1,
    description: 'A rat the size of a dog, with glowing red eyes and sharp teeth.',
    descriptionPL: 'Szczur wielkości psa, ze świecącymi czerwonymi oczami i ostrymi zębami.',
    imagePrompt: 'A large cartoon rat with gray fur, red glowing eyes, sharp white teeth, standing on hind legs in a dark dungeon, fantasy art style, not too scary, suitable for children',
    loot: [
      { name: 'Rat Tail', namePL: 'Ogon Szczura', value: 2 },
      { name: 'Cheese Crumb', namePL: 'Okruszek Sera', value: 1 }
    ],
    defeatMessage: 'The giant rat scurries into a crack in the wall!',
    defeatMessagePL: 'Wielki szczur ucieka w szczelinę w ścianie!'
  },
  {
    id: 'slime',
    name: 'Green Slime',
    namePL: 'Zielony Szlam',
    difficulty: 1,
    description: 'A wobbly blob of green goo that bounces around the room.',
    descriptionPL: 'Chwiejący się kłąb zielonej mazi, który podskakuje po pomieszczeniu.',
    imagePrompt: 'A cute bouncy green slime blob with two big googly eyes, transparent and gelatinous, in a stone dungeon room, fantasy art style, friendly looking, suitable for children',
    loot: [
      { name: 'Slime Jelly', namePL: 'Galaretka Szlamu', value: 4 },
      { name: 'Shiny Pebble', namePL: 'Błyszczący Kamyk', value: 2 }
    ],
    defeatMessage: 'The slime jiggles happily and splits into tiny harmless blobs!',
    defeatMessagePL: 'Szlam trzęsie się radośnie i dzieli na małe, nieszkodliwe kulki!'
  },
  {
    id: 'bat_swarm',
    name: 'Bat Swarm',
    namePL: 'Rój Nietoperzy',
    difficulty: 1,
    description: 'A group of squeaky bats flying in circles.',
    descriptionPL: 'Grupa piszczących nietoperzy latających w kółko.',
    imagePrompt: 'A swarm of cute small cartoon bats with big ears flying in a circle in a dark cave, purple and black colors, fantasy art style, friendly looking, suitable for children',
    loot: [
      { name: 'Bat Wing', namePL: 'Skrzydło Nietoperza', value: 3 },
      { name: 'Echo Stone', namePL: 'Kamień Echa', value: 5 }
    ],
    defeatMessage: 'The bats fly away into the darkness, leaving behind some treasures!',
    defeatMessagePL: 'Nietoperze odlatują w ciemność, zostawiając za sobą skarby!'
  },

  // Difficulty 2 - Medium monsters (depths 8-14)
  {
    id: 'skeleton',
    name: 'Skeleton Warrior',
    namePL: 'Szkieletowy Wojownik',
    difficulty: 2,
    description: 'A walking skeleton in rusty armor, holding an old sword.',
    descriptionPL: 'Chodzący szkielet w zardzewiałej zbroi, trzymający stary miecz.',
    imagePrompt: 'A cartoon skeleton warrior wearing rusty medieval armor, holding an old sword and shield, standing in a dungeon hallway, fantasy art style, not scary, suitable for children, slightly comical pose',
    loot: [
      { name: 'Bone Shard', namePL: 'Odłamek Kości', value: 8 },
      { name: 'Ancient Coin', namePL: 'Starożytna Moneta', value: 10 },
      { name: 'Rusty Helmet', namePL: 'Zardzewiały Hełm', value: 7 }
    ],
    defeatMessage: 'The skeleton crumbles into a pile of bones!',
    defeatMessagePL: 'Szkielet rozpada się na kupkę kości!'
  },
  {
    id: 'spider',
    name: 'Giant Spider',
    namePL: 'Wielki Pająk',
    difficulty: 2,
    description: 'A large purple spider with eight hairy legs and multiple eyes.',
    descriptionPL: 'Duży fioletowy pająk z ośmioma włochatymi nogami i wieloma oczami.',
    imagePrompt: 'A large cartoon spider with purple body, eight fuzzy legs, multiple cute googly eyes, spinning a silver web in a dungeon corner, fantasy art style, not too scary, suitable for children',
    loot: [
      { name: 'Spider Silk', namePL: 'Pajęcza Przędza', value: 12 },
      { name: 'Venom Vial', namePL: 'Fiolka Jadu', value: 9 }
    ],
    defeatMessage: 'The spider retreats to its web, leaving behind valuable silk!',
    defeatMessagePL: 'Pająk wycofuje się do swojej sieci, zostawiając cenną przędzę!'
  },
  {
    id: 'ghost',
    name: 'Dungeon Ghost',
    namePL: 'Duch Lochów',
    difficulty: 2,
    description: 'A translucent spirit floating through the air, glowing with pale blue light.',
    descriptionPL: 'Przezroczysty duch unoszący się w powietrzu, świecący bladoniebieskim światłem.',
    imagePrompt: 'A friendly cartoon ghost glowing pale blue, floating in a dungeon room, transparent and wispy, with a surprised expression, fantasy art style, not scary, suitable for children',
    loot: [
      { name: 'Ectoplasm', namePL: 'Ektoplazma', value: 15 },
      { name: 'Spirit Orb', namePL: 'Kula Ducha', value: 11 }
    ],
    defeatMessage: 'The ghost fades away with a gentle "wooooo"!',
    defeatMessagePL: 'Duch znika z cichym "uuuuu"!'
  },
  {
    id: 'orc',
    name: 'Orc Guard',
    namePL: 'Strażnik Ork',
    difficulty: 2,
    description: 'A muscular green-skinned warrior with tusks and a heavy axe.',
    descriptionPL: 'Muskularny wojownik o zielonej skórze z kłami i ciężkim toporem.',
    imagePrompt: 'A cartoon orc with green skin, small tusks, muscular build, wearing leather armor, holding a wooden axe, standing guard in a dungeon, fantasy art style, grumpy but not scary, suitable for children',
    loot: [
      { name: 'Orc Tusk', namePL: 'Kieł Orka', value: 10 },
      { name: 'Battle Axe Piece', namePL: 'Kawałek Topora', value: 8 },
      { name: 'Guard Badge', namePL: 'Odznaka Strażnika', value: 13 }
    ],
    defeatMessage: 'The orc grunts in respect and steps aside!',
    defeatMessagePL: 'Ork chrząka z szacunkiem i ustępuje drogi!'
  },

  // Difficulty 3 - Hard monsters (depths 15+)
  {
    id: 'troll',
    name: 'Cave Troll',
    namePL: 'Jaskiniowy Troll',
    difficulty: 3,
    description: 'A huge, lumbering creature with stone-like skin and massive fists.',
    descriptionPL: 'Ogromne, ciężko stąpające stworzenie o kamiennej skórze i potężnych pięściach.',
    imagePrompt: 'A large cartoon troll with gray rocky skin, moss growing on shoulders, big nose, holding a wooden club, standing in a cave, fantasy art style, grumpy expression, suitable for children',
    loot: [
      { name: 'Troll Stone', namePL: 'Kamień Trolla', value: 20 },
      { name: 'Giant Club Splinter', namePL: 'Drzazga z Maczugi', value: 15 },
      { name: 'Cave Crystal', namePL: 'Kryształ Jaskini', value: 25 }
    ],
    defeatMessage: 'The troll turns to stone as sunlight hits it through a crack!',
    defeatMessagePL: 'Troll zamienia się w kamień gdy promień światła go dotyka!'
  },
  {
    id: 'golem',
    name: 'Stone Golem',
    namePL: 'Kamienny Golem',
    difficulty: 3,
    description: 'A massive humanoid figure made entirely of animated stone blocks.',
    descriptionPL: 'Masywna humanoidalna postać zbudowana całkowicie z ożywionych bloków kamienia.',
    imagePrompt: 'A large cartoon stone golem made of gray stone blocks, glowing yellow eyes, cracks between stone segments, standing in an ancient dungeon chamber, fantasy art style, imposing but not scary, suitable for children',
    loot: [
      { name: 'Animated Stone', namePL: 'Ożywiony Kamień', value: 22 },
      { name: 'Magic Core', namePL: 'Magiczny Rdzeń', value: 30 },
      { name: 'Ancient Rune', namePL: 'Starożytna Runa', value: 18 }
    ],
    defeatMessage: 'The golem crumbles and its magic core glows on the floor!',
    defeatMessagePL: 'Golem rozpada się, a jego magiczny rdzeń świeci na podłodze!'
  },
  {
    id: 'dark_knight',
    name: 'Dark Knight',
    namePL: 'Mroczny Rycerz',
    difficulty: 3,
    description: 'A knight in black armor with glowing red eyes visible through the helmet.',
    descriptionPL: 'Rycerz w czarnej zbroi ze świecącymi czerwonymi oczami widocznymi przez hełm.',
    imagePrompt: 'A cartoon knight in black medieval armor with glowing red eyes behind the visor, purple cape flowing, holding a dark sword, standing in a dungeon throne room, fantasy art style, mysterious but not terrifying, suitable for children',
    loot: [
      { name: 'Dark Steel Shard', namePL: 'Odłamek Ciemnej Stali', value: 28 },
      { name: 'Shadow Cape Piece', namePL: 'Kawałek Płaszcza Cieni', value: 24 },
      { name: 'Knight\'s Honor Medal', namePL: 'Medal Honoru Rycerza', value: 35 }
    ],
    defeatMessage: 'The dark knight salutes you with respect and fades into shadows!',
    defeatMessagePL: 'Mroczny rycerz salutuje z szacunkiem i znika w cieniach!'
  },
  {
    id: 'witch',
    name: 'Dungeon Witch',
    namePL: 'Wiedźma Lochów',
    difficulty: 3,
    description: 'An old woman in purple robes, stirring a bubbling cauldron.',
    descriptionPL: 'Stara kobieta w fioletowych szatach, mieszająca bulgoczący kociołek.',
    imagePrompt: 'A cartoon witch with purple robes, pointy hat, gray hair in braids, stirring a bubbling green cauldron, black cat nearby, in a dungeon alchemy room, fantasy art style, quirky and eccentric, suitable for children',
    loot: [
      { name: 'Magic Potion', namePL: 'Magiczny Eliksir', value: 32 },
      { name: 'Spell Scroll', namePL: 'Zwój Zaklęcia', value: 26 },
      { name: 'Witch\'s Crystal Ball', namePL: 'Kryształowa Kula Wiedźmy', value: 40 }
    ],
    defeatMessage: 'The witch cackles and vanishes in a puff of purple smoke!',
    defeatMessagePL: 'Wiedźma rechocze i znika w kłębie fioletowego dymu!'
  },

  // BOSS - Dragon (special, only appears in boss room)
  {
    id: 'dragon',
    name: 'Ancient Dragon',
    namePL: 'Starożytny Smok',
    difficulty: 4, // Boss difficulty
    description: 'A magnificent dragon with golden scales, wise ancient eyes, and flames flickering from its nostrils.',
    descriptionPL: 'Wspaniały smok o złotych łuskach, mądrych starożytnych oczach i płomieniach migoczących z nozdrzy.',
    imagePrompt: 'A majestic cartoon dragon with golden and red scales, large bat-like wings, wise amber eyes, small flames coming from nostrils, sitting on a pile of treasure in a vast underground cavern, fantasy art style, impressive but not scary, suitable for children',
    loot: [
      { name: 'Dragon Scale', namePL: 'Łuska Smoka', value: 100 },
      { name: 'Dragon\'s Heart Gem', namePL: 'Klejnot Serca Smoka', value: 150 },
      { name: 'Crown of the Dragon King', namePL: 'Korona Króla Smoków', value: 200 },
      { name: 'Chest of Golden Coins', namePL: 'Skrzynia Złotych Monet', value: 250 }
    ],
    defeatMessage: 'The dragon bows its mighty head in respect to your wisdom! You are worthy!',
    defeatMessagePL: 'Smok kłania swoją potężną głowę w szacunku dla twojej mądrości! Jesteś godny!'
  }
];

/**
 * Get a random monster for a given difficulty level
 * @param {number} difficulty - 1, 2, or 3
 * @returns {Object} A monster object
 */
function getRandomMonster(difficulty) {
  const available = MONSTERS.filter(m => m.difficulty === difficulty);
  if (available.length === 0) {
    return MONSTERS.find(m => m.difficulty === 1); // Fallback to easy
  }
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get the dragon boss
 * @returns {Object} The dragon monster object
 */
function getDragonBoss() {
  return MONSTERS.find(m => m.id === 'dragon');
}

/**
 * Treasure items that can be found in treasure rooms
 * Minor valuable items with bilingual names
 */
const TREASURE_ITEMS = [
  { name: 'Golden Coin', namePL: 'Złota Moneta', value: 5 },
  { name: 'Silver Ring', namePL: 'Srebrny Pierścień', value: 8 },
  { name: 'Ruby Gem', namePL: 'Rubin', value: 12 },
  { name: 'Emerald Stone', namePL: 'Szmaragd', value: 15 },
  { name: 'Pearl Necklace', namePL: 'Naszyjnik z Pereł', value: 10 },
  { name: 'Bronze Bracelet', namePL: 'Brązowa Bransoletka', value: 6 },
  { name: 'Crystal Pendant', namePL: 'Kryształowy Wisiorek', value: 14 },
  { name: 'Ancient Amulet', namePL: 'Starożytny Amulet', value: 18 },
  { name: 'Sapphire Ring', namePL: 'Szafirowy Pierścień', value: 16 },
  { name: 'Golden Goblet', namePL: 'Złoty Kielich', value: 20 },
  { name: 'Jade Figurine', namePL: 'Nefrytowa Figurka', value: 11 },
  { name: 'Diamond Shard', namePL: 'Odłamek Diamentu', value: 25 },
  { name: 'Magic Scroll', namePL: 'Magiczny Zwój', value: 9 },
  { name: 'Enchanted Feather', namePL: 'Zaczarowane Pióro', value: 7 },
  { name: 'Mystic Orb', namePL: 'Mistyczna Kula', value: 13 },
  { name: 'Silver Spoon', namePL: 'Srebrna Łyżka', value: 4 },
  { name: 'Copper Medal', namePL: 'Miedziany Medal', value: 3 },
  { name: 'Polished Amethyst', namePL: 'Polerowany Ametyst', value: 10 },
  { name: 'Tiny Crown', namePL: 'Maleńka Korona', value: 22 },
  { name: 'Lucky Horseshoe', namePL: 'Szczęśliwa Podkowa', value: 6 }
];

/**
 * Get random treasure items for a treasure room
 * @param {number} count - Number of items to return (default 2-4)
 * @returns {Array} Array of treasure items
 */
function getRandomTreasure(count) {
  const numItems = count || (Math.floor(Math.random() * 3) + 2); // 2-4 items
  const shuffled = [...TREASURE_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numItems);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MONSTERS, getRandomMonster, getDragonBoss, TREASURE_ITEMS, getRandomTreasure };
}
