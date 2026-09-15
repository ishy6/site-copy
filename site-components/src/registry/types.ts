import type { Component } from 'vue'

export type Category = 'Buttons' | 'Navigation' | 'Commerce' | 'Forms' | 'Typography' | 'Media'
export type SiteId = 'osmo' | 'wise' | 'shop' | 'jitter' | '21tsi' | 'makr' | 'also' | 'shupatto'

export interface PropControl {
  name: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'color'
  default: string | number | boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
  description?: string
}

export interface ComponentEntry {
  id: string
  title: string
  summary: string
  site: SiteId
  category: Category
  loadComponent: () => Promise<{ default: Component }>
  tags: string[]
  source: string
  sourceKind: 'extracted' | 'adapted'
  // Source files are relative to src/. Include every local dependency.
  files: string[]
  // Public asset paths included in the downloadable component package.
  assets?: string[]
  usage: string
  props: PropControl[]
  background: string
  foreground?: string
}
