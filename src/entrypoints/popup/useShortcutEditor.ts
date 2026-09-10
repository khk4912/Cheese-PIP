import { useRef, useState, type KeyboardEvent } from 'react'
import { useOptions } from '@/hooks/useOptions'
import { getKeyBindings, setKeyBindings, type KeyBindings } from '@/utils/options'

export const labels: Record<keyof KeyBindings, string> = {
  rec: '녹화',
  screenshot: '스크린샷',
  pip: 'PIP+',
}
export const bindings = Object.keys(labels) as Array<keyof KeyBindings>

export function useShortcutEditor() {
  const { keyBindings } = useOptions()
  const savingRef = useRef(false)
  const [editing, setEditing] = useState<keyof KeyBindings | null>(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const cancelEditing = () => {
    if (savingRef.current) return
    setEditing(null)
    setError('')
  }
  const save = async (binding: keyof KeyBindings, key: string) => {
    if (savingRef.current) return
    savingRef.current = true
    setIsSaving(true)
    setError('')
    try {
      const latest = await getKeyBindings()
      const duplicate = bindings.find(
        other => other !== binding && latest[other].toUpperCase() === key
      )
      if (duplicate) {
        setError(`${labels[duplicate]}에서 사용 중인 키예요.`)
        return
      }
      await setKeyBindings(binding, key)
      setEditing(null)
    } catch {
      setError('저장하지 못했어요. 키를 다시 눌러주세요.')
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  const startEditing = (binding: keyof KeyBindings) => {
    if (savingRef.current) return
    setEditing(binding)
    setError('')
  }

  const handleKeyDown = (binding: keyof KeyBindings, event: KeyboardEvent<HTMLButtonElement>) => {
    if (editing !== binding) return
    if (event.key === 'Tab') return
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Escape') {
      cancelEditing()
      return
    }
    if (event.repeat || savingRef.current) return
    const key = /^[a-z0-9]$/i.test(event.key)
      ? event.key.toUpperCase()
      : /^(Key[A-Z]|Digit[0-9])$/.test(event.code)
        ? event.code.replace(/^(Key|Digit)/, '')
        : ''
    if (!key || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
      setError('조합키는 사용할 수 없어요.')
      return
    }
    void save(binding, key)
  }

  return { keyBindings, editing, error, isSaving, startEditing, cancelEditing, handleKeyDown }
}
