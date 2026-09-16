# Product Gallery：循环切图与原生放大对话框

组件 ID：`makr-product-gallery`。

图库把 MAKR 商品多角度照片抽成可以独立使用的选择器，包含缩略图、键盘切图和放大模式。主图与对话框使用同一个图片索引，切换后始终展示同一角度。

## 源码和资源

- [ProductGallery.vue](../src/library/makr/ProductGallery.vue#L1)：图库和原生 dialog。
- [gallery-data.ts](../src/library/makr/gallery-data.ts#L1)：`ProductPhoto` 与 Tri-Glide 三张默认照片。
- [core.spec.ts](../src/library/makr/core.spec.ts#L9)：循环键盘、数据替换、边界收敛和空状态测试。

Vue 提供响应式与 `nextTick`；图标来自 `lucide-vue-next`。图库不依赖轮播、缩放或模态框第三方库。

## Props 与事件

| 参数 | 类型 | 默认值 | 约束 |
| --- | --- | --- | --- |
| `title` | `string` | `Tri-Glide Belt` | 标题和图库无障碍名称 |
| `photos` | `ProductPhoto[]` | `triGlidePhotos` | 唯一 `id`、有效 `src`、描述性 `alt` |
| `initialIndex` | `number` | `0` | 首次及后续变化都取整后限制到有效范围 |
| `showThumbnails` | `boolean` | `true` | 仅影响缩略图；箭头和键盘依然工作 |

`ProductPhoto` 的完整结构为 `{ id: string; src: string; alt: string; caption?: string }`。

唯一事件是 `change(photo: ProductPhoto, index: number)`，包含两个位置参数；不是一个 `{ photo, index }` 对象。首次初始化和 props 同步不会发出此事件。

## 初始索引和循环切换

<!-- source: src/library/makr/ProductGallery.vue#L9-L19 -->
```ts
const emit = defineEmits<{ change: [photo: ProductPhoto, index: number] }>()
const index = ref(0)
const photo = computed(() => props.photos[index.value])
const dialog = ref<HTMLDialogElement>()
const zoomButton = ref<HTMLButtonElement>()
watch(() => [props.initialIndex, props.photos] as const, () => { index.value = Math.max(0, Math.min(Math.trunc(props.initialIndex) || 0, props.photos.length - 1)) }, { immediate: true })
function select(next: number) {
  if (!props.photos.length) return
  index.value = (next + props.photos.length) % props.photos.length
  emit('change', props.photos[index.value]!, index.value)
}
```

初始化遵循夹取规则，用户切图遵循循环规则，两者用途不同。初始索引 `100` 对三张照片会落到最后一张；在最后一张点击下一张则回到索引 `0`。

`select()` 的调用方只传相邻索引、首尾索引或有效缩略图索引，所以一次加 `photos.length` 足以处理向左跨界。该函数不是暴露给宿主的任意整数跳转 API。

监听器关注 `initialIndex` 和 `photos` 引用，不是深度监听；替换照片数组时会重新按初始索引定位，不能把它理解为保留当前照片 ID 的增量更新。

数组为空时 `photo` 为 `undefined`，主舞台显示空文案，放大按钮不渲染，切换按钮禁用。

## 键盘事件链

<!-- source: src/library/makr/ProductGallery.vue#L20-L27 -->
```ts
function keyboard(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') { event.preventDefault(); select(index.value + 1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); select(index.value - 1) }
  if (event.key === 'Home') { event.preventDefault(); select(0) }
  if (event.key === 'End') { event.preventDefault(); select(props.photos.length - 1) }
}
async function zoom() { await nextTick(); dialog.value?.showModal() }
function close() { dialog.value?.close(); zoomButton.value?.focus() }
```

根 `section` 监听冒泡的 `keydown`，其内部按钮或对话框按钮获得焦点后，方向键、Home、End 会进入同一处理函数。

对这些键调用 `preventDefault()`，避免浏览器同时滚动页面。`select()` 更新 `index` 后，主图、放大图、计数以及缩略图 `aria-pressed` 都从同一状态派生。

根 section 本身没有 `tabindex`，因此进入图库依赖内部原生按钮的 Tab 顺序。缩略图之间没有手动移动焦点的逻辑，切图后焦点仍停在当前操作元素。

图片不支持滑动或拖放；没有 `pointerdown`、`pointermove`、`dragstart`、拖动阈值或手势速度计算。

## 原生 dialog 打开与关闭

<!-- source: src/library/makr/ProductGallery.vue#L39-L44 -->
```vue
    <div v-if="showThumbnails && photos.length > 1" class="makr-gallery__thumbs" role="group" aria-label="Product images">
      <button v-for="(item, i) in photos" :key="item.id" type="button" :aria-label="`Show image ${i + 1}: ${item.alt}`" :aria-pressed="index === i" @click="select(i)"><img :src="item.src" :alt="item.alt" loading="lazy" /></button>
    </div>
    <dialog ref="dialog" class="makr-gallery__dialog" :aria-label="`${title} enlarged image`" @cancel.prevent="close" @click="($event.target === dialog) && close()">
      <div class="makr-gallery__viewer"><button class="makr-gallery__close" type="button" aria-label="Close enlarged image" title="Close enlarged image" @click="close"><X :size="22" /></button><img v-if="photo" :src="photo.src" :alt="photo.alt" /><div class="makr-gallery__viewer-controls"><button type="button" aria-label="Previous enlarged image" :disabled="photos.length < 2" @click="select(index - 1)"><ArrowLeft :size="20" /></button><p>{{ photo?.caption }}</p><button type="button" aria-label="Next enlarged image" :disabled="photos.length < 2" @click="select(index + 1)"><ArrowRight :size="20" /></button></div></div>
    </dialog>
```

1. 放大按钮调用 `zoom()`。
2. `await nextTick()` 等待 Vue DOM 更新完成。
3. `showModal()` 让浏览器把 dialog 放入 top layer，并提供模态焦点与背景交互限制。
4. Escape 产生原生 `cancel` 事件，`.prevent` 阻止默认关闭，统一交给 `close()`。
5. 关闭按钮和目标为 dialog 本身的点击也调用 `close()`。
6. `close()` 调用原生 `close()` 并将焦点归还放大按钮。

内部 viewer 的点击不会触发背景关闭，因为其 `event.target` 不是 dialog。这里基于事件目标判定，没有坐标命中检测。

放大只是同一图片在更大容器中展示，不是可平移缩放的图片编辑器；没有滚轮缩放、双击缩放或双指 pinch。

## 尺寸与鼠标反馈

<!-- source: src/library/makr/ProductGallery.vue#L55-L59 -->
```css
.makr-gallery__stage { position: relative; aspect-ratio: 2.1; display: grid; place-items: center; background: #f0f0ed; overflow: hidden; }
.makr-gallery__stage > img { position: absolute; width: 100%; height: 100%; object-fit: contain; }
.makr-gallery button { display: grid; place-items: center; flex: none; width: 30px; height: 30px; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; }
.makr-gallery button:disabled { opacity: .3; cursor: default; }.makr-gallery button:focus-visible { outline: 2px solid #1c1717; outline-offset: 3px; }
.makr-gallery__stage .makr-gallery__zoom { position: absolute; bottom: 10px; right: 10px; background: #fff; border-radius: 50%; }
```

舞台固定宽高比，`object-fit: contain` 保留商品完整外形。dialog 宽度限制为 `min(90vw, 900px)`，图片高度不超过 `70dvh` 或 650px。

按钮悬停显示系统指针，禁用时回到默认指针；没有动态 `grab` / `grabbing` 样式。缩略图条使用原生 `overflow: auto`，不是拖动实现的横向滚动条。

## 完整接入示例

示例放在 `src/examples/GalleryExample.vue`，展示如何接收两个事件参数。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProductGallery from '../library/makr/ProductGallery.vue'
import { triGlidePhotos, type ProductPhoto } from '../library/makr/gallery-data'

const current = ref('')
function changed(photo: ProductPhoto, index: number) {
  current.value = `${index + 1}: ${photo.alt}`
}
</script>

<template>
  <ProductGallery
    title="Tri-Glide Belt"
    :photos="triGlidePhotos"
    :initial-index="0"
    :show-thumbnails="true"
    @change="changed"
  />
  <output>{{ current }}</output>
</template>
```

## 验证范围和限制

单元测试覆盖左键循环到最后一张、Home 返回第一张、更换数组后的索引夹取、单图禁用箭头和空数组隐藏放大入口。

原生 dialog 的 top layer、真实焦点陷阱、Escape 和背景点击应在浏览器验证，不能仅凭 DOM 模拟环境声称完整验证。当前组件依赖浏览器原生 `showModal()`，没有旧浏览器 polyfill。

图片错误没有独立占位与重试逻辑；切图没有预加载下一张。无定时器或全局监听，卸载由 Vue 移除 DOM 和局部事件；组件没有异步网络操作需要取消。

图库没有打开/关闭事件，宿主只能监听图片变化，不能通过现有 props 直接控制 dialog 的 open 状态。需要外部控制放大状态时应增加明确的受控接口。

默认三张照片有 caption；自定义省略 caption 时主视图回退 alt，放大视图的说明段落则为空。这两个模板分支目前采用不同的文案回退规则。
