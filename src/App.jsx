import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// ── Constants ─────────────────────────────────────────────────────────────────

const BAR_H = [0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.5, 0.95]

const OWNERSHIP = [
  {
    num: '01', title: 'PUBLISHING RIGHTS', desc: 'Composition & songwriter share', color: '#00d4a8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/>
        <line x1="8" y1="16" x2="12" y2="16"/>
      </svg>
    ),
  },
  {
    num: '02', title: 'MASTER RIGHTS', desc: 'Sound recordings & masters', color: '#9b59d8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/>
        <line x1="10.5" y1="12" x2="13.5" y2="12"/>
      </svg>
    ),
  },
  {
    num: '03', title: 'ROYALTY STREAMS', desc: 'Future cash flows from rights', color: '#00d4a8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M2 14 Q6 10 10 14 Q14 18 18 14 Q20 12 22 14"/>
        <line x1="5" y1="14" x2="5" y2="20"/><line x1="9" y1="12" x2="9" y2="20"/>
        <line x1="13" y1="14" x2="13" y2="20"/><line x1="17" y1="12" x2="17" y2="20"/>
      </svg>
    ),
  },
  {
    num: '04', title: 'CURATED CATALOGS', desc: 'Quality, history, and culture', color: '#9b59d8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
]

const EARNING = [
  {
    title: 'STREAMING', desc: 'DSP plays across the globe', color: '#00d4a8',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><polygon points="6,3 20,12 6,21" opacity="0.9"/></svg>,
  },
  {
    title: 'LICENSING', desc: 'Brand, media, & platform deals', color: '#9b59d8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>
      </svg>
    ),
  },
  {
    title: 'PERFORMANCE', desc: 'Live, radio, & public performance', color: '#00d4a8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 2C8.5 2 6 5 6 8c0 3 2 6 6 7 4-1 6-4 6-7 0-3-2.5-6-6-6z"/>
        <line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="21" x2="16" y2="21"/>
      </svg>
    ),
  },
  {
    title: 'SYNC', desc: 'TV, film, games, & digital syncs', color: '#9b59d8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="4" width="20" height="14" rx="2"/>
        <line x1="8" y1="4" x2="8" y2="18"/>
        <line x1="2" y1="11" x2="22" y2="11" strokeWidth="0.8" opacity="0.4"/>
      </svg>
    ),
  },
]

