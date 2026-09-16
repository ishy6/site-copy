# 21TSI 品牌选择器：BrandPortfolio

组件 ID：`tsi-brand-portfolio`。源码：[BrandPortfolio.vue](../src/library/tsi/BrandPortfolio.vue#L1)。左侧品牌列表选择后同步更换右侧logo、类别、简介及业务入口；图片区是受选择状态驱动的详情，不是独立单图展示。

## Props 与事件

<!-- source: src/library/tsi/BrandPortfolio.vue#L4-L14 -->
```ts
export interface PortfolioBrand { id: string; name: string; logo: string; category: string; description: string }
const props = withDefaults(defineProps<{ title?: string; initialIndex?: number; cta?: string; brands?: PortfolioBrand[] }>(), {
  title: 'A collective ambition.', initialIndex: 0, cta: 'Explore brand',
  brands: () => [
    { id: 'maddle', name: 'Maddle', logo: '/assets/tsi/maddle.svg', category: 'PADDLEBOARDS', description: 'A new perspective on time spent outside.' },
    { id: 'mw', name: 'Montreal Weights', logo: '/assets/tsi/mw.svg', category: 'FITNESS EQUIPMENT', description: 'A stronger everyday, built around movement.' },
    { id: 'ascend', name: 'Ascend', logo: '/assets/tsi/ascend.svg', category: 'ACTIVE LIVING', description: 'Technology and ambition moving together.' },
    { id: 'nordik', name: 'Nordik', logo: '/assets/tsi/nordik.svg', category: 'RECOVERY', description: 'Space to reset. Energy to move forward.' },
  ],
})
const emit = defineEmits<{ select: [brand: PortfolioBrand]; change: [brand: PortfolioBrand] }>()
```

| prop | 默认 | 说明 |
| --- | --- | --- |
| `title:string` | A collective ambition. | 组件标题 |
| `initialIndex:number` | 0 | 初始及外部同步序号，要求整数 |
| `cta:string` | Explore brand | 详情入口按钮文字 |
| `brands:PortfolioBrand[]` | Maddle/Montreal Weights/Ascend/Nordik | 本地四品牌logo及展示摘要 |

PortfolioBrand所有字段必填：id、name、logo、category、description均为string。`change(brand)`在点击左侧品牌时发完整对象；`select(brand)`在点击右侧CTA时发当前对象。没有href字段，也没有内部真实品牌导航。

## 状态推导与更新

<!-- source: src/library/tsi/BrandPortfolio.vue#L15-L20 -->
```ts
const id = useId()
const index = ref(Math.max(0,Math.min(props.initialIndex,props.brands.length-1)))
const active = computed(() => props.brands[index.value])
watch(() => props.initialIndex, value => { index.value = Math.max(0,Math.min(value,props.brands.length-1)) })
watch(() => props.brands.length, value => { index.value = Math.max(0,Math.min(index.value,value-1)) })
function choose(value: number) { index.value = value; if (active.value) emit('change', active.value) }
```

index保存当前序号，active computed从brands取对象；不额外保存name/logo副本。因此点击品牌只改一次index，所有详情字段在同一渲染周期同步。

choose(value)直接赋index并在active存在时emit change；重复点当前项仍emit。外部initialIndex和数组长度的watch负责钳制，但不发change。列表排序或同长度替换不按id保持旧品牌，而按原index展示新位置对象。

钳制是Math.max/min，没有整数或有限值校验；初始NaN/小数可使active不存在。brands=[]时index0、active undefined，详情区域不渲染，导航列表也为空；没有单独空状态文案。

## 点击到DOM的链路

<!-- source: src/library/tsi/BrandPortfolio.vue#L22-L22 -->
```vue
<template><section class="brand-portfolio" :aria-label="title"><header><span>21TSI / OUR BRANDS</span><h3>{{ title }}</h3></header><div class="portfolio-layout"><nav aria-label="Portfolio brands"><button v-for="(brand,position) in brands" :key="brand.id" type="button" :aria-pressed="position === index" :aria-controls="`${id}-brand`" @click="choose(position)"><span>.{{ String(position+1).padStart(2,'0') }}</span><strong>{{ brand.name }}</strong><ArrowUpRight :size="15" /></button></nav><div v-if="active" :id="`${id}-brand`" class="brand-detail"><div class="brand-logo"><img :key="active.id" :src="active.logo" :alt="active.name"></div><span>{{ active.category }}</span><p>{{ active.description }}</p><button type="button" @click="emit('select',active)">{{ cta }}<ArrowUpRight :size="16" /></button></div></div></section></template>
```

1. 点击第3个nav button → choose(2) → index=2。
2. active变Ascend对象，左侧对应aria-pressed=true。
3. 右侧img src/alt、类别与description一起取active。
4. 点击右侧CTA才emit select(active)，不会自动打开品牌链接。

useId连接所有品牌按钮的aria-controls与唯一brand-detail节点。它没有role=tablist/tab，采用普通nav中的按下按钮；每个按钮都可Tab聚焦。没有自定义左右/上下键、焦点陷阱或切换后强制focus详情。

img使用key=active.id。ID变更会替换img节点并重播brand-reveal 0.3秒淡入；仅在同id上改logo地址则不会因key变化重新建节点。减少动态效果通过媒体查询animation:none。

## 样式与交互范围

桌面portfolio-layout为两列等宽minmax(0,1fr)，gap33px；450px以下一列。logo容器高度98px、img宽70%高50px、object-fit:contain，最后一段样式覆盖为浅色背景。

<!-- source: src/library/tsi/BrandPortfolio.vue#L28-L30 -->
```vue
<style scoped>
.brand-logo{background:#f4f5f3}
</style>
```

未选中列表灰绿、选中接近白，细线分隔保持21TSI风格。按钮cursor固定pointer，focus-visible浅绿色轮廓。没有drag/drop、触摸滑动、mousemove跟随或动态cursor。logo加载无失败替代。

## 业务接入示例

示例放在 `src/examples/`，业务路由表与展示数据分开。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import BrandPortfolio, { type PortfolioBrand } from '../library/tsi/BrandPortfolio.vue'

const brands: PortfolioBrand[] = [
  { id: 'maddle', name: 'Maddle', logo: '/assets/tsi/maddle.svg',
    category: 'PADDLEBOARDS', description: '水上运动装备。' },
  { id: 'ascend', name: 'Ascend', logo: '/assets/tsi/ascend.svg',
    category: 'ACTIVE LIVING', description: '运动与科技。' },
]
const route = ref('')
const routes: Record<string, string> = { maddle: '/brands/maddle', ascend: '/brands/ascend' }
function open(brand: PortfolioBrand) { route.value = routes[brand.id] ?? '' }
</script>
<template>
  <BrandPortfolio :brands="brands" title="品牌组合" @select="open" />
  <a v-if="route" :href="route">进入选中品牌</a>
</template>
```

## 测试事实

[core.test.ts](../src/library/tsi/core.test.ts#L26) 选择索引2，断言img src为本地ascend.svg，再按详情按钮验证select对象id=ascend。测试未覆盖change事件重复发出、空数组、动态重排、焦点顺序或logo失败。

依赖Vue、lucide的ArrowUpRight、本地SaansVF字体。没有计时器、全局监听或异步请求；卸载仅由Vue清理watch。默认简介是展示摘要，不应作为品牌业务API返回值使用。
