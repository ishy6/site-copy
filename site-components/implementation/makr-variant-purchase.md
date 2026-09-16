# Variant Purchase：规格、数量与异步添加

组件 ID：`makr-variant-purchase`。

组件以规格对象作为价格与尺寸的唯一来源，支持库存限制、数量夹取、提交中禁用、失败重试和成功反馈。商品图是上下文，真正的交互是选择规格并交付确定的购买快照。

## 源码与数据

- [VariantPurchase.vue](../src/library/makr/VariantPurchase.vue#L1)：选择器、异步提交和 DOM。
- [purchase-data.ts](../src/library/makr/purchase-data.ts#L1)：规格与提交结果类型。
- [core.spec.ts](../src/library/makr/core.spec.ts#L24)：必选校验、数量上限、金额、缺货与重试测试。

`PurchaseVariant` 为 `{ id, label, dimensions, price, available }`，其中前三项是字符串、价格是数值、库存为布尔值。

`PurchaseSelection` 为 `{ variant: PurchaseVariant; quantity: number; total: number }`。

## Props 完整契约

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `Tri-Glide Belt` | 标题 |
| `finish` | `string` | `Army Green` | 当前商品颜色或材质描述 |
| `image` | `string` | `/assets/makr/tri-glide-front.webp` | 商品缩略图 |
| `variants` | `PurchaseVariant[]` | `beltVariants` | 三个默认尺寸；可为空 |
| `initialVariant` | `string` | 空字符串 | 留空时必须手动选择规格 |
| `maxQuantity` | `number` | `10` | 数量上限，内部向下取整且至少为 1 |
| `disabled` | `boolean` | `false` | 禁用规格、数量和提交 |
| `addItem` | `(selection) => Promise<void>` | 未设置 | 可等待的实际添加服务 |

`initialVariant` 变化会重设 ID；不存在的 ID 不会自动选第一项，因此仍然要求用户选择。默认规格 ID 为 `4554`、`4555`、`4556`。

价格固定按照 USD 格式化且显示零位小数。组件不提供 `currency` prop，接入其他币种需要先扩展金额契约。

## 派生状态与数量归一化

<!-- source: src/library/makr/VariantPurchase.vue#L16-L24 -->
```ts
const max = computed(() => Math.max(1, Math.floor(props.maxQuantity) || 1))
const selected = computed(() => props.variants.find(variant => variant.id === selectedId.value))
const selection = computed<PurchaseSelection | null>(() => selected.value ? { variant: selected.value, quantity: quantity.value, total: selected.value.price * quantity.value } : null)
const price = computed(() => selected.value?.price ?? Math.min(...props.variants.map(variant => variant.price)))
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
watch(() => props.initialVariant, value => { selectedId.value = value })
watch(max, value => { quantity.value = Math.min(quantity.value, value) })
watch(selection, value => { complete.value = false; error.value = ''; emit('change', value) })
function changeQuantity(event: Event) { quantity.value = Math.min(max.value, Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value)) || 1)); (event.target as HTMLInputElement).value = String(quantity.value) }
```

`selectedId`、`quantity` 是输入状态；`selected`、`selection`、`price` 是 derived state。未选规格时价格显示列表最低价；空列表会得到 `Infinity`，模板用 `Number.isFinite()` 转为 `Unavailable`。

数量输入监听原生 `change`，不是每次按键的 `input`。用户输入 `500`、上限为 2 时，提交输入后状态和原生 input 的可见值都回写为 `2`。

空值、非数值和 0 经 `|| 1` 回到 1，负值限制为 1，小数向下取整。加减按钮直接修改 `quantity`，由 disabled 条件保证不能超出边界。

金额公式是 `variant.price * quantity`。它没有采用整数分币运算；默认整数美元数据不会产生分币累积问题，接入小数金额时应让服务端重新计价。

当 `selection` 变化时会清除成功和错误，并发出 `change`。这个 watcher 没有 `immediate`，宿主不能依赖挂载时收到初始选择。

## 原生选择事件如何更新界面

1. `<select v-model="selectedId">` 使用原生 change 写入规格 ID。
2. `selected` 解析完整规格，尺寸行同步显示 `dimensions`。
3. `selection` 生成当前数量与总额，按钮金额随之更新。
4. 选择缺货规格时，选择框仍显示该规格，但提交按钮禁用并展示 `Out of stock`。
5. `disabled` 或 `pending` 时输入与全部修改按钮一起禁用。

提交时无有效规格会聚焦 `selectInput`，使键盘用户能够立即补充缺失选项。

## 提交事件与可等待回调

<!-- source: src/library/makr/VariantPurchase.vue#L25-L34 -->
```ts
async function add() {
  if (pending.value || props.disabled) return
  if (!selection.value) { error.value = 'Choose a size.'; selectInput.value?.focus(); return }
  if (!selection.value.variant.available) return
  const value = { ...selection.value, variant: { ...selection.value.variant } }
  pending.value = true; error.value = ''; emit('add', value)
  try { await props.addItem?.(value); complete.value = true; emit('success', value) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to add this item. Please try again.' }
  finally { pending.value = false }
}
```

`pending` 在 emit 之前置为 true，因此即使同一时刻重复触发函数也只会启动一次添加。选择对象及其规格对象都先浅复制，用户后续修改数量不会改变这次请求的数据。

| 输出 | 参数 | 时机 |
| --- | --- | --- |
| `change` 事件 | `PurchaseSelection \| null` | 规格或数量使选择结果变化 |
| `add` 事件 | `PurchaseSelection` | 前置校验通过、请求开始前 |
| `success` 事件 | `PurchaseSelection` | 可选回调 resolve 后 |
| `addItem` 回调 prop | `PurchaseSelection` | `add` 通知之后执行，并等待 Promise |

`@add` 是通知，返回 Promise 不会被组件等待；异步服务应放在 `:add-item`。不要把同一个请求函数同时接到两处，否则宿主自己会执行两次请求。

未提供 `addItem` 时，可选调用立即完成，组件显示 `Added to selection` 并发 `success`，含义只是选择已交付，没有创建远程购物车。

异常为 Error 时显示其 `message`，其他值使用默认错误文案。错误不会清空规格和数量，`finally` 解除禁用后可直接重试。组件没有独立 failure 事件。

## DOM、焦点与样式反馈

错误文本使用 `role="alert"`，其他反馈使用 `role="status"`。`useId()` 为每个实例生成独立标题 ID，避免多组件同页时 `aria-labelledby` 冲突。

等待期间使用 `LoaderCircle` 和旋转 keyframes；`prefers-reduced-motion` 下停止旋转，但 `Adding` 文本仍明确表达等待状态。

数量按钮是原生 button，规格为原生 select，数字为原生 input。这里没有拖拽、手写滚轮逻辑、指针捕获或动态改写鼠标样式。

按钮 CSS 默认 `cursor: pointer`，`:disabled` 变为 `cursor: default`，并降低透明度。输入与按钮使用 `:focus-visible` 显示轮廓。

## 完整异步接入示例

示例放在 `src/examples/PurchaseExample.vue`。请求地址是宿主需要实现的服务契约，组件本身不会提供该接口。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import VariantPurchase from '../library/makr/VariantPurchase.vue'
import { beltVariants, type PurchaseSelection } from '../library/makr/purchase-data'

const selected = ref<PurchaseSelection | null>(null)
const confirmedQuantity = ref(0)

async function addItem(selection: PurchaseSelection): Promise<void> {
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variantId: selection.variant.id,
      quantity: selection.quantity,
    }),
  })
  if (!response.ok) throw new Error('添加失败，请稍后重试。')
}
</script>

<template>
  <VariantPurchase
    :variants="beltVariants"
    :max-quantity="5"
    :add-item="addItem"
    @change="selected = $event"
    @success="confirmedQuantity = $event.quantity"
  />
  <output v-if="selected">当前选择：{{ selected.quantity }}</output>
  <output>最近成功添加：{{ confirmedQuantity }}</output>
</template>
```

请求只上传 ID 与数量，服务端应查询库存并重新计算金额，不能信任客户端传入的总价。

## 验证和现有限制

测试覆盖未选规格阻止添加、尺寸同步、数量上限回写、总额变化、缺货禁用、异步失败后保留输入与成功重试。

组件没有 AbortController、超时或卸载取消机制；正在执行的宿主 Promise 会继续运行。父层若在请求中移除组件，仍需自行定义请求取消或结果归属策略。

`variants` 对象原地深层修改不保证触发 `selection` watcher 清除旧反馈；应以新数组/新对象更新业务数据。传入 `Infinity` 等非法数值也没有完整运行时约束。
