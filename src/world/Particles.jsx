import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp } from './damp.js'

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSwirl;
  varying float vSeed;
  varying float vFade;
  void main() {
    vSeed = aSeed;
    vec3 p = position;
    float a = uTime * (0.05 + aSeed * 0.08) + aSeed * 6.283;
    p.x += sin(a) * 0.35;
    p.y += cos(a * 0.8) * 0.35;
    // swirl around Y when uSwirl > 0 (skills section)
    float ang = uSwirl * (uTime * 0.6 + aSeed * 3.0);
    float c = cos(ang), s = sin(ang);
    p.xz = mat2(c, -s, s, c) * p.xz;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = -mv.z;
    vFade = smoothstep(2.0, 6.0, d) * (1.0 - smoothstep(18.0, 30.0, d));
    gl_PointSize = aSize * uPixelRatio * (60.0 / d);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vSeed;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    float a = smoothstep(0.5, 0.1, r) * vFade * uOpacity;
    vec3 col = mix(uColorA, uColorB, step(0.84, vSeed));
    gl_FragColor = vec4(col, a);
  }
`

/** Soft drifting particles filling the space around the crystal. */
export default function Particles({ count = 2600, look, pointer }) {
  const points = useRef(null)
  const { positions, sizes, seeds } = useMemo(() => {
    let seed = 99
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // shell between r=3 and r=16, biased outward
      const r = 3 + Math.pow(rnd(), 0.6) * 13
      const theta = rnd() * Math.PI * 2
      const phi = Math.acos(2 * rnd() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = 0.5 + rnd() * 1.8
      seeds[i] = rnd()
    }
    return { positions, sizes, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSwirl: { value: 0 },
      uOpacity: { value: 0.55 },
      uColorA: { value: new THREE.Color('#b9a6ff') },
      uColorB: { value: new THREE.Color('#d7ff3f') },
    }),
    [],
  )

  useEffect(() => {
    const p = points.current
    return () => {
      if (p) p.geometry.dispose()
    }
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta || 0.016, 0.1)
    uniforms.uTime.value += Math.min(dt, 0.05)
    uniforms.uPixelRatio.value = state.gl.getPixelRatio()
    uniforms.uSwirl.value = damp(uniforms.uSwirl.value, look.swirl, 2.5, dt)
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, look.particleOpacity, 3, dt)
    const p = points.current
    if (p) {
      p.rotation.y = damp(p.rotation.y, pointer.x * 0.12, 2, dt)
      p.rotation.x = damp(p.rotation.x, -pointer.y * 0.08, 2, dt)
    }
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
