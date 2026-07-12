import { describe, it, expect } from 'vitest';
import { calculateCompatibility } from './compatibilityCalculator';

describe('compatibilityCalculator tests', () => {
  it('should calculate compatibility percentages between two people', () => {
    // Person 1: Driver 1, Conductor 5
    // Person 2: Driver 5, Conductor 1
    const result = calculateCompatibility(1, 5, 5, 1);
    
    expect(result.marriagePct).toBeGreaterThanOrEqual(80);
    expect(result.lovePct).toBeGreaterThanOrEqual(80);
    expect(result.friendshipPct).toBeGreaterThanOrEqual(80);
    expect(result.businessPct).toBeGreaterThanOrEqual(80);
    expect(result.overallPct).toBeGreaterThanOrEqual(80);
    expect(result.explanation).toContain('Excellent match!');
  });

  it('should reflect lower compatibility score for enemy planetary configurations', () => {
    // Sun (1) vs Saturn (8) - Enemies
    const result = calculateCompatibility(1, 1, 8, 8);
    
    expect(result.overallPct).toBeLessThan(60);
    expect(result.explanation).toContain('Average compatibility');
  });
});
