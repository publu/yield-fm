import React, { useEffect, useRef } from 'react'

export function Crosshair({ pos = 'tl', color = 'var(--accent-a)' }) {
  const map = {
    tl: { top: 14, left: 14 }, tr: { top: 14, right: 14 },
    bl: { bottom: 14, left: 14 }, br: { bottom: 14, right: 14 },
  }
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', ...map[pos], width: 12, height: 12,
      color, pointerEvents: 'none', opacity: 0.7, zIndex: 2,
    }}>
      <div style={{ position: 'absolute', left: 0, top: 5.5, width: 12, height: 1, background: 'currentColor' }} />
      <div style={{ position: 'absolute', top: 0, left: 5.5, width: 1, height: 12, background: 'currentColor' }} />
    </div>
  )
}

export function Logo() {
  return (
    <span style={{
      fontFamily: 'var(--face-display)',
      fontWeight: 'var(--weight-display)',
      fontSize: 20, letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
    }}>
      <span style={{
        background: 'linear-gradient(96deg, var(--accent-a), var(--accent-b))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>yield</span>.fm
    </span>
  )
}

export function TopNav({ mode, onMode, audioOn, onAudio }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="nav-grid" style={{
        maxWidth: 1480, margin: '0 auto', padding: '14px 28px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center',
      }}>
        <div className="row" style={{ alignItems: 'center', gap: 14 }}>
          <Logo />
          <span className="nav-tagline" style={{
            paddingLeft: 12, borderLeft: '1px solid var(--line)',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--dim)',
            textTransform: 'uppercase',
          }}>ROYALTY INVESTING TERMINAL</span>
        </div>

        <nav className="nav-modes row" style={{
          gap: 0, border: '1px solid var(--line)',
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', fontWeight: 700,
        }}>
          {['EDM', 'CLASSICAL', 'VINYL'].map((m, i) => {
            const v = m.toLowerCase()
            const on = mode === v
            return (
              <button key={v} onClick={() => onMode(v)} style={{
                padding: '8px 16px',
                background: on ? 'var(--accent-a)' : 'transparent',
                color: on ? 'var(--bg)' : 'var(--sub)',
                border: 'none',
                borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
                letterSpacing: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
              }}>{m}</button>
            )
          })}
        </nav>

        <div className="row" style={{ alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onAudio} style={{
            background: 'transparent', color: audioOn ? 'var(--accent-a)' : 'var(--dim)',
            border: '1px solid var(--line)', padding: '6px 12px',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span className={audioOn ? 'pulse' : ''} style={{
              width: 6, height: 6, borderRadius: 999,
              background: audioOn ? 'var(--accent-a)' : 'var(--dim)',
              boxShadow: audioOn ? '0 0 10px var(--accent-a)' : 'none',
            }} />
            {audioOn ? 'AUDIO' : 'MUTE'}
          </button>
          <button className="nav-cta" style={{
            background: 'var(--accent-a)', color: 'var(--bg)', border: 'none',
            padding: '8px 18px', fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.2em', fontWeight: 700,
          }}><span className="nav-cta-text">REQUEST ACCESS </span>→</button>
        </div>
      </div>
    </header>
  )
}

export function useAmbient(mode, on) {
  const ref = useRef({ ctx: null, nodes: [] })
  useEffect(() => {
    if (!on) {
      const { ctx, nodes } = ref.current
      if (ctx) {
        try {
          nodes.forEach(n => { try { n.stop?.(); n.disconnect?.() } catch (e) {} })
          ctx.close()
        } catch (e) {}
        ref.current = { ctx: null, nodes: [] }
      }
      return
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.4)
    const nodes = [master]

    if (mode === 'classical') {
      [130.81, 196.00, 233.08, 311.13, 392.00].forEach((f, i) => {
        const o = ctx.createOscillator()
        o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f
        const g = ctx.createGain(); g.gain.value = 0.04
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1 + i * 0.07
        const lg = ctx.createGain(); lg.gain.value = 0.015
        lfo.connect(lg).connect(g.gain)
        o.connect(g).connect(master)
        o.start(); lfo.start()
        nodes.push(o, g, lfo, lg)
      })
    } else if (mode === 'vinyl') {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (Math.random() < 0.04 ? 0.6 : 0.05)
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true
      const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 1100
      const ng = ctx.createGain(); ng.gain.value = 0.07
      noise.connect(filt).connect(ng).connect(master); noise.start()
      ;[110, 165, 220].forEach((f) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f
        const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 600
        const g = ctx.createGain(); g.gain.value = 0.025
        o.connect(lpf).connect(g).connect(master); o.start()
        nodes.push(o, lpf, g)
      })
      nodes.push(noise, filt, ng)
    } else {
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 55
      const sg = ctx.createGain(); sg.gain.value = 0.10
      sub.connect(sg).connect(master); sub.start()
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * 0.3
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 1.2
      const ng = ctx.createGain(); ng.gain.value = 0.035
      noise.connect(bp).connect(ng).connect(master)
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.5
      const lg = ctx.createGain(); lg.gain.value = 0.03
      lfo.connect(lg).connect(ng.gain)
      noise.start(); lfo.start()
      nodes.push(sub, sg, noise, bp, ng, lfo, lg)
      const seq = [261.63, 392.00, 523.25, 392.00, 329.63, 493.88]
      let step = 0
      const arp = setInterval(() => {
        if (!ref.current.ctx) return
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = seq[step % seq.length]
        const g = ctx.createGain(); g.gain.value = 0; o.connect(g).connect(master)
        const t = ctx.currentTime
        g.gain.linearRampToValueAtTime(0.04, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
        o.start(t); o.stop(t + 0.7)
        step++
      }, 600)
      nodes.push({ stop() { clearInterval(arp) }, disconnect() {} })
    }
    ref.current = { ctx, nodes }
    return () => {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
      } catch (e) {}
      setTimeout(() => {
        try {
          nodes.forEach(n => { try { n.stop?.(); n.disconnect?.() } catch (e) {} })
          ctx.close()
        } catch (e) {}
      }, 500)
      ref.current = { ctx: null, nodes: [] }
    }
  }, [mode, on])
}
