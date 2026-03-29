import { storage } from '#imports'

interface BooleanOptions {
  pip: boolean
  rec: boolean
  fastRec: boolean
  seek: boolean
  screenshot: boolean
  screenshotPreview: boolean
  highFrameRateRec: boolean
  preferMP4: boolean
  preferHQ: boolean
  autoPIP: boolean
  favorites: boolean
}

export interface OtherOptions {
  videoBitsPerSecond: number
}

export const OPTIONS_STORAGE_KEY = 'local:options' as const
export const KEYBINDINGS_STORAGE_KEY = 'local:keyBindings' as const
export const FAVORITES_STORAGE_KEY = 'local:favorites' as const

export interface CheesePIPOptions extends BooleanOptions, OtherOptions { }
export const DEFAULT_OPTIONS: Required<CheesePIPOptions> = {
  pip: false,
  rec: true,
  fastRec: false,
  seek: false,
  screenshot: true,
  screenshotPreview: true,
  highFrameRateRec: false,
  preferMP4: false,
  videoBitsPerSecond: 4000000,
  preferHQ: false,
  autoPIP: true,
  favorites: false
}

export interface KeyBindings {
  rec: string
  screenshot: string
  pip: string
}

export const DEFAULT_KEYBINDINGS: Required<KeyBindings> = {
  rec: 'R',
  screenshot: 'S',
  pip: 'P'
}

function mergeStoredObject<T extends Record<string, unknown>> (defaults: T, stored?: Partial<T> | null): T {
  const merged = { ...defaults }

  if (!stored) {
    return merged
  }

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = stored[key]
    if (value !== undefined) {
      merged[key] = value
    }
  }

  return merged
}

export function mergeOptions (options?: Partial<CheesePIPOptions> | null): CheesePIPOptions {
  return mergeStoredObject<Required<CheesePIPOptions>>(DEFAULT_OPTIONS, options)
}

export async function getOptions (): Promise<CheesePIPOptions> {
  const options = await storage.getItem<Partial<CheesePIPOptions>>(OPTIONS_STORAGE_KEY)
  return mergeOptions(options)
}

export async function setOptions (options: Partial<CheesePIPOptions>): Promise<void> {
  await storage.setItem<CheesePIPOptions>(OPTIONS_STORAGE_KEY, mergeOptions(options))
}

export function mergeKeyBindings (keyBindings?: Partial<KeyBindings> | null): Required<KeyBindings> {
  return mergeStoredObject<Required<KeyBindings>>(DEFAULT_KEYBINDINGS, keyBindings)
}

export const getKeyBindings = async (): Promise<Required<KeyBindings>> => {
  const keyBindings = await storage.getItem<Partial<KeyBindings>>(KEYBINDINGS_STORAGE_KEY)
  return mergeKeyBindings(keyBindings)
}

export const setKeyBindings = async <T extends keyof KeyBindings>(key: T, value: NonNullable<KeyBindings[T]>): Promise<void> => {
  const keyBindings = await getKeyBindings()
  await storage.setItem<Required<KeyBindings>>(KEYBINDINGS_STORAGE_KEY, {
    ...keyBindings,
    [key]: value,
  })
}

function normalizeFavorites (favorites?: unknown): string[] {
  if (!favorites || typeof (favorites as Iterable<string>)[Symbol.iterator] !== 'function') {
    return []
  }

  return Array.from(new Set(
    Array.from(favorites as Iterable<string>).filter((channel): channel is string => typeof channel === 'string')
  ))
}

async function getFavoriteList (): Promise<string[]> {
  const favorites = await storage.getItem<unknown>(FAVORITES_STORAGE_KEY)
  return normalizeFavorites(favorites)
}

async function setFavoriteList (favorites: Iterable<string>): Promise<void> {
  await storage.setItem<string[]>(FAVORITES_STORAGE_KEY, normalizeFavorites(favorites))
}

export const getFavorites = async (): Promise<Set<string>> => {
  return new Set(await getFavoriteList())
}

export const addFavorite = async (channel: string): Promise<void> => {
  const favorites = await getFavorites()
  favorites.add(channel)

  await setFavoriteList(favorites)
}

export const removeFavorite = async (channel: string): Promise<void> => {
  const favorites = await getFavorites()
  favorites.delete(channel)

  await setFavoriteList(favorites)
}
