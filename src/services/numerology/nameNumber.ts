import { numerologyConfig } from './config';
import { reduceNumber } from './birthNumber';

// Get letters and their numeric value breakdown based on configured alphabet map
export function getNameLetterValues(cleanName: string): { letter: string; val: number }[] {
  return cleanName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map(letter => ({
      letter,
      val: numerologyConfig.alphabetMap[letter] || 0
    }));
}

// Calculate the name total reduced value
export function calculateNameNumber(cleanName: string): number {
  const values = getNameLetterValues(cleanName);
  const sum = values.reduce((acc, curr) => acc + curr.val, 0);
  return reduceNumber(sum, true);
}
