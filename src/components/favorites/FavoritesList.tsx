import ReactDOM from 'react-dom'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { getFavoriteChannels, type FavoriteChannel } from '@/types/options'
import { browser, type Browser } from 'wxt/browser'

export function FavoritesListPortal (): React.ReactNode {
  const target = usePortal({
    id: 'cheese-pip-favorites-list',
    targetSelector: '#sidebar nav',
    position: 'after'
  })

  return ReactDOM.createPortal(<FavoritesList />, target)
}

const isSidebarExpanded = (sidebar: Element): boolean =>
  sidebar.classList.contains('_is_expanded_1v5jt_12')

function FavoritesList (): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false)
  const [favoriteChannels, setFavoriteChannels] = useState<FavoriteChannel[]>([])

  const fetchFavorites = async () => {
    try {
      setFavoriteChannels(await getFavoriteChannels())
    } catch (error) {
      console.log(error)
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
    let mutationObserver: MutationObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let cancelled = false

    waitForElement('#sidebar')
      .then(sidebar => {
        if (cancelled) return

        const updateExpandedState = () => {
          setIsExpanded(isSidebarExpanded(sidebar))
        }

        updateExpandedState()

        mutationObserver = new MutationObserver(updateExpandedState)
        resizeObserver = new ResizeObserver(updateExpandedState)

        mutationObserver.observe(sidebar, {
          attributes: true,
          attributeFilter: ['class']
        })
        resizeObserver.observe(sidebar)
      })
      .catch(console.error)

    return () => {
      cancelled = true
      mutationObserver?.disconnect()
      resizeObserver?.disconnect()
    }
  }, [])

  if (favoriteChannels.length === 0) return null

  return (
    <nav
      aria-label='스트리머 즐겨찾기'
      className={`_section_30v9l_26 ${isExpanded ? '_is_expanded_30v9l_47' : ''}`}
    >
      <div className='_header_30v9l_47'>
        <strong className='_title_30v9l_56'>
          {isExpanded ? '스트리머 즐겨찾기' : '즐겨찾기'}
        </strong>
      </div>
      <ul className='_list_30v9l_53'>
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
  event.currentTarget.className = ''
}

function ChannelItem ({ channel, isExpanded }: { channel: FavoriteChannel, isExpanded: boolean }) {
  const isLive = channel.openLive
  const originalImageUrl = channel.channelImageUrl?.trim()
  const channelImageUrl = originalImageUrl || DEFAULT_PROFILE_URL
  const channelHref = isLive
    ? `/live/${channel.channelId}`
    : `/${channel.channelId}`

  return (
    <li className='_item_30v9l_63'>
      <div
        className={[
          '_item_1vqt1_45',
          '_type_profile_1vqt1_66',
          isExpanded ? '_is_expanded_1vqt1_66' : ''
        ].filter(Boolean).join(' ')}
      >
        <div
          className={[
            '_profile_1vqt1_52',
            isLive ? '_is_live_1vqt1_146' : ''
          ].filter(Boolean).join(' ')}
        >
          <img
            width={26}
            height={26}
            src={channelImageUrl}
            className={!isLive && originalImageUrl ? '_default_1vqt1_157' : ''}
            alt=''
            draggable={false}
            onError={handleProfileImageError}
          />

          <span className='blind'>
            {isLive ? 'LIVE' : `${channel.channelName} 프로필`}
          </span>
        </div>

        {isExpanded && (
          <div className='_information_1vqt1_179'>
            <strong className='_name_1vqt1_74'>
              <span className='_ellipsis_1iatj_6'>
                <span className='_text_1iatj_2'>
                  {channel.channelName}
                </span>
              </span>
            </strong>
          </div>
        )}

        <a
          className='_item_link_1vqt1_108'
          draggable={false}
          href={channelHref}
          aria-label={channel.channelName}
        />
      </div>
    </li>
  )
}
