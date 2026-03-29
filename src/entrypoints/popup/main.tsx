import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import './style.css'

import { OptionProvider } from '@/providers/OptionProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionProvider>
      <App />
    </OptionProvider>
  </React.StrictMode>
)
