import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { EASE } from '../ui'
import { locations } from '../../data/content'

/**
 * Full-bleed live Google map that fills its (relatively positioned) parent.
 * - cream fade at the top so the section title melts into the map
 * - floating glass card with property chips + directions
 */
export default function LocationMap() {
  const [i, setI] = useState(0)
  const loc = locations[i]
  const q = encodeURIComponent(loc.query)

  return (
    <div className="absolute inset-0 z-0">
      {/* map */}
      <AnimatePresence initial={false}>
        <motion.iframe
          key={loc.query}
          title={`Map — ${loc.name}`}
          src={`https://maps.google.com/maps?q=${q}&z=14&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 [filter:saturate(0.82)_sepia(0.14)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </AnimatePresence>

      {/* top fade: title area melts into the map */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[56%] bg-[linear-gradient(to_bottom,var(--color-cream)_0%,var(--color-cream)_34%,color-mix(in_srgb,var(--color-cream)_88%,transparent)_50%,color-mix(in_srgb,var(--color-cream)_35%,transparent)_76%,transparent_100%)]"
      />

      {/* floating glass card (sits above the wave) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        className="absolute bottom-[clamp(6.5rem,17svh,11rem)] left-[clamp(1rem,3.2vw,4.5rem)] w-[min(calc(100%-2rem),600px)] rounded-[1.75rem] border border-white/60 bg-white/80 p-[clamp(1rem,1.6vw,1.5rem)] shadow-[0_30px_70px_-25px_color-mix(in_srgb,var(--color-ink)_50%,transparent)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-terra">
              <MapPin className="h-3.5 w-3.5" /> {loc.place}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={loc.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="display mt-1 text-[clamp(1.2rem,1.9vw,1.7rem)] leading-tight"
              >
                {loc.name}
              </motion.p>
            </AnimatePresence>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${q}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Get directions to ${loc.name}`}
            className="group grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-cream transition-colors hover:bg-terra"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="no-scrollbar mt-4 flex gap-1.5 max-md:overflow-x-auto md:flex-wrap" data-lenis-prevent role="tablist" aria-label="Choose a property">
          {locations.map((l, k) => (
            <button
              key={l.name}
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] transition-colors duration-300 ${
                k === i ? 'border-terra bg-terra text-cream' : 'border-ink/20 text-ink/70 hover:border-terra hover:text-terra'
              }`}
            >
              {l.place.split(',')[0]}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
