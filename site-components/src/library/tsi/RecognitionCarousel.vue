<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
export interface RecognitionItem { label: string; headline: string; detail: string }
const props = withDefaults(defineProps<{ eyebrow?: string; initialIndex?: number; items?: RecognitionItem[] }>(), {
  eyebrow: 'Recognition', initialIndex: 0,
  items: () => [
    { label: 'Global Revenue', headline: 'Over 40M', detail: 'Bootstrapped in revenue without external investments.' },
    { label: 'Customer Base', headline: '100k customers', detail: 'Approaching a global community of sports-minded consumers.' },
    { label: 'Brand Recognition', headline: '7 & 8 figures', detail: 'Maddle, Montreal Weights, Ascend, Nordik, and more.' },
  ],
})
const emit = defineEmits<{ change: [index: number] }>()
const id = useId()
const selected = ref(Math.max(0, Math.min(props.initialIndex, props.items.length - 1)))
const active = computed(() => props.items[selected.value])
watch(() => props.initialIndex, value => { selected.value = Math.max(0, Math.min(value, props.items.length - 1)) })
watch(() => props.items.length, value => { selected.value = Math.max(0, Math.min(selected.value, value - 1)) })
function select(index: number) { if (!props.items.length) return; selected.value = (index + props.items.length) % props.items.length; emit('change', selected.value) }
function keydown(event: KeyboardEvent, index: number) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  select(event.key === 'Home' ? 0 : event.key === 'End' ? props.items.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1))
  document.getElementById(`${id}-tab-${selected.value}`)?.focus()
}
</script>
<template><section class="recognition-carousel" :aria-label="eyebrow"><header><span>{{ eyebrow }}</span><div><button type="button" aria-label="Previous achievement" :disabled="items.length < 2" @click="select(selected - 1)"><ArrowLeft :size="17" /></button><button type="button" aria-label="Next achievement" :disabled="items.length < 2" @click="select(selected + 1)"><ArrowRight :size="17" /></button></div></header><div v-if="active" :id="`${id}-panel`" class="achievement" role="tabpanel" :aria-labelledby="`${id}-tab-${selected}`"><h3 :key="active.headline">{{ active.headline }}</h3><p>{{ active.detail }}</p></div><p v-else class="empty">No achievements.</p><div class="achievement-tabs" role="tablist" aria-label="Achievements"><button v-for="(item,index) in items" :id="`${id}-tab-${index}`" :key="index" type="button" role="tab" :aria-selected="selected === index" :aria-controls="`${id}-panel`" :tabindex="selected === index ? 0 : -1" @click="select(index)" @keydown="keydown($event,index)"><span>{{ String(index + 1).padStart(2,'0') }}</span><i aria-hidden="true"></i><strong>{{ item.label }}</strong></button></div></section></template>
<style scoped>
@font-face{font-family:LibrarySaans;src:url('/assets/tsi/SaansVF.woff2') format('woff2');font-weight:100 900;font-display:swap}
.recognition-carousel{font-family:LibrarySaans,Arial,sans-serif;background:#101913;color:#f8f8f6;width:100%;max-width:650px;padding:31px;min-width:0;box-sizing:border-box;letter-spacing:0}.recognition-carousel *{box-sizing:border-box}header{display:flex;align-items:center;justify-content:space-between;gap:15px}header>span{text-transform:uppercase;font-size:10px}header>div{display:flex;gap:6px}button{font:inherit;cursor:pointer;color:inherit;background:none;border:0}header button{width:29px;height:29px;display:inline-grid;place-items:center;border:1px solid #edf2ed35;border-radius:50%}button:disabled{opacity:.3;cursor:default}.achievement{padding:28px 0 37px;min-height:222px}.achievement h3{font-size:60px;line-height:1;font-weight:300;margin:0;overflow-wrap:anywhere;animation:reveal .3s ease}.achievement p{font-size:17px;line-height:1.4;font-weight:300;max-width:400px;margin:18px 0 0;color:#b5c0b7;overflow-wrap:anywhere}.achievement-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:19px}.achievement-tabs button{text-align:left;padding:0;min-width:0}.achievement-tabs span{font-size:9px;color:#92a091}.achievement-tabs i{display:block;height:1px;background:#566253;margin:10px 0 11px}.achievement-tabs strong{display:block;font-size:10px;font-weight:400;color:#8b978e;overflow-wrap:anywhere}.achievement-tabs [aria-selected=true] strong{color:#f8f8f6}.achievement-tabs [aria-selected=true] i{background:#d2e4aa}button:focus-visible{outline:1px solid #d2e4aa;outline-offset:5px}.empty{padding:50px 0;font-size:14px}@keyframes reveal{from{opacity:.3;transform:translateY(6px)}to{opacity:1;transform:none}}@media(max-width:450px){.recognition-carousel{padding:24px}.achievement{min-height:240px;padding:26px 0}.achievement h3{font-size:39px}.achievement p{font-size:14px}.achievement-tabs{gap:10px}.achievement-tabs strong{font-size:9px}}@media(prefers-reduced-motion:reduce){.achievement h3{animation:none}}
</style>
