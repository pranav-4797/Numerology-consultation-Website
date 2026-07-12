export interface PlanetDetail {
  ruler: string;
  strength: string;
  weakness: string;
  influence: string;
  remedies: string;
  color: string;
  day: string;
}

export const PLANET_INFO: Record<string, PlanetDetail> = {
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

export interface NumerologyReport {
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
  loShuGrid: (string | null)[][];
  loShuFrequencies: Record<number, number>;
  loShuRepeated: number[];
  loShuDominant: number[];
  loShuArrows: {
    name: string;
    type: 'strength' | 'weakness' | 'none';
    numbers: number[];
    status: string;
    meaning: string;
  }[];

  // Vedic Grid
  vedicGrid: (string | null)[][];
  vedicFrequencies: Record<number, number>;
  vedicStrongPlanets: string[];
  vedicWeakPlanets: string[];
  vedicPlanetStrengthPct: number;
  driverNum: number;
  conductorNum: number;
  luckyNumbers: number[];
  unluckyNumbers: number[];

  // Pythagorean Grid
  pythagoreanGrid: (string | null)[][];
  pythagoreanFrequencies: Record<number, number>;
  workingNumbers: number[];
  pythagoreanPlanes: {
    name: string;
    score: number;
    max: number;
    status: string;
    description: string;
  }[];

  // Planets
  planetsAnalysis: {
    name: string;
    details: PlanetDetail;
    strengthPct: number;
  }[];

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

export interface CompatibilityResult {
  marriagePct: number;
  lovePct: number;
  friendshipPct: number;
  businessPct: number;
  overallPct: number;
  explanation: string;
}
