import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import { normalizePath, type Plugin, type ResolvedConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function componentSources(): Plugin {
  const virtualId = 'virtual:component-source-urls'
  const resolvedId = `\0${virtualId}`
  let config: ResolvedConfig
  let sources: { key: string; file: string; url: string }[] = []
  function collect(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const file = join(directory, entry.name)
      return entry.isDirectory() ? collect(file) : /\.(vue|ts|css)$/.test(entry.name) ? [file] : []
    })
  }
  function refreshSources() {
    const root = resolve(config.root, 'src')
    sources = collect(join(root, 'library')).map(file => {
      const path = normalizePath(relative(root, file))
      return { key: `./${path}`, file, url: `${config.base}src/${path}?raw&source-download=1` }
    })
  }
  return {
    name: 'component-source-assets',
    configResolved(resolved) {
      config = resolved
      refreshSources()
    },
    resolveId(id) { if (id === virtualId) return resolvedId },
    load(id) {
      if (id !== resolvedId) return
      refreshSources()
      const entries = sources.map(source => {
        this.addWatchFile(source.file)
        if (config.command !== 'build') return `${JSON.stringify(source.key)}: ${JSON.stringify(source.url)}`
        const reference = this.emitFile({ type: 'asset', name: `${source.key.slice(2).replaceAll('/', '-')}.txt`, source: readFileSync(source.file) })
        return `${JSON.stringify(source.key)}: import.meta.ROLLUP_FILE_URL_${reference}`
      })
      return `export default {${entries.join(',')}}`
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '', 'http://localhost')
        if (!url.searchParams.has('source-download')) return next()
        const source = sources.find(item => new URL(item.url, 'http://localhost').pathname === url.pathname)
        if (!source) { response.statusCode = 404; response.end('Source not found'); return }
        try {
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.setHeader('Cache-Control', 'no-cache')
          response.end(readFileSync(source.file))
        } catch { response.statusCode = 500; response.end('Source unavailable') }
      })
    },
  }
}

export default defineConfig({
  plugins: [componentSources(), vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
