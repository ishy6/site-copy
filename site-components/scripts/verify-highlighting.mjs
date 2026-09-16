import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.COMPONENTS_TEST_URL || 'http://127.0.0.1:5190'
const output = '/tmp/site-components-highlighting'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base)
  await page.locator('.component-tile').first().waitFor()
  const ids = await page.locator('.tile-image').evaluateAll(items => items.map(item => item.getAttribute('href').split('/').pop()))
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => /syntax-highlighter|shiki|dark-plus/.test(entry.name))), false, 'No highlighting assets at startup')

  async function assertHighlight(selector) {
    const pre = page.locator(selector).first()
    await pre.waitFor()
    const result = await pre.evaluate(element => ({
      background: getComputedStyle(element).backgroundColor,
      colors: [...new Set([...element.querySelectorAll('code span[style]')].map(span => getComputedStyle(span).color))],
    }))
    assert.equal(result.background, 'rgb(30, 30, 30)')
    assert.ok(result.colors.length >= 3, `Expected syntax token colors: ${JSON.stringify(result.colors)}`)
  }

  await page.goto(`${base}/#/component/osmo-toolkit-carousel?tab=implementation`)
  await assertHighlight('.implementation-article pre.shiki')
  await page.locator('.implementation-toc button').filter({ hasText: '指针滑动' }).click()
  await page.screenshot({ path: `${output}/implementation-desktop.png` })
  const firstCode = await page.locator('.implementation-article pre.shiki code').first().textContent()
  assert.ok(firstCode.includes('export interface ToolkitItem'))
  await page.locator('.implementation-source a').filter({ hasText: 'carousel.ts : 20-' }).click()
  await assertHighlight('.highlighted-code pre.shiki')
  assert.equal(await page.locator('.source-line--active').getAttribute('data-line'), '20')
  const source = await readFile('src/library/osmo/carousel.ts', 'utf8')
  assert.equal(await page.locator('.highlighted-code code').textContent(), source)
  await page.getByRole('button', { name: '复制源码', exact: true }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
  await page.screenshot({ path: `${output}/source-desktop.png` })
  await page.getByRole('tab', { name: 'Usage', exact: true }).click()
  await assertHighlight('.highlighted-code pre.shiki')
  const example = await page.locator('.highlighted-code code').textContent()
  await page.getByRole('button', { name: '复制源码', exact: true }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), example)

  for (const tab of ['实现详解', 'Source', 'Usage']) {
    await page.setViewportSize({ width: 320, height: 844 })
    await page.getByRole('tab', { name: tab, exact: true }).click()
    const selector = tab === '实现详解' ? '.implementation-article pre.shiki' : '.highlighted-code pre.shiki'
    await assertHighlight(selector)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${tab}: mobile overflow`)
    const pre = page.locator(selector).first()
    await pre.scrollIntoViewIfNeeded()
    assert.ok(await pre.evaluate(element => {
      const scrollable = element.scrollWidth > element.clientWidth
      element.scrollLeft = 80
      return scrollable && element.scrollLeft > 0
    }), `${tab}: long code scrolls inside the block`)
    await page.screenshot({ path: `${output}/${tab === '实现详解' ? 'implementation' : tab.toLowerCase()}-mobile.png` })
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const id of ids) {
    await page.goto(`${base}/#/component/${id}?tab=implementation`)
    await page.locator('.implementation-article pre.shiki').first().waitFor()
    assert.equal(await page.locator('.implementation-article pre:not(.shiki)').count(), 0, `${id}: every code fence is highlighted`)
  }
  assert.deepEqual(errors, [])
  console.log(`VS Code Dark+ passed: ${ids.length} documents, Source/Usage, lazy loading, exact source/clipboard, line navigation and desktop/mobile screenshots.`)
} finally { await browser.close() }
