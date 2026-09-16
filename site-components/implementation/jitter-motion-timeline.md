# Jitter 动画时间轴：MotionTimeline

组件 ID：`jitter-motion-timeline`。源码：[MotionTimeline.vue](../src/library/jitter/MotionTimeline.vue#L1)。动画由requestAnimationFrame推进秒数，再由computed映射到画板样式。用户“拖动时间轴”实际操作覆盖在轨道上的原生range输入，不是原生HTML drag事件。

## Props 和事件

| prop | 类型 | 默认及范围 |
| --- | --- | --- |
| `title` | string | `Make it move.`，画板标题 |
| `duration` | number，秒 | 4；内部限制0.5~30，非有限数回退4 |
| `color` | string | `#b498f5`，直接绑定背景CSS值 |
| `autoplay` | boolean | true；默认播放受减少动态效果限制 |

`seek(seconds:number)`仅在用户range输入或Reset时发出，不在每个动画帧发出。`playback-change(playing:boolean)`在setPlaying调用时发出，含mounted初始设置、按钮、prop和减少动态效果触发。没有currentTime/v-model接口。

## 时间状态与画板数学映射

<!-- source: src/library/jitter/MotionTimeline.vue#L11-L20 -->
```ts
const emit = defineEmits<{ seek: [seconds: number]; 'playback-change': [playing: boolean] }>()
const seconds = ref(0)
const playing = ref(false)
const length = computed(() => Math.max(0.5, Math.min(30, Number.isFinite(props.duration) ? props.duration : 4)))
const progress = computed(() => seconds.value / length.value)
const entrance = computed(() => Math.min(progress.value * 4, 1))
const time = computed(() => `${Math.floor(seconds.value).toString().padStart(2, '0')}:${Math.floor(seconds.value % 1 * 100).toString().padStart(2, '0')}`)
let animation = 0
let previous = 0
let motion: MediaQueryList | undefined
```

`seconds`是当前时间；`length`限制传入duration；`progress=seconds/length`是0~1范围的常规进度；`entrance=min(progress×4,1)`使入场只占前25%时长。时长4秒时，前1秒完成文字入场。

显示time是“整数秒:百分之一秒”，例如6.5显示06:50，它不是分:秒。`Math.floor`向下取整，浮点边界可能影响末位展示。

<!-- source: src/library/jitter/MotionTimeline.vue#L72-L79 -->
```vue
    <div class="artboard" :style="{ background: color }">
      <span class="art-eyebrow">DESIGN IN MOTION</span>
      <strong :style="{ opacity: .25 + entrance * .75, transform: `translateY(${(1 - entrance) * 15}px)` }">{{ title }}</strong>
      <Asterisk class="art-symbol" :size="132" :stroke-width="1.3" aria-hidden="true" :style="{ transform: `rotate(${progress * 90}deg)` }" />
      <span class="art-footer">Jitter</span>
    </div>
    <div class="timeline-tools"><div class="transport-buttons"><button type="button" :aria-label="playing ? 'Pause animation' : 'Play animation'" :title="playing ? 'Pause animation' : 'Play animation'" @click="setPlaying(!playing)"><Pause v-if="playing" :size="16" fill="currentColor" /><Play v-else :size="16" fill="currentColor" /></button><button type="button" aria-label="Reset timeline" title="Reset timeline" @click="reset"><RotateCcw :size="15" /></button></div><output>{{ time }} <span>/ {{ length.toFixed(2) }}s</span></output><span class="effect-label">Gentle entrance</span></div>
    <div class="track"><div class="ruler"><span v-for="tick in 5" :key="tick">{{ Number(((tick - 1) * length / 4).toFixed(1)) }}s</span></div><div class="clip"><span>T</span><span>Headline</span></div><div class="playhead" :style="{ left: `${progress * 100}%` }" aria-hidden="true"></div><input type="range" aria-label="Timeline position" min="0" :max="length" step="0.01" :value="seconds" :aria-valuetext="`${seconds.toFixed(2)} seconds`" @input="seek" /></div>
```

文字opacity从0.25到1，translateY从15px到0；Asterisk角度progress×90°。playhead的left=progress×100%，ruler五个刻度分别为0、1/4、1/2、3/4、全部时长。它没有关键帧编辑模型，Headline clip只是固定轨道视觉。

## range拖动为什么不需要drag事件

<!-- source: src/library/jitter/MotionTimeline.vue#L22-L34 -->
```ts
function setPlaying(value: boolean) {
  playing.value = value
  syncAnimation()
  emit('playback-change', value)
}
function seek(event: Event) {
  seconds.value = Number((event.target as HTMLInputElement).value)
  emit('seek', seconds.value)
}
function reset() {
  seconds.value = 0
  emit('seek', 0)
}
```

轨道input的type=range，min=0、max=length、step=0.01，value绑定seconds。浏览器处理鼠标按下、移动、抬起及触摸拖动，并在值变化时发input；Vue @input调用seek，从HTMLInputElement.value转number，再赋seconds和发seek。

原生range同样处理方向键、Home/End等平台支持的键盘调节，不需要组件自己实现pointer坐标换算。input的aria-label为Timeline position，aria-valuetext使用两位小数秒数。

CSS `.track input` absolute/inset0覆盖整个轨道、width/height100%、opacity0，使可操作控件不可见，但仍接收指针和键盘焦点；可见playhead则pointer-events:none。`.track:focus-within`给轨道画外轮廓，避免透明input使焦点难以辨认。

光标由CSS固定为`cursor:ew-resize`。没有在按下事件里改成grabbing，也没有dragstart/drag/dragend、dataTransfer或pointercapture。拖动不会自动暂停：playing=true时RAF仍会推进seconds，用户input与动画继续共用同一ref。

Reset只seconds=0并emit seek(0)，不调用setPlaying(false)。因此播放中重置会从0继续前进，暂停中重置则停在0。

## RAF循环与隐藏页面

<!-- source: src/library/jitter/MotionTimeline.vue#L35-L50 -->
```ts
function tick(now: number) {
  if (!playing.value || document.hidden) {
    animation = 0
    previous = 0
    return
  }
  if (previous) seconds.value = (seconds.value + Math.min((now - previous) / 1000, 0.1)) % length.value
  previous = now
  animation = requestAnimationFrame(tick)
}
function syncAnimation() {
  cancelAnimationFrame(animation)
  animation = 0
  previous = 0
  if (playing.value && !document.hidden) animation = requestAnimationFrame(tick)
}
```

tick先检查playing和document.hidden，不满足则清句柄标记与previous后退出。首帧previous=0不累计；后续帧用时间戳差除1000得到秒差，最大只计0.1秒，防止卡顿后一口气跳过过多动画。

seconds用模length循环，因此动画到尾部自动回到0，没有ended事件。syncAnimation先cancel旧帧、重置previous，再在可见且playing时请求新帧；连续点击播放/暂停不会积累多个循环。

<!-- source: src/library/jitter/MotionTimeline.vue#L51-L66 -->
```ts
function onMotionChange() {
  if (motion?.matches) setPlaying(false)
}
watch(length, value => { seconds.value = Math.min(seconds.value, value) })
watch(() => props.autoplay, value => setPlaying(value && !motion?.matches))
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', syncAnimation)
  setPlaying(props.autoplay && !motion.matches)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(animation)
  motion?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', syncAnimation)
})
```

length缩短时watch只把seconds压到新长度，不发seek；恰好位于末尾progress=1，下一帧可能模回0。autoplay变化结合当前motion.matches设播放状态。mounted订阅偏好变化与visibilitychange，页面返回可见后sync从新时间戳继续，不把隐藏期间计入。

减少动态效果变true会暂停；用户随后明确按播放仍可setPlaying(true)。但是CSS reduced规则强制文字opacity1/transform:none、图形transform:none，所以即使时间推进，画板位移动画仍被关闭。

<!-- source: src/library/jitter/MotionTimeline.vue#L87-L87 -->
```css
@media(prefers-reduced-motion:reduce){.artboard strong{transform:none!important;opacity:1!important}.art-symbol{transform:none!important}}
```

卸载cancelAnimationFrame并移除两个监听，防止组件消失后继续刷新。没有setInterval、全局mousemove或拖拽文档监听。

## 布局与文本边界

画板默认205px高，380px以下190px；标题43px、窄屏36px。源码末尾用-webkit-line-clamp:3和max-height129px限制长标题。effect-label在380px以下隐藏，数字使用tabular-nums，避免时间变化使工具栏晃动。

## 接入示例

文件放在 `src/examples/`，seek只表示用户主动定位。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import MotionTimeline from '../library/jitter/MotionTimeline.vue'

const lastSeek = ref(0)
const playing = ref(false)
</script>
<template>
  <MotionTimeline title="让内容动起来" :duration="8" color="#b498f5"
    :autoplay="false" @seek="lastSeek = $event"
    @playback-change="playing = $event" />
  <p role="status">最近定位 {{ lastSeek.toFixed(2) }} 秒；{{ playing ? '播放' : '暂停' }}</p>
</template>
```

## 测试事实

[jitter.test.ts](../src/library/jitter/jitter.test.ts#L9) 设置range到6.5，断言seek=6.5和06:50；duration缩到2显示02:00；Reset发0并显示00:00。[减少动态效果测试](../src/library/jitter/jitter.test.ts#L22) mock matchMedia，验证默认暂停但允许明确播放并发true。

未自动覆盖逐帧角度像素、真实触摸range拖动、visibilitychange恢复、RAF抖动和卸载句柄数量。当前接口不能外部直接把播放头定位到任意秒数，只能通过内部range/reset或修改duration影响当前值。
