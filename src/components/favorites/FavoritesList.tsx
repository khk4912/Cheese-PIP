import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { FollowApiResponse, FollowingItem } from '@/types/follows'
import { getFavorites, removeFavorite } from '@/types/options'
import { browser, type Browser } from 'wxt/browser'

const getFollowedChannels = async (): Promise<FollowApiResponse> => {
  const res = await fetch(
    'https://api.chzzk.naver.com/service/v1/channels/followings?page=0&size=505&sortType=FOLLOW',
    { credentials: 'include' }
  )
  // check 401
  if (res.status !== 200) {
    return {
      code: res.status,
      message: 'Error',
      content: {
        totalCount: 0,
        totalPage: 0,
        followingList: []
      }
    }
  }

  return (await res.json()) as FollowApiResponse
}

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
  const [favoriteChannels, setFavoriteChannels] = useState<FollowingItem[]>([])

  const fetchFavorites = async () => {
    try {
      const favorites = await getFavorites()
      const res = await getFollowedChannels()
      const followingChannels = res.content.followingList

      // 즐겨찾기에 추가된 채널만 필터링
      const favoriteChannels = followingChannels.filter(channel => favorites.has(channel.channelId))

      // favorites 에는 있지만, followingChannels 에는 없는 경우 favorites에서 삭제
      const followingChannelIds = followingChannels.map(channel => channel.channelId)
      const toRemove = [...favorites].filter(channelId => !followingChannelIds.includes(channelId))

      await Promise.all(toRemove.map(channelId => removeFavorite(channelId)))
      toRemove.forEach(channelId => favorites.delete(channelId))

      // openLive 가 true 인 채널을 위로 정렬
      favoriteChannels.sort((a, _) => (a.streamer.openLive ? -1 : 1))
      setFavoriteChannels(favoriteChannels)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => { fetchFavorites().catch(console.log) }, 30000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

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
        <strong className='_title_q99ll_56'> {isExpanded ? '팔로우 즐겨찾기' : '즐겨찾기'}</strong>
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

function ExpandedChannelItem ({ channel }: { channel: FollowingItem }) {
  const isLive = channel.streamer.openLive

  const originalImageUrl = channel.channel.channelImageUrl?.trim()
  const usesDefaultImage = !originalImageUrl

  const channelImageUrl = originalImageUrl || DEFAULT_PROFILE_URL

  const channelHref = isLive
    ? `/live/${channel.channel.channelId}`
    : `/${channel.channel.channelId}`

  return (
    <li className='_item_q99ll_63'>
      <div className='_item_1lz65_45 _type_profile_1lz65_66 _is_expanded_1lz65_66'>
        <div
          className={[
            '_profile_1lz65_52',
            isLive ? '_is_live_1lz65_146' : ''
          ].filter(Boolean).join(' ')}
        >
          <img
            width={26}
            height={26}
            src={channelImageUrl}
            className={
              !isLive && !usesDefaultImage
                ? '_default_1lz65_157'
                : ''
            }
            alt=''
            draggable={false}
          />

          <span className='blind'>
            {isLive ? 'LIVE' : '오프라인'}
          </span>
        </div>

        <div className='_information_1lz65_179'>
          <strong className='_name_1lz65_74'>
            <span className='_ellipsis_dtc6c_6'>
              <span className='_text_dtc6c_2'>
                {channel.channel.channelName}
              </span>
            </span>
          </strong>
        </div>

        <a
          className='_item_link_1lz65_108'
          draggable={false}
          href={channelHref}
          aria-label={channel.channel.channelName}
        />
      </div>
    </li>
  )
}
function CollapsedChannelItem ({ channel }: { channel: FollowingItem }) {
  const isLive = channel.streamer.openLive
  const originalImageUrl = channel.channel.channelImageUrl?.trim()
  const hasCustomImage = Boolean(originalImageUrl)

  const channelImageUrl = originalImageUrl || DEFAULT_PROFILE_URL

  const channelHref = isLive
    ? `/live/${channel.channel.channelId}`
    : `/${channel.channel.channelId}`

  return (
    <li className='_item_q99ll_63'>
      <div className='_item_1lz65_45 _type_profile_1lz65_66'>
        <div
          className={[
            '_profile_1lz65_52',
            isLive ? '_is_live_1lz65_146' : ''
          ].filter(Boolean).join(' ')}
        >
          <img
            width={26}
            height={26}
            src={channelImageUrl}
            className={
              !isLive && hasCustomImage
                ? '_default_1lz65_157'
                : undefined
            }
            alt=''
            draggable={false}
          />

          <span className='blind'>
            {isLive
              ? 'LIVE'
              : `${channel.channel.channelName}오프라인`}
          </span>
        </div>

        <a
          className='_item_link_1lz65_108'
          draggable={false}
          href={channelHref}
          aria-label={channel.channel.channelName}
        />
      </div>
    </li>
  )
}
