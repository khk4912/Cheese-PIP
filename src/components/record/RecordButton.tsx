import { useOptions } from '@/hooks/useOptions'

import { CheeseButtonBase } from '../CheeseButtonBase'
import { useShortcut } from '@/hooks/useShortcut'
import RecordIcon from '@/assets/static/rec.svg?react'
import { useRecord } from '@/hooks/useRecord'

const RecordingColor = '#ff6161'

export function RecordButton() {
  const { keyBindings } = useOptions()
  const { rec: recKey } = keyBindings

  const { toggle, status } = useRecord()
  const isRecording = status === 'recording'

  useShortcut(recKey, toggle)

  return (
    <CheeseButtonBase
      title={`${isRecording ? '녹화 중지' : '녹화'} (${recKey})`}
      className="cheese-pip-record-button"
      onClick={toggle}
      icon={<RecordIcon fill={isRecording ? RecordingColor : 'currentColor'} />}
    />
  )
}
