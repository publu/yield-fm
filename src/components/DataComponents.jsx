import React, { useState, useEffect, useRef, useMemo } from 'react'

export function makeSeries(seed, n = 60, base = 50, vol = 8) {
  let s = seed * 9301 + 49297
  const out = []
  let v = base
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    const r = (s / 233280) - 0.5
    v += r * vol + (base - v) * 0.04
    out.push(v)
  }
  return out
}

export function Sparkline({ data, color, height = 28, width = 120, fill = false, animate = true }) {
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2])
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = d + ` L${width},${height} L0,${height} Z`
  const len = useRef(0)
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path
        d={d} fill="none" stroke={color} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"
        ref={(el) => { if (el && animate) {
          const L = el.getTotalLength()
          if (len.current !== L) {
            len.current = L
            el.style.strokeDasharray = L
            el.style.strokeDashoffset = L
            el.getBoundingClientRect()
            el.style.transition = 'stroke-dashoffset 1.4s ease-out'
            el.style.strokeDashoffset = 0
          }
        }}}
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  )
}

export function Stat({ label, value, delta, color, sparkSeed = 1, onClick, hint }) {
  const data = useMemo(() => makeSeries(sparkSeed, 40, 60, 6), [sparkSeed])
  const clickable = typeof onClick === 'function'
  const handleKey = clickable
    ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) } }
    : undefined
  return (
    <div
      className={clickable ? 'col stat-clickable' : 'col'}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKey}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={clickable ? (hint || 'Click for methodology') : undefined}
      style={{
        gap: 6, minWidth: 0,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 160ms ease-out, opacity 160ms ease-out',
      }}
    >
      <div className="label" style={{
        fontSize: 9, letterSpacing: '0.2em',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>{label}</span>
        {clickable && (
          <span aria-hidden="true" style={{
            fontFamily: 'var(--mono)', fontSize: 9,
            color: color || 'var(--accent-a)',
            border: `1px solid ${color || 'var(--accent-a)'}`,
            padding: '0 4px', lineHeight: '12px', letterSpacing: '0.1em',
          }}>?</span>
        )}
      </div>
      <div className="row" style={{ alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span
          className="tnum"
          style={{
            fontFamily: 'var(--face-data)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1,
            textDecoration: clickable ? 'underline dotted' : 'none',
            textDecorationColor: clickable ? (color || 'var(--accent-a)') : 'transparent',
            textUnderlineOffset: 4,
          }}
        >{value}</span>
        {delta != null && (
          <span
            className="tnum"
            style={{
              fontFamily: 'var(--mono)', fontSize: 11,
              color: delta >= 0 ? 'var(--positive)' : 'var(--negative)',
              letterSpacing: '0.04em',
            }}
          >{delta >= 0 ? '+' : ''}{delta.toFixed(2)}%</span>
        )}
      </div>
      <Sparkline data={data} color={color || 'var(--accent-a)'} width={140} height={20} fill />
    </div>
  )
}

export function Ticker({ items }) {
  const list = [...items, ...items]
  return (
    <div style={{
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)',
      overflow: 'hidden',
      background: 'var(--bg-2)',
      padding: '10px 0',
    }}>
      <div className="ticker-track" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em' }}>
        {list.map((it, i) => (
          <span key={i} style={{ color: 'var(--sub)', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{it.symbol}</span>
            <span style={{ margin: '0 8px', color: 'var(--ghost)' }}>·</span>
            <span className="tnum">{it.value}</span>
            <span
              className="tnum"
              style={{ marginLeft: 8, color: it.delta >= 0 ? 'var(--positive)' : 'var(--negative)' }}
            >
              {it.delta >= 0 ? '▲' : '▼'} {Math.abs(it.delta).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function LiveCounter({ label, base = 12480000, rate = 0.42, prefix = '$', decimals = 0 }) {
  const [v, setV] = useState(base)
  useEffect(() => {
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const dt = (now - t0) / 1000
      setV(base + dt * rate)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [base, rate])
  return (
    <div className="col" style={{ gap: 4 }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div
        className="tnum"
        style={{
          fontFamily: 'var(--face-data)',
          fontSize: 28, fontWeight: 700,
          color: 'var(--accent-a)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {prefix}{v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      </div>
    </div>
  )
}

export function SectionHead({ num, kicker, title, sub }) {
  return (
    <div className="col" style={{ gap: 14, marginBottom: 32 }}>
      <div className="row" style={{ gap: 14, alignItems: 'center' }}>
        <span
          className="tnum"
          style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'var(--accent-a)', letterSpacing: '0.2em',
          }}
        >§ {num}</span>
        <span className="label">{kicker}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--face-display)',
          fontWeight: 'var(--weight-display)',
          fontSize: 'clamp(34px, 4.6vw, 64px)',
          letterSpacing: 'var(--tracking-display)',
          lineHeight: 1.02,
          color: 'var(--text)',
          textWrap: 'pretty',
        }}
      >{title}</h2>
      {sub && (
        <p
          style={{
            margin: 0, maxWidth: 720,
            fontFamily: 'var(--face-body)', fontSize: 14,
            color: 'var(--sub)', lineHeight: 1.7,
          }}
        >{sub}</p>
      )}
    </div>
  )
}

export function PulseDot({ color = 'var(--accent-a)', size = 8 }) {
  return (
    <span
      className="pulse"
      style={{
        width: size, height: size, borderRadius: 999,
        background: color, display: 'inline-block', boxShadow: `0 0 12px ${color}`,
      }}
    />
  )
}
