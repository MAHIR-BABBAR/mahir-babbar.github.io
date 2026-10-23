import { profile, stats } from '../data/profile.js'
import CountUp from './CountUp.jsx'
import Label from './Label.jsx'
import { useInView } from '../lib/hooks.js'

export default function About() {
  const [ref, inView] = useInView()
  const [head, ...rest] = profile.statement.split(' survive ')
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <Label num="01" text="About" />
      <div className="container block">
        <div className="about__grid" ref={ref}>
          <div className="about__copy">
            <h2 id="about-title" className="display h-huge about__statement" data-reveal>
              {head} <b>survive</b> {rest.join(' ')}
            </h2>
            <div className="about__body">
              {profile.about.map((p, i) => (
                <p className="lead" key={p.slice(0, 20)} data-reveal data-reveal-delay={`${0.1 + i * 0.08}`}>
                  {p}
                </p>
              ))}
            </div>
            <span className="label" data-reveal data-reveal-delay="0.3">
              {profile.school}
            </span>
          </div>
          <div className="stats">
            {stats.map((s, i) => (
              <div className="glass stat" key={s.label} data-reveal data-reveal-delay={`${0.15 + i * 0.07}`}>
                <span className="stat__value">
                  <CountUp value={s.value} decimals={s.decimals || 0} prefix={s.prefix || ''} suffix={s.suffix || ''} start={inView} />
                </span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
