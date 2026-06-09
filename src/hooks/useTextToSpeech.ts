import { useCallback, useState } from 'react'
import { speakWord } from '../utils/tts'

/**
 * Hook wrapping the Web Speech Synthesis API for vocabulary pronunciation.
 * Triggers a golden scale-up animation state while speaking.
 */
export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    setSpeaking(true)
    speakWord(text)
    window.setTimeout(() => setSpeaking(false), 800)
  }, [])

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  return { speak, speaking, supported }
}
