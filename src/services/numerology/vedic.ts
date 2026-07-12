import { PlanetDetail, PLANET_INFO, FRIENDLY_PLANETS, ENEMY_PLANETS, VEDIC_LAYOUT } from './config';

export interface VedicResult {
  vedicGrid: (string | null)[][];
  vedicFrequencies: Record<number, number>;
  vedicStrongPlanets: string[];
  vedicWeakPlanets: string[];
  vedicPlanetStrengthPct: number;
  driverNum: number;
  conductorNum: number;
  luckyNumbers: number[];
  unluckyNumbers: number[];
  planetsAnalysis: { name: string; details: PlanetDetail; strengthPct: number }[];
}

export function getPlanetName(num: number): string {
  switch (num) {
    case 1: return 'Sun';
    case 2: return 'Moon';
    case 3: return 'Jupiter';
    case 4: return 'Rahu';
    case 5: return 'Mercury';
    case 6: return 'Venus';
    case 7: return 'Ketu';
    case 8: return 'Saturn';
    case 9: return 'Mars';
    default: return 'Unknown';
  }
}

export function calculateVedicGrid(dobDigits: string, driverNum: number, conductorNum: number): VedicResult {
  const vedicFrequencies: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) vedicFrequencies[i] = 0;

  dobDigits.split('').map(Number).forEach(digit => {
    if (digit >= 1 && digit <= 9) {
      vedicFrequencies[digit]++;
    }
  });

  if (driverNum >= 1 && driverNum <= 9) {
    vedicFrequencies[driverNum]++;
  }
  if (conductorNum >= 1 && conductorNum <= 9) {
    vedicFrequencies[conductorNum]++;
  }

  const vedicGrid = VEDIC_LAYOUT.map(row =>
    row.map(val => {
      const freq = vedicFrequencies[val];
      return freq > 0 ? val.toString().repeat(freq) : '';
    })
  );

  const planetKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const vedicStrongPlanets = planetKeys
    .filter(k => vedicFrequencies[parseInt(k, 10)] >= 1)
    .map(k => getPlanetName(parseInt(k, 10)));

  const vedicWeakPlanets = planetKeys
    .filter(k => vedicFrequencies[parseInt(k, 10)] === 0)
    .map(k => getPlanetName(parseInt(k, 10)));

  const vedicPlanetStrengthPct = Math.round((vedicStrongPlanets.length / 9) * 100);

  const luckyNumbers = Array.from(new Set([driverNum, conductorNum, ...(FRIENDLY_PLANETS[driverNum] || [])]));
  const unluckyNumbers = ENEMY_PLANETS[driverNum] || [];

  const planetsAnalysis = Object.keys(PLANET_INFO).map(name => {
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
    const freq = vedicFrequencies[numVal] || 0;
    const strengthPct = freq === 0 ? 0 : freq === 1 ? 75 : freq === 2 ? 100 : 80;

    return {
      name,
      details: PLANET_INFO[name],
      strengthPct,
    };
  });

  return {
    vedicGrid,
    vedicFrequencies,
    vedicStrongPlanets,
    vedicWeakPlanets,
    vedicPlanetStrengthPct,
    driverNum,
    conductorNum,
    luckyNumbers,
    unluckyNumbers,
    planetsAnalysis
  };
}
