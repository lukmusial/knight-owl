/**
 * Polish Vocabulary Reverse Questions Database
 * For each vocabulary question (Polish→English), this provides the inverse (English→Polish)
 *
 * Structure:
 * - prompt: English question asking how to say a word in Polish
 * - options: Answer choices in Polish
 * - category: 'vocabulary_reverse' to distinguish from regular vocabulary
 */

const VOCABULARY_REVERSE_QUESTIONS = [
  // DIFFICULTY 1 - Easy (Animals)
  {
    id: 'vocab_rev_001',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cat" in Polish?',
    options: ['kot', 'sowa', 'tata', 'zielony'],
    correctIndex: 0,
    explanation: 'Kot = cat. Koty lubią mleko! (Cats like milk!)'
  },
  {
    id: 'vocab_rev_002',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "dog" in Polish?',
    options: ['niebieski', 'pies', 'biały', 'zielony'],
    correctIndex: 1,
    explanation: 'Pies = dog. Pies jest przyjacielem człowieka! (A dog is man\'s best friend!)'
  },
  {
    id: 'vocab_rev_003',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "owl" in Polish?',
    options: ['kwiat', 'lew', 'sowa', 'smok'],
    correctIndex: 2,
    explanation: 'Sowa = owl. Mr Owl jest mądrą sową! (Mr Owl is a wise owl!)'
  },
  {
    id: 'vocab_rev_004',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "dragon" in Polish?',
    options: ['pies', 'koń', 'łóżko', 'smok'],
    correctIndex: 3,
    explanation: 'Smok = dragon. Smoki mieszkają w jaskiniach! (Dragons live in caves!)'
  },
  {
    id: 'vocab_rev_005',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "horse" in Polish?',
    options: ['koń', 'pies', 'mama', 'zielony'],
    correctIndex: 0,
    explanation: 'Koń = horse. Rycerze jeżdżą na koniach! (Knights ride horses!)'
  },

  // DIFFICULTY 1 - Easy (Colors)
  {
    id: 'vocab_rev_006',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "red" in Polish?',
    options: ['ryba', 'czerwony', 'siostra', 'piłka'],
    correctIndex: 1,
    explanation: 'Czerwony = red. Smoki zieją czerwonym ogniem! (Dragons breathe red fire!)'
  },
  {
    id: 'vocab_rev_007',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "blue" in Polish?',
    options: ['śnieg', 'smok', 'niebieski', 'świnia'],
    correctIndex: 2,
    explanation: 'Niebieski = blue. Niebo jest niebieskie! (The sky is blue!)'
  },
  {
    id: 'vocab_rev_008',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "green" in Polish?',
    options: ['pies', 'czarny', 'siostra', 'zielony'],
    correctIndex: 3,
    explanation: 'Zielony = green. Trawa jest zielona! (Grass is green!)'
  },

  // DIFFICULTY 1 - Easy (Numbers)
  {
    id: 'vocab_rev_009',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "one" in Polish?',
    options: ['jeden', 'różowy', 'dwa', 'smok'],
    correctIndex: 0,
    explanation: 'Jeden = one. Mr Owl jest numerem jeden! (Mr Owl is number one!)'
  },
  {
    id: 'vocab_rev_010',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "three" in Polish?',
    options: ['kwiat', 'trzy', 'smok', 'czerwony'],
    correctIndex: 1,
    explanation: 'Trzy = three. Smok zadaje trzy pytania! (The dragon asks three questions!)'
  },
  {
    id: 'vocab_rev_011',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "five" in Polish?',
    options: ['piłka', 'niebieski', 'pięć', 'dom'],
    correctIndex: 2,
    explanation: 'Pięć = five. Masz pięć palców! (You have five fingers!)'
  },
  {
    id: 'vocab_rev_029',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "two" in Polish?',
    options: ['pies', 'ryba', 'babcia', 'dwa'],
    correctIndex: 3,
    explanation: 'Dwa = two. Sowa ma dwa skrzydła! (An owl has two wings!)'
  },
  {
    id: 'vocab_rev_030',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "four" in Polish?',
    options: ['cztery', 'babcia', 'kwiat', 'łóżko'],
    correctIndex: 0,
    explanation: 'Cztery = four. Pies ma cztery łapy! (A dog has four paws!)'
  },
  {
    id: 'vocab_rev_031',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "ten" in Polish?',
    options: ['siostra', 'dziesięć', 'smok', 'pies'],
    correctIndex: 1,
    explanation: 'Dziesięć = ten. Masz dziesięć palców! (You have ten fingers!)'
  },

  // DIFFICULTY 1 - Easy (More Animals)
  {
    id: 'vocab_rev_032',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "bird" in Polish?',
    options: ['pies', 'siostra', 'ptak', 'śnieg'],
    correctIndex: 2,
    explanation: 'Ptak = bird. Sowa to ptak! (An owl is a bird!)'
  },
  {
    id: 'vocab_rev_033',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "fish" in Polish?',
    options: ['biały', 'lew', 'niebieski', 'ryba'],
    correctIndex: 3,
    explanation: 'Ryba = fish. Ryby pływają w wodzie! (Fish swim in water!)'
  },
  {
    id: 'vocab_rev_034',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "mouse" in Polish?',
    options: ['mysz', 'różowy', 'sowa', 'smok'],
    correctIndex: 0,
    explanation: 'Mysz = mouse. Koty łapią myszy! (Cats catch mice!)'
  },
  {
    id: 'vocab_rev_035',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cow" in Polish?',
    options: ['niedźwiedź', 'krowa', 'różowy', 'drzewo'],
    correctIndex: 1,
    explanation: 'Krowa = cow. Krowa daje mleko! (A cow gives milk!)'
  },
  {
    id: 'vocab_rev_036',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "pig" in Polish?',
    options: ['sowa', 'ptak', 'świnia', 'lew'],
    correctIndex: 2,
    explanation: 'Świnia = pig. Świnie lubią błoto! (Pigs like mud!)'
  },
  {
    id: 'vocab_rev_037',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "bear" in Polish?',
    options: ['biały', 'tata', 'smok', 'niedźwiedź'],
    correctIndex: 3,
    explanation: 'Niedźwiedź = bear. Niedźwiedzie są duże! (Bears are big!)'
  },
  {
    id: 'vocab_rev_038',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "lion" in Polish?',
    options: ['lew', 'pies', 'drzewo', 'czerwony'],
    correctIndex: 0,
    explanation: 'Lew = lion. Lew jest królem zwierząt! (The lion is the king of animals!)'
  },

  // DIFFICULTY 1 - Easy (More Colors)
  {
    id: 'vocab_rev_039',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "yellow" in Polish?',
    options: ['cztery', 'żółty', 'krowa', 'książka'],
    correctIndex: 1,
    explanation: 'Żółty = yellow. Słońce jest żółte! (The sun is yellow!)'
  },
  {
    id: 'vocab_rev_040',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "white" in Polish?',
    options: ['niebieski', 'dom', 'biały', 'pięć'],
    correctIndex: 2,
    explanation: 'Biały = white. Śnieg jest biały! (Snow is white!)'
  },
  {
    id: 'vocab_rev_041',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "black" in Polish?',
    options: ['pies', 'trzy', 'ptak', 'czarny'],
    correctIndex: 3,
    explanation: 'Czarny = black. Noc jest czarna! (Night is black!)'
  },
  {
    id: 'vocab_rev_042',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "orange" in Polish?',
    options: ['pomarańczowy', 'pies', 'żółty', 'jeden'],
    correctIndex: 0,
    explanation: 'Pomarańczowy = orange. Marchewka jest pomarańczowa! (A carrot is orange!)'
  },
  {
    id: 'vocab_rev_043',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "pink" in Polish?',
    options: ['żółty', 'różowy', 'księżyc', 'tata'],
    correctIndex: 1,
    explanation: 'Różowy = pink. Flamingi są różowe! (Flamingos are pink!)'
  },

  // DIFFICULTY 1 - Easy (Family)
  {
    id: 'vocab_rev_044',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "mom" in Polish?',
    options: ['czerwony', 'księżyc', 'mama', 'różowy'],
    correctIndex: 2,
    explanation: 'Mama = mom. Mama jest kochana! (Mom is loved!)'
  },
  {
    id: 'vocab_rev_045',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "dad" in Polish?',
    options: ['pies', 'łóżko', 'żółty', 'tata'],
    correctIndex: 3,
    explanation: 'Tata = dad. Tata jest silny! (Dad is strong!)'
  },
  {
    id: 'vocab_rev_046',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "brother" in Polish?',
    options: ['brat', 'książka', 'lew', 'smok'],
    correctIndex: 0,
    explanation: 'Brat = brother. Mój brat lubi grać! (My brother likes to play!)'
  },
  {
    id: 'vocab_rev_047',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "sister" in Polish?',
    options: ['lew', 'siostra', 'czerwony', 'dwa'],
    correctIndex: 1,
    explanation: 'Siostra = sister. Siostra jest miła! (Sister is nice!)'
  },
  {
    id: 'vocab_rev_048',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "grandma" in Polish?',
    options: ['mama', 'niebieski', 'babcia', 'piłka'],
    correctIndex: 2,
    explanation: 'Babcia = grandma. Babcia robi pyszne ciastka! (Grandma makes delicious cookies!)'
  },
  {
    id: 'vocab_rev_049',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "grandpa" in Polish?',
    options: ['niedźwiedź', 'ptak', 'krowa', 'dziadek'],
    correctIndex: 3,
    explanation: 'Dziadek = grandpa. Dziadek opowiada historie! (Grandpa tells stories!)'
  },

  // DIFFICULTY 1 - Easy (Nature & Weather)
  {
    id: 'vocab_rev_050',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "sun" in Polish?',
    options: ['słońce', 'różowy', 'stół', 'czerwony'],
    correctIndex: 0,
    explanation: 'Słońce = sun. Słońce świeci jasno! (The sun shines bright!)'
  },
  {
    id: 'vocab_rev_051',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "moon" in Polish?',
    options: ['czarny', 'księżyc', 'dwa', 'smok'],
    correctIndex: 1,
    explanation: 'Księżyc = moon. Księżyc świeci w nocy! (The moon shines at night!)'
  },
  {
    id: 'vocab_rev_052',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "tree" in Polish?',
    options: ['pies', 'żółty', 'drzewo', 'siostra'],
    correctIndex: 2,
    explanation: 'Drzewo = tree. Sowy mieszkają na drzewach! (Owls live in trees!)'
  },
  {
    id: 'vocab_rev_053',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "flower" in Polish?',
    options: ['niebieski', 'mama', 'smok', 'kwiat'],
    correctIndex: 3,
    explanation: 'Kwiat = flower. Kwiaty są piękne! (Flowers are beautiful!)'
  },
  {
    id: 'vocab_rev_054',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "rain" in Polish?',
    options: ['deszcz', 'piłka', 'dwa', 'smok'],
    correctIndex: 0,
    explanation: 'Deszcz = rain. Deszcz pada z chmur! (Rain falls from clouds!)'
  },
  {
    id: 'vocab_rev_055',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "snow" in Polish?',
    options: ['deszcz', 'śnieg', 'niebieski', 'pies'],
    correctIndex: 1,
    explanation: 'Śnieg = snow. Śnieg jest zimny i biały! (Snow is cold and white!)'
  },

  // DIFFICULTY 1 - Easy (Simple Objects)
  {
    id: 'vocab_rev_056',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "house" in Polish?',
    options: ['pies', 'żółty', 'dom', 'dwa'],
    correctIndex: 2,
    explanation: 'Dom = house. Dom jest ciepły! (A house is warm!)'
  },
  {
    id: 'vocab_rev_057',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "ball" in Polish?',
    options: ['dwa', 'żółty', 'różowy', 'piłka'],
    correctIndex: 3,
    explanation: 'Piłka = ball. Lubię grać w piłkę! (I like to play ball!)'
  },
  {
    id: 'vocab_rev_058',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "book" in Polish?',
    options: ['książka', 'kwiat', 'smok', 'brat'],
    correctIndex: 0,
    explanation: 'Książka = book. Czytam książkę! (I am reading a book!)'
  },
  {
    id: 'vocab_rev_059',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "car" in Polish?',
    options: ['pies', 'samochód', 'babcia', 'słońce'],
    correctIndex: 1,
    explanation: 'Samochód = car. Samochód jedzie szybko! (A car goes fast!)'
  },
  {
    id: 'vocab_rev_060',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "bed" in Polish?',
    options: ['brat', 'dwa', 'łóżko', 'drzewo'],
    correctIndex: 2,
    explanation: 'Łóżko = bed. Śpię w łóżku! (I sleep in bed!)'
  },
  {
    id: 'vocab_rev_061',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "table" in Polish?',
    options: ['drzewo', 'babcia', 'niedźwiedź', 'stół'],
    correctIndex: 3,
    explanation: 'Stół = table. Jemy przy stole! (We eat at the table!)'
  },

  // DIFFICULTY 2 - Medium (Body parts)
  {
    id: 'vocab_rev_012',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "head" in Polish?',
    options: ['głowa', 'nos', 'ulica', 'miasto'],
    correctIndex: 0,
    explanation: 'Głowa = head. Sowa ma mądrą głowę! (An owl has a wise head!)'
  },
  {
    id: 'vocab_rev_013',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "hand/arm" in Polish?',
    options: ['ząb', 'ręka', 'miecz', 'mięso'],
    correctIndex: 1,
    explanation: 'Ręka = hand/arm. Rycerz trzyma miecz w ręce! (A knight holds a sword in his hand!)'
  },
  {
    id: 'vocab_rev_014',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "leg" in Polish?',
    options: ['ręka', 'palec', 'noga', 'oko'],
    correctIndex: 2,
    explanation: 'Noga = leg. Sowy mają dwie nogi! (Owls have two legs!)'
  },

  // DIFFICULTY 2 - Medium (Food)
  {
    id: 'vocab_rev_015',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "bread" in Polish?',
    options: ['ucho', 'woda', 'sól', 'chleb'],
    correctIndex: 3,
    explanation: 'Chleb = bread. Rycerze jedzą chleb na śniadanie! (Knights eat bread for breakfast!)'
  },
  {
    id: 'vocab_rev_016',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "water" in Polish?',
    options: ['woda', 'sklep', 'palec', 'tarcza'],
    correctIndex: 0,
    explanation: 'Woda = water. Woda jest bardzo ważna! (Water is very important!)'
  },
  {
    id: 'vocab_rev_017',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "apple" in Polish?',
    options: ['noga', 'jabłko', 'chleb', 'jajko'],
    correctIndex: 1,
    explanation: 'Jabłko = apple. Jabłka są zdrowe! (Apples are healthy!)'
  },

  // DIFFICULTY 2 - Medium (Objects)
  {
    id: 'vocab_rev_018',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "sword" in Polish?',
    options: ['ręka', 'jajko', 'miecz', 'ulica'],
    correctIndex: 2,
    explanation: 'Miecz = sword. Mr Owl ma magiczny miecz! (Mr Owl has a magical sword!)'
  },
  {
    id: 'vocab_rev_019',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "shield" in Polish?',
    options: ['ząb', 'ucho', 'chleb', 'tarcza'],
    correctIndex: 3,
    explanation: 'Tarcza = shield. Tarcza chroni rycerza! (A shield protects the knight!)'
  },
  {
    id: 'vocab_rev_020',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "key" in Polish?',
    options: ['klucz', 'szkoła', 'cukier', 'ucho'],
    correctIndex: 0,
    explanation: 'Klucz = key. Klucz otwiera drzwi! (A key opens doors!)'
  },

  // DIFFICULTY 2 - Medium (More Body Parts)
  {
    id: 'vocab_rev_062',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "eye" in Polish?',
    options: ['noga', 'oko', 'ucho', 'ręka'],
    correctIndex: 1,
    explanation: 'Oko = eye. Sowa ma duże oczy! (An owl has big eyes!)'
  },
  {
    id: 'vocab_rev_063',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "ear" in Polish?',
    options: ['rzeka', 'mleko', 'ucho', 'ulica'],
    correctIndex: 2,
    explanation: 'Ucho = ear. Sowa ma czułe uszy! (An owl has sensitive ears!)'
  },
  {
    id: 'vocab_rev_064',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "nose" in Polish?',
    options: ['miecz', 'chleb', 'cukier', 'nos'],
    correctIndex: 3,
    explanation: 'Nos = nose. Pies ma mokry nos! (A dog has a wet nose!)'
  },
  {
    id: 'vocab_rev_065',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "tooth" in Polish?',
    options: ['ząb', 'ręka', 'szkoła', 'mleko'],
    correctIndex: 0,
    explanation: 'Ząb = tooth. Smok ma ostre zęby! (A dragon has sharp teeth!)'
  },
  {
    id: 'vocab_rev_066',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "heart" in Polish?',
    options: ['jabłko', 'serce', 'szkoła', 'palec'],
    correctIndex: 1,
    explanation: 'Serce = heart. Mr Owl ma odważne serce! (Mr Owl has a brave heart!)'
  },
  {
    id: 'vocab_rev_067',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "finger" in Polish?',
    options: ['szkoła', 'miasto', 'palec', 'jajko'],
    correctIndex: 2,
    explanation: 'Palec = finger. Mamy dziesięć palców! (We have ten fingers!)'
  },

  // DIFFICULTY 2 - Medium (More Food)
  {
    id: 'vocab_rev_068',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "milk" in Polish?',
    options: ['miasto', 'noga', 'szkoła', 'mleko'],
    correctIndex: 3,
    explanation: 'Mleko = milk. Koty lubią mleko! (Cats like milk!)'
  },
  {
    id: 'vocab_rev_069',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cheese" in Polish?',
    options: ['ser', 'miasto', 'rzeka', 'ulica'],
    correctIndex: 0,
    explanation: 'Ser = cheese. Myszy lubią ser! (Mice like cheese!)'
  },
  {
    id: 'vocab_rev_070',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "meat" in Polish?',
    options: ['szkoła', 'mięso', 'jajko', 'jabłko'],
    correctIndex: 1,
    explanation: 'Mięso = meat. Lwy jedzą mięso! (Lions eat meat!)'
  },
  {
    id: 'vocab_rev_071',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "egg" in Polish?',
    options: ['ręka', 'ząb', 'jajko', 'noga'],
    correctIndex: 2,
    explanation: 'Jajko = egg. Ptaki znoszą jajka! (Birds lay eggs!)'
  },
  {
    id: 'vocab_rev_072',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "sugar" in Polish?',
    options: ['miecz', 'chleb', 'ser', 'cukier'],
    correctIndex: 3,
    explanation: 'Cukier = sugar. Cukier jest słodki! (Sugar is sweet!)'
  },
  {
    id: 'vocab_rev_073',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "salt" in Polish?',
    options: ['sól', 'miecz', 'szkoła', 'chleb'],
    correctIndex: 0,
    explanation: 'Sól = salt. Sól jest w morzu! (Salt is in the sea!)'
  },

  // DIFFICULTY 2 - Medium (Places)
  {
    id: 'vocab_rev_074',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "school" in Polish?',
    options: ['ręka', 'szkoła', 'ser', 'chleb'],
    correctIndex: 1,
    explanation: 'Szkoła = school. Dzieci chodzą do szkoły! (Children go to school!)'
  },
  {
    id: 'vocab_rev_075',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "shop/store" in Polish?',
    options: ['rzeka', 'oko', 'sklep', 'chleb'],
    correctIndex: 2,
    explanation: 'Sklep = shop/store. Kupuję chleb w sklepie! (I buy bread at the store!)'
  },
  {
    id: 'vocab_rev_076',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "street" in Polish?',
    options: ['jabłko', 'mięso', 'nos', 'ulica'],
    correctIndex: 3,
    explanation: 'Ulica = street. Samochody jeżdżą po ulicy! (Cars drive on the street!)'
  },
  {
    id: 'vocab_rev_077',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "city" in Polish?',
    options: ['miasto', 'jajko', 'rzeka', 'ręka'],
    correctIndex: 0,
    explanation: 'Miasto = city. Warszawa to duże miasto! (Warsaw is a big city!)'
  },
  {
    id: 'vocab_rev_078',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "forest" in Polish?',
    options: ['serce', 'las', 'chleb', 'ucho'],
    correctIndex: 1,
    explanation: 'Las = forest. Sowy mieszkają w lesie! (Owls live in the forest!)'
  },
  {
    id: 'vocab_rev_079',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "river" in Polish?',
    options: ['oko', 'jabłko', 'rzeka', 'szkoła'],
    correctIndex: 2,
    explanation: 'Rzeka = river. Wisła to polska rzeka! (Vistula is a Polish river!)'
  },

  // DIFFICULTY 3 - Hard (Advanced vocabulary)
  {
    id: 'vocab_rev_021',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "courage" in Polish?',
    options: ['skarb', 'ciemność', 'potwór', 'odwaga'],
    correctIndex: 3,
    explanation: 'Odwaga = courage. Mr Owl ma wielką odwagę! (Mr Owl has great courage!)'
  },
  {
    id: 'vocab_rev_022',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "victory" in Polish?',
    options: ['zwycięstwo', 'skarb', 'niebezpieczny', 'zwyciężyć'],
    correctIndex: 0,
    explanation: 'Zwycięstwo = victory. Zwycięstwo jest blisko! (Victory is near!)'
  },
  {
    id: 'vocab_rev_023',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "treasure" in Polish?',
    options: ['potwór', 'skarb', 'niebezpieczny', 'bohater'],
    correctIndex: 1,
    explanation: 'Skarb = treasure. Smok strzeże skarbu! (The dragon guards the treasure!)'
  },
  {
    id: 'vocab_rev_024',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "adventure" in Polish?',
    options: ['zwycięstwo', 'zamek', 'przygoda', 'bohater'],
    correctIndex: 2,
    explanation: 'Przygoda = adventure. To jest wielka przygoda! (This is a great adventure!)'
  },
  {
    id: 'vocab_rev_025',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "dangerous" in Polish?',
    options: ['tajemnica', 'ciemność', 'przygoda', 'niebezpieczny'],
    correctIndex: 3,
    explanation: 'Niebezpieczny = dangerous. Lochy są niebezpieczne! (Dungeons are dangerous!)'
  },
  {
    id: 'vocab_rev_026',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "magical" in Polish?',
    options: ['magiczny', 'zwycięstwo', 'ciemność', 'potwór'],
    correctIndex: 0,
    explanation: 'Magiczny = magical. Mr Owl ma magiczną moc! (Mr Owl has magical power!)'
  },
  {
    id: 'vocab_rev_027',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "monster" in Polish?',
    options: ['zamek', 'potwór', 'przygoda', 'ratować'],
    correctIndex: 1,
    explanation: 'Potwór = monster. Mr Owl walczy z potworami! (Mr Owl fights monsters!)'
  },
  {
    id: 'vocab_rev_028',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "castle" in Polish?',
    options: ['zwycięstwo', 'ciemność', 'zamek', 'magiczny'],
    correctIndex: 2,
    explanation: 'Zamek = castle. Smok mieszka pod zamkiem! (The dragon lives under the castle!)'
  },
  {
    id: 'vocab_rev_080',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to fight" in Polish?',
    options: ['ratować', 'przygoda', 'tajemnica', 'walczyć'],
    correctIndex: 3,
    explanation: 'Walczyć = to fight. Mr Owl walczy z potworami! (Mr Owl fights monsters!)'
  },
  {
    id: 'vocab_rev_081',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to win/defeat" in Polish?',
    options: ['zwyciężyć', 'światło', 'złoto', 'skarb'],
    correctIndex: 0,
    explanation: 'Zwyciężyć = to win/defeat. Musisz zwyciężyć smoka! (You must defeat the dragon!)'
  },
  {
    id: 'vocab_rev_082',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "darkness" in Polish?',
    options: ['światło', 'ciemność', 'walczyć', 'ratować'],
    correctIndex: 1,
    explanation: 'Ciemność = darkness. W lochu jest ciemność! (There is darkness in the dungeon!)'
  },
  {
    id: 'vocab_rev_083',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "light" in Polish?',
    options: ['tajemnica', 'przygoda', 'światło', 'złoto'],
    correctIndex: 2,
    explanation: 'Światło = light. Światło pokonuje ciemność! (Light defeats darkness!)'
  },
  {
    id: 'vocab_rev_084',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "hero" in Polish?',
    options: ['zwycięstwo', 'przygoda', 'zwyciężyć', 'bohater'],
    correctIndex: 3,
    explanation: 'Bohater = hero. Mr Owl jest prawdziwym bohaterem! (Mr Owl is a true hero!)'
  },
  {
    id: 'vocab_rev_085',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "gold" in Polish?',
    options: ['złoto', 'magiczny', 'tajemnica', 'przygoda'],
    correctIndex: 0,
    explanation: 'Złoto = gold. Smok kocha złoto! (The dragon loves gold!)'
  },
  {
    id: 'vocab_rev_086',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "secret/mystery" in Polish?',
    options: ['magiczny', 'tajemnica', 'potwór', 'złoto'],
    correctIndex: 1,
    explanation: 'Tajemnica = secret/mystery. Loch kryje wiele tajemnic! (The dungeon hides many secrets!)'
  },
  {
    id: 'vocab_rev_087',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to save/rescue" in Polish?',
    options: ['zwycięstwo', 'potwór', 'ratować', 'złoto'],
    correctIndex: 2,
    explanation: 'Ratować = to save/rescue. Mr Owl ratuje królestwo! (Mr Owl saves the kingdom!)'
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VOCABULARY_REVERSE_QUESTIONS };
}
