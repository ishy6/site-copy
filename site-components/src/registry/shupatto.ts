import type { ComponentEntry } from './types'
import { foldSheets } from '../library/shupatto/foldSheets'
import { products } from '../library/shupatto/products'
import { regions } from '../library/shupatto/regions'

const fonts = ['/assets/shupatto/tt-fors.woff2']
const productAssets = [...fonts, ...products.flatMap(product => product.colors.map(color => color.image))]
export const shupattoEntries: ComponentEntry[] = [
  {
    id: 'shupatto-fold-sequence', title: 'Photographic Fold Sequence', summary: '从首页真实逐帧素材抽出折叠播放器，支持播放、暂停、重置和进度拖动。使用本地图集，保持照片中的真实折叠过程。', site: 'shupatto', category: 'Media', loadComponent: () => import('../library/shupatto/FoldSequence.vue'),
    source: 'prod-raw.shupatto.com/public/reference/home.json (home sequence 1-02); public/assets/231221/data/sequence2/pc_large/1-02', sourceKind: 'adapted', tags: ['Sequence', 'Sprite', 'Folding', '折叠'],
    files: ['library/shupatto/FoldSequence.vue', 'library/shupatto/foldSheets.ts'], assets: [...fonts, ...foldSheets],
    props: [{ name: 'title', label: '标题', type: 'text', default: 'One pull. Ready to go.' }, { name: 'initialProgress', label: '初始进度', type: 'number', default: 0, min: 0, max: 1, step: .05 }, { name: 'duration', label: '时长（秒）', type: 'number', default: 3, min: .3, max: 20, step: .1 }], background: '#e1e3e1',
    usage: `<script setup lang="ts">\nimport FoldSequence from './library/shupatto/FoldSequence.vue'\n</script>\n<template>\n  <FoldSequence :duration="3" @complete="console.info('Fold complete')" />\n</template>`,
  },
  {
    id: 'shupatto-product-palette', title: 'Product Color Palette', summary: '商品详情的椭圆画布、实物图、容量与配色色板。产品和颜色列表可替换，支持键盘切换、参数同步和详情事件。', site: 'shupatto', category: 'Commerce', loadComponent: () => import('../library/shupatto/ProductPalette.vue'),
    source: 'prod-raw.shupatto.com/public/reference/en__product__compactbag-m.json (.p_pd_fv, .p_pd_fvNavList)', sourceKind: 'adapted', tags: ['Product', 'Swatches', '配色'],
    files: ['library/shupatto/ProductPalette.vue', 'library/shupatto/products.ts'], assets: productAssets,
    props: [{ name: 'productId', label: '产品', type: 'select', default: 'compactbag-m', options: products.map(product => product.id) }, { name: 'initialColor', label: '初始颜色', type: 'number', default: 0, min: 0, max: 2 }, { name: 'showDetails', label: '详情按钮', type: 'boolean', default: true }], background: '#e8e8e8',
    usage: `<script setup lang="ts">\nimport ProductPalette from './library/shupatto/ProductPalette.vue'\n</script>\n<template>\n  <ProductPalette product-id="compactbag-m" @select="selection => console.info(selection.product.id, selection.color.id)" />\n</template>`,
  },
  {
    id: 'shupatto-product-lineup', title: 'Product Family Lineup', summary: '抽象 Shupatto 的产品家族和椭圆商品图，以可替换产品列表呈现 Standard/Recycled 分类与容量信息。', site: 'shupatto', category: 'Commerce', loadComponent: () => import('../library/shupatto/ProductLineup.vue'),
    source: 'prod-raw.shupatto.com/public/reference/en__product__compactbag-m.json (.p_pd_family); public/reference/en__product.json', sourceKind: 'adapted', tags: ['Catalog', 'Filter', '产品家族'],
    files: ['library/shupatto/ProductLineup.vue', 'library/shupatto/products.ts'], assets: productAssets,
    props: [{ name: 'title', label: '标题', type: 'text', default: 'Lineup' }, { name: 'initialCategory', label: '产品家族', type: 'select', default: 'All', options: ['All', 'Standard', 'Recycled'] }], background: '#e8e8e8',
    usage: `<script setup lang="ts">\nimport ProductLineup from './library/shupatto/ProductLineup.vue'\n</script>\n<template>\n  <ProductLineup @select="product => console.info(product.id)" />\n</template>`,
  },
  {
    id: 'shupatto-store-directory', title: 'Regional Store Directory', summary: '从真实 Shoplist 提取 23 个地区的零售商资料，封装地区选择、名称过滤、空结果和外部商店链接。地区与商店数据可注入。', site: 'shupatto', category: 'Navigation', loadComponent: () => import('../library/shupatto/StoreDirectory.vue'),
    source: 'prod-raw.shupatto.com/public/reference/en__shoplist.json (.p_s_dealerUnit)', sourceKind: 'adapted', tags: ['Directory', 'Search', 'Region', '门店'],
    files: ['library/shupatto/StoreDirectory.vue', 'library/shupatto/regions.ts'], assets: fonts,
    props: [{ name: 'title', label: '标题', type: 'text', default: 'Shoplist' }, { name: 'initialRegion', label: '初始地区', type: 'select', default: 'JAPAN', options: regions.map(region => region.name) }], background: '#e8e8e8',
    usage: `<script setup lang="ts">\nimport StoreDirectory from './library/shupatto/StoreDirectory.vue'\n</script>\n<template>\n  <StoreDirectory initial-region="JAPAN" @region-change="region => console.info(region)" />\n</template>`,
  },
  {
    id: 'shupatto-oval-navigation', title: 'Oval Menu Navigation', summary: '从 Shupatto 全站菜单抽出椭圆按钮、主导航和语言选择，支持键盘关闭与焦点归还。链接和语言行为交由宿主管理。', site: 'shupatto', category: 'Navigation', loadComponent: () => import('../library/shupatto/OvalNavigation.vue'),
    source: 'prod-raw.shupatto.com/public/reference/home.json (.c_ham, .js_menu)', sourceKind: 'adapted', tags: ['Menu', 'Language', '导航'],
    files: ['library/shupatto/OvalNavigation.vue'], assets: fonts,
    props: [{ name: 'initiallyOpen', label: '展开菜单', type: 'boolean', default: true }, { name: 'language', label: '语言', type: 'select', default: 'EN', options: ['EN', 'JA'] }], background: '#e8e8e8',
    usage: `<script setup lang="ts">\nimport { ref } from 'vue'\nimport OvalNavigation from './library/shupatto/OvalNavigation.vue'\nconst language = ref('EN')\nconst links = [{ label: 'Lineup', href: '/products' }, { label: 'About', href: '/about' }]\n</script>\n<template>\n  <OvalNavigation :links="links" :language="language" @language-change="language = $event" />\n</template>`,
  },
]
