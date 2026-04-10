import { useState, useEffect } from 'react'

export function useElementTarget (selector: string) {
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

export function usePortal ({ targetSelector, id, position = 'after', style }: UsePortalProps) {
  const [div] = useState(() => {
    const d = document.createElement('div')
    if (id) { d.id = id }
    if (style) { Object.assign(d.style, style) }

    return d
  })

  const tgNode = useElementTarget(targetSelector ?? 'body')

  useEffect(() => {
    if (!tgNode) {
      return
    }

    const positionMap: Record<InsertPositions, InsertPosition> = {
      before: 'beforebegin',
      prepend: 'afterbegin',
      append: 'beforeend',
      after: 'afterend'
    }

    const insertPosition = positionMap[position]
    if (insertPosition) {
      tgNode.insertAdjacentElement(insertPosition, div)
    } else {
      tgNode.appendChild(div)
    }

    return () => {
      div.remove()
    }
  }, [tgNode, div, position])

  return div
}
