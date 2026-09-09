<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Globe2,
  Info,
  Menu,
  Search,
  Tag,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import FlagBelt from './FlagBelt.vue'
import { coverage, destinations, sourceCurrencies, targetCurrencies, type Country, type Currency, type CurrencyCode } from './wiseData'
import { wiseQuoteProfiles, wiseTargetCurrenciesBySource } from './wiseCurrencyData'

type SelectorType = 'destination' | 'source' | 'target'
type SelectorContext = 'calculator' | 'comparison'
type InfoDialogType = 'rate' | 'discount'
type RatePeriod = 'week' | 'month' | 'halfYear'
type LocalePopoverType = 'language' | 'country'

interface LocaleOption {
  value: string
  label: string
}

interface RateHistoryPoint {
  time: number
  value: number
}

interface LiveTableProvider {
  name: string
  logo: string
  value: number
  subValue?: number
  note?: string
}

interface LiveHomepageProvider {
  name: string
  logo: string
  amount: number
  transferFee: number
  rate: number
  markupPercent: number
  wise: boolean
}

interface HomepageProviderRow extends LiveHomepageProvider {
  fee: number
  markupAmount: number
  factor: number
}

interface LiveFeeDetail {
  label: string
  value: string
}

const WISE_HOME_URL = 'https://wise.com/'
const WISE_LOGIN_URL = 'https://wise.com/login'
const WISE_REGISTER_URL = 'https://wise.com/register'
const WISE_OPEN_ACCOUNT_URL = 'https://wise.com/register?redirectUrl=%2Fonboarding%3Forigin%3DSTANDARD'
const WISE_SEND_REGISTER_URL = 'https://wise.com/register?redirectUrl=%2Fonboarding%3Forigin%3DSTANDARD%26intent%3DSEND'
const WISE_ICON_PATHS = {
  autoConvert: 'M15 9h2.692l-5.215 5.563L9.714 11.8a1.01 1.01 0 0 0-1.425-.003L2.748 17.29l1.408 1.42 4.84-4.799 2.79 2.789a1.01 1.01 0 0 0 1.45-.024L19 10.53V13h2V8.01A1.01 1.01 0 0 0 19.99 7H15zm-2-2H5v2h8z',
  arrowDown: 'M11 18.586V2h2v16.586l6.293-6.293 1.414 1.414-7.993 7.993a1.01 1.01 0 0 1-1.428 0l-7.993-7.993 1.414-1.414z',
  arrowUp: 'm13 5.414 6.293 6.293 1.414-1.414L12.714 2.3a1.01 1.01 0 0 0-1.428 0l-7.993 7.993 1.414 1.414L11 5.414V22h2z',
  bank: 'M12 5.18 7.487 8h9.026zm-.535-2.025a1.01 1.01 0 0 1 1.07 0L20.5 8.134c.861.537.48 1.866-.535 1.866H19v9h2v2H3v-2h2v-9h-.965C3.02 10 2.639 8.671 3.5 8.134zM7 19h4v-9H7zm6 0h4v-9h-4z',
  card: 'M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm16 4V6H4v2zM4 10v8h16v-8z',
  chevronDown: 'm12 14.586 7.293-7.293 1.414 1.414-7.993 7.993a1.01 1.01 0 0 1-1.428 0L3.293 8.707l1.414-1.414z',
  chevronLeft: 'm8.414 12 7.293-7.293-1.414-1.414L6.3 11.286a1.01 1.01 0 0 0 0 1.428l7.993 7.993 1.414-1.414z',
  chevronRight: 'M15.586 12 8.293 4.707l1.414-1.414 7.993 7.993a1.01 1.01 0 0 1 0 1.428l-7.993 7.993-1.414-1.414z',
  clock: 'M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0m8-10C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2m-1 4v5.996c0 .268.106.525.296.714l3.497 3.497 1.414-1.414L13 11.586V6z',
  headset: 'M5.07 8a7.002 7.002 0 0 1 13.86 0H19a4 4 0 0 1 0 8h-.995C17.45 16 17 15.55 17 14.995V9A5 5 0 0 0 7 9v6a5 5 0 0 0 4.006 4.901A1.01 1.01 0 0 1 12.01 19h1.98c.558 0 1.01.452 1.01 1.01v.98A1.01 1.01 0 0 1 13.99 22H12a7 7 0 0 1-6.93-6H5a4 4 0 0 1 0-8zM5 10a2 2 0 1 0 0 4zm14 0a2 2 0 1 1 0 4z',
  padlock: 'M12 3a5 5 0 0 0-5 5v1H5.01A1.01 1.01 0 0 0 4 10.01V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.99A1.01 1.01 0 0 0 18.99 9H17V8a5 5 0 0 0-5-5m3 6V8a3 3 0 0 0-6 0v1zm-9 2v8h12v-8zm5 6v-4h2v4z',
  padlockUnlocked: 'M12 3a5 5 0 0 0-5 5v1H5.01A1.01 1.01 0 0 0 4 10.01V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.99A1.01 1.01 0 0 0 18.99 9H9V8a3 3 0 0 1 5.905-.75l1.936-.5A5 5 0 0 0 12 3m-6 8v8h12v-8zm5 6v-4h2v4z',
  people: 'M12.136 7.105A3.001 3.001 0 0 1 18 8a3 3 0 0 1-4.003 2.829 4.99 4.99 0 0 0-1.861-3.724m5.983 4.803a5 5 0 1 0-7.778-5.726A5.005 5.005 0 0 0 4 11a4.99 4.99 0 0 0 1.88 3.908C4.144 16.013 3 18.01 3 20.25V21h2v-.75C5 17.856 6.836 16 9 16s4 1.856 4 4.25V21h2v-.75c0-2.24-1.143-4.237-2.88-5.342a5 5 0 0 0 1.297-1.562A3.8 3.8 0 0 1 15 13c2.164 0 4 1.856 4 4.25V18h2v-.75c0-2.24-1.143-4.237-2.88-5.342M12 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  receipt: 'M6 2a2 2 0 0 0-2 2v16.98c0 .846.98 1.317 1.64.788l1.786-1.428 1.36 1.36a1.01 1.01 0 0 0 1.346.075L12 20.281l1.868 1.494c.402.322.982.29 1.345-.074l1.361-1.361 1.785 1.428A1.01 1.01 0 0 0 20 20.979V4a2 2 0 0 0-2-2zm0 2h12v14.92l-.868-.695a1.01 1.01 0 0 0-1.345.074l-1.361 1.361-1.795-1.436a1.01 1.01 0 0 0-1.262 0L9.574 19.66l-1.36-1.36a1.01 1.01 0 0 0-1.346-.075L6 18.919zm10 2H8v2h8zm-8 4h8v2H8zm8 4H8v2h8z',
  diagonalTransfer: 'M8 4h3.586l-8.293 8.293 1.414 1.414L13 5.414V9h2V3.01A1.01 1.01 0 0 0 13.99 2H8zm8.586 9H13v-2h5.99c.558 0 1.01.452 1.01 1.01V18h-2v-3.586l-8.293 8.293-1.414-1.414z',
  grid: 'M4.01 3A1.01 1.01 0 0 0 3 4.01v5.98c0 .558.452 1.01 1.01 1.01h5.98A1.01 1.01 0 0 0 11 9.99V4.01A1.01 1.01 0 0 0 9.99 3zM5 9V5h4v4zm-.99 4A1.01 1.01 0 0 0 3 14.01v5.98c0 .558.452 1.01 1.01 1.01h5.98A1.01 1.01 0 0 0 11 19.99v-5.98A1.01 1.01 0 0 0 9.99 13zM5 19v-4h4v4zm8-14.99c0-.558.452-1.01 1.01-1.01h5.98c.558 0 1.01.452 1.01 1.01v5.98A1.01 1.01 0 0 1 19.99 11h-5.98A1.01 1.01 0 0 1 13 9.99zM15 5v4h4V5zm-.99 8A1.01 1.01 0 0 0 13 14.01v5.98c0 .558.452 1.01 1.01 1.01h5.98A1.01 1.01 0 0 0 21 19.99v-5.98A1.01 1.01 0 0 0 19.99 13zm.99 6v-4h4v4z',
} as const

const reviews = [
  { flag: 'usd', name: 'Stuart', href: 'https://www.trustpilot.com/reviews/6502faa17a75830973fb7eff', text: '“这让我们跨越两大洲的生活成为可能。汇款非常简单，而且非常快。”', dark: false },
  { flag: 'gbp', name: 'Gerald', href: 'https://www.trustpilot.com/users/626f018b8385d500128a4c22', text: '“我每个月都用 Wise 支付我在其他国家的抵押贷款。操作简单，非常好用。”', dark: true },
  { flag: 'usd', name: 'Gemma', href: 'https://www.trustpilot.com/users/62240174ef541f00128623cc', text: '“最好的旅行伙伴！Wise 让一切问题都迎刃而解。”', dark: false },
  { flag: 'dkk', name: 'Stefani', href: 'https://www.trustpilot.com/reviews/6208f1a2bc5a51af69c0e62b', text: '“对于一个在国外独自生活的学生来说，Wise 真的是我的救星。”', dark: true },
]

const ratingLinks = [
  {
    name: 'App Store',
    icon: '/assets/icons/app-store.png',
    copy: 'App Store 评分 4.8 ★，共 15万 条评论',
    href: 'https://wise-app.sng.link/Apnl5/0r11',
  },
  {
    name: 'Google Play',
    icon: '/assets/icons/google-play.png',
    copy: 'Google Play 评分 4.8 ★，共 128万 条评论',
    href: 'https://wise-app.sng.link/Apnl5/3b0q6',
  },
]

const navData = {
  personal: {
    title: 'Wise 个人账户',
    desc: '快捷、实惠的跨境汇款方式。',
    image: 'gn_personal_v3_send.jpg',
    groups: [
      { title: '产品', links: ['汇款', '发送大额汇款'] },
      { title: '定价', links: ['个人定价'] },
    ],
  },
  business: {
    title: 'Wise 企业账户',
    desc: '您的创业公司或高速成长企业实现国际化发展所需的唯一账户。',
    image: 'gn_business_v2.jpg',
    groups: [
      { title: '产品', links: ['汇款', '收款', '管理团队财务', '关联会计软件'] },
      { title: '资源', links: ['探索 API 集成', '探索演示', '联系销售'] },
      { title: '定价', links: ['企业定价'] },
    ],
  },
  platform: {
    title: 'Wise Platform',
    desc: '银行、金融机构和企业均可接入我们的网络。',
    image: 'gn_platform_v2.jpg',
    groups: [
      { title: '产品', links: ['汇款', '收款', '发行卡片', '多币种账户'] },
      { title: '行业', links: ['银行和金融机构', '教育平台', '市场', '消费管理', '旅游平台', '人力平台'] },
      { title: '活动', links: ['注册 Wise Connect'] },
      { title: '开发者', links: ['浏览 API 文档'] },
    ],
  },
} as const

const footerGroups = [
  { title: '产品', links: ['Wise 个人', 'Wise 企业账户', 'Wise Platform'] },
  { title: 'Wise 个人', links: ['跨境汇款', '大额汇款'] },
  { title: '资源', links: ['汇率计算工具', '国际股票代码', 'SWIFT/BIC 代码', 'IBAN 代码', '汇率提醒', '比较汇率', '功能可用性'] },
  { title: '公司与团队', links: ['公司与团队', '最新消息与博客', '安全性', '媒体报道', '工作机会', '投资者关系', '我们的使命', '联盟机构与合作伙伴', '评价'] },
  { title: '帮助', links: ['帮助中心', '服务状态'] },
]

const footerColumns = [
  footerGroups.slice(0, 2).map((group, index) => ({ group, index })),
  footerGroups.slice(2, 3).map((group, index) => ({ group, index: index + 2 })),
  footerGroups.slice(3).map((group, index) => ({ group, index: index + 3 })),
]

const activeMega = ref<keyof typeof navData | null>(null)
const mobileMenuOpen = ref(false)
const mobilePanel = ref<keyof typeof navData | null>(null)
const languageOpen = ref(false)
const language = 'ZH'
const regionLanguage = ref('zh-CN')
const regionCountry = ref('HK')
const localePopover = ref<LocalePopoverType | null>(null)
const localeQuery = ref('')
const localeActiveIndex = ref(0)
const sendCurrency = ref<CurrencyCode>('HKD')
const receiveCurrency = ref<CurrencyCode>('USD')
const sendAmount = ref(10000)
const sendAmountDraft = ref('')
const sendAmountEditing = ref(false)
const comparisonSendCurrency = ref<CurrencyCode>('HKD')
const comparisonReceiveCurrency = ref<CurrencyCode>('USD')
const comparisonSendAmount = ref(10000)
const selector = ref<SelectorType | null>(null)
const selectorContext = ref<SelectorContext>('calculator')
const selectorQuery = ref('')
const destination = ref<Country>(destinations.find((item) => item.name === '美国') ?? destinations[0])
const feeDialogOpen = ref(false)
const feeDialogTab = ref<'details' | 'compare'>('details')
const infoDialog = ref<InfoDialogType | null>(null)
const ratePeriod = ref<RatePeriod>('month')
const rateHistory = ref<{ key: string; points: RateHistoryPoint[] } | null>(null)
const providerHelp = ref<string | null>(null)
const headerHidden = ref(false)
const isMobileViewport = ref(false)
const footerAccordionEnabled = ref(false)
const reviewIndex = ref(0)
const footerOpen = ref<string[]>([])
const mobileMenuEl = ref<HTMLElement | null>(null)
const selectorEl = ref<HTMLElement | null>(null)
const languageEl = ref<HTMLElement | null>(null)
const localePopoverEl = ref<HTMLElement | null>(null)
const localeTriggerEl = ref<HTMLElement | null>(null)
const feeDialogEl = ref<HTMLElement | null>(null)
const infoDialogEl = ref<HTMLElement | null>(null)
const providerHelpSheetEl = ref<HTMLElement | null>(null)
const providerHelpTriggerEl = ref<HTMLElement | null>(null)
const returnFocusEl = ref<HTMLElement | null>(null)
const selectorTriggerEl = ref<HTMLElement | null>(null)
const selectorPosition = ref<{ top: number; left: number; maxHeight: number } | null>(null)
const selectorActiveIndex = ref(0)

interface LiveQuote {
  sourceCurrency: CurrencyCode
  targetCurrency: CurrencyCode
  sourceAmount: number
  rate: number
  fee: number
  targetAmount: number
  dynamic: boolean
  arrival: string | null
  createdTime: string | null
  expiresAt: string | null
  savingsLabel: string | null
  feeDetails: LiveFeeDetail[]
  feeProviders: LiveTableProvider[]
  rateProviders: LiveTableProvider[]
  homepageProviders: LiveHomepageProvider[]
}

type QuoteRequest = Pick<LiveQuote, 'sourceCurrency' | 'targetCurrency' | 'sourceAmount'>

type SelectorOption =
  | { kind: 'destination'; value: Country }
  | { kind: 'currency'; value: Currency }

const liveQuote = ref<LiveQuote | null>(null)
const comparisonLiveQuote = ref<LiveQuote | null>(null)
let quoteTimer: ReturnType<typeof setTimeout> | undefined
let comparisonQuoteTimer: ReturnType<typeof setTimeout> | undefined
let dynamicQuoteTimer: ReturnType<typeof setInterval> | undefined
let quoteController: AbortController | undefined
let comparisonQuoteController: AbortController | undefined
let rateHistoryController: AbortController | undefined
let lastScrollY = 0

