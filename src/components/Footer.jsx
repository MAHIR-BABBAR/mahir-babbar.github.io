import { profile } from '../data/profile.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© 2026 {profile.name} · {profile.location}</span>
        <span>React · Three.js · GSAP · no trackers</span>
      </div>
    </footer>
  )
}
