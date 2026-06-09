import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { ADMIN_PASSWORD } from '../constants/achievements'

export function AdminPasswordModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const submit = () => {
    if (password === ADMIN_PASSWORD) {
      setPassword('')
      setError('')
      onSuccess()
      return
    }
    setError('비밀번호가 올바르지 않습니다.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-sm p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-gold">관리자 로그인</h2>
          <button type="button" onClick={onClose} className="text-[#aaa]">
            <X size={20} />
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="비밀번호 입력"
          className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-gold"
        />
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={submit}
          className="btn-primary w-full bg-gold text-[#0D0B1F]"
        >
          입장
        </button>
      </motion.div>
    </div>
  )
}
