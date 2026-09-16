import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface Page { route: string; file: string }

export function referencePages(): Plugin {
  let root = '';
  let outputRoot = '';
  let preview = false;
  const readPages = (): Page[] => JSON.parse(fs.readFileSync(path.join(root, 'public/reference/manifest.json'), 'utf8')).pages;
  function serve(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/local-api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, local: true, message: 'Local preview only. No message has been sent.' }));
      return;
    }
    if (req.method !== 'GET' || path.extname(url.pathname)) return next();
    if (!fs.existsSync(path.join(root, 'public/reference/manifest.json'))) return next();
    const route = url.pathname.replace(/\/?$/, '/');
    const page = readPages().find(entry => entry.route === route);
    if (!page) return next();
    const file = preview ? path.join(outputRoot, route, 'index.html') : path.join(root, 'public/reference', page.file);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(file));
  }
  return {
    name: 'thoughtlab-reference-pages',
    configResolved(config) { root = config.root; outputRoot = path.resolve(root, config.build.outDir); },
    configureServer(server) { server.middlewares.use(serve); },
    configurePreviewServer(server) { preview = true; server.middlewares.use(serve); },
    closeBundle() {
      const shell = fs.readFileSync(path.join(outputRoot, 'index.html'), 'utf8');
      const entries = shell.match(/<(?:script|link)\b[^>]*(?:src|href)="\/assets\/[^>]+>(?:<\/script>)?/g)?.join('\n') || '';
      for (const page of readPages()) {
        let html = fs.readFileSync(path.join(root, 'public/reference', page.file), 'utf8');
        html = html.replace(/<script type="module" src="\/src\/main.ts" data-local-entry(?:="")?><\/script>/, entries);
        const destination = path.join(outputRoot, page.route, 'index.html');
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, html);
      }
      fs.writeFileSync(path.join(outputRoot, '404.html'), shell);
    },
  };
}
