import { describe, expect, it, vi } from 'vitest'
import { highlightCode } from './syntax-highlighter'

function parse(html: string) {
  const container = document.createElement('div')
  container.innerHTML = html
  return container
}

function tokenWithText(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll<HTMLSpanElement>('.source-line > span'))
    .find(token => token.textContent === text)
}

describe('VS Code Dark+ syntax highlighting', () => {
  it('uses the real Dark+ colors for TypeScript tokens and the code surface', async () => {
    const container = parse(await highlightCode('const count: number = 42\nconst label = "hello"', 'ts'))
    const pre = container.querySelector('pre')!
    expect(pre.classList.contains('dark-plus')).toBe(true)
    expect(pre.getAttribute('tabindex')).toBe('0')
    expect(pre.style.backgroundColor).toBe('#1E1E1E')
    expect(pre.style.color).toBe('#D4D4D4')
    expect(tokenWithText(container, 'const')?.getAttribute('style')).toBe('color:#569CD6')
    expect(tokenWithText(container, 'number')?.getAttribute('style')).toBe('color:#4EC9B0')
    expect(tokenWithText(container, '42')?.getAttribute('style')).toBe('color:#B5CEA8')
    expect(tokenWithText(container, '"hello"')?.getAttribute('style')).toBe('color:#CE9178')
  })

  it('highlights the template, TypeScript script and CSS style inside a Vue SFC', async () => {
    const source = '<script setup lang="ts">\nconst count: number = 42\n</script>\n<template><button>{{ count }}</button></template>\n<style scoped>\nbutton { color: red; }\n</style>'
    const container = parse(await highlightCode(source, 'vue'))
    expect(tokenWithText(container, 'const')?.getAttribute('style')).toBe('color:#569CD6')
    expect(tokenWithText(container, 'number')?.getAttribute('style')).toBe('color:#4EC9B0')
    expect(tokenWithText(container, 'color')?.getAttribute('style')).toBe('color:#9CDCFE')
    expect(tokenWithText(container, 'red')?.getAttribute('style')).toBe('color:#CE9178')
    expect(container.querySelector('code')?.textContent).toBe(source)
  })

  it.each(['unknown-language', 'text', 'constructor', '<img onerror=alert(1)>'])(
    'falls back to escaped plain text for %s',
    async language => {
      const source = '<script>alert("code only")</script>\n<img src=x onerror=alert(1)> & "quoted"'
      const container = parse(await highlightCode(source, language))
      expect(container.querySelector('code')?.textContent).toBe(source)
      expect(container.querySelector('script, img')).toBeNull()
      expect(container.querySelectorAll('[onerror]')).toHaveLength(0)
    },
  )

  it.each(['', '\n', '\n  const count = 1\n\n', '\tconst label = "中文"  \r\n\r\n'])(
    'preserves exact source text and 1-based line numbers for %j',
    async source => {
      const container = parse(await highlightCode(source, 'typescript'))
      const lines = Array.from(container.querySelectorAll<HTMLElement>('.source-line'))
      expect(container.querySelector('code')?.textContent).toBe(source)
      expect(lines).toHaveLength(source.split(/\r?\n/).length)
      expect(lines.map(line => line.dataset.line)).toEqual(lines.map((_, index) => String(index + 1)))
      expect(lines.map(line => line.textContent)).toEqual(source.split(/\r?\n/))
    },
  )

  it('supports the documentation language aliases with a shared initialized highlighter', async () => {
    const samples = [
      ['js', 'const enabled = true'],
      ['css', '.button { color: red; }'],
      ['html', '<button type="button">Run</button>'],
      ['json', '{ "enabled": true }'],
      ['sh', 'npm run build'],
    ] as const
    const results = await Promise.all(samples.map(async ([language, source]) => ({
      source,
      container: parse(await highlightCode(source, language)),
    })))
    for (const { source, container } of results) {
      expect(container.querySelector('code')?.textContent).toBe(source)
      expect(container.querySelectorAll('.source-line > span[style]').length).toBeGreaterThan(0)
    }
  })

  it('loads only requested grammars, shares pending requests and retries failed registration', async () => {
    const actual = await vi.importActual<typeof import('shiki/core')>('shiki/core')
    type Highlighter = Awaited<ReturnType<typeof actual.createHighlighterCore>>
    let highlighter: Highlighter | undefined
    const register = vi.fn<Highlighter['loadLanguage']>()
      .mockRejectedValueOnce(new Error('Grammar temporarily unavailable'))
    const create = vi.fn<typeof actual.createHighlighterCore>(async options => {
      highlighter = await actual.createHighlighterCore(options)
      register.mockImplementation((...languages) => highlighter!.loadLanguage(...languages))
      return { ...highlighter, loadLanguage: register }
    })
    vi.doMock('shiki/core', () => ({ ...actual, createHighlighterCore: create }))
    vi.resetModules()
    try {
      const isolated = await import('./syntax-highlighter')
      await isolated.highlightCode('Plain text', 'unknown')
      expect(create).toHaveBeenCalledTimes(1)
      expect(highlighter!.getLoadedLanguages()).toEqual([])
      expect(register).not.toHaveBeenCalled()

      const results = await Promise.allSettled([
        isolated.highlightCode('const count = 1', 'ts'),
        isolated.highlightCode('const count = 2', 'typescript'),
      ])
      expect(results.map(result => result.status)).toEqual(['rejected', 'rejected'])
      expect(register).toHaveBeenCalledTimes(1)

      const highlighted = await isolated.highlightCode('const count = 3', 'ts')
      expect(tokenWithText(parse(highlighted), 'const')?.getAttribute('style')).toBe('color:#569CD6')
      await isolated.highlightCode('const count = 4', 'typescript')
      expect(create).toHaveBeenCalledTimes(1)
      expect(register).toHaveBeenCalledTimes(2)
      expect(highlighter!.getLoadedLanguages()).toContain('typescript')
      expect(highlighter!.getLoadedLanguages()).not.toContain('vue')
      expect(highlighter!.getLoadedLanguages()).not.toContain('css')

      await Promise.all([
        isolated.highlightCode('<style>button { color: red; }</style>', 'vue'),
        isolated.highlightCode('button { color: red; }', 'css'),
      ])
      expect(highlighter!.getLoadedLanguages()).toContain('vue')
      expect(highlighter!.getLoadedLanguages()).toContain('css')
    } finally {
      highlighter?.dispose()
      vi.doUnmock('shiki/core')
      vi.resetModules()
    }
  })
})
