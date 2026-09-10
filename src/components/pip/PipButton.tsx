import PipIcon from '@/assets/static/pip.svg?react'
import { CheeseButtonBase } from '../CheeseButtonBase'

export function PipButton() {
  return (
    <CheeseButtonBase
      title="PIP+ (준비 중)"
      className="cheese-pip-pip-button"
      iconSVG={<PipIcon />}
      disabled
    />
  )
}
