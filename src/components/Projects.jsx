import { projects } from '../data/profile.js'
import CountUp from './CountUp.jsx'
import Label from './Label.jsx'
import { useInView } from '../lib/hooks.js'

function Arrow() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  )
}

function Project({ p, right }) {
  const [ref, inView] = useInView()
  return (
    <div className={`stage${right ? ' stage--right' : ''}`} id={p.id}>
      <div className="container" style={{ width: '100%', display: 'flex' }}>
        <article className="stage__inner pj" style={right ? { marginLeft: 'auto' } : undefined} ref={ref} aria-labelledby={`${p.id}-name`}>
          <span className="pj__index" aria-hidden="true" data-reveal>
            {p.index}
          </span>
          <h3 id={`${p.id}-name`} className="display pj__name" data-reveal data-reveal-delay="0.05">
            {p.name}
          </h3>
          <p className="pj__kicker" data-reveal data-reveal-delay="0.1">
            {p.kicker}
          </p>
          <p className="pj__short" data-reveal data-reveal-delay="0.15">
            {p.short}
          </p>
          <div className="pj__metrics" data-reveal data-reveal-delay="0.2">
            {p.metrics.map((m) => (
              <div className="metric" key={m.label}>
                <span className="metric__value">
                  <CountUp value={m.value} decimals={m.decimals || 0} prefix={m.prefix || ''} suffix={m.suffix || ''} start={inView} />
                </span>
                <span className="label">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="pj__foot" data-reveal data-reveal-delay="0.25">
            <div className="chips">
              {p.stack.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
            {p.link && (
              <a className="btn btn--glass" href={p.link} target="_blank" rel="noreferrer" data-magnetic>
                View source <Arrow />
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="section" aria-label="Projects">
      <Label num="03" text="Projects" />
      {projects.map((p, i) => (
        <Project p={p} right={i % 2 === 1} key={p.id} />
      ))}
    </section>
  )
}
