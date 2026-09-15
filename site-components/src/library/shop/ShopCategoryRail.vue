<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-vue-next'
import { shopCategories, type ShopCategoryGroup, type ShopCategoryItem } from './shopCategories'

const props = withDefaults(defineProps<{
  activeCategory?: string
  title?: string
  showNavigation?: boolean
  groups?: ShopCategoryGroup[]
}>(), {
  activeCategory: 'Women',
  title: 'Explore categories',
  showNavigation: true,
  groups: () => shopCategories,
})

const emit = defineEmits<{ 'update:activeCategory': [category: string]; select: [item: ShopCategoryItem, group: string] }>()
const baseId = useId()
const currentName = ref(props.activeCategory)
const selected = ref('')
const currentIndex = computed(() => Math.max(0, props.groups.findIndex((group) => group.name === currentName.value)))
const current = computed(() => props.groups[currentIndex.value])
const tabButtons = ref<HTMLButtonElement[]>([])

watch(() => props.activeCategory, (value) => { currentName.value = value; selected.value = '' })

function activate(index: number, focus = false) {
  const group = props.groups[index]
  if (!group) return
  currentName.value = group.name
  selected.value = ''
  emit('update:activeCategory', group.name)
  if (focus) tabButtons.value[index]?.focus()
}

function move(direction: number) {
  if (!props.groups.length) return
  activate((currentIndex.value + direction + props.groups.length) % props.groups.length)
}

function onTabKeydown(event: KeyboardEvent) {
  const count = props.groups.length
  if (!count) return
  const next = event.key === 'ArrowRight' ? (currentIndex.value + 1) % count
    : event.key === 'ArrowLeft' ? (currentIndex.value - 1 + count) % count
      : event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : -1
  if (next >= 0) { event.preventDefault(); activate(next, true) }
}

function selectItem(item: ShopCategoryItem) {
  selected.value = item.name
  emit('select', item, current.value?.name ?? '')
}
</script>

<template>
  <section class="shop-category-rail" :aria-label="title">
    <div class="rail-heading"><h3>{{ title }}</h3><div v-if="showNavigation && groups.length > 1" class="rail-controls"><button type="button" title="Previous category" aria-label="Previous category" @click="move(-1)"><ArrowLeft :size="17" aria-hidden="true" /></button><button type="button" title="Next category" aria-label="Next category" @click="move(1)"><ArrowRight :size="17" aria-hidden="true" /></button></div></div>
    <div v-if="groups.length" class="category-tabs" role="tablist" aria-label="Categories" @keydown="onTabKeydown">
      <button v-for="(group, index) in groups" :id="`${baseId}-tab-${index}`" :key="group.name" ref="tabButtons" type="button" role="tab" :aria-selected="index === currentIndex" :aria-controls="`${baseId}-panel`" :tabindex="index === currentIndex ? 0 : -1" :class="{ active: index === currentIndex }" @click="activate(index)">{{ group.name }}<ChevronRight v-if="index === currentIndex" :size="14" aria-hidden="true" /></button>
    </div>
    <div v-if="current" :id="`${baseId}-panel`" class="category-grid" role="tabpanel" :aria-labelledby="`${baseId}-tab-${currentIndex}`">
      <button v-for="item in current.items" :key="item.name" type="button" class="category-tile" :class="{ selected: selected === item.name }" :aria-pressed="selected === item.name" @click="selectItem(item)"><img :src="item.image" alt="" /><span>{{ item.name }}</span><Check v-if="selected === item.name" class="selected-check" :size="19" aria-hidden="true" /></button>
    </div>
    <p v-else class="empty-state">No categories available</p>
    <div class="selection-status" role="status"><span v-if="selected">{{ current?.name }} <ChevronRight :size="12" aria-hidden="true" /> <strong>{{ selected }}</strong></span></div>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library Shop'; src: url('/assets/shop/GTStandard-MRegular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Library Shop'; src: url('/assets/shop/GTStandard-MSemibold.woff2') format('woff2'); font-weight: 600 800; font-display: swap; }
.shop-category-rail, .shop-category-rail * { box-sizing: border-box; }
.shop-category-rail { width: 100%; max-width: 470px; margin: 0 auto; color: #080808; font-family: 'Library Shop', Arial, sans-serif; letter-spacing: 0; }
.shop-category-rail button { font: inherit; cursor: pointer; }
.rail-heading { display: flex; min-height: 35px; align-items: center; justify-content: space-between; gap: 12px; }
.rail-heading h3 { margin: 0; font-size: 21px; font-weight: 600; line-height: 1.2; overflow-wrap: anywhere; }
.rail-controls { display: flex; flex: 0 0 auto; gap: 6px; }
.rail-controls button { display: grid; width: 29px; height: 29px; place-items: center; padding: 0; border: 1px solid #e1e1e1; border-radius: 50%; background: #fff; color: #080808; }
.rail-controls button:hover { background: #f1f1f1; }
.category-tabs { display: flex; gap: 17px; margin: 7px 0 13px; overflow-x: auto; scrollbar-width: thin; }
.category-tabs button { display: inline-flex; min-height: 31px; align-items: center; justify-content: center; gap: 4px; flex: 0 0 auto; padding: 2px 0; border: 0; border-bottom: 2px solid transparent; color: #707070; background: transparent; font-size: 14px; }
.category-tabs button.active { border-bottom-color: #080808; color: #080808; font-weight: 600; }
.category-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 100px; gap: 2px; overflow: hidden; border-radius: 23px; box-shadow: 0 5px 14px rgb(0 0 0 / 9%); }
.category-tile { position: relative; min-width: 0; padding: 0; overflow: hidden; border: 0; background: #ededed; color: #fff; }
.category-tile::after { position: absolute; inset: 0; content: ''; background: linear-gradient(transparent 40%, rgb(0 0 0 / 36%)); pointer-events: none; }
.category-tile img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 350ms ease; }
.category-tile:hover img { transform: scale(1.045); }
.category-tile span { position: absolute; z-index: 1; right: 12px; bottom: 10px; left: 12px; color: #fff; font-size: 14px; font-weight: 600; line-height: 1.15; text-align: left; text-shadow: 0 1px 4px rgb(0 0 0 / 55%); overflow-wrap: anywhere; }
.selected-check { position: absolute; z-index: 1; top: 10px; right: 10px; padding: 3px; box-sizing: content-box; border-radius: 50%; background: #fff; color: #5433eb; }
.category-tile.selected { outline: 3px solid #5433eb; outline-offset: -3px; }
.shop-category-rail button:focus-visible { outline: 2px solid #5433eb; outline-offset: 2px; }
.category-tile:focus-visible { outline: 3px solid white !important; outline-offset: -5px !important; }
.selection-status { min-height: 26px; padding-top: 11px; color: #707070; font-size: 11px; }
.selection-status > span { display: flex; align-items: center; gap: 4px; }
.selection-status strong { color: #5433eb; font-weight: 600; }
.empty-state { min-height: 180px; display: grid; place-content: center; margin: 0; color: #707070; font-size: 14px; }
@media (prefers-reduced-motion: reduce) { .category-tile img { transition: none; } .category-tile:hover img { transform: none; } }
</style>
