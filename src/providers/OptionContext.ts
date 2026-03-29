import { createContext } from 'react'
import type { KeyBindings, CheesePIPOptions } from '@/utils/options'

export type OptionContextValue = {
  options: CheesePIPOptions
  keyBindings: Required<KeyBindings>
  isLoading: boolean
  updateOption: <K extends keyof CheesePIPOptions>(key: K, value: CheesePIPOptions[K]) => Promise<void>
  updateKeyBinding: <K extends keyof KeyBindings>(key: K, value: NonNullable<KeyBindings[K]>) => Promise<void>
}

export const OptionContext = createContext<OptionContextValue | null>(null)
