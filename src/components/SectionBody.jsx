import React, { useMemo, useState } from 'react'
import { Sparkline, SectionHead, makeSeries } from './DataComponents'
import catalogData from '../data/catalogs.json'

const COPYRIGHTS = [
  {
    code: 'A', sigil: '©', label: 'COMPOSITION', color: 'var(--accent-a)',
    title: 'The song as written.',
    desc: 'Melody, lyrics, harmony, structure. The underlying work — independent of any recording.',
    held: 'Songwriters · Publishers',
    earns: ['Performance royalties', 'Mechanical royalties', 'Sync (composition side)'],
    pays: ['ASCAP', 'BMI', 'SESAC', 'GMR', 'The MLC', 'HFA'],
    note: '~$13B / yr globally',
  },
  {
    code: 'B', sigil: '℗', label: 'MASTER RECORDING', color: 'var(--accent-b)',
    title: 'One specific recording of the song.',
    desc: 'The captured performance — the file on Spotify, the cut on the radio. A cover creates a new master under the same composition.',
    held: 'Labels · Artists · Master owners',
    earns: ['Streaming revenue', 'Digital performance', 'Sync (master side)', 'Physical sales'],
    pays: ['Distributors', 'Labels', 'SoundExchange'],
    note: '~$32B / yr globally',
  },
]

