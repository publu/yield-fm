import React, { useEffect, useState } from 'react'
import { YieldSurface } from './YieldSurface'
import { Crosshair } from './AppShell'
import { LiveCounter, Stat, PulseDot } from './DataComponents'
import catalogData from '../data/catalogs.json'

const METRIC_COLORS = {
  creations: 'var(--accent-a)',
  velocity: 'var(--accent-c)',
  views: 'var(--accent-b)',
  shares: 'var(--accent-c)',
  comments: 'var(--accent-a)',
  likes: 'var(--accent-d)',
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

function highscoreSoundLink(sound) {
  if (sound?.sound_id) return `https://tiktok.highscore.page/sounds/${sound.sound_id}`
  const q = encodeURIComponent(`${sound?.title || ''} ${sound?.artist || sound?.author || ''}`.trim())
  return `https://tiktok.highscore.page/search?q=${q}`
}

function buildEvents(sounds) {
  const out = []
  for (const s of sounds) {
    if (!s?.sample_videos?.length) continue
    const videos = s.sample_videos.filter(v => v?.link)
    if (!videos.length) continue
    const topVideo = [...videos].sort((a, b) => (b.play_count || 0) - (a.play_count || 0))[0]
    out.push({
      title: s.title || 'Unknown',
      artist: s.artist || s.author || '',
      author: topVideo.author ? `@${topVideo.author}` : '',
      videoLink: topVideo.link,
      soundLink: soundLink(s),
      highscoreLink: highscoreSoundLink(s),
      authorLink: topVideo.author ? `https://www.tiktok.com/@${topVideo.author}` : null,
      postedAt: tiktokTime(topVideo.link),
      rank: s.rank,
      score: s.score || 0,
      creations: s.ugc_count || s.score_breakdown?.ugc_factor || 0,
      velocity: s.videos_per_day || s.score_breakdown?.velocity || 0,
      growthPct: Number(s.videos_per_day_pct ?? s.score_breakdown?.growth_pct ?? 0),
      category: s.top_category,
      countries: Array.isArray(s.trending_countries) ? s.trending_countries.slice(0, 3) : [],
      videoCount: videos.length,
      metrics: {
        views: topVideo.play_count || 0,
        likes: topVideo.like_count || 0,
        shares: topVideo.share_count || 0,
        comments: topVideo.comment_count || 0,
      },
    })
  }
  out.sort((a, b) => (b.score || b.velocity || b.metrics.views) - (a.score || a.velocity || a.metrics.views))
  const seen = new Set()
  return out.filter(e => {
    if (seen.has(e.title)) return false
    seen.add(e.title)
    return true
  })
}

const FALLBACK_EVENTS = [
  { title: 'Se Eu Brotar no Baile Hoje', artist: 'Mar 2026', author: '@artthuroficial_',
    videoLink: 'https://www.tiktok.com/@artthuroficial_/video/7630280983421521173',
    authorLink: 'https://www.tiktok.com/@artthuroficial_',
    soundLink: 'https://www.tiktok.com/search?q=Se%20Eu%20Brotar%20no%20Baile%20Hoje',
    highscoreLink: 'https://tiktok.highscore.page/sounds/7619693396002622228',
    postedAt: tiktokTime('https://www.tiktok.com/@artthuroficial_/video/7630280983421521173'),
    rank: 1, score: 984, creations: 433290, velocity: 32804, growthPct: 8.19, countries: ['BR', 'PE', 'US'], videoCount: 5,
    metrics: { views: 33100000, likes: 2600000, shares: 73900, comments: 7535 } },
  { title: 'Bum Bum Bum - Pegada Diferente', artist: '_william_acosta', author: '@serikkan_r',
    videoLink: 'https://www.tiktok.com/@serikkan_r/video/7607833975620685076',
    authorLink: 'https://www.tiktok.com/@serikkan_r',
    soundLink: 'https://www.tiktok.com/search?q=Bum%20Bum%20Bum%20Pegada%20Diferente',
    highscoreLink: 'https://tiktok.highscore.page/sounds/7362712172960779014',
    postedAt: tiktokTime('https://www.tiktok.com/@serikkan_r/video/7607833975620685076'),
    rank: 2, score: 981, creations: 544535, velocity: 22505, growthPct: 4.31, countries: ['PH', 'US', 'CO'], videoCount: 5,
    metrics: { views: 9400000, likes: 1600000, shares: 166000, comments: 8440 } },
  { title: 'Fast Fast', artist: '031choppa, Al Xapo', author: '@tarryn_abigail',
    videoLink: 'https://www.tiktok.com/search?q=Fast%20Fast%20031choppa',
    authorLink: 'https://www.tiktok.com/@tarryn_abigail',
    soundLink: 'https://www.tiktok.com/search?q=Fast%20Fast%20031choppa',
    highscoreLink: 'https://tiktok.highscore.page/search?q=Fast%20Fast%20031choppa',
    postedAt: null, rank: 3, score: 940, creations: 88100, velocity: 9200, growthPct: 12.4, countries: ['ZA', 'UK', 'US'], videoCount: 4,
    metrics: { views: 12400000, likes: 1420000, shares: 128000, comments: 21300 } },
  { title: 'Mink', artist: 'RosarioRay', author: '@rosarioray',
    videoLink: 'https://www.tiktok.com/@rosarioray',
    authorLink: 'https://www.tiktok.com/@rosarioray',
    soundLink: 'https://www.tiktok.com/search?q=Mink%20RosarioRay',
    highscoreLink: 'https://tiktok.highscore.page/search?q=Mink%20RosarioRay',
    postedAt: null, rank: 4, score: 902, creations: 31700, velocity: 4800, growthPct: 9.7, countries: ['US', 'CA', 'UK'], videoCount: 3,
    metrics: { views: 3800000, likes: 721000, shares: 47400, comments: 9200 } },
]

function MetricLink({ href, label, value, color, title, compact = false }) {
  return (
    <a
      href={href}
      target="_blank" rel="noopener noreferrer"
      title={title || `Open source for ${label}`}
      onClick={(e) => e.stopPropagation()}
      className="signal-metric-link"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: compact ? 58 : 82,
        minHeight: compact ? 36 : 48,
        padding: compact ? '5px 7px' : '7px 9px',
        border: `1px solid color-mix(in oklab, ${color} 58%, var(--line))`,
        background: `linear-gradient(180deg, color-mix(in oklab, ${color} 16%, transparent), color-mix(in oklab, ${color} 5%, transparent))`,
        color: 'inherit',
        textDecoration: 'none',
        boxShadow: `inset 0 0 18px color-mix(in oklab, ${color} 9%, transparent)`,
      }}
    >
      <span className="label" style={{ fontSize: 7, letterSpacing: '0.12em', color }}>{label}</span>
      <span className="tnum" style={{ marginTop: 3, color: 'var(--text)', fontWeight: 700, fontSize: compact ? 11 : 15, lineHeight: 1 }}>
        {value}
      </span>
    </a>
  )
}

