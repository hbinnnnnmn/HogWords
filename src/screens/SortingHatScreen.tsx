import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { HOUSES, resolveHouseFromAnswers, SORTING_QUESTIONS } from '../constants/houses'
import {
  buildWandDescription,
  randomWand,
  WAND_CORES,
  WAND_LENGTHS,
  WAND_WOODS,
} from '../constants/wands'
import { MagicalInput } from '../components/MagicalInput'
import { StarParticles } from '../components/StarParticles'
import type { HogwartsHouse } from '../types'
import { useAppStore } from '../store/useAppStore'

type Phase = 'questionnaire' | 'ceremony' | 'profile'

export function SortingHatScreen() {
  const navigate = useNavigate()
  const completeSorting = useAppStore((s) => s.completeSorting)

  const [phase, setPhase] = useState<Phase>('questionnaire')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<HogwartsHouse[]>([])
  const [assignedHouse, setAssignedHouse] = useState<HogwartsHouse | null>(null)
  const [name, setName] = useState('')
  const [wood, setWood] = useState<string>(WAND_WOODS[0])
  const [core, setCore] = useState<string>(WAND_CORES[0])
  const [length, setLength] = useState<string>(WAND_LENGTHS[2])
  const [ceremonyText, setCeremonyText] = useState('')

  const houseTheme = assignedHouse ? HOUSES[assignedHouse] : null

  // 기숙사 설문지가 끝났을 때 호그와트 분위기 대사 제어
  const finishQuestionnaire = (finalAnswers: HogwartsHouse[]) => {
    const house = resolveHouseFromAnswers(finalAnswers)
    setAssignedHouse(house)
    setPhase('ceremony')
    setCeremonyText('흠... 어렵군... 아주 어려워...')
    setTimeout(() => setCeremonyText(`음, 여기가 좋겠어... 바로... ${house.toUpperCase()}!`), 1800)
    setTimeout(() => setPhase('profile'), 3200)
  }

  const pickAnswer = (house: HogwartsHouse) => {
    const next = [...answers, house]
    setAnswers(next)
    if (qIndex >= SORTING_QUESTIONS.length - 1) {
      finishQuestionnaire(next)
      return
    }
    setQIndex((i) => i + 1)
  }

  // 무작위 배정 선택 시 대사 처리
  const randomAssign = () => {
    const houses: HogwartsHouse[] = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff']
    const house = houses[Math.floor(Math.random() * houses.length)]
    setAssignedHouse(house)
    setPhase('ceremony')
    setCeremonyText('분류모자가 회전하며 당신의 운명을 고심하고 있습니다...')
    setTimeout(() => setCeremonyText(`결정했다! 바로... ${house.toUpperCase()}!`), 2000)
    setTimeout(() => setPhase('profile'), 3500)
  }

  const wandPreview = useMemo(
    () => buildWandDescription(wood, core, length),
    [wood, core, length],
  )

  const finish = () => {
    if (!assignedHouse || !name.trim()) return
    completeSorting(name.trim(), assignedHouse, wandPreview)
    navigate('/home', { replace: true })
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col bg-bg"
      style={
        houseTheme
          ? ({ '--house-accent': houseTheme.accent } as React.CSSProperties)
          : undefined
      }
    >
      <StarParticles count={60} />
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 py-10">
        <span className="text-6xl">🎩</span>
        <h1 className="mt-4 font-display text-3xl text-gold text-glow-gold">
          분류모자 배정 의식
        </h1>

        <AnimatePresence mode="wait">
          {/* Phase 1: 질의응답 (기숙사 테스트) */}
          {phase === 'questionnaire' && (
            <motion.div
              key="q"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 w-full max-w-md"
            >
              <GlassCard className="p-6">
                <p className="text-sm text-purple font-medium">
                  질문 {qIndex + 1} / {SORTING_QUESTIONS.length}
                </p>
                <h2 className="mt-3 text-lg font-medium leading-snug">
                  {SORTING_QUESTIONS[qIndex].question}
                </h2>
                <div className="mt-6 space-y-3">
                  {SORTING_QUESTIONS[qIndex].options.map((opt) => (
                    <button
                      key={opt.text}
                      type="button"
                      onClick={() => pickAnswer(opt.house)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm transition hover:border-gold/40 hover:bg-gold/10"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={randomAssign}
                  className="mt-6 w-full text-center text-sm text-[#888] hover:text-gold transition-colors"
                >
                  질문을 건너뛰고 모자의 무작위 선택을 따르기 ✨
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* Phase 2: 배정 세레머니 (모자 고심 애니메이션) */}
          {phase === 'ceremony' && (
            <motion.div
              key="ceremony"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 text-center"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl"
              >
                🎩
              </motion.div>
              <p className="mt-6 font-display text-xl text-gold font-medium">{ceremonyText}</p>
              {assignedHouse && (
                <p className="mt-4 text-5xl animate-pulse">{HOUSES[assignedHouse].emblem}</p>
              )}
            </motion.div>
          )}

          {/* Phase 3: 배정 완료 및 마법사 프로필/지팡이 설정 */}
          {phase === 'profile' && assignedHouse && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 w-full max-w-md"
            >
              <GlassCard
                className="p-6"
                style={{
                  borderColor: `${HOUSES[assignedHouse].accent}55`,
                  boxShadow: `0 0 24px ${HOUSES[assignedHouse].primary}44`,
                }}
              >
                <div className="text-center">
                  <span className="text-5xl">{HOUSES[assignedHouse].emblem}</span>
                  <p className="mt-2 font-display text-2xl font-bold" style={{ color: HOUSES[assignedHouse].accent }}>
                    {assignedHouse === 'Gryffindor' && '그리핀도르 (Gryffindor)'}
                    {assignedHouse === 'Slytherin' && '슬리데린 (Slytherin)'}
                    {assignedHouse === 'Ravenclaw' && '래번클로 (Ravenclaw)'}
                    {assignedHouse === 'Hufflepuff' && '후플푸프 (Hufflepuff)'}
                  </p>
                  <p className="text-sm text-[#aaa] italic mt-1">
                    &quot;{HOUSES[assignedHouse].motto}&quot;
                  </p>
                </div>

                <div className="mt-6">
                  <label className="block text-sm text-[#aaa] font-medium">마법사 이름 등록</label>
                  <MagicalInput
                    className="mt-2"
                    placeholder="당신의 마법사 이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gold">올리밴더 전용 지팡이 선택</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {/* 나무 종류 재질 */}
                    <select
                      value={wood}
                      onChange={(e) => setWood(e.target.value)}
                      className="bg-[#11101E] text-white border border-white/10 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-gold/50"
                    >
                      {WAND_WOODS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    {/* 핵심 마법 물질 */}
                    <select
                      value={core}
                      onChange={(e) => setCore(e.target.value)}
                      className="bg-[#11101E] text-white border border-white/10 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-gold/50"
                    >
                      {WAND_CORES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {/* 지팡이 길이 */}
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="bg-[#11101E] text-white border border-white/10 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-gold/50"
                    >
                      {WAND_LENGTHS.map((l) => (
                        <option key={l} value={l}>
                          {l} 인치
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const wand = randomWand()
                      const match = wand.match(/^(.+), (.+), (\d+) inches$/)
                      if (match) {
                        setWood(match[1])
                        setCore(match[2])
                        setLength(match[3])
                      }
                    }}
                    className="mt-2 text-xs text-purple hover:underline inline-block"
                  >
                    🪄 지팡이 무작위 조합 생성하기
                  </button>
                  
                  {/* 선택된 오버뷰 프리뷰 표기 레이아웃 */}
                  <p className="mt-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-[#ccc] border border-white/5 font-mono text-center">
                    {wandPreview}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!name.trim()}
                  onClick={finish}
                  className="btn-primary mt-8 w-full bg-gold text-[#0D0B1F] font-bold py-3 rounded-lg transition-all disabled:opacity-40"
                >
                  연회장 입장하기 (시작)
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}