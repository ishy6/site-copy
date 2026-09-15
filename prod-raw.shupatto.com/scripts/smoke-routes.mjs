import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../public/reference/manifest.json', import.meta.url), 'utf8'));
const base = process.env.SMOKE_URL || 'http://127.0.0.1:5178';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  await Promise.all([1440, 390].map(async width => {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, hasTouch: width === 390, locale: 'ja-JP' });
    await context.addInitScript(() => sessionStorage.setItem('detail_scrollattention_cancel', 'yes'));
    for (const route of Object.keys(manifest.pages)) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      try {
        await page.goto(base + route + '?skip&noAuto');
        await page.waitForFunction(() => document.documentElement.classList.contains('html_ready'), undefined, { timeout: 30000 });
        for (const position of [0, 0.5, 1]) {
          await page.evaluate(position => scrollTo(0, (document.body.scrollHeight - innerHeight) * position), position);
          await page.waitForTimeout(250);
          await page.evaluate(async () => {
            await Promise.all([...document.images].filter(image => {
              const rect = image.getBoundingClientRect();
              return rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
            }).map(image => image.decode()));
          });
        }
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) errors.push('Horizontal overflow');
      } catch (error) { errors.push(error.message); }
      results.push({ width, route, errors });
      console.log(`${width} ${route}: ${errors.length ? JSON.stringify(errors) : 'ok'}`);
      await page.close();
    }
    await context.close();
  }));
} finally { await browser.close(); }
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/routes.json', import.meta.url), JSON.stringify(results, null, 2));
if (results.some(result => result.errors.length)) process.exitCode = 1;
