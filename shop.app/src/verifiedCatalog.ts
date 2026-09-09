import type { Product, ProductVariantOption } from './catalogData'

export type CapturedProductDetail = Product & {
  id: string
  sourceUrl: string
  purchaseUrl: string
  onlineStoreUrl: string
  description: string
  gallery: string[]
  variantOptions: ProductVariantOption[]
  selectedVariant: string
  ratingValue: number | null
  ratingCount: number
  reviewCount: number
  availability: NonNullable<Product['availability']>
  inStock: boolean
  requiresShipping: boolean
}

export function pathFromSourceUrl(sourceUrl: string) {
  try {
    return new URL(sourceUrl).pathname.replace(/\/$/, '') || '/'
  } catch {
    return ''
  }
}

export function isCapturedProductDetail(product: Product | undefined): product is CapturedProductDetail {
  if (!product?.id
    || product.store !== 'Gathre'
    || !product.sourceUrl
    || !product.purchaseUrl
    || !product.onlineStoreUrl
    || !product.description?.trim()
    || !product.gallery?.length
    || product.gallery.some((image) => !image)
    || !product.variantOptions?.length
    || !product.selectedVariant?.trim()
    || product.ratingValue === undefined
    || !Number.isInteger(product.ratingCount)
    || Number(product.ratingCount) < 0
    || !Number.isInteger(product.reviewCount)
    || Number(product.reviewCount) < 0
    || !['InStock', 'OutOfStock', 'PreOrder'].includes(product.availability || '')
    || typeof product.inStock !== 'boolean'
    || typeof product.requiresShipping !== 'boolean') return false

  if (product.ratingValue !== null && (!Number.isFinite(product.ratingValue) || product.ratingValue < 0 || product.ratingValue > 5)) return false
  if (product.variantOptions.some((option) => !option.name.trim() || !option.values.length || option.values.some((value) => !value.name.trim()))) return false

  const selectedNames = product.selectedVariant.replace(/\s*\(on sale\)$/i, '').split(' / ')
  if (selectedNames.length !== product.variantOptions.length) return false
  if (product.variantOptions.some((option, index) => !option.values.some((value) => value.name === selectedNames[index]))) return false

  try {
    const sourceUrl = new URL(product.sourceUrl)
    const purchaseUrl = new URL(product.purchaseUrl)
    const onlineStoreUrl = new URL(product.onlineStoreUrl)
    const sourceMatch = sourceUrl.pathname.replace(/\/$/, '').match(/^\/products\/([^/]+)\/[^/]+$/)
    return sourceUrl.origin === 'https://shop.app'
      && sourceMatch?.[1] === product.id
      && purchaseUrl.origin === 'https://shop.app'
      && purchaseUrl.pathname === '/accounts/rec_sf'
      && onlineStoreUrl.origin === 'https://gathre.com'
  } catch {
    return false
  }
}
