<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, ref, shallowRef, watch, type Component } from 'vue'
import { entries } from '../registry'
import { previewProps } from '../catalog-state'
import LoadingState from './LoadingState.vue'
const props = defineProps<{ id: string; serialized: string | null; thumbnail: boolean; request?: string }>()
const entry = computed(() => entries.find(item => item.id === props.id))
const values = ref<Record<string, string | number | boolean>>({})
const component = shallowRef<Component>()
const canvas = ref<HTMLElement>()
const state = ref<'loading' | 'ready' | 'error'>('loading')
const events = ref(0)
let revision = 0
let loadTimeout: ReturnType<typeof setTimeout> | undefined
let assetTimeout: ReturnType<typeof setTimeout> | undefined
function publishState() {
  if (window.parent !== window) window.parent.postMessage({ type: 'site-components:preview-state', id: props.id, request: props.request ?? '', state: state.value }, window.location.origin)
}
watch(state, publishState)
watch(() => [props.id, props.serialized], () => {
  events.value = 0
  values.value = entry.value ? previewProps(entry.value, props.serialized) : {}
}, { immediate: true })
async function load() {
  const current = ++revision
  clearTimeout(loadTimeout)
  clearTimeout(assetTimeout)
  component.value = undefined
  state.value = 'loading'
  if (!entry.value) { state.value = 'error'; return }
  try {
    const module = await Promise.race([
      entry.value.loadComponent(),
      new Promise<never>((_, reject) => { loadTimeout = setTimeout(() => reject(new Error('Preview load timed out')), 20000) }),
    ])
    if (current !== revision) return
    clearTimeout(loadTimeout)
    component.value = module.default
    await nextTick()
    if (hasFailed() || current !== revision) return
    const visibleImages = [...(canvas.value?.querySelectorAll('img') ?? [])].filter(image => {
      const rect = image.getBoundingClientRect()
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0
    })
    await Promise.race([
      Promise.allSettled([document.fonts?.ready, ...visibleImages.map(image => { image.loading = 'eager'; return image.decode() })]),
      new Promise(resolve => { assetTimeout = setTimeout(resolve, 8000) }),
    ])
    if (current !== revision || hasFailed()) return
    clearTimeout(assetTimeout)
    state.value = 'ready'
  } catch {
    if (current === revision) { clearTimeout(loadTimeout); state.value = 'error' }
  }
}
function hasFailed() { return state.value === 'error' }
function retry() { window.location.reload() }
watch(() => props.id, load, { immediate: true })
onErrorCaptured(() => { state.value = 'error'; return false })
function receiveMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.id !== props.id) return
  if (event.data.type === 'site-components:request-state') publishState()
  if (event.data.type === 'site-components:props' && typeof event.data.values === 'string' && entry.value) values.value = previewProps(entry.value, event.data.values)
}
onMounted(() => window.addEventListener('message', receiveMessage))
onBeforeUnmount(() => { revision++; clearTimeout(loadTimeout); clearTimeout(assetTimeout); window.removeEventListener('message', receiveMessage) })
</script>

<template>
  <main v-if="entry" ref="canvas" class="embed-canvas" :class="{ 'embed-canvas--thumbnail': thumbnail, 'embed-canvas--loading': state !== 'ready' }" :aria-busy="state === 'loading'"
    :style="{ background: entry.background, color: entry.foreground || '#201d1d' }">
    <component :is="component" v-if="component && state !== 'error'" class="embed-component" :inert="state !== 'ready'" v-bind="values" @update:model-value="values.modelValue = $event"
      @click="entry.category === 'Buttons' && events++" @select="events++" @add="events++" />
    <LoadingState v-if="state !== 'ready'" class="embed-loading" :failed="state === 'error'" retryable :label="state === 'error' ? '组件加载失败' : 'Loading preview...'" @retry="retry" />
    <output v-if="events && !thumbnail && ['Buttons', 'Media'].includes(entry.category)" class="event-toast" aria-live="polite">Event fired · {{ events }}</output>
  </main>
  <main v-else class="embed-canvas"><p>Component not found.</p></main>
</template>

<style scoped>
.embed-canvas { position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px; min-height: 100dvh; width: 100%; padding: 32px; }
.embed-canvas > :deep(*) { flex-shrink: 0; }
.embed-canvas--thumbnail { padding: 16px; }
.embed-canvas--loading .embed-component { opacity: 0; pointer-events: none; }
.embed-loading { position: absolute; inset: 0; min-height: 100dvh; background: #f4f4f4; }
.event-toast { position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%); padding: 7px 12px; background: #fff; color: #201d1d; border: 1px solid #deddda; border-radius: 4px; font: 11px/1.3 'Haffer Mono', monospace; }
@media (max-width: 420px) { .embed-canvas { padding: 22px 16px; } }
</style>
