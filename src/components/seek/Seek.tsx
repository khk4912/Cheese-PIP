import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

import './seek.css'
import LeftSVG from '@/assets/static/seek_left.svg?react'
import RightSVG from '@/assets/static/seek_right.svg?react'

function SeekLeft ({ state }: { state: boolean }): React.ReactNode {
  return (
    <div className='chzzk-seek-overlay seek-left' style={{ opacity: Number(state) }}>
      <LeftSVG />
      <span>- 5초</span>
    </div>
  )
}

function SeekRight ({ state }: { state: boolean }): React.ReactNode {
  return (
    <div className='chzzk-seek-overlay seek-right' style={{ opacity: Number(state) }}>
      <RightSVG />
      <span>+ 5초</span>
    </div>
  )
}

export function SeekPortal (): React.ReactNode {
  const target = usePortal({
    id: 'chzzk-seek-portal',
    targetSelector: '.pzp-command-icon',
    position: 'after'
  })

  return (
    <SeekPortalContainer target={target}>
      <Seek />
    </SeekPortalContainer>
  )
}

function SeekPortalContainer ({ target, children }: { target: Element | null, children: React.ReactNode }) {
  return target ? ReactDOM.createPortal(children, target) : null
}

/**
 * Seek component
 *
 * 스트림을 앞뒤로 탐색하고,
 * 스트림 화면에 탐색 중임을 표시해주는 컴포넌트입니다.
 */
function Seek (): React.ReactNode {
  const [left, setLeft] = useState(false)
  const [right, setRight] = useState(false)

  const leftTimer = useRef<number | undefined>(undefined)
  const rightTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(leftTimer.current)
      window.clearTimeout(rightTimer.current)
      setLeft(false)
      setRight(false)
    }
  }, [])

  useShortcut('ArrowLeft', () => {
    const video = document.querySelector('.webplayer-internal-video')
    seekLeft(video as HTMLVideoElement)

    setLeft(true)

    window.clearTimeout(leftTimer.current)
    leftTimer.current = window.setTimeout(() => {
      setLeft(false)
    }, 1000)
  })

  useShortcut('ArrowRight', () => {
    const video = document.querySelector('.webplayer-internal-video')
    seekRight(video as HTMLVideoElement)

    setRight(true)

    window.clearTimeout(rightTimer.current)
    rightTimer.current = window.setTimeout(() => {
      setRight(false)
    }, 1000)
  })

  return (
    <>
      <SeekLeft state={left} />
      <SeekRight state={right} />
    </>
  )
}
