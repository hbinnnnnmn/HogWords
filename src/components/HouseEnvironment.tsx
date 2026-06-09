import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'

export function HouseEnvironment() {
  const user = useAppStore((s) => s.user)
  const house = user?.house ?? 'Gryffindor'

  // 1. 그리핀도르 (🦁): 타오르는 횃불 이펙트 (위로 솟구치는 불꽃 입자들)
  if (house === 'Gryffindor') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a0d0d]/30 via-transparent to-transparent" />
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: Math.random() * 0.6 + 0.4, 
              x: Math.random() * 350, 
              y: 700 
            }}
            animate={{ 
              opacity: [0, 0.7, 0.4, 0], 
              y: [-10, -200, -400, -750], // 부드럽게 위로 상승하는 키프레임 배열로 수정
              x: [Math.random() * 350, Math.random() * 350 + (Math.random() * 40 - 20)] // 함수 대신 배열로 교체
            }}
            transition={{ 
              duration: Math.random() * 4 + 3, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: 'easeOut'
            }}
            className="absolute h-3 w-3 rounded-full bg-gradient-to-t from-red-600 to-amber-400 blur-[2px]"
          />
        ))}
      </div>
    )
  }

  // 2. 슬리데린 (🐍): 지하 감옥의 차가운 녹색 안개와 심해 펄스 이펙트
  if (house === 'Slytherin') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,78,59,0.25),transparent_70%)]" />
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 border-8 border-emerald-500/10 blur-xl m-10 rounded-[40px]"
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 350, y: Math.random() * 700 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              x: [Math.random() * 350, Math.random() * 350 + (Math.random() * 40 - 20)],
              y: [Math.random() * 700, Math.random() * 700 + (Math.random() * 40 - 20)]
            }}
            transition={{ duration: Math.random() * 6 + 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-6 w-6 rounded-full bg-emerald-400/10 blur-[6px]"
          />
        ))}
      </div>
    )
  }

  // 3. 래번클로 (🦅): 천문탑의 밤하늘 유성우 비주얼 이펙트
  if (house === 'Ravenclaw') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1a3a]/40 via-transparent to-transparent" />
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 350, y: -20, opacity: 0 }}
            animate={{ 
              x: [Math.random() * 350, Math.random() * 350 - 150], 
              y: [-20, 800], 
              opacity: [0, 0.8, 0.8, 0] 
            }}
            transition={{ 
              duration: Math.random() * 1.5 + 1.5, 
              repeat: Infinity, 
              delay: Math.random() * 6,
              ease: 'linear'
            }}
            className="absolute h-[80px] w-[1.5px] bg-gradient-to-b from-blue-400 to-transparent -rotate-[35deg] blur-[0.5px]"
          />
        ))}
      </div>
    )
  }

  // 4. 후플푸프 (🦡): 오두막의 온화한 햇살 조명과 황금빛 민들레 씨앗
  if (house === 'Hufflepuff') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20, y: Math.random() * 700 }}
            animate={{ 
              opacity: [0, 0.6, 0.3, 0], 
              x: [-20, 400],
              y: [Math.random() * 700, Math.random() * 700 + (Math.random() * 100 - 50)]
            }}
            transition={{ 
              duration: Math.random() * 6 + 5, 
              repeat: Infinity, 
              delay: Math.random() * 4,
              ease: 'easeInOut'
            }}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/40 blur-[0.5px]"
          />
        ))}
      </div>
    )
  }

  return null
}