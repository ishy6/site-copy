import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FocusAccordion from './FocusAccordion.vue'
import ProgressNavigation from './ProgressNavigation.vue'

describe('21TSI reusable navigation', () => {
  it('connects every accordion trigger to a unique panel and updates the active image', async () => {
    const wrapper = mount({ components: { FocusAccordion }, template: '<div><FocusAccordion /><FocusAccordion /></div>' })
    const [first, second] = wrapper.findAllComponents(FocusAccordion)
    if (!first || !second) throw new Error('Both accordion instances must render')
    const trigger = first.findAll('.focus-list button')[1]!
    expect(first.get('.focus-list button').attributes('aria-controls')).not.toBe(second.get('.focus-list button').attributes('aria-controls'))
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(first.get(`#${trigger.attributes('aria-controls')}`).isVisible()).toBe(true)
    expect(first.get('.focus-media img').attributes('src')).toBe('/assets/tsi/focus-2.webp')
    expect(first.emitted('change')?.at(-1)).toEqual([1])
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(first.emitted('change')?.at(-1)).toEqual([null])
    wrapper.unmount()
  })

  it('updates the selected section and closes mobile navigation on selection', async () => {
    const wrapper = mount(ProgressNavigation)
    await wrapper.get('[aria-label="Open navigation"]').trigger('click')
    expect(wrapper.get('[aria-label="Close navigation"]').attributes('aria-expanded')).toBe('true')
    await wrapper.findAll('nav button')[2]!.trigger('click')
    expect(wrapper.emitted('navigate')?.at(-1)).toEqual([2])
    expect(wrapper.get('[aria-current="page"]').text()).toContain('Invest')
    expect(wrapper.get('h3').text()).toBe('Invest')
    expect(wrapper.get('[aria-label="Open navigation"]').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ activeIndex: 1 })
    expect(wrapper.get('h3').text()).toBe('Join The Team')
    await wrapper.get('.contact-button').trigger('click')
    expect(wrapper.emitted('contact')).toHaveLength(1)
    wrapper.unmount()
  })
})
