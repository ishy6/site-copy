import { parseHTML } from 'linkedom';
import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const exec = promisify(execFile);
const root = 'public/reference';
const routes = JSON.parse(await readFile(`${root}/routes.json`, 'utf8'));
const products = JSON.parse(await readFile(`${root}/products.json`, 'utf8'));
const map = new Map();
const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 20);
const source = 'https://makr.com';
const sourceImages = new Set();
const failures = [];
function registerMedia(raw, width = 1400, blend = false) {
  const url = new URL(raw, source);
  if (url.hostname.includes('amazonaws.com')) { url.hostname = 'media-makr-com.imgix.net'; url.pathname = url.pathname.replace('/media.makr.com/', '/'); }
  if (!url.hostname.includes('imgix.net')) return raw;
  sourceImages.add(`${url.origin}${url.pathname}`);
  url.search = ''; url.searchParams.set('auto', 'format'); url.searchParams.set('fm', 'webp'); url.searchParams.set('q', '85'); url.searchParams.set('w', String(width));
  if (blend) { url.searchParams.set('blend-color', '000000'); url.searchParams.set('blend-mode', 'multiply'); url.searchParams.set('blend-alpha', '11'); }
  const file = `/reference/media/${hash(url.href)}.webp`;
  map.set(file, url.href);
  return file;
}
async function get(url) {
  const cache = `/tmp/makr-fetch-${hash(url)}`;
  try { return await readFile(cache, 'utf8'); } catch {}
  const { stdout } = await exec('curl', ['--fail', '-s', '-L', '--compressed', '--retry', '1', '--max-time', '40', url], { maxBuffer: 16 * 1024 * 1024 });
  await writeFile(cache, stdout); return stdout;
}
function readImages(value) {
  if (typeof value === 'string' && /https?:.*(?:imgix\.net|amazonaws\.com)/.test(value) && !value.includes('<')) {
    try { registerMedia(value); } catch {}
  } else if (Array.isArray(value)) value.forEach(readImages);
  else if (value && typeof value === 'object') Object.values(value).forEach(readImages);
}
function normalize(document) {
  document.querySelectorAll('script, [name="CRAFT_CSRF_TOKEN"], [name="successMessage"]').forEach(el => el.remove());
  document.querySelectorAll('form').forEach(el => el.removeAttribute('action'));
  document.querySelectorAll('a[href]').forEach(el => { const href = el.getAttribute('href'); if (href.startsWith(source)) el.setAttribute('href', href.slice(source.length)); });
  document.querySelectorAll('img[src]').forEach(el => { el.setAttribute('src', registerMedia(el.getAttribute('src'))); el.removeAttribute('srcset'); el.parentElement?.querySelectorAll('source').forEach(el => el.remove()); });
}
async function capture(pathname) {
  if (routes[pathname]) return;
  const document = parseHTML(await get(`${source}${pathname}`)).document;
  const marker = document.getElementById('product-marker');
  const group = marker ? JSON.parse(Buffer.from(marker.dataset.product_data, 'base64').toString('utf8')) : [];
  for (const product of group) {
    product.url = new URL(product.url).pathname;
    product.productImages = product.productImages.map(image => ({ ...image, url: registerMedia(image.url, 1600, true) }));
    product.supportingImages = product.supportingImages.map(image => ({ ...image, url: registerMedia(image.url, 1600) }));
    products[product.url] = product;
  }
  marker?.removeAttribute('data-product_data');
  normalize(document);
  const main = document.getElementById('main_content');
  if (!main) throw new Error(`No page ${pathname}`);
  const snapshot = { title: document.title, bodyClass: document.body.className, bodyStyle: document.body.getAttribute('style') || '', html: main.innerHTML, products: group.map(p => p.url), productId: marker?.dataset.product_id };
  const file = `/reference/pages/${hash(pathname)}.json`;
  await writeFile(`public${file}`, JSON.stringify(snapshot)); routes[pathname] = file;
  for (const product of group) {
    if (routes[product.url]) continue;
    const name = `/reference/pages/${hash(product.url)}.json`;
    await writeFile(`public${name}`, JSON.stringify({ ...snapshot, productId: String(product.productId) })); routes[product.url] = name;
  }
  console.log('Added', pathname);
}
async function batch(items, callback, concurrency = 5) {
  const queue = [...items];
  await Promise.allSettled(Array.from({ length: concurrency }, async () => {
    while (queue.length) { const item = queue.shift(); try { await callback(item); } catch (error) { failures.push({ item, error: error.message }); } }
  }));
}
const fixtures = {};
for (const query of ['*', 'wallet', 'bag', 'canvas', 'black', 'leather', 'tote', 'keychain']) {
  const result = JSON.parse(await get(`${source}/search/results?q=${encodeURIComponent(query)}`));
  for (const collection of result) for (const group of collection.collection_data) for (const product of group.subcategory_products) {
    product.url = new URL(product.url).pathname;
    product.productImage = registerMedia(product.productImage, 1000);
  }
  fixtures[query] = result;
}
const searchProducts = fixtures['*'][0].collection_data.flatMap(group => group.subcategory_products);
await batch(searchProducts.filter(p => !routes[p.url]).map(p => p.url), capture);
await batch(['/journal/p4', '/journal/p5', '/journal/p6', '/journal/p7', '/journal/p8'], capture);
await writeFile(`${root}/search.json`, JSON.stringify(fixtures));
await writeFile(`${root}/products.json`, JSON.stringify(products));
await writeFile(`${root}/routes.json`, JSON.stringify(routes));

