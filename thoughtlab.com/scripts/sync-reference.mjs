import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.thoughtlab.com';
const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const reference = path.join(publicDir, 'reference');
const pages = new Map();
const assets = new Map();
const failures = [];
const categories = ['branding-and-print', 'creativity', 'design', 'develop', 'inside-the-lab', 'market', 'slc', 'tech', 'uncategorized', 'websites'];
const queue = ['/', '/projects/', '/about/', '/contact/', '/careers/', '/blog/', '/privacy-policy/', '/thank-you/', ...categories.map(slug => `/category/${slug}/`)];
const queued = new Set(queue);
const pageLimit = Number(process.env.PAGE_LIMIT || 110);
const maxBlogPage = 3;
await mkdir(reference, { recursive: true });
try {
  const previous = JSON.parse(await readFile(path.join(reference, 'manifest.json'), 'utf8'));
  for (const item of previous.assets) assets.set(item.source, item.local);
} catch {}

async function request(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return response;
    } catch (error) { if (attempt === 2) throw error; }
  }
}

function asset(value, base = origin) {
  if (!value || /^(data:|blob:|#|mailto:|tel:|javascript:)/i.test(value)) return value;
  const url = new URL(value, base);
  if (!/https?:/.test(url.protocol)) return value;
  url.hash = '';
  // Keep large media on the origin CDN instead of copying it into the replica.
  if (/\.(?:mp4|webm|mov|m4v|avi)(?:[?#]|$)/i.test(url.href)) return url.href;
  const key = url.href;
  if (assets.has(key)) return assets.get(key);
  let local;
  if (url.hostname === 'unpkg.com' && url.pathname.includes('/benchmarks/')) local = `/reference/benchmarks/${path.basename(url.pathname)}`;
  else if (url.origin === origin) local = decodeURI(url.pathname);
  else local = `/reference/external/${createHash('sha256').update(key).digest('hex').slice(0, 16)}${path.extname(url.pathname) || '.bin'}`;
  assets.set(key, local);
  return local;
}

function urlsInText(text, base = origin) {
  return text.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g, (_, quote, value) => `url(${quote}${asset(value, base)}${quote})`)
    .replace(/https:\/\/www\.thoughtlab\.com\/wp-content\/[^\s"'<>\\)]+/g, value => asset(value, base));
}

function canCrawl(url) {
  if (url.origin !== origin || url.search || path.extname(url.pathname) || /^\/(?:wp-|feed|tag|author)/.test(url.pathname)) return false;
  const pagination = url.pathname.match(/\/page\/(\d+)\//);
  return !pagination || Number(pagination[1]) <= maxBlogPage;
}

async function capture(route) {
  let html;
  const rawFile = path.join(reference, 'raw', route === '/' ? 'index.html' : route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '__') + '.html');
  try { html = await readFile(rawFile, 'utf8'); }
  catch {
    html = await (await request(origin + route)).text();
    await mkdir(path.dirname(rawFile), { recursive: true });
    await writeFile(rawFile, html);
  }
  const $ = load(html);
  $('noscript, iframe[src*="googletagmanager"], script[type="speculationrules"]').remove();
  $('script').each((_, element) => {
    const tag = $(element);
    const src = tag.attr('src');
    if (src) {
      if (src.includes('/themes/thoughtlab/')) tag.attr('src', asset(src)).removeAttr('crossorigin integrity');
      else tag.remove();
    } else if (tag.attr('id') === 'tl-app-js-extra') {
      tag.html('var tlTheme={assetBase:"/wp-content/themes/thoughtlab",ajaxUrl:"/local-api/contact",contactNonce:"local-preview"};');
    } else tag.remove();
  });
  $('link').each((_, element) => {
    const tag = $(element);
    if (/stylesheet|icon|mask-icon|manifest/.test(tag.attr('rel') || '')) tag.attr('href', asset(tag.attr('href')));
    else tag.remove();
  });
  $('a[href]').each((_, element) => {
    const tag = $(element);
    const value = tag.attr('href');
    if (!value || /^(#|mailto:|tel:|javascript:)/.test(value)) return;
    const url = new URL(value, origin + route);
    if (url.origin === origin) {
      if (path.extname(url.pathname)) tag.attr('href', asset(url.href));
      else {
        const normalized = url.pathname.replace(/\/?$/, '/');
        tag.attr('href', normalized + url.search + url.hash);
        if (canCrawl(url) && !queued.has(normalized)) { queued.add(normalized); queue.push(normalized); }
      }
    }
  });
  $('select#categories option[value]').each((_, element) => {
    const option = $(element);
    const url = new URL(option.attr('value'), origin);
    if (url.origin === origin) option.attr('value', url.pathname);
  });
  $('*').each((_, element) => {
    const tag = $(element);
    for (const [name, value] of Object.entries(element.attribs || {})) {
      if (['src', 'poster', 'data-src', 'data-gl-hover-img', 'data-video', 'data-video-src'].includes(name) && value) tag.attr(name, asset(value, origin + route));
      else if (name === 'srcset' || name === 'data-srcset') tag.attr(name, value.split(',').map(part => {
        const [url, ...size] = part.trim().split(/\s+/);
        return [asset(url, origin + route), ...size].join(' ');
      }).join(', '));
      else if (name === 'style') tag.attr(name, urlsInText(value));
      else if (/^data-/.test(name) && /^https:\/\/www\.thoughtlab\.com\/wp-content\//.test(value)) tag.attr(name, asset(value));
    }
  });
  $('style').each((_, el) => $(el).html(urlsInText($(el).html())));
  $('form').attr('action', '/local-api/contact');
  $('html').attr('data-reference-route', route);
  $('head').append('<script type="module" src="/src/main.ts" data-local-entry></script>');
  $('body').append('<div id="local-app"></div>');
  const file = route === '/' ? 'index.html' : route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '__') + '.html';
  await writeFile(path.join(reference, file), $.html());
  pages.set(route, { route, file, title: $('title').text(), source: origin + route });
  console.log(`Page ${pages.size}: ${route}`);
}

for (let cursor = 0; !process.env.ASSETS_ONLY && cursor < queue.length && cursor < pageLimit; cursor += 4) {
  const batch = queue.slice(cursor, Math.min(cursor + 4, pageLimit));
  const results = await Promise.allSettled(batch.map(capture));
  results.forEach((result, i) => { if (result.status === 'rejected') { failures.push({url: queue[cursor + i], error: String(result.reason)}); console.error(String(result.reason)); } });
}

const theme = `${origin}/wp-content/themes/thoughtlab`;
for (const weight of [300, 400, 500, 700]) for (const extension of ['json', 'webp', 'png']) asset(`${theme}/static/fonts/sui-${weight}.${extension}`);
for (const side of ['px','nx','py','ny','pz','nz']) for (const ext of ['webp','png']) asset(`${theme}/static/cubemaps/01/${side}.${ext}`);
for (const n of [1,2,3,4]) for (const ext of ['webp','png']) asset(`${theme}/static/numbers/${n}-light.${ext}`);
for (const name of ['d-adreno','d-amd','d-apple','d-geforce','d-intel','d-nvidia','d-radeon','m-adreno','m-apple-ipad','m-apple','m-intel','m-mali-t','m-mali','m-nvidia','m-powervr']) asset(`https://unpkg.com/detect-gpu@4.0.50/dist/benchmarks/${name}.json`);

const downloaded = new Set();
while (downloaded.size < assets.size) {
  const batch = [...assets].filter(([url]) => !downloaded.has(url)).slice(0, 10);
  await Promise.allSettled(batch.map(async ([url, local]) => {
    downloaded.add(url);
    const file = path.join(publicDir, local);
    try {
      let bytes;
      try { bytes = await readFile(file); }
      catch { bytes = Buffer.from(await (await request(url)).arrayBuffer()); }
      if (/\.(?:css|js|webmanifest)$/.test(local)) {
        let text = bytes.toString();
        if (local.endsWith('.css')) text = urlsInText(text, url);
        if (local.endsWith('.js')) {
          text = text.replace(/((?:from|import)\s*['"])([./][^'"]+)(['"])/g, (_, prefix, relative, suffix) => `${prefix}${asset(relative,url)}${suffix}`);
          text = text.replace(/https:\/\/www\.thoughtlab\.com/g, '');
          // GPU benchmarking is optional and otherwise calls a remote CDN on every load.
          text = text.replace('https://unpkg.com/detect-gpu@4.0.50/dist/benchmarks', '/reference/benchmarks');
        }
        bytes = Buffer.from(text);
      }
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, bytes);
    } catch (error) { failures.push({ url, error: String(error) }); console.error(String(error)); }
  }));
  console.log(`Assets ${downloaded.size}/${assets.size}`);
}

const missingRoutes = new Set();
// Keep earlier captured pages when adding category archives or refreshing a subset.
for (const file of await readdir(reference)) {
  if (!file.endsWith('.html')) continue;
  const $ = load(await readFile(path.join(reference, file), 'utf8'));
  const route = $('html').attr('data-reference-route');
  if (route && !pages.has(route)) pages.set(route, { route, file, title: $('title').text(), source: origin + route });
}
for (const entry of pages.values()) {
  const file = path.join(reference, entry.file);
  const $ = load(await readFile(file, 'utf8'));
  $('a[href]').each((_, element) => {
    const tag = $(element);
    const href = tag.attr('href');
    const url = new URL(href, origin);
    if (url.origin !== origin || path.extname(url.pathname) || url.pathname.startsWith('/wp-content/')) return;
    if (!pages.has(url.pathname)) {
      tag.attr('href', url.href).attr('data-router-disabled', '').attr('target', '_blank').attr('rel', 'noopener noreferrer');
      missingRoutes.add(url.pathname);
    } else {
      tag.attr('href', url.pathname + url.search + url.hash);
      if (tag.attr('data-router-disabled') !== undefined) tag.removeAttr('data-router-disabled target rel');
    }
  });
  await writeFile(file, $.html());
}
const existing = [];
for (const [source, local] of assets) {
  try { const info = await stat(path.join(publicDir, local)); existing.push({ source, local, bytes: info.size }); } catch {}
}
await writeFile(path.join(reference, 'manifest.json'), JSON.stringify({ source: origin, capturedAt: new Date().toISOString(), pages: [...pages.values()], assets: existing, externalRoutes: [...missingRoutes], failures }, null, 2));
console.log(JSON.stringify({ pages: pages.size, assets: existing.length, bytes: existing.reduce((sum,a)=>sum+a.bytes,0), externalRoutes:missingRoutes.size, failures:failures.length }));
