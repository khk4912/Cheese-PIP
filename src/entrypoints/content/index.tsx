import { RenderUI } from './ui_entrypoint'
const contentScript = defineContentScript({
  matches: ['https://chzzk.naver.com/*'],
  allFrames: true,
  main (ctx) {
    RenderUI()
  }
})

export default contentScript
