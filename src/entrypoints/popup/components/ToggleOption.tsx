import { cn } from '@/utils/cn'
import type { BooleanOptionKey } from '@/storage/options'
import { useOptions } from '@/hooks/useOptions'
import { OptionRow } from './OptionRow'

type ToggleOptionProps = {
  optionKey: BooleanOptionKey
  label: string
  description?: string
}

export function ToggleOption({ optionKey, label, description }: ToggleOptionProps) {
  const { options, updateOption } = useOptions()

  return (
    <OptionRow label={label} description={description}>
      <label
        aria-label={`${label} 토글`}
        className="inline-flex shrink-0 cursor-pointer items-center"
      >
        <input
          type="checkbox"
          value={`${label} 토글`}
          className="peer sr-only"
          checked={options[optionKey]}
          onChange={e => {
            void updateOption(optionKey, e.target.checked)
          }}
        />
        <div
          className={cn(
            'peer relative h-5 w-9 rounded-full bg-gray-500',
            'peer-checked:bg-chzzk-green',
            'peer-focus:ring-1 peer-focus:ring-blue-300 peer-focus:outline-none',
            "after:absolute after:inset-s-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-['']",
            'peer-checked:after:border-buffer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full'
          )}
        />
      </label>
    </OptionRow>
  )
}
