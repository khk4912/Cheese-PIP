import { RenderUI } from './ui_entrypoint'
const contentScript = defineContentScript({
  matches: ['https://chzzk.naver.com/*'],
  allFrames: true,
  main(ctx) {
    const cleanup = RenderUI()
    ctx.onInvalidated(cleanup)

    /* record irame injection */
    // TODO: 녹화 옵션 꺼져있으면 미삽입?

    const iframe = document.createElement('iframe')
    iframe.src = browser.runtime.getURL('/cheese-pip-rec-iframe.html')

    document.documentElement.appendChild(iframe)
    /* record irame injection end */

    ctx.onInvalidated(() => {
      iframe.remove()
      cleanup()
    })
  },
})

export default contentScript
