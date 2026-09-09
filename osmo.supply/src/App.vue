<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ArrowDownRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  Asterisk,
  Check,
  Clock3,
  ExternalLink,
  Globe2,
  Layers3,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-vue-next'
import SocialIcon from './components/SocialIcon.vue'
import ButtonLabel from './components/ButtonLabel.vue'
import MotionButton from './components/MotionButton.vue'
import BillingSwitch from './components/BillingSwitch.vue'
import footerWordmark from '../public/assets/osmo-footer-wordmark.svg?raw'
import { circularOffset, showcasePose, useMotionPosition, wrapIndex } from './motion'

type ModalName = 'reel' | 'about' | 'showcase' | null
type Status = 'idle' | 'loading' | 'success' | 'error'

interface ResourceItem {
  title: string
  category: string
  date: string
  image: string
}

interface ProductItem {
  name: string
  footerName?: string
  eyebrow: string
  description: string
  image: string
  href: string
  disabled?: boolean
}

interface ShowcaseResource {
  slug: string
  title: string
  category: string
  image: string
  href: string
}

interface ShowcaseAuthor {
  name: string
  url: string
  image: string
}

interface ShowcaseItem {
  name: string
  image: string
  site: string
  authors: ShowcaseAuthor[]
  resources: ShowcaseResource[]
}

const assetBase = 'https://osmo.b-cdn.net'

const heroResources = [
  ['Product Hotspot Modal', `${assetBase}/resource-img/product-hotspot-modal-1440x900.avif`],
  ['Number Odometer', `${assetBase}/resource-img/number-odometer-1440x900.avif`],
  ['Animated Grid Overlay (Columns)', `${assetBase}/resource-img/animated-grid-overlay-columns-1440x900.avif`],
  ['Collage Focus Card on Hover', `${assetBase}/resource-img/collage-focus-card-on-hover-1440x900.avif`],
  ['Mega Navigation (Directional Hover)', `${assetBase}/resource-img/mega-navigation-directional-hover-1440x900.avif`],
  ['3D Cards Tornado', `${assetBase}/resource-img/3d-cards-tornado-1440x900-v4.avif`],
  ['Shutter Scroll Transition', `${assetBase}/resource-img/shutter-scroll-transition-1440x900-v2.avif`],
  ['Radial Cards Slider (GSAP)', `${assetBase}/resource-img/radial-cards-slider-gsap-1440x900-v2.avif`],
  ['Step-by-step Timeline', `${assetBase}/resource-img/step-by-step-timeline-1440x900.avif`],
] as const

const heroMarqueeResources = [...heroResources, ...heroResources]

const heroPositions = [
  { x: -610, y: 128, r: -23 },
  { x: -465, y: 76, r: -17 },
  { x: -315, y: 37, r: -11 },
  { x: -158, y: 13, r: -5 },
  { x: 0, y: 5, r: 0 },
  { x: 158, y: 13, r: 5 },
  { x: 315, y: 37, r: 11 },
  { x: 465, y: 76, r: 17 },
  { x: 610, y: 128, r: 23 },
]

const updates: ResourceItem[] = [
  {
    title: 'Interactive Line Graph (SVG)',
    category: 'Dropdowns & Information',
    date: 'Earlier today',
    image: `${assetBase}/resource-img/interactive-line-graph-svg-1440x900.avif`,
  },
  {
    title: 'Infinite Dome Grid',
    category: 'Gallery & Images',
    date: '5 days ago',
    image: `${assetBase}/resource-img/infinite-dome-grid-1440x900.avif`,
  },
  {
    title: 'Analog Clock',
    category: 'Utilities & Scripts',
    date: '1 week ago',
    image: `${assetBase}/resource-img/analog-clock-1440x900-v3.avif`,
  },
  {
    title: 'Liquid Glass Carousel',
    category: 'Sliders & Marquees',
    date: '1 week ago',
    image: `${assetBase}/resource-img/liquid-glass-carousel-1440x900-v4.avif`,
  },
  {
    title: 'Interactive Dots Grid (Background)',
    category: 'Hover Interactions',
    date: '2 weeks ago',
    image: `${assetBase}/resource-img/interactive-dots-grid-background-1440x900.avif`,
  },
]

const products: ProductItem[] = [
  {
    name: 'The Vault',
    eyebrow: 'Part of the membership',
    description: 'Our ever-growing dashboard packed with ready-to-go components.',
    image: `${assetBase}/website/bandwidth/product-card-vault.avif`,
    href: '/product/vault',
  },
  {
    name: 'Page Transition Course',
    eyebrow: 'Part of the membership',
    description: 'Learn how to create page transitions that take your websites to the next level.',
    image: `${assetBase}/website/bandwidth/page-transition-course-thumb-1440x900.avif`,
    href: '/product/page-transition-course',
  },
  {
    name: 'Buttons',
    footerName: 'Button Pack',
    eyebrow: 'Part of the membership',
    description: '100 fully accessible buttons made together with Eduard Bodak.',
    image: `${assetBase}/website/bandwidth/button-pack-product-card-2160x2808.avif`,
    href: '/product/button-pack',
  },
  {
    name: 'Easings',
    eyebrow: 'Part of the membership',
    description: 'Ready-to-paste easings for CSS and GSAP inside the Osmo Vault.',
    image: `${assetBase}/website/bandwidth/product-card-easings.avif`,
    href: '',
    disabled: true,
  },
  {
    name: 'Icons',
    footerName: 'Icon Library',
    eyebrow: 'Part of the membership',
    description: 'A uniform library of clean, scalable SVG icons you can copy or download in seconds.',
    image: `${assetBase}/website/bandwidth/product-card-icons.avif`,
    href: '/product/icons',
  },
  {
    name: 'Community',
    eyebrow: 'Part of the membership',
    description: 'Connect with the people who love building great websites as much as you do.',
    image: `${assetBase}/website/bandwidth/product-card-community.avif`,
    href: '/product/community',
  },
]

const testimonials = [
  {
    quote: 'Osmo empowered me to take on any creative challenge',
    name: 'Dang Nguyen',
    role: 'Head of Creative',
    image: `${assetBase}/website/author/dang-nguyen-270x270.avif`,
    map: `${assetBase}/website/bandwidth/map-vnm.svg`,
    body: 'Thanks to Osmo, I’ve won my first major awards and signed clients I once only dreamed of. Their powerful, easy-to-use effects feature cutting-edge code that has expanded my development skills. Joining this community is an easy choice for developers at any level who want to grow and succeed!',
  },
  {
    quote: 'This gets the official GSAP stamp of approval.',
    name: 'Cassie Evans',
    role: 'Education GSAP',
    image: `${assetBase}/website/author/cassie-evans-270x270.avif`,
    map: `${assetBase}/website/bandwidth/map-uk.svg`,
    body: 'Even if you know GSAP, it can be tricky to apply abstract animation concepts to real-world scenarios. Dennis and Ilja have come to the rescue with this treasure-trove of useful techniques. There’s something for everyone here, grab-and-go or use the code as a jumping off point.',
  },
  {
    quote: 'One of a kind platform for any developers out there.',
    name: 'Huy (by Huy)',
    role: 'Designer & YT creator',
    image: `${assetBase}/website/author/by-huy-270x270.avif`,
    map: `${assetBase}/website/bandwidth/map-nl.svg`,
    body: "It's incredible to be able to see and learn how the pros implement their animations. If you love web animations and creative development, this platform this a no brainer. Just sign up already.",
  },
  {
    quote: "The creative developer's cheat code.",
    name: 'Jordan Gilroy',
    role: 'Web Designer',
    image: `${assetBase}/website/author/jordan-gilroy-270x270.avif`,
    map: `${assetBase}/website/bandwidth/map-aus.svg`,
    body: 'Osmo is a one-stop shop, offering everything from snippets to help you set up your site to advanced animations and interactions that elevate it to the next level. The resources are so easy to implement, and with some imagination, you can adapt them to create something unique.',
  },
  {
    quote: '"Even I" came across a few neat tricks I hadn’t seen before.',
    name: 'Jesper Landberg',
    role: 'Creative Developer',
    image: `${assetBase}/website/author/jesper-landberg-270x270.avif`,
    map: `${assetBase}/website/bandwidth/map-swe.svg`,
    body: 'Osmo Supply is a gem for clever and well-thought-out code/no-code solutions for animations and components. It’s a resource both beginners and seasoned pros will find incredibly useful. Lama stamp of approval on this one, and I’ll deffo be coming back to it!',
  },
  {
    quote: 'The Osmo Vault has been a great partner in speeding up my projects',
    name: 'Victor Work',
    role: 'VW Lab',
    image: `${assetBase}/website/author/victor-work-270x270.avif`,
    map: `${assetBase}/website/bandwidth/map-ca.svg`,
    body: "Osmo Supply has been a great partner in speeding and building up my projects since its release. I have used the vault in countless projects, and it's fantastic to be a part of such an inspiring community. Osmo, it's a must-have.",
  },
]

function resource(slug: string, title: string, category: string, imageName = slug): ShowcaseResource {
  const imageFile = imageName.endsWith('.avif') ? imageName : `${imageName}-1440x900.avif`
  return {
    slug,
    title,
    category,
    image: `${assetBase}/resource-img/${imageFile}`,
    href: `https://www.osmo.supply/resource/${slug}`,
  }
}