export function Primer() {
  return (
    <section style={{ borderBottom: '1px solid var(--line)', padding: 'clamp(72px, 8vw, 110px) 0' }}>
      <div className="sec-pad" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 32px' }}>
        <SectionHead num="01" kicker="THE FOUNDATION"
          title="A song is two copyrights, separately owned."
          sub="Before any money moves you have to know which copyright is being used. Most people lump them together; sophisticated buyers treat them as two distinct asset classes — different cash-flow profiles, different collectors, different durations."
        />
        <div className="primer-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1,
          background: 'var(--line)', border: '1px solid var(--line)',
        }}>
          {COPYRIGHTS.map((c) => (
            <div key={c.code} style={{
              background: 'var(--bg)', padding: '36px 32px',
              display: 'flex', flexDirection: 'column', gap: 22, position: 'relative',
            }}>
              <div className="row" style={{ alignItems: 'baseline', gap: 16 }}>
                <span style={{ fontFamily: 'var(--face-display)', fontSize: 48, fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.sigil}</span>
                <span className="label" style={{ color: c.color }}>{c.label}</span>
                <span style={{ flex: 1 }} />
                <span className="label tnum" style={{ color: 'var(--dim)' }}>{c.note}</span>
              </div>
              <h3 style={{
                margin: 0, fontFamily: 'var(--face-display)',
                fontWeight: 'var(--weight-display)', fontSize: 'clamp(26px, 2.4vw, 34px)',
                lineHeight: 1.1, letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
              }}>{c.title}</h3>
              <p style={{ margin: 0, color: 'var(--sub)', fontSize: 14, lineHeight: 1.65 }}>{c.desc}</p>
              <div className="hr-soft hr" />
              <div className="col" style={{ gap: 6 }}>
                <span className="label">HELD BY</span>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{c.held}</span>
              </div>
              <div className="col" style={{ gap: 8 }}>
                <span className="label">GENERATES</span>
                {c.earns.map(e => (
                  <span key={e} className="row" style={{ gap: 12, alignItems: 'center' }}>
                    <span style={{ width: 18, height: 1, background: c.color }} />
                    <span style={{ color: 'var(--text)', fontSize: 13 }}>{e}</span>
                  </span>
                ))}
              </div>
              <div className="col" style={{ gap: 8 }}>
                <span className="label">COLLECTED BY</span>
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {c.pays.map(p => (
                    <span key={p} style={{
                      fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px',
                      border: '1px solid var(--line)', color: 'var(--sub)', letterSpacing: '0.08em',
                    }}>{p}</span>
                  ))}
                </div>
              </div>
              <span aria-hidden="true" style={{
                position: 'absolute', right: 24, bottom: 16,
                fontFamily: 'var(--face-display)', fontSize: 220, lineHeight: 0.85,
                color: c.color, opacity: 0.04, fontWeight: 'var(--weight-display)',
                pointerEvents: 'none',
              }}>{c.code}</span>
            </div>
          ))}
        </div>

        <div className="row" style={{
          marginTop: 24, padding: '20px 24px',
          border: '1px solid var(--accent-a)',
          background: 'color-mix(in oklab, var(--accent-a) 8%, var(--bg-2))',
          gap: 24, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span className="label" style={{ color: 'var(--accent-a)' }}>KEY INSIGHT</span>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text)', lineHeight: 1.6, flex: 1, minWidth: 280 }}>
            One Spotify stream pays <em>both</em> sides — composition (~$0.0008 to writers/publishers via the MLC) and master (~$0.0040 to label/artist via the distributor).{' '}
            <span style={{ color: 'var(--sub)' }}>Same play, two checks, different mailboxes. Master share is ~5× larger; composition share is more durable.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

const STREAMS = [
  { code: 'STR', name: 'STREAMING',   share: 0.41, color: 'var(--accent-a)', rights: 'Comp + Master',     collector: 'Distributors · The MLC',  cadence: 'Monthly',     desc: 'Interactive on-demand — Spotify, Apple, Tidal, YouTube Music.' },
  { code: 'PRF', name: 'PERFORMANCE', share: 0.32, color: 'var(--accent-c)', rights: 'Comp + Digital Master', collector: 'PROs · SoundExchange', cadence: 'Quarterly',   desc: 'Public plays — radio, venues, restaurants, TV, fitness.' },
  { code: 'MEC', name: 'MECHANICAL',  share: 0.11, color: 'var(--accent-d)', rights: 'Composition',       collector: 'The MLC · HFA',           cadence: 'Monthly',     desc: 'Statutory reproductions — physical, downloads, streams (US).' },
  { code: 'SYN', name: 'SYNC',        share: 0.10, color: 'var(--accent-b)', rights: 'Comp + Master',     collector: 'Direct license',          cadence: 'Upfront + bw', desc: 'Pairing music with picture — film, TV, ads, games.' },
  { code: 'NBR', name: 'NEIGHBORING', share: 0.06, color: 'var(--sub)',      rights: 'Master + Performer', collector: 'PPL · GVL · SoundEx',     cadence: 'Annual',      desc: 'Foreign performance, broadcast, public spaces.' },
]

export function FiveStreams() {
  const [hover, setHover] = useState(null)
  return (
    <section style={{ borderBottom: '1px solid var(--line)', padding: 'clamp(72px, 8vw, 110px) 0', background: 'var(--bg-2)' }}>
      <div className="sec-pad" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 32px' }}>
        <SectionHead num="02" kicker="REVENUE STREAMS"
          title="Five pipes. Each one pays differently."
          sub="A single recording can earn through all five at once. The mix shifts with age, genre, geography, and how the song gets used. Read the mix and you read the asset."
        />

        <div className="col" style={{ gap: 10, marginBottom: 22 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="label">2024 GLOBAL ROYALTY MIX · $45.2B</span>
            <span className="label tnum">100.0%</span>
          </div>
          <div className="row" style={{ height: 64, border: '1px solid var(--line)' }}>
            {STREAMS.map((s, i) => {
              const w = s.share * 100, on = hover == null || hover === i
              return (
                <div key={s.code}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                  style={{
                    width: `${w}%`, background: s.color,
                    opacity: on ? 0.9 : 0.25, transition: 'opacity 200ms',
                    borderRight: i < STREAMS.length - 1 ? '1px solid var(--bg)' : 'none',
                    display: 'flex', alignItems: 'flex-end', padding: '8px 12px',
                    color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11,
                    fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer',
                  }}>{s.code} · {Math.round(s.share * 100)}%</div>
              )
            })}
          </div>
        </div>

        <div className="col" style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
          {STREAMS.map((s, i) => (
            <div key={s.code} className="streams-row"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 1.4fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.2fr) 100px 80px',
                gap: 18, padding: '20px 24px', alignItems: 'center',
                borderBottom: i < STREAMS.length - 1 ? '1px solid var(--line)' : 'none',
                background: hover === i ? 'color-mix(in oklab, var(--bg) 92%, var(--accent-a))' : 'transparent',
                transition: 'background 160ms',
              }}>
              <div className="col" style={{ gap: 4, paddingLeft: 12, borderLeft: `2px solid ${s.color}` }}>
                <span className="label tnum" style={{ color: s.color }}>{s.code}</span>
                <span style={{
                  fontFamily: 'var(--face-display)', fontWeight: 'var(--weight-display)',
                  fontSize: 18, color: 'var(--text)', letterSpacing: 'var(--tracking-display)',
                }}>{s.name}</span>
              </div>
              <span className="streams-desc" style={{ color: 'var(--sub)', fontSize: 13, lineHeight: 1.55 }}>{s.desc}</span>
              <span className="streams-rights" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)' }}>{s.rights}</span>
              <span className="streams-collector" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)' }}>{s.collector}</span>
              <span className="streams-cadence" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>{s.cadence}</span>
              <span className="tnum" style={{
                fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700,
                color: s.color, textAlign: 'right',
              }}>{Math.round(s.share * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Flow() {
  const stages = [
    { n: '01', name: 'USE',     desc: 'A play, sale, sync, or spin emits usage data.' },
    { n: '02', name: 'MATCH',   desc: 'ISRC + ISWC identify the recording and the song.' },
    { n: '03', name: 'COLLECT', desc: 'PROs · MLC · SoundEx · Distros route the cash.' },
    { n: '04', name: 'SPLIT',   desc: 'Writer / publisher / artist / label percentages applied.' },
    { n: '05', name: 'PAY',     desc: 'Cash arrives — quarterly, monthly, or near-real-time.' },
  ]
  const series = useMemo(() => [
    { color: 'var(--accent-a)', amp: 28, freq: 2.4, phase: 0.4, label: 'COMPOSITION', drift: -30 },
    { color: 'var(--accent-b)', amp: 22, freq: 1.7, phase: 1.1, label: 'MASTER',      drift: -10 },
    { color: 'var(--accent-c)', amp: 18, freq: 2.9, phase: 2.2, label: 'PERFORMANCE', drift:  10 },
    { color: 'var(--accent-d)', amp: 12, freq: 1.4, phase: 0.7, label: 'MECHANICAL',  drift:  30 },
  ], [])
  const W = 1200, H = 240
  const pathFor = (s) => {
    let d = ''
    for (let x = 0; x <= W; x += 4) {
      const y = H/2 + s.amp * Math.sin((x/W) * Math.PI * s.freq + s.phase) + s.drift * (x/W)
      d += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    }
    return d
  }

  return (
    <section style={{ borderBottom: '1px solid var(--line)', padding: 'clamp(72px, 8vw, 110px) 0' }}>
      <div className="sec-pad" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 32px' }}>
        <SectionHead num="03" kicker="FOLLOW THE MONEY"
          title="USE → MATCH → COLLECT → SPLIT → PAY"
          sub="Royalties don't pay through one pipe. Every play splits into multiple paths — different rates, different cadences, different collectors. Most leakage happens at MATCH: when a song's ID isn't recognized, the cash sits in the unmatched pool until claimed."
        />

        <div style={{ border: '1px solid var(--line)', background: 'var(--bg-2)', padding: '32px 40px', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {[0.25, 0.5, 0.75].map(f => (
              <line key={f} x1="0" y1={H*f} x2={W} y2={H*f} stroke="var(--line-soft)" strokeWidth="0.6" strokeDasharray="2 6" />
            ))}
            {stages.map((_, i) => {
              const x = (i + 0.5) * (W / stages.length)
              return <line key={i} x1={x} y1="0" x2={x} y2={H} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 4" />
            })}
            {series.map((s, i) => (
              <g key={i}>
                <path d={pathFor(s)} fill="none" stroke={s.color} strokeWidth="8" opacity="0.08" strokeLinecap="round" />
                <path d={pathFor(s)} fill="none" stroke={s.color} strokeWidth="1.6" opacity="0.95" strokeLinecap="round" />
                {stages.map((_, j) => {
                  const x = (j + 0.5) * (W / stages.length)
                  const y = H/2 + s.amp * Math.sin((x/W) * Math.PI * s.freq + s.phase) + s.drift * (x/W)
                  return <circle key={j} cx={x} cy={y} r="3.5" fill={s.color} />
                })}
              </g>
            ))}
          </svg>
          <div className="row" style={{ marginTop: 18, gap: 24, flexWrap: 'wrap' }}>
            {series.map(s => (
              <div key={s.label} className="row" style={{ alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 2, background: s.color }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--sub)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flow-stages" style={{
          marginTop: 24, display: 'grid',
          gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 1,
          background: 'var(--line)', border: '1px solid var(--line)',
        }}>
          {stages.map((s) => (
            <div key={s.n} style={{ background: 'var(--bg-2)', padding: '24px 22px' }}>
              <div className="row" style={{ alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span className="tnum" style={{
                  fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-a)',
                  letterSpacing: '0.22em', fontWeight: 700,
                }}>{s.n}</span>
                <span style={{
                  fontFamily: 'var(--face-display)', fontSize: 22, fontWeight: 'var(--weight-display)',
                  letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
                }}>{s.name}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--sub)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function shortenTitle(t) {
  return t
    .replace(/Songwriter Royalties|Publishing Royalties|Royalties|- /gi, '')
    .replace(/[“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
function termLabel(t) {
  if (t === 'life_of_rights') return 'LIFE OF RIGHTS'
  if (t === 'fixed_return') return 'FIXED TERM'
  return (t || '').toUpperCase()
}
const CATALOGS = catalogData.catalogs
  .filter(c => c.multiple != null && c.yieldPct != null)
  .slice(0, 8)
  .map((c) => {
    const ebyArr = c.earningsByYear ? Object.values(c.earningsByYear) : null
    return {
      code: `CAT-${String(c.id).padStart(4, '0')}`,
      name: shortenTitle(c.title),
      era: termLabel(c.term),
      tracks: c.trackCount || 0,
      mult: c.multiple,
      yld: c.yieldPct,
      hot: c.isPick,
      tags: c.tags,
      ltm: c.ltm,
      url: c.url,
      sparkData: ebyArr && ebyArr.length >= 3 ? ebyArr : null,
      spark: c.id % 100,
    }
  })

export function CatalogIndex() {
  return (
    <section style={{ borderBottom: '1px solid var(--line)', padding: 'clamp(72px, 8vw, 110px) 0', background: 'var(--bg-2)' }}>
      <div className="sec-pad" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 32px' }}>
        <SectionHead num="04" kicker="THE INDEX"
          title="Catalogs trade like bonds. Read the curve before it prices in."
          sub={`A catalog is a portfolio of compositions and / or masters. Multiples = price ÷ NPS (net publisher's share). Implied yield = annual cash flow ÷ price. We monitor ${catalogData.stats.totalListings.toLocaleString()} listings (${catalogData.stats.openListings} open · ${catalogData.stats.closedComps.toLocaleString()} closed comps), of which ${catalogData.stats.socialCoverage} have deep social coverage from our TikTok / Shorts pipeline.`}
        />
        <div className="row" style={{
          display: 'grid', gap: 1, marginBottom: 18, border: '1px solid var(--line)', background: 'var(--line)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}>
          {[
            { lab: 'OPEN LISTINGS', val: catalogData.stats.openListings.toLocaleString() },
            { lab: 'CLOSED COMPS', val: catalogData.stats.closedComps.toLocaleString() },
            { lab: 'MEDIAN MULTIPLE', val: catalogData.stats.medianMultipleAll.toFixed(2) + '×' },
            { lab: 'BLENDED YIELD', val: catalogData.stats.blendedYield.toFixed(1) + '%' },
            { lab: 'TIKTOK UGC', val: (catalogData.stats.totalTiktokUGC / 1e9).toFixed(2) + 'B' },
            { lab: 'SOUNDS INDEXED', val: catalogData.stats.totalSounds.toLocaleString() },
          ].map(s => (
            <div key={s.lab} style={{ background: 'var(--bg)', padding: '14px 16px' }}>
              <div className="label" style={{ fontSize: 9 }}>{s.lab}</div>
              <div className="tnum" style={{
                fontFamily: 'var(--face-data)', fontSize: 22, fontWeight: 700,
                color: 'var(--text)', marginTop: 4, lineHeight: 1,
              }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
          <div className="cat-header" style={{
            display: 'grid',
            gridTemplateColumns: '120px 1.6fr 130px 100px 100px 100px 160px',
            gap: 16, padding: '12px 22px', borderBottom: '1px solid var(--line)',
            background: 'var(--bg-2)',
          }}>
            {['CODE', 'CATALOG', 'TERM', 'TRACKS', 'MULTIPLE', 'YIELD %', 'EARNINGS HISTORY'].map(h => (
              <span key={h} className="label" style={{ textAlign: h === 'EARNINGS HISTORY' ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {CATALOGS.map((c, i) => (
            <a key={c.code} href={c.url} target="_blank" rel="noopener noreferrer" className="cat-row" style={{
              display: 'grid',
              gridTemplateColumns: '120px 1.6fr 130px 100px 100px 100px 160px',
              gap: 16, padding: '18px 22px', alignItems: 'center',
              borderBottom: i < CATALOGS.length - 1 ? '1px solid var(--line-soft)' : 'none',
              color: 'inherit',
            }}>
              <span className="cat-code" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: c.hot ? 'var(--accent-c)' : 'var(--dim)', letterSpacing: '0.1em' }}>
                {c.hot && <span style={{ color: 'var(--accent-c)', marginRight: 6 }}>●</span>}{c.code}
              </span>
              <span className="cat-name" style={{
                fontFamily: 'var(--face-display)', fontWeight: 'var(--weight-display)',
                fontSize: 16, color: 'var(--text)', letterSpacing: 'var(--tracking-display)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{c.name}</span>
              <span className="cat-era" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--sub)' }}>{c.era}</span>
              <span className="cat-tracks tnum" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>{c.tracks}</span>
              <span className="cat-mult tnum" style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{c.mult.toFixed(2)}×</span>
              <span className="cat-yld tnum" style={{ fontFamily: 'var(--mono)', fontSize: 14, color: c.yld > 8 ? 'var(--positive)' : 'var(--accent-c)', fontWeight: 700 }}>{c.yld.toFixed(1)}%</span>
              <span className="cat-spark">
                <Sparkline
                  data={c.sparkData || makeSeries(c.spark, 36, 50, 6)}
                  color={c.hot ? 'var(--accent-a)' : 'var(--accent-b)'}
                  width={150} height={26} fill
                />
              </span>
            </a>
          ))}
        </div>

        <div className="row" style={{
          marginTop: 32, padding: '32px 28px', border: '1px solid var(--line)',
          background: 'var(--bg)', gap: 32, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div className="col" style={{ gap: 8, flex: '1 1 320px', minWidth: 260 }}>
            <span className="label" style={{ color: 'var(--accent-a)' }}>WAITLIST</span>
            <h3 style={{
              margin: 0, fontFamily: 'var(--face-display)', fontWeight: 'var(--weight-display)',
              fontSize: 'clamp(22px, 2vw, 30px)', letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
            }}>Get early access to the royalty investing terminal.</h3>
            <p style={{ margin: 0, color: 'var(--sub)', fontSize: 14, lineHeight: 1.55 }}>
              Track catalog multiples, royalty streams, and pricing signals before the market catches up.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="row" style={{ gap: 8, flex: '1 1 360px' }}>
            <input type="email" placeholder="you@fund.com" style={{
              flex: 1, minWidth: 0, background: 'var(--bg-2)', border: '1px solid var(--line)',
              padding: '14px 16px', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13,
            }} />
            <button style={{
              background: 'var(--accent-a)', color: 'var(--bg)', border: 'none',
              padding: '14px 22px', fontFamily: 'var(--mono)', fontSize: 11,
              letterSpacing: '0.22em', fontWeight: 700,
            }}>JOIN →</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer style={{ padding: '60px 0 80px' }}>
      <div className="sec-pad" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 32px' }}>
        <div className="row" style={{ alignItems: 'baseline', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--face-display)', fontSize: 'clamp(60px, 14vw, 220px)',
            fontWeight: 'var(--weight-display)', letterSpacing: 'var(--tracking-display)',
            background: 'linear-gradient(96deg, var(--accent-a), var(--accent-b))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 0.85,
          }}>yield.fm</span>
        </div>
        <div className="row footer-meta" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 20, gap: 24, flexWrap: 'wrap' }}>
          <span className="label">© 2026 MNFST INC. · YIELD.FM IS A PRODUCT OF MNFST INC.</span>
          <span className="label">NOT INVESTMENT ADVICE · DEMO DATA · NO OFFER OR SOLICITATION</span>
          <span className="label">SOURCES: IFPI · CISAC · MLC · MIDIA</span>
        </div>
      </div>
    </footer>
  )
}
