import { reduceNumber } from './birthNumber';

// Personal Year = Day of DOB + Month of DOB + Current Year
export function calculatePersonalYear(day: number, month: number, currentYear: number): number {
  return reduceNumber(day + month + currentYear, false); // reduced to single digit
}

// Personal Month = Personal Year + Current Month
export function calculatePersonalMonth(personalYear: number, currentMonth: number): number {
  return reduceNumber(personalYear + currentMonth, false);
}

// Personal Day = Personal Month + Current Day
export function calculatePersonalDay(personalMonth: number, currentDay: number): number {
  return reduceNumber(personalMonth + currentDay, false);
}
