import { useEffect, useEffectEvent } from 'react'
import { getShortcutKey, hasModifierKey } from '@/utils/shortcut'

/**
 * 키보드 키를 감지하여 callback을 실행하는 hook입니다.
 *
 * @param key 감지할 키 / 키들의 배열
 * @param callback 키 입력 시 실행할 콜백 함수
 */
export function useShortcut(key: string | string[], callback: () => void): void {
  const onShortcut = useEffectEvent(callback)

  useEffect(() => {
    const keys = (typeof key === 'string' ? [key] : key).map(candidate => candidate.toUpperCase())

    const listener = (event: KeyboardEvent): void => {
      const activeElement = document.activeElement

      // 입력 요소가 검색창, 채팅창 등의 입력 요소일 경우 무시
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable) ||
        (event.target instanceof HTMLElement && event.target.isContentEditable) ||
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLPreElement
      ) {
        return
      }

      // 또는 cmd, opt 등 다른 단축키에 자주 사용되는 키와 함께 눌렸을 경우 무시
      if (hasModifierKey(event)) {
        return
      }

      const eventKey = getShortcutKey(event)
      if (eventKey !== null && keys.includes(eventKey)) {
        onShortcut()
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [key])
}
