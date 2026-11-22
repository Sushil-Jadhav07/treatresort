import { Button, Eyebrow, Heading, Reveal } from '../ui'
import { moments } from '../../data/content'

const TILT = [-3, 2, -1.5, 3, -2.5, 1.5]

function Row({ items, reverse, duration }) {
  const loop = [...items, ...items]
  return (
    <div className="marquee overflow-hidden py-3" style={{ '--marquee-duration': `${duration}s` }}>
      <div className={`marquee-track flex w-max gap-8 ${reverse ? 'reverse' : ''}`}>
        {loop.map((it, i) => (
          <figure
            key={i}
            aria-hidden={i >= items.length}
            className="relative w-[clamp(140px,calc(50svh-14.25rem),250px)] shrink-0 rotate-[var(--r)] bg-paper p-2.5 pb-10 shadow-[0_18px_40px_-18px_rgba(60,30,10,0.5)] transition-all duration-700 ease-out-expo hover:z-10 hover:rotate-0 hover:scale-[1.07]"
            style={{ '--r': `${TILT[i % TILT.length]}deg` }}
          >
            <img
              src={it.image}
              alt={i >= items.length ? '' : it.caption}
              loading="lazy"
              draggable="false"
              className="aspect-square w-full object-cover"
            />
            <figcaption className="absolute inset-x-3 bottom-2 truncate font-hand text-xl text-ink/80">{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

export default function Moments() {
  return (
    <section id="gallery" className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-cream py-[clamp(2.5rem,6svh,6rem)]">
      <div className="container-x flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow className="text-terra" line>
            {moments.eyebrow}
          </Eyebrow>
          <Heading lines={moments.heading} className="mt-4 text-[clamp(2.4rem,min(5.4vw,9svh),5rem)]" />
        </div>
        <div className="max-w-md">
          <Reveal delay={0.1}>
            <p className="text-[1rem] leading-relaxed text-ink/70">{moments.body}</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-5">
            <Button href="#gallery" variant="outline">
              {moments.cta}
            </Button>
          </Reveal>
        </div>
      </div>

      <div className="relative mt-[clamp(1rem,3.5svh,2.5rem)] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <Row items={moments.rows[0]} duration={70} />
        <Row items={moments.rows[1]} duration={80} reverse />
      </div>
    </section>
  )
}
