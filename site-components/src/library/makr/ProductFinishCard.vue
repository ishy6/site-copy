<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Plus } from 'lucide-vue-next'
import { fieldPouchFinishes, type MakrFinish } from './catalog'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  price?: number
  currency?: string
  finishes?: MakrFinish[]
  initialFinish?: string
  showAction?: boolean
}>(), {
  title: 'Field Pouch',
  subtitle: 'Made in the USA',
  price: 88,
  currency: 'USD',
  finishes: () => fieldPouchFinishes,
  initialFinish: 'brown',
  showAction: true,
})
const emit = defineEmits<{
  change: [finish: MakrFinish]
  add: [item: { title: string; finish: MakrFinish; price: number }]
}>()
const selectedId = ref(props.initialFinish)
const added = ref(false)
const selected = computed(() => props.finishes.find((finish) => finish.id === selectedId.value) ?? props.finishes[0])
const priceLabel = computed(() => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: props.currency, maximumFractionDigits: 2,
}).format(props.price))
watch(() => props.initialFinish, (value) => { selectedId.value = value; added.value = false })
watch(() => [props.title, props.price, props.finishes], () => { added.value = false })

function select(finish: MakrFinish) {
  selectedId.value = finish.id
  added.value = false
  emit('change', finish)
}
function add() {
  if (!selected.value || selected.value.available === false) return
  emit('add', { title: props.title, finish: selected.value, price: props.price })
  added.value = true
}
</script>

<template>
  <article class="makr-finish">
    <div class="makr-finish__image">
      <img v-if="selected" :src="selected.image" :alt="`${title}, ${selected.label}`" />
      <span v-else>No finishes available</span>
      <span class="makr-finish__mark" aria-hidden="true">MAKR</span>
    </div>
    <div class="makr-finish__meta">
      <div><h3>{{ title }}</h3><p>{{ selected?.label ?? 'Unavailable' }}</p></div>
      <span>{{ priceLabel }}</span>
    </div>
    <div class="makr-finish__options" role="group" aria-label="Product finish">
      <button
        v-for="finish in finishes" :key="finish.id" type="button"
        class="makr-finish__swatch" :class="{ selected: selected?.id === finish.id }"
        :aria-label="finish.label" :aria-pressed="selected?.id === finish.id"
        :title="finish.label" :style="{ '--swatch': finish.color }" @click="select(finish)"
      ><span></span></button>
      <span class="makr-finish__origin">{{ subtitle }}</span>
    </div>
    <button v-if="showAction" class="makr-finish__add" type="button" :disabled="!selected || selected.available === false" @click="add">
      <span>{{ selected?.available === false ? 'Out of stock' : added ? 'Added to selection' : 'Add to selection' }}</span>
      <Check v-if="added" :size="16" aria-hidden="true" /><Plus v-else :size="16" aria-hidden="true" />
    </button>
    <span class="makr-finish__status" role="status">{{ added ? `${title}, ${selected?.label} added to selection.` : '' }}</span>
  </article>
</template>

<style scoped>
@font-face { font-family: 'Library MAKR'; src: url('/assets/makr/soehne-web-buch.woff2') format('woff2'); font-display: swap; }
.makr-finish { width: min(100%, 340px); color: #1c1717; font: 13px/1.4 'Library MAKR', Arial, sans-serif; letter-spacing: 0; }
.makr-finish, .makr-finish * { box-sizing: border-box; }
.makr-finish__image { position: relative; width: 100%; aspect-ratio: 2; display: grid; place-items: center; background: #f0efeb; overflow: hidden; }
.makr-finish__image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 60%; transition: transform .3s ease; }
.makr-finish__image:hover img { transform: scale(1.035); }
.makr-finish__mark { position: absolute; left: 15px; top: 10px; font-size: 11px; }
.makr-finish__meta { display: flex; align-items: start; justify-content: space-between; gap: 12px; padding-top: 14px; }
.makr-finish__meta h3, .makr-finish__meta p { margin: 0; font: inherit; overflow-wrap: anywhere; }
.makr-finish__meta p { color: #77766e; margin-top: 2px; }
.makr-finish__meta > span { flex-shrink: 0; }
.makr-finish__options { display: flex; align-items: center; gap: 5px; margin-top: 12px; min-height: 28px; }
.makr-finish__swatch { display: grid; place-items: center; width: 28px; height: 28px; padding: 3px; border: 1px solid transparent; border-radius: 50%; background: none; cursor: pointer; flex-shrink: 0; }
.makr-finish__swatch.selected { border-color: #1c1717; }
.makr-finish__swatch span { display: block; width: 18px; height: 18px; border-radius: 50%; background: var(--swatch); }
.makr-finish__origin { margin-left: auto; font-size: 11px; color: #77766e; text-align: right; overflow-wrap: anywhere; }
.makr-finish__add { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 39px; border: 0; border-bottom: 1px solid #b7b9b1; padding: 10px 0; margin-top: 10px; color: inherit; background: transparent; font: inherit; cursor: pointer; text-align: left; }
.makr-finish__add:hover { color: #766a58; }
.makr-finish__add:disabled { color: #77766e; cursor: not-allowed; }
.makr-finish__swatch:focus-visible, .makr-finish__add:focus-visible { outline: 2px solid #1c1717; outline-offset: 3px; }
.makr-finish__status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
@media (prefers-reduced-motion: reduce) { .makr-finish__image img { transition: none; } }
</style>
