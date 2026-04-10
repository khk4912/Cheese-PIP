export interface StreamInfo {
  streamTitle: string
  streamerName: string
}

interface RecordInfoBase {
  startDateTime: number // new Date().getTime()
  stopDateTime: number
  resultBlobURL: string
  streamInfo: StreamInfo
  isMP4: boolean
  highFrameRec?: boolean
  audioBlobURL?: string
}

interface HighFPSRecordInfo extends RecordInfoBase {
  highFrameRec?: true
  audioBlobURL: string
}

interface LowFPSRecordInfo extends RecordInfoBase {
  highFrameRec?: false // Set the type to 'false' for highFrameRec
  audioBlobURL?: undefined // Set the type to 'undefined' for audioBlobURL
}

export type RecordInfo = HighFPSRecordInfo | LowFPSRecordInfo

export interface DownloadInfo {
  recordInfo: RecordInfo
  length: number
  fileName: string
}
