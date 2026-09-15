<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Pause, Play, RotateCcw } from 'lucide-vue-next'
import { foldSheets } from './foldSheets'
const props = withDefaults(defineProps<{ sheets?: string[]; rows?: number; initialProgress?: number; duration?: number; title?: string }>(), { sheets: () => foldSheets, rows: 4, initialProgress: 0, duration: 3, title: 'One pull. Ready to go.' })
const emit = defineEmits<{ progress: [progress: number]; complete: [] }>()
const progress = ref(0)
const playing = ref(false)
const failed = ref(false)
let animation = 0
let last = 0
const total = computed(() => props.sheets.length * Math.max(1, props.rows))
const frame = computed(() => Math.min(total.value - 1, Math.round(progress.value * Math.max(0, total.value - 1))))
const image = computed(() => props.sheets[Math.floor(frame.value / Math.max(1, props.rows))])
const row = computed(() => frame.value % Math.max(1, props.rows))
watch(() => props.initialProgress, value => { progress.value = Math.max(0, Math.min(1, value)); playing.value = false }, { immediate: true })
watch(progress, value => emit('progress', value))
watch(image, () => { failed.value = false })
function tick(time: number) {
  if (!playing.value) return
  if (last) progress.value = Math.min(1, progress.value + (time - last) / (Math.max(.3, props.duration) * 1000))
  last = time
  if (progress.value >= 1) { playing.value = false; emit('complete'); return }
  animation = requestAnimationFrame(tick)
}
watch(playing, value => { cancelAnimationFrame(animation); last = 0; if (value) animation = requestAnimationFrame(tick) })
function toggle() { if (progress.value >= 1) progress.value = 0; playing.value = !playing.value }
function scrub(event: Event) { playing.value = false; progress.value = Number((event.target as HTMLInputElement).value) / 100 }
function reset() { playing.value = false; progress.value = 0; failed.value = false }
onMounted(() => { for (const src of props.sheets) { const preload = new Image(); preload.src = src } })
onBeforeUnmount(() => cancelAnimationFrame(animation))
</script>
<template>
  <section class="shupatto-fold" :aria-label="title"><header><span>Shupatto</span><h2>{{ title }}</h2></header><div class="shupatto-fold__stage"><img v-if="image && !failed" :src="image" alt="Shupatto bag folding sequence" :style="{ height: `${Math.max(1, rows) * 100}%`, top: `-${row * 100}%` }" @error="failed = true" /><p v-else>Sequence unavailable.</p></div><div class="shupatto-fold__controls"><button type="button" :aria-label="playing ? 'Pause folding' : 'Play folding'" :disabled="!sheets.length || failed" @click="toggle"><component :is="playing ? Pause : Play" :size="18" /></button><input type="range" aria-label="Fold progress" min="0" max="100" :value="progress * 100" @input="scrub" /><button type="button" aria-label="Reset folding" @click="reset"><RotateCcw :size="17" /></button></div></section>
</template>
<style scoped>
@font-face { font-family: 'Library Shupatto'; src: url('/assets/shupatto/tt-fors.woff2'); font-display: swap; }
.shupatto-fold { width: min(100%, 400px); font: 13px/1.4 'Library Shupatto', Arial, sans-serif; color: #272726; }
.shupatto-fold header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.shupatto-fold header > span { font-size: 18px; font-weight: 600; }
.shupatto-fold h2 { font-size: 13px; font-weight: 400; margin: 0; }
.shupatto-fold__stage { position: relative; width: 100%; aspect-ratio: 1750 / 1458; overflow: hidden; border-radius: 50% / 42%; background: #e1e3e1; }
.shupatto-fold__stage img { position: absolute; left: 0; width: 100%; object-fit: fill; }
.shupatto-fold__stage p { padding: 60px 20px; text-align: center; }
.shupatto-fold__controls { display: flex; align-items: center; gap: 16px; margin-top: 17px; }
.shupatto-fold__controls input { width: 100%; min-width: 0; accent-color: #272726; }
.shupatto-fold button { display: grid; place-items: center; width: 36px; height: 32px; flex-shrink: 0; padding: 0; border: 1px solid #27272670; border-radius: 50%; background: none; color: inherit; cursor: pointer; }
</style>
