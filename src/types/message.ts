export interface MessageType {
  type: string
  data: unknown
}

export interface DownloadMessage extends MessageType {
  type: 'download'
  data: {
    url: string
    fileName: string
  }
}
