import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HotkeysProvider } from '@tanstack/react-hotkeys'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HotkeysProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HotkeysProvider>
  </React.StrictMode>,
)
