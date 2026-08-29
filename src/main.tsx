import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- THIS IS THE CRUCIAL LINE
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)