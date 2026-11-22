import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { ArrowUpRight, X } from 'lucide-react'
import { Button, EASE, Eyebrow, Heading, Reveal, scrollToHash } from '../ui'
import { intro } from '../../data/content'

// photo, tag and target section for each of the four points (same order as intro.points)
const MEDIA = [
  { image: '/images/w-luxury.webp', tag: 'Weddings', href: '#weddings', pos: 'center 55%' },
  { image: '/images/c-galas.webp', tag: 'Corporate', href: '#corporate', pos: 'center' },
  { image: '/images/c-adventure.webp', tag: 'Getaways', href: '#properties', pos: 'center' },
  { image: '/images/d-zaika-outdoor.webp', tag: 'Dining', href: '#dining', pos: 'center 90%' },
]

/** Phones / tablets: tap a row's photo to see it large, with a link to that section. */
function PhotoSheet({ index, onClose }) {
  const open = index !== null
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    window.__lenis?.stop()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.__lenis?.start()
    }
  }, [open, onClose])

  const m = open ? MEDIA[index] : null
  const point = open ? intro.points[index] : null
  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={point.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/90 p-5 backdrop-blur-sm"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-cream/30 text-cream"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] bg-cream shadow-2xl"
          >
            <div className="relative aspect-[4/3] w-full bg-sand">
              <img src={m.image} alt={point.title} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: m.pos }} />
              <span className="absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-cream backdrop-blur">
                {String(index + 1).padStart(2, '0')} · {m.tag}
              </span>
            </div>
            <div className="p-5">
              <h3 className="display text-[1.5rem] leading-tight">{point.title}</h3>
              <button
                onClick={() => {
                  onClose()
                  setTimeout(() => scrollToHash(m.href), 350)
                }}
                className="mt-4 inline-flex items-center gap-3 rounded-full bg-terra py-2 pl-5 pr-2 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-cream"
              >
                Explore {m.tag}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

const CARD_W = 300
const CARD_H = 360

export default function Intro() {
  const rows = useRef(null)
  const [hover, setHover] = useState(null)
  const [sheet, setSheet] = useState(null)

  // cursor-following preview: spring-smoothed position, tilt driven by horizontal velocity
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.6 })
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.6 })
  const tilt = useTransform(useVelocity(y), [-1600, 0, 1600], [9, 0, -9])
  const rotate = useSpring(tilt, { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    const r = rows.current.getBoundingClientRect()
    // card rides the right-hand side (clear of the titles), follows the cursor up/down, drifts a little sideways
    const px = r.width - CARD_W - 180 + ((e.clientX - r.left) / r.width - 0.5) * 90
    const py = Math.min(Math.max(e.clientY - r.top - CARD_H / 2, -CARD_H * 0.45), r.height - CARD_H * 0.55)
    mx.set(px)
    my.set(py)
  }

  return (
    <section id="about" className="relative flex min-h-svh items-center overflow-hidden bg-cream py-[clamp(1.5rem,5svh,6rem)]">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-[clamp(1.25rem,4.5svh,3.25rem)] px-[clamp(1.5rem,3.2vw,4.5rem)]">
        {/* header */}
        <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <Eyebrow className="text-terra" line>
              {intro.eyebrow}
            </Eyebrow>
            <Heading lines={intro.heading} className="mt-4 text-[clamp(2.4rem,min(5.4vw,9.4svh),5.8rem)]" />
          </div>
          <div className="max-w-xl">
            <Reveal delay={0.1}>
              <p className="text-[clamp(0.92rem,2.1svh,1.08rem)] leading-relaxed text-ink/70">{intro.body}</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-6">
              <Button href="#why">{intro.cta}</Button>
              <p className="flex items-baseline gap-3">
                <span className="display text-[2.4rem] leading-none text-terra">40+</span>
                <span className="text-[0.6rem] uppercase leading-snug tracking-[0.22em] text-ink/60">
                  Years of
                  <br />
                  hospitality
                </span>
              </p>
            </Reveal>
          </div>
        </div>

        {/* the four points — hover a line and its photo follows the cursor */}
        <div ref={rows} onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="relative">
          <ul role="list">
            {intro.points.map((p, i) => {
              const m = MEDIA[i]
              const on = hover === i
              const dim = hover !== null && !on
              return (
                <motion.li
                  key={p.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
                  className="border-t border-ink/25 last:border-b"
                >
                  <a
                    href={m.href}
                    onClick={(e) => {
                      e.preventDefault()
                      // phones / tablets: show the photo; desktop: go to the section
                      if (window.matchMedia('(max-width: 1023px)').matches) setSheet(i)
                      else scrollToHash(m.href)
                    }}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
                    onFocus={(e) => e.target.matches(':focus-visible') && setHover(i)}
                    onBlur={() => setHover(null)}
                    className={`group relative flex items-center gap-5 py-[clamp(0.7rem,2.4svh,1.5rem)] transition-opacity duration-500 lg:gap-8 ${dim ? 'opacity-30' : 'opacity-100'}`}
                  >
                    {/* row wash */}
                    <span
                      aria-hidden
                      className={`absolute inset-y-0 -inset-x-4 -z-10 origin-left rounded-2xl bg-blush/70 transition-transform duration-700 ease-out-expo ${on ? 'scale-x-100' : 'scale-x-0'}`}
                    />
                    <span className="w-9 shrink-0 font-display text-xl italic text-terra lg:w-14 lg:text-2xl">{String(i + 1).padStart(2, '0')}</span>
                    <span
                      className={`flex-1 font-display text-[clamp(1.35rem,min(3.3vw,5.9svh),3.7rem)] leading-[1.05] tracking-[-0.02em] transition-all duration-700 ease-out-expo ${
                        on ? 'translate-x-3 italic text-terra' : ''
                      }`}
                    >
                      {p.title}
                    </span>

                    {/* mobile / touch: thumbnail instead of hover preview */}
                    <img
                      src={m.image}
                      alt=""
                      loading="lazy"
                      draggable="false"
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-terra/30 lg:hidden"
                      style={{ objectPosition: m.pos }}
                    />
                    <span className="hidden items-center gap-3 text-[0.66rem] uppercase tracking-[0.24em] text-ink/60 lg:flex">
                      {m.tag}
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-full border transition-all duration-500 ${
                          on ? 'rotate-45 border-terra bg-terra text-cream' : 'border-ink/25 text-ink'
                        }`}
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </span>
                  </a>
                </motion.li>
              )
            })}
          </ul>

          {/* cursor-following preview (desktop, mouse only) */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
            style={{ x, y, rotate, width: CARD_W, height: CARD_H }}
          >
            <AnimatePresence>
              {hover !== null && (
                <motion.div
                  key="card"
                  className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-sand shadow-[0_40px_80px_-25px_color-mix(in_srgb,var(--color-ink)_60%,transparent)] ring-1 ring-white/50"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.img
                      key={hover}
                      src={MEDIA[hover].image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: MEDIA[hover].pos }}
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <p className="eyebrow absolute bottom-4 left-5 text-[0.62rem] text-cream">{MEDIA[hover].tag}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <PhotoSheet index={sheet} onClose={() => setSheet(null)} />
    </section>
  )
}
