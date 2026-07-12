export interface DOB {
  day: number;
  month: number;
  year: number;
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

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// Parse standard date string YYYY-MM-DD or DD-MM-YYYY
export function parseDOB(dobStr: string): DOB {
  if (!dobStr) return { day: 1, month: 1, year: 2000 };
  
  // Try YYYY-MM-DD first
  let parts = dobStr.split('-');
  if (parts.length !== 3) {
    parts = dobStr.split('/');
  }
  
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return {
        year: parseInt(parts[0], 10) || 2000,
        month: parseInt(parts[1], 10) || 1,
        day: parseInt(parts[2], 10) || 1,
      };
    } else {
      // DD-MM-YYYY
      return {
        day: parseInt(parts[0], 10) || 1,
        month: parseInt(parts[1], 10) || 1,
        year: parseInt(parts[2], 10) || 2000,
      };
    }
  }
  return { day: 1, month: 1, year: 2000 };
}

// Reduce any number to a single digit (1-9)
export function reduceToSingleDigit(num: number): number {
  if (num === 0) return 0;
  let temp = Math.abs(num);
  while (temp > 9) {
    let sum = 0;
    while (temp > 0) {
      sum += temp % 10;
      temp = Math.floor(temp / 10);
    }
    temp = sum;
  }
  return temp;
}

// Reduce any number, preserving Master Numbers (11, 22, 33) if configured
export function reduceNumber(num: number, preserveMaster: boolean = true): number {
  let temp = Math.abs(num);
  if (temp === 0) return 0;
  
  while (temp > 9) {
    if (preserveMaster && [11, 22, 33].includes(temp)) {
      return temp;
    }
    let sum = 0;
    const str = temp.toString();
    for (let i = 0; i < str.length; i++) {
      sum += parseInt(str[i], 10);
    }
    temp = sum;
  }
  return temp;
}

// Get name letters as a breakdown array of values
export function getNameLetterValues(cleanName: string): { letter: string; val: number }[] {
  return cleanName
    .replace(/[^A-Z]/g, '')
    .split('')
    .map(letter => ({
      letter,
      val: PYTHAGOREAN_MAP[letter] || 0
    }));
}

// Check if a compound number triggers a Karmic Debt (13, 14, 16, 19)
export function checkKarmicDebt(sum: number): boolean {
  return [13, 14, 16, 19].includes(sum);
}

// 1. Life Path Number (DOB individual reduced or total sum based on config)
export function calculateLifePath(dob: DOB, reduceIndividual: boolean = false): number {
  if (reduceIndividual) {
    const m = reduceNumber(dob.month, true);
    const d = reduceNumber(dob.day, true);
    const y = reduceNumber(dob.year, true);
    return reduceNumber(m + d + y, true);
  } else {
    // Total sum of all digits in DOB
    const digitsStr = `${dob.day}${dob.month}${dob.year}`.replace(/\D/g, '');
    const sum = digitsStr.split('').reduce((s, d) => s + parseInt(d, 10), 0);
    return reduceNumber(sum, true);
  }
}

// 2. Birthday Number
export function calculateBirthdayNum(day: number): number {
  return reduceNumber(day, true);
}

// 3. Destiny / Expression Number (Full Name letters sum)
export function calculateExpression(cleanName: string): number {
  const letters = getNameLetterValues(cleanName);
  const sum = letters.reduce((s, l) => s + l.val, 0);
  return reduceNumber(sum, true);
}

// 4. Soul Urge Number (vowels only)
export function calculateSoulUrge(cleanName: string): number {
  const letters = getNameLetterValues(cleanName);
  const sum = letters
    .filter(l => VOWELS.has(l.letter))
    .reduce((s, l) => s + l.val, 0);
  return reduceNumber(sum, true);
}

// 5. Name Personality Number (consonants only)
export function calculateNamePersonality(cleanName: string): number {
  const letters = getNameLetterValues(cleanName);
  const sum = letters
    .filter(l => !VOWELS.has(l.letter))
    .reduce((s, l) => s + l.val, 0);
  return reduceNumber(sum, true);
}

// 6. Attitude Number
export function calculateAttitudeNum(day: number, month: number): number {
  return reduceNumber(day + month, false);
}

// 7. Maturity Number (Life Path + Name Expression)
export function calculateMaturityNum(lifePath: number, expression: number): number {
  return reduceNumber(lifePath + expression, false);
}

// 8. Balance Number (first letters of name parts)
export function calculateBalanceNum(cleanName: string): number {
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initialsSum = parts.reduce((s, part) => {
    const firstChar = part.charAt(0);
    return s + (PYTHAGOREAN_MAP[firstChar] || 0);
  }, 0);
  return reduceNumber(initialsSum, false);
}

// 9. Hidden Passion Number
export function calculateHiddenPassion(cleanName: string): number {
  const letters = getNameLetterValues(cleanName);
  const counts: Record<number, number> = {};
  letters.forEach(l => {
    counts[l.val] = (counts[l.val] || 0) + 1;
  });
  
  let maxCount = 0;
  let passion = 1;
  for (let val = 1; val <= 9; val++) {
    if ((counts[val] || 0) > maxCount) {
      maxCount = counts[val];
      passion = val;
    }
  }
  return passion;
}

// 10. Missing Numbers in Name (1-9)
export function calculateMissingNumbersInName(cleanName: string): number[] {
  const letters = getNameLetterValues(cleanName);
  const present = new Set(letters.map(l => l.val));
  const missing: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!present.has(i)) {
      missing.push(i);
    }
  }
  return missing;
}

// 11. Karmic Debts Detection
export function detectKarmicDebts(dob: DOB, cleanName: string): number[] {
  const debts = new Set<number>();
  
  // Check DOB day
  if (checkKarmicDebt(dob.day)) debts.add(dob.day);
  
  // Check DOB total sum
  const dobDigitsStr = `${dob.day}${dob.month}${dob.year}`.replace(/\D/g, '');
  const dobSum = dobDigitsStr.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  if (checkKarmicDebt(dobSum)) debts.add(dobSum);
  
  // Check Name Expression
  const letters = getNameLetterValues(cleanName);
  const nameSum = letters.reduce((s, l) => s + l.val, 0);
  if (checkKarmicDebt(nameSum)) debts.add(nameSum);
  
  // Check Vowels
  const vowelSum = letters.filter(l => VOWELS.has(l.letter)).reduce((s, l) => s + l.val, 0);
  if (checkKarmicDebt(vowelSum)) debts.add(vowelSum);
  
  // Check Consonants
  const consonantSum = letters.filter(l => !VOWELS.has(l.letter)).reduce((s, l) => s + l.val, 0);
  if (checkKarmicDebt(consonantSum)) debts.add(consonantSum);

  return Array.from(debts).sort((a, b) => a - b);
}

// 12. Personal Year
export function calculatePersonalYear(day: number, month: number, currentYear: number): number {
  return reduceNumber(day + month + currentYear, false);
}

// 13. Personal Month
export function calculatePersonalMonth(personalYear: number, currentMonth: number): number {
  return reduceNumber(personalYear + currentMonth, false);
}

// 14. Personal Day
export function calculatePersonalDay(personalMonth: number, currentDay: number): number {
  return reduceNumber(personalMonth + currentDay, false);
}
