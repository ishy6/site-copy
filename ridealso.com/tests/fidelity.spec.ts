import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('also-replica-cookie-consent', 'declined'));
});

test('source menu and hero pagination remain interactive', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('.header-also__nav-link').filter({ hasText: /^\s*Shop/ }).first().hover();
  await expect(page.locator('.header-also__mega-content').first()).toBeVisible();
  await page.mouse.move(720, 760);
  await page.locator('.swiper-pagination-bullet').nth(1).click();
  await expect(page.locator('.swiper-pagination-bullet').nth(1)).toHaveClass(/swiper-pagination-bullet-active/);
  expect(errors).toEqual([]);
});

test('cart adds the selected variant and persists quantity changes and removal', async ({ page }) => {
  await page.goto('/products/alpha-wave-helmet');
  await page.locator('[data-add-to-cart]').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('also-replica-cart-v1') || '{}').item_count)).toBe(1);
  await page.goto('/cart');
  await expect(page.locator('.local-cart-item').filter({ visible: true })).toHaveCount(1);
  await expect(page.locator('.local-cart-item').filter({ visible: true })).toContainText('Moon Rock / S');
  await page.locator('[data-local-quantity][data-delta="1"]').filter({ visible: true }).click();
  await expect(page.locator('[data-local-count]').filter({ visible: true })).toHaveValue('2');
  await page.reload();
  await expect(page.locator('[data-local-count]').filter({ visible: true })).toHaveValue('2');
  await page.locator('a[href="/checkout"]').filter({ visible: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Checkout and payment are completed securely on ridealso.com');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.locator('[data-local-remove]').filter({ visible: true }).click();
  await expect(page.getByText("You don't have any items!", { exact: true }).filter({ visible: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.local-cart-item')).toHaveCount(0);
});

test('collection type and price filters survive a direct URL reload', async ({ page }) => {
  await page.goto('/collections/gear');
  await page.locator('summary').filter({ hasText: 'Product Type' }).click();
  await page.locator('label.facets__option').filter({ hasText: 'Apparel' }).click();
  await expect(page.locator('[data-filter-results] collection-grid-tile[data-product-handle]:not([data-product-handle=""])')).toHaveCount(5);
  await page.reload();
  await expect(page.locator('[data-filter-results] collection-grid-tile[data-product-handle]:not([data-product-handle=""])')).toHaveCount(5);
  await page.locator('summary').filter({ hasText: 'Price' }).click();
  await page.locator('input[name="filter.v.price.lte"]').fill('30');
  await page.locator('input[name="filter.v.price.lte"]').dispatchEvent('change');
  await expect(page.locator('[data-filter-results] collection-grid-tile[data-product-handle]:not([data-product-handle=""])')).toHaveCount(2);
});

test('static product view routing switches between both bike configurators', async ({ page }) => {
  await page.goto('/products/tm-b-performance?view=performance');
  await expect(page.locator('body')).toContainText('$4,500.00');
  await page.locator('a').filter({ hasText: /Standard/ }).first().click();
  await expect(page).toHaveURL(/\/products\/tm-b\?view=configure/);
  await expect(page.locator('body')).toContainText('$3,500.00');
  await page.getByRole('button', { name: 'Save build', exact: true }).click();
  await expect(page).toHaveURL(/\/account\/login\?return_url=/);
  await expect(page.locator('cognito-auth-form input[type="email"]')).toBeVisible();
  await page.goBack();
  await page.locator('a').filter({ hasText: /Performance/ }).first().click();
  await expect(page.locator('body')).toContainText('$4,500.00');
});

test('shared variant URLs restore the actual bike and normal product selections', async ({ page }) => {
  await page.goto('/products/tm-b-performance?view=performance&variant=53007346696416');
  await expect.poll(() => page.locator('configurator-app').evaluate((element: any) => element._variant?.id)).toBe(53007346696416);
  await expect(page.locator('input[name="TF"]:checked')).toHaveAttribute('data-variant-color', 'Phoenix');
  await expect(page.locator('[data-action="deposit"]')).toHaveAttribute('href', '/cart/add/53871035318496');
  await page.locator('[data-action="deposit"]').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('also-replica-cart-v1') || '{}').items?.[0]?.variant_id)).toBe(53871035318496);
  await page.goto('/cart/add/53871035252960');
  await expect(page).toHaveURL(/\/cart$/);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('also-replica-cart-v1') || '{}').item_count)).toBe(2);
  await page.goto('/products/alpha-wave-helmet?variant=51990246785248');
  await expect(page.locator('variant-selector input[name="Color"]:checked')).toHaveValue('Seeing Stone');
  await expect(page.locator('variant-selector input[name="Size"]:checked')).toHaveValue('L');
});

