import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFile(resolve(root, path), 'utf8')
const digest = async (path) =>
  createHash('sha256').update(await readFile(resolve(root, path))).digest('hex')

const entries = [
  'index.html',
  'fr/index.html',
  'job-offers/index.html',
  'fr/offres-d-emploi/index.html',
  'legal-notice/index.html',
  'fr/politique-de-confidentialite/index.html',
]

const images = [
  'black-mask.webp',
  'customer-1.webp',
  'customer-2.webp',
  'customer-3.webp',
  'customer-4.webp',
  'focus-1.webp',
  'focus-2.webp',
  'focus-3.webp',
  'focus-4.webp',
  'hero.webp',
  'invest.webp',
  'join.webp',
  'manifesto-1.webp',
  'manifesto-2.webp',
  'manifesto-3.webp',
  'sphere-0.webp',
  'sphere-1.webp',
  'sphere-2.webp',
  'sphere-3.webp',
  'sport.webp',
]

const sourceAssets = [
  'public/assets/fonts/SaansVF.woff2',
  'public/assets/images/brands/ascend.svg',
  'public/assets/images/brands/maddle.svg',
  'public/assets/images/brands/mw.svg',
  'public/assets/images/brands/nordik.svg',
  'public/assets/images/desktop/detail-1.webp',
  'public/assets/images/desktop/detail-2.webp',
  'public/assets/images/desktop/detail-3.webp',
  'public/assets/images/favicon/android-chrome-192x192.png',
  'public/assets/images/favicon/android-chrome-384x384.png',
  'public/assets/images/favicon/apple-touch-icon.png',
  'public/assets/images/favicon/favicon-16x16.png',
  'public/assets/images/favicon/favicon-32x32.png',
  'public/assets/images/favicon/site.webmanifest',
  'public/assets/images/logo-full.svg',
  'public/assets/images/logo-small.svg',
  'public/assets/images/share.jpg',
  'public/assets/sounds/ambience.mp3',
]

for (const entry of entries) {
  const html = await read(entry)
  assert.match(html, /assets\/styles\/main\.css/, `${entry} must load the source stylesheet`)
  assert.match(html, /assets\/scripts\/main\.js/, `${entry} must load the source runtime`)
  assert.match(html, /src\/main\.ts/, `${entry} must mount the Vue runtime`)
  assert.match(html, /id="replica-runtime"/, `${entry} must expose the Vue mount point`)
  assert.doesNotMatch(html, /data-category="analytics"/, `${entry} must not enable source analytics`)
  assert.match(
    html,
    /<link rel="mask-icon" href="\/assets\/images\/logo-small\.svg"/,
    `${entry} must reference an existing pinned-tab asset`,
  )
  assert.doesNotMatch(
    html,
    /safari-pinned-tab\.svg/,
    `${entry} must not reference the missing source pinned-tab asset`,
  )
}

const home = await read('index.html')
const french = await read('fr/index.html')
const jobs = await read('job-offers/index.html')
const jobsFrench = await read('fr/offres-d-emploi/index.html')
const legal = await read('legal-notice/index.html')
const privacyFrench = await read('fr/politique-de-confidentialite/index.html')
const runtime = await read('public/assets/scripts/main.js')
const stylesheet = await read('public/assets/styles/main.css')

