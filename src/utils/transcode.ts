import { FFmpeg, type FileData } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { useEffect, useRef, useState } from 'react'

import workerURL from '@ffmpeg/ffmpeg/worker?worker&url'

const FFMPEG_OPTION = {
  coreURL: chrome.runtime.getURL('ffmpeg/ffmpeg-core.js'),
  wasmURL: chrome.runtime.getURL('ffmpeg/ffmpeg-core.wasm'),
  workerURL: chrome.runtime.getURL('ffmpeg/ffmpeg-core.worker.js'),
  classWorkerURL: new URL(workerURL, import.meta.url).href,
}

function fileDataToBlobPart (data: FileData): BlobPart {
  if (typeof data === 'string') {
    return data
  }

  return new Uint8Array(data)
}

/**
 * FFmpeg 인스턴스를 생성하고 초기화해주는 hook입니다.
 *
 * @param videoDur 작업할 비디오의 길이 (초, progress 계산에 사용됨
 * @returns [FFmpeg instance ref, 준비 여부, 진행률 state, 진행률 state setter]
 */
export function useFFmpeg (videoDur: number): readonly [React.MutableRefObject<FFmpeg>, boolean, number, React.Dispatch<React.SetStateAction<number>> ] {
  const ffmpeg = useRef<FFmpeg>(new FFmpeg())

  const [videoDuration, setVideoDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setVideoDuration(videoDur)
  }
  , [videoDur])

  useEffect(() => {
    ffmpeg.current.load({ ...FFMPEG_OPTION })
      .then(
        () => {
          ffmpeg.current.on('log', ({ message }) => { console.log(message) })
          ffmpeg.current.on('progress', ({ time }) => {
            const val = Math.floor(((time / 1000000) / videoDuration * 100))

            if (val > 100 || val < 0 || isNaN(val)) {
              return
            }

            setProgress(val)
          })
          setIsReady(true)
        }
      )
      .catch(console.log)
  }, [videoDuration])

  return [ffmpeg, isReady, progress, setProgress] as const
}

export async function toMP4 (ffmpeg: FFmpeg, inputFileURL: string): Promise<string> {
  return await _transcode(ffmpeg, inputFileURL, 'output.mp4', ['-c', 'copy'])
}

export async function toMP4AAC (ffmpeg: FFmpeg, inputFileURL: string): Promise<string> {
  return await _transcode(ffmpeg, inputFileURL, 'output.mp4', ['-c:a', 'aac'])
}

export async function toGIF (ffmpeg: FFmpeg, inputFileURL: string): Promise<string> {
  return await _transcode(ffmpeg, inputFileURL, 'output.gif', ['-vf', 'fps=30,scale=320:-1'])
}

export async function toWEBP (ffmpeg: FFmpeg, inputFileURL: string): Promise<string> {
  return await _transcode(ffmpeg, inputFileURL, 'output.webp', ['-c:v', 'webp'])
}

/**
 * ffmpeg를 사용하여 비디오를 변환하는 함수입니다.
 *
 * @param ffmpeg ffmepg instance
 * @param inputFileURL 변환할 비디오 파일의 URL
 * @param outputFileName 출력 파일 이름
 * @param args ffmpeg 명령어 arguments
 * @param type Blob type (optional)
 *
 * @returns 변환된 비디오 파일의 Blob URL
 */
async function _transcode (
  ffmpeg: FFmpeg,
  inputFileURL: string,
  outputFileName: string,
  args: string[],
  type?: string): Promise<string> {
  const input = await fetchFile(inputFileURL)
  await ffmpeg.writeFile('input.webm', input)

  await ffmpeg.exec(['-i', 'input.webm', ...args, outputFileName])
  const output = await ffmpeg.readFile(outputFileName)

  return URL.createObjectURL(new Blob([fileDataToBlobPart(output)], { type: type === undefined ? 'video/mp4' : `video/${type}` }))
}

/**
 * 영상을 설정한 시간으로 분할합니다.
 *
 * @param ffmpeg ffmpeg instance
 * @param inputFileURL 분할할 영상 파일의 URL
 * @param targetSegmentTime 분할할 시간 (초)
 *
 * @returns 분할된 영상 파일들의 Blob URL array
 */
export async function segmentize (ffmpeg: FFmpeg, inputFileURL: string, targetSegmentTime: number): Promise<string[]> {
  const input = await fetchFile(inputFileURL)
  await ffmpeg.writeFile('input.webm', input)
  await ffmpeg.exec(['-i', 'input.webm', '-map', '0', '-f', 'segment', '-segment_time', targetSegmentTime.toString(), '-c', 'copy', '-reset_timestamps', '1', 'output%03d.mp4'])

  const output: string[] = []

  const files = await ffmpeg.listDir('.')
  for (const file of files) {
    if (file.name.startsWith('output') && file.name.endsWith('.mp4')) {
      const data = await ffmpeg.readFile(file.name)
      output.push(URL.createObjectURL(new Blob([fileDataToBlobPart(data)], { type: 'video/mp4' })))
    }
  }

  return output
}

/**
 * 영상에서 특정 부분만 잘라내서 반환합니다.

 * @param ffmpeg ffmpeg instance
 * @param inputFileURL 잘라낼 영상 파일의 URL
 * @param start 시작 시간 (초)
 * @param end 종료 시간 (초)
 *
 * @returns 잘라낸 영상 파일의 Blob URL
 */
export async function trim (ffmpeg: FFmpeg, inputFileURL: string, start: number, end: number): Promise<string> {
  const input = await fetchFile(inputFileURL)
  await ffmpeg.writeFile('input.webm', input)

  await ffmpeg.exec(['-i', 'input.webm', '-ss', start.toString(), '-to', end.toString(), '-c', 'copy', 'output.mp4'])
  const output = await ffmpeg.readFile('output.mp4')

  return URL.createObjectURL(new Blob([fileDataToBlobPart(output)], { type: 'video/mp4' }))
}
