import { describe, it, expect } from 'vitest';
import { calculateVedicGrid } from './vedicCalculator';

describe('vedicCalculator tests', () => {
  it('should compile Vedic grid correctly and map planets', () => {
    // DOB: 28-07-2005 -> digits: 2, 8, 7, 2, 5
    // Vedic strong planets list
    const result = calculateVedicGrid('28072005', 1, 6);
    
    expect(result.vedicFrequencies[2]).toBe(2);
    expect(result.vedicFrequencies[7]).toBe(1);
    expect(result.vedicFrequencies[8]).toBe(1);
    expect(result.vedicFrequencies[5]).toBe(1);

    expect(result.vedicStrongPlanets).toContain('Moon'); // 2
    expect(result.vedicStrongPlanets).toContain('Ketu'); // 7
    expect(result.vedicStrongPlanets).toContain('Saturn'); // 8
    expect(result.vedicStrongPlanets).toContain('Mercury'); // 5
    
    expect(result.vedicWeakPlanets).toContain('Sun'); // 1
    expect(result.vedicWeakPlanets).toContain('Jupiter'); // 3
    expect(result.vedicWeakPlanets).toContain('Rahu'); // 4
    expect(result.vedicWeakPlanets).toContain('Venus'); // 6
    expect(result.vedicWeakPlanets).toContain('Mars'); // 9

    expect(result.vedicPlanetStrengthPct).toBeGreaterThan(30);

    const sunAnalysis = result.planetsAnalysis.find(p => p.name === 'Sun');
    expect(sunAnalysis?.strengthPct).toBe(0);
    const moonAnalysis = result.planetsAnalysis.find(p => p.name === 'Moon');
    expect(moonAnalysis?.strengthPct).toBe(100); // 2 counts
  });
});
