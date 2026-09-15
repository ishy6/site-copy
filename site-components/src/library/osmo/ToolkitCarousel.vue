<script setup lang="ts">
import { computed, toRef, useId, watch } from 'vue'
import { ArrowLeft, ArrowRight, Asterisk } from 'lucide-vue-next'
import MotionButton from './MotionButton.vue'
import { toolkitItems, type ToolkitItem } from './toolkit'
import { useSlides, useSlideSwipe } from './carousel'
const props = withDefaults(defineProps<{ items?: ToolkitItem[]; initialIndex?: number; title?: string }>(), { items: () => toolkitItems, initialIndex: 0, title: 'The toolkit' })
const emit = defineEmits<{ change: [index: number]; select: [item: ToolkitItem] }>()
const { index, select, move, onKeydown, counter } = useSlides(computed(() => props.items.length), toRef(props, 'initialIndex'))
const active = computed(() => props.items[index.value])
const id = useId()
watch(index, value => emit('change', value))
function tabKey(event: KeyboardEvent) { onKeydown(event); (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('button')[index.value]?.focus() }
const { begin, end, cancel, suppressDraggedClick } = useSlideSwipe(move)
</script>
<template>
  <section class="osmo-toolkit" :aria-label="title"><div class="osmo-toolkit__top"><h3>{{ title }}</h3><span>{{ counter }}</span></div>
    <div class="osmo-toolkit__tabs" role="tablist" :aria-label="title"><button v-for="(item, i) in items" :id="`${id}-tab-${i}`" :key="item.id" type="button" role="tab" :tabindex="i === index ? 0 : -1" :aria-selected="i === index" :aria-controls="`${id}-panel`" @click="select(i)" @keydown="tabKey">{{ item.title }}</button></div>
    <div v-if="active" :id="`${id}-panel`" class="osmo-toolkit__panel" role="tabpanel" :aria-labelledby="`${id}-tab-${index}`" @pointerdown="begin" @pointerup="end" @pointercancel="cancel" @pointerleave="cancel" @click.capture="suppressDraggedClick">
      <div class="osmo-toolkit__copy"><Asterisk :size="29" /><h2>{{ active.title }}</h2><p>{{ active.description }}</p><MotionButton label="Discover" :href="active.href" @click="emit('select', active)" /></div><div class="osmo-toolkit__media"><img :key="active.image" :src="active.image" :alt="active.title" draggable="false" /></div>
    </div><p v-else>No products available.</p>
    <div class="osmo-toolkit__controls"><button type="button" aria-label="Previous product" :disabled="items.length < 2" @click="move(-1)"><ArrowLeft :size="17" /></button><button type="button" aria-label="Next product" :disabled="items.length < 2" @click="move(1)"><ArrowRight :size="17" /></button></div>
  </section>
</template>
<style scoped>
.osmo-toolkit { width: min(100%, 650px); color: #201d1d; font: 14px/1.4 'Haffer', Arial, sans-serif; }
.osmo-toolkit__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.osmo-toolkit__top h3 { margin: 0; font-size: 23px; font-weight: 450; }
.osmo-toolkit__top span { font-size: 11px; }
.osmo-toolkit__tabs { display: flex; gap: 7px; margin-bottom: 14px; overflow-x: auto; }
.osmo-toolkit__tabs button { border: 1px solid #201d1d30; border-radius: 3px; color: inherit; background: none; font: 11px/1.4 inherit; padding: 7px 10px; white-space: nowrap; cursor: pointer; }
.osmo-toolkit__tabs button[aria-selected=true] { background: #201d1d; color: #f4f4f4; }
.osmo-toolkit__panel { display: grid; grid-template-columns: 1fr 1fr; min-height: 235px; overflow: hidden; border-radius: 4px; background: #b1ff69; touch-action: pan-y; }
.osmo-toolkit__copy { min-width: 0; padding: 22px; }
.osmo-toolkit__media { position: relative; min-width: 0; }
.osmo-toolkit__panel h2 { font-size: 28px; line-height: 1.1; font-weight: 450; margin: 12px 0; overflow-wrap: anywhere; }
.osmo-toolkit__panel p { margin: 0 0 14px; font-size: 12px; line-height: 1.5; }
.osmo-toolkit__panel img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: bottom; }
.osmo-toolkit__panel :deep(.osmo-button) { min-height: 35px; font-size: 13px; padding: 8px 12px; gap: 14px; }
.osmo-toolkit__controls { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.osmo-toolkit__controls button { display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid #201d1d30; border-radius: 50%; background: none; color: inherit; cursor: pointer; }
@media(max-width: 440px) { .osmo-toolkit__panel { grid-template-columns: 1fr; } .osmo-toolkit__media { height: 150px; grid-row: 1; } .osmo-toolkit__copy { padding: 18px; } .osmo-toolkit__panel h2 { font-size: 25px; } }
</style>
