import ReactDOM from 'react-dom'
import { addFavorite, getFavorites, removeFavorite, type FavoriteChannel } from '@/types/options'

const StrokeColor = {
  dark: 'rgb(223,226,234)',
  light: 'rgb(46,48,51)'
} as const

const FAVORITES_BUTTON_TARGET_SELECTOR = [
  '[class*="_control"] > button',
  '[class*="_action_"] > button',
  '[class*="video_information_alarm"]',
  '[class*="channel_profile_alarm"]',
].join(', ')

const StarIcon = ({ fill = StrokeColor.dark, checked = false } : { fill?: string, checked?: boolean }) =>
  <>
    <svg
      width='20px' height='20px' viewBox='0 0 24.00 24.00' fill={checked ? fill : 'none'}
      xmlns='http://www.w3.org/2000/svg' stroke={fill}
    >
      <g id='SVGRepo_bgCarrier' strokeWidth='0' />
      <g id='SVGRepo_tracerCarrier' strokeLinecap='round' strokeLinejoin='round' />
      <g id='SVGRepo_iconCarrier'>
        <path
          d='M11.245 4.174C11.4765 3.50808 11.5922 3.17513 11.7634 3.08285C11.9115 3.00298 12.0898 3.00298 12.238 3.08285C12.4091 3.17513 12.5248 3.50808 12.7563 4.174L14.2866 8.57639C14.3525 8.76592 14.3854 8.86068 14.4448 8.93125C14.4972 8.99359 14.5641 9.04218 14.6396 9.07278C14.725 9.10743 14.8253 9.10947 15.0259 9.11356L19.6857 9.20852C20.3906 9.22288 20.743 9.23007 20.8837 9.36432C21.0054 9.48051 21.0605 9.65014 21.0303 9.81569C20.9955 10.007 20.7146 10.2199 20.1528 10.6459L16.4387 13.4616C16.2788 13.5829 16.1989 13.6435 16.1501 13.7217C16.107 13.7909 16.0815 13.8695 16.0757 13.9507C16.0692 14.0427 16.0982 14.1387 16.1563 14.3308L17.506 18.7919C17.7101 19.4667 17.8122 19.8041 17.728 19.9793C17.6551 20.131 17.5108 20.2358 17.344 20.2583C17.1513 20.2842 16.862 20.0829 16.2833 19.6802L12.4576 17.0181C12.2929 16.9035 12.2106 16.8462 12.1211 16.8239C12.042 16.8043 11.9593 16.8043 11.8803 16.8239C11.7908 16.8462 11.7084 16.9035 11.5437 17.0181L7.71805 19.6802C7.13937 20.0829 6.85003 20.2842 6.65733 20.2583C6.49056 20.2358 6.34626 20.131 6.27337 19.9793C6.18915 19.8041 6.29123 19.4667 6.49538 18.7919L7.84503 14.3308C7.90313 14.1387 7.93218 14.0427 7.92564 13.9507C7.91986 13.8695 7.89432 13.7909 7.85123 13.7217C7.80246 13.6435 7.72251 13.5829 7.56262 13.4616L3.84858 10.6459C3.28678 10.2199 3.00588 10.007 2.97101 9.81569C2.94082 9.65014 2.99594 9.48051 3.11767 9.36432C3.25831 9.23007 3.61074 9.22289 4.31559 9.20852L8.9754 9.11356C9.176 9.10947 9.27631 9.10743 9.36177 9.07278C9.43726 9.04218 9.50414 8.99359 9.55657 8.93125C9.61593 8.86068 9.64887 8.76592 9.71475 8.57639L11.245 4.174Z'
          stroke={fill} strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'
        />
      </g>
    </svg>
  </>

export function FavoritesButtonPortal (): React.ReactNode {
  const target = usePortal({
    id: 'cheese-pip-favorites-add-button',
    targetSelector: FAVORITES_BUTTON_TARGET_SELECTOR,
    position: 'before'
  })

  return (
    <FavoritesPortalContainer target={target}>
      <FavoritesButton />
    </FavoritesPortalContainer>
  )
}

function FavoritesPortalContainer ({ target, children }: { target: Element | null, children: React.ReactNode }) {
  return target ? ReactDOM.createPortal(children, target) : null
}

const getMetaContent = (selector: string): string | null =>
  document.querySelector<HTMLMetaElement>(selector)?.content?.trim() || null

const getCurrentChannel = (channelId: string): FavoriteChannel => {
  const title = getMetaContent('meta[property="og:title"]') ?? document.title
  const channelName = title
    .replace(/\s*[-|]\s*(CHZZK|치지직).*$/i, '')
    .trim() || channelId

  return {
    channelId,
    channelName,
    channelImageUrl: getMetaContent('meta[property="og:image"]'),
    openLive: false
  }
}

function FavoritesButton () {
  const [isHover, setIsHover] = useState(false)
  const [checked, setChecked] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const channelID = window.location.pathname.split('/').at(-1)
  const theme = useThemeContext()

  const handleMouseEnter = () => {
    setIsHover(true)
  }

  const handleMouseLeave = () => {
    setIsHover(false)
  }

  const handleChange = () => {
    if (!channelID) return

    const newChecked = !checked
    setChecked(newChecked)

    if (newChecked) {
      addFavorite(getCurrentChannel(channelID)).catch(() => { })
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 2000)
    } else {
      removeFavorite(channelID).catch(() => { })
    }
  }

  useEffect(() => {
    const _getFavorites = async () => {
      const favorites = await getFavorites()
      setChecked(favorites.has(channelID ?? ''))
    }

    _getFavorites().catch(() => { })
  }
  , [channelID])

  return (
    <>
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleChange}
        type='button' className='_container_1dexx_2 _icon_container_1dexx_415 _larger_1dexx_213'
        style={{ marginRight: '6px' }}
      >
        <div
          title='Cheese-PIP 즐겨찾기' role='img' aria-label='animation'
        >
          <StarIcon fill={StrokeColor[theme]} checked={checked} />
        </div>
        {isHover &&
          <span className='_label_1dexx_588 _label_top_1dexx_606 _label_center_1dexx_615'>Cheese-PIP 즐겨찾기</span>}
      </button>
      {toastVisible && <p className='_container_1r77n_1 _type_fixed_1r77n_36' role='alert'>이 스트리머를 즐겨찾기 리스트에 추가합니다.</p>}
    </>
  )
}
