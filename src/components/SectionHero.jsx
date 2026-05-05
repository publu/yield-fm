import React, { useEffect, useState } from 'react'
import { YieldSurface } from './YieldSurface'
import { Crosshair } from './AppShell'
import { LiveCounter, Stat, PulseDot } from './DataComponents'
import catalogData from '../data/catalogs.json'

const SIGNAL_COLORS = {
  PLAYS:    'var(--accent-b)',
  LIKES:    'var(--accent-d)',
  SHARES:   'var(--accent-c)',
  COMMENTS: 'var(--accent-a)',
}

function fmtCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`
  return String(Math.max(0, Math.floor(n)))
}

function fmtAgo(date) {
  if (!date) return '— —'
  const sec = Math.max(0, (Date.now() - date.getTime()) / 1000)
  if (sec < 60) return `${Math.floor(sec)}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d ago`
  if (sec < 86400 * 365) return `${Math.floor(sec / 86400 / 30)}mo ago`
  return `${Math.floor(sec / 86400 / 365)}y ago`
}

// TikTok video IDs are 64-bit snowflakes. Top 32 bits = unix-seconds posted-at.
function tiktokTime(link) {
  try {
    const m = /\/video\/(\d{15,21})/.exec(link || '')
    if (!m) return null
    const id = BigInt(m[1])
    const ts = Number(id >> 32n)
    if (ts < 1_400_000_000 || ts > Date.now() / 1000 + 86400) return null
    return new Date(ts * 1000)
  } catch { return null }
}

function soundLink(sound) {
  if (sound.tiktok_link) return sound.tiktok_link
  if (sound.sound_id) return `https://www.tiktok.com/music/-${sound.sound_id}`
  const q = encodeURIComponent(`${sound.title || ''} ${sound.artist || sound.author || ''}`.trim())
  return `https://www.tiktok.com/search?q=${q}`
}

function buildEvents(sounds) {
  const out = []
  for (const s of sounds) {
    if (!s?.sample_videos?.length) continue
    for (const v of s.sample_videos) {
      if (!v?.link) continue
      const metrics = [
        ['PLAYS',    v.play_count    || 0],
        ['LIKES',    v.like_count    || 0],
        ['SHARES',   v.share_count   || 0],
        ['COMMENTS', v.comment_count || 0],
      ].filter(([, n]) => n > 0)
      if (!metrics.length) continue
      // Pick the metric whose normalized magnitude is biggest.
      // (plays scale > likes > shares > comments — normalize to surface the standout signal.)
      const NORM = { PLAYS: 1, LIKES: 5, SHARES: 80, COMMENTS: 200 }
      metrics.sort((a, b) => (b[1] * NORM[b[0]]) - (a[1] * NORM[a[0]]))
      const [signal, value] = metrics[0]
      out.push({
        signal,
        value,
        title: s.title || 'Unknown',
        artist: s.artist || s.author || '',
        author: v.author ? `@${v.author}` : '',
        videoLink: v.link,
        soundLink: soundLink(s),
        authorLink: v.author ? `https://www.tiktok.com/@${v.author}` : null,
        postedAt: tiktokTime(v.link),
        playRank: v.play_count || 0,
      })
    }
  }
  // Highest-engagement first, then de-dupe consecutive same-sound entries
  out.sort((a, b) => b.playRank - a.playRank)
  const seen = new Set()
  return out.filter(e => {
    if (seen.has(e.title)) return false
    seen.add(e.title)
    return true
  })
}

const FALLBACK_EVENTS = [
  { signal: 'PLAYS', value: 33100000, title: 'Se Eu Brotar no Baile Hoje', artist: 'gordinhobolad0', author: '@artthuroficial_',
    videoLink: 'https://www.tiktok.com/@artthuroficial_/video/7630280983421521173',
    authorLink: 'https://www.tiktok.com/@artthuroficial_',
    soundLink: 'https://www.tiktok.com/search?q=Se%20Eu%20Brotar%20no%20Baile%20Hoje',
    postedAt: tiktokTime('https://www.tiktok.com/@artthuroficial_/video/7630280983421521173') },
  { signal: 'PLAYS', value: 9400000, title: 'Bum Bum Bum - Pegada Diferente', artist: '_william_acosta', author: '@serikkan_r',
    videoLink: 'https://www.tiktok.com/search?q=Bum%20Bum%20Bum%20Pegada%20Diferente',
    authorLink: 'https://www.tiktok.com/@serikkan_r',
    soundLink: 'https://www.tiktok.com/search?q=Bum%20Bum%20Bum%20Pegada%20Diferente',
    postedAt: null },
  { signal: 'LIKES', value: 527000, title: 'Fast Fast', artist: '031choppa, Al Xapo', author: '@tarryn_abigail',
    videoLink: 'https://www.tiktok.com/search?q=Fast%20Fast%20031choppa',
    authorLink: 'https://www.tiktok.com/@tarryn_abigail',
    soundLink: 'https://www.tiktok.com/search?q=Fast%20Fast%20031choppa',
    postedAt: null },
  { signal: 'PLAYS', value: 1200000, title: 'Mink', artist: 'RosarioRay', author: '@rosarioray',
    videoLink: 'https://www.tiktok.com/@rosarioray',
    authorLink: 'https://www.tiktok.com/@rosarioray',
    soundLink: 'https://www.tiktok.com/search?q=Mink%20RosarioRay',
    postedAt: null },
]

