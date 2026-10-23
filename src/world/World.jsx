import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import Network from './Network.jsx'
import Shards from './Shards.jsx'
import Particles from './Particles.jsx'
import HeroText from './HeroText.jsx'
import Aurora from './Aurora.jsx'
import Halo from './Halo.jsx'
import { sampleKeyframes, defaultKeyframes } from './keyframes.js'
import { damp, dampVec } from './damp.js'

/** Camera + scene state driven by scroll progress and the pointer. */
function Rig({ progressRef, framesRef, pointer, look, mobile }) {
  const camera = useThree((s) => s.camera)
  const target = useMemo(() => new THREE.Vector3(), [])
  const camPos = useMemo(() => new THREE.Vector3(0, 0, 9), [])
  const lookAt = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const fallback = useMemo(() => defaultKeyframes(mobile), [mobile])
  const root = useMemo(() => document.documentElement, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta || 0.016, 0.1)
    const p = progressRef.current
    const frames = (framesRef && framesRef.current) || fallback
    const k = sampleKeyframes(frames, p)
    root.style.setProperty('--dim', k.dim.toFixed(3))
    // scene look values (lerped by consumers)
    look.shape = k.shape
    look.jitter = k.jitter
    look.speed = k.speed
    look.hue = k.hue
    look.scale = k.scale
    look.shardSpread = k.shardSpread
    look.swirl = k.swirl
    look.particleOpacity = k.particles
    look.textOpacity = k.text
    look.textX = k.textX
    look.textY = k.textY
    look.crystalX = k.crystalX
    look.crystalY = k.crystalY

    camPos.set(k.cam[0] + pointer.x * 0.35, k.cam[1] + pointer.y * 0.25, k.cam[2])
    lookAt.set(k.look[0], k.look[1], k.look[2])
    dampVec(camera.position, camPos, 4, dt)
    dampVec(target, lookAt, 4, dt)
    camera.lookAt(target)
  })
  return null
}

function Scene({ progressRef, framesRef, pointer, look, mobile, reduced }) {
  const crystalGroup = useRef(null)
  useFrame((_, delta) => {
    const g = crystalGroup.current
    if (!g) return
    const dt = Math.min(delta || 0.016, 0.1)
    g.position.x = damp(g.position.x, look.crystalX, 3.5, dt)
    g.position.y = damp(g.position.y, look.crystalY, 3.5, dt)
  })

  return (
    <>
      <color attach="background" args={['#06050f']} />
      <fog attach="fog" args={['#06050f', 16, 34]} />
      <Rig progressRef={progressRef} framesRef={framesRef} pointer={pointer} look={look} mobile={mobile} />
      <Aurora look={look} />

      <Suspense fallback={null}>
        <HeroText look={look} mobile={mobile} />
      </Suspense>

      <group ref={crystalGroup} position={[0, 0, -3]}>
        <Halo look={look} />
        <Network look={look} pointer={pointer} mobile={mobile} />
        <Shards look={look} count={mobile ? 6 : 9} radius={4.6} />
      </group>

      <Particles count={mobile ? 1200 : 2600} look={look} pointer={pointer} />

      <ambientLight intensity={0.25} color="#5b3fd1" />
      <pointLight position={[6, 4, 6]} intensity={40} color="#d7ff3f" />
      <pointLight position={[-6, -3, 4]} intensity={30} color="#8b5cf6" />

      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={5} color="#8b5cf6" position={[-5, 3, -4]} scale={[7, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={4} color="#d7ff3f" position={[6, -2, 3]} scale={[4, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="circle" intensity={7} color="#ffffff" position={[0, 7, 5]} scale={[3, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2.5} color="#c4b5fd" position={[0, 0, -8]} scale={[10, 10, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} color="#ff5fa2" position={[0, -6, 2]} scale={[8, 2, 1]} target={[0, 0, 0]} />
      </Environment>

      {!reduced && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.92} luminanceSmoothing={0.12} radius={0.65} />
          <ChromaticAberration offset={[0.0011, 0.0007]} radialModulation modulationOffset={0.35} />
          <Vignette eskil={false} offset={0.18} darkness={0.85} />
          <Noise opacity={0.045} />
        </EffectComposer>
      )}
    </>
  )
}

/**
 * The full-screen WebGL world behind the page. Opaque canvas; everything
 * visual lives here and the DOM overlays it.
 */
export default function World({ progressRef, framesRef, mobile, reduced, active = true }) {
  const pointer = useMemo(() => ({ x: 0, y: 0, tx: 0, ty: 0 }), [])
  const look = useMemo(
    () => ({
      shape: 0,
      jitter: 0,
      speed: 0.4,
      hue: 0.72,
      scale: 1,
      shardSpread: 1,
      swirl: 0,
      particleOpacity: 0.75,
      textOpacity: 1,
      textX: 0,
      textY: 0,
      crystalX: 0,
      crystalY: 0,
    }),
    [],
  )

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const onMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    let raf = 0
    const ease = () => {
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      raf = requestAnimationFrame(ease)
    }
    raf = requestAnimationFrame(ease)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [pointer])

  return (
    <div className="world" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.5 : 2]}
        camera={{ fov: 35, near: 0.1, far: 60, position: [0, 0, 9] }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true }}
        frameloop={active ? 'always' : 'demand'}
      >
        <Scene progressRef={progressRef} framesRef={framesRef} pointer={pointer} look={look} mobile={mobile} reduced={reduced} />
      </Canvas>
    </div>
  )
}
