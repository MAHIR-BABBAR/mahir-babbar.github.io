import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SIMPLEX_3D } from './noise.js'

const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uHue;
  varying vec3 vDir;
  ${SIMPLEX_3D}
  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }
  void main() {
    vec3 d = vDir;
    float n = snoise(vec3(d.x * 1.6, d.y * 2.2, uTime * 0.04));
    float n2 = snoise(vec3(d.z * 2.0 + 3.0, d.y * 1.4, uTime * 0.03));
    // values are linear-light: keep them tiny or the sky washes out
    vec3 base = vec3(0.0022, 0.0016, 0.0085);
    vec3 violet = hsl2rgb(vec3(uHue, 0.7, 0.03));
    vec3 teal = hsl2rgb(vec3(uHue + 0.18, 0.6, 0.02));
    float band = smoothstep(-0.5, 0.9, d.y + n * 0.45);
    vec3 col = mix(base, violet, band * 0.6 + n * 0.1);
    col = mix(col, teal, smoothstep(0.3, 0.95, n2) * 0.4);
    float glow = exp(-length(d.xy - vec2(0.28, -0.08)) * 2.4) * 0.05;
    col += hsl2rgb(vec3(uHue, 0.75, 0.25)) * glow;
    gl_FragColor = vec4(col, 1.0);
  }
`

/** A slowly shifting aurora on the inside of a huge sphere: the sky of the scene. */
export default function Aurora({ look }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHue: { value: 0.72 } }), [])
  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05)
    uniforms.uHue.value += (look.hue - uniforms.uHue.value) * 0.03
  })
  return (
    <mesh scale={[40, 40, 40]} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}
