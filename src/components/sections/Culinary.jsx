import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, GlassWater, Soup, UtensilsCrossed } from 'lucide-react'
import { A, ArrowLink, EASE, Eyebrow, Heading, Magnetic, Reveal } from '../ui'
import { culinary } from '../../data/content'

const ICONS = [UtensilsCrossed, Soup, GlassWater]

export default function Culinary() {
  const [active, setActive] = useState(0)
  const v = culinary.venues[active]

  return (
    <section id="dining" className="relative bg-cream max-md:hidden">
      <div className="grid lg:grid-cols-2">
        {/* left */}
        <div className="relative px-6 py-[clamp(1.5rem,5svh,7rem)] md:px-10 lg:flex lg:flex-col lg:justify-center lg:pl-[clamp(2.5rem,5vw,6rem)] lg:pr-20">
          <Eyebrow className="text-terra" line>
            {culinary.eyebrow}
          </Eyebrow>
          <Heading lines={culinary.heading} className="mt-5 text-[clamp(2.4rem,min(5vw,9svh),5rem)]" />
          <Reveal delay={0.1} className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-ink/70">
            <p>{culinary.body}</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-5 text-terra">
            <ArrowLink href="#enquire">{culinary.cta}</ArrowLink>
          </Reveal>

          <ul className="mt-[clamp(1.5rem,5svh,3rem)] border-t border-ink/20">
            {culinary.venues.map((c, i) => {
              const Icon = ICONS[i]
              const on = i === active
              return (
                <motion.li
                  key={c.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
                  className="border-b border-ink/20"
                >
                  <button
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`group relative flex w-full items-center gap-6 px-4 py-[clamp(0.8rem,2.4svh,1.5rem)] text-left transition-colors duration-500 ${on ? 'bg-blush' : 'hover:bg-blush/50'}`}
                    aria-pressed={on}
                  >
                    <Icon className="h-8 w-8 shrink-0 text-terra" strokeWidth={1.3} />
                    <span className="h-10 w-px bg-ink/25" />
                    <span className="flex-1">
                      <span className="block font-display text-[1.7rem] leading-tight md:text-[2rem]">{c.title}</span>
                      <span className="mt-1 block text-[0.66rem] uppercase tracking-[0.2em] text-ink/60">{c.tag}</span>
                    </span>
                    <ArrowRight
                      className={`h-5 w-5 shrink-0 text-terra transition-transform duration-500 ease-out-expo ${on ? 'translate-x-0' : '-translate-x-2 opacity-50'} group-hover:translate-x-1`}
                    />
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </div>

        {/* right */}
        <div className="relative min-h-[560px] bg-cocoa lg:min-h-svh">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--color-terra)_45%,transparent),transparent_60%),radial-gradient(ellipse_at_80%_90%,color-mix(in_srgb,var(--color-mustard)_30%,transparent),transparent_55%)]" />
          <div className="absolute left-1/2 top-[48%] w-[min(86%,540px)] -translate-x-1/2 -translate-y-1/2 lg:left-[52%]">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={v.image}
                  src={v.image}
                  alt={v.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.18, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)' }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </AnimatePresence>
            </div>
            <div className="absolute -bottom-12 -left-2 aspect-square w-[38%] overflow-hidden border-[6px] border-cocoa shadow-2xl md:-left-14">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={v.alt}
                  src={v.alt}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
                />
              </AnimatePresence>
            </div>
          </div>

          <p className="absolute bottom-10 right-8 text-right font-display text-3xl italic text-cream md:text-4xl">
            {culinary.caption}
            <span className="mt-3 ml-auto block h-px w-16 bg-terra" />
          </p>

          <div className="absolute left-1/2 top-12 z-10 -translate-x-1/2 lg:left-0 lg:top-[44%] lg:-translate-y-1/2 lg:-translate-x-1/2">
            <Magnetic strength={0.25}>
              <A
                href="#enquire"
                className="group relative grid h-32 w-32 place-items-center rounded-full bg-terra text-center text-cream shadow-2xl transition-colors hover:bg-terra-deep md:h-36 md:w-36"
              >
                <span className="text-[0.64rem] font-medium uppercase leading-snug tracking-[0.24em]">
                  Reserve
                  <br />a table
                  <ArrowRight className="mx-auto mt-2 h-5 w-5 transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
              </A>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
