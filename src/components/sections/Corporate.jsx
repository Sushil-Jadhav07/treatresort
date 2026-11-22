import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, Plus, X } from 'lucide-react'
import { A, Button, EASE, Eyebrow, Heading, Reveal } from '../ui'
import { corporate } from '../../data/content'

const AUTOPLAY = 5200
const pad = (n) => String(n).padStart(2, '0')

/** One gallery panel. Desktop: grows sideways on hover. Mobile: grows downward. */
function Panel({ item, index, total, active, playing, onActivate, onOpen }) {
  const ref = useRef(null)

  return (
    <article
      ref={ref}
      onMouseEnter={() => window.matchMedia('(hover:hover) and (min-width:1024px)').matches && onActivate()}
      aria-label={item.title}
      style={{ flexGrow: active ? 6 : 1 }}
      className={`group relative isolate basis-auto overflow-hidden rounded-[1.6rem] bg-cocoa ring-1 ring-cream/10 transition-[flex-grow,height] duration-[900ms] ease-out-expo lg:h-auto lg:min-w-[3.6rem] lg:basis-0 lg:rounded-[2rem] ${
        active ? 'h-[27rem]' : 'h-[4.75rem]'
      }`}
    >
      {/* photo */}
      <img
        src={item.image}
        alt={active ? item.title : ''}
        loading="lazy"
        draggable="false"
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-all duration-[1200ms] ease-out-expo ${
          active ? 'scale-100 brightness-100 saturate-100' : 'scale-[1.18] brightness-[0.55] saturate-[0.7]'
        }`}
      />
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 transition-opacity duration-700 ${
          active
            ? 'bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-ink)_92%,transparent)_0%,color-mix(in_srgb,var(--color-ink)_45%,transparent)_42%,color-mix(in_srgb,var(--color-ink)_10%,transparent)_100%)] opacity-100'
            : 'bg-ink/45 opacity-100 group-hover:bg-ink/25'
        }`}
      />
      {/* collapsed state: number + vertical title */}
      <div
        className={`absolute inset-0 flex items-center gap-4 px-5 transition-opacity duration-500 lg:flex-col lg:items-start lg:justify-between lg:p-5 ${
          active ? 'pointer-events-none opacity-0' : 'opacity-100 delay-300'
        }`}
      >
        <span className="font-display text-lg italic text-soft lg:text-xl">{pad(index + 1)}</span>
        <span className="flex-1 font-display text-[1.2rem] leading-tight text-cream lg:flex-none lg:rotate-180 lg:text-[1.3rem] lg:[writing-mode:vertical-rl]">
          {item.title}
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream/40 text-cream transition-colors group-hover:bg-cream group-hover:text-ink lg:hidden">
          <Plus className="h-4 w-4" />
        </span>
      </div>

      {/* inactive panels are one big click target */}
      {!active && (
        <button
          type="button"
          onClick={onActivate}
          onFocus={onActivate}
          aria-label={`Show ${item.title}`}
          className="absolute inset-0 z-20 cursor-pointer rounded-[inherit]"
        />
      )}

      {/* active panels: click the photo to open it large */}
      {active && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${item.title} full screen`}
          className="absolute inset-0 z-[5] cursor-zoom-in rounded-[inherit]"
        />
      )}
      {active && (
        <span className="pointer-events-none absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-cream/40 bg-ink/40 text-cream backdrop-blur">
          <Maximize2 className="h-4 w-4" />
        </span>
      )}

      {/* expanded state: all the information */}
      <div
        aria-hidden={!active}
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 p-6 text-cream transition-all lg:p-[clamp(1.25rem,2.2vw,2.25rem)] ${
          active ? 'translate-y-0 opacity-100 duration-700 delay-[350ms] ease-out-expo' : 'translate-y-6 opacity-0 duration-300'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-[clamp(2.4rem,5svh,4.2rem)] font-light italic leading-none text-soft">{pad(index + 1)}</span>
          <span className="text-[0.62rem] uppercase tracking-[0.3em] text-cream/60">
            {pad(index + 1)} / {pad(total)}
          </span>
        </div>
        <h3 className="display text-[clamp(1.6rem,min(2.6vw,4.6svh),2.9rem)] leading-[1.02]">{item.title}</h3>
        <p className="mt-3 max-w-md text-[clamp(0.85rem,2svh,0.98rem)] leading-relaxed text-cream/80">{item.text}</p>
        <A
          href="#enquire"
          tabIndex={active ? 0 : -1}
          className="group/link pointer-events-auto mt-4 inline-flex items-center gap-3 rounded-full bg-cream py-2 pl-6 pr-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-terra hover:text-cream"
        >
          {corporate.cta}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream transition-colors group-hover/link:bg-cream group-hover/link:text-terra">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </A>
      </div>

      {/* autoplay progress */}
      {active && playing && (
        <motion.span
          key={`bar-${index}`}
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left bg-terra"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: AUTOPLAY / 1000, ease: 'linear' }}
        />
      )}
    </article>
  )
}

/** Full-screen viewer with prev / next, counter, Esc + arrow keys. */
export function Lightbox({ items, index, onClose, onChange }) {
  const open = index !== null
  const total = items.length

  useEffect(() => {
    if (!open) return
    window.__lenis?.stop()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % total)
      if (e.key === 'ArrowLeft') onChange((index - 1 + total) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.__lenis?.start()
    }
  }, [open, index, total, onClose, onChange])

  const it = open ? items[index] : null
  const step = (e, d) => {
    e.stopPropagation()
    onChange((index + d + total) % total)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={it.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink/95 p-4 backdrop-blur-md md:p-10"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:bg-cream hover:text-ink md:right-8 md:top-8"
          >
            <X className="h-5 w-5" />
          </button>
          {[-1, 1].map((d) => (
            <button
              key={d}
              onClick={(e) => step(e, d)}
              aria-label={d < 0 ? 'Previous' : 'Next'}
              className={`absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:border-terra hover:bg-terra md:h-14 md:w-14 ${d < 0 ? 'left-3 md:left-8' : 'right-3 md:right-8'}`}
            >
              {d < 0 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            </button>
          ))}

          <div className="flex max-h-full w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <motion.img
              key={index}
              src={it.image}
              alt={it.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="max-h-[68svh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <motion.div
              key={`t-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="mt-6 text-center text-cream"
            >
              <p className="eyebrow text-soft">
                {pad(index + 1)} / {pad(total)}
              </p>
              <h3 className="display mt-2 text-3xl md:text-4xl">{it.title}</h3>
              <p className="mx-auto mt-2 max-w-xl text-[0.98rem] text-cream/75">{it.text}</p>
              <A
                href="#enquire"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-terra px-7 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream transition-colors hover:bg-terra-deep"
              >
                {corporate.cta} <ArrowUpRight className="h-4 w-4" />
              </A>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Corporate() {
  const items = corporate.items
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3 })
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [manual, setManual] = useState(false) // stop autoplay for good once the user takes over
  const [viewer, setViewer] = useState(null)

  const playing = inView && !hovering && !manual && viewer === null
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setActive((a) => (a + 1) % items.length), AUTOPLAY)
    return () => clearTimeout(t)
  }, [active, playing, items.length])

  const go = (n) => {
    setManual(true)
    setActive((n + items.length) % items.length)
  }

  return (
    <section
      id="corporate"
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-ink py-[clamp(1.5rem,5svh,4rem)] text-cream"
    >
      {/* fine architectural grid */}
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
            <Reveal delay={0.2} className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href="#enquire" variant="outline-light">
                {corporate.cta}
              </Button>
              <div className="flex items-center gap-3">
                <p className="font-display text-2xl tabular-nums text-soft">
                  {pad(active + 1)}
                  <span className="ml-1.5 text-sm text-cream/50">/ {pad(items.length)}</span>
                </p>
                {[-1, 1].map((d) => (
                  <button
                    key={d}
                    onClick={() => go(active + d)}
                    aria-label={d < 0 ? 'Previous format' : 'Next format'}
                    className="grid h-10 w-10 place-items-center rounded-full border border-cream/30 transition-colors hover:border-terra hover:bg-terra"
                  >
                    {d < 0 ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* BOTTOM: expandable image gallery */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.1, ease: EASE }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          role="group"
          aria-label="Corporate event formats"
          className="mt-[clamp(1.25rem,4svh,2.5rem)] flex flex-col gap-3 lg:h-[clamp(260px,calc(100svh-19rem),600px)] lg:flex-row lg:gap-3.5"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(active + 1)
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(active - 1)
          }}
        >
          {items.map((it, i) => (
            <Panel
              key={it.title}
              item={it}
              index={i}
              total={items.length}
              active={i === active}
              playing={playing}
              onActivate={() => {
                setManual(true)
                setActive(i)
              }}
              onOpen={() => setViewer(i)}
            />
          ))}
        </motion.div>
      </div>

      <Lightbox items={items} index={viewer} onClose={() => setViewer(null)} onChange={setViewer} />
    </section>
  )
}
