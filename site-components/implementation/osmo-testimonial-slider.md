# Osmo 评价轮播：TestimonialSlider

组件 ID：`osmo-testimonial-slider`。源码：[TestimonialSlider.vue](../src/library/osmo/TestimonialSlider.vue#L1)。重点是自动轮播与用户操作之间的优先级：自动播放会受悬停、焦点、减少动态效果限制；用户明确按播放时允许覆盖这些限制。

## 参数与输出

| prop | 类型 | 默认 |
| --- | --- | --- |
| `testimonials` | `Testimonial[]` | Dang Nguyen、Cassie Evans 两条评价 |
| `initialIndex` | `number` | 0，后续变化同步索引 |
| `autoplay` | `boolean` | false |
| `interval` | `number`，毫秒 | 5000，排程时最小1000 |

`Testimonial` 四个字段 quote/name/role/image 都是 string。唯一事件是 `change(index:number)`；没有 playback-change，因此父组件不能仅靠事件获知内部播放按钮状态。注册预览面板开放 initialIndex、autoplay、interval；实际集成可替换完整 testimonials。

## 状态分工

<!-- source: src/library/osmo/TestimonialSlider.vue#L10-L24 -->
```ts
const emit = defineEmits<{ change: [index: number] }>()
const { index, move, counter } = useSlides(computed(() => props.testimonials.length), toRef(props, 'initialIndex'))
const active = computed(() => props.testimonials[index.value])
const playing = ref(props.autoplay)
const hovering = ref(false)
const focused = ref(false)
const reduced = ref(false)
const explicitPlayback = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let media: MediaQueryList | undefined
function motionChanged() { reduced.value = media?.matches ?? false }
function focusOut(event: FocusEvent) { focused.value = event.relatedTarget instanceof Node && (event.currentTarget as HTMLElement).contains(event.relatedTarget) }
function focusIn() { focused.value = true; explicitPlayback.value = false }
function mouseEnter() { hovering.value = true; explicitPlayback.value = false }
function togglePlayback() { playing.value = !playing.value; explicitPlayback.value = playing.value }
```

| 状态 | 负责什么 |
| --- | --- |
| `index/active/counter` | 共享 useSlides 归一化后计算当前评价和计数 |
| `playing` | 用户或 prop 希望播放的开关，不等于当前 timer 一定在运行 |
| `hovering` | 指针是否停留组件内 |
| `focused` | 焦点是否在组件内部 |
| `reduced` | 系统减少动态效果查询结果 |
| `explicitPlayback` | 最近一次明确播放操作的授权，允许覆盖悬停/焦点/reduced |
| `timer/media` | 原生 interval 句柄与 MediaQueryList，非模板响应状态 |

`focusOut` 使用 relatedTarget 检查焦点是否只是从组件内一个按钮移到另一个按钮。只有目标仍是 Node 且仍被 section 包含，focused 才保持 true；离开组件变 false。

`focusIn` 和 `mouseEnter` 都清 explicitPlayback，表明新的注意力进入应暂停普通自动轮播。播放按钮 click 随后会把 explicitPlayback 设为 true，所以用户即使焦点仍停在按钮上也能明确开始播放。

## 定时器的建立、暂停和销毁

<!-- source: src/library/osmo/TestimonialSlider.vue#L25-L33 -->
```ts
function schedule() {
  clearInterval(timer)
  if (playing.value && (explicitPlayback.value || (!hovering.value && !focused.value && !reduced.value)) && props.testimonials.length > 1) timer = setInterval(() => { if (!document.hidden) move(1) }, Math.max(1000, props.interval))
}
watch(() => props.autoplay, value => { playing.value = value })
watch([playing, hovering, focused, reduced, explicitPlayback, () => props.interval, () => props.testimonials.length], schedule)
watch(index, value => emit('change', value))
onMounted(() => { media = matchMedia('(prefers-reduced-motion: reduce)'); motionChanged(); media.addEventListener('change', motionChanged); schedule() })
onBeforeUnmount(() => { clearInterval(timer); media?.removeEventListener('change', motionChanged) })
```

schedule 每次先清旧 interval，避免一次 prop/焦点变化叠加多个定时器。只有 playing=true、数据多于1项，并满足显式播放或三项阻挡条件均为false，才建立 interval。

回调每次检查 document.hidden。隐藏标签页时 interval 仍然存在，但不 move；返回可见页后等下次 tick 继续。源码没有 visibilitychange 监听，也没有记录隐藏前剩余时间，不能称为精准剩余时长恢复。

`Math.max(1000,props.interval)` 限制正常数字的最小间隔，但没有 Number.isFinite 校验；调用方应提供有限毫秒数。每次依赖变化都会重启完整等待周期。prop.autoplay 的 watch 只更新 playing，没有主动清 explicitPlayback。

onMounted 建立 matchMedia change 监听并 schedule；onBeforeUnmount 清 interval、移除 media 监听。共享 useSlides 的 Vue watcher 由组件作用域自动清理。

## 按钮、DOM 与实际可访问行为

<!-- source: src/library/osmo/TestimonialSlider.vue#L35-L39 -->
```vue
<template>
  <section class="osmo-quote" aria-label="Community testimonials" @mouseenter="mouseEnter" @mouseleave="hovering = false" @focusin="focusIn" @focusout="focusOut">
    <div class="osmo-quote__portrait"><img v-if="active" :src="active.image" :alt="active.name" /><span>Osmo's global<br />community</span></div>
    <div class="osmo-quote__copy"><blockquote v-if="active"><span aria-hidden="true">“</span><p>{{ active.quote }}</p><footer><strong>{{ active.name }}</strong><span>{{ active.role }}</span></footer></blockquote><p v-else>No testimonials available.</p><div class="osmo-quote__controls"><span>{{ counter }}</span><button type="button" :aria-label="playing ? 'Pause testimonials' : 'Play testimonials'" @click="togglePlayback"><component :is="playing ? Pause : Play" :size="16" /></button><button type="button" aria-label="Previous testimonial" :disabled="testimonials.length < 2" @click="move(-1)"><ArrowUp :size="17" /></button><button type="button" aria-label="Next testimonial" :disabled="testimonials.length < 2" @click="move(1)"><ArrowDown :size="17" /></button></div></div>
  </section>
```

播放按钮图标与 aria-label 由 playing 派生；即使因 hover 暂停而 timer 不存在，按钮仍可能显示 Pause，因为 playing 表示播放意愿。上下箭头虽然视觉为纵向，内部只是 move(-1)/move(1)，与图片布局没有滚动计算关系。

所有控制是原生 button，支持 Tab/Enter/空格；没有左右/上下键切换的自定义 keydown，没有拖拽、滑动或指针跟手。也没有 aria-live 自动广播每条评价。头像 img alt 使用作者姓名，引用使用 blockquote。

桌面为190px头像列+弹性内容列，440px以下变单列，头像缩至54px并和说明横排。按钮 cursor:pointer；没有 grab、grabbing 或按下时改鼠标样式。评价切换直接替换文字和img src，没有 Transition 或 opacity 过渡。

## 接入示例

示例放在 `src/examples/`。默认不开启自动播放，用户可使用组件内部播放按钮。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import TestimonialSlider, { type Testimonial } from '../library/osmo/TestimonialSlider.vue'

const current = ref(0)
const testimonials: Testimonial[] = [
  { quote: '组件和代码保持一致。', name: '研发团队', role: '前端',
    image: '/assets/osmo/dang.avif' },
  { quote: '每个状态都有明确的归属。', name: '设计团队', role: '设计',
    image: '/assets/osmo/cassie.avif' },
]
</script>
<template>
  <TestimonialSlider :testimonials="testimonials" :interval="4000"
    :autoplay="false" @change="current = $event" />
  <p>当前评价：{{ current + 1 }}</p>
</template>
```

## 测试覆盖

[core.test.ts](../src/library/osmo/core.test.ts#L91) 使用 fake timers：先 mouseenter 并聚焦播放按钮，再显式播放，1000ms后引言变更；点击暂停后再推进1000ms不变；卸载后 timer 数量为0。这覆盖了此前最容易出错的“焦点仍在播放按钮导致永远不能播放”路径。

未自动覆盖 document.hidden、多次系统偏好变化、props.interval 非有限值、图片加载失败及单条/空数组下所有按钮组合。空数组有文本 fallback；少于2条禁用前后按钮，播放按钮仍可切换 playing，但不会排程。
