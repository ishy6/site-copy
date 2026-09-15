<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowUpRight, Search, X } from 'lucide-vue-next'
import { makrCatalog, type MakrProduct } from './catalog'

const props = withDefaults(defineProps<{
  title?: string
  placeholder?: string
  initialQuery?: string
  products?: MakrProduct[]
  currency?: string
  showPrices?: boolean
}>(), {
  title: 'Objects for everyday use.',
  placeholder: 'Search objects',
  initialQuery: '',
  products: () => makrCatalog,
  currency: 'USD',
  showPrices: true,
})
const emit = defineEmits<{ search: [query: string]; select: [product: MakrProduct] }>()
const query = ref(props.initialQuery)
const input = ref<HTMLInputElement>()
watch(() => props.initialQuery, (value) => { query.value = value })
watch(query, (value) => emit('search', value))
const results = computed(() => {
  const terms = query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return props.products.filter((product) => terms.every((term) => `${product.title} ${product.finish}`.toLocaleLowerCase().includes(term)))
})
const money = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }).format(price)
function clear() { query.value = ''; input.value?.focus() }
</script>

<template>
  <section class="makr-search" aria-label="Product catalog search">
    <div class="makr-search__heading"><span>MAKR</span><h3>{{ title }}</h3></div>
    <form class="makr-search__field" role="search" @submit.prevent="emit('search', query)">
      <Search :size="17" :stroke-width="1.4" aria-hidden="true" />
      <input ref="input" v-model="query" type="search" :placeholder="placeholder" aria-label="Search products" @keydown.esc="clear" />
      <button v-if="query" type="button" title="Clear search" aria-label="Clear search" @click="clear"><X :size="17" :stroke-width="1.4" /></button>
    </form>
    <div class="makr-search__count" role="status">{{ results.length }} {{ results.length === 1 ? 'object' : 'objects' }}<span>{{ query.trim() ? 'Search results' : 'The collection' }}</span></div>
    <div v-if="results.length" class="makr-search__grid">
      <a v-for="product in results" :key="product.id" class="makr-search__product" :href="product.href" target="_blank" rel="noopener noreferrer" @click="emit('select', product)">
        <div class="makr-search__image"><img :src="product.image" :alt="`${product.title}, ${product.finish}`" loading="lazy" /><ArrowUpRight :size="16" aria-hidden="true" /></div>
        <h4>{{ product.title }}</h4>
        <div class="makr-search__meta"><span>{{ product.finish }}</span><span v-if="showPrices">{{ money(product.price) }}</span></div>
      </a>
    </div>
    <p v-else class="makr-search__empty">No objects found for "{{ query.trim() }}".</p>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library MAKR'; src: url('/assets/makr/soehne-web-buch.woff2') format('woff2'); font-display: swap; }
.makr-search { width: min(100%, 460px); color: #1c1717; font: 12px/1.4 'Library MAKR', Arial, sans-serif; letter-spacing: 0; }
.makr-search, .makr-search * { box-sizing: border-box; }
.makr-search__heading { display: flex; align-items: start; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.makr-search__heading > span { font-size: 18px; line-height: 1; flex-shrink: 0; }
.makr-search__heading h3 { font: inherit; margin: 0; text-align: right; overflow-wrap: anywhere; }
.makr-search__field { border-bottom: 1px solid #1c1717; display: flex; align-items: center; gap: 10px; min-height: 41px; }
.makr-search__field > svg { flex-shrink: 0; }
.makr-search__field input { width: 100%; min-width: 0; border: 0; padding: 8px 0; background: none; font: inherit; color: inherit; border-radius: 0; }
.makr-search__field input::-webkit-search-cancel-button { -webkit-appearance: none; }
.makr-search__field:focus-within { border-bottom-width: 2px; }
.makr-search__field input:focus { outline: none; }
.makr-search__field button { width: 30px; height: 30px; flex-shrink: 0; display: grid; place-items: center; border: 0; padding: 0; background: none; color: inherit; cursor: pointer; }
.makr-search__count { display: flex; justify-content: space-between; gap: 10px; padding: 14px 0 17px; color: #77766e; font-size: 10px; text-transform: uppercase; }
.makr-search__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
.makr-search__product { min-width: 0; color: inherit; text-decoration: none; }
.makr-search__image { width: 100%; aspect-ratio: 1; position: relative; overflow: hidden; background: #f0efeb; }
.makr-search__image img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .25s; }
.makr-search__image > svg { position: absolute; bottom: 8px; right: 8px; opacity: 0; transition: opacity .2s; }
.makr-search__product:hover img { transform: scale(1.045); }
.makr-search__product:hover .makr-search__image > svg, .makr-search__product:focus-visible .makr-search__image > svg { opacity: 1; }
.makr-search__product h4 { font: inherit; margin: 10px 0 3px; overflow-wrap: anywhere; }
.makr-search__meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 3px 8px; color: #77766e; font-size: 11px; }
.makr-search__empty { margin: 0; min-height: 185px; display: grid; align-content: center; text-align: center; overflow-wrap: anywhere; }
.makr-search__product:focus-visible, .makr-search__field button:focus-visible { outline: 2px solid #1c1717; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .makr-search__image img, .makr-search__image > svg { transition: none; } }
</style>
