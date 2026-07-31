export type FavoritePageContext = {
  channelId: string
  page: 'channel' | 'live'
}

const CHANNEL_ID_PATTERN = '[0-9a-f]{32}'
const LIVE_PATH_PATTERN = new RegExp(`^/live/(${CHANNEL_ID_PATTERN})/?$`, 'i')
const CHANNEL_PATH_PATTERN = new RegExp(`^/(${CHANNEL_ID_PATTERN})/?$`, 'i')

export function getFavoritePageContext (pathname: string): FavoritePageContext | null {
  const liveMatch = pathname.match(LIVE_PATH_PATTERN)
  if (liveMatch) {
    return {
      channelId: liveMatch[1],
      page: 'live'
    }
  }

  const channelMatch = pathname.match(CHANNEL_PATH_PATTERN)
  if (channelMatch) {
    return {
      channelId: channelMatch[1],
      page: 'channel'
    }
  }

  return null
}
