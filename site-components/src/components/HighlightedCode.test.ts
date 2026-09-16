import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import HighlightedCode from './HighlightedCode.vue'

const { highlightCode } = vi.hoisted(() => ({ highlightCode: vi.fn<(code: string, language: string) => Promise<string>>() }))
vi.mock('../syntax-highlighter', () => ({ highlightCode }))
beforeEach(() => { highlightCode.mockReset() })

it('retains readable, escaped source when highlighting is unavailable', async () => {
  highlightCode.mockRejectedValueOnce(new Error('Offline'))
  const source = '<script>alert("source only")</script>\n'
  const wrapper = mount(HighlightedCode, { props: { code: source, language: 'vue' } })
  expect(wrapper.get('code').element.textContent).toBe(source)
  await vi.waitFor(() => expect(highlightCode).toHaveBeenCalled())
  await flushPromises()
  expect(wrapper.get('code').element.textContent).toBe(source)
  expect(wrapper.find('script').exists()).toBe(false)
  expect(wrapper.attributes('aria-busy')).toBe('false')
  wrapper.unmount()
})

it('discards stale highlighting after switching source files', async () => {
  let resolveOld!: (html: string) => void
  highlightCode.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve }))
    .mockResolvedValueOnce('<pre class="shiki"><code><span class="source-line" data-line="1">Current source</span></code></pre>')
  const wrapper = mount(HighlightedCode, { props: { code: 'Old source', language: 'ts' } })
  await vi.waitFor(() => expect(highlightCode).toHaveBeenCalledTimes(1))
  await wrapper.setProps({ code: 'Current source' })
  await vi.waitFor(() => expect(wrapper.find('pre.shiki').exists()).toBe(true))
  resolveOld('<pre><code>Old source</code></pre>')
  await flushPromises()
  expect(wrapper.get('code').text()).toBe('Current source')
  wrapper.unmount()
})
