import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { A, ArrowLink, EASE, Eyebrow, Heading, Reveal } from '../ui'
import { properties, propertiesCopy } from '../../data/content'

export default function Properties() {
  const scroller = useRef(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const [index, setIndex] = useState(0)
  const total = properties.length

  const onScroll = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const card = el.querySelector('[data-card]')
    if (!card) return
    const step = card.offsetWidth + 24
    const max = el.scrollWidth - el.clientWidth
    const idx = el.scrollLeft >= max - 4 ? total - 1 : Math.round(el.scrollLeft / step)
    setIndex(Math.min(total - 1, idx))
  }, [total])

  useEffect(() => {
    onScroll()
  }, [onScroll])

  const by = (dir) => {
    const el = scroller.current
    const card = el.querySelector('[data-card]')
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' })
  }

  // mouse drag-to-scroll
  const down = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = scroller.current
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false }
  }
  const move = (e) => {
    const d = drag.current
    if (!d.down) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 5) d.moved = true
    scroller.current.scrollLeft = d.left - dx
  }
  const up = () => {
    drag.current.down = false
    scroller.current.style.scrollSnapType = ''
  }

  const progress = ((index + 1) / total) * 100

  return (
    <section id="properties" className="relative flex min-h-svh items-center overflow-hidden bg-cream py-[clamp(1.5rem,5svh,8rem)]">
      <div className="grid w-full gap-14 pl-[clamp(1.5rem,3.2vw,4.5rem)] lg:grid-cols-[minmax(300px,27%)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col pr-6 lg:pr-0">
          <Eyebrow className="text-terra">{propertiesCopy.eyebrow}</Eyebrow>
          <Heading lines={propertiesCopy.heading} className="mt-6 text-[clamp(2.8rem,5.4vw,4.8rem)]" />
          <Reveal delay={0.1} className="mt-7 max-w-md text-[1.02rem] leading-relaxed text-ink/70">
            <p>{propertiesCopy.body}</p>
          </Reveal>

          <div className="mt-10 flex items-center gap-6 lg:mt-auto lg:pt-16">
            <p className="whitespace-nowrap font-display text-4xl text-terra tabular-nums">
              {String(index + 1).padStart(2, '0')}
              <span className="ml-2 text-xl text-ink">/ {String(total).padStart(2, '0')}</span>
            </p>
            <div className="relative h-px w-28 bg-ink/20">
              <motion.span
                className="absolute inset-y-0 left-0 h-[2px] -translate-y-1/2 bg-terra"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </div>
            <div className="flex gap-2">
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  onClick={() => by(d)}
                  aria-label={d < 0 ? 'Previous property' : 'Next property'}
                  className="grid h-12 w-12 place-items-center rounded-full border border-ink/25 transition-colors duration-300 hover:border-terra hover:bg-terra hover:text-cream"
                >
                  {d < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <ArrowLink href="#properties">View All</ArrowLink>
          </div>
        </div>

        <div
          ref={scroller}
          onScroll={onScroll}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pr-[clamp(1.5rem,3.2vw,4.5rem)] active:cursor-grabbing"
        >
          {properties.map((p, i) => (
            <Card key={p.slug} p={p} i={i} drag={drag} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Card({ p, i, drag }) {
  const soon = p.status !== 'open'
  return (
    <motion.article
      data-card
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1, delay: Math.min(i, 3) * 0.08, ease: EASE }}
      className="group w-[calc(100vw-3rem)] shrink-0 snap-start sm:w-[min(78vw,400px,max(230px,calc((100svh-19rem)*0.8)))]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          draggable="false"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/20" />
        <p className="eyebrow absolute left-5 top-5 text-[0.6rem] text-cream">{soon ? p.status : 'Open now'}</p>
        <p className="eyebrow absolute right-5 top-5 text-[0.6rem] text-cream">Explore</p>
        <A
          href="#enquire"
          onClick={(e) => {
            if (drag.current.moved) e.preventDefault()
          }}
          className="absolute bottom-5 right-5 grid h-20 w-20 scale-50 place-items-center rounded-full bg-terra text-center font-display text-sm italic leading-tight text-cream opacity-0 transition-all duration-500 ease-out-expo group-hover:scale-100 group-hover:opacity-100"
        >
          Book
          <br />
          now
        </A>
      </div>
      <h3 className="display mt-5 text-[1.7rem] leading-[1.1]">{p.name}</h3>
      <div className="mt-3 flex items-center justify-between text-ink/65">
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-terra" strokeWidth={1.6} />
          {p.place}
        </p>
        <A
          href="#enquire"
          className="flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:text-terra"
        >
          {soon ? 'Enquire' : 'Book Now'} <ArrowRight className="h-3.5 w-3.5" />
        </A>
      </div>
    </motion.article>
  )
}
