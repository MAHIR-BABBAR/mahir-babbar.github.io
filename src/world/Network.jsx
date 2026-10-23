import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp } from './damp.js'

/**
 * The hero object: a network of glowing nodes and links, the shape of a
 * distributed system. The same graph can be laid out as a sphere (a graph),
 * a cube shell (containers) or a ring (a retrieval loop); `look.shape` picks
 * between them (0, 1, 2) and `look.jitter` shakes the nodes. Signal pulses
 * travel the links continuously.
 */
const N = 150
const R = 3.1
const NEIGHBOURS = 3

const LINE_VERT = /* glsl */ `
  attribute float aT;
  attribute float aPhase;
  varying float vT;
  varying float vPhase;
  void main() {
    vT = aT;
    vPhase = aPhase;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const LINE_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uPulse;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOpacity;
  varying float vT;
  varying float vPhase;
  void main() {
    float p = fract(uTime * uSpeed + vPhase);
    float d = abs(vT - p);
    float glow = smoothstep(0.16, 0.0, d);
    vec3 col = uBase * 0.55 + uPulse * glow * 2.2;
    gl_FragColor = vec4(col, (0.35 + glow) * uOpacity);
  }
`

function buildGraph() {
  let seed = 17
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  // sphere layout: fibonacci spiral, slight radial jitter
  const sphere = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const rr = Math.sqrt(1 - y * y)
    const th = golden * i
    const rad = R * (0.94 + rnd() * 0.12)
    sphere.push([Math.cos(th) * rr * rad, y * rad, Math.sin(th) * rr * rad])
  }
  // cube shell: project each sphere point onto a cube surface
  const cube = sphere.map(([x, y, z]) => {
    const m = Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) || 1
    const k = (R * 0.78) / m
    return [x * k, y * k, z * k]
  })
  // ring: wrap the sphere's angles onto a torus
  const ring = sphere.map(([x, y, z]) => {
    const theta = Math.atan2(z, x)
    const phi = Math.asin(Math.max(-1, Math.min(1, y / R)))
    const big = R * 0.72
    const small = R * 0.34
    const tube = phi * 2.6
    return [(big + small * Math.cos(tube)) * Math.cos(theta), small * Math.sin(tube), (big + small * Math.cos(tube)) * Math.sin(theta)]
  })
  // links: each node to its nearest neighbours on the sphere, deduplicated
  const edges = []
  const seen = new Set()
  for (let i = 0; i < N; i++) {
    const d = []
    for (let j = 0; j < N; j++) {
      if (i === j) continue
      const dx = sphere[i][0] - sphere[j][0]
      const dy = sphere[i][1] - sphere[j][1]
      const dz = sphere[i][2] - sphere[j][2]
      d.push([dx * dx + dy * dy + dz * dz, j])
    }
    d.sort((a, b) => a[0] - b[0])
    for (let k = 0; k < NEIGHBOURS; k++) {
      const j = d[k][1]
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!seen.has(key)) {
        seen.add(key)
        edges.push([i, j, rnd()])
      }
    }
  }
  const hubs = new Set()
  while (hubs.size < 12) hubs.add(Math.floor(rnd() * N))
  const sizes = Array.from({ length: N }, (_, i) => (hubs.has(i) ? 0.08 : 0.036 + rnd() * 0.028))
  const phases = Array.from({ length: N }, () => rnd() * 6.283)
  return { sphere, cube, ring, edges, hubs, sizes, phases }
}

