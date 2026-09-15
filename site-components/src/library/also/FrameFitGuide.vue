<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Check, Ruler } from 'lucide-vue-next'
import { bikeFrames, matchingSizes, type BikeFrame } from './frame-data'
const props = withDefaults(defineProps<{ title?: string; frames?: BikeFrame[]; initialFrame?: string; initialHeight?: number; showLoad?: boolean }>(), { title: 'Find your fit.', frames: () => bikeFrames, initialFrame: 'solo', initialHeight: 170, showLoad: true })
const emit = defineEmits<{ change: [value: { frameId: string; heightCm: number; sizeIds: string[] }]; select: [value: { frameId: string; sizeId: string; heightCm: number }] }>()
const id = useId()
const selectedId = ref(props.initialFrame)
const heightCm = ref(props.initialHeight)
const units = ref<'cm' | 'in'>('cm')
const frame = computed(() => props.frames.find(item => item.id === selectedId.value) ?? props.frames[0])
const matches = computed(() => matchingSizes(frame.value, heightCm.value / 2.54))
const displayedHeight = computed(() => Math.round((units.value === 'cm' ? heightCm.value : heightCm.value / 2.54) * 10) / 10)
const min = computed(() => units.value === 'cm' ? 120 : 47)
const max = computed(() => units.value === 'cm' ? 220 : 87)
watch(() => props.initialHeight, value => { heightCm.value = value })
watch(() => props.initialFrame, value => { selectedId.value = value })
watch(() => [frame.value?.id, heightCm.value, matches.value.map(size => size.id)] as const, () => { emit('change', { frameId: frame.value?.id ?? '', heightCm: heightCm.value, sizeIds: matches.value.map(size => size.id) }) })
function changeHeight(event: Event) { const input = event.target as HTMLInputElement; const value = Number(input.value); if (!Number.isFinite(value) || !input.value) { input.value = String(displayedHeight.value); return }; heightCm.value = Math.min(max.value, Math.max(min.value, value)) * (units.value === 'cm' ? 1 : 2.54); input.value = String(displayedHeight.value) }
const inches = (value: number) => `${Math.floor(value / 12)}'${value % 12}"`
const range = (minimum: number, maximum: number) => units.value === 'cm' ? `${Math.round(minimum * 254) / 100}-${Math.round(maximum * 254) / 100} cm` : `${inches(minimum)}-${inches(maximum)}`
function select() { if (frame.value && matches.value[0]) emit('select', { frameId: frame.value.id, sizeId: matches.value[0].id, heightCm: heightCm.value }) }
</script>

<template>
  <section class="also-fit" :aria-labelledby="`${id}-title`">
    <header><h3 :id="`${id}-title`">{{ title }}</h3><Ruler :size="23" aria-hidden="true" /></header>
    <div class="also-fit__frame"><img v-if="frame" :src="frame.image" :alt="`${frame.label} Top Frame`" /><div><label :for="`${id}-frame`">Top Frame</label><select :id="`${id}-frame`" v-model="selectedId"><option v-for="item in frames" :key="item.id" :value="item.id">{{ item.label }}</option></select><p v-if="showLoad && frame">{{ frame.loadLbs }} lbs top frame load<span v-if="frame.cargoLbs"> / {{ frame.cargoLbs }} lbs cargo</span></p></div></div>
    <div class="also-fit__height"><label :for="`${id}-height`">Your height</label><div class="also-fit__units" role="group" aria-label="Height unit"><button type="button" :aria-pressed="units === 'cm'" @click="units = 'cm'">cm</button><button type="button" :aria-pressed="units === 'in'" @click="units = 'in'">in</button></div><input :id="`${id}-height`" :value="displayedHeight" type="number" :min="min" :max="max" step="0.1" @change="changeHeight" /></div>
    <input class="also-fit__range" type="range" :value="displayedHeight" :min="min" :max="max" step="0.1" aria-label="Rider height" @input="changeHeight" />
    <table><thead><tr><th scope="col">Size</th><th scope="col">Rider height</th><th scope="col"><span class="also-fit__sr-only">Suitable</span></th></tr></thead><tbody><tr v-for="size in frame?.sizes" :key="size.id" :class="{ matching: matches.some(item => item.id === size.id) }"><th scope="row">{{ size.label }}</th><td>{{ range(size.minInches, size.maxInches) }}</td><td><Check v-if="matches.some(item => item.id === size.id)" :size="14" :aria-label="`${size.label} fits this height`" /></td></tr></tbody></table>
    <div class="also-fit__result" role="status"><span>{{ matches.length ? `${matches[0]?.label} recommended` : 'Outside the listed size ranges' }}</span><button v-if="matches.length" type="button" @click="select">Select {{ matches[0]?.label }}</button></div><p class="also-fit__note">{{ matches.length > 1 ? 'Between sizes, consider sizing down. ' : '' }}Confirm your fit with a bike shop.</p>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library ALSO Camera'; src: url('/assets/also/ABCCameraPlainVariable.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
