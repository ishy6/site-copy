<script setup lang="ts">
import { Download, ArrowUpRight } from 'lucide-vue-next'
import { sites } from '../registry'
import type { SiteStyle } from '../registry'
import { saveFile } from '../export'
defineProps<{ selectedSite: string }>()
const emit = defineEmits<{ notice: [message: string]; select: [id: string] }>()
async function copy(value: string) {
  try { await navigator.clipboard.writeText(value); emit('notice', `已复制 ${value}`) }
  catch { emit('notice', `颜色值：${value}`) }
}
function download(site: SiteStyle) {
  saveFile(`${site.id}-tokens.css`, `/* Source: ${site.source} */\n:root {\n${site.palette.map(token => `  --${site.id}-${token.name}: ${token.value};`).join('\n')}\n  --${site.id}-font: ${site.fontFamily};\n}\n`)
  emit('notice', '已下载配色与字体变量')
}
</script>

<template>
  <div class="styles-grid">
    <article v-for="site in sites.filter(item => !selectedSite || item.id === selectedSite)" :key="site.id" class="style-item">
      <div class="style-heading"><h2>{{ site.name }}</h2><button class="icon-button" :title="`下载 ${site.name} CSS 变量`" :aria-label="`下载 ${site.name} CSS 变量`" @click="download(site)"><Download :size="16" /></button></div>
      <div class="style-specimen" :style="{ background: site.color, color: site.ink, fontFamily: site.fontFamily }"><span>Aa</span><span>{{ site.font }}<small>Regular · 400</small></span></div>
      <div class="style-palette"><button v-for="token in site.palette" :key="token.name" :aria-label="`复制 ${site.name} ${token.name} ${token.value}`" :title="`${token.name} · ${token.value}`" @click="copy(token.value)"><span :style="{ background: token.value }"></span><code>{{ token.value }}</code></button></div>
      <div class="style-item-footer"><span>{{ site.domain }}</span><button @click="$emit('select', site.id)">Components<ArrowUpRight :size="14" /></button></div>
    </article>
  </div>
</template>
