import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RecognitionCarousel from './RecognitionCarousel.vue'
import BrandPortfolio from './BrandPortfolio.vue'

describe('21TSI core modules', () => {
  it('supports circular achievement selection and keyboard tab focus', async () => {
    const wrapper = mount(RecognitionCarousel, { attachTo: document.body })
    await wrapper.get('[aria-label="Previous achievement"]').trigger('click')
    expect(wrapper.get('h3').text()).toBe('7 & 8 figures')
    const tab = wrapper.get('[aria-selected="true"]')
    await tab.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.get('h3').text()).toBe('Over 40M')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([0])
    expect(document.activeElement).toBe(wrapper.get('[aria-selected="true"]').element)
    wrapper.unmount()
  })

  it('handles an empty achievement list without emitting an invalid index', async () => {
    const wrapper = mount(RecognitionCarousel, { props: { items: [] } })
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.find('[role="tabpanel"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('updates the brand image and routes the selected brand through an event', async () => {
    const wrapper = mount(BrandPortfolio)
    await wrapper.findAll('nav button')[2]!.trigger('click')
    expect(wrapper.get('img').attributes('src')).toBe('/assets/tsi/ascend.svg')
    await wrapper.get('.brand-detail>button').trigger('click')
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'ascend' })
    wrapper.unmount()
  })

})
