import { createContext } from 'react'
import type { CheesePIPOptions } from '@/storage/options'
import type { KeyBindings } from '@/storage/keyBindings'

export type OptionContextValue = {
  options: CheesePIPOptions
  keyBindings: KeyBindings
  isLoading: boolean
  isReady: boolean
  isSaving: boolean
  error: string | null
  /** 저장에 성공하면 true, 실패했거나 다른 저장이 진행 중이면 false를 반환합니다. */
  updateOption: <K extends keyof CheesePIPOptions>(
    key: K,
    value: CheesePIPOptions[K]
  ) => Promise<boolean>
  /** 저장에 성공하면 true, 실패했거나 다른 저장이 진행 중이면 false를 반환합니다. */
  updateKeyBinding: <K extends keyof KeyBindings>(key: K, value: KeyBindings[K]) => Promise<boolean>
}

export const OptionContext = createContext<OptionContextValue | null>(null)
