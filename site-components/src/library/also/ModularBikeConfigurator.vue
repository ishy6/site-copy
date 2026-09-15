<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowLeft, ArrowRight, Check, LoaderCircle, RotateCcw } from 'lucide-vue-next'
import { bikeFrames, type BikeFrame, type FrameSize } from './frame-data'
import { ridePackages, type RidePackage } from './ride-data'
import { bikeCockpits, type BikeCockpit } from './cockpit-data'

export interface BikeBuild { frame: BikeFrame; size: FrameSize; ridePackage: RidePackage; cockpit: BikeCockpit; total: number }
const props = withDefaults(defineProps<{ title?: string; basePrice?: number; frames?: BikeFrame[]; packages?: RidePackage[]; cockpits?: BikeCockpit[]; initialFrame?: string; initialStep?: number; disabled?: boolean; saveBuild?: (build: BikeBuild) => Promise<void> }>(), {
  title: 'Build your TM-B', basePrice: 3500, frames: () => bikeFrames, packages: () => ridePackages, cockpits: () => bikeCockpits, initialFrame: 'solo', initialStep: 0, disabled: false,
})
const emit = defineEmits<{ change: [build: BikeBuild | null]; save: [build: BikeBuild]; success: [build: BikeBuild] }>()
const id = useId()
const step = ref(0)
const frameId = ref(props.initialFrame)
const packageId = ref('road')
const cockpitId = ref('standard')
const sizeId = ref('small')
const pending = ref(false)
const status = ref('')
const failed = ref(false)
const labels = ['Top Frame', 'Ride Package', 'Cockpit']
const frame = computed(() => props.frames.find(item => item.id === frameId.value))
const ridePackage = computed(() => props.packages.find(item => item.id === packageId.value))
const cockpit = computed(() => props.cockpits.find(item => item.id === cockpitId.value))
const size = computed(() => frame.value?.sizes.find(item => item.id === sizeId.value))
const total = computed(() => props.basePrice + (frame.value?.price ?? 0) + (ridePackage.value?.price ?? 0) + (cockpit.value?.price ?? 0))
const build = computed<BikeBuild | null>(() => frame.value && size.value && ridePackage.value && cockpit.value ? { frame: frame.value, size: size.value, ridePackage: ridePackage.value, cockpit: cockpit.value, total: total.value } : null)
const canContinue = computed(() => step.value === 0 ? frame.value?.available !== false && !!size.value : step.value === 1 ? !!ridePackage.value && ridePackage.value.available !== false : !!cockpit.value && cockpit.value.available !== false)
const available = computed(() => build.value && frame.value?.available !== false && ridePackage.value?.available !== false && cockpit.value?.available !== false)
const options = computed(() => step.value === 0 ? props.frames : step.value === 1 ? props.packages : props.cockpits)
const current = computed(() => step.value === 0 ? frameId.value : step.value === 1 ? packageId.value : cockpitId.value)
const displayed = computed(() => options.value.find(item => item.id === current.value))
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
function reconcile() {
  if (!props.frames.some(item => item.id === frameId.value)) frameId.value = props.frames.find(item => item.available !== false)?.id ?? ''
  if (!props.packages.some(item => item.id === packageId.value)) packageId.value = props.packages.find(item => item.available !== false)?.id ?? ''
  if (!props.cockpits.some(item => item.id === cockpitId.value)) cockpitId.value = props.cockpits.find(item => item.available !== false)?.id ?? ''
}
watch(() => [props.frames, props.packages, props.cockpits], reconcile, { immediate: true, deep: true })
watch(frame, value => { if (!value?.sizes.some(item => item.id === sizeId.value)) sizeId.value = value?.sizes[0]?.id ?? '' }, { immediate: true })
watch(() => props.initialFrame, value => { frameId.value = value; reconcile() })
watch(() => props.initialStep, value => { step.value = Math.min(3, Math.max(0, Math.trunc(value) || 0)) }, { immediate: true })
watch(build, value => { status.value = ''; emit('change', value) }, { deep: true })
function select(value: string) {
  if (props.disabled || pending.value || options.value.find(item => item.id === value)?.available === false) return
  if (step.value === 0) frameId.value = value
  else if (step.value === 1) packageId.value = value
  else cockpitId.value = value
}
async function save() {
  if (!available.value || !build.value || pending.value || props.disabled) return
  const value = structuredClone({ frame: { ...build.value.frame, sizes: build.value.frame.sizes.map(item => ({ ...item })) }, size: { ...build.value.size }, ridePackage: { ...build.value.ridePackage }, cockpit: { ...build.value.cockpit }, total: build.value.total })
  pending.value = true; failed.value = false; status.value = ''; emit('save', value)
  try { await props.saveBuild?.(value); status.value = props.saveBuild ? 'Your build is saved.' : 'Your build is ready.'; emit('success', value) }
  catch(cause) { failed.value = true; status.value = cause instanceof Error ? cause.message : 'Unable to save your build. Please try again.' }
  finally { pending.value = false }
}
</script>

