import { inject } from '@/utils/inject'
import { OptionProvider } from '@/providers/OptionProvider'
import { PlayerButtonsRenderer } from '@/components/PlayerButtons'

export function RenderUI () {
  let div = document.createElement('div')
  div.id = 'cheese-pip-ui-root'

  let root = inject(
    <OptionProvider>
      <PlayerButtonsRenderer />
    </OptionProvider>,
    div)

  document.body.appendChild(div)
  window.navigation?.addEventListener('navigate', (event) => {
    if (event.downloadRequest !== null) {
      return
    }

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
  })
}
