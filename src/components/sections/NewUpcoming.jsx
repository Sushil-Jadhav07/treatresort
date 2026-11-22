import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { A, EASE } from '../ui'
import { newUpcoming } from '../../data/content'

const DURATION = 6000

export default function NewUpcoming() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const [i, setI] = useState(0)
  const [tick, setTick] = useState(0) // restarts the progress bar on manual change
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.05, 1])
  const inset = useTransform(scrollYProgress, [0, 0.3], [6, 0])
  const clip = useTransform(inset, (v) => `inset(${v}% ${v}% ${v}% ${v}% round ${v * 5}px)`)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setI((p) => (p + 1) % newUpcoming.length), DURATION)
    return () => clearTimeout(t)
  }, [i, tick, inView])

  const s = newUpcoming[i]
  const [first, ...rest] = s.name.split(', ')
  const city = rest.join(', ')

  return (
    <section id="new-upcoming" ref={ref} className="relative bg-cream">
      <motion.div className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-cocoa" style={{ clipPath: clip }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={s.slug}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <motion.img
              src={s.image}
              alt={s.name}
              className="h-full w-full object-cover"
              style={{ scale }}
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,10,8,0.85)_0%,rgba(20,10,8,0.25)_45%,rgba(20,10,8,0.35)_100%)]" />

        <div className="container-x relative z-10 flex h-full flex-col justify-between py-16 text-cream md:py-20">
          <div className="flex items-center gap-4">
            <p className="eyebrow">New &amp; Upcoming Hotels</p>
            <span className="h-px w-14 bg-terra" />
          </div>

          <div>
            <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.68rem] uppercase tracking-[0.26em] md:text-xs">
              {newUpcoming.map((p, k) => (
                <button
                  key={p.slug}
                  onClick={() => {
                    setI(k)
                    setTick((t) => t + 1)
                  }}
                  className={`group relative pb-3 text-left transition-colors ${k === i ? 'text-cream' : 'text-cream/50 hover:text-cream/80'}`}
                  aria-current={k === i}
                >
                  <span className="font-semibold">{String(k + 1).padStart(2, '0')}</span>
                  <span className="ml-3">{p.name.split(', ')[1]}</span>
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-cream/25" />
                  {k === i && (
                    <motion.span
                      key={`${i}-${tick}`}
                      className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-terra"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: inView ? 1 : 0 }}
                      transition={{ duration: DURATION / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
              <div className="overflow-hidden pb-2">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={s.slug}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-60%', opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="display text-[clamp(2.8rem,7.5vw,7rem)]"
                  >
                    {first},
                    <br />
                    <em className="text-cream/95">{city}</em>
                  </motion.h2>
                </AnimatePresence>
                <p className="mt-4 text-sm uppercase tracking-[0.24em] text-cream/75">
                  {s.status} · {s.place}
                </p>
              </div>
              <A
                href="#enquire"
                className="group flex items-center gap-3 border border-cream/80 px-8 py-4 font-display text-xl italic transition-colors duration-500 hover:bg-cream hover:text-ink"
              >
                Enquire now
                <ArrowRight className="h-5 w-5 text-terra transition-transform duration-500 group-hover:translate-x-1.5" />
              </A>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
