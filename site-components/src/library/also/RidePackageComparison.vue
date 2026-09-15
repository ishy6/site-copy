<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Check } from 'lucide-vue-next'
import { ridePackages, type RidePackage } from './ride-data'
const props = withDefaults(defineProps<{ title?: string; packages?: RidePackage[]; initialPackage?: string; differencesOnly?: boolean; showPrices?: boolean }>(), { title: 'Choose your terrain.', packages: () => ridePackages, initialPackage: 'road', differencesOnly: false, showPrices: true })
const emit = defineEmits<{ select: [ridePackage: RidePackage] }>()
const id = useId()
const selectedId = ref(props.initialPackage)
const differences = ref(props.differencesOnly)
watch(() => props.initialPackage, value => { selectedId.value = value })
watch(() => props.differencesOnly, value => { differences.value = value })
const features = [{ key: 'terrain', label: 'Terrain' }, { key: 'tires', label: 'Tires' }, { key: 'pedals', label: 'Pedals' }, { key: 'modes', label: 'Ride modes' }] as const
const rows = computed(() => features.filter(feature => !differences.value || new Set(props.packages.map(item => item[feature.key])).size > 1))
function select(item: RidePackage) { if (item.available === false) return; selectedId.value = item.id; emit('select', item) }
const price = (value: number) => value ? `+$${value}` : 'Included'
</script>

<template>
  <section class="also-packages" :aria-labelledby="`${id}-title`">
    <header><h3 :id="`${id}-title`">{{ title }}</h3><label><input v-model="differences" type="checkbox" />Differences only</label></header>
    <div v-if="packages.length" class="also-packages__scroll" tabindex="0" role="region" aria-label="Ride package comparison">
      <table><caption class="also-packages__sr-only">Ride packages and specifications</caption><thead><tr><th scope="col"><span class="also-packages__sr-only">Feature</span></th><th v-for="item in packages" :key="item.id" scope="col"><img :src="item.image" :alt="`${item.label} ride package`" /><span>{{ item.label }}</span><small v-if="showPrices">{{ price(item.price) }}</small></th></tr></thead><tbody><tr v-for="feature in rows" :key="feature.key"><th scope="row">{{ feature.label }}</th><td v-for="item in packages" :key="item.id">{{ item[feature.key] }}</td></tr><tr><th scope="row"><span class="also-packages__sr-only">Select a package</span></th><td v-for="item in packages" :key="item.id"><button type="button" :aria-pressed="selectedId === item.id" :aria-label="`Select ${item.label}`" :disabled="item.available === false" @click="select(item)"><Check v-if="selectedId === item.id" :size="13" aria-hidden="true" /><span>{{ item.available === false ? 'Unavailable' : selectedId === item.id ? 'Selected' : 'Select' }}</span></button></td></tr></tbody></table>
    </div>
    <p v-else>No ride packages available.</p>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library ALSO Camera'; src: url('/assets/also/ABCCameraPlainVariable.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
.also-packages { width: min(100%, 550px); color: #111; font: 12px/1.35 'Library ALSO Camera', Arial, sans-serif; letter-spacing: 0; }.also-packages, .also-packages * { box-sizing: border-box; }.also-packages header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }.also-packages h3 { font-size: 26px; line-height: 1.1; font-weight: 400; margin: 0; overflow-wrap: anywhere; }.also-packages header label { display: flex; align-items: center; gap: 6px; font-size: 10px; cursor: pointer; }.also-packages input { accent-color: #111; margin: 0; }.also-packages__scroll { max-width: 100%; overflow: auto; }
.also-packages table { width: 100%; border-collapse: collapse; table-layout: fixed; }.also-packages th, .also-packages td { text-align: left; font-weight: 400; padding: 9px 10px; border-bottom: 1px solid #bfc0b6; overflow-wrap: anywhere; }.also-packages th:first-child { width: 20%; padding-left: 0; font-size: 10px; color: #63645b; }.also-packages thead th { vertical-align: top; padding-top: 0; font-size: 17px; }.also-packages th img { display: block; width: 100%; height: 92px; object-fit: contain; background: #eee; margin-bottom: 7px; }.also-packages th span, .also-packages th small { display: block; }.also-packages th small { font-size: 10px; margin-top: 3px; color: #63645b; }.also-packages tbody td { font-size: 11px; }.also-packages tbody tr:last-child td, .also-packages tbody tr:last-child th { border: 0; padding-top: 13px; padding-bottom: 0; }
.also-packages button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; width: 100%; min-height: 30px; padding: 6px; border: 1px solid #111; border-radius: 999px; color: #111; background: none; font: 11px/1.3 'Library ALSO Camera', sans-serif; cursor: pointer; }.also-packages button[aria-pressed=true] { background: #b1ff8f; box-shadow: 0 1px 0 #111; }.also-packages button:disabled { opacity: .4; cursor: default; }.also-packages button svg { flex: none; }.also-packages :focus-visible { outline: 2px solid #111; outline-offset: 3px; }.also-packages__sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
@media(max-width: 420px) { .also-packages th, .also-packages td { padding-left: 5px; padding-right: 5px; }.also-packages thead th { font-size: 15px; }.also-packages th img { height: 65px; }.also-packages tbody td { font-size: 10px; }.also-packages h3 { font-size: 23px; } }
</style>
