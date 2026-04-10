type CheeseButtonBaseProps = {
  title: string
  iconSVG: React.ReactNode
  className?: string
  onClick?: () => void
}
export function CheeseButtonBase ({ title, iconSVG, className, onClick }: CheeseButtonBaseProps) {
  return (
    <button className={`pzp-pc__setting-button pzp-button pzp-pc-ui-button ${className || ''}`} onClick={onClick}>
      <span className='pzp-button__tooltip pzp-button__tooltip--top'>{title}</span>
      <span className='pzp-ui-icon'>
        {iconSVG}
      </span>
    </button>
  )
}
