import { numerologyConfig } from './config';
import { getNameLetterValues } from './nameNumber';
import { reduceNumber } from './birthNumber';

// Name Personality Number (sum of consonants in name)
export function calculatePersonality(cleanName: string): number {
  const values = getNameLetterValues(cleanName);
  const sum = values
    .filter(item => !numerologyConfig.vowels.has(item.letter))
    .reduce((acc, curr) => acc + curr.val, 0);
  return reduceNumber(sum, true);
}
