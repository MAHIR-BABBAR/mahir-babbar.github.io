import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useMediaQuery, useReducedMotion } from '../lib/hooks.js'

/**
 * A card that tilts toward the pointer (max `max` degrees) with a glare that
 * follows it. Falls back to a plain card on touch devices and reduced motion.
 */
export default function TiltCard({ children, className = '', max = 6, as = 'article', ...rest }) {
  const ref = useRef(null)
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 120, damping: 14 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 120, damping: 14 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    px.set(x)
    py.set(y)
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  const Tag = motion[as] || motion.article

  return (
    <Tag
      ref={ref}
      className={className}
      style={enabled ? { rotateX, rotateY, transformPerspective: 1100 } : undefined}
      onMouseMove={enabled ? onMove : undefined}
      onMouseLeave={enabled ? onLeave : undefined}
      {...rest}
    >
      {children}
      <div className="pcard__glare" aria-hidden="true" />
    </Tag>
  )
}
