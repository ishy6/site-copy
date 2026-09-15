import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSourceLoader, fetchSource } from './source-loader'

afterEach(() => { vi.restoreAllMocks() })

describe('on-demand component sources', () => {
  it('only loads requested files and reuses both pending and successful requests', async () => {
    const requested = vi.fn(async () => '<template>Requested</template>')
    const other = vi.fn(async () => '<template>Other</template>')
    const load = createSourceLoader({ './library/requested.vue': requested, './library/other.vue': other })
    expect(requested).not.toHaveBeenCalled()
    const first = load('library/requested.vue')
    expect(load('library/requested.vue')).toBe(first)
    await expect(first).resolves.toBe('<template>Requested</template>')
    await expect(load('library/requested.vue')).resolves.toBe('<template>Requested</template>')
    expect(requested).toHaveBeenCalledTimes(1)
    expect(other).not.toHaveBeenCalled()
  })

  it('allows retry after a failed network request', async () => {
    const requested = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce('Recovered source')
    const load = createSourceLoader({ './library/requested.vue': requested })
    await expect(load('library/requested.vue')).rejects.toThrow('Offline')
    await expect(load('library/requested.vue')).resolves.toBe('Recovered source')
    expect(requested).toHaveBeenCalledTimes(2)
    await expect(load('library/missing.vue')).rejects.toThrow('library/missing.vue')
  })

  it('reissues source fetches after HTTP and network failures', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response('<template>Recovered</template>'))
    const load = createSourceLoader({ './library/component.vue': () => fetchSource('/source/component.vue.txt') })
    await expect(load('library/component.vue')).rejects.toThrow('源码加载失败')
    await expect(load('library/component.vue')).rejects.toThrow('Failed to fetch')
    await expect(load('library/component.vue')).resolves.toBe('<template>Recovered</template>')
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
