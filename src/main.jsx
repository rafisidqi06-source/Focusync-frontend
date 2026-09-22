import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppStateProvider } from './state/store.jsx'
import DevicePreview from './components/DevicePreview.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AppStateProvider>
        <DevicePreview>
          <App />
        </DevicePreview>
      </AppStateProvider>
    </HashRouter>
  </React.StrictMode>,
)
