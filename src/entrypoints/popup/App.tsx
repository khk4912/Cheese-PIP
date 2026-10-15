import './App.css'
import '@/assets/tailwind.css'

import { useOptions } from '@/hooks/useOptions'
import { Header } from './components/Header'
import { OptionList } from './components/OptionList'
import { Footer } from './components/Footer'

function App() {
  const { isLoading, isReady, isSaving, error } = useOptions()

  return (
    <div className="px-6">
      <Header />
      {isLoading && <output>설정을 불러오는 중이에요.</output>}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <fieldset disabled={!isReady || isSaving} className="min-w-0 border-0 p-0">
        <OptionList />
        <Footer />
      </fieldset>
    </div>
  )
}

export default App
