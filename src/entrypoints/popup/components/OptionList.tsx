import type { BooleanOptionKey } from '@/storage/options'
import type { KeyBindingName } from '@/storage/keyBindings'
import { useOptions } from '@/hooks/useOptions'
import { ToggleOption } from './ToggleOption'
import { BitrateOption } from './BitrateOption'

type ToggleOptionConfig = {
  key: BooleanOptionKey
  label: string
  /** 지정하면 라벨 뒤에 현재 단축키를 표시합니다. */
  shortcut?: KeyBindingName
  description: string
}

const BASIC_OPTIONS: ToggleOptionConfig[] = [
  {
    key: 'rec',
    label: '녹화',
    shortcut: 'rec',
    description: '녹화 버튼을 추가합니다.\n(장시간 녹화는 권장하지 않아요.)',
  },
  {
    key: 'screenshot',
    label: '스크린샷',
    shortcut: 'screenshot',
    description: '스크린샷 버튼을 추가합니다.',
  },
  {
    key: 'seek',
    label: '탐색 (← / →)',
    description: '방송의 이전 / 다음 부분으로 이동합니다.\n(타임머신 기능과 충돌할 수 있어요.)',
  },
  {
    key: 'fastRec',
    label: '빠른 저장',
    description: '영상 녹화 완료 페이지 없이 즉시 녹화 파일을 저장합니다.',
  },
  {
    key: 'screenshotPreview',
    label: '스크린샷 미리보기',
    description:
      '스크린샷을 찍은 후 미리보기를 표시합니다.\n(미리보기를 사용하지 않으면 촬영한 스크린샷은 즉시 저장돼요.)',
  },
  {
    key: 'pip',
    label: 'PIP+',
    shortcut: 'pip',
    description: '기본 PIP 대신 다양한 추가 기능을 제공하는 PIP+를 사용합니다.',
  },
  {
    key: 'preferHQ',
    label: '자동 최대 해상도',
    description: '방송 해상도를 최고 품질로 자동으로 변경합니다.',
  },
  {
    key: 'favorites',
    label: '팔로우 즐겨찾기(베타)',
    description: '팔로우 중인 스트리머를 사이드바의 즐겨찾기 탭에 추가할 수 있습니다.',
  },
]

const ADVANCED_OPTIONS: ToggleOptionConfig[] = [
  {
    key: 'preferMP4',
    label: 'MP4 우선 저장',
    description: '영상 녹화 시 브라우저가 지원하는 경우 MP4(AAC)로 녹화합니다.',
  },
  {
    key: 'highFrameRateRec',
    label: '고프레임 녹화',
    description: '영상 녹화 시 최대 60fps로 녹화합니다.',
  },
]

function ToggleOptions({ configs }: { configs: ToggleOptionConfig[] }) {
  const { keyBindings } = useOptions()

  return configs.map(({ key, label, shortcut, description }) => (
    <ToggleOption
      key={key}
      optionKey={key}
      label={shortcut ? `${label} (${keyBindings[shortcut]})` : label}
      description={description}
    />
  ))
}

export function OptionList() {
  return (
    <main className="w-full flex-row items-center tracking-tight text-zinc-50">
      <div className="mt-3 grid gap-6 rounded-2xl border border-white/10 px-4 py-4">
        <ToggleOptions configs={BASIC_OPTIONS} />
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
          <ToggleOptions configs={ADVANCED_OPTIONS} />
          <BitrateOption
            label="녹화 비트레이트"
            description="녹화 비트레이트를 설정합니다.(0.001 ~ 25 Mbps)"
          />
        </div>
      </details>
    </main>
  )
}
