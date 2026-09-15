<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import { ArrowUp, ArrowDown, Pause, Play } from 'lucide-vue-next'
import { useSlides } from './carousel'
export interface Testimonial { quote: string; name: string; role: string; image: string }
const props = withDefaults(defineProps<{ testimonials?: Testimonial[]; initialIndex?: number; autoplay?: boolean; interval?: number }>(), { initialIndex: 0, autoplay: false, interval: 5000, testimonials: () => [
  { quote: 'Osmo empowered me to take on any creative challenge', name: 'Dang Nguyen', role: 'Head of Creative', image: '/assets/osmo/dang.avif' },
  { quote: 'This gets the official GSAP stamp of approval.', name: 'Cassie Evans', role: 'Education GSAP', image: '/assets/osmo/cassie.avif' },
] })
const emit = defineEmits<{ change: [index: number] }>()
const { index, move, counter } = useSlides(computed(() => props.testimonials.length), toRef(props, 'initialIndex'))
const active = computed(() => props.testimonials[index.value])
const playing = ref(props.autoplay)
const hovering = ref(false)
const focused = ref(false)
const reduced = ref(false)
const explicitPlayback = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let media: MediaQueryList | undefined
function motionChanged() { reduced.value = media?.matches ?? false }
function focusOut(event: FocusEvent) { focused.value = event.relatedTarget instanceof Node && (event.currentTarget as HTMLElement).contains(event.relatedTarget) }
function focusIn() { focused.value = true; explicitPlayback.value = false }
function mouseEnter() { hovering.value = true; explicitPlayback.value = false }
function togglePlayback() { playing.value = !playing.value; explicitPlayback.value = playing.value }
function schedule() {
  clearInterval(timer)
  if (playing.value && (explicitPlayback.value || (!hovering.value && !focused.value && !reduced.value)) && props.testimonials.length > 1) timer = setInterval(() => { if (!document.hidden) move(1) }, Math.max(1000, props.interval))
}
watch(() => props.autoplay, value => { playing.value = value })
watch([playing, hovering, focused, reduced, explicitPlayback, () => props.interval, () => props.testimonials.length], schedule)
watch(index, value => emit('change', value))
onMounted(() => { media = matchMedia('(prefers-reduced-motion: reduce)'); motionChanged(); media.addEventListener('change', motionChanged); schedule() })
onBeforeUnmount(() => { clearInterval(timer); media?.removeEventListener('change', motionChanged) })
</script>
<template>
  <section class="osmo-quote" aria-label="Community testimonials" @mouseenter="mouseEnter" @mouseleave="hovering = false" @focusin="focusIn" @focusout="focusOut">
    <div class="osmo-quote__portrait"><img v-if="active" :src="active.image" :alt="active.name" /><span>Osmo's global<br />community</span></div>
    <div class="osmo-quote__copy"><blockquote v-if="active"><span aria-hidden="true">“</span><p>{{ active.quote }}</p><footer><strong>{{ active.name }}</strong><span>{{ active.role }}</span></footer></blockquote><p v-else>No testimonials available.</p><div class="osmo-quote__controls"><span>{{ counter }}</span><button type="button" :aria-label="playing ? 'Pause testimonials' : 'Play testimonials'" @click="togglePlayback"><component :is="playing ? Pause : Play" :size="16" /></button><button type="button" aria-label="Previous testimonial" :disabled="testimonials.length < 2" @click="move(-1)"><ArrowUp :size="17" /></button><button type="button" aria-label="Next testimonial" :disabled="testimonials.length < 2" @click="move(1)"><ArrowDown :size="17" /></button></div></div>
  </section>
</template>
<style scoped>
.osmo-quote { display: grid; grid-template-columns: 190px minmax(0, 1fr); width: min(100%, 630px); color: #201d1d; background: #f4f4f4; border-radius: 4px; overflow: hidden; font: 14px/1.4 'Haffer', Arial, sans-serif; }
.osmo-quote__portrait { background: #dcd5fa; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 25px; padding: 20px; }
.osmo-quote__portrait img { width: 130px; height: 130px; object-fit: cover; border-radius: 50%; }
.osmo-quote__portrait > span { font-size: 11px; text-align: center; }
.osmo-quote__copy { min-width: 0; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
.osmo-quote blockquote { margin: 0; }
.osmo-quote blockquote > span { font-size: 48px; line-height: 1; }
.osmo-quote blockquote p { margin: 0 0 24px; font-size: 25px; line-height: 1.1; overflow-wrap: anywhere; }
.osmo-quote footer { display: flex; flex-direction: column; gap: 4px; font-size: 11px; }
.osmo-quote footer span { color: #80766f; }
.osmo-quote__controls { display: flex; align-items: center; gap: 7px; margin-top: 28px; }
.osmo-quote__controls > span { margin-right: auto; font-size: 11px; }
.osmo-quote button { border: 1px solid #201d1d30; background: none; border-radius: 50%; display: grid; place-items: center; width: 30px; height: 30px; cursor: pointer; }
@media(max-width: 440px) { .osmo-quote { grid-template-columns: 1fr; } .osmo-quote__portrait { flex-direction: row; justify-content: start; padding: 16px 20px; } .osmo-quote__portrait img { width: 54px; height: 54px; } .osmo-quote__portrait > span { text-align: left; } .osmo-quote__copy { padding: 20px; } }
</style>
