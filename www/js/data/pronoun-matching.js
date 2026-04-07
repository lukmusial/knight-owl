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
      { left: 'to', right: 'biurko' },
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
  // Templates: A = jeden/jedna/jedno/pięć, B = jeden/dwie/jedno/pięć, C = jedna/dwa/jedno/pięć
  {
    id: 'pronoun_045', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kot' },
      { left: 'jedna', right: 'ryba' },
      { left: 'jedno', right: 'okno' },
      { left: 'pięć', right: 'psów' }
    ]
  },
  {
    id: 'pronoun_046', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'pies' },
      { left: 'jedna', right: 'żaba' },
      { left: 'jedno', right: 'jajko' },
      { left: 'pięć', right: 'kotów' }
    ]
  },
  {
    id: 'pronoun_047', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'dom' },
      { left: 'jedna', right: 'sowa' },
      { left: 'jedno', right: 'dziecko' },
      { left: 'pięć', right: 'domów' }
    ]
  },
  {
    id: 'pronoun_048', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'koń' },
      { left: 'jedna', right: 'krowa' },
      { left: 'jedno', right: 'cielę' },
      { left: 'pięć', right: 'koni' }
    ]
  },
  {
    id: 'pronoun_049', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ptak' },
      { left: 'jedna', right: 'kura' },
      { left: 'jedno', right: 'pisklę' },
      { left: 'pięć', right: 'ptaków' }
    ]
  },
  {
    id: 'pronoun_050', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'stół' },
      { left: 'dwie', right: 'lampy' },
      { left: 'jedno', right: 'krzesło' },
      { left: 'pięć', right: 'stołów' }
    ]
  },
  {
    id: 'pronoun_051', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kwiat' },
      { left: 'jedna', right: 'gwiazda' },
      { left: 'jedno', right: 'drzewo' },
      { left: 'pięć', right: 'kwiatów' }
    ]
  },
  {
    id: 'pronoun_052', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'piłka' },
      { left: 'dwa', right: 'misie' },
      { left: 'jedno', right: 'auto' },
      { left: 'pięć', right: 'lalek' }
    ]
  },
  {
    id: 'pronoun_053', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ser' },
      { left: 'jedna', right: 'bułka' },
      { left: 'jedno', right: 'masło' },
      { left: 'pięć', right: 'serów' }
    ]
  },
  {
    id: 'pronoun_054', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'chleb' },
      { left: 'dwie', right: 'kanapki' },
      { left: 'jedno', right: 'ciasto' },
      { left: 'pięć', right: 'chlebów' }
    ]
  },
  {
    id: 'pronoun_055', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'obraz' },
      { left: 'jedna', right: 'lampa' },
      { left: 'jedno', right: 'lustro' },
      { left: 'pięć', right: 'obrazów' }
    ]
  },
  {
    id: 'pronoun_056', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'szkoła' },
      { left: 'dwa', right: 'zeszyty' },
      { left: 'jedno', right: 'biurko' },
      { left: 'pięć', right: 'szkół' }
    ]
  },
  {
    id: 'pronoun_057', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ołówek' },
      { left: 'jedna', right: 'kredka' },
      { left: 'jedno', right: 'pióro' },
      { left: 'pięć', right: 'ołówków' }
    ]
  },
  {
    id: 'pronoun_058', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kubek' },
      { left: 'dwie', right: 'szklanki' },
      { left: 'jedno', right: 'wiadro' },
      { left: 'pięć', right: 'kubków' }
    ]
  },
  {
    id: 'pronoun_059', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'balon' },
      { left: 'jedna', right: 'zabawka' },
      { left: 'jedno', right: 'pudełko' },
      { left: 'pięć', right: 'balonów' }
    ]
  },
  {
    id: 'pronoun_060', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'czapka' },
      { left: 'dwa', right: 'szaliki' },
      { left: 'jedno', right: 'ubranie' },
      { left: 'pięć', right: 'czapek' }
    ]
  },
  {
    id: 'pronoun_061', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'but' },
      { left: 'jedna', right: 'kurtka' },
      { left: 'jedno', right: 'ucho' },
      { left: 'pięć', right: 'butów' }
    ]
  },
  {
    id: 'pronoun_062', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tort' },
      { left: 'dwie', right: 'świeczki' },
      { left: 'jedno', right: 'ciastko' },
      { left: 'pięć', right: 'tortów' }
    ]
  },
  {
    id: 'pronoun_063', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'samochód' },
      { left: 'jedna', right: 'droga' },
      { left: 'jedno', right: 'koło' },
      { left: 'pięć', right: 'samochodów' }
    ]
  },
  {
    id: 'pronoun_064', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'butelka' },
      { left: 'dwa', right: 'talerze' },
      { left: 'jedno', right: 'mleko' },
      { left: 'pięć', right: 'butelek' }
    ]
  },
  {
    id: 'pronoun_065', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'plecak' },
      { left: 'jedna', right: 'torba' },
      { left: 'jedno', right: 'słońce' },
      { left: 'pięć', right: 'plecaków' }
    ]
  },
  {
    id: 'pronoun_066', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zegar' },
      { left: 'dwie', right: 'minuty' },
      { left: 'jedno', right: 'łóżko' },
      { left: 'pięć', right: 'zegarów' }
    ]
  },
  {
    id: 'pronoun_067', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'parasol' },
      { left: 'jedna', right: 'chmura' },
      { left: 'jedno', right: 'morze' },
      { left: 'pięć', right: 'parasoli' }
    ]
  },
  {
    id: 'pronoun_068', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'róża' },
      { left: 'dwa', right: 'tulipany' },
      { left: 'jedno', right: 'ziarno' },
      { left: 'pięć', right: 'róż' }
    ]
  },
  {
    id: 'pronoun_069', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'motyl' },
      { left: 'jedna', right: 'biedronka' },
      { left: 'jedno', right: 'gniazdo' },
      { left: 'pięć', right: 'motyli' }
    ]
  },
  {
    id: 'pronoun_070', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'klucz' },
      { left: 'dwie', right: 'bramy' },
      { left: 'jedno', right: 'miasto' },
      { left: 'pięć', right: 'kluczy' }
    ]
  },
  {
    id: 'pronoun_071', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'garnek' },
      { left: 'jedna', right: 'miska' },
      { left: 'jedno', right: 'naczynie' },
      { left: 'pięć', right: 'garnków' }
    ]
  },
  {
    id: 'pronoun_072', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'poduszka' },
      { left: 'dwa', right: 'koce' },
      { left: 'jedno', right: 'łóżko' },
      { left: 'pięć', right: 'poduszek' }
    ]
  },
  {
    id: 'pronoun_073', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'sok' },
      { left: 'jedna', right: 'herbata' },
      { left: 'jedno', right: 'jabłko' },
      { left: 'pięć', right: 'soków' }
    ]
  },
  {
    id: 'pronoun_074', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'las' },
      { left: 'dwie', right: 'góry' },
      { left: 'jedno', right: 'jezioro' },
      { left: 'pięć', right: 'lasów' }
    ]
  },
  {
    id: 'pronoun_075', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'telewizor' },
      { left: 'jedna', right: 'kanapa' },
      { left: 'jedno', right: 'radio' },
      { left: 'pięć', right: 'telewizorów' }
    ]
  },
  {
    id: 'pronoun_076', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'flaga' },
      { left: 'dwa', right: 'zamki' },
      { left: 'jedno', right: 'pole' },
      { left: 'pięć', right: 'flag' }
    ]
  },
  {
    id: 'pronoun_077', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'dywan' },
      { left: 'jedna', right: 'ściana' },
      { left: 'jedno', right: 'okno' },
      { left: 'pięć', right: 'dywanów' }
    ]
  },
  {
    id: 'pronoun_078', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rower' },
      { left: 'dwie', right: 'piłki' },
      { left: 'jedno', right: 'boisko' },
      { left: 'pięć', right: 'rowerów' }
    ]
  },
  {
    id: 'pronoun_079', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'most' },
      { left: 'jedna', right: 'rzeka' },
      { left: 'jedno', right: 'jezioro' },
      { left: 'pięć', right: 'mostów' }
    ]
  },
  {
    id: 'pronoun_080', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'książka' },
      { left: 'dwa', right: 'długopisy' },
      { left: 'jedno', right: 'zdjęcie' },
      { left: 'pięć', right: 'książek' }
    ]
  },
  {
    id: 'pronoun_081', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'talerz' },
      { left: 'jedna', right: 'łyżka' },
      { left: 'jedno', right: 'naczynie' },
      { left: 'pięć', right: 'talerzy' }
    ]
  },
  {
    id: 'pronoun_082', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ogród' },
      { left: 'dwie', right: 'grządki' },
      { left: 'jedno', right: 'drzewo' },
      { left: 'pięć', right: 'ogrodów' }
    ]
  },
  {
    id: 'pronoun_083', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'koszyk' },
      { left: 'jedna', right: 'skrzynka' },
      { left: 'jedno', right: 'pudło' },
      { left: 'pięć', right: 'koszyków' }
    ]
  },
  {
    id: 'pronoun_084', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'gazeta' },
      { left: 'dwa', right: 'listy' },
      { left: 'jedno', right: 'pismo' },
      { left: 'pięć', right: 'gazet' }
    ]
  },
  {
    id: 'pronoun_085', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kapelusz' },
      { left: 'jedna', right: 'sukienka' },
      { left: 'jedno', right: 'ubranie' },
      { left: 'pięć', right: 'kapeluszy' }
    ]
  },
  {
    id: 'pronoun_086', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wazon' },
      { left: 'dwie', right: 'polany' },
      { left: 'jedno', right: 'mieszkanie' },
      { left: 'pięć', right: 'wazonów' }
    ]
  },
  {
    id: 'pronoun_087', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'lizak' },
      { left: 'jedna', right: 'trawa' },
      { left: 'jedno', right: 'słońce' },
      { left: 'pięć', right: 'lizaków' }
    ]
  },
  {
    id: 'pronoun_088', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'lalka' },
      { left: 'dwa', right: 'klocki' },
      { left: 'jedno', right: 'kółko' },
      { left: 'pięć', right: 'lalek' }
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
      { left: 'jedna', right: 'biblioteka' },
      { left: 'jedno', right: 'muzeum' },
      { left: 'pięć', right: 'zeszytów' }
    ]
  },
  {
    id: 'pronoun_117', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rycerz' },
      { left: 'dwie', right: 'tarcze' },
      { left: 'jedno', right: 'kopie' },
      { left: 'pięć', right: 'rycerzy' }
    ]
  },
  {
    id: 'pronoun_118', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'planeta' },
      { left: 'dwa', right: 'teleskopy' },
      { left: 'jedno', right: 'niebo' },
      { left: 'pięć', right: 'gwiazd' }
    ]
  },
  {
    id: 'pronoun_119', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tramwaj' },
      { left: 'jedna', right: 'lokomotywa' },
      { left: 'jedno', right: 'metro' },
      { left: 'pięć', right: 'pociągów' }
    ]
  },
  {
    id: 'pronoun_120', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'budynek' },
      { left: 'dwie', right: 'kamienice' },
      { left: 'jedno', right: 'lotnisko' },
      { left: 'pięć', right: 'budynków' }
    ]
  },
  {
    id: 'pronoun_121', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'restauracja' },
      { left: 'dwa', right: 'kościoły' },
      { left: 'jedno', right: 'kino' },
      { left: 'pięć', right: 'restauracji' }
    ]
  },
  {
    id: 'pronoun_122', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wodospad' },
      { left: 'jedna', right: 'jaskinia' },
      { left: 'jedno', right: 'wzgórze' },
      { left: 'pięć', right: 'wodospadów' }
    ]
  },
  {
    id: 'pronoun_123', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'podręcznik' },
      { left: 'dwie', right: 'encyklopedie' },
      { left: 'jedno', right: 'akwarium' },
      { left: 'pięć', right: 'podręczników' }
    ]
  },
  {
    id: 'pronoun_124', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'drużyna' },
      { left: 'dwa', right: 'mecze' },
      { left: 'jedno', right: 'boisko' },
      { left: 'pięć', right: 'drużyn' }
    ]
  },
  {
    id: 'pronoun_125', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'fortepian' },
      { left: 'jedna', right: 'gitara' },
      { left: 'jedno', right: 'skrzypce' },
      { left: 'pięć', right: 'fortepianów' }
    ]
  },
  {
    id: 'pronoun_126', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'monitor' },
      { left: 'dwie', right: 'drukarki' },
      { left: 'jedno', right: 'urządzenie' },
      { left: 'pięć', right: 'monitorów' }
    ]
  },
  {
    id: 'pronoun_127', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'fontanna' },
      { left: 'dwa', right: 'pomniki' },
      { left: 'jedno', right: 'rondo' },
      { left: 'pięć', right: 'fontann' }
    ]
  },
  {
    id: 'pronoun_128', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'plakat' },
      { left: 'jedna', right: 'mapa' },
      { left: 'jedno', right: 'zdjęcie' },
      { left: 'pięć', right: 'plakatów' }
    ]
  },
  {
    id: 'pronoun_129', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'piekarnik' },
      { left: 'dwie', right: 'lodówki' },
      { left: 'jedno', right: 'wiaderko' },
      { left: 'pięć', right: 'piekarników' }
    ]
  },
  {
    id: 'pronoun_130', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'piekarnia' },
      { left: 'dwa', right: 'sklepy' },
      { left: 'jedno', right: 'targowisko' },
      { left: 'pięć', right: 'piekarni' }
    ]
  },
  {
    id: 'pronoun_131', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zamek' },
      { left: 'jedna', right: 'wieża' },
      { left: 'jedno', right: 'podwórko' },
      { left: 'pięć', right: 'zamków' }
    ]
  },
  {
    id: 'pronoun_132', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'bęben' },
      { left: 'dwie', right: 'trąbki' },
      { left: 'jedno', right: 'pianino' },
      { left: 'pięć', right: 'bębnów' }
    ]
  },
  {
    id: 'pronoun_133', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'dolina' },
      { left: 'dwa', right: 'szczyty' },
      { left: 'jedno', right: 'jezioro' },
      { left: 'pięć', right: 'dolin' }
    ]
  },
  {
    id: 'pronoun_134', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'portfel' },
      { left: 'jedna', right: 'torebka' },
      { left: 'jedno', right: 'pudełko' },
      { left: 'pięć', right: 'portfeli' }
    ]
  },
  {
    id: 'pronoun_135', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wagon' },
      { left: 'dwie', right: 'przyczepy' },
      { left: 'jedno', right: 'siedlisko' },
      { left: 'pięć', right: 'wagonów' }
    ]
  },
  {
    id: 'pronoun_136', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'kawiarnia' },
      { left: 'dwa', right: 'bary' },
      { left: 'jedno', right: 'centrum' },
      { left: 'pięć', right: 'kawiarni' }
    ]
  },
  {
    id: 'pronoun_137', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'komputer' },
      { left: 'jedna', right: 'klawiatura' },
      { left: 'jedno', right: 'radio' },
      { left: 'pięć', right: 'komputerów' }
    ]
  },
  {
    id: 'pronoun_138', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'autobus' },
      { left: 'dwie', right: 'taksówki' },
      { left: 'jedno', right: 'lotnisko' },
      { left: 'pięć', right: 'autobusów' }
    ]
  },
  {
    id: 'pronoun_139', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'galeria' },
      { left: 'dwa', right: 'teatry' },
      { left: 'jedno', right: 'muzeum' },
      { left: 'pięć', right: 'galerii' }
    ]
  },
  {
    id: 'pronoun_140', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zegarek' },
      { left: 'jedna', right: 'bransoletka' },
      { left: 'jedno', right: 'naszyjnik' },
      { left: 'pięć', right: 'zegarków' }
    ]
  },
  {
    id: 'pronoun_141', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ekran' },
      { left: 'dwie', right: 'kamery' },
      { left: 'jedno', right: 'zdjęcie' },
      { left: 'pięć', right: 'ekranów' }
    ]
  },
  {
    id: 'pronoun_142', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'skała' },
      { left: 'dwa', right: 'wulkany' },
      { left: 'jedno', right: 'źródło' },
      { left: 'pięć', right: 'skał' }
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
      { left: 'ten', right: 'książę' },
      { left: 'ta', right: 'wieś' },
      { left: 'to', right: 'królestwo' },
      { left: 'ci', right: 'książęta' }
    ]
  },

  // --- Numeral sets (difficulty 3) ---
  // Templates D (jedna/dwie/jedno/pięć) and A/B/C mixed with tricky declensions
  {
    id: 'pronoun_159', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'mężczyzna' },
      { left: 'jedna', right: 'mysz' },
      { left: 'jedno', right: 'zwierzę' },
      { left: 'pięć', right: 'mężczyzn' }
    ]
  },
  {
    id: 'pronoun_160', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'przyjaciel' },
      { left: 'dwie', right: 'noce' },
      { left: 'jedno', right: 'imię' },
      { left: 'pięć', right: 'przyjaciół' }
    ]
  },
  {
    id: 'pronoun_161', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'noc' },
      { left: 'dwa', right: 'tygodnie' },
      { left: 'jedno', right: 'niemowlę' },
      { left: 'pięć', right: 'nocy' }
    ]
  },
  {
    id: 'pronoun_162', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'książę' },
      { left: 'jedna', right: 'księżniczka' },
      { left: 'jedno', right: 'prosię' },
      { left: 'pięć', right: 'książąt' }
    ]
  },
  {
    id: 'pronoun_163', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'rzecz' },
      { left: 'dwie', right: 'podróże' },
      { left: 'jedno', right: 'źrebię' },
      { left: 'pięć', right: 'rzeczy' }
    ]
  },
  {
    id: 'pronoun_164', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tydzień' },
      { left: 'jedna', right: 'wieś' },
      { left: 'jedno', right: 'kurczę' },
      { left: 'pięć', right: 'tygodni' }
    ]
  },
  {
    id: 'pronoun_165', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'sędzia' },
      { left: 'dwie', right: 'gęsi' },
      { left: 'jedno', right: 'cielę' },
      { left: 'pięć', right: 'sędziów' }
    ]
  },
  {
    id: 'pronoun_166', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'twarz' },
      { left: 'dwa', right: 'miesiące' },
      { left: 'jedno', right: 'ramię' },
      { left: 'pięć', right: 'twarzy' }
    ]
  },
  {
    id: 'pronoun_167', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'liść' },
      { left: 'jedna', right: 'gałąź' },
      { left: 'jedno', right: 'drzewko' },
      { left: 'pięć', right: 'liści' }
    ]
  },
  {
    id: 'pronoun_168', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'gość' },
      { left: 'dwie', right: 'wsie' },
      { left: 'jedno', right: 'dziecię' },
      { left: 'pięć', right: 'gości' }
    ]
  },
  {
    id: 'pronoun_169', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'kolej' },
      { left: 'dwa', right: 'bracia' },
      { left: 'jedno', right: 'zwierzę' },
      { left: 'pięć', right: 'kolei' }
    ]
  },
  {
    id: 'pronoun_170', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rok' },
      { left: 'jedna', right: 'chwila' },
      { left: 'jedno', right: 'stulecie' },
      { left: 'pięć', right: 'lat' }
    ]
  },
  {
    id: 'pronoun_171', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kamień' },
      { left: 'dwie', right: 'łodzie' },
      { left: 'jedno', right: 'koźlę' },
      { left: 'pięć', right: 'kamieni' }
    ]
  },
  {
    id: 'pronoun_172', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'pieśń' },
      { left: 'dwa', right: 'wiersze' },
      { left: 'jedno', right: 'dzieło' },
      { left: 'pięć', right: 'pieśni' }
    ]
  },
  {
    id: 'pronoun_173', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'łabędź' },
      { left: 'jedna', right: 'gęś' },
      { left: 'jedno', right: 'jagnię' },
      { left: 'pięć', right: 'łabędzi' }
    ]
  },
  {
    id: 'pronoun_174', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'miesiąc' },
      { left: 'dwie', right: 'chwile' },
      { left: 'jedno', right: 'imię' },
      { left: 'pięć', right: 'miesięcy' }
    ]
  }
];
