<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, X, Play, Plus, Minus, MoveUpRight, MousePointer2, Layers, Download, Sparkles } from 'lucide-vue-next'
import VideoTile from './VideoTile.vue'
import { isEmail, templates } from '../state'

defineProps<{ route: string }>()
const emit = defineEmits<{ navigate: [path: string]; start: [template?: number] }>()
const gallery = ref<HTMLElement>()
const selectedTemplate = ref<(typeof templates)[number] | null>(null)
const modal = ref<HTMLDialogElement>()
const search = ref('')
const category = ref('All templates')
const categories = ['All templates', 'Social media', 'UI & product', 'Marketing', 'Typography']
const filteredTemplates = computed(() => templates.filter(template => (category.value === 'All templates' || template.category === category.value) && template.name.toLowerCase().includes(search.value.toLowerCase())))
const email = ref('')
const newsletterMessage = ref('')
const yearly = ref(true)
const activeFaq = ref<number | null>(0)
const faqs = [
  ['Can I use Jitter for free?', 'Yes. Explore the local demo, start with a template, and create your first project without payment details. This replica does not include paid subscriptions.'],
  ['Do I need motion design experience?', 'Not at all. The guided setup helps you find a starting point, and ready-to-use templates make it easy to learn by doing.'],
  ['Can I import my Figma designs?', 'The official Jitter product supports Figma import. In this local replica, you can try the editor with a template or a blank project; Figma import is not connected.'],
  ['Where are my projects saved?', 'Demo projects are stored in this browser on this device. There is no cloud sync, real authentication, or connection to the official Jitter service.'],
]
const plans = [
  { name: 'Free', tagline: 'A little curiosity. Endless possibility.', monthly: 0, annual: 0, features: ['Unlimited local demo files', 'Ready-to-use motion templates', 'Personal workspace', 'SVG design download'], button: 'Start creating for free' },
  { name: 'Pro', tagline: 'For your next creative leap.', monthly: 18, annual: 12, features: ['Everything in Free', 'High-resolution exports', 'Transparent backgrounds', 'Custom fonts & premium features'], button: 'Explore with a free demo' },
  { name: 'Team', tagline: 'Great motion is a team sport.', monthly: 30, annual: 24, features: ['Everything in Pro', 'Shared team libraries', 'Real-time collaboration', 'Centralized team billing'], button: 'Set up your demo workspace' },
]

function moveGallery(direction: number) { gallery.value?.scrollBy({ left: direction * 420, behavior: 'smooth' }) }
async function openTemplate(template: (typeof templates)[number]) { selectedTemplate.value = template; await nextTick(); modal.value?.showModal() }
function closeTemplate() { modal.value?.close(); selectedTemplate.value = null }
function useTemplate() { const template = selectedTemplate.value?.id; closeTemplate(); emit('start', template) }
function subscribe() { newsletterMessage.value = isEmail(email.value) ? 'You’re on the demo list! No email was sent or subscription created.' : 'Please enter a valid email address.' }
onBeforeUnmount(() => modal.value?.close())
</script>

