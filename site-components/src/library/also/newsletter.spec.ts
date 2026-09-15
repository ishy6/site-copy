import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import NewsletterForm from './NewsletterForm.vue'

describe('ALSO newsletter submission', () => {
  it('requires a valid email and consent, and distinguishes validation from a real subscription', async () => {
    const wrapper = mount(NewsletterForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.get('input[type="email"]').setValue('person@example.com')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('submit')).toEqual([['person@example.com']])
    expect(wrapper.text()).toContain('Email validated')
    expect(wrapper.text()).not.toContain('You are on the list')
    wrapper.unmount()
  })

  it('retains email on server failure and allows a successful retry', async () => {
    const subscribe = vi.fn().mockRejectedValueOnce(new Error('Please try again.')).mockResolvedValueOnce(undefined)
    const wrapper = mount(NewsletterForm, { props: { onSubscribe: subscribe } })
    await wrapper.get('input[type="email"]').setValue('person@example.com')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Please try again.')
    expect((wrapper.get('input[type="email"]').element as HTMLInputElement).value).toBe('person@example.com')
    expect(wrapper.emitted('success')).toBeUndefined()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(subscribe).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('You are on the list.')
    expect(wrapper.emitted('success')).toEqual([['person@example.com']])
    await wrapper.get('form').trigger('submit')
    expect(subscribe).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })
})
