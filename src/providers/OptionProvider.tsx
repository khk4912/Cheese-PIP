import { storage } from '#imports'
import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
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
  type KeyBindings,
  type CheesePIPOptions,
} from '@/utils/options'
import { OptionContext, type OptionContextValue } from './OptionContext'

export function OptionProvider ({ children }: PropsWithChildren) {
  const [options, setOptionState] = useState<CheesePIPOptions>(DEFAULT_OPTIONS)
  const [keyBindings, setKeyBindingsState] = useState<Required<KeyBindings>>(DEFAULT_KEYBINDINGS)

  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isKeyBindingsLoading, setIsKeyBindingsLoading] = useState(true)
  const optionsRef = useRef(options)
  const keyBindingsRef = useRef(keyBindings)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    keyBindingsRef.current = keyBindings
  }, [keyBindings])

  useEffect(() => {
    let isMounted = true
    const unwatch = storage.watch<Partial<CheesePIPOptions>>(OPTIONS_STORAGE_KEY, (newValue) => {
      if (!isMounted) {
        return
      }

      setOptionState(mergeOptions(newValue))
      setIsOptionsLoading(false)
    })

    void getOptions().then((loadedOptions) => {
      if (!isMounted) {
        return
      }

      setOptionState(loadedOptions)
      setIsOptionsLoading(false)
    })

    return () => {
      isMounted = false
      unwatch()
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const unwatch = storage.watch<Partial<KeyBindings>>(KEYBINDINGS_STORAGE_KEY, (newValue) => {
      if (!isMounted) {
        return
      }

      setKeyBindingsState(mergeKeyBindings(newValue))
      setIsKeyBindingsLoading(false)
    })

    void getKeyBindings().then((loadedKeyBindings) => {
      if (!isMounted) {
        return
      }

      setKeyBindingsState(loadedKeyBindings)
      setIsKeyBindingsLoading(false)
    })

    return () => {
      isMounted = false
      unwatch()
    }
  }, [])

  const updateOption: OptionContextValue['updateOption'] = async (key, value) => {
    const nextOptions = {
      ...optionsRef.current,
      [key]: value,
    }

    optionsRef.current = nextOptions
    setOptionState(nextOptions)
    await setOptions(nextOptions)
  }

  const updateKeyBinding: OptionContextValue['updateKeyBinding'] = async (key, value) => {
    const nextKeyBindings = {
      ...keyBindingsRef.current,
      [key]: value,
    }

    keyBindingsRef.current = nextKeyBindings
    setKeyBindingsState(nextKeyBindings)
    await setKeyBindings(key, value)
  }

  const isLoading = isOptionsLoading || isKeyBindingsLoading

  return (
    <OptionContext value={{ options, keyBindings, isLoading, updateOption, updateKeyBinding }}>
      {children}
    </OptionContext>
  )
}
