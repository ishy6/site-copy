import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import AuthFlow from './AuthFlow.vue'
import { emptyProfile, profile, projects } from '../state'

beforeAll(() => {
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
})

beforeEach(() => {
  Object.assign(profile, emptyProfile())
  projects.value = []
  localStorage.clear()
})

describe('email demo registration', () => {
  it('shows the local-only disclosure before requesting any account information', () => {
    const wrapper = mount(AuthFlow, { props: { route: '/join' } })
    expect(wrapper.text()).toContain('No real account is created')
    expect(wrapper.find('input[type="password"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('validates email and demo code before entering onboarding', async () => {
    const wrapper = mount(AuthFlow, { props: { route: '/join' } })
    await wrapper.get('.email-button').trigger('click')
    await wrapper.get('#auth-email').setValue('not-an-email')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toContain('valid email')
    expect(profile.active).toBe(false)
    await wrapper.get('#auth-email').setValue('alex@example.com')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('NO EMAIL SENT')
    await wrapper.get('#verification-code').setValue('999999')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toContain('doesn’t match')
    expect(profile.active).toBe(false)
    await wrapper.get('#verification-code').setValue('123456')
    await wrapper.get('form').trigger('submit')
    expect(profile.active).toBe(true)
    expect(wrapper.emitted('navigate')?.at(-1)).toEqual(['/onboarding'])
    wrapper.unmount()
  })

  it('completes all four steps and persists the workspace', async () => {
    profile.active = true
    profile.email = 'alex@example.com'
    const wrapper = mount(AuthFlow, { props: { route: '/onboarding' } })
    expect(wrapper.get('.setup-continue').attributes('disabled')).toBeDefined()
    await wrapper.get('#full-name').setValue('Alex Morgan')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Your role')
    expect(wrapper.get('.setup-continue').attributes('disabled')).toBeDefined()
    await wrapper.get('.role-option').trigger('click')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('.experience-option').trigger('click')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get<HTMLInputElement>('#workspace-name').element.value).toBe('Alex Morgan’s workspace')
    await wrapper.get('#workspace-name').setValue('Studio North')
    await wrapper.get('form').trigger('submit')
    expect(profile.complete).toBe(true)
    expect(profile.workspace).toBe('Studio North')
    expect(profile.role).toBe('Designer')
    expect(wrapper.emitted('navigate')?.at(-1)).toEqual(['/files'])
    expect(JSON.parse(localStorage.getItem('jitter-demo-profile')!).workspace).toBe('Studio North')
    wrapper.unmount()
  })

  it('resumes saved onboarding and retains choices when going back', async () => {
    Object.assign(profile, { active: true, email: 'alex@example.com', name: 'Alex', role: 'Designer', step: 2 })
    const wrapper = mount(AuthFlow, { props: { route: '/onboarding' } })
    expect(wrapper.text()).toContain('Your experience')
    await wrapper.get('.setup-back').trigger('click')
    expect(wrapper.get('.role-option.selected').text()).toContain('Designer')
    expect(profile.step).toBe(1)
    wrapper.unmount()
  })
})
