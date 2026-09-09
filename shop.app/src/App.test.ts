import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'
import { categoryProducts, gathreProducts, type Product } from './catalogData'
import { categoryDetails } from './categoryDetailData'
import { brandSections } from './data'
import { loginLocaleOptions } from './loginLocaleData'
import { localizedTermsLocales, termsForLocale } from './termsLocaleData'
import { isCapturedProductDetail } from './verifiedCatalog'

let wrapper: VueWrapper | undefined

async function settle() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

function mountAt(path = '/') {
  window.history.replaceState({}, '', path)
  wrapper = mount(App, { attachTo: document.body })
  return wrapper
}

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
  document.documentElement.lang = 'en'
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', { configurable: true, value: vi.fn() })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:http://localhost/shop-image') })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollBy')
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
  Reflect.deleteProperty(URL, 'createObjectURL')
  Reflect.deleteProperty(URL, 'revokeObjectURL')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Shop routed experience', () => {
  it('opens product details only when every captured metadata field is valid', () => {
    expect(gathreProducts).toHaveLength(18)
    expect(gathreProducts.every(isCapturedProductDetail)).toBe(true)

    const sourceProduct = gathreProducts[0]!
    const requiredFields = [
      'id',
      'sourceUrl',
      'purchaseUrl',
      'onlineStoreUrl',
      'description',
      'gallery',
      'variantOptions',
      'selectedVariant',
      'ratingValue',
      'ratingCount',
      'reviewCount',
      'availability',
      'inStock',
      'requiresShipping',
    ] as const

    for (const field of requiredFields) {
      const incomplete = { ...sourceProduct }
      Reflect.deleteProperty(incomplete, field)
      expect(isCapturedProductDetail(incomplete as Product), field).toBe(false)
    }

    expect(isCapturedProductDetail({ ...sourceProduct, sourceUrl: sourceProduct.sourceUrl!.replace('https://shop.app', 'https://example.invalid') })).toBe(false)
    expect(isCapturedProductDetail({ ...sourceProduct, onlineStoreUrl: sourceProduct.onlineStoreUrl!.replace('https://', 'http://') })).toBe(false)
    expect(isCapturedProductDetail({ ...sourceProduct, variantOptions: [] })).toBe(false)
    expect(isCapturedProductDetail({ ...sourceProduct, selectedVariant: 'Not a captured variant' })).toBe(false)
  })

  it('renders the source homepage content and exact observed rail density', () => {
    const page = mountAt()

    expect(page.get('.shop-wordmark svg').attributes('aria-label')).toBe('Shop')
    expect(page.findAll('.category-group')).toHaveLength(7)
    expect(brandSections.map((section) => section.brands.length)).toEqual([10, 10, 10, 6, 4, 4])
    expect(page.find('.overlay').exists()).toBe(false)
  })

  it('uses URL pages for primary navigation instead of fabricated drawers', async () => {
    const page = mountAt()
    await page.findAll('button[aria-label="Explore"]')[0]!.trigger('click')
    await settle()

    expect(window.location.pathname).toBe('/categories')
    expect(page.get('.explore-page h1').text()).toBe('Explore')
    expect(page.find('.drawer').exists()).toBe(false)

    await page.findAll('button[aria-label="View Cart"]')[0]!.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/cart')
    expect(page.get('.empty-cart').text()).toContain('Your cart is empty')
  })

  it('opens the omnibox, focuses it, and routes a suggestion to results', async () => {
    const page = mountAt()
    await page.get('.hero-search').trigger('click')
    await settle()

    expect(page.find('.search-layer').exists()).toBe(true)
    expect(document.activeElement).toBe(page.get('.search-form input').element)
    expect(page.findAll('.search-suggestions > button')).toHaveLength(3)
    expect(page.get('.search-disclaimer').attributes('href')).toBe('https://www.shopify.com/legal/privacy/consumers')

    const beautySuggestion = page.findAll('.search-suggestions > button').find((button) => button.text().includes('K-beauty'))
    expect(beautySuggestion).toBeDefined()
    await beautySuggestion!.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/search/results')
    expect(new URLSearchParams(window.location.search).get('query')).toBe('K-beauty skincare for sensitive skin')
    expect(page.findAll('.result-product')).toHaveLength(12)
    expect(page.get('.result-product strong').text()).toContain('Fenty')
  })

  it('expands the hero search at its document position without scrolling on focus', async () => {
    const page = mountAt()
    const trigger = page.get('.hero-search').element as HTMLButtonElement
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ top: 228, left: 400, width: 512, height: 64, bottom: 292 } as DOMRect)
    vi.stubGlobal('scrollY', 100)
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await page.get('.hero-search').trigger('click')
    await settle()

    expect(page.get('.search-layer').classes()).toContain('search-layer--home')
    expect(page.get('.search-layer').attributes('style')).toContain('--search-top: 328px')
    expect(page.get('.search-layer').attributes('style')).toContain('--search-left: 656px')
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    await page.get('.desktop-search-dismiss').trigger('click')
    await settle()
    expect(document.activeElement).toBe(trigger)
  })

  it('reveals sticky search when the hero input leaves view and keeps the opening origin stable', async () => {
    const page = mountAt()
    const trigger = page.get('.hero-search').element as HTMLButtonElement
    const bounds = vi.spyOn(trigger, 'getBoundingClientRect')
    bounds.mockReturnValue({ top: 10, left: 400, width: 512, height: 64, bottom: 74 } as DOMRect)
    window.dispatchEvent(new Event('scroll'))
    await settle()
    expect(page.find('.sticky-search').exists()).toBe(false)
    await page.get('.hero-search').trigger('click')
    bounds.mockReturnValue({ top: -80, left: 400, width: 512, height: 64, bottom: -16 } as DOMRect)
    window.dispatchEvent(new Event('scroll'))
    await settle()
    expect(page.find('.sticky-search').exists()).toBe(true)
    expect(page.get('.search-layer').classes()).toContain('search-layer--home')
    await page.get('.desktop-search-dismiss').trigger('click')
    await page.get('.sticky-search').trigger('click')
    await settle()
    expect(page.get('.search-layer').classes()).toContain('search-layer--sticky')
    expect(page.get('.sticky-search').classes()).toContain('is-expanded')
    await page.get('.search-form input').trigger('keydown', { key: 'Escape' })
    await settle()
    expect(page.find('.search-layer').exists()).toBe(false)
    expect(document.activeElement).toBe(page.get('.sticky-search').element)
  })

  it('opens non-home search using the bottom-anchored layout', async () => {
    const page = mountAt('/categories')
    await page.get('.sticky-search').trigger('click')
    await settle()
    expect(page.get('.search-layer').classes()).toContain('search-layer--sticky')
    expect(page.get('.search-layer').classes()).not.toContain('search-layer--home')
  })

  it('keeps every official suggestion and recommended merchant actionable', async () => {
    const page = mountAt()
    for (const expectation of [
      { label: 'Wrinkle-free clothes for travel', product: 'Cashmere' },
      { label: 'Fun, easy to learn games for pre-teens', product: 'Trampoline' },
    ]) {
      window.history.replaceState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()
      await page.get('.hero-search').trigger('click')
      const suggestion = page.findAll('.search-suggestions > button').find((button) => button.text().includes(expectation.label))!
      await suggestion.trigger('click')
      await settle()
      expect(page.findAll('.result-product').length).toBeGreaterThan(0)
      expect(page.findAll('.result-product').some((card) => card.text().includes(expectation.product))).toBe(true)
    }

    window.history.replaceState({}, '', '/search/results?query=shoes')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    await page.findAll('.merchant-card')[0]!.trigger('click')
    await settle()
    expect(new URLSearchParams(window.location.search).get('query')).toBe('Amberjack')
    expect(page.findAll('.result-product').length).toBeGreaterThan(0)
  })

  it('uses distinct product sets for each related search', async () => {
    const page = mountAt('/search/results?query=shoes')
    const resultSignatures: string[] = []
    for (const term of [
      'running shoes for men',
      "women's casual sneakers",
      "kids' sports shoes",
      'leather dress shoes',
      'waterproof hiking boots',
      'slip-on loafers for men',
    ]) {
      const related = page.findAll('.related-searches > button').find((button) => button.text().includes(term))!
      await related.trigger('click')
      await settle()
      const products = page.findAll('.result-product strong').map((item) => item.text())
      expect(products.length).toBeGreaterThan(0)
      resultSignatures.push(products.join('|'))
    }
    expect(new Set(resultSignatures).size).toBe(resultSignatures.length)
  })

  it('shows persisted history and resumes a selected search', async () => {
    const now = Date.now()
    localStorage.setItem('shop-search-history', JSON.stringify([
      { query: 'linen bedding', searchedAt: now - 8 * 60_000 },
      { query: 'trail shoes', searchedAt: now - 2 * 60 * 60_000 },
    ]))
    const page = mountAt()
    await page.get('.hero-search').trigger('click')
    await page.get('.desktop-history-button').trigger('click')
    await settle()

    expect(page.get('.history-layer').text()).toContain('linen bedding')
    expect(page.get('.history-layer').text()).toContain('trail shoes')
    expect(page.get('.history-layer').text()).toContain('8 min ago')
    expect(page.get('.history-layer').text()).toContain('2 hrs ago')

    await page.findAll('.history-list > button')[0]!.trigger('click')
    await settle()
    expect(page.find('.history-layer').exists()).toBe(false)
    expect(window.location.pathname).toBe('/search/results')
    expect(new URLSearchParams(window.location.search).get('query')).toBe('linen bedding')
  })

  it('submits an attached image as a visual search', async () => {
    const page = mountAt()
    await page.get('.hero-search').trigger('click')
    const input = page.get('input[type="file"]')
    const file = new File(['image'], 'reference.png', { type: 'image/png' })
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')

    expect(page.get('.search-preview img').attributes('src')).toContain('blob:http://localhost')
    await page.get('.search-form').trigger('submit')
    await settle()
    expect(new URLSearchParams(window.location.search).get('query')).toBe('Visual matches')
    expect(new URLSearchParams(window.location.search).get('visual')).toMatch(/^\d+$/)
    expect(page.find('.search-preview').exists()).toBe(false)
    expect(page.findAll('.result-product').length).toBeGreaterThan(0)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/shop-image')
  })

  it('keeps image-result fingerprints stable in the URL and differentiates uploaded content', async () => {
    const page = mountAt()
    const submitImage = async (content: string, name: string) => {
      await page.get('.hero-search').trigger('click')
      const input = page.get('input[type="file"]')
      const file = new File([content], name, { type: 'image/png' })
      Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
      await input.trigger('change')
      await page.get('.search-form').trigger('submit')
      await settle()
      return new URLSearchParams(window.location.search).get('visual')
    }

    const firstFingerprint = await submitImage('first-image-content', 'first.png')
    const firstResult = page.get('.result-product strong').text()
    window.history.replaceState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    const secondFingerprint = await submitImage('second-image-content', 'second.png')
    const secondResult = page.get('.result-product strong').text()

    expect(firstFingerprint).not.toBe(secondFingerprint)
    expect([firstResult, firstFingerprint]).not.toEqual([secondResult, secondFingerprint])
  })

  it('filters results to on-sale products and exposes the category sheet', async () => {
    const page = mountAt('/search/results?query=shoes')
    expect(page.findAll('.result-product')).toHaveLength(18)

    const saleButton = page.findAll('.filters-strip > button').find((button) => button.text().trim() === 'On sale')
    expect(saleButton).toBeDefined()
    await saleButton!.trigger('click')
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(6)

    const categoryButton = page.findAll('.filters-strip > button').find((button) => button.text().includes('Category'))
    await categoryButton!.trigger('click')
    expect(page.findAll('.filter-options--category .category-choice-row')).toHaveLength(13)
    expect(page.findAll('.filter-options--category input[type="radio"]')).toHaveLength(2)
    const beauty = page.findAll('.filter-options--category .category-choice-row').find((button) => button.text().includes('Beauty'))
    expect(beauty).toBeDefined()
    await beauty!.trigger('click')
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    expect(page.find('.filter-popover').exists()).toBe(false)
    expect(categoryButton!.text()).toContain('Beauty')
  })

  it('renders every source filter popover with its complete control set', async () => {
    const page = mountAt('/search/results?query=shoes')
    const open = async (label: string) => {
      const trigger = page.findAll('.filters-strip > button').find((button) => button.text().includes(label))
      expect(trigger).toBeDefined()
      await trigger!.trigger('click')
      await settle()
    }
    const close = async () => {
      await page.findAll('.filter-actions button')[1]!.trigger('click')
      await settle()
    }

    await open('Ratings')
    expect(page.findAll('.filter-options--ratings input[type="radio"]')).toHaveLength(5)
    await close()

    await open('Gender')
    expect(page.findAll('.filter-options--gender input[type="radio"]')).toHaveLength(2)
    await close()

    await open('Ships to')
    expect(page.findAll('.filter-options--shipping option').length).toBeGreaterThan(200)
    expect(page.get('.filter-options--shipping .address-signin').text()).toContain('Sign in')
    await page.get('.filter-options--shipping select').setValue('Hong Kong SAR')
    expect(page.get('.filter-options--shipping .country-select > span').text()).toBe('Hong Kong SAR')
    await close()

    await open('Size')
    expect(page.findAll('.filter-options--size .filter-choice-row')).toHaveLength(23)
    await close()

    await open('Color')
    expect(page.findAll('.filter-options--color .filter-choice-row')).toHaveLength(15)
    expect(page.findAll('.filter-options--color .color-swatch')).toHaveLength(15)
    await close()

    await open('Price')
    expect(page.findAll('.filter-options--price input[type="range"]')).toHaveLength(2)
    expect(page.findAll('.filter-options--price .price-inputs input')).toHaveLength(2)
    await close()

    await open('Sort by')
    expect(page.findAll('.filter-options--sort input[type="radio"]')).toHaveLength(3)
  })

  it('matches the full filter drawer and resets its expanded controls', async () => {
    const page = mountAt('/search/results?query=shoes')
    await page.get('.filter-icon').trigger('click')
    await settle()

    const drawer = page.get('.filter-popover--all')
    expect(drawer.attributes('aria-label')).toBe('Filters')
    expect(document.activeElement).toBe(drawer.element)
    expect(drawer.findAll('.filter-section')).toHaveLength(11)
    expect(drawer.findAll('.filter-section--sort input[type="radio"]')).toHaveLength(3)
    expect(drawer.findAll('.filter-section--gender input[type="radio"]')).toHaveLength(2)
    expect(drawer.findAll('.filter-section--ratings input[type="radio"]')).toHaveLength(5)
    expect(drawer.findAll('.filter-section--price input[type="range"]')).toHaveLength(2)

    const sizeAccordion = drawer.findAll('.filter-accordion-button').find((button) => button.text().trim() === 'Size')
    expect(sizeAccordion).toBeDefined()
    await sizeAccordion!.trigger('click')
    expect(drawer.findAll('.filter-section--accordion .filter-choice-row')).toHaveLength(23)
    const firstSize = drawer.find('.filter-section--accordion .filter-choice-row')
    await firstSize.trigger('click')
    expect(firstSize.attributes('aria-pressed')).toBe('true')

    const onSaleSwitch = drawer.findAll('[role="switch"]').find((button) => button.attributes('aria-label') === 'On sale')
    expect(onSaleSwitch).toBeDefined()
    await onSaleSwitch!.trigger('click')
    expect(onSaleSwitch!.attributes('aria-checked')).toBe('true')

    await drawer.findAll('.filter-actions button')[0]!.trigger('click')
    await settle()
    expect(firstSize.attributes('aria-pressed')).toBe('false')
    expect(onSaleSwitch!.attributes('aria-checked')).toBe('false')
  })

  it('filters explicit inventory and destinations without treating missing metadata as global shipping', async () => {
    const unavailable = categoryProducts[0]!
    const restricted = categoryProducts[1]!
    const previousAvailability = unavailable.inStock
    const previousDestinations = categoryProducts.map((product) => product.shipsTo)
    unavailable.inStock = false
    categoryProducts.forEach((product) => { product.shipsTo = ['HK', 'US'] })
    restricted.shipsTo = ['US']

    try {
      const page = mountAt('/search/results?query=home')
      expect(page.findAll('.result-product')).toHaveLength(12)

      await page.get('.filter-icon').trigger('click')
      await settle()
      const inStockSwitch = page.get('button[role="switch"][aria-label="In-stock"]')
      await inStockSwitch.trigger('click')
      await settle()
      expect(page.findAll('.result-product')).toHaveLength(11)
      expect(page.findAll('.result-product').some((card) => card.text().includes(unavailable.name))).toBe(false)

      await inStockSwitch.trigger('click')
      await page.get('.filter-section--shipping select').setValue('Hong Kong SAR')
      await settle()
      expect(page.findAll('.result-product')).toHaveLength(11)
      expect(page.findAll('.result-product').some((card) => card.text().includes(restricted.name))).toBe(false)
      expect(page.findAll('.result-product').some((card) => card.text().includes(unavailable.name))).toBe(true)

      await page.get('.filter-section--shipping select').setValue('United States')
      await settle()
      expect(page.findAll('.result-product')).toHaveLength(12)
    } finally {
      if (previousAvailability === undefined) delete unavailable.inStock
      else unavailable.inStock = previousAvailability
      categoryProducts.forEach((product, index) => {
        const destinations = previousDestinations[index]
        if (destinations === undefined) delete product.shipsTo
        else product.shipsTo = destinations
      })
    }
  })

  it('uses explicit shoe facets for destination, size, gender, color, and seller filters', async () => {
    const page = mountAt('/search/results?query=shoes')

    const shipping = page.findAll('.filters-strip > button').find((button) => button.text().includes('Ships to'))!
    await shipping.trigger('click')
    await page.get('.filter-options--shipping select').setValue('China')
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(1)
    expect(page.get('.result-product strong').text()).toBe('Smart II - Barefoot Shoes')

    await shipping.trigger('click')
    await page.get('.filter-options--shipping select').setValue('Hong Kong SAR')
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    const size = page.findAll('.filters-strip > button').find((button) => button.text().trim().startsWith('Size'))!
    await size.trigger('click')
    await page.findAll('.filter-options--size .filter-choice-row').at(-1)!.trigger('click')
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    await settle()
    expect(page.findAll('.result-product').length).toBeGreaterThan(0)
    expect(page.findAll('.result-product').every((card) => /Lems|Revive|Kourt|Nine2Five|Saguaro/.test(card.text()))).toBe(true)

    await page.get('.filter-icon').trigger('click')
    await page.findAll('.filter-actions button')[0]!.trigger('click')
    const gender = page.findAll('.filters-strip > button').find((button) => button.text().includes('Gender'))!
    await gender.trigger('click')
    await page.findAll('.filter-options--gender input')[1]!.setValue(true)
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    await settle()
    expect(page.findAll('.result-product').some((card) => card.text().includes('Whimbrel'))).toBe(true)
    expect(page.findAll('.result-product').some((card) => card.text().includes('Crossover'))).toBe(false)

    await page.get('.filter-icon').trigger('click')
    await page.findAll('.filter-actions button')[0]!.trigger('click')
    const color = page.findAll('.filters-strip > button').find((button) => button.text().includes('Color'))!
    await color.trigger('click')
    const gold = page.findAll('.filter-options--color .filter-choice-row').find((button) => button.text().includes('Gold'))!
    await gold.trigger('click')
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(1)
    expect(page.get('.result-product strong').text()).toContain('Whimbrel')

    await page.get('.filter-icon').trigger('click')
    await page.findAll('.filter-actions button')[0]!.trigger('click')
    const sellsFrom = page.findAll('.filters-strip > button').find((button) => button.text().includes('Sells from'))!
    await sellsFrom.trigger('click')
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(0)
  })

  it('renders the original empty cart and offers states at their routes', () => {
    const cartPage = mountAt('/cart')
    expect(cartPage.get('.empty-cart img').attributes('src')).toBe('/assets/images/empty-cart.png')
    expect(cartPage.get('.empty-cart').text()).toContain('Add products here to checkout')
    expect(cartPage.get('.cart-recent h2').text()).toBe('Recently viewed')
    expect(cartPage.findAll('.cart-recent article')).toHaveLength(2)
    expect(cartPage.findAll('.cart-recent article').map((product) => product.get('strong').text())).toEqual(['Lems Primal Zen Asphalt', 'LOGO RAINBOW VINTAGE TRUCKER HAT'])
    expect(cartPage.findAll('.cart-recent article')[1]!.get('img').attributes('src')).toContain('VCFL_LO_R-NPNK-FR01.jpg')
    expect(cartPage.findAll('.cart-recent article')[1]!.text()).toContain('HK$370.00')
    expect(cartPage.findAll('.cart-recent article')[1]!.text()).toContain('HK$462.00')
    expect(cartPage.findAll('.cart-recent article')[1]!.text()).toContain('20% off')
    cartPage.unmount()

    const offersPage = mountAt('/offers')
    expect(offersPage.get('.offers-copy h1').text()).toBe('Unlock all your deals')
    expect(offersPage.get('.offers-copy').text()).toContain('1000s of top')
    expect(offersPage.get('.offers-copy a').attributes('href')).toBe('/shop-cash-terms')
  })

  it('matches the standalone language settings locale list and keeps updates on the settings route', async () => {
    const page = mountAt('/language-settings?locale=fr')

    expect(document.documentElement.lang).toBe('fr-CA')
    expect(page.get('.language-page h1').text()).toBe('Langue')
    expect(page.get('.language-page > p').text()).toBe('Mettez à jour la langue que vous souhaitez utiliser avec Shop.')
    const languageOptions = page.findAll('.language-select option')
    expect(languageOptions).toHaveLength(17)
    expect(languageOptions[0]!.text()).toBe('Langue')
    expect(languageOptions[0]!.attributes()).toHaveProperty('disabled')
    expect(languageOptions.slice(1).map((option) => option.text())).toEqual([
      'Čeština', 'Dansk', 'Deutsch', 'English', 'Español', 'Suomi', 'Français', 'Italiano',
      '日本語', 'Lietuvių', 'Norsk (bokmål)', 'Nederlands', 'Polski', 'Português', 'Română', 'Svenska',
    ])
    expect(page.get('.language-page form > button').text()).toBe('Mettre à jour')

    await page.get('.language-select select').setValue('de')
    await page.get('.language-page form').trigger('submit')
    await settle()

    expect(window.location.pathname).toBe('/language-settings')
    expect(window.location.search).toBe('?locale=de')
    expect(page.get('.language-page h1').text()).toBe('Sprache')
    expect(document.documentElement.lang).toBe('de-AT')
    expect(localStorage.getItem('shop-language')).toBe('Deutsch')
  })

  it('renders the complete Shop Rewards terms route and its source language control', async () => {
    const page = mountAt('/shop-cash-terms')

    expect(document.title).toBe('Shop Rewards Terms (Global)')
    expect(page.find('.terms-main > .terms-page').exists()).toBe(true)
    expect(page.get('.terms-heading').text()).toContain('Last modified: July 13, 2026')
    expect(page.findAll('.terms-page > section')).toHaveLength(12)
    expect(page.findAll('.terms-page h2').map((heading) => heading.text())).toEqual([
      'Shop Rewards Terms (Global)', 'Part I (Global Terms)', '1. Eligibility', '2. Earning Shop Cash', '3. Redemption, Timing, and Expiration',
      '4. Shop Cash Restrictions', '5. Shopify Rights', '6. Disclaimer', 'Part II (Regional Terms)',
      'A. Australia', 'B. Canada', 'C. United States',
    ])
    expect(page.get('.terms-page').text()).toContain('Shopify Commerce Singapore Pte. Ltd')
    expect(page.get('.terms-page').text()).toContain('one hundred and eighty (180) days of Shop Cash Inactivity')
    expect(page.findAll('.terms-page a').map((link) => link.attributes('href'))).toEqual([
      'https://shop.app/terms-of-service',
      'https://www.shopify.com/legal/privacy/app-users',
      'https://help.shop.app/en/shop',
      'https://help.shop.app/shop/shop-cash',
      'https://shop.app/terms-of-service',
    ])
    expect(page.findAll('.terms-language option')).toHaveLength(33)
    expect(localizedTermsLocales).toHaveLength(20)

    await page.get('.terms-language select').setValue('fr')
    await settle()
    expect(window.location.pathname).toBe('/shop-cash-terms')
    expect(window.location.search).toBe('?locale=fr')
    expect(document.documentElement.lang).toBe('fr')
    expect(page.get('.terms-language > span').text()).toBe('Français')
    expect(document.title).toBe('Conditions de Shop Rewards (Générales)')
    expect(page.findAll('.terms-page > section')).toHaveLength(14)
    expect(page.get('.terms-heading h2').text()).toBe('Conditions de Shop Rewards (Générales)')
    expect(page.get('.terms-heading').text()).toContain('Dernière mise à jour : le 7 juillet 2026')

    await page.get('.terms-language select').setValue('zh-CN')
    await settle()
    expect(window.location.search).toBe('?locale=zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
    expect(page.get('.terms-language > span').text()).toBe('English')
    expect(page.get('.terms-language select').element).toHaveProperty('value', 'en')
    expect(page.get('.terms-heading h2').text()).toBe('Shop Rewards Terms (Global)')
  })

  it('keeps every captured terms locale within the audited legal-markup allowlist', () => {
    const allowedTags = new Set(['a', 'em', 'li', 'p', 'strong', 'ul'])

    for (const locale of loginLocaleOptions) {
      const sections = termsForLocale(locale.locale)
      expect(sections.length).toBeGreaterThanOrEqual(12)
      for (const section of sections) {
        const tags = [...section.html.matchAll(/<\/?([a-z0-9-]+)/gi)].map((match) => match[1]!.toLowerCase())
        const attributes = [...section.html.matchAll(/\s([a-z-]+)=/gi)].map((match) => match[1]!.toLowerCase())
        const links = [...section.html.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]!)
        expect(tags.every((tag) => allowedTags.has(tag))).toBe(true)
        expect(attributes.every((attribute) => attribute === 'href')).toBe(true)
        expect(links.every((href) => href.startsWith('https://'))).toBe(true)
      }
    }
  })

  it('routes unauthenticated deal and saved actions to the standalone account page', async () => {
    const page = mountAt('/offers')
    await page.get('.offers-copy > button').trigger('click')
    await settle()

    expect(window.location.pathname).toBe('/accounts/login')
    expect(page.find('.side-nav').exists()).toBe(false)
    expect(page.get('.account-card h2').text()).toBe('登录 Shop')
  })

  it('validates account email and renders the next login state', async () => {
    const page = mountAt('/accounts/login')
    await page.get('.account-card form').trigger('submit')
    expect(page.get('.account-error').text()).toBe('请输入有效的邮箱')

    await page.get('#email').setValue('shopper@example.com')
    await page.get('.account-card form').trigger('submit')
    await settle()
    expect(page.get('.account-card h1').text()).toBe('查看您的邮箱')
    expect(page.get('.account-card').text()).toContain('shopper@example.com')
  })

  it('closes search and filter layers with Escape', async () => {
    const page = mountAt()
    await page.get('.hero-search').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(page.find('.search-layer').exists()).toBe(false)

    window.history.replaceState({}, '', '/search/results?query=shoes')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    await page.get('.filter-icon').trigger('click')
    expect(page.find('.filter-popover').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(page.find('.filter-popover').exists()).toBe(false)
  })

  it('discards an unsubmitted search draft when the overlay closes', async () => {
    const page = mountAt('/search/results?query=shoes')
    const originalProducts = page.findAll('.result-product').map((product) => product.get('strong').text())
    expect(page.get('.sticky-search span').text()).toBe('shoes')

    await page.get('.sticky-search').trigger('click')
    await page.get('.search-form input').setValue('beauty')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()

    expect(window.location.search).toBe('?query=shoes')
    expect(document.title).toBe('shoes - Shop')
    expect(page.findAll('.result-product').map((product) => product.get('strong').text())).toEqual(originalProducts)

    await page.get('.sticky-search').trigger('click')
    expect((page.get('.search-form input').element as HTMLInputElement).value).toBe('shoes')
  })

  it('changes the result corpus for category-aware searches and renders an empty state for unknown terms', async () => {
    const page = mountAt('/search/results?query=home')
    expect(page.findAll('.result-product')).toHaveLength(12)
    expect(page.get('.result-product strong').text()).toBe('Ceramic Nonstick Perfect Pot 6.5 qt.')

    window.history.replaceState({}, '', '/search/results?query=beauty')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(12)
    expect(page.get('.result-product strong').text()).toContain('Fenty')

    window.history.replaceState({}, '', '/search/results?query=term-that-does-not-exist')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(0)
    expect(page.get('.results-empty').text()).toContain('No matching products')
  })

  it('sorts result prices and resets all active filters', async () => {
    const page = mountAt('/search/results?query=shoes')
    const sortButton = page.findAll('.filters-strip > button').find((button) => button.text().includes('Sort by'))
    expect(sortButton).toBeDefined()
    await sortButton!.trigger('click')
    const lowToHigh = page.findAll('.filter-popover input[type="radio"]').find((input) => input.attributes('value') === 'Lowest ➞ Highest Price')
    expect(lowToHigh).toBeDefined()
    await lowToHigh!.setValue(true)
    await page.findAll('.filter-actions button')[1]!.trigger('click')
    await settle()

    expect(page.get('.result-product b').text()).toBe('US$49.95')
    expect(sortButton!.text()).toContain('Lowest ➞ Highest Price')

    const saleButton = page.findAll('.filters-strip > button').find((button) => button.text().trim() === 'On sale')
    await saleButton!.trigger('click')
    expect(page.findAll('.result-product')).toHaveLength(6)
    await page.get('.filter-icon').trigger('click')
    await page.findAll('.filter-actions button')[0]!.trigger('click')
    await settle()
    expect(page.findAll('.result-product')).toHaveLength(18)
    expect(page.get('.result-product b').text()).toBe('US$104.00')
  })

  it('sorts mixed currencies by their Hong Kong viewer value', async () => {
    const page = mountAt('/search/results?query=shoes')
    const sortButton = page.findAll('.filters-strip > button').find((button) => button.text().includes('Sort by'))!
    await sortButton.trigger('click')
    const lowToHigh = page.findAll('.filter-popover input[type="radio"]').find((input) => input.attributes('value') === 'Lowest ➞ Highest Price')!
    await lowToHigh.setValue(true)
    await settle()

    const names = page.findAll('.result-product strong').map((item) => item.text())
    expect(names.indexOf('Smart II - Barefoot Shoes')).toBeLessThan(names.indexOf('Lems Primal 3 Eclipse'))
  })

  it('renders all Explore shelves with the shared download footer', () => {
    const page = mountAt('/categories')
    expect(page.findAll('.catalog-section')).toHaveLength(3)
    expect(page.findAll('.catalog-card')).toHaveLength(36)
    expect(page.get('.footer .qr-code').attributes('src')).toBe('/assets/images/shop-download-qr.png')
    expect(page.findAll('.download-badges a')).toHaveLength(2)
  })

  it('keeps card-only captures presentational while opening verified categories and stores', async () => {
    const page = mountAt('/categories')
    const cardOnlyProduct = page.get('.catalog-card')
    expect(cardOnlyProduct.attributes('role')).toBeUndefined()
    expect(cardOnlyProduct.attributes('tabindex')).toBeUndefined()
    await cardOnlyProduct.trigger('click')
    await cardOnlyProduct.trigger('keydown', { key: 'Enter' })
    await settle()
    expect(window.location.pathname).toBe('/categories')

    window.history.replaceState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    const unavailableCategory = page.findAll('.heading-button').find((heading) => heading.text() === 'Women')!
    expect(unavailableCategory.element.tagName).toBe('DIV')
    await unavailableCategory.trigger('click')
    expect(window.location.pathname).toBe('/')

    const verifiedCategory = page.findAll('.heading-button').find((heading) => heading.text() === 'Food & drinks')!
    expect(verifiedCategory.element.tagName).toBe('BUTTON')
    await verifiedCategory.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/categories/251/food-drinks')
    expect(page.get('.category-page h1').text()).toBe('Food & Drinks')
    expect(page.findAll('.category-product-shelf')).toHaveLength(2)
    expect(page.find('.category-more').exists()).toBe(false)
    expect(page.findAll('button[aria-label="Explore"]')[0]!.classes()).toContain('is-active')

    window.history.replaceState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    const unavailableStore = page.findAll('.brand-card__open').find((card) => !card.classes().includes('is-interactive'))!
    expect(unavailableStore.element.tagName).toBe('DIV')
    await unavailableStore.trigger('click')
    expect(window.location.pathname).toBe('/')

    const gathre = page.findAll('.brand-card__open').find((card) => card.text().includes('Gathre'))!
    expect(gathre.element.tagName).toBe('BUTTON')
    await gathre.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/m/gathre')
    expect(page.get('.brand-page__identity').text()).toContain('1607 Reviews')
  })

  it('renders every captured category with its source topics, stories, shelves, and follow-on categories', async () => {
    const entries = Object.values(categoryDetails)
    const page = mountAt(entries[0]!.path)

    for (const detail of entries) {
      window.history.replaceState({}, '', detail.path)
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()

      expect(page.get('.category-detail-header h1').text()).toBe(detail.title)
      expect(page.findAll('.category-topic-rail > button')).toHaveLength(detail.topics.length)
      expect(page.findAll('.category-editorials > button')).toHaveLength(3)
      expect(page.findAll('.category-product-shelf')).toHaveLength(2)
      expect(page.findAll('.category-product-shelf')[0]!.findAll('.category-mini-product')).toHaveLength(12)
      expect(page.findAll('.category-product-shelf')[1]!.findAll('.category-mini-product')).toHaveLength(12)
      const editorialImages = page.findAll('.category-editorials img')
      const productImages = page.findAll('.category-mini-product img')
      expect(editorialImages[0]!.attributes('data-fallback')).not.toBe('/assets/images/categories/home-1.webp')
      expect(editorialImages[0]!.attributes('data-fallback')).not.toBe(editorialImages[1]!.attributes('data-fallback'))
      expect(productImages[0]!.attributes('data-fallback')).not.toBe(productImages[1]!.attributes('data-fallback'))
      await editorialImages[0]!.trigger('error')
      await productImages[0]!.trigger('error')
      expect(editorialImages[0]!.attributes('src')).toBe(editorialImages[0]!.attributes('data-fallback'))
      expect(productImages[0]!.attributes('src')).toBe(productImages[0]!.attributes('data-fallback'))
      expect(page.findAll('.category-mini-product').every((card) => card.attributes('role') === undefined)).toBe(true)
      expect(page.findAll('.category-link-showcase button')).toHaveLength(4)
      expect(page.find('.category-more').exists()).toBe(false)
      expect(page.text()).toContain(detail.shelves[0]!.products[0]!.name)
      expect(page.text()).toContain(detail.shelves[1]!.products[0]!.name)
    }
  })

  it('rejects unknown and ID/slug-mismatched category routes', async () => {
    const page = mountAt('/categories/999/not-real')

    for (const path of [
      '/categories/999/not-real',
      '/categories/999/food-drinks',
      '/categories/251/pet-supplies',
      '/categories/women',
      '/categories/1/women',
      '/categories/251/food-drinks/extra',
    ]) {
      window.history.replaceState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()
      expect(page.get('.product-not-found h1').text()).toBe('Category not found')
      expect(page.find('.category-product-shelf').exists()).toBe(false)
    }
  })

  it('rejects synthetic, unknown, and mismatched product routes', async () => {
    const page = mountAt('/products/1/ceramic-nonstick-perfect-pot-6-5-qt')
    expect(page.get('.product-not-found h1').text()).toBe('Product not found')
    expect(page.find('.product-purchase').exists()).toBe(false)

    for (const path of [
      '/products/not-real/highchair-mat',
      '/products/2082556969029/baby-changing-mat',
      '/products/2083782361157/highchair-mat',
    ]) {
      window.history.replaceState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()
      expect(page.get('.product-not-found h1').text()).toBe('Product not found')
    }
  })

  it('discards unverified cart payloads and remembers only verified product details', async () => {
    localStorage.setItem('shop-cart', JSON.stringify([{
      key: 'fabricated-line',
      product: categoryProducts[0],
      image: categoryProducts[0]!.image,
      quantity: 2,
      selectedOptions: { Color: 'Invented' },
    }]))
    let page = mountAt('/cart')
    expect(page.find('.empty-cart').exists()).toBe(true)
    expect(page.find('.filled-cart').exists()).toBe(false)

    const verifiedProduct = gathreProducts[0]!
    const selectedOptions = Object.fromEntries((verifiedProduct.variantOptions || []).map((option) => [option.name, option.values[0]!.name]))
    localStorage.setItem('shop-cart', JSON.stringify([{
      key: 'forged-but-colliding-line',
      product: { ...verifiedProduct, name: 'Forged product name', price: 'HK$0.01' },
      image: verifiedProduct.image,
      quantity: 1,
      selectedOptions,
    }]))
    page.unmount()
    page = mountAt('/cart')
    expect(page.get('.filled-cart article h2').text()).toBe(verifiedProduct.name)
    expect(page.get('.filled-cart article strong').text()).toBe(verifiedProduct.price)

    localStorage.removeItem('shop-cart')
    page.unmount()
    page = mountAt('/products/2082556969029/highchair-mat')
    window.history.replaceState({}, '', '/cart')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    expect(page.get('.cart-recent article strong').text()).toBe('Highchair Mat')
    expect(page.get('.cart-recent article').attributes('role')).toBe('link')
  })

  it('supports store follow, information panel, and sale filtering', async () => {
    const page = mountAt('/m/gathre')
    const heroVideo = page.get('.store-hero-video')
    expect(heroVideo.attributes('src')).toContain('5e2a731b454449e084a69494eed186e2.SD-480p')
    expect(heroVideo.attributes('poster')).toContain('1757699625/thumbnail.png')
    expect(page.get('.brand-page__identity > img').attributes('src')).toContain('/files/logo.png?v=1613510622')
    expect(page.get('.brand-page__identity').text()).toContain('4.7')
    expect(page.get('.brand-page__identity').text()).toContain('1607 Reviews')
    expect(page.findAll('.store-quick-links > button').map((button) => button.text())).toEqual(['Shop all', 'Mats', 'Play', 'New!'])
    expect(page.findAll('.store-collections > button').map((button) => button.text())).toEqual(['Bestsellers', 'New Arrivals', 'Play', 'ALL MATS'])

    const products = page.findAll('.store-results-grid .result-product')
    expect(products).toHaveLength(18)
    expect(products.slice(0, 4).map((product) => product.get('strong').text())).toEqual(['Baby Changing Mat', 'Highchair Mat', 'Midi', 'Micro+'])
    expect(products[0]!.text()).toContain('HK$160.00')
    expect(products[0]!.text()).toContain('(160)')

    const follow = page.get('.store-follow-button')
    await follow.trigger('click')
    expect(follow.text()).toBe('Following')
    expect(follow.attributes('aria-pressed')).toBe('true')

    await page.get('.store-menu-button').trigger('click')
    expect(page.get('.store-panel').attributes('aria-modal')).toBe('true')
    expect(page.get('.store-panel').text()).toContain('Policies')
    expect(page.findAll('.store-panel-links button')).toHaveLength(2)
    expect(page.get('.store-panel a[href="https://gathre.com"]').attributes('rel')).toBe('noreferrer')
    expect(page.find('.store-panel a[href="https://www.facebook.com/gathrecompany/"]').exists()).toBe(true)
    expect(page.find('.store-panel a[href="https://www.instagram.com/gathre/"]').exists()).toBe(true)
    expect(page.find('.store-panel a[href="mailto:hello@gathre.com"]').exists()).toBe(true)
    expect(page.find('.store-panel a[href="tel:888-474-0591"]').exists()).toBe(true)
    expect(page.get('.store-panel').text()).toContain('2575 W 400 N, Suite 100')

    await page.get('.store-reviews-open').trigger('click')
    await settle()
    expect(page.get('.store-panel').attributes('aria-label')).toBe('Gathre reviews')
    expect(page.findAll('.store-review-card')).toHaveLength(2)
    expect(page.get('.store-review-card').text()).toContain('Worth it!')
    await page.get('.store-panel-back').trigger('click')
    expect(page.get('.store-panel').attributes('aria-label')).toBe('Store information')

    const privacy = page.findAll('.store-panel-links button').find((button) => button.text().includes('Privacy policy'))!
    await privacy.trigger('click')
    await settle()
    expect(page.get('.store-panel').attributes('aria-label')).toBe('privacy policy')
    expect(page.get('.store-policy a[href="https://gathre.com/policies/privacy-policy"]').attributes('target')).toBe('_blank')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.get('.store-panel').attributes('aria-label')).toBe('Store information')

    const refund = page.findAll('.store-panel-links button').find((button) => button.text().includes('Refund policy'))!
    await refund.trigger('click')
    await settle()
    expect(page.get('.store-panel').attributes('aria-label')).toBe('refund policy')
    expect(page.get('.store-policy a[href="https://gathre.com/policies/refund-policy"]').attributes('rel')).toBe('noreferrer')
    await page.get('.store-panel-back').trigger('click')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.store-panel').exists()).toBe(false)

    const initialCount = page.findAll('.store-results-grid .result-product').length
    const sale = page.findAll('.store-filters > button').find((button) => button.text() === 'On sale')!
    await sale.trigger('click')
    expect(sale.attributes('aria-pressed')).toBe('true')
    expect(page.findAll('.store-results-grid .result-product').length).toBeLessThan(initialCount)
  })

  it('copies the canonical URL only for a verified store', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    let page = mountAt('/m/gathre')
    await page.get('.store-menu-button').trigger('click')
    await page.get('button[aria-label="Share Gathre"]').trigger('click')
    expect(writeText).toHaveBeenLastCalledWith('https://shop.app/m/gathre')

    page.unmount()
    page = mountAt('/m/snapper-rock')
    expect(page.get('.product-not-found h1').text()).toBe('Store not found')
    expect(page.find('.store-menu-button').exists()).toBe(false)
    expect(writeText).toHaveBeenCalledTimes(1)
  })

  it('applies store filter sheets, restores focus, and opens a store product', async () => {
    const page = mountAt('/m/gathre')
    const filterTrigger = page.get('button[aria-label="Store filters"]')
    ;(filterTrigger.element as HTMLElement).focus()
    await filterTrigger.trigger('click')
    await settle()

    const filterSheet = page.get('.store-filter-sheet')
    expect(filterSheet.attributes('aria-modal')).toBe('true')
    expect(filterSheet.findAll('button[role="switch"]')).toHaveLength(1)
    expect(filterSheet.findAll('input[type="checkbox"]')).toHaveLength(1)
    expect(filterSheet.findAll('input[type="range"]')).toHaveLength(2)
    expect(document.activeElement).toBe(filterSheet.element)

    const initialCount = page.findAll('.store-results-grid .result-product').length
    await filterSheet.get('input[aria-label="Store minimum price value"]').setValue('1000')
    await settle()
    expect(page.findAll('.store-results-grid .result-product').length).toBeLessThan(initialCount)

    await filterSheet.findAll('footer button')[0]!.trigger('click')
    await settle()
    expect(page.findAll('.store-results-grid .result-product')).toHaveLength(initialCount)
    await filterSheet.findAll('footer button')[1]!.trigger('click')
    await settle()
    expect(page.find('.store-filter-sheet').exists()).toBe(false)
    expect(document.activeElement).toBe(filterTrigger.element)

    const priceTrigger = page.findAll('.store-filters > button').find((button) => button.text().includes('Price'))!
    ;(priceTrigger.element as HTMLElement).focus()
    await priceTrigger.trigger('click')
    await settle()
    expect(page.get('.store-filter-sheet').attributes('aria-label')).toBe('Price')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.store-filter-sheet').exists()).toBe(false)
    expect(document.activeElement).toBe(priceTrigger.element)

    const sortTrigger = page.get('button[aria-label="Sort store products"]')
    ;(sortTrigger.element as HTMLElement).focus()
    await sortTrigger.trigger('click')
    await settle()
    expect(page.get('.store-filter-sheet').attributes('aria-label')).toBe('Sort by')
    expect(page.findAll('.store-sort-options input[type="radio"]')).toHaveLength(4)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.store-filter-sheet').exists()).toBe(false)
    expect(document.activeElement).toBe(sortTrigger.element)

    await sortTrigger.trigger('click')
    await settle()
    await page.findAll('.store-sort-options input[type="radio"]')[2]!.setValue(true)
    await page.get('.store-filter-sheet footer button:first-child').trigger('click')
    await settle()
    expect((page.findAll('.store-sort-options input[type="radio"]')[0]!.element as HTMLInputElement).checked).toBe(true)
    await page.findAll('.store-sort-options input[type="radio"]')[2]!.setValue(true)
    await page.get('.store-filter-sheet footer button:last-child').trigger('click')
    await settle()
    expect(page.get('.store-results-grid .result-product b').text()).toBe('HK$160.00')

    const firstProduct = page.get('.store-results-grid .result-product')
    const productName = firstProduct.get('strong').text()
    await firstProduct.trigger('click')
    await settle()
    expect(window.location.pathname).toMatch(/^\/products\/\d+\//)
    expect(page.get('.product-page__details h1').text()).toBe(productName)
  })

  it('filters Gathre products locally and keeps collection URLs on the store route', async () => {
    const page = mountAt('/m/gathre')
    const search = page.get('.store-products-section input[type="search"]')
    await search.setValue('Trampoline')
    await settle()
    expect(page.findAll('.store-results-grid .result-product')).toHaveLength(1)
    expect(page.get('.store-results-grid .result-product strong').text()).toBe('Trampoline')

    await search.setValue('')
    const mats = page.findAll('.store-quick-links > button').find((button) => button.text() === 'Mats')!
    await mats.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/m/gathre/collections/260514480197')
    expect(page.get('.brand-page__identity').text()).toContain('1607 Reviews')
    expect(page.findAll('.store-results-grid .result-product').length).toBeGreaterThan(0)
  })

  it('rejects uncaptured Gathre collection routes', async () => {
    const page = mountAt('/m/gathre/collections/not-real')

    for (const path of [
      '/m/gathre/collections/not-real',
      '/m/gathre/collections/260514480197/not-real',
      '/m/gathre/collections/260514480197/all-mats/extra',
    ]) {
      window.history.replaceState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()
      expect(page.get('.product-not-found h1').text()).toBe('Store not found')
      expect(page.find('.store-results-grid').exists()).toBe(false)
    }
  })

  it('makes the Gathre In-stock control depend on product inventory metadata', async () => {
    const unavailable = gathreProducts[0]!
    const previousAvailability = unavailable.inStock
    unavailable.inStock = false

    try {
      const page = mountAt('/m/gathre')
      expect(page.findAll('.store-results-grid .result-product')).toHaveLength(17)
      expect(page.findAll('.store-results-grid .result-product').some((card) => card.text().includes(unavailable.name))).toBe(false)

      const inStock = page.findAll('.store-filters > button').find((button) => button.text().trim() === 'In-stock')!
      expect(inStock.attributes('aria-pressed')).toBe('true')
      await inStock.trigger('click')
      await settle()
      expect(page.findAll('.store-results-grid .result-product')).toHaveLength(18)
      expect(page.findAll('.store-results-grid .result-product').some((card) => card.text().includes(unavailable.name))).toBe(true)
    } finally {
      unavailable.inStock = previousAvailability
    }
  })

  it('matches the Gathre product gallery and supports every product detail panel', async () => {
    const page = mountAt('/products/2083782361157/baby-changing-mat')
    const babyChangingMat = gathreProducts[0]!

    expect(window.location.pathname).toBe('/products/2083782361157/baby-changing-mat')
    expect(page.get('.product-page__details h1').text()).toBe('Baby Changing Mat')
    expect(page.findAll('.product-thumbnails > button')).toHaveLength(11)
    expect(page.findAll('.product-variants > button')).toHaveLength(18)
    expect(page.findAll('.product-variants > button.on-sale')).toHaveLength(4)
    expect(page.get('.product-variants legend strong').text()).toBe('Camel')
    expect(page.get('.product-low-stock').text()).toBe('Only 1 left')
    expect(page.get('.product-popular').text()).toBe('200+ bought in past month')
    expect(page.get('.product-purchase').attributes('href')).toBe(babyChangingMat.purchaseUrl)
    expect(page.get('.product-delivery > a').attributes('href')).toBe(`${babyChangingMat.onlineStoreUrl}?utm_source=shop_app`)
    expect(page.findAll('.product-review-rail > article')).toHaveLength(3)

    const actions = page.get('button[aria-label="More product actions"]')
    ;(actions.element as HTMLElement).focus()
    await actions.trigger('click')
    await settle()
    expect(page.get('.product-actions-popover').attributes('role')).toBe('menu')
    expect(page.get('.product-actions-popover a').text()).toBe('Contact Gathre')
    expect(page.get('.product-actions-popover a').attributes('href')).toContain('gathre.customerdesk.io')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.product-actions-popover').exists()).toBe(false)
    expect(document.activeElement).toBe(actions.element)

    const descriptionTrigger = page.get('.product-description > button')
    ;(descriptionTrigger.element as HTMLElement).focus()
    await descriptionTrigger.trigger('click')
    await settle()
    expect(page.get('.product-panel').attributes('aria-label')).toBe('Product description')
    expect(page.get('.product-page__details').attributes()).toHaveProperty('inert')
    expect(page.get('.product-panel').attributes()).not.toHaveProperty('inert')
    expect(page.get('.product-panel-description').text()).toContain('Measures: 14in x 22in')
    expect(document.activeElement).toBe(page.get('.product-panel').element)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.product-panel').exists()).toBe(false)
    expect(document.activeElement).toBe(descriptionTrigger.element)

    const reviewsTrigger = page.get('.product-read-reviews')
    ;(reviewsTrigger.element as HTMLElement).focus()
    await reviewsTrigger.trigger('click')
    await settle()
    expect(page.get('.product-panel').attributes('aria-label')).toBe('Product reviews')
    expect(page.get('.product-panel-rating').text()).toContain('160 ratings')
    expect(page.findAll('.product-panel-review-controls select')).toHaveLength(3)
    expect(page.findAll('.product-panel-review-list > article')).toHaveLength(3)
    await page.get('input[aria-label="Search product reviews"]').setValue('jacquelyn')
    await settle()
    expect(page.findAll('.product-panel-review-list > article')).toHaveLength(1)
    expect(page.get('.product-panel-review-list > article').text()).toContain('weird bumps')
    await page.get('.product-panel-dismiss').trigger('click')
    await settle()
    expect(page.find('.product-panel').exists()).toBe(false)
    expect(document.activeElement).toBe(reviewsTrigger.element)

    const returnTrigger = page.get('.product-delivery > button')
    ;(returnTrigger.element as HTMLElement).focus()
    await returnTrigger.trigger('click')
    await settle()
    expect(page.get('.product-panel').attributes('aria-label')).toBe('Return policy')
    expect(page.get('.product-panel-return').text()).toContain('Damages and Issues')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.product-panel').exists()).toBe(false)
    expect(document.activeElement).toBe(returnTrigger.element)

    await returnTrigger.trigger('click')
    await settle()
    await page.get('.product-panel-dismiss').trigger('click')
    await settle()
    expect(page.find('.product-panel').exists()).toBe(false)
    expect(document.activeElement).toBe(returnTrigger.element)
  })

  it('maps every Gathre product route to its own source metadata', async () => {
    const firstProduct = gathreProducts[0]!
    const page = mountAt(new URL(firstProduct.sourceUrl!).pathname)

    for (const product of gathreProducts) {
      window.history.replaceState({}, '', new URL(product.sourceUrl!).pathname)
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()

      expect(page.get('.product-page__details h1').text()).toBe(product.name)
      expect(page.findAll('.product-thumbnails > button')).toHaveLength(product.gallery?.length || 1)
      expect(page.get('.product-page__image img').attributes('src')).toBe(product.gallery?.[0] || product.image)
      expect(page.findAll('.product-variants')).toHaveLength(product.variantOptions?.length || 0)
      expect(page.findAll('.product-variants > button')).toHaveLength(product.variantOptions?.reduce((total, option) => total + option.values.length, 0) || 0)

      const expectedDefaults = (product.selectedVariant || '').replace(/\s*\(on sale\)$/i, '').split(' / ')
      expect(page.findAll('.product-variants legend strong').map((label) => label.text())).toEqual(expectedDefaults)
      expect(page.get('.product-purchase').attributes('href')).toBe(product.purchaseUrl)
      expect(page.get('.product-delivery > a').attributes('href')).toBe(`${product.onlineStoreUrl}?utm_source=shop_app`)
      expect(page.get('.product-description > p').element.textContent).toBe(product.description)

      if (product.ratingCount) {
        expect(page.get('.product-rating').text()).toContain(`${product.ratingCount} ratings`)
        expect(page.get('.product-rating').attributes('aria-label')).toContain(`${product.reviewCount} reviews`)
      } else {
        expect(page.find('.product-rating').exists()).toBe(false)
        expect(page.find('.product-reviews').exists()).toBe(false)
      }

      expect(page.find('.product-popular').exists()).toBe(Boolean(product.purchaseCountLabel))
      if (product.purchaseCountLabel) expect(page.get('.product-popular').text()).toBe(product.purchaseCountLabel)
      expect(page.find('.product-low-stock').exists()).toBe(Boolean(product.inventoryLabel))
      if (product.inventoryLabel) expect(page.get('.product-low-stock').text()).toBe(product.inventoryLabel)

      if (product.id !== firstProduct.id) {
        expect(page.find('.product-review-rail').exists()).toBe(false)
        expect(page.find('.product-review-distribution').exists()).toBe(false)
        expect(page.get('.product-description > p').text()).not.toContain('Great as a changing mat')
      }
    }
  })

  it('resolves colliding Midi and Midi+ slugs by product ID after browser navigation', async () => {
    const midiPlus = gathreProducts.find((product) => product.name === 'Midi+')!
    const midi = gathreProducts.find((product) => product.name === 'Midi')!
    const page = mountAt(new URL(midiPlus.sourceUrl!).pathname)
    expect(page.get('.product-page__details h1').text()).toBe('Midi+')

    window.history.pushState({}, '', new URL(midi.sourceUrl!).pathname)
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    expect(page.get('.product-page__details h1').text()).toBe('Midi')

    window.history.replaceState({}, '', new URL(midiPlus.sourceUrl!).pathname)
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    expect(page.get('.product-page__details h1').text()).toBe('Midi+')
    expect(page.get('.product-price strong').text()).toBe(midiPlus.price)
  })

  it('uses grouped defaults, variant imagery, and product-specific non-Baby panels', async () => {
    const highchair = gathreProducts.find((product) => product.name === 'Highchair Mat')!
    const page = mountAt(new URL(highchair.sourceUrl!).pathname)

    expect(page.findAll('.product-variants')).toHaveLength(1)
    expect(page.get('.product-variants legend').text()).toContain('Ivory Scallop')
    const ivory = page.findAll('.product-variants > button').find((button) => button.text() === 'Ivory')!
    await ivory.trigger('click')
    expect(ivory.attributes('aria-checked')).toBe('true')
    expect(page.get('.product-page__image img').attributes('src')).toBe(highchair.variantOptions![0]!.values[0]!.image)

    await page.get('.product-description > button').trigger('click')
    await settle()
    expect(page.get('.product-panel-description').element.textContent).toContain(highchair.description)
    expect(page.get('.product-panel-description').text()).not.toContain('Great as a changing mat')
    await page.get('.product-panel-dismiss').trigger('click')

    const rating = page.get('.product-rating')
    expect(rating.element.tagName).toBe('SPAN')
    expect(rating.classes()).toContain('product-rating--static')
    await rating.trigger('click')
    await settle()
    expect(page.find('.product-panel-rating').exists()).toBe(false)
  })

  it('matches every URL-driven login locale and its localized validation copy', async () => {
    const page = mountAt('/accounts/login?locale=en')
    expect(document.title).toBe('Sign in – Shop account')

    for (const locale of loginLocaleOptions) {
      window.history.replaceState({}, '', `/accounts/login?locale=${locale.locale}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
      await settle()

      expect(document.documentElement.lang).toBe(locale.locale)
      expect(page.get('.account-card h2').text()).toBe(locale.title)
      expect(page.get('.account-card > p').text()).toBe(locale.subtitle)
      expect(page.get('#email').attributes('placeholder')).toBe(locale.placeholder)
      expect(page.get('.account-card form > button').text()).toBe(locale.action)
      expect(page.get('.account-card small').element.textContent).toBe(locale.legal)
      expect(page.get('.language-button').attributes('aria-label')).toBe(locale.changeLanguage)

      await page.get('.account-card form').trigger('submit')
      expect(page.get('.account-error').text()).toBe(locale.error)
    }
  })

  it('matches the source login language popover links and close behavior', async () => {
    const page = mountAt('/accounts/login?locale=en')
    const languageTrigger = page.get('.language-button')
    ;(languageTrigger.element as HTMLElement).focus()
    await languageTrigger.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/accounts/login')
    expect(page.get('.login-language-popover').attributes('role')).toBeUndefined()
    expect(page.find('.login-language-dismiss').exists()).toBe(false)
    expect(page.findAll('.login-language-popover a')).toHaveLength(33)
    expect(page.findAll('.login-language-popover a')[0]!.attributes('href')).toBe('/accounts/login?locale=bg-BG')
    expect(page.findAll('.login-language-popover a').at(-1)!.attributes('href')).toBe('/accounts/login?locale=zh-TW')
    expect(document.activeElement).toBe(languageTrigger.element)
    expect(document.body.classList.contains('overlay-lock')).toBe(false)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(page.find('.login-language-popover').exists()).toBe(false)
    expect(document.activeElement).toBe(languageTrigger.element)

    await languageTrigger.trigger('click')
    await settle()
    await page.get('.account-card h2').trigger('click')
    await settle()
    expect(page.find('.login-language-popover').exists()).toBe(false)
    expect(document.activeElement).toBe(languageTrigger.element)

    await languageTrigger.trigger('click')
    await settle()
    const japanese = page.findAll('.login-language-popover a').find((link) => link.text() === '日本語')!
    await japanese.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/accounts/login')
    expect(window.location.search).toBe('?locale=ja')
    expect(page.find('.login-language-popover').exists()).toBe(false)
    expect(page.get('.language-button').text()).toContain('日本語')
    expect(page.get('.account-card h2').text()).toBe('Shop にログイン')
    expect(page.get('#email').attributes('placeholder')).toBe('メールアドレスを入力')
    expect(localStorage.getItem('shop-language')).toBe('日本語')
    expect(document.documentElement.lang).toBe('ja')
    expect(document.activeElement).toBe(page.get('#email').element)
  })

  it('resets login form state when browser history changes the locale', async () => {
    const page = mountAt('/accounts/login?locale=en')
    await page.get('#email').setValue('not-an-email')
    await page.get('.account-card form').trigger('submit')
    expect(page.find('.account-error').exists()).toBe(true)

    window.history.pushState({}, '', '/accounts/login?locale=fr')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()

    expect((page.get('#email').element as HTMLInputElement).value).toBe('')
    expect(page.find('.account-error').exists()).toBe(false)
    expect(page.get('.account-card h2').text()).toBe('Se connecter à Shop')
  })

  it('does not let product-card keyboard handlers swallow saved-item actions', async () => {
    const page = mountAt('/categories')
    const saveButton = page.get('.catalog-card button[aria-label="Add to saved items"]')
    await saveButton.trigger('keydown', { key: 'Enter' })
    expect(window.location.pathname).toBe('/categories')

    await saveButton.trigger('click')
    await settle()
    expect(window.location.pathname).toBe('/accounts/login')
  })

  it('shows the local hero fallback when video playback fails', async () => {
    const page = mountAt()
    await page.get('.hero-video').trigger('error')
    await settle()
    expect(page.get('.hero-fallback').classes()).toContain('is-visible')
    expect((page.get('.hero-video').element as HTMLElement).style.display).toBe('none')
  })

  it('marks overlays as modal, traps focus, and restores the invoking control', async () => {
    const page = mountAt()
    const trigger = page.get('.hero-search')
    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('click')
    await settle()

    const dialog = page.get('.search-layer')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    const focusable = [...dialog.element.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex]:not([tabindex="-1"])')].filter((element) => {
      let current: HTMLElement | null = element
      while (current && current !== dialog.element) {
        const style = window.getComputedStyle(current)
        if (style.display === 'none' || style.visibility === 'hidden' || current.hidden) return false
        current = current.parentElement
      }
      return !element.hasAttribute('disabled')
    })
    const firstControl = focusable[0]!
    const lastControl = focusable.at(-1)!
    lastControl.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(firstControl)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(document.activeElement).toBe(trigger.element)
  })

  it('updates document titles for routed content', async () => {
    const page = mountAt('/cart')
    expect(document.title).toBe('Cart - Shop')

    window.history.replaceState({}, '', '/search/results?query=beauty')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await settle()
    expect(document.title).toBe('beauty - Shop')
    expect(page.findAll('.result-product')).toHaveLength(12)
  })

  it('exposes filter and validation state to assistive technology', async () => {
    const page = mountAt('/search/results?query=shoes')
    const saleButton = page.findAll('.filters-strip > button').find((button) => button.text().trim() === 'On sale')!
    expect(saleButton.attributes('aria-pressed')).toBe('false')
    await saleButton.trigger('click')
    expect(saleButton.attributes('aria-pressed')).toBe('true')

    const ratingsButton = page.findAll('.filters-strip > button').find((button) => button.text().includes('Ratings'))!
    await ratingsButton.trigger('click')
    expect(ratingsButton.attributes('aria-expanded')).toBe('true')
    expect(ratingsButton.attributes('aria-controls')).toBe('filter-dialog')
    expect(page.get('#filter-dialog').attributes('role')).toBe('dialog')

    page.unmount()
    const loginPage = mountAt('/accounts/login')
    await loginPage.get('.account-card form').trigger('submit')
    expect(loginPage.get('#email').attributes('aria-invalid')).toBe('true')
    expect(loginPage.get('#email').attributes('aria-describedby')).toBe('email-error')
    expect(loginPage.get('#email-error').attributes('role')).toBe('alert')
  })
})
