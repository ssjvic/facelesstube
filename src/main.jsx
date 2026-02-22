// UNIQUE_MARKER_999
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// ============ FIREBASE CONFIG (Auto-initialize OAuth) ============
import { initializeConfig } from './config/firebaseConfig'
try {
    initializeConfig() // Pre-configure Web Client ID
} catch (e) {
    console.warn('Config init failed:', e)
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
)