// Reconstruct the source URL for every existing snapshot asset before repairing failed downloads.
for (const file of (await readdir('/tmp')).filter(file => file.startsWith('makr-fetch-'))) {
  const text = await readFile(`/tmp/${file}`, 'utf8');
  if (text.startsWith('[')) { try { readImages(JSON.parse(text)); } catch {} }
  else if (text.includes('<html')) {
    const doc = parseHTML(text).document;
    for (const image of doc.querySelectorAll('img[src]')) { try { registerMedia(image.getAttribute('src')); } catch {} }
    const marker = doc.getElementById('product-marker');
    if (marker?.dataset.product_data) try { readImages(JSON.parse(Buffer.from(marker.dataset.product_data, 'base64').toString('utf8'))); } catch {}
  }
}
for (const raw of [...sourceImages]) for (const width of [1000, 1400, 1600]) { registerMedia(raw, width); registerMedia(raw, width, true); }
const needed = new Set();
for (const file of ['shell.html', 'products.json', 'catalogs.json', 'search.json', ...Object.values(routes).map(file => file.replace('/reference/', ''))]) {
  const text = await readFile(`${root}/${file}`, 'utf8');
  for (const match of text.matchAll(/\/reference\/media\/[a-f0-9]+\.webp/g)) needed.add(match[0]);
}
await writeFile(`${root}/media-map.json`, JSON.stringify(Object.fromEntries([...map].filter(([file]) => needed.has(file)))));
const missing = [];
for (const file of needed) try { if (!(await stat(`public${file}`)).size) missing.push(file); } catch { missing.push(file); }
console.log('Required assets', needed.size, 'missing', missing.length);
await batch(missing, async file => {
  const remote = map.get(file);
  if (!remote) throw new Error(`Missing source for ${file}`);
  const temp = `/tmp/makr-media-${hash(remote)}`;
  try { await exec('curl', ['--fail', '-L', '-s', '--max-time', '25', remote, '-o', `public${file}`]); }
  catch {
    const url = new URL(remote);
    const raw = `https://s3.us-east-1.amazonaws.com/media.makr.com${url.pathname}`;
    await exec('curl', ['--fail', '-L', '-s', '--max-time', '30', raw, '-o', temp]);
    let image = sharp(temp).resize({ width: Number(url.searchParams.get('w')), withoutEnlargement: true });
    if (url.searchParams.has('blend-alpha')) image = image.modulate({ brightness: 0.89 });
    await image.webp({ quality: 85 }).toFile(`public${file}`);
  }
}, 10);
await writeFile(`${root}/completion.json`, JSON.stringify({ routes: Object.keys(routes).length, products: Object.keys(products).length, assets: needed.size, failures }, null, 2));
console.log('Completed', Object.keys(routes).length, 'routes;', failures.length, 'failures');
