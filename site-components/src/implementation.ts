const urls = import.meta.glob(['../implementation/*.md', '!../implementation/README.md'], { query: '?url&no-inline', import: 'default', eager: true }) as Record<string, string>
const requests = new Map<string, Promise<string>>()

export function getImplementation(id: string): Promise<string> {
  const cached = requests.get(id)
  if (cached) return cached
  const url = urls[`../implementation/${id}.md`]
  if (!url || id === 'README') return Promise.reject(new Error('未找到组件实现文档'))
  const request = (async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
    if (!response.ok) throw new Error('实现文档加载失败')
    return response.text()
  })().catch(error => { requests.delete(id); throw error })
  requests.set(id, request)
  return request
}
