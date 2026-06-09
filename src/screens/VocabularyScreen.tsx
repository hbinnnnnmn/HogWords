import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Mic, Volume2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { PageContainer } from '../components/PageContainer'
import { ParticleBurst } from '../components/ParticleBurst'
import { ProgressBar } from '../components/ProgressBar'
import { StarParticles } from '../components/StarParticles'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import type { SessionMode } from '../types'
import { useAppStore } from '../store/useAppStore'
import { isSpellCastSuccessful } from '../utils/pronunciation'
import { playFizzleSound, playSparkleSound } from '../utils/sounds'

type IncantationResult = 'success' | 'fail' | null

export function VocabularyScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode: SessionMode = params.get('mode') === 'review' ? 'review' : 'new'

  const beginSession = useAppStore((s) => s.beginSession)
  const hasActiveSession = useAppStore((s) => s.hasActiveSession)
  const getSessionWords = useAppStore((s) => s.getSessionWords)
  const resetSession = useAppStore((s) => s.resetSession)
  const markWordMemorized = useAppStore((s) => s.markWordMemorized)
  const markWordReviewNeeded = useAppStore((s) => s.markWordReviewNeeded)
  const grantSpellCastXp = useAppStore((s) => s.grantSpellCastXp)

  const { speak, speaking } = useTextToSpeech()
  const stt = useSpeechRecognition()

  const words = getSessionWords()
  const [index, setIndex] = useState(0)
  const [shake, setShake] = useState(false)
  const [incantation, setIncantation] = useState<IncantationResult>(null)
  const [particles, setParticles] = useState(false)
  const [xpFloat, setXpFloat] = useState<number | null>(null)
  const [acted, setActed] = useState(false)

  useEffect(() => {
    if (!hasActiveSession()) {
      const ok = beginSession(mode)
      if (!ok) navigate('/home', { replace: true })
    }
  }, [beginSession, hasActiveSession, mode, navigate])

  useEffect(() => {
    if (stt.status === 'processing' && stt.result && words[index]) {
      const success = isSpellCastSuccessful(stt.result.transcript, words[index].word)
      if (success) {
        setIncantation('success')
        setParticles(true)
        playSparkleSound()
        const xp = grantSpellCastXp(words[index].id)
        setXpFloat(xp)
        setTimeout(() => {
          setParticles(false)
          setXpFloat(null)
        }, 1200)
      } else {
        setIncantation('fail')
        playFizzleSound()
      }
      stt.reset()
    }
  }, [stt.status, stt.result, words, index, grantSpellCastXp, stt])

  const current = words[index]
  const total = words.length

  // 데이터셋 예외 처리 한국어 대응
  if (!current) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center bg-bg p-8 text-center text-[#aaa]">
        {mode === 'review'
          ? '금지된 숲이 고요합니다 — 복습할 주문이 없습니다.'
          : '오늘 새로이 연마할 마법 주문이 없습니다.'}
      </div>
    )
  }

  const goNext = () => {
    setActed(false)
    setIncantation(null)
    if (index >= total - 1) {
      if (mode === 'new') navigate('/exam')
      else navigate('/home')
      return
    }
    setIndex((i) => i + 1)
  }

  const onMemorized = () => {
    if (acted) return
    const xp = markWordMemorized(current.id)
    setXpFloat(xp)
    setActed(true)
    setTimeout(() => {
      setXpFloat(null)
      goNext()
    }, 800)
  }

  const onReviewNeeded = () => {
    if (acted) return
    setShake(true)
    markWordReviewNeeded(current.id)
    setActed(true)
    setTimeout(() => {
      setShake(false)
      goNext()
    }, 500)
  }

  const toggleMic = () => {
    setIncantation(null)
    if (stt.isListening) stt.stopListening()
    else stt.startListening()
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <StarParticles count={40} />
      <PageContainer className="relative z-10 flex flex-1 flex-col" wide={false}>
        
        {/* 상단 진행 인디케이터 헤더 */}
        <header className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('강의실에서 나가시겠습니까? 현재 카드까지의 학습 진도가 유실될 수 있습니다.')) {
                resetSession()
                navigate(-1)
              }
            }}
            className="rounded-xl border border-white/10 p-2 text-[#aaa] hover:bg-white/5 transition-colors"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-[#AAAAAA] font-medium">
              {mode === 'review' ? '금지된 숲 · 복습' : '마법 강의실 · 신규'} · 진도: {index + 1} /{' '}
              {total} 주문
            </p>
            <ProgressBar value={index + 1} max={total} className="mt-2" />
          </div>
        </header>

        {/* 메인 단어 카드 레이아웃 (틀렸을 때 shake 애니메이션 작동) */}
        <div className={`relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center ${shake ? 'shake' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <GlassCard className="relative flex min-h-[480px] flex-col p-6">
                {/* 성공 시 불꽃 파티클 및 둥둥 뜨는 XP 텍스트 */}
                <ParticleBurst active={particles} />
                {xpFloat !== null && (
                  <span
                    className="pointer-events-none absolute right-6 top-6 z-20 font-display text-lg text-gold font-bold"
                    style={{ animation: 'xp-float 1s ease forwards' }}
                  >
                    +{xpFloat} XP
                  </span>
                )}

                {/* 품사 및 마법 카테고리 태그 */}
                <span className="mb-3 inline-block w-fit rounded-full bg-purple/30 px-3 py-1 text-xs text-purple font-semibold uppercase tracking-wider">
                  {current.partOfSpeech} · {current.category}
                </span>

                {/* 메인 영단어 및 TTS 재생 버튼 */}
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="font-display text-4xl text-white font-bold">{current.word}</h2>
                  <button
                    type="button"
                    onClick={() => speak(current.word)}
                    className={`rounded-full p-2.5 transition ${
                      speaking
                        ? 'scale-110 bg-gold/30 text-gold shadow-[0_0_16px_#D4AF37]'
                        : 'bg-white/5 text-[#aaa] hover:bg-white/10'
                    }`}
                    aria-label="발음 듣기"
                  >
                    <Volume2 size={22} />
                  </button>
                </div>

                {/* 한국어 뜻 의미 매핑 */}
                <p className="text-xl text-gold font-bold">{current.meaning}</p>
                <hr className="my-5 border-white/10" />
                
                {/* 예문 문장 레이아웃 */}
                <p className="text-base italic leading-relaxed text-white font-serif">"{current.exampleEn}"</p>
                <p className="mt-2 text-sm text-[#AAAAAA]">{current.exampleKo}</p>

                {/* 주문 영창 모드 (STT 음성 인식 마이크 블록) */}
                <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4">
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={!stt.supported}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wider transition ${
                      stt.isListening
                        ? 'animate-pulse bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-white/5 text-gold hover:bg-gold/10'
                    }`}
                  >
                    <Mic size={18} />
                    {stt.isListening ? '음성 분석 중… (말씀하세요)' : '주문 영창하기 (발음 연습)'}
                  </button>
                  
                  {/* 브라우저 호환성 예외 경고 메시지 */}
                  {!stt.supported && (
                    <p className="mt-2 text-center text-xs text-red-400/70">
                      * 음성 인식 기능은 Chrome 또는 Safari 브라우저가 필요합니다.
                    </p>
                  )}
                  
                  {/* 정오답 피드백 텍스트 */}
                  {incantation === 'success' && (
                    <p className="mt-3 text-center text-sm font-bold text-gold animate-bounce">
                      ⚡ 스펠 캐스팅 성공! 정밀 발음이 일치합니다.
                    </p>
                  )}
                  {incantation === 'fail' && (
                    <p className="mt-3 text-center text-sm font-bold text-red-400">
                      ❌ 주문 영창 실패 — 발음을 명확히 하여 다시 시도하세요.
                    </p>
                  )}
                </div>

                {/* 하단 암기 여부 최종 수동 평가 버튼 군 */}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                  <button
                    type="button"
                    disabled={acted}
                    onClick={onReviewNeeded}
                    className="btn-primary flex items-center justify-center gap-2 border border-red-500/30 bg-red-900/20 text-red-200 font-bold py-3 rounded-lg disabled:opacity-40 hover:bg-red-900/30 transition-all"
                  >
                    <X size={18} />
                    복습 필요 (헷갈림)
                  </button>
                  <button
                    type="button"
                    disabled={acted}
                    onClick={onMemorized}
                    className="btn-primary flex items-center justify-center gap-2 bg-gold text-[#0D0B1F] font-bold py-3 rounded-lg disabled:opacity-40 hover:opacity-90 transition-all"
                  >
                    <Check size={18} />
                    완전 암기 (마스터)
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </PageContainer>
    </div>
  )
}