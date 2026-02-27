import { createContext } from 'react'
import type { RecordInfo } from '../types/record_info'

const isObject = (x: unknown): x is Record<string, unknown> => {
  return typeof x === 'object' && x !== null
}

const checkRecordInfo = (x: unknown): x is RecordInfo => {
  if (!isObject(x)) return false

  return (
    typeof x.startDateTime === 'number' &&
    typeof x.resultBlobURL === 'string' &&
    typeof x.streamInfo === 'object'
  )
}

const DEFAULT_RECORD_INFO: RecordInfo = {
  startDateTime: -1,
  stopDateTime: -1,
  resultBlobURL: 'string',
  isMP4: false,
  streamInfo: {
    streamerName: 'streamer',
    streamTitle: 'title'
  },
  highFrameRec: false
} // 기본으로 사용되는 RecordInfo

export const setRecordInfo = async (info: RecordInfo): Promise<void> => {
  await chrome.storage.local.set({ recordInfo: info })
}

export const getRecordInfo = async (): Promise<RecordInfo> => {
  const data = await chrome.storage.local.get('recordInfo')

  if (typeof data.recordInfo !== 'object') {
    console.error('recordInfo is corrupted!')
    return DEFAULT_RECORD_INFO
  }
  const recordInfo = data.recordInfo as RecordInfo

  // Check if data is RecordInfo
  if (!checkRecordInfo(recordInfo)) {
    console.error('recordInfo is corrupted!')
    return DEFAULT_RECORD_INFO
  }

  return recordInfo
}

export const setTempBlobURL = async (url: string): Promise<void> => {
  await chrome.storage.local.set({ tempBlobURL: url })
}

export const getTempBlobURL = async (): Promise<string> => {
  const { tempBlobURL } = await chrome.storage.local.get('tempBlobURL') as { tempBlobURL: string }
  return tempBlobURL
}

type Context<T> = [T, React.Dispatch<React.SetStateAction<T>>]
export const RecordStateContext = createContext < Context < boolean>>([false, () => {}])
