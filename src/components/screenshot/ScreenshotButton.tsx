import ScreenshotIcon from '@/assets/static/screenshot.svg?react'
import { CheeseButtonBase } from '../CheeseButtonBase'

export function ScreenshotButton() {
  return (
    <CheeseButtonBase
      title="스크린샷 (준비 중)"
      className="cheese-pip-screenshot-button"
      iconSVG={<ScreenshotIcon />}
      disabled
    />
  )
}
