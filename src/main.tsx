import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { initializeSparkMock } from './utils/sparkMock'

import "./main.css"
import "./index.css"

// Initialize Spark mock for standalone deployment
initializeSparkMock()

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(<App />)
