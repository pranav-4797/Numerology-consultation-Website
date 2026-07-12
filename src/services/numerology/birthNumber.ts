import { numerologyConfig } from './config';

// Helper: Reduce any number to a single digit (1-9)
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

// Helper: Reduce any number, preserving Master Numbers (11, 22, 33) if config says so
export function reduceNumber(num: number, preserveMaster: boolean = numerologyConfig.preserveMasterNumbers): number {
  let temp = Math.abs(num);
  if (temp === 0) return 0;
  
  while (temp > 9) {
    if (preserveMaster && numerologyConfig.masterNumbers.includes(temp)) {
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

// Birth / Driver Number (usually reduced to a single digit 1-9)
export function calculateBirthNumber(day: number): number {
  return reduceToSingleDigit(day);
}

// Birthday Number (reduces DOB day, preserving master numbers if config is true)
export function calculateBirthdayNum(day: number): number {
  return reduceNumber(day);
}

// Attitude Number (DOB day + DOB month)
export function calculateAttitudeNum(day: number, month: number): number {
  return reduceNumber(day + month, false); // Attitude numbers are usually reduced to single digit
}
