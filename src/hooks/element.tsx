export function useElementTarget (selector: string) {
  const [target, setTarget] = useState<Element | undefined>(undefined)

  useEffect(() => {
    if (target === undefined) {
      waitForElement(selector)
        .then(setTarget)
        .catch(console.error)
    }
  }, [selector, target])

  return target
}

export const waitForElement = async (querySelector: string): Promise<Element> => {
  return await new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = document.querySelector(querySelector)
      if (element !== null) {
        clearInterval(interval)
        resolve(element)
      }
    }, 100)
  })
}

type InsertPositions = 'before' | 'prepend' | 'append' | 'after'
interface UsePortalProps {
  id?: string
  targetSelector?: string
  position?: InsertPositions
}

export function usePortal ({ targetSelector, id, position = 'after' }: UsePortalProps) {
  const [div] = useState(() => {
    const d = document.createElement('div')
    if (id) { d.id = id }

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
