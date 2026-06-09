import { motion } from 'framer-motion'

/** Golden particle burst animation for successful spell pronunciation */
export function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i / 16) * Math.PI * 2,
    distance: 40 + Math.random() * 60,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_#D4AF37]"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
