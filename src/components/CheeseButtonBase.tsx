import { cn } from '@/utils/cn'

type CheeseButtonBaseProps = {
  title: string
  iconSVG: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}
export function CheeseButtonBase({
  title,
  iconSVG,
  className,
  onClick,
  disabled,
}: CheeseButtonBaseProps) {
  return (
    <button
      type="button"
      aria-label={title}
      disabled={disabled}
      className={cn(
        'pzp-pc__setting-button pzp-button pzp-pc-ui-button',
        disabled && 'cursor-not-allowed opacity-40',
        className
      )}
      onClick={onClick}
    >
      <span className="pzp-button__tooltip pzp-button__tooltip--top">{title}</span>
      <span className="pzp-ui-icon">{iconSVG}</span>
    </button>
  )
}
