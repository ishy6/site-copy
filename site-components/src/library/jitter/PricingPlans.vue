<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowUpRight, Check } from 'lucide-vue-next'
export interface MotionPlan { id: string; name: string; tagline: string; monthly: number; annual: number; features: string[]; featured?: boolean }
const props = withDefaults(defineProps<{ title?: string; yearly?: boolean; currency?: string; plans?: MotionPlan[] }>(), {
  title: 'Find your flow.', yearly: true, currency: '$',
  plans: () => [
    { id: 'free', name: 'Free', tagline: 'A little curiosity.', monthly: 0, annual: 0, features: ['Unlimited local files', 'Motion templates', 'Personal workspace'] },
    { id: 'pro', name: 'Pro', tagline: 'Your next creative leap.', monthly: 18, annual: 12, features: ['Everything in Free', 'High-resolution exports', 'Custom fonts'], featured: true },
    { id: 'team', name: 'Team', tagline: 'Great motion, together.', monthly: 30, annual: 24, features: ['Everything in Pro', 'Shared team libraries', 'Centralized billing'] },
  ],
})
const emit = defineEmits<{ select: [plan: MotionPlan, yearly: boolean]; 'billing-change': [yearly: boolean] }>()
const annual = ref(props.yearly)
watch(() => props.yearly, value => { annual.value = value })
function setBilling(value: boolean) { annual.value = value; emit('billing-change', value) }
</script>
<template>
  <section class="pricing-plans" :aria-label="title"><header><h3>{{ title }}</h3><div class="billing-switch" role="group" aria-label="Billing interval"><button type="button" :aria-pressed="!annual" @click="setBilling(false)">Monthly</button><button type="button" :aria-pressed="annual" @click="setBilling(true)">Yearly</button></div></header><div class="plans-grid"><article v-for="plan in plans" :key="plan.id" :class="{ featured: plan.featured }"><span class="plan-eyebrow">{{ plan.featured ? 'A CREATIVE FAVORITE' : 'MADE FOR MOTION' }}</span><h4>{{ plan.name }}</h4><p class="tagline">{{ plan.tagline }}</p><div class="price">{{ currency }}{{ annual ? plan.annual : plan.monthly }}<span>/ month</span></div><small>{{ (annual ? plan.annual : plan.monthly) === 0 ? 'Free, always' : annual ? 'Per editor, billed yearly' : 'Per editor, billed monthly' }}</small><button class="choose-plan" type="button" :aria-label="`Choose ${plan.name}`" @click="emit('select', plan, annual)">Choose {{ plan.name }}<ArrowUpRight :size="14" /></button><ul><li v-for="feature in plan.features" :key="feature"><Check :size="13" />{{ feature }}</li></ul></article></div></section>
</template>
<style scoped>
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-400.woff2') format('woff2');font-weight:400;font-display:swap}
.pricing-plans{font-family:LibraryLausanne,Arial,sans-serif;color:#19181b;width:100%;max-width:650px;min-width:0;letter-spacing:0}.pricing-plans *{box-sizing:border-box}header{display:flex;gap:15px;justify-content:space-between;align-items:center;margin-bottom:24px}h3{margin:0;font-size:32px;font-weight:600;line-height:1.1;overflow-wrap:anywhere}.billing-switch{display:flex;gap:3px;background:#eeecf1;padding:4px;border-radius:5px;flex:none}button{font:inherit;border:0;cursor:pointer}.billing-switch button{padding:8px 10px;border-radius:3px;background:none;color:#827988;font-size:11px}.billing-switch button[aria-pressed=true]{background:white;color:#19181b;box-shadow:0 1px 4px #0000000a}.plans-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.plans-grid article{border:1px solid #e3e0e6;background:white;border-radius:8px;padding:20px 17px;min-width:0}.plans-grid article.featured{border-color:#b498f5;background:#f7f3ff}.plan-eyebrow{font-size:6px;color:#8b769e}h4{font-size:27px;font-weight:600;margin:15px 0 6px}.tagline{font-size:10px;color:#817985;min-height:28px;line-height:1.4;margin:0}.price{font-size:34px;margin-top:17px}.price span{font-size:9px;color:#928a99;margin-left:4px}.plans-grid small{font-size:8px;color:#847d89;display:block;margin:5px 0 18px}.choose-plan{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:11px 12px;background:#19181b;color:#fff;width:100%;font-size:10px;border-radius:4px;text-align:left}.featured .choose-plan{background:#b498f5;color:#201433}.choose-plan svg{flex:none}ul{list-style:none;padding:0;margin:19px 0 0;display:grid;gap:10px}li{display:flex;gap:6px;font-size:9px;line-height:1.4;overflow-wrap:anywhere}li svg{flex:none;color:#8a6faf}button:focus-visible{outline:2px solid #8055cf;outline-offset:3px}@media(max-width:540px){header{align-items:flex-start;flex-direction:column}.plans-grid{grid-template-columns:1fr}.plans-grid article{padding:20px}.tagline{min-height:0}.plan-eyebrow{font-size:8px}.price{margin-top:12px}h4{margin-top:12px}li{font-size:12px}.plans-grid small{font-size:10px}.choose-plan{font-size:12px}}
</style>
