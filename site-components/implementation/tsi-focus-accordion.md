# 21TSI 图文折叠区：FocusAccordion

组件 ID：`tsi-focus-accordion`。源码：[FocusAccordion.vue](../src/library/tsi/FocusAccordion.vue#L1)。单项展开不仅控制描述，还驱动右侧当前图片及编号；支持全部收起、隐藏图片和图片失败替代。

## 对外参数

<!-- source: src/library/tsi/FocusAccordion.vue#L5-L19 -->
```ts
export interface FocusItem {
  title: string
  description: string
  image: string
  imageAlt: string
}
const props = withDefaults(defineProps<{
  title?: string
  items?: FocusItem[]
  defaultOpen?: number
  showImage?: boolean
}>(), {
  title: 'Our Focus',
  defaultOpen: 0,
  showImage: true,
```

| prop | 默认 | 作用 |
| --- | --- | --- |
| `title:string` | Our Focus | 区块标题 |
| `items:FocusItem[]` | Sportware/Wearable Technology/AI Assisted Training/Virtual Coaching | 四条标题、说明、图及替代文本 |
| `defaultOpen:number` | 0 | 初始及后续同步的展开序号；-1用于全收起 |
| `showImage:boolean` | true | false不挂载右侧图片区，列表占整列 |

`change(index:number|null)`仅toggle点击后发出。外部defaultOpen或数据缩短导致展开项改变时不发change。FocusItem的imageAlt是必填，不从title自动猜测。

## 内部状态与图片失败恢复

<!-- source: src/library/tsi/FocusAccordion.vue#L27-L38 -->
```ts
const emit = defineEmits<{ change: [index: number | null] }>()
const id = useId()
const openIndex = ref<number | null>(props.defaultOpen)
const active = computed(() => openIndex.value === null ? null : props.items[openIndex.value] ?? null)
const imageFailed = ref(false)
function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
  emit('change', openIndex.value)
}
watch(() => props.defaultOpen, value => { openIndex.value = value >= 0 && value < props.items.length ? value : null })
watch(active, () => { imageFailed.value = false })
watch(() => props.items.length, value => { if (openIndex.value !== null && openIndex.value >= value) openIndex.value = null })
```

openIndex是唯一折叠状态；active按它查items，查不到则null。imageFailed独立表示当前图错误，不表示整个问答内容失败。

toggle在“点击当前索引→null”和“点击另一索引→该索引”之间切换。active改变时watch将imageFailed=false，让新图片可以重新加载。items.length缩短且当前序号越界时改为null。

defaultOpen的后续watch会校验0≤value<items.length，不合法变null；但初始ref直接接props.defaultOpen，没有相同归一化。初始-1或越界虽然内部仍是数字，模板比较找不到项、active=null，视觉上同样全收起。非整数没有完整校验。

## 用户操作与两侧同步

<!-- source: src/library/tsi/FocusAccordion.vue#L42-L54 -->
```vue
  <section class="focus-accordion" :aria-label="title">
    <header><span>THE SPHERE LAB</span><h3>{{ title }}</h3></header>
    <div class="focus-layout" :class="{ 'no-image': !showImage }">
      <div class="focus-list">
        <article v-for="(item, index) in items" :key="index" :class="{ active: openIndex === index }">
          <button type="button" :aria-expanded="openIndex === index" :aria-controls="`${id}-panel-${index}`" :id="`${id}-trigger-${index}`" @click="toggle(index)"><span class="focus-number">.{{ String(index + 1).padStart(2, '0') }}</span><span>{{ item.title }}</span><Minus v-if="openIndex === index" :size="15" /><Plus v-else :size="15" /></button>
          <div v-show="openIndex === index" :id="`${id}-panel-${index}`" class="focus-body" role="region" :aria-labelledby="`${id}-trigger-${index}`"><p>{{ item.description }}</p></div>
        </article>
        <p v-if="!items.length" class="focus-empty">No focus areas.</p>
      </div>
      <div v-if="showImage" class="focus-media" :class="{ empty: !active || imageFailed }"><img v-if="active && !imageFailed" :key="active.image" :src="active.image" :alt="active.imageAlt" @error="imageFailed = true"><span v-else>21TSI</span><span v-if="active" class="image-number">.{{ String((openIndex ?? 0) + 1).padStart(2, '0') }}</span></div>
    </div>
    <footer><span>EXPERIMENTATION / RESEARCH / DEVELOPMENT</span><span>21TSI</span></footer>
```

点击问题按钮调用toggle，article.active、按钮aria-expanded、Minus/Plus、描述v-show都比较同一个openIndex。右侧img从active取image和imageAlt；图片右下编号也由openIndex生成。

每个答案v-show保留DOM，用useId拼trigger/panel确保多实例无冲突；role=region与aria-labelledby反向连接问题。关闭当前项后active=null，右侧显示21TSI占位，而不是保留旧图片误导状态。

img原生error将imageFailed=true，v-if删除图像，显示21TSI占位，active仍保留，因此说明与编号不丢。切换到其他项时active watcher清错误标志。代码没有自动重试按钮；再次选择同一已展开项先关闭再打开，active经历null也会清标志。

showImage=false时focus-media完全卸载，focus-layout加no-image类，网格变一列。它不清openIndex，重新显示图时仍显示当前选项。

## 视觉与键盘

问题按钮原生Tab/Enter/空格，点击后焦点留原按钮。没有方向键移动项目、Escape折叠或程序化焦点恢复。图片不在Tab序列，alt来自业务传入。没有drag/drop、pointer手势，cursor只在问题按钮固定pointer。

图片absolute铺满media、object-fit:cover，换image key后运行focus-reveal 0.45秒：opacity0→1、scale1.03→1。答案展开本身没有高度动画或Transition。系统减少动态效果只关闭图片animation。

组件设置container-type:inline-size，并有max-width420px的container及media两套响应规则。宽屏图文列比1.4:1、图片min-height238px；紧凑环境改纵向，图片min-height150px。末尾no-image样式确保隐藏媒体时不会留空网格列。

<!-- source: src/library/tsi/FocusAccordion.vue#L63-L65 -->
```vue
<style scoped>
.focus-accordion{container-type:inline-size}.focus-layout.no-image{grid-template-columns:1fr}.focus-media{width:100%;min-width:0;max-width:100%}
</style>
```

## 接入示例

示例放在 `src/examples/`。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import FocusAccordion, { type FocusItem } from '../library/tsi/FocusAccordion.vue'

const open = ref<number | null>(0)
const showImage = ref(true)
const items: FocusItem[] = [
  { title: '运动装备', description: '围绕实际运动场景设计硬件。',
    image: '/assets/tsi/focus-1.webp', imageAlt: '运动装备研发场景' },
  { title: '训练反馈', description: '根据训练状态提供反馈。',
    image: '/assets/tsi/focus-3.webp', imageAlt: '训练研究场景' },
]
</script>
<template>
  <label><input v-model="showImage" type="checkbox">显示配图</label>
  <FocusAccordion :items="items" :show-image="showImage"
    :default-open="open ?? -1" @change="open = $event" />
</template>
```

## 已有验证及边界

[tsi.test.ts](../src/library/tsi/tsi.test.ts#L7) 同时挂载两个实例验证ID不冲突；点击第2项检查aria-expanded、答案可见、图地址focus-2.webp、change=1；再点检查收起与change=null。

未单测图片error及恢复、showImage切换、列表删项、容器查询实际宽度。items=[]时显示No focus areas；showImage仍true时右侧是21TSI占位。默认资源需随下载包部署；组件没有请求缓存、图片预加载或自己的卸载副作用。
