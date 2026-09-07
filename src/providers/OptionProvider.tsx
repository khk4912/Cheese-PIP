import { storage } from '#imports'
import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import {
  DEFAULT_KEYBINDINGS,
  getOptions,
  getKeyBindings,
  KEYBINDINGS_STORAGE_KEY,
  mergeOptions,
  mergeKeyBindings,
  OPTIONS_STORAGE_KEY,
  DEFAULT_OPTIONS,
  setOptions,
  setKeyBindings,
} from '@/utils/options'
import { OptionContext, type OptionContextValue } from './OptionContext'

function useStoredValue<T>(
  key: `local:${string}`,
  defaults: T,
  read: () => Promise<T>,
  merge: (value: Partial<T> | null) => T
) {
  const [value, setValue] = useState(defaults)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const valueRef = useRef(defaults)
  const ready = useRef(false)
  const revision = useRef(0)

  useEffect(() => {
    let isMounted = true
    ready.current = false

    const apply = (next: T) => {
      valueRef.current = next
      ready.current = true
      setValue(next)
      setIsLoading(false)
      setError(null)
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
        if (!isMounted || revision.current !== initialRevision) return
        setIsLoading(false)
        setError('설정을 불러오지 못했어요. 팝업을 닫았다가 다시 열어주세요.')
      })

    return () => {
      isMounted = false
      ready.current = false
      unwatch()
    }
  }, [key, read, merge])

  const confirm = (next: T, previousRevision: number) => {
    if (!ready.current || revision.current !== previousRevision) return
    valueRef.current = next
    setValue(next)
  }

  return { value, valueRef, ready, revision, confirm, isLoading, error }
}

export function OptionProvider({ children }: PropsWithChildren) {
  const options = useStoredValue(OPTIONS_STORAGE_KEY, DEFAULT_OPTIONS, getOptions, mergeOptions)
  const keyBindings = useStoredValue(
    KEYBINDINGS_STORAGE_KEY,
    DEFAULT_KEYBINDINGS,
    getKeyBindings,
    mergeKeyBindings
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saving = useRef(false)

  const save = async (write: () => Promise<void>) => {
    if (!options.ready.current || !keyBindings.ready.current || saving.current) return
    saving.current = true
    setIsSaving(true)
    setSaveError(null)
    try {
      await write()
    } catch {
      setSaveError('설정을 저장하지 못했어요. 다시 시도해주세요.')
    } finally {
      saving.current = false
      setIsSaving(false)
    }
  }

  const updateOption: OptionContextValue['updateOption'] = (key, value) =>
    save(async () => {
      const next = { ...options.valueRef.current, [key]: value }
      const revision = options.revision.current
      await setOptions(next)
      options.confirm(next, revision)
    })

  const updateKeyBinding: OptionContextValue['updateKeyBinding'] = (key, value) =>
    save(async () => {
      const next = { ...keyBindings.valueRef.current, [key]: value }
      const revision = keyBindings.revision.current
      await setKeyBindings(key, value)
      keyBindings.confirm(next, revision)
    })

  const isLoading = options.isLoading || keyBindings.isLoading
  const isReady = !isLoading && options.ready.current && keyBindings.ready.current
  const error = options.error ?? keyBindings.error ?? saveError

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