<template>
  <main id="main-content" tabindex="-1">
    <template v-if="route === '/'">
      <section class="hero content-width">
        <a class="announcement" href="#product" @click.prevent="emit('navigate', '/#product')"><span><b>Superagents:</b> AI agents, built right into Jitter</span><span class="announcement-link">Learn more <ArrowUpRight :size="13" /></span></a>
        <h1>Design in motion.<br />Now with AI.</h1>
        <button class="button purple hero-cta" @click="emit('start')">Try Jitter for free</button>
        <div id="customers" class="trust"><div class="trust-copy"><span></span><p><strong>Over 20,000 creative teams use Jitter</strong> to create stunning animations online.</p><span></span></div><div class="customer-logos"><img v-for="brand in ['google', 'gamma', 'perplexity', 'dept', 'deliveroo', 'tiktok']" :key="brand" :src="`/assets/${brand}.svg`" :alt="brand" /></div></div>
      </section>

      <section class="showcase" aria-label="Motion design showcase">
        <div ref="gallery" class="showcase-track"><button v-for="template in templates" :key="template.id" class="showcase-card" @click="openTemplate(template)"><VideoTile :source="`/assets/template-${template.id}.mp4`" :label="template.name" /><span class="open-template">Open template <ArrowUpRight :size="18" /></span><span class="showcase-caption"><span class="creator-avatar">J</span><span><b>{{ template.name }}</b><small>Jitter</small></span><ArrowUpRight class="caption-arrow" :size="19" /></span></button></div>
        <div class="showcase-controls content-width"><a href="/templates" @click.prevent="emit('navigate', '/templates')">A little inspiration to get you moving <ArrowRight :size="18" /></a><div><button class="icon-button outlined" aria-label="Previous templates" @click="moveGallery(-1)"><ChevronLeft :size="20" /></button><button class="icon-button outlined" aria-label="Next templates" @click="moveGallery(1)"><ChevronRight :size="20" /></button></div></div>
      </section>

      <section id="product" class="product-section content-width">
        <p class="big-statement">Jitter helps creative teams design and ship polished animations at scale. <span>Kickstart ideas and generate effects with AI, then take full creative control to fine-tune every detail until it’s unmistakably yours.</span></p>
        <div class="product-video"><VideoTile source="/assets/product-demo.mp4" label="Jitter motion design editor preview" /><button class="watch-pill" @click="emit('start')"><Play :size="15" fill="currentColor" /> Give it a try</button></div>
        <div class="section-heading"><span class="eyebrow">Animation, accelerated</span><h2>From idea to motion<br />in seconds</h2><p>Turn static designs into animated assets in no time. Kickstart with AI, customize every detail, and easily produce on-brand videos at scale.</p></div>
        <div class="workflow-grid"><article><span class="step-number">01</span><Layers :size="26" /><h3>Bring your ideas.</h3><p>Start fresh, pick a template, or bring your designs from Figma.</p></article><article><span class="step-number">02</span><Sparkles :size="26" /><h3>Make your move.</h3><p>Play with animation presets and intuitive, fine-tuned controls.</p></article><article><span class="step-number">03</span><Download :size="26" /><h3>Share something great.</h3><p>From the first frame to the final export. Ready for the world.</p></article></div>
      </section>

      <section id="features" class="features-section content-width">
        <div class="section-heading"><span class="eyebrow">Creative range</span><h2>Supercharge your<br />creativity</h2><p>Powerful animation features. Intuitive controls. Everything you need to deliver work you’re proud of.</p><button class="text-link" @click="emit('start')">Explore the creative playground <ArrowUpRight :size="19" /></button></div>
        <div class="feature-grid"><article class="feature-card typography-feature"><div class="kinetic-type"><span>Make</span><span>some</span><span>moves.</span><MousePointer2 class="creative-cursor" :size="28" fill="#b498f5" /></div><div class="feature-copy"><h3>Big ideas. Bold motion.</h3><p>Turn everyday type into something you can’t look away from.</p></div></article><article class="feature-card preset-feature"><div class="preset-stage"><div class="preset-square"></div><div class="preset-label"><span></span> Scale in <Check :size="14" /></div></div><div class="feature-copy"><h3>A little preset. A lot of possibility.</h3><p>Start with a simple effect. Make it completely your own.</p></div></article></div>
        <div class="detail-row"><h3>Details worth<br />obsessing over</h3><div><b>Intuitive timeline</b><p>Every beat, perfectly placed.</p></div><div><b>Custom easing</b><p>Find your own rhythm.</p></div><div><b>Beautiful exports</b><p>Made to look good, anywhere.</p></div></div>
      </section>

      <section class="quote-section"><div class="content-width"><img src="/assets/perplexity.svg" alt="Perplexity" /><h2>“Jitter gives you no excuse<br />to skip motion.<br /><span>It’s that easy.</span>”</h2><p>Bringing brands to life, one frame at a time.</p><a href="#collaboration" @click.prevent="emit('navigate', '/#collaboration')">Meet your team’s new creative space <ArrowUpRight :size="19" /></a></div></section>

      <section id="collaboration" class="collaboration-section content-width"><div><span class="eyebrow">Better, together</span><h2>Great minds.<br />Great motion.</h2><p>One shared space for your team’s next big thing. Keep your files organized, share ideas, and make your best work together.</p><button class="button dark" @click="emit('start')">Find your flow <ArrowRight :size="18" /></button></div><div class="collab-art"><div class="collab-file"><div><span class="tiny-dot"></span> Brand exploration <span>•••</span></div><div class="collab-canvas"><span>Good<br /><i>together.</i></span></div><div class="collab-timeline"><i></i><i></i><i></i></div></div><span class="collab-cursor cursor-one"><MousePointer2 :size="22" fill="currentColor" /><b>Alex</b></span><span class="collab-cursor cursor-two"><MousePointer2 :size="22" fill="currentColor" /><b>You</b></span><div class="collab-comment"><span>J</span><p>That’s the one. Love it! <b>♥</b></p></div></div></section>

      <section class="template-section content-width"><div class="section-heading"><span class="eyebrow">Skip the blank canvas</span><h2>Never start from<br />scratch again</h2><p>Your next great idea starts here. A collection of beautifully designed, completely customizable templates.</p><a class="button dark" href="/templates" @click.prevent="emit('navigate', '/templates')">Explore templates <ArrowUpRight :size="18" /></a></div><div class="mini-template-grid"><button v-for="template in templates.slice(3)" :key="template.id" @click="openTemplate(template)"><VideoTile :source="`/assets/template-${template.id}.mp4`" :label="template.name" /><span>{{ template.name }} <ArrowUpRight :size="17" /></span></button></div></section>
      <section class="faq-section content-width"><h2>A few good questions.</h2><div><article v-for="(faq, index) in faqs" :key="faq[0]" class="faq-item"><button :aria-expanded="activeFaq === index" :aria-controls="`faq-${index}`" @click="activeFaq = activeFaq === index ? null : index">{{ faq[0] }}<Minus v-if="activeFaq === index" :size="20" /><Plus v-else :size="20" /></button><p v-if="activeFaq === index" :id="`faq-${index}`">{{ faq[1] }}</p></article></div></section>
    </template>

    <template v-else-if="route === '/templates'">
      <section class="template-library content-width"><div class="section-heading"><span class="eyebrow">A head start for your next big idea</span><h1>Made to make<br />your own.</h1><p>Beautiful motion templates. Endless possibilities.</p></div><div class="library-tools"><div class="category-tabs" aria-label="Template categories"><button v-for="item in categories" :key="item" :class="{ active: category === item }" :aria-pressed="category === item" @click="category = item">{{ item }}</button></div><input v-model="search" type="search" aria-label="Search templates" placeholder="Search templates…" /></div><div class="library-grid"><button v-for="template in filteredTemplates" :key="template.id" class="library-card" @click="openTemplate(template)"><VideoTile :source="`/assets/template-${template.id}.mp4`" :label="template.name" /><span><b>{{ template.name }}</b><ArrowUpRight :size="18" /></span><small>{{ template.category }} · By Jitter</small></button></div><div v-if="!filteredTemplates.length" class="empty-search"><h3>No templates found.</h3><p>Try another search or explore a different category.</p><button class="button pale" @click="search = ''; category = 'All templates'">Clear filters</button></div></section>
    </template>

    <template v-else-if="route === '/pricing'">
      <section class="pricing-section content-width"><div class="section-heading"><span class="eyebrow">Less friction. More creation.</span><h1>Find your flow.</h1><p>A little motion goes a long way. Start for free.</p><div class="billing-toggle"><button :class="{ active: !yearly }" :aria-pressed="!yearly" @click="yearly = false">Monthly</button><button :class="{ active: yearly }" :aria-pressed="yearly" @click="yearly = true">Yearly <span>Save up to 33%</span></button></div></div><p class="pricing-disclaimer">Illustrative demo plans, not an official pricing quote. No payment is collected.</p><div class="pricing-grid"><article v-for="plan in plans" :key="plan.name" :class="['pricing-card', { featured: plan.name === 'Pro' }]"><span v-if="plan.name === 'Pro'" class="popular-label">A creative favorite</span><h2>{{ plan.name }}</h2><p>{{ plan.tagline }}</p><div class="price">${{ yearly ? plan.annual : plan.monthly }}<small>/ editor / month</small></div><small>{{ plan.name === 'Free' ? 'Free, always' : yearly ? 'Billed yearly · demo only' : 'Billed monthly · demo only' }}</small><button :class="['button', plan.name === 'Pro' ? 'purple' : 'dark']" @click="emit('start')">{{ plan.button }}</button><ul><li v-for="feature in plan.features" :key="feature"><Check :size="17" />{{ feature }}</li></ul></article></div></section>
    </template>

    <section class="final-cta"><span class="eyebrow">Your next great idea is waiting</span><h2>Try Jitter today</h2><button class="button dark" @click="emit('start')">Make your first move <MoveUpRight :size="20" /></button><p>Free to start. Made for you.</p><div class="cta-decoration" aria-hidden="true">✳</div></section>
    <footer class="site-footer content-width"><div class="footer-top"><a href="/" aria-label="Jitter homepage" @click.prevent="emit('navigate', '/')"><img src="/assets/jitter.svg" alt="Jitter" width="82" /></a><div><a href="/#product" @click.prevent="emit('navigate', '/#product')">Product</a><a href="/templates" @click.prevent="emit('navigate', '/templates')">Templates</a><a href="/pricing" @click.prevent="emit('navigate', '/pricing')">Pricing</a></div><div><a href="/#customers" @click.prevent="emit('navigate', '/#customers')">Customers</a><a href="https://help.jitter.video/" target="_blank" rel="noreferrer">Help center ↗</a><a href="/join" @click.prevent="emit('start')">Get started</a></div><form class="newsletter" @submit.prevent="subscribe"><label for="newsletter-email">A little motion in your inbox.</label><p>Product updates and a fresh dose of inspiration.</p><div><input id="newsletter-email" v-model="email" type="email" placeholder="Your email address" required /><button aria-label="Subscribe to demo newsletter"><ArrowRight :size="21" /></button></div><small v-if="newsletterMessage" role="status">{{ newsletterMessage }}</small></form></div><div class="footer-bottom"><span>© 2026 Jitter · Unofficial local replica</span><p>Demo only. Not affiliated with Jitter.</p><div><a href="https://jitter.video/terms/" target="_blank" rel="noreferrer">Terms</a><a href="https://jitter.video/privacy/" target="_blank" rel="noreferrer">Privacy</a></div></div></footer>
  </main>

  <dialog ref="modal" aria-label="Template preview" class="template-modal" @close="selectedTemplate = null" @click="($event.target === modal) && closeTemplate()"><template v-if="selectedTemplate"><button class="icon-button modal-close" aria-label="Close template preview" @click="closeTemplate"><X :size="22" /></button><VideoTile :source="`/assets/template-${selectedTemplate.id}.mp4`" :label="selectedTemplate.name" /><div class="modal-content"><span class="eyebrow">{{ selectedTemplate.category }} · Made by Jitter</span><h2>{{ selectedTemplate.name }}</h2><p>Your idea, with a head start. Customize the text, colors, and composition in your local demo workspace.</p><button class="button purple" @click="useTemplate">Use this template <ArrowUpRight :size="18" /></button><small>Free to try. No payment details needed.</small></div></template></dialog>
</template>
