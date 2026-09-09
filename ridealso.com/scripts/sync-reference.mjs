import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://ridealso.com';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public/reference');
const assets = new Map();
const pages = new Map();
const queue = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const requested = new Set(queue);
const crawl = process.env.CRAWL === '1';
await mkdir(path.join(out, 'assets'), { recursive: true });

async function request(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(40000) });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return response;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

function absolute(value) {
  if (!value || /^(data:|blob:|#|mailto:|tel:)/.test(value)) return value;
  return new URL(value, origin).href;
}

function asset(value) {
  const url = absolute(value);
  if (!url || !/https?:/.test(url)) return value;
  const parsed = new URL(url);
  if (!/\.(?:css|js|woff2?|ttf|otf)(?:$|\?)/i.test(url)) return url;
  if (!assets.has(url)) {
    const name = createHash('sha256').update(url).digest('hex').slice(0, 16) + path.extname(parsed.pathname);
    assets.set(url, `/reference/assets/${name}`);
  }
  return assets.get(url);
}

function replaceUrls(text) {
  return text.replace(/(?:https?:)?\/\/(?:ridealso\.com|cdn\.shopify\.com)\/[^\s"'<>\\)]+/g, value => asset(value));
}

async function page(route) {
  const response = await request(origin + route);
  const html = await response.text();
  const $ = load(html);
  $('script').each((_, element) => {
    const tag = $(element);
    const src = tag.attr('src');
    const type = tag.attr('type') || '';
    const code = tag.html() || '';
    if (src) {
      if (!src.includes('/cdn/shop/t/')) tag.remove();
      else tag.attr('src', asset(src)).removeAttr('integrity crossorigin');
    } else if (type && !['module', 'text/javascript', 'application/javascript'].includes(type)) {
      if (type === 'speculationrules' || /^(apple-pay|shopify-features|shop-js)/.test(tag.attr('id') || '')) tag.remove();
    } else if (/pandect|klaviyo|clarity|monorail|trekkie|wpmLoader|ShopifyAnalytics|shopifycloud|shopify\.content_for_header|captcha|elevar|ShopifyPay|__st=|WebPixels|Shopify\.MCP|rpq99qhx|webmcp|PaymentButton/i.test(code)) {
      if (code.trim().startsWith('var Shopify = Shopify || {}')) {
        tag.html('window.Shopify = {routes:{root:"/"},locale:"en",country:"US",currency:{active:"USD"},theme:{id:158376952032}};');
      } else tag.remove();
    }
  });
  $('link').each((_, element) => {
    const tag = $(element);
    const href = tag.attr('href');
    if (!href) return;
    if (/preconnect|dns-prefetch/.test(tag.attr('rel') || '') || href.includes('shopifycloud')) tag.remove();
    else if (tag.attr('rel') !== 'canonical') tag.attr('href', asset(href));
  });
  $('a[href]').each((_, element) => {
    const tag = $(element);
    const href = tag.attr('href');
    if (!href || /^(#|mailto:|tel:|javascript:)/.test(href)) return;
    const url = new URL(href, origin);
    if (url.origin !== origin) return;
    tag.attr('href', url.pathname + url.search + url.hash);
    if (crawl && /^\/(products|collections|pages|blogs)\//.test(url.pathname) && !/\.(pdf|jpg|png)$/.test(url.pathname) && !requested.has(url.pathname)) {
      requested.add(url.pathname);
      queue.push(url.pathname);
    }
  });
  $('[src], [poster], [data-src]').each((_, element) => {
    const tag = $(element);
    for (const name of ['src', 'poster', 'data-src']) {
      const value = tag.attr(name);
      if (value && !value.startsWith('/reference/')) tag.attr(name, asset(value));
    }
  });
  $('[srcset]').each((_, element) => {
    const tag = $(element);
    tag.attr('srcset', (tag.attr('srcset') || '').split(',').map(value => {
      const [url, ...descriptor] = value.trim().split(/\s+/);
      return [absolute(url), ...descriptor].join(' ');
    }).join(', '));
  });
  $('[style]').each((_, element) => {
    const tag = $(element);
    tag.attr('style', replaceUrls(tag.attr('style') || ''));
  });
  $('style').each((_, element) => $(element).html(replaceUrls($(element).html() || '')));
  const routeUrl = new URL(route, origin);
  const view = routeUrl.searchParams.get('view');
  const pageNumber = routeUrl.searchParams.get('page');
  const routeKey = routeUrl.pathname + (view ? `?view=${view}` : pageNumber ? `?page=${pageNumber}` : '');
  const partial = ['quick-add', 'upsell-quick-add', 'notify-me', 'tile'].includes(view);
  $('html').attr('data-reference-route', routeKey);
  if (!partial) $('head').prepend('<script src="/reference/routes.js"></script><script src="/reference/local-adapter.js"></script><script defer src="/reference/support-adapter.js"></script><link rel="stylesheet" href="/reference/local-adapter.css">');
  const filename = route === '/' ? 'index.html' : `${routeUrl.pathname.replace(/^\//, '').replaceAll('/', '__')}${view ? `--${view}` : pageNumber ? `--page-${pageNumber}` : ''}.html`;
  await writeFile(path.join(out, filename), $.html());
  const record = { route: routeKey, file: filename, title: $('title').text(), source: response.url, partial };
  pages.set(routeKey, record);
  console.log(`Page ${pages.size}: ${route}`);
}

for (let cursor = 0; cursor < queue.length && cursor < 100; cursor++) {
  try { await page(queue[cursor]); } catch (error) { console.error(String(error)); }
}
const downloaded = new Set();
while (downloaded.size < assets.size) {
  const batch = [...assets.entries()].filter(([url]) => !downloaded.has(url)).slice(0, 12);
  await Promise.allSettled(batch.map(async ([url, local]) => {
    downloaded.add(url);
    const file = path.join(root, 'public', local);
    try {
      try { await readFile(file); return; } catch {}
      const response = await request(url);
      if (/\.(css|js)$/.test(local)) {
        let text = await response.text();
        if (local.endsWith('.css')) text = replaceUrls(text).replace(/url\((['"]?)(\.\.?\/[^)'"\s]+)\1\)/g, (_, quote, relative) => `url(${quote}${asset(new URL(relative, url).href)}${quote})`);
        await writeFile(file, text);
      } else await writeFile(file, Buffer.from(await response.arrayBuffer()));
    } catch (error) { console.error(`Asset: ${String(error)}`); }
  }));
  console.log(`Assets: ${downloaded.size}/${assets.size}`);
}
let previous = { pages: [] };
try { previous = JSON.parse(await readFile(path.join(out, 'manifest.json'), 'utf8')); } catch {}
for (const previousPage of previous.pages) if (!pages.has(previousPage.route)) pages.set(previousPage.route, previousPage);
await writeFile(path.join(out, 'manifest.json'), JSON.stringify({ source: origin, capturedAt: new Date().toISOString(), pages: [...pages.values()], assets: { ...previous.assets, ...Object.fromEntries(assets) } }, null, 2));
await writeFile(path.join(out, 'routes.js'), `window.__alsoReferenceRoutes = ${JSON.stringify(Object.fromEntries([...pages.values()].map(entry => [entry.route, { file: entry.file, partial: !!entry.partial }])))};`);
