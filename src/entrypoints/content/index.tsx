import { RenderUI } from './ui_entrypoint'
const contentScript = defineContentScript({
  matches: ['https://chzzk.naver.com/*'],
  allFrames: true,
  main(ctx) {
    const cleanup = RenderUI()
    ctx.onInvalidated(cleanup)
  },
})

export default contentScript
