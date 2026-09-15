import { computed, ref, watch, type Ref } from 'vue'

export function useSlides(length: Ref<number>, initial: Ref<number>) {
  const index = ref(0)
  const normalize = (value: number) => length.value ? ((Math.trunc(Number.isFinite(value) ? value : 0) % length.value) + length.value) % length.value : 0
  watch(initial, value => { index.value = normalize(value) }, { immediate: true })
  watch(length, () => { index.value = normalize(index.value) })
  function select(value: number) { index.value = normalize(value) }
  function move(direction: number) { select(index.value + direction) }
  function onKeydown(event: KeyboardEvent) {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? length.value - 1
      : event.key === 'ArrowRight' ? index.value + 1 : event.key === 'ArrowLeft' ? index.value - 1 : null
    if (next === null) return
    event.preventDefault()
    select(next)
  }
  return { index, select, move, onKeydown, counter: computed(() => `${length.value ? index.value + 1 : 0} / ${length.value}`) }
}

export function useSlideSwipe(move: (direction: number) => void) {
  let origin: { x: number; y: number } | undefined
  let dragged = false
  function begin(event: PointerEvent) {
    dragged = false
    if (event.button === 0) origin = { x: event.clientX, y: event.clientY }
  }
  function cancel() { origin = undefined }
  function end(event: PointerEvent) {
    if (origin) {
      const dx = event.clientX - origin.x
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - origin.y)) {
        dragged = true
        move(dx < 0 ? 1 : -1)
      }
    }
    cancel()
  }
  function suppressDraggedClick(event: MouseEvent) {
    if (dragged && event.detail !== 0) { event.preventDefault(); event.stopPropagation() }
    dragged = false
  }
  return { begin, end, cancel, suppressDraggedClick }
}
