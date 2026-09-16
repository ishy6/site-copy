# Jitter 视频作品卡：MotionTile

组件 ID：`jitter-motion-tile`。源码：[MotionTile.vue](../src/library/jitter/MotionTile.vue#L1)。这个组件围绕实际video提供进入视口播放、暂停、减少动态效果、加载占位、错误重试和独立作品选择，不能把它理解成单张封面图。

## 完整接口

| prop | 类型 | 默认 |
| --- | --- | --- |
| `source` | string | `/assets/jitter/template-5.mp4` |
| `poster` | string | `/assets/jitter/template-5-poster.jpg` |
| `title` | string | `Stretched Type Repeater` |
| `author` | string | `Jitter` |
| `autoplay` | boolean | true |
| `loop` | boolean | true |

`select()`无参数，从卡片底部作品标题按钮发出。`playback-change(playing:boolean)`由video真实play/pause事件及error处理发出；作品选择不会自动播放或暂停。

## 播放意愿与实际播放分开

<!-- source: src/library/jitter/MotionTile.vue#L20-L47 -->
```ts
const emit = defineEmits<{ select: []; 'playback-change': [playing: boolean] }>()
const root = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const playing = ref(false)
const requested = ref(props.autoplay)
const failed = ref(false)
const ready = ref(false)
let visible = true
let observer: IntersectionObserver | undefined
let motion: MediaQueryList | undefined

function syncPlayback() {
  if (!video.value) return
  if (requested.value && visible && !document.hidden) {
    void video.value.play()?.catch(() => { playing.value = false })
  } else video.value.pause()
}
function toggle() {
  requested.value = !playing.value
  syncPlayback()
}
function onPlayback(value: boolean) {
  playing.value = value
  emit('playback-change', value)
}
function onMotionChange() {
  if (motion?.matches) requested.value = false
  syncPlayback()
```

| 状态 | 语义 |
| --- | --- |
| `requested` | 希望播放，初始化自autoplay；退出视口不清除它 |
| `playing` | 当前已收到的原生播放状态，驱动控制按钮图标 |
| `visible` | 普通变量，由IntersectionObserver更新，默认true |
| `ready` | 收到loadeddata，决定video可见 |
| `failed` | 收到error，改显示重试按钮并移除video |
| `root/video` | 用于视口观察和调用play/pause的DOM引用 |

syncPlayback只有requested、visible、document可见三者都满足才play，否则pause。调用play返回Promise，自动播放被浏览器拒绝时catch将playing=false；这条catch不发playback-change，也不设failed，所以“播放被拒绝”与“媒体资源错误”有不同UI。

toggle使用`!playing`设置requested后立即sync；它不是简单对requested取反。onPlayback才负责实际playing与事件同步。onMotionChange在减少动态效果变true时清requested；变回false不会自动恢复之前的意愿。

## 进入视口、页面隐藏和卸载

<!-- source: src/library/jitter/MotionTile.vue#L56-L80 -->
```ts
watch(() => props.autoplay, value => {
  requested.value = value && !motion?.matches
  syncPlayback()
})
watch(() => props.source, reload)
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (motion.matches) requested.value = false
  motion.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', syncPlayback)
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      visible = Boolean(entries[0]?.isIntersecting)
      syncPlayback()
    }, { threshold: 0.1 })
    if (root.value) observer.observe(root.value)
  }
  syncPlayback()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  motion?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', syncPlayback)
  video.value?.pause()
})
```

autoplay prop改变时结合当前motion.matches更新requested，随后同步媒体。mounted先读取减少动态效果，再绑定偏好变化与document.visibilitychange。

IntersectionObserver的threshold是0.1，回调使用entries[0].isIntersecting更新visible，不自己比较intersectionRatio。由于visible初值true且mounted尾部立即sync，在首次观察结果返回前可能有一次播放尝试。不能把此实现描述成“绝不在首次观察前请求播放”。不支持IntersectionObserver时保留visible=true。

页面隐藏时sync会pause，但requested保留；重新可见且元素被观察为可见时继续play。组件没有把video的网络加载也完全推迟到视口内，节点一开始就在DOM并设置preload=metadata。

卸载依次disconnect观察器、移除媒体查询监听、移除visibilitychange、pause视频。watch由Vue组件作用域清理，不需要手工stop。

## 加载、失败与重试

<!-- source: src/library/jitter/MotionTile.vue#L49-L54 -->
```ts
async function reload() {
  failed.value = false
  ready.value = false
  await nextTick()
  video.value?.load()
}
```

reload清failed和ready，await nextTick等待v-if重新创建video，再调用load。source prop变化也调用reload，所以换视频时重新进入未就绪状态。没有AbortController、重试次数或指数退避；重试是用户主动点击。

<!-- source: src/library/jitter/MotionTile.vue#L84-L94 -->
```vue
  <article ref="root" class="motion-tile">
    <div class="motion-media">
      <div v-if="!ready || failed" class="motion-poster" aria-hidden="true"><span>THE TRACK</span><strong>Make it<br>move.</strong><span>DESIGN IN MOTION / 001</span></div>
      <video v-if="!failed" ref="video" :src="source" :poster="poster" :aria-label="title" :loop="loop" :class="{ ready }" muted playsinline preload="metadata" @loadeddata="ready = true; syncPlayback()" @play="onPlayback(true)" @pause="onPlayback(false)" @ended="requested = false" @error="failed = true; onPlayback(false)" />
      <span class="media-label">MOTION / TEMPLATE</span>
      <button v-if="failed" class="transport" type="button" aria-label="Retry video" title="Retry video" @click="reload"><RotateCcw :size="17" /></button>
      <button v-else class="transport" type="button" :aria-label="playing ? 'Pause video' : 'Play video'" :title="playing ? 'Pause video' : 'Play video'" @click="toggle"><Pause v-if="playing" :size="17" fill="currentColor" /><Play v-else :size="17" fill="currentColor" /></button>
    </div>
    <button type="button" class="tile-caption" :aria-label="`Select ${title}`" @click="emit('select')">
      <span class="avatar">{{ author.charAt(0).toUpperCase() }}</span><span class="tile-copy"><strong>{{ title }}</strong><small>{{ author }}</small></span><ArrowUpRight :size="21" />
    </button>
```

初始ready=false时显示文字设计占位，video虽然已有poster但opacity为0。loadeddata把ready=true并syncPlayback，`.ready`类令视频opacity=1。错误路径设failed=true、调用onPlayback(false)，下一次Vue更新卸载video并展示Retry。

video固定muted、playsinline、preload=metadata，loop由prop控制；没有原生controls，播放/暂停由独立transport按钮控制。ended只设置requested=false，playing主要由原生媒体事件维护。没有时间轴、音量、全屏或字幕UI。

底部tile-caption是单独button，点击只发select。没有把整个article绑定click，因此用户点暂停不会误触选择。author首字符大写生成文字头像，空author会得到空头像字符。

## CSS与操作手段

媒体容器固定aspect-ratio1.43，video绝对定位铺满、object-fit:cover；卡片最大410px宽。transport在右下角，hover仅scale1.08；标题箭头hover向右上平移2px。减少动态效果关闭这些CSS transition。

transport与caption固定cursor:pointer，focus-visible给3px紫色轮廓。它没有drag/drop、pointerdown/move/up或手势切换。视频播放按原生按钮键盘语义触发，不能拖封面调整进度。

## 接入示例

文件放在 `src/examples/`。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import MotionTile from '../library/jitter/MotionTile.vue'

const playing = ref(false)
const selected = ref(false)
</script>
<template>
  <MotionTile title="文字动效" author="Studio" :autoplay="false"
    source="/assets/jitter/template-5.mp4"
    poster="/assets/jitter/template-5-poster.jpg"
    @playback-change="playing = $event" @select="selected = true" />
  <p role="status">{{ playing ? '播放中' : '已暂停' }}；{{ selected ? '已选择' : '未选择' }}</p>
</template>
```

## 已有测试与适用范围

[jitter.test.ts](../src/library/jitter/jitter.test.ts#L32) 验证选择与媒体控制独立、video error后节点移除和Retry出现、点击重试重建video。单测没有验证浏览器真实解码、自动播放许可、IntersectionObserver比例、页面隐藏恢复或play Promise拒绝。

此组件适合单个短视频模板预览；不是完整视频播放器。外部source必须由宿主提供可访问且支持的媒体格式，错误UI只处理原生error，不显示具体HTTP状态。
