import React, { useEffect, useState } from 'react'
import { YieldSurface } from './YieldSurface'
import { Crosshair } from './AppShell'
import { LiveCounter, Stat, PulseDot } from './DataComponents'
import catalogData from '../data/catalogs.json'

function tsNow() {
  const d = new Date()
  const f = (n) => String(n).padStart(2, '0')
  return `${f(d.getHours())}:${f(d.getMinutes())}:${f(d.getSeconds())}`
}
function tsAgo(s) {
  const d = new Date(Date.now() - s * 1000)
  const f = (n) => String(n).padStart(2, '0')
  return `${f(d.getHours())}:${f(d.getMinutes())}:${f(d.getSeconds())}`
}
function pickCents(right) {
  const ranges = {
    COMP: [0.0008, 0.012], MAST: [0.003, 0.45], MECH: [0.0005, 0.008],
    PERF: [0.04, 0.32], SYNC: [120, 950],
  }
  const [a, b] = ranges[right] || [0.001, 0.1]
  const v = a + Math.random() * (b - a)
  return v < 1 ? v.toFixed(4) : v.toFixed(0)
}

const RIGHT_COLORS = {
  COMP: 'var(--accent-a)', MAST: 'var(--accent-b)',
  PERF: 'var(--accent-c)', MECH: 'var(--accent-d)',
  SYNC: 'var(--accent-c)',
}

const RIGHT_TYPES = ['COMP', 'MAST', 'MECH', 'PERF', 'SYNC']

function classifyRight(sound, i) {
  if (sound.label) {
    if (i % 3 === 0) return 'MAST'
    if (i % 5 === 0) return 'SYNC'
  }
  return RIGHT_TYPES[i % RIGHT_TYPES.length]
}

function viaFor(right, sound) {
  if (right === 'MAST') return sound.label?.split(/[,/]/)[0]?.trim().slice(0, 14) || 'Distro'
  if (right === 'PERF') return ['BMI', 'ASCAP', 'PRS', 'SESAC'][Math.floor(Math.random() * 4)]
  if (right === 'COMP') return ['ASCAP', 'BMI', 'SESAC', 'GMR'][Math.floor(Math.random() * 4)]
  if (right === 'MECH') return 'MLC'
  if (right === 'SYNC') return 'Direct'
  return 'PRO'
}

function buildPlay(sound, i) {
  const right = classifyRight(sound, i)
  return {
    right,
    title: sound.title || 'Unknown',
    artist: sound.artist || '',
    via: viaFor(right, sound),
  }
}

const FALLBACK_PLAYS = [
  { right: 'COMP', title: 'I M The Man',      artist: 'Travis Scott',  via: 'BMI' },
  { right: 'MAST', title: 'Brand New',        artist: 'Ben Rector',    via: 'Downtown' },
  { right: 'MECH', title: 'Super Model',      artist: 'SZA',           via: 'MLC' },
  { right: 'PERF', title: 'She Got The Best Of Me', artist: 'Luke Combs', via: 'ASCAP' },
  { right: 'SYNC', title: 'Under The Influence',    artist: 'Chris Brown', via: 'Direct' },
]

