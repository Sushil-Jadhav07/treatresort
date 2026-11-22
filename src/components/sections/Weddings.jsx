import { motion, useTransform } from 'motion/react'
import { Eyebrow, Heading } from '../ui'
import { BentoCell, BentoGrid, ContainerScale, ContainerScroll, useContainerScroll } from '../ui/hero-gallery-scroll'
import { weddings } from '../../data/content'

/** Appears once the photos have fully grown: venue types + CTA. */
function EndCaption() {
  const { scrollYProgress } = useContainerScroll()
  const opacity = useTransform(scrollYProgress, [0.78, 0.95], [0, 1])
  const y = useTransform(scrollYProgress, [0.78, 0.95], [30, 0])
  const pointerEvents = useTransform(opacity, (v) => (v < 0.5 ? 'none' : 'auto'))
  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 max-md:pr-16 md:bottom-10"
    >
      <div className="flex max-w-full flex-col items-center gap-4 rounded-[2rem] border border-ink/10 bg-ink/90 px-3 py-3 text-cream shadow-2xl backdrop-blur-xl md:px-6 md:py-4 md:flex-row md:gap-8 md:rounded-full md:py-3 md:pl-8 md:pr-3">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 max-md:hidden gap-y-1 text-[0.64rem] uppercase tracking-[0.2em] text-cream/85 md:text-[0.7rem]">
          {weddings.tags.map((t, i) => (
            <li key={t} className="flex items-center gap-2">
              <span className="font-semibold text-soft">{String(i + 1).padStart(2, '0')}</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default function Weddings() {
  return (
    <ContainerScroll id="weddings" className="h-[320vh] bg-cream text-ink">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* photo mosaic */}
        <BentoGrid className="relative z-0 h-full w-full p-3 pb-20 pt-20 md:p-6 md:pt-28">
          {weddings.gallery.map((g) => (
            <BentoCell key={g.image} scrim="color-mix(in srgb, var(--color-cream) 74%, transparent)" className="overflow-hidden rounded-2xl shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] md:rounded-3xl">
              <img
                src={g.image}
                alt={g.alt}
                loading="lazy"
                draggable="false"
                className="size-full object-cover"
                style={{ objectPosition: g.position }}
              />
            </BentoCell>
          ))}
        </BentoGrid>

        {/* hero copy — shrinks & fades as the photos grow */}
        <ContainerScale className="w-[min(92vw,56rem)] text-center">
          <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[140%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-cream)_92%,transparent),color-mix(in_srgb,var(--color-cream)_0%,transparent)_68%)]" />
          <Eyebrow line className="justify-center text-terra">
            {weddings.eyebrow}
          </Eyebrow>
          <Heading
            lines={weddings.heading}
            className="mt-5 text-[clamp(2.8rem,7.4vw,6.4rem)]"
          />
          <div className="mx-auto mt-6 max-w-2xl space-y-3 text-[0.98rem] leading-relaxed text-ink/75 md:text-[1.05rem]">
            {weddings.body.map((b, k) => (
              <p key={k}>{b}</p>
            ))}
          </div>
        </ContainerScale>

        <EndCaption />
      </div>
    </ContainerScroll>
  )
}
