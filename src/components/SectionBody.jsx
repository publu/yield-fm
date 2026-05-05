import React, { useMemo, useState } from 'react'
import { Sparkline, SectionHead } from './DataComponents'
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
            <span style={{ color: 'var(--sub)' }}>Same play, two checks, different mailboxes. Master share is ~5× larger; composition share is more durable (covers, syncs, samples all still pay).</span>
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

export function YieldMethodology() {
  const stats = catalogData.stats
  const cohortN = 1479
  const meanY = stats.avgYieldTTM
  const medianY = 15.69
  const lorMean = 15.98
  const lorMedian = 13.64
  const conservativeY = stats.avgYieldClosedComps

  // Computed from royalty-exchange/catalog.json closed comps with LTM > $1,000.
  const buckets = [
    { range: '0-5%',    pct: 1,  n: 22  },
    { range: '5-10%',   pct: 15, n: 227 },
    { range: '10-15%',  pct: 29, n: 436 },
    { range: '15-25%',  pct: 33, n: 482 },
    { range: '25-50%',  pct: 18, n: 259 },
    { range: '50-100%', pct: 3,  n: 42  },
    { range: '>100%',   pct: 1,  n: 11  },
  ]
  const maxPct = Math.max(...buckets.map(b => b.pct))

  return (
    <section
      id="yield-methodology"
      style={{
        scrollMarginTop: 80,
        borderBottom: '1px solid var(--line)',
        padding: 'clamp(72px, 8vw, 110px) 0',
        background: 'var(--bg)',
      }}
    >
      <div className="sec-pad" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 32px' }}>
        <SectionHead num="03" kicker="METHODOLOGY"
          title="The 19.82% number, taken apart."
          sub="The hero card averages implied yield across closed comps from royaltyexchange.com. This is real, but it's a trailing snapshot, not a forward promise. Here's the math, the cohort, and where the number comes from."
        />

        <div style={{
          display: 'grid', gap: 1, marginBottom: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          background: 'var(--line)', border: '1px solid var(--line)',
        }}>
          <div style={{ background: 'var(--bg-2)', padding: '22px 24px' }}>
            <div className="label" style={{ color: 'var(--accent-c)' }}>FORMULA</div>
            <div style={{
              marginTop: 12, fontFamily: 'var(--mono)', fontSize: 14,
              lineHeight: 1.7, color: 'var(--text)',
            }}>
              <span style={{ color: 'var(--dim)' }}>implied_yield = </span>
              <br />
              <span style={{ color: 'var(--accent-a)' }}>ltm_royalties</span>
              <span style={{ color: 'var(--dim)' }}> ÷ </span>
              <span style={{ color: 'var(--accent-b)' }}>deal_price</span>
              <span style={{ color: 'var(--dim)' }}> × 100</span>
            </div>
            <div style={{ marginTop: 12, color: 'var(--sub)', fontSize: 12, lineHeight: 1.6 }}>
              LTM = trailing 12 months of royalties for the asset, as reported at sale.
              Deal price = USD-converted clearing price.
            </div>
          </div>
          <div style={{ background: 'var(--bg-2)', padding: '22px 24px' }}>
            <div className="label" style={{ color: 'var(--accent-c)' }}>COHORT</div>
            <div className="tnum" style={{
              marginTop: 8, fontFamily: 'var(--face-data)', fontWeight: 700,
              fontSize: 32, color: 'var(--text)', lineHeight: 1,
            }}>{cohortN.toLocaleString()}</div>
            <div style={{ marginTop: 6, color: 'var(--sub)', fontSize: 12, lineHeight: 1.6 }}>
              closed comps with state=<span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>filled</span>{' '}
              and LTM royalties &gt; <span className="tnum">$1,000</span> (drops empty / placeholder rows).
            </div>
          </div>
          <div style={{ background: 'var(--bg-2)', padding: '22px 24px' }}>
            <div className="label" style={{ color: 'var(--accent-c)' }}>RESULT</div>
            <div className="row" style={{ alignItems: 'baseline', gap: 14, marginTop: 8 }}>
              <span className="tnum" style={{
                fontFamily: 'var(--face-data)', fontWeight: 700, fontSize: 32,
                color: 'var(--accent-c)', lineHeight: 1,
              }}>{meanY.toFixed(2)}%</span>
              <span className="label" style={{ color: 'var(--dim)' }}>MEAN</span>
            </div>
            <div className="row" style={{ alignItems: 'baseline', gap: 14, marginTop: 8 }}>
              <span className="tnum" style={{
                fontFamily: 'var(--face-data)', fontWeight: 700, fontSize: 22,
                color: 'var(--text)', lineHeight: 1,
              }}>{medianY.toFixed(2)}%</span>
              <span className="label" style={{ color: 'var(--dim)' }}>MEDIAN</span>
            </div>
            <div style={{ marginTop: 10, color: 'var(--sub)', fontSize: 12, lineHeight: 1.6 }}>
              Right-skewed distribution. Mean is pulled up by short-term partial deals.
            </div>
          </div>
        </div>

        <div style={{
          border: '1px solid var(--line)', background: 'var(--bg-2)',
          padding: '24px 28px', marginBottom: 24,
        }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <span className="label">DISTRIBUTION · IMPLIED YIELD ACROSS COHORT</span>
            <span className="label tnum" style={{ color: 'var(--dim)' }}>n = {cohortN.toLocaleString()}</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {buckets.map(b => (
              <div key={b.range} className="row" style={{ gap: 14, alignItems: 'center' }}>
                <span className="tnum" style={{
                  fontFamily: 'var(--mono)', fontSize: 11,
                  color: 'var(--sub)', width: 76, textAlign: 'right',
                }}>{b.range}</span>
                <div style={{
                  flex: 1, height: 14, background: 'var(--bg)',
                  border: '1px solid var(--line)', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(b.pct / maxPct) * 100}%`, height: '100%',
                    background: b.range === '15-25%'
                      ? 'var(--accent-c)'
                      : 'color-mix(in oklab, var(--accent-a) 65%, transparent)',
                    transition: 'width 800ms ease-out',
                  }} />
                </div>
                <span className="tnum" style={{
                  fontFamily: 'var(--mono)', fontSize: 11,
                  color: 'var(--text)', width: 50, textAlign: 'right',
                }}>{b.pct}%</span>
                <span className="tnum" style={{
                  fontFamily: 'var(--mono)', fontSize: 10,
                  color: 'var(--dim)', width: 60, textAlign: 'right',
                }}>n={b.n}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)',
            color: 'var(--sub)', fontSize: 12, lineHeight: 1.6,
          }}>
            The bucket containing the mean (15-25%) is highlighted. ~33% of comps sit there;
            ~45% below, ~22% above. The right tail (50%+ yields, ~4% of cohort) is what
            pulls the mean (19.82%) above the median (15.69%).
          </div>
        </div>

        <div style={{
          display: 'grid', gap: 1, marginBottom: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          background: 'var(--line)', border: '1px solid var(--line)',
        }}>
          {[
            { lab: 'ALL CLOSED COMPS · FILTERED', val: `${meanY.toFixed(2)}%`,  sub: `n=${cohortN.toLocaleString()} · headline number`, hi: true },
            { lab: 'LIFE OF RIGHTS · FILLED ONLY',  val: `${lorMean.toFixed(2)}%`, sub: `n=948 · permanent ownership only` },
            { lab: 'LIFE OF RIGHTS · MEDIAN',       val: `${lorMedian.toFixed(2)}%`, sub: `the typical permanent comp` },
            { lab: 'CONSERVATIVE BLEND · MNFST',    val: `${conservativeY.toFixed(2)}%`, sub: `also stored as avgYieldClosedComps` },
          ].map(c => (
            <div key={c.lab} style={{ background: 'var(--bg-2)', padding: '18px 22px' }}>
              <div className="label" style={{ fontSize: 9, color: c.hi ? 'var(--accent-c)' : 'var(--dim)' }}>{c.lab}</div>
              <div className="tnum" style={{
                marginTop: 6, fontFamily: 'var(--face-data)', fontWeight: 700,
                fontSize: 26, lineHeight: 1,
                color: c.hi ? 'var(--accent-c)' : 'var(--text)',
              }}>{c.val}</div>
              <div style={{ marginTop: 6, color: 'var(--sub)', fontSize: 11, lineHeight: 1.5 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="primer-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1, background: 'var(--line)', border: '1px solid var(--line)',
        }}>
          {[
            {
              k: 'WHY IT LOOKS HIGH',
              title: 'Trailing snapshot, not a forward yield.',
              body: 'Numerator is last year\'s royalties; denominator is the historical clearing price. New buyers pay current market multiples, so realized cash-on-cash for a fresh purchase is materially lower. Royalty curves also decay year-over-year for most catalogs — LTM almost always overstates run-rate.',
              color: 'var(--accent-c)',
            },
            {
              k: 'THE PARTIAL-DEAL EFFECT',
              title: 'Short-term terms inflate the mean.',
              body: 'About a third of the cohort are partial-rights deals (10y, 30y, fixed-return) where the price already discounts for principal recovery. That makes price-to-LTM ratios optically juicy — yields like 96%, 99%, 111% in the data are typically these. Strip them out and the life-of-rights mean drops to 15.98% (median 13.64%).',
              color: 'var(--accent-b)',
            },
            {
              k: 'WHAT A BUYER ACTUALLY GETS',
              title: 'Honest range: 12 - 16% on permanent rights.',
              body: 'For a clean life-of-rights catalog at today\'s asks, target net cash yield sits roughly between the LoR median (13%) and LoR mean (16%). Anything above that needs a story — viral moment, sync flip, undermarketed catalog — which is exactly the gap our TikTok / Shorts pipeline is built to spot.',
              color: 'var(--accent-a)',
            },
            {
              k: 'WHY WE STILL SHOW 19.82%',
              title: 'The market clears here. So the comps say what they say.',
              body: 'We don\'t want to massage the headline. The figure reflects what royaltyexchange.com\'s closed comps actually averaged, with only a noise filter (LTM > $1k). Investors deserve the full distribution, not a cherry-picked midpoint. The methodology section is one click away on purpose.',
              color: 'var(--accent-d)',
            },
          ].map((c) => (
            <div key={c.k} style={{
              background: 'var(--bg)', padding: '28px 28px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <span className="label" style={{ color: c.color }}>{c.k}</span>
              <h3 style={{
                margin: 0, fontFamily: 'var(--face-display)',
                fontWeight: 'var(--weight-display)', fontSize: 'clamp(20px, 1.8vw, 26px)',
                lineHeight: 1.15, letterSpacing: 'var(--tracking-display)', color: 'var(--text)',
              }}>{c.title}</h3>
              <p style={{ margin: 0, color: 'var(--sub)', fontSize: 13, lineHeight: 1.65 }}>{c.body}</p>
            </div>
          ))}
        </div>

        <div className="row" style={{
          marginTop: 24, padding: '16px 22px',
          border: '1px solid var(--line)', background: 'var(--bg-2)',
          gap: 18, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span className="label" style={{ color: 'var(--dim)' }}>SOURCE</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>
            royaltyexchange.com closed-comp database · synced {stats.asOf}
          </span>
          <span style={{ flex: 1 }} />
          <span className="label" style={{ color: 'var(--dim)' }}>LAST RECOMPUTED</span>
          <span className="tnum" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>
            {stats.asOf}
          </span>
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

function fmtMoney(n) {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function fmtUgc(n) {
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString()
}

function normalizeCatalog(c) {
  const ebyArr = c.earningsByYear ? Object.values(c.earningsByYear) : null
  return {
    code: `CAT-${String(c.id).padStart(4, '0')}`,
    id: c.id,
    name: shortenTitle(c.title),
    title: c.title,
    era: termLabel(c.term),
    tracks: c.trackCount || 0,
    mult: c.multiple,
    yld: c.yieldPct,
    hot: c.isPick,
    tags: c.tags || [],
    ltm: c.ltm,
    url: c.url,
    topSong: c.topSong,
    topUgc: c.topUgc || 0,
    sparkData: ebyArr && ebyArr.length >= 3 ? ebyArr : null,
  }
}

const MAPPED_CATALOGS = catalogData.catalogs
  .filter(c => c.multiple != null && c.yieldPct != null)
  .map(normalizeCatalog)

const CATALOGS = MAPPED_CATALOGS
  .filter(c => c.multiple != null && c.yieldPct != null)
  .slice(0, 8)

function RoyaltyMap() {
  const [filter, setFilter] = useState('all')
  const [activeId, setActiveId] = useState(MAPPED_CATALOGS.find(c => c.hot)?.id || MAPPED_CATALOGS[0]?.id)
  const mapped = useMemo(() => {
    const pool = MAPPED_CATALOGS
      .filter(c => {
        if (filter === 'picks') return c.hot
        if (filter === 'social') return c.topUgc > 500_000
        if (filter === 'yield') return c.yld >= 15
        return true
      })
      .slice(0, 72)
    return pool
  }, [filter])
  const active = mapped.find(c => c.id === activeId) || mapped[0] || MAPPED_CATALOGS[0]
  const xMin = 3
  const xMax = 12
  const yMin = 0
  const yMax = 45
  const xPct = (v) => Math.max(4, Math.min(96, ((v - xMin) / (xMax - xMin)) * 100))
  const yPct = (v) => Math.max(5, Math.min(94, 100 - ((v - yMin) / (yMax - yMin)) * 100))

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, 0.85fr)',
      gap: 1,
      background: 'var(--line)',
      border: '1px solid var(--line)',
      marginBottom: 28,
    }} className="royalty-map-grid">
      <div style={{ background: 'var(--bg)', padding: '22px 22px 18px' }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 16, alignItems: 'start', marginBottom: 18, flexWrap: 'wrap' }}>
          <div className="col" style={{ gap: 7 }}>
            <span className="label" style={{ color: 'var(--accent-a)' }}>ROYALTY MAP · CASH FLOW VS PRICE</span>
            <h3 style={{
              margin: 0,
              fontFamily: 'var(--face-display)',
              fontWeight: 'var(--weight-display)',
              fontSize: 'clamp(24px, 2.4vw, 38px)',
              letterSpacing: 'var(--tracking-display)',
              lineHeight: 1.05,
              color: 'var(--text)',
            }}>Find the catalogs that look cheap before the demand signal hits the comp set.</h3>
          </div>
          <div className="row royalty-map-filters" style={{ gap: 0, border: '1px solid var(--line)', flexShrink: 0 }}>
            {[
              ['all', 'All'],
              ['picks', 'Picks'],
              ['social', 'Social heat'],
              ['yield', '15%+ yield'],
            ].map(([id, label], i) => (
              <button
                key={id}
                onClick={() => { setFilter(id); setActiveId(null) }}
                style={{
                  minHeight: 40,
                  padding: '0 12px',
                  border: 'none',
                  borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
                  background: filter === id ? 'var(--accent-a)' : 'transparent',
                  color: filter === id ? 'var(--bg)' : 'var(--sub)',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="royalty-map-plot" style={{
          position: 'relative',
          minHeight: 430,
          border: '1px solid var(--line)',
          overflow: 'hidden',
          background: `
            linear-gradient(var(--line-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--line-soft) 1px, transparent 1px),
            radial-gradient(circle at 72% 24%, color-mix(in oklab, var(--accent-c) 14%, transparent), transparent 32%),
            var(--bg-2)
          `,
          backgroundSize: '100% 25%, 16.66% 100%, 100% 100%, 100% 100%',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', left: '4%', right: '4%', top: `${yPct(15)}%`,
            borderTop: '1px dashed color-mix(in oklab, var(--accent-c) 70%, transparent)',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', left: `${xPct(8)}%`, top: '5%', bottom: '9%',
            borderLeft: '1px dashed color-mix(in oklab, var(--accent-b) 70%, transparent)',
          }} />
          <span className="label" style={{ position: 'absolute', left: 14, top: 12, color: 'var(--accent-c)' }}>HIGH YIELD</span>
          <span className="label" style={{ position: 'absolute', right: 14, bottom: 12, color: 'var(--dim)' }}>HIGH MULTIPLE</span>
          <span className="label" style={{ position: 'absolute', left: 14, bottom: 12, color: 'var(--dim)' }}>LOW MULTIPLE</span>
          <span className="label" style={{
            position: 'absolute', right: 14, top: 12,
            color: 'var(--accent-a)',
          }}>SIGNAL HEAT = POINT SIZE</span>

          {mapped.map((c) => {
            const isActive = active?.id === c.id
            const socialBoost = c.topUgc > 0 ? Math.log10(c.topUgc + 10) : 0
            const size = Math.max(12, Math.min(34, 10 + socialBoost * 3 + (c.hot ? 7 : 0)))
            return (
              <button
                key={c.id}
                onMouseEnter={() => setActiveId(c.id)}
                onFocus={() => setActiveId(c.id)}
                onClick={() => setActiveId(c.id)}
                title={`${c.name} · ${c.mult.toFixed(2)}x · ${c.yld.toFixed(1)}%`}
                aria-label={`${c.name}, ${c.mult.toFixed(2)} multiple, ${c.yld.toFixed(1)} percent yield`}
                style={{
                  position: 'absolute',
                  left: `${xPct(c.mult)}%`,
                  top: `${yPct(c.yld)}%`,
                  width: size,
                  height: size,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: 999,
                  border: isActive ? '2px solid var(--text)' : `1px solid ${c.hot ? 'var(--accent-c)' : 'var(--accent-a)'}`,
                  background: c.hot
                    ? 'color-mix(in oklab, var(--accent-c) 42%, var(--bg))'
                    : 'color-mix(in oklab, var(--accent-a) 30%, var(--bg))',
                  boxShadow: isActive
                    ? '0 0 0 6px color-mix(in oklab, var(--accent-a) 18%, transparent), 0 0 24px color-mix(in oklab, var(--accent-a) 36%, transparent)'
                    : '0 0 16px color-mix(in oklab, var(--accent-a) 18%, transparent)',
                  opacity: isActive ? 1 : 0.76,
                  transition: 'transform 160ms ease-out, opacity 160ms ease-out, box-shadow 160ms ease-out',
                }}
              />
            )
          })}
        </div>
      </div>

      <div style={{ background: 'var(--bg-2)', padding: '22px 22px', minWidth: 0 }}>
        {active && (
          <div className="col" style={{ gap: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'start', gap: 14 }}>
              <div className="col" style={{ gap: 8, minWidth: 0 }}>
                <span className="label" style={{ color: active.hot ? 'var(--accent-c)' : 'var(--accent-a)' }}>
                  {active.hot ? 'MNFST PICK' : active.code}
                </span>
                <h3 style={{
                  margin: 0,
                  fontFamily: 'var(--face-display)',
                  fontWeight: 'var(--weight-display)',
                  fontSize: 28,
                  lineHeight: 1.05,
                  letterSpacing: 'var(--tracking-display)',
                  color: 'var(--text)',
                }}>{active.name}</h3>
              </div>
              {active.url && (
                <a href={active.url} target="_blank" rel="noopener noreferrer" className="label" style={{ color: 'var(--accent-a)', whiteSpace: 'nowrap' }}>
                  SOURCE ↗
                </a>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
              {[
                ['MULTIPLE', `${active.mult.toFixed(2)}x`],
                ['IMPLIED YIELD', `${active.yld.toFixed(1)}%`],
                ['LTM ROYALTIES', fmtMoney(active.ltm)],
                ['TIKTOK UGC', fmtUgc(active.topUgc)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg)', padding: '14px 14px' }}>
                  <div className="label" style={{ fontSize: 9 }}>{k}</div>
                  <div className="tnum" style={{ marginTop: 5, color: 'var(--text)', fontFamily: 'var(--face-data)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="col" style={{ gap: 9 }}>
              <span className="label">WHY IT MATTERS</span>
              <p style={{ margin: 0, color: 'var(--sub)', fontSize: 13, lineHeight: 1.65 }}>
                This point sits at <span className="tnum" style={{ color: 'var(--text)' }}>{active.mult.toFixed(2)}x</span> price-to-cash-flow
                and <span className="tnum" style={{ color: 'var(--text)' }}>{active.yld.toFixed(1)}%</span> trailing yield.
                {active.topUgc > 0
                  ? ` The social layer adds ${fmtUgc(active.topUgc)} TikTok creations tied to the catalog signal.`
                  : ' No major TikTok heat is attached yet, so the thesis is mostly cash-flow driven.'}
              </p>
            </div>

            <div className="col" style={{ gap: 9 }}>
              <span className="label">TAGS</span>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {[active.era, `${active.tracks} TRACKS`, ...(active.tags || []).slice(0, 4)].map(t => (
                  <span key={t} style={{
                    border: '1px solid var(--line)',
                    color: 'var(--sub)',
                    padding: '5px 8px',
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {active.sparkData && (
              <div className="col" style={{ gap: 10 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label">EARNINGS HISTORY</span>
                  <span className="label tnum" style={{ color: 'var(--dim)' }}>{active.sparkData.length}Y</span>
                </div>
                <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', padding: '16px' }}>
                  <Sparkline data={active.sparkData} color={active.hot ? 'var(--accent-c)' : 'var(--accent-a)'} width={280} height={58} fill />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function CatalogIndex() {
  return (
    <section id="catalog-index" style={{ scrollMarginTop: 80, borderBottom: '1px solid var(--line)', padding: 'clamp(72px, 8vw, 110px) 0', background: 'var(--bg-2)' }}>
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
        <RoyaltyMap />
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
            <a
              key={c.code}
              href={c.url || '#'}
              target={c.url ? '_blank' : undefined}
              rel={c.url ? 'noopener noreferrer' : undefined}
              className="cat-row"
              title={c.url ? 'Open on Royalty Exchange' : undefined}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.6fr 130px 100px 100px 100px 160px',
                gap: 16, padding: '18px 22px', alignItems: 'center',
                borderBottom: i < CATALOGS.length - 1 ? '1px solid var(--line-soft)' : 'none',
                color: 'inherit', textDecoration: 'none',
                transition: 'background 140ms',
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
              <span className="cat-spark" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                {c.sparkData && (
                  <Sparkline
                    data={c.sparkData}
                    color={c.hot ? 'var(--accent-a)' : 'var(--accent-b)'}
                    width={130} height={26} fill
                  />
                )}
                {c.url && (
                  <span aria-hidden="true" style={{
                    fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)',
                  }}>↗</span>
                )}
              </span>
            </a>
          ))}
        </div>

        <div id="waitlist" className="row" style={{
          scrollMarginTop: 90,
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
            <input type="email" placeholder="ListenTo@Music.com" style={{
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
          <span className="label">NOT INVESTMENT ADVICE · NO OFFER OR SOLICITATION</span>
          <span className="label">SOURCES: IFPI · CISAC · MLC · MIDIA</span>
        </div>
      </div>
    </footer>
  )
}
