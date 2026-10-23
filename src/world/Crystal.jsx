import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SIMPLEX_3D } from './noise.js'
import { damp } from './damp.js'

/**
 * The hero object: a faceted, iridescent crystal whose surface is displaced
 * by animated simplex noise. Displacement is injected into three's physical
 * material so it keeps clearcoat, iridescence and env reflections; flat
 * shading derives facet normals from screen-space derivatives, so no normal
 * recomputation is needed after displacement.
 *
 * `look` is a mutable object other code drives: { amp, freq, speed, hue, scale }.
 */
export default function Crystal({ mobile, look, pointer }) {
  const mesh = useRef(null)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.6, mobile ? 6 : 9), [mobile])
  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.32 },
      uFreq: { value: 1.1 },
    }),
    [],
  )

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1b0b4d'),
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      iridescence: 0.85,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [160, 640],
      flatShading: true,
      envMapIntensity: 2.7,
      emissive: new THREE.Color('#2a0a6e'),
      emissiveIntensity: 0.18,
    })
    m.customProgramCacheKey = () => 'mb-crystal'
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uAmp = uniforms.uAmp
      shader.uniforms.uFreq = uniforms.uFreq
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          uniform float uAmp;
          uniform float uFreq;
          ${SIMPLEX_3D}`,
        )
        .replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(position);
          float n1 = snoise(position * uFreq + vec3(0.0, uTime * 0.22, uTime * 0.11));
          float n2 = snoise(position * uFreq * 2.6 - vec3(uTime * 0.35, 0.0, 0.0)) * 0.18;
          transformed += normal * (n1 + n2) * uAmp;`,
        )
    }
    return m
  }, [uniforms])
  useEffect(() => () => material.dispose(), [material])

  const tilt = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    uniforms.uTime.value += dt * look.speed
    uniforms.uAmp.value = damp(uniforms.uAmp.value, look.amp, 3, dt)
    uniforms.uFreq.value = damp(uniforms.uFreq.value, look.freq, 3, dt)
    const m = mesh.current
    if (!m) return
    // slow self-rotation plus a lean toward the pointer
    m.rotation.y += dt * 0.12
    tilt.current.x = damp(tilt.current.x, -pointer.y * 0.35, 2.5, dt)
    tilt.current.y = damp(tilt.current.y, pointer.x * 0.35, 2.5, dt)
    m.rotation.x = tilt.current.x + Math.sin(state.clock.elapsedTime * 0.3) * 0.08
    m.rotation.z = tilt.current.y * 0.5
    const s = damp(m.scale.x, look.scale, 3, dt)
    m.scale.setScalar(s)
    material.color.setHSL(look.hue, 0.75, 0.17)
    material.emissive.setHSL(look.hue, 0.8, 0.24)
  })

  return <mesh ref={mesh} geometry={geometry} material={material} />
}
