import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public/reference');
const files = (await readdir(root)).filter(name => name.endsWith('.html'));
const resources = new Map();
const documents = [];
function cached(value, width = 2000) {
  if (!value || !/^https?:\/\//.test(value)) return value;
  const url = new URL(value);
  if (!/\.(avif|webp|png|jpe?g|gif|svg|json)$/.test(url.pathname)) return value;
  if (/\.(avif|webp|png|jpe?g)$/.test(url.pathname)) {
    const existingWidth = Number(url.searchParams.get('width'));
    url.searchParams.set('width', String(existingWidth ? Math.min(width, existingWidth) : width));
  }
  const canonical = url.href;
  const local = '/reference/assets/' + createHash('sha256').update(canonical).digest('hex').slice(0, 16) + path.extname(url.pathname);
  resources.set(canonical, local);
  return local;
}
for (const file of files) {
  const $ = load(await readFile(path.join(root, file), 'utf8'));
  $('img[src],video[poster],lottie-player[src]').each((_, element) => {
    const tag = $(element);
    for (const attr of ['src', 'poster']) if (tag.attr(attr)) tag.attr(attr, cached(tag.attr(attr)));
  });
  $('img[srcset],source[srcset]').each((_, element) => {
    const tag = $(element);
    const candidates = tag.attr('srcset').split(',').map(candidate => {
      const [url, descriptor] = candidate.trim().split(/\s+/);
      return { url, width: parseInt(descriptor) || 2000 };
    });
    const targetWidth = /max-width/.test(tag.attr('media') || '') ? 900 : 2000;
    const chosen = candidates.find(candidate => candidate.width >= targetWidth) || candidates.at(-1);
    if (chosen) tag.attr('srcset', cached(chosen.url, targetWidth));
  });
  const cacheBackgrounds = value => value.replace(/url\((['"]?)(https?:\/\/[^)'"\s]+)\1\)/g, (_, quote, url) => `url(${quote}${cached(url)}${quote})`);
  $('[style]').each((_, element) => {
    const tag = $(element);
    tag.attr('style', cacheBackgrounds(tag.attr('style')));
  });
  $('style').each((_, element) => $(element).html(cacheBackgrounds($(element).html())));
  documents.push({ file, html: $.html() });
}
let complete = 0;
const entries = [...resources.entries()];
const failed = new Set();
for (let i = 0; i < entries.length; i += 12) {
  await Promise.allSettled(entries.slice(i, i + 12).map(async ([url, local]) => {
    const target = path.join(root, 'assets', path.basename(local));
    try {
      try { await readFile(target); return; } catch {}
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`${response.status}`);
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
    } catch (error) { failed.add(local); console.error(`Media failed ${url}: ${error}`); }
    finally { complete++; }
  }));
  console.log(`Media ${Math.min(i + 12, entries.length)}/${entries.length}`);
}
for (const document of documents) {
  let html = document.html;
  for (const [url, local] of entries) if (failed.has(local)) html = html.replaceAll(local, url);
  await writeFile(path.join(root, document.file), html);
}
console.log(`Cached ${resources.size - failed.size} image/animation resources.`);
