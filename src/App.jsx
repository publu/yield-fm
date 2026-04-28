import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ── Spring presets (framer-motion-animator) ───────────────────────────────────

const spring     = { type: 'spring', stiffness: 300, damping: 24 }
const springBouncy = { type: 'spring', stiffness: 500, damping: 15 }
const springStiff  = { type: 'spring', stiffness: 700, damping: 30 }
const snappy     = { type: 'tween', duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }

// ── Stagger variants (framer-motion-animator) ─────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const fadeSlideItem = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: spring },
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: spring },
}

// ── Color tokens (framer-ui-skills) ──────────────────────────────────────────
// surface-base: #000000 | surface-raised: #141415 | border-default: #1e1e2e

const C = {
  base:      '#000000',
  raised:    '#0e0e12',
  panel:     '#111116',
  border:    '#1e1e2e',
  borderDim: '#141418',
  teal:      '#00d4a8',
  purple:    '#9b59d8',
  orange:    '#f5a623',
  text:      '#d0d0e4',
  dim:       '#4a4a6a',
  dimmer:    '#2a2a3e',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const BAR_H = [0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.5, 0.95]

const OWNERSHIP = [
  { num: '01', title: 'PUBLISHING RIGHTS',  desc: 'Composition & songwriter share', color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg> },
  { num: '02', title: 'MASTER RIGHTS',      desc: 'Sound recordings & masters',     color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><line x1="10.5" y1="12" x2="13.5" y2="12"/></svg> },
  { num: '03', title: 'ROYALTY STREAMS',    desc: 'Future cash flows from rights',  color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M2 14 Q6 10 10 14 Q14 18 18 14 Q20 12 22 14"/><line x1="5" y1="14" x2="5" y2="20"/><line x1="9" y1="12" x2="9" y2="20"/><line x1="13" y1="14" x2="13" y2="20"/><line x1="17" y1="12" x2="17" y2="20"/></svg> },
  { num: '04', title: 'CURATED CATALOGS',   desc: 'Quality, history, and culture',  color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg> },
]

const EARNING = [
  { title: 'STREAMING',    desc: 'DSP plays across the globe',         color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><polygon points="6,3 20,12 6,21" opacity="0.9"/></svg> },
  { title: 'LICENSING',    desc: 'Brand, media, & platform deals',     color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg> },
  { title: 'PERFORMANCE',  desc: 'Live, radio, & public performance',  color: C.teal,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M12 2C8.5 2 6 5 6 8c0 3 2 6 6 7 4-1 6-4 6-7 0-3-2.5-6-6-6z"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="21" x2="16" y2="21"/></svg> },
  { title: 'SYNC',         desc: 'TV, film, games, & digital syncs',   color: C.purple,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="4" x2="8" y2="18"/><line x1="2" y1="11" x2="22" y2="11" strokeWidth="0.8" opacity="0.4"/></svg> },
]

const CHART_LINES = [
  { color: C.teal,    amp: 18, freq: 2.2, phase: 0,   label: 'STREAMING' },
  { color: C.purple,  amp: 13, freq: 1.8, phase: 1.2, label: 'LICENSING' },
  { color: C.orange,  amp: 15, freq: 2.6, phase: 0.7, label: 'PERFORMANCE' },
  { color: '#b0b0c8', amp:  9, freq: 1.5, phase: 2.1, label: 'SYNC' },
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

// ── WaveBars — only animates transform/opacity (GPU-only per framer-motion-animator) ──

function WaveBars({ count = 8, color = C.teal, height = 28, gap = 2 }) {
  return (
    <div className="flex items-end" style={{ height, gap }}>
      {Array.from({ length: count }, (_, i) => {
        const base = BAR_H[i % BAR_H.length]
        return (
          <motion.div
            key={i}
            style={{ width: 3, background: color, originY: 1, borderRadius: 1, height }}
            animate={{ scaleY: [base * 0.25, base, base * 0.45, base * 0.82, base * 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.115, ease: 'easeInOut' }}
          />
        )
      })}
    </div>
  )
}

function PulseDot({ color = C.orange, size = 8 }) {
  return (
    <motion.div
      className="rounded-full shrink-0"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 8px ${color}88` }}
      animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ── Vinyl ─────────────────────────────────────────────────────────────────────

function Vinyl() {
  return (
    <div className="relative" style={{ width: 248, height: 248 }}>
      {/* Atmosphere — radial glow (opacity-only, GPU safe) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -40,
          background: 'radial-gradient(circle, rgba(155,89,216,0.1) 0%, rgba(0,212,168,0.06) 40%, transparent 68%)',
          filter: 'blur(24px)',
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        style={{ width: 248, height: 248 }}
      >
        <svg viewBox="0 0 248 248" style={{ width: '100%', height: '100%',
          filter: 'drop-shadow(0 0 20px rgba(0,212,168,0.2)) drop-shadow(0 0 48px rgba(155,89,216,0.12))' }}>
          <defs>
            <radialGradient id="vg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#16162a" />
              <stop offset="55%"  stopColor="#0c0c1a" />
              <stop offset="100%" stopColor="#06060e" />
            </radialGradient>
            <radialGradient id="labelGrad" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stopColor="#180e2c" />
              <stop offset="100%" stopColor="#07070e" />
            </radialGradient>
          </defs>

          <circle cx="124" cy="124" r="121" fill="url(#vg)" stroke="#18183a" strokeWidth="1.5" />

          {/* Groove rings */}
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx="124" cy="124" r={113 - i * 2.8} fill="none"
              stroke={i % 5 === 0 ? '#141430' : '#0a0a1c'} strokeWidth={i % 5 === 0 ? 0.7 : 0.35} />
          ))}

          {/* Soft sweep highlight */}
          <path d="M 56 90 A 80 80 0 0 1 192 90" stroke={C.teal} strokeWidth="1" fill="none" opacity="0.08" />

          {/* Label disc */}
          <circle cx="124" cy="124" r="44" fill="url(#labelGrad)" />
          <circle cx="124" cy="124" r="44" fill="none" stroke={C.purple} strokeWidth="0.8" opacity="0.5" />
          <circle cx="124" cy="124" r="36" fill="none" stroke={C.teal} strokeWidth="0.5" opacity="0.25" />

          <text x="124" y="120" textAnchor="middle" fill={C.teal}   fontSize="9.5" fontFamily="Space Mono, monospace" letterSpacing="1.2">yield.fm</text>
          <text x="124" y="133" textAnchor="middle" fill={C.purple} fontSize="6.5" fontFamily="Space Mono, monospace" opacity="0.85">v0.1</text>

          {/* Spinning highlight arc — the "expensive" detail */}
          <path d="M 124 80 A 44 44 0 0 1 168 124" stroke={C.teal} strokeWidth="2.5" fill="none" opacity="0.85" strokeLinecap="round" />
          <path d="M 124 80 A 44 44 0 0 1 168 124" stroke={C.teal} strokeWidth="8"   fill="none" opacity="0.08" strokeLinecap="round" />

          <circle cx="124" cy="124" r="6" fill="#04040a" />
          <circle cx="124" cy="124" r="6" fill="none" stroke="#16163a" strokeWidth="0.8" />
        </svg>
      </motion.div>
    </div>
  )
}

// ── Royalty Chart ─────────────────────────────────────────────────────────────

function RoyaltyChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const W = 290, H = 115

  return (
    <motion.div ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      <motion.div variants={fadeUpItem}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
          {/* Grid */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={0} y1={H * f} x2={W} y2={H * f}
              stroke="#0e0e18" strokeWidth="0.8" strokeDasharray="3 5" />
          ))}
          {CHART_LINES.map(({ color, amp, freq, phase }, idx) => {
            const d1 = makePath(W, H, amp, freq, phase)
            const d2 = makePath(W, H, amp * 0.58, freq, phase + 0.68)
            const dotX = W * 0.62
            const dotY = H / 2 + amp * Math.sin((dotX / W) * Math.PI * freq + phase)
            return (
              <g key={idx}>
                <motion.path d={d1} stroke={color} strokeWidth="5"   fill="none" opacity={0.07}
                  animate={{ d: [d1, d2, d1] }} transition={{ duration: 4 + idx * 0.6, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.path d={d1} stroke={color} strokeWidth="1.5" fill="none" opacity={0.92}
                  animate={{ d: [d1, d2, d1] }} transition={{ duration: 4 + idx * 0.6, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.circle cx={dotX} cy={dotY} r="3.5" fill={color}
                  style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                  animate={{ opacity: [1, 0.25, 1], r: [3.5, 2.5, 3.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }} />
              </g>
            )
          })}
        </svg>
      </motion.div>
      <motion.div variants={fadeUpItem} className="flex gap-4 flex-wrap mt-2">
        {CHART_LINES.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 14, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 9, color: C.dim, letterSpacing: 1.5 }}>{label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ── Cassette ──────────────────────────────────────────────────────────────────

function Cassette() {
  const spokes = [0, 72, 144, 216, 288]

  function Reel({ cx, cy }) {
    return (
      <g>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={30} fill="#070510" stroke="#3a1e6080" strokeWidth="1.5" />
        {/* Spinning hub */}
        <motion.g
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        >
          {spokes.map(a => (
            <line key={a}
              x1={cx + 13 * Math.cos((a * Math.PI) / 180)}
              y1={cy + 13 * Math.sin((a * Math.PI) / 180)}
              x2={cx + 26 * Math.cos((a * Math.PI) / 180)}
              y2={cy + 26 * Math.sin((a * Math.PI) / 180)}
              stroke="#5a28a060" strokeWidth="2" strokeLinecap="round" />
          ))}
        </motion.g>
        <circle cx={cx} cy={cy} r={11} fill="#100820" stroke="#2a1848" strokeWidth="1" />
        {/* Inner glow ring */}
        <circle cx={cx} cy={cy} r={11} fill="none" stroke={C.purple} strokeWidth="0.5" opacity="0.3" />
        <circle cx={cx} cy={cy} r={5} fill="#04030a" />
      </g>
    )
  }

  return (
    <svg viewBox="0 0 320 148" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="cassBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#140826" />
          <stop offset="100%" stopColor="#080512" />
        </linearGradient>
        <linearGradient id="cassStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#5a2a90" />
          <stop offset="100%" stopColor="#2a1448" />
        </linearGradient>
      </defs>

      {/* Body */}
      <rect x="3" y="3" width="314" height="142" rx="12" fill="url(#cassBg)" stroke="url(#cassStroke)" strokeWidth="1.5" />
      {/* Inner inset */}
      <rect x="7" y="7" width="306" height="134" rx="9" fill="none" stroke="#2a144860" strokeWidth="1" />

      {/* Window */}
      <rect x="52" y="18" width="216" height="82" rx="6" fill="#04030a" stroke="#2a1848" strokeWidth="1.5" />
      <rect x="55" y="21" width="210" height="76" rx="4" fill="#050410" stroke="#16102890" strokeWidth="0.5" />

      {/* Tape path */}
      <path d="M 84 94 Q 160 106 236 94" stroke="#3a186060" strokeWidth="2" fill="none" strokeLinecap="round" />

      <Reel cx={108} cy={60} />
      <Reel cx={212} cy={60} />

      {/* Top notches */}
      <rect x="20" y="2" width="24" height="10" rx="3" fill="#08060f" stroke="#3a1860" strokeWidth="1" />
      <rect x="276" y="2" width="24" height="10" rx="3" fill="#08060f" stroke="#3a1860" strokeWidth="1" />

      {/* Corner rivets */}
      <circle cx="20" cy="130" r="5.5" fill="#08060f" stroke="#2a1448" strokeWidth="1" />
      <circle cx="300" cy="130" r="5.5" fill="#08060f" stroke="#2a1448" strokeWidth="1" />

      {/* Labels */}
      <text x="160" y="120" textAnchor="middle" fill="#5a2a8a" fontSize="8" letterSpacing="3.5"
        fontFamily="Space Mono, monospace" fontWeight="700">THE WORLD'S SOUNDTRACK</text>
      <text x="160" y="135" textAnchor="middle" fill="#3a1860" fontSize="7" letterSpacing="2.5"
        fontFamily="Space Mono, monospace">BUILT FOR OWNERS // NOT RENTERS</text>
    </svg>
  )
}

// ── Staggered feature row wrapper ─────────────────────────────────────────────

function FeatureList({ items, variant = 'slide' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const itemVar = variant === 'slide' ? fadeSlideItem : fadeUpItem

  return (
    <motion.div ref={ref} className="flex flex-col gap-1"
      variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      {items.map((item, i) => (
        <motion.div key={i} variants={itemVar}>
          <motion.div
            className="flex items-center gap-3 cursor-pointer rounded"
            style={{ padding: '10px 10px', border: '1px solid transparent' }}
            whileHover={{ backgroundColor: '#111116', borderColor: C.border,
              boxShadow: `inset 2px 0 0 ${item.color}`, transition: snappy }}
            whileTap={{ scale: 0.98, transition: springStiff }}
          >
            <div style={{ color: item.color }} className="shrink-0">{item.icon}</div>
            <div className="flex-1">
              <div style={{ fontSize: 11, color: C.text, fontWeight: 700, letterSpacing: 1 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: C.dim,  marginTop: 2 }}>{item.desc}</div>
            </div>
            {item.num && (
              <span style={{ fontSize: 11, color: C.dimmer, fontWeight: 700 }}>{item.num}</span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const timer = useTimer()

  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center p-4 py-8"
      style={{ fontFamily: "'Space Mono', monospace", background: C.base }}
    >
      {/* Window — spring entrance (framer-motion-animator: spring is more natural than tween) */}
      <motion.div
        className="w-full rounded-xl overflow-hidden"
        style={{
          maxWidth: 1200,
          border: `1px solid ${C.border}`,
          boxShadow: `
            0 0 0 1px #0a0a14,
            0 48px 140px rgba(0,0,0,0.95),
            0 0 100px rgba(0,212,168,0.06),
            0 0 200px rgba(155,89,216,0.04)
          `,
        }}
        variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate="visible"
        transition={{ ...springBouncy, delay: 0.05 }}
      >

        {/* ── Title Bar ── */}
        <motion.div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ background: 'linear-gradient(180deg, #0c0c12 0%, #080810 100%)', borderBottom: `1px solid ${C.border}` }}
          variants={fadeUpItem} initial="hidden" animate="visible"
          transition={{ ...spring, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <WaveBars count={5} height={14} color={C.teal} gap={2} />
            <span style={{ fontSize: 11, color: C.dimmer, letterSpacing: 3 }}>
              yield.fm v0.1 // PROTOCOL PREVIEW
            </span>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              style={{
                fontSize: 11, letterSpacing: 3, padding: '3px 12px',
                border: `1px solid ${C.orange}`, color: C.orange,
                boxShadow: `0 0 14px rgba(245,166,35,0.22)`,
              }}
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              PRE-LAUNCH
            </motion.div>
            <div className="flex items-center gap-2.5" style={{ color: '#222232' }}>
              {['⊙', '□', '×'].map(ch => (
                <motion.span key={ch} className="cursor-pointer" style={{ fontSize: 13 }}
                  whileHover={{ color: C.dim, transition: snappy }}>
                  {ch}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Hero Row ── */}
        <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>

          {/* Hero Left */}
          <div className="flex-1 relative overflow-hidden" style={{
            padding: '48px 44px 48px',
            borderRight: `1px solid ${C.border}`,
            background: 'linear-gradient(140deg, #0d0d1c 0%, #080810 55%, #0a0a1a 100%)',
            minHeight: 300,
          }}>
            {/* Glow bloom — large, bleeds into text area */}
            <div className="absolute pointer-events-none" style={{
              right: -50, top: -80,
              width: 560, height: 560,
              background: `radial-gradient(circle at 55% 48%, rgba(155,89,216,0.14) 0%, rgba(0,212,168,0.07) 38%, transparent 66%)`,
              filter: 'blur(36px)',
            }} />

            {/* Secondary ambient — lower left warmth */}
            <div className="absolute pointer-events-none" style={{
              left: -60, bottom: -60,
              width: 340, height: 340,
              background: `radial-gradient(circle, rgba(0,212,168,0.04) 0%, transparent 65%)`,
              filter: 'blur(24px)',
            }} />

            {/* Background bar chart */}
            <div className="absolute flex items-end gap-1 pointer-events-none" style={{ right: 256, bottom: 0, opacity: 0.10 }}>
              {[30, 50, 26, 66, 42, 76, 34, 56, 48, 70, 32, 52, 44, 62, 38, 50, 40, 58].map((h, i) => (
                <motion.div key={i}
                  style={{ width: 7, height: h, background: `linear-gradient(to top, ${C.teal}, ${C.purple})`, originY: 1 }}
                  animate={{ scaleY: [0.4, 1, 0.6, 0.88, 0.4] }}
                  transition={{ duration: 2.6 + i * 0.12, repeat: Infinity, delay: i * 0.07 }}
                />
              ))}
            </div>

            {/* Content */}
            <motion.div
              variants={staggerContainer} initial="hidden" animate="visible"
              transition={{ delayChildren: 0.3, staggerChildren: 0.13 }}
            >

              {/* Logo row */}
              <motion.div variants={fadeUpItem} className="flex items-end gap-4" style={{ marginBottom: 32 }}>
                <div className="flex items-end gap-1 pb-1.5">
                  {[14, 24, 34, 28, 20, 30, 22].map((h, i) => (
                    <motion.div key={i}
                      style={{ width: 5, borderRadius: 2, originY: 1, height: h,
                        background: i < 4
                          ? 'linear-gradient(to top, #008a6a, #00d4a8)'
                          : 'linear-gradient(to top, #6020a0, #9b59d8)' }}
                      animate={{ scaleY: [0.22, 1, 0.48, 0.85, 0.22] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
                <h1 style={{ margin: 0, fontSize: 82, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-2.5px', fontFamily: "'Space Mono', monospace" }}>
                  <span style={{
                    background: `linear-gradient(94deg, ${C.teal} 0%, #8844e0 62%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>yield.</span><span style={{ color: '#ececf8' }}>fm</span>
                </h1>
              </motion.div>

              {/* Tagline — three items with teal dot separators */}
              <motion.div variants={fadeUpItem}
                className="flex items-baseline flex-wrap"
                style={{ gap: '6px 14px', marginBottom: 28 }}
              >
                {['Own music', 'Own publishing', 'Own master catalogs'].map((phrase, i, arr) => (
                  <span key={i} className="flex items-baseline gap-3.5">
                    <span style={{ fontSize: 17, color: '#b8b8d4', letterSpacing: '0.03em', fontWeight: 400 }}>
                      {phrase}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ color: C.teal, fontSize: 22, lineHeight: 1, opacity: 0.55, fontWeight: 700 }}>·</span>
                    )}
                  </span>
                ))}
              </motion.div>

              {/* Separator — teal→purple→transparent */}
              <motion.div variants={fadeUpItem} style={{
                height: 1,
                background: `linear-gradient(90deg, ${C.teal}55 0%, ${C.purple}30 45%, transparent 100%)`,
                marginBottom: 26,
                maxWidth: 440,
              }} />

              {/* Description — natural paragraph, no forced breaks */}
              <motion.p variants={fadeUpItem} style={{
                fontSize: 13, color: '#545470', lineHeight: 1.95,
                marginBottom: 20, maxWidth: 395,
              }}>
                A yield-bearing protocol for future ownership of music royalties,
                streams, and curated catalogs — designed for the next era of
                music infrastructure.
              </motion.p>

              {/* Teal callout — left border accent */}
              <motion.p variants={fadeUpItem} style={{
                fontSize: 12, color: C.teal,
                borderLeft: `2px solid ${C.teal}`,
                paddingLeft: 12, lineHeight: 1.6,
                letterSpacing: '0.025em', opacity: 0.88,
                margin: 0,
              }}>
                Catalogs can earn whether the market is up or down.
              </motion.p>

            </motion.div>

            {/* Vinyl */}
            <motion.div
              style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-52%)' }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.55 }}
            >
              <Vinyl />
            </motion.div>
          </div>

          {/* Status Panel */}
          <motion.div
            className="flex flex-col gap-4"
            style={{
              width: 288, padding: '26px 22px',
              background: 'linear-gradient(180deg, #08080e 0%, #060609 100%)',
            }}
            variants={fadeSlideItem} initial="hidden" animate="visible"
            transition={{ ...spring, delay: 0.45 }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 10, color: C.dimmer, letterSpacing: 4 }}>STATUS</span>
              <span style={{ color: '#1a1a28', fontSize: 12 }}>—</span>
            </div>

            <div style={{
              border: `1px solid rgba(245,166,35,0.28)`,
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #100a08, #0c0a10)',
              boxShadow: 'inset 0 0 24px rgba(245,166,35,0.03)',
            }}>
              <div className="flex items-start gap-2.5">
                <PulseDot color={C.orange} />
                <span style={{ color: C.orange, fontSize: 14, fontWeight: 700, lineHeight: 1.45, letterSpacing: 1 }}>
                  PRE-LAUNCH<br />WAITLIST OPEN
                </span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#404060', lineHeight: 1.85 }}>
              We're indexing catalogs and<br />
              building the rails for the<br />
              future of royalty ownership.
            </p>

            <div className="flex-1 flex flex-col justify-end gap-3">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(row => (
                  <WaveBars key={row} count={4} height={20} color={row % 2 === 0 ? C.teal : C.purple} gap={2} />
                ))}
              </div>
              <motion.button
                style={{
                  padding: '10px 0', fontSize: 10, letterSpacing: 3, marginTop: 4,
                  border: `1px solid #1e1e2e`, color: '#484868',
                  background: 'transparent', cursor: 'pointer', width: '100%',
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{ borderColor: C.teal, color: C.teal,
                  boxShadow: `0 0 18px rgba(0,212,168,0.14)`, transition: snappy }}
                whileTap={{ scale: 0.97, transition: springStiff }}
              >
                ACCESS BY INVITE ONLY
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ── Features Row ── */}
        <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
          {[
            { title: 'WHAT YOU CAN OWN',    items: OWNERSHIP, variant: 'slide' },
            { title: 'HOW CATALOGS EARN',    items: EARNING,   variant: 'slide' },
          ].map(({ title, items, variant }, colIdx) => (
            <div key={title} className="flex-1" style={{
              padding: '24px 24px',
              borderRight: `1px solid ${C.border}`,
              background: 'linear-gradient(180deg, #0a0a10 0%, #060609 100%)',
            }}>
              <h3 style={{
                fontSize: 10, color: C.dimmer, letterSpacing: 4,
                marginBottom: 18, paddingBottom: 10,
                borderBottom: `1px dashed #14141e`,
              }}>{title}</h3>
              <FeatureList items={items} variant={variant} />
            </div>
          ))}

          {/* Royalty Flow */}
          <div className="flex-1" style={{
            padding: '24px 24px',
            background: 'linear-gradient(180deg, #0a0a10 0%, #060609 100%)',
          }}>
            <h3 style={{
              fontSize: 10, color: C.dimmer, letterSpacing: 4,
              marginBottom: 18, paddingBottom: 10,
              borderBottom: `1px dashed #14141e`,
            }}>ROYALTY FLOW (CONCEPTUAL)</h3>
            <RoyaltyChart />
            <motion.div
              style={{
                marginTop: 18, padding: '14px 16px',
                borderLeft: `2px solid ${C.purple}`,
                background: 'linear-gradient(135deg, #0c081c, #080610)',
                boxShadow: `inset 0 0 24px rgba(155,89,216,0.04)`,
              }}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span style={{ color: C.purple, fontSize: 22, lineHeight: 1, fontWeight: 700 }}>"</span>
                  <p style={{ color: C.teal, fontSize: 11, lineHeight: 1.75, fontWeight: 700, marginTop: 4 }}>
                    Diverse sources.<br />Durable demand.<br />Market-neutral exposure.
                  </p>
                </div>
                <span style={{ color: C.purple, fontSize: 30, opacity: 0.18, marginTop: 4 }}>♪</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="flex items-stretch" style={{ borderBottom: `1px solid ${C.border}` }}>
          {/* Cassette */}
          <motion.div
            className="flex items-center justify-center"
            style={{
              width: 312, padding: '22px 26px',
              borderRight: `1px solid ${C.border}`,
              background: 'linear-gradient(140deg, #0c061a, #080510)',
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <div style={{ width: 278 }}><Cassette /></div>
          </motion.div>

          {/* CTAs — staggered entrance */}
          <motion.div
            className="flex-1 flex flex-col justify-center gap-5"
            style={{ padding: '30px 34px', background: '#04040a' }}
            variants={staggerContainer} initial="hidden"
            whileInView="visible" viewport={{ once: true }}
            transition={{ delayChildren: 0.15, staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUpItem} className="flex gap-4 items-stretch">
              <motion.button
                className="flex-1 cursor-pointer border-0"
                style={{
                  padding: '20px 24px', fontSize: 13, fontWeight: 700,
                  letterSpacing: 3, color: '#04080a',
                  background: `linear-gradient(135deg, ${C.teal}, #00b890)`,
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{ scale: 1.025, boxShadow: `0 0 48px rgba(0,212,168,0.55), 0 8px 36px rgba(0,212,168,0.22)` }}
                whileTap={{ scale: 0.97 }}
                transition={springBouncy}
              >
                JOIN WAITLIST →
              </motion.button>
              <motion.button
                className="flex-1 cursor-pointer border-0"
                style={{
                  padding: '20px 24px', fontSize: 13, fontWeight: 700,
                  letterSpacing: 3, color: '#f0e8ff',
                  background: `linear-gradient(135deg, ${C.purple}, #7a38b8)`,
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{ scale: 1.025, boxShadow: `0 0 48px rgba(155,89,216,0.55), 0 8px 36px rgba(155,89,216,0.22)` }}
                whileTap={{ scale: 0.97 }}
                transition={springBouncy}
              >
                READ THESIS →
              </motion.button>
              <motion.button
                style={{
                  padding: '20px 22px', fontSize: 11, fontWeight: 700,
                  letterSpacing: 2, color: '#484870', lineHeight: 1.5,
                  border: `1px solid #1e1e2e`, background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace",
                }}
                whileHover={{ borderColor: '#4a4a80', color: '#9090c0',
                  boxShadow: '0 0 22px rgba(100,100,200,0.12)', transition: snappy }}
                whileTap={{ scale: 0.97, transition: springStiff }}
              >
                EXPLORE<br />MECHANICS →
              </motion.button>
            </motion.div>
            <motion.p variants={fadeUpItem}
              style={{ fontSize: 11, color: '#282840', letterSpacing: 1, textAlign: 'center' }}>
              Be first in line for early access, updates, and protocol releases.
            </motion.p>
          </motion.div>
        </div>

        {/* ── Status Bar ── */}
        <motion.div
          className="flex items-center justify-between"
          style={{
            padding: '9px 20px',
            background: 'linear-gradient(180deg, #080810, #040408)',
            borderTop: `1px solid #0e0e18`,
          }}
          variants={staggerContainer} initial="hidden"
          whileInView="visible" viewport={{ once: true }}
        >
          <WaveBars count={5} height={12} color={C.teal} gap={2} />
          <motion.div className="flex items-center gap-6" variants={staggerContainer}>
            {[
              { label: 'INDEXING CATALOGS',       color: C.teal,   delay: 0 },
              { label: 'BUILDING RAILS',           color: C.teal,   delay: 0.5 },
              { label: 'WAITLIST ACTIVE',          color: C.orange, delay: 1.0 },
              { label: 'MARKET-NEUTRAL EXPOSURE',  color: C.teal,   delay: 1.5 },
            ].map(({ label, color, delay }) => (
              <motion.div key={label} className="flex items-center gap-2" variants={fadeUpItem}
                style={{ fontSize: 10, letterSpacing: 3 }}>
                <span style={{ color: C.dimmer }}>{label}</span>
                <motion.div className="rounded-full"
                  style={{ width: 6, height: 6, background: color, boxShadow: `0 0 5px ${color}` }}
                  animate={{ opacity: [1, 0.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay }} />
              </motion.div>
            ))}
          </motion.div>
          <span style={{ color: C.teal, fontSize: 11, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}>
            {timer}
          </span>
        </motion.div>

      </motion.div>
    </div>
  )
}
