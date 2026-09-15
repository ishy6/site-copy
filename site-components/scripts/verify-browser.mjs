import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { unzipSync, strFromU8 } from 'fflate'

const base = process.env.COMPONENTS_TEST_URL || 'http://127.0.0.1:5190'
const output = '/tmp/site-components-verification'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const failedAssets = []
const results = []
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
  async function expectTileCount(count) {
    await page.waitForFunction(expected => document.querySelectorAll('.component-tile').length === expected, count)
    assert.equal(await page.locator('.component-tile').count(), count)
  }
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) failedAssets.push(`${response.status()} ${response.url()}`) })
  await page.goto(base)
  await page.locator('.component-tile').first().waitFor()
  const ids = await page.locator('.tile-image').evaluateAll(links => links.map(link => link.getAttribute('href').split('/').pop()))
  const metadata = await page.locator('.tile-meta').evaluateAll(items => items.map(item => ({ site: item.children[0].textContent, category: item.children[1].textContent })))
  assert.ok(ids.length > 0)
  assert.equal(new Set(ids).size, ids.length)
  const siteCount = new Set(metadata.map(item => item.site)).size
  const osmoCount = metadata.filter(item => item.site === 'osmo.supply').length
  const commerceCount = metadata.filter(item => item.category === 'Commerce').length
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${output}/collection-desktop.png` })
  await page.getByRole('searchbox', { name: '搜索组件' }).fill('wise currency converter')
  await expectTileCount(1)
  await page.getByRole('searchbox', { name: '搜索组件' }).fill('not-a-component')
  await page.getByText('No components found.').waitFor()
  await page.getByRole('button', { name: 'View all components' }).click()
  await expectTileCount(ids.length)
  await page.getByRole('button', { name: '收藏 Rotating Label Button', exact: true }).click()
  await page.reload()
  await page.getByRole('link', { name: 'Saved 1', exact: true }).click()
  await expectTileCount(1)
  await page.getByRole('link', { name: `All components ${ids.length}` }).click()
  await page.getByRole('button', { name: 'Commerce', exact: true }).click()
  await expectTileCount(commerceCount)
  await page.getByRole('button', { name: 'All', exact: true }).click()
  await page.getByRole('combobox', { name: '组件排序' }).selectOption('name')
  const titles = await page.locator('.tile-title > a').allTextContents()
  assert.deepEqual(titles, [...titles].sort((a, b) => a.localeCompare(b)))
  await page.getByRole('combobox', { name: '组件排序' }).selectOption('curated')

  await page.goto(`${base}/#/component/osmo-motion-button`)
  await page.frameLocator('.canvas-device iframe').getByRole('button', { name: 'Explore the collection' }).waitFor()
  await page.locator('.canvas-device .preview-frame--ready').waitFor()
  const initialHistoryLength = await page.evaluate(() => history.length)
  await page.getByLabel('按钮文字').fill('Test component')
  let frame = page.frameLocator('.canvas-device iframe')
  await frame.getByRole('button', { name: 'Test component' }).waitFor()
  assert.equal(await page.evaluate(() => history.length), initialHistoryLength, 'Props edits do not change browser history')
  assert.equal(await page.locator('.canvas-device .preview-frame').getAttribute('aria-busy'), 'false')
  await page.getByLabel('禁用', { exact: false }).check()
  await frame.locator('button:disabled').waitFor()
  assert.equal(await frame.getByRole('button', { name: 'Test component' }).isDisabled(), true)
  await page.getByRole('button', { name: '重置预览', exact: true }).click()
  await frame.getByRole('button', { name: 'Explore the collection' }).waitFor()
  await page.getByRole('button', { name: 'mobile viewport' }).click()
  await page.waitForFunction(() => Math.round(document.querySelector('.canvas-device').getBoundingClientRect().width) === 375)
  assert.equal(await page.locator('.canvas-device').evaluate(element => Math.round(element.getBoundingClientRect().width)), 375)
  await page.getByRole('tab', { name: 'Source', exact: true }).click()
  assert.ok((await page.locator('pre').textContent()).includes('defineProps'))
  await page.getByRole('button', { name: 'ButtonLabel.vue', exact: true }).click()
  assert.ok((await page.locator('pre').textContent()).includes('function rotate'))
  await page.getByRole('tab', { name: 'Usage', exact: true }).click()
  await page.getByRole('button', { name: 'Example.vue' }).click()
  await page.getByRole('tab', { name: 'Source', exact: true }).click()
  assert.ok((await page.locator('pre').textContent()).includes('function rotate'))
  await page.getByRole('button', { name: '复制源码' }).click()
  assert.ok((await page.evaluate(() => navigator.clipboard.readText())).includes('function rotate'))
  await page.getByRole('tab', { name: 'Preview', exact: true }).click()
  await page.getByRole('button', { name: 'desktop viewport' }).click()
  await page.screenshot({ path: `${output}/component-desktop.png` })

  await page.goto(`${base}/#/styles`)
  assert.equal(await page.locator('.style-item').count(), siteCount)
  await page.locator('.style-palette button').first().click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '#f4f4f4')
  await page.screenshot({ path: `${output}/styles-desktop.png` })
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(base)
    await page.waitForTimeout(350)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${width}: catalog overflow`)
    const header = await page.evaluate(() => {
      const brand = document.querySelector('.brand').getBoundingClientRect()
      const nav = document.querySelector('.top-nav').getBoundingClientRect()
      const menu = document.querySelector('.mobile-menu-button').getBoundingClientRect()
      return { brandRight: brand.right, navLeft: nav.left, navRight: nav.right, menuLeft: menu.left }
    })
    assert.ok(header.brandRight <= header.navLeft && header.navRight <= header.menuLeft, `${width}: header overlap ${JSON.stringify(header)}`)
    await page.screenshot({ path: `${output}/collection-${width}.png` })
    await page.getByRole('button', { name: '切换侧边栏' }).click()
    await page.getByRole('button', { name: /osmo\.supply/ }).click()
    await expectTileCount(osmoCount)
    assert.equal(await page.getByRole('button', { name: '切换侧边栏' }).getAttribute('aria-expanded'), 'false')
    await page.goto(`${base}/#/component/osmo-motion-button`)
    await page.waitForTimeout(250)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${width}: detail overflow`)
    const embeddedDocument = page.frames().find(candidate => candidate.url().includes('/preview/'))
    assert.equal(await embeddedDocument.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${width}: embedded detail overflow`)
    await page.screenshot({ path: `${output}/component-${width}.png`, fullPage: true })
  }
  console.log('Catalog search, filters, bookmarks, props, source, clipboard and responsive navigation passed.')

  for (const id of ids) {
    for (const width of [720, 320, 280]) {
      await page.setViewportSize({ width, height: width === 720 ? 465 : 600 })
      await page.goto(`${base}/#/preview/${id}${width === 720 ? '?thumbnail=1' : ''}`)
      await page.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
      await page.waitForTimeout(160)
      assert.equal(await page.locator('[role="alert"]').count(), 0, `${id}: render failure`)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${id}: ${width}px overflow`)
      if (width === 720) assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1), false, `${id}: clipped thumbnail`)
      const images = await page.locator('img').evaluateAll(async items => {
        await Promise.allSettled(items.map(image => image.decode()))
        return items.every(image => image.complete && image.naturalWidth > 0)
      })
      assert.ok(images, `${id}: image did not load`)
      await page.screenshot({ path: `${output}/${id}-${width}.png`, fullPage: true })
      results.push({ id, width, assets: 'loaded', overflow: false })
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(`${base}/#/component/${id}`)
    const downloading = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download', exact: true }).click()
    const download = await downloading
    const location = `${output}/${download.suggestedFilename()}`
    await download.saveAs(location)
    const archive = unzipSync(await readFile(location))
    assert.ok(archive['README.md'], `${id}: missing README`)
    assert.ok(Object.keys(archive).some(name => name.endsWith('.vue')), `${id}: missing Vue component`)
    for (const [path, data] of Object.entries(archive)) {
      if (!path.endsWith('.vue') && !path.endsWith('.ts')) continue
      for (const match of strFromU8(data).matchAll(/['"](\/assets\/[^'"\s]+)['"]/g)) {
        assert.ok(archive[`public${match[1]}`], `${id}: missing exported ${match[1]}`)
      }
    }
  }
  await page.setViewportSize({ width: 720, height: 465 })
  await page.goto(`${base}/#/preview/shupatto-fold-sequence?thumbnail=1`)
  await page.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
  const stage = page.locator('.shupatto-fold__stage')
  await stage.locator('img').evaluate(image => image.decode())
  const unfolded = await stage.screenshot({ path: `${output}/fold-unfolded.png` })
  await page.getByRole('slider', { name: 'Fold progress' }).fill('100')
  await stage.locator('img').evaluate(image => image.decode())
  const folded = await stage.screenshot({ path: `${output}/fold-folded.png` })
  assert.equal(unfolded.equals(folded), false, 'Folding scrub must change actual rendered pixels')
  await page.getByRole('button', { name: 'Reset folding' }).click()
  assert.equal(await page.getByRole('slider', { name: 'Fold progress' }).inputValue(), '0')

  await page.goto(`${base}/#/preview/osmo-toolkit-carousel`)
  await page.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
  const discover = page.getByRole('button', { name: 'Discover' })
  const buttonBox = await discover.boundingBox()
  await page.mouse.move(buttonBox.x + 5, buttonBox.y + buttonBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(buttonBox.x + 75, buttonBox.y + buttonBox.height / 2, { steps: 6 })
  await page.mouse.up()
  assert.equal(await page.locator('.osmo-toolkit__top > span').textContent(), '3 / 3')
  assert.equal(await page.locator('.event-toast').count(), 0, 'Dragging a CTA must not activate it')
  await discover.click()
  await page.locator('.event-toast').waitFor()

  await page.goto(`${base}/#/preview/osmo-stacked-gallery`)
  await page.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
  await page.locator('.osmo-stack .active button').focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => document.activeElement === document.querySelector('.osmo-stack .active button'))
  await page.keyboard.press('Enter')
  await page.locator('.event-toast').waitFor()

  await page.goto(`${base}/#/preview/osmo-testimonial-slider?props=${encodeURIComponent(JSON.stringify({ interval: 1000 }))}`)
  await page.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
  const originalQuote = await page.locator('blockquote p').textContent()
  await page.getByRole('button', { name: 'Play testimonials' }).click()
  await page.waitForFunction(quote => document.querySelector('blockquote p')?.textContent !== quote, originalQuote)
  await page.getByRole('button', { name: 'Pause testimonials' }).click()

  await page.goto(`${base}/#/preview/osmo-reel-dialog`)
  await page.locator('.embed-canvas[aria-busy="false"] > .embed-component').waitFor()
  await page.getByRole('button', { name: 'Play the reel.' }).click()
  await page.getByRole('dialog').waitFor()
  await page.waitForFunction(() => document.querySelector('video')?.readyState >= 1)
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(await page.getByRole('button', { name: 'Play the reel.' }).evaluate(button => document.activeElement === button), true)

  assert.deepEqual(errors, [], 'No browser runtime errors')
  assert.deepEqual(failedAssets, [], 'No local resource errors')
  await writeFile(`${output}/results.json`, JSON.stringify({ base, testedComponents: ids.length, viewports: results, errors, failedAssets }, null, 2))
  console.log(`Verified ${ids.length} component previews at desktop/mobile sizes and downloaded all ${ids.length} complete source packages.`)
} finally {
  await browser.close()
}
