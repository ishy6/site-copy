<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
export interface PortfolioBrand { id: string; name: string; logo: string; category: string; description: string }
const props = withDefaults(defineProps<{ title?: string; initialIndex?: number; cta?: string; brands?: PortfolioBrand[] }>(), {
  title: 'A collective ambition.', initialIndex: 0, cta: 'Explore brand',
  brands: () => [
    { id: 'maddle', name: 'Maddle', logo: '/assets/tsi/maddle.svg', category: 'PADDLEBOARDS', description: 'A new perspective on time spent outside.' },
    { id: 'mw', name: 'Montreal Weights', logo: '/assets/tsi/mw.svg', category: 'FITNESS EQUIPMENT', description: 'A stronger everyday, built around movement.' },
    { id: 'ascend', name: 'Ascend', logo: '/assets/tsi/ascend.svg', category: 'ACTIVE LIVING', description: 'Technology and ambition moving together.' },
    { id: 'nordik', name: 'Nordik', logo: '/assets/tsi/nordik.svg', category: 'RECOVERY', description: 'Space to reset. Energy to move forward.' },
  ],
})
const emit = defineEmits<{ select: [brand: PortfolioBrand]; change: [brand: PortfolioBrand] }>()
const id = useId()
const index = ref(Math.max(0,Math.min(props.initialIndex,props.brands.length-1)))
const active = computed(() => props.brands[index.value])
watch(() => props.initialIndex, value => { index.value = Math.max(0,Math.min(value,props.brands.length-1)) })
watch(() => props.brands.length, value => { index.value = Math.max(0,Math.min(index.value,value-1)) })
function choose(value: number) { index.value = value; if (active.value) emit('change', active.value) }
</script>
<template><section class="brand-portfolio" :aria-label="title"><header><span>21TSI / OUR BRANDS</span><h3>{{ title }}</h3></header><div class="portfolio-layout"><nav aria-label="Portfolio brands"><button v-for="(brand,position) in brands" :key="brand.id" type="button" :aria-pressed="position === index" :aria-controls="`${id}-brand`" @click="choose(position)"><span>.{{ String(position+1).padStart(2,'0') }}</span><strong>{{ brand.name }}</strong><ArrowUpRight :size="15" /></button></nav><div v-if="active" :id="`${id}-brand`" class="brand-detail"><div class="brand-logo"><img :key="active.id" :src="active.logo" :alt="active.name"></div><span>{{ active.category }}</span><p>{{ active.description }}</p><button type="button" @click="emit('select',active)">{{ cta }}<ArrowUpRight :size="16" /></button></div></div></section></template>
<style scoped>
@font-face{font-family:LibrarySaans;src:url('/assets/tsi/SaansVF.woff2') format('woff2');font-weight:100 900;font-display:swap}
.brand-portfolio{width:100%;max-width:650px;min-width:0;padding:30px;background:#171b18;color:#f4f5f3;font-family:LibrarySaans,Arial,sans-serif;letter-spacing:0;box-sizing:border-box}.brand-portfolio *{box-sizing:border-box}header>span{font-size:8px;color:#96a298}h3{font-size:35px;font-weight:300;line-height:1.1;margin:15px 0 28px;overflow-wrap:anywhere}.portfolio-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:33px}nav button{display:flex;gap:11px;align-items:center;border:0;border-top:1px solid #727b724a;width:100%;padding:17px 0;color:#8e9b90;background:none;text-align:left;font:inherit;cursor:pointer}nav button:last-child{border-bottom:1px solid #727b724a}nav button[aria-pressed=true]{color:#f4f5f3}nav span{font-size:9px}nav strong{font-size:13px;font-weight:400;flex:1;overflow-wrap:anywhere}nav svg{flex:none}.brand-logo{height:98px;display:grid;place-items:center;border:1px solid #727b724a}.brand-logo img{width:70%;height:50px;object-fit:contain;animation:brand-reveal .3s ease}.brand-detail>span{display:block;font-size:7px;color:#8e9b90;margin:15px 0 10px}.brand-detail p{font-size:14px;font-weight:300;line-height:1.4;margin:0;min-height:40px;overflow-wrap:anywhere}.brand-detail>button{display:flex;gap:18px;align-items:center;justify-content:space-between;width:100%;padding:13px 0;border:0;border-bottom:1px solid #727b7270;background:none;color:inherit;font:inherit;font-size:10px;text-align:left;cursor:pointer}.brand-detail>button svg{flex:none}button:focus-visible{outline:1px solid #d2e4aa;outline-offset:3px}@keyframes brand-reveal{from{opacity:0}to{opacity:1}}@media(max-width:450px){.brand-portfolio{padding:24px}.portfolio-layout{grid-template-columns:1fr;gap:24px}h3{font-size:29px}.brand-logo{height:100px}.brand-detail p{min-height:0}}@media(prefers-reduced-motion:reduce){.brand-logo img{animation:none}}
</style>

<style scoped>
.brand-logo{background:#f4f5f3}
</style>
