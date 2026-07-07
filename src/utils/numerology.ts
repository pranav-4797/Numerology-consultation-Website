export function sumDigits(num: number): number {
  return num
    .toString()
    .split('')
    .map(Number)
    .reduce((acc, curr) => acc + curr, 0);
}

export function reduceToSingleDigit(num: number): number {
  let val = num;
  while (val > 9) {
    val = sumDigits(val);
  }
  return val;
}

export function getPersonalityNumber(dateString: string): number {
  if (!dateString) return 0;
  const parts = dateString.split('-');
  if (parts.length < 3) return 0;
  const day = parseInt(parts[2], 10);
  if (isNaN(day)) return 0;
  return reduceToSingleDigit(day);
}

export function getDestinyNumber(dateString: string): number {
  if (!dateString) return 0;
  const digitsOnly = dateString.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  const sum = digitsOnly.split('').map(Number).reduce((acc, d) => acc + d, 0);
  return reduceToSingleDigit(sum);
}

export function getZodiacSign(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length < 3) return '';
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return '';

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return '';
}

export const CHALDEAN_MAP: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, r: 2, k: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8
};

export const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

export interface LetterValue {
  char: string;
  val: number;
}

export function getChaldeanNameDetails(name: string): { sum: number; reduced: number; letters: LetterValue[] } {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  const letters = cleanName.split('').map((char) => {
    const val = CHALDEAN_MAP[char] || 0;
    sum += val;
    return { char: char.toUpperCase(), val };
  });
  const reduced = reduceToSingleDigit(sum);
  return { sum, reduced, letters };
}

export function getPythagoreanNameDetails(name: string): { sum: number; reduced: number; letters: LetterValue[] } {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  const letters = cleanName.split('').map((char) => {
    const val = PYTHAGOREAN_MAP[char] || 0;
    sum += val;
    return { char: char.toUpperCase(), val };
  });
  const reduced = reduceToSingleDigit(sum);
  return { sum, reduced, letters };
}
