import React, { useEffect, useState } from 'react'
import type { DownloadInfo, RecordInfo } from '../../../types/record_info'

const isMoz = navigator.userAgent.includes('Firefox')

interface MozRecordInfo {
  type: 'mozRecordInfo'
  recordInfo: RecordInfo
}

interface MozRecordBlob {
  type: 'mozRecordBlob'
  resultBlob: Blob
}

export function ResultVideo ({ setDownloadInfo }: { setDownloadInfo: React.Dispatch<React.SetStateAction<DownloadInfo | undefined>> }): React.ReactNode {
  const [recordInfo, setRecordInfo] = useState<RecordInfo>()

  const onLoadedMetadataHandler = async (): Promise<void> => {
    if (recordInfo === undefined) {
      return
    }

    const video = document.querySelector('video')

    if (!(video instanceof HTMLVideoElement)) {
      return
    }

    let duration: number

    video.currentTime = Number.MAX_SAFE_INTEGER
    await new Promise(resolve => setTimeout(resolve, 500)) // 0.5초 대기
    video.currentTime = 0

    duration = video.duration

    // video.duration이 Infinity일 경우, 녹화 시작 시간과 종료 시간을 이용하여 대략적인 계산
    if (duration === Infinity) {
      duration = (recordInfo.stopDateTime - recordInfo.startDateTime) / 1000 - 0.1
    }

    const fileName = `${recordInfo.streamInfo.streamerName}_${duration.toFixed(2)}s`
    setDownloadInfo({ recordInfo, length: duration, fileName })
  }

  useEffect(() => {
    if (isMoz) {
      getRecordInfo()
        .then((info) => { setRecordInfo(info) })
        .catch(console.error)

      chrome.runtime.onMessage.addListener((message: MozRecordBlob | MozRecordInfo) => {
        if (message.type === 'mozRecordBlob') {
          const blob = new Blob([message.resultBlob], { type: message.resultBlob.type })
          const url = URL.createObjectURL(blob)

          setRecordInfo((prev) => {
            if (!prev) return prev
            return { ...prev, resultBlobURL: url }
          })
        } else if (message.type === 'mozRecordInfo') {
          const info = message.recordInfo
          setRecordInfo(info)

          // 비디오 요소에 녹화된 Blob URL 설정
          const video = document.querySelector('video')
          if (video instanceof HTMLVideoElement) {
            video.src = info.resultBlobURL
          }
        }
      })
    } else {
      getRecordInfo()
        .then(setRecordInfo)
        .catch(console.error)
    }
  }, [])

  return (
    <video
      id='video'
      preload='metadata'
      src={recordInfo?.resultBlobURL}
      controls muted
      onLoadedMetadata={() => { onLoadedMetadataHandler().catch(console.log) }}
    />
  )
}
