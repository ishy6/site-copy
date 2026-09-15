<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ label: string }>()
const origin = computed(() => `${Math.min(10000, 460 + 180 * props.label.length)}%`)
const root = ref<HTMLElement>()
let parent: HTMLElement | null = null
let animations: Animation[] = []

function reset() {
  animations.forEach(animation => animation.cancel())
  animations = []
}

function rotate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || parent?.matches(':disabled, [aria-disabled="true"]')) return
  if (animations.some(animation => animation.playState === 'running' || animation.pending)) return
  reset()
  animations = Array.from(root.value?.children ?? []).flatMap((element, index) => {
    if (typeof element.animate !== 'function') return []
    return element.animate([
      { transform: `rotate(${index === 0 ? 0 : -20}deg)`, opacity: 1 },
      { transform: `rotate(${index === 0 ? 20 : 0}deg)`, opacity: 1 },
    ], { duration: 500, delay: index * 75, easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' })
  })
  const current = animations
  void Promise.all(current.map(animation => animation.finished)).then(() => {
    if (animations === current) reset()
  }).catch(() => {})
}

onMounted(() => {
  parent = root.value?.closest('button, a') ?? null
  parent?.addEventListener('pointerenter', rotate)
  parent?.addEventListener('focusin', rotate)
})
onBeforeUnmount(() => {
  parent?.removeEventListener('pointerenter', rotate)
  parent?.removeEventListener('focusin', rotate)
  reset()
})
watch(() => props.label, reset)
</script>

<template>
  <span ref="root" class="osmo-roll" :style="{ '--roll-origin': origin }">
    <span>{{ label }}</span><span aria-hidden="true">{{ label }}</span>
  </span>
</template>

<style scoped>
.osmo-roll { position: relative; display: inline-grid; place-items: center; min-width: 0; line-height: 1.25; }
.osmo-roll > span { display: block; overflow-wrap: anywhere; transform-origin: 50% var(--roll-origin); backface-visibility: hidden; }
.osmo-roll > span + span { position: absolute; inset: 0; opacity: 0; transform: rotate(-20deg); }
</style>
