import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = 'artifacts/reference';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
    const page = await browser.newPage({ viewport, hasTouch: name === 'mobile' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://slush.app/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${directory}/${name}-first.png` });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, step = 0; y < height; y += viewport.height * .8, step++) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(350);
      if (step % 3 === 0) await page.screenshot({ path: `${directory}/${name}-scroll-${step}.png` });
    }
    await writeFile(`${directory}/${name}.json`, JSON.stringify({ height, errors, headings: await page.locator('h1,h2,h3').allTextContents() }, null, 2));
    await page.close();
  }
} finally { await browser.close(); }
