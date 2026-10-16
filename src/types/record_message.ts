export type RecordingRequest =
  | { type: 'open' }
  | {
      type: 'chunk'
      seq: number
      data: ArrayBuffer
    }
  | { type: 'close' }

export type RecordingResponse =
  | { type: 'ready' }
  | {
      type: 'opened'
      fileName: string
    }
  | {
      type: 'ack'
      seq: number
      bytesWritten: number
    }
  | {
      type: 'closed'
      bytesWritten: number
    }
  | {
      type: 'error'
      message: string
    }
