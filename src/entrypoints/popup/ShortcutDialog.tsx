import { useEffect, useRef, useState } from 'react'
import { bindings, labels, useShortcutEditor } from './useShortcutEditor'

function ShortcutDialog({ onClose }: { onClose: () => void }) {
  const { keyBindings, editing, error, isSaving, startEditing, cancelEditing, handleKeyDown } =
    useShortcutEditor()

  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const close = () => {
    if (!isSaving) onClose()
  }

  return (
    // 배경 클릭은 Esc와 닫기 버튼으로도 수행할 수 있습니다.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby="shortcuts-title"
      className="m-auto w-[calc(100%_-_32px)] max-w-72 rounded-xl border border-white/10 bg-[var(--chzzk-bg)] p-4 tracking-tight text-zinc-50 backdrop:bg-black/65"
      onCancel={event => {
        event.preventDefault()
        if (editing) cancelEditing()
        else close()
      }}
      onClick={event => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close()
      }}
    >
      <div className="flex items-center justify-between">
        <h2 id="shortcuts-title" className="text-lg font-semibold text-white">
          단축키 설정
        </h2>

        <button
          type="button"
          aria-label="단축키 설정 닫기"
          disabled={isSaving}
          onClick={close}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
      <div className="mt-3 grid gap-1">
        {bindings.map(binding => (
          <div key={binding} className="flex min-h-10 items-center gap-3">
            <span className="flex-1 text-base text-zinc-200">{labels[binding]}</span>
            <span className="min-w-5 text-center text-xs text-zinc-500">
              {keyBindings[binding]}
            </span>
            <button
              type="button"
              aria-label={`${labels[binding]} 단축키 변경`}
              aria-pressed={editing === binding}
              aria-disabled={isSaving}
              aria-describedby="shortcuts-error"
              className="min-w-12 cursor-pointer rounded-md bg-white/5 px-2 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/10 focus-visible:outline-chzzk-green aria-pressed:text-chzzk-green"
              onClick={() => startEditing(binding)}
              onBlur={() => {
                if (editing === binding) cancelEditing()
              }}
              onKeyDownCapture={event => handleKeyDown(binding, event)}
            >
              변경
            </button>
          </div>
        ))}
      </div>
      <output
        id="shortcuts-error"
        className="mt-2 block text-[0.7rem] break-keep text-red-400 empty:hidden"
      >
        {error}
      </output>
    </dialog>
  )
}

export function ShortcutSetting() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:cursor-pointer hover:bg-white/10"
      >
        단축키 설정
      </button>
      {isOpen && <ShortcutDialog onClose={() => setIsOpen(false)} />}
    </>
  )
}
