import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Plus } from 'lucide-react'
import { A, Button, Heading, Wordmark } from '../ui'
import LocationMap from './LocationMap'
import { brand, cta, footer } from '../../data/content'

function Cta() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const sunY = useTransform(scrollYProgress, [0, 1], ['30%', '-10%'])
  const waveX = useTransform(scrollYProgress, [0, 1], ['0%', '-12%'])

  return (
    <section ref={ref} className="relative isolate flex min-h-[max(100svh,760px)] md:min-h-[max(100svh,680px)] flex-col overflow-hidden bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-cta-2)_38%,var(--color-cta-3)_78%,var(--color-cta-4)_100%)] pb-0 pt-[clamp(2.5rem,6svh,4.5rem)]">
      <motion.div
        aria-hidden
        style={{ y: sunY }}
        className="absolute left-1/2 top-1/2 -z-10 h-[34vw] min-h-[240px] w-[34vw] min-w-[240px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-sun-2)_0%,var(--color-sun)_35%,rgba(255,190,120,0)_70%)] blur-xl"
      />
      <div aria-hidden className="blob-a absolute -left-20 top-10 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55),transparent_65%)] blur-2xl" />
      <div aria-hidden className="blob-b absolute -right-20 bottom-24 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-mustard)_50%,transparent),transparent_65%)] blur-2xl" />

      {/* full-bleed map behind everything; its bottom slides under the wave */}
      <LocationMap />

      {/* title sits on top and fades into the map */}
      <div className="container-x pointer-events-none relative z-10 flex w-full flex-col justify-between gap-6 text-left lg:flex-row lg:items-end">
        <Heading lines={cta.heading} className="text-[clamp(2.6rem,min(6vw,11svh),6rem)]" />
        <div className="pointer-events-auto max-w-md pb-1">
          <p className="text-[1rem] leading-relaxed text-ink/75">
            Find your nearest Treat hotel or resort and plan your visit — pick a property to see it on the map.
          </p>
          <div className="mt-5">
            <Button href="#enquire">{cta.button}</Button>
          </div>
        </div>
      </div>

      {/* wave into footer */}
      <motion.svg
        aria-hidden
        viewBox="0 0 2880 160"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-[-1px] left-0 z-10 h-[90px] w-[200%] text-ink md:h-[140px]"
        style={{ x: waveX }}
      >
        <path
          fill="currentColor"
          d="M0 90 C 240 20, 480 20, 720 90 S 1200 160, 1440 90 C 1680 20, 1920 20, 2160 90 S 2640 160, 2880 90 V160 H0Z"
        />
      </motion.svg>
    </section>
  )
}

const COLUMNS = [
  { title: 'Company', links: footer.columns[0] },
  { title: 'Explore', links: footer.columns[1] },
  { title: 'Support', links: footer.columns[2] },
]

const linkCls = 'text-[0.88rem] text-cream/65 transition-colors hover:text-cream'

export default function Footer() {
  return (
    <>
      <Cta />
      <footer className="relative overflow-hidden bg-ink text-cream">
        <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-[clamp(1.5rem,3.2vw,4.5rem)] pb-6 pt-10 md:grid-cols-12 md:gap-8 md:pt-12">
          {/* brand */}
          <div className="md:col-span-4">
            <Wordmark tone="light" className="h-20 md:h-24" />
            <p className="display mt-5 text-[1.5rem] italic text-cream/90">{brand.tagline}</p>
            <a href={brand.phoneHref} className="mt-5 block font-display text-[1.7rem] transition-colors hover:text-terra">
              {brand.phone}
            </a>
            <a href={`mailto:${brand.email}`} className="mt-1 block text-[0.88rem] text-cream/65 transition-colors hover:text-cream">
              {brand.email}
            </a>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {footer.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[0.68rem] uppercase tracking-[0.22em] text-cream/70 transition-colors hover:text-terra"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>

          {/* desktop: link columns + hotel chips */}
          <div className="max-md:hidden md:col-span-8 lg:pl-10">
            <nav aria-label="Footer" className="grid grid-cols-3 gap-8">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <p className="eyebrow text-[0.6rem] text-cream/45">{col.title}</p>
                  <ul className="mt-4 grid gap-2.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <A href={l.href} className={linkCls}>
                          {l.label}
                        </A>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <p className="eyebrow mt-8 text-[0.6rem] text-cream/45">Our Hotels &amp; Resorts</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {footer.hotels.map((h) => (
                <li key={h}>
                  <A
                    href="#properties"
                    className="block rounded-full border border-cream/15 px-3 py-1.5 text-[0.7rem] text-cream/70 transition-colors hover:border-terra hover:bg-terra hover:text-cream"
                  >
                    {h}
                  </A>
                </li>
              ))}
            </ul>
          </div>

          {/* phones: each group folds away */}
          <nav aria-label="Footer" className="-mx-2 grid gap-1 md:hidden">
            {[...COLUMNS, { title: 'Hotels & Resorts', links: footer.hotels.map((h) => ({ label: h, href: '#properties' })) }].map((col) => (
              <details key={col.title} className="group rounded-2xl open:bg-cream/[0.05]">
                <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-3 [&::-webkit-details-marker]:hidden">
                  <span className="eyebrow text-[0.64rem] text-cream/70">{col.title}</span>
                  <Plus className="h-4 w-4 text-cream/60 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.75} />
                </summary>
                <ul className="px-3 pb-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <A href={l.href} className="block py-2.5 text-[0.95rem] text-cream/70">
                        {l.label}
                      </A>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>
        </div>

        {/* notice + legal line */}
        <div className="mx-auto w-full max-w-[1500px] px-[clamp(1.5rem,3.2vw,4.5rem)]">
          <p className="border-l-2 border-terra pl-4 text-[0.72rem] leading-relaxed text-cream/50">{footer.notice}</p>
          <div className="mt-5 flex flex-col gap-3 border-t border-cream/12 pt-4 text-[0.78rem] text-cream/55 sm:flex-row sm:items-center sm:justify-between">
            <p suppressHydrationWarning>© {new Date().getFullYear()} Treat Hotels &amp; Resorts. All rights reserved.</p>
          </div>
        </div>

        {/* the name, set large and fading into the background */}
        <p
          aria-hidden="true"
          className="pointer-events-none -mb-[0.3em] mt-0 select-none text-center font-display text-[clamp(70px,14vw,230px)] font-normal leading-[1.1] tracking-[-0.04em] text-transparent [-webkit-background-clip:text] [background-clip:text] [background-image:linear-gradient(to_bottom,color-mix(in_srgb,var(--color-cream)_30%,transparent),color-mix(in_srgb,var(--color-cream)_0%,transparent)_85%)]"
        >
          Treat
        </p>
      </footer>
    </>
  )
}
