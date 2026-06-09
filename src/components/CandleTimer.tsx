import { useEffect, useState } from 'react'

/** Burning candle countdown timer for Spell Duel questions */
export function CandleTimer({
  seconds,
  onExpire,
  active,
}: {
  seconds: number
  onExpire: () => void
  active: boolean
}) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (!active) return
    setRemaining(seconds)
  }, [seconds, active])

  useEffect(() => {
    if (!active || remaining <= 0) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id)
          onExpire()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [active, remaining, onExpire])

  const flameHeight = 8 + (remaining / seconds) * 16

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex flex-col items-center">
        <span
          className="text-2xl transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 ${flameHeight}px rgba(255,140,0,0.8))`,
            transform: `scaleY(${0.6 + (remaining / seconds) * 0.4})`,
          }}
        >
          🕯️
        </span>
        <span className="mt-1 font-display text-lg text-gold">{remaining}s</span>
      </div>
    </div>
  )
}
