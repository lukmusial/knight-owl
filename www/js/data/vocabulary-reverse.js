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
  },

  // ========== NEW DIFFICULTY 1 QUESTIONS ==========

  // DIFFICULTY 1 - Easy (Even More Animals)
  {
    id: 'vocab_rev_088',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "frog" in Polish?',
    options: ['żaba', 'żółw', 'królik', 'motyl'],
    correctIndex: 0,
    explanation: 'Żaba = frog. Żaby skaczą wysoko! (Frogs jump high!)'
  },
  {
    id: 'vocab_rev_089',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "butterfly" in Polish?',
    options: ['lis', 'motyl', 'kura', 'wilk'],
    correctIndex: 1,
    explanation: 'Motyl = butterfly. Motyle mają kolorowe skrzydła! (Butterflies have colorful wings!)'
  },
  {
    id: 'vocab_rev_090',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "rabbit" in Polish?',
    options: ['kaczka', 'żaba', 'królik', 'wilk'],
    correctIndex: 2,
    explanation: 'Królik = rabbit. Króliki lubią marchewki! (Rabbits like carrots!)'
  },
  {
    id: 'vocab_rev_091',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "wolf" in Polish?',
    options: ['lis', 'kura', 'żółw', 'wilk'],
    correctIndex: 3,
    explanation: 'Wilk = wolf. Wilki żyją w lesie! (Wolves live in the forest!)'
  },
  {
    id: 'vocab_rev_092',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "fox" in Polish?',
    options: ['lis', 'motyl', 'żaba', 'kaczka'],
    correctIndex: 0,
    explanation: 'Lis = fox. Lis jest sprytny! (A fox is clever!)'
  },
  {
    id: 'vocab_rev_093',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "duck" in Polish?',
    options: ['żółw', 'kaczka', 'królik', 'wilk'],
    correctIndex: 1,
    explanation: 'Kaczka = duck. Kaczki pływają w jeziorze! (Ducks swim in the lake!)'
  },
  {
    id: 'vocab_rev_094',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "hen" in Polish?',
    options: ['lis', 'motyl', 'kura', 'żaba'],
    correctIndex: 2,
    explanation: 'Kura = hen. Kury znoszą jajka! (Hens lay eggs!)'
  },
  {
    id: 'vocab_rev_095',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "turtle" in Polish?',
    options: ['kaczka', 'wilk', 'królik', 'żółw'],
    correctIndex: 3,
    explanation: 'Żółw = turtle. Żółw chodzi bardzo wolno! (A turtle walks very slowly!)'
  },

  // DIFFICULTY 1 - Easy (Even More Colors)
  {
    id: 'vocab_rev_096',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "purple" in Polish?',
    options: ['fioletowy', 'brązowy', 'szary', 'żółty'],
    correctIndex: 0,
    explanation: 'Fioletowy = purple. Fioletowy to piękny kolor! (Purple is a beautiful color!)'
  },
  {
    id: 'vocab_rev_097',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "brown" in Polish?',
    options: ['szary', 'fioletowy', 'brązowy', 'biały'],
    correctIndex: 2,
    explanation: 'Brązowy = brown. Niedźwiedzie są brązowe! (Bears are brown!)'
  },
  {
    id: 'vocab_rev_098',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "gray" in Polish?',
    options: ['brązowy', 'szary', 'czarny', 'fioletowy'],
    correctIndex: 1,
    explanation: 'Szary = gray. Myszy są szare! (Mice are gray!)'
  },

  // DIFFICULTY 1 - Easy (Even More Numbers)
  {
    id: 'vocab_rev_099',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "six" in Polish?',
    options: ['siedem', 'sześć', 'osiem', 'dziewięć'],
    correctIndex: 1,
    explanation: 'Sześć = six. Owady mają sześć nóg! (Insects have six legs!)'
  },
  {
    id: 'vocab_rev_100',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "seven" in Polish?',
    options: ['osiem', 'dziewięć', 'siedem', 'sześć'],
    correctIndex: 2,
    explanation: 'Siedem = seven. Tydzień ma siedem dni! (A week has seven days!)'
  },
  {
    id: 'vocab_rev_101',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "eight" in Polish?',
    options: ['sześć', 'siedem', 'dziewięć', 'osiem'],
    correctIndex: 3,
    explanation: 'Osiem = eight. Pająk ma osiem nóg! (A spider has eight legs!)'
  },
  {
    id: 'vocab_rev_102',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "nine" in Polish?',
    options: ['dziewięć', 'osiem', 'sześć', 'siedem'],
    correctIndex: 0,
    explanation: 'Dziewięć = nine. Kot ma dziewięć żyć! (A cat has nine lives!)'
  },

  // DIFFICULTY 1 - Easy (More Family)
  {
    id: 'vocab_rev_103',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "uncle" in Polish?',
    options: ['kuzyn', 'ciocia', 'wujek', 'dziadek'],
    correctIndex: 2,
    explanation: 'Wujek = uncle. Wujek jest bratem mamy! (Uncle is mom\'s brother!)'
  },
  {
    id: 'vocab_rev_104',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "aunt" in Polish?',
    options: ['ciocia', 'babcia', 'mama', 'siostra'],
    correctIndex: 0,
    explanation: 'Ciocia = aunt. Ciocia zawsze przynosi prezenty! (Auntie always brings gifts!)'
  },
  {
    id: 'vocab_rev_105',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cousin" in Polish?',
    options: ['brat', 'kuzyn', 'wujek', 'tata'],
    correctIndex: 1,
    explanation: 'Kuzyn = cousin. Mój kuzyn lubi grać w piłkę! (My cousin likes to play ball!)'
  },

  // DIFFICULTY 1 - Easy (Clothing)
  {
    id: 'vocab_rev_106',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "shoes" in Polish?',
    options: ['skarpetki', 'czapka', 'buty', 'spodnie'],
    correctIndex: 2,
    explanation: 'Buty = shoes. Zakładam buty przed wyjściem! (I put on shoes before going out!)'
  },
  {
    id: 'vocab_rev_107',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "hat/cap" in Polish?',
    options: ['czapka', 'szalik', 'koszula', 'sukienka'],
    correctIndex: 0,
    explanation: 'Czapka = hat/cap. Zimą noszę czapkę! (I wear a hat in winter!)'
  },
  {
    id: 'vocab_rev_108',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "shirt" in Polish?',
    options: ['spodnie', 'koszula', 'sukienka', 'czapka'],
    correctIndex: 1,
    explanation: 'Koszula = shirt. Tata nosi białą koszulę! (Dad wears a white shirt!)'
  },
  {
    id: 'vocab_rev_109',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "pants" in Polish?',
    options: ['buty', 'koszula', 'skarpetki', 'spodnie'],
    correctIndex: 3,
    explanation: 'Spodnie = pants. Moje spodnie są niebieskie! (My pants are blue!)'
  },
  {
    id: 'vocab_rev_110',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "socks" in Polish?',
    options: ['skarpetki', 'buty', 'spodnie', 'czapka'],
    correctIndex: 0,
    explanation: 'Skarpetki = socks. Mam kolorowe skarpetki! (I have colorful socks!)'
  },
  {
    id: 'vocab_rev_111',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "dress" in Polish?',
    options: ['koszula', 'sukienka', 'spodnie', 'czapka'],
    correctIndex: 1,
    explanation: 'Sukienka = dress. Mama ma piękną sukienkę! (Mom has a beautiful dress!)'
  },

  // DIFFICULTY 1 - Easy (More Nature)
  {
    id: 'vocab_rev_112',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "mountain" in Polish?',
    options: ['morze', 'chmura', 'góra', 'gwiazda'],
    correctIndex: 2,
    explanation: 'Góra = mountain. Góry są bardzo wysokie! (Mountains are very high!)'
  },
  {
    id: 'vocab_rev_113',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "sea" in Polish?',
    options: ['góra', 'chmura', 'gwiazda', 'morze'],
    correctIndex: 3,
    explanation: 'Morze = sea. Morze jest niebieskie! (The sea is blue!)'
  },
  {
    id: 'vocab_rev_114',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "star" in Polish?',
    options: ['gwiazda', 'chmura', 'morze', 'góra'],
    correctIndex: 0,
    explanation: 'Gwiazda = star. Gwiazdy świecą w nocy! (Stars shine at night!)'
  },
  {
    id: 'vocab_rev_115',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cloud" in Polish?',
    options: ['góra', 'chmura', 'gwiazda', 'morze'],
    correctIndex: 1,
    explanation: 'Chmura = cloud. Chmury są białe i puszyste! (Clouds are white and fluffy!)'
  },

  // DIFFICULTY 1 - Easy (More Objects)
  {
    id: 'vocab_rev_116',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "door" in Polish?',
    options: ['okno', 'krzesło', 'drzwi', 'zegar'],
    correctIndex: 2,
    explanation: 'Drzwi = door. Otwórz drzwi! (Open the door!)'
  },
  {
    id: 'vocab_rev_117',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "window" in Polish?',
    options: ['ołówek', 'zabawka', 'zegar', 'okno'],
    correctIndex: 3,
    explanation: 'Okno = window. Patrzę przez okno! (I look through the window!)'
  },
  {
    id: 'vocab_rev_118',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "chair" in Polish?',
    options: ['krzesło', 'drzwi', 'okno', 'ołówek'],
    correctIndex: 0,
    explanation: 'Krzesło = chair. Siadam na krześle! (I sit on a chair!)'
  },
  {
    id: 'vocab_rev_119',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "pencil" in Polish?',
    options: ['zegar', 'ołówek', 'drzwi', 'zabawka'],
    correctIndex: 1,
    explanation: 'Ołówek = pencil. Piszę ołówkiem! (I write with a pencil!)'
  },
  {
    id: 'vocab_rev_120',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "toy" in Polish?',
    options: ['krzesło', 'okno', 'zabawka', 'ołówek'],
    correctIndex: 2,
    explanation: 'Zabawka = toy. Dzieci lubią zabawki! (Children like toys!)'
  },
  {
    id: 'vocab_rev_121',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "clock" in Polish?',
    options: ['drzwi', 'ołówek', 'krzesło', 'zegar'],
    correctIndex: 3,
    explanation: 'Zegar = clock. Zegar pokazuje godzinę! (A clock shows the time!)'
  },

  // DIFFICULTY 1 - Easy (Basic Food)
  {
    id: 'vocab_rev_122',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "ice cream" in Polish?',
    options: ['lody', 'ciastko', 'banan', 'pomidor'],
    correctIndex: 0,
    explanation: 'Lody = ice cream. Lody są zimne i smaczne! (Ice cream is cold and tasty!)'
  },
  {
    id: 'vocab_rev_123',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cookie" in Polish?',
    options: ['marchewka', 'ciastko', 'lody', 'banan'],
    correctIndex: 1,
    explanation: 'Ciastko = cookie. Babcia piecze pyszne ciastka! (Grandma bakes delicious cookies!)'
  },
  {
    id: 'vocab_rev_124',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "banana" in Polish?',
    options: ['pomidor', 'marchewka', 'banan', 'ciastko'],
    correctIndex: 2,
    explanation: 'Banan = banana. Małpy lubią banany! (Monkeys like bananas!)'
  },
  {
    id: 'vocab_rev_125',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "carrot" in Polish?',
    options: ['banan', 'lody', 'pomidor', 'marchewka'],
    correctIndex: 3,
    explanation: 'Marchewka = carrot. Króliki jedzą marchewki! (Rabbits eat carrots!)'
  },
  {
    id: 'vocab_rev_126',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "tomato" in Polish?',
    options: ['pomidor', 'marchewka', 'ciastko', 'banan'],
    correctIndex: 0,
    explanation: 'Pomidor = tomato. Pomidory są czerwone! (Tomatoes are red!)'
  },

  // DIFFICULTY 1 - Easy (Basic Words)
  {
    id: 'vocab_rev_127',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "yes" in Polish?',
    options: ['nie', 'tak', 'proszę', 'cześć'],
    correctIndex: 1,
    explanation: 'Tak = yes. Tak, lubię lody! (Yes, I like ice cream!)'
  },
  {
    id: 'vocab_rev_128',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "no" in Polish?',
    options: ['tak', 'cześć', 'nie', 'proszę'],
    correctIndex: 2,
    explanation: 'Nie = no. Nie, dziękuję! (No, thank you!)'
  },
  {
    id: 'vocab_rev_129',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "thank you" in Polish?',
    options: ['cześć', 'proszę', 'tak', 'dziękuję'],
    correctIndex: 3,
    explanation: 'Dziękuję = thank you. Dziękuję bardzo! (Thank you very much!)'
  },
  {
    id: 'vocab_rev_130',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "please" in Polish?',
    options: ['proszę', 'dziękuję', 'cześć', 'tak'],
    correctIndex: 0,
    explanation: 'Proszę = please. Proszę, podaj mi książkę! (Please, pass me the book!)'
  },
  {
    id: 'vocab_rev_131',
    difficulty: 1,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "hello/hi" in Polish?',
    options: ['dziękuję', 'cześć', 'tak', 'nie'],
    correctIndex: 1,
    explanation: 'Cześć = hello/hi. Cześć, jak się masz? (Hi, how are you?)'
  },

  // ========== NEW DIFFICULTY 2 QUESTIONS ==========

  // DIFFICULTY 2 - Medium (More Food)
  {
    id: 'vocab_rev_132',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "tea" in Polish?',
    options: ['sok', 'masło', 'herbata', 'ryż'],
    correctIndex: 2,
    explanation: 'Herbata = tea. Babcia pije herbatę z cytryną! (Grandma drinks tea with lemon!)'
  },
  {
    id: 'vocab_rev_133',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "juice" in Polish?',
    options: ['herbata', 'masło', 'ryż', 'sok'],
    correctIndex: 3,
    explanation: 'Sok = juice. Sok pomarańczowy jest smaczny! (Orange juice is tasty!)'
  },
  {
    id: 'vocab_rev_134',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "rice" in Polish?',
    options: ['ryż', 'herbata', 'masło', 'sok'],
    correctIndex: 0,
    explanation: 'Ryż = rice. Jem ryż z kurczakiem! (I eat rice with chicken!)'
  },
  {
    id: 'vocab_rev_135',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "butter" in Polish?',
    options: ['sok', 'masło', 'ryż', 'herbata'],
    correctIndex: 1,
    explanation: 'Masło = butter. Smaruję chleb masłem! (I spread butter on bread!)'
  },

  // DIFFICULTY 2 - Medium (Clothing)
  {
    id: 'vocab_rev_136',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "jacket" in Polish?',
    options: ['szalik', 'kapelusz', 'kurtka', 'rękawiczki'],
    correctIndex: 2,
    explanation: 'Kurtka = jacket. Zakładam kurtkę, bo jest zimno! (I put on a jacket because it\'s cold!)'
  },
  {
    id: 'vocab_rev_137',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "gloves" in Polish?',
    options: ['kurtka', 'szalik', 'kapelusz', 'rękawiczki'],
    correctIndex: 3,
    explanation: 'Rękawiczki = gloves. Zimą noszę ciepłe rękawiczki! (In winter I wear warm gloves!)'
  },
  {
    id: 'vocab_rev_138',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "scarf" in Polish?',
    options: ['szalik', 'kurtka', 'rękawiczki', 'kapelusz'],
    correctIndex: 0,
    explanation: 'Szalik = scarf. Szalik grzeje szyję! (A scarf warms the neck!)'
  },
  {
    id: 'vocab_rev_139',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "hat" in Polish?',
    options: ['rękawiczki', 'kapelusz', 'szalik', 'kurtka'],
    correctIndex: 1,
    explanation: 'Kapelusz = hat. Czarodziej nosi kapelusz! (A wizard wears a hat!)'
  },

  // DIFFICULTY 2 - Medium (Home)
  {
    id: 'vocab_rev_140',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "mirror" in Polish?',
    options: ['dywan', 'schody', 'lustro', 'lampa'],
    correctIndex: 2,
    explanation: 'Lustro = mirror. Widzę siebie w lustrze! (I see myself in the mirror!)'
  },
  {
    id: 'vocab_rev_141',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "carpet/rug" in Polish?',
    options: ['lampa', 'lustro', 'schody', 'dywan'],
    correctIndex: 3,
    explanation: 'Dywan = carpet/rug. Dywan jest miękki! (The carpet is soft!)'
  },
  {
    id: 'vocab_rev_142',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "lamp" in Polish?',
    options: ['lampa', 'dywan', 'lustro', 'schody'],
    correctIndex: 0,
    explanation: 'Lampa = lamp. Lampa oświetla pokój! (A lamp lights up the room!)'
  },
  {
    id: 'vocab_rev_143',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "stairs" in Polish?',
    options: ['lustro', 'schody', 'dywan', 'lampa'],
    correctIndex: 1,
    explanation: 'Schody = stairs. Wchodzę po schodach! (I go up the stairs!)'
  },

  // DIFFICULTY 2 - Medium (Professions)
  {
    id: 'vocab_rev_144',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "doctor" in Polish?',
    options: ['strażak', 'policjant', 'lekarz', 'nauczyciel'],
    correctIndex: 2,
    explanation: 'Lekarz = doctor. Lekarz pomaga chorym! (A doctor helps the sick!)'
  },
  {
    id: 'vocab_rev_145',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "teacher" in Polish?',
    options: ['lekarz', 'policjant', 'strażak', 'nauczyciel'],
    correctIndex: 3,
    explanation: 'Nauczyciel = teacher. Nauczyciel uczy w szkole! (A teacher teaches at school!)'
  },
  {
    id: 'vocab_rev_146',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "firefighter" in Polish?',
    options: ['strażak', 'policjant', 'lekarz', 'nauczyciel'],
    correctIndex: 0,
    explanation: 'Strażak = firefighter. Strażak gasi pożary! (A firefighter puts out fires!)'
  },
  {
    id: 'vocab_rev_147',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "policeman" in Polish?',
    options: ['nauczyciel', 'policjant', 'strażak', 'lekarz'],
    correctIndex: 1,
    explanation: 'Policjant = policeman. Policjant pilnuje porządku! (A policeman keeps order!)'
  },

  // DIFFICULTY 2 - Medium (Weather)
  {
    id: 'vocab_rev_148',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "wind" in Polish?',
    options: ['burza', 'tęcza', 'wiatr', 'deszcz'],
    correctIndex: 2,
    explanation: 'Wiatr = wind. Wiatr wieje mocno! (The wind blows strongly!)'
  },
  {
    id: 'vocab_rev_149',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "storm" in Polish?',
    options: ['wiatr', 'tęcza', 'deszcz', 'burza'],
    correctIndex: 3,
    explanation: 'Burza = storm. Podczas burzy pada deszcz! (During a storm it rains!)'
  },
  {
    id: 'vocab_rev_150',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "rainbow" in Polish?',
    options: ['tęcza', 'burza', 'wiatr', 'śnieg'],
    correctIndex: 0,
    explanation: 'Tęcza = rainbow. Tęcza ma siedem kolorów! (A rainbow has seven colors!)'
  },

  // DIFFICULTY 2 - Medium (Transportation)
  {
    id: 'vocab_rev_151',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "bus" in Polish?',
    options: ['pociąg', 'autobus', 'rower', 'samolot'],
    correctIndex: 1,
    explanation: 'Autobus = bus. Jadę autobusem do szkoły! (I ride the bus to school!)'
  },
  {
    id: 'vocab_rev_152',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "train" in Polish?',
    options: ['samolot', 'rower', 'pociąg', 'autobus'],
    correctIndex: 2,
    explanation: 'Pociąg = train. Pociąg jedzie szybko! (The train goes fast!)'
  },
  {
    id: 'vocab_rev_153',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "bicycle" in Polish?',
    options: ['autobus', 'samolot', 'pociąg', 'rower'],
    correctIndex: 3,
    explanation: 'Rower = bicycle. Lubię jeździć na rowerze! (I like to ride a bicycle!)'
  },
  {
    id: 'vocab_rev_154',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "airplane" in Polish?',
    options: ['samolot', 'autobus', 'pociąg', 'rower'],
    correctIndex: 0,
    explanation: 'Samolot = airplane. Samolot leci wysoko! (An airplane flies high!)'
  },

  // DIFFICULTY 2 - Medium (School)
  {
    id: 'vocab_rev_155',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "homework/task" in Polish?',
    options: ['pytanie', 'zadanie', 'odpowiedź', 'nauczycielka'],
    correctIndex: 1,
    explanation: 'Zadanie = homework/task. Odrabiam zadanie domowe! (I do my homework!)'
  },
  {
    id: 'vocab_rev_156',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "question" in Polish?',
    options: ['odpowiedź', 'nauczycielka', 'pytanie', 'zadanie'],
    correctIndex: 2,
    explanation: 'Pytanie = question. Mam pytanie do nauczyciela! (I have a question for the teacher!)'
  },
  {
    id: 'vocab_rev_157',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "answer" in Polish?',
    options: ['zadanie', 'pytanie', 'nauczycielka', 'odpowiedź'],
    correctIndex: 3,
    explanation: 'Odpowiedź = answer. Znam prawidłową odpowiedź! (I know the correct answer!)'
  },
  {
    id: 'vocab_rev_158',
    difficulty: 2,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "female teacher" in Polish?',
    options: ['nauczycielka', 'zadanie', 'odpowiedź', 'pytanie'],
    correctIndex: 0,
    explanation: 'Nauczycielka = female teacher. Nasza nauczycielka jest miła! (Our teacher is nice!)'
  },

  // ========== NEW DIFFICULTY 3 QUESTIONS ==========

  // DIFFICULTY 3 - Hard (Abstract Concepts)
  {
    id: 'vocab_rev_159',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "wisdom" in Polish?',
    options: ['siła', 'wolność', 'mądrość', 'sprawiedliwość'],
    correctIndex: 2,
    explanation: 'Mądrość = wisdom. Sowa jest symbolem mądrości! (An owl is a symbol of wisdom!)'
  },
  {
    id: 'vocab_rev_160',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "strength" in Polish?',
    options: ['mądrość', 'sprawiedliwość', 'wolność', 'siła'],
    correctIndex: 3,
    explanation: 'Siła = strength. Rycerz ma wielką siłę! (The knight has great strength!)'
  },
  {
    id: 'vocab_rev_161',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "freedom" in Polish?',
    options: ['wolność', 'mądrość', 'siła', 'sprawiedliwość'],
    correctIndex: 0,
    explanation: 'Wolność = freedom. Ptaki symbolizują wolność! (Birds symbolize freedom!)'
  },
  {
    id: 'vocab_rev_162',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "justice" in Polish?',
    options: ['siła', 'sprawiedliwość', 'wolność', 'mądrość'],
    correctIndex: 1,
    explanation: 'Sprawiedliwość = justice. Rycerz walczy o sprawiedliwość! (The knight fights for justice!)'
  },

  // DIFFICULTY 3 - Hard (Dungeon Themes)
  {
    id: 'vocab_rev_163',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "knight" in Polish?',
    options: ['królestwo', 'pułapka', 'rycerz', 'jaskinia'],
    correctIndex: 2,
    explanation: 'Rycerz = knight. Rycerz chroni królestwo! (The knight protects the kingdom!)'
  },
  {
    id: 'vocab_rev_164',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "kingdom" in Polish?',
    options: ['jaskinia', 'pułapka', 'rycerz', 'królestwo'],
    correctIndex: 3,
    explanation: 'Królestwo = kingdom. Królestwo jest w niebezpieczeństwie! (The kingdom is in danger!)'
  },
  {
    id: 'vocab_rev_165',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "cave" in Polish?',
    options: ['jaskinia', 'królestwo', 'rycerz', 'pułapka'],
    correctIndex: 0,
    explanation: 'Jaskinia = cave. Smok mieszka w jaskini! (The dragon lives in a cave!)'
  },
  {
    id: 'vocab_rev_166',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "trap" in Polish?',
    options: ['rycerz', 'pułapka', 'jaskinia', 'królestwo'],
    correctIndex: 1,
    explanation: 'Pułapka = trap. Uważaj na pułapki w lochu! (Watch out for traps in the dungeon!)'
  },

  // DIFFICULTY 3 - Hard (Advanced Verbs)
  {
    id: 'vocab_rev_167',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to discover" in Polish?',
    options: ['uciekać', 'chronić', 'odkrywać', 'pokonać'],
    correctIndex: 2,
    explanation: 'Odkrywać = to discover. Mr Owl odkrywa tajemnice lochu! (Mr Owl discovers the dungeon\'s secrets!)'
  },
  {
    id: 'vocab_rev_168',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to escape" in Polish?',
    options: ['pokonać', 'odkrywać', 'chronić', 'uciekać'],
    correctIndex: 3,
    explanation: 'Uciekać = to escape. Trzeba uciekać przed smokiem! (You must escape from the dragon!)'
  },
  {
    id: 'vocab_rev_169',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to protect" in Polish?',
    options: ['chronić', 'uciekać', 'pokonać', 'odkrywać'],
    correctIndex: 0,
    explanation: 'Chronić = to protect. Tarcza chroni rycerza! (The shield protects the knight!)'
  },
  {
    id: 'vocab_rev_170',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "to defeat" in Polish?',
    options: ['odkrywać', 'pokonać', 'uciekać', 'chronić'],
    correctIndex: 1,
    explanation: 'Pokonać = to defeat. Mr Owl musi pokonać smoka! (Mr Owl must defeat the dragon!)'
  },

  // DIFFICULTY 3 - Hard (Advanced Adjectives)
  {
    id: 'vocab_rev_171',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "invincible" in Polish?',
    options: ['potężny', 'tajemniczy', 'niezwyciężony', 'nieznany'],
    correctIndex: 2,
    explanation: 'Niezwyciężony = invincible. Niezwyciężony rycerz wygra każdą bitwę! (An invincible knight will win every battle!)'
  },
  {
    id: 'vocab_rev_172',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "powerful" in Polish?',
    options: ['nieznany', 'niezwyciężony', 'tajemniczy', 'potężny'],
    correctIndex: 3,
    explanation: 'Potężny = powerful. Smok jest potężnym stworzeniem! (A dragon is a powerful creature!)'
  },
  {
    id: 'vocab_rev_173',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "mysterious" in Polish?',
    options: ['tajemniczy', 'potężny', 'nieznany', 'niezwyciężony'],
    correctIndex: 0,
    explanation: 'Tajemniczy = mysterious. Loch jest tajemniczy! (The dungeon is mysterious!)'
  },
  {
    id: 'vocab_rev_174',
    difficulty: 3,
    category: 'vocabulary_reverse',
    prompt: 'How do you say "unknown" in Polish?',
    options: ['niezwyciężony', 'nieznany', 'potężny', 'tajemniczy'],
    correctIndex: 1,
    explanation: 'Nieznany = unknown. Przed nami nieznane niebezpieczeństwa! (Unknown dangers lie ahead!)'
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VOCABULARY_REVERSE_QUESTIONS };
}
