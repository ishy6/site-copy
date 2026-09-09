import { parseHTML } from 'linkedom';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const exec = promisify(execFile);
const root = path.resolve('public/reference');
await mkdir(`${root}/pages`, { recursive: true });
await mkdir(`${root}/media`, { recursive: true });
const routes = {};
const catalogs = {};
const products = {};
const images = new Map();
const failures = [];
const origin = 'https://makr.com';
const categories = ['new-releases', 'wallets', 'bags-totes', 'keychains', 'accessories', 'phone-sleeves', 'device-cases', 'stationery', 'eyewear', 'objects', 'cordovan', 'clearance', 'travel'];
const slug = value => new URL(value, origin).pathname;
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 20);
async function download(url) {
  const cache = `/tmp/makr-fetch-${hash(url)}`;
  try { return await readFile(cache, 'utf8'); } catch {}
  const result = await exec('curl', ['--fail', '-L', '--compressed', '-s', '--retry', '2', '--max-time', '40', url], { maxBuffer: 12 * 1024 * 1024 });
  await writeFile(cache, result.stdout);
  return result.stdout;
}
function mediaUrl(raw, width = 1400, product = false) {
  const url = new URL(raw, origin);
  if (url.host.includes('amazonaws.com')) {
    url.hostname = 'media-makr-com.imgix.net';
    url.pathname = url.pathname.replace('/media.makr.com/', '/');
  }
  if (!url.hostname.includes('imgix.net')) return raw;
  url.search = '';
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('q', '85');
  url.searchParams.set('w', String(width));
  if (product) {
    url.searchParams.set('blend-color', '000000');
    url.searchParams.set('blend-mode', 'multiply');
    url.searchParams.set('blend-alpha', '11');
  }
  const key = url.href;
  const output = `/reference/media/${hash(key)}.webp`;
  images.set(key, output);
  return output;
}
function clean(document) {
  document.querySelectorAll('script, [name="CRAFT_CSRF_TOKEN"], [name="successMessage"]').forEach(el => el.remove());
  document.querySelectorAll('a[href]').forEach(el => {
    const href = el.getAttribute('href');
    if (href?.startsWith(origin)) el.setAttribute('href', href.slice(origin.length) || '/');
  });
  document.querySelectorAll('form').forEach(el => el.removeAttribute('action'));
  document.querySelectorAll('img').forEach(el => {
    const source = el.getAttribute('src');
    if (!source) return;
    el.setAttribute('src', mediaUrl(source));
    el.removeAttribute('srcset');
    el.parentElement?.querySelectorAll('source').forEach(node => node.remove());
  });
  document.querySelectorAll('[id="page-loading"], .extras').forEach(el => el.remove());
  document.querySelectorAll('[id="desktop_nav_overlay"], [id="minicart-drawer"]').forEach(el => el.removeAttribute('style'));
  const email = document.getElementById('EMAIL');
  if (email) { email.setAttribute('type', 'email'); email.setAttribute('autocomplete', 'email'); email.setAttribute('aria-label', 'Email address'); }
  return document;
}
function productData(document) {
  const marker = document.getElementById('product-marker');
  if (!marker) return [];
  return JSON.parse(Buffer.from(marker.dataset.product_data, 'base64').toString('utf8'));
}
function normalizeProducts(data) {
  for (const product of data) {
    product.url = slug(product.url);
    product.productImages = product.productImages.map(image => ({ ...image, url: mediaUrl(image.url, 1600, true) }));
    product.supportingImages = product.supportingImages.map(image => ({ ...image, url: mediaUrl(image.url, 1600) }));
    products[product.url] = product;
  }
  return data;
}
async function savePage(url) {
  const pathname = slug(url);
  if (routes[pathname]) return;
  const html = await download(new URL(pathname, origin).href);
  const document = clean(parseHTML(html).document);
  const main = document.getElementById('main_content');
  if (!main) throw new Error(`Missing main content: ${pathname}`);
  const data = normalizeProducts(productData(document));
  const marker = document.getElementById('product-marker');
  marker?.removeAttribute('data-product_data');
  const snapshot = { title: document.title, bodyClass: document.body.className, bodyStyle: document.body.getAttribute('style') || '', html: main.innerHTML, productId: marker?.dataset.product_id, products: data.map(product => product.url), collection: document.getElementById('productCollection')?.dataset.collection_source };
  const filename = `${hash(pathname)}.json`;
  await writeFile(`${root}/pages/${filename}`, JSON.stringify(snapshot));
  routes[pathname] = `/reference/pages/${filename}`;
  if (data.length) {
    for (const product of data) {
      if (routes[product.url]) continue;
      const name = `${hash(product.url)}.json`;
      await writeFile(`${root}/pages/${name}`, JSON.stringify({ ...snapshot, title: `${product.titleOne}, ${product.finish} - MAKR`, productId: String(product.productId) }));
      routes[product.url] = `/reference/pages/${name}`;
    }
  }
  if (pathname === '/') {
    main.innerHTML = '';
    await writeFile(`${root}/shell.html`, document.body.innerHTML);
  }
  if (snapshot.collection) {
    const catalog = JSON.parse(await download(new URL(snapshot.collection, origin).href));
    for (const collection of catalog) for (const group of collection.collection_data) {
      if (group.subcategory_featured_image) group.subcategory_featured_image = mediaUrl(group.subcategory_featured_image);
      for (const product of group.subcategory_products) {
        product.url = slug(product.url);
        product.productImage = mediaUrl(product.productImage, 1000);
      }
    }
    catalogs[pathname] = catalog;
  }
  const links = [...main.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(href => href?.startsWith('/') && !href.startsWith('//'));
  console.log(`Captured ${pathname}; ${Object.keys(routes).length} routes, ${images.size} media`);
  return links;
}
async function batch(items, fn, count = 5) {
  const queue = [...items];
  await Promise.allSettled(Array.from({ length: count }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await fn(item); } catch (error) { failures.push({ item, message: error.message }); console.warn('Failed', item, error.message); }
    }
  }));
}

