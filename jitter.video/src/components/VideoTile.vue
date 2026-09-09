<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ source: string; label: string; paused?: boolean }>(), { paused: false })
const video = ref<HTMLVideoElement>()
const failed = ref(false)
let observer: IntersectionObserver | undefined
let reducedMotion: MediaQueryList | undefined

function syncPlayback() {
  if (!video.value) return
  if (props.paused || reducedMotion?.matches || document.hidden) video.value.pause()
  else video.value.play()?.catch(() => {})
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.addEventListener('change', syncPlayback)
  observer = new IntersectionObserver(entries => {
    if (entries[0]?.isIntersecting) syncPlayback()
    else video.value?.pause()
  }, { threshold: 0.1 })
  if (video.value) observer.observe(video.value)
})
onBeforeUnmount(() => { observer?.disconnect(); reducedMotion?.removeEventListener('change', syncPlayback) })
</script>

<template>
  <div class="video-tile">
    <video v-if="!failed" ref="video" :src="source" :aria-label="label" muted loop playsinline preload="metadata" @error="failed = true" />
    <div v-else class="video-fallback"><span>{{ label }}</span><b>Make it move.</b></div>
  </div>
</template>
