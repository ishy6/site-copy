import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WiseProductNavigation from './WiseProductNavigation.vue'
import WiseCurrencyPicker from './WiseCurrencyPicker.vue'
import WiseFeeBreakdown from './WiseFeeBreakdown.vue'
import WiseProviderComparison from './WiseProviderComparison.vue'

describe('Wise core patterns', () => {
  it('changes navigation sections and closes the panel with Escape', async () => {
    const wrapper = mount(WiseProductNavigation)
    await wrapper.get('[data-section="business"]').trigger('click')
    expect(wrapper.get('.feature strong').text()).toBe('A world of business')
    expect(wrapper.emitted('update:section')?.[0]).toEqual(['business'])
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.product-panel').exists()).toBe(false)
    expect(wrapper.get('[data-section="business"]').attributes('aria-expanded')).toBe('false')
  })

  it('filters currencies, selects via keyboard and recovers from no results', async () => {
    const wrapper = mount(WiseCurrencyPicker)
    const input = wrapper.get('input')
    await input.setValue('dollar')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['CAD'])
    expect(wrapper.get('[aria-selected="true"]').text()).toContain('Canadian dollar')
    await input.setValue('not-a-currency')
    expect(wrapper.find('[role="status"]').text()).toBe('No currencies found')
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.findAll('[role="option"]')).toHaveLength(6)
  })

  it('sums fees and switches to provided comparison data', async () => {
    const wrapper = mount(WiseFeeBreakdown, { props: { fees: [{ label: 'Fixed', amount: 2 }, { label: 'Variable', amount: 3.25 }], comparisons: [{ name: 'Example', amount: 7 }] } })
    expect(wrapper.get('.fee-total strong').text()).toBe('5.25 GBP')
    await wrapper.get('input[value="compare"]').setValue()
    expect(wrapper.get('.comparisons').text()).toContain('Example7.00 GBP')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['compare'])
  })

  it('recalculates provider results from supplied rates and never returns a negative amount', async () => {
    const wrapper = mount(WiseProviderComparison, { props: { amount: 100, providers: [{ name: 'Provider A', fee: 5, rate: 2 }] } })
    expect(wrapper.get('.provider-row b').text()).toBe('190.00 EUR')
    await wrapper.get('input').setValue('2')
    expect(wrapper.get('.provider-row b').text()).toBe('0.00 EUR')
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('.provider-details').text()).toContain('Transfer fee: 5.00 GBP')
  })
})
