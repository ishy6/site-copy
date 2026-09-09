<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowUpRight, ChevronDown, Menu, X, ArrowRight, HelpCircle } from 'lucide-vue-next'
import HomePage from './components/HomePage.vue'
import AuthFlow from './components/AuthFlow.vue'
import WorkspacePage from './components/WorkspacePage.vue'
import { guardedPath, pendingTemplate, profile, storageWarning } from './state'

const normalizePath = () => window.location.pathname.replace(/\/$/, '') || '/'
const route = ref(guardedPath(normalizePath()))
if (route.value !== normalizePath()) history.replaceState({}, '', route.value)
const mobileMenu = ref(false)
const submenu = ref('')
const helpOpen = ref(false)
const isMarketing = computed(() => !['/join', '/login', '/onboarding', '/files'].includes(route.value))
const knownPage = computed(() => ['/', '/templates', '/pricing', '/join', '/login', '/onboarding', '/files'].includes(route.value))
const pageTitles: Record<string, string> = { '/': 'Design in motion', '/join': 'Get started', '/login': 'Welcome back', '/onboarding': 'Welcome to Jitter', '/templates': 'Motion design templates', '/pricing': 'Plans for every creator', '/files': 'Your workspace' }

function navigate(path: string) {
  const [pathname = '/', hash] = path.split('#')
  route.value = guardedPath(pathname)
  history.pushState({}, '', route.value + (hash ? `#${hash}` : ''))
  mobileMenu.value = false
  submenu.value = ''
  helpOpen.value = false
  document.title = `Jitter — ${pageTitles[route.value] || 'Page not found'}`
  nextTick(() => {
    if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
  })
}

function start(template?: number) {
  if (template) pendingTemplate.value = template
  navigate(profile.active ? (profile.complete ? '/files' : '/onboarding') : '/join')
}

function onPopState() {
  route.value = guardedPath(normalizePath())
  if (route.value !== normalizePath()) history.replaceState({}, '', route.value)
  mobileMenu.value = false
  submenu.value = ''
  document.title = `Jitter — ${pageTitles[route.value] || 'Page not found'}`
}
function onEscape(event: KeyboardEvent) { if (event.key === 'Escape') { mobileMenu.value = false; submenu.value = ''; helpOpen.value = false } }
onMounted(() => { window.addEventListener('popstate', onPopState); window.addEventListener('keydown', onEscape) })
onBeforeUnmount(() => { window.removeEventListener('popstate', onPopState); window.removeEventListener('keydown', onEscape) })
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header v-if="isMarketing" class="site-header">
    <div class="nav-shell">
      <a href="/" class="brand" aria-label="Jitter homepage" @click.prevent="navigate('/')"><img src="/assets/jitter.svg" alt="Jitter" width="82" height="28" /></a>
      <nav class="desktop-nav" aria-label="Main navigation">
        <div class="nav-item" @mouseenter="submenu = 'Product'" @mouseleave="submenu = ''">
          <button :aria-expanded="submenu === 'Product'" @click="submenu = submenu === 'Product' ? '' : 'Product'">Product <ChevronDown :size="13" /></button>
          <div v-if="submenu === 'Product'" class="nav-dropdown">
            <button @click="navigate('/#product')"><span class="drop-icon">↗</span><span><b>Meet your new motion tool</b><small>From first idea to final export.</small></span></button>
            <button @click="navigate('/#features')"><span class="drop-icon lilac">✳</span><span><b>Powerful. Playful. All yours.</b><small>Explore the features.</small></span></button>
            <button @click="navigate('/#collaboration')"><span class="drop-icon lime">↔</span><span><b>Made for creative teams</b><small>Bring everyone into the flow.</small></span></button>
          </div>
        </div>
        <a href="/#customers" @click.prevent="navigate('/#customers')">Customers</a>
        <a href="/templates" :aria-current="route === '/templates' ? 'page' : undefined" @click.prevent="navigate('/templates')">Templates</a>
        <a href="/pricing" :aria-current="route === '/pricing' ? 'page' : undefined" @click.prevent="navigate('/pricing')">Pricing</a>
      </nav>
      <div class="nav-actions"><a href="/login" class="login-link" @click.prevent="navigate(profile.active && profile.complete ? '/files' : '/login')">{{ profile.active && profile.complete ? 'My workspace' : 'Log in' }}</a><button class="button dark nav-cta" @click="start()">Try for free</button><button class="icon-button mobile-toggle" :aria-expanded="mobileMenu" :aria-label="mobileMenu ? 'Close menu' : 'Open menu'" @click="mobileMenu = !mobileMenu"><X v-if="mobileMenu" :size="22" /><Menu v-else :size="22" /></button></div>
    </div>
    <nav v-if="mobileMenu" class="mobile-nav" aria-label="Mobile navigation"><a v-for="item in [['Product', '/#product'], ['Customers', '/#customers'], ['Templates', '/templates'], ['Pricing', '/pricing'], ['Log in', '/login']]" :key="item[0]" :href="item[1]" @click.prevent="navigate(item[1]!)">{{ item[0] }}<ArrowUpRight :size="20" /></a></nav>
  </header>

  <main v-if="!knownPage" id="main-content" class="not-found" tabindex="-1"><span class="eyebrow">404 · A little off the timeline</span><h1>Let’s get you<br />back in motion.</h1><button class="button purple" @click="navigate('/')">Back to homepage <ArrowRight :size="20" /></button></main>
  <AuthFlow v-else-if="['/join', '/login', '/onboarding'].includes(route)" :route="route" @navigate="navigate" />
  <WorkspacePage v-else-if="route === '/files'" @navigate="navigate" />
  <HomePage v-else :route="route" @navigate="navigate" @start="start" />

  <div v-if="storageWarning" class="storage-warning" role="alert">{{ storageWarning }}</div>
  <aside v-if="helpOpen" id="help-panel" class="help-panel"><div><b>A little help getting started?</b><button class="icon-button" aria-label="Close help" @click="helpOpen = false"><X :size="18" /></button></div><p>This is a local Jitter replica. Try the guided setup, explore templates, and make your first animation.</p><button @click="start()">Take the guided tour <ArrowRight :size="18" /></button><a href="https://help.jitter.video/" target="_blank" rel="noreferrer">Visit the official help center <ArrowUpRight :size="16" /></a><small>No real accounts or emails are created.</small></aside>
  <button v-if="isMarketing" class="help-button" aria-label="Help and getting started" :aria-expanded="helpOpen" aria-controls="help-panel" @click="helpOpen = !helpOpen"><X v-if="helpOpen" :size="21" /><HelpCircle v-else :size="22" /></button>
</template>
