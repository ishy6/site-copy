import { test, expect, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('public/reference/manifest.json', 'utf8'));
const artifacts = 'artifacts';
await mkdir(artifacts, { recursive: true });

function diagnostics(page: Page) {
  const errors: string[] = [];
  const failures: string[] = [];
  const remote: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(`${request.failure()?.errorText} ${request.url()}`); });
  page.route('**/*', async route => {
    if (/^https?:/.test(route.request().url()) && !route.request().url().startsWith('http://127.0.0.1:5192')) {
      remote.push(route.request().url()); await route.abort();
    } else await route.continue();
  });
  return { errors, failures, remote };
}

async function ready(page: Page, route = '/') {
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-replica-ready', 'true');
  await expect(page.locator('.page-loading')).toHaveCount(0);
  await page.waitForTimeout(route === '/card' ? 7000 : 2200);
  if (route === '/card') await expect.poll(() => page.locator('body').evaluate(element => element.style.position)).not.toBe('fixed');
}

for (const route of Object.keys(manifest.pages)) {
  test(`local route ${route}`, async ({ page }, testInfo) => {
    const network = diagnostics(page);
    await ready(page, route);
    await expect(page).toHaveTitle(manifest.pages[route].title);
    const initial = await page.evaluate(() => ({
      width: innerWidth, height: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - innerWidth,
      headings: [...document.querySelectorAll('h1,h2,h3')].map(element => element.textContent),
    }));
    const name = route.replaceAll('/', '__') || 'home';
    await page.screenshot({ path: `${artifacts}/${testInfo.project.name}-${name}-first.png` });
    const height = initial.height;
    for (let y = 0; y < height; y += Math.max(page.viewportSize()!.height * .85, 650)) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(800);
    const media = await page.locator('img').evaluateAll(elements => elements.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
    }).map(element => { const image = element as HTMLImageElement; return { src: image.currentSrc, width: image.naturalWidth, loaded: image.complete }; }));
    await writeFile(`${artifacts}/${testInfo.project.name}-${name}-diagnostics.json`, JSON.stringify({ route, ...initial, ...network, media }, null, 2));
    expect(initial.overflow).toBeLessThanOrEqual(2);
    expect(media.filter(image => image.loaded && !image.width)).toEqual([]);
    expect(network.errors).toEqual([]);
    expect(network.failures).toEqual([]);
    expect(network.remote).toEqual([]);
  });
}

test('home tabs, slider, video and newsletter', async ({ page }, testInfo) => {
  const network = diagnostics(page);
  await ready(page);
  const tabs = page.locator('[data-tabs="content-item"]');
  await tabs.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  for (let index = 0; index < 3; index++) {
    await tabs.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await tabs.nth(index).click();
    await page.waitForTimeout(1500);
    await expect(tabs.nth(index)).toHaveClass(/active/);
    await expect(page.locator('[data-tabs="text-item"]').nth(index)).toHaveClass(/active/);
    await page.screenshot({ path: `${artifacts}/${testInfo.project.name}-tab-${index}.png` });
  }
  const bullets = page.locator('[data-centered-slider="bullet"]');
  await bullets.nth(2).scrollIntoViewIfNeeded();
  await bullets.nth(2).click();
  await expect(bullets.nth(2)).toHaveAttribute('aria-selected', 'true');
  await page.screenshot({ path: `${artifacts}/${testInfo.project.name}-slider.png` });
  const video = page.locator('.home-device-row video');
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  const first = await video.evaluate(element => { const video = element as HTMLVideoElement; return { time: video.currentTime, width: video.videoWidth, paused: video.paused }; });
  await page.waitForTimeout(900);
  const second = await video.evaluate(element => (element as HTMLVideoElement).currentTime);
  expect(first.width).toBeGreaterThan(0);
  expect(first.paused).toBe(false);
  expect(second).toBeGreaterThan(first.time);
  await page.screenshot({ path: `${artifacts}/${testInfo.project.name}-video.png` });
  const form = page.locator('#newsletter-mc');
  await form.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await form.locator('input[type="email"]').fill('replica@example.com');
  await form.locator('input[type="radio"]').check();
  await form.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await expect(form.locator('[role="status"]')).toContainText('No email has been sent');
  expect(network.errors).toEqual([]);
  expect(network.remote).toEqual([]);
});

