import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { ArrowLeft, ArrowRight, MapPin, Quote } from 'lucide-react'
import { EASE, Eyebrow, Heading, Reveal } from '../ui'
import { testimonials } from '../../data/content'

const DURATION = 9000
const pad = (n) => String(n).padStart(2, '0')

// resting pose of a card by its distance from the front of the stack
const POSE = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: 34, y: 20, rotate: 3.2, scale: 0.955, opacity: 1 },
  { x: -30, y: 38, rotate: -3.6, scale: 0.91, opacity: 1 },
  { x: 14, y: 54, rotate: 1.4, scale: 0.87, opacity: 0 },
]

function Card({ t, index, total, d, front, onNext, onPrev }) {
  const pose = POSE[Math.min(d, 3)]
  const initials = t.author
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  return (
    <motion.article
      aria-hidden={!front}
      className="absolute inset-0 flex touch-pan-y flex-col overflow-hidden rounded-[1.75rem] bg-paper shadow-[0_40px_80px_-30px_rgba(60,30,10,0.55)] ring-1 ring-ink/5 md:flex-row md:rounded-[2.25rem]"
      style={{ zIndex: total - d, pointerEvents: front ? 'auto' : 'none' }}
      initial={false}
      animate={pose}
      transition={{ type: 'spring', stiffness: 130, damping: 20, mass: 0.9 }}
      drag={front ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.5}
      whileDrag={{ cursor: 'grabbing', rotate: 2 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -90) onNext()
        else if (info.offset.x > 90) onPrev()
      }}
    >
      {/* photo */}
      <div className="relative h-[34%] shrink-0 md:h-auto md:w-[38%]">
        <img src={t.image} alt={t.property} draggable="false" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <p className="eyebrow absolute bottom-4 left-5 right-5 flex items-center gap-2 text-[0.6rem] text-cream">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t.property}</span>
        </p>
      </div>

      {/* words */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-between p-[clamp(1.25rem,2.4vw,2.5rem)]">
        <Quote aria-hidden className="h-9 w-9 fill-terra/20 stroke-0 text-terra md:h-11 md:w-11" />
        <blockquote className="my-3 font-display text-[clamp(1rem,min(1.45vw,2.7svh),1.45rem)] italic leading-[1.5] text-ink/85">
          {t.quote}
        </blockquote>
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-terra font-display text-lg text-cream">{initials}</span>
            <div className="min-w-0">
              <p className="truncate font-medium">{t.author}</p>
              <p className="truncate text-sm text-ink/55">{t.property}</p>
            </div>
          </div>
          <span className="font-display text-lg italic tabular-nums text-ink/45">
            {pad(index + 1)}/{pad(total)}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const items = testimonials.items
  const n = items.length
  const [i, setI] = useState(0)
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!inView || paused) return
    const t = setTimeout(() => setI((p) => (p + 1) % n), DURATION)
    return () => clearTimeout(t)
  }, [i, tick, inView, paused, n])

  const go = (d) => {
    setI((p) => (p + d + n) % n)
    setTick((t) => t + 1)
  }

  return (
    <section
      id="testimonials"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
      }}
      className="relative flex min-h-svh items-center overflow-hidden bg-sand py-[clamp(2rem,6svh,6rem)]"
    >
      {/* giant quote watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-24 select-none font-display text-[34rem] font-bold leading-none text-terra/[0.07]"
      >
        &ldquo;
      </span>

      <div className="relative mx-auto grid w-full max-w-[1880px] items-center gap-12 px-[clamp(1.5rem,3.2vw,4.5rem)] lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        {/* left: heading + controls */}
        <div>
          <Eyebrow className="text-terra" line>
            {testimonials.eyebrow}
          </Eyebrow>
          <Heading lines={testimonials.heading} className="mt-5 text-[clamp(2.4rem,min(4.6vw,8.2svh),5rem)]" />
          <Reveal delay={0.1} className="mt-5 max-w-sm text-[1rem] leading-relaxed text-ink/70">
            <p>Real words from guests across our hotels and resorts. Drag a card, or use the arrows.</p>
          </Reveal>

          <div className="mt-[clamp(1.5rem,5svh,3rem)] flex items-center gap-5">
            <p className="font-display text-5xl tabular-nums text-terra">
              {pad(i + 1)}
              <span className="ml-2 text-xl text-ink/50">/ {pad(n)}</span>
            </p>
            <div className="flex gap-2">
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  onClick={() => go(d)}
                  aria-label={d < 0 ? 'Previous story' : 'Next story'}
                  className="grid h-12 w-12 place-items-center rounded-full border border-ink/25 transition-colors hover:border-terra hover:bg-terra hover:text-cream"
                >
                  {d < 0 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>

          {/* progress ticks */}
          <div className="mt-6 flex max-w-sm gap-1.5">
            {items.map((_, k) => (
              <button
                key={k}
                onClick={() => {
                  setI(k)
                  setTick((x) => x + 1)
                }}
                aria-label={`Story ${k + 1}`}
                className="group flex-1 py-3"
              >
                <span className="relative block h-[2px] w-full overflow-hidden bg-ink/15">
                  {k === i && (
                    <motion.span
                      key={`${i}-${tick}`}
                      className="absolute inset-0 origin-left bg-terra"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: inView && !paused ? 1 : 0 }}
                      transition={{ duration: DURATION / 1000, ease: 'linear' }}
                    />
                  )}
                  {k < i && <span className="absolute inset-0 bg-terra/60" />}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* right: card stack */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: EASE }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mx-auto h-[clamp(430px,calc(100svh-12rem),560px)] w-full max-w-[860px] md:h-[clamp(340px,calc(100svh-14rem),500px)] lg:mr-0"
          role="group"
          aria-roledescription="carousel"
          aria-label="Guest stories"
        >
          {items.map((t, k) => {
            const d = (k - i + n) % n
            return (
              <Card
                key={t.author}
                t={t}
                index={k}
                total={n}
                d={d}
                front={d === 0}
                onNext={() => go(1)}
                onPrev={() => go(-1)}
              />
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
