<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  source?: string
  poster?: string
  title?: string
  author?: string
  autoplay?: boolean
  loop?: boolean
}>(), {
  source: '/assets/jitter/template-5.mp4',
  poster: '/assets/jitter/template-5-poster.jpg',
  title: 'Stretched Type Repeater',
  author: 'Jitter',
  autoplay: true,
  loop: true,
})
const emit = defineEmits<{ select: []; 'playback-change': [playing: boolean] }>()
const root = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const playing = ref(false)
const requested = ref(props.autoplay)
const failed = ref(false)
const ready = ref(false)
let visible = true
let observer: IntersectionObserver | undefined
let motion: MediaQueryList | undefined

function syncPlayback() {
  if (!video.value) return
  if (requested.value && visible && !document.hidden) {
    void video.value.play()?.catch(() => { playing.value = false })
  } else video.value.pause()
}
function toggle() {
  requested.value = !playing.value
  syncPlayback()
}
function onPlayback(value: boolean) {
  playing.value = value
  emit('playback-change', value)
}
function onMotionChange() {
  if (motion?.matches) requested.value = false
  syncPlayback()
}
async function reload() {
  failed.value = false
  ready.value = false
  await nextTick()
  video.value?.load()
}

watch(() => props.autoplay, value => {
  requested.value = value && !motion?.matches
  syncPlayback()
})
watch(() => props.source, reload)
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (motion.matches) requested.value = false
  motion.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', syncPlayback)
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      visible = Boolean(entries[0]?.isIntersecting)
      syncPlayback()
    }, { threshold: 0.1 })
    if (root.value) observer.observe(root.value)
  }
  syncPlayback()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  motion?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', syncPlayback)
  video.value?.pause()
})
</script>

<template>
  <article ref="root" class="motion-tile">
    <div class="motion-media">
      <div v-if="!ready || failed" class="motion-poster" aria-hidden="true"><span>THE TRACK</span><strong>Make it<br>move.</strong><span>DESIGN IN MOTION / 001</span></div>
      <video v-if="!failed" ref="video" :src="source" :poster="poster" :aria-label="title" :loop="loop" :class="{ ready }" muted playsinline preload="metadata" @loadeddata="ready = true; syncPlayback()" @play="onPlayback(true)" @pause="onPlayback(false)" @ended="requested = false" @error="failed = true; onPlayback(false)" />
      <span class="media-label">MOTION / TEMPLATE</span>
      <button v-if="failed" class="transport" type="button" aria-label="Retry video" title="Retry video" @click="reload"><RotateCcw :size="17" /></button>
      <button v-else class="transport" type="button" :aria-label="playing ? 'Pause video' : 'Play video'" :title="playing ? 'Pause video' : 'Play video'" @click="toggle"><Pause v-if="playing" :size="17" fill="currentColor" /><Play v-else :size="17" fill="currentColor" /></button>
    </div>
    <button type="button" class="tile-caption" :aria-label="`Select ${title}`" @click="emit('select')">
      <span class="avatar">{{ author.charAt(0).toUpperCase() }}</span><span class="tile-copy"><strong>{{ title }}</strong><small>{{ author }}</small></span><ArrowUpRight :size="21" />
    </button>
  </article>
</template>

<style scoped>
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-400.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-600.woff2') format('woff2');font-weight:600;font-display:swap}
.motion-tile{font-family:LibraryLausanne,Arial,sans-serif;width:100%;max-width:410px;min-width:0;color:#19181b;background:#fff;border-radius:8px;overflow:hidden;box-sizing:border-box;text-align:left;letter-spacing:0}
.motion-tile *{box-sizing:border-box}.motion-media{position:relative;aspect-ratio:1.43;overflow:hidden;background:#e5ff53}.motion-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}.motion-media video.ready{opacity:1}.motion-poster{height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:25px;color:#19181b}.motion-poster span{font-size:10px}.motion-poster strong{font-size:56px;line-height:.9;font-weight:600}.media-label{position:absolute;left:18px;top:18px;padding:5px 7px;color:white;background:#19181b80;font-size:8px}.transport{position:absolute;bottom:15px;right:15px;width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:50%;background:#fff;color:#19181b;cursor:pointer;transition:transform .2s}.transport:hover{transform:scale(1.08)}button:focus-visible{outline:3px solid #8055cf;outline-offset:-3px}.tile-caption{width:100%;padding:20px;display:flex;align-items:center;gap:12px;border:0;background:#fff;color:inherit;text-align:left;font:inherit;cursor:pointer;min-height:81px}.avatar{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#d8d1ec;font-size:14px;font-weight:600}.tile-copy{min-width:0;display:flex;flex:1;flex-direction:column;gap:5px}.tile-copy strong{font-size:14px;font-weight:600;overflow-wrap:anywhere}.tile-copy small{font-size:12px;color:#747278}.tile-caption>svg{flex:none;transition:transform .2s}.tile-caption:hover>svg{transform:translate(2px,-2px)}
@media(prefers-reduced-motion:reduce){.transport,.tile-caption>svg{transition:none}}
</style>
