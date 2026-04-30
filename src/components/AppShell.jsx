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
    <span className="yield-fm-logo" style={{
      fontFamily: 'var(--face-display)',
      fontWeight: 'var(--weight-display)',
      fontSize: 22, letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
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
          {['EDM', 'CLASSICAL', 'HIP-HOP'].map((m, i) => {
            const v = m === 'HIP-HOP' ? 'hiphop' : m.toLowerCase()
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
    } else if (mode === 'hiphop') {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 0.4 : 0.04)
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true
      const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 1800
      const ng = ctx.createGain(); ng.gain.value = 0.05
      noise.connect(filt).connect(ng).connect(master); noise.start()
      nodes.push(noise, filt, ng)

      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 41.2
      const sg = ctx.createGain(); sg.gain.value = 0.14
      sub.connect(sg).connect(master); sub.start()
      nodes.push(sub, sg)

      const tempo = 88
      const beat = 60 / tempo
      let step = 0
      const loop = setInterval(() => {
        if (!ref.current.ctx) return
        const t = ctx.currentTime
        if (step % 4 === 0 || step % 8 === 6) {
          const k = ctx.createOscillator(); k.type = 'sine'
          const kg = ctx.createGain(); kg.gain.value = 0
          k.frequency.setValueAtTime(110, t)
          k.frequency.exponentialRampToValueAtTime(38, t + 0.18)
          kg.gain.linearRampToValueAtTime(0.32, t + 0.005)
          kg.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
          k.connect(kg).connect(master); k.start(t); k.stop(t + 0.4)
        }
        if (step % 8 === 4 || step % 16 === 12) {
          const sb = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
          const sc = sb.getChannelData(0)
          for (let i = 0; i < sc.length; i++) sc[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04))
          const sn = ctx.createBufferSource(); sn.buffer = sb
          const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1800; sf.Q.value = 0.7
          const sg2 = ctx.createGain(); sg2.gain.value = 0.18
          sn.connect(sf).connect(sg2).connect(master); sn.start(t); sn.stop(t + 0.2)
        }
        if (step % 2 === 1) {
          const hb = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
          const hc = hb.getChannelData(0)
          for (let i = 0; i < hc.length; i++) hc[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012))
          const h = ctx.createBufferSource(); h.buffer = hb
          const hf = ctx.createBiquadFilter(); hf.type = 'highpass'; hf.frequency.value = 7000
          const hg = ctx.createGain(); hg.gain.value = 0.06
          h.connect(hf).connect(hg).connect(master); h.start(t); h.stop(t + 0.06)
        }
        step++
      }, beat * 250)
      nodes.push({ stop() { clearInterval(loop) }, disconnect() {} })
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
