<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BillingSwitch from './BillingSwitch.vue'
import MotionButton from './MotionButton.vue'
export interface OsmoPlan { id: string; title: string; users: string; annual: number; quarterly: number; label: string }
const props = withDefaults(defineProps<{ initialBilling?: 'annual' | 'quarterly'; resources?: number; currency?: string; plans?: OsmoPlan[] }>(), {
  initialBilling: 'annual', resources: 212, currency: 'EUR', plans: () => [
    { id: 'solo', title: 'Solo', users: '1 user', annual: 20, quarterly: 25, label: 'Become a member' },
    { id: 'team', title: 'Team', users: 'Min. 2 users', annual: 16, quarterly: 20, label: 'Sign up your team' },
  ],
})
const billing = ref(props.initialBilling)
const emit = defineEmits<{ select: [plan: { id: string; billing: 'annual' | 'quarterly'; monthlyPrice: number }]; 'billing-change': [billing: 'annual' | 'quarterly'] }>()
watch(() => props.initialBilling, value => { billing.value = value })
watch(billing, value => emit('billing-change', value))
const formatter = computed(() => new Intl.NumberFormat('en', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }))
</script>
<template>
  <section class="osmo-pricing" aria-label="Membership plans"><BillingSwitch v-model="billing" savings="" /><div class="osmo-pricing__grid"><article v-for="(plan, i) in plans" :key="plan.id" :class="{ team: i % 2 === 1 }"><small>{{ plan.users }}</small><h2>{{ plan.title }}</h2><div class="osmo-pricing__price"><del v-if="billing === 'annual' && plan.quarterly > plan.annual">{{ formatter.format(plan.quarterly) }}</del><strong>{{ formatter.format(plan[billing]) }}</strong></div><p>Per month, billed {{ billing === 'annual' ? 'annually' : 'quarterly' }}</p><MotionButton :label="plan.label" @click="emit('select', { id: plan.id, billing, monthlyPrice: plan[billing] })" /><footer>{{ resources }} Vault resources, added weekly</footer></article></div><p v-if="!plans.length">No plans available.</p></section>
</template>
<style scoped>
.osmo-pricing { width: min(100%, 625px); color: #f4f4f4; font: 13px/1.4 'Haffer', Arial, sans-serif; }
.osmo-pricing__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
.osmo-pricing article { background: #f4f4f4; color: #201d1d; padding: 23px; border-radius: 4px; }
.osmo-pricing article.team { background: #b1ff69; }
.osmo-pricing small { font-size: 11px; }
.osmo-pricing h2 { margin: 12px 0; font-size: 29px; font-weight: 450; }
.osmo-pricing__price { display: flex; align-items: baseline; gap: 10px; }
.osmo-pricing__price strong { font-size: 42px; font-weight: 450; }
.osmo-pricing__price del { font-size: 22px; opacity: .45; }
.osmo-pricing p { font-size: 11px; margin: 6px 0 22px; }
.osmo-pricing :deep(.osmo-button) { width: 100%; min-height: 40px; padding: 9px 12px; gap: 12px; font-size: 13px; }
.osmo-pricing footer { border-top: 1px solid #201d1d25; margin-top: 20px; padding-top: 14px; font-size: 11px; }
@media(max-width: 450px) { .osmo-pricing__grid { grid-template-columns: 1fr; } }
</style>
