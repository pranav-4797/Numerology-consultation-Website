import { DOB, PYTHAGOREAN_LAYOUT, PYTHAGOREAN_PLANES } from './config';

export interface PythagoreanResult {
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
}

export function sumDigits(num: number): number {
  return Math.abs(num)
    .toString()
    .split('')
    .map(Number)
    .filter(n => !isNaN(n))
    .reduce((sum, d) => sum + d, 0);
}

export function calculatePythagoreanGrid(dob: DOB, dobDigits: string): PythagoreanResult {
  // Working numbers calculation:
  // First Working: Sum of DOB digits
  const firstWorking = dobDigits.split('').map(Number).reduce((s, v) => s + v, 0);
  
  // Second Working: Sum of First Working digits
  const secondWorking = sumDigits(firstWorking);
  
  // Third Working: First Working - 2 * (First non-zero digit of Day)
  const dayStr = dob.day.toString();
  const firstNonZeroDayChar = dayStr.replace(/^0+/, '').charAt(0);
  const firstNonZeroDayDigit = firstNonZeroDayChar ? parseInt(firstNonZeroDayChar, 10) : 1;
  const thirdWorking = firstWorking - (2 * firstNonZeroDayDigit);
  
  // Fourth Working: Sum of Third Working digits
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

  const pythagoreanGrid = PYTHAGOREAN_LAYOUT.map(row =>
    row.map(val => {
      const freq = pythagoreanFrequencies[val];
      return freq > 0 ? val.toString().repeat(freq) : '';
    })
  );

  const getPlaneScore = (nums: number[]): number => {
    return nums.reduce((sum, val) => sum + pythagoreanFrequencies[val], 0);
  };

  const pythagoreanPlanes = PYTHAGOREAN_PLANES.map(plane => {
    const score = getPlaneScore(plane.scoreNumbers);
    return {
      name: plane.name,
      score,
      max: 9,
      status: score >= 3 ? 'Strong' : 'Average',
      description: plane.description,
    };
  });

  return {
    pythagoreanGrid,
    pythagoreanFrequencies,
    workingNumbers,
    pythagoreanPlanes,
  };
}
