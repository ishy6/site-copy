export type Variant = { id: number; dimensions?: string; isAvailable: boolean; price: number; salePrice: number; shortTitle: string | null; title: string };
export type Product = { productId: number; url: string; titleOne: string; titleTwo: string; finish: string; productDescription: string; productionNotes: string; dimensions: string; productImages: { url: string; caption?: string }[]; supportingImages: { url: string; caption?: string }[]; variantData: Variant[] };
export type CatalogProduct = { title: string; url: string; productImage: string; price: number; salePrice: number };
export type Group = { subcategory_slug: string; subcategory_title: string; subcategory_summary: string; subcategory_featured_image: string; subcategory_video: string; subcategory_video_padding: string; subcategory_products: CatalogProduct[] };
export type Catalog = { collection_title: string; collection_data: Group[] }[];
export type Snapshot = { title: string; bodyClass: string; bodyStyle: string; html: string; productId?: string; products: string[]; collection?: string };
export type CartLine = { url: string; variantId: number; quantity: number };
export const escapeHtml = (text: unknown) => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const money = (number: number) => `$${Number.isInteger(number) ? number : number.toFixed(2)}`;
export function priceHtml(price: number, sale: number, starting = false) {
  return `<div class="product-price ${sale < price ? 'on-sale' : ''}">${starting ? '<span class="starting-at">Starting at: </span>' : ''}<span class="retail-price">${money(price)}</span>${sale < price ? `<span class="sale-price">${money(sale)}</span>` : ''}</div>`;
}
export const pictureHtml = (url: string, alt = '') => url ? `<picture><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"></picture>` : '<picture></picture>';
export const titleFor = (product: Product) => [product.titleOne, product.titleTwo, product.finish].filter(Boolean).join(', ');
export function collectionHtml(catalog: Catalog, id = 'productCollection') {
  const data = catalog[0];
  if (!data) return '';
  return `<div id="${id}" class="productCollection"><div class="main-title"><h1 class="collection-title">${escapeHtml(data.collection_title)}</h1></div><div class="product-line"></div>${data.collection_data.map(group => {
    const featured = Boolean(group.subcategory_featured_image || group.subcategory_video);
    let media = group.subcategory_featured_image ? `<div class="featured-image">${pictureHtml(group.subcategory_featured_image, group.subcategory_title)}</div>` : '';
    if (group.subcategory_video) media = `<section class="video-wrapper"><div class="vimeo-embed ${group.subcategory_video_padding === '189' ? 'padding-189' : ''}"><iframe src="https://player.vimeo.com/video/${encodeURIComponent(group.subcategory_video)}?autoplay=1&background=1&mute=1" width="100%" frameborder="0" allow="autoplay; fullscreen" title="${escapeHtml(group.subcategory_title)}"></iframe></div></section>`;
    return `<div class="product-collection updateded" id="${escapeHtml(group.subcategory_slug.replaceAll('-', '_'))}"><div class="collection-header"><h2 class="category-title">${escapeHtml(group.subcategory_title)}</h2><div class="category-summary">${group.subcategory_summary}</div></div><div class="collection ${featured ? 'has-featured-image' : ''}">${media}<div class="collection-products ${featured ? 'has-featured-image' : ''}">${group.subcategory_products.map(product => `<div class="product ${featured ? 'has-featured-image' : ''}"><a href="${escapeHtml(product.url)}"><div class="product-image"><div class="product-image-overlay"></div>${pictureHtml(product.productImage, product.title)}</div><div><h4>${escapeHtml(product.title)}</h4></div>${priceHtml(product.price, product.salePrice)}</a></div>`).join('')}</div></div></div><div class="product-line"></div>`;
  }).join('')}</div>`;
}
export function productHtml(snapshot: Snapshot, product: Product, all: Record<string, Product>, selected: number | null) {
  const document = new DOMParser().parseFromString(snapshot.html, 'text/html');
  const set = (id: string, html: string) => { const element = document.getElementById(id); if (element) element.innerHTML = html; };
  for (const prefix of ['', 'mobile.']) {
    set(`${prefix}product.titleOne`, escapeHtml(product.titleOne));
    set(`${prefix}product.titleTwo`, escapeHtml(product.titleTwo));
    set(`${prefix}product.finish`, escapeHtml(product.finish));
  }
  set('product.description', product.productDescription);
  set('product.production_notes', product.productionNotes);
  const variant = product.variantData.find(v => v.id === selected);
  const cheapest = [...product.variantData].sort((a, b) => a.price - b.price)[0];
  set('product.dimensions', `<p>${variant?.dimensions || product.dimensions || ''}</p>`);
  set('product.price.block', priceHtml(variant?.price ?? cheapest.price, variant?.salePrice ?? cheapest.salePrice, !variant && product.variantData.length > 1));
  for (const id of ['product-image-container', 'product-image-container-mobile']) set(id, product.productImages.map(image => pictureHtml(image.url, titleFor(product))).join(''));
  set('supporting.images', product.supportingImages.map(image => pictureHtml(image.url, image.caption || titleFor(product))).join(''));
  const siblings = snapshot.products.map(url => all[url]).filter(p => p && p.productId !== product.productId);
  set('sibling-collection', siblings.map(p => `<a href="${escapeHtml(p.url)}" class="product">${pictureHtml(p.productImages[0]?.url || '', titleFor(p))}<div class="product-caption"><div class="row-one"><p class="title-one">${escapeHtml(titleFor(p))}</p></div><div class="row-two">${priceHtml(p.variantData[0].price, p.variantData[0].salePrice)}</div></div></a>`).join(''));
  document.getElementById('sibling-products-header')?.classList.toggle('has-siblings', siblings.length > 0);
  document.getElementById('variants.select.block')?.classList.toggle('active', product.variantData.length > 1);
  set('mcs.item.wrapper', `<div class="mcs-item-base" id="mcs.item.base" role="button" tabindex="0" aria-label="Choose product option">${escapeHtml(variant?.shortTitle || 'Choose')}</div>${product.variantData.map(v => `<div class="mcs-item ${v.isAvailable ? '' : 'out-of-stock'}" role="option" tabindex="0" data-variant-id="${v.id}">${escapeHtml(v.shortTitle || v.title)}</div>`).join('')}`);
  const available = variant?.isAvailable ?? product.variantData.some(v => v.isAvailable);
  const button = document.getElementById('product.add.to.cart') as HTMLButtonElement | null;
  button?.classList.toggle('out-of-stock', !available);
  button?.classList.toggle('select-option', !variant && available);
  if (button) button.disabled = !available;
  document.getElementById('product.oos.registration.form')?.classList.toggle('active', !available);
  document.querySelectorAll<HTMLInputElement>('input[type=email]').forEach(input => input.required = true);
  return document.body.innerHTML;
}
