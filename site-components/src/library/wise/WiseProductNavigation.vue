<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-vue-next'
import { wiseNavigationItems, type WiseNavigationItem } from './wiseNavigation'
import WiseBrandMark from './WiseBrandMark.vue'

const props = withDefaults(defineProps<{ items?: WiseNavigationItem[]; initialSection?: string; initiallyOpen?: boolean; registrationHref?: string }>(), {
  items: () => wiseNavigationItems, initialSection: 'personal', initiallyOpen: true, registrationHref: 'https://wise.com/register',
})
const emit = defineEmits<{ navigate: [href: string]; 'update:section': [id: string] }>()
const panelId = useId()
const open = ref(props.initiallyOpen)
const activeId = ref(props.initialSection)
const active = computed(() => props.items.find(item => item.id === activeId.value) ?? props.items[0])
const triggers = ref<HTMLButtonElement[]>([])
const menuButton = ref<HTMLButtonElement>()
watch(() => props.initialSection, value => { activeId.value = value })
watch(() => props.initiallyOpen, value => { open.value = value })
function choose(item: WiseNavigationItem) {
  open.value = activeId.value === item.id ? !open.value : true
  activeId.value = item.id
  emit('update:section', item.id)
}
function close() {
  open.value = false
  const trigger = triggers.value.find(item => item.dataset.section === active.value?.id)
  if (trigger?.offsetParent) trigger.focus()
  else menuButton.value?.focus()
}
</script>

<template>
  <header class="wise-navigation" @keydown.esc.stop.prevent="close">
    <nav class="navigation-bar" aria-label="Wise products">
      <a class="wordmark" href="https://wise.com/" aria-label="Wise home" @click="emit('navigate', 'https://wise.com/')"><WiseBrandMark /></a>
      <div class="product-tabs"><button v-for="item in items" :key="item.id" ref="triggers" type="button" :data-section="item.id" :aria-expanded="open && active?.id === item.id" :aria-controls="panelId" :class="{ active: open && active?.id === item.id }" @click="choose(item)">{{ item.label }}<ChevronDown :size="13" aria-hidden="true" /></button></div>
      <a class="register" :href="registrationHref" @click="emit('navigate', registrationHref)">Register</a>
      <button ref="menuButton" class="menu-button" type="button" :aria-expanded="open" :aria-controls="panelId" :aria-label="open ? 'Close product navigation' : 'Open product navigation'" @click="open = !open"><component :is="open ? X : Menu" :size="20" aria-hidden="true" /></button>
    </nav>
    <div v-if="open && active" :id="panelId" class="product-panel">
      <div class="mobile-sections"><button v-for="item in items" :key="item.id" type="button" :class="{ active: active.id === item.id }" :aria-pressed="active.id === item.id" @click="activeId = item.id; emit('update:section', item.id)">{{ item.label }}</button></div>
      <div class="panel-content">
        <a class="feature" :href="active.href" @click="emit('navigate', active.href)"><img :src="active.image" :alt="active.title" /><strong>{{ active.title }}</strong><p>{{ active.description }}</p><span>Explore <ArrowRight :size="15" aria-hidden="true" /></span></a>
        <nav class="product-links" :aria-label="`${active.label} links`"><span>PRODUCTS & RESOURCES</span><a v-for="link in active.links" :key="link.label" :href="link.href" @click="emit('navigate', link.href)">{{ link.label }}<ArrowRight :size="15" aria-hidden="true" /></a></nav>
      </div>
    </div>
  </header>
</template>

<style scoped>
@font-face { font-family: 'Library Wise'; src: url('/assets/wise/inter-variable.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
@font-face { font-family: 'Library Wise Heavy'; src: url('/assets/wise/wise-sans-heavy.woff2') format('woff2'); font-weight: 700; font-display: swap; }
.wise-navigation,.wise-navigation *{box-sizing:border-box}.wise-navigation{width:100%;max-width:650px;background:#fff;color:#163300;font-family:'Library Wise',Arial,sans-serif;container-type:inline-size;letter-spacing:0}.wise-navigation button,.wise-navigation a{font:inherit;color:inherit}.wise-navigation button{cursor:pointer}.wise-navigation a{text-decoration:none}.navigation-bar{display:flex;align-items:center;gap:15px;min-height:64px;padding:12px 18px;border-bottom:1px solid #d5d7d3}.wordmark{font-family:'Library Wise Heavy',Arial,sans-serif!important;font-size:32px!important;font-style:italic;line-height:1}.product-tabs{display:flex;gap:3px}.product-tabs button{display:flex;align-items:center;gap:4px;padding:8px 9px;border:0;border-radius:999px;background:transparent;font-size:11px;font-weight:650}.product-tabs button.active{background:#163300;color:#9fe870}.register{margin-left:auto;padding:10px 14px;border-radius:999px;background:#9fe870;font-size:11px!important;font-weight:650!important}.menu-button{display:none;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;background:transparent}.product-panel{padding:22px 24px}.panel-content{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);gap:28px}.feature img{display:block;width:100%;height:115px;object-fit:cover;border-radius:8px}.feature strong{display:block;margin-top:12px;font-size:17px;line-height:1.2;overflow-wrap:anywhere}.feature p{margin:7px 0 12px;color:#454745;font-size:12px;line-height:1.5}.feature>span{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:650;text-decoration:underline;text-underline-offset:3px}.product-links>span{display:block;margin:5px 0 14px;font-size:9px;color:#656864}.product-links a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 0;border-bottom:1px solid #eef0ec;font-size:12px;font-weight:650;overflow-wrap:anywhere}.product-links a svg{flex-shrink:0}.product-links a:hover{text-decoration:underline}.mobile-sections{display:none}.wise-navigation :is(a,button):focus-visible{outline:2px solid #163300;outline-offset:3px}@container(max-width:520px){.product-tabs{display:none}.menu-button{display:flex}.mobile-sections{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px}.mobile-sections button{border:0;border-radius:999px;padding:7px 10px;font-size:11px;background:#eef0ec}.mobile-sections button.active{background:#163300;color:#9fe870}.panel-content{gap:18px}.product-panel{padding:18px}.feature img{height:95px}}@container(max-width:350px){.panel-content{grid-template-columns:1fr}.feature{display:grid;grid-template-columns:74px 1fr;column-gap:10px}.feature img{grid-row:span 3;height:94px}.feature strong{margin:0;font-size:14px}.feature p{margin:4px 0;font-size:10px}.feature>span{font-size:10px}.product-links a{padding:10px 0}.product-links>span{margin-bottom:4px}.navigation-bar{gap:10px;padding:12px}.product-panel{padding:14px}.register{padding:9px 11px}}
</style>
