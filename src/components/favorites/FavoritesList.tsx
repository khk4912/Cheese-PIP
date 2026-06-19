import ReactDOM from 'react-dom'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { getFavoriteChannels, type FavoriteChannel } from '@/types/options'
import { browser, type Browser } from 'wxt/browser'

export function FavoritesListPortal (): React.ReactNode {
  const target = usePortal({
    id: 'cheese-pip-favorites-list',
    targetSelector: 'div[class^="_content_"] > nav[class^="_section_"]',
    position: 'after'
  })

  return (
    <FavoritesListPortalContainer target={target}>
      <FavoritesList />
    </FavoritesListPortalContainer>
  )
}

// Portal 컨테이너 컴포넌트
function FavoritesListPortalContainer ({ target, children }: { target: HTMLElement, children: React.ReactNode }) {
  useEffect(() => {
    return () => {
      target.remove()
    }
  }, [target])

  return ReactDOM.createPortal(children, target)
}

function FavoritesList (): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(true)
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

    // storage change event listener 등록
    browser.storage.onChanged.addListener(storageChanged)

    return () => {
      browser.storage.onChanged.removeListener(storageChanged)
    }
  }, [])

  useEffect(() => {
    let observer: MutationObserver | null = null
    let cancelled = false

    waitForElement('aside._container_1vdxf_2')
      .then((targetNav) => {
        if (cancelled || !targetNav) return
        setIsExpanded(targetNav.className.includes('is_expanded'))

        observer = new MutationObserver(() => {
          setIsExpanded(targetNav.className.includes('is_expanded'))
        })
        observer.observe(
          targetNav,
          { attributes: true, attributeFilter: ['class'] }
        )
      })
      .catch(console.error)

    return () => {
      cancelled = true
      observer?.disconnect()
    }
  }, [])

  if (favoriteChannels.length === 0) return null

  return (
    <nav
      className={`_section_q99ll_26 ${isExpanded ? '_is_expanded_q99ll_47' : ''}`}
      style={{
        paddingBlock: '10px',
        borderBlock: '1px solid var(--Border-Neutral-Weak)',
        marginBottom: '10px'
      }}
    >
      <div className='_header_q99ll_47'>
        <strong className='_title_q99ll_56'> {isExpanded ? '스트리머 즐겨찾기' : '즐겨찾기'}</strong>
      </div>
      <ul className='_list_q99ll_53'>
        {favoriteChannels.map(channel => (
          isExpanded
            ? <ExpandedChannelItem key={channel.channelId} channel={channel} />
            : <CollapsedChannelItem key={channel.channelId} channel={channel} />
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

function ExpandedChannelItem ({ channel }: { channel: FavoriteChannel }) {
  const originalImageUrl = channel.channelImageUrl?.trim()
  const usesDefaultImage = !originalImageUrl

  const channelImageUrl = originalImageUrl || DEFAULT_PROFILE_URL

  const channelHref = `/${channel.channelId}`

  return (
    <li className='_item_q99ll_63'>
      <div className='_item_1lz65_45 _type_profile_1lz65_66 _is_expanded_1lz65_66'>
        <div
          className='_profile_1lz65_52'
        >
          <img
            width={26}
            height={26}
            src={channelImageUrl}
            className={
              !usesDefaultImage
                ? '_default_1lz65_157'
                : ''
            }
            alt=''
            draggable={false}
            onError={handleProfileImageError}
          />

          <span className='blind'>
            {`${channel.channelName} 프로필`}
          </span>
        </div>

        <div className='_information_1lz65_179'>
          <strong className='_name_1lz65_74'>
            <span className='_ellipsis_dtc6c_6'>
              <span className='_text_dtc6c_2'>
                {channel.channelName}
              </span>
            </span>
          </strong>
        </div>

        <a
          className='_item_link_1lz65_108'
          draggable={false}
          href={channelHref}
          aria-label={channel.channelName}
        />
      </div>
    </li>
  )
}
function CollapsedChannelItem ({ channel }: { channel: FavoriteChannel }) {
  const originalImageUrl = channel.channelImageUrl?.trim()
  const hasCustomImage = Boolean(originalImageUrl)

  const channelImageUrl = originalImageUrl || DEFAULT_PROFILE_URL

  const channelHref = `/${channel.channelId}`

  return (
    <li className='_item_q99ll_63'>
      <div className='_item_1lz65_45 _type_profile_1lz65_66'>
        <div
          className='_profile_1lz65_52'
        >
          <img
            width={26}
            height={26}
            src={channelImageUrl}
            className={
              hasCustomImage
                ? '_default_1lz65_157'
                : undefined
            }
            alt=''
            draggable={false}
            onError={handleProfileImageError}
          />

          <span className='blind'>
            {`${channel.channelName} 프로필`}
          </span>
        </div>

        <a
          className='_item_link_1lz65_108'
          draggable={false}
          href={channelHref}
          aria-label={channel.channelName}
        />
      </div>
    </li>
  )
}
