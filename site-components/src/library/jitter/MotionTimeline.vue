<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Asterisk, Pause, Play, RotateCcw } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title?: string
  duration?: number
  color?: string
  autoplay?: boolean
}>(), { title: 'Make it move.', duration: 4, color: '#b498f5', autoplay: true })
const emit = defineEmits<{ seek: [seconds: number]; 'playback-change': [playing: boolean] }>()
const seconds = ref(0)
const playing = ref(false)
const length = computed(() => Math.max(0.5, Math.min(30, Number.isFinite(props.duration) ? props.duration : 4)))
const progress = computed(() => seconds.value / length.value)
const entrance = computed(() => Math.min(progress.value * 4, 1))
const time = computed(() => `${Math.floor(seconds.value).toString().padStart(2, '0')}:${Math.floor(seconds.value % 1 * 100).toString().padStart(2, '0')}`)
let animation = 0
let previous = 0
let motion: MediaQueryList | undefined

function setPlaying(value: boolean) {
  playing.value = value
  syncAnimation()
  emit('playback-change', value)
}
function seek(event: Event) {
  seconds.value = Number((event.target as HTMLInputElement).value)
  emit('seek', seconds.value)
}
function reset() {
  seconds.value = 0
  emit('seek', 0)
}
function tick(now: number) {
  if (!playing.value || document.hidden) {
    animation = 0
    previous = 0
    return
  }
  if (previous) seconds.value = (seconds.value + Math.min((now - previous) / 1000, 0.1)) % length.value
  previous = now
  animation = requestAnimationFrame(tick)
}
function syncAnimation() {
  cancelAnimationFrame(animation)
  animation = 0
  previous = 0
  if (playing.value && !document.hidden) animation = requestAnimationFrame(tick)
}
function onMotionChange() {
  if (motion?.matches) setPlaying(false)
}
watch(length, value => { seconds.value = Math.min(seconds.value, value) })
watch(() => props.autoplay, value => setPlaying(value && !motion?.matches))
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', syncAnimation)
  setPlaying(props.autoplay && !motion.matches)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(animation)
  motion?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', syncAnimation)
})
</script>

<template>
  <section class="motion-editor" aria-label="Motion timeline">
    <div class="editor-topline"><span class="status-dot"></span><span>Untitled animation</span><span class="dimensions">1080 x 1080</span></div>
    <div class="artboard" :style="{ background: color }">
      <span class="art-eyebrow">DESIGN IN MOTION</span>
      <strong :style="{ opacity: .25 + entrance * .75, transform: `translateY(${(1 - entrance) * 15}px)` }">{{ title }}</strong>
      <Asterisk class="art-symbol" :size="132" :stroke-width="1.3" aria-hidden="true" :style="{ transform: `rotate(${progress * 90}deg)` }" />
      <span class="art-footer">Jitter</span>
    </div>
    <div class="timeline-tools"><div class="transport-buttons"><button type="button" :aria-label="playing ? 'Pause animation' : 'Play animation'" :title="playing ? 'Pause animation' : 'Play animation'" @click="setPlaying(!playing)"><Pause v-if="playing" :size="16" fill="currentColor" /><Play v-else :size="16" fill="currentColor" /></button><button type="button" aria-label="Reset timeline" title="Reset timeline" @click="reset"><RotateCcw :size="15" /></button></div><output>{{ time }} <span>/ {{ length.toFixed(2) }}s</span></output><span class="effect-label">Gentle entrance</span></div>
    <div class="track"><div class="ruler"><span v-for="tick in 5" :key="tick">{{ Number(((tick - 1) * length / 4).toFixed(1)) }}s</span></div><div class="clip"><span>T</span><span>Headline</span></div><div class="playhead" :style="{ left: `${progress * 100}%` }" aria-hidden="true"></div><input type="range" aria-label="Timeline position" min="0" :max="length" step="0.01" :value="seconds" :aria-valuetext="`${seconds.toFixed(2)} seconds`" @input="seek" /></div>
  </section>
</template>

<style scoped>
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-400.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-800.woff2') format('woff2');font-weight:800;font-display:swap}
.motion-editor{font-family:LibraryLausanne,Arial,sans-serif;color:#19181b;background:#fff;border:1px solid #e6e5e8;border-radius:8px;overflow:hidden;width:100%;max-width:510px;min-width:0;box-sizing:border-box;letter-spacing:0}.motion-editor *{box-sizing:border-box}.editor-topline{min-height:35px;padding:0 16px;display:flex;align-items:center;gap:7px;font-size:10px;border-bottom:1px solid #ecebef}.status-dot{width:6px;height:6px;border-radius:50%;background:#b498f5;flex:none}.dimensions{margin-left:auto;font-size:8px;color:#8b8990}.artboard{height:205px;position:relative;margin:13px 13px 0;padding:21px 25px;overflow:hidden}.art-eyebrow{position:relative;z-index:1;display:block;font-size:8px}.artboard strong{position:relative;z-index:1;display:block;margin-top:20px;max-width:75%;font-size:43px;font-weight:800;line-height:1;overflow-wrap:anywhere}.art-symbol{position:absolute;right:12px;bottom:-22px;color:#30214b}.art-footer{position:absolute;left:25px;bottom:14px;font-size:10px}.timeline-tools{display:flex;align-items:center;gap:12px;padding:11px 15px 3px;font-size:10px;min-width:0}.transport-buttons{display:flex;gap:2px}.transport-buttons button{border:0;background:transparent;color:inherit;display:grid;place-items:center;width:27px;height:27px;border-radius:4px;cursor:pointer}.transport-buttons button:hover{background:#f0edf5}.transport-buttons button:focus-visible{outline:2px solid #8055cf;outline-offset:1px}output{font-variant-numeric:tabular-nums;white-space:nowrap}output span{color:#99949f}.effect-label{margin-left:auto;color:#7c668f;font-size:9px}.track{position:relative;margin:3px 25px 16px;min-width:0;height:52px}.ruler{display:flex;justify-content:space-between;font-size:8px;color:#9c98a1;padding:3px 0 9px;user-select:none}.clip{height:25px;display:flex;gap:8px;align-items:center;padding:0 12px;background:#e1d5f5;color:#735395;border-radius:4px;font-size:9px}.clip>span:first-child{font-weight:800}.playhead{position:absolute;top:0;bottom:0;width:1px;background:#7950ad;pointer-events:none}.playhead:before{content:'';position:absolute;top:0;left:-3px;width:7px;height:7px;background:#7950ad;border-radius:1px}.track input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}.track:focus-within{outline:2px solid #8055cf;outline-offset:5px;border-radius:2px}@media(max-width:380px){.effect-label{display:none}.artboard strong{font-size:36px;max-width:85%}.art-symbol{right:-8px}.artboard{height:190px}}
@media(prefers-reduced-motion:reduce){.artboard strong{transform:none!important;opacity:1!important}.art-symbol{transform:none!important}}
</style>

<style scoped>
.artboard strong{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;max-height:129px}
</style>
