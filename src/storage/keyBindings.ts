import { storage } from '#imports'
import { mergeStoredObject } from './merge'

export interface KeyBindings {
  rec: string
  screenshot: string
  pip: string
}

export type KeyBindingName = keyof KeyBindings

export const KEYBINDINGS_STORAGE_KEY = 'local:keyBindings' as const

export const DEFAULT_KEYBINDINGS: KeyBindings = {
  rec: 'R',
  screenshot: 'S',
  pip: 'P',
}

export function mergeKeyBindings(keyBindings?: Partial<KeyBindings> | null): KeyBindings {
  return mergeStoredObject(DEFAULT_KEYBINDINGS, keyBindings)
}

export async function getKeyBindings(): Promise<KeyBindings> {
  const keyBindings = await storage.getItem<Partial<KeyBindings>>(KEYBINDINGS_STORAGE_KEY)
  return mergeKeyBindings(keyBindings)
}

export const setKeyBindings = async <T extends keyof KeyBindings>(
  key: T,
  value: NonNullable<KeyBindings[T]>
): Promise<void> => {
  const keyBindings = await getKeyBindings()
  await storage.setItem<Required<KeyBindings>>(KEYBINDINGS_STORAGE_KEY, {
    ...keyBindings,
    [key]: value,
  })
}
