import { writeFile } from 'node:fs/promises'

const REFERENCE_URL = 'https://wise.com/zh-hk/'
const OUTPUT_URL = new URL('../src/wiseCurrencyData.ts', import.meta.url)
const NEXT_DATA_PATTERN = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
const requestHeaders = { 'accept-language': 'zh-CN,zh;q=0.9' }

async function readPageData(url) {
  const response = await fetch(url, { headers: requestHeaders })
  if (!response.ok) throw new Error(`Wise returned ${response.status} for ${url}`)

  const html = await response.text()
  const match = html.match(NEXT_DATA_PATTERN)
  if (!match) throw new Error(`Missing __NEXT_DATA__ for ${url}`)
  return JSON.parse(match[1]).props.pageProps
}

const pageProps = await readPageData(REFERENCE_URL)
const sourceEntries = pageProps.data.productAvailability.send.coverage.sourceCurrencies
const targetEntries = sourceEntries.find((entry) => entry.code === 'HKD')?.targetCurrencies
if (!targetEntries) throw new Error('Missing HKD target currencies')

const quoteProfiles = {}
for (let index = 0; index < targetEntries.length; index += 8) {
  const batch = targetEntries.slice(index, index + 8)
  const profiles = await Promise.all(batch.map(async ({ code }) => {
    const url = new URL(REFERENCE_URL)
    url.searchParams.set('sourceCurrency', 'HKD')
    url.searchParams.set('targetCurrency', code)
    url.searchParams.set('sourceAmount', '10000')

    const quote = (await readPageData(url)).data.initialQuote
    const option = quote.paymentOptions.find((item) => item.payIn === 'BANK_TRANSFER') ?? quote.paymentOptions[0]
    if (!option) throw new Error(`Missing bank transfer quote for ${code}`)

    return [code, {
      rate: quote.rate,
      fee: option.fee.total,
      targetAmount: option.targetAmount,
      dynamic: Boolean(option.disabledReason),
      arrival: option.formattedEstimatedDelivery,
    }]
  }))
  Object.assign(quoteProfiles, Object.fromEntries(profiles))
}

const generated = `// Generated from ${REFERENCE_URL} by scripts/sync-wise-data.mjs.\n` +
  `// Keep this snapshot in source control so the calculator still works offline.\n\n` +
  `export const wiseSourceCurrencies = ${JSON.stringify(sourceEntries.map(({ code, localizedName, popularityIndex }) => ({
    code,
    name: localizedName,
    popular: popularityIndex != null,
  })), null, 2)} as const\n\n` +
  `export const wiseTargetCurrencies = ${JSON.stringify(targetEntries.map(({ code, localizedName, popularityIndex }) => ({
    code,
    name: localizedName,
    popular: popularityIndex != null,
  })), null, 2)} as const\n\n` +
  `export const wiseTargetCurrenciesBySource: Record<string, { codes: string[]; popular: string[] }> = ${JSON.stringify(Object.fromEntries(
    sourceEntries.map(({ code, targetCurrencies }) => [code, {
      codes: targetCurrencies.map((currency) => currency.code),
      popular: targetCurrencies.filter((currency) => currency.popularityIndex != null).map((currency) => currency.code),
    }]),
  ), null, 2)}\n\n` +
  `export const wiseCountryCurrencies: Record<string, string> = ${JSON.stringify(Object.fromEntries(
    pageProps.translatedCountries.map(({ iso2Code, currencyCode }) => [iso2Code.toLowerCase(), currencyCode]),
  ), null, 2)}\n\n` +
  `export interface WiseQuoteProfile {\n` +
  `  rate: number\n  fee: number\n  targetAmount: number\n  dynamic: boolean\n  arrival: string | null\n}\n\n` +
  `export const wiseQuoteProfiles: Record<string, WiseQuoteProfile> = ${JSON.stringify(quoteProfiles, null, 2)}\n`

await writeFile(OUTPUT_URL, generated)
console.log(`Updated ${OUTPUT_URL.pathname}`)
