import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import spaceMono400 from './assets/fonts/space-mono-400.ttf?url'
import spaceMono700 from './assets/fonts/space-mono-700.ttf?url'

async function loadFont(family, source, weight) {
  if (!('FontFace' in window)) return

  const response = await fetch(source)
  const buffer = await response.arrayBuffer()
  const face = new FontFace(family, buffer, { weight })
  await face.load()
  document.fonts.add(face)
}

async function boot() {
  try {
    await Promise.all([
      loadFont('SpaceMono', spaceMono400, '400'),
      loadFont('SpaceMono', spaceMono700, '700'),
    ])
  } catch {
    // Render anyway if a browser blocks custom font loading.
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

boot()
