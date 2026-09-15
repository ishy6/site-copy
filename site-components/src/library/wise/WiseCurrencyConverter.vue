<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDownUp, ChevronDown, LockKeyhole, ReceiptText } from 'lucide-vue-next'

export interface WiseCurrency {
  code: string
  name: string
  flag: string
  unitsPerDollar: number
}

const props = withDefaults(defineProps<{
  amount?: number
  sourceCurrency?: string
  targetCurrency?: string
  feePercent?: number
  currencies?: WiseCurrency[]
}>(), {
  amount: 1000,
  sourceCurrency: 'GBP',
  targetCurrency: 'EUR',
  feePercent: 0.65,
  currencies: () => [
    { code: 'GBP', name: 'British pound', flag: '/assets/wise/gbp.svg', unitsPerDollar: 0.74 },
    { code: 'EUR', name: 'Euro', flag: '/assets/wise/eur.svg', unitsPerDollar: 0.86 },
    { code: 'USD', name: 'US dollar', flag: '/assets/wise/usd.svg', unitsPerDollar: 1 },
    { code: 'HKD', name: 'Hong Kong dollar', flag: '/assets/wise/hkd.svg', unitsPerDollar: 7.8 },
    { code: 'CAD', name: 'Canadian dollar', flag: '/assets/wise/cad.svg', unitsPerDollar: 1.37 },
  ],
})

const emit = defineEmits<{
  'update:amount': [amount: number]
  'update:sourceCurrency': [code: string]
  'update:targetCurrency': [code: string]
  change: [quote: { amount: number; received: number; fee: number; source: string; target: string }]
}>()

const amountValue = ref(props.amount)
const sourceCode = ref(props.sourceCurrency)
const targetCode = ref(props.targetCurrency)
const feesOpen = ref(false)
const available = computed(() => props.currencies.filter((currency) => Number.isFinite(currency.unitsPerDollar) && currency.unitsPerDollar > 0))
const source = computed(() => available.value.find((currency) => currency.code === sourceCode.value) ?? available.value[0])
const target = computed(() => available.value.find((currency) => currency.code === targetCode.value) ?? available.value[1] ?? available.value[0])
const safeAmount = computed(() => Number.isFinite(amountValue.value) ? Math.max(0, amountValue.value) : 0)
const feeRate = computed(() => Number.isFinite(props.feePercent) ? Math.min(100, Math.max(0, props.feePercent)) / 100 : 0)
const rate = computed(() => source.value && target.value ? target.value.unitsPerDollar / source.value.unitsPerDollar : 0)
const fee = computed(() => Math.round(safeAmount.value * feeRate.value * 100) / 100)
const received = computed(() => Math.round((safeAmount.value - fee.value) * rate.value * 100) / 100)
const money = (value: number) => new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

watch(() => props.amount, (value) => { amountValue.value = value })
watch(() => props.sourceCurrency, (value) => { sourceCode.value = value })
watch(() => props.targetCurrency, (value) => { targetCode.value = value })

function publish() {
  emit('change', {
    amount: safeAmount.value, received: received.value, fee: fee.value,
    source: source.value?.code ?? '', target: target.value?.code ?? '',
  })
}

function updateAmount(event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber
  amountValue.value = Number.isFinite(value) ? Math.max(0, value) : 0
  emit('update:amount', amountValue.value)
  publish()
}

function selectCurrency(which: 'source' | 'target', event: Event) {
  const code = (event.target as HTMLSelectElement).value
  if (which === 'source') {
    sourceCode.value = code
    emit('update:sourceCurrency', code)
  } else {
    targetCode.value = code
    emit('update:targetCurrency', code)
  }
  publish()
}

function swap() {
  const previousSource = source.value?.code ?? ''
  sourceCode.value = target.value?.code ?? ''
  targetCode.value = previousSource
  emit('update:sourceCurrency', sourceCode.value)
  emit('update:targetCurrency', targetCode.value)
  publish()
}
</script>

