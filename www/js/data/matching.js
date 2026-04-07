/**
 * Matching Questions Data
 * English-Polish word matching sets for the matching encounter type.
 * Each set contains 4 word pairs grouped thematically.
 */

const MATCHING_QUESTIONS = [
  // ============================================================
  // DIFFICULTY 1 - Easy (88 sets: match_001 through match_088)
  // ============================================================

  // --- Animals (sets 001-008) ---
  {
    id: 'match_001', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'cat', right: 'kot' },
      { left: 'dog', right: 'pies' },
      { left: 'bird', right: 'ptak' },
      { left: 'fish', right: 'ryba' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_002', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'horse', right: 'koń' },
      { left: 'cow', right: 'krowa' },
      { left: 'pig', right: 'świnia' },
      { left: 'sheep', right: 'owca' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_003', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'rabbit', right: 'królik' },
      { left: 'mouse', right: 'mysz' },
      { left: 'frog', right: 'żaba' },
      { left: 'bear', right: 'niedźwiedź' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_004', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'chicken', right: 'kurczak' },
      { left: 'duck', right: 'kaczka' },
      { left: 'goose', right: 'gęś' },
      { left: 'turkey', right: 'indyk' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_005', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'lion', right: 'lew' },
      { left: 'tiger', right: 'tygrys' },
      { left: 'elephant', right: 'słoń' },
      { left: 'monkey', right: 'małpa' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_006', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'wolf', right: 'wilk' },
      { left: 'fox', right: 'lis' },
      { left: 'deer', right: 'jeleń' },
      { left: 'squirrel', right: 'wiewiórka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_007', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'butterfly', right: 'motyl' },
      { left: 'bee', right: 'pszczoła' },
      { left: 'ant', right: 'mrówka' },
      { left: 'spider', right: 'pająk' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_008', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'snake', right: 'wąż' },
      { left: 'turtle', right: 'żółw' },
      { left: 'owl', right: 'sowa' },
      { left: 'eagle', right: 'orzeł' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Colors (sets 009-012) ---
  {
    id: 'match_009', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'red', right: 'czerwony' },
      { left: 'blue', right: 'niebieski' },
      { left: 'green', right: 'zielony' },
      { left: 'yellow', right: 'żółty' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_010', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'white', right: 'biały' },
      { left: 'black', right: 'czarny' },
      { left: 'brown', right: 'brązowy' },
      { left: 'orange', right: 'pomarańczowy' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_011', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'pink', right: 'różowy' },
      { left: 'purple', right: 'fioletowy' },
      { left: 'grey', right: 'szary' },
      { left: 'gold', right: 'złoty' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_012', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'silver', right: 'srebrny' },
      { left: 'dark', right: 'ciemny' },
      { left: 'light', right: 'jasny' },
      { left: 'colorful', right: 'kolorowy' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Numbers 1-20 (sets 013-017) ---
  {
    id: 'match_013', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'one', right: 'jeden' },
      { left: 'two', right: 'dwa' },
      { left: 'three', right: 'trzy' },
      { left: 'four', right: 'cztery' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_014', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'five', right: 'pięć' },
      { left: 'six', right: 'sześć' },
      { left: 'seven', right: 'siedem' },
      { left: 'eight', right: 'osiem' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_015', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'nine', right: 'dziewięć' },
      { left: 'ten', right: 'dziesięć' },
      { left: 'eleven', right: 'jedenaście' },
      { left: 'twelve', right: 'dwanaście' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_016', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'thirteen', right: 'trzynaście' },
      { left: 'fourteen', right: 'czternaście' },
      { left: 'fifteen', right: 'piętnaście' },
      { left: 'sixteen', right: 'szesnaście' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_017', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'seventeen', right: 'siedemnaście' },
      { left: 'eighteen', right: 'osiemnaście' },
      { left: 'nineteen', right: 'dziewiętnaście' },
      { left: 'twenty', right: 'dwadzieścia' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Family Members (sets 018-021) ---
  {
    id: 'match_018', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'mom', right: 'mama' },
      { left: 'dad', right: 'tata' },
      { left: 'sister', right: 'siostra' },
      { left: 'brother', right: 'brat' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_019', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'grandmother', right: 'babcia' },
      { left: 'grandfather', right: 'dziadek' },
      { left: 'aunt', right: 'ciocia' },
      { left: 'uncle', right: 'wujek' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_020', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'son', right: 'syn' },
      { left: 'daughter', right: 'córka' },
      { left: 'baby', right: 'niemowlę' },
      { left: 'child', right: 'dziecko' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_021', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'cousin', right: 'kuzyn' },
      { left: 'family', right: 'rodzina' },
      { left: 'parents', right: 'rodzice' },
      { left: 'friend', right: 'przyjaciel' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Body Parts (sets 022-026) ---
  {
    id: 'match_022', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'head', right: 'głowa' },
      { left: 'hand', right: 'ręka' },
      { left: 'leg', right: 'noga' },
      { left: 'foot', right: 'stopa' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_023', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'eye', right: 'oko' },
      { left: 'ear', right: 'ucho' },
      { left: 'nose', right: 'nos' },
      { left: 'mouth', right: 'usta' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_024', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'hair', right: 'włosy' },
      { left: 'tooth', right: 'ząb' },
      { left: 'finger', right: 'palec' },
      { left: 'knee', right: 'kolano' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_025', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'heart', right: 'serce' },
      { left: 'stomach', right: 'brzuch' },
      { left: 'back', right: 'plecy' },
      { left: 'neck', right: 'szyja' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_026', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'arm', right: 'ramię' },
      { left: 'shoulder', right: 'bark' },
      { left: 'face', right: 'twarz' },
      { left: 'tongue', right: 'język' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Basic Food (sets 027-032) ---
  {
    id: 'match_027', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'bread', right: 'chleb' },
      { left: 'milk', right: 'mleko' },
      { left: 'water', right: 'woda' },
      { left: 'juice', right: 'sok' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_028', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'cheese', right: 'ser' },
      { left: 'butter', right: 'masło' },
      { left: 'egg', right: 'jajko' },
      { left: 'rice', right: 'ryż' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_029', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'soup', right: 'zupa' },
      { left: 'meat', right: 'mięso' },
      { left: 'cake', right: 'ciasto' },
      { left: 'ice cream', right: 'lody' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_030', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'sugar', right: 'cukier' },
      { left: 'salt', right: 'sól' },
      { left: 'tea', right: 'herbata' },
      { left: 'chocolate', right: 'czekolada' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_031', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'sandwich', right: 'kanapka' },
      { left: 'pizza', right: 'pizza' },
      { left: 'pasta', right: 'makaron' },
      { left: 'potato', right: 'ziemniak' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_032', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'honey', right: 'miód' },
      { left: 'jam', right: 'dżem' },
      { left: 'cookie', right: 'ciastko' },
      { left: 'candy', right: 'cukierek' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Clothing (sets 033-036) ---
  {
    id: 'match_033', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'shirt', right: 'koszulka' },
      { left: 'pants', right: 'spodnie' },
      { left: 'dress', right: 'sukienka' },
      { left: 'shoes', right: 'buty' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_034', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'hat', right: 'czapka' },
      { left: 'jacket', right: 'kurtka' },
      { left: 'socks', right: 'skarpetki' },
      { left: 'scarf', right: 'szalik' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_035', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'gloves', right: 'rękawiczki' },
      { left: 'sweater', right: 'sweter' },
      { left: 'skirt', right: 'spódnica' },
      { left: 'boots', right: 'kozaki' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_036', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'coat', right: 'płaszcz' },
      { left: 'belt', right: 'pasek' },
      { left: 'pajamas', right: 'piżama' },
      { left: 'umbrella', right: 'parasol' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Common Objects (sets 037-041) ---
  {
    id: 'match_037', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'table', right: 'stół' },
      { left: 'chair', right: 'krzesło' },
      { left: 'door', right: 'drzwi' },
      { left: 'window', right: 'okno' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_038', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'bed', right: 'łóżko' },
      { left: 'lamp', right: 'lampa' },
      { left: 'clock', right: 'zegar' },
      { left: 'mirror', right: 'lustro' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_039', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'key', right: 'klucz' },
      { left: 'phone', right: 'telefon' },
      { left: 'bag', right: 'torba' },
      { left: 'box', right: 'pudełko' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_040', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'book', right: 'książka' },
      { left: 'picture', right: 'obrazek' },
      { left: 'flower', right: 'kwiat' },
      { left: 'toy', right: 'zabawka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_041', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'cup', right: 'kubek' },
      { left: 'plate', right: 'talerz' },
      { left: 'spoon', right: 'łyżka' },
      { left: 'fork', right: 'widelec' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Basic Verbs (sets 042-048) ---
  {
    id: 'match_042', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to eat', right: 'jeść' },
      { left: 'to drink', right: 'pić' },
      { left: 'to sleep', right: 'spać' },
      { left: 'to run', right: 'biegać' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_043', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to read', right: 'czytać' },
      { left: 'to write', right: 'pisać' },
      { left: 'to draw', right: 'rysować' },
      { left: 'to sing', right: 'śpiewać' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_044', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to play', right: 'grać' },
      { left: 'to jump', right: 'skakać' },
      { left: 'to swim', right: 'pływać' },
      { left: 'to dance', right: 'tańczyć' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_045', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to go', right: 'iść' },
      { left: 'to see', right: 'widzieć' },
      { left: 'to hear', right: 'słyszeć' },
      { left: 'to speak', right: 'mówić' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_046', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to have', right: 'mieć' },
      { left: 'to give', right: 'dawać' },
      { left: 'to take', right: 'brać' },
      { left: 'to want', right: 'chcieć' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_047', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to like', right: 'lubić' },
      { left: 'to love', right: 'kochać' },
      { left: 'to know', right: 'wiedzieć' },
      { left: 'to think', right: 'myśleć' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_048', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'to open', right: 'otwierać' },
      { left: 'to close', right: 'zamykać' },
      { left: 'to sit', right: 'siedzieć' },
      { left: 'to stand', right: 'stać' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Days of the Week (sets 049-050) ---
  {
    id: 'match_049', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'Monday', right: 'poniedziałek' },
      { left: 'Tuesday', right: 'wtorek' },
      { left: 'Wednesday', right: 'środa' },
      { left: 'Thursday', right: 'czwartek' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_050', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'Friday', right: 'piątek' },
      { left: 'Saturday', right: 'sobota' },
      { left: 'Sunday', right: 'niedziela' },
      { left: 'week', right: 'tydzień' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Basic Adjectives (sets 051-056) ---
  {
    id: 'match_051', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'big', right: 'duży' },
      { left: 'small', right: 'mały' },
      { left: 'tall', right: 'wysoki' },
      { left: 'short', right: 'niski' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_052', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'hot', right: 'gorący' },
      { left: 'cold', right: 'zimny' },
      { left: 'warm', right: 'ciepły' },
      { left: 'cool', right: 'chłodny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_053', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'good', right: 'dobry' },
      { left: 'bad', right: 'zły' },
      { left: 'new', right: 'nowy' },
      { left: 'old', right: 'stary' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_054', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'happy', right: 'szczęśliwy' },
      { left: 'sad', right: 'smutny' },
      { left: 'fast', right: 'szybki' },
      { left: 'slow', right: 'wolny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_055', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'young', right: 'młody' },
      { left: 'beautiful', right: 'piękny' },
      { left: 'ugly', right: 'brzydki' },
      { left: 'strong', right: 'silny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_056', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'clean', right: 'czysty' },
      { left: 'dirty', right: 'brudny' },
      { left: 'wet', right: 'mokry' },
      { left: 'dry', right: 'suchy' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Fruits (sets 057-060) ---
  {
    id: 'match_057', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'apple', right: 'jabłko' },
      { left: 'banana', right: 'banan' },
      { left: 'orange', right: 'pomarańcza' },
      { left: 'strawberry', right: 'truskawka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_058', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'cherry', right: 'wiśnia' },
      { left: 'grape', right: 'winogrono' },
      { left: 'pear', right: 'gruszka' },
      { left: 'plum', right: 'śliwka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_059', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'watermelon', right: 'arbuz' },
      { left: 'lemon', right: 'cytryna' },
      { left: 'peach', right: 'brzoskwinia' },
      { left: 'raspberry', right: 'malina' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_060', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'blueberry', right: 'jagoda' },
      { left: 'pineapple', right: 'ananas' },
      { left: 'melon', right: 'melon' },
      { left: 'kiwi', right: 'kiwi' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Vegetables (sets 061-064) ---
  {
    id: 'match_061', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'carrot', right: 'marchewka' },
      { left: 'tomato', right: 'pomidor' },
      { left: 'cucumber', right: 'ogórek' },
      { left: 'onion', right: 'cebula' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_062', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'pepper', right: 'papryka' },
      { left: 'cabbage', right: 'kapusta' },
      { left: 'peas', right: 'groszek' },
      { left: 'corn', right: 'kukurydza' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_063', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'lettuce', right: 'sałata' },
      { left: 'garlic', right: 'czosnek' },
      { left: 'bean', right: 'fasola' },
      { left: 'mushroom', right: 'grzyb' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_064', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'beetroot', right: 'burak' },
      { left: 'radish', right: 'rzodkiewka' },
      { left: 'pumpkin', right: 'dynia' },
      { left: 'celery', right: 'seler' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Rooms in a House (sets 065-067) ---
  {
    id: 'match_065', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'kitchen', right: 'kuchnia' },
      { left: 'bedroom', right: 'sypialnia' },
      { left: 'bathroom', right: 'łazienka' },
      { left: 'living room', right: 'salon' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_066', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'garden', right: 'ogród' },
      { left: 'garage', right: 'garaż' },
      { left: 'attic', right: 'strych' },
      { left: 'basement', right: 'piwnica' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_067', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'hallway', right: 'korytarz' },
      { left: 'balcony', right: 'balkon' },
      { left: 'roof', right: 'dach' },
      { left: 'stairs', right: 'schody' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- School Items (sets 068-072) ---
  {
    id: 'match_068', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'pencil', right: 'ołówek' },
      { left: 'pen', right: 'długopis' },
      { left: 'eraser', right: 'gumka' },
      { left: 'ruler', right: 'linijka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_069', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'notebook', right: 'zeszyt' },
      { left: 'backpack', right: 'plecak' },
      { left: 'scissors', right: 'nożyczki' },
      { left: 'glue', right: 'klej' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_070', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'teacher', right: 'nauczyciel' },
      { left: 'student', right: 'uczeń' },
      { left: 'school', right: 'szkoła' },
      { left: 'classroom', right: 'klasa' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_071', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'desk', right: 'biurko' },
      { left: 'blackboard', right: 'tablica' },
      { left: 'chalk', right: 'kreda' },
      { left: 'map', right: 'mapa' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_072', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'lesson', right: 'lekcja' },
      { left: 'homework', right: 'zadanie domowe' },
      { left: 'test', right: 'sprawdzian' },
      { left: 'grade', right: 'ocena' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Weather Words (sets 073-076) ---
  {
    id: 'match_073', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'sun', right: 'słońce' },
      { left: 'rain', right: 'deszcz' },
      { left: 'snow', right: 'śnieg' },
      { left: 'wind', right: 'wiatr' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_074', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'cloud', right: 'chmura' },
      { left: 'storm', right: 'burza' },
      { left: 'rainbow', right: 'tęcza' },
      { left: 'fog', right: 'mgła' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_075', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'sky', right: 'niebo' },
      { left: 'star', right: 'gwiazda' },
      { left: 'moon', right: 'księżyc' },
      { left: 'lightning', right: 'błyskawica' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_076', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'spring', right: 'wiosna' },
      { left: 'summer', right: 'lato' },
      { left: 'autumn', right: 'jesień' },
      { left: 'winter', right: 'zima' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Greetings / Basic Phrases (sets 077-080) ---
  {
    id: 'match_077', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'hello', right: 'cześć' },
      { left: 'goodbye', right: 'do widzenia' },
      { left: 'please', right: 'proszę' },
      { left: 'thank you', right: 'dziękuję' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_078', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'yes', right: 'tak' },
      { left: 'no', right: 'nie' },
      { left: 'sorry', right: 'przepraszam' },
      { left: 'good morning', right: 'dzień dobry' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_079', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'good night', right: 'dobranoc' },
      { left: 'welcome', right: 'witaj' },
      { left: 'help', right: 'pomoc' },
      { left: 'congratulations', right: 'gratulacje' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_080', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'how are you', right: 'jak się masz' },
      { left: 'I am fine', right: 'dobrze' },
      { left: 'see you', right: 'do zobaczenia' },
      { left: 'good luck', right: 'powodzenia' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- More Common Objects and Misc Easy (sets 081-088) ---
  {
    id: 'match_081', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'house', right: 'dom' },
      { left: 'tree', right: 'drzewo' },
      { left: 'car', right: 'samochód' },
      { left: 'street', right: 'ulica' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_082', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'river', right: 'rzeka' },
      { left: 'mountain', right: 'góra' },
      { left: 'sea', right: 'morze' },
      { left: 'lake', right: 'jezioro' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_083', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'knife', right: 'nóż' },
      { left: 'glass', right: 'szklanka' },
      { left: 'pot', right: 'garnek' },
      { left: 'bowl', right: 'miska' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_084', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'king', right: 'król' },
      { left: 'queen', right: 'królowa' },
      { left: 'knight', right: 'rycerz' },
      { left: 'dragon', right: 'smok' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_085', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'sword', right: 'miecz' },
      { left: 'shield', right: 'tarcza' },
      { left: 'castle', right: 'zamek' },
      { left: 'treasure', right: 'skarb' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_086', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'morning', right: 'rano' },
      { left: 'afternoon', right: 'popołudnie' },
      { left: 'evening', right: 'wieczór' },
      { left: 'night', right: 'noc' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_087', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'today', right: 'dzisiaj' },
      { left: 'tomorrow', right: 'jutro' },
      { left: 'yesterday', right: 'wczoraj' },
      { left: 'always', right: 'zawsze' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_088', difficulty: 1, category: 'matching',
    pairs: [
      { left: 'here', right: 'tutaj' },
      { left: 'there', right: 'tam' },
      { left: 'left', right: 'lewo' },
      { left: 'right', right: 'prawo' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // ============================================================
  // DIFFICULTY 2 - Medium (54 sets: match_089 through match_142)
  // ============================================================

  // --- Professions (sets 089-094) ---
  {
    id: 'match_089', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'doctor', right: 'lekarz' },
      { left: 'nurse', right: 'pielęgniarka' },
      { left: 'firefighter', right: 'strażak' },
      { left: 'police officer', right: 'policjant' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_090', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'baker', right: 'piekarz' },
      { left: 'cook', right: 'kucharz' },
      { left: 'farmer', right: 'rolnik' },
      { left: 'fisherman', right: 'rybak' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_091', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'pilot', right: 'pilot' },
      { left: 'sailor', right: 'marynarz' },
      { left: 'mechanic', right: 'mechanik' },
      { left: 'carpenter', right: 'stolarz' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_092', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'firefighter', right: 'strażak' },
      { left: 'vet', right: 'weterynarz' },
      { left: 'bus driver', right: 'kierowca' },
      { left: 'postman', right: 'listonosz' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_093', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'painter', right: 'malarz' },
      { left: 'actor', right: 'aktor' },
      { left: 'singer', right: 'piosenkarz' },
      { left: 'writer', right: 'pisarz' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_094', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'waiter', right: 'kelner' },
      { left: 'hairdresser', right: 'fryzjer' },
      { left: 'postman', right: 'listonosz' },
      { left: 'soldier', right: 'żołnierz' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Emotions (sets 095-098) ---
  {
    id: 'match_095', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'angry', right: 'zły' },
      { left: 'scared', right: 'przestraszony' },
      { left: 'surprised', right: 'zaskoczony' },
      { left: 'tired', right: 'zmęczony' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_096', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'excited', right: 'podekscytowany' },
      { left: 'bored', right: 'znudzony' },
      { left: 'proud', right: 'dumny' },
      { left: 'shy', right: 'nieśmiały' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_097', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'jealous', right: 'zazdrosny' },
      { left: 'lonely', right: 'samotny' },
      { left: 'grateful', right: 'wdzięczny' },
      { left: 'worried', right: 'zaniepokojony' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_098', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'brave', right: 'odważny' },
      { left: 'calm', right: 'spokojny' },
      { left: 'curious', right: 'ciekawy' },
      { left: 'confused', right: 'zdezorientowany' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Transportation (sets 099-103) ---
  {
    id: 'match_099', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'bus', right: 'autobus' },
      { left: 'train', right: 'pociąg' },
      { left: 'airplane', right: 'samolot' },
      { left: 'bicycle', right: 'rower' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_100', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'ship', right: 'statek' },
      { left: 'boat', right: 'łódź' },
      { left: 'helicopter', right: 'helikopter' },
      { left: 'motorcycle', right: 'motocykl' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_101', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'tram', right: 'tramwaj' },
      { left: 'taxi', right: 'taksówka' },
      { left: 'truck', right: 'ciężarówka' },
      { left: 'ambulance', right: 'karetka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_102', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'road', right: 'droga' },
      { left: 'bridge', right: 'most' },
      { left: 'tunnel', right: 'tunel' },
      { left: 'crossroads', right: 'skrzyżowanie' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_103', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'ticket', right: 'bilet' },
      { left: 'station', right: 'stacja' },
      { left: 'airport', right: 'lotnisko' },
      { left: 'harbor', right: 'port' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Nature / Landscape (sets 104-108) ---
  {
    id: 'match_104', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'forest', right: 'las' },
      { left: 'field', right: 'pole' },
      { left: 'meadow', right: 'łąka' },
      { left: 'valley', right: 'dolina' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_105', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'island', right: 'wyspa' },
      { left: 'waterfall', right: 'wodospad' },
      { left: 'cave', right: 'jaskinia' },
      { left: 'cliff', right: 'klif' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_106', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'leaf', right: 'liść' },
      { left: 'branch', right: 'gałąź' },
      { left: 'root', right: 'korzeń' },
      { left: 'seeds', right: 'nasiona' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_107', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'stone', right: 'kamień' },
      { left: 'sand', right: 'piasek' },
      { left: 'mud', right: 'błoto' },
      { left: 'dust', right: 'kurz' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_108', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'bush', right: 'krzak' },
      { left: 'grass', right: 'trawa' },
      { left: 'moss', right: 'mech' },
      { left: 'pond', right: 'staw' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Household Items (sets 109-112) ---
  {
    id: 'match_109', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'fridge', right: 'lodówka' },
      { left: 'oven', right: 'piekarnik' },
      { left: 'washing machine', right: 'pralka' },
      { left: 'vacuum cleaner', right: 'odkurzacz' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_110', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'towel', right: 'ręcznik' },
      { left: 'pillow', right: 'poduszka' },
      { left: 'blanket', right: 'koc' },
      { left: 'curtain', right: 'zasłona' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_111', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'shelf', right: 'półka' },
      { left: 'wardrobe', right: 'szafa' },
      { left: 'drawer', right: 'szuflada' },
      { left: 'carpet', right: 'dywan' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_112', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'soap', right: 'mydło' },
      { left: 'toothbrush', right: 'szczoteczka do zębów' },
      { left: 'comb', right: 'grzebień' },
      { left: 'bathtub', right: 'wanna' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Sports (sets 113-116) ---
  {
    id: 'match_113', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'football', right: 'piłka nożna' },
      { left: 'basketball', right: 'koszykówka' },
      { left: 'volleyball', right: 'siatkówka' },
      { left: 'tennis', right: 'tenis' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_114', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'swimming', right: 'pływanie' },
      { left: 'skiing', right: 'narciarstwo' },
      { left: 'skating', right: 'łyżwiarstwo' },
      { left: 'running', right: 'bieganie' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_115', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'goal', right: 'bramka' },
      { left: 'ball', right: 'piłka' },
      { left: 'team', right: 'drużyna' },
      { left: 'coach', right: 'trener' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_116', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'race', right: 'wyścig' },
      { left: 'medal', right: 'medal' },
      { left: 'champion', right: 'mistrz' },
      { left: 'stadium', right: 'stadion' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Musical Instruments (sets 117-119) ---
  {
    id: 'match_117', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'piano', right: 'pianino' },
      { left: 'guitar', right: 'gitara' },
      { left: 'violin', right: 'skrzypce' },
      { left: 'drums', right: 'perkusja' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_118', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'flute', right: 'flet' },
      { left: 'trumpet', right: 'trąbka' },
      { left: 'harp', right: 'harfa' },
      { left: 'accordion', right: 'akordeon' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_119', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'song', right: 'piosenka' },
      { left: 'melody', right: 'melodia' },
      { left: 'concert', right: 'koncert' },
      { left: 'orchestra', right: 'orkiestra' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- More Complex Adjectives (sets 120-123) ---
  {
    id: 'match_120', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'heavy', right: 'ciężki' },
      { left: 'light', right: 'lekki' },
      { left: 'wide', right: 'szeroki' },
      { left: 'narrow', right: 'wąski' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_121', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'deep', right: 'głęboki' },
      { left: 'shallow', right: 'płytki' },
      { left: 'thick', right: 'gruby' },
      { left: 'thin', right: 'cienki' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_122', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'soft', right: 'miękki' },
      { left: 'hard', right: 'twardy' },
      { left: 'rough', right: 'szorstki' },
      { left: 'smooth', right: 'gładki' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_123', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'sharp', right: 'ostry' },
      { left: 'blunt', right: 'tępy' },
      { left: 'loose', right: 'luźny' },
      { left: 'tight', right: 'ciasny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Kitchen Items (sets 124-126) ---
  {
    id: 'match_124', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'pan', right: 'patelnia' },
      { left: 'kettle', right: 'czajnik' },
      { left: 'cutting board', right: 'deska do krojenia' },
      { left: 'colander', right: 'durszlak' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_125', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'tray', right: 'taca' },
      { left: 'jug', right: 'dzbanek' },
      { left: 'lid', right: 'pokrywka' },
      { left: 'saucer', right: 'spodek' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_126', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'plate', right: 'talerz' },
      { left: 'cup', right: 'filiżanka' },
      { left: 'bowl', right: 'miska' },
      { left: 'tray', right: 'taca' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Tools (sets 127-129) ---
  {
    id: 'match_127', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'hammer', right: 'młotek' },
      { left: 'screwdriver', right: 'śrubokręt' },
      { left: 'saw', right: 'piła' },
      { left: 'nail', right: 'gwóźdź' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_128', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'watering can', right: 'konewka' },
      { left: 'rake', right: 'grabie' },
      { left: 'wheelbarrow', right: 'taczka' },
      { left: 'broom', right: 'miotła' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_129', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'ladder', right: 'drabina' },
      { left: 'rope', right: 'lina' },
      { left: 'bucket', right: 'wiadro' },
      { left: 'shovel', right: 'łopata' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Buildings / Places (sets 130-134) ---
  {
    id: 'match_130', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'hospital', right: 'szpital' },
      { left: 'pharmacy', right: 'apteka' },
      { left: 'library', right: 'biblioteka' },
      { left: 'museum', right: 'muzeum' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_131', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'church', right: 'kościół' },
      { left: 'theater', right: 'teatr' },
      { left: 'cinema', right: 'kino' },
      { left: 'restaurant', right: 'restauracja' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_132', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'shop', right: 'sklep' },
      { left: 'market', right: 'rynek' },
      { left: 'bank', right: 'bank' },
      { left: 'post office', right: 'poczta' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_133', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'park', right: 'park' },
      { left: 'playground', right: 'plac zabaw' },
      { left: 'swimming pool', right: 'basen' },
      { left: 'zoo', right: 'zoo' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_134', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'factory', right: 'fabryka' },
      { left: 'tower', right: 'wieża' },
      { left: 'palace', right: 'pałac' },
      { left: 'monument', right: 'pomnik' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Time-Related Words (sets 135-138) ---
  {
    id: 'match_135', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'hour', right: 'godzina' },
      { left: 'minute', right: 'minuta' },
      { left: 'second', right: 'sekunda' },
      { left: 'month', right: 'miesiąc' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_136', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'January', right: 'styczeń' },
      { left: 'February', right: 'luty' },
      { left: 'March', right: 'marzec' },
      { left: 'April', right: 'kwiecień' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_137', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'May', right: 'maj' },
      { left: 'June', right: 'czerwiec' },
      { left: 'July', right: 'lipiec' },
      { left: 'August', right: 'sierpień' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_138', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'September', right: 'wrzesień' },
      { left: 'October', right: 'październik' },
      { left: 'November', right: 'listopad' },
      { left: 'December', right: 'grudzień' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- More Medium Words (sets 139-142) ---
  {
    id: 'match_139', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'to cook', right: 'gotować' },
      { left: 'to clean', right: 'sprzątać' },
      { left: 'to wash', right: 'myć' },
      { left: 'to iron', right: 'prasować' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_140', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'to build', right: 'budować' },
      { left: 'to repair', right: 'naprawiać' },
      { left: 'to carry', right: 'nosić' },
      { left: 'to push', right: 'pchać' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_141', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'to choose', right: 'wybierać' },
      { left: 'to wait', right: 'czekać' },
      { left: 'to remember', right: 'pamiętać' },
      { left: 'to forget', right: 'zapominać' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_142', difficulty: 2, category: 'matching',
    pairs: [
      { left: 'to explain', right: 'wyjaśniać' },
      { left: 'to learn', right: 'uczyć się' },
      { left: 'to teach', right: 'nauczać' },
      { left: 'to understand', right: 'rozumieć' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // ============================================================
  // DIFFICULTY 3 - Hard (32 sets: match_143 through match_174)
  // ============================================================

  // --- Abstract Concepts (sets 143-148) ---
  {
    id: 'match_143', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'magic', right: 'magia' },
      { left: 'treasure', right: 'skarb' },
      { left: 'adventure', right: 'przygoda' },
      { left: 'secret', right: 'sekret' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_144', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'swing', right: 'huśtawka' },
      { left: 'slide', right: 'zjeżdżalnia' },
      { left: 'merry-go-round', right: 'karuzela' },
      { left: 'sandbox', right: 'piaskownica' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_145', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'tent', right: 'namiot' },
      { left: 'campfire', right: 'ognisko' },
      { left: 'backpack', right: 'plecak' },
      { left: 'compass', right: 'kompas' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_146', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'rocket', right: 'rakieta' },
      { left: 'astronaut', right: 'astronauta' },
      { left: 'planet', right: 'planeta' },
      { left: 'alien', right: 'kosmita' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_147', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'barn', right: 'stodoła' },
      { left: 'tractor', right: 'traktor' },
      { left: 'hay', right: 'siano' },
      { left: 'fence', right: 'płot' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_148', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'wave', right: 'fala' },
      { left: 'shell', right: 'muszelka' },
      { left: 'sandcastle', right: 'zamek z piasku' },
      { left: 'seagull', right: 'mewa' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Science Terms (sets 149-153) ---
  {
    id: 'match_149', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'magnet', right: 'magnes' },
      { left: 'rainbow', right: 'tęcza' },
      { left: 'shadow', right: 'cień' },
      { left: 'mirror', right: 'lustro' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_150', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'dinosaur', right: 'dinozaur' },
      { left: 'fossil', right: 'skamieniałość' },
      { left: 'skeleton', right: 'szkielet' },
      { left: 'volcano', right: 'wulkan' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_151', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'ladybug', right: 'biedronka' },
      { left: 'caterpillar', right: 'gąsienica' },
      { left: 'dragonfly', right: 'ważka' },
      { left: 'snail', right: 'ślimak' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_152', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'spaceship', right: 'statek kosmiczny' },
      { left: 'comet', right: 'kometa' },
      { left: 'telescope', right: 'teleskop' },
      { left: 'crater', right: 'krater' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_153', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'leash', right: 'smycz' },
      { left: 'collar', right: 'obroża' },
      { left: 'paw', right: 'łapa' },
      { left: 'tail', right: 'ogon' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Geography (sets 154-157) ---
  {
    id: 'match_154', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'continent', right: 'kontynent' },
      { left: 'ocean', right: 'ocean' },
      { left: 'desert', right: 'pustynia' },
      { left: 'glacier', right: 'lodowiec' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_155', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'beach', right: 'plaża' },
      { left: 'cliff', right: 'klif' },
      { left: 'cave', right: 'jaskinia' },
      { left: 'waterfall', right: 'wodospad' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_156', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'country', right: 'kraj' },
      { left: 'city', right: 'miasto' },
      { left: 'village', right: 'wieś' },
      { left: 'flag', right: 'flaga' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_157', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'pirate', right: 'pirat' },
      { left: 'map', right: 'mapa' },
      { left: 'parrot', right: 'papuga' },
      { left: 'ship', right: 'statek' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Less Common Animals (sets 158-160) ---
  {
    id: 'match_158', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'hedgehog', right: 'jeż' },
      { left: 'badger', right: 'borsuk' },
      { left: 'stork', right: 'bocian' },
      { left: 'peacock', right: 'paw' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_159', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'octopus', right: 'ośmiornica' },
      { left: 'dolphin', right: 'delfin' },
      { left: 'whale', right: 'wieloryb' },
      { left: 'shark', right: 'rekin' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_160', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'chameleon', right: 'kameleon' },
      { left: 'crocodile', right: 'krokodyl' },
      { left: 'parrot', right: 'papuga' },
      { left: 'penguin', right: 'pingwin' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Compound Words / Cultural Terms (sets 161-164) ---
  {
    id: 'match_161', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'sunflower', right: 'słonecznik' },
      { left: 'snowflake', right: 'płatek śniegu' },
      { left: 'thunderstorm', right: 'burza z piorunami' },
      { left: 'whirlpool', right: 'wir wodny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_162', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'Christmas', right: 'Boże Narodzenie' },
      { left: 'Easter', right: 'Wielkanoc' },
      { left: 'birthday', right: 'urodziny' },
      { left: 'wedding', right: 'ślub' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_163', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'fairy tale', right: 'bajka' },
      { left: 'story', right: 'opowiadanie' },
      { left: 'hero', right: 'bohater' },
      { left: 'dragon', right: 'smok' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_164', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'dance', right: 'taniec' },
      { left: 'parade', right: 'parada' },
      { left: 'costume', right: 'kostium' },
      { left: 'feast', right: 'uczta' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Medical / Health Terms (sets 165-168) ---
  {
    id: 'match_165', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'fever', right: 'gorączka' },
      { left: 'cough', right: 'kaszel' },
      { left: 'headache', right: 'ból głowy' },
      { left: 'wound', right: 'rana' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_166', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'medicine', right: 'lekarstwo' },
      { left: 'bandage', right: 'bandaż' },
      { left: 'plaster', right: 'plaster' },
      { left: 'thermometer', right: 'termometr' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_167', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'cold', right: 'przeziębienie' },
      { left: 'cough', right: 'kaszel' },
      { left: 'sneeze', right: 'kichanie' },
      { left: 'fever', right: 'gorączka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_168', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'blood', right: 'krew' },
      { left: 'bone', right: 'kość' },
      { left: 'muscle', right: 'mięsień' },
      { left: 'brain', right: 'mózg' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Technology (sets 169-171) ---
  {
    id: 'match_169', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'computer', right: 'komputer' },
      { left: 'keyboard', right: 'klawiatura' },
      { left: 'screen', right: 'ekran' },
      { left: 'printer', right: 'drukarka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_170', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'internet', right: 'internet' },
      { left: 'tablet', right: 'tablet' },
      { left: 'password', right: 'hasło' },
      { left: 'game', right: 'gra' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_171', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'battery', right: 'bateria' },
      { left: 'charger', right: 'ładowarka' },
      { left: 'cable', right: 'kabel' },
      { left: 'plug', right: 'wtyczka' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },

  // --- Advanced Adjectives (sets 172-174) ---
  {
    id: 'match_172', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'invisible', right: 'niewidzialny' },
      { left: 'enormous', right: 'ogromny' },
      { left: 'magical', right: 'magiczny' },
      { left: 'scary', right: 'straszny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_173', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'mysterious', right: 'tajemniczy' },
      { left: 'wonderful', right: 'cudowny' },
      { left: 'ordinary', right: 'zwyczajny' },
      { left: 'strange', right: 'dziwny' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  },
  {
    id: 'match_174', difficulty: 3, category: 'matching',
    pairs: [
      { left: 'shiny', right: 'błyszczący' },
      { left: 'fluffy', right: 'puszysty' },
      { left: 'sticky', right: 'lepki' },
      { left: 'smelly', right: 'śmierdzący' }
    ],
    leftLabel: 'English', rightLabel: 'Polski'
  }
];
