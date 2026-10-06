/**
 * Sentence Builder Data
 * Word-tile sentences for the sentence encounter type: the player arranges
 * shuffled Polish words to say what the English prompt means.
 *
 * answers     - every accepted word order; the first is the canonical one
 * distractors - extra tiles: random (fits nowhere), form (an answer word in
 *               the wrong case, person or tense, or the wrong preposition),
 *               lookalike (a different word spelled almost the same)
 *
 * Difficulty 1: 2-4 words, 2 random distractors
 * Difficulty 2: 3-5 words, 2 random + 2 wrong forms
 * Difficulty 3: 3-4 words, 1 random + 3-4 wrong forms + 0-1 look-alike (5 in all)
 */

const SENTENCE_QUESTIONS = [
  // --- Difficulty 1 ---
  {
    id: 'sent_001', difficulty: 1, category: 'sentence',
    prompt: 'The dragon is big.',
    answers: [['smok', 'jest', 'duży']],
    distractors: { random: ['łyżka', 'przez'], form: [], lookalike: [] },
    explanation: 'Smok jest duży. "Duży" means "big"; smok is masculine, so it is "duży".'
  },
  {
    id: 'sent_002', difficulty: 1, category: 'sentence',
    prompt: 'The owl is wise.',
    answers: [['sowa', 'jest', 'mądra']],
    distractors: { random: ['rower', 'bez'], form: [], lookalike: [] },
    explanation: 'Sowa jest mądra. Sowa is feminine, so "wise" is "mądra" with -a.'
  },
  {
    id: 'sent_003', difficulty: 1, category: 'sentence',
    prompt: 'The ghost is hiding.',
    answers: [
      ['duch', 'się', 'chowa'],
      ['duch', 'chowa', 'się']
    ],
    distractors: { random: ['mała', 'dla'], form: [], lookalike: [] },
    explanation: 'Duch się chowa. "Chować się" means "to hide" - the little word "się" goes with it.'
  },
  {
    id: 'sent_004', difficulty: 1, category: 'sentence',
    prompt: 'I have a key.',
    answers: [
      ['mam', 'klucz'],
      ['ja', 'mam', 'klucz']
    ],
    distractors: { random: ['śpiewa', 'wczoraj'], form: [], lookalike: [] },
    explanation: 'Mam klucz. "Mam" already means "I have", so "ja" can be left out.'
  },
  {
    id: 'sent_005', difficulty: 1, category: 'sentence',
    prompt: 'The bat is flying.',
    answers: [['nietoperz', 'leci']],
    distractors: { random: ['zielona', 'dla'], form: [], lookalike: [] },
    explanation: 'Nietoperz leci. "Nietoperz" is a bat and "leci" means "is flying".'
  },
  {
    id: 'sent_006', difficulty: 1, category: 'sentence',
    prompt: 'The witch is laughing.',
    answers: [
      ['czarownica', 'się', 'śmieje'],
      ['czarownica', 'śmieje', 'się']
    ],
    distractors: { random: ['wysoki', 'pod'], form: [], lookalike: [] },
    explanation: 'Czarownica się śmieje. "Śmiać się" means "to laugh" and always comes with "się".'
  },
  {
    id: 'sent_007', difficulty: 1, category: 'sentence',
    prompt: 'The pumpkin is orange.',
    answers: [['dynia', 'jest', 'pomarańczowa']],
    distractors: { random: ['czyta', 'obok'], form: [], lookalike: [] },
    explanation: 'Dynia jest pomarańczowa. Dynia is feminine, so the colour ends in -a.'
  },
  {
    id: 'sent_008', difficulty: 1, category: 'sentence',
    prompt: 'The skeleton is dancing.',
    answers: [['szkielet', 'tańczy']],
    distractors: { random: ['mokra', 'przez'], form: [], lookalike: [] },
    explanation: 'Szkielet tańczy. "Tańczy" means "is dancing".'
  },
  {
    id: 'sent_009', difficulty: 1, category: 'sentence',
    prompt: 'The spider has eight legs.',
    answers: [['pająk', 'ma', 'osiem', 'nóg']],
    distractors: { random: ['pije', 'wysoka'], form: [], lookalike: [] },
    explanation: 'Pająk ma osiem nóg. After "osiem" (eight), nogi changes to "nóg".'
  },
  {
    id: 'sent_010', difficulty: 1, category: 'sentence',
    prompt: 'The cat is black.',
    answers: [['kot', 'jest', 'czarny']],
    distractors: { random: ['zupa', 'biegnie'], form: [], lookalike: [] },
    explanation: 'Kot jest czarny. "Czarny" means "black".'
  },
  {
    id: 'sent_011', difficulty: 1, category: 'sentence',
    prompt: 'The moon is shining.',
    answers: [['księżyc', 'świeci']],
    distractors: { random: ['jemy', 'dla'], form: [], lookalike: [] },
    explanation: 'Księżyc świeci. "Księżyc" is the moon and "świeci" means "is shining".'
  },
  {
    id: 'sent_012', difficulty: 1, category: 'sentence',
    prompt: 'The night is dark.',
    answers: [['noc', 'jest', 'ciemna']],
    distractors: { random: ['pije', 'nad'], form: [], lookalike: [] },
    explanation: 'Noc jest ciemna. Noc is feminine, so "dark" is "ciemna".'
  },
  {
    id: 'sent_013', difficulty: 1, category: 'sentence',
    prompt: 'The dragon is sleeping in the castle.',
    answers: [
      ['smok', 'śpi', 'w', 'zamku'],
      ['w', 'zamku', 'śpi', 'smok']
    ],
    distractors: { random: ['czyta', 'zielona'], form: [], lookalike: [] },
    explanation: 'Smok śpi w zamku. "W" (in) changes zamek to "zamku".'
  },
  {
    id: 'sent_014', difficulty: 1, category: 'sentence',
    prompt: 'I see a ghost.',
    answers: [
      ['widzę', 'ducha'],
      ['ja', 'widzę', 'ducha']
    ],
    distractors: { random: ['śpiewają', 'przez'], form: [], lookalike: [] },
    explanation: 'Widzę ducha. After "widzę" (I see), duch changes to "ducha".'
  },
  {
    id: 'sent_015', difficulty: 1, category: 'sentence',
    prompt: 'The owl likes the night.',
    answers: [['sowa', 'lubi', 'noc']],
    distractors: { random: ['szybki', 'dla'], form: [], lookalike: [] },
    explanation: 'Sowa lubi noc. "Lubi" means "likes".'
  },
  {
    id: 'sent_016', difficulty: 1, category: 'sentence',
    prompt: 'This is a treasure.',
    answers: [['to', 'jest', 'skarb']],
    distractors: { random: ['pływa', 'pod'], form: [], lookalike: [] },
    explanation: 'To jest skarb. "To jest" means "this is", and "skarb" is treasure.'
  },
  {
    id: 'sent_017', difficulty: 1, category: 'sentence',
    prompt: 'The knight has a sword.',
    answers: [['rycerz', 'ma', 'miecz']],
    distractors: { random: ['czerwona', 'śpi'], form: [], lookalike: [] },
    explanation: 'Rycerz ma miecz. "Rycerz" is a knight and "miecz" is a sword.'
  },
  {
    id: 'sent_018', difficulty: 1, category: 'sentence',
    prompt: 'The torch is burning.',
    answers: [
      ['pochodnia', 'się', 'pali'],
      ['pochodnia', 'pali', 'się']
    ],
    distractors: { random: ['mały', 'przez'], form: [], lookalike: [] },
    explanation: 'Pochodnia się pali. "Palić się" means "to burn" - the fire is burning by itself.'
  },
  {
    id: 'sent_019', difficulty: 1, category: 'sentence',
    prompt: 'The door is closed.',
    answers: [['drzwi', 'są', 'zamknięte']],
    distractors: { random: ['jedzie', 'obok'], form: [], lookalike: [] },
    explanation: 'Drzwi są zamknięte. "Drzwi" is always plural in Polish, so we say "są", not "jest".'
  },
  {
    id: 'sent_020', difficulty: 1, category: 'sentence',
    prompt: 'The gold shines.',
    answers: [['złoto', 'błyszczy']],
    distractors: { random: ['czyta', 'zielona'], form: [], lookalike: [] },
    explanation: 'Złoto błyszczy. "Błyszczy" means "shines" or "sparkles".'
  },
  {
    id: 'sent_021', difficulty: 1, category: 'sentence',
    prompt: 'I like pumpkins.',
    answers: [
      ['lubię', 'dynie'],
      ['ja', 'lubię', 'dynie']
    ],
    distractors: { random: ['śpi', 'pod'], form: [], lookalike: [] },
    explanation: 'Lubię dynie. "Lubię" means "I like", and "dynie" means "pumpkins".'
  },
  {
    id: 'sent_022', difficulty: 1, category: 'sentence',
    prompt: 'The witch has a cat.',
    answers: [['czarownica', 'ma', 'kota']],
    distractors: { random: ['pisze', 'pod'], form: [], lookalike: [] },
    explanation: 'Czarownica ma kota. After "ma" (has), kot changes to "kota".'
  },
  {
    id: 'sent_023', difficulty: 1, category: 'sentence',
    prompt: 'The spider is on the wall.',
    answers: [
      ['pająk', 'jest', 'na', 'ścianie'],
      ['na', 'ścianie', 'jest', 'pająk']
    ],
    distractors: { random: ['śpiewa', 'mleka'], form: [], lookalike: [] },
    explanation: 'Pająk jest na ścianie. "Na" (on) changes ściana to "ścianie".'
  },
  {
    id: 'sent_024', difficulty: 1, category: 'sentence',
    prompt: 'It is night.',
    answers: [['jest', 'noc']],
    distractors: { random: ['biegnę', 'pod'], form: [], lookalike: [] },
    explanation: 'Jest noc. In Polish there is no word for "it" here - just "jest noc".'
  },
  {
    id: 'sent_025', difficulty: 1, category: 'sentence',
    prompt: 'The dragon has a treasure.',
    answers: [['smok', 'ma', 'skarb']],
    distractors: { random: ['jedzie', 'mokra'], form: [], lookalike: [] },
    explanation: 'Smok ma skarb. "Ma" means "has".'
  },
  {
    id: 'sent_026', difficulty: 1, category: 'sentence',
    prompt: 'The skeleton opens the door.',
    answers: [['szkielet', 'otwiera', 'drzwi']],
    distractors: { random: ['pływa', 'dla'], form: [], lookalike: [] },
    explanation: 'Szkielet otwiera drzwi. "Otwiera" means "opens", and "drzwi" means "door".'
  },
  {
    id: 'sent_027', difficulty: 1, category: 'sentence',
    prompt: 'The cemetery is quiet.',
    answers: [['cmentarz', 'jest', 'cichy']],
    distractors: { random: ['jabłka', 'biegną'], form: [], lookalike: [] },
    explanation: 'Cmentarz jest cichy. "Cichy" means "quiet".'
  },
  {
    id: 'sent_028', difficulty: 1, category: 'sentence',
    prompt: 'The ghosts are flying.',
    answers: [['duchy', 'latają']],
    distractors: { random: ['mała', 'pod'], form: [], lookalike: [] },
    explanation: 'Duchy latają. One ghost is "duch"; many ghosts are "duchy".'
  },
  {
    id: 'sent_029', difficulty: 1, category: 'sentence',
    prompt: 'I am afraid of spiders.',
    answers: [
      ['boję', 'się', 'pająków'],
      ['ja', 'boję', 'się', 'pająków'],
      ['ja', 'się', 'boję', 'pająków']
    ],
    distractors: { random: ['zupa', 'czyta'], form: [], lookalike: [] },
    explanation: 'Boję się pająków. "Bać się" (to be afraid) changes pająki to "pająków".'
  },
  {
    id: 'sent_030', difficulty: 1, category: 'sentence',
    prompt: 'The castle has a tower.',
    answers: [['zamek', 'ma', 'wieżę']],
    distractors: { random: ['śpiewam', 'mała'], form: [], lookalike: [] },
    explanation: 'Zamek ma wieżę. After "ma" (has), wieża changes to "wieżę".'
  },
  {
    id: 'sent_031', difficulty: 1, category: 'sentence',
    prompt: 'The bat sleeps in the daytime.',
    answers: [['nietoperz', 'śpi', 'w', 'dzień']],
    distractors: { random: ['pisze', 'zielona'], form: [], lookalike: [] },
    explanation: 'Nietoperz śpi w dzień. "W dzień" means "in the daytime".'
  },
  {
    id: 'sent_032', difficulty: 1, category: 'sentence',
    prompt: 'The owl sees the moon.',
    answers: [['sowa', 'widzi', 'księżyc']],
    distractors: { random: ['śpiewam', 'pod'], form: [], lookalike: [] },
    explanation: 'Sowa widzi księżyc. "Widzi" means "sees".'
  },
  {
    id: 'sent_033', difficulty: 1, category: 'sentence',
    prompt: 'We have gold.',
    answers: [
      ['mamy', 'złoto'],
      ['my', 'mamy', 'złoto']
    ],
    distractors: { random: ['śpi', 'pod'], form: [], lookalike: [] },
    explanation: 'Mamy złoto. "Mamy" already means "we have", so "my" can be left out.'
  },
  {
    id: 'sent_034', difficulty: 1, category: 'sentence',
    prompt: 'The witch is flying on a broom.',
    answers: [['czarownica', 'leci', 'na', 'miotle']],
    distractors: { random: ['śpię', 'mleka'], form: [], lookalike: [] },
    explanation: 'Czarownica leci na miotle. "Na" changes miotła (broom) to "miotle".'
  },
  {
    id: 'sent_035', difficulty: 1, category: 'sentence',
    prompt: 'The skeleton is scary.',
    answers: [['szkielet', 'jest', 'straszny']],
    distractors: { random: ['pływają', 'obok'], form: [], lookalike: [] },
    explanation: 'Szkielet jest straszny. "Straszny" means "scary".'
  },
  {
    id: 'sent_036', difficulty: 1, category: 'sentence',
    prompt: 'The dragon breathes fire.',
    answers: [['smok', 'zieje', 'ogniem']],
    distractors: { random: ['pisze', 'mała'], form: [], lookalike: [] },
    explanation: 'Smok zieje ogniem. "Ziać ogniem" is what dragons do - "to breathe fire".'
  },
  {
    id: 'sent_037', difficulty: 1, category: 'sentence',
    prompt: 'I am holding a torch.',
    answers: [
      ['trzymam', 'pochodnię'],
      ['ja', 'trzymam', 'pochodnię']
    ],
    distractors: { random: ['śpi', 'zielony'], form: [], lookalike: [] },
    explanation: 'Trzymam pochodnię. After "trzymam" (I hold), pochodnia changes to "pochodnię".'
  },
  {
    id: 'sent_038', difficulty: 1, category: 'sentence',
    prompt: 'The stars are shining.',
    answers: [['gwiazdy', 'świecą']],
    distractors: { random: ['czytam', 'przez'], form: [], lookalike: [] },
    explanation: 'Gwiazdy świecą. Many stars shine, so the verb is "świecą".'
  },
  {
    id: 'sent_039', difficulty: 1, category: 'sentence',
    prompt: 'The treasure is in the chest.',
    answers: [
      ['skarb', 'jest', 'w', 'skrzyni'],
      ['w', 'skrzyni', 'jest', 'skarb']
    ],
    distractors: { random: ['pije', 'zielona'], form: [], lookalike: [] },
    explanation: 'Skarb jest w skrzyni. "Skrzynia" is a chest; "w" changes it to "skrzyni".'
  },
  {
    id: 'sent_040', difficulty: 1, category: 'sentence',
    prompt: 'The pumpkin is smiling.',
    answers: [
      ['dynia', 'się', 'uśmiecha'],
      ['dynia', 'uśmiecha', 'się']
    ],
    distractors: { random: ['mały', 'przez'], form: [], lookalike: [] },
    explanation: 'Dynia się uśmiecha. "Uśmiechać się" means "to smile" and comes with "się".'
  },
  {
    id: 'sent_041', difficulty: 1, category: 'sentence',
    prompt: 'The owl flies at night.',
    answers: [['sowa', 'lata', 'w', 'nocy']],
    distractors: { random: ['zupę', 'czarny'], form: [], lookalike: [] },
    explanation: 'Sowa lata w nocy. "W nocy" means "at night".'
  },
  {
    id: 'sent_042', difficulty: 1, category: 'sentence',
    prompt: 'The knight is brave.',
    answers: [['rycerz', 'jest', 'odważny']],
    distractors: { random: ['pijemy', 'pod'], form: [], lookalike: [] },
    explanation: 'Rycerz jest odważny. "Odważny" means "brave".'
  },
  {
    id: 'sent_043', difficulty: 1, category: 'sentence',
    prompt: 'Mum is cooking soup.',
    answers: [['mama', 'gotuje', 'zupę']],
    distractors: { random: ['wysoki', 'śpią'], form: [], lookalike: [] },
    explanation: 'Mama gotuje zupę. After "gotuje" (cooks), zupa changes to "zupę".'
  },
  {
    id: 'sent_044', difficulty: 1, category: 'sentence',
    prompt: 'Dad is reading a book.',
    answers: [['tata', 'czyta', 'książkę']],
    distractors: { random: ['zielone', 'pływa'], form: [], lookalike: [] },
    explanation: 'Tata czyta książkę. After "czyta" (reads), książka changes to "książkę".'
  },
  {
    id: 'sent_045', difficulty: 1, category: 'sentence',
    prompt: 'I like ice cream.',
    answers: [
      ['lubię', 'lody'],
      ['ja', 'lubię', 'lody']
    ],
    distractors: { random: ['biegnie', 'przez'], form: [], lookalike: [] },
    explanation: 'Lubię lody. "Lody" (ice cream) is always plural in Polish.'
  },
  {
    id: 'sent_046', difficulty: 1, category: 'sentence',
    prompt: 'The dog is running.',
    answers: [['pies', 'biegnie']],
    distractors: { random: ['mleka', 'niska'], form: [], lookalike: [] },
    explanation: 'Pies biegnie. "Biegnie" means "is running".'
  },
  {
    id: 'sent_047', difficulty: 1, category: 'sentence',
    prompt: 'The sun is shining.',
    answers: [['słońce', 'świeci']],
    distractors: { random: ['ołówka', 'wysoki'], form: [], lookalike: [] },
    explanation: 'Słońce świeci. "Słońce" is the sun.'
  },
  {
    id: 'sent_048', difficulty: 1, category: 'sentence',
    prompt: 'It is raining.',
    answers: [
      ['pada', 'deszcz'],
      ['deszcz', 'pada']
    ],
    distractors: { random: ['zielona', 'czytam'], form: [], lookalike: [] },
    explanation: 'Pada deszcz. In Polish the rain "falls": "pada deszcz".'
  },
  {
    id: 'sent_049', difficulty: 1, category: 'sentence',
    prompt: 'The sky is blue.',
    answers: [['niebo', 'jest', 'niebieskie']],
    distractors: { random: ['jedzie', 'pod'], form: [], lookalike: [] },
    explanation: 'Niebo jest niebieskie. Niebo is neuter, so the colour ends in -e.'
  },
  {
    id: 'sent_050', difficulty: 1, category: 'sentence',
    prompt: 'I am drinking water.',
    answers: [
      ['piję', 'wodę'],
      ['ja', 'piję', 'wodę']
    ],
    distractors: { random: ['książka', 'obok'], form: [], lookalike: [] },
    explanation: 'Piję wodę. After "piję" (I drink), woda changes to "wodę".'
  },
  {
    id: 'sent_051', difficulty: 1, category: 'sentence',
    prompt: 'My brother is tall.',
    answers: [['mój', 'brat', 'jest', 'wysoki']],
    distractors: { random: ['pisze', 'pod'], form: [], lookalike: [] },
    explanation: 'Mój brat jest wysoki. "Wysoki" means "tall".'
  },
  {
    id: 'sent_052', difficulty: 1, category: 'sentence',
    prompt: 'The apple is red.',
    answers: [['jabłko', 'jest', 'czerwone']],
    distractors: { random: ['biegnę', 'dla'], form: [], lookalike: [] },
    explanation: 'Jabłko jest czerwone. Jabłko is neuter, so "red" is "czerwone".'
  },
  {
    id: 'sent_053', difficulty: 1, category: 'sentence',
    prompt: 'We are eating breakfast.',
    answers: [
      ['jemy', 'śniadanie'],
      ['my', 'jemy', 'śniadanie']
    ],
    distractors: { random: ['wysoka', 'pod'], form: [], lookalike: [] },
    explanation: 'Jemy śniadanie. "Jemy" already means "we eat", so "my" can be left out.'
  },
  {
    id: 'sent_054', difficulty: 1, category: 'sentence',
    prompt: 'The bird is singing.',
    answers: [['ptak', 'śpiewa']],
    distractors: { random: ['zupy', 'mokra'], form: [], lookalike: [] },
    explanation: 'Ptak śpiewa. "Ptak" is a bird and "śpiewa" means "is singing".'
  },
  {
    id: 'sent_055', difficulty: 1, category: 'sentence',
    prompt: 'Grandma has a cat.',
    answers: [['babcia', 'ma', 'kota']],
    distractors: { random: ['pływam', 'zimne'], form: [], lookalike: [] },
    explanation: 'Babcia ma kota. After "ma" (has), kot changes to "kota".'
  },
  {
    id: 'sent_056', difficulty: 1, category: 'sentence',
    prompt: 'I live in a house.',
    answers: [
      ['mieszkam', 'w', 'domu'],
      ['ja', 'mieszkam', 'w', 'domu']
    ],
    distractors: { random: ['zielona', 'pije'], form: [], lookalike: [] },
    explanation: 'Mieszkam w domu. "Mieszkam" means "I live"; "w domu" means "in a house".'
  },
  {
    id: 'sent_057', difficulty: 1, category: 'sentence',
    prompt: 'I am going to school.',
    answers: [
      ['idę', 'do', 'szkoły'],
      ['ja', 'idę', 'do', 'szkoły']
    ],
    distractors: { random: ['czerwony', 'pije'], form: [], lookalike: [] },
    explanation: 'Idę do szkoły. "Do" (to) changes szkoła to "szkoły".'
  },
  {
    id: 'sent_058', difficulty: 1, category: 'sentence',
    prompt: 'The fish is swimming.',
    answers: [['ryba', 'pływa']],
    distractors: { random: ['czytam', 'wysoki'], form: [], lookalike: [] },
    explanation: 'Ryba pływa. "Pływa" means "is swimming".'
  },
  {
    id: 'sent_059', difficulty: 1, category: 'sentence',
    prompt: 'It is cold.',
    answers: [['jest', 'zimno']],
    distractors: { random: ['śpiewa', 'dla'], form: [], lookalike: [] },
    explanation: 'Jest zimno. There is no word for "it" here - just "jest zimno".'
  },
  {
    id: 'sent_060', difficulty: 1, category: 'sentence',
    prompt: 'The grass is green.',
    answers: [['trawa', 'jest', 'zielona']],
    distractors: { random: ['pijesz', 'pod'], form: [], lookalike: [] },
    explanation: 'Trawa jest zielona. Trawa is feminine, so "green" is "zielona".'
  },
  {
    id: 'sent_061', difficulty: 1, category: 'sentence',
    prompt: 'I have a sister.',
    answers: [
      ['mam', 'siostrę'],
      ['ja', 'mam', 'siostrę']
    ],
    distractors: { random: ['biegnie', 'zimny'], form: [], lookalike: [] },
    explanation: 'Mam siostrę. After "mam" (I have), siostra changes to "siostrę".'
  },
  {
    id: 'sent_062', difficulty: 1, category: 'sentence',
    prompt: 'The baby is sleeping.',
    answers: [['dziecko', 'śpi']],
    distractors: { random: ['czerwony', 'przez'], form: [], lookalike: [] },
    explanation: 'Dziecko śpi. "Dziecko" means "baby" or "child", and "śpi" means "is sleeping".'
  },
  {
    id: 'sent_063', difficulty: 1, category: 'sentence',
    prompt: 'I love mum.',
    answers: [
      ['kocham', 'mamę'],
      ['ja', 'kocham', 'mamę']
    ],
    distractors: { random: ['pływa', 'zielony'], form: [], lookalike: [] },
    explanation: 'Kocham mamę. After "kocham" (I love), mama changes to "mamę".'
  },
  {
    id: 'sent_064', difficulty: 1, category: 'sentence',
    prompt: 'I am washing my hands.',
    answers: [
      ['myję', 'ręce'],
      ['ja', 'myję', 'ręce']
    ],
    distractors: { random: ['zielony', 'pod'], form: [], lookalike: [] },
    explanation: 'Myję ręce. In Polish we don\'t need "my" here - "myję ręce" is enough.'
  },
  {
    id: 'sent_065', difficulty: 1, category: 'sentence',
    prompt: 'The cat is sleeping on the sofa.',
    answers: [
      ['kot', 'śpi', 'na', 'kanapie'],
      ['na', 'kanapie', 'śpi', 'kot']
    ],
    distractors: { random: ['piszę', 'zielona'], form: [], lookalike: [] },
    explanation: 'Kot śpi na kanapie. "Na" (on) changes kanapa to "kanapie".'
  },
  {
    id: 'sent_066', difficulty: 1, category: 'sentence',
    prompt: 'Grandpa is writing a letter.',
    answers: [['dziadek', 'pisze', 'list']],
    distractors: { random: ['mała', 'pływam'], form: [], lookalike: [] },
    explanation: 'Dziadek pisze list. "Pisze" means "is writing" and "list" means "letter".'
  },
  {
    id: 'sent_067', difficulty: 1, category: 'sentence',
    prompt: 'The monkey is eating an apple.',
    answers: [['małpa', 'je', 'jabłko']],
    distractors: { random: ['czytamy', 'przez'], form: [], lookalike: [] },
    explanation: 'Małpa je jabłko. "Je" means "eats" or "is eating".'
  },
  {
    id: 'sent_068', difficulty: 1, category: 'sentence',
    prompt: 'I am eating bread.',
    answers: [
      ['jem', 'chleb'],
      ['ja', 'jem', 'chleb']
    ],
    distractors: { random: ['śpi', 'zielona'], form: [], lookalike: [] },
    explanation: 'Jem chleb. "Jem" already means "I eat", so "ja" can be left out.'
  },
  {
    id: 'sent_069', difficulty: 1, category: 'sentence',
    prompt: 'The horse is running fast.',
    answers: [
      ['koń', 'szybko', 'biegnie'],
      ['koń', 'biegnie', 'szybko']
    ],
    distractors: { random: ['pisze', 'pod'], form: [], lookalike: [] },
    explanation: 'Koń szybko biegnie. "Szybko" means "fast"; it can go before or after the verb.'
  },
  {
    id: 'sent_070', difficulty: 1, category: 'sentence',
    prompt: 'The window is open.',
    answers: [['okno', 'jest', 'otwarte']],
    distractors: { random: ['śpiewam', 'dla'], form: [], lookalike: [] },
    explanation: 'Okno jest otwarte. Okno is neuter, so "open" is "otwarte".'
  },
  {
    id: 'sent_071', difficulty: 1, category: 'sentence',
    prompt: 'We like music.',
    answers: [
      ['lubimy', 'muzykę'],
      ['my', 'lubimy', 'muzykę']
    ],
    distractors: { random: ['biegnie', 'zimny'], form: [], lookalike: [] },
    explanation: 'Lubimy muzykę. After "lubimy" (we like), muzyka changes to "muzykę".'
  },
  {
    id: 'sent_072', difficulty: 1, category: 'sentence',
    prompt: 'The girl likes flowers.',
    answers: [['dziewczynka', 'lubi', 'kwiaty']],
    distractors: { random: ['piję', 'obok'], form: [], lookalike: [] },
    explanation: 'Dziewczynka lubi kwiaty. One flower is "kwiat"; many flowers are "kwiaty".'
  },
  {
    id: 'sent_073', difficulty: 1, category: 'sentence',
    prompt: 'Dad is driving the car.',
    answers: [['tata', 'prowadzi', 'samochód']],
    distractors: { random: ['zielona', 'śpię'], form: [], lookalike: [] },
    explanation: 'Tata prowadzi samochód. "Prowadzić samochód" means "to drive a car".'
  },
  {
    id: 'sent_074', difficulty: 1, category: 'sentence',
    prompt: 'The book is on the table.',
    answers: [
      ['książka', 'jest', 'na', 'stole'],
      ['na', 'stole', 'jest', 'książka']
    ],
    distractors: { random: ['pływa', 'zimny'], form: [], lookalike: [] },
    explanation: 'Książka jest na stole. "Na" (on) changes stół to "stole".'
  },
  {
    id: 'sent_075', difficulty: 1, category: 'sentence',
    prompt: 'The cow gives milk.',
    answers: [['krowa', 'daje', 'mleko']],
    distractors: { random: ['wysoki', 'przez'], form: [], lookalike: [] },
    explanation: 'Krowa daje mleko. "Daje" means "gives".'
  },
  {
    id: 'sent_076', difficulty: 1, category: 'sentence',
    prompt: 'The children are playing.',
    answers: [
      ['dzieci', 'się', 'bawią'],
      ['dzieci', 'bawią', 'się']
    ],
    distractors: { random: ['pijemy', 'pod'], form: [], lookalike: [] },
    explanation: 'Dzieci się bawią. "Bawić się" means "to play" and comes with "się".'
  },
  {
    id: 'sent_077', difficulty: 1, category: 'sentence',
    prompt: 'My dog is brown.',
    answers: [['mój', 'pies', 'jest', 'brązowy']],
    distractors: { random: ['czyta', 'zielona'], form: [], lookalike: [] },
    explanation: 'Mój pies jest brązowy. "Brązowy" means "brown".'
  },
  {
    id: 'sent_078', difficulty: 1, category: 'sentence',
    prompt: 'Mum is singing.',
    answers: [['mama', 'śpiewa']],
    distractors: { random: ['zimny', 'obok'], form: [], lookalike: [] },
    explanation: 'Mama śpiewa. "Śpiewa" means "is singing".'
  },
  {
    id: 'sent_079', difficulty: 1, category: 'sentence',
    prompt: 'Grandma is baking a cake.',
    answers: [['babcia', 'piecze', 'ciasto']],
    distractors: { random: ['śpiewają', 'pod'], form: [], lookalike: [] },
    explanation: 'Babcia piecze ciasto. "Piecze" means "bakes" and "ciasto" means "cake".'
  },
  {
    id: 'sent_080', difficulty: 1, category: 'sentence',
    prompt: 'I am playing ball.',
    answers: [
      ['gram', 'w', 'piłkę'],
      ['ja', 'gram', 'w', 'piłkę']
    ],
    distractors: { random: ['zupa', 'czerwony'], form: [], lookalike: [] },
    explanation: 'Gram w piłkę. We play "w" a game: "grać w piłkę" means "to play ball".'
  },

  // --- Difficulty 2 ---
  {
    id: 'sent_101', difficulty: 2, category: 'sentence',
    prompt: 'I see a big house.',
    answers: [
      ['widzę', 'duży', 'dom'],
      ['ja', 'widzę', 'duży', 'dom']
    ],
    distractors: { random: ['kwiat', 'wolno'], form: ['domu', 'duża'], lookalike: [] },
    explanation: 'Widzę duży dom. Dom is masculine, so it takes "duży", not "duża".'
  },
  {
    id: 'sent_102', difficulty: 2, category: 'sentence',
    prompt: 'We are going to school.',
    answers: [
      ['idziemy', 'do', 'szkoły'],
      ['my', 'idziemy', 'do', 'szkoły']
    ],
    distractors: { random: ['ser', 'wysoko'], form: ['szkoła', 'idą'], lookalike: [] },
    explanation: 'Idziemy do szkoły. "Do" takes the genitive: szkoła → szkoły. "Idą" means "they go".'
  },
  {
    id: 'sent_103', difficulty: 2, category: 'sentence',
    prompt: 'My sister likes apples.',
    answers: [
      ['moja', 'siostra', 'lubi', 'jabłka']
    ],
    distractors: { random: ['okno', 'zimno'], form: ['siostry', 'lubię'], lookalike: [] },
    explanation: 'Moja siostra lubi jabłka. "Lubię" means "I like"; she likes = "lubi".'
  },
  {
    id: 'sent_104', difficulty: 2, category: 'sentence',
    prompt: 'The dragon sleeps in a cave.',
    answers: [
      ['smok', 'śpi', 'w', 'jaskini']
    ],
    distractors: { random: ['ołówek', 'banan'], form: ['jaskinia', 'śpią'], lookalike: [] },
    explanation: 'Smok śpi w jaskini. After "w" (in) jaskinia changes to "jaskini". "Śpią" means "they sleep".'
  },
  {
    id: 'sent_105', difficulty: 2, category: 'sentence',
    prompt: 'The owl has a golden key.',
    answers: [
      ['sowa', 'ma', 'złoty', 'klucz']
    ],
    distractors: { random: ['zupa', 'rower'], form: ['złota', 'klucza'], lookalike: [] },
    explanation: 'Sowa ma złoty klucz. Klucz is masculine, so it is "złoty". After "ma" the key stays "klucz".'
  },
  {
    id: 'sent_106', difficulty: 2, category: 'sentence',
    prompt: 'The ghost is afraid of the dark.',
    answers: [
      ['duch', 'boi', 'się', 'ciemności']
    ],
    distractors: { random: ['kanapka', 'krzesło'], form: ['ciemność', 'boją'], lookalike: [] },
    explanation: 'Duch boi się ciemności. "Bać się" takes the genitive: ciemność → ciemności. "Boją" means "they are afraid".'
  },
  {
    id: 'sent_107', difficulty: 2, category: 'sentence',
    prompt: 'The witch is making a potion.',
    answers: [
      ['czarownica', 'robi', 'eliksir']
    ],
    distractors: { random: ['sweter', 'talerz'], form: ['eliksiru', 'robią'], lookalike: [] },
    explanation: 'Czarownica robi eliksir. One witch "robi"; "robią" is for many. What does she make? Eliksir - no change.'
  },
  {
    id: 'sent_108', difficulty: 2, category: 'sentence',
    prompt: 'The knight has a long sword.',
    answers: [
      ['rycerz', 'ma', 'długi', 'miecz']
    ],
    distractors: { random: ['mleko', 'okno'], form: ['długa', 'miecza'], lookalike: [] },
    explanation: 'Rycerz ma długi miecz. Miecz is masculine, so it is "długi", not "długa".'
  },
  {
    id: 'sent_109', difficulty: 2, category: 'sentence',
    prompt: 'The skeleton walks to the castle.',
    answers: [
      ['szkielet', 'idzie', 'do', 'zamku']
    ],
    distractors: { random: ['cukier', 'pomidor'], form: ['zamek', 'idę'], lookalike: [] },
    explanation: 'Szkielet idzie do zamku. "Do" takes the genitive: zamek → zamku. "Idę" means "I go".'
  },
  {
    id: 'sent_110', difficulty: 2, category: 'sentence',
    prompt: 'There is no gold in the chest.',
    answers: [
      ['w', 'skrzyni', 'nie', 'ma', 'złota'],
      ['nie', 'ma', 'złota', 'w', 'skrzyni']
    ],
    distractors: { random: ['poduszka', 'deszcz'], form: ['złoto', 'skrzynia'], lookalike: [] },
    explanation: 'W skrzyni nie ma złota. After "nie ma" we use the genitive: złoto → złota. After "w": skrzynia → skrzyni.'
  },
  {
    id: 'sent_111', difficulty: 2, category: 'sentence',
    prompt: 'The bat flies at night.',
    answers: [
      ['nietoperz', 'lata', 'w', 'nocy'],
      ['w', 'nocy', 'nietoperz', 'lata']
    ],
    distractors: { random: ['masło', 'stół'], form: ['noc', 'latają'], lookalike: [] },
    explanation: 'Nietoperz lata w nocy. "At night" is "w nocy", not "w noc". One bat "lata"; many bats "latają".'
  },
  {
    id: 'sent_112', difficulty: 2, category: 'sentence',
    prompt: 'The knight is looking for the key.',
    answers: [
      ['rycerz', 'szuka', 'klucza']
    ],
    distractors: { random: ['marchewka', 'spodnie'], form: ['klucz', 'szukam'], lookalike: [] },
    explanation: 'Rycerz szuka klucza. "Szukać" takes the genitive: klucz → klucza. "Szukam" means "I am looking".'
  },
  {
    id: 'sent_113', difficulty: 2, category: 'sentence',
    prompt: 'The pumpkin is orange.',
    answers: [
      ['dynia', 'jest', 'pomarańczowa']
    ],
    distractors: { random: ['pióro', 'śnieg'], form: ['pomarańczowy', 'dyni'], lookalike: [] },
    explanation: 'Dynia jest pomarańczowa. Dynia is feminine, so the colour ends in -a: pomarańczowa.'
  },
  {
    id: 'sent_114', difficulty: 2, category: 'sentence',
    prompt: 'The spider has eight legs.',
    answers: [
      ['pająk', 'ma', 'osiem', 'nóg']
    ],
    distractors: { random: ['chleb', 'okulary'], form: ['nogi', 'mają'], lookalike: [] },
    explanation: 'Pająk ma osiem nóg. After numbers from five up we use the genitive plural: nogi → nóg.'
  },
  {
    id: 'sent_115', difficulty: 2, category: 'sentence',
    prompt: 'We are going into the crypt.',
    answers: [
      ['idziemy', 'do', 'krypty'],
      ['my', 'idziemy', 'do', 'krypty']
    ],
    distractors: { random: ['mydło', 'telefon'], form: ['krypta', 'idziesz'], lookalike: [] },
    explanation: 'Idziemy do krypty. "Do" takes the genitive: krypta → krypty. "Idziesz" means "you go".'
  },
  {
    id: 'sent_116', difficulty: 2, category: 'sentence',
    prompt: 'The moon is big and round.',
    answers: [
      ['księżyc', 'jest', 'duży', 'i', 'okrągły']
    ],
    distractors: { random: ['zeszyt', 'marchew'], form: ['duża', 'okrągła'], lookalike: [] },
    explanation: 'Księżyc jest duży i okrągły. Księżyc is masculine, so both words end in -y.'
  },
  {
    id: 'sent_117', difficulty: 2, category: 'sentence',
    prompt: 'The door is closed.',
    answers: [
      ['drzwi', 'są', 'zamknięte']
    ],
    distractors: { random: ['mleko', 'ptak'], form: ['jest', 'zamknięty'], lookalike: [] },
    explanation: 'Drzwi są zamknięte. In Polish "drzwi" is always plural, so we say "są" and "zamknięte".'
  },
  {
    id: 'sent_118', difficulty: 2, category: 'sentence',
    prompt: 'I have a magic potion.',
    answers: [
      ['mam', 'magiczny', 'eliksir'],
      ['ja', 'mam', 'magiczny', 'eliksir']
    ],
    distractors: { random: ['spodnie', 'deszcz'], form: ['magiczna', 'ma'], lookalike: [] },
    explanation: 'Mam magiczny eliksir. Eliksir is masculine, so it is "magiczny". "Ma" means "he has" or "she has".'
  },
  {
    id: 'sent_119', difficulty: 2, category: 'sentence',
    prompt: 'The treasure is in the castle.',
    answers: [
      ['skarb', 'jest', 'w', 'zamku']
    ],
    distractors: { random: ['herbata', 'nos'], form: ['zamek', 'do'], lookalike: [] },
    explanation: 'Skarb jest w zamku. "In" a place is "w" + locative: zamek → zamku. "Do" means "to", for going somewhere.'
  },
  {
    id: 'sent_120', difficulty: 2, category: 'sentence',
    prompt: 'The ghost lives in an old house.',
    answers: [
      ['duch', 'mieszka', 'w', 'starym', 'domu']
    ],
    distractors: { random: ['cytryna', 'kalosze'], form: ['stary', 'dom'], lookalike: [] },
    explanation: 'Duch mieszka w starym domu. After "w" (in) both words change: stary dom → starym domu.'
  },
  {
    id: 'sent_121', difficulty: 2, category: 'sentence',
    prompt: 'The skeleton has no head.',
    answers: [
      ['szkielet', 'nie', 'ma', 'głowy']
    ],
    distractors: { random: ['ser', 'lampa'], form: ['głowa', 'mają'], lookalike: [] },
    explanation: 'Szkielet nie ma głowy. After "nie ma" we use the genitive: głowa → głowy.'
  },
  {
    id: 'sent_122', difficulty: 2, category: 'sentence',
    prompt: 'The witch has a black cat.',
    answers: [
      ['czarownica', 'ma', 'czarnego', 'kota']
    ],
    distractors: { random: ['ogórek', 'krzesło'], form: ['czarny', 'kot'], lookalike: [] },
    explanation: 'Czarownica ma czarnego kota. A cat is alive, so after "ma" kot → kota and czarny → czarnego.'
  },
  {
    id: 'sent_123', difficulty: 2, category: 'sentence',
    prompt: 'The dragon eats gold.',
    answers: [
      ['smok', 'je', 'złoto']
    ],
    distractors: { random: ['parasol', 'kredka'], form: ['złotem', 'jedzą'], lookalike: [] },
    explanation: 'Smok je złoto. What does he eat? Złoto - no change. One dragon "je"; many dragons "jedzą".'
  },
  {
    id: 'sent_124', difficulty: 2, category: 'sentence',
    prompt: 'The knight is holding a torch.',
    answers: [
      ['rycerz', 'trzyma', 'pochodnię']
    ],
    distractors: { random: ['cebula', 'ławka'], form: ['pochodnia', 'trzymam'], lookalike: [] },
    explanation: 'Rycerz trzyma pochodnię. What is he holding? Pochodnia → pochodnię. "Trzymam" means "I hold".'
  },
  {
    id: 'sent_125', difficulty: 2, category: 'sentence',
    prompt: 'The owl opens the door.',
    answers: [
      ['sowa', 'otwiera', 'drzwi']
    ],
    distractors: { random: ['banan', 'chmura'], form: ['otwieram', 'drzwiami'], lookalike: [] },
    explanation: 'Sowa otwiera drzwi. What does she open? Drzwi - no change. "Otwieram" means "I open".'
  },
  {
    id: 'sent_126', difficulty: 2, category: 'sentence',
    prompt: 'Bats live in the tower.',
    answers: [
      ['nietoperze', 'mieszkają', 'w', 'wieży']
    ],
    distractors: { random: ['pomarańcza', 'dywan'], form: ['mieszka', 'wieża'], lookalike: [] },
    explanation: 'Nietoperze mieszkają w wieży. Many bats "mieszkają". After "w" (in): wieża → wieży.'
  },
  {
    id: 'sent_127', difficulty: 2, category: 'sentence',
    prompt: 'The cemetery is dark and quiet.',
    answers: [
      ['cmentarz', 'jest', 'ciemny', 'i', 'cichy']
    ],
    distractors: { random: ['kanapa', 'długopis'], form: ['ciemna', 'cicha'], lookalike: [] },
    explanation: 'Cmentarz jest ciemny i cichy. Cmentarz is masculine, so both words end in -y.'
  },
  {
    id: 'sent_128', difficulty: 2, category: 'sentence',
    prompt: 'We are afraid of the dragon.',
    answers: [
      ['boimy', 'się', 'smoka'],
      ['my', 'boimy', 'się', 'smoka']
    ],
    distractors: { random: ['zupa', 'but'], form: ['smok', 'boją'], lookalike: [] },
    explanation: 'Boimy się smoka. "Bać się" takes the genitive: smok → smoka. "Boją" means "they are afraid".'
  },
  {
    id: 'sent_129', difficulty: 2, category: 'sentence',
    prompt: 'The knight goes without a sword.',
    answers: [
      ['rycerz', 'idzie', 'bez', 'miecza']
    ],
    distractors: { random: ['ciasto', 'gruszka'], form: ['miecz', 'z'], lookalike: [] },
    explanation: 'Rycerz idzie bez miecza. "Bez" (without) takes the genitive: miecz → miecza. "Z" means "with".'
  },
  {
    id: 'sent_130', difficulty: 2, category: 'sentence',
    prompt: 'The spider is sitting on the wall.',
    answers: [
      ['pająk', 'siedzi', 'na', 'ścianie']
    ],
    distractors: { random: ['koc', 'sałata'], form: ['ściana', 'siedzą'], lookalike: [] },
    explanation: 'Pająk siedzi na ścianie. "On" a place is "na" + locative: ściana → ścianie.'
  },
  {
    id: 'sent_131', difficulty: 2, category: 'sentence',
    prompt: 'The ghost is flying to the moon.',
    answers: [
      ['duch', 'leci', 'na', 'księżyc']
    ],
    distractors: { random: ['widelec', 'kapusta'], form: ['księżyca', 'lecą'], lookalike: [] },
    explanation: 'Duch leci na księżyc. Flying "na" somewhere takes the accusative: księżyc stays księżyc. "Lecą" means "they fly".'
  },
  {
    id: 'sent_132', difficulty: 2, category: 'sentence',
    prompt: 'The dragon has big wings.',
    answers: [
      ['smok', 'ma', 'duże', 'skrzydła']
    ],
    distractors: { random: ['jogurt', 'szalik'], form: ['duży', 'skrzydeł'], lookalike: [] },
    explanation: 'Smok ma duże skrzydła. Skrzydła is plural, so it is "duże", not "duży".'
  },
  {
    id: 'sent_133', difficulty: 2, category: 'sentence',
    prompt: 'The witch is flying on a broom.',
    answers: [
      ['czarownica', 'leci', 'na', 'miotle']
    ],
    distractors: { random: ['ryż', 'wazon'], form: ['miotłę', 'lecą'], lookalike: [] },
    explanation: 'Czarownica leci na miotle. Riding "on" something is "na" + locative: miotła → miotle.'
  },
  {
    id: 'sent_134', difficulty: 2, category: 'sentence',
    prompt: 'The owl found a treasure.',
    answers: [
      ['sowa', 'znalazła', 'skarb']
    ],
    distractors: { random: ['kubek', 'ziemniak'], form: ['znalazł', 'skarbu'], lookalike: [] },
    explanation: 'Sowa znalazła skarb. Sowa is feminine, so in the past it is "znalazła", not "znalazł".'
  },
  {
    id: 'sent_135', difficulty: 2, category: 'sentence',
    prompt: 'The skeleton was dancing in the crypt.',
    answers: [
      ['szkielet', 'tańczył', 'w', 'krypcie']
    ],
    distractors: { random: ['herbatnik', 'lustro'], form: ['tańczyła', 'krypta'], lookalike: [] },
    explanation: 'Szkielet tańczył w krypcie. Szkielet is masculine, so it is "tańczył". After "w" (in): krypta → krypcie.'
  },
  {
    id: 'sent_136', difficulty: 2, category: 'sentence',
    prompt: 'The ghost opened the door.',
    answers: [
      ['duch', 'otworzył', 'drzwi']
    ],
    distractors: { random: ['makaron', 'kredka'], form: ['otworzyła', 'drzwiach'], lookalike: [] },
    explanation: 'Duch otworzył drzwi. Duch is masculine, so in the past it is "otworzył", not "otworzyła".'
  },
  {
    id: 'sent_137', difficulty: 2, category: 'sentence',
    prompt: 'The candle is in the pumpkin.',
    answers: [
      ['świeca', 'jest', 'w', 'dyni']
    ],
    distractors: { random: ['plecak', 'grzebień'], form: ['dynia', 'świecę'], lookalike: [] },
    explanation: 'Świeca jest w dyni. After "w" (in): dynia → dyni. The candle is the subject, so it stays "świeca".'
  },
  {
    id: 'sent_138', difficulty: 2, category: 'sentence',
    prompt: 'The knight drinks the potion.',
    answers: [
      ['rycerz', 'pije', 'eliksir']
    ],
    distractors: { random: ['kalafior', 'dzwonek'], form: ['eliksirem', 'piją'], lookalike: [] },
    explanation: 'Rycerz pije eliksir. What does he drink? Eliksir - no change. "Piją" means "they drink".'
  },
  {
    id: 'sent_139', difficulty: 2, category: 'sentence',
    prompt: 'The dragon was flying over the castle.',
    answers: [
      ['smok', 'leciał', 'nad', 'zamkiem']
    ],
    distractors: { random: ['mydło', 'kalendarz'], form: ['zamek', 'leciała'], lookalike: [] },
    explanation: 'Smok leciał nad zamkiem. "Nad" (over) takes the instrumental: zamek → zamkiem. Smok is masculine, so "leciał".'
  },
  {
    id: 'sent_140', difficulty: 2, category: 'sentence',
    prompt: 'The key is under the stone.',
    answers: [
      ['klucz', 'jest', 'pod', 'kamieniem']
    ],
    distractors: { random: ['skarpetka', 'truskawka'], form: ['kamień', 'na'], lookalike: [] },
    explanation: 'Klucz jest pod kamieniem. "Pod" (under) takes the instrumental: kamień → kamieniem. "Na" means "on".'
  },
  {
    id: 'sent_141', difficulty: 2, category: 'sentence',
    prompt: 'Dad is reading a newspaper.',
    answers: [
      ['tata', 'czyta', 'gazetę']
    ],
    distractors: { random: ['ogon', 'łyżka'], form: ['gazeta', 'czytam'], lookalike: [] },
    explanation: 'Tata czyta gazetę. What is he reading? Gazeta → gazetę. "Czytam" means "I read".'
  },
  {
    id: 'sent_142', difficulty: 2, category: 'sentence',
    prompt: 'My brother has a new bike.',
    answers: [
      ['mój', 'brat', 'ma', 'nowy', 'rower']
    ],
    distractors: { random: ['chmura', 'ser'], form: ['moja', 'nowa'], lookalike: [] },
    explanation: 'Mój brat ma nowy rower. Brat and rower are masculine: "mój" and "nowy".'
  },
  {
    id: 'sent_143', difficulty: 2, category: 'sentence',
    prompt: 'We eat soup with bread.',
    answers: [
      ['jemy', 'zupę', 'z', 'chlebem'],
      ['my', 'jemy', 'zupę', 'z', 'chlebem']
    ],
    distractors: { random: ['okno', 'buty'], form: ['zupa', 'chleb'], lookalike: [] },
    explanation: 'Jemy zupę z chlebem. What do we eat? Zupa → zupę. "Z" (with) takes the instrumental: chleb → chlebem.'
  },
  {
    id: 'sent_144', difficulty: 2, category: 'sentence',
    prompt: 'Grandma drinks tea without sugar.',
    answers: [
      ['babcia', 'pije', 'herbatę', 'bez', 'cukru']
    ],
    distractors: { random: ['nos', 'kredka'], form: ['cukier', 'herbata'], lookalike: [] },
    explanation: 'Babcia pije herbatę bez cukru. "Bez" (without) takes the genitive: cukier → cukru. What does she drink? Herbatę.'
  },
  {
    id: 'sent_145', difficulty: 2, category: 'sentence',
    prompt: 'The dog is playing with a ball.',
    answers: [
      ['pies', 'bawi', 'się', 'piłką']
    ],
    distractors: { random: ['zeszyt', 'deszcz'], form: ['piłka', 'psa'], lookalike: [] },
    explanation: 'Pies bawi się piłką. "Bawić się" + the thing you play with in the instrumental: piłka → piłką.'
  },
  {
    id: 'sent_146', difficulty: 2, category: 'sentence',
    prompt: 'I like hot chocolate.',
    answers: [
      ['lubię', 'gorącą', 'czekoladę'],
      ['ja', 'lubię', 'gorącą', 'czekoladę']
    ],
    distractors: { random: ['samochód', 'kaczka'], form: ['gorący', 'czekolada'], lookalike: [] },
    explanation: 'Lubię gorącą czekoladę. After "lubię" czekolada → czekoladę, and its adjective too: gorąca → gorącą.'
  },
  {
    id: 'sent_147', difficulty: 2, category: 'sentence',
    prompt: 'Snow is white and cold.',
    answers: [
      ['śnieg', 'jest', 'biały', 'i', 'zimny']
    ],
    distractors: { random: ['krzesło', 'gwiazda'], form: ['biała', 'zimna'], lookalike: [] },
    explanation: 'Śnieg jest biały i zimny. Śnieg is masculine, so both words end in -y.'
  },
  {
    id: 'sent_148', difficulty: 2, category: 'sentence',
    prompt: 'My mum is a teacher.',
    answers: [
      ['moja', 'mama', 'jest', 'nauczycielką']
    ],
    distractors: { random: ['jabłko', 'autobus'], form: ['nauczycielka', 'mój'], lookalike: [] },
    explanation: 'Moja mama jest nauczycielką. After "jest" a job takes the instrumental: nauczycielka → nauczycielką.'
  },
  {
    id: 'sent_149', difficulty: 2, category: 'sentence',
    prompt: 'The children are going to the park.',
    answers: [
      ['dzieci', 'idą', 'do', 'parku']
    ],
    distractors: { random: ['miska', 'lew'], form: ['park', 'idzie'], lookalike: [] },
    explanation: 'Dzieci idą do parku. Dzieci are many, so "idą". "Do" takes the genitive: park → parku.'
  },
  {
    id: 'sent_150', difficulty: 2, category: 'sentence',
    prompt: 'The cat sleeps on the sofa.',
    answers: [
      ['kot', 'śpi', 'na', 'kanapie']
    ],
    distractors: { random: ['marchewka', 'długopis'], form: ['kanapa', 'śpię'], lookalike: [] },
    explanation: 'Kot śpi na kanapie. "On" a place is "na" + locative: kanapa → kanapie. "Śpię" means "I sleep".'
  },
  {
    id: 'sent_151', difficulty: 2, category: 'sentence',
    prompt: 'I live in a small house.',
    answers: [
      ['mieszkam', 'w', 'małym', 'domu'],
      ['ja', 'mieszkam', 'w', 'małym', 'domu']
    ],
    distractors: { random: ['kurtka', 'mleko'], form: ['mały', 'mieszka'], lookalike: [] },
    explanation: 'Mieszkam w małym domu. After "w" (in): mały dom → małym domu. "Mieszka" means "he lives" or "she lives".'
  },
  {
    id: 'sent_152', difficulty: 2, category: 'sentence',
    prompt: 'My dog likes bones.',
    answers: [
      ['mój', 'pies', 'lubi', 'kości']
    ],
    distractors: { random: ['tablica', 'sok'], form: ['moja', 'lubię'], lookalike: [] },
    explanation: 'Mój pies lubi kości. Pies is masculine, so "mój". "Lubię" means "I like"; he likes = "lubi".'
  },
  {
    id: 'sent_153', difficulty: 2, category: 'sentence',
    prompt: 'We have a cat and a dog.',
    answers: [
      ['mamy', 'kota', 'i', 'psa'],
      ['my', 'mamy', 'kota', 'i', 'psa']
    ],
    distractors: { random: ['stół', 'niebo'], form: ['kot', 'pies'], lookalike: [] },
    explanation: 'Mamy kota i psa. Animals after "mamy" change: kot → kota, pies → psa.'
  },
  {
    id: 'sent_154', difficulty: 2, category: 'sentence',
    prompt: 'The bird is sitting on the tree.',
    answers: [
      ['ptak', 'siedzi', 'na', 'drzewie']
    ],
    distractors: { random: ['herbata', 'okulary'], form: ['drzewo', 'siedzą'], lookalike: [] },
    explanation: 'Ptak siedzi na drzewie. "On" a place is "na" + locative: drzewo → drzewie.'
  },
  {
    id: 'sent_155', difficulty: 2, category: 'sentence',
    prompt: 'Grandpa is sitting in the garden.',
    answers: [
      ['dziadek', 'siedzi', 'w', 'ogrodzie']
    ],
    distractors: { random: ['nożyczki', 'balon'], form: ['ogród', 'siedzę'], lookalike: [] },
    explanation: 'Dziadek siedzi w ogrodzie. After "w" (in): ogród → ogrodzie. "Siedzę" means "I sit".'
  },
  {
    id: 'sent_156', difficulty: 2, category: 'sentence',
    prompt: 'I drink milk with honey.',
    answers: [
      ['piję', 'mleko', 'z', 'miodem'],
      ['ja', 'piję', 'mleko', 'z', 'miodem']
    ],
    distractors: { random: ['kapelusz', 'ławka'], form: ['miód', 'pije'], lookalike: [] },
    explanation: 'Piję mleko z miodem. "Z" (with) takes the instrumental: miód → miodem. "Pije" means "he drinks"; I drink = "piję".'
  },
  {
    id: 'sent_157', difficulty: 2, category: 'sentence',
    prompt: 'The teacher has a red book.',
    answers: [
      ['nauczyciel', 'ma', 'czerwoną', 'książkę']
    ],
    distractors: { random: ['rower', 'kaczka'], form: ['czerwona', 'książka'], lookalike: [] },
    explanation: 'Nauczyciel ma czerwoną książkę. After "ma" książka → książkę, and czerwona → czerwoną.'
  },
  {
    id: 'sent_158', difficulty: 2, category: 'sentence',
    prompt: 'My parents are at work.',
    answers: [
      ['moi', 'rodzice', 'są', 'w', 'pracy']
    ],
    distractors: { random: ['cebula', 'kotlet'], form: ['praca', 'jest'], lookalike: [] },
    explanation: 'Moi rodzice są w pracy. Rodzice are two people, so "są". "At work" is "w pracy".'
  },
  {
    id: 'sent_159', difficulty: 2, category: 'sentence',
    prompt: 'The fish swims in the water.',
    answers: [
      ['ryba', 'pływa', 'w', 'wodzie']
    ],
    distractors: { random: ['poduszka', 'zegar'], form: ['woda', 'pływają'], lookalike: [] },
    explanation: 'Ryba pływa w wodzie. After "w" (in): woda → wodzie. One fish "pływa"; many fish "pływają".'
  },
  {
    id: 'sent_160', difficulty: 2, category: 'sentence',
    prompt: 'I am going to the shop.',
    answers: [
      ['idę', 'do', 'sklepu'],
      ['ja', 'idę', 'do', 'sklepu']
    ],
    distractors: { random: ['grzyb', 'czapka'], form: ['sklep', 'w'], lookalike: [] },
    explanation: 'Idę do sklepu. Going "to" a place is "do" + genitive: sklep → sklepu.'
  },
  {
    id: 'sent_161', difficulty: 2, category: 'sentence',
    prompt: 'The cat was drinking milk.',
    answers: [
      ['kot', 'pił', 'mleko']
    ],
    distractors: { random: ['wiadro', 'piórnik'], form: ['piła', 'mlekiem'], lookalike: [] },
    explanation: 'Kot pił mleko. Kot is masculine, so in the past it is "pił", not "piła".'
  },
  {
    id: 'sent_162', difficulty: 2, category: 'sentence',
    prompt: 'Mum baked a cake.',
    answers: [
      ['mama', 'upiekła', 'ciasto']
    ],
    distractors: { random: ['kamień', 'drabina'], form: ['upiekł', 'ciastem'], lookalike: [] },
    explanation: 'Mama upiekła ciasto. Mama is feminine, so in the past it is "upiekła", not "upiekł".'
  },
  {
    id: 'sent_163', difficulty: 2, category: 'sentence',
    prompt: 'The children were playing in the snow.',
    answers: [
      ['dzieci', 'bawiły', 'się', 'w', 'śniegu']
    ],
    distractors: { random: ['lampa', 'widelec'], form: ['bawił', 'śnieg'], lookalike: [] },
    explanation: 'Dzieci bawiły się w śniegu. Dzieci are many, so "bawiły". After "w" (in): śnieg → śniegu.'
  },
  {
    id: 'sent_164', difficulty: 2, category: 'sentence',
    prompt: 'My grandma has a little rabbit.',
    answers: [
      ['moja', 'babcia', 'ma', 'małego', 'królika']
    ],
    distractors: { random: ['zupa', 'okno'], form: ['mój', 'mały'], lookalike: [] },
    explanation: 'Moja babcia ma małego królika. A rabbit is alive, so after "ma" mały królik → małego królika.'
  },
  {
    id: 'sent_165', difficulty: 2, category: 'sentence',
    prompt: 'The boy is writing a letter.',
    answers: [
      ['chłopiec', 'pisze', 'list']
    ],
    distractors: { random: ['banan', 'kołdra'], form: ['listu', 'piszę'], lookalike: [] },
    explanation: 'Chłopiec pisze list. What is he writing? List - no change. "Piszę" means "I write".'
  },
  {
    id: 'sent_166', difficulty: 2, category: 'sentence',
    prompt: 'The girl is eating an apple.',
    answers: [
      ['dziewczynka', 'je', 'jabłko']
    ],
    distractors: { random: ['krzesło', 'pociąg'], form: ['jabłkiem', 'jedzą'], lookalike: [] },
    explanation: 'Dziewczynka je jabłko. What is she eating? Jabłko - no change. "Jedzą" means "they eat".'
  },
  {
    id: 'sent_167', difficulty: 2, category: 'sentence',
    prompt: 'There is no milk in the fridge.',
    answers: [
      ['w', 'lodówce', 'nie', 'ma', 'mleka'],
      ['nie', 'ma', 'mleka', 'w', 'lodówce']
    ],
    distractors: { random: ['słoń', 'gitara'], form: ['mleko', 'lodówka'], lookalike: [] },
    explanation: 'W lodówce nie ma mleka. After "nie ma" we use the genitive: mleko → mleka. After "w": lodówka → lodówce.'
  },
  {
    id: 'sent_168', difficulty: 2, category: 'sentence',
    prompt: 'The horse runs fast.',
    answers: [
      ['koń', 'biega', 'szybko'],
      ['koń', 'szybko', 'biega']
    ],
    distractors: { random: ['poduszka', 'zeszyt'], form: ['biegają', 'konia'], lookalike: [] },
    explanation: 'Koń biega szybko. One horse "biega"; many horses "biegają". The horse is the subject, so it stays "koń".'
  },
  {
    id: 'sent_169', difficulty: 2, category: 'sentence',
    prompt: 'I have a blue pencil.',
    answers: [
      ['mam', 'niebieski', 'ołówek'],
      ['ja', 'mam', 'niebieski', 'ołówek']
    ],
    distractors: { random: ['ryba', 'chmura'], form: ['niebieska', 'ołówka'], lookalike: [] },
    explanation: 'Mam niebieski ołówek. Ołówek is masculine, so it is "niebieski", not "niebieska".'
  },
  {
    id: 'sent_170', difficulty: 2, category: 'sentence',
    prompt: 'The dog sleeps under the table.',
    answers: [
      ['pies', 'śpi', 'pod', 'stołem']
    ],
    distractors: { random: ['koszula', 'gruszka'], form: ['stół', 'na'], lookalike: [] },
    explanation: 'Pies śpi pod stołem. "Pod" (under) takes the instrumental: stół → stołem. "Na" means "on".'
  },
  {
    id: 'sent_171', difficulty: 2, category: 'sentence',
    prompt: 'The sky is grey and cloudy.',
    answers: [
      ['niebo', 'jest', 'szare', 'i', 'pochmurne']
    ],
    distractors: { random: ['kanapka', 'ryż'], form: ['szary', 'pochmurny'], lookalike: [] },
    explanation: 'Niebo jest szare i pochmurne. Niebo is neuter, so both words end in -e.'
  },
  {
    id: 'sent_172', difficulty: 2, category: 'sentence',
    prompt: 'My brother went to school.',
    answers: [
      ['mój', 'brat', 'poszedł', 'do', 'szkoły']
    ],
    distractors: { random: ['kalafior', 'lampa'], form: ['poszła', 'szkoła'], lookalike: [] },
    explanation: 'Mój brat poszedł do szkoły. Brat is masculine, so "poszedł", not "poszła". "Do" takes the genitive: szkoła → szkoły.'
  },

  // --- Difficulty 3 ---
  {
    id: 'sent_201', difficulty: 3, category: 'sentence',
    prompt: 'The bat lives in a cave.',
    answers: [
      ['nietoperz', 'mieszka', 'w', 'jaskini'],
      ['w', 'jaskini', 'mieszka', 'nietoperz']
    ],
    distractors: { random: ['marchewka'], form: ['jaskinia', 'jaskinię', 'mieszkam', 'na'], lookalike: [] },
    explanation: '"W" (in) takes the locative: jaskinia → jaskini. "Mieszkam" means "I live".'
  },
  {
    id: 'sent_202', difficulty: 3, category: 'sentence',
    prompt: 'I don\'t have a sword.',
    answers: [
      ['nie', 'mam', 'miecza'],
      ['ja', 'nie', 'mam', 'miecza']
    ],
    distractors: { random: ['chmura'], form: ['miecz', 'mieczem', 'mamy', 'ma'], lookalike: [] },
    explanation: 'After "nie mam" the noun goes into the genitive: miecz → miecza.'
  },
  {
    id: 'sent_203', difficulty: 3, category: 'sentence',
    prompt: 'The witch flies on a broom.',
    answers: [['czarownica', 'leci', 'na', 'miotle']],
    distractors: { random: ['zupa'], form: ['miotła', 'miotłę', 'lecę', 'w'], lookalike: [] },
    explanation: '"Na" (on) takes the locative here: miotła → miotle. "Lecę" means "I fly".'
  },
  {
    id: 'sent_204', difficulty: 3, category: 'sentence',
    prompt: 'The skeleton is standing under the tree.',
    answers: [['szkielet', 'stoi', 'pod', 'drzewem']],
    distractors: { random: ['mleko'], form: ['drzewo', 'drzewa', 'stoją'], lookalike: ['drewnem'] },
    explanation: '"Pod" (under) takes the instrumental: drzewo → drzewem. Drewnem comes from drewno, which means "wood"!'
  },
  {
    id: 'sent_205', difficulty: 3, category: 'sentence',
    prompt: 'My dad is a knight.',
    answers: [['mój', 'tata', 'jest', 'rycerzem']],
    distractors: { random: ['okno'], form: ['rycerz', 'rycerza', 'moja', 'są'], lookalike: [] },
    explanation: 'After "jest" (is) the noun goes into the instrumental: rycerz → rycerzem. Tata is masculine, so "mój".'
  },
  {
    id: 'sent_206', difficulty: 3, category: 'sentence',
    prompt: 'I am giving the dog a bone.',
    answers: [
      ['daję', 'psu', 'kość'],
      ['ja', 'daję', 'psu', 'kość'],
      ['daję', 'kość', 'psu'],
      ['ja', 'daję', 'kość', 'psu']
    ],
    distractors: { random: ['lampa'], form: ['psa', 'kości', 'dają'], lookalike: ['gość'] },
    explanation: 'To whom? (komu?) → dative: pies → psu. Gość means "guest"!'
  },
  {
    id: 'sent_207', difficulty: 3, category: 'sentence',
    prompt: 'The ghost lives in the castle.',
    answers: [
      ['duch', 'mieszka', 'w', 'zamku'],
      ['w', 'zamku', 'mieszka', 'duch']
    ],
    distractors: { random: ['banan'], form: ['zamek', 'zamkiem', 'pod'], lookalike: ['dach'] },
    explanation: '"W" (in) takes the locative: zamek → zamku. Dach means "roof"!'
  },
  {
    id: 'sent_208', difficulty: 3, category: 'sentence',
    prompt: 'Yesterday she was cooking soup.',
    answers: [
      ['wczoraj', 'gotowała', 'zupę'],
      ['ona', 'wczoraj', 'gotowała', 'zupę'],
      ['wczoraj', 'ona', 'gotowała', 'zupę']
    ],
    distractors: { random: ['szafa'], form: ['gotował', 'gotuje', 'zupa', 'zupą'], lookalike: [] },
    explanation: 'She → past tense ends in -ła: gotowała. "Gotował" is for he, "gotuje" is now. Zupa → zupę (what is she cooking?).'
  },
  {
    id: 'sent_209', difficulty: 3, category: 'sentence',
    prompt: 'The dragon has no gold.',
    answers: [['smok', 'nie', 'ma', 'złota']],
    distractors: { random: ['rower'], form: ['złoto', 'złotem', 'złocie', 'mają'], lookalike: [] },
    explanation: 'After "nie ma" the noun goes into the genitive: złoto → złota.'
  },
  {
    id: 'sent_210', difficulty: 3, category: 'sentence',
    prompt: 'I am afraid of spiders.',
    answers: [
      ['boję', 'się', 'pająków'],
      ['ja', 'boję', 'się', 'pająków']
    ],
    distractors: { random: ['cukier'], form: ['pająki', 'pająkami', 'pająkach', 'boi'], lookalike: [] },
    explanation: '"Bać się" (to be afraid of) takes the genitive: pająki → pająków. "Boi się" means "he/she is afraid".'
  },
  {
    id: 'sent_211', difficulty: 3, category: 'sentence',
    prompt: 'The pumpkin is on the table.',
    answers: [['dynia', 'jest', 'na', 'stole']],
    distractors: { random: ['pływać'], form: ['stół', 'stołem', 'w', 'są'], lookalike: [] },
    explanation: '"Na" (on) takes the locative: stół → stole. One pumpkin → "jest", not "są".'
  },
  {
    id: 'sent_212', difficulty: 3, category: 'sentence',
    prompt: 'Grandpa was writing a letter.',
    answers: [['dziadek', 'pisał', 'list']],
    distractors: { random: ['zimna'], form: ['pisała', 'pisze', 'listem'], lookalike: ['liść'] },
    explanation: 'Grandpa is a he, so the past tense is "pisał" ("pisała" is for she). Liść means "leaf"!'
  },
  {
    id: 'sent_213', difficulty: 3, category: 'sentence',
    prompt: 'The owl is sitting on a branch.',
    answers: [['sowa', 'siedzi', 'na', 'gałęzi']],
    distractors: { random: ['mydło'], form: ['gałąź', 'gałęzią', 'pod'], lookalike: ['słowa'] },
    explanation: '"Na" (on) takes the locative: gałąź → gałęzi. Słowa means "words"!'
  },
  {
    id: 'sent_214', difficulty: 3, category: 'sentence',
    prompt: 'I am talking with Mum.',
    answers: [
      ['rozmawiam', 'z', 'mamą'],
      ['ja', 'rozmawiam', 'z', 'mamą']
    ],
    distractors: { random: ['drzwi'], form: ['mama', 'mamę', 'o'], lookalike: ['mapą'] },
    explanation: '"Z" (with) takes the instrumental: mama → mamą. Mapą comes from mapa, "map"!'
  },
  {
    id: 'sent_215', difficulty: 3, category: 'sentence',
    prompt: 'The knight has two swords.',
    answers: [['rycerz', 'ma', 'dwa', 'miecze']],
    distractors: { random: ['cicho'], form: ['dwie', 'mieczy', 'miecz', 'mają'], lookalike: [] },
    explanation: 'Miecz is masculine, so "dwa" (not "dwie"), and after two the noun is plural: miecze.'
  },
  {
    id: 'sent_216', difficulty: 3, category: 'sentence',
    prompt: 'Five bats are flying.',
    answers: [
      ['leci', 'pięć', 'nietoperzy'],
      ['pięć', 'nietoperzy', 'leci']
    ],
    distractors: { random: ['masło'], form: ['nietoperze', 'lecą', 'pięciu', 'nietoperz'], lookalike: [] },
    explanation: 'After five the noun goes into the genitive plural (nietoperzy) and the verb stays singular: "pięć nietoperzy leci".'
  },
  {
    id: 'sent_217', difficulty: 3, category: 'sentence',
    prompt: 'I am reading about ghosts.',
    answers: [
      ['czytam', 'o', 'duchach'],
      ['ja', 'czytam', 'o', 'duchach']
    ],
    distractors: { random: ['gorący'], form: ['duchami', 'duchy', 'czyta'], lookalike: ['duszach'] },
    explanation: '"O" (about) takes the locative: duchy → duchach. Duszach comes from dusza, "soul"!'
  },
  {
    id: 'sent_218', difficulty: 3, category: 'sentence',
    prompt: 'The spider is sitting on its web.',
    answers: [['pająk', 'siedzi', 'na', 'pajęczynie']],
    distractors: { random: ['chleb'], form: ['pajęczyna', 'pajęczyną', 'siedzą', 'pod'], lookalike: [] },
    explanation: '"Na" (on) takes the locative: pajęczyna → pajęczynie. One spider → "siedzi".'
  },
  {
    id: 'sent_219', difficulty: 3, category: 'sentence',
    prompt: 'We are going with Dad.',
    answers: [
      ['idziemy', 'z', 'tatą'],
      ['my', 'idziemy', 'z', 'tatą']
    ],
    distractors: { random: ['papier'], form: ['tata', 'tatę', 'idą', 'do'], lookalike: [] },
    explanation: '"Z" (with) takes the instrumental: tata → tatą. "Idą" means "they go".'
  },
  {
    id: 'sent_220', difficulty: 3, category: 'sentence',
    prompt: 'The dragon was sleeping on gold.',
    answers: [['smok', 'spał', 'na', 'złocie']],
    distractors: { random: ['ołówek'], form: ['złoto', 'spała', 'śpi'], lookalike: ['błocie'] },
    explanation: '"Na" (on) takes the locative: złoto → złocie. The dragon is a he: "spał". Błocie comes from błoto, "mud"!'
  },
  {
    id: 'sent_221', difficulty: 3, category: 'sentence',
    prompt: 'Grandma gives the cat milk.',
    answers: [
      ['babcia', 'daje', 'kotu', 'mleko'],
      ['babcia', 'daje', 'mleko', 'kotu']
    ],
    distractors: { random: ['schody'], form: ['kot', 'kota', 'mlekiem', 'dają'], lookalike: [] },
    explanation: 'To whom? (komu?) → dative: kot → kotu.'
  },
  {
    id: 'sent_222', difficulty: 3, category: 'sentence',
    prompt: 'I can\'t see the moon.',
    answers: [
      ['nie', 'widzę', 'księżyca'],
      ['ja', 'nie', 'widzę', 'księżyca']
    ],
    distractors: { random: ['ręcznik'], form: ['księżyc', 'księżycem', 'widzi', 'widzą'], lookalike: [] },
    explanation: 'After "nie" the object goes into the genitive: księżyc → księżyca.'
  },
  {
    id: 'sent_223', difficulty: 3, category: 'sentence',
    prompt: 'The cat is under the bed.',
    answers: [['kot', 'jest', 'pod', 'łóżkiem']],
    distractors: { random: ['gruszkę'], form: ['łóżko', 'łóżka', 'w'], lookalike: ['koc'] },
    explanation: '"Pod" (under) takes the instrumental: łóżko → łóżkiem. Koc means "blanket"!'
  },
  {
    id: 'sent_224', difficulty: 3, category: 'sentence',
    prompt: 'The children are in the garden.',
    answers: [['dzieci', 'są', 'w', 'ogrodzie']],
    distractors: { random: ['ołówek'], form: ['ogród', 'ogrodem', 'jest', 'pod'], lookalike: [] },
    explanation: '"W" (in) takes the locative: ogród → ogrodzie. Dzieci is plural, so "są".'
  },
  {
    id: 'sent_225', difficulty: 3, category: 'sentence',
    prompt: 'I was at the cemetery.',
    answers: [
      ['byłem', 'na', 'cmentarzu'],
      ['byłam', 'na', 'cmentarzu'],
      ['ja', 'byłem', 'na', 'cmentarzu'],
      ['ja', 'byłam', 'na', 'cmentarzu']
    ],
    distractors: { random: ['jabłko'], form: ['cmentarz', 'cmentarza', 'w', 'był'], lookalike: [] },
    explanation: 'We say "na cmentarzu" (locative of cmentarz). A boy says "byłem", a girl says "byłam".'
  },
  {
    id: 'sent_226', difficulty: 3, category: 'sentence',
    prompt: 'The ghost was flying over the grave.',
    answers: [['duch', 'leciał', 'nad', 'grobem']],
    distractors: { random: ['zeszyt'], form: ['grób', 'leciała', 'pod'], lookalike: ['grzybem'] },
    explanation: '"Nad" (over) takes the instrumental: grób → grobem. Grzybem comes from grzyb, "mushroom"!'
  },
  {
    id: 'sent_227', difficulty: 3, category: 'sentence',
    prompt: 'My brother is a doctor.',
    answers: [['mój', 'brat', 'jest', 'lekarzem']],
    distractors: { random: ['szybko'], form: ['lekarz', 'lekarza', 'moja', 'brata'], lookalike: [] },
    explanation: 'After "jest" a job goes into the instrumental: lekarz → lekarzem.'
  },
  {
    id: 'sent_228', difficulty: 3, category: 'sentence',
    prompt: 'I don\'t like soup.',
    answers: [
      ['nie', 'lubię', 'zupy'],
      ['ja', 'nie', 'lubię', 'zupy']
    ],
    distractors: { random: ['parasol'], form: ['zupę', 'zupa', 'zupą', 'lubi'], lookalike: [] },
    explanation: '"Lubię zupę", but with "nie" the object goes into the genitive: "nie lubię zupy".'
  },
  {
    id: 'sent_229', difficulty: 3, category: 'sentence',
    prompt: 'The skeletons dance at night.',
    answers: [
      ['szkielety', 'tańczą', 'w', 'nocy'],
      ['w', 'nocy', 'szkielety', 'tańczą']
    ],
    distractors: { random: ['kubek'], form: ['szkielet', 'tańczy', 'noc', 'na'], lookalike: [] },
    explanation: '"W nocy" means "at night". Many skeletons → plural verb "tańczą".'
  },
  {
    id: 'sent_230', difficulty: 3, category: 'sentence',
    prompt: 'Mum is buying cheese.',
    answers: [['mama', 'kupuje', 'ser']],
    distractors: { random: ['biegać'], form: ['serem', 'kupują', 'kupuję'], lookalike: ['sen'] },
    explanation: 'She buys → "kupuje" ("kupuję" is I buy, "kupują" is they buy). Sen means "dream"!'
  },
  {
    id: 'sent_231', difficulty: 3, category: 'sentence',
    prompt: 'The treasure is behind the door.',
    answers: [['skarb', 'jest', 'za', 'drzwiami']],
    distractors: { random: ['śpiewać'], form: ['drzwi', 'drzwiach', 'są', 'pod'], lookalike: [] },
    explanation: '"Za" (behind) takes the instrumental: drzwi → drzwiami.'
  },
  {
    id: 'sent_232', difficulty: 3, category: 'sentence',
    prompt: 'I write with a red pencil.',
    answers: [
      ['piszę', 'czerwonym', 'ołówkiem'],
      ['ja', 'piszę', 'czerwonym', 'ołówkiem']
    ],
    distractors: { random: ['gruszka'], form: ['ołówek', 'czerwony', 'z', 'pisze'], lookalike: [] },
    explanation: 'For a tool we use the instrumental with no "z": piszę ołówkiem. The adjective matches: czerwonym.'
  },
  {
    id: 'sent_233', difficulty: 3, category: 'sentence',
    prompt: 'The witch has a black cat.',
    answers: [['czarownica', 'ma', 'czarnego', 'kota']],
    distractors: { random: ['rysować'], form: ['czarny', 'kot', 'czarnym', 'mają'], lookalike: [] },
    explanation: 'What does she have? A living male animal changes in the accusative: czarny kot → czarnego kota.'
  },
  {
    id: 'sent_234', difficulty: 3, category: 'sentence',
    prompt: 'I see two ghosts.',
    answers: [
      ['widzę', 'dwa', 'duchy'],
      ['ja', 'widzę', 'dwa', 'duchy']
    ],
    distractors: { random: ['mydłem'], form: ['dwie', 'duchów', 'duch', 'widzi'], lookalike: [] },
    explanation: 'Duch is masculine, so "dwa" (not "dwie"), and after two the noun is plural: duchy.'
  },
  {
    id: 'sent_235', difficulty: 3, category: 'sentence',
    prompt: 'The girl was singing a song.',
    answers: [['dziewczynka', 'śpiewała', 'piosenkę']],
    distractors: { random: ['łyżką'], form: ['śpiewał', 'śpiewa', 'piosenka', 'piosenki'], lookalike: [] },
    explanation: 'A girl → past tense in -ła: śpiewała. What was she singing? piosenka → piosenkę.'
  },
  {
    id: 'sent_236', difficulty: 3, category: 'sentence',
    prompt: 'The key is in the pocket.',
    answers: [['klucz', 'jest', 'w', 'kieszeni']],
    distractors: { random: ['skakać'], form: ['kieszeń', 'kieszenią', 'na', 'są'], lookalike: [] },
    explanation: '"W" (in) takes the locative: kieszeń → kieszeni.'
  },
  {
    id: 'sent_237', difficulty: 3, category: 'sentence',
    prompt: 'I am going to Grandma\'s.',
    answers: [
      ['idę', 'do', 'babci'],
      ['ja', 'idę', 'do', 'babci']
    ],
    distractors: { random: ['smaczny'], form: ['babcia', 'babcię', 'babcią', 'idzie'], lookalike: [] },
    explanation: '"Do" (to) takes the genitive: babcia → babci.'
  },
  {
    id: 'sent_238', difficulty: 3, category: 'sentence',
    prompt: 'The knight fought with the dragon.',
    answers: [['rycerz', 'walczył', 'ze', 'smokiem']],
    distractors: { random: ['kwiatek'], form: ['smoka', 'walczyła', 'z'], lookalike: ['smakiem'] },
    explanation: '"Ze" (with) takes the instrumental: smok → smokiem. Before "sm" we say "ze", not "z". Smakiem comes from smak, "taste"!'
  },
  {
    id: 'sent_239', difficulty: 3, category: 'sentence',
    prompt: 'We live in the city.',
    answers: [
      ['mieszkamy', 'w', 'mieście'],
      ['my', 'mieszkamy', 'w', 'mieście']
    ],
    distractors: { random: ['gruby'], form: ['miasto', 'mieszkają', 'pod'], lookalike: ['mięsie'] },
    explanation: '"W" (in) takes the locative: miasto → mieście. Mięsie comes from mięso, "meat"!'
  },
  {
    id: 'sent_240', difficulty: 3, category: 'sentence',
    prompt: 'The owl drinks the potion.',
    answers: [['sowa', 'pije', 'miksturę']],
    distractors: { random: ['dywan'], form: ['mikstura', 'miksturą', 'piją', 'piję'], lookalike: [] },
    explanation: 'What does she drink? mikstura → miksturę. "Piję" is I drink, "piją" is they drink.'
  },
  {
    id: 'sent_241', difficulty: 3, category: 'sentence',
    prompt: 'The door was closed.',
    answers: [['drzwi', 'były', 'zamknięte']],
    distractors: { random: ['marchew'], form: ['była', 'było', 'zamknięta', 'zamknięty'], lookalike: [] },
    explanation: 'Drzwi is always plural in Polish, so "były zamknięte" - even for one door!'
  },
  {
    id: 'sent_242', difficulty: 3, category: 'sentence',
    prompt: 'I am thinking about the holidays.',
    answers: [
      ['myślę', 'o', 'wakacjach'],
      ['ja', 'myślę', 'o', 'wakacjach']
    ],
    distractors: { random: ['ciężki'], form: ['wakacje', 'wakacjami', 'myśli', 'na'], lookalike: [] },
    explanation: '"O" (about) takes the locative: wakacje → wakacjach.'
  },
  {
    id: 'sent_243', difficulty: 3, category: 'sentence',
    prompt: 'The ghost is afraid of the light.',
    answers: [['duch', 'boi', 'się', 'światła']],
    distractors: { random: ['kalosz'], form: ['światło', 'boję', 'boją'], lookalike: ['świata'] },
    explanation: '"Bać się" takes the genitive: światło → światła. Świata comes from świat, "world"!'
  },
  {
    id: 'sent_244', difficulty: 3, category: 'sentence',
    prompt: 'Dad helps Grandma.',
    answers: [['tata', 'pomaga', 'babci']],
    distractors: { random: ['parasol'], form: ['babcię', 'babcia', 'babcią', 'pomagają'], lookalike: [] },
    explanation: 'Helps whom? (komu?) "Pomagać" takes the dative: babcia → babci.'
  },
  {
    id: 'sent_245', difficulty: 3, category: 'sentence',
    prompt: 'The torch is burning on the wall.',
    answers: [['pochodnia', 'płonie', 'na', 'ścianie']],
    distractors: { random: ['kąpać'], form: ['ściana', 'ścianę', 'płoną', 'z'], lookalike: [] },
    explanation: '"Na" (on) takes the locative: ściana → ścianie. One torch → "płonie".'
  },
  {
    id: 'sent_246', difficulty: 3, category: 'sentence',
    prompt: 'We have three keys.',
    answers: [
      ['mamy', 'trzy', 'klucze'],
      ['my', 'mamy', 'trzy', 'klucze']
    ],
    distractors: { random: ['wesoło'], form: ['kluczy', 'klucz', 'trzech', 'mają'], lookalike: [] },
    explanation: 'After two, three and four the noun is in the plural: klucz → klucze.'
  },
  {
    id: 'sent_247', difficulty: 3, category: 'sentence',
    prompt: 'I have five sweets.',
    answers: [
      ['mam', 'pięć', 'cukierków'],
      ['ja', 'mam', 'pięć', 'cukierków']
    ],
    distractors: { random: ['ławka'], form: ['cukierki', 'cukierek', 'pięciu', 'ma'], lookalike: [] },
    explanation: 'From five up, the noun goes into the genitive plural: cukierki → cukierków.'
  },
  {
    id: 'sent_248', difficulty: 3, category: 'sentence',
    prompt: 'The spider was walking on the ceiling.',
    answers: [['pająk', 'chodził', 'po', 'suficie']],
    distractors: { random: ['solą'], form: ['sufit', 'sufitem', 'chodziła', 'pod'], lookalike: [] },
    explanation: '"Po" (around, over a surface) takes the locative: sufit → suficie. The spider is a he: "chodził".'
  },
  {
    id: 'sent_249', difficulty: 3, category: 'sentence',
    prompt: 'I have no time.',
    answers: [
      ['nie', 'mam', 'czasu'],
      ['ja', 'nie', 'mam', 'czasu']
    ],
    distractors: { random: ['pomidor'], form: ['czas', 'czasem', 'mamy', 'ma'], lookalike: [] },
    explanation: 'After "nie mam" the noun goes into the genitive: czas → czasu.'
  },
  {
    id: 'sent_250', difficulty: 3, category: 'sentence',
    prompt: 'The Grim Reaper has a scythe.',
    answers: [['kostucha', 'ma', 'kosę']],
    distractors: { random: ['grzebień'], form: ['kosa', 'kosą', 'mają'], lookalike: ['kozę'] },
    explanation: 'What does she have? kosa → kosę. Kozę comes from koza, "goat"!'
  },
  {
    id: 'sent_251', difficulty: 3, category: 'sentence',
    prompt: 'The boy fell into the water.',
    answers: [['chłopiec', 'wpadł', 'do', 'wody']],
    distractors: { random: ['kolorowa'], form: ['woda', 'wodzie', 'wpadła', 'na'], lookalike: [] },
    explanation: '"Do" (into) takes the genitive: woda → wody. A boy → "wpadł".'
  },
  {
    id: 'sent_252', difficulty: 3, category: 'sentence',
    prompt: 'I am sitting in front of the house.',
    answers: [
      ['siedzę', 'przed', 'domem'],
      ['ja', 'siedzę', 'przed', 'domem']
    ],
    distractors: { random: ['gorzki'], form: ['dom', 'domu', 'za'], lookalike: ['dymem'] },
    explanation: '"Przed" (in front of) takes the instrumental: dom → domem. Dymem comes from dym, "smoke"!'
  },
  {
    id: 'sent_253', difficulty: 3, category: 'sentence',
    prompt: 'The bats live in the tower.',
    answers: [
      ['nietoperze', 'mieszkają', 'w', 'wieży'],
      ['w', 'wieży', 'mieszkają', 'nietoperze']
    ],
    distractors: { random: ['herbata'], form: ['wieża', 'wieżę', 'mieszka'], lookalike: ['wierzy'] },
    explanation: '"W" (in) takes the locative: wieża → wieży. Wierzy sounds the same but means "believes"!'
  },
  {
    id: 'sent_254', difficulty: 3, category: 'sentence',
    prompt: 'The pumpkins are orange.',
    answers: [['dynie', 'są', 'pomarańczowe']],
    distractors: { random: ['spać'], form: ['pomarańczowa', 'pomarańczowy', 'jest'], lookalike: ['pomarańcze'] },
    explanation: 'Many pumpkins → "są" and a plural adjective: pomarańczowe. Pomarańcze means "oranges" (the fruit)!'
  },
  {
    id: 'sent_255', difficulty: 3, category: 'sentence',
    prompt: 'I am going with the dog.',
    answers: [
      ['idę', 'z', 'psem'],
      ['ja', 'idę', 'z', 'psem']
    ],
    distractors: { random: ['niski'], form: ['pies', 'psa', 'idzie'], lookalike: ['pasem'] },
    explanation: '"Z" (with) takes the instrumental: pies → psem. Pasem comes from pas, "belt"!'
  },
  {
    id: 'sent_256', difficulty: 3, category: 'sentence',
    prompt: 'The coins were lying on the floor.',
    answers: [
      ['monety', 'leżały', 'na', 'podłodze'],
      ['na', 'podłodze', 'leżały', 'monety']
    ],
    distractors: { random: ['śmiać'], form: ['monet', 'leżał', 'podłoga', 'podłogę'], lookalike: [] },
    explanation: '"Na" (on) takes the locative: podłoga → podłodze. Many coins → "leżały".'
  },
  {
    id: 'sent_257', difficulty: 3, category: 'sentence',
    prompt: 'The castle stands on a hill.',
    answers: [['zamek', 'stoi', 'na', 'wzgórzu']],
    distractors: { random: ['pisać'], form: ['wzgórze', 'wzgórzem', 'stoją', 'pod'], lookalike: [] },
    explanation: '"Na" (on) takes the locative: wzgórze → wzgórzu.'
  },
  {
    id: 'sent_258', difficulty: 3, category: 'sentence',
    prompt: 'Yesterday I ate an apple.',
    answers: [
      ['wczoraj', 'zjadłem', 'jabłko'],
      ['wczoraj', 'zjadłam', 'jabłko'],
      ['zjadłem', 'wczoraj', 'jabłko'],
      ['zjadłam', 'wczoraj', 'jabłko'],
      ['ja', 'wczoraj', 'zjadłem', 'jabłko'],
      ['ja', 'wczoraj', 'zjadłam', 'jabłko']
    ],
    distractors: { random: ['wiatr'], form: ['zjadł', 'zjem', 'jabłka', 'jabłkiem'], lookalike: [] },
    explanation: 'Finished action in the past: a boy says "zjadłem", a girl says "zjadłam". "Zjem" means "I will eat".'
  },
  {
    id: 'sent_259', difficulty: 3, category: 'sentence',
    prompt: 'The children were laughing.',
    answers: [
      ['dzieci', 'się', 'śmiały'],
      ['dzieci', 'śmiały', 'się']
    ],
    distractors: { random: ['krzesło'], form: ['śmiało', 'śmiali', 'śmiał', 'śmieją'], lookalike: [] },
    explanation: 'Dzieci takes the plural past form "śmiały" - "śmiali" is only for groups of men or boys.'
  },
  {
    id: 'sent_260', difficulty: 3, category: 'sentence',
    prompt: 'The owl is looking at the moon.',
    answers: [['sowa', 'patrzy', 'na', 'księżyc']],
    distractors: { random: ['ciasto'], form: ['księżyca', 'księżycem', 'patrzą', 'o'], lookalike: [] },
    explanation: '"Patrzeć na" (look at) takes the accusative: na księżyc.'
  },
  {
    id: 'sent_261', difficulty: 3, category: 'sentence',
    prompt: 'Grandma writes to Grandpa.',
    answers: [['babcia', 'pisze', 'do', 'dziadka']],
    distractors: { random: ['wąski'], form: ['dziadek', 'dziadku', 'dziadkiem', 'piszę'], lookalike: [] },
    explanation: '"Do" (to) takes the genitive: dziadek → dziadka. "Piszę" means "I write".'
  },
  {
    id: 'sent_262', difficulty: 3, category: 'sentence',
    prompt: 'The cat is playing with a ball.',
    answers: [['kot', 'bawi', 'się', 'piłką']],
    distractors: { random: ['niebo'], form: ['piłka', 'piłkę', 'bawią'], lookalike: ['półką'] },
    explanation: '"Bawić się" + the instrumental, with no "z": piłka → piłką. Półką comes from półka, "shelf"!'
  },
  {
    id: 'sent_263', difficulty: 3, category: 'sentence',
    prompt: 'The potion is in the bottle.',
    answers: [['eliksir', 'jest', 'w', 'butelce']],
    distractors: { random: ['płakać'], form: ['butelka', 'butelką', 'na', 'są'], lookalike: [] },
    explanation: '"W" (in) takes the locative: butelka → butelce.'
  },
  {
    id: 'sent_264', difficulty: 3, category: 'sentence',
    prompt: 'We were waiting for the bus.',
    answers: [
      ['czekaliśmy', 'na', 'autobus'],
      ['czekałyśmy', 'na', 'autobus'],
      ['my', 'czekaliśmy', 'na', 'autobus'],
      ['my', 'czekałyśmy', 'na', 'autobus']
    ],
    distractors: { random: ['słodki'], form: ['autobusu', 'autobusem', 'czekali', 'w'], lookalike: [] },
    explanation: '"Czekać na" takes the accusative: na autobus. A group of girls says "czekałyśmy".'
  }
];