const showcases: ShowcaseItem[] = [
  {
    name: 'Nick Ho',
    image: `${assetBase}/showcase-img/nick-ho-1440x900.avif`,
    site: 'https://nickho-motorsports.nl/',
    authors: [
      { name: '@weareboring.nl', url: 'https://www.weareboring.nl/', image: `${assetBase}/showcase-credits-img/boring-128x128.avif` },
      { name: '@noahploeg', url: 'https://www.linkedin.com/in/noahploeg', image: `${assetBase}/showcase-credits-img/noah-ploeg-128x128.avif` },
    ],
    resources: [
      resource('number-odometer', 'Number Odometer', 'Text Animations'),
      resource('bunny-hls-background-video', 'Bunny HLS Background Video', 'Video & Audio'),
      resource('global-parallax-setup', 'Global Parallax Setup', 'Scroll Animations'),
      resource('dynamic-current-year', 'Dynamic Current Year', 'Utilities & Scripts'),
      resource('dynamic-custom-text-cursor', 'Dynamic Text Cursor', 'Cursor Animations', 'dynamic-text-cursor'),
      resource('bold-full-screen-navigation', 'Bold Full Screen Navigation', 'Navigation'),
      resource('radial-cards-slider-gsap', 'Radial Cards Slider (GSAP)', 'Sliders & Marquees', 'radial-cards-slider-gsap-1440x900-v2.avif'),
    ],
  },
  {
    name: 'EverWonder Studio',
    image: `${assetBase}/showcase-img/everwonder-1440x900-v2.avif`,
    site: 'https://everwonder.studio/',
    authors: [
      { name: '@designby.dylan', url: 'https://www.dylanbrouwer.design/', image: `${assetBase}/showcase-credits-img/dylan-brouwer-128x128.avif` },
    ],
    resources: [
      resource('multilevel-navigation', 'Multilevel Navigation', 'Navigation'),
      resource('logo-reveal-loader', 'Logo Reveal Loader', 'Loaders'),
      resource('page-name-transition-wipe', 'Page Name Transition (Wipe)', 'Page Transitions'),
      resource('bunny-hls-background-video', 'Bunny HLS Background Video', 'Video & Audio'),
      resource('custom-bunny-hls-player-advanced', 'Custom Bunny HLS Player (Advanced)', 'Video & Audio'),
      resource('play-video-on-hover', 'Play Video on Hover (Lazy)', 'Video & Audio'),
      resource('mini-showreel-player', 'Mini Showreel Player', 'Video & Audio'),
      resource('highlight-text-on-scroll', 'Highlight Text on Scroll', 'Text Animations'),
      resource('stacking-cards-parallax', 'Stacking Cards Parallax', 'Scroll Animations'),
      resource('progressive-blur', 'Progressive Blur', 'Visual Effects'),
      resource('basic-filter-setup', 'Basic Filter Setup', 'Filters & Sorting'),
      resource('scaling-element-on-scroll-gsap-flip', 'Scaling Element on Scroll (GSAP Flip)', 'Scroll Animations'),
      resource('osmo-scaling-system', 'Osmo Scaling System', 'Utilities & Scripts'),
      resource('css-marquee', 'CSS Marquee', 'Sliders & Marquees'),
      resource('draggable-marquee-directional', 'Draggable Marquee (Directional)', 'Sliders & Marquees'),
    ],
  },
  {
    name: 'Minal Studio',
    image: `${assetBase}/showcase-img/minal-studio-1440x900.avif`,
    site: 'https://www.minalstudio.com',
    authors: [
      { name: '@humphreystudiou', url: 'https://www.linkedin.com/in/humphreystudiouk/', image: `${assetBase}/showcase-credits-img/humphrey-studio-128x128.avif` },
      { name: '@tomcheal', url: 'https://www.minalstudio.com', image: `${assetBase}/showcase-credits-img/tom-cheal-128x128.avif` },
    ],
    resources: [
      resource('overlapping-parallax-page-transition', 'Overlapping Parallax Page Transition', 'Page Transitions'),
      resource('custom-bunny-hls-lightbox-advanced', 'Custom Bunny HLS Lightbox (Advanced)', 'Video & Audio'),
      resource('media-setup-autoplay-hover-click', 'Media Setup (Autoplay, Hover, Click)', 'Video & Audio'),
      resource('cursor-with-marquee-effect', 'Cursor with Marquee Effect', 'Cursor Animations'),
      resource('marquee-with-scroll-direction', 'Marquee with Scroll Direction', 'Sliders & Marquees'),
    ],
  },
  {
    name: 'PEAK',
    image: `${assetBase}/showcase-img/peak-1440x900.avif`,
    site: 'https://peak-agency.co.uk/',
    authors: [
      { name: '@simontacke', url: 'https://www.linkedin.com/in/simontacke/', image: `${assetBase}/showcase-credits-img/simon-tacke-128x128.avif` },
    ],
    resources: [
      resource('check-section-theme-on-scroll', 'Check Section Theme on Scroll', 'Utilities & Scripts'),
      resource('draggable-marquee-directional', 'Draggable Marquee (Directional)', 'Sliders & Marquees'),
      resource('rotating-image-trail', 'Rotating Image Trail', 'Cursor Animations'),
      resource('accordion-css-animation', 'Accordion CSS Animation', 'Dropdowns & Information'),
      resource('dynamic-current-year', 'Dynamic Current Year', 'Utilities & Scripts'),
      resource('number-odometer', 'Number Odometer', 'Text Animations'),
      resource('momentum-based-hover', 'Momentum Based Hover (Inertia)', 'Hover Interactions'),
    ],
  },
  {
    name: 'Nodeck',
    image: `${assetBase}/showcase-img/nodeck-1440x900.avif`,
    site: 'https://www.nodeck.online/',
    authors: [
      { name: '@bogdan.kolomiyets', url: 'https://bogdankolomiyets.com/', image: `${assetBase}/showcase-credits-img/bogdan-kolomiyets-2-128x128.avif` },
    ],
    resources: [
      resource('momentum-based-hover', 'Momentum Based Hover (Inertia)', 'Hover Interactions'),
      resource('mouse-cursor-confetti-click', 'Mouse Cursor Confetti (GSAP Physics2D)', 'Gimmicks'),
      resource('custom-cursor-css', 'Custom Cursor (CSS)', 'Cursor Animations'),
    ],
  },
  {
    name: 'Mammut Studios',
    image: `${assetBase}/showcase-img/mammut-studios-1440x900.avif`,
    site: 'https://mammutstudios.com/',
    authors: [
      { name: '@danielstoopendaal', url: 'https://www.linkedin.com/in/danielstoopendaal/', image: `${assetBase}/showcase-credits-img/daniel-stoopendaal-128x128.avif` },
      { name: '@mammutstudios', url: 'https://mammutstudios.com/', image: `${assetBase}/showcase-credits-img/mammut-studios-128x128.avif` },
    ],
    resources: [
      resource('marquee-with-scroll-direction', 'Marquee with Scroll Direction', 'Sliders & Marquees'),
      resource('dynamic-current-year', 'Dynamic Current Year', 'Utilities & Scripts'),
      resource('dynamic-current-time', 'Dynamic Current Time', 'Utilities & Scripts'),
      resource('line-reveal-testimonials', 'Line Reveal Testimonials', 'Text Animations'),
      resource('magnetic-hover-effect', 'Magnetic Hover Effect', 'Hover Interactions'),
      resource('fit-text-to-width', 'Fit Text to Width', 'Utilities & Scripts'),
      resource('underline-link-animation', 'Underline Link Animation', 'Hover Interactions'),
      resource('button-with-css-character-stagger', 'Button with CSS Character Stagger', 'Buttons'),
    ],
  },
  {
    name: 'a-lign studio',
    image: `${assetBase}/showcase-img/a-lign-studio-1440x900.avif`,
    site: 'https://www.a-lign.studio/',
    authors: [
      { name: '@a-lign.studio', url: 'https://www.a-lign.studio/', image: `${assetBase}/showcase-credits-img/a-lign-studio-128x128.avif` },
    ],
    resources: [
      resource('bunny-hls-background-video', 'Bunny HLS Background Video', 'Video & Audio'),
      resource('scramble-text-cursor', 'Scramble Text Cursor', 'Cursor Animations'),
      resource('side-by-side-page-transition', 'Side-by-side Page Transition', 'Page Transitions'),
      resource('copy-email-to-clipboard-button', 'Copy Email to Clipboard Button', 'Utilities & Scripts'),
      resource('centered-looping-slider', 'Centered Looping Slider', 'Sliders & Marquees'),
      resource('lenis-smooth-scroll-setup', 'Lenis Smooth Scroll Setup', 'Scroll Animations'),
      resource('highlight-marker-text-reveal', 'Highlight Marker Text Reveal', 'Text Animations'),
    ],
  },
]

