export const CORE_NUMBERS_INFO: Record<number, { name: string; meaning: string; strength: string }> = {
  1: {
    name: 'The Leader',
    meaning: 'Independence, leadership, pioneering spirit, ambition, and strong willpower.',
    strength: 'Highly driven, self-sufficient, innovative, and courageous.',
  },
  2: {
    name: 'The Peacemaker',
    meaning: 'Cooperation, diplomacy, sensitivity, intuition, and balance.',
    strength: 'Empathetic, supportive, detailed-oriented, and harmonious.',
  },
  3: {
    name: 'The Creative Communicator',
    meaning: 'Self-expression, verbal communication, social life, optimism, and artistic talent.',
    strength: 'Charismatic, imaginative, joyful, and highly expressive.',
  },
  4: {
    name: 'The Builder',
    meaning: 'Practicality, discipline, hard work, system, and stability.',
    strength: 'Organized, logical, loyal, patient, and highly dependable.',
  },
  5: {
    name: 'The Free Spirit',
    meaning: 'Freedom, adaptability, change, adventure, and communication.',
    strength: 'Versatile, energetic, curious, and resilient.',
  },
  6: {
    name: 'The Nurturer',
    meaning: 'Responsibility, love, home, community service, and balance.',
    strength: 'Compassionate, artistic, protective, and domestic.',
  },
  7: {
    name: 'The Seeker',
    meaning: 'Analysis, spirituality, wisdom, research, and solitude.',
    strength: 'Intellectual, deep thinker, intuitive, and philosophical.',
  },
  8: {
    name: 'The Powerhouse',
    meaning: 'Material success, authority, balance of spiritual and physical power, judgment.',
    strength: 'Professional, efficient, strong-willed, and highly capable.',
  },
  9: {
    name: 'The Humanitarian',
    meaning: 'Universal love, compassion, selflessness, completion, and creativity.',
    strength: 'Generous, tolerant, artistic, and idealistic.',
  },
  11: {
    name: 'Master Number 11: The Intuitive Visionary',
    meaning: 'Highly charged spiritual insight, intuition, sensitivity, and enlightenment.',
    strength: 'Highly intuitive, inspiring, artistic, and charismatic.',
  },
  22: {
    name: 'Master Number 22: The Master Builder',
    meaning: 'Translating huge spiritual visions into practical physical realities.',
    strength: 'Extremely capable, practical, visionary, and pragmatic.',
  },
  33: {
    name: 'Master Number 33: The Master Teacher',
    meaning: 'Universal guidance, intense compassion, spiritual protection, and nurturing.',
    strength: 'Devoted, guidance-oriented, healing, and inspiring.',
  },
};

export interface AIReportInput {
  name: string;
  dobStr: string;
  lifePath: number;
  destiny: number;
  expression: number;
  soulUrge: number;
  personality: number;
  namePersonality: number;
  attitudeNum: number;
  maturityNum: number;
  loShuArrows: { name: string; type: 'strength' | 'weakness' | 'none'; numbers: number[] }[];
  loShuDominant: number[];
  missingNumbers: number[];
  vedicStrongPlanets: string[];
  vedicWeakPlanets: string[];
  vedicPlanetStrengthPct: number;
  workingNumbers: number[];
  personalYear: number;
  remedies: { mantras: string[]; colors: string[]; habits: string[] };
}

export function generateAIReport(input: AIReportInput): string {
  const lpDesc = CORE_NUMBERS_INFO[input.lifePath] || { name: 'Unknown', meaning: 'Universal vibration.', strength: 'Adaptability.' };
  const destDesc = CORE_NUMBERS_INFO[input.destiny] || { name: 'Unknown', meaning: 'Destiny path.', strength: 'Action.' };
  const exprDesc = CORE_NUMBERS_INFO[input.expression] || { name: 'Unknown', meaning: 'Expression path.', strength: 'Communication.' };

  const strongArrows = input.loShuArrows.filter(a => a.type === 'strength').map(a => a.name).join(', ') || 'basic';
  const missingNumbersStr = input.missingNumbers.length > 0 ? input.missingNumbers.join(', ') : 'none';

  return `### Divya Urja Professional Numerology Audit

Dear ${input.name}, 

Based on your birth signature profile calculated for the Date of Birth **${input.dobStr}**, you possess a highly unique vibrational design led by **Psychic/Personality/Driver Number ${input.personality}** and **Destiny/Conductor Number ${input.destiny}**.

#### Part 1: Core Vibrational Architecture
Your **Life Path Number is ${input.lifePath}** (${lpDesc.name}). This governs your primary lesson and path of evolution in this incarnation. ${lpDesc.meaning} In daily life, this manifests as: *${lpDesc.strength}*

Your **Destiny Number is ${input.destiny}** (${destDesc.name}). This represents your overall path, goals, and opportunities, while your **Expression Number is ${input.expression}** (${exprDesc.name}) calculated from the letters of your full name. ${exprDesc.meaning}

The emotional blueprint of your soul is guided by **Soul Urge Number ${input.soulUrge}** and **Name Personality Number ${input.namePersonality}**, showing a beautiful synergy between what you desire internally versus what you project externally to others.

#### Part 2: Grid Interpretations
- **Lo Shu Grid**: Mapping your DOB digits reveals a strong presence in the **${strongArrows} planes**. The dominant energy is focused around the number ${input.loShuDominant.join(', ')}. Your grid is missing the number ${missingNumbersStr}, which indicates that you need to consciously build qualities like ${input.missingNumbers.map(n => n === 8 ? 'Discipline' : n === 5 ? 'Stability/Communication' : n === 6 ? 'Family Responsibility' : 'Foresight').join(', ') || 'adaptability'} using our custom Vastu and habit remedies.
- **Vedic Grid Planetary Strength**: Your overall planetary charge is **${input.vedicPlanetStrengthPct}%**. The strong planetary entities are **${input.vedicStrongPlanets.join(', ')}**, bringing you luck, expansion, and sharp communication. The planetary nodes **${input.vedicWeakPlanets.join(', ') || 'none'}** are currently dormant, meaning you must perform daily donations to strengthen their positions.
- **Pythagorean Psychomatrix**: Your working numbers are **${input.workingNumbers.join(', ')}**. The physical, emotional, and mental planes represent a balanced structure, reflecting high resilience.

#### Part 3: Secondary Calculators & Suggestions
- **Name Vibration**: Your current name spelling vibrates to the compound value **${input.workingNumbers[0] || 0}** which reduces to **${input.expression}**. This shows a ${input.expression === input.destiny ? 'highly harmonious' : 'neutral'} alignment with your core path.
- **Remedial Path**: Practice chanting the mantra **"${input.remedies.mantras[0]}"** 108 times daily. Wear colors like **${input.remedies.colors.join(', ')}** to boost your luck percentage and maintain the daily habit: *"${input.remedies.habits[0]}"*

This report offers a spiritual blueprint. Use these insights and remedies to navigate your Personal Year (${input.personalYear}) with strength, clarity, and peace.`;
}