export default function Network({ look, pointer, mobile }) {
  const group = useRef(null)
  const inst = useRef(null)
  const lineGeo = useRef(null)
  const graph = useMemo(buildGraph, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const state = useRef({ shape: 0, jitter: 0, tiltX: 0, tiltY: 0, pos: new Float32Array(N * 3) })

  const nodeGeo = useMemo(() => new THREE.SphereGeometry(1, mobile ? 8 : 12, mobile ? 6 : 10), [mobile])
  const nodeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), [])
  const linePositions = useMemo(() => new Float32Array(graph.edges.length * 2 * 3), [graph])
  const lineT = useMemo(() => {
    const a = new Float32Array(graph.edges.length * 2)
    for (let e = 0; e < graph.edges.length; e++) {
      a[e * 2] = 0
      a[e * 2 + 1] = 1
    }
    return a
  }, [graph])
  const linePhase = useMemo(() => {
    const a = new Float32Array(graph.edges.length * 2)
    for (let e = 0; e < graph.edges.length; e++) {
      a[e * 2] = graph.edges[e][2]
      a[e * 2 + 1] = graph.edges[e][2]
    }
    return a
  }, [graph])
  const lineUniforms = useMemo(
    () => ({
      uBase: { value: new THREE.Color('#7c5cff') },
      uPulse: { value: new THREE.Color('#d7ff3f') },
      uTime: { value: 0 },
      uSpeed: { value: 0.35 },
      uOpacity: { value: 1 },
    }),
    [],
  )

  useEffect(
    () => () => {
      nodeGeo.dispose()
      nodeMat.dispose()
    },
    [nodeGeo, nodeMat],
  )

  // initial instance colours
  useEffect(() => {
    const m = inst.current
    if (!m) return
    for (let i = 0; i < N; i++) {
      if (graph.hubs.has(i)) tmpColor.set('#d7ff3f').multiplyScalar(1.35)
      else tmpColor.set('#cfc4ff').multiplyScalar(0.85)
      m.setColorAt(i, tmpColor)
    }
    m.instanceColor.needsUpdate = true
  }, [graph, tmpColor])

  useFrame((frame, delta) => {
    const dt = Math.min(delta || 0.016, 0.1)
    const t = frame.clock.elapsedTime
    const s = state.current
    s.shape = damp(s.shape, look.shape, 2.2, dt)
    s.jitter = damp(s.jitter, look.jitter, 3, dt)
    s.tiltX = damp(s.tiltX, -pointer.y * 0.3, 2.5, dt)
    s.tiltY = damp(s.tiltY, pointer.x * 0.3, 2.5, dt)

    // morph between layouts: 0 sphere, 1 cube, 2 ring
    const a = s.shape <= 1 ? graph.sphere : graph.cube
    const b = s.shape <= 1 ? graph.cube : graph.ring
    const f = s.shape <= 1 ? s.shape : s.shape - 1
    const jit = s.jitter
    const m = inst.current
    const breathe = 1 + Math.sin(t * 0.8) * 0.012
    for (let i = 0; i < N; i++) {
      const ph = graph.phases[i]
      const jx = jit * Math.sin(t * 2.3 + ph) * 0.45
      const jy = jit * Math.cos(t * 1.9 + ph * 1.3) * 0.45
      const jz = jit * Math.sin(t * 2.7 + ph * 0.7) * 0.45
      const x = (a[i][0] + (b[i][0] - a[i][0]) * f) * breathe + jx
      const y = (a[i][1] + (b[i][1] - a[i][1]) * f) * breathe + jy
      const z = (a[i][2] + (b[i][2] - a[i][2]) * f) * breathe + jz
      s.pos[i * 3] = x
      s.pos[i * 3 + 1] = y
      s.pos[i * 3 + 2] = z
      if (m) {
        const pulse = graph.hubs.has(i) ? 1 + Math.sin(t * 2 + ph) * 0.25 : 1
        dummy.position.set(x, y, z)
        dummy.scale.setScalar(graph.sizes[i] * pulse)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
      }
    }
    if (m) m.instanceMatrix.needsUpdate = true

    const lg = lineGeo.current
    if (lg) {
      for (let e = 0; e < graph.edges.length; e++) {
        const [i, j] = graph.edges[e]
        linePositions[e * 6] = s.pos[i * 3]
        linePositions[e * 6 + 1] = s.pos[i * 3 + 1]
        linePositions[e * 6 + 2] = s.pos[i * 3 + 2]
        linePositions[e * 6 + 3] = s.pos[j * 3]
        linePositions[e * 6 + 4] = s.pos[j * 3 + 1]
        linePositions[e * 6 + 5] = s.pos[j * 3 + 2]
      }
      lg.attributes.position.needsUpdate = true
    }
    lineUniforms.uTime.value = t
    lineUniforms.uSpeed.value = 0.25 + look.speed * 0.4
    lineUniforms.uBase.value.setHSL(look.hue, 0.8, 0.6)
    tmpColor.setHSL(look.hue, 0.8, 0.62)

    const g = group.current
    if (g) {
      g.rotation.y = t * 0.08 + s.tiltY
      g.rotation.x = s.tiltX + Math.sin(t * 0.25) * 0.06
      const sc = damp(g.scale.x, look.scale, 3, dt)
      g.scale.setScalar(sc)
    }
  })

  return (
    <group ref={group}>
      <instancedMesh ref={inst} args={[nodeGeo, nodeMat, N]} frustumCulled={false} />
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeo}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-aT" args={[lineT, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[linePhase, 1]} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={lineUniforms}
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}
