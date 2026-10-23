import { useEffect, useRef } from 'react'

/**
 * Custom cursor: a dot that tracks the pointer and a ring that lags behind it.
 * The ring grows over links and buttons. Elements with [data-magnetic] lean
 * toward the pointer when it comes within 70px. Only on fine pointers.
 */
export default function Cursor() {
  const wrap = useRef(null)
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return undefined

    const root = document.documentElement
    root.classList.add('has-cursor')
    const w = wrap.current
    const d = dot.current
    const r = ring.current

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    let magnets = []
    let magnetsStale = true

    const collect = () => {
      magnets = Array.from(document.querySelectorAll('[data-magnetic]'))
      magnetsStale = false
    }
    const markStale = () => {
      magnetsStale = true
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`
      w.classList.remove('cursor--hidden')
      const t = e.target && e.target.closest ? e.target.closest('a, button, [data-cursor="link"]') : null
      w.classList.toggle('cursor--link', !!t)

      if (magnetsStale) collect()
      for (const el of magnets) {
        const b = el.getBoundingClientRect()
        const cx = b.left + b.width / 2
        const cy = b.top + b.height / 2
        const dx = x - cx
        const dy = y - cy
        const reach = 70
        const inside = Math.abs(dx) < b.width / 2 + reach && Math.abs(dy) < b.height / 2 + reach
        el.style.transform = inside ? `translate3d(${dx * 0.22}px, ${dy * 0.22}px, 0)` : ''
      }
    }
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const hide = () => w.classList.add('cursor--hidden')
    const show = () => w.classList.remove('cursor--hidden')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', hide)
    document.addEventListener('mouseenter', show)
    window.addEventListener('resize', markStale)
    window.addEventListener('scroll', markStale, { passive: true })
    const mo = new MutationObserver(markStale)
    mo.observe(document.body, { childList: true, subtree: true })
    raf = requestAnimationFrame(loop)

    return () => {
      root.classList.remove('has-cursor')
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', hide)
      document.removeEventListener('mouseenter', show)
      window.removeEventListener('resize', markStale)
      window.removeEventListener('scroll', markStale)
      mo.disconnect()
    }
  }, [])

  return (
    <div className="cursor cursor--hidden" ref={wrap} aria-hidden="true">
      <div className="cursor__dot" ref={dot} />
      <div className="cursor__ring" ref={ring} />
    </div>
  )
}
