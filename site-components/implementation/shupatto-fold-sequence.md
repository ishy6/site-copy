# Photographic Fold Sequence：原生滑杆、RAF 与照片图集逐帧播放

组件 ID：`shupatto-fold-sequence`。

这是一个可播放、暂停、重置和拖动进度的照片序列播放器。动画由原站真实折叠照片构成，不是 CSS 把完整袋子变形成卷起状态，也不是嵌入一段视频。

## 源码、帧资源与维度

- [FoldSequence.vue](../src/library/shupatto/FoldSequence.vue#L1)：播放时钟、帧计算和裁切。
- [foldSheets.ts](../src/library/shupatto/foldSheets.ts#L1)：18 个本地图集 URL。
- [core.test.ts](../src/library/shupatto/core.test.ts#L128)：首中末帧、错误重试、暂停续播和卸载清理。

原始素材来自 Shupatto 首页 `sequence2/pc_large/1-02`。每张图集宽 1750、高 5832，纵向排列 4 帧，因此单帧高度是 `5832 / 4 = 1458`。

默认共有 `18 × 4 = 72` 帧，帧下标从 0 到 71；stage 的 aspect-ratio 为 `1750 / 1458`，保证照片按单帧比例显示。

## Props 与事件

| 参数 | 类型 | 默认值 | 要求 |
| --- | --- | --- | --- |
| `sheets` | `string[]` | `foldSheets` | 按时间顺序排列的纵向图集 |
| `rows` | `number` | `4` | 每个图集的纵向帧数；应为有限正整数 |
| `initialProgress` | `number` | `0` | 归一化初始进度，变化时夹取到 0–1 并暂停 |
| `duration` | `number` | `3` | 从 0 播到 1 的秒数；播放公式至少使用 0.3 秒 |
| `title` | `string` | `One pull. Ready to go.` | 标题和区域无障碍名称 |

`progress(value: number)` 在实际进度变化后发出；`complete()` 无参数，仅由自动播放到终点触发。拖动到 100% 不发 complete。

rows 只通过 `Math.max(1, rows)` 保底，没有取整或有限性验证。自定义图集必须自行保证每页帧数、单帧比例和数组顺序正确；不能传入小数 rows 期望自动修正。

## 从进度定位图集和帧

<!-- source: src/library/shupatto/FoldSequence.vue#L12-L18 -->
```ts
const total = computed(() => props.sheets.length * Math.max(1, props.rows))
const frame = computed(() => Math.min(total.value - 1, Math.round(progress.value * Math.max(0, total.value - 1))))
const image = computed(() => props.sheets[Math.floor(frame.value / Math.max(1, props.rows))])
const row = computed(() => frame.value % Math.max(1, props.rows))
watch(() => props.initialProgress, value => { progress.value = Math.max(0, Math.min(1, value)); playing.value = false }, { immediate: true })
watch(progress, value => emit('progress', value))
watch(image, () => { failed.value = false })
```

设进度为 p、总帧数为 N、每张图集行数为 R：全局帧号为 `round(p × (N - 1))`，图集下标为 `floor(frame / R)`，图集内行号为 `frame % R`。

默认进度 0 对应 frame=0、sheet=0、row=0。50% 对应 round(35.5)=36，即第 10 张图集第 1 行。100% 对应 frame=71、第 18 张图集第 4 行。

frame 通过 round 而非 floor 离散化，因此临近中点时会切向后一帧。它是逐帧照片跳转，没有对两张照片插值或交叉淡入淡出。

props.initialProgress 的 immediate watcher 初始化进度，但 progress 的通知 watcher 在其后创建，所以挂载初始值不保证产生 progress 事件。

## CSS 怎样显示某一行照片

<!-- source: src/library/shupatto/FoldSequence.vue#L34-L34 -->
```vue
  <section class="shupatto-fold" :aria-label="title"><header><span>Shupatto</span><h2>{{ title }}</h2></header><div class="shupatto-fold__stage"><img v-if="image && !failed" :src="image" alt="Shupatto bag folding sequence" :style="{ height: `${Math.max(1, rows) * 100}%`, top: `-${row * 100}%` }" @error="failed = true" /><p v-else>Sequence unavailable.</p></div><div class="shupatto-fold__controls"><button type="button" :aria-label="playing ? 'Pause folding' : 'Play folding'" :disabled="!sheets.length || failed" @click="toggle"><component :is="playing ? Pause : Play" :size="18" /></button><input type="range" aria-label="Fold progress" min="0" max="100" :value="progress * 100" @input="scrub" /><button type="button" aria-label="Reset folding" @click="reset"><RotateCcw :size="17" /></button></div></section>
```

img 高度为 stage 的 `R × 100%`，默认是 400%。`top=-row × 100%` 把整张纵向图集向上移一、二或三倍 stage 高度，stage 的 overflow:hidden 裁掉其余行。

<!-- source: src/library/shupatto/FoldSequence.vue#L42-L43 -->
```css
.shupatto-fold__stage { position: relative; width: 100%; aspect-ratio: 1750 / 1458; overflow: hidden; border-radius: 50% / 42%; background: #e1e3e1; }
.shupatto-fold__stage img { position: absolute; left: 0; width: 100%; object-fit: fill; }
```

这里使用真实 `<img>`，不是 background-position 或 canvas drawImage。椭圆来自 border-radius，对所有帧使用同一裁切边界。

替换素材时如果单帧宽高比与 1750/1458 不同，需要同步调整 stage 比例，否则 object-fit:fill 会拉伸图像。rows 参数不会自动推导任意图集的像素尺寸。

## RAF 时间推进与暂停

<!-- source: src/library/shupatto/FoldSequence.vue#L19-L31 -->
```ts
function tick(time: number) {
  if (!playing.value) return
  if (last) progress.value = Math.min(1, progress.value + (time - last) / (Math.max(.3, props.duration) * 1000))
  last = time
  if (progress.value >= 1) { playing.value = false; emit('complete'); return }
  animation = requestAnimationFrame(tick)
}
watch(playing, value => { cancelAnimationFrame(animation); last = 0; if (value) animation = requestAnimationFrame(tick) })
function toggle() { if (progress.value >= 1) progress.value = 0; playing.value = !playing.value }
function scrub(event: Event) { playing.value = false; progress.value = Number((event.target as HTMLInputElement).value) / 100 }
function reset() { playing.value = false; progress.value = 0; failed.value = false }
onMounted(() => { for (const src of props.sheets) { const preload = new Image(); preload.src = src } })
onBeforeUnmount(() => cancelAnimationFrame(animation))
```

playing 变化时先取消已有 RAF 并把 last 归零，只有播放状态才重新请求下一帧。第一回调只记时间，后续按 `deltaMs / durationMs` 累加归一化进度，不依赖显示器固定 60Hz。

暂停会取消排队回调；续播从当前 progress 开始且重新记基准时间，暂停期间不会被计入动画时长。到 1 时停止请求下一帧并发一次 complete。

若播放按钮在终点再次点击，toggle 先将 progress 归零，形成重播。Reset 同时暂停、回首帧并清除资源错误。

## “拖动”实际是什么事件

用户拖动的是原生 `<input type="range">` 的拇指控件。浏览器负责指针跟踪、滑杆命中、触屏与键盘步进，组件只监听 input 事件并读取 0–100 的 value。

scrub 在每次 input 时将 playing=false，除以 100 后更新 progress，再由 computed 定位照片。没有 HTML Drag and Drop API 的 dragstart/drag/dragend，也没有 pointer capture 或 document mousemove。

组件没有在拖动开始/结束时切换 cursor。按钮的 pointer 来自静态 CSS，滑杆使用浏览器原生鼠标反馈和 accent-color。

滑杆支持键盘方向键；按钮有动态 aria-label，Play/Pause 切换时名称同步变化。照片 alt 固定为折叠序列描述，并不逐帧播报状态。

## 资源预加载、错误与清理

挂载时为每张图集创建 Image 并赋 src，触发浏览器缓存预加载；只预加载首次挂载时的 sheets，后续替换数组不会再次运行这段 mounted 逻辑。

可见 img 触发 error 后设置 failed=true，隐藏照片、显示不可用文案并禁用播放。切换到另一个 image URL 会清除 failed；Reset 也能重新渲染首图以重试。

没有等待全部图片完成的加载屏障，也没有按失败帧自动暂停正在运行的时钟。网络较慢时可能出现照片等待，调用方应提供可访问且适当压缩的本地资源。

卸载会 cancelAnimationFrame；图片预加载没有保存句柄或 abort，因此浏览器资源请求可能继续。组件不监听 visibilitychange，后台恢复时可能按较大的时间差直接向前推进。

没有 autoplay，用户主动播放才运动；没有单独检测 prefers-reduced-motion 来禁止主动播放。

## 完整接入示例

示例放在 `src/examples/FoldingExample.vue`，记录实时进度和自动播放完成次数；归零由组件内的重置按钮完成。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import FoldSequence from '../library/shupatto/FoldSequence.vue'
import { foldSheets } from '../library/shupatto/foldSheets'

const progress = ref(0)
const completions = ref(0)
</script>

<template>
  <FoldSequence
    :sheets="foldSheets"
    :rows="4"
    :duration="3"
    :initial-progress="0"
    @progress="progress = $event"
    @complete="completions++"
  />
  <output>进度：{{ Math.round(progress * 100) }}%</output>
  <output>播放完成：{{ completions }}</output>
</template>
```

## 已验证与边界

测试验证首帧、第 10 张图集中点、末张图集 top=-300%、重置、空素材禁用、错误后重试、手动拖到终点不发 complete。

RAF 测试控制时间戳，验证 0.3 秒时长的中途暂停/继续、完成事件只发一次、终点重播以及卸载后无待执行回调。

这些测试验证帧 URL 和偏移，不代表任意替换图集都具有正确视觉内容。实际照片比例和每一帧是否连续仍需配合浏览器截图检查。
