import React, { useEffect, useState } from 'react'
import { TopNav } from './components/AppShell'
import { Hero } from './components/SectionHero'
import { Primer, FiveStreams, Flow, CatalogIndex, Footer } from './components/SectionBody'

export default function App() {
  const [mode, setMode] = useState('edm')
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={booted ? '' : 'crt-screen'}>
      <div className="grain" />
      <TopNav mode={mode} onMode={setMode} />
      <Hero mode={mode} intensity={1.0} />
      <Primer />
      <FiveStreams />
      <Flow />
      <CatalogIndex />
      <Footer />
    </div>
  )
}
