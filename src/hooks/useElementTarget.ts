import { useEffect, useState } from 'react'

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
