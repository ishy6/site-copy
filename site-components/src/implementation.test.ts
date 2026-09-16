// @vitest-environment jsdom
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { marked } from 'marked'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { entries } from './registry'
import { renderHighlightedImplementation, renderImplementation, sourceReference } from './implementation-content'

describe('implementation documentation', () => {
  it('covers every registered component and indexes each document', () => {
    const files = readdirSync('implementation').filter(file => file !== 'README.md').sort()
    expect(files).toEqual(entries.map(entry => `${entry.id}.md`).sort())
    const index = readFileSync('implementation/README.md', 'utf8')
    for (const entry of entries) expect(index).toContain(`(${entry.id}.md)`)
  })

  for (const entry of entries) it(`${entry.id}: has exact source excerpts, resolvable links and compilable examples`, () => {
    const markdown = readFileSync(`implementation/${entry.id}.md`, 'utf8')
    const tokens = marked.lexer(markdown).filter(token => token.type !== 'space')
    const exportedSources = new Set(entry.files)
    marked.walkTokens(tokens, token => {
      if (token.type !== 'link') return
      const reference = sourceReference(token.href)
      if (reference) exportedSources.add(reference.path)
    })
    let excerpts = 0
    let examples = 0
    for (const [index, token] of tokens.entries()) {
      if (token.type !== 'code') continue
      const previous = tokens[index - 1]
      const source = previous?.type === 'html' ? /<!-- source: (.+)#L(\d+)-L(\d+) -->/.exec(previous.text) : null
      if (source) {
        excerpts++
        expect(exportedSources.has(source[1]!.replace(/^src\//, '')), `${entry.id}: excerpt source must be included in ZIP`).toBe(true)
        const lines = readFileSync(resolve(source[1]!), 'utf8').split('\n')
        const start = Number(source[2])
        const end = Number(source[3])
        expect(start).toBeGreaterThan(0)
        expect(end).toBeGreaterThanOrEqual(start)
        expect(end).toBeLessThanOrEqual(lines.length)
        expect(token.text.trimEnd(), `${entry.id}: ${source[0]}`).toBe(lines.slice(start - 1, end).join('\n').trimEnd())
      } else if (token.lang === 'vue') {
        examples++
        const filename = `${entry.id}-${examples}.vue`
        const { descriptor, errors } = parse(token.text, { filename })
        expect(errors, filename).toEqual([])
        const script = descriptor.script || descriptor.scriptSetup ? compileScript(descriptor, { id: filename }) : undefined
        expect(descriptor.template, filename).toBeTruthy()
        const template = compileTemplate({ source: descriptor.template!.content, filename, id: filename, compilerOptions: { bindingMetadata: script?.bindings, expressionPlugins: ['typescript'] } })
        expect(template.errors, filename).toEqual([])
        const scriptContent = [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n')
        for (const dependency of ts.preProcessFile(scriptContent).importedFiles) {
          if (!dependency.fileName.startsWith('.')) continue
          const path = resolve('src/examples', dependency.fileName)
          expect([path, `${path}.ts`, `${path}.vue`].some(candidate => existsSync(candidate)), `${filename}: ${dependency.fileName}`).toBe(true)
        }
      }
    }
    expect(excerpts).toBeGreaterThanOrEqual(2)
    expect(examples).toBeGreaterThanOrEqual(1)
    marked.walkTokens(tokens, token => {
      if (token.type !== 'link' || !token.href.startsWith('.')) return
      const [path, hash] = token.href.split('#')
      const file = resolve('implementation', decodeURIComponent(path!))
      expect(existsSync(file), `${entry.id}: ${token.href}`).toBe(true)
      if (hash?.match(/^L\d+$/)) expect(Number(hash.slice(1))).toBeLessThanOrEqual(readFileSync(file, 'utf8').split('\n').length)
    })
  })

  it('renders navigable source references and responsive tables while removing executable HTML', () => {
    const markdown = '# 文档\n\n## 事件\n\n[处理函数](../src/library/osmo/carousel.ts#L20)\n\n<!-- source: src/library/osmo/carousel.ts#L20-L22 -->\n```ts\nconst x = 1\n```\n\n| 参数 | 默认 |\n| --- | --- |\n| value | 0 |\n\n<script>alert(1)</script><img src="x" onerror="alert(2)">\n\n[危险](javascript:alert(3))'
    const result = renderImplementation(markdown)
    const root = document.createElement('div')
    root.innerHTML = result.html
    expect(result.headings).toEqual([{ id: 'implementation-heading-1', label: '事件', depth: 2 }])
    expect([...result.references.values()]).toEqual([{ path: 'library/osmo/carousel.ts', line: 20 }, { path: 'library/osmo/carousel.ts', line: 20 }])
    expect(root.querySelector('.implementation-table table')).not.toBeNull()
    expect(root.querySelectorAll('script, [onerror], [href^="javascript:"]')).toHaveLength(0)
    expect(sourceReference('../src/library/../../private.ts#L1')).toBeNull()
  })

  it('keeps syntax colors, exact code and sanitization in highlighted Markdown', async () => {
    const source = 'const template: string = "<img src=x onerror=alert(1)>"'
    const result = await renderHighlightedImplementation(`## 实现\n\n\`\`\`ts\n${source}\n\`\`\`\n\n<img src=x onerror=alert(2)>`)
    const root = document.createElement('div')
    root.innerHTML = result.html
    expect(root.querySelector('pre.shiki code')?.textContent).toBe(source)
    expect(root.querySelector('[data-line="1"]')).not.toBeNull()
    expect(root.querySelectorAll('pre code span[style]').length).toBeGreaterThan(3)
    expect(root.querySelector('pre img, [onerror]')).toBeNull()
  })
})
