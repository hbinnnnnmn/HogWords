import { getTitleForLevel, LEVEL_THRESHOLDS, MAX_LEVEL } from '../constants/levels'

export function getLevelFromTotalExp(totalExp: number): number {
  let level = 1
  for (let lv = MAX_LEVEL; lv >= 1; lv--) {
    const threshold = LEVEL_THRESHOLDS[lv] ?? 0
    if (totalExp >= threshold) {
      level = lv
      break
    }
  }
  return level
}

export function getExpProgress(totalExp: number, level: number) {
  const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0
  const nextLevel = Math.min(level + 1, MAX_LEVEL)
  const nextThreshold =
    level >= MAX_LEVEL ? currentThreshold + 1 : (LEVEL_THRESHOLDS[nextLevel] ?? currentThreshold + 200)

  const expInLevel = totalExp - currentThreshold
  const expNeeded = nextThreshold - currentThreshold

  return {
    exp: expInLevel,
    expToNextLevel: expNeeded,
    title: getTitleForLevel(level),
  }
}

export function syncProfileFromExp(
  totalExp: number,
  base: { streakDays: number; achievements: string[]; lastStudyDate: string | null },
) {
  const level = getLevelFromTotalExp(totalExp)
  const { exp, expToNextLevel, title } = getExpProgress(totalExp, level)
  return {
    level,
    exp,
    expToNextLevel,
    title,
    totalExp,
    ...base,
  }
}
