import { useState } from 'react'
import style from './Collapsable.module.css'

/**
 * Collapsable component
 *
 * Popup 페이지에서 고급 옵션에 사용되는 컴포넌트입니다.
 */
export function Collapsable ({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false)

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((x) => !x)
    }
  }

  return (
    <div
      className={style.collapsable}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={style.title} onClick={() => { setIsOpen((x) => !x) }}>
        <div
          className={style.arrow}
          style={{
            color: isOpen ? 'gray' : undefined
          }}
        >
          {isOpen ? '▼' : '▶'}
          <span id={style.title}>
            {title}
          </span>
        </div>
        {!isOpen && <span id={style.desc}>{desc}</span>}
      </div>
      <div className={style.content}>
        {isOpen && children}
      </div>
    </div>
  )
}
