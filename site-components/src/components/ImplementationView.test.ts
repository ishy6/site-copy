// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ImplementationView from './ImplementationView.vue'

const { getImplementation } = vi.hoisted(() => ({ getImplementation: vi.fn<(id: string) => Promise<string>>() }))
vi.mock('../implementation', () => ({ getImplementation }))
beforeEach(() => { getImplementation.mockReset() })

describe('lazy implementation view', () => {
  it('keeps a loading state, recovers from errors and emits a source location', async () => {
    getImplementation.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce('# 轮播\n\n[源码](../src/library/osmo/carousel.ts#L20)')
    const wrapper = mount(ImplementationView, { props: { id: 'osmo-toolkit-carousel' } })
    expect(wrapper.get('[role="status"]').text()).toContain('正在加载')
    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
    expect(wrapper.get('[aria-label="复制实现文档"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[aria-label="重新加载实现文档"]').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('article').exists()).toBe(true))
    expect(wrapper.get('h1').text()).toBe('轮播')
    await wrapper.get('article a').trigger('click')
    expect(wrapper.emitted('source')).toEqual([['library/osmo/carousel.ts', 20]])
    wrapper.unmount()
  })

  it('discards an old document when the component changes during a request', async () => {
    let resolveOld!: (value: string) => void
    getImplementation.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve })).mockResolvedValueOnce('# 当前文档')
    const wrapper = mount(ImplementationView, { props: { id: 'first' } })
    await wrapper.setProps({ id: 'second' })
    await vi.waitFor(() => expect(wrapper.find('h1').text()).toBe('当前文档'))
    resolveOld('# 过期文档')
    await flushPromises()
    expect(wrapper.get('h1').text()).toBe('当前文档')
    wrapper.unmount()
  })
})