<template>
  <section class="also-build" :aria-labelledby="`${id}-title`" :aria-busy="pending">
    <header><h3 :id="`${id}-title`">{{ title }}</h3><span>{{ money(total) }}</span></header>
    <nav class="also-build__steps" aria-label="Build steps"><button v-for="(label, i) in labels" :key="label" type="button" :aria-current="step === i ? 'step' : undefined" :disabled="disabled || pending" @click="step = i"><span>{{ i + 1 }}</span>{{ label }}</button></nav>
    <template v-if="step < 3">
      <div class="also-build__content"><div class="also-build__photo"><img v-if="displayed" :src="displayed.image" :alt="displayed.label" /><p v-else>No options available.</p><span v-if="displayed">{{ displayed.label }}</span></div>
        <fieldset class="also-build__options" :disabled="disabled || pending"><legend>{{ labels[step] }}</legend><label v-for="option in options" :key="option.id" :class="{ selected: current === option.id, unavailable: option.available === false }"><input type="radio" :name="`${id}-option-${step}`" :value="option.id" :checked="current === option.id" :disabled="option.available === false" @change="select(option.id)" /><span><strong>{{ option.label }}</strong><small>{{ option.available === false ? 'Unavailable' : option.price ? `+${money(option.price)}` : 'Included' }}</small></span><Check v-if="current === option.id" :size="15" aria-hidden="true" /></label><label v-if="step === 0 && frame" class="also-build__size"><span>Size</span><select v-model="sizeId" aria-label="Frame size"><option v-for="option in frame.sizes" :key="option.id" :value="option.id">{{ option.label }}</option></select></label></fieldset>
      </div>
      <footer><button type="button" class="also-build__back" :disabled="step === 0 || disabled || pending" aria-label="Previous step" title="Previous step" @click="step--"><ArrowLeft :size="18" /></button><button type="button" class="also-build__next" :disabled="!canContinue || disabled || pending" @click="step++">{{ step === 2 ? 'Review build' : 'Continue' }}<ArrowRight :size="17" /></button></footer>
    </template>
    <template v-else><div class="also-build__summary"><h4>Your TM-B</h4><dl><div><dt>Top Frame</dt><dd>{{ frame?.label ?? 'Unavailable' }} / {{ size?.label ?? '-' }}</dd></div><div><dt>Ride Package</dt><dd>{{ ridePackage?.label ?? 'Unavailable' }}</dd></div><div><dt>Cockpit</dt><dd>{{ cockpit?.label ?? 'Unavailable' }}</dd></div><div><dt>Total</dt><dd>{{ money(total) }}</dd></div></dl></div><footer><button type="button" class="also-build__back" title="Edit build" aria-label="Edit build" :disabled="pending || disabled" @click="step = 0"><RotateCcw :size="17" /></button><button class="also-build__next" type="button" :disabled="pending || disabled || !available" @click="save">{{ pending ? 'Saving' : 'Save build' }}<LoaderCircle v-if="pending" class="also-build__spinner" :size="17" /><Check v-else :size="17" /></button></footer></template>
    <p class="also-build__status" :role="failed ? 'alert' : 'status'">{{ status }}</p>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library ALSO Camera'; src: url('/assets/also/ABCCameraPlainVariable.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }@font-face { font-family: 'Library ALSO Serial'; src: url('/assets/also/SerialC-Bold.woff2') format('woff2'); font-weight: 700 900; font-display: swap; }
