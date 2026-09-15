import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ProductGallery from './ProductGallery.vue'
import VariantPurchase from './VariantPurchase.vue'
import ShoppingBag from './ShoppingBag.vue'
import { sampleBag } from './bag-data'

describe('MAKR product detail and bag', () => {
  it('cycles gallery photos with keyboard and clamps selection when the photos are replaced', async () => {
    const wrapper = mount(ProductGallery)
    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.get('.makr-gallery__stage img').attributes('src')).toContain('tri-glide-back')
    await wrapper.trigger('keydown', { key: 'Home' })
    expect(wrapper.get('.makr-gallery__stage img').attributes('src')).toContain('tri-glide-front')
    await wrapper.setProps({ photos: [{ id: 'only', src: '/only.png', alt: 'Only photo' }], initialIndex: 100 })
    expect(wrapper.get('.makr-gallery__stage img').attributes('alt')).toBe('Only photo')
    expect(wrapper.get('button[aria-label="Next image"]').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ photos: [] })
    expect(wrapper.text()).toContain('No product images available.')
    expect(wrapper.find('button[aria-label="Enlarge product image"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('requires a variant and updates dimensions, totals and quantity limits together', async () => {
    const wrapper = mount(VariantPurchase, { props: { maxQuantity: 2 } })
    await wrapper.get('.makr-purchase__add').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toBe('Choose a size.')
    expect(wrapper.emitted('add')).toBeUndefined()
    await wrapper.get('select').setValue('4555')
    expect(wrapper.text()).toContain('36 in x 1.5 in')
    await wrapper.get('input[type="number"]').setValue(500)
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2')
    expect(wrapper.text()).toContain('$224')
    expect(wrapper.get('[aria-label="Increase quantity"]').attributes('disabled')).toBeDefined()
    await wrapper.get('.makr-purchase__add').trigger('click')
    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({ quantity: 2, variant: { id: '4555' }, total: 224 })
    wrapper.unmount()
  })

  it('blocks unavailable variants and recovers after an add callback fails', async () => {
    const add = vi.fn().mockRejectedValueOnce(new Error('Try again')).mockResolvedValueOnce(undefined)
    const variants = [{ id: 'sold-out', label: 'Sold out', dimensions: '10 in', price: 50, available: false }, { id: 'available', label: 'Available', dimensions: '12 in', price: 70, available: true }]
    const wrapper = mount(VariantPurchase, { props: { variants, addItem: add } })
    await wrapper.get('select').setValue('sold-out')
    expect(wrapper.get('.makr-purchase__add').attributes('disabled')).toBeDefined()
    await wrapper.get('select').setValue('available')
    await wrapper.get('.makr-purchase__add').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Try again')
    await wrapper.get('.makr-purchase__add').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('success')).toHaveLength(1)
    expect(add).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('updates the bag total, enforces stock and removes zero-quantity lines without mutating input', async () => {
    const items = sampleBag.map(item => ({ ...item, maxQuantity: 2 }))
    const wrapper = mount(ShoppingBag, { props: { items } })
    await wrapper.get('[aria-label="Field Pouch quantity"]').setValue(10)
    expect(wrapper.text()).toContain('$288.00')
    expect(wrapper.get('[aria-label="Increase Field Pouch quantity"]').attributes('disabled')).toBeDefined()
    expect(items[0]?.quantity).toBe(1)
    await wrapper.get('[aria-label="Field Pouch quantity"]').setValue(0)
    expect(wrapper.emitted('remove')).toEqual([['field-brown']])
    expect(wrapper.text()).toContain('$112.00')
    await wrapper.get('[aria-label="Remove Tri-Glide Belt"]').trigger('click')
    expect(wrapper.text()).toContain('Your bag is empty.')
    expect(wrapper.get('.makr-bag__checkout').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('prevents duplicate checkout callbacks while pending and preserves the bag on failure', async () => {
    let reject!: (reason: Error) => void
    const checkout = vi.fn(() => new Promise<void>((_, rejectPromise) => { reject = rejectPromise }))
    const wrapper = mount(ShoppingBag, { props: { prepareCheckout: checkout } })
    await wrapper.get('.makr-bag__checkout').trigger('click')
    await wrapper.get('.makr-bag__checkout').trigger('click')
    expect(checkout).toHaveBeenCalledTimes(1)
    reject(new Error('Unavailable now'))
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Unavailable now')
    expect(wrapper.findAll('.makr-bag__lines li')).toHaveLength(2)
    expect(wrapper.get('.makr-bag__checkout').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})
