import { achievements, skillRows } from '../data/profile.js'
import Label from './Label.jsx'

function Marquee({ items, reverse, duration }) {
  const track = [...items, ...items]
  return (
    <div className={`marquee${reverse ? ' marquee--reverse' : ''}`} style={{ '--dur': `${duration}s` }}>
      <div className="marquee__track">
        {track.map((s, i) => (
          <span key={`${s}-${i}`} className="marquee__item" aria-hidden={i >= items.length ? 'true' : undefined}>
            {s}
            <i className="marquee__dot" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <Label num="04" text="Skills" />
      <div className="container skills__head">
        <h2 id="skills-title" className="display h-big" data-reveal>
          Tools I reach for
        </h2>
        <p className="lead" data-reveal data-reveal-delay="0.1">
          Languages, runtimes, data stores, and the testing discipline that makes them safe to ship.
        </p>
      </div>
      <div className="marquees" data-reveal data-reveal-delay="0.15">
        <Marquee items={skillRows[0]} duration={46} />
        <Marquee items={skillRows[1]} reverse duration={52} />
        <Marquee items={skillRows[2]} duration={58} />
      </div>
      <div className="container">
        <div className="ach" aria-label="Achievements">
          {achievements.map((a, i) => {
            const Tag = a.link ? 'a' : 'div'
            const extra = a.link ? { href: a.link, target: '_blank', rel: 'noreferrer' } : {}
            return (
              <Tag className="glass ach__tile" key={a.big} data-reveal data-reveal-delay={`${i * 0.08}`} {...extra}>
                <span className="ach__big">{a.big}</span>
                <span className="ach__title">{a.title}</span>
                <span className="ach__sub">{a.sub}</span>
              </Tag>
            )
          })}
        </div>
      </div>
    </section>
  )
}
