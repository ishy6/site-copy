<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowDownRight, ArrowUpRight, Menu, X } from 'lucide-vue-next'

export interface NavigationItem {
  label: string
  description?: string
}
const props = withDefaults(defineProps<{
  items?: NavigationItem[]
  activeIndex?: number
  contactLabel?: string
  showContact?: boolean
}>(), {
  activeIndex: 0,
  contactLabel: 'Contact',
  showContact: true,
  items: () => [
    { label: 'The Sphere Lab', description: 'Experimentation, research & development.' },
    { label: 'Join The Team', description: 'A shared ambition. A collective drive.' },
    { label: 'Invest', description: 'Better products. Greater possibilities.' },
  ],
})
const emit = defineEmits<{ navigate: [index: number]; contact: [] }>()
const id = useId()
const selected = ref(Math.max(0, Math.min(props.activeIndex, props.items.length - 1)))
const expanded = ref(false)
const current = computed(() => props.items[selected.value] ?? props.items[0])
const progress = computed(() => props.items.length <= 1 ? 100 : Math.max(0, selected.value) / (props.items.length - 1) * 100)
function select(index: number) {
  selected.value = index
  expanded.value = false
  emit('navigate', index)
}
watch(() => props.activeIndex, value => { selected.value = Math.max(0, Math.min(value, props.items.length - 1)) })
watch(() => props.items.length, value => { selected.value = Math.max(0, Math.min(selected.value, value - 1)) })
</script>

<template>
  <section class="progress-navigation">
    <div class="nav-heading"><img src="/assets/tsi/logo-small.svg" alt="21TSI" width="72" height="22"><button class="mobile-toggle" type="button" :aria-label="expanded ? 'Close navigation' : 'Open navigation'" :aria-expanded="expanded" :aria-controls="`${id}-navigation`" @click="expanded = !expanded"><X v-if="expanded" :size="20" /><Menu v-else :size="20" /></button><button v-if="showContact" class="contact-button" type="button" @click="emit('contact')"><span></span>{{ contactLabel }}<ArrowUpRight :size="15" /></button></div>
    <nav :id="`${id}-navigation`" :class="{ expanded }" aria-label="Sections"><button v-for="(item, index) in items" :key="index" type="button" :class="{ selected: selected === index }" :aria-current="selected === index ? 'page' : undefined" @click="select(index)"><span class="active-dot"></span><span>{{ item.label }}</span><span class="nav-number">0{{ index + 1 }}</span></button></nav>
    <div class="progress-line" aria-hidden="true"><span class="progress-fill" :style="{ width: `${progress}%` }"></span><i v-for="(_, index) in items" :key="index" :class="{ filled: index <= selected }" :style="{ left: `${items.length <= 1 ? 100 : index / (items.length - 1) * 100}%` }"></i></div>
    <div class="nav-current"><div><span class="section-label">EXPERIMENTATION & MOMENTUM</span><h3>{{ current?.label ?? '21TSI' }}</h3><p>{{ current?.description }}</p></div><ArrowDownRight :size="56" :stroke-width=".9" aria-hidden="true" /></div>
    <div class="nav-footer"><span>SPORT. TECHNOLOGY. INNOVATION.</span><span>{{ String(items.length ? selected + 1 : 0).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}</span></div>
  </section>
</template>

<style scoped>
@font-face{font-family:LibrarySaans;src:url('/assets/tsi/SaansVF.woff2') format('woff2');font-weight:100 900;font-display:swap}
.progress-navigation{font-family:LibrarySaans,Arial,sans-serif;background:#101211;color:#f8f8f6;box-sizing:border-box;width:100%;max-width:570px;padding:30px;letter-spacing:0;min-width:0}.progress-navigation *{box-sizing:border-box}.nav-heading{display:flex;gap:15px;align-items:center;justify-content:space-between;padding-bottom:25px}.nav-heading img{display:block;object-fit:contain;flex:none}.contact-button{display:flex;align-items:center;gap:10px;color:#f8f8f6;border:1px solid #f8f8f655;border-radius:30px;background:none;padding:9px 13px;font:inherit;font-size:10px;cursor:pointer;max-width:65%;overflow-wrap:anywhere}.contact-button>span{width:4px;height:4px;border-radius:50%;background:#f8f8f6;flex:none}.contact-button>svg{flex:none}.contact-button:hover{background:#f8f8f6;color:#101211}.contact-button:hover>span{background:#101211}nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}nav button{position:relative;display:flex;align-items:center;gap:7px;padding:10px 0 19px;border:0;color:#868c88;background:none;font:inherit;font-size:11px;text-align:left;text-transform:uppercase;cursor:pointer;overflow-wrap:anywhere}.active-dot{width:4px;height:4px;flex:none;border-radius:50%;background:currentColor;opacity:0}nav button.selected{color:#f8f8f6}nav button.selected .active-dot{opacity:1}.nav-number{display:none}.progress-line{height:1px;position:relative;margin:0 4px;background:#f8f8f638}.progress-fill{position:absolute;left:0;top:0;height:1px;background:#f8f8f6;transition:width .4s}.progress-line i{position:absolute;top:-2px;width:5px;height:5px;border-radius:50%;transform:translateX(-50%);background:#5b605c}.progress-line i.filled{background:#f8f8f6}.nav-current{display:flex;justify-content:space-between;gap:20px;min-height:179px;align-items:center;padding:26px 0 29px}.nav-current>div{min-width:0}.section-label{font-size:7px;color:#9ca39c}.nav-current h3{font-size:39px;line-height:1.05;font-weight:300;margin:13px 0 10px;overflow-wrap:anywhere}.nav-current p{font-size:11px;color:#939a95;margin:0;line-height:1.5}.nav-current>svg{flex:none;color:#bdc7bc}.nav-footer{display:flex;justify-content:space-between;gap:16px;color:#818b82;font-size:7px;border-top:1px solid #f8f8f629;padding-top:13px}.nav-footer>span:last-child{flex:none;font-variant-numeric:tabular-nums}button:focus-visible{outline:1px solid #d2e4aa;outline-offset:4px}.mobile-toggle{display:none;background:none;border:0;color:inherit;width:32px;height:32px;place-items:center;cursor:pointer}@container (max-width:400px){.progress-navigation{padding:25px}.progress-navigation .contact-button{display:none}.progress-navigation .mobile-toggle{display:grid}.progress-navigation .nav-current h3{font-size:32px}.progress-navigation .nav-current>svg{width:38px}.progress-navigation nav{display:none;grid-template-columns:1fr;gap:0;padding-bottom:17px}.progress-navigation nav.expanded{display:grid}.progress-navigation nav button{padding:12px 0}.progress-navigation .nav-number{display:block;margin-left:auto;color:#818b82}.progress-navigation .nav-current{min-height:205px}}@media(max-width:400px){.progress-navigation{padding:25px}.contact-button{display:none}.mobile-toggle{display:grid}.nav-current h3{font-size:32px}.nav-current>svg{width:38px}nav{display:none;grid-template-columns:1fr;gap:0;padding-bottom:17px}nav.expanded{display:grid}nav button{padding:12px 0}.nav-number{display:block;margin-left:auto;color:#818b82}.nav-current{min-height:205px}}@media(prefers-reduced-motion:reduce){.progress-fill{transition:none}}
</style>

<style scoped>
.progress-navigation{container-type:inline-size}
</style>
