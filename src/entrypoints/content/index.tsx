import { RenderUI } from './ui_entrypoint'
const contentScript = defineContentScript({
  matches: ['https://chzzk.naver.com/*'],
  allFrames: true,
  main() {
    RenderUI()
  },
})

export default contentScript
