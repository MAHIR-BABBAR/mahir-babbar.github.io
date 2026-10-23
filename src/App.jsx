import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery, useReducedMotion } from './lib/hooks.js'
import { useSmoothScroll } from './lib/scroll.js'
import { resolveKeyframes } from './world/keyframes.js'
import { profile } from './data/profile.js'
import Intro from './components/Intro.jsx'
import Cursor from './components/Cursor.jsx'
import Overlays from './components/Overlays.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Skills from './components/Skills.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

const World = lazy(() => import('./world/World.jsx'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const ok = !!gl
    const lose = gl && gl.getExtension('WEBGL_lose_context')
    if (lose) lose.loseContext()
    return ok
  } catch {
    return false
  }
}
const WEBGL = typeof window !== 'undefined' ? hasWebGL() : false

function introSeen() {
  try {
    return window.sessionStorage.getItem('mb-intro') === '1'
  } catch {
    return false
  }
}

/** If the WebGL world throws (shader failure, lost context), show the poster
 *  and keep the rest of the page alive. */
class WorldBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    if (typeof console !== 'undefined') console.warn('3D world disabled:', err && err.message)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Static stand-in for the world: reduced motion or no WebGL. */
function Poster() {
  return (
    <div className="poster" aria-hidden="true">
      <div className="poster__name">
        {profile.first}
        <b>{profile.last}</b>
      </div>
    </div>
  )
}

export default function App() {
  const reduced = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 720px)')
  const [ready, setReady] = useState(() => reduced || introSeen())
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : !document.hidden))
  const progressRef = useRef(0)
  const framesRef = useRef(null)

  const onIntroDone = useCallback(() => {
    try {
      window.sessionStorage.setItem('mb-intro', '1')
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useSmoothScroll(ready)

  // scroll progress for the world, plus keyframe anchors measured from the DOM
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const measure = () => {
      framesRef.current = resolveKeyframes(mobile)
      update()
    }
    measure()
    const t1 = setTimeout(measure, 800)
    const t2 = setTimeout(measure, 2500)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mobile])

  // pause the render loop while the tab is hidden
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = ready ? '' : 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [ready])

  const showWorld = WEBGL && !reduced

  return (
    <>
      {!ready && <Intro onDone={onIntroDone} />}
      {showWorld ? (
        <WorldBoundary fallback={<Poster />}>
          <Suspense fallback={<Poster />}>
            <World progressRef={progressRef} framesRef={framesRef} mobile={mobile} reduced={reduced} active={ready && visible} />
          </Suspense>
        </WorldBoundary>
      ) : (
        <Poster />
      )}
      <Overlays />
      <Cursor />
      <div className="site" id="top">
        <Nav />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
