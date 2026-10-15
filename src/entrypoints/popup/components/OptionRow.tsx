type OptionRowProps = {
  label: string
  description?: string
  children: React.ReactNode
}

export function OptionRow({ label, description, children }: OptionRowProps) {
  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-white">{label}</p>
        {description && (
          <p className="pr-2 text-[0.7rem] break-keep whitespace-pre-line text-zinc-200">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
