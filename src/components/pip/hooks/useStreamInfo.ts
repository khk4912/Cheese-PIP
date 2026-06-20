import { useState, useEffect, useRef } from 'react'
import { getStreamInfo } from '@/utils/stream_info'

export interface StreamInfoData {
  name: string;
  title: string;
  viewerCount: number;
}

export function useStreamInfo (originalDocument: Document) {
  const [streamInfo, setStreamInfo] = useState<StreamInfoData>({
    name: 'Streamer',
    title: 'Title',
    viewerCount: 12345
  })

  const streamInfoTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getInfo = () => {
      const infos = getStreamInfo(originalDocument)
      const preViewerCount = originalDocument.querySelector('[class^="_data"] > [class^="_count_"]')?.textContent ??
                             originalDocument.querySelector('[class^="_data"] > [class^="_count_"]')?.textContent ??
                             originalDocument.querySelector('[class^="_view_"] > strong[class^="_count_"]')?.textContent ?? '0'

      const viewerCount = preViewerCount ? parseInt(preViewerCount.replace(/[^0-9]/g, '')) : 0

      setStreamInfo({
        name: infos.streamerName ?? '스트리머',
        title: infos.streamTitle ?? '제목',
        viewerCount
      })
    }

    getInfo()
    streamInfoTimeout.current = setInterval(() => { getInfo() }, 30000)

    return () => {
      if (streamInfoTimeout.current) {
        clearInterval(streamInfoTimeout.current)
      }
    }
  }, [originalDocument])

  return {
    streamInfo
  }
}
