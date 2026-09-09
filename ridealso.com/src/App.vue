<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from "vue";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Instagram,
  Linkedin,
  Menu,
  ShoppingCart,
  UserRound,
  X,
  Youtube,
} from "lucide-vue-next";
import { Swiper, SwiperSlide } from "swiper/vue";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import VideoCard from "./components/VideoCard.vue";
import NoiseBackdrop from "./components/NoiseBackdrop.vue";
import NewsletterForm from "./components/NewsletterForm.vue";
import {
  menus,
  original,
  press,
  promoCards,
  slides,
  social,
  stories,
} from "./content";

const modules = [A11y, Autoplay, EffectFade, Keyboard];
const activeSlide = ref(0);
const pressIndex = ref(0);
const activeMenu = ref<string | null>(null);
const mobileOpen = ref(false);
const scrolled = ref(false);
const headerHidden = ref(false);
const header = ref<HTMLElement>();
const hero = shallowRef<SwiperInstance>();
const carousels: Record<string, SwiperInstance> = {};
const carouselEdges = reactive<
  Record<string, { start: boolean; end: boolean }>
>({
  social: { start: true, end: false },
  stories: { start: true, end: false },
});
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const desktop = ref(window.innerWidth >= 1060);
const carouselBreakpoints = {
  768: { slidesPerView: 2 },
  1060: { slidesPerView: 4 },
};
let previousScroll = 0;
let menuTimer: number | undefined;
let focusReturn: HTMLElement | null = null;
let mobileMenuIndex = 0;

function registerCarousel(name: string, swiper: SwiperInstance) {
  carousels[name] = swiper;
  updateCarousel(name, swiper);
}
function updateCarousel(name: string, swiper: SwiperInstance) {
  if (name === "press") pressIndex.value = swiper.realIndex;
  else carouselEdges[name] = { start: swiper.isBeginning, end: swiper.isEnd };
}
function move(name: string, delta: number) {
  delta > 0 ? carousels[name]?.slideNext() : carousels[name]?.slidePrev();
}
function enterMenu(name: string) {
  if (desktop.value) {
    clearTimeout(menuTimer);
    activeMenu.value = name;
  }
}
function leaveMenu() {
  if (desktop.value)
    menuTimer = window.setTimeout(() => {
      activeMenu.value = null;
    }, 160);
}
function cancelMenuClose() {
  clearTimeout(menuTimer);
}
async function toggleMenu(name: string) {
  if (!desktop.value) mobileMenuIndex = Object.keys(menus).indexOf(name);
  activeMenu.value = desktop.value
    ? name
    : activeMenu.value === name
      ? null
      : name;
  if (!desktop.value && activeMenu.value) {
    await nextTick();
    header.value
      ?.querySelector<HTMLButtonElement>(".mobile-menu-heading button")
      ?.focus();
  }
}
async function backToMobileMenu() {
  activeMenu.value = null;
  await nextTick();
  header.value
    ?.querySelectorAll<HTMLButtonElement>(".mobile-nav > button")
    [mobileMenuIndex]?.focus();
}
async function openMobile() {
  focusReturn = document.activeElement as HTMLElement;
  mobileOpen.value = !mobileOpen.value;
  activeMenu.value = null;
  await nextTick();
  if (mobileOpen.value)
    header.value
      ?.querySelector<HTMLButtonElement>(".mobile-nav button")
      ?.focus();
}
function closeOverlays() {
  activeMenu.value = null;
  mobileOpen.value = false;
  nextTick(() => focusReturn?.focus());
}
function onScroll() {
  const y = window.scrollY;
  scrolled.value = y > 140;
  if (Math.abs(y - previousScroll) > 4)
    headerHidden.value =
      y > 160 && y > previousScroll && !activeMenu.value && !mobileOpen.value;
  previousScroll = y;
}
function onResize() {
  desktop.value = window.innerWidth >= 1060;
  if (desktop.value) mobileOpen.value = false;
}
function onKey(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeOverlays();
    return;
  }
  if (event.key !== "Tab" || !mobileOpen.value) return;
  const root = header.value;
  const items = [
    ...(root?.querySelectorAll<HTMLElement>("a[href],button,summary") || []),
  ].filter((e) => e.getClientRects().length > 0);
  const first = items[0],
    last = items[items.length - 1];
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === root)
  ) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onResize);
  document.removeEventListener("keydown", onKey);
  clearTimeout(menuTimer);
});
</script>

