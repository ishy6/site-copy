<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Splide from '@splidejs/splide';
import CheckoutView from './components/CheckoutView.vue';
import { createReferenceLoader } from './live-reference';
import { collectionHtml, escapeHtml, money, pictureHtml, productHtml, titleFor, type Catalog, type CatalogProduct, type CartLine, type Product, type Snapshot } from './reference';

const shell = ref('');
const ready = ref(false);
const snapshot = ref<Snapshot | null>(null);
const route = ref(window.location.pathname.replace(/\/$/, '') || '/');
const selectedVariant = ref<number | null>(null);
const panel = ref<'shop' | 'info' | 'mobile' | 'cart' | null>(null);
const newsletter = ref(false);
const notice = ref(false);
const search = ref('');
const loading = ref(false);
const failure = ref('');
const cart = ref<CartLine[]>([]);
let routes: Record<string, string> = {};
let catalogs: Record<string, Catalog> = {};
let searchFixtures: Record<string, Catalog> = {};
let products: Record<string, Product> = {};
let index: CatalogProduct[] = [];
const snapshots = new Map<string, Snapshot>();
let navigationId = 0;
let newsletterTimer: ReturnType<typeof setTimeout>;
let searchTimer: ReturnType<typeof setTimeout>;
let restoreFocus: HTMLElement | null = null;
let sliders: Splide[] = [];
let referenceLoader: ReturnType<typeof createReferenceLoader>;
let searchController: AbortController | undefined;

