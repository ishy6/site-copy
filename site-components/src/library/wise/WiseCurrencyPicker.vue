<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Check, Search, X } from 'lucide-vue-next'
import { currencyOptions, type CurrencyOption } from './wiseCurrencies'
const props = withDefaults(defineProps<{ modelValue?: string; title?: string; options?: CurrencyOption[]; showPopular?: boolean }>(), { modelValue: 'GBP', title: 'Choose a currency', options: () => currencyOptions, showPopular: true })
const emit = defineEmits<{ 'update:modelValue': [code: string]; select: [currency: CurrencyOption] }>()
const query = ref('')
const selected = ref(props.modelValue)
const activeIndex = ref(0)
const searchInput = ref<HTMLInputElement>()
const listId = useId()
const filtered = computed(() => props.options.filter(item => `${item.code} ${item.name}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const ordered = computed(() => props.showPopular ? [...filtered.value.filter(item => item.popular), ...filtered.value.filter(item => !item.popular)] : filtered.value)
watch(() => props.modelValue, value => { selected.value = value })
watch(query, () => { activeIndex.value = 0 })
watch(ordered, values => { activeIndex.value = Math.min(activeIndex.value, Math.max(0, values.length - 1)) })
function choose(item: CurrencyOption) { selected.value = item.code; emit('update:modelValue', item.code); emit('select', item) }
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { query.value = ''; return }
  const length = ordered.value.length
  if (!length) return
  if (event.key === 'Enter') { event.preventDefault(); const item = ordered.value[activeIndex.value]; if (item) choose(item); return }
  const index = event.key === 'ArrowDown' ? (activeIndex.value + 1) % length : event.key === 'ArrowUp' ? (activeIndex.value - 1 + length) % length : event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : -1
  if (index < 0) return
  event.preventDefault(); activeIndex.value = index
  document.getElementById(`${listId}-${index}`)?.scrollIntoView?.({ block: 'nearest' })
}
</script>
<template>
  <section class="currency-picker" :aria-label="title">
    <h3>{{ title }}</h3>
    <div class="search-field"><Search :size="18" aria-hidden="true" /><input ref="searchInput" v-model="query" role="combobox" aria-label="Search currencies" aria-autocomplete="list" aria-expanded="true" :aria-controls="listId" :aria-activedescendant="ordered.length ? `${listId}-${activeIndex}` : undefined" placeholder="Currency or country" @keydown="keydown" /><button v-if="query" type="button" aria-label="Clear currency search" title="Clear search" @click="query = ''; searchInput?.focus()"><X :size="15" aria-hidden="true" /></button></div>
    <div :id="listId" role="listbox" aria-label="Currencies" class="currency-list">
      <template v-for="(item,index) in ordered" :key="item.code"><p v-if="showPopular && (index === 0 || (ordered[index-1]?.popular && !item.popular))">{{ item.popular ? 'Popular currencies' : 'All currencies' }}</p><button :id="`${listId}-${index}`" type="button" role="option" :aria-selected="selected === item.code" :class="{ selected: selected === item.code, active: index === activeIndex }" @mouseenter="activeIndex = index" @click="choose(item)"><img :src="item.flag" alt="" /><span><strong>{{ item.code }}</strong><small>{{ item.name }}</small></span><Check v-if="selected === item.code" :size="18" aria-hidden="true" /></button></template>
      <p v-if="!ordered.length" role="status" class="empty">No currencies found</p>
    </div>
  </section>
</template>
<style scoped>
@font-face{font-family:'Library Wise';src:url('/assets/wise/inter-variable.woff2') format('woff2');font-weight:100 900;font-display:swap}.currency-picker,.currency-picker *{box-sizing:border-box}.currency-picker{width:100%;max-width:390px;padding:20px;background:#fff;border-radius:24px;color:#163300;font-family:'Library Wise',Arial,sans-serif;letter-spacing:0}.currency-picker h3{margin:0 0 16px;font-size:21px;line-height:1.2}.search-field{display:flex;align-items:center;gap:9px;padding:0 12px;height:43px;border:1px solid #868a82;border-radius:7px}.search-field:focus-within{outline:2px solid #163300;outline-offset:1px}.search-field svg{flex-shrink:0}.search-field input{width:100%;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:12px;color:#163300}.search-field button{display:grid;place-items:center;padding:0;width:24px;height:24px;flex-shrink:0;background:transparent;border:0;color:inherit;cursor:pointer}.currency-list{max-height:260px;margin-top:9px;overflow:auto;scrollbar-width:thin;overscroll-behavior:contain}.currency-list>p{margin:12px 8px 7px;color:#656864;font-size:10px}.currency-list>button{display:flex;align-items:center;gap:12px;width:100%;min-height:51px;padding:7px 9px;border:0;border-radius:6px;text-align:left;font:inherit;color:#163300;background:transparent;cursor:pointer}.currency-list>button:hover,.currency-list>button.active{background:#eef0ec}.currency-list>button.selected{background:#e6f8da}.currency-list img{width:32px;height:32px}.currency-list button>span{display:grid;gap:3px;flex:1;min-width:0}.currency-list strong{font-size:12px}.currency-list small{font-size:10px;color:#656864;overflow-wrap:anywhere}.currency-list button>svg{flex-shrink:0}.currency-list .empty{padding:42px 0;text-align:center}.currency-picker button:focus-visible{outline:2px solid #163300;outline-offset:-2px}
</style>
