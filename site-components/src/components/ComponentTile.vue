<script setup lang="ts">
import { ArrowUpRight, Bookmark } from 'lucide-vue-next'
import type { ComponentEntry } from '../registry/types'
import { siteById } from '../registry'
import PreviewFrame from './PreviewFrame.vue'

defineProps<{ entry: ComponentEntry; saved: boolean }>()
defineEmits<{ save: [id: string] }>()
</script>

<template>
  <article class="component-tile">
    <a class="tile-image" :href="`#/component/${entry.id}`" :aria-label="`预览 ${entry.title}`" :style="{ background: entry.background }">
      <PreviewFrame :id="entry.id" :title="entry.title" thumbnail />
      <span class="tile-open"><ArrowUpRight :size="20" /></span>
    </a>
    <div class="tile-meta"><span>{{ siteById[entry.site].domain }}</span><span>{{ entry.category }}</span></div>
    <div class="tile-title"><a :href="`#/component/${entry.id}`">{{ entry.title }}</a>
      <button class="icon-button save-button" :class="{ 'is-saved': saved }" :aria-label="`${saved ? '取消收藏' : '收藏'} ${entry.title}`" :title="saved ? '取消收藏' : '收藏'" :aria-pressed="saved" @click="$emit('save', entry.id)"><Bookmark :size="17" :fill="saved ? 'currentColor' : 'none'" /></button>
    </div>
  </article>
</template>

<style scoped>
.component-tile { min-width: 0; }
.tile-image { position: relative; display: block; aspect-ratio: 1.55; border-radius: 5px; overflow: hidden; }
.tile-open { position: absolute; right: 12px; bottom: 12px; display: grid; place-items: center; width: 36px; height: 36px; background: var(--green); color: var(--ink); border-radius: 50%; opacity: 0; transform: translateY(8px) rotate(-30deg); transition: opacity .2s, transform .2s; }
.tile-image:hover .tile-open, .tile-image:focus-visible .tile-open { opacity: 1; transform: none; }
.tile-meta { display: flex; justify-content: space-between; gap: 8px; margin: 14px 0 5px; color: var(--muted); font-size: 11px; }
.tile-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.tile-title > a { min-width: 0; font-size: 17px; line-height: 1.35; overflow-wrap: anywhere; }
.save-button { flex: none; color: #8b8885; }
.save-button.is-saved { color: var(--violet); }
@media (prefers-reduced-motion: reduce) { .tile-open { transition: none; } }
</style>
