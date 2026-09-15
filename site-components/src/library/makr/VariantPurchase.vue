<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Check, LoaderCircle, Minus, Plus } from 'lucide-vue-next'
import { beltVariants, type PurchaseSelection, type PurchaseVariant } from './purchase-data'
const props = withDefaults(defineProps<{
  title?: string; finish?: string; image?: string; variants?: PurchaseVariant[]; initialVariant?: string; maxQuantity?: number; disabled?: boolean; addItem?: (selection: PurchaseSelection) => Promise<void>
}>(), { title: 'Tri-Glide Belt', finish: 'Army Green', image: '/assets/makr/tri-glide-front.webp', variants: () => beltVariants, initialVariant: '', maxQuantity: 10, disabled: false })
const emit = defineEmits<{ change: [selection: PurchaseSelection | null]; add: [selection: PurchaseSelection]; success: [selection: PurchaseSelection] }>()
const id = useId()
const selectedId = ref(props.initialVariant)
const quantity = ref(1)
const selectInput = ref<HTMLSelectElement>()
const pending = ref(false)
const complete = ref(false)
const error = ref('')
const max = computed(() => Math.max(1, Math.floor(props.maxQuantity) || 1))
const selected = computed(() => props.variants.find(variant => variant.id === selectedId.value))
const selection = computed<PurchaseSelection | null>(() => selected.value ? { variant: selected.value, quantity: quantity.value, total: selected.value.price * quantity.value } : null)
const price = computed(() => selected.value?.price ?? Math.min(...props.variants.map(variant => variant.price)))
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
watch(() => props.initialVariant, value => { selectedId.value = value })
watch(max, value => { quantity.value = Math.min(quantity.value, value) })
watch(selection, value => { complete.value = false; error.value = ''; emit('change', value) })
function changeQuantity(event: Event) { quantity.value = Math.min(max.value, Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value)) || 1)); (event.target as HTMLInputElement).value = String(quantity.value) }
async function add() {
  if (pending.value || props.disabled) return
  if (!selection.value) { error.value = 'Choose a size.'; selectInput.value?.focus(); return }
  if (!selection.value.variant.available) return
  const value = { ...selection.value, variant: { ...selection.value.variant } }
  pending.value = true; error.value = ''; emit('add', value)
  try { await props.addItem?.(value); complete.value = true; emit('success', value) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to add this item. Please try again.' }
  finally { pending.value = false }
}
</script>

<template>
  <section class="makr-purchase" :aria-labelledby="`${id}-title`">
    <header><div><h3 :id="`${id}-title`">{{ title }}</h3><p>{{ finish }}</p></div><img :src="image" :alt="`${title}, ${finish}`" /></header>
    <div class="makr-purchase__price">{{ Number.isFinite(price) ? money(price) : 'Unavailable' }}<span>Made in USA</span></div>
    <label class="makr-purchase__size"><span>Size</span><select ref="selectInput" v-model="selectedId" :disabled="disabled || pending || !variants.length" aria-label="Product size"><option value="" disabled>Choose</option><option v-for="variant in variants" :key="variant.id" :value="variant.id">{{ variant.label }}{{ variant.available ? '' : ' - Out of stock' }}</option></select></label>
    <dl><dt>Dimensions</dt><dd>{{ selected?.dimensions ?? 'Select a size' }}</dd></dl>
    <div class="makr-purchase__quantity"><span>Quantity</span><div><button type="button" aria-label="Decrease quantity" title="Decrease quantity" :disabled="disabled || pending || quantity <= 1" @click="quantity--"><Minus :size="14" /></button><input :value="quantity" type="number" min="1" :max="max" aria-label="Quantity" :disabled="disabled || pending" @change="changeQuantity" /><button type="button" aria-label="Increase quantity" title="Increase quantity" :disabled="disabled || pending || quantity >= max" @click="quantity++"><Plus :size="14" /></button></div></div>
    <button class="makr-purchase__add" type="button" :disabled="disabled || pending || !variants.length || selected?.available === false" @click="add"><span>{{ pending ? 'Adding' : selected?.available === false ? 'Out of stock' : complete ? 'Added to selection' : 'Add to selection' }}</span><span v-if="selection && !pending && !complete">{{ money(selection.total) }}</span><LoaderCircle v-if="pending" :size="16" class="makr-purchase__spinner" /><Check v-if="complete" :size="16" /></button>
    <p class="makr-purchase__status" :role="error ? 'alert' : 'status'">{{ error || (complete ? `${quantity} item${quantity > 1 ? 's' : ''} selected.` : '') }}</p>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library MAKR'; src: url('/assets/makr/soehne-web-buch.woff2') format('woff2'); font-display: swap; }
.makr-purchase { width: min(100%, 390px); color: #1c1717; font: 12px/1.4 'Library MAKR', Arial, sans-serif; letter-spacing: 0; }.makr-purchase, .makr-purchase * { box-sizing: border-box; }
.makr-purchase header { display: flex; justify-content: space-between; gap: 20px; align-items: center; }.makr-purchase header > div { min-width: 0; }.makr-purchase h3 { font: 400 20px/1.15 'Library MAKR', sans-serif; text-transform: uppercase; margin: 0; overflow-wrap: anywhere; }.makr-purchase p { margin: 5px 0 0; overflow-wrap: anywhere; }.makr-purchase header img { width: 92px; height: 76px; object-fit: contain; flex: none; background: #f1f1ef; }
.makr-purchase__price, .makr-purchase__size, .makr-purchase dl, .makr-purchase__quantity { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 0; min-height: 43px; border-bottom: 1px solid #cccec7; }.makr-purchase__price { margin-top: 8px; }.makr-purchase__price span, .makr-purchase dt { color: #74756e; }.makr-purchase dd { margin: 0; text-align: right; overflow-wrap: anywhere; }
.makr-purchase select, .makr-purchase input { font: inherit; color: inherit; background: none; border: 0; border-radius: 0; min-width: 0; }.makr-purchase select { max-width: 68%; padding: 5px 0; }.makr-purchase__quantity > div { display: flex; align-items: center; }.makr-purchase__quantity input { width: 36px; text-align: center; appearance: textfield; }.makr-purchase__quantity input::-webkit-inner-spin-button { -webkit-appearance: none; }
.makr-purchase button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; width: 30px; height: 30px; color: inherit; border: 0; padding: 0; background: none; cursor: pointer; font: inherit; }.makr-purchase button:disabled { opacity: .45; cursor: default; }.makr-purchase .makr-purchase__add { width: 100%; min-height: 43px; height: auto; padding: 10px 14px; margin-top: 18px; justify-content: space-between; background: #a9aea9; }.makr-purchase__add svg { flex: none; }
.makr-purchase .makr-purchase__status { min-height: 22px; margin: 8px 0 0; font-size: 11px; }.makr-purchase button:focus-visible, .makr-purchase select:focus-visible, .makr-purchase input:focus-visible { outline: 2px solid #1c1717; outline-offset: 3px; }
.makr-purchase__spinner { animation: makr-purchase-spin 1s linear infinite; }@keyframes makr-purchase-spin { to { transform: rotate(360deg); } }@media(prefers-reduced-motion: reduce) { .makr-purchase__spinner { animation: none; } }
</style>
