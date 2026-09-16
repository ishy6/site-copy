# Product Color Palette：商品颜色、照片与键盘选择同步

组件 ID：`shupatto-product-palette`。

组件将商品、容量、类别、真实配色照片和详情动作封装在一起。点击或按方向键选择颜色会更新照片及详情 payload，不是对同一张图做 CSS 染色。

## 源码和数据

- [ProductPalette.vue](../src/library/shupatto/ProductPalette.vue#L1)：选择状态与键盘处理。
- [products.ts](../src/library/shupatto/products.ts#L1)：从本地快照提取的商品/颜色数据。
- [core.test.ts](../src/library/shupatto/core.test.ts#L16)：商品变化、颜色夹取、键盘焦点和空列表测试。

默认商品为 Compact M、Compact S、Jewels of the sea；前两款各三色，最后一款两色。每个颜色有独立 image URL，而非一个通用轮廓加不同背景色。

## Props 和类型

| 参数 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `products` | `ShupattoProduct[]` | 默认 products | 全部可选商品数据 |
| `productId` | `string` | `compactbag-m` | 当前展示商品 ID，变化时重定位颜色 |
| `initialColor` | `number` | `0` | 颜色下标，从 0 开始并取整夹取 |
| `showDetails` | `boolean` | `true` | 是否显示详情命令 |

`ShupattoProduct` 由默认数据结构推导并从 SFC 导出：商品有 id、name、category、capacity，colors 每项有 id、label、image、color，均为字符串。

商品 ID 与颜色 ID 应分别唯一。`color` 是色板 CSS 颜色，`image` 是实际商品照片，这两个字段有不同职责。

## 商品和颜色状态

<!-- source: src/library/shupatto/ProductPalette.vue#L5-L12 -->
```ts
export type ShupattoProduct = typeof defaults[number]
const props = withDefaults(defineProps<{ products?: ShupattoProduct[]; productId?: string; initialColor?: number; showDetails?: boolean }>(), { products: () => defaults, productId: 'compactbag-m', initialColor: 0, showDetails: true })
const emit = defineEmits<{ change: [color: ShupattoProduct['colors'][number]]; select: [selection: { product: ShupattoProduct; color: ShupattoProduct['colors'][number] }] }>()
const product = computed(() => props.products.find(item => item.id === props.productId) ?? props.products[0])
const colorIndex = ref(0)
const color = computed(() => product.value?.colors[colorIndex.value] ?? product.value?.colors[0])
watch([product, () => props.initialColor], () => { colorIndex.value = Math.max(0, Math.min((product.value?.colors.length ?? 1) - 1, Math.trunc(props.initialColor))) }, { immediate: true })
function choose(index: number) { colorIndex.value = index; if (color.value) emit('change', color.value) }
```

productId 无匹配时回到列表第一项；列表为空则 product=undefined，直接显示 No products available.。

colorIndex 保存选择，color computed 读取完整对象，读取失败时回退该商品第一个颜色。商品对象或 initialColor 变化时，watcher 按新商品颜色数量重新夹取索引。

例如从三色 Compact M 的索引 2 切换到两色 Jewels of the sea，仍传 initialColor=2 时会收敛到索引 1，不会显示上一商品照片或读取越界。

空 colors 时 color=undefined，模板不显示图片与详情按钮，保留商品名并提示 No colors available。initialColor 应为有限数；组件没有专门处理 NaN 输入。

## 点击到图片、色板和 payload

1. 原生色板 button 的 click 调用 `choose(i)`。
2. choose 写入 colorIndex，并在有效颜色存在时发出 change(color)。
3. color 重新计算，主图 src 与 alt 读取新对象。
4. 色名、aria-pressed 和色板选中边框同步更新。
5. 详情按钮发出 `{ product, color }`，读取同一组 computed，避免商品与颜色来自不同时刻。

首次挂载和 watcher 同步不主动发 change。再次点击当前颜色会再次通知，组件没有去重条件。

没有在切色时调用 fetch、加载纹理或修改图片像素；浏览器按新的 img src 加载对应照片。

## 键盘处理与焦点移动

<!-- source: src/library/shupatto/ProductPalette.vue#L13-L20 -->
```ts
function keydown(event: KeyboardEvent, index: number) {
  const count = product.value?.colors.length ?? 0
  if (!count || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count
  choose(next)
  ;(event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
}
```

方向键处理绑定在每个色板按钮上，参数 index 是当前获得键盘事件按钮的位置。左/右循环切换，Home/End 跳首尾；其他键保留原生行为。

preventDefault 避免方向键同时滚动页面。choose 先更新选中值，随后在当前色板组内查询所有按钮并 focus 到目标项。

焦点与 aria-pressed 一起移动，键盘操作后再次按方向键会基于新按钮的索引继续。这不是只改变视觉照片却把焦点遗留在旧选项上的实现。

没有 roving tabindex，所有色板仍然参与原生 Tab 顺序；容器使用 role=group，不是 role=radio。Enter 和 Space 通过原生 button click 激活。

## DOM 和椭圆色板样式

<!-- source: src/library/shupatto/ProductPalette.vue#L35-L40 -->
```css
.shupatto-palette__swatches { display: flex; flex-wrap: wrap; gap: 7px; margin: 27px 0 11px; }
.shupatto-palette__swatches button { width: 32px; height: 29px; padding: 4px; border: 1px solid transparent; border-radius: 50%; background: none; cursor: pointer; }
.shupatto-palette__swatches button[aria-pressed=true] { border-color: #272726; }
.shupatto-palette__swatches span { display: block; width: 100%; height: 100%; border-radius: 50%; background: var(--swatch); }
.shupatto-palette__color { display: block; font-size: 11px; }
.shupatto-palette__details { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 24px; width: 100%; padding: 12px 0; border: 0; border-bottom: 1px solid #27272660; background: none; color: inherit; font: inherit; cursor: pointer; }
```

颜色传入 `--swatch`，内层 span 使用 background 读取变量；边框由 aria-pressed 属性选择器控制。32×29 的尺寸配合 50% 圆角形成椭圆。

图片在固定高度的椭圆容器中 object-fit:contain，保持完整袋子轮廓。小于等于 440px 时改为单列、图片高度220px，避免两列挤压商品文字。

这里没有 drag/dragstart、pointermove 或图像拖动。pointer 光标是按钮 CSS 静态声明，图片切换也没有过渡定时器。

## 事件与宿主职责

| 事件 | payload | 适用场景 |
| --- | --- | --- |
| `change` | 商品颜色对象 | 记录当前配色或同步其他区域 |
| `select` | `{ product, color }` | 宿主打开详情页、侧栏或下一步 |

详情入口是 button，不会自动导航。组件不假设商品 ID 对应哪个路由，也没有网络请求和 loading 反馈。

payload 包含原数据对象引用，消费者应避免直接修改，需长期保留时使用复制。产品数组深层原地变动不等于 product computed 对象引用变动，接入时优先不可变更新。

## 完整接入示例

示例放在 `src/examples/PaletteExample.vue`。宿主保存选择后展示摘要，没有虚构商品详情服务。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProductPalette, { type ShupattoProduct } from '../library/shupatto/ProductPalette.vue'
import { products } from '../library/shupatto/products'

type Selection = {
  product: ShupattoProduct
  color: ShupattoProduct['colors'][number]
}
const selected = ref<Selection | null>(null)
const productId = ref('compactbag-m')
function showDetails(value: Selection) {
  selected.value = value
}
</script>

<template>
  <select v-model="productId" aria-label="产品">
    <option v-for="item in products" :key="item.id" :value="item.id">
      {{ item.name }}
    </option>
  </select>
  <ProductPalette
    :products="products"
    :product-id="productId"
    :initial-color="0"
    @select="showDetails"
  />
  <output v-if="selected">{{ selected.product.name }} / {{ selected.color.label }}</output>
</template>
```

## 已验证与限制

单元测试覆盖照片/色名/详情 payload 一致、三色到两色切换时索引夹取、左方向键循环与焦点移动、Home、空颜色和空商品状态。

图片没有 error 占位、预加载下一色或重试按钮；慢资源下切色可能短暂等待浏览器加载。组件无定时器和全局监听，不需要卸载清理。

默认素材是代表性商品与颜色，不是原站所有产品目录。新增产品通过 products 数据注入，类型和键盘逻辑会按实际颜色数量运作。
