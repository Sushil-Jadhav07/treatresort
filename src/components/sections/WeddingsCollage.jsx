import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { EASE, Eyebrow, Heading, Reveal } from '../ui'
import { weddings } from '../../data/content'

/**
 * Weddings — variant 2: a full-width scrapbook collage of tilted polaroids.
 * Click a polaroid and it glides to the centre of the stage, straightens and grows; the others
 * dim behind it. Click it again, the background, or press Esc to put everything back.
 * Desktop is laid out on a stage that scales with the screen (container query units);
 * phones get a stacked collage.
 */

const STAGE_RATIO = 2.5 // stage width / height → stage height = 40 cqw
const STAGE_H = 100 / STAGE_RATIO

// x / y / w are percentages of the stage; ratio = photo width / height
const PHOTOS = [
  { key: 'big', src: '/images/p-udaipur.webp', cap: 'The royal lawn, Udaipur.', x: 2.2, y: 50, w: 24, rot: -7, ratio: 1.55, pos: 'center 60%' },
  { key: 'a', src: '/images/w-luxury.webp', cap: 'Luxury Wedding Resorts.', x: 33, y: 11, w: 12.6, rot: -1.2, ratio: 0.8, pos: 'center' },
  { key: 'b', src: '/images/w-destination.webp', cap: 'Destination Wedding Resorts.', x: 52.5, y: 12, w: 12.2, rot: 3, ratio: 0.82, pos: '32% center' },
  { key: 'c', src: '/images/w-beach.webp', cap: 'Beach Wedding Resorts.', x: 71.5, y: 9, w: 12.6, rot: 4, ratio: 1, pos: 'center 40%' },
  { key: 'd', src: '/images/c-galas.webp', cap: 'Grand receptions.', x: 28, y: 53, w: 21, rot: -3.5, ratio: 1.42, pos: 'center' },
  { key: 'e', src: '/images/c-roundtable.webp', cap: 'Banquet halls.', x: 52, y: 50, w: 12.4, rot: 2, ratio: 0.82, pos: 'center' },
  { key: 'f', src: '/images/p-kumbhalgarh.webp', cap: 'Gardens & riverfronts.', x: 68, y: 52, w: 12, rot: 1.2, ratio: 0.9, pos: '40% center' },
  { key: 'g', src: '/images/g-1.webp', cap: 'Mandap moments.', x: 85, y: 18, w: 11, rot: -3, ratio: 0.92, pos: 'center' },
  { key: 'h', src: '/images/c-awards.webp', cap: 'Evenings to remember.', x: 83.4, y: 56, w: 12.6, rot: 2.5, ratio: 1.1, pos: 'center' },
]

/** where a polaroid ends up when it is brought to the centre */
function centred(p) {
  const maxH = STAGE_H * 0.9
  const w = Math.min(30, (maxH - 4.4) * p.ratio + 1.6)
  const h = (w - 1.6) / p.ratio + 4.4 // card height in cqw (photo + frame + caption)
  return { left: 50 - w / 2, top: ((STAGE_H - h) / 2 / STAGE_H) * 100, w }
}

function Polaroid({ p, i, shown, active, anyActive, interacted, onSelect }) {
  const c = centred(p)
  const rest = { left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%` }
  const target = active
    ? { left: `${c.left}%`, top: `${c.top}%`, width: `${c.w}%`, rotate: 0, scale: 1, opacity: 1, y: 0 }
    : { ...rest, rotate: p.rot, scale: anyActive ? 0.96 : 1, opacity: anyActive ? 0.32 : 1, y: 0 }
  const hidden = { ...rest, rotate: p.rot + (i % 2 ? 7 : -7), scale: 0.92, opacity: 0, y: 70 }

  return (
    <motion.figure
      role="button"
      tabIndex={0}
      aria-label={active ? `${p.cap} — click to go back` : `Bring forward: ${p.cap}`}
      aria-pressed={active}
      initial={hidden}
      animate={shown ? target : hidden}
      transition={{ duration: interacted ? 1 : 1.1, delay: interacted ? 0 : 0.1 + i * 0.1, ease: EASE }}
      whileHover={active ? undefined : { rotate: 0, scale: anyActive ? 0.99 : 1.04, transition: { duration: 0.35 } }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`group absolute bg-paper outline-offset-4 ${active ? 'cursor-zoom-out shadow-[0_40px_90px_-20px_rgba(60,30,10,0.6)]' : 'cursor-pointer shadow-[0_18px_40px_-16px_rgba(60,30,10,0.45)]'}`}
      style={{ zIndex: active ? 60 : 5 + i, padding: '0.8cqw 0.8cqw 0.35cqw' }}
    >
      <div className="relative w-full overflow-hidden bg-sand" style={{ aspectRatio: p.ratio }}>
        <img
          src={p.src}
          alt=""
          loading="lazy"
          draggable="false"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out-expo ${active ? '' : 'group-hover:scale-105'}`}
          style={{ objectPosition: p.pos }}
        />
      </div>
      <figcaption
        className="font-display italic leading-tight text-ink/80 transition-[font-size] duration-700"
        style={{ fontSize: active ? 'clamp(0.9rem,1.5cqw,1.9rem)' : 'clamp(0.68rem,1cqw,1.2rem)', padding: '0.7cqw 0.25cqw 0.5cqw' }}
      >
        {p.cap}
      </figcaption>
    </motion.figure>
  )
}

