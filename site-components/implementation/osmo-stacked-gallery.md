# Osmo 堆叠作品轮播：StackedGallery

组件 ID：`osmo-stacked-gallery`。入口：[StackedGallery.vue](../src/library/osmo/StackedGallery.vue#L1)，数据：[showcases.ts](../src/library/osmo/showcases.ts#L1)，共用行为：[carousel.ts](../src/library/osmo/carousel.ts#L1)。原站作品的倾斜堆叠被提取为可换数据、可切换、可选择的作品集合。

## 对外接口

| prop | 类型 | 默认 |
| --- | --- | --- |
| `items` | `GalleryItem[]` | Nick Ho、EverWonder Studio、Minal Studio 三个原站作品 |
| `initialIndex` | `number` | 0，watch 后续变更 |
| `title` | `string` | `'Made to move.'` |

`GalleryItem` 必须含 id/title/image，可选 href。`change(index:number)` 发当前序号；`select(item:GalleryItem)` 发点击作品完整对象。href 在这里仅作为事件数据，卡片入口始终是 button，不会自动打开 href。

## 状态到堆叠几何

<!-- source: src/library/osmo/StackedGallery.vue#L6-L17 -->
```ts
const props = withDefaults(defineProps<{ items?: GalleryItem[]; initialIndex?: number; title?: string }>(), { items: () => showcaseItems, initialIndex: 0, title: 'Made to move.' })
const emit = defineEmits<{ change: [index: number]; select: [item: GalleryItem] }>()
const { index, move, counter, onKeydown } = useSlides(computed(() => props.items.length), toRef(props, 'initialIndex'))
const stage = ref<HTMLElement>()
watch(index, async value => {
  emit('change', value)
  const restoreFocus = stage.value?.contains(document.activeElement)
  await nextTick()
  if (restoreFocus) stage.value?.querySelector<HTMLButtonElement>('.active button')?.focus()
})
function offset(i: number) { const length = props.items.length; return length ? ((i - index.value + length + Math.floor(length / 2)) % length) - Math.floor(length / 2) : 0 }
const { begin, end, cancel, suppressDraggedClick } = useSlideSwipe(move)
```

共享 useSlides 负责负数、越界、小数/非有限值、空列表归一化，具体算法见 [carousel.ts 的 useSlides](../src/library/osmo/carousel.ts#L3)：先将非有限值替换为 0、截断小数，再通过两次模运算将负值映射回有效区间，空列表固定为 0。该组件自己只新增 stage DOM ref 与 offset 函数。

`offset(i)` 将数组序号转换为以当前页为 0 的循环相对位置。例如三项且 index=0 时，三个 offset 分别为 0、1、-1。偶数项时左右数量可能不完全对称；这是 Math.floor(length/2) 定义的布局，不是物理引擎。

<!-- source: src/library/osmo/StackedGallery.vue#L20-L25 -->
```vue
  <section class="osmo-stack" :aria-label="title"><header><h2>{{ title }}</h2><span>{{ counter }}</span></header>
    <div ref="stage" class="osmo-stack__stage" @pointerdown="begin" @pointerup="end" @pointercancel="cancel" @pointerleave="cancel" @click.capture="suppressDraggedClick" @keydown="onKeydown">
      <article v-for="(item, i) in items" :key="item.id" :inert="i !== index" :aria-hidden="i !== index" :class="{ active: i === index }" :style="{ transform: `translateX(${offset(i) * 16}%) rotate(${offset(i) * 9}deg)`, zIndex: items.length - Math.abs(offset(i)) }">
        <img :src="item.image" :alt="item.title" draggable="false" /><button type="button" @click="emit('select', item)"><span>{{ item.title }}</span><ArrowUpRight :size="18" /></button>
      </article><p v-if="!items.length">No projects available.</p>
    </div><footer><button type="button" aria-label="Previous project" :disabled="items.length < 2" @click="move(-1)"><ArrowLeft :size="19" /></button><button type="button" aria-label="Next project" :disabled="items.length < 2" @click="move(1)"><ArrowRight :size="19" /></button></footer>
```

每个 article 的 translateX=offset×16%，rotate=offset×9°，zIndex=总数−abs(offset)。当前项 offset=0、最高层级，远端项错开并旋转。所有图片仍在 DOM 中，没有只挂载当前图的虚拟列表或自动懒加载。

`.osmo-stack__stage` 高度固定 270px，overflow:hidden 限制倾斜卡片超出舞台。article absolute，宽 min(72%,365px)；transform 用 0.6 秒 cubic-bezier 过渡。非 active 亮度降到 0.85。420px 以下卡片宽 78%、图片高 155px；减少动态效果时移除 transition。

## 键盘切页后为什么要恢复焦点

`@keydown=onKeydown` 绑定 stage，当前作品按钮收到的方向键会冒泡到舞台。索引切换后，原按钮所在 article 被 inert，不能继续聚焦。

watch(index) 在 DOM 更新前记录 document.activeElement 是否在 stage 里，先发 change，然后 await nextTick，最后选择新的 `.active button` 并 focus。这避免键盘从作品 A 切到 B 后焦点留在已隐藏交互项。若用户点击底部箭头，焦点本来不在舞台中，就不会被强行抢到卡片。

`inert` 与 `aria-hidden` 同时应用于非当前 article：前者去除交互/聚焦，后者隐藏辅助技术内容。没有给舞台本身 tabindex，用户通过当前作品按钮进入键盘流程。前后按钮的禁用条件为 items.length<2。

## 手势、点击和光标

<!-- source: src/library/osmo/carousel.ts#L23-L40 -->
```ts
  function begin(event: PointerEvent) {
    dragged = false
    if (event.button === 0) origin = { x: event.clientX, y: event.clientY }
  }
  function cancel() { origin = undefined }
  function end(event: PointerEvent) {
    if (origin) {
      const dx = event.clientX - origin.x
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - origin.y)) {
        dragged = true
        move(dx < 0 ? 1 : -1)
      }
    }
    cancel()
  }
  function suppressDraggedClick(event: MouseEvent) {
    if (dragged && event.detail !== 0) { event.preventDefault(); event.stopPropagation() }
    dragged = false
```

舞台绑定 pointerdown/up/cancel/leave 与捕获阶段 click，横向位移大于 45px 且超过纵向距离时切页。左滑前进、右滑后退；失败或离开舞台就放弃本次手势。触摸由 PointerEvent 统一处理，touch-action:pan-y 保留页面纵向滚动。

它不是原生 drag，也不是跟手拖动：没有 dragstart、pointermove、setPointerCapture、实时 transform 写入或惯性计算。CSS 未设置 grab/grabbing，只有作品按钮和箭头 cursor:pointer。成功滑动后 suppressDraggedClick 屏蔽随后的指针 click，避免误触 select。

图片 draggable=false 禁止浏览器拖图；不会改变操作系统鼠标样式。要增加真正跟手拖拽，需要新增位移状态、pointerId/capture 和取消恢复逻辑，现有代码并未实现。

## 完整接入示例

示例放在 `src/examples/`。需要真实导航时由宿主读取 href；示例选择展示状态便于本地执行。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import StackedGallery from '../library/osmo/StackedGallery.vue'
import { showcaseItems, type GalleryItem } from '../library/osmo/showcases'

const selected = ref<GalleryItem | null>(null)
function select(item: GalleryItem) { selected.value = item }
</script>
<template>
  <StackedGallery :items="showcaseItems" title="作品集合" @select="select" />
  <a v-if="selected?.href" :href="selected.href"
    target="_blank" rel="noopener noreferrer">访问 {{ selected.title }}</a>
</template>
```

## 已有验证与边界

[core.test.ts](../src/library/osmo/core.test.ts#L63) 聚焦当前卡片按钮，按右方向键，验证焦点进入新的 active button，点击后 select 为 showcaseItems[1]。共享索引及手势测试覆盖环绕、空集合和拖后 click 屏蔽。

items=[] 时舞台显示空状态，计数 0 / 0，两个箭头禁用。无定时器、异步请求、全局监听需要清理。数据重排按索引而非 id 保持当前位置；图片错误没有 fallback。自动化单测未断言 transform 的像素效果、inert 的真实浏览器实现或多触点行为。
