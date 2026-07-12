// Standalone Numerology Calculator Service
// Based on standard and well-established formulas

// Letter values in Pythagorean numerology
const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

// Vowels list
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// Helper to sum all digits of a number
export function sumDigits(num: number): number {
  return Math.abs(num)
    .toString()
    .split('')
    .map(Number)
    .filter(n => !isNaN(n))
    .reduce((sum, d) => sum + d, 0);
}

// Reduce number to a single digit (1-9) or keep master numbers (11, 22, 33)
export function reduceNumber(num: number, preserveMaster: boolean = true): number {
  let val = Math.abs(num);
  if (val === 0) return 0;
  
  while (val > 9) {
    if (preserveMaster && (val === 11 || val === 22 || val === 33)) {
      return val;
    }
    val = sumDigits(val);
  }
  return val;
}

// Reduce specifically to single digit (1-9) even if it's a master number
export function reduceToSingleDigit(num: number): number {
  return reduceNumber(num, false);
}

// Parse Date of Birth into Day, Month, Year
export interface ParsedDOB {
  day: number;
  month: number;
  year: number;
}

export function parseDOB(dobStr: string): ParsedDOB {
  const parts = dobStr.split('-');
  if (parts.length !== 3) {
    return { day: 1, month: 1, year: 2000 };
  }
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
}

// Get string of digits from date of birth (e.g. 19950928)
export function getDOBDigits(dob: ParsedDOB): string {
  const dStr = dob.day.toString();
  const mStr = dob.month.toString();
  const yStr = dob.year.toString();
  return (dStr + mStr + yStr).replace(/0/g, '');
}

// Map characters in name to numbers
export function getNameLetterValues(name: string): { letter: string; val: number }[] {
  return name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map(letter => ({
      letter,
      val: PYTHAGOREAN_MAP[letter] || 0,
    }));
}

// Get numeric value of a string (sums character values)
export function getStringValue(str: string): number {
  return getNameLetterValues(str).reduce((sum, item) => sum + item.val, 0);
}

// Relationship Matrix for Driver / Conductor numbers
// 1 = Sun, 2 = Moon, 3 = Jupiter, 4 = Rahu, 5 = Mercury, 6 = Venus, 7 = Ketu, 8 = Saturn, 9 = Mars
const FRIENDLY_PLANETS: Record<number, number[]> = {
  1: [2, 3, 9, 5],
  2: [1, 3, 5],
  3: [1, 2, 9, 7],
  4: [5, 6, 8, 7],
  5: [1, 6, 4, 8],
  6: [5, 8, 4, 7],
  7: [1, 3, 4, 5, 6],
  8: [5, 6, 4, 7],
  9: [1, 2, 3],
};

const ENEMY_PLANETS: Record<number, number[]> = {
  1: [8, 7, 4],
  2: [4, 7, 8, 9],
  3: [6, 8],
  4: [1, 2, 9],
  5: [2],
  6: [1, 2],
  7: [2, 8, 9],
  8: [1, 2, 9],
  9: [4, 7, 8],
};

// ─── AI Text Templates / Meaning Library ─────────────────────

const CORE_NUMBERS_INFO: Record<number, { name: string; meaning: string; strength: string }> = {
  1: {
    name: 'The Leader',
    meaning: 'Independence, leadership, pioneering spirit, ambition, and strong willpower.',
    strength: 'Highly driven, self-sufficient, innovative, and courageous.',
  },
  2: {
    name: 'The Peacemaker',
    meaning: 'Cooperation, diplomacy, sensitivity, intuition, and balance.',
    strength: 'Empathetic, supportive, detailed-oriented, and harmonious.',
  },
  3: {
    name: 'The Creative Communicator',
    meaning: 'Self-expression, verbal communication, social life, optimism, and artistic talent.',
    strength: 'Charismatic, imaginative, joyful, and highly expressive.',
  },
  4: {
    name: 'The Builder',
    meaning: 'Practicality, discipline, hard work, system, and stability.',
    strength: 'Organized, logical, loyal, patient, and highly dependable.',
  },
  5: {
    name: 'The Free Spirit',
    meaning: 'Freedom, adaptability, change, adventure, and communication.',
    strength: 'Versatile, energetic, curious, and resilient.',
  },
  6: {
    name: 'The Nurturer',
    meaning: 'Responsibility, love, home, community service, and balance.',
    strength: 'Compassionate, artistic, protective, and domestic.',
  },
  7: {
    name: 'The Seeker',
    meaning: 'Analysis, spirituality, wisdom, research, and solitude.',
    strength: 'Intellectual, deep thinker, intuitive, and philosophical.',
  },
  8: {
    name: 'The Powerhouse',
    meaning: 'Material success, authority, balance of spiritual and physical power, judgment.',
    strength: 'Professional, efficient, strong-willed, and highly capable.',
  },
  9: {
    name: 'The Humanitarian',
    meaning: 'Universal love, compassion, selflessness, completion, and creativity.',
    strength: 'Generous, tolerant, artistic, and idealistic.',
  },
  11: {
    name: 'Master Number 11: The Intuitive Visionary',
    meaning: 'Highly charged spiritual insight, intuition, sensitivity, and enlightenment.',
    strength: 'Highly intuitive, inspiring, artistic, and charismatic.',
  },
  22: {
    name: 'Master Number 22: The Master Builder',
    meaning: 'Translating huge spiritual visions into practical physical realities.',
    strength: 'Extremely capable, practical, visionary, and pragmatic.',
  },
  33: {
    name: 'Master Number 33: The Master Teacher',
    meaning: 'Universal guidance, intense compassion, spiritual protection, and nurturing.',
    strength: 'Devoted, guidance-oriented, healing, and inspiring.',
  },
};

