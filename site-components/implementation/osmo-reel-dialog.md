# Osmo 视频弹层：ReelDialog

组件 ID：`osmo-reel-dialog`。源码：[ReelDialog.vue](../src/library/osmo/ReelDialog.vue#L1)。入口封面按钮打开浏览器原生模态 dialog，内部视频使用浏览器 controls。封面不是独立静态组件，而是实际视频播放流程入口。

## 对外接口

| prop | 类型 | 默认 |
| --- | --- | --- |
| `title` | `string` | `'Play the reel.'` |
| `source` | `string` | `'/assets/osmo/reel.mp4'` |
| `poster` | `string` | `'/assets/osmo/carousel.avif'` |

`open-change(open:boolean)` 在打开或原生 dialog close 时发出。没有 open/v-model prop，没有 play/pause/ended 透出事件，没有 autoplay prop。注册预览面板只配置 title；source/poster 通过代码注入。

## Vue 状态与原生 dialog 的配合

<!-- source: src/library/osmo/ReelDialog.vue#L4-L14 -->
```ts
withDefaults(defineProps<{ title?: string; source?: string; poster?: string }>(), { title: 'Play the reel.', source: '/assets/osmo/reel.mp4', poster: '/assets/osmo/carousel.avif' })
const emit = defineEmits<{ 'open-change': [open: boolean] }>()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const video = ref<HTMLVideoElement>()
const opened = ref(false)
const id = useId()
async function open() { opened.value = true; await nextTick(); dialog.value?.showModal(); emit('open-change', true) }
function close() { dialog.value?.close() }
function onClose() { video.value?.pause(); opened.value = false; emit('open-change', false); trigger.value?.focus() }
onBeforeUnmount(() => { video.value?.pause(); dialog.value?.close() })
```

`dialog` 保存 HTMLDialogElement，`trigger` 保存入口按钮，`video` 保存挂载后的视频节点。`opened` 仅用于决定 video 是否存在；模态状态本身由 showModal()/close() 管理。`useId` 连接 dialog 的 aria-labelledby 和栏内标题。

打开流程：click → open() → opened=true → await nextTick() → Vue 挂载 video → dialog.showModal() → emit(true)。等待 nextTick 确保新视频 ref 已就绪，再让浏览器进入模态。

关闭按钮只调用原生 dialog.close()。实际清理集中在 @close 的 onClose：pause 视频、opened=false 删除 video、emit(false)、入口 focus。这样关闭按钮、Escape 的浏览器默认关闭及背景点击的清理逻辑相同。

<!-- source: src/library/osmo/ReelDialog.vue#L16-L19 -->
```vue
<template>
  <div class="osmo-reel"><button ref="trigger" class="osmo-reel__trigger" type="button" @click="open"><img :src="poster" alt="Osmo reel preview" /><span class="osmo-reel__play"><Play :size="26" fill="currentColor" /></span><span class="osmo-reel__title">{{ title }}<ArrowUpRight :size="24" /></span></button>
    <dialog ref="dialog" :aria-labelledby="id" @close="onClose" @click="($event.target === dialog) && close()"><div class="osmo-reel__bar"><h2 :id="id">{{ title }}</h2><button type="button" aria-label="Close reel" @click="close"><X :size="20" /></button></div><video v-if="opened" ref="video" :src="source" :poster="poster" controls playsinline preload="metadata" /></dialog>
  </div>
```

背景关闭条件是 `event.target === dialog`；点到内部视频或标题栏后冒泡上来的 click 不会关闭。这里按事件目标判定，并不计算点击坐标，因此 dialog 内无子元素覆盖的 padding 也可能命中 dialog 并关闭。

原生 showModal 让浏览器管理模态顶层、焦点范围和背景不可交互；Escape 没有自定义 keydown，而依赖 dialog 的默认 cancel/close 机制。代码未对 cancel preventDefault，所以 Escape 可以正常关闭。关闭后的 focus 由组件额外明确归还入口。

## 视频加载策略

`video v-if=opened` 意味着首次点击前没有 video 节点，也不会通过这个节点请求视频。展开后 preload=metadata 只表达预加载元信息意愿；最终下载量由浏览器决定。controls 提供播放、进度、音量/全屏等原生功能，playsinline 请求在移动端内联播放。

组件没有调用 video.play()，所以打开弹层不会自动播放。关闭时先 pause 再移除节点；再次打开创建新 video，组件没有保存 currentTime，通常从头开始。更换 source 时由 Vue 更新原生 src，没有自定义加载状态、错误重试或清晰度切换。

## 样式与指针

<!-- source: src/library/osmo/ReelDialog.vue#L23-L34 -->
```css
.osmo-reel__trigger { position: relative; display: block; width: 100%; padding: 0; border: 0; border-radius: 4px; overflow: hidden; background: #201d1d; color: #f4f4f4; cursor: pointer; }
.osmo-reel__trigger > img { display: block; width: 100%; height: 255px; object-fit: cover; }
.osmo-reel__play { position: absolute; top: 90px; left: calc(50% - 32px); width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; background: #b1ff69; color: #201d1d; transition: transform .3s; }
.osmo-reel__trigger:hover .osmo-reel__play { transform: scale(1.12); }
.osmo-reel__title { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 22px; font: 28px/1.2 'Haffer', Arial, sans-serif; text-align: left; }
.osmo-reel dialog { width: min(900px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); box-sizing: border-box; padding: 16px; border: 0; border-radius: 5px; background: #201d1d; color: #fff; }
.osmo-reel dialog::backdrop { background: #000b; }
.osmo-reel__bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.osmo-reel__bar h2 { margin: 0; font-size: 17px; font-weight: 450; }
.osmo-reel__bar button { display: grid; place-items: center; width: 32px; height: 32px; border: 0; background: none; color: #fff; cursor: pointer; }
.osmo-reel video { display: block; width: 100%; max-height: 72dvh; }
@media(prefers-reduced-motion: reduce) { .osmo-reel__play { transition: none; } }
```

入口 play 圆形在 hover 时 scale(1.12)，0.3秒 transform 过渡；减少动态效果时移除 transition。它不是鼠标移动跟随动画。

dialog 宽 min(900px,100vw−24px)，最大高100dvh−24px，video最大高72dvh；backdrop 由原生伪元素半透明黑色覆盖。入口及关闭按钮 cursor:pointer，没有 drag/PointerEvent 识别，视频进度拖动由原生 controls 实现，组件不能声称自己处理了 drag 事件或修改原生视频滑块光标。

## 接入示例

示例放在 `src/examples/`，只订阅模态开关。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ReelDialog from '../library/osmo/ReelDialog.vue'

const opened = ref(false)
</script>
<template>
  <ReelDialog title="播放作品集" source="/assets/osmo/reel.mp4"
    poster="/assets/osmo/carousel.avif" @open-change="opened = $event" />
  <p role="status">{{ opened ? '视频窗口已打开' : '视频窗口已关闭' }}</p>
</template>
```

## 生命周期与验证边界

组件卸载时也 pause 视频并 close dialog。此组件没有定时器或手工全局事件监听；原生媒体和 dialog 事件由 Vue 绑定。调用 showModal 的存在性没有 feature detection，只用 optional chaining 检查 ref，因此需要支持 HTMLDialogElement.showModal 的现代浏览器。

Osmo 当前 [core.test.ts](../src/library/osmo/core.test.ts#L1) 未挂载 ReelDialog，不能宣称它具有独立 dialog 单元测试。原生模态焦点、Escape、背景点击、关闭暂停必须在真实浏览器验证；DOM 模拟环境不能可靠代表 showModal 的顶层行为。没有媒体加载失败 UI，应在业务需要时增加明确错误状态。
