import { useState } from 'react'

import { CheeseButtonBase } from '../CheeseButtonBase'
import { useShortcut } from '@/hooks/keyBinding'
import RecordIcon from '@/assets/static/rec.svg?react'

const RecordingColor = '#ff6161'

export function RecordButton () {
  const [isRecording, setIsRecording] = useState(false)
  const { keyBindings } = useOptions()
  const { rec: recKey } = keyBindings

  useShortcut(recKey, () => {
    setIsRecording((prev) => !prev)
  })

  const handleClick = () => {
    setIsRecording((prev) => !prev)
  }

  return (
    <CheeseButtonBase
      title={`녹화 ${isRecording ? '중지' : ''} (${recKey})`}
      className='cheese-pip-record-button'
      onClick={handleClick}
      iconSVG={
        <RecordIcon fill={isRecording ? RecordingColor : 'currentColor'} />
      }
    />
  )
}
