import type { RecordInfo } from './record_info'

export interface RecordingResult {
  recordInfo: RecordInfo
  fileName: string
  writtenBytes: number
}

export interface RecordingSession {
  start(): Promise<void>
  stop(): Promise<RecordingResult>
  dispose(): Promise<void>
}