/** Postmark stamp + wavy cancellation lines */
function Stamp({ shown, hide }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
      animate={shown ? { opacity: hide ? 0 : 1, scale: 1, rotate: -8 } : { opacity: 0, scale: 0.6, rotate: -30 }}
      transition={{ duration: 0.9, delay: hide ? 0 : 0.9, ease: EASE }}
      className="pointer-events-none absolute z-[30] text-ink"
      style={{ left: '21.5%', top: '46%', width: '13%' }}
    >
      <svg viewBox="0 0 320 150" className="w-full overflow-visible">
        <defs>
          <path id="wc-arc" d="M70,75 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <circle cx="70" cy="75" r="62" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="70" cy="75" r="40" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <text fontSize="11.5" letterSpacing="2.6" fill="currentColor" fontWeight="500" fontFamily="Figtree, sans-serif">
          <textPath href="#wc-arc" startOffset="2%">TREAT HOTELS &amp; RESORTS ·</textPath>
        </text>
        <text x="70" y="72" textAnchor="middle" fontSize="15" fontWeight="600" fill="currentColor" fontFamily="Figtree, sans-serif">
          WEDDINGS
        </text>
        <text x="70" y="90" textAnchor="middle" fontSize="11" letterSpacing="1.5" fill="currentColor" fontFamily="Figtree, sans-serif">
          SINCE 1980s
        </text>
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M150 ${42 + k * 17} q 20 -14 40 0 t 40 0`} />
          ))}
        </g>
      </svg>
    </motion.div>
  )
}

/** Phones / tablets: simple tilted polaroids */
function MobilePolaroid({ p, i }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 50, rotate: p.rot * 0.6 + (i % 2 ? 6 : -6) }}
      whileInView={{ opacity: 1, y: 0, rotate: p.rot * 0.6 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1, delay: (i % 3) * 0.1, ease: EASE }}
      className="bg-paper shadow-[0_18px_40px_-16px_rgba(60,30,10,0.45)]"
      style={{ padding: '10px 10px 6px' }}
    >
      <div className="relative w-full overflow-hidden bg-sand" style={{ aspectRatio: p.ratio }}>
        <img src={p.src} alt={p.cap} loading="lazy" draggable="false" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: p.pos }} />
      </div>
      <figcaption className="font-display text-[0.95rem] italic leading-tight text-ink/80" style={{ padding: '10px 4px 8px' }}>
        {p.cap}
      </figcaption>
    </motion.figure>
  )
}

export default function WeddingsCollage() {
  const stage = useRef(null)
  const shown = useInView(stage, { once: true, amount: 0.2 })
  const [active, setActive] = useState(null)
  const [interacted, setInteracted] = useState(false)
  const anyActive = active !== null

  const select = (i) => {
    setInteracted(true)
    setActive((a) => (a === i ? null : i))
  }

  useEffect(() => {
    if (!anyActive) return
    const onKey = (e) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [anyActive])

  return (
    <section
      id="weddings-collage"
      className="relative overflow-hidden bg-cream pb-[clamp(1rem,3svh,2rem)] pt-[clamp(4.5rem,10svh,6rem)] lg:pt-[clamp(4.25rem,9.5svh,5.5rem)]"
    >
      {/* ---------- desktop: full-width stage ---------- */}
      <div
        ref={stage}
        onClick={() => setActive(null)}
        className="relative hidden w-full lg:block"
        style={{ aspectRatio: `${STAGE_RATIO} / 1`, containerType: 'inline-size' }}
      >
        <div className="absolute z-20" style={{ left: '3.5%', top: '5%', width: '28%' }}>
          <Eyebrow line className="text-terra">
            {weddings.eyebrow}
          </Eyebrow>
          <Heading lines={weddings.heading} className="mt-[0.9cqw] whitespace-nowrap text-[3.5cqw]" accent />
          <div className="mt-[0.9cqw] max-w-[26cqw] space-y-[0.4cqw] text-ink/75" style={{ fontSize: 'clamp(0.74rem,0.74cqw,1rem)', lineHeight: 1.5 }}>
            {weddings.body.map((b, k) => (
              <Reveal key={k} delay={0.15 + k * 0.1} y={20}>
                <p>{b}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {PHOTOS.map((p, i) => (
          <Polaroid
            key={p.key}
            p={p}
            i={i}
            shown={shown}
            active={active === i}
            anyActive={anyActive}
            interacted={interacted}
            onSelect={() => select(i)}
          />
        ))}
        <Stamp shown={shown} hide={anyActive} />

        <AnimatePresence>
          {anyActive && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute bottom-[0.8cqw] left-1/2 z-[70] -translate-x-1/2 rounded-full bg-ink/85 px-5 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-cream backdrop-blur"
            >
              Click anywhere to go back
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ---------- phones / tablets: stacked ---------- */}
      <div className="mx-auto w-full max-w-[720px] px-6 lg:hidden">
        <Eyebrow line className="text-terra">
          {weddings.eyebrow}
        </Eyebrow>
        <Heading lines={weddings.heading} className="mt-4 text-[clamp(2.6rem,12vw,4.4rem)]" />
        <div className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-ink/75">
          {weddings.body.map((b, k) => (
            <p key={k}>{b}</p>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 items-start gap-x-4 gap-y-7 pb-6">
          {PHOTOS.map((p, i) => (
            <div key={p.key} className={i === 0 ? 'col-span-2' : ''}>
              <MobilePolaroid p={p} i={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