<template>
  <div class="also-site" :class="{ 'overlay-open': mobileOpen }">
    <a class="announcement" :href="original('/pages/events')"
      >BOOK A TEST SPIN</a
    >
    <header
      ref="header"
      class="also-header"
      :class="{
        solid: scrolled,
        hidden: headerHidden,
        expanded: activeMenu || mobileOpen,
        'mobile-submenu': mobileOpen && activeMenu,
      }"
      @mouseenter="cancelMenuClose"
      @mouseleave="leaveMenu"
    >
      <div class="header-bar">
        <a class="also-logo" href="/" aria-label="ALSO home"></a>
        <nav aria-label="Primary navigation">
          <button
            v-for="(_, name) in menus"
            :key="name"
            :class="{ active: activeMenu === name }"
            :aria-expanded="activeMenu === name"
            aria-controls="mega-menu"
            @mouseenter="enterMenu(name)"
            @focus="enterMenu(name)"
            @click="toggleMenu(name)"
          >
            {{ name }}
          </button>
        </nav>
        <div class="header-actions">
          <a class="pill light small" :href="original('/pages/events')"
            >TEST SPIN</a
          ><a class="cart-link" aria-label="Cart" :href="original('/cart')"
            ><ShoppingCart :size="24" :stroke-width="1.5" /></a
          ><a
            class="account-link"
            :href="original('/account/login')"
            aria-label="Account"
            ><UserRound :size="24" :stroke-width="1.5" /></a
          ><button
            class="menu-button"
            :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="mobileOpen"
            @click="openMobile"
          >
            <X v-if="mobileOpen" :size="24" /><Menu v-else :size="24" />
          </button>
        </div>
      </div>
      <nav
        v-if="mobileOpen && !activeMenu"
        class="mobile-nav"
        aria-label="Mobile navigation"
      >
        <button
          v-for="(_, name) in menus"
          :key="name"
          @click="toggleMenu(name)"
        >
          {{ name }}<ChevronRight :size="18" /></button
        ><a :href="original('/account/login')"
          >ACCOUNT<UserRound :size="20" /></a
        ><a class="pill purple" :href="original('/pages/events')">TEST SPIN</a>
      </nav>
      <Transition name="menu"
        ><div v-if="activeMenu" id="mega-menu" class="mega-menu">
          <div class="mobile-menu-heading">
            <button aria-label="Back to menu" @click="backToMobileMenu">
              <ArrowLeft :size="20" />{{ activeMenu }}</button
            ><button aria-label="Close menu" @click="closeOverlays">
              <X :size="22" />
            </button>
          </div>
          <nav class="mega-links" :aria-label="`${activeMenu} navigation`">
            <template v-for="item in menus[activeMenu].links" :key="item.label"
              ><details v-if="item.children">
                <summary>{{ item.label }}<ChevronRight :size="16" /></summary>
                <a
                  v-for="child in item.children"
                  :key="child.label"
                  :href="original(child.href)"
                  >{{ child.label }}</a
                >
              </details>
              <a v-else :href="original(item.href!)">{{
                item.label
              }}</a></template
            >
          </nav>
          <a
            v-for="card in menus[activeMenu].cards"
            :key="card.title"
            class="mega-card"
            :href="original(card.href)"
            ><img :src="`/assets/${card.image}`" :alt="card.title" />
            <h2>{{ card.title }}</h2>
            <span class="pill light small">{{ card.action }}</span></a
          >
        </div></Transition
      >
    </header>
    <button
      v-if="activeMenu || mobileOpen"
      class="backdrop"
      :class="{ dimmed: mobileOpen }"
      aria-label="Close overlay"
      tabindex="-1"
      @click="closeOverlays"
    ></button>
    <main id="top">
      <section class="hero" aria-label="Featured stories">
        <Swiper
          class="hero-swiper"
          :modules="modules"
          effect="fade"
          :fade-effect="{ crossFade: true }"
          :speed="reducedMotion ? 0 : 650"
          :loop="true"
          :autoplay="
            reducedMotion
              ? false
              : {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          "
          :keyboard="{ enabled: true, onlyInViewport: true }"
          @swiper="hero = $event"
          @slide-change="activeSlide = $event.realIndex"
          @focusin="hero?.autoplay?.pause()"
          @focusout="hero?.autoplay?.resume()"
        >
          <SwiperSlide v-for="(slide, index) in slides" :key="slide.image"
            ><picture class="hero-media"
              ><source
                media="(max-width: 1059px)"
                :srcset="`/assets/${slide.mobile}`" />
              <img
                :src="`/assets/${slide.image}`"
                :alt="slide.title"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
            /></picture>
            <div class="hero-shade"></div>
            <div class="hero-copy" :class="`slide-${index}`">
              <img
                v-if="index === 2"
                class="test-spin-sticker"
                src="/assets/test-spin-sticker.png"
                alt="Test Spin Near You"
              />
              <h1 v-else-if="index === 0">{{ slide.title }}</h1>
              <h2 v-else>{{ slide.title }}</h2>
              <a
                class="pill"
                :class="index === 2 ? 'light' : 'purple'"
                :href="original(slide.href)"
                :tabindex="activeSlide === index ? 0 : -1"
                >{{ slide.action }}</a
              >
            </div></SwiperSlide
          >
        </Swiper>
        <div class="hero-dots" role="group" aria-label="Choose slide">
          <button
            v-for="(_, index) in slides"
            :key="index"
            :class="{ active: index === activeSlide }"
            :aria-label="`Go to slide ${index + 1}`"
            :aria-pressed="index === activeSlide"
            @click="hero?.slideToLoop(index)"
          >
            <span></span>
          </button>
        </div>
      </section>
      <section class="promo-section" aria-label="Explore ALSO">
        <Swiper
          :modules="[A11y]"
          :slides-per-view="1"
          :space-between="16"
          :breakpoints="{ 1060: { slidesPerView: 3 } }"
          class="promo-grid"
          ><SwiperSlide v-for="card in promoCards" :key="card.image"
            ><a class="promo-card" :href="original(card.href)"
              ><img
                :src="`/assets/${card.image}`"
                :alt="card.title || 'Test Spin'"
                loading="lazy"
              />
              <div>
                <h2 v-if="card.title">{{ card.title }}</h2>
                <span class="pill light small">{{ card.action }}</span>
              </div></a
            ></SwiperSlide
          ></Swiper
        >
      </section>
      <section class="social-section" aria-labelledby="social-title">
        <div class="section-head">
          <h2 id="social-title">
            <a href="https://www.instagram.com/ridealso/">@RIDEALSO</a>
          </h2>
          <div class="carousel-controls">
            <button
              aria-label="Previous community video"
              :disabled="carouselEdges.social.start"
              @click="move('social', -1)"
            >
              <ArrowLeft /></button
            ><button
              aria-label="Next community video"
              :disabled="carouselEdges.social.end"
              @click="move('social', 1)"
            >
              <ArrowRight />
            </button>
          </div>
        </div>
        <Swiper
          class="social-track"
          :modules="[A11y, Keyboard]"
          :slides-per-view="1"
          :space-between="16"
          :breakpoints="carouselBreakpoints"
          @swiper="registerCarousel('social', $event)"
          @slide-change="updateCarousel('social', $event)"
          @resize="updateCarousel('social', $event)"
          ><SwiperSlide v-for="(video, index) in social" :key="video.src"
            ><VideoCard v-bind="video" :index="index" /></SwiperSlide
        ></Swiper>
      </section>
      <section class="press-section" aria-labelledby="press-title">
        <div class="section-head">
          <h2 id="press-title">In the Press</h2>
          <div class="carousel-controls">
            <span aria-live="polite"
              >{{ String(pressIndex + 1).padStart(2, "0") }} / 05</span
            ><button
              aria-label="Previous press quote"
              @click="move('press', -1)"
            >
              <ArrowLeft /></button
            ><button aria-label="Next press quote" @click="move('press', 1)">
              <ArrowRight />
            </button>
          </div>
        </div>
        <Swiper
          class="press-track"
          :modules="[A11y]"
          :slides-per-view="1.1"
          :space-between="16"
          :loop="true"
          :breakpoints="{
            768: { slidesPerView: 2.3 },
            1060: { slidesPerView: 3.9 },
          }"
          @swiper="registerCarousel('press', $event)"
          @slide-change="updateCarousel('press', $event)"
          ><SwiperSlide v-for="item in press" :key="item.quote"
            ><article>
              <p>{{ item.quote }}</p>
              <img
                :src="`/assets/${item.logo}`"
                :alt="item.name"
                loading="lazy"
              /></article></SwiperSlide
        ></Swiper>
      </section>
      <section class="quad-section">
        <picture
          ><source
            media="(max-width:1059px)"
            srcset="/assets/quad-mobile.jpg" />
          <img
            src="/assets/quads.webp"
            alt="ALSO TM-Q four-wheel cargo vehicle"
            loading="lazy"
        /></picture>
        <div>
          <h2>TM-Q</h2>
          <p>
            Made to move more. From commercial cargo to precious cargo and bike
            lanes to city streets, the TM-Q takes Transcendent Mobility to four
            wheels.
          </p>
          <a class="pill green" :href="original('/products/quad')">DISCOVER</a>
        </div>
      </section>
      <section class="stories-section" aria-labelledby="stories-title">
        <div class="section-head">
          <h2 id="stories-title">Stories</h2>
          <div class="carousel-controls">
            <button
              aria-label="Previous story"
              :disabled="carouselEdges.stories.start"
              @click="move('stories', -1)"
            >
              <ArrowLeft /></button
            ><button
              aria-label="Next story"
              :disabled="carouselEdges.stories.end"
              @click="move('stories', 1)"
            >
              <ArrowRight />
            </button>
          </div>
        </div>
        <Swiper
          class="stories-track"
          :modules="[A11y]"
          :slides-per-view="1.04"
          :space-between="16"
          :breakpoints="carouselBreakpoints"
          @swiper="registerCarousel('stories', $event)"
          @slide-change="updateCarousel('stories', $event)"
          @resize="updateCarousel('stories', $event)"
          ><SwiperSlide v-for="story in stories" :key="story.slug"
            ><a class="story-card" :href="original(`/blogs/all/${story.slug}`)"
              ><div class="story-image">
                <img
                  :src="`/assets/${story.image}`"
                  :alt="story.title"
                  loading="lazy"
                />
              </div>
              <h3>{{ story.title }}</h3>
              <span class="pill dark small">READ MORE</span></a
            ></SwiperSlide
          ></Swiper
        >
      </section>
    </main>
    <section class="signup">
      <div>
        <h2>Stay in the loop.</h2>
        <p>Join our mailing list.</p>
      </div>
      <NewsletterForm />
    </section>
    <footer id="footer" class="also-footer">
      <NoiseBackdrop />
      <div class="footer-content">
        <div class="footer-columns">
          <div class="footer-products">
            <a :href="original('/products/tm-b')">Bike</a
            ><a :href="original('/products/quad')">Quad</a
            ><a :href="original('/products/helmet')">Helmet</a
            ><a :href="original('/collections/gear')">Gear</a>
          </div>
          <div class="footer-navigation">
            <div>
              <h2>Company</h2>
              <a :href="original('/pages/company')">ABOUT US</a
              ><a :href="original('/blogs/all')">BLOG</a
              ><a href="https://jobs.ashbyhq.com/Ridealso">CAREERS</a>
            </div>
            <div>
              <h2>Resources</h2>
              <a
                v-for="[label, path] in [
                  ['CUSTOMER SUPPORT', 'support'],
                  ['SERVICE', 'service-and-assembly'],
                  ['RETURNS', 'returns'],
                  ['CORPORATE SALES', 'corporate-sales'],
                  ['FINANCING', 'financing'],
                  ['EVO POP-UP', 'partnerships-evo'],
                ]"
                :key="path"
                :href="original(`/pages/${path}`)"
                >{{ label }}</a
              >
            </div>
            <div>
              <h2>Account</h2>
              <a :href="original('/account')">LOG-IN</a
              ><a :href="original('/account?view=orders')">ORDERS</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <nav class="social-links" aria-label="Social media">
            <a
              href="https://www.linkedin.com/company/ridealso"
              aria-label="LinkedIn"
              ><Linkedin /></a
            ><a
              href="https://www.instagram.com/ridealso/"
              aria-label="Instagram"
              ><Instagram /></a
            ><a href="https://www.tiktok.com/@ridealso" aria-label="TikTok"
              ><span class="tiktok-mark" aria-hidden="true"></span></a
            ><a href="https://www.youtube.com/@ride_also" aria-label="YouTube"
              ><Youtube
            /></a>
          </nav>
          <nav class="legal" aria-label="Legal">
            <a href="mailto:media@ridealso.com">MEDIA INQUIRIES</a
            ><a :href="original('/pages/terms')">TERMS</a
            ><a :href="original('/pages/privacy')">PRIVACY</a
            ><a :href="original('/pages/supplier-terms')">SUPPLIER TERMS</a>
          </nav>
        </div>
        <a class="footer-word" href="/" aria-label="ALSO home"></a>
      </div>
    </footer>
  </div>
</template>
