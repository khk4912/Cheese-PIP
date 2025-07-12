import { injectButton } from './inject_btn'
import { injectFavoriteListComponent } from './inject_favorite_list'
import '@/utils/keyboard'

const contentScript = defineContentScript({
  matches: ['https://chzzk.naver.com/*'],
  allFrames: true,
  main (_) {
    injectButton() // .catch(console.error)
    injectFavoriteListComponent()
  }
})

export default contentScript
