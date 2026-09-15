<script setup lang="ts">
import { LoaderCircle, RotateCcw } from 'lucide-vue-next'
withDefaults(defineProps<{ label?: string; failed?: boolean; retryable?: boolean; compact?: boolean }>(), { label: 'Loading...', failed: false, retryable: false, compact: false })
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="loading-state" :class="{ 'loading-state--compact': compact }" :role="failed ? 'alert' : 'status'" aria-live="polite">
    <LoaderCircle v-if="!failed" class="loading-state__spinner" :size="compact ? 19 : 25" aria-hidden="true" />
    <span>{{ label }}</span>
    <button v-if="failed && retryable" type="button" title="重新加载" aria-label="重新加载" @click="$emit('retry')"><RotateCcw :size="17" /></button>
  </div>
</template>

<style scoped>
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 13px; min-height: 140px; width: 100%; padding: 24px; color: #787572; font: 12px/1.5 'Haffer', Arial, sans-serif; text-align: center; }
.loading-state--compact { min-height: 0; font-size: 11px; }
.loading-state__spinner { flex-shrink: 0; color: #6541f4; animation: loading-turn 1s linear infinite; }
.loading-state button { display: grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 1px solid #deddd9; border-radius: 50%; background: #fff; color: #201d1d; cursor: pointer; }
.loading-state button:focus-visible { outline: 2px solid #6541f4; outline-offset: 3px; }
@keyframes loading-turn { to { transform: rotate(360deg); } }
@media(prefers-reduced-motion: reduce) { .loading-state__spinner { animation: none; } }
</style>
