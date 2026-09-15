<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowRight, LoaderCircle, Minus, Plus, X } from 'lucide-vue-next'
import { sampleBag, type ShoppingBagItem } from './bag-data'
const props = withDefaults(defineProps<{ title?: string; items?: ShoppingBagItem[]; shippingNote?: string; empty?: boolean; prepareCheckout?: (items: ShoppingBagItem[]) => Promise<void> }>(), { title: 'Shopping bag', items: () => sampleBag, shippingNote: 'Shipping calculated at checkout.', empty: false })
const emit = defineEmits<{ 'update:items': [items: ShoppingBagItem[]]; remove: [id: string]; checkout: [items: ShoppingBagItem[]] }>()
const lines = ref<ShoppingBagItem[]>([])
const pending = ref(false)
const status = ref('')
const failed = ref(false)
const limit = (item: ShoppingBagItem) => Math.max(1, Math.floor(item.maxQuantity ?? 99) || 1)
watch(() => [props.items, props.empty] as const, () => { lines.value = props.empty ? [] : props.items.filter(item => item.quantity > 0).map(item => ({ ...item, quantity: Math.min(limit(item), Math.max(1, Math.floor(item.quantity) || 1)) })); status.value = '' }, { immediate: true, deep: true })
const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
const total = computed(() => lines.value.reduce((sum, line) => sum + Math.round(line.price * 100) * line.quantity, 0) / 100)
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
function update(id: string, quantity: number) {
  if (pending.value) return
  const item = lines.value.find(line => line.id === id)
  if (!item) return
  const next = Number.isFinite(quantity) ? Math.min(limit(item), Math.max(0, Math.floor(quantity))) : item.quantity
  if (!next) { lines.value = lines.value.filter(line => line.id !== id); emit('remove', id) }
  else item.quantity = next
  status.value = ''; emit('update:items', lines.value.map(line => ({ ...line })))
}
function inputChange(item: ShoppingBagItem, event: Event) { const input = event.target as HTMLInputElement; update(item.id, Number(input.value)); input.value = String(item.quantity) }
async function checkout() {
  if (pending.value || !lines.value.length) return
  const snapshot = lines.value.map(line => ({ ...line }))
  pending.value = true; failed.value = false; status.value = ''; emit('checkout', snapshot)
  try { await props.prepareCheckout?.(snapshot); status.value = props.prepareCheckout ? 'Checkout is ready.' : 'Your bag is ready for checkout.' }
  catch(cause) { failed.value = true; status.value = cause instanceof Error ? cause.message : 'Unable to continue. Please try again.' }
  finally { pending.value = false }
}
</script>

<template>
  <section class="makr-bag" :aria-label="title" :aria-busy="pending">
    <header><h3>{{ title }}</h3><span>{{ count }}</span></header>
    <ul v-if="lines.length" class="makr-bag__lines">
      <li v-for="item in lines" :key="item.id"><img :src="item.image" :alt="`${item.title}, ${item.finish}`" /><div class="makr-bag__item"><h4>{{ item.title }}</h4><p>{{ item.finish }}</p><div class="makr-bag__line-bottom"><div class="makr-bag__quantity"><button type="button" :aria-label="`Decrease ${item.title} quantity`" :title="`Decrease ${item.title} quantity`" :disabled="pending" @click="update(item.id, item.quantity - 1)"><Minus :size="13" /></button><input :value="item.quantity" type="number" min="0" :max="limit(item)" :aria-label="`${item.title} quantity`" :disabled="pending" @change="inputChange(item, $event)" /><button type="button" :aria-label="`Increase ${item.title} quantity`" :title="`Increase ${item.title} quantity`" :disabled="pending || item.quantity >= limit(item)" @click="update(item.id, item.quantity + 1)"><Plus :size="13" /></button></div><span>{{ money(item.price * item.quantity) }}</span></div></div><button type="button" class="makr-bag__remove" :aria-label="`Remove ${item.title}`" :title="`Remove ${item.title}`" :disabled="pending" @click="update(item.id, 0)"><X :size="15" /></button></li>
    </ul>
    <p v-else class="makr-bag__empty">Your bag is empty.</p>
    <footer><div><span>Total</span><strong>{{ money(total) }}</strong></div><p>{{ shippingNote }}</p><button type="button" class="makr-bag__checkout" :disabled="!lines.length || pending" @click="checkout"><span>{{ pending ? 'Preparing checkout' : 'Checkout' }}</span><LoaderCircle v-if="pending" class="makr-bag__spinner" :size="17" /><ArrowRight v-else :size="17" /></button><p class="makr-bag__status" :role="failed ? 'alert' : 'status'">{{ status }}</p></footer>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library MAKR'; src: url('/assets/makr/soehne-web-buch.woff2') format('woff2'); font-display: swap; }
.makr-bag { width: min(100%, 430px); color: #1c1717; font: 12px/1.4 'Library MAKR', Arial, sans-serif; letter-spacing: 0; }.makr-bag, .makr-bag * { box-sizing: border-box; }.makr-bag header { display: flex; justify-content: space-between; align-items: center; gap: 10px; border-bottom: 1px solid #a9aea9; padding-bottom: 15px; }.makr-bag h3 { font: 400 22px/1.1 'Library MAKR', sans-serif; text-transform: uppercase; margin: 0; overflow-wrap: anywhere; }.makr-bag h4, .makr-bag p { margin: 0; font: inherit; overflow-wrap: anywhere; }
.makr-bag__lines { margin: 0; padding: 0; max-height: 210px; overflow: auto; list-style: none; }.makr-bag__lines li { display: flex; gap: 12px; align-items: flex-start; padding: 13px 0; border-bottom: 1px solid #d8d9d3; }.makr-bag__lines img { width: 70px; height: 72px; object-fit: contain; flex: none; background: #f1f1ef; }.makr-bag__item { flex: 1; min-width: 0; }.makr-bag__item p { margin-top: 2px; color: #73756e; font-size: 11px; }.makr-bag__line-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 5px 10px; margin-top: 8px; }.makr-bag__quantity { display: flex; align-items: center; }.makr-bag button { display: inline-flex; align-items: center; justify-content: center; width: 25px; height: 25px; border: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer; flex: none; }.makr-bag button:disabled { opacity: .4; cursor: default; }.makr-bag input { width: 24px; padding: 0; border: 0; font: inherit; text-align: center; background: none; color: inherit; appearance: textfield; }.makr-bag input::-webkit-inner-spin-button { -webkit-appearance: none; }
.makr-bag__empty { display: grid; place-items: center; min-height: 180px; color: #73756e; }.makr-bag footer { margin-top: 16px; }.makr-bag footer > div { display: flex; justify-content: space-between; gap: 10px; }.makr-bag strong { font-weight: 400; }.makr-bag footer > p { color: #73756e; font-size: 10px; margin: 5px 0 13px; }.makr-bag .makr-bag__checkout { width: 100%; min-height: 42px; height: auto; justify-content: space-between; gap: 10px; padding: 10px 14px; background: #a9aea9; }.makr-bag footer .makr-bag__status { min-height: 15px; margin: 7px 0 0; }
.makr-bag button:focus-visible, .makr-bag input:focus-visible { outline: 2px solid #1c1717; outline-offset: 2px; }.makr-bag__spinner { animation: makr-bag-spin 1s linear infinite; }@keyframes makr-bag-spin { to { transform: rotate(360deg); } }@media(prefers-reduced-motion:reduce) { .makr-bag__spinner { animation: none; } }
</style>
