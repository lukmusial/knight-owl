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
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VOCABULARY_QUESTIONS };
}
