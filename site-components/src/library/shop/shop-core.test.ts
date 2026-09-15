import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ShopSearchPanel from './ShopSearchPanel.vue'
import ShopEmailSignIn from './ShopEmailSignIn.vue'
import ShopProductFilters from './ShopProductFilters.vue'
import ShopProductConfigurator from './ShopProductConfigurator.vue'

afterEach(() => { vi.restoreAllMocks() })

describe('Shop core patterns', () => {
  it('rejects empty searches and stores submitted queries without duplicate history', async () => {
    const wrapper = mount(ShopSearchPanel, { props: { initialHistory: ['chairs'] } })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toContain('Enter a search')
    await wrapper.get('input[type="search"]').setValue(' chairs ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('search')?.[0]).toEqual([{ query: 'chairs', image: null }])
    expect(wrapper.emitted('update:history')?.[0]).toEqual([['chairs']])
    await wrapper.get('.clear-history').trigger('click')
    expect(wrapper.get('.empty').text()).toBe('No recent searches')
  })

  it('releases attachment object URLs and sends the original File', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local-image')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const wrapper = mount(ShopSearchPanel)
    const file = new File(['image'], 'photo.png', { type: 'image/png' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('search')?.[0]).toEqual([{ query: '', image: file }])
    wrapper.unmount()
    expect(revoke).toHaveBeenCalledWith('blob:local-image')
  })

  it('validates email and leaves delivery success under host control', async () => {
    const wrapper = mount(ShopEmailSignIn)
    await wrapper.get('input').setValue('invalid')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toContain('valid email')
    await wrapper.get('input').setValue('buyer@example.com')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['buyer@example.com'])
    expect(wrapper.text()).not.toContain('Check your email')
    await wrapper.setProps({ status: 'success' })
    expect(wrapper.text()).toContain('Check your email')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

  it('normalizes price bounds and emits complete filters on apply and reset', async () => {
    const wrapper = mount(ShopProductFilters, { props: { priceLimit: 100, modelValue: { minimum: -5, maximum: 500 } } })
    expect((wrapper.get('[aria-label="Minimum price"]').element as HTMLInputElement).value).toBe('0')
    expect((wrapper.get('[aria-label="Maximum price"]').element as HTMLInputElement).value).toBe('100')
    await wrapper.get('[aria-label="Minimum price"]').setValue('75')
    await wrapper.get('[aria-label="Maximum price"]').setValue('30')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('apply')?.[0]).toEqual([{ sort: 'Relevance', minimum: 75, maximum: 75, colors: [], inStock: false, onSale: false }])
    await wrapper.get('[aria-label="Reset filters"]').trigger('click')
    expect((wrapper.get('[aria-label="Maximum price"]').element as HTMLInputElement).value).toBe('100')
  })

  it('changes variant image, constrains quantity, and emits the configured cart item', async () => {
    const wrapper = mount(ShopProductConfigurator, { props: { maxQuantity: 2 } })
    await wrapper.get('input[value="Ivory"]').setValue()
    expect(wrapper.get('.hero-image img').attributes('src')).toBe('/assets/shop/mat-ivory.jpg')
    await wrapper.get('[aria-label="Increase quantity"]').trigger('click')
    expect(wrapper.get('[aria-label="Increase quantity"]').attributes('disabled')).toBeDefined()
    await wrapper.get('.add-button').trigger('click')
    expect(wrapper.emitted('add')?.[0]).toEqual([{ name: 'Baby Changing Mat', variant: 'Ivory', quantity: 2, price: 160 }])
    await wrapper.setProps({ inStock: false })
    expect(wrapper.get('.add-button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.add-button').text()).toBe('Out of stock')
  })
})
