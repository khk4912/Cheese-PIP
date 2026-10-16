import type {
  RecordingEvent,
  RecordingOptions,
  RecordingResult,
  RecordingSession as RecordingSessionInterface,
  RecordingStatus,
} from '@/types/record_session'

export class RecordingSession implements RecordingSessionInterface {
  readonly #options: RecordingOptions
  readonly #onEvent?: (event: RecordingEvent) => void

  #status: RecordingStatus = 'idle'
  #startedPerf: number = 0
  #stoppedPerf: number = 0

  constructor(options: RecordingOptions, onEvent?: (event: RecordingEvent) => void) {
    this.#options = options
    this.#onEvent = onEvent
  }

  async start(): Promise<void> {
    if (this.status !== 'idle') {
      throw new Error('Recording session is already started or in progress.')
    }

    this.#setStatus('starting')
    // TODO: 'recording'으로 바꾸는 순간 #startedPerf = performance.now()
  }

  async stop(): Promise<RecordingResult> {
    if (this.status !== 'recording' && this.status !== 'starting') {
      throw new Error('Recording session is not in progress.')
    }

    this.#stoppedPerf = performance.now()
    this.#setStatus('stopping')

    throw new Error('Method not implemented.')
  }

  async dispose(): Promise<void> {
    try {
      switch (this.status) {
        case 'starting':
        case 'recording':
        case 'stopping':
          break

        case 'stopped':
          break
      }
    } catch (e) {
      console.error('Recording session dispose failed:', e)
    }
  }

  #setStatus(status: Exclude<RecordingStatus, 'failed'>): void {
    if (this.#status === status) return

    this.#status = status
    this.#emit({ type: 'status', status })
  }

  async #fail(cause: unknown): Promise<void> {
    if (this.#status === 'stopped' || this.#status === 'failed') return

    const error = cause instanceof Error ? cause : new Error(String(cause))
    await this.#cleanup()

    this.#status = 'failed'
    this.#emit({ type: 'status', status: 'failed', error })
  }

  async #cleanup(): Promise<void> {
    // TODO: capture·backend·sink 정리
  }

  #emit(event: RecordingEvent): void {
    try {
      this.#onEvent?.(event)
    } catch (error) {
      console.error('Recording session event handler failed:', error)
    }
  }

  get status(): RecordingStatus {
    return this.#status
  }

  get startedPerf(): number {
    return this.#startedPerf
  }
}
