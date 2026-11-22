// Tracking: GTM, GA4 and Meta Pixel, each loaded ONLY when its env var is set.
//   VITE_GTM_ID        e.g. GTM-XXXXXXX
//   VITE_GA4_ID        e.g. G-XXXXXXXXXX
//   VITE_META_PIXEL_ID e.g. 123456789012345
// With no IDs nothing is loaded and nothing is logged. Events are always pushed to window.dataLayer
// (harmless without GTM). NOTE: if you load GA4 here AND add a GA4 tag inside GTM, pageviews are
// counted twice, so use one or the other.
const GTM = import.meta.env.VITE_GTM_ID
const GA4 = import.meta.env.VITE_GA4_ID
const PIXEL = import.meta.env.VITE_META_PIXEL_ID

const inject = (src, attrs = {}) => {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
  document.head.appendChild(s)
}

let started = false

export function initTracking() {
  if (started || typeof window === 'undefined') return
  started = true
  window.dataLayer = window.dataLayer || []

  if (GTM) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    inject(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM)}`)
  }
  if (GA4) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments) // eslint-disable-line prefer-rest-params
    }
    window.gtag('js', new Date())
    window.gtag('config', GA4)
    inject(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4)}`)
  }
  if (PIXEL) {
    /* Meta Pixel base code */
    if (!window.fbq) {
      const n = (window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      })
      if (!window._fbq) window._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
    }
    inject('https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', PIXEL)
    window.fbq('track', 'PageView')
  }

  // phone / WhatsApp / email clicks, anywhere on the page
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (href.startsWith('tel:')) track('phone_click', { number: href.slice(4).replace(/\s/g, '') }, 'Contact')
      else if (/wa\.me|api\.whatsapp\.com/.test(href)) track('whatsapp_click', {}, 'Contact')
      else if (href.startsWith('mailto:')) track('email_click', {}, 'Contact')
    },
    { capture: true },
  )
}

/**
 * Push an event. `metaEvent` optionally maps it to a Meta standard event (e.g. 'Lead', 'Contact').
 */
export function track(event, data = {}, metaEvent) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...data })
  if (GA4 && window.gtag) window.gtag('event', event, data)
  if (PIXEL && window.fbq && metaEvent) window.fbq('track', metaEvent)
}
