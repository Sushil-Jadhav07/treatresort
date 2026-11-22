import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { EASE, scrollToHash } from './ui'

/** Small floating button, bottom-right. Appears after scrolling; the ring shows page progress. */
export default function BackToTop({ ready }) {
  const [show, setShow] = useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  useMotionValueEvent(scrollY, 'change', (v) => setShow(v > 700))

  return (
    <AnimatePresence>
      {ready && show && (
        <motion.button
          type="button"
          onClick={() => scrollToHash('#top')}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="group fixed bottom-4 right-4 z-40 grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full bg-ink text-cream shadow-[0_12px_30px_-8px_color-mix(in_srgb,var(--color-ink)_60%,transparent)] ring-1 ring-cream/20 transition-colors duration-300 hover:bg-terra md:bottom-7 md:right-7"
        >
          <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
            <circle cx="24" cy="24" r="22" fill="none" className="stroke-cream/20" strokeWidth="2" />
            <motion.circle cx="24" cy="24" r="22" fill="none" className="stroke-terra" strokeWidth="2" strokeLinecap="round" style={{ pathLength: progress }} />
          </svg>
          <ArrowUp className="relative h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
