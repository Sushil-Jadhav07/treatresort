/**
 * Hero gallery scroll animation — ported from the 21st.dev "hero-gallery-scroll-animation"
 * component to plain JSX (no shadcn / TypeScript / cva needed).
 *
 * Usage:
 *   <ContainerScroll className="h-[300vh]">
 *     <div className="sticky top-0 h-svh overflow-hidden">
 *       <BentoGrid> <BentoCell>…</BentoCell> … </BentoGrid>
 *       <ContainerScale>…hero content…</ContainerScale>
 *     </div>
 *   </ContainerScroll>
 *
 * Progress runs 0 → 1 while the sticky viewport is pinned: cells slide in and grow from 50 % to
 * full size, while the centred content shrinks and fades away.
 */
import { createContext, useContext, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

const ScrollContext = createContext(null)
export function useContainerScroll() {
  const ctx = useContext(ScrollContext)
  if (!ctx) throw new Error('Gallery scroll components must be used inside <ContainerScroll>')
  return ctx
}

export function ContainerScroll({ children, className = '', ...props }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <ScrollContext.Provider value={{ scrollYProgress }}>
      <div ref={ref} className={`relative w-full ${className}`} {...props}>
        {children}
      </div>
    </ScrollContext.Provider>
  )
}

const GRID = {
  default: `
    grid-cols-8 grid-rows-[1fr_0.5fr_0.5fr_1fr]
    [&>*:first-child]:col-span-8 md:[&>*:first-child]:col-span-6 [&>*:first-child]:row-span-3
    [&>*:nth-child(2)]:col-span-2 md:[&>*:nth-child(2)]:row-span-2 [&>*:nth-child(2)]:hidden md:[&>*:nth-child(2)]:block
    [&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:row-span-2 [&>*:nth-child(3)]:hidden md:[&>*:nth-child(3)]:block
    [&>*:nth-child(4)]:col-span-4 md:[&>*:nth-child(4)]:col-span-3
    [&>*:nth-child(5)]:col-span-4 md:[&>*:nth-child(5)]:col-span-3
  `,
  threeCells: `
    grid-cols-2 grid-rows-2
    [&>*:first-child]:col-span-2
  `,
  fourCells: `
    grid-cols-3 grid-rows-2
    [&>*:first-child]:col-span-1
    [&>*:nth-child(2)]:col-span-2
    [&>*:nth-child(3)]:col-span-2
  `,
}

export function BentoGrid({ variant = 'default', className = '', ...props }) {
  return (
    <div
      className={`relative grid gap-3 md:gap-4 [&>*:first-child]:origin-top-right [&>*:nth-child(3)]:origin-bottom-right [&>*:nth-child(4)]:origin-top-right ${GRID[variant]} ${className}`}
      {...props}
    />
  )
}

export function BentoCell({ className = '', style, children, scrim = 'color-mix(in srgb, var(--color-cream) 70%, transparent)', ...props }) {
  const { scrollYProgress } = useContainerScroll()
  const x = useTransform(scrollYProgress, [0.1, 0.9], ['-35%', '0%'])
  const scale = useTransform(scrollYProgress, [0, 0.9], [0.5, 1])
  // darkening scrim keeps the centred copy readable at the start, then lifts as photos grow
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  return (
    <motion.div className={`relative ${className}`} style={{ x, scale, ...style }} {...props}>
      {children}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: scrimOpacity, background: scrim }} />
    </motion.div>
  )
}

export function ContainerScale({ className = '', style, ...props }) {
  const { scrollYProgress } = useContainerScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.45], [1, 0.6])
  const pointerEvents = useTransform(opacity, (v) => (v < 0.15 ? 'none' : 'auto'))
  return (
    <motion.div
      className={`absolute left-1/2 top-1/2 z-10 h-fit ${className}`}
      style={{ translate: '-50% -50%', scale, opacity, pointerEvents, ...style }}
      {...props}
    />
  )
}
