<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDownUp, ArrowUpRight, Asterisk, Bookmark, Boxes, Check, ChevronRight, Grid2X2, Menu, Palette, Search, SlidersHorizontal, X } from 'lucide-vue-next'
import { categories, entries, filterEntries, sites } from './registry'
import { parseRoute, readFavorites } from './catalog-state'
import ComponentTile from './components/ComponentTile.vue'
import ComponentDetail from './components/ComponentDetail.vue'
import EmbedPreview from './components/EmbedPreview.vue'
import StyleCollection from './components/StyleCollection.vue'

const hash = ref(window.location.hash)
const updateHash = () => { hash.value = window.location.hash; mobileMenu.value = false }
window.addEventListener('hashchange', updateHash)
const route = computed(() => parseRoute(hash.value))
const selected = computed(() => entries.find(entry => entry.id === route.value.id))
const isEmbed = computed(() => route.value.view === 'preview')
watch(isEmbed, value => document.body.classList.toggle('is-preview', value), { immediate: true })
const isStyles = computed(() => route.value.view === 'styles')
const favoritesOnly = computed(() => route.value.view === 'saved')
const selectedSite = computed(() => route.value.query.get('site') || '')
const selectedCategory = ref('')
const search = ref('')
const sort = ref('curated')
const mobileMenu = ref(false)
const favorites = ref<string[]>(readFavorites().filter(id => entries.some(entry => entry.id === id)))
const notice = ref('')
const searchInput = ref<HTMLInputElement>()
const backHref = ref('#/')
let noticeTimer: ReturnType<typeof setTimeout> | undefined
watch(hash, (next, previous) => {
  if (next.startsWith('#/component/') && !previous.startsWith('#/component/')) backHref.value = previous || '#/'
  if (parseRoute(next).view !== parseRoute(previous).view || parseRoute(next).query.get('site') !== parseRoute(previous).query.get('site')) selectedCategory.value = ''
  if (!isEmbed.value) window.scrollTo({ top: 0 })
})
const filtered = computed(() => {
  const result = filterEntries(entries, { query: search.value, site: selectedSite.value, category: selectedCategory.value, favoritesOnly: favoritesOnly.value, favorites: favorites.value })
  return sort.value === 'name' ? [...result].sort((a, b) => a.title.localeCompare(b.title)) : result
})
const availableCategories = computed(() => categories.filter(category => entries.some(entry => entry.category === category)))
const pageTitle = computed(() => isStyles.value ? 'Site styles.' : favoritesOnly.value ? 'Saved components.' : selectedSite.value ? `${sites.find(site => site.id === selectedSite.value)?.name ?? 'Site'} components.` : 'The collection.')
function showNotice(message: string) {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 3500)
}
function toggleSave(id: string) {
  favorites.value = favorites.value.includes(id) ? favorites.value.filter(item => item !== id) : [...favorites.value, id]
  try { localStorage.setItem('site-components:favorites', JSON.stringify(favorites.value)) }
  catch { showNotice('浏览器未允许本地存储，收藏将在本次会话保留') }
}
function selectSite(id: string) {
  search.value = ''
  selectedCategory.value = ''
  window.location.hash = `/${isStyles.value ? 'styles' : ''}${id ? `?site=${id}` : ''}`
}
function clearFilters() { search.value = ''; selectedCategory.value = ''; window.location.hash = '/' }
function focusMain() { document.getElementById('main-content')?.focus() }
function showSiteComponents(id: string) { search.value = ''; selectedCategory.value = ''; window.location.hash = `/?site=${id}` }
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { mobileMenu.value = false; searchInput.value?.blur() }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && searchInput.value) { event.preventDefault(); searchInput.value.focus() }
}
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => { window.removeEventListener('hashchange', updateHash); window.removeEventListener('keydown', onKeydown); clearTimeout(noticeTimer) })
</script>

