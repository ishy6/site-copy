<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import { showcaseItems, type GalleryItem } from './showcases'
import { useSlides, useSlideSwipe } from './carousel'
const props = withDefaults(defineProps<{ items?: GalleryItem[]; initialIndex?: number; title?: string }>(), { items: () => showcaseItems, initialIndex: 0, title: 'Made to move.' })
const emit = defineEmits<{ change: [index: number]; select: [item: GalleryItem] }>()
const { index, move, counter, onKeydown } = useSlides(computed(() => props.items.length), toRef(props, 'initialIndex'))
const stage = ref<HTMLElement>()
watch(index, async value => {
  emit('change', value)
  const restoreFocus = stage.value?.contains(document.activeElement)
  await nextTick()
  if (restoreFocus) stage.value?.querySelector<HTMLButtonElement>('.active button')?.focus()
})
function offset(i: number) { const length = props.items.length; return length ? ((i - index.value + length + Math.floor(length / 2)) % length) - Math.floor(length / 2) : 0 }
const { begin, end, cancel, suppressDraggedClick } = useSlideSwipe(move)
</script>
<template>
  <section class="osmo-stack" :aria-label="title"><header><h2>{{ title }}</h2><span>{{ counter }}</span></header>
    <div ref="stage" class="osmo-stack__stage" @pointerdown="begin" @pointerup="end" @pointercancel="cancel" @pointerleave="cancel" @click.capture="suppressDraggedClick" @keydown="onKeydown">
      <article v-for="(item, i) in items" :key="item.id" :inert="i !== index" :aria-hidden="i !== index" :class="{ active: i === index }" :style="{ transform: `translateX(${offset(i) * 16}%) rotate(${offset(i) * 9}deg)`, zIndex: items.length - Math.abs(offset(i)) }">
        <img :src="item.image" :alt="item.title" draggable="false" /><button type="button" @click="emit('select', item)"><span>{{ item.title }}</span><ArrowUpRight :size="18" /></button>
      </article><p v-if="!items.length">No projects available.</p>
    </div><footer><button type="button" aria-label="Previous project" :disabled="items.length < 2" @click="move(-1)"><ArrowLeft :size="19" /></button><button type="button" aria-label="Next project" :disabled="items.length < 2" @click="move(1)"><ArrowRight :size="19" /></button></footer>
  </section>
</template>
<style scoped>
.osmo-stack { width: min(100%, 620px); font: 14px/1.4 'Haffer', Arial, sans-serif; color: #201d1d; }
.osmo-stack header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.osmo-stack h2 { margin: 0; font-weight: 450; font-size: 28px; }
.osmo-stack header span { font-size: 11px; }
.osmo-stack__stage { position: relative; height: 270px; display: grid; place-items: center; overflow: hidden; touch-action: pan-y; }
.osmo-stack article { position: absolute; width: min(72%, 365px); background: #fff; border-radius: 4px; overflow: hidden; transition: transform .6s cubic-bezier(.22,1,.36,1); box-shadow: 0 3px 20px #201d1d20; }
.osmo-stack article img { display: block; width: 100%; height: 190px; object-fit: cover; }
.osmo-stack article button { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 12px 15px; color: inherit; background: none; border: 0; font: inherit; text-align: left; cursor: pointer; }
.osmo-stack article button span { overflow-wrap: anywhere; }
.osmo-stack article:not(.active) { filter: brightness(.85); }
.osmo-stack footer { display: flex; gap: 10px; justify-content: center; margin-top: 15px; }
.osmo-stack footer button { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid #201d1d40; border-radius: 50%; background: none; cursor: pointer; }
@media(max-width: 420px) { .osmo-stack h2 { font-size: 24px; } .osmo-stack article { width: 78%; } .osmo-stack article img { height: 155px; } .osmo-stack article button { font-size: 12px; } }
@media(prefers-reduced-motion: reduce) { .osmo-stack article { transition: none; } }
</style>
