import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Maximize2 } from 'lucide-react'
import { A, Button, EASE, Eyebrow, Heading, Reveal } from '../ui'
import { Lightbox } from './Corporate'
import { corporate } from '../../data/content'

const pad = (n) => String(n).padStart(2, '0')

/**
 * Corporate section — variant 2.
 * Uses the plain "expandable gallery" pattern: a row of rounded image tiles, the hovered tile grows
 * and its dark tint lifts; clicking opens the full-screen viewer. Info for the tile sits underneath.
 */
export default function CorporateGallery() {
  const items = corporate.items
  const [hovered, setHovered] = useState(null)
  const [current, setCurrent] = useState(0) // last hovered tile → drives the caption
  const [viewer, setViewer] = useState(null)

  const flexFor = (i) => (hovered === null ? 1 : hovered === i ? 3.2 : 0.55)
  const item = items[current]

  return (
    <section
      id="corporate-gallery"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-ink py-[clamp(1.5rem,5svh,4rem)] text-cream"
    >
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_30%,transparent_100%)] bg-[linear-gradient(color-mix(in_srgb,var(--color-cream)_5.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-cream)_5.5%,transparent)_1px,transparent_1px)] bg-[size:72px_72px]"
      />

      <div className="relative mx-auto w-full max-w-[1880px] px-[clamp(1.5rem,3.2vw,4.5rem)]">
        {/* TOP: text */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-16">
          <div>
            <Eyebrow line className="text-cream/80">
              {corporate.eyebrow}
            </Eyebrow>
            <Heading
              lines={['Experience the art', 'of impeccable hosting']}
              accentClass="text-soft"
              className="mt-4 text-[clamp(2.2rem,min(4.6vw,8svh),4.8rem)] text-cream"
            />
          </div>
          <div className="max-w-xl">
            <Reveal delay={0.1}>
              <p className="text-[clamp(0.9rem,2svh,1rem)] leading-relaxed text-cream/70">{corporate.body}</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-5">
              <Button href="#enquire" variant="outline-light">
                {corporate.cta}
              </Button>
            </Reveal>
          </div>
        </div>

        {/* IMAGES: expandable gallery (desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.1, ease: EASE }}
          onMouseLeave={() => setHovered(null)}
          className="mt-[clamp(1.25rem,4svh,2.5rem)] hidden gap-2 lg:flex lg:h-[clamp(200px,calc(100svh-26rem),520px)]"
        >
          {items.map((it, i) => (
            <motion.button
              key={it.title}
              type="button"
              aria-label={`Open ${it.title}`}
              className="relative cursor-pointer overflow-hidden rounded-md text-left"
              style={{ flex: 1 }}
              animate={{ flex: flexFor(i) }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onMouseEnter={() => {
                setHovered(i)
                setCurrent(i)
              }}
              onFocus={() => {
                setHovered(i)
                setCurrent(i)
              }}
              onBlur={() => setHovered(null)}
              onClick={() => setViewer(i)}
            >
              <img src={it.image} alt={it.title} draggable="false" loading="lazy" className="h-full w-full object-cover" />
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: hovered === i ? 0 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
              {/* tile number */}
              <span className="absolute left-3 top-3 font-display text-lg italic text-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                {pad(i + 1)}
              </span>
              {hovered === i && (
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-cream/50 bg-ink/40 text-cream backdrop-blur">
                  <Maximize2 className="h-4 w-4" />
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* IMAGES: simple grid (mobile / tablet) */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
          {items.map((it, i) => (
            <button
              key={it.title}
              type="button"
              aria-label={`Open ${it.title}`}
              onClick={() => {
                setCurrent(i)
                setViewer(i)
              }}
              className="relative aspect-[4/5] overflow-hidden rounded-md text-left"
            >
              <img src={it.image} alt={it.title} loading="lazy" draggable="false" className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute inset-x-2 bottom-2 font-display text-[0.95rem] leading-tight text-cream">{it.title}</span>
            </button>
          ))}
        </div>

        {/* INFO: caption for the hovered tile */}
        <div className="mt-5 hidden min-h-[5.5rem] items-start justify-between gap-10 border-t border-cream/15 pt-5 lg:flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex flex-1 items-start gap-6"
            >
              <span className="font-display text-4xl font-light italic leading-none text-soft">{pad(current + 1)}</span>
              <div>
                <h3 className="display text-[clamp(1.4rem,2.2vw,2rem)] leading-tight">{item.title}</h3>
                <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-cream/75">{item.text}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <A
            href="#enquire"
            className="group/link inline-flex shrink-0 items-center gap-3 rounded-full bg-cream py-2 pl-6 pr-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-terra hover:text-cream"
          >
            {corporate.cta}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream transition-colors group-hover/link:bg-cream group-hover/link:text-terra">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </A>
        </div>
      </div>

      <Lightbox items={items} index={viewer} onClose={() => setViewer(null)} onChange={setViewer} />
    </section>
  )
}
