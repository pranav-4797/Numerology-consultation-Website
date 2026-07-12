import { describe, it, expect } from 'vitest';
import { calculatePythagoreanGrid } from './pythagoreanCalculator';

describe('pythagoreanCalculator tests', () => {
  it('should compile Psychomatrix working numbers and grid correctly', () => {
    // DOB: 28-07-2005
    // DOB digits: 2, 8, 7, 2, 5
    // First Working: 2+8+0+7+2+0+0+5 = 24
    // Second Working: 2+4 = 6
    // Third Working: 24 - 2 * 2 = 20
    // Fourth Working: 2+0 = 2
    // Working numbers: [24, 6, 20, 2]
    const dob = { day: 28, month: 7, year: 2005 };
    const result = calculatePythagoreanGrid(dob, '28072005');

    expect(result.workingNumbers).toEqual([24, 6, 20, 2]);

    // All digits: DOB(2,8,7,2,5) + Working(2,4,6,2,0,2) -> non-zero digits: 2,8,7,2,5,2,4,6,2,2
    // Counts:
    // 2: 5 counts (DOB 2, 2; first working 2; third working 2; fourth working 2)
    // 4: 1 count (first working 4)
    // 5: 1 count (DOB 5)
    // 6: 1 count (second working 6)
    // 7: 1 count (DOB 7)
    // 8: 1 count (DOB 8)
    expect(result.pythagoreanFrequencies[2]).toBe(5);
    expect(result.pythagoreanFrequencies[4]).toBe(1);
    expect(result.pythagoreanFrequencies[6]).toBe(1);

    expect(result.pythagoreanGrid[1][0]).toBe('22222'); // Cell 2
    expect(result.pythagoreanGrid[0][1]).toBe('4');     // Cell 4
    expect(result.pythagoreanGrid[2][1]).toBe('6');     // Cell 6

    const physicalPlane = result.pythagoreanPlanes.find(p => p.name.includes('Physical'));
    // Physical contains 1, 4, 7. Freqs: 0 + 1 + 1 = 2
    expect(physicalPlane?.score).toBe(2);
  });
});
