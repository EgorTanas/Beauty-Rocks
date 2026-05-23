import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './style/Home.css'
import './style/sections.css'
import './style/responsive.css'
import './style/hero-fixes.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
