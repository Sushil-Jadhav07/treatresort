import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { A, EASE, Wordmark, scrollToHash } from './ui'
import { brand, navLinks, navProperties } from '../data/content'

export default function Navbar({ ready }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > last && y > 400 && !open)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    const lenis = window.__lenis
    if (!lenis || !ready) return
    if (open) lenis.stop()
    else lenis.start()
  }, [open, ready])

  const go = (href) => {
    setOpen(false)
    setDrop(false)
    setTimeout(() => scrollToHash(href), open ? 350 : 0)
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -120 }}
        animate={{ y: ready ? (hidden ? -140 : 0) : -120 }}
        transition={{ duration: 0.8, ease: EASE }}
        onMouseLeave={() => setDrop(false)}
      >
        <div
          className={`overflow-hidden bg-ink text-center text-[0.64rem] uppercase tracking-[0.3em] text-cream/90 transition-[max-height,padding] duration-500 ${
            scrolled ? 'max-h-0 py-0' : 'max-h-10 py-2.5'
          }`}
        >
          Book direct at treatresorts.com
          <span className="hidden sm:inline">
            <span className="mx-2 text-terra">•</span>
            <a href={brand.phoneHref} className="hover:text-white">
              {brand.phone}
            </a>
          </span>
        </div>

        <div
          className={`relative transition-all duration-500 ${
            scrolled ? 'bg-cream/85 shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_8%,transparent)] backdrop-blur-xl' : 'bg-cream'
          }`}
        >
          <div className="container-x flex items-center justify-between py-4 lg:py-5">
            <A href="#top" aria-label="Treat Hotels & Resorts — home" className="shrink-0">
              <Wordmark className={scrolled ? 'h-11 lg:h-11' : 'h-12 lg:h-14'} />
            </A>

            <nav className="hidden items-center gap-5 xl:gap-9 2xl:gap-11 lg:flex" aria-label="Primary">
              {navLinks.map((l) =>
                l.dropdown ? (
                  <button
                    key={l.label}
                    onMouseEnter={() => setDrop(true)}
                    onClick={() => setDrop((d) => !d)}
                    aria-expanded={drop}
                    className="group flex items-center gap-1.5 whitespace-nowrap text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink"
                  >
                    <NavLabel>{l.label}</NavLabel>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${drop ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <A
                    key={l.label}
                    href={l.href}
                    onMouseEnter={() => setDrop(false)}
                    className="group whitespace-nowrap text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink"
                  >
                    <NavLabel>{l.label}</NavLabel>
                  </A>
                ),
              )}
            </nav>

            <div className="flex items-center gap-3">
              <A
                href="#enquire"
                className="hidden whitespace-nowrap bg-terra px-5 py-3 text-[0.7rem] xl:px-6 font-medium uppercase tracking-[0.22em] text-cream transition-colors duration-300 hover:bg-terra-deep sm:inline-block"
              >
                Reserve Now
              </A>
              <button
                onClick={() => setOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* properties dropdown */}
          <AnimatePresence>
            {drop && (
              <motion.div
                initial={{ opacity: 0, y: -12, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-x-0 top-full hidden border-t border-ink/10 bg-cream shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] lg:block"
              >
                <div className="container-x grid grid-cols-[1fr_2fr] gap-12 py-10">
                  <div>
                    <p className="eyebrow text-terra">Our Properties</p>
                    <p className="display mt-4 text-4xl">
                      Twelve ways to <em>escape</em>.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 text-[0.72rem] font-medium uppercase tracking-[0.2em]">
                      <A href="#new-upcoming" onClick={() => setDrop(false)} className="hover:text-terra">
                        New &amp; Upcoming Hotels →
                      </A>
                      <a href="https://www.treatadventurepark.com" target="_blank" rel="noreferrer" className="hover:text-terra">
                        Treat Adventure Park, Silvassa ↗
                      </a>
                    </div>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-10">
                    {navProperties.map((p, i) => (
                      <motion.li
                        key={p}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                      >
                        <A
                          href="#properties"
                          onClick={() => setDrop(false)}
                          className="group flex items-center justify-between border-b border-ink/10 py-3.5 font-display text-xl"
                        >
                          <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-hover:text-terra">
                            {p}
                          </span>
                          <span className="text-terra opacity-0 transition-opacity group-hover:opacity-100">→</span>
                        </A>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="h-[2px] origin-left bg-terra" style={{ scaleX: progress }} />
      </motion.header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-cocoa text-cream lg:hidden"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-5">
              <Wordmark tone="light" className="h-14" />
              <button
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/30"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
              {navLinks.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault()
                    go(l.href)
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: EASE }}
                  className="display border-b border-cream/10 py-4 text-4xl"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="px-6 pb-8">
              <A
                href="#enquire"
                onClick={() => setOpen(false)}
                className="block bg-terra py-4 text-center text-xs font-medium uppercase tracking-[0.24em]"
              >
                Reserve Now
              </A>
              <p className="mt-5 text-center text-xs tracking-[0.2em] text-cream/60">{brand.phone}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLabel({ children }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
      <span className="absolute inset-0 block translate-y-full text-terra transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
        {children}
      </span>
    </span>
  )
}
