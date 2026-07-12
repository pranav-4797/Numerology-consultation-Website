export interface LuckySuggestions {
  colors: string[];
  gemstones: string[];
  rudraksha: string[];
  directions: string[];
  dates: number[];
  numbers: number[];
  careers: string[];
}

export interface Remedies {
  mantras: string[];
  donations: string[];
  habits: string[];
  meditation: string;
  colors: string[];
  days: string[];
  lifestyle: string[];
}

export function calculateLuckySuggestions(driverNum: number, luckyNumbers: number[]): LuckySuggestions {
  const colors = driverNum === 1 ? ['Red', 'Orange', 'Yellow'] 
               : driverNum === 2 ? ['White', 'Cream', 'Silver'] 
               : driverNum === 3 ? ['Yellow', 'Saffron'] 
               : driverNum === 4 ? ['Grey', 'Blue'] 
               : driverNum === 5 ? ['Green'] 
               : driverNum === 6 ? ['Pink', 'Cream'] 
               : driverNum === 7 ? ['Smoke Grey', 'Multi-color'] 
               : driverNum === 8 ? ['Blue', 'Purple'] 
               : ['Red', 'Coral'];

  const gemstones = driverNum === 1 ? ['Ruby'] 
                  : driverNum === 2 ? ['Pearl'] 
                  : driverNum === 3 ? ['Yellow Sapphire'] 
                  : driverNum === 4 ? ['Gomed / Hessonite'] 
                  : driverNum === 5 ? ['Emerald'] 
                  : driverNum === 6 ? ['Diamond / Opal'] 
                  : driverNum === 7 ? ['Cats Eye'] 
                  : driverNum === 8 ? ['Blue Sapphire'] 
                  : ['Red Coral'];

  const rudraksha = driverNum === 1 ? ['1 Mukhi'] 
                  : driverNum === 2 ? ['2 Mukhi'] 
                  : driverNum === 3 ? ['5 Mukhi'] 
                  : driverNum === 4 ? ['8 Mukhi'] 
                  : driverNum === 5 ? ['4 Mukhi'] 
                  : driverNum === 6 ? ['6 Mukhi'] 
                  : driverNum === 7 ? ['9 Mukhi'] 
                  : driverNum === 8 ? ['7 Mukhi'] 
                  : ['3 Mukhi'];

  const directions = driverNum === 1 || driverNum === 9 ? ['East', 'South'] 
                   : driverNum === 2 || driverNum === 7 ? ['North', 'West'] 
                   : ['Northeast', 'Southeast'];

  const careers = driverNum === 1 || driverNum === 9 ? ['Administration', 'Military', 'Leadership', 'Business owner'] 
                : driverNum === 3 || driverNum === 7 ? ['Teaching', 'Astrology', 'Philosophy', 'Research'] 
                : driverNum === 5 || driverNum === 6 ? ['Sales', 'Entertainment', 'IT', 'Design'] 
                : ['Infrastructure', 'Judiciary', 'Finance'];

  return {
    colors,
    gemstones,
    rudraksha,
    directions,
    dates: luckyNumbers.slice(0, 3),
    numbers: luckyNumbers,
    careers,
  };
}

export function calculateRemedies(driverNum: number, luckySuggestions: LuckySuggestions): Remedies {
  const mantras = driverNum === 1 ? ['Om Suryaya Namaha'] 
                : driverNum === 2 ? ['Om Som Somaya Namaha'] 
                : driverNum === 3 ? ['Om Gram Greem Groum Sah Gurave Namaha'] 
                : driverNum === 4 ? ['Om Raam Rahave Namaha'] 
                : driverNum === 5 ? ['Om Bum Budhaya Namaha'] 
                : driverNum === 6 ? ['Om Shum Shukraya Namaha'] 
                : driverNum === 7 ? ['Om Kem Ketave Namaha'] 
                : driverNum === 8 ? ['Om Sham Shanaishcharaya Namaha'] 
                : ['Om Kram Kreem Kroum Sah Bhaumaya Namaha'];

  const donations = driverNum === 1 ? ['Donate wheat, copper on Sunday'] 
                  : driverNum === 2 ? ['Donate milk, rice on Monday'] 
                  : driverNum === 3 ? ['Donate chana dal, yellow cloth on Thursday'] 
                  : driverNum === 4 ? ['Donate black sesame seeds on Saturday'] 
                  : driverNum === 5 ? ['Donate green moong dal on Wednesday'] 
                  : driverNum === 6 ? ['Donate sugar, white cloth on Friday'] 
                  : driverNum === 7 ? ['Donate multi-colored blanket on Saturday'] 
                  : driverNum === 8 ? ['Donate mustard oil, iron pan on Saturday'] 
                  : ['Donate masoor dal, copper on Tuesday'];

  const days = [
    driverNum === 1 ? 'Sunday' 
    : driverNum === 2 ? 'Monday' 
    : driverNum === 3 ? 'Thursday' 
    : driverNum === 5 ? 'Wednesday' 
    : driverNum === 6 ? 'Friday' 
    : driverNum === 8 || driverNum === 4 ? 'Saturday' 
    : 'Tuesday'
  ];

  return {
    mantras,
    donations,
    habits: [
      'Maintain punctuality daily.',
      'Be respectful to elders and your subordinates.',
      'Keep a glass of water on your bedside table overnight and feed it to plants in the morning.'
    ],
    meditation: 'Meditate for 15 minutes in the morning facing East, visualizing a golden white light surrounding you.',
    colors: luckySuggestions.colors,
    days,
    lifestyle: [
      'Refrain from using black/dark colors in your master bedroom.',
      'Develop a habit of writing down your goals in green ink.',
      'Avoid lending money on Saturdays.'
    ]
  };
}
