import { describe, it, expect } from 'vitest';
import {
  parseDOB,
  reduceToSingleDigit,
  reduceNumber,
  calculateLifePath,
  calculateBirthdayNum,
  calculateExpression,
  calculateSoulUrge,
  calculateNamePersonality,
  calculateAttitudeNum,
  calculateMaturityNum,
  calculateBalanceNum,
  calculateHiddenPassion,
  calculateMissingNumbersInName,
  detectKarmicDebts,
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay
} from './coreCalculator';

describe('coreCalculator tests', () => {
  it('should parse DOB string in various formats', () => {
    expect(parseDOB('2005-07-28')).toEqual({ day: 28, month: 7, year: 2005 });
    expect(parseDOB('28-07-2005')).toEqual({ day: 28, month: 7, year: 2005 });
    expect(parseDOB('28/07/2005')).toEqual({ day: 28, month: 7, year: 2005 });
  });

  it('should reduce number to single digit', () => {
    expect(reduceToSingleDigit(24)).toBe(6);
    expect(reduceToSingleDigit(28)).toBe(1);
    expect(reduceToSingleDigit(11)).toBe(2);
    expect(reduceToSingleDigit(0)).toBe(0);
  });

  it('should reduce number preserving master numbers if configured', () => {
    expect(reduceNumber(24, true)).toBe(6);
    expect(reduceNumber(11, true)).toBe(11);
    expect(reduceNumber(22, true)).toBe(22);
    expect(reduceNumber(33, true)).toBe(33);
    expect(reduceNumber(11, false)).toBe(2);
  });

  it('should calculate Life Path Number', () => {
    // 28-07-2005 -> 2+8+0+7+2+0+0+5 = 24 -> 6
    const dob = { day: 28, month: 7, year: 2005 };
    expect(calculateLifePath(dob, false)).toBe(6);
    
    // 11-11-2011 -> 1+1+1+1+2+0+1+1 = 8
    const dobMaster = { day: 11, month: 11, year: 2011 };
    expect(calculateLifePath(dobMaster, false)).toBe(8);
  });

  it('should calculate Birthday Number', () => {
    expect(calculateBirthdayNum(28)).toBe(1);
    expect(calculateBirthdayNum(11)).toBe(11);
  });

  it('should calculate Name Expression (Destiny), Soul Urge, and Personality', () => {
    // PRANAV -> P(7), R(9), A(1), N(5), A(1), V(4) -> 27 -> 9
    // Vowels: A(1), A(1) -> 2
    // Consonants: P(7), R(9), N(5), V(4) -> 25 -> 7
    const name = 'PRANAV';
    expect(calculateExpression(name)).toBe(9);
    expect(calculateSoulUrge(name)).toBe(2);
    expect(calculateNamePersonality(name)).toBe(7);
  });

  it('should calculate Attitude, Maturity, and Balance', () => {
    expect(calculateAttitudeNum(28, 7)).toBe(8); // 28 + 7 = 35 -> 8
    expect(calculateMaturityNum(6, 9)).toBe(6); // LP(6) + Expression(9) = 15 -> 6
    expect(calculateBalanceNum('PRANAV CHOPADE')).toBe(1); // P(7) + C(3) = 10 -> 1
  });

  it('should calculate Hidden Passion and Missing Numbers', () => {
    // PRANAV -> P(7), R(9), A(1), N(5), A(1), V(4)
    // Counts: 1: 2, 4: 1, 5: 1, 7: 1, 9: 1. Max is 1 (appears twice).
    expect(calculateHiddenPassion('PRANAV')).toBe(1);
    expect(calculateMissingNumbersInName('PRANAV')).toEqual([2, 3, 6, 8]);
  });

  it('should detect Karmic Debts', () => {
    // DOB: 19-07-2005 -> Day is 19 (Karmic Debt)
    const dob = { day: 19, month: 7, year: 2005 };
    const debts = detectKarmicDebts(dob, 'PRANAV');
    expect(debts).toContain(19);
  });

  it('should calculate Personal Year, Month, and Day', () => {
    const py = calculatePersonalYear(28, 7, 2026); // 28 + 7 + 2026 = 2061 -> 9
    expect(py).toBe(9);
    const pm = calculatePersonalMonth(9, 7); // 9 + 7 = 16 -> 7
    expect(pm).toBe(7);
    const pd = calculatePersonalDay(7, 12); // 7 + 12 = 19 -> 1
    expect(pd).toBe(1);
  });
});