function SourceButton({ href, children, title }) {
  return (
    <a
      href={href}
      target="_blank" rel="noopener noreferrer"
      title={title}
      className="source-button"
      style={{
        minHeight: 34,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '0 10px',
        border: '1px solid var(--line)',
        background: 'color-mix(in oklab, var(--bg) 78%, transparent)',
        color: 'var(--sub)',
        textDecoration: 'none',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.14em',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{children}</span>
      <span className="source-button-arrow" aria-hidden="true">↗</span>
    </a>
  )
}

function SignalStrength({ row }) {
  const width = Math.max(12, Math.min(100, (row.score || 0) / 10))
  return (
    <div style={{ height: 4, background: 'var(--line-soft)', overflow: 'hidden' }}>
      <div style={{
        width: `${width}%`,
        height: '100%',
        background: 'linear-gradient(90deg, var(--accent-a), var(--accent-c), var(--accent-b))',
        boxShadow: '0 0 16px color-mix(in oklab, var(--accent-a) 45%, transparent)',
      }} />
    </div>
  )
}

function FeaturedSignal({ row }) {
  if (!row) return null
  const countries = row.countries?.length ? row.countries.join(' / ') : 'GLOBAL'
  const growth = Number.isFinite(row.growthPct) && row.growthPct > 0 ? `+${row.growthPct.toFixed(1)}% growth` : `${row.videoCount || 1} source videos`
  return (
    <div style={{
      padding: 16,
      borderBottom: '1px solid var(--line)',
      background: `
        linear-gradient(135deg, color-mix(in oklab, var(--accent-a) 13%, transparent), transparent 42%),
        radial-gradient(circle at 92% 20%, color-mix(in oklab, var(--accent-b) 20%, transparent), transparent 36%),
        var(--bg)
      `,
    }}>
      <div className="row" style={{ alignItems: 'start', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="label" style={{ color: 'var(--accent-a)' }}>LIVE SOUND</span>
            <span className="label" style={{ color: 'var(--dim)' }}>{countries}</span>
            <span className="label" style={{ color: 'var(--accent-c)' }}>{growth}</span>
          </div>
          <a
            href={row.soundLink}
            target="_blank" rel="noopener noreferrer"
            title="Open TikTok sound"
            style={{
              display: 'block',
              color: 'var(--text)',
              textDecoration: 'none',
              fontFamily: 'var(--face-display)',
              fontWeight: 'var(--weight-display)',
              fontSize: 'clamp(20px, 2vw, 28px)',
              lineHeight: 1.05,
              letterSpacing: 'var(--tracking-display)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.title}
          </a>
          <div style={{ marginTop: 7, color: 'var(--sub)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.artist || 'Unknown artist'} · top source {row.author || 'unknown'} · {fmtAgo(row.postedAt)}
          </div>
        </div>
        <div style={{ minWidth: 72, textAlign: 'right' }}>
          <div className="label" style={{ fontSize: 7, color: 'var(--dim)' }}>SCORE</div>
          <div className="tnum" style={{ color: 'var(--accent-a)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{row.score || '---'}</div>
        </div>
      </div>

      <SignalStrength row={row} />

      <div className="hero-feature-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 6, marginTop: 14 }}>
        <MetricLink href={row.highscoreLink} label="CREATES" value={fmtCount(row.creations)} color={METRIC_COLORS.creations} title="Open sound signal on Highscore" />
        <MetricLink href={row.highscoreLink} label="VELOCITY" value={`${fmtCount(row.velocity)}/d`} color={METRIC_COLORS.velocity} title="Open velocity on Highscore" />
        <MetricLink compact href={row.videoLink} label="VIEWS" value={fmtCount(row.metrics.views)} color={METRIC_COLORS.views} title="Open source TikTok video" />
        <MetricLink compact href={row.videoLink} label="SHARES" value={fmtCount(row.metrics.shares)} color={METRIC_COLORS.shares} title="Open source TikTok video" />
        <MetricLink compact href={row.videoLink} label="CMNTS" value={fmtCount(row.metrics.comments)} color={METRIC_COLORS.comments} title="Open source TikTok video" />
        <MetricLink compact href={row.videoLink} label="LIKES" value={fmtCount(row.metrics.likes)} color={METRIC_COLORS.likes} title="Open source TikTok video" />
      </div>

      <div className="row hero-source-buttons" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <SourceButton href={row.highscoreLink} title="Open analytics for this sound">Analytics</SourceButton>
        <SourceButton href={row.soundLink} title="Open the TikTok sound">TikTok</SourceButton>
        <SourceButton href={row.videoLink} title="Open the source TikTok video">Top Video</SourceButton>
        {row.authorLink && <SourceButton href={row.authorLink} title="Open the creator profile">Creator</SourceButton>}
      </div>
    </div>
  )
}

function TapeRow({ row, i }) {
  const countries = row.countries?.length ? row.countries.join('/') : 'GLOBAL'
  return (
    <div className="hero-tape-row" style={{
      display: 'grid',
      gridTemplateColumns: '42px minmax(0, 1fr) 72px 72px 64px',
      gap: 10,
      alignItems: 'center',
      padding: '9px 14px',
      borderBottom: i < 4 ? '1px solid var(--line-soft)' : 'none',
      color: 'inherit',
    }}>
      <span className="tnum" style={{ color: 'var(--accent-a)', fontWeight: 700 }}>#{row.rank || i + 2}</span>
      <a href={row.soundLink} target="_blank" rel="noopener noreferrer" title="Open TikTok sound" style={{
        minWidth: 0,
        color: 'var(--text)',
        textDecoration: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 11,
      }}>
        {row.title}
        <span style={{ color: 'var(--dim)', marginLeft: 6 }}>{countries}</span>
      </a>
      <a href={row.highscoreLink} target="_blank" rel="noopener noreferrer" className="tnum" title="Open sound on Highscore" style={{ color: 'var(--accent-a)', textDecoration: 'none', fontWeight: 700, textAlign: 'right' }}>
        {fmtCount(row.creations)}
      </a>
      <a href={row.highscoreLink} target="_blank" rel="noopener noreferrer" className="tnum" title="Open velocity on Highscore" style={{ color: 'var(--accent-c)', textDecoration: 'none', fontWeight: 700, textAlign: 'right' }}>
        {fmtCount(row.velocity)}/d
      </a>
      <a href={row.videoLink} target="_blank" rel="noopener noreferrer" className="tnum" title="Open source TikTok video" style={{ color: 'var(--accent-b)', textDecoration: 'none', fontWeight: 700, textAlign: 'right' }}>
        {fmtCount(row.metrics.views)}
      </a>
    </div>
  )
}

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
  const active = visible[0]
  const tape = visible.slice(1, 6)

  return (
    <div style={{
      background: 'color-mix(in oklab, var(--bg-2) 88%, transparent)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', gap: 10, alignItems: 'center' }}>
        <PulseDot color="var(--accent-a)" size={6} />
        <span className="label" style={{ color: 'var(--text)' }}>TIKTOK SIGNALS · RAW SOURCE DATA</span>
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

      <FeaturedSignal row={active} />

      <div>
        <div className="hero-tape-head" style={{
          display: 'grid',
          gridTemplateColumns: '42px minmax(0, 1fr) 72px 72px 64px',
          gap: 10,
          padding: '9px 14px',
          borderBottom: '1px solid var(--line)',
          background: 'color-mix(in oklab, var(--bg-2) 76%, transparent)',
        }}>
          {['RANK', 'SIGNAL TAPE', 'CREATES', 'VELOCITY', 'VIEWS'].map(h => (
            <span key={h} className="label" style={{ fontSize: 7, textAlign: ['CREATES', 'VELOCITY', 'VIEWS'].includes(h) ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {tape.map((row, i) => <TapeRow key={`${row.videoLink}-${i}`} row={row} i={i} />)}
      </div>

      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--line)',
        fontSize: 9, letterSpacing: '0.18em', color: 'var(--dim)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
      }}>
        <span>SOUND METRICS → HIGHSCORE · VIDEO METRICS → TIKTOK</span>
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
        fetchPriority="high"
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

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

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
            <span className="label" style={{ color: 'var(--accent-c)' }}>ROYALTYEXCHANGE COMPS · TIKTOK SIGNALS · WAITLIST OPEN</span>
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
            Find mispriced music catalogs.
            <br />
            <span style={{
              background: 'linear-gradient(94deg, var(--accent-a) 0%, var(--accent-b) 70%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Before the market hears them.</span>
          </h1>

          <p style={{
            margin: 0, maxWidth: 600,
            fontFamily: 'var(--face-body)',
            fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.55,
            color: 'var(--sub)', textWrap: 'pretty',
          }}>
            Music royalty comps have cleared at a 19.82% average trailing cash
            yield across the filtered TTM cohort. yield.fm maps the catalogs,
            the comp set, and the short-form demand signals that can change the price.
          </p>

          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => scrollToId('waitlist')} style={{
              background: 'var(--accent-a)', color: 'var(--bg)', border: 'none',
              padding: '16px 26px', fontFamily: 'var(--mono)', fontSize: 12,
              letterSpacing: '0.22em', fontWeight: 700,
            }}>REQUEST ACCESS →</button>
            <button onClick={() => scrollToId('catalog-index')} style={{
              background: 'transparent', color: 'var(--text)',
              border: '1px solid var(--text)', padding: '16px 26px',
              fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.22em', fontWeight: 700,
            }}>SCAN THE MISPRICING MAP</button>
          </div>

          <div className="hero-proof-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1,
            border: '1px solid var(--line)',
            background: 'var(--line)',
            maxWidth: 720,
          }}>
            {[
              ['AVG ROI PROXY', `${catalogData.stats.avgYieldTTM.toFixed(2)}% TTM`, 'closed-comp cash yield'],
              ['DATA', `${catalogData.stats.closedComps.toLocaleString()} closed comps`, `synced ${catalogData.stats.asOf}`],
              ['SOCIAL SIGNALS', `${(catalogData.stats.totalTiktokUGC / 1e9).toFixed(2)}B TikTok UGC`, `${catalogData.stats.totalSounds.toLocaleString()} sounds indexed`],
            ].map(([k, v, s]) => (
              <div key={k} style={{ background: 'color-mix(in oklab, var(--bg) 86%, transparent)', padding: '14px 16px' }}>
                <div className="label" style={{ color: 'var(--accent-a)', fontSize: 9 }}>{k}</div>
                <div className="tnum" style={{ marginTop: 7, color: 'var(--text)', fontFamily: 'var(--face-data)', fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{v}</div>
                <div style={{ marginTop: 6, color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s}</div>
              </div>
            ))}
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
