import { DOB, numerologyConfig } from './config';
import { reduceNumber } from './birthNumber';

// Life Path Number (based on configurations)
export function calculateLifePath(dob: DOB): number {
  if (numerologyConfig.reduceIndividualLifePath) {
    const m = reduceNumber(dob.month, true);
    const d = reduceNumber(dob.day, true);
    const y = reduceNumber(dob.year, true);
    return reduceNumber(m + d + y, true);
  } else {
    // Total sum of all digits in DOB
    const digitsStr = `${dob.day}${dob.month}${dob.year}`.replace(/\D/g, '');
    const sum = digitsStr.split('').reduce((s, d) => s + parseInt(d, 10), 0);
    return reduceNumber(sum, true);
  }
}

// Conductor Number (Vedic destiny number, always reduced to a single digit)
export function calculateConductorNumber(dob: DOB): number {
  const sum = dob.day + dob.month + dob.year;
  let temp = sum;
  while (temp > 9) {
    let s = 0;
    const str = temp.toString();
    for (let i = 0; i < str.length; i++) {
      s += parseInt(str[i], 10);
    }
    temp = s;
  }
  return temp;
}
