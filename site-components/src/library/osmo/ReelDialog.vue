<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId } from 'vue'
import { ArrowUpRight, Play, X } from 'lucide-vue-next'
withDefaults(defineProps<{ title?: string; source?: string; poster?: string }>(), { title: 'Play the reel.', source: '/assets/osmo/reel.mp4', poster: '/assets/osmo/carousel.avif' })
const emit = defineEmits<{ 'open-change': [open: boolean] }>()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const video = ref<HTMLVideoElement>()
const opened = ref(false)
const id = useId()
async function open() { opened.value = true; await nextTick(); dialog.value?.showModal(); emit('open-change', true) }
function close() { dialog.value?.close() }
function onClose() { video.value?.pause(); opened.value = false; emit('open-change', false); trigger.value?.focus() }
onBeforeUnmount(() => { video.value?.pause(); dialog.value?.close() })
</script>
<template>
  <div class="osmo-reel"><button ref="trigger" class="osmo-reel__trigger" type="button" @click="open"><img :src="poster" alt="Osmo reel preview" /><span class="osmo-reel__play"><Play :size="26" fill="currentColor" /></span><span class="osmo-reel__title">{{ title }}<ArrowUpRight :size="24" /></span></button>
    <dialog ref="dialog" :aria-labelledby="id" @close="onClose" @click="($event.target === dialog) && close()"><div class="osmo-reel__bar"><h2 :id="id">{{ title }}</h2><button type="button" aria-label="Close reel" @click="close"><X :size="20" /></button></div><video v-if="opened" ref="video" :src="source" :poster="poster" controls playsinline preload="metadata" /></dialog>
  </div>
</template>
<style scoped>
.osmo-reel { width: min(100%, 535px); color: #201d1d; font: 14px/1.4 'Haffer', Arial, sans-serif; }
.osmo-reel__trigger { position: relative; display: block; width: 100%; padding: 0; border: 0; border-radius: 4px; overflow: hidden; background: #201d1d; color: #f4f4f4; cursor: pointer; }
.osmo-reel__trigger > img { display: block; width: 100%; height: 255px; object-fit: cover; }
.osmo-reel__play { position: absolute; top: 90px; left: calc(50% - 32px); width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; background: #b1ff69; color: #201d1d; transition: transform .3s; }
.osmo-reel__trigger:hover .osmo-reel__play { transform: scale(1.12); }
.osmo-reel__title { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 22px; font: 28px/1.2 'Haffer', Arial, sans-serif; text-align: left; }
.osmo-reel dialog { width: min(900px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); box-sizing: border-box; padding: 16px; border: 0; border-radius: 5px; background: #201d1d; color: #fff; }
.osmo-reel dialog::backdrop { background: #000b; }
.osmo-reel__bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.osmo-reel__bar h2 { margin: 0; font-size: 17px; font-weight: 450; }
.osmo-reel__bar button { display: grid; place-items: center; width: 32px; height: 32px; border: 0; background: none; color: #fff; cursor: pointer; }
.osmo-reel video { display: block; width: 100%; max-height: 72dvh; }
@media(prefers-reduced-motion: reduce) { .osmo-reel__play { transition: none; } }
</style>
