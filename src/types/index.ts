/** Hogwarts house assignment from the Sorting Hat ceremony */
export type HogwartsHouse = 'Gryffindor' | 'Slytherin' | 'Ravenclaw' | 'Hufflepuff'

export type WordStatus = 'memorized' | 'review' | 'new'
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'etc.'

/** Vocabulary categories aligned with the Hogwarts curriculum */
export type WordCategory =
  | 'Spells'
  | 'Characters'
  | 'Places'
  | 'Magical Creatures'
  | 'General'

export type ProgressStatus = 'Memorized' | 'Review_Needed'

/** Wizard profile — maps to the database User schema */
export interface WizardUser {
  uid: string
  email: string
  name: string
  house: HogwartsHouse
  wandType: string
  level: number
  title: string
  xp: number
  nextLevelXp: number
  streakDays: number
  galleons: number
  achievements: string[]
  lastStudyDate: string | null
  totalExp: number
  dailyQuestCompleted: boolean
  dailyQuestDate: string | null
}

export interface VocabularyItem {
  id: string
  word: string
  partOfSpeech: PartOfSpeech
  meaning: string
  exampleEn: string
  exampleKo: string
  category: WordCategory
  status: WordStatus
}

/** Forbidden Forest review log entry */
export interface LearningProgress {
  progressId: string
  uid: string
  wordId: string
  status: ProgressStatus
  reviewCount: number
  lastReviewed: number
}

export interface LearningHistoryEntry {
  date: string
  wordId: string
  result: 'memorized' | 'failed' | 'spell_cast'
  expGained: number
}

export type SessionMode = 'new' | 'review'

export interface SessionResult {
  wordsCompleted: number
  expGained: number
  leveledUp: boolean
  newLevel?: number
  newTitle?: string
  examScore?: { correct: number; total: number }
}

export interface ExamCommitResult extends SessionResult {
  passed: boolean
}

export type AchievementId =
  | 'first_spell_cast'
  | 'first_spell'
  | 'wizard_beginner'
  | 'word_wizard'
  | 'unyielding'
  | 'hundred_spells'
  | 'order_of_merlin'
  | 'duel_champion'

/** Legacy alias kept for gradual migration inside the store */
export interface WizardProfile {
  level: number
  exp: number
  expToNextLevel: number
  totalWords: number
  todayWords: number
  streakDays: number
  title: string
  achievements: string[]
  totalExp: number
  lastStudyDate: string | null
}

export interface DuelQuestion {
  wordId: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface DuelResult {
  correct: number
  total: number
  xpEarned: number
  galleonsEarned: number
  dailyQuestComplete: boolean
}
