import { useEffect, useState } from 'react'
import { useReducedMotion } from '../lib/hooks.js'

/** Counts from 0 to `value` once `start` is true. */
export default function CountUp({ value, decimals = 0, prefix = '', suffix = '', start = true, duration = 1200 }) {
  const reduced = useReducedMotion()
  const [v, setV] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced) {
      setV(value)
      return undefined
    }
    if (!start) return undefined
    let raf = 0
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      setV(value * e)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, value, duration, reduced])

  return (
    <>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </>
  )
}
