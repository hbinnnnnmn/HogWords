/** Cumulative XP required to reach each level */
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 50,
  3: 120,
  4: 200,
  5: 300,
  6: 380,
  7: 460,
  8: 540,
  9: 620,
  10: 800,
  11: 900,
  12: 1000,
  13: 1100,
  14: 1300,
  15: 1500,
  16: 1700,
  17: 1900,
  18: 2100,
  19: 2300,
  20: 2500,
}

export const MAX_LEVEL = 20

export function getTitleForLevel(level: number): string {
  if (level >= 20) return 'Master Wizard'
  if (level >= 15) return 'Advanced Wizard'
  if (level >= 10) return 'Intermediate Wizard'
  if (level >= 5) return 'Apprentice Wizard'
  return 'Beginner Wizard'
}
