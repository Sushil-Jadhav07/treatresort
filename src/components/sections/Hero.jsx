import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { Volume2, VolumeX } from 'lucide-react'
import { A, EASE, Eyebrow, Heading } from '../ui'
import BookingBar from './BookingBar'

export default function Hero({ ready, children }) {
  return (
    <section id="top" className="relative bg-cream pt-[5.75rem] sm:pt-[7.5rem] lg:pt-[clamp(9rem,17.5svh,10.5rem)]">
      <div className="container-x text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
        >
          <Eyebrow className="justify-center text-ink">Treat Hotels &amp; Resorts</Eyebrow>
        </motion.div>

        <Heading
          as="h1"
          ready={ready}
          delay={0.2}
          lines={['A tradition of service,', 'a future of excellence.']}
          className="mx-auto mt-4 max-w-[16ch] text-[clamp(1.85rem,min(7.2vw,10.5svh),6.4rem)] leading-[1.02] text-ink sm:mt-5 sm:max-w-none"
        />

        <motion.p
          className="mx-auto mt-4 max-w-5xl text-sm text-ink/65 max-sm:hidden md:text-base [@media(max-height:760px)]:hidden"
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
        >
          Redefining hospitality across India — weddings, corporate getaways, dining and serene stays.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 1.05, ease: EASE }}
          className="relative z-20 mx-auto mt-4 max-w-[1180px] sm:mt-[clamp(1rem,3.2svh,2.5rem)]"
        >
          <BookingBar />
        </motion.div>
      </div>

      <HeroVideoStack>{children}</HeroVideoStack>
    </section>
  )
}

/**
 * Video + next section, stacked like the 21st.dev "hero scroll animation":
 *  1. the video expands to full screen as you scroll down and plays while on screen
 *  2. it stays pinned; the next section slides up over it
 *  3. while that happens the video scales 1 → 0.8 and tilts to -5°, and the next section
 *     comes in at 0.8 scale / 5° and straightens to 1 / 0°
 */
function HeroVideoStack({ children }) {
  const wrap = useRef(null)
  const stage = useRef(null)
  const video = useRef(null)
  const nextRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [covered, setCovered] = useState(false)
  const inView = useInView(stage, { amount: 0.3 })
  // the 3.8 MB film is only requested once the section is within ~1 screen of the viewport
  const nearby = useInView(stage, { once: true, margin: '100% 0px 100% 0px' })
  // ...and only after the page has settled: first user interaction, or 3.5 s after load (poster shows meanwhile)
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const arm = () => setArmed(true)
    const events = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown']
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }))
    let timer
    const afterLoad = () => {
      timer = setTimeout(arm, 3500)
    }
    if (document.readyState === 'complete') afterLoad()
    else window.addEventListener('load', afterLoad, { once: true })
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm))
      window.removeEventListener('load', afterLoad)
      clearTimeout(timer)
    }
  }, [])

  // Phase 1 — page scroll 0 → the moment the video pins to the top of the screen
  const { scrollY } = useScroll()
  const [pinAt, setPinAt] = useState(600)
  useLayoutEffect(() => {
    const measure = () => setPinAt(Math.max(1, wrap.current.getBoundingClientRect().top + window.scrollY))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('load', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('load', measure)
    }
  }, [])
  const expand = useTransform(scrollY, (v) => Math.min(1, Math.max(0, v / pinAt)))
  const arc = useTransform(expand, [0, 1], [1, 0])
  const zoom = useTransform(expand, [0, 1], [1.18, 1])
  const copy = useTransform(expand, [0.8, 1], [0, 1])
  const copyY = useTransform(expand, [0.8, 1], [40, 0])

  // Phase 2 — next section slides over the pinned video
  const { scrollYProgress: slide } = useScroll({ target: nextRef, offset: ['start end', 'start start'] })
  const vScale = useTransform(slide, [0, 1], [1, 0.8])
  const vRotate = useTransform(slide, [0, 1], [0, -5])
  const vRadius = useTransform(slide, [0, 1], [0, 40])
  const nScale = useTransform(slide, [0, 1], [0.8, 1])
  const nRotate = useTransform(slide, [0, 1], [5, 0])
  useMotionValueEvent(slide, 'change', (v) => setCovered(v >= 0.99))

  // play only while the video is on screen and not fully covered
  const shouldPlay = inView && !covered
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (shouldPlay) v.play().catch(() => {})
    else v.pause()
  }, [shouldPlay])

  const toggleSound = () => {
    const v = video.current
    v.muted = !v.muted
    setMuted(v.muted)
    if (shouldPlay) v.play().catch(() => {})
  }

  return (
    <div ref={wrap} className="relative mt-2 bg-cocoa">
      <div ref={stage} className="sticky top-0 h-[100svh] w-full">
        <motion.div
          className="relative h-full w-full origin-center overflow-hidden bg-cocoa will-change-transform"
          style={{ scale: vScale, rotate: vRotate, borderRadius: vRadius }}
        >
          <motion.video
            ref={video}
            src={nearby && armed ? '/homepage-banner-720.mp4' : undefined}
            poster="/images/hero-poster.webp"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ scale: zoom }}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Treat Hotels & Resorts — property film"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,10,8,0.7)_0%,rgba(20,10,8,0.05)_45%,rgba(20,10,8,0.2)_100%)]" />

          {/* concave cream arc over the top edge — flattens away as the video goes full screen */}
          <motion.svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2rem] w-full text-cream md:h-[4.5rem]"
            style={{ scaleY: arc, originY: 0 }}
          >
            <path d="M0 -2H100V22Q50 100 0 22Z" fill="currentColor" />
          </motion.svg>

          <motion.div style={{ opacity: copy, y: copyY }} className="absolute inset-x-0 bottom-0 z-20">
            <div className="container-x flex flex-col items-start justify-between gap-8 pb-10 text-cream md:flex-row md:items-end md:pb-14">
              <div>
                <p className="eyebrow text-cream/85">Treat Hotels &amp; Resorts</p>
                <p className="display mt-4 text-[clamp(2.4rem,6vw,5.4rem)]">
                  A luxury getaway
                  <br />
                  <em className="text-soft">in nature.</em>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSound}
                  aria-label={muted ? 'Unmute video' : 'Mute video'}
                  aria-pressed={!muted}
                  className="grid h-12 w-12 place-items-center rounded-full border border-cream/60 transition-colors hover:bg-cream hover:text-ink"
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <A
                  href="#properties"
                  className="border border-cream/70 px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.22em] transition-colors hover:bg-cream hover:text-ink"
                >
                  Explore stays
                </A>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* pinned "dwell" — the full-screen video plays while you scroll through this space */}
      <div aria-hidden className="h-[70svh]" />

      {/* next section slides over the pinned video */}
      <motion.div
        ref={nextRef}
        style={{ scale: nScale, rotate: nRotate }}
        className="relative z-10 min-h-[100svh] origin-center overflow-hidden rounded-t-[2.5rem] bg-cream shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.5)] will-change-transform md:rounded-t-[4rem]"
      >
        {children}
      </motion.div>
    </div>
  )
}
