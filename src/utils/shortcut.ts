type ShortcutKeyEvent = Pick<KeyboardEvent, 'key' | 'code'>
type ModifierKeyEvent = Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'>

/**
 * 단축키로 사용할 수 있는 영문자/숫자 키를 대문자로 반환합니다.
 * 한글 입력 상태(ㄱ, Process 등)에서도 같은 키로 인식하도록 물리 키 위치(code)를 fallback으로 사용합니다.
 */
export function getShortcutKey(event: ShortcutKeyEvent): string | null {
  if (/^[a-z0-9]$/i.test(event.key)) {
    return event.key.toUpperCase()
  }

  return /^(?:Key|Digit)([A-Z0-9])$/.exec(event.code)?.[1] ?? null
}

export function hasModifierKey(event: ModifierKeyEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey
}
