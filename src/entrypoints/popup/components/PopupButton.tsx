import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function PopupButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:cursor-pointer hover:bg-white/10',
        className
      )}
      {...props}
    />
  )
}
