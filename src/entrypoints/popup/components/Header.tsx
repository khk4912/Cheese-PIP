export function Header() {
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
