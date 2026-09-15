import type { ComponentEntry } from './types'

const shopFonts = ['/assets/shop/GTStandard-MRegular.woff2', '/assets/shop/GTStandard-MSemibold.woff2']
const wiseFont = '/assets/wise/inter-variable.woff2'

export const wiseShopEntries: ComponentEntry[] = [
  {
    id: 'wise-product-navigation', title: 'Product Navigation', site: 'wise', category: 'Navigation', loadComponent: () => import('../library/wise/WiseProductNavigation.vue'),
    summary: '从 Wise 顶栏和产品导航展开区抽象，保留图文入口、账户分类和荧光绿注册按钮。items 注入导航数据，链接使用原生 a，Escape 收起并归还焦点。',
    tags: ['Navigation', 'Menu', 'Responsive', 'Product'], source: 'wise.com/src/App.vue:1487', sourceKind: 'adapted',
    files: ['library/wise/WiseProductNavigation.vue', 'library/wise/WiseBrandMark.vue', 'library/wise/wiseNavigation.ts'],
    assets: [wiseFont, '/assets/wise/wise-sans-heavy.woff2', '/assets/wise/nav-personal.jpg', '/assets/wise/nav-business.jpg', '/assets/wise/nav-platform.jpg'],
    usage: `<script setup lang="ts">
import WiseProductNavigation from './library/wise/WiseProductNavigation.vue'
import { wiseNavigationItems } from './library/wise/wiseNavigation'
</script>

<template>
  <WiseProductNavigation :items="wiseNavigationItems" initial-section="personal" :initially-open="true" />
</template>`,
    props: [
      { name: 'initialSection', label: 'Product section', type: 'select', default: 'personal', options: ['personal', 'business', 'platform'], description: '初始产品区块 ID；更新时同步当前区块。' },
      { name: 'initiallyOpen', label: 'Open menu', type: 'boolean', default: true, description: '初始展开状态；组件内部支持点击切换和 Escape 收起。' },
      { name: 'registrationHref', label: 'Register URL', type: 'text', default: 'https://wise.com/register', description: '注册按钮的真实目标 URL，navigate 事件可用于追踪。' },
    ], background: '#f0f3eb', foreground: '#163300',
  },
  {
    id: 'wise-currency-picker', title: 'Currency Picker', site: 'wise', category: 'Forms', loadComponent: () => import('../library/wise/WiseCurrencyPicker.vue'),
    summary: '从 Wise 币种弹层提取搜索与选择器内容，支持热门分组、空结果、方向键定位、Enter 选择和 v-model。options 接收业务币种列表；外层弹窗由宿主决定。',
    tags: ['Combobox', 'Currency', 'Search', 'Keyboard'], source: 'wise.com/src/App.vue:1970', sourceKind: 'adapted',
    files: ['library/wise/WiseCurrencyPicker.vue', 'library/wise/wiseCurrencies.ts'],
    assets: [wiseFont, '/assets/wise/eur.svg', '/assets/wise/usd.svg', '/assets/wise/gbp.svg', '/assets/wise/cad.svg', '/assets/wise/hkd.svg', '/assets/wise/inr.svg'],
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import WiseCurrencyPicker from './library/wise/WiseCurrencyPicker.vue'
import { currencyOptions } from './library/wise/wiseCurrencies'
const currency = ref('GBP')
</script>

<template>
  <WiseCurrencyPicker v-model="currency" :options="currencyOptions" />
</template>`,
    props: [
      { name: 'modelValue', label: 'Currency', type: 'select', default: 'GBP', options: ['EUR', 'USD', 'GBP', 'CAD', 'HKD', 'INR'], description: '当前币种 code，支持 v-model。选择时同时 emit select(CurrencyOption)。' },
      { name: 'title', label: 'Title', type: 'text', default: 'Choose a currency', description: '选择器标题和区域无障碍名称。' },
      { name: 'showPopular', label: 'Popular group', type: 'boolean', default: true, description: '优先排列 options 中标记 popular 的项目并显示分组标题。' },
    ], background: '#eef0ec', foreground: '#163300',
  },
  {
    id: 'wise-fee-breakdown', title: 'Fee Breakdown', site: 'wise', category: 'Commerce', loadComponent: () => import('../library/wise/WiseFeeBreakdown.vue'),
    summary: '从 Wise 总费用弹层抽象的费用视图：原生单选分段控件切换明细与比较，明细金额自动合计。fees 与 comparisons 接收业务数据，默认内容为示例数据。',
    tags: ['Pricing', 'Fees', 'Segmented control', 'Finance'], source: 'wise.com/src/App.vue:2004', sourceKind: 'adapted',
    files: ['library/wise/WiseFeeBreakdown.vue'], assets: [wiseFont],
    usage: `<script setup lang="ts">
import WiseFeeBreakdown from './library/wise/WiseFeeBreakdown.vue'
const fees = [{ label: 'Transfer fee', amount: 6.5 }, { label: 'Exchange markup', amount: 0 }]
</script>

<template>
  <WiseFeeBreakdown currency="GBP" :fees="fees" initial-view="details" />
</template>`,
    props: [
      { name: 'title', label: 'Title', type: 'text', default: 'Total fees', description: '费用区域标题。' },
      { name: 'currency', label: 'Currency', type: 'select', default: 'GBP', options: ['GBP', 'EUR', 'USD', 'HKD'], description: '金额显示的货币代码，不自动转换传入的金额。' },
      { name: 'initialView', label: 'View', type: 'select', default: 'details', options: ['details', 'compare'], description: '初始视图；用户切换后触发 update:view。' },
    ], background: '#dceacb', foreground: '#163300',
  },
  {
    id: 'wise-provider-comparison', title: 'Provider Comparison', site: 'wise', category: 'Commerce', loadComponent: () => import('../library/wise/WiseProviderComparison.vue'),
    summary: '从 Wise 服务商比较区抽象金额输入、比例横条和费用展开。providers 注入服务商费率，默认值为本地示例；金额变化立即更新各服务商的收款结果。',
    tags: ['Comparison', 'Pricing', 'Finance', 'Data'], source: 'wise.com/src/App.vue:1685', sourceKind: 'adapted',
    files: ['library/wise/WiseProviderComparison.vue', 'library/wise/wiseProviders.ts'], assets: [wiseFont],
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import WiseProviderComparison from './library/wise/WiseProviderComparison.vue'
import { transferProviders } from './library/wise/wiseProviders'
const amount = ref(1000)
</script>

<template>
  <WiseProviderComparison v-model:amount="amount" :providers="transferProviders" source-currency="GBP" target-currency="EUR" />
</template>`,
    props: [
      { name: 'title', label: 'Title', type: 'text', default: 'More arrives with Wise.', description: '对比区域标题。' },
      { name: 'amount', label: 'Send amount', type: 'number', default: 1000, min: 0, max: 100000, step: 100, description: '汇出金额，支持 v-model:amount；收款金额按 (amount - fee) * rate 计算。' },
      { name: 'sourceCurrency', label: 'Send currency', type: 'select', default: 'GBP', options: ['GBP', 'USD', 'HKD'], description: '费用与汇出金额单位，须与业务报价匹配。' },
      { name: 'targetCurrency', label: 'Receive currency', type: 'select', default: 'EUR', options: ['EUR', 'USD', 'GBP'], description: '收款金额单位，须与 providers 的 rate 匹配。' },
    ], background: '#edf5e5', foreground: '#163300',
  },
  {
    id: 'shop-search-panel', title: 'Shopping Search', site: 'shop', category: 'Forms', loadComponent: () => import('../library/shop/ShopSearchPanel.vue'),
    summary: '从 Shop 全站搜索层抽象输入、建议、图片附件和搜索历史。search 事件返回 query 与 File；图片仅生成本地预览，业务搜索和持久化由宿主接入。',
    tags: ['Search', 'Upload', 'History', 'Commerce'], source: 'shop.app/src/App.vue:2123', sourceKind: 'adapted',
    files: ['library/shop/ShopSearchPanel.vue'], assets: [shopFonts[0]!],
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import ShopSearchPanel from './library/shop/ShopSearchPanel.vue'
const query = ref('')
const lastSearch = ref('')
function search(request: { query: string; image: File | null }) { lastSearch.value = request.query }
</script>

<template>
  <ShopSearchPanel v-model="query" @search="search" />
  <output>{{ lastSearch }}</output>
</template>`,
    props: [
      { name: 'modelValue', label: 'Search query', type: 'text', default: '', description: '查询文本，支持 v-model；提交时自动去除首尾空格。' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', default: 'What are you shopping for?', description: '搜索框占位文本。' },
      { name: 'allowImages', label: 'Image search', type: 'boolean', default: true, description: '允许选择 10 MB 以下图片；不上传文件，释放旧预览 URL。' },
    ], background: '#efedef', foreground: '#080808',
  },
  {
    id: 'shop-email-sign-in', title: 'Email Sign In', site: 'shop', category: 'Forms', loadComponent: () => import('../library/shop/ShopEmailSignIn.vue'),
    summary: '从 Shop 账户页提取邮箱登录表单，保留品牌标记、胶囊输入与紫色主按钮。有效邮箱触发 submit；pending/success/error 由宿主 status 指定，不自动模拟已发送邮件。',
    tags: ['Authentication', 'Email', 'Validation', 'Form'], source: 'shop.app/src/App.vue:1608', sourceKind: 'adapted',
    files: ['library/shop/ShopEmailSignIn.vue', 'library/shop/ShopBrandMark.vue'], assets: shopFonts,
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import ShopEmailSignIn from './library/shop/ShopEmailSignIn.vue'
const email = ref('')
function submit(value: string) { email.value = value }
</script>

<template>
  <ShopEmailSignIn :initial-email="email" status="idle" @submit="submit" />
</template>`,
    props: [
      { name: 'title', label: 'Title', type: 'text', default: 'Sign in to Shop', description: '登录表单标题。' },
      { name: 'subtitle', label: 'Subtitle', type: 'text', default: 'One account for everything you love.', description: '标题下的业务说明。' },
      { name: 'initialEmail', label: 'Email', type: 'text', default: '', description: '预填邮箱。submit 仅在浏览器邮箱约束验证通过后触发。' },
      { name: 'status', label: 'Status', type: 'select', default: 'idle', options: ['idle', 'pending', 'success', 'error'], description: '宿主请求状态；success 必须在真实发送成功后设置，重试按钮触发 reset。' },
      { name: 'errorMessage', label: 'Server error', type: 'text', default: 'Something went wrong. Please try again.', description: 'status 为 error 时展示的服务端错误文本。' },
    ], background: '#ffffff', foreground: '#080808',
  },
  {
    id: 'shop-product-filters', title: 'Product Filters', site: 'shop', category: 'Forms', loadComponent: () => import('../library/shop/ShopProductFilters.vue'),
    summary: '从 Shop 筛选抽屉抽象排序、价格、颜色和在售条件。原生表单控件与颜色色板可独立操作，价格范围自动约束，Reset 和 Apply 返回完整筛选对象。',
    tags: ['Filters', 'Range', 'Sort', 'Commerce'], source: 'shop.app/src/App.vue:2021', sourceKind: 'adapted',
    files: ['library/shop/ShopProductFilters.vue'], assets: shopFonts,
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import ShopProductFilters, { type ShopFilters } from './library/shop/ShopProductFilters.vue'
const filters = ref<Partial<ShopFilters>>({})
</script>

<template>
  <ShopProductFilters v-model="filters" :price-limit="2000" :result-count="128" @apply="value => console.log(value)" />
</template>`,
    props: [
      { name: 'priceLimit', label: 'Price ceiling', type: 'number', default: 2000, min: 1, max: 20000, step: 100, description: '价格滑块和输入框的最高值；最小价不能超过最大价。' },
      { name: 'initialSection', label: 'Open section', type: 'select', default: 'price', options: ['price', 'colors', ''], description: '初始展开的筛选组。' },
      { name: 'resultCount', label: 'Result count', type: 'number', default: 128, min: 0, max: 10000, step: 1, description: '业务查询后的结果数量，仅负责展示，组件不请求商品数据。' },
    ], background: '#f1eff2', foreground: '#080808',
  },
  {
    id: 'shop-product-configurator', title: 'Product Configurator', site: 'shop', category: 'Commerce', loadComponent: () => import('../library/shop/ShopProductConfigurator.vue'),
    summary: '从 Shop 商品详情图册与变体区域抽象图片切换、颜色、数量和加入购物车动作。variants/gallery 可替换；add 返回商品名、变体、数量和单价，宿主管理购物车。',
    tags: ['Product detail', 'Variants', 'Gallery', 'Cart'], source: 'shop.app/src/App.vue:1892', sourceKind: 'adapted',
    files: ['library/shop/ShopProductConfigurator.vue'], assets: [...shopFonts, '/assets/shop/mat-camel.jpg', '/assets/shop/mat-ivory.jpg', '/assets/shop/changing-mat.jpg'],
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import ShopProductConfigurator from './library/shop/ShopProductConfigurator.vue'
const cartQuantity = ref(0)
</script>

<template>
  <ShopProductConfigurator name="Baby Changing Mat" :price="160" currency="HKD" @add="item => cartQuantity += item.quantity" />
  <output>{{ cartQuantity }} items</output>
</template>`,
    props: [
      { name: 'name', label: 'Product name', type: 'text', default: 'Baby Changing Mat', description: '商品标题以及 add 事件中的商品名称。' },
      { name: 'store', label: 'Store', type: 'text', default: 'Gathre', description: '商家名称。' },
      { name: 'price', label: 'Price', type: 'number', default: 160, min: 0, max: 10000, step: 10, description: '当前商品的单价。' },
      { name: 'initialVariant', label: 'Variant', type: 'select', default: 'Camel', options: ['Camel', 'Ivory'], description: '初始颜色；选择颜色时同步主图。' },
      { name: 'inStock', label: 'In stock', type: 'boolean', default: true, description: '无库存时禁用加入购物车；variants 中 available=false 的选项不可选择。' },
      { name: 'maxQuantity', label: 'Quantity limit', type: 'number', default: 10, min: 1, max: 99, step: 1, description: '单次加入的数量上限，数量始终保持在 1 和上限之间。' },
    ], background: '#ffffff', foreground: '#080808',
  },
  {
    id: 'wise-currency-converter',
    title: 'Currency Converter',
    summary: '从 Wise 首页汇款计算器中抽象。大号金额、圆形国旗、币种互换和展开式费用明细；默认汇率仅为本地示例，可通过 currencies 接入业务报价。',
    site: 'wise',
    category: 'Forms',
    loadComponent: () => import('../library/wise/WiseCurrencyConverter.vue'),
    tags: ['Currency', 'Calculator', 'Finance', 'Interactive'],
    source: 'wise.com/src/App.vue:1623',
    sourceKind: 'adapted',
    files: ['library/wise/WiseCurrencyConverter.vue'],
    assets: ['/assets/wise/inter-variable.woff2', '/assets/wise/gbp.svg', '/assets/wise/eur.svg', '/assets/wise/usd.svg', '/assets/wise/hkd.svg', '/assets/wise/cad.svg'],
    usage: `<script setup lang="ts">
import { ref } from 'vue'
import WiseCurrencyConverter from './library/wise/WiseCurrencyConverter.vue'

const amount = ref(1000)
</script>

<template>
  <WiseCurrencyConverter
    v-model:amount="amount"
    source-currency="GBP"
    target-currency="EUR"
    :fee-percent="0.65"
    @change="quote => console.log(quote)"
  />
</template>`,
    props: [
      { name: 'amount', label: 'Amount', type: 'number', default: 1000, min: 0, max: 100000, step: 50, description: '汇出金额，支持 v-model:amount；负值按零计算。' },
      { name: 'sourceCurrency', label: 'Send currency', type: 'select', default: 'GBP', options: ['GBP', 'EUR', 'USD', 'HKD', 'CAD'], description: '汇出币种；与 currencies 中的 code 对应。' },
      { name: 'targetCurrency', label: 'Receive currency', type: 'select', default: 'EUR', options: ['GBP', 'EUR', 'USD', 'HKD', 'CAD'], description: '收款币种；选择后立即重新计算金额。' },
      { name: 'feePercent', label: 'Transfer fee', type: 'number', default: 0.65, min: 0, max: 10, step: 0.05, description: '按汇出金额收取的手续费百分比，四舍五入到两位小数。' },
    ],
    background: '#9fe870',
    foreground: '#163300',
  },
  {
    id: 'shop-product-card',
    title: 'Saved Product Card',
    summary: '从 Shop 商品目录抽象的商品卡，包含真实商品图片、独立收藏按钮、评分、自动折扣和选中事件。支持 href 跳转或由业务处理 select 事件。',
    site: 'shop',
    category: 'Commerce',
    loadComponent: () => import('../library/shop/ShopProductCard.vue'),
    tags: ['Product', 'Wishlist', 'Image', 'Commerce'],
    source: 'shop.app/src/App.vue:1724',
    sourceKind: 'adapted',
    files: ['library/shop/ShopProductCard.vue'],
    assets: [...shopFonts, '/assets/shop/changing-mat.jpg', '/assets/shop/trampoline.jpg'],
    usage: `<script setup lang="ts">
import ShopProductCard from './library/shop/ShopProductCard.vue'
</script>

<template>
  <ShopProductCard
    name="Baby Changing Mat"
    store="Gathre"
    image="/assets/shop/changing-mat.jpg"
    :price="160"
    currency="HKD"
    @update:saved="saved => console.log(saved)"
    @select="name => console.log(name)"
  />
</template>`,
    props: [
      { name: 'name', label: 'Product name', type: 'text', default: 'Baby Changing Mat', description: '商品名称，同时用于图片替代文本和打开按钮的无障碍标签。' },
      { name: 'store', label: 'Store', type: 'text', default: 'Gathre', description: '商品所属店铺名称。' },
      { name: 'image', label: 'Image', type: 'select', default: '/assets/shop/changing-mat.jpg', options: ['/assets/shop/changing-mat.jpg', '/assets/shop/trampoline.jpg'], description: '商品图片地址；加载失败时显示店铺名称。' },
      { name: 'price', label: 'Price', type: 'number', default: 160, min: 0, max: 10000, step: 10, description: '商品当前价格，使用 Intl.NumberFormat 格式化。' },
      { name: 'previousPrice', label: 'Previous price', type: 'number', default: 0, min: 0, max: 10000, step: 10, description: '原价高于当前价时，显示删除线原价和自动计算的折扣。' },
      { name: 'currency', label: 'Currency', type: 'select', default: 'HKD', options: ['HKD', 'USD', 'EUR', 'GBP'], description: 'ISO 4217 货币代码。' },
      { name: 'showRating', label: 'Show rating', type: 'boolean', default: true, description: '显示评分与评价数量。' },
      { name: 'initialSaved', label: 'Saved', type: 'boolean', default: false, description: '初始收藏状态；交互时触发 update:saved。' },
    ],
    background: '#f7f7f8',
    foreground: '#080808',
  },
  {
    id: 'shop-category-rail',
    title: 'Category Explorer',
    summary: '保留 Shop 分类目录的图片四宫格与圆角裁切，封装为可切换分类的浏览器。支持方向键、Home/End、上一组下一组，以及带分类上下文的 select 事件。',
    site: 'shop',
    category: 'Navigation',
    loadComponent: () => import('../library/shop/ShopCategoryRail.vue'),
    tags: ['Categories', 'Tabs', 'Image', 'Navigation'],
    source: 'shop.app/src/App.vue:1678',
    sourceKind: 'adapted',
    files: ['library/shop/ShopCategoryRail.vue', 'library/shop/shopCategories.ts'],
    assets: [...shopFonts, '/assets/shop/dresses.png', '/assets/shop/shirts.png', '/assets/shop/sneakers.png', '/assets/shop/pants.png', '/assets/shop/blankets.png', '/assets/shop/rugs.png', '/assets/shop/fragrances.png', '/assets/shop/appliances.png'],
    usage: `<script setup lang="ts">
import ShopCategoryRail from './library/shop/ShopCategoryRail.vue'
import { shopCategories } from './library/shop/shopCategories'
</script>

<template>
  <ShopCategoryRail
    title="Explore categories"
    active-category="Women"
    :groups="shopCategories"
    @select="(item, group) => console.log(group, item.name)"
  />
</template>`,
    props: [
      { name: 'title', label: 'Title', type: 'text', default: 'Explore categories', description: '分类区域标题及无障碍名称。' },
      { name: 'activeCategory', label: 'Category', type: 'select', default: 'Women', options: ['Women', 'Home'], description: '当前分类名称；可通过 groups 传入任意分类与图片。' },
      { name: 'showNavigation', label: 'Arrow controls', type: 'boolean', default: true, description: '显示上一组与下一组的循环切换按钮。' },
    ],
    background: '#ffffff',
    foreground: '#080808',
  },
]
