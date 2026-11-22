// End-to-end UI tests (Playwright + system Chrome) against a served production build.
// Needs the dev mock API on :8787 (node scripts/dev-api.mjs) and the build served at BASE.
//   node tests/ui-tests.mjs http://localhost:5196
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const BASE = (process.argv[2] || 'http://localhost:5196').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const dataDir = path.resolve('dev-data')
const outboxFiles = () => (fs.existsSync(path.join(dataDir, 'outbox')) ? fs.readdirSync(path.join(dataDir, 'outbox')).sort() : [])
const storedCount = () => (fs.existsSync(path.join(dataDir, 'enquiries.jsonl')) ? fs.readFileSync(path.join(dataDir, 'enquiries.jsonl'), 'utf8').trim().split('\n').filter(Boolean).length : 0)

const rows = []
const t = (name, ok, detail = '') => {
  rows.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`)
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const IGNORE = /fonts\.(googleapis|gstatic)|googletagmanager|facebook|google\.com\/maps|maps\.google|gstatic|Failed to load resource/i

async function open(ctxOpts = {}, url = BASE + '/') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOpts })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !IGNORE.test(m.text())) logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`) })
  page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message))
  const posts = []
  page.on('request', (r) => { if (r.method() === 'POST' && r.url().includes('/api/enquiry')) posts.push(r.postData()) })
  await page.goto(url, { waitUntil: 'load' })
  return { ctx, page, logs, posts }
}
const toEnquire = async (page) => {
  await page.evaluate(() => document.getElementById('enquire').scrollIntoView())
  await page.waitForTimeout(1800)
}
const fill = async (page, v) => {
  for (const [k, val] of Object.entries(v)) {
    const el = page.locator(`#enquire [name="${k}"]`)
    if ((await el.evaluate((n) => n.tagName)) === 'SELECT') await el.selectOption(val)
    else await el.fill(val)
  }
}

// ---------------------------------------------------------------- hydration / console
{
  const { ctx, page, logs } = await open()
  await page.waitForTimeout(4500)
  const hydrationIssues = logs.filter((l) => /hydrat|did not match|mismatch/i.test(l))
  t('hydration: no hydration warnings in the console', hydrationIssues.length === 0, hydrationIssues[0] || '')
  t('console: no errors/warnings on load (desktop)', logs.length === 0, logs.slice(0, 2).join(' | '))
  const intro = await page.evaluate(() => ({ preloader: !!document.querySelector('[data-preloader]'), seen: sessionStorage.getItem('treat-intro-seen') }))
  t('preloader: first visit plays then goes away, flag stored', !intro.preloader && intro.seen === '1', JSON.stringify(intro))
  await page.reload({ waitUntil: 'load' })
  await page.waitForTimeout(150)
  const second = await page.evaluate(() => ({ skip: document.documentElement.classList.contains('skip-intro'), visible: [...document.querySelectorAll('[data-preloader]')].some((e) => getComputedStyle(e).display !== 'none') }))
  t('preloader: skipped on the 2nd visit of the session (150 ms after load)', second.skip && !second.visible, JSON.stringify(second))
  await ctx.close()
}
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' })
  await page.waitForTimeout(150)
  const hidden = await page.evaluate(() => ![...document.querySelectorAll('[data-preloader]')].some((e) => getComputedStyle(e).display !== 'none'))
  t('preloader: skipped when prefers-reduced-motion is on', hidden)
  await ctx.close()
}

