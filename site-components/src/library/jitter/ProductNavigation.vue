<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { ArrowUpRight, ChevronDown, Layers, Menu, Sparkles, Users, X } from 'lucide-vue-next'

export interface ProductLink { label: string; target: string; description?: string }
const props = withDefaults(defineProps<{ cta?: string; active?: string; defaultOpen?: boolean; links?: ProductLink[]; products?: ProductLink[] }>(), {
  cta: 'Try for free', active: 'Templates', defaultOpen: true,
  links: () => [{ label: 'Templates', target: '/templates' }, { label: 'Pricing', target: '/pricing' }],
  products: () => [{ label: 'Meet your new motion tool', target: '/#product', description: 'From first idea to final export.' }, { label: 'Powerful. Playful. All yours.', target: '/#features', description: 'Explore the features.' }, { label: 'Made for creative teams', target: '/#collaboration', description: 'Bring everyone into the flow.' }],
})
const emit = defineEmits<{ navigate: [target: string]; start: [] }>()
const id = useId()
const open = ref(props.defaultOpen)
const mobile = ref(false)
const trigger = ref<HTMLButtonElement>()
const mobileTrigger = ref<HTMLButtonElement>()
watch(() => props.defaultOpen, value => { open.value = value })
function navigate(target: string) { open.value = false; mobile.value = false; emit('navigate', target) }
function close() { if (open.value || mobile.value) { const target = mobile.value ? mobileTrigger.value : trigger.value; open.value = false; mobile.value = false; target?.focus() } }
</script>

<template>
  <header class="product-navigation" @keydown.esc.stop="close">
    <div class="nav-bar"><button class="logo" type="button" aria-label="Jitter home" @click="navigate('/')"><img src="/assets/jitter/jitter.svg" alt="Jitter" width="64" height="25"></button><nav class="desktop-links" aria-label="Product navigation"><button ref="trigger" type="button" :aria-expanded="open" :aria-controls="`${id}-products`" @click="open = !open">Product<ChevronDown :size="12" /></button><button v-for="item in links" :key="item.target" type="button" :aria-current="active === item.label ? 'page' : undefined" @click="navigate(item.target)">{{ item.label }}</button></nav><button class="start-button" type="button" @click="emit('start')">{{ cta }}</button><button ref="mobileTrigger" class="menu-button" type="button" :aria-expanded="mobile" :aria-controls="`${id}-mobile`" :aria-label="mobile ? 'Close menu' : 'Open menu'" @click="mobile = !mobile"><X v-if="mobile" :size="20" /><Menu v-else :size="20" /></button></div>
    <div v-show="open" :id="`${id}-products`" class="product-menu"><button v-for="(item, index) in products" :key="item.target" type="button" @click="navigate(item.target)"><span class="product-icon" :class="`tone-${index % 3}`"><component :is="[Layers, Sparkles, Users][index % 3]" :size="18" /></span><span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span><ArrowUpRight :size="15" /></button></div>
    <nav v-if="mobile" :id="`${id}-mobile`" class="mobile-links" aria-label="Mobile navigation"><button v-for="item in [...products, ...links]" :key="item.target" type="button" @click="navigate(item.target)">{{ item.label }}<ArrowUpRight :size="15" /></button></nav>
  </header>
</template>

<style scoped>
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-400.woff2') format('woff2');font-weight:400;font-display:swap}
.product-navigation{width:100%;max-width:650px;min-width:0;font-family:LibraryLausanne,Arial,sans-serif;color:#19181b;letter-spacing:0}.product-navigation *{box-sizing:border-box}.nav-bar{display:flex;align-items:center;gap:18px;border-bottom:1px solid #e7e5e9;background:white;padding:18px 20px;min-height:73px}button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}.logo{padding:0;flex:none}.logo img{display:block}.desktop-links{display:flex;align-items:center;gap:18px;margin-left:auto}.desktop-links button{display:flex;align-items:center;gap:5px;padding:8px 0;font-size:12px}.desktop-links button[aria-current]{color:#8055cf}.start-button{background:#19181b;color:white;padding:11px 13px;border-radius:5px;font-size:11px;overflow-wrap:anywhere}.product-menu{width:360px;max-width:100%;padding:11px;background:#fff;margin:10px 0 0 auto;border:1px solid #e9e7ec;border-radius:8px;box-shadow:0 8px 24px #19181b08}.product-menu>button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 9px;text-align:left;border-radius:4px}.product-menu>button:hover{background:#f5f3f8}.product-menu>button>span:nth-child(2){min-width:0;flex:1}.product-menu strong{display:block;font-size:12px;font-weight:600;line-height:1.4;overflow-wrap:anywhere}.product-menu small{display:block;font-size:10px;color:#858088;line-height:1.5;margin-top:3px}.product-menu>button>svg{flex:none}.product-icon{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:5px;background:#e9e4ee}.product-icon.tone-1{background:#e4d8f7}.product-icon.tone-2{background:#e9f2d9}.menu-button{display:none;width:32px;height:32px;place-items:center;flex:none}.mobile-links{display:none;background:#fff;padding:10px 18px}.mobile-links button{display:flex;justify-content:space-between;gap:10px;align-items:center;width:100%;padding:12px 0;border-bottom:1px solid #eee;font-size:12px;text-align:left}.mobile-links svg{flex:none}button:focus-visible{outline:2px solid #8055cf;outline-offset:3px}@media(max-width:560px){.desktop-links{display:none}.nav-bar{gap:10px;padding:16px 13px}.start-button{margin-left:auto;font-size:10px;padding:10px}.menu-button{display:grid}.product-menu{display:none!important}.mobile-links{display:block}}
</style>
