import { create } from 'zustand'
import { ACHIEVEMENTS } from '../constants/achievements'
import { SEED_VOCABULARY } from '../data/seedVocabulary'
import {
  createAuthRecord,
  findUserByEmail,
  loadDatabase,
  saveDatabase,
  upsertProgress,
  type AuthRecord,
  type MockDatabase,
} from '../services/mockDatabase'
import type {
  DuelResult,
  ExamCommitResult,
  HogwartsHouse,
  LearningHistoryEntry,
  LearningProgress,
  PartOfSpeech,
  SessionMode,
  VocabularyItem,
  WizardProfile,
  WizardUser,
  WordCategory,
  WordStatus,
} from '../types'
import { todayKey, yesterdayKey } from '../utils/date'
import { syncProfileFromExp } from '../utils/level'

const EXAM_PASS_BONUS_XP = 15
const PERFECT_EXAM_BONUS_XP = 10
const SPELL_CAST_XP = 5
const MEMORIZED_XP = 5
const DUEL_QUESTIONS = 5

interface PersistedLearning {
  vocabulary: VocabularyItem[]
  learningHistory: LearningHistoryEntry[]
  progress: LearningProgress[]
}

function countMemorized(vocabulary: VocabularyItem[]) {
  return vocabulary.filter((v) => v.status === 'memorized').length
}

function countReview(vocabulary: VocabularyItem[]) {
  return vocabulary.filter((v) => v.status === 'review').length
}

function countTodayWords(history: LearningHistoryEntry[]) {
  const today = todayKey()
  return new Set(history.filter((h) => h.date === today).map((h) => h.wordId)).size
}

function countTotalStudied(history: LearningHistoryEntry[]) {
  return new Set(history.map((h) => h.wordId)).size
}

function updateStreak(lastStudyDate: string | null): number {
  const today = todayKey()
  const yesterday = yesterdayKey()
  if (lastStudyDate === today) return 0
  if (lastStudyDate === yesterday) return 1
  return -1
}

function checkAchievements(
  user: WizardUser,
  vocabulary: VocabularyItem[],
  duelWins: number,
): string[] {
  const memorized = countMemorized(vocabulary)
  const unlocked = new Set(user.achievements)

  if (memorized >= 10) unlocked.add('first_spell')
  if (user.level >= 5) unlocked.add('wizard_beginner')
  if (memorized >= 50) unlocked.add('word_wizard')
  if (user.streakDays >= 7) unlocked.add('unyielding')
  if (memorized >= 100) unlocked.add('hundred_spells')
  if (duelWins >= 10) unlocked.add('order_of_merlin')

  return ACHIEVEMENTS.map((a) => a.id).filter((id) => unlocked.has(id))
}

function userToProfile(user: WizardUser, history: LearningHistoryEntry[]): WizardProfile {
  return {
    level: user.level,
    exp: user.xp,
    expToNextLevel: user.nextLevelXp,
    totalWords: countTotalStudied(history),
    todayWords: countTodayWords(history),
    streakDays: user.streakDays,
    title: user.title,
    achievements: user.achievements,
    totalExp: user.totalExp,
    lastStudyDate: user.lastStudyDate,
  }
}

function applyExpToUser(
  user: WizardUser,
  expGain: number,
  vocabulary: VocabularyItem[],
  duelWins: number,
): WizardUser {
  const totalExp = user.totalExp + expGain
  const synced = syncProfileFromExp(totalExp, {
    streakDays: user.streakDays,
    achievements: user.achievements,
    lastStudyDate: user.lastStudyDate,
  })
  const achievements = checkAchievements(
    { ...user, ...synced, achievements: user.achievements },
    vocabulary,
    duelWins,
  )
  return {
    ...user,
    ...synced,
    xp: synced.exp,
    nextLevelXp: synced.expToNextLevel,
    achievements,
  }
}

function touchStreak(user: WizardUser): WizardUser {
  const today = todayKey()
  const delta = updateStreak(user.lastStudyDate)
  let streakDays = user.streakDays
  if (delta === 1) streakDays += 1
  else if (delta === -1) streakDays = 1
  else if (!user.lastStudyDate) streakDays = 1
  return { ...user, streakDays, lastStudyDate: today }
}