.also-build { width: min(100%, 620px); color: #111; font: 13px/1.35 'Library ALSO Camera', Arial, sans-serif; letter-spacing: 0; }.also-build, .also-build * { box-sizing: border-box; }.also-build header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }.also-build h3 { margin: 0; font-size: 26px; font-weight: 400; overflow-wrap: anywhere; }.also-build header > span { font-size: 18px; white-space: nowrap; }
.also-build button { color: inherit; font: inherit; cursor: pointer; }.also-build button:disabled { opacity: .45; cursor: default; }.also-build__steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; margin: 18px 0; }.also-build__steps button { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 8px 0; border: 0; border-bottom: 2px solid #c7c7be; background: none; font-size: 11px; text-align: left; }.also-build__steps button[aria-current] { border-color: #111; }.also-build__steps span { flex: none; display: grid; place-items: center; width: 19px; height: 19px; border: 1px solid #111; border-radius: 50%; font-size: 10px; }.also-build__steps [aria-current] span { background: #111; color: #fff; }
.also-build__content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; min-height: 222px; }.also-build__photo { position: relative; min-width: 0; height: 222px; display: grid; place-items: center; background: #eeeeeb; border-radius: 5px; overflow: hidden; }.also-build__photo img { position: absolute; width: 100%; height: 100%; object-fit: contain; }.also-build__photo > span { position: absolute; bottom: 10px; left: 12px; font-size: 11px; }.also-build__options { min-width: 0; border: 0; padding: 0; margin: 0; }.also-build__options legend { font: 900 11px/1.3 'Library ALSO Serial', Arial, sans-serif; text-transform: uppercase; padding: 0; margin-bottom: 8px; }.also-build__options > label { display: flex; align-items: center; gap: 8px; border: 1px solid #a8a89d; border-radius: 5px; padding: 8px 10px; margin-bottom: 6px; cursor: pointer; }.also-build__options > label.selected { border-color: #111; background: #b1ff8f; box-shadow: 0 1px 0 #111; }.also-build__options input { width: 13px; height: 13px; margin: 0; accent-color: #111; flex: none; }.also-build__options label > span { flex: 1; min-width: 0; }.also-build__options strong, .also-build__options small { display: block; font-weight: 400; overflow-wrap: anywhere; }.also-build__options small { font-size: 10px; color: #47483f; }.also-build__options .unavailable { opacity: .5; }.also-build__options .also-build__size { border: 0; padding: 4px 0; font-size: 11px; }.also-build__size select { max-width: 75%; font: inherit; background: none; color: inherit; border: 0; padding: 4px; }
.also-build footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; }.also-build__back { width: 35px; height: 35px; display: grid; place-items: center; border: 1px solid #111; border-radius: 50%; background: #fff; }.also-build__next { display: flex; align-items: center; justify-content: center; gap: 14px; max-width: calc(100% - 45px); min-height: 36px; padding: 8px 18px; background: #111; color: #fff !important; border: 1px solid #111; border-radius: 999px; box-shadow: 0 2px 0 #111; font: 900 12px/1.35 'Library ALSO Serial', sans-serif !important; text-transform: uppercase; }.also-build__next svg { flex: none; }.also-build__summary { min-height: 222px; }.also-build__summary h4 { font-size: 22px; font-weight: 400; margin: 0 0 12px; }.also-build dl { margin: 0; }.also-build dl > div { display: flex; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px solid #cccac1; }.also-build dd { margin: 0; text-align: right; overflow-wrap: anywhere; }.also-build__status { font-size: 11px; min-height: 15px; margin: 8px 0 0; overflow-wrap: anywhere; }.also-build button:focus-visible, .also-build input:focus-visible, .also-build select:focus-visible { outline: 2px solid #111; outline-offset: 3px; }
.also-build__spinner { animation: also-build-spin 1s linear infinite; }@keyframes also-build-spin { to { transform: rotate(360deg); } }@media(max-width: 480px) { .also-build h3 { font-size: 22px; }.also-build header { align-items: start; flex-wrap: wrap; }.also-build__content { grid-template-columns: minmax(0, 1fr); gap: 16px; }.also-build__photo { height: 145px; }.also-build__steps { margin: 14px 0; }.also-build__steps button { font-size: 10px; gap: 5px; } }@media(prefers-reduced-motion: reduce) { .also-build__spinner { animation: none; } }
</style>
