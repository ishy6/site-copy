// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import BillingSwitch from './BillingSwitch.vue'

let wrapper: VueWrapper | undefined

function renderSwitch() {
  const page: VueWrapper = mount(BillingSwitch, {
    attachTo: document.body,
    props: {
      modelValue: 'annual',
      'onUpdate:modelValue': (value) => page.setProps({ modelValue: value }),
    },
  })
  wrapper = page
  return page
}

beforeEach(() => {
  vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ matches: false }) as MediaQueryList)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
})

describe('BillingSwitch', () => {
  it('preserves fixed button shapes and a single selected period', async () => {
    const page = renderSwitch()
    expect(page.attributes('role')).toBe('group')
    expect(page.attributes('aria-label')).toBe('Billing period')
    const buttons = page.findAll('button')
    const elements = buttons.map(button => button.element)
    expect(buttons.map(button => button.attributes('aria-pressed'))).toEqual(['false', 'true'])
    await buttons[0]!.trigger('click')
    expect(buttons.map(button => button.attributes('aria-pressed'))).toEqual(['true', 'false'])
    expect(buttons[0]!.classes()).toContain('billing-switch__option--quarterly')
    expect(buttons[1]!.classes()).toContain('billing-switch__option--annual')
    expect(buttons.every(button => button.classes().includes('has-button-roll'))).toBe(true)
    expect(page.findAll('button').map(button => button.element)).toEqual(elements)
  })

  it('does not emit a redundant change for the selected option', async () => {
    const page = renderSwitch()
    await page.get('.billing-switch__option--annual').trigger('click')
    expect(page.emitted('update:modelValue')).toBeUndefined()
  })

  it('applies the last rapid selection without waiting for hover animations', async () => {
    const page = renderSwitch()
    const buttons = page.findAll('button')
    for (let iteration = 0; iteration < 5; iteration++) {
      await buttons[0]!.trigger('click')
      await buttons[1]!.trigger('click')
    }
    await buttons[0]!.trigger('click')
    expect(page.emitted('update:modelValue')).toHaveLength(11)
    expect(page.get('[aria-pressed="true"]').classes()).toContain('billing-switch__option--quarterly')
    expect(buttons.every(button => button.classes().includes('has-button-roll'))).toBe(true)
  })

  it('supports directional keys, wrapping, Home and End without losing focus', async () => {
    const page = renderSwitch()
    const buttons = page.findAll('button')
    await buttons[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    expect(buttons[0]!.attributes('aria-pressed')).toBe('true')
    await buttons[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(buttons[1]!.element)
    await buttons[1]!.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    await buttons[0]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(buttons[1]!.element)
    expect(buttons[1]!.attributes('aria-pressed')).toBe('true')
  })

  it('leaves Tab to the browser and responds to external model changes', async () => {
    const page = renderSwitch()
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    page.get('button').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(page.emitted('update:modelValue')).toBeUndefined()
    await page.setProps({ modelValue: 'quarterly' })
    expect(page.get('.billing-switch__option--quarterly').attributes('aria-pressed')).toBe('true')
  })
})
