import { browser } from 'wxt/browser'

interface BooleanOptions {
  pip?: boolean
  rec?: boolean
  fastRec?: boolean
  seek?: boolean
  screenshot?: boolean
  screenshotPreview?: boolean
  highFrameRateRec?: boolean
  preferMP4?: boolean
  preferHQ?: boolean
  autoPIP?: boolean
  favorites?: boolean
}

export interface OtherOptions {
  videoBitsPerSecond?: number
}

export interface Option extends BooleanOptions, OtherOptions { }
export const DEFAULT_OPTIONS: Required<Option> = {
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
  rec?: string
  screenshot?: string
  pip?: string
}

export const DEFAULT_KEYBINDINGS: Required<KeyBindings> = {
  rec: 'R',
  screenshot: 'S',
  pip: 'P'
}

export const getOption = async (): Promise<Required<Option>> => {
  const option = ((await browser.storage.local.get('option'))?.option ?? {}) as Option
  const result = { ...DEFAULT_OPTIONS }

  for (const key in option) {
    if (key in DEFAULT_OPTIONS) {
      const k = key as keyof Option
      Object.assign(result, { [k]: option[k] })
    }
  }

  return result
}

export const setOption = async <T extends keyof Option>(option: T, value: NonNullable<Option[T]>): Promise<void> => {
  const options = ((await browser.storage.local.get('option'))?.option ?? {}) as Option
  options[option] = value

  await browser.storage.local.set({ option: options })
}

export const getKeyBindings = async (): Promise<Required<KeyBindings>> => {
  const keyBindings = ((await browser.storage.local.get('keyBindings'))?.keyBindings ?? {}) as KeyBindings
  const result = { ...DEFAULT_KEYBINDINGS }

  for (const key in keyBindings) {
    if (key in DEFAULT_KEYBINDINGS) {
      const k = key as keyof KeyBindings
      Object.assign(result, { [k]: keyBindings[k] })
    }
  }

  return result
}

export const setKeyBindings = async <T extends keyof KeyBindings>(key: T, value: NonNullable<KeyBindings[T]>): Promise<void> => {
  const keyBindings = ((await browser.storage.local.get('keyBindings'))?.keyBindings ?? {}) as KeyBindings
  keyBindings[key] = value

  await browser.storage.local.set({ keyBindings })
}

export interface FavoritesList {
  favorites: Set<string>
}

export const getFavorites = async (): Promise<Set<string>> => {
  const { favorites } = (await browser.storage.local.get('favorites'))
  return favorites ? new Set(favorites) : new Set<string>()
}

export const addFavorite = async (channel: string): Promise<void> => {
  const favorites = await getFavorites()
  favorites.add(channel)

  await browser.storage.local.set({ favorites: Array.from(favorites) })
}

export const removeFavorite = async (channel: string): Promise<void> => {
  const favorites = await getFavorites()
  favorites.delete(channel)

  await browser.storage.local.set({ favorites: Array.from(favorites) })
}
