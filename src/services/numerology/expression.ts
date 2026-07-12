import { calculateNameNumber } from './nameNumber';

// Name Expression Number (same as name total, full letters sum)
export function calculateExpression(cleanName: string): number {
  return calculateNameNumber(cleanName);
}
