import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentEntry } from '../registry/types'
import ComponentDetail from './ComponentDetail.vue'

const { getSource } = vi.hoisted(() => ({ getSource: vi.fn<(path: string) => Promise<string>>() }))
vi.mock('../registry', async importOriginal => ({ ...await importOriginal<typeof import('../registry')>(), getSource }))

const entry: ComponentEntry = {
  id: 'source-test', title: 'Source test', summary: '', site: 'osmo', category: 'Media',
  loadComponent: async () => ({ default: {} }), tags: [], source: 'osmo.supply/src/test.vue',
  sourceKind: 'extracted', files: ['library/First.vue', 'library/Second.vue'], usage: '<First />', props: [], background: '#fff',
}
function mountDetail() {
  return mount(ComponentDetail, { props: { entry, saved: false, backHref: '#/' }, global: { stubs: { PreviewFrame: true } } })
}
function deferred() {
  let resolve!: (value: string) => void
  const promise = new Promise<string>(done => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => { getSource.mockReset() })

describe('lazy source panel', () => {
  it('keeps preview and usage local without fetching component source', async () => {
    const wrapper = mountDetail()
    expect(getSource).not.toHaveBeenCalled()
    await wrapper.get('#tab-usage').trigger('click')
    expect(wrapper.get('pre').text()).toBe('<First />')
    expect(getSource).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('shows loading and discards an older file response after switching files', async () => {
    const first = deferred()
    const second = deferred()
    getSource.mockImplementation(path => path.endsWith('First.vue') ? first.promise : second.promise)
    const wrapper = mountDetail()
    await wrapper.get('#tab-source').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('Loading source...')
    await wrapper.findAll('.source-file-list button')[1]!.trigger('click')
    second.resolve('Second source')
    await flushPromises()
    expect(wrapper.get('pre').text()).toBe('Second source')
    first.resolve('Stale first source')
    await flushPromises()
    expect(wrapper.get('pre').text()).toBe('Second source')
    wrapper.unmount()
  })

  it('shows a retry control after failure and recovers without leaving the panel', async () => {
    getSource.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce('Recovered source')
    const wrapper = mountDetail()
    await wrapper.get('#tab-source').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('源码加载失败')
    expect(wrapper.get('[aria-label="复制源码"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[aria-label="重新加载源码"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('pre').text()).toBe('Recovered source')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('discards pending source content when navigating to a different component', async () => {
    const pending = deferred()
    getSource.mockReturnValue(pending.promise)
    const wrapper = mountDetail()
    await wrapper.get('#tab-source').trigger('click')
    await wrapper.setProps({ entry: { ...entry, id: 'another-component', usage: '<Second />' } })
    await wrapper.get('#tab-usage').trigger('click')
    pending.resolve('Old component source')
    await flushPromises()
    expect(wrapper.get('pre').text()).toBe('<Second />')
    wrapper.unmount()
  })
})
