import { useOptions } from '@/hooks/useOptions'
import { usePortal } from '@/hooks/element'
import ReactDOM from 'react-dom'
import { RecordButton } from './record/RecordButton'

function PlayerButtonsContainer({ children }: { children: React.ReactNode }) {
  const portal = usePortal({
    id: 'cheese-pip-player-buttons',
    targetSelector: '.pzp-pc__bottom-buttons-right',
    position: 'prepend',
  })

  return portal && ReactDOM.createPortal(children, portal)
}

export function PlayerButtonsRenderer() {
  const { options, isReady } = useOptions()
  if (!isReady || !options.rec) {
    return null
  }

  return (
    <PlayerButtonsContainer>
      <RecordButton />
    </PlayerButtonsContainer>
  )
}
