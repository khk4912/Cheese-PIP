import './App.css'
import '@/assets/tailwind.css'

import { useState } from 'react'
import type { CheesePIPOptions } from '@/utils/options'
import { useOptions } from '@/hooks/useOptions'

type BooleanOptionKey = Exclude<keyof CheesePIPOptions, 'videoBitsPerSecond'>

type BooleanOptionConfig = {
  optionKey: BooleanOptionKey
  label: string
  description?: string
}

const PRIMARY_OPTIONS: BooleanOptionConfig[] = [
  {
    optionKey: 'rec',
    label: '녹화 (R)',
    description: '녹화 버튼을 추가합니다.\n(장시간 녹화는 권장하지 않아요.)'
  },
  {
    optionKey: 'screenshot',
    label: '스크린샷 (S)',
    description: '스크린샷 버튼을 추가합니다.'
  },
  {
    optionKey: 'seek',
    label: '탐색 (← / →)',
    description: '방송의 이전 / 다음 부분으로 이동합니다.\n(타임머신 기능과 충돌이 발생할 수 있어요.)'
  },
  {
    optionKey: 'fastRec',
    label: '빠른 저장',
    description: '영상 녹화 완료 페이지 없이 즉시 녹화 파일을 저장합니다.'
  },
  {
    optionKey: 'screenshotPreview',
    label: '스크린샷 미리보기',
    description: '스크린샷을 찍은 후 미리보기를 표시합니다.\n(미리보기를 사용하지 않으면 촬영한 스크린샷은 즉시 저장돼요.)'
  },
  {
    optionKey: 'pip',
    label: 'PIP+ (P)',
    description: '기본 PIP 대신 다양한 추가 기능을 제공하는 PIP+를 사용합니다.'
  },
  {
    optionKey: 'preferHQ',
    label: '자동 최대 해상도',
    description: '방송 해상도를 최고 품질로 자동으로 변경합니다.'
  },
  {
    optionKey: 'favorites',
    label: '팔로우 즐겨찾기(베타)',
    description: '팔로우 중인 스트리머를 사이드바의 즐겨찾기 탭에 추가할 수 있습니다.'
  },
]

const ADVANCED_OPTIONS: BooleanOptionConfig[] = [
  {
    optionKey: 'preferMP4',
    label: 'MP4 우선 저장',
    description: '영상 녹화 시 브라우저가 지원하는 경우 MP4(AAC)로 녹화합니다.'
  },
  {
    optionKey: 'highFrameRateRec',
    label: '고프레임 녹화',
    description: '영상 녹화 시 최대 60fps로 녹화합니다.'
  }
]

type ToggleProps = {
  optionKey: BooleanOptionKey
  label: string
  description?: string
}
function Option ({ optionKey, label, description }: ToggleProps) {
  const { options, updateOption } = useOptions()

  const isChecked = options[optionKey]

  return (
    <div className='flex items-center gap-4 overflow-hidden'>
      <div className='min-w-0'>
        <p className='text-base font-semibold text-white'>{label}</p>
        {description && <p className='whitespace-pre-line text-[0.7rem] pr-2 text-zinc-200 break-keep'>{description}</p>}
      </div>
      <label className='inline-flex items-center justify-end flex-1 cursor-pointer'>
        <input
          type='checkbox' value={`${label} toggle`}
          className='sr-only peer'
          checked={isChecked}
          onChange={(e) => { void updateOption(optionKey, e.target.checked) }}
        />
        <div className="relative w-9 h-5 bg-gray-500
                      peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-blue-300
                      rounded-full peer
                      peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                      peer-checked:after:border-buffer after:content-['']
                      after:absolute after:top-0.5 after:inset-s-0.5
                     after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                     peer-checked:bg-chzzk-green"
        />
      </label>
    </div>
  )
}

