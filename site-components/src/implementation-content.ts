import { Marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'

export function sourceReference(href: string) {
  const match = /^\.\.\/src\/(library\/[\w./-]+\.(?:vue|ts|css))(?:#L(\d+)(?:-L?\d+)?)?$/.exec(href)
  if (!match || match[1]!.split('/').includes('..')) return null
  return { path: match[1]!, line: Number(match[2] ?? 1) }
}

export function renderImplementation(markdown: string, codeBlocks?: Map<string, string>) {
  const headings: { id: string; label: string; depth: number }[] = []
  const references = new Map<string, { path: string; line: number }>()
  function sourceLink(reference: { path: string; line: number }, label: string) {
    const id = `source-reference-${references.size}`
    references.set(id, reference)
    return `<a href="#${id}" data-source-reference="${id}">${label}</a>`
  }
  const parser = new Marked({
    renderer: {
      code({ text, lang }) { return codeBlocks?.get(JSON.stringify([lang ?? '', text])) ?? false },
      heading({ tokens, depth }) {
        const id = `implementation-heading-${headings.length}`
        const label = this.parser.parseInline(tokens)
        headings.push({ id, label: DOMPurify.sanitize(label, { ALLOWED_TAGS: [] }), depth })
        return `<h${depth} id="${id}">${label}</h${depth}>`
      },
      link(token) {
        const reference = sourceReference(token.href)
        if (!reference) return false
        return sourceLink(reference, this.parser.parseInline(token.tokens))
      },
      html({ text }) {
        const match = /^<!-- source: (src\/library\/[\w./-]+)#L(\d+)-L(\d+) -->\s*$/.exec(text)
        if (!match) return false
        const reference = sourceReference(`../${match[1]}#L${match[2]}`)
        return reference ? `<p class="implementation-source">${sourceLink(reference, `${match[1]} : ${match[2]}-${match[3]}`)}</p>` : ''
      },
      table(token) { return `<div class="implementation-table">${Renderer.prototype.table.call(this, token)}</div>` },
    },
  })
  const html = DOMPurify.sanitize(parser.parse(markdown, { async: false }), { USE_PROFILES: { html: true }, ADD_ATTR: ['data-source-reference'] })
  return { html, headings: headings.filter(heading => heading.depth === 2), references }
}

export async function renderHighlightedImplementation(markdown: string) {
  const parser = new Marked()
  const blocks = new Map<string, { text: string; lang: string }>()
  parser.walkTokens(parser.lexer(markdown), token => {
    if (token.type === 'code') blocks.set(JSON.stringify([token.lang ?? '', token.text]), { text: token.text, lang: token.lang ?? '' })
  })
  if (!blocks.size) return renderImplementation(markdown)
  try {
    const { highlightCode } = await import('./syntax-highlighter')
    const rendered = new Map(await Promise.all([...blocks].map(async ([key, block]) => [key, await highlightCode(block.text, block.lang)] as const)))
    return renderImplementation(markdown, rendered)
  } catch {
    return renderImplementation(markdown)
  }
}
