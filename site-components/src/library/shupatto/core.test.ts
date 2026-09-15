import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProductPalette from './ProductPalette.vue'
import ProductLineup from './ProductLineup.vue'
import StoreDirectory from './StoreDirectory.vue'
import OvalNavigation from './OvalNavigation.vue'
import FoldSequence from './FoldSequence.vue'
import { products } from './products'
import { regions } from './regions'
import { foldSheets } from './foldSheets'

enableAutoUnmount(afterEach)
afterEach(() => vi.unstubAllGlobals())

describe('Shupatto product selection', () => {
  it('keeps the visible color, photograph and detail payload in sync across product changes', async () => {
    const wrapper = mount(ProductPalette)
    await wrapper.get('button[aria-label="JET BLACK"]').trigger('click')
    expect(wrapper.get('img').attributes('src')).toBe(products[0]!.colors[2]!.image)
    await wrapper.get('.shupatto-palette__details').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({
      product: { id: 'compactbag-m' }, color: { id: 'compactbag-m-2' },
    })

    await wrapper.setProps({ productId: 'jewels-of-the-sea', initialColor: 2 })
    expect(wrapper.get('h2').text()).toBe('Jewels of the sea')
    expect(wrapper.get('img').attributes('src')).toBe(products[2]!.colors[1]!.image)
    expect(wrapper.get('button[aria-pressed="true"]').attributes('aria-label')).toBe('Sea Shells')
    await wrapper.get('.shupatto-palette__details').trigger('click')
    expect(wrapper.emitted('select')?.[1]?.[0]).toMatchObject({
      product: { id: 'jewels-of-the-sea' }, color: { id: 'jewels-of-the-sea-1' },
    })
  })

  it('wraps keyboard color selection with focus and safely handles products without colors', async () => {
    const wrapper = mount(ProductPalette, { attachTo: document.body })
    await wrapper.get('button[aria-label="CLEAR SKY"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(wrapper.get('button[aria-label="JET BLACK"]').element)
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toMatchObject({ label: 'JET BLACK' })
    await wrapper.get('button[aria-label="JET BLACK"]').trigger('keydown', { key: 'Home' })
    expect(wrapper.get('button[aria-label="CLEAR SKY"]').attributes('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('button[aria-label="CLEAR SKY"]').element)

    await wrapper.setProps({ products: [{ ...products[0]!, colors: [] }] })
    expect(wrapper.text()).toContain('No colors available')
    expect(wrapper.find('.shupatto-palette__details').exists()).toBe(false)
    await wrapper.setProps({ products: [] })
    expect(wrapper.text()).toBe('No products available.')
  })

  it('filters real product families and restores All when the selected family disappears', async () => {
    const wrapper = mount(ProductLineup)
    const recycled = wrapper.findAll('header button').find(button => button.text() === 'Recycled')!
    await recycled.trigger('click')
    expect(wrapper.emitted('filter')).toEqual([['Recycled']])
    expect(wrapper.findAll('.shupatto-lineup__items > button')).toHaveLength(1)
    expect(wrapper.get('.shupatto-lineup__name').text()).toBe('Jewels of the sea')
    await wrapper.get('.shupatto-lineup__items > button').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'jewels-of-the-sea', category: 'Recycled' })

    await wrapper.setProps({ products: products.filter(product => product.category === 'Standard') })
    expect(wrapper.get('header button[aria-pressed="true"]').text()).toBe('All')
    expect(wrapper.findAll('.shupatto-lineup__items > button')).toHaveLength(2)
    await wrapper.setProps({ products: [] })
    expect(wrapper.text()).toContain('No products in this family.')
  })
})

describe('Shupatto store directory and navigation', () => {
  it('selects actual region names and filters store names without losing the empty-result recovery', async () => {
    const wrapper = mount(StoreDirectory)
    const australia = regions.find(region => region.name === 'Australia')!
    await wrapper.get('select').setValue(australia.name)
    expect(wrapper.emitted('region-change')).toEqual([[australia.name]])
    expect(wrapper.findAll('.shupatto-stores__results > a')).toHaveLength(australia.stores.length)

    await wrapper.get('input[type="search"]').setValue('  ABSOLUTELY FABULOUS  ')
    expect(wrapper.findAll('.shupatto-stores__results > a')).toHaveLength(1)
    expect(wrapper.get('.shupatto-stores__results > a').attributes()).toMatchObject({
      href: australia.stores.find(store => store.name === 'Absolutely Fabulous')!.href,
      target: '_blank', rel: 'noopener noreferrer',
    })
    await wrapper.get('input[type="search"]').setValue('a-store-that-does-not-exist')
    expect(wrapper.text()).toContain('No stores found.')
    expect(wrapper.get('footer').text()).toContain('0 stores')
    await wrapper.get('input[type="search"]').setValue('')
    expect(wrapper.findAll('.shupatto-stores__results > a')).toHaveLength(australia.stores.length)
  })

  it('reconciles injected regions and displays the empty directory without stale links', async () => {
    const wrapper = mount(StoreDirectory, { props: { initialRegion: 'not-a-region' } })
    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe(regions[0]!.name)
    await wrapper.setProps({ regions: [{ name: 'CUSTOM', stores: [{ name: 'Local retailer', href: 'https://example.com/store' }] }] })
    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('CUSTOM')
    expect(wrapper.get('.shupatto-stores__results a').text()).toBe('Local retailer')
    await wrapper.setProps({ regions: [] })
    expect(wrapper.findAll('.shupatto-stores__results a')).toHaveLength(0)
    expect(wrapper.text()).toContain('No stores found.')
  })

  it('closes with Escape and restores focus to the menu trigger', async () => {
    const wrapper = mount(OvalNavigation, { props: { initiallyOpen: false }, attachTo: document.body })
    const trigger = wrapper.get('button[aria-label="Toggle Shupatto menu"]')
    expect(wrapper.find('nav').exists()).toBe(false)
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const firstLink = wrapper.get('nav > button')
    ;(firstLink.element as HTMLButtonElement).focus()
    await firstLink.trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.emitted('open-change')).toEqual([[true], [false]])
  })

  it('emits language and navigation changes while respecting host-owned language state', async () => {
    const links = [{ label: 'Products', href: '/products' }, { label: 'About' }]
    const wrapper = mount(OvalNavigation, { props: { language: 'EN', links } })
    await wrapper.get('select[aria-label="Language"]').setValue('JA')
    expect(wrapper.emitted('language-change')).toEqual([['JA']])
    await wrapper.setProps({ language: 'JA' })
    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('JA')
    expect(wrapper.get('nav > a').attributes('href')).toBe('/products')
    await wrapper.get('nav > button').trigger('click')
    expect(wrapper.emitted('navigate')).toEqual([[links[1]]])
    expect(wrapper.find('nav').exists()).toBe(false)
  })
})

