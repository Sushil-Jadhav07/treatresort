import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, MapPin, Minus, Plus, Users } from 'lucide-react'
import { EASE, scrollToHash } from '../ui'
import { enquire } from '../../data/content'
import { track } from '../../lib/analytics'

/* ---------- date helpers ---------- */
const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a, b) => !!a && !!b && a.getTime() === b.getTime()
const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const fmtLong = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const monthLabel = (d) => d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function Month({ base, from, to, hover, today, onPick, onHover }) {
  const y = base.getFullYear()
  const m = base.getMonth()
  const lead = (new Date(y, m, 1).getDay() + 6) % 7 // Monday-first
  const count = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(y, m, i + 1))]
  const end = to || (from && hover && hover > from ? hover : null)

  return (
    <div className="w-full min-w-[250px]">
      <p className="mb-4 text-center font-display text-xl">{monthLabel(base)}</p>
      <div className="grid grid-cols-7 text-center text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink/45">
        {WEEK.map((d) => (
          <span key={d} className="py-2">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const disabled = d < today
          const isFrom = same(d, from)
          const isTo = same(d, to)
          const inRange = from && end && d > from && d < end
          const strip =
            inRange ? 'bg-blush' : isFrom && end ? 'rounded-l-full bg-blush' : isTo || (same(d, end) && !to) ? 'rounded-r-full bg-blush' : ''
          return (
            <div key={i} className={`py-0.5 ${strip}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(d)}
                onMouseEnter={() => onHover(d)}
                aria-label={fmtLong(d)}
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full text-[0.92rem] transition-colors duration-200 ${
                  isFrom || isTo
                    ? 'bg-terra font-medium text-cream'
                    : disabled
                      ? 'cursor-not-allowed text-ink/25'
                      : 'hover:bg-blush'
                } ${same(d, today) && !isFrom && !isTo ? 'ring-1 ring-terra/50' : ''}`}
              >
                {d.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Popover({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ transformOrigin: 'top left' }}
      className={`absolute top-[calc(100%+12px)] z-40 rounded-3xl border border-ink/10 bg-white p-5 text-left shadow-[0_40px_80px_-25px_color-mix(in_srgb,var(--color-ink)_40%,transparent)] ${className}`}
    >
      {children}
    </motion.div>
  )
}

function Trigger({ icon: Icon, label, value, placeholder, active, onClick, chevron = true, tight = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={`group flex w-full min-w-0 items-center rounded-2xl py-2 text-left md:py-3.5 transition-colors duration-300 ${
        tight ? 'gap-2 px-3 md:gap-3 md:px-5' : 'gap-3 px-4 md:px-5'
      } ${active ? 'bg-cream' : 'hover:bg-cream/70'}`}
    >
      <Icon className="h-4 w-4 shrink-0 text-ink/70 md:h-5 md:w-5" strokeWidth={1.5} />
      <span className="min-w-0 flex-1">
        <span className="block whitespace-nowrap text-[0.58rem] font-medium uppercase tracking-[0.16em] text-ink/50 md:tracking-[0.22em]">{label}</span>
        <span className={`block truncate text-[0.82rem] font-medium md:text-[0.95rem] ${value ? 'text-ink' : 'text-ink/55'}`}>{value || placeholder}</span>
      </span>
      {chevron && (
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink/60 transition-transform duration-300 ${tight ? 'hidden md:block' : ''} ${active ? 'rotate-180' : ''}`} />
      )}
    </button>
  )
}

function Stepper({ label, hint, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[0.95rem] font-medium">{label}</p>
        <p className="text-xs text-ink/50">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-ink/25 transition-colors hover:border-terra hover:bg-terra hover:text-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center font-display text-xl tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`More ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-ink/25 transition-colors hover:border-terra hover:bg-terra hover:text-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function BookingBar() {
  const root = useRef(null)
  const today = useMemo(() => sod(new Date()), [])
  const [open, setOpen] = useState(null) // 'dest' | 'in' | 'out' | 'guests'
  const [prop, setProp] = useState('')
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [hover, setHover] = useState(null)
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [g, setG] = useState({ adults: 2, children: 0, rooms: 1 })

  // close on outside click / Escape
  useEffect(() => {
    const onDown = (e) => {
      if (root.current && !root.current.contains(e.target)) setOpen(null)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const pick = (d) => {
    if (open === 'in' || !from) {
      setFrom(d)
      if (to && to <= d) setTo(null)
      setOpen('out')
    } else if (d <= from) {
      setFrom(d)
      setTo(null)
    } else {
      setTo(d)
      setOpen(null)
    }
  }

  const nights = from && to ? Math.round((to - from) / 86400000) : 0
  const total = g.adults + g.children
  const guestText = `${total} Guest${total > 1 ? 's' : ''} · ${g.rooms} Room${g.rooms > 1 ? 's' : ''}`
  const guestDetail = `${g.adults} Adult${g.adults > 1 ? 's' : ''}${g.children ? `, ${g.children} Child${g.children > 1 ? 'ren' : ''}` : ''} · ${g.rooms} Room${g.rooms > 1 ? 's' : ''}`
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1)
  const next = new Date(view.getFullYear(), view.getMonth() + 1, 1)
  const toggle = (k) => setOpen((o) => (o === k ? null : k))

  const submit = (e) => {
    e.preventDefault()
    setOpen(null)
    const parts = [
      from ? `Check-in: ${fmtLong(from)}` : null,
      to ? `Check-out: ${fmtLong(to)}${nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}` : null,
      guestDetail,
    ].filter(Boolean)
    track('search_bar_submit', { property: prop || undefined, nights: nights || undefined, guests: total, rooms: g.rooms })
    window.dispatchEvent(new CustomEvent('treat:prefill', { detail: { property: prop, message: parts.join(' | ') } }))
    scrollToHash('#enquire')
  }

  const divider = <span aria-hidden className="mx-0.5 hidden w-px self-stretch bg-ink/10 py-3 md:block" />

  return (
    <form
      ref={root}
      onSubmit={submit}
      className="relative flex flex-col gap-1 rounded-[1.6rem] border border-ink/10 bg-white/85 p-2 shadow-[0_30px_70px_-30px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] backdrop-blur-md md:flex-row md:items-center md:rounded-full md:p-2.5 max-md:p-1.5"
    >
      {/* destination */}
      <div className="relative min-w-0 md:flex-[1.15]">
        <Trigger
          icon={MapPin}
          label="Destination"
          value={prop}
          placeholder="Select property"
          active={open === 'dest'}
          onClick={() => toggle('dest')}
        />
        <AnimatePresence>
          {open === 'dest' && (
            <Popover className="left-0 w-full min-w-[320px] p-2.5">
              <ul className="max-h-[22rem] overflow-y-auto pr-1" data-lenis-prevent>
                {enquire.properties.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => {
                        setProp(p)
                        setOpen('in')
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-cream ${p === prop ? 'bg-blush/60' : ''}`}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-terra" strokeWidth={1.6} />
                      <span className="flex-1 font-display text-[1.05rem] leading-tight">{p}</span>
                      {p === prop && <Check className="h-4 w-4 text-terra" />}
                    </button>
                  </li>
                ))}
              </ul>
            </Popover>
          )}
        </AnimatePresence>
      </div>
      {divider}

      {/* dates */}
      <div className="relative grid min-w-0 grid-cols-2 md:flex-[1.7]">
        <Trigger
          icon={Calendar}
          label="Check-in"
          value={from ? fmt(from) : ''}
          placeholder="Add date"
          tight
          active={open === 'in'}
          onClick={() => toggle('in')}
        />
        <Trigger
          icon={Calendar}
          label="Check-out"
          value={to ? fmt(to) : ''}
          placeholder="Add date"
          tight
          active={open === 'out'}
          onClick={() => toggle('out')}
        />
        <AnimatePresence>
          {(open === 'in' || open === 'out') && (
            <Popover className="left-0 w-full md:w-[min(660px,90vw)]">
              <div className="mb-1 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={!canPrev}
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <p className="text-[0.64rem] font-medium uppercase tracking-[0.24em] text-terra">
                  {open === 'in' ? 'Select check-in' : 'Select check-out'}
                  {nights > 0 && <span className="ml-3 text-ink/55">· {nights} night{nights > 1 ? 's' : ''}</span>}
                </p>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setView(next)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-cream"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex gap-8" onMouseLeave={() => setHover(null)}>
                <Month base={view} from={from} to={to} hover={hover} today={today} onPick={pick} onHover={setHover} />
                <div className="hidden w-full md:block">
                  <Month base={next} from={from} to={to} hover={hover} today={today} onPick={pick} onHover={setHover} />
                </div>
              </div>
              {(from || to) && (
                <button
                  type="button"
                  onClick={() => {
                    setFrom(null)
                    setTo(null)
                    setOpen('in')
                  }}
                  className="mt-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ink/55 underline underline-offset-4 hover:text-terra"
                >
                  Clear dates
                </button>
              )}
            </Popover>
          )}
        </AnimatePresence>
      </div>
      {divider}

      {/* guests */}
      <div className="relative min-w-0 md:flex-[1.15]">
        <Trigger icon={Users} label="Guests" value={guestText} active={open === 'guests'} onClick={() => toggle('guests')} />
        <AnimatePresence>
          {open === 'guests' && (
            <Popover className="right-0 w-full min-w-[300px] md:w-[340px]">
              <div className="divide-y divide-ink/10">
                <Stepper label="Adults" hint="Ages 13 or above" value={g.adults} min={1} max={12} onChange={(v) => setG({ ...g, adults: v })} />
                <Stepper label="Children" hint="Ages 0–12" value={g.children} min={0} max={6} onChange={(v) => setG({ ...g, children: v })} />
                <Stepper label="Rooms" hint="Number of rooms" value={g.rooms} min={1} max={6} onChange={(v) => setG({ ...g, rooms: v })} />
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="mt-3 w-full rounded-full bg-ink py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cream transition-colors hover:bg-terra"
              >
                Done
              </button>
            </Popover>
          )}
        </AnimatePresence>
      </div>

      <button
        type="submit"
        className="mt-0.5 rounded-2xl bg-terra px-8 py-3 text-[0.68rem] md:text-[0.74rem] md:mt-1 font-medium uppercase tracking-[0.22em] text-cream transition-colors duration-300 hover:bg-terra-deep md:mt-0 md:ml-1 md:rounded-full md:px-9 md:py-[1.15rem]"
      >
        Check availability
      </button>
    </form>
  )
}
