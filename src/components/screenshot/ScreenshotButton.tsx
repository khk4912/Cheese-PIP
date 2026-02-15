import ReactDOM from 'react-dom'

import ScreenshotIcon from '@/assets/static/screenshot.svg?react'
import { getKeyBindings, getOption } from '@/types/options'

export function ScreenShotPortal (): React.ReactNode {
  const target = usePortal({
    id: 'chzzk-screenshot-portal',
    targetSelector: '.pzp-pc__bottom-buttons-right',
    position: 'prepend'
  })

  return (
    <ScreenShotPortalContainer target={target}>
      <ScreenshotButton />
    </ScreenShotPortalContainer>
  )
}

function ScreenShotPortalContainer ({ target, children }: { target: Element | null, children: React.ReactNode }) {
  return target ? ReactDOM.createPortal(children, target) : null
}

/**
 * ScreenshotButton component
 *
 * 스크린샷 버튼 컴포넌트입니다.
 */
function ScreenshotButton (): React.ReactNode {
  const clickHandler = (): void => {
    const dataURL = screenshot()
    if (dataURL === undefined) {
      return
    }

    saveOrPreview(dataURL)
      .catch(console.info)
  }
  const [key, setKey] = useState<string>('')

  useEffect(() => {
    getKeyBindings()
      .then((k) => { setKey(k.screenshot) })
      .catch(console.error)
  }, [])

  useShortcut(key, clickHandler)

  return (
    <button
      className='pzp-button pzp-setting-button pzp-pc-setting-button pzp-pc__setting-button chzzk-screenshot-button'
      onClick={clickHandler}
    >
      <span className='pzp-button__tooltip pzp-button__tooltip--top'>스크린샷 ({key})</span>
      <span className='pzp-ui-icon pzp-pc-setting-button__icon'>
        <ScreenshotIcon />
      </span>
    </button>
  )
}

/**
 * 스트림 화면을 스크린샷 합니다.
 *
 * @returns 스크린샷 이미지 dataURL (Base64)
 */
function screenshot (): string | undefined {
  const video: HTMLVideoElement | null = document.querySelector('.webplayer-internal-video')
  if (video === null) {
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')

  if (ctx === null) {
    console.error('Failed to get 2d context, cannot take a screenshot')
    return
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

/**
 * 설정에 따라 이미지 미리보기를 표시하거나 즉시 다운로드합니다.
 *
 * @param dataURL 스크린샷 이미지 dataURL (Base64)
 */
async function saveOrPreview (dataURL: string): Promise<void> {
  const { screenshotPreview } = await getOption()
  const info = getStreamInfo(document)
  const yyyymmddhhmmss = (date: Date): string => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mi = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')

    return `${yyyy}${mm}${dd}${hh}${mi}${ss}`
  }

  const title = `${info.streamerName}_${info.streamTitle}_${yyyymmddhhmmss(new Date())}`

  if (screenshotPreview) {
    createDraggablePreview(dataURL, title)
  } else {
    downloadAtag(dataURL, sanitizeFileName(title), 'png')
  }
}
