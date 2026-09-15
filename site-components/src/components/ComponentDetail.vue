<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Code2, Copy, Download, LoaderCircle, Maximize2, Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-vue-next'
import type { ComponentEntry } from '../registry/types'
import { defaultProps, getSource, siteById } from '../registry'
import { exportComponent } from '../export'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ entry: ComponentEntry; saved: boolean; backHref: string }>()
const emit = defineEmits<{ save: [id: string]; notice: [message: string] }>()
const activeTab = ref('preview')
const viewport = ref('desktop')
const values = ref<Record<string, string | number | boolean>>({})
const activeFile = ref('')
const refresh = ref(0)
const copied = ref(false)
const downloading = ref(false)
const sourceContent = ref('')
const sourceLoading = ref(false)
const sourceError = ref('')
let sourceRequest = 0
watch(() => props.entry.id, () => {
  values.value = defaultProps(props.entry)
  activeFile.value = props.entry.files[0] ?? ''
  activeTab.value = 'preview'
  viewport.value = 'desktop'
}, { immediate: true })
const source = computed(() => activeTab.value === 'usage' ? props.entry.usage : sourceContent.value)
const standaloneUrl = computed(() => `#/preview/${props.entry.id}?${new URLSearchParams({ props: JSON.stringify(values.value) })}`)
function reset() { values.value = defaultProps(props.entry); refresh.value++ }
async function loadSource() {
  const request = ++sourceRequest
  sourceContent.value = ''
  sourceError.value = ''
  sourceLoading.value = activeTab.value === 'source'
  if (!sourceLoading.value) return
  try {
    const content = await getSource(activeFile.value)
    if (request === sourceRequest) sourceContent.value = content
  } catch {
    if (request === sourceRequest) sourceError.value = '源码加载失败'
  } finally {
    if (request === sourceRequest) sourceLoading.value = false
  }
}
watch([() => props.entry.id, activeTab, activeFile], loadSource, { immediate: true })
onBeforeUnmount(() => { sourceRequest++ })
async function copy() {
  const request = sourceRequest
  try {
    const content = activeTab.value === 'usage' ? props.entry.usage : await getSource(activeFile.value)
    if (request !== sourceRequest) return
    await navigator.clipboard.writeText(content)
    if (request !== sourceRequest) return
    copied.value = true
    emit('notice', '已复制到剪贴板')
  }
  catch { emit('notice', '无法访问剪贴板，请选择源码复制') }
}
watch(source, () => { copied.value = false })
async function download() {
  downloading.value = true
  try { await exportComponent(props.entry); emit('notice', '组件源码与素材已打包下载') }
  catch (error) { emit('notice', error instanceof Error ? error.message : '下载失败，请重试') }
  finally { downloading.value = false }
}
</script>