const CHART_LINES = [
  { color: '#00d4a8', amp: 18, freq: 2.2, phase: 0,   label: 'STREAMING' },
  { color: '#9b59d8', amp: 13, freq: 1.8, phase: 1.2, label: 'LICENSING' },
  { color: '#f5a623', amp: 15, freq: 2.6, phase: 0.7, label: 'PERFORMANCE' },
  { color: '#c0c0d8', amp:  9, freq: 1.5, phase: 2.1, label: 'SYNC' },
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

// ── Primitives ────────────────────────────────────────────────────────────────

function WaveBars({ count = 8, color = '#00d4a8', height = 28, gap = 2 }) {
  return (
    <div className="flex items-end" style={{ height, gap }}>
      {Array.from({ length: count }, (_, i) => {
        const base = BAR_H[i % BAR_H.length]
        return (
          <motion.div
            key={i}
            style={{ width: 3, background: color, originY: 1, borderRadius: 1 }}
            animate={{ scaleY: [base * 0.25, base, base * 0.45, base * 0.82, base * 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.115, ease: 'easeInOut' }}
            initial={{ height, scaleY: base * 0.5 }}
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
      style={{ width: size, height: size, background: color, boxShadow: `0 0 6px ${color}` }}
      animate={{ opacity: [1, 0.2, 1], scale: [1, 0.85, 1] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    />
  )
}

// ── Vinyl Record ──────────────────────────────────────────────────────────────

function Vinyl() {
  return (
    <div className="relative" style={{ width: 240, height: 240 }}>
      {/* Atmosphere glow behind the disc */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,212,168,0.08) 0%, rgba(155,89,216,0.06) 40%, transparent 70%)',
          filter: 'blur(12px)',
          transform: 'scale(1.3)',
        }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        style={{ width: 240, height: 240 }}
      >
        <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 18px rgba(0,212,168,0.18)) drop-shadow(0 0 40px rgba(155,89,216,0.10))' }}>
          <defs>
            <radialGradient id="vg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#18182e" />
              <stop offset="60%" stopColor="#0e0e20" />
              <stop offset="100%" stopColor="#08080e" />
            </radialGradient>
            <radialGradient id="labelGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#1a0e2e" />
              <stop offset="100%" stopColor="#08080e" />
            </radialGradient>
          </defs>

          {/* Outer body */}
          <circle cx="120" cy="120" r="117" fill="url(#vg)" stroke="#1a1a30" strokeWidth="1.5" />

          {/* Groove rings */}
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx="120" cy="120" r={108 - i * 3} fill="none"
              stroke={i % 4 === 0 ? '#161630' : '#0e0e22'} strokeWidth={i % 4 === 0 ? 0.8 : 0.4} />
          ))}

          {/* Glowing arc highlight (non-rotating feel) */}
          <path d="M 58 88 A 75 75 0 0 1 182 88" stroke="#00d4a8" strokeWidth="1" fill="none" opacity="0.12" />

          {/* Label disc */}
          <circle cx="120" cy="120" r="42" fill="url(#labelGrad)" />
          <circle cx="120" cy="120" r="42" fill="none" stroke="#9b59d8" strokeWidth="0.8" opacity="0.5" />
          <circle cx="120" cy="120" r="34" fill="none" stroke="#00d4a8" strokeWidth="0.5" opacity="0.3" />

          {/* Label text */}
          <text x="120" y="116" textAnchor="middle" fill="#00d4a8" fontSize="9" fontFamily="Space Mono, monospace" letterSpacing="1">yield.fm</text>
          <text x="120" y="128" textAnchor="middle" fill="#9b59d8" fontSize="6" fontFamily="Space Mono, monospace" opacity="0.8">v0.1</text>

          {/* Spinning highlight arc on label */}
          <path d="M 120 78 A 42 42 0 0 1 162 120" stroke="#00d4a8" strokeWidth="2" fill="none" opacity="0.8" strokeLinecap="round" />
          <path d="M 120 78 A 42 42 0 0 1 162 120" stroke="#00d4a8" strokeWidth="6" fill="none" opacity="0.1" strokeLinecap="round" />

          {/* Center hole */}
          <circle cx="120" cy="120" r="5.5" fill="#06060c" />
          <circle cx="120" cy="120" r="5.5" fill="none" stroke="#1e1e3f" strokeWidth="0.8" />
        </svg>
      </motion.div>
    </div>
  )
}

// ── Royalty Flow Chart ────────────────────────────────────────────────────────

function RoyaltyChart() {
  const W = 290, H = 110
  return (
    <div>
      {/* Subtle grid */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={H * f} x2={W} y2={H * f}
            stroke="#1a1a30" strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
        {/* Chart lines */}
        {CHART_LINES.map(({ color, amp, freq, phase }, idx) => {
          const d1 = makePath(W, H, amp, freq, phase)
          const d2 = makePath(W, H, amp * 0.6, freq, phase + 0.65)
          const dotX = W * 0.62
          const dotY = H / 2 + amp * Math.sin((dotX / W) * Math.PI * freq + phase)
          return (
            <g key={idx}>
              {/* Glow layer */}
              <motion.path d={d1} stroke={color} strokeWidth="4" fill="none" opacity={0.08}
                animate={{ d: [d1, d2, d1] }}
                transition={{ duration: 3.8 + idx * 0.55, repeat: Infinity, ease: 'easeInOut' }} />
              {/* Main line */}
              <motion.path d={d1} stroke={color} strokeWidth="1.5" fill="none" opacity={0.9}
                animate={{ d: [d1, d2, d1] }}
                transition={{ duration: 3.8 + idx * 0.55, repeat: Infinity, ease: 'easeInOut' }} />
              {/* Dot */}
              <motion.circle cx={dotX} cy={dotY} r="3.5" fill={color}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                animate={{ opacity: [1, 0.3, 1], r: [3.5, 2.5, 3.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }} />
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div className="flex gap-4 flex-wrap mt-2">
        {CHART_LINES.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 14, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 9, color: '#5a5a7a', letterSpacing: 1.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Cassette ──────────────────────────────────────────────────────────────────

function Cassette() {
  const spokes = [0, 72, 144, 216, 288]
  function Reel({ cx, cy }) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={30} fill="#0a0616" stroke="#3d206080" strokeWidth="1.5" />
        <motion.g
          style={{ originX: cx + 'px', originY: cy + 'px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          {spokes.map(a => (
            <line key={a}
              x1={cx + 12 * Math.cos((a * Math.PI) / 180)}
              y1={cy + 12 * Math.sin((a * Math.PI) / 180)}
              x2={cx + 26 * Math.cos((a * Math.PI) / 180)}
              y2={cy + 26 * Math.sin((a * Math.PI) / 180)}
              stroke="#5a2a8880" strokeWidth="2" strokeLinecap="round" />
          ))}
        </motion.g>
        <circle cx={cx} cy={cy} r={11} fill="#130a20" stroke="#2d1a4e" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={4.5} fill="#080810" />
        <circle cx={cx} cy={cy} r={11} fill="none" stroke="#9b59d840" strokeWidth="0.5" />
      </g>
    )
  }
  return (
    <svg viewBox="0 0 320 148" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="cassBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16082a" />
          <stop offset="100%" stopColor="#0a0616" />
        </linearGradient>
      </defs>
      {/* Body */}
      <rect x="3" y="3" width="314" height="142" rx="12" fill="url(#cassBg)" stroke="#4a2270" strokeWidth="1.5" />
      <rect x="8" y="8" width="304" height="132" rx="8" fill="none" stroke="#2d1a4e60" strokeWidth="1" />

      {/* Window frame */}
      <rect x="52" y="18" width="216" height="82" rx="6" fill="#06040e" stroke="#2d1a4e" strokeWidth="1.5" />
      <rect x="55" y="21" width="210" height="76" rx="4" fill="#08060f" stroke="#1a0e2e80" strokeWidth="0.5" />

      {/* Tape path curve */}
      <path d="M 85 94 Q 160 104 235 94" stroke="#3d206060" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Reels */}
      <Reel cx={108} cy={60} />
      <Reel cx={212} cy={60} />

      {/* Top notches */}
      <rect x="20" y="2" width="24" height="10" rx="3" fill="#08060f" stroke="#3d2060" strokeWidth="1" />
      <rect x="276" y="2" width="24" height="10" rx="3" fill="#08060f" stroke="#3d2060" strokeWidth="1" />

      {/* Corner detail circles */}
      <circle cx="20" cy="130" r="6" fill="#08060f" stroke="#2d1a4e" strokeWidth="1" />
      <circle cx="300" cy="130" r="6" fill="#08060f" stroke="#2d1a4e" strokeWidth="1" />

      {/* Labels */}
      <text x="160" y="120" textAnchor="middle" fill="#6b3a8a" fontSize="8" letterSpacing="3.5"
        fontFamily="Space Mono, monospace" fontWeight="700">THE WORLD'S SOUNDTRACK</text>
      <text x="160" y="134" textAnchor="middle" fill="#3d1a5a" fontSize="7" letterSpacing="2.5"
        fontFamily="Space Mono, monospace">BUILT FOR OWNERS // NOT RENTERS</text>
    </svg>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const timer = useTimer()

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 py-8"
      style={{
        fontFamily: "'Space Mono', monospace",
        background: 'radial-gradient(ellipse at 50% 0%, #0d0d22 0%, #080810 60%)',
      }}
    >
      <motion.div
        className="w-full rounded-xl overflow-hidden"
        style={{
          maxWidth: 1200,
          border: '1px solid #1e1e3f',
          boxShadow:
            '0 0 0 1px #0d0d1f, 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(0,212,168,0.05), 0 0 160px rgba(155,89,216,0.04)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >

        {/* ── Title Bar ── */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{
            background: 'linear-gradient(180deg, #111124 0%, #0d0d1f 100%)',
            borderBottom: '1px solid #1e1e3f',
          }}
        >
          <div className="flex items-center gap-3">
            <WaveBars count={5} height={14} color="#00d4a8" gap={2} />
            <span style={{ fontSize: 11, color: '#3d3d5e', letterSpacing: 3 }}>
              yield.fm v0.1 // PROTOCOL PREVIEW
            </span>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              style={{
                fontSize: 11, letterSpacing: 3, padding: '3px 10px',
                border: '1px solid #f5a623', color: '#f5a623',
                boxShadow: '0 0 12px rgba(245,166,35,0.2)',
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              PRE-LAUNCH
            </motion.div>
            <div className="flex items-center gap-2.5" style={{ color: '#2a2a42' }}>
              <span className="cursor-pointer hover:text-[#6b6b8a] transition-colors" style={{ fontSize: 13 }}>⊙</span>
              <span className="cursor-pointer hover:text-[#6b6b8a] transition-colors" style={{ fontSize: 13 }}>□</span>
              <span className="cursor-pointer hover:text-[#6b6b8a] transition-colors" style={{ fontSize: 13 }}>×</span>
            </div>
          </div>
        </div>

        {/* ── Hero Row ── */}
        <div className="flex" style={{ borderBottom: '1px solid #1e1e3f' }}>

          {/* Hero Left */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              padding: '36px 36px 32px',
              borderRight: '1px solid #1e1e3f',
              background: 'linear-gradient(135deg, #0d0d22 0%, #080810 50%, #0a0818 100%)',
            }}
          >
            {/* Ambient glow behind vinyl area */}
            <div
              className="absolute pointer-events-none"
              style={{
                right: 60, top: 20,
                width: 280, height: 280,
                background: 'radial-gradient(circle, rgba(155,89,216,0.07) 0%, rgba(0,212,168,0.04) 40%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* Background bar chart */}
            <div className="absolute flex items-end gap-1 pointer-events-none" style={{ right: 230, bottom: 0, opacity: 0.14 }}>
              {[32, 52, 28, 68, 44, 78, 36, 58, 50, 72, 34, 55, 46, 65, 40, 54, 42, 60].map((h, i) => (
                <motion.div key={i}
                  style={{ width: 7, background: 'linear-gradient(to top, #00d4a8, #9b59d8)' }}
                  animate={{ height: [h * 0.4, h, h * 0.6, h * 0.88, h * 0.4] }}
                  transition={{ duration: 2.4 + i * 0.12, repeat: Infinity, delay: i * 0.07 }}
                />
              ))}
            </div>

            {/* Logo */}
            <div className="flex items-center gap-5 mb-6">
              <div className="flex items-end gap-1">
                {[16, 26, 36, 30, 22, 32, 24].map((h, i) => (
                  <motion.div key={i}
                    style={{
                      width: 6, borderRadius: 2, originY: 1,
                      background: i < 4
                        ? `linear-gradient(to top, #00b890, #00d4a8)`
                        : `linear-gradient(to top, #7a3ab8, #9b59d8)`,
                    }}
                    animate={{ scaleY: [0.25, 1, 0.5, 0.88, 0.25] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }}
                    initial={{ height: h, scaleY: 0.5 }}
                  />
                ))}
              </div>
              <h1
                style={{
                  fontSize: 72, fontWeight: 700, lineHeight: 1,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '-2px',
                }}
              >
                <span style={{
                  background: 'linear-gradient(90deg, #00d4a8 0%, #7a4ad8 70%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>yield.</span>
                <span style={{ color: '#e8e8f0' }}>fm</span>
              </h1>
            </div>

            <p style={{ fontSize: 17, color: '#c8c8e0', letterSpacing: '0.04em', marginBottom: 16 }}>
              Own music. Own publishing. Own master catalogs.
            </p>

            <div style={{ height: 1, background: 'linear-gradient(90deg, #2a2a4a, transparent)', marginBottom: 20 }} />

            <p style={{ fontSize: 13, color: '#7070a0', lineHeight: 1.8, marginBottom: 12, maxWidth: 360 }}>
              A yield-bearing protocol for future ownership<br />
              of music royalties, streams, and curated<br />
              catalogs&mdash;designed for the next era of<br />
              music infrastructure.
            </p>
            <p style={{ fontSize: 13, color: '#00d4a8', letterSpacing: '0.02em' }}>
              Catalogs can earn whether the market is up or down.
            </p>

            {/* Vinyl — absolute right */}
            <div className="absolute" style={{ right: 32, top: '50%', transform: 'translateY(-52%)' }}>
              <Vinyl />
            </div>
          </div>

          {/* Status Panel */}
          <div
            className="flex flex-col gap-4"
            style={{
              width: 288, padding: '24px 22px',
              background: 'linear-gradient(180deg, #09091a 0%, #080810 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 10, color: '#3d3d5e', letterSpacing: 4 }}>STATUS</span>
              <span style={{ color: '#2a2a3e', fontSize: 12 }}>—</span>
            </div>

            <div style={{
              border: '1px solid rgba(245,166,35,0.3)',
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #110a08, #0d0a10)',
              boxShadow: 'inset 0 0 20px rgba(245,166,35,0.04)',
            }}>
              <div className="flex items-start gap-2.5">
                <PulseDot color="#f5a623" />
                <span style={{ color: '#f5a623', fontSize: 14, fontWeight: 700, lineHeight: 1.4, letterSpacing: 1 }}>
                  PRE-LAUNCH<br />WAITLIST OPEN
                </span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#484868', lineHeight: 1.8 }}>
              We're indexing catalogs and<br />
              building the rails for the<br />
              future of royalty ownership.
            </p>

            <div className="flex-1 flex flex-col justify-end gap-3">
              {/* Waveform grid */}
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(row => (
                  <WaveBars key={row} count={4} height={20} color={row % 2 === 0 ? '#00d4a8' : '#9b59d8'} gap={2} />
                ))}
              </div>

              <motion.button
                className="w-full cursor-pointer"
                style={{
                  padding: '9px 0', fontSize: 10, letterSpacing: 3,
                  border: '1px solid #252540', color: '#5a5a7a',
                  background: 'transparent', marginTop: 4,
                }}
                whileHover={{
                  borderColor: '#00d4a8', color: '#00d4a8',
                  boxShadow: '0 0 16px rgba(0,212,168,0.15)',
                }}
                transition={{ duration: 0.15 }}
              >
                ACCESS BY INVITE ONLY
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Features Row ── */}
        <div className="flex" style={{ borderBottom: '1px solid #1e1e3f' }}>

          {/* What You Can Own */}
          <div
            className="flex-1"
            style={{
              padding: '22px 24px',
              borderRight: '1px solid #1e1e3f',
              background: 'linear-gradient(180deg, #0c0c1e 0%, #080810 100%)',
            }}
          >
            <h3 style={{
              fontSize: 10, color: '#3a3a5a', letterSpacing: 4,
              marginBottom: 18, paddingBottom: 10,
              borderBottom: '1px dashed #1a1a30',
            }}>WHAT YOU CAN OWN</h3>
            <div className="flex flex-col gap-1">
              {OWNERSHIP.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer rounded"
                  style={{ padding: '9px 10px', border: '1px solid transparent' }}
                  whileHover={{
                    backgroundColor: '#0d0d20',
                    borderColor: '#1e1e3f',
                    boxShadow: `inset 2px 0 0 ${item.color}`,
                  }}
                  transition={{ duration: 0.12 }}
                >
                  <div style={{ color: item.color }} className="shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <div style={{ fontSize: 11, color: '#c0c0d8', fontWeight: 700, letterSpacing: 1 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: '#484868', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#282840', fontWeight: 700 }}>{item.num}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How Catalogs Earn */}
          <div
            className="flex-1"
            style={{
              padding: '22px 24px',
              borderRight: '1px solid #1e1e3f',
              background: 'linear-gradient(180deg, #0c0c1e 0%, #080810 100%)',
            }}
          >
            <h3 style={{
              fontSize: 10, color: '#3a3a5a', letterSpacing: 4,
              marginBottom: 18, paddingBottom: 10,
              borderBottom: '1px dashed #1a1a30',
            }}>HOW CATALOGS EARN</h3>
            <div className="flex flex-col gap-1">
              {EARNING.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer rounded"
                  style={{ padding: '9px 10px', border: '1px solid transparent' }}
                  whileHover={{
                    backgroundColor: '#0d0d20',
                    borderColor: '#1e1e3f',
                    boxShadow: `inset 2px 0 0 ${item.color}`,
                  }}
                  transition={{ duration: 0.12 }}
                >
                  <div style={{ color: item.color }} className="shrink-0">{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: '#c0c0d8', fontWeight: 700, letterSpacing: 1 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: '#484868', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Royalty Flow */}
          <div
            className="flex-1"
            style={{
              padding: '22px 24px',
              background: 'linear-gradient(180deg, #0c0c1e 0%, #080810 100%)',
            }}
          >
            <h3 style={{
              fontSize: 10, color: '#3a3a5a', letterSpacing: 4,
              marginBottom: 18, paddingBottom: 10,
              borderBottom: '1px dashed #1a1a30',
            }}>ROYALTY FLOW (CONCEPTUAL)</h3>
            <RoyaltyChart />
            <div
              style={{
                marginTop: 16, padding: '14px 16px',
                borderLeft: '2px solid #9b59d8',
                background: 'linear-gradient(135deg, #0e0a1e, #09090f)',
                boxShadow: 'inset 0 0 20px rgba(155,89,216,0.04)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span style={{ color: '#9b59d8', fontSize: 22, lineHeight: 1, fontWeight: 700 }}>"</span>
                  <p style={{ color: '#00d4a8', fontSize: 11, lineHeight: 1.7, fontWeight: 700, marginTop: 4 }}>
                    Diverse sources.<br />
                    Durable demand.<br />
                    Market-neutral exposure.
                  </p>
                </div>
                <span style={{ color: '#9b59d8', fontSize: 28, opacity: 0.2, marginTop: 4 }}>♪</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="flex items-stretch" style={{ borderBottom: '1px solid #1e1e3f' }}>
          {/* Cassette */}
          <div
            className="flex items-center justify-center"
            style={{
              width: 310, padding: '20px 24px',
              borderRight: '1px solid #1e1e3f',
              background: 'linear-gradient(135deg, #0e0820, #080810)',
            }}
          >
            <div style={{ width: 280 }}>
              <Cassette />
            </div>
          </div>

          {/* CTAs */}
          <div
            className="flex-1 flex flex-col justify-center gap-5"
            style={{ padding: '28px 32px', background: '#08080f' }}
          >
            <div className="flex gap-4 items-stretch">
              <motion.button
                className="flex-1 cursor-pointer border-0"
                style={{
                  padding: '18px 24px', fontSize: 13, fontWeight: 700,
                  letterSpacing: 3, color: '#080810',
                  background: 'linear-gradient(135deg, #00d4a8, #00b890)',
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 40px rgba(0,212,168,0.5), 0 8px 32px rgba(0,212,168,0.2)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                JOIN WAITLIST →
              </motion.button>
              <motion.button
                className="flex-1 cursor-pointer border-0"
                style={{
                  padding: '18px 24px', fontSize: 13, fontWeight: 700,
                  letterSpacing: 3, color: '#e8e8f0',
                  background: 'linear-gradient(135deg, #9b59d8, #7a3ab8)',
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 40px rgba(155,89,216,0.5), 0 8px 32px rgba(155,89,216,0.2)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                READ THESIS →
              </motion.button>
              <motion.button
                className="cursor-pointer"
                style={{
                  padding: '18px 20px', fontSize: 11, fontWeight: 700,
                  letterSpacing: 2, color: '#6060a0', lineHeight: 1.5,
                  border: '1px solid #252540', background: 'transparent',
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{
                  borderColor: '#5050a0', color: '#a0a0d0',
                  boxShadow: '0 0 20px rgba(100,100,200,0.1)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                EXPLORE<br />MECHANICS →
              </motion.button>
            </div>
            <p style={{ fontSize: 11, color: '#30304a', letterSpacing: 1, textAlign: 'center' }}>
              Be first in line for early access, updates, and protocol releases.
            </p>
          </div>
        </div>

        {/* ── Status Bar ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '8px 20px',
            background: 'linear-gradient(180deg, #09091a, #080810)',
            borderTop: '1px solid #12122a',
          }}
        >
          <WaveBars count={5} height={12} color="#00d4a8" gap={2} />
          <div className="flex items-center gap-6" style={{ fontSize: 10, letterSpacing: 3 }}>
            {[
              { label: 'INDEXING CATALOGS',      color: '#00d4a8', delay: 0 },
              { label: 'BUILDING RAILS',          color: '#00d4a8', delay: 0.5 },
              { label: 'WAITLIST ACTIVE',         color: '#f5a623', delay: 1.0 },
              { label: 'MARKET-NEUTRAL EXPOSURE', color: '#00d4a8', delay: 1.5 },
            ].map(({ label, color, delay }) => (
              <div key={label} className="flex items-center gap-2">
                <span style={{ color: '#383858' }}>{label}</span>
                <motion.div
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: color, boxShadow: `0 0 4px ${color}` }}
                  animate={{ opacity: [1, 0.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay }}
                />
              </div>
            ))}
          </div>
          <span style={{ color: '#00d4a8', fontSize: 11, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}>
            {timer}
          </span>
        </div>

      </motion.div>
    </div>
  )
}
