import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import darkPlus from 'shiki/themes/dark-plus.mjs'

const grammarLoaders = {
  bash: () => import('shiki/langs/bash.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  vue: () => import('shiki/langs/vue.mjs'),
}
type SupportedLanguage = keyof typeof grammarLoaders
type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>

const languages = new Map<string, SupportedLanguage>([
  ['bash', 'bash'], ['sh', 'bash'], ['shell', 'bash'], ['shellscript', 'bash'],
  ['css', 'css'], ['html', 'html'], ['json', 'json'],
  ['javascript', 'javascript'], ['js', 'javascript'],
  ['typescript', 'typescript'], ['ts', 'typescript'], ['vue', 'vue'],
])

let highlighterPromise: ReturnType<typeof createHighlighterCore> | undefined
const languagePromises = new Map<SupportedLanguage, Promise<void>>()

function getHighlighter() {
  highlighterPromise ??= Promise.resolve().then(() => createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    themes: [darkPlus],
    langs: [],
  })).catch(error => {
    highlighterPromise = undefined
    throw error
  })
  return highlighterPromise
}

function loadLanguage(highlighter: Highlighter, language: SupportedLanguage) {
  if (highlighter.getLoadedLanguages().includes(language)) return Promise.resolve()
  let request = languagePromises.get(language)
  if (!request) {
    request = grammarLoaders[language]()
      .then(grammar => highlighter.loadLanguage(grammar.default))
      .catch(error => {
        languagePromises.delete(language)
        throw error
      })
    languagePromises.set(language, request)
  }
  return request
}

export async function highlightCode(code: string, language: string): Promise<string> {
  const highlighter = await getHighlighter()
  const name = language.trim().toLowerCase().split(/\s+/)[0] ?? ''
  const resolvedLanguage = languages.get(name)
  if (resolvedLanguage) await loadLanguage(highlighter, resolvedLanguage)
  const lineEndings = code.match(/\r?\n/g) ?? []
  return highlighter.codeToHtml(code, {
    lang: resolvedLanguage ?? 'text',
    theme: 'dark-plus',
    transformers: [{
      name: 'component-source-lines',
      line(node, line) {
        this.addClassToHast(node, 'source-line')
        node.properties['data-line'] = line
      },
      code(node) {
        // Shiki normalizes line endings; restore them before serializing source text.
        let index = 0
        for (const child of node.children) {
          if (child.type === 'text') child.value = lineEndings[index++] ?? child.value
        }
      },
      postprocess(html) {
        // Character references prevent HTML parsing from normalizing CRLF again.
        return html.replaceAll('\r', '&#13;')
      },
    }],
  })
}
