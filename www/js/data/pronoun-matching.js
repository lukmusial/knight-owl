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
    ],
    explanation: 'ten kot (masculine), ta sowa (feminine), to okno (neuter), te drzewa (plural). Ten kot lubi mleko! (This cat likes milk!)'
  },
  {
    id: 'pronoun_002', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pies' },
      { left: 'ta', right: 'kawa' },
      { left: 'to', right: 'mleko' },
      { left: 'te', right: 'koty' }
    ],
    explanation: 'ten pies (masculine), ta kawa (feminine), to mleko (neuter), te koty (plural). Ten pies jest wesoły! (This dog is happy!)'
  },
  {
    id: 'pronoun_003', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dom' },
      { left: 'ta', right: 'mama' },
      { left: 'to', right: 'dziecko' },
      { left: 'te', right: 'jabłka' }
    ],
    explanation: 'ten dom (masculine), ta mama (feminine), to dziecko (neuter), te jabłka (plural). Ten dom jest duży! (This house is big!)'
  },
  {
    id: 'pronoun_004', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'koń' },
      { left: 'ta', right: 'ryba' },
      { left: 'to', right: 'jajko' },
      { left: 'te', right: 'psy' }
    ],
    explanation: 'ten koń (masculine), ta ryba (feminine), to jajko (neuter), te psy (plural). Ten koń biega szybko! (This horse runs fast!)'
  },
  {
    id: 'pronoun_005', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'stół' },
      { left: 'ta', right: 'lampa' },
      { left: 'to', right: 'krzesło' },
      { left: 'te', right: 'książki' }
    ],
    explanation: 'ten stół (masculine), ta lampa (feminine), to krzesło (neuter), te książki (plural). Ten stół jest drewniany! (This table is wooden!)'
  },
  {
    id: 'pronoun_006', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'samochód' },
      { left: 'ta', right: 'szkoła' },
      { left: 'to', right: 'auto' },
      { left: 'te', right: 'domy' }
    ],
    explanation: 'ten samochód (masculine), ta szkoła (feminine), to auto (neuter), te domy (plural). Ten samochód jest szybki! (This car is fast!)'
  },
  {
    id: 'pronoun_007', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ptak' },
      { left: 'ta', right: 'gwiazda' },
      { left: 'to', right: 'słońce' },
      { left: 'te', right: 'chmury' }
    ],
    explanation: 'ten ptak (masculine), ta gwiazda (feminine), to słońce (neuter), te chmury (plural). Ten ptak pięknie śpiewa! (This bird sings beautifully!)'
  },
  {
    id: 'pronoun_008', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ser' },
      { left: 'ta', right: 'woda' },
      { left: 'to', right: 'masło' },
      { left: 'te', right: 'owoce' }
    ],
    explanation: 'ten ser (masculine), ta woda (feminine), to masło (neuter), te owoce (plural). Ten ser jest pyszny! (This cheese is delicious!)'
  },
  {
    id: 'pronoun_009', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'chleb' },
      { left: 'ta', right: 'herbata' },
      { left: 'to', right: 'ciasto' },
      { left: 'te', right: 'ciastka' }
    ],
    explanation: 'ten chleb (masculine), ta herbata (feminine), to ciasto (neuter), te ciastka (plural). Ten chleb jest świeży! (This bread is fresh!)'
  },
  {
    id: 'pronoun_010', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kwiat' },
      { left: 'ta', right: 'róża' },
      { left: 'to', right: 'drzewo' },
      { left: 'te', right: 'kwiaty' }
    ],
    explanation: 'ten kwiat (masculine), ta róża (feminine), to drzewo (neuter), te kwiaty (plural). Ten kwiat pięknie pachnie! (This flower smells beautiful!)'
  },
  {
    id: 'pronoun_011', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'but' },
      { left: 'ta', right: 'sukienka' },
      { left: 'to', right: 'lustro' },
      { left: 'te', right: 'buty' }
    ],
    explanation: 'ten but (masculine), ta sukienka (feminine), to lustro (neuter), te buty (plural). Ten but jest nowy! (This shoe is new!)'
  },
  {
    id: 'pronoun_012', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kapelusz' },
      { left: 'ta', right: 'torba' },
      { left: 'to', right: 'pudełko' },
      { left: 'te', right: 'torby' }
    ],
    explanation: 'ten kapelusz (masculine), ta torba (feminine), to pudełko (neuter), te torby (plural). Ten kapelusz jest ładny! (This hat is pretty!)'
  },
  {
    id: 'pronoun_013', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'most' },
      { left: 'ta', right: 'rzeka' },
      { left: 'to', right: 'jezioro' },
      { left: 'te', right: 'góry' }
    ],
    explanation: 'ten most (masculine), ta rzeka (feminine), to jezioro (neuter), te góry (plural). Ten most jest długi! (This bridge is long!)'
  },
  {
    id: 'pronoun_014', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'obraz' },
      { left: 'ta', right: 'ściana' },
      { left: 'to', right: 'zdjęcie' },
      { left: 'te', right: 'obrazy' }
    ],
    explanation: 'ten obraz (masculine), ta ściana (feminine), to zdjęcie (neuter), te obrazy (plural). Ten obraz jest kolorowy! (This picture is colorful!)'
  },
  {
    id: 'pronoun_015', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'telefon' },
      { left: 'ta', right: 'gazeta' },
      { left: 'to', right: 'radio' },
      { left: 'te', right: 'telefony' }
    ],
    explanation: 'ten telefon (masculine), ta gazeta (feminine), to radio (neuter), te telefony (plural). Ten telefon jest nowy! (This phone is new!)'
  },
  {
    id: 'pronoun_016', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ołówek' },
      { left: 'ta', right: 'kredka' },
      { left: 'to', right: 'pióro' },
      { left: 'te', right: 'kredki' }
    ],
    explanation: 'ten ołówek (masculine), ta kredka (feminine), to pióro (neuter), te kredki (plural). Ten ołówek jest ostry! (This pencil is sharp!)'
  },
  {
    id: 'pronoun_017', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kubek' },
      { left: 'ta', right: 'filiżanka' },
      { left: 'to', right: 'naczynie' },
      { left: 'te', right: 'kubki' }
    ],
    explanation: 'ten kubek (masculine), ta filiżanka (feminine), to naczynie (neuter), te kubki (plural). Ten kubek jest gorący! (This mug is hot!)'
  },
  {
    id: 'pronoun_018', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'talerz' },
      { left: 'ta', right: 'łyżka' },
      { left: 'to', right: 'naczynie' },
      { left: 'te', right: 'talerze' }
    ],
    explanation: 'ten talerz (masculine), ta łyżka (feminine), to naczynie (neuter), te talerze (plural). Ten talerz jest czysty! (This plate is clean!)'
  },
  {
    id: 'pronoun_019', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'klucz' },
      { left: 'ta', right: 'brama' },
      { left: 'to', right: 'mieszkanie' },
      { left: 'te', right: 'klucze' }
    ],
    explanation: 'ten klucz (masculine), ta brama (feminine), to mieszkanie (neuter), te klucze (plural). Ten klucz jest złoty! (This key is golden!)'
  },
  {
    id: 'pronoun_020', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'zamek' },
      { left: 'ta', right: 'wieża' },
      { left: 'to', right: 'miasto' },
      { left: 'te', right: 'zamki' }
    ],
    explanation: 'ten zamek (masculine), ta wieża (feminine), to miasto (neuter), te zamki (plural). Ten zamek jest stary! (This castle is old!)'
  },
  {
    id: 'pronoun_021', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'las' },
      { left: 'ta', right: 'polana' },
      { left: 'to', right: 'pole' },
      { left: 'te', right: 'lasy' }
    ],
    explanation: 'ten las (masculine), ta polana (feminine), to pole (neuter), te lasy (plural). Ten las jest ciemny! (This forest is dark!)'
  },
  {
    id: 'pronoun_022', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'nóż' },
      { left: 'ta', right: 'miska' },
      { left: 'to', right: 'wiaderko' },
      { left: 'te', right: 'noże' }
    ],
    explanation: 'ten nóż (masculine), ta miska (feminine), to wiaderko (neuter), te noże (plural). Ten nóż jest ostry! (This knife is sharp!)'
  },
  {
    id: 'pronoun_023', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'komputer' },
      { left: 'ta', right: 'mysz' },
      { left: 'to', right: 'biurko' },
      { left: 'te', right: 'komputery' }
    ],
    explanation: 'ten komputer (masculine), ta mysz (feminine), to biurko (neuter), te komputery (plural). Ten komputer jest szybki! (This computer is fast!)'
  },
  {
    id: 'pronoun_024', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'rower' },
      { left: 'ta', right: 'piłka' },
      { left: 'to', right: 'boisko' },
      { left: 'te', right: 'rowery' }
    ],
    explanation: 'ten rower (masculine), ta piłka (feminine), to boisko (neuter), te rowery (plural). Ten rower jest czerwony! (This bike is red!)'
  },
  {
    id: 'pronoun_025', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'zegar' },
      { left: 'ta', right: 'szafa' },
      { left: 'to', right: 'łóżko' },
      { left: 'te', right: 'zegary' }
    ],
    explanation: 'ten zegar (masculine), ta szafa (feminine), to łóżko (neuter), te zegary (plural). Ten zegar tyka głośno! (This clock ticks loudly!)'
  },
  {
    id: 'pronoun_026', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'parasol' },
      { left: 'ta', right: 'kurtka' },
      { left: 'to', right: 'ubranie' },
      { left: 'te', right: 'parasole' }
    ],
    explanation: 'ten parasol (masculine), ta kurtka (feminine), to ubranie (neuter), te parasole (plural). Ten parasol jest kolorowy! (This umbrella is colorful!)'
  },
  {
    id: 'pronoun_027', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'balon' },
      { left: 'ta', right: 'zabawka' },
      { left: 'to', right: 'kółko' },
      { left: 'te', right: 'balony' }
    ],
    explanation: 'ten balon (masculine), ta zabawka (feminine), to kółko (neuter), te balony (plural). Ten balon jest czerwony! (This balloon is red!)'
  },
  {
    id: 'pronoun_028', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'długopis' },
      { left: 'ta', right: 'kartka' },
      { left: 'to', right: 'biurko' },
      { left: 'te', right: 'kartki' }
    ],
    explanation: 'ten długopis (masculine), ta kartka (feminine), to biurko (neuter), te kartki (plural). Ten długopis pisze ładnie! (This pen writes nicely!)'
  },
  {
    id: 'pronoun_029', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kort' },
      { left: 'ta', right: 'siatka' },
      { left: 'to', right: 'podwórko' },
      { left: 'te', right: 'piłki' }
    ],
    explanation: 'ten kort (masculine), ta siatka (feminine), to podwórko (neuter), te piłki (plural). Ten kort jest zielony! (This court is green!)'
  },
  {
    id: 'pronoun_030', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'plecak' },
      { left: 'ta', right: 'czapka' },
      { left: 'to', right: 'lusterko' },
      { left: 'te', right: 'plecaki' }
    ],
    explanation: 'ten plecak (masculine), ta czapka (feminine), to lusterko (neuter), te plecaki (plural). Ten plecak jest ciężki! (This backpack is heavy!)'
  },
  {
    id: 'pronoun_031', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'worek' },
      { left: 'ta', right: 'skrzynka' },
      { left: 'to', right: 'pudło' },
      { left: 'te', right: 'worki' }
    ],
    explanation: 'ten worek (masculine), ta skrzynka (feminine), to pudło (neuter), te worki (plural). Ten worek jest pełny! (This sack is full!)'
  },
  {
    id: 'pronoun_032', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sok' },
      { left: 'ta', right: 'lemoniada' },
      { left: 'to', right: 'kakao' },
      { left: 'te', right: 'soki' }
    ],
    explanation: 'ten sok (masculine), ta lemoniada (feminine), to kakao (neuter), te soki (plural). Ten sok jest słodki! (This juice is sweet!)'
  },
  {
    id: 'pronoun_033', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'miś' },
      { left: 'ta', right: 'lalka' },
      { left: 'to', right: 'autko' },
      { left: 'te', right: 'misie' }
    ],
    explanation: 'ten miś (masculine), ta lalka (feminine), to autko (neuter), te misie (plural). Ten miś jest miękki! (This teddy bear is soft!)'
  },
  {
    id: 'pronoun_034', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wąż' },
      { left: 'ta', right: 'żaba' },
      { left: 'to', right: 'gniazdo' },
      { left: 'te', right: 'żaby' }
    ],
    explanation: 'ten wąż (masculine), ta żaba (feminine), to gniazdo (neuter), te żaby (plural). Ten wąż jest długi! (This snake is long!)'
  },
  {
    id: 'pronoun_035', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'ogród' },
      { left: 'ta', right: 'grządka' },
      { left: 'to', right: 'warzywo' },
      { left: 'te', right: 'ogrody' }
    ],
    explanation: 'ten ogród (masculine), ta grządka (feminine), to warzywo (neuter), te ogrody (plural). Ten ogród jest piękny! (This garden is beautiful!)'
  },
  {
    id: 'pronoun_036', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'garnek' },
      { left: 'ta', right: 'patelnia' },
      { left: 'to', right: 'nakrycie' },
      { left: 'te', right: 'garnki' }
    ],
    explanation: 'ten garnek (masculine), ta patelnia (feminine), to nakrycie (neuter), te garnki (plural). Ten garnek jest gorący! (This pot is hot!)'
  },
  {
    id: 'pronoun_037', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dywan' },
      { left: 'ta', right: 'poduszka' },
      { left: 'to', right: 'światło' },
      { left: 'te', right: 'dywany' }
    ],
    explanation: 'ten dywan (masculine), ta poduszka (feminine), to światło (neuter), te dywany (plural). Ten dywan jest miękki! (This carpet is soft!)'
  },
  {
    id: 'pronoun_038', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'telewizor' },
      { left: 'ta', right: 'kanapa' },
      { left: 'to', right: 'krzesło' },
      { left: 'te', right: 'telewizory' }
    ],
    explanation: 'ten telewizor (masculine), ta kanapa (feminine), to krzesło (neuter), te telewizory (plural). Ten telewizor jest duży! (This TV is big!)'
  },
  {
    id: 'pronoun_039', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kosz' },
      { left: 'ta', right: 'butelka' },
      { left: 'to', right: 'wiadro' },
      { left: 'te', right: 'kosze' }
    ],
    explanation: 'ten kosz (masculine), ta butelka (feminine), to wiadro (neuter), te kosze (plural). Ten kosz jest pełny! (This basket is full!)'
  },
  {
    id: 'pronoun_040', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'tort' },
      { left: 'ta', right: 'świeczka' },
      { left: 'to', right: 'przyjęcie' },
      { left: 'te', right: 'torty' }
    ],
    explanation: 'ten tort (masculine), ta świeczka (feminine), to przyjęcie (neuter), te torty (plural). Ten tort jest pyszny! (This cake is delicious!)'
  },
  {
    id: 'pronoun_041', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'motyl' },
      { left: 'ta', right: 'biedronka' },
      { left: 'to', right: 'gniazdo' },
      { left: 'te', right: 'motyle' }
    ],
    explanation: 'ten motyl (masculine), ta biedronka (feminine), to gniazdo (neuter), te motyle (plural). Ten motyl jest piękny! (This butterfly is beautiful!)'
  },
  {
    id: 'pronoun_042', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dzwonek' },
      { left: 'ta', right: 'flaga' },
      { left: 'to', right: 'jabłko' },
      { left: 'te', right: 'dzwonki' }
    ],
    explanation: 'ten dzwonek (masculine), ta flaga (feminine), to jabłko (neuter), te dzwonki (plural). Ten dzwonek jest głośny! (This bell is loud!)'
  },
  {
    id: 'pronoun_043', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'szalik' },
      { left: 'ta', right: 'rękawiczka' },
      { left: 'to', right: 'ucho' },
      { left: 'te', right: 'szaliki' }
    ],
    explanation: 'ten szalik (masculine), ta rękawiczka (feminine), to ucho (neuter), te szaliki (plural). Ten szalik jest ciepły! (This scarf is warm!)'
  },
  {
    id: 'pronoun_044', difficulty: 1, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kamień' },
      { left: 'ta', right: 'trawa' },
      { left: 'to', right: 'morze' },
      { left: 'te', right: 'kamienie' }
    ],
    explanation: 'ten kamień (masculine), ta trawa (feminine), to morze (neuter), te kamienie (plural). Ten kamień jest twardy! (This stone is hard!)'
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
    ],
    explanation: 'jeden kot (masc. sg.), jedna ryba (fem. sg.), jedno okno (neut. sg.), pięć psów (gen. pl.). Mam jednego kota! (I have one cat!)'
  },
  {
    id: 'pronoun_046', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'pies' },
      { left: 'jedna', right: 'żaba' },
      { left: 'jedno', right: 'jajko' },
      { left: 'pięć', right: 'kotów' }
    ],
    explanation: 'jeden pies (masc. sg.), jedna żaba (fem. sg.), jedno jajko (neut. sg.), pięć kotów (gen. pl.). Mam jednego psa! (I have one dog!)'
  },
  {
    id: 'pronoun_047', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'dom' },
      { left: 'jedna', right: 'sowa' },
      { left: 'jedno', right: 'dziecko' },
      { left: 'pięć', right: 'domów' }
    ],
    explanation: 'jeden dom (masc. sg.), jedna sowa (fem. sg.), jedno dziecko (neut. sg.), pięć domów (gen. pl.). Mam jeden dom! (I have one house!)'
  },
  {
    id: 'pronoun_048', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'koń' },
      { left: 'jedna', right: 'krowa' },
      { left: 'jedno', right: 'cielę' },
      { left: 'pięć', right: 'koni' }
    ],
    explanation: 'jeden koń (masc. sg.), jedna krowa (fem. sg.), jedno cielę (neut. sg.), pięć koni (gen. pl.). Mam jednego konia! (I have one horse!)'
  },
  {
    id: 'pronoun_049', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ptak' },
      { left: 'jedna', right: 'kura' },
      { left: 'jedno', right: 'pisklę' },
      { left: 'pięć', right: 'ptaków' }
    ],
    explanation: 'jeden ptak (masc. sg.), jedna kura (fem. sg.), jedno pisklę (neut. sg.), pięć ptaków (gen. pl.). Widzę jednego ptaka! (I see one bird!)'
  },
  {
    id: 'pronoun_050', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'stół' },
      { left: 'dwie', right: 'lampy' },
      { left: 'jedno', right: 'krzesło' },
      { left: 'pięć', right: 'stołów' }
    ],
    explanation: 'jeden stół (masc. sg.), dwie lampy (fem. pl. — dwie for feminine), jedno krzesło (neut. sg.), pięć stołów (gen. pl.). Mam jeden stół! (I have one table!)'
  },
  {
    id: 'pronoun_051', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kwiat' },
      { left: 'jedna', right: 'gwiazda' },
      { left: 'jedno', right: 'drzewo' },
      { left: 'pięć', right: 'kwiatów' }
    ],
    explanation: 'jeden kwiat (masc. sg.), jedna gwiazda (fem. sg.), jedno drzewo (neut. sg.), pięć kwiatów (gen. pl.). Mam jeden kwiat! (I have one flower!)'
  },
  {
    id: 'pronoun_052', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'piłka' },
      { left: 'dwa', right: 'misie' },
      { left: 'jedno', right: 'auto' },
      { left: 'pięć', right: 'lalek' }
    ],
    explanation: 'jedna piłka (fem. sg.), dwa misie (masc./neut. pl.), jedno auto (neut. sg.), pięć lalek (gen. pl.). Mam jedną piłkę! (I have one ball!)'
  },
  {
    id: 'pronoun_053', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ser' },
      { left: 'jedna', right: 'bułka' },
      { left: 'jedno', right: 'masło' },
      { left: 'pięć', right: 'serów' }
    ],
    explanation: 'jeden ser (masc. sg.), jedna bułka (fem. sg.), jedno masło (neut. sg.), pięć serów (gen. pl.). Mam jeden ser! (I have one cheese!)'
  },
  {
    id: 'pronoun_054', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'chleb' },
      { left: 'dwie', right: 'kanapki' },
      { left: 'jedno', right: 'ciasto' },
      { left: 'pięć', right: 'chlebów' }
    ],
    explanation: 'jeden chleb (masc. sg.), dwie kanapki (fem. pl. — dwie for feminine), jedno ciasto (neut. sg.), pięć chlebów (gen. pl.). Mam jeden chleb! (I have one bread!)'
  },
  {
    id: 'pronoun_055', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'obraz' },
      { left: 'jedna', right: 'lampa' },
      { left: 'jedno', right: 'lustro' },
      { left: 'pięć', right: 'obrazów' }
    ],
    explanation: 'jeden obraz (masc. sg.), jedna lampa (fem. sg.), jedno lustro (neut. sg.), pięć obrazów (gen. pl.). Mam jeden obraz! (I have one picture!)'
  },
  {
    id: 'pronoun_056', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'szkoła' },
      { left: 'dwa', right: 'zeszyty' },
      { left: 'jedno', right: 'biurko' },
      { left: 'pięć', right: 'szkół' }
    ],
    explanation: 'jedna szkoła (fem. sg.), dwa zeszyty (masc./neut. pl.), jedno biurko (neut. sg.), pięć szkół (gen. pl.). Mam jedną szkołę! (I have one school!)'
  },
  {
    id: 'pronoun_057', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ołówek' },
      { left: 'jedna', right: 'kredka' },
      { left: 'jedno', right: 'pióro' },
      { left: 'pięć', right: 'ołówków' }
    ],
    explanation: 'jeden ołówek (masc. sg.), jedna kredka (fem. sg.), jedno pióro (neut. sg.), pięć ołówków (gen. pl.). Mam jeden ołówek! (I have one pencil!)'
  },
  {
    id: 'pronoun_058', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kubek' },
      { left: 'dwie', right: 'szklanki' },
      { left: 'jedno', right: 'wiadro' },
      { left: 'pięć', right: 'kubków' }
    ],
    explanation: 'jeden kubek (masc. sg.), dwie szklanki (fem. pl. — dwie for feminine), jedno wiadro (neut. sg.), pięć kubków (gen. pl.). Mam jeden kubek! (I have one mug!)'
  },
  {
    id: 'pronoun_059', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'balon' },
      { left: 'jedna', right: 'zabawka' },
      { left: 'jedno', right: 'pudełko' },
      { left: 'pięć', right: 'balonów' }
    ],
    explanation: 'jeden balon (masc. sg.), jedna zabawka (fem. sg.), jedno pudełko (neut. sg.), pięć balonów (gen. pl.). Mam jeden balon! (I have one balloon!)'
  },
  {
    id: 'pronoun_060', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'czapka' },
      { left: 'dwa', right: 'szaliki' },
      { left: 'jedno', right: 'ubranie' },
      { left: 'pięć', right: 'czapek' }
    ],
    explanation: 'jedna czapka (fem. sg.), dwa szaliki (masc./neut. pl.), jedno ubranie (neut. sg.), pięć czapek (gen. pl.). Mam jedną czapkę! (I have one hat!)'
  },
  {
    id: 'pronoun_061', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'but' },
      { left: 'jedna', right: 'kurtka' },
      { left: 'jedno', right: 'ucho' },
      { left: 'pięć', right: 'butów' }
    ],
    explanation: 'jeden but (masc. sg.), jedna kurtka (fem. sg.), jedno ucho (neut. sg.), pięć butów (gen. pl.). Mam jeden but! (I have one shoe!)'
  },
  {
    id: 'pronoun_062', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tort' },
      { left: 'dwie', right: 'świeczki' },
      { left: 'jedno', right: 'ciastko' },
      { left: 'pięć', right: 'tortów' }
    ],
    explanation: 'jeden tort (masc. sg.), dwie świeczki (fem. pl. — dwie for feminine), jedno ciastko (neut. sg.), pięć tortów (gen. pl.). Mam jeden tort! (I have one cake!)'
  },
  {
    id: 'pronoun_063', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'samochód' },
      { left: 'jedna', right: 'droga' },
      { left: 'jedno', right: 'koło' },
      { left: 'pięć', right: 'samochodów' }
    ],
    explanation: 'jeden samochód (masc. sg.), jedna droga (fem. sg.), jedno koło (neut. sg.), pięć samochodów (gen. pl.). Mam jeden samochód! (I have one car!)'
  },
  {
    id: 'pronoun_064', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'butelka' },
      { left: 'dwa', right: 'talerze' },
      { left: 'jedno', right: 'mleko' },
      { left: 'pięć', right: 'butelek' }
    ],
    explanation: 'jedna butelka (fem. sg.), dwa talerze (masc./neut. pl.), jedno mleko (neut. sg.), pięć butelek (gen. pl.). Mam jedną butelkę! (I have one bottle!)'
  },
  {
    id: 'pronoun_065', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'plecak' },
      { left: 'jedna', right: 'torba' },
      { left: 'jedno', right: 'słońce' },
      { left: 'pięć', right: 'plecaków' }
    ],
    explanation: 'jeden plecak (masc. sg.), jedna torba (fem. sg.), jedno słońce (neut. sg.), pięć plecaków (gen. pl.). Mam jeden plecak! (I have one backpack!)'
  },
  {
    id: 'pronoun_066', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zegar' },
      { left: 'dwie', right: 'minuty' },
      { left: 'jedno', right: 'łóżko' },
      { left: 'pięć', right: 'zegarów' }
    ],
    explanation: 'jeden zegar (masc. sg.), dwie minuty (fem. pl. — dwie for feminine), jedno łóżko (neut. sg.), pięć zegarów (gen. pl.). Mam jeden zegar! (I have one clock!)'
  },
  {
    id: 'pronoun_067', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'parasol' },
      { left: 'jedna', right: 'chmura' },
      { left: 'jedno', right: 'morze' },
      { left: 'pięć', right: 'parasoli' }
    ],
    explanation: 'jeden parasol (masc. sg.), jedna chmura (fem. sg.), jedno morze (neut. sg.), pięć parasoli (gen. pl.). Mam jeden parasol! (I have one umbrella!)'
  },
  {
    id: 'pronoun_068', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'róża' },
      { left: 'dwa', right: 'tulipany' },
      { left: 'jedno', right: 'ziarno' },
      { left: 'pięć', right: 'róż' }
    ],
    explanation: 'jedna róża (fem. sg.), dwa tulipany (masc./neut. pl.), jedno ziarno (neut. sg.), pięć róż (gen. pl.). Mam jedną różę! (I have one rose!)'
  },
  {
    id: 'pronoun_069', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'motyl' },
      { left: 'jedna', right: 'biedronka' },
      { left: 'jedno', right: 'gniazdo' },
      { left: 'pięć', right: 'motyli' }
    ],
    explanation: 'jeden motyl (masc. sg.), jedna biedronka (fem. sg.), jedno gniazdo (neut. sg.), pięć motyli (gen. pl.). Widzę jednego motyla! (I see one butterfly!)'
  },
  {
    id: 'pronoun_070', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'klucz' },
      { left: 'dwie', right: 'bramy' },
      { left: 'jedno', right: 'miasto' },
      { left: 'pięć', right: 'kluczy' }
    ],
    explanation: 'jeden klucz (masc. sg.), dwie bramy (fem. pl. — dwie for feminine), jedno miasto (neut. sg.), pięć kluczy (gen. pl.). Mam jeden klucz! (I have one key!)'
  },
  {
    id: 'pronoun_071', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'garnek' },
      { left: 'jedna', right: 'miska' },
      { left: 'jedno', right: 'naczynie' },
      { left: 'pięć', right: 'garnków' }
    ],
    explanation: 'jeden garnek (masc. sg.), jedna miska (fem. sg.), jedno naczynie (neut. sg.), pięć garnków (gen. pl.). Mam jeden garnek! (I have one pot!)'
  },
  {
    id: 'pronoun_072', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'poduszka' },
      { left: 'dwa', right: 'koce' },
      { left: 'jedno', right: 'łóżko' },
      { left: 'pięć', right: 'poduszek' }
    ],
    explanation: 'jedna poduszka (fem. sg.), dwa koce (masc./neut. pl.), jedno łóżko (neut. sg.), pięć poduszek (gen. pl.). Mam jedną poduszkę! (I have one pillow!)'
  },
  {
    id: 'pronoun_073', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'sok' },
      { left: 'jedna', right: 'herbata' },
      { left: 'jedno', right: 'jabłko' },
      { left: 'pięć', right: 'soków' }
    ],
    explanation: 'jeden sok (masc. sg.), jedna herbata (fem. sg.), jedno jabłko (neut. sg.), pięć soków (gen. pl.). Mam jeden sok! (I have one juice!)'
  },
  {
    id: 'pronoun_074', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'las' },
      { left: 'dwie', right: 'góry' },
      { left: 'jedno', right: 'jezioro' },
      { left: 'pięć', right: 'lasów' }
    ],
    explanation: 'jeden las (masc. sg.), dwie góry (fem. pl. — dwie for feminine), jedno jezioro (neut. sg.), pięć lasów (gen. pl.). Widzę jeden las! (I see one forest!)'
  },
  {
    id: 'pronoun_075', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'telewizor' },
      { left: 'jedna', right: 'kanapa' },
      { left: 'jedno', right: 'radio' },
      { left: 'pięć', right: 'telewizorów' }
    ],
    explanation: 'jeden telewizor (masc. sg.), jedna kanapa (fem. sg.), jedno radio (neut. sg.), pięć telewizorów (gen. pl.). Mam jeden telewizor! (I have one TV!)'
  },
  {
    id: 'pronoun_076', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'flaga' },
      { left: 'dwa', right: 'zamki' },
      { left: 'jedno', right: 'pole' },
      { left: 'pięć', right: 'flag' }
    ],
    explanation: 'jedna flaga (fem. sg.), dwa zamki (masc./neut. pl.), jedno pole (neut. sg.), pięć flag (gen. pl.). Mam jedną flagę! (I have one flag!)'
  },
  {
    id: 'pronoun_077', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'dywan' },
      { left: 'jedna', right: 'ściana' },
      { left: 'jedno', right: 'okno' },
      { left: 'pięć', right: 'dywanów' }
    ],
    explanation: 'jeden dywan (masc. sg.), jedna ściana (fem. sg.), jedno okno (neut. sg.), pięć dywanów (gen. pl.). Mam jeden dywan! (I have one carpet!)'
  },
  {
    id: 'pronoun_078', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rower' },
      { left: 'dwie', right: 'piłki' },
      { left: 'jedno', right: 'boisko' },
      { left: 'pięć', right: 'rowerów' }
    ],
    explanation: 'jeden rower (masc. sg.), dwie piłki (fem. pl. — dwie for feminine), jedno boisko (neut. sg.), pięć rowerów (gen. pl.). Mam jeden rower! (I have one bike!)'
  },
  {
    id: 'pronoun_079', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'most' },
      { left: 'jedna', right: 'rzeka' },
      { left: 'jedno', right: 'jezioro' },
      { left: 'pięć', right: 'mostów' }
    ],
    explanation: 'jeden most (masc. sg.), jedna rzeka (fem. sg.), jedno jezioro (neut. sg.), pięć mostów (gen. pl.). Widzę jeden most! (I see one bridge!)'
  },
  {
    id: 'pronoun_080', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'książka' },
      { left: 'dwa', right: 'długopisy' },
      { left: 'jedno', right: 'zdjęcie' },
      { left: 'pięć', right: 'książek' }
    ],
    explanation: 'jedna książka (fem. sg.), dwa długopisy (masc./neut. pl.), jedno zdjęcie (neut. sg.), pięć książek (gen. pl.). Mam jedną książkę! (I have one book!)'
  },
  {
    id: 'pronoun_081', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'talerz' },
      { left: 'jedna', right: 'łyżka' },
      { left: 'jedno', right: 'naczynie' },
      { left: 'pięć', right: 'talerzy' }
    ],
    explanation: 'jeden talerz (masc. sg.), jedna łyżka (fem. sg.), jedno naczynie (neut. sg.), pięć talerzy (gen. pl.). Mam jeden talerz! (I have one plate!)'
  },
  {
    id: 'pronoun_082', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ogród' },
      { left: 'dwie', right: 'grządki' },
      { left: 'jedno', right: 'drzewo' },
      { left: 'pięć', right: 'ogrodów' }
    ],
    explanation: 'jeden ogród (masc. sg.), dwie grządki (fem. pl. — dwie for feminine), jedno drzewo (neut. sg.), pięć ogrodów (gen. pl.). Mam jeden ogród! (I have one garden!)'
  },
  {
    id: 'pronoun_083', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'koszyk' },
      { left: 'jedna', right: 'skrzynka' },
      { left: 'jedno', right: 'pudło' },
      { left: 'pięć', right: 'koszyków' }
    ],
    explanation: 'jeden koszyk (masc. sg.), jedna skrzynka (fem. sg.), jedno pudło (neut. sg.), pięć koszyków (gen. pl.). Mam jeden koszyk! (I have one basket!)'
  },
  {
    id: 'pronoun_084', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'gazeta' },
      { left: 'dwa', right: 'listy' },
      { left: 'jedno', right: 'pismo' },
      { left: 'pięć', right: 'gazet' }
    ],
    explanation: 'jedna gazeta (fem. sg.), dwa listy (masc./neut. pl.), jedno pismo (neut. sg.), pięć gazet (gen. pl.). Mam jedną gazetę! (I have one newspaper!)'
  },
  {
    id: 'pronoun_085', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kapelusz' },
      { left: 'jedna', right: 'sukienka' },
      { left: 'jedno', right: 'ubranie' },
      { left: 'pięć', right: 'kapeluszy' }
    ],
    explanation: 'jeden kapelusz (masc. sg.), jedna sukienka (fem. sg.), jedno ubranie (neut. sg.), pięć kapeluszy (gen. pl.). Mam jeden kapelusz! (I have one hat!)'
  },
  {
    id: 'pronoun_086', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wazon' },
      { left: 'dwie', right: 'polany' },
      { left: 'jedno', right: 'mieszkanie' },
      { left: 'pięć', right: 'wazonów' }
    ],
    explanation: 'jeden wazon (masc. sg.), dwie polany (fem. pl. — dwie for feminine), jedno mieszkanie (neut. sg.), pięć wazonów (gen. pl.). Mam jeden wazon! (I have one vase!)'
  },
  {
    id: 'pronoun_087', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'lizak' },
      { left: 'jedna', right: 'trawa' },
      { left: 'jedno', right: 'słońce' },
      { left: 'pięć', right: 'lizaków' }
    ],
    explanation: 'jeden lizak (masc. sg.), jedna trawa (fem. sg.), jedno słońce (neut. sg.), pięć lizaków (gen. pl.). Mam jeden lizak! (I have one lollipop!)'
  },
  {
    id: 'pronoun_088', difficulty: 1, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'lalka' },
      { left: 'dwa', right: 'klocki' },
      { left: 'jedno', right: 'kółko' },
      { left: 'pięć', right: 'lalek' }
    ],
    explanation: 'jedna lalka (fem. sg.), dwa klocki (masc./neut. pl.), jedno kółko (neut. sg.), pięć lalek (gen. pl.). Mam jedną lalkę! (I have one doll!)'
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
    ],
    explanation: 'ten kalendarz (masculine), ta biblioteka (feminine), to muzeum (neuter), ci chłopcy (masculine personal plural). Ci chłopcy biegają szybko! (These boys run fast!)'
  },
  {
    id: 'pronoun_090', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'strażak' },
      { left: 'ta', right: 'aktorka' },
      { left: 'to', right: 'przedstawienie' },
      { left: 'ci', right: 'aktorzy' }
    ],
    explanation: 'ten strażak (masculine), ta aktorka (feminine), to przedstawienie (neuter), ci aktorzy (masculine personal plural). Ci aktorzy grają dobrze! (These actors perform well!)'
  },
  {
    id: 'pronoun_091', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'rycerz' },
      { left: 'ta', right: 'zbroja' },
      { left: 'to', right: 'zaklęcie' },
      { left: 'ci', right: 'rycerze' }
    ],
    explanation: 'ten rycerz (masculine), ta zbroja (feminine), to zaklęcie (neuter), ci rycerze (masculine personal plural). Ci rycerze są odważni! (These knights are brave!)'
  },
  {
    id: 'pronoun_092', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'lekarz' },
      { left: 'ta', right: 'pielęgniarka' },
      { left: 'to', right: 'łóżko' },
      { left: 'ci', right: 'lekarze' }
    ],
    explanation: 'ten lekarz (masculine), ta pielęgniarka (feminine), to łóżko (neuter), ci lekarze (masculine personal plural). Ci lekarze pomagają ludziom! (These doctors help people!)'
  },
  {
    id: 'pronoun_093', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'malarz' },
      { left: 'ta', right: 'farba' },
      { left: 'to', right: 'malowidło' },
      { left: 'ci', right: 'malarze' }
    ],
    explanation: 'ten malarz (masculine), ta farba (feminine), to malowidło (neuter), ci malarze (masculine personal plural). Ci malarze malują pięknie! (These painters paint beautifully!)'
  },
  {
    id: 'pronoun_094', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wulkan' },
      { left: 'ta', right: 'pustynia' },
      { left: 'to', right: 'wybrzeże' },
      { left: 'te', right: 'wyspy' }
    ],
    explanation: 'ten wulkan (masculine), ta pustynia (feminine), to wybrzeże (neuter), te wyspy (plural). Ten wulkan jest ogromny! (This volcano is huge!)'
  },
  {
    id: 'pronoun_095', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'magnes' },
      { left: 'ta', right: 'lupa' },
      { left: 'to', right: 'szkiełko' },
      { left: 'te', right: 'lupy' }
    ],
    explanation: 'ten magnes (masculine), ta lupa (feminine), to szkiełko (neuter), te lupy (plural). Ten magnes jest silny! (This magnet is strong!)'
  },
  {
    id: 'pronoun_096', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'lekarz' },
      { left: 'ta', right: 'apteka' },
      { left: 'to', right: 'lekarstwo' },
      { left: 'ci', right: 'lekarze' }
    ],
    explanation: 'ten lekarz (masculine), ta apteka (feminine), to lekarstwo (neuter), ci lekarze (masculine personal plural). Ci lekarze leczą chorych! (These doctors treat the sick!)'
  },
  {
    id: 'pronoun_097', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'księżyc' },
      { left: 'ta', right: 'gwiazda' },
      { left: 'to', right: 'niebo' },
      { left: 'te', right: 'gwiazdy' }
    ],
    explanation: 'ten księżyc (masculine), ta gwiazda (feminine), to niebo (neuter), te gwiazdy (plural). Ten księżyc świeci jasno! (This moon shines brightly!)'
  },
  {
    id: 'pronoun_098', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'tramwaj' },
      { left: 'ta', right: 'stacja' },
      { left: 'to', right: 'lotnisko' },
      { left: 'ci', right: 'kierowcy' }
    ],
    explanation: 'ten tramwaj (masculine), ta stacja (feminine), to lotnisko (neuter), ci kierowcy (masculine personal plural). Ci kierowcy jadą ostrożnie! (These drivers drive carefully!)'
  },
  {
    id: 'pronoun_099', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'aktor' },
      { left: 'ta', right: 'scena' },
      { left: 'to', right: 'kino' },
      { left: 'ci', right: 'aktorzy' }
    ],
    explanation: 'ten aktor (masculine), ta scena (feminine), to kino (neuter), ci aktorzy (masculine personal plural). Ci aktorzy grają w filmie! (These actors act in a movie!)'
  },
  {
    id: 'pronoun_100', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'podręcznik' },
      { left: 'ta', right: 'tablica' },
      { left: 'to', right: 'zadanie' },
      { left: 'ci', right: 'uczniowie' }
    ],
    explanation: 'ten podręcznik (masculine), ta tablica (feminine), to zadanie (neuter), ci uczniowie (masculine personal plural). Ci uczniowie uczą się pilnie! (These students study diligently!)'
  },
  {
    id: 'pronoun_101', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'budynek' },
      { left: 'ta', right: 'szkoła' },
      { left: 'to', right: 'boisko' },
      { left: 'te', right: 'budynki' }
    ],
    explanation: 'ten budynek (masculine), ta szkoła (feminine), to boisko (neuter), te budynki (plural). Ten budynek jest wysoki! (This building is tall!)'
  },
  {
    id: 'pronoun_102', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'turniej' },
      { left: 'ta', right: 'drużyna' },
      { left: 'to', right: 'boisko' },
      { left: 'ci', right: 'sportowcy' }
    ],
    explanation: 'ten turniej (masculine), ta drużyna (feminine), to boisko (neuter), ci sportowcy (masculine personal plural). Ci sportowcy trenują codziennie! (These athletes train daily!)'
  },
  {
    id: 'pronoun_103', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'list' },
      { left: 'ta', right: 'koperta' },
      { left: 'to', right: 'biurko' },
      { left: 'te', right: 'listy' }
    ],
    explanation: 'ten list (masculine), ta koperta (feminine), to biurko (neuter), te listy (plural). Ten list jest długi! (This letter is long!)'
  },
  {
    id: 'pronoun_104', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wiatrak' },
      { left: 'ta', right: 'latarnia' },
      { left: 'to', right: 'światło' },
      { left: 'te', right: 'wiatraki' }
    ],
    explanation: 'ten wiatrak (masculine), ta latarnia (feminine), to światło (neuter), te wiatraki (plural). Ten wiatrak się kręci! (This windmill is spinning!)'
  },
  {
    id: 'pronoun_105', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kapitan' },
      { left: 'ta', right: 'łódź' },
      { left: 'to', right: 'morze' },
      { left: 'ci', right: 'rybacy' }
    ],
    explanation: 'ten kapitan (masculine), ta łódź (feminine), to morze (neuter), ci rybacy (masculine personal plural). Ci rybacy łowią ryby! (These fishermen catch fish!)'
  },
  {
    id: 'pronoun_106', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'fortepian' },
      { left: 'ta', right: 'gitara' },
      { left: 'to', right: 'pianino' },
      { left: 'ci', right: 'muzycy' }
    ],
    explanation: 'ten fortepian (masculine), ta gitara (feminine), to pianino (neuter), ci muzycy (masculine personal plural). Ci muzycy grają pięknie! (These musicians play beautifully!)'
  },
  {
    id: 'pronoun_107', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'telewizor' },
      { left: 'ta', right: 'kamera' },
      { left: 'to', right: 'zdjęcie' },
      { left: 'te', right: 'zdjęcia' }
    ],
    explanation: 'ten telewizor (masculine), ta kamera (feminine), to zdjęcie (neuter), te zdjęcia (plural). Ten telewizor pokazuje film! (This TV shows a movie!)'
  },
  {
    id: 'pronoun_108', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kucharz' },
      { left: 'ta', right: 'restauracja' },
      { left: 'to', right: 'menu' },
      { left: 'ci', right: 'kelnerzy' }
    ],
    explanation: 'ten kucharz (masculine), ta restauracja (feminine), to menu (neuter), ci kelnerzy (masculine personal plural). Ci kelnerzy noszą talerze! (These waiters carry plates!)'
  },
  {
    id: 'pronoun_109', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pociąg' },
      { left: 'ta', right: 'lokomotywa' },
      { left: 'to', right: 'przejście' },
      { left: 'te', right: 'tory' }
    ],
    explanation: 'ten pociąg (masculine), ta lokomotywa (feminine), to przejście (neuter), te tory (plural). Ten pociąg jedzie szybko! (This train goes fast!)'
  },
  {
    id: 'pronoun_110', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'portfel' },
      { left: 'ta', right: 'torebka' },
      { left: 'to', right: 'pudełeczko' },
      { left: 'te', right: 'portfele' }
    ],
    explanation: 'ten portfel (masculine), ta torebka (feminine), to pudełeczko (neuter), te portfele (plural). Ten portfel jest brązowy! (This wallet is brown!)'
  },
  {
    id: 'pronoun_111', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sopel' },
      { left: 'ta', right: 'jaskinia' },
      { left: 'to', right: 'źródło' },
      { left: 'te', right: 'sople' }
    ],
    explanation: 'ten sopel (masculine), ta jaskinia (feminine), to źródło (neuter), te sople (plural). Ten sopel jest lodowy! (This icicle is icy!)'
  },
  {
    id: 'pronoun_112', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pilot' },
      { left: 'ta', right: 'zabawka' },
      { left: 'to', right: 'pudełko' },
      { left: 'te', right: 'zabawki' }
    ],
    explanation: 'ten pilot (masculine), ta zabawka (feminine), to pudełko (neuter), te zabawki (plural). Ten pilot jest mały! (This remote is small!)'
  },
  {
    id: 'pronoun_113', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'piekarnik' },
      { left: 'ta', right: 'lodówka' },
      { left: 'to', right: 'zmywanie' },
      { left: 'te', right: 'piekarniki' }
    ],
    explanation: 'ten piekarnik (masculine), ta lodówka (feminine), to zmywanie (neuter), te piekarniki (plural). Ten piekarnik jest gorący! (This oven is hot!)'
  },
  {
    id: 'pronoun_114', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'bęben' },
      { left: 'ta', right: 'trąbka' },
      { left: 'to', right: 'pianino' },
      { left: 'ci', right: 'muzycy' }
    ],
    explanation: 'ten bęben (masculine), ta trąbka (feminine), to pianino (neuter), ci muzycy (masculine personal plural). Ci muzycy grają na koncercie! (These musicians play at a concert!)'
  },
  {
    id: 'pronoun_115', difficulty: 2, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'pomnik' },
      { left: 'ta', right: 'fontanna' },
      { left: 'to', right: 'jezioro' },
      { left: 'te', right: 'pomniki' }
    ],
    explanation: 'ten pomnik (masculine), ta fontanna (feminine), to jezioro (neuter), te pomniki (plural). Ten pomnik jest wysoki! (This monument is tall!)'
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
    ],
    explanation: 'jeden kalendarz (masc. sg.), jedna biblioteka (fem. sg.), jedno muzeum (neut. sg.), pięć zeszytów (gen. pl.). Mam jeden kalendarz! (I have one calendar!)'
  },
  {
    id: 'pronoun_117', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'smok' },
      { left: 'dwie', right: 'tarcze' },
      { left: 'jedno', right: 'kopie' },
      { left: 'pięć', right: 'smoków' }
    ],
    explanation: 'jeden smok (masc. sg.), dwie tarcze (fem. pl. — dwie for feminine), jedno kopie (neut. sg.), pięć smoków (gen. pl.). Widzę jednego smoka! (I see one dragon!)'
  },
  {
    id: 'pronoun_118', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'planeta' },
      { left: 'dwa', right: 'teleskopy' },
      { left: 'jedno', right: 'niebo' },
      { left: 'pięć', right: 'gwiazd' }
    ],
    explanation: 'jedna planeta (fem. sg.), dwa teleskopy (masc./neut. pl.), jedno niebo (neut. sg.), pięć gwiazd (gen. pl.). Widzę jedną planetę! (I see one planet!)'
  },
  {
    id: 'pronoun_119', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tramwaj' },
      { left: 'jedna', right: 'lokomotywa' },
      { left: 'jedno', right: 'metro' },
      { left: 'pięć', right: 'pociągów' }
    ],
    explanation: 'jeden tramwaj (masc. sg.), jedna lokomotywa (fem. sg.), jedno metro (neut. sg.), pięć pociągów (gen. pl.). Widzę jeden tramwaj! (I see one tram!)'
  },
  {
    id: 'pronoun_120', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'budynek' },
      { left: 'dwie', right: 'kamienice' },
      { left: 'jedno', right: 'lotnisko' },
      { left: 'pięć', right: 'budynków' }
    ],
    explanation: 'jeden budynek (masc. sg.), dwie kamienice (fem. pl. — dwie for feminine), jedno lotnisko (neut. sg.), pięć budynków (gen. pl.). Widzę jeden budynek! (I see one building!)'
  },
  {
    id: 'pronoun_121', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'restauracja' },
      { left: 'dwa', right: 'kościoły' },
      { left: 'jedno', right: 'kino' },
      { left: 'pięć', right: 'restauracji' }
    ],
    explanation: 'jedna restauracja (fem. sg.), dwa kościoły (masc./neut. pl.), jedno kino (neut. sg.), pięć restauracji (gen. pl.). Mam jedną restaurację! (I have one restaurant!)'
  },
  {
    id: 'pronoun_122', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wodospad' },
      { left: 'jedna', right: 'jaskinia' },
      { left: 'jedno', right: 'wzgórze' },
      { left: 'pięć', right: 'wodospadów' }
    ],
    explanation: 'jeden wodospad (masc. sg.), jedna jaskinia (fem. sg.), jedno wzgórze (neut. sg.), pięć wodospadów (gen. pl.). Widzę jeden wodospad! (I see one waterfall!)'
  },
  {
    id: 'pronoun_123', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'podręcznik' },
      { left: 'dwie', right: 'encyklopedie' },
      { left: 'jedno', right: 'akwarium' },
      { left: 'pięć', right: 'podręczników' }
    ],
    explanation: 'jeden podręcznik (masc. sg.), dwie encyklopedie (fem. pl. — dwie for feminine), jedno akwarium (neut. sg.), pięć podręczników (gen. pl.). Mam jeden podręcznik! (I have one textbook!)'
  },
  {
    id: 'pronoun_124', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'drużyna' },
      { left: 'dwa', right: 'mecze' },
      { left: 'jedno', right: 'boisko' },
      { left: 'pięć', right: 'drużyn' }
    ],
    explanation: 'jedna drużyna (fem. sg.), dwa mecze (masc./neut. pl.), jedno boisko (neut. sg.), pięć drużyn (gen. pl.). Mam jedną drużynę! (I have one team!)'
  },
  {
    id: 'pronoun_125', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'fortepian' },
      { left: 'jedna', right: 'gitara' },
      { left: 'jedno', right: 'skrzypce' },
      { left: 'pięć', right: 'fortepianów' }
    ],
    explanation: 'jeden fortepian (masc. sg.), jedna gitara (fem. sg.), jedno skrzypce (neut. sg.), pięć fortepianów (gen. pl.). Mam jeden fortepian! (I have one piano!)'
  },
  {
    id: 'pronoun_126', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'monitor' },
      { left: 'dwie', right: 'drukarki' },
      { left: 'jedno', right: 'urządzenie' },
      { left: 'pięć', right: 'monitorów' }
    ],
    explanation: 'jeden monitor (masc. sg.), dwie drukarki (fem. pl. — dwie for feminine), jedno urządzenie (neut. sg.), pięć monitorów (gen. pl.). Mam jeden monitor! (I have one monitor!)'
  },
  {
    id: 'pronoun_127', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'fontanna' },
      { left: 'dwa', right: 'pomniki' },
      { left: 'jedno', right: 'rondo' },
      { left: 'pięć', right: 'fontann' }
    ],
    explanation: 'jedna fontanna (fem. sg.), dwa pomniki (masc./neut. pl.), jedno rondo (neut. sg.), pięć fontann (gen. pl.). Widzę jedną fontannę! (I see one fountain!)'
  },
  {
    id: 'pronoun_128', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'plakat' },
      { left: 'jedna', right: 'mapa' },
      { left: 'jedno', right: 'zdjęcie' },
      { left: 'pięć', right: 'plakatów' }
    ],
    explanation: 'jeden plakat (masc. sg.), jedna mapa (fem. sg.), jedno zdjęcie (neut. sg.), pięć plakatów (gen. pl.). Mam jeden plakat! (I have one poster!)'
  },
  {
    id: 'pronoun_129', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'piekarnik' },
      { left: 'dwie', right: 'lodówki' },
      { left: 'jedno', right: 'wiaderko' },
      { left: 'pięć', right: 'piekarników' }
    ],
    explanation: 'jeden piekarnik (masc. sg.), dwie lodówki (fem. pl. — dwie for feminine), jedno wiaderko (neut. sg.), pięć piekarników (gen. pl.). Mam jeden piekarnik! (I have one oven!)'
  },
  {
    id: 'pronoun_130', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'piekarnia' },
      { left: 'dwa', right: 'sklepy' },
      { left: 'jedno', right: 'targowisko' },
      { left: 'pięć', right: 'piekarni' }
    ],
    explanation: 'jedna piekarnia (fem. sg.), dwa sklepy (masc./neut. pl.), jedno targowisko (neut. sg.), pięć piekarni (gen. pl.). Mam jedną piekarnię! (I have one bakery!)'
  },
  {
    id: 'pronoun_131', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zamek' },
      { left: 'jedna', right: 'wieża' },
      { left: 'jedno', right: 'podwórko' },
      { left: 'pięć', right: 'zamków' }
    ],
    explanation: 'jeden zamek (masc. sg.), jedna wieża (fem. sg.), jedno podwórko (neut. sg.), pięć zamków (gen. pl.). Widzę jeden zamek! (I see one castle!)'
  },
  {
    id: 'pronoun_132', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'bęben' },
      { left: 'dwie', right: 'trąbki' },
      { left: 'jedno', right: 'pianino' },
      { left: 'pięć', right: 'bębnów' }
    ],
    explanation: 'jeden bęben (masc. sg.), dwie trąbki (fem. pl. — dwie for feminine), jedno pianino (neut. sg.), pięć bębnów (gen. pl.). Mam jeden bęben! (I have one drum!)'
  },
  {
    id: 'pronoun_133', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'dolina' },
      { left: 'dwa', right: 'szczyty' },
      { left: 'jedno', right: 'jezioro' },
      { left: 'pięć', right: 'dolin' }
    ],
    explanation: 'jedna dolina (fem. sg.), dwa szczyty (masc./neut. pl.), jedno jezioro (neut. sg.), pięć dolin (gen. pl.). Widzę jedną dolinę! (I see one valley!)'
  },
  {
    id: 'pronoun_134', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'portfel' },
      { left: 'jedna', right: 'torebka' },
      { left: 'jedno', right: 'pudełko' },
      { left: 'pięć', right: 'portfeli' }
    ],
    explanation: 'jeden portfel (masc. sg.), jedna torebka (fem. sg.), jedno pudełko (neut. sg.), pięć portfeli (gen. pl.). Mam jeden portfel! (I have one wallet!)'
  },
  {
    id: 'pronoun_135', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'wagon' },
      { left: 'dwie', right: 'przyczepy' },
      { left: 'jedno', right: 'siedlisko' },
      { left: 'pięć', right: 'wagonów' }
    ],
    explanation: 'jeden wagon (masc. sg.), dwie przyczepy (fem. pl. — dwie for feminine), jedno siedlisko (neut. sg.), pięć wagonów (gen. pl.). Widzę jeden wagon! (I see one wagon!)'
  },
  {
    id: 'pronoun_136', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'kawiarnia' },
      { left: 'dwa', right: 'bary' },
      { left: 'jedno', right: 'centrum' },
      { left: 'pięć', right: 'kawiarni' }
    ],
    explanation: 'jedna kawiarnia (fem. sg.), dwa bary (masc./neut. pl.), jedno centrum (neut. sg.), pięć kawiarni (gen. pl.). Mam jedną kawiarnię! (I have one cafe!)'
  },
  {
    id: 'pronoun_137', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'komputer' },
      { left: 'jedna', right: 'klawiatura' },
      { left: 'jedno', right: 'radio' },
      { left: 'pięć', right: 'komputerów' }
    ],
    explanation: 'jeden komputer (masc. sg.), jedna klawiatura (fem. sg.), jedno radio (neut. sg.), pięć komputerów (gen. pl.). Mam jeden komputer! (I have one computer!)'
  },
  {
    id: 'pronoun_138', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'autobus' },
      { left: 'dwie', right: 'taksówki' },
      { left: 'jedno', right: 'lotnisko' },
      { left: 'pięć', right: 'autobusów' }
    ],
    explanation: 'jeden autobus (masc. sg.), dwie taksówki (fem. pl. — dwie for feminine), jedno lotnisko (neut. sg.), pięć autobusów (gen. pl.). Widzę jeden autobus! (I see one bus!)'
  },
  {
    id: 'pronoun_139', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'galeria' },
      { left: 'dwa', right: 'teatry' },
      { left: 'jedno', right: 'muzeum' },
      { left: 'pięć', right: 'galerii' }
    ],
    explanation: 'jedna galeria (fem. sg.), dwa teatry (masc./neut. pl.), jedno muzeum (neut. sg.), pięć galerii (gen. pl.). Mam jedną galerię! (I have one gallery!)'
  },
  {
    id: 'pronoun_140', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'zegarek' },
      { left: 'jedna', right: 'bransoletka' },
      { left: 'jedno', right: 'naszyjnik' },
      { left: 'pięć', right: 'zegarków' }
    ],
    explanation: 'jeden zegarek (masc. sg.), jedna bransoletka (fem. sg.), jedno naszyjnik (neut. sg.), pięć zegarków (gen. pl.). Mam jeden zegarek! (I have one watch!)'
  },
  {
    id: 'pronoun_141', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'ekran' },
      { left: 'dwie', right: 'kamery' },
      { left: 'jedno', right: 'zdjęcie' },
      { left: 'pięć', right: 'ekranów' }
    ],
    explanation: 'jeden ekran (masc. sg.), dwie kamery (fem. pl. — dwie for feminine), jedno zdjęcie (neut. sg.), pięć ekranów (gen. pl.). Widzę jeden ekran! (I see one screen!)'
  },
  {
    id: 'pronoun_142', difficulty: 2, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'skała' },
      { left: 'dwa', right: 'wulkany' },
      { left: 'jedno', right: 'źródło' },
      { left: 'pięć', right: 'skał' }
    ],
    explanation: 'jedna skała (fem. sg.), dwa wulkany (masc./neut. pl.), jedno źródło (neut. sg.), pięć skał (gen. pl.). Widzę jedną skałę! (I see one rock!)'
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
    ],
    explanation: 'ten mężczyzna (masculine despite -a ending!), ta kobieta (feminine), to niemowlę (neuter), ci mężczyźni (masculine personal plural). Ten mężczyzna jest wysoki! (This man is tall!)'
  },
  {
    id: 'pronoun_144', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'dentysta' },
      { left: 'ta', right: 'nauczycielka' },
      { left: 'to', right: 'cielę' },
      { left: 'ci', right: 'dentyści' }
    ],
    explanation: 'ten dentysta (masculine despite -a ending!), ta nauczycielka (feminine), to cielę (neuter), ci dentyści (masculine personal plural). Ten dentysta leczy zęby! (This dentist treats teeth!)'
  },
  {
    id: 'pronoun_145', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kolega' },
      { left: 'ta', right: 'koleżanka' },
      { left: 'to', right: 'szczenię' },
      { left: 'ci', right: 'koledzy' }
    ],
    explanation: 'ten kolega (masculine despite -a ending!), ta koleżanka (feminine), to szczenię (neuter), ci koledzy (masculine personal plural). Ten kolega jest miły! (This friend is nice!)'
  },
  {
    id: 'pronoun_146', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'artysta' },
      { left: 'ta', right: 'artystka' },
      { left: 'to', right: 'prosię' },
      { left: 'te', right: 'prosięta' }
    ],
    explanation: 'ten artysta (masculine despite -a ending!), ta artystka (feminine), to prosię (neuter), te prosięta (plural). Ten artysta maluje obrazy! (This artist paints pictures!)'
  },
  {
    id: 'pronoun_147', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kierowca' },
      { left: 'ta', right: 'stewardesa' },
      { left: 'to', right: 'kurczę' },
      { left: 'ci', right: 'kierowcy' }
    ],
    explanation: 'ten kierowca (masculine despite -a ending!), ta stewardesa (feminine), to kurczę (neuter), ci kierowcy (masculine personal plural). Ten kierowca jedzie ostrożnie! (This driver drives carefully!)'
  },
  {
    id: 'pronoun_148', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'poeta' },
      { left: 'ta', right: 'noc' },
      { left: 'to', right: 'źrebię' },
      { left: 'ci', right: 'poeci' }
    ],
    explanation: 'ten poeta (masculine despite -a ending!), ta noc (feminine), to źrebię (neuter), ci poeci (masculine personal plural). Ten poeta pisze wiersze! (This poet writes poems!)'
  },
  {
    id: 'pronoun_149', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'kosmonauta' },
      { left: 'ta', right: 'kometa' },
      { left: 'to', right: 'jagnię' },
      { left: 'te', right: 'jagnięta' }
    ],
    explanation: 'ten kosmonauta (masculine despite -a ending!), ta kometa (feminine), to jagnię (neuter), te jagnięta (plural). Ten kosmonauta lata w kosmos! (This astronaut flies to space!)'
  },
  {
    id: 'pronoun_150', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'tata' },
      { left: 'ta', right: 'sól' },
      { left: 'to', right: 'koźlę' },
      { left: 'ci', right: 'tatowie' }
    ],
    explanation: 'ten tata (masculine despite -a ending!), ta sól (feminine), to koźlę (neuter), ci tatowie (masculine personal plural). Ten tata jest silny! (This dad is strong!)'
  },
  {
    id: 'pronoun_151', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'hrabia' },
      { left: 'ta', right: 'hrabina' },
      { left: 'to', right: 'zwierzę' },
      { left: 'ci', right: 'hrabiowie' }
    ],
    explanation: 'ten hrabia (masculine despite -a ending!), ta hrabina (feminine), to zwierzę (neuter), ci hrabiowie (masculine personal plural). Ten hrabia mieszka w zamku! (This count lives in a castle!)'
  },
  {
    id: 'pronoun_152', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sędzia' },
      { left: 'ta', right: 'twarz' },
      { left: 'to', right: 'imię' },
      { left: 'ci', right: 'sędziowie' }
    ],
    explanation: 'ten sędzia (masculine despite -a ending!), ta twarz (feminine), to imię (neuter), ci sędziowie (masculine personal plural). Ten sędzia jest sprawiedliwy! (This judge is fair!)'
  },
  {
    id: 'pronoun_153', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'zawodnik' },
      { left: 'ta', right: 'rzecz' },
      { left: 'to', right: 'pisklę' },
      { left: 'te', right: 'pisklęta' }
    ],
    explanation: 'ten zawodnik (masculine), ta rzecz (feminine), to pisklę (neuter), te pisklęta (plural). Ten zawodnik biega szybko! (This athlete runs fast!)'
  },
  {
    id: 'pronoun_154', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'woźnica' },
      { left: 'ta', right: 'podróż' },
      { left: 'to', right: 'kocię' },
      { left: 'ci', right: 'woźnice' }
    ],
    explanation: 'ten woźnica (masculine despite -a ending!), ta podróż (feminine), to kocię (neuter), ci woźnice (masculine personal plural). Ten woźnica jedzie wozem! (This coachman rides a cart!)'
  },
  {
    id: 'pronoun_155', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'sprzedawca' },
      { left: 'ta', right: 'marchew' },
      { left: 'to', right: 'cielę' },
      { left: 'ci', right: 'sprzedawcy' }
    ],
    explanation: 'ten sprzedawca (masculine despite -a ending!), ta marchew (feminine), to cielę (neuter), ci sprzedawcy (masculine personal plural). Ten sprzedawca jest miły! (This seller is nice!)'
  },
  {
    id: 'pronoun_156', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wychowawca' },
      { left: 'ta', right: 'kość' },
      { left: 'to', right: 'lwię' },
      { left: 'ci', right: 'wychowawcy' }
    ],
    explanation: 'ten wychowawca (masculine despite -a ending!), ta kość (feminine), to lwię (neuter), ci wychowawcy (masculine personal plural). Ten wychowawca uczy dzieci! (This teacher teaches children!)'
  },
  {
    id: 'pronoun_157', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'wędkarz' },
      { left: 'ta', right: 'pieśń' },
      { left: 'to', right: 'dziewczę' },
      { left: 'te', right: 'dziewczęta' }
    ],
    explanation: 'ten wędkarz (masculine), ta pieśń (feminine), to dziewczę (neuter), te dziewczęta (plural). Ten wędkarz łowi ryby! (This angler catches fish!)'
  },
  {
    id: 'pronoun_158', difficulty: 3, category: 'pronoun_matching',
    subtype: 'demonstrative',
    pairs: [
      { left: 'ten', right: 'książę' },
      { left: 'ta', right: 'wieś' },
      { left: 'to', right: 'królestwo' },
      { left: 'ci', right: 'książęta' }
    ],
    explanation: 'ten książę (masculine), ta wieś (feminine), to królestwo (neuter), ci książęta (masculine personal plural). Ten książę jest odważny! (This prince is brave!)'
  },

  // --- Numeral sets (difficulty 3) ---
  // Templates D (jedna/dwie/jedno/pięć) and A/B/C mixed with tricky declensions
  {
    id: 'pronoun_159', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'niedźwiedź' },
      { left: 'jedna', right: 'mysz' },
      { left: 'jedno', right: 'zwierzę' },
      { left: 'pięć', right: 'niedźwiedzi' }
    ],
    explanation: 'jeden niedźwiedź (masc. sg.), jedna mysz (fem. sg.), jedno zwierzę (neut. sg.), pięć niedźwiedzi (gen. pl.). Widzę jednego niedźwiedzia! (I see one bear!)'
  },
  {
    id: 'pronoun_160', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'motyl' },
      { left: 'dwie', right: 'noce' },
      { left: 'jedno', right: 'imię' },
      { left: 'pięć', right: 'motyli' }
    ],
    explanation: 'jeden motyl (masc. sg.), dwie noce (fem. pl. — dwie for feminine), jedno imię (neut. sg.), pięć motyli (gen. pl.). Widzę jednego motyla! (I see one butterfly!)'
  },
  {
    id: 'pronoun_161', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'noc' },
      { left: 'dwa', right: 'tygodnie' },
      { left: 'jedno', right: 'niemowlę' },
      { left: 'pięć', right: 'nocy' }
    ],
    explanation: 'jedna noc (fem. sg.), dwa tygodnie (masc./neut. pl.), jedno niemowlę (neut. sg.), pięć nocy (gen. pl.). To była jedna długa noc! (It was one long night!)'
  },
  {
    id: 'pronoun_162', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'książę' },
      { left: 'jedna', right: 'księżniczka' },
      { left: 'jedno', right: 'prosię' },
      { left: 'pięć', right: 'książąt' }
    ],
    explanation: 'jeden książę (masc. sg.), jedna księżniczka (fem. sg.), jedno prosię (neut. sg.), pięć książąt (gen. pl.). Widzę jednego księcia! (I see one prince!)'
  },
  {
    id: 'pronoun_163', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'rzecz' },
      { left: 'dwie', right: 'podróże' },
      { left: 'jedno', right: 'źrebię' },
      { left: 'pięć', right: 'rzeczy' }
    ],
    explanation: 'jedna rzecz (fem. sg.), dwie podróże (fem. pl. — dwie for feminine), jedno źrebię (neut. sg.), pięć rzeczy (gen. pl.). Mam jedną ważną rzecz! (I have one important thing!)'
  },
  {
    id: 'pronoun_164', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'tydzień' },
      { left: 'jedna', right: 'wieś' },
      { left: 'jedno', right: 'kurczę' },
      { left: 'pięć', right: 'tygodni' }
    ],
    explanation: 'jeden tydzień (masc. sg.), jedna wieś (fem. sg.), jedno kurczę (neut. sg.), pięć tygodni (gen. pl.). Minął jeden tydzień! (One week has passed!)'
  },
  {
    id: 'pronoun_165', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'koń' },
      { left: 'dwie', right: 'gęsi' },
      { left: 'jedno', right: 'cielę' },
      { left: 'pięć', right: 'koni' }
    ],
    explanation: 'jeden koń (masc. sg.), dwie gęsi (fem. pl. — dwie for feminine), jedno cielę (neut. sg.), pięć koni (gen. pl.). Mam jednego konia! (I have one horse!)'
  },
  {
    id: 'pronoun_166', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'twarz' },
      { left: 'dwa', right: 'miesiące' },
      { left: 'jedno', right: 'ramię' },
      { left: 'pięć', right: 'twarzy' }
    ],
    explanation: 'jedna twarz (fem. sg.), dwa miesiące (masc./neut. pl.), jedno ramię (neut. sg.), pięć twarzy (gen. pl.). Widzę jedną twarz! (I see one face!)'
  },
  {
    id: 'pronoun_167', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'liść' },
      { left: 'jedna', right: 'gałąź' },
      { left: 'jedno', right: 'drzewko' },
      { left: 'pięć', right: 'liści' }
    ],
    explanation: 'jeden liść (masc. sg.), jedna gałąź (fem. sg.), jedno drzewko (neut. sg.), pięć liści (gen. pl.). Widzę jeden liść! (I see one leaf!)'
  },
  {
    id: 'pronoun_168', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'gość' },
      { left: 'dwie', right: 'wsie' },
      { left: 'jedno', right: 'dziecię' },
      { left: 'pięć', right: 'gości' }
    ],
    explanation: 'jeden gość (masc. sg.), dwie wsie (fem. pl. — dwie for feminine), jedno dziecię (neut. sg.), pięć gości (gen. pl.). Mam jednego gościa! (I have one guest!)'
  },
  {
    id: 'pronoun_169', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'kolej' },
      { left: 'dwa', right: 'bracia' },
      { left: 'jedno', right: 'zwierzę' },
      { left: 'pięć', right: 'kolei' }
    ],
    explanation: 'jedna kolej (fem. sg.), dwa bracia (masc./neut. pl.), jedno zwierzę (neut. sg.), pięć kolei (gen. pl.). Mam jedną kolej! (I have one railway!)'
  },
  {
    id: 'pronoun_170', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'rok' },
      { left: 'jedna', right: 'chwila' },
      { left: 'jedno', right: 'stulecie' },
      { left: 'pięć', right: 'lat' }
    ],
    explanation: 'jeden rok (masc. sg.), jedna chwila (fem. sg.), jedno stulecie (neut. sg.), pięć lat (gen. pl.). Minął jeden rok! (One year has passed!)'
  },
  {
    id: 'pronoun_171', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'kamień' },
      { left: 'dwie', right: 'łodzie' },
      { left: 'jedno', right: 'koźlę' },
      { left: 'pięć', right: 'kamieni' }
    ],
    explanation: 'jeden kamień (masc. sg.), dwie łodzie (fem. pl. — dwie for feminine), jedno koźlę (neut. sg.), pięć kamieni (gen. pl.). Widzę jeden kamień! (I see one stone!)'
  },
  {
    id: 'pronoun_172', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jedna', right: 'pieśń' },
      { left: 'dwa', right: 'wiersze' },
      { left: 'jedno', right: 'dzieło' },
      { left: 'pięć', right: 'pieśni' }
    ],
    explanation: 'jedna pieśń (fem. sg.), dwa wiersze (masc./neut. pl.), jedno dzieło (neut. sg.), pięć pieśni (gen. pl.). Słyszę jedną pieśń! (I hear one song!)'
  },
  {
    id: 'pronoun_173', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'łabędź' },
      { left: 'jedna', right: 'gęś' },
      { left: 'jedno', right: 'jagnię' },
      { left: 'pięć', right: 'łabędzi' }
    ],
    explanation: 'jeden łabędź (masc. sg.), jedna gęś (fem. sg.), jedno jagnię (neut. sg.), pięć łabędzi (gen. pl.). Widzę jednego łabędzia! (I see one swan!)'
  },
  {
    id: 'pronoun_174', difficulty: 3, category: 'pronoun_matching',
    subtype: 'numeral',
    pairs: [
      { left: 'jeden', right: 'miesiąc' },
      { left: 'dwie', right: 'chwile' },
      { left: 'jedno', right: 'imię' },
      { left: 'pięć', right: 'miesięcy' }
    ],
    explanation: 'jeden miesiąc (masc. sg.), dwie chwile (fem. pl. — dwie for feminine), jedno imię (neut. sg.), pięć miesięcy (gen. pl.). Minął jeden miesiąc! (One month has passed!)'
  }
];
