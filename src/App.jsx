import React, { useEffect, useState } from 'react'
import { TopNav } from './components/AppShell'
import { Hero } from './components/SectionHero'
import { Primer, FiveStreams, Flow, CatalogIndex, Footer } from './components/SectionBody'

export default function App() {
  const [mode, setMode] = useState('edm')

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
      <Flow />
      <CatalogIndex />
      <Footer />
    </div>
  )
}
