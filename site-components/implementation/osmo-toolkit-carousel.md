# Osmo 工具包轮播：ToolkitCarousel

组件 ID：`osmo-toolkit-carousel`。入口：[ToolkitCarousel.vue](../src/library/osmo/ToolkitCarousel.vue#L1)，索引和手势共享实现：[carousel.ts](../src/library/osmo/carousel.ts#L1)，默认数据：[toolkit.ts](../src/library/osmo/toolkit.ts#L1)。

这是产品标签、内容面板、手势和选择动作共同驱动的轮播。图片只是当前产品的一部分；真正可复用部分是索引归一化、标签焦点、滑动判定和完整产品事件。

## 数据契约

| prop | 类型 | 默认 |
| --- | --- | --- |
| `items` | `ToolkitItem[]` | toolkitItems，Vault/Course/Buttons 三项 |
| `initialIndex` | `number` | `0`，后续修改会同步当前页 |
| `title` | `string` | `'The toolkit'` |

<!-- source: src/library/osmo/toolkit.ts#L1-L6 -->
```ts
export interface ToolkitItem { id: string; title: string; description: string; image: string; href?: string }
export const toolkitItems: ToolkitItem[] = [
  { id: 'vault', title: 'The Vault', description: 'Our ever-growing dashboard packed with ready-to-go components.', image: '/assets/osmo/toolkit-vault.avif' },
  { id: 'course', title: 'Page Transition Course', description: 'Create page transitions that take your websites to the next level.', image: '/assets/osmo/toolkit-course.avif' },
  { id: 'buttons', title: 'Buttons', description: '100 fully accessible buttons made together with Eduard Bodak.', image: '/assets/osmo/toolkit-buttons.avif' },
]
```

`change(index:number)` 表示内部索引改变；`select(item:ToolkitItem)` 表示用户按 Discover，参数是当前完整对象。切换页与打开产品是两种不同事件。注册面板只开放 title 和 initialIndex，items/href 可在业务代码传入。

## 索引如何处理边界

<!-- source: src/library/osmo/carousel.ts#L3-L17 -->
```ts
export function useSlides(length: Ref<number>, initial: Ref<number>) {
  const index = ref(0)
  const normalize = (value: number) => length.value ? ((Math.trunc(Number.isFinite(value) ? value : 0) % length.value) + length.value) % length.value : 0
  watch(initial, value => { index.value = normalize(value) }, { immediate: true })
  watch(length, () => { index.value = normalize(index.value) })
  function select(value: number) { index.value = normalize(value) }
  function move(direction: number) { select(index.value + direction) }
  function onKeydown(event: KeyboardEvent) {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? length.value - 1
      : event.key === 'ArrowRight' ? index.value + 1 : event.key === 'ArrowLeft' ? index.value - 1 : null
    if (next === null) return
    event.preventDefault()
    select(next)
  }
  return { index, select, move, onKeydown, counter: computed(() => `${length.value ? index.value + 1 : 0} / ${length.value}`) }
```

`normalize` 先将非有限值改为 0，再 Math.trunc，最后做两次模运算，确保负索引也循环到合法位置。三项时 -1 对应 2、3 对应 0；空列表固定 index=0，计数显示 0 / 0。

initial watcher immediate 初始化索引；length watcher 按当前 index 重新归一化，列表增长不会强制回到 initialIndex。列表缩短可能把原 index 环绕到新位置。此逻辑没有按 item.id 保持选择，重排数组后相同索引代表的新对象会成为当前页。

<!-- source: src/library/osmo/ToolkitCarousel.vue#L7-L14 -->
```ts
const props = withDefaults(defineProps<{ items?: ToolkitItem[]; initialIndex?: number; title?: string }>(), { items: () => toolkitItems, initialIndex: 0, title: 'The toolkit' })
const emit = defineEmits<{ change: [index: number]; select: [item: ToolkitItem] }>()
const { index, select, move, onKeydown, counter } = useSlides(computed(() => props.items.length), toRef(props, 'initialIndex'))
const active = computed(() => props.items[index.value])
const id = useId()
watch(index, value => emit('change', value))
function tabKey(event: KeyboardEvent) { onKeydown(event); (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('button')[index.value]?.focus() }
const { begin, end, cancel, suppressDraggedClick } = useSlideSwipe(move)
```

`active` 是 items[index]，不是第二份复制的产品状态。`watch(index)` 发 change，不是 immediate，所以初始挂载不发；items 原地替换但索引不变时也不发 change。tabKey 先让共享 onKeydown 改 index，再将焦点移至同一个 tablist 中对应按钮。

## 指针滑动的逐步执行

<!-- source: src/library/osmo/carousel.ts#L20-L42 -->
```ts
export function useSlideSwipe(move: (direction: number) => void) {
  let origin: { x: number; y: number } | undefined
  let dragged = false
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
  }
  return { begin, end, cancel, suppressDraggedClick }
```

1. panel 的 pointerdown 调用 begin，清掉上轮 dragged，只接受主按钮 `button===0`，记录 clientX/clientY。
2. pointerup 调用 end，用结束点减起点得到 dx；横向位移严格大于 45px，且大于纵向位移时才切页。
3. 左滑 dx<0 调用 move(1)，右滑调用 move(-1)。pointerleave/pointercancel 调 cancel，结束未完成手势。
4. 成功切页后浏览器可能继续合成 click。panel 的 click.capture 在子按钮/链接处理前检查 dragged，阻止该次指针 click 的默认动作和传播，避免滑动后误开产品。
5. `event.detail===0` 的键盘/程序化 click 不被这个拖后点击屏蔽；下一次 pointerdown 和 click 检查都会清理 dragged。

这里**没有原生 HTML DragEvent、dragstart/drag/dragend，也没有 pointermove**。它是起止点阈值手势，内容不会跟着指针实时位移，没有速度、惯性、pointer capture。图片 draggable=false 防止浏览器原生图片拖影；touch-action:pan-y 保留纵向页面滚动。面板没有 grab/grabbing cursor 切换，按钮只是固定 pointer。

<!-- source: src/library/osmo/ToolkitCarousel.vue#L18-L22 -->
```vue
    <div class="osmo-toolkit__tabs" role="tablist" :aria-label="title"><button v-for="(item, i) in items" :id="`${id}-tab-${i}`" :key="item.id" type="button" role="tab" :tabindex="i === index ? 0 : -1" :aria-selected="i === index" :aria-controls="`${id}-panel`" @click="select(i)" @keydown="tabKey">{{ item.title }}</button></div>
    <div v-if="active" :id="`${id}-panel`" class="osmo-toolkit__panel" role="tabpanel" :aria-labelledby="`${id}-tab-${index}`" @pointerdown="begin" @pointerup="end" @pointercancel="cancel" @pointerleave="cancel" @click.capture="suppressDraggedClick">
      <div class="osmo-toolkit__copy"><Asterisk :size="29" /><h2>{{ active.title }}</h2><p>{{ active.description }}</p><MotionButton label="Discover" :href="active.href" @click="emit('select', active)" /></div><div class="osmo-toolkit__media"><img :key="active.image" :src="active.image" :alt="active.title" draggable="false" /></div>
    </div><p v-else>No products available.</p>
    <div class="osmo-toolkit__controls"><button type="button" aria-label="Previous product" :disabled="items.length < 2" @click="move(-1)"><ArrowLeft :size="17" /></button><button type="button" aria-label="Next product" :disabled="items.length < 2" @click="move(1)"><ArrowRight :size="17" /></button></div>
```

## DOM、样式和键盘

tablist 中只有选中按钮 tabindex=0，其余为 -1。Home/End/左右键修改索引，随后焦点跟随；aria-selected、aria-controls、tabpanel 的 aria-labelledby 都从同一 index/useId 生成。前后按钮在 items.length<2 时原生 disabled。

面板两列网格，背景为 Osmo 荧光绿，`.osmo-toolkit__media` relative，图片 absolute 铺满媒体列并 object-fit:cover/object-position:bottom。图片绝对定位避免图片自身大尺寸撑高 grid。440px 以下一列，媒体容器高度 150px；标签行 overflow-x:auto，长标签可以水平滚动。

Discover 使用 MotionButton。active.href 存在时它渲染 a，select 发出后浏览器仍会按 href 导航；不带 href 时只发事件。组件没有业务路由、自动播放、计时器或预加载缓存。

## 接入示例

示例放在 `src/examples/`，数据使用项目现有本地资源。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ToolkitCarousel from '../library/osmo/ToolkitCarousel.vue'
import { toolkitItems, type ToolkitItem } from '../library/osmo/toolkit'

const current = ref(0)
const selected = ref('')
function open(item: ToolkitItem) { selected.value = item.id }
</script>
<template>
  <ToolkitCarousel :items="toolkitItems" :initial-index="current"
    @change="current = $event" @select="open" />
  <p role="status">当前索引 {{ current }}，已选择 {{ selected }}</p>
</template>
```

## 验证与限制

[core.test.ts](../src/library/osmo/core.test.ts#L16) 覆盖负索引、数据增长保持选中、初始 prop 更新、End 和空列表计数；[手势测试](../src/library/osmo/core.test.ts#L37) 验证横滑、点击屏蔽和纵向移动不切页；[组件测试](../src/library/osmo/core.test.ts#L54) 验证 End 将焦点移到第三 tab，Discover 发对应 toolkitItems[2]。

测试没有覆盖多指触控。helper 不记录 pointerId，不应宣称支持并行触点；没有图片加载失败替代。源码的 tabKey 对非导航键也会执行一次 focus 当前 tab，但共享 onKeydown 不阻止这些键的默认动作。
