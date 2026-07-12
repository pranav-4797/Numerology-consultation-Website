export interface DOB {
  day: number;
  month: number;
  year: number;
}

export interface PlanetDetail {
  ruler: string;
  strength: string;
  weakness: string;
  influence: string;
  remedies: string;
  color: string;
  day: string;
}

export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export const MASTER_NUMBERS = [11, 22, 33];

export const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

export const VEDIC_LAYOUT = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4]
];

export const PYTHAGOREAN_LAYOUT = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7]
];

export const FRIENDLY_PLANETS: Record<number, number[]> = {
  1: [2, 3, 9],
  2: [1, 5],
  3: [9, 2, 1],
  4: [6, 8],
  5: [1, 6],
  6: [4, 5, 7, 8],
  7: [6, 9],
  8: [4, 5, 6],
  9: [1, 3, 7]
};

export const ENEMY_PLANETS: Record<number, number[]> = {
  1: [4, 6, 7, 8],
  2: [],
  3: [5, 6],
  4: [9, 2, 1],
  5: [2],
  6: [1, 2],
  7: [1, 2, 4, 8],
  8: [1, 2, 7, 9],
  9: [4, 5]
};

export const NEUTRAL_PLANETS: Record<number, number[]> = {
  1: [1, 5],
  2: [2, 3, 4, 6, 7, 8, 9],
  3: [3, 4, 7, 8],
  4: [3, 4, 5, 7],
  5: [5, 4, 3, 7, 8, 9],
  6: [9, 3, 6],
  7: [3, 5, 7],
  8: [3, 8],
  9: [2, 6, 8, 9]
};

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

export const ARROWS_DEFINITIONS = [
  {
    name: 'Arrow of Intellect',
    numbers: [4, 9, 2],
    descStrength: 'Excellent mental ability, analytical prowess, and strategic mind.',
    descWeak: 'Struggles with concentration, memory, or overly analytical delays.'
  },
  {
    name: 'Arrow of Emotional Balance',
    numbers: [2, 5, 8],
    descStrength: 'Compassionate, emotionally balanced, stable in high stress.',
    descWeak: 'Hypersensitive, emotional volatility, difficulty expressing feelings.'
  },
  {
    name: 'Arrow of Practicality',
    numbers: [8, 1, 6],
    descStrength: 'Highly grounded, capable of hard physical work and manifestation.',
    descWeak: 'Impractical expectations, struggles to finish manual projects.'
  },
  {
    name: 'Arrow of Planning',
    numbers: [4, 3, 8],
    descStrength: 'Superb organizational skills, foresight, and detailed plans.',
    descWeak: 'Disorganized lifestyle, failure to prepare for future challenges.'
  },
  {
    name: 'Arrow of Will Power',
    numbers: [9, 5, 1],
    descStrength: 'Iron determination, persistence, refusal to accept defeat.',
    descWeak: 'Lack of self-discipline, easily discouraged by setbacks.'
  },
  {
    name: 'Arrow of Activity',
    numbers: [2, 7, 6],
    descStrength: 'Proactive, energetic, dynamic execution of ideas.',
    descWeak: 'Procrastination, physical laziness, low drive.'
  },
  {
    name: 'Arrow of Determination',
    numbers: [1, 5, 9],
    descStrength: 'Highly resilient, strong focused willpower to succeed.',
    descWeak: 'Indecision, easily swayed by opinions of others.'
  },
  {
    name: 'Arrow of Spirituality',
    numbers: [3, 5, 7],
    descStrength: 'Deep intuition, strong faith, interest in mystic sciences.',
    descWeak: 'Skepticism, spiritual void, lack of inner guidance.'
  }
];

export const PYTHAGOREAN_PLANES = [
  {
    name: 'Mental Plane (3-6-9)',
    scoreNumbers: [3, 6, 9],
    description: 'Intellectual potential, memory power, analytical reasoning, and creative vision.',
  },
  {
    name: 'Emotional Plane (2-5-8)',
    scoreNumbers: [2, 5, 8],
    description: 'Social connections, family duties, intuition, stability under emotional stress.',
  },
  {
    name: 'Physical Plane (1-4-7)',
    scoreNumbers: [1, 4, 7],
    description: 'Physical vitality, materialization, duty execution, and coordination.',
  },
  {
    name: 'Spiritual Plane (Diagonal 3-5-7)',
    scoreNumbers: [3, 5, 7],
    description: 'Connection with divine wisdom, mystical arts, inner strength and empathy.',
  },
];

// Calculation Configurations
export const numerologyConfig = {
  alphabetMap: CHALDEAN_MAP,
  vowels: VOWELS,
  masterNumbers: MASTER_NUMBERS,
  preserveMasterNumbers: true,
  reduceIndividualLifePath: false, // true = reduce components first, false = sum all dob digits
};
