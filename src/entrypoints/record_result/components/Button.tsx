import style from './Button.module.css'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: (e?: unknown) => void
}

export function ButtonBase (props: ButtonProps): React.ReactNode {
  return (
    <button
      className={style.primaryButton}
      onClick={(e) => {
        if (props.onClick !== undefined) {
          e.stopPropagation()
          props.onClick(e)
        }
      }}
    >{props.children}
    </button>
  )
}
