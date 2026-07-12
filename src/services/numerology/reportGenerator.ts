import { DOB, PLANET_INFO, FRIENDLY_PLANETS, ENEMY_PLANETS, PYTHAGOREAN_MAP, VOWELS, numerologyConfig } from './config';
import { calculateBirthNumber, calculateBirthdayNum, calculateAttitudeNum, reduceNumber, reduceToSingleDigit } from './birthNumber';
import { calculateLifePath, calculateConductorNumber } from './destinyNumber';
import { calculateExpression } from './expression';
import { calculateSoulUrge } from './soulUrge';
import { calculatePersonality } from './personality';
import { calculateLoShuGrid } from './loshu';
import { calculateVedicGrid } from './vedic';
import { calculatePythagoreanGrid } from './pythagorean';
import { calculatePersonalYear, calculatePersonalMonth, calculatePersonalDay } from './personalYear';
import { calculateLuckySuggestions, calculateRemedies, LuckySuggestions, Remedies } from './lucky';
import { calculateMissingNumbers, calculateRepeatedNumbers, detectArrows } from './arrows';

export interface NumerologyReport {
  name: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;

  // Basic Numbers
  lifePath: number;
  destiny: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthdayNum: number;
  maturityNum: number;
  attitudeNum: number;
  balanceNum: number;
  bridgeNum: number;
  hiddenPassion: number;
  subconsciousSelf: number;
  karmicDebts: number[];
  karmicLessons: number[];
  missingNumbers: number[];
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  challenges: number[];
  pinnacles: number[];

  // Grids
  loShuGrid: (string | null)[][];
  loShuFrequencies: Record<number, number>;
  loShuRepeated: number[];
  loShuDominant: number[];
  loShuArrows: {
    name: string;
    type: 'strength' | 'weakness' | 'none';
    numbers: number[];
    status: string;
    meaning: string;
  }[];

  vedicGrid: (string | null)[][];
  vedicFrequencies: Record<number, number>;
  vedicStrongPlanets: string[];
  vedicWeakPlanets: string[];
  vedicPlanetStrengthPct: number;
  driverNum: number;
  conductorNum: number;
  luckyNumbers: number[];
  unluckyNumbers: number[];

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

  // Analysis
  planetsAnalysis: {
    name: string;
    details: any;
    strengthPct: number;
  }[];

  nameAnalysis: {
    expression: number;
    soulUrge: number;
    personality: number;
    nameNumber: number;
    compoundNumber: number;
    luckyAlphabets: string[];
    missingAlphabets: string[];
    suggestedSpellings: string[];
  };

  mobileAnalysis: {
    value: number;
    planetInfluence: string;
    luckyPercentage: number;
    positiveEnergyPct: number;
    negativeEnergyPct: number;
  };

  vehicleAnalysis: {
    value: number;
    vibration: string;
    luckyScore: number;
    compatibility: string;
  };

  houseAnalysis: {
    value: number;
    vibration: string;
    planet: string;
    luckyScore: number;
  };

  luckySuggestions: LuckySuggestions;
  remedies: Remedies;
  aiReport: string;
}

