import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Small glassy octahedra orbiting the crystal on tilted rings. */
export default function Shards({ count = 14, radius = 3.4, look }) {
  const group = useRef(null)
  const items = useMemo(() => {
    let seed = 41
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + rnd() * 0.5,
      speed: 0.08 + rnd() * 0.12,
      r: radius * (0.8 + rnd() * 0.5),
      tilt: (rnd() - 0.5) * 1.2,
      y: (rnd() - 0.5) * 2.2,
      size: 0.14 + rnd() * 0.26,
      spin: rnd() * 2,
    }))
  }, [count, radius])

  const geometry = useMemo(() => new THREE.OctahedronGeometry(1, 0), [])
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#5b2dd6'),
        roughness: 0.1,
        metalness: 0.2,
        clearcoat: 1,
        iridescence: 0.9,
        iridescenceIOR: 1.4,
        flatShading: true,
        envMapIntensity: 2.2,
        emissive: new THREE.Color('#2d0a6b'),
        emissiveIntensity: 0.3,
      }),
    [],
  )
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  const refs = useRef([])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const spread = look.shardSpread
    items.forEach((it, i) => {
      const m = refs.current[i]
      if (!m) return
      it.angle += dt * it.speed * look.speed
      const r = it.r * spread
      const x = Math.cos(it.angle) * r
      const z = Math.sin(it.angle) * r
      m.position.set(x, it.y * spread + Math.sin(t * 0.6 + i) * 0.15 + Math.sin(it.tilt) * z * 0.4, z)
      m.rotation.x = t * it.spin * 0.5
      m.rotation.y = t * it.spin * 0.7
      const s = it.size * look.scale
      m.scale.setScalar(s)
    })
    if (group.current) group.current.rotation.y = t * 0.03
    material.color.setHSL(look.hue + 0.04, 0.7, 0.42)
  })

  return (
    <group ref={group}>
      {items.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          geometry={geometry}
          material={material}
        />
      ))}
    </group>
  )
}
