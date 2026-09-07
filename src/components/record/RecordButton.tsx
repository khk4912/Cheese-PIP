import { useOptions } from '@/hooks/useOptions'

import { CheeseButtonBase } from '../CheeseButtonBase'
import { useShortcut } from '@/hooks/keyBinding'
import RecordIcon from '@/assets/static/rec.svg?react'
import { useRecord } from '@/hooks/record'

const RecordingColor = '#ff6161'

export function RecordButton() {
  const { keyBindings } = useOptions()
  const { rec: recKey } = keyBindings

  const { toggle, status } = useRecord()
  const isRecording = status === 'recording'

  useShortcut(recKey, toggle)

  return (
    <CheeseButtonBase
      title={`녹화 ${isRecording ? '중지' : ''} (${recKey})`}
      className="cheese-pip-record-button"
      onClick={toggle}
      iconSVG={<RecordIcon fill={isRecording ? RecordingColor : 'currentColor'} />}
    />
  )
}
