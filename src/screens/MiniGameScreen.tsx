import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Swords } from 'lucide-react'
import { useCallback, useState } from 'react' 
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti' 
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

const shakeStyle = `
  @keyframes screenShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  .animate-screen-shake { animation: screenShake 0.4s ease-in-out; }
`;

// ========================================================
// ⚡ [강제 오디오 생성 마법 패키지] 외부 오디오 파일 없이 주파수를 직접 쏩니다!
// ========================================================
const playMagicSound = (type: 'correct' | 'incorrect' | 'victory') => {
  try {
    // 브라우저 소리 생성기 엔진 가동
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      // 정답: 맑고 높은 호그와트 마법 령 소리 (주파수 급상승)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // 도(C5)
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // 도(C6)
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'incorrect') {
      // 오답: 어둠의 마법에 당한 무거운 타격음 (주파수 하강)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime); 
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.4); 
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'victory') {
      // 대승리: 연쇄적인 크리스탈 차임벨 멜로디 연주
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // 도-미-솔-도 마법 화음
      notes.forEach((freq, idx) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
        noteGain.gain.setValueAtTime(0.15, now + idx * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
        noteOsc.connect(noteGain);
        noteGain.connect(ctx.destination);
        noteOsc.start(now + idx * 0.1);
        noteOsc.stop(now + idx * 0.1 + 0.4);
      });
    }
  } catch (e) {
    console.log("AudioContext 재생 실패 오프셋 가드:", e);
  }
};

export function MiniGameScreen() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user) 
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
  const [result, setResult] = useState<any | null>(null)

  const [isShaking, setIsShaking] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  const current = questions[index]
  const isLastQuestion = index >= questions.length - 1

  const getHouseSpellColor = () => {
    if (user?.house === 'Gryffindor') return 'bg-red-600/25';   
    if (user?.house === 'Slytherin') return 'bg-emerald-600/25'; 
    if (user?.house === 'Ravenclaw') return 'bg-blue-600/25';    
    return 'bg-amber-500/25';                                    
  };

  const triggerVictoryMagic = useCallback(() => {
    // ⚡ 승리 사운드 트리거
    playMagicSound('victory');

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
        
        // ⚡ 100% 무조건 터지는 정답 주파수 소리 발사!
        playMagicSound('correct');
        playDuelHitSound();

        setFlashColor(getHouseSpellColor());
        setIsShaking(true);
        setCasting(true)

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
        
        // ⚡ 100% 무조건 터지는 오답 주파수 소리 발사!
        playMagicSound('incorrect');
        playShieldHitSound();

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

  if (!current && phase === 'battle') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-[#aaa] font-medium">
        결투 경기장을 생성하는 중…
      </div>
    )
  }

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

  return (
    <div className={`relative flex min-h-dvh flex-col bg-bg ${isShaking ? 'animate-screen-shake' : ''} transition-all duration-300`}>
      <style>{shakeStyle}</style>
      <StarParticles count={30} />

      {flashColor && (
        <div className={`fixed inset-0 ${flashColor} pointer-events-none z-50 transition-all duration-300`} />
      )}

      <PageContainer className="relative z-10 flex flex-1 flex-col pb-4" wide={false}>
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

        <div className="mb-6 grid grid-cols-2 gap-4">
          <HealthBar label="나의 마법 방어막" current={playerHp} max={PLAYER_HP} color="gold" />
          <HealthBar label="어둠의 마법사 체력" current={enemyHp} max={ENEMY_HP} color="red" align="right" />
        </div>

        <div className="flex justify-center">
          <CandleTimer key={timerKey} seconds={TIMER_SECONDS} active={selected === null} onExpire={onTimerExpire} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.wordId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative mt-6 flex-1 flex flex-col justify-center"
          >
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