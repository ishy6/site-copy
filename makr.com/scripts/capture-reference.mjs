import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = '/tmp/makr-fidelity';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('https://makr.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${output}/reference-home-${viewport.width}.png` });
  const info = await page.evaluate(() => ({
    body: document.body.className,
    boxes: [...document.querySelectorAll('.desktop-navigation,.mobile-navigation,.sale-message,.mirrored-pair,.newsletter-signup,.sitewide-notification')].map(e => ({ class: e.className, rect: e.getBoundingClientRect().toJSON(), style: { fontSize: getComputedStyle(e).fontSize, background: getComputedStyle(e).backgroundColor } })),
  }));
  await writeFile(`${output}/reference-home-${viewport.width}.json`, JSON.stringify(info, null, 2));
  if (viewport.width === 1440) {
    await page.locator('.desktop-drawer-open').first().click();
    await page.waitForTimeout(500);
    await page.locator('.shop-navigation a').filter({ hasText: /^Wallets$/ }).hover();
    await page.screenshot({ path: `${output}/reference-menu-${viewport.width}.png` });
    await page.goto('https://makr.com/wallets', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${output}/reference-wallets-${viewport.width}.png` });
    await page.goto('https://makr.com/new-fold-weekender-black-canvas', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${output}/reference-product-${viewport.width}.png` });
  }
  await context.close();
}
await browser.close();
