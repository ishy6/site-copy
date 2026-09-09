<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const viewport = ref<HTMLElement | null>(null)
const flags = ['hkd', 'eur', 'usd', 'gbp', 'inr', 'sbd', 'myr', 'fjd', 'ngn', 'mop', 'idr', 'rsd', 'gel', 'pen', 'huf', 'bbd', 'mwk', 'cad', 'ghs', 'ils']
let frame: number | undefined
let motionPreference: MediaQueryList | undefined

function updateScroll() {
  frame = undefined
  const element = viewport.value
  if (!element || motionPreference?.matches) return
  const bounds = element.getBoundingClientRect()
  if (bounds.top > window.innerHeight || bounds.bottom < 0) return
  const distance = Math.round(window.innerHeight - bounds.top)
  element.style.setProperty('--belt-arrow-width', `${distance * 0.8}px`)
  element.style.setProperty('--belt-rotation', `${distance * 0.4}deg`)
}

function scheduleScroll() {
  if (frame === undefined) frame = window.requestAnimationFrame(updateScroll)
}

function resetMotion() {
  if (frame !== undefined) window.cancelAnimationFrame(frame)
  frame = undefined
  viewport.value?.style.removeProperty('--belt-arrow-width')
  viewport.value?.style.removeProperty('--belt-rotation')
  if (!motionPreference?.matches) scheduleScroll()
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', resetMotion)
  window.addEventListener('scroll', scheduleScroll, { passive: true })
  window.addEventListener('resize', resetMotion)
  scheduleScroll()
})

onUnmounted(() => {
  if (frame !== undefined) window.cancelAnimationFrame(frame)
  motionPreference?.removeEventListener('change', resetMotion)
  window.removeEventListener('scroll', scheduleScroll)
  window.removeEventListener('resize', resetMotion)
})
</script>

<template>
  <div ref="viewport" class="flag-belt-viewport" aria-hidden="true">
    <div class="flag-belt-track">
      <div class="belt-arrow-background">
        <div class="belt-arrow-frame">
          <span class="belt-arrow">
            <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
              <path fill-rule="evenodd" clip-rule="evenodd" d="m18.586 11-6.293-6.293 1.414-1.414 7.993 7.993a1.01 1.01 0 0 1 0 1.428l-7.993 7.993-1.414-1.414L18.586 13H2v-2z" />
            </svg>
          </span>
        </div>
      </div>
      <img v-for="flag in flags" :key="flag" class="big-flag" :src="`https://wise.com/web-art/assets/flags/${flag}.svg`" alt="" loading="lazy" />
    </div>
  </div>
</template>

<style scoped>
.flag-belt-viewport {
  --belt-size: 96px;
  --belt-inset: 8px;
  --belt-initial-width: 140px;
  height: var(--belt-size);
  overflow: hidden;
}

.flag-belt-track {
  display: flex;
  height: 100%;
}

.belt-arrow-background {
  display: flex;
  flex: 0 0 var(--belt-arrow-width, var(--belt-initial-width));
  justify-content: flex-end;
  height: 100%;
  margin-right: 8px;
  border-radius: 0 1000px 1000px 0;
  background: var(--lime);
}

.belt-arrow-frame,
.big-flag {
  flex: 0 0 var(--belt-size);
  width: var(--belt-size);
  height: var(--belt-size);
  padding: var(--belt-inset);
  border-radius: 50%;
}

.belt-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--belt-inset);
  border-radius: 50%;
  color: var(--lime);
  background: var(--forest);
}

.belt-arrow svg {
  width: 60%;
  height: 100%;
}

.big-flag {
  outline: 1px solid #0e0f0c1f;
  outline-offset: calc(-1 * var(--belt-inset));
  transform: rotate(var(--belt-rotation, 0deg));
}

@media (min-width: 768px) {
  .flag-belt-viewport {
    --belt-size: 128px;
    --belt-initial-width: 270px;
  }
}

@media (min-width: 992px) {
  .flag-belt-viewport {
    --belt-size: 160px;
    --belt-inset: 12px;
    --belt-initial-width: 324px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .belt-arrow-background {
    flex-basis: var(--belt-initial-width);
  }

  .big-flag {
    transform: none;
  }
}
</style>
