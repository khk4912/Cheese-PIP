import type { RecordingRequest, RecordingResponse } from '@/types/record_message'

const worker = new Worker(new URL('./opfs-writer.worker.ts', import.meta.url), {
  type: 'module',
  name: 'cheese-pip-opfs-worker',
})

// iframe -> worker
function send(message: RecordingRequest, transfer: Transferable[]) {
  worker.postMessage(message, transfer)
}

worker.addEventListener('message', (event: MessageEvent<RecordingResponse>) => {
  const message = event.data
  switch (message.type) {
    case 'ready':
      break
    case 'opened':
      break
    case 'ack':
      break
    case 'closed':
      break
    case 'error':
      break
  }
})

worker.onerror = event => {
  console.error(
    `[cheese-pip-opfs-worker] error: ${event.message} (${event.filename}:${event.lineno}:${event.colno})`
  )
}

export { send }
