import type { DownloadMessage } from '../types/message'

/*
  현재 페이지가 VOD, Clip, Shorts(새로운 클립 페이지) 페이지인지
  URL을 통해 파악합니다.
*/

export const isMoz = navigator.userAgent.includes('Firefox')
export const isWhale = navigator.userAgent.includes('Whale')

export const isVODPage = (): boolean => {
  return window.location.pathname.startsWith('/video/')
}

export const isLivePage = (): boolean => {
  return window.location.pathname.startsWith('/live/')
}

export const isClipPage = (): boolean => {
  return window.location.pathname.startsWith('/embed/clip/')
}

export const isShortsPage = (): boolean => {
  return window.location.pathname.startsWith('/shorts/')
}

/**
 * URL의 파일을 다운로드 하기 위해 Worker에 다운로드 요청 메시지를 보냅니다.
 * (Firefox에서는 a 태그를 사용하여 다운로드 합니다.)
 *
 * @param url 다운로드할 파일의 URL
 * @param title 다운로드할 파일의 이름
 * @param ext 다운로드할 파일의 확장자 (optional)
 */
export async function download (url: string, title: string, ext?: string): Promise<void> {
  if (isMoz || isWhale) {
    const a = document.createElement('a')
    a.href = url
    a.download = sanitizeFileName(`${title.trim()}.${ext ?? 'mp4'}`)
    a.click()
    return
  }

  await chrome.runtime.sendMessage(
    {
      type: 'download',
      data: {
        url,
        fileName: sanitizeFileName(`${title.trim()}.${ext ?? 'mp4'}`)
      }
    } satisfies DownloadMessage
  )
}

export function downloadAtag (url: string, title: string, ext?: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = sanitizeFileName(`${title.trim()}.${ext ?? 'mp4'}`)
  a.click()
}
