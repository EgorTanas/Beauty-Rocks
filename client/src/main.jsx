import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './style/home.css'
import './style/sections.css'
import './style/responsive.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
