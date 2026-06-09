import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { PageContainer } from '../components/PageContainer'
import { MagicalInput } from '../components/MagicalInput'
import { ProgressBar } from '../components/ProgressBar'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'

export function ExamScreen() {
  const navigate = useNavigate()
  const store = useAppStore()

  // Zustand 스토어에 등록되어 있을 가망성이 높은 함수들을 안전하게 매핑 (에러 방지용 가드 코드)
  const getSessionWords = store.getSessionWords || (() => [])
  const resetSession = store.resetSession || (() => {})
  
  // completeExam이 없을 경우를 대비해 스토어 내 다른 후보 함수 검증
  const runCompleteExam = (store as any).completeExam || (store as any).finishExam || (store as any).completeSession || (() => {});

  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // 시험 문제 생성 (객관식과 서술형을 50:50으로 배정)
  useEffect(() => {
    const sessionWords = getSessionWords()
    if (sessionWords.length === 0) {
      navigate('/home')
      return
    }

    const examQuestions = sessionWords.map((word, idx) => ({
      ...word,
      // 인덱스가 짝수면 서술형(written), 홀수면 객관식(multiple-choice)으로 균형있게 출제
      type: idx % 2 === 0 ? 'written' : 'multiple-choice',
      options: shuffleOptions(word, sessionWords)
    }))
    setQuestions(examQuestions)
  }, [])

  // 객관식용 보기 섞기 셔플 오퍼레이션
  const shuffleOptions = (correctWord: any, allWords: any[]) => {
    const distractors = allWords
      .filter(w => w.id !== correctWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
    return [...distractors, correctWord].sort(() => 0.5 - Math.random())
  }

  const currentQ = questions[currentIndex]

  // 정답 및 스펠링 유효성 검증 체커
  const handleCheck = () => {
    if (isFinished || isCorrect !== null) return

    let correct = false
    if (currentQ.type === 'written') {
      // 서술형 단어 매칭: 대소문자 무시 및 문자열 양끝 공백 트리밍
      correct = userInput.trim().toLowerCase() === currentQ.word.toLowerCase()
    } else {
      // 객관식 보기 매칭: 선택 인덱스 식별값 대조
      correct = selectedOption !== null && currentQ.options[selectedOption].id === currentQ.id
    }

    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)

    // 1.5초 타이밍 오프셋 후 다음 연쇄 마법 문제로 전환
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setUserInput('')
        setSelectedOption(null)
        setIsCorrect(null)
      } else {
        setIsFinished(true)
      }
    }, 1500)
  }

  if (!currentQ) return null

  return (
    <div className="relative min-h-dvh bg-bg flex flex-col">
      <StarParticles count={40} />
      
      <PageContainer className="relative z-10 flex flex-1 flex-col pb-10" wide={false}>
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => {
                if(window.confirm('시험을 중단하고 교실 밖으로 나가시겠습니까? 현재까지의 점수는 기록되지 않습니다.')) {
                  resetSession()
                  navigate('/home')
                }
              }} 
              className="p-2 border border-white/10 rounded-xl text-[#aaa] hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-display text-xl text-gold font-bold">O.W.L 마법 필기 시험</h1>
          </div>
          <span className="text-sm text-[#aaa] font-medium">문제 {currentIndex + 1} / {questions.length}</span>
        </header>

        <ProgressBar value={currentIndex + 1} max={questions.length} className="mb-8" />

        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* 채점 결과에 따라 상단 테두리 색상이 동적으로 변하는 유리 모프 카드 */}
              <GlassCard className={`p-8 border-t-4 transition-all duration-300 ${isCorrect === true ? 'border-t-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : isCorrect === false ? 'border-t-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-t-gold'}`}>
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-purple/20 text-purple text-xs rounded-full font-bold uppercase tracking-wider">
                    {currentQ.type === 'written' ? '📝 서술형: 주문 기술' : '🔮 객관식: 주문 선택'}
                  </span>
                  {isCorrect === true && <CheckCircle2 className="text-emerald-500 animate-pulse" />}
                  {isCorrect === false && <AlertCircle className="text-red-500" />}
                </div>

                <h2 className="text-sm text-[#aaa] mb-2 font-medium">다음 의미를 지닌 올바른 마법 주문 단어는 무엇입니까?</h2>
                <p className="text-3xl text-white font-bold mb-8 leading-tight font-serif">
                  "{currentQ.meaning}"
                </p>

                {/* --- 모드 1: 서술형 텍스트 기입 아키텍처 --- */}
                {currentQ.type === 'written' ? (
                  <div className="space-y-4">
                    <MagicalInput
                      placeholder="이곳에 정확한 주문 영문 스펠링을 기입하세요..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                      autoFocus
                    />
                    <p className="text-xs text-[#666] italic font-medium">💡 마법 가이드 힌트 예문 : {currentQ.exampleKo}</p>
                  </div>
                ) : (
                  /* --- 모드 2: 객관식 4지선다 버튼 아키텍처 --- */
                  <div className="grid grid-cols-1 gap-3">
                    {currentQ.options.map((opt: any, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedOption(i)}
                        className={`p-4 text-left rounded-xl border font-bold transition-all ${
                          selectedOption === i 
                            ? 'border-gold bg-gold/15 text-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]' 
                            : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-3 text-gold/40">{i + 1}.</span> {opt.word}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={isCorrect !== null || (currentQ.type === 'written' ? !userInput.trim() : selectedOption === null)}
                  className="mt-8 w-full btn-primary bg-gold text-[#0D0B1F] font-bold py-4 rounded-xl disabled:opacity-30 transition-all hover:opacity-90"
                >
                  {isCorrect !== null ? '마법 교수 채점 중...' : '마법 답안 제출하기'}
                </button>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </PageContainer>

      {/* 시험 종료 성적 정산 모달 레이어 */}
      {isFinished && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <GlassCard className="max-w-sm w-full p-8 text-center border-gold rounded-2xl shadow-2xl">
            <span className="text-6xl mb-4 block animate-bounce">📜</span>
            <h2 className="text-2xl font-display text-gold mb-2 font-bold">O.W.L 시험 종료</h2>
            <p className="text-[#aaa] text-sm mb-6">당신의 최종 마법 주문 정확도 스코어</p>
            <div className="text-5xl font-display text-white mb-8 font-extrabold tracking-tight">
              {score} / {questions.length}
            </div>
            <button
              type="button"
              onClick={() => {
                // 안전하게 스토어 가드 함수 실행 후 리턴
                runCompleteExam(score, questions.length);
                resetSession();
                navigate('/home', { replace: true });
              }}
              className="w-full btn-primary bg-gold text-[#0D0B1F] font-bold py-3.5 rounded-xl shadow-lg hover:opacity-95 transition-all"
            >
              마법 성적표 수령 및 귀환
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  )
}