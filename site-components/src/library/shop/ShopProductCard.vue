<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Heart, Star } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name?: string
  store?: string
  image?: string
  price?: number
  currency?: string
  previousPrice?: number
  rating?: number
  reviewCount?: number
  initialSaved?: boolean
  showRating?: boolean
  href?: string
}>(), {
  name: 'Baby Changing Mat',
  store: 'Gathre',
  image: '/assets/shop/changing-mat.jpg',
  price: 160,
  currency: 'HKD',
  previousPrice: 0,
  rating: 4.9,
  reviewCount: 160,
  initialSaved: false,
  showRating: true,
  href: '',
})

const emit = defineEmits<{ 'update:saved': [saved: boolean]; select: [name: string] }>()
const saved = ref(props.initialSaved)
const imageFailed = ref(false)
const selected = ref(false)
const discount = computed(() => props.previousPrice > props.price && props.previousPrice > 0 ? Math.round((1 - props.price / props.previousPrice) * 100) : 0)
const safeRating = computed(() => Math.min(5, Math.max(0, props.rating)))
const money = (value: number) => {
  try { return new Intl.NumberFormat('en-HK', { style: 'currency', currency: props.currency }).format(value) }
  catch { return `${props.currency} ${value.toFixed(2)}` }
}
watch(() => props.initialSaved, (value) => { saved.value = value })
watch(() => props.image, () => { imageFailed.value = false })
watch(() => props.name, () => { selected.value = false })

function toggleSave() {
  saved.value = !saved.value
  emit('update:saved', saved.value)
}

function select() {
  selected.value = !selected.value
  emit('select', props.name)
}
</script>

<template>
  <article class="shop-product-card" :class="{ 'is-selected': selected }">
    <div class="product-image">
      <component :is="href ? 'a' : 'button'" class="product-open" :href="href || undefined" :type="href ? undefined : 'button'" :aria-label="`View ${name}`" @click="select">
        <img v-if="!imageFailed" :src="image" :alt="name" @error="imageFailed = true" />
        <span v-else class="image-fallback">{{ store }}</span>
      </component>
      <span v-if="discount > 0" class="discount">{{ discount }}% off</span>
      <button class="save-button" :class="{ saved }" type="button" :aria-label="saved ? `Remove ${name} from saved items` : `Save ${name}`" :aria-pressed="saved" :title="saved ? 'Remove from saved items' : 'Save item'" @click="toggleSave"><Heart :size="19" :fill="saved ? 'currentColor' : 'none'" :stroke-width="1.75" aria-hidden="true" /></button>
    </div>
    <div class="product-info">
      <small>{{ store }}</small>
      <component :is="href ? 'a' : 'button'" class="product-name" :href="href || undefined" :type="href ? undefined : 'button'" @click="select">{{ name }}</component>
      <span v-if="showRating" class="rating" :aria-label="`${safeRating} out of 5 stars, ${reviewCount} reviews`"><Star :size="12" fill="currentColor" aria-hidden="true" /><b>{{ safeRating.toFixed(1) }}</b><span>({{ reviewCount.toLocaleString('en') }})</span></span>
      <div class="price-line"><b>{{ money(price) }}</b><del v-if="discount > 0">{{ money(previousPrice) }}</del><span v-if="saved" class="saved-label" role="status">Saved</span></div>
    </div>
  </article>
</template>

<style scoped>
@font-face { font-family: 'Library Shop'; src: url('/assets/shop/GTStandard-MRegular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Library Shop'; src: url('/assets/shop/GTStandard-MSemibold.woff2') format('woff2'); font-weight: 600 800; font-display: swap; }
.shop-product-card, .shop-product-card * { box-sizing: border-box; }
.shop-product-card { width: 100%; max-width: 224px; margin: 0 auto; color: #080808; font-family: 'Library Shop', Arial, sans-serif; letter-spacing: 0; }
.shop-product-card button, .shop-product-card a { font: inherit; color: inherit; cursor: pointer; }
.product-image { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; border: 1px solid #e1e1e1; border-radius: 20px; background: #f1f1f1; box-shadow: 0 2px 5px rgb(0 0 0 / 7%); transition: box-shadow 150ms ease; }
.is-selected .product-image { box-shadow: 0 0 0 3px #5433eb; }
.product-open { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; }
.product-open img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 250ms ease; }
.product-open:hover img { transform: scale(1.035); }
.image-fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 18px; color: #6c6c6c; font-size: 25px; overflow-wrap: anywhere; }
.save-button { position: absolute; right: 11px; bottom: 11px; display: grid; width: 35px; height: 35px; padding: 0; place-items: center; border: 0; border-radius: 50%; background: rgb(70 70 70 / 58%); color: #fff !important; transition: transform 150ms ease, background 150ms ease; }
.save-button:hover { transform: scale(1.08); background: #080808; }
.save-button.saved { background: #5433eb; }
.discount { position: absolute; top: 12px; left: 12px; padding: 5px 9px; border-radius: 12px; background: #080808; color: #fff; font-size: 11px; line-height: 1; pointer-events: none; }
.product-info { padding: 10px 4px 0; }
.product-info small { display: block; color: #5b5b5b; font-size: 12px; line-height: 1.3; overflow-wrap: anywhere; }
.product-name { display: block; width: 100%; margin: 4px 0 0; padding: 0; border: 0; background: transparent; text-align: left; text-decoration: none; font-size: 15px !important; font-weight: 600 !important; line-height: 1.3; overflow-wrap: anywhere; }
.rating { display: flex; height: 18px; gap: 4px; align-items: center; margin-top: 4px; color: #080808; font-size: 11px; }
.rating svg { color: #a38b14; }
.rating b { font-weight: 400; }
.rating > span { color: #686868; }
.price-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; margin-top: 4px; font-size: 13px; }
.price-line del { color: #777; font-size: 12px; }
.saved-label { margin-left: auto; color: #5433eb; font-size: 11px; }
.shop-product-card button:focus-visible, .shop-product-card a:focus-visible { outline: 2px solid #5433eb; outline-offset: 3px; }
.product-open:focus-visible { outline-offset: -5px !important; border-radius: 20px; }
@media (prefers-reduced-motion: reduce) { .product-image, .product-open img, .save-button { transition: none; } .product-open:hover img, .save-button:hover { transform: none; } }
</style>
