<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ArrowUpRight, Search } from 'lucide-vue-next'
import { regions as defaults } from './regions'
const props = withDefaults(defineProps<{ regions?: typeof defaults; initialRegion?: string; title?: string }>(), { regions: () => defaults, initialRegion: 'JAPAN', title: 'Shoplist' })
const emit = defineEmits<{ 'region-change': [region: string] }>()
const region = ref(props.initialRegion)
const search = ref('')
const id = useId()
watch([() => props.initialRegion, () => props.regions], () => { region.value = props.regions.some(item => item.name === props.initialRegion) ? props.initialRegion : props.regions[0]?.name ?? '' }, { immediate: true })
const stores = computed(() => (props.regions.find(item => item.name === region.value)?.stores ?? []).filter(item => item.name.toLowerCase().includes(search.value.toLowerCase().trim())))
</script>
<template>
  <section class="shupatto-stores"><header><span>Shupatto</span><h2>{{ title }}</h2></header><div class="shupatto-stores__filters"><label :for="`${id}-region`">Region<select :id="`${id}-region`" v-model="region" @change="emit('region-change', region)"><option v-for="item in regions" :key="item.name">{{ item.name }}</option></select></label><label :for="`${id}-search`">Store name<div><Search :size="14" /><input :id="`${id}-search`" v-model="search" type="search" placeholder="Search stores" /></div></label></div><div class="shupatto-stores__results"><a v-for="store in stores" :key="store.href + store.name" :href="store.href" target="_blank" rel="noopener noreferrer"><span>{{ store.name }}</span><ArrowUpRight :size="15" /></a><p v-if="!stores.length">No stores found.</p></div><footer>{{ stores.length }} stores · {{ region }}</footer></section>
</template>
<style scoped>
@font-face { font-family: 'Library Shupatto'; src: url('/assets/shupatto/tt-fors.woff2'); font-display: swap; }
.shupatto-stores { width: min(100%, 570px); color: #272726; font: 13px/1.4 'Library Shupatto', Arial, sans-serif; }
.shupatto-stores header { display: flex; align-items: end; justify-content: space-between; gap: 15px; margin-bottom: 25px; }
.shupatto-stores h2 { font-size: 35px; font-weight: 500; margin: 0; }
.shupatto-stores header span { font-size: 15px; }
.shupatto-stores__filters { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
.shupatto-stores label { display: block; min-width: 0; font-size: 10px; }
.shupatto-stores select, .shupatto-stores input { min-width: 0; width: 100%; height: 38px; border: 0; color: inherit; background: none; font: 12px 'Library Shupatto', Arial, sans-serif; }
.shupatto-stores select { border-bottom: 1px solid #27272660; }
.shupatto-stores label > div { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #27272660; }
.shupatto-stores__results { max-height: 205px; overflow-y: auto; border-top: 1px solid #27272630; }
.shupatto-stores__results > a { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 4px; border-bottom: 1px solid #27272620; color: inherit; text-decoration: none; }
.shupatto-stores__results > a > span { overflow-wrap: anywhere; }
.shupatto-stores__results svg { flex-shrink: 0; }
.shupatto-stores__results p { padding: 20px 0; }
.shupatto-stores footer { padding-top: 14px; color: #777771; font-size: 10px; }
@media(max-width: 420px) { .shupatto-stores__filters { grid-template-columns: 1fr; gap: 12px; } }
</style>