function persistAll(
  db: MockDatabase,
  learning: PersistedLearning,
  user: WizardUser | null,
) {
  const next: MockDatabase = {
    ...db,
    vocabulary: learning.vocabulary,
    progress: learning.progress,
    learningHistory: learning.learningHistory,
    duelWins: db.duelWins,
  }
  if (user) {
    next.users = db.users.map((u) =>
      u.uid === user.uid ? { ...u, user, profileComplete: u.profileComplete } : u,
    )
  }
  saveDatabase(next)
  return next
}

interface AppStore {
  hydrated: boolean
  db: MockDatabase
  user: WizardUser | null
  isAuthenticated: boolean
  profileComplete: boolean
  vocabulary: VocabularyItem[]
  learningHistory: LearningHistoryEntry[]
  progress: LearningProgress[]
  profile: WizardProfile

  sessionExp: number
  sessionWords: number
  sessionMode: SessionMode | null
  sessionWordIds: string[]
  sessionStartLevel: number

  hydrate: () => void
  login: (email: string, password: string) => { ok: boolean; error?: string }
  signUp: (email: string, password: string) => { ok: boolean; error?: string }
  loginWithOAuth: (provider: string) => void
  logout: () => void
  completeSorting: (name: string, house: HogwartsHouse, wandType: string) => void

  getReviewCount: () => number
  getNewWordsForSession: (limit?: number) => VocabularyItem[]
  getReviewWordsForSession: () => VocabularyItem[]
  beginSession: (mode: SessionMode) => boolean
  getSessionWords: () => VocabularyItem[]
  hasActiveSession: () => boolean
  commitExamResults: (results: Record<string, boolean>) => ExamCommitResult
  resetSession: () => void

  markWordMemorized: (wordId: string) => number
  markWordReviewNeeded: (wordId: string) => void
  grantSpellCastXp: (wordId: string) => number

  buildDuelQuestions: () => { prompt: string; options: string[]; correctIndex: number; wordId: string }[]
  completeDuel: (correct: number, total: number) => DuelResult

  addWord: (word: Omit<VocabularyItem, 'id' | 'status'>) => void
  updateWord: (id: string, word: Partial<VocabularyItem>) => void
  deleteWord: (id: string) => void
  resetAllData: () => void
}

function getCurrentAuth(db: MockDatabase): AuthRecord | null {
  if (!db.currentUserId) return null
  return db.users.find((u) => u.uid === db.currentUserId) ?? null
}

