<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ label: string; full?: boolean; inheritSize?: boolean }>()
const rotationOrigin = computed(() => `${Math.min(10000, (460 + 180 * props.label.length) * (props.full ? 3 : 1))}%`)

const root = ref<HTMLElement | null>(null)
let parent: HTMLElement | null = null
let animations: Animation[] = []

function reset() {
  animations.forEach((animation) => animation.cancel())
  animations = []
}

function rotate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || parent?.matches(':disabled, [aria-disabled="true"]')) {
    reset()
    return
  }
  if (animations.some((animation) => animation.playState === 'running' || animation.pending)) return
  reset()
  animations = Array.from(root.value?.children ?? []).flatMap((element, index) => {
    if (typeof element.animate !== 'function') return []
    return element.animate([
      { transform: `rotate(${index === 0 ? 0 : -20}deg)`, opacity: 1 },
      { transform: `rotate(${index === 0 ? 20 : 0}deg)`, opacity: 1 },
    ], { duration: props.full ? 750 : 500, delay: index * 75, easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' })
  })
  const icon = parent?.querySelector(':scope > svg')
  if (icon && typeof icon.animate === 'function') animations.push(icon.animate([
    { transform: 'translate(0, 0)' },
    { transform: 'translate(120%, 120%)', offset: 0.49 },
    { transform: 'translate(-120%, -120%)', offset: 0.5 },
    { transform: 'translate(0, 0)' },
  ], { duration: 575, easing: 'cubic-bezier(.625,.05,0,1)' }))
  const currentAnimations = animations
  void Promise.all(currentAnimations.map((animation) => animation.finished)).then(() => {
    if (animations === currentAnimations) reset()
  }).catch(() => {})
}

onMounted(() => {
  parent = root.value?.closest<HTMLElement>('button, a') ?? root.value?.parentElement ?? null
  parent?.classList.add('has-button-roll')
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
  <span ref="root" class="button-roll" :class="{ 'button-roll--inherit': inheritSize }" :style="{ '--roll-origin': rotationOrigin }"><span class="button-roll__label">{{ label }}</span><span class="button-roll__label" aria-hidden="true">{{ label }}</span></span>
</template>

<style scoped>
:global(.has-button-roll) { isolation: isolate; overflow: hidden; }
:global(.has-button-roll:hover > svg) { transform: none; }
:global(.has-button-roll:active) { transform: none; }
.button-roll { position: relative; display: inline-grid; place-items: center; font-size: 1.125em; font-variation-settings: 'wght' 500; letter-spacing: -.02em; line-height: 1; }
.button-roll--inherit { font-size: inherit; font-variation-settings: inherit; letter-spacing: inherit; }
.button-roll__label { display: block; white-space: nowrap; transform-origin: 50% var(--roll-origin); backface-visibility: hidden; }
.button-roll__label + .button-roll__label { position: absolute; inset: 0; opacity: 0; transform: rotate(-20deg); }
</style>
