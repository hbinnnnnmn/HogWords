import type { VocabularyItem } from '../types'

export interface ExamQuestion {
  wordId: string
  word: string
  partOfSpeech: string
  options: string[]
  correctIndex: number
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildExamQuestions(
  sessionWords: VocabularyItem[],
  allWords: VocabularyItem[],
): ExamQuestion[] {
  const pool = allWords.filter((w) => w.meaning.trim().length > 0)

  return shuffle(sessionWords).map((word) => {
    const distractors = shuffle(
      pool.filter((w) => w.id !== word.id).map((w) => w.meaning),
    ).slice(0, 3)

    const options = shuffle([word.meaning, ...distractors])
    const correctIndex = options.indexOf(word.meaning)

    return {
      wordId: word.id,
      word: word.word,
      partOfSpeech: word.partOfSpeech,
      options,
      correctIndex,
    }
  })
}
