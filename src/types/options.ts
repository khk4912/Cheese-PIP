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

export interface FavoriteChannel {
  channelId: string
  channelName: string
  channelImageUrl: string | null
  openLive: boolean
}

interface ChannelApiResponse {
  code: number
  message: string | null
  content: {
    channelId: string
    channelName: string
    channelImageUrl: string | null
  } | null
}

interface LiveDetailApiResponse {
  content: {
    status: string | null
    channel?: {
      channelId: string
      channelName: string
      channelImageUrl: string | null
    }
  } | null
}

const normalizeFavoriteId = (favorite: unknown): string | null => {
  if (typeof favorite === 'string') return favorite
  if (
    typeof favorite === 'object' &&
    favorite !== null &&
    'channelId' in favorite &&
    typeof favorite.channelId === 'string'
  ) {
    return favorite.channelId
  }

  return null
}

const fetchChannel = async (channelId: string): Promise<FavoriteChannel | null> => {
  const res = await fetch(`https://api.chzzk.naver.com/service/v1/channels/${channelId}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    },
    mode: 'cors'
  })
  if (!res.ok) return null

  const data = (await res.json()) as ChannelApiResponse
  if (!data.content) return null

  return {
    channelId: data.content.channelId,
    channelName: data.content.channelName,
    channelImageUrl: data.content.channelImageUrl,
    openLive: false
  }
}

const fetchLiveDetail = async (channelId: string): Promise<FavoriteChannel | null> => {
  const res = await fetch(`https://api.chzzk.naver.com/service/v3.3/channels/${channelId}/live-detail`, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    },
    mode: 'cors'
  })
  if (!res.ok) return null

  const data = (await res.json()) as LiveDetailApiResponse
  if (!data.content) return null

  return {
    channelId: data.content.channel?.channelId ?? channelId,
    channelName: data.content.channel?.channelName ?? channelId,
    channelImageUrl: data.content.channel?.channelImageUrl ?? null,
    openLive: data.content.status === 'OPEN'
  }
}

const getFavoriteIds = async (): Promise<string[]> => {
  const { favorites } = (await browser.storage.local.get('favorites'))
  if (!Array.isArray(favorites)) return []

  const favoriteIds = Array.from(
    new Set(
      favorites
        .map(normalizeFavoriteId)
        .filter((channelId): channelId is string => channelId !== null)
    )
  )

  if (JSON.stringify(favoriteIds) !== JSON.stringify(favorites)) {
    await browser.storage.local.set({ favorites: favoriteIds })
  }

  return favoriteIds
}

export const getFavoriteChannels = async (): Promise<FavoriteChannel[]> => {
  const favoriteIds = await getFavoriteIds()

  const favoriteChannels = await Promise.all(
    favoriteIds.map(async channelId => {
      const liveDetail = await fetchLiveDetail(channelId).catch(() => null)
      const channel = liveDetail ?? await fetchChannel(channelId).catch(() => null)

      return {
        ...(channel ?? {
          channelId,
          channelName: channelId,
          channelImageUrl: null,
          openLive: false
        }),
        openLive: liveDetail?.openLive ?? false
      }
    })
  )

  return favoriteChannels.sort((a, b) => Number(b.openLive) - Number(a.openLive))
}

export const getFavorites = async (): Promise<Set<string>> => {
  return new Set(await getFavoriteIds())
}

export const addFavorite = async (channel: string | FavoriteChannel): Promise<void> => {
  const favoriteIds = await getFavoriteIds()
  const channelId = typeof channel === 'string' ? channel : channel.channelId

  if (!favoriteIds.includes(channelId)) favoriteIds.push(channelId)

  await browser.storage.local.set({ favorites: favoriteIds })
}

export const removeFavorite = async (channel: string): Promise<void> => {
  const favoriteIds = await getFavoriteIds()

  await browser.storage.local.set({
    favorites: favoriteIds.filter(channelId => channelId !== channel)
  })
}
