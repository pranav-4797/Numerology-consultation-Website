import { NumerologyReport } from './types';
import {
  DOB,
  parseDOB,
  reduceNumber,
  reduceToSingleDigit,
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
  calculatePersonalDay,
  PYTHAGOREAN_MAP
} from './coreCalculator';
import { calculateLoShuGrid } from './loShuCalculator';
import { calculateVedicGrid, FRIENDLY_PLANETS, ENEMY_PLANETS } from './vedicCalculator';
import { calculatePythagoreanGrid } from './pythagoreanCalculator';
import { calculateLuckySuggestions, calculateRemedies } from './remediesCalculator';
import { generateAIReport } from './aiInterpreter';
import { PLANET_INFO } from './types';

export * from './types';
export * from './coreCalculator';
export * from './loShuCalculator';
export * from './vedicCalculator';
export * from './pythagoreanCalculator';
export * from './remediesCalculator';
export * from './compatibilityCalculator';
export * from './aiInterpreter';

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

  // Validate parsed DOB values are valid numbers
  if (isNaN(dob.day) || isNaN(dob.month) || isNaN(dob.year)) {
    throw new Error('Invalid date of birth format');
  }
  if (dob.day < 1 || dob.day > 31 || dob.month < 1 || dob.month > 12 || dob.year < 1) {
    throw new Error('Date of birth values out of range');
  }

  const dobDigits = `${dob.day}${dob.month}${dob.year}`.replace(/\D/g, '');

  // 1. Core numbers
  const driverNum = reduceNumber(dob.day, false);
  const conductorNum = reduceNumber(dob.day + dob.month + dob.year, false);

  const lifePath = calculateLifePath(dob, false);
  const expression = calculateExpression(cleanName);
  const soulUrge = calculateSoulUrge(cleanName);
  const namePersonality = calculateNamePersonality(cleanName);

  // Vedic system mappings:
  const destiny = conductorNum; // Conductor
  const personality = driverNum; // Driver

  const birthdayNum = calculateBirthdayNum(dob.day);
  const maturityNum = calculateMaturityNum(lifePath, expression);
  const attitudeNum = calculateAttitudeNum(dob.day, dob.month);
  const balanceNum = calculateBalanceNum(cleanName);
  const bridgeNum = Math.abs(reduceToSingleDigit(lifePath) - reduceToSingleDigit(expression));

  const hiddenPassion = calculateHiddenPassion(cleanName);
  const subconsciousSelf = new Set(cleanName.replace(/[^A-Z]/g, '').split('').map(c => PYTHAGOREAN_MAP[c])).size;
  const karmicDebts = detectKarmicDebts(dob, cleanName);
  const karmicLessons = calculateMissingNumbersInName(cleanName);

  // Missing DOB numbers
  const dobDigitsSet = new Set(dobDigits.split('').map(Number));
  const missingNumbers: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!dobDigitsSet.has(i)) {
      missingNumbers.push(i);
    }
  }

  // Personal calendar (using current date)
  const currentYear = new Date().getFullYear();
  const personalYear = calculatePersonalYear(dob.day, dob.month, currentYear);
  const currentMonth = new Date().getMonth() + 1;
  const personalMonth = calculatePersonalMonth(personalYear, currentMonth);
  const currentDay = new Date().getDate();
  const personalDay = calculatePersonalDay(personalMonth, currentDay);

  // Challenges
  const chal1 = Math.abs(reduceToSingleDigit(dob.day) - reduceToSingleDigit(dob.month));
  const chal2 = Math.abs(reduceToSingleDigit(dob.day) - reduceToSingleDigit(dob.year));
  const chal3 = Math.abs(chal1 - chal2);
  const chal4 = Math.abs(reduceToSingleDigit(dob.month) - reduceToSingleDigit(dob.year));
  const challenges = [chal1, chal2, chal3, chal4].map(n => reduceToSingleDigit(n));

  // Pinnacles
  const pin1 = reduceToSingleDigit(dob.month + dob.day);
  const pin2 = reduceToSingleDigit(dob.day + dob.year);
  const pin3 = reduceToSingleDigit(pin1 + pin2);
  const pin4 = reduceToSingleDigit(dob.month + dob.year);
  const pinnacles = [pin1, pin2, pin3, pin4];

  // 2. Grids
  const {
    loShuGrid,
    loShuFrequencies,
    loShuRepeated,
    loShuDominant,
    loShuArrows
  } = calculateLoShuGrid(dobDigits);

  const {
    vedicGrid,
    vedicFrequencies,
    vedicStrongPlanets,
    vedicWeakPlanets,
    vedicPlanetStrengthPct,
    luckyNumbers,
    unluckyNumbers,
    planetsAnalysis
  } = calculateVedicGrid(dobDigits, driverNum, conductorNum);

  const {
    pythagoreanGrid,
    pythagoreanFrequencies,
    workingNumbers,
    pythagoreanPlanes
  } = calculatePythagoreanGrid(dob, dobDigits);

  // 3. Name, Mobile, Vehicle, House analysis details
  const nameAnalysis = {
    expression,
    soulUrge,
    personality: namePersonality,
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
  const parts = baseName.split(' ');
  if (parts.length > 0) {
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
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

  // 4. Remedies and suggestions
  const luckySuggestions = calculateLuckySuggestions(driverNum, luckyNumbers);
  const remedies = calculateRemedies(driverNum, luckySuggestions);

  // 5. AI narrative
  const aiReport = generateAIReport({
    name,
    dobStr,
    lifePath,
    destiny,
    expression,
    soulUrge,
    personality,
    namePersonality,
    attitudeNum,
    maturityNum,
    loShuArrows,
    loShuDominant,
    missingNumbers,
    vedicStrongPlanets,
    vedicWeakPlanets,
    vedicPlanetStrengthPct,
    workingNumbers,
    personalYear,
    remedies
  });

  return {
    name: cleanName,
    dob: safeDobStr,
    gender: safeGender,
    mobile: safeMobile,
    email: safeEmail,
    lifePath,
    destiny,
    expression,
    soulUrge,
    personality,
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
    aiReport,
  };
}
