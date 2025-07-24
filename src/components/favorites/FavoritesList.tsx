import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { FollowApiResponse, FollowingItem } from '@/types/follows'
import { getFavorites, removeFavorite } from '@/types/options'

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
    targetSelector: '[class^="navigation_bar_section__"]',
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
    const storageChanged = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return

      if (changes.favorites) {
        fetchFavorites().catch(console.log)
      }
    }

    fetchFavorites().catch(console.log)

    // storage change event listener 등록
    chrome.storage.onChanged.addListener(storageChanged)

    return () => {
      chrome.storage.onChanged.removeListener(storageChanged)
    }
  }, [])

  useEffect(() => {
    const targetNav = document.querySelector('nav.navigation_bar_section__hDpyD')
    if (!targetNav) return

    setIsExpanded(targetNav.className.includes('is_expanded'))

    const observer = new MutationObserver(() => {
      setIsExpanded(targetNav.className.includes('is_expanded'))
    })
    observer.observe(targetNav, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  if (favoriteChannels.length === 0) return null

  return (
    <nav className={`navigation_bar_section__hDpyD ${isExpanded ? 'navigation_bar_is_expanded__Z69d7' : ''}`} style={{ paddingBottom: isExpanded ? '5px' : '' }}>

      <div className='navigation_bar_header__3fpfb'>
        <strong className='navigation_bar_title__1UBnx'> {isExpanded ? '팔로우 즐겨찾기 (beta)' : '즐겨찾기'}</strong>
      </div>

      <ul className='navigation_bar_list__+d2qh'>
        {favoriteChannels.map(channel => (
          isExpanded
            ? <ExpandedChannelItem key={channel.channelId} channel={channel} />
            : <CollapsedChannelItem key={channel.channelId} channel={channel} />
        ))}
      </ul>
    </nav>
  )
}

function ExpandedChannelItem ({ channel }: { channel: FollowingItem }) {
  return (
    <li className='navigation_bar_item__4OS5Z'>
      <a className='navigator_item__mH4JG navigator_type_profile__vtAts navigator_is_expanded__sYbgW' draggable='false' href={`/live/${channel.channelId}`}>
        <div className={`navigator_profile__dbd9H ${channel.streamer.openLive ? 'navigator_is_live__StrUx' : ''}`}>
          <img
            width='26' height='26'
            src={channel.channel.channelImageUrl ?? 'https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na'}
            className={`navigator_image__Zw45c ${!channel.streamer.openLive ? 'navigator_default__H3o8G' : ''}`}
            alt=''
            draggable='false'
          />
          {channel.streamer.openLive && <span className='blind'>LIVE</span>}
          {!channel.streamer.openLive && <span className='blind'>오프라인</span>}
        </div>
        <div className='navigator_information__sT7qv'>
          <strong className='navigator_name__k4Sc2'>
            <span className='name_ellipsis__Hu9B+'>
              <span className='name_text__yQG50'>{channel.channel.channelName}</span>
            </span>
          </strong>
        </div>
      </a>
    </li>
  )
}

function CollapsedChannelItem ({ channel }: { channel: FollowingItem }) {
  return (
    <li className='navigation_bar_item__4OS5Z'>
      <a className='navigator_item__mH4JG navigator_type_profile__vtAts' draggable='false' href={`/live/${channel.channelId}`}>
        <div className={`navigator_profile__dbd9H ${channel.streamer.openLive ? 'navigator_is_live__StrUx' : ''}`}>
          <img
            width='26' height='26'
            src={channel.channel.channelImageUrl ?? 'https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na'}
            className={`navigator_image__Zw45c ${!channel.streamer.openLive ? 'navigator_default__H3o8G' : ''}`}
            alt=''
            draggable='false'
          />
          {channel.streamer.openLive && <span className='blind'>LIVE</span>}
          {!channel.streamer.openLive && <span className='blind'>{channel.channel.channelName}오프라인</span>}
        </div>
      </a>
    </li>
  )
}
