const ENDPOINT = '/api/sync'
const VISITOR_KEY = 'yfm_vid'
const SESSION_KEY = 'yfm_sid'
const SESSION_TS_KEY = 'yfm_sts'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const FLUSH_INTERVAL_MS = 4000
const MAX_BATCH = 24

let visitorId = ''
let sessionId = ''
let queue = []
let flushTimer = null
let initialized = false
let disabled = false
let scrollMarks = new Set()
let pageEnteredAt = 0

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function safeStorage(area) {
  try {
    const s = window[area]
    s.setItem('__yfm_t', '1')
    s.removeItem('__yfm_t')
    return s
  } catch {
    return null
  }
}

function ensureIds() {
  const ls = safeStorage('localStorage')
  const ss = safeStorage('sessionStorage')

  visitorId = ls?.getItem(VISITOR_KEY) || ''
  if (!visitorId) {
    visitorId = uuid()
    ls?.setItem(VISITOR_KEY, visitorId)
  }

  sessionId = ss?.getItem(SESSION_KEY) || ''
  const lastTs = Number(ls?.getItem(SESSION_TS_KEY) || 0)
  const now = Date.now()
  if (!sessionId || (lastTs && now - lastTs > SESSION_TIMEOUT_MS)) {
    sessionId = uuid()
    ss?.setItem(SESSION_KEY, sessionId)
  }
  ls?.setItem(SESSION_TS_KEY, String(now))
  return !lastTs || now - lastTs > SESSION_TIMEOUT_MS
}

function readUtm() {
  try {
    const params = new URLSearchParams(window.location.search)
    const utm = {}
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref']) {
      const v = params.get(k)
      if (v) utm[k] = v.slice(0, 120)
    }
    return utm
  } catch {
    return {}
  }
}

function buildBaseEvent(name, props) {
  return {
    name,
    visitorId,
    sessionId,
    ts: Date.now(),
    page: typeof location !== 'undefined' ? location.pathname + location.search : '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    props: props || {},
  }
}

function flush(useBeacon = false) {
  if (queue.length === 0) return
  const events = queue.splice(0, MAX_BATCH)
  const payload = JSON.stringify({ events })

  try {
    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(ENDPOINT, blob)
      return
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // swallow
  }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush(false)
  }, FLUSH_INTERVAL_MS)
}

export function track(name, props) {
  if (disabled || !initialized) return
  queue.push(buildBaseEvent(name, props))
  if (queue.length >= MAX_BATCH || name === 'session_start' || name === 'waitlist_success' || name === 'waitlist_error') {
    flush(false)
    return
  }
  scheduleFlush()
}

function attachScrollDepth() {
  const marks = [25, 50, 75, 100]
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const doc = document.documentElement
      const scrollable = (doc.scrollHeight - window.innerHeight) || 1
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      for (const m of marks) {
        if (pct >= m && !scrollMarks.has(m)) {
          scrollMarks.add(m)
          track('scroll_depth', { pct: m })
        }
      }
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
}

function attachLifecycle() {
  const handleHidden = () => {
    if (document.visibilityState === 'hidden') {
      const dwellMs = Date.now() - pageEnteredAt
      track('session_end', {
        dwell_ms: dwellMs,
        max_scroll: scrollMarks.size ? Math.max(...scrollMarks) : 0,
      })
      flush(true)
    }
  }
  document.addEventListener('visibilitychange', handleHidden)
  window.addEventListener('pagehide', () => {
    const dwellMs = Date.now() - pageEnteredAt
    queue.push(buildBaseEvent('session_end', {
      dwell_ms: dwellMs,
      max_scroll: scrollMarks.size ? Math.max(...scrollMarks) : 0,
    }))
    flush(true)
  })
}

export function initTracking({ debug = false } = {}) {
  if (initialized || typeof window === 'undefined') return
  if (debug) {
    disabled = true
    return
  }
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
      disabled = true
      return
    }
  } catch {
    // continue
  }
  initialized = true
  pageEnteredAt = Date.now()
  const isNewSession = ensureIds()
  const utm = readUtm()

  const baseProps = {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    lang: navigator.language || '',
    tz: (() => {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' }
    })(),
    title: document.title || '',
    ...utm,
  }

  if (isNewSession) {
    track('session_start', baseProps)
  }
  track('pageview', baseProps)

  attachScrollDepth()
  attachLifecycle()
}
