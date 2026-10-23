import { useEffect, useState } from 'react'
import { profile } from '../data/profile.js'
import Label from './Label.jsx'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return undefined
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async (e) => {
    try {
      await navigator.clipboard.writeText(profile.email)
      e.preventDefault()
      setCopied(true)
    } catch {
      /* fall through to the mailto link */
    }
  }

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <Label num="05" text="Contact" />
      <div className="container contact">
        <div className="contact__inner">
          <h2 id="contact-title" className="display contact__title" data-reveal>
            <span>Let's build</span>
            <span className="outline">something.</span>
          </h2>
          <p className="contact__lead" data-reveal data-reveal-delay="0.1">
            Open to backend and systems internships, open-source collaboration, and hard problems. One email away.
          </p>
          <div data-reveal data-reveal-delay="0.2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <a className="btn btn--lime contact__email" href={`mailto:${profile.email}`} onClick={copy} data-magnetic>
              {profile.email}
            </a>
            <span className="contact__copied" aria-live="polite">
              {copied ? 'copied to clipboard' : 'click to copy'}
            </span>
          </div>
          <div className="contact__links" data-reveal data-reveal-delay="0.3">
            <a className="btn btn--glass" href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn btn--glass" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="btn btn--glass" href={profile.links.leetcode} target="_blank" rel="noreferrer">
              LeetCode
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
