import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('html')).toHaveClass(/html_ready/);
  await expect(page.locator('.page-loading')).toHaveCount(0);
}

async function drag(page: Page, touch: boolean, from: [number, number], to: [number, number]) {
  if (touch) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from[0], y: from[1] }] });
    for (let step = 1; step <= 12; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from[0] + (to[0] - from[0]) * step / 12, y: from[1] + (to[1] - from[1]) * step / 12 }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(...from);
    await page.mouse.down();
    for (let step = 1; step <= 12; step++) {
      await page.mouse.move(from[0] + (to[0] - from[0]) * step / 12, from[1] + (to[1] - from[1]) * step / 12);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
  }
}

async function imagePixels(page: Page, selector: string) {
  return page.locator(selector).first().evaluate(async node => {
    const image = node as HTMLImageElement;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, 64, 64);
    const pixels = context.getImageData(0, 0, 64, 64).data;
    let low = 255;
    let high = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      low = Math.min(low, pixels[index]!);
      high = Math.max(high, pixels[index]!);
    }
    return { width: image.naturalWidth, range: high - low };
  });
}

test('home intro renders photographed frames, reacts to scrolling and toggles audio', async ({ page }, info) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:5189') && !request.url().startsWith('data:')) external.push(request.url());
  });
  await page.addInitScript(() => {
    const nodes: GainNode[] = [];
    const runtime = window as unknown as { testGainNodes: GainNode[] };
    runtime.testGainNodes = nodes;
    const original = AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function () { const node = original.call(this); nodes.push(node); return node; };
  });
  await page.goto('/');
  await ready(page);
  await expect(page.locator('html')).not.toHaveClass(/html_onIntro/);
  await expect(page.locator('.js_home_clipBodyInner img').first()).toBeAttached();
  await expect.poll(async () => (await imagePixels(page, '.js_home_clipBodyInner img')).range).toBeGreaterThan(50);
  const sound = page.locator('.js_home_sound');
  if (info.project.name === 'mobile') await sound.tap(); else await sound.click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('shupatto_sound_started'))).toBe('yes');
  await expect.poll(() => page.evaluate(() => (window as unknown as { testGainNodes: GainNode[] }).testGainNodes.some(node => node.gain.value > 0))).toBe(true);
  if (info.project.name === 'mobile') await sound.tap(); else await sound.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { testGainNodes: GainNode[] }).testGainNodes.every(node => node.gain.value === 0))).toBe(true);
  await page.mouse.move((page.viewportSize()?.width || 1440) / 2, 400);
  await page.mouse.wheel(0, 950);
  await expect(page.locator('.js_home_fvTitleInner')).not.toBeInViewport();
  await expect(page.locator('.js_home_categoryItem').nth(1)).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  // Each split scene unfolds before the next wheel gesture changes category.
  for (let category = 2; category <= 4; category++) {
    await page.waitForTimeout(1300);
    await page.mouse.wheel(0, 950);
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 950);
    await expect(page.locator('.js_home_categoryItem').nth(category)).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('home accepts directional desktop drag and mobile swipe', async ({ page }, info) => {
  await page.goto('/?skip&noAuto');
  await ready(page);
  await expect(page.locator('html')).not.toHaveClass(/html_onIntro/);
  const mobile = info.project.name === 'mobile';
  await drag(page, mobile, mobile ? [195, 600] : [1000, 450], mobile ? [195, 250] : [500, 450]);
  await expect(page.locator('.js_home_fvTitleInner')).not.toBeInViewport();
  await expect(page.locator('.js_home_categoryItem').nth(1)).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('product clicking or touch swiping changes the displayed color', async ({ page }, info) => {
  await page.goto('/product/compactbag-m/?color=1');
  await ready(page);
  await expect(page.locator('.js_detailFv')).toHaveClass(/is_loaded/);
  const mobile = info.project.name === 'mobile';
  if (mobile) await drag(page, true, [310, 420], [70, 420]);
  else await page.mouse.click(1000, 450);
  await expect(page).not.toHaveURL(/color=1$/);
  await expect(page.locator('.js_detailFv_button.is_active')).not.toHaveAttribute('data-color-index', '0');
});

test('lineup previews link to the selected local product color', async ({ page }, info) => {
  await page.goto('/product/');
  await ready(page);
  const item = page.locator('.js_lineup_item').filter({ has: page.locator('.p_p_itemName', { hasText: 'COMPACT M' }) }).first();
  await item.scrollIntoViewIfNeeded();
  const swatch = item.locator('.js_lineup_itemButton').nth(2);
  if (info.project.name === 'mobile') await swatch.tap(); else await swatch.hover();
  await expect(item).toHaveAttribute('href', /\/product\/compactbag-m\/\?color=3$/);
  await page.goto((await item.getAttribute('href'))!);
  await expect(page.locator('.js_detailFv_button.is_active')).toHaveAttribute('data-color-index', '2');
  expect((await imagePixels(page, '.js_detailFv .js_productImage_item img')).range).toBeGreaterThan(50);
});

test('product colors, image transitions and reload use the same selected option', async ({ page }, info) => {
  await page.goto('/product/compactbag-m/?color=1');
  await ready(page);
  await expect(page.locator('.js_detailFv')).toHaveClass(/is_loaded/);
  const firstImage = await page.locator('.js_detailFv .js_productImage_item img').last().getAttribute('src');
  const swatch = page.locator('.js_detailFv_button').nth(3);
  if (info.project.name === 'mobile') await swatch.tap(); else await swatch.hover();
  await expect(page).toHaveURL(/color=4/);
  await expect(page.locator('.js_detailFv_button.is_active')).toHaveAttribute('data-color-index', '3');
  await expect.poll(() => page.locator('.js_detailFv .js_productImage_item img').last().getAttribute('src')).not.toBe(firstImage);
  await page.reload();
  await ready(page);
  await expect(page.locator('.js_detailFv_button.is_active')).toHaveAttribute('data-color-index', '3');
  await expect(page.locator('.js_detailFv_buyButton').first()).toHaveAttribute('href', /^https:\/\/marna\.jp\/shop\//);
  expect((await imagePixels(page, '.js_detailFv .js_productImage_item img')).range).toBeGreaterThan(50);
  await page.mouse.wheel(0, 1050);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('navigation and language switching stay within the local project', async ({ page }, info) => {
  await page.goto('/about/');
  await ready(page);
  if (info.project.name === 'mobile') {
    await page.locator('.c_ham').tap();
    await expect(page.locator('html')).toHaveClass(/is_modalShow/);
    await page.locator('.c_ham').tap();
    await expect(page.locator('html')).not.toHaveClass(/is_modalShow/);
    await page.locator('.c_ham').tap();
    await page.locator('.c_menu_sectionHead[href="/shoplist/"]').tap();
  } else {
    await page.locator('.c_header a[href="/shoplist/"]').click();
  }
  await expect(page).toHaveURL(/\/shoplist\/$/);
  await ready(page);
  await page.locator('.c_footer_langSelector a[href="/en/shoplist/"]').first().click();
  await expect(page).toHaveURL(/\/en\/shoplist\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goBack();
  await expect(page).toHaveURL(/\/shoplist\/$/);
});

test('instruction manuals are served as actual local PDF files', async ({ page, request }) => {
  await page.goto('/downloads/');
  await ready(page);
  const link = page.locator('.js_root a[href$=".pdf"]').first();
  await expect(link).toBeVisible();
  const response = await request.get((await link.getAttribute('href'))!);
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0,5).toString()).toBe('%PDF-');
});

test('unknown routes offer a working home link', async ({ page }) => {
  await page.goto('/missing-page/');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'BACK TO HOME' }).click();
  await ready(page);
  await expect(page.locator('.js_home')).toBeVisible();
});