describe('Shupatto photographic fold sequence', () => {
  it('retries the first photo after a load failure without requiring a different frame', async () => {
    const wrapper = mount(FoldSequence)
    await wrapper.get('.shupatto-fold__stage img').trigger('error')
    expect(wrapper.text()).toContain('Sequence unavailable.')
    expect(wrapper.get('button[aria-label="Play folding"]').attributes('disabled')).toBeDefined()
    await wrapper.get('button[aria-label="Reset folding"]').trigger('click')
    expect(wrapper.get('.shupatto-fold__stage img').attributes('src')).toBe(foldSheets[0])
    expect(wrapper.get('button[aria-label="Play folding"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).not.toContain('Sequence unavailable.')
  })

  it('scrubs the actual first, middle and last photo sheets and resets to the first frame', async () => {
    const wrapper = mount(FoldSequence)
    expect(wrapper.get('.shupatto-fold__stage img').attributes('src')).toBe(foldSheets[0])
    expect(wrapper.find('[aria-label="Pause folding"]').exists()).toBe(false)
    await wrapper.get('input[aria-label="Fold progress"]').setValue(50)
    expect(wrapper.get('.shupatto-fold__stage img').attributes('src')).toBe(foldSheets[9])
    await wrapper.get('input[aria-label="Fold progress"]').setValue(100)
    expect(wrapper.get('.shupatto-fold__stage img').attributes('src')).toBe(foldSheets.at(-1))
    expect((wrapper.get('.shupatto-fold__stage img').element as HTMLImageElement).style.top).toBe('-300%')
    expect(wrapper.emitted('progress')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('complete')).toBeUndefined()
    await wrapper.get('button[aria-label="Reset folding"]').trigger('click')
    expect(wrapper.get('.shupatto-fold__stage img').attributes('src')).toBe(foldSheets[0])
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('0')
    await wrapper.setProps({ sheets: [] })
    expect(wrapper.text()).toContain('Sequence unavailable.')
    expect(wrapper.get('button[aria-label="Play folding"]').attributes('disabled')).toBeDefined()
  })

  it('pauses and resumes animation, emits completion once and cancels pending frames on unmount', async () => {
    const callbacks = new Map<number, FrameRequestCallback>()
    let nextId = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.set(++nextId, callback); return nextId })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => callbacks.delete(id))
    async function advance(time: number) {
      const pending = [...callbacks.values()]
      callbacks.clear()
      for (const callback of pending) callback(time)
      await nextTick()
    }
    const wrapper = mount(FoldSequence, { props: { duration: .3 } })
    await wrapper.get('button[aria-label="Play folding"]').trigger('click')
    await advance(100)
    await advance(250)
    expect(Number((wrapper.get('input').element as HTMLInputElement).value)).toBeCloseTo(50)
    await wrapper.get('button[aria-label="Pause folding"]').trigger('click')
    await advance(400)
    expect(Number((wrapper.get('input').element as HTMLInputElement).value)).toBeCloseTo(50)
    await wrapper.get('button[aria-label="Play folding"]').trigger('click')
    await advance(500)
    await advance(850)
    expect(wrapper.emitted('complete')).toEqual([[]])
    expect(wrapper.find('button[aria-label="Pause folding"]').exists()).toBe(false)
    expect(callbacks.size).toBe(0)
    await wrapper.get('button[aria-label="Play folding"]').trigger('click')
    expect(Number((wrapper.get('input').element as HTMLInputElement).value)).toBe(0)
    expect(callbacks.size).toBe(1)
    wrapper.unmount()
    expect(callbacks.size).toBe(0)
  })
})
