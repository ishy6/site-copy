<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { products as defaults } from './products'
export type ShupattoProduct = typeof defaults[number]
const props = withDefaults(defineProps<{ products?: ShupattoProduct[]; productId?: string; initialColor?: number; showDetails?: boolean }>(), { products: () => defaults, productId: 'compactbag-m', initialColor: 0, showDetails: true })
const emit = defineEmits<{ change: [color: ShupattoProduct['colors'][number]]; select: [selection: { product: ShupattoProduct; color: ShupattoProduct['colors'][number] }] }>()
const product = computed(() => props.products.find(item => item.id === props.productId) ?? props.products[0])
const colorIndex = ref(0)
const color = computed(() => product.value?.colors[colorIndex.value] ?? product.value?.colors[0])
watch([product, () => props.initialColor], () => { colorIndex.value = Math.max(0, Math.min((product.value?.colors.length ?? 1) - 1, Math.trunc(props.initialColor))) }, { immediate: true })
function choose(index: number) { colorIndex.value = index; if (color.value) emit('change', color.value) }
function keydown(event: KeyboardEvent, index: number) {
  const count = product.value?.colors.length ?? 0
  if (!count || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count
  choose(next)
  ;(event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
}
</script>
<template>
  <section v-if="product" class="shupatto-palette"><div class="shupatto-palette__image"><img v-if="color" :src="color.image" :alt="`${product.name}, ${color.label}`" /></div><div class="shupatto-palette__content"><span class="shupatto-palette__brand">Shupatto</span><h2>{{ product.name }}</h2><p>{{ product.capacity }}<span>{{ product.category }}</span></p><div class="shupatto-palette__swatches" role="group" aria-label="Product color"><button v-for="(item, i) in product.colors" :key="item.id" type="button" :aria-label="item.label" :aria-pressed="color?.id === item.id" :title="item.label" :style="{ '--swatch': item.color }" @click="choose(i)" @keydown="keydown($event, i)"><span></span></button></div><span class="shupatto-palette__color">{{ color?.label ?? 'No colors available' }}</span><button v-if="showDetails && color" class="shupatto-palette__details" type="button" @click="emit('select', { product, color })">View details<ArrowUpRight :size="16" /></button></div></section><p v-else>No products available.</p>
</template>
<style scoped>
@font-face { font-family: 'Library Shupatto'; src: url('/assets/shupatto/tt-fors.woff2'); font-display: swap; }
.shupatto-palette { display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; gap: 25px; width: min(100%, 640px); color: #272726; font: 13px/1.4 'Library Shupatto', Arial, sans-serif; }
.shupatto-palette__image { width: 100%; min-width: 0; height: 325px; border-radius: 50%; overflow: hidden; background: #e1e3e1; }
.shupatto-palette__image img { width: 100%; height: 100%; object-fit: contain; }
.shupatto-palette__content { min-width: 0; }
.shupatto-palette__brand { font-size: 13px; }
.shupatto-palette h2 { font-size: 36px; line-height: 1.1; margin: 18px 0 12px; font-weight: 500; overflow-wrap: anywhere; }
.shupatto-palette p { display: flex; align-items: center; gap: 18px; margin: 0; font-size: 16px; }
.shupatto-palette p span { font-size: 10px; text-transform: uppercase; }
.shupatto-palette__swatches { display: flex; flex-wrap: wrap; gap: 7px; margin: 27px 0 11px; }
.shupatto-palette__swatches button { width: 32px; height: 29px; padding: 4px; border: 1px solid transparent; border-radius: 50%; background: none; cursor: pointer; }
.shupatto-palette__swatches button[aria-pressed=true] { border-color: #272726; }
.shupatto-palette__swatches span { display: block; width: 100%; height: 100%; border-radius: 50%; background: var(--swatch); }
.shupatto-palette__color { display: block; font-size: 11px; }
.shupatto-palette__details { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 24px; width: 100%; padding: 12px 0; border: 0; border-bottom: 1px solid #27272660; background: none; color: inherit; font: inherit; cursor: pointer; }
@media(max-width: 440px) { .shupatto-palette { grid-template-columns: 1fr; gap: 20px; } .shupatto-palette__image { height: 220px; } .shupatto-palette h2 { font-size: 28px; margin-top: 12px; } }
</style>
