import { useEffect, useState } from 'react'

/** Under a second: monogram, a lime line fills, the curtain lifts. */
export default function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), 950)
    const b = setTimeout(onDone, 1650)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onDone])
  return (
    <div className={`intro${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Loading">
      <div className="intro__mark" aria-hidden="true">
        M<b>B</b>
      </div>
      <div className="intro__meta" aria-hidden="true">
        portfolio · 2026
      </div>
      <div className="intro__bar" aria-hidden="true">
        <i />
      </div>
    </div>
  )
}
