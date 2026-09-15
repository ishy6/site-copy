import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.COMPONENTS_TEST_URL || 'http://127.0.0.1:5190'
const output = '/tmp/site-components-loading'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
function gate() { let release; const promise = new Promise(resolve => { release = resolve }); return { promise, release } }
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const boot = gate()
  const preview = gate()
  const topLevelLibrary = []
  page.on('request', request => {
    if (request.frame() === page.mainFrame() && /\/library\/.*\.vue/.test(request.url())) topLevelLibrary.push(request.url())
  })
  await page.route('**/src/main.ts', async route => { await boot.promise; await route.continue() })
  await page.route('**/src/library/osmo/MotionButton.vue', async route => { await preview.promise; await route.continue() })
  await page.goto(base, { waitUntil: 'commit' })
  await page.locator('.boot-loading').waitFor()
  await page.screenshot({ path: `${output}/boot.png` })
  boot.release()
  await page.locator('.component-tile').first().waitFor()
  await page.locator('.component-tile iframe').first().waitFor()
  const totalComponents = await page.locator('.component-tile').count()
  const initialFrames = await page.locator('.component-tile iframe').count()
  assert.ok(initialFrames > 0 && initialFrames <= 12, `Visible previews only: ${initialFrames}`)
  assert.equal(await page.locator('.component-tile').last().locator('iframe').count(), 0)
  assert.equal(await page.locator('.component-tile').first().locator('.preview-frame').getAttribute('aria-busy'), 'true')
  await page.screenshot({ path: `${output}/catalog-loading-desktop.png` })
  preview.release()
  await page.locator('.component-tile').first().locator('.preview-frame--ready').waitFor()
  assert.deepEqual(topLevelLibrary, [], 'Catalog does not download component implementations or raw source')
  await page.locator('.component-tile').last().scrollIntoViewIfNeeded()
  await page.locator('.component-tile').last().locator('.preview-frame--ready').waitFor()
  assert.ok(await page.locator('.component-tile iframe').count() < totalComponents)

  const detail = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const componentGate = gate()
  const sourceGate = gate()
  const requestedSources = []
  await detail.route('**/src/library/osmo/MotionButton.vue', async route => { await componentGate.promise; await route.continue() })
  await detail.route(/\/src\/library\/.*[?&]raw(?:&|$)/, async route => { requestedSources.push(route.request().url()); await sourceGate.promise; await route.continue() })
  await detail.goto(`${base}/#/component/osmo-motion-button`, { waitUntil: 'domcontentloaded' })
  await detail.locator('.preview-frame__loading').waitFor()
  const sizeBefore = await detail.locator('.canvas-device').boundingBox()
  await detail.getByLabel('按钮文字').fill('Loaded with latest props')
  await detail.evaluate(() => window.scrollTo(0, 0))
  await detail.screenshot({ path: `${output}/detail-loading-mobile.png`, fullPage: true })
  componentGate.release()
  await detail.locator('.preview-frame--ready').waitFor()
  await detail.frameLocator('iframe').getByRole('button', { name: 'Loaded with latest props' }).waitFor()
  const sizeAfter = await detail.locator('.canvas-device').boundingBox()
  assert.deepEqual({ width: sizeAfter.width, height: sizeAfter.height }, { width: sizeBefore.width, height: sizeBefore.height }, 'Loading does not resize the preview')
  assert.deepEqual(requestedSources, [], 'Preview does not fetch source')
  await detail.getByRole('tab', { name: 'Source', exact: true }).click()
  await detail.locator('.source-state[role="status"]').waitFor()
  sourceGate.release()
  await detail.locator('pre').waitFor()
  assert.equal(requestedSources.length, 1)
  assert.ok((await detail.locator('pre').textContent()).includes('defineProps'))

  const failure = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  let fail = true
  await failure.route('**/src/library/osmo/MotionButton.vue', async route => { if (fail) await route.abort('failed'); else await route.continue() })
  await failure.goto(`${base}/#/component/osmo-motion-button`, { waitUntil: 'domcontentloaded' })
  await failure.locator('.preview-frame [role="alert"]').waitFor()
  fail = false
  await failure.getByRole('button', { name: '重新加载', exact: true }).click()
  await failure.locator('.preview-frame--ready').waitFor()
  await failure.frameLocator('iframe').getByRole('button', { name: 'Explore the collection' }).waitFor()
  let failSource = true
  await failure.route(/\/src\/library\/.*[?&]raw(?:&|$)/, async route => { if (failSource) await route.abort('failed'); else await route.continue() })
  await failure.getByRole('tab', { name: 'Source', exact: true }).click()
  await failure.locator('.source-state[role="alert"]').waitFor()
  failSource = false
  await failure.getByRole('button', { name: '重新加载源码' }).click()
  await failure.locator('pre').waitFor()
  const standalone = await browser.newPage()
  let failStandalone = true
  await standalone.route('**/src/library/osmo/MotionButton.vue', async route => { if (failStandalone) await route.abort('failed'); else await route.continue() })
  await standalone.goto(`${base}/#/preview/osmo-motion-button`, { waitUntil: 'domcontentloaded' })
  await standalone.getByRole('alert').waitFor()
  failStandalone = false
  await standalone.getByRole('button', { name: '重新加载', exact: true }).click()
  await standalone.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
  console.log(`Loading checks passed: bootstrap, ${initialFrames}/${totalComponents} initial iframes, viewport activation, latest props, lazy source, retry, desktop/mobile stable layout.`)
} finally { await browser.close() }
