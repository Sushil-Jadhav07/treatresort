// Tracking test: run against a build made WITH test IDs, e.g.
//   VITE_GTM_ID=GTM-TEST123 VITE_GA4_ID=G-TEST123456 VITE_META_PIXEL_ID=123456789012345 npx vite build --outDir dist-track
//   node tests/tracking-test.mjs http://localhost:5194
// External tracker hosts are stubbed so the test works offline and never sends real data.
import { chromium } from 'playwright-core'

const BASE = process.argv[2] || 'http://localhost:5194'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
const hits = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|fonts\./.test(m.text()) && errors.push(m.text()))
await page.route(/googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr/, (r) => {
  hits.push(r.request().url().replace(/\?.*/, '').slice(0, 70))
  r.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
})
await page.route('**/api/enquiry.php', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }))
await page.goto(BASE, { waitUntil: 'load' })
await page.waitForTimeout(3500)

const rows = []
const t = (n, ok, d = '') => { rows.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  (' + d + ')' : ''}`) }

t('GTM script requested with the test ID', hits.some((u) => u.includes('gtm.js')), hits.join(' | '))
t('GA4 gtag script requested', hits.some((u) => u.includes('gtag/js')))
t('Meta Pixel script requested', hits.some((u) => u.includes('fbevents.js')))
t('window.fbq defined and PageView queued', await page.evaluate(() => typeof window.fbq === 'function' && window.fbq.queue.some((a) => a[0] === 'track' && a[1] === 'PageView')))

// phone / whatsapp / email clicks (stop the navigation so the test page stays)
await page.evaluate(() => document.getElementById('enquire').scrollIntoView())
await page.waitForTimeout(1500)
await page.evaluate(() => document.addEventListener('click', (e) => e.target.closest('a[href^="tel:"],a[href^="mailto:"],a[href*="wa.me"]') && e.preventDefault(), true))
await page.click('#enquire a[href^="tel:"]')
await page.click('#enquire a[href^="mailto:"]')
await page.click('#enquire a[href*="wa.me"]')
// a failed + a successful enquiry
await page.click('#enquire button[type=submit]')
await page.fill('#enquire [name=first]', 'Test')
await page.fill('#enquire [name=phone]', '9876543210')
await page.fill('#enquire [name=email]', 'test@example.com')
await page.click('#enquire button[type=submit]')
await page.waitForSelector('text=/Thank/')
const events = await page.evaluate(() => window.dataLayer.filter((e) => e && e.event).map((e) => e.event))
for (const ev of ['phone_click', 'email_click', 'whatsapp_click', 'enquiry_submit_error', 'enquiry_submit_success']) t(`dataLayer event: ${ev}`, events.includes(ev))
t('Meta "Lead" fired on success', await page.evaluate(() => window.fbq.queue.some((a) => a[0] === 'track' && a[1] === 'Lead')))
t('no page / console errors', errors.length === 0, errors.join(' | '))
await browser.close()
console.log(`\n${rows.filter(Boolean).length}/${rows.length} passed`)
process.exit(rows.every(Boolean) ? 0 : 1)