type NumberOptionProps = {
  label: string
  description?: string
}
function NumberOption ({ label, description }: NumberOptionProps) {
  const { options, updateOption } = useOptions()
  const [draftValue, setDraftValue] = useState<string | null>(null)

  const inputValue = draftValue ?? String(options.videoBitsPerSecond)
  const commitValue = async (): Promise<void> => {
    const parsedValue = Number(inputValue)

    if (!Number.isFinite(parsedValue) || parsedValue < 1000 || parsedValue > 25000000) {
      setDraftValue(null)
      return
    }

    const normalizedValue = Math.round(parsedValue)
    setDraftValue(null)

    if (normalizedValue !== options.videoBitsPerSecond) {
      await updateOption('videoBitsPerSecond', normalizedValue)
    }
  }

  return (
    <div className='flex items-start gap-4 overflow-hidden'>
      <div className='min-w-0 flex-1'>
        <p className='text-base font-semibold text-white'>{label}</p>
        {description && <p className='whitespace-pre-line text-[0.7rem] pr-2 text-zinc-200 break-keep'>{description}</p>}
      </div>
      <input
        type='number'
        min={1000}
        max={25000000}
        inputMode='numeric'
        className='number-input w-20 rounded-xl self-center
                     border border-white/10 bg-white/5
                     py-1 text-center text-sm text-[0.8rem] text-white
                    outline-none transition-colors focus:border-chzzk-green'
        value={inputValue}
        onChange={(e) => { setDraftValue(e.target.value) }}
        onBlur={() => { void commitValue() }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
        }}
      />
    </div>
  )
}

function Header () {
  return (
    <header>
      <div className='flex items-center w-full gap-4 px-5 py-4 my-5 border rounded-2xl border-white/10 bg-white/5'>
        <img
          src={browser.runtime.getURL('/icons/128.png')}
          alt='Cheese-PIP extension logo'
          className='object-contain w-12 h-12 shrink-0'
        />
        <div className='min-w-0'>
          <h1 className='text-lg font-bold tracking-tight text-white'>Cheese-PIP</h1>
          <span className='text-xs text-zinc-500'>v{__APP_VERSION__} </span>
        </div>
      </div>
    </header>
  )
}

function Main () {
  return (
    <main className='flex-row items-center w-full text-zinc-50'>
      <div className='grid gap-6 px-4 py-4 mt-3 border border-white/10 rounded-2xl'>
        {PRIMARY_OPTIONS.map((option) => (
          <Option
            key={option.optionKey}
            optionKey={option.optionKey}
            label={option.label}
            description={option.description}
          />
        ))}
      </div>

      <details className='advanced-options mt-3 overflow-hidden rounded-2xl border border-white/10'>
        <summary className='cursor-pointer px-4 py-4'>
          <div className='flex items-start justify-between gap-4'>
            <p className='text-base font-semibold text-white'>고급 옵션</p>
            <span className='advanced-options-chevron mt-1 shrink-0 text-xs text-zinc-400 transition-transform'>▼</span>
          </div>
          <p className='mt-2 whitespace-pre-line text-[0.7rem] text-zinc-300 break-keep'>
            고급 옵션은 확장 프로그램의 작동 방식을 크게 변경하고, 이로 인해 문제가 발생할 수 있습니다.{'\n'}
            옵션을 변경한 후 정상적으로 작동하는지 확인해주세요.
          </p>
        </summary>

        <div className='grid gap-6 border-t border-white/10 px-4 py-4'>
          {ADVANCED_OPTIONS.map((option) => (
            <Option
              key={option.optionKey}
              optionKey={option.optionKey}
              label={option.label}
              description={option.description}
            />
          ))}
          <NumberOption
            label='녹화 비트레이트'
            description={'녹화 비트레이트를 설정합니다.\n단위는 bps(초당 비트)입니다.\n(범위: 1000 ~ 25000000)'}
          />
        </div>
      </details>
    </main>
  )
}

function Footer () {
  return (
    <footer className='pb-5 mx-3 mt-3 text-xs text-zinc-400'>
      <div className='mx-auto mb-3 gap-3 flex items-center justify-center'>
        <button
          className='rounded-2xl border border-white/10 bg-white/5
                   py-2 px-4 hover:cursor-pointer hover:bg-white/10 transition-colors'
          onClick={() => {
            void storage.clear('local')
          }}
        >
          설정 초기화
        </button>

      </div>
      <p>
        Made with ❤️ by
        <a href='https://github.com/khk4912' target='_blank' rel='noopener noreferrer' className='text-blue-400 hover:underline'>
          <span> kosame</span>
        </a>
        <span> |  </span>
        <a href='https://github.com/khk4912/Cheese-PIP' target='_blank' rel='noopener noreferrer' className='text-blue-400 hover:underline'>
          <span>GitHub</span>
        </a>
      </p>
      <p className='text-[10px] text-zinc-600 break-keep mt-2'>
        Cheese-PIP는 치지직(chzzk)과 관련이 없는 개인 프로젝트입니다.
        치지직(chzzk)은 네이버 주식회사의 상표입니다.
      </p>
    </footer>
  )
}

function App () {
  return (
    <div className='px-6'>
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

export default App
