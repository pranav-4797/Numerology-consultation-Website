import { ARROWS_DEFINITIONS } from './config';

export interface DetectedArrow {
  name: string;
  numbers: number[];
  status: string;
  meaning: string;
  type: 'strength' | 'weakness' | 'none';
}

export function calculateMissingNumbers(dobDigits: string): number[] {
  const digitsSet = new Set(dobDigits.split('').map(Number));
  const missing: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!digitsSet.has(i)) {
      missing.push(i);
    }
  }
  return missing;
}

export function calculateRepeatedNumbers(frequencies: Record<number, number>): number[] {
  return Object.keys(frequencies)
    .map(Number)
    .filter(k => frequencies[k] > 1);
}

export function detectArrows(frequencies: Record<number, number>): DetectedArrow[] {
  const checkArrowStatus = (nums: number[]): 'strength' | 'weakness' | 'none' => {
    const presentCount = nums.filter(n => (frequencies[n] || 0) > 0).length;
    if (presentCount === 3) return 'strength';
    if (presentCount === 0) return 'weakness';
    return 'none';
  };

  const detected: DetectedArrow[] = ARROWS_DEFINITIONS.map(def => {
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

  // Diagonal 4-5-6 empty (Frustration Arrow)
  const frustrationStatus = checkArrowStatus([4, 5, 6]);
  detected.push({
    name: 'Arrow of Frustration',
    type: frustrationStatus === 'weakness' ? 'weakness' : 'none',
    numbers: [4, 5, 6],
    status: frustrationStatus === 'weakness' ? 'Active (Frustration)' : 'Inactive',
    meaning: frustrationStatus === 'weakness' ? 'Prone to high expectations leading to disappointment, feel stuck in career.' : 'Emotional resilience and steady progression.',
  });

  return detected;
}
