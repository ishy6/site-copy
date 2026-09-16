import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts/reference', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, viewport] of Object.entries({ desktop: {width: 1440, height: 900}, mobile: {width: 390, height: 844} })) {
  const page = await browser.newPage({ viewport });
  const requests = [];
  const errors = [];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://www.thoughtlab.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `artifacts/reference/${name}.png` });
  const content = await page.evaluate(() => ({
    title: document.title,
    bodyClass: document.body.className,
    text: document.body.innerText,
    links: [...document.querySelectorAll('a')].map(a => ({ text:a.textContent.trim(), href:a.getAttribute('href'), class:a.className })),
    buttons: [...document.querySelectorAll('button')].map(a=>({text:a.textContent.trim(),class:a.className, label:a.getAttribute('aria-label')})),
    scripts: [...document.scripts].map(s=>s.src).filter(Boolean),
    canvas: [...document.querySelectorAll('canvas')].map(c=>({width:c.width,height:c.height})),
  }));
  await writeFile(`artifacts/reference/${name}.json`, JSON.stringify({ ...content, requests, errors }, null, 2));
  console.log(JSON.stringify({name, ...content, requests:requests.length, errors}));
  await page.close();
}
await browser.close();
