const contentScript = defineContentScript({
  matches: ['https://chzzk.naver.com/*'],
  allFrames: true,
  main (ctx) {

  }
})

export default contentScript