function HeroFeed() {
  const [events, setEvents] = useState(FALLBACK_EVENTS)
  const [head, setHead] = useState(0)
  const [fetchedAt, setFetchedAt] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('https://tiktok.highscore.page/api/indexer/pages/foryou?limit=80')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.sounds?.length) return
        const built = buildEvents(data.sounds)
        if (built.length) {
          setEvents(built)
          setFetchedAt(new Date())
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Slowly cycle the head so the feed feels alive without faking new data.
  useEffect(() => {
    if (events.length <= 8) return
    const id = setInterval(() => setHead(h => (h + 1) % events.length), 2400)
    return () => clearInterval(id)
  }, [events.length])

  const visible = []
  for (let i = 0; i < Math.min(8, events.length); i++) {
    visible.push(events[(head + i) % events.length])
  }

  return (
    <div style={{
      background: 'color-mix(in oklab, var(--bg-2) 88%, transparent)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', gap: 10, alignItems: 'center' }}>
        <PulseDot color="var(--accent-a)" size={6} />
        <span className="label" style={{ color: 'var(--text)' }}>TOP TIKTOK VIDEOS · TRACKED CATALOG</span>
        <span style={{ flex: 1 }} />
        <a
          href="https://tiktok.highscore.page"
          target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--dim)', fontSize: 9, letterSpacing: '0.2em', textDecoration: 'none' }}
          title="Open the highscore index"
        >
          INDEX ↗
        </a>
      </div>

      <div className="col">
        {visible.map((row, i) => {
          const color = SIGNAL_COLORS[row.signal] || 'var(--accent-a)'
          return (
            <a
              key={`${row.videoLink}-${i}`}
              href={row.videoLink}
              target="_blank" rel="noopener noreferrer"
              className="row hero-feed-row"
              title={`Open on TikTok · ${row.signal.toLowerCase()}: ${row.value.toLocaleString()}`}
              style={{
                padding: '8px 14px', gap: 10, alignItems: 'center',
                borderBottom: i < visible.length - 1 ? '1px solid var(--line-soft)' : 'none',
                opacity: 1 - i * 0.05,
                color: 'inherit', textDecoration: 'none',
                transition: 'background 140ms',
              }}
            >
              <span className="tnum hero-feed-ts" style={{ color: 'var(--dim)', fontSize: 10, width: 64 }}>
                {fmtAgo(row.postedAt)}
              </span>
              <span style={{
                fontSize: 9, padding: '2px 6px', letterSpacing: '0.1em', fontWeight: 700,
                background: `color-mix(in oklab, ${color} 22%, transparent)`,
                color, border: `1px solid ${color}`,
                minWidth: 64, textAlign: 'center',
              }}>{row.signal}</span>
              <span style={{
                color: 'var(--text)', flex: 1, minWidth: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {row.title}
                {row.artist && <span style={{ color: 'var(--dim)', marginLeft: 6 }}>· {row.artist}</span>}
              </span>
              <span
                className="hero-feed-via"
                style={{
                  color: 'var(--dim)', fontSize: 10, maxWidth: 120,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >{row.author}</span>
              <span className="tnum hero-feed-amt" style={{
                color, fontWeight: 700, width: 78, textAlign: 'right',
              }}>{fmtCount(row.value)}</span>
            </a>
          )
        })}
      </div>

      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--line)',
        fontSize: 9, letterSpacing: '0.18em', color: 'var(--dim)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
      }}>
        <span>REAL VIDEO METRICS · CLICK ANY ROW</span>
        <span style={{ color: 'var(--accent-a)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {fetchedAt
            ? <>SYNCED {fmtAgo(fetchedAt).replace(' ago', '')} ●</>
            : <>FETCHING ●</>}
        </span>
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
              hint="How is this calculated?"
              onClick={() => {
                const el = document.getElementById('yield-methodology')
                if (!el) return
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
                el.setAttribute('data-flash', '1')
                setTimeout(() => el.removeAttribute('data-flash'), 1400)
              }}
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
