<script setup lang="ts">
import { nextTick, ref, watch, useId } from 'vue'
import { ArrowUpRight, Asterisk, Menu, X } from 'lucide-vue-next'
import MotionButton from './MotionButton.vue'
const props = withDefaults(defineProps<{
  brand?: string; initiallyOpen?: boolean; joinLabel?: string
  items?: { label: string; href?: string; group: string }[]
}>(), { brand: 'Osmo', initiallyOpen: true, joinLabel: 'Join', items: () => [
  { label: 'The Vault', group: 'Our products' }, { label: 'Page Transition Course', group: 'Our products' },
  { label: 'Button Pack', group: 'Our products' }, { label: 'Showcase', group: 'Explore' }, { label: 'Collection', group: 'Explore' }, { label: 'Pricing', group: 'Explore' },
] })
const emit = defineEmits<{ navigate: [item: { label: string; href?: string; group: string }]; join: []; 'open-change': [open: boolean] }>()
const open = ref(props.initiallyOpen)
const trigger = ref<HTMLButtonElement>()
const id = useId()
watch(() => props.initiallyOpen, value => { open.value = value })
watch(open, value => emit('open-change', value))
async function close() { open.value = false; await nextTick(); trigger.value?.focus() }
</script>
<template>
  <div class="osmo-nav" @keydown.esc.stop="close">
    <nav aria-label="Osmo navigation"><button ref="trigger" type="button" :aria-expanded="open" :aria-controls="id" aria-label="Toggle menu" @click="open = !open"><component :is="open ? X : Menu" :size="17" /><span>Menu</span></button><span class="osmo-nav__brand">{{ brand }}<Asterisk :size="22" /></span><button type="button" class="osmo-nav__join" @click="$emit('join')">{{ joinLabel }}<ArrowUpRight :size="16" /></button></nav>
    <div v-if="open" :id="id" class="osmo-nav__body">
      <div v-for="group in [...new Set(items.map(item => item.group))]" :key="group" class="osmo-nav__group"><h3>{{ group }}</h3><component :is="item.href ? 'a' : 'button'" v-for="item in items.filter(item => item.group === group)" :key="item.label" :href="item.href" :type="item.href ? undefined : 'button'" @click="emit('navigate', item); open = false">{{ item.label }}</component></div>
      <div class="osmo-nav__feature"><img src="/assets/osmo/toolkit-course.avif" alt="Page transition course" /><MotionButton label="Discover" variant="lime" @click="$emit('navigate', { label: 'Page Transition Course', group: 'Our products' })" /></div>
    </div>
  </div>
</template>
<style scoped>
.osmo-nav { width: min(100%, 640px); color: #f4f4f4; background: #201d1d; border-radius: 4px; font: 14px/1.4 'Haffer', Arial, sans-serif; overflow: hidden; }
.osmo-nav nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 60px; padding: 12px 18px; }
.osmo-nav nav button { display: flex; align-items: center; gap: 8px; border: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
.osmo-nav__brand { display: flex; align-items: center; gap: 6px; font-size: 22px; font-weight: 600; }
.osmo-nav .osmo-nav__join { background: #b1ff69; color: #201d1d; border-radius: 3px; padding: 8px 12px; }
.osmo-nav__body { display: grid; grid-template-columns: 1.1fr .8fr 1fr; gap: 24px; padding: 24px; border-top: 1px solid #ffffff20; }
.osmo-nav__group { min-width: 0; display: flex; flex-direction: column; align-items: start; gap: 17px; }
.osmo-nav h3 { font-size: 10px; color: #a59f9a; font-weight: 400; margin: 0 0 6px; }
.osmo-nav__group > a, .osmo-nav__group > button { padding: 0; border: 0; text-decoration: none; text-align: left; background: none; font: inherit; color: inherit; cursor: pointer; overflow-wrap: anywhere; }
.osmo-nav__group > :hover { color: #b1ff69; }
.osmo-nav__feature { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.osmo-nav__feature img { width: 100%; aspect-ratio: 1.3; object-fit: cover; border-radius: 3px; }
.osmo-nav__feature :deep(.osmo-button) { min-height: 36px; padding: 8px 12px; font-size: 13px; gap: 12px; }
.osmo-nav button:focus-visible, .osmo-nav a:focus-visible { outline: 2px solid #b1ff69; outline-offset: 3px; }
@media(max-width: 520px) { .osmo-nav__body { grid-template-columns: 1fr 1fr; gap: 22px 14px; padding: 18px; } .osmo-nav__feature { grid-column: 1 / -1; flex-direction: row; align-items: center; } .osmo-nav__feature img { width: 90px; aspect-ratio: 1.5; } .osmo-nav nav { gap: 6px; padding: 12px; } .osmo-nav nav button > span { display: none; } .osmo-nav__brand { font-size: 19px; } }
</style>
