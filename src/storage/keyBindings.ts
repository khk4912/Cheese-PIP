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

export async function setKeyBindings(keyBindings: Partial<KeyBindings>): Promise<void> {
  await storage.setItem<KeyBindings>(KEYBINDINGS_STORAGE_KEY, mergeKeyBindings(keyBindings))
}
