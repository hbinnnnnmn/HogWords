import { useCallback, useEffect, useRef, useState } from 'react'

type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'error'

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
}

interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string; confidence: number } } }
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * Speech-to-Text hook for Incantation Mode (Cast the Spell).
 * Uses the browser Web Speech API with graceful fallback messaging.
 */
export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [status, setStatus] = useState<RecognitionStatus>('idle')
  const [result, setResult] = useState<SpeechRecognitionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supported = getRecognitionCtor() !== null

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setErrorMessage('Speech recognition is not supported in this browser.')
      setStatus('error')
      return
    }

    setResult(null)
    setErrorMessage(null)
    setStatus('listening')

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const item = event.results[0]?.[0]
      if (item) {
        setResult({ transcript: item.transcript, confidence: item.confidence })
      }
      setStatus('processing')
    }

    recognition.onerror = () => {
      setErrorMessage('Microphone access failed. Please allow microphone permission.')
      setStatus('error')
    }

    recognition.onend = () => {
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev))
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setErrorMessage(null)
    setStatus('idle')
  }, [])

  return {
    supported,
    status,
    result,
    errorMessage,
    isListening: status === 'listening',
    startListening,
    stopListening,
    reset,
  }
}
