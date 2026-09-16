<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ code: string; language: string; activeLine?: number }>(), { activeLine: 0 })
const html = ref('')
const highlighting = ref(false)
const container = ref<HTMLElement>()
const lines = computed(() => props.code.split('\n'))
let revision = 0

async function markActiveLine() {
  await nextTick()
  for (const line of container.value?.querySelectorAll<HTMLElement>('[data-line]') ?? []) {
    line.classList.toggle('source-line--active', Number(line.dataset.line) === props.activeLine)
  }
  if (props.activeLine) container.value?.querySelector('.source-line--active')?.scrollIntoView({ block: 'center' })
}
watch([() => props.code, () => props.language], async () => {
  const current = ++revision
  html.value = ''
  highlighting.value = true
  try {
    const { highlightCode } = await import('../syntax-highlighter')
    if (current !== revision) return
    const result = await highlightCode(props.code, props.language)
    if (current === revision) html.value = result
  } catch {
    // Syntax highlighting is optional; the original source remains readable.
  } finally {
    if (current === revision) highlighting.value = false
  }
}, { immediate: true })
watch([html, () => props.activeLine, () => props.code], markActiveLine, { immediate: true })
onBeforeUnmount(() => { revision++ })
</script>

<template>
  <div ref="container" class="highlighted-code" :aria-busy="highlighting">
    <div v-if="html" v-html="html" />
    <pre v-else tabindex="0"><code><span v-for="(line, index) in lines" :key="index" class="source-line" :data-line="index + 1">{{ line }}{{ index < lines.length - 1 ? '\n' : '' }}</span></code></pre>
  </div>
</template>

<style scoped>
.highlighted-code { min-width: 0; }
.highlighted-code :deep(pre) { background: #1e1e1e; color: #d4d4d4; font-family: Consolas, 'SFMono-Regular', Menlo, Monaco, monospace; }
.highlighted-code :deep(code) { font-family: inherit; }
.highlighted-code :deep(.source-line--active) { background: #264f78; outline: 1px solid #515151; }
.highlighted-code :deep(pre ::selection) { background: #264f78; }
</style>