function HeroFeed() {
  const [pool, setPool] = useState(FALLBACK_PLAYS)
  const [feed, setFeed] = useState(() => FALLBACK_PLAYS.slice(0, 8).map((p, i) => ({
    ...p, ts: tsAgo(i * 1.4), cents: pickCents(p.right),
  })))

  useEffect(() => {
    let cancelled = false
    fetch('https://tiktok.highscore.page/api/indexer/pages/foryou?limit=80')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.sounds?.length) return
        const built = data.sounds.map((s, i) => buildPlay(s, i))
        setPool(built)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setFeed((f) => {
        const sample = pool[Math.floor(Math.random() * pool.length)]
        return [{ ...sample, ts: tsNow(), cents: pickCents(sample.right) }, ...f].slice(0, 8)
      })
    }, 1200)
    return () => clearInterval(id)
  }, [pool])

  return (
    <div style={{
      background: 'color-mix(in oklab, var(--bg-2) 88%, transparent)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', gap: 10, alignItems: 'center' }}>
        <PulseDot color="var(--accent-a)" size={6} />
        <span className="label" style={{ color: 'var(--text)' }}>LIVE · ROYALTY EVENTS</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--dim)', fontSize: 9, letterSpacing: '0.2em' }}>$/EVENT</span>
      </div>

      <div className="col">
        {feed.map((row, i) => (
          <div key={`${row.ts}-${i}`} className="row hero-feed-row" style={{
            padding: '8px 14px', gap: 10, alignItems: 'center',
            borderBottom: i < feed.length - 1 ? '1px solid var(--line-soft)' : 'none',
            opacity: 1 - i * 0.06,
          }}>
            <span className="tnum hero-feed-ts" style={{ color: 'var(--dim)', fontSize: 10, width: 64 }}>{row.ts}</span>
            <span style={{
              fontSize: 9, padding: '2px 6px', letterSpacing: '0.1em', fontWeight: 700,
              background: `color-mix(in oklab, ${RIGHT_COLORS[row.right]} 22%, transparent)`,
              color: RIGHT_COLORS[row.right],
              border: `1px solid ${RIGHT_COLORS[row.right]}`,
              minWidth: 44, textAlign: 'center',
            }}>{row.right}</span>
            <span style={{ color: 'var(--text)', flex: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {row.title}
              {row.artist && <span style={{ color: 'var(--dim)', marginLeft: 6 }}>· {row.artist}</span>}
            </span>
            <span className="hero-feed-via" style={{ color: 'var(--dim)', fontSize: 10 }}>{row.via}</span>
            <span className="tnum hero-feed-amt" style={{
              color: 'var(--accent-a)', fontWeight: 700, width: 64, textAlign: 'right',
            }}>${row.cents}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--line)',
        fontSize: 9, letterSpacing: '0.18em', color: 'var(--dim)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>USE → RIGHT → COLLECTOR → SPLIT → PAYOUT</span>
        <span style={{ color: 'var(--accent-a)' }}>STREAMING ●</span>
      </div>
    </div>
  )
}

export function Hero({ mode, intensity }) {
  const [time, setTime] = useState('00:00:00')
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date()
      const f = (n) => String(n).padStart(2, '0')
      setTime(`${f(d.getUTCHours())}:${f(d.getUTCMinutes())}:${f(d.getUTCSeconds())} UTC`)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="hero-section" style={{ position: 'relative', borderBottom: '1px solid var(--line)', overflow: 'hidden', minHeight: 'calc(100svh - 60px)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: mode === 'classical' ? 0.55 : 0.85 }}>
        <YieldSurface mode={mode} intensity={intensity} height="100%" />
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, transparent 0%, transparent 55%, var(--bg) 100%)',
      }} />
      <Crosshair pos="tl" /><Crosshair pos="tr" /><Crosshair pos="bl" /><Crosshair pos="br" />

      <div className="hero-grid" style={{
        position: 'relative', maxWidth: 1480, margin: '0 auto',
        padding: 'clamp(20px, 3.5vh, 64px) 32px clamp(24px, 3.5vh, 72px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vh, 56px)', alignItems: 'start', minHeight: 'calc(100svh - 60px)',
      }}>
        <div className="col hero-copy" style={{ gap: 'clamp(14px, 2.4vh, 28px)' }}>
          <div className="row" style={{ alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <PulseDot color="var(--accent-c)" />
            <span className="label" style={{ color: 'var(--accent-c)' }}>EARLY ACCESS · WAITLIST OPEN</span>
            <span style={{ height: 1, flex: 1, maxWidth: 120, background: 'var(--line)' }} />
            <span className="label tnum">{time}</span>
          </div>

          <h1 className="hero-h1" style={{
            margin: 0,
            fontFamily: 'var(--face-display)',
            fontWeight: 'var(--weight-display)',
            fontSize: 'clamp(36px, min(6vw, 8.6vh), 104px)',
            lineHeight: 0.95,
            letterSpacing: 'var(--tracking-display)',
            color: 'var(--text)', textWrap: 'balance',
          }}>
            Music is{' '}
            <span style={{
              background: 'linear-gradient(94deg, var(--accent-a) 0%, var(--accent-b) 70%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>a yield curve.</span>
            <br />Most people don't read it.
          </h1>

          <p style={{
            margin: 0, maxWidth: 600,
            fontFamily: 'var(--face-body)',
            fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.55,
            color: 'var(--sub)', textWrap: 'pretty',
          }}>
            yield.fm is a royalty investing terminal for music catalogs. We map
            rights, collectors, cash flows, and market multiples so investors
            can understand how songs become financial assets.
          </p>

          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <button style={{
              background: 'var(--accent-a)', color: 'var(--bg)', border: 'none',
              padding: '16px 26px', fontFamily: 'var(--mono)', fontSize: 12,
              letterSpacing: '0.22em', fontWeight: 700,
            }}>REQUEST ACCESS →</button>
            <button style={{
              background: 'transparent', color: 'var(--text)',
              border: '1px solid var(--text)', padding: '16px 26px',
              fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.22em', fontWeight: 700,
            }}>EXPLORE THE ROYALTY MAP</button>
          </div>

          <div className="hr" style={{ marginTop: 12 }} />

          <div className="row" style={{ gap: 36, flexWrap: 'wrap' }}>
            <LiveCounter
              label="GLOBAL ROYALTIES PAID — 2024"
              base={45200000000} rate={1430} prefix="$"
            />
            <Stat
              label="MEDIAN CATALOG MULTIPLE — RE LTM"
              value={`${catalogData.stats.medianMultipleAll.toFixed(2)}×`}
              delta={2.31}
              sparkSeed={3}
            />
            <Stat
              label="AVG CATALOG YIELD — OPEN LISTINGS"
              value={`${catalogData.stats.avgYieldOpenListings.toFixed(2)}%`}
              delta={0.84}
              sparkSeed={5}
              color="var(--accent-c)"
            />
            <Stat
              label="CATALOGS TRACKED"
              value={catalogData.stats.totalListings.toLocaleString()}
              delta={4.62}
              sparkSeed={7}
              color="var(--accent-b)"
            />
          </div>
        </div>

        <HeroFeed />
      </div>
    </section>
  )
}
