import { type TMInfoResponse } from '../types/tm'
import { parse, types } from 'hls-parser'

export async function generateChzzkClipinfo (duration: number): Promise<void> {
  const { hlsPath, baseURL, liveID } = await resolvePlaybackInfo(window.location.pathname)

  const { mediaPlaylist: highestPlaylist, highestPlaylistURL } = await fetchHighestMediaPlaylist(baseURL, hlsPath)

  const highestSequenceNumber = highestPlaylist.segments[highestPlaylist.segments.length - 1].mediaSequenceNumber
  const sequenceLength = highestPlaylist.segments[0].duration + 2

  duration = Math.min(180, duration)

  const startSequenceNumber = highestSequenceNumber - Math.ceil(duration / sequenceLength) - 2
  const clipTitle = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '_')

  await requestClipGeneration(highestPlaylistURL, liveID, startSequenceNumber, duration, clipTitle)
}

async function resolvePlaybackInfo (pathname: string): Promise<{ hlsPath: string, baseURL: string, liveID: string }> {
  const streamerID = pathname.split('/')[2]
  if (!streamerID) throw new Error('No streamer ID')

  const res = await fetch(
    `https://api.chzzk.naver.com/service/v1.1/channels/${streamerID}/clip-time-machine-info`,
    { credentials: 'include' }
  )
  const tmData = await res.json() as TMInfoResponse

  if (tmData.code !== 200) {
    throw new Error(`API error: ${tmData.message || 'Unknown error'}`)
  }

  const hlsPath = tmData?.content?.timeMachinePlayback?.media?.[0]?.path
  if (!hlsPath) throw new Error('No valid playback path found')

  const baseUrlMatch = hlsPath.match(/.+\/dvr\/[^/]+/)
  if (!baseUrlMatch) throw new Error('Failed to parse base URL')

  return { hlsPath, baseURL: baseUrlMatch[0] + '/', liveID: tmData.content.timeMachinePlayback.meta.liveId }
}

async function fetchHighestMediaPlaylist (baseURL: string, hlsPath: string): Promise<{ mediaPlaylist: types.MediaPlaylist, highestPlaylistURL: string }> {
  const playlistRes = await fetch(hlsPath)
  if (!playlistRes.ok) throw new Error('Failed to fetch master playlist')

  const playlistText = await playlistRes.text()
  const playlist = parse(playlistText)

  if (!(playlist instanceof types.MasterPlaylist)) {
    throw new Error('Not a master playlist')
  }

  const variants = [...playlist.variants].sort((a, b) => {
    return b.bandwidth > a.bandwidth ? 1 : -1
  })
  const highestURI = variants[0].uri

  const mediaText = await (await fetch(baseURL + highestURI)).text()
  const mediaPlaylist = parse(mediaText)

  if (!(mediaPlaylist instanceof types.MediaPlaylist)) {
    throw new Error('Not a media playlist')
  }

  return { mediaPlaylist, highestPlaylistURL: baseURL + highestURI }
}

async function requestClipGeneration (playlistURL: string, liveID: string, startSeq: number, duration: number, clipTitle: string): Promise<void> {
  const timecode = document.querySelector('span.video_information_count__Y05sI')
  const timecodeText = timecode ? timecode.textContent.split(' ')[0] : '00:00:00'

  const clipRequest = {
    version: 1,
    tracks: [
      {
        type: 'video_track',
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        clips: [
          {
            file: playlistURL,
            start_time: 0,
            end_time: duration,
            trim: {
              segment_start_index: startSeq,
              start_offset: 0,
              duration
            },
            crop: {
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              ref_width: 1920,
              ref_height: 1080
            },
            loop: false
          }
        ],
        volume: 100
      }
    ],
    width: 1280,
    height: 720
  }

  const payload = {
    clipTitle,
    contentSeekbar: timecodeText,
    layout: 'HORIZONTAL',
    clipRequest
  }

  await fetch(
    `https://api.chzzk.naver.com/service/v2/clips/live/${liveID}?deviceType=PC`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  )
}
