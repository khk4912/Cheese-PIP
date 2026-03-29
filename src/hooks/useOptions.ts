import { use } from 'react'
import { OptionContext } from '@/providers/OptionContext'

export function useOptions () {
  const context = use(OptionContext)

  if (context == null) {
    throw new Error('useOptions must be used within an OptionProvider')
  }

  return context
}
