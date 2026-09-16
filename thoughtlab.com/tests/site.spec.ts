import { test, expect, type Page } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { load } from 'cheerio';

const manifest = JSON.parse(await readFile('public/reference/manifest.json', 'utf8')) as { pages: {route:string;file:string;title:string}[]; assets: {local:string}[] };
async function settle(page: Page) {
  await expect(page.locator('main')).toBeVisible();
  await page.waitForTimeout(1600);
  await page.evaluate(() => document.fonts.ready);
}
async function pixels(page: Page) {
  return page.evaluate(() => new Promise<{nonzero:number;sum:number;width:number;height:number}>(resolve => requestAnimationFrame(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#gl canvas')!;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')!;
    const data = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let nonzero = 0;
    let sum = 0;
    for (let i=0; i<data.length; i+=4) { const value = data[i]! + data[i+1]! + data[i+2]!; if (value) nonzero++; sum += value; }
    resolve({nonzero,sum,width:canvas.width,height:canvas.height});
  })));
}
async function wheel(page: Page, count: number) {
  for (let i=0;i<count;i++) { await page.mouse.wheel(0, 800); await page.waitForTimeout(35); }
  await page.waitForTimeout(800);
}

test('desktop canvas, complete homepage scroll, menu and internal project transition', async ({page}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error=>errors.push(error.message));
  page.on('request', request=>{if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:5191')) external.push(request.url());});
  await page.goto('/');
  await settle(page);
  const first = await pixels(page);
  expect(first.nonzero).toBeGreaterThan(15000);
  await page.mouse.move(950,360);
  await page.waitForTimeout(600);
  const second = await pixels(page);
  expect(second.sum).not.toEqual(first.sum);
  await mkdir('artifacts', {recursive:true});
  await page.screenshot({path:'artifacts/desktop.png'});
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await expect(page.locator('body')).toHaveClass(/menu-is-open/);
  await page.waitForTimeout(1400);
  await page.screenshot({path:'artifacts/desktop-menu.png'});
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/menu-is-open/);
  await page.waitForTimeout(1300);
  await wheel(page,32);
  await page.screenshot({path:'artifacts/desktop-projects.png'});
  const heroTop = await page.locator('.hero').evaluate(element=>element.getBoundingClientRect().top);
  const projectTop = await page.locator('a.js-sel-item').first().evaluate(element=>element.getBoundingClientRect().top);
  expect(Math.min(heroTop,projectTop)).toBeLessThan(0);
  await wheel(page,150);
  await page.screenshot({path:'artifacts/desktop-lower.png'});
  await expect(page.locator('.caps')).toContainText('Product Ecosystems');
  await expect(page.locator('.news-list')).toContainText('The Pressure of Language');
  await page.goto('/projects/');
  await settle(page);
  expect(await page.locator('main a[href^="/projects/"]').count()).toBeGreaterThanOrEqual(22);
  await page.locator('.js-menu-toggle').click();
  await page.waitForTimeout(1300);
  await page.locator('.menu__list a[href="/about/"]').click();
  await expect(page).toHaveURL(/\/about\/$/);
  await settle(page);
  await expect(page.locator('main')).toContainText('ThoughtLab');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  await writeFile('artifacts/canvas-desktop.json',JSON.stringify({first,second,heroTop,projectTop,errors,external},null,2));
});

test('mobile canvas, touch layout, menu, contact tabs, form validity and honest feedback', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const errors: string[]=[];
  const posts: string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.method()==='POST')posts.push(request.url());});
  await page.goto('http://127.0.0.1:5191/');
  await settle(page);
  const first=await pixels(page);
  expect(first.nonzero).toBeGreaterThan(4000);
  await page.waitForTimeout(500);
  const second=await pixels(page);
  expect(second.sum).not.toBe(first.sum);
  await page.screenshot({path:'artifacts/mobile.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.waitForTimeout(1300);
  await page.screenshot({path:'artifacts/mobile-menu.png'});
  await page.locator('.menu__list a[href="/contact/"]').click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await settle(page);
  await page.getByText('Press',{exact:true}).click();
  await expect(page.locator('#contact-form-2')).toBeVisible();
  await expect(page.locator('#contact-form-1')).toBeHidden();
  const form=page.locator('#contact-form-2');
  await form.locator('.btn-submit').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await form.locator('[name=name]').fill('Local Tester');
  await form.locator('[name=phone]').fill('8015550100');
  await form.locator('[name=email]').fill('local@example.com');
  await form.locator('[name=company]').fill('Preview Studio');
  await form.locator('[name=comments]').fill('This is a local preview test request.');
  await form.locator('.btn-submit').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('No message, subscription, or attachment has been sent.');
  expect(await page.evaluate(()=>document.activeElement?.closest('dialog') !== null)).toBe(true);
  await page.screenshot({path:'artifacts/mobile-form-feedback.png'});
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(form.locator('.btn-submit')).toBeFocused();
  expect(posts).toEqual([]);
  expect(errors).toEqual([]);
  await writeFile('artifacts/canvas-mobile.json',JSON.stringify({first,second,errors,posts},null,2));
  await context.close();
});

test('static build publishes every captured route and closes internal asset/link references', async ({request}) => {
  const known = new Set(manifest.pages.map(page=>page.route));
  const failures: string[]=[];
  for (const entry of manifest.pages) {
    const response=await request.get(entry.route);
    if(response.status()!==200)failures.push(`${entry.route}: HTTP ${response.status()}`);
    const html=await response.text();
    const $=load(html);
    if($('html').attr('data-reference-route')!==entry.route)failures.push(`${entry.route}: incorrect route`);
    if(html.includes('src="/src/main.ts"'))failures.push(`${entry.route}: development entry in build`);
    $('a[href^="/"]').each((_,element)=>{
      const url=new URL($(element).attr('href')!,'http://local');
      if(!url.pathname.split('/').pop()?.includes('.')&&!known.has(url.pathname))failures.push(`${entry.route}: missing link ${url.pathname}`);
    });
  }
  expect(failures).toEqual([]);
  const missingAssets: string[]=[];
  for(const asset of manifest.assets){const response=await request.head(encodeURI(asset.local));if(response.status()!==200)missingAssets.push(asset.local);}
  expect(missingAssets).toEqual([]);
  await writeFile('artifacts/static-routes.json',JSON.stringify({pages:manifest.pages.length,assets:manifest.assets.length,failures,missingAssets},null,2));
});

test('key pages refresh, blog categories, visible media and unknown routes', async ({page}) => {
  const errors: string[]=[];
  const missing: string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
  const routes=['/projects/wanderjaunt/','/projects/capsule-house/','/careers/','/careers/senior-software-engineer/apply/','/capabilities/webgl-development-agency/','/locations/salt-lake-city/','/privacy-policy/','/blog/'];
  for(const route of routes){
    await page.goto(route);
    await settle(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),route).toBeLessThanOrEqual(1);
    await expect(page.locator('main')).not.toBeEmpty();
  }
  await page.locator('#categories').selectOption('/category/design/');
  await expect(page).toHaveURL(/\/category\/design\/$/);
  await settle(page);
  await page.reload();
  await settle(page);
  await expect(page.locator('#categories')).toHaveValue('/category/design/');
  await page.screenshot({path:'artifacts/blog-category.png'});
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
  await page.goto('/not-a-captured-page/');
  await expect(page.getByRole('heading',{name:'Page not found.'})).toBeVisible();
  await page.getByRole('link',{name:'Back to home'}).click();
  await expect(page).toHaveURL(/:5191\/$/);
});
