<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowRight, ReceiptText } from 'lucide-vue-next'
export interface FeeLine { label: string; amount: number }
export interface FeeComparison { name: string; amount: number; featured?: boolean }
const props = withDefaults(defineProps<{ title?: string; currency?: string; initialView?: string; fees?: FeeLine[]; comparisons?: FeeComparison[] }>(), {
  title: 'Total fees', currency: 'GBP', initialView: 'details',
  fees: () => [{ label: 'Our fee', amount: 4.65 }, { label: 'Bank transfer', amount: 1.85 }, { label: 'Exchange rate markup', amount: 0 }],
  comparisons: () => [{ name: 'Wise', amount: 6.5, featured: true }, { name: 'Bank transfer', amount: 18 }, { name: 'Card transfer', amount: 24 }],
})
const emit = defineEmits<{ 'update:view': [view: string] }>()
const view = ref(props.initialView)
const group = useId()
watch(() => props.initialView, value => { view.value = value })
const total = computed(() => props.fees.reduce((sum, fee) => sum + (Number.isFinite(fee.amount) ? fee.amount : 0), 0))
const money = (amount: number) => `${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${props.currency}`
</script>
<template>
  <section class="fee-breakdown" :aria-label="title">
    <ReceiptText class="fee-icon" :size="23" aria-hidden="true" /><h3>{{ title }}</h3>
    <div class="fee-tabs"><label v-for="tab in ['details','compare']" :key="tab"><input v-model="view" :name="group" type="radio" :value="tab" @change="emit('update:view', view)" /><span>{{ tab === 'details' ? 'Details' : 'Compare' }}</span></label></div>
    <template v-if="view === 'details'"><dl class="fee-lines"><div v-for="(line,index) in fees" :key="`${line.label}-${index}`"><dt>{{ line.label }}</dt><dd>{{ money(line.amount) }}</dd></div></dl><div class="fee-total"><span>Total</span><strong>{{ money(total) }}</strong></div><p class="fee-note">Included in the amount you send</p></template>
    <div v-else class="comparisons"><div v-for="(provider,index) in comparisons" :key="`${provider.name}-${index}`" :class="{ featured: provider.featured }"><strong>{{ provider.name }}</strong><span>{{ money(provider.amount) }}</span><ArrowRight v-if="provider.featured" :size="16" aria-hidden="true" /></div><p v-if="!comparisons.length" class="fee-note">No comparison data available</p></div>
  </section>
</template>
<style scoped>
@font-face{font-family:'Library Wise';src:url('/assets/wise/inter-variable.woff2') format('woff2');font-weight:100 900;font-display:swap}.fee-breakdown,.fee-breakdown *{box-sizing:border-box}.fee-breakdown{width:100%;max-width:440px;padding:23px;background:#fff;border-radius:30px;color:#163300;font-family:'Library Wise',Arial,sans-serif;letter-spacing:0}.fee-icon{display:block;margin:0 auto 12px}.fee-breakdown h3{margin:0 0 20px;font-size:28px;line-height:1.15;text-align:center;overflow-wrap:anywhere}.fee-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));padding:4px;border-radius:999px;background:#eef0ec}.fee-tabs label{position:relative;cursor:pointer}.fee-tabs input{position:absolute;opacity:0}.fee-tabs span{display:flex;align-items:center;justify-content:center;min-height:35px;border-radius:999px;font-size:12px;font-weight:650}.fee-tabs input:checked+span{background:#fff;box-shadow:0 1px 4px #16330014}.fee-tabs input:focus-visible+span{outline:2px solid #163300;outline-offset:-2px}.fee-lines{display:grid;gap:17px;margin:25px 0}.fee-lines>div,.fee-total{display:flex;justify-content:space-between;gap:15px;font-size:12px;line-height:1.35}.fee-lines dt,.fee-lines dd{margin:0;overflow-wrap:anywhere}.fee-lines dd{flex-shrink:0;font-weight:600;text-align:right}.fee-total{padding-top:20px;border-top:1px solid #d5d7d3;font-size:15px}.fee-note{margin:8px 0 0;font-size:10px;color:#656864;text-align:right;line-height:1.4}.comparisons{display:grid;gap:9px;margin-top:22px}.comparisons>div{display:flex;align-items:center;gap:8px;min-height:51px;padding:13px;border-radius:6px;background:#eef0ec;font-size:12px}.comparisons strong{flex:1;overflow-wrap:anywhere}.comparisons span{white-space:nowrap}.comparisons .featured{background:#9fe870}.comparisons svg{flex-shrink:0}
</style>
