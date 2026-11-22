import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArrowLink, EASE, Eyebrow, Heading, Reveal } from '../ui'
import { offers } from '../../data/content'

const TILT = [-4, 3, -2, 4, -3, 2, -5, 3, -2]

function Stamp() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="h-28 w-28 text-terra md:h-36 md:w-36"
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      aria-hidden
    >
      <defs>
        <path id="stamp-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fill="currentColor" fontSize="13" fontWeight="500" fontFamily="Figtree, sans-serif">
        <textPath href="#stamp-circle" textLength="440" lengthAdjust="spacing">
          TREAT HOTELS &amp; RESORTS · SPECIAL OFFERS ·
        </textPath>
      </text>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 128 C99 112 101 98 108 84" />
        <path d="M108 84 C96 78 86 82 80 92 M108 84 C112 72 124 68 134 72 M108 84 C122 84 130 92 130 100 M108 84 C100 92 98 100 100 108" />
      </g>
    </motion.svg>
  )
}

export default function Offers() {
  const items = offers.items
  const n = items.length
  const [active, setActive] = useState(0)
  const [width, setWidth] = useState(1200)

  useEffect(() => {
    const on = () => setWidth(window.innerWidth)
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const go = (d) => setActive((a) => (a + d + n) % n)
  const mobile = width < 768
  const half = Math.floor(n / 2)
  const spread = mobile ? 38 : 58 // % of card width between neighbours
  const visible = mobile ? 1 : 2

  return (
    <section id="offers" className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-cream py-[clamp(2.5rem,6svh,6rem)]">
      <div className="container-x relative">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Eyebrow className="text-ink" line>
              {offers.eyebrow}
            </Eyebrow>
            <Heading lines={offers.heading} className="mt-4 text-[clamp(2.4rem,min(6vw,10svh),6rem)]" />
          </div>
          <Reveal y={0} delay={0.2} className="hidden pr-4 sm:block lg:pr-24">
            <Stamp />
          </Reveal>
        </div>
      </div>

      <motion.div
        className="relative mx-auto mt-2 h-[var(--h)] w-full max-w-[1600px] touch-pan-y [--h:clamp(380px,calc(100svh-24rem),620px)]"
        onPanEnd={(_, info) => {
          if (info.offset.x < -60) go(1)
          else if (info.offset.x > 60) go(-1)
        }}
      >
        {/* wavy postmark lines */}
        <svg aria-hidden viewBox="0 0 400 60" className="absolute left-[4%] top-4 hidden w-72 text-terra/50 lg:block" fill="none" stroke="currentColor" strokeWidth="1.3">
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M0 ${12 + k * 12} Q 50 ${k * 12 - 4} 100 ${12 + k * 12} T 200 ${12 + k * 12} T 300 ${12 + k * 12} T 400 ${12 + k * 12}`} />
          ))}
        </svg>

        {items.map((it, i) => {
          const d = ((i - active + n + half) % n) - half
          const shown = Math.abs(d) <= visible
          return (
            <motion.button
              key={it.image}
              onClick={() => (d === 0 ? null : go(d))}
              aria-label={d === 0 ? `Offer ${i + 1}` : `Show offer ${i + 1}`}
              className="absolute left-1/2 top-1/2 w-[min(72vw,calc(var(--h)-3.5rem))] cursor-pointer bg-paper p-3 pb-12 text-left shadow-[0_25px_50px_-20px_rgba(60,30,10,0.45)]"
              style={{ zIndex: 20 - Math.abs(d), pointerEvents: shown ? 'auto' : 'none' }}
              initial={false}
              animate={{
                x: `${-50 + d * spread}%`,
                y: `${-50 + Math.abs(d) * 4}%`,
                rotate: d === 0 ? 0 : d * 5 + TILT[i % TILT.length],
                scale: 1 - Math.abs(d) * 0.08,
                opacity: shown ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.9 }}
              whileHover={d === 0 ? { rotate: -1.5, scale: 1.02 } : { scale: 1 - Math.abs(d) * 0.08 + 0.015 }}
            >
              <img
                src={it.image}
                alt={`Treat offer — ${it.note}`}
                loading="lazy"
                draggable="false"
                className="aspect-square w-full object-cover"
              />
              <span className="absolute bottom-3 left-4 font-hand text-2xl text-ink/80">{it.note}</span>
              <span className="absolute bottom-3.5 right-4 text-[0.6rem] uppercase tracking-[0.22em] text-terra">
                {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
            </motion.button>
          )
        })}

        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => go(d)}
            aria-label={d < 0 ? 'Previous offer' : 'Next offer'}
            className={`absolute top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ink bg-cream/70 backdrop-blur transition-colors hover:bg-ink hover:text-cream ${d < 0 ? 'left-4 lg:left-8' : 'right-4 lg:right-8'}`}
          >
            {d < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        ))}
      </motion.div>

      <motion.div
        className="mt-4 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <ArrowLink href="#enquire" className="text-terra">
          {offers.cta}
        </ArrowLink>
      </motion.div>
    </section>
  )
}
