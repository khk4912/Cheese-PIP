import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useOptions } from '@/hooks/useOptions'
import { OptionRow } from './OptionRow'

type BitrateOptionProps = {
  label: string
  description?: string
}
const BITS_PER_MEGABIT = 1_000_000
const MIN_BITRATE_MBPS = 0.001
const MAX_BITRATE_MBPS = 25
const BITRATE_STEP_MBPS = 0.1

export function BitrateOption({ label, description }: BitrateOptionProps) {
  const { options, updateOption } = useOptions()
  const [draftValue, setDraftValue] = useState<string | null>(null)

  const inputValue = draftValue ?? String(options.videoBitsPerSecond / BITS_PER_MEGABIT)
  const commitValue = async (value = inputValue): Promise<void> => {
    const parsedValue = Number(value)

    if (
      !Number.isFinite(parsedValue) ||
      parsedValue < MIN_BITRATE_MBPS ||
      parsedValue > MAX_BITRATE_MBPS
    ) {
      setDraftValue(null)
      return
    }

    const normalizedValue = Math.round(parsedValue * BITS_PER_MEGABIT)
    setDraftValue(null)

    if (normalizedValue !== options.videoBitsPerSecond) {
      await updateOption('videoBitsPerSecond', normalizedValue)
    }
  }

  const adjustValue = (direction: 1 | -1) => {
    const parsedValue = Number(inputValue)
    const currentValue =
      inputValue.trim() !== '' && Number.isFinite(parsedValue)
        ? parsedValue
        : options.videoBitsPerSecond / BITS_PER_MEGABIT
    const nextValue = Math.min(
      MAX_BITRATE_MBPS,
      Math.max(
        MIN_BITRATE_MBPS,
        Math.round((currentValue + direction * BITRATE_STEP_MBPS) * BITS_PER_MEGABIT) /
          BITS_PER_MEGABIT
      )
    )
    void commitValue(String(nextValue))
  }

  return (
    <OptionRow label={label} description={description}>
      <div
        className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 pr-1 pl-1 transition-colors focus-within:border-chzzk-green"
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            void commitValue()
          }
        }}
      >
        <input
          type="number"
          min={MIN_BITRATE_MBPS}
          max={MAX_BITRATE_MBPS}
          step="any"
          inputMode="decimal"
          aria-label={`${label} (Mbps)`}
          className={cn(
            'number-input w-9 min-w-0 bg-transparent py-1',
            'text-center text-[0.8rem] leading-[var(--text-sm--line-height)] text-white',
            'outline-none'
          )}
          value={inputValue}
          onChange={e => {
            setDraftValue(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault()
              adjustValue(e.key === 'ArrowUp' ? 1 : -1)
            }
          }}
        />
        <span aria-hidden="true" className="pointer-events-none text-[0.65rem] text-zinc-400">
          Mbps
        </span>
        <div className="flex flex-col">
          {([1, -1] as const).map(direction => (
            <button
              key={direction}
              type="button"
              aria-label={`비트레이트 ${BITRATE_STEP_MBPS} Mbps ${direction === 1 ? '증가' : '감소'}`}
              disabled={
                direction === 1
                  ? Number(inputValue) >= MAX_BITRATE_MBPS
                  : Number(inputValue) <= MIN_BITRATE_MBPS
              }
              className="flex h-4 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-chzzk-green disabled:opacity-30"
              onClick={() => adjustValue(direction)}
            >
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={direction === 1 ? 'M3 7.5 6 4.5 9 7.5' : 'M3 4.5 6 7.5 9 4.5'} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </OptionRow>
  )
}
