import { load } from 'cheerio';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://prod-raw.shupatto.com';
const root = path.resolve(import.meta.dirname, '../public');
const assets = new Set();
const pages = new Map();
const visited = new Set();
const queue = ['/', '/en/'];
const failures = [];
const sourceHosts = new Set(['prod-raw.shupatto.com', 'www.shupatto.com', 'shupatto.com']);
const normalize = value => {
  try {
    const url = new URL(value, origin);
    return sourceHosts.has(url.hostname) ? url.pathname + url.search + url.hash : value;
  } catch { return value; }
};
function asset(value, relative = '/') {
  try {
    const url = new URL(value, new URL(relative, origin));
    if (sourceHosts.has(url.hostname) && /\.(?:webp|png|jpe?g|gif|svg|ico|mp4|webm|mp3|ogg|woff2?|css|js|json|pdf)$/i.test(url.pathname)) assets.add(url.pathname);
  } catch {}
}
async function download(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`${response.status} ${url}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) { if (attempt === 2) throw error; }
  }
}
function structuredAssets(value) {
  if (typeof value === 'string') asset(value);
  else if (Array.isArray(value)) value.forEach(structuredAssets);
  else if (value && typeof value === 'object') Object.values(value).forEach(structuredAssets);
}
function scanDocument($, route) {
  $('*').each((_, element) => {
    for (const [name, value] of Object.entries(element.attribs || {})) {
      if (/src|poster|href/.test(name)) asset(value, route);
      for (const match of value.matchAll(/(?:https?:\/\/[^\s"'<>]+)?\/(?:assets|uploads)\/[^\s"'<>\\,)]+/g)) asset(match[0], route);
      if (name.startsWith('data-')) {
        try { structuredAssets(JSON.parse(decodeURIComponent(value))); } catch {}
      }
    }
  });
}
async function crawl(route) {
  const raw = await download(origin + route);
  if (!raw) throw new Error(`404 ${route}`);
  const html = raw.toString();
  const $ = load(html);
  scanDocument($, route);
  $('a[href]').each((_, element) => {
    const target = normalize($(element).attr('href'));
    $(element).attr('href', target);
    if (target.startsWith('/') && !target.startsWith('//') && !path.extname(target.split(/[?#]/)[0])) {
      const pathname = target.split(/[?#]/)[0];
      if (!visited.has(pathname)) queue.push(pathname);
    }
  });
  $('*').each((_, element) => {
    for (const [name, value] of Object.entries(element.attribs || {})) {
      if (/src|poster|href/.test(name)) asset(value, route);
      for (const match of value.matchAll(/(?:https?:\/\/[^\s"'<>]+)?\/(?:assets|uploads)\/[^\s"'<>\\,)]+/g)) asset(match[0], route);
      if (value.startsWith('https://www.shupatto.com/') || value.startsWith('https://prod-raw.shupatto.com/')) $(element).attr(name, normalize(value));
    }
  });
  for (const match of html.matchAll(/(?:https?:\/\/[^\s"'<>]+)?\/(?:assets|uploads)\/[^\s"'<>\\,)]+/g)) asset(match[0], route);
  const config = $('script:not([src])').map((_, element) => $(element).text()).get().filter(text => /window\.(?:ASSETS_REVISION|HOME_KEYFRAMES|PRODUCT)/.test(text)).join('\n');
  const scripts = $('script[src]').map((_, element) => normalize($(element).attr('src'))).get().filter(src => src.startsWith('/assets/'));
  $('script').remove();
  const snapshot = {
    route, title: $('title').text(), description: $('meta[name="description"]').attr('content') || '',
    lang: $('html').attr('lang'), name: $('html').attr('data-name'),
    htmlClass: $('html').attr('class'), bodyClass: $('body').attr('class') || '',
    body: $('body').html(), config, scripts,
  };
  const filename = route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '__') || 'home';
  await writeFile(path.join(root, 'reference', filename + '.json'), JSON.stringify(snapshot));
  pages.set(route, { file: filename + '.json', title: snapshot.title });
  console.log(`Page ${pages.size}: ${route}`);
}
await mkdir(path.join(root, 'reference'), { recursive: true });
if (process.env.SKIP_CRAWL === '1') {
  const manifest = JSON.parse(await readFile(path.join(root, 'reference/manifest.json'), 'utf8'));
  queue.length = 0;
  for (const [route, entry] of Object.entries(manifest.pages)) {
    pages.set(route, entry);
    const snapshot = JSON.parse(await readFile(path.join(root, 'reference', entry.file), 'utf8'));
    scanDocument(load(snapshot.body), route);
    snapshot.scripts.forEach(src => asset(src));
  }
}
asset('/assets/202601151311/css/app.css');
asset('/assets/202601151311/img/meta/favicon.svg');
asset('/assets/202601151311/img/meta/apple-touch-icon.png');
while (queue.length) {
  const batch = [...new Set(queue.splice(0, 8))].filter(route => !visited.has(route));
  batch.forEach(route => visited.add(route));
  await Promise.all(batch.map(async route => { try { await crawl(route); } catch (error) { failures.push(String(error)); } }));
}
const revision = '202601151311';
const mainPath = `/assets/${revision}/js/main.js`;
const main = (await download(origin + mainPath)).toString();
// Source animation sheets contain four consecutive photographed frames.
const first = Array.from({ length: 16 }, (_, index) => `1-${String(index + 1).padStart(2, '0')}`);
const other = ['2a', '2b', '4a', '4b', '5a', '5b', '6'].flatMap(prefix => [prefix + '-01', prefix + '-02']);
for (const mode of ['pc', 'sp', 'pc_large']) {
  const oriented = ['3a', '3b'].flatMap(prefix => [`${prefix}-01_${mode === 'sp' ? 'sp' : 'pc'}`, `${prefix}-02_${mode === 'sp' ? 'sp' : 'pc'}`]);
  for (const name of [...first, ...other, ...oriented]) {
    const count = name.startsWith('1-') ? 75 : name.startsWith('5a') ? 90 : name.startsWith('6-') ? 10 : 45;
    const base = `/assets/231221/data/sequence2/${mode}/${name}`;
    asset(base + '/_bg.webp');
    if (name.startsWith('6-')) asset(base + '/_cover.webp');
    for (let index = 1; index <= Math.ceil(count / 4); index++) asset(`${base}/f${String(index).padStart(5, '0')}.webp`);
  }
}
for (const match of main.matchAll(/name:"((?:se|bgm)\/[^"\s]+)"/g)) asset(`/assets/${revision}/data/audio/${match[1]}.mp3`);
asset(`/assets/${revision}/data/audio/blank.mp3`);
asset(`/assets/${revision}/data/audio/bgm.mp3`);
await writeFile(path.join(root, 'reference/manifest.json'), JSON.stringify({ origin, captured: new Date().toISOString(), pages: Object.fromEntries(pages), assets: 0, failures }, null, 2));
let processed = new Set();
let count = 0;
while ([...assets].some(url => !processed.has(url))) {
  const batch = [...assets].filter(url => !processed.has(url));
  let index = 0;
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (index < batch.length) {
      const url = batch[index++];
      processed.add(url);
      const destination = path.join(root, decodeURIComponent(url));
      try {
        let data;
        try { if ((await stat(destination)).size) data = await readFile(destination); } catch {}
        if (!data) {
          data = await download(origin + url);
          if (!data) { failures.push(`404 ${url}`); continue; }
          await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, data);
        }
        if (/\.(?:css|js|json)$/.test(url)) {
          const text = data.toString();
          for (const match of text.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) asset(match[1], url);
          for (const match of text.matchAll(/["'](\/(?:assets|uploads)\/[^"'\s]+)["']/g)) asset(match[1], url);
        }
        if (++count % 100 === 0) console.log(`Assets ${count}/${assets.size}`);
      } catch (error) { failures.push(String(error)); }
    }
  }));
}
await writeFile(path.join(root, 'reference/manifest.json'), JSON.stringify({ origin, captured: new Date().toISOString(), pages: Object.fromEntries(pages), assets: count, failures }, null, 2));
console.log(JSON.stringify({ pages: pages.size, assets: count, failures }, null, 2));
