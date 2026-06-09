import { BookOpen, RotateCcw, Swords } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { PageContainer } from '../components/PageContainer'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'

export function LearnScreen() {
  const navigate = useNavigate()
  const beginSession = useAppStore((s) => s.beginSession)
  const getReviewCount = useAppStore((s) => s.getReviewCount)
  const newCount = useAppStore((s) => s.getNewWordsForSession(20).length)
  const reviewCount = getReviewCount()

  const start = (mode: 'new' | 'review') => {
    if (beginSession(mode)) navigate(`/study?mode=${mode}`)
  }

  return (
    <div className="relative min-h-full flex-1">
      {/* 백그라운드 마법 입자 효과 */}
      <StarParticles count={30} />
      
      <PageContainer className="relative z-10 pb-4">
        <h1 className="font-display text-3xl text-gold text-glow-gold">마법 학습관</h1>
        <p className="mt-2 text-sm text-[#AAAAAA]">
          TTS 발음 청취 및 음성인식 주문 영창 모드로 영단어 카드를 마스터하세요
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {/* 1. 신규 주문 학습 (마법 강의실) */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-xl bg-purple/20 p-3">
                <BookOpen className="text-purple" size={28} />
              </div>
              <div>
                <p className="text-lg font-medium">마법 강의실 입장</p>
                <p className="text-sm text-[#AAAAAA]">새로운 마법 주문 {newCount}개 대기 중 (최대 20개)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => start('new')}
              disabled={newCount === 0}
              className="btn-primary w-full border border-gold/40 bg-purple text-white font-bold py-3 rounded-lg transition-all disabled:opacity-40"
            >
              새로운 주문 학습 시작
            </button>
          </GlassCard>

          {/* 2. 망각 주문 복습 (금지된 숲) */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-xl bg-gold/15 p-3">
                <RotateCcw className="text-gold" size={28} />
              </div>
              <div>
                <p className="text-lg font-medium">금지된 숲 림보</p>
                <p className="text-sm text-[#AAAAAA]">{reviewCount}개의 주문이 마법 복습을 필요로 합니다</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => start('review')}
              disabled={reviewCount === 0}
              className="btn-primary w-full bg-fail text-gold font-bold py-3 rounded-lg transition-all disabled:opacity-40 border border-red-900/30"
            >
              어둠의 복습 시작
            </button>
          </GlassCard>

          {/* 3. 스펠 퀴즈 결투 (결투 경기장) */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-xl bg-purple/20 p-3">
                <Swords className="text-purple" size={28} />
              </div>
              <div>
                <p className="text-lg font-medium">스펠 결투 경기장</p>
                <p className="text-sm text-[#AAAAAA]">매일 펼쳐지는 5문항의 마법 퀴즈 배틀</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/duel')}
              className="btn-primary w-full border border-gold/30 bg-gradient-to-r from-[#2a1f5e] to-purple text-gold font-bold py-3 rounded-lg transition-all"
            >
              결투장 입장하기
            </button>
          </GlassCard>
        </div>
      </PageContainer>
    </div>
  )
}