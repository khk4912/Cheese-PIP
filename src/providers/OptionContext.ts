import { createContext } from 'react'
import type { CheesePIPOptions } from '@/storage/options'
import type { KeyBindings } from '@/storage/keyBindings'

export type OptionContextValue = {
  options: CheesePIPOptions
  keyBindings: Required<KeyBindings>
  isLoading: boolean
  isReady: boolean
  isSaving: boolean
  error: string | null
  updateOption: <K extends keyof CheesePIPOptions>(
    key: K,
    value: CheesePIPOptions[K]
  ) => Promise<void>
  updateKeyBinding: <K extends keyof KeyBindings>(
    key: K,
    value: NonNullable<KeyBindings[K]>
  ) => Promise<void>
}

export const OptionContext = createContext<OptionContextValue | null>(null)
