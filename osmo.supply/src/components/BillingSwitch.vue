<script setup lang="ts">
import MotionButton from './MotionButton.vue'

const billing = defineModel<'quarterly' | 'annual'>({ required: true })
const options = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annually' },
] as const

function select(value: typeof billing.value) {
  if (billing.value !== value) billing.value = value
}

function handleKeydown(event: KeyboardEvent, index: number) {
  const nextIndex = event.key === 'Home' ? 0
    : event.key === 'End' ? options.length - 1
    : event.key === 'ArrowRight' ? (index + 1) % options.length
    : event.key === 'ArrowLeft' ? (index - 1 + options.length) % options.length
    : null
  if (nextIndex === null) return
  event.preventDefault()
  select(options[nextIndex]!.value)
  const group = (event.currentTarget as HTMLElement).parentElement
  group?.querySelectorAll<HTMLButtonElement>('button')[nextIndex]?.focus()
}
</script>

<template>
  <div class="billing-switch" role="group" aria-label="Billing period">
    <MotionButton
      v-for="(option, index) in options"
      :key="option.value"
      :label="option.label"
      inherit-size
      :class="['billing-switch__option', `billing-switch__option--${option.value}`, { active: billing === option.value }]"
      :aria-pressed="billing === option.value"
      @click="select(option.value)"
      @keydown="handleKeydown($event, index)"
    />
    <span class="billing-switch__note">Save 20% per user</span>
  </div>
</template>

<style scoped>
.billing-switch {
  position: relative;
  display: flex;
  width: 189.2656px;
  height: 35.5547px;
  margin-top: 42.6641px;
}

.billing-switch__option {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  min-width: 0;
  height: 100%;
  padding: 0 16px .8889px;
  border: 0;
  background: #292825;
  color: #f4f4f4;
  font-size: 14.2222px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color .3s var(--osmo-ease), color .3s var(--osmo-ease);
}

.billing-switch__option--quarterly { width: 97.3281px; border-radius: 1.7778px; }
.billing-switch__option--annual { width: 91.9375px; border-radius: 999px; }
.billing-switch__option.active { background: #f4f4f4; color: #201d1d; }
.billing-switch__option:focus-visible { z-index: 1; }

.billing-switch__note {
  position: absolute;
  top: -12px;
  right: -118px;
  width: 100px;
  color: var(--green);
  font-family: 'Brisa Pro', cursive;
  font-size: 18px;
  line-height: 1;
  text-align: left;
  transform: rotate(-5deg);
  pointer-events: none;
}

@media (max-width: 800px) {
  .billing-switch { width: 213px; height: 48px; margin-top: 48px; }
  .billing-switch__option { flex: 1; width: auto; padding-inline: 12px; font-size: .74rem; line-height: normal; }
  .billing-switch__note { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .billing-switch__option { transition: none; }
}
</style>
