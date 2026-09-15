<script setup lang="ts">
import { nextTick, ref, watch, useId } from 'vue'
import { ArrowUpRight, Menu, X } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ initiallyOpen?: boolean; language?: string; links?: { label: string; href?: string }[] }>(), { initiallyOpen: true, language: 'EN', links: () => [{ label: 'Lineup' }, { label: 'About' }, { label: 'Shoplist' }] })
const emit = defineEmits<{ navigate: [link: { label: string; href?: string }]; 'language-change': [language: string]; 'open-change': [open: boolean] }>()
const open = ref(props.initiallyOpen)
const trigger = ref<HTMLButtonElement>()
const id = useId()
watch(() => props.initiallyOpen, value => { open.value = value })
watch(open, value => emit('open-change', value))
async function close() { open.value = false; await nextTick(); trigger.value?.focus() }
</script>
<template>
  <section class="shupatto-nav" @keydown.esc="close"><header><span>Shupatto</span><button ref="trigger" type="button" :aria-expanded="open" :aria-controls="id" aria-label="Toggle Shupatto menu" @click="open = !open"><component :is="open ? X : Menu" :size="18" /><span>{{ open ? 'CLOSE' : 'MENU' }}</span></button></header><nav v-if="open" :id="id" aria-label="Shupatto navigation"><component :is="link.href ? 'a' : 'button'" v-for="link in links" :key="link.label" :href="link.href" :type="link.href ? undefined : 'button'" @click="emit('navigate', link); open = false"><span>{{ link.label }}</span><ArrowUpRight :size="24" /></component><footer><span>marna corporation</span><select :value="language" aria-label="Language" @change="emit('language-change', ($event.target as HTMLSelectElement).value)"><option>EN</option><option>JA</option></select></footer></nav></section>
</template>
<style scoped>
@font-face { font-family: 'Library Shupatto'; src: url('/assets/shupatto/tt-fors.woff2'); font-display: swap; }
.shupatto-nav { width: min(100%, 580px); padding: 20px 27px; color: #272726; background: #e8e8e8; font: 13px/1.4 'Library Shupatto', Arial, sans-serif; }
.shupatto-nav header { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
.shupatto-nav header > span { font-size: 28px; }
.shupatto-nav header button { display: flex; align-items: center; gap: 7px; min-width: 86px; height: 57px; justify-content: center; border: 1px solid #272726; border-radius: 50%; color: inherit; background: transparent; font-size: 10px; cursor: pointer; }
.shupatto-nav nav { padding: 18px 0 0; }
.shupatto-nav nav > a, .shupatto-nav nav > button { display: flex; align-items: center; justify-content: space-between; gap: 15px; width: 100%; padding: 14px 0; border: 0; border-bottom: 1px solid #27272635; background: none; font: 25px/1.2 'Library Shupatto', Arial, sans-serif; color: inherit; text-decoration: none; cursor: pointer; text-align: left; }
.shupatto-nav footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 20px; font-size: 11px; }
.shupatto-nav select { background: none; border: 0; color: inherit; font: inherit; padding: 4px; }
@media(max-width: 420px) { .shupatto-nav { padding: 18px; } .shupatto-nav header > span { font-size: 23px; } .shupatto-nav header button { min-width: 68px; height: 48px; } .shupatto-nav header button span { display: none; } }
</style>
