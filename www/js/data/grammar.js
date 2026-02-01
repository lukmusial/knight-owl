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
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GRAMMAR_QUESTIONS };
}
