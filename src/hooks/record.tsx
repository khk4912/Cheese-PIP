import { browser } from 'wxt/browser'

function handleFirefoxAudio (video: HTMLVideoElement): () => void {
  if (!isMoz) {
    return () => {}
  }

  const ctx = new AudioContext()
  const stream = new MediaStream()

  const capturedStream = video.mozCaptureStream()
  capturedStream.getVideoTracks().forEach(track => { track.stop() })
  capturedStream.getAudioTracks()
    .forEach((track) => {
      stream.addTrack(track)
    })
  const src = ctx.createMediaStreamSource(stream)
  const gain = ctx.createGain()

  // AudioContext 출력은 video의 음소거/볼륨과 무관하므로, 플레이어 음소거·볼륨 조절을 gain에 반영
  const syncVolume = (): void => {
    gain.gain.value = video.muted ? 0 : video.volume
  }
  syncVolume()
  video.addEventListener('volumechange', syncVolume)

  src.connect(gain)
  gain.connect(ctx.destination)
  return () => {
    video.removeEventListener('volumechange', syncVolume)
    capturedStream.getTracks().forEach(track => { track.stop() })
    ctx.close().catch(console.error)
  }
}

// 표준 captureStream이 없는 구버전 Firefox에서만 재생 우회를 유지한다.
// mozCaptureStream 이후 원본 비디오는 녹화 종료 후에도 계속 음소거될 수 있다.
// 컴포넌트가 재마운트되면 ref가 초기화되어 AudioContext가 중복 생성(소리 중복)되므로 모듈 단위로 관리
let firefoxAudio: { video: HTMLVideoElement, cleanup: () => void } | null = null

function ensureFirefoxAudio (video: HTMLVideoElement): void {
  if (firefoxAudio?.video === video) {
    return // 같은 비디오에 이미 적용됨
  }

  firefoxAudio?.cleanup() // 비디오 element가 바뀐 경우 이전 것 정리
  firefoxAudio = { video, cleanup: handleFirefoxAudio(video) }
}

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
    // 녹화 중에는 플레이어가 음소거되거나 교체되어도 중지할 수 있어야 한다.
    if (isRecording) {
      setIsRecording(false)
      window.clearInterval(canvasInterval.current)
      canvasInterval.current = undefined
      await _stopRecord(recorder, fastRec)
      return
    }

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

    setIsRecording(true)

    // 녹화 시작
    try {
      // 표준 captureStream은 원본 소리를 유지하므로 별도로 재생하면 소리가 겹친다.
      if (isMoz && typeof video.captureStream !== 'function') {
        ensureFirefoxAudio(video)
      }

      if (highFrameRateRec) {
        const [_videoRecorder, _canvasInterval] = await startHighFrameRateRecord(video) ?? [null, null, null]

        if (_videoRecorder === null || _canvasInterval === null) {
          setIsRecording(false)
          return
        }

        recorder.current = _videoRecorder
        canvasInterval.current = _canvasInterval
      } else { // 일반 녹화 시
        const _recorder = await startRecord(video)

        if (_recorder === null) {
          setIsRecording(false)
          return
        }
        recorder.current = _recorder
      }
    } catch (error) {
      setIsRecording(false)
      throw error
    }
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

  // 상태 변경에 따른 effect cleanup이 같은 recorder를 다시 중지하지 않게 먼저 분리한다.
  const currentRecorder = recorder.current
  recorder.current = undefined
  const info = await stopRecord(currentRecorder)

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
  window.open(browser.runtime.getURL('/record_result.html'))
  setTimeout(() => {
    if (isMoz) {
      // RecordInfo도 전송
      browser.runtime.sendMessage({
        type: 'mozRecordInfo',
        recordInfo: info
      }).catch(console.error)

      // Blob을 Firefox에서 Message로 전송
      fetch(info.resultBlobURL)
        .then(res => res.blob())
        .then(blob => {
          browser.runtime.sendMessage({
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
