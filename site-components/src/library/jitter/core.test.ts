import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProductNavigation from './ProductNavigation.vue'
import PricingPlans from './PricingPlans.vue'
import TemplateBrowser from './TemplateBrowser.vue'
import FaqList from './FaqList.vue'

describe('Jitter core modules', () => {
  it('selects product links, closes the dropdown, and leaves routing to the host', async () => {
    const wrapper = mount(ProductNavigation)
    await wrapper.get('.product-menu button').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['/#product'])
    expect(wrapper.get('.desktop-links button').attributes('aria-expanded')).toBe('false')
    await wrapper.get('.start-button').trigger('click')
    expect(wrapper.emitted('start')).toHaveLength(1)
    wrapper.unmount()
  })

  it('restores mobile menu focus when Escape closes it', async () => {
    const wrapper = mount(ProductNavigation, { attachTo: document.body })
    await wrapper.get('.menu-button').trigger('click')
    const firstLink = wrapper.get('.mobile-links button')
    ;(firstLink.element as HTMLButtonElement).focus()
    await firstLink.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.mobile-links').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('.menu-button').element)
    wrapper.unmount()
  })

  it('switches displayed prices and sends the selected plan with its billing interval', async () => {
    const wrapper = mount(PricingPlans)
    expect(wrapper.findAll('.price')[1]!.text()).toContain('$12')
    await wrapper.findAll('.billing-switch button')[0]!.trigger('click')
    expect(wrapper.findAll('.price')[1]!.text()).toContain('$18')
    await wrapper.get('[aria-label="Choose Pro"]').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'pro', monthly: 18 })
    expect(wrapper.emitted('select')?.[0]?.[1]).toBe(false)
    await wrapper.setProps({ yearly: false })
    await wrapper.setProps({ yearly: true })
    expect(wrapper.findAll('.price')[1]!.text()).toContain('$12')
    wrapper.unmount()
  })

  it('combines category and search filters, clears an empty result, and emits the chosen object', async () => {
    const wrapper = mount(TemplateBrowser)
    await wrapper.findAll('.template-filters button')[1]!.trigger('click')
    expect(wrapper.findAll('.template-results>button')).toHaveLength(1)
    await wrapper.get('input').setValue('not-a-template')
    expect(wrapper.find('.template-empty').exists()).toBe(true)
    await wrapper.get('.template-empty button').trigger('click')
    expect(wrapper.findAll('.template-results>button')).toHaveLength(3)
    await wrapper.get('.template-results>button').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: '5', category: 'Typography' })
    wrapper.unmount()
  })

  it('connects FAQ triggers to panels and closes the current answer', async () => {
    const wrapper = mount(FaqList)
    const button = wrapper.findAll('button')[1]!
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get(`[id="${button.attributes('aria-controls')}"]`).isVisible()).toBe(true)
    await button.trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([null])
    wrapper.unmount()
  })
})
