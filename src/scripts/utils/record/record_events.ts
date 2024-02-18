import { injectOverlay, removeOverlay, updateOverlay } from '../inject/rec_overlay'
import { startRecord, stopRecord } from './record_stream'
import type { Video } from '../../types/record'

export function startRecordListener (e: Event): void {
  (async (): Promise<void> => {
    const video: Video | null = document.querySelector('.webplayer-internal-video')
    if (video === null) {
      return
    }

    const streamerName = document.querySelector("[class^='video_information'] > [class^='name_ellipsis'] > [class^='name_text']")?.textContent ??
                         document.querySelector("[class^='live_information'] > [class^='name_ellipsis']> [class^='name_text']")?.textContent ??
                         'streamer'
    const streamTitle = document.querySelector("[class^='video_information_title']")?.textContent ??
                        document.querySelector("[class^='live_information_player_title']")?.textContent ??
                        'title'

    const recorder = await startRecord(video, { streamerName, streamTitle })

    const recordSVG = document.querySelector('#chzzk-rec-icon')
    recordSVG?.setAttribute('fill', 'red')

    // inject Overlay
    let sec = 0

    injectOverlay()
    updateOverlay(sec++)

    const oldHref = window.location.href

    const overlayInterval = setInterval(() => {
      if (oldHref !== window.location.href) {
        clearInterval(overlayInterval)
        stopRecordListener(recorder!, overlayInterval) 
        return
      }
      updateOverlay(sec++)
    }, 1000)

    // Add stop EventListener
    const recordButton = document.querySelector('.chzzk-record-button')
    recordButton?.addEventListener('click', () => { stopRecordListener(recorder!, overlayInterval) }, { once: true }) // Add '!' to assert that 'recorder' is not null
  })()
    .then()
    .catch(() => {
      initRecordButton()
    })
}

export function stopRecordListener (recorder: MediaRecorder, intervalID: NodeJS.Timeout): void {
  (async (): Promise<void> => {
    // TODO: Remove volume watcher
    const recordButton = document.querySelector('.chzzk-record-button')
    clearEventListeners(recordButton)
    await stopRecord(recorder)

    const recordSVG = document.querySelector('#chzzk-rec-icon')
    recordSVG?.setAttribute('fill', '#ffffff')

    const clonedBtn = document.querySelector('.chzzk-record-button')

    // claer Overlay
    clearInterval(intervalID)
    removeOverlay()

    // Add start EventListener
    clonedBtn?.addEventListener('click', startRecordListener, { once: true })
  })()
    .then()
    .catch(console.error)
}

function clearEventListeners (target: Element | null): void {
  if (target === null) {
    return
  }

  const clone = target.cloneNode(true)
  if (clone instanceof Element) {
    target.replaceWith(clone)
  }
}

function initRecordButton (): void {
  const recordSVG = document.querySelector('#chzzk-rec-icon')
  recordSVG?.setAttribute('fill', '#ffffff')

  // Add start EventListener
  const recordButton = document.querySelector('.chzzk-record-button')
  recordButton?.addEventListener('click', startRecordListener, { once: true })
}
