import { experience } from '../data/profile.js'
import Label from './Label.jsx'
import TiltCard from './TiltCard.jsx'

export default function Experience() {
  return (
    <section id="experience" className="section" aria-label="Experience">
      <Label num="02" text="Experience" />
      {experience.map((e, i) => (
        <div className={`stage${i % 2 === 0 ? ' stage--right' : ''}`} id={e.id} key={e.id}>
          <div className="container" style={{ width: '100%', display: 'flex' }}>
            <div className={`stage__inner${i % 2 === 0 ? ' stage__inner--right' : ''}`} style={i % 2 === 0 ? { marginLeft: 'auto' } : undefined} data-reveal>
              <TiltCard className="glass xp" max={4}>
                <div className="xp__top">
                  <span className="xp__dates">{e.dates}</span>
                  {e.badge && <span className="badge">{e.badge}</span>}
                </div>
                <h3 className="display xp__company">{e.company}</h3>
                <div>
                  <div className="xp__role">{e.role}</div>
                  <div className="xp__where">{e.where}</div>
                </div>
                <p className="xp__short">{e.short}</p>
                {e.stack.length > 0 && (
                  <div className="chips">
                    {e.stack.map((s) => (
                      <span className="chip" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </TiltCard>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
