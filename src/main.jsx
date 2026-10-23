import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

const root = document.documentElement
root.classList.add('js')
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  root.classList.add('motion')
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
