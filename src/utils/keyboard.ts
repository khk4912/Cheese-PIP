// textarea를 찾기 위한 CSS 선택자
const INPUT_SELECTOR = '#aside-chatting textarea'

/** 대상 textarea에 포커스 후 전체 선택 */
function focusTarget (): void {
  const el = document.querySelector<HTMLTextAreaElement>(INPUT_SELECTOR)
  if (el) {
    el.focus()
    el.select() // 자동 전체 선택(원치 않으면 제거)
  }
}

/** 사용자가 이미 다른 입력창에 타이핑 중인지 확인 */
function isTypingInEditable (): boolean {
  const active = document.activeElement
  if (!active) return false
  return (
    active.tagName === 'INPUT' ||
    active.tagName === 'TEXTAREA' ||
    (active as HTMLElement).isContentEditable
  )
}

/** 전역 키보드 이벤트 리스너 */
window.addEventListener('keydown', (e: KeyboardEvent) => {
  // Ctrl/Alt/Meta/Shift가 눌리면 무시
  if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return
  // 이미 다른 입력 필드에 커서가 있으면 무시
  if (isTypingInEditable()) return
  // 단독 'c' 키 확인
  if (e.key === 'c' || e.key === 'C') {
    e.preventDefault() // (선택) 기본 입력 차단
    focusTarget()
  }
})
