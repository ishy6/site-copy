# Shop 搜索面板：查询、附件 Object URL 与本地历史

组件 ID：`shop-search-panel`。全部状态、文件校验和模板位于 [ShopSearchPanel.vue](../src/library/shop/ShopSearchPanel.vue#L1)。

该组件收集文字查询或一张图片，把原始 `File` 与规范化查询发给宿主。它不上传图片、不识别图片内容、不搜索商品，也不会把历史写入 localStorage。建议项与历史列表都属于组件的本地交互状态。

## Props 与 emits

| 参数 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `modelValue` | `string` | 空串 | 初始化 query；支持 v-model |
| `placeholder` | `string` | `What are you shopping for?` | 搜索框占位文本 |
| `suggestions` | `string[]` | 三条购物建议 | 按当前查询做 includes 过滤 |
| `allowImages` | `boolean` | `true` | 是否显示 Camera 选择文件按钮 |
| `initialHistory` | `string[]` | 空数组 | 克隆为内部历史；prop 变化时重新克隆 |

| 事件 | 精确载荷 | 时机 |
| --- | --- | --- |
| `update:modelValue` | `query: string` | 输入时的原始文本；提交时再发 trim 后文本 |
| `search` | `{ query: string; image: File \| null }` | 有文字或有图片的合法提交 |
| `update:history` | `string[]` | 有文字的提交，或点击清除历史 |

图片单独提交时 query 可以为空。`search` 的 image 是浏览器 `File` 对象，不是 base64、远端 URL 或本地预览的 blob 字符串。这个载荷适合交给宿主的 `FormData`。

## 状态及同步路径

<!-- source: src/library/shop/ShopSearchPanel.vue#L6-L16 -->
```ts
const query = ref(props.modelValue)
const history = ref([...props.initialHistory])
const historyOpen = ref(false)
const fileInput = ref<HTMLInputElement>()
const attachedFile = ref<File | null>(null)
const imageUrl = ref('')
const error = ref('')
const suggestions = computed(() => props.suggestions.filter(item => item.toLowerCase().includes(query.value.trim().toLowerCase())))
watch(() => props.modelValue, value => { query.value = value })
watch(() => props.initialHistory, value => { history.value = [...value] })
function clearImage() { if (imageUrl.value) URL.revokeObjectURL(imageUrl.value); imageUrl.value = ''; attachedFile.value = null; if (fileInput.value) fileInput.value.value = '' }
```

`historyOpen=false` 时显示过滤后的建议，true 时显示历史；切换按钮只改这个布尔值，不复制列表。建议查询会 trim 并转小写；历史列表不会按当前 query 再过滤。

`initialHistory` 使用浅 watch，父组件应替换数组触发同步，不要依赖原地 push 被该 watcher 捕获。列表元素为字符串，所以浅拷贝足够隔离组件自己的数组重排。

`query` 的 prop watcher 不 emit，避免输入回传形成循环。输入事件本身清空 error，再发最新 query；用户可以在尚未提交时保存输入状态。

## 图片选择和资源生命周期

Camera 按钮调用 `fileInput?.click()`，打开原生文件选择器。隐藏的 input 使用 `type="file" accept="image/*"`；真正的校验发生在 change 回调，因为 accept 只是文件选择器的筛选提示。

<!-- source: src/library/shop/ShopSearchPanel.vue#L17-L17 -->
```ts
function attach(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { error.value = 'Choose an image smaller than 10 MB.'; return } clearImage(); attachedFile.value = file; imageUrl.value = URL.createObjectURL(file); error.value = '' }
```

执行顺序：

1. 读取 `files?.[0]`，没有文件时直接返回，原附件保持不变。
2. MIME type 必须以 `image/` 开头，大小不能大于 `10 × 1024 × 1024` 字节。
3. 不合法时只设置错误，不先删除旧附件，因此原合法图片还可继续使用。
4. 合法时调用 clearImage，撤销旧 blob URL、清空旧 File 和原生 input value。
5. 保存新 File，调用 `URL.createObjectURL(file)` 创建本地 URL。
6. 模板 `v-if="imageUrl"` 创建附件行，img 加载这个 URL，文件名旁出现移除按钮。

大小判断是 `>`，所以恰好 10 MiB 的文件会通过；界面 “smaller than 10 MB” 是近似文案，不应据此把边界理解为严格小于十进制 10MB。

点击移除调用同一个 clearImage；input.value 置空使再次选择同一文件也能正常触发 change。组件卸载也复用清理逻辑：

<!-- source: src/library/shop/ShopSearchPanel.vue#L20-L20 -->
```ts
onUnmounted(clearImage)
```

Object URL 的释放不会让已经 emit 给父组件的 File 失效；它只取消本地预览 URL。宿主若自行再创建预览 URL，需要自行 revoke，不能等待这个组件清理另一个 URL。

当前没有拖入文件行为。源码没有 `dragover`、`drop`、`dragstart` 或 PointerEvent，因此拖文件到面板不是已实现的上传入口，也没有拖入时改变 cursor 的逻辑。

`allowImages=false` 仅隐藏 Camera 入口，不会自动删除先前已附加的图片；隐藏 file input 仍存在。需要业务彻底关闭图片搜索时，宿主应重建组件或显式扩展清理契约。

## 提交与历史去重

<!-- source: src/library/shop/ShopSearchPanel.vue#L18-L19 -->
```ts
function submit(value = query.value) { const text = value.trim(); if (!text && !attachedFile.value) { error.value = 'Enter a search or choose an image.'; return } query.value = text; error.value = ''; emit('update:modelValue', text); emit('search', { query: text, image: attachedFile.value }); if (text) { history.value = [text, ...history.value.filter(item => item !== text)].slice(0, 8); emit('update:history', [...history.value]) } historyOpen.value = true }
function clearHistory() { history.value = []; emit('update:history', []) }
```

表单 `@submit.prevent="submit()"` 阻止页面刷新；Enter 与箭头搜索按钮进入同一个函数。建议 / 历史按钮调用 `submit(item)`，因此点击一个建议会立即提交，而不仅仅填入输入框。

没有文字也没有附件时显示 `role="alert"` 错误并停止后续事件。成功收集输入时先 emit model 更新，再 emit search，然后才修改历史并 emit history，最后切换到历史视图。

历史规则是把本次非空 text 放在最前，删除所有与它严格相等的旧项，保留最多八项。大小写不同仍视为两条；传入 initialHistory 的重复项不会在挂载时全部去重。纯图片搜索不添加历史文字，但仍切到历史视图。

组件没有 pending 标志或提交禁用机制，连续点击会连续 emit。远端请求的防重复、取消和错误展示都应由宿主处理；内部 error 只表示本地输入或文件问题。

## 样式与可访问行为

搜索框是原生 `type="search"`，整个 form 的 `:focus-within` 显示紫色 outline。附件图片固定 45px 正方形并 `object-fit:cover`；这里只是小型预览，不改变原文件尺寸。

建议与历史按钮都有真实按钮语义，Tab / Enter / Space 采用原生操作。切换和提交不主动移动焦点，也没有 combobox 的上下键候选项导航。

按钮静态设置 `cursor:pointer`；hover 将建议按钮底色改为浅紫。列表限制 `max-height:217px;overflow:auto`，长标签与文件名可以换行，避免横向撑开面板。

## 完整接入示例

示例放在 `src/examples/SearchExample.vue`。这里仅保存搜索请求，展示提交的文件名；未伪造商品搜索结果。历史持久化可以在 `update:history` 回调另行实现。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ShopSearchPanel from '../library/shop/ShopSearchPanel.vue'

type SearchRequest = { query: string; image: File | null }
const query = ref('')
const history = ref<string[]>([])
const request = ref<SearchRequest | null>(null)
function search(value: SearchRequest) {
  request.value = value
}
function storeHistory(value: string[]) {
  history.value = value
}
</script>

<template>
  <ShopSearchPanel
    v-model="query"
    :initial-history="history"
    :suggestions="['Desk lamps', 'Dining chairs', 'Wool rugs']"
    :allow-images="true"
    @search="search"
    @update:history="storeHistory"
  />
  <output v-if="request">
    {{ request.query }} {{ request.image?.name }}
  </output>
</template>
```

## 已有测试与边界

[shop-core.test.ts](../src/library/shop/shop-core.test.ts#L11) 验证空查询错误、` chairs ` 被 trim 为 chairs、已有 chairs 不重复添加，以及清除历史后的空状态。

[附件用例](../src/library/shop/shop-core.test.ts#L23) mock createObjectURL / revokeObjectURL，设置原生 files，再提交，断言 search 载荷中的 File 是原对象，并在 unmount 后确认 revoke 调用。

测试并未验证 MIME 欺骗、超大图片解码、URL.createObjectURL 抛错、取消选择时的旧文件保持或多次替换时的每次释放。客户端 MIME 与大小检查不等于服务端安全校验。

没有图片加载失败的 fallback、压缩、EXIF 处理或上传进度。需要这些能力时应在宿主明确增加，而不是把本地预览当成已完成上传。
