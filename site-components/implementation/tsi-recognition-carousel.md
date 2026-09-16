# 21TSI 业绩轮播：RecognitionCarousel

组件 ID：`tsi-recognition-carousel`。源码：[RecognitionCarousel.vue](../src/library/tsi/RecognitionCarousel.vue#L1)。将原站滚动业绩区改为用户可直接选择的轮播，以大型业绩文本、下方分段标签和前后按钮共享一个selected索引。

## 接口与默认数据

<!-- source: src/library/tsi/RecognitionCarousel.vue#L4-L13 -->
```ts
export interface RecognitionItem { label: string; headline: string; detail: string }
const props = withDefaults(defineProps<{ eyebrow?: string; initialIndex?: number; items?: RecognitionItem[] }>(), {
  eyebrow: 'Recognition', initialIndex: 0,
  items: () => [
    { label: 'Global Revenue', headline: 'Over 40M', detail: 'Bootstrapped in revenue without external investments.' },
    { label: 'Customer Base', headline: '100k customers', detail: 'Approaching a global community of sports-minded consumers.' },
    { label: 'Brand Recognition', headline: '7 & 8 figures', detail: 'Maddle, Montreal Weights, Ascend, Nordik, and more.' },
  ],
})
const emit = defineEmits<{ change: [index: number] }>()
```

| prop | 类型 | 默认与说明 |
| --- | --- | --- |
| `eyebrow` | string | Recognition，章节名称与section标签 |
| `initialIndex` | number | 0；传入合法整数索引 |
| `items` | RecognitionItem[] | Revenue、Customer Base、Brand Recognition三项 |

RecognitionItem包含label/headline/detail三个string，分别用于分页标签、大字业绩、补充描述。`change(index:number)`在select执行时发出；没有select业务入口事件、没有autoplay/interval。

## 初值钳制与循环选择

<!-- source: src/library/tsi/RecognitionCarousel.vue#L14-L25 -->
```ts
const id = useId()
const selected = ref(Math.max(0, Math.min(props.initialIndex, props.items.length - 1)))
const active = computed(() => props.items[selected.value])
watch(() => props.initialIndex, value => { selected.value = Math.max(0, Math.min(value, props.items.length - 1)) })
watch(() => props.items.length, value => { selected.value = Math.max(0, Math.min(selected.value, value - 1)) })
function select(index: number) { if (!props.items.length) return; selected.value = (index + props.items.length) % props.items.length; emit('change', selected.value) }
function keydown(event: KeyboardEvent, index: number) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  select(event.key === 'Home' ? 0 : event.key === 'End' ? props.items.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1))
  document.getElementById(`${id}-tab-${selected.value}`)?.focus()
}
```

初始化及prop更新使用Math.max/min钳制到[0,length−1]，而按钮选择使用模运算循环。三项时当前0点Previous传-1，加length后模得2；最后一项点Next回0。

items.length变化时只钳制当前索引，列表增长不会重置。select在空列表提前返回；同一项重复点击仍发change，因为没有相等去重。initialIndex watcher和length watcher不发change，所以父组件应区分外部配置和用户选择。

这段逻辑没有Math.trunc/Number.isFinite，不能像Osmo helper那样接受任意数值。小数/NaN可能使items[selected]不存在；调用方应提供整数。select的单次加length模运算足够覆盖内部前后移动一格，但并未定义任意大负数公共输入。

## 键盘切换与焦点

tab上的keydown仅处理ArrowLeft/ArrowRight/Home/End。先preventDefault阻止页面滚动，再根据当前tab的index计算目标，调用select，最后通过useId生成的tab ID找到实际button并focus。

因为所有tab一直存在，只是属性变化，focus无需nextTick。Home到首项、End到末项；左右键循环。Enter/空格仍由原生button生成click，Tab只停当前tab，因为其余tabindex=-1。

<!-- source: src/library/tsi/RecognitionCarousel.vue#L27-L27 -->
```vue
<template><section class="recognition-carousel" :aria-label="eyebrow"><header><span>{{ eyebrow }}</span><div><button type="button" aria-label="Previous achievement" :disabled="items.length < 2" @click="select(selected - 1)"><ArrowLeft :size="17" /></button><button type="button" aria-label="Next achievement" :disabled="items.length < 2" @click="select(selected + 1)"><ArrowRight :size="17" /></button></div></header><div v-if="active" :id="`${id}-panel`" class="achievement" role="tabpanel" :aria-labelledby="`${id}-tab-${selected}`"><h3 :key="active.headline">{{ active.headline }}</h3><p>{{ active.detail }}</p></div><p v-else class="empty">No achievements.</p><div class="achievement-tabs" role="tablist" aria-label="Achievements"><button v-for="(item,index) in items" :id="`${id}-tab-${index}`" :key="index" type="button" role="tab" :aria-selected="selected === index" :aria-controls="`${id}-panel`" :tabindex="selected === index ? 0 : -1" @click="select(index)" @keydown="keydown($event,index)"><span>{{ String(index + 1).padStart(2,'0') }}</span><i aria-hidden="true"></i><strong>{{ item.label }}</strong></button></div></section></template>
```

tabpanel aria-labelledby连接当前tab；每个tab的aria-controls都指向同一个panel。useId确保多实例ID独立。items<2时前后箭头原生disabled；空数据不渲染tabpanel，显示No achievements。

## 文本动画与所谓进度

h3的key绑定active.headline，标题内容不同导致元素替换，重新运行reveal CSS动画：0.3秒内opacity0.3→1、translateY6px→0。detail只是文本更新。两条记录headline相同则key不变，不应期待标题每次都重播。

下方每项i是一条1px线，选中时变浅绿，未选中是灰绿；这不是自动倒计时进度，也不是按scrollY计算的页面进度。没有scroll listener、IntersectionObserver、setInterval或RAF。

桌面大字60px、轻字重300；450px以下39px，内容区min-height240px。tab布局固定三列，即使传入其他数量仍按三列网格换行。减少动态效果时关闭h3动画；按钮cursor:pointer，disabled改default。

没有dragstart/drag/pointerdown/up和触摸滑动识别。触屏只能点击按钮/标签，不支持扫动切页；也没有grab/grabbing鼠标状态。

## 接入示例

示例放在 `src/examples/`，数据是业务已计算好的字符串。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import RecognitionCarousel, { type RecognitionItem } from '../library/tsi/RecognitionCarousel.vue'

const index = ref(0)
const items: RecognitionItem[] = [
  { label: '收入', headline: '40M+', detail: '累计收入，单位由业务文案说明。' },
  { label: '客户', headline: '100k', detail: '来自全球的客户。' },
  { label: '品牌', headline: '4 Brands', detail: '共四个品牌参与。' },
]
</script>
<template>
  <RecognitionCarousel eyebrow="业务进展" :items="items"
    :initial-index="index" @change="index = $event" />
</template>
```

## 验证和使用边界

[core.test.ts](../src/library/tsi/core.test.ts#L7) 默认首项点Previous到7 & 8 figures，再按右键回Over 40M，断言change=0且document.activeElement为选中tab；[空数据测试](../src/library/tsi/core.test.ts#L19) 验证箭头全disabled且无tabpanel。

尚未单测非法初始索引、动态删项、重复标题动画或不同数量网格。组件只是展示和选择已提供的业绩，不进行数字滚动计数、统计计算或数据拉取。
