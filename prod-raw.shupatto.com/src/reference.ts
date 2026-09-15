export interface Snapshot {
  route: string;
  title: string;
  description: string;
  lang: string;
  name: string;
  htmlClass: string;
  bodyClass: string;
  body: string;
  config: string;
  scripts: string[];
  fontStyles?: string;
}

interface ReferenceWindow extends Window {
  INIT_VH?: () => void;
  FONTPLUS?: { isloading: () => boolean };
}

export async function loadSnapshot(): Promise<Snapshot | null> {
  const response = await fetch('/reference/manifest.json');
  if (!response.ok) throw new Error('Unable to load the page.');
  const manifest = await response.json();
  const pathname = location.pathname.replace(/\/?$/, '/');
  const route = manifest.pages[pathname];
  if (!route) return null;
  const page = await fetch(`/reference/${route.file}`);
  if (!page.ok) throw new Error('Unable to load the page.');
  return page.json();
}

export async function initializeReference(snapshot: Snapshot) {
  const runtime = window as ReferenceWindow;
  document.title = snapshot.title;
  document.documentElement.lang = snapshot.lang;
  document.documentElement.className = snapshot.htmlClass;
  document.documentElement.dataset.name = snapshot.name;
  document.body.className = snapshot.bodyClass;
  document.querySelector('meta[name="description"]')?.setAttribute('content', snapshot.description);
  const configuration = document.createElement('script');
  configuration.textContent = snapshot.config;
  document.head.append(configuration);
  configuration.remove();

  if (snapshot.fontStyles) {
    await new Promise<void>((resolve, reject) => {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = snapshot.fontStyles!;
      stylesheet.onload = () => resolve();
      stylesheet.onerror = () => reject(new Error('Unable to load the page fonts.'));
      document.head.append(stylesheet);
    });
    await document.fonts.ready;
  }
  // Fonts are cached per page; the source lifecycle can initialize locally.
  runtime.FONTPLUS = { isloading: () => false };
  for (const src of snapshot.scripts) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load the page.'));
      document.body.append(script);
    });
    if (src.endsWith('/head.js')) runtime.INIT_VH?.();
  }
  installAccessibilityAttributes();
}

function installAccessibilityAttributes() {
  const menu = document.querySelector<HTMLButtonElement>('.c_ham');
  const modal = document.querySelector<HTMLElement>('.js_menu');
  const sound = document.querySelector<HTMLButtonElement>('.js_home_sound');
  menu?.setAttribute('aria-label', 'Menu');
  sound?.setAttribute('aria-label', 'Toggle sound');
  const update = () => {
    const opened = document.documentElement.classList.contains('is_modalShow');
    menu?.setAttribute('aria-expanded', String(opened));
    modal?.setAttribute('aria-hidden', String(!opened));
  };
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  update();
}
