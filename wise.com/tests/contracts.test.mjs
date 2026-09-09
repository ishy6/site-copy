import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const app = readFileSync(`${root}/src/App.vue`, 'utf8')
const styles = readFileSync(`${root}/src/style.css`, 'utf8')
const viteConfig = readFileSync(`${root}/vite.config.ts`, 'utf8')
const data = readFileSync(`${root}/src/wiseData.ts`, 'utf8')
const currencyData = readFileSync(`${root}/src/wiseCurrencyData.ts`, 'utf8')

function between(source, start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end))
}

test('ships the complete Wise selector and coverage data sets', () => {
  const sourceCurrencySource = between(currencyData, 'export const wiseSourceCurrencies', 'export const wiseTargetCurrencies')
  const targetCurrencySource = between(currencyData, 'export const wiseTargetCurrencies', 'export const wiseCountryCurrencies')
  const countryCurrencySource = between(currencyData, 'export const wiseCountryCurrencies', 'export interface WiseQuoteProfile')
  const destinationSource = between(data, 'const destinationSeeds', 'export const destinations')
  const coverageOrderSource = between(data, 'const coverageDisplayOrder', 'export const coverage')
  const coverageSource = data.slice(data.indexOf('export const coverage'))

  assert.equal((sourceCurrencySource.match(/"code":/g) ?? []).length, 32)
  assert.equal((targetCurrencySource.match(/"code":/g) ?? []).length, 103)
  assert.equal((countryCurrencySource.match(/^  "[a-z]{2}":/gm) ?? []).length, 250)
  assert.doesNotMatch(sourceCurrencySource, /"code": "ALL"/)
  assert.match(targetCurrencySource, /"code": "ALL"/)
  assert.match(countryCurrencySource, /"dz": "DZD"/)
  const destinationMatches = [...destinationSource.matchAll(/\['([^']+)', '([^']+)'\]/g)]
  const coverageMatches = [...coverageSource.matchAll(/\{ flag: '([^']+)', slug: '([^']+)', text: '([^']+)' \}/g)]

  assert.equal(destinationMatches.length, 216)
  assert.equal(new Set(destinationMatches.map((match) => match[1])).size, destinationMatches.length)
  assert.equal(new Set(destinationMatches.map((match) => match[2])).size, destinationMatches.length)
  assert.equal(coverageMatches.length, 102)
  assert.deepEqual([...coverageOrderSource.matchAll(/'([^']+)'/g)].slice(0, 4).map((match) => match[1]), [
    '东帝汶',
    '中国大陆',
    '中国台湾',
    '中国香港',
  ])
  assert.match(coverageSource, /\.sort\(\(left, right\) => coverageDisplayOrder\.indexOf/)
  assert.match(coverageSource, /slug: 'the-usa', text: '美国'/)
  assert.match(coverageSource, /slug: 'hong-kong', text: '中国香港'/)
  assert.match(app, /return filteredCurrencies\.value\.filter\(\(currency\) => !popular\.has\(currency\.code\)\)/)
})

test('keeps the default calculator result aligned with the reference state', () => {
  const quoteSource = currencyData.slice(currencyData.indexOf('export const wiseQuoteProfiles'))
  const usdQuote = between(quoteSource, '"USD": {', '"GBP": {')
  assert.match(usdQuote, /"fee": 54\.76/)
  assert.match(usdQuote, /"dynamic": false/)
  assert.match(app, /const sendAmount = ref\(10000\)/)
  assert.match(app, /const receiveCurrency = ref<CurrencyCode>\('USD'\)/)
})

test('retains keyboard-safe source dialogs and every homepage selector flow', () => {
  for (const handler of [
    'openMobileMenu',
    'openMobilePanel',
    'closeMobilePanel',
    'openLanguageDrawer',
    'openLocalePopover',
    'closeLocalePopover',
    'chooseLocaleOption',
    'onLocaleKeydown',
    'openSelector',
    'chooseCurrency',
    'chooseDestination',
    'trapFocus',
  ]) {
    assert.match(app, new RegExp(`function ${handler}\\b`))
  }

  assert.match(app, /event\.key === 'Escape'/)
  assert.match(app, /document\.body\.style\.overflow = locked \? 'hidden' : ''/)
  assert.match(app, /role="dialog" aria-modal="true" aria-label="导航菜单"/)
  assert.match(app, /class="language-drawer" role="dialog" aria-modal="true"/)
  assert.match(app, /class="drawer-select locale-combobox"[^>]+role="combobox" aria-haspopup="dialog"/)
  assert.match(app, /class="drawer-select locale-combobox country-select"[^>]+role="combobox" aria-haspopup="dialog"/)
  assert.match(app, /class="locale-popover"[^>]+role="dialog" aria-modal="true"/)
  assert.match(app, /class="locale-option-list" role="listbox" tabindex="0" :aria-label=/)
  assert.match(app, /class="locale-search"/)
  assert.match(app, /class="selector-sheet"[^>]+role="dialog" aria-modal="true"/)
  assert.match(app, /role="combobox" aria-autocomplete="list"/)
  assert.match(app, /class="selector-list" role="listbox"/)
  assert.match(app, /role="option" tabindex="-1"/)
  assert.match(app, /event\.key === 'ArrowDown'/)
  const selectorKeyboardHandler = between(app, 'function onSelectorKeydown', 'function normaliseArrival')
  const localeKeyboardHandler = between(app, 'function onLocaleKeydown', 'function openLanguageDrawer')
  assert.match(selectorKeyboardHandler, /event\.isComposing/)
  assert.match(localeKeyboardHandler, /event\.isComposing/)
  assert.equal((app.match(/name="segmented-control"/g) ?? []).length, 2)
  assert.doesNotMatch(app, /class="language-drawer"[\s\S]*?<select/)
  assert.doesNotMatch(app, /demoModal|openDemo|demo-dialog|本地体验/)
})

test('ships the complete locale chooser contracts', () => {
  const languageSource = between(app, 'const languageOptions', 'const regionOptions')

  assert.equal((languageSource.match(/\{ value:/g) ?? []).length, 20)
  assert.match(languageSource, /value: 'cs', label: 'Čeština'/)
  assert.match(languageSource, /value: 'zh-TW', label: '中文（繁體）'/)
  assert.match(app, /const regionOptions[^\n]+destinations\.map/)
  assert.match(app, /localeUrls/)
  assert.match(app, /'CN:zh-CN': 'https:\/\/wise\.com\/zh-cn\/'/)
  assert.match(app, /'CN:en-GB': 'https:\/\/wise\.com\/cn\/'/)
  assert.match(app, /'GB:en-GB': 'https:\/\/wise\.com\/gb\/'/)
  assert.match(app, /\?lang=\$\{encodeURIComponent\(regionLanguage\.value\)\}/)
})

test('uses source navigation, locale, comparison, and store badge contracts', () => {
  assert.match(app, /const WISE_LOGIN_URL = 'https:\/\/wise\.com\/login'/)
  assert.match(app, /const WISE_REGISTER_URL = 'https:\/\/wise\.com\/register'/)
  assert.match(app, /%2Fonboarding%3Forigin%3DSTANDARD/)
  assert.match(app, /`https:\/\/wise\.com\/hk\/compare\?\$\{params\}`/)
  assert.match(app, /https:\/\/wise\.com\/zh-cn\//)
  assert.match(app, /app-store-badges\/en\.svg/)
  assert.match(app, /google-play-store-badges\/en\.svg/)
  assert.match(app, /消费管理/)
  assert.match(app, /人力平台/)
  assert.match(app, /title: '活动'/)
  assert.doesNotMatch(app, /simpleicons\.org\/linkedin/)
  assert.match(app, /logo_white\.svg/)
  assert.match(app, /--white\.svg/)
  assert.match(app, /class="fee-dialog-handle"/)
  assert.match(styles, /\.provider-wordmark/)
  assert.match(viteConfig, /'\/wise-rates': wiseRatesProxy/g)
  assert.match(viteConfig, /\/rates\/history\+live/)
})

test('uses the same original Wise logo path in header, menu, and footer', () => {
  const logoPaths = [...app.matchAll(/<path fill="currentColor" d="([^"]+)"/g)].map((match) => match[1])

  assert.equal(logoPaths.length, 3)
  assert.equal(new Set(logoPaths).size, 1)
})

test('guards responsive quote, coverage, narrow-card, and focus states', () => {
  const safeguards = styles.slice(styles.indexOf('/* Responsive safeguards for source states'))

  assert.match(safeguards, /@media \(max-width: 900px\)[\s\S]*?\.hero\.has-dynamic-quote \{[\s\S]*?height: auto;[\s\S]*?\.hero\.has-dynamic-quote \.calculator \{[\s\S]*?height: auto;[\s\S]*?\.hero\.has-dynamic-quote \.calculator-body \{[\s\S]*?height: auto;/)
  assert.match(safeguards, /@media \(min-width: 641px\) and \(max-width: 767px\)[\s\S]*?\.comparison-section \{[\s\S]*?display: block;[\s\S]*?\.coverage-section \{[\s\S]*?height: auto;[\s\S]*?\.coverage-grid \{[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)[\s\S]*?\.coverage-grid a:nth-child\(n \+ 5\) \{[\s\S]*?display: none;/)
  assert.match(safeguards, /@media \(max-width: 374px\)[\s\S]*?\.hero,[\s\S]*?\.calculator-body \{[\s\S]*?height: auto;[\s\S]*?\.calculator \{[\s\S]*?width: 100%;[\s\S]*?max-width: 100%;[\s\S]*?margin-left: 0;[\s\S]*?\.receive-amount-value input \{[\s\S]*?font-size: 34px;[\s\S]*?\.discount-note \{[\s\S]*?white-space: normal;[\s\S]*?\.app-card h2 \{[\s\S]*?max-width: 100%;[\s\S]*?\.store-badges \{[\s\S]*?flex-wrap: wrap;/)
  assert.match(safeguards, /\.discount-dialog \.info-dialog-close:focus-visible,[\s\S]*?\.provider-help-sheet-close:focus-visible \{[\s\S]*?width: 40px;[\s\S]*?height: 40px;[\s\S]*?clip-path: none;/)
  assert.match(app, /footerAccordionEnabled\.value = window\.innerWidth > 640 && window\.innerWidth <= 720/g)
  assert.match(app, /if \(!nextMobileViewport && mobileMenuOpen\.value\)/)
})
