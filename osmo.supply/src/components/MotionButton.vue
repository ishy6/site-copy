<script setup lang="ts">
import ButtonLabel from './ButtonLabel.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  label: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  full?: boolean
  inheritSize?: boolean
}>(), { type: 'button' })

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
  <component
    :is="href !== undefined ? 'a' : 'button'"
    v-bind="$attrs"
    class="has-button-roll"
    :href="href"
    :type="href !== undefined ? undefined : type"
    :disabled="href === undefined ? disabled : undefined"
    :aria-disabled="disabled ? true : $attrs['aria-disabled']"
    :tabindex="disabled && href !== undefined ? -1 : $attrs.tabindex"
    @click="handleClick"
  >
    <ButtonLabel :label="label" :full="full" :inherit-size="inheritSize" />
    <slot />
  </component>
</template>
