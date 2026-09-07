import { useState, useEffect } from 'react'

export function useElementTarget(selector: string) {
  const [target, setTarget] = useState<Element | undefined>(undefined)
  useEffect(() => {
    if (target !== undefined) {
      return
    }

    const interval = window.setInterval(() => {
      const element = document.querySelector(selector)
      if (element === null) {
        return
      }

      window.clearInterval(interval)
      setTarget(element)
    }, 100)

    return () => {
      window.clearInterval(interval)
    }
  }, [selector, target])

  return target
}

type InsertPositions = 'before' | 'prepend' | 'append' | 'after'
interface UsePortalProps {
  id?: string
  targetSelector?: string
  position?: InsertPositions
  style?: React.CSSProperties
}

// 확장 프로그램 렌더를 위해 사용하는 Portal Hook
export function usePortal({ targetSelector, id, position = 'after', style }: UsePortalProps) {
  const [div] = useState(() => {
    const d = document.createElement('div')
    if (id) {
      d.id = id
    }
    if (style) {
      Object.assign(d.style, style)
    }

    return d
  })

  const [isAttached, setIsAttached] = useState(false)
  const tgNode = useElementTarget(targetSelector ?? 'body')

  useEffect(() => {
    if (!tgNode) {
      return
    }

    const positionMap: Record<InsertPositions, InsertPosition> = {
      before: 'beforebegin',
      prepend: 'afterbegin',
      append: 'beforeend',
      after: 'afterend',
    }

    const insertPosition = positionMap[position]
    if (insertPosition) {
      tgNode.insertAdjacentElement(insertPosition, div)
    } else {
      tgNode.appendChild(div)
    }

    // DOM 부착 결과를 반영한 다음 포털의 자식과 단축키를 활성화합니다.
    // oxlint-disable-next-line react/set-state-in-effect
    setIsAttached(div.isConnected)

    return () => {
      setIsAttached(false)
      div.remove()
    }
  }, [tgNode, div, position])

  return isAttached ? div : null
}