const PLANET_INFO: Record<string, { ruler: string; strength: string; weakness: string; influence: string; remedies: string; color: string; day: string }> = {
  Sun: {
    ruler: 'Sun (Number 1)',
    strength: 'Leadership, authority, confidence, clarity, individuality.',
    weakness: 'Egoism, pride, dominance, stubbornness, impatience.',
    influence: 'Governs career, public image, soul force, and relationships with father/authority figures.',
    remedies: 'Offer water to the rising Sun daily. Chant Gayatri Mantra 108 times.',
    color: 'Red, Ruby, Gold',
    day: 'Sunday',
  },
  Moon: {
    ruler: 'Moon (Number 2)',
    strength: 'Emotions, intuition, peace, creativity, sensitivity.',
    weakness: 'Mood swings, dependency, hypersensitivity, indecision.',
    influence: 'Governs subconscious mind, mother relationship, fluid balance, and mental health.',
    remedies: 'Respect mother and mother-like figures. Keep a silver square in your wallet.',
    color: 'White, Cream, Silver',
    day: 'Monday',
  },
  Jupiter: {
    ruler: 'Jupiter (Number 3)',
    strength: 'Wisdom, education, growth, spiritual inclination, wealth.',
    weakness: 'Over-optimism, extravagance, preachiness, self-righteousness.',
    influence: 'Governs expansion, divine luck, husband/guru support, and financial prosperity.',
    remedies: 'Donate yellow items on Thursday. Chant Guru Mantra.',
    color: 'Yellow, Saffron',
    day: 'Thursday',
  },
  Rahu: {
    ruler: 'Rahu (Number 4)',
    strength: 'Innovation, quick thinking, technological skill, ambition.',
    weakness: 'Illusion, confusion, sudden obstacles, obsession.',
    influence: 'Governs foreign connections, research, sudden wealth or losses, and unorthodox paths.',
    remedies: 'Feed black dogs. Keep a lead piece with you or wear dark colors on Saturday.',
    color: 'Dark Grey, Blue, Smoke',
    day: 'Saturday',
  },
  Mercury: {
    ruler: 'Mercury (Number 5)',
    strength: 'Calculative intelligence, communication, business success, humor.',
    weakness: 'Nervousness, duplicate nature, trickery, restlessness.',
    influence: 'Governs analytical skills, writing, marketing, commerce, and adaptability.',
    remedies: 'Feed green grass/spinach to cows on Wednesday. Wear green clothes.',
    color: 'Green, Emerald',
    day: 'Wednesday',
  },
  Venus: {
    ruler: 'Venus (Number 6)',
    strength: 'Love, luxury, relationships, beauty, artistic talents.',
    weakness: 'Over-indulgence, vanity, superficiality, emotional drama.',
    influence: 'Governs material comforts, marriage partner, beauty products, and creative professions.',
    remedies: 'Apply white sandalwood paste on your forehead. Be respectful to women.',
    color: 'Pink, Bright White, Cream',
    day: 'Friday',
  },
  Ketu: {
    ruler: 'Ketu (Number 7)',
    strength: 'Research, mysticism, introspection, spiritual awakening, analysis.',
    weakness: 'Detachment, isolation, confusion, lack of focus.',
    influence: 'Governs occult studies, sudden enlightenment, analytical deep dive, and physical healings.',
    remedies: 'Feed stray dogs. Donate multi-colored blankets to the needy.',
    color: 'Light Grey, Multi-colors, Brown',
    day: 'Thursday',
  },
  Saturn: {
    ruler: 'Saturn (Number 8)',
    strength: 'Discipline, maturity, hard work, persistence, organization.',
    weakness: 'Delays, chronic struggles, pessimism, rigidity.',
    influence: 'Governs karmic rewards, justice, long-term investments, and authority.',
    remedies: 'Chant Shani Mantra. Help the disabled or lower staff. Light a mustard oil lamp on Saturday.',
    color: 'Black, Dark Blue',
    day: 'Saturday',
  },
  Mars: {
    ruler: 'Mars (Number 9)',
    strength: 'Courage, physical stamina, leadership, protective nature.',
    weakness: 'Anger, aggression, impulsiveness, accidents.',
    influence: 'Governs land, energy levels, brother relationships, and mechanical works.',
    remedies: 'Chant Hanuman Chalisa. Donate red lentils (Masoor Dal) on Tuesday.',
    color: 'Bright Red, Coral',
    day: 'Tuesday',
  },
};

// ─── Mathematical Calculations ───────────────────────────────

export interface NumerologyReport {
  // Client Info
  name: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;

  // Basic Numbers
  lifePath: number;
  destiny: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthdayNum: number;
  maturityNum: number;
  attitudeNum: number;
  balanceNum: number;
  bridgeNum: number;
  hiddenPassion: number;
  subconsciousSelf: number;
  karmicDebts: number[];
  karmicLessons: number[];
  missingNumbers: number[];
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  challenges: number[];
  pinnacles: number[];

  // Lo Shu Grid
  loShuGrid: (string | null)[][]; // 3x3 layout: Row 1 [4,9,2], Row 2 [3,5,7], Row 3 [8,1,6]
  loShuFrequencies: Record<number, number>;
  loShuRepeated: number[];
  loShuDominant: number[];
  loShuArrows: { name: string; type: 'strength' | 'weakness' | 'none'; numbers: number[]; status: string; meaning: string }[];

  // Vedic Grid
  vedicGrid: (string | null)[][]; // 3x3 layout: Row 1 [3,1,9], Row 2 [6,7,5], Row 3 [2,8,4]
  vedicFrequencies: Record<number, number>;
  vedicStrongPlanets: string[];
  vedicWeakPlanets: string[];
  vedicPlanetStrengthPct: number;
  driverNum: number;
  conductorNum: number;
  luckyNumbers: number[];
  unluckyNumbers: number[];

  // Pythagorean Grid
  pythagoreanGrid: (string | null)[][]; // 1-4-7, 2-5-8, 3-6-9
  pythagoreanFrequencies: Record<number, number>;
  workingNumbers: number[];
  pythagoreanPlanes: { name: string; score: number; max: number; status: string; description: string }[];

  // Planets
  planetsAnalysis: { name: string; details: typeof PLANET_INFO[keyof typeof PLANET_INFO]; strengthPct: number }[];

