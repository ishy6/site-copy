import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT || 5191);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.woff':'font/woff', '.woff2':'font/woff2', '.mp4':'video/mp4', '.webm':'video/webm', '.pdf':'application/pdf', '.ico':'image/x-icon', '.webmanifest':'application/manifest+json' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    let info;
    try { info = await stat(file); if (info.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file); } }
    catch { file = path.join(root, '404.html'); info = await stat(file); response.statusCode = 404; }
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.setHeader('Accept-Ranges', 'bytes');
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
      if (start > end || start >= info.size) { response.writeHead(416); response.end(); return; }
      response.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Content-Length': end - start + 1 });
      createReadStream(file, {start, end}).pipe(response);
    } else {
      response.setHeader('Content-Length', info.size);
      if (request.method === 'HEAD') response.end(); else createReadStream(file).pipe(response);
    }
  } catch { response.writeHead(500); response.end('Unable to load page.'); }
}).listen(port, '127.0.0.1', () => console.log(`Static ThoughtLab build: http://127.0.0.1:${port}`));
