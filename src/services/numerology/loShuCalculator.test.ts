import { describe, it, expect } from 'vitest';
import { calculateLoShuGrid } from './loShuCalculator';

describe('loShuCalculator tests', () => {
  it('should compile Lo Shu grid layout correctly for 28-07-2005', () => {
    // 28-07-2005 -> non-zero digits: 2, 8, 7, 2, 5
    // Grid counts: 2: two, 5: one, 7: one, 8: one. Others: zero.
    const result = calculateLoShuGrid('28072005');
    
    expect(result.loShuFrequencies[2]).toBe(2);
    expect(result.loShuFrequencies[5]).toBe(1);
    expect(result.loShuFrequencies[7]).toBe(1);
    expect(result.loShuFrequencies[8]).toBe(1);
    expect(result.loShuFrequencies[9]).toBe(0);

    expect(result.loShuGrid[0][2]).toBe('22'); // Cell 2
    expect(result.loShuGrid[1][1]).toBe('5');  // Cell 5
    expect(result.loShuGrid[1][2]).toBe('7');  // Cell 7
    expect(result.loShuGrid[2][0]).toBe('8');  // Cell 8

    expect(result.loShuRepeated).toEqual([2]);
    expect(result.loShuDominant).toEqual([2]);
  });

  it('should detect standard planes / arrows of strength and weakness', () => {
    // 28-07-2005 does not have all numbers for standard arrows, e.g.
    // Arrow of Intellect (4,9,2) is missing 4 and 9, so type is 'none'.
    // Let's test with a DOB containing Arrow of Determination (1, 5, 9)
    // DOB: 19-05-1991 -> digits: 1, 9, 0, 5, 1, 9, 9, 1
    const result = calculateLoShuGrid('19051991');
    const determinationArrow = result.loShuArrows.find(a => a.name === 'Arrow of Determination');
    expect(determinationArrow?.type).toBe('strength');
  });
});