// Parse date string (YYYY-MM-DD or DD-MM-YYYY)
export function parseDOB(dobStr: string): DOB {
  if (!dobStr) return { day: 1, month: 1, year: 2000 };
  
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

// Calculate Hidden Passion Number
export function calculateHiddenPassion(cleanName: string): number {
  const letters = cleanName.replace(/[^A-Z]/g, '').split('');
  const counts: Record<number, number> = {};
  letters.forEach(char => {
    const val = PYTHAGOREAN_MAP[char] || 0;
    if (val > 0) {
      counts[val] = (counts[val] || 0) + 1;
    }
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

// Calculate Balance Number (First letters of name parts)
export function calculateBalanceNum(cleanName: string): number {
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initialsSum = parts.reduce((s, part) => {
    const firstChar = part.charAt(0);
    return s + (PYTHAGOREAN_MAP[firstChar] || 0);
  }, 0);
  return reduceNumber(initialsSum, false);
}

// Check if compound number is Karmic Debt
function checkKarmicDebt(sum: number): boolean {
  return [13, 14, 16, 19].includes(sum);
}

// Detect Karmic Debts in DOB/Name Components
export function detectKarmicDebts(dob: DOB, cleanName: string): number[] {
  const debts = new Set<number>();
  if (checkKarmicDebt(dob.day)) debts.add(dob.day);
  
  const dobDigitsStr = `${dob.day}${dob.month}${dob.year}`.replace(/\D/g, '');
  const dobSum = dobDigitsStr.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  if (checkKarmicDebt(dobSum)) debts.add(dobSum);
  
  const letters = cleanName.replace(/[^A-Z]/g, '').split('');
  const nameSum = letters.reduce((s, c) => s + (PYTHAGOREAN_MAP[c] || 0), 0);
  if (checkKarmicDebt(nameSum)) debts.add(nameSum);
  
  const vowelSum = letters.filter(c => VOWELS.has(c)).reduce((s, c) => s + (PYTHAGOREAN_MAP[c] || 0), 0);
  if (checkKarmicDebt(vowelSum)) debts.add(vowelSum);
  
  const consonantSum = letters.filter(c => !VOWELS.has(c)).reduce((s, c) => s + (PYTHAGOREAN_MAP[c] || 0), 0);
  if (checkKarmicDebt(consonantSum)) debts.add(consonantSum);

  return Array.from(debts).sort((a, b) => a - b);
}

// Missing numbers in Name (Karmic Lessons)
export function calculateKarmicLessons(cleanName: string): number[] {
  const present = new Set(cleanName.replace(/[^A-Z]/g, '').split('').map(c => PYTHAGOREAN_MAP[c]));
  const missing: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!present.has(i)) {
      missing.push(i);
    }
  }
  return missing;
}

// Generate AI Report template narrative
export function generateAIReport(report: Omit<NumerologyReport, 'aiReport'>): string {
  const strongArrows = report.loShuArrows.filter(a => a.type === 'strength').map(a => a.name).join(', ') || 'basic planes';
  const missingNumbersStr = report.missingNumbers.length > 0 ? report.missingNumbers.join(', ') : 'none';

  return `### Divya Urja Professional Numerology Audit

Dear ${report.name}, 

Based on your birth signature profile calculated for the Date of Birth **${report.dob}**, you possess a highly unique vibrational design led by **Psychic/Personality/Driver Number ${report.personality}** and **Destiny/Conductor Number ${report.destiny}**.

#### Part 1: Core Vibrational Architecture
Your **Life Path Number is ${report.lifePath}**. This governs your primary lesson and path of evolution in this incarnation. In daily life, this manifests as your primary vibrational frequency guiding your life's purpose and key milestones.

Your **Destiny Number is ${report.destiny}** and your **Expression Number is ${report.expression}** calculated from the letters of your full name. The emotional blueprint of your soul is guided by **Soul Urge Number ${report.soulUrge}** (inner desires) and **Name Personality Number ${report.personality}** (outer projection).

#### Part 2: Grid Interpretations
- **Lo Shu Grid**: Mapping your DOB digits reveals a strong presence in the **${strongArrows}**. Your grid is missing the number ${missingNumbersStr}, which indicates areas where you must consciously build stability, communication, and discipline using our custom lifestyle and color remedies.
- **Vedic Grid Planetary Strength**: Your overall planetary charge is **${report.vedicPlanetStrengthPct}%**. The strong planetary entities are **${report.vedicStrongPlanets.join(', ')}**, bringing you public authority and communication power. The planetary entities **${report.vedicWeakPlanets.join(', ') || 'none'}** are currently weak or dormant, suggesting you perform targeted donations on their respective days.
- **Pythagorean Psychomatrix**: Your working numbers are **${report.workingNumbers.join(', ')}**. The physical, emotional, and mental planes represent a balanced structure, reflecting high resilience.

#### Part 3: Secondary Calculators & Suggestions
- **Name Vibration**: Your current name spelling vibrates to the compound value **${report.nameAnalysis.compoundNumber}** which reduces to **${report.expression}**.
- **Remedial Path**: Practice chanting the mantra **"${report.remedies.mantras[0]}"** 108 times daily. Wear colors like **${report.remedies.colors.join(', ')}** to boost your luck percentage and follow the custom habit: *"${report.remedies.habits[0]}"*

This report offers a spiritual blueprint. Use these insights and remedies to navigate your Personal Year (${report.personalYear}) with strength, clarity, and peace.`;
}

export function calculateNumerology(
  name: string,
  dobStr: string,
  gender: string,
  mobile: string,
  email: string = '',
  mobileToCheck: string = '',
  vehicleNo: string = '',
  houseNo: string = ''
): NumerologyReport {
  const safeName = typeof name === 'string' ? name : '';
  const safeDobStr = typeof dobStr === 'string' ? dobStr : '';
  const safeGender = typeof gender === 'string' ? gender : 'male';
  const safeMobile = typeof mobile === 'string' ? mobile : '';
  const safeEmail = typeof email === 'string' ? email : '';
  const safeMobileToCheck = typeof mobileToCheck === 'string' ? mobileToCheck : '';
  const safeVehicleNo = typeof vehicleNo === 'string' ? vehicleNo : '';
  const safeHouseNo = typeof houseNo === 'string' ? houseNo : '';

  const cleanName = safeName.toUpperCase().trim();
  if (!cleanName) {
    throw new Error('Name cannot be empty');
  }

  const dob = parseDOB(safeDobStr);
  if (isNaN(dob.day) || isNaN(dob.month) || isNaN(dob.year)) {
    throw new Error('Invalid date of birth format');
  }
  if (dob.day < 1 || dob.day > 31 || dob.month < 1 || dob.month > 12 || dob.year < 1) {
    throw new Error('Date of birth values out of range');
  }

  const dobDigits = `${dob.day}${dob.month}${dob.year}`.replace(/\D/g, '');

  // Core Numbers calculations
  const driverNum = calculateBirthNumber(dob.day);
  const conductorNum = calculateConductorNumber(dob);

  const lifePath = calculateLifePath(dob);
  const expression = calculateExpression(cleanName);
  const soulUrge = calculateSoulUrge(cleanName);
  const personality = calculatePersonality(cleanName);
  const birthdayNum = calculateBirthdayNum(dob.day);
  const maturityNum = reduceNumber(lifePath + expression, false);
  const attitudeNum = calculateAttitudeNum(dob.day, dob.month);
  const balanceNum = calculateBalanceNum(cleanName);
  const bridgeNum = Math.abs(reduceToSingleDigit(lifePath) - reduceToSingleDigit(expression));

  const hiddenPassion = calculateHiddenPassion(cleanName);
  const subconsciousSelf = new Set(cleanName.replace(/[^A-Z]/g, '').split('').map(c => PYTHAGOREAN_MAP[c])).size;
  const karmicDebts = detectKarmicDebts(dob, cleanName);
  const karmicLessons = calculateKarmicLessons(cleanName);

  // Missing numbers in Date of birth
  const missingNumbers = calculateMissingNumbers(dobDigits);

  // Personal Year, Month, Day
  const currentYear = new Date().getFullYear();
  const personalYear = calculatePersonalYear(dob.day, dob.month, currentYear);
  const currentMonth = new Date().getMonth() + 1;
  const personalMonth = calculatePersonalMonth(personalYear, currentMonth);
  const currentDay = new Date().getDate();
  const personalDay = calculatePersonalDay(personalMonth, currentDay);

  // Challenges (four cycles)
  const chal1 = Math.abs(reduceToSingleDigit(dob.day) - reduceToSingleDigit(dob.month));
  const chal2 = Math.abs(reduceToSingleDigit(dob.day) - reduceToSingleDigit(dob.year));
  const chal3 = Math.abs(chal1 - chal2);
  const chal4 = Math.abs(reduceToSingleDigit(dob.month) - reduceToSingleDigit(dob.year));
  const challenges = [chal1, chal2, chal3, chal4].map(n => reduceToSingleDigit(n));

  // Pinnacles (four cycles)
  const pin1 = reduceToSingleDigit(dob.month + dob.day);
  const pin2 = reduceToSingleDigit(dob.day + dob.year);
  const pin3 = reduceToSingleDigit(pin1 + pin2);
  const pin4 = reduceToSingleDigit(dob.month + dob.year);
  const pinnacles = [pin1, pin2, pin3, pin4];

  // Grid Calculations
  const { loShuGrid, loShuFrequencies, loShuRepeated, loShuDominant, loShuArrows } = calculateLoShuGrid(dobDigits);
  const { vedicGrid, vedicFrequencies, vedicStrongPlanets, vedicWeakPlanets, vedicPlanetStrengthPct, luckyNumbers, unluckyNumbers, planetsAnalysis } = calculateVedicGrid(dobDigits, driverNum, conductorNum);
  const { pythagoreanGrid, pythagoreanFrequencies, workingNumbers, pythagoreanPlanes } = calculatePythagoreanGrid(dob, dobDigits);

  // Name Analysis
  const nameAnalysis = {
    expression,
    soulUrge,
    personality,
    nameNumber: reduceToSingleDigit(expression),
    compoundNumber: cleanName.replace(/[^A-Z]/g, '').split('').reduce((s, c) => s + (PYTHAGOREAN_MAP[c] || 0), 0),
    luckyAlphabets: ['A', 'E', 'I', 'O', 'U'].filter((_, idx) => (driverNum + idx) % 2 === 0),
    missingAlphabets: Array.from(karmicLessons).map(n => {
      const entry = Object.entries(PYTHAGOREAN_MAP).find(([_, val]) => val === n);
      return entry ? entry[0] : '';
    }).filter(Boolean),
    suggestedSpellings: [] as string[]
  };

  // Simple spelling variations suggestion
  const baseName = cleanName;
  const nameParts = baseName.split(' ');
  if (nameParts.length > 0) {
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    const v1 = firstName + 'A' + (lastName ? ' ' + lastName : '');
    const v2 = firstName + firstName.slice(-1) + (lastName ? ' ' + lastName : '');
    const v3 = firstName + 'E' + (lastName ? ' ' + lastName : '');

    [v1, v2, v3].forEach(candidate => {
      const sum = candidate.replace(/[^A-Z]/g, '').split('').reduce((s, c) => s + (PYTHAGOREAN_MAP[c] || 0), 0);
      const red = reduceNumber(sum, true);
      if ([1, 3, 5, 6].includes(reduceToSingleDigit(red))) {
        nameAnalysis.suggestedSpellings.push(`${candidate} (Vibrates to ${red})`);
      }
    });
  }

  // Mobile Analysis
  let mobileVal = 0;
  let planetInfluence = 'Neutral';
  let luckyPercentage = 50;
  let positiveEnergyPct = 50;
  let negativeEnergyPct = 50;

  const targetMobile = safeMobileToCheck || safeMobile;
  if (targetMobile) {
    const digits = targetMobile.replace(/\D/g, '').split('').map(Number);
    const sum = digits.reduce((s, v) => s + v, 0);
    mobileVal = reduceNumber(sum, false);

    const matchPlanet = Object.keys(PLANET_INFO).find(name => {
      let numVal = 1;
      switch (name) {
        case 'Sun': numVal = 1; break;
        case 'Moon': numVal = 2; break;
        case 'Jupiter': numVal = 3; break;
        case 'Rahu': numVal = 4; break;
        case 'Mercury': numVal = 5; break;
        case 'Venus': numVal = 6; break;
        case 'Ketu': numVal = 7; break;
        case 'Saturn': numVal = 8; break;
        case 'Mars': numVal = 9; break;
      }
      return numVal === mobileVal;
    });
    planetInfluence = matchPlanet ? PLANET_INFO[matchPlanet].ruler : 'Unknown Planet';

    const isFriendly = FRIENDLY_PLANETS[driverNum]?.includes(mobileVal) || mobileVal === driverNum;
    const isEnemy = ENEMY_PLANETS[driverNum]?.includes(mobileVal);
    luckyPercentage = isFriendly ? 90 : isEnemy ? 30 : 65;

    const positives = digits.filter(d => [1, 5, 6, 9].includes(d)).length;
    const negatives = digits.filter(d => [4, 8].includes(d)).length;
    const totalE = positives + negatives || 1;
    positiveEnergyPct = Math.round((positives / totalE) * 100);
    negativeEnergyPct = Math.round((negatives / totalE) * 100);
  }

  const mobileAnalysis = {
    value: mobileVal,
    planetInfluence,
    luckyPercentage,
    positiveEnergyPct,
    negativeEnergyPct,
  };

  // Vehicle Analysis
  let vehicleVal = 0;
  let vehicleVibration = 'Balanced';
  let vehicleLuckyScore = 65;
  let vehicleComp = 'Neutral Compatibility';

  if (safeVehicleNo) {
    const lettersAndDigits = safeVehicleNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let sum = 0;
    lettersAndDigits.split('').forEach(char => {
      if (/[0-9]/.test(char)) {
        sum += parseInt(char, 10);
      } else {
        sum += PYTHAGOREAN_MAP[char] || 0;
      }
    });
    vehicleVal = reduceToSingleDigit(sum);
    
    const isFriendly = FRIENDLY_PLANETS[driverNum]?.includes(vehicleVal) || vehicleVal === driverNum;
    vehicleLuckyScore = isFriendly ? 85 : ENEMY_PLANETS[driverNum]?.includes(vehicleVal) ? 40 : 65;
    vehicleVibration = vehicleVal === 1 ? 'Confidence/Speed' : vehicleVal === 3 ? 'Wisdom/Safety' : vehicleVal === 6 ? 'Luxury/Comfort' : vehicleVal === 8 ? 'Struggle/Delays' : 'Stable journey';
    vehicleComp = isFriendly ? 'Highly Compatible' : 'Incompatible (Remedies Suggested)';
  }

  const vehicleAnalysis = {
    value: vehicleVal,
    vibration: vehicleVibration,
    luckyScore: vehicleLuckyScore,
    compatibility: vehicleComp,
  };

  // House Analysis
  let houseVal = 0;
  let houseVibration = 'Warm';
  let housePlanet = 'Mercury';
  let houseLuckyScore = 65;

  if (safeHouseNo) {
    const cleaned = safeHouseNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let sum = 0;
    cleaned.split('').forEach(char => {
      if (/[0-9]/.test(char)) {
        sum += parseInt(char, 10);
      } else {
        sum += PYTHAGOREAN_MAP[char] || 0;
      }
    });
    houseVal = reduceToSingleDigit(sum);

    const matchPlanet = Object.keys(PLANET_INFO).find(name => {
      let numVal = 1;
      switch (name) {
        case 'Sun': numVal = 1; break;
        case 'Moon': numVal = 2; break;
        case 'Jupiter': numVal = 3; break;
        case 'Rahu': numVal = 4; break;
        case 'Mercury': numVal = 5; break;
        case 'Venus': numVal = 6; break;
        case 'Ketu': numVal = 7; break;
        case 'Saturn': numVal = 8; break;
        case 'Mars': numVal = 9; break;
      }
      return numVal === houseVal;
    });
    housePlanet = matchPlanet || 'Unknown';
    houseVibration = houseVal === 1 ? 'Independence & Self-reliance' : houseVal === 2 ? 'Warm, cooperative home' : houseVal === 3 ? 'Creative, social atmosphere' : houseVal === 4 ? 'Hard work and structure' : houseVal === 5 ? 'Dynamic, full of travel' : houseVal === 6 ? 'Luxury and family love' : houseVal === 7 ? 'Spiritual ashram vibe' : houseVal === 8 ? 'Material gains & business focus' : 'Spiritual completion & service';
    houseLuckyScore = FRIENDLY_PLANETS[driverNum]?.includes(houseVal) ? 90 : 50;
  }

  const houseAnalysis = {
    value: houseVal,
    vibration: houseVibration,
    planet: housePlanet,
    luckyScore: houseLuckyScore,
  };

  const luckySuggestions = calculateLuckySuggestions(driverNum, luckyNumbers);
  const remedies = calculateRemedies(driverNum, luckySuggestions);

  // Vedic mappings for core variables
  const destiny = conductorNum;
  const personalityNumVal = driverNum;

  const resultWithoutAI: Omit<NumerologyReport, 'aiReport'> = {
    name: cleanName,
    dob: safeDobStr,
    gender: safeGender,
    mobile: safeMobile,
    email: safeEmail,
    lifePath,
    destiny,
    expression,
    soulUrge,
    personality: personalityNumVal,
    birthdayNum,
    maturityNum,
    attitudeNum,
    balanceNum,
    bridgeNum,
    hiddenPassion,
    subconsciousSelf,
    karmicDebts,
    karmicLessons,
    missingNumbers,
    personalYear,
    personalMonth,
    personalDay,
    challenges,
    pinnacles,
    loShuGrid,
    loShuFrequencies,
    loShuRepeated,
    loShuDominant,
    loShuArrows,
    vedicGrid,
    vedicFrequencies,
    vedicStrongPlanets,
    vedicWeakPlanets,
    vedicPlanetStrengthPct,
    driverNum,
    conductorNum,
    luckyNumbers,
    unluckyNumbers,
    pythagoreanGrid,
    pythagoreanFrequencies,
    workingNumbers,
    pythagoreanPlanes,
    planetsAnalysis,
    nameAnalysis,
    mobileAnalysis,
    vehicleAnalysis,
    houseAnalysis,
    luckySuggestions,
    remedies,
  };

  const aiReport = generateAIReport(resultWithoutAI);

  return {
    ...resultWithoutAI,
    aiReport
  };
}
