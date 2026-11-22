import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { Compass, Gem, HeartHandshake, Landmark, PartyPopper, TrendingUp } from 'lucide-react'
import { EASE, Eyebrow, Heading } from '../ui'
import { why } from '../../data/content'

const ICONS = [Compass, PartyPopper, Gem, HeartHandshake, TrendingUp, Landmark]

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString('en-IN'))
  useEffect(() => {
    if (!inView) return
    const c = animate(mv, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [inView, mv, value])
  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  )
}

export default function Why() {
  return (
    <section id="why" className="relative flex min-h-svh items-center overflow-hidden bg-sand py-[clamp(2.5rem,7svh,7rem)]">
      <div className="container-x grid w-full gap-10 lg:grid-cols-[minmax(280px,27%)_minmax(0,1fr)] lg:gap-14">
        {/* left: heading + stats */}
        <div className="flex flex-col justify-between gap-10">
          <div>
            <Eyebrow className="text-terra" line>
              {why.eyebrow}
            </Eyebrow>
            <Heading lines={why.heading} className="mt-5 text-[clamp(2.4rem,min(4.2vw,7.8svh),4.4rem)]" />
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-ink/20 pt-6 lg:grid-cols-1 lg:gap-0 lg:pt-0">
            {why.stats.map((s) => (
              <div key={s.label} className="lg:flex lg:items-baseline lg:gap-5 lg:border-b lg:border-ink/20 lg:py-4">
                <p className="display text-[clamp(2.2rem,min(3.6vw,6.4svh),3.4rem)] text-terra">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-ink/65 md:text-[0.68rem] lg:mt-0">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* right: 3 x 2 cards, sized to the screen */}
        <div className="grid grid-cols-2 lg:grid-cols-3">
          {why.cards.map((c, i) => {
            const Icon = ICONS[i]
            return (
              <motion.article
                key={c.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.9, delay: (i % 3) * 0.1, ease: EASE }}
                className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-sand p-4 sm:min-h-[260px] sm:p-6 lg:p-[clamp(1rem,2.6svh,2.25rem)] shadow-[inset_0_0_0_0.5px_color-mix(in_srgb,var(--color-ink)_22%,transparent)] transition-colors duration-700 hover:bg-terra hover:text-cream lg:min-h-0 lg:h-[clamp(200px,calc((100svh-9rem)/2),400px)]"
              >
                <span
                  aria-hidden
                  className="absolute -right-3 -top-6 font-display text-[5rem] font-light italic leading-none text-ink/[0.05] sm:text-[8rem] transition-all duration-700 group-hover:-translate-y-2 group-hover:text-cream/15"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="grid h-10 w-10 place-items-center sm:h-12 sm:w-12 lg:h-[clamp(2.4rem,6svh,3.5rem)] lg:w-[clamp(2.4rem,6svh,3.5rem)] rounded-full border border-current/30 text-terra transition-colors duration-700 group-hover:border-cream/60 group-hover:text-cream">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.3} />
                </span>
                <div className="mt-4">
                  <h3 className="display text-[1.02rem] leading-[1.12] sm:text-[1.3rem] lg:text-[clamp(1.2rem,min(1.6vw,3.2svh),1.75rem)]">{c.title}</h3>
                  <p className="mt-1.5 max-w-sm text-[0.74rem] leading-snug sm:text-[0.88rem] sm:leading-relaxed lg:text-[clamp(0.78rem,1.7svh,0.94rem)] text-ink/70 transition-colors duration-700 group-hover:text-cream/85">
                    {c.text}
                  </p>
                </div>
                <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-cream transition-all duration-700 ease-out-expo group-hover:w-full" />
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
