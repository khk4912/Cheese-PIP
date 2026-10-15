import { inject } from '@/utils/inject'
import { OptionProvider } from '@/providers/OptionProvider'
import { PlayerButtonsRenderer } from '@/components/PlayerButtons'

function mount() {
  const container = document.createElement('div')
  container.id = 'cheese-pip-ui-root'
  document.body.appendChild(container)

  const root = inject(
    <OptionProvider>
      <PlayerButtonsRenderer />
    </OptionProvider>,
    container
  )

  return () => {
    root.unmount()
    container.remove()
  }
}

export function RenderUI() {
  let unmount = mount()

  // 변경 감지 후 remount
  const remount = () => {
    unmount()
    unmount = mount()
  }

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
