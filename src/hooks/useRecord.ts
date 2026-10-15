import { useEffect, useRef, useState } from 'react'
import { useOptions } from './useOptions'

type RecordingStatus = 'recording' | 'stopped'

export function useRecord() {
  const [status, setStatus] = useState<RecordingStatus>('stopped')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { options } = useOptions()
  const { fastRec, highFrameRateRec } = options

  // Unmounting Cleanup
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      }
      recorderRef.current = null
    }
  }, [])

  // TODO: 실제 녹화 연결 시 video ended 이벤트에서 녹화를 종료합니다.
  const toggle = () => {
    setStatus(current => (current === 'recording' ? 'stopped' : 'recording'))
  }

  return {
    status,
    fastRec,
    highFrameRateRec,
    videoRef,
    recorderRef,
    toggle,
  }
}