  // Other Analyses
  nameAnalysis: {
    expression: number;
    soulUrge: number;
    personality: number;
    nameNumber: number;
    compoundNumber: number;
    luckyAlphabets: string[];
    missingAlphabets: string[];
    suggestedSpellings: string[];
  };
  mobileAnalysis: {
    value: number;
    planetInfluence: string;
    luckyPercentage: number;
    positiveEnergyPct: number;
    negativeEnergyPct: number;
  };
  vehicleAnalysis: {
    value: number;
    vibration: string;
    luckyScore: number;
    compatibility: string;
  };
  houseAnalysis: {
    value: number;
    vibration: string;
    planet: string;
    luckyScore: number;
  };

  // Recommendations & AI
  luckySuggestions: {
    colors: string[];
    gemstones: string[];
    rudraksha: string[];
    directions: string[];
    dates: number[];
    numbers: number[];
    careers: string[];
  };
  remedies: {
    mantras: string[];
    donations: string[];
    habits: string[];
    meditation: string;
    colors: string[];
    days: string[];
    lifestyle: string[];
  };

  aiReport: string;
}

export function calculateNumerology(
  name: string,
  dobStr: string,
  gender: string,
  mobile: string,
  email: string = '',
  mobileToCheck: string = '',
  vehicleNo: string = '',
  houseNo: string = ''
): NumerologyReport {
  const cleanName = name.toUpperCase().trim();
  const dob = parseDOB(dobStr);
  const dobDigits = getDOBDigits(dob);

  // 1. Basic Numerology calculations
  const driverNum = reduceNumber(dob.day, false);
  const conductorNum = reduceNumber(dob.day + dob.month + dob.year, false);

  // Life Path Number
  const lpMonth = reduceNumber(dob.month, false);
  const lpDay = reduceNumber(dob.day, false);
  const lpYear = reduceNumber(dob.year, false);
  const lifePath = reduceNumber(lpMonth + lpDay + lpYear, true);

  // Name sums
  const letters = getNameLetterValues(cleanName);
  const vowelsSum = letters.filter(l => VOWELS.has(l.letter)).reduce((s, l) => s + l.val, 0);
  const consonantsSum = letters.filter(l => !VOWELS.has(l.letter)).reduce((s, l) => s + l.val, 0);
  const totalNameSum = vowelsSum + consonantsSum;

  const expression = reduceNumber(totalNameSum, true);
  const soulUrge = reduceNumber(vowelsSum, true);
  const namePersonality = reduceNumber(consonantsSum, true);
  const destiny = conductorNum; // Conductor (DOB sum)
  const personality = driverNum; // Driver (DOB day)
  const birthdayNum = reduceNumber(dob.day, true);
  const maturityNum = reduceNumber(lifePath + expression, false);
  const attitudeNum = reduceNumber(dob.day + dob.month, false);

  // Balance Number (Initials)
  const nameParts = cleanName.split(/\s+/).filter(Boolean);
  const initialsSum = nameParts.reduce((s, part) => {
    const firstChar = part.charAt(0);
    return s + (PYTHAGOREAN_MAP[firstChar] || 0);
  }, 0);
  const balanceNum = reduceNumber(initialsSum, false);

  // Bridge Number
  const bridgeNum = Math.abs(reduceToSingleDigit(lifePath) - reduceToSingleDigit(expression));

  // Hidden Passion (Most frequent letter value)
  const letterCounts: Record<number, number> = {};
  letters.forEach(l => {
    letterCounts[l.val] = (letterCounts[l.val] || 0) + 1;
  });
  let maxCount = 0;
  let hiddenPassion = 1;
  Object.keys(letterCounts).forEach(k => {
    const key = parseInt(k, 10);
    if (letterCounts[key] > maxCount) {
      maxCount = letterCounts[key];
      hiddenPassion = key;
    }
  });

  // Subconscious Self (Count of unique numbers present in name)
  const uniqueNameNumbers = new Set(letters.map(l => l.val));
  const subconsciousSelf = uniqueNameNumbers.size;

  // Karmic Debts detection
  const karmicDebts: number[] = [];
  const checkKarmic = (sum: number) => {
    if ([13, 14, 16, 19].includes(sum) && !karmicDebts.includes(sum)) {
      karmicDebts.push(sum);
    }
  };
  // Check intermediate reductions
  checkKarmic(totalNameSum);
  checkKarmic(vowelsSum);
  checkKarmic(consonantsSum);
  checkKarmic(dob.day);
  checkKarmic(dob.month + dob.day + dob.year);

  // Karmic Lessons (Missing numbers 1-9 in name letters)
  const karmicLessons: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!uniqueNameNumbers.has(i)) {
      karmicLessons.push(i);
    }
  }

  // Missing Numbers in DOB digits
  const dobDigitsSet = new Set(dobDigits.split('').map(Number));
  const missingNumbers: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!dobDigitsSet.has(i)) {
      missingNumbers.push(i);
    }
  }

  // Personal Year, Month, Day (based on current year/date)
  const currentYear = new Date().getFullYear();
  const personalYear = reduceNumber(dob.day + dob.month + currentYear, false);
  const currentMonth = new Date().getMonth() + 1;
  const personalMonth = reduceNumber(personalYear + currentMonth, false);
  const currentDay = new Date().getDate();
  const personalDay = reduceNumber(personalMonth + currentDay, false);

  // Challenges
  const chal1 = Math.abs(reduceToSingleDigit(dob.day) - reduceToSingleDigit(dob.month));
  const chal2 = Math.abs(reduceToSingleDigit(dob.day) - reduceToSingleDigit(dob.year));
  const chal3 = Math.abs(chal1 - chal2);
  const chal4 = Math.abs(reduceToSingleDigit(dob.month) - reduceToSingleDigit(dob.year));
  const challenges = [chal1, chal2, chal3, chal4].map(n => reduceToSingleDigit(n));

  // Pinnacles
  const pin1 = reduceToSingleDigit(dob.month + dob.day);
  const pin2 = reduceToSingleDigit(dob.day + dob.year);
  const pin3 = reduceToSingleDigit(pin1 + pin2);
  const pin4 = reduceToSingleDigit(dob.month + dob.year);
  const pinnacles = [pin1, pin2, pin3, pin4];

  // 2. Lo Shu Grid calculations
  // Fixed grid mapping:
  // 4 9 2
  // 3 5 7
  // 8 1 6
  const loShuLayout = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  const loShuFrequencies: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) loShuFrequencies[i] = 0;
  dobDigits.split('').map(Number).forEach(digit => {
    if (digit >= 1 && digit <= 9) {
      loShuFrequencies[digit]++;
    }
  });

  const loShuGrid = loShuLayout.map(row =>
    row.map(val => {
      const freq = loShuFrequencies[val];
      return freq > 0 ? val.toString().repeat(freq) : '';
    })
  );

  const loShuRepeated = Object.keys(loShuFrequencies)
    .map(Number)
    .filter(k => loShuFrequencies[k] > 1);

  let maxFreq = 0;
  Object.values(loShuFrequencies).forEach(f => {
    if (f > maxFreq) maxFreq = f;
  });
  const loShuDominant = maxFreq > 0
    ? Object.keys(loShuFrequencies).map(Number).filter(k => loShuFrequencies[k] === maxFreq)
    : [];

  // Arrow calculations for Lo Shu Grid
  const checkLoShuArrowStatus = (nums: number[]): 'strength' | 'weakness' | 'none' => {
    const presentCount = nums.filter(n => loShuFrequencies[n] > 0).length;
    if (presentCount === 3) return 'strength';
    if (presentCount === 0) return 'weakness';
    return 'none';
  };

  const ARROWS_DEFINITIONS = [
    { name: 'Arrow of Intellect', numbers: [4, 9, 2], descStrength: 'Excellent mental ability, analytical prowess, and strategic mind.', descWeak: 'Struggles with concentration, memory, or overly analytical delays.' },
    { name: 'Arrow of Emotional Balance', numbers: [2, 5, 8], descStrength: 'Compassionate, emotionally balanced, stable in high stress.', descWeak: 'Hypersensitive, emotional volatility, difficulty expressing feelings.' },
    { name: 'Arrow of Practicality', numbers: [8, 1, 6], descStrength: 'Highly grounded, capable of hard physical work and manifestation.', descWeak: 'Impractical expectations, struggles to finish manual projects.' },
    { name: 'Arrow of Planning', numbers: [4, 3, 8], descStrength: 'Superb organizational skills, foresight, and detailed plans.', descWeak: 'Disorganized lifestyle, failure to prepare for future challenges.' },
    { name: 'Arrow of Will Power', numbers: [9, 5, 1], descStrength: 'Iron determination, persistence, refusal to accept defeat.', descWeak: 'Lack of self-discipline, easily discouraged by setbacks.' },
    { name: 'Arrow of Activity', numbers: [2, 7, 6], descStrength: 'Proactive, energetic, dynamic execution of ideas.', descWeak: 'Procrastination, physical laziness, low drive.' },
    { name: 'Arrow of Determination', numbers: [1, 5, 9], descStrength: 'Highly resilient, strong focused willpower to succeed.', descWeak: 'Indecision, easily swayed by opinions of others.' },
    { name: 'Arrow of Spirituality', numbers: [3, 5, 7], descStrength: 'Deep intuition, strong faith, interest in mystic sciences.', descWeak: 'Skepticism, spiritual void, lack of inner guidance.' },
  ];

  const loShuArrows = ARROWS_DEFINITIONS.map(def => {
    const type = checkLoShuArrowStatus(def.numbers);
    const status = type === 'strength' ? 'Active (Strength)' : type === 'weakness' ? 'Active (Weakness)' : 'Inactive';
    const meaning = type === 'strength' ? def.descStrength : type === 'weakness' ? def.descWeak : 'Balanced energy lines.';
    return {
      name: def.name,
      type,
      numbers: def.numbers,
      status,
      meaning,
    };
  });

  // Frustration Arrow: diagonal 4-5-6 empty
  const frustrationStatus = checkLoShuArrowStatus([4, 5, 6]);
  loShuArrows.push({
    name: 'Arrow of Frustration',
    type: frustrationStatus === 'weakness' ? 'weakness' : 'none',
    numbers: [4, 5, 6],
    status: frustrationStatus === 'weakness' ? 'Active (Frustration)' : 'Inactive',
    meaning: frustrationStatus === 'weakness' ? 'Prone to high expectations leading to disappointment, feel stuck in career.' : 'Emotional resilience and steady progression.',
  });

  // Add the duplicate Will Power and Determination mapping as requested to satisfy exact naming list
  const willpowerStatus = checkLoShuArrowStatus([9, 5, 1]);
  loShuArrows.push({
    name: 'Arrow of Will Power',
    type: willpowerStatus === 'strength' ? 'strength' : willpowerStatus === 'weakness' ? 'weakness' : 'none',
    numbers: [9, 5, 1],
    status: willpowerStatus === 'strength' ? 'Active (Strength)' : willpowerStatus === 'weakness' ? 'Active (Weakness)' : 'Inactive',
    meaning: willpowerStatus === 'strength' ? 'Extremely resolute, self-reliant, strong-willed.' : willpowerStatus === 'weakness' ? 'Struggles to complete projects, requires dynamic team support.' : 'Stable willpower reserves.',
  });

  // 3. Vedic Grid calculations
  // Layout:
  // 3 1 9
  // 6 7 5
  // 2 8 4
  const vedicLayout = [
    [3, 1, 9],
    [6, 7, 5],
    [2, 8, 4],
  ];

  const vedicFrequencies: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) vedicFrequencies[i] = 0;
  dobDigits.split('').map(Number).forEach(digit => {
    if (digit >= 1 && digit <= 9) {
      vedicFrequencies[digit]++;
    }
  });

  const vedicGrid = vedicLayout.map(row =>
    row.map(val => {
      const freq = vedicFrequencies[val];
      return freq > 0 ? val.toString().repeat(freq) : '';
    })
  );

  const planetKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const vedicStrongPlanets = planetKeys
    .filter(k => vedicFrequencies[parseInt(k, 10)] >= 1)
    .map(k => {
      const idx = parseInt(k, 10);
      switch(idx) {
        case 1: return 'Sun';
        case 2: return 'Moon';
        case 3: return 'Jupiter';
        case 4: return 'Rahu';
        case 5: return 'Mercury';
        case 6: return 'Venus';
        case 7: return 'Ketu';
        case 8: return 'Saturn';
        case 9: return 'Mars';
        default: return '';
      }
    });

  const vedicWeakPlanets = planetKeys
    .filter(k => vedicFrequencies[parseInt(k, 10)] === 0)
    .map(k => {
      const idx = parseInt(k, 10);
      switch(idx) {
        case 1: return 'Sun';
        case 2: return 'Moon';
        case 3: return 'Jupiter';
        case 4: return 'Rahu';
        case 5: return 'Mercury';
        case 6: return 'Venus';
        case 7: return 'Ketu';
        case 8: return 'Saturn';
        case 9: return 'Mars';
        default: return '';
      }
    });

  const vedicPlanetStrengthPct = Math.round((vedicStrongPlanets.length / 9) * 100);

  // Friendly/Enemy lists
  const luckyNumbers = [driverNum, conductorNum, ...(FRIENDLY_PLANETS[driverNum] || [])];
  const unluckyNumbers = ENEMY_PLANETS[driverNum] || [];

  // 4. Pythagorean Grid (Psychomatrix)
  // Working numbers calculation:
  // First Working: Sum of DOB digits
  // Second Working: Sum of First Working digits
  // Third Working: First Working - 2 * (First non-zero digit of Day)
  // Fourth Working: Sum of Third Working digits
  const dayStr = dob.day.toString();
  const firstNonZeroDayChar = dayStr.replace(/^0+/, '').charAt(0);
  const firstNonZeroDayDigit = firstNonZeroDayChar ? parseInt(firstNonZeroDayChar, 10) : 1;

  const firstWorking = dobDigits.split('').map(Number).reduce((s, v) => s + v, 0);
  const secondWorking = sumDigits(firstWorking);
  const thirdWorking = firstWorking - (2 * firstNonZeroDayDigit);
  const fourthWorking = sumDigits(thirdWorking);
  const workingNumbers = [firstWorking, secondWorking, thirdWorking, fourthWorking];

  // Grid list includes dob digits AND working numbers digits
  const pythagoreanDigits = dobDigits + workingNumbers.map(n => Math.abs(n).toString()).join('');
  const pythagoreanFrequencies: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) pythagoreanFrequencies[i] = 0;
  pythagoreanDigits.split('').map(Number).forEach(digit => {
    if (digit >= 1 && digit <= 9) {
      pythagoreanFrequencies[digit]++;
    }
  });

  // Pythagorean layout (1-4-7, 2-5-8, 3-6-9)
  const pythagoreanLayout = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ];

  const pythagoreanGrid = pythagoreanLayout.map(row =>
    row.map(val => {
      const freq = pythagoreanFrequencies[val];
      return freq > 0 ? val.toString().repeat(freq) : '';
    })
  );

  const getPythagoreanPlaneScore = (nums: number[]): number => {
    return nums.reduce((sum, val) => sum + pythagoreanFrequencies[val], 0);
  };

  const pythagoreanPlanes = [
    {
      name: 'Physical Plane (1-4-7)',
      score: getPythagoreanPlaneScore([1, 4, 7]),
      max: 9,
      status: getPythagoreanPlaneScore([1, 4, 7]) >= 3 ? 'Strong' : 'Average',
      description: 'Physical vitality, materialization, duty execution, and coordination.',
    },
    {
      name: 'Emotional Plane (2-5-8)',
      score: getPythagoreanPlaneScore([2, 5, 8]),
      max: 9,
      status: getPythagoreanPlaneScore([2, 5, 8]) >= 3 ? 'Strong' : 'Average',
      description: 'Social connections, family duties, intuition, stability under emotional stress.',
    },
    {
      name: 'Mental Plane (3-6-9)',
      score: getPythagoreanPlaneScore([3, 6, 9]),
      max: 9,
      status: getPythagoreanPlaneScore([3, 6, 9]) >= 3 ? 'Strong' : 'Average',
      description: 'Intellectual potential, memory power, analytical reasoning, and creative vision.',
    },
    {
      name: 'Spiritual Plane (Diagonal 3-5-7)',
      score: getPythagoreanPlaneScore([3, 5, 7]),
      max: 9,
      status: getPythagoreanPlaneScore([3, 5, 7]) >= 3 ? 'Active' : 'Average',
      description: 'Connection with divine wisdom, mystical arts, inner strength and empathy.',
    },
  ];

  // 5. Planet Analysis
  const planetsAnalysis = Object.keys(PLANET_INFO).map(name => {
    let numVal = 1;
    switch (name) {
      case 'Sun': numVal = 1; break;
      case 'Moon': numVal = 2; break;
      case 'Jupiter': numVal = 3; break;
      case 'Rahu': numVal = 4; break;
      case 'Mercury': numVal = 5; break;
      case 'Venus': numVal = 6; break;
      case 'Ketu': numVal = 7; break;
      case 'Saturn': numVal = 8; break;
      case 'Mars': numVal = 9; break;
    }
    const freq = loShuFrequencies[numVal] || 0;
    const strengthPct = freq === 0 ? 0 : freq === 1 ? 70 : freq === 2 ? 100 : 50; // Overactive reduces effectiveness
    return {
      name,
      details: PLANET_INFO[name],
      strengthPct,
    };
  });

  // 6. Name Numerology suggestions
  const generateLuckyVariations = (baseName: string) => {
    const finalVariations: string[] = [];
    const coreTargetNumbers = [1, 5, 6];
    
    // Simple mock variations: add a vowel at the end or repeat a last letter
    const parts = baseName.split(' ');
    if (parts.length > 0) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      
      const v1 = firstName + 'A' + (lastName ? ' ' + lastName : '');
      const v2 = firstName + firstName.slice(-1) + (lastName ? ' ' + lastName : '');
      const v3 = firstName + 'E' + (lastName ? ' ' + lastName : '');

      [v1, v2, v3].forEach(nameCandidate => {
        const sum = getStringValue(nameCandidate);
        const red = reduceNumber(sum, true);
        if (coreTargetNumbers.includes(reduceToSingleDigit(red))) {
          finalVariations.push(`${nameCandidate} (Vibrates to ${red})`);
        }
      });
    }
    return finalVariations.slice(0, 3);
  };

  const nameAnalysis = {
    expression,
    soulUrge,
    personality: namePersonality,
    nameNumber: reduceToSingleDigit(expression),
    compoundNumber: totalNameSum,
    luckyAlphabets: ['A', 'E', 'I', 'O', 'U'].filter((_, idx) => (driverNum + idx) % 2 === 0),
    missingAlphabets: Array.from(karmicLessons).map(n => {
      // Find one representative letter
      const entry = Object.entries(PYTHAGOREAN_MAP).find(([_, val]) => val === n);
      return entry ? entry[0] : '';
    }).filter(Boolean),
    suggestedSpellings: generateLuckyVariations(nameParts.join(' ')),
  };

  // 7. Mobile Analysis
  let mobileVal = 0;
  let planetInfluence = 'Neutral';
  let luckyPercentage = 50;
  let positiveEnergyPct = 50;
  let negativeEnergyPct = 50;

  if (mobileToCheck) {
    const digits = mobileToCheck.replace(/\D/g, '').split('').map(Number);
    const sum = digits.reduce((s, v) => s + v, 0);
    mobileVal = reduceNumber(sum, false);

    const matchPlanet = Object.keys(PLANET_INFO).find(name => {
      let numVal = 1;
      switch (name) {
        case 'Sun': numVal = 1; break;
        case 'Moon': numVal = 2; break;
        case 'Jupiter': numVal = 3; break;
        case 'Rahu': numVal = 4; break;
        case 'Mercury': numVal = 5; break;
        case 'Venus': numVal = 6; break;
        case 'Ketu': numVal = 7; break;
        case 'Saturn': numVal = 8; break;
        case 'Mars': numVal = 9; break;
      }
      return numVal === mobileVal;
    });
    planetInfluence = matchPlanet ? PLANET_INFO[matchPlanet].ruler : 'Unknown Planet';

    const isFriendly = FRIENDLY_PLANETS[driverNum]?.includes(mobileVal) || mobileVal === driverNum;
    const isEnemy = ENEMY_PLANETS[driverNum]?.includes(mobileVal);
    luckyPercentage = isFriendly ? 90 : isEnemy ? 30 : 65;

    // Energy analysis based on digits
    const positives = digits.filter(d => [1, 5, 6, 9].includes(d)).length;
    const negatives = digits.filter(d => [4, 8].includes(d)).length;
    const totalE = positives + negatives || 1;
    positiveEnergyPct = Math.round((positives / totalE) * 100);
    negativeEnergyPct = Math.round((negatives / totalE) * 100);
  }

  const mobileAnalysis = {
    value: mobileVal,
    planetInfluence,
    luckyPercentage,
    positiveEnergyPct,
    negativeEnergyPct,
  };

  // 8. Vehicle Number
  let vehicleVal = 0;
  let vehicleVibration = 'Balanced';
  let vehicleLuckyScore = 65;
  let vehicleComp = 'Neutral Compatibility';

  if (vehicleNo) {
    const lettersAndDigits = vehicleNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let sum = 0;
    lettersAndDigits.split('').forEach(char => {
      if (/[0-9]/.test(char)) {
        sum += parseInt(char, 10);
      } else {
        sum += PYTHAGOREAN_MAP[char] || 0;
      }
    });
    vehicleVal = reduceToSingleDigit(sum);
    
    const isFriendly = FRIENDLY_PLANETS[driverNum]?.includes(vehicleVal) || vehicleVal === driverNum;
    vehicleLuckyScore = isFriendly ? 85 : ENEMY_PLANETS[driverNum]?.includes(vehicleVal) ? 40 : 65;
    vehicleVibration = vehicleVal === 1 ? 'Confidence/Speed' : vehicleVal === 3 ? 'Wisdom/Safety' : vehicleVal === 6 ? 'Luxury/Comfort' : vehicleVal === 8 ? 'Struggle/Delays' : 'Stable journey';
    vehicleComp = isFriendly ? 'Highly Compatible' : 'Incompatible (Remedies Suggested)';
  }

  const vehicleAnalysis = {
    value: vehicleVal,
    vibration: vehicleVibration,
    luckyScore: vehicleLuckyScore,
    compatibility: vehicleComp,
  };

  // 9. House Number
  let houseVal = 0;
  let houseVibration = 'Warm';
  let housePlanet = 'Mercury';
  let houseLuckyScore = 65;

  if (houseNo) {
    const cleaned = houseNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let sum = 0;
    cleaned.split('').forEach(char => {
      if (/[0-9]/.test(char)) {
        sum += parseInt(char, 10);
      } else {
        sum += PYTHAGOREAN_MAP[char] || 0;
      }
    });
    houseVal = reduceToSingleDigit(sum);

    const matchPlanet = Object.keys(PLANET_INFO).find(name => {
      let numVal = 1;
      switch (name) {
        case 'Sun': numVal = 1; break;
        case 'Moon': numVal = 2; break;
        case 'Jupiter': numVal = 3; break;
        case 'Rahu': numVal = 4; break;
        case 'Mercury': numVal = 5; break;
        case 'Venus': numVal = 6; break;
        case 'Ketu': numVal = 7; break;
        case 'Saturn': numVal = 8; break;
        case 'Mars': numVal = 9; break;
      }
      return numVal === houseVal;
    });
    housePlanet = matchPlanet || 'Unknown';
    houseVibration = houseVal === 1 ? 'Independence & Self-reliance' : houseVal === 2 ? 'Warm, cooperative home' : houseVal === 3 ? 'Creative, social atmosphere' : houseVal === 4 ? 'Hard work and structure' : houseVal === 5 ? 'Dynamic, full of travel' : houseVal === 6 ? 'Luxury and family love' : houseVal === 7 ? 'Spiritual ashram vibe' : houseVal === 8 ? 'Material gains & business focus' : 'Spiritual completion & service';
    houseLuckyScore = FRIENDLY_PLANETS[driverNum]?.includes(houseVal) ? 90 : 50;
  }

  const houseAnalysis = {
    value: houseVal,
    vibration: houseVibration,
    planet: housePlanet,
    luckyScore: houseLuckyScore,
  };

  // 10. Suggestions & Remedies
  const luckySuggestions = {
    colors: driverNum === 1 ? ['Red', 'Orange', 'Yellow'] : driverNum === 2 ? ['White', 'Cream', 'Silver'] : driverNum === 3 ? ['Yellow', 'Saffron'] : driverNum === 4 ? ['Grey', 'Blue'] : driverNum === 5 ? ['Green'] : driverNum === 6 ? ['Pink', 'Cream'] : driverNum === 7 ? ['Smoke Grey', 'Multi-color'] : driverNum === 8 ? ['Blue', 'Purple'] : ['Red', 'Coral'],
    gemstones: driverNum === 1 ? ['Ruby'] : driverNum === 2 ? ['Pearl'] : driverNum === 3 ? ['Yellow Sapphire'] : driverNum === 4 ? ['Gomed / Hessonite'] : driverNum === 5 ? ['Emerald'] : driverNum === 6 ? ['Diamond / Opal'] : driverNum === 7 ? ['Cats Eye'] : driverNum === 8 ? ['Blue Sapphire'] : ['Red Coral'],
    rudraksha: driverNum === 1 ? ['1 Mukhi'] : driverNum === 2 ? ['2 Mukhi'] : driverNum === 3 ? ['5 Mukhi'] : driverNum === 4 ? ['8 Mukhi'] : driverNum === 5 ? ['4 Mukhi'] : driverNum === 6 ? ['6 Mukhi'] : driverNum === 7 ? ['9 Mukhi'] : driverNum === 8 ? ['7 Mukhi'] : ['3 Mukhi'],
    directions: driverNum === 1 || driverNum === 9 ? ['East', 'South'] : driverNum === 2 || driverNum === 7 ? ['North', 'West'] : ['Northeast', 'Southeast'],
    dates: luckyNumbers.slice(0, 3),
    numbers: luckyNumbers,
    careers: driverNum === 1 || driverNum === 9 ? ['Administration', 'Military', 'Leadership', 'Business owner'] : driverNum === 3 || driverNum === 7 ? ['Teaching', 'Astrology', 'Philosophy', 'Research'] : driverNum === 5 || driverNum === 6 ? ['Sales', 'Entertainment', 'IT', 'Design'] : ['Infrastructure', 'Judiciary', 'Finance'],
  };

  const remedies = {
    mantras: driverNum === 1 ? ['Om Suryaya Namaha'] : driverNum === 2 ? ['Om Som Somaya Namaha'] : driverNum === 3 ? ['Om Gram Greem Groum Sah Gurave Namaha'] : driverNum === 4 ? ['Om Raam Rahave Namaha'] : driverNum === 5 ? ['Om Bum Budhaya Namaha'] : driverNum === 6 ? ['Om Shum Shukraya Namaha'] : driverNum === 7 ? ['Om Kem Ketave Namaha'] : driverNum === 8 ? ['Om Sham Shanaishcharaya Namaha'] : ['Om Kram Kreem Kroum Sah Bhaumaya Namaha'],
    donations: driverNum === 1 ? ['Donate wheat, copper on Sunday'] : driverNum === 2 ? ['Donate milk, rice on Monday'] : driverNum === 3 ? ['Donate chana dal, yellow cloth on Thursday'] : driverNum === 4 ? ['Donate black sesame seeds on Saturday'] : driverNum === 5 ? ['Donate green moong dal on Wednesday'] : driverNum === 6 ? ['Donate sugar, white cloth on Friday'] : driverNum === 7 ? ['Donate multi-colored blanket on Saturday'] : driverNum === 8 ? ['Donate mustard oil, iron pan on Saturday'] : ['Donate masoor dal, copper on Tuesday'],
    habits: ['Maintain punctuality daily.', 'Be respectful to elders and your subordinates.', 'Keep a glass of water on your bedside table overnight and feed it to plants in the morning.'],
    meditation: 'Meditate for 15 minutes in the morning facing East, visualizing a golden white light surrounding you.',
    colors: luckySuggestions.colors,
    days: [driverNum === 1 ? 'Sunday' : driverNum === 2 ? 'Monday' : driverNum === 3 ? 'Thursday' : driverNum === 5 ? 'Wednesday' : driverNum === 6 ? 'Friday' : driverNum === 8 || driverNum === 4 ? 'Saturday' : 'Tuesday'],
    lifestyle: ['Refrain from using black/dark colors in your master bedroom.', 'Develop a habit of writing down your goals in green ink.', 'Avoid lending money on Saturdays.'],
  };

  // 11. AI Report Generator (dynamic and professional)
  const lpDesc = CORE_NUMBERS_INFO[lifePath] || { name: 'Unknown', meaning: 'Universal vibration.', strength: 'Adaptability.' };
  const destDesc = CORE_NUMBERS_INFO[destiny] || { name: 'Unknown', meaning: 'Destiny path.', strength: 'Action.' };
  const exprDesc = CORE_NUMBERS_INFO[expression] || { name: 'Unknown', meaning: 'Expression path.', strength: 'Communication.' };

  const aiReport = `### Divya Urja Professional Numerology Audit

Dear ${name}, 

Based on your birth signature profile calculated for the Date of Birth **${dobStr}**, you possess a highly unique vibrational design led by **Psychic/Personality/Driver Number ${personality}** and **Destiny/Conductor Number ${destiny}**.

#### Part 1: Core Vibrational Architecture
Your **Life Path Number is ${lifePath}** (${lpDesc.name}). This governs your primary lesson and path of evolution in this incarnation. ${lpDesc.meaning} In daily life, this manifests as: *${lpDesc.strength}*

Your **Destiny Number is ${destiny}** (${destDesc.name}). This represents your overall path, goals, and opportunities, while your **Expression Number is ${expression}** (${exprDesc.name}) calculated from the letters of your full name. ${exprDesc.meaning}

The emotional blueprint of your soul is guided by **Soul Urge Number ${soulUrge}** and **Name Personality Number ${namePersonality}**, showing a beautiful synergy between what you desire internally versus what you project externally to others.

#### Part 2: Grid Interpretations
- **Lo Shu Grid**: Mapping your DOB digits reveals a strong presence in the **${loShuArrows.filter(a => a.type === 'strength').map(a => a.name).join(', ') || 'basic'} planes**. The dominant energy is focused around the number ${loShuDominant.join(', ')}. Your grid is missing the number ${missingNumbers.join(', ')}, which indicates that you need to consciously build qualities like ${missingNumbers.map(n => n === 8 ? 'Discipline' : n === 5 ? 'Stability/Communication' : n === 6 ? 'Family Responsibility' : 'Foresight').join(', ')} using our custom Vastu and habit remedies.
- **Vedic Grid Planetary Strength**: Your overall planetary charge is **${vedicPlanetStrengthPct}%**. The strong planetary entities are **${vedicStrongPlanets.join(', ')}**, bringing you luck, expansion, and sharp communication. The planetary nodes **${vedicWeakPlanets.join(', ')}** are currently dormant, meaning you must perform daily donations to strengthen their positions.
- **Pythagorean Psychomatrix**: Your working numbers are **${workingNumbers.join(', ')}**. The physical, emotional, and mental planes represent a balanced structure, reflecting high resilience.

#### Part 3: Secondary Calculators & Suggestions
- **Name Vibration**: Your current name spelling vibrates to the compound value **${totalNameSum}** which reduces to **${nameAnalysis.nameNumber}**. This shows a ${nameAnalysis.nameNumber === conductorNum || FRIENDLY_PLANETS[driverNum].includes(nameAnalysis.nameNumber) ? 'highly harmonious' : 'neutral'} alignment with your core path. ${nameAnalysis.suggestedSpellings.length > 0 ? `We suggest using the spelling: **${nameAnalysis.suggestedSpellings[0].split(' (')[0]}** to further align your name vibration.` : ''}
- **Remedial Path**: Practice chanting the mantra **"${remedies.mantras[0]}"** 108 times daily. Wear colors like **${remedies.colors.join(', ')}** to boost your luck percentage and maintain the daily habit: *"${remedies.habits[0]}"*

This report offers a spiritual blueprint. Use these insights and remedies to navigate your Personal Year (${personalYear}) with strength, clarity, and peace.`;

  return {
    name,
    dob: dobStr,
    gender,
    mobile,
    email,
    lifePath,
    destiny,
    expression,
    soulUrge,
    personality,
    birthdayNum,
    maturityNum,
    attitudeNum,
    balanceNum,
    bridgeNum,
    hiddenPassion,
    subconsciousSelf,
    karmicDebts,
    karmicLessons,
    missingNumbers,
    personalYear,
    personalMonth,
    personalDay,
    challenges,
    pinnacles,
    loShuGrid,
    loShuFrequencies,
    loShuRepeated,
    loShuDominant,
    loShuArrows,
    vedicGrid,
    vedicFrequencies,
    vedicStrongPlanets,
    vedicWeakPlanets,
    vedicPlanetStrengthPct,
    driverNum,
    conductorNum,
    luckyNumbers,
    unluckyNumbers,
    pythagoreanGrid,
    pythagoreanFrequencies,
    workingNumbers,
    pythagoreanPlanes,
    planetsAnalysis,
    nameAnalysis,
    mobileAnalysis,
    vehicleAnalysis,
    houseAnalysis,
    luckySuggestions,
    remedies,
    aiReport,
  };
}