// ---------------------------------------------------------------- form: negative cases first (no requests must go out)
{
  const { ctx, page, posts } = await open()
  await page.waitForTimeout(2500)
  await toEnquire(page)
  const before = storedCount()
  await page.click('#enquire button[type=submit]')
  await page.waitForTimeout(600)
  const errs = await page.locator('#enquire [role=alert]').allTextContents()
  t('empty required fields -> validation errors shown, nothing sent', errs.length >= 3 && posts.length === 0 && storedCount() === before, `${errs.length} messages, ${posts.length} requests`)
  await fill(page, { first: 'Asha', phone: '12345', email: 'nope' })
  await page.click('#enquire button[type=submit]')
  await page.waitForTimeout(500)
  const e2 = (await page.locator('#enquire [role=alert]').allTextContents()).join(' | ')
  t('invalid phone / email -> error messages shown, nothing sent', /valid phone/i.test(e2) && /valid email/i.test(e2) && posts.length === 0, e2.slice(0, 90))
  const thanks = await page.locator('text=/Thank/').count()
  t('no "Thank you" shown after validation failure', thanks === 0)

  // backend returns 500 -> error, NOT thank you
  await fill(page, { phone: '9876543210', email: 'asha@example.com' })
  await page.route('**/api/enquiry.php', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'We could not save your enquiry. Please call us.' }) }))
  await page.click('#enquire button[type=submit]')
  await page.waitForTimeout(900)
  const errBox = await page.locator('#enquire form [role=alert]').allTextContents()
  t('backend 500 -> UI shows the error and NOT "Thank you"', (await page.locator('text=/Thank/').count()) === 0 && errBox.join(' ').includes('could not save'), errBox.join(' ').slice(0, 70))
  await page.unroute('**/api/enquiry.php')
  await page.route('**/api/enquiry.php', (r) => r.abort())
  await page.click('#enquire button[type=submit]')
  await page.waitForTimeout(900)
  const net = await page.locator('#enquire form [role=alert]').allTextContents()
  t('backend unreachable (network error) -> error shown, NOT "Thank you"', (await page.locator('text=/Thank/').count()) === 0 && /could not reach/i.test(net.join(' ')), net.join(' ').slice(0, 70))
  await page.unroute('**/api/enquiry.php')
  await ctx.close()
}

// ---------------------------------------------------------------- happy path (form)
{
  const { ctx, page, posts, logs } = await open()
  await page.waitForTimeout(2500)
  await toEnquire(page)
  const o0 = outboxFiles().length
  const s0 = storedCount()
  await fill(page, { first: 'Meera', last: 'Shah', phone: '+91 98765 43210', email: 'meera@example.com', city: 'Mumbai', property: 'Treat Hotel, Nashik', message: 'Wedding for 200 guests in February.' })
  await page.click('#enquire button[type=submit]')
  await page.waitForSelector('text=/Thank/', { timeout: 8000 })
  await page.waitForTimeout(300)
  const files = outboxFiles()
  const mail = files.length > o0 ? fs.readFileSync(path.join(dataDir, 'outbox', files.at(-1)), 'utf8') : ''
  t('form happy path: "Thank you" shown only after { ok: true }', posts.length === 1 && JSON.parse(posts[0]).first === 'Meera')
  t('form happy path: enquiry emailed (dev outbox) with all fields', /Meera Shah/.test(mail) && /9876543210|98765 43210/.test(mail) && /Treat Hotel, Nashik/.test(mail) && /Wedding for 200/.test(mail) && /info@treatresorts\.com/.test(mail), 'mock outbox: real SMTP not exercised')
  t('form happy path: copy stored', storedCount() === s0 + 1)
  const dl = await page.evaluate(() => (window.dataLayer || []).filter((e) => e.event).map((e) => e.event))
  t('tracking: enquiry_submit_success pushed to dataLayer', dl.includes('enquiry_submit_success'), dl.join(','))
  t('console clean during submit', logs.length === 0, logs[0] || '')
  await ctx.close()
}

// ---------------------------------------------------------------- booking bar -> prefill -> submit
{
  const { ctx, page } = await open()
  await page.waitForTimeout(2500)
  await page.evaluate(() => scrollTo(0, 0))
  await page.click('button:has-text("Select property")')
  await page.click('button:has-text("Treat Beach Resort & Spa, Gholvad")')
  await page.waitForTimeout(500)
  const days = page.locator('button[aria-label]:not([disabled])').filter({ hasText: /^\d+$/ })
  await days.nth(8).click()
  await days.nth(11).click()
  await page.waitForTimeout(400)
  await page.click('button:has-text("Guests")')
  await page.click('[aria-label="More Adults"]')
  await page.keyboard.press('Escape')
  await page.click('button:has-text("Check availability")')
  await page.waitForTimeout(2500)
  const prop = await page.inputValue('#enquire select[name=property]')
  const msg = await page.inputValue('#enquire textarea[name=message]')
  t('booking bar: Check availability pre-fills property, dates, nights, guests', prop === 'Treat Beach Resort & Spa, Gholvad' && /Check-in/.test(msg) && /3 nights/.test(msg) && /3 Adults/.test(msg), msg.slice(0, 80))
  const dl = await page.evaluate(() => (window.dataLayer || []).find((e) => e.event === 'search_bar_submit'))
  t('tracking: search_bar_submit has property, nights, guests', dl && dl.property && dl.nights === 3 && dl.guests === 3, JSON.stringify(dl))
  const o0 = outboxFiles().length
  await fill(page, { first: 'Ravi', phone: '9123456780', email: 'ravi@example.com' })
  await page.click('#enquire button[type=submit]')
  await page.waitForSelector('text=/Thank/', { timeout: 8000 })
  const files = outboxFiles()
  const mail = files.length > o0 ? fs.readFileSync(path.join(dataDir, 'outbox', files.at(-1)), 'utf8') : ''
  t('booking bar -> submit: the email contains the chosen property, dates and guests', /Gholvad/.test(mail) && /Check-in/.test(mail) && /3 nights/.test(mail) && /3 Adults/.test(mail), mail.split('\n').find((l) => l.startsWith('Property')) || '')
  await ctx.close()
}

