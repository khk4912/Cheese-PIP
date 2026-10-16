/// <reference lib="webworker" />
import type { RecordingRequest, RecordingResponse } from '@/types/record_message'

// Worker → iframe
function reply(message: RecordingResponse) {
  self.postMessage(message)
}

// iframe → Worker 요청 수신
self.onmessage = (event: MessageEvent<RecordingRequest>) => {
  const message = event.data

  switch (message.type) {
    case 'open':
      // 파일을 연 뒤 opened 응답
      break

    case 'chunk':
      // message.data를 기록한 뒤 ack 응답
      break

    case 'close':
      // flush하고 파일을 닫은 뒤 closed 응답
      break
  }
}

reply({ type: 'ready' })
