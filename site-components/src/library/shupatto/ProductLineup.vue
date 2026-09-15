<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { products as defaults } from './products'
const props = withDefaults(defineProps<{ products?: typeof defaults; initialCategory?: string; title?: string }>(), { products: () => defaults, initialCategory: 'All', title: 'Lineup' })
const emit = defineEmits<{ select: [product: typeof defaults[number]]; filter: [category: string] }>()
const category = ref(props.initialCategory)
const categories = computed(() => ['All', ...new Set(props.products.map(item => item.category))])
const filtered = computed(() => props.products.filter(item => category.value === 'All' || item.category === category.value))
watch(() => props.initialCategory, value => { category.value = categories.value.includes(value) ? value : 'All' })
watch(categories, value => { if (!value.includes(category.value)) category.value = 'All' }, { immediate: true })
</script>
<template>
  <section class="shupatto-lineup"><header><h2>{{ title }}</h2><div role="group" aria-label="Product family"><button v-for="item in categories" :key="item" type="button" :aria-pressed="category === item" @click="category = item; emit('filter', item)">{{ item }}</button></div></header><div class="shupatto-lineup__items"><button v-for="product in filtered" :key="product.id" type="button" @click="emit('select', product)"><span class="shupatto-lineup__image"><img v-if="product.colors[0]" :src="product.colors[0].image" :alt="product.name" /></span><span class="shupatto-lineup__name">{{ product.name }}<ArrowUpRight :size="16" /></span><span class="shupatto-lineup__capacity">{{ product.capacity }}</span></button></div><p v-if="!filtered.length">No products in this family.</p></section>
</template>
<style scoped>
@font-face { font-family: 'Library Shupatto'; src: url('/assets/shupatto/tt-fors.woff2'); font-display: swap; }
.shupatto-lineup { width: min(100%, 660px); color: #272726; font: 13px/1.4 'Library Shupatto', Arial, sans-serif; }
.shupatto-lineup header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
.shupatto-lineup h2 { font-weight: 500; font-size: 36px; margin: 0; }
.shupatto-lineup header > div { display: flex; flex-wrap: wrap; gap: 12px; }
.shupatto-lineup header button { padding: 6px 0; border: 0; border-bottom: 1px solid transparent; background: none; color: inherit; font: inherit; cursor: pointer; }
.shupatto-lineup header button[aria-pressed=true] { border-color: #272726; }
.shupatto-lineup__items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.shupatto-lineup__items > button { padding: 0; min-width: 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.shupatto-lineup__image { display: block; height: 190px; border-radius: 50%; background: #e1e3e1; overflow: hidden; }
.shupatto-lineup img { display: block; width: 100%; height: 100%; object-fit: contain; transition: transform .4s; }
.shupatto-lineup__items button:hover img { transform: scale(1.08); }
.shupatto-lineup__name { display: flex; justify-content: space-between; align-items: start; gap: 8px; margin-top: 18px; overflow-wrap: anywhere; }
.shupatto-lineup__name svg { flex-shrink: 0; }
.shupatto-lineup__capacity { display: block; margin-top: 7px; font-size: 11px; color: #73736d; }
@media(max-width: 450px) { .shupatto-lineup__items { grid-template-columns: 1fr; } .shupatto-lineup__image { height: 190px; } }
@media(prefers-reduced-motion: reduce) { .shupatto-lineup img { transition: none; } }
</style>
