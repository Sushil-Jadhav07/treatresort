// DEV-ONLY mock of public/api/enquiry.php (same contract) so the form can be developed and tested
// without PHP.  node scripts/dev-api.mjs   ->  http://localhost:8787/api/enquiry.php
// "Emails" are written to dev-data/outbox/ and stored enquiries to dev-data/enquiries.jsonl.
// The real endpoint is the PHP file: verify it after deploy with  node tests/api-contract.mjs <site-url>
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = Number(process.env.PORT || 8787)
const MAX = 16384
const RATE_MAX = 5
const RATE_WINDOW = 600_000
const dataDir = path.resolve('dev-data')
fs.mkdirSync(path.join(dataDir, 'outbox'), { recursive: true })
const hits = new Map()

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}
const clean = (v, max) => String(v ?? '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, max)

http
  .createServer((req, res) => {
    if (!req.url.startsWith('/api/enquiry')) return send(res, 404, { ok: false })
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Method not allowed' }, { Allow: 'POST' })
    if (req.headers['x-test-fail']) return send(res, 500, { ok: false, error: 'We could not save your enquiry. Please call us.' })
    if (Number(req.headers['content-length'] || 0) > MAX) return send(res, 413, { ok: false, error: 'Request too large' })

    let raw = ''
    let tooBig = false
    req.on('data', (c) => {
      raw += c
      if (raw.length > MAX) tooBig = true
    })
    req.on('end', () => {
      if (tooBig) return send(res, 413, { ok: false, error: 'Request too large' })
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim()
      const now = Date.now()
      const list = (hits.get(ip) || []).filter((t) => t > now - RATE_WINDOW)
      if (list.length >= RATE_MAX) {
        return send(res, 429, { ok: false, error: 'Too many requests. Please try again later.' }, { 'Retry-After': String(Math.ceil((RATE_WINDOW - (now - list[0])) / 1000)) })
      }
      list.push(now)
      hits.set(ip, list)

      let input
      try {
        input = JSON.parse(raw)
        if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new Error()
      } catch {
        return send(res, 400, { ok: false, error: 'Invalid JSON' })
      }
      if (String(input.website ?? '').trim() !== '') return send(res, 200, { ok: true }) // honeypot: silent

      const d = {
        first: clean(input.first, 80), last: clean(input.last, 80), phone: clean(input.phone, 30), email: clean(input.email, 120),
        city: clean(input.city, 80), property: clean(input.property, 120), message: clean(input.message, 2000),
      }
      const errors = {}
      if (!d.first) errors.first = 'Please enter your first name.'
      const digits = d.phone.replace(/\D/g, '')
      if (!d.phone) errors.phone = 'Please enter your phone number.'
      else if (!/^[0-9+\-\s()]+$/.test(d.phone) || digits.length < 10 || digits.length > 15) errors.phone = 'Enter a valid phone number (10 to 15 digits).'
      if (!d.email) errors.email = 'Please enter your email address.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = 'Enter a valid email address.'
      if (Object.keys(errors).length) return send(res, 422, { ok: false, errors })

      const record = { ...d, received_at: new Date().toISOString(), ip }
      fs.appendFileSync(path.join(dataDir, 'enquiries.jsonl'), JSON.stringify(record) + '\n')
      const body = `To: ${process.env.ENQUIRY_TO_EMAIL || 'info@treatresorts.com'}\nSubject: New website enquiry: ${d.first} ${d.last}${d.property ? ` (${d.property})` : ''}\n\nName: ${d.first} ${d.last}\nPhone: ${d.phone}\nEmail: ${d.email}\nCity: ${d.city}\nProperty: ${d.property}\n\nMessage:\n${d.message}\n`
      fs.writeFileSync(path.join(dataDir, 'outbox', `${Date.now()}.txt`), body)
      send(res, 200, { ok: true, emailed: true })
    })
  })
  .listen(PORT, () => console.log(`dev enquiry API on http://localhost:${PORT}/api/enquiry.php`))
