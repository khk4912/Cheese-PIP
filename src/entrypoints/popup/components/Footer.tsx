import { ShortcutSetting } from '../ShortcutDialog'
import { PopupButton } from './PopupButton'

export function Footer() {
  return (
    <footer className="mx-3 mt-3 pb-5 text-xs text-zinc-400">
      <div className="mx-auto mb-3 flex items-center justify-center gap-3">
        <ShortcutSetting />
        <PopupButton
          onClick={() => {
            void storage.clear('local')
          }}
        >
          설정 초기화
        </PopupButton>
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