test('navigation and browser history preserve page lifecycle', async ({ page }, testInfo) => {
  const network = diagnostics(page);
  await ready(page);
  for (const route of ['/get-started', '/security', '/defi', '/guides', '/guides/create-your-account']) {
    const link = page.locator(`a[href="${route}"]`).filter({ visible: true }).first();
    if (!(await link.isVisible()) && testInfo.project.name === 'mobile') await page.locator('#menuButton').click();
    const target = page.locator(`a[href="${route}"]`).first();
    await target.evaluate(element => (element as HTMLAnchorElement).click());
    await expect(page).toHaveURL(new RegExp(route + '$'));
    await page.waitForFunction(() => !(window as unknown as { barba: { transitions: { isRunning: boolean } } }).barba.transitions.isRunning);
    await page.waitForTimeout(400);
    await expect(page.locator('[data-barba="container"]')).toHaveCount(1);
    await expect(page).toHaveTitle(manifest.pages[route].title);
    expect(await page.locator('[data-barba="container"]').evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(300);
  }
  await page.goBack();
  await page.waitForFunction(() => !(window as unknown as { barba: { transitions: { isRunning: boolean } } }).barba.transitions.isRunning);
  await page.waitForTimeout(400);
  await expect(page).toHaveURL(/\/guides$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-replica-ready', 'true');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${artifacts}/${testInfo.project.name}-guides-refreshed.png` });
  expect(network.errors).toEqual([]);
  expect(network.failures).toEqual([]);
});

test('mobile menu and official download destinations', async ({ page }, testInfo) => {
  await ready(page);
  if (testInfo.project.name === 'mobile') {
    const menu = page.getByRole('button', { name: 'Toggle navigation' });
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('.nav-inner-li').first().evaluate(element => element.getBoundingClientRect().right)).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.screenshot({ path: `${artifacts}/mobile-menu-initial.png` });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${artifacts}/mobile-menu.png` });
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
  await ready(page, '/download');
  await expect(page.locator('a[href*="apps.apple.com"]').first()).toHaveAttribute('href', /6476572140/);
  await expect(page.locator('a[href*="play.google.com"]').first()).toHaveAttribute('href', /com.mystenlabs.suiwallet/);
  await expect(page.locator('a[href="https://my.slush.app/"]').first()).toBeAttached();
  await ready(page, '/missing-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('card retains visual animation and routes waitlist to its provider', async ({ page }, testInfo) => {
  const network = diagnostics(page);
  await ready(page, '/card');
  const input = page.locator('#email-input');
  await input.fill('replica@example.com');
  await page.locator('#send-otp-btn').click();
  await expect(page.locator('#email-error')).toContainText('Continue on the official Slush Card site');
  await expect(page.locator('#email-error a')).toHaveAttribute('href', 'https://slush.app/card');
  if (testInfo.project.name === 'desktop') {
    await expect(page.locator('#af-canvas')).toHaveClass(/is-ready/);
    const pixels = await page.locator('#af-canvas').evaluate(element => {
      const canvas = element as HTMLCanvasElement;
      const values = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
      let opaque = 0, bright = 0;
      for (let index = 0; index < values.length; index += 400) { if (values[index + 3]) opaque++; if (values[index]! + values[index + 1]! + values[index + 2]! > 90) bright++; }
      return { opaque, bright };
    });
    expect(pixels.opaque).toBeGreaterThan(500);
    expect(pixels.bright).toBeGreaterThan(500);
    const firstFrame = await page.locator('#af-canvas').evaluate(element => (element as HTMLCanvasElement).toDataURL());
    await page.locator('.section-about').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY + innerHeight * 2));
    await page.waitForTimeout(1000);
    const nextFrame = await page.locator('#af-canvas').evaluate(element => (element as HTMLCanvasElement).toDataURL());
    expect(nextFrame).not.toEqual(firstFrame);
    await page.screenshot({ path: `${artifacts}/desktop-card-scroll.png` });
  }
  expect(network.errors).toEqual([]);
  expect(network.remote).toEqual([]);
});
