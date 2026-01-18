export interface TMInfoResponse {
  code: number
  message: string | null
  content: {
    timeMachinePlayback: {
      meta: {
        videoId: string
        streamSeq: number
        liveId: string
        paidLive: boolean
        cdnInfo: {
          cdnType: string
        }
        p2p: boolean
        cmcdEnabled: boolean
        playbackAuthType: string
      }
      serviceMeta: {
        contentType: string
      }
      live: {
        start: string
        open: string
        timeMachine: boolean
        status: string
      }
      api: Array<{
        name: string
        path: string
      }>
      media: Array<{
        mediaId: string
        protocol: string
        path: string
        encodingTrack: Array<{
          encodingTrackId: string
          videoProfile?: string
          audioProfile?: string
          p2pPath?: string
          p2pPathUrlEncoding?: string
          videoCodec?: string
          videoBitRate?: number
          audioBitRate: number
          videoFrameRate?: string
          videoWidth?: number
          videoHeight?: number
          audioSamplingRate: number
          audioChannel: number
          avoidReencoding: boolean
          videoDynamicRange?: string
          path?: string
          audioCodec?: string
          audioOnly?: boolean
        }>
        latency?: string
      }>
      thumbnail: {
        snapshotThumbnailTemplate: string
        spriteSeekingThumbnail: {
          spriteFormat: {
            rowCount: number
            columnCount: number
            intervalType: string
            interval: number
            thumbnailWidth: number
            thumbnailHeight: number
          }
          urlTemplate: string
          processingSeconds: number
        }
        types: Array<string>
      }
      multiview: Array<any> // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    timeMachineDurationMs: number
    liveOpenDate: string
  }
}
