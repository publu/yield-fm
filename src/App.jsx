import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// ── Spring presets ────────────────────────────────────────────────────────────

const spring       = { type: 'spring', stiffness: 260, damping: 26 }
const springBouncy = { type: 'spring', stiffness: 360, damping: 28 }
const springStiff  = { type: 'spring', stiffness: 520, damping: 32 }
const snappy       = { type: 'tween', duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }

// ── Stagger variants ──────────────────────────────────────────────────────────

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const slideItem = { hidden: { opacity: 0, x: -14 }, visible: { opacity: 1, x: 0, transition: spring } }
const upItem    = { hidden: { opacity: 0, y: 14 },  visible: { opacity: 1, y: 0, transition: spring } }

// ── Tokens ────────────────────────────────────────────────────────────────────

const C = {
  bg:     '#080812',      // original dark navy, not pure black
  panel:  '#0d0d1f',      // raised panel surface
  panel2: '#0a0a18',      // slightly lighter panel
  border: '#1e1e3f',
  teal:   '#00d4a8',
  purple: '#9b59d8',
  orange: '#f5a623',
  text:   '#dcdcf4',
  sub:    '#9898c0',
  dim:    '#6868a0',
  ghost:  '#383868',
}

// ── Type scale: 10 / 11 / 13 / 17 / 82 ───────────────────────────────────────