const source = computed(() => sourceCurrencies.find((currency) => currency.code === sendCurrency.value) ?? sourceCurrencies[0])
const target = computed(() => targetCurrencies.find((currency) => currency.code === receiveCurrency.value) ?? targetCurrencies[0])
const comparisonSource = computed(() => sourceCurrencies.find((currency) => currency.code === comparisonSendCurrency.value) ?? sourceCurrencies[0])
const comparisonTarget = computed(() => targetCurrencies.find((currency) => currency.code === comparisonReceiveCurrency.value) ?? targetCurrencies[0])
const availableTargetCurrencies = computed(() => {
  const coverage = wiseTargetCurrenciesBySource[sendCurrency.value]
  if (!coverage) return targetCurrencies
  const codes = new Set(coverage.codes)
  const popular = new Set(coverage.popular)
  return targetCurrencies
    .filter((currency) => codes.has(currency.code) && (coverage.codes.length === 1 || currency.code !== sendCurrency.value))
    .map((currency) => ({ ...currency, popular: popular.has(currency.code) }))
})
const destinationSupported = computed(() => availableTargetCurrencies.value.some((currency) => currency.code === destination.value.currency))
const availableComparisonTargetCurrencies = computed(() => {
  const route = wiseTargetCurrenciesBySource[comparisonSendCurrency.value]
  if (!route) return targetCurrencies
  const codes = new Set(route.codes)
  const popular = new Set(route.popular)
  return targetCurrencies
    .filter((currency) => codes.has(currency.code) && (route.codes.length === 1 || currency.code !== comparisonSendCurrency.value))
    .map((currency) => ({ ...currency, popular: popular.has(currency.code) }))
})
const fallbackQuote = computed(() => sendCurrency.value === 'HKD' ? wiseQuoteProfiles[receiveCurrency.value] : undefined)
const matchingLiveQuote = computed(() => {
  const quote = liveQuote.value
  if (!quote || quote.sourceCurrency !== sendCurrency.value || quote.targetCurrency !== receiveCurrency.value) return null
  return Math.abs(quote.sourceAmount - sendAmount.value) < 0.005 ? quote : null
})
const matchingLiveComparisonQuote = computed(() => {
  const quote = comparisonLiveQuote.value
  if (!quote || quote.sourceCurrency !== comparisonSendCurrency.value || quote.targetCurrency !== comparisonReceiveCurrency.value) return null
  return Math.abs(quote.sourceAmount - comparisonSendAmount.value) < 0.005 ? quote : null
})
const exchangeRate = computed(() => matchingLiveQuote.value?.rate ?? fallbackQuote.value?.rate ?? source.value.toHkd / target.value.toHkd)
const usesDynamicCharge = computed(() => matchingLiveQuote.value?.dynamic ?? fallbackQuote.value?.dynamic ?? false)
const feeRate = computed(() => usesDynamicCharge.value ? 0.040336 : 0.004281)
const feeAmount = computed(() => {
  if (matchingLiveQuote.value) return matchingLiveQuote.value.fee
  if (fallbackQuote.value) {
    if (sendAmount.value <= 0) return 0
    const fixedFee = Math.min(11.95, fallbackQuote.value.fee)
    return fixedFee + (fallbackQuote.value.fee - fixedFee) * sendAmount.value / 10000
  }
  return 11.95 / source.value.toHkd + sendAmount.value * feeRate.value
})
const serviceFeeAmount = computed(() => usesDynamicCharge.value ? sendAmount.value * 0.018815 : feeAmount.value)
const dynamicFeeAmount = computed(() => Math.max(0, feeAmount.value - serviceFeeAmount.value))
const receiveAmount = computed(() => matchingLiveQuote.value?.targetAmount ?? Math.max(0, (sendAmount.value - feeAmount.value) * exchangeRate.value))
const savingsAmount = computed(() => Math.max(0, sendAmount.value * 0.044135 - feeAmount.value))
const savingsLabel = computed(() => matchingLiveQuote.value?.savingsLabel ?? `您最多可以节省 ${formatMoney(savingsAmount.value)} ${sendCurrency.value}`)
const feeDetailRows = computed<LiveFeeDetail[]>(() => {
  if (matchingLiveQuote.value?.feeDetails.length) return matchingLiveQuote.value.feeDetails
  return [
    { label: '银行转账手续费', value: `0 ${sendCurrency.value}` },
    { label: '我们的费用', value: `${formatMoney(serviceFeeAmount.value)} ${sendCurrency.value}` },
    ...(usesDynamicCharge.value ? [{ label: '动态收费', value: `${formatMoney(dynamicFeeAmount.value)} ${sendCurrency.value}` }] : []),
  ]
})
const sendAmountParts = computed(() => formatMoney(sendAmount.value).split('.'))
const sendAmountInputValue = computed(() => sendAmountEditing.value ? sendAmountDraft.value : sendAmountParts.value[0])
const arrivalDay = computed(() => {
  const quotedArrival = matchingLiveQuote.value?.arrival ?? fallbackQuote.value?.arrival
  if (quotedArrival) return quotedArrival.replace(/^在/, '').replace('或之前', '之前')
  if (usesDynamicCharge.value) {
    const arrival = new Date()
    arrival.setDate(arrival.getDate() + 7)
    const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(arrival)
    return `${arrival.getMonth() + 1}月${arrival.getDate()}日${weekday}之前`
  }

  return sendAmount.value * source.value.toHkd > 10000 ? '星期三之前' : '星期二之前'
})
const reviewWindow = computed(() => [0, 1, 2, 3].map((offset) => reviews[(reviewIndex.value + offset) % reviews.length]))
const selectorStyle = computed(() => selectorPosition.value
  ? {
      '--selector-top': `${selectorPosition.value.top}px`,
      '--selector-left': `${selectorPosition.value.left}px`,
      '--selector-max-height': `${selectorPosition.value.maxHeight}px`,
    }
  : undefined)

const selectorCurrencies = computed(() => {
  if (selector.value === 'source') return sourceCurrencies
  return selectorContext.value === 'comparison' ? availableComparisonTargetCurrencies.value : availableTargetCurrencies.value
})
const selectedSelectorCurrency = computed(() => selector.value === 'source'
  ? (selectorContext.value === 'comparison' ? comparisonSendCurrency.value : sendCurrency.value)
  : (selectorContext.value === 'comparison' ? comparisonReceiveCurrency.value : receiveCurrency.value))

const filteredCurrencies = computed(() => {
  const query = selectorQuery.value.trim().toLowerCase()
  if (!query) return selectorCurrencies.value
  return selectorCurrencies.value.filter((currency) => `${currency.code}${currency.name}`.toLowerCase().includes(query))
})

const popularCurrencies = computed(() => {
  const order = selector.value === 'source' ? ['EUR', 'HKD', 'USD'] : ['EUR', 'USD', 'GBP']
  return filteredCurrencies.value
    .filter((currency) => currency.popular)
    .sort((left, right) => order.indexOf(left.code) - order.indexOf(right.code))
})
const allCurrencies = computed(() => {
  const popular = new Set(popularCurrencies.value.map((currency) => currency.code))
  return filteredCurrencies.value.filter((currency) => !popular.has(currency.code))
})

const filteredDestinations = computed(() => {
  const query = selectorQuery.value.trim().toLowerCase()
  if (!query) return destinations
  return destinations.filter((country) => `${country.name}${country.currency}`.toLowerCase().includes(query))
})

const popularDestinationNames = new Set(['泰国', '韩国', '日本', '马来西亚'])
const popularDestinationOrder = ['泰国', '韩国', '日本', '马来西亚']
const popularDestinations = computed(() => filteredDestinations.value
  .filter((country) => popularDestinationNames.has(country.name))
  .sort((left, right) => popularDestinationOrder.indexOf(left.name) - popularDestinationOrder.indexOf(right.name)))
const selectorOptions = computed<SelectorOption[]>(() => selector.value === 'destination'
  ? [...popularDestinations.value, ...filteredDestinations.value].map((value) => ({ kind: 'destination', value }))
  : [...popularCurrencies.value, ...allCurrencies.value].map((value) => ({ kind: 'currency', value })))
const activeSelectorOptionId = computed(() => selectorOptions.value.length ? `selector-option-${selectorActiveIndex.value}` : undefined)

const providerBenchmarks = [
  { name: 'Hang Seng', logo: 'hang-seng-bank', amountFactor: 0.9901371237720407, feeFactor: 0.009865, transferFeeFactor: 0.0065 },
  { name: 'HSBC HK', logo: 'hsbc', amountFactor: 0.9889454248955304, feeFactor: 0.011056, transferFeeFactor: 0.007 },
  { name: 'Bank of East Asia', logo: 'bank-of-east-asia', amountFactor: 0.9748488816062847, feeFactor: 0.025151, transferFeeFactor: 0 },
  { name: 'PayPal', logo: 'paypal', amountFactor: 0.9558682869462956, feeFactor: 0.044135, transferFeeFactor: 0.003899 },
] as const

const comparisonExchangeRate = computed(() => {
  if (matchingLiveComparisonQuote.value) return matchingLiveComparisonQuote.value.rate
  if (comparisonSendCurrency.value === sendCurrency.value && comparisonReceiveCurrency.value === receiveCurrency.value) return exchangeRate.value
  if (comparisonSendCurrency.value === 'HKD') return wiseQuoteProfiles[comparisonReceiveCurrency.value]?.rate ?? comparisonSource.value.toHkd / comparisonTarget.value.toHkd
  return comparisonSource.value.toHkd / comparisonTarget.value.toHkd
})
const comparisonWiseFee = computed(() => {
  if (matchingLiveComparisonQuote.value) return matchingLiveComparisonQuote.value.fee
  if (comparisonSendCurrency.value === sendCurrency.value
    && comparisonReceiveCurrency.value === receiveCurrency.value
    && Math.abs(comparisonSendAmount.value - sendAmount.value) < 0.005) return feeAmount.value
  const profile = comparisonSendCurrency.value === 'HKD' ? wiseQuoteProfiles[comparisonReceiveCurrency.value] : undefined
  if (profile) {
    if (comparisonSendAmount.value <= 0) return 0
    const fixedFee = Math.min(11.95, profile.fee)
    return fixedFee + (profile.fee - fixedFee) * comparisonSendAmount.value / 10000
  }
  return 11.95 / comparisonSource.value.toHkd + comparisonSendAmount.value * 0.004281
})
const comparisonWiseAmount = computed(() => Math.max(0, (comparisonSendAmount.value - comparisonWiseFee.value) * comparisonExchangeRate.value))
const comparisonSavingsAmount = computed(() => {
  const providers = matchingLiveComparisonQuote.value?.homepageProviders ?? []
  const wise = providers.find((provider) => provider.wise)
  if (wise && providers.length > 1) {
    const highestProviderFee = Math.max(...providers
      .filter((provider) => !provider.wise)
      .map((provider) => comparisonSendAmount.value - provider.amount / Math.max(Number.EPSILON, comparisonExchangeRate.value)))
    return Math.max(0, highestProviderFee - wise.transferFee)
  }
  return Math.max(0, comparisonSendAmount.value * 0.044135 - comparisonWiseFee.value)
})

const providerRows = computed<HomepageProviderRow[]>(() => {
  const widths = [1, 0.91, 0.77, 0.62]
  const liveProviders = matchingLiveComparisonQuote.value?.homepageProviders ?? []
  if (liveProviders.length) {
    return [...liveProviders]
      .sort((left, right) => right.amount - left.amount)
      .map((provider, index) => {
        const fee = provider.wise
          ? provider.transferFee
          : Math.max(0, comparisonSendAmount.value - provider.amount / Math.max(Number.EPSILON, comparisonExchangeRate.value))
        const markupAmount = Math.max(0, fee - provider.transferFee)
        return {
          ...provider,
          fee,
          markupAmount,
          factor: widths[index] ?? Math.max(0.35, 0.7 - index * 0.08),
        }
      })
  }

  const gross = comparisonSendAmount.value * comparisonExchangeRate.value
  const providers: LiveHomepageProvider[] = [
    {
      name: 'Wise',
      logo: 'wise',
      amount: comparisonWiseAmount.value,
      transferFee: comparisonWiseFee.value,
      rate: comparisonExchangeRate.value,
      markupPercent: 0,
      wise: true,
    },
    ...providerBenchmarks.filter((provider) => provider.name !== 'Bank of East Asia').map((provider) => ({
      name: provider.name,
      logo: provider.logo,
      amount: gross * provider.amountFactor,
      transferFee: comparisonSendAmount.value * provider.transferFeeFactor,
      rate: comparisonExchangeRate.value * (1 - Math.max(0, provider.feeFactor - provider.transferFeeFactor)),
      markupPercent: Math.max(0, provider.feeFactor - provider.transferFeeFactor) * 100,
      wise: false,
    })),
  ]
  return providers
    .sort((left, right) => right.amount - left.amount)
    .map((provider, index) => {
      const markupAmount = comparisonSendAmount.value * provider.markupPercent / 100
      return { ...provider, fee: provider.transferFee + markupAmount, markupAmount, factor: widths[index] }
    })
})

const activeProviderHelp = computed(() => providerRows.value.find((provider) => provider.name === providerHelp.value) ?? null)

const feeComparisonRows = computed(() => {
  if (matchingLiveQuote.value?.feeProviders.length) {
    return matchingLiveQuote.value.feeProviders.map((provider) => ({
      name: provider.name,
      logo: provider.logo,
      amount: provider.value,
    }))
  }
  const gross = sendAmount.value * exchangeRate.value
  return [
    { name: 'Wise', logo: 'wise', amount: receiveAmount.value },
    ...providerBenchmarks.map((provider) => ({ name: provider.name, logo: provider.logo, amount: gross * provider.amountFactor })),
  ].sort((left, right) => right.amount - left.amount)
})

const rateProviderRows = computed(() => {
  if (matchingLiveQuote.value?.rateProviders.length) {
    return matchingLiveQuote.value.rateProviders.map((provider) => ({
      name: provider.name,
      logo: provider.logo,
      rate: provider.value,
      note: provider.note,
    }))
  }
  if (usesDynamicCharge.value) return []
  const referenceRates = sendCurrency.value === 'HKD' && receiveCurrency.value === 'USD'
    ? [0.1273, 0.1271, 0.1270, 0.1224]
    : [0.1273, 0.1271, 0.1270, 0.1224].map((rate) => exchangeRate.value * rate / 0.12755)
  return [
    { name: 'Wise', logo: 'wise', rate: exchangeRate.value, note: '中间市场汇率' },
    { name: 'Bank of East Asia', logo: 'bank-of-east-asia', rate: referenceRates[0] },
    { name: 'Hang Seng', logo: 'hang-seng-bank', rate: referenceRates[1] },
    { name: 'HSBC HK', logo: 'hsbc', rate: referenceRates[2] },
    { name: 'PayPal', logo: 'paypal', rate: referenceRates[3] },
  ]
})

const rateHistoryKey = computed(() => `${sendCurrency.value}:${receiveCurrency.value}:${ratePeriod.value}`)
const fallbackRateValues = computed(() => {
  const count = ratePeriod.value === 'week' ? 96 : ratePeriod.value === 'month' ? 220 : 184
  const amplitude = ratePeriod.value === 'week' ? 0.0014 : ratePeriod.value === 'month' ? 0.0022 : 0.006
  return Array.from({ length: count }, (_, index) => {
    const progress = index / Math.max(1, count - 1)
    const wave = Math.sin(progress * 15.7) * 0.28 + Math.sin(progress * 43.4) * 0.12 + Math.cos(progress * 91.1) * 0.05
    return exchangeRate.value * (1 + amplitude * (wave + progress * 0.34 - 0.14))
  })
})
const rateChartValues = computed(() => rateHistory.value?.key === rateHistoryKey.value
  ? rateHistory.value.points.map((point) => point.value)
  : fallbackRateValues.value)
