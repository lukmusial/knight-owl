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
  },

  // ========== NEW DIFFICULTY 1 QUESTIONS ==========

  // DIFFICULTY 1 - Easy (Even More Animals)
  {
    id: 'vocab_088',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "żaba" mean?',
    options: ['frog', 'toad', 'lizard', 'snake'],
    correctIndex: 0,
    explanation: 'Żaba = frog. Żaby skaczą wysoko! (Frogs jump high!)'
  },
  {
    id: 'vocab_089',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "motyl" mean?',
    options: ['moth', 'bee', 'butterfly', 'dragonfly'],
    correctIndex: 2,
    explanation: 'Motyl = butterfly. Motyle mają kolorowe skrzydła! (Butterflies have colorful wings!)'
  },
  {
    id: 'vocab_090',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "królik" mean?',
    options: ['squirrel', 'rabbit', 'hamster', 'guinea pig'],
    correctIndex: 1,
    explanation: 'Królik = rabbit. Króliki lubią marchewki! (Rabbits like carrots!)'
  },
  {
    id: 'vocab_091',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wilk" mean?',
    options: ['fox', 'bear', 'wolf', 'dog'],
    correctIndex: 2,
    explanation: 'Wilk = wolf. Wilki żyją w lesie! (Wolves live in the forest!)'
  },
  {
    id: 'vocab_092',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lis" mean?',
    options: ['fox', 'wolf', 'rabbit', 'deer'],
    correctIndex: 0,
    explanation: 'Lis = fox. Lis jest sprytny! (A fox is clever!)'
  },
  {
    id: 'vocab_093',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kaczka" mean?',
    options: ['goose', 'chicken', 'swan', 'duck'],
    correctIndex: 3,
    explanation: 'Kaczka = duck. Kaczki pływają w jeziorze! (Ducks swim in the lake!)'
  },
  {
    id: 'vocab_094',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kura" mean?',
    options: ['rooster', 'hen', 'turkey', 'pigeon'],
    correctIndex: 1,
    explanation: 'Kura = hen. Kury znoszą jajka! (Hens lay eggs!)'
  },
  {
    id: 'vocab_095',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "żółw" mean?',
    options: ['snail', 'crab', 'turtle', 'frog'],
    correctIndex: 2,
    explanation: 'Żółw = turtle. Żółw chodzi bardzo wolno! (A turtle walks very slowly!)'
  },

  // DIFFICULTY 1 - Easy (Even More Colors)
  {
    id: 'vocab_096',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "fioletowy" in English?',
    options: ['purple', 'blue', 'pink', 'red'],
    correctIndex: 0,
    explanation: 'Fioletowy = purple. Fioletowy to piękny kolor! (Purple is a beautiful color!)'
  },
  {
    id: 'vocab_097',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "brązowy" in English?',
    options: ['red', 'orange', 'brown', 'black'],
    correctIndex: 2,
    explanation: 'Brązowy = brown. Niedźwiedzie są brązowe! (Bears are brown!)'
  },
  {
    id: 'vocab_098',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What color is "szary" in English?',
    options: ['white', 'gray', 'silver', 'black'],
    correctIndex: 1,
    explanation: 'Szary = gray. Myszy są szare! (Mice are gray!)'
  },

  // DIFFICULTY 1 - Easy (Even More Numbers)
  {
    id: 'vocab_099',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "sześć" in English?',
    options: ['five', 'six', 'seven', 'eight'],
    correctIndex: 1,
    explanation: 'Sześć = six. Owady mają sześć nóg! (Insects have six legs!)'
  },
  {
    id: 'vocab_100',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "siedem" in English?',
    options: ['six', 'eight', 'seven', 'nine'],
    correctIndex: 2,
    explanation: 'Siedem = seven. Tydzień ma siedem dni! (A week has seven days!)'
  },
  {
    id: 'vocab_101',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "osiem" in English?',
    options: ['seven', 'nine', 'six', 'eight'],
    correctIndex: 3,
    explanation: 'Osiem = eight. Pająk ma osiem nóg! (A spider has eight legs!)'
  },
  {
    id: 'vocab_102',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What number is "dziewięć" in English?',
    options: ['nine', 'ten', 'eight', 'seven'],
    correctIndex: 0,
    explanation: 'Dziewięć = nine. Kot ma dziewięć żyć! (A cat has nine lives!)'
  },

  // DIFFICULTY 1 - Easy (More Family)
  {
    id: 'vocab_103',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wujek" mean?',
    options: ['uncle', 'cousin', 'nephew', 'grandpa'],
    correctIndex: 0,
    explanation: 'Wujek = uncle. Wujek jest bratem mamy! (Uncle is mom\'s brother!)'
  },
  {
    id: 'vocab_104',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ciocia" mean?',
    options: ['grandma', 'cousin', 'aunt', 'sister'],
    correctIndex: 2,
    explanation: 'Ciocia = aunt. Ciocia zawsze przynosi prezenty! (Auntie always brings gifts!)'
  },
  {
    id: 'vocab_105',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kuzyn" mean?',
    options: ['brother', 'friend', 'neighbor', 'cousin'],
    correctIndex: 3,
    explanation: 'Kuzyn = cousin. Mój kuzyn lubi grać w piłkę! (My cousin likes to play ball!)'
  },

  // DIFFICULTY 1 - Easy (Clothing)
  {
    id: 'vocab_106',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "buty" mean?',
    options: ['shoes', 'boots', 'socks', 'sandals'],
    correctIndex: 0,
    explanation: 'Buty = shoes. Zakładam buty przed wyjściem! (I put on shoes before going out!)'
  },
  {
    id: 'vocab_107',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "czapka" mean?',
    options: ['scarf', 'hat/cap', 'gloves', 'coat'],
    correctIndex: 1,
    explanation: 'Czapka = hat/cap. Zimą noszę czapkę! (I wear a hat in winter!)'
  },
  {
    id: 'vocab_108',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "koszula" mean?',
    options: ['pants', 'jacket', 'shirt', 'dress'],
    correctIndex: 2,
    explanation: 'Koszula = shirt. Tata nosi białą koszulę! (Dad wears a white shirt!)'
  },
  {
    id: 'vocab_109',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "spodnie" mean?',
    options: ['shorts', 'shoes', 'skirt', 'pants'],
    correctIndex: 3,
    explanation: 'Spodnie = pants. Moje spodnie są niebieskie! (My pants are blue!)'
  },
  {
    id: 'vocab_110',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "skarpetki" mean?',
    options: ['socks', 'gloves', 'shoes', 'slippers'],
    correctIndex: 0,
    explanation: 'Skarpetki = socks. Mam kolorowe skarpetki! (I have colorful socks!)'
  },
  {
    id: 'vocab_111',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sukienka" mean?',
    options: ['skirt', 'dress', 'blouse', 'coat'],
    correctIndex: 1,
    explanation: 'Sukienka = dress. Mama ma piękną sukienkę! (Mom has a beautiful dress!)'
  },

  // DIFFICULTY 1 - Easy (More Nature)
  {
    id: 'vocab_112',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "góra" mean?',
    options: ['hill', 'valley', 'mountain', 'river'],
    correctIndex: 2,
    explanation: 'Góra = mountain. Góry są bardzo wysokie! (Mountains are very high!)'
  },
  {
    id: 'vocab_113',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "morze" mean?',
    options: ['lake', 'sea', 'river', 'ocean'],
    correctIndex: 1,
    explanation: 'Morze = sea. Morze jest niebieskie! (The sea is blue!)'
  },
  {
    id: 'vocab_114',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "gwiazda" mean?',
    options: ['moon', 'sun', 'planet', 'star'],
    correctIndex: 3,
    explanation: 'Gwiazda = star. Gwiazdy świecą w nocy! (Stars shine at night!)'
  },
  {
    id: 'vocab_115',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "chmura" mean?',
    options: ['cloud', 'sky', 'rain', 'wind'],
    correctIndex: 0,
    explanation: 'Chmura = cloud. Chmury są białe i puszyste! (Clouds are white and fluffy!)'
  },

  // DIFFICULTY 1 - Easy (More Objects)
  {
    id: 'vocab_116',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "drzwi" mean?',
    options: ['window', 'door', 'wall', 'roof'],
    correctIndex: 1,
    explanation: 'Drzwi = door. Otwórz drzwi! (Open the door!)'
  },
  {
    id: 'vocab_117',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "okno" mean?',
    options: ['door', 'roof', 'window', 'wall'],
    correctIndex: 2,
    explanation: 'Okno = window. Patrzę przez okno! (I look through the window!)'
  },
  {
    id: 'vocab_118',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "krzesło" mean?',
    options: ['table', 'bed', 'sofa', 'chair'],
    correctIndex: 3,
    explanation: 'Krzesło = chair. Siadam na krześle! (I sit on a chair!)'
  },
  {
    id: 'vocab_119',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ołówek" mean?',
    options: ['pencil', 'pen', 'crayon', 'marker'],
    correctIndex: 0,
    explanation: 'Ołówek = pencil. Piszę ołówkiem! (I write with a pencil!)'
  },
  {
    id: 'vocab_120',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zabawka" mean?',
    options: ['game', 'toy', 'doll', 'puzzle'],
    correctIndex: 1,
    explanation: 'Zabawka = toy. Dzieci lubią zabawki! (Children like toys!)'
  },
  {
    id: 'vocab_121',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zegar" mean?',
    options: ['bell', 'alarm', 'clock', 'watch'],
    correctIndex: 2,
    explanation: 'Zegar = clock. Zegar pokazuje godzinę! (A clock shows the time!)'
  },

  // DIFFICULTY 1 - Easy (Basic Food)
  {
    id: 'vocab_122',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lody" mean?',
    options: ['cake', 'candy', 'chocolate', 'ice cream'],
    correctIndex: 3,
    explanation: 'Lody = ice cream. Lody są zimne i smaczne! (Ice cream is cold and tasty!)'
  },
  {
    id: 'vocab_123',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ciastko" mean?',
    options: ['cookie', 'bread', 'pie', 'cake'],
    correctIndex: 0,
    explanation: 'Ciastko = cookie. Babcia piecze pyszne ciastka! (Grandma bakes delicious cookies!)'
  },
  {
    id: 'vocab_124',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "banan" mean?',
    options: ['orange', 'banana', 'apple', 'pear'],
    correctIndex: 1,
    explanation: 'Banan = banana. Małpy lubią banany! (Monkeys like bananas!)'
  },
  {
    id: 'vocab_125',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "marchewka" mean?',
    options: ['potato', 'onion', 'carrot', 'pepper'],
    correctIndex: 2,
    explanation: 'Marchewka = carrot. Króliki jedzą marchewki! (Rabbits eat carrots!)'
  },
  {
    id: 'vocab_126',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pomidor" mean?',
    options: ['pepper', 'cucumber', 'onion', 'tomato'],
    correctIndex: 3,
    explanation: 'Pomidor = tomato. Pomidory są czerwone! (Tomatoes are red!)'
  },

  // DIFFICULTY 1 - Easy (Basic Words)
  {
    id: 'vocab_127',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tak" mean?',
    options: ['yes', 'no', 'maybe', 'hello'],
    correctIndex: 0,
    explanation: 'Tak = yes. Tak, lubię lody! (Yes, I like ice cream!)'
  },
  {
    id: 'vocab_128',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nie" mean?',
    options: ['yes', 'no', 'please', 'sorry'],
    correctIndex: 1,
    explanation: 'Nie = no. Nie, dziękuję! (No, thank you!)'
  },
  {
    id: 'vocab_129',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dziękuję" mean?',
    options: ['sorry', 'please', 'thank you', 'goodbye'],
    correctIndex: 2,
    explanation: 'Dziękuję = thank you. Dziękuję bardzo! (Thank you very much!)'
  },
  {
    id: 'vocab_130',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "proszę" mean?',
    options: ['sorry', 'hello', 'goodbye', 'please'],
    correctIndex: 3,
    explanation: 'Proszę = please. Proszę, podaj mi książkę! (Please, pass me the book!)'
  },
  {
    id: 'vocab_131',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "cześć" mean?',
    options: ['hello/hi', 'goodbye', 'sorry', 'thanks'],
    correctIndex: 0,
    explanation: 'Cześć = hello/hi. Cześć, jak się masz? (Hi, how are you?)'
  },

  // ========== NEW DIFFICULTY 2 QUESTIONS ==========

  // DIFFICULTY 2 - Medium (More Food)
  {
    id: 'vocab_132',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "herbata" mean?',
    options: ['coffee', 'tea', 'juice', 'water'],
    correctIndex: 1,
    explanation: 'Herbata = tea. Babcia pije herbatę z cytryną! (Grandma drinks tea with lemon!)'
  },
  {
    id: 'vocab_133',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sok" mean?',
    options: ['milk', 'water', 'juice', 'tea'],
    correctIndex: 2,
    explanation: 'Sok = juice. Sok pomarańczowy jest smaczny! (Orange juice is tasty!)'
  },
  {
    id: 'vocab_134',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ryż" mean?',
    options: ['bread', 'pasta', 'rice', 'flour'],
    correctIndex: 2,
    explanation: 'Ryż = rice. Jem ryż z kurczakiem! (I eat rice with chicken!)'
  },
  {
    id: 'vocab_135',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "masło" mean?',
    options: ['cheese', 'butter', 'cream', 'oil'],
    correctIndex: 1,
    explanation: 'Masło = butter. Smaruję chleb masłem! (I spread butter on bread!)'
  },

  // DIFFICULTY 2 - Medium (Clothing)
  {
    id: 'vocab_136',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kurtka" mean?',
    options: ['shirt', 'jacket', 'sweater', 'vest'],
    correctIndex: 1,
    explanation: 'Kurtka = jacket. Zakładam kurtkę, bo jest zimno! (I put on a jacket because it\'s cold!)'
  },
  {
    id: 'vocab_137',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rękawiczki" mean?',
    options: ['socks', 'shoes', 'gloves', 'mittens'],
    correctIndex: 2,
    explanation: 'Rękawiczki = gloves. Zimą noszę ciepłe rękawiczki! (In winter I wear warm gloves!)'
  },
  {
    id: 'vocab_138',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "szalik" mean?',
    options: ['hat', 'scarf', 'belt', 'tie'],
    correctIndex: 1,
    explanation: 'Szalik = scarf. Szalik grzeje szyję! (A scarf warms the neck!)'
  },
  {
    id: 'vocab_139',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kapelusz" mean?',
    options: ['cap', 'hat', 'crown', 'helmet'],
    correctIndex: 1,
    explanation: 'Kapelusz = hat. Czarodziej nosi kapelusz! (A wizard wears a hat!)'
  },

  // DIFFICULTY 2 - Medium (Home)
  {
    id: 'vocab_140',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lustro" mean?',
    options: ['window', 'mirror', 'painting', 'photo'],
    correctIndex: 1,
    explanation: 'Lustro = mirror. Widzę siebie w lustrze! (I see myself in the mirror!)'
  },
  {
    id: 'vocab_141',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dywan" mean?',
    options: ['curtain', 'blanket', 'carpet/rug', 'pillow'],
    correctIndex: 2,
    explanation: 'Dywan = carpet/rug. Dywan jest miękki! (The carpet is soft!)'
  },
  {
    id: 'vocab_142',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lampa" mean?',
    options: ['candle', 'lamp', 'torch', 'light'],
    correctIndex: 1,
    explanation: 'Lampa = lamp. Lampa oświetla pokój! (A lamp lights up the room!)'
  },
  {
    id: 'vocab_143',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "schody" mean?',
    options: ['floor', 'stairs', 'elevator', 'ladder'],
    correctIndex: 1,
    explanation: 'Schody = stairs. Wchodzę po schodach! (I go up the stairs!)'
  },

  // DIFFICULTY 2 - Medium (Professions)
  {
    id: 'vocab_144',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lekarz" mean?',
    options: ['teacher', 'doctor', 'nurse', 'dentist'],
    correctIndex: 1,
    explanation: 'Lekarz = doctor. Lekarz pomaga chorym! (A doctor helps the sick!)'
  },
  {
    id: 'vocab_145',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nauczyciel" mean?',
    options: ['student', 'teacher', 'principal', 'professor'],
    correctIndex: 1,
    explanation: 'Nauczyciel = teacher. Nauczyciel uczy w szkole! (A teacher teaches at school!)'
  },
  {
    id: 'vocab_146',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "strażak" mean?',
    options: ['policeman', 'soldier', 'firefighter', 'guard'],
    correctIndex: 2,
    explanation: 'Strażak = firefighter. Strażak gasi pożary! (A firefighter puts out fires!)'
  },
  {
    id: 'vocab_147',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "policjant" mean?',
    options: ['policeman', 'soldier', 'guard', 'detective'],
    correctIndex: 0,
    explanation: 'Policjant = policeman. Policjant pilnuje porządku! (A policeman keeps order!)'
  },

  // DIFFICULTY 2 - Medium (Weather)
  {
    id: 'vocab_148',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wiatr" mean?',
    options: ['rain', 'wind', 'snow', 'fog'],
    correctIndex: 1,
    explanation: 'Wiatr = wind. Wiatr wieje mocno! (The wind blows strongly!)'
  },
  {
    id: 'vocab_149',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "burza" mean?',
    options: ['rain', 'cloud', 'storm', 'thunder'],
    correctIndex: 2,
    explanation: 'Burza = storm. Podczas burzy pada deszcz! (During a storm it rains!)'
  },
  {
    id: 'vocab_150',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tęcza" mean?',
    options: ['sunrise', 'sunset', 'rainbow', 'lightning'],
    correctIndex: 2,
    explanation: 'Tęcza = rainbow. Tęcza ma siedem kolorów! (A rainbow has seven colors!)'
  },

  // DIFFICULTY 2 - Medium (Transportation)
  {
    id: 'vocab_151',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "autobus" mean?',
    options: ['car', 'bus', 'truck', 'van'],
    correctIndex: 1,
    explanation: 'Autobus = bus. Jadę autobusem do szkoły! (I ride the bus to school!)'
  },
  {
    id: 'vocab_152',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pociąg" mean?',
    options: ['bus', 'plane', 'train', 'ship'],
    correctIndex: 2,
    explanation: 'Pociąg = train. Pociąg jedzie szybko! (The train goes fast!)'
  },
  {
    id: 'vocab_153',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rower" mean?',
    options: ['bicycle', 'motorcycle', 'scooter', 'skateboard'],
    correctIndex: 0,
    explanation: 'Rower = bicycle. Lubię jeździć na rowerze! (I like to ride a bicycle!)'
  },
  {
    id: 'vocab_154',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "samolot" mean?',
    options: ['helicopter', 'rocket', 'kite', 'airplane'],
    correctIndex: 3,
    explanation: 'Samolot = airplane. Samolot leci wysoko! (An airplane flies high!)'
  },

  // DIFFICULTY 2 - Medium (School)
  {
    id: 'vocab_155',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zadanie" mean?',
    options: ['homework/task', 'lesson', 'exam', 'grade'],
    correctIndex: 0,
    explanation: 'Zadanie = homework/task. Odrabiam zadanie domowe! (I do my homework!)'
  },
  {
    id: 'vocab_156',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pytanie" mean?',
    options: ['answer', 'question', 'problem', 'riddle'],
    correctIndex: 1,
    explanation: 'Pytanie = question. Mam pytanie do nauczyciela! (I have a question for the teacher!)'
  },
  {
    id: 'vocab_157',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "odpowiedź" mean?',
    options: ['question', 'problem', 'answer', 'solution'],
    correctIndex: 2,
    explanation: 'Odpowiedź = answer. Znam prawidłową odpowiedź! (I know the correct answer!)'
  },
  {
    id: 'vocab_158',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nauczycielka" mean?',
    options: ['student', 'principal', 'nurse', 'female teacher'],
    correctIndex: 3,
    explanation: 'Nauczycielka = female teacher. Nasza nauczycielka jest miła! (Our teacher is nice!)'
  },

  // ========== NEW DIFFICULTY 3 QUESTIONS ==========

  // DIFFICULTY 3 - Hard (Abstract Concepts)
  {
    id: 'vocab_159',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mądrość" mean?',
    options: ['wisdom', 'knowledge', 'intelligence', 'cleverness'],
    correctIndex: 0,
    explanation: 'Mądrość = wisdom. Sowa jest symbolem mądrości! (An owl is a symbol of wisdom!)'
  },
  {
    id: 'vocab_160',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "siła" mean?',
    options: ['speed', 'strength', 'power', 'energy'],
    correctIndex: 1,
    explanation: 'Siła = strength. Rycerz ma wielką siłę! (The knight has great strength!)'
  },
  {
    id: 'vocab_161',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wolność" mean?',
    options: ['peace', 'justice', 'freedom', 'hope'],
    correctIndex: 2,
    explanation: 'Wolność = freedom. Ptaki symbolizują wolność! (Birds symbolize freedom!)'
  },
  {
    id: 'vocab_162',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sprawiedliwość" mean?',
    options: ['truth', 'honor', 'loyalty', 'justice'],
    correctIndex: 3,
    explanation: 'Sprawiedliwość = justice. Rycerz walczy o sprawiedliwość! (The knight fights for justice!)'
  },

  // DIFFICULTY 3 - Hard (Dungeon Themes)
  {
    id: 'vocab_163',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rycerz" mean?',
    options: ['knight', 'king', 'prince', 'warrior'],
    correctIndex: 0,
    explanation: 'Rycerz = knight. Rycerz chroni królestwo! (The knight protects the kingdom!)'
  },
  {
    id: 'vocab_164',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "królestwo" mean?',
    options: ['castle', 'kingdom', 'palace', 'throne'],
    correctIndex: 1,
    explanation: 'Królestwo = kingdom. Królestwo jest w niebezpieczeństwie! (The kingdom is in danger!)'
  },
  {
    id: 'vocab_165',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jaskinia" mean?',
    options: ['tunnel', 'dungeon', 'cave', 'mine'],
    correctIndex: 2,
    explanation: 'Jaskinia = cave. Smok mieszka w jaskini! (The dragon lives in a cave!)'
  },
  {
    id: 'vocab_166',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pułapka" mean?',
    options: ['puzzle', 'riddle', 'wall', 'trap'],
    correctIndex: 3,
    explanation: 'Pułapka = trap. Uważaj na pułapki w lochu! (Watch out for traps in the dungeon!)'
  },

  // DIFFICULTY 3 - Hard (Advanced Verbs)
  {
    id: 'vocab_167',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "odkrywać" mean?',
    options: ['to discover', 'to hide', 'to forget', 'to remember'],
    correctIndex: 0,
    explanation: 'Odkrywać = to discover. Mr Owl odkrywa tajemnice lochu! (Mr Owl discovers the dungeon\'s secrets!)'
  },
  {
    id: 'vocab_168',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "uciekać" mean?',
    options: ['to chase', 'to escape', 'to catch', 'to follow'],
    correctIndex: 1,
    explanation: 'Uciekać = to escape. Trzeba uciekać przed smokiem! (You must escape from the dragon!)'
  },
  {
    id: 'vocab_169',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "chronić" mean?',
    options: ['to attack', 'to destroy', 'to protect', 'to watch'],
    correctIndex: 2,
    explanation: 'Chronić = to protect. Tarcza chroni rycerza! (The shield protects the knight!)'
  },
  {
    id: 'vocab_170',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pokonać" mean?',
    options: ['to meet', 'to help', 'to challenge', 'to defeat'],
    correctIndex: 3,
    explanation: 'Pokonać = to defeat. Mr Owl musi pokonać smoka! (Mr Owl must defeat the dragon!)'
  },

  // DIFFICULTY 3 - Hard (Advanced Adjectives)
  {
    id: 'vocab_171',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "niezwyciężony" mean?',
    options: ['invincible', 'invisible', 'immortal', 'incredible'],
    correctIndex: 0,
    explanation: 'Niezwyciężony = invincible. Niezwyciężony rycerz wygra każdą bitwę! (An invincible knight will win every battle!)'
  },
  {
    id: 'vocab_172',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "potężny" mean?',
    options: ['weak', 'powerful', 'small', 'fast'],
    correctIndex: 1,
    explanation: 'Potężny = powerful. Smok jest potężnym stworzeniem! (A dragon is a powerful creature!)'
  },
  {
    id: 'vocab_173',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tajemniczy" mean?',
    options: ['obvious', 'simple', 'mysterious', 'clear'],
    correctIndex: 2,
    explanation: 'Tajemniczy = mysterious. Loch jest tajemniczy! (The dungeon is mysterious!)'
  },
  {
    id: 'vocab_174',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nieznany" mean?',
    options: ['famous', 'common', 'familiar', 'unknown'],
    correctIndex: 3,
    explanation: 'Nieznany = unknown. Przed nami nieznane niebezpieczeństwa! (Unknown dangers lie ahead!)'
  },

  // ========== VOCABULARY 175-348 ==========

  // DIFFICULTY 1 - Easy (Weather)
  {
    id: 'vocab_175',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pogoda" mean?',
    options: ['temperature', 'weather', 'season', 'climate'],
    correctIndex: 1,
    explanation: 'Pogoda = weather. Dzisiaj jest ładna pogoda! (Today the weather is nice!)'
  },
  {
    id: 'vocab_176',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lato" mean?',
    options: ['spring', 'winter', 'summer', 'autumn'],
    correctIndex: 2,
    explanation: 'Lato = summer. Latem jest ciepło! (It is warm in summer!)'
  },
  {
    id: 'vocab_177',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zima" mean?',
    options: ['winter', 'spring', 'summer', 'autumn'],
    correctIndex: 0,
    explanation: 'Zima = winter. Zimą pada śnieg! (It snows in winter!)'
  },
  {
    id: 'vocab_178',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wiosna" mean?',
    options: ['autumn', 'summer', 'winter', 'spring'],
    correctIndex: 3,
    explanation: 'Wiosna = spring. Wiosną kwitną kwiaty! (Flowers bloom in spring!)'
  },
  {
    id: 'vocab_179',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jesień" mean?',
    options: ['autumn', 'winter', 'spring', 'summer'],
    correctIndex: 0,
    explanation: 'Jesień = autumn. Jesienią liście spadają z drzew! (In autumn leaves fall from trees!)'
  },
  {
    id: 'vocab_180',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zimno" mean?',
    options: ['hot', 'warm', 'cold', 'cool'],
    correctIndex: 2,
    explanation: 'Zimno = cold. Zimą jest zimno! (It is cold in winter!)'
  },
  {
    id: 'vocab_181',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ciepło" mean?',
    options: ['cold', 'warm', 'hot', 'cool'],
    correctIndex: 1,
    explanation: 'Ciepło = warm. Latem jest ciepło! (It is warm in summer!)'
  },

  // DIFFICULTY 1 - Easy (Emotions)
  {
    id: 'vocab_182',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "szczęśliwy" mean?',
    options: ['sad', 'angry', 'happy', 'tired'],
    correctIndex: 2,
    explanation: 'Szczęśliwy = happy. Jestem szczęśliwy! (I am happy!)'
  },
  {
    id: 'vocab_183',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "smutny" mean?',
    options: ['happy', 'sad', 'excited', 'scared'],
    correctIndex: 1,
    explanation: 'Smutny = sad. Pies jest smutny bez właściciela! (The dog is sad without its owner!)'
  },
  {
    id: 'vocab_184',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zły" mean?',
    options: ['happy', 'scared', 'angry', 'shy'],
    correctIndex: 2,
    explanation: 'Zły = angry. Smok jest zły! (The dragon is angry!)'
  },
  {
    id: 'vocab_185',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zmęczony" mean?',
    options: ['hungry', 'tired', 'thirsty', 'bored'],
    correctIndex: 1,
    explanation: 'Zmęczony = tired. Jestem zmęczony po szkole! (I am tired after school!)'
  },
  {
    id: 'vocab_186',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "głodny" mean?',
    options: ['thirsty', 'tired', 'full', 'hungry'],
    correctIndex: 3,
    explanation: 'Głodny = hungry. Jestem głodny jak wilk! (I am hungry as a wolf!)'
  },
  {
    id: 'vocab_187',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wesoły" mean?',
    options: ['cheerful', 'gloomy', 'quiet', 'loud'],
    correctIndex: 0,
    explanation: 'Wesoły = cheerful. Dzieci są wesołe! (Children are cheerful!)'
  },

  // DIFFICULTY 1 - Easy (School)
  {
    id: 'vocab_188',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tablica" mean?',
    options: ['desk', 'board/blackboard', 'shelf', 'poster'],
    correctIndex: 1,
    explanation: 'Tablica = board/blackboard. Nauczyciel pisze na tablicy! (The teacher writes on the board!)'
  },
  {
    id: 'vocab_189',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zeszyt" mean?',
    options: ['book', 'notebook', 'paper', 'folder'],
    correctIndex: 1,
    explanation: 'Zeszyt = notebook. Piszę w zeszycie! (I write in a notebook!)'
  },
  {
    id: 'vocab_190',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "gumka" mean?',
    options: ['pencil', 'ruler', 'eraser', 'crayon'],
    correctIndex: 2,
    explanation: 'Gumka = eraser. Wymazuję błąd gumką! (I erase a mistake with an eraser!)'
  },
  {
    id: 'vocab_191',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "plecak" mean?',
    options: ['bag', 'backpack', 'suitcase', 'purse'],
    correctIndex: 1,
    explanation: 'Plecak = backpack. Noszę plecak do szkoły! (I carry a backpack to school!)'
  },
  {
    id: 'vocab_192',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kredka" mean?',
    options: ['pencil', 'pen', 'crayon', 'marker'],
    correctIndex: 2,
    explanation: 'Kredka = crayon. Rysuję kredkami! (I draw with crayons!)'
  },
  {
    id: 'vocab_193',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lekcja" mean?',
    options: ['break', 'lesson', 'exam', 'homework'],
    correctIndex: 1,
    explanation: 'Lekcja = lesson. Mamy lekcję matematyki! (We have a math lesson!)'
  },

  // DIFFICULTY 1 - Easy (Transport)
  {
    id: 'vocab_194',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "statek" mean?',
    options: ['car', 'plane', 'ship', 'train'],
    correctIndex: 2,
    explanation: 'Statek = ship. Statek płynie po morzu! (A ship sails on the sea!)'
  },
  {
    id: 'vocab_195',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "helikopter" mean?',
    options: ['airplane', 'helicopter', 'rocket', 'balloon'],
    correctIndex: 1,
    explanation: 'Helikopter = helicopter. Helikopter lata nad miastem! (A helicopter flies over the city!)'
  },
  {
    id: 'vocab_196',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "łódka" mean?',
    options: ['raft', 'boat', 'ship', 'canoe'],
    correctIndex: 1,
    explanation: 'Łódka = boat. Łódka pływa po jeziorze! (A boat floats on the lake!)'
  },

  // DIFFICULTY 1 - Easy (Time)
  {
    id: 'vocab_197',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rano" mean?',
    options: ['evening', 'night', 'morning', 'afternoon'],
    correctIndex: 2,
    explanation: 'Rano = morning. Rano jem śniadanie! (In the morning I eat breakfast!)'
  },
  {
    id: 'vocab_198',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "noc" mean?',
    options: ['day', 'morning', 'evening', 'night'],
    correctIndex: 3,
    explanation: 'Noc = night. W nocy świecą gwiazdy! (Stars shine at night!)'
  },
  {
    id: 'vocab_199',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dzień" mean?',
    options: ['day', 'week', 'month', 'year'],
    correctIndex: 0,
    explanation: 'Dzień = day. Dzień dobry! (Good day!)'
  },
  {
    id: 'vocab_200',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "godzina" mean?',
    options: ['minute', 'second', 'hour', 'day'],
    correctIndex: 2,
    explanation: 'Godzina = hour. Lekcja trwa jedną godzinę! (A lesson lasts one hour!)'
  },
  {
    id: 'vocab_201',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "minuta" mean?',
    options: ['hour', 'second', 'minute', 'moment'],
    correctIndex: 2,
    explanation: 'Minuta = minute. Godzina ma sześćdziesiąt minut! (An hour has sixty minutes!)'
  },
  {
    id: 'vocab_202',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tydzień" mean?',
    options: ['day', 'month', 'week', 'year'],
    correctIndex: 2,
    explanation: 'Tydzień = week. Tydzień ma siedem dni! (A week has seven days!)'
  },

  // DIFFICULTY 1 - Easy (More Animals)
  {
    id: 'vocab_203',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pająk" mean?',
    options: ['ant', 'spider', 'beetle', 'fly'],
    correctIndex: 1,
    explanation: 'Pająk = spider. Pająk ma osiem nóg! (A spider has eight legs!)'
  },
  {
    id: 'vocab_204',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pszczoła" mean?',
    options: ['wasp', 'fly', 'bee', 'ant'],
    correctIndex: 2,
    explanation: 'Pszczoła = bee. Pszczoły robią miód! (Bees make honey!)'
  },
  {
    id: 'vocab_205',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "owca" mean?',
    options: ['goat', 'sheep', 'cow', 'horse'],
    correctIndex: 1,
    explanation: 'Owca = sheep. Owce dają wełnę! (Sheep give wool!)'
  },
  {
    id: 'vocab_206',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "koza" mean?',
    options: ['sheep', 'cow', 'goat', 'donkey'],
    correctIndex: 2,
    explanation: 'Koza = goat. Kozy lubią wspinać się po górach! (Goats like to climb mountains!)'
  },
  {
    id: 'vocab_207',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wąż" mean?',
    options: ['worm', 'lizard', 'frog', 'snake'],
    correctIndex: 3,
    explanation: 'Wąż = snake. Wąż czołga się po ziemi! (A snake crawls on the ground!)'
  },
  {
    id: 'vocab_208',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mrówka" mean?',
    options: ['ant', 'spider', 'ladybug', 'beetle'],
    correctIndex: 0,
    explanation: 'Mrówka = ant. Mrówki są bardzo pracowite! (Ants are very hardworking!)'
  },
  {
    id: 'vocab_209',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "osioł" mean?',
    options: ['horse', 'mule', 'donkey', 'pony'],
    correctIndex: 2,
    explanation: 'Osioł = donkey. Osioł ma długie uszy! (A donkey has long ears!)'
  },

  // DIFFICULTY 1 - Easy (More Food)
  {
    id: 'vocab_210',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ciasto" mean?',
    options: ['bread', 'cake', 'pie', 'cookie'],
    correctIndex: 1,
    explanation: 'Ciasto = cake. Mama piecze ciasto na urodziny! (Mom bakes a cake for the birthday!)'
  },
  {
    id: 'vocab_211',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "czekolada" mean?',
    options: ['candy', 'caramel', 'chocolate', 'cookie'],
    correctIndex: 2,
    explanation: 'Czekolada = chocolate. Lubię czekoladę! (I like chocolate!)'
  },
  {
    id: 'vocab_212',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "truskawka" mean?',
    options: ['blueberry', 'strawberry', 'raspberry', 'cherry'],
    correctIndex: 1,
    explanation: 'Truskawka = strawberry. Truskawki są czerwone i słodkie! (Strawberries are red and sweet!)'
  },
  {
    id: 'vocab_213',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ziemniak" mean?',
    options: ['potato', 'carrot', 'onion', 'beet'],
    correctIndex: 0,
    explanation: 'Ziemniak = potato. Ziemniaki rosną w ziemi! (Potatoes grow in the ground!)'
  },
  {
    id: 'vocab_214',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ogórek" mean?',
    options: ['lettuce', 'tomato', 'cucumber', 'pepper'],
    correctIndex: 2,
    explanation: 'Ogórek = cucumber. Ogórki są zielone i chrupiące! (Cucumbers are green and crunchy!)'
  },
  {
    id: 'vocab_215',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "gruszka" mean?',
    options: ['apple', 'pear', 'plum', 'peach'],
    correctIndex: 1,
    explanation: 'Gruszka = pear. Gruszki są słodkie! (Pears are sweet!)'
  },

  // DIFFICULTY 1 - Easy (More Clothing)
  {
    id: 'vocab_216',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sweter" mean?',
    options: ['shirt', 'jacket', 'sweater', 'vest'],
    correctIndex: 2,
    explanation: 'Sweter = sweater. Noszę ciepły sweter zimą! (I wear a warm sweater in winter!)'
  },
  {
    id: 'vocab_217',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "spódnica" mean?',
    options: ['pants', 'dress', 'skirt', 'shorts'],
    correctIndex: 2,
    explanation: 'Spódnica = skirt. Spódnica jest czerwona! (The skirt is red!)'
  },
  {
    id: 'vocab_218',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "parasol" mean?',
    options: ['umbrella', 'hat', 'coat', 'scarf'],
    correctIndex: 0,
    explanation: 'Parasol = umbrella. Biorę parasol, bo pada deszcz! (I take an umbrella because it is raining!)'
  },

  // DIFFICULTY 1 - Easy (Simple Verbs)
  {
    id: 'vocab_219',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jeść" mean?',
    options: ['to drink', 'to eat', 'to cook', 'to taste'],
    correctIndex: 1,
    explanation: 'Jeść = to eat. Lubię jeść owoce! (I like to eat fruit!)'
  },
  {
    id: 'vocab_220',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pić" mean?',
    options: ['to eat', 'to cook', 'to drink', 'to pour'],
    correctIndex: 2,
    explanation: 'Pić = to drink. Piję wodę codziennie! (I drink water every day!)'
  },
  {
    id: 'vocab_221',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "spać" mean?',
    options: ['to run', 'to walk', 'to sit', 'to sleep'],
    correctIndex: 3,
    explanation: 'Spać = to sleep. Sowy śpią w dzień! (Owls sleep during the day!)'
  },
  {
    id: 'vocab_222',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "biegać" mean?',
    options: ['to run', 'to walk', 'to jump', 'to swim'],
    correctIndex: 0,
    explanation: 'Biegać = to run. Lubię biegać w parku! (I like to run in the park!)'
  },
  {
    id: 'vocab_223',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "skakać" mean?',
    options: ['to run', 'to climb', 'to jump', 'to fly'],
    correctIndex: 2,
    explanation: 'Skakać = to jump. Żaby lubią skakać! (Frogs like to jump!)'
  },
  {
    id: 'vocab_224',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "grać" mean?',
    options: ['to sing', 'to play', 'to dance', 'to draw'],
    correctIndex: 1,
    explanation: 'Grać = to play. Lubię grać w piłkę! (I like to play ball!)'
  },
  {
    id: 'vocab_225',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rysować" mean?',
    options: ['to paint', 'to write', 'to draw', 'to color'],
    correctIndex: 2,
    explanation: 'Rysować = to draw. Rysuję kredkami! (I draw with crayons!)'
  },

  // DIFFICULTY 1 - Easy (Body basics)
  {
    id: 'vocab_226',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "brzuch" mean?',
    options: ['back', 'chest', 'belly', 'shoulder'],
    correctIndex: 2,
    explanation: 'Brzuch = belly. Boli mnie brzuch! (My belly hurts!)'
  },
  {
    id: 'vocab_227',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "włosy" mean?',
    options: ['hair', 'eyes', 'ears', 'teeth'],
    correctIndex: 0,
    explanation: 'Włosy = hair. Mam długie włosy! (I have long hair!)'
  },

  // DIFFICULTY 1 - Easy (Places)
  {
    id: 'vocab_228',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "park" mean?',
    options: ['garden', 'park', 'forest', 'field'],
    correctIndex: 1,
    explanation: 'Park = park. Gramy w piłkę w parku! (We play ball in the park!)'
  },
  {
    id: 'vocab_229',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ogród" mean?',
    options: ['park', 'field', 'garden', 'farm'],
    correctIndex: 2,
    explanation: 'Ogród = garden. W ogrodzie rosną kwiaty! (Flowers grow in the garden!)'
  },
  {
    id: 'vocab_230',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "plaża" mean?',
    options: ['lake', 'island', 'beach', 'harbor'],
    correctIndex: 2,
    explanation: 'Plaża = beach. Latem jedziemy na plażę! (In summer we go to the beach!)'
  },

  // DIFFICULTY 1 - Easy (Simple adjectives)
  {
    id: 'vocab_231',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "duży" mean?',
    options: ['small', 'big', 'tall', 'wide'],
    correctIndex: 1,
    explanation: 'Duży = big. Słoń jest duży! (An elephant is big!)'
  },
  {
    id: 'vocab_232',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mały" mean?',
    options: ['big', 'tall', 'small', 'thin'],
    correctIndex: 2,
    explanation: 'Mały = small. Mrówka jest mała! (An ant is small!)'
  },
  {
    id: 'vocab_233',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "szybki" mean?',
    options: ['slow', 'fast', 'strong', 'weak'],
    correctIndex: 1,
    explanation: 'Szybki = fast. Gepard jest szybki! (A cheetah is fast!)'
  },
  {
    id: 'vocab_234',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wolny" mean?',
    options: ['fast', 'slow', 'quiet', 'loud'],
    correctIndex: 1,
    explanation: 'Wolny = slow. Żółw jest wolny! (A turtle is slow!)'
  },
  {
    id: 'vocab_235',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nowy" mean?',
    options: ['old', 'new', 'broken', 'fixed'],
    correctIndex: 1,
    explanation: 'Nowy = new. Mam nowy plecak! (I have a new backpack!)'
  },
  {
    id: 'vocab_236',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "stary" mean?',
    options: ['young', 'new', 'old', 'broken'],
    correctIndex: 2,
    explanation: 'Stary = old. Dziadek ma stary zegar! (Grandpa has an old clock!)'
  },

  // DIFFICULTY 1 - Easy (More basics)
  {
    id: 'vocab_237',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "przyjaciel" mean?',
    options: ['neighbor', 'friend', 'classmate', 'stranger'],
    correctIndex: 1,
    explanation: 'Przyjaciel = friend. Mój przyjaciel jest miły! (My friend is nice!)'
  },
  {
    id: 'vocab_238',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dziecko" mean?',
    options: ['baby', 'child', 'teenager', 'adult'],
    correctIndex: 1,
    explanation: 'Dziecko = child. Dziecko bawi się w parku! (A child plays in the park!)'
  },
  {
    id: 'vocab_239',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "imię" mean?',
    options: ['surname', 'name', 'nickname', 'title'],
    correctIndex: 1,
    explanation: 'Imię = name. Jak masz na imię? (What is your name?)'
  },
  {
    id: 'vocab_240',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "świat" mean?',
    options: ['country', 'world', 'land', 'planet'],
    correctIndex: 1,
    explanation: 'Świat = world. Świat jest piękny! (The world is beautiful!)'
  },
  {
    id: 'vocab_241',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wieś" mean?',
    options: ['city', 'town', 'village', 'suburb'],
    correctIndex: 2,
    explanation: 'Wieś = village. Na wsi są krowy i kury! (In the village there are cows and hens!)'
  },
  {
    id: 'vocab_242',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "śniadanie" mean?',
    options: ['lunch', 'dinner', 'supper', 'breakfast'],
    correctIndex: 3,
    explanation: 'Śniadanie = breakfast. Rano jem śniadanie! (In the morning I eat breakfast!)'
  },
  {
    id: 'vocab_243',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "obiad" mean?',
    options: ['breakfast', 'lunch/dinner', 'supper', 'snack'],
    correctIndex: 1,
    explanation: 'Obiad = lunch/dinner. Obiad jest o dwunastej! (Lunch is at twelve!)'
  },
  {
    id: 'vocab_244',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kolacja" mean?',
    options: ['breakfast', 'lunch', 'supper', 'snack'],
    correctIndex: 2,
    explanation: 'Kolacja = supper. Jemy kolację wieczorem! (We eat supper in the evening!)'
  },
  {
    id: 'vocab_245',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "miód" mean?',
    options: ['sugar', 'honey', 'syrup', 'jam'],
    correctIndex: 1,
    explanation: 'Miód = honey. Pszczoły robią miód! (Bees make honey!)'
  },
  {
    id: 'vocab_246',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wiśnia" mean?',
    options: ['plum', 'grape', 'cherry', 'berry'],
    correctIndex: 2,
    explanation: 'Wiśnia = cherry. Wiśnie są czerwone i smaczne! (Cherries are red and tasty!)'
  },
  {
    id: 'vocab_247',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "cebula" mean?',
    options: ['garlic', 'onion', 'pepper', 'leek'],
    correctIndex: 1,
    explanation: 'Cebula = onion. Cebula ma mocny zapach! (An onion has a strong smell!)'
  },
  {
    id: 'vocab_248',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pomarańcza" mean?',
    options: ['lemon', 'orange', 'grapefruit', 'tangerine'],
    correctIndex: 1,
    explanation: 'Pomarańcza = orange. Pomarańcze mają witaminę C! (Oranges have vitamin C!)'
  },
  {
    id: 'vocab_249',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "czytać" mean?',
    options: ['to write', 'to read', 'to listen', 'to speak'],
    correctIndex: 1,
    explanation: 'Czytać = to read. Lubię czytać książki! (I like to read books!)'
  },
  {
    id: 'vocab_250',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pisać" mean?',
    options: ['to read', 'to draw', 'to write', 'to type'],
    correctIndex: 2,
    explanation: 'Pisać = to write. Piszę list do babci! (I write a letter to grandma!)'
  },
  {
    id: 'vocab_251',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "liść" mean?',
    options: ['branch', 'root', 'leaf', 'bark'],
    correctIndex: 2,
    explanation: 'Liść = leaf. Jesienią liście spadają! (In autumn the leaves fall!)'
  },
  {
    id: 'vocab_252',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "trawa" mean?',
    options: ['moss', 'grass', 'hay', 'weed'],
    correctIndex: 1,
    explanation: 'Trawa = grass. Trawa jest zielona! (Grass is green!)'
  },
  {
    id: 'vocab_253',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "słoń" mean?',
    options: ['hippo', 'rhino', 'elephant', 'giraffe'],
    correctIndex: 2,
    explanation: 'Słoń = elephant. Słoń jest największym zwierzęciem lądowym! (An elephant is the largest land animal!)'
  },
  {
    id: 'vocab_254',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "małpa" mean?',
    options: ['monkey', 'gorilla', 'bear', 'panda'],
    correctIndex: 0,
    explanation: 'Małpa = monkey. Małpy lubią banany! (Monkeys like bananas!)'
  },
  {
    id: 'vocab_255',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jeleń" mean?',
    options: ['moose', 'deer', 'elk', 'antelope'],
    correctIndex: 1,
    explanation: 'Jeleń = deer. Jeleń ma piękne rogi! (A deer has beautiful antlers!)'
  },
  {
    id: 'vocab_256',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jezioro" mean?',
    options: ['river', 'sea', 'pond', 'lake'],
    correctIndex: 3,
    explanation: 'Jezioro = lake. Kaczki pływają po jeziorze! (Ducks swim on the lake!)'
  },
  {
    id: 'vocab_257',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "piasek" mean?',
    options: ['rock', 'sand', 'dirt', 'mud'],
    correctIndex: 1,
    explanation: 'Piasek = sand. Na plaży jest dużo piasku! (There is a lot of sand on the beach!)'
  },
  {
    id: 'vocab_258',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "chodzić" mean?',
    options: ['to run', 'to stand', 'to walk', 'to sit'],
    correctIndex: 2,
    explanation: 'Chodzić = to walk. Chodzę do szkoły pieszo! (I walk to school on foot!)'
  },
  {
    id: 'vocab_259',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pływać" mean?',
    options: ['to dive', 'to sail', 'to fish', 'to swim'],
    correctIndex: 3,
    explanation: 'Pływać = to swim. Ryby umieją pływać! (Fish can swim!)'
  },
  {
    id: 'vocab_260',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "latać" mean?',
    options: ['to fly', 'to float', 'to fall', 'to climb'],
    correctIndex: 0,
    explanation: 'Latać = to fly. Ptaki potrafią latać! (Birds can fly!)'
  },
  {
    id: 'vocab_261',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "śpiewać" mean?',
    options: ['to shout', 'to whisper', 'to sing', 'to talk'],
    correctIndex: 2,
    explanation: 'Śpiewać = to sing. Ptaki śpiewają rano! (Birds sing in the morning!)'
  },
  {
    id: 'vocab_262',
    difficulty: 1,
    category: 'vocabulary',
    prompt: 'What does the Polish word "tańczyć" mean?',
    options: ['to sing', 'to dance', 'to play', 'to run'],
    correctIndex: 1,
    explanation: 'Tańczyć = to dance. Lubię tańczyć! (I like to dance!)'
  },

  // DIFFICULTY 2 - Medium (Nature)
  {
    id: 'vocab_263',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dolina" mean?',
    options: ['hill', 'valley', 'plain', 'cliff'],
    correctIndex: 1,
    explanation: 'Dolina = valley. Dolina jest między górami! (The valley is between the mountains!)'
  },
  {
    id: 'vocab_264',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wyspa" mean?',
    options: ['peninsula', 'island', 'coast', 'shore'],
    correctIndex: 1,
    explanation: 'Wyspa = island. Wyspa jest otoczona wodą! (An island is surrounded by water!)'
  },
  {
    id: 'vocab_265',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pole" mean?',
    options: ['garden', 'meadow', 'field', 'lawn'],
    correctIndex: 2,
    explanation: 'Pole = field. Na polu rośnie zboże! (Grain grows in the field!)'
  },
  {
    id: 'vocab_266',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wodospad" mean?',
    options: ['river', 'waterfall', 'fountain', 'stream'],
    correctIndex: 1,
    explanation: 'Wodospad = waterfall. Wodospad jest piękny! (The waterfall is beautiful!)'
  },
  {
    id: 'vocab_267',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kamień" mean?',
    options: ['stone', 'brick', 'sand', 'pebble'],
    correctIndex: 0,
    explanation: 'Kamień = stone. Zamek jest zbudowany z kamieni! (The castle is built from stones!)'
  },

  // DIFFICULTY 2 - Medium (Household Items)
  {
    id: 'vocab_268',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "lodówka" mean?',
    options: ['oven', 'freezer', 'fridge', 'dishwasher'],
    correctIndex: 2,
    explanation: 'Lodówka = fridge. Mleko jest w lodówce! (Milk is in the fridge!)'
  },
  {
    id: 'vocab_269',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pralka" mean?',
    options: ['dryer', 'dishwasher', 'washing machine', 'vacuum'],
    correctIndex: 2,
    explanation: 'Pralka = washing machine. Mama wkłada ubrania do pralki! (Mom puts clothes in the washing machine!)'
  },
  {
    id: 'vocab_270',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "poduszka" mean?',
    options: ['blanket', 'pillow', 'mattress', 'sheet'],
    correctIndex: 1,
    explanation: 'Poduszka = pillow. Śpię na miękkiej poduszce! (I sleep on a soft pillow!)'
  },
  {
    id: 'vocab_271',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "koc" mean?',
    options: ['pillow', 'sheet', 'blanket', 'towel'],
    correctIndex: 2,
    explanation: 'Koc = blanket. Zimą otulam się kocem! (In winter I wrap myself in a blanket!)'
  },
  {
    id: 'vocab_272',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "talerz" mean?',
    options: ['cup', 'bowl', 'plate', 'tray'],
    correctIndex: 2,
    explanation: 'Talerz = plate. Zupa jest na talerzu! (Soup is on the plate!)'
  },
  {
    id: 'vocab_273',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kubek" mean?',
    options: ['mug/cup', 'glass', 'bottle', 'jug'],
    correctIndex: 0,
    explanation: 'Kubek = mug/cup. Piję herbatę z kubka! (I drink tea from a mug!)'
  },

  // DIFFICULTY 2 - Medium (Sports & Activities)
  {
    id: 'vocab_274',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "basen" mean?',
    options: ['gym', 'swimming pool', 'playground', 'stadium'],
    correctIndex: 1,
    explanation: 'Basen = swimming pool. Pływam w basenie! (I swim in the pool!)'
  },
  {
    id: 'vocab_275',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "mecz" mean?',
    options: ['game/match', 'practice', 'race', 'contest'],
    correctIndex: 0,
    explanation: 'Mecz = game/match. Dziś jest mecz piłki nożnej! (Today there is a soccer match!)'
  },
  {
    id: 'vocab_276',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "boisko" mean?',
    options: ['court', 'field/pitch', 'ring', 'track'],
    correctIndex: 1,
    explanation: 'Boisko = field/pitch. Gramy w piłkę na boisku! (We play ball on the field!)'
  },
  {
    id: 'vocab_277',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "bramka" mean?',
    options: ['goal', 'net', 'basket', 'hoop'],
    correctIndex: 0,
    explanation: 'Bramka = goal. Piłka wpadła do bramki! (The ball went into the goal!)'
  },

  // DIFFICULTY 2 - Medium (Music)
  {
    id: 'vocab_278',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "gitara" mean?',
    options: ['violin', 'guitar', 'drums', 'piano'],
    correctIndex: 1,
    explanation: 'Gitara = guitar. Gram na gitarze! (I play the guitar!)'
  },
  {
    id: 'vocab_279',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pianino" mean?',
    options: ['guitar', 'flute', 'piano', 'drums'],
    correctIndex: 2,
    explanation: 'Pianino = piano. Siostra gra na pianinie! (Sister plays the piano!)'
  },
  {
    id: 'vocab_280',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "piosenka" mean?',
    options: ['melody', 'song', 'rhythm', 'tune'],
    correctIndex: 1,
    explanation: 'Piosenka = song. Śpiewam ulubioną piosenkę! (I sing my favorite song!)'
  },
  {
    id: 'vocab_281',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "bęben" mean?',
    options: ['trumpet', 'flute', 'drum', 'bell'],
    correctIndex: 2,
    explanation: 'Bęben = drum. Gram na bębnie! (I play the drum!)'
  },

  // DIFFICULTY 2 - Medium (Buildings)
  {
    id: 'vocab_282',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kościół" mean?',
    options: ['temple', 'church', 'mosque', 'chapel'],
    correctIndex: 1,
    explanation: 'Kościół = church. Kościół ma wysoką wieżę! (The church has a tall tower!)'
  },
  {
    id: 'vocab_283',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "szpital" mean?',
    options: ['clinic', 'pharmacy', 'hospital', 'office'],
    correctIndex: 2,
    explanation: 'Szpital = hospital. Lekarz pracuje w szpitalu! (A doctor works in a hospital!)'
  },
  {
    id: 'vocab_284',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "biblioteka" mean?',
    options: ['bookshop', 'library', 'school', 'museum'],
    correctIndex: 1,
    explanation: 'Biblioteka = library. W bibliotece jest dużo książek! (There are many books in the library!)'
  },
  {
    id: 'vocab_285',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "muzeum" mean?',
    options: ['gallery', 'theater', 'museum', 'cinema'],
    correctIndex: 2,
    explanation: 'Muzeum = museum. W muzeum są stare eksponaty! (There are old exhibits in the museum!)'
  },
  {
    id: 'vocab_286',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "most" mean?',
    options: ['road', 'tunnel', 'bridge', 'gate'],
    correctIndex: 2,
    explanation: 'Most = bridge. Most łączy dwa brzegi rzeki! (A bridge connects two banks of the river!)'
  },

  // DIFFICULTY 2 - Medium (Complex Verbs)
  {
    id: 'vocab_287',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "marzyć" mean?',
    options: ['to sleep', 'to dream', 'to think', 'to wish'],
    correctIndex: 1,
    explanation: 'Marzyć = to dream. Marzę o podróżach! (I dream about travels!)'
  },
  {
    id: 'vocab_288',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "podróżować" mean?',
    options: ['to walk', 'to drive', 'to travel', 'to fly'],
    correctIndex: 2,
    explanation: 'Podróżować = to travel. Lubię podróżować po świecie! (I like to travel around the world!)'
  },
  {
    id: 'vocab_289',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "gotować" mean?',
    options: ['to bake', 'to cook', 'to fry', 'to boil'],
    correctIndex: 1,
    explanation: 'Gotować = to cook. Mama gotuje obiad! (Mom cooks dinner!)'
  },
  {
    id: 'vocab_290',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "budować" mean?',
    options: ['to build', 'to repair', 'to paint', 'to demolish'],
    correctIndex: 0,
    explanation: 'Budować = to build. Budujemy zamek z piasku! (We build a castle from sand!)'
  },
  {
    id: 'vocab_291',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pomagać" mean?',
    options: ['to ask', 'to help', 'to teach', 'to need'],
    correctIndex: 1,
    explanation: 'Pomagać = to help. Pomagam mamie w kuchni! (I help mom in the kitchen!)'
  },
  {
    id: 'vocab_292',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "uczyć się" mean?',
    options: ['to teach', 'to study/learn', 'to read', 'to work'],
    correctIndex: 1,
    explanation: 'Uczyć się = to study/learn. Uczę się polskiego! (I am learning Polish!)'
  },

  // DIFFICULTY 2 - Medium (More professions)
  {
    id: 'vocab_293',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kucharz" mean?',
    options: ['waiter', 'cook/chef', 'baker', 'butcher'],
    correctIndex: 1,
    explanation: 'Kucharz = cook/chef. Kucharz gotuje w restauracji! (A chef cooks in a restaurant!)'
  },
  {
    id: 'vocab_294',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pielęgniarka" mean?',
    options: ['doctor', 'nurse', 'dentist', 'therapist'],
    correctIndex: 1,
    explanation: 'Pielęgniarka = nurse. Pielęgniarka opiekuje się chorymi! (A nurse takes care of the sick!)'
  },
  {
    id: 'vocab_295',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kierowca" mean?',
    options: ['pilot', 'driver', 'mechanic', 'conductor'],
    correctIndex: 1,
    explanation: 'Kierowca = driver. Kierowca prowadzi autobus! (A driver drives the bus!)'
  },
  {
    id: 'vocab_296',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "malarz" mean?',
    options: ['sculptor', 'painter', 'photographer', 'writer'],
    correctIndex: 1,
    explanation: 'Malarz = painter. Malarz maluje piękne obrazy! (A painter paints beautiful pictures!)'
  },

  // DIFFICULTY 2 - Medium (Feelings & States)
  {
    id: 'vocab_297',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "strach" mean?',
    options: ['anger', 'fear', 'sadness', 'surprise'],
    correctIndex: 1,
    explanation: 'Strach = fear. Nie ma strachu! (There is no fear!)'
  },
  {
    id: 'vocab_298',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "radość" mean?',
    options: ['sadness', 'anger', 'joy', 'surprise'],
    correctIndex: 2,
    explanation: 'Radość = joy. Dzieci skaczą z radości! (Children jump with joy!)'
  },
  {
    id: 'vocab_299',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nadzieja" mean?',
    options: ['fear', 'doubt', 'hope', 'worry'],
    correctIndex: 2,
    explanation: 'Nadzieja = hope. Nadzieja umiera ostatnia! (Hope dies last!)'
  },
  {
    id: 'vocab_300',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "miłość" mean?',
    options: ['hate', 'love', 'friendship', 'kindness'],
    correctIndex: 1,
    explanation: 'Miłość = love. Miłość jest piękna! (Love is beautiful!)'
  },

  // DIFFICULTY 2 - Medium (Time & Calendar)
  {
    id: 'vocab_301',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "poniedziałek" mean?',
    options: ['Tuesday', 'Monday', 'Wednesday', 'Sunday'],
    correctIndex: 1,
    explanation: 'Poniedziałek = Monday. Poniedziałek to pierwszy dzień tygodnia! (Monday is the first day of the week!)'
  },
  {
    id: 'vocab_302',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "piątek" mean?',
    options: ['Thursday', 'Saturday', 'Friday', 'Wednesday'],
    correctIndex: 2,
    explanation: 'Piątek = Friday. Piątek to prawie weekend! (Friday is almost the weekend!)'
  },
  {
    id: 'vocab_303',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "niedziela" mean?',
    options: ['Saturday', 'Monday', 'Friday', 'Sunday'],
    correctIndex: 3,
    explanation: 'Niedziela = Sunday. W niedzielę odpoczywamy! (On Sunday we rest!)'
  },
  {
    id: 'vocab_304',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "miesiąc" mean?',
    options: ['week', 'year', 'month', 'day'],
    correctIndex: 2,
    explanation: 'Miesiąc = month. Rok ma dwanaście miesięcy! (A year has twelve months!)'
  },
  {
    id: 'vocab_305',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "rok" mean?',
    options: ['month', 'decade', 'year', 'century'],
    correctIndex: 2,
    explanation: 'Rok = year. Rok ma trzysta sześćdziesiąt pięć dni! (A year has three hundred sixty-five days!)'
  },
  {
    id: 'vocab_306',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wczoraj" mean?',
    options: ['today', 'tomorrow', 'yesterday', 'later'],
    correctIndex: 2,
    explanation: 'Wczoraj = yesterday. Wczoraj padał deszcz! (Yesterday it rained!)'
  },
  {
    id: 'vocab_307',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "jutro" mean?',
    options: ['today', 'yesterday', 'now', 'tomorrow'],
    correctIndex: 3,
    explanation: 'Jutro = tomorrow. Jutro idziemy do parku! (Tomorrow we go to the park!)'
  },
  {
    id: 'vocab_308',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "dzisiaj" mean?',
    options: ['today', 'yesterday', 'tomorrow', 'always'],
    correctIndex: 0,
    explanation: 'Dzisiaj = today. Dzisiaj jest piękny dzień! (Today is a beautiful day!)'
  },
  {
    id: 'vocab_309',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "południe" mean?',
    options: ['morning', 'noon/south', 'evening', 'midnight'],
    correctIndex: 1,
    explanation: 'Południe = noon/south. Jemy obiad w południe! (We eat lunch at noon!)'
  },
  {
    id: 'vocab_310',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wieczór" mean?',
    options: ['morning', 'afternoon', 'evening', 'midnight'],
    correctIndex: 2,
    explanation: 'Wieczór = evening. Wieczorem oglądam film! (In the evening I watch a movie!)'
  },
  {
    id: 'vocab_311',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "obraz" mean?',
    options: ['photo', 'picture/painting', 'poster', 'mirror'],
    correctIndex: 1,
    explanation: 'Obraz = picture/painting. Na ścianie wisi piękny obraz! (A beautiful painting hangs on the wall!)'
  },
  {
    id: 'vocab_312',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "kieszeń" mean?',
    options: ['wallet', 'bag', 'pocket', 'purse'],
    correctIndex: 2,
    explanation: 'Kieszeń = pocket. Mam cukierka w kieszeni! (I have a candy in my pocket!)'
  },
  {
    id: 'vocab_313',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ściana" mean?',
    options: ['floor', 'ceiling', 'wall', 'roof'],
    correctIndex: 2,
    explanation: 'Ściana = wall. Na ścianie wisi zegar! (A clock hangs on the wall!)'
  },
  {
    id: 'vocab_314',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "podłoga" mean?',
    options: ['floor', 'ceiling', 'wall', 'carpet'],
    correctIndex: 0,
    explanation: 'Podłoga = floor. Podłoga jest czysta! (The floor is clean!)'
  },
  {
    id: 'vocab_315',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "sufit" mean?',
    options: ['floor', 'wall', 'ceiling', 'roof'],
    correctIndex: 2,
    explanation: 'Sufit = ceiling. Lampa wisi na suficie! (A lamp hangs from the ceiling!)'
  },
  {
    id: 'vocab_316',
    difficulty: 2,
    category: 'vocabulary',
    prompt: 'What does the Polish word "łyżka" mean?',
    options: ['fork', 'spoon', 'knife', 'plate'],
    correctIndex: 1,
    explanation: 'Łyżka = spoon. Jem zupę łyżką! (I eat soup with a spoon!)'
  },

  // DIFFICULTY 3 - Hard (Abstract Concepts)
  {
    id: 'vocab_317',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "nauka" mean?',
    options: ['art', 'science/learning', 'sport', 'nature'],
    correctIndex: 1,
    explanation: 'Nauka = science/learning. Nauka jest fascynująca! (Science is fascinating!)'
  },
  {
    id: 'vocab_318',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "energia" mean?',
    options: ['power', 'energy', 'force', 'speed'],
    correctIndex: 1,
    explanation: 'Energia = energy. Słońce daje nam energię! (The sun gives us energy!)'
  },
  {
    id: 'vocab_319',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "planeta" mean?',
    options: ['star', 'moon', 'planet', 'comet'],
    correctIndex: 2,
    explanation: 'Planeta = planet. Ziemia to nasza planeta! (Earth is our planet!)'
  },
  {
    id: 'vocab_320',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wszechświat" mean?',
    options: ['galaxy', 'universe', 'solar system', 'constellation'],
    correctIndex: 1,
    explanation: 'Wszechświat = universe. Wszechświat jest ogromny! (The universe is enormous!)'
  },
  {
    id: 'vocab_321',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wspaniały" mean?',
    options: ['terrible', 'ordinary', 'wonderful', 'boring'],
    correctIndex: 2,
    explanation: 'Wspaniały = wonderful. To wspaniały dzień! (This is a wonderful day!)'
  },
  {
    id: 'vocab_322',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "niezwykły" mean?',
    options: ['common', 'unusual/extraordinary', 'normal', 'plain'],
    correctIndex: 1,
    explanation: 'Niezwykły = unusual/extraordinary. To niezwykła przygoda! (This is an extraordinary adventure!)'
  },
  {
    id: 'vocab_323',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ogromny" mean?',
    options: ['tiny', 'small', 'enormous', 'medium'],
    correctIndex: 2,
    explanation: 'Ogromny = enormous. Smok jest ogromny! (The dragon is enormous!)'
  },
  {
    id: 'vocab_324',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "odważny" mean?',
    options: ['scared', 'brave', 'careful', 'shy'],
    correctIndex: 1,
    explanation: 'Odważny = brave. Mr Owl jest odważny! (Mr Owl is brave!)'
  },
  {
    id: 'vocab_325',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "marzenie" mean?',
    options: ['nightmare', 'idea', 'dream/wish', 'thought'],
    correctIndex: 2,
    explanation: 'Marzenie = dream/wish. Moje marzenie się spełniło! (My dream came true!)'
  },
  {
    id: 'vocab_326',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "cierpliwość" mean?',
    options: ['courage', 'patience', 'kindness', 'loyalty'],
    correctIndex: 1,
    explanation: 'Cierpliwość = patience. Cierpliwość jest ważna! (Patience is important!)'
  },
  {
    id: 'vocab_327',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wiedza" mean?',
    options: ['wisdom', 'knowledge', 'skill', 'memory'],
    correctIndex: 1,
    explanation: 'Wiedza = knowledge. Wiedza to potęga! (Knowledge is power!)'
  },
  {
    id: 'vocab_328',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "prawda" mean?',
    options: ['lie', 'opinion', 'truth', 'story'],
    correctIndex: 2,
    explanation: 'Prawda = truth. Zawsze mów prawdę! (Always tell the truth!)'
  },
  {
    id: 'vocab_329',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pamięć" mean?',
    options: ['thought', 'memory', 'dream', 'mind'],
    correctIndex: 1,
    explanation: 'Pamięć = memory. Mam dobrą pamięć! (I have a good memory!)'
  },
  {
    id: 'vocab_330',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "pokój" mean?',
    options: ['room/peace', 'war', 'house', 'garden'],
    correctIndex: 0,
    explanation: 'Pokój = room/peace. Mój pokój jest duży! (My room is big!)'
  },
  {
    id: 'vocab_331',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "niebo" mean?',
    options: ['ground', 'sea', 'sky/heaven', 'earth'],
    correctIndex: 2,
    explanation: 'Niebo = sky/heaven. Niebo jest niebieskie! (The sky is blue!)'
  },
  {
    id: 'vocab_332',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ziemia" mean?',
    options: ['water', 'earth/ground', 'sky', 'fire'],
    correctIndex: 1,
    explanation: 'Ziemia = earth/ground. Ziemia jest naszym domem! (Earth is our home!)'
  },
  {
    id: 'vocab_333',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "ogień" mean?',
    options: ['water', 'ice', 'fire', 'smoke'],
    correctIndex: 2,
    explanation: 'Ogień = fire. Smok zieje ogniem! (The dragon breathes fire!)'
  },
  {
    id: 'vocab_334',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "duch" mean?',
    options: ['demon', 'ghost/spirit', 'shadow', 'skeleton'],
    correctIndex: 1,
    explanation: 'Duch = ghost/spirit. W zamku straszy duch! (A ghost haunts the castle!)'
  },
  {
    id: 'vocab_335',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wróżka" mean?',
    options: ['witch', 'fairy', 'princess', 'queen'],
    correctIndex: 1,
    explanation: 'Wróżka = fairy. Wróżka spełnia życzenia! (A fairy grants wishes!)'
  },
  {
    id: 'vocab_336',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "czarodziej" mean?',
    options: ['knight', 'king', 'wizard', 'prophet'],
    correctIndex: 2,
    explanation: 'Czarodziej = wizard. Czarodziej rzuca zaklęcia! (The wizard casts spells!)'
  },
  {
    id: 'vocab_337',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zaklęcie" mean?',
    options: ['potion', 'curse', 'spell', 'charm'],
    correctIndex: 2,
    explanation: 'Zaklęcie = spell. Czarodziej rzucił potężne zaklęcie! (The wizard cast a powerful spell!)'
  },
  {
    id: 'vocab_338',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zbroja" mean?',
    options: ['sword', 'armor', 'shield', 'helmet'],
    correctIndex: 1,
    explanation: 'Zbroja = armor. Rycerz nosi zbroję! (The knight wears armor!)'
  },
  {
    id: 'vocab_339',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wieża" mean?',
    options: ['wall', 'tower', 'gate', 'bridge'],
    correctIndex: 1,
    explanation: 'Wieża = tower. Księżniczka mieszka w wysokiej wieży! (The princess lives in a tall tower!)'
  },
  {
    id: 'vocab_340',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "przeznaczenie" mean?',
    options: ['luck', 'destiny/fate', 'chance', 'choice'],
    correctIndex: 1,
    explanation: 'Przeznaczenie = destiny/fate. To moje przeznaczenie! (This is my destiny!)'
  },
  {
    id: 'vocab_341',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wdzięczność" mean?',
    options: ['pride', 'gratitude', 'happiness', 'respect'],
    correctIndex: 1,
    explanation: 'Wdzięczność = gratitude. Czuję wielką wdzięczność! (I feel great gratitude!)'
  },
  {
    id: 'vocab_342',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "spokój" mean?',
    options: ['calm/peace', 'noise', 'chaos', 'storm'],
    correctIndex: 0,
    explanation: 'Spokój = calm/peace. W lesie panuje spokój! (There is calm in the forest!)'
  },
  {
    id: 'vocab_343',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "wytrwałość" mean?',
    options: ['speed', 'perseverance', 'strength', 'cleverness'],
    correctIndex: 1,
    explanation: 'Wytrwałość = perseverance. Wytrwałość prowadzi do sukcesu! (Perseverance leads to success!)'
  },
  {
    id: 'vocab_344',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "szlachetny" mean?',
    options: ['selfish', 'noble', 'common', 'cruel'],
    correctIndex: 1,
    explanation: 'Szlachetny = noble. Rycerz jest szlachetny! (The knight is noble!)'
  },
  {
    id: 'vocab_345',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zaufanie" mean?',
    options: ['doubt', 'trust', 'fear', 'suspicion'],
    correctIndex: 1,
    explanation: 'Zaufanie = trust. Zaufanie trzeba zdobyć! (Trust must be earned!)'
  },
  {
    id: 'vocab_346',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "przeszkoda" mean?',
    options: ['path', 'shortcut', 'obstacle', 'solution'],
    correctIndex: 2,
    explanation: 'Przeszkoda = obstacle. Pokonuję każdą przeszkodę! (I overcome every obstacle!)'
  },
  {
    id: 'vocab_347',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "doświadczenie" mean?',
    options: ['experiment', 'experience', 'knowledge', 'adventure'],
    correctIndex: 1,
    explanation: 'Doświadczenie = experience. Doświadczenie jest najlepszym nauczycielem! (Experience is the best teacher!)'
  },
  {
    id: 'vocab_348',
    difficulty: 3,
    category: 'vocabulary',
    prompt: 'What does the Polish word "zwycięzca" mean?',
    options: ['loser', 'champion', 'winner', 'fighter'],
    correctIndex: 2,
    explanation: 'Zwycięzca = winner. Mr Owl jest zwycięzcą! (Mr Owl is the winner!)'
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VOCABULARY_QUESTIONS };
}
