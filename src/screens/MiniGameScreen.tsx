import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Swords } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti' // 👈 폭죽 라이브러리 연동
import { CandleTimer } from '../components/CandleTimer'
import { GlassCard } from '../components/GlassCard'
import { HealthBar } from '../components/HealthBar'
import { PageContainer } from '../components/PageContainer'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'
import { playDuelHitSound, playShieldHitSound } from '../utils/sounds'

const PLAYER_HP = 100
const ENEMY_HP = 100
const DAMAGE = 20
const TIMER_SECONDS = 10

type Phase = 'battle' | 'complete'

// 1. 화면 흔들림(Shake) 효과를 위한 CSS 주입 스타일링
const shakeStyle = `
  @keyframes screenShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  .animate-screen-shake { animation: screenShake 0.4s ease-in-out; }
`;

// 2. 메모리 누수 방지를 위한 오디오 객체 컴포넌트 외부 선언 (브라우저 Web Audio API 기반)
const soundCorrect = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
const soundIncorrect = new Audio('https://assets.mixkit.co/active_storage/sfx/2513/2513-84.wav');
const soundVictory = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav');

export function MiniGameScreen() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user) // 기숙사 색상 추출용 유저 데이터 가져오기
  const buildDuelQuestions = useAppStore((s) => s.buildDuelQuestions)
  const completeDuel = useAppStore((s) => s.completeDuel)

  const [questions] = useState(() => buildDuelQuestions())
  const [index, setIndex] = useState(0)
  const [playerHp, setPlayerHp] = useState(PLAYER_HP)
  const [enemyHp, setEnemyHp] = useState(ENEMY_HP)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('battle')
  const [timerKey, setTimerKey] = useState(0)
  const [casting, setCasting] = useState(false)
  
  // Zustand completeDuel의 리턴 타입 호환성 오류 가드 (`any` 매핑으로 안전조치)
  const [result, setResult] = useState<any | null>(null)

  // 신규 추가된 시각 효과 상태 스태프
  const [isShaking, setIsShaking] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  const current = questions[index]
  const isLastQuestion = index >= questions.length - 1

  // 내 기숙사 상징에 따른 동적 마법 스펠 컬러 바인딩
  const getHouseSpellColor = () => {
    if (user?.house === 'Gryffindor') return 'bg-red-600/25';   // 붉은 섬광
    if (user?.house === 'Slytherin') return 'bg-emerald-600/25'; // 초록 섬광
    if (user?.house === 'Ravenclaw') return 'bg-blue-600/25';    // 푸른 섬광
    return 'bg-amber-500/25';                                    // 후플푸프 황금 섬광
  };

  // 최종 결투 대승리 시 사방 연쇄 폭죽 및 승리 오디오 팡파르 트리거 함수
  const triggerVictoryMagic = useCallback(() => {
    soundVictory.currentTime = 0;
    soundVictory.play().catch((e) => console.log('Audio blocked:', e));

    const end = Date.now() + 2 * 1000;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#bb9aef', '#ecc94b'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#bb9aef', '#ecc94b'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  const finishDuel = useCallback(
    (finalCorrect: number) => {
      const duelResult = completeDuel(finalCorrect, questions.length)
      setResult(duelResult)
      setPhase('complete')
      
      // 정답을 3개 이상 맞추어 결투에서 최종 승리했을 때 시청각 피날레 연출
      if (finalCorrect >= 3) {
        triggerVictoryMagic();
      }
    },
    [completeDuel, questions.length, triggerVictoryMagic],
  )

  const resolveAnswer = useCallback(
    (isCorrect: boolean) => {
      const nextCorrect = isCorrect ? correctCount + 1 : correctCount

      if (isCorrect) {
        setCorrectCount(nextCorrect)
        setEnemyHp((hp) => Math.max(0, hp - DAMAGE))
        
        // [청각] 기존 레거시 비프음 + 신규 고품질 마법 지팡이 주문 적중음 사운드 레이어드
        playDuelHitSound()
        soundCorrect.currentTime = 0;
        soundCorrect.play().catch(() => {});

        // [시각] 기숙사 주문 섬광 및 화면 진동 발동
        setFlashColor(getHouseSpellColor());
        setIsShaking(true);
        setCasting(true)

        // [시각] 정답 즉시 팡 터지는 마법 가루 파티클 임팩트
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.75 },
          colors: ['#fbbf24', '#a78bfa', '#34d399']
        });

        setTimeout(() => {
          setCasting(false);
          setIsShaking(false);
          setFlashColor(null);
        }, 600)

      } else {
        setPlayerHp((hp) => Math.max(0, hp - DAMAGE))
        
        // [청각] 기존 쉴드 효과음 + 마법 시전 실패 버저음 출력
        playShieldHitSound()
        soundIncorrect.currentTime = 0;
        soundIncorrect.play().catch(() => {});

        // [시각] 적에게 타격받았을 때 경고용 붉은 오버레이 섬광 오프셋
        setFlashColor('bg-red-950/40');
        setTimeout(() => setFlashColor(null), 400);
      }

      setTimeout(() => {
        if (isLastQuestion) {
          finishDuel(nextCorrect)
          return
        }
        setIndex((i) => i + 1)
        setSelected(null)
        setTimerKey((k) => k + 1)
      }, 1100)
    },
    [correctCount, isLastQuestion, finishDuel, user?.house],
  )

  const pickOption = (optionIndex: number) => {
    if (!current || selected !== null || phase !== 'battle') return
    setSelected(optionIndex)
    resolveAnswer(optionIndex === current.correctIndex)
  }

  const onTimerExpire = useCallback(() => {
    if (selected !== null || phase !== 'battle') return
    setSelected(-1)
    resolveAnswer(false)
  }, [selected, phase, resolveAnswer])

  // 결투 준비 에셋 로딩 예외 처리
  if (!current && phase === 'battle') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-[#aaa] font-medium">
        결투 경기장을 생성하는 중…
      </div>
    )
  }

  // Phase: 결투 완료 및 보상 정산 리포트 레이아웃
  if (phase === 'complete') {
    const won = (result?.correct ?? correctCount) >= 3
    return (
      <div className="relative flex min-h-dvh flex-col bg-bg">
        <StarParticles count={40} />
        <PageContainer className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <GlassCard className="max-w-md w-full p-8 text-center">
            <span className="text-6xl">{won ? '⚔️✨' : '🛡️💨'}</span>
            <h1 className="mt-4 font-display text-3xl text-gold font-bold">
              {won ? '결투 승리!' : '결투 종료'}
            </h1>
            <p className="mt-3 text-white font-medium">
              총 {questions.length}개 중 {result?.correct ?? correctCount}개의 주문 스펠을 정확히 명중시켰습니다.
            </p>
            
            {result && (
              <div className="mt-5 space-y-1.5 text-sm text-[#aaa] bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-emerald-400">+{result.xpEarned} XP 획득</p>
                <p className="text-yellow-400">+{result.galleonsEarned} 갈레온 획득</p>
                {result.dailyQuestComplete && (
                  <p className="text-gold font-bold mt-2">✓ 오늘의 마법 일일 퀘스트 완료!</p>
                )}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="btn-primary mt-8 w-full bg-gold text-[#0D0B1F] font-bold py-3 rounded-lg transition-all hover:opacity-90"
            >
              호그와트 성으로 복귀하기
            </button>
          </GlassCard>
        </PageContainer>
      </div>
    )
  }

  // Phase: 마법 결투 인게임 레이아웃
  return (
    // 3. 화면 타격 성공 시 전체 컨테이너에 animate-screen-shake 클래스 유동 할당
    <div className={`relative flex min-h-dvh flex-col bg-bg ${isShaking ? 'animate-screen-shake' : ''} transition-all duration-300`}>
      <style>{shakeStyle}</style>
      <StarParticles count={30} />

      {/* 4. 실시간으로 화면 전면에 배치되어 쾅 터지는 스펠 라이트 오버레이막 */}
      {flashColor && (
        <div className={`fixed inset-0 ${flashColor} pointer-events-none z-50 transition-all duration-300`} />
      )}

      <PageContainer className="relative z-10 flex flex-1 flex-col pb-4" wide={false}>
        
        {/* 상단 결투 상태 헤더 바 */}
        <header className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('결투 도중 탈주하시겠습니까? 패배 처리되며 진행 보상을 잃게 됩니다.')) {
                navigate('/home')
              }
            }}
            className="rounded-lg border border-white/10 p-2 text-[#aaa] hover:bg-white/5 transition-colors"
            aria-label="결투 도망치기"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="text-gold" size={20} />
            <h1 className="font-display text-xl text-gold font-bold">스펠 마법 결투</h1>
          </div>
          <span className="ml-auto text-sm text-[#aaa] font-medium">
            라운드 {index + 1} / {questions.length}
          </span>
        </header>

        {/* 쉴드 상태 비탈 레이아웃 바 분할 배치 */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <HealthBar label="나의 마법 방어막" current={playerHp} max={PLAYER_HP} color="gold" />
          <HealthBar
            label="어둠의 마법사 체력"
            current={enemyHp}
            max={ENEMY_HP}
            color="red"
            align="right"
          />
        </div>

        {/* 양초 타임 퓨즈 제어 컴포넌트 */}
        <div className="flex justify-center">
          <CandleTimer
            key={timerKey}
            seconds={TIMER_SECONDS}
            active={selected === null}
            onExpire={onTimerExpire}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.wordId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative mt-6 flex-1 flex flex-col justify-center"
          >
            {/* 정답 조작 성공 시 번개 타격 시각 애니메이션 오버레이 */}
            {casting && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                className="pointer-events-none absolute left-1/2 top-1/4 z-20 -translate-x-1/2 text-6xl"
              >
                ⚡
              </motion.div>
            )}

            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-wider text-purple font-semibold">마법 양피지 스크롤</p>
              <p className="mt-4 font-display text-xl leading-relaxed text-white font-serif">
                {current.prompt}
              </p>
              <p className="mt-2 text-xs text-[#aaa] font-medium">* 빈칸에 들어갈 올바른 마법 주문 단어를 영창하세요.</p>

              {/* 4지선다 스펠 매핑 선택지 그리드 구조 */}
              <div className="mt-6 grid gap-3">
                {current.options.map((opt, i) => {
                  const show = selected !== null
                  const isCorrect = i === current.correctIndex
                  const isChosen = selected === i
                  
                  let cls = 'rounded-xl border px-4 py-4 text-left text-sm font-bold tracking-wide transition-all '
                  if (!show) {
                    cls += 'border-white/10 bg-white/5 hover:border-gold/40 active:scale-[0.99]'
                  } else if (isCorrect) {
                    cls += 'border-gold bg-gold/20 text-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  } else if (isChosen) {
                    cls += 'border-red-500/40 bg-red-900/20 text-red-200'
                  } else {
                    cls += 'border-white/5 opacity-30 scale-[0.98]'
                  }
                  
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={show}
                      onClick={() => pickOption(i)}
                      className={cls}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </PageContainer>
    </div>
  )
}