const menuOpen = ref(false)
const menuCloseButton = ref<HTMLButtonElement | null>(null)
const modal = ref<ModalName>(null)
const modalCard = ref<HTMLElement | null>(null)
const menuPanel = ref<HTMLElement | null>(null)
const latestIndex = ref(0)
const activeProduct = ref(0)
const testimonialIndex = ref(0)
const creatorIndex = ref(0)
const showcaseIndex = ref(0)
const billing = ref<'quarterly' | 'annual'>('annual')
const reelPlaying = ref(true)
const reelMuted = ref(false)
const reelProgress = ref(0)
const reelVideo = ref<HTMLVideoElement | null>(null)
const navScrolled = ref(false)
const newsletterName = ref('')
const newsletterEmail = ref('')
const newsletterConsent = ref(false)
const newsletterStatus = ref<Status>('idle')
const newsletterMessage = ref('')
const footerOpen = ref<number | null>(2)
const footerBreakpointQuery = '(max-width: 800px)'
const footerIsMobile = ref(typeof window !== 'undefined' && window.matchMedia(footerBreakpointQuery).matches)
const productDrag = ref(0)
const productDragging = ref(false)
const carouselVisible = ref({ latest: false, testimonial: false, creator: false })
const latestProgress = ref(0)
const testimonialProgress = ref(0)
const creatorElapsed = ref(0)
const creatorLayers = computed(() => [3980, 2830, 1680].map((switchAt) => Math.floor((creatorElapsed.value + 7100 - switchAt) / 7100) % 2))
const mapTransform = computed(() => {
  const transforms: Record<string, string> = {
    'map-vnm.svg': 'translate(-80%, -40%) scale(3)',
    'map-uk.svg': 'translate(15%, 25%) scale(4)',
    'map-nl.svg': 'translate(8%, 40%) scale(5.5)',
    'map-aus.svg': 'translate(-70%, -60%) scale(2)',
    'map-swe.svg': 'translate(-5%, 45%) scale(3.5)',
    'map-ca.svg': 'translate(33%, 17%) scale(1.1)',
  }
  return transforms[testimonials[testimonialIndex.value]!.map.split('/').pop()!] ?? 'none'
})
const latestHoverPaused = ref(false)
const latestFocusPaused = ref(false)
const testimonialHoverPaused = ref(false)
const testimonialFocusPaused = ref(false)
const latestPaused = computed(() => latestHoverPaused.value || latestFocusPaused.value)
const testimonialPaused = computed(() => testimonialHoverPaused.value || testimonialFocusPaused.value)
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const prefersReducedMotion = ref(typeof window !== 'undefined' && window.matchMedia(reducedMotionQuery).matches)
const previewVideo = ref<HTMLVideoElement | null>(null)
const productMotion = useMotionPosition(prefersReducedMotion)
const showcaseMotion = useMotionPosition(prefersReducedMotion)
const showcaseDragging = ref(false)
const latestDirection = ref(1)
const testimonialDirection = ref(1)
const cursorKind = ref<'previous' | 'next' | 'drag' | null>(null)
const motionCursor = ref<HTMLElement | null>(null)
const footerLogo = ref<HTMLElement | null>(null)
const levelAngles = ref({ '--outer-turn': '135deg', '--middle-turn': '-75deg', '--inner-turn': '210deg' })

function refreshLevelAngles() {
  const angles = [-1, 0, 1].map((sector) => Math.round(sector * 150 + Math.random() * 100 - 50))
  levelAngles.value = { '--outer-turn': `${angles[2]}deg`, '--middle-turn': `${angles[0]}deg`, '--inner-turn': `${angles[1]}deg` }
}

const productWindow = computed(() => products.map((product, index) => {
  const offset = circularOffset(index, activeProduct.value, products.length)
  const visualOffset = circularOffset(index, productMotion.position.value, products.length)
  return { product, index, offset, visualOffset }
}))
const activeShowcase = computed(() => showcases[showcaseIndex.value]!)
const showcaseCards = computed(() => showcases.map((showcase, index) => {
  const offset = circularOffset(index, showcaseMotion.position.value, showcases.length)
  const pose = showcasePose(offset)
  return { showcase, index, offset, style: {
    transform: `translate(-50%, 0) translate(${pose.x}%, ${pose.y}%) rotate(${pose.rotation}deg) scale(${pose.scale})`,
    opacity: pose.opacity,
    zIndex: 10 - Math.round(Math.abs(offset)),
    '--card-dim': Math.min(0.58, Math.abs(offset) * 0.58),
  } }
}))

const soloPrice = computed(() => (billing.value === 'annual' ? 20 : 25))
const teamPrice = computed(() => (billing.value === 'annual' ? 16 : 20))
const soloPlanUrl = computed(() => `https://www.osmo.supply/plans/subscription?type=${billing.value === 'annual' ? 'annual' : 'quarterly'}`)
const teamPlanUrl = computed(() => `https://www.osmo.supply/plans/team-subscription?type=${billing.value === 'annual' ? 'annual' : 'quarterly'}`)
const newsletterEndpoint = 'https://osmo.outseta.com/api/v1/public/email/lists/z9Mzy7W4/subscriptions'

function openMenu(event: MouseEvent) {
  lastMenuTrigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  menuOpen.value = true
}

function rotateLatest(direction: number) {
  latestDirection.value = direction
  latestProgress.value = 0
  const length = updates.length
  latestIndex.value = (latestIndex.value + direction + length) % length
}

function rotateTestimonial(direction: number) {
  testimonialDirection.value = direction
  testimonialProgress.value = 0
  testimonialIndex.value = (testimonialIndex.value + direction + testimonials.length) % testimonials.length
}

function rotateShowcase(direction: number) {
  showcaseIndex.value = (showcaseIndex.value + direction + showcases.length) % showcases.length
  const position = showcaseMotion.position.value
  showcaseMotion.moveTo(position + circularOffset(showcaseIndex.value, position, showcases.length), true)
}

function osmoUrl(path: string) {
  return new URL(path, 'https://www.osmo.supply').href
}

function isFooterGroupExpanded(index: number) {
  return !footerIsMobile.value || footerOpen.value === index
}

function toggleFooterGroup(index: number) {
  if (!footerIsMobile.value) return
  footerOpen.value = footerOpen.value === index ? null : index
}

function handleCarouselFocusOut(event: FocusEvent, carousel: 'latest' | 'testimonial') {
  const section = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && section.contains(event.relatedTarget)) return
  if (carousel === 'latest') latestFocusPaused.value = false
  else testimonialFocusPaused.value = false
}

function openModal(name: Exclude<ModalName, null>, event?: Event) {
  if (!modal.value) {
    lastFocusedElement = event?.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
  }
  menuOpen.value = false
  modal.value = name
}

function closeModal() {
  if (modal.value === 'reel') {
    reelVideo.value?.pause()
    reelPlaying.value = false
  }
  modal.value = null
}

async function playReel(video: HTMLVideoElement) {
  try {
    await video.play()
    if (modal.value === 'reel') reelPlaying.value = true
  } catch {
    reelPlaying.value = false
  }
}

async function toggleReel() {
  const video = reelVideo.value
  if (!video) return
  if (reelPlaying.value) {
    video.pause()
    reelPlaying.value = false
  } else {
    await playReel(video)
  }
}

function toggleReelMute() {
  const video = reelVideo.value
  if (!video) return
  video.muted = !video.muted
  reelMuted.value = video.muted
}

function updateReelProgress() {
  const video = reelVideo.value
  if (!video || !Number.isFinite(video.duration) || video.duration === 0) return
  reelProgress.value = (video.currentTime / video.duration) * 100
  reelPlaying.value = !video.paused
}

function seekReel(event: Event) {
  const video = reelVideo.value
  const input = event.currentTarget as HTMLInputElement
  if (!video || !Number.isFinite(video.duration)) return
  video.currentTime = (Number(input.value) / 100) * video.duration
}

function trapModalFocus(event: KeyboardEvent) {
  trapFocus(modalCard.value, event)
}

function trapMenuFocus(event: KeyboardEvent) {
  trapFocus(menuPanel.value, event)
}

function trapFocus(card: HTMLElement | null, event: KeyboardEvent) {
  if (!card) return
  const elements = Array.from(
    card.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ).filter((element) => element.offsetParent !== null && !element.closest('[inert], [aria-hidden="true"]'))
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function selectProduct(index: number) {
  activeProduct.value = index
  productDrag.value = 0
  const position = productMotion.position.value
  productMotion.moveTo(position + circularOffset(index, position, products.length), false, 1500)
}

async function handleProductKeydown(event: KeyboardEvent, index: number) {
  const keyOffsets: Record<string, number> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }
  let nextIndex = index
  if (event.key in keyOffsets) nextIndex = (index + keyOffsets[event.key]! + products.length) % products.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = products.length - 1
  else return

  event.preventDefault()
  selectProduct(nextIndex)
  await nextTick()
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.product-tabs [role="tab"]'))
  tabs[nextIndex]?.focus()
}

async function submitNewsletter() {
  if (newsletterStatus.value === 'loading') return
  if (!newsletterName.value.trim() || !/^\S+@\S+\.\S+$/.test(newsletterEmail.value) || !newsletterConsent.value) {
    newsletterStatus.value = 'error'
    newsletterMessage.value = 'Add your name, a valid email, and accept the privacy policy.'
    return
  }
  newsletterStatus.value = 'loading'
  newsletterMessage.value = 'Joining the list...'

  try {
    const response = await fetch(newsletterEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        EmailList: { Uid: 'z9Mzy7W4' },
        Person: {
          FirstName: newsletterName.value.trim(),
          Email: newsletterEmail.value.trim(),
        },
        Source: 'embed',
      }),
    })
    if (!response.ok) throw new Error(`Newsletter request failed with ${response.status}`)
    newsletterStatus.value = 'success'
    newsletterMessage.value = "Amazing, we'll keep you in the loop! 🚀"
  } catch {
    newsletterStatus.value = 'error'
    newsletterMessage.value = 'Something went wrong while submitting.'
  }
}

interface SwipeState {
  pointerId: number | null
  startX: number
  startY: number
  startPosition: number
  width: number
  lastX: number
  lastTime: number
  velocity: number
  dragging: boolean
}

const productSwipe: SwipeState = { pointerId: null, startX: 0, startY: 0, startPosition: 0, width: 440, lastX: 0, lastTime: 0, velocity: 0, dragging: false }
const showcaseSwipe: SwipeState = { ...productSwipe }
let suppressClickUntil = 0

function startSwipe(event: PointerEvent, state: SwipeState) {
  if (event.button !== 0 || state.pointerId !== null) return
  state.pointerId = event.pointerId
  state.startX = event.clientX
  state.startY = event.clientY
  state.lastX = event.clientX
  state.lastTime = performance.now()
  state.velocity = 0
  state.dragging = false
  const motion = state === productSwipe ? productMotion : showcaseMotion
  motion.stop()
  state.startPosition = motion.position.value
  const stage = event.currentTarget as HTMLElement
  state.width = state === productSwipe
    ? (stage.querySelector<HTMLElement>('.product-feature')?.offsetWidth || 440) * 1.6
    : stage.offsetWidth || 680
}

