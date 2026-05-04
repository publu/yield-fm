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

const SIGNAL_COLORS = {
  POST:   'var(--accent-a)',
  VIEWS:  'var(--accent-b)',
  LIKES:  'var(--accent-d)',
  SHARE:  'var(--accent-c)',
  SPIKE:  'var(--accent-c)',
  REGION: 'var(--accent-b)',
}

function fmtCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`
  return String(Math.max(1, Math.floor(n)))
}

function pickFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildSignal(sound) {
  const samples = sound.sample_videos?.length ? sound.sample_videos : []
  const vid = samples.length ? pickFrom(samples) : null
  const countries = sound.trending_countries?.length ? sound.trending_countries.slice(0, 8) : ['US']

  const types = ['POST', 'POST']
  if (vid?.play_count) types.push('VIEWS', 'VIEWS')
  if (vid?.like_count) types.push('LIKES')
  if (vid?.share_count) types.push('SHARE')
  if (sound.videos_per_day_pct > 0) types.push('SPIKE')
  if (countries.length > 1) types.push('REGION')

  const signal = pickFrom(types)
  let value = ''
  let via = vid?.author ? `@${vid.author}` : pickFrom(countries)

  switch (signal) {
    case 'POST': {
      const perMin = Math.max(1, (sound.videos_per_day || 60) / 1440)
      value = `+${fmtCount(Math.max(1, Math.floor(perMin * (0.4 + Math.random() * 1.6))))}`
      break
    }
    case 'VIEWS': {
      const base = vid?.play_count || 1e5
      value = `+${fmtCount(Math.floor(base * (0.0008 + Math.random() * 0.012)))}`
      break
    }
    case 'LIKES': {
      const base = vid?.like_count || 1e4
      value = `+${fmtCount(Math.floor(base * (0.002 + Math.random() * 0.014)))}`
      break
    }
    case 'SHARE': {
      const base = vid?.share_count || 800
      value = `+${fmtCount(Math.floor(base * (0.006 + Math.random() * 0.025)))}`
      break
    }
    case 'SPIKE': {
      const pct = sound.videos_per_day_pct || 5
      value = `+${(pct * (0.4 + Math.random() * 0.7)).toFixed(2)}%`
      via = `${sound.top_category || 'trend'}`.replace(/_/g, ' ')
      break
    }
    case 'REGION': {
      via = pickFrom(countries)
      value = `${countries.length} mkt${countries.length === 1 ? '' : 's'}`
      break
    }
  }

  return {
    signal,
    title: sound.title || 'Unknown',
    artist: sound.artist || sound.author || '',
    via,
    value,
  }
}

const FALLBACK_SOUNDS = [
  { title: "Bum Bum Bum - Pegada Diferente", artist: "_william_acosta", videos_per_day: 29453, videos_per_day_pct: 6.32, trending_countries: ['BR', 'US', 'PH', 'MX'], top_category: 'dance_performance', sample_videos: [{ author: 'serikkan_r', play_count: 9400000, like_count: 1600000, share_count: 166000 }] },
  { title: "Fast Fast", artist: "031choppa, Al Xapo", videos_per_day: 16738, videos_per_day_pct: 15.92, trending_countries: ['ZA', 'NG', 'KE'], top_category: 'selfie_vlog', sample_videos: [{ author: 'tarryn_abigail', play_count: 2800000, like_count: 527000, share_count: 12600 }] },
  { title: "Se Eu Brotar no Baile Hoje", artist: "gordinhobolad0", videos_per_day: 37021, videos_per_day_pct: 11.41, trending_countries: ['BR', 'PE', 'AR'], top_category: 'dance_performance', sample_videos: [{ author: 'artthuroficial_', play_count: 33100000, like_count: 2600000, share_count: 73900 }] },
  { title: "Mink", artist: "RosarioRay", videos_per_day: 5400, videos_per_day_pct: 8.22, trending_countries: ['US', 'PH', 'ID'], top_category: 'fashion_outfit', sample_videos: [{ author: 'rosarioray', play_count: 1200000, like_count: 240000, share_count: 8400 }] },
  { title: "Inspiring Triumphant Trailer", artist: "Veaceslav Draganov", videos_per_day: 3100, videos_per_day_pct: 4.18, trending_countries: ['US', 'UK', 'DE'], top_category: 'gaming_screen', sample_videos: [{ author: 'cinematicfx', play_count: 540000, like_count: 86000, share_count: 4200 }] },
]

function HeroFeed() {
  const [pool, setPool] = useState(FALLBACK_SOUNDS)
  const [feed, setFeed] = useState(() => FALLBACK_SOUNDS.slice(0, 8).map((s, i) => ({
    ...buildSignal(s), ts: tsAgo(i * 1.4),
  })))

  useEffect(() => {
    let cancelled = false
    fetch('https://tiktok.highscore.page/api/indexer/pages/foryou?limit=80')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.sounds?.length) return
        setPool(data.sounds)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setFeed((f) => {
        const sound = pool[Math.floor(Math.random() * pool.length)]
        return [{ ...buildSignal(sound), ts: tsNow() }, ...f].slice(0, 8)
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
        <span className="label" style={{ color: 'var(--text)' }}>LIVE · TIKTOK SIGNALS · TRACKED CATALOG</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--dim)', fontSize: 9, letterSpacing: '0.2em' }}>Δ / EVENT</span>
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
              background: `color-mix(in oklab, ${SIGNAL_COLORS[row.signal]} 22%, transparent)`,
              color: SIGNAL_COLORS[row.signal],
              border: `1px solid ${SIGNAL_COLORS[row.signal]}`,
              minWidth: 52, textAlign: 'center',
            }}>{row.signal}</span>
            <span style={{ color: 'var(--text)', flex: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {row.title}
              {row.artist && <span style={{ color: 'var(--dim)', marginLeft: 6 }}>· {row.artist}</span>}
            </span>
            <span className="hero-feed-via" style={{ color: 'var(--dim)', fontSize: 10, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.via}</span>
            <span className="tnum hero-feed-amt" style={{
              color: SIGNAL_COLORS[row.signal] || 'var(--accent-a)', fontWeight: 700, width: 72, textAlign: 'right',
            }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--line)',
        fontSize: 9, letterSpacing: '0.18em', color: 'var(--dim)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>POST → VIEW → LIKE → SHARE → CHART</span>
        <span style={{ color: 'var(--accent-a)' }}>INDEXING ●</span>
      </div>
    </div>
  )
}

const BILL_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAARACgDASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAECAwQG/8QAJBAAAgICAgEDBQAAAAAAAAAAAQIAAwQRBSESEyMxFCJBYXL/xAAXAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFxEBAQEBAAAAAAAAAAAAAAAAAAEhEf/aAAwDAQACEQMRAD8A5cTiKbcdGcHsb6kpxVFtzVptQo+T3NcHkKEx61ewDQA7mIzfRzLGrsRq3Ggd/H7nPWsTVxVD61WWIOm++Xbh6tH2Dv8AuaYGXTXT7tyBydnuXOVQLxZ9aviF14b6jtMcORxNaU2N4FSoJGyDE6szkMdqLAtgO1IGolnUrza/ImkRNIj8yGiIFGiIgf/Z'

function BillBackdrop() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundColor: 'var(--bg)',
      backgroundImage: `url(${BILL_LQIP})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: loaded ? 'none' : 'blur(20px)',
      transition: 'filter 0.4s ease-out',
    }}>
      <img
        src="/yield-fm-bill.jpg"
        alt=""
        decoding="async"
        loading="eager"
        fetchpriority="high"
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: loaded ? 0.95 : 0,
          transition: 'opacity 0.45s ease-out',
        }}
      />
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
      <div style={{ position: 'absolute', inset: 0, opacity: mode === 'hiphop' ? 0.25 : (mode === 'classical' ? 0.55 : 0.68) }}>
        <YieldSurface mode={mode} intensity={intensity} height="100%" />
      </div>
      {mode === 'hiphop' && <BillBackdrop />}
      {mode === 'hiphop' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(8,12,8,0.92) 0%, rgba(8,12,8,0.78) 35%, rgba(8,12,8,0.45) 65%, rgba(8,12,8,0.30) 100%)',
        }} />
      )}
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
              label="GLOBAL ROYALTIES PAID · ANNUALIZED · IFPI + CISAC"
              base={(() => {
                // IFPI 2024 recorded ($29.6B) + CISAC 2024 collections (~$13.1B) ≈ $42.7B/yr
                const ANNUAL_USD = 42_700_000_000
                const SECONDS_PER_YEAR = 365.25 * 86400
                const RATE = ANNUAL_USD / SECONDS_PER_YEAR
                const yearStart = Date.UTC(new Date().getUTCFullYear(), 0, 1) / 1000
                const nowSec = Date.now() / 1000
                return Math.max(0, nowSec - yearStart) * RATE
              })()}
              rate={42_700_000_000 / (365.25 * 86400)} prefix="$"
            />
            <Stat
              label="MEDIAN CATALOG MULTIPLE · TTM"
              value={`${catalogData.stats.medianMultipleTTM.toFixed(2)}×`}
              delta={catalogData.stats.medianMultipleDelta}
              sparkSeed={3}
            />
            <Stat
              label="AVG CATALOG YIELD · CLOSED COMPS TTM"
              value={`${catalogData.stats.avgYieldTTM.toFixed(2)}%`}
              delta={catalogData.stats.avgYieldDelta}
              sparkSeed={5}
              color="var(--accent-c)"
            />
            <Stat
              label="CATALOGS TRACKED"
              value={catalogData.stats.totalListings.toLocaleString()}
              delta={catalogData.stats.universeGrowthTTM}
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
