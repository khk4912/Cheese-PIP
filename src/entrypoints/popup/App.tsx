import './App.css'
import '@/assets/tailwind.css'

import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { CheesePIPOptions } from '@/utils/options'
import { useOptions } from '@/hooks/useOptions'

type BooleanOptionKey = Exclude<keyof CheesePIPOptions, 'videoBitsPerSecond'>
type ToggleProps = {
  optionKey: BooleanOptionKey
  label: string
  description?: string
}
function Option({ optionKey, label, description }: ToggleProps) {
  const { options, updateOption } = useOptions()

  const isChecked = options[optionKey]

  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <div className="min-w-0">
        <p className="text-base font-semibold text-white">{label}</p>
        {description && (
          <p className="pr-2 text-[0.7rem] break-keep whitespace-pre-line text-zinc-200">
            {description}
          </p>
        )}
      </div>
      <label
        aria-label={`${label} 토글`}
        className="inline-flex flex-1 cursor-pointer items-center justify-end"
      >
        <input
          type="checkbox"
          value={`${label} 토글`}
          className="peer sr-only"
          checked={isChecked}
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
    </div>
  )
}

type NumberOptionProps = {
  label: string
  description?: string
}
const BITS_PER_MEGABIT = 1_000_000
const MIN_BITRATE_MBPS = 0.001
const MAX_BITRATE_MBPS = 25
const BITRATE_STEP_MBPS = 0.1

function NumberOption({ label, description }: NumberOptionProps) {
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
    <div className="flex items-start gap-4 overflow-hidden">
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-white">{label}</p>
        {description && (
          <p className="pr-2 text-[0.7rem] break-keep whitespace-pre-line text-zinc-200">
            {description}
          </p>
        )}
      </div>
      <div
        className="flex shrink-0 items-center gap-1 self-center rounded-lg border border-white/10 bg-white/5 pr-1 pl-1 transition-colors focus-within:border-chzzk-green"
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
    </div>
  )
}

function Header() {
  return (
    <header className="flex items-center gap-3 pt-6 pb-3">
      <img
        src={browser.runtime.getURL('/icons/128.png')}
        alt="Cheese-PIP extension logo"
        className="h-12 w-12 shrink-0 object-contain"
      />
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-white">Cheese PIP</h1>
        <span className="text-xs text-zinc-500">v{__APP_VERSION__}</span>
      </div>
    </header>
  )
}

function Main() {
  const { keyBindings } = useOptions()

  return (
    <main className="w-full flex-row items-center tracking-tight text-zinc-50">
      <div className="mt-3 grid gap-6 rounded-2xl border border-white/10 px-4 py-4">
        <Option
          optionKey="rec"
          label={`녹화 (${keyBindings.rec})`}
          description={'녹화 버튼을 추가합니다.\n(장시간 녹화는 권장하지 않아요.)'}
        />
        <Option
          optionKey="screenshot"
          label={`스크린샷 (${keyBindings.screenshot})`}
          description="스크린샷 버튼을 추가합니다."
        />
        <Option
          optionKey="seek"
          label="탐색 (← / →)"
          description={
            '방송의 이전 / 다음 부분으로 이동합니다.\n(타임머신 기능과 충돌할 수 있어요.)'
          }
        />
        <Option
          optionKey="fastRec"
          label="빠른 저장"
          description="영상 녹화 완료 페이지 없이 즉시 녹화 파일을 저장합니다."
        />
        <Option
          optionKey="screenshotPreview"
          label="스크린샷 미리보기"
          description={
            '스크린샷을 찍은 후 미리보기를 표시합니다.\n(미리보기를 사용하지 않으면 촬영한 스크린샷은 즉시 저장돼요.)'
          }
        />
        <Option
          optionKey="pip"
          label={`PIP+ (${keyBindings.pip})`}
          description="기본 PIP 대신 다양한 추가 기능을 제공하는 PIP+를 사용합니다."
        />
        <Option
          optionKey="preferHQ"
          label="자동 최대 해상도"
          description="방송 해상도를 최고 품질로 자동으로 변경합니다."
        />
        <Option
          optionKey="favorites"
          label="팔로우 즐겨찾기(베타)"
          description="팔로우 중인 스트리머를 사이드바의 즐겨찾기 탭에 추가할 수 있습니다."
        />
      </div>

      <details className="advanced-options mt-3 overflow-hidden rounded-2xl border border-white/10">
        <summary className="cursor-pointer px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-base font-semibold text-white">고급 옵션</p>
            <span className="advanced-options-chevron mt-1 shrink-0 text-xs text-zinc-400 transition-transform">
              ▼
            </span>
          </div>
          <p className="mt-2 text-[0.7rem] break-keep whitespace-pre-line text-zinc-300">
            고급 옵션은 확장 프로그램의 작동 방식을 크게 변경하고, 이로 인해 문제가 발생할 수
            있습니다.{'\n'}
            옵션을 변경한 후 정상적으로 작동하는지 확인해주세요.
          </p>
        </summary>

        <div className="grid gap-6 border-t border-white/10 px-4 py-4">
          <Option
            optionKey="preferMP4"
            label="MP4 우선 저장"
            description="영상 녹화 시 브라우저가 지원하는 경우 MP4(AAC)로 녹화합니다."
          />
          <Option
            optionKey="highFrameRateRec"
            label="고프레임 녹화"
            description="영상 녹화 시 최대 60fps로 녹화합니다."
          />

          <NumberOption
            label="녹화 비트레이트"
            description={'녹화 비트레이트를 설정합니다.(0.001 ~ 25 Mbps)'}
          />
        </div>
      </details>
    </main>
  )
}

function Footer() {
  return (
    <footer className="mx-3 mt-3 pb-5 text-xs text-zinc-400">
      <div className="mx-auto mb-3 flex items-center justify-center gap-3">
        <button
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:cursor-pointer hover:bg-white/10"
          onClick={() => {
            void storage.clear('local')
          }}
        >
          설정 초기화
        </button>
      </div>
      <p>
        Made with ❤️ by
        <a
          href="https://github.com/khk4912"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          <span> kosame</span>
        </a>
        <span> | </span>
        <a
          href="https://github.com/khk4912/Cheese-PIP"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          <span>GitHub</span>
        </a>
      </p>
      <p className="mt-2 text-[10px] break-keep whitespace-pre text-zinc-600">
        Cheese-PIP는 치지직(chzzk)과 관련이 없는 개인 프로젝트입니다.{'\n'}
        치지직(chzzk)은 네이버 주식회사의 상표입니다.
      </p>
    </footer>
  )
}

function App() {
  const { isLoading, isReady, isSaving, error } = useOptions()

  return (
    <div className="px-6">
      <Header />
      {isLoading && <output>설정을 불러오는 중이에요.</output>}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <fieldset disabled={!isReady || isSaving} className="min-w-0 border-0 p-0">
        <Main />
        <Footer />
      </fieldset>
    </div>
  )
}

export default App
