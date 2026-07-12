import { CompatibilityResult } from './types';
import { reduceToSingleDigit } from './coreCalculator';
import { FRIENDLY_PLANETS, ENEMY_PLANETS } from './vedicCalculator';

export function calculateCompatibility(
  driver1: number,
  conductor1: number,
  driver2: number,
  conductor2: number
): CompatibilityResult {
  const d1 = reduceToSingleDigit(driver1);
  const c1 = reduceToSingleDigit(conductor1);
  const d2 = reduceToSingleDigit(driver2);
  const c2 = reduceToSingleDigit(conductor2);

  // Friendly factor (0 to 10)
  const getFriendshipFactor = (n1: number, n2: number): number => {
    if (n1 === n2) return 10;
    if (FRIENDLY_PLANETS[n1]?.includes(n2)) return 9;
    if (ENEMY_PLANETS[n1]?.includes(n2)) return 3;
    return 6; // Neutral
  };

  const f1 = getFriendshipFactor(d1, d2);
  const f2 = getFriendshipFactor(c1, c2);
  const f3 = getFriendshipFactor(d1, c2);
  const f4 = getFriendshipFactor(c1, d2);

  const averageFactor = (f1 + f2 + f3 + f4) / 4; // Max 10

  const marriagePct = Math.round(averageFactor * 10 - 2 + (d1 % 2 === d2 % 2 ? 4 : 0));
  const lovePct = Math.round(averageFactor * 10 + (Math.abs(d1 - d2) <= 2 ? 5 : -3));
  const friendshipPct = Math.round(averageFactor * 10 + 2);
  const businessPct = Math.round(averageFactor * 10 - (d1 === 8 || d2 === 8 ? 5 : 0));

  const overallPct = Math.round((marriagePct + lovePct + friendshipPct + businessPct) / 4);

  let explanation = '';
  if (overallPct >= 80) {
    explanation = 'Excellent match! The planetary rulers are highly friendly, suggesting deep emotional understanding, mutual respect, and long-term harmony. Business and domestic unions will flourish naturally.';
  } else if (overallPct >= 60) {
    explanation = 'Good compatible match. While some minor differences in temperaments exist due to planetary rulers, cooperation and open communication will easily resolve them. Highly suitable for business partnership and friendship.';
  } else {
    explanation = 'Average compatibility. Some core friction exists due to conflicting planetary configurations (e.g. Sun vs Saturn or Moon vs Rahu). Remedies like sharing suitable gemstones or matching name spelling vibrations are strongly suggested to mitigate friction.';
  }

  return {
    marriagePct: Math.min(100, Math.max(10, marriagePct)),
    lovePct: Math.min(100, Math.max(10, lovePct)),
    friendshipPct: Math.min(100, Math.max(10, friendshipPct)),
    businessPct: Math.min(100, Math.max(10, businessPct)),
    overallPct: Math.min(100, Math.max(10, overallPct)),
    explanation,
  };
}
