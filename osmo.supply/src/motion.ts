import { onBeforeUnmount, ref, type Ref } from 'vue'

export function wrapIndex(value: number, length: number) {
  return ((value % length) + length) % length
}

export function circularOffset(index: number, position: number, length: number) {
  return wrapIndex(index - position + length / 2, length) - length / 2
}

export function useMotionPosition(reducedMotion: Ref<boolean>) {
  const position = ref(0)
  let frame = 0

  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
  }

  function moveTo(target: number, elastic = false, duration = elastic ? 600 : 800) {
    stop()
    if (reducedMotion.value) {
      position.value = target
      return
    }
    const start = position.value
    const started = performance.now()
    function tick(now: number) {
      const progress = Math.min(1, (now - started) / duration)
      const phase = Math.asin(1 / 1.2) / (Math.PI * 2)
      const eased = progress === 0 ? 0 : elastic
        ? 1 + 1.2 * Math.pow(2, -10 * progress) * Math.sin((progress - phase) * Math.PI * 2)
        : 1 - Math.pow(2, -10 * progress)
      position.value = progress === 1 ? target : start + (target - start) * eased
      if (progress < 1) frame = requestAnimationFrame(tick)
      else frame = 0
    }
    frame = requestAnimationFrame(tick)
  }

  onBeforeUnmount(stop)
  return { position, moveTo, stop }
}

export function showcasePose(offset: number) {
  const distance = Math.min(3, Math.abs(offset))
  const lower = Math.floor(distance)
  const fraction = distance - lower
  const interpolate = (values: number[]) => values[lower]! + ((values[Math.min(3, lower + 1)]! - values[lower]!) * fraction)
  return {
    x: Math.sign(offset) * interpolate([0, 25, 45, 55]),
    y: interpolate([0, 5, 7, 5]),
    rotation: offset * 5,
    scale: interpolate([1, 0.9, 0.75, 0.6]),
    opacity: interpolate([1, 1, 1, 0]),
  }
}
