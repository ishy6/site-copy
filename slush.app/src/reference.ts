export interface Snapshot {
  route: string;
  title: string;
  description: string;
  lang: string;
  htmlAttributes: Record<string, string>;
  bodyAttributes: Record<string, string>;
  head: string;
  body: string;
  scripts: { src?: string; text?: string; type?: string }[];
}

interface Manifest {
  pages: Record<string, { file: string; document: string; title: string }>;
}

interface ReferenceWindow extends Window {
  Webflow?: { ready: () => void };
  barba?: { hooks: { after: (callback: () => void) => void; beforeEnter: (callback: (data: { next: { html: string } }) => void) => void } };
  lenis?: { scrollTo: (element: Element) => void };
  preloaderFinished?: boolean;
}

let manifest: Manifest;

export async function loadSnapshot(): Promise<Snapshot | null> {
  const response = await fetch('/reference/manifest.json');
  if (!response.ok) throw new Error('Unable to load the page index.');
  manifest = await response.json();
  const pathname = location.pathname.replace(/\/$/, '') || '/';
  const entry = manifest.pages[pathname];
  if (!entry) return null;
  const page = await fetch(`/reference/${entry.file}`);
  if (!page.ok) throw new Error('Unable to load this page.');
  return page.json();
}

function installLocalNavigation() {
  // Barba requests complete documents; its local snapshots contain the original containers.
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
    const target = new URL(String(url), location.href);
    const entry = manifest.pages[target.pathname.replace(/\/$/, '') || '/'];
    const local = target.origin === location.origin && method.toUpperCase() === 'GET' && entry;
    originalOpen.call(this, method, local ? entry.document : url, async, username, password);
  } as typeof XMLHttpRequest.prototype.open;
  document.addEventListener('click', event => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link) return;
    const target = new URL(link.href, location.href);
    // Card has its own source lifecycle and uses a complete document navigation.
    if (target.origin === location.origin && (target.pathname === '/card' || location.pathname.startsWith('/card'))) link.dataset.barbaPrevent = 'self';
  }, true);
}

function installForms() {
  document.addEventListener('submit', event => {
    const form = event.target as HTMLFormElement;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    let status = form.querySelector<HTMLParagraphElement>('.local-form-status');
    if (!status) { status = document.createElement('p'); status.className = 'local-form-status'; status.setAttribute('role', 'status'); form.append(status); }
    status.replaceChildren(document.createTextNode('No email has been sent. Subscribe on '));
    const link = document.createElement('a');
    link.href = 'https://slush.app/#newsletter-mc'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'slush.app'; status.append(link, '.');
  }, true);
  document.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('#submit-static-form, #submit-mc-form');
    if (!button) return;
    event.preventDefault();
    button.closest('form')?.requestSubmit();
  });
}

