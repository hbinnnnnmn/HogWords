/** 시험 합격에 필요한 정답 비율 */
export const EXAM_PASS_RATIO = 0.7

export function isExamPassed(correctCount: number, total: number): boolean {
  if (total === 0) return false
  return correctCount / total >= EXAM_PASS_RATIO
}

export function requiredCorrectCount(total: number): number {
  return Math.ceil(total * EXAM_PASS_RATIO)
}
