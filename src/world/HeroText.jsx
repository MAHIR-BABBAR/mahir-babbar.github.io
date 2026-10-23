import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { heroCameraZ } from './keyframes.js'
import { damp } from './damp.js'

const FONT = `${import.meta.env.BASE_URL}fonts/Unbounded-Black.ttf`
const TEXT_Z = 0
// "BABBAR" in Unbounded Black measures about 5.2 em wide
const BABBAR_EM = 5.2

/**
 * The name, rendered as SDF text in the scene so the crystal can float in
 * front of it. First line solid, second line a hollow stroke. Sized from the
 * hero camera distance so it spans the viewport without wrapping.
 */
export default function HeroText({ look, mobile }) {
  const group = useRef(null)
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera)

  const fontSize = useMemo(() => {
    const fovRad = (camera.fov * Math.PI) / 180
    const dist = heroCameraZ(mobile) - TEXT_Z
    const visibleW = 2 * dist * Math.tan(fovRad / 2) * (size.width / size.height)
    const fill = mobile ? 0.96 : 0.86
    return Math.min(mobile ? 1.6 : 2.2, (visibleW * fill) / BABBAR_EM)
  }, [camera.fov, mobile, size.width, size.height])
  const lineGap = fontSize * 0.98

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta || 0.016, 0.1)
    g.position.y = damp(g.position.y, look.textY, 4, dt)
    g.position.x = damp(g.position.x, look.textX, 4, dt)
    g.visible = look.textOpacity > 0.01
    g.children.forEach((c) => {
      if (c.material) {
        c.material.transparent = true
        c.material.opacity = damp(c.material.opacity, look.textOpacity, 5, dt)
      }
    })
  })

  return (
    <group ref={group} position={[0, 0, TEXT_Z]}>
      <Text
        font={FONT}
        fontSize={fontSize}
        letterSpacing={-0.045}
        anchorX="center"
        anchorY="middle"
        position={[0, lineGap * 0.5, 0]}
        color="#e4defc"
        material-toneMapped={false}
      >
        MAHIR
      </Text>
      <Text
        font={FONT}
        fontSize={fontSize}
        letterSpacing={-0.045}
        anchorX="center"
        anchorY="middle"
        position={[0, -lineGap * 0.5, 0]}
        color="#d7ff3f"
        material-toneMapped={false}
      >
        BABBAR
      </Text>
    </group>
  )
}
