import { storage } from '#imports'
import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import {
  DEFAULT_OPTIONS,
  getOptions,
  mergeOptions,
  OPTIONS_STORAGE_KEY,
  setOptions,
} from '@/storage/options'
import {
  DEFAULT_KEYBINDINGS,
  getKeyBindings,
  KEYBINDINGS_STORAGE_KEY,
  mergeKeyBindings,
  setKeyBindings,
} from '@/storage/keyBindings'
import { OptionContext, type OptionContextValue } from './OptionContext'

type LoadStatus = 'loading' | 'ready' | 'error'

function useStoredValue<T extends object>(
  key: `local:${string}`,
  defaults: T,
  read: () => Promise<T>,
  write: (value: T) => Promise<void>,
  merge: (value: Partial<T> | null) => T
) {
  const [value, setValue] = useState(defaults)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const valueRef = useRef(defaults)
  const revision = useRef(0)

  useEffect(() => {
    let isMounted = true

    const apply = (next: T) => {
      valueRef.current = next
      setValue(next)
      setStatus('ready')
    }

    const unwatch = storage.watch<Partial<T>>(key, next => {
      if (!isMounted) return
      revision.current += 1
      apply(merge(next))
    })

    const initialRevision = revision.current
    void read()
      .then(next => {
        if (isMounted && revision.current === initialRevision) apply(next)
      })
      .catch(() => {
        if (isMounted && revision.current === initialRevision) setStatus('error')
      })

    return () => {
      isMounted = false
      unwatch()
    }
  }, [key, read, merge])

  const update = async <K extends keyof T>(field: K, fieldValue: T[K]) => {
    const next: T = { ...valueRef.current, [field]: fieldValue }
    const previousRevision = revision.current
    await write(next)

    // 저장하는 동안 storage.watch로 더 최신 값이 들어왔다면 덮어쓰지 않습니다.
    if (revision.current !== previousRevision) return
    valueRef.current = next
    setValue(next)
  }

  return {
    value,
    isLoading: status === 'loading',
    isReady: status === 'ready',
    error: status === 'error' ? '설정을 불러오지 못했어요. 팝업을 닫았다가 다시 열어주세요.' : null,
    update,
  }
}

export function OptionProvider({ children }: PropsWithChildren) {
  const options = useStoredValue(
    OPTIONS_STORAGE_KEY,
    DEFAULT_OPTIONS,
    getOptions,
    setOptions,
    mergeOptions
  )
  const keyBindings = useStoredValue(
    KEYBINDINGS_STORAGE_KEY,
    DEFAULT_KEYBINDINGS,
    getKeyBindings,
    setKeyBindings,
    mergeKeyBindings
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saving = useRef(false)

  const isLoading = options.isLoading || keyBindings.isLoading
  const isReady = options.isReady && keyBindings.isReady
  const error = options.error ?? keyBindings.error ?? saveError

  const save = async (write: () => Promise<void>): Promise<boolean> => {
    if (!isReady || saving.current) return false
    saving.current = true
    setIsSaving(true)
    setSaveError(null)
    try {
      await write()
      return true
    } catch {
      setSaveError('설정을 저장하지 못했어요. 다시 시도해주세요.')
      return false
    } finally {
      saving.current = false
      setIsSaving(false)
    }
  }

  const updateOption: OptionContextValue['updateOption'] = (key, value) =>
    save(() => options.update(key, value))

  const updateKeyBinding: OptionContextValue['updateKeyBinding'] = (key, value) =>
    save(() => keyBindings.update(key, value))

  return (
    <OptionContext
      value={{
        options: options.value,
        keyBindings: keyBindings.value,
        isLoading,
        isReady,
        isSaving,
        error,
        updateOption,
        updateKeyBinding,
      }}
    >
      {children}
    </OptionContext>
  )
}
