<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import ButtonLabel from './ButtonLabel.vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  label: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'dark' | 'lime' | 'violet'
  arrow?: boolean
}>(), { type: 'button', variant: 'dark', arrow: true })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component :is="href !== undefined ? 'a' : 'button'" v-bind="$attrs"
    class="osmo-button" :class="`osmo-button--${variant}`" :href="href"
    :type="href !== undefined ? undefined : type" :disabled="href === undefined ? disabled : undefined"
    :aria-disabled="disabled || undefined" :tabindex="disabled && href !== undefined ? -1 : $attrs.tabindex"
    @click="handleClick">
    <ButtonLabel :label="label" /><slot><ArrowUpRight v-if="arrow" :size="20" /></slot>
  </component>
</template>

<style scoped>
.osmo-button { display: inline-flex; align-items: center; justify-content: center; gap: 28px; max-width: 100%; min-height: 56px; padding: 16px 24px; border: 0; border-radius: 4px; background: #201d1d; color: #f4f4f4; font: 500 18px/1.25 'Haffer', Arial, sans-serif; text-decoration: none; isolation: isolate; overflow: hidden; cursor: pointer; }
.osmo-button--lime { background: #b1ff69; color: #201d1d; }
.osmo-button--violet { background: #6541f4; color: #fff; }
.osmo-button > :deep(svg) { flex: none; }
.osmo-button:focus-visible { outline: 2px solid #6541f4; outline-offset: 4px; }
.osmo-button:disabled, .osmo-button[aria-disabled=true] { opacity: .4; cursor: not-allowed; }
</style>