function moveSwipe(event: PointerEvent, state: SwipeState) {
  if (state.pointerId !== event.pointerId) return
  const distance = event.clientX - state.startX
  if (!state.dragging) {
    if (Math.abs(event.clientY - state.startY) > Math.abs(distance) && Math.abs(event.clientY - state.startY) > 8) {
      cancelSwipe(event, state)
      return
    }
    if (Math.abs(distance) <= 8) return
    state.dragging = true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  const now = performance.now()
  state.velocity = (event.clientX - state.lastX) / Math.max(16, now - state.lastTime)
  state.lastX = event.clientX
  state.lastTime = now
}

function finishSwipe(event: PointerEvent, state: SwipeState) {
  if (state.pointerId !== event.pointerId) return 0
  const element = event.currentTarget as HTMLElement
  const distance = state.dragging ? event.clientX - state.startX : 0
  if (state.dragging) suppressClickUntil = performance.now() + 350
  state.pointerId = null
  state.dragging = false
  if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
  return distance
}

function cancelSwipe(event: PointerEvent, state: SwipeState) {
  if (state.pointerId !== event.pointerId) return
  const element = event.currentTarget as HTMLElement
  state.pointerId = null
  state.dragging = false
  if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
  if (state === productSwipe) {
    productDrag.value = 0
    productDragging.value = false
    productMotion.moveTo(state.startPosition)
  } else {
    showcaseDragging.value = false
    showcaseMotion.moveTo(state.startPosition, true)
  }
}

function suppressDraggedClick(event: MouseEvent) {
  if (performance.now() >= suppressClickUntil) return
  event.preventDefault()
  event.stopPropagation()
}

function leaveSwipe(event: PointerEvent, state: SwipeState) {
  if (!state.dragging) cancelSwipe(event, state)
}

function startProductSwipe(event: PointerEvent) {
  startSwipe(event, productSwipe)
}

function moveProductSwipe(event: PointerEvent) {
  moveSwipe(event, productSwipe)
  if (productSwipe.pointerId !== event.pointerId || !productSwipe.dragging) return
  productDragging.value = true
  productDrag.value = (event.clientX - productSwipe.startX) / productSwipe.width
  productMotion.position.value = productSwipe.startPosition - productDrag.value
}

function endProductSwipe(event: PointerEvent) {
  if (productSwipe.pointerId !== event.pointerId) return
  const distance = finishSwipe(event, productSwipe)
  let target = Math.round(productSwipe.startPosition)
  if (Math.abs(distance) > 45) {
    const velocity = performance.now() - productSwipe.lastTime < 100 ? productSwipe.velocity : 0
    const projected = distance + Math.max(-productSwipe.width, Math.min(productSwipe.width, velocity * 180))
    const steps = Math.max(1, Math.round(Math.abs(projected / productSwipe.width)))
    target += distance < 0 ? steps : -steps
  }
  activeProduct.value = wrapIndex(target, products.length)
  productMotion.moveTo(target)
  productDrag.value = 0
  productDragging.value = false
}

function startShowcaseSwipe(event: PointerEvent) {
  startSwipe(event, showcaseSwipe)
}

function moveShowcaseSwipe(event: PointerEvent) {
  moveSwipe(event, showcaseSwipe)
  if (showcaseSwipe.pointerId !== event.pointerId || !showcaseSwipe.dragging) return
  showcaseDragging.value = true
  const distance = (event.clientX - showcaseSwipe.startX) / showcaseSwipe.width
  showcaseMotion.position.value = showcaseSwipe.startPosition - Math.max(-1, Math.min(1, distance))
}

function endShowcaseSwipe(event: PointerEvent) {
  if (showcaseSwipe.pointerId !== event.pointerId) return
  const distance = finishSwipe(event, showcaseSwipe)
  let target = Math.round(showcaseSwipe.startPosition)
  if (Math.abs(distance) > showcaseSwipe.width * 0.1) target += distance < 0 ? 1 : -1
  showcaseIndex.value = wrapIndex(target, showcases.length)
  showcaseMotion.moveTo(target, true)
  showcaseDragging.value = false
}

let cursorFrame = 0
let cursorX = 0
let cursorY = 0
let cursorTargetX = 0
let cursorTargetY = 0

function handleCursor(event: PointerEvent) {
  const target = (event.target as Element).closest<HTMLElement>('[data-motion-cursor]')
  const control = (event.target as Element).closest('a, button')
  const nativeControl = control && !control.matches('[data-motion-cursor], .showcase-card-trigger')
  const kind = event.pointerType === 'touch' || nativeControl ? null : target?.dataset.motionCursor as typeof cursorKind.value ?? null
  if (!cursorKind.value) {
    cursorX = event.clientX
    cursorY = event.clientY
  }
  cursorKind.value = kind
  cursorTargetX = event.clientX
  cursorTargetY = event.clientY
  if (cursorFrame || !kind) return
  function tick() {
    cursorX += (cursorTargetX - cursorX) * 0.3
    cursorY += (cursorTargetY - cursorY) * 0.3
    motionCursor.value?.style.setProperty('transform', `translate3d(${cursorX}px, ${cursorY}px, 0)`)
    cursorFrame = cursorKind.value && Math.hypot(cursorTargetX - cursorX, cursorTargetY - cursorY) > 0.1 ? requestAnimationFrame(tick) : 0
  }
  cursorFrame = requestAnimationFrame(tick)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (modal.value) closeModal()
    else if (menuOpen.value) menuOpen.value = false
  }
}

let scrollFrame = 0
let lastFocusedElement: HTMLElement | null = null
let lastMenuTrigger: HTMLElement | null = null
let latestTimer = 0
let testimonialTimer = 0
let creatorTimer = 0

function startCarouselTimers() {
  if (!latestTimer) latestTimer = window.setInterval(() => {
    if (document.hidden || !carouselVisible.value.latest || latestPaused.value) return
    latestProgress.value += 50 / 3000
    if (latestProgress.value >= 1) rotateLatest(1)
  }, 50)
  if (!testimonialTimer) testimonialTimer = window.setInterval(() => {
    if (document.hidden || !carouselVisible.value.testimonial || testimonialPaused.value) return
    testimonialProgress.value += 50 / 4000
    if (testimonialProgress.value >= 1 - 1e-8) rotateTestimonial(1)
  }, 50)
  if (!creatorTimer) creatorTimer = window.setInterval(() => {
    if (document.hidden || !carouselVisible.value.creator) return
    creatorElapsed.value += 50
    creatorIndex.value = Math.floor((creatorElapsed.value + 6100) / 7100) % 2
  }, 50)
}

function stopCarouselTimers() {
  window.clearInterval(latestTimer)
  window.clearInterval(testimonialTimer)
  window.clearInterval(creatorTimer)
  latestTimer = 0
  testimonialTimer = 0
  creatorTimer = 0
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches
  if (event.matches) {
    stopCarouselTimers()
    previewVideo.value?.pause()
    if (reelVideo.value) {
      reelVideo.value.pause()
      reelPlaying.value = false
    }
  } else {
    startCarouselTimers()
  }
}

function handleFooterBreakpointChange(event: MediaQueryListEvent) {
  footerIsMobile.value = event.matches
}

function handleScroll() {
  cursorKind.value = null
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(() => {
    navScrolled.value = window.scrollY > 32
    const logo = footerLogo.value
    if (logo) {
      const rect = logo.getBoundingClientRect()
      const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      const travel = remaining + window.innerHeight - rect.top
      const progress = prefersReducedMotion.value || window.innerWidth < 768 ? 1 : Math.max(0, Math.min(1, (window.innerHeight - rect.top) / Math.max(1, travel)))
      logo.style.setProperty('--footer-progress', String(progress))
    }
    scrollFrame = 0
  })
}

let revealObserver: IntersectionObserver | undefined
let animationObserver: IntersectionObserver | undefined
let reducedMotionMedia: MediaQueryList | undefined
let footerBreakpointMedia: MediaQueryList | undefined
onMounted(async () => {
  await nextTick()
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          entry.target.setAttribute('data-revealed', 'true')
        }
      })
    },
    { threshold: 0.12 },
  )
  document.querySelectorAll('.reveal').forEach((element) => revealObserver?.observe(element))
  animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target as HTMLElement
      element.classList.toggle('animation-in-view', entry.isIntersecting)
      if (element.classList.contains('latest-capsule')) carouselVisible.value.latest = entry.isIntersecting
      if (element.classList.contains('testimonial-section')) carouselVisible.value.testimonial = entry.isIntersecting
      if (element.classList.contains('creator-band')) carouselVisible.value.creator = entry.isIntersecting
    })
  }, { threshold: 0 })
  document.querySelectorAll('.hero-deck, .creator-band, .latest-capsule, .testimonial-section, .level-visual').forEach((element) => animationObserver?.observe(element))
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  handleScroll()
  reducedMotionMedia = window.matchMedia(reducedMotionQuery)
  prefersReducedMotion.value = reducedMotionMedia.matches
  reducedMotionMedia.addEventListener('change', handleReducedMotionChange)
  footerBreakpointMedia = window.matchMedia(footerBreakpointQuery)
  footerIsMobile.value = footerBreakpointMedia.matches
  footerBreakpointMedia.addEventListener('change', handleFooterBreakpointChange)
  if (prefersReducedMotion.value) previewVideo.value?.pause()
  else startCarouselTimers()
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  animationObserver?.disconnect()
  reducedMotionMedia?.removeEventListener('change', handleReducedMotionChange)
  footerBreakpointMedia?.removeEventListener('change', handleFooterBreakpointChange)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
  if (cursorFrame) window.cancelAnimationFrame(cursorFrame)
  stopCarouselTimers()
  document.body.classList.remove('is-locked')
})

watch([modal, menuOpen], ([modalValue, menuValue]) => {
  document.body.classList.toggle('is-locked', Boolean(modalValue || menuValue))
})

