import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve(import.meta.dirname, '../public/reference');
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const routes = manifest.pages.filter(page => page.route.startsWith('/products/') && !page.route.includes('?'));
let products = {};
try { products = JSON.parse(await readFile(path.join(root, 'products.json'), 'utf8')); } catch {}
for (let i = 0; i < routes.length; i += 5) {
  await Promise.allSettled(routes.slice(i, i + 5).map(async page => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`https://ridealso.com${page.route}.js`, { signal: AbortSignal.timeout(30000) });
        if (response.status === 404) break;
        if (!response.ok) continue;
        products[page.route.split('/').pop()] = await response.json();
        break;
      } catch {}
    }
  }));
}
await writeFile(path.join(root, 'products.json'), JSON.stringify(products));
console.log(`Cached ${Object.keys(products).length} products and their variants.`);
const $ = load(await readFile(path.join(root, 'collections__gear.html'), 'utf8'));
const categories = {};
const filters = $('input[name="filter.p.m.filters.product_type"]').map((_, element) => ({ value: $(element).attr('value'), label: $(element).closest('label').find('.facets__option-label').text() })).get();
for (const filter of filters) {
  const url = new URL('https://ridealso.com/collections/gear');
  url.searchParams.set('filter.p.m.filters.product_type', filter.value);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) continue;
  const category = load(await response.text());
  categories[filter.value] = { label: filter.label, handles: category('[data-filter-results] collection-grid-tile[data-product-handle]').map((_, element) => category(element).attr('data-product-handle')).get().filter(Boolean) };
}
await writeFile(path.join(root, 'categories.json'), JSON.stringify(categories));
console.log(`Cached ${Object.keys(categories).length} source category memberships.`);
const recommendations = {};
const entries = Object.values(products);
for (let i = 0; i < entries.length; i += 5) {
  await Promise.allSettled(entries.slice(i, i + 5).map(async product => {
    const response = await fetch(`https://ridealso.com/recommendations/products.json?intent=related&limit=10&product_id=${product.id}`, { signal: AbortSignal.timeout(30000) });
    if (response.ok) recommendations[product.id] = await response.json();
  }));
}
await writeFile(path.join(root, 'recommendations.json'), JSON.stringify(recommendations));
console.log(`Cached ${Object.keys(recommendations).length} source recommendations.`);