test('quick add uses the source product modal and direct account routes show the handoff', async ({ page }) => {
  const authRequests: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST' || /\/auth\/email\/otp|\/oauth2\/authorize/.test(request.url())) authRequests.push(request.url());
  });
  await page.goto('/collections/gear');
  const product = page.locator('[data-filter-results] collection-grid-tile[data-product-handle="alpha-wave-helmet"]');
  await product.getByRole('button', { name: 'Quick Add Alpha Wave Helmet', exact: true }).click();
  await expect(page.locator('dialog[open]')).toContainText('Alpha Wave Helmet');
  await expect(page.locator('dialog[open] [data-add-to-cart]')).toBeVisible();
  await page.goto('/account/login');
  await expect(page.locator('#main')).toContainText('Create an account or sign-in');
  const email = page.locator('cognito-auth-form input[type="email"]');
  await expect(email).toBeVisible();
  await page.locator('cognito-auth-form button[type="submit"]').click();
  expect(await email.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  await email.fill('preview@example.com');
  await page.locator('cognito-auth-form button[type="submit"]').click();
  await expect(page.getByRole('dialog')).toContainText('This preview has not sent a login code');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.locator('[data-identity-provider="Google"]').click();
  await expect(page.getByRole('dialog')).toContainText('sign in with Google');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.locator('[data-identity-provider="SignInWithApple"]').click();
  await expect(page.getByRole('dialog')).toContainText('sign in with Apple');
  expect(authRequests).toEqual([]);
  await expect(page).toHaveURL(/\/account\/login$/);
});

test('blog pagination serves different pre-rendered documents', async ({ page }) => {
  await page.goto('/blogs/all');
  const first = await page.locator('#main').innerText();
  await page.goto('/blogs/all?page=2');
  await expect(page.locator('html')).toHaveAttribute('data-reference-route', '/blogs/all?page=2');
  expect(await page.locator('#main').innerText()).not.toEqual(first);
});

test('newsletter validates email and makes the subscription handoff explicit', async ({ page }) => {
  await page.goto('/');
  await page.locator('.local-newsletter').scrollIntoViewIfNeeded();
  await page.locator('.local-newsletter button').click();
  await expect(page.locator('.local-newsletter-error')).toHaveText('Please enter a valid email address.');
  await page.locator('.local-newsletter input').fill('preview@example.com');
  await page.locator('.local-newsletter button').click();
  await expect(page.getByRole('dialog')).toContainText('This preview has not subscribed your email address.');
});

test('mobile navigation opens, drills into Shop and closes without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menuId = await page.locator('[data-nav-toggle]').getAttribute('id');
  await page.locator(`label[for="${menuId}"]`).filter({ visible: true }).first().click();
  await expect(page.locator('[data-nav-toggle]')).toBeChecked();
  await page.locator('.header-also__nav-link').filter({ hasText: /^\s*Shop/ }).first().click();
  await expect(page.locator('[data-nav-group-toggle][aria-label="Shop"]')).toBeChecked();
  await page.locator('.header-also__mobile-back-btn').filter({ visible: true }).first().click();
  await page.locator(`label[for="${menuId}"]`).filter({ visible: true }).first().click();
  await expect(page.locator('[data-nav-toggle]')).not.toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
