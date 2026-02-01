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
  {
    id: 'zombie',
    name: 'Zombie',
    namePL: 'Zombie',
    difficulty: 1,
    description: 'A shambling undead creature with tattered clothes and outstretched arms.',
    descriptionPL: 'Powłócząca nogami nieumarła istota w podartych ubraniach z wyciągniętymi ramionami.',
    imagePrompt: 'A cartoon zombie with green-gray skin, tattered clothes, messy hair, arms stretched forward, shuffling through a dungeon corridor, fantasy art style, silly rather than scary, suitable for children',
    loot: [
      { name: 'Rotten Cloth', namePL: 'Zgniły Materiał', value: 2 },
      { name: 'Zombie Tooth', namePL: 'Ząb Zombie', value: 4 }
    ],
    defeatMessage: 'The zombie groans and falls apart into a harmless pile!',
    defeatMessagePL: 'Zombie jęczy i rozpada się na nieszkodliwą kupkę!'
  },
  {
    id: 'mimic',
    name: 'Mimic',
    namePL: 'Mimik',
    difficulty: 1,
    description: 'A treasure chest that is actually a creature with sharp teeth and a long tongue.',
    descriptionPL: 'Skrzynia ze skarbami, która jest tak naprawdę stworzeniem z ostrymi zębami i długim językiem.',
    imagePrompt: 'A cartoon treasure chest with teeth, googly eyes, and a long pink tongue sticking out, wooden chest body with gold trim, standing on small legs, in a dungeon room, fantasy art style, goofy and silly, suitable for children',
    loot: [
      { name: 'Mimic Tooth', namePL: 'Ząb Mimika', value: 5 },
      { name: 'Fool\'s Gold', namePL: 'Złoto Głupców', value: 3 }
    ],
    defeatMessage: 'The mimic spits out some real treasure and hops away!',
    defeatMessagePL: 'Mimik wypluwa prawdziwy skarb i odskakuje!'
  },
  {
    id: 'vampire_bunny',
    name: 'Vampire Bunny',
    namePL: 'Królik Wampir',
    difficulty: 1,
    description: 'An adorable white bunny with tiny fangs and a small black cape.',
    descriptionPL: 'Uroczy biały króliczek z małymi kłami i małą czarną peleryną.',
    imagePrompt: 'A cute white cartoon bunny with tiny vampire fangs, wearing a small black cape with red lining, red eyes but adorable expression, hopping in a dungeon, fantasy art style, very cute and funny, suitable for children',
    loot: [
      { name: 'Tiny Fang', namePL: 'Mały Kieł', value: 4 },
      { name: 'Fluffy Fur', namePL: 'Puchate Futro', value: 3 }
    ],
    defeatMessage: 'The vampire bunny squeaks and hops away into the shadows!',
    defeatMessagePL: 'Królik wampir piszczy i odskakuje w cienie!'
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
  {
    id: 'skeleton_king',
    name: 'Skeleton King',
    namePL: 'Szkieletowy Król',
    difficulty: 2,
    description: 'A regal skeleton wearing a tarnished crown and royal robes.',
    descriptionPL: 'Dostojny szkielet noszący zmatowiałą koronę i królewskie szaty.',
    imagePrompt: 'A cartoon skeleton king wearing a golden crown, purple royal robes with gold trim, sitting on a stone throne, holding a scepter, in a dungeon throne room, fantasy art style, regal but silly, suitable for children',
    loot: [
      { name: 'Tarnished Crown', namePL: 'Zmatowiała Korona', value: 15 },
      { name: 'Royal Bone', namePL: 'Królewska Kość', value: 10 },
      { name: 'Faded Scepter', namePL: 'Wyblakłe Berło', value: 12 }
    ],
    defeatMessage: 'The skeleton king bows gracefully and his crown rolls to your feet!',
    defeatMessagePL: 'Szkieletowy król kłania się z gracją, a jego korona toczy się do twoich stóp!'
  },
  {
    id: 'skeleton_queen',
    name: 'Skeleton Queen',
    namePL: 'Szkieletowa Królowa',
    difficulty: 2,
    description: 'An elegant skeleton in a flowing gown with a delicate tiara.',
    descriptionPL: 'Elegancki szkielet w powiewnej sukni z delikatną tiarą.',
    imagePrompt: 'A cartoon skeleton queen wearing a silver tiara, flowing blue gown with sparkles, holding a fan made of bones, in an elegant dungeon ballroom, fantasy art style, graceful and whimsical, suitable for children',
    loot: [
      { name: 'Silver Tiara', namePL: 'Srebrna Tiara', value: 14 },
      { name: 'Elegant Bone Fan', namePL: 'Elegancki Kostny Wachlarz', value: 11 },
      { name: 'Pearl Brooch', namePL: 'Perłowa Broszka', value: 13 }
    ],
    defeatMessage: 'The skeleton queen curtsies and vanishes in a sparkle of magic!',
    defeatMessagePL: 'Szkieletowa królowa dygnie i znika w blasku magii!'
  },
  {
    id: 'lost_soul',
    name: 'Lost Soul',
    namePL: 'Zagubiona Dusza',
    difficulty: 2,
    description: 'A wispy, sad-looking spirit wandering aimlessly through the dungeon.',
    descriptionPL: 'Mglista, smutno wyglądająca dusza błąkająca się bez celu po lochach.',
    imagePrompt: 'A cartoon wispy ghost with a sad but cute expression, pale blue translucent body, floating aimlessly in a dungeon corridor, small tears floating around it, fantasy art style, sympathetic and gentle, suitable for children',
    loot: [
      { name: 'Tear Crystal', namePL: 'Kryształ Łzy', value: 9 },
      { name: 'Soul Fragment', namePL: 'Fragment Duszy', value: 12 }
    ],
    defeatMessage: 'The lost soul smiles peacefully and floats away to find rest!',
    defeatMessagePL: 'Zagubiona dusza uśmiecha się spokojnie i odlatuje, by znaleźć spokój!'
  },
  {
    id: 'demilich',
    name: 'Demilich',
    namePL: 'Demilich',
    difficulty: 2,
    description: 'A floating skull surrounded by swirling magical energy.',
    descriptionPL: 'Unosząca się czaszka otoczona wirującą magiczną energią.',
    imagePrompt: 'A cartoon floating skull with glowing purple eyes, surrounded by swirling green and purple magical energy, gemstones embedded in the skull, floating in a dark dungeon chamber, fantasy art style, mystical but not scary, suitable for children',
    loot: [
      { name: 'Enchanted Skull Fragment', namePL: 'Zaczarowany Fragment Czaszki', value: 14 },
      { name: 'Magic Gem', namePL: 'Magiczny Klejnot', value: 16 }
    ],
    defeatMessage: 'The demilich\'s magic fades and it gently floats to the ground!',
    defeatMessagePL: 'Magia demilicha gaśnie i delikatnie opada na ziemię!'
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    namePL: 'Krasnolud',
    difficulty: 2,
    description: 'A stout, bearded warrior with a mining helmet and a heavy pickaxe.',
    descriptionPL: 'Niski, brodaty wojownik z górniczym hełmem i ciężkim kilofem.',
    imagePrompt: 'A cartoon dwarf with a big brown beard, mining helmet with a lamp, sturdy leather armor, holding a pickaxe, standing in a mine tunnel within the dungeon, fantasy art style, grumpy but friendly, suitable for children',
    loot: [
      { name: 'Miner\'s Helmet', namePL: 'Hełm Górnika', value: 10 },
      { name: 'Gold Nugget', namePL: 'Złoty Samorodek', value: 15 },
      { name: 'Sturdy Pickaxe', namePL: 'Solidny Kilof', value: 8 }
    ],
    defeatMessage: 'The dwarf grumbles and stomps away to find another mine!',
    defeatMessagePL: 'Krasnolud mamrocze i tupie w poszukiwaniu innej kopalni!'
  },
  {
    id: 'beholder',
    name: 'Beholder',
    namePL: 'Beholder',
    difficulty: 2,
    description: 'A floating sphere covered in eyes with a large central eye and toothy grin.',
    descriptionPL: 'Unosząca się kula pokryta oczami z dużym centralnym okiem i zębatym uśmiechem.',
    imagePrompt: 'A cartoon floating sphere creature with many small eyes on stalks, one big central eye, a wide toothy grin, purple and green colors, floating in a dungeon vault, fantasy art style, goofy and silly rather than scary, suitable for children',
    loot: [
      { name: 'Eye Stalk', namePL: 'Oczny Trzonek', value: 12 },
      { name: 'Beholder Tooth', namePL: 'Ząb Beholdera', value: 10 },
      { name: 'Vision Orb', namePL: 'Kula Wizji', value: 14 }
    ],
    defeatMessage: 'The beholder blinks all its eyes in surprise and floats away!',
    defeatMessagePL: 'Beholder mruga wszystkimi oczami ze zdziwienia i odpływa!'
  },
  {
    id: 'gog',
    name: 'Gog',
    namePL: 'Gog',
    difficulty: 2,
    description: 'A small demon with red skin, tiny horns, and flickering flames in its hands.',
    descriptionPL: 'Mały demon o czerwonej skórze, małych rogach i migoczącymi płomieniami w dłoniach.',
    imagePrompt: 'A small cartoon demon with red skin, tiny horns, bat-like wings, holding small flickering flames in its hands, mischievous smile, standing in a fiery dungeon room, fantasy art style, impish and cute, suitable for children',
    loot: [
      { name: 'Demon Horn', namePL: 'Róg Demona', value: 11 },
      { name: 'Flame Ember', namePL: 'Płomienny Żar', value: 13 }
    ],
    defeatMessage: 'The gog giggles and vanishes in a puff of smoke!',
    defeatMessagePL: 'Gog chichocze i znika w kłębie dymu!'
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
  {
    id: 'lich',
    name: 'Lich',
    namePL: 'Lisz',
    difficulty: 3,
    description: 'An ancient undead sorcerer in tattered robes, crackling with dark magic.',
    descriptionPL: 'Starożytny nieumarły czarnoksiężnik w podartych szatach, trzaskający mroczną magią.',
    imagePrompt: 'A cartoon lich skeleton in tattered purple and black robes, glowing green eyes, holding a staff with a skull on top, dark magic swirling around, in an ancient dungeon library, fantasy art style, spooky but not terrifying, suitable for children',
    loot: [
      { name: 'Lich\'s Phylactery', namePL: 'Filakterium Lisza', value: 35 },
      { name: 'Dark Magic Tome', namePL: 'Księga Czarnej Magii', value: 28 },
      { name: 'Soul Gem', namePL: 'Klejnot Duszy', value: 30 }
    ],
    defeatMessage: 'The lich\'s magic shatters and it crumbles to dust!',
    defeatMessagePL: 'Magia lisza rozpada się i zamienia go w proch!'
  },
  {
    id: 'spirit_of_the_mine',
    name: 'Spirit of the Mine',
    namePL: 'Duch Kopalni',
    difficulty: 3,
    description: 'A glowing ethereal figure of an ancient miner, lantern in hand.',
    descriptionPL: 'Świecąca eteryczna postać starożytnego górnika z latarnią w dłoni.',
    imagePrompt: 'A cartoon ghostly miner spirit glowing pale yellow, wearing old mining clothes and helmet, carrying an ethereal lantern, floating in an abandoned mine shaft, pickaxe floating beside it, fantasy art style, mysterious and gentle, suitable for children',
    loot: [
      { name: 'Ghostly Lantern', namePL: 'Widmowa Latarnia', value: 32 },
      { name: 'Ancient Mining Pick', namePL: 'Starożytny Kilof', value: 25 },
      { name: 'Miner\'s Lost Treasure', namePL: 'Zaginiony Skarb Górnika', value: 38 }
    ],
    defeatMessage: 'The spirit tips its helmet and fades away peacefully!',
    defeatMessagePL: 'Duch uchyla hełm i spokojnie znika!'
  },
  {
    id: 'vampire_lord',
    name: 'Vampire Lord',
    namePL: 'Wampirzy Lord',
    difficulty: 3,
    description: 'A pale nobleman in elegant black and red attire with piercing red eyes.',
    descriptionPL: 'Blady szlachcic w eleganckim czarno-czerwonym stroju z przeszywającymi czerwonymi oczami.',
    imagePrompt: 'A cartoon vampire lord with pale skin, slicked black hair, elegant black suit with red cape, piercing red eyes, fangs showing in a smirk, standing in a gothic dungeon hall, fantasy art style, dramatic but not scary, suitable for children',
    loot: [
      { name: 'Vampire\'s Medallion', namePL: 'Medalion Wampira', value: 34 },
      { name: 'Blood Ruby', namePL: 'Krwawy Rubin', value: 40 },
      { name: 'Elegant Cape', namePL: 'Elegancka Peleryna', value: 28 }
    ],
    defeatMessage: 'The vampire lord bows dramatically and turns into a bat, flying away!',
    defeatMessagePL: 'Wampirzy lord kłania się dramatycznie i zmienia w nietoperza, odlatując!'
  },
  {
    id: 'minotaur',
    name: 'Minotaur',
    namePL: 'Minotaur',
    difficulty: 3,
    description: 'A massive bull-headed warrior with bronze armor and a great battle axe.',
    descriptionPL: 'Masywny wojownik z głową byka w brązowej zbroi i wielkim toporem bojowym.',
    imagePrompt: 'A cartoon minotaur with a brown bull head, muscular body, wearing bronze Greek-style armor, holding a large double-headed axe, standing in a labyrinth dungeon corridor, fantasy art style, powerful but not terrifying, suitable for children',
    loot: [
      { name: 'Minotaur Horn', namePL: 'Róg Minotaura', value: 36 },
      { name: 'Bronze Armor Piece', namePL: 'Kawałek Brązowej Zbroi', value: 30 },
      { name: 'Labyrinth Map', namePL: 'Mapa Labiryntu', value: 25 }
    ],
    defeatMessage: 'The minotaur snorts with respect and thunders away into the maze!',
    defeatMessagePL: 'Minotaur parska z szacunkiem i z hukiem oddala się w labirynt!'
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
function getRandomMonster(difficulty, usedIds) {
  var all = MONSTERS.filter(function(m) { return m.difficulty === difficulty; });
  if (all.length === 0) {
    return MONSTERS.find(function(m) { return m.difficulty === 1; }); // Fallback to easy
  }
  var available = all;
  if (usedIds) {
    available = all.filter(function(m) { return !usedIds.has(m.id); });
    if (available.length === 0) {
      // All monsters of this difficulty used — reset by clearing those ids
      all.forEach(function(m) { usedIds.delete(m.id); });
      available = all;
    }
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
