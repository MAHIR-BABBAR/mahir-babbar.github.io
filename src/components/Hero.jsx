import { profile } from '../data/profile.js'

function Arrow() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  )
}

/** The name itself is rendered in the 3D world; this is the overlay copy. */
export default function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Intro">
      <h1 className="sr-only">
        {profile.name} — {profile.role}
      </h1>
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="label hero__eyebrow" data-reveal>
            <i aria-hidden="true" />
            {profile.eyebrow}
          </span>
          <p className="hero__tagline" data-reveal data-reveal-delay="0.1">
            {profile.tagline}
          </p>
          <div className="hero__ctas" data-reveal data-reveal-delay="0.2">
            <a href="#projects" className="btn btn--lime" data-magnetic>
              See the work <Arrow />
            </a>
            <a href={profile.links.github} className="btn btn--glass" target="_blank" rel="noreferrer" data-magnetic>
              GitHub
            </a>
          </div>
        </div>
        <div className="hero__side" data-reveal data-reveal-delay="0.3">
          <span className="hero__avail">{profile.availability}</span>
          <span className="scrollcue" aria-hidden="true">
            scroll <i />
          </span>
        </div>
      </div>
    </section>
  )
}
