import { createRoot, type Root } from 'react-dom/client'
import { InjectButtons } from './portal_handler'

/**
 * InjectButtons 컴포넌트를 목표 위치에 주입합니다.
 */
export function injectButton () {
  let div = document.createElement('div')
  div.id = 'cheese-pip-buttons'

  document.body.appendChild(div)

  let root = inject(<InjectButtons />, div)

  if (isMoz) {
    let oldHref = window.location.href
    const body = document.querySelector('body') as HTMLElement

    const _observer = new MutationObserver(() => {
      if (oldHref !== window.location.href) {
        root.unmount()
        div.remove()

        oldHref = window.location.href

        div = document.createElement('div')
        div.id = 'cheese-pip-buttons'

        document.body.appendChild(div)
        root = inject(<InjectButtons />, div)
      }
    })

    _observer.observe(body, {
      childList: true,
      subtree: true
    })

    return
  }

  window.navigation?.addEventListener('navigate', (evt) => {
    if (evt.downloadRequest !== null) {
      return
    }

    root.unmount()
    div.remove()

    div = document.createElement('div')
    div.id = 'cheese-pip-buttons'

    // tg.insertBefore(div, tg.firstChild)
    document.body.appendChild(div)
    root = inject(<InjectButtons />, div)
  })
}

export function inject (node: React.ReactNode, target: HTMLElement): Root {
  const root = createRoot(target)
  root.render(node)

  return root
}
