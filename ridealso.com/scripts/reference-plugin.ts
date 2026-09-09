import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export function referencePages(): Plugin {
  let root = '';
  let publicRoot = '';
  let outputRoot = '';
  function serve(req: any, res: any, next: () => void) {
    const url = new URL(req.url || '/', 'http://localhost');
    if (/^\/cart\/add(?:\/\d+)?\/?$/.test(url.pathname)) {
      const variant = url.pathname.split('/')[3] || url.searchParams.get('id');
      res.writeHead(302, { Location: variant ? `/cart?add=${encodeURIComponent(variant)}` : '/cart' });
      res.end();
      return;
    }
    if (req.method !== 'GET' || /\.(?:js|css|json|jpg|webp|png|svg|woff2?)$/.test(url.pathname)) return next();
    const manifestPath = path.join(publicRoot, 'reference/manifest.json');
    if (!fs.existsSync(manifestPath)) return next();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    const view = url.searchParams.get('view');
    const pageNumber = url.searchParams.get('page');
    const route = pathname + (view ? `?view=${view}` : pageNumber ? `?page=${pageNumber}` : '');
    const page = manifest.pages.find((entry: any) => entry.route === route) || manifest.pages.find((entry: any) => entry.route === pathname);
    if (!page) return next();
    const file = path.join(publicRoot, 'reference', page.file);
    if (!fs.existsSync(file)) return next();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(file));
  }
  return {
    name: 'also-reference-pages',
    configResolved(config) {
      root = config.root;
      publicRoot = config.publicDir;
      outputRoot = path.resolve(root, config.build.outDir);
    },
    configureServer(server) { server.middlewares.use(serve); },
    configurePreviewServer(server) { publicRoot = outputRoot; server.middlewares.use(serve); },
    closeBundle() {
      const manifestPath = path.join(root, 'public/reference/manifest.json');
      if (!fs.existsSync(manifestPath)) return;
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      for (const page of manifest.pages) {
        if (page.route.includes('?')) continue;
        const destination = path.join(outputRoot, page.route, 'index.html');
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(path.join(root, 'public/reference', page.file), destination);
      }
      const deposits = JSON.parse(fs.readFileSync(path.join(root, 'public/reference/deposits.json'), 'utf8'));
      for (const id of Object.keys(deposits)) {
        const destination = path.join(outputRoot, 'cart/add', id, 'index.html');
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, `<!doctype html><meta charset="utf-8"><title>ALSO Cart</title><script>location.replace('/cart?add=${id}');</script><a href="/cart?add=${id}">Continue to cart</a>`);
      }
    },
  };
}
