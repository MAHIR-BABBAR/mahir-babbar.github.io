/**
 * Frame-rate independent exponential smoothing. `k` is the response rate per
 * second: ~3 feels floaty, ~6 feels snappy. Returns the new value.
 */
export function damp(current, target, k, dt) {
  return current + (target - current) * (1 - Math.exp(-k * dt))
}

export function dampVec(vec, target, k, dt) {
  const f = 1 - Math.exp(-k * dt)
  vec.x += (target.x - vec.x) * f
  vec.y += (target.y - vec.y) * f
  vec.z += (target.z - vec.z) * f
  return vec
}
