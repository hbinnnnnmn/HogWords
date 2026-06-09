/**
 * Centralized mock database layer backed by localStorage.
 * Simulates a backend API for auth, vocabulary, and learning progress.
 */
import { SEED_VOCABULARY } from '../data/seedVocabulary'
import type {
  LearningHistoryEntry,
  LearningProgress,
  VocabularyItem,
  WizardUser,
} from '../types'

const DB_KEY = 'hogwords-mock-db'

export interface AuthRecord {
  uid: string
  email: string
  password: string
  profileComplete: boolean
  user: WizardUser
}

export interface MockDatabase {
  users: AuthRecord[]
  vocabulary: VocabularyItem[]
  progress: LearningProgress[]
  learningHistory: LearningHistoryEntry[]
  currentUserId: string | null
  duelWins: number
}

function defaultUser(uid: string, email: string): WizardUser {
  return {
    uid,
    email,
    name: '',
    house: 'Gryffindor',
    wandType: '',
    level: 1,
    title: 'Apprentice Wizard',
    xp: 0,
    nextLevelXp: 100,
    streakDays: 0,
    galleons: 50,
    achievements: [],
    lastStudyDate: null,
    totalExp: 0,
    dailyQuestCompleted: false,
    dailyQuestDate: null,
  }
}

export function createEmptyDatabase(): MockDatabase {
  return {
    users: [],
    vocabulary: SEED_VOCABULARY.map((v) => ({ ...v, status: 'new' as const })),
    progress: [],
    learningHistory: [],
    currentUserId: null,
    duelWins: 0,
  }
}

export function loadDatabase(): MockDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as MockDatabase
      return {
        ...createEmptyDatabase(),
        ...parsed,
        vocabulary: parsed.vocabulary?.length ? parsed.vocabulary : SEED_VOCABULARY,
      }
    }
  } catch {
    /* fall through */
  }

  // Migrate legacy hogwords-data if present
  try {
    const legacy = localStorage.getItem('hogwords-data')
    if (legacy) {
      const old = JSON.parse(legacy) as {
        profile: { totalExp: number; streakDays: number; achievements: string[]; lastStudyDate: string | null }
        vocabulary: VocabularyItem[]
        learningHistory: unknown[]
      }
      const db = createEmptyDatabase()
      db.vocabulary = old.vocabulary ?? SEED_VOCABULARY
      return db
    }
  } catch {
    /* ignore */
  }

  return createEmptyDatabase()
}

export function saveDatabase(db: MockDatabase) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function findUserByEmail(db: MockDatabase, email: string): AuthRecord | undefined {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function createAuthRecord(email: string, password: string): AuthRecord {
  const uid = `wizard_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  return {
    uid,
    email,
    password,
    profileComplete: false,
    user: defaultUser(uid, email),
  }
}

export function upsertProgress(
  progress: LearningProgress[],
  entry: {
    uid: string
    wordId: string
    status: LearningProgress['status']
    reviewCount?: number
    lastReviewed?: number
  },
): LearningProgress[] {
  const existing = progress.find(
    (p) => p.uid === entry.uid && p.wordId === entry.wordId,
  )
  const now = entry.lastReviewed ?? Date.now()

  if (existing) {
    return progress.map((p) =>
      p.progressId === existing.progressId
        ? {
            ...p,
            status: entry.status,
            reviewCount: entry.status === 'Review_Needed' ? p.reviewCount + 1 : p.reviewCount,
            lastReviewed: now,
          }
        : p,
    )
  }

  return [
    ...progress,
    {
      progressId: `prog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      uid: entry.uid,
      wordId: entry.wordId,
      status: entry.status,
      reviewCount: entry.status === 'Review_Needed' ? 1 : 0,
      lastReviewed: now,
    },
  ]
}
