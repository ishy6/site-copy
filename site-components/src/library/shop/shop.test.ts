import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ShopCategoryRail from './ShopCategoryRail.vue'
import ShopProductCard from './ShopProductCard.vue'

describe('Shop components', () => {
  it('toggles saved state without selecting the product', async () => {
    const wrapper = mount(ShopProductCard)
    await wrapper.get('.save-button').trigger('click')
    expect(wrapper.get('.save-button').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('update:saved')?.[0]).toEqual([true])
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.get('.save-button').trigger('click')
    expect(wrapper.emitted('update:saved')?.[1]).toEqual([false])
  })

  it('derives a discount and displays a local fallback on image failure', async () => {
    const wrapper = mount(ShopProductCard, { props: { price: 75, previousPrice: 100, currency: 'USD' } })
    expect(wrapper.get('.discount').text()).toBe('25% off')
    await wrapper.get('img').trigger('error')
    expect(wrapper.get('.image-fallback').text()).toBe('Gathre')
  })

  it('supports keyboard category switching and emits the selected item with its group', async () => {
    const wrapper = mount(ShopCategoryRail)
    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('[role="tab"]')[1]?.attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:activeCategory')?.[0]).toEqual(['Home'])
    await wrapper.findAll('.category-tile')[0]?.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([{ name: 'Blankets', image: '/assets/shop/blankets.png' }, 'Home'])
    expect(wrapper.get('[role="status"]').text()).toContain('Blankets')
    await wrapper.get('[aria-label="Next category"]').trigger('click')
    expect(wrapper.findAll('[role="tab"]')[0]?.attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[role="status"]').text()).toBe('')
  })
})
