import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'motion/react'
import { ArrowRight } from 'lucide-react'

export const EASE = [0.16, 1, 0.3, 1]

/** Smooth-scroll to an in-page anchor using Lenis when available. */
export function scrollToHash(hash) {
  if (!hash || hash === '#') return
  const lenis = window.__lenis
  const target = hash === '#top' ? 0 : document.querySelector(hash)
  if (target === null) return
  // sections hidden on this screen size (e.g. dining on phones) have no box: do nothing
  if (target !== 0 && !target.getClientRects().length) return
  if (lenis) lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -70, duration: 1.6 })
  else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  else target.scrollIntoView({ behavior: 'smooth' })
}

export function A({ href = '#', onClick, children, ...rest }) {
  const isAnchor = href.startsWith('#')
  return (
    <a
      href={href}
      onClick={(e) => {
        if (isAnchor) {
          e.preventDefault()
          scrollToHash(href)
        }
        onClick?.(e)
      }}
      {...(!isAnchor ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

/** Fade + rise on scroll into view. */
export function Reveal({ children, delay = 0, y = 36, className = '', as = 'div', amount = 0.2, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Word-by-word masked reveal with blur + slide (21st.dev "text reveal" style).
 * The last line is set in the italic accent when `accent` is true (matches the design).
 */
export function Heading({
  lines,
  as: Tag = 'h2',
  className = '',
  accent = true,
  accentClass = 'text-terra',
  delay = 0,
  ready = true,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const show = inView && ready
  // running word index per line so the stagger continues across lines
  const offsets = lines.reduce((acc, _, li) => [...acc, (acc[li - 1] ?? 0) + (li ? lines[li - 1].split(' ').length : 0)], [])
  return (
    <Tag ref={ref} className={`display ${className}`} aria-label={lines.join(' ')}>
      {lines.map((line, li) => {
        const isAccent = accent && lines.length > 1 && li === lines.length - 1
        return (
          <span key={li} className="block" aria-hidden="true">
            {line.split(' ').map((word, wi) => {
              const i = offsets[li] + wi
              return (
                <span key={wi}>
                  <span className="inline-block overflow-hidden align-top pb-[0.16em] -mb-[0.16em] pr-[0.04em] -mr-[0.04em]">
                    <motion.span
                      className={`inline-block ${isAccent ? `italic ${accentClass}` : ''}`}
                      initial={{ y: '115%', opacity: 0, filter: 'blur(10px)' }}
                      animate={show ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : undefined}
                      transition={{ duration: 1.15, delay: delay + i * 0.07, ease: EASE }}
                    >
                      {word}
                    </motion.span>
                  </span>{' '}
                </span>
              )
            })}
          </span>
        )
      })}
    </Tag>
  )
}

export function Eyebrow({ children, className = '', line = false }) {
  return (
    <p className={`eyebrow flex items-center gap-4 ${className}`}>
      <span>{children}</span>
      {line && <span className="h-px w-12 bg-current opacity-70" />}
    </p>
  )
}

/** Element that gently follows the cursor (magnetic hover). */
export function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

const BTN = {
  solid: 'bg-terra text-cream hover:bg-terra-deep',
  olive: 'bg-olive text-cream hover:bg-olive-deep',
  light: 'bg-cream text-ink hover:bg-white',
  outline: 'border border-current hover:bg-ink hover:text-cream hover:border-ink',
  'outline-light': 'border border-cream/80 text-cream hover:bg-cream hover:text-ink',
}

/** Primary button: label slides up on hover, arrow nudges. */
export function Button({ href = '#', variant = 'solid', children, className = '', arrow = true, ...rest }) {
  return (
    <Magnetic strength={0.18}>
      <A
        href={href}
        className={`group relative inline-flex items-center gap-3 overflow-hidden px-7 py-4 text-[0.74rem] font-medium uppercase tracking-[0.24em] transition-colors duration-500 ${BTN[variant]} ${className}`}
        {...rest}
      >
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
            {children}
          </span>
          <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
            {children}
          </span>
        </span>
        {arrow && (
          <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
        )}
      </A>
    </Magnetic>
  )
}

/** Text link with arrow and animated underline. */
export function ArrowLink({ href = '#', children, className = '' }) {
  return (
    <A
      href={href}
      className={`group inline-flex items-center gap-3 text-[0.74rem] font-medium uppercase tracking-[0.24em] ${className}`}
    >
      <span className="relative pb-1.5">
        {children}
        <span className="absolute inset-x-0 bottom-0 h-px origin-left bg-current opacity-60" />
        <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
      </span>
      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
    </A>
  )
}

/**
 * The official Treat logo.
 * `dark` = artwork tinted with the palette's ink colour (for light backgrounds),
 * `light` = the original white artwork (for dark backgrounds).
 */
export function Wordmark({ tone = 'dark', className = 'h-14' }) {
  if (tone === 'light') {
    return (
      <img
        src="/images/logo-white.png"
        alt="Treat Hotels & Resorts"
        width="700"
        height="709"
        className={`w-auto select-none transition-all duration-500 ${className}`}
        draggable="false"
      />
    )
  }
  return (
    <span
      role="img"
      aria-label="Treat Hotels & Resorts"
      className={`inline-block aspect-[700/709] select-none bg-ink transition-all duration-500 ${className}`}
      style={{
        WebkitMaskImage: 'url(/images/logo-white.png)',
        maskImage: 'url(/images/logo-white.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

/** Soft floating bokeh lights for dark, celebratory sections. */
export function Bokeh({ count = 14, className = '' }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
    return { x: r(1) * 100, y: r(2) * 100, s: 40 + r(3) * 120, d: 6 + r(4) * 8, o: 0.12 + r(5) * 0.25, delay: r(6) * -8 }
  })
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,214,150,0.9)_0%,rgba(255,190,110,0.35)_45%,transparent_70%)] blur-[2px]"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, opacity: d.o }}
          animate={{ y: [0, -24, 0], x: [0, 12, 0], opacity: [d.o, d.o * 1.6, d.o] }}
          transition={{ duration: d.d, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
        />
      ))}
    </div>
  )
}