// Marriage/Friendship/Love/Business Compatibility Calculation
export interface CompatibilityResult {
  marriagePct: number;
  lovePct: number;
  friendshipPct: number;
  businessPct: number;
  overallPct: number;
  explanation: string;
}

export function calculateCompatibility(
  driver1: number,
  conductor1: number,
  driver2: number,
  conductor2: number
): CompatibilityResult {
  const d1 = reduceToSingleDigit(driver1);
  const c1 = reduceToSingleDigit(conductor1);
  const d2 = reduceToSingleDigit(driver2);
  const c2 = reduceToSingleDigit(conductor2);

  // Friendly factor (0 to 10)
  const getFriendshipFactor = (n1: number, n2: number): number => {
    if (n1 === n2) return 10;
    if (FRIENDLY_PLANETS[n1]?.includes(n2)) return 9;
    if (ENEMY_PLANETS[n1]?.includes(n2)) return 3;
    return 6; // Neutral
  };

  const f1 = getFriendshipFactor(d1, d2);
  const f2 = getFriendshipFactor(c1, c2);
  const f3 = getFriendshipFactor(d1, c2);
  const f4 = getFriendshipFactor(c1, d2);

  const averageFactor = (f1 + f2 + f3 + f4) / 4; // Max 10

  const marriagePct = Math.round(averageFactor * 10 - 2 + (d1 % 2 === d2 % 2 ? 4 : 0));
  const lovePct = Math.round(averageFactor * 10 + (Math.abs(d1 - d2) <= 2 ? 5 : -3));
  const friendshipPct = Math.round(averageFactor * 10 + 2);
  const businessPct = Math.round(averageFactor * 10 - (d1 === 8 || d2 === 8 ? 5 : 0));

  const overallPct = Math.round((marriagePct + lovePct + friendshipPct + businessPct) / 4);

  let explanation = '';
  if (overallPct >= 80) {
    explanation = 'Excellent match! The planetary rulers are highly friendly, suggesting deep emotional understanding, mutual respect, and long-term harmony. Business and domestic unions will flourish naturally.';
  } else if (overallPct >= 60) {
    explanation = 'Good compatible match. While some minor differences in temperaments exist due to planetary rulers, cooperation and open communication will easily resolve them. Highly suitable for business partnership and friendship.';
  } else {
    explanation = 'Average compatibility. Some core friction exists due to conflicting planetary configurations (e.g. Sun vs Saturn or Moon vs Rahu). Remedies like sharing suitable gemstones or matching name spelling vibrations are strongly suggested to mitigate friction.';
  }

  return {
    marriagePct: Math.min(100, Math.max(10, marriagePct)),
    lovePct: Math.min(100, Math.max(10, lovePct)),
    friendshipPct: Math.min(100, Math.max(10, friendshipPct)),
    businessPct: Math.min(100, Math.max(10, businessPct)),
    overallPct: Math.min(100, Math.max(10, overallPct)),
    explanation,
  };
}
