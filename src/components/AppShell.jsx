import React from 'react'

export function Crosshair({ pos = 'tl', color = 'var(--accent-a)' }) {
  const map = {
    tl: { top: 14, left: 14 }, tr: { top: 14, right: 14 },
    bl: { bottom: 14, left: 14 }, br: { bottom: 14, right: 14 },
  }
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', ...map[pos], width: 12, height: 12,
      color, pointerEvents: 'none', opacity: 0.7, zIndex: 2,
    }}>
      <div style={{ position: 'absolute', left: 0, top: 5.5, width: 12, height: 1, background: 'currentColor' }} />
      <div style={{ position: 'absolute', top: 0, left: 5.5, width: 1, height: 12, background: 'currentColor' }} />
    </div>
  )
}

export function Logo() {
  return (
    <span className="yield-fm-logo" style={{
      fontFamily: 'var(--face-display)',
      fontWeight: 'var(--weight-display)',
      fontSize: 22, letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
    }}>
      <span style={{
        background: 'linear-gradient(96deg, var(--accent-a), var(--accent-b))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>yield</span>.fm
    </span>
  )
}

export function TopNav({ mode, onMode }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="nav-grid" style={{
        maxWidth: 1480, margin: '0 auto', padding: '14px 28px',
        display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="row" style={{ alignItems: 'center', gap: 14 }}>
          <Logo />
          <span className="nav-tagline" style={{
            paddingLeft: 12, borderLeft: '1px solid var(--line)',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--dim)',
            textTransform: 'uppercase',
          }}>ROYALTY INVESTING TERMINAL</span>
        </div>

        <nav className="nav-modes row" style={{
          gap: 0, border: '1px solid var(--line)',
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', fontWeight: 700,
        }}>
          {['EDM', 'CLASSICAL', 'HIP-HOP'].map((m, i) => {
            const v = m === 'HIP-HOP' ? 'hiphop' : m.toLowerCase()
            const on = mode === v
            return (
              <button key={v} onClick={() => onMode(v)} style={{
                padding: '8px 16px',
                background: on ? 'var(--accent-a)' : 'transparent',
                color: on ? 'var(--bg)' : 'var(--sub)',
                border: 'none',
                borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
                letterSpacing: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
              }}>{m}</button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