const rateChartDomain = computed(() => {
  const values = rateChartValues.value
  const low = Math.min(...values)
  const high = Math.max(...values)
  const intervalCount = 5
  const rawStep = Math.max((high - low) / intervalCount, Math.abs(exchangeRate.value) * 0.0001, Number.EPSILON)
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  const multiplier = [1, 2, 2.5, 5, 10].find((value) => value >= normalized) ?? 10
  const step = multiplier * magnitude
  let min = Math.floor(low / step) * step
  let max = min + step * intervalCount
  if (max < high) {
    max = Math.ceil(high / step) * step
    min = max - step * intervalCount
  }
  return { min, max, step }
})
const rateChartCoordinates = computed(() => rateChartValues.value.map((value, index, values) => ({
  x: values.length === 1 ? 0 : index * 418 / (values.length - 1),
  y: Math.min(250, Math.max(0, (rateChartDomain.value.max - value) * 250 / Math.max(Number.EPSILON, rateChartDomain.value.max - rateChartDomain.value.min))),
})))
const rateChartPoints = computed(() => rateChartCoordinates.value.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' '))
const rateChartAxis = computed(() => Array.from({ length: 6 }, (_, index) => rateChartDomain.value.max - rateChartDomain.value.step * index))

const rateDateRange = computed(() => {
  if (rateHistory.value?.key === rateHistoryKey.value && rateHistory.value.points.length > 1) {
    const format = (time: number) => {
      const date = new Date(time)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
    return [format(rateHistory.value.points[0].time), format(rateHistory.value.points.at(-1)!.time)]
  }
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - (ratePeriod.value === 'week' ? 7 : ratePeriod.value === 'month' ? 30 : 183))
  const format = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`
  return [format(start), format(end)]
})

const rateLockHours = computed(() => {
  const quote = matchingLiveQuote.value
  if (!quote?.createdTime || !quote.expiresAt) return 19
  const duration = new Date(quote.expiresAt).getTime() - new Date(quote.createdTime).getTime()
  return Number.isFinite(duration) && duration > 0 ? Math.ceil(duration / 3_600_000) : 19
})

const guaranteeDeadline = computed(() => {
  const deadline = matchingLiveQuote.value?.expiresAt
    ? new Date(matchingLiveQuote.value.expiresAt)
    : new Date(Date.now() + rateLockHours.value * 3_600_000)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${deadline.getUTCMonth() + 1}月${deadline.getUTCDate()}日星期${weekdays[deadline.getUTCDay()]} ${String(deadline.getUTCHours()).padStart(2, '0')}:${String(deadline.getUTCMinutes()).padStart(2, '0')}`
})

const compareHref = computed(() => {
  const params = new URLSearchParams({
    sendAmount: String(comparisonSendAmount.value),
    sourceCurrency: comparisonSendCurrency.value,
    targetCurrency: comparisonReceiveCurrency.value,
  })
  return `https://wise.com/hk/compare?${params}`
})

const transferHref = computed(() => {
  const params = new URLSearchParams({
    intent: 'SEND',
    amount: String(sendAmount.value),
    sourceCurrency: sendCurrency.value,
    targetCurrency: receiveCurrency.value,
  })
  return `https://wise.com/register?redirectUrl=${encodeURIComponent(`/onboarding?${params}`)}`
})