.also-fit { width: min(100%, 430px); color: #111; font: 12px/1.4 'Library ALSO Camera', Arial, sans-serif; letter-spacing: 0; }.also-fit, .also-fit * { box-sizing: border-box; }.also-fit h3 { font-size: 28px; line-height: 1.1; font-weight: 400; margin: 0; overflow-wrap: anywhere; }.also-fit header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }.also-fit header svg { flex: none; }.also-fit__frame { display: flex; gap: 16px; align-items: center; margin: 14px 0; }.also-fit__frame img { width: 90px; height: 80px; object-fit: contain; background: #eee; border-radius: 5px; }.also-fit__frame > div { flex: 1; min-width: 0; }.also-fit__frame label { display: block; color: #68665f; font-size: 10px; }.also-fit__frame select { width: 100%; min-width: 0; font: 18px 'Library ALSO Camera', sans-serif; color: inherit; border: 0; background: transparent; padding: 4px 0; }.also-fit__frame p { margin: 2px 0 0; color: #68665f; font-size: 10px; overflow-wrap: anywhere; }
.also-fit__height { display: flex; align-items: center; gap: 12px; }.also-fit__height > label { flex: 1; }.also-fit__units { display: flex; border: 1px solid #111; border-radius: 4px; overflow: hidden; }.also-fit__units button { width: 29px; min-height: 25px; border: 0; color: inherit; background: none; font: inherit; cursor: pointer; }.also-fit__units button[aria-pressed=true] { background: #111; color: #fff; }.also-fit__height input { width: 65px; padding: 4px; color: inherit; background: #fff; border: 1px solid #aaa99d; border-radius: 4px; font: inherit; }.also-fit__range { width: 100%; margin: 12px 0; accent-color: #111; }
.also-fit table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; }.also-fit th, .also-fit td { text-align: left; padding: 7px 6px; border-bottom: 1px solid #c4c3b8; font-weight: 400; overflow-wrap: anywhere; }.also-fit thead th { color: #68665f; font-size: 10px; }.also-fit th:first-child { width: 29%; }.also-fit th:last-child { width: 26px; }.also-fit tr.matching { background: #d7f7c8; }.also-fit td svg { display: block; }
.also-fit__result { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-top: 14px; }.also-fit__result > span { font-size: 12px; overflow-wrap: anywhere; }.also-fit__result button { padding: 6px 12px; min-height: 29px; border-radius: 999px; border: 1px solid #111; background: #111; color: #fff; font: inherit; cursor: pointer; }.also-fit__note { color: #68665f; font-size: 10px; margin: 7px 0 0; }.also-fit button:focus-visible, .also-fit input:focus-visible, .also-fit select:focus-visible { outline: 2px solid #111; outline-offset: 3px; }.also-fit__sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style>
