import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = exp(-d * d * 3.2) * uStrength;
    gl_FragColor = vec4(uColor * a, a);
  }
`

/** Additive glow sprite behind the crystal so it reads as luminous. */
export default function Halo({ look }) {
  const mesh = useRef(null)
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#7c3aed') }, uStrength: { value: 0.55 } }),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uColor.value.setHSL(look.hue, 0.8, 0.5)
    uniforms.uStrength.value = (0.32 + Math.sin(t * 1.1) * 0.06) * look.scale
    if (mesh.current) {
      mesh.current.scale.setScalar(9 * look.scale)
      mesh.current.quaternion.copy(state.camera.quaternion)
    }
  })
  return (
    <mesh ref={mesh} position={[0, 0, -0.8]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  )
}
