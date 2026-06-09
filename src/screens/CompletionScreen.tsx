import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'

interface CompleteState {
  leveledUp?: boolean
  examScore?: { correct: number; total: number }
}

export function CompletionScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const sessionExp = useAppStore((s) => s.sessionExp)
  const sessionWords = useAppStore((s) => s.sessionWords)
  const profile = useAppStore((s) => s.profile)
  const resetSession = useAppStore((s) => s.resetSession)

  const state = (location.state as CompleteState) ?? {}
  const leveledUp = Boolean(state.leveledUp)
  const examScore = state.examScore

  return (
    <motion.div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-bg px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-white/10"
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <StarParticles count={50} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 max-w-lg"
      >
        <p className="text-7xl">🎉</p>
        <h1 className="mt-6 font-display text-4xl text-gold">시험 합격 · 학습 완료!</h1>

        {examScore && (
          <p className="mt-4 text-lg text-white">
            시험 성적: {examScore.correct} / {examScore.total} 정답
          </p>
        )}

        <p className="mt-6 text-2xl text-white">+{sessionExp} XP</p>
        <p className="mt-2 text-lg text-[#AAAAAA]">{sessionWords}단어 반영</p>

        {leveledUp && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            className="mt-8 rounded-xl border border-gold bg-gold/20 px-8 py-5"
          >
            <p className="font-display text-3xl text-gold text-glow-gold">Level Up!</p>
            <p className="mt-2 text-lg">
              Lv.{profile.level} {profile.title}
            </p>
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => {
            resetSession()
            navigate('/home')
          }}
          className="btn-primary mt-12 min-w-[280px] bg-gold text-[#0D0B1F]"
        >
          메인으로 돌아가기
        </button>
      </motion.div>
    </motion.div>
  )
}
