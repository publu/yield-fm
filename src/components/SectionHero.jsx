import React, { useEffect, useState } from 'react'
import { YieldSurface } from './YieldSurface'
import { Crosshair } from './AppShell'
import { LiveCounter, Stat, PulseDot } from './DataComponents'

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
const SAMPLE_PLAYS = [
  { right: 'COMP', title: "Lover, You Should've Come Over", via: 'ASCAP'   },
  { right: 'MAST', title: 'Strange Days',                    via: 'SoundEx' },
  { right: 'MECH', title: 'After Midnight',                  via: 'MLC'     },
  { right: 'PERF', title: 'Wide Open Spaces',                via: 'BMI'     },
  { right: 'COMP', title: 'Late Night Talking',              via: 'SESAC'   },
  { right: 'SYNC', title: 'Coast (TV Spot)',                 via: 'Direct'  },
  { right: 'MAST', title: 'Heat Waves',                      via: 'Polydor' },
  { right: 'PERF', title: 'Tiny Dancer',                     via: 'PRS'     },
  { right: 'COMP', title: 'Out Of Time',                     via: 'ASCAP'   },
  { right: 'MECH', title: 'Sunset In Bali',                  via: 'MLC'     },
]

function HeroFeed() {
  const [feed, setFeed] = useState(() => SAMPLE_PLAYS.slice(0, 8).map((p, i) => ({
    ...p,
    ts: tsAgo(i * 1.4),
    cents: pickCents(p.right),
  })))
  useEffect(() => {
    const id = setInterval(() => {
      setFeed((f) => {
        const sample = SAMPLE_PLAYS[Math.floor(Math.random() * SAMPLE_PLAYS.length)]
        return [{ ...sample, ts: tsNow(), cents: pickCents(sample.right) }, ...f].slice(0, 8)
      })
    }, 1200)
    return () => clearInterval(id)
  }, [])

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
            }}>{row.title}</span>
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
    <section style={{ position: 'relative', borderBottom: '1px solid var(--line)', overflow: 'hidden' }}>
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
        padding: 'clamp(56px, 7vw, 96px) 32px clamp(56px, 6vw, 96px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: 56, alignItems: 'start', minHeight: '78vh',
      }}>
        <div className="col" style={{ gap: 28 }}>
          <div className="row" style={{ alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <PulseDot color="var(--accent-c)" />
            <span className="label" style={{ color: 'var(--accent-c)' }}>EARLY ACCESS · WAITLIST OPEN</span>
            <span style={{ height: 1, flex: 1, maxWidth: 120, background: 'var(--line)' }} />
            <span className="label tnum">{time}</span>
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: 'var(--face-display)',
            fontWeight: 'var(--weight-display)',
            fontSize: 'clamp(56px, 9vw, 148px)',
            lineHeight: 0.92,
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
            fontSize: 'clamp(15px, 1.2vw, 17px)', lineHeight: 1.65,
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
            <Stat label="MEDIAN CATALOG MULTIPLE — LTM" value="6.54×" delta={2.31} sparkSeed={3} />
            <Stat label="CATALOGS TRACKED" value="1,847" delta={4.62} sparkSeed={7} color="var(--accent-b)" />
          </div>
        </div>

        <HeroFeed />
      </div>
    </section>
  )
}
