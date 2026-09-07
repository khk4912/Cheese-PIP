import { inject } from '@/utils/inject'
import { OptionProvider } from '@/providers/OptionProvider'
import { PlayerButtonsRenderer } from '@/components/PlayerButtons'

export function RenderUI() {
  let div = document.createElement('div')
  div.id = 'cheese-pip-ui-root'

  let root = inject(
    <OptionProvider>
      <PlayerButtonsRenderer />
    </OptionProvider>,
    div
  )

  document.body.appendChild(div)
  const remount = () => {
    root.unmount()
    div.remove()

    div = document.createElement('div')
    div.id = 'cheese-pip-ui-root'

    document.body.appendChild(div)
    root = inject(
      <OptionProvider>
        <PlayerButtonsRenderer />
      </OptionProvider>,
      div
    )
  }

  const unmount = () => {
    root.unmount()
    div.remove()
  }

  // 변경 감지 후 remount

  // firefox window.navigation fallback 로직
  if (import.meta.env.BROWSER === 'firefox') {
    let previousHref = window.location.href
    const observer = new MutationObserver(() => {
      const nextHref = window.location.href
      if (previousHref === nextHref) return

      previousHref = nextHref
      remount()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      unmount()
    }
  }

  // window.navigation 기반
  const navigation = window.navigation
  const handleNavigate = (event: NavigateEvent) => {
    if (event.downloadRequest !== null) return
    remount()
  }

  navigation?.addEventListener('navigate', handleNavigate)

  return () => {
    navigation?.removeEventListener('navigate', handleNavigate)
    unmount()
  }
}