function enhanceControls() {
  const menu = document.querySelector<HTMLElement>('#menuButton');
  menu?.setAttribute('aria-label', 'Toggle navigation');
  const firstItem = document.querySelector<HTMLElement>('.nav-inner-li');
  const updateMenu = () => {
    const rect = firstItem?.getBoundingClientRect();
    const expanded = !!rect && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0;
    menu?.setAttribute('aria-expanded', String(expanded));
  };
  if (menu) new MutationObserver(updateMenu).observe(menu, { attributes: true, attributeFilter: ['style'] });
  if (firstItem) new MutationObserver(updateMenu).observe(firstItem, { attributes: true, attributeFilter: ['style'] });
  const navContainer = document.querySelector('#navContainer');
  if (navContainer) new MutationObserver(updateMenu).observe(navContainer, { attributes: true, attributeFilter: ['style'] });
  updateMenu();
  document.querySelector<HTMLAnchorElement>('a.nav-btn-circle.is--nav-logo')?.setAttribute('aria-label', 'Slush home');
  document.querySelectorAll<HTMLElement>('[data-centered-slider="bullet"]').forEach((button, index) => button.setAttribute('aria-label', `Show slide ${index + 1}`));
  document.querySelectorAll<HTMLElement>('[data-slideshow="button-prev"], [data-centered-slider="prev-button"]').forEach(button => button.setAttribute('aria-label', 'Previous slide'));
  document.querySelectorAll<HTMLElement>('[data-slideshow="button-next"], [data-centered-slider="next-button"]').forEach(button => button.setAttribute('aria-label', 'Next slide'));
  document.querySelectorAll<HTMLElement>('[data-tabs="content-item"]').forEach(button => {
    const update = () => button.setAttribute('aria-selected', String(button.classList.contains('active')));
    new MutationObserver(update).observe(button, { attributes: true, attributeFilter: ['class'] });
    update();
  });
  document.querySelectorAll<HTMLElement>('[data-current-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll<HTMLElement>('form input[type="submit"]').forEach(element => element.setAttribute('aria-label', 'Subscribe'));
  document.querySelectorAll<HTMLElement>('#newsletter-mc input[type="radio"]').forEach(element => element.setAttribute('aria-label', 'I agree to receive communications from Mysten Labs.'));
}

function initializeCard() {
  const runtime = window as ReferenceWindow;
  runtime.preloaderFinished = true;
  const input = document.querySelector<HTMLInputElement>('#email-input');
  const button = document.querySelector<HTMLButtonElement>('#send-otp-btn');
  if (!input || !button) return;
  input.type = 'email'; input.required = true; input.setAttribute('aria-label', 'Email address');
  input.addEventListener('input', () => button.classList.toggle('is-active', input.validity.valid));
  const submit = () => {
    if (!input.reportValidity()) return;
    const status = document.querySelector<HTMLElement>('#email-error');
    if (status) {
      status.classList.add('local-form-status', 'local-card-status');
      status.setAttribute('role', 'status');
      status.replaceChildren(document.createTextNode('Continue on the official Slush Card site to join the waitlist. '));
      const link = document.createElement('a'); link.href = 'https://slush.app/card'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Open Slush Card'; status.append(link);
    }
  };
  button.addEventListener('click', submit);
  input.addEventListener('keydown', event => { if (event.key === 'Enter') submit(); });
}

export async function initializeReference(snapshot: Snapshot) {
  const runtime = window as ReferenceWindow;
  for (const [name, value] of Object.entries(snapshot.htmlAttributes)) document.documentElement.setAttribute(name, value);
  for (const [name, value] of Object.entries(snapshot.bodyAttributes)) document.body.setAttribute(name, value);
  document.documentElement.classList.add('w-mod-js');
  if ('ontouchstart' in window) document.documentElement.classList.add('w-mod-touch');
  document.title = snapshot.title;
  document.documentElement.lang = snapshot.lang;
  document.querySelector('meta[name="description"]')?.setAttribute('content', snapshot.description);
  const head = new DOMParser().parseFromString(snapshot.head, 'text/html');
  const styles: Promise<void>[] = [];
  head.head.querySelectorAll('style, link[rel="stylesheet"], link[rel="shortcut icon"]').forEach(element => {
    const clone = document.importNode(element, true);
    if (clone instanceof HTMLLinkElement && clone.rel === 'stylesheet') styles.push(new Promise((resolve, reject) => { clone.onload = () => resolve(); clone.onerror = () => reject(new Error('Unable to load page styles.')); }));
    document.head.append(clone);
  });
  await Promise.all(styles);
  await document.fonts.ready;
  installLocalNavigation();
  installForms();
  for (const entry of snapshot.scripts) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      if (entry.type) script.type = entry.type;
      if (entry.src) {
        script.src = entry.src; script.onload = () => resolve(); script.onerror = () => reject(new Error(`Unable to load page interactions: ${entry.src}`));
      } else script.textContent = entry.text || '';
      document.body.append(script);
      if (!entry.src) resolve();
    });
  }
  document.dispatchEvent(new Event('DOMContentLoaded'));
  runtime.Webflow?.ready();
  enhanceControls();
  runtime.barba?.hooks.after(enhanceControls);
  runtime.barba?.hooks.beforeEnter(data => {
    const next = new DOMParser().parseFromString(data.next.html, 'text/html');
    document.documentElement.lang = next.documentElement.lang;
    const pageId = next.documentElement.getAttribute('data-wf-page');
    if (pageId) document.documentElement.setAttribute('data-wf-page', pageId);
    document.querySelector('meta[name="description"]')?.setAttribute('content', next.querySelector('meta[name="description"]')?.getAttribute('content') || '');
  });
  if (snapshot.route === '/card') initializeCard();
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const menu = document.querySelector<HTMLButtonElement>('#menuButton[aria-expanded="true"]');
      menu?.click(); menu?.focus();
    }
  });
}