const count = (text, pattern) => (text.match(pattern) ?? []).length
const assertHomeInteractions = (html, label) => {
  const targets = new Set([...html.matchAll(/data-scroll-target="([^"]+)"/g)].map((match) => match[1]))
  const requestedTargets = [
    ...html.matchAll(/data-(?:scroll-to|menu-target)="([^"]+)"/g),
  ].map((match) => match[1])

  assert.equal(
    count(html, /<button[^>]+class="[^"\n]*ambienceSoundToggle(?:\s|\")/g),
    2,
    `${label} sound controls`,
  )
  assert.equal(count(html, /class="navbar_menuToggle"/g), 1, `${label} mobile menu trigger`)
  assert.equal(count(html, /class="menu_close"/g), 1, `${label} mobile menu close control`)
  assert.equal(count(html, /data-menu-target=/g), 5, `${label} mobile menu destinations`)
  for (const target of requestedTargets) {
    assert.ok(targets.has(target), `${label} interaction target ${target} must exist`)
  }
}

assert.match(home, /class="loading"/)
assert.match(home, /class="menu"/)
assert.match(home, /recognition_brands_cartouche/)
assert.equal((home.match(/class="collapse(?:\s|\")/g) ?? []).length, 7)
assertHomeInteractions(home, 'English home')
assert.match(french, /Tout le monde déteste le changement/)
assert.equal((french.match(/class="collapse(?:\s|\")/g) ?? []).length, 7)
assertHomeInteractions(french, 'French home')
assert.match(jobs, /data-job-board-id="21tsi"/)
assert.match(jobs, /static-assets\.ripplingcdn\.com\/ats\/embeds\/job-board\.v1\.js/)
assert.match(jobsFrench, /offres d&#39;emploi|offres d'emploi/)
assert.match(jobsFrench, /static-assets\.ripplingcdn\.com\/ats\/embeds\/job-board\.v1\.js/)
assert.match(legal, /Effective Date: June 13th, 2024/)
assert.match(privacyFrench, /Date d&#39;entrée en vigueur|Date d'entrée en vigueur/)
for (const [entry, html, backLabel] of [
  ['job-offers/index.html', jobs, 'Back to the 21 TSI homepage'],
  ['fr/offres-d-emploi/index.html', jobsFrench, 'Retour à l’accueil de 21 TSI'],
  ['legal-notice/index.html', legal, 'Back to the 21 TSI homepage'],
  ['fr/politique-de-confidentialite/index.html', privacyFrench, 'Retour à l’accueil de 21 TSI'],
]) {
  assert.match(html, /class="edito_scroll"/, `${entry} must expose the scroll control`)
  assert.match(html, /data-scroll-target="content"/, `${entry} must expose the content target`)
  assert.match(html, /class="navbarEdito_back"/, `${entry} must expose the back navigation`)
  assert.match(
    html,
    new RegExp(`<a href="[^"]+" aria-label="${backLabel}"></a>`),
    `${entry} back navigation must expose an accessible name`,
  )
}
assert.match(runtime, /CookieConsentConfig/)
assert.match(runtime, /Privacy Preference Center/)
assert.match(runtime, /Centre de pr/)
assert.match(runtime, /acceptAllBtn:"Accept all"/)
assert.match(runtime, /acceptNecessaryBtn:"Reject all"/)
assert.match(runtime, /showPreferencesBtn:"Manage preferences"/)
assert.match(runtime, /acceptAllBtn:"Tout accepter"/)
assert.match(runtime, /acceptNecessaryBtn:"Tout rejeter"/)
assert.match(stylesheet, /#cc-main \.cm/)
assert.match(stylesheet, /\.menu\.open/)
assert.match(stylesheet, /images\/mobile\/hero\.webp/)
assert.equal(
  await digest('public/assets/styles/main.css'),
  'a9d3fbdcbda4335de7e461c5b719e8b0f1fb1c16a596de1c292aa43c53c1a4bd',
  'the stylesheet must remain byte-identical to the source site',
)
assert.equal(
  await digest('public/assets/scripts/main.js'),
  'cd875a688d509b254c700f645f745efeb0a50f8a3cae3972435ce39eb6fedd69',
  'the interaction runtime must remain byte-identical to the source site',
)

for (const image of images) {
  for (const viewport of ['desktop', 'mobile']) {
    const file = resolve(root, `public/assets/images/${viewport}/${image}`)
    const metadata = await stat(file)
    assert.ok(metadata.size > 16, `${viewport}/${image} must be a non-empty source asset`)
  }
}

for (const asset of sourceAssets) {
  const metadata = await stat(resolve(root, asset))
  assert.ok(metadata.size > 16, `${asset} must be a non-empty source asset`)
}

console.log(
  `21TSI audit passed: ${entries.length} pages, home navigation/menu/sound controls, two-level cookie preferences, 7 scroll-driven collapses, ${images.length * 2} responsive images, ${sourceAssets.length} supporting assets, and byte-identical source CSS/JS.`,
)