// ---------------------------------------------------------------- honeypot through the UI
{
  const { ctx, page } = await open()
  await page.waitForTimeout(2500)
  await toEnquire(page)
  const s0 = storedCount()
  const o0 = outboxFiles().length
  await fill(page, { first: 'Bot', phone: '9999999999', email: 'bot@example.com' })
  await page.evaluate(() => { document.querySelector('#enquire input[name=website]').value = 'http://spam.example' })
  await page.click('#enquire button[type=submit]')
  await page.waitForTimeout(1500)
  t('honeypot filled -> rejected silently (nothing stored, nothing emailed)', storedCount() === s0 && outboxFiles().length === o0)
  await ctx.close()
}

// ---------------------------------------------------------------- dead links + SEO-visible bits in the live DOM
{
  const { ctx, page } = await open()
  await page.waitForTimeout(3000)
  const bad = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => { const h = a.getAttribute('href'); return !h || h === '#' }).map((a) => a.textContent.trim().slice(0, 30)))
  t('no link with an empty href or href="#" alone', bad.length === 0, bad.join(', '))
  const footerLinks = await page.evaluate(() => [...document.querySelectorAll('footer a')].map((a) => a.textContent.trim()))
  t('footer: Privacy Policy and Terms links are present (real URLs)', footerLinks.includes('Privacy Policy') && footerLinks.includes('Terms & Conditions'))
  t('testimonial author fixed to "L&T"', (await page.locator('text=L&T Special Stale').count()) === 0 && (await page.locator('#testimonials >> text=L&T').count()) > 0)
  t('palette switcher removed from the header', (await page.locator('[aria-label="Try colour palettes"]').count()) === 0)
  const phones = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')))])
  t('single phone number in tel: links', phones.length === 1 && phones[0] === 'tel:+919615841584', phones.join(','))
  await ctx.close()
}

// ---------------------------------------------------------------- mobile 375
{
  const { ctx, page, logs } = await open({ viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true })
  await page.waitForTimeout(3500)
  const ov0 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.click('[aria-label="Open menu"]')
  await page.waitForTimeout(1200)
  const menuOpen = await page.locator('a:has-text("Wedding Vows"):visible').first().isVisible()
  await page.click('[aria-label="Close menu"]')
  await page.waitForTimeout(800)
  t('mobile 375: no horizontal scroll, menu opens and closes', ov0 === 0 && menuOpen, `overflow ${ov0}`)
  const bar = await page.locator('button:has-text("Check availability")').isVisible()
  t('mobile 375: booking bar visible on the first screen', bar)
  await page.evaluate(() => document.getElementById('properties').scrollIntoView())
  await page.waitForTimeout(1500)
  await page.click('[aria-label="Next property"]')
  await page.waitForTimeout(900)
  const counter = await page.locator('#properties p:has-text("/ 13")').first().textContent()
  t('mobile 375: properties carousel next works', /02/.test(counter), counter.replace(/\s+/g, ' '))
  await page.evaluate(() => document.querySelector('footer').previousElementSibling.scrollIntoView())
  await page.waitForTimeout(2500)
  await page.click('[role=tab]:has-text("Thane")')
  await page.waitForTimeout(600)
  const mapTitle = await page.locator('iframe[title^="Map"]').last().getAttribute('title')
  t('mobile 375: map property chip switches the map', /Thane/.test(mapTitle), mapTitle)
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1200)
  const summary = page.locator('footer summary').first()
  await summary.click()
  t('mobile 375: footer groups fold open', await page.locator('footer details[open]').count() >= 1)
  t('mobile 375: no console errors', logs.length === 0, logs[0] || '')
  await ctx.close()
}

await browser.close()
const failed = rows.filter((r) => !r.ok)
console.log(`\n${rows.length - failed.length}/${rows.length} passed`)
fs.writeFileSync('dev-data/ui-test-results.json', JSON.stringify(rows, null, 1))
process.exit(failed.length ? 1 : 0)
