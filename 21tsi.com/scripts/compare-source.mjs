import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sourceBaseUrl = (process.env.TSI_SOURCE_URL ?? 'https://21tsi.com').replace(/\/$/, '')
const entries = [
  'index.html',
  'fr/index.html',
  'job-offers/index.html',
  'fr/offres-d-emploi/index.html',
  'legal-notice/index.html',
  'fr/politique-de-confidentialite/index.html',
]

const sourceRoutes = new Map([
  ['index.html', '/'],
  ['fr/index.html', '/fr/'],
  ['job-offers/index.html', '/job-offers/'],
  ['fr/offres-d-emploi/index.html', '/fr/offres-d-emploi/'],
  ['legal-notice/index.html', '/legal-notice/'],
  ['fr/politique-de-confidentialite/index.html', '/fr/politique-de-confidentialite/'],
])

const analyticsBlock =
  /\n    <script type="text\/plain" data-category="analytics"[\s\S]*?<\/noscript>\n/
const vueMount = /\n    <div id="replica-runtime"[^>]*><\/div>/
const vueModule = /\n    <script type="module" src="\/src\/main\.ts"><\/script>/
const englishAccessibleBackLink =
  '<a href="/" aria-label="Back to the 21 TSI homepage"></a>'
const frenchAccessibleBackLink =
  '<a href="/fr/" aria-label="Retour à l’accueil de 21 TSI"></a>'
const existingPinnedTabAsset =
  /<link rel="mask-icon" href="\/assets\/images\/logo-small\.svg" color="#5bbad5">/

const normalizeSourceHtml = (html) => html.replace(analyticsBlock, '\n').trimEnd()
const normalizeLocalHtml = (html) =>
  html
    .replace(vueMount, '')
    .replace(vueModule, '')
    .replace(englishAccessibleBackLink, '<a href="/"></a>')
    .replace(frenchAccessibleBackLink, '<a href="/fr/"></a>')
    .replace(
      existingPinnedTabAsset,
      '<link rel="mask-icon" href="/assets/images/favicon/safari-pinned-tab.svg" color="#5bbad5">',
    )
    .trimEnd()

const fetchSource = async (pathname) => {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${sourceBaseUrl}${pathname}`, {
        headers: { 'user-agent': '21TSI replica source comparison' },
        signal: AbortSignal.timeout(30_000),
      })

      if (response.ok) return response
      assert.ok(
        response.status === 429 || response.status >= 500,
        `${pathname} returned ${response.status} from ${sourceBaseUrl}`,
      )
      lastError = new Error(`${pathname} returned ${response.status} from ${sourceBaseUrl}`)
    } catch (error) {
      lastError = error
    }

    if (attempt < 3) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 250))
    }
  }

  throw lastError
}

const firstDifference = (expected, actual) => {
  const limit = Math.min(expected.length, actual.length)
  let index = 0
  while (index < limit && expected[index] === actual[index]) index += 1
  return index
}

for (const entry of entries) {
  const route = sourceRoutes.get(entry)
  const [sourceHtml, localHtml] = await Promise.all([
    fetchSource(route).then((response) => response.text()),
    readFile(resolve(root, entry), 'utf8'),
  ])
  const expected = normalizeSourceHtml(sourceHtml)
  const actual = normalizeLocalHtml(localHtml)
  const difference = firstDifference(expected, actual)

  assert.equal(
    actual,
    expected,
    `${entry} differs from ${sourceBaseUrl}${route} near character ${difference}`,
  )
}

const listFiles = async (directory) => {
  const files = []
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name)
    if (item.isDirectory()) files.push(...(await listFiles(path)))
    else if (item.isFile()) files.push(path)
  }
  return files
}

const assetRoot = resolve(root, 'public/assets')
const assetFiles = (await listFiles(assetRoot)).sort()
const mismatches = []

for (let offset = 0; offset < assetFiles.length; offset += 8) {
  const batch = assetFiles.slice(offset, offset + 8)
  await Promise.all(
    batch.map(async (file) => {
      const pathname = `/${relative(resolve(root, 'public'), file).split(sep).join('/')}`
      const [sourceBytes, localBytes] = await Promise.all([
        fetchSource(pathname).then(async (response) => Buffer.from(await response.arrayBuffer())),
        readFile(file),
      ])

      if (!sourceBytes.equals(localBytes)) mismatches.push(pathname)
    }),
  )
}

assert.deepEqual(mismatches, [], `source asset mismatches: ${mismatches.join(', ')}`)

console.log(
  `21TSI source comparison passed: ${entries.length} pages and ${assetFiles.length} assets match ${sourceBaseUrl}.`,
)