<template>
  <EmbedPreview v-if="isEmbed" :id="route.id" :serialized="route.query.get('props')" :thumbnail="route.query.has('thumbnail')" :request="route.query.get('r') || ''" />
  <div v-else class="app-shell">
    <a class="skip-link" href="#main-content" @click.prevent="focusMain">Skip to content</a>
    <header class="topbar">
      <a class="brand" href="#/" aria-label="Site Components 首页"><Asterisk :size="30" :stroke-width="2.4" /><span>site<span class="brand-slash">/</span>components</span></a>
      <nav class="top-nav" aria-label="主导航"><a href="#/" :class="{ active: !isStyles }">Components<span>{{ entries.length }}</span></a><a href="#/styles" :class="{ active: isStyles }">Styles<span>{{ sites.length }}</span></a></nav>
      <div class="topbar-end"><span class="collection-label">A local collection<ArrowUpRight :size="14" /></span><button class="icon-button mobile-menu-button" :aria-expanded="mobileMenu" aria-controls="sidebar" aria-label="切换侧边栏" @click="mobileMenu = !mobileMenu"><component :is="mobileMenu ? X : Menu" :size="21" /></button></div>
    </header>
    <button v-if="mobileMenu" class="sidebar-scrim" aria-label="关闭侧边栏" @click="mobileMenu = false"></button>
    <aside id="sidebar" class="sidebar" :class="{ 'sidebar--open': mobileMenu }">
      <div class="sidebar-section"><p class="sidebar-label">WORKSPACE</p><nav aria-label="组件库">
        <a href="#/" :class="{ active: !isStyles && !favoritesOnly && !selectedSite && route.view !== 'component' }"><Grid2X2 :size="17" /><span>All components</span><small>{{ entries.length }}</small></a>
        <a href="#/saved" :class="{ active: favoritesOnly }"><Bookmark :size="17" /><span>Saved</span><small>{{ favorites.length }}</small></a>
        <a href="#/styles" :class="{ active: isStyles && !selectedSite }"><Palette :size="17" /><span>Site styles</span><small>{{ sites.length }}</small></a>
      </nav></div>
      <div class="sidebar-section"><p class="sidebar-label">SOURCE PROJECTS<span>{{ sites.length.toString().padStart(2, '0') }}</span></p><nav aria-label="来源项目">
        <button v-for="site in sites" :key="site.id" :class="{ active: selectedSite === site.id || (route.view === 'component' && selected?.site === site.id) }" @click="selectSite(site.id)"><span class="site-mini" :style="{ background: site.color, color: site.ink }">{{ site.abbreviation }}</span><span>{{ site.domain }}</span><small>{{ entries.filter(entry => entry.site === site.id).length }}</small></button>
      </nav></div>
      <div class="sidebar-bottom"><Asterisk :size="24" /><div>Collected with care.<span>Built from real projects.</span></div><span class="sidebar-bottom-count">{{ entries.length.toString().padStart(2, '0') }}</span></div>
    </aside>
    <main id="main-content" class="main-content" tabindex="-1">
      <ComponentDetail v-if="route.view === 'component' && selected" :entry="selected" :saved="favorites.includes(selected.id)" :back-href="backHref" :initial-tab="route.query.get('tab') === 'implementation' ? 'implementation' : 'preview'" @save="toggleSave" @notice="showNotice" />
      <div v-else-if="route.view === 'component' || !['', 'styles', 'saved'].includes(route.view)" class="empty-state"><Boxes :size="32" /><h1>Page not found.</h1><a href="#/">Back to collection<ArrowUpRight :size="16" /></a></div>
      <template v-else>
        <div class="breadcrumb"><span>Workspace</span><ChevronRight :size="12" /><span>{{ isStyles ? 'Styles' : 'Components' }}</span></div>
        <div class="collection-heading"><div><h1>{{ pageTitle }}</h1><p>{{ isStyles ? 'Typography, colors & visual identities' : 'Independent pieces. Distinctive origins.' }}</p></div><div class="collection-total"><span>{{ isStyles ? (selectedSite ? 1 : sites.length).toString().padStart(2, '0') : filtered.length.toString().padStart(2, '0') }}</span><span>{{ isStyles ? 'site styles' : 'components' }}</span></div></div>
        <template v-if="!isStyles">
          <div class="collection-tools"><label class="search-box"><Search :size="17" /><input ref="searchInput" v-model="search" type="search" placeholder="Search components..." aria-label="搜索组件" /><span v-if="!search" class="search-hint"><Search :size="11" /></span></label><label class="sort-control"><ArrowDownUp :size="15" /><select v-model="sort" aria-label="组件排序"><option value="curated">Curated order</option><option value="name">Name, A to Z</option></select></label></div>
          <div class="category-row"><SlidersHorizontal :size="15" class="category-icon" /><div class="category-tabs" role="group" aria-label="组件类别"><button :class="{ active: !selectedCategory }" :aria-pressed="!selectedCategory" @click="selectedCategory = ''">All</button><button v-for="category in availableCategories" :key="category" :class="{ active: selectedCategory === category }" :aria-pressed="selectedCategory === category" @click="selectedCategory = category">{{ category }}</button></div></div>
          <div v-if="filtered.length" class="component-grid"><ComponentTile v-for="entry in filtered" :key="entry.id" :entry="entry" :saved="favorites.includes(entry.id)" @save="toggleSave" /></div>
          <div v-else class="empty-state"><component :is="favoritesOnly ? Bookmark : Search" :size="32" /><h2>{{ favoritesOnly && !favorites.length ? 'Your collection starts here.' : 'No components found.' }}</h2><p>{{ favoritesOnly && !favorites.length ? '暂无收藏组件' : '没有符合当前条件的组件' }}</p><button @click="clearFilters">View all components<ArrowUpRight :size="16" /></button></div>
        </template>
        <StyleCollection v-else :selected-site="selectedSite" @notice="showNotice" @select="showSiteComponents" />
        <footer class="collection-footer"><span>Site Components</span><span>{{ sites.length }} sources<span class="footer-separator">/</span>Vue 3 + TypeScript</span><Asterisk :size="20" /></footer>
      </template>
    </main>
    <Transition name="toast"><div v-if="notice" class="toast" role="status"><Check :size="16" />{{ notice }}</div></Transition>
  </div>
</template>
