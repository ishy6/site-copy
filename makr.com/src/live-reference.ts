import type { Catalog, Product, Snapshot } from './reference';

export function createReferenceLoader(media: Record<string, string>) {
  const localImages = new Map<string, string>();
  for (const [local, remote] of Object.entries(media)) {
    const url = new URL(remote);
    localImages.set(`${url.pathname}:${url.searchParams.has('blend-alpha')}`, local);
  }
  function imageUrl(raw: string, blend = false) {
    if (!raw) return '';
    const url = new URL(raw, 'https://makr.com');
    if (url.hostname.includes('amazonaws.com')) { url.hostname = 'media-makr-com.imgix.net'; url.pathname = url.pathname.replace('/media.makr.com/', '/'); }
    if (!url.hostname.includes('imgix.net')) return raw;
    const local = localImages.get(`${url.pathname}:${blend}`);
    if (local) return local;
    url.search = 'auto=format&fm=webp&q=85&w=1400';
    if (blend) { url.searchParams.set('blend-color', '000000'); url.searchParams.set('blend-mode', 'multiply'); url.searchParams.set('blend-alpha', '11'); }
    return url.href;
  }
  function normalizeCatalog(catalog: Catalog) {
    for (const collection of catalog) for (const group of collection.collection_data) {
      if (group.subcategory_featured_image) group.subcategory_featured_image = imageUrl(group.subcategory_featured_image);
      for (const product of group.subcategory_products) { product.url = new URL(product.url, 'https://makr.com').pathname; product.productImage = imageUrl(product.productImage); }
    }
    return catalog;
  }
  async function load(pathname: string) {
    const response = await fetch(`https://makr.com${pathname}`, { credentials: 'omit', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('This page is temporarily unavailable. Please try again.');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const main = doc.getElementById('main_content');
    if (!main) throw new Error('This page is temporarily unavailable. Please try again.');
    const marker = doc.getElementById('product-marker');
    const products: Product[] = marker?.dataset.product_data ? JSON.parse(atob(marker.dataset.product_data)) : [];
    for (const product of products) {
      product.url = new URL(product.url).pathname;
      product.productImages = product.productImages.map(image => ({ ...image, url: imageUrl(image.url, true) }));
      product.supportingImages = product.supportingImages.map(image => ({ ...image, url: imageUrl(image.url) }));
    }
    marker?.removeAttribute('data-product_data');
    doc.querySelectorAll('script, [name="CRAFT_CSRF_TOKEN"], [name="successMessage"]').forEach(element => element.remove());
    doc.querySelectorAll('form').forEach(form => form.removeAttribute('action'));
    doc.querySelectorAll('*').forEach(element => { for (const attribute of [...element.attributes]) if (attribute.name.startsWith('on')) element.removeAttribute(attribute.name); });
    doc.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => { const url = new URL(anchor.getAttribute('href')!, 'https://makr.com'); if (url.hostname === 'makr.com') anchor.setAttribute('href', `${url.pathname}${url.search}${url.hash}`); });
    doc.querySelectorAll<HTMLImageElement>('img[src]').forEach(image => { image.src = imageUrl(image.getAttribute('src')!); image.removeAttribute('srcset'); image.parentElement?.querySelectorAll('source').forEach(source => source.remove()); });
    const source = doc.getElementById('productCollection')?.dataset.collection_source;
    let catalog: Catalog | undefined;
    if (source) { const response = await fetch(new URL(source, 'https://makr.com'), { credentials: 'omit' }); if (response.ok) catalog = normalizeCatalog(await response.json()); }
    const snapshot: Snapshot = { title: doc.title, bodyClass: doc.body.className, bodyStyle: doc.body.getAttribute('style') || '', html: main.innerHTML, products: products.map(p => p.url), productId: marker?.dataset.product_id };
    return { snapshot, products, catalog };
  }
  async function search(query: string, signal: AbortSignal) {
    const response = await fetch(`https://makr.com/search/results?q=${encodeURIComponent(query)}`, { credentials: 'omit', signal });
    if (!response.ok) throw new Error('Search is temporarily unavailable.');
    return normalizeCatalog(await response.json());
  }
  return { load, search };
}
