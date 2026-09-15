import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(import.meta.dirname, '../artifacts/comparison');
const publicRoot = path.resolve(import.meta.dirname, '../public');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/?skip&noAuto', '/product/', '/product/compactbag-m/', '/about/', '/shoplist/', '/downloads/'];
const report = [];
for (const width of [1440, 390]) {
  for (const route of routes) {
    for (const source of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, locale: 'ja-JP', hasTouch: width === 390 });
      await context.addInitScript(() => {
        Math.random = () => 0.37;
        sessionStorage.setItem('detail_scrollattention_cancel', 'yes');
      });
      if (source) {
        await context.route('https://prod-raw.shupatto.com/**', async request => {
          const pathname = new URL(request.request().url()).pathname;
          if (/^\/(assets|uploads)\//.test(pathname)) {
            try { return await request.fulfill({ path: path.join(publicRoot, decodeURIComponent(pathname)) }); } catch {}
          }
          return request.continue();
        });
        await context.route(/google-analytics\.com|googletagmanager\.com/, request => request.abort());
      }
      const page = await context.newPage();
      const errors = [];
      const failed = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) failed.push({ status: response.status(), url: response.url() }); });
      await page.goto((source ? 'https://prod-raw.shupatto.com' : 'http://127.0.0.1:5178') + route, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.documentElement.classList.contains('html_ready'), undefined, { timeout: 30000 });
      if (route.startsWith('/?')) await page.waitForFunction(() => !document.documentElement.classList.contains('html_onIntro'), undefined, { timeout: 30000 });
      await page.waitForTimeout(2500);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.getBoundingClientRect().top < innerHeight).map(image => image.decode().catch(() => {}))); });
      const label = `${source ? 'source' : 'local'}-${width}-${route.split('?')[0].replaceAll('/', '_') || 'home'}`;
      await page.screenshot({ path: path.join(output, label + '.png') });
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        htmlClass: document.documentElement.className,
        headings: [...document.querySelectorAll('h1,h2,h3,.p_pd_fvNav')].filter(element => element.getBoundingClientRect().width).slice(0,40).map(element => ({ text: element.textContent?.trim(), rect: element.getBoundingClientRect().toJSON() })),
        controls: [...document.querySelectorAll('button,select,summary')].map(element => ({ text: element.textContent?.trim(), class: element.className, visible: !!element.getBoundingClientRect().height })),
      }));
      if (width === 390 && route.startsWith('/?')) {
        await page.locator('.c_ham').tap();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(output, label + '-menu.png') });
      }
      report.push({ source, width, route, errors, failed, ...geometry });
      console.log(`${label}: errors=${errors.length}, failed=${failed.length}, overflow=${geometry.overflow}`);
      await context.close();
    }
  }
}
await browser.close();
await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