await savePage('/');
await batch(categories.map(item => `/${item}`), savePage);
const pages = ['/info/about', '/info/process', '/info/help', '/journal', '/account', '/shop/customer/forgot-password', '/shop/customer/register'];
const extraLinks = [];
await batch(pages, async url => extraLinks.push(...await savePage(url) || []));
const productUrls = new Set(Object.values(catalogs).flatMap(groups => groups.flatMap(collection => collection.collection_data.flatMap(group => group.subcategory_products.map(product => product.url)))));
await batch([...productUrls], savePage, 5);
await batch([...new Set(extraLinks)].filter(url => !routes[slug(url)] && !url.includes('checkout') && !url.includes('logout')), savePage, 4);
routes['/furniture'] = routes['/objects'];
await writeFile(`${root}/routes.json`, JSON.stringify(routes));
await writeFile(`${root}/catalogs.json`, JSON.stringify(catalogs));
await writeFile(`${root}/products.json`, JSON.stringify(products));
const stylesheet = await download('https://makr.com/makr.14377d8581b3a5337f.css?v=1788402922');
await writeFile(`${root}/original.css`, stylesheet);
const fontPaths = [...new Set([...stylesheet.matchAll(/url\(([^)]+)\)/g)].map(match => match[1]))];
await batch(fontPaths, async resource => {
  const dest = `${root}/${resource}`;
  await mkdir(path.dirname(dest), { recursive: true });
  await exec('curl', ['--fail', '-L', '-s', '--max-time', '30', `${origin}/${resource}`, '-o', dest]);
});
await batch([...images], async ([url, destination]) => {
  const dest = path.resolve('public', destination.slice(1));
  try { await access(dest); return; } catch {}
  await exec('curl', ['--fail', '-L', '-s', '--retry', '1', '--max-time', '35', url, '-o', dest]);
}, 8);
await writeFile(`${root}/provenance.json`, JSON.stringify({ source: origin, capturedAt: new Date().toISOString(), routes: Object.keys(routes).length, products: Object.keys(products).length, media: images.size, failures }, null, 2));
console.log(`Finished: ${Object.keys(routes).length} routes, ${Object.keys(products).length} products, ${images.size} media; ${failures.length} failures`);
