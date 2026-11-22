import { useEffect, useState } from 'react'
import { animate, motion } from 'motion/react'
import { EASE, Wordmark } from './ui'

const WORDS = [
  { t: 'Welcome', i: false },
  { t: 'to', i: false },
  { t: 'Treat', i: false },
  { t: 'Resorts', i: true },
]

export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setTimeout(onDone, 60),
    })
    return () => controls.stop()
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-cream"
      initial={{ y: 0 }}
      exit={{
        y: '-105%',
        borderBottomLeftRadius: '50% 14vh',
        borderBottomRightRadius: '50% 14vh',
        transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
      }}
      aria-label="Loading"
      role="status"
      data-preloader
    >
      {/* floating gradient blobs */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="blob-a absolute left-1/2 top-1/2 h-[95vh] w-[34vw] min-w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--color-glow)_0%,var(--color-glow-2)_45%,transparent_75%)] blur-[70px]" />
        <div className="blob-b absolute left-[56%] top-[52%] h-[80vh] w-[28vw] min-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--color-sun)_0%,var(--color-sun-2)_50%,color-mix(in_srgb,var(--color-cream)_0%,transparent)_78%)] blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-cream)_0%,color-mix(in_srgb,var(--color-cream)_0%,transparent)_30%,color-mix(in_srgb,var(--color-cream)_0%,transparent)_70%,var(--color-cream)_100%)]" />
      </motion.div>

      <p className="relative z-10 px-6 text-center font-display text-[clamp(2.4rem,7vw,6.4rem)] font-normal leading-none tracking-[-0.02em] text-ink">
        {WORDS.map((w, i) => (
          <span key={w.t} className="inline-block overflow-hidden pb-[0.15em] align-top">
            <motion.span
              className={`inline-block ${w.i ? 'italic text-terra' : ''}`}
              initial={{ y: '110%', filter: 'blur(10px)', opacity: 0 }}
              animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.05 + i * 0.07, ease: EASE }}
            >
              {w.t}
              {i < WORDS.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </p>

      <motion.p
        className="absolute bottom-[14vh] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.62rem] uppercase tracking-[0.34em] text-ink/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        A luxury getaway in nature
      </motion.p>

      <div className="absolute inset-x-6 bottom-8 flex items-end justify-between text-ink md:inset-x-10">
        <Wordmark className="h-16 md:h-20" />
        <span className="font-display text-5xl font-light tabular-nums leading-none md:text-7xl">
          {String(count).padStart(2, '0')}
          <span className="text-terra">%</span>
        </span>
      </div>
      <motion.span
        className="absolute bottom-0 left-0 h-[3px] origin-left bg-terra"
        style={{ width: '100%', scaleX: count / 100 }}
      />
    </motion.div>
  )
}