<template>
  <div class="detail-page">
    <a class="back-link" :href="backHref"><ArrowLeft :size="16" />Back to collection</a>
    <div class="detail-heading">
      <div><div class="detail-origin"><span class="site-mini" :style="{ background: siteById[entry.site].color, color: siteById[entry.site].ink }">{{ siteById[entry.site].abbreviation }}</span>{{ siteById[entry.site].domain }}<span class="origin-divider">/</span>{{ entry.category }}</div>
        <h1>{{ entry.title }}</h1><p>{{ entry.summary }}</p></div>
      <button class="icon-button" :class="{ 'is-saved': saved }" :title="saved ? '取消收藏' : '收藏组件'" :aria-label="saved ? '取消收藏' : '收藏组件'" :aria-pressed="saved" @click="$emit('save', entry.id)"><Bookmark :size="20" :fill="saved ? 'currentColor' : 'none'" /></button>
    </div>
    <div class="workbench">
      <div class="workbench-toolbar">
        <div class="workbench-tabs" role="tablist" aria-label="组件视图">
          <button v-for="tab in ['preview', 'source', 'usage']" :key="tab" :id="`tab-${tab}`" role="tab" :aria-selected="activeTab === tab" aria-controls="component-panel" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ { preview: 'Preview', source: 'Source', usage: 'Usage' }[tab] }}</button>
        </div>
        <div class="toolbar-actions">
          <a class="icon-button" :href="standaloneUrl" target="_blank" rel="noopener" title="独立窗口预览" aria-label="独立窗口预览"><ArrowUpRight :size="18" /></a>
          <button class="download-button" :disabled="downloading" aria-label="Download" title="下载组件源码与素材" @click="download"><Download :size="15" /><span>{{ downloading ? 'Packaging...' : 'Download' }}</span></button>
        </div>
      </div>
      <div v-if="activeTab === 'preview'" id="component-panel" role="tabpanel" aria-labelledby="tab-preview" class="preview-workspace">
        <div class="preview-main">
          <div class="canvas-toolbar">
            <span class="canvas-label">Live preview</span>
            <div class="viewport-switch" role="group" aria-label="预览尺寸">
              <button v-for="size in ['desktop', 'tablet', 'mobile']" :key="size" class="icon-button" :class="{ active: viewport === size }" :aria-pressed="viewport === size" :title="{ desktop: '自适应桌面', tablet: '平板 768px', mobile: '手机 375px' }[size]" :aria-label="`${size} viewport`" @click="viewport = size"><component :is="size === 'desktop' ? Monitor : size === 'tablet' ? Tablet : Smartphone" :size="16" /></button>
            </div>
            <button class="icon-button" title="重置预览" aria-label="重置预览" @click="reset"><RotateCcw :size="16" /></button>
          </div>
          <div class="canvas-surround"><div class="canvas-device" :class="`canvas-device--${viewport}`"><PreviewFrame :id="entry.id" :title="entry.title" :values="values" :refresh="refresh" /></div></div>
          <div class="canvas-footer"><span><Maximize2 :size="12" />{{ viewport === 'desktop' ? 'Responsive' : viewport === 'tablet' ? '768px max' : '375px max' }}</span><span>Vue 3 · TypeScript</span></div>
        </div>
        <aside class="properties">
          <div class="properties-heading"><h2>Properties</h2><button class="icon-button" title="恢复默认参数" aria-label="恢复默认参数" @click="reset"><RotateCcw :size="14" /></button></div>
          <div v-for="control in entry.props" :key="control.name" class="property-field" :class="{ 'property-field--boolean': control.type === 'boolean' }">
            <label :for="`prop-${control.name}`">{{ control.label }}<code>{{ control.name }}</code></label>
            <input v-if="control.type === 'boolean'" :id="`prop-${control.name}`" v-model="values[control.name]" type="checkbox" />
            <select v-else-if="control.type === 'select'" :id="`prop-${control.name}`" v-model="values[control.name]"><option v-for="option in control.options" :key="option" :value="option">{{ option }}</option></select>
            <input v-else-if="control.type === 'number'" :id="`prop-${control.name}`" v-model.number="values[control.name]" type="number" :min="control.min" :max="control.max" :step="control.step || 1" />
            <input v-else :id="`prop-${control.name}`" v-model="values[control.name]" :type="control.type === 'color' ? 'color' : 'text'" />
            <p v-if="control.description">{{ control.description }}</p>
          </div>
          <div v-if="!entry.props.length" class="properties-empty">No configurable properties.</div>
        </aside>
      </div>
      <div v-else id="component-panel" role="tabpanel" :aria-labelledby="`tab-${activeTab}`" :aria-busy="sourceLoading" class="source-workspace">
        <div class="source-toolbar"><div class="source-file-list"><button v-for="file in activeTab === 'source' ? entry.files : ['Example.vue']" :key="file" :class="{ active: activeTab === 'usage' || activeFile === file }" @click="activeTab === 'source' && (activeFile = file)"><Code2 :size="13" />{{ file.split('/').pop() }}</button></div><button class="icon-button" :disabled="sourceLoading || !!sourceError" :title="copied ? '已复制' : '复制源码'" :aria-label="copied ? '已复制' : '复制源码'" @click="copy"><component :is="copied ? Check : Copy" :size="16" /></button></div>
        <div v-if="sourceLoading" class="source-state" role="status"><LoaderCircle class="source-spinner" :size="20" /><span>Loading source...</span></div>
        <div v-else-if="sourceError" class="source-state" role="alert"><span>{{ sourceError }}</span><button class="icon-button" aria-label="重新加载源码" title="重新加载源码" @click="loadSource"><RotateCcw :size="18" /></button></div>
        <pre v-else tabindex="0"><code>{{ source }}</code></pre>
      </div>
    </div>
    <div class="provenance"><div><h2>Original source</h2><code>{{ entry.source }}</code></div><span class="source-kind">{{ entry.sourceKind === 'extracted' ? 'Existing component' : 'Extracted pattern' }}</span></div>
    <div class="detail-tags"><span v-for="tag in entry.tags" :key="tag">#{{ tag }}</span></div>
  </div>
</template>

<style scoped>
.source-state { height: 520px; display: flex; align-items: center; justify-content: center; gap: 10px; background: #242120; color: #bdbdbd; font-size: 13px; }
.source-state .icon-button { color: inherit; }
.source-spinner { animation: source-spin 1s linear infinite; }
@keyframes source-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .source-spinner { animation: none; } }
</style>
