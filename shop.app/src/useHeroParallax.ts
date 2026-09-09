import { onMounted, onUnmounted, watch, type Ref } from 'vue'

export function useHeroParallax(hero: Ref<HTMLElement | null>) {
  let frame: number | null = null
  let previousTime = 0
  let currentX = 0
  let currentY = 0
  let targetX = 0
  let targetY = 0
  let reducedMotion: MediaQueryList
  let compactViewport: MediaQueryList

  function reset() {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    previousTime = 0
    currentX = currentY = targetX = targetY = 0
    hero.value?.style.setProperty('--hero-mouse-x', '0')
    hero.value?.style.setProperty('--hero-mouse-y', '0')
  }

  function animate(time: number) {
    frame = null
    if (!hero.value) return
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 1000 / 60
    previousTime = time
    const blend = 1 - Math.pow(0.85, elapsed / (1000 / 60))
    currentX += (targetX - currentX) * blend
    currentY += (targetY - currentY) * blend
    const settled = Math.abs(targetX - currentX) < 0.0001 && Math.abs(targetY - currentY) < 0.0001
    if (settled) {
      currentX = targetX
      currentY = targetY
      previousTime = 0
    }
    hero.value.style.setProperty('--hero-mouse-x', String(currentX))
    hero.value.style.setProperty('--hero-mouse-y', String(currentY))
    if (!settled) frame = requestAnimationFrame(animate)
  }

  function handlePointer(event: PointerEvent) {
    if (!hero.value || event.pointerType === 'touch' || reducedMotion.matches || compactViewport.matches) return
    targetX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1))
    targetY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1))
    if (frame === null) frame = requestAnimationFrame(animate)
  }

  watch(hero, reset)

  onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    compactViewport = window.matchMedia('(max-width: 900px)')
    window.addEventListener('pointermove', handlePointer, { passive: true })
    reducedMotion.addEventListener('change', reset)
    compactViewport.addEventListener('change', reset)
  })

  onUnmounted(() => {
    reset()
    window.removeEventListener('pointermove', handlePointer)
    reducedMotion.removeEventListener('change', reset)
    compactViewport.removeEventListener('change', reset)
  })
}
