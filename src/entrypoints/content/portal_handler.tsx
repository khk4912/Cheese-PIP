import { useEffect, useMemo } from 'react'
import { browser } from 'wxt/browser'
import { isMoz } from '@/utils/download'

const SELECTORS = {
  FAVORITE_BUTTON: '[class*="video_information_alarm"], [class*="channel_profile_alarm"]',
  CONTROL_BUTTONS: '.pzp-pc__bottom-buttons-right'
} as const

const DELAYS = {
  PREFER_HQ: 1000
} as const

/**
 * InjectButtons component
 *
 * Cheese-PIP 확장에서 추가하는 대부분의 버튼을 주입하는 컴포넌트입니다.
 *
 * @returns 주입될 버튼 컴포넌트
 */
export function InjectButtons (): React.ReactNode {
  // DOM 요소 targeting
  const controlTarget = useElementTarget(SELECTORS.CONTROL_BUTTONS)

  // 페이지 타입 확인
  const pageType = usePageType()

  // 옵션 로드
  const { options } = useOptions()

  // monekypatching
  useSeekScript(options?.seek ?? false, controlTarget !== undefined)

  // 최고 화질 선호 설정
  usePreferHQ(options?.preferHQ ?? false)

  const shouldShowFavorites = options?.favorites
  const shouldShowSeek = (options?.seek ?? false) && !(pageType.isVOD || pageType.isClip)
  const shouldShowVideoControls = pageType.isLive || pageType.isVOD
  const shouldShowPIP = (options?.pip ?? false) && pageType.isLive && !isMoz
  const shouldShowScreenshot = (options?.screenshot ?? false) && !pageType.isClip
  const shouldShowRecord = options?.rec ?? false

  return (
    <>
      {/* 즐겨찾기 버튼 */}
      {shouldShowFavorites && <FavoritesButtonPortal />}

      {/* Seek 포털 */}
      {shouldShowSeek && <SeekPortal />}

      {/* Buttons */}
      {shouldShowVideoControls && (
        <>
          {shouldShowPIP && <PIPPortal />}
          {shouldShowScreenshot && <ScreenShotPortal />}
          {shouldShowRecord && <RecordPortal />}
        </>
      )}
    </>
  )
}

function useSeekScript (enabled: boolean, targetReady: boolean) {
  useEffect(() => {
    if (!enabled || !targetReady) return

    const script = document.createElement('script')
    script.src = browser.runtime.getURL('/monkeypatch/seek.js')
    document.body.appendChild(script)
  }, [enabled, targetReady])
}

function usePreferHQ (enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const timer = setTimeout(() => {
      setMaxHQ().catch(console.info)
    }, DELAYS.PREFER_HQ)

    return () => clearTimeout(timer)
  }, [enabled])
}

function usePageType () {
  return useMemo(() => ({
    isLive: isLivePage(),
    isVOD: isVODPage(),
    isClip: isClipPage()
  }), [])
}
