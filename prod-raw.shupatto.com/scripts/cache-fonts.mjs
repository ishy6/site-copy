import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public');
const manifest = JSON.parse(await readFile(path.join(root, 'reference/manifest.json'), 'utf8'));
const directory = path.join(root, 'reference/fonts');
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const entries = Object.entries(manifest.pages);
let index = 0;
const failures = [];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (index < entries.length) {
    const [route, entry] = entries[index++];
    const context = await browser.newContext({ locale: route.startsWith('/en/') ? 'en-US' : 'ja-JP' });
    try {
      await context.route('https://prod-raw.shupatto.com/**', async request => {
        const pathname = new URL(request.request().url()).pathname;
        if (/^\/(assets|uploads)\//.test(pathname)) {
          try { return await request.fulfill({ path: path.join(root, decodeURIComponent(pathname)) }); } catch {}
        }
        return request.continue();
      });
      await context.route(/google-analytics\.com|googletagmanager\.com/, request => request.abort());
      const page = await context.newPage();
      const responses = new Map();
      page.on('response', response => {
        if (response.url().includes('/accessor/reqf/') && response.status() === 200) responses.set(response.url(), response.body().catch(() => null));
      });
      await page.goto(manifest.origin + route, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.FONTPLUS && !window.FONTPLUS.isloading(), undefined, { timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      const faces = await page.evaluate(() => [...document.styleSheets].flatMap(sheet => {
        try { return [...sheet.cssRules].filter(rule => rule.type === 5 && rule.cssText.includes('/accessor/reqf/')).map(rule => rule.cssText); }
        catch { return []; }
      }));
      if (!faces.length) throw new Error('No source font faces loaded');
      const rules = [];
      for (const face of faces) {
        const url = face.match(/url\("([^"]+)"\)/)?.[1];
        const data = await responses.get(url);
        if (!data?.length) throw new Error(`Missing font response: ${url}`);
        const filename = createHash('sha256').update(data).digest('hex').slice(0,20) + '.woff';
        await writeFile(path.join(directory, filename), data);
        rules.push(face.replace(url, '/reference/fonts/' + filename));
      }
      const stylesheet = entry.file.replace(/\.json$/, '.css');
      await writeFile(path.join(directory, stylesheet), rules.join('\n'));
      const snapshotPath = path.join(root, 'reference', entry.file);
      const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
      snapshot.fontStyles = '/reference/fonts/' + stylesheet;
      await writeFile(snapshotPath, JSON.stringify(snapshot));
      console.log(`${route}: ${rules.length} font faces cached`);
    } catch (error) { failures.push({ route, error: String(error) }); console.error(route, String(error)); }
    finally { await context.close(); }
  }
}));
await browser.close();
await writeFile(path.join(directory, 'report.json'), JSON.stringify({ pages: entries.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
