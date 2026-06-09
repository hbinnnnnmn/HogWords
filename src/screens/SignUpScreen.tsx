import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { MagicalInput } from '../components/MagicalInput'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'

export function SignUpScreen() {
  const navigate = useNavigate()
  const signUp = useAppStore((s) => s.signUp)
  const loginWithOAuth = useAppStore((s) => s.loginWithOAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 마법 보호 주문 강도 검증 (비밀번호 길이 확인)
    if (password.length < 6) {
      setError('보안 암호는 최소 6자리 이상이어야 합니다.')
      return
    }
    
    // 교차 검증 확인
    if (password !== confirm) {
      setError('비밀 암호가 서로 일치하지 않습니다.')
      return
    }
    
    const result = signUp(email, password)
    if (!result.ok) {
      setError(result.error && result.error !== 'Sign up failed.' ? result.error : '입학 등록에 실패했습니다. 다시 시도해 주세요.')
      return
    }
    
    // 신입생 등록 성공 시 분류모자 의식 화면으로 이동
    navigate('/sorting-hat', { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <StarParticles count={50} />
      
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="text-5xl">📜</span>
          <h1 className="mt-4 font-display text-3xl text-gold">호그와트 입학 등록</h1>
          <p className="mt-2 text-sm text-[#aaa]">새로운 마법사 계정을 생성합니다</p>
        </motion.div>

        <GlassCard className="w-full max-w-sm p-6">
          <form onSubmit={submit} className="space-y-4">
            <MagicalInput
              type="email"
              placeholder="마법사 이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MagicalInput
              type="password"
              placeholder="사용할 비밀 마법 암호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <MagicalInput
              type="password"
              placeholder="비밀 마법 암호 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            
            {/* 시스템 보안 에러 출력 컴포넌트 */}
            {error && <p className="text-sm text-red-400 text-center font-medium">{error}</p>}
            
            <button type="submit" className="btn-primary w-full bg-gold text-[#0D0B1F] font-bold py-3 rounded-lg transition-all hover:opacity-90">
              입학 등록 절차 시작하기
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              loginWithOAuth('Ministry')
              navigate('/sorting-hat', { replace: true })
            }}
            className="btn-primary mt-4 w-full border border-purple/50 bg-purple/20 text-white font-medium py-2.5 rounded-lg transition-all hover:bg-purple/30"
          >
            마법부 네트워크로 빠른 연동
          </button>

          <p className="mt-6 text-center text-sm text-[#888]">
            이미 양식 명부에 등록하셨나요?{' '}
            <Link to="/login" className="text-gold hover:underline ml-1 font-semibold">
              로그인 인증하기
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}