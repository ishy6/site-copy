import type { ComponentEntry } from './types'
import { showcaseItems } from '../library/osmo/showcases'

const fonts = ['/assets/osmo/haffer.ttf']
const motionFiles = ['library/osmo/MotionButton.vue', 'library/osmo/ButtonLabel.vue']
const toolkitAssets = ['/assets/osmo/toolkit-vault.avif', '/assets/osmo/toolkit-course.avif', '/assets/osmo/toolkit-buttons.avif', ...fonts]
export const osmoCoreEntries: ComponentEntry[] = [
  {
    id: 'osmo-expanding-navigation', title: 'Expanding Navigation', summary: '从 Osmo 浮动导航抽出分组菜单和课程预览，支持展开状态、Escape 关闭、焦点归还及业务导航事件。', site: 'osmo', category: 'Navigation', loadComponent: () => import('../library/osmo/ExpandingNavigation.vue'),
    source: 'osmo.supply/src/App.vue:984 (.header-shell, .menu-expansion)', sourceKind: 'adapted', tags: ['Menu', 'Navigation', '导航'],
    files: ['library/osmo/ExpandingNavigation.vue', ...motionFiles], assets: [...fonts, '/assets/osmo/toolkit-course.avif'],
    props: [{ name: 'brand', label: '品牌', type: 'text', default: 'Osmo' }, { name: 'initiallyOpen', label: '展开菜单', type: 'boolean', default: true }, { name: 'joinLabel', label: '操作文案', type: 'text', default: 'Join' }], background: '#dcd5fa',
    usage: `<script setup lang="ts">\nimport ExpandingNavigation from './library/osmo/ExpandingNavigation.vue'\nconst links = [{ label: 'Resources', href: '/resources', group: 'Products' }]\n</script>\n<template>\n  <ExpandingNavigation :items="links" :initially-open="false" @join="console.info('Join selected')" />\n</template>`,
  },
  {
    id: 'osmo-toolkit-carousel', title: 'Toolkit Carousel', summary: '工具包的分页标签、产品文案和图片组合。支持列表注入、键盘选页、触摸切页和发现事件，价格与路由交给宿主。', site: 'osmo', category: 'Media', loadComponent: () => import('../library/osmo/ToolkitCarousel.vue'),
    source: 'osmo.supply/src/App.vue:1162 (.product-tabs, .product-stage)', sourceKind: 'adapted', tags: ['Carousel', 'Tabs', '轮播'],
    files: ['library/osmo/ToolkitCarousel.vue', 'library/osmo/toolkit.ts', 'library/osmo/carousel.ts', ...motionFiles], assets: toolkitAssets,
    props: [{ name: 'title', label: '标题', type: 'text', default: 'The toolkit' }, { name: 'initialIndex', label: '选中产品', type: 'number', default: 0, min: 0, max: 2 }], background: '#ededea',
    usage: `<script setup lang="ts">\nimport ToolkitCarousel from './library/osmo/ToolkitCarousel.vue'\nimport { toolkitItems } from './library/osmo/toolkit'\n</script>\n<template>\n  <ToolkitCarousel :items="toolkitItems" @select="item => console.info(item.id)" />\n</template>`,
  },
  {
    id: 'osmo-stacked-gallery', title: 'Stacked Showcase Gallery', summary: '抽象 Made with Osmo 的倾斜卡片堆叠与项目切换。支持数据替换、方向键、手势、前后按钮与减少动效偏好。', site: 'osmo', category: 'Media', loadComponent: () => import('../library/osmo/StackedGallery.vue'),
    source: 'osmo.supply/src/App.vue:1276 (.showcase-stage, .showcase-controls)', sourceKind: 'adapted', tags: ['Stack', 'Gallery', 'Gesture', '轮播'],
    files: ['library/osmo/StackedGallery.vue', 'library/osmo/showcases.ts', 'library/osmo/carousel.ts'], assets: [...fonts, ...showcaseItems.map(item => item.image)],
    props: [{ name: 'title', label: '标题', type: 'text', default: 'Made to move.' }, { name: 'initialIndex', label: '选中卡片', type: 'number', default: 0, min: 0, max: 2 }], background: '#dcd5fa',
    usage: `<script setup lang="ts">\nimport StackedGallery from './library/osmo/StackedGallery.vue'\nimport { showcaseItems } from './library/osmo/showcases'\n</script>\n<template>\n  <StackedGallery :items="showcaseItems" @select="item => console.info(item.id, item.href)" />\n</template>`,
  },
  {
    id: 'osmo-pricing-plans', title: 'Membership Pricing', summary: '组合已提取的计费切换和旋转按钮，保留 Solo/Team 双套餐层级。价格、周期和选择回调共享同一份状态。', site: 'osmo', category: 'Commerce', loadComponent: () => import('../library/osmo/PricingPlans.vue'),
    source: 'osmo.supply/src/App.vue:1254 (.pricing-section)', sourceKind: 'adapted', tags: ['Pricing', 'Billing', '定价'],
    files: ['library/osmo/PricingPlans.vue', 'library/osmo/BillingSwitch.vue', ...motionFiles], assets: [...fonts, '/assets/osmo/brisa.woff2'],
    props: [{ name: 'initialBilling', label: '计费周期', type: 'select', default: 'annual', options: ['annual', 'quarterly'] }, { name: 'resources', label: '资源数量', type: 'number', default: 212, min: 0, max: 9999 }], background: '#201d1d', foreground: '#fff',
    usage: `<script setup lang="ts">\nimport PricingPlans from './library/osmo/PricingPlans.vue'\n</script>\n<template>\n  <div style="background: #201d1d; padding: 24px">\n    <PricingPlans @select="plan => console.info(plan.id, plan.billing, plan.monthlyPrice)" />\n  </div>\n</template>`,
  },
  {
    id: 'osmo-testimonial-slider', title: 'Community Testimonials', summary: '从 Osmo 评价区抽取肖像、引言与纵向切换控件，自动播放可暂停，并在悬停、聚焦及减少动效时停止。', site: 'osmo', category: 'Media', loadComponent: () => import('../library/osmo/TestimonialSlider.vue'),
    source: 'osmo.supply/src/App.vue:1228 (.testimonial-section)', sourceKind: 'adapted', tags: ['Testimonial', 'Autoplay', '评价'],
    files: ['library/osmo/TestimonialSlider.vue', 'library/osmo/carousel.ts'], assets: [...fonts, '/assets/osmo/dang.avif', '/assets/osmo/cassie.avif'],
    props: [{ name: 'initialIndex', label: '选中评价', type: 'number', default: 0, min: 0, max: 1 }, { name: 'autoplay', label: '自动切换', type: 'boolean', default: false }, { name: 'interval', label: '切换间隔（毫秒）', type: 'number', default: 5000, min: 1000, max: 20000, step: 500 }], background: '#e8e6e3',
    usage: `<script setup lang="ts">\nimport TestimonialSlider from './library/osmo/TestimonialSlider.vue'\n</script>\n<template>\n  <TestimonialSlider :autoplay="true" :interval="5000" @change="index => console.info(index)" />\n</template>`,
  },
  {
    id: 'osmo-reel-dialog', title: 'Reel Lightbox', summary: '保留 Osmo 影像入口和弹层。点击后打开原生模态对话框，提供原生视频控制、Escape 关闭、暂停清理与焦点恢复。', site: 'osmo', category: 'Media', loadComponent: () => import('../library/osmo/ReelDialog.vue'),
    source: 'osmo.supply/src/App.vue:1078 (.reel-player), :1350 (.reel-modal)', sourceKind: 'adapted', tags: ['Video', 'Dialog', 'Lightbox', '弹窗'],
    files: ['library/osmo/ReelDialog.vue'], assets: [...fonts, '/assets/osmo/reel.mp4', '/assets/osmo/carousel.avif'],
    props: [{ name: 'title', label: '入口标题', type: 'text', default: 'Play the reel.' }], background: '#ededea',
    usage: `<script setup lang="ts">\nimport ReelDialog from './library/osmo/ReelDialog.vue'\n</script>\n<template>\n  <ReelDialog title="Play the reel." @open-change="open => console.info(open)" />\n</template>`,
  },
]
