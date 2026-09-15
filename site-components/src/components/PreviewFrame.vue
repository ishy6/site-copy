<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LoadingState from './LoadingState.vue'
const props = withDefaults(defineProps<{ id: string; title: string; thumbnail?: boolean; values?: Record<string, unknown>; refresh?: number }>(), { thumbnail: false, refresh: 0 })
const active = ref(!props.thumbnail)
const loaded = ref(false)
const failed = ref(false)
const attempt = ref(0)
const container = ref<HTMLElement>()
const frame = ref<HTMLIFrameElement>()
const scale = ref(0.5)
let observer: ResizeObserver | undefined
let visibilityObserver: IntersectionObserver | undefined
let timeout: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  window.addEventListener('message', receiveState)
  if (!props.thumbnail || !container.value) return
  observer = new ResizeObserver(([entry]) => { if (entry) scale.value = entry.contentRect.width / 720 })
  observer.observe(container.value)
  if (typeof IntersectionObserver === 'undefined') { active.value = true; return }
  visibilityObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { active.value = true; visibilityObserver?.disconnect() }
  }, { rootMargin: '160px 0px' })
  visibilityObserver.observe(container.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  visibilityObserver?.disconnect()
  clearTimeout(timeout)
  window.removeEventListener('message', receiveState)
})
const request = computed(() => `${props.refresh}:${attempt.value}`)
const url = computed(() => {
  const query = new URLSearchParams()
  if (props.thumbnail) query.set('thumbnail', '1')
  query.set('r', request.value)
  return `#/preview/${props.id}?${query}`
})
watch([url, active], () => {
  clearTimeout(timeout)
  loaded.value = false
  failed.value = false
  if (active.value) timeout = setTimeout(() => { failed.value = true }, 30000)
}, { immediate: true })
// The child acknowledges its async component and visible assets, not just its HTML document.
function receiveState(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== frame.value?.contentWindow) return
  if (event.data?.type !== 'site-components:preview-state' || event.data.id !== props.id || event.data.request !== request.value) return
  if (event.data.state === 'ready' || event.data.state === 'error') {
    clearTimeout(timeout)
    loaded.value = event.data.state === 'ready'
    failed.value = event.data.state === 'error'
  }
}
// Updating props through messages keeps iframe edits out of browser history.
function sendValues() {
  if (props.values) frame.value?.contentWindow?.postMessage({ type: 'site-components:props', id: props.id, values: JSON.stringify(props.values) }, window.location.origin)
}
function onLoad() {
  sendValues()
  frame.value?.contentWindow?.postMessage({ type: 'site-components:request-state', id: props.id }, window.location.origin)
}
function retry() { attempt.value++ }
watch(() => props.values, sendValues, { deep: true })
</script>

<template>
  <div ref="container" class="preview-frame" :class="{ 'preview-frame--thumbnail': thumbnail, 'preview-frame--ready': loaded }" :aria-busy="!loaded && !failed">
    <iframe v-if="active" :key="`${id}:${request}`" ref="frame" :src="url" :title="`${title} preview`"
      :tabindex="thumbnail || !loaded ? -1 : 0" :inert="thumbnail || !loaded" :style="thumbnail ? { transform: `scale(${scale})` } : undefined" @load="onLoad" />
    <LoadingState v-if="!loaded" class="preview-frame__loading" :compact="thumbnail" :failed="failed" :retryable="!thumbnail" :label="failed ? '预览加载失败' : 'Loading preview...'" @retry="retry" />
  </div>
</template>

<style scoped>
.preview-frame { position: relative; width: 100%; height: 100%; min-width: 0; overflow: hidden; }
iframe { display: block; width: 100%; height: 100%; border: 0; opacity: 0; transition: opacity .18s; }
.preview-frame--ready iframe { opacity: 1; }
.preview-frame__loading { position: absolute; inset: 0; height: 100%; background: #f4f4f4; }
.preview-frame--thumbnail { pointer-events: none; }
.preview-frame--thumbnail .preview-frame__loading { background: #f4f4f4e6; }
.preview-frame--thumbnail iframe { width: 720px; height: 465px; transform-origin: 0 0; }
@media(prefers-reduced-motion: reduce) { iframe { transition: none; } }
</style>
