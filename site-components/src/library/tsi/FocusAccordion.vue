<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

export interface FocusItem {
  title: string
  description: string
  image: string
  imageAlt: string
}
const props = withDefaults(defineProps<{
  title?: string
  items?: FocusItem[]
  defaultOpen?: number
  showImage?: boolean
}>(), {
  title: 'Our Focus',
  defaultOpen: 0,
  showImage: true,
  items: () => [
    { title: 'Sportware', description: 'Original, sports-centred hardware. Born out of insights and intelligence, built to give every movement an edge.', image: '/assets/tsi/focus-1.webp', imageAlt: 'Sportware development at the Sphere Lab' },
    { title: 'Wearable Technology', description: 'Technology that learns, improves, guides, and accompanies athletes through every facet of their sports activity.', image: '/assets/tsi/focus-2.webp', imageAlt: 'Wearable technology research' },
    { title: 'AI Assisted Training', description: 'Movement detection, workout tracking, and technique correction. Better feedback from your body, every day.', image: '/assets/tsi/focus-3.webp', imageAlt: 'AI assisted athletic training' },
    { title: 'Virtual Coaching', description: 'Personalized nutrition, customized workouts, and great advice that is always on the move.', image: '/assets/tsi/focus-4.webp', imageAlt: 'Virtual coaching and training' },
  ],
})
const emit = defineEmits<{ change: [index: number | null] }>()
const id = useId()
const openIndex = ref<number | null>(props.defaultOpen)
const active = computed(() => openIndex.value === null ? null : props.items[openIndex.value] ?? null)
const imageFailed = ref(false)
function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
  emit('change', openIndex.value)
}
watch(() => props.defaultOpen, value => { openIndex.value = value >= 0 && value < props.items.length ? value : null })
watch(active, () => { imageFailed.value = false })
watch(() => props.items.length, value => { if (openIndex.value !== null && openIndex.value >= value) openIndex.value = null })
</script>

<template>
  <section class="focus-accordion" :aria-label="title">
    <header><span>THE SPHERE LAB</span><h3>{{ title }}</h3></header>
    <div class="focus-layout" :class="{ 'no-image': !showImage }">
      <div class="focus-list">
        <article v-for="(item, index) in items" :key="index" :class="{ active: openIndex === index }">
          <button type="button" :aria-expanded="openIndex === index" :aria-controls="`${id}-panel-${index}`" :id="`${id}-trigger-${index}`" @click="toggle(index)"><span class="focus-number">.{{ String(index + 1).padStart(2, '0') }}</span><span>{{ item.title }}</span><Minus v-if="openIndex === index" :size="15" /><Plus v-else :size="15" /></button>
          <div v-show="openIndex === index" :id="`${id}-panel-${index}`" class="focus-body" role="region" :aria-labelledby="`${id}-trigger-${index}`"><p>{{ item.description }}</p></div>
        </article>
        <p v-if="!items.length" class="focus-empty">No focus areas.</p>
      </div>
      <div v-if="showImage" class="focus-media" :class="{ empty: !active || imageFailed }"><img v-if="active && !imageFailed" :key="active.image" :src="active.image" :alt="active.imageAlt" @error="imageFailed = true"><span v-else>21TSI</span><span v-if="active" class="image-number">.{{ String((openIndex ?? 0) + 1).padStart(2, '0') }}</span></div>
    </div>
    <footer><span>EXPERIMENTATION / RESEARCH / DEVELOPMENT</span><span>21TSI</span></footer>
  </section>
</template>

<style scoped>
@font-face{font-family:LibrarySaans;src:url('/assets/tsi/SaansVF.woff2') format('woff2');font-weight:100 900;font-display:swap}
.focus-accordion{font-family:LibrarySaans,Arial,sans-serif;color:#f1f3f2;background:#101913;width:100%;max-width:570px;min-width:0;padding:27px;box-sizing:border-box;letter-spacing:0}.focus-accordion *{box-sizing:border-box}header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:23px}header>span{font-size:8px;line-height:1.4;padding-top:5px;max-width:80px}h3{font-size:35px;line-height:1.05;font-weight:300;margin:0;overflow-wrap:anywhere;text-align:right}.focus-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:22px}.focus-list{min-width:0}.focus-list article{border-top:1px solid #f1f3f239}.focus-list article:last-child{border-bottom:1px solid #f1f3f239}.focus-list button{display:flex;align-items:center;gap:10px;width:100%;padding:14px 0;min-height:44px;border:0;background:none;color:#a6afa8;text-align:left;font:inherit;font-size:11px;cursor:pointer}.focus-list button>span:nth-child(2){flex:1;overflow-wrap:anywhere}.focus-list button>svg{flex:none}.focus-list .active button{color:#f1f3f2}.focus-number{font-size:9px;flex:none;align-self:flex-start;padding-top:2px;width:21px}.focus-list button:focus-visible{outline:1px solid #d2e4aa;outline-offset:2px}.focus-body{padding:0 0 15px 31px}.focus-body p{font-size:11px;line-height:1.45;color:#b4bcb6;margin:0}.focus-media{position:relative;align-self:stretch;min-height:238px;overflow:hidden;background:#233227}.focus-media img{display:block;width:100%;height:100%;position:absolute;inset:0;object-fit:cover;animation:focus-reveal .45s ease}.focus-media.empty{display:grid;place-items:center;color:#d2e4aa;font-size:23px}.image-number{position:absolute;right:12px;bottom:11px;color:#fff;font-size:14px;text-shadow:0 1px 5px #000}footer{display:flex;gap:14px;justify-content:space-between;margin-top:23px;color:#7d8a80;font-size:6px;line-height:1.4}footer>span:last-child{flex:none}.focus-empty{font-size:12px;color:#a6afa8}@keyframes focus-reveal{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:scale(1)}}@container (max-width:420px){.focus-accordion{padding:22px}.focus-layout{grid-template-columns:1fr}.focus-media{min-height:150px;max-height:170px;aspect-ratio:1.8}.focus-accordion header{padding-bottom:20px}.focus-accordion h3{font-size:30px}.focus-list button{font-size:12px}.focus-body p{font-size:12px}.focus-accordion footer{font-size:6px}}@media(max-width:420px){.focus-accordion{padding:22px}.focus-layout{grid-template-columns:1fr}.focus-media{min-height:150px;aspect-ratio:1.8}.focus-accordion h3{font-size:30px}}@media(prefers-reduced-motion:reduce){.focus-media img{animation:none}}
</style>

<style scoped>
.focus-accordion{container-type:inline-size}.focus-layout.no-image{grid-template-columns:1fr}.focus-media{width:100%;min-width:0;max-width:100%}
</style>
