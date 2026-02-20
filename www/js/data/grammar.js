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
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GRAMMAR_QUESTIONS };
}
