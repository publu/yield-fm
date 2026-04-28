import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// ── Constants ─────────────────────────────────────────────────────────────────

const BAR_H = [0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.5, 0.95]

const OWNERSHIP = [
  {
    num: '01', title: 'PUBLISHING RIGHTS', desc: 'Composition & songwriter share', color: '#00d4a8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>,
  },
  {
    num: '02', title: 'MASTER RIGHTS', desc: 'Sound recordings & masters', color: '#9b59d8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><line x1="10.5" y1="12" x2="13.5" y2="12"/></svg>,
  },
  {
    num: '03', title: 'ROYALTY STREAMS', desc: 'Future cash flows from rights', color: '#00d4a8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M2 14 Q6 10 10 14 Q14 18 18 14 Q20 12 22 14"/><line x1="5" y1="14" x2="5" y2="20"/><line x1="9" y1="12" x2="9" y2="20"/><line x1="13" y1="14" x2="13" y2="20"/><line x1="17" y1="12" x2="17" y2="20"/></svg>,
  },
  {
    num: '04', title: 'CURATED CATALOGS', desc: 'Quality, history, and culture', color: '#9b59d8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  },
]

const EARNING = [
  {
    title: 'STREAMING', desc: 'DSP plays across the globe', color: '#00d4a8',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><polygon points="6,3 20,12 6,21" opacity="0.85"/></svg>,
  },
  {
    title: 'LICENSING', desc: 'Brand, media, & platform deals', color: '#9b59d8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>,
  },
  {
    title: 'PERFORMANCE', desc: 'Live, radio, & public performance', color: '#00d4a8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 2C8.5 2 6 5 6 8c0 3 2 6 6 7 4-1 6-4 6-7 0-3-2.5-6-6-6z"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="21" x2="16" y2="21"/></svg>,
  },
  {
    title: 'SYNC', desc: 'TV, film, games, & digital syncs', color: '#9b59d8',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="4" x2="8" y2="18"/><line x1="2" y1="11" x2="22" y2="11" strokeWidth="0.8" opacity="0.5"/></svg>,
  },
]

const CHART_LINES = [
  { color: '#00d4a8', amp: 14, freq: 2.3, phase: 0,   label: 'STREAMING' },
  { color: '#9b59d8', amp: 10, freq: 1.8, phase: 1.2, label: 'LICENSING' },
  { color: '#f5a623', amp: 12, freq: 2.6, phase: 0.7, label: 'PERFORMANCE' },
  { color: '#e8e8f0', amp:  8, freq: 1.5, phase: 2.1, label: 'SYNC' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePath(w, h, amp, freq, phase) {
  let d = ''
  for (let x = 0; x <= w; x += 4) {
    const y = h / 2 + amp * Math.sin((x / w) * Math.PI * freq + phase)
    d += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return d
}

// ── Primitives ────────────────────────────────────────────────────────────────

function WaveBars({ count = 8, color = '#00d4a8', height = 24 }) {
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {Array.from({ length: count }, (_, i) => {
        const base = BAR_H[i % BAR_H.length]
        return (
          <motion.div
            key={i}
            style={{ width: 3, background: color, originY: 1, borderRadius: 1 }}
            animate={{ scaleY: [base * 0.3, base, base * 0.5, base * 0.85, base * 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.11, ease: 'easeInOut' }}
            initial={{ scaleY: base, height }}
          />
        )
      })}
    </div>
  )
}

function PulseDot({ color = '#f5a623', size = 8 }) {
  return (
    <motion.div
      className="rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
      animate={{ opacity: [1, 0.25, 1] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    />
  )
}

// ── Vinyl Record ──────────────────────────────────────────────────────────────

function Vinyl() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      style={{ width: 180, height: 180 }}
    >
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="vg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#151528" />
            <stop offset="100%" stopColor="#080810" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="97" fill="url(#vg)" stroke="#1e1e3f" strokeWidth="1.5" />
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={i} cx="100" cy="100" r={90 - i * 3} fill="none" stroke="#12122a" strokeWidth="0.6" />
        ))}
        <path d="M 55 75 A 55 55 0 0 1 145 75" stroke="#00d4a8" strokeWidth="0.8" fill="none" opacity="0.15" />
        <circle cx="100" cy="100" r="35" fill="#0a0818" />
        <circle cx="100" cy="100" r="35" fill="none" stroke="#9b59d8" strokeWidth="0.8" opacity="0.4" />
        <circle cx="100" cy="100" r="28" fill="none" stroke="#00d4a8" strokeWidth="0.5" opacity="0.25" />
        <text x="100" y="98" textAnchor="middle" fill="#00d4a8" fontSize="7.5" fontFamily="Space Mono, monospace" letterSpacing="0.5">yield.fm</text>
        <text x="100" y="109" textAnchor="middle" fill="#9b59d8" fontSize="5" fontFamily="Space Mono, monospace">v0.1</text>
        <path d="M 100 65 A 35 35 0 0 1 135 100" stroke="#00d4a8" strokeWidth="1.5" fill="none" opacity="0.75" />
        <circle cx="100" cy="100" r="4.5" fill="#080810" />
      </svg>
    </motion.div>
  )
}

// ── Royalty Chart ─────────────────────────────────────────────────────────────

function RoyaltyChart() {
  const W = 270, H = 90
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        {CHART_LINES.map(({ color, amp, freq, phase }, idx) => {
          const d1 = makePath(W, H, amp, freq, phase)
          const d2 = makePath(W, H, amp * 0.65, freq, phase + 0.6)
          const dotX = W * 0.62
          const dotY = H / 2 + amp * Math.sin((dotX / W) * Math.PI * freq + phase)
          return (
            <g key={idx}>
              <motion.path
                d={d1}
                stroke={color}
                strokeWidth="1.5"
                fill="none"
                opacity={0.85}
                animate={{ d: [d1, d2, d1] }}
                transition={{ duration: 3.5 + idx * 0.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={dotX}
                cy={dotY}
                r="3"
                fill={color}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.35 }}
              />
            </g>
          )
        })}
      </svg>
      <div className="flex gap-3 flex-wrap mt-1">
        {CHART_LINES.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div style={{ width: 14, height: 1.5, background: color }} />
            <span style={{ fontSize: 8, color: '#6b6b8a', letterSpacing: 1 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Cassette ──────────────────────────────────────────────────────────────────

function Cassette() {
  const spokes = [0, 72, 144, 216, 288]
  const Reel = ({ cx, cy }) => (
    <g>
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{ originX: cx, originY: cy }}
      >
        <circle cx={cx} cy={cy} r={28} fill="#0d0818" stroke="#3d2060" strokeWidth="1.5" />
        {spokes.map(a => (
          <line
            key={a}
            x1={cx + 14 * Math.cos((a * Math.PI) / 180)}
            y1={cy + 14 * Math.sin((a * Math.PI) / 180)}
            x2={cx + 24 * Math.cos((a * Math.PI) / 180)}
            y2={cy + 24 * Math.sin((a * Math.PI) / 180)}
            stroke="#5a2a80"
            strokeWidth="1.5"
          />
        ))}
      </motion.g>
      <circle cx={cx} cy={cy} r={10} fill="#1a1030" stroke="#2d1a4e" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={4} fill="#080810" />
    </g>
  )

  return (
    <svg viewBox="0 0 320 150" style={{ width: '100%', height: '100%' }}>
      <rect x="3" y="3" width="314" height="144" rx="13" fill="#120820" stroke="#3d2060" strokeWidth="2" />
      <rect x="9" y="9" width="302" height="132" rx="9" fill="#0d0818" stroke="#2d1a4e" strokeWidth="1" />
      <rect x="54" y="20" width="212" height="80" rx="6" fill="#080810" stroke="#2d1a4e" strokeWidth="1" />
      <path d="M 90 92 Q 160 100 230 92" stroke="#3d2060" strokeWidth="1" fill="none" />
      <Reel cx={108} cy={60} />
      <Reel cx={212} cy={60} />
      <rect x="18" y="3" width="22" height="9" rx="3" fill="#080810" stroke="#3d2060" strokeWidth="1" />
      <rect x="280" y="3" width="22" height="9" rx="3" fill="#080810" stroke="#3d2060" strokeWidth="1" />
      <text x="160" y="122" textAnchor="middle" fill="#6b3a8a" fontSize="8" letterSpacing="3" fontFamily="Space Mono, monospace">THE WORLD'S SOUNDTRACK</text>
      <text x="160" y="136" textAnchor="middle" fill="#4d2a6a" fontSize="7" letterSpacing="2.5" fontFamily="Space Mono, monospace">BUILT FOR OWNERS // NOT RENTERS</text>
    </svg>
  )
}

// ── Timer hook ────────────────────────────────────────────────────────────────

function useTimer() {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const timer = useTimer()

  return (
    <div
      className="scan-overlay min-h-screen w-full flex items-center justify-center bg-[#080810] p-4 py-8"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <motion.div
        className="w-full border border-[#1e1e3f] rounded-lg overflow-hidden"
        style={{
          maxWidth: 1180,
          boxShadow: '0 0 80px rgba(0,212,168,0.06), 0 0 160px rgba(155,89,216,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* ── Title Bar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d1f] border-b border-[#1e1e3f]">
          <div className="flex items-center gap-3">
            <WaveBars count={5} height={14} color="#00d4a8" />
            <span className="text-[#4d4d6e] text-[11px] tracking-widest">
              yield.fm v0.1 // PROTOCOL PREVIEW
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              className="px-3 py-0.5 text-[11px] tracking-widest border border-[#f5a623] text-[#f5a623]"
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              PRE-LAUNCH
            </motion.div>
            <div className="flex items-center gap-2 text-[#2d2d4e]">
              <span className="text-xs cursor-pointer hover:text-[#6b6b8a] transition-colors">⊙</span>
              <span className="text-xs cursor-pointer hover:text-[#6b6b8a] transition-colors">□</span>
              <span className="text-xs cursor-pointer hover:text-[#6b6b8a] transition-colors">×</span>
            </div>
          </div>
        </div>

        {/* ── Hero Row ── */}
        <div className="flex border-b border-[#1e1e3f]" style={{ minHeight: 220 }}>

          {/* Hero Left */}
          <div className="flex-1 p-6 border-r border-[#1e1e3f] relative overflow-hidden">
            {/* Background bar chart */}
            <div className="absolute right-44 bottom-0 flex items-end gap-0.5 opacity-[0.12]">
              {[28, 45, 32, 60, 40, 72, 35, 55, 48, 68, 30, 52, 44, 62, 38, 50].map((h, i) => (
                <motion.div
                  key={i}
                  style={{ width: 7, background: '#00d4a8' }}
                  animate={{ height: [h * 0.4, h, h * 0.65, h * 0.85, h * 0.4] }}
                  transition={{ duration: 2.2 + i * 0.15, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>

            {/* Logo */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-end gap-0.5">
                {[10, 16, 22, 18, 12, 20, 15].map((h, i) => (
                  <motion.div
                    key={i}
                    style={{ width: 5, borderRadius: 1, background: i < 4 ? '#00d4a8' : '#9b59d8', originY: 1 }}
                    animate={{ scaleY: [0.3, 1, 0.55, 0.85, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }}
                    initial={{ height: h, scaleY: 0.5 }}
                  />
                ))}
              </div>
              <h1
                className="text-5xl font-bold tracking-tight"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span style={{
                  background: 'linear-gradient(90deg, #00d4a8 0%, #9b59d8 60%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>yield.</span>
                <span className="text-[#e8e8f0]">fm</span>
              </h1>
            </div>

            <p className="text-[#d0d0e8] text-base tracking-wide mb-3">
              Own music. Own publishing. Own master catalogs.
            </p>
            <div className="w-full h-px bg-[#1e1e3f] mb-4" />
            <p className="text-[#8080a0] text-sm leading-relaxed mb-2" style={{ maxWidth: 340 }}>
              A yield-bearing protocol for future ownership<br />
              of music royalties, streams, and curated<br />
              catalogs&mdash;designed for the next era of<br />
              music infrastructure.
            </p>
            <p className="text-[#00d4a8] text-sm">
              Catalogs can earn whether the market is up or down.
            </p>

            {/* Vinyl */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Vinyl />
            </div>
          </div>

          {/* Status Panel */}
          <div className="w-72 flex flex-col p-5 bg-[#0a0a18] gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[#4d4d6e] text-[10px] tracking-widest">STATUS</span>
              <span className="text-[#2d2d4e] text-xs">—</span>
            </div>

            <div className="border border-[#f5a623] border-opacity-25 p-4 bg-[#0e0a14]">
              <div className="flex items-start gap-2">
                <PulseDot color="#f5a623" />
                <span className="text-[#f5a623] text-sm font-bold leading-snug tracking-wider">
                  PRE-LAUNCH<br />WAITLIST OPEN
                </span>
              </div>
            </div>

            <p className="text-[#5a5a7a] text-xs leading-relaxed">
              We're indexing catalogs and<br />
              building the rails for the<br />
              future of royalty ownership.
            </p>

            <div className="flex-1 flex flex-col justify-end gap-3">
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map(row => (
                  <WaveBars
                    key={row}
                    count={4}
                    height={18}
                    color={row % 2 === 0 ? '#00d4a8' : '#9b59d8'}
                  />
                ))}
              </div>

              <motion.button
                className="w-full py-2 text-[10px] tracking-widest border border-[#2d2d4e] text-[#6b6b8a] mt-1 cursor-pointer bg-transparent"
                whileHover={{ borderColor: '#00d4a8', color: '#00d4a8' }}
                transition={{ duration: 0.15 }}
              >
                ACCESS BY INVITE ONLY
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Features Row ── */}
        <div className="flex border-b border-[#1e1e3f]">

          {/* What You Can Own */}
          <div className="flex-1 p-5 border-r border-[#1e1e3f]">
            <h3 className="text-[#4d4d6e] text-[10px] tracking-widest mb-4 pb-2 border-b border-dashed border-[#1e1e3f]">
              WHAT YOU CAN OWN
            </h3>
            <div className="flex flex-col gap-2">
              {OWNERSHIP.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded border border-transparent cursor-pointer"
                  whileHover={{ backgroundColor: '#0d0d1f', borderColor: '#1e1e3f' }}
                  transition={{ duration: 0.12 }}
                >
                  <div style={{ color: item.color }} className="shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <div className="text-[#d0d0e8] text-[11px] font-bold tracking-wide">{item.title}</div>
                    <div className="text-[#5a5a7a] text-[10px] mt-0.5">{item.desc}</div>
                  </div>
                  <span className="text-[#2d2d4e] text-[11px] font-bold shrink-0">{item.num}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How Catalogs Earn */}
          <div className="flex-1 p-5 border-r border-[#1e1e3f]">
            <h3 className="text-[#4d4d6e] text-[10px] tracking-widest mb-4 pb-2 border-b border-dashed border-[#1e1e3f]">
              HOW CATALOGS EARN
            </h3>
            <div className="flex flex-col gap-2">
              {EARNING.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded border border-transparent cursor-pointer"
                  whileHover={{ backgroundColor: '#0d0d1f', borderColor: '#1e1e3f' }}
                  transition={{ duration: 0.12 }}
                >
                  <div style={{ color: item.color }} className="shrink-0">{item.icon}</div>
                  <div>
                    <div className="text-[#d0d0e8] text-[11px] font-bold tracking-wide">{item.title}</div>
                    <div className="text-[#5a5a7a] text-[10px] mt-0.5">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Royalty Flow */}
          <div className="flex-1 p-5">
            <h3 className="text-[#4d4d6e] text-[10px] tracking-widest mb-4 pb-2 border-b border-dashed border-[#1e1e3f]">
              ROYALTY FLOW (CONCEPTUAL)
            </h3>
            <RoyaltyChart />
            <div className="mt-4 p-3 border-l-2 border-[#9b59d8] bg-[#0d0a18]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[#9b59d8] text-2xl font-bold leading-none">"</span>
                  <p className="text-[#00d4a8] text-[11px] leading-relaxed font-bold mt-0.5">
                    Diverse sources.<br />
                    Durable demand.<br />
                    Market-neutral exposure.
                  </p>
                </div>
                <span className="text-[#9b59d8] text-3xl opacity-25 shrink-0 mt-1">♪</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="flex items-stretch border-b border-[#1e1e3f]">
          {/* Cassette */}
          <div
            className="border-r border-[#1e1e3f] flex items-center justify-center p-4"
            style={{ width: 300 }}
          >
            <div style={{ width: 270 }}>
              <Cassette />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex-1 flex flex-col justify-center gap-4 p-6">
            <div className="flex gap-3 items-stretch">
              <motion.button
                className="flex-1 py-4 text-sm font-bold tracking-widest text-[#080810] cursor-pointer border-0"
                style={{ background: '#00d4a8' }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(0,212,168,0.45)' }}
                whileTap={{ scale: 0.97 }}
              >
                JOIN WAITLIST →
              </motion.button>
              <motion.button
                className="flex-1 py-4 text-sm font-bold tracking-widest text-[#e8e8f0] cursor-pointer border-0"
                style={{ background: '#9b59d8' }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(155,89,216,0.45)' }}
                whileTap={{ scale: 0.97 }}
              >
                READ THESIS →
              </motion.button>
              <motion.button
                className="px-5 py-4 text-[11px] font-bold tracking-widest border border-[#2d2d4e] text-[#8080a0] bg-transparent cursor-pointer"
                whileHover={{ borderColor: '#6b6b8a', color: '#d0d0e8' }}
                whileTap={{ scale: 0.97 }}
                style={{ lineHeight: 1.4 }}
              >
                EXPLORE<br />MECHANICS →
              </motion.button>
            </div>
            <p className="text-[#3d3d5e] text-[11px] tracking-wide text-center">
              Be first in line for early access, updates, and protocol releases.
            </p>
          </div>
        </div>

        {/* ── Status Bar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a18]">
          <WaveBars count={5} height={12} color="#00d4a8" />
          <div className="flex items-center gap-5 text-[10px] tracking-widest">
            {[
              { label: 'INDEXING CATALOGS',       color: '#00d4a8', delay: 0 },
              { label: 'BUILDING RAILS',           color: '#00d4a8', delay: 0.4 },
              { label: 'WAITLIST ACTIVE',          color: '#f5a623', delay: 0.8 },
              { label: 'MARKET-NEUTRAL EXPOSURE',  color: '#00d4a8', delay: 1.2 },
            ].map(({ label, color, delay }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[#4d4d6e]">{label}</span>
                <motion.div
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: color }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay }}
                />
              </div>
            ))}
          </div>
          <span className="text-[#00d4a8] text-[11px] font-mono tracking-widest tabular-nums">
            {timer}
          </span>
        </div>

      </motion.div>
    </div>
  )
}
