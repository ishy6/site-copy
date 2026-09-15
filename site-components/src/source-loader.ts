import sourceUrls from 'virtual:component-source-urls'

export function createSourceLoader(files: Record<string, () => Promise<string>>) {
  const pending = new Map<string, Promise<string>>()
  return function loadSource(path: string): Promise<string> {
    const cached = pending.get(path)
    if (cached) return cached
    const load = files[`./${path}`]
    if (!load) return Promise.reject(new Error(`缺少源码文件：${path}`))
    const request = Promise.resolve().then(load).catch(error => {
      pending.delete(path)
      throw error
    })
    pending.set(path, request)
    return request
  }
}

export async function fetchSource(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('源码加载失败')
  return response.text()
}

const sourceFiles = Object.fromEntries(Object.entries(sourceUrls).map(([path, url]) => [path, () => fetchSource(url)]))
export const getSource = createSourceLoader(sourceFiles)
