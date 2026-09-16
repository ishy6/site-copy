import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { strFromU8, unzipSync } from 'fflate'
import { marked } from 'marked'

const base = process.env.COMPONENTS_TEST_URL || 'http://127.0.0.1:5190'
const output = '/tmp/site-components-implementation'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const results = []
const isDocument = url => /\/(?:implementation|assets)\/[^/]+\.md$/.test(new URL(url).pathname)
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
  const requests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (request.resourceType() === 'fetch' && isDocument(request.url())) requests.push(request.url()) })
  await page.goto(base)
  await page.locator('.component-tile').first().waitFor()
  const ids = await page.locator('.tile-image').evaluateAll(items => items.map(item => item.getAttribute('href').split('/').pop()))
  assert.equal(ids.length, 43)
  assert.equal(requests.length, 0, 'Catalog must not fetch implementation Markdown')
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('implementation-content'))), false, 'Parser must be lazy')

  let release
  const gate = new Promise(resolve => { release = resolve })
  await page.route(url => isDocument(url.href), async route => {
    if (route.request().resourceType() !== 'fetch') return route.continue()
    await gate
    await route.continue()
  })
  await page.goto(`${base}/#/component/osmo-toolkit-carousel`)
  await page.getByRole('tab', { name: '实现详解' }).click()
  await page.getByRole('status').filter({ hasText: '正在加载实现文档' }).waitFor()
  await page.screenshot({ path: `${output}/loading.png` })
  release()
  await page.locator('.implementation-article h1').waitFor()
  await page.unrouteAll({ behavior: 'wait' })
  await page.screenshot({ path: `${output}/toolkit-desktop.png` })
  const original = await readFile('implementation/osmo-toolkit-carousel.md', 'utf8')
  await page.getByRole('button', { name: '复制实现文档', exact: true }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), original)
  const markdownDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载实现文档', exact: true }).click()
  const markdown = await markdownDownload
  await markdown.saveAs(`${output}/${markdown.suggestedFilename()}`)
  assert.equal(await readFile(`${output}/${markdown.suggestedFilename()}`, 'utf8'), original)
  await page.locator('.implementation-toc button').filter({ hasText: '指针滑动' }).click()
  assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H2')
  await page.locator('.implementation-source a').filter({ hasText: 'carousel.ts : 20-' }).click()
  await page.locator('.source-line--active').waitFor()
  assert.equal(await page.locator('.source-line--active').getAttribute('data-line'), '20')
  assert.ok((await page.locator('.source-line--active').textContent()).includes('useSlideSwipe'))
  await page.getByRole('tab', { name: '实现详解' }).click()
  await page.locator('.implementation-article h1').waitFor()
  assert.equal(requests.length, 1, 'Returning to the document must use its cached response')
  await page.locator('.implementation-article a').filter({ hasText: '手势测试' }).click()
  await page.locator('.source-line--active').waitFor()
  assert.equal(await page.locator('.source-file-list .active').textContent(), 'core.test.ts')

  for (const id of ids) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(`${base}/#/component/${id}`)
    await page.getByRole('tab', { name: '实现详解' }).click()
    await page.locator('.implementation-article h1').waitFor()
    assert.ok(await page.locator('.implementation-article pre code').count() >= 3, `${id}: missing code examples`)
    assert.ok(await page.locator('.implementation-source a').count() >= 2, `${id}: missing source positions`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${id}: desktop overflow`)
    await page.setViewportSize({ width: 320, height: 844 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${id}: mobile overflow`)
    if (['osmo-toolkit-carousel', 'shupatto-fold-sequence', 'wise-currency-converter'].includes(id)) {
      await page.locator('.workbench').scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${output}/${id}-320.png` })
    }
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download', exact: true }).click()
    const download = await pending
    const path = `${output}/${download.suggestedFilename()}`
    await download.saveAs(path)
    const archive = unzipSync(await readFile(path))
    const text = await readFile(`implementation/${id}.md`, 'utf8')
    assert.equal(strFromU8(archive[`implementation/${id}.md`]), text, `${id}: exported document differs`)
    assert.ok(strFromU8(archive['README.md']).includes(`implementation/${id}.md`))
    marked.walkTokens(marked.lexer(text), token => {
      if (token.type !== 'link' || !token.href.startsWith('../src/')) return
      const target = token.href.slice(3).split('#')[0]
      assert.ok(archive[target], `${id}: missing linked source ${target}`)
    })
    results.push({ id, sourceExcerpts: await page.locator('.implementation-source a').count(), markdownAndZip: 'passed', mobileOverflow: false })
  }

  const failing = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  let attempts = 0
  await failing.route(url => isDocument(url.href), route => {
    if (route.request().resourceType() !== 'fetch') return route.continue()
    attempts++
    return attempts === 1 ? route.fulfill({ status: 503, contentType: 'text/plain', body: 'Unavailable' }) : route.continue()
  })
  await failing.goto(`${base}/#/component/jitter-motion-timeline`)
  await failing.getByRole('tab', { name: '实现详解' }).click()
  await failing.getByRole('alert').filter({ hasText: '实现文档加载失败' }).waitFor()
  await failing.screenshot({ path: `${output}/retry.png` })
  await failing.getByRole('button', { name: '重新加载实现文档' }).click()
  await failing.locator('.implementation-article h1').waitFor()
  assert.equal(attempts, 2)

  const parserFailure = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  let parserAttempts = 0
  await parserFailure.route('**/implementation-content*', route => {
    parserAttempts++
    return parserAttempts === 1 ? route.abort('failed') : route.continue()
  })
  await parserFailure.goto(`${base}/#/component/osmo-toolkit-carousel`)
  await parserFailure.getByRole('tab', { name: '实现详解' }).click()
  await parserFailure.getByRole('alert').filter({ hasText: '实现文档加载失败' }).waitFor()
  await parserFailure.getByRole('button', { name: '刷新页面重试' }).click()
  await parserFailure.locator('.implementation-article h1').waitFor()
  assert.equal(parserAttempts, 2)
  assert.ok(parserFailure.url().endsWith('?tab=implementation'))

  const sanitized = await page.evaluate(async () => {
    const parser = performance.getEntriesByType('resource').find(entry => entry.name.includes('implementation-content'))
    if (!parser) return false
    const { renderImplementation } = await import(parser.name)
    const root = document.createElement('div')
    root.innerHTML = renderImplementation('# 标题\n\n<script>alert(1)</script><img src=x onerror=alert(2)>\n\n[危险](javascript:alert(3))').html
    return root.querySelector('h1')?.textContent === '标题' && !root.querySelector('script, [onerror], [href^="javascript:"]')
  })
  assert.equal(sanitized, true, 'Browser Markdown sanitization')
  assert.deepEqual(errors, [])
  await writeFile(`${output}/results.json`, JSON.stringify({ base, components: results, errors }, null, 2))
  console.log(`Implementation docs passed: ${results.length} components, desktop/mobile, source positions, Markdown/ZIP, loading/retry, sanitization.`)
} finally { await browser.close() }
