import { motion } from 'framer-motion'
import { GlassCard } from '../components/GlassCard'
import { HouseBadge } from '../components/HouseBadge'
import { PageContainer } from '../components/PageContainer'
import { ProgressBar } from '../components/ProgressBar'
import { StarParticles } from '../components/StarParticles'
import { ACHIEVEMENTS } from '../constants/achievements'
import { HOUSES } from '../constants/houses'
import { useAppStore } from '../store/useAppStore'

export function MyGrowthScreen() {
  const user = useAppStore((s) => s.user)
  const profile = useAppStore((s) => s.profile)
  const vocabulary = useAppStore((s) => s.vocabulary)
  const getReviewCount = useAppStore((s) => s.getReviewCount)

  const house = user?.house ?? 'Gryffindor'
  const houseTheme = HOUSES[house]
  const memorized = vocabulary.filter((v) => v.status === 'memorized').length
  const review = getReviewCount()

  // 통계 스탯 데이터 셋 한국어 매핑
  const statsItems = [
    { label: '마스터한 주문 (완전 암기)', value: `${memorized} 개` },
    { label: '전체 보유 단어장', value: `${vocabulary.length} 개` },
    { label: '대기 중인 복습 큐', value: `${review} 개` },
    { label: '연속 학습 스트릭', value: `🔥 ${profile.streakDays}일째` },
    { label: '보유 갈레온', value: `🪙 ${user?.galleons ?? 0} 갈레온` },
    { label: '누적 마법 경험치', value: `${profile.totalExp} XP` },
  ]

  return (
    <div className="relative min-h-full flex-1">
      {/* 은은한 배경 입자 효과 */}
      <StarParticles count={35} />
      
      <PageContainer className="relative z-10 pb-4">
        <h1 className="font-display text-3xl text-gold text-glow-gold">마법 성장 기록부</h1>

        {/* 마법사 프로필 종합 유리 카드 디스플레이 */}
        <GlassCard
          className="mt-6 p-6 text-center"
          style={{
            background: `linear-gradient(180deg, ${houseTheme.primary}44 0%, rgba(255,255,255,0.03) 100%)`,
            borderColor: `${houseTheme.accent}55`,
          }}
        >
          {/* 배정 기숙사별 시각 메타데이터 아트워크 출력 */}
          <span className="text-7xl block mb-2">{houseTheme.characterArt}</span>
          <p className="mt-3 font-display text-2xl text-white font-bold">{user?.name}</p>
          
          <div className="flex justify-center my-2">
            <HouseBadge house={house} />
          </div>
          
          <p className="text-sm text-[#aaa] font-medium font-serif">{user?.wandType}</p>
          
          <p className="mt-4 font-display text-xl font-semibold">
            Lv.{profile.level} · {profile.title}
          </p>
          
          {/* 경험치 게이지 바 계층 */}
          <div className="mt-4">
            <ProgressBar value={profile.exp} max={profile.expToNextLevel} />
            <p className="mt-2 text-xs text-[#AAAAAA]">
              {profile.exp} / {profile.expToNextLevel} XP
            </p>
          </div>
        </GlassCard>

        {/* 1. 종합 마법 통계 세션 */}
        <h2 className="mb-3 mt-8 text-lg font-bold text-gold">종합 학습 통계</h2>
        <div className="grid grid-cols-2 gap-3">
          {statsItems.map((item) => (
            <div
              key={item.label}
              className="glass-card flex flex-col rounded-xl px-4 py-3 bg-white/5 border border-white/5"
            >
              <span className="text-xs text-[#AAAAAA] font-medium">{item.label}</span>
              <span className="mt-1 text-lg font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>

        {/* 2. 해금된 마법 업적 배지 그리드 레이아웃 세션 */}
        <h2 className="mb-3 mt-8 text-lg font-bold text-gold">획득한 마법 업적 배지</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = profile.achievements.includes(a.id)
            return (
              <motion.div
                key={a.id}
                whileTap={unlocked ? { scale: 0.97 } : undefined}
                className={`glass-card p-4 text-center rounded-xl border flex flex-col items-center justify-center transition-all ${
                  unlocked
                    ? 'border-gold/60 bg-gold/5 shadow-[0_0_16px_rgba(212,175,55,0.15)]'
                    : 'border-white/5 bg-white/5 opacity-40 grayscale'
                }`}
              >
                {/* 미해금 상태일 경우 자물쇠 잠금 마크 출력 처리 */}
                <span className="text-3xl block mb-2">{unlocked ? a.icon : '🔒'}</span>
                <p className={`text-sm font-bold leading-tight ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {a.name}
                </p>
                <p className="mt-1 text-[10px] text-[#AAAAAA] leading-normal">{a.description}</p>
              </motion.div>
            )
          })}
        </div>
      </PageContainer>
    </div>
  )
}