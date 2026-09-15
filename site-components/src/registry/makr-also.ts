import type { ComponentEntry } from './types'

const makrAssets = [
  '/assets/makr/MKR_FLD_PCH_Persp_BRWN.avif',
  '/assets/makr/MKR_FLD_PCH_Persp_BLK.avif',
  '/assets/makr/MKR_FLD_PCH_Persp_GRN.avif',
  '/assets/makr/soehne-web-buch.woff2',
]
const alsoFonts = ['/assets/also/ABCCameraPlainVariable.woff2', '/assets/also/SerialC-Bold.woff2']
const beltPhotos = ['/assets/makr/tri-glide-front.webp', '/assets/makr/tri-glide-detail.webp', '/assets/makr/tri-glide-back.webp']
const framePhotos = ['/assets/also/frame-solo.png', '/assets/also/frame-utility.png', '/assets/also/frame-bench.png']
const packagePhotos = ['/assets/also/package-road.png', '/assets/also/package-all-terrain.png']
const cameraFont = '/assets/also/ABCCameraPlainVariable.woff2'
const makrFont = '/assets/makr/soehne-web-buch.woff2'

export const makrAlsoEntries: ComponentEntry[] = [
  {
    id: 'makr-product-gallery', title: 'Product Gallery',
    summary: '将 MAKR 商品详情中的多视角图片抽象为独立图库，提供缩略图、方向键切换与原生对话框放大。图片列表由 photos 传入。',
    site: 'makr', category: 'Media', loadComponent: () => import('../library/makr/ProductGallery.vue'), tags: ['Gallery', 'Product', 'Zoom', 'Keyboard'],
    source: 'makr.com/src/reference.ts: productHtml (#product-image-container, #supporting.images); makr.com/public/reference/products.json: /green-tri-glide-belt productImages; makr.com/public/reference/original.css: .product-images-and-description',
    sourceKind: 'adapted', files: ['library/makr/ProductGallery.vue', 'library/makr/gallery-data.ts'], assets: [...beltPhotos, makrFont],
    usage: `<script setup lang="ts">\nimport ProductGallery from './library/makr/ProductGallery.vue'\nimport { triGlidePhotos } from './library/makr/gallery-data'\n</script>\n\n<template>\n  <ProductGallery title="Tri-Glide Belt" :photos="triGlidePhotos" :show-thumbnails="true" />\n</template>`,
    props: [
      { name: 'title', label: '商品标题', type: 'text', default: 'Tri-Glide Belt', description: '商品标题及图库无障碍名称。' },
      { name: 'initialIndex', label: '初始图片', type: 'number', default: 0, min: 0, max: 2, step: 1, description: '从 0 开始的初始图片索引，超出范围自动收敛。' },
      { name: 'showThumbnails', label: '显示缩略图', type: 'boolean', default: true, description: '隐藏缩略图时仍可使用箭头与键盘切图。' },
    ], background: '#faf9f6', foreground: '#1c1717',
  },
  {
    id: 'makr-variant-purchase', title: 'Variant Purchase',
    summary: '提取 MAKR 详情页的规格、尺寸、价格与购买操作。数量有边界，缺货规格无法提交；addItem 支持真实异步接入，预览只触发选择事件。',
    site: 'makr', category: 'Commerce', loadComponent: () => import('../library/makr/VariantPurchase.vue'), tags: ['Variant', 'Size', 'Quantity', 'Async'],
    source: 'makr.com/src/reference.ts: productHtml (#mcs.item.wrapper, #product.dimensions, #product.price.block); makr.com/src/App.vue: addToCart; makr.com/public/reference/products.json: /green-tri-glide-belt variantData',
    sourceKind: 'adapted', files: ['library/makr/VariantPurchase.vue', 'library/makr/purchase-data.ts'], assets: [beltPhotos[0]!, makrFont],
    usage: `<script setup lang="ts">\nimport { ref } from 'vue'\nimport VariantPurchase from './library/makr/VariantPurchase.vue'\nimport type { PurchaseSelection } from './library/makr/purchase-data'\n\nconst selection = ref<PurchaseSelection | null>(null)\nfunction add(item: PurchaseSelection) { selection.value = item }\n</script>\n\n<template>\n  <VariantPurchase :max-quantity="10" @add="add" />\n  <output v-if="selection">{{ selection.quantity }} selected</output>\n</template>`,
    props: [
      { name: 'title', label: '商品标题', type: 'text', default: 'Tri-Glide Belt', description: '购买区域标题。' },
      { name: 'finish', label: '材质名称', type: 'text', default: 'Army Green', description: '商品标题下的材质或颜色。' },
      { name: 'initialVariant', label: '初始规格', type: 'select', default: '', options: ['', '4554', '4555', '4556'], description: '空值要求用户先选择；其他值对应源站的规格 ID。' },
      { name: 'maxQuantity', label: '数量上限', type: 'number', default: 10, min: 1, max: 99, step: 1, description: '按钮和数字输入共用数量限制。' },
      { name: 'disabled', label: '禁用操作', type: 'boolean', default: false, description: '禁用规格、数量与提交。' },
    ], background: '#faf9f6', foreground: '#1c1717',
  },
  {
    id: 'makr-shopping-bag', title: 'Shopping Bag',
    summary: '从 MAKR 购物袋抽象的购物明细面板，数量更新、移除、总额和空状态保持同步。items 通过 update:items 回传，结算通过 checkout 事件或 prepareCheckout 回调接入。',
    site: 'makr', category: 'Commerce', loadComponent: () => import('../library/makr/ShoppingBag.vue'), tags: ['Cart', 'Quantity', 'Checkout', 'Async'],
    source: 'makr.com/src/App.vue: renderCart, cartTotal, onChange; makr.com/public/reference/shell.html: #minicart-drawer; makr.com/public/reference/original.css: .minicart',
    sourceKind: 'adapted', files: ['library/makr/ShoppingBag.vue', 'library/makr/bag-data.ts'], assets: [beltPhotos[0]!, makrAssets[0]!, makrFont],
    usage: `<script setup lang="ts">\nimport { ref } from 'vue'\nimport ShoppingBag from './library/makr/ShoppingBag.vue'\nimport { sampleBag } from './library/makr/bag-data'\n\nconst items = ref(sampleBag.map(item => ({ ...item })))\nconst checkoutItems = ref<typeof items.value>([])\n</script>\n\n<template>\n  <ShoppingBag v-model:items="items" @checkout="checkoutItems = $event" />\n</template>`,
    props: [
      { name: 'title', label: '面板标题', type: 'text', default: 'Shopping bag', description: '购物袋标题。' },
      { name: 'shippingNote', label: '运费文案', type: 'text', default: 'Shipping calculated at checkout.', description: '总额下方运费说明。' },
      { name: 'empty', label: '空购物袋', type: 'boolean', default: false, description: '直接预览空状态，清空后禁止结算。' },
    ], background: '#faf9f6', foreground: '#1c1717',
  },
  {
    id: 'also-bike-configurator', title: 'Modular Bike Configurator',
    summary: '提取 ALSO 原选配页的车架、骑行套件和驾驶舱三步流程，保留模块图片、尺寸联动与价格增量。汇总后通过 save 或 saveBuild 交付配置。',
    site: 'also', category: 'Commerce', loadComponent: () => import('../library/also/ModularBikeConfigurator.vue'), tags: ['Configurator', 'Stepper', 'Product', 'Modular'],
    source: 'ridealso.com/public/reference/products__tm-b--configure.html: configurator-app, script[type="configurator/config"], .configurator-step, .configurator-option; ridealso.com/public/reference/configurator-route.js',
    sourceKind: 'adapted',
    files: ['library/also/ModularBikeConfigurator.vue', 'library/also/frame-data.ts', 'library/also/ride-data.ts', 'library/also/cockpit-data.ts'],
    assets: [...framePhotos, ...packagePhotos, '/assets/also/cockpit-standard.png', '/assets/also/cockpit-sport.png', ...alsoFonts],
    usage: `<script setup lang="ts">\nimport { ref } from 'vue'\nimport ModularBikeConfigurator, { type BikeBuild } from './library/also/ModularBikeConfigurator.vue'\n\nconst savedBuild = ref<BikeBuild | null>(null)\nfunction save(build: BikeBuild) { savedBuild.value = build }\n</script>\n\n<template>\n  <ModularBikeConfigurator :base-price="3500" @save="save" />\n  <output v-if="savedBuild">{{ savedBuild.frame.label }} / {{ savedBuild.size.label }}</output>\n</template>`,
    props: [
      { name: 'title', label: '标题', type: 'text', default: 'Build your TM-B', description: '选配区域的标题。' },
      { name: 'basePrice', label: '基础价格', type: 'number', default: 3500, min: 0, max: 20000, step: 50, description: 'USD 基础价格，叠加所选模块的差价。' },
      { name: 'initialFrame', label: '初始车架', type: 'select', default: 'solo', options: ['solo', 'utility', 'bench'], description: 'Bench 只有 Universal 尺寸；切换时自动纠正无效尺寸。' },
      { name: 'initialStep', label: '初始步骤', type: 'number', default: 0, min: 0, max: 3, step: 1, description: '0 车架、1 骑行套件、2 驾驶舱、3 汇总。' },
      { name: 'disabled', label: '禁用操作', type: 'boolean', default: false, description: '禁止修改配置和保存。' },
    ], background: '#fcf2e8', foreground: '#111111',
  },
  {
    id: 'also-frame-fit', title: 'Frame Fit Guide',
    summary: '将 ALSO 车架尺寸对照表抽象为可交互选型工具。支持厘米/英寸切换、身高区间匹配、重叠尺寸建议与越界状态，选型通过 select 回传。',
    site: 'also', category: 'Commerce', loadComponent: () => import('../library/also/FrameFitGuide.vue'), tags: ['Sizing', 'Product', 'Units', 'Range'],
    source: 'ridealso.com/public/reference/products__tm-b--configure.html: dialog[data-modal="topframes"] (Solo/Utility/Bench size and load tables, size-down recommendation)',
    sourceKind: 'adapted', files: ['library/also/FrameFitGuide.vue', 'library/also/frame-data.ts'], assets: [...framePhotos, cameraFont],
    usage: `<script setup lang="ts">\nimport { ref } from 'vue'\nimport FrameFitGuide from './library/also/FrameFitGuide.vue'\n\nconst chosenSize = ref('')\n</script>\n\n<template>\n  <FrameFitGuide :initial-height="170" initial-frame="solo" @select="chosenSize = $event.sizeId" />\n  <output>{{ chosenSize }}</output>\n</template>`,
    props: [
      { name: 'title', label: '标题', type: 'text', default: 'Find your fit.', description: '尺寸工具标题。' },
      { name: 'initialFrame', label: '默认车架', type: 'select', default: 'solo', options: ['solo', 'utility', 'bench'], description: '决定尺寸区间和承重信息。' },
      { name: 'initialHeight', label: '身高（厘米）', type: 'number', default: 170, min: 120, max: 220, step: 1, description: '内部以厘米保存；切换显示单位不会改变真实身高。' },
      { name: 'showLoad', label: '显示承重', type: 'boolean', default: true, description: '显示原站车架及货架承重数据。' },
    ], background: '#fcf2e8', foreground: '#111111',
  },
  {
    id: 'also-ride-comparison', title: 'Ride Package Comparison',
    summary: '从 ALSO 骑行套件说明中提炼的规格比较表，支持差异筛选、价格显示、可用状态和选择事件。轮胎、踏板及模式直接来自原站配置说明。',
    site: 'also', category: 'Commerce', loadComponent: () => import('../library/also/RidePackageComparison.vue'), tags: ['Comparison', 'Specifications', 'Product', 'Selection'],
    source: 'ridealso.com/public/reference/products__tm-b--configure.html: dialog[data-modal="configurator-packages"] and .configurator-step Select Ride Package; dialog[data-modal="dreamride"] Dynamic Riding',
    sourceKind: 'adapted', files: ['library/also/RidePackageComparison.vue', 'library/also/ride-data.ts'], assets: [...packagePhotos, cameraFont],
    usage: `<script setup lang="ts">\nimport { ref } from 'vue'\nimport RidePackageComparison from './library/also/RidePackageComparison.vue'\nimport type { RidePackage } from './library/also/ride-data'\n\nconst selected = ref<RidePackage | null>(null)\n</script>\n\n<template>\n  <RidePackageComparison @select="selected = $event" />\n  <output v-if="selected">{{ selected.label }}</output>\n</template>`,
    props: [
      { name: 'title', label: '标题', type: 'text', default: 'Choose your terrain.', description: '规格比较区域标题。' },
      { name: 'initialPackage', label: '默认套件', type: 'select', default: 'road', options: ['road', 'all-terrain'], description: '初始化选中的套件。' },
      { name: 'differencesOnly', label: '只看差异', type: 'boolean', default: false, description: '隐藏所有套件值完全一致的规格行。' },
      { name: 'showPrices', label: '显示差价', type: 'boolean', default: true, description: '显示相对基础车型的价格增量。' },
    ], background: '#fcf2e8', foreground: '#111111',
  },
  {
    id: 'makr-product-finish',
    title: 'Product Finish Card',
    summary: '将 MAKR 商品目录的留白、图片与详情页材质选择抽象为商品卡。色板切换同步更新图片，支持缺货状态与选择事件。',
    site: 'makr', category: 'Commerce', loadComponent: () => import('../library/makr/ProductFinishCard.vue'),
    tags: ['Product', 'Swatches', 'Image', 'Minimal'],
    source: 'makr.com/src/reference.ts: collectionHtml, productHtml; makr.com/public/reference/original.css: .productCollection, .product-description',
    sourceKind: 'adapted',
    files: ['library/makr/ProductFinishCard.vue', 'library/makr/catalog.ts'],
    assets: makrAssets,
    usage: `<script setup lang="ts">\nimport ProductFinishCard from './library/makr/ProductFinishCard.vue'\n\nconst addToSelection = (item: unknown) => console.log(item)\n</script>\n\n<template>\n  <ProductFinishCard title="Field Pouch" :price="88" initial-finish="brown" @add="addToSelection" />\n</template>`,
    props: [
      { name: 'title', label: '商品名称', type: 'text', default: 'Field Pouch', description: '显示在商品图片下方的名称。' },
      { name: 'subtitle', label: '产地文案', type: 'text', default: 'Made in the USA', description: '色板右侧的辅助信息。' },
      { name: 'price', label: '价格', type: 'number', default: 88, min: 0, max: 1000, step: 1, description: '商品金额，默认币种 USD。' },
      { name: 'initialFinish', label: '默认材质', type: 'select', default: 'brown', options: ['brown', 'black', 'fern'], description: '初始选中的材质，变更后同步更新预览。' },
      { name: 'showAction', label: '选择按钮', type: 'boolean', default: true, description: '是否显示触发 add 事件的操作按钮。' },
    ],
    background: '#faf9f6', foreground: '#1c1717',
  },
  {
    id: 'makr-catalog-search', title: 'Catalog Search',
    summary: '提取 MAKR 搜索结果的极简图片网格与细线输入框。支持多关键词即时过滤、清空、空结果以及独立商品数据。',
    site: 'makr', category: 'Commerce', loadComponent: () => import('../library/makr/CatalogSearch.vue'),
    tags: ['Search', 'Catalog', 'Filter', 'Minimal'],
    source: 'makr.com/src/components/SearchResults.vue; makr.com/src/App.vue: performSearch; makr.com/public/reference/original.css: .productCollection',
    sourceKind: 'adapted',
    files: ['library/makr/CatalogSearch.vue', 'library/makr/catalog.ts'], assets: makrAssets,
    usage: `<script setup lang="ts">\nimport CatalogSearch from './library/makr/CatalogSearch.vue'\nimport type { MakrProduct } from './library/makr/catalog'\n\nconst products: MakrProduct[] = [\n  { id: 'pouch', title: 'Field Pouch', finish: 'Brown', price: 88, image: '/assets/makr/MKR_FLD_PCH_Persp_BRWN.avif', href: 'https://makr.com/field-pouch-brwn' },\n]\n</script>\n\n<template>\n  <CatalogSearch :products="products" :show-prices="true" />\n</template>`,
    props: [
      { name: 'title', label: '顶部文案', type: 'text', default: 'Objects for everyday use.', description: '品牌标记旁的短文案。' },
      { name: 'placeholder', label: '搜索占位', type: 'text', default: 'Search objects', description: '输入框为空时的文字。' },
      { name: 'initialQuery', label: '搜索词', type: 'text', default: '', description: '按商品名称和材质匹配，多个词需要同时满足。' },
      { name: 'showPrices', label: '显示价格', type: 'boolean', default: true, description: '控制每个搜索结果的金额。' },
    ],
    background: '#faf9f6', foreground: '#1c1717',
  },
  {
    id: 'also-newsletter', title: 'Newsletter Form',
    summary: '抽象 ALSO 的紫色订阅区域，提供邮箱校验、同意选项和异步提交反馈。预览仅验证邮箱，传入 onSubscribe 后可接入真实服务。',
    site: 'also', category: 'Forms', loadComponent: () => import('../library/also/NewsletterForm.vue'),
    tags: ['Newsletter', 'Validation', 'Async', 'Pill'],
    source: 'ridealso.com/src/components/NewsletterForm.vue; ridealso.com/src/App.vue: .signup; ridealso.com/src/style.css: .signup, .newsletter-loading',
    sourceKind: 'adapted', files: ['library/also/NewsletterForm.vue'], assets: alsoFonts,
    usage: `<script setup lang="ts">\nimport NewsletterForm from './library/also/NewsletterForm.vue'\n\nasync function subscribe(email: string) {\n  const response = await fetch('/api/newsletter', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ email }),\n  })\n  if (!response.ok) throw new Error('Unable to subscribe. Please try again.')\n}\n</script>\n\n<template>\n  <NewsletterForm :on-subscribe="subscribe" />\n</template>`,
    props: [
      { name: 'title', label: '标题', type: 'text', default: 'Stay in the loop.', description: '订阅区域的主标题。' },
      { name: 'description', label: '副标题', type: 'text', default: 'Join our mailing list.', description: '标题下方的简短文案。' },
      { name: 'placeholder', label: '邮箱占位', type: 'text', default: 'EMAIL', description: '邮箱输入框占位文本。' },
      { name: 'buttonLabel', label: '提交文案', type: 'text', default: 'Submit', description: '尚未提交时按钮显示的内容。' },
      { name: 'background', label: '背景颜色', type: 'color', default: '#ac74fc', description: '订阅区域背景色。' },
      { name: 'disabled', label: '禁用表单', type: 'boolean', default: false, description: '禁用输入、勾选与提交。' },
    ],
    background: '#ac74fc', foreground: '#0b0b0b',
  },
]