watch(modal, async (value, previousValue) => {
  await nextTick()
  if (value) {
    const target = modalCard.value?.querySelector<HTMLElement>('[data-autofocus], input, button')
    target?.focus()
    if (value === 'reel') {
      const shouldAutoplay = !prefersReducedMotion.value
      reelMuted.value = false
      reelProgress.value = 0
      reelPlaying.value = shouldAutoplay
      if (reelVideo.value) {
        reelVideo.value.muted = false
        reelVideo.value.currentTime = 0
      }
      if (reelVideo.value && shouldAutoplay) await playReel(reelVideo.value)
      else reelVideo.value?.pause()
    }
  } else if (previousValue) {
    lastFocusedElement?.focus()
  }
})

watch(menuOpen, async (value, previousValue) => {
  await nextTick()
  if (value) {
    menuCloseButton.value?.focus()
  } else if (previousValue && !modal.value) {
    lastMenuTrigger?.focus()
  }
})
</script>

<template>
  <div id="top" class="site-shell" @pointermove="handleCursor" @pointerleave="cursorKind = null">
    <div ref="motionCursor" class="motion-cursor" :class="{ 'is-active': cursorKind, 'is-grabbing': productDragging || showcaseDragging }" :data-direction="cursorKind" aria-hidden="true"><span><span class="motion-cursor__arrows"><ArrowUp /><ArrowDown /></span><span class="motion-cursor__drag">Drag</span></span></div>
    <Transition name="menu-backdrop"><div v-if="menuOpen" class="menu-layer" role="presentation" @mousedown.self="menuOpen = false"></div></Transition>
    <header :id="menuOpen ? 'site-menu' : undefined" ref="menuPanel" class="header-shell" :class="{ 'is-scrolled': navScrolled, 'is-menu-open': menuOpen }" :role="menuOpen ? 'dialog' : undefined" :aria-modal="menuOpen ? true : undefined" :aria-label="menuOpen ? 'Site menu' : undefined" :inert="Boolean(modal)" @keydown.tab="menuOpen && trapMenuFocus($event)">
      <nav class="site-nav" aria-label="Primary navigation">
        <button ref="menuCloseButton" class="nav-menu-button" type="button" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" aria-controls="site-menu" :aria-expanded="menuOpen" @click="menuOpen ? menuOpen = false : openMenu($event)">
          <span class="nav-hamburger" aria-hidden="true"><i></i><i></i></span>
          <ButtonLabel label="Menu" />
        </button>
        <a class="brand-mark" href="#top" aria-label="Osmo home" @click="menuOpen = false">
          <img class="brand-wordmark" src="/assets/osmo-wordmark.svg" alt="" />
          <img class="brand-icon" src="/assets/osmo-star.svg" alt="" />
        </a>
        <div class="nav-actions">
          <MotionButton class="nav-login" href="https://www.osmo.supply/login" label="Login" />
          <MotionButton class="nav-join" href="https://www.osmo.supply/plans" label="Join"><ArrowDownRight :size="17" />
          </MotionButton>
        </div>
      </nav>
      <div class="menu-expansion" :aria-hidden="!menuOpen" :inert="!menuOpen">
        <div class="menu-expansion__clip">
        <div class="menu-overlay">
          <div class="menu-grid">
            <div class="menu-column menu-products">
              <p class="menu-kicker">Our products</p>
              <a :href="osmoUrl(products[0]!.href)">The Vault</a>
              <a :href="osmoUrl(products[1]!.href)">Page Transition Course</a>
              <a :href="osmoUrl(products[2]!.href)">Button Pack <small>New</small></a>
              <a class="menu-community-link" :href="osmoUrl(products[5]!.href)">Community</a>
              <div class="menu-minor-links"><a class="menu-icon-link" :href="osmoUrl(products[4]!.href)">Icon Library</a><span class="menu-easings is-muted" aria-disabled="true">Easings <small>New</small></span></div>
            </div>
            <div class="menu-column menu-explore">
              <p class="menu-kicker">Explore</p>
              <a href="https://www.osmo.supply/showcase">Osmo Showcase</a>
              <a href="https://www.osmo.supply/collection">Collection <small>212</small></a>
              <a href="https://www.osmo.supply/plans">Pricing</a>
              <div class="menu-socials"><a href="https://www.linkedin.com/company/osmosupply/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a><a href="https://www.instagram.com/osmo.supply/" target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon name="instagram" /></a><a href="https://twitter.com/osmosupply" target="_blank" rel="noreferrer" aria-label="X"><SocialIcon name="x" /></a></div>
            </div>
            <a class="menu-feature" href="https://www.osmo.supply/product/page-transition-course">
              <span class="menu-feature__meta"><b>Start</b><em>Learning</em></span>
              <div class="menu-feature__content">
              <strong>Page Transition Course</strong>
              <div class="menu-feature__preview"><img :src="`${assetBase}/website/bandwidth/page-transition-course-thumb-1440x900.avif`" alt="Page Transition Course preview" /></div>
              <span class="menu-feature__arrow"><ButtonLabel label="More info" /></span>
              </div>
            </a>
          </div>
          <div class="menu-mobile-actions">
            <MotionButton href="https://www.osmo.supply/login" label="Member Login" inherit-size />
            <MotionButton href="https://www.osmo.supply/plans" label="Join Osmo" inherit-size><ArrowDownRight :size="17" /></MotionButton>
          </div>
        </div>
        </div>
      </div>
      <a class="showcase-ticker" href="https://www.osmo.supply/showcase" :inert="menuOpen" :aria-hidden="menuOpen ? true : undefined">
        <span v-for="item in 6" :key="item">Explore projects built with Osmo <Asterisk :size="13" /></span>
      </a>
    </header>

    <main :inert="menuOpen || Boolean(modal)">
      <section class="hero">
        <div class="hero-grid-lines" aria-hidden="true"></div>
        <div class="hero-copy">
          <div class="hero-copy__heading">
          <h1>Dev Toolkit</h1>
          <img class="hero-star" src="/assets/osmo-star.svg" alt="" />
          <h2>Built to Flex</h2>
          </div>
          <p>
            Platform packed with <span>Webflow</span> &amp; <span>HTML</span> resources,
            <span>icons</span>, <span>easings</span> and a page transition <span>course</span>
          </p>
        </div>
        <div
          class="hero-deck"
          aria-label="Featured resource previews"
        >
          <article
            v-for="(resource, index) in heroMarqueeResources"
            :key="`${resource[0]}-${index}`"
            class="hero-card"
            :style="{ '--x': `${heroPositions[index % heroPositions.length]?.x ?? 0}px`, '--y': `${heroPositions[index % heroPositions.length]?.y ?? 0}px`, '--r': `${heroPositions[index % heroPositions.length]?.r ?? 0}deg`, '--slot-angle': `${index * 20}deg`, '--depth': String(Math.abs(4 - (index % heroPositions.length))) }"
          >
            <img :src="resource[1]" :alt="resource[0]" />
            <span>{{ resource[0] }}</span>
          </article>
        </div>
        <div class="hero-drag"><MousePointer2 :size="14" /><span>Move to explore</span></div>
      </section>

      <section class="reel-section section-pad">
        <div class="reel-intro reveal">
          <h2>Osmo is an ever-growing platform with Webflow &amp; HTML resources. Get exclusive access to the elements, techniques and code behind award-winning work.</h2>
          <button class="reel-player" type="button" aria-label="Play Osmo reel" data-player-control-open="reel" @click="openModal('reel', $event)">
            <span class="reel-player__word reel-player__word--left"><ButtonLabel label="Play" inherit-size /></span>
            <span class="reel-player__word reel-player__word--right"><ButtonLabel label="Reel" inherit-size /></span>
            <img class="reel-player__circle" src="https://osmo.b-cdn.net/website/svg/reel-circle-deco.svg" alt="" />
            <span class="reel-player__preview">
              <video ref="previewVideo" :autoplay="!prefersReducedMotion" muted loop playsinline preload="metadata">
                <source src="https://cdn.prod.website-files.com/6708f85ff3d3cba6aff436fb%2F670e5ef201603b3a7dda3aa9_Osmo-V12-Reel-Tiny_compressed-transcode.mp4" type="video/mp4" />
              </video>
              <span>Osmo in use</span><small>00:48</small>
            </span>
            <em>See what it can do!</em>
          </button>
        </div>
      </section>

      <section id="latest" class="latest-section section-pad">
        <div class="latest-community-proof" aria-label="Join more than 3,000 Osmo members">
          <span class="avatar-stack">
            <img src="https://osmo.b-cdn.net/showcase-credits-img/victor-work-128x128.avif" alt="" />
            <img src="https://osmo.b-cdn.net/showcase-credits-img/jordan-gilory-128x128.avif" alt="" />
            <img src="https://osmo.b-cdn.net/showcase-credits-img/jason-harvey-128x128.avif" alt="" />
            <img src="https://osmo.b-cdn.net/showcase-credits-img/huy-nguyen-128x128.avif" alt="" />
          </span>
          <span>Join 3K+ others</span>
        </div>
        <img class="latest-credit" :src="`${assetBase}/website/bandwidth/osmo-micrographic-1.avif`" alt="" />
        <div class="creator-latest-grid reveal">
        <div class="creator-band" :data-creator="creatorIndex === 0 ? 'dennis' : 'ilja'" @click="openModal('about', $event)">
          <div class="creator-heading">
            <span>Created by</span>
            <button class="creator-name creator-name--dennis" :tabindex="creatorIndex === 0 ? 0 : -1" type="button" data-modal-trigger="about" @click.stop="openModal('about', $event)"><strong><ButtonLabel label="Dennis" inherit-size /></strong><strong><ButtonLabel label="Snellenberg" inherit-size /></strong></button>
            <button class="creator-name creator-name--ilja" :tabindex="creatorIndex === 1 ? 0 : -1" type="button" data-modal-trigger="about" @click.stop="openModal('about', $event)"><strong><ButtonLabel label="Ilja" inherit-size /></strong><strong><ButtonLabel label="van Eck" inherit-size /></strong></button>
          </div>
          <div class="creator-portraits" aria-hidden="true">
            <div v-for="(portrait, layer) in creatorLayers" :key="layer" class="creator-layer" :class="`creator-layer--${layer}`">
              <img :class="{ 'is-active': portrait === 0 }" :src="`${assetBase}/website/bandwidth/dennis-cutout-new.avif`" alt="" />
              <img :class="{ 'is-active': portrait === 1 }" :src="`${assetBase}/website/bandwidth/ilja-cutout-new.avif`" alt="" />
            </div>
            <span class="creator-marker"></span>
          </div>
          <MotionButton class="text-button text-button--dark" type="button" data-modal-trigger="about" @click="openModal('about', $event)" label="About us"><ArrowDownRight :size="18" /></MotionButton>
        </div>
        <div class="latest-capsule latest-resources-slider" :style="{ '--slide-direction': latestDirection }">
          <p class="latest-capsule__title"><span>Latest updates</span><br />from Osmo</p>
          <Transition name="latest-slide">
          <div :key="latestIndex" class="latest-capsule__card">
            <span class="latest-capsule__copy"><small>{{ updates[latestIndex]?.date }} <b>New resource</b></small><strong>{{ updates[latestIndex]?.title }}</strong><em>{{ updates[latestIndex]?.category }}</em></span>
            <img :src="updates[latestIndex]?.image" :alt="updates[latestIndex]?.title" />
          </div>
          </Transition>
          <div class="latest-capsule__controls" @mouseenter="latestHoverPaused = true" @mouseleave="latestHoverPaused = false" @focusin="latestFocusPaused = true" @focusout="handleCarouselFocusOut($event, 'latest')">
            <button type="button" aria-label="Previous update" data-motion-cursor="previous" @click="rotateLatest(-1)"><ArrowUp :size="18" /></button>
            <button type="button" aria-label="Next update" data-motion-cursor="next" @click="rotateLatest(1)"><ArrowDown :size="18" /></button>
          </div>
          <em>New stuff is<br />added every week!</em>
        </div>
        </div>
      </section>

      <section class="platform-section section-pad">
        <div class="platform-title reveal">
          <h2>The platform</h2>
          <span>( The Vault )</span>
        </div>
        <p class="platform-lead reveal">Built by two award-winning creative developers, our vault gives you access to the techniques, components, code, and tools behind our projects. Build, tweak, and make them your own.</p>
        <div class="platform-content">
        <div class="dashboard-frame reveal">
          <img :src="`${assetBase}/website/features/dashboard-overview-2880x1800.jpg`" alt="Osmo Vault Dashboard Preview" />
        </div>
        <div class="platform-foot reveal">
          <p>We built Osmo to help creative developers work smarter, faster, and better.</p>
          <MotionButton class="text-button" :href="osmoUrl(products[0]!.href)" label="About the Vault"><ArrowDownRight :size="18" /></MotionButton>
        </div>
        </div>
      </section>

      <section id="toolkit" class="toolkit-section section-pad">
        <div class="toolkit-heading reveal">
          <h2>A growing toolkit for creative developers</h2>
          <p>Access everything with a single membership:</p>
        </div>
        <div class="product-tabs reveal" role="tablist" aria-label="Osmo products">
          <MotionButton
            v-for="(product, index) in products"
            :key="product.name"
            type="button"
            role="tab"
            :id="`product-tab-${index}`"
            aria-controls="product-panel"
            :aria-selected="activeProduct === index"
            :tabindex="activeProduct === index ? 0 : -1"
            :class="{ active: activeProduct === index }"
            @click="selectProduct(index)"
            @keydown="handleProductKeydown($event, index)"
            :label="product.name"
            inherit-size
          />
        </div>
        <div class="product-stage reveal" :class="{ 'is-dragging': productDragging }" data-motion-cursor="drag" @pointerdown="startProductSwipe" @pointermove="moveProductSwipe" @pointerup="endProductSwipe" @pointercancel="cancelSwipe($event, productSwipe)" @pointerleave="leaveSwipe($event, productSwipe)" @lostpointercapture="cancelSwipe($event, productSwipe)" @click.capture="suppressDraggedClick" @dragstart.prevent>
          <img class="product-orbit" src="https://osmo.b-cdn.net/website/svg/product-slider-circle-deco.svg" alt="" />
          <article
            v-for="item in productWindow"
            :id="item.offset === 0 ? 'product-panel' : undefined"
            :key="item.product.name"
            class="product-feature"
            :style="{ '--product-angle': `${item.visualOffset * 20}deg`, '--product-order': item.index }"
            :class="[
              `product-feature--${item.offset === 0 ? 'active' : item.offset < 0 ? 'previous' : 'next'}`,
              { 'product-feature--long-title': item.product.name === 'Page Transition Course', 'is-outside': Math.abs(item.visualOffset) > 2.5 },
            ]"
            :aria-hidden="item.offset !== 0"
            :aria-labelledby="item.offset === 0 ? `product-tab-${activeProduct}` : undefined"
            :role="item.offset === 0 ? 'tabpanel' : undefined"
          >
              <div class="product-feature__copy">
                <span>{{ item.product.eyebrow }}</span>
                <img src="/assets/osmo-star.svg" alt="" />
                <h3>{{ item.product.name }}</h3>
                <p>{{ item.product.description }}</p>
                <MotionButton v-if="!item.product.disabled" class="text-button text-button--dark" :href="osmoUrl(item.product.href)" :tabindex="item.offset === 0 ? undefined : -1" label="Discover"><ArrowDownRight :size="18" /></MotionButton>
              </div>
              <div class="product-feature__media">
                <img :src="item.product.image" :alt="`${item.product.name} preview`" />
              </div>
          </article>
        </div>
      </section>

      <section class="why-section section-pad">
        <div class="why-heading reveal">
          <img src="https://osmo.b-cdn.net/website/bandwidth/osmo-micrographic-2.avif" alt="Osmo, built to flex" />
          <span>Why Osmo?</span>
          <h2>Level up your game and join a community of creatives who love building great websites as much as you do.</h2>
        </div>
        <div class="why-grid why-rows">
          <article class="reveal">
            <div class="why-icon"><Layers3 :size="28" /></div>
            <span>01</span><h3>Build faster and better</h3>
            <p>Our resources save you hours of rebuilding from scratch. Each one is made for real-world projects, so you can focus on shipping work that stands out.</p>
          </article>
          <article class="reveal">
            <div class="why-icon"><Sparkles :size="28" /></div>
            <span>02</span><h3>Speed up your process</h3>
            <p>These aren’t stripped-down templates. Every resource is built to be fast, flexible, and production-ready, so you can ship beautiful work without trading quality for time.</p>
          </article>
          <article class="reveal">
            <div class="why-icon"><Clock3 :size="28" /></div>
            <span>03</span><h3>A living and growing system</h3>
            <p>We keep adding new resources, ideas, and techniques every week. The Vault evolves with you and your needs, so your toolkit never stops expanding.</p>
          </article>
        </div>
        <div class="trusted-strip reveal"><span>Trusted by</span><span>Industry giants</span><strong>superpower</strong><strong>tonik</strong><strong>Webflow</strong><strong>HELLO MONDAY<br />/DEPT.</strong><strong>UI</strong></div>
      </section>

      <section class="testimonial-section section-pad reveal">
        <div class="globe-panel">
          <div class="globe-label"><Globe2 :size="20" /><span>Connect<br />Worldwide</span></div>
          <div class="globe-wrap">
            <svg class="globe-progress" viewBox="0 0 380 380" aria-hidden="true"><circle cx="190" cy="190" r="184" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="1 9" /><circle cx="190" cy="190" r="184" fill="none" stroke="#201d1d" stroke-width="12" pathLength="1" stroke-dasharray="1" :stroke-dashoffset="-testimonialProgress" opacity=".8" transform="rotate(-90 190 190)" /></svg>
            <div class="globe-map" :style="{ '--map-transform': mapTransform }">
              <img :src="`${assetBase}/website/bandwidth/quote-map-base.avif`" alt="Globe Map" />
              <img v-for="(testimonial, index) in testimonials" :key="testimonial.map" class="globe-country" :class="{ 'is-active': testimonialIndex === index }" :src="testimonial.map" alt="" />
            </div>
          </div>
          <p>Osmo’s Global<br />Community</p>
        </div>
        <div class="quote-panel" :style="{ '--slide-direction': testimonialDirection }">
          <Transition name="quote">
            <article :key="testimonialIndex">
              <span class="quote-mark">“</span>
              <h2>{{ testimonials[testimonialIndex]?.quote }}</h2>
              <p>{{ testimonials[testimonialIndex]?.body }}</p>
              <div class="quote-author"><img :src="testimonials[testimonialIndex]?.image" :alt="testimonials[testimonialIndex]?.name" /><div><strong>{{ testimonials[testimonialIndex]?.name }}</strong><span>{{ testimonials[testimonialIndex]?.role }}</span></div></div>
            </article>
          </Transition>
          <div class="quote-controls" @mouseenter="testimonialHoverPaused = true" @mouseleave="testimonialHoverPaused = false" @focusin="testimonialFocusPaused = true" @focusout="handleCarouselFocusOut($event, 'testimonial')"><span>{{ testimonialIndex + 1 }} / {{ testimonials.length }}</span><div><button type="button" title="Previous testimonial" data-motion-cursor="previous" @click="rotateTestimonial(-1)"><ArrowUp :size="20" /></button><button type="button" title="Next testimonial" data-motion-cursor="next" @click="rotateTestimonial(1)"><ArrowDown :size="20" /></button></div></div>
        </div>
      </section>

      <section id="pricing" class="pricing-section section-pad">
        <div class="pricing-heading reveal">
          <h2>Everything you need in <br />one membership</h2>
          <BillingSwitch v-model="billing" />
        </div>
        <div class="price-grid">
          <article class="price-card reveal">
            <div class="price-card__top"><span>1 user</span></div>
            <h3>Solo</h3>
            <div class="price"><span>€</span><del v-if="billing === 'annual'">25</del><strong>{{ soloPrice }}</strong><small>EUR</small></div>
            <p>Per month, billed {{ billing === 'annual' ? 'annually' : 'quarterly' }}</p>
            <MotionButton :href="soloPlanUrl" label="Become a member" full />
            <div class="price-benefits"><p><strong>212</strong> Vault Resources, added weekly</p><MotionButton href="https://www.osmo.supply/plans" label="View all benefits" inherit-size /></div>
          </article>
          <article class="price-card price-card--green reveal">
            <div class="price-card__top"><span>min 2 users</span></div>
            <h3>Team</h3>
            <div class="price"><span>€</span><del v-if="billing === 'annual'">20</del><strong>{{ teamPrice }}</strong><small>EUR</small></div>
            <p>Per person/month, billed {{ billing === 'annual' ? 'annually' : 'quarterly' }}</p>
            <MotionButton :href="teamPlanUrl" label="Sign up your team" full />
            <div class="price-benefits"><p><strong>212</strong> Vault Resources, added weekly</p><MotionButton href="https://www.osmo.supply/plans" label="View all benefits" inherit-size /></div>
            <span class="price-sticker">Save an extra<br />20% per user!</span>
          </article>
        </div>
        <MotionButton class="pricing-link reveal" href="https://www.osmo.supply/plans" label="View full pricing" />
      </section>

      <section id="made" class="made-section section-pad">
        <div class="made-title reveal"><h2><span>Made</span><span>with</span><span>Osmo</span></h2><img :src="`${assetBase}/website/svg/made-with-osmo-flick-circle-deco-v2.svg`" alt="" /></div>
        <div class="showcase-stage reveal" :class="{ 'is-dragging': showcaseDragging }" data-motion-cursor="drag" @pointerdown="startShowcaseSwipe" @pointermove="moveShowcaseSwipe" @pointerup="endShowcaseSwipe" @pointercancel="cancelSwipe($event, showcaseSwipe)" @pointerleave="leaveSwipe($event, showcaseSwipe)" @lostpointercapture="cancelSwipe($event, showcaseSwipe)" @click.capture="suppressDraggedClick" @dragstart.prevent>
            <article v-for="item in showcaseCards" :key="item.showcase.name" :style="item.style" :class="{ 'is-active': item.index === showcaseIndex }" :aria-hidden="item.index !== showcaseIndex" :inert="item.index !== showcaseIndex">
              <img :src="item.showcase.image" :alt="item.showcase.name" />
              <button class="showcase-card-trigger" type="button" data-modal-trigger="showcase" :aria-label="`View resources used on ${item.showcase.name}`" @click="openModal('showcase', $event)"></button>
              <div class="showcase-caption">
                <div class="showcase-caption__title"><span>{{ item.showcase.name }}</span><button type="button" data-modal-trigger="showcase" @click="openModal('showcase', $event)"><strong><ButtonLabel :label="String(item.showcase.resources.length)" inherit-size /> <small><ButtonLabel label="Resources used" inherit-size /></small></strong><Asterisk :size="9" /></button></div>
                <div class="showcase-caption__authors"><a v-for="author in item.showcase.authors" :key="author.name" :href="author.url" target="_blank" rel="noreferrer">{{ author.name }} <ExternalLink :size="16" /></a></div>
              </div>
            </article>
          <div class="showcase-controls"><button type="button" title="Previous project" @click="rotateShowcase(-1)"><ArrowLeft :size="22" /></button><span>{{ String(showcaseIndex + 1).padStart(2, '0') }} / {{ String(showcases.length).padStart(2, '0') }}</span><button type="button" title="Next project" @click="rotateShowcase(1)"><ArrowRight :size="22" /></button></div>
        </div>
        <div class="made-foot reveal"><p><svg class="made-note-arrow" viewBox="0 0 31 32" fill="none" aria-hidden="true"><path d="M0 30.7837L1.24998 30.9926L1.62857 31.5964C1.45886 29.6382 4.50712 28.7243 5.21208 26.864C5.42421 26.3027 4.76822 26.208 4.56913 26.3843C4.52018 26.4267 4.33089 27.1121 3.92945 27.5331C3.58351 27.8921 2.02674 29.6284 1.63183 29.3151C2.1377 24.2498 3.34526 19.6056 5.93335 15.1964C11.2009 6.21156 20.7308 1.28669 30.9689 0.457718C15.8484 -0.181961 2.73822 12.5268 1.29894 27.3569C0.443859 27.0142 1.35769 24.2368 0 24.4228V30.7837Z" fill="currentColor" /></svg>These folks<br />are talented</p><a class="text-button text-button--light" href="https://www.osmo.supply/showcase">Explore showcase <ArrowDownRight :size="18" /></a></div>
      </section>

      <section class="level-section section-pad">
        <div class="level-visual" :style="levelAngles" aria-label="Built to Flex — Creative developer">
          <div class="level-art">
            <img class="level-art-base" :src="`${assetBase}/website/bandwidth/female-dev-subject.avif`" alt="" />
            <div class="level-type-plate" aria-hidden="true"><div class="level-type"><span>Built</span><span>to Flex</span><span>Built</span><span>to Flex</span></div></div>
            <div v-for="layer in 3" :key="layer" class="level-ring" :class="`level-ring--${layer}`" aria-hidden="true">
              <div v-if="layer === 2" class="level-type level-type--counter"><span>Built</span><span>to Flex</span><span>Built</span><span>to Flex</span></div>
              <img :src="`${assetBase}/website/bandwidth/female-dev-subject.avif`" alt="" />
            </div>
            <div class="level-marker" aria-hidden="true" @animationiteration="refreshLevelAngles"></div>
          </div>
        </div>
        <span class="level-note" aria-hidden="true">We'll see you there!</span>
        <div class="level-content reveal">
          <div class="avatar-stack">
            <img src="https://osmo.b-cdn.net/showcase-credits-img/victor-work-128x128.avif" alt="Victor Work" />
            <img src="https://osmo.b-cdn.net/showcase-credits-img/jordan-gilory-128x128.avif" alt="Jordan Gilroy" />
            <img src="https://osmo.b-cdn.net/showcase-credits-img/jason-harvey-128x128.avif" alt="Jason Harvey" />
            <img src="https://osmo.b-cdn.net/showcase-credits-img/huy-nguyen-128x128.avif" alt="Huy Nguyen" />
          </div>
          <span>Join 3K+ others</span>
          <h2>Ready to<br />level up?</h2>
          <p>Become a member to unlock the full Osmo toolkit today.</p>
          <div><MotionButton class="primary-button" href="https://www.osmo.supply/plans" label="Become a member"><ArrowDownRight :size="18" /></MotionButton><MotionButton class="ghost-button" href="https://www.osmo.supply/faq" label="FAQs"><ArrowDownRight :size="18" /></MotionButton></div>
        </div>
      </section>
    </main>

    <footer class="site-footer section-pad" :inert="menuOpen || Boolean(modal)">
      <div class="footer-socials-mobile" aria-label="Social links"><a href="https://www.linkedin.com/company/osmosupply/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a><a href="https://www.instagram.com/osmo.supply/" target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon name="instagram" /></a><a href="https://twitter.com/osmosupply" target="_blank" rel="noreferrer" aria-label="X"><SocialIcon name="x" /></a></div>
      <div class="newsletter reveal">
        <div><Asterisk :size="32" /><h2>Subscribe to the Osmo Newsletter</h2></div>
        <form @submit.prevent="submitNewsletter">
          <div class="field"><label for="newsletter-name">First name</label><input id="newsletter-name" v-model="newsletterName" autocomplete="given-name" placeholder="First name" required /></div>
          <div class="field"><label for="newsletter-email">Email address</label><input id="newsletter-email" v-model="newsletterEmail" type="email" autocomplete="email" placeholder="yourname@email.com" required /></div>
          <label class="check-field"><input v-model="newsletterConsent" type="checkbox" /><span class="check-field__control"><Check :size="14" /></span><span class="check-field__label">I agree to the <a href="https://www.osmo.supply/legal/privacy-policy">Privacy Policy</a></span></label>
          <MotionButton type="submit" :disabled="newsletterStatus === 'loading' || newsletterStatus === 'success'" :label="newsletterStatus === 'loading' ? 'Joining…' : newsletterStatus === 'success' ? 'Subscribed' : 'Get updates'"><ArrowDownRight :size="18" /></MotionButton>
          <p v-if="newsletterMessage" class="form-message" :class="newsletterStatus" role="status">{{ newsletterMessage }}</p>
        </form>
      </div>
      <div class="footer-links reveal">
        <div class="footer-group" :class="{ open: isFooterGroupExpanded(0) }"><button class="footer-group-toggle" type="button" aria-controls="footer-products" :aria-expanded="isFooterGroupExpanded(0)" :tabindex="footerIsMobile ? 0 : -1" @click="toggleFooterGroup(0)"><h3><ButtonLabel label="Product" inherit-size /></h3><Plus :size="17" /></button><div id="footer-products" class="footer-group-content"><template v-for="(product, index) in products" :key="product.name"><span v-if="product.disabled" class="footer-disabled" aria-disabled="true">{{ product.footerName ?? product.name }} <small>New</small></span><a v-else :href="osmoUrl(product.href)">{{ product.footerName ?? product.name }} <span v-if="index === 2">New</span></a></template></div></div>
        <div class="footer-group" :class="{ open: isFooterGroupExpanded(1) }"><button class="footer-group-toggle" type="button" aria-controls="footer-community" :aria-expanded="isFooterGroupExpanded(1)" :tabindex="footerIsMobile ? 0 : -1" @click="toggleFooterGroup(1)"><h3><ButtonLabel label="Community" inherit-size /></h3><Plus :size="17" /></button><div id="footer-community" class="footer-group-content"><a href="https://www.osmo.supply/showcase">Showcase</a><MotionButton type="button" data-modal-trigger="about" @click="openModal('about', $event)" label="About Osmo" inherit-size /><a href="https://www.osmo.supply/updates">Updates</a></div></div>
        <div class="footer-group" :class="{ open: isFooterGroupExpanded(2) }"><button class="footer-group-toggle" type="button" aria-controls="footer-membership" :aria-expanded="isFooterGroupExpanded(2)" :tabindex="footerIsMobile ? 0 : -1" @click="toggleFooterGroup(2)"><h3><ButtonLabel label="Membership" inherit-size /></h3><Plus :size="17" /></button><div id="footer-membership" class="footer-group-content"><a href="https://www.osmo.supply/collection">Collection</a><a href="https://www.osmo.supply/plans">Pricing</a><a href="https://www.osmo.supply/faq">FAQs</a><a href="#" data-o-support="1">Support</a></div></div>
        <div class="footer-actions"><MotionButton href="https://www.osmo.supply/login" label="Login" /><MotionButton href="https://www.osmo.supply/plans" label="Join Osmo"><ArrowDownRight :size="18" /></MotionButton><div class="footer-socials"><a href="https://www.linkedin.com/company/osmosupply/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a><a href="https://www.instagram.com/osmo.supply/" target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon name="instagram" /></a><a href="https://twitter.com/osmosupply" target="_blank" rel="noreferrer" aria-label="X"><SocialIcon name="x" /></a></div></div>
      </div>
      <p class="footer-created-mobile"><span>Created by</span><span><a href="https://dennissnellenberg.com/" target="_blank" rel="noreferrer">Dennis</a><a href="https://www.iljavaneck.com/" target="_blank" rel="noreferrer">Ilja</a></span></p>
      <div class="footer-bottom"><div><a href="https://www.osmo.supply/legal/licensing-agreement">Licensing</a><a href="https://www.osmo.supply/legal/terms-and-conditions">T&amp;Cs</a><a href="https://www.osmo.supply/legal/privacy-policy">Privacy</a><a href="https://www.osmo.supply/legal/cookie-policy">Cookies</a></div><p>© 2026 Osmo Supply B.V.</p><p>Created by <a href="https://dennissnellenberg.com/" target="_blank" rel="noreferrer">Dennis</a> + <a href="https://www.iljavaneck.com/" target="_blank" rel="noreferrer">Ilja</a></p></div>
      <a ref="footerLogo" class="footer-logo" href="#top" aria-label="Back to top"><span class="footer-wordmark" aria-hidden="true" v-html="footerWordmark"></span></a>
    </footer>

    <Transition name="modal">
      <div v-if="modal" class="modal-layer" role="presentation" @mousedown.self="closeModal">
        <section ref="modalCard" class="modal-card" :class="`modal-card--${modal}`" role="dialog" aria-modal="true" :aria-label="`${modal} dialog`" @keydown.tab="trapModalFocus">
          <button
            class="modal-close"
            type="button"
            title="Close"
            :data-modal-close="modal === 'about' || modal === 'showcase' ? modal : undefined"
            :data-player-control-close="modal === 'reel' ? 'reel' : undefined"
            @click="closeModal"
          ><X :size="20" /><span class="modal-close__label"><ButtonLabel label="Close" inherit-size /></span></button>

          <div v-if="modal === 'reel'" class="reel-modal">
            <div class="reel-canvas" :class="{ paused: !reelPlaying }" @click="toggleReel">
              <video
                ref="reelVideo"
                :autoplay="!prefersReducedMotion"
                loop
                :muted="reelMuted"
                playsinline
                preload="metadata"
                poster="https://osmo.b-cdn.net/resource-img/radial-cards-slider-gsap-1440x900-v2.avif"
                @timeupdate="updateReelProgress"
                @play="reelPlaying = true"
                @pause="reelPlaying = false"
              >
                <source src="https://cdn.prod.website-files.com/6708f85ff3d3cba6aff436fb%2F670e5ef201603b3a7dda3aa9_Osmo-V12-Reel-Tiny_compressed-transcode.mp4" type="video/mp4" />
              </video>
              <div class="reel-watermark"><Asterisk :size="34" /><strong>OSMO</strong></div>
            </div>
            <div class="reel-modal__controls">
              <button type="button" data-player-control-toggle="reel" :title="reelPlaying ? 'Pause reel' : 'Play reel'" @click="toggleReel"><Pause v-if="reelPlaying" :size="20" /><Play v-else :size="20" fill="currentColor" /></button>
              <span>Osmo in use · 00:48</span>
              <input :value="reelProgress" type="range" min="0" max="100" aria-label="Reel progress" @input="seekReel" />
              <button type="button" data-player-control-mute="reel" :title="reelMuted ? 'Unmute reel' : 'Mute reel'" @click="toggleReelMute"><VolumeX v-if="reelMuted" :size="20" /><Volume2 v-else :size="20" /></button>
            </div>
          </div>

          <div v-else-if="modal === 'showcase'" class="showcase-modal">
            <div class="showcase-modal__scroll">
              <header class="showcase-modal__hero">
                <p>Project</p>
                <h2>{{ activeShowcase.name }}</h2>
              </header>
              <section class="showcase-modal__credits" aria-label="Project credits">
                <div class="showcase-modal__authors">
                  <a v-for="author in activeShowcase.authors" :key="author.name" :href="author.url" target="_blank" rel="noreferrer">
                    <img :src="author.image" :alt="author.name" />
                    <span>{{ author.name }}</span>
                  </a>
                </div>
                <p><strong>{{ activeShowcase.resources.length }}</strong> Resources Used</p>
              </section>
              <section class="showcase-modal__resources" aria-label="Resources used">
                <a v-for="item in activeShowcase.resources" :key="item.slug" :href="item.href" target="_blank" rel="noreferrer" class="used-resource-card">
                  <div><h3>{{ item.title }}</h3><span>{{ item.category }}</span></div>
                  <img :src="item.image" :alt="`${item.title} preview`" />
                  <ExternalLink :size="18" />
                </a>
              </section>
            </div>
            <footer class="showcase-modal__actions">
              <MotionButton :href="activeShowcase.site" target="_blank" rel="noreferrer" label="Visit site" inherit-size><ArrowUpRight :size="10" /></MotionButton>
              <MotionButton href="https://www.osmo.supply/plans" label="Join Osmo" inherit-size><ArrowDownRight :size="17" /></MotionButton>
            </footer>
          </div>

          <div v-else-if="modal === 'about'" class="about-modal">
            <div class="about-logo"><img src="/assets/osmo-about-logo.svg" alt="Osmo" /></div>
            <h2><span>A platform by...</span></h2>
            <div class="about-profiles">
              <article><img src="https://osmo.b-cdn.net/website/bandwidth/pf-dennis.avif" alt="Dennis Snellenberg" /><div><strong>Dennis<br />Snellenberg</strong><span><a href="https://www.instagram.com/codebydennis/" target="_blank" rel="noreferrer" aria-label="Dennis on Instagram"><SocialIcon name="instagram" /></a><a href="https://www.linkedin.com/in/dennissnellenberg/" target="_blank" rel="noreferrer" aria-label="Dennis on LinkedIn"><SocialIcon name="linkedin" /></a><a href="https://x.com/codebydennis" target="_blank" rel="noreferrer" aria-label="Dennis on X"><SocialIcon name="x" /></a></span></div></article>
              <article><img src="https://osmo.b-cdn.net/website/bandwidth/pf-ilja.avif" alt="Ilja van Eck" /><div><strong>Ilja<br />van Eck</strong><span><a href="https://www.instagram.com/by.ilja/" target="_blank" rel="noreferrer" aria-label="Ilja on Instagram"><SocialIcon name="instagram" /></a><a href="https://www.linkedin.com/in/ilja-van-eck/" target="_blank" rel="noreferrer" aria-label="Ilja on LinkedIn"><SocialIcon name="linkedin" /></a><a href="https://x.com/iljavaneck" target="_blank" rel="noreferrer" aria-label="Ilja on X"><SocialIcon name="x" /></a></span></div></article>
            </div>
            <div class="about-map-wrap"><div class="about-map-frame"><img class="about-map" src="https://osmo.b-cdn.net/website/bandwidth/about-map.svg" alt="Netherlands and Belgium" /></div></div>
            <p>Based in Netherlands and Belgium, and with a combined total of 38 Site of the Day awards on Awwwards, we’ve put our years of experience in to a platform that empowers you to create interactive, animated, one-of-a-kind websites.</p>
            <div class="about-stats"><div><strong>120+</strong><span>Sites Pushed Live</span></div><div><strong>38</strong><span>Site of the Day Awards</span></div></div>
            <section class="about-gallery" aria-label="Selected work">
              <div class="about-gallery-container">
                <div class="about-gallery-list">
                  <div class="about-gallery-item"><img src="https://osmo.b-cdn.net/website/bandwidth/about-modal-1.avif" alt="Selected Osmo project" /></div>
                  <div class="about-gallery-item"><img src="https://osmo.b-cdn.net/website/bandwidth/about-modal-2.avif" alt="Selected Osmo project" /></div>
                  <div class="about-gallery-item"><img src="https://osmo.b-cdn.net/website/bandwidth/about-modal-3.avif" alt="Selected Osmo project" /></div>
                </div>
                <div class="about-actions"><MotionButton href="https://www.osmo.supply/plans" label="Join Osmo" inherit-size /><MotionButton href="https://www.osmo.supply/product/community" label="Community" inherit-size /></div>
              </div>
            </section>
            <div class="about-footer"><img class="about-footer-logo" src="/assets/osmo-footer-wordmark.svg" alt="" /></div>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>
