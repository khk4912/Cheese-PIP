import { useState } from 'react'

import type { DownloadInfo } from '../../../types/record_info'
import { ButtonBase } from './Button'
import { TrimModalPortal } from './TrimModal'
import { SegmentizeModalPortal } from './SegmentizeModal'
import { ProgressModalPortal } from './ProgressModal'

export function DownloadButtons (
  { downloadInfo }:
  { downloadInfo: DownloadInfo | undefined }
): React.ReactNode {
  const [trimModalState, setTrimModalState] = useState(false)
  const [segmentizeModalState, setSegmentizeModalState] = useState(false)
  const [progressModalState, setProgressModalState] = useState(false)

  const isMP4 = downloadInfo?.recordInfo.isMP4 ?? false
  const [ffmpeg, isFFmpegReady, progress, setProgress] = useFFmpeg(downloadInfo?.length ?? NaN)

  const downloadAfterTranscode = (to: 'MP4' | 'MP4-AAC' | 'GIF' | 'WEBP'): void => {
    setProgress(0)
    setProgressModalState(true)

    const url = downloadInfo?.recordInfo.resultBlobURL

    if (url === undefined) {
      return
    }

    switch (to) {
      case 'MP4':
        toMP4(ffmpeg.current, url)
          .then((url) => { download(url, 'mp4') })
          .catch(console.info)
          .finally(
            () => { setProgressModalState(false) }
          )
        break
      case 'MP4-AAC':
        toMP4AAC(ffmpeg.current, url)
          .then((url) => { download(url, 'mp4') })
          .catch(console.info)
          .finally(
            () => { setProgressModalState(false) }
          )
        break
      case 'GIF':
        toGIF(ffmpeg.current, url)
          .then((url) => { download(url, 'gif') })
          .catch(console.info)
          .finally(
            () => { setProgressModalState(false) }
          )
        break
      case 'WEBP':
        toWEBP(ffmpeg.current, url)
          .then((url) => { download(url, 'webp') })
          .catch(console.info)
          .finally(
            () => { setProgressModalState(false) }
          )
        break
    }
  }

  const download = (
    url: string | undefined,
    ext: string,
    title?: string): void => {
    if (url === undefined) {
      return
    }

    const a = document.createElement('a')
    a.href = url
    a.download = sanitizeFileName(title ?? `${downloadInfo?.fileName ?? 'title'}.${ext}`)
    a.click()
  }

  return (
    <div className={`download-buttons ${downloadInfo === undefined || trimModalState || segmentizeModalState ? 'disabled' : ''}`}>
      <ButtonBase onClick={() => { download(downloadInfo?.recordInfo?.resultBlobURL, isMP4 ? 'mp4' : 'webm') }}>
        다운로드
      </ButtonBase>

      <h3>변환 후 다운로드</h3>
      {isMP4 && '이미 MP4로 녹화되어 MP4로 변환은 숨겨졌어요.'}

      <div className={`after-transcode ${!isFFmpegReady ? 'disabled' : ''}`}>

        {!isMP4 &&
          <>
            <ButtonBase onClick={() => { downloadAfterTranscode('MP4') }}>MP4</ButtonBase>
            <ButtonBase onClick={() => { downloadAfterTranscode('MP4-AAC') }}>MP4 (호환성)</ButtonBase>
          </>}
        <ButtonBase onClick={() => { downloadAfterTranscode('GIF') }}>GIF</ButtonBase>
        <ButtonBase onClick={() => { downloadAfterTranscode('WEBP') }}>WEBP</ButtonBase>
      </div>
      <div className={`after-transcode ${!isFFmpegReady ? 'disabled' : ''}`}>
        <ButtonBase onClick={() => {
          setProgress(0)
          setTrimModalState(true)
        }}
        >자르고 다운로드
        </ButtonBase>
        <ButtonBase onClick={() => {
          setProgress(0)
          setSegmentizeModalState(true)
        }}
        >분할 다운로드
        </ButtonBase>
      </div>

      {trimModalState && <TrimModalPortal ffmpeg={ffmpeg.current} progress={progress} setModalState={setTrimModalState} downloadInfo={downloadInfo} />}
      {segmentizeModalState && <SegmentizeModalPortal ffmpeg={ffmpeg.current} progress={progress} setModalState={setSegmentizeModalState} downloadInfo={downloadInfo} />}
      {progressModalState && <ProgressModalPortal progress={progress} />}
    </div>
  )
}
