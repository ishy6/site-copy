<script setup lang="ts">
import ButtonLabel from './ButtonLabel.vue'

withDefaults(defineProps<{ savings?: string }>(), { savings: 'Save 20%' })
const billing = defineModel<'quarterly' | 'annual'>({ default: 'annual' })
const options = [{ value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annually' }] as const
function select(value: typeof billing.value) { if (billing.value !== value) billing.value = value }
function onKeydown(event: KeyboardEvent, index: number) {
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1
    : ['ArrowRight', 'ArrowLeft'].includes(event.key) ? 1 - index : null
  if (next === null) return
  event.preventDefault()
  select(options[next]!.value)
  ;(event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')[next]?.focus()
}
</script>

<template>
  <div class="osmo-billing">
    <div class="osmo-billing__options" role="group" aria-label="Billing period">
      <button v-for="(option, index) in options" :key="option.value" type="button"
        :class="[{ active: billing === option.value }, option.value]" :aria-pressed="billing === option.value"
        @click="select(option.value)" @keydown="onKeydown($event, index)">
        <ButtonLabel :label="option.label" />
      </button>
    </div>
    <span v-if="savings" class="osmo-billing__note">{{ savings }}</span>
  </div>
</template>

<style scoped>
.osmo-billing { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 18px; max-width: 100%; font: 15px/1.3 'Haffer', Arial, sans-serif; }
.osmo-billing__options { display: flex; }
.osmo-billing button { position: relative; isolation: isolate; overflow: hidden; min-width: 110px; min-height: 46px; padding: 12px 16px; border: 0; background: #353230; color: #f4f4f4; font: inherit; cursor: pointer; transition: color .2s, background .2s; }
.osmo-billing .quarterly { border-radius: 3px; }
.osmo-billing .annual { border-radius: 99px; }
.osmo-billing .active { color: #201d1d; background: #f4f4f4; }
.osmo-billing button:focus-visible { outline: 2px solid #b1ff69; outline-offset: 4px; z-index: 1; }
.osmo-billing__note { max-width: 130px; overflow-wrap: anywhere; color: #b1ff69; font: 25px/1 'Brisa Pro', cursive; transform: rotate(-7deg); }
@media (prefers-reduced-motion: reduce) { .osmo-billing button { transition: none; } }
</style>
