import { readFileSync, existsSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import ts from 'typescript'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { entries, filterEntries, getSource, sites } from './registry'
import { parseRoute, previewProps, readFavorites } from './catalog-state'

describe('catalog registration and portable source packages', () => {
  beforeAll(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      const url = new URL(String(input), 'http://localhost')
      if (!url.searchParams.has('source-download') || !url.pathname.startsWith('/src/library/')) throw new Error(`Unexpected source URL: ${url}`)
      return new Response(readFileSync(resolve(`.${url.pathname}`), 'utf8'))
    })
  })
  afterAll(() => { vi.restoreAllMocks() })

  it('covers every project with distinct, renderable components and complete local files', async () => {
    expect(new Set(entries.map(entry => entry.id)).size).toBe(entries.length)
    for (const site of sites) expect(entries.filter(entry => entry.site === site.id).length).toBeGreaterThanOrEqual(2)
    for (const entry of entries) {
      expect((await entry.loadComponent()).default).toBeTruthy()
      expect(entry.source).toContain(sites.find(site => site.id === entry.site)!.domain)
      expect(entry.usage).toContain('<')
      for (const file of entry.files) expect(await getSource(file), `${entry.id}: ${file}`).toBe(readFileSync(resolve('src', file), 'utf8'))
      for (const asset of entry.assets ?? []) expect(existsSync(resolve('public', `.${asset}`)), asset).toBe(true)
    }
    for (const site of sites) expect(existsSync(resolve('..', site.source)), site.source).toBe(true)
  })

  it('combines keyword, site, category and favorite filters', () => {
    const filters = { query: 'osmo 按钮', site: 'osmo', category: 'Buttons', favoritesOnly: true, favorites: ['osmo-motion-button'] }
    expect(filterEntries(entries, filters).map(entry => entry.id)).toEqual(['osmo-motion-button'])
    expect(filterEntries(entries, { ...filters, favorites: [] })).toEqual([])
    expect(filterEntries(entries, { ...filters, query: 'not-present' })).toEqual([])
    expect(filterEntries(entries, { ...filters, category: 'Forms' })).toEqual([])
  })

  it('exports local import closures and compilable usage examples', async () => {
    for (const entry of entries) {
      for (const file of entry.files) {
        const raw = await getSource(file)
        const descriptor = file.endsWith('.vue') ? parse(raw).descriptor : undefined
        const code = descriptor ? [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n') : raw
        for (const dependency of ts.preProcessFile(code).importedFiles) {
          if (!dependency.fileName.startsWith('.')) continue
          const path = posix.normalize(`${dirname(file)}/${dependency.fileName}`)
          expect([path, `${path}.ts`, `${path}.vue`, `${path}/index.ts`].some(candidate => entry.files.includes(candidate)), `${entry.id}: missing imported ${path}`).toBe(true)
        }
      }
      const { descriptor, errors } = parse(entry.usage, { filename: 'Example.vue' })
      expect(errors, entry.id).toEqual([])
      const script = descriptor.script || descriptor.scriptSetup ? compileScript(descriptor, { id: entry.id }) : undefined
      const template = compileTemplate({ source: descriptor.template!.content, filename: 'Example.vue', id: entry.id, compilerOptions: { bindingMetadata: script?.bindings, expressionPlugins: ['typescript'] } })
      expect(template.errors, `${entry.id}: usage template`).toEqual([])
    }
  })

  it('accepts only valid registered values from a standalone preview link', () => {
    const button = entries.find(entry => entry.id === 'osmo-motion-button')!
    expect(previewProps(button, '{invalid')).toMatchObject({ variant: 'dark', disabled: false })
    expect(previewProps(button, JSON.stringify({ variant: 'unknown', disabled: 'false', arrow: false, label: 'Preview', injected: 'anything' })))
      .toEqual({ variant: 'dark', disabled: false, arrow: false, label: 'Preview' })
    const timeline = entries.find(entry => entry.id === 'jitter-motion-timeline')!
    expect(previewProps(timeline, JSON.stringify({ duration: -20 })).duration).toBe(4)
    expect(previewProps(timeline, JSON.stringify({ duration: 8 })).duration).toBe(8)
    expect(parseRoute('#/preview/osmo-motion-button?props=%7B%7D')).toMatchObject({ view: 'preview', id: 'osmo-motion-button' })
  })

  it('recovers from malformed saved state without crashing the catalog', () => {
    localStorage.setItem('site-components:favorites', 'null')
    expect(readFavorites()).toEqual([])
    localStorage.setItem('site-components:favorites', '["osmo-motion-button",123,null]')
    expect(readFavorites()).toEqual(['osmo-motion-button'])
    localStorage.setItem('site-components:favorites', '{broken')
    expect(readFavorites()).toEqual([])
    localStorage.clear()
  })
})
