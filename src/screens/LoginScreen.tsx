import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { MagicalInput } from '../components/MagicalInput'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'

export function LoginScreen() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)
  const loginWithOAuth = useAppStore((s) => s.loginWithOAuth)
  const profileComplete = useAppStore((s) => s.profileComplete)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      // 에러 메시지가 없거나 영어일 경우를 대비해 한국어 기본 메시지 지정
      setError(result.error && result.error !== 'Login failed.' ? result.error : '인증에 실패했습니다. 주문이나 비밀번호를 확인하세요.')
      return
    }
    // 기존에 프로필(기숙사 배정)을 완료했다면 홈으로, 안 했다면 분류모자 의식 화면으로 이동
    navigate(profileComplete ? '/home' : '/sorting-hat', { replace: true })
  }

  const oauth = (provider: string) => {
    loginWithOAuth(provider)
    navigate('/sorting-hat', { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      {/* 백그라운드 마법 입자 효과 */}
      <StarParticles count={50} />
      
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="text-5xl">🎩</span>
          <h1 className="mt-4 font-display text-4xl text-gold text-glow-gold">HogWords</h1>
          <p className="mt-2 text-sm text-[#aaa]">마법 세계의 언어학습에 오신 것을 환영합니다</p>
        </motion.div>

        <GlassCard className="w-full max-w-sm p-6">
          <form onSubmit={submit} className="space-y-4">
            <MagicalInput
              type="email"
              placeholder="마법사 이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <MagicalInput
              type="password"
              placeholder="비밀 마법 암호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            
            {/* 마법부 보안 검증 실패 시 에러 출력 */}
            {error && <p className="text-sm text-red-400 text-center font-medium">{error}</p>}
            
            <button type="submit" className="btn-primary w-full bg-gold text-[#0D0B1F] font-bold py-3 rounded-lg transition-all hover:opacity-90">
              호그와트 입장하기
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-[#666]">또는</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => oauth('Google')}
              className="btn-primary w-full border border-purple/50 bg-purple/20 text-white font-medium py-2.5 rounded-lg transition-all hover:bg-purple/30"
            >
              마법부 네트워크로 연동하기
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#888]">
            처음 오신 마법사이신가요?{' '}
            <Link to="/signup" className="text-gold hover:underline ml-1 font-semibold">
              입학 등록하기 (회원가입)
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}