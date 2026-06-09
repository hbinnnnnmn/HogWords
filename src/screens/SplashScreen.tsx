import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StarParticles } from '../components/StarParticles'
import { useAppStore } from '../store/useAppStore'

export function SplashScreen() {
  const navigate = useNavigate()
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const profileComplete = useAppStore((s) => s.profileComplete)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) navigate('/login', { replace: true })
      else if (!profileComplete) navigate('/sorting-hat', { replace: true })
      else navigate('/home', { replace: true })
    }, 2200)
    return () => clearTimeout(timer)
  }, [navigate, isAuthenticated, profileComplete])

  return (
    <motion.div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <StarParticles count={80} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <div className="mb-6 text-7xl">⚡</div>
        <h1 className="font-display text-5xl text-gold text-glow-gold">HogWords</h1>
        <p className="mt-3 text-base text-[#AAAAAA]">
          Learn English vocabulary in the wizarding world
        </p>
        <div
          className="mt-12 h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold"
          style={{ animation: 'spin-gold 1s linear infinite' }}
        />
      </motion.div>
    </motion.div>
  )
}