<template>
  <section class="wise-converter" aria-label="Currency converter">
    <div v-if="source && target" class="converter-content">
      <div class="rate-line"><LockKeyhole :size="14" aria-hidden="true" /><span>1 {{ source.code }} = {{ rate.toFixed(4) }} {{ target.code }}</span></div>
      <div class="amount-block">
        <span class="amount-label">You send exactly</span>
        <div class="amount-row">
          <div class="currency-pill">
            <img :src="source.flag" alt="" /><span>{{ source.code }}</span><ChevronDown :size="14" aria-hidden="true" />
            <select :value="source.code" aria-label="Sending currency" @change="selectCurrency('source', $event)">
              <option v-for="currency in available" :key="currency.code" :value="currency.code">{{ currency.code }} - {{ currency.name }}</option>
            </select>
          </div>
          <input :value="amountValue" aria-label="Amount to send" type="number" min="0" step="0.01" inputmode="decimal" @input="updateAmount" />
        </div>
      </div>
      <div class="swap-line"><button type="button" title="Swap currencies" aria-label="Swap currencies" @click="swap"><ArrowDownUp :size="17" aria-hidden="true" /></button></div>
      <div class="amount-block">
        <span class="amount-label">Recipient gets</span>
        <div class="amount-row">
          <div class="currency-pill">
            <img :src="target.flag" alt="" /><span>{{ target.code }}</span><ChevronDown :size="14" aria-hidden="true" />
            <select :value="target.code" aria-label="Receiving currency" @change="selectCurrency('target', $event)">
              <option v-for="currency in available" :key="currency.code" :value="currency.code">{{ currency.code }} - {{ currency.name }}</option>
            </select>
          </div>
          <output aria-label="Recipient amount" aria-live="polite">{{ money(received) }}</output>
        </div>
      </div>
      <button class="fee-summary" type="button" :aria-expanded="feesOpen" @click="feesOpen = !feesOpen">
        <span class="receipt"><ReceiptText :size="19" aria-hidden="true" /></span>
        <span class="fee-copy"><span>Total fees</span><strong>{{ money(fee) }} {{ source.code }}</strong></span>
        <ChevronDown class="fee-chevron" :class="{ open: feesOpen }" :size="18" aria-hidden="true" />
      </button>
      <div v-if="feesOpen" class="fee-detail"><span>Transfer fee ({{ (feeRate * 100).toFixed(2) }}%)</span><strong>{{ money(fee) }} {{ source.code }}</strong><span>Amount converted</span><strong>{{ money(safeAmount - fee) }} {{ source.code }}</strong></div>
    </div>
    <p v-else class="empty-state">No currencies available</p>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library Wise'; src: url('/assets/wise/inter-variable.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
.wise-converter, .wise-converter * { box-sizing: border-box; }
.wise-converter { width: 100%; max-width: 444px; margin: 0 auto; padding: 20px; border-radius: 28px; color: #163300; background: #fff; font-family: 'Library Wise', Arial, sans-serif; letter-spacing: 0; container-type: inline-size; }
.wise-converter button, .wise-converter input, .wise-converter select { font: inherit; }
.wise-converter button { cursor: pointer; }
.rate-line { display: flex; align-items: center; justify-content: center; gap: 7px; margin-bottom: 11px; min-height: 31px; border-radius: 999px; background: #eef0ec; font-size: 12px; font-weight: 650; }
.rate-line span { overflow-wrap: anywhere; }
.amount-label { display: block; margin-bottom: 7px; color: #454745; font-size: 13px; }
.amount-row { display: grid; grid-template-columns: 108px minmax(0, 1fr); gap: 12px; align-items: center; min-height: 40px; }
.currency-pill { position: relative; display: flex; height: 40px; align-items: center; justify-content: center; gap: 6px; padding: 0 8px; border-radius: 999px; background: #eef0ec; font-size: 14px; font-weight: 650; }
.currency-pill img { width: 24px; height: 24px; }
.currency-pill select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.currency-pill:focus-within { outline: 2px solid #163300; outline-offset: 3px; }
.amount-row input, .amount-row output { width: 100%; min-width: 0; padding: 3px 0; border: 0; background: transparent; color: #163300; text-align: right; font-size: 33px; font-weight: 650; line-height: 1.2; font-variant-numeric: tabular-nums; }
.amount-row input { appearance: textfield; -moz-appearance: textfield; }
.amount-row input::-webkit-inner-spin-button, .amount-row input::-webkit-outer-spin-button { appearance: none; margin: 0; }
.amount-row output { overflow-wrap: anywhere; }
.amount-row input:focus-visible { outline: 2px solid #163300; outline-offset: 3px; border-radius: 3px; }
.swap-line { position: relative; display: flex; justify-content: center; align-items: center; height: 35px; }
.swap-line::before { position: absolute; content: ''; left: 0; right: 0; height: 1px; background: #e2e5de; }
.swap-line button { z-index: 1; display: grid; width: 31px; height: 31px; padding: 0; place-items: center; border: 4px solid #fff; border-radius: 50%; background: #9fe870; color: #163300; box-sizing: content-box; }
.swap-line button:hover { background: #80e142; }
.fee-summary { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 10px; padding: 12px 0 0; border: 0; border-top: 1px solid #e2e5de; background: transparent; color: #163300; text-align: left; }
.receipt { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid #d5d7d3; border-radius: 50%; }
.fee-copy { display: grid; gap: 3px; font-size: 12px; }
.fee-copy > span { color: #656864; }
.fee-copy strong { font-size: 14px; }
.fee-chevron { margin-left: auto; transition: transform 180ms ease; }
.fee-chevron.open { transform: rotate(180deg); }
.fee-detail { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 15px; padding-top: 14px; border-top: 1px dashed #d5d7d3; font-size: 11px; line-height: 1.5; }
.wise-converter button:focus-visible { outline: 2px solid #163300; outline-offset: 3px; }
.empty-state { margin: 0; padding: 24px 0; font-size: 14px; }
@container (max-width: 330px) { .amount-row { grid-template-columns: 100px minmax(0, 1fr); gap: 8px; } .amount-row input, .amount-row output { font-size: 26px; } }
@container (max-width: 270px) { .amount-row input, .amount-row output { font-size: 22px; } .rate-line { font-size: 10px; } }
@media (prefers-reduced-motion: reduce) { .fee-chevron { transition: none; } }
</style>
