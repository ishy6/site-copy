import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.AUDIT_URL || 'https://prod-raw.shupatto.com';
const output = process.env.AUDIT_OUTPUT || '/tmp/shupatto-reference';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, locale: 'ja-JP', hasTouch: width === 390 });
  const page = await context.newPage();
  const requests = new Set();
  const errors = [];
  page.on('request', request => requests.add(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.documentElement.classList.contains('html_onIntro') && document.documentElement.classList.contains('html_ready'), undefined, { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${output}/home-${width}.png` });
  console.log(JSON.stringify({ width, url: page.url(), text: await page.locator('body').innerText(), htmlClass: await page.locator('html').getAttribute('class'), errors }));
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${output}/scroll-${width}.png` });
  if (width === 390) await page.locator('.c_ham').tap({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${output}/menu-${width}.png` });
  await writeFile(`${output}/requests-${width}.json`, JSON.stringify([...requests], null, 2));
  await writeFile(`${output}/dom-${width}.html`, await page.content());
  await context.close();
}
await browser.close();
