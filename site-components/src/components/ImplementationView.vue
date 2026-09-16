<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Check, Copy, Download, LoaderCircle, RotateCcw } from 'lucide-vue-next'
import { getImplementation } from '../implementation'
import { saveFile } from '../export'

const props = defineProps<{ id: string }>()
const emit = defineEmits<{ source: [path: string, line: number]; notice: [message: string] }>()
const markdown = ref('')
const document = shallowRef<ReturnType<typeof import('../implementation-content').renderImplementation>>()
const loading = ref(true)
const error = ref('')
const reloadRequired = ref(false)
const copied = ref(false)
const article = ref<HTMLElement>()
let revision = 0

async function load() {
  const current = ++revision
  loading.value = true
  error.value = ''
  markdown.value = ''
  document.value = undefined
  copied.value = false
  reloadRequired.value = false
  try {
    const [content, { renderHighlightedImplementation }] = await Promise.all([getImplementation(props.id), import('../implementation-content').catch(cause => {
      if (current === revision) reloadRequired.value = true
      throw cause
    })])
    if (current !== revision) return
    const rendered = await renderHighlightedImplementation(content)
    if (current !== revision) return
    document.value = rendered
    markdown.value = content
  } catch { if (current === revision) error.value = '实现文档加载失败，请重试' }
  finally { if (current === revision) loading.value = false }
}
function retry() {
  if (!reloadRequired.value) return load()
  // Browsers cache failed dynamic imports until the document is reloaded.
  const url = new URL(window.location.href)
  url.hash = `/component/${props.id}?tab=implementation`
  window.history.replaceState(window.history.state, '', url)
  window.location.reload()
}
watch(() => props.id, load, { immediate: true })
onBeforeUnmount(() => { revision++ })
async function copy() {
  const current = revision
  try {
    await navigator.clipboard.writeText(markdown.value)
    if (current !== revision) return
    copied.value = true
    emit('notice', '已复制实现文档')
  } catch { emit('notice', '无法访问剪贴板，请下载文档') }
}
function followReference(event: MouseEvent) {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-source-reference]')
  if (!link) return
  event.preventDefault()
  const reference = document.value?.references.get(link.dataset.sourceReference ?? '')
  if (reference) emit('source', reference.path, reference.line)
}
function jump(id: string) {
  const heading = article.value?.querySelector<HTMLElement>(`#${id}`)
  heading?.scrollIntoView({ block: 'start' })
  heading?.setAttribute('tabindex', '-1')
  heading?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="implementation-view" :aria-busy="loading">
    <div class="implementation-toolbar">
      <span>实现详解</span>
      <div><button class="icon-button" :disabled="!markdown" :aria-label="copied ? '已复制文档' : '复制实现文档'" :title="copied ? '已复制文档' : '复制实现文档'" @click="copy"><component :is="copied ? Check : Copy" :size="16" /></button><button class="icon-button" :disabled="!markdown" aria-label="下载实现文档" title="下载实现文档" @click="saveFile(`${id}.md`, markdown, 'text/markdown;charset=utf-8')"><Download :size="16" /></button></div>
    </div>
    <div v-if="loading" class="implementation-state" role="status"><LoaderCircle class="implementation-spinner" :size="20" /><span>正在加载实现文档...</span></div>
    <div v-else-if="error" class="implementation-state" role="alert"><span>{{ reloadRequired ? '实现文档加载失败，请刷新页面重试' : error }}</span><button class="icon-button" :aria-label="reloadRequired ? '刷新页面重试' : '重新加载实现文档'" :title="reloadRequired ? '刷新页面重试' : '重新加载实现文档'" @click="retry"><RotateCcw :size="18" /></button></div>
    <div v-else-if="document" class="implementation-layout">
      <nav class="implementation-toc" aria-label="实现文档目录"><button v-for="heading in document.headings" :key="heading.id" @click="jump(heading.id)">{{ heading.label }}</button></nav>
      <article ref="article" class="implementation-article" @click="followReference" v-html="document.html" />
    </div>
  </div>
</template>

<style scoped>
.implementation-view { min-width: 0; background: #fafafa; }
.implementation-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 49px; padding: 6px 18px; border-bottom: 1px solid var(--line); font-size: 12px; }
.implementation-toolbar > div { display: flex; gap: 4px; }
.implementation-state { min-height: 520px; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; font-size: 13px; }
.implementation-spinner { animation: implementation-spin 1s linear infinite; }
.implementation-layout { display: grid; grid-template-columns: minmax(0, 1fr) 196px; align-items: start; }
.implementation-toc { grid-column: 2; grid-row: 1; position: sticky; top: 100px; max-height: calc(100vh - 130px); overflow: auto; display: grid; gap: 12px; margin: 28px 0; padding: 0 20px; border-left: 1px solid var(--line); }
.implementation-toc button { padding: 0; border: 0; background: none; text-align: left; font-size: 12px; line-height: 1.7; color: var(--muted); overflow-wrap: anywhere; }
.implementation-toc button:hover, .implementation-toc button:focus-visible { color: var(--violet); }
.implementation-article { grid-column: 1; grid-row: 1; min-width: 0; padding: 28px 32px 48px; font: 14px/1.9 'Haffer', Arial, sans-serif; overflow-wrap: anywhere; color: #302c2c; }
.implementation-article :deep(h1) { margin: 0 0 22px; font-size: 24px; line-height: 1.5; }
.implementation-article :deep(h2) { margin: 34px 0 16px; padding-top: 24px; border-top: 1px solid var(--line); font-size: 19px; line-height: 1.6; scroll-margin-top: 96px; }
.implementation-article :deep(h3) { margin: 24px 0 12px; font-size: 16px; scroll-margin-top: 96px; }
.implementation-article :deep(p) { margin: 14px 0; }
.implementation-article :deep(ul), .implementation-article :deep(ol) { padding-left: 24px; margin: 14px 0; }
.implementation-article :deep(li) { margin: 8px 0; }
.implementation-article :deep(a) { color: #5932da; text-decoration: underline; text-underline-offset: 3px; }
.implementation-article :deep(.implementation-source) { margin-top: 24px; margin-bottom: -10px; font-size: 11px; }
.implementation-article :deep(code) { padding: 2px 4px; background: #eeecef; border-radius: 3px; font-size: 12px; }
.implementation-article :deep(pre) { max-width: 100%; overflow-x: auto; margin: 20px 0; padding: 20px; background: #1e1e1e; color: #d4d4d4; border-radius: 4px; font: 12px/1.8 Consolas, 'SFMono-Regular', Menlo, Monaco, monospace; tab-size: 2; overflow-wrap: normal; }
.implementation-article :deep(pre code) { padding: 0; background: none; color: inherit; font-family: inherit; }
.implementation-article :deep(pre ::selection) { background: #264f78; }
.implementation-article :deep(.implementation-table) { overflow-x: auto; margin: 20px 0; }
.implementation-article :deep(table) { width: 100%; border-collapse: collapse; font-size: 12px; }
.implementation-article :deep(th), .implementation-article :deep(td) { min-width: 100px; padding: 10px 12px; border: 1px solid var(--line); text-align: left; vertical-align: top; }
.implementation-article :deep(th) { background: #efedef; font-weight: 500; }
.implementation-article :deep(blockquote) { margin: 20px 0; border-left: 3px solid var(--violet); padding: 0 16px; color: var(--muted); }
@keyframes implementation-spin { to { transform: rotate(360deg); } }
@media (max-width: 1100px) { .implementation-layout { display: block; } .implementation-toc { position: static; max-height: none; margin: 0; padding: 20px 24px; display: flex; flex-wrap: wrap; gap: 10px 20px; border-left: 0; border-bottom: 1px solid var(--line); } }
@media (max-width: 480px) { .implementation-article { padding: 22px 16px 36px; font-size: 13px; } .implementation-article :deep(h1) { font-size: 21px; } .implementation-article :deep(h2) { font-size: 17px; } .implementation-article :deep(pre) { padding: 14px; } .implementation-toc { padding: 16px; } }
@media (prefers-reduced-motion: reduce) { .implementation-spinner { animation: none; } }
</style>
