export interface LoShuArrow {
  name: string;
  type: 'strength' | 'weakness' | 'none';
  numbers: number[];
  status: string;
  meaning: string;
}

export interface LoShuResult {
  loShuGrid: (string | null)[][];
  loShuFrequencies: Record<number, number>;
  loShuRepeated: number[];
  loShuDominant: number[];
  loShuArrows: LoShuArrow[];
}

export const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

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

export function calculateLoShuGrid(dobDigits: string): LoShuResult {
  const loShuFrequencies: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) loShuFrequencies[i] = 0;

  dobDigits.split('').map(Number).forEach(digit => {
    if (digit >= 1 && digit <= 9) {
      loShuFrequencies[digit]++;
    }
  });

  const loShuGrid = LO_SHU_LAYOUT.map(row =>
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

  const checkArrowStatus = (nums: number[]): 'strength' | 'weakness' | 'none' => {
    const presentCount = nums.filter(n => loShuFrequencies[n] > 0).length;
    if (presentCount === 3) return 'strength';
    if (presentCount === 0) return 'weakness';
    return 'none';
  };

  const loShuArrows: LoShuArrow[] = ARROWS_DEFINITIONS.map(def => {
    const type = checkArrowStatus(def.numbers);
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
  const frustrationStatus = checkArrowStatus([4, 5, 6]);
  loShuArrows.push({
    name: 'Arrow of Frustration',
    type: frustrationStatus === 'weakness' ? 'weakness' : 'none',
    numbers: [4, 5, 6],
    status: frustrationStatus === 'weakness' ? 'Active (Frustration)' : 'Inactive',
    meaning: frustrationStatus === 'weakness' ? 'Prone to high expectations leading to disappointment, feel stuck in career.' : 'Emotional resilience and steady progression.',
  });

  // Add the duplicate Will Power and Determination mapping as requested to satisfy exact naming list
  const willpowerStatus = checkArrowStatus([9, 5, 1]);
  loShuArrows.push({
    name: 'Arrow of Will Power',
    type: willpowerStatus === 'strength' ? 'strength' : willpowerStatus === 'weakness' ? 'weakness' : 'none',
    numbers: [9, 5, 1],
    status: willpowerStatus === 'strength' ? 'Active (Strength)' : willpowerStatus === 'weakness' ? 'Active (Weakness)' : 'Inactive',
    meaning: willpowerStatus === 'strength' ? 'Extremely resolute, self-reliant, strong-willed.' : willpowerStatus === 'weakness' ? 'Struggles to complete projects, requires dynamic team support.' : 'Stable willpower reserves.',
  });

  return {
    loShuGrid,
    loShuFrequencies,
    loShuRepeated,
    loShuDominant,
    loShuArrows
  };
}
