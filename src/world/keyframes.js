/**
 * Scroll choreography. Each keyframe is anchored to a DOM section by id and
 * resolved to a page-progress value (0..1) from the section's real position,
 * so the scene reaches a state exactly when that section is centred on
 * screen. Between keyframes every numeric value is smoothstep-interpolated.
 *
 * shape: 0 = sphere (a graph), 1 = cube shell (containers), 2 = ring (a loop).
 * The network sits 3 units behind the name plane.
 */
const KEYS = [
  // hero: network centred behind the name
  { id: 'hero', cam: [0, 0, 9], look: [0, 0, 0], crystalX: 0, crystalY: 0.3, scale: 0.92, shape: 0, jitter: 0, speed: 0.4, hue: 0.72, shardSpread: 1, swirl: 0, particles: 0.5, text: 1, textX: 0, textY: 0.45, dim: 0 },
  // about: network drifts right and shrinks; name sinks away
  { id: 'about', cam: [1.2, 0.5, 9.5], look: [0.6, 0, 0], crystalX: 4.4, crystalY: 0.4, scale: 0.72, shape: 0, jitter: 0, speed: 0.3, hue: 0.74, shardSpread: 1.3, swirl: 0, particles: 0.45, text: 0, textX: 0, textY: -3.5, dim: 0.35 },
  // experience: a beacon on the far side from each card
  { id: 'exp-0', cam: [-1.8, 1.0, 8.5], look: [-1.2, 0.2, 0], crystalX: -5.0, crystalY: 0.6, scale: 0.6, shape: 0, jitter: 0, speed: 0.25, hue: 0.78, shardSpread: 1.8, swirl: 0, particles: 0.55, text: 0, textX: 0, textY: -3.5, dim: 0.45 },
  { id: 'exp-1', cam: [1.6, 0.6, 8.5], look: [1.0, 0.1, 0], crystalX: 4.8, crystalY: -0.3, scale: 0.58, shape: 0, jitter: 0, speed: 0.3, hue: 0.8, shardSpread: 1.6, swirl: 0, particles: 0.55, text: 0, textX: 0, textY: -3.5, dim: 0.45 },
  { id: 'exp-2', cam: [-1.4, -0.4, 8.5], look: [-1.0, 0, 0], crystalX: -4.8, crystalY: 0.4, scale: 0.6, shape: 0, jitter: 0, speed: 0.3, hue: 0.76, shardSpread: 1.7, swirl: 0, particles: 0.55, text: 0, textX: 0, textY: -3.5, dim: 0.45 },
  // projects: the graph becomes containers, then a retrieval loop, then noise
  { id: 'proj-0', cam: [0.6, 0, 8.5], look: [0.6, 0, 0], crystalX: 4.6, crystalY: 0.1, scale: 0.95, shape: 1, jitter: 0, speed: 0.5, hue: 0.66, shardSpread: 1.1, swirl: 0, particles: 0.4, text: 0, textX: 0, textY: -3.5, dim: 0.4 },
  { id: 'proj-1', cam: [-0.6, -0.2, 8.5], look: [-0.6, 0, 0], crystalX: -4.6, crystalY: 0.2, scale: 1.0, shape: 2, jitter: 0, speed: 0.8, hue: 0.56, shardSpread: 1.4, swirl: 0, particles: 0.4, text: 0, textX: 0, textY: -3.5, dim: 0.4 },
  { id: 'proj-2', cam: [0.6, 0.3, 8.5], look: [0.6, 0, 0], crystalX: 4.6, crystalY: -0.1, scale: 0.92, shape: 0, jitter: 1, speed: 1.2, hue: 0.9, shardSpread: 0.9, swirl: 0, particles: 0.4, text: 0, textX: 0, textY: -3.5, dim: 0.4 },
  // skills: network recedes upward, particles swirl into a vortex
  { id: 'skills', cam: [0, 1.5, 11], look: [0, 0.5, 0], crystalX: 0, crystalY: 2.6, scale: 0.5, shape: 0, jitter: 0, speed: 0.4, hue: 0.72, shardSpread: 2.4, swirl: 1, particles: 1, text: 0, textX: 0, textY: -3.5, dim: 0.5 },
  // contact: network returns, large and slowly turning
  { id: 'contact', cam: [0, 0, 8], look: [0, 0, 0], crystalX: 0, crystalY: 0.2, scale: 1.15, shape: 0, jitter: 0, speed: 0.6, hue: 0.72, shardSpread: 1.0, swirl: 0, particles: 0.6, text: 0, textX: 0, textY: -3.5, dim: 0.42 },
]

const NUMERIC = ['crystalX', 'crystalY', 'scale', 'shape', 'jitter', 'speed', 'hue', 'shardSpread', 'swirl', 'particles', 'text', 'textX', 'textY', 'dim']

/** Portrait screens: network high and small, copy below it, more dimming. */
function phoneVariant(k) {
  const hero = k.id === 'hero'
  const contact = k.id === 'contact'
  return {
    ...k,
    cam: [0, k.cam[1] * 0.5, k.cam[2] + 3.5],
    look: [0, k.look[1] * 0.5, k.look[2]],
    crystalX: hero || contact ? 0 : 1.6,
    crystalY: hero ? 1.6 : contact ? 0.6 : 3.2,
    scale: hero ? 0.62 : contact ? 0.85 : Math.min(k.scale, 0.55),
    shardSpread: k.shardSpread * 0.8,
    textY: hero ? -0.1 : k.textY,
    dim: hero ? 0 : Math.max(k.dim, 0.5),
  }
}

/** Camera distance at the top of the page, used to size the 3D name. */
export function heroCameraZ(mobile) {
  return (mobile ? phoneVariant(KEYS[0]) : KEYS[0]).cam[2]
}

/**
 * Measure the DOM and attach an `at` (page progress) to every keyframe: the
 * progress at which the section's centre sits at the viewport's centre.
 */
export function resolveKeyframes(mobile) {
  const vh = window.innerHeight
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
  const frames = KEYS.map((k) => {
    const el = document.getElementById(k.id)
    let at = 0
    if (el) {
      const r = el.getBoundingClientRect()
      const centre = r.top + window.scrollY + Math.min(r.height, vh) / 2
      at = (centre - vh / 2) / maxScroll
    }
    return { ...(mobile ? phoneVariant(k) : k), at: Math.min(1, Math.max(0, at)) }
  })
  frames[0].at = 0
  frames[frames.length - 1].at = 1
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].at <= frames[i - 1].at) frames[i].at = frames[i - 1].at + 0.001
  }
  return frames
}

/** Fallback before the DOM has been measured: evenly spaced. */
export function defaultKeyframes(mobile) {
  return KEYS.map((k, i) => ({ ...(mobile ? phoneVariant(k) : k), at: i / (KEYS.length - 1) }))
}

function ease(t) {
  return t * t * (3 - 2 * t)
}

export function sampleKeyframes(frames, progress) {
  const p = Math.min(1, Math.max(0, progress))
  let i = 0
  while (i < frames.length - 2 && p > frames[i + 1].at) i++
  const a = frames[i]
  const b = frames[i + 1]
  const t = ease(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))))
  const out = { cam: [0, 0, 0], look: [0, 0, 0] }
  for (let j = 0; j < 3; j++) {
    out.cam[j] = a.cam[j] + (b.cam[j] - a.cam[j]) * t
    out.look[j] = a.look[j] + (b.look[j] - a.look[j]) * t
  }
  for (const key of NUMERIC) out[key] = a[key] + (b[key] - a[key]) * t
  return out
}
