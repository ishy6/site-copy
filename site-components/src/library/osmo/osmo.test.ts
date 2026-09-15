import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MotionButton from './MotionButton.vue'
import BillingSwitch from './BillingSwitch.vue'

describe('Osmo native controls', () => {
  it('preserves native button and disabled link semantics', async () => {
    const button = mount(MotionButton, { props: { label: 'Explore' } })
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    await button.trigger('click')
    expect(button.emitted('click')).toHaveLength(1)
    button.unmount()
    const link = mount(MotionButton, { props: { label: 'Explore', href: '/example', disabled: true } })
    expect(link.element.tagName).toBe('A')
    expect(link.attributes('tabindex')).toBe('-1')
    expect(link.attributes('aria-disabled')).toBe('true')
    const click = new MouseEvent('click', { cancelable: true })
    link.element.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(true)
    expect(link.emitted('click')).toBeUndefined()
    link.unmount()
  })

  it('changes billing by keyboard and does not re-emit the same selection', async () => {
    const wrapper = mount(BillingSwitch, { props: { modelValue: 'annual' }, attachTo: document.body })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.findAll('button')[1]!.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['quarterly']])
    expect(document.activeElement).toBe(wrapper.find('button').element)
    wrapper.unmount()
  })
})
