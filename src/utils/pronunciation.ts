/**
 * Compare spoken transcript against the target word.
 * Returns a similarity score from 0–1 using normalized Levenshtein distance.
 */
export function pronunciationAccuracy(spoken: string, target: string): number {
  const a = normalizeForCompare(spoken)
  const b = normalizeForCompare(target)
  if (!a || !b) return 0
  if (a === b) return 1
  const distance = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return Math.max(0, 1 - distance / maxLen)
}

export function isSpellCastSuccessful(spoken: string, target: string): boolean {
  return pronunciationAccuracy(spoken, target) >= 0.8
}

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }
  return matrix[a.length][b.length]
}
