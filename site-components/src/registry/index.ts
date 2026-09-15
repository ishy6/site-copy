import { osmoEntries } from './osmo'
import { osmoCoreEntries } from './osmo-core'
import { shupattoEntries } from './shupatto'
import { wiseShopEntries } from './wise-shop'
import { jitterTsiEntries } from './jitter-tsi'
import { makrAlsoEntries } from './makr-also'
import type { Category, ComponentEntry, SiteId } from './types'

export interface SiteStyle {
  id: SiteId
  name: string
  domain: string
  abbreviation: string
  color: string
  ink: string
  font: string
  fontFamily: string
  palette: { name: string; value: string }[]
  source: string
}

export const sites: SiteStyle[] = [
  { id: 'osmo', name: 'Osmo', domain: 'osmo.supply', abbreviation: 'O', color: '#6541f4', ink: '#ffffff', font: 'Haffer', fontFamily: 'Haffer, Arial, sans-serif', source: 'osmo.supply/src/style.css', palette: [{ name: 'paper', value: '#f4f4f4' }, { name: 'ink', value: '#201d1d' }, { name: 'violet', value: '#6541f4' }, { name: 'green', value: '#b1ff69' }] },
  { id: 'wise', name: 'Wise', domain: 'wise.com', abbreviation: 'W', color: '#9fe870', ink: '#163300', font: 'Inter', fontFamily: "'Library Wise', Arial, sans-serif", source: 'wise.com/src/style.css', palette: [{ name: 'green', value: '#9fe870' }, { name: 'forest', value: '#163300' }, { name: 'ink', value: '#0e0f0c' }, { name: 'neutral', value: '#eef0ec' }] },
  { id: 'jitter', name: 'Jitter', domain: 'jitter.video', abbreviation: 'J', color: '#e5ff53', ink: '#19181b', font: 'Lausanne', fontFamily: 'LibraryLausanne, Arial, sans-serif', source: 'jitter.video/src/style.css', palette: [{ name: 'ink', value: '#19181b' }, { name: 'accent', value: '#b498f5' }, { name: 'showcase', value: '#e5ff53' }, { name: 'surface', value: '#f3f3f5' }] },
  { id: 'shop', name: 'Shop', domain: 'shop.app', abbreviation: 'S', color: '#5433eb', ink: '#ffffff', font: 'GT Standard', fontFamily: "'Library Shop', Arial, sans-serif", source: 'shop.app/src/style.css', palette: [{ name: 'purple', value: '#5433eb' }, { name: 'ink', value: '#080808' }, { name: 'line', value: '#e1e1e1' }, { name: 'surface', value: '#f1f1f1' }] },
  { id: '21tsi', name: '21TSI', domain: '21tsi.com', abbreviation: '21', color: '#101913', ink: '#f8f8f6', font: 'Saans', fontFamily: 'LibrarySaans, Arial, sans-serif', source: '21tsi.com/public/assets/styles/main.css', palette: [{ name: 'forest', value: '#101913' }, { name: 'ink', value: '#101211' }, { name: 'text', value: '#f8f8f6' }, { name: 'muted', value: '#818b82' }] },
  { id: 'makr', name: 'MAKR', domain: 'makr.com', abbreviation: 'M', color: '#a9aea9', ink: '#1c1717', font: 'Sohne', fontFamily: "'Library MAKR', Arial, sans-serif", source: 'makr.com/public/reference/original.css', palette: [{ name: 'ink', value: '#1c1717' }, { name: 'sage', value: '#a9aea9' }, { name: 'paper', value: '#faf9f6' }, { name: 'line', value: '#b7b9b1' }] },
  { id: 'also', name: 'ALSO', domain: 'ridealso.com', abbreviation: 'A', color: '#ac74fc', ink: '#1e1e1e', font: 'ABC Camera', fontFamily: "'Library ALSO Camera', Arial, sans-serif", source: 'ridealso.com/src/style.css', palette: [{ name: 'purple', value: '#ac74fc' }, { name: 'green', value: '#b1ff8f' }, { name: 'ink', value: '#1e1e1e' }, { name: 'cream', value: '#fcf2e8' }] },
  { id: 'shupatto', name: 'Shupatto', domain: 'prod-raw.shupatto.com', abbreviation: 'Sh', color: '#738ae5', ink: '#272726', font: 'TT Fors', fontFamily: "'Library Shupatto', Arial, sans-serif", source: 'prod-raw.shupatto.com/public/assets/202601151311/css/app.css', palette: [{ name: 'ink', value: '#272726' }, { name: 'paper', value: '#e8e8e8' }, { name: 'canvas', value: '#e1e3e1' }, { name: 'accent', value: '#738ae5' }] },
]

const grouped = [osmoEntries, osmoCoreEntries, wiseShopEntries, jitterTsiEntries, makrAlsoEntries, shupattoEntries]
const order = ['osmo-motion-button', 'wise-currency-converter', 'jitter-motion-tile', 'shop-product-card', 'osmo-billing-switch']
export const entries: ComponentEntry[] = grouped.flat().sort((a, b) => {
  const left = order.indexOf(a.id)
  const right = order.indexOf(b.id)
  return (left < 0 ? 100 : left) - (right < 0 ? 100 : right)
})
export const categories: Category[] = ['Buttons', 'Navigation', 'Commerce', 'Forms', 'Typography', 'Media']
export const siteById = Object.fromEntries(sites.map(site => [site.id, site])) as Record<SiteId, SiteStyle>
export { getSource } from '../source-loader'
export function defaultProps(entry: ComponentEntry): Record<string, string | number | boolean> {
  return Object.fromEntries(entry.props.map(prop => [prop.name, prop.default]))
}

export function filterEntries(items: ComponentEntry[], filters: { query: string; site: string; category: string; favoritesOnly: boolean; favorites: string[] }) {
  const terms = filters.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return items.filter(entry => {
    const search = [entry.title, entry.summary, entry.site, siteById[entry.site].domain, entry.category, ...entry.tags].join(' ').toLocaleLowerCase()
    return (!filters.site || entry.site === filters.site) && (!filters.category || entry.category === filters.category)
      && (!filters.favoritesOnly || filters.favorites.includes(entry.id)) && terms.every(term => search.includes(term))
  })
}
