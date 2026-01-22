/**
 * Polish Vocabulary Questions Database
 * Extensible: Add new questions to the VOCABULARY_QUESTIONS array
 *
 * Structure:
 * - prompt: English question asking about the Polish word
 * - options: Answer choices in English
 * - explanation: Shows the Polish word with translation and example sentence
 */

const VOCABULARY_QUESTIONS = [
  // DIFFICULTY 1 - Easy (Animals)
  {
    id: 'vocab_001',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kot" mean?',
    options: ['dog', 'cat', 'bird', 'fish'],
    correctIndex: 1,
    explanation: 'Kot = cat. Koty lubią mleko! (Cats like milk!)'
  },
  {
    id: 'vocab_002',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pies" mean?',
    options: ['cat', 'horse', 'dog', 'rabbit'],
    correctIndex: 2,
    explanation: 'Pies = dog. Pies jest przyjacielem człowieka! (A dog is man\'s best friend!)'
  },
  {
    id: 'vocab_003',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sowa" mean?',
    options: ['eagle', 'owl', 'sparrow', 'crow'],
    correctIndex: 1,
    explanation: 'Sowa = owl. Mr Owl jest mądrą sową! (Mr Owl is a wise owl!)'
  },
  {
    id: 'vocab_004',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "smok" mean?',
    options: ['snake', 'dinosaur', 'dragon', 'lizard'],
    correctIndex: 2,
    explanation: 'Smok = dragon. Smoki mieszkają w jaskiniach! (Dragons live in caves!)'
  },
  {
    id: 'vocab_005',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "koń" mean?',
    options: ['horse', 'donkey', 'cow', 'goat'],
    correctIndex: 0,
    explanation: 'Koń = horse. Rycerze jeżdżą na koniach! (Knights ride horses!)'
  },

  // DIFFICULTY 1 - Easy (Colors)
  {
    id: 'vocab_006',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "czerwony" in English?',
    options: ['blue', 'green', 'red', 'yellow'],
    correctIndex: 2,
    explanation: 'Czerwony = red. Smoki zieją czerwonym ogniem! (Dragons breathe red fire!)'
  },
  {
    id: 'vocab_007',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "niebieski" in English?',
    options: ['blue', 'purple', 'pink', 'orange'],
    correctIndex: 0,
    explanation: 'Niebieski = blue. Niebo jest niebieskie! (The sky is blue!)'
  },
  {
    id: 'vocab_008',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "zielony" in English?',
    options: ['brown', 'green', 'gray', 'white'],
    correctIndex: 1,
    explanation: 'Zielony = green. Trawa jest zielona! (Grass is green!)'
  },

  // DIFFICULTY 1 - Easy (Numbers)
  {
    id: 'vocab_009',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "jeden" in English?',
    options: ['one', 'two', 'three', 'zero'],
    correctIndex: 0,
    explanation: 'Jeden = one. Mr Owl jest numerem jeden! (Mr Owl is number one!)'
  },
  {
    id: 'vocab_010',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "trzy" in English?',
    options: ['two', 'four', 'three', 'five'],
    correctIndex: 2,
    explanation: 'Trzy = three. Smok zadaje trzy pytania! (The dragon asks three questions!)'
  },
  {
    id: 'vocab_011',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "pięć" in English?',
    options: ['four', 'six', 'three', 'five'],
    correctIndex: 3,
    explanation: 'Pięć = five. Masz pięć palców! (You have five fingers!)'
  },
  {
    id: 'vocab_029',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "dwa" in English?',
    options: ['one', 'two', 'three', 'four'],
    correctIndex: 1,
    explanation: 'Dwa = two. Sowa ma dwa skrzydła! (An owl has two wings!)'
  },
  {
    id: 'vocab_030',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "cztery" in English?',
    options: ['three', 'five', 'four', 'six'],
    correctIndex: 2,
    explanation: 'Cztery = four. Pies ma cztery łapy! (A dog has four paws!)'
  },
  {
    id: 'vocab_031',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "dziesięć" in English?',
    options: ['eight', 'nine', 'eleven', 'ten'],
    correctIndex: 3,
    explanation: 'Dziesięć = ten. Masz dziesięć palców! (You have ten fingers!)'
  },

  // DIFFICULTY 1 - Easy (More Animals)
  {
    id: 'vocab_032',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ptak" mean?',
    options: ['fish', 'bird', 'bug', 'frog'],
    correctIndex: 1,
    explanation: 'Ptak = bird. Sowa to ptak! (An owl is a bird!)'
  },
  {
    id: 'vocab_033',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ryba" mean?',
    options: ['fish', 'crab', 'whale', 'shark'],
    correctIndex: 0,
    explanation: 'Ryba = fish. Ryby pływają w wodzie! (Fish swim in water!)'
  },
  {
    id: 'vocab_034',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mysz" mean?',
    options: ['rat', 'hamster', 'mouse', 'rabbit'],
    correctIndex: 2,
    explanation: 'Mysz = mouse. Koty łapią myszy! (Cats catch mice!)'
  },
  {
    id: 'vocab_035',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "krowa" mean?',
    options: ['sheep', 'goat', 'pig', 'cow'],
    correctIndex: 3,
    explanation: 'Krowa = cow. Krowa daje mleko! (A cow gives milk!)'
  },
  {
    id: 'vocab_036',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "świnia" mean?',
    options: ['pig', 'horse', 'sheep', 'donkey'],
    correctIndex: 0,
    explanation: 'Świnia = pig. Świnie lubią błoto! (Pigs like mud!)'
  },
  {
    id: 'vocab_037',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "niedźwiedź" mean?',
    options: ['wolf', 'fox', 'bear', 'deer'],
    correctIndex: 2,
    explanation: 'Niedźwiedź = bear. Niedźwiedzie są duże! (Bears are big!)'
  },
  {
    id: 'vocab_038',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lew" mean?',
    options: ['tiger', 'lion', 'leopard', 'cheetah'],
    correctIndex: 1,
    explanation: 'Lew = lion. Lew jest królem zwierząt! (The lion is the king of animals!)'
  },

  // DIFFICULTY 1 - Easy (More Colors)
  {
    id: 'vocab_039',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "żółty" in English?',
    options: ['orange', 'yellow', 'gold', 'brown'],
    correctIndex: 1,
    explanation: 'Żółty = yellow. Słońce jest żółte! (The sun is yellow!)'
  },
  {
    id: 'vocab_040',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "biały" in English?',
    options: ['gray', 'black', 'white', 'silver'],
    correctIndex: 2,
    explanation: 'Biały = white. Śnieg jest biały! (Snow is white!)'
  },
  {
    id: 'vocab_041',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "czarny" in English?',
    options: ['black', 'brown', 'gray', 'dark'],
    correctIndex: 0,
    explanation: 'Czarny = black. Noc jest czarna! (Night is black!)'
  },
  {
    id: 'vocab_042',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "pomarańczowy" in English?',
    options: ['red', 'yellow', 'pink', 'orange'],
    correctIndex: 3,
    explanation: 'Pomarańczowy = orange. Marchewka jest pomarańczowa! (A carrot is orange!)'
  },
  {
    id: 'vocab_043',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "różowy" in English?',
    options: ['purple', 'pink', 'red', 'peach'],
    correctIndex: 1,
    explanation: 'Różowy = pink. Flamingi są różowe! (Flamingos are pink!)'
  },

  // DIFFICULTY 1 - Easy (Family)
  {
    id: 'vocab_044',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mama" mean?',
    options: ['dad', 'mom', 'sister', 'grandma'],
    correctIndex: 1,
    explanation: 'Mama = mom. Mama jest kochana! (Mom is loved!)'
  },
  {
    id: 'vocab_045',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tata" mean?',
    options: ['uncle', 'grandpa', 'dad', 'brother'],
    correctIndex: 2,
    explanation: 'Tata = dad. Tata jest silny! (Dad is strong!)'
  },
  {
    id: 'vocab_046',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "brat" mean?',
    options: ['sister', 'brother', 'cousin', 'friend'],
    correctIndex: 1,
    explanation: 'Brat = brother. Mój brat lubi grać! (My brother likes to play!)'
  },
  {
    id: 'vocab_047',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "siostra" mean?',
    options: ['brother', 'mother', 'aunt', 'sister'],
    correctIndex: 3,
    explanation: 'Siostra = sister. Siostra jest miła! (Sister is nice!)'
  },
  {
    id: 'vocab_048',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "babcia" mean?',
    options: ['grandpa', 'aunt', 'grandma', 'mom'],
    correctIndex: 2,
    explanation: 'Babcia = grandma. Babcia robi pyszne ciastka! (Grandma makes delicious cookies!)'
  },
  {
    id: 'vocab_049',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dziadek" mean?',
    options: ['grandpa', 'uncle', 'dad', 'brother'],
    correctIndex: 0,
    explanation: 'Dziadek = grandpa. Dziadek opowiada historie! (Grandpa tells stories!)'
  },

  // DIFFICULTY 1 - Easy (Nature & Weather)
  {
    id: 'vocab_050',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "słońce" mean?',
    options: ['moon', 'star', 'sun', 'cloud'],
    correctIndex: 2,
    explanation: 'Słońce = sun. Słońce świeci jasno! (The sun shines bright!)'
  },
  {
    id: 'vocab_051',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "księżyc" mean?',
    options: ['star', 'sun', 'planet', 'moon'],
    correctIndex: 3,
    explanation: 'Księżyc = moon. Księżyc świeci w nocy! (The moon shines at night!)'
  },
  {
    id: 'vocab_052',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "drzewo" mean?',
    options: ['flower', 'tree', 'bush', 'grass'],
    correctIndex: 1,
    explanation: 'Drzewo = tree. Sowy mieszkają na drzewach! (Owls live in trees!)'
  },
  {
    id: 'vocab_053',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kwiat" mean?',
    options: ['leaf', 'grass', 'flower', 'tree'],
    correctIndex: 2,
    explanation: 'Kwiat = flower. Kwiaty są piękne! (Flowers are beautiful!)'
  },
  {
    id: 'vocab_054',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "deszcz" mean?',
    options: ['snow', 'rain', 'wind', 'fog'],
    correctIndex: 1,
    explanation: 'Deszcz = rain. Deszcz pada z chmur! (Rain falls from clouds!)'
  },
  {
    id: 'vocab_055',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "śnieg" mean?',
    options: ['rain', 'ice', 'snow', 'frost'],
    correctIndex: 2,
    explanation: 'Śnieg = snow. Śnieg jest zimny i biały! (Snow is cold and white!)'
  },

  // DIFFICULTY 1 - Easy (Simple Objects)
  {
    id: 'vocab_056',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dom" mean?',
    options: ['room', 'house', 'door', 'roof'],
    correctIndex: 1,
    explanation: 'Dom = house. Dom jest ciepły! (A house is warm!)'
  },
  {
    id: 'vocab_057',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "piłka" mean?',
    options: ['toy', 'doll', 'ball', 'game'],
    correctIndex: 2,
    explanation: 'Piłka = ball. Lubię grać w piłkę! (I like to play ball!)'
  },
  {
    id: 'vocab_058',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "książka" mean?',
    options: ['paper', 'pen', 'book', 'letter'],
    correctIndex: 2,
    explanation: 'Książka = book. Czytam książkę! (I am reading a book!)'
  },
  {
    id: 'vocab_059',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "samochód" mean?',
    options: ['bike', 'car', 'bus', 'train'],
    correctIndex: 1,
    explanation: 'Samochód = car. Samochód jedzie szybko! (A car goes fast!)'
  },
  {
    id: 'vocab_060',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "łóżko" mean?',
    options: ['chair', 'table', 'bed', 'sofa'],
    correctIndex: 2,
    explanation: 'Łóżko = bed. Śpię w łóżku! (I sleep in bed!)'
  },
  {
    id: 'vocab_061',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "stół" mean?',
    options: ['table', 'chair', 'desk', 'bench'],
    correctIndex: 0,
    explanation: 'Stół = table. Jemy przy stole! (We eat at the table!)'
  },

  // DIFFICULTY 2 - Medium (Body parts)
  {
    id: 'vocab_012',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "głowa" mean?',
    options: ['hand', 'head', 'foot', 'arm'],
    correctIndex: 1,
    explanation: 'Głowa = head. Sowa ma mądrą głowę! (An owl has a wise head!)'
  },
  {
    id: 'vocab_013',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ręka" mean?',
    options: ['leg', 'hand/arm', 'finger', 'shoulder'],
    correctIndex: 1,
    explanation: 'Ręka = hand/arm. Rycerz trzyma miecz w ręce! (A knight holds a sword in his hand!)'
  },
  {
    id: 'vocab_014',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "noga" mean?',
    options: ['leg', 'arm', 'toe', 'knee'],
    correctIndex: 0,
    explanation: 'Noga = leg. Sowy mają dwie nogi! (Owls have two legs!)'
  },

  // DIFFICULTY 2 - Medium (Food)
  {
    id: 'vocab_015',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "chleb" mean?',
    options: ['bread', 'cheese', 'meat', 'butter'],
    correctIndex: 0,
    explanation: 'Chleb = bread. Rycerze jedzą chleb na śniadanie! (Knights eat bread for breakfast!)'
  },
  {
    id: 'vocab_016',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "woda" mean?',
    options: ['milk', 'juice', 'water', 'tea'],
    correctIndex: 2,
    explanation: 'Woda = water. Woda jest bardzo ważna! (Water is very important!)'
  },
  {
    id: 'vocab_017',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jabłko" mean?',
    options: ['orange', 'banana', 'apple', 'grape'],
    correctIndex: 2,
    explanation: 'Jabłko = apple. Jabłka są zdrowe! (Apples are healthy!)'
  },

  // DIFFICULTY 2 - Medium (Objects)
  {
    id: 'vocab_018',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "miecz" mean?',
    options: ['shield', 'sword', 'bow', 'spear'],
    correctIndex: 1,
    explanation: 'Miecz = sword. Mr Owl ma magiczny miecz! (Mr Owl has a magical sword!)'
  },
  {
    id: 'vocab_019',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tarcza" mean?',
    options: ['helmet', 'armor', 'shield', 'gauntlet'],
    correctIndex: 2,
    explanation: 'Tarcza = shield. Tarcza chroni rycerza! (A shield protects the knight!)'
  },
  {
    id: 'vocab_020',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "klucz" mean?',
    options: ['lock', 'key', 'door', 'handle'],
    correctIndex: 1,
    explanation: 'Klucz = key. Klucz otwiera drzwi! (A key opens doors!)'
  },

  // DIFFICULTY 2 - Medium (More Body Parts)
  {
    id: 'vocab_062',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "oko" mean?',
    options: ['ear', 'eye', 'nose', 'mouth'],
    correctIndex: 1,
    explanation: 'Oko = eye. Sowa ma duże oczy! (An owl has big eyes!)'
  },
  {
    id: 'vocab_063',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ucho" mean?',
    options: ['eye', 'nose', 'ear', 'mouth'],
    correctIndex: 2,
    explanation: 'Ucho = ear. Sowa ma czułe uszy! (An owl has sensitive ears!)'
  },
  {
    id: 'vocab_064',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nos" mean?',
    options: ['nose', 'mouth', 'chin', 'cheek'],
    correctIndex: 0,
    explanation: 'Nos = nose. Pies ma mokry nos! (A dog has a wet nose!)'
  },
  {
    id: 'vocab_065',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ząb" mean?',
    options: ['tongue', 'lip', 'tooth', 'jaw'],
    correctIndex: 2,
    explanation: 'Ząb = tooth. Smok ma ostre zęby! (A dragon has sharp teeth!)'
  },
  {
    id: 'vocab_066',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "serce" mean?',
    options: ['brain', 'heart', 'lung', 'stomach'],
    correctIndex: 1,
    explanation: 'Serce = heart. Mr Owl ma odważne serce! (Mr Owl has a brave heart!)'
  },
  {
    id: 'vocab_067',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "palec" mean?',
    options: ['hand', 'finger', 'thumb', 'nail'],
    correctIndex: 1,
    explanation: 'Palec = finger. Mamy dziesięć palców! (We have ten fingers!)'
  },

  // DIFFICULTY 2 - Medium (More Food)
  {
    id: 'vocab_068',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mleko" mean?',
    options: ['water', 'juice', 'milk', 'cream'],
    correctIndex: 2,
    explanation: 'Mleko = milk. Koty lubią mleko! (Cats like milk!)'
  },
  {
    id: 'vocab_069',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ser" mean?',
    options: ['bread', 'cheese', 'butter', 'egg'],
    correctIndex: 1,
    explanation: 'Ser = cheese. Myszy lubią ser! (Mice like cheese!)'
  },
  {
    id: 'vocab_070',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mięso" mean?',
    options: ['fish', 'chicken', 'meat', 'vegetable'],
    correctIndex: 2,
    explanation: 'Mięso = meat. Lwy jedzą mięso! (Lions eat meat!)'
  },
  {
    id: 'vocab_071',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jajko" mean?',
    options: ['egg', 'potato', 'tomato', 'carrot'],
    correctIndex: 0,
    explanation: 'Jajko = egg. Ptaki znoszą jajka! (Birds lay eggs!)'
  },
  {
    id: 'vocab_072',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "cukier" mean?',
    options: ['salt', 'pepper', 'sugar', 'flour'],
    correctIndex: 2,
    explanation: 'Cukier = sugar. Cukier jest słodki! (Sugar is sweet!)'
  },
  {
    id: 'vocab_073',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sól" mean?',
    options: ['sugar', 'salt', 'spice', 'sauce'],
    correctIndex: 1,
    explanation: 'Sól = salt. Sól jest w morzu! (Salt is in the sea!)'
  },

  // DIFFICULTY 2 - Medium (Places)
  {
    id: 'vocab_074',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "szkoła" mean?',
    options: ['hospital', 'school', 'church', 'library'],
    correctIndex: 1,
    explanation: 'Szkoła = school. Dzieci chodzą do szkoły! (Children go to school!)'
  },
  {
    id: 'vocab_075',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sklep" mean?',
    options: ['shop/store', 'bank', 'office', 'station'],
    correctIndex: 0,
    explanation: 'Sklep = shop/store. Kupuję chleb w sklepie! (I buy bread at the store!)'
  },
  {
    id: 'vocab_076',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ulica" mean?',
    options: ['road', 'street', 'path', 'bridge'],
    correctIndex: 1,
    explanation: 'Ulica = street. Samochody jeżdżą po ulicy! (Cars drive on the street!)'
  },
  {
    id: 'vocab_077',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "miasto" mean?',
    options: ['village', 'town', 'city', 'country'],
    correctIndex: 2,
    explanation: 'Miasto = city. Warszawa to duże miasto! (Warsaw is a big city!)'
  },
  {
    id: 'vocab_078',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "las" mean?',
    options: ['field', 'forest', 'garden', 'mountain'],
    correctIndex: 1,
    explanation: 'Las = forest. Sowy mieszkają w lesie! (Owls live in the forest!)'
  },
  {
    id: 'vocab_079',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rzeka" mean?',
    options: ['lake', 'sea', 'river', 'ocean'],
    correctIndex: 2,
    explanation: 'Rzeka = river. Wisła to polska rzeka! (Vistula is a Polish river!)'
  },

  // DIFFICULTY 3 - Hard (Advanced vocabulary)
  {
    id: 'vocab_021',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "odwaga" mean?',
    options: ['fear', 'courage', 'wisdom', 'strength'],
    correctIndex: 1,
    explanation: 'Odwaga = courage. Mr Owl ma wielką odwagę! (Mr Owl has great courage!)'
  },
  {
    id: 'vocab_022',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zwycięstwo" mean?',
    options: ['defeat', 'battle', 'victory', 'fight'],
    correctIndex: 2,
    explanation: 'Zwycięstwo = victory. Zwycięstwo jest blisko! (Victory is near!)'
  },
  {
    id: 'vocab_023',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "skarb" mean?',
    options: ['treasure', 'gold', 'jewel', 'coin'],
    correctIndex: 0,
    explanation: 'Skarb = treasure. Smok strzeże skarbu! (The dragon guards the treasure!)'
  },
  {
    id: 'vocab_024',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "przygoda" mean?',
    options: ['story', 'dream', 'adventure', 'travel'],
    correctIndex: 2,
    explanation: 'Przygoda = adventure. To jest wielka przygoda! (This is a great adventure!)'
  },
  {
    id: 'vocab_025',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "niebezpieczny" mean?',
    options: ['safe', 'boring', 'dangerous', 'easy'],
    correctIndex: 2,
    explanation: 'Niebezpieczny = dangerous. Lochy są niebezpieczne! (Dungeons are dangerous!)'
  },
  {
    id: 'vocab_026',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "magiczny" mean?',
    options: ['normal', 'magical', 'ordinary', 'simple'],
    correctIndex: 1,
    explanation: 'Magiczny = magical. Mr Owl ma magiczną moc! (Mr Owl has magical power!)'
  },
  {
    id: 'vocab_027',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "potwór" mean?',
    options: ['hero', 'friend', 'monster', 'knight'],
    correctIndex: 2,
    explanation: 'Potwór = monster. Mr Owl walczy z potworami! (Mr Owl fights monsters!)'
  },
  {
    id: 'vocab_028',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zamek" mean?',
    options: ['tower', 'house', 'castle', 'palace'],
    correctIndex: 2,
    explanation: 'Zamek = castle. Smok mieszka pod zamkiem! (The dragon lives under the castle!)'
  },
  {
    id: 'vocab_080',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "walczyć" mean?',
    options: ['to run', 'to fight', 'to hide', 'to sleep'],
    correctIndex: 1,
    explanation: 'Walczyć = to fight. Mr Owl walczy z potworami! (Mr Owl fights monsters!)'
  },
  {
    id: 'vocab_081',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zwyciężyć" mean?',
    options: ['to lose', 'to win/defeat', 'to start', 'to end'],
    correctIndex: 1,
    explanation: 'Zwyciężyć = to win/defeat. Musisz zwyciężyć smoka! (You must defeat the dragon!)'
  },
  {
    id: 'vocab_082',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ciemność" mean?',
    options: ['light', 'darkness', 'shadow', 'night'],
    correctIndex: 1,
    explanation: 'Ciemność = darkness. W lochu jest ciemność! (There is darkness in the dungeon!)'
  },
  {
    id: 'vocab_083',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "światło" mean?',
    options: ['darkness', 'fire', 'light', 'sun'],
    correctIndex: 2,
    explanation: 'Światło = light. Światło pokonuje ciemność! (Light defeats darkness!)'
  },
  {
    id: 'vocab_084',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "bohater" mean?',
    options: ['villain', 'hero', 'friend', 'stranger'],
    correctIndex: 1,
    explanation: 'Bohater = hero. Mr Owl jest prawdziwym bohaterem! (Mr Owl is a true hero!)'
  },
  {
    id: 'vocab_085',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "złoto" mean?',
    options: ['silver', 'bronze', 'gold', 'copper'],
    correctIndex: 2,
    explanation: 'Złoto = gold. Smok kocha złoto! (The dragon loves gold!)'
  },
  {
    id: 'vocab_086',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tajemnica" mean?',
    options: ['secret/mystery', 'story', 'legend', 'truth'],
    correctIndex: 0,
    explanation: 'Tajemnica = secret/mystery. Loch kryje wiele tajemnic! (The dungeon hides many secrets!)'
  },
  {
    id: 'vocab_087',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ratować" mean?',
    options: ['to destroy', 'to save/rescue', 'to find', 'to lose'],
    correctIndex: 1,
    explanation: 'Ratować = to save/rescue. Mr Owl ratuje królestwo! (Mr Owl saves the kingdom!)'
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VOCABULARY_QUESTIONS };
}
