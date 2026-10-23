import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap.js'

let lenisInstance = null

/** The live Lenis instance, or null when smooth scroll is off (reduced motion). */
export function getLenis() {
  return lenisInstance
}

/** Scroll to a selector or element, through Lenis when available. */
export function scrollToTarget(target, offset = -56) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return false
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset, duration: 1.1 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
  return true
}

/**
 * Smooth scrolling (Lenis) wired into GSAP ScrollTrigger, plus the
 * [data-reveal] entrance animations. Starts once `enabled` turns true
 * (after the boot screen) so nothing animates behind the preloader.
 */
export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let tick = null
    if (!reduced) {
      lenisInstance = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        autoRaf: false,
        anchors: { offset: -56, duration: 1.1 },
      })
      lenisInstance.on('scroll', ScrollTrigger.update)
      tick = (time) => lenisInstance && lenisInstance.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || '0')
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          },
        )
      })
    })

    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)
    const t = setTimeout(refresh, 600)

    return () => {
      clearTimeout(t)
      window.removeEventListener('load', refresh)
      ctx.revert()
      if (tick) gsap.ticker.remove(tick)
      if (lenisInstance) {
        lenisInstance.destroy()
        lenisInstance = null
      }
    }
  }, [enabled])
}
