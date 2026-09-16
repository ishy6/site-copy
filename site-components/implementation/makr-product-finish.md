# Product Finish Card：材质选择与选择结果反馈

组件 ID：`makr-product-finish`。

这张商品卡的核心行为是选择材质、同步商品照片和提交当前选择。照片上的轻微放大只是 CSS 反馈，实际业务状态由材质 ID 决定。

## 源码和依赖

- [ProductFinishCard.vue](../src/library/makr/ProductFinishCard.vue#L1)：状态、事件、模板和 scoped CSS。
- [catalog.ts](../src/library/makr/catalog.ts#L1)：`MakrFinish`、默认材质和商品数据。
- [makr.spec.ts](../src/library/makr/makr.spec.ts#L7)：图片、选择结果、参数更新和缺货测试。

运行依赖为 Vue 和 `lucide-vue-next`。图片与字体通过 `/assets/makr/` 绝对站点路径引用；使用下载包时需要保留其 `public/assets` 目录结构。

## Props 契约

| 参数 | 类型 | 默认值 | 实际行为 |
| --- | --- | --- | --- |
| `title` | `string` | `Field Pouch` | 标题、图片替代文本和 `add` 结果中的商品名 |
| `subtitle` | `string` | `Made in the USA` | 色板右侧说明 |
| `price` | `number` | `88` | 同时用于价格展示和提交结果 |
| `currency` | `string` | `USD` | 传给 `Intl.NumberFormat` 的币种 |
| `finishes` | `MakrFinish[]` | `fieldPouchFinishes` | 材质列表；允许空数组 |
| `initialFinish` | `string` | `brown` | 初始 ID；后续 prop 变化也会同步 |
| `showAction` | `boolean` | `true` | 控制提交按钮是否渲染 |

`MakrFinish` 必须包含 `id`、`label`、`color`、`image`，可选 `available`。只有明确为 `false` 时才判定缺货；缺省视为可选购。每个 ID 应唯一。

组件没有对负价格、非法币种和非法 CSS 色值做运行时校验。接入层应提供合法金额、ISO 币种代码和可信资源地址。

## 状态如何派生

<!-- source: src/library/makr/ProductFinishCard.vue#L27-L34 -->
```ts
const selectedId = ref(props.initialFinish)
const added = ref(false)
const selected = computed(() => props.finishes.find((finish) => finish.id === selectedId.value) ?? props.finishes[0])
const priceLabel = computed(() => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: props.currency, maximumFractionDigits: 2,
}).format(props.price))
watch(() => props.initialFinish, (value) => { selectedId.value = value; added.value = false })
watch(() => [props.title, props.price, props.finishes], () => { added.value = false })
```

`selectedId` 保存用户意图，`selected` 负责解析为完整材质。无效 ID 会显示第一项，不会立即回写 ID；空数组会产生 `undefined`，模板据此显示不可用状态。

`added` 仅表示本次选择已通过组件事件交付。更换材质、外部更新初始材质、标题、价格或材质数组引用时会清除这个反馈，避免新规格继续显示旧确认。

这里的第二个 watcher 不是深度监听。原地修改材质对象不会保证清除 `added`；需要整体替换数组，或在宿主业务层管理自己的提交状态。

## 点击到 DOM 的更新链

<!-- source: src/library/makr/ProductFinishCard.vue#L36-L45 -->
```ts
function select(finish: MakrFinish) {
  selectedId.value = finish.id
  added.value = false
  emit('change', finish)
}
function add() {
  if (!selected.value || selected.value.available === false) return
  emit('add', { title: props.title, finish: selected.value, price: props.price })
  added.value = true
}
```

1. 色板原生按钮触发 `click`，传入本次循环的材质对象。
2. `select()` 更新 `selectedId`，清空旧确认并发出 `change`。
3. `selected` 重新计算，模板把图片 `src`、`alt` 和材质名称切到同一对象。
4. 对应色板的 `aria-pressed` 与 `selected` class 同时变化。
5. 点击操作按钮时 `add()` 再次检查空列表和库存，随后发出完整选择结果。
6. `added=true` 使加号变成勾选图标，并更新可读状态文本。

<!-- source: src/library/makr/ProductFinishCard.vue#L60-L65 -->
```vue
      <button
        v-for="finish in finishes" :key="finish.id" type="button"
        class="makr-finish__swatch" :class="{ selected: selected?.id === finish.id }"
        :aria-label="finish.label" :aria-pressed="selected?.id === finish.id"
        :title="finish.label" :style="{ '--swatch': finish.color }" @click="select(finish)"
      ><span></span></button>
```

色值通过 CSS 自定义属性 `--swatch` 传到内层圆点；组件没有用颜色名称猜测实际颜色，也没有通过滤镜给同一张照片重新着色。

## 事件与业务边界

| 事件 | payload | 触发条件 |
| --- | --- | --- |
| `change` | `MakrFinish` | 用户点击色板 |
| `add` | `{ title: string; finish: MakrFinish; price: number }` | 当前材质存在且未缺货时点击操作按钮 |

初次挂载和 props watcher 不会发出 `change`。再次点击已选中的色板仍会发出事件。

组件没有异步回调、`pending` 状态或服务端失败状态；`@add` 的异步结果不会被组件等待。需要真正加入购物车时，宿主应处理请求和错误，或使用带 `addItem` 回调的 `VariantPurchase`。

payload 中的 `finish` 是传入数据的对象引用，事件消费者应读取或复制它，不应直接修改。

## 样式与输入机制

<!-- source: src/library/makr/ProductFinishCard.vue#L80-L82 -->
```css
.makr-finish__image { position: relative; width: 100%; aspect-ratio: 2; display: grid; place-items: center; background: #f0efeb; overflow: hidden; }
.makr-finish__image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 60%; transition: transform .3s ease; }
.makr-finish__image:hover img { transform: scale(1.035); }
```

照片容器使用固定宽高比，切图不会依据原图高度改变卡片布局。悬停只把当前图片放大到 1.035 倍，没有原生 `dragstart`、`drag` 或 `drop` 监听。

鼠标样式由 CSS 的 `cursor: pointer` 和禁用按钮的 `cursor: not-allowed` 决定；没有事件处理函数动态修改 `document.body.style.cursor`。

原生按钮支持 Tab、Enter、Space。色板不是 ARIA radio 组，也没有实现方向键轮转；`aria-pressed` 表达其选择状态。`role="status"` 文本在视觉上隐藏，但可供辅助技术读取。

`prefers-reduced-motion` 关闭图片过渡；没有定时器或全局监听，因此不存在额外卸载清理。

## 完整接入示例

以下示例放在项目 `src/examples/FinishExample.vue`。所有展示资源来自现有组件包，`selection` 是宿主拥有的选择记录。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProductFinishCard from '../library/makr/ProductFinishCard.vue'
import { fieldPouchFinishes, type MakrFinish } from '../library/makr/catalog'

type Selection = { title: string; finish: MakrFinish; price: number }
const selection = ref<Selection | null>(null)
const finishes = fieldPouchFinishes.map(item => ({ ...item }))

function record(item: Selection) {
  selection.value = { ...item, finish: { ...item.finish } }
}
</script>

<template>
  <ProductFinishCard
    title="Field Pouch"
    :price="88"
    currency="USD"
    :finishes="finishes"
    initial-finish="black"
    @add="record"
  />
  <output v-if="selection">
    {{ selection.title }} / {{ selection.finish.label }} / {{ selection.price }}
  </output>
</template>
```

## 已验证与限制

单元测试覆盖黑色材质对应图片、`add` 对象结构、外部材质变化清除确认、缺货与无材质时阻止提交。

测试未覆盖货币格式异常、图片加载失败、服务端购物车状态；当前组件也没有相应资源重试或网络请求实现。

库存数据是宿主传入的静态状态，服务端仍需要在下单时重新验证库存和金额。