const languageOptions: LocaleOption[] = [
  { value: 'cs', label: 'Čeština' },
  { value: 'de', label: 'Deutsch' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'hu', label: 'Magyar' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'it', label: 'Italiano' },
  { value: 'ja', label: '日本語' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pl', label: 'Polski' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'ro', label: 'Română' },
  { value: 'ru', label: 'Русский' },
  { value: 'th', label: 'ภาษาไทย' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'uk', label: 'Українська' },
  { value: 'zh-CN', label: '中文（简体)' },
  { value: 'zh-TW', label: '中文（繁體）' },
]
const regionOptions: LocaleOption[] = destinations.map((country) => ({ value: country.flag.toUpperCase(), label: country.name }))
const selectedLanguageOption = computed(() => languageOptions.find((option) => option.value === regionLanguage.value) ?? languageOptions[0])
const selectedRegionOption = computed(() => regionOptions.find((option) => option.value === regionCountry.value) ?? regionOptions[0])
const filteredRegionOptions = computed(() => {
  const query = localeQuery.value.trim().toLocaleLowerCase()
  if (!query) return regionOptions
  return regionOptions.filter((option) => `${option.label}${option.value}`.toLocaleLowerCase().includes(query))
})
const localeListOptions = computed(() => localePopover.value === 'language' ? languageOptions : filteredRegionOptions.value)
const localeListboxId = computed(() => localePopover.value ? `locale-${localePopover.value}-listbox` : undefined)
const localeActiveOptionId = computed(() => localePopover.value && localeListOptions.value.length && localeActiveIndex.value >= 0
  ? `locale-${localePopover.value}-option-${localeActiveIndex.value}`
  : undefined)

const localeHref = computed(() => {
  const localeUrls: Record<string, string> = {
    'HK:zh-CN': 'https://wise.com/zh-hk/',
    'HK:en-GB': 'https://wise.com/hk/',
    'CN:zh-CN': 'https://wise.com/zh-cn/',
    'CN:en-GB': 'https://wise.com/cn/',
    'GB:en-GB': 'https://wise.com/gb/',
  }
  return localeUrls[`${regionCountry.value}:${regionLanguage.value}`]
    ?? `https://wise.com/${regionCountry.value.toLowerCase()}/?lang=${encodeURIComponent(regionLanguage.value)}`
})

function flagUrl(flag: string) {
  return `https://wise.com/web-art/assets/flags/${flag}.svg`
}

function logoUrl(logo: string) {
  if (/^https?:\/\//.test(logo)) return logo
  return `https://dq8dwmysp7hk1.cloudfront.net/logos/${logo}-mark.svg`
}

function comparisonLogoUrl(logo: string) {
  if (/^https?:\/\//.test(logo)) return logo
  if (logo === 'wise') return 'https://wise.com/public-resources/assets/logos/wise-personal/logo_white.svg'
  return `https://dq8dwmysp7hk1.cloudfront.net/logos/${logo}--white.svg`
}

function handleProviderLogoError(event: Event) {
  const image = event.target as HTMLImageElement
  image.onerror = null
  image.src = flagUrl('usd')
}

function productHref(section: keyof typeof navData, label?: string): string {
  if (!label) {
    if (section === 'business') return 'https://wise.com/hk/business/'
    if (section === 'platform') return 'https://wise.com/platform/'
    return 'https://wise.com/'
  }

  const personal: Record<string, string> = {
    汇款: 'https://wise.com/hk/send-money/',
    发送大额汇款: 'https://wise.com/hk/large-amounts/',
    个人定价: 'https://wise.com/hk/pricing/',
  }
  const business: Record<string, string> = {
    汇款: 'https://wise.com/hk/business/send-payments',
    收款: 'https://wise.com/hk/business/receive-money',
    管理团队财务: 'https://wise.com/hk/business/manage-team',
    关联会计软件: 'https://wise.com/hk/business/accounting-software',
    '探索 API 集成': 'https://wise.com/hk/business/api',
    探索演示: 'https://wise.com/business-demo',
    联系销售: 'https://wise.com/gb/business/contact?click_cta_id=gb_bhomepage_top',
    企业定价: 'https://wise.com/hk/pricing/business',
  }
  const platform: Record<string, string> = {
    汇款: 'https://wise.com/platform/send/',
    收款: 'https://wise.com/platform/receive/',
    发行卡片: 'https://wise.com/platform/cards/',
    多币种账户: 'https://wise.com/platform/multi-currency-accounts/',
    银行和金融机构: 'https://wise.com/platform/financial-institutions/',
    教育平台: 'https://wise.com/platform/education/',
    市场: 'https://wise.com/platform/marketplaces/',
    消费管理: 'https://wise.com/platform/spend-management/',
    旅游平台: 'https://wise.com/platform/travel/',
    人力平台: 'https://wise.com/platform/workforce-platforms/',
    '浏览 API 文档': 'https://docs.wise.com/api-docs',
    '注册 Wise Connect': 'https://www.wiseconnect.io',
  }
  return { personal, business, platform }[section][label] ?? productHref(section)
}

function productLinkAttrs(section: keyof typeof navData, label?: string) {
  const hostname = new URL(productHref(section, label)).hostname
  return hostname === 'wise.com' || hostname === 'www.wise.com'
    ? {}
    : { target: '_blank', rel: 'noopener noreferrer' }
}

function mobileProductIcon(section: keyof typeof navData, label: string) {
  const icons = {
    'personal:汇款': WISE_ICON_PATHS.arrowUp,
    'personal:发送大额汇款': WISE_ICON_PATHS.diagonalTransfer,
    'business:汇款': WISE_ICON_PATHS.arrowUp,
    'business:收款': WISE_ICON_PATHS.arrowDown,
    'business:管理团队财务': WISE_ICON_PATHS.people,
    'business:关联会计软件': WISE_ICON_PATHS.grid,
    'platform:汇款': WISE_ICON_PATHS.arrowUp,
    'platform:收款': WISE_ICON_PATHS.arrowDown,
    'platform:发行卡片': WISE_ICON_PATHS.card,
    'platform:多币种账户': WISE_ICON_PATHS.bank,
  }
  return icons[`${section}:${label}` as keyof typeof icons] ?? null
}

function footerHref(label: string) {
  const paths: Record<string, string> = {
    'Wise 个人': '/', 'Wise 企业账户': '/hk/business/', 'Wise Platform': '/platform/',
    跨境汇款: '/hk/send-money/', 大额汇款: '/hk/large-amounts/', 汇率计算工具: '/hk/currency-converter/',
    国际股票代码: '/hk/stock/', 'SWIFT/BIC 代码': '/hk/swift-codes/', 'IBAN 代码': '/hk/iban/',
    汇率提醒: '/tools/exchange-rate-alerts/', 比较汇率: '/hk/compare/', 功能可用性: '/hk/availability/',
    公司与团队: '/hk/about/our-story', 最新消息与博客: '/hk/blog/', 安全性: '/hk/safety-and-security/',
    媒体报道: '/hk/press', 工作机会: 'https://www.wise.jobs/', 投资者关系: '/owners/',
    我们的使命: '/our-mission', 联盟机构与合作伙伴: '/gb/partnerwise', 评价: '/gb/about/wise-reviews',
    帮助中心: '/help', 服务状态: 'https://status.wise.com/',
  }
  const path = paths[label] ?? '/'
  return path.startsWith('http') ? path : `https://wise.com${path}`
}

function coverageHref(slug: string) {
  return `https://wise.com/hk/send-money/send-money-to-${slug}`
}

function rememberFocus() {
  if (document.activeElement instanceof HTMLElement) returnFocusEl.value = document.activeElement
}

function restoreFocus() {
  nextTick(() => returnFocusEl.value?.focus())
}

function focusFirst(container: HTMLElement | null) {
  const preferred = container?.querySelector<HTMLElement>('[data-autofocus]')
  const fallback = container?.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ;(preferred ?? fallback)?.focus()
}

function isFocusableElementVisible(element: HTMLElement, container: HTMLElement) {
  let current: HTMLElement | null = element
  while (current && current !== container.parentElement) {
    const style = window.getComputedStyle(current)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    current = current.parentElement
  }
  return true
}

function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab' || !container) return
  const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true' && isFocusableElementVisible(element, container))
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!(document.activeElement instanceof Node) || document.activeElement === container || !container.contains(document.activeElement)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function formatMoney(value: number, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatRate(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value)
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function parseFormattedNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0
  const parsed = Number(value.replaceAll(',', '').match(/-?\d+(?:\.\d+)?/)?.[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function updateSend(event: Event) {
  sendAmountDraft.value = (event.target as HTMLInputElement).value
  sendAmount.value = parseAmount(sendAmountDraft.value)
}

function beginSendAmountEdit() {
  sendAmountDraft.value = formatMoney(sendAmount.value)
  sendAmountEditing.value = true
}

function finishSendAmountEdit() {
  sendAmountEditing.value = false
  sendAmountDraft.value = ''
}

function updateComparisonSend(event: Event) {
  comparisonSendAmount.value = parseAmount((event.target as HTMLInputElement).value)
}

function updateReceive(event: Event) {
  const desired = parseAmount((event.target as HTMLInputElement).value)
  const fixedFee = sendCurrency.value === 'HKD' ? 11.95 : 11.95 / source.value.toHkd
  const variableFeeRate = matchingLiveQuote.value && sendAmount.value > 0
    ? Math.max(0, matchingLiveQuote.value.fee - fixedFee) / sendAmount.value
    : fallbackQuote.value
      ? Math.max(0, fallbackQuote.value.fee - fixedFee) / 10000
      : feeRate.value
  sendAmount.value = Math.max(0, (desired / exchangeRate.value + fixedFee) / Math.max(Number.EPSILON, 1 - variableFeeRate))
}

function selectorOptionId(index: number) {
  return `selector-option-${index}`
}

function setActiveSelectorOption(index: number) {
  const count = selectorOptions.value.length
  if (!count) return
  selectorActiveIndex.value = (index + count) % count
  nextTick(() => {
    const list = selectorEl.value?.querySelector<HTMLElement>('.selector-list')
    const active = selectorEl.value?.querySelector<HTMLElement>(`#${selectorOptionId(selectorActiveIndex.value)}`)
    const current = selectorEl.value?.querySelector<HTMLElement>('.selector-current')
    if (!list || !active) return
    if (selector.value === 'destination' && current && window.innerWidth > 640) {
      list.scrollTop = Math.max(0, active.offsetTop - current.offsetTop)
    } else {
      active.scrollIntoView?.({ block: 'nearest' })
    }
  })
}

function chooseActiveSelectorOption() {
  const option = selectorOptions.value[selectorActiveIndex.value]
  if (!option) return
  if (option.kind === 'destination') chooseDestination(option.value)
  else chooseCurrency(option.value.code)
}

function onSelectorKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    setActiveSelectorOption(selectorActiveIndex.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    setActiveSelectorOption(selectorActiveIndex.value - 1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    setActiveSelectorOption(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    setActiveSelectorOption(selectorOptions.value.length - 1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    chooseActiveSelectorOption()
  }
}

function normaliseArrival(value: string | null) {
  return value
    ?.replace(/^在/, '')
    .replace('或之前', '之前')
    .replaceAll('數', '数')
    .replaceAll('分鐘', '分钟')
    .replaceAll('小時', '小时') ?? null
}

async function requestLiveQuote(requested: QuoteRequest, controller: AbortController): Promise<LiveQuote | null> {
  try {
    const url = new URL('/wise-reference/', window.location.origin)
    url.searchParams.set('sourceCurrency', requested.sourceCurrency)
    url.searchParams.set('targetCurrency', requested.targetCurrency)
    url.searchParams.set('sourceAmount', String(requested.sourceAmount))
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return null
    const document = new DOMParser().parseFromString(await response.text(), 'text/html')
    const raw = document.querySelector('script#__NEXT_DATA__')?.textContent
    if (!raw) return null
    const pageData = JSON.parse(raw).props?.pageProps?.data
    const quote = pageData?.initialQuote
    const viewModel = pageData?.calculator?.viewModel
    const option = quote?.paymentOptions?.find((item: { payIn: string }) => item.payIn === 'BANK_TRANSFER')
      ?? quote?.paymentOptions?.[0]
    if (!quote || !option) return null

    const feeContent = (viewModel?.fees?.details?.feeBreakdown?.summary?.content ?? []) as Array<{
      label?: { text?: string }
      value?: { text?: string }
    }>
    const feeDetails = feeContent
      .map((item) => ({ label: item.label?.text ?? '', value: item.value?.text ?? '' }))
      .filter((item) => item.label && item.value)

    const rawFeeProviders = (viewModel?.fees?.details?.comparison?.table?.providers ?? []) as Array<{
      media?: { label?: string; value?: string }
      comparisonValue?: { label?: { text?: string; subText?: string } }
    }>
    const feeProviders = rawFeeProviders
      .map((provider) => ({
        name: provider.media?.label ?? '',
        logo: provider.media?.value ?? '',
        value: parseFormattedNumber(provider.comparisonValue?.label?.text),
        subValue: Math.abs(parseFormattedNumber(provider.comparisonValue?.label?.subText)),
      }))
      .filter((provider) => provider.name && provider.value > 0)

    const rawRateProviders = (viewModel?.rate?.details?.comparison?.table?.providers ?? []) as Array<{
      media?: { label?: string; value?: string }
      comparisonValue?: { label?: { text?: string; subText?: string } }
    }>
    const rateProviders = rawRateProviders
      .map((provider) => ({
        name: provider.media?.label ?? '',
        logo: provider.media?.value ?? '',
        value: parseFormattedNumber(provider.comparisonValue?.label?.text),
        note: provider.comparisonValue?.label?.subText,
      }))
      .filter((provider) => provider.name && provider.value > 0)

    const rawHomepageProviders = (pageData?.moneyTransferComparison?.providers ?? []) as Array<{
      alias?: string
      name?: string
      logos?: {
        circle?: { svgUrl?: string | null }
        normal?: { svgUrl?: string | null }
        white?: { svgUrl?: string | null }
      }
      quotes?: Array<{ fee?: number; markup?: number; rate?: number; receivedAmount?: number }>
    }>
    const homepageProviders = rawHomepageProviders
      .map((provider) => {
        const providerQuote = provider.quotes?.[0]
        return {
          name: provider.name ?? '',
          logo: provider.logos?.circle?.svgUrl ?? provider.logos?.normal?.svgUrl ?? provider.logos?.white?.svgUrl ?? '',
          amount: providerQuote?.receivedAmount ?? 0,
          transferFee: providerQuote?.fee ?? 0,
          rate: providerQuote?.rate ?? 0,
          markupPercent: providerQuote?.markup ?? 0,
          wise: provider.alias?.toLowerCase() === 'wise' || provider.name?.toLowerCase() === 'wise',
        }
      })
      .filter((provider) => provider.name && provider.amount > 0)

    return {
      ...requested,
      rate: quote.rate,
      fee: option.fee.total,
      targetAmount: option.targetAmount,
      dynamic: Boolean(option.disabledReason),
      arrival: normaliseArrival(option.formattedEstimatedDelivery),
      createdTime: typeof quote.createdTime === 'string' ? quote.createdTime : null,
      expiresAt: typeof viewModel?.metadata?.quote?.rate?.expiresAt === 'string' ? viewModel.metadata.quote.rate.expiresAt : null,
      savingsLabel: typeof viewModel?.additionalInfo?.[0]?.label === 'string' ? viewModel.additionalInfo[0].label : null,
      feeDetails,
      feeProviders,
      rateProviders,
      homepageProviders,
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) return null
  }
  return null
}

async function refreshLiveQuote() {
  quoteController?.abort()
  const controller = new AbortController()
  quoteController = controller
  const requested: QuoteRequest = {
    sourceCurrency: sendCurrency.value,
    targetCurrency: receiveCurrency.value,
    sourceAmount: sendAmount.value,
  }
  const result = await requestLiveQuote(requested, controller)
  if (result && quoteController === controller) liveQuote.value = result
}

async function refreshComparisonLiveQuote() {
  comparisonQuoteController?.abort()
  const controller = new AbortController()
  comparisonQuoteController = controller
  const requested: QuoteRequest = {
    sourceCurrency: comparisonSendCurrency.value,
    targetCurrency: comparisonReceiveCurrency.value,
    sourceAmount: comparisonSendAmount.value,
  }
  const result = await requestLiveQuote(requested, controller)
  if (result && comparisonQuoteController === controller) comparisonLiveQuote.value = result
}

function scheduleLiveQuote() {
  if (quoteTimer) clearTimeout(quoteTimer)
  quoteTimer = setTimeout(refreshLiveQuote, 350)
}

function scheduleComparisonLiveQuote() {
  if (comparisonQuoteTimer) clearTimeout(comparisonQuoteTimer)
  comparisonQuoteTimer = setTimeout(refreshComparisonLiveQuote, 350)
}

function syncDynamicQuoteRefresh() {
  if (dynamicQuoteTimer) clearInterval(dynamicQuoteTimer)
  dynamicQuoteTimer = undefined
  if (usesDynamicCharge.value) dynamicQuoteTimer = setInterval(refreshLiveQuote, 60_000)
}

async function refreshRateHistory() {
  rateHistoryController?.abort()
  const controller = new AbortController()
  rateHistoryController = controller
  const requestedKey = rateHistoryKey.value
  const period = {
    week: { length: '7', resolution: 'hourly', unit: 'day' },
    month: { length: '30', resolution: 'hourly', unit: 'day' },
    halfYear: { length: '6', resolution: 'daily', unit: 'month' },
  }[ratePeriod.value]

  try {
    const url = new URL('/wise-rates', window.location.origin)
    url.searchParams.set('source', sendCurrency.value)
    url.searchParams.set('target', receiveCurrency.value)
    url.searchParams.set('length', period.length)
    url.searchParams.set('resolution', period.resolution)
    url.searchParams.set('unit', period.unit)
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return
    const history = await response.json() as RateHistoryPoint[]
    const valid = history.filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value))
    if (valid.length < 2 || controller !== rateHistoryController || requestedKey !== rateHistoryKey.value) return
    const stride = Math.max(1, Math.floor(valid.length / 280))
    const points = valid.filter((_, index) => index % stride === 0)
    if (points.at(-1) !== valid.at(-1)) points.push(valid.at(-1)!)
    rateHistory.value = { key: requestedKey, points }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) return
  }
}

function formatRateTick(value: number) {
  const decimals = Math.min(6, Math.max(4, -Math.floor(Math.log10(rateChartDomain.value.step))))
  return value.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '')
}

function updateSelectorPosition() {
  const trigger = selectorTriggerEl.value
  const sheet = selectorEl.value
  if (!selector.value || !trigger || !sheet || window.innerWidth <= 640) {
    selectorPosition.value = null
    return
  }

  const viewportMargin = 16
  const triggerGap = 8
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight
  const width = Math.min(384, viewportWidth - viewportMargin * 2)
  const triggerRect = trigger.getBoundingClientRect()
  let anchorTop = triggerRect.top
  let top: number
  let left: number

  if (selector.value === 'destination') {
    const anchor = trigger.querySelector<HTMLElement>(':scope > span:last-child') ?? trigger
    const anchorRect = anchor.getBoundingClientRect()
    anchorTop = anchorRect.top
    top = anchorRect.bottom + triggerGap
    left = anchorRect.left
  } else if (selectorContext.value === 'calculator') {
    const calculatorTop = document.querySelector<HTMLElement>('.calculator-body')?.getBoundingClientRect().top
    top = calculatorTop ?? Math.max(viewportMargin, triggerRect.top - 96)
    left = triggerRect.left
  } else {
    top = triggerRect.bottom + triggerGap
    left = triggerRect.left
  }

  if ((selector.value === 'destination' || selectorContext.value === 'comparison')
    && viewportHeight - viewportMargin - top < 240) {
    const availableAbove = Math.max(0, anchorTop - triggerGap - viewportMargin)
    const flippedHeight = Math.min(520, availableAbove)
    top = Math.max(viewportMargin, anchorTop - triggerGap - flippedHeight)
  }
  top = Math.min(Math.max(viewportMargin, top), Math.max(viewportMargin, viewportHeight - viewportMargin - 96))
  left = Math.min(Math.max(viewportMargin, left), viewportWidth - viewportMargin - width)
  const maxHeight = Math.max(96, Math.min(520, viewportHeight - viewportMargin - top))

  selectorPosition.value = { top, left, maxHeight }
}

function openSelector(type: SelectorType, event?: MouseEvent, context: SelectorContext = 'calculator') {
  rememberFocus()
  selectorTriggerEl.value = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  selectorPosition.value = null
  selectorContext.value = type === 'destination' ? 'calculator' : context
  selector.value = type
  selectorQuery.value = ''
  nextTick(() => {
    const selectedCode = selectedSelectorCurrency.value
    const selectedIndex = selectorOptions.value.findIndex((option) => option.kind === 'destination'
      ? option.value.name === destination.value.name
      : option.value.code === selectedCode)
    setActiveSelectorOption(Math.max(0, selectedIndex))
    updateSelectorPosition()
    focusFirst(selectorEl.value)
  })
}

function closeSelector() {
  selector.value = null
  selectorPosition.value = null
  selectorTriggerEl.value = null
  restoreFocus()
}

function chooseCurrency(code: CurrencyCode) {
  if (selectorContext.value === 'comparison') {
    if (selector.value === 'source') comparisonSendCurrency.value = code
    if (selector.value === 'target') comparisonReceiveCurrency.value = code
  } else {
    if (selector.value === 'source') sendCurrency.value = code
    if (selector.value === 'target') {
      receiveCurrency.value = code
      syncDestinationToCurrency(code)
    }
  }
  closeSelector()
}

function syncDestinationToCurrency(code: CurrencyCode) {
  const preferredFlag = code === 'USD' ? 'us' : code.toLowerCase()
  destination.value = destinations.find((item) => item.flag === preferredFlag)
    ?? destinations.find((item) => item.currency === code)
    ?? destination.value
}

function chooseDestination(country: Country) {
  destination.value = country
  if (availableTargetCurrencies.value.some((currency) => currency.code === country.currency)) receiveCurrency.value = country.currency
  closeSelector()
}

function openMobileMenu() {
  rememberFocus()
  mobilePanel.value = null
  mobileMenuOpen.value = true
  nextTick(() => focusFirst(mobileMenuEl.value))
}

function openMobilePanel(panel: keyof typeof navData) {
  mobilePanel.value = panel
  nextTick(() => mobileMenuEl.value?.querySelector<HTMLElement>('.menu-back')?.focus())
}

function closeMobilePanel() {
  const panel = mobilePanel.value
  mobilePanel.value = null
  nextTick(() => mobileMenuEl.value?.querySelector<HTMLElement>(`[data-mobile-panel="${panel}"]`)?.focus())
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  mobilePanel.value = null
  restoreFocus()
}

function localeOptionId(index: number) {
  return `locale-${localePopover.value}-option-${index}`
}

function scrollActiveLocaleOption() {
  nextTick(() => localePopoverEl.value
    ?.querySelector<HTMLElement>(`#${localeOptionId(localeActiveIndex.value)}`)
    ?.scrollIntoView?.({ block: 'nearest' }))
}

function setActiveLocaleOption(index: number) {
  const count = localeListOptions.value.length
  if (!count) return
  localeActiveIndex.value = (index + count) % count
  scrollActiveLocaleOption()
}

function openLocalePopover(type: LocalePopoverType, event?: Event) {
  localeTriggerEl.value = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  localePopover.value = type
  localeQuery.value = ''
  localeActiveIndex.value = type === 'language'
    ? Math.max(0, languageOptions.findIndex((option) => option.value === regionLanguage.value))
    : -1
  nextTick(() => {
    const focusTarget = type === 'country'
      ? localePopoverEl.value?.querySelector<HTMLInputElement>('.locale-search input')
      : localePopoverEl.value?.querySelector<HTMLElement>('[role="listbox"]')
    focusTarget?.focus()
    if (type === 'language') scrollActiveLocaleOption()
  })
}

function closeLocalePopover(restore = true) {
  const trigger = localeTriggerEl.value
  localePopover.value = null
  localeQuery.value = ''
  localeTriggerEl.value = null
  if (restore) nextTick(() => trigger?.focus())
}

function chooseLocaleOption(option: LocaleOption) {
  if (localePopover.value === 'language') regionLanguage.value = option.value
  else regionCountry.value = option.value
  closeLocalePopover()
}

function chooseActiveLocaleOption() {
  const option = localeListOptions.value[localeActiveIndex.value]
  if (option) chooseLocaleOption(option)
}

function onLocaleKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    setActiveLocaleOption(localeActiveIndex.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    setActiveLocaleOption(localeActiveIndex.value < 0 ? localeListOptions.value.length - 1 : localeActiveIndex.value - 1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    setActiveLocaleOption(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    setActiveLocaleOption(localeListOptions.value.length - 1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    chooseActiveLocaleOption()
  }
}

function openLanguageDrawer() {
  if (!mobileMenuOpen.value) rememberFocus()
  activeMega.value = null
  mobileMenuOpen.value = false
  mobilePanel.value = null
  localePopover.value = null
  localeQuery.value = ''
  languageOpen.value = true
  nextTick(() => focusFirst(languageEl.value))
}

function closeLanguageDrawer() {
  closeLocalePopover(false)
  languageOpen.value = false
  restoreFocus()
}

function openFeeDialog() {
  rememberFocus()
  infoDialog.value = null
  providerHelp.value = null
  feeDialogTab.value = 'details'
  feeDialogOpen.value = true
  nextTick(() => {
    if (window.innerWidth <= 640) feeDialogEl.value?.querySelector<HTMLInputElement>('input:checked')?.focus()
    else focusFirst(feeDialogEl.value)
  })
}

function closeFeeDialog() {
  feeDialogOpen.value = false
  restoreFocus()
}

function openInfoDialog(type: InfoDialogType) {
  rememberFocus()
  feeDialogOpen.value = false
  providerHelp.value = null
  infoDialog.value = type
  if (type === 'rate') void refreshRateHistory()
  nextTick(() => focusFirst(infoDialogEl.value))
}

function closeInfoDialog() {
  infoDialog.value = null
  restoreFocus()
}

function providerHelpLabel(name: string) {
  return name === 'Wise' ? '真实的中间市场汇率' : '汇率加价'
}

function closeProviderHelp(restore = true) {
  const trigger = providerHelpTriggerEl.value
  providerHelp.value = null
  providerHelpTriggerEl.value = null
  if (restore) nextTick(() => trigger?.focus())
}

function toggleProviderHelp(name: string, event?: MouseEvent) {
  if (providerHelp.value === name) {
    closeProviderHelp()
    return
  }
  providerHelpTriggerEl.value = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  providerHelp.value = name
  if (window.innerWidth <= 640) nextTick(() => providerHelpSheetEl.value?.focus())
}

function findProviderHelpTrigger(name: string, mobile: boolean) {
  const selector = mobile ? '.provider-help-mobile' : '.provider-help-desktop .provider-help-button'
  return Array.from(document.querySelectorAll<HTMLButtonElement>(selector))
    .find((button) => button.dataset.providerName === name) ?? null
}

function handleHeaderScroll() {
  const currentScrollY = Math.max(0, window.scrollY)
  const delta = currentScrollY - lastScrollY
  if (Math.abs(delta) > 5) headerHidden.value = currentScrollY > 96 && delta > 0
  lastScrollY = currentScrollY
}

function onFeeTabKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  feeDialogTab.value = feeDialogTab.value === 'details' ? 'compare' : 'details'
  nextTick(() => feeDialogEl.value
    ?.querySelector<HTMLInputElement>(`input[value="${feeDialogTab.value}"]`)
    ?.focus())
}

function onHeaderFocusOut(event: FocusEvent) {
  const header = event.currentTarget as HTMLElement
  if (!(event.relatedTarget instanceof Node) || !header.contains(event.relatedTarget)) activeMega.value = null
}

function handleResize() {
  const wasMobileViewport = isMobileViewport.value
  const nextMobileViewport = window.innerWidth <= 640
  isMobileViewport.value = nextMobileViewport
  footerAccordionEnabled.value = window.innerWidth > 640 && window.innerWidth <= 720

  if (!nextMobileViewport && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
    mobilePanel.value = null
    nextTick(() => {
      const desktopNavTarget = document.querySelector<HTMLElement>('.nav-products > a')
      returnFocusEl.value = desktopNavTarget
      desktopNavTarget?.focus()
    })
  }

  if (wasMobileViewport !== nextMobileViewport && providerHelp.value) {
    const providerName = providerHelp.value
    nextTick(() => {
      const trigger = findProviderHelpTrigger(providerName, nextMobileViewport)
      providerHelpTriggerEl.value = trigger
      if (nextMobileViewport) providerHelpSheetEl.value?.focus()
      else trigger?.focus()
    })
  }

  updateSelectorPosition()
}

function toggleFooter(title: string) {
  footerOpen.value = footerOpen.value.includes(title)
    ? footerOpen.value.filter((item) => item !== title)
    : [...footerOpen.value, title]
}

function closeOverlays() {
  activeMega.value = null
  mobileMenuOpen.value = false
  mobilePanel.value = null
  languageOpen.value = false
  localePopover.value = null
  localeQuery.value = ''
  localeTriggerEl.value = null
  feeDialogOpen.value = false
  infoDialog.value = null
  selector.value = null
  closeProviderHelp(false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (infoDialog.value) closeInfoDialog()
    else if (feeDialogOpen.value) closeFeeDialog()
    else if (selector.value) closeSelector()
    else if (localePopover.value) closeLocalePopover()
    else if (languageOpen.value) closeLanguageDrawer()
    else if (mobileMenuOpen.value) closeMobileMenu()
    else if (providerHelp.value) closeProviderHelp()
    else closeOverlays()
    return
  }
  trapFocus(event, infoDialog.value ? infoDialogEl.value : feeDialogOpen.value ? feeDialogEl.value : selector.value ? selectorEl.value : localePopover.value ? localePopoverEl.value : languageOpen.value ? languageEl.value : mobileMenuOpen.value ? mobileMenuEl.value : providerHelp.value && window.innerWidth <= 640 ? providerHelpSheetEl.value : null)
}

watch(
  () => mobileMenuOpen.value || languageOpen.value || feeDialogOpen.value || Boolean(infoDialog.value) || Boolean(selector.value) || (Boolean(providerHelp.value) && isMobileViewport.value),
  (locked) => {
    const scrollbarWidth = locked ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0
    document.body.style.paddingRight = scrollbarWidth ? `${scrollbarWidth}px` : ''
    document.body.style.overflow = locked ? 'hidden' : ''
  },
)

watch(selectorQuery, () => {
  selectorActiveIndex.value = 0
})

watch(localeQuery, () => {
  localeActiveIndex.value = 0
})

watch(sendCurrency, () => {
  if (availableTargetCurrencies.value.some((currency) => currency.code === receiveCurrency.value)) return
  const replacement = availableTargetCurrencies.value[0]
  if (!replacement) return
  receiveCurrency.value = replacement.code
  syncDestinationToCurrency(replacement.code)
})

watch(comparisonSendCurrency, () => {
  if (availableComparisonTargetCurrencies.value.some((currency) => currency.code === comparisonReceiveCurrency.value)) return
  const replacement = availableComparisonTargetCurrencies.value[0]
  if (replacement) comparisonReceiveCurrency.value = replacement.code
})

watch([sendCurrency, receiveCurrency, sendAmount], scheduleLiveQuote)
watch([comparisonSendCurrency, comparisonReceiveCurrency, comparisonSendAmount], scheduleComparisonLiveQuote)
watch(usesDynamicCharge, syncDynamicQuoteRefresh)
watch([sendCurrency, receiveCurrency, ratePeriod], () => {
  if (infoDialog.value === 'rate') void refreshRateHistory()
})

onMounted(() => {
  isMobileViewport.value = window.innerWidth <= 640
  footerAccordionEnabled.value = window.innerWidth > 640 && window.innerWidth <= 720
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleHeaderScroll, { passive: true })
  lastScrollY = window.scrollY
  scheduleLiveQuote()
  scheduleComparisonLiveQuote()
  syncDynamicQuoteRefresh()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleHeaderScroll)
  if (quoteTimer) clearTimeout(quoteTimer)
  if (comparisonQuoteTimer) clearTimeout(comparisonQuoteTimer)
  if (dynamicQuoteTimer) clearInterval(dynamicQuoteTimer)
  quoteController?.abort()
  comparisonQuoteController?.abort()
  rateHistoryController?.abort()
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
</script>

<template>
  <div class="site-shell" @click="closeProviderHelp(false)">
    <a class="skip-link" href="#main">跳到内容</a>

    <header class="site-header" :class="{ 'is-hidden': headerHidden }" @mouseleave="activeMega = null" @focusout="onHeaderFocusOut">
      <nav class="top-nav container" aria-label="主导航">
        <a class="wise-logo" :href="WISE_HOME_URL" aria-label="Wise 首页" @mouseenter="activeMega = null">
          <svg viewBox="0 0 88 20" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M48.9285.2989h5.413L51.6183 19.7263h-5.4131L48.9285.2989Zm-6.8241 0L38.4514 11.4904 36.8573.2989h-3.7858L28.2893 11.4572 27.6917.2989h-5.2472L24.271 19.7263h4.3504L34.0014 7.4389 35.8943 19.7263h4.284L47.2518.2989h-5.1474ZM87.5508 11.59H74.6988c.0665 2.5239 1.5775 4.1844 3.8025 4.1844 1.6771 0 3.0055-.8967 4.035-2.607l4.3382 1.972C85.3833 18.0775 82.2413 19.992 78.3685 19.992 73.0883 19.992 69.5847 16.4386 69.5847 10.7266 69.5847 4.4501 73.7025 0 79.5142 0c5.1145 0 8.3357 3.4538 8.3357 8.8336 0 .8967-.1 1.7933-.299 2.7564Zm-4.8153-3.7194c0-2.2582-1.262-3.6862-3.2877-3.6862-2.0922 0-3.8191 1.4944-4.2841 3.6862h7.5718ZM5.5255 6.1532 0 12.6107h9.8661l1.1086-3.0449H6.747l2.5832-2.9868.0083-.0792L7.6588 3.6085h7.5569l-5.8579 16.1179h4.0087L20.4402.2989H2.166L5.5255 6.1532Zm57.6165-1.9689c1.9095 0 3.5827 1.0269 5.0439 2.7869l.7677-5.4769C67.592.5729 65.7489 0 63.308 0c-4.8485 0-7.5716 2.8394-7.5716 6.4426 0 2.499 1.3948 4.0266 3.6862 5.0146l1.0959.4981c2.0423.8718 2.5904 1.3036 2.5904 2.2251 0 .9547-.9216 1.5608-2.3247 1.5608-2.3164.0083-4.1927-1.1789-5.6041-3.2047l-.7822 5.5803C56.0053 19.3423 58.0657 19.992 60.7842 19.992c4.6077 0 7.4389-2.6568 7.4389-6.343 0-2.5072-1.1125-4.1179-3.9188-5.3798l-1.1954-.5645c-1.6605-.7389-2.225-1.1457-2.225-1.9593 0-.88.7721-1.5609 2.2582-1.5609Z" />
          </svg>
        </a>

        <div class="desktop-nav nav-products">
          <a
            v-for="(item, key) in navData"
            :key="key"
            class="nav-link"
            :href="productHref(key)"
            :class="{ active: activeMega === key }"
            :aria-expanded="activeMega === key"
            @mouseenter="activeMega = key"
            @focus="activeMega = key"
          >
            {{ key === 'personal' ? '个人账户' : key === 'business' ? '企业账户' : '平台' }}
          </a>
        </div>

        <div class="desktop-nav nav-actions" @mouseenter="activeMega = null">
          <div class="language-picker">
            <button class="language-button" :aria-expanded="languageOpen" aria-haspopup="dialog" @click="openLanguageDrawer">
              <img :src="flagUrl('hk')" alt="" />
              {{ language }}
            </button>
          </div>
          <a class="nav-link" href="https://wise.com/help" target="_blank" rel="noopener noreferrer">帮助</a>
          <a class="nav-link" :href="WISE_LOGIN_URL">登录</a>
          <a class="button button-small button-primary" :href="WISE_REGISTER_URL">注册</a>
        </div>

        <div class="mobile-actions">
          <a class="button button-small button-primary" :href="WISE_REGISTER_URL">注册</a>
          <button class="icon-button" aria-label="打开导航菜单" @click="openMobileMenu">
            <Menu :size="25" />
          </button>
        </div>
      </nav>

      <Transition name="mega">
        <div v-if="activeMega" class="mega-menu desktop-nav" @mouseenter="activeMega = activeMega">
          <div class="mega-inner container" :class="{ 'mega-inner-platform': activeMega === 'platform' }">
            <a class="mega-feature" :href="productHref(activeMega)" @click="activeMega = null">
              <img
                :src="`https://wise.com/public-resources/assets/global-navigation/${navData[activeMega].image}`"
                :alt="navData[activeMega].title"
              />
              <div class="mega-feature-copy">
                <strong>{{ navData[activeMega].title }}</strong>
                <p>{{ navData[activeMega].desc }}</p>
                <span>浏览 <ArrowRight :size="17" /></span>
              </div>
            </a>
            <div v-for="group in navData[activeMega].groups" :key="group.title" class="mega-group">
              <p>{{ group.title }}</p>
              <a v-for="link in group.links" :key="link" :href="productHref(activeMega, link)" v-bind="productLinkAttrs(activeMega, link)" @click="activeMega = null">
                <span v-if="mobileProductIcon(activeMega, link)" class="product-link-icon"><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="mobileProductIcon(activeMega, link)" clip-rule="evenodd" /></svg></span><span>{{ link }}</span>
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <Transition name="fade">
      <div v-if="mobileMenuOpen" ref="mobileMenuEl" class="mobile-menu" role="dialog" aria-modal="true" aria-label="导航菜单">
        <div class="mobile-menu-head">
          <button v-if="mobilePanel" class="menu-back" aria-label="返回" @click="closeMobilePanel"><ArrowLeft :size="18" /><span>{{ mobilePanel === 'personal' ? '个人账户' : mobilePanel === 'business' ? '企业账户' : '平台' }}</span></button>
          <a v-else class="wise-logo" :href="WISE_HOME_URL" aria-label="Wise 首页" @click="closeMobileMenu">
            <svg viewBox="0 0 88 20" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M48.9285.2989h5.413L51.6183 19.7263h-5.4131L48.9285.2989Zm-6.8241 0L38.4514 11.4904 36.8573.2989h-3.7858L28.2893 11.4572 27.6917.2989h-5.2472L24.271 19.7263h4.3504L34.0014 7.4389 35.8943 19.7263h4.284L47.2518.2989h-5.1474ZM87.5508 11.59H74.6988c.0665 2.5239 1.5775 4.1844 3.8025 4.1844 1.6771 0 3.0055-.8967 4.035-2.607l4.3382 1.972C85.3833 18.0775 82.2413 19.992 78.3685 19.992 73.0883 19.992 69.5847 16.4386 69.5847 10.7266 69.5847 4.4501 73.7025 0 79.5142 0c5.1145 0 8.3357 3.4538 8.3357 8.8336 0 .8967-.1 1.7933-.299 2.7564Zm-4.8153-3.7194c0-2.2582-1.262-3.6862-3.2877-3.6862-2.0922 0-3.8191 1.4944-4.2841 3.6862h7.5718ZM5.5255 6.1532 0 12.6107h9.8661l1.1086-3.0449H6.747l2.5832-2.9868.0083-.0792L7.6588 3.6085h7.5569l-5.8579 16.1179h4.0087L20.4402.2989H2.166L5.5255 6.1532Zm57.6165-1.9689c1.9095 0 3.5827 1.0269 5.0439 2.7869l.7677-5.4769C67.592.5729 65.7489 0 63.308 0c-4.8485 0-7.5716 2.8394-7.5716 6.4426 0 2.499 1.3948 4.0266 3.6862 5.0146l1.0959.4981c2.0423.8718 2.5904 1.3036 2.5904 2.2251 0 .9547-.9216 1.5608-2.3247 1.5608-2.3164.0083-4.1927-1.1789-5.6041-3.2047l-.7822 5.5803C56.0053 19.3423 58.0657 19.992 60.7842 19.992c4.6077 0 7.4389-2.6568 7.4389-6.343 0-2.5072-1.1125-4.1179-3.9188-5.3798l-1.1954-.5645c-1.6605-.7389-2.225-1.1457-2.225-1.9593 0-.88.7721-1.5609 2.2582-1.5609Z" />
            </svg>
          </a>
          <button class="icon-button menu-close" data-autofocus aria-label="关闭导航菜单" @click="closeMobileMenu"><X /></button>
        </div>
        <div v-if="!mobilePanel" class="mobile-menu-main">
          <button v-for="(_, key) in navData" :key="key" :data-mobile-panel="key" @click="openMobilePanel(key)">
            <span>{{ key === 'personal' ? '个人账户' : key === 'business' ? '企业账户' : '平台' }}</span>
            <ChevronRight />
          </button>
          <button @click="openLanguageDrawer"><span><img :src="flagUrl('hk')" alt="" />{{ language }}</span></button>
          <a href="https://wise.com/help" target="_blank" rel="noopener noreferrer" @click="closeMobileMenu">帮助</a>
          <a :href="WISE_LOGIN_URL" @click="closeMobileMenu">登录</a>
        </div>
        <div v-else class="mobile-submenu">
          <a class="mobile-feature" :href="productHref(mobilePanel)" @click="closeMobileMenu">
            <img
              :src="`https://wise.com/public-resources/assets/global-navigation/${navData[mobilePanel].image}`"
              :alt="navData[mobilePanel].title"
            />
            <div><strong>{{ navData[mobilePanel].title }}</strong><p>{{ navData[mobilePanel].desc }}</p><span class="mobile-feature-link">浏览 <ArrowRight :size="17" /></span></div>
          </a>
          <div v-for="group in navData[mobilePanel].groups" :key="group.title" class="mobile-link-group">
            <p>{{ group.title }}</p>
            <a v-for="link in group.links" :key="link" :href="productHref(mobilePanel, link)" v-bind="productLinkAttrs(mobilePanel, link)" @click="closeMobileMenu"><span v-if="mobileProductIcon(mobilePanel, link)" class="product-link-icon"><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="mobileProductIcon(mobilePanel, link)" clip-rule="evenodd" /></svg></span><span>{{ link }}</span></a>
          </div>
        </div>
        <div v-if="!mobilePanel" class="mobile-menu-cta"><a class="button button-primary" :href="WISE_REGISTER_URL" @click="closeMobileMenu">注册</a></div>
      </div>
    </Transition>

    <main id="main" tabindex="-1">
      <section class="hero container" :class="{ 'has-dynamic-quote': usesDynamicCharge, 'has-unavailable-destination': !destinationSupported }">
        <div class="hero-copy">
          <div class="rating-stack" aria-label="Wise 应用评分">
            <a v-for="rating in ratingLinks" :key="rating.name" :href="rating.href">
              <img :src="rating.icon" :alt="rating.name" /><span>{{ rating.copy }}</span>
            </a>
          </div>
          <h1>以更便宜的费用汇款到世界各地</h1>
          <p>将资金转移到重要的地方。节省国际汇款费用，支持 50 多种货币，绝无隐性费用。</p>
          <a class="button button-primary hero-button" :href="WISE_OPEN_ACCOUNT_URL">开设账户</a>
        </div>

        <div class="calculator" aria-label="国际汇款计算器">
          <div class="calculator-top">
            <h2>安全汇款至 140 多个国家/地区</h2>
            <label>查看汇款手续费和到账时间：</label>
            <button class="destination-button" role="combobox" aria-haspopup="dialog" :aria-expanded="selector === 'destination'" @click="openSelector('destination', $event)">
              <span><img :src="flagUrl(destination.flag)" alt="" />{{ destination.name }}</span>
              <span>更改</span>
            </button>
          </div>
          <div class="calculator-body">
            <div class="rate-line">
              <button class="info-pill" aria-label="汇率" aria-haspopup="dialog" @click="openInfoDialog('rate')">
                <svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="usesDynamicCharge ? WISE_ICON_PATHS.padlockUnlocked : WISE_ICON_PATHS.padlock" clip-rule="evenodd" /></svg>
                <span>1 {{ sendCurrency }} = {{ formatRate(exchangeRate) }} {{ receiveCurrency }}<small>{{ usesDynamicCharge ? '不保证汇率' : `保证汇率有效时间：${rateLockHours} 小时` }}</small></span>
                <svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.chevronRight" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div class="amount-block">
              <label for="send-amount">您确切汇出</label>
              <div class="amount-row">
                <button class="currency-pill" role="combobox" aria-haspopup="dialog" aria-label="选择汇出货币" :aria-expanded="selector === 'source'" @click="openSelector('source', $event)">
                  <img :src="flagUrl(source.flag)" alt="" />{{ sendCurrency }}<svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.chevronDown" clip-rule="evenodd" /></svg>
                </button>
                <span class="amount-value send-amount-value" :class="{ editing: sendAmountEditing }"><input id="send-amount" :value="sendAmountInputValue" inputmode="decimal" @focus="beginSendAmountEdit" @input="updateSend" @blur="finishSendAmountEdit" /><span v-if="!sendAmountEditing" class="amount-decimals">.{{ sendAmountParts[1] }}</span><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.chevronLeft" clip-rule="evenodd" /></svg></span>
              </div>
              <button class="discount-note" aria-haspopup="dialog" @click="openInfoDialog('discount')">
                <Tag :size="16" aria-hidden="true" /><span>要发送超过 25,000 USD 或等值？</span> 我们将为您减免手续费
              </button>
            </div>

            <div class="amount-block receive-block">
              <label for="receive-amount">收款人收到</label>
              <div class="amount-row">
                <button class="currency-pill" role="combobox" aria-haspopup="dialog" aria-label="选择收款货币" :aria-expanded="selector === 'target'" @click="openSelector('target', $event)">
                  <img :src="flagUrl(target.flag)" alt="" />{{ receiveCurrency }}<svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.chevronDown" clip-rule="evenodd" /></svg>
                </button>
                <span class="amount-value receive-amount-value"><input id="receive-amount" :value="formatMoney(receiveAmount)" inputmode="decimal" @input="updateReceive" /><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.chevronLeft" clip-rule="evenodd" /></svg></span>
              </div>
            </div>

            <div class="summary-row">
              <span class="summary-icon"><svg aria-hidden="true" focusable="false" role="none" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.clock" clip-rule="evenodd" /></svg></span>
              <div><span>到账时间</span><strong>{{ arrivalDay }}</strong></div>
            </div>
            <button class="summary-row fee-row" aria-haspopup="dialog" @click="openFeeDialog">
              <span class="summary-icon"><svg aria-hidden="true" focusable="false" role="none" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.receipt" clip-rule="evenodd" /></svg></span>
              <div><span>总费用</span><strong>已包含在 {{ sendCurrency }} 金额中</strong></div>
              <b>{{ formatMoney(feeAmount) }} {{ sendCurrency }}</b><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.chevronRight" clip-rule="evenodd" /></svg>
            </button>
            <div v-if="usesDynamicCharge" class="quote-alert quote-alert-warning" role="status">
              <span class="quote-alert-icon" role="img" aria-label="警告："><TriangleAlert aria-hidden="true" /></span>
              <p>我们目前无法保证汇率。如果您希望收款人收到确切的金额，请使用您的 Wise 账户支付。</p>
            </div>
            <div v-if="usesDynamicCharge" class="quote-alert quote-alert-info" role="status">
              <span class="quote-alert-icon" role="img" aria-label="信息："><Info aria-hidden="true" /></span>
              <p>在金融市场波动或汇款涉及非主要货币的情况下，我们会使用动态收费。您将清楚地看到何时使用了动态收费。动态收费每 60 秒更新一次，以确保您只支付必要的费用。 <a href="https://wise.com/help/articles/2amMyWoOyhgTL0CkDcY2m4/what-are-dynamic-charges" target="_blank" rel="noreferrer">了解详情 <ExternalLink :size="12" aria-hidden="true" /></a></p>
            </div>
            <p v-else class="saving-line">{{ savingsLabel }}</p>
            <a class="button button-primary transfer-button" :href="transferHref">汇款</a>
          </div>
        </div>
      </section>

      <section class="trust-strip container" aria-label="Wise 服务保障">
        <article><span class="round-icon"><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.people" clip-rule="evenodd" /></svg></span><h3>深受数百万用户的信赖，累计转移资金已达数十亿</h3><p>我们每月在全球转移 1263 亿 HKD</p></article>
        <article><span class="round-icon"><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.bank" clip-rule="evenodd" /></svg></span><h3>监督管理</h3><p>Wise 在中国香港受<a href="https://wise.com/help/articles/2932693/how-is-wise-regulated-in-each-countryregion" target="_blank" rel="noreferrer">香港海关</a>监管</p></article>
        <article><span class="round-icon"><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.headset" clip-rule="evenodd" /></svg></span><h3>专属客服</h3><p>通过电话、电子邮件或聊天获得我们专家提供的帮助</p></article>
      </section>

      <section id="compare" class="comparison-section">
        <div class="container comparison-inner">
          <div class="section-heading centered">
            <h2>不再支付隐性费用</h2>
            <p>有别于一般银行及其他服务供应商，我们绝不会在汇率加价以向您收取更多费用，不妨亲自看看收费详情。</p>
            <div class="heading-actions">
              <a class="button button-dark" :href="WISE_SEND_REGISTER_URL">立即汇款</a>
              <a href="https://wise.com/hk/send-money/">了解如何汇款</a>
            </div>
          </div>

          <div class="provider-comparison">
            <div class="comparison-controls">
              <label>您汇出了<input :value="formatMoney(comparisonSendAmount, 0)" inputmode="decimal" @input="updateComparisonSend" /></label>
              <div class="comparison-currency-control">
                <span>从</span>
                <button type="button" @click="openSelector('source', $event, 'comparison')"><b><img :src="flagUrl(comparisonSource.flag)" alt="" />{{ comparisonSendCurrency }}</b><ChevronDown /></button>
              </div>
              <div class="comparison-currency-control">
                <span>至</span>
                <button type="button" @click="openSelector('target', $event, 'comparison')"><b><img :src="flagUrl(comparisonTarget.flag)" alt="" />{{ comparisonReceiveCurrency }}</b><ChevronDown /></button>
              </div>
            </div>
            <p class="recipient-label">收款人收到</p>
            <div id="provider-list" class="providers">
              <div v-for="provider in providerRows" :key="provider.name" class="provider-row" :class="{ wise: provider.wise }" :style="{ '--bar-width': `${provider.factor * 100}%` }">
                <div class="provider-bar">
                  <img :src="logoUrl(provider.logo)" :alt="provider.name" @error="handleProviderLogoError" />
                  <div class="provider-details">
                    <strong>{{ provider.name }}</strong>
                    <span v-if="provider.wise" class="provider-saving">🎉 <b>节省多达 {{ formatMoney(comparisonSavingsAmount) }} {{ comparisonSendCurrency }}</b></span>
                    <span class="provider-fee-line"><span class="provider-fee-copy">{{ provider.wise ? '总费用' : '总费用为' }} <b v-if="!provider.wise">{{ formatMoney(provider.fee) }} {{ comparisonSendCurrency }}</b></span>
                      <span class="provider-help-wrap provider-help-desktop" @click.stop>
                        <button type="button" class="provider-help-button" :data-provider-name="provider.name" :aria-label="providerHelpLabel(provider.name)" :aria-expanded="providerHelp === provider.name" :aria-controls="`provider-help-${provider.name.replaceAll(' ', '-')}`" @click="toggleProviderHelp(provider.name, $event)"><CircleHelp :size="14" /></button>
                        <span v-if="providerHelp === provider.name" :id="`provider-help-${provider.name.replaceAll(' ', '-')}`" class="provider-help-popover" role="tooltip">
                          <strong>{{ providerHelpLabel(provider.name) }}</strong>
                          <template v-if="provider.name === 'Wise'">
                            <p>Wise 始终为您提供真实中间市场汇率 <b class="provider-positive">{{ formatRate(comparisonExchangeRate) }}</b>。没有汇率差价，没有隐性利润。</p>
                            <p>只需支付 <b>{{ formatMoney(provider.fee) }} {{ comparisonSendCurrency }}</b> 预付费用。</p>
                            <p>因此，您可节省多达 <b class="provider-positive">{{ formatMoney(comparisonSavingsAmount) }} {{ comparisonSendCurrency }}</b> 手续费。*</p>
                          </template>
                          <template v-else>
                            <p>他们使用的汇率为 <b class="provider-negative">{{ formatRate(provider.rate) }}</b>，比中间市场汇率 <b class="provider-positive">{{ formatRate(comparisonExchangeRate) }}</b> 贵 {{ formatMoney(provider.markupPercent) }}%。</p>
                            <p>这将产生 <b class="provider-negative">{{ formatMoney(provider.markupAmount) }} {{ comparisonSendCurrency }}</b> 汇率加价。</p>
                            <p>另外收取 <b>{{ formatMoney(provider.transferFee) }} {{ comparisonSendCurrency }}</b> 汇款手续费。</p>
                            <p>这意味着此次汇款的总费用为 <b class="provider-negative">{{ formatMoney(provider.fee) }} {{ comparisonSendCurrency }}</b>。</p>
                          </template>
                        </span>
                      </span>
                    </span>
                  </div>
                  <span class="provider-amount-line"><b>{{ formatMoney(provider.amount) }} {{ comparisonReceiveCurrency }}</b><button type="button" class="provider-help-button provider-help-mobile" :data-provider-name="provider.name" :aria-label="providerHelpLabel(provider.name)" :aria-expanded="providerHelp === provider.name" aria-controls="provider-help-mobile" @click.stop="toggleProviderHelp(provider.name, $event)"><CircleHelp :size="14" /></button></span>
                </div>
              </div>
            </div>
            <a class="show-more" :href="compareHref">显示更多供应商</a>
          </div>
          <div class="comparison-note">
            <p>此次对比适用于通过银行转账付款。</p>
            <p>*“可节省多达金额”指其他服务商总费用与 Wise 总费用之间的差额。<a href="https://wise.com/zh-cn/compare/disclaimer">我们如何收集此数据？</a></p>
          </div>
        </div>
      </section>

      <Transition name="fade">
        <div v-if="activeProviderHelp" class="provider-help-overlay" role="presentation" @mousedown.self="closeProviderHelp()">
          <section id="provider-help-mobile" ref="providerHelpSheetEl" class="provider-help-sheet" role="dialog" aria-modal="true" aria-labelledby="provider-help-mobile-title" tabindex="-1" @click.stop>
            <span class="provider-help-handle" aria-hidden="true"></span>
            <button class="provider-help-sheet-close" type="button" aria-label="关闭" @click="closeProviderHelp()"><X /></button>
            <div class="provider-help-sheet-content">
              <h3 id="provider-help-mobile-title">{{ providerHelpLabel(activeProviderHelp.name) }}</h3>
              <template v-if="activeProviderHelp.wise">
                <p>Wise 始终为您提供真实中间市场汇率 <b class="provider-positive">{{ formatRate(comparisonExchangeRate) }}</b>。没有汇率差价，没有隐性利润。</p>
                <p>只需支付 <b>{{ formatMoney(activeProviderHelp.fee) }} {{ comparisonSendCurrency }}</b> 预付费用。</p>
                <p>因此，您可节省多达 <b class="provider-positive">{{ formatMoney(comparisonSavingsAmount) }} {{ comparisonSendCurrency }}</b> 手续费。*</p>
              </template>
              <template v-else>
                <p>他们使用的汇率为 <b class="provider-negative">{{ formatRate(activeProviderHelp.rate) }}</b>，比中间市场汇率 <b class="provider-positive">{{ formatRate(comparisonExchangeRate) }}</b> 贵 {{ formatMoney(activeProviderHelp.markupPercent) }}%。</p>
                <p>这将产生 <b class="provider-negative">{{ formatMoney(activeProviderHelp.markupAmount) }} {{ comparisonSendCurrency }}</b> 汇率加价。</p>
                <p>另外收取 <b>{{ formatMoney(activeProviderHelp.transferFee) }} {{ comparisonSendCurrency }}</b> 汇款手续费。</p>
                <p>这意味着此次汇款的总费用为 <b class="provider-negative">{{ formatMoney(activeProviderHelp.fee) }} {{ comparisonSendCurrency }}</b>。</p>
              </template>
            </div>
          </section>
        </div>
      </Transition>

      <section class="security-section container">
        <div class="security-copy">
          <h2>让您安心</h2>
          <p>每个月，数百万个人和企业客户信任我们，将超过 1263 亿 HKD 的资金交由我们进行转移。</p>
          <a class="button button-primary" href="https://wise.com/hk/safety-and-security/">我们如何保证您资金的安全</a>
        </div>
        <img class="lock-art" src="https://wise.com/web-art/assets/illustrations/lock-large@2x.webp" alt="安全挂锁插图" />
        <div id="security-list" class="security-list">
          <article><span class="round-icon large"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 3a5 5 0 0 0-5 5v1H5.01A1.01 1.01 0 0 0 4 10.01V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.99A1.01 1.01 0 0 0 18.99 9H17V8a5 5 0 0 0-5-5m3 6V8a3 3 0 0 0-6 0v1zm-9 2v8h12v-8zm5 6v-4h2v4z" /></svg></span><p>我们专业的防欺诈和信息安全团队致力于保障您的信息安全</p></article>
          <article><span class="round-icon large"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.99c0-.558.452-1.01 1.01-1.01H4v-1a4 4 0 0 1 4-4zm2 3.535c1.196.692 2 1.984 2 3.465v1h.99c.558 0 1.01.452 1.01 1.01V20h6V4h-3v2h-4V4h-3zM12 20v-6H4v6zM8 9a2 2 0 0 0-2 2v1h4v-1a2 2 0 0 0-2-2m-1 7v2h2v-2z" /></svg></span><p>我们使用双重身份验证保护您的账户</p></article>
          <article><span class="round-icon large"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 5.18 7.487 8h9.026zm-.535-2.025a1.01 1.01 0 0 1 1.07 0L20.5 8.134c.861.537.48 1.866-.535 1.866H19v9h2v2H3v-2h2v-9h-.965C3.02 10 2.639 8.671 3.5 8.134zM7 19h4v-9H7zm6 0h4v-9h-4z" /></svg></span><p>我们将您的资金保管在正规的金融机构内</p></article>
        </div>
      </section>

      <section class="flag-belt" aria-label="Wise 支持的货币">
        <FlagBelt />
      </section>

      <section class="reviews-section container" aria-roledescription="carousel" aria-label="客户评价">
        <div class="reviews-controls">
          <div class="trustpilot-line"><span><img src="/assets/icons/trustpilot.png" alt="" /></span> Trustpilot 评分 4.3，共 299,589 条评论</div>
          <h2>适合旅居人士</h2>
          <div class="arrow-buttons">
            <button class="round-arrow" aria-label="上一条评价" :disabled="reviewIndex === 0" @click="reviewIndex--"><ArrowLeft /></button>
            <button class="round-arrow active" aria-label="下一条评价" :disabled="reviewIndex === reviews.length - 1" @click="reviewIndex++"><ArrowRight /></button>
          </div>
        </div>
        <TransitionGroup name="review" tag="div" class="review-cards">
          <article v-for="review in reviewWindow" :key="`${reviewIndex}-${review.name}`" class="review-card" :class="{ dark: review.dark }">
            <img :src="flagUrl(review.flag)" alt="" />
            <h3>{{ review.text }}</h3>
            <a :href="review.href" target="_blank" rel="noopener noreferrer">{{ review.name }} 在 Trustpilot 上的评价</a>
          </article>
        </TransitionGroup>
      </section>

      <section class="mission-wrap container">
        <div class="mission-section">
          <img src="https://wise.com/web-art/assets/illustrations/globe-large@2x.webp" alt="彩色地球图示" />
          <div>
            <h2>汇无国界</h2>
            <p>我们正在打造全球汇款和管理资金的最佳方式。费用低廉，方便易用，极速到账。</p>
            <a class="button button-primary" href="https://wise.com/our-mission">查看我们的使命</a>
          </div>
        </div>
      </section>

      <section class="app-section">
        <div class="app-card">
          <div class="rating-stack" aria-label="Wise 应用评分">
            <a v-for="rating in ratingLinks" :key="rating.name" :href="rating.href">
              <img :src="rating.icon" :alt="rating.name" /><span>{{ rating.copy }}</span>
            </a>
          </div>
          <h2>下载应用，随时随地管理资金</h2>
          <div class="download-row">
            <div class="qr-code"><span>扫描以获取 Wise</span><img src="/assets/icons/wise-download-qr.png" alt="用于下载 Wise 应用的二维码" /></div>
            <div class="store-badges">
              <a href="https://wise-app.sng.link/Apnl5/0r11?_dl=tw%3A%2F%2F&amp;_smtype=3" target="_blank" rel="noopener noreferrer"><img src="https://wise.com/public-resources/assets/marketing-components/app-store-badges/en.svg" alt="Download on the Apple App Store" /></a>
              <a href="https://wise-app.sng.link/Apnl5/3b0q6?_dl=tw%3A%2F%2F&amp;_smtype=3" target="_blank" rel="noopener noreferrer"><img src="https://wise.com/public-resources/assets/marketing-components/google-play-store-badges/en.svg" alt="Get it on Google Play Store" /></a>
            </div>
          </div>
        </div>
      </section>

      <section class="coverage-section">
        <div class="container">
          <h2>Wise 的全球覆盖范围</h2>
          <button class="coverage-chip"><Globe2 :size="18" />汇款</button>
          <div id="coverage-list" class="coverage-grid">
            <a v-for="country in coverage" :key="country.slug" :href="coverageHref(country.slug)">
              <img :src="flagUrl(country.flag)" alt="" /><span>汇款到{{ country.text }}</span>
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer id="footer" class="site-footer">
      <div class="container">
        <div class="footer-groups">
          <div v-for="(column, columnIndex) in footerColumns" :key="columnIndex" class="footer-column">
            <section v-for="{ group, index: groupIndex } in column" :key="group.title" class="footer-group">
              <h2><button :tabindex="footerAccordionEnabled ? 0 : -1" :aria-controls="`footer-links-${groupIndex}`" :aria-expanded="footerAccordionEnabled ? footerOpen.includes(group.title) : true" @click="footerAccordionEnabled && toggleFooter(group.title)"><span>{{ group.title }}</span><ChevronDown :class="{ rotated: footerOpen.includes(group.title) }" /></button></h2>
              <ul :id="`footer-links-${groupIndex}`" :class="{ open: footerOpen.includes(group.title) }"><li v-for="link in group.links" :key="link"><a :href="footerHref(link)">{{ link }}</a></li></ul>
            </section>
          </div>
        </div>
        <div class="footer-brand-row">
          <a class="wise-logo" :href="WISE_HOME_URL" aria-label="Wise 首页">
            <svg viewBox="0 0 88 20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M48.9285.2989h5.413L51.6183 19.7263h-5.4131L48.9285.2989Zm-6.8241 0L38.4514 11.4904 36.8573.2989h-3.7858L28.2893 11.4572 27.6917.2989h-5.2472L24.271 19.7263h4.3504L34.0014 7.4389 35.8943 19.7263h4.284L47.2518.2989h-5.1474ZM87.5508 11.59H74.6988c.0665 2.5239 1.5775 4.1844 3.8025 4.1844 1.6771 0 3.0055-.8967 4.035-2.607l4.3382 1.972C85.3833 18.0775 82.2413 19.992 78.3685 19.992 73.0883 19.992 69.5847 16.4386 69.5847 10.7266 69.5847 4.4501 73.7025 0 79.5142 0c5.1145 0 8.3357 3.4538 8.3357 8.8336 0 .8967-.1 1.7933-.299 2.7564Zm-4.8153-3.7194c0-2.2582-1.262-3.6862-3.2877-3.6862-2.0922 0-3.8191 1.4944-4.2841 3.6862h7.5718ZM5.5255 6.1532 0 12.6107h9.8661l1.1086-3.0449H6.747l2.5832-2.9868.0083-.0792L7.6588 3.6085h7.5569l-5.8579 16.1179h4.0087L20.4402.2989H2.166L5.5255 6.1532Zm57.6165-1.9689c1.9095 0 3.5827 1.0269 5.0439 2.7869l.7677-5.4769C67.592.5729 65.7489 0 63.308 0c-4.8485 0-7.5716 2.8394-7.5716 6.4426 0 2.499 1.3948 4.0266 3.6862 5.0146l1.0959.4981c2.0423.8718 2.5904 1.3036 2.5904 2.2251 0 .9547-.9216 1.5608-2.3247 1.5608-2.3164.0083-4.1927-1.1789-5.6041-3.2047l-.7822 5.5803C56.0053 19.3423 58.0657 19.992 60.7842 19.992c4.6077 0 7.4389-2.6568 7.4389-6.343 0-2.5072-1.1125-4.1179-3.9188-5.3798l-1.1954-.5645c-1.6605-.7389-2.225-1.1457-2.225-1.9593 0-.88.7721-1.5609 2.2582-1.5609Z" /></svg>
          </a>
          <div class="social-links">
            <a href="https://www.facebook.com/wise" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="33" height="32" viewBox="0 0 33 32" aria-hidden="true" focusable="false"><path d="M16.4999 0C7.35624 0 0 7.17821 0 16.1007C0 24.1509 6.04999 30.7925 13.8875 32V20.7296H9.69374V16.1007H13.8875V12.5451C13.8875 8.51992 16.3624 6.30608 20.1438 6.30608C21.9313 6.30608 23.8563 6.64151 23.8563 6.64151V10.5996H21.7936C19.7312 10.5996 19.1124 11.8071 19.1124 13.0818V16.1007H23.7186L22.9624 20.7296H19.1124V32C26.9499 30.7925 33 24.1509 33 16.1007C33 7.17821 25.6436 0 16.4999 0Z" /></svg></a>
            <a href="https://x.com/wise" target="_blank" rel="noopener noreferrer" aria-label="X"><svg width="35" height="32" viewBox="0 0 35 32" aria-hidden="true" focusable="false"><path d="M27.5333 0H32.9L21.1167 13.5793L34.8833 32H24.08L15.6217 20.8059L5.93834 32H.571674L13.055 17.476-.128326 0H10.9433L18.585 10.2258L27.5333 0ZM25.655 28.8118H28.63L9.38001 3.07011H6.18334L25.655 28.8118Z" /></svg></a>
            <a href="https://www.instagram.com/wiseaccount" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><path d="M14.7086 2.89479C18.6135 2.89479 19.1341 2.89479 20.6961 3.02495C24.601 3.28528 26.4233 5.10758 26.6837 9.01251C26.8138 10.5745 26.8138 10.965 26.8138 15.0001C26.8138 18.905 26.8138 19.4256 26.6837 20.9876C26.5535 24.8925 24.601 26.845 20.6961 26.9752C19.1341 27.1053 18.7437 27.1053 14.7086 27.1053C10.8036 27.1053 10.283 27.1053 8.72101 26.9752C4.81608 26.7148 2.99378 24.8925 2.73345 20.9876C2.73345 19.4256 2.60329 18.905 2.60329 15.0001C2.60329 11.0951 2.60329 10.5745 2.73345 9.01251C2.99378 5.10758 4.81608 3.28528 8.72101 3.02495C10.283 3.02495 10.8036 2.89479 14.7086 2.89479ZM14.7086 0.291504C10.6735 0.291504 10.283 0.291504 8.59084 0.421668C3.25411 0.681997 0.390493 3.54561 0.130164 8.88235C9.69799e-09 10.5745 0 10.965 0 15.0001C0 19.0352 9.69799e-09 19.5558 0.130164 21.1178C0.390493 26.4545 3.25411 29.3181 8.59084 29.5785C10.1528 29.7086 10.6735 29.7086 14.7086 29.7086C18.7437 29.7086 19.2643 29.7086 20.8263 29.5785C26.163 29.3181 29.1568 26.3244 29.4171 20.9876C29.5473 19.4256 29.5473 18.905 29.5473 14.8699C29.5473 10.8348 29.5473 10.4443 29.4171 8.75218C29.0266 3.67577 26.163 0.681997 20.8263 0.421668C19.2643 0.291504 18.7437 0.291504 14.7086 0.291504ZM14.7086 7.45054C10.5433 7.45054 7.15903 10.8348 7.15903 15.0001C7.15903 19.1653 10.5433 22.5496 14.7086 22.5496C18.8738 22.5496 22.2581 19.1653 22.2581 15.0001C22.2581 10.8348 18.8738 7.45054 14.7086 7.45054ZM14.7086 19.9463C11.9751 19.9463 9.76232 17.7335 9.76232 15.0001C9.76232 12.2666 11.9751 10.0538 14.7086 10.0538C17.442 10.0538 19.6548 12.2666 19.6548 15.0001C19.6548 17.7335 17.442 19.9463 14.7086 19.9463ZM22.5184 5.36791C21.6073 5.36791 20.6961 6.1489 20.6961 7.19021C20.6961 8.23152 21.4771 9.01251 22.5184 9.01251C23.4296 9.01251 24.3407 8.23152 24.3407 7.19021C24.3407 6.1489 23.5597 5.36791 22.5184 5.36791Z" /></svg></a>
            <a href="https://www.youtube.com/@wise" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg width="33" height="32" viewBox="0 0 33 32" aria-hidden="true" focusable="false"><path d="M13.4793 20.459V11.542L21.3183 16.001L13.4793 20.459ZM30.9153 8.735C30.5613 7.434 29.5613 6.428 28.2903 6.072L28.2633 6.066C25.0703 5.66 21.3773 5.428 17.6293 5.428C17.2483 5.428 16.8683 5.43 16.4893 5.435L16.5473 5.434C16.2253 5.43 15.8463 5.427 15.4653 5.427C11.7173 5.427 8.02233 5.659 4.39533 6.108L4.82933 6.064C3.53233 6.427 2.53233 7.432 2.18533 8.707L2.17933 8.733C1.77933 10.842 1.55133 13.269 1.55133 15.749C1.55133 15.837 1.55133 15.925 1.55233 16.012V15.998C1.55233 16.072 1.55133 16.16 1.55133 16.248C1.55133 18.728 1.78033 21.154 2.21733 23.507L2.17933 23.263C2.53333 24.564 3.53333 25.57 4.80433 25.926L4.83133 25.932C8.02433 26.338 11.7173 26.57 15.4653 26.57C15.8453 26.57 16.2253 26.568 16.6053 26.563L16.5473 26.564C16.8693 26.568 17.2493 26.571 17.6293 26.571C21.3783 26.571 25.0723 26.339 28.6993 25.89L28.2653 25.934C29.5633 25.572 30.5633 24.566 30.9113 23.291L30.9173 23.265C31.3163 21.156 31.5443 18.729 31.5443 16.25C31.5443 16.162 31.5443 16.074 31.5433 15.987V16C31.5433 15.926 31.5443 15.838 31.5443 15.75C31.5443 13.27 31.3153 10.844 30.8783 8.491L30.9153 8.735Z" /></svg></a>
            <a href="https://uk.linkedin.com/company/wiseaccount" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 33 32" aria-hidden="true" focusable="false"><path d="M25.8806 0H7.21397C3.53264 0 .547302 2.98533.547302 6.66667V25.3333C.547302 29.0147 3.53264 32 7.21397 32H25.8806C29.5633 32 32.5473 29.0147 32.5473 25.3333V6.66667C32.5473 2.98533 29.5633 0 25.8806 0ZM11.214 25.3333H7.21397V10.6667H11.214V25.3333ZM9.21397 8.976C7.92597 8.976 6.88064 7.92267 6.88064 6.624C6.88064 5.32533 7.92597 4.272 9.21397 4.272C10.502 4.272 11.5473 5.32533 11.5473 6.624C11.5473 7.92267 10.5033 8.976 9.21397 8.976ZM27.214 25.3333H23.214V17.8613C23.214 13.3707 17.8806 13.7107 17.8806 17.8613V25.3333H13.8806V10.6667H17.8806V13.02C19.742 9.572 27.214 9.31733 27.214 16.3213V25.3333Z" /></svg>
            </a>
          </div>
        </div>
        <div class="legal-links"><a href="https://wise.com/terms-and-conditions">法律</a><a href="https://wise.com/gb/legal/privacy-notices">隐私政策</a><a href="https://wise.com/cookie-policy">Cookie 政策</a><a href="https://wise.com/p/research-privacy-policy">研究隐私政策</a><a href="https://wise.com/help/articles/2235393/how-do-i-make-a-complaint">投诉</a><a href="https://wise.com/local-sites">国家/地区站点地图</a><a href="https://wise.com/imaginary-v2/images/3c1d6ce8e13bc81b63172035f7598259-2025ModernSlaveryandHumanTraffickingStatementforWiseGroup.pdf">《现代奴役声明》</a><a href="https://wise.com/help/articles/473W1lKUiKkVFMNeBQgrAG/accessibility-at-wise">无障碍功能</a><a href="https://wise.com/help/articles/79CxCv9Qj1r7mDPJuIwUA3/wise-intellectual-property">知识产权</a></div>
        <div class="legal-copy"><p>© Wise Payments Limited 2026</p><p>Wise Payments Hong Kong Limited 持有香港海关签发的货币服务经营者执照，执照号码为 25-03-03263。</p></div>
      </div>
    </footer>

    <Transition name="fade">
      <div v-if="languageOpen" class="overlay language-overlay" role="presentation" @mousedown.self="closeLanguageDrawer">
        <section ref="languageEl" class="language-drawer" role="dialog" aria-modal="true" aria-labelledby="language-title">
          <header :inert="Boolean(localePopover)">
            <h2 id="language-title">选择国家/地区和语言</h2>
            <button class="icon-button drawer-close" data-autofocus aria-label="关闭" @click="closeLanguageDrawer"><X /></button>
          </header>
          <div class="language-fields" :inert="Boolean(localePopover)">
            <div class="language-field">
              <span id="drawer-language-label">选择语言</span>
              <button class="drawer-select locale-combobox" type="button" role="combobox" aria-haspopup="dialog" aria-labelledby="drawer-language-label drawer-language-value" aria-controls="locale-language-dialog" :aria-expanded="localePopover === 'language'" @click="openLocalePopover('language', $event)">
                <span id="drawer-language-value" class="drawer-select-value">{{ selectedLanguageOption.label }}</span><ChevronDown :class="{ rotated: localePopover === 'language' }" />
              </button>
            </div>
            <div class="language-field">
              <span id="drawer-country-label">选择您所在的国家/地区</span>
              <button class="drawer-select locale-combobox country-select" type="button" role="combobox" aria-haspopup="dialog" aria-labelledby="drawer-country-label drawer-country-value" aria-controls="locale-country-dialog" :aria-expanded="localePopover === 'country'" @click="openLocalePopover('country', $event)">
                <img :src="flagUrl(regionCountry.toLowerCase())" alt="" /><span id="drawer-country-value" class="drawer-select-value">{{ selectedRegionOption.label }}</span><ChevronDown :class="{ rotated: localePopover === 'country' }" />
              </button>
            </div>
            <p>Wise 根据您的居住地不同，提供不同功能。</p>
          </div>
          <footer :inert="Boolean(localePopover)"><a class="button button-primary" :href="localeHref">确认更改</a></footer>

          <Transition name="fade">
            <div v-if="localePopover" class="locale-popover-overlay" role="presentation" @mousedown.self="closeLocalePopover()">
              <section :id="`locale-${localePopover}-dialog`" ref="localePopoverEl" class="locale-popover" :class="`locale-popover--${localePopover}`" role="dialog" aria-modal="true" :aria-label="localePopover === 'language' ? '选择语言' : '选择您所在的国家/地区'">
                <header class="locale-popover-head"><button class="icon-button" aria-label="关闭" @click="closeLocalePopover()"><X /></button></header>
                <label v-if="localePopover === 'country'" class="locale-search"><Search :size="23" /><input v-model="localeQuery" data-autofocus type="search" autocomplete="off" aria-label="搜索国家/地区" placeholder="选择您所在的国家/地区" :aria-controls="localeListboxId" :aria-activedescendant="localeActiveOptionId" @keydown="onLocaleKeydown" /></label>
                <div :id="localeListboxId" class="locale-option-list" role="listbox" tabindex="0" :aria-label="localePopover === 'language' ? '语言' : '国家/地区'" :aria-activedescendant="localeActiveOptionId" @keydown="onLocaleKeydown">
                  <div v-if="localeListOptions.length === 0" class="locale-empty">没有找到匹配的国家/地区</div>
                  <button v-for="(option, index) in localeListOptions" :id="localeOptionId(index)" :key="option.value" type="button" role="option" tabindex="-1" :aria-selected="localePopover === 'language' ? regionLanguage === option.value : regionCountry === option.value" :class="{ active: localeActiveIndex === index, selected: localePopover === 'language' ? regionLanguage === option.value : regionCountry === option.value }" @mouseenter="localeActiveIndex = index" @click="chooseLocaleOption(option)">
                    <img v-if="localePopover === 'country'" :src="flagUrl(option.value.toLowerCase())" alt="" /><span>{{ option.label }}</span><Check v-if="localePopover === 'language' ? regionLanguage === option.value : regionCountry === option.value" />
                  </button>
                </div>
              </section>
            </div>
          </Transition>
        </section>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="infoDialog" class="overlay info-dialog-overlay" :class="`${infoDialog}-dialog-overlay`" role="presentation" @mousedown.self="closeInfoDialog">
        <section ref="infoDialogEl" class="info-dialog" :class="`${infoDialog}-dialog`" role="dialog" aria-modal="true" :aria-labelledby="`${infoDialog}-dialog-title`">
          <template v-if="infoDialog === 'rate'">
            <header class="rate-dialog-header"><button class="icon-button info-dialog-close" data-autofocus aria-label="关闭" @click="closeInfoDialog"><X /></button></header>
            <div class="rate-dialog-scroll">
              <div class="rate-dialog-flags" aria-hidden="true"><img :src="flagUrl(source.flag)" alt="" /><img :src="flagUrl(target.flag)" alt="" /></div>
              <h2 id="rate-dialog-title">1 {{ sendCurrency }} = {{ formatRate(exchangeRate) }} {{ receiveCurrency }}</h2>
              <hr />
              <div v-if="!usesDynamicCharge" class="rate-lock-copy"><strong><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.padlock" clip-rule="evenodd" /></svg>我们已锁定此汇率 {{ rateLockHours }} 小时</strong><p>只要我们在 {{ guaranteeDeadline }}前收到您的款项，您就可以免受汇率波动的影响。</p></div>
              <div v-else class="rate-lock-copy"><strong><svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" :d="WISE_ICON_PATHS.autoConvert" clip-rule="evenodd" /></svg>不保证此汇率</strong><p>当我们收到您的款项时，我们将使用实时汇率兑换您的资金。</p></div>
              <hr />
              <div class="rate-dialog-section">
                <h3>我们的汇率公开透明</h3>
                <p>我们一律使用<strong>中间市场汇率</strong>结算，此为两种货币买入价和卖出价之间的公平汇率。</p>
                <p>请注意，部分银行或汇款服务商所提供的汇率或会低于中间市场汇率。然而，即使有关服务价格低廉或费用全免，收款人最终收到的金额仍可能会更少。</p>
                <div v-if="rateProviderRows.length" class="rate-provider-table" role="table" aria-label="供应商汇率比较">
                  <div class="rate-provider-head" role="row"><span role="columnheader">供应商</span><span role="columnheader">1 {{ sendCurrency }} → {{ receiveCurrency }}</span></div>
                  <div v-for="provider in rateProviderRows" :key="provider.name" class="rate-provider-row" :class="{ 'rate-provider-row-wise': provider.name === 'Wise' }" role="row">
                    <span role="cell"><img class="provider-wordmark" :class="{ 'provider-wordmark-wise': provider.name === 'Wise' }" :src="comparisonLogoUrl(provider.logo)" :alt="provider.name" @error="handleProviderLogoError" /></span>
                    <span role="cell"><strong>{{ formatRate(provider.rate) }}</strong><small v-if="provider.note">{{ provider.note }}</small></span>
                  </div>
                </div>
                <div v-if="rateProviderRows.length" class="rate-disclaimer"><span>对比 Wise 与银行或其他提供商将 {{ formatMoney(sendAmount, 0) }} {{ sendCurrency }} 兑成 {{ receiveCurrency }} 并汇款的费用：</span> <a class="rate-data-link" href="https://wise.com/gb/compare/disclaimer" target="_blank" rel="noopener noreferrer">了解我们收集这些数据的方法</a></div>
                <p v-else class="rate-comparison-nudge">我们目前暂无这些货币及汇款金额的对比数据，但我们会持续努力，为您提供更多货币、价位及提供商的对比信息。</p>
              </div>
              <hr />
              <div class="rate-history">
                <h3>汇率历史记录</h3>
                <strong>时间段</strong>
                <div class="rate-periods" role="radiogroup" aria-label="时间选择">
                  <label><input v-model="ratePeriod" type="radio" name="rate-period" value="week" /><span>1 周</span></label>
                  <label><input v-model="ratePeriod" type="radio" name="rate-period" value="month" /><span>1 个月</span></label>
                  <label><input v-model="ratePeriod" type="radio" name="rate-period" value="halfYear" /><span>6 个月</span></label>
                </div>
                <div class="rate-chart">
                  <svg viewBox="0 0 418 250" preserveAspectRatio="none" role="img" tabindex="0" :aria-label="`图表显示过去${ratePeriod === 'week' ? '1 周' : ratePeriod === 'month' ? '1 个月' : '6 个月'}的 ${sendCurrency} 兑 ${receiveCurrency} 汇率。`"><line v-for="y in [0, 50, 100, 150, 200, 250]" :key="y" x1="0" :y1="y" x2="418" :y2="y" /><polyline :points="rateChartPoints" /></svg>
                  <div class="rate-chart-axis" aria-hidden="true"><span v-for="tick in rateChartAxis" :key="tick">{{ formatRateTick(tick) }}</span></div>
                  <div class="rate-chart-dates" aria-hidden="true"><span>{{ rateDateRange[0] }}</span><span>{{ rateDateRange[1] }}</span></div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <button class="icon-button info-dialog-close" data-autofocus aria-label="关闭" @click="closeInfoDialog"><X /></button>
            <h2 id="discount-dialog-title">以更划算的价格汇出更多款项</h2>
            <div class="discount-benefits">
              <article><span><Zap aria-hidden="true" /></span><div><h3>折扣从 25,000 USD 开始适用</h3><p>无论您是发送一笔还是多笔汇款，只要达到 25,000 USD 或其他货币等值后，即可享受优惠费用。</p></div></article>
              <article><span><Globe2 aria-hidden="true" /></span><div><h3>包含主要货币</h3><p>以大多数主要货币进行的汇款金额均可累计，助您解锁折扣，而并不仅限于 USD。</p></div></article>
              <article><span><CalendarDays aria-hidden="true" /></span><div><h3>整月持续省钱</h3><p>一旦达到 25,000 USD，您将在当月剩余时间享受折扣费用。该折扣将于每月重置。</p></div></article>
            </div>
            <div class="discount-dialog-actions"><button class="button button-primary" type="button" @click="closeInfoDialog">知道了</button><a class="button discount-learn-more" href="https://wise.com/hk/pricing/send-money" target="_blank" rel="noopener noreferrer">了解更多</a></div>
          </template>
        </section>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="selector" class="overlay selector-overlay" role="presentation" @mousedown.self="closeSelector">
        <section ref="selectorEl" class="selector-sheet" :class="`selector-${selector}`" :style="selectorStyle" role="dialog" aria-modal="true" :aria-label="selector === 'destination' ? '选择目的地' : '选择货币'">
          <header class="selector-mobile-head"><button class="icon-button" aria-label="关闭" @click="closeSelector"><X /></button></header>
          <label class="selector-search"><Search :size="21" /><input v-model="selectorQuery" data-autofocus role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="selector-listbox" :aria-activedescendant="activeSelectorOptionId" :placeholder="selector === 'destination' ? '输入国家/地区或货币' : '输入货币/国家/地区'" @keydown="onSelectorKeydown" /></label>
          <div id="selector-listbox" class="selector-list" role="listbox" aria-orientation="vertical" tabindex="0" @keydown="onSelectorKeydown">
            <template v-if="selector === 'destination'">
              <p v-if="popularDestinations.length">热门国家/地区</p>
              <button v-for="(country, index) in popularDestinations" :id="selectorOptionId(index)" :key="`popular-${country.flag}`" role="option" tabindex="-1" :aria-selected="destination.name === country.name" :class="{ active: selectorActiveIndex === index, selected: destination.name === country.name }" @mouseenter="selectorActiveIndex = index" @click="chooseDestination(country)">
                <img :src="flagUrl(country.flag)" alt="" /><span><b>{{ country.name }}</b></span><Check v-if="destination.name === country.name" />
              </button>
              <p>全部国家/地区</p>
              <div v-if="filteredDestinations.length === 0" class="selector-empty">没有找到匹配的国家/地区</div>
              <button v-for="(country, index) in filteredDestinations" :id="selectorOptionId(popularDestinations.length + index)" :key="`all-${country.flag}`" role="option" tabindex="-1" :aria-selected="destination.name === country.name" :class="{ active: selectorActiveIndex === popularDestinations.length + index, selected: destination.name === country.name }" @mouseenter="selectorActiveIndex = popularDestinations.length + index" @click="chooseDestination(country)">
                <img :src="flagUrl(country.flag)" alt="" /><span><b>{{ country.name }}</b></span><Check v-if="destination.name === country.name" />
              </button>
            </template>
            <template v-else>
              <div v-if="filteredCurrencies.length === 0" class="selector-empty">没有找到匹配的货币</div>
              <p v-if="popularCurrencies.length">热门货币</p>
              <button v-for="(currency, index) in popularCurrencies" :id="selectorOptionId(index)" :key="`popular-${currency.code}`" role="option" tabindex="-1" :aria-selected="selectedSelectorCurrency === currency.code" :class="{ active: selectorActiveIndex === index, selected: selectedSelectorCurrency === currency.code }" @mouseenter="selectorActiveIndex = index" @click="chooseCurrency(currency.code)">
                <img :src="flagUrl(currency.flag)" alt="" /><span><b>{{ currency.code }}</b><small>{{ currency.name }}</small></span><Check v-if="selectedSelectorCurrency === currency.code" />
              </button>
              <p>所有货币</p>
              <button v-for="(currency, index) in allCurrencies" :id="selectorOptionId(popularCurrencies.length + index)" :key="`all-${currency.code}`" role="option" tabindex="-1" :aria-selected="selectedSelectorCurrency === currency.code" :class="{ active: selectorActiveIndex === popularCurrencies.length + index, selected: selectedSelectorCurrency === currency.code }" @mouseenter="selectorActiveIndex = popularCurrencies.length + index" @click="chooseCurrency(currency.code)">
                <img :src="flagUrl(currency.flag)" alt="" /><span><b>{{ currency.code }}</b><small>{{ currency.name }}</small></span><Check v-if="selectedSelectorCurrency === currency.code" />
              </button>
            </template>
          </div>
          <button v-if="selector === 'destination'" class="selector-current" @click="closeSelector"><img :src="flagUrl(destination.flag)" alt="" /><b>{{ destination.name }}</b><Check /></button>
        </section>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="feeDialogOpen" class="overlay fee-dialog-overlay" role="presentation" @mousedown.self="closeFeeDialog">
        <section ref="feeDialogEl" class="fee-dialog" :class="{ 'fee-dialog-compare': feeDialogTab === 'compare' }" role="dialog" aria-modal="true" aria-labelledby="fee-dialog-title">
          <span class="fee-dialog-handle" aria-hidden="true"></span>
          <button class="icon-button fee-dialog-close" data-autofocus aria-label="关闭" @click="closeFeeDialog"><X /></button>
          <h2 id="fee-dialog-title">总费用</h2>
          <div class="fee-dialog-tabs" role="radiogroup" aria-label="费用视图">
            <label><input v-model="feeDialogTab" type="radio" name="segmented-control" value="details" @keydown="onFeeTabKeydown" /><span>明细</span></label>
            <label><input v-model="feeDialogTab" type="radio" name="segmented-control" value="compare" @keydown="onFeeTabKeydown" /><span>比较</span></label>
          </div>

          <template v-if="feeDialogTab === 'details'">
            <dl class="fee-detail-list">
              <div v-for="detail in feeDetailRows" :key="detail.label"><dt>{{ detail.label }}</dt><dd>{{ detail.value }}</dd></div>
            </dl>
            <div class="fee-dialog-total">
              <span>总计</span>
              <p><strong>{{ formatMoney(feeAmount) }} {{ sendCurrency }}</strong><small>包含在您汇款的金额中</small></p>
            </div>
          </template>

          <template v-else-if="usesDynamicCharge">
            <p class="fee-compare-empty">我们目前暂无这些货币及汇款金额的对比数据，但我们会持续努力，为您提供更多货币、价位及提供商的对比信息。</p>
          </template>

          <template v-else>
            <p class="fee-compare-copy">与您所在地区最受欢迎的银行和提供商相比，我们似乎是发送 <strong>{{ formatMoney(sendAmount, 0) }} {{ sendCurrency }} 至 {{ receiveCurrency }}</strong> 汇款的最便宜方式。</p>
            <div class="fee-compare-table" role="table" aria-label="提供商费用比较">
              <div class="fee-compare-head" role="row"><span role="columnheader">提供商</span><span role="columnheader">收款人收到</span></div>
              <div v-for="(provider, index) in feeComparisonRows" :key="provider.name" class="fee-compare-row" :class="{ 'fee-compare-row-wise': provider.name === 'Wise' }" role="row">
                <span role="cell"><img class="provider-wordmark" :class="{ 'provider-wordmark-wise': provider.name === 'Wise' }" :src="comparisonLogoUrl(provider.logo)" :alt="provider.name" @error="handleProviderLogoError" /></span>
                <span role="cell"><strong>{{ formatMoney(provider.amount) }} {{ receiveCurrency }}</strong><small v-if="index">-{{ formatMoney(feeComparisonRows[0].amount - provider.amount) }} {{ receiveCurrency }}</small></span>
              </div>
            </div>
            <a class="fee-data-link" href="https://wise.com/gb/compare/disclaimer" target="_blank" rel="noopener noreferrer">我们如何收集这些数据</a>
          </template>
        </section>
      </div>
    </Transition>

  </div>
</template>
