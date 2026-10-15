import { useState, type KeyboardEvent } from 'react'
import { useOptions } from '@/hooks/useOptions'
import type { KeyBindingName, KeyBindings } from '@/storage/keyBindings'
import { getShortcutKey, hasModifierKey } from '@/utils/shortcut'

export const labels: Record<KeyBindingName, string> = {
  rec: '녹화',
  screenshot: '스크린샷',
  pip: 'PIP+',
}
export const bindings = Object.keys(labels) as KeyBindingName[]

function findDuplicateBinding(
  keyBindings: KeyBindings,
  binding: KeyBindingName,
  key: string
): KeyBindingName | undefined {
  return bindings.find(other => other !== binding && keyBindings[other].toUpperCase() === key)
}

export function useShortcutEditor() {
  const { keyBindings, isSaving, updateKeyBinding } = useOptions()
  const [editing, setEditing] = useState<KeyBindingName | null>(null)
  const [error, setError] = useState('')

  const cancelEditing = () => {
    if (isSaving) return
    setEditing(null)
    setError('')
  }

  const startEditing = (binding: KeyBindingName) => {
    if (isSaving) return
    setEditing(binding)
    setError('')
  }

  const save = async (binding: KeyBindingName, key: string) => {
    const duplicate = findDuplicateBinding(keyBindings, binding, key)
    if (duplicate) {
      setError(`${labels[duplicate]}에서 사용 중인 키예요.`)
      return
    }

    setError('')
    if (await updateKeyBinding(binding, key)) {
      setEditing(null)
    } else {
      setError('저장하지 못했어요. 키를 다시 눌러주세요.')
    }
  }

  const handleKeyDown = (binding: KeyBindingName, event: KeyboardEvent<HTMLButtonElement>) => {
    if (editing !== binding) return
    if (event.key === 'Tab') return
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Escape') {
      cancelEditing()
      return
    }
    if (event.repeat || isSaving) return

    const key = getShortcutKey(event)
    if (key === null || hasModifierKey(event)) {
      setError('조합키는 사용할 수 없어요.')
      return
    }
    void save(binding, key)
  }

  return { keyBindings, editing, error, isSaving, startEditing, cancelEditing, handleKeyDown }
}
