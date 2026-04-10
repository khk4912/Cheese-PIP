import type { StreamInfo } from '@/types/record_info'

/**
 * 스트리머 이름, 방송 제목을 추출합니다.
 *
 * @param document Document
 * @returns StreamInfo
 */
export const getStreamInfo = (document: Document): StreamInfo => {
  const streamerName = document.querySelector("[class^='video_information'] > [class^='name_ellipsis'] > [class^='name_text']")?.textContent ??
                       document.querySelector("[class^='live_information'] > [class^='name_ellipsis']> [class^='name_text']")?.textContent ??
                       'streamer'

  const streamTitle = document.querySelector("[class^='video_information_title']")?.textContent ??
                      document.querySelector("[class^='live_information_player_title']")?.textContent ??
                      'title'

  return { streamerName, streamTitle }
}
