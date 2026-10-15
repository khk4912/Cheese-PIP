import { storage } from '#imports'

export const FAVORITES_STORAGE_KEY = 'local:favorites' as const

function normalizeFavorites(favorites?: unknown): string[] {
  if (!favorites || typeof (favorites as Iterable<string>)[Symbol.iterator] !== 'function') {
    return []
  }

  return Array.from(
    new Set(
      Array.from(favorites as Iterable<string>).filter(
        (channel): channel is string => typeof channel === 'string'
      )
    )
  )
}

async function getFavoriteList(): Promise<string[]> {
  const favorites = await storage.getItem<unknown>(FAVORITES_STORAGE_KEY)
  return normalizeFavorites(favorites)
}

async function setFavoriteList(favorites: Iterable<string>): Promise<void> {
  await storage.setItem<string[]>(FAVORITES_STORAGE_KEY, normalizeFavorites(favorites))
}

export async function getFavorites(): Promise<Set<string>> {
  return new Set(await getFavoriteList())
}

export async function addFavorite(channel: string): Promise<void> {
  const favorites = await getFavorites()
  favorites.add(channel)

  await setFavoriteList(favorites)
}

export async function removeFavorite(channel: string): Promise<void> {
  const favorites = await getFavorites()
  favorites.delete(channel)

  await setFavoriteList(favorites)
}
