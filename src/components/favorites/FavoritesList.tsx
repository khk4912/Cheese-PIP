import ReactDOM from 'react-dom'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { getFavoriteChannels, type FavoriteChannel } from '@/types/options'
import { browser, type Browser } from 'wxt/browser'
import styles from './FavoritesList.module.css'

export function FavoritesListPortal (): React.ReactNode {
  const target = usePortal({
    id: 'cheese-pip-favorites-list',
    targetSelector: '#sidebar nav',
    position: 'after'
  })

  return ReactDOM.createPortal(<FavoritesList />, target)
}

const EXPANDED_SIDEBAR_MIN_WIDTH = 120

const isSidebarExpanded = (sidebar: Element): boolean =>
  sidebar.getBoundingClientRect().width >= EXPANDED_SIDEBAR_MIN_WIDTH

function FavoritesList (): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [favoriteChannels, setFavoriteChannels] = useState<FavoriteChannel[]>([])

  const fetchFavorites = async () => {
    try {
      setFavoriteChannels(await getFavoriteChannels())
    } catch (error) {
      console.log(error)
    }
  }

  const refreshFavorites = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await fetchFavorites()
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const storageChanged = (changes: { [key: string]: Browser.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return

      if (changes.favorites) {
        fetchFavorites().catch(console.log)
      }
    }

    fetchFavorites().catch(console.log)
    browser.storage.onChanged.addListener(storageChanged)

    return () => browser.storage.onChanged.removeListener(storageChanged)
  }, [])

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null
    let cancelled = false

    waitForElement('#sidebar')
      .then(sidebar => {
        if (cancelled) return

        const updateExpandedState = () => {
          setIsExpanded(isSidebarExpanded(sidebar))
        }

        updateExpandedState()

        resizeObserver = new ResizeObserver(updateExpandedState)
        resizeObserver.observe(sidebar)
      })
      .catch(console.error)

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
    }
  }, [])

  if (favoriteChannels.length === 0) return null

  return (
    <nav
      aria-label='스트리머 즐겨찾기'
      className={[
        styles.root,
        isExpanded ? styles.expanded : styles.collapsed
      ].join(' ')}
    >
      {isExpanded && (
        <div className={styles.header}>
          <strong className={styles.title}>스트리머 즐겨찾기</strong>
          <button
            aria-label='즐겨찾기 새로고침'
            aria-busy={isRefreshing}
            className={styles.refreshButton}
            disabled={isRefreshing}
            onClick={() => { refreshFavorites().catch(console.error) }}
            title='새로고침'
            type='button'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width={14}
              height={14}
              viewBox='0 0 14 14'
              fill='none'
              aria-hidden='true'
            >
              <path fill='currentColor' d='M12.212 1.749a.758.758 0 1 0-1.517 0v.922a5.829 5.829 0 1 0 2.133 4.507.758.758 0 0 0-1.516 0 4.312 4.312 0 1 1-1.689-3.422h-.935a.758.758 0 1 0 0 1.516h2.766c.418 0 .758-.34.758-.758V1.75Z' />
            </svg>
          </button>
        </div>
      )}
      <ul className={styles.list}>
        {favoriteChannels.map(channel => (
          <ChannelItem
            key={channel.channelId}
            channel={channel}
            isExpanded={isExpanded}
          />
        ))}
      </ul>
    </nav>
  )
}

const DEFAULT_PROFILE_URL =
  'https://ssl.pstatic.net/static/nng/glive/image/default_profile_dark.png'

const handleProfileImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  if (event.currentTarget.src === DEFAULT_PROFILE_URL) return

  event.currentTarget.src = DEFAULT_PROFILE_URL
}

function ChannelItem ({ channel, isExpanded }: { channel: FavoriteChannel, isExpanded: boolean }) {
  const isLive = channel.openLive
  const originalImageUrl = channel.channelImageUrl?.trim()
  const channelImageUrl = originalImageUrl || DEFAULT_PROFILE_URL
  const channelHref = isLive
    ? `/live/${channel.channelId}`
    : `/${channel.channelId}`

  return (
    <li className={styles.item}>
      <a
        className={styles.itemLink}
        draggable={false}
        href={channelHref}
        aria-label={`${channel.channelName}${isLive ? ', 실시간 방송 중' : ''}`}
      >
        <div
          className={[
            styles.profile,
            isLive ? styles.live : ''
          ].filter(Boolean).join(' ')}
        >
          <img
            width={26}
            height={26}
            src={channelImageUrl}
            className={styles.profileImage}
            alt=''
            draggable={false}
            onError={handleProfileImageError}
          />
        </div>

        {isExpanded && (
          <strong className={styles.name}>
            {channel.channelName}
          </strong>
        )}
      </a>
    </li>
  )
}