const product = computed(() => products[route.value]);
const totalCount = computed(() => cart.value.reduce((sum, line) => sum + line.quantity, 0));
const cartTotal = computed(() => cart.value.reduce((sum, line) => sum + (products[line.url]?.variantData.find(v => v.id === line.variantId)?.salePrice || 0) * line.quantity, 0));
const pageHtml = computed(() => {
  if (!snapshot.value) return '';
  if (catalogs[route.value]) return collectionHtml(catalogs[route.value]);
  if (product.value) return productHtml(snapshot.value, product.value, products, selectedVariant.value);
  return snapshot.value.html;
});
const byId = (id: string) => document.getElementById(id);
function setPanel(value: typeof panel.value) { restoreFocus = document.activeElement as HTMLElement; panel.value = panel.value === value ? null : value; }
function closePanel() { panel.value = null; restoreFocus?.focus(); }
function syncPanels() {
  byId('desktop.drawer')?.classList.toggle('active', panel.value === 'shop' || panel.value === 'info');
  byId('desktop.drawer')?.classList.toggle('usable', panel.value === 'shop' || panel.value === 'info');
  document.querySelector('.shop-navigation')?.classList.toggle('active', panel.value === 'shop');
  document.querySelector('.info-navigation')?.classList.toggle('active', panel.value === 'info');
  byId('mm.mobile.drawer')?.classList.toggle('active', panel.value === 'mobile');
  byId('desktop_nav_overlay')?.classList.toggle('active', Boolean(panel.value));
  byId('minicart-drawer')?.classList.toggle('open', panel.value === 'cart');
  document.querySelectorAll<HTMLElement>('.desktop-drawer-open').forEach(el => el.setAttribute('aria-expanded', String(panel.value === (el.dataset.navigation_category === 'shop-navigation' ? 'shop' : 'info'))));
  byId('mm.menu.item')?.setAttribute('aria-expanded', String(panel.value === 'mobile'));
  for (const [id, open, label] of [['desktop.drawer', panel.value === 'shop' || panel.value === 'info', 'Navigation'], ['mm.mobile.drawer', panel.value === 'mobile', 'Navigation'], ['minicart-drawer', panel.value === 'cart', 'Shopping cart']] as const) {
    const element = byId(id);
    if (element) { element.inert = !open; element.setAttribute('role', 'dialog'); element.setAttribute('aria-modal', 'true'); element.setAttribute('aria-label', label); }
  }
}
watch(panel, syncPanels);
watch([newsletter, notice], () => {
  byId('newsletter.signup')?.classList.toggle('active', newsletter.value);
  byId('newsletter.signup')?.classList.toggle('showing-notification', notice.value);
  byId('sitewide.notification')?.classList.toggle('active', notice.value);
  byId('copyright.siteby')?.classList.toggle('showing-notification', notice.value);
  if (byId('newsletter.signup')) byId('newsletter.signup')!.inert = !newsletter.value;
  if (byId('sitewide.notification')) byId('sitewide.notification')!.inert = !notice.value;
});
watch(cart, () => { localStorage.setItem('makr-cart-v2', JSON.stringify(cart.value)); renderCart(); }, { deep: true });
function rememberPopup(key: string) { localStorage.setItem(key, String(Date.now() + 90 * 24 * 60 * 60 * 1000)); }
function popupShouldOpen(key: string) { const expires = localStorage.getItem(key); return !expires || (expires !== '1' && Number(expires) < Date.now()); }
function dismissNewsletter() { newsletter.value = false; rememberPopup('makr-newsletter-dismissed'); }
function dismissNotice() { notice.value = false; rememberPopup('makr-notice-dismissed'); }
async function navigate(path: string, push = true) {
  const url = new URL(path, window.location.origin);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  if (pathname === '/checkout') {
    panel.value = null; search.value = ''; clearSearch();
    sliders.forEach(slider => slider.destroy()); sliders = [];
    route.value = '/checkout'; snapshot.value = { title: 'Checkout - MAKR', bodyClass: 'checkout', bodyStyle: 'background:#fff', html: '', products: [] };
    document.body.className = 'checkout'; document.body.style.background = '#fff'; document.title = 'Checkout - MAKR';
    if (push) history.pushState({}, '', '/checkout');
    await nextTick(); window.scrollTo({ top: 0, behavior: 'instant' }); return;
  }
  const resource = routes[pathname];
  const requestId = ++navigationId;
  loading.value = true; failure.value = ''; panel.value = null; search.value = ''; clearSearch();
  try {
    let page = snapshots.get(pathname);
    if (!page) {
      if (resource) {
        const response = await fetch(resource);
        if (!response.ok) throw new Error('Unable to load this page. Please try again.');
        page = await response.json() as Snapshot;
      } else {
        const live = await referenceLoader.load(pathname);
        page = live.snapshot;
        live.products.forEach(product => products[product.url] = product);
        if (live.catalog) catalogs[pathname] = live.catalog;
      }
      snapshots.set(pathname, page);
    }
    if (requestId !== navigationId) return;
    sliders.forEach(slider => slider.destroy()); sliders = [];
    route.value = pathname; snapshot.value = page;
    selectedVariant.value = products[pathname]?.variantData.length === 1 ? products[pathname].variantData[0].id : null;
    document.body.className = page.bodyClass; document.body.style.cssText = page.bodyStyle;
    document.title = products[pathname] ? `${titleFor(products[pathname])} - MAKR` : page.title;
    if (push) history.pushState({}, '', `${pathname}${url.search}${url.hash}`);
    await nextTick();
    window.scrollTo({ top: 0, behavior: 'instant' });
    const target = url.hash.slice(1) || url.searchParams.get('collection')?.replaceAll('-', '_');
    if (target) byId(target)?.scrollIntoView();
    enhanceControls();
    sliders = [...document.querySelectorAll<HTMLElement>('#main_content .splide')].map(element => new Splide(element, { classes: { pagination: 'splide__pagination sb_slider_pagination', page: 'splide__pagination__page sb_slider_pager' }, type: 'fade', lazyLoad: 'nearby' }).mount());
  } catch (error) { failure.value = error instanceof Error ? error.message : 'Unable to load this page.'; }
  finally { if (requestId === navigationId) loading.value = false; }
}
function clearSearch() {
  document.querySelectorAll<HTMLInputElement>('.search_term').forEach(input => input.value = '');
  const results = byId('searchResultCollection');
  if (results) { results.classList.add('initial'); results.innerHTML = ''; }
}
function performSearch(query: string) {
  searchController?.abort();
  search.value = query;
  const target = byId('searchResultCollection');
  if (!target) return;
  if (query.trim().length < 3) { target.classList.add('initial'); target.innerHTML = ''; return; }
  const terms = query.toLowerCase().trim().split(/\s+/);
  const found = index.filter(item => terms.every(term => `${item.title} ${item.url}`.toLowerCase().includes(term)));
  const catalog: Catalog = searchFixtures[query.trim().toLowerCase()] || [{ collection_title: 'Search Results', collection_data: [{ subcategory_slug: 'search-results', subcategory_title: `${found.length} results for ${query}`, subcategory_summary: '', subcategory_featured_image: '', subcategory_video: '', subcategory_video_padding: '', subcategory_products: found }] }];
  const parsed = new DOMParser().parseFromString(collectionHtml(catalog, 'searchResultCollection'), 'text/html');
  target.innerHTML = parsed.body.firstElementChild!.innerHTML; target.classList.remove('initial'); panel.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!searchFixtures[query.trim().toLowerCase()]) {
    searchController = new AbortController();
    const controller = searchController;
    referenceLoader.search(query, controller.signal).then(catalog => {
      if (controller.signal.aborted || search.value !== query) return;
      searchFixtures[query.trim().toLowerCase()] = catalog;
      const parsed = new DOMParser().parseFromString(collectionHtml(catalog), 'text/html');
      target.innerHTML = parsed.body.firstElementChild?.innerHTML || '';
    }).catch(() => {});
  }
}
function renderCart() {
  const drawer = byId('minicart-drawer');
  if (!drawer) return;
  document.querySelectorAll('.cart-count').forEach(element => element.textContent = String(totalCount.value));
  byId('minicart.drawer.count')!.textContent = String(totalCount.value);
  const contents = drawer.querySelector('.drawer-contents')!;
  contents.innerHTML = cart.value.length ? cart.value.map(line => {
    const p = products[line.url];
    const variant = p.variantData.find(v => v.id === line.variantId)!;
    return `<div class="minicart-item"><div class="image"><div class="product-image"><a href="${escapeHtml(line.url)}">${pictureHtml(p.productImages[0]?.url || '', titleFor(p))}</a></div></div><div class="meta"><a class="title" href="${escapeHtml(line.url)}"><span class="segment-one">${escapeHtml(p.titleOne)}</span><span class="segment-two">${escapeHtml(p.titleTwo)}</span></a><div class="finish">${escapeHtml(p.finish)}</div><div class="variant">${escapeHtml(variant.shortTitle || '')}</div></div><div class="quantity"><button type="button" class="minicart-quantity-adjust" data-adjust="${line.variantId}" data-step="-1" aria-label="Decrease quantity">−</button><input class="minicart-quantity-input" type="number" min="0" max="99" value="${line.quantity}" data-quantity="${line.variantId}" aria-label="Quantity"><button type="button" class="minicart-quantity-adjust" data-adjust="${line.variantId}" data-step="1" aria-label="Increase quantity">+</button></div><div class="total">${money(variant.salePrice * line.quantity)}</div></div>`;
  }).join('') : '<div class="minicart-row cart-empty">Your cart is empty.</div>';
  drawer.querySelector('.drawer-controls')!.innerHTML = cart.value.length ? `<div class="total-and-checkout"><div class="cart-total"><h4>Total<span class="item-total">$${cartTotal.value.toFixed(2)}</span></h4></div><a class="add-to-cart checkout" href="/checkout">Checkout</a></div>` : '';
}
function addToCart() {
  const p = product.value;
  if (!p) return;
  if (!selectedVariant.value) { byId('mcs.item.wrapper')?.classList.add('active'); byId('mcs.item.base')?.focus(); return; }
  const variant = p.variantData.find(item => item.id === selectedVariant.value);
  if (!variant?.isAvailable) return;
  const line = cart.value.find(item => item.variantId === variant.id);
  if (line) line.quantity = Math.min(99, line.quantity + 1);
  else cart.value.push({ url: route.value, variantId: variant.id, quantity: 1 });
  panel.value = 'cart';
}
function showFormFeedback(form: HTMLFormElement, text: string) {
  let message = form.querySelector<HTMLElement>('.local-form-feedback');
  if (!message) { message = document.createElement('p'); message.className = 'local-form-feedback'; message.setAttribute('role', 'status'); form.append(message); }
  message.textContent = text;
}
function onSubmit(event: SubmitEvent) {
  const form = event.target as HTMLFormElement;
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (form.id === 'product.add.to.cart.form') return addToCart();
  if (form.id === 'minicart.update.form') return;
  if (form.id === 'sib-form') return showFormFeedback(form, 'Email validated. Subscription is available on makr.com.');
  if (form.id === 'product.oos.registration.form') return showFormFeedback(form, 'Email validated. Stock notifications are available on makr.com.');
  showFormFeedback(form, 'Account services are available on makr.com.');
}
function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const nav = target.closest<HTMLElement>('.desktop-drawer-open');
  if (nav) { event.preventDefault(); setPanel(nav.dataset.navigation_category === 'shop-navigation' ? 'shop' : 'info'); return; }
  if (target.closest('[id="mm.menu.item"]')) { setPanel('mobile'); return; }
  if (target.closest('.minicart-open')) { setPanel('cart'); return; }
  if (target.closest('#desktop_nav_overlay')) { closePanel(); return; }
  if (target.closest('[id="close.newsletter"]')) { dismissNewsletter(); return; }
  if (target.closest('[id="close.notification"]')) { dismissNotice(); return; }
  if (target.closest('.newsletter-open-handle, .sitewide-notification .message')) { newsletter.value = true; return; }
  if (target.closest('[id="mcs.item.base"]')) { byId('mcs.item.wrapper')?.classList.toggle('active'); return; }
  const option = target.closest<HTMLElement>('[data-variant-id]');
  if (option) { selectedVariant.value = Number(option.dataset.variantId); return; }
  byId('mcs.item.wrapper')?.classList.remove('active');
  const adjust = target.closest<HTMLElement>('[data-adjust]');
  if (adjust) { const line = cart.value.find(item => item.variantId === Number(adjust.dataset.adjust)); if (line) { line.quantity = Math.max(0, Math.min(99, line.quantity + Number(adjust.dataset.step))); if (!line.quantity) cart.value = cart.value.filter(item => item !== line); } return; }
  const remove = target.closest<HTMLElement>('[data-remove]');
  if (remove) { cart.value = cart.value.filter(line => line.variantId !== Number(remove.dataset.remove)); return; }
  const anchor = target.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target === '_blank') return;
  const url = new URL(anchor.href);
  if (url.origin === window.location.origin || url.hostname === 'makr.com') {
    if (url.hash && url.pathname === route.value && !url.search) return;
    event.preventDefault(); void navigate(`${url.pathname}${url.search}${url.hash}`);
  }
}
function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.matches('.search_term')) { clearTimeout(searchTimer); searchTimer = setTimeout(() => performSearch(input.value), 200); }
}
function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.dataset.quantity) {
    const line = cart.value.find(item => item.variantId === Number(input.dataset.quantity));
    if (line) { line.quantity = Math.max(0, Math.min(99, Math.trunc(Number(input.value) || 0))); if (!line.quantity) cart.value = cart.value.filter(item => item !== line); }
    renderCart();
  }
}
function onHover(event: MouseEvent | FocusEvent) {
  const item = (event.target as HTMLElement).closest<HTMLElement>('.nav-drawer-item');
  if (item) document.querySelectorAll<HTMLElement>('.desktop-navigation-hover-item').forEach(image => image.classList.toggle('active', image.classList.contains(item.dataset.anchor || 'none')));
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') { if (panel.value) closePanel(); else if (search.value) { search.value = ''; clearSearch(); } else if (newsletter.value) dismissNewsletter(); }
  if ((event.key === 'Enter' || event.key === ' ') && (event.target as HTMLElement).matches('[role=button], [role=option]')) { event.preventDefault(); (event.target as HTMLElement).click(); }
  if (event.key === 'Tab' && panel.value) {
    const container = panel.value === 'cart' ? byId('minicart-drawer') : panel.value === 'mobile' ? byId('mm.mobile.drawer') : document.querySelector(`.${panel.value}-navigation`);
    const controls = [...container?.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex="0"]') || []].filter(element => element.getBoundingClientRect().width && !element.hasAttribute('disabled'));
    const first = controls[0]; const last = controls.at(-1);
    if (first && ((!event.shiftKey && document.activeElement === last) || !container?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    else if (last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  }
}
function enhanceControls() {
  document.querySelectorAll<HTMLElement>('.minicart-open, [id="mm.menu.item"], .closer, .newsletter-open-handle').forEach(element => { element.setAttribute('role', 'button'); element.tabIndex = 0; });
  byId('mm.menu.item')?.setAttribute('aria-label', 'Open menu'); byId('close.newsletter')?.setAttribute('aria-label', 'Close newsletter'); byId('close.notification')?.setAttribute('aria-label', 'Close notification');
  document.querySelectorAll<HTMLInputElement>('.search_term').forEach(input => input.setAttribute('aria-label', 'Search products'));
  document.querySelectorAll<HTMLImageElement>('#main_content img').forEach((image, i) => { if (i < 2) { image.loading = 'eager'; image.fetchPriority = 'high'; } });
}
function onPopState() { void navigate(window.location.pathname + window.location.search + window.location.hash, false); }
onMounted(async () => {
  try {
    const responses = await Promise.all(['/reference/shell.html', '/reference/routes.json', '/reference/catalogs.json', '/reference/products.json', '/reference/search.json', '/reference/media-map.json'].map(url => fetch(url)));
    shell.value = await responses[0].text(); routes = await responses[1].json(); catalogs = await responses[2].json(); products = await responses[3].json(); searchFixtures = await responses[4].json();
    referenceLoader = createReferenceLoader(await responses[5].json());
    index = searchFixtures['*']?.flatMap(d => d.collection_data.flatMap(g => g.subcategory_products)) || [...new Map(Object.values(catalogs).flatMap(c => c.flatMap(d => d.collection_data.flatMap(g => g.subcategory_products))).map(p => [p.url, p])).values()];
    try { cart.value = JSON.parse(localStorage.getItem('makr-cart-v2') || '[]').filter((line: CartLine) => products[line.url]?.variantData.some(v => v.id === line.variantId) && Number.isInteger(line.quantity) && line.quantity > 0); } catch { cart.value = []; }
    await nextTick(); ready.value = true; await nextTick(); document.body.id = 'main.body';
    document.addEventListener('click', onClick); document.addEventListener('submit', onSubmit); document.addEventListener('input', onInput); document.addEventListener('change', onChange); document.addEventListener('mouseover', onHover); document.addEventListener('focusin', onHover); document.addEventListener('keydown', onKey); window.addEventListener('popstate', onPopState);
    await navigate(window.location.pathname + window.location.search + window.location.hash, false);
    renderCart(); syncPanels(); enhanceControls();
    newsletterTimer = setTimeout(() => {
      newsletter.value = popupShouldOpen('makr-newsletter-dismissed'); notice.value = popupShouldOpen('makr-notice-dismissed');
      if (newsletter.value) rememberPopup('makr-newsletter-dismissed');
      if (notice.value) rememberPopup('makr-notice-dismissed');
    }, 2000);
  } catch { failure.value = 'Unable to load the store. Please refresh to try again.'; }
});
onBeforeUnmount(() => { sliders.forEach(slider => slider.destroy()); clearTimeout(newsletterTimer); clearTimeout(searchTimer); document.removeEventListener('click', onClick); document.removeEventListener('submit', onSubmit); document.removeEventListener('input', onInput); document.removeEventListener('change', onChange); document.removeEventListener('mouseover', onHover); document.removeEventListener('focusin', onHover); document.removeEventListener('keydown', onKey); window.removeEventListener('popstate', onPopState); });
</script>

<template>
  <div v-html="shell"></div>
  <Teleport v-if="ready" to="#main_content">
    <CheckoutView v-if="route === '/checkout'" :cart="cart" :products="products" />
    <div :class="{ 'route-loading': loading }" v-html="pageHtml"></div>
    <div v-if="failure" class="route-error" role="alert">{{ failure }} <button @click="navigate(route, false)">Try again</button></div>
  </Teleport>
  <div v-if="!ready && failure" class="route-error" role="alert">{{ failure }}</div>
</template>
