<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, X, ZoomIn } from 'lucide-vue-next'
import { triGlidePhotos, type ProductPhoto } from './gallery-data'

const props = withDefaults(defineProps<{ title?: string; photos?: ProductPhoto[]; initialIndex?: number; showThumbnails?: boolean }>(), {
  title: 'Tri-Glide Belt', photos: () => triGlidePhotos, initialIndex: 0, showThumbnails: true,
})
const emit = defineEmits<{ change: [photo: ProductPhoto, index: number] }>()
const index = ref(0)
const photo = computed(() => props.photos[index.value])
const dialog = ref<HTMLDialogElement>()
const zoomButton = ref<HTMLButtonElement>()
watch(() => [props.initialIndex, props.photos] as const, () => { index.value = Math.max(0, Math.min(Math.trunc(props.initialIndex) || 0, props.photos.length - 1)) }, { immediate: true })
function select(next: number) {
  if (!props.photos.length) return
  index.value = (next + props.photos.length) % props.photos.length
  emit('change', props.photos[index.value]!, index.value)
}
function keyboard(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') { event.preventDefault(); select(index.value + 1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); select(index.value - 1) }
  if (event.key === 'Home') { event.preventDefault(); select(0) }
  if (event.key === 'End') { event.preventDefault(); select(props.photos.length - 1) }
}
async function zoom() { await nextTick(); dialog.value?.showModal() }
function close() { dialog.value?.close(); zoomButton.value?.focus() }
</script>

<template>
  <section class="makr-gallery" :aria-label="`${title} image gallery`" @keydown="keyboard">
    <header><h3>{{ title }}</h3><span role="status">{{ photos.length ? index + 1 : 0 }} / {{ photos.length }}</span></header>
    <div class="makr-gallery__stage">
      <img v-if="photo" :src="photo.src" :alt="photo.alt" />
      <p v-else>No product images available.</p>
      <button v-if="photo" ref="zoomButton" class="makr-gallery__zoom" type="button" aria-label="Enlarge product image" title="Enlarge product image" @click="zoom"><ZoomIn :size="18" /></button>
    </div>
    <div class="makr-gallery__caption"><p>{{ photo?.caption ?? photo?.alt }}</p><div><button type="button" aria-label="Previous image" title="Previous image" :disabled="photos.length < 2" @click="select(index - 1)"><ArrowLeft :size="17" /></button><button type="button" aria-label="Next image" title="Next image" :disabled="photos.length < 2" @click="select(index + 1)"><ArrowRight :size="17" /></button></div></div>
    <div v-if="showThumbnails && photos.length > 1" class="makr-gallery__thumbs" role="group" aria-label="Product images">
      <button v-for="(item, i) in photos" :key="item.id" type="button" :aria-label="`Show image ${i + 1}: ${item.alt}`" :aria-pressed="index === i" @click="select(i)"><img :src="item.src" :alt="item.alt" loading="lazy" /></button>
    </div>
    <dialog ref="dialog" class="makr-gallery__dialog" :aria-label="`${title} enlarged image`" @cancel.prevent="close" @click="($event.target === dialog) && close()">
      <div class="makr-gallery__viewer"><button class="makr-gallery__close" type="button" aria-label="Close enlarged image" title="Close enlarged image" @click="close"><X :size="22" /></button><img v-if="photo" :src="photo.src" :alt="photo.alt" /><div class="makr-gallery__viewer-controls"><button type="button" aria-label="Previous enlarged image" :disabled="photos.length < 2" @click="select(index - 1)"><ArrowLeft :size="20" /></button><p>{{ photo?.caption }}</p><button type="button" aria-label="Next enlarged image" :disabled="photos.length < 2" @click="select(index + 1)"><ArrowRight :size="20" /></button></div></div>
    </dialog>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library MAKR'; src: url('/assets/makr/soehne-web-buch.woff2') format('woff2'); font-display: swap; }
.makr-gallery { width: min(100%, 490px); font: 12px/1.4 'Library MAKR', Arial, sans-serif; color: #1c1717; letter-spacing: 0; }
.makr-gallery, .makr-gallery * { box-sizing: border-box; }
.makr-gallery header, .makr-gallery__caption, .makr-gallery__caption > div { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.makr-gallery h3, .makr-gallery p { font: inherit; margin: 0; overflow-wrap: anywhere; }
.makr-gallery header { margin-bottom: 12px; }.makr-gallery header span { flex: none; color: #77766e; font-size: 10px; }
.makr-gallery__stage { position: relative; aspect-ratio: 2.1; display: grid; place-items: center; background: #f0f0ed; overflow: hidden; }
.makr-gallery__stage > img { position: absolute; width: 100%; height: 100%; object-fit: contain; }
.makr-gallery button { display: grid; place-items: center; flex: none; width: 30px; height: 30px; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; }
.makr-gallery button:disabled { opacity: .3; cursor: default; }.makr-gallery button:focus-visible { outline: 2px solid #1c1717; outline-offset: 3px; }
.makr-gallery__stage .makr-gallery__zoom { position: absolute; bottom: 10px; right: 10px; background: #fff; border-radius: 50%; }
.makr-gallery__caption { margin: 9px 0; min-height: 30px; }.makr-gallery__caption p { color: #77766e; font-size: 11px; }
.makr-gallery__thumbs { display: flex; gap: 8px; overflow: auto; padding: 3px; }
.makr-gallery__thumbs button { width: 48px; height: 43px; border: 1px solid transparent; }
.makr-gallery__thumbs button[aria-pressed=true] { border-color: #1c1717; }.makr-gallery__thumbs img { width: 100%; height: 100%; object-fit: contain; }
.makr-gallery__dialog { width: min(90vw, 900px); max-width: calc(100vw - 24px); max-height: calc(100dvh - 24px); padding: 16px; border: 0; color: #1c1717; background: #f6f6f2; }
.makr-gallery__dialog::backdrop { background: #181816bb; }.makr-gallery__viewer { position: relative; }
.makr-gallery__viewer > img { display: block; width: 100%; height: min(70dvh, 650px); object-fit: contain; }
.makr-gallery__viewer .makr-gallery__close { position: absolute; top: 0; right: 0; background: #fff; }
.makr-gallery__viewer-controls { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.makr-gallery__viewer-controls p { text-align: center; font: 12px/1.4 'Library MAKR', sans-serif; }
@media (prefers-reduced-motion: reduce) { .makr-gallery * { scroll-behavior: auto; } }
</style>
