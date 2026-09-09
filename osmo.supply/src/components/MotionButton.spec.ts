// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import MotionButton from './MotionButton.vue'

let wrapper: VueWrapper | undefined

beforeEach(() => {
  vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ matches: false }) as MediaQueryList)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
})

describe('MotionButton', () => {
  it('renders a native button without a wrapper and forwards attributes and events', async () => {
    const onKeydown = vi.fn()
    wrapper = mount(MotionButton, {
      props: { label: 'Save' },
      attrs: { class: 'existing-button', 'data-action': 'save', 'aria-label': 'Save changes', onKeydown },
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('existing-button')
    expect(wrapper.attributes('data-action')).toBe('save')
    expect(wrapper.attributes('aria-label')).toBe('Save changes')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(onKeydown).toHaveBeenCalledOnce()
  })

  it('preserves link semantics, focus attributes and the direct icon slot', async () => {
    const onClick = vi.fn((event: MouseEvent) => {
      expect(event.defaultPrevented).toBe(false)
      event.preventDefault()
    })
    wrapper = mount(MotionButton, {
      props: { label: 'Discover', href: '/product', full: true },
      attrs: { target: '_blank', rel: 'noreferrer', tabindex: -1, onClick },
      slots: { default: '<svg aria-hidden="true"></svg>' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes()).toMatchObject({ href: '/product', target: '_blank', rel: 'noreferrer', tabindex: '-1' })
    expect(wrapper.attributes('type')).toBeUndefined()
    expect(wrapper.element.querySelector(':scope > svg')).not.toBeNull()
    expect(wrapper.get('.button-roll').attributes('style')).toContain('--roll-origin: 5700%')
    expect(wrapper.findAll('[aria-hidden="true"].button-roll__label')).toHaveLength(1)
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('preserves native submit and reset button types', async () => {
    wrapper = mount(MotionButton, { props: { label: 'Send', type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
    await wrapper.setProps({ type: 'reset' })
    expect(wrapper.attributes('type')).toBe('reset')
  })

  it('blocks disabled buttons and restores interaction when enabled', async () => {
    wrapper = mount(MotionButton, { props: { label: 'Save', disabled: true } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    await wrapper.setProps({ disabled: false })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('prevents disabled link navigation without discarding its destination', async () => {
    wrapper = mount(MotionButton, { props: { label: 'Join', href: '/plans', disabled: true }, attrs: { tabindex: 0 } })
    expect(wrapper.attributes()).toMatchObject({ href: '/plans', 'aria-disabled': 'true', tabindex: '-1' })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('click')).toBeUndefined()
    await wrapper.setProps({ disabled: false })
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('updates labels without replacing the native button', async () => {
    wrapper = mount(MotionButton, { props: { label: 'Send', inheritSize: true } })
    const element = wrapper.element
    await wrapper.setProps({ label: 'Sending…' })
    expect(wrapper.element).toBe(element)
    expect(wrapper.get('.button-roll').classes()).toContain('button-roll--inherit')
    expect(wrapper.findAll('.button-roll__label').map(label => label.text())).toEqual(['Sending…', 'Sending…'])
  })

  it('keeps its motion class when consumer classes change', async () => {
    wrapper = mount(MotionButton, { props: { label: 'Annual' }, attrs: { class: 'option' } })
    await wrapper.setProps({ class: 'option active' })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['option', 'active', 'has-button-roll']))
    await wrapper.setProps({ class: 'option' })
    expect(wrapper.classes()).toContain('has-button-roll')
    expect(wrapper.classes()).not.toContain('active')
  })
})
