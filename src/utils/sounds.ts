/** Lightweight Web Audio API sound effects for spell cast feedback */

let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.15,
) {
  const ctx = getContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  g.gain.setValueAtTime(gain, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

/** Sparkling ascending chime for successful spell pronunciation */
export function playSparkleSound() {
  const ctx = getContext()
  if (!ctx) return
  ;[523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 80)
  })
}

/** Low fizzle for mispronounced spells */
export function playFizzleSound() {
  const ctx = getContext()
  if (!ctx) return
  playTone(120, 0.4, 'sawtooth', 0.08)
  setTimeout(() => playTone(80, 0.3, 'square', 0.06), 100)
}

/** Spell duel hit sound */
export function playDuelHitSound() {
  playTone(440, 0.15, 'triangle', 0.1)
  setTimeout(() => playTone(330, 0.2, 'triangle', 0.08), 60)
}

/** Shield damage sound */
export function playShieldHitSound() {
  playTone(180, 0.35, 'sawtooth', 0.1)
}
