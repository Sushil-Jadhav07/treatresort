import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTracking } from './lib/analytics'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build ships pre-rendered HTML inside #root: hydrate it. In dev it is empty: render.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)

initTracking()
