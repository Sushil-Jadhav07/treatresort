import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import BackToTop from './components/BackToTop'
import Navbar from './components/Navbar'
import Hero from './components/sections/Hero'
import Intro from './components/sections/Intro'
import Properties from './components/sections/Properties'
import NewUpcoming from './components/sections/NewUpcoming'
import Weddings from './components/sections/Weddings'
import WeddingsCollage from './components/sections/WeddingsCollage'
import Corporate from './components/sections/Corporate'
import CorporateGallery from './components/sections/CorporateGallery'
import Offers from './components/sections/Offers'
import Culinary from './components/sections/Culinary'
import Why from './components/sections/Why'
import Moments from './components/sections/Moments'
import Testimonials from './components/sections/Testimonials'
import Enquire from './components/sections/Enquire'
import Footer from './components/sections/Footer'

export default function App() {
  const [ready, setReady] = useState(false)

  // Smooth scrolling (Lenis)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    window.__lenis = lenis
    // locked while the intro plays, unless it is skipped (repeat visit in this session / reduced motion)
    if (document.documentElement.classList.contains('skip-intro')) setReady(true)
    else lenis.stop()
    let raf
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])

  const done = useCallback(() => {
    try {
      sessionStorage.setItem('treat-intro-seen', '1')
    } catch {
      /* storage blocked: the intro just plays again next time */
    }
    setReady(true)
    window.__lenis?.start()
  }, [])

  return (
    <>
      <AnimatePresence>{!ready && <Preloader key="preloader" onDone={done} />}</AnimatePresence>
      <Navbar ready={ready} />
      <main>
        <Hero ready={ready}>
          <Intro />
        </Hero>
        <Properties />
        <NewUpcoming />
        {/* <Weddings /> */}
        <WeddingsCollage />
        {/* <Corporate /> */}
        <CorporateGallery />
        <Offers />
        <Culinary />
        <Why />
        <Moments />
        <Testimonials />
        <Enquire />
      </main>
      <Footer />
      <BackToTop ready={ready} />
    </>
  )
}
