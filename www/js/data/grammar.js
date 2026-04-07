/**
 * Polish Grammar Questions Database
 * Extensible: Add new questions to the GRAMMAR_QUESTIONS array
 *
 * Structure:
 * - prompt: English question explaining what to do
 * - sentence: Polish sentence with blank (___)
 * - hint: Additional English hint
 * - options: Answer choices in Polish
 * - explanation: Grammar rule explanation (shown after answering)
 */

const GRAMMAR_QUESTIONS = [
  // DIFFICULTY 1 - Easy (Basic gender - ten/ta/to)
  {
    id: 'gram_001',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for this masculine noun:',
    sentence: '___ kot (cat)',
    hint: 'Masculine nouns use "ten"',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 0,
    explanation: 'Rule: Masculine nouns use "ten". Most nouns ending in a consonant are masculine. Example: ten kot, ten dom, ten pies.'
  },
  {
    id: 'gram_002',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for this feminine noun:',
    sentence: '___ sowa (owl)',
    hint: 'Feminine nouns use "ta"',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns use "ta". Most nouns ending in -a are feminine. Example: ta sowa, ta mama, ta książka.'
  },
  {
    id: 'gram_003',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for this neuter noun:',
    sentence: '___ jabłko (apple)',
    hint: 'Neuter nouns use "to"',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 2,
    explanation: 'Rule: Neuter nouns use "to". Most nouns ending in -o or -e are neuter. Example: to jabłko, to okno, to morze.'
  },
  {
    id: 'gram_004',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "house":',
    sentence: '___ dom',
    hint: 'Dom ends in a consonant',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 0,
    explanation: 'Rule: Nouns ending in a consonant are usually masculine and use "ten". Dom (house) is masculine.'
  },
  {
    id: 'gram_005',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "book":',
    sentence: '___ książka',
    hint: 'Książka ends in -a',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 1,
    explanation: 'Rule: Nouns ending in -a are usually feminine and use "ta". Książka (book) is feminine.'
  },
  {
    id: 'gram_006',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "window":',
    sentence: '___ okno',
    hint: 'Okno ends in -o',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 2,
    explanation: 'Rule: Nouns ending in -o are usually neuter and use "to". Okno (window) is neuter.'
  },
  {
    id: 'gram_007',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "dog":',
    sentence: '___ pies',
    hint: 'Pies is masculine',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 0,
    explanation: 'Rule: Animals are often grammatically masculine or feminine based on their word ending. Pies (dog) ends in a consonant, so it is masculine.'
  },
  {
    id: 'gram_008',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "mom":',
    sentence: '___ mama',
    hint: 'Family words for females are feminine',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 1,
    explanation: 'Rule: Words for female family members are feminine and use "ta". Mama ends in -a, confirming it is feminine.'
  },

  // DIFFICULTY 2 - Medium (Plurals and basic verb forms)
  {
    id: 'gram_009',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "kot" (cat)?',
    sentence: 'kot → ___',
    hint: 'Masculine animate nouns often add -y',
    options: ['koty', 'kota', 'kotem', 'kotów'],
    correctIndex: 0,
    explanation: 'Rule: Many masculine nouns form plurals by adding -y. Kot → koty (cats). This is the nominative plural.'
  },
  {
    id: 'gram_010',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to eat" (jeść):',
    sentence: 'Ja ___ (I eat)',
    hint: 'First person singular',
    options: ['jesz', 'jem', 'je', 'jemy'],
    correctIndex: 1,
    explanation: 'Rule: Polish verbs conjugate by person. "Jeść" (to eat): ja jem, ty jesz, on/ona je, my jemy, wy jecie, oni jedzą.'
  },
  {
    id: 'gram_011',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to read" (czytać):',
    sentence: 'On ___ (He reads)',
    hint: 'Third person singular',
    options: ['czytam', 'czytasz', 'czyta', 'czytamy'],
    correctIndex: 2,
    explanation: 'Rule: For -ać verbs, third person singular drops the -ć and adds -a. Czytać → on czyta (he reads).'
  },
  {
    id: 'gram_012',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to go" (iść):',
    sentence: 'My ___ (We go)',
    hint: 'First person plural',
    options: ['idę', 'idziesz', 'idzie', 'idziemy'],
    correctIndex: 3,
    explanation: 'Rule: "Iść" is irregular. Conjugation: ja idę, ty idziesz, on idzie, my idziemy, wy idziecie, oni idą.'
  },
  {
    id: 'gram_013',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "sowa" (owl)?',
    sentence: 'sowa → ___',
    hint: 'Feminine nouns ending in -a change to -y',
    options: ['sowia', 'sowy', 'sowen', 'sowami'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -a form plurals by changing -a to -y. Sowa → sowy (owls).'
  },
  {
    id: 'gram_014',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to have" (mieć):',
    sentence: 'Ty ___ (You have)',
    hint: 'Second person singular',
    options: ['mam', 'masz', 'ma', 'mamy'],
    correctIndex: 1,
    explanation: 'Rule: "Mieć" (to have) conjugation: ja mam, ty masz, on/ona ma, my mamy, wy macie, oni mają.'
  },
  {
    id: 'gram_015',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the masculine noun:',
    sentence: 'Miecz jest ___ (The sword is sharp)',
    hint: 'Masculine adjectives often end in -y',
    options: ['ostry', 'ostra', 'ostre', 'ostrzy'],
    correctIndex: 0,
    explanation: 'Rule: Adjectives must match the gender of the noun. Masculine: ostry, Feminine: ostra, Neuter: ostre.'
  },
  {
    id: 'gram_016',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the feminine noun:',
    sentence: 'Sowa jest ___ (The owl is wise)',
    hint: 'Feminine adjectives often end in -a',
    options: ['mądry', 'mądra', 'mądre', 'mądrzy'],
    correctIndex: 1,
    explanation: 'Rule: Adjectives agree with noun gender. Sowa is feminine, so we use mądra (not mądry or mądre).'
  },

  // DIFFICULTY 2 - Medium (More Plurals)
  {
    id: 'gram_029',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "pies" (dog)?',
    sentence: 'pies → ___',
    hint: 'Masculine animate nouns',
    options: ['piesy', 'psy', 'pieski', 'psów'],
    correctIndex: 1,
    explanation: 'Rule: Some masculine nouns have irregular plurals. Pies → psy (dogs). The -ie- disappears in the plural.'
  },
  {
    id: 'gram_030',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "jabłko" (apple)?',
    sentence: 'jabłko → ___',
    hint: 'Neuter nouns ending in -o change to -a',
    options: ['jabłki', 'jabłka', 'jabłków', 'jabłkiem'],
    correctIndex: 1,
    explanation: 'Rule: Neuter nouns ending in -o form plurals by changing -o to -a. Jabłko → jabłka (apples).'
  },
  {
    id: 'gram_031',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "dom" (house)?',
    sentence: 'dom → ___',
    hint: 'Masculine inanimate nouns often add -y',
    options: ['domy', 'doma', 'domów', 'domem'],
    correctIndex: 0,
    explanation: 'Rule: Masculine inanimate nouns often add -y for plural. Dom → domy (houses).'
  },
  {
    id: 'gram_032',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "książka" (book)?',
    sentence: 'książka → ___',
    hint: 'Feminine nouns ending in -ka change to -ki',
    options: ['książky', 'książki', 'książek', 'książką'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -ka change to -ki in plural. Książka → książki (books).'
  },

  // DIFFICULTY 2 - Medium (More Verb Conjugations)
  {
    id: 'gram_033',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to see" (widzieć):',
    sentence: 'Ja ___ (I see)',
    hint: 'First person singular',
    options: ['widzę', 'widzisz', 'widzi', 'widzimy'],
    correctIndex: 0,
    explanation: 'Rule: "Widzieć" conjugation: ja widzę, ty widzisz, on/ona widzi, my widzimy, wy widzicie, oni widzą.'
  },
  {
    id: 'gram_034',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to know" (wiedzieć):',
    sentence: 'Oni ___ (They know)',
    hint: 'Third person plural',
    options: ['wiem', 'wiesz', 'wie', 'wiedzą'],
    correctIndex: 3,
    explanation: 'Rule: "Wiedzieć" conjugation: ja wiem, ty wiesz, on/ona wie, my wiemy, wy wiecie, oni wiedzą.'
  },
  {
    id: 'gram_035',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to sleep" (spać):',
    sentence: 'On ___ (He sleeps)',
    hint: 'Third person singular',
    options: ['śpię', 'śpisz', 'śpi', 'śpimy'],
    correctIndex: 2,
    explanation: 'Rule: "Spać" conjugation: ja śpię, ty śpisz, on/ona śpi, my śpimy, wy śpicie, oni śpią.'
  },
  {
    id: 'gram_036',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to drink" (pić):',
    sentence: 'My ___ (We drink)',
    hint: 'First person plural',
    options: ['piję', 'pijesz', 'pije', 'pijemy'],
    correctIndex: 3,
    explanation: 'Rule: "Pić" conjugation: ja piję, ty pijesz, on/ona pije, my pijemy, wy pijecie, oni piją.'
  },
  {
    id: 'gram_037',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to want" (chcieć):',
    sentence: 'Ty ___ (You want)',
    hint: 'Second person singular',
    options: ['chcę', 'chcesz', 'chce', 'chcemy'],
    correctIndex: 1,
    explanation: 'Rule: "Chcieć" conjugation: ja chcę, ty chcesz, on/ona chce, my chcemy, wy chcecie, oni chcą.'
  },
  {
    id: 'gram_038',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to like" (lubić):',
    sentence: 'Ona ___ koty (She likes cats)',
    hint: 'Third person singular',
    options: ['lubię', 'lubisz', 'lubi', 'lubimy'],
    correctIndex: 2,
    explanation: 'Rule: "Lubić" conjugation: ja lubię, ty lubisz, on/ona lubi, my lubimy, wy lubicie, oni lubią.'
  },

  // DIFFICULTY 2 - Medium (More Adjective Agreement)
  {
    id: 'gram_039',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the neuter noun:',
    sentence: 'Jabłko jest ___ (The apple is red)',
    hint: 'Neuter adjectives often end in -e',
    options: ['czerwony', 'czerwona', 'czerwone', 'czerwoni'],
    correctIndex: 2,
    explanation: 'Rule: Neuter adjectives end in -e. Jabłko is neuter, so we use czerwone (red).'
  },
  {
    id: 'gram_040',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the masculine noun:',
    sentence: 'Smok jest ___ (The dragon is big)',
    hint: 'Masculine adjectives often end in -y or -i',
    options: ['duży', 'duża', 'duże', 'duzi'],
    correctIndex: 0,
    explanation: 'Rule: Masculine singular adjectives end in -y (or -i after k, g). Smok is masculine, so we use duży.'
  },
  {
    id: 'gram_041',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the feminine noun:',
    sentence: 'Książka jest ___ (The book is interesting)',
    hint: 'Feminine adjectives often end in -a',
    options: ['ciekawy', 'ciekawa', 'ciekawe', 'ciekawi'],
    correctIndex: 1,
    explanation: 'Rule: Feminine adjectives end in -a. Książka is feminine, so we use ciekawa (interesting).'
  },
  {
    id: 'gram_042',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the masculine noun:',
    sentence: 'Rycerz jest ___ (The knight is brave)',
    hint: 'Masculine adjectives',
    options: ['odważny', 'odważna', 'odważne', 'odważni'],
    correctIndex: 0,
    explanation: 'Rule: Masculine singular adjectives use -y ending. Rycerz (knight) is masculine, so we use odważny.'
  },

  // DIFFICULTY 2 - Medium (Basic "jest/są" usage)
  {
    id: 'gram_043',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose "is" or "are" for this sentence:',
    sentence: 'Koty ___ małe (Cats are small)',
    hint: '"Są" is used for plural subjects',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 1,
    explanation: 'Rule: Use "jest" for singular (one cat is) and "są" for plural (cats are). Koty is plural, so we use są.'
  },
  {
    id: 'gram_044',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose "is" or "are" for this sentence:',
    sentence: 'Smok ___ zielony (The dragon is green)',
    hint: '"Jest" is used for singular subjects',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 0,
    explanation: 'Rule: Use "jest" for singular subjects. Smok (dragon) is singular, so we use jest.'
  },

  // DIFFICULTY 3 - Hard (Cases, complex sentences)
  {
    id: 'gram_017',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive case (after "do"):',
    sentence: 'Idę do ___ (I am going to the castle)',
    hint: '"Do" requires genitive case',
    options: ['zamek', 'zamku', 'zamkiem', 'zamkowi'],
    correctIndex: 1,
    explanation: 'Rule: The preposition "do" (to) requires genitive case. Zamek (nominative) → zamku (genitive). Genitive often indicates direction or possession.'
  },
  {
    id: 'gram_018',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the accusative case (direct object):',
    sentence: 'Widzę ___ (I see the dragon)',
    hint: 'Direct objects use accusative case',
    options: ['smok', 'smoka', 'smokiem', 'smoku'],
    correctIndex: 1,
    explanation: 'Rule: Direct objects of verbs like "widzieć" (to see) take accusative case. Animate masculine nouns: smok → smoka.'
  },
  {
    id: 'gram_019',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (after "z"):',
    sentence: 'Rozmawiam z ___ (I am talking with the knight)',
    hint: '"Z" (with) requires instrumental case',
    options: ['rycerz', 'rycerza', 'rycerzem', 'rycerzu'],
    correctIndex: 2,
    explanation: 'Rule: The preposition "z" (with) requires instrumental case. Rycerz → rycerzem. Instrumental often indicates "with" or "by means of".'
  },
  {
    id: 'gram_020',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the correct verb form:',
    sentence: 'Sowa ___ w nocy. (The owl hunts at night)',
    hint: 'Third person singular present tense',
    options: ['poluje', 'poluję', 'polować', 'polował'],
    correctIndex: 0,
    explanation: 'Rule: Present tense, 3rd person singular of "polować" is "poluje". The -ować verbs: ja poluję, ty polujesz, on/ona poluje.'
  },
  {
    id: 'gram_021',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case (indirect object):',
    sentence: 'Daję miecz ___ (I give the sword to the knight)',
    hint: 'The recipient takes dative case',
    options: ['rycerz', 'rycerza', 'rycerzowi', 'rycerzem'],
    correctIndex: 2,
    explanation: 'Rule: The indirect object (recipient) takes dative case. Rycerz → rycerzowi. Dative answers "to whom?" or "for whom?"'
  },
  {
    id: 'gram_022',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete showing possession (genitive):',
    sentence: 'To jest jaskinia ___ (This is the dragon\'s cave)',
    hint: 'Possession uses genitive case',
    options: ['smok', 'smoka', 'smokiem', 'smoku'],
    correctIndex: 1,
    explanation: 'Rule: Possession in Polish uses genitive case. "Jaskinia smoka" = "the cave of the dragon" = "the dragon\'s cave".'
  },
  {
    id: 'gram_023',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (masculine subject):',
    sentence: 'On ___ (He fought)',
    hint: 'Masculine past tense ends in -ł',
    options: ['walczy', 'walczył', 'walczyła', 'walczyli'],
    correctIndex: 1,
    explanation: 'Rule: Past tense agrees with subject gender. Masculine singular: -ł (walczył), Feminine singular: -ła (walczyła), Masculine plural: -li (walczyli).'
  },
  {
    id: 'gram_024',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (feminine subject):',
    sentence: 'Ona ___ (She won)',
    hint: 'Feminine past tense ends in -ła',
    options: ['wygrał', 'wygrała', 'wygrali', 'wygrało'],
    correctIndex: 1,
    explanation: 'Rule: Feminine past tense uses -ła ending. On wygrał (he won), Ona wygrała (she won), Ono wygrało (it won - neuter).'
  },
  {
    id: 'gram_025',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "o"):',
    sentence: 'Myślę o ___ (I am thinking about the adventure)',
    hint: '"O" (about) requires locative case',
    options: ['przygoda', 'przygodę', 'przygodzie', 'przygodą'],
    correctIndex: 2,
    explanation: 'Rule: The preposition "o" (about) requires locative case. Przygoda → przygodzie. Locative is used after o, w, na, przy.'
  },
  {
    id: 'gram_026',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete the negation (requires genitive):',
    sentence: 'Nie ma ___ (There is no monster)',
    hint: 'Negation with "nie ma" uses genitive',
    options: ['potwór', 'potwora', 'potworem', 'potworze'],
    correctIndex: 1,
    explanation: 'Rule: Negation of existence uses "nie ma" + genitive. "Jest potwór" (there is a monster) → "Nie ma potwora" (there is no monster).'
  },
  {
    id: 'gram_028',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct form of "to be" (być):',
    sentence: 'Rycerz ___ bardzo silny. (The knight is very strong)',
    hint: 'Third person singular',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 0,
    explanation: 'Rule: "Być" (to be) conjugation: ja jestem, ty jesteś, on/ona jest, my jesteśmy, wy jesteście, oni są.'
  },

  // DIFFICULTY 3 - Hard (More Cases)
  {
    id: 'gram_045',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive case (after "bez"):',
    sentence: 'Idę bez ___ (I am going without a sword)',
    hint: '"Bez" (without) requires genitive case',
    options: ['miecz', 'miecza', 'mieczem', 'mieczu'],
    correctIndex: 1,
    explanation: 'Rule: "Bez" (without) requires genitive case. Miecz → miecza. Similar prepositions: bez, do, od, z (from).'
  },
  {
    id: 'gram_046',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Mam ___ (I have a shield)',
    hint: 'Direct object of "mieć" (to have)',
    options: ['tarcza', 'tarczę', 'tarczy', 'tarczą'],
    correctIndex: 1,
    explanation: 'Rule: Direct objects take accusative. Feminine nouns ending in -a change to -ę. Tarcza → tarczę.'
  },
  {
    id: 'gram_047',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the instrumental case:',
    sentence: 'Walczę ___ (I fight with a sword)',
    hint: 'Instrument used for action',
    options: ['miecz', 'miecza', 'mieczem', 'mieczu'],
    correctIndex: 2,
    explanation: 'Rule: The instrument of action uses instrumental case. Miecz → mieczem. "I fight with a sword" = "Walczę mieczem".'
  },
  {
    id: 'gram_048',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "w"):',
    sentence: 'Jestem w ___ (I am in the castle)',
    hint: '"W" (in) requires locative case',
    options: ['zamek', 'zamka', 'zamku', 'zamkiem'],
    correctIndex: 2,
    explanation: 'Rule: "W" (in) requires locative case. Zamek → zamku. Locative is used after w, na, o, przy for location.'
  },
  {
    id: 'gram_049',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (neuter subject):',
    sentence: 'Słońce ___ (The sun shone)',
    hint: 'Neuter past tense ends in -ło',
    options: ['świecił', 'świeciła', 'świeciło', 'świecili'],
    correctIndex: 2,
    explanation: 'Rule: Neuter past tense uses -ło ending. Masculine: -ł, Feminine: -ła, Neuter: -ło. Słońce (sun) is neuter.'
  },
  {
    id: 'gram_050',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (plural masculine):',
    sentence: 'Oni ___ (They ran)',
    hint: 'Masculine plural past tense',
    options: ['biegł', 'biegła', 'biegło', 'biegli'],
    correctIndex: 3,
    explanation: 'Rule: Masculine personal plural uses -li. Biec (to run): on biegł, ona biegła, ono biegło, oni biegli.'
  },
  {
    id: 'gram_051',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case:',
    sentence: 'Pomagam ___ (I am helping the owl)',
    hint: '"Pomagać" (to help) takes dative',
    options: ['sowa', 'sowę', 'sowie', 'sową'],
    correctIndex: 2,
    explanation: 'Rule: "Pomagać" (to help) requires dative case. Sowa → sowie. Some verbs take dative instead of accusative.'
  },
  {
    id: 'gram_052',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the future tense:',
    sentence: 'Ja ___ smoka (I will defeat the dragon)',
    hint: 'Future tense of "pokonać"',
    options: ['pokonam', 'pokonuję', 'pokonałem', 'pokonywać'],
    correctIndex: 0,
    explanation: 'Rule: Perfective verbs form simple future. Pokonać (to defeat) → ja pokonam, ty pokonasz, on pokona.'
  },
  {
    id: 'gram_053',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the vocative case (addressing someone):',
    sentence: '___, pomóż mi! (Knight, help me!)',
    hint: 'Vocative is used when calling someone',
    options: ['Rycerz', 'Rycerza', 'Rycerzu', 'Rycerzem'],
    correctIndex: 2,
    explanation: 'Rule: Vocative case is used for direct address. Rycerz → Rycerzu! Masculine nouns often use -u or -e in vocative.'
  },
  {
    id: 'gram_054',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'Smok jest ___ od goblina (The dragon is bigger than the goblin)',
    hint: 'Comparative form of "duży"',
    options: ['duży', 'większy', 'największy', 'duża'],
    correctIndex: 1,
    explanation: 'Rule: "Większy" is the comparative of "duży" (big → bigger). Superlative would be "największy" (biggest).'
  },
  {
    id: 'gram_055',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the imperative (command form):',
    sentence: '___ ostrożny! (Be careful!)',
    hint: 'Command form of "być"',
    options: ['Jest', 'Jestem', 'Bądź', 'Będę'],
    correctIndex: 2,
    explanation: 'Rule: "Bądź" is the imperative (command) of "być" (to be). Used for giving orders or advice. Bądź ostrożny! = Be careful!'
  },

  // ========== NEW DIFFICULTY 1 QUESTIONS ==========

  // DIFFICULTY 1 - Easy (More Gender Articles)
  {
    id: 'gram_056',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "hen":',
    sentence: '___ kura',
    hint: 'Kura ends in -a',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 1,
    explanation: 'Rule: Nouns ending in -a are usually feminine and use "ta". Kura (hen) is feminine.'
  },
  {
    id: 'gram_057',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "bicycle":',
    sentence: '___ rower',
    hint: 'Rower ends in a consonant',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 0,
    explanation: 'Rule: Nouns ending in a consonant are usually masculine and use "ten". Rower (bicycle) is masculine.'
  },
  {
    id: 'gram_058',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "sea":',
    sentence: '___ morze',
    hint: 'Morze ends in -e',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 2,
    explanation: 'Rule: Nouns ending in -e are usually neuter and use "to". Morze (sea) is neuter.'
  },
  {
    id: 'gram_059',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "lamp":',
    sentence: '___ lampa',
    hint: 'Lampa ends in -a',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 1,
    explanation: 'Rule: Nouns ending in -a are usually feminine and use "ta". Lampa (lamp) is feminine.'
  },
  {
    id: 'gram_060',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "cookie":',
    sentence: '___ ciastko',
    hint: 'Ciastko ends in -o',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 2,
    explanation: 'Rule: Nouns ending in -o are usually neuter and use "to". Ciastko (cookie) is neuter.'
  },
  {
    id: 'gram_061',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "lion":',
    sentence: '___ lew',
    hint: 'Lew ends in a consonant',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 0,
    explanation: 'Rule: Nouns ending in a consonant are usually masculine and use "ten". Lew (lion) is masculine.'
  },
  {
    id: 'gram_062',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "mountain":',
    sentence: '___ góra',
    hint: 'Góra ends in -a',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 1,
    explanation: 'Rule: Nouns ending in -a are usually feminine and use "ta". Góra (mountain) is feminine.'
  },
  {
    id: 'gram_063',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "chair":',
    sentence: '___ krzesło',
    hint: 'Krzesło ends in -o',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 2,
    explanation: 'Rule: Nouns ending in -o are usually neuter and use "to". Krzesło (chair) is neuter.'
  },

  // ========== NEW DIFFICULTY 2 QUESTIONS ==========

  // DIFFICULTY 2 - Medium (More Plurals)
  {
    id: 'gram_064',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "lew" (lion)?',
    sentence: 'lew → ___',
    hint: 'Masculine nouns with stem changes',
    options: ['lewy', 'lwy', 'lewów', 'lewem'],
    correctIndex: 1,
    explanation: 'Rule: Some masculine nouns have stem changes in plural. Lew → lwy (lions). The -e- disappears.'
  },
  {
    id: 'gram_065',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "kura" (hen)?',
    sentence: 'kura → ___',
    hint: 'Feminine nouns ending in -a',
    options: ['kuri', 'kurą', 'kury', 'kurem'],
    correctIndex: 2,
    explanation: 'Rule: Feminine nouns ending in -a change to -y in plural. Kura → kury (hens).'
  },
  {
    id: 'gram_066',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "okno" (window)?',
    sentence: 'okno → ___',
    hint: 'Neuter nouns ending in -o',
    options: ['okny', 'okna', 'okien', 'oknem'],
    correctIndex: 1,
    explanation: 'Rule: Neuter nouns ending in -o change to -a in plural. Okno → okna (windows).'
  },
  {
    id: 'gram_067',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "lampa" (lamp)?',
    sentence: 'lampa → ___',
    hint: 'Feminine nouns ending in -a',
    options: ['lampy', 'lampą', 'lamp', 'lampem'],
    correctIndex: 0,
    explanation: 'Rule: Feminine nouns ending in -a change to -y in plural. Lampa → lampy (lamps).'
  },
  {
    id: 'gram_068',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "krzesło" (chair)?',
    sentence: 'krzesło → ___',
    hint: 'Neuter nouns ending in -o',
    options: ['krzesły', 'krzesła', 'krzesłów', 'krzesłem'],
    correctIndex: 1,
    explanation: 'Rule: Neuter nouns ending in -ło change -o to -a in plural. Krzesło → krzesła (chairs).'
  },
  {
    id: 'gram_069',
    difficulty: 2,
    category: 'grammar',
    prompt: 'What is the plural form of "ząb" (tooth)?',
    sentence: 'ząb → ___',
    hint: 'Masculine nouns with vowel change',
    options: ['ząby', 'zęby', 'zębów', 'zębem'],
    correctIndex: 1,
    explanation: 'Rule: Some nouns have vowel changes in plural. Ząb → zęby (teeth). The ą changes to ę.'
  },

  // DIFFICULTY 2 - Medium (More Verb Conjugations)
  {
    id: 'gram_070',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to do/make" (robić):',
    sentence: 'Ja ___ (I do/make)',
    hint: 'First person singular',
    options: ['robię', 'robisz', 'robi', 'robimy'],
    correctIndex: 0,
    explanation: 'Rule: "Robić" conjugation: ja robię, ty robisz, on/ona robi, my robimy, wy robicie, oni robią.'
  },
  {
    id: 'gram_071',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to write" (pisać):',
    sentence: 'On ___ (He writes)',
    hint: 'Third person singular',
    options: ['piszę', 'piszesz', 'pisze', 'piszemy'],
    correctIndex: 2,
    explanation: 'Rule: "Pisać" conjugation: ja piszę, ty piszesz, on/ona pisze, my piszemy, wy piszecie, oni piszą.'
  },
  {
    id: 'gram_072',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to run" (biegać):',
    sentence: 'My ___ (We run)',
    hint: 'First person plural',
    options: ['biegam', 'biegasz', 'biega', 'biegamy'],
    correctIndex: 3,
    explanation: 'Rule: "Biegać" conjugation: ja biegam, ty biegasz, on/ona biega, my biegamy, wy biegacie, oni biegają.'
  },
  {
    id: 'gram_073',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to play" (grać):',
    sentence: 'Ty ___ (You play)',
    hint: 'Second person singular',
    options: ['gram', 'grasz', 'gra', 'gramy'],
    correctIndex: 1,
    explanation: 'Rule: "Grać" conjugation: ja gram, ty grasz, on/ona gra, my gramy, wy gracie, oni grają.'
  },
  {
    id: 'gram_074',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to speak" (mówić):',
    sentence: 'Oni ___ (They speak)',
    hint: 'Third person plural',
    options: ['mówię', 'mówisz', 'mówi', 'mówią'],
    correctIndex: 3,
    explanation: 'Rule: "Mówić" conjugation: ja mówię, ty mówisz, on/ona mówi, my mówimy, wy mówicie, oni mówią.'
  },
  {
    id: 'gram_075',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to jump" (skakać):',
    sentence: 'Ja ___ (I jump)',
    hint: 'First person singular',
    options: ['skaczę', 'skaczesz', 'skacze', 'skaczemy'],
    correctIndex: 0,
    explanation: 'Rule: "Skakać" conjugation: ja skaczę, ty skaczesz, on/ona skacze. Note the k→cz consonant change.'
  },
  {
    id: 'gram_076',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to dance" (tańczyć):',
    sentence: 'Ona ___ (She dances)',
    hint: 'Third person singular',
    options: ['tańczę', 'tańczysz', 'tańczy', 'tańczymy'],
    correctIndex: 2,
    explanation: 'Rule: "Tańczyć" conjugation: ja tańczę, ty tańczysz, on/ona tańczy, my tańczymy, wy tańczycie, oni tańczą.'
  },
  {
    id: 'gram_077',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to swim" (pływać):',
    sentence: 'My ___ (We swim)',
    hint: 'First person plural',
    options: ['pływam', 'pływasz', 'pływa', 'pływamy'],
    correctIndex: 3,
    explanation: 'Rule: "Pływać" conjugation: ja pływam, ty pływasz, on/ona pływa, my pływamy, wy pływacie, oni pływają.'
  },

  // DIFFICULTY 2 - Medium (More Adjective Agreement)
  {
    id: 'gram_078',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the feminine noun:',
    sentence: 'Sowa jest ___ (The owl is small)',
    hint: 'Feminine adjectives often end in -a',
    options: ['mały', 'mała', 'małe', 'mali'],
    correctIndex: 1,
    explanation: 'Rule: Feminine adjectives end in -a. Sowa is feminine, so we use mała (small).'
  },
  {
    id: 'gram_079',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the masculine noun:',
    sentence: 'Dom jest ___ (The house is old)',
    hint: 'Masculine adjectives often end in -y',
    options: ['stary', 'stara', 'stare', 'starzy'],
    correctIndex: 0,
    explanation: 'Rule: Masculine singular adjectives end in -y. Dom is masculine, so we use stary (old).'
  },
  {
    id: 'gram_080',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the neuter noun:',
    sentence: 'Morze jest ___ (The sea is deep)',
    hint: 'Neuter adjectives often end in -e or -ie',
    options: ['głęboki', 'głęboka', 'głębokie', 'głęboccy'],
    correctIndex: 2,
    explanation: 'Rule: Neuter adjectives end in -e (or -ie after k, g). Morze is neuter, so we use głębokie (deep).'
  },
  {
    id: 'gram_081',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the feminine noun:',
    sentence: 'Książka jest ___ (The book is new)',
    hint: 'Feminine adjectives often end in -a',
    options: ['nowy', 'nowa', 'nowe', 'nowi'],
    correctIndex: 1,
    explanation: 'Rule: Feminine adjectives end in -a. Książka is feminine, so we use nowa (new).'
  },
  {
    id: 'gram_082',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the masculine noun:',
    sentence: 'Rycerz jest ___ (The knight is strong)',
    hint: 'Masculine adjectives often end in -y',
    options: ['silny', 'silna', 'silne', 'silni'],
    correctIndex: 0,
    explanation: 'Rule: Masculine singular adjectives end in -y. Rycerz is masculine, so we use silny (strong).'
  },
  {
    id: 'gram_083',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the neuter noun:',
    sentence: 'Jabłko jest ___ (The apple is sweet)',
    hint: 'Neuter adjectives often end in -ie after k',
    options: ['słodki', 'słodka', 'słodkie', 'słodcy'],
    correctIndex: 2,
    explanation: 'Rule: Neuter adjectives end in -ie (after k). Jabłko is neuter, so we use słodkie (sweet).'
  },

  // DIFFICULTY 2 - Medium (More jest/są)
  {
    id: 'gram_084',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose "is" or "are" for this sentence:',
    sentence: 'Psy ___ głodne (Dogs are hungry)',
    hint: '"Są" is used for plural subjects',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 1,
    explanation: 'Rule: Use "są" for plural subjects. Psy (dogs) is plural, so we use są.'
  },
  {
    id: 'gram_085',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose "is" or "are" for this sentence:',
    sentence: 'Kot ___ mały (The cat is small)',
    hint: '"Jest" is used for singular subjects',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 0,
    explanation: 'Rule: Use "jest" for singular subjects. Kot (cat) is singular, so we use jest.'
  },
  {
    id: 'gram_086',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose "is" or "are" for this sentence:',
    sentence: 'Dzieci ___ wesołe (Children are happy)',
    hint: '"Są" is used for plural subjects',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 1,
    explanation: 'Rule: Use "są" for plural subjects. Dzieci (children) is plural, so we use są.'
  },
  {
    id: 'gram_087',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose "is" or "are" for this sentence:',
    sentence: 'Książka ___ ciekawa (The book is interesting)',
    hint: '"Jest" is used for singular subjects',
    options: ['jest', 'są', 'jestem', 'jesteś'],
    correctIndex: 0,
    explanation: 'Rule: Use "jest" for singular subjects. Książka (book) is singular, so we use jest.'
  },

  // ========== NEW DIFFICULTY 3 QUESTIONS ==========

  // DIFFICULTY 3 - Hard (More Cases)
  {
    id: 'gram_088',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive case (after "od"):',
    sentence: 'Uciekam od ___ (I run from the dragon)',
    hint: '"Od" (from) requires genitive case',
    options: ['smok', 'smoka', 'smokiem', 'smoku'],
    correctIndex: 1,
    explanation: 'Rule: The preposition "od" (from) requires genitive case. Smok → smoka. Similar prepositions: od, do, bez, z (from).'
  },
  {
    id: 'gram_089',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the accusative case (direct object):',
    sentence: 'Lubię ___ (I like the cat)',
    hint: 'Direct objects of "lubić" use accusative case',
    options: ['kot', 'kota', 'kotem', 'kocie'],
    correctIndex: 1,
    explanation: 'Rule: Direct objects take accusative case. Animate masculine nouns: kot → kota. "Lubić" (to like) takes accusative.'
  },
  {
    id: 'gram_090',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (after "z"):',
    sentence: 'Rozmawiam z ___ (I talk with the owl)',
    hint: '"Z" (with) requires instrumental case',
    options: ['sowa', 'sowy', 'sowie', 'sową'],
    correctIndex: 3,
    explanation: 'Rule: "Z" (with) requires instrumental case. Feminine nouns: sowa → sową. The instrumental of -a nouns ends in -ą.'
  },
  {
    id: 'gram_091',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "na"):',
    sentence: 'Jestem na ___ (I am on the mountain)',
    hint: '"Na" (on) requires locative case',
    options: ['góra', 'góry', 'górze', 'górą'],
    correctIndex: 2,
    explanation: 'Rule: "Na" (on) requires locative case. Góra → górze. Feminine nouns ending in -a often change to -ze or -ie in locative.'
  },
  {
    id: 'gram_092',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete showing possession (genitive):',
    sentence: 'To jest miecz ___ (This is the knight\'s sword)',
    hint: 'Possession uses genitive case',
    options: ['rycerz', 'rycerza', 'rycerzem', 'rycerzu'],
    correctIndex: 1,
    explanation: 'Rule: Possession uses genitive case. Rycerz → rycerza. "Miecz rycerza" = the knight\'s sword.'
  },
  {
    id: 'gram_093',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case (indirect object):',
    sentence: 'Pomagam ___ (I help mom)',
    hint: '"Pomagać" (to help) requires dative case',
    options: ['mama', 'mamę', 'mamie', 'mamą'],
    correctIndex: 2,
    explanation: 'Rule: "Pomagać" (to help) requires dative case. Mama → mamie. Feminine -a nouns often change to -ie in dative.'
  },
  {
    id: 'gram_094',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the accusative case (direct object):',
    sentence: 'Widzę ___ (I see the owl)',
    hint: 'Feminine nouns ending in -a change to -ę',
    options: ['sowa', 'sowę', 'sowie', 'sową'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -a change to -ę in accusative. Sowa → sowę. "Widzę sowę" = I see the owl.'
  },
  {
    id: 'gram_095',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the instrumental case:',
    sentence: 'Jadę ___ (I travel by train)',
    hint: 'Means of transport uses instrumental case',
    options: ['pociąg', 'pociągu', 'pociągiem', 'pociąga'],
    correctIndex: 2,
    explanation: 'Rule: Means of transport uses instrumental case. Pociąg → pociągiem. Masculine nouns often take -em in instrumental.'
  },

  // DIFFICULTY 3 - Hard (More Tenses)
  {
    id: 'gram_096',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (feminine subject):',
    sentence: 'Sowa ___ wysoko (The owl flew high)',
    hint: 'Feminine past tense ends in -ła',
    options: ['leciał', 'leciała', 'leciało', 'lecieli'],
    correctIndex: 1,
    explanation: 'Rule: Feminine past tense uses -ła. Sowa (owl) is feminine: leciała. Masculine: leciał, Neuter: leciało.'
  },
  {
    id: 'gram_097',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (masculine subject):',
    sentence: 'Rycerz ___ smoka (The knight defeated the dragon)',
    hint: 'Masculine past tense ends in -ł',
    options: ['pokonał', 'pokonała', 'pokonało', 'pokonali'],
    correctIndex: 0,
    explanation: 'Rule: Masculine past tense uses -ł. Rycerz (knight) is masculine: pokonał. Feminine: pokonała.'
  },
  {
    id: 'gram_098',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the future tense:',
    sentence: 'Ja ___ klucz (I will find the key)',
    hint: 'Future tense of "znaleźć" (to find)',
    options: ['znajdę', 'znajdziesz', 'znajdzie', 'znajdziemy'],
    correctIndex: 0,
    explanation: 'Rule: Perfective verbs form simple future. Znaleźć → ja znajdę, ty znajdziesz, on znajdzie, my znajdziemy.'
  },
  {
    id: 'gram_099',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (neuter subject):',
    sentence: 'Dziecko ___ w piłkę (The child played ball)',
    hint: 'Neuter past tense ends in -ło',
    options: ['grał', 'grała', 'grało', 'grali'],
    correctIndex: 2,
    explanation: 'Rule: Neuter past tense uses -ło. Dziecko (child) is neuter: grało. Masculine: grał, Feminine: grała.'
  },
  {
    id: 'gram_100',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the future tense:',
    sentence: 'My ___ do domu (We will return home)',
    hint: 'Future tense of "wrócić" (to return)',
    options: ['wrócę', 'wrócisz', 'wróci', 'wrócimy'],
    correctIndex: 3,
    explanation: 'Rule: Perfective verbs form simple future. Wrócić → ja wrócę, ty wrócisz, on wróci, my wrócimy.'
  },
  {
    id: 'gram_101',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the past tense (masculine plural):',
    sentence: 'Oni ___ po lesie (They walked in the forest)',
    hint: 'Masculine personal plural past tense',
    options: ['chodził', 'chodziła', 'chodziło', 'chodzili'],
    correctIndex: 3,
    explanation: 'Rule: Masculine personal plural past tense uses -li. Oni (they, masc.) chodzili. Feminine plural: chodziły.'
  },

  // DIFFICULTY 3 - Hard (Complex Grammar)
  {
    id: 'gram_102',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'Sowa jest ___ od kury (The owl is smarter than the hen)',
    hint: 'Comparative form of "mądra" (feminine)',
    options: ['mądra', 'mądrzejsza', 'najmądrzejsza', 'mądrzy'],
    correctIndex: 1,
    explanation: 'Rule: "Mądrzejsza" is the feminine comparative of "mądry" (wise → wiser). Sowa is feminine, so we use the feminine form.'
  },
  {
    id: 'gram_103',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct superlative adjective:',
    sentence: 'Smok jest ___ potworem (The dragon is the strongest monster)',
    hint: 'Superlative form of "silny"',
    options: ['silny', 'silniejszy', 'najsilniejszy', 'silna'],
    correctIndex: 2,
    explanation: 'Rule: Superlative adds "naj-" to comparative. Silny → silniejszy → najsilniejszy (strong → stronger → strongest).'
  },
  {
    id: 'gram_104',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the imperative (command form):',
    sentence: '___ tu! (Come here!)',
    hint: 'Command form of "chodzić"',
    options: ['Chodzę', 'Chodzisz', 'Chodź', 'Chodzimy'],
    correctIndex: 2,
    explanation: 'Rule: "Chodź" is the imperative of "chodzić" (to walk/come). Imperatives are used for commands and requests.'
  },
  {
    id: 'gram_105',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the imperative (command form):',
    sentence: '___ książkę! (Read the book!)',
    hint: 'Command form of "czytać"',
    options: ['Czytam', 'Czytaj', 'Czyta', 'Czytasz'],
    correctIndex: 1,
    explanation: 'Rule: "Czytaj" is the imperative of "czytać" (to read). For -ać verbs, the imperative often uses the -aj form.'
  },
  {
    id: 'gram_106',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete the reflexive verb:',
    sentence: 'Kot ___ myje (The cat washes itself)',
    hint: 'Reflexive verbs use "się"',
    options: ['go', 'mu', 'się', 'ich'],
    correctIndex: 2,
    explanation: 'Rule: Reflexive verbs use "się" (oneself). "Myć się" = to wash oneself. Kot się myje = The cat washes itself.'
  },
  {
    id: 'gram_107',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete the negation (requires genitive):',
    sentence: 'Nie mam ___ (I don\'t have a sword)',
    hint: 'Negation of "mieć" uses genitive',
    options: ['miecz', 'miecza', 'mieczem', 'mieczu'],
    correctIndex: 1,
    explanation: 'Rule: Negation of "mieć" requires genitive. "Mam miecz" (I have a sword) → "Nie mam miecza" (I don\'t have a sword).'
  },
  {
    id: 'gram_108',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the conditional form:',
    sentence: '___ walczyć ze smokiem (He would like to fight the dragon)',
    hint: 'Conditional of "chcieć" (masculine)',
    options: ['Chce', 'Chciał', 'Chciałby', 'Chcący'],
    correctIndex: 2,
    explanation: 'Rule: Conditional uses past tense + "by". Chcieć → chciał + by = chciałby (he would like). Feminine: chciałaby.'
  },
  {
    id: 'gram_109',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct plural adjective:',
    sentence: 'Rycerze są ___ (Knights are brave)',
    hint: 'Masculine personal plural adjective',
    options: ['odważny', 'odważna', 'odważne', 'odważni'],
    correctIndex: 3,
    explanation: 'Rule: Masculine personal plural adjectives end in -i. Rycerze (knights) → odważni (brave).'
  },

  // ========== QUESTIONS gram_110 - gram_217 ==========

  // DIFFICULTY 1 - Easy (16 questions: gram_110 - gram_125)

  // Gender articles with "te" (plural)
  {
    id: 'gram_110',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for these plural nouns:',
    sentence: '___ koty (cats)',
    hint: 'Plural nouns use "te"',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 3,
    explanation: 'Rule: Plural nouns use "te" regardless of gender. Te koty (those cats), te sowy (those owls), te okna (those windows).'
  },
  {
    id: 'gram_111',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for these plural nouns:',
    sentence: '___ domy (houses)',
    hint: 'Plural nouns use "te"',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 3,
    explanation: 'Rule: All plural nouns use "te". Even though dom is masculine (ten dom), the plural domy uses "te domy".'
  },
  {
    id: 'gram_112',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "sun":',
    sentence: '___ słońce',
    hint: 'Słońce ends in -e',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 2,
    explanation: 'Rule: Nouns ending in -e are usually neuter and use "to". Słońce (sun) is neuter.'
  },
  {
    id: 'gram_113',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct article for "car":',
    sentence: '___ samochód',
    hint: 'Samochód ends in a consonant',
    options: ['ten', 'ta', 'to', 'te'],
    correctIndex: 0,
    explanation: 'Rule: Nouns ending in a consonant are usually masculine and use "ten". Samochód (car) is masculine.'
  },
  // Basic "być" (to be) conjugation
  {
    id: 'gram_114',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to be" (być):',
    sentence: 'Ja ___ uczniem (I am a student)',
    hint: 'First person singular of "być"',
    options: ['jestem', 'jesteś', 'jest', 'jesteśmy'],
    correctIndex: 0,
    explanation: 'Rule: "Być" (to be): ja jestem, ty jesteś, on/ona jest, my jesteśmy, wy jesteście, oni są.'
  },
  {
    id: 'gram_115',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to be" (być):',
    sentence: 'Ty ___ miły (You are nice)',
    hint: 'Second person singular of "być"',
    options: ['jestem', 'jesteś', 'jest', 'są'],
    correctIndex: 1,
    explanation: 'Rule: "Być" (to be): ty jesteś. "Ty jesteś miły" = You are nice.'
  },
  {
    id: 'gram_116',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to be" (być):',
    sentence: 'My ___ w szkole (We are at school)',
    hint: 'First person plural of "być"',
    options: ['jestem', 'jesteś', 'jest', 'jesteśmy'],
    correctIndex: 3,
    explanation: 'Rule: "Być" (to be): my jesteśmy. "My jesteśmy w szkole" = We are at school.'
  },
  {
    id: 'gram_117',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to be" (być):',
    sentence: 'Wy ___ gotowi (You all are ready)',
    hint: 'Second person plural of "być"',
    options: ['jestem', 'jesteś', 'jesteście', 'są'],
    correctIndex: 2,
    explanation: 'Rule: "Być" (to be): wy jesteście. "Wy jesteście gotowi" = You all are ready.'
  },
  // Simple noun plurals
  {
    id: 'gram_118',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct plural of "kwiat" (flower):',
    sentence: 'kwiat → ___',
    hint: 'Many masculine nouns add -y',
    options: ['kwiaty', 'kwiatów', 'kwiatem', 'kwiatowi'],
    correctIndex: 0,
    explanation: 'Rule: Many masculine nouns form plurals by adding -y. Kwiat → kwiaty (flowers).'
  },
  {
    id: 'gram_119',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct plural of "gwiazda" (star):',
    sentence: 'gwiazda → ___',
    hint: 'Feminine nouns ending in -a change to -y',
    options: ['gwiazdy', 'gwiazdą', 'gwiazd', 'gwiazdę'],
    correctIndex: 0,
    explanation: 'Rule: Feminine nouns ending in -da change -a to -y. Gwiazda → gwiazdy (stars).'
  },
  // Basic possessives (mój/moja/moje)
  {
    id: 'gram_120',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a masculine noun:',
    sentence: '___ kot (my cat)',
    hint: 'Masculine possessive = mój',
    options: ['mój', 'moja', 'moje', 'moi'],
    correctIndex: 0,
    explanation: 'Rule: Possessives agree with the noun gender. Masculine: mój, Feminine: moja, Neuter: moje. Kot is masculine → mój kot.'
  },
  {
    id: 'gram_121',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a feminine noun:',
    sentence: '___ sowa (my owl)',
    hint: 'Feminine possessive = moja',
    options: ['mój', 'moja', 'moje', 'moi'],
    correctIndex: 1,
    explanation: 'Rule: Possessives agree with noun gender. Sowa is feminine → moja sowa (my owl).'
  },
  {
    id: 'gram_122',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a neuter noun:',
    sentence: '___ jabłko (my apple)',
    hint: 'Neuter possessive = moje',
    options: ['mój', 'moja', 'moje', 'moi'],
    correctIndex: 2,
    explanation: 'Rule: Possessives agree with noun gender. Jabłko is neuter → moje jabłko (my apple).'
  },
  {
    id: 'gram_123',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a masculine noun:',
    sentence: '___ dom (my house)',
    hint: 'Masculine possessive = mój',
    options: ['mój', 'moja', 'moje', 'moi'],
    correctIndex: 0,
    explanation: 'Rule: Dom is masculine → mój dom (my house). Remember: mój for masculine, moja for feminine, moje for neuter.'
  },
  {
    id: 'gram_124',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a feminine noun:',
    sentence: '___ książka (my book)',
    hint: 'Feminine possessive = moja',
    options: ['mój', 'moja', 'moje', 'moi'],
    correctIndex: 1,
    explanation: 'Rule: Książka is feminine → moja książka (my book). Nouns ending in -a are usually feminine.'
  },
  {
    id: 'gram_125',
    difficulty: 1,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a neuter noun:',
    sentence: '___ okno (my window)',
    hint: 'Neuter possessive = moje',
    options: ['mój', 'moja', 'moje', 'moi'],
    correctIndex: 2,
    explanation: 'Rule: Okno is neuter → moje okno (my window). Nouns ending in -o are usually neuter.'
  },

  // DIFFICULTY 2 - Medium (48 questions: gram_126 - gram_173)

  // Accusative case (widzę kota/psa)
  {
    id: 'gram_126',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Widzę ___ (I see the dog)',
    hint: 'Animate masculine nouns change in accusative',
    options: ['pies', 'psa', 'psem', 'psu'],
    correctIndex: 1,
    explanation: 'Rule: Animate masculine nouns take accusative like genitive. Pies → psa. "Widzę psa" = I see the dog.'
  },
  {
    id: 'gram_127',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Mam ___ (I have a pen)',
    hint: 'Inanimate masculine nouns stay unchanged in accusative',
    options: ['długopis', 'długopisu', 'długopisem', 'długopisowi'],
    correctIndex: 0,
    explanation: 'Rule: Inanimate masculine nouns keep nominative form in accusative. Długopis (pen) stays długopis. Only animate masculines change.'
  },
  {
    id: 'gram_128',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Kupuję ___ (I am buying a dress)',
    hint: 'Feminine nouns ending in -a change to -ę',
    options: ['sukienka', 'sukienkę', 'sukienki', 'sukienką'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -a change to -ę in accusative. Sukienka → sukienkę. "Kupuję sukienkę" = I buy a dress.'
  },
  {
    id: 'gram_129',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Jem ___ (I eat soup)',
    hint: 'Feminine nouns ending in -a change to -ę',
    options: ['zupa', 'zupę', 'zupy', 'zupą'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -a change to -ę in accusative. Zupa → zupę. "Jem zupę" = I eat soup.'
  },
  // Locative prepositions (w/na + locative)
  {
    id: 'gram_130',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "w"):',
    sentence: 'Mieszkam w ___ (I live in a city)',
    hint: '"W" (in) requires locative case',
    options: ['miasto', 'miastem', 'mieście', 'miastów'],
    correctIndex: 2,
    explanation: 'Rule: "W" (in) requires locative. Miasto → mieście. Many neuter nouns take -cie or -ście in locative.'
  },
  {
    id: 'gram_131',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "na"):',
    sentence: 'Książka leży na ___ (The book lies on the table)',
    hint: '"Na" (on) requires locative case',
    options: ['stół', 'stołu', 'stole', 'stołem'],
    correctIndex: 2,
    explanation: 'Rule: "Na" (on) requires locative. Stół → stole. "Na stole" = on the table.'
  },
  {
    id: 'gram_132',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "w"):',
    sentence: 'Jestem w ___ (I am at school)',
    hint: '"W" (in) requires locative case',
    options: ['szkoła', 'szkoły', 'szkole', 'szkołą'],
    correctIndex: 2,
    explanation: 'Rule: "W" (in) requires locative. Szkoła → szkole. Feminine nouns ending in -a often change to -e in locative.'
  },
  // Instrumental case (z kotem)
  {
    id: 'gram_133',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (after "z"):',
    sentence: 'Bawię się z ___ (I play with the cat)',
    hint: '"Z" (with) requires instrumental case',
    options: ['kot', 'kota', 'kotem', 'kocie'],
    correctIndex: 2,
    explanation: 'Rule: "Z" (with) requires instrumental. Masculine nouns: kot → kotem. "Z kotem" = with the cat.'
  },
  {
    id: 'gram_134',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (after "z"):',
    sentence: 'Idę z ___ (I go with mom)',
    hint: '"Z" (with) requires instrumental for feminine nouns',
    options: ['mama', 'mamę', 'mamie', 'mamą'],
    correctIndex: 3,
    explanation: 'Rule: "Z" (with) requires instrumental. Feminine nouns ending in -a change to -ą. Mama → mamą. "Z mamą" = with mom.'
  },
  {
    id: 'gram_135',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (after "z"):',
    sentence: 'Gram z ___ (I play with a friend)',
    hint: '"Z" (with) requires instrumental case',
    options: ['kolega', 'kolegę', 'koledze', 'kolegą'],
    correctIndex: 3,
    explanation: 'Rule: "Z" (with) requires instrumental. Masculine nouns ending in -a (like kolega) change to -ą. "Z kolegą" = with a friend.'
  },
  // Adjective agreement (more examples)
  {
    id: 'gram_136',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the feminine noun:',
    sentence: 'Góra jest ___ (The mountain is high)',
    hint: 'Feminine adjectives end in -a',
    options: ['wysoki', 'wysoka', 'wysokie', 'wysocy'],
    correctIndex: 1,
    explanation: 'Rule: Feminine adjectives end in -a. Góra is feminine → wysoka (high). Masculine: wysoki, Neuter: wysokie.'
  },
  {
    id: 'gram_137',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the masculine noun:',
    sentence: 'Samochód jest ___ (The car is fast)',
    hint: 'Masculine adjectives end in -y or -i',
    options: ['szybki', 'szybka', 'szybkie', 'szybcy'],
    correctIndex: 0,
    explanation: 'Rule: Masculine adjectives end in -i after k. Samochód is masculine → szybki (fast).'
  },
  {
    id: 'gram_138',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the neuter noun:',
    sentence: 'Dziecko jest ___ (The child is happy)',
    hint: 'Neuter adjectives end in -e',
    options: ['wesoły', 'wesoła', 'wesołe', 'weseli'],
    correctIndex: 2,
    explanation: 'Rule: Neuter adjectives end in -e. Dziecko is neuter → wesołe (happy).'
  },
  {
    id: 'gram_139',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective that matches the plural noun:',
    sentence: 'Kwiaty są ___ (Flowers are beautiful)',
    hint: 'Non-masculine-personal plural adjectives end in -e',
    options: ['piękny', 'piękna', 'piękne', 'piękni'],
    correctIndex: 2,
    explanation: 'Rule: Non-masculine-personal plural adjectives end in -e. Kwiaty (flowers) are not masculine personal → piękne.'
  },
  // Verb conjugation present tense (-ać group)
  {
    id: 'gram_140',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to ask" (pytać):',
    sentence: 'Ty ___ (You ask)',
    hint: 'Second person singular of -ać verb',
    options: ['pytam', 'pytasz', 'pyta', 'pytamy'],
    correctIndex: 1,
    explanation: 'Rule: "Pytać" conjugation: ja pytam, ty pytasz, on/ona pyta. The -ać verbs follow a regular pattern.'
  },
  {
    id: 'gram_141',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to listen" (słuchać):',
    sentence: 'My ___ muzyki (We listen to music)',
    hint: 'First person plural of -ać verb',
    options: ['słucham', 'słuchasz', 'słucha', 'słuchamy'],
    correctIndex: 3,
    explanation: 'Rule: "Słuchać" conjugation: ja słucham, ty słuchasz, on/ona słucha, my słuchamy. Regular -ać pattern.'
  },
  {
    id: 'gram_142',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to look" (patrzeć):',
    sentence: 'On ___ na obraz (He looks at the picture)',
    hint: 'Third person singular of -eć verb',
    options: ['patrzę', 'patrzysz', 'patrzy', 'patrzymy'],
    correctIndex: 2,
    explanation: 'Rule: "Patrzeć" conjugation: ja patrzę, ty patrzysz, on/ona patrzy, my patrzymy. The -eć verbs use -y/-ysz pattern.'
  },
  // Verb conjugation present tense (-ić/-yć group)
  {
    id: 'gram_143',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to learn" (uczyć się):',
    sentence: 'Ja ___ się polskiego (I learn Polish)',
    hint: 'First person singular of -yć verb',
    options: ['uczę', 'uczysz', 'uczy', 'uczymy'],
    correctIndex: 0,
    explanation: 'Rule: "Uczyć się" conjugation: ja uczę się, ty uczysz się, on/ona uczy się. The -yć verbs use -ę/-ysz pattern.'
  },
  {
    id: 'gram_144',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to carry" (nosić):',
    sentence: 'Ona ___ plecak (She carries a backpack)',
    hint: 'Third person singular of -ić verb',
    options: ['noszę', 'nosisz', 'nosi', 'nosimy'],
    correctIndex: 2,
    explanation: 'Rule: "Nosić" conjugation: ja noszę, ty nosisz, on/ona nosi. Note the consonant change: s→sz in first person.'
  },
  // Verb conjugation present tense (-ować group)
  {
    id: 'gram_145',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to travel" (podróżować):',
    sentence: 'Oni ___ po Europie (They travel around Europe)',
    hint: 'Third person plural of -ować verb',
    options: ['podróżuję', 'podróżujesz', 'podróżuje', 'podróżują'],
    correctIndex: 3,
    explanation: 'Rule: "Podróżować" conjugation: -ować verbs change to -uję in present. Oni podróżują (they travel).'
  },
  {
    id: 'gram_146',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to draw" (rysować):',
    sentence: 'Ja ___ obraz (I draw a picture)',
    hint: 'First person singular of -ować verb',
    options: ['rysuję', 'rysujesz', 'rysuje', 'rysujemy'],
    correctIndex: 0,
    explanation: 'Rule: "Rysować" conjugation: -ować → -uję. Ja rysuję, ty rysujesz, on/ona rysuje.'
  },
  {
    id: 'gram_147',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to work" (pracować):',
    sentence: 'Ty ___ w biurze (You work in an office)',
    hint: 'Second person singular of -ować verb',
    options: ['pracuję', 'pracujesz', 'pracuje', 'pracujemy'],
    correctIndex: 1,
    explanation: 'Rule: "Pracować" conjugation: -ować → -ujesz in 2nd person. Ja pracuję, ty pracujesz, on/ona pracuje.'
  },
  // Past tense basic forms
  {
    id: 'gram_148',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the past tense (feminine subject):',
    sentence: 'Mama ___ obiad (Mom cooked dinner)',
    hint: 'Feminine past tense ends in -ła',
    options: ['gotował', 'gotowała', 'gotowało', 'gotowali'],
    correctIndex: 1,
    explanation: 'Rule: Feminine past tense uses -ła. Mama is feminine: gotowała. "Mama gotowała obiad" = Mom cooked dinner.'
  },
  {
    id: 'gram_149',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the past tense (masculine subject):',
    sentence: 'Tata ___ gazetę (Dad read the newspaper)',
    hint: 'Masculine past tense ends in -ł',
    options: ['czytał', 'czytała', 'czytało', 'czytali'],
    correctIndex: 0,
    explanation: 'Rule: Masculine past tense uses -ł. Tata is masculine: czytał. "Tata czytał gazetę" = Dad read the newspaper.'
  },
  {
    id: 'gram_150',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the past tense (masculine subject):',
    sentence: 'Piotr ___ piłkę (Piotr kicked the ball)',
    hint: 'Masculine past tense ends in -ł',
    options: ['kopnął', 'kopnęła', 'kopnęło', 'kopnęli'],
    correctIndex: 0,
    explanation: 'Rule: Masculine past tense uses -ł (or -ął/-nął for some verbs). Piotr kopnął piłkę = Piotr kicked the ball.'
  },
  // Comparison (większy, mniejszy)
  {
    id: 'gram_151',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'Pies jest ___ od kota (The dog is smaller than the cat)',
    hint: 'Comparative of "mały" (small)',
    options: ['mały', 'mniejszy', 'najmniejszy', 'mała'],
    correctIndex: 1,
    explanation: 'Rule: "Mniejszy" is the comparative of "mały" (small → smaller). Irregular: mały → mniejszy → najmniejszy.'
  },
  {
    id: 'gram_152',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'Ta książka jest ___ (This book is more interesting)',
    hint: 'Comparative of "ciekawy" (interesting)',
    options: ['ciekawy', 'ciekawsza', 'ciekawsze', 'ciekawa'],
    correctIndex: 1,
    explanation: 'Rule: Comparative of "ciekawy" is "ciekawszy" (masc.) / "ciekawsza" (fem.). Książka is feminine → ciekawsza.'
  },
  {
    id: 'gram_153',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'Jabłko jest ___ od cytryny (The apple is sweeter than the lemon)',
    hint: 'Comparative of "słodki" (sweet)',
    options: ['słodki', 'słodszy', 'najsłodszy', 'słodka'],
    correctIndex: 1,
    explanation: 'Rule: Comparative of "słodki" is "słodszy" (sweeter). Pattern: adjective stem + -szy. Superlative: najsłodszy.'
  },
  // More adjective agreement (plural forms)
  {
    id: 'gram_154',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective for masculine personal plural:',
    sentence: 'Chłopcy są ___ (Boys are tall)',
    hint: 'Masculine personal plural adjectives end in -i/-y',
    options: ['wysoki', 'wysoka', 'wysokie', 'wysocy'],
    correctIndex: 3,
    explanation: 'Rule: Masculine personal plural adjectives end in -cy (after k). Wysoki → wysocy. Chłopcy are masculine personal.'
  },
  {
    id: 'gram_155',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the adjective for non-masculine-personal plural:',
    sentence: 'Sowy są ___ (Owls are wise)',
    hint: 'Non-masculine-personal plural adjectives end in -e',
    options: ['mądry', 'mądra', 'mądre', 'mądrzy'],
    correctIndex: 2,
    explanation: 'Rule: Non-masculine-personal plural adjectives end in -e. Sowy (owls) are not masculine personal → mądre.'
  },
  // More jest/są with names
  {
    id: 'gram_156',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct form of "to be":',
    sentence: 'Ja ___ szczęśliwy (I am happy)',
    hint: 'First person singular of "być"',
    options: ['jestem', 'jesteś', 'jest', 'są'],
    correctIndex: 0,
    explanation: 'Rule: "Być" (to be): ja jestem, ty jesteś, on jest. "Ja jestem szczęśliwy" = I am happy.'
  },
  {
    id: 'gram_157',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct form of "to be":',
    sentence: 'Wy ___ zmęczeni (You all are tired)',
    hint: 'Second person plural of "być"',
    options: ['jestem', 'jesteś', 'jesteście', 'są'],
    correctIndex: 2,
    explanation: 'Rule: "Być" (to be): wy jesteście. "Wy jesteście zmęczeni" = You all are tired.'
  },
  // More verb forms: negation
  {
    id: 'gram_158',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct negation:',
    sentence: '___ lubię kawy (I don\'t like coffee)',
    hint: 'Polish negation uses "nie" before the verb',
    options: ['Nie', 'Nigdy', 'Nic', 'Żaden'],
    correctIndex: 0,
    explanation: 'Rule: Basic negation uses "nie" directly before the verb. "Nie lubię" = I don\'t like. "Nie" is the most common negation word.'
  },
  {
    id: 'gram_159',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to cook" (gotować):',
    sentence: 'Oni ___ obiad (They cook dinner)',
    hint: 'Third person plural of -ować verb',
    options: ['gotuję', 'gotujesz', 'gotuje', 'gotują'],
    correctIndex: 3,
    explanation: 'Rule: "Gotować" conjugation: -ować → -ują in 3rd person plural. Oni gotują = They cook.'
  },
  {
    id: 'gram_160',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the correct form of "to buy" (kupować):',
    sentence: 'My ___ jedzenie (We buy food)',
    hint: 'First person plural of -ować verb',
    options: ['kupuję', 'kupujesz', 'kupuje', 'kupujemy'],
    correctIndex: 3,
    explanation: 'Rule: "Kupować" conjugation: -ować → -ujemy in 1st person plural. My kupujemy = We buy.'
  },
  // Possessive twój/twoja/twoje
  {
    id: 'gram_161',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a masculine noun:',
    sentence: '___ pies (your dog)',
    hint: 'Masculine possessive "your" = twój',
    options: ['twój', 'twoja', 'twoje', 'twoi'],
    correctIndex: 0,
    explanation: 'Rule: "Your" (informal) agrees with noun gender. Masculine: twój, Feminine: twoja, Neuter: twoje. Pies is masculine → twój pies.'
  },
  {
    id: 'gram_162',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a feminine noun:',
    sentence: '___ torba (your bag)',
    hint: 'Feminine possessive "your" = twoja',
    options: ['twój', 'twoja', 'twoje', 'twoi'],
    correctIndex: 1,
    explanation: 'Rule: "Your" (informal) agrees with noun gender. Torba is feminine → twoja torba (your bag).'
  },
  {
    id: 'gram_163',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct possessive for a neuter noun:',
    sentence: '___ piwo (your beer)',
    hint: 'Neuter possessive "your" = twoje',
    options: ['twój', 'twoja', 'twoje', 'twoi'],
    correctIndex: 2,
    explanation: 'Rule: "Your" (informal) agrees with noun gender. Piwo is neuter → twoje piwo (your beer).'
  },
  // More locative
  {
    id: 'gram_164',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "w"):',
    sentence: 'Ryby pływają w ___ (Fish swim in the lake)',
    hint: '"W" (in) requires locative case',
    options: ['jezioro', 'jeziorze', 'jeziora', 'jeziorem'],
    correctIndex: 1,
    explanation: 'Rule: "W" (in) requires locative. Jezioro → jeziorze. Neuter nouns ending in -o often change to -ze in locative.'
  },
  {
    id: 'gram_165',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the locative case (after "na"):',
    sentence: 'Gramy na ___ (We play in the yard)',
    hint: '"Na" (on/in) requires locative case',
    options: ['podwórko', 'podwórku', 'podwórka', 'podwórkiem'],
    correctIndex: 1,
    explanation: 'Rule: "Na" requires locative. Podwórko → podwórku. Some neuter nouns take -u in locative.'
  },
  // More instrumental
  {
    id: 'gram_166',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the instrumental case:',
    sentence: 'Piszę ___ (I write with a pencil)',
    hint: 'Instrument of action uses instrumental case',
    options: ['ołówek', 'ołówka', 'ołówkiem', 'ołówku'],
    correctIndex: 2,
    explanation: 'Rule: The instrument used takes instrumental case. Ołówek → ołówkiem. "Piszę ołówkiem" = I write with a pencil.'
  },
  {
    id: 'gram_167',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (after "z"):',
    sentence: 'Jem chleb z ___ (I eat bread with butter)',
    hint: '"Z" (with) requires instrumental case',
    options: ['masło', 'masła', 'masłem', 'maśle'],
    correctIndex: 2,
    explanation: 'Rule: "Z" (with) requires instrumental. Neuter nouns: masło → masłem. "Z masłem" = with butter.'
  },
  // More accusative
  {
    id: 'gram_168',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Czytam ___ (I read a newspaper)',
    hint: 'Feminine nouns ending in -a change to -ę in accusative',
    options: ['gazeta', 'gazetę', 'gazety', 'gazetą'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -a change to -ę in accusative. Gazeta → gazetę. "Czytam gazetę" = I read a newspaper.'
  },
  {
    id: 'gram_169',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete using the accusative case:',
    sentence: 'Piję ___ (I drink water)',
    hint: 'Feminine nouns ending in -a change to -ę in accusative',
    options: ['woda', 'wodę', 'wody', 'wodą'],
    correctIndex: 1,
    explanation: 'Rule: Feminine nouns ending in -a change to -ę in accusative. Woda → wodę. "Piję wodę" = I drink water.'
  },
  // More comparisons
  {
    id: 'gram_170',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'To drzewo jest ___ od tamtego (This tree is taller than that one)',
    hint: 'Comparative of "wysoki" (tall)',
    options: ['wysoki', 'wyższy', 'najwyższy', 'wysoka'],
    correctIndex: 1,
    explanation: 'Rule: Comparative of "wysoki" is "wyższy" (taller). Irregular: wysoki → wyższy → najwyższy.'
  },
  {
    id: 'gram_171',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Choose the correct comparative adjective:',
    sentence: 'Ten pokój jest ___ od tamtego (This room is warmer than that one)',
    hint: 'Comparative of "ciepły" (warm)',
    options: ['ciepły', 'cieplejszy', 'najcieplejszy', 'ciepła'],
    correctIndex: 1,
    explanation: 'Rule: Comparative of "ciepły" is "cieplejszy" (warmer). Regular pattern: stem + -ejszy. Superlative: najcieplejszy.'
  },
  // More past tense
  {
    id: 'gram_172',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the past tense (feminine plural):',
    sentence: 'Dziewczynki ___ piosenkę (The girls sang a song)',
    hint: 'Feminine plural past tense ends in -ły',
    options: ['śpiewał', 'śpiewała', 'śpiewały', 'śpiewali'],
    correctIndex: 2,
    explanation: 'Rule: Feminine/non-masculine-personal plural past tense uses -ły. Dziewczynki śpiewały = The girls sang.'
  },
  {
    id: 'gram_173',
    difficulty: 2,
    category: 'grammar',
    prompt: 'Complete with the past tense (first person masculine):',
    sentence: 'Ja ___ do szkoły (I went to school)',
    hint: 'First person masculine past tense of "iść"',
    options: ['szedłem', 'szłam', 'szło', 'szli'],
    correctIndex: 0,
    explanation: 'Rule: Past tense of "iść" (to go): ja szedłem (masc.) / ja szłam (fem.). Irregular verb with stem change.'
  },

  // DIFFICULTY 3 - Hard (44 questions: gram_174 - gram_217)

  // Genitive case (nie ma + genitive)
  {
    id: 'gram_174',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete the negation (requires genitive):',
    sentence: 'Nie ma ___ (There is no water)',
    hint: 'Negation of existence uses genitive',
    options: ['woda', 'wody', 'wodę', 'wodą'],
    correctIndex: 1,
    explanation: 'Rule: "Nie ma" + genitive. Feminine nouns: woda → wody. "Nie ma wody" = There is no water.'
  },
  {
    id: 'gram_175',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive case (after "dla"):',
    sentence: 'To jest prezent dla ___ (This is a gift for mom)',
    hint: '"Dla" (for) requires genitive case',
    options: ['mama', 'mamę', 'mamy', 'mamą'],
    correctIndex: 2,
    explanation: 'Rule: "Dla" (for) requires genitive. Mama → mamy. "Dla mamy" = for mom.'
  },
  {
    id: 'gram_176',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive case (after "blisko"):',
    sentence: 'Mieszkam blisko ___ (I live near the school)',
    hint: '"Blisko" (near) requires genitive case',
    options: ['szkoła', 'szkołę', 'szkoły', 'szkołą'],
    correctIndex: 2,
    explanation: 'Rule: "Blisko" (near) requires genitive. Szkoła → szkoły. "Blisko szkoły" = near the school.'
  },
  {
    id: 'gram_177',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive case (quantity):',
    sentence: 'Mam dużo ___ (I have a lot of books)',
    hint: 'Quantity expressions require genitive plural',
    options: ['książki', 'książek', 'książkami', 'książkom'],
    correctIndex: 1,
    explanation: 'Rule: Quantity words (dużo, mało, ile) require genitive plural. Książki → książek. "Dużo książek" = a lot of books.'
  },
  // Dative case (daję kotu)
  {
    id: 'gram_178',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case:',
    sentence: 'Daję mleko ___ (I give milk to the cat)',
    hint: 'The recipient takes dative case',
    options: ['kot', 'kota', 'kotu', 'kotem'],
    correctIndex: 2,
    explanation: 'Rule: The recipient of an action takes dative. Masculine nouns: kot → kotu. "Daję mleko kotu" = I give milk to the cat.'
  },
  {
    id: 'gram_179',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case:',
    sentence: 'Daję prezent ___ (I give a gift to the girl)',
    hint: 'The recipient takes dative case',
    options: ['dziewczynka', 'dziewczynkę', 'dziewczynce', 'dziewczynką'],
    correctIndex: 2,
    explanation: 'Rule: Feminine nouns in dative: -ka → -ce. Dziewczynka → dziewczynce. "Daję prezent dziewczynce" = I give a gift to the girl.'
  },
  {
    id: 'gram_180',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case:',
    sentence: 'Podoba mi ___ ten obraz (I like this painting)',
    hint: '"Podobać się" uses dative for the person who likes',
    options: ['ja', 'mnie', 'mną', 'się'],
    correctIndex: 3,
    explanation: 'Rule: "Podobać się" uses dative + się. "Podoba mi się" = I like (literally: it pleases to me). "Mi" is dative of "ja".'
  },
  {
    id: 'gram_181',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the dative case:',
    sentence: 'Kupuję zabawkę ___ (I buy a toy for the child)',
    hint: 'The beneficiary takes dative case',
    options: ['dziecko', 'dziecka', 'dziecku', 'dzieckiem'],
    correctIndex: 2,
    explanation: 'Rule: Neuter nouns in dative: -o → -u. Dziecko → dziecku. "Kupuję zabawkę dziecku" = I buy a toy for the child.'
  },
  // Vocative case
  {
    id: 'gram_182',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the vocative case (addressing someone):',
    sentence: '___, chodź tutaj! (Mom, come here!)',
    hint: 'Vocative of feminine names/nouns ending in -a',
    options: ['Mama', 'Mamę', 'Mamo', 'Mamą'],
    correctIndex: 2,
    explanation: 'Rule: Vocative of feminine nouns ending in -a: change -a to -o. Mama → Mamo! Used when calling someone directly.'
  },
  {
    id: 'gram_183',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the vocative case (addressing someone):',
    sentence: '___, gdzie jesteś? (Piotr, where are you?)',
    hint: 'Vocative of masculine names ending in a hard consonant',
    options: ['Piotr', 'Piotra', 'Piotrze', 'Piotrem'],
    correctIndex: 2,
    explanation: 'Rule: Vocative of masculine nouns often adds -ze or -e. Piotr → Piotrze! Used for direct address.'
  },
  {
    id: 'gram_184',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the vocative case:',
    sentence: '___, pomóż nam! (God, help us!)',
    hint: 'Vocative of "Bóg" (God)',
    options: ['Bóg', 'Boga', 'Boże', 'Bogiem'],
    correctIndex: 2,
    explanation: 'Rule: Vocative of "Bóg" is "Boże". The ó→o change and -że ending. "Boże, pomóż nam!" = God, help us!'
  },
  // Conditional mood
  {
    id: 'gram_185',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the conditional form:',
    sentence: '___ pojechać na wakacje (I would like to go on vacation)',
    hint: 'Conditional of "chcieć" (first person masculine)',
    options: ['Chcę', 'Chciałem', 'Chciałbym', 'Chcąc'],
    correctIndex: 2,
    explanation: 'Rule: Conditional = past tense + by (+ personal ending). Chciałbym = I would like (masc.). Feminine: chciałabym.'
  },
  {
    id: 'gram_186',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the conditional form:',
    sentence: 'Gdybym miał pieniądze, ___ nowy dom (If I had money, I would buy a new house)',
    hint: 'Conditional of "kupić" (masculine)',
    options: ['kupię', 'kupiłem', 'kupiłbym', 'kupując'],
    correctIndex: 2,
    explanation: 'Rule: Conditional: kupiłbym = I would buy (masc.). "Gdybym" = if I. Used for hypothetical situations.'
  },
  {
    id: 'gram_187',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the conditional form:',
    sentence: 'Ona ___ ci pomóc (She would help you)',
    hint: 'Conditional of "móc" (feminine)',
    options: ['może', 'mogła', 'mogłaby', 'mogąc'],
    correctIndex: 2,
    explanation: 'Rule: Conditional feminine: mogłaby = she would be able to. Past stem (mogła) + by = mogłaby.'
  },
  // Perfective/imperfective aspect
  {
    id: 'gram_188',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the perfective verb (completed action):',
    sentence: 'Wczoraj ___ list (Yesterday I wrote a letter - completed)',
    hint: 'Perfective = completed action',
    options: ['pisałem', 'napisałem', 'piszę', 'napiszę'],
    correctIndex: 1,
    explanation: 'Rule: Perfective verbs show completed actions. Pisać (imperfective) → napisać (perfective). "Napisałem" = I wrote (and finished).'
  },
  {
    id: 'gram_189',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the imperfective verb (ongoing action):',
    sentence: 'Codziennie ___ książki (Every day I read books - ongoing)',
    hint: 'Imperfective = ongoing/repeated action',
    options: ['przeczytam', 'przeczytałem', 'czytam', 'przeczytać'],
    correctIndex: 2,
    explanation: 'Rule: Imperfective verbs show ongoing/repeated actions. Czytam (I read, regularly). Przeczytam = I will read (and finish).'
  },
  {
    id: 'gram_190',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the perfective verb for future completed action:',
    sentence: 'Jutro ___ ten film (Tomorrow I will watch this movie - will finish)',
    hint: 'Perfective future = will complete the action',
    options: ['oglądam', 'oglądałem', 'obejrzę', 'oglądać'],
    correctIndex: 2,
    explanation: 'Rule: Perfective future shows action will be completed. Oglądać (imperf.) → obejrzeć (perf.). "Obejrzę" = I will watch (to completion).'
  },
  {
    id: 'gram_191',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the imperfective past (ongoing past action):',
    sentence: 'Gdy byłem mały, ___ na rowerze (When I was small, I used to ride a bike)',
    hint: 'Imperfective past = habitual/repeated past action',
    options: ['pojechałem', 'jeździłem', 'pojadę', 'jeżdżę'],
    correctIndex: 1,
    explanation: 'Rule: Imperfective past shows habitual actions. Jeździłem = I used to ride. Pojechałem = I rode (once, completed).'
  },
  // Complex verb forms
  {
    id: 'gram_192',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the correct reflexive verb form:',
    sentence: 'Dzieci ___ się w ogrodzie (Children are playing in the garden)',
    hint: 'Reflexive verb "bawić się" (to play)',
    options: ['bawię', 'bawisz', 'bawi', 'bawią'],
    correctIndex: 3,
    explanation: 'Rule: "Bawić się" (to play): oni/one bawią się. Dzieci (children) takes 3rd person plural. "Bawią się" = they play.'
  },
  {
    id: 'gram_193',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the correct form:',
    sentence: 'Musisz ___ się uczyć (You must learn)',
    hint: '"Musieć" (must) + infinitive',
    options: ['się uczyć', 'uczysz', 'uczyć', 'nauczyć'],
    correctIndex: 0,
    explanation: 'Rule: Modal verbs (musieć, móc, chcieć) are followed by infinitives. "Musisz się uczyć" = You must learn (oneself).'
  },
  {
    id: 'gram_194',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete the impersonal construction:',
    sentence: '___ tu wchodzić (It is forbidden to enter here)',
    hint: 'Impersonal prohibition',
    options: ['Nie wolno', 'Nie chcę', 'Nie mogę', 'Nie lubię'],
    correctIndex: 0,
    explanation: 'Rule: "Nie wolno" + infinitive = it is forbidden to. Impersonal construction, no subject needed. "Nie wolno tu wchodzić."'
  },
  // Pronoun declension
  {
    id: 'gram_195',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct pronoun form (accusative):',
    sentence: 'Widzę ___ (I see you)',
    hint: 'Accusative form of "ty" (you)',
    options: ['ty', 'cię', 'tobie', 'tobą'],
    correctIndex: 1,
    explanation: 'Rule: Pronoun "ty" in accusative = cię (or ciebie for emphasis). "Widzę cię" = I see you.'
  },
  {
    id: 'gram_196',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct pronoun form (dative):',
    sentence: 'Daję ___ prezent (I give you a gift)',
    hint: 'Dative form of "ty" (you)',
    options: ['ty', 'cię', 'ci', 'tobą'],
    correctIndex: 2,
    explanation: 'Rule: Pronoun "ty" in dative = ci (or tobie for emphasis). "Daję ci prezent" = I give you a gift.'
  },
  {
    id: 'gram_197',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct pronoun form (genitive):',
    sentence: 'Nie ma ___ w domu (He is not at home)',
    hint: 'Genitive form of "on" (he)',
    options: ['on', 'go', 'jemu', 'nim'],
    correctIndex: 1,
    explanation: 'Rule: Pronoun "on" in genitive = go (or jego for emphasis). "Nie ma go" = He is not here.'
  },
  {
    id: 'gram_198',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct pronoun form (instrumental):',
    sentence: 'Idę z ___ (I go with her)',
    hint: 'Instrumental form of "ona" (she)',
    options: ['ona', 'jej', 'ją', 'nią'],
    correctIndex: 3,
    explanation: 'Rule: Pronoun "ona" in instrumental = nią. After prepositions, use "n-" forms: z nią, o niej, do niej.'
  },
  {
    id: 'gram_199',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct pronoun form (locative):',
    sentence: 'Myślę o ___ (I think about them)',
    hint: 'Locative form of "oni" (they)',
    options: ['oni', 'ich', 'im', 'nich'],
    correctIndex: 3,
    explanation: 'Rule: Pronoun "oni" in locative = nich. After prepositions: o nich, z nimi, do nich. "Myślę o nich" = I think about them.'
  },
  // Relative clauses
  {
    id: 'gram_200',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct relative pronoun:',
    sentence: 'To jest kot, ___ mieszka tutaj (This is the cat that lives here)',
    hint: 'Relative pronoun "who/that" for masculine',
    options: ['który', 'która', 'które', 'którzy'],
    correctIndex: 0,
    explanation: 'Rule: "Który" is the masculine relative pronoun (who/that/which). Kot is masculine → który. "Kot, który mieszka tutaj."'
  },
  {
    id: 'gram_201',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct relative pronoun:',
    sentence: 'To jest sowa, ___ lata w nocy (This is the owl that flies at night)',
    hint: 'Relative pronoun "who/that" for feminine',
    options: ['który', 'która', 'które', 'którzy'],
    correctIndex: 1,
    explanation: 'Rule: "Która" is the feminine relative pronoun. Sowa is feminine → która. "Sowa, która lata w nocy."'
  },
  {
    id: 'gram_202',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct relative pronoun:',
    sentence: 'To jest dziecko, ___ się bawi (This is the child that is playing)',
    hint: 'Relative pronoun "who/that" for neuter',
    options: ['który', 'która', 'które', 'którzy'],
    correctIndex: 2,
    explanation: 'Rule: "Które" is the neuter relative pronoun. Dziecko is neuter → które. "Dziecko, które się bawi."'
  },
  {
    id: 'gram_203',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct relative pronoun:',
    sentence: 'To są rycerze, ___ walczą ze smokiem (These are knights who fight the dragon)',
    hint: 'Relative pronoun for masculine personal plural',
    options: ['który', 'która', 'które', 'którzy'],
    correctIndex: 3,
    explanation: 'Rule: "Którzy" is the masculine personal plural relative pronoun. Rycerze → którzy. "Rycerze, którzy walczą."'
  },
  // Numbers with cases
  {
    id: 'gram_204',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct form after the number:',
    sentence: 'Mam dwa ___ (I have two cats)',
    hint: 'After 2-4, masculine animate nouns use special form',
    options: ['koty', 'kot', 'kotów', 'kotem'],
    correctIndex: 0,
    explanation: 'Rule: After numbers 2-4, nouns take nominative plural. Dwa koty (two cats). But after 5+, genitive plural: pięć kotów.'
  },
  {
    id: 'gram_205',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct form after the number:',
    sentence: 'Mam pięć ___ (I have five books)',
    hint: 'After 5+, nouns take genitive plural',
    options: ['książki', 'książka', 'książek', 'książką'],
    correctIndex: 2,
    explanation: 'Rule: After numbers 5 and above, nouns take genitive plural. Pięć książek (five books). Książka → książek (gen. pl.).'
  },
  {
    id: 'gram_206',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct form after the number:',
    sentence: 'Widzę trzy ___ (I see three dogs)',
    hint: 'After 2-4, use nominative plural',
    options: ['pies', 'psy', 'psów', 'psem'],
    correctIndex: 1,
    explanation: 'Rule: After numbers 2-4, nouns take nominative plural. Trzy psy (three dogs). After 5+: pięć psów (genitive plural).'
  },
  {
    id: 'gram_207',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct form after the number:',
    sentence: 'Jest siedem ___ (There are seven windows)',
    hint: 'After 5+, neuter nouns take genitive plural',
    options: ['okno', 'okna', 'okien', 'oknem'],
    correctIndex: 2,
    explanation: 'Rule: After 5+, nouns take genitive plural. Okno → okien (gen. pl.). "Siedem okien" = seven windows.'
  },
  // More complex cases
  {
    id: 'gram_208',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the genitive plural:',
    sentence: 'Nie mam ___ (I don\'t have friends)',
    hint: 'Negation of "mieć" requires genitive',
    options: ['przyjaciele', 'przyjaciół', 'przyjaciółmi', 'przyjaciołom'],
    correctIndex: 1,
    explanation: 'Rule: Negation + "mieć" requires genitive. Przyjaciel → przyjaciół (gen. pl.). "Nie mam przyjaciół" = I have no friends.'
  },
  {
    id: 'gram_209',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the correct preposition and case:',
    sentence: 'Idę ___ sklep (I am going to the shop)',
    hint: 'Direction toward a place',
    options: ['do sklepu', 'w sklepie', 'na sklep', 'ze sklepem'],
    correctIndex: 0,
    explanation: 'Rule: "Do" + genitive expresses direction toward. Sklep → sklepu (gen.). "Idę do sklepu" = I go to the shop.'
  },
  // More imperatives
  {
    id: 'gram_210',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the imperative (command form):',
    sentence: '___ cicho! (Be quiet!)',
    hint: 'Command form of "być cicho"',
    options: ['Jestem', 'Jesteś', 'Bądź', 'Będziesz'],
    correctIndex: 2,
    explanation: 'Rule: "Bądź" is the imperative of "być". "Bądź cicho!" = Be quiet! Used for commands and requests.'
  },
  {
    id: 'gram_211',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the imperative (command form):',
    sentence: '___ mi pomóc! (Help me!)',
    hint: 'Polite command using "proszę"',
    options: ['Chcesz', 'Proszę', 'Musisz', 'Możesz'],
    correctIndex: 1,
    explanation: 'Rule: "Proszę" + infinitive is a polite command. "Proszę mi pomóc" = Please help me. More formal than bare imperative.'
  },
  // More conditional
  {
    id: 'gram_212',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete with the conditional form:',
    sentence: 'Gdyby padał deszcz, ___ w domu (If it rained, I would stay at home)',
    hint: 'Conditional of "zostać" (masculine)',
    options: ['zostanę', 'zostałem', 'zostałbym', 'zostając'],
    correctIndex: 2,
    explanation: 'Rule: Conditional: zostałbym = I would stay (masc.). "Gdyby" introduces the condition. Past stem + by + personal ending.'
  },
  // More complex verb forms
  {
    id: 'gram_213',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct aspect for the context:',
    sentence: 'Właśnie ___ obiad (I am just cooking dinner - in progress)',
    hint: 'Imperfective for ongoing action',
    options: ['gotuję', 'ugotuję', 'ugotowałem', 'gotować'],
    correctIndex: 0,
    explanation: 'Rule: Use imperfective for actions in progress. Gotuję (I am cooking, ongoing). Ugotuję = I will cook (and finish).'
  },
  {
    id: 'gram_214',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Choose the correct perfective future:',
    sentence: 'Jutro ___ ten list (Tomorrow I will write this letter - complete it)',
    hint: 'Perfective future of "pisać"',
    options: ['piszę', 'pisałem', 'napiszę', 'napisałem'],
    correctIndex: 2,
    explanation: 'Rule: Perfective future = completion. Pisać (imperf.) → napisać (perf.). "Napiszę" = I will write (and finish).'
  },
  // Instrumental as predicate
  {
    id: 'gram_215',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (with "być"):',
    sentence: 'Chcę być ___ (I want to be a doctor)',
    hint: 'Professions after "być" use instrumental',
    options: ['lekarz', 'lekarza', 'lekarzem', 'lekarzu'],
    correctIndex: 2,
    explanation: 'Rule: After "być" (to be), professions/roles take instrumental. Lekarz → lekarzem. "Chcę być lekarzem" = I want to be a doctor.'
  },
  {
    id: 'gram_216',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete using the instrumental case (with "zostać"):',
    sentence: 'Ona chce zostać ___ (She wants to become a teacher)',
    hint: '"Zostać" (to become) requires instrumental',
    options: ['nauczycielka', 'nauczycielkę', 'nauczycielką', 'nauczycielce'],
    correctIndex: 2,
    explanation: 'Rule: "Zostać" (to become) takes instrumental. Nauczycielka → nauczycielką. "Zostać nauczycielką" = to become a teacher.'
  },
  {
    id: 'gram_217',
    difficulty: 3,
    category: 'grammar',
    prompt: 'Complete the sentence with the correct form:',
    sentence: 'Im więcej czytam, ___ więcej wiem (The more I read, the more I know)',
    hint: 'Correlative construction "im... tym..."',
    options: ['to', 'tym', 'ten', 'tych'],
    correctIndex: 1,
    explanation: 'Rule: "Im... tym..." is a correlative construction meaning "the more... the more...". "Im więcej czytam, tym więcej wiem."'
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GRAMMAR_QUESTIONS };
}
