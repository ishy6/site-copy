import type { ComponentEntry } from './registry/types'
import { defaultProps } from './registry'

export function parseRoute(hash: string) {
  const url = new URL(hash.replace(/^#/, '') || '/', 'https://components.local')
  const [, view = '', id = ''] = url.pathname.split('/')
  return { view, id, query: url.searchParams }
}

export function previewProps(entry: ComponentEntry, serialized: string | null) {
  const result = defaultProps(entry)
  if (!serialized) return result
  try {
    const input: unknown = JSON.parse(serialized)
    if (!input || typeof input !== 'object') return result
    for (const control of entry.props) {
      const value = (input as Record<string, unknown>)[control.name]
      if (typeof value !== typeof control.default) continue
      if (control.type === 'select' && !control.options?.includes(value as string)) continue
      if (typeof value === 'number' && (!Number.isFinite(value) || (control.min !== undefined && value < control.min) || (control.max !== undefined && value > control.max))) continue
      result[control.name] = value as string | number | boolean
    }
  } catch { /* Invalid links fall back to the component defaults. */ }
  return result
}

export function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('site-components:favorites') || '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch { return [] }
}
