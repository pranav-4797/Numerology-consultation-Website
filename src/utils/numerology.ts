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
