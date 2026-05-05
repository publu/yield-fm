import React, { useEffect, useState } from 'react'
import { TopNav } from './components/AppShell'
import { Hero } from './components/SectionHero'
import { Primer, FiveStreams, YieldMethodology, CatalogIndex, Footer } from './components/SectionBody'

const DVD_COLORS = [
  '#00d4a8',
  '#9b59d8',
  '#f5a623',
  '#ff4f7a',
  '#5fb3ff',
]

function useBouncingFavicon() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return undefined

    const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
    const originalHref = link.getAttribute('href')
    link.setAttribute('rel', 'icon')
    if (!link.parentNode) document.head.appendChild(link)

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let frame = 0
    let lastDraw = 0
    let colorIndex = 0
    const pos = { x: 5, y: 22 }
    const velocity = { x: 0.78, y: 0.55 }

    const draw = () => {
      ctx.clearRect(0, 0, 32, 32)
      ctx.fillStyle = '#080810'
      ctx.beginPath()
      ctx.roundRect(0, 0, 32, 32, 5)
      ctx.fill()

      ctx.shadowColor = DVD_COLORS[colorIndex]
      ctx.shadowBlur = 7
      ctx.fillStyle = DVD_COLORS[colorIndex]
      ctx.font = '700 22px monospace'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText('♪', pos.x, pos.y)
      ctx.shadowBlur = 0

      link.href = canvas.toDataURL('image/png')
    }

    const tick = (now) => {
      if (now - lastDraw > 80) {
        lastDraw = now
        pos.x += velocity.x
        pos.y += velocity.y

        let bounced = false
        if (pos.x <= 3 || pos.x >= 15) {
          pos.x = Math.min(Math.max(pos.x, 3), 15)
          velocity.x *= -1
          bounced = true
        }
        if (pos.y <= 18 || pos.y >= 28) {
          pos.y = Math.min(Math.max(pos.y, 18), 28)
          velocity.y *= -1
          bounced = true
        }
        if (bounced) colorIndex = (colorIndex + 1) % DVD_COLORS.length
        draw()
      }
      frame = requestAnimationFrame(tick)
    }

    draw()
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      if (originalHref) link.href = originalHref
    }
  }, [])
}

export default function App() {
  const [mode, setMode] = useState('edm')
  useBouncingFavicon()

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  return (
    <div>
      <div className="grain" />
      <TopNav mode={mode} onMode={setMode} />
      <Hero mode={mode} intensity={1.0} />
      <Primer />
      <FiveStreams />
      <YieldMethodology />
      <CatalogIndex />
      <Footer />
    </div>
  )
}
