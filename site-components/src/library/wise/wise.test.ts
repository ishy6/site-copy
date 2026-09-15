import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WiseCurrencyConverter from './WiseCurrencyConverter.vue'

describe('Wise currency converter', () => {
  it('deducts a rounded fee before conversion and emits the complete quote', async () => {
    const wrapper = mount(WiseCurrencyConverter, { props: { amount: 1000, sourceCurrency: 'USD', targetCurrency: 'HKD', feePercent: 0.65 } })
    expect(wrapper.get('output').text()).toBe('7,749.30')
    await wrapper.get('input').setValue('2000')
    expect(wrapper.get('output').text()).toBe('15,498.60')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ amount: 2000, received: 15498.6, fee: 13, source: 'USD', target: 'HKD' }])
  })

  it('swaps currency selections and recalculates using the reciprocal rate', async () => {
    const wrapper = mount(WiseCurrencyConverter, { props: { amount: 100, sourceCurrency: 'USD', targetCurrency: 'HKD', feePercent: 0 } })
    await wrapper.get('[aria-label="Swap currencies"]').trigger('click')
    expect(wrapper.get('output').text()).toBe('12.82')
    expect(wrapper.emitted('update:sourceCurrency')?.[0]).toEqual(['HKD'])
    expect(wrapper.emitted('update:targetCurrency')?.[0]).toEqual(['USD'])
  })

  it('keeps negative input and an empty currency table from producing invalid quotes', async () => {
    const wrapper = mount(WiseCurrencyConverter)
    await wrapper.get('input').setValue('-5')
    expect(wrapper.get('output').text()).toBe('0.00')
    await wrapper.setProps({ currencies: [] })
    expect(wrapper.text()).toBe('No currencies available')
    expect(wrapper.find('output').exists()).toBe(false)
  })
})
