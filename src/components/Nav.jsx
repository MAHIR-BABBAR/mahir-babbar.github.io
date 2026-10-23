import { useEffect, useState } from 'react'
import { profile } from '../data/profile.js'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean)
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const link = (l) => (
    <a
      key={l.id}
      href={`#${l.id}`}
      className={`nav__link${active === l.id ? ' is-active' : ''}`}
      aria-current={active === l.id ? 'true' : undefined}
      onClick={() => setOpen(false)}
    >
      {l.label}
    </a>
  )

  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#top" className="nav__logo" aria-label="Back to top">
          M<b>B</b>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(link)}
        </nav>
        <div className="nav__right">
          <a className="btn btn--lime nav__cta" href={`mailto:${profile.email}`} data-magnetic>
            Let's talk
          </a>
          <button
            type="button"
            className="nav__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((v) => !v)}
          >
            <svg aria-hidden="true" width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              {open ? (
                <>
                  <line x1="1" y1="1" x2="17" y2="13" />
                  <line x1="17" y1="1" x2="1" y2="13" />
                </>
              ) : (
                <>
                  <line x1="0" y1="1" x2="18" y2="1" />
                  <line x1="0" y1="7" x2="18" y2="7" />
                  <line x1="0" y1="13" x2="12" y2="13" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      <nav id="nav-sheet" className={`nav__sheet${open ? ' is-open' : ''}`} aria-label="Primary, mobile">
        {LINKS.map(link)}
        <a className="nav__link" href={profile.links.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="nav__link" href={profile.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </nav>
    </header>
  )
}
