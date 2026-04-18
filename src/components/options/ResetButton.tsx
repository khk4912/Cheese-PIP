import { useContext } from 'react'

import style from './ResetButton.module.css'
import { OptionContext } from './OptionView'
import { DEFAULT_OPTIONS } from '@/types/options'
import { browser } from 'wxt/browser'

export function ResetButton (): React.ReactNode {
  const [, setOptionContext] = useContext(OptionContext)

  const handleClick = (): void => {
    browser.storage.local.remove(['option', 'keyBindings'])
      .catch(console.error)

    setOptionContext(() => DEFAULT_OPTIONS)
  }

  return (
    <button onClick={handleClick} id={style.resetButton}>
      설정 초기화
    </button>
  )
}
