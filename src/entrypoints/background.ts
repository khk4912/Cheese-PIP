import type { DownloadMessage, MessageType } from '../types/message'
import { browser } from 'wxt/browser'

export default defineBackground(() => {
// Download message listener
  browser.runtime.onMessage.addListener((request: MessageType) => {
    if (request.type === 'download') {
      const msg = request as DownloadMessage

      browser.downloads.download({
        url: msg.data.url,
        filename: msg.data.fileName
      })
        .catch(console.error)
    }
  })
})
