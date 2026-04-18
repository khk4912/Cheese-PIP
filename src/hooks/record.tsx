import { useState } from 'react'
import { useOptions } from './useOptions'

type RecordingStatus = 'recording' | 'stopped'
export function useRecord () {
  const [status, setStatus] = useState<RecordingStatus>('stopped')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { options } = useOptions()
  const { fastRec, highFrameRateRec } = options

  // Unmounting Cleanup
  useEffect(() => {
    const recorder = recorderRef.current
    return () => {
      recorder?.stop()
    }
  }, [])

  // Video onended handler
  useEffect(() => {
    // TODO: Video onended 발생 시 녹화 종료
    const video = videoRef.current
  }, [])

  const toggle = () => {
    if (status === 'recording') {
      setStatus('stopped')
    } else {
      setStatus('recording')
    }
  }

  return {
    status,
    fastRec,
    highFrameRateRec,
    videoRef,
    recorderRef,
    toggle
  }
}