function buildInitialState(db: MockDatabase): Omit<AppStore, keyof AppStore> & Partial<AppStore> {
  const auth = getCurrentAuth(db)
  const user = auth?.user ?? null
  const history = db.learningHistory ?? []
  return {
    hydrated: false,
    db,
    user,
    isAuthenticated: !!auth,
    profileComplete: auth?.profileComplete ?? false,
    vocabulary: db.vocabulary,
    learningHistory: history,
    progress: db.progress,
    profile: user
      ? userToProfile(user, history)
      : {
          level: 1,
          exp: 0,
          expToNextLevel: 100,
          totalWords: 0,
          todayWords: 0,
          streakDays: 0,
          title: 'Apprentice Wizard',
          achievements: [],
          totalExp: 0,
          lastStudyDate: null,
        },
    sessionExp: 0,
    sessionWords: 0,
    sessionMode: null,
    sessionWordIds: [],
    sessionStartLevel: user?.level ?? 1,
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...(buildInitialState(loadDatabase()) as AppStore),

  hydrate: () => {
    const db = loadDatabase()
    const auth = getCurrentAuth(db)
    const user = auth?.user ?? null
    const learningHistory = db.learningHistory ?? []
    set({
      ...buildInitialState(db),
      hydrated: true,
      user,
      isAuthenticated: !!auth,
      profileComplete: auth?.profileComplete ?? false,
      learningHistory,
      profile: user ? userToProfile(user, learningHistory) : buildInitialState(db).profile!,
    })
  },

  login: (email, password) => {
    const db = get().db
    const record = findUserByEmail(db, email)
    if (!record) return { ok: false, error: 'No wizard found with that email.' }
    if (record.password !== password) return { ok: false, error: 'Incorrect password.' }
    const nextDb = { ...db, currentUserId: record.uid }
    saveDatabase(nextDb)
    set({
      db: nextDb,
      user: record.user,
      isAuthenticated: true,
      profileComplete: record.profileComplete,
      profile: userToProfile(record.user, get().learningHistory),
    })
    return { ok: true }
  },

  signUp: (email, password) => {
    const db = get().db
    if (findUserByEmail(db, email)) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const record = createAuthRecord(email, password)
    const nextDb: MockDatabase = {
      ...db,
      users: [...db.users, record],
      currentUserId: record.uid,
    }
    saveDatabase(nextDb)
    set({
      db: nextDb,
      user: record.user,
      isAuthenticated: true,
      profileComplete: false,
      profile: userToProfile(record.user, []),
    })
    return { ok: true }
  },

  loginWithOAuth: (provider) => {
    const email = `${provider.toLowerCase()}@ministry.network`
    const db = get().db
    let record = findUserByEmail(db, email)
    if (!record) {
      record = createAuthRecord(email, 'oauth')
      record.profileComplete = false
      db.users.push(record)
    }
    const nextDb = { ...db, currentUserId: record.uid }
    saveDatabase(nextDb)
    set({
      db: nextDb,
      user: record.user,
      isAuthenticated: true,
      profileComplete: record.profileComplete,
      profile: userToProfile(record.user, get().learningHistory),
    })
  },

  logout: () => {
    const db = { ...get().db, currentUserId: null }
    saveDatabase(db)
    set({
      db,
      user: null,
      isAuthenticated: false,
      profileComplete: false,
    })
  },

  completeSorting: (name, house, wandType) => {
    const { db, user, learningHistory } = get()
    if (!user) return
    const updated: WizardUser = {
      ...user,
      name,
      house,
      wandType,
      title: 'Apprentice Wizard',
    }
    const nextDb: MockDatabase = {
      ...db,
      users: db.users.map((u) =>
        u.uid === user.uid
          ? { ...u, user: updated, profileComplete: true }
          : u,
      ),
      currentUserId: user.uid,
    }
    saveDatabase(nextDb)
    set({
      db: nextDb,
      user: updated,
      profileComplete: true,
      profile: userToProfile(updated, learningHistory),
    })
  },

  getReviewCount: () => countReview(get().vocabulary),

  // 🛠️ [수정 포인트 1] 순수 새 단어가 고갈되면 복습이나 기존 단어를 재순환하여 반환
  getNewWordsForSession: (limit = 20) => {
    const vocab = get().vocabulary
    let targetWords = vocab.filter((v) => v.status === 'new')

    // 만약 'new' 단어가 다 떨어졌다면 'review' 상태 단어 공급
    if (targetWords.length === 0) {
      targetWords = vocab.filter((v) => v.status === 'review')
    }

    // 그것도 없다면 전체 단어장을 순환 배치하여 학습이 멈추지 않도록 처리
    if (targetWords.length === 0) {
      targetWords = vocab
    }

    return targetWords.slice(0, limit)
  },

  getReviewWordsForSession: () => get().vocabulary.filter((v) => v.status === 'review'),

  beginSession: (mode) => {
    const words =
      mode === 'review'
        ? get().getReviewWordsForSession()
        : get().getNewWordsForSession(20)
    if (words.length === 0) return false
    set({
      sessionMode: mode,
      sessionWordIds: words.map((w) => w.id),
      sessionStartLevel: get().user?.level ?? 1,
      sessionExp: 0,
      sessionWords: 0,
    })
    return true
  },

  getSessionWords: () => {
    const ids = new Set(get().sessionWordIds)
    return get().vocabulary.filter((v) => ids.has(v.id))
  },

  hasActiveSession: () => get().sessionWordIds.length > 0,

  markWordMemorized: (wordId) => {
    const { db, user, vocabulary, learningHistory, progress } = get()
    if (!user) return 0

    const vocabularyNext = vocabulary.map((v) =>
      v.id === wordId ? { ...v, status: 'memorized' as WordStatus } : v,
    )
    const progressNext = upsertProgress(progress, {
      uid: user.uid,
      wordId,
      status: 'Memorized',
    })
    const history: LearningHistoryEntry[] = [
      ...learningHistory,
      { date: todayKey(), wordId, result: 'memorized', expGained: MEMORIZED_XP },
    ]
    let userNext = touchStreak(user)
    userNext = applyExpToUser(userNext, MEMORIZED_XP, vocabularyNext, db.duelWins)

    const nextDb = persistAll(db, { vocabulary: vocabularyNext, learningHistory: history, progress: progressNext }, userNext)
    set({
      db: nextDb,
      user: userNext,
      vocabulary: vocabularyNext,
      learningHistory: history,
      progress: progressNext,
      profile: userToProfile(userNext, history),
      sessionExp: get().sessionExp + MEMORIZED_XP,
      sessionWords: get().sessionWords + 1,
    })
    return MEMORIZED_XP
  },

  markWordReviewNeeded: (wordId) => {
    const { db, user, vocabulary, progress } = get()
    if (!user) return

    const vocabularyNext = vocabulary.map((v) =>
      v.id === wordId ? { ...v, status: 'review' as WordStatus } : v,
    )
    const progressNext = upsertProgress(progress, {
      uid: user.uid,
      wordId,
      status: 'Review_Needed',
    })
    const nextDb = persistAll(
      db,
      { vocabulary: vocabularyNext, learningHistory: get().learningHistory, progress: progressNext },
      user,
    )
    set({ db: nextDb, vocabulary: vocabularyNext, progress: progressNext })
  },

  grantSpellCastXp: (wordId) => {
    const { db, user, vocabulary, learningHistory } = get()
    if (!user) return 0

    const history: LearningHistoryEntry[] = [
      ...learningHistory,
      { date: todayKey(), wordId, result: 'spell_cast', expGained: SPELL_CAST_XP },
    ]
    let userNext = applyExpToUser(touchStreak(user), SPELL_CAST_XP, vocabulary, db.duelWins)
    if (!userNext.achievements.includes('first_spell_cast')) {
      userNext = {
        ...userNext,
        achievements: [...userNext.achievements, 'first_spell_cast'],
      }
    }
    const nextDb = persistAll(
      db,
      { vocabulary, learningHistory: history, progress: get().progress },
      userNext,
    )
    set({
      db: nextDb,
      user: userNext,
      learningHistory: history,
      profile: userToProfile(userNext, history),
      sessionExp: get().sessionExp + SPELL_CAST_XP,
    })
    return SPELL_CAST_XP
  },

  commitExamResults: (results) => {
    const startLevel = get().sessionStartLevel
    const wordIds = get().sessionWordIds
    let { db, user, vocabulary, learningHistory, progress } = get()
    if (!user) {
      return { passed: false, wordsCompleted: 0, expGained: 0, leveledUp: false }
    }

    let sessionExp = 0
    let correctCount = 0

    for (const wordId of wordIds) {
      const memorized = results[wordId] === true
      if (memorized) correctCount += 1
      const expGain = memorized ? MEMORIZED_XP : 1
      sessionExp += expGain
      const newStatus: WordStatus = memorized ? 'memorized' : 'review'
      vocabulary = vocabulary.map((v) => (v.id === wordId ? { ...v, status: newStatus } : v))
      progress = upsertProgress(progress, {
        uid: user.uid,
        wordId,
        status: memorized ? 'Memorized' : 'Review_Needed',
      })
      learningHistory = [
        ...learningHistory,
        {
          date: todayKey(),
          wordId,
          result: memorized ? 'memorized' : 'failed',
          expGained: expGain,
        },
      ]
      user = applyExpToUser(touchStreak(user), expGain, vocabulary, db.duelWins)
    }

    const total = wordIds.length
    const perfect = correctCount === total && total > 0
    sessionExp += EXAM_PASS_BONUS_XP
    if (perfect) sessionExp += PERFECT_EXAM_BONUS_XP
    const bonusExp = EXAM_PASS_BONUS_XP + (perfect ? PERFECT_EXAM_BONUS_XP : 0)
    user = applyExpToUser(user, bonusExp, vocabulary, db.duelWins)

    const nextDb = persistAll(db, { vocabulary, learningHistory, progress }, user)
    const leveledUp = user.level > startLevel

    set({
      db: nextDb,
      user,
      vocabulary,
      learningHistory,
      progress,
      profile: userToProfile(user, learningHistory),
      sessionExp,
      sessionWords: total,
      sessionWordIds: [],
      sessionMode: null,
    })

    return {
      passed: true,
      wordsCompleted: total,
      expGained: sessionExp,
      leveledUp,
      newLevel: user.level,
      newTitle: user.title,
      examScore: { correct: correctCount, total },
    }
  },

  resetSession: () =>
    set({
      sessionExp: 0,
      sessionWords: 0,
      sessionWordIds: [],
      sessionMode: null,
      sessionStartLevel: get().user?.level ?? 1,
    }),

  buildDuelQuestions: () => {
    const vocab = get().vocabulary
    const pool = [...vocab].sort(() => Math.random() - 0.5).slice(0, DUEL_QUESTIONS)
    return pool.map((word) => {
      const distractors = vocab
        .filter((v) => v.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((v) => v.word)
      const options = [...distractors, word.word].sort(() => Math.random() - 0.5)
      const blanked = word.exampleEn.replace(new RegExp(word.word, 'i'), '_____')
      return {
        wordId: word.id,
        prompt: blanked || `Meaning: ${word.meaning}`,
          options,
          correctIndex: options.indexOf(word.word),
      }
    })
  },

  // 🛠️ [수정 포인트 2] 미니게임 클리어 시 강제로 중첩된 세션 차단막을 청소
  completeDuel: (correct, total) => {
    const { db, user, vocabulary, learningHistory } = get()
    if (!user) {
      return { correct, total, xpEarned: 0, galleonsEarned: 0, dailyQuestComplete: false }
    }

    const xpEarned = correct * 10 + (correct === total ? 25 : 0)
    const galleonsEarned = correct * 5
    let userNext = applyExpToUser(touchStreak(user), xpEarned, vocabulary, db.duelWins)
    userNext = {
      ...userNext,
      galleons: userNext.galleons + galleonsEarned,
      dailyQuestCompleted: true,
      dailyQuestDate: todayKey(),
    }
    if (correct === total && !userNext.achievements.includes('duel_champion')) {
      userNext = {
        ...userNext,
        achievements: [...userNext.achievements, 'first_spell_cast'],
      }
    }

    const duelWins = db.duelWins + 1
    userNext = {
      ...userNext,
      achievements: checkAchievements(userNext, vocabulary, duelWins),
    }

    const nextDb: MockDatabase = { ...db, duelWins }
    persistAll(nextDb, { vocabulary, learningHistory, progress: get().progress }, userNext)
    saveDatabase({ ...nextDb, duelWins })

    set({
      db: { ...nextDb, duelWins },
      user: userNext,
      profile: userToProfile(userNext, learningHistory),
      // 미니게임 종료 시 세션 상태를 명시적으로 초기화하여 홈 화면 컴포넌트 락 해제
      sessionWordIds: [],
      sessionMode: null,
    })

    return {
      correct,
      total,
      xpEarned,
      galleonsEarned,
      dailyQuestComplete: true,
    }
  },

  addWord: (word) => {
    const id = String(Date.now())
    const vocabulary = [...get().vocabulary, { ...word, id, status: 'new' as const }]
    const db = persistAll(
      get().db,
      { vocabulary, learningHistory: get().learningHistory, progress: get().progress },
      get().user,
    )
    set({ vocabulary, db })
  },

  updateWord: (id, patch) => {
    const vocabulary = get().vocabulary.map((v) => (v.id === id ? { ...v, ...patch } : v))
    const db = persistAll(
      get().db,
      { vocabulary, learningHistory: get().learningHistory, progress: get().progress },
      get().user,
    )
    set({ vocabulary, db })
  },

  deleteWord: (id) => {
    const vocabulary = get().vocabulary.filter((v) => v.id !== id)
    const db = persistAll(
      get().db,
      { vocabulary, learningHistory: get().learningHistory, progress: get().progress },
      get().user,
    )
    set({ vocabulary, db })
  },

  resetAllData: () => {
    const db = loadDatabase()
    const freshVocab = SEED_VOCABULARY.map((v) => ({ ...v, status: 'new' as const }))
    const nextDb: MockDatabase = { ...db, vocabulary: freshVocab, progress: [], duelWins: 0 }
    saveDatabase(nextDb)
    const user = get().user
    if (user) {
      const resetUser: WizardUser = {
        ...user,
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        totalExp: 0,
        title: 'Apprentice Wizard',
        streakDays: 0,
        galleons: 50,
        achievements: [],
        lastStudyDate: null,
        dailyQuestCompleted: false,
        dailyQuestDate: null,
      }
      nextDb.users = nextDb.users.map((u) =>
        u.uid === user.uid ? { ...u, user: resetUser } : u,
      )
      saveDatabase(nextDb)
      set({
        db: nextDb,
        user: resetUser,
        vocabulary: freshVocab,
        learningHistory: [],
        progress: [],
        profile: userToProfile(resetUser, []),
        sessionExp: 0,
        sessionWords: 0,
        sessionWordIds: [],
        sessionMode: null,
      })
    } else {
      set({
        db: nextDb,
        vocabulary: freshVocab,
        learningHistory: [],
        progress: [],
      })
    }
  },
}))

export type { PartOfSpeech, WordCategory }