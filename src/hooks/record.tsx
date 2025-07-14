export function useRecord () {
  const [isRecording, setIsRecording] = useState(false)
  const { options } = useOptions()
  const { fastRec, highFrameRateRec } = options

  const recorder = useRef<MediaRecorder>()
  const canvasInterval = useRef<number>()

  useEffect(() => {
    return () => {
      if (isRecording) {
        window.clearInterval(canvasInterval.current)
        _stopRecord(recorder, fastRec)
          .catch(console.error)
      }
    }
  }, [isRecording, fastRec])

  const clickHandler = async (): Promise<void> => {
    const video: HTMLVideoElement | null = document.querySelector('.webplayer-internal-video')
    if (video === null) {
      return
    }

    // 방송 종료 시 자동 녹화 종료
    video.onended = () => {
      setIsRecording(false)
    }

    if (video.muted) {
      alert('음소거된 비디오는 녹화할 수 없습니다.')
      return
    }

    const newRec = !isRecording
    setIsRecording(newRec)

    // 녹화 시작
    if (newRec) {
      // 고프레임 녹화 시
      if (highFrameRateRec) {
        const [_videoRecorder, _canvasInterval] = await startHighFrameRateRecord(video) ?? [null, null, null]

        if (_videoRecorder === null || _canvasInterval === null) {
          return
        }

        recorder.current = _videoRecorder
        canvasInterval.current = _canvasInterval
      } else { // 일반 녹화 시
        const _recorder = await startRecord(video)

        if (_recorder === null) {
          return
        }
        recorder.current = _recorder
      }

      return
    }

    // 녹화 중지
    if ((recorder.current?.recordInfo?.highFrameRec) ?? false) {
      if (recorder.current === undefined || canvasInterval.current === undefined) {
        return
      }
      clearInterval(canvasInterval.current) // 고프레임 녹화 canvas interval 제거
    }
    await _stopRecord(recorder, fastRec)
  }

  return {
    isRecording,
    setIsRecording,
    recorder,
    canvasInterval,
    fastRec,
    highFrameRateRec,
    clickHandler,
  }
}

async function _stopRecord (
  recorder: React.MutableRefObject<MediaRecorder | undefined>,
  fastRec: boolean
): Promise<void> {
  if (recorder.current === undefined) {
    return
  }

  const info = await stopRecord(recorder.current)
  recorder.current = undefined

  if (info.resultBlobURL === '') {
    return
  }

  // '영상 빠른 저장' 기능 사용시, 결과 페이지 표시 없이 즉시 다운
  if (fastRec) {
    const video = document.createElement('video')
    video.src = info.resultBlobURL
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      (async (): Promise<void> => {
        let duration: number = 0

        video.currentTime = Number.MAX_SAFE_INTEGER
        await new Promise(resolve => setTimeout(resolve, 500))
        video.currentTime = 0

        duration = video.duration

        // video.duration이 Infinity일 경우, 녹화 시작 시간과 종료 시간을 이용하여 대략적인 계산
        if (duration === Infinity) {
          duration = (info.stopDateTime - info.startDateTime) / 1000 - 0.1
        }

        const fileName = `${info.streamInfo.streamerName}_${duration.toFixed(2)}s`

        // 다운로드
        const a = document.createElement('a')
        a.href = info.resultBlobURL
        a.download = sanitizeFileName(`${fileName}.${info.isMP4 ? 'mp4' : 'webm'}`)

        a.click()

        URL.revokeObjectURL(info.resultBlobURL)
      })()
        .catch(console.error)
    }
    return
  }

  // '영상 빠른 저장' 미사용시 결과 페이지 표시
  window.open(chrome.runtime.getURL('/record_result.html'))
  setTimeout(() => {
    if (isMoz) {
      // RecordInfo도 전송
      chrome.runtime.sendMessage({
        type: 'mozRecordInfo',
        recordInfo: info
      }).catch(console.error)

      // Blob을 Firefox에서 Message로 전송
      fetch(info.resultBlobURL)
        .then(res => res.blob())
        .then(blob => {
          chrome.runtime.sendMessage({
            type: 'mozRecordBlob',
            resultBlob: blob
          })
            .catch(console.error)
        })
        .catch(console.error)

      URL.revokeObjectURL(info.resultBlobURL)
    }
  }, 500)
}
