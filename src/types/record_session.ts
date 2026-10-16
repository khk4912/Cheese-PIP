import type { StreamInfo } from './record_info'

export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping' | 'stopped' | 'failed'

export type RecordingEvent =
  | { type: 'status'; status: Exclude<RecordingStatus, 'failed'> }
  | { type: 'status'; status: 'failed'; error: Error }

export interface RecordingOptions {
  streamInfo: StreamInfo
  videoBitsPerSecond: number
  preferMP4: boolean
}

export interface RecordingResult {
  fileName: string
  writtenBytes: number
  streamInfo: StreamInfo
  durationMs: number
}

export interface RecordingSession {
  readonly status: RecordingStatus
  start(): Promise<void>
  stop(): Promise<RecordingResult>
  dispose(): Promise<void>
}
