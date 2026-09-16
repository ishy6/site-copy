import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const origin = 'https://slush.app';
const root = path.resolve(import.meta.dirname, '../public/reference');
const assets = new Map();
const pages = new Map();
const failures = [];
const sourceHosts = new Set(['slush.app', 'www.slush.app']);
const excluded = /googletagmanager|google-analytics|hsforms|geo\.ipify|ipapi\.co|46342\.js|slush-card-dapp\.js/;
const extension = /\.(?:af|avif|webp|png|jpe?g|gif|svg|ico|mp4|webm|mp3|ogg|woff2?|ttf|otf|css|js|json|pdf)(?:[?#]|$)/i;
const queue = ['/'];
const visited = new Set();
const routeName = route => route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '__') || 'home';

async function download(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(90000) });
      if (!response.ok) throw new Error(`${response.status}: ${url}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) { if (attempt === 2) throw error; }
  }
}

function asset(value, base = origin) {
  if (!value || /^(?:data:|blob:|#|\/reference\/)/.test(value)) return value;
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || excluded.test(url.href) || !extension.test(url.href)) return value;
    // Keep large media on the origin CDN instead of copying it into the replica.
    if (/\.(?:mp4|webm|mov|m4v|avi)(?:[?#]|$)/i.test(url.href)) return url.href;
    if (!assets.has(url.href)) {
      const basename = decodeURIComponent(path.basename(url.pathname)).replace(/[^a-zA-Z0-9._-]/g, '_');
      const hash = createHash('sha256').update(url.href).digest('hex').slice(0, 12);
      assets.set(url.href, { local: `/reference/assets/${hash}-${basename}`, source: url.href });
    }
    return assets.get(url.href).local;
  } catch { return value; }
}

function rewriteText(text, base) {
  return text.replace(/(["'])(https?:\/\/[^\s"'<>\\]+)\1/g, (_, quote, value) => `${quote}${asset(value, base)}${quote}`)
    .replace(/https?:\/\/[^\s"'<>\\),]+/g, value => asset(value, base))
    .replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/g, (_, quote, value) => `url(${quote}${asset(value, base)}${quote})`);
}

function normalizeHref(value) {
  if (value.startsWith('#')) return value;
  try {
    const url = new URL(value, origin);
    if (sourceHosts.has(url.hostname)) return url.pathname + url.search + url.hash;
  } catch {}
  return value;
}

function rewriteDocument($, route) {
  $('*').each((_, element) => {
    for (const [name, value] of Object.entries(element.attribs || {})) {
      if (name === 'href' && element.tagName === 'a') {
        const href = normalizeHref(value);
        $(element).attr(name, href);
        if (href.startsWith('/') && !href.startsWith('//') && !path.extname(href.split(/[?#]/)[0])) {
          const pathname = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
          if (!visited.has(pathname)) queue.push(pathname);
        }
      } else if (name === 'srcset') {
        $(element).attr(name, value.split(',').map(entry => {
          const [url, ...size] = entry.trim().split(/\s+/);
          return [asset(url, origin + route), ...size].join(' ');
        }).join(', '));
      } else if (name === 'data-video-urls') {
        $(element).attr(name, value.split(',').map(url => asset(url, origin + route)).join(','));
      } else if (/src|poster|href/.test(name)) {
        $(element).attr(name, asset(value, origin + route));
      } else if (name === 'style' || name.startsWith('data-')) {
        $(element).attr(name, rewriteText(value, origin + route));
      }
    }
  });
  $('style').each((_, el) => $(el).text(rewriteText($(el).text(), origin + route)));
}

async function crawl(route) {
  const originalPath = path.join(root, 'original', `${routeName(route)}.html`);
  let html;
  if (process.env.REFRESH_SOURCE !== '1') {
    try { html = await readFile(originalPath, 'utf8'); } catch {}
  }
  if (!html) {
    html = (await download(origin + route)).toString();
    await writeFile(originalPath, html);
  }
  const $ = load(html);
  $('.gtm, noscript, script[src*="hsforms"], link[rel="preconnect"]').remove();
  const scripts = [];
  $('script').each((_, el) => {
    const src = $(el).attr('src');
    const text = $(el).text();
    if (src && !excluded.test(src)) scripts.push({ src: asset(src, origin + route), type: $(el).attr('type') });
    else if (!src && !/googletagmanager|hbspt|newsletter-mc/.test(text) && text.trim()) {
      if (text.includes('42806.js')) {
        if (!route.startsWith('/card')) scripts.push({ src: asset('https://assets.slater.app/slater/14111/42806.js') });
      } else if (!text.includes('w-mod-')) scripts.push({ text: rewriteText(text, origin + route) });
    }
  });
  $('script').remove();
  rewriteDocument($, route);
  $('[integrity], [crossorigin]').removeAttr('integrity').removeAttr('crossorigin');
  const snapshot = {
    route, title: $('title').text(), description: $('meta[name="description"]').attr('content') || '',
    lang: $('html').attr('lang') || 'en', htmlAttributes: $('html').attr(), bodyAttributes: $('body').attr(),
    head: $('head').html(), body: $('body').html(), scripts,
  };
  const file = `${routeName(route)}.json`;
  await writeFile(path.join(root, file), JSON.stringify(snapshot));
  await writeFile(path.join(root, 'documents', `${routeName(route)}.html`), $.html());
  pages.set(route, { file, document: `/reference/documents/${routeName(route)}.html`, title: snapshot.title });
  console.log(`Page ${pages.size}: ${route}`);
}

await mkdir(path.join(root, 'original'), { recursive: true });
await mkdir(path.join(root, 'documents'), { recursive: true });
await mkdir(path.join(root, 'assets'), { recursive: true });
const sitemap = load((await download(origin + '/sitemap.xml')).toString(), { xmlMode: true });
sitemap('loc').each((_, el) => queue.push(new URL(sitemap(el).text()).pathname));
while (queue.length) {
  const batch = [...new Set(queue.splice(0, 6))].filter(route => !visited.has(route));
  batch.forEach(route => visited.add(route));
  const results = await Promise.allSettled(batch.map(crawl));
  results.forEach(result => { if (result.status === 'rejected') failures.push(String(result.reason)); });
}

const processed = new Set();
while ([...assets.keys()].some(url => !processed.has(url))) {
  const batch = [...assets.values()].filter(entry => !processed.has(entry.source));
  let index = 0;
  const workers = await Promise.allSettled(Array.from({ length: 10 }, async () => {
    while (index < batch.length) {
      const entry = batch[index++];
      processed.add(entry.source);
      try {
        const destination = path.join(root, entry.local.replace('/reference/', ''));
        let data;
        try { if (!/\.(?:css|js|json)(?:[?#]|$)/.test(entry.source) && (await stat(destination)).size) data = await readFile(destination); } catch {}
        if (!data) data = await download(entry.source);
        if (/\.(?:css|js|json)(?:[?#]|$)/.test(entry.source)) {
          let text = rewriteText(data.toString(), entry.source);
          if (/\.css(?:[?#]|$)/.test(entry.source)) {
            const css = postcss.parse(data.toString());
            css.walkDecls(declaration => {
              const value = valueParser(declaration.value);
              value.walk(node => {
                if (node.type !== 'function' || node.value !== 'url') return;
                const raw = valueParser.stringify(node.nodes).replace(/^["']|["']$/g, '').replace(/\\([() ])/g, '$1');
                const local = asset(raw, entry.source);
                if (local !== raw) node.nodes = [{ type: 'word', value: local, sourceIndex: 0, sourceEndIndex: local.length }];
              });
              declaration.value = value.toString();
            });
            text = rewriteText(css.toString(), entry.source);
          }
          if (/\.json(?:[?#]|$)/.test(entry.source)) {
            const json = JSON.parse(data.toString());
            if (Array.isArray(json.assets)) for (const item of json.assets) {
              if (item.p && !item.p.startsWith('data:')) { item.p = asset((item.u || '') + item.p, entry.source); item.u = ''; }
            }
            text = rewriteText(JSON.stringify(json), entry.source);
          }
          // The source newsletter submission is replaced by an explicit local status.
          if (entry.source.endsWith('/42806.js')) text = text
            .replace(/function initFooter\(e\)\{[\s\S]*?function initMenu\(/, 'function initFooter(e){}function initMenu(')
            .replace('n.setAttribute("aria-label",d.textContent)', 'n.setAttribute("aria-label",n.textContent)')
            .replace('gsap.set(t,{xPercent:300,yPercent:0});const a=()=>', 'gsap.set(t,{xPercent:0,yPercent:0});menuState=!0;const a=()=>');
          data = Buffer.from(text);
        }
        await writeFile(destination, data);
      } catch (error) { failures.push(String(error)); }
      if (processed.size % 25 === 0) console.log(`Assets ${processed.size}/${assets.size}`);
    }
  }));
  workers.forEach(result => { if (result.status === 'rejected') failures.push(String(result.reason)); });
}
await writeFile(path.join(root, 'manifest.json'), JSON.stringify({ origin, captured: new Date().toISOString(), pages: Object.fromEntries(pages), assets: Object.fromEntries(assets), failures }, null, 2));
console.log(JSON.stringify({ pages: pages.size, assets: assets.size, failures }, null, 2));
