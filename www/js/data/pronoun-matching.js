/**
 * Pronoun Matching Questions Data
 * Pronoun-noun and numeral-noun matching sets.
 * Two subtypes: demonstrative (gender agreement) and numeral (number agreement).
 */

const PRONOUN_MATCHING_QUESTIONS = [
  // ============================================================
  // DIFFICULTY 1 — EASY (88 sets: 44 demonstrative, 44 numeral)
  // ============================================================

  // --- Demonstrative sets (difficulty 1) ---
  {
    id: 'pronoun_001', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kot' },
      { left: 'ta', right: 'sowa' },
      { left: 'to', right: 'okno' },
      { left: 'te', right: 'drzewa' }
    ]
  },
  {
    id: 'pronoun_002', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pies' },
      { left: 'ta', right: 'kawa' },
      { left: 'to', right: 'mleko' },
      { left: 'te', right: 'koty' }
    ]
  },
  {
    id: 'pronoun_003', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dom' },
      { left: 'ta', right: 'mama' },
      { left: 'to', right: 'dziecko' },
      { left: 'te', right: 'jabłka' }
    ]
  },
  {
    id: 'pronoun_004', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'koń' },
      { left: 'ta', right: 'ryba' },
      { left: 'to', right: 'jajko' },
      { left: 'te', right: 'psy' }
    ]
  },
  {
    id: 'pronoun_005', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'stół' },
      { left: 'ta', right: 'lampa' },
      { left: 'to', right: 'krzesło' },
      { left: 'te', right: 'książki' }
    ]
  },
  {
    id: 'pronoun_006', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'samochód' },
      { left: 'ta', right: 'szkoła' },
      { left: 'to', right: 'auto' },
      { left: 'te', right: 'domy' }
    ]
  },
  {
    id: 'pronoun_007', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ptak' },
      { left: 'ta', right: 'gwiazda' },
      { left: 'to', right: 'słońce' },
      { left: 'te', right: 'chmury' }
    ]
  },
  {
    id: 'pronoun_008', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ser' },
      { left: 'ta', right: 'woda' },
      { left: 'to', right: 'masło' },
      { left: 'te', right: 'owoce' }
    ]
  },
  {
    id: 'pronoun_009', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'chleb' },
      { left: 'ta', right: 'herbata' },
      { left: 'to', right: 'ciasto' },
      { left: 'te', right: 'ciastka' }
    ]
  },
  {
    id: 'pronoun_010', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kwiat' },
      { left: 'ta', right: 'róża' },
      { left: 'to', right: 'drzewo' },
      { left: 'te', right: 'kwiaty' }
    ]
  },
  {
    id: 'pronoun_011', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'but' },
      { left: 'ta', right: 'sukienka' },
      { left: 'to', right: 'lustro' },
      { left: 'te', right: 'buty' }
    ]
  },
  {
    id: 'pronoun_012', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kapelusz' },
      { left: 'ta', right: 'torba' },
      { left: 'to', right: 'pudełko' },
      { left: 'te', right: 'torby' }
    ]
  },
  {
    id: 'pronoun_013', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'most' },
      { left: 'ta', right: 'rzeka' },
      { left: 'to', right: 'jezioro' },
      { left: 'te', right: 'góry' }
    ]
  },
  {
    id: 'pronoun_014', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'obraz' },
      { left: 'ta', right: 'ściana' },
      { left: 'to', right: 'zdjęcie' },
      { left: 'te', right: 'obrazy' }
    ]
  },
  {
    id: 'pronoun_015', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'telefon' },
      { left: 'ta', right: 'gazeta' },
      { left: 'to', right: 'radio' },
      { left: 'te', right: 'telefony' }
    ]
  },
  {
    id: 'pronoun_016', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ołówek' },
      { left: 'ta', right: 'kredka' },
      { left: 'to', right: 'pióro' },
      { left: 'te', right: 'kredki' }
    ]
  },
  {
    id: 'pronoun_017', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kubek' },
      { left: 'ta', right: 'filiżanka' },
      { left: 'to', right: 'naczynie' },
      { left: 'te', right: 'kubki' }
    ]
  },
  {
    id: 'pronoun_018', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'talerz' },
      { left: 'ta', right: 'łyżka' },
      { left: 'to', right: 'naczynie' },
      { left: 'te', right: 'talerze' }
    ]
  },
  {
    id: 'pronoun_019', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'klucz' },
      { left: 'ta', right: 'brama' },
      { left: 'to', right: 'mieszkanie' },
      { left: 'te', right: 'klucze' }
    ]
  },
  {
    id: 'pronoun_020', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'zamek' },
      { left: 'ta', right: 'wieża' },
      { left: 'to', right: 'miasto' },
      { left: 'te', right: 'zamki' }
    ]
  },
  {
    id: 'pronoun_021', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'las' },
      { left: 'ta', right: 'polana' },
      { left: 'to', right: 'pole' },
      { left: 'te', right: 'lasy' }
    ]
  },
  {
    id: 'pronoun_022', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'nóż' },
      { left: 'ta', right: 'miska' },
      { left: 'to', right: 'wiaderko' },
      { left: 'te', right: 'noże' }
    ]
  },
  {
    id: 'pronoun_023', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'komputer' },
      { left: 'ta', right: 'mysz' },
      { left: 'to', right: 'biurko' },
      { left: 'te', right: 'komputery' }
    ]
  },
  {
    id: 'pronoun_024', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'rower' },
      { left: 'ta', right: 'piłka' },
      { left: 'to', right: 'boisko' },
      { left: 'te', right: 'rowery' }
    ]
  },
  {
    id: 'pronoun_025', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'zegar' },
      { left: 'ta', right: 'szafa' },
      { left: 'to', right: 'łóżko' },
      { left: 'te', right: 'zegary' }
    ]
  },
  {
    id: 'pronoun_026', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'parasol' },
      { left: 'ta', right: 'kurtka' },
      { left: 'to', right: 'ubranie' },
      { left: 'te', right: 'parasole' }
    ]
  },
  {
    id: 'pronoun_027', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'balon' },
      { left: 'ta', right: 'zabawka' },
      { left: 'to', right: 'kółko' },
      { left: 'te', right: 'balony' }
    ]
  },
  {
    id: 'pronoun_028', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'długopis' },
      { left: 'ta', right: 'kartka' },
      { left: 'to', right: 'zeszyt' },
      { left: 'te', right: 'kartki' }
    ]
  },
  {
    id: 'pronoun_029', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kort' },
      { left: 'ta', right: 'siatka' },
      { left: 'to', right: 'podwórko' },
      { left: 'te', right: 'piłki' }
    ]
  },
  {
    id: 'pronoun_030', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'plecak' },
      { left: 'ta', right: 'czapka' },
      { left: 'to', right: 'lusterko' },
      { left: 'te', right: 'plecaki' }
    ]
  },
  {
    id: 'pronoun_031', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'worek' },
      { left: 'ta', right: 'skrzynka' },
      { left: 'to', right: 'pudło' },
      { left: 'te', right: 'worki' }
    ]
  },
  {
    id: 'pronoun_032', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sok' },
      { left: 'ta', right: 'lemoniada' },
      { left: 'to', right: 'kakao' },
      { left: 'te', right: 'soki' }
    ]
  },
  {
    id: 'pronoun_033', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'miś' },
      { left: 'ta', right: 'lalka' },
      { left: 'to', right: 'autko' },
      { left: 'te', right: 'misie' }
    ]
  },
  {
    id: 'pronoun_034', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wąż' },
      { left: 'ta', right: 'żaba' },
      { left: 'to', right: 'gniazdo' },
      { left: 'te', right: 'żaby' }
    ]
  },
  {
    id: 'pronoun_035', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ogród' },
      { left: 'ta', right: 'grządka' },
      { left: 'to', right: 'warzywo' },
      { left: 'te', right: 'ogrody' }
    ]
  },
  {
    id: 'pronoun_036', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'garnek' },
      { left: 'ta', right: 'patelnia' },
      { left: 'to', right: 'nakrycie' },
      { left: 'te', right: 'garnki' }
    ]
  },
  {
    id: 'pronoun_037', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dywan' },
      { left: 'ta', right: 'poduszka' },
      { left: 'to', right: 'światło' },
      { left: 'te', right: 'dywany' }
    ]
  },
  {
    id: 'pronoun_038', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'telewizor' },
      { left: 'ta', right: 'kanapa' },
      { left: 'to', right: 'krzesło' },
      { left: 'te', right: 'telewizory' }
    ]
  },
  {
    id: 'pronoun_039', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kosz' },
      { left: 'ta', right: 'butelka' },
      { left: 'to', right: 'wiadro' },
      { left: 'te', right: 'kosze' }
    ]
  },
  {
    id: 'pronoun_040', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'tort' },
      { left: 'ta', right: 'świeczka' },
      { left: 'to', right: 'przyjęcie' },
      { left: 'te', right: 'torty' }
    ]
  },
  {
    id: 'pronoun_041', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'motyl' },
      { left: 'ta', right: 'biedronka' },
      { left: 'to', right: 'gniazdo' },
      { left: 'te', right: 'motyle' }
    ]
  },
  {
    id: 'pronoun_042', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dzwonek' },
      { left: 'ta', right: 'flaga' },
      { left: 'to', right: 'jabłko' },
      { left: 'te', right: 'dzwonki' }
    ]
  },
  {
    id: 'pronoun_043', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'szalik' },
      { left: 'ta', right: 'rękawiczka' },
      { left: 'to', right: 'ucho' },
      { left: 'te', right: 'szaliki' }
    ]
  },
  {
    id: 'pronoun_044', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kamień' },
      { left: 'ta', right: 'trawa' },
      { left: 'to', right: 'morze' },
      { left: 'te', right: 'kamienie' }
    ]
  },

  // --- Numeral sets (difficulty 1) ---
  {
    id: 'pronoun_045', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kot' },
      { left: 'dwa', right: 'psy' },
      { left: 'trzy', right: 'ptaki' },
      { left: 'cztery', right: 'konie' }
    ]
  },
  {
    id: 'pronoun_046', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'ryba' },
      { left: 'dwie', right: 'żaby' },
      { left: 'trzy', right: 'sowy' },
      { left: 'cztery', right: 'krowy' }
    ]
  },
  {
    id: 'pronoun_047', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'dziecko' },
      { left: 'dwa', right: 'okna' },
      { left: 'trzy', right: 'jajka' },
      { left: 'cztery', right: 'krzesła' }
    ]
  },
  {
    id: 'pronoun_048', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'dom' },
      { left: 'dwa', right: 'domy' },
      { left: 'trzy', right: 'samochody' },
      { left: 'cztery', right: 'rowery' }
    ]
  },
  {
    id: 'pronoun_049', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'piłka' },
      { left: 'dwie', right: 'lalki' },
      { left: 'trzy', right: 'zabawki' },
      { left: 'cztery', right: 'książki' }
    ]
  },
  {
    id: 'pronoun_050', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'stół' },
      { left: 'dwa', right: 'stoły' },
      { left: 'trzy', right: 'talerze' },
      { left: 'cztery', right: 'kubki' }
    ]
  },
  {
    id: 'pronoun_051', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'gwiazda' },
      { left: 'dwie', right: 'gwiazdy' },
      { left: 'trzy', right: 'chmury' },
      { left: 'cztery', right: 'góry' }
    ]
  },
  {
    id: 'pronoun_052', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'okno' },
      { left: 'dwa', right: 'drzewa' },
      { left: 'trzy', right: 'jabłka' },
      { left: 'cztery', right: 'pudełka' }
    ]
  },
  {
    id: 'pronoun_053', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'klucz' },
      { left: 'dwa', right: 'klucze' },
      { left: 'trzy', right: 'zamki' },
      { left: 'cztery', right: 'mosty' }
    ]
  },
  {
    id: 'pronoun_054', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'szkoła' },
      { left: 'dwie', right: 'szkoły' },
      { left: 'trzy', right: 'ulice' },
      { left: 'cztery', right: 'bramy' }
    ]
  },
  {
    id: 'pronoun_055', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'obraz' },
      { left: 'dwa', right: 'obrazy' },
      { left: 'trzy', right: 'zegary' },
      { left: 'cztery', right: 'długopisy' }
    ]
  },
  {
    id: 'pronoun_056', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'lustro' },
      { left: 'dwa', right: 'lustra' },
      { left: 'trzy', right: 'pióra' },
      { left: 'cztery', right: 'światła' }
    ]
  },
  {
    id: 'pronoun_057', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'lampa' },
      { left: 'dwie', right: 'lampy' },
      { left: 'trzy', right: 'torby' },
      { left: 'cztery', right: 'filiżanki' }
    ]
  },
  {
    id: 'pronoun_058', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kwiat' },
      { left: 'dwa', right: 'kwiaty' },
      { left: 'trzy', right: 'liście' },
      { left: 'cztery', right: 'kamienie' }
    ]
  },
  {
    id: 'pronoun_059', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'kredka' },
      { left: 'dwie', right: 'kredki' },
      { left: 'trzy', right: 'kartki' },
      { left: 'cztery', right: 'świeczki' }
    ]
  },
  {
    id: 'pronoun_060', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'garnek' },
      { left: 'dwa', right: 'garnki' },
      { left: 'trzy', right: 'noże' },
      { left: 'cztery', right: 'widelce' }
    ]
  },
  {
    id: 'pronoun_061', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'ciasto' },
      { left: 'dwa', right: 'ciastka' },
      { left: 'trzy', right: 'lody' },
      { left: 'cztery', right: 'owoce' }
    ]
  },
  {
    id: 'pronoun_062', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'butelka' },
      { left: 'dwie', right: 'butelki' },
      { left: 'trzy', right: 'szklanki' },
      { left: 'cztery', right: 'miski' }
    ]
  },
  {
    id: 'pronoun_063', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'balon' },
      { left: 'dwa', right: 'balony' },
      { left: 'trzy', right: 'misie' },
      { left: 'cztery', right: 'motyle' }
    ]
  },
  {
    id: 'pronoun_064', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'czapka' },
      { left: 'dwie', right: 'czapki' },
      { left: 'trzy', right: 'kurtki' },
      { left: 'cztery', right: 'sukienki' }
    ]
  },
  {
    id: 'pronoun_065', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'plecak' },
      { left: 'dwa', right: 'plecaki' },
      { left: 'trzy', right: 'worki' },
      { left: 'cztery', right: 'kosze' }
    ]
  },
  {
    id: 'pronoun_066', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'łóżko' },
      { left: 'dwa', right: 'łóżka' },
      { left: 'trzy', right: 'biurka' },
      { left: 'cztery', right: 'okna' }
    ]
  },
  {
    id: 'pronoun_067', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'róża' },
      { left: 'dwie', right: 'róże' },
      { left: 'trzy', right: 'grządki' },
      { left: 'cztery', right: 'łyżki' }
    ]
  },
  {
    id: 'pronoun_068', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'parasol' },
      { left: 'dwa', right: 'parasole' },
      { left: 'trzy', right: 'szaliki' },
      { left: 'cztery', right: 'dzwonki' }
    ]
  },
  {
    id: 'pronoun_069', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'biedronka' },
      { left: 'dwie', right: 'biedronki' },
      { left: 'trzy', right: 'pszczoły' },
      { left: 'cztery', right: 'ważki' }
    ]
  },
  {
    id: 'pronoun_070', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ołówek' },
      { left: 'dwa', right: 'ołówki' },
      { left: 'trzy', right: 'zeszyty' },
      { left: 'cztery', right: 'penały' }
    ]
  },
  {
    id: 'pronoun_071', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'ziarno' },
      { left: 'dwa', right: 'ziarna' },
      { left: 'trzy', right: 'gniazda' },
      { left: 'cztery', right: 'jaja' }
    ]
  },
  {
    id: 'pronoun_072', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'poduszka' },
      { left: 'dwie', right: 'poduszki' },
      { left: 'trzy', right: 'kołdry' },
      { left: 'cztery', right: 'prześcieradła' }
    ]
  },
  {
    id: 'pronoun_073', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tort' },
      { left: 'dwa', right: 'torty' },
      { left: 'trzy', right: 'cukierki' },
      { left: 'cztery', right: 'lizaki' }
    ]
  },
  {
    id: 'pronoun_074', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'kanapa' },
      { left: 'dwie', right: 'kanapy' },
      { left: 'trzy', right: 'szafy' },
      { left: 'cztery', right: 'półki' }
    ]
  },
  {
    id: 'pronoun_075', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'telewizor' },
      { left: 'dwa', right: 'telewizory' },
      { left: 'trzy', right: 'telefony' },
      { left: 'cztery', right: 'komputery' }
    ]
  },
  {
    id: 'pronoun_076', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'mieszkanie' },
      { left: 'dwa', right: 'mieszkania' },
      { left: 'trzy', right: 'miasta' },
      { left: 'cztery', right: 'jeziora' }
    ]
  },
  {
    id: 'pronoun_077', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'miska' },
      { left: 'dwie', right: 'patelnie' },
      { left: 'trzy', right: 'łyżeczki' },
      { left: 'cztery', right: 'rękawiczki' }
    ]
  },
  {
    id: 'pronoun_078', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'dywan' },
      { left: 'dwa', right: 'dywany' },
      { left: 'trzy', right: 'obrazy' },
      { left: 'cztery', right: 'wazony' }
    ]
  },
  {
    id: 'pronoun_079', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'ściana' },
      { left: 'dwie', right: 'ściany' },
      { left: 'trzy', right: 'podłogi' },
      { left: 'cztery', right: 'polany' }
    ]
  },
  {
    id: 'pronoun_080', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ser' },
      { left: 'dwa', right: 'sery' },
      { left: 'trzy', right: 'chleby' },
      { left: 'cztery', right: 'soki' }
    ]
  },
  {
    id: 'pronoun_081', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'pole' },
      { left: 'dwa', right: 'pola' },
      { left: 'trzy', right: 'morza' },
      { left: 'cztery', right: 'boiska' }
    ]
  },
  {
    id: 'pronoun_082', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'flaga' },
      { left: 'dwie', right: 'flagi' },
      { left: 'trzy', right: 'siatki' },
      { left: 'cztery', right: 'skrzynki' }
    ]
  },
  {
    id: 'pronoun_083', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'sok' },
      { left: 'dwa', right: 'kubki' },
      { left: 'trzy', right: 'talerze' },
      { left: 'cztery', right: 'koszyki' }
    ]
  },
  {
    id: 'pronoun_084', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'gazeta' },
      { left: 'dwie', right: 'gazety' },
      { left: 'trzy', right: 'koperty' },
      { left: 'cztery', right: 'pocztówki' }
    ]
  },
  {
    id: 'pronoun_085', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'but' },
      { left: 'dwa', right: 'buty' },
      { left: 'trzy', right: 'kapcie' },
      { left: 'cztery', right: 'kapelusze' }
    ]
  },
  {
    id: 'pronoun_086', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'radio' },
      { left: 'dwa', right: 'radia' },
      { left: 'trzy', right: 'zdjęcia' },
      { left: 'cztery', right: 'wiadra' }
    ]
  },
  {
    id: 'pronoun_087', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'trawa' },
      { left: 'dwie', right: 'trawy' },
      { left: 'trzy', right: 'rzeki' },
      { left: 'cztery', right: 'drogi' }
    ]
  },
  {
    id: 'pronoun_088', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'las' },
      { left: 'dwa', right: 'lasy' },
      { left: 'trzy', right: 'ogrody' },
      { left: 'cztery', right: 'parki' }
    ]
  },

  // ============================================================
  // DIFFICULTY 2 — MEDIUM (54 sets: 27 demonstrative, 27 numeral)
  // ============================================================

  // --- Demonstrative sets (difficulty 2) ---
  {
    id: 'pronoun_089', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kalendarz' },
      { left: 'ta', right: 'biblioteka' },
      { left: 'to', right: 'muzeum' },
      { left: 'ci', right: 'chłopcy' }
    ]
  },
  {
    id: 'pronoun_090', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'strażak' },
      { left: 'ta', right: 'aktorka' },
      { left: 'to', right: 'przedstawienie' },
      { left: 'ci', right: 'aktorzy' }
    ]
  },
  {
    id: 'pronoun_091', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'rycerz' },
      { left: 'ta', right: 'zbroja' },
      { left: 'to', right: 'zaklęcie' },
      { left: 'ci', right: 'rycerze' }
    ]
  },
  {
    id: 'pronoun_092', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'lekarz' },
      { left: 'ta', right: 'pielęgniarka' },
      { left: 'to', right: 'łóżko' },
      { left: 'ci', right: 'lekarze' }
    ]
  },
  {
    id: 'pronoun_093', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'malarz' },
      { left: 'ta', right: 'farba' },
      { left: 'to', right: 'malowidło' },
      { left: 'ci', right: 'malarze' }
    ]
  },
  {
    id: 'pronoun_094', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wulkan' },
      { left: 'ta', right: 'pustynia' },
      { left: 'to', right: 'wybrzeże' },
      { left: 'te', right: 'wyspy' }
    ]
  },
  {
    id: 'pronoun_095', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'magnes' },
      { left: 'ta', right: 'lupa' },
      { left: 'to', right: 'szkiełko' },
      { left: 'te', right: 'lupy' }
    ]
  },
  {
    id: 'pronoun_096', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'lekarz' },
      { left: 'ta', right: 'apteka' },
      { left: 'to', right: 'lekarstwo' },
      { left: 'ci', right: 'lekarze' }
    ]
  },
  {
    id: 'pronoun_097', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'księżyc' },
      { left: 'ta', right: 'gwiazda' },
      { left: 'to', right: 'niebo' },
      { left: 'te', right: 'gwiazdy' }
    ]
  },
  {
    id: 'pronoun_098', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'tramwaj' },
      { left: 'ta', right: 'stacja' },
      { left: 'to', right: 'lotnisko' },
      { left: 'ci', right: 'kierowcy' }
    ]
  },
  {
    id: 'pronoun_099', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'aktor' },
      { left: 'ta', right: 'scena' },
      { left: 'to', right: 'kino' },
      { left: 'ci', right: 'aktorzy' }
    ]
  },
  {
    id: 'pronoun_100', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'podręcznik' },
      { left: 'ta', right: 'tablica' },
      { left: 'to', right: 'zadanie' },
      { left: 'ci', right: 'uczniowie' }
    ]
  },
  {
    id: 'pronoun_101', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'budynek' },
      { left: 'ta', right: 'szkoła' },
      { left: 'to', right: 'boisko' },
      { left: 'te', right: 'budynki' }
    ]
  },
  {
    id: 'pronoun_102', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'turniej' },
      { left: 'ta', right: 'drużyna' },
      { left: 'to', right: 'boisko' },
      { left: 'ci', right: 'sportowcy' }
    ]
  },
  {
    id: 'pronoun_103', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'list' },
      { left: 'ta', right: 'koperta' },
      { left: 'to', right: 'biurko' },
      { left: 'te', right: 'listy' }
    ]
  },
  {
    id: 'pronoun_104', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wiatrak' },
      { left: 'ta', right: 'latarnia' },
      { left: 'to', right: 'światło' },
      { left: 'te', right: 'wiatraki' }
    ]
  },
  {
    id: 'pronoun_105', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kapitan' },
      { left: 'ta', right: 'łódź' },
      { left: 'to', right: 'morze' },
      { left: 'ci', right: 'rybacy' }
    ]
  },
  {
    id: 'pronoun_106', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'fortepian' },
      { left: 'ta', right: 'gitara' },
      { left: 'to', right: 'pianino' },
      { left: 'ci', right: 'muzycy' }
    ]
  },
  {
    id: 'pronoun_107', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'telewizor' },
      { left: 'ta', right: 'kamera' },
      { left: 'to', right: 'zdjęcie' },
      { left: 'te', right: 'zdjęcia' }
    ]
  },
  {
    id: 'pronoun_108', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kucharz' },
      { left: 'ta', right: 'restauracja' },
      { left: 'to', right: 'menu' },
      { left: 'ci', right: 'kelnerzy' }
    ]
  },
  {
    id: 'pronoun_109', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pociąg' },
      { left: 'ta', right: 'lokomotywa' },
      { left: 'to', right: 'przejście' },
      { left: 'te', right: 'tory' }
    ]
  },
  {
    id: 'pronoun_110', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'portfel' },
      { left: 'ta', right: 'torebka' },
      { left: 'to', right: 'pudełeczko' },
      { left: 'te', right: 'portfele' }
    ]
  },
  {
    id: 'pronoun_111', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sopel' },
      { left: 'ta', right: 'jaskinia' },
      { left: 'to', right: 'źródło' },
      { left: 'te', right: 'sople' }
    ]
  },
  {
    id: 'pronoun_112', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pilot' },
      { left: 'ta', right: 'zabawka' },
      { left: 'to', right: 'pudełko' },
      { left: 'te', right: 'zabawki' }
    ]
  },
  {
    id: 'pronoun_113', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'piekarnik' },
      { left: 'ta', right: 'lodówka' },
      { left: 'to', right: 'zmywanie' },
      { left: 'te', right: 'piekarniki' }
    ]
  },
  {
    id: 'pronoun_114', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'bęben' },
      { left: 'ta', right: 'trąbka' },
      { left: 'to', right: 'pianino' },
      { left: 'ci', right: 'muzycy' }
    ]
  },
  {
    id: 'pronoun_115', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pomnik' },
      { left: 'ta', right: 'fontanna' },
      { left: 'to', right: 'jezioro' },
      { left: 'te', right: 'pomniki' }
    ]
  },

  // --- Numeral sets (difficulty 2) ---
  {
    id: 'pronoun_116', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kalendarz' },
      { left: 'dwa', right: 'kalendarze' },
      { left: 'trzy', right: 'podręczniki' },
      { left: 'pięć', right: 'zeszytów' }
    ]
  },
  {
    id: 'pronoun_117', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'biblioteka' },
      { left: 'dwie', right: 'biblioteki' },
      { left: 'cztery', right: 'szkoły' },
      { left: 'pięć', right: 'kościołów' }
    ]
  },
  {
    id: 'pronoun_118', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'muzeum' },
      { left: 'dwa', right: 'muzea' },
      { left: 'trzy', right: 'kina' },
      { left: 'pięć', right: 'teatrów' }
    ]
  },
  {
    id: 'pronoun_119', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rycerz' },
      { left: 'dwa', right: 'miecze' },
      { left: 'cztery', right: 'mundury' },
      { left: 'pięć', right: 'tarcz' }
    ]
  },
  {
    id: 'pronoun_120', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'planeta' },
      { left: 'dwie', right: 'planety' },
      { left: 'trzy', right: 'komety' },
      { left: 'pięć', right: 'gwiazd' }
    ]
  },
  {
    id: 'pronoun_121', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tramwaj' },
      { left: 'dwa', right: 'tramwaje' },
      { left: 'cztery', right: 'autobusy' },
      { left: 'pięć', right: 'pociągów' }
    ]
  },
  {
    id: 'pronoun_122', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'muzeum' },
      { left: 'dwa', right: 'muzea' },
      { left: 'trzy', right: 'kina' },
      { left: 'pięć', right: 'boisk' }
    ]
  },
  {
    id: 'pronoun_123', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'drużyna' },
      { left: 'dwie', right: 'drużyny' },
      { left: 'cztery', right: 'klasy' },
      { left: 'pięć', right: 'drużyn' }
    ]
  },
  {
    id: 'pronoun_124', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'budynek' },
      { left: 'dwa', right: 'budynki' },
      { left: 'trzy', right: 'wieżowce' },
      { left: 'pięć', right: 'wieżowców' }
    ]
  },
  {
    id: 'pronoun_125', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'restauracja' },
      { left: 'dwie', right: 'restauracje' },
      { left: 'cztery', right: 'kawiarnie' },
      { left: 'pięć', right: 'piekarni' }
    ]
  },
  {
    id: 'pronoun_126', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'lotnisko' },
      { left: 'dwa', right: 'lotniska' },
      { left: 'trzy', right: 'jeziora' },
      { left: 'pięć', right: 'miast' }
    ]
  },
  {
    id: 'pronoun_127', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wodospad' },
      { left: 'dwa', right: 'wodospady' },
      { left: 'cztery', right: 'kamienie' },
      { left: 'pięć', right: 'skał' }
    ]
  },
  {
    id: 'pronoun_128', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'jaskinia' },
      { left: 'dwie', right: 'jaskinie' },
      { left: 'trzy', right: 'doliny' },
      { left: 'pięć', right: 'jaskiń' }
    ]
  },
  {
    id: 'pronoun_129', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zeszyt' },
      { left: 'dwa', right: 'zeszyty' },
      { left: 'cztery', right: 'plakaty' },
      { left: 'pięć', right: 'listów' }
    ]
  },
  {
    id: 'pronoun_130', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'akwarium' },
      { left: 'dwa', right: 'akwaria' },
      { left: 'trzy', right: 'muzea' },
      { left: 'pięć', right: 'kin' }
    ]
  },
  {
    id: 'pronoun_131', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'fontanna' },
      { left: 'dwie', right: 'fontanny' },
      { left: 'cztery', right: 'wieże' },
      { left: 'pięć', right: 'bram' }
    ]
  },
  {
    id: 'pronoun_132', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'fortepian' },
      { left: 'dwa', right: 'fortepiany' },
      { left: 'trzy', right: 'perkusje' },
      { left: 'pięć', right: 'skrzypiec' }
    ]
  },
  {
    id: 'pronoun_133', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'gitara' },
      { left: 'dwie', right: 'gitary' },
      { left: 'cztery', right: 'trąbki' },
      { left: 'pięć', right: 'fletów' }
    ]
  },
  {
    id: 'pronoun_134', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'monitor' },
      { left: 'dwa', right: 'monitory' },
      { left: 'trzy', right: 'ekrany' },
      { left: 'pięć', right: 'kabli' }
    ]
  },
  {
    id: 'pronoun_135', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'lokomotywa' },
      { left: 'dwie', right: 'lokomotywy' },
      { left: 'cztery', right: 'przyczepy' },
      { left: 'pięć', right: 'wagonów' }
    ]
  },
  {
    id: 'pronoun_136', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'wiaderko' },
      { left: 'dwa', right: 'wiaderka' },
      { left: 'trzy', right: 'łopatki' },
      { left: 'pięć', right: 'wiaderek' }
    ]
  },
  {
    id: 'pronoun_137', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'pomnik' },
      { left: 'dwa', right: 'pomniki' },
      { left: 'cztery', right: 'zamki' },
      { left: 'pięć', right: 'wież' }
    ]
  },
  {
    id: 'pronoun_138', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'gitara' },
      { left: 'dwie', right: 'gitary' },
      { left: 'trzy', right: 'trąbki' },
      { left: 'pięć', right: 'bębnów' }
    ]
  },
  {
    id: 'pronoun_139', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'piekarnik' },
      { left: 'dwa', right: 'piekarniki' },
      { left: 'cztery', right: 'mikrofale' },
      { left: 'pięć', right: 'lodówek' }
    ]
  },
  {
    id: 'pronoun_140', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'podwórko' },
      { left: 'dwa', right: 'podwórka' },
      { left: 'trzy', right: 'boiska' },
      { left: 'pięć', right: 'podwórek' }
    ]
  },
  {
    id: 'pronoun_141', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'piekarnia' },
      { left: 'dwie', right: 'piekarnie' },
      { left: 'cztery', right: 'cukiernie' },
      { left: 'pięć', right: 'piekarni' }
    ]
  },
  {
    id: 'pronoun_142', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'portfel' },
      { left: 'dwa', right: 'portfele' },
      { left: 'trzy', right: 'zegarki' },
      { left: 'pięć', right: 'pierścionków' }
    ]
  },

  // ============================================================
  // DIFFICULTY 3 — HARD (32 sets: 16 demonstrative, 16 numeral)
  // ============================================================

  // --- Demonstrative sets (difficulty 3) ---
  {
    id: 'pronoun_143', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'mężczyzna' },
      { left: 'ta', right: 'kobieta' },
      { left: 'to', right: 'niemowlę' },
      { left: 'ci', right: 'mężczyźni' }
    ]
  },
  {
    id: 'pronoun_144', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dentysta' },
      { left: 'ta', right: 'nauczycielka' },
      { left: 'to', right: 'cielę' },
      { left: 'ci', right: 'dentyści' }
    ]
  },
  {
    id: 'pronoun_145', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kolega' },
      { left: 'ta', right: 'koleżanka' },
      { left: 'to', right: 'szczenię' },
      { left: 'ci', right: 'koledzy' }
    ]
  },
  {
    id: 'pronoun_146', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'artysta' },
      { left: 'ta', right: 'artystka' },
      { left: 'to', right: 'prosię' },
      { left: 'te', right: 'prosięta' }
    ]
  },
  {
    id: 'pronoun_147', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kierowca' },
      { left: 'ta', right: 'stewardesa' },
      { left: 'to', right: 'kurczę' },
      { left: 'ci', right: 'kierowcy' }
    ]
  },
  {
    id: 'pronoun_148', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'poeta' },
      { left: 'ta', right: 'noc' },
      { left: 'to', right: 'źrebię' },
      { left: 'ci', right: 'poeci' }
    ]
  },
  {
    id: 'pronoun_149', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kosmonauta' },
      { left: 'ta', right: 'kometa' },
      { left: 'to', right: 'jagnię' },
      { left: 'te', right: 'jagnięta' }
    ]
  },
  {
    id: 'pronoun_150', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'tata' },
      { left: 'ta', right: 'sól' },
      { left: 'to', right: 'koźlę' },
      { left: 'ci', right: 'tatowie' }
    ]
  },
  {
    id: 'pronoun_151', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'hrabia' },
      { left: 'ta', right: 'hrabina' },
      { left: 'to', right: 'zwierzę' },
      { left: 'ci', right: 'hrabiowie' }
    ]
  },
  {
    id: 'pronoun_152', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sędzia' },
      { left: 'ta', right: 'twarz' },
      { left: 'to', right: 'imię' },
      { left: 'ci', right: 'sędziowie' }
    ]
  },
  {
    id: 'pronoun_153', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'zawodnik' },
      { left: 'ta', right: 'rzecz' },
      { left: 'to', right: 'pisklę' },
      { left: 'te', right: 'pisklęta' }
    ]
  },
  {
    id: 'pronoun_154', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'woźnica' },
      { left: 'ta', right: 'podróż' },
      { left: 'to', right: 'kocię' },
      { left: 'ci', right: 'woźnice' }
    ]
  },
  {
    id: 'pronoun_155', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sprzedawca' },
      { left: 'ta', right: 'marchew' },
      { left: 'to', right: 'cielę' },
      { left: 'ci', right: 'sprzedawcy' }
    ]
  },
  {
    id: 'pronoun_156', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wychowawca' },
      { left: 'ta', right: 'kość' },
      { left: 'to', right: 'lwię' },
      { left: 'ci', right: 'wychowawcy' }
    ]
  },
  {
    id: 'pronoun_157', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wędkarz' },
      { left: 'ta', right: 'pieśń' },
      { left: 'to', right: 'dziewczę' },
      { left: 'te', right: 'dziewczęta' }
    ]
  },
  {
    id: 'pronoun_158', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'monarcha' },
      { left: 'ta', right: 'wieś' },
      { left: 'to', right: 'książę' },
      { left: 'ci', right: 'monarchowie' }
    ]
  },

  // --- Numeral sets (difficulty 3) ---
  {
    id: 'pronoun_159', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'mężczyzna' },
      { left: 'dwa', right: 'niemowlęta' },
      { left: 'trzy', right: 'szczenięta' },
      { left: 'pięć', right: 'mężczyzn' }
    ]
  },
  {
    id: 'pronoun_160', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'mysz' },
      { left: 'dwie', right: 'myszy' },
      { left: 'cztery', right: 'gęsi' },
      { left: 'pięć', right: 'myszy' }
    ]
  },
  {
    id: 'pronoun_161', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'zwierzę' },
      { left: 'dwa', right: 'zwierzęta' },
      { left: 'trzy', right: 'cielęta' },
      { left: 'pięć', right: 'zwierząt' }
    ]
  },
  {
    id: 'pronoun_162', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'przyjaciel' },
      { left: 'dwa', right: 'przyjaciele' },
      { left: 'cztery', right: 'bracia' },
      { left: 'pięć', right: 'przyjaciół' }
    ]
  },
  {
    id: 'pronoun_163', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'noc' },
      { left: 'dwie', right: 'noce' },
      { left: 'trzy', right: 'podróże' },
      { left: 'pięć', right: 'nocy' }
    ]
  },
  {
    id: 'pronoun_164', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'imię' },
      { left: 'dwa', right: 'imiona' },
      { left: 'cztery', right: 'ramiona' },
      { left: 'pięć', right: 'imion' }
    ]
  },
  {
    id: 'pronoun_165', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'książę' },
      { left: 'dwa', right: 'książęta' },
      { left: 'trzy', right: 'zamki' },
      { left: 'pięć', right: 'książąt' }
    ]
  },
  {
    id: 'pronoun_166', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'twarz' },
      { left: 'dwie', right: 'twarze' },
      { left: 'cztery', right: 'rzeczy' },
      { left: 'pięć', right: 'twarzy' }
    ]
  },
  {
    id: 'pronoun_167', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'prosię' },
      { left: 'dwa', right: 'prosięta' },
      { left: 'trzy', right: 'jagnięta' },
      { left: 'pięć', right: 'prosiąt' }
    ]
  },
  {
    id: 'pronoun_168', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'sędzia' },
      { left: 'dwa', right: 'medale' },
      { left: 'cztery', right: 'poeci' },
      { left: 'pięć', right: 'sędziów' }
    ]
  },
  {
    id: 'pronoun_169', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'rzecz' },
      { left: 'dwie', right: 'rzeczy' },
      { left: 'trzy', right: 'noce' },
      { left: 'pięć', right: 'rzeczy' }
    ]
  },
  {
    id: 'pronoun_170', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'źrebię' },
      { left: 'dwa', right: 'źrebięta' },
      { left: 'cztery', right: 'koźlęta' },
      { left: 'pięć', right: 'źrebiąt' }
    ]
  },
  {
    id: 'pronoun_171', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tydzień' },
      { left: 'dwa', right: 'tygodnie' },
      { left: 'trzy', right: 'miesiące' },
      { left: 'pięć', right: 'tygodni' }
    ]
  },
  {
    id: 'pronoun_172', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'wieś' },
      { left: 'dwie', right: 'wsie' },
      { left: 'cztery', right: 'osie' },
      { left: 'pięć', right: 'wsi' }
    ]
  },
  {
    id: 'pronoun_173', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedno', right: 'kurczę' },
      { left: 'dwa', right: 'kurczęta' },
      { left: 'trzy', right: 'pisklęta' },
      { left: 'pięć', right: 'kurcząt' }
    ]
  },
  {
    id: 'pronoun_174', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rok' },
      { left: 'dwa', right: 'lata' },
      { left: 'cztery', right: 'lata' },
      { left: 'pięć', right: 'lat' }
    ]
  }
];
