import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const project = fileURLToPath(new URL('..', import.meta.url))
const source = resolve(project, '../prod-raw.shupatto.com')
const require = createRequire(resolve(source, 'package.json'))
const { load } = require('cheerio')
const destination = resolve(project, 'public/assets/shupatto')
await mkdir(destination, { recursive: true })
const products = []
for (const [slug, capacity] of [['compactbag-m', '15L'], ['compactbag-s', '7.5L'], ['jewels-of-the-sea', '15L']]) {
  const snapshot = JSON.parse(await readFile(resolve(source, `public/reference/en__product__${slug}.json`), 'utf8'))
  const $ = load(snapshot.body)
  $('noscript').remove()
  const data = JSON.parse(decodeURIComponent($('.js_productImage').first().attr('data-colors'))).slice(0, 3)
  const names = $('.js_detailInfoColors_item').map((_, element) => $(element).text().trim()).get()
  const fallbackNames = slug === 'jewels-of-the-sea' ? ['Coral Reefs', 'Sea Shells'] : ['Blue', 'Beige', 'Black']
  const colors = []
  for (const [index, item] of data.entries()) {
    const name = `${slug}-${index}.webp`
    await copyFile(resolve(source, `public${item.sprite.url_sp}`), resolve(destination, name))
    colors.push({ id: `${slug}-${index}`, label: names[index] || fallbackNames[index], image: `/assets/shupatto/${name}`, color: $('.p_pd_fvNavButtonBg').eq(index).css('background-color') || '#e1e3e1' })
  }
  products.push({ id: slug, name: slug === 'jewels-of-the-sea' ? 'Jewels of the sea' : `Compact ${slug.endsWith('-s') ? 'S' : 'M'}`, category: slug === 'jewels-of-the-sea' ? 'Recycled' : 'Standard', capacity, colors })
}
const storesPage = JSON.parse(await readFile(resolve(source, 'public/reference/en__shoplist.json'), 'utf8'))
const $ = load(storesPage.body)
const regions = $('.p_s_dealerUnit').map((_, element) => ({
  name: $(element).find('.p_s_dealerUnitTitle').text().trim(),
  stores: $(element).find('.p_s_dealerLink').map((_, link) => ({ name: $(link).find('.p_s_dealerListText').text().trim(), href: $(link).attr('href') })).get(),
})).get()
const frames = []
for (let index = 1; index <= 18; index++) {
  const file = `f${String(index).padStart(5, '0')}.webp`
  await copyFile(resolve(source, `public/assets/231221/data/sequence2/pc_large/1-02/${file}`), resolve(destination, file))
  frames.push(`/assets/shupatto/${file}`)
}
await mkdir(resolve(project, 'src/library/shupatto'), { recursive: true })
for (const [name, data] of [['products', products], ['regions', regions], ['foldSheets', frames]]) {
  await writeFile(resolve(project, `src/library/shupatto/${name}.ts`), `// Generated from local Shupatto snapshots by scripts/extract-shupatto.mjs.\nexport const ${name} = ${JSON.stringify(data, null, 2)}\n`)
}
console.log(`Extracted ${products.length} products, ${regions.length} regions and ${frames.length} original sprite sheets.`)
