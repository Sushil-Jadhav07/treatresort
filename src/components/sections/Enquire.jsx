import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react'
import { EASE, Eyebrow, Heading, Reveal } from '../ui'
import { brand, enquire } from '../../data/content'
import { track } from '../../lib/analytics'

const initial = { first: '', last: '', phone: '', email: '', city: '', property: '', message: '' }
const ENDPOINT = import.meta.env.VITE_ENQUIRY_ENDPOINT || '/api/enquiry.php'
const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

/** Same rules as the server (public/api/enquiry.php): the server is the one that really enforces them. */
function validate(f) {
  const e = {}
  if (!f.first.trim()) e.first = 'Please enter your first name.'
  const digits = f.phone.replace(/\D/g, '')
  if (!f.phone.trim()) e.phone = 'Please enter your phone number.'
  else if (!/^[0-9+\-\s()]+$/.test(f.phone) || digits.length < 10 || digits.length > 15) e.phone = 'Enter a valid phone number (10 to 15 digits).'
  if (!f.email.trim()) e.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address.'
  return e
}

function Input({ label, name, value, onChange, type = 'text', required, error, children, className = '', ...rest }) {
  const base =
    'peer w-full border-0 border-b border-ink/30 bg-transparent px-0 pb-3 pt-6 text-[1rem] text-ink outline-none transition-colors placeholder-transparent focus:border-terra'
  return (
    <div className={`relative ${className}`}>
      {children ? (
        <>
          <select name={name} value={value} onChange={onChange} required={required} className={`${base} appearance-none pr-8 ${error ? '!border-terra-deep' : ''}`} aria-invalid={!!error} {...rest}>
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-4 right-0 h-4 w-4 text-ink/60" />
        </>
      ) : type === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} required={required} placeholder={label} rows={3} className={`${base} resize-none ${error ? '!border-terra-deep' : ''}`} aria-invalid={!!error} {...rest} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={label} className={`${base} ${error ? '!border-terra-deep' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined} {...rest} />
      )}
      <label
        className={`pointer-events-none absolute left-0 origin-left text-ink/55 transition-all duration-300 ${
          children
            ? `top-0 text-[0.64rem] uppercase tracking-[0.22em]`
            : 'top-0 text-[0.64rem] uppercase tracking-[0.22em] peer-placeholder-shown:top-6 peer-placeholder-shown:text-[0.95rem] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-0 peer-focus:text-[0.64rem] peer-focus:uppercase peer-focus:tracking-[0.22em] peer-focus:text-terra'
        }`}
      >
        {label}
        {required && ' *'}
      </label>
      {error && (
        <p id={`${name}-err`} role="alert" className="mt-1.5 text-[0.78rem] text-terra-deep">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Enquire() {
  const [form, setForm] = useState(initial)
  const [sent, setSent] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [token, setToken] = useState('')
  const widget = useRef(null)

  // optional Cloudflare Turnstile (only when VITE_TURNSTILE_SITE_KEY is set)
  useEffect(() => {
    if (!TURNSTILE_KEY || sent || !widget.current) return
    const mount = () => window.turnstile?.render(widget.current, { sitekey: TURNSTILE_KEY, callback: setToken, 'expired-callback': () => setToken('') })
    if (window.turnstile) mount()
    else {
      const sc = document.createElement('script')
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      sc.async = true
      sc.onload = mount
      document.head.appendChild(sc)
    }
  }, [sent])

  useEffect(() => {
    const onPrefill = (e) => setForm((f) => ({ ...f, ...e.detail }))
    window.addEventListener('treat:prefill', onPrefill)
    return () => window.removeEventListener('treat:prefill', onPrefill)
  }, [])

  const set = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setFormError('')
    const local = validate(form)
    if (Object.keys(local).length) {
      setErrors(local)
      track('enquiry_submit_error', { reason: 'validation', fields: Object.keys(local).join(',') })
      return
    }
    setErrors({})
    setStatus('sending')
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)
    try {
      const body = { ...form, website: e.currentTarget.elements.website?.value || '', turnstile: token }
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.ok === true) {
        track('enquiry_submit_success', { property: form.property || undefined }, 'Lead')
        setSent(true)
      } else if (res.status === 422 && json?.errors) {
        setErrors(json.errors)
        track('enquiry_submit_error', { reason: 'validation_server', status: 422 })
      } else {
        setFormError(json?.error || 'Something went wrong. Please try again, or call us.')
        track('enquiry_submit_error', { reason: 'server', status: res.status })
      }
    } catch (err) {
      setFormError(err?.name === 'AbortError' ? 'The request took too long. Please try again.' : 'We could not reach the server. Please check your connection or call us.')
      track('enquiry_submit_error', { reason: err?.name === 'AbortError' ? 'timeout' : 'network' })
    } finally {
      clearTimeout(timer)
      setStatus('idle')
    }
  }

  return (
    <section id="enquire" className="relative flex min-h-svh items-center overflow-hidden bg-cream py-[clamp(2.5rem,7svh,8rem)]">
      <div aria-hidden className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-glow)_22%,transparent),transparent_65%)] blur-2xl" />
      <div className="container-x relative grid w-full gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <div>
          <Eyebrow className="text-terra" line>
            {enquire.eyebrow}
          </Eyebrow>
          <Heading lines={enquire.heading} className="mt-5 text-[clamp(2.8rem,min(7vw,12svh),6.4rem)]" />
          <Reveal delay={0.1} className="mt-8 max-w-md text-[1.02rem] leading-relaxed text-ink/70">
            <p>
              Planning a wedding, a corporate event or a quiet getaway? Share a few details and the Treat team will be in touch.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-12 space-y-5">
            {[
              { icon: Phone, label: brand.phone, href: brand.phoneHref },
              { icon: Mail, label: brand.email, href: `mailto:${brand.email}` },
              { icon: MessageCircle, label: 'Chat on WhatsApp', href: brand.whatsapp },
            ].map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} className="group flex items-center gap-4 font-display text-xl md:text-2xl">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/25 transition-colors duration-500 group-hover:border-terra group-hover:bg-terra group-hover:text-cream">
                  <Icon className="h-5 w-5" strokeWidth={1.4} />
                </span>
                <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">{label}</span>
              </a>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative bg-white/60 p-7 shadow-[0_40px_80px_-40px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] backdrop-blur md:p-12">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="flex min-h-[420px] flex-col items-center justify-center text-center"
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-olive text-cream">
                  <Check className="h-9 w-9" />
                </span>
                <p className="display mt-8 text-5xl">
                  Thank <em>you</em>, {form.first || 'friend'}.
                </p>
                <p className="mt-4 max-w-sm text-ink/65">We&rsquo;ve received your enquiry and will get back to you shortly.</p>
                <button
                  onClick={() => {
                    setForm(initial)
                    setSent(false)
                  }}
                  className="mt-8 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-terra underline underline-offset-8"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -20 }} className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                <Input label="First Name" name="first" value={form.first} onChange={set} required error={errors.first} autoComplete="given-name" />
                <Input label="Last Name" name="last" value={form.last} onChange={set} autoComplete="family-name" />
                <Input label="Phone Number" name="phone" type="tel" value={form.phone} onChange={set} required error={errors.phone} autoComplete="tel" />
                <Input label="Email" name="email" type="email" value={form.email} onChange={set} required error={errors.email} autoComplete="email" />
                <Input label="City Name" name="city" value={form.city} onChange={set}>
                  <option value="">Select city</option>
                  {enquire.cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Input>
                <Input label="Property" name="property" value={form.property} onChange={set}>
                  <option value="">Select property</option>
                  {enquire.properties.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Input>
                <Input label="Message" name="message" type="textarea" value={form.message} onChange={set} className="sm:col-span-2" />
                {/* honeypot: hidden from people, bots fill it in */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </label>
                </div>
                {TURNSTILE_KEY && <div ref={widget} className="sm:col-span-2" />}
                {formError && (
                  <p role="alert" className="rounded-xl border border-terra-deep/40 bg-terra/10 px-4 py-3 text-[0.9rem] text-terra-deep sm:col-span-2">
                    {formError}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    aria-busy={status === 'sending'}
                    className="group inline-flex items-center gap-3 bg-terra px-9 py-4 text-[0.74rem] font-medium uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:bg-terra-deep disabled:cursor-wait disabled:opacity-70"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send Message'}
                    <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">{status === 'sending' ? '' : '→'}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}
