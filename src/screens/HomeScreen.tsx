import { motion } from 'framer-motion'
import { BookOpen, Swords, Trees } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FogLayer } from '../components/FogLayer'
import { GlassCard } from '../components/GlassCard'
import { HogwartsSilhouette } from '../components/HogwartsSilhouette'
import { HouseBadge } from '../components/HouseBadge'
import { PageContainer } from '../components/PageContainer'
import { ProgressBar } from '../components/ProgressBar'
import { StarParticles } from '../components/StarParticles'
import { HOUSES } from '../constants/houses'
import { useAppStore } from '../store/useAppStore'
import { todayKey } from '../utils/date'
import { HouseEnvironment } from '../components/HouseEnvironment' // 👈 1. 기숙사 이펙트 임포트 완료!

export function HomeScreen() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const profile = useAppStore((s) => s.profile)
  const getReviewCount = useAppStore((s) => s.getReviewCount)
  const beginSession = useAppStore((s) => s.beginSession)

  const reviewCount = getReviewCount()
  const house = user?.house ?? 'Gryffindor'
  const houseTheme = HOUSES[house]

  // 👈 2. 기숙사별 타이틀 네온사인(Glow) 효과 클래스 생성 함수
  const getGlowClass = () => {
    if (house === 'Gryffindor') return 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]'
    if (house === 'Slytherin') return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]'
    if (house === 'Ravenclaw') return 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.7)]'
    return 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]' // 후플푸프 기본
  }

  const startLearn = () => {
    if (beginSession('new')) navigate('/study?mode=new')
  }

  const startReview = () => {
    if (beginSession('review')) navigate('/study?mode=review')
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      {/* 배경 마법 효과 및 성 실루엣 */}
      <StarParticles count={60} />
      <HogwartsSilhouette />
      <FogLayer />
      
      {/* 👈 3. 기숙사별 환경 인테리어 엔진 컴포넌트 전면 배치! */}
      <HouseEnvironment /> 

      {/* 이펙트가 살짝 더 잘 보이도록 배경 불투명도를 0.78에서 0.72로 미세 조정 */}
      <div className="absolute inset-0 bg-[rgba(13,11,31,0.72)] z-0" />

      <PageContainer className="relative z-10 flex flex-1 flex-col pb-4">
        {/* 상단 헤더 영역 */}
        <header className="pt-2 text-center">
          {/* 👈 4. 기숙사 맞춤형 동적 네온사인 글자 스타일 적용! */}
          <h1 className={`font-display text-4xl font-bold tracking-wider transition-all duration-500 ${getGlowClass()}`}>
            Wizard Words
          </h1>
          <p className="mt-1 text-sm text-[#AAAAAA]">마법사처럼 영단어를 지배하다</p>
        </header>

        {/* 마법사 프로필 유리 카드 (기숙사 동적 스타일 바인딩) */}
        <GlassCard
          className="mt-6 p-5"
          style={{
            borderColor: `${houseTheme.accent}44`,
            boxShadow: `0 0 20px ${houseTheme.primary}33`,
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">{houseTheme.emblem}</span>
            <div className="flex-1">
              <p className="text-sm text-[#AAAAAA]">{user?.name ?? '마법사'}</p>
              <p className="font-display text-lg text-white font-semibold">
                Lv.{profile.level} {profile.title}
              </p>
              <HouseBadge house={house} size="sm" />
            </div>
            {/* 재화 및 연속 스트릭 정보 표기 */}
            <div className="text-right text-xs text-[#aaa] font-medium">
              <p>🪙 {user?.galleons ?? 0} 갈레온</p>
              <p className="mt-1">🔥 {profile.streakDays}일째 출석</p>
            </div>
          </div>

          {/* 경험치 프로그레스 바 컴포넌트 계층 */}
          <ProgressBar value={profile.exp} max={profile.expToNextLevel} className="mt-4" />
          <p className="mt-1 text-right text-xs text-[#AAAAAA]">
            {profile.exp} / {profile.expToNextLevel} XP
          </p>
        </GlassCard>

        {/* 핵심 학습 진입 관문 버튼 군 */}
        <div className="mt-6 flex flex-1 flex-col gap-4">
          {/* 강의실 입장 버튼 */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={startLearn}
            className="btn-primary flex items-center justify-center gap-3 border border-gold/40 bg-purple py-4 text-white font-bold rounded-xl transition-all"
          >
            <BookOpen size={22} />
            마법 강의실 입장 (새 단어 학습)
          </motion.button>

          {/* 마법 결투 미니게임 버튼 */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/duel')}
            className="btn-primary flex items-center justify-center gap-3 border border-gold/30 bg-gradient-to-r from-[#2a1f5e] to-purple py-4 text-gold font-bold rounded-xl transition-all"
          >
            <Swords size={22} />
            마법 스펠 결투 (미니게임)
            {user?.dailyQuestCompleted && user.dailyQuestDate === todayKey() && (
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">완료</span>
            )}
          </motion.button>

          {/* 금지된 숲 복습 버튼 */}
          <button
            type="button"
            onClick={startReview}
            className="btn-primary relative flex items-center justify-center gap-3 bg-fail py-4 text-gold font-bold rounded-xl transition-all border border-red-900/30"
          >
            <Trees size={22} />
            금지된 숲 탐험 (틀린 단어 복습)
            {reviewCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-[#0D0B1F] shadow-lg">
                {reviewCount}
              </span>
            )}
          </button>
        </div>

        {/* 하단 일일/전체 요약 스탯 패널 */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm">
          <div className="rounded-xl bg-white/5 p-3 border border-white/5">
            <p className="text-[#888] font-medium">오늘 학습한 단어</p>
            <p className="mt-1 text-lg font-bold text-gold">{profile.todayWords} 개</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/5">
            <p className="text-[#888] font-medium">완전 마스터 단어</p>
            <p className="mt-1 text-lg font-bold text-emerald-400">{profile.totalWords} 개</p>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}