const RIGHTS = [
  { num: '01', title: 'COMPOSITION',  desc: 'The song: melody, lyrics, and publisher share', color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg> },
  { num: '02', title: 'MASTER',      desc: 'The recording: label, artist, or master owner',     color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><line x1="10.5" y1="12" x2="13.5" y2="12"/></svg> },
  { num: '03', title: 'PERFORMANCE',    desc: 'Public plays: radio, venues, TV, streaming',  color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M2 14 Q6 10 10 14 Q14 18 18 14 Q20 12 22 14"/><line x1="5" y1="14" x2="5" y2="20"/><line x1="9" y1="12" x2="9" y2="20"/><line x1="13" y1="14" x2="13" y2="20"/><line x1="17" y1="12" x2="17" y2="20"/></svg> },
  { num: '04', title: 'MECHANICAL',   desc: 'Reproductions: streams, downloads, physical',  color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg> },
]

const COLLECTORS = [
  { title: 'ASCAP / BMI / SESAC',   desc: 'PROs pay writer and publisher performance shares',        color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><polygon points="6,3 20,12 6,21" opacity="0.9"/></svg> },
  { title: 'THE MLC',   desc: 'Matches U.S. DSP usage and pays digital mechanicals',    color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg> },
  { title: 'SOUNDEXCHANGE', desc: 'Digital radio master royalties: 50/45/5 split', color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 2C8.5 2 6 5 6 8c0 3 2 6 6 7 4-1 6-4 6-7 0-3-2.5-6-6-6z"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="21" x2="16" y2="21"/></svg> },
  { title: 'DISTRIBUTORS / LABELS',        desc: 'Interactive stream and sale money for the master',  color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="4" x2="8" y2="18"/><line x1="2" y1="11" x2="22" y2="11" strokeWidth="0.8" opacity="0.4"/></svg> },
]

const CHART_LINES = [
  { color: C.teal,    amp: 18, freq: 2.2, phase: 0,   label: 'COMPOSITION' },
  { color: C.purple,  amp: 13, freq: 1.8, phase: 1.2, label: 'MASTER' },
  { color: C.orange,  amp: 15, freq: 2.6, phase: 0.7, label: 'MECHANICAL' },
  { color: '#b0b0c8', amp:  9, freq: 1.5, phase: 2.1, label: 'SYNC' },
]

const FLOW_STEPS = [
  { label: '01 USE', sub: 'A stream, radio spin, venue play, TV cue, or sale creates usage data.', color: C.teal },
  { label: '02 MATCH', sub: 'ISRCs identify recordings. ISWCs and publisher splits identify songs.', color: C.purple },
  { label: '03 COLLECT', sub: 'PROs, The MLC, SoundExchange, labels, and distributors route different rights.', color: C.orange },
  { label: '04 PAY', sub: 'Splits decide who receives cash: writers, publishers, artists, labels, owners.', color: '#b0b0c8' },
]

function makePath(w, h, amp, freq, phase) {
  let d = ''
  for (let x = 0; x <= w; x += 4) {
    const y = h / 2 + amp * Math.sin((x / w) * Math.PI * freq + phase)
    d += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return d
}

function useTimer() {
  const [s, setS] = useState(0)
  useEffect(() => { const id = setInterval(() => setS(n => n + 1), 1000); return () => clearInterval(id) }, [])
  return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
}

function useMedia(query) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  ))

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// ── Primitives ────────────────────────────────────────────────────────────────

function SignalMark({ size = 18 }) {
  return (
    <div aria-hidden="true" style={{
      width: size,
      height: size,
      border: `1px solid ${C.teal}`,
      borderRadius: 999,
      boxShadow: `0 0 14px rgba(0,212,168,0.22), inset 0 0 10px rgba(0,212,168,0.08)`,
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute',
        inset: '50% auto auto 50%',
        width: Math.max(4, size * 0.28),
        height: Math.max(4, size * 0.28),
        borderRadius: 999,
        background: C.teal,
        transform: 'translate(-50%, -50%)',
        opacity: 0.82,
      }} />
    </div>
  )
}

function PulseDot({ color = C.orange, size = 10 }) {
  return (
    <div className="status-dot rounded-full shrink-0"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 10px ${color}88` }}
    />
  )
}

// ── Vinyl — large, detailed, matching original ────────────────────────────────

function Vinyl({ size = 260 }) {
  const scale = size / 260
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Atmosphere */}
      <div className="absolute rounded-full pointer-events-none" style={{
        inset: -48 * scale,
        background: 'radial-gradient(circle, rgba(155,89,216,0.12) 0%, rgba(0,212,168,0.07) 38%, transparent 66%)',
        filter: 'blur(32px)',
      }} />

      <div className="vinyl-spin" style={{ width: size, height: size }}>
        <svg viewBox="0 0 260 260" style={{ width: '100%', height: '100%',
          filter: 'drop-shadow(0 0 24px rgba(0,212,168,0.22)) drop-shadow(0 0 56px rgba(155,89,216,0.14))' }}>
          <defs>
            <radialGradient id="vg2" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#18182e" />
              <stop offset="55%"  stopColor="#0e0e20" />
              <stop offset="100%" stopColor="#070710" />
            </radialGradient>
            <radialGradient id="lg2" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stopColor="#1c0e30" />
              <stop offset="100%" stopColor="#06060c" />
            </radialGradient>
          </defs>

          <circle cx="130" cy="130" r="128" fill="url(#vg2)" stroke="#1e1e3f" strokeWidth="1.5" />

          {/* Many groove rings — key visual in original */}
          {Array.from({ length: 36 }, (_, i) => (
            <circle key={i} cx="130" cy="130" r={120 - i * 2.6} fill="none"
              stroke={i % 6 === 0 ? '#161636' : '#0a0a1e'} strokeWidth={i % 6 === 0 ? 0.8 : 0.35} />
          ))}

          {/* Teal sweep highlight */}
          <path d="M 60 96 A 88 88 0 0 1 200 96" stroke={C.teal} strokeWidth="1" fill="none" opacity="0.1" />

          {/* Label disc */}
          <circle cx="130" cy="130" r="46" fill="url(#lg2)" />
          <circle cx="130" cy="130" r="46" fill="none" stroke={C.purple} strokeWidth="0.8" opacity="0.5" />
          <circle cx="130" cy="130" r="38" fill="none" stroke={C.teal}   strokeWidth="0.5" opacity="0.25" />

          <text x="130" y="126" textAnchor="middle" fill={C.teal}   fontSize="10" fontFamily="SpaceMono, monospace" letterSpacing="1">yield.fm</text>
          <text x="130" y="138" textAnchor="middle" fill={C.purple} fontSize="6.5" fontFamily="SpaceMono, monospace" opacity="0.85">v0.1</text>

          {/* Spinning arc highlight */}
          <path d="M 130 84 A 46 46 0 0 1 176 130" stroke={C.teal} strokeWidth="2.5" fill="none" opacity="0.85" strokeLinecap="round" />
          <path d="M 130 84 A 46 46 0 0 1 176 130" stroke={C.teal} strokeWidth="9"   fill="none" opacity="0.08" strokeLinecap="round" />

          <circle cx="130" cy="130" r="6" fill="#05050c" />
          <circle cx="130" cy="130" r="6" fill="none" stroke="#18183a" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  )
}

// ── Royalty Chart ─────────────────────────────────────────────────────────────

function RoyaltyChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const W = 290, H = 120

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      <motion.div variants={upItem}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={0} y1={H * f} x2={W} y2={H * f}
              stroke="#12122a" strokeWidth="0.8" strokeDasharray="3 5" />
          ))}
          {CHART_LINES.map(({ color, amp, freq, phase }, idx) => {
            const d1 = makePath(W, H, amp, freq, phase)
            const dotXs = [W * 0.28, W * 0.62, W * 0.84]
            return (
              <g key={idx}>
                <motion.path d={d1} stroke={color} strokeWidth="5" fill="none" opacity={0.06}
                  initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut', delay: idx * 0.08 }} />
                <motion.path d={d1} stroke={color} strokeWidth="1.8" fill="none" opacity={0.9}
                  initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut', delay: idx * 0.08 }} />
                {dotXs.map((dotX, di) => {
                  const dotY = H / 2 + amp * Math.sin((dotX / W) * Math.PI * freq + phase)
                  return (
                    <circle key={di} cx={dotX} cy={dotY} r="3.5" fill={color}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                      opacity={di === 1 ? 0.72 : 0.95} />
                  )
                })}
              </g>
            )
          })}
        </svg>
      </motion.div>
      <motion.div variants={upItem} className="flex gap-3 flex-wrap mt-2">
        {CHART_LINES.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 14, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5 }}>{label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ── Cassette ──────────────────────────────────────────────────────────────────

function Cassette() {
  const spokes = [0, 120, 240]

  function Reel({ cx, cy, reverse = false }) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={30} fill="#080613" stroke="#3a2260" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r={22} fill="none" stroke="#201838" strokeWidth="1" />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`${reverse ? 360 : 0} ${cx} ${cy}`}
            to={`${reverse ? 0 : 360} ${cx} ${cy}`}
            dur="24s"
            calcMode="linear"
            repeatCount="indefinite"
          />
          {spokes.map(a => (
            <line key={a}
              x1={cx + 17 * Math.cos((a * Math.PI) / 180)}
              y1={cy + 17 * Math.sin((a * Math.PI) / 180)}
              x2={cx + 20.5 * Math.cos((a * Math.PI) / 180)}
              y2={cy + 20.5 * Math.sin((a * Math.PI) / 180)}
              stroke="#6a30a0"
              strokeWidth="1"
              opacity="0.29"
              strokeLinecap="round" />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={12} fill="#100820" stroke="#2d1a4e" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={5} fill="#05040b" />
      </g>
    )
  }

  return (
    <svg viewBox="0 0 320 148" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="cBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#160a2a" />
          <stop offset="100%" stopColor="#0a0516" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="314" height="142" rx="12" fill="url(#cBg)" stroke="#3c2267" strokeWidth="1.2" />
      <rect x="9" y="9" width="302" height="130" rx="9" fill="none" stroke="#21143a" strokeWidth="1" />
      <rect x="52" y="18" width="216" height="82" rx="6" fill="#04030a" stroke="#24173f" strokeWidth="1.2" />
      <rect x="56" y="22" width="208" height="74" rx="4" fill="#050410" stroke="#151022" strokeWidth="0.5" />
      <path d="M 84 94 Q 160 104 236 94" stroke="#3b2852" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Reel cx={108} cy={60} />
      <Reel cx={212} cy={60} reverse />
      <rect x="20" y="2" width="24" height="10" rx="3" fill="#08060f" stroke="#4a2480" strokeWidth="1" />
      <rect x="276" y="2" width="24" height="10" rx="3" fill="#08060f" stroke="#4a2480" strokeWidth="1" />
      <circle cx="20" cy="130" r="5.5" fill="#08060f" stroke="#2a1448" strokeWidth="1" />
      <circle cx="300" cy="130" r="5.5" fill="#08060f" stroke="#2a1448" strokeWidth="1" />
      <text x="160" y="124" textAnchor="middle" fill="#7a3aaa" fontSize="11" letterSpacing="1.5"
        fontFamily="SpaceMono, monospace" fontWeight="700">yield.fm</text>
      <text x="160" y="137" textAnchor="middle" fill="#4a1870" fontSize="6.5" letterSpacing="2"
        fontFamily="SpaceMono, monospace">ROYALTY MAP</text>
    </svg>
  )
}

// ── Feature list with stagger ─────────────────────────────────────────────────

function FeatureList({ items }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className="flex flex-col"
      variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      {items.map((item, i) => (
        <motion.div key={i} variants={slideItem}>
          <motion.div className="flex items-center gap-3 cursor-pointer"
            style={{
              padding: '13px 8px',
              borderBottom: i < items.length - 1 ? `1px solid ${C.ghost}50` : 'none',
            }}
            whileHover={{ backgroundColor: '#0d0d22', paddingLeft: 14, transition: snappy }}
            whileTap={{ scale: 0.98, transition: springStiff }}>
            {/* Color accent bar */}
            <div style={{ width: 2, height: 34, borderRadius: 1, background: item.color, opacity: 0.7, flexShrink: 0 }} />
            <div style={{ color: item.color, opacity: 0.85 }} className="shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 12, color: C.text, fontWeight: 700, letterSpacing: 1.5 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>{item.desc}</div>
            </div>
            {item.num && (
              <span style={{ fontSize: 30, color: C.ghost, fontWeight: 700, letterSpacing: 0, lineHeight: 1, flexShrink: 0 }}>
                {item.num}
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function CrtBoot() {
  return (
    <div className="crt-boot" aria-hidden="true">
      <div className="crt-boot-line" />
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const timer = useTimer()
  const isMobile = useMedia('(max-width: 760px)')
  const isTablet = useMedia('(max-width: 980px)')

  return (
    <div className="min-h-dvh w-full flex items-center justify-center"
      style={{ padding: isMobile ? '0' : '32px 16px', fontFamily: "'SpaceMono', monospace", background: C.bg }}>

      <motion.div className="crt-screen w-full overflow-hidden"
        style={{
          maxWidth: 1200,
          borderRadius: isMobile ? 0 : 12,
          background: C.bg,
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 0 1px #0a0a1a, 0 48px 140px rgba(0,0,0,0.9),
            0 0 100px rgba(0,212,168,0.06), 0 0 200px rgba(155,89,216,0.04)`,
        }}
        variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden" animate="visible" transition={{ ...springBouncy, delay: 0.05 }}>

        {/* ── Title Bar ── */}
        <div className="flex items-center justify-between"
          style={{
            padding: isMobile ? '10px 12px' : '10px 20px',
            gap: isMobile ? 10 : 16,
            background: 'linear-gradient(180deg, #0d0d20 0%, #0a0a18 100%)',
            borderBottom: `1px solid ${C.border}`,
          }}>
          <div className="flex items-center min-w-0" style={{ gap: isMobile ? 8 : 12 }}>
            <SignalMark size={14} />
            <span style={{
              fontSize: isMobile ? 9 : 11,
              color: C.dim,
              letterSpacing: isMobile ? 1.4 : 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>yield.fm v0.1 // ROYALTY MAP</span>
          </div>
          <div className="flex items-center shrink-0" style={{ gap: isMobile ? 8 : 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, padding: '3px 12px',
                border: `1px solid ${C.orange}`, color: C.orange,
                boxShadow: `0 0 14px rgba(245,166,35,0.22)`,
                display: isMobile ? 'none' : 'block' }}
              >
              PRE-LAUNCH
            </div>
            <div className="flex items-center gap-2" style={{ color: C.ghost }}>
              {['⊙', '—', '□', '×'].map(ch => (
                <motion.span key={ch} className="cursor-pointer text-xs"
                  whileHover={{ color: C.dim, transition: snappy }}>{ch}</motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hero Row ── */}
        <div className="flex" style={{ flexDirection: isTablet ? 'column' : 'row', borderBottom: `1px solid ${C.border}` }}>

          {/* Hero Left — wide, matches original proportions */}
          <div className="relative overflow-hidden" style={{
            flex: '1 1 0',
            padding: isMobile ? '26px 18px 270px' : '40px 44px 40px',
            borderRight: isTablet ? 'none' : `1px solid ${C.border}`,
            borderBottom: isTablet ? `1px solid ${C.border}` : 'none',
            background: 'linear-gradient(140deg, #0e0e22 0%, #090912 55%, #0b0b1c 100%)',
            minHeight: isMobile ? 540 : 290,
          }}>
            {/* Glow bloom behind vinyl */}
            <div className="absolute pointer-events-none" style={{
              right: isMobile ? -180 : -60,
              top: isMobile ? 96 : -80,
              width: isMobile ? 470 : 580,
              height: isMobile ? 470 : 580,
              background: 'radial-gradient(circle at 55% 45%, rgba(155,89,216,0.15) 0%, rgba(0,212,168,0.08) 38%, transparent 65%)',
              filter: 'blur(36px)',
            }} />

            {/* Quiet catalog-grid texture */}
            <div className="absolute pointer-events-none" style={{
              right: isMobile ? -24 : 250,
              bottom: isMobile ? 18 : 0,
              width: isMobile ? 210 : 260,
              height: 118,
              opacity: isMobile ? 0.16 : 0.18,
              backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
              maskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 70%, transparent)',
            }} />

            {/* Staggered content */}
            <motion.div variants={stagger} initial="hidden" animate="visible"
              style={{ position: 'relative', zIndex: 2 }}
              transition={{ delayChildren: 0.3, staggerChildren: 0.13 }}>

              {/* Logo — thick bars matching original */}
              <motion.div variants={upItem} className="flex items-end" style={{ gap: isMobile ? 10 : 16, marginBottom: isMobile ? 18 : 24 }}>
                <div className="flex items-end gap-0.5" style={{ transform: isMobile ? 'scale(0.72)' : 'none', transformOrigin: 'left bottom' }}>
                  {[12, 20, 30, 38, 30, 22, 36, 28, 18, 32, 24].map((h, i) => (
                    <div key={i}
                      style={{ width: 9, borderRadius: 2, height: h,
                        background: i < 5
                          ? `linear-gradient(to top, #008a6a, ${C.teal})`
                          : `linear-gradient(to top, #6020a0, ${C.purple})`,
                        opacity: i % 3 === 0 ? 0.72 : 1 }}
                    />
                  ))}
                </div>
                <h1 style={{
                    margin: 0,
                    fontSize: isMobile ? 48 : 80,
                    fontWeight: 700,
                    lineHeight: 0.95,
                    letterSpacing: 0,
                    fontFamily: "'SpaceMono', monospace" }}>
                  <span style={{
                    background: `linear-gradient(94deg, ${C.teal} 0%, #8844e0 62%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>yield.</span><span style={{ color: '#eeeefc' }}>fm</span>
                </h1>
              </motion.div>

              <motion.p variants={upItem}
                style={{
                  fontSize: isMobile ? 14 : 17,
                  color: '#c8c8e8',
                  letterSpacing: '0.04em',
                  marginBottom: 16,
                  fontWeight: 400,
                  lineHeight: 1.55,
                  maxWidth: isMobile ? 320 : 'none',
                }}>
                Learn where music royalties come from and who pays them.
              </motion.p>

              {/* Separator — teal→purple */}
              <motion.div variants={upItem} style={{
                height: 1,
                background: `linear-gradient(90deg, ${C.teal}60 0%, ${C.purple}35 45%, transparent 100%)`,
                marginBottom: 22, maxWidth: 460,
              }} />

              {/* Description */}
              <motion.p variants={upItem}
                style={{ fontSize: 13, color: C.sub, lineHeight: 1.9, marginBottom: 16, maxWidth: isMobile ? 315 : 380 }}>
                Music royalties start with two copyrights:
                {isMobile ? ' ' : <br />}
                the composition and the master recording.
                {isMobile ? ' ' : <br />}
                Each revenue source travels through a
                {isMobile ? ' ' : <br />}
                different collection path before payout.
              </motion.p>

              {/* Teal callout */}
              <motion.p variants={upItem} style={{
                fontSize: 13, color: C.teal,
                borderLeft: `2px solid ${C.teal}`,
                paddingLeft: 12,
                lineHeight: 1.6,
                margin: 0,
                maxWidth: isMobile ? 315 : 380,
              }}>
                By the end, you should know what ASCAP, The MLC, SoundExchange, and distributors actually do.
              </motion.p>
            </motion.div>

            {/* Vinyl — large, positioned right */}
            <motion.div style={{
                position: 'absolute',
                right: isMobile ? -30 : 32,
                top: isMobile ? 324 : '50%',
                transform: isMobile ? 'none' : 'translateY(-52%)',
                zIndex: 1,
              }}
              initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.55 }}>
              <Vinyl size={isMobile ? 220 : 260} />
            </motion.div>
          </div>

          {/* Status Panel — PRE-LAUNCH large, matching original */}
          <motion.div className="flex flex-col gap-4"
            style={{ width: isTablet ? '100%' : 288, padding: isMobile ? '18px' : '24px 22px',
              background: 'linear-gradient(180deg, #0a0a1a 0%, #08080e 100%)' }}
            variants={slideItem} initial="hidden" animate="visible"
            transition={{ ...spring, delay: 0.45 }}>

            <div className="flex items-center justify-between">
              <span style={{ fontSize: 10, color: C.dim, letterSpacing: 4 }}>STATUS</span>
              <span style={{ color: C.ghost, fontSize: 12 }}>—</span>
            </div>

            {/* Large PRE-LAUNCH WAITLIST OPEN — dominant, matching original */}
            <div style={{
              border: `1px solid rgba(245,166,35,0.35)`,
              padding: '16px 18px',
              background: 'linear-gradient(135deg, #110a08, #0d0a12)',
              boxShadow: 'inset 0 0 28px rgba(245,166,35,0.04)',
            }}>
              <div className="flex items-start gap-3">
                <PulseDot color={C.orange} size={11} />
                <span style={{ color: C.orange, fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: 0.5 }}>
                  PRE-LAUNCH<br />WAITLIST OPEN
                </span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.8 }}>
              A catalog can earn from public performance,<br />
              mechanical reproduction, master revenue,<br />
              and negotiated sync licenses.
            </p>

            <div className="flex-1 flex flex-col justify-end gap-3">
              <div className="grid" style={{
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
                opacity: 0.72,
              }}>
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} style={{
                    height: 6,
                    borderRadius: 999,
                    background: i % 4 === 0 ? C.orange : i % 2 === 0 ? C.teal : C.purple,
                    opacity: i % 5 === 0 ? 0.42 : 0.7,
                  }} />
                ))}
              </div>

              <motion.button style={{
                padding: '10px 0', fontSize: 10, letterSpacing: 3, marginTop: 4,
                border: `1px solid ${C.border}`, color: C.dim,
                background: 'transparent', cursor: 'pointer', width: '100%',
                fontFamily: "'SpaceMono', monospace",
              }}
                whileHover={{ borderColor: C.teal, color: C.teal,
                  boxShadow: `0 0 18px rgba(0,212,168,0.14)`, transition: snappy }}
                whileTap={{ scale: 0.97, transition: springStiff }}>
                ACCESS BY INVITE ONLY
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ── Features Row ── */}
        <div className="flex" style={{ flexDirection: isTablet ? 'column' : 'row', borderBottom: `1px solid ${C.border}` }}>

          {/* What You Can Own — dotted outer border, matching original */}
          {[
            { title: 'RIGHTS THAT GENERATE ROYALTIES', items: RIGHTS },
            { title: 'WHO COLLECTS AND PAYS', items: COLLECTORS },
          ].map(({ title, items }) => (
            <div key={title} className="flex-1" style={{
              borderRight: isTablet ? 'none' : `1px solid ${C.border}`,
              borderBottom: isTablet ? `1px solid ${C.border}` : 'none',
              background: 'linear-gradient(180deg, #0b0b1c 0%, #080810 100%)',
            }}>
              {/* Dotted outer border inset — from original */}
              <div style={{ margin: isMobile ? 10 : 16, border: `1px dashed ${C.border}`, padding: isMobile ? '14px 12px' : '16px 14px' }}>
                <h3 style={{ fontSize: 11, color: C.dim, letterSpacing: 4,
                  marginBottom: 16, paddingBottom: 10,
                  borderBottom: `1px dashed #1c1c32` }}>{title}</h3>
                <FeatureList items={items} />
              </div>
            </div>
          ))}

          {/* Royalty Flow */}
          <div className="flex-1" style={{
            background: 'linear-gradient(180deg, #0b0b1c 0%, #080810 100%)',
          }}>
            <div style={{ margin: isMobile ? 10 : 16, border: `1px dashed ${C.border}`, padding: isMobile ? '14px 12px' : '16px 14px' }}>
              <h3 style={{ fontSize: 11, color: C.dim, letterSpacing: isMobile ? 2.3 : 4,
                marginBottom: 16, paddingBottom: 10,
                borderBottom: `1px dashed #1c1c32` }}>ROYALTY PAYOUT FLOW</h3>
              <RoyaltyChart />
              <motion.div className="flex gap-2 mt-4 flex-wrap"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
                transition={{ ...spring, delay: 0.2 }}>
                {FLOW_STEPS.map(({ label, sub, color }) => (
                  <div key={label} style={{
                    flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 8px)',
                    padding: '10px 12px',
                    border: `1px solid ${C.ghost}60`,
                    background: '#09091a',
                  }}>
                    <div style={{ fontSize: 13, color, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontSize: 9, color: C.dim, marginTop: 5, letterSpacing: 0.5, lineHeight: 1.55 }}>{sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="flex items-stretch" style={{ flexDirection: isTablet ? 'column' : 'row', borderBottom: `1px solid ${C.border}` }}>

          {/* Cassette panel */}
          <motion.div className="relative flex flex-col items-center justify-center gap-3"
            style={{
              width: isTablet ? '100%' : 292,
              padding: isMobile ? '24px 18px 22px' : '24px 20px',
              borderRight: isTablet ? 'none' : `1px solid ${C.border}`,
              borderBottom: isTablet ? `1px solid ${C.border}` : 'none',
              background: 'linear-gradient(155deg, #0f0620 0%, #070410 55%, #0c0518 100%)',
              overflow: 'hidden' }}
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ ...spring, delay: 0.1 }}>
            <div className="absolute pointer-events-none" style={{
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 42%, rgba(155,89,216,0.2) 0%, rgba(0,212,168,0.06) 45%, transparent 72%)',
            }} />
            <div style={{ width: '100%', maxWidth: 320, position: 'relative', zIndex: 1 }}>
              <Cassette />
            </div>
            <div className="flex flex-col items-center gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, transparent, ${C.purple}70, transparent)` }} />
              <span style={{ fontSize: 10, color: C.sub, letterSpacing: isMobile ? 1.6 : 2.8, textAlign: 'center' }}>ROYALTY SIGNAL</span>
              <span style={{ fontSize: 9, color: C.dim, letterSpacing: isMobile ? 1.1 : 1.8, textAlign: 'center' }}>RIGHTS, USAGE, COLLECTION, PAYOUT</span>
            </div>
          </motion.div>

          {/* CTA area */}
          <motion.div className="flex-1 flex flex-col justify-center"
            style={{ padding: isMobile ? '26px 18px 28px' : '36px 48px', background: 'linear-gradient(135deg, #080610 0%, #060508 100%)' }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            transition={{ delayChildren: 0.15, staggerChildren: 0.1 }}>

            <motion.p variants={upItem} style={{
              fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: 0.5, marginBottom: 8, lineHeight: 1.25,
            }}>
              Follow the money.<br />Then price the catalog.
            </motion.p>
            <motion.p variants={upItem} style={{ fontSize: 12, color: C.dim, letterSpacing: 0.5, marginBottom: 24, lineHeight: 1.75 }}>
              Streaming, radio, live venues, sync licenses, and downloads do not pay through one pipe. The useful map is source, right, collector, split, payout.
            </motion.p>

            <motion.div variants={upItem} className="flex gap-3"
              style={{ marginBottom: 16, flexDirection: isMobile ? 'column' : 'row' }}>
              <motion.button className="flex-1 cursor-pointer border-0"
                style={{ padding: isMobile ? '17px 10px' : '20px 0', fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: isMobile ? 1.6 : 3,
                  color: '#04080a', background: `linear-gradient(135deg, ${C.teal}, #00b890)`,
                  fontFamily: "'SpaceMono', monospace" }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 52px rgba(0,212,168,0.5), 0 8px 32px rgba(0,212,168,0.2)` }}
                whileTap={{ scale: 0.97 }} transition={springBouncy}>
                JOIN WAITLIST →
              </motion.button>
              <motion.button className="flex-1 cursor-pointer border-0"
                style={{ padding: isMobile ? '17px 10px' : '20px 0', fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: isMobile ? 1.6 : 3,
                  color: '#f0e8ff', background: `linear-gradient(135deg, ${C.purple}, #7a38b8)`,
                  fontFamily: "'SpaceMono', monospace" }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 52px rgba(155,89,216,0.5), 0 8px 32px rgba(155,89,216,0.2)` }}
                whileTap={{ scale: 0.97 }} transition={springBouncy}>
                READ ROYALTY MAP →
              </motion.button>
            </motion.div>

            <motion.div variants={upItem} className="flex items-center justify-end">
              <motion.button style={{
                fontSize: 10, letterSpacing: 2.5, color: C.dim,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: "'SpaceMono', monospace", fontWeight: 700,
              }}
                whileHover={{ color: C.sub, transition: snappy }}
                whileTap={{ scale: 0.97, transition: springStiff }}>
                EXPLORE PAYOUT MECHANICS →
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Status Bar ── */}
        <motion.div className="flex items-center justify-between"
          style={{
            padding: isMobile ? '12px' : '9px 20px',
            gap: isMobile ? 12 : 20,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            background: 'linear-gradient(180deg, #0a0a18, #06060c)',
            borderTop: `1px solid #10101e` }}
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SignalMark size={12} />
          <motion.div className="flex items-center" variants={stagger}
            style={{
              gap: isMobile ? 10 : 24,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
              order: isMobile ? 3 : 0,
              width: isMobile ? '100%' : 'auto',
            }}>
            {[
              { label: 'COMPOSITION + MASTER', color: C.teal, delay: 0 },
              { label: 'PRO / MLC / SX',       color: C.teal, delay: 0.5 },
              { label: 'WAITLIST ACTIVE',      color: C.orange, delay: 1.0 },
              { label: 'PAYOUT FLOW ONLINE',   color: C.teal, delay: 1.5 },
            ].map(({ label, color, delay }) => (
              <motion.div key={label} className="flex items-center gap-2" variants={upItem}
                style={{ fontSize: isMobile ? 8 : 10, letterSpacing: isMobile ? 1.4 : 3 }}>
                <span style={{ color: C.sub }}>{label}</span>
                <div className="rounded-full"
                  style={{ width: 6, height: 6, background: color, boxShadow: `0 0 5px ${color}`, opacity: delay === 1 ? 0.95 : 0.72 }} />
              </motion.div>
            ))}
          </motion.div>
          <span style={{ color: C.teal, fontSize: 11, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}>
            {timer}
          </span>
        </motion.div>

        <CrtBoot />
      </motion.div>
    </div>
  )
}
