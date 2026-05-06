const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

async function notifyTelegram({ email, source, page, ip, userAgent }) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.WAITLIST_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.info('waitlist_lead', JSON.stringify({
      email,
      source: source || 'site',
      page: page || '',
      ip,
      userAgent: userAgent ? userAgent.slice(0, 180) : '',
      time: new Date().toISOString(),
      delivery: 'vercel-log',
    }))
    return
  }

  const text = [
    '<b>yield.fm waitlist</b>',
    `Email: <code>${escapeHtml(email)}</code>`,
    `Source: ${escapeHtml(source || 'site')}`,
    page ? `Page: ${escapeHtml(page)}` : null,
    `IP: ${escapeHtml(ip)}`,
    userAgent ? `UA: ${escapeHtml(userAgent.slice(0, 180))}` : null,
    `Time: ${new Date().toISOString()}`,
  ].filter(Boolean).join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Telegram notification failed: ${errorText.slice(0, 200)}`)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, { error: 'Method not allowed' })
  }

  try {
    const body = await readBody(req)

    if (body.company) {
      return json(res, 200, { ok: true })
    }

    const email = String(body.email || '').trim().toLowerCase()
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return json(res, 400, { error: 'Enter a valid email' })
    }

    await notifyTelegram({
      email,
      source: String(body.source || 'yield.fm waitlist').slice(0, 120),
      page: String(body.page || '').slice(0, 500),
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || ''),
    })

    return json(res, 200, { ok: true })
  } catch (error) {
    console.error('waitlist_submit_failed', error)
    return json(res, 500, { error: 'Could not join waitlist' })
  }
